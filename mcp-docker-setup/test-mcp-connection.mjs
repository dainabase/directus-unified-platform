#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🧪 Test direct de la connexion MCP Docker\n');

// Test 1: Vérifier que le package est accessible
console.log('1️⃣ Test: Package MCP Docker accessible');
const testPackage = spawn('npx', ['-y', '@modelcontextprotocol/server-docker', '--version']);

testPackage.stdout.on('data', (data) => {
  console.log(`✅ Version: ${data}`);
});

testPackage.stderr.on('data', (data) => {
  console.error(`❌ Erreur package: ${data}`);
});

testPackage.on('close', (code) => {
  console.log(`Code sortie: ${code}\n`);
  
  if (code === 0) {
    // Test 2: Lancer le serveur MCP
    console.log('2️⃣ Test: Lancement du serveur MCP Docker');
    
    const mcp = spawn('npx', ['-y', '@modelcontextprotocol/server-docker'], {
      env: {
        ...process.env,
        DOCKER_HOST: 'unix:///var/run/docker.sock',
        DEBUG: 'true'
      }
    });

    let responseReceived = false;

    mcp.stdout.on('data', (data) => {
      console.log(`📥 MCP: ${data}`);
      responseReceived = true;
    });

    mcp.stderr.on('data', (data) => {
      console.error(`⚠️  MCP Error: ${data}`);
    });

    mcp.on('error', (error) => {
      console.error(`❌ Erreur spawn: ${error.message}`);
    });

    // Envoyer une requête JSON-RPC après 1 seconde
    setTimeout(() => {
      console.log('\n3️⃣ Test: Envoi requête list_tools');
      const request = JSON.stringify({
        jsonrpc: "2.0",
        method: "list_tools",
        id: 1
      }) + '\n';
      
      mcp.stdin.write(request);
    }, 1000);

    // Terminer après 3 secondes
    setTimeout(() => {
      if (!responseReceived) {
        console.log('\n❌ Aucune réponse reçue du serveur MCP');
        console.log('\n💡 Solutions possibles:');
        console.log('1. Vérifier les permissions: sudo chmod 666 /var/run/docker.sock');
        console.log('2. Relancer Docker Desktop');
        console.log('3. Utiliser la configuration docker-tcp dans Claude');
      } else {
        console.log('\n✅ Le serveur MCP fonctionne correctement!');
      }
      mcp.kill();
      process.exit(0);
    }, 3000);
  }
});