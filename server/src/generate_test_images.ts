// generate_test_images.ts
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve('static/uploads');

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function generateTestImages(count: number = 30) {
  await ensureUploadDir();
  
  // WICHTIG: Wir brauchen das Datum von heute für das Namensschema
  const today = new Date().toISOString().split('T')[0]; // 2023-XX-XX
  
  console.log(`Generiere ${count} Test-Bilder für Datum: ${today}...`);
  
  const colors = [
    { r: 255, g: 107, b: 107 }, { r: 78, g: 205, b: 196 },
    { r: 69, g: 183, b: 209 }, { r: 150, g: 206, b: 180 },
    { r: 255, g: 234, b: 167 }, { r: 223, g: 230, b: 233 },
    { r: 116, g: 185, b: 255 }, { r: 162, g: 155, b: 254 },
    { r: 253, g: 121, b: 168 }, { r: 253, g: 203, b: 110 }
  ];
  
  for (let i = 0; i < count; i++) {
    // Timestamp leicht versetzt, damit die Sortierung eindeutig ist
    const timeOffset = (count - i) * 2 * 60 * 1000; 
    
    const timestamp = Date.now() - timeOffset;
    
    // Wir nutzen den Zeitstempel für die Berechnung, aber stellen sicher, 
    // dass der Dateiname das korrekte Datum für den Server-Filter hat.
    const today = new Date().toISOString().split('T')[0];
    
    // WICHTIG: Dateiname muss mit dem Datum beginnen, nach dem der Server sucht!
    const filename = `cam_${today}_${timestamp}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Wir malen die Nummer ins Bild, damit man im Video sofort sieht, ob eins fehlt!
    const svgOverlay = `
    <svg width="1080" height="1920">
      <text x="50%" y="50%" font-size="200" fill="black" text-anchor="middle">${i + 1}</text>
    </svg>`;

    await sharp({
      create: {
        width: 1080,
        height: 1920,
        channels: 3,
        background: color
      }
    })
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }]) // Nummer einbrennen
    .jpeg({ quality: 90 })
    .toFile(filepath);
    
    if ((i + 1) % 10 === 0) console.log(`${i + 1}/${count} Bilder erstellt`);
  }
  
  console.log('✅ Bilder fertig. Teste jetzt den Server-Endpunkt.');
}

const count = process.argv[2] ? parseInt(process.argv[2]) : 30;
generateTestImages(count).catch(console.error);