const axios = require('axios');

const services = [
  { name: 'Frontend React', url: 'http://localhost:3000' },
  { name: 'Directus API', url: 'http://localhost:8055/server/health' },
  { name: 'PostgreSQL', checkCommand: 'docker ps | grep postgres' }
];

async function checkHealth() {
  console.log('🔍 Vérification de santé des services...\n');
  
  for (const service of services) {
    try {
      if (service.url) {
        const response = await axios.get(service.url, { timeout: 5000 });
        console.log(`✅ ${service.name}: OK (${response.status})`);
      } else if (service.checkCommand) {
        const { exec } = require('child_process');
        exec(service.checkCommand, (error) => {
          if (!error) {
            console.log(`✅ ${service.name}: OK`);
          } else {
            console.log(`❌ ${service.name}: DOWN`);
          }
        });
      }
    } catch (error) {
      console.log(`❌ ${service.name}: DOWN - ${error.message}`);
    }
  }
}

// Vérifier toutes les 30 secondes
checkHealth();
setInterval(checkHealth, 30000);