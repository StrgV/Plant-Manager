import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { type RequestHandler } from '@sveltejs/kit';
import { existsSync } from 'fs';

// ACHTUNG: Der Upload-Ordner muss existieren
const UPLOAD_DIR = path.resolve('static/uploads');

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

    if (!file || !(file instanceof File)) {
      return json({ message: 'Keine Datei gefunden' }, { status: 400 });
    }

    // Validierung: Nur Bilder erlauben
    if (!file.type.startsWith('image/')) {
      return json({ message: 'Nur Bilddateien erlaubt' }, { status: 400 });
    }

    // 2. Erstellen eines eindeutigen Dateinamens
    const ext = path.extname(file.name);
    const uniqueFilename = `${Date.now()}${ext}`; // ✅ FIXED: Date.now() mit Klammern!
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // 3. Datei speichern
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    console.log(`✅ Bild gespeichert: ${uniqueFilename}`);

    return json(
      {
        message: 'Bild erfolgreich gespeichert',
        filename: uniqueFilename,
        path: `/uploads/${uniqueFilename}`,
        size: buffer.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload-Fehler:', error);
    return json({ 
      message: 'Interner Serverfehler beim Speichern der Datei',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};