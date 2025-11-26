import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import { readdir, unlink } from 'fs/promises'; // unlink = löschen
import { createReadStream, existsSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

const UPLOAD_DIR = path.resolve('static/uploads');
const OUTPUT_DIR = path.resolve('static/videos');

// --- YouTube Setup (bleibt gleich) ---
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
  // ... (Identisch wie vorher, nur der Code bleibt übersichtlicher)
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
        privacyStatus: 'unlisted' // Video ist nicht öffentlich
      }
    },
    media: {
      body: createReadStream(filePath)
    }
  });
  return res.data;
}

// --- FFmpeg Logik (Optimiert) ---
async function createTimelapse(date: string): Promise<string> {
  const outputFilename = `timelapse_${date}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  // Ordner erstellen falls nicht da
  if (!existsSync(OUTPUT_DIR)) {
    const { mkdir } = await import('fs/promises');
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // ✅ TRICK: Wir bauen das Pattern dynamisch mit dem Datum!
  // Statt "*.jpg" suchen wir jetzt explizit nach "cam_2025-11-21_*.jpg"
  const globPattern = path.join(UPLOAD_DIR, `cam_${date}_*.jpg`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(globPattern) // Hier greift der Datums-Filter
      .inputOptions([
        '-pattern_type glob',
        '-framerate 1' // 1 Bild pro Sekunde
      ])
      .size('1080x1920')
      .videoCodec('libx264')
      .outputOptions(['-pix_fmt yuv420p', '-preset fast', '-crf 23']) // -t entfernt, damit er alle Bilder nimmt
      .on('start', (cmd) => console.log('🎬 FFmpeg CMD:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

// --- Hilfsfunktion: Aufräumen ---
async function deleteImages(date: string) {
  console.log('🧹 Räume alte Bilder auf...');
  const files = await readdir(UPLOAD_DIR);
  
  // Nur Bilder von HEUTE löschen
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

    const date = new Date().toISOString().split('T')[0]; // Format: 2025-11-21
    
    // Prüfen, ob Bilder für HEUTE da sind
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

    // 3. Aufräumen (Nur wenn Upload erfolgreich war!)
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