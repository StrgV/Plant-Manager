print("ören sie mik")

import subprocess
import time
import datetime
import os

# ----------- HIER DEINE EINSTELLUNGEN -----------
WARTEZEIT_SEKUNDEN = 5

# Trage hier die Werte ein, die bei dir das Lila-Problem beheben!
# (z.B. "1.0,2.2" oder "1.2,1.9")
AWB_GAINS = "1.0,1.5" 

# Ordner, in dem die Bilder gespeichert werden
BILDER_ORDNER = "aufnahmen"
# -----------------------------------------------

# Erstelle den Ordner, falls er nicht existiert
if not os.path.exists(BILDER_ORDNER):
    os.makedirs(BILDER_ORDNER)
    print(f"Ordner '{BILDER_ORDNER}' erstellt.")

print(f"Starte Endlos-Aufnahme. Mache alle {WARTEZEIT_SEKUNDEN} Sek. ein Foto.")
print("Drücke STRG+C, um das Skript zu beenden.")

try:
    while True:
        # 1. Aktuelle Uhrzeit für einen einzigartigen Dateinamen holen
        jetzt = datetime.datetime.now()
        dateiname = jetzt.strftime("%Y-%m-%d_%H-%M-%S.jpg")
        voller_pfad = os.path.join(BILDER_ORDNER, dateiname)

        # 2. Den rpicam-still Befehl zusammenbauen
        befehl = [
            "rpicam-still",
            "--awbgains", AWB_GAINS, # Deine Farbanpassung
            "-n",                      # -n (no preview) ist WICHTIG über SSH!
            "-o", voller_pfad          # -o (output) mit dem vollen Pfad
        ]

        print(f"Mache Foto: {dateiname}")

        # 3. Befehl ausführen
        subprocess.run(befehl)

        # 4. Warten
        time.sleep(WARTEZEIT_SEKUNDEN)


except KeyboardInterrupt:
    print("\nSkript gestoppt. Aufnahmen beendet.")