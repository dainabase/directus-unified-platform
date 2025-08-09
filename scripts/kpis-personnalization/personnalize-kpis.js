import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

// Configuration
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Créer le client axios
const client = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Configuration des entreprises avec leurs métriques spécifiques
const COMPANIES_CONFIG = {
  HYPERVISUAL: {
    name: 'HYPERVISUAL Studio Créatif',
    sector: 'Creative Studio',
    metrics: {
      ARR: { base: 1200000, growth: 0.15, volatility: 0.05 },
      MRR: { base: 100000, growth: 0.15, volatility: 0.05 },
      NPS: { base: 82, growth: 0.01, volatility: 0.02 },
      CASH_RUNWAY: { base: 24, growth: -0.02, volatility: 0.1 },
      EBITDA_MARGIN: { base: 28, growth: 0.02, volatility: 0.03 },
      LTV_CAC: { base: 4.2, growth: 0.03, volatility: 0.1 },
      ACTIVE_PROJECTS: { base: 45, growth: 0.05, volatility: 0.15 },
      CLIENT_RETENTION: { base: 92, growth: 0.01, volatility: 0.02 },
      PIPELINE_VALUE: { base: 450000, growth: 0.1, volatility: 0.2 },
      TEAM_PRODUCTIVITY: { base: 85, growth: 0.02, volatility: 0.05 }
    }
  },
  DAINAMICS: {
    name: 'DAINAMICS Solutions Tech',
    sector: 'Technology',
    metrics: {
      ARR: { base: 850000, growth: 0.25, volatility: 0.08 },
      MRR: { base: 70833, growth: 0.25, volatility: 0.08 },
      NPS: { base: 75, growth: 0.02, volatility: 0.03 },
      CASH_RUNWAY: { base: 18, growth: -0.03, volatility: 0.15 },
      EBITDA_MARGIN: { base: 22, growth: 0.03, volatility: 0.05 },
      LTV_CAC: { base: 3.8, growth: 0.04, volatility: 0.12 },
      ACTIVE_PROJECTS: { base: 28, growth: 0.08, volatility: 0.2 },
      CLIENT_RETENTION: { base: 88, growth: 0.02, volatility: 0.03 },
      PIPELINE_VALUE: { base: 320000, growth: 0.15, volatility: 0.25 },
      TEAM_PRODUCTIVITY: { base: 78, growth: 0.03, volatility: 0.08 }
    }
  },
  LEXAIA: {
    name: 'LEXAIA Services Juridiques',
    sector: 'Legal Services',
    metrics: {
      ARR: { base: 650000, growth: 0.12, volatility: 0.04 },
      MRR: { base: 54167, growth: 0.12, volatility: 0.04 },
      NPS: { base: 78, growth: 0.01, volatility: 0.02 },
      CASH_RUNWAY: { base: 15, growth: -0.01, volatility: 0.08 },
      EBITDA_MARGIN: { base: 35, growth: 0.01, volatility: 0.02 },
      LTV_CAC: { base: 5.2, growth: 0.02, volatility: 0.08 },
      ACTIVE_PROJECTS: { base: 22, growth: 0.04, volatility: 0.1 },
      CLIENT_RETENTION: { base: 95, growth: 0.005, volatility: 0.01 },
      PIPELINE_VALUE: { base: 280000, growth: 0.08, volatility: 0.15 },
      TEAM_PRODUCTIVITY: { base: 82, growth: 0.01, volatility: 0.04 }
    }
  },
  ENKI_REALTY: {
    name: 'ENKI REALTY Immobilier Premium',
    sector: 'Real Estate',
    metrics: {
      ARR: { base: 2400000, growth: 0.08, volatility: 0.15 },
      MRR: { base: 200000, growth: 0.08, volatility: 0.15 },
      NPS: { base: 85, growth: 0.01, volatility: 0.03 },
      CASH_RUNWAY: { base: 36, growth: -0.01, volatility: 0.05 },
      EBITDA_MARGIN: { base: 42, growth: 0.01, volatility: 0.04 },
      LTV_CAC: { base: 6.8, growth: 0.02, volatility: 0.1 },
      ACTIVE_PROJECTS: { base: 18, growth: 0.03, volatility: 0.2 },
      CLIENT_RETENTION: { base: 90, growth: 0.01, volatility: 0.02 },
      PIPELINE_VALUE: { base: 850000, growth: 0.06, volatility: 0.3 },
      TEAM_PRODUCTIVITY: { base: 88, growth: 0.01, volatility: 0.03 }
    }
  },
  TAKEOUT: {
    name: 'TAKEOUT Restauration',
    sector: 'Restaurant',
    metrics: {
      ARR: { base: 450000, growth: 0.2, volatility: 0.12 },
      MRR: { base: 37500, growth: 0.2, volatility: 0.12 },
      NPS: { base: 72, growth: 0.02, volatility: 0.05 },
      CASH_RUNWAY: { base: 12, growth: -0.04, volatility: 0.2 },
      EBITDA_MARGIN: { base: 15, growth: 0.02, volatility: 0.08 },
      LTV_CAC: { base: 2.5, growth: 0.05, volatility: 0.15 },
      ACTIVE_PROJECTS: { base: 8, growth: 0.1, volatility: 0.25 },
      CLIENT_RETENTION: { base: 75, growth: 0.03, volatility: 0.05 },
      PIPELINE_VALUE: { base: 120000, growth: 0.18, volatility: 0.35 },
      TEAM_PRODUCTIVITY: { base: 70, growth: 0.04, volatility: 0.1 }
    }
  }
};

// Fonction pour générer une valeur avec variation
function generateValue(base, dayIndex, growth, volatility) {
  const trendFactor = 1 + (growth * dayIndex / 30);
  const randomFactor = 1 + ((Math.random() - 0.5) * volatility);
  return base * trendFactor * randomFactor;
}

// Fonction pour créer des KPIs pour une entreprise
async function createKPIsForCompany(company, config) {
  console.log(`\n📊 Création des KPIs pour ${config.name}...`);
  
  const kpisToCreate = [];
  const endDate = new Date();
  
  // Générer 30 jours de données
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(endDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Créer un KPI pour chaque métrique
    Object.entries(config.metrics).forEach(([metricName, metricConfig]) => {
      const value = generateValue(
        metricConfig.base,
        29 - dayOffset,
        metricConfig.growth,
        metricConfig.volatility
      );
      
      kpisToCreate.push({
        metric_name: metricName,
        value: Math.round(value * 100) / 100, // Arrondir à 2 décimales
        date: dateStr,
        owner_company: company,
        status: 'active',
        name: `${metricName} - ${company} - ${dateStr}`,
        description: `${metricName} pour ${config.name} le ${dateStr}`
      });
    });
  }
  
  // Créer les KPIs par batch
  const batchSize = 100;
  for (let i = 0; i < kpisToCreate.length; i += batchSize) {
    const batch = kpisToCreate.slice(i, i + batchSize);
    try {
      await client.post('/items/kpis', batch);
      console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(kpisToCreate.length/batchSize)} créé`);
    } catch (error) {
      console.error(`   ❌ Erreur batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`   ✅ ${kpisToCreate.length} KPIs créés pour ${company}`);
}

// Fonction pour supprimer tous les KPIs existants
async function clearExistingKPIs() {
  console.log('\n🗑️  Suppression des KPIs existants...');
  
  try {
    // Récupérer tous les IDs des KPIs
    const response = await client.get('/items/kpis?fields=id&limit=-1');
    const kpis = response.data.data;
    
    if (kpis.length > 0) {
      // Supprimer par batch
      const batchSize = 100;
      for (let i = 0; i < kpis.length; i += batchSize) {
        const batch = kpis.slice(i, i + batchSize).map(k => k.id);
        await client.delete('/items/kpis', {
          data: batch
        });
        console.log(`   ✅ Supprimé ${Math.min(i + batchSize, kpis.length)}/${kpis.length} KPIs`);
      }
    }
    
    console.log('   ✅ Tous les KPIs existants ont été supprimés');
  } catch (error) {
    console.error('   ❌ Erreur lors de la suppression:', error.message);
  }
}

// Fonction pour sauvegarder les KPIs existants
async function backupExistingKPIs() {
  console.log('\n💾 Sauvegarde des KPIs existants...');
  
  try {
    const response = await client.get('/items/kpis?limit=-1');
    const kpis = response.data.data;
    
    const backupPath = path.join(__dirname, `kpis-backup-${Date.now()}.json`);
    await fs.writeFile(backupPath, JSON.stringify(kpis, null, 2));
    
    console.log(`   ✅ ${kpis.length} KPIs sauvegardés dans ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('   ❌ Erreur lors de la sauvegarde:', error.message);
    return null;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de la personnalisation des KPIs');
  console.log('='.repeat(60));
  
  try {
    // Test de connexion
    console.log('\n🔌 Test de connexion à Directus...');
    const serverInfo = await client.get('/server/ping');
    console.log('   ✅ Connecté à Directus');
    
    // Demander confirmation avant de supprimer
    if (process.argv.includes('--clear')) {
      await clearExistingKPIs();
    } else if (process.argv.includes('--backup')) {
      await backupExistingKPIs();
      return;
    }
    
    // Créer les KPIs pour chaque entreprise
    for (const [company, config] of Object.entries(COMPANIES_CONFIG)) {
      await createKPIsForCompany(company, config);
    }
    
    // Statistiques finales
    console.log('\n📊 Statistiques finales:');
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    
    console.log('='.repeat(60));
    for (const company of companies) {
      const response = await client.get(`/items/kpis?filter[owner_company][_eq]=${company}&aggregate[count]=*`);
      const count = response.data.data[0]?.count || 0;
      console.log(`   ${company}: ${count} KPIs`);
    }
    console.log('='.repeat(60));
    
    console.log('\n🎉 Personnalisation terminée avec succès !');
    console.log('📊 Vérifiez le Dashboard V4 sur http://localhost:5173');
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
    process.exit(1);
  }
}

// Exécution
main();