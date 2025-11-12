import { writeFile, mkdir } from 'fs/promises';
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
  
  console.log(`Generiere ${count} Test-Bilder...`);
  
  const colors = [
    { r: 255, g: 107, b: 107 }, // Rot
    { r: 78, g: 205, b: 196 },  // Türkis
    { r: 69, g: 183, b: 209 },  // Blau
    { r: 150, g: 206, b: 180 }, // Grün
    { r: 255, g: 234, b: 167 }, // Gelb
    { r: 223, g: 230, b: 233 }, // Grau
    { r: 116, g: 185, b: 255 }, // Hellblau
    { r: 162, g: 155, b: 254 }, // Lila
    { r: 253, g: 121, b: 168 }, // Pink
    { r: 253, g: 203, b: 110 }  // Orange
  ];
  
  for (let i = 0; i < count; i++) {
    // Timestamp über den Tag verteilt (alle 30 Minuten)
    const timestamp = Date.now() - (count - i) * 30 * 60 * 1000;
    const color = colors[i % colors.length];
    
    const filename = `${timestamp}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Erstelle ein 1080x1920 Bild (9:16 Format für Shorts)
    await sharp({
      create: {
        width: 1080,
        height: 1920,
        channels: 3,
        background: color
      }
    })
    .jpeg({ quality: 90 })
    .toFile(filepath);
    
    if ((i + 1) % 10 === 0) {
      console.log(`${i + 1}/${count} Bilder erstellt`);
    }
  }
  
  console.log('✅ Test-Bilder erstellt in:', UPLOAD_DIR);
  console.log('Jetzt kannst du testen mit:');
  console.log('  curl -X POST http://localhost:8080/api/timelapse -H "Content-Type: application/json" -d \'{"action":"create_timelapse"}\'');
}

// Script ausführen
const count = process.argv[2] ? parseInt(process.argv[2]) : 30;
generateTestImages(count)
  .catch(console.error);