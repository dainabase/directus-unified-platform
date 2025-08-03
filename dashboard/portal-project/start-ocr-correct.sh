#!/bin/bash
echo "🚀 Démarrage OCR avec les bons chemins..."

# Se placer dans le bon dossier
cd "$(dirname "$0")"

# Démarrer Python depuis la RACINE du projet
echo "📁 Démarrage depuis la racine portal-project..."
python3 -m http.server 8000 &

# Message clair
echo ""
echo "✅ Serveur démarré !"
echo "🔗 URL CORRECTE : http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html"
echo ""
echo "⚠️  NE PAS utiliser : http://localhost:8000/ocr-premium-dashboard-fixed.html"
echo ""

# Ouvrir la BONNE URL
open "http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html"

wait