import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const UPLOAD_DIR = path.resolve('static/uploads');
const OUTPUT_DIR = path.resolve('static/videos');

async function createTimelapse(date: string): Promise<string> {
  const outputFilename = `timelapse_${date}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  // Erstelle Output-Ordner falls nicht vorhanden
  if (!existsSync(OUTPUT_DIR)) {
    const { mkdir } = await import('fs/promises');
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    // Alle Bilder nach Name sortiert auflisten
    const pattern = path.join(UPLOAD_DIR, '*.jpg');
    
    ffmpeg()
      .input(pattern)
      .inputOptions([
        '-pattern_type glob',
        '-framerate 30' // 30 Bilder pro Sekunde
      ])
      // YouTube Shorts Format: Vertikal 9:16
      .size('1080x1920')
      .videoCodec('libx264')
      .outputOptions([
        '-pix_fmt yuv420p',
        '-preset fast',
        '-crf 23',
        '-t 59' // Max 59 Sekunden
      ])
      .on('start', (cmd) => {
        console.log('FFmpeg gestartet:', cmd);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Verarbeitung: ${progress.percent.toFixed(2)}%`);
        }
      })
      .on('end', () => {
        console.log('✅ Video erstellt:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg Fehler:', err);
        reject(err);
      })
      .save(outputPath);
  });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();

    if (action !== 'create_timelapse') {
      return json({ message: 'Ungültige Aktion' }, { status: 400 });
    }

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Prüfen ob Bilder vorhanden sind
    const files = await readdir(UPLOAD_DIR);
    const imageFiles = files.filter(f => 
      f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
    );

    if (imageFiles.length === 0) {
      return json({ 
        message: 'Keine Bilder gefunden',
        imageCount: 0,
        hint: 'Führe zuerst generate_test_images.ts aus'
      }, { status: 400 });
    }

    console.log(`📸 Erstelle Zeitraffer aus ${imageFiles.length} Bildern...`);

    // 2. Video erstellen
    const videoPath = await createTimelapse(date);
    const videoFilename = path.basename(videoPath);

    return json({
      message: 'Zeitraffer erfolgreich erstellt',
      videoPath: `/videos/${videoFilename}`,
      localPath: videoPath,
      imageCount: imageFiles.length,
      note: 'YouTube Upload ist deaktiviert (Test-Modus)'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Zeitraffer-Fehler:', error);
    return json({
      message: 'Fehler beim Erstellen des Zeitraffers',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};