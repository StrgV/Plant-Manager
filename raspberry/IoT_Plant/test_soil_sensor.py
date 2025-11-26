# import time
# import board
# from adafruit_seesaw.seesaw import Seesaw

# i2c_bus = board.I2C()
# ss = Seesaw(i2c_bus, addr=0x36)  # Standard I2C-Adresse

# print("🌱 Adafruit STEMMA Soil Sensor Test\n")

# try:
#     while True:
#         # Temperatur auslesen
#         temp = ss.get_temp()
        
#         # Feuchtigkeit auslesen (0-1023, höher = feuchter)
#         moisture = ss.moisture_read()
        
#         print(f"🌡️  Temperatur: {temp:.1f}°C")
#         print(f"💧 Feuchtigkeit: {moisture} (ca. {moisture/10.23:.0f}%)")
#         print("-" * 40)
        
#         time.sleep(2)
        
# except KeyboardInterrupt:
#     print("\n✅ Messung beendet")

# Kalibrierung
import time
import board
from adafruit_seesaw.seesaw import Seesaw

i2c_bus = board.I2C()
ss = Seesaw(i2c_bus, addr=0x36)

print("🌱 KALIBRIERUNG - Finde deine Schwellenwerte!\n")
print("1️⃣  Stecke den Sensor in TROCKENE Erde")
print("    Warte 10 Sekunden...\n")

time.sleep(10)
trocken_wert = ss.moisture_read()
print(f"✅ TROCKEN: {trocken_wert}\n")

print("2️⃣  Gieße die Erde richtig nass")
print("    Warte 10 Sekunden...\n")

time.sleep(10)
nass_wert = ss.moisture_read()
print(f"✅ NASS: {nass_wert}\n")

schwellenwert = (trocken_wert + nass_wert) // 2
print(f"🎯 Empfohlener Schwellenwert: {schwellenwert}")
print(f"   → Pumpe AN wenn Wert < {schwellenwert}")