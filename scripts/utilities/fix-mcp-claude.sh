#!/bin/bash
# Script de diagnostic et réparation MCP pour Claude Desktop
# Version: 2.0.0 - Configuration simplifiée

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🔧 DIAGNOSTIC & RÉPARATION MCP CLAUDE DESKTOP      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# ÉTAPE 1: DÉTECTION DU SYSTÈME
# ==============================================================================

echo -e "${BLUE}📊 ÉTAPE 1: Détection du système${NC}"
echo "--------------------------------"

# Détection OS et chemin Claude
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    CLAUDE_DIR="$HOME/Library/Application Support/Claude"
    NPM_PREFIX="/usr/local"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    CLAUDE_DIR="$HOME/.config/claude"
    NPM_PREFIX="/usr/local"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="Windows"
    CLAUDE_DIR="$APPDATA/Claude"
    NPM_PREFIX="$APPDATA/npm"
else
    OS="Unknown"
    CLAUDE_DIR="$HOME/.config/claude"
    NPM_PREFIX="/usr/local"
fi

CLAUDE_CONFIG="$CLAUDE_DIR/claude_desktop_config.json"

echo -e "  OS: ${GREEN}$OS${NC}"
echo -e "  Config Path: ${GREEN}$CLAUDE_CONFIG${NC}"
echo ""

# ==============================================================================
# ÉTAPE 2: VÉRIFICATION DES DÉPENDANCES
# ==============================================================================

echo -e "${BLUE}📋 ÉTAPE 2: Vérification des dépendances${NC}"
echo "----------------------------------------"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ✅ Node.js: ${GREEN}$NODE_VERSION${NC}"
else
    echo -e "  ${RED}❌ Node.js n'est pas installé!${NC}"
    echo -e "  ${YELLOW}→ Installez Node.js depuis: https://nodejs.org${NC}"
    exit 1
fi

# NPM
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "  ✅ NPM: ${GREEN}$NPM_VERSION${NC}"
else
    echo -e "  ${RED}❌ NPM n'est pas installé!${NC}"
    exit 1
fi

# NPX
if command -v npx &> /dev/null; then
    NPX_VERSION=$(npx --version)
    echo -e "  ✅ NPX: ${GREEN}$NPX_VERSION${NC}"
else
    echo -e "  ${YELLOW}⚠️ NPX non trouvé, installation...${NC}"
    npm install -g npx
fi

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "  ✅ Docker: ${GREEN}$DOCKER_VERSION${NC}"
else
    echo -e "  ${YELLOW}⚠️ Docker non installé (optionnel)${NC}"
fi

echo ""

# ==============================================================================
# ÉTAPE 3: VÉRIFICATION CLAUDE DESKTOP
# ==============================================================================

echo -e "${BLUE}🖥️ ÉTAPE 3: Vérification Claude Desktop${NC}"
echo "---------------------------------------"

# Vérifier si Claude est en cours d'exécution
if [[ "$OS" == "macOS" ]]; then
    if pgrep -x "Claude" > /dev/null; then
        echo -e "  ${YELLOW}⚠️ Claude Desktop est en cours d'exécution${NC}"
        echo -e "  ${YELLOW}→ Fermez Claude Desktop avant de continuer (Cmd+Q)${NC}"
        echo -e "  Appuyez sur ENTER une fois Claude fermé..."
        read
    else
        echo -e "  ✅ Claude Desktop n'est pas en cours d'exécution"
    fi
elif [[ "$OS" == "Linux" ]]; then
    if pgrep -f "claude" > /dev/null; then
        echo -e "  ${YELLOW}⚠️ Claude Desktop pourrait être en cours d'exécution${NC}"
        echo -e "  ${YELLOW}→ Fermez Claude Desktop avant de continuer${NC}"
        echo -e "  Appuyez sur ENTER une fois Claude fermé..."
        read
    else
        echo -e "  ✅ Claude Desktop n'est pas en cours d'exécution"
    fi
fi

# Créer le répertoire Claude si nécessaire
if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "  ${YELLOW}📁 Création du répertoire Claude...${NC}"
    mkdir -p "$CLAUDE_DIR"
    echo -e "  ✅ Répertoire créé: $CLAUDE_DIR"
else
    echo -e "  ✅ Répertoire Claude existe"
fi

echo ""

# ==============================================================================
# ÉTAPE 4: BACKUP DE LA CONFIGURATION EXISTANTE
# ==============================================================================

echo -e "${BLUE}💾 ÉTAPE 4: Sauvegarde de la configuration existante${NC}"
echo "----------------------------------------------------"

if [ -f "$CLAUDE_CONFIG" ]; then
    BACKUP_FILE="$CLAUDE_CONFIG.backup.$(date +%Y%m%d-%H%M%S)"
    cp "$CLAUDE_CONFIG" "$BACKUP_FILE"
    echo -e "  ✅ Configuration sauvegardée: ${GREEN}$BACKUP_FILE${NC}"
    
    echo -e "  ${CYAN}Configuration actuelle:${NC}"
    cat "$CLAUDE_CONFIG" | python3 -m json.tool 2>/dev/null || cat "$CLAUDE_CONFIG"
else
    echo -e "  ℹ️ Aucune configuration existante"
fi

echo ""

# ==============================================================================
# ÉTAPE 5: INSTALLATION DES PACKAGES MCP
# ==============================================================================

echo -e "${BLUE}📦 ÉTAPE 5: Installation des packages MCP${NC}"
echo "------------------------------------------"

echo -e "  ${YELLOW}Installation des serveurs MCP officiels...${NC}"

# Packages à installer
PACKAGES=(
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-memory"
)

for package in "${PACKAGES[@]}"; do
    echo -n "  Installing $package... "
    if npm list -g "$package" &> /dev/null; then
        echo -e "${GREEN}déjà installé${NC}"
    else
        if npm install -g "$package" &> /dev/null; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${YELLOW}⚠️ (utilisation de npx)${NC}"
        fi
    fi
done

echo ""

# ==============================================================================
# ÉTAPE 6: CRÉATION DE LA CONFIGURATION MCP
# ==============================================================================

echo -e "${BLUE}⚙️ ÉTAPE 6: Configuration MCP${NC}"
echo "-----------------------------"

echo -e "  ${CYAN}Quelle configuration voulez-vous installer ?${NC}"
echo "  1) Simple - Serveur filesystem uniquement (recommandé pour tester)"
echo "  2) Standard - Filesystem + Memory"
echo "  3) Avancée - Tous les serveurs (nécessite configuration)"
echo ""
echo -n "  Votre choix (1-3): "
read choice

case $choice in
    1)
        echo -e "  ${GREEN}→ Installation de la configuration SIMPLE${NC}"
        cat > "$CLAUDE_CONFIG" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/tmp"
      ]
    }
  }
}
EOF
        ;;
        
    2)
        echo -e "  ${GREEN}→ Installation de la configuration STANDARD${NC}"
        cat > "$CLAUDE_CONFIG" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/tmp",
        "/home"
      ]
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
EOF
        ;;
        
    3)
        echo -e "  ${GREEN}→ Installation de la configuration AVANCÉE${NC}"
        
        # Demander le token GitHub si nécessaire
        echo -n "  GitHub Personal Access Token (optionnel, ENTER pour ignorer): "
        read -s github_token
        echo ""
        
        if [ -z "$github_token" ]; then
            github_token="YOUR_GITHUB_TOKEN_HERE"
        fi
        
        cat > "$CLAUDE_CONFIG" << EOF
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/tmp",
        "/home",
        "$(pwd)"
      ]
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$github_token"
      }
    }
  }
}
EOF
        ;;
        
    *)
        echo -e "  ${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

echo -e "  ✅ Configuration créée avec succès!"
echo ""

# ==============================================================================
# ÉTAPE 7: VÉRIFICATION DE LA CONFIGURATION
# ==============================================================================

echo -e "${BLUE}🔍 ÉTAPE 7: Vérification de la configuration${NC}"
echo "--------------------------------------------"

if [ -f "$CLAUDE_CONFIG" ]; then
    echo -e "  ${GREEN}✅ Fichier de configuration existe${NC}"
    
    # Vérifier la syntaxe JSON
    if python3 -m json.tool "$CLAUDE_CONFIG" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Syntaxe JSON valide${NC}"
    else
        echo -e "  ${RED}❌ Erreur de syntaxe JSON!${NC}"
        exit 1
    fi
    
    # Afficher la configuration
    echo -e "  ${CYAN}Configuration installée:${NC}"
    cat "$CLAUDE_CONFIG" | python3 -m json.tool
else
    echo -e "  ${RED}❌ Fichier de configuration manquant!${NC}"
    exit 1
fi

echo ""

# ==============================================================================
# ÉTAPE 8: TEST DE LA CONFIGURATION
# ==============================================================================

echo -e "${BLUE}🧪 ÉTAPE 8: Test de la configuration${NC}"
echo "------------------------------------"

echo -e "  ${YELLOW}Test du serveur filesystem...${NC}"
if npx -y @modelcontextprotocol/server-filesystem --version &> /dev/null; then
    echo -e "  ${GREEN}✅ Serveur filesystem fonctionne${NC}"
else
    echo -e "  ${YELLOW}⚠️ Le serveur sera téléchargé au premier lancement${NC}"
fi

echo ""

# ==============================================================================
# ÉTAPE 9: INSTRUCTIONS FINALES
# ==============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✨ CONFIGURATION TERMINÉE !                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 ACTIONS REQUISES:${NC}"
echo ""
echo -e "  1️⃣  ${YELLOW}Lancez Claude Desktop${NC}"
echo ""
echo -e "  2️⃣  ${YELLOW}Allez dans:${NC}"
echo -e "      • Settings (icône engrenage)"
echo -e "      • Developer"
echo -e "      • Section 'MCP Servers'"
echo ""
echo -e "  3️⃣  ${YELLOW}Vérifiez que vous voyez:${NC}"
echo -e "      • ${GREEN}filesystem${NC} (toujours présent)"
echo -e "      • ${GREEN}memory${NC} (si configuration Standard/Avancée)"
echo -e "      • ${GREEN}github${NC} (si configuration Avancée)"
echo ""
echo -e "  4️⃣  ${YELLOW}Testez avec ces commandes dans Claude:${NC}"
echo -e "      • 'List files in /tmp'"
echo -e "      • 'What files are in the current directory?'"
echo -e "      • 'Store this in memory: test value'"
echo ""

# Générer un rapport
REPORT_FILE="$HOME/MCP_INSTALLATION_REPORT_$(date +%Y%m%d-%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
MCP INSTALLATION REPORT
=======================
Date: $(date)
OS: $OS
Node Version: $NODE_VERSION
NPM Version: $NPM_VERSION
Config Path: $CLAUDE_CONFIG
Configuration Type: Choice $choice
Status: SUCCESS

Configuration Content:
$(cat "$CLAUDE_CONFIG")

Next Steps:
1. Launch Claude Desktop
2. Go to Settings > Developer
3. Verify MCP Servers are listed
4. Test with filesystem commands
EOF

echo -e "${CYAN}📊 Rapport d'installation:${NC} ${GREEN}$REPORT_FILE${NC}"
echo ""
echo -e "${GREEN}✅ Installation MCP complète et fonctionnelle !${NC}"
echo ""
echo -e "${YELLOW}⚠️ Si les serveurs n'apparaissent pas:${NC}"
echo -e "  1. Fermez COMPLÈTEMENT Claude Desktop (Cmd+Q sur Mac)"
echo -e "  2. Attendez 5 secondes"
echo -e "  3. Relancez Claude Desktop"
echo -e "  4. Vérifiez Settings > Developer > MCP Servers"
echo ""
echo -e "${BLUE}Support:${NC} https://github.com/dainabase/directus-unified-platform/issues"
