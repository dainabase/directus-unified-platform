#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Collections qui n'ont PAS owner_company
const COLLECTIONS_TO_FIX = [
  // Critiques
  'companies',
  'people',
  'time_tracking',
  'proposals',
  'quotes',
  'support_tickets',
  'orders',
  'talents',
  'interactions',
  'teams',
  // Autres
  'accounting_entries',
  'activities',
  'approvals',
  'audit_logs',
  'comments',
  'company_people',
  'compliance',
  'content_calendar',
  'credits',
  'customer_success',
  'debits',
  'deliveries',
  'departments',
  'evaluations',
  'events',
  'goals',
  'notes',
  'notifications',
  'permissions',
  'projects_team',
  'providers',
  'reconciliations',
  'refunds',
  'returns',
  'roles',
  'settings',
  'skills',
  'tags',
  'talents_simple',
  'trainings',
  'workflows'
];

async function fixOwnerCompanyDirect() {
  console.log('🚀 AJOUT DIRECT DU CHAMP OWNER_COMPANY');
  console.log('='.repeat(80));
  console.log('Token utilisé:', TOKEN.substring(0, 20) + '...');
  console.log('Collections à traiter:', COLLECTIONS_TO_FIX.length);
  console.log('='.repeat(80));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  // D'abord vérifier l'utilisateur
  try {
    const userRes = await client.get('/users/me');
    console.log('✅ Utilisateur connecté:', userRes.data.data.email);
  } catch (e) {
    console.error('❌ Token invalide');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  let existingCount = 0;
  const errors = [];
  
  for (let i = 0; i < COLLECTIONS_TO_FIX.length; i++) {
    const collection = COLLECTIONS_TO_FIX[i];
    const progress = `[${i + 1}/${COLLECTIONS_TO_FIX.length}]`;
    
    console.log(`\n${progress} ${collection}`);
    console.log('-'.repeat(40));
    
    try {
      // Vérifier si le champ existe déjà
      try {
        await client.get(`/fields/${collection}/owner_company`);
        console.log('  ℹ️  owner_company existe déjà');
        existingCount++;
        continue;
      } catch (e) {
        if (e.response?.status !== 404) {
          throw e;
        }
        // 404 = le champ n'existe pas, on continue
      }
      
      // Créer le champ avec le format minimal qui fonctionne
      console.log('  ➕ Ajout du champ owner_company...');
      
      const fieldConfig = {
        field: 'owner_company',
        type: 'string',
        schema: {
          max_length: 50,
          is_nullable: true,
          default_value: 'HYPERVISUAL'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
              { text: 'DAINAMICS', value: 'DAINAMICS' },
              { text: 'LEXAIA', value: 'LEXAIA' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
              { text: 'TAKEOUT', value: 'TAKEOUT' }
            ]
          },
          display: 'labels',
          display_options: {
            showAsDot: true,
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL', foreground: '#FFFFFF', background: '#2196F3' },
              { text: 'DAINAMICS', value: 'DAINAMICS', foreground: '#FFFFFF', background: '#4CAF50' },
              { text: 'LEXAIA', value: 'LEXAIA', foreground: '#FFFFFF', background: '#FF9800' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY', foreground: '#FFFFFF', background: '#9C27B0' },
              { text: 'TAKEOUT', value: 'TAKEOUT', foreground: '#FFFFFF', background: '#F44336' }
            ]
          },
          width: 'half',
          note: 'Entreprise propriétaire'
        }
      };
      
      const response = await client.post(`/fields/${collection}`, fieldConfig);
      
      if (response.status === 200 || response.status === 201) {
        console.log('  ✅ owner_company ajouté avec succès!');
        successCount++;
      }
      
    } catch (error) {
      errorCount++;
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
      console.log(`  ❌ Erreur: ${errorMsg}`);
      
      // Si c'est une erreur de permission, essayer de comprendre pourquoi
      if (error.response?.status === 403) {
        console.log('  ℹ️  Vérification des permissions sur la collection...');
        try {
          // Essayer de lire la collection
          await client.get(`/items/${collection}?limit=1`);
          console.log('     ✅ Lecture OK');
        } catch (e) {
          console.log('     ❌ Pas d\'accès en lecture non plus');
        }
      }
      
      errors.push({ collection, error: errorMsg });
    }
    
    // Petite pause entre les collections
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Rapport final
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RAPPORT FINAL');
  console.log('='.repeat(80));
  console.log(`✅ Champs créés: ${successCount}`);
  console.log(`ℹ️  Déjà existants: ${existingCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`\n📊 Total: ${successCount + existingCount}/${COLLECTIONS_TO_FIX.length} collections avec owner_company`);
  
  if (errors.length > 0) {
    console.log('\n❌ Collections avec erreurs:');
    errors.forEach(err => {
      console.log(`   - ${err.collection}: ${err.error}`);
    });
  }
  
  // Sauvegarder le rapport
  const report = {
    timestamp: new Date().toISOString(),
    success: successCount,
    existing: existingCount,
    errors: errorCount,
    total: COLLECTIONS_TO_FIX.length,
    details: errors
  };
  
  try {
    await fs.writeFile('migration-report-direct.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Rapport sauvegardé: migration-report-direct.json');
  } catch (e) {
    // Ignorer
  }
  
  if (successCount > 0) {
    console.log('\n🎉 MIGRATION RÉUSSIE!');
    console.log('Prochaine étape: node src/backend/tests/test-filtering.js');
  } else if (errorCount > 0) {
    console.log('\n⚠️  PROBLÈME DE PERMISSIONS');
    console.log('Il semble que ce token n\'a pas les permissions sur ces collections spécifiques.');
    console.log('\nSOLUTIONS POSSIBLES:');
    console.log('1. Utiliser l\'interface Directus Admin pour ajouter les champs manuellement');
    console.log('2. Vérifier les permissions du rôle de cet utilisateur');
    console.log('3. Créer un token avec le rôle Administrator complet');
  }
}

// Exécuter
fixOwnerCompanyDirect().catch(console.error);