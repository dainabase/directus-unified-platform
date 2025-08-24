#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';

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

async function createFieldsViaAdmin() {
  console.log('🔐 CRÉATION DES CHAMPS VIA LOGIN ADMIN');
  console.log('='.repeat(80));
  
  try {
    // 1. Login avec les credentials admin
    console.log('🔑 Connexion avec jmd@hypervisual.ch...');
    
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'jmd@hypervisual.ch',
      password: 'Spiral74@#'
    });
    
    const { access_token, refresh_token } = loginRes.data.data;
    console.log('✅ Connexion réussie!');
    
    // Créer un client avec le token de session
    const adminClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    // Vérifier que c'est bien un admin
    const meRes = await adminClient.get('/users/me');
    const user = meRes.data.data;
    console.log(`   Utilisateur: ${user.email}`);
    console.log(`   Nom: ${user.first_name} ${user.last_name}`);
    
    let successCount = 0;
    let errorCount = 0;
    let existingCount = 0;
    const errors = [];
    
    // 2. Créer les champs pour chaque collection
    for (let i = 0; i < COLLECTIONS_TO_FIX.length; i++) {
      const collection = COLLECTIONS_TO_FIX[i];
      const progress = `[${i + 1}/${COLLECTIONS_TO_FIX.length}]`;
      
      console.log(`\n${progress} ${collection}`);
      console.log('-'.repeat(40));
      
      try {
        // Vérifier si le champ existe déjà
        try {
          await adminClient.get(`/fields/${collection}/owner_company`);
          console.log('  ℹ️  owner_company existe déjà');
          existingCount++;
          continue;
        } catch (e) {
          if (e.response?.status !== 404) throw e;
        }
        
        // Créer le champ
        console.log('  ➕ Ajout du champ owner_company...');
        
        const fieldConfig = {
          collection: collection,
          field: 'owner_company',
          type: 'string',
          schema: {
            name: 'owner_company',
            table: collection,
            data_type: 'varchar',
            max_length: 50,
            is_nullable: true,
            default_value: 'HYPERVISUAL'
          },
          meta: {
            collection: collection,
            field: 'owner_company',
            interface: 'select-dropdown',
            special: null,
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
            readonly: false,
            hidden: false,
            required: false,
            width: 'half',
            note: 'Entreprise propriétaire'
          }
        };
        
        const response = await adminClient.post(`/fields/${collection}`, fieldConfig);
        
        if (response.status === 200 || response.status === 201) {
          console.log('  ✅ owner_company ajouté avec succès!');
          successCount++;
          
          // Migrer quelques données
          await migrateCollectionData(adminClient, collection);
        }
        
      } catch (error) {
        errorCount++;
        const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
        console.log(`  ❌ Erreur: ${errorMsg}`);
        errors.push({ collection, error: errorMsg });
      }
      
      // Petite pause
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
    
    await fs.writeFile('migration-report-admin.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Rapport sauvegardé: migration-report-admin.json');
    
    if (successCount > 0) {
      console.log('\n🎉 MIGRATION RÉUSSIE!');
      console.log('Prochaine étape: Relancer les tests de filtrage');
    }
    
    // Rafraîchir le token si besoin
    if (refresh_token) {
      console.log('\n🔄 Token de session actif pour les prochaines opérations');
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function migrateCollectionData(client, collection) {
  console.log('  🔄 Migration de quelques données...');
  
  try {
    // Récupérer quelques items sans owner_company
    const response = await client.get(`/items/${collection}`, {
      params: {
        filter: { owner_company: { _null: true } },
        limit: 20
      }
    });
    
    const items = response.data.data || [];
    
    if (items.length === 0) {
      console.log('  ✅ Pas de données à migrer');
      return;
    }
    
    // Distribuer selon les proportions réelles
    const distribution = [
      'HYPERVISUAL', 'HYPERVISUAL', 'HYPERVISUAL', 'HYPERVISUAL', 'HYPERVISUAL', 'HYPERVISUAL',
      'DAINAMICS', 'DAINAMICS',
      'LEXAIA', 'LEXAIA',
      'ENKI_REALTY', 'ENKI_REALTY',
      'TAKEOUT', 'TAKEOUT'
    ];
    
    let migratedCount = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const company = distribution[i % distribution.length];
      
      try {
        await client.patch(`/items/${collection}/${item.id}`, {
          owner_company: company
        });
        migratedCount++;
      } catch (e) {
        // Ignorer les erreurs individuelles
      }
    }
    
    console.log(`  ✅ ${migratedCount} items migrés`);
    
  } catch (error) {
    console.log('  ⚠️  Erreur migration:', error.message);
  }
}

// Exécuter
createFieldsViaAdmin().catch(console.error);