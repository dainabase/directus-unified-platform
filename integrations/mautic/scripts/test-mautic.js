const axios = require('axios');

async function testMautic() {
  try {
    const response = await axios.get('http://localhost:8084/api/contacts', {
      auth: {
        username: 'admin',
        password: 'Admin@Mautic2025'
      }
    });
    console.log('✅ API Mautic fonctionnelle');
    console.log('Nombre de contacts:', response.data.total || 0);
  } catch (error) {
    console.log('⚠️ API Mautic pas encore prête, setup manuel requis');
    console.log('Ouvrir http://localhost:8084 pour finaliser');
  }
}

testMautic();