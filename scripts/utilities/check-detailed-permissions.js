#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'DdbRWCe0ID7O-HQfPU_sXJHxASmKUl4E';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function checkPermissions() {
  console.log('🔍 ANALYSE DÉTAILLÉE DES PERMISSIONS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Info utilisateur
    console.log('\n👤 UTILISATEUR');
    const me = await directus.get('/users/me');
    console.log(`Email: ${me.data.data.email}`);
    console.log(`ID: ${me.data.data.id}`);
    console.log(`Role ID: ${me.data.data.role}`);
    
    // 2. Info sur le rôle
    console.log('\n🔑 RÔLE');
    try {
      const role = await directus.get(`/roles/${me.data.data.role}`);
      console.log(`Nom: ${role.data.data.name || 'Non défini'}`);
      console.log(`Admin Access: ${role.data.data.admin_access ? '✅ OUI' : '❌ NON'}`);
      console.log(`App Access: ${role.data.data.app_access ? '✅ OUI' : '❌ NON'}`);
    } catch (e) {
      console.log('Impossible de récupérer les infos du rôle');
    }
    
    // 3. Permissions sur les collections système
    console.log('\n📦 PERMISSIONS COLLECTIONS SYSTÈME');
    const systemCollections = [
      'directus_collections',
      'directus_fields', 
      'directus_relations',
      'directus_permissions'
    ];
    
    for (const coll of systemCollections) {
      process.stdout.write(`${coll}: `);
      try {
        await directus.get(`/collections/${coll}`);
        console.log('✅ READ');
      } catch (e) {
        console.log('❌ NO ACCESS');
      }
    }
    
    // 4. Test de création de collection système
    console.log('\n🧪 TEST CRÉATION COLLECTION');
    try {
      const testResult = await directus.post('/collections', {
        collection: 'test_' + Date.now(),
        meta: { icon: 'check' }
      });
      
      // Si succès, supprimer
      await directus.delete(`/collections/${testResult.data.data.collection}`);
      console.log('✅ PEUT créer des collections !');
    } catch (error) {
      console.log('❌ NE PEUT PAS créer de collections');
      console.log(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    
    // 5. Lister toutes les permissions du rôle
    console.log('\n📋 PERMISSIONS DU RÔLE');
    try {
      const permissions = await directus.get('/permissions', {
        params: {
          filter: {
            role: {
              _eq: me.data.data.role
            }
          }
        }
      });
      
      console.log(`Total: ${permissions.data.data.length} permissions`);
      
      // Grouper par collection
      const permsByCollection = {};
      permissions.data.data.forEach(p => {
        if (!permsByCollection[p.collection]) {
          permsByCollection[p.collection] = [];
        }
        permsByCollection[p.collection].push(p.action);
      });
      
      // Afficher les permissions importantes
      const importantCollections = [
        'directus_collections',
        'directus_fields',
        'directus_relations',
        'companies',
        'people'
      ];
      
      console.log('\nPermissions par collection:');
      importantCollections.forEach(coll => {
        if (permsByCollection[coll]) {
          console.log(`  ${coll}: ${permsByCollection[coll].join(', ')}`);
        } else {
          console.log(`  ${coll}: AUCUNE`);
        }
      });
      
    } catch (error) {
      console.log('Impossible de récupérer les permissions');
    }
    
    // 6. Recommandations
    console.log('\n' + '=' .repeat(60));
    console.log('💡 RECOMMANDATIONS');
    console.log('=' .repeat(60));
    
    if (!me.data.data.role || !role?.data?.data?.admin_access) {
      console.log('\n⚠️  CE TOKEN N\'A PAS LES PERMISSIONS ADMIN');
      console.log('\nPour créer des collections et relations, vous devez :');
      console.log('1. Vous connecter avec un compte ADMINISTRATEUR');
      console.log('2. Ou modifier le rôle de cet utilisateur pour lui donner admin_access');
      console.log('3. Ou ajouter les permissions directus_collections CREATE au rôle');
    } else {
      console.log('\n✅ Ce token devrait avoir les permissions nécessaires');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkPermissions();