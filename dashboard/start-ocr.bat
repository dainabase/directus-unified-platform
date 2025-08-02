@echo off
echo 🚀 Démarrage Dashboard OCR sur PORT 3000...
cd /d "%~dp0"

REM Tuer les process sur le port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /F /PID %%a 2>nul

REM Config environnement
set PORT=3000
set NODE_ENV=development

REM Démarrer le serveur
cd server
start npm start

REM Attendre
timeout /t 3 /nobreak >nul

REM Ouvrir le navigateur
echo ✅ OCR disponible sur http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html
start http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html