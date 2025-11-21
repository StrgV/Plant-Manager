import { google } from 'googleapis';
import readline from 'readline';
import 'dotenv/config'; // <--- WICHTIG: Lädt die .env Datei sofort

// Debugging: Prüfen, ob die Werte jetzt da sind (kannst du später löschen)
if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
    console.error("❌ FEHLER: .env Datei wurde nicht geladen oder Variablen fehlen!");
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000' // WICHTIG: Muss exakt so in der Google Cloud Console stehen
);

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

// Schritt 1: Authorization URL generieren
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES
});

console.log('Öffne diese URL im Browser:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Schritt 2: Code eingeben und Token erhalten
rl.question('Gib den Authorization Code ein: ', async (code) => {
  try {
    // Den Code (der URL-encodet sein könnte) bereinigen
    const decodedCode = decodeURIComponent(code);
    
    const { tokens } = await oauth2Client.getToken(decodedCode);
    console.log('\n✅ ERFOLG! Refresh Token (füge diesen in .env ein):');
    console.log('------------------------------------------------');
    console.log(tokens.refresh_token);
    console.log('------------------------------------------------');
  } catch (error) {
    console.error('Fehler beim Token-Austausch:', error);
  }
  rl.close();
});