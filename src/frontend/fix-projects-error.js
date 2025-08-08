const axios = require('axios');

const API_URL = 'http://localhost:8055';
const API_TOKEN = 'dashboard-api-token-2025';

async function fixProjectsCollection() {
  console.log('🔧 Correction de la collection projects...');
  
  try {
    // 1. Vérifier les champs existants
    const fieldsResponse = await axios.get(`${API_URL}/fields/projects`, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    
    const fields = fieldsResponse.data.data;
    const hasDateCreated = fields.some(f => f.field === 'date_created');
    
    if (!hasDateCreated) {
      console.log('❌ Champ date_created manquant, création...');
      
      // 2. Ajouter le champ date_created
      await axios.post(`${API_URL}/fields/projects`, {
        field: 'date_created',
        type: 'timestamp',
        schema: {
          default_value: 'now()',
          is_nullable: false
        },
        meta: {
          interface: 'datetime',
          special: ['date-created'],
          display: 'datetime',
          readonly: true
        }
      }, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
      });
      
      console.log('✅ Champ date_created créé');
    } else {
      console.log('✅ Champ date_created existe déjà');
    }
    
    // 3. Mettre à jour les projets existants sans date_created
    const projects = await axios.get(`${API_URL}/items/projects`, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    
    let updated = 0;
    for (const project of projects.data.data) {
      if (!project.date_created) {
        await axios.patch(`${API_URL}/items/projects/${project.id}`, {
          date_created: new Date().toISOString()
        }, {
          headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        updated++;
      }
    }
    
    console.log(`✅ Collection projects corrigée (${updated} projets mis à jour)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

fixProjectsCollection();