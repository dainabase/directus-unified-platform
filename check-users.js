#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function checkUsers() {
  console.log('🔍 Vérification des utilisateurs Directus');
  console.log('='.repeat(50));
  
  try {
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    // Lister tous les utilisateurs
    console.log('\n📋 Liste des utilisateurs:');
    const response = await client.get('/users', {
      params: {
        limit: -1
      }
    });
    
    const users = response.data?.data || [];
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email || 'Email non défini'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nom: ${user.first_name} ${user.last_name}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Role: ${user.role}`);
    });
    
    console.log(`\n✅ Total: ${users.length} utilisateur(s)`);
    
    // Vérifier l'utilisateur actuel (celui qui utilise le token)
    console.log('\n🔐 Utilisateur actuel (propriétaire du token):');
    try {
      const meResponse = await client.get('/users/me');
      const currentUser = meResponse.data?.data;
      
      if (currentUser) {
        console.log(`   Email: ${currentUser.email}`);
        console.log(`   ID: ${currentUser.id}`);
        console.log(`   Role: ${currentUser.role}`);
      }
    } catch (error) {
      console.log('   ❌ Impossible de récupérer l\'utilisateur actuel');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.errors?.[0]?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Le token semble invalide ou expiré');
    }
  }
}

checkUsers().catch(console.error);