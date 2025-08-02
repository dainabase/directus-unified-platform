#!/bin/bash

# 🚀 Script de démarrage automatique Dashboard - Dashboard Client: Presta
# Démarre les deux serveurs nécessaires pour l'application complète

echo "🔥 DÉMARRAGE AUTOMATIQUE DASHBOARD CLIENT 2.ESPACE.PRESTA"
echo "========================================================"

# Variables
SCRIPT_DIR="$(dirname "$0")"
SERVER_DIR="$SCRIPT_DIR/server"
PROJECT_DIR="$SCRIPT_DIR"

# Fonction pour vérifier si un port est utilisé
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Fonction pour attendre qu'un port soit disponible
wait_for_port() {
    local port=$1
    local timeout=30
    local elapsed=0
    
    while check_port $port && [ $elapsed -lt $timeout ]; do
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo "   ⚠️  Timeout: Le port $port est toujours occupé"
        return 1
    fi
    return 0
}

# Fonction pour vérifier qu'un serveur répond
check_server_health() {
    local url=$1
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

echo "🔧 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js n'est pas installé"
    exit 1
fi
echo "   ✅ Node.js: $(node --version)"

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "   ❌ Python3 n'est pas installé"
    exit 1
fi
echo "   ✅ Python3: $(python3 --version)"

# Vérifier les dépendances Node.js
if [ ! -d "$SERVER_DIR/node_modules" ]; then
    echo "   ⚠️  Dependencies manquantes, installation..."
    cd "$SERVER_DIR"
    npm install
fi

# Vérifier la configuration
if [ ! -f "$SERVER_DIR/.env" ]; then
    echo "   ⚠️  Fichier .env manquant, création depuis .env.example..."
    cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
    echo "   📝 Veuillez configurer NOTION_API_KEY dans $SERVER_DIR/.env"
fi

# Tuer les processus existants sur les ports 3000 et 8000
echo ""
echo "🧹 Nettoyage des processus existants..."
if check_port 3000; then
    echo "   - Arrêt du processus sur port 3000"
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
fi

if check_port 8000; then
    echo "   - Arrêt du processus sur port 8000"  
    kill -9 $(lsof -ti:8000) 2>/dev/null || true
fi

# Attendre que les ports se libèrent
echo "   - Attente libération des ports..."
wait_for_port 3000
wait_for_port 8000

echo ""
echo "🚀 Démarrage du serveur Node.js (API + Interface web)..."
cd "$SERVER_DIR"
export PORT=3000
export NODE_ENV=development
npm start > /tmp/nodejs-dashboard.log 2>&1 &
NODE_PID=$!

echo "   - PID Node.js: $NODE_PID"
echo "   - Logs: /tmp/nodejs-dashboard.log"
echo "   - Attente du démarrage..."

# Vérifier que Node.js démarre correctement
if check_server_health "http://localhost:3000/health"; then
    echo "   ✅ Serveur Node.js actif sur port 3000"
else
    echo "   ❌ Échec démarrage Node.js"
    echo "   📋 Logs d'erreur:"
    tail -20 /tmp/nodejs-dashboard.log
    exit 1
fi

echo ""
echo "🐍 Démarrage du serveur Python (Fichiers statiques)..."
cd "$PROJECT_DIR"
python3 -m http.server 8000 > /tmp/python-static.log 2>&1 &
PYTHON_PID=$!

echo "   - PID Python: $PYTHON_PID"
echo "   - Logs: /tmp/python-static.log"
echo "   - Attente du démarrage..."

# Vérifier que Python démarre correctement
if check_server_health "http://localhost:8000"; then
    echo "   ✅ Serveur Python actif sur port 8000"
else
    echo "   ❌ Échec démarrage Python"
    echo "   📋 Logs d'erreur:"
    tail -10 /tmp/python-static.log
    kill $NODE_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🔍 Vérification de la configuration..."

# Test de connectivité Notion
NOTION_STATUS=$(curl -s "http://localhost:3000/api/config/status" | grep -o '"ready":[^,]*' | cut -d':' -f2)
if [[ "$NOTION_STATUS" == *"true"* ]]; then
    echo "   ✅ Configuration Notion valide"
else
    echo "   ⚠️  Configuration Notion manquante - Fonctionnalité limitée"
fi

echo ""
echo "🎉 DÉMARRAGE TERMINÉ AVEC SUCCÈS !"
echo "=================================="
echo ""
echo "📊 DASHBOARD MULTI-RÔLES ACTIF"
echo "------------------------------"
echo "🌐 Interface principale: http://localhost:8000"
echo "🔧 API Node.js:         http://localhost:3000"
echo ""
echo "🎯 INTERFACES PAR RÔLE"
echo "----------------------"
echo "👤 Client:              http://localhost:8000/client/dashboard.html"
echo "🔧 Prestataire:         http://localhost:8000/prestataire/dashboard.html"
echo "🏪 Revendeur:           http://localhost:8000/revendeur/dashboard.html"
echo "⚙️  Superadmin:          http://localhost:8000/superadmin/dashboard.html"
echo ""
echo "🔍 MODULES SPÉCIALISÉS"
echo "----------------------"
echo "📄 OCR Premium:         http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html"
echo "💰 Finance:             http://localhost:8000/superadmin/finance/dashboard.html"
echo "📊 Analytics:           http://localhost:8000/superadmin/analytics/dashboard.html"
echo ""
echo "🛠️  OUTILS DÉVELOPPEMENT"
echo "------------------------"
echo "❤️  Health check:        http://localhost:3000/health"
echo "📋 Config status:       http://localhost:3000/api/config/status"
echo "🔐 Auth test:           http://localhost:3000/api/auth/me"
echo ""
echo "📝 GESTION DES PROCESSUS"
echo "------------------------"
echo "💡 Pour arrêter les serveurs:"
echo "   kill $NODE_PID $PYTHON_PID"
echo ""
echo "📁 PIDs sauvegardés dans:"
echo "NODE_PID=$NODE_PID" > /tmp/dashboard-pids.txt
echo "PYTHON_PID=$PYTHON_PID" >> /tmp/dashboard-pids.txt
echo "   /tmp/dashboard-pids.txt"
echo ""
echo "📋 Logs disponibles:"
echo "   Node.js: /tmp/nodejs-dashboard.log"  
echo "   Python:  /tmp/python-static.log"

# Ouvrir automatiquement l'interface principale
echo ""
echo "🌐 Ouverture de l'interface Dashboard..."
sleep 2
open "http://localhost:8000" 2>/dev/null || 
xdg-open "http://localhost:8000" 2>/dev/null ||
echo "📌 Ouvrez manuellement : http://localhost:8000"

# Script d'arrêt propre
create_stop_script() {
    cat > /tmp/stop-dashboard.sh << 'EOF'
#!/bin/bash
echo "🛑 Arrêt du Dashboard Client..."
if [ -f /tmp/dashboard-pids.txt ]; then
    source /tmp/dashboard-pids.txt
    if [ ! -z "$NODE_PID" ]; then
        kill $NODE_PID 2>/dev/null && echo "   ✅ Serveur Node.js arrêté"
    fi
    if [ ! -z "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null && echo "   ✅ Serveur Python arrêté"
    fi
    rm /tmp/dashboard-pids.txt
    echo "✅ Dashboard arrêté proprement"
else
    echo "❌ Fichier PIDs non trouvé"
fi
EOF
    chmod +x /tmp/stop-dashboard.sh
    echo "   Script d'arrêt: /tmp/stop-dashboard.sh"
}

create_stop_script

# Maintenir le script actif avec monitoring
echo ""
echo "⏳ SERVEURS ACTIFS - Monitoring en cours..."
echo "   Appuyez sur Ctrl+C pour arrêter proprement"
echo ""

# Trap pour arrêt propre
trap 'echo ""; echo "🛑 Arrêt demandé..."; kill $NODE_PID $PYTHON_PID 2>/dev/null; echo "✅ Serveurs arrêtés proprement"; rm -f /tmp/dashboard-pids.txt /tmp/stop-dashboard.sh; exit 0' INT TERM

# Monitoring des serveurs avec auto-restart basique
monitor_servers() {
    local check_interval=30
    local restart_attempts=0
    local max_restarts=3
    
    while true; do
        sleep $check_interval
        
        # Vérifier Node.js
        if ! check_port 3000; then
            echo "⚠️  Serveur Node.js arrêté détecté"
            if [ $restart_attempts -lt $max_restarts ]; then
                echo "🔄 Tentative de redémarrage ($((restart_attempts + 1))/$max_restarts)..."
                cd "$SERVER_DIR"
                npm start > /tmp/nodejs-dashboard.log 2>&1 &
                NODE_PID=$!
                restart_attempts=$((restart_attempts + 1))
            else
                echo "❌ Trop de redémarrages, arrêt du monitoring"
                break
            fi
        fi
        
        # Vérifier Python  
        if ! check_port 8000; then
            echo "⚠️  Serveur Python arrêté détecté"
            cd "$PROJECT_DIR"
            python3 -m http.server 8000 > /tmp/python-static.log 2>&1 &
            PYTHON_PID=$!
        fi
        
        # Affichage périodique du status
        if [ $(($(date +%s) % 300)) -eq 0 ]; then  # Toutes les 5 minutes
            echo "📊 Status: Node.js ✅ | Python ✅ | Uptime: $(uptime | awk '{print $3}' | sed 's/,//')"
        fi
    done
}

# Lancer le monitoring en arrière-plan
monitor_servers &
MONITOR_PID=$!

# Attendre indéfiniment
while true; do
    sleep 1
done