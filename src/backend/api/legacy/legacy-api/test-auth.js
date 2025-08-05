/**
 * Script de test pour l'authentification sécurisée
 * Lance le serveur et teste les endpoints d'authentification
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 8001}/api`;

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testAuth() {
  console.log('\n🧪 Démarrage des tests d\'authentification...\n');

  // Test 1: Health check
  try {
    const health = await axios.get(`http://localhost:${process.env.PORT || 8001}/health`);
    log.success(`Health check OK: ${health.data.status}`);
  } catch (error) {
    log.error(`Health check échoué: ${error.message}`);
    return;
  }

  // Test 2: Login avec mauvais identifiants
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: 'inexistant@test.com',
      password: 'wrongpass'
    });
    log.error('Login avec mauvais identifiants aurait dû échouer');
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Login avec mauvais identifiants correctement refusé');
    } else {
      log.error(`Erreur inattendue: ${error.message}`);
    }
  }

  // Test 3: Login avec utilisateur test
  let token = null;
  try {
    // D'abord, lire le fichier des utilisateurs de test
    const fs = require('fs');
    let testUser = null;
    
    try {
      const testUsers = JSON.parse(fs.readFileSync('local-test-users.json', 'utf8'));
      testUser = testUsers[0]; // Premier utilisateur
      log.info(`Utilisateur test trouvé: ${testUser.email}`);
    } catch (e) {
      log.warn('Pas d\'utilisateurs de test locaux, utilisation des valeurs par défaut');
      // Utiliser les anciens mots de passe pour tester
      testUser = {
        email: 'client@hypervisual.ch',
        password: 'client123' // L'ancien mot de passe
      };
    }

    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResponse.data.success && loginResponse.data.token) {
      token = loginResponse.data.token;
      log.success(`Login réussi pour ${testUser.email}`);
      log.info(`Token JWT reçu: ${token.substring(0, 20)}...`);
      log.info(`Utilisateur: ${JSON.stringify(loginResponse.data.user, null, 2)}`);
    }
  } catch (error) {
    if (error.response?.data?.error?.includes('mise à jour de sécurité')) {
      log.warn('Les mots de passe doivent être migrés. Exécutez: npm run migrate-passwords');
    } else {
      log.error(`Login échoué: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 4: Accès route protégée sans token
  try {
    await axios.get(`${API_URL}/protected`);
    log.error('Accès sans token aurait dû échouer');
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Route protégée correctement bloquée sans token');
    } else {
      log.error(`Erreur inattendue: ${error.message}`);
    }
  }

  // Test 5: Accès route protégée avec token
  if (token) {
    try {
      const protectedResponse = await axios.get(`${API_URL}/protected`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      log.success('Accès route protégée avec token réussi');
      log.info(`Réponse: ${JSON.stringify(protectedResponse.data, null, 2)}`);
    } catch (error) {
      log.error(`Accès route protégée échoué: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 6: Vérification token
  if (token) {
    try {
      const verifyResponse = await axios.get(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      log.success('Vérification token réussie');
      log.info(`Utilisateur vérifié: ${JSON.stringify(verifyResponse.data.user, null, 2)}`);
    } catch (error) {
      log.error(`Vérification token échouée: ${error.response?.data?.error || error.message}`);
    }
  }

  // Test 7: Test rate limiting (5 tentatives rapides)
  log.info('\nTest du rate limiting (5 tentatives rapides)...');
  for (let i = 1; i <= 6; i++) {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'test@rate-limit.com',
        password: 'wrongpass'
      });
      log.warn(`Tentative ${i}/6 - Pas de rate limiting`);
    } catch (error) {
      if (error.response?.status === 429) {
        log.success(`Rate limiting activé après ${i} tentatives`);
        break;
      } else if (i === 6) {
        log.error('Rate limiting non activé après 6 tentatives');
      }
    }
  }

  // Test 8: Mot de passe oublié
  try {
    const forgotResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: 'client@hypervisual.ch'
    });
    if (forgotResponse.data.success) {
      log.success('Endpoint forgot-password fonctionne');
      log.info(forgotResponse.data.message);
    }
  } catch (error) {
    log.error(`Forgot password échoué: ${error.response?.data?.error || error.message}`);
  }

  console.log('\n✨ Tests terminés!\n');
}

// Attendre que le serveur soit prêt
setTimeout(() => {
  testAuth().catch(console.error);
}, 2000);

// Instructions
console.log(`
📋 Instructions pour tester l'authentification:

1. Dans un terminal, démarrer le serveur:
   cd server
   npm run dev

2. Dans un autre terminal, exécuter ce test:
   node test-auth.js

3. Si les mots de passe ne sont pas migrés:
   npm run migrate-passwords

4. Pour voir les nouveaux mots de passe:
   cat .migration-passwords.txt
`);