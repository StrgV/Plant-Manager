# activate venv!!
# source ~/pumpen-env/bin/activate

from gpiozero import OutputDevice
import time
import board
from adafruit_seesaw.seesaw import Seesaw
import datetime
import os
import subprocess

# ========== Settings ==========
PUMPE_PIN = 17
MESS_INTERVALL = 3      # Schnell hintereinander weg (3 Sekunden Pause)
BILDER_ORDNER = "aufnahmen"

# LISTE DER TEST-WERTE (FÜR DIE FARB-KORREKTUR)
TEST_GAINS = [
    "1.0,1.0",     # Referenz (leicht grün/gelb)
    "1.05,1.05",   # Die goldene Mitte: Minimal mehr Magenta
    "1.0,1.1",     # Nur Blau etwas hoch (kühleres Bild gegen das Gelb)
    "1.05,1.1",    # Wenig Rot, etwas mehr Blau
    "1.0,1.15",    # Noch etwas kühler
    "1.08,1.08"    # Ein letzter sehr feiner Zwischenschritt
]
aktueller_gain_index = 0 
# ===================================

# Ordner erstellen falls nicht vorhanden
os.makedirs(BILDER_ORDNER, exist_ok=True)

print("--- NUR LOKALER KAMERA-TEST ---")
print(f"Speichere Bilder in: {os.path.abspath(BILDER_ORDNER)}")
print("Drücke STRG+C zum Beenden.\n")

try:
    while True:
        
        # 1. Nächste Einstellung aus der Liste holen
        aktuelle_gains = TEST_GAINS[aktueller_gain_index]
        
        # 2. Dateinamen bauen
        gain_clean = aktuelle_gains.replace(",", "-")
        jetzt = datetime.datetime.now()
        dateiname = jetzt.strftime(f"%H-%M-%S_gain-{gain_clean}.jpg")
        voller_pfad = os.path.join(BILDER_ORDNER, dateiname)

        # 3. Befehl bauen
        befehl = [
            "rpicam-still",
            "-n",               # Keine Vorschau
            "-o", voller_pfad,  # Output Pfad
            "--awbgains", aktuelle_gains
        ]

        print(f"📸 Mache Foto mit {aktuelle_gains}...", end=" ")
        
        try:
            # Foto machen
            subprocess.run(befehl, check=True, capture_output=True, text=True)
            print(f"✅ Gespeichert: {dateiname}")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Fehler bei der Aufnahme: {e}")

        # Nächsten Index für das nächste Foto vorbereiten
        aktueller_gain_index = (aktueller_gain_index + 1) % len(TEST_GAINS)

        time.sleep(MESS_INTERVALL)

except KeyboardInterrupt:
    print("\nProgramm gestoppt")