#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'hHKnrW949zcwx2372KH2AjwDyROAjgZ2';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testCreateCollection() {
  console.log('🧪 Test de création de collection "companies"...\n');
  
  try {
    // Vérifier si companies existe déjà
    try {
      const existing = await directus.get('/collections/companies');
      console.log('✅ Collection "companies" existe déjà');
      return;
    } catch (e) {
      if (e.response?.status === 404) {
        console.log('Collection "companies" n\'existe pas, création...');
      }
    }
    
    // Créer la collection companies
    const result = await directus.post('/collections', {
      collection: 'companies',
      meta: {
        icon: 'business',
        display_template: '{{name}}',
        note: 'Gestion des entreprises clientes'
      },
      schema: {
        name: 'companies',
        comment: 'Table des entreprises'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          schema: {
            is_primary_key: true
          },
          meta: {
            hidden: true,
            readonly: true,
            interface: 'input',
            special: ['uuid']
          }
        },
        {
          field: 'name',
          type: 'string',
          schema: {
            is_nullable: false
          },
          meta: {
            interface: 'input',
            width: 'full',
            required: true
          }
        },
        {
          field: 'date_created',
          type: 'timestamp',
          meta: {
            interface: 'datetime',
            readonly: true,
            hidden: true,
            special: ['date-created']
          }
        },
        {
          field: 'date_updated',
          type: 'timestamp',
          meta: {
            interface: 'datetime',
            readonly: true,
            hidden: true,
            special: ['date-updated']
          }
        }
      ]
    });
    
    console.log('✅ Collection "companies" créée avec succès !');
    console.log('ID:', result.data.data.collection);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.errors?.[0]?.message || error.message);
    if (error.response?.data) {
      console.log('\nDétails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCreateCollection();