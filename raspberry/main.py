# activate venv!!
# source ~/pumpen-env/bin/activate

import time
import board
import datetime
import os
import subprocess
import requests
import signal
import sys
from gpiozero import OutputDevice
from adafruit_seesaw.seesaw import Seesaw
from dotenv import load_dotenv

# Hier ist die Magie:
from apscheduler.schedulers.background import BackgroundScheduler

# ========== Settings ==========
PUMPE_PIN = 17
TROCKEN_SCHWELLE = 700
PUMP_DAUER = 3 

# Intervalle & Zeitpläne
CHECK_INTERVALL_MINUTEN = 60  # Alle 60 Minuten Feuchtigkeit prüfen
FOTO_INTERVALL_MINUTEN = 30   # NEU: Alle 30 Minuten ein Foto

AWB_GAINS = "1.0,1.1" 
BILDER_ORDNER = "aufnahmen"

# Umgebungsvariablen laden
load_dotenv()
API_KEY = os.getenv("API_KEY")
API_URL = os.getenv("API_URL")

# ========== Initialisierung ==========

# Hardware
pumpe = OutputDevice(PUMPE_PIN, active_high=True, initial_value=False)
i2c_bus = board.I2C()
sensor = Seesaw(i2c_bus, addr=0x36)

# Ordner sicherstellen
os.makedirs(BILDER_ORDNER, exist_ok=True)

# ========== Funktionen (Jobs) ==========

def job_feuchtigkeit_pruefen():
    """Misst Feuchtigkeit und gießt bei Bedarf."""
    try:
        moisture = sensor.moisture_read()
        temp = sensor.get_temp()
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")

        print(f"[{timestamp}] Check: {temp:.1f}°C | Feuchte: {moisture}")

        if moisture < TROCKEN_SCHWELLE:
            diff = TROCKEN_SCHWELLE - moisture
            print(f"   >>> ZU TROCKEN (-{diff})! Gieße {PUMP_DAUER}s...")
            
            pumpe.on()
            # Hier ist ein kurzes sleep OK, da wir aktiv gießen wollen
            time.sleep(PUMP_DAUER) 
            pumpe.off()
            
            print("   >>> Gießen beendet.")
        else:
            print("   >>> Alles OK.")

    except Exception as e:
        print(f"ERROR beim Messen/Gießen: {e}")
        pumpe.off() # Sicherheitsabschaltung

def job_foto_upload():
    """Macht ein Foto und lädt es hoch."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    dateiname = f"{timestamp}.jpg"
    voller_pfad = os.path.join(BILDER_ORDNER, dateiname)
    
    print(f"\n[{timestamp}] Starte Foto-Workflow...")

    # Befehl bauen
    befehl = [
        "rpicam-still",
        "--awbgains", AWB_GAINS,
        "-n",
        "-o", voller_pfad
    ]

    try:
        # Foto machen
        subprocess.run(befehl, check=True, capture_output=True, text=True)
        print(f"   Foto gespeichert: {dateiname}")

        # Upload
        print("   Lade hoch...")
        with open(voller_pfad, 'rb') as f:
            files = {'image': f}
            headers = {'Authorization': f'Bearer {API_KEY}'}
            response = requests.post(API_URL, files=files, headers=headers, timeout=60)

        if response.status_code == 201 or response.status_code == 200:
            print("   Upload erfolgreich! Lösche lokales Bild.")
            os.remove(voller_pfad)
        else:
            print(f"   Upload FEHLER: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"ERROR beim Foto/Upload: {e}")

# ========== Hauptprogramm ==========

if __name__ == "__main__":
    # Scheduler einrichten
    scheduler = BackgroundScheduler()

    # Job 1: Feuchtigkeit (Interval)
    # Startet sofort beim ersten Mal, dann alle X Minuten
    scheduler.add_job(job_feuchtigkeit_pruefen, 'interval', minutes=CHECK_INTERVALL_MINUTEN, next_run_time=datetime.datetime.now())

    # Job 2: Foto (Interval)
    # Startet JETZT sofort ein Foto, und dann alle 30 Minuten
    scheduler.add_job(job_foto_upload, 'interval', minutes=FOTO_INTERVALL_MINUTEN, next_run_time=datetime.datetime.now())

    print("--- Plant Manager 2.0 gestartet ---")
    print(f"Messe alle {CHECK_INTERVALL_MINUTEN} Minuten.")
    print(f"Mache Foto alle {FOTO_INTERVALL_MINUTEN} Minuten.")
    print("Drücke STRG+C zum Beenden.")
    
    scheduler.start()

    try:
        signal.pause() 
    except (KeyboardInterrupt, SystemExit):
        print("\nBeende Programm...")
        scheduler.shutdown()
        pumpe.off()
        print("Pumpe aus, Scheduler gestoppt.")