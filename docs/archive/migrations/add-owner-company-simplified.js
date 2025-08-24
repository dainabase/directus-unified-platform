#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Collections critiques à traiter en priorité
const PRIORITY_COLLECTIONS = [
  'companies',
  'people', 
  'time_tracking',
  'budgets',
  'proposals',
  'quotes',
  'support_tickets',
  'orders',
  'talents',
  'activities',
  'notes',
  'teams'
];

const FIELD_CONFIG = {
  field: 'owner_company',
  type: 'string',
  schema: {
    name: 'owner_company',
    table: null, // sera défini pour chaque collection
    data_type: 'varchar',
    default_value: null,
    max_length: 50,
    numeric_precision: null,
    numeric_scale: null,
    is_nullable: true,
    is_unique: false,
    is_primary_key: false,
    is_generated: false,
    generation_expression: null,
    has_auto_increment: false,
    foreign_key_table: null,
    foreign_key_column: null
  },
  meta: {
    id: null, // sera auto-généré
    collection: null, // sera défini pour chaque collection
    field: 'owner_company',
    special: null,
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
    validation: null,
    required: false,
    readonly: false,
    hidden: false,
    sort: null,
    width: 'half',
    translations: null,
    note: 'Entreprise propriétaire de cet enregistrement',
    conditions: null,
    group: null,
    validation_message: null
  }
};

async function addOwnerCompanyToCollections() {
  console.log('🚀 AJOUT DU CHAMP OWNER_COMPANY - VERSION SIMPLIFIÉE');
  console.log('='.repeat(60));
  console.log(`Collections à traiter: ${PRIORITY_COLLECTIONS.length}`);
  console.log('='.repeat(60) + '\n');
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    timeout: 30000
  });
  
  let successCount = 0;
  let errorCount = 0;
  let existingCount = 0;
  
  for (const collection of PRIORITY_COLLECTIONS) {
    console.log(`\n📦 Traitement de: ${collection}`);
    console.log('-'.repeat(40));
    
    try {
      // Vérifier si le champ existe déjà
      try {
        await client.get(`/fields/${collection}/owner_company`);
        console.log(`  ℹ️  Le champ owner_company existe déjà`);
        existingCount++;
        continue;
      } catch (checkError) {
        if (checkError.response?.status !== 404) {
          throw checkError;
        }
        // 404 = le champ n'existe pas, on peut continuer
      }
      
      // Préparer la configuration pour cette collection
      const fieldData = {
        ...FIELD_CONFIG,
        collection: collection,
        schema: {
          ...FIELD_CONFIG.schema,
          table: collection
        },
        meta: {
          ...FIELD_CONFIG.meta,
          collection: collection
        }
      };
      
      // Créer le champ
      console.log(`  📝 Création du champ owner_company...`);
      const response = await client.post(`/fields/${collection}`, fieldData);
      
      if (response.status === 200 || response.status === 201) {
        console.log(`  ✅ Champ créé avec succès!`);
        successCount++;
        
        // Ajouter une valeur par défaut pour les enregistrements existants
        try {
          console.log(`  🔄 Mise à jour des enregistrements existants...`);
          
          // D'abord compter les enregistrements
          const countResponse = await client.get(`/items/${collection}`, {
            params: {
              aggregate: { count: '*' },
              limit: 1
            }
          });
          
          const totalCount = countResponse.data?.data?.[0]?.count || 0;
          
          if (totalCount > 0) {
            console.log(`  📊 ${totalCount} enregistrements à mettre à jour`);
            
            // Mettre à jour par batch
            const updateResponse = await client.patch(`/items/${collection}`, {
              query: {
                filter: {
                  owner_company: { _null: true }
                }
              },
              data: {
                owner_company: 'HYPERVISUAL' // Par défaut
              }
            });
            
            console.log(`  ✅ Enregistrements mis à jour avec HYPERVISUAL par défaut`);
          }
        } catch (updateError) {
          console.log(`  ⚠️  Impossible de mettre à jour les enregistrements: ${updateError.message}`);
        }
      }
      
    } catch (error) {
      errorCount++;
      
      if (error.response?.status === 403) {
        console.log(`  ❌ Erreur de permission - Token peut-être invalide ou droits insuffisants`);
      } else if (error.response?.data?.errors) {
        const errorMsg = error.response.data.errors[0]?.message || 'Erreur inconnue';
        console.log(`  ❌ Erreur: ${errorMsg}`);
      } else {
        console.log(`  ❌ Erreur: ${error.message}`);
      }
    }
    
    // Pause entre les collections
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ:');
  console.log('='.repeat(60));
  console.log(`✅ Champs créés avec succès: ${successCount}`);
  console.log(`ℹ️  Champs déjà existants: ${existingCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`\n📊 Total traité: ${successCount + existingCount + errorCount}/${PRIORITY_COLLECTIONS.length}`);
  
  if (errorCount > 0) {
    console.log('\n⚠️  ATTENTION: Des erreurs se sont produites.');
    console.log('Vérifiez:');
    console.log('  1. Que Directus est bien démarré sur http://localhost:8055');
    console.log('  2. Que le token est valide et a les permissions admin');
    console.log('  3. Les logs Directus pour plus de détails');
  } else if (successCount > 0) {
    console.log('\n✅ Migration réussie!');
    console.log('Les collections prioritaires ont maintenant le champ owner_company.');
  }
}

// Exécuter
addOwnerCompanyToCollections().catch(error => {
  console.error('\n💥 ERREUR FATALE:', error.message);
  process.exit(1);
});