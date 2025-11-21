import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import path from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

// Dieser Endpunkt streamt das Video an den Browser
export const GET: RequestHandler = async ({ params }) => {
  const filename = params.filename;
  
  // Sicherheits-Check: Keine Pfad-Manipulation erlauben (z.B. ../../etc/passwd)
  if (!filename || filename.includes('..') || filename.includes('/')) {
    throw error(400, 'Ungültiger Dateiname');
  }

  const filePath = path.resolve('static/videos', filename);

  if (!existsSync(filePath)) {
    throw error(404, 'Video nicht gefunden');
  }

  const stat = statSync(filePath);
  const fileSize = stat.size;
  const range = createReadStream(filePath);

  return new Response(range as any, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': fileSize.toString(),
      'Cache-Control': 'public, max-age=3600' // 1 Stunde cachen
    }
  });
};