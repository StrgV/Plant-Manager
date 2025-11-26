# activate venv!!
# source ~/pumpen-env/bin/activate

from gpiozero import OutputDevice
import time
import board
from adafruit_seesaw.seesaw import Seesaw

# ========== Settings ==========
PUMPE_PIN = 17
TROCKEN_SCHWELLE = 650  # kalibrierter mit nassem Tuch lol
MESS_INTERVALL = 5     # Alle 60 Sekunden messen
PUMP_DAUER = 5          # 5 Sekunden gießen
# ===================================

# ----------- HIER DEINE EINSTELLUNGEN -----------
WARTEZEIT_SEKUNDEN = 5

# Trage hier die Werte ein, die bei dir das Lila-Problem beheben!
# (z.B. "1.0,2.2" oder "1.2,1.9")
AWB_GAINS = "1.0,1.5" 

# Ordner, in dem die Bilder gespeichert werden
BILDER_ORDNER = "aufnahmen"
# -----------------------------------------------


# Hw initialisieren
pumpe = OutputDevice(PUMPE_PIN, active_high=True, initial_value=False)
i2c_bus = board.I2C()
sensor = Seesaw(i2c_bus, addr=0x36)

print("Automatische Bewässerung gestartet")
print(f"Pumpe: GPIO {PUMPE_PIN}")
print(f"Schwellenwert: {TROCKEN_SCHWELLE}")
print(f"Messintervall: {MESS_INTERVALL}s")
print("Drücke STRG+C zum Beenden.\n")

try:
    while True:
        # Feuchtigkeit messen
        moisture = sensor.moisture_read()
        temp = sensor.get_temp()
        
        print(f"{temp:.1f}°C | Feuchtigkeit: {moisture}", end=" ")
        
        # Pumpenlogik
        if moisture < TROCKEN_SCHWELLE:
            fehlende_feuchtigkeit = TROCKEN_SCHWELLE - moisture
            print(f"→ ZU TROCKEN (-{fehlende_feuchtigkeit})! Gieße {PUMP_DAUER}s...")
            pumpe.on()
            time.sleep(PUMP_DAUER)
            pumpe.off()
            print("Fertig gegossen")
            print(f"{temp:.1f}°C | Feuchtigkeit: {moisture}", end=" \n")
            # Wenn längere INtervalle nochmal gießen (loop maybe risky, wenn Wasser leer überhitzt Pumpe)

        else:
            ueberschuss = moisture - TROCKEN_SCHWELLE
            print(f"→ OK (+{ueberschuss})")
        
        # Warten bis zur nächsten Messung
        time.sleep(MESS_INTERVALL)


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
    print("\n\nProgramm gestoppt")
finally:
    pumpe.off()
    print("Pumpe sicher ausgeschaltet")