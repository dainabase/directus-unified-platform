const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:8055';
const JMD_EMAIL = 'jmd@hypervisual.ch';
const JMD_PASSWORD = 'Spiral74@#';

// Test configuration pour tous les types de tokens
const TOKEN_TESTS = [
    {
        name: 'Static Admin Token',
        token: 'Gy1qvOikJ-IxDIHRot8YDdAm_XJ8S5A0',
        type: 'static',
        description: 'Token administrateur statique pour JMD'
    },
    {
        name: 'Static App Token',
        token: 'app-token-12345',
        type: 'static',
        description: 'Token applicatif pour le dashboard'
    },
    {
        name: 'Dynamic Auth Token',
        type: 'dynamic',
        description: 'Token obtenu via login',
        needsAuth: true
    }
];

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Fonction pour logger avec couleurs
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fonction pour obtenir un token dynamique
async function getAuthToken() {
    try {
        log('\n🔐 Tentative de connexion avec JMD...', 'cyan');
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: JMD_EMAIL,
            password: JMD_PASSWORD
        });
        
        const { access_token, refresh_token, expires } = response.data.data;
        log(`✅ Connexion réussie!`, 'green');
        log(`   Token: ${access_token.substring(0, 20)}...`, 'bright');
        log(`   Expiration: ${expires}ms`, 'bright');
        
        return {
            access_token,
            refresh_token,
            expires
        };
    } catch (error) {
        log(`❌ Erreur de connexion: ${error.message}`, 'red');
        return null;
    }
}

// Fonction pour tester un token
async function testToken(token, description) {
    const tests = [
        {
            name: 'Server Info',
            endpoint: '/server/info',
            requiresAuth: false
        },
        {
            name: 'Users List',
            endpoint: '/users',
            requiresAuth: true
        },
        {
            name: 'Collections List',
            endpoint: '/collections',
            requiresAuth: true
        },
        {
            name: 'Owner Companies',
            endpoint: '/items/owner_companies',
            requiresAuth: true
        },
        {
            name: 'Projects',
            endpoint: '/items/projects?limit=5',
            requiresAuth: true
        },
        {
            name: 'Deliverables',
            endpoint: '/items/deliverables?limit=5',
            requiresAuth: true
        },
        {
            name: 'Permissions',
            endpoint: '/permissions',
            requiresAuth: true
        },
        {
            name: 'Activity',
            endpoint: '/activity?limit=5',
            requiresAuth: true
        }
    ];
    
    log(`\n🧪 Test du token: ${description}`, 'blue');
    log(`   Token: ${token.substring(0, 20)}...`, 'bright');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const test of tests) {
        try {
            const config = {
                headers: test.requiresAuth ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            };
            
            const response = await axios.get(`${BASE_URL}${test.endpoint}`, config);
            
            // Vérifier le succès
            if (response.status === 200 && response.data) {
                log(`   ✅ ${test.name}: OK (${response.data.data ? response.data.data.length : 'success'} items)`, 'green');
                successCount++;
            } else {
                log(`   ⚠️  ${test.name}: Status ${response.status}`, 'yellow');
                failCount++;
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.errors?.[0]?.message || error.message;
                
                if (status === 403 && test.requiresAuth) {
                    log(`   ⛔ ${test.name}: Accès refusé (403) - ${message}`, 'yellow');
                } else if (status === 401 && test.requiresAuth) {
                    log(`   🔒 ${test.name}: Non autorisé (401) - Token invalide ou expiré`, 'red');
                } else {
                    log(`   ❌ ${test.name}: Erreur ${status} - ${message}`, 'red');
                }
            } else {
                log(`   ❌ ${test.name}: Erreur réseau - ${error.message}`, 'red');
            }
            failCount++;
        }
    }
    
    // Résumé
    log(`\n📊 Résumé:`, 'cyan');
    log(`   ✅ Succès: ${successCount}/${tests.length}`, successCount === tests.length ? 'green' : 'yellow');
    log(`   ❌ Échecs: ${failCount}/${tests.length}`, failCount > 0 ? 'red' : 'green');
    
    return {
        token: token.substring(0, 20) + '...',
        description,
        successCount,
        failCount,
        totalTests: tests.length
    };
}

// Fonction pour sauvegarder le meilleur token
function saveBestToken(token, results) {
    const tokenFile = path.join(__dirname, '.best-token');
    const tokenInfo = {
        token,
        timestamp: new Date().toISOString(),
        results,
        description: 'Token avec le meilleur taux de succès'
    };
    
    fs.writeFileSync(tokenFile, token, 'utf8');
    fs.writeFileSync(tokenFile + '.json', JSON.stringify(tokenInfo, null, 2), 'utf8');
    
    log(`\n💾 Meilleur token sauvegardé dans .best-token`, 'cyan');
}

// Fonction principale
async function main() {
    log('='.repeat(60), 'bright');
    log('🔍 TEST DE TOUS LES TOKENS DIRECTUS', 'bright');
    log('='.repeat(60), 'bright');
    
    const results = [];
    let bestToken = null;
    let bestScore = 0;
    
    // Test des tokens statiques
    for (const config of TOKEN_TESTS) {
        if (config.type === 'static') {
            const result = await testToken(config.token, config.description);
            results.push(result);
            
            if (result.successCount > bestScore) {
                bestScore = result.successCount;
                bestToken = config.token;
            }
        }
    }
    
    // Test du token dynamique
    const authData = await getAuthToken();
    if (authData) {
        const result = await testToken(authData.access_token, 'Token dynamique via login');
        results.push(result);
        
        if (result.successCount > bestScore) {
            bestScore = result.successCount;
            bestToken = authData.access_token;
        }
    }
    
    // Afficher le résumé final
    log('\n' + '='.repeat(60), 'bright');
    log('📈 RÉSUMÉ FINAL', 'bright');
    log('='.repeat(60), 'bright');
    
    results.forEach(result => {
        const successRate = (result.successCount / result.totalTests * 100).toFixed(0);
        const color = successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red';
        log(`\n${result.description}:`, 'cyan');
        log(`   Token: ${result.token}`, 'bright');
        log(`   Taux de succès: ${successRate}% (${result.successCount}/${result.totalTests})`, color);
    });
    
    // Sauvegarder le meilleur token
    if (bestToken) {
        const bestResult = results.find(r => r.token === bestToken.substring(0, 20) + '...');
        log('\n' + '='.repeat(60), 'bright');
        log(`🏆 MEILLEUR TOKEN: ${bestResult.description}`, 'green');
        log(`   Taux de succès: ${(bestResult.successCount / bestResult.totalTests * 100).toFixed(0)}%`, 'green');
        saveBestToken(bestToken, bestResult);
    }
    
    log('\n' + '='.repeat(60), 'bright');
    log('✅ Tests terminés!', 'green');
    log('='.repeat(60), 'bright');
}

// Exécution
main().catch(error => {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
});