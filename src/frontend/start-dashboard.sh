#!/bin/bash
# Script de lancement du Dashboard SuperAdmin V3 Premium

echo "🚀 Lancement du Dashboard SuperAdmin V3 Premium..."
echo "================================================"
echo ""

# Aller dans le répertoire frontend
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend

# Vérifier que le fichier .env.local existe
if [ ! -f .env.local ]; then
    echo "⚠️  Création du fichier .env.local..."
    cat > .env.local << 'EOF'
# Configuration API Directus
VITE_API_URL=http://localhost:8055
VITE_API_TOKEN=demo-token-12345

# Environnement
VITE_ENV=development
VITE_DEBUG=true

# Mode démo (utilise des données factices si Directus n'est pas disponible)
VITE_DEMO_MODE=true
EOF
    echo "✅ Fichier .env.local créé"
fi

# Afficher le statut du mode démo
echo "🎭 Mode Démo : ACTIVÉ"
echo "   Les données de démonstration seront utilisées"
echo ""

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "   Installation des dépendances..."
    npm install
else
    echo "✅ Dépendances déjà installées"
fi

# Lancer le serveur de développement
echo ""
echo "🌟 Démarrage du serveur de développement..."
echo "   Le navigateur s'ouvrira automatiquement dans quelques secondes"
echo ""
echo "📍 URL : http://localhost:5173"
echo ""
echo "⌨️  Raccourcis disponibles :"
echo "   - 'q' pour quitter"
echo "   - 'r' pour redémarrer"
echo "   - 'h' pour afficher l'aide"
echo ""
echo "================================================"
echo ""

# Lancer Vite
npm run dev