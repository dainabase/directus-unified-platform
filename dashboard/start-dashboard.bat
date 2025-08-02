@echo off
REM 🚀 Script de démarrage automatique Dashboard - Dashboard Client: Presta
REM Démarre les deux serveurs nécessaires pour l'application complète

title Dashboard Client 2.ESPACE.PRESTA - Démarrage

echo.
echo 🔥 DÉMARRAGE AUTOMATIQUE DASHBOARD CLIENT 2.ESPACE.PRESTA
echo ========================================================
echo.

REM Définir les variables
set SCRIPT_DIR=%~dp0
set SERVER_DIR=%SCRIPT_DIR%server
set PROJECT_DIR=%SCRIPT_DIR%

REM Fonction pour vérifier si un port est utilisé
set PORT_3000_USED=false
set PORT_8000_USED=false

echo 🔧 Vérification des prérequis...

REM Vérifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Node.js n'est pas installé
    echo    📥 Téléchargez depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo    ✅ Node.js installé

REM Vérifier Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Python n'est pas installé
    echo    📥 Téléchargez depuis: https://www.python.org/
    pause
    exit /b 1
)
echo    ✅ Python installé

REM Vérifier les dépendances Node.js
if not exist "%SERVER_DIR%\node_modules" (
    echo    ⚠️  Dependencies manquantes, installation...
    cd /d "%SERVER_DIR%"
    call npm install
    if %errorlevel% neq 0 (
        echo    ❌ Échec installation des dépendances
        pause
        exit /b 1
    )
)

REM Vérifier la configuration
if not exist "%SERVER_DIR%\.env" (
    echo    ⚠️  Fichier .env manquant, création depuis .env.example...
    if exist "%SERVER_DIR%\.env.example" (
        copy "%SERVER_DIR%\.env.example" "%SERVER_DIR%\.env" >nul
        echo    📝 Veuillez configurer NOTION_API_KEY dans %SERVER_DIR%\.env
    ) else (
        echo    ❌ Fichier .env.example non trouvé
    )
)

echo.
echo 🧹 Nettoyage des processus existants...

REM Tuer les processus sur les ports 3000 et 8000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000 "') do (
    echo    - Arrêt du processus sur port 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000 "') do (
    echo    - Arrêt du processus sur port 8000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Attendre que les ports se libèrent
echo    - Attente libération des ports...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Démarrage du serveur Node.js (API + Interface web)...
cd /d "%SERVER_DIR%"
set PORT=3000
set NODE_ENV=development

REM Démarrer Node.js en arrière-plan
start /b "" cmd /c "npm start > %TEMP%\nodejs-dashboard.log 2>&1"

echo    - Logs: %TEMP%\nodejs-dashboard.log
echo    - Attente du démarrage...

REM Attendre que Node.js démarre
timeout /t 5 /nobreak >nul

REM Vérifier que Node.js fonctionne
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Échec démarrage Node.js
    echo    📋 Vérifiez les logs dans %TEMP%\nodejs-dashboard.log
    pause
    exit /b 1
)
echo    ✅ Serveur Node.js actif sur port 3000

echo.
echo 🐍 Démarrage du serveur Python (Fichiers statiques)...
cd /d "%PROJECT_DIR%"

REM Démarrer Python en arrière-plan
start /b "" cmd /c "python -m http.server 8000 > %TEMP%\python-static.log 2>&1"

echo    - Logs: %TEMP%\python-static.log  
echo    - Attente du démarrage...

REM Attendre que Python démarre
timeout /t 3 /nobreak >nul

REM Vérifier que Python fonctionne
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Échec démarrage Python
    echo    📋 Vérifiez les logs dans %TEMP%\python-static.log
    pause
    exit /b 1
)
echo    ✅ Serveur Python actif sur port 8000

echo.
echo 🔍 Vérification de la configuration...

REM Test de connectivité Notion
curl -s "http://localhost:3000/api/config/status" | find "true" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Configuration Notion valide
) else (
    echo    ⚠️  Configuration Notion manquante - Fonctionnalité limitée
)

echo.
echo 🎉 DÉMARRAGE TERMINÉ AVEC SUCCÈS !
echo ==================================
echo.
echo 📊 DASHBOARD MULTI-RÔLES ACTIF
echo ------------------------------
echo 🌐 Interface principale: http://localhost:8000
echo 🔧 API Node.js:         http://localhost:3000
echo.
echo 🎯 INTERFACES PAR RÔLE
echo ----------------------
echo 👤 Client:              http://localhost:8000/client/dashboard.html
echo 🔧 Prestataire:         http://localhost:8000/prestataire/dashboard.html
echo 🏪 Revendeur:           http://localhost:8000/revendeur/dashboard.html
echo ⚙️  Superadmin:          http://localhost:8000/superadmin/dashboard.html
echo.
echo 🔍 MODULES SPÉCIALISÉS
echo ----------------------
echo 📄 OCR Premium:         http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html
echo 💰 Finance:             http://localhost:8000/superadmin/finance/dashboard.html
echo 📊 Analytics:           http://localhost:8000/superadmin/analytics/dashboard.html
echo.
echo 🛠️  OUTILS DÉVELOPPEMENT
echo ------------------------
echo ❤️  Health check:        http://localhost:3000/health
echo 📋 Config status:       http://localhost:3000/api/config/status
echo 🔐 Auth test:           http://localhost:3000/api/auth/me
echo.
echo 📝 GESTION DES PROCESSUS
echo ------------------------
echo 💡 Pour arrêter les serveurs: Fermez cette fenêtre ou Ctrl+C
echo.
echo 📋 Logs disponibles:
echo    Node.js: %TEMP%\nodejs-dashboard.log
echo    Python:  %TEMP%\python-static.log
echo.

REM Créer script d'arrêt
echo @echo off > %TEMP%\stop-dashboard.bat
echo echo 🛑 Arrêt du Dashboard Client... >> %TEMP%\stop-dashboard.bat
echo for /f "tokens=5" %%%%a in ('netstat -aon ^^^| find ":3000 "') do taskkill /F /PID %%%%a ^>nul 2^>^&1 >> %TEMP%\stop-dashboard.bat
echo for /f "tokens=5" %%%%a in ('netstat -aon ^^^| find ":8000 "') do taskkill /F /PID %%%%a ^>nul 2^>^&1 >> %TEMP%\stop-dashboard.bat
echo echo ✅ Dashboard arrêté proprement >> %TEMP%\stop-dashboard.bat
echo pause >> %TEMP%\stop-dashboard.bat

echo    Script d'arrêt: %TEMP%\stop-dashboard.bat

REM Ouvrir automatiquement l'interface principale
echo.
echo 🌐 Ouverture de l'interface Dashboard...
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"

echo.
echo ⏳ SERVEURS ACTIFS - Appuyez sur une touche pour arrêter...
pause >nul

REM Arrêter les serveurs
echo.
echo 🛑 Arrêt des serveurs...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ Serveurs arrêtés proprement
echo 👋 À bientôt !
timeout /t 2 /nobreak >nul