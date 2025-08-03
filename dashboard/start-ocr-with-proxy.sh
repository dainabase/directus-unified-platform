#!/bin/bash

# Script de démarrage OCR avec proxy Notion
# Lance le serveur Node.js et le serveur Python avec proxy intégré

echo "🚀 Démarrage du système OCR avec proxy Notion"
echo "============================================="

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 n'est pas installé${NC}"
    exit 1
fi

# Fonction pour tuer les processus sur les ports
kill_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $port déjà utilisé, arrêt du processus...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Nettoyer les ports si nécessaire
kill_port 3000
kill_port 8000

# Démarrer le serveur Node.js en arrière-plan
echo -e "\n${GREEN}1️⃣  Démarrage du serveur Node.js (port 3000)...${NC}"
cd portal-project/server
npm start > ../../node-server.log 2>&1 &
NODE_PID=$!
cd ../..

# Attendre que le serveur Node.js soit prêt
echo -n "   Attente du serveur Node.js"
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Vérifier si le serveur Node.js est bien démarré
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo -e " ${RED}❌ Échec du démarrage${NC}"
    echo "Consultez node-server.log pour plus de détails"
    exit 1
fi

# Installer requests si nécessaire
echo -e "\n${GREEN}2️⃣  Vérification des dépendances Python...${NC}"
if ! python3 -c "import requests" 2>/dev/null; then
    echo "   Installation du module requests..."
    pip3 install requests
fi

# Démarrer le serveur Python avec proxy
echo -e "\n${GREEN}3️⃣  Démarrage du serveur Python avec proxy (port 8000)...${NC}"
python3 simple_http_server.py &
PYTHON_PID=$!

# Attendre un peu
sleep 2

# Afficher les informations
echo -e "\n${GREEN}✅ Système OCR démarré avec succès !${NC}"
echo "============================================="
echo -e "${GREEN}🌐 Serveur Node.js :${NC} http://localhost:3000"
echo -e "${GREEN}🐍 Serveur Python  :${NC} http://localhost:8000"
echo -e "\n${GREEN}📄 Accès OCR :${NC}"
echo "   - Via Node.js : http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html"
echo "   - Via Python  : http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html"
echo -e "\n${YELLOW}💡 Les deux URLs fonctionnent maintenant grâce au proxy intégré !${NC}"
echo -e "\nPour arrêter : Appuyez sur Ctrl+C"

# Fonction de nettoyage
cleanup() {
    echo -e "\n\n${YELLOW}⏹️  Arrêt des serveurs...${NC}"
    kill $NODE_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    kill_port 3000
    kill_port 8000
    echo -e "${GREEN}✅ Serveurs arrêtés${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT

# Ouvrir le navigateur après un court délai
sleep 1
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html"
fi

# Garder le script en vie
while true; do
    sleep 1
done