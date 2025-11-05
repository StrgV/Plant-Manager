# Basis-Image
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungsdateien kopieren
COPY . .

# Port exponieren (optional, dient nur der Dokumentation)
EXPOSE 8000

# Befehl zum Starten der Anwendung
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
