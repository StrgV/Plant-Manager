from gpiozero import OutputDevice
import time

# ----------- HIER DEINE EINSTELLUNGEN -----------
# Wähle den GPIO Pin (BCM-Nummerierung), den du mit 'IN' verbunden hast.
PUMPE_PIN = 17 
# -----------------------------------------------

# Initialisiere das Relais (oder die Pumpe)
# 'active_high=False' ist bei vielen Relais-Modulen nötig,
# da sie "Low-Level-Triggered" sind (d.h. sie gehen AN, wenn der Pi 0V sendet).
#
# !! Teste das: Wenn die Pumpe sofort ANgeht, ändere es zu:
# pumpe = OutputDevice(PUMPE_PIN, active_high=false, initial_value=false)
pumpe = OutputDevice(PUMPE_PIN, active_high=False, initial_value=False)

print("Pumpensteuerung gestartet. Pumpe ist AUS.")
print(f"Pumpe wird an GPIO {PUMPE_PIN} gesteuert.")
print("Drücke STRG+C zum Beenden.")

# Hier ist deine Variable. In einem echten Programm käme
# dieser Wert von einem Sensor, einer Datei oder einer Berechnung.
variable_X = 0 

try:
    while True:
        # ----- HIER SIMULIEREN WIR DEINE VARIABLE -----
        # In deinem echten Code würdest du hier den Wert von X aktualisieren
        # (z.B. einen Sensor auslesen)
        # Wir lassen sie hier einfach hochzählen, um es zu testen:
        variable_X += 1
        print(f"Aktueller Wert von X: {variable_X}")
        # ----------------------------------------------


        # Das ist deine Logik:
        if variable_X >= 5:
            if not pumpe.is_active: # Nur schalten, wenn sie nicht schon an ist
                print("X >= 5. Pumpe AUS")
                pumpe.on()
        else:
            if pumpe.is_active: # Nur schalten, wenn sie nicht schon aus ist
                print("X < 5. Pumpe AN")
                pumpe.off()
        
        # Simuliere, dass die Variable X zurückgesetzt wird (optional)
        if variable_X > 15:
            print("--- Variable X wird zurückgesetzt ---")
            variable_X = 0
            
        # Warte eine Sekunde, bevor die Schleife erneut läuft
        time.sleep(1)

except KeyboardInterrupt:
    print("\nSkript gestoppt.")
finally:
    # WICHTIG: Pumpe am Ende immer ausschalten
    pumpe.off()
    print("Pumpe wurde ausgeschaltet.")
