/**
 * Script de configuration automatique pour le module OCR
 * Configure l'environnement optimal pour l'OCR avec Notion
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { execSync } = require('child_process');

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}
╔═══════════════════════════════════════╗
║  🚀 Configuration OCR Dashboard       ║
║     Version 2.2.0                     ║
╚═══════════════════════════════════════╝
${colors.reset}`);

// Configuration par défaut
const DEFAULT_CONFIG = {
    PORT: 3000,
    NODE_ENV: 'development',
    ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:8000,http://localhost:8080',
    JWT_SECRET: 'ocr-dev-secret-' + Math.random().toString(36).substring(7),
    JWT_EXPIRES_IN: '24h',
    NOTION_API_KEY: process.env.NOTION_API_KEY || '',
    NOTION_API_VERSION: '2022-06-28'
};

// Chemins
const ENV_PATH = path.join(__dirname, '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '.env.example');
const ENV_OCR_PATH = path.join(__dirname, '.env.ocr');

/**
 * Vérifie si un port est disponible
 */
function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}

/**
 * Trouve un port disponible
 */
async function findAvailablePort(preferredPort) {
    const portsToTry = [preferredPort, 3000, 3001, 8001, 8080];
    
    for (const port of portsToTry) {
        const isAvailable = await checkPort(port);
        if (isAvailable) {
            return port;
        }
    }
    
    // Si aucun port prédéfini n'est disponible, chercher un port aléatoire
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(0, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
    });
}

/**
 * Crée ou met à jour le fichier .env
 */
async function setupEnvironment() {
    console.log(`\n${colors.blue}📋 Configuration de l'environnement...${colors.reset}`);
    
    let envConfig = { ...DEFAULT_CONFIG };
    let existingConfig = {};
    
    // Lire la configuration existante si disponible
    if (fs.existsSync(ENV_PATH)) {
        console.log(`${colors.yellow}  ↳ Fichier .env existant détecté${colors.reset}`);
        const envContent = fs.readFileSync(ENV_PATH, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                existingConfig[key.trim()] = value.trim();
            }
        });
        envConfig = { ...envConfig, ...existingConfig };
    }
    
    // Vérifier le port disponible
    console.log(`\n${colors.blue}🔍 Vérification des ports...${colors.reset}`);
    const preferredPort = parseInt(envConfig.PORT) || 3000;
    const availablePort = await findAvailablePort(preferredPort);
    
    if (availablePort !== preferredPort) {
        console.log(`${colors.yellow}  ⚠️  Port ${preferredPort} occupé, utilisation du port ${availablePort}${colors.reset}`);
        envConfig.PORT = availablePort;
    } else {
        console.log(`${colors.green}  ✅ Port ${availablePort} disponible${colors.reset}`);
    }
    
    // Vérifier la clé API Notion
    if (!envConfig.NOTION_API_KEY) {
        console.log(`\n${colors.yellow}⚠️  Clé API Notion manquante!${colors.reset}`);
        console.log(`${colors.cyan}  💡 Pour configurer:${colors.reset}`);
        console.log(`     1. Récupérez votre clé sur: https://www.notion.so/my-integrations`);
        console.log(`     2. Ajoutez-la dans le fichier .env: NOTION_API_KEY=votre_clé_ici`);
        console.log(`     3. Ou utilisez la clé de test par défaut (limitée)`);
        
        // Leave NOTION_API_KEY empty — user must provide their own key via .env
        envConfig.NOTION_API_KEY = process.env.NOTION_API_KEY || '';
        console.log(`\n${colors.yellow}  ⚠️  NOTION_API_KEY non configurée. Ajoutez-la dans .env pour activer Notion.${colors.reset}`);
    }
    
    // Créer le contenu du fichier .env
    const envContent = Object.entries(envConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    // Sauvegarder les fichiers
    fs.writeFileSync(ENV_PATH, envContent);
    console.log(`${colors.green}  ✅ Fichier .env créé/mis à jour${colors.reset}`);
    
    // Créer aussi .env.ocr pour référence
    fs.writeFileSync(ENV_OCR_PATH, envContent);
    console.log(`${colors.green}  ✅ Fichier .env.ocr créé${colors.reset}`);
    
    return envConfig;
}

/**
 * Vérifie les dépendances npm
 */
function checkDependencies() {
    console.log(`\n${colors.blue}📦 Vérification des dépendances...${colors.reset}`);
    
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
        console.log(`${colors.yellow}  ⚠️  Dépendances manquantes, installation en cours...${colors.reset}`);
        try {
            execSync('npm install', { stdio: 'inherit', cwd: __dirname });
            console.log(`${colors.green}  ✅ Dépendances installées${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}  ❌ Erreur installation: ${error.message}${colors.reset}`);
            process.exit(1);
        }
    } else {
        console.log(`${colors.green}  ✅ Dépendances OK${colors.reset}`);
    }
}

/**
 * Teste la connexion à Notion
 */
async function testNotionConnection(apiKey) {
    console.log(`\n${colors.blue}🔗 Test de connexion Notion...${colors.reset}`);
    
    try {
        const fetch = require('node-fetch');
        const response = await fetch('https://api.notion.com/v1/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': '2022-06-28'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`${colors.green}  ✅ Connexion Notion OK${colors.reset}`);
            console.log(`${colors.cyan}  👤 Utilisateur: ${data.name || 'API User'}${colors.reset}`);
            return true;
        } else {
            console.log(`${colors.yellow}  ⚠️  Connexion Notion échouée (${response.status})${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.yellow}  ⚠️  Test connexion ignoré (fetch non disponible)${colors.reset}`);
        return true; // On continue quand même
    }
}

/**
 * Affiche les instructions de démarrage
 */
function displayStartInstructions(config) {
    console.log(`\n${colors.green}${colors.bright}✅ Configuration terminée!${colors.reset}`);
    console.log(`\n${colors.cyan}📍 Configuration serveur:${colors.reset}`);
    console.log(`   • Port: ${config.PORT}`);
    console.log(`   • Environnement: ${config.NODE_ENV}`);
    console.log(`   • CORS autorisés: ${config.ALLOWED_ORIGINS}`);
    
    console.log(`\n${colors.cyan}🚀 Pour démarrer l'OCR:${colors.reset}`);
    console.log(`   ${colors.bright}npm run ocr${colors.reset}`);
    console.log(`   ou`);
    console.log(`   ${colors.bright}npm start${colors.reset}`);
    
    console.log(`\n${colors.cyan}🌐 URLs d'accès:${colors.reset}`);
    console.log(`   • OCR: ${colors.bright}http://localhost:${config.PORT}/superadmin/finance/ocr-premium-dashboard-fixed.html${colors.reset}`);
    console.log(`   • API: ${colors.bright}http://localhost:${config.PORT}/api/notion${colors.reset}`);
    console.log(`   • Health: ${colors.bright}http://localhost:${config.PORT}/health${colors.reset}`);
    
    console.log(`\n${colors.yellow}💡 Conseils:${colors.reset}`);
    console.log(`   • Si le port ${config.PORT} est occupé, le serveur trouvera automatiquement un port libre`);
    console.log(`   • Vérifiez le statut avec: ${colors.bright}http://localhost:${config.PORT}/api/config/status${colors.reset}`);
    console.log(`   • Les logs sont dans: ${colors.bright}server.log${colors.reset}`);
    
    console.log(`\n${colors.bright}═══════════════════════════════════════${colors.reset}\n`);
}

/**
 * Fonction principale
 */
async function main() {
    try {
        // 1. Configurer l'environnement
        const config = await setupEnvironment();
        
        // 2. Vérifier les dépendances
        checkDependencies();
        
        // 3. Tester la connexion Notion
        await testNotionConnection(config.NOTION_API_KEY);
        
        // 4. Afficher les instructions
        displayStartInstructions(config);
        
        // 5. Créer/mettre à jour package.json scripts
        const packagePath = path.join(__dirname, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            if (!packageJson.scripts) packageJson.scripts = {};
            
            // Ajouter le script OCR s'il n'existe pas
            if (!packageJson.scripts.ocr) {
                packageJson.scripts.ocr = 'node setup-ocr.js && npm start';
                fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                console.log(`${colors.green}✅ Script 'npm run ocr' ajouté${colors.reset}`);
            }
        }
        
    } catch (error) {
        console.error(`\n${colors.red}❌ Erreur configuration: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Lancer la configuration
main();