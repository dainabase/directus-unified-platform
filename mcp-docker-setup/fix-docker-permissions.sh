#!/bin/bash

echo "🔧 RÉPARATION DES PERMISSIONS DOCKER POUR MCP"
echo "============================================="

# 1. Vérifier les permissions actuelles
echo -e "\n📊 État actuel des permissions Docker:"
ls -la /var/run/docker.sock

# 2. Vérifier si l'utilisateur est dans le groupe docker
echo -e "\n👤 Groupes de l'utilisateur:"
groups
echo ""

# 3. Tester la connexion Docker
echo "🔍 Test de connexion Docker:"
if docker ps >/dev/null 2>&1; then
    echo "✅ Docker fonctionne correctement"
else
    echo "❌ Problème de connexion Docker"
    echo "Code erreur: $?"
fi

# 4. Tester avec curl direct
echo -e "\n🔍 Test du socket Docker avec curl:"
curl --unix-socket /var/run/docker.sock http://localhost/version 2>/dev/null | python3 -m json.tool | head -5 || echo "❌ Socket non accessible"

# 5. Solutions possibles
echo -e "\n💡 SOLUTIONS POSSIBLES:"
echo "========================================"

echo -e "\n1️⃣ Solution temporaire (redémarrage nécessaire):"
echo "   sudo chmod 666 /var/run/docker.sock"

echo -e "\n2️⃣ Solution permanente (recommandée):"
echo "   sudo dscl . append /Groups/docker GroupMembership $USER"
echo "   Puis déconnectez-vous et reconnectez-vous de macOS"

echo -e "\n3️⃣ Alternative Docker Desktop:"
echo "   Ouvrez Docker Desktop"
echo "   Settings > Advanced > Enable default Docker socket"

echo -e "\n4️⃣ Vérifier que Docker Desktop est lancé:"
ps aux | grep -i "docker desktop" | grep -v grep >/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Docker Desktop est en cours d'exécution"
else
    echo "   ❌ Docker Desktop n'est PAS lancé!"
    echo "   👉 Lancez Docker Desktop d'abord"
fi

# Créer un script de test pour Claude
cat > test-docker-mcp.js << 'EOF'
#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Test du MCP Docker Server\n');

// Tester la commande exacte utilisée par Claude
const mcp = spawn('npx', ['-y', '@modelcontextprotocol/server-docker'], {
  env: {
    ...process.env,
    DOCKER_HOST: 'unix:///var/run/docker.sock'
  }
});

mcp.stdout.on('data', (data) => {
  console.log(`✅ STDOUT: ${data}`);
});

mcp.stderr.on('data', (data) => {
  console.error(`❌ STDERR: ${data}`);
});

mcp.on('error', (error) => {
  console.error(`❌ Erreur: ${error.message}`);
});

mcp.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});

// Envoyer une commande de test après 2 secondes
setTimeout(() => {
  console.log('📤 Envoi commande test...');
  mcp.stdin.write('{"jsonrpc":"2.0","method":"list_containers","id":1}\n');
}, 2000);

// Terminer après 5 secondes
setTimeout(() => {
  mcp.kill();
}, 5000);
EOF

chmod +x test-docker-mcp.js

echo -e "\n📋 DIAGNOSTIC CRÉÉ"
echo "=================="
echo "Script de test créé: test-docker-mcp.js"
echo "Pour tester: node test-docker-mcp.js"

# Appliquer la solution temporaire si demandé
echo -e "\n❓ Voulez-vous appliquer la solution temporaire ? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
    echo "Application de la solution temporaire..."
    sudo chmod 666 /var/run/docker.sock
    echo "✅ Permissions modifiées"
    echo ""
    echo "⚠️  IMPORTANT: Cette solution est temporaire!"
    echo "Au prochain redémarrage, il faudra refaire la commande."
    echo ""
    echo "🔄 Maintenant:"
    echo "1. Fermez Claude Desktop (Cmd+Q)"
    echo "2. Relancez Claude Desktop"
    echo "3. Les MCP Docker devraient être connectés (point vert)"
fi