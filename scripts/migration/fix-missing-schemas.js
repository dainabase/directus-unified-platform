#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections à réparer
const collectionsToFix = [
  'activities', 'approvals', 'audit_logs', 'comments', 'contracts',
  'credits', 'customer_success', 'debits', 'deliveries', 'departments',
  'evaluations', 'events', 'files', 'goals', 'kpis',
  'notes', 'notifications', 'orders', 'payments', 'proposals',
  'quotes', 'reconciliations', 'refunds', 'returns', 'roles',
  'settings', 'skills', 'tags', 'talents_simple', 'teams',
  'trainings', 'workflows'
];

async function deleteAndRecreateCollection(name) {
  try {
    console.log(`🔧 Réparation de ${name}...`);
    
    // 1. Supprimer la collection sans schéma
    try {
      await directus.delete(`/collections/${name}`);
      console.log(`  ✅ Collection supprimée`);
    } catch (err) {
      // Peut déjà être supprimée
    }
    
    // 2. Recréer avec schéma
    const collectionData = {
      collection: name,
      meta: {
        icon: 'folder',
        hidden: false,
        singleton: false,
        accountability: 'all'
      },
      schema: {},
      fields: [
        {
          field: 'id',
          type: 'uuid',
          schema: {
            is_primary_key: true,
            has_auto_increment: false,
            is_nullable: false
          },
          meta: {
            hidden: true,
            readonly: true,
            interface: 'input',
            special: ['uuid']
          }
        },
        {
          field: 'created_at',
          type: 'timestamp',
          schema: {
            is_nullable: false,
            default_value: 'CURRENT_TIMESTAMP'
          },
          meta: {
            interface: 'datetime',
            readonly: true,
            hidden: true,
            special: ['date-created']
          }
        },
        {
          field: 'updated_at',
          type: 'timestamp',
          schema: {
            is_nullable: false,
            default_value: 'CURRENT_TIMESTAMP'
          },
          meta: {
            interface: 'datetime',
            readonly: true,
            hidden: true,
            special: ['date-updated']
          }
        }
      ]
    };
    
    // Ajouter des champs spécifiques selon le type
    switch(name) {
      case 'activities':
        collectionData.fields.push(
          { field: 'name', type: 'string', schema: { is_nullable: false } },
          { field: 'type', type: 'string' },
          { field: 'description', type: 'text' },
          { field: 'project_id', type: 'uuid' }
        );
        break;
        
      case 'contracts':
        collectionData.fields.push(
          { field: 'title', type: 'string', schema: { is_nullable: false } },
          { field: 'contract_number', type: 'string' },
          { field: 'status', type: 'string', schema: { default_value: 'draft' } },
          { field: 'value', type: 'decimal', schema: { numeric_precision: 15, numeric_scale: 2 } },
          { field: 'company_id', type: 'uuid' }
        );
        break;
        
      case 'payments':
        collectionData.fields.push(
          { field: 'amount', type: 'decimal', schema: { numeric_precision: 15, numeric_scale: 2, is_nullable: false } },
          { field: 'currency', type: 'string', schema: { default_value: 'EUR' } },
          { field: 'method', type: 'string' },
          { field: 'status', type: 'string', schema: { default_value: 'pending' } },
          { field: 'project_id', type: 'uuid' }
        );
        break;
        
      case 'files':
        collectionData.fields.push(
          { field: 'filename', type: 'string', schema: { is_nullable: false } },
          { field: 'mimetype', type: 'string' },
          { field: 'size', type: 'bigint' },
          { field: 'url', type: 'text' },
          { field: 'project_id', type: 'uuid' }
        );
        break;
        
      default:
        // Champs génériques
        collectionData.fields.push(
          { field: 'name', type: 'string' },
          { field: 'description', type: 'text' },
          { field: 'status', type: 'string', schema: { default_value: 'active' } }
        );
    }
    
    const response = await directus.post('/collections', collectionData);
    console.log(`  ✅ Collection recréée avec schéma`);
    return true;
    
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 RÉPARATION DES COLLECTIONS SANS SCHÉMA\n');
  
  let success = 0;
  let failed = 0;
  
  for (const collection of collectionsToFix) {
    const result = await deleteAndRecreateCollection(collection);
    if (result) success++;
    else failed++;
    
    // Pause pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 RÉSULTAT:');
  console.log(`✅ Réparées: ${success}/${collectionsToFix.length}`);
  console.log(`❌ Échecs: ${failed}`);
}

main().catch(console.error);
