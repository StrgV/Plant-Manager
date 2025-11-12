import { google } from 'googleapis';
import readline from 'readline';

// 1. Gehe zu: https://console.cloud.google.com/
// 2. Erstelle ein neues Projekt
// 3. Aktiviere YouTube Data API v3
// 4. Erstelle OAuth 2.0 Credentials (Desktop App)
// 5. Füge diese Werte in .env ein

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000' // Redirect URI
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
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Refresh Token (füge diesen in .env ein):');
    console.log(tokens.refresh_token);
  } catch (error) {
    console.error('Fehler:', error);
  }
  rl.close();
});