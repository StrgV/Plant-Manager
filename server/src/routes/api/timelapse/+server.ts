import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import { readdir } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { google } from 'googleapis'; // Neu dazu
import { env } from '$env/dynamic/private'; // SvelteKit Weg für Env-Vars

const UPLOAD_DIR = path.resolve('static/uploads');
const OUTPUT_DIR = path.resolve('static/videos');

// --- YouTube Setup ---
const oauth2Client = new google.auth.OAuth2(
  env.YOUTUBE_CLIENT_ID,
  env.YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000'
);

// Token setzen (damit loggt sich das Skript automatisch ein)
oauth2Client.setCredentials({
  refresh_token: env.YOUTUBE_REFRESH_TOKEN
});

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

// --- Hilfsfunktion: Video Upload ---
async function uploadToYouTube(filePath: string, date: string) {
  console.log('🚀 Starte Upload zu YouTube...');
  
  const fileSize = (await import('fs/promises')).stat(filePath).then(s => s.size);
  
  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: `Pflanzen-Zeitraffer: ${date}`,
        description: `Automatischer Zeitraffer vom IoT Monitor.\nDatum: ${date}\nGeneriert mit FFmpeg.`,
        tags: ['iot', 'timelapse', 'plants'],
        categoryId: '28' // 28 = Science & Technology
      },
      status: {
        privacyStatus: 'unlisted' // 'private', 'unlisted' oder 'public'
      }
    },
    media: {
      body: createReadStream(filePath)
    }
  });

  console.log(`✅ Upload fertig! Video ID: ${res.data.id}`);
  return res.data;
}

// --- Bestehende FFmpeg Logik ---
async function createTimelapse(date: string): Promise<string> {
  const outputFilename = `timelapse_${date}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  if (!existsSync(OUTPUT_DIR)) {
    const { mkdir } = await import('fs/promises');
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    // Sucht nach .jpg, .jpeg, .png
    const pattern = path.join(UPLOAD_DIR, '*.jpg'); 
    
    ffmpeg()
      .input(pattern)
      .inputOptions(['-pattern_type glob', '-framerate 1']) // 5 FPS
      .size('1080x1920') // Shorts Format
      .videoCodec('libx264')
      .outputOptions(['-pix_fmt yuv420p', '-preset fast', '-crf 23', '-t 59'])
      .on('start', (cmd) => console.log('FFmpeg CMD:', cmd))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

// --- Der Haupt-Handler ---
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();

    if (action !== 'create_timelapse') {
      return json({ message: 'Ungültige Aktion' }, { status: 400 });
    }

    const date = new Date().toISOString().split('T')[0];
    const files = await readdir(UPLOAD_DIR);
    const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png)$/i));

    if (imageFiles.length === 0) {
      return json({ message: 'Keine Bilder gefunden' }, { status: 400 });
    }

    // 1. Video rendern
    console.log(`📸 Erstelle Video aus ${imageFiles.length} Bildern...`);
    const videoPath = await createTimelapse(date);
    
    // 2. Video hochladen (NEU!)
    let uploadResult;
    try {
        uploadResult = await uploadToYouTube(videoPath, date);
    } catch (uploadError) {
        console.error('Upload fehlgeschlagen:', uploadError);
        // Wir werfen keinen Fehler, damit das erstellte Video nicht "verloren" gilt
        return json({ 
            message: 'Video erstellt, aber Upload fehlgeschlagen', 
            localPath: videoPath,
            error: uploadError 
        }, { status: 500 });
    }

    return json({
      message: 'Zeitraffer erfolgreich erstellt und hochgeladen',
      videoPath: `/videos/${path.basename(videoPath)}`,
      youtubeId: uploadResult.id,
      youtubeUrl: `https://youtu.be/${uploadResult.id}`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Gesamtfehler:', error);
    return json({ message: 'Server Fehler', error: (error as Error).message }, { status: 500 });
  }
};