import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import { createReadStream, existsSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { google } from 'googleapis';
import { env } from '$env/dynamic/private';
import { writeFile, readdir, unlink } from 'fs/promises';


const UPLOAD_DIR = path.resolve('static/uploads');
const OUTPUT_DIR = path.resolve('static/videos');

// --- YouTube Setup ---
const oauth2Client = new google.auth.OAuth2(
  env.YOUTUBE_CLIENT_ID,
  env.YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000'
);

oauth2Client.setCredentials({
  refresh_token: env.YOUTUBE_REFRESH_TOKEN
});

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

// --- Hilfsfunktion: Video Upload ---
async function uploadToYouTube(filePath: string, date: string) {
  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: `Pflanzen-Zeitraffer: ${date}`,
        description: `Automatischer Zeitraffer.\nDatum: ${date}`,
        tags: ['iot', 'timelapse'],
        categoryId: '28'
      },
      status: {
        privacyStatus: 'unlisted'
      }
    },
    media: {
      body: createReadStream(filePath)
    }
  });
  return res.data;
}

// --- FFmpeg Logik ---
async function createTimelapse(date: string): Promise<string> {
  const outputFilename = `timelapse_${date}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);
  const listFilePath = path.join(UPLOAD_DIR, `files_${date}.txt`);

  // 1. Alle Dateien lesen und filtern
  const files = await readdir(UPLOAD_DIR);
  const imageFiles = files
    .filter(f => f.startsWith(`cam_${date}_`) && f.endsWith('.jpg'))
    // 2. Explizit sortieren (wichtig gegen das "Springen")
    .sort((a, b) => {
        const tsA = parseInt(a.split('_').pop()?.split('.')[0] || '0');
        const tsB = parseInt(b.split('_').pop()?.split('.')[0] || '0');
        return tsA - tsB;
    });

  if (imageFiles.length === 0) throw new Error('Keine Bilder gefunden');

  console.log(`🎬 Erstelle Zeitraffer aus ${imageFiles.length} Bildern...`);

  // 3. File-List für FFmpeg erstellen (Concat Demuxer Format)
  const fileContent = imageFiles
    .map(filename => `file '${path.join(UPLOAD_DIR, filename)}'`)
    .join('\n');

  await writeFile(listFilePath, fileContent);

  // 4. FFmpeg mit der Liste füttern
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listFilePath)
      .inputOptions(['-f concat', '-safe 0'])
      .inputOptions(['-r 5']) 
      .size('1920x1080')  // QUERFORMAT
      .videoCodec('libx264')
      .outputOptions([
        '-pix_fmt yuv420p', 
        '-preset fast', 
        '-crf 23',
        '-r 5'
      ])
      .on('end', async () => {
        await unlink(listFilePath);
        console.log('✅ Video erstellt:', outputPath);
        resolve(outputPath);
      })
      .on('error', async (err) => {
        await unlink(listFilePath).catch(() => {});
        reject(err);
      })
      .save(outputPath);
  });
}

// --- Hilfsfunktion: Aufräumen ---
async function deleteImages(date: string) {
  console.log('🧹 Räume alte Bilder auf...');
  const files = await readdir(UPLOAD_DIR);
  
  const todaysImages = files.filter(f => f.startsWith(`cam_${date}_`));
  
  for (const file of todaysImages) {
    await unlink(path.join(UPLOAD_DIR, file));
  }
  console.log(`✨ ${todaysImages.length} Bilder gelöscht.`);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();
    if (action !== 'create_timelapse') return json({ message: 'Ungültige Aktion' }, { status: 400 });

    const date = new Date().toISOString().split('T')[0];
    
    const files = await readdir(UPLOAD_DIR);
    const hasImages = files.some(f => f.startsWith(`cam_${date}_`));

    if (!hasImages) {
      return json({ message: `Keine Bilder für Datum ${date} gefunden` }, { status: 404 });
    }

    // 1. Rendern
    const videoPath = await createTimelapse(date);
    
    // 2. Upload
    let uploadResult;
    try {
       uploadResult = await uploadToYouTube(videoPath, date);
    } catch (e) {
       console.error(e);
       return json({ message: 'Upload Fehler', error: (e as Error).message }, { status: 500 });
    }

    // 3. Aufräumen
    await deleteImages(date);

    return json({
      message: 'Erfolg!',
      video: `/videos/timelapse_${date}.mp4`,
      youtube: `https://youtu.be/${uploadResult.id}`
    });

  } catch (error) {
    console.error('❌ Fehler:', error);
    return json({ message: 'Server Error' }, { status: 500 });
  }
};