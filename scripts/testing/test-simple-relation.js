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

async function testRelation() {
  console.log('🧪 Test de création de relation simple');
  
  try {
    // Test 1: Sans schema
    console.log('\n1. Test sans schema:');
    const result1 = await directus.post('/relations', {
      collection: 'time_tracking',
      field: 'project_id',
      related_collection: 'projects'
    }).catch(e => ({ error: e.response?.data }));
    console.log('Résultat:', JSON.stringify(result1.error || result1.data, null, 2));
    
    // Test 2: Avec meta minimal
    console.log('\n2. Test avec meta minimal:');
    const result2 = await directus.post('/relations', {
      collection: 'time_tracking',
      field: 'project_id',
      related_collection: 'projects',
      meta: {
        many_collection: 'time_tracking',
        many_field: 'project_id',
        one_collection: 'projects'
      }
    }).catch(e => ({ error: e.response?.data }));
    console.log('Résultat:', JSON.stringify(result2.error || result2.data, null, 2));
    
    // Test 3: Vérifier les collections via /collections
    console.log('\n3. Collections disponibles:');
    const collections = await directus.get('/collections');
    const projectsExists = collections.data.data.some(c => c.collection === 'projects');
    const timeTrackingExists = collections.data.data.some(c => c.collection === 'time_tracking');
    console.log('- projects existe:', projectsExists);
    console.log('- time_tracking existe:', timeTrackingExists);
    
    // Test 4: Vérifier le champ project_id
    console.log('\n4. Champ project_id dans time_tracking:');
    const fields = await directus.get('/fields/time_tracking');
    const projectIdField = fields.data.data.find(f => f.field === 'project_id');
    console.log('- Champ existe:', !!projectIdField);
    if (projectIdField) {
      console.log('- Type:', projectIdField.type);
      console.log('- Meta:', JSON.stringify(projectIdField.meta, null, 2));
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testRelation();