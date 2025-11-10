import { json } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid'; // Zum Generieren eindeutiger Dateinamen
import path from 'path';

// ACHTUNG: Der Upload-Ordner muss existieren
const UPLOAD_DIR = path.resolve('static/uploads');
export async function POST({ request }) {
  try {
    // 1. Lesen der Formulardaten (multipart/form-data)
    const formData = await request.formData();
    const file = formData.get('image'); // 'image' ist der Feldname in der Client-Anfrage

    if (!file || !(file instanceof File)) {
      return json({ message: 'Keine Datei gefunden' }, { status: 400 });
    }

    // 2. Erstellen eines eindeutigen Dateinamens
    const ext = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${ext}`;
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
}
