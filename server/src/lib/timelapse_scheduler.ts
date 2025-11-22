import cron from 'node-cron';

// Jeden Tag um 23:55 Uhr ausführen
export function startTimelapseScheduler() {
  cron.schedule('55 23 * * *', async () => {
    console.log('Starte täglichen Zeitraffer-Upload...');
    
    try {
      const response = await fetch('http://localhost:5173/api/timelapse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'create_timelapse' })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Zeitraffer erfolgreich hochgeladen:', result.videoUrl);
      } else {
        console.error('❌ Fehler beim Upload:', result.message);
      }
    } catch (error) {
      console.error('❌ Cron-Job Fehler:', error);
    }
  });

  console.log('🕐 Zeitraffer-Scheduler aktiv (täglich 23:55 Uhr)');
}
