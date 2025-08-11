@echo off
title OCR avec Proxy Notion

echo ============================================
echo 🚀 Demarrage du systeme OCR avec proxy Notion
echo ============================================

:: Verifier Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installe
    echo Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

:: Verifier Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python n'est pas installe
    pause
    exit /b 1
)

:: Tuer les processus sur les ports si necessaire
echo.
echo Nettoyage des ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a >nul 2>nul

:: Demarrer le serveur Node.js
echo.
echo 1. Demarrage du serveur Node.js (port 3000)...
cd portal-project\server
start /B cmd /c "npm start > ..\..\node-server.log 2>&1"
cd ..\..

:: Attendre un peu
timeout /t 3 /nobreak >nul

:: Installer requests si necessaire
echo.
echo 2. Verification des dependances Python...
python -c "import requests" >nul 2>nul
if %errorlevel% neq 0 (
    echo    Installation du module requests...
    pip install requests
)

:: Demarrer le serveur Python
echo.
echo 3. Demarrage du serveur Python avec proxy (port 8000)...
start /B python simple_http_server.py

:: Attendre un peu
timeout /t 2 /nobreak >nul

:: Afficher les informations
cls
echo ============================================
echo ✅ Systeme OCR demarre avec succes !
echo ============================================
echo.
echo 🌐 Serveur Node.js : http://localhost:3000
echo 🐍 Serveur Python  : http://localhost:8000
echo.
echo 📄 Acces OCR :
echo    - Via Node.js : http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html
echo    - Via Python  : http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html
echo.
echo 💡 Les deux URLs fonctionnent maintenant grace au proxy integre !
echo.
echo Pour arreter : Fermez cette fenetre
echo.

:: Ouvrir le navigateur
start http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html

:: Garder la fenetre ouverte
pause >nul