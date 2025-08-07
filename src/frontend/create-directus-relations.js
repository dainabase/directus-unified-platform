// Script pour créer les relations Directus
const axios = require('axios');

const API_URL = 'http://localhost:8055';
const TOKEN = 'dashboard-api-token-2025';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Fonction pour créer une relation
async function createRelation(collection, field, relatedCollection, relationType = 'many-to-one') {
  try {
    console.log(`\n📝 Création relation: ${collection}.${field} → ${relatedCollection}`);
    
    // 1. Créer le champ si nécessaire
    try {
      await api.post(`/fields/${collection}`, {
        field: field,
        type: 'uuid',
        schema: {
          is_nullable: true,
          foreign_key_table: relatedCollection,
          foreign_key_column: 'id'
        },
        meta: {
          interface: 'select-dropdown-m2o',
          special: ['m2o'],
          display: 'related-values',
          display_options: {
            template: '{{name}}'
          }
        }
      });
      console.log(`✅ Champ ${field} créé`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        console.log(`ℹ️  Champ ${field} existe déjà`);
      } else {
        throw error;
      }
    }
    
    // 2. Créer la relation
    const relationData = {
      collection: collection,
      field: field,
      related_collection: relatedCollection,
      meta: {
        one_field: null,
        sort_field: null,
        one_deselect_action: 'nullify'
      }
    };
    
    await api.post('/relations', relationData);
    console.log(`✅ Relation créée avec succès`);
    
  } catch (error) {
    console.error(`❌ Erreur:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Fonction pour créer une relation many-to-many
async function createManyToManyRelation(collection1, collection2, junctionTable) {
  try {
    console.log(`\n📝 Création relation M2M: ${collection1} ↔ ${collection2} via ${junctionTable}`);
    
    // 1. Créer la table de liaison si nécessaire
    try {
      await api.post('/collections', {
        collection: junctionTable,
        meta: {
          collection: junctionTable,
          icon: 'link',
          note: `Liaison entre ${collection1} et ${collection2}`
        },
        schema: {
          name: junctionTable
        }
      });
      console.log(`✅ Table de liaison ${junctionTable} créée`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        console.log(`ℹ️  Table ${junctionTable} existe déjà`);
      } else {
        throw error;
      }
    }
    
    // 2. Créer les champs dans la table de liaison
    await createRelation(junctionTable, `${collection1}_id`, collection1);
    await createRelation(junctionTable, `${collection2}_id`, collection2);
    
    console.log(`✅ Relation M2M créée avec succès`);
    
  } catch (error) {
    console.error(`❌ Erreur M2M:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Fonction principale
async function setupRelations() {
  console.log('🚀 Création des relations Directus...\n');
  
  // Test de connexion
  try {
    const test = await api.get('/collections');
    console.log(`✅ API connectée - ${test.data.data.length} collections trouvées\n`);
  } catch (error) {
    console.error('❌ Erreur de connexion API:', error.message);
    return;
  }
  
  // === PRIORITÉ 1: 10 Relations Critiques ===
  
  // 1. companies ↔ projects (one-to-many)
  await createRelation('projects', 'company_id', 'companies');
  
  // 2. projects ↔ deliverables (one-to-many)
  await createRelation('deliverables', 'project_id', 'projects');
  
  // 3. companies ↔ people (many-to-many)
  await createManyToManyRelation('companies', 'people', 'company_people');
  
  // 4. projects ↔ people (many-to-many) - Utilise projects_team existant
  console.log('\nℹ️  Relation projects ↔ people via projects_team déjà existante');
  
  // 5. client_invoices ↔ companies (many-to-one)
  await createRelation('client_invoices', 'company_id', 'companies');
  
  // 6. client_invoices ↔ projects (many-to-one)
  await createRelation('client_invoices', 'project_id', 'projects');
  
  // 7. payments ↔ client_invoices (many-to-one)
  await createRelation('payments', 'invoice_id', 'client_invoices');
  
  // 8. bank_transactions ↔ companies (many-to-one)
  await createRelation('bank_transactions', 'company_id', 'companies');
  
  // 9. deliverables ↔ people (many-to-one)
  await createRelation('deliverables', 'assigned_to', 'people');
  
  // 10. support_tickets ↔ companies (many-to-one)
  await createRelation('support_tickets', 'company_id', 'companies');
  
  console.log('\n✅ Relations critiques créées !');
  console.log('\n📊 Pour tester les relations:');
  console.log('1. Accédez à http://localhost:8055/admin');
  console.log('2. Vérifiez dans Data Model > Relations');
  console.log('3. Testez en créant des données liées');
}

// Exécuter
setupRelations();