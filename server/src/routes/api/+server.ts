import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { type RequestHandler } from '@sveltejs/kit';
import { existsSync } from 'fs';
import { env } from '$env/dynamic/private';

export const config = {
    bodySizeLimit: Infinity
};

// ACHTUNG: Der Upload-Ordner muss existieren
const UPLOAD_DIR = path.resolve('static/uploads');

// Hilfsfunktion: Zeitstempel für Dateinamen (z.B. 2025-11-21_23-55-01)
function getTimestamp() {
  const now = new Date();
  return now
    .toISOString()
    .replace(/T/, '_') // T durch _ ersetzen
    .replace(/\..+/, '') // Millisekunden entfernen
    .replace(/:/g, '-'); // Doppelpunkte durch Bindestriche (Windows-kompatibel)
}

// Stelle sicher, dass der Upload-Ordner existiert
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Stelle sicher, dass der Upload-Ordner existiert
    await ensureUploadDir();

    // 1. Lesen der Formulardaten (multipart/form-data)
    const formData = await request.formData();
    const file = formData.get('image');
    const uuid = formData.get('uuid');

    if (uuid == null || uuid !== env.UUID) {
      return json({ message: 'Falsche UUID' }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return json({ message: 'Keine Datei gefunden' }, { status: 400 });
    }

    // // Validierung: Nur Bilder erlauben
    // if (!file.type.startsWith('image/')) {
    //   return json({ message: 'Nur Bilddateien erlaubt' }, { status: 400 });
    // }

    // 2. Erstellen eines eindeutigen Dateinamens
    const timestamp = getTimestamp();
    const filename = `cam_${timestamp}.jpg`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // 3. Datei speichern
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    console.log(`Bild gespeichert: ${filename}`);

    return json(
      {
        message: 'Bild erfolgreich gespeichert',
        filename: filename,
        path: `/uploads/${filename}`,
        size: buffer.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload-Fehler:', error);
    return json(
      {
        message: 'Interner Serverfehler beim Speichern der Datei',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
};

