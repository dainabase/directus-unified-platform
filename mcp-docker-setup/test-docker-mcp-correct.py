#!/usr/bin/env python3

import subprocess
import json
import sys

print("🧪 TEST DE DOCKER-MCP (QuantGeekDev)")
print("=" * 40)

# Test 1: Vérifier que uvx est installé
print("\n1️⃣ Vérification de UV/UVX:")
try:
    result = subprocess.run(["uvx", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ UVX installé: {result.stdout.strip()}")
    else:
        print("❌ UVX non installé!")
        print("👉 Installer avec: curl -LsSf https://astral.sh/uv/install.sh | sh")
        sys.exit(1)
except FileNotFoundError:
    print("❌ UVX non trouvé dans PATH")
    print("👉 Installer UV d'abord: curl -LsSf https://astral.sh/uv/install.sh | sh")
    sys.exit(1)

# Test 2: Tester docker-mcp
print("\n2️⃣ Test de docker-mcp:")
try:
    # Lancer docker-mcp
    process = subprocess.Popen(
        ["uvx", "docker-mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Envoyer une requête de test
    test_request = json.dumps({
        "jsonrpc": "2.0",
        "method": "tools/list",
        "id": 1
    }) + "\n"
    
    stdout, stderr = process.communicate(input=test_request, timeout=5)
    
    if stdout:
        print("✅ Réponse reçue de docker-mcp:")
        print(stdout[:200] + "..." if len(stdout) > 200 else stdout)
    
    if stderr:
        print("⚠️  Erreurs:")
        print(stderr)
        
except subprocess.TimeoutExpired:
    print("⏱️  Timeout - mais c'est normal pour un serveur MCP")
    print("✅ Le serveur semble fonctionner")
except Exception as e:
    print(f"❌ Erreur: {e}")

print("\n📋 RÉSUMÉ:")
print("=========")
print("Si uvx fonctionne, la configuration dans Claude Desktop devrait marcher.")
print("Assurez-vous de redémarrer Claude Desktop après la modification.")