@echo off
REM Script de démarrage unifié pour le module OCR (Windows)
REM Dashboard Client: Presta v2.2.0

echo.
echo =======================================
echo   🚀 Demarrage Module OCR Dashboard
echo      Version 2.2.0
echo =======================================
echo.

REM Définir les répertoires
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set SERVER_DIR=%PROJECT_ROOT%\server

REM Vérifier que nous sommes dans le bon répertoire
if not exist "%SERVER_DIR%" (
    echo ❌ Erreur: Repertoire server non trouve
    echo    Assurez-vous d'etre dans le repertoire portal-project
    pause
    exit /b 1
)

REM Se déplacer dans le répertoire server
cd /d "%SERVER_DIR%"

echo 📋 Verification des prerequis...
echo.

REM Vérifier Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installe
    echo    Installez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do echo ✅ Node.js %%i
)

REM Vérifier npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installe
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do echo ✅ npm %%i
)

echo.
echo 🔧 Configuration de l'environnement...

REM Exécuter le script de configuration
if exist "setup-ocr.js" (
    node setup-ocr.js
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de la configuration
        pause
        exit /b 1
    )
) else (
    echo ⚠️  Script setup-ocr.js non trouve
    
    REM Créer un .env minimal si nécessaire
    if not exist ".env" (
        echo 📝 Creation d'un fichier .env minimal
        (
            echo PORT=3000
            echo NODE_ENV=development
            echo ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8080
            echo JWT_SECRET=ocr-dev-secret-%RANDOM%
            echo JWT_EXPIRES_IN=24h
            echo NOTION_API_KEY=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
            echo NOTION_API_VERSION=2022-06-28
        ) > .env
        echo ✅ Fichier .env cree
    )
)

echo.
echo 📦 Verification des dependances...

if not exist "node_modules" (
    echo ⚠️  Installation des dependances...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependances installees
)

echo.
echo 🧹 Nettoyage des processus...

REM Tuer les processus existants sur les ports communs
for %%p in (3000 3001 8001 8080) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p') do (
        taskkill /F /PID %%a >nul 2>nul
    )
)

REM Tuer les processus node spécifiquement
taskkill /F /IM node.exe >nul 2>nul

echo ✅ Nettoyage termine

echo.
echo 🚀 Demarrage du serveur...

REM Démarrer le serveur en arrière-plan
start /B npm start

REM Attendre que le serveur démarre
echo ⏳ Attente du serveur...
timeout /t 5 /nobreak >nul

REM Vérifier si le serveur est démarré
curl -s http://localhost:3000/health >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Serveur demarre avec succes!
    set PORT=3000
) else (
    REM Essayer le port 3001
    curl -s http://localhost:3001/health >nul 2>nul
    if %errorlevel% equ 0 (
        echo ✅ Serveur demarre sur le port 3001!
        set PORT=3001
    ) else (
        echo ❌ Le serveur n'a pas demarre
        echo    Consultez les logs pour plus d'informations
        pause
        exit /b 1
    )
)

echo.
echo 🌐 Ouverture du navigateur...

REM Ouvrir le navigateur
start http://localhost:%PORT%/superadmin/finance/ocr-premium-dashboard-fixed.html

echo.
echo =======================================
echo ✅ Module OCR demarre avec succes!
echo =======================================
echo.
echo 📍 Informations serveur:
echo    • Port: %PORT%
echo    • Logs: voir la fenetre du serveur
echo.
echo 🌐 URLs d'acces:
echo    • Interface OCR: http://localhost:%PORT%/superadmin/finance/ocr-premium-dashboard-fixed.html
echo    • API Notion: http://localhost:%PORT%/api/notion
echo    • Health Check: http://localhost:%PORT%/health
echo    • Config Status: http://localhost:%PORT%/api/config/status
echo.
echo 💡 Commandes utiles:
echo    • Arreter le serveur: Fermez cette fenetre
echo    • Verifier le statut: curl http://localhost:%PORT%/api/config/status
echo.
echo 📝 Configuration:
echo    • Fichier .env: %SERVER_DIR%\.env
echo    • Cle API Notion: NOTION_API_KEY
echo    • Origins CORS: ALLOWED_ORIGINS
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul