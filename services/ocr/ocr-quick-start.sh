#!/bin/bash
echo "🚀 Démarrage rapide OCR Dashboard..."

# Se placer dans le bon répertoire
cd "$(dirname "$0")"

# Vérifier le .env
if [ ! -f "server/.env" ]; then
  echo "❌ Fichier .env manquant"
  exit 1
fi

# Tuer les anciens process
echo "🧹 Nettoyage des ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Démarrer le serveur Python en arrière-plan
echo "🐍 Démarrage serveur Python (port 8000)..."
cd superadmin/finance
python3 -m http.server 8000 > /dev/null 2>&1 &
PYTHON_PID=$!

# Démarrer le serveur Node.js
echo "🚀 Démarrage serveur Node.js (port 3000)..."
cd ../../server
npm start &
NODE_PID=$!

# Attendre que les serveurs soient prêts
sleep 3

# Tester la connexion Notion
echo "🔍 Test de connexion Notion..."
node test-notion-connection.js

# Ouvrir le navigateur
echo "🌐 Ouverture de l'OCR..."
open "http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html" 2>/dev/null || 
xdg-open "http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html" 2>/dev/null ||
echo "📌 Ouvrez manuellement : http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html"

echo ""
echo "✅ Serveurs démarrés :"
echo "   - Python (fichiers) : http://localhost:8000"
echo "   - Node.js (API)     : http://localhost:3000"
echo ""
echo "🛑 Pour arrêter : Ctrl+C"

# Attendre et nettoyer à la sortie
trap "kill $PYTHON_PID $NODE_PID 2>/dev/null; echo '👋 Arrêt des serveurs'" EXIT
wait