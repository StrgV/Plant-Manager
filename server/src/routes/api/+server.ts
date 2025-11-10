import { json } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import path from 'path';
import { type RequestHandler } from '@sveltejs/kit';

// ACHTUNG: Der Upload-Ordner muss existieren
const UPLOAD_DIR = path.resolve('static/uploads');
export const POST: RequestHandler = async ({ request }) => {
  try {
    // 1. Lesen der Formulardaten (multipart/form-data)
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return json({ message: 'Keine Datei gefunden' }, { status: 400 });
    }

    // 2. Erstellen eines eindeutigen Dateinamens
    const ext = path.extname(file.name);
    const uniqueFilename = `${Date.now}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // 3. Datei speichern
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return json(
      {
        message: 'Bild erfolgreich gespeichert',
        path: `/uploads/${uniqueFilename}`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload-Fehler:', error);
    return json({ message: 'Interner Serverfehler beim Speichern der Datei' }, { status: 500 });
  }
};
