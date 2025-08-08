#!/bin/bash
# Script: verify-mcp-final.sh

echo "🔍 VÉRIFICATION FINALE MCP"
echo "=========================="

# Variables
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
REPORT_FILE="MCP_DIAGNOSTIC_REPORT.md"

# Générer un rapport complet
cat > "$REPORT_FILE" << EOF
# 📊 Rapport Diagnostic MCP - $(date)

## 1. Configuration Système
- OS: $(uname -s) $(uname -m)
- Docker: $(docker --version)
- Docker Compose: $(docker compose version)
- Node: $(node --version)
- NPM: $(npm --version)

## 2. État Claude Desktop
- Config Path: $CLAUDE_CONFIG
- Config Exists: $([ -f "$CLAUDE_CONFIG" ] && echo "✅ OUI" || echo "❌ NON")
- Config Size: $([ -f "$CLAUDE_CONFIG" ] && ls -lh "$CLAUDE_CONFIG" | awk '{print $5}' || echo "N/A")

## 3. MCP Servers Configurés
$(if [ -f "$CLAUDE_CONFIG" ]; then
    echo '```json'
    cat "$CLAUDE_CONFIG" | python3 -m json.tool | grep -A 3 '"docker"' || echo "Docker MCP non trouvé"
    echo '```'
else
    echo "Fichier config non trouvé"
fi)

## 4. Packages MCP Installés Globalement
\`\`\`
$(npm list -g --depth=0 2>/dev/null | grep -E "mcp|docker|model" || echo "Aucun package MCP global")
\`\`\`

## 5. Test NPX Docker MCP
\`\`\`
$(npx -y @modelcontextprotocol/server-docker --help 2>&1 | head -5 || echo "Erreur lors du test")
\`\`\`

## 6. Docker Status
### Containers actifs
\`\`\`
$(docker ps --format "table {{.Names}}\t{{.Status}}" | head -10)
\`\`\`

### Images Docker
\`\`\`
$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10)
\`\`\`

## 7. Permissions Docker Socket
\`\`\`
$(ls -la /var/run/docker.sock 2>/dev/null || echo "Docker socket non accessible")
$(groups | grep -o docker || echo "Utilisateur pas dans le groupe docker")
\`\`\`

## 8. Claude Desktop Logs (si disponible)
\`\`\`
$(find "$HOME/Library/Logs" -name "*claude*" -type f 2>/dev/null | head -5 || echo "Pas de logs Claude trouvés")
\`\`\`

## 9. Configuration Complète Claude
\`\`\`json
$(cat "$CLAUDE_CONFIG" 2>/dev/null | python3 -m json.tool || echo "{}")
\`\`\`

## 10. Checklist de Diagnostic

### ✅ Configuration ajoutée
- [x] Docker MCP ajouté à claude_desktop_config.json
- [x] Docker-advanced MCP ajouté pour debug

### 🔍 À vérifier manuellement
- [ ] Claude Desktop complètement fermé et relancé
- [ ] 'docker' visible dans Settings > Developer
- [ ] Peut exécuter des commandes Docker via Claude

### 📋 Solutions si ça ne fonctionne pas
1. **Si Docker MCP n'apparaît pas:**
   - Vérifier que Claude est bien fermé (ps aux | grep -i claude)
   - Supprimer le cache Claude: rm -rf ~/Library/Caches/Claude
   - Relancer Claude

2. **Si erreur "permission denied":**
   - sudo chmod 666 /var/run/docker.sock
   - Ou ajouter l'utilisateur au groupe docker

3. **Si erreur NPX:**
   - npm install -g npx
   - npm install -g @modelcontextprotocol/server-docker

## 11. Commandes de Test
Une fois Claude relancé avec Docker MCP:

1. "Liste tous les containers Docker"
2. "Montre-moi les images Docker"
3. "Exécute docker ps dans le terminal"

---
Rapport généré le $(date)
EOF

echo "✅ Rapport généré: $REPORT_FILE"
echo ""

# Afficher un résumé
echo "📊 RÉSUMÉ RAPIDE:"
echo "================="
echo ""

# Vérifier si Docker MCP est dans la config
if grep -q '"docker"' "$CLAUDE_CONFIG" 2>/dev/null; then
    echo "✅ Docker MCP est configuré"
    echo "✅ Docker-advanced MCP est configuré"
else
    echo "❌ Docker MCP n'est PAS dans la configuration"
fi

# Vérifier Docker
if docker ps >/dev/null 2>&1; then
    echo "✅ Docker fonctionne"
    echo "   $(docker ps -q | wc -l | xargs) containers actifs"
else
    echo "❌ Docker ne répond pas"
fi

# Vérifier NPX
if command -v npx >/dev/null 2>&1; then
    echo "✅ NPX est installé"
else
    echo "❌ NPX n'est pas installé"
fi

echo ""
echo "📋 ACTIONS FINALES:"
echo "=================="
echo "1. Fermez Claude Desktop (Cmd+Q)"
echo "2. Attendez 5 secondes"
echo "3. Relancez Claude Desktop"
echo "4. Allez dans Settings > Developer"
echo "5. Cherchez 'docker' dans la liste des MCP"
echo ""
echo "📤 Si ça ne fonctionne pas, partagez: $REPORT_FILE"