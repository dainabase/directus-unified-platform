#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VÉRIFICATION TOUS MCP
 * Vérifie que tous les serveurs MCP sont configurés et fonctionnels
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const CONFIG_PATH = path.join(process.env.HOME, 'Library/Application Support/Claude/claude_desktop_config.json');

console.log('🔍 VÉRIFICATION COMPLÈTE DES MCP');
console.log('=================================\n');

// Vérifier que le fichier config existe
if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Fichier claude_desktop_config.json introuvable');
    process.exit(1);
}

// Charger la configuration
let config;
try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    config = JSON.parse(configContent);
} catch (error) {
    console.error('❌ Erreur lecture config JSON:', error.message);
    process.exit(1);
}

// Vérifier la structure
if (!config.mcpServers) {
    console.error('❌ Section mcpServers manquante');
    process.exit(1);
}

const expectedMCPs = {
    'github': {
        description: 'GitHub - Gestion repositories et issues',
        requiredEnv: ['GITHUB_PERSONAL_ACCESS_TOKEN']
    },
    'directus': {
        description: 'Directus - Base de données unifiée',
        requiredEnv: ['DIRECTUS_URL', 'DIRECTUS_TOKEN']
    },
    'notion': {
        description: 'Notion - Documentation et notes',
        requiredEnv: ['NOTION_API_KEY']
    },
    'erpnext': {
        description: 'ERPNext - ERP et comptabilité',
        requiredEnv: ['ERPNEXT_URL', 'ERPNEXT_API_KEY', 'ERPNEXT_API_SECRET']
    }
};

let allGood = true;
let totalMCPs = 0;
let validMCPs = 0;

console.log('📋 VÉRIFICATION DES SERVEURS MCP\n');

for (const [mcpName, expectedConfig] of Object.entries(expectedMCPs)) {
    totalMCPs++;
    console.log(`🔧 ${mcpName.toUpperCase()} - ${expectedConfig.description}`);
    
    const mcpConfig = config.mcpServers[mcpName];
    
    if (!mcpConfig) {
        console.log(`   ❌ Configuration manquante`);
        allGood = false;
        continue;
    }
    
    // Vérifier command
    if (!mcpConfig.command) {
        console.log(`   ❌ Commande manquante`);
        allGood = false;
        continue;
    }
    
    console.log(`   ✅ Commande: ${mcpConfig.command}`);
    
    // Vérifier args
    if (!mcpConfig.args || !Array.isArray(mcpConfig.args)) {
        console.log(`   ❌ Arguments manquants`);
        allGood = false;
        continue;
    }
    
    console.log(`   ✅ Arguments: ${mcpConfig.args.join(' ')}`);
    
    // Vérifier variables d'environnement
    if (!mcpConfig.env) {
        console.log(`   ❌ Variables d'environnement manquantes`);
        allGood = false;
        continue;
    }
    
    let envOk = true;
    for (const requiredVar of expectedConfig.requiredEnv) {
        if (!mcpConfig.env[requiredVar]) {
            console.log(`   ❌ Variable ${requiredVar} manquante`);
            envOk = false;
            allGood = false;
        } else {
            const value = mcpConfig.env[requiredVar];
            const maskedValue = value.length > 10 ? 
                value.substring(0, 8) + '...' + value.substring(value.length - 4) :
                '***';
            console.log(`   ✅ ${requiredVar}: ${maskedValue}`);
        }
    }
    
    if (envOk) {
        validMCPs++;
        console.log(`   🎉 ${mcpName.toUpperCase()} - Configuration complète`);
    } else {
        console.log(`   ⚠️  ${mcpName.toUpperCase()} - Configuration incomplète`);
    }
    
    console.log('');
}

console.log('=================================');
console.log(`📊 RÉSUMÉ: ${validMCPs}/${totalMCPs} MCP configurés`);

if (allGood) {
    console.log('🎉 TOUS LES MCP SONT CONFIGURÉS !');
    console.log('\n⚠️  ACTION REQUISE:');
    console.log('   1. Redémarrer Claude Desktop');
    console.log('   2. Vérifier que les outils MCP apparaissent dans Claude');
    console.log('   3. Tester chaque intégration');
} else {
    console.log('❌ CERTAINS MCP ONT DES PROBLÈMES');
    console.log('\n🔧 À CORRIGER:');
    console.log('   1. Vérifier les tokens/clés manquants');
    console.log('   2. Valider la syntaxe JSON');
    console.log('   3. Relancer cette vérification');
}

console.log('\n📁 FICHIERS DE CONFIGURATION:');
console.log(`   Config: ${CONFIG_PATH}`);
console.log(`   Backup: ${CONFIG_PATH.replace('.json', '_backup_emergency.json')}`);

// Test final JSON
console.log('\n🧪 TEST SYNTAXE JSON...');
try {
    JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('   ✅ JSON valide');
} catch (error) {
    console.log('   ❌ JSON invalide:', error.message);
    allGood = false;
}

process.exit(allGood ? 0 : 1);