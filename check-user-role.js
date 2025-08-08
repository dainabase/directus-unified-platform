#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';

async function checkUserRole() {
  console.log('🔍 VÉRIFICATION DU RÔLE ET PERMISSIONS DE JMD');
  console.log('='.repeat(80));
  
  try {
    // Login
    console.log('🔑 Connexion avec jmd@hypervisual.ch...');
    
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'jmd@hypervisual.ch',
      password: 'Spiral74@#'
    });
    
    const { access_token } = loginRes.data.data;
    console.log('✅ Connexion réussie!');
    
    // Créer un client avec le token
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Récupérer les infos utilisateur
    const meRes = await client.get('/users/me');
    const user = meRes.data.data;
    
    console.log('\n📋 INFORMATIONS UTILISATEUR:');
    console.log('   Email:', user.email);
    console.log('   Nom:', user.first_name, user.last_name);
    console.log('   ID:', user.id);
    console.log('   Role ID:', user.role);
    console.log('   Status:', user.status);
    console.log('   Token:', user.token ? '✅ Présent' : '❌ Absent');
    
    // Récupérer les détails du rôle
    try {
      const roleRes = await client.get(`/roles/${user.role}`);
      const role = roleRes.data.data;
      
      console.log('\n👤 DÉTAILS DU RÔLE:');
      console.log('   Nom:', role.name);
      console.log('   ID:', role.id);
      console.log('   Admin Access:', role.admin_access ? '✅ OUI' : '❌ NON');
      console.log('   App Access:', role.app_access ? '✅ OUI' : '❌ NON');
      console.log('   Description:', role.description || 'N/A');
      
      // Récupérer les permissions
      const permRes = await client.get('/permissions', {
        params: {
          filter: { role: { _eq: user.role } },
          limit: -1
        }
      });
      
      const permissions = permRes.data.data || [];
      console.log('\n🔐 PERMISSIONS:');
      console.log('   Total:', permissions.length);
      
      // Chercher les permissions sur directus_fields
      const fieldPerms = permissions.filter(p => p.collection === 'directus_fields');
      console.log('   Sur directus_fields:', fieldPerms.length);
      if (fieldPerms.length > 0) {
        fieldPerms.forEach(p => {
          console.log(`     - ${p.action}: ${p.permissions || 'Toutes'}`);
        });
      }
      
      // Compter par action
      const byAction = {};
      permissions.forEach(p => {
        byAction[p.action] = (byAction[p.action] || 0) + 1;
      });
      
      console.log('\n📊 PERMISSIONS PAR ACTION:');
      Object.entries(byAction).forEach(([action, count]) => {
        console.log(`   ${action}: ${count}`);
      });
      
    } catch (e) {
      console.log('\n❌ Impossible de récupérer les détails du rôle');
    }
    
    // Tester la création d'un champ
    console.log('\n🧪 TEST DE CRÉATION DE CHAMP:');
    try {
      const testField = {
        collection: 'companies',
        field: 'test_perm_' + Date.now(),
        type: 'string',
        schema: {
          name: 'test_perm_' + Date.now(),
          table: 'companies',
          data_type: 'varchar',
          max_length: 50,
          is_nullable: true
        },
        meta: {
          collection: 'companies',
          field: 'test_perm_' + Date.now(),
          interface: 'input',
          hidden: true
        }
      };
      
      await client.post('/fields/companies', testField);
      console.log('   ✅ PEUT créer des champs!');
      
      // Supprimer le champ de test
      await client.delete(`/fields/companies/${testField.field}`);
      
    } catch (e) {
      console.log('   ❌ NE PEUT PAS créer de champs');
      console.log('   Erreur:', e.response?.data?.errors?.[0]?.message || e.message);
    }
    
    // Suggestions
    console.log('\n💡 RECOMMANDATIONS:');
    
    if (!user.token) {
      console.log('1. Créer un token statique pour cet utilisateur:');
      console.log('   - Connectez-vous à http://localhost:8055/admin');
      console.log('   - Allez dans votre profil utilisateur');
      console.log('   - Ajoutez un Static Token');
      console.log('   - Utilisez ce token dans les scripts');
    }
    
    console.log('\n2. Ou demandez à un administrateur de:');
    console.log('   - Vous donner le rôle Administrator');
    console.log('   - Ou ajouter les permissions nécessaires à votre rôle');
    console.log('   - Permissions requises: create/update sur directus_fields');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter
checkUserRole().catch(console.error);