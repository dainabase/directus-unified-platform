#!/usr/bin/env node

/**
 * Script pour tester si nous pouvons créer une collection avec le token actuel
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'DLCQlOzupCWqxbly4pzkVyTOm_6gP8S4';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testPermissions() {
  console.log('🔍 Test des permissions du token actuel\n');
  
  try {
    // 1. Tester l'accès aux collections système
    console.log('1. Test accès directus_collections...');
    const collections = await directus.get('/collections');
    console.log(`   ✅ Accès aux collections : ${collections.data.data.length} collections visibles`);
    
    // 2. Tester l'accès aux permissions
    console.log('\n2. Test accès directus_permissions...');
    const permissions = await directus.get('/permissions');
    console.log(`   ✅ Accès aux permissions : ${permissions.data.data.length} permissions`);
    
    // 3. Tester la création d'une collection test
    console.log('\\n3. Test création de collection...');
    try {
      const testCollection = await directus.post('/collections', {
        collection: 'test_permissions_' + Date.now(),
        meta: {
          icon: 'verified_user',
          note: 'Collection de test pour vérifier les permissions'
        },
        schema: {
          name: 'test_permissions'
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
            meta: {
              interface: 'input'
            }
          }
        ]
      });
      console.log('   ✅ Création de collection : AUTORISÉE');
      
      // Nettoyer en supprimant la collection test
      await directus.delete(`/collections/${testCollection.data.data.collection}`);
      console.log('   ✅ Suppression de test : AUTORISÉE');
      
    } catch (error) {
      console.log('   ❌ Création de collection : REFUSÉE');
      console.log(`      Erreur : ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    
    // 4. Vérifier le rôle de l'utilisateur actuel
    console.log('\\n4. Information sur utilisateur actuel...');
    try {
      const me = await directus.get('/users/me');
      console.log(`   👤 Utilisateur : ${me.data.data.email || me.data.data.first_name || 'Inconnu'}`);
      console.log(`   🔑 Rôle : ${me.data.data.role?.name || me.data.data.role || 'Non défini'}`);
      console.log(`   🛡️  Admin : ${me.data.data.role?.admin_access ? 'OUI' : 'NON'}`);
    } catch (error) {
      console.log('   ❌ Impossible de récupérer les infos utilisateur');
    }
    
    // 5. Résumé des permissions
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES PERMISSIONS');
    console.log('='.repeat(60));
    
    console.log('\n✅ Ce que ce token PEUT faire :');
    console.log('   - Lire les collections existantes');
    console.log('   - Créer des relations entre collections existantes');
    console.log('   - Modifier les champs des collections existantes');
    
    console.log('\n❌ Ce que ce token NE PEUT PAS faire :');
    console.log('   - Créer de nouvelles collections');
    console.log('   - Supprimer des collections');
    console.log('   - Modifier les permissions système');
    
    console.log('\n💡 SOLUTION RECOMMANDÉE :');
    console.log('1. Se connecter à l\'interface Directus : http://localhost:8055');
    console.log('2. Aller dans Settings > Access Control > API Tokens');
    console.log('3. Créer un nouveau token avec le rôle "Administrator"');
    console.log('4. Remplacer le token dans les scripts');
    
  } catch (error) {
    console.error('❌ Erreur lors du test :', error.message);
  }
}

testPermissions();