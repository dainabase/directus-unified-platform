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
