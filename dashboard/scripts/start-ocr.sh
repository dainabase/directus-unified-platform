#!/bin/bash

# Script de démarrage unifié pour le module OCR
# Dashboard Client: Presta v2.2.0

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Afficher le header
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════╗"
echo "║   🚀 Démarrage Module OCR Dashboard   ║"
echo "║        Version 2.2.0                  ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Définir le répertoire de base
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
SERVER_DIR="$PROJECT_ROOT/server"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}❌ Erreur: Répertoire server non trouvé${NC}"
    echo -e "   Assurez-vous d'être dans le répertoire portal-project"
    exit 1
fi

# Se déplacer dans le répertoire server
cd "$SERVER_DIR"

# Fonction pour vérifier les prérequis
check_requirements() {
    echo -e "\n${BLUE}📋 Vérification des prérequis...${NC}"
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}  ❌ Node.js n'est pas installé${NC}"
        echo -e "     Installez Node.js depuis: https://nodejs.org/"
        exit 1
    else
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}  ✅ Node.js ${NODE_VERSION}${NC}"
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}  ❌ npm n'est pas installé${NC}"
        exit 1
    else
        NPM_VERSION=$(npm -v)
        echo -e "${GREEN}  ✅ npm ${NPM_VERSION}${NC}"
    fi
}

# Fonction pour configurer l'environnement
setup_environment() {
    echo -e "\n${BLUE}🔧 Configuration de l'environnement...${NC}"
    
    # Exécuter le script de configuration
    if [ -f "setup-ocr.js" ]; then
        node setup-ocr.js
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erreur lors de la configuration${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}  ⚠️  Script setup-ocr.js non trouvé${NC}"
        
        # Créer un .env minimal si nécessaire
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}  📝 Création d'un fichier .env minimal${NC}"
            cat > .env << EOF
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8080
JWT_SECRET=ocr-dev-secret-$(openssl rand -hex 8)
JWT_EXPIRES_IN=24h
NOTION_API_KEY=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
NOTION_API_VERSION=2022-06-28
EOF
            echo -e "${GREEN}  ✅ Fichier .env créé${NC}"
        fi
    fi
}

# Fonction pour vérifier les dépendances
check_dependencies() {
    echo -e "\n${BLUE}📦 Vérification des dépendances...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  ⚠️  Installation des dépendances...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erreur lors de l'installation${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}  ✅ Dépendances installées${NC}"
    fi
}

# Fonction pour tuer les processus existants
kill_existing_processes() {
    echo -e "\n${BLUE}🧹 Nettoyage des processus...${NC}"
    
    # Tuer les processus Node.js sur les ports communs
    for port in 3000 3001 8001 8080; do
        PID=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo -e "${YELLOW}  ⚠️  Arrêt du processus sur le port $port (PID: $PID)${NC}"
            kill -9 $PID 2>/dev/null
        fi
    done
    
    # Tuer les processus node server.js spécifiquement
    pkill -f "node server.js" 2>/dev/null
    pkill -f "node.*server\.js" 2>/dev/null
    
    echo -e "${GREEN}  ✅ Nettoyage terminé${NC}"
}

# Fonction pour démarrer le serveur
start_server() {
    echo -e "\n${BLUE}🚀 Démarrage du serveur...${NC}"
    
    # Charger les variables d'environnement pour afficher le port
    if [ -f ".env" ]; then
        export $(cat .env | grep -E '^PORT=' | xargs)
    fi
    PORT=${PORT:-3000}
    
    # Démarrer le serveur en arrière-plan
    npm start &
    SERVER_PID=$!
    
    # Attendre que le serveur démarre
    echo -ne "${CYAN}  ⏳ Attente du serveur"
    for i in {1..10}; do
        if curl -s http://localhost:$PORT/health > /dev/null 2>&1; then
            echo -e "\r${GREEN}  ✅ Serveur démarré avec succès!${NC}"
            
            # Vérifier le statut de configuration
            echo -e "\n${BLUE}🔍 Vérification de la configuration...${NC}"
            STATUS=$(curl -s http://localhost:$PORT/api/config/status 2>/dev/null)
            
            if [ ! -z "$STATUS" ]; then
                # Extraire le port réel du serveur
                ACTUAL_PORT=$(echo $STATUS | grep -o '"port":[0-9]*' | cut -d: -f2)
                if [ ! -z "$ACTUAL_PORT" ]; then
                    PORT=$ACTUAL_PORT
                fi
                
                # Vérifier Notion
                if echo $STATUS | grep -q '"apiKeyConfigured":true'; then
                    echo -e "${GREEN}  ✅ Configuration Notion OK${NC}"
                else
                    echo -e "${YELLOW}  ⚠️  Clé API Notion non configurée${NC}"
                    echo -e "     Ajoutez NOTION_API_KEY dans le fichier .env"
                fi
            fi
            
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "\r${RED}  ❌ Le serveur n'a pas démarré${NC}"
    return 1
}

# Fonction pour ouvrir le navigateur
open_browser() {
    echo -e "\n${BLUE}🌐 Ouverture du navigateur...${NC}"
    
    URL="http://localhost:$PORT/superadmin/finance/ocr-premium-dashboard-fixed.html"
    
    # Détecter l'OS et ouvrir le navigateur
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "$URL"
        elif command -v gnome-open &> /dev/null; then
            gnome-open "$URL"
        else
            echo -e "${YELLOW}  ⚠️  Impossible d'ouvrir le navigateur automatiquement${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠️  OS non supporté pour l'ouverture automatique${NC}"
    fi
}

# Fonction pour afficher les instructions finales
display_instructions() {
    echo -e "\n${GREEN}${BOLD}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}✅ Module OCR démarré avec succès!${NC}"
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════${NC}"
    
    echo -e "\n${CYAN}📍 Informations serveur:${NC}"
    echo -e "   • Port: ${BOLD}$PORT${NC}"
    echo -e "   • PID: ${BOLD}$SERVER_PID${NC}"
    echo -e "   • Logs: ${BOLD}tail -f server.log${NC}"
    
    echo -e "\n${CYAN}🌐 URLs d'accès:${NC}"
    echo -e "   • Interface OCR: ${BOLD}http://localhost:$PORT/superadmin/finance/ocr-premium-dashboard-fixed.html${NC}"
    echo -e "   • API Notion: ${BOLD}http://localhost:$PORT/api/notion${NC}"
    echo -e "   • Health Check: ${BOLD}http://localhost:$PORT/health${NC}"
    echo -e "   • Config Status: ${BOLD}http://localhost:$PORT/api/config/status${NC}"
    
    echo -e "\n${YELLOW}💡 Commandes utiles:${NC}"
    echo -e "   • Voir les logs: ${BOLD}tail -f $SERVER_DIR/server.log${NC}"
    echo -e "   • Vérifier le statut: ${BOLD}curl http://localhost:$PORT/api/config/status | jq${NC}"
    echo -e "   • Arrêter le serveur: ${BOLD}Ctrl+C${NC}"
    
    echo -e "\n${CYAN}📝 Configuration:${NC}"
    echo -e "   • Fichier .env: ${BOLD}$SERVER_DIR/.env${NC}"
    echo -e "   • Clé API Notion: ${BOLD}NOTION_API_KEY${NC}"
    echo -e "   • Origins CORS: ${BOLD}ALLOWED_ORIGINS${NC}"
    
    echo -e "\n${BOLD}Appuyez sur Ctrl+C pour arrêter le serveur${NC}\n"
}

# Fonction de nettoyage à la fermeture
cleanup() {
    echo -e "\n\n${YELLOW}⏹️  Arrêt du serveur...${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Serveur arrêté proprement${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT TERM

# Programme principal
main() {
    check_requirements
    setup_environment
    check_dependencies
    kill_existing_processes
    
    if start_server; then
        open_browser
        display_instructions
        
        # Garder le script en vie
        wait $SERVER_PID
    else
        echo -e "\n${RED}❌ Échec du démarrage du serveur${NC}"
        echo -e "   Consultez les logs pour plus d'informations"
        exit 1
    fi
}

# Lancer le programme
main