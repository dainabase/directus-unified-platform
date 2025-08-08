const axios = require('axios');

const API_URL = 'http://localhost:8055';
const API_TOKEN = 'dashboard-api-token-2025';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function fixAndRestructure() {
  console.log('🔧 Correction et restructuration...');
  
  try {
    // 1. Ajouter un champ owner_company à toutes les collections nécessaires
    const collectionsToUpdate = [
      'projects', 
      'client_invoices', 
      'supplier_invoices', 
      'bank_transactions', 
      'expenses',
      'payments',
      'deliverables',
      'contracts',
      'subscriptions'
    ];
    
    for (const collection of collectionsToUpdate) {
      console.log(`📝 Ajout owner_company à ${collection}...`);
      
      try {
        // Vérifier si le champ existe déjà
        const fields = await api.get(`/fields/${collection}`);
        const hasOwnerCompany = fields.data.data.some(f => f.field === 'owner_company');
        
        if (!hasOwnerCompany) {
          await api.post(`/fields/${collection}`, {
            field: 'owner_company',
            type: 'string',
            schema: {
              is_nullable: false,
              default_value: 'HYPERVISUAL'
            },
            meta: {
              interface: 'select-dropdown',
              display: 'labels',
              choices: [
                { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
                { text: 'DAINAMICS', value: 'DAINAMICS' },
                { text: 'LEXAIA', value: 'LEXAIA' },
                { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
                { text: 'TAKEOUT', value: 'TAKEOUT' }
              ]
            }
          });
          console.log(`✅ Champ owner_company ajouté à ${collection}`);
        } else {
          console.log(`ℹ️  ${collection} a déjà owner_company`);
        }
      } catch (error) {
        console.log(`⚠️  ${collection}: ${error.response?.data?.errors?.[0]?.message}`);
      }
    }
    
    // 2. Ajouter date_created à projects si manquant
    try {
      const projectFields = await api.get('/fields/projects');
      const hasDateCreated = projectFields.data.data.some(f => f.field === 'date_created');
      
      if (!hasDateCreated) {
        await api.post('/fields/projects', {
          field: 'date_created',
          type: 'timestamp',
          schema: {
            default_value: 'now()'
          },
          meta: {
            interface: 'datetime',
            special: ['date-created'],
            readonly: true
          }
        });
        console.log('✅ Champ date_created ajouté à projects');
      } else {
        console.log('ℹ️  projects a déjà date_created');
      }
    } catch (error) {
      console.log(`⚠️  projects date_created: ${error.response?.data?.errors?.[0]?.message}`);
    }
    
    // 3. Ajouter des champs spécifiques à people pour distinguer employés et contacts
    try {
      const peopleFields = await api.get('/fields/people');
      const hasIsEmployee = peopleFields.data.data.some(f => f.field === 'is_employee');
      const hasEmployeeCompany = peopleFields.data.data.some(f => f.field === 'employee_company');
      
      if (!hasIsEmployee) {
        await api.post('/fields/people', {
          field: 'is_employee',
          type: 'boolean',
          schema: {
            default_value: false
          },
          meta: {
            interface: 'boolean',
            display: 'boolean',
            special: null
          }
        });
        console.log('✅ Champ is_employee ajouté à people');
      }
      
      if (!hasEmployeeCompany) {
        await api.post('/fields/people', {
          field: 'employee_company',
          type: 'string',
          schema: {
            is_nullable: true
          },
          meta: {
            interface: 'select-dropdown',
            display: 'labels',
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
              { text: 'DAINAMICS', value: 'DAINAMICS' },
              { text: 'LEXAIA', value: 'LEXAIA' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
              { text: 'TAKEOUT', value: 'TAKEOUT' }
            ]
          }
        });
        console.log('✅ Champ employee_company ajouté à people');
      }
    } catch (error) {
      console.log(`⚠️  people fields: ${error.response?.data?.errors?.[0]?.message}`);
    }
    
    // 4. Ajouter des champs à companies pour marquer les clients
    try {
      const companyFields = await api.get('/fields/companies');
      const hasIsClient = companyFields.data.data.some(f => f.field === 'is_client');
      
      if (!hasIsClient) {
        await api.post('/fields/companies', {
          field: 'is_client',
          type: 'boolean',
          schema: {
            default_value: true
          },
          meta: {
            interface: 'boolean',
            display: 'boolean',
            special: null
          }
        });
        console.log('✅ Champ is_client ajouté à companies');
      }
    } catch (error) {
      console.log(`⚠️  companies is_client: ${error.response?.data?.errors?.[0]?.message}`);
    }
    
    // 5. Ajouter client_id à projects pour lier au bon client
    try {
      const projectFields = await api.get('/fields/projects');
      const hasClientId = projectFields.data.data.some(f => f.field === 'client_id');
      
      if (!hasClientId) {
        await api.post('/fields/projects', {
          field: 'client_id',
          type: 'uuid',
          schema: {
            is_nullable: true
          },
          meta: {
            interface: 'select-dropdown-m2o',
            display: 'related-values',
            special: ['m2o']
          }
        });
        console.log('✅ Champ client_id ajouté à projects');
      }
    } catch (error) {
      console.log(`⚠️  projects client_id: ${error.response?.data?.errors?.[0]?.message}`);
    }
    
    // 6. Ajouter owner_company à kpis pour les métriques par entreprise
    try {
      const kpisFields = await api.get('/fields/kpis');
      const hasOwnerCompany = kpisFields.data.data.some(f => f.field === 'owner_company');
      
      if (!hasOwnerCompany) {
        await api.post('/fields/kpis', {
          field: 'owner_company',
          type: 'string',
          schema: {
            is_nullable: false,
            default_value: 'HYPERVISUAL'
          },
          meta: {
            interface: 'select-dropdown',
            display: 'labels',
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
              { text: 'DAINAMICS', value: 'DAINAMICS' },
              { text: 'LEXAIA', value: 'LEXAIA' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
              { text: 'TAKEOUT', value: 'TAKEOUT' }
            ]
          }
        });
        console.log('✅ Champ owner_company ajouté à kpis');
      }
    } catch (error) {
      console.log(`⚠️  kpis owner_company: ${error.response?.data?.errors?.[0]?.message}`);
    }
    
    console.log('\n✅ Restructuration terminée !');
    console.log('🎯 Les collections sont maintenant prêtes pour l\'architecture multi-entreprises');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error.response?.data || error.message);
  }
}

fixAndRestructure();