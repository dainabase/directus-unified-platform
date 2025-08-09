// Test basique de l'intégration Revolut
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.example') });

console.log('🧪 Test de l\'intégration Revolut...\n');

// Test 1: Chargement des modules
try {
  const authModule = await import('./api/auth.js');
  console.log('✅ Module auth.js chargé');
  
  const accountsModule = await import('./api/accounts.js');
  console.log('✅ Module accounts.js chargé');
  
  const transactionsModule = await import('./api/transactions.js');
  console.log('✅ Module transactions.js chargé');
  
  const webhooksModule = await import('./api/webhooks.js');
  console.log('✅ Module webhooks.js chargé');
} catch (error) {
  console.error('❌ Erreur chargement modules:', error.message);
  process.exit(1);
}

// Test 2: Vérification de la config
try {
  const companiesConfigRaw = fs.readFileSync('./config/companies.json', 'utf8');
  const companiesConfig = JSON.parse(companiesConfigRaw);
  const companies = Object.keys(companiesConfig.companies);
  console.log('\n📊 Entreprises configurées:', companies.join(', '));
  
  if (companies.length === 5) {
    console.log('✅ 5 entreprises configurées correctement');
  } else {
    console.log('⚠️ Attention: ' + companies.length + ' entreprises au lieu de 5');
  }
} catch (error) {
  console.error('❌ Erreur config:', error.message);
}

// Test 3: Structure des dossiers
const requiredDirs = ['api', 'sync', 'config', 'utils', 'tests', 'keys', 'logs'];
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));

if (missingDirs.length === 0) {
  console.log('\n✅ Toutes les structures de dossiers présentes');
} else {
  console.log('\n⚠️ Dossiers manquants:', missingDirs.join(', '));
}

console.log('\n🎉 Tests basiques terminés avec succès !');