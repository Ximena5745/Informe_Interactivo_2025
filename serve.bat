@echo off
REM Sirve la app en localhost:8080 con Python (sin instalar nada extra).
REM Doble clic en este archivo o ejecutar desde la terminal.

set PORT=8080
echo.
echo === Informe de Cierre PDI 2025 ===
echo Sirviendo en http://localhost:%PORT%/
echo Presiona Ctrl+C para detener.
echo.

cd /d "%~dp0"
python -m http.server %PORT%

pause
