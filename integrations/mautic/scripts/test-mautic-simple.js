const axios = require('axios');

async function testMautic() {
  console.log('🧪 Test simple de Mautic...\n');
  
  try {
    // Test 1: Accès général
    console.log('1️⃣ Test d\'accès général...');
    const response = await axios.get('http://localhost:8084', {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    if (response.status === 302) {
      console.log('✅ Mautic répond (redirection vers installeur)');
      console.log(`   Location: ${response.headers.location || 'Non définie'}`);
    } else {
      console.log('✅ Mautic répond avec status:', response.status);
    }
    
    // Test 2: Page d'installation
    console.log('\n2️⃣ Test page d\'installation...');
    const installerResponse = await axios.get('http://localhost:8084/installer');
    
    if (installerResponse.data.includes('Mautic Installation')) {
      console.log('✅ Page d\'installation accessible');
      console.log('   Titre trouvé: "Mautic Installation"');
    } else if (installerResponse.data.includes('Redirecting to')) {
      console.log('✅ Installation probablement terminée (redirection)');
    } else {
      console.log('⚠️ Réponse inattendue de l\'installeur');
    }
    
    // Test 3: Containers Docker
    console.log('\n3️⃣ Vérification des containers...');
    console.log('   Utilisez: docker ps | grep mautic');
    
    console.log('\n📊 Résumé:');
    console.log('🔗 URL Mautic : http://localhost:8084');
    console.log('📝 Pour finaliser l\'installation :');
    console.log('   1. Ouvrir http://localhost:8084 dans un navigateur');
    console.log('   2. Suivre l\'assistant d\'installation');
    console.log('   3. Utiliser les paramètres DB:');
    console.log('      - Host: mautic-db');
    console.log('      - Port: 3306');
    console.log('      - Database: mautic');
    console.log('      - User: mautic');
    console.log('      - Password: mautic_secure_2025');
    console.log('   4. Créer l\'admin avec:');
    console.log('      - Username: admin');
    console.log('      - Password: Admin@Mautic2025');
    console.log('      - Email: admin@superadmin.com');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Solutions possibles:');
      console.log('   1. Vérifier que les containers sont démarrés:');
      console.log('      docker ps | grep mautic');
      console.log('   2. Redémarrer Mautic:');
      console.log('      docker-compose restart');
    }
  }
}

testMautic();