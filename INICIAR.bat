@echo off
chcp 65001 >nul 2>&1
title Informe PDI 2025 - Iniciando...

echo.
echo ========================================
echo   Informe de Cierre PDI 2025
echo   Politecnico Grancolombiano
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no encontrado. Instala Python desde python.org
    pause
    exit /b 1
)

echo [OK] Python detectado
echo.

REM Matar procesos anteriores
taskkill /f /im python.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Iniciar servidor
echo [INFO] Iniciando servidor en http://localhost:8080
start /b python -m http.server 8080 >nul 2>&1
timeout /t 2 /nobreak >nul

REM Abrir navegador
echo [INFO] Abriendo navegador...
start http://localhost:8080

echo.
echo ========================================
echo   Servidor corriendo en: http://localhost:8080
echo   Presiona Ctrl+C para detener
echo ========================================
echo.
pause
