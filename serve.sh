#!/usr/bin/env bash
# Sirve la app en localhost:8080 con Python (Unix / Mac / WSL).
# chmod +x serve.sh && ./serve.sh
PORT="${PORT:-8080}"
cd "$(dirname "$0")"
echo "=== Informe de Cierre PDI 2025 ==="
echo "Sirviendo en http://localhost:$PORT/"
echo "Presiona Ctrl+C para detener."
python3 -m http.server "$PORT" || python -m http.server "$PORT"
