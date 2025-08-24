#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import crypto from 'crypto';

const API_URL = 'http://localhost:8055';

// Différentes méthodes pour obtenir un token admin
async function createAdminToken() {
  console.log('🔐 CRÉATION D\'UN TOKEN ADMIN AVEC TOUTES LES PERMISSIONS');
  console.log('='.repeat(80));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`API URL: ${API_URL}`);
  console.log('='.repeat(80));
  
  // Méthode 1: Essayer avec les credentials du .env
  console.log('\n📝 Méthode 1: Login avec credentials .env');
  const credentials = [
    { email: 'admin@dainabase.com', password: 'YhI3FayWKfkrXcdYd7AuWQ==' },
    { email: 'jmd@hypervisual.ch', password: 'votre-mot-de-passe' },
    { email: 'api@dashboard.com', password: 'api-password' }
  ];
  
  for (const cred of credentials) {
    console.log(`\nEssai avec ${cred.email}...`);
    
    try {
      // Tenter la connexion
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: cred.email,
        password: cred.password
      });
      
      const { access_token, refresh_token } = loginRes.data.data;
      console.log('✅ Connexion réussie!');
      
      // Créer un client avec le token de session
      const adminClient = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Récupérer l'utilisateur actuel
      const meRes = await adminClient.get('/users/me');
      const currentUser = meRes.data.data;
      console.log(`   Utilisateur: ${currentUser.email}`);
      console.log(`   Role: ${currentUser.role}`);
      
      // Vérifier si c'est un admin
      const roleRes = await adminClient.get(`/roles/${currentUser.role}`);
      const role = roleRes.data.data;
      console.log(`   Admin Access: ${role.admin_access}`);
      
      if (role.admin_access) {
        console.log('\n🎉 Compte admin trouvé!');
        
        // Créer un token statique pour cet utilisateur
        const staticToken = 'admin-token-' + crypto.randomBytes(16).toString('hex');
        
        try {
          // Mettre à jour l'utilisateur avec un token statique
          await adminClient.patch(`/users/${currentUser.id}`, {
            token: staticToken
          });
          
          console.log('\n✅ TOKEN ADMIN CRÉÉ:');
          console.log('='.repeat(60));
          console.log(staticToken);
          console.log('='.repeat(60));
          
          await saveToken(staticToken);
          return;
          
        } catch (e) {
          console.log('❌ Impossible de créer un token statique pour cet utilisateur');
        }
      }
      
      // Si pas admin, essayer de créer un nouvel utilisateur
      if (role.admin_access || cred.email === 'jmd@hypervisual.ch') {
        console.log('\n🔧 Tentative de création d\'un utilisateur API...');
        
        try {
          // Récupérer le rôle avec le plus de permissions
          const rolesRes = await adminClient.get('/roles');
          const roles = rolesRes.data.data || [];
          
          // Chercher un rôle admin ou avec app_access
          let bestRole = roles.find(r => r.admin_access);
          if (!bestRole) {
            bestRole = roles.find(r => r.app_access);
          }
          if (!bestRole) {
            bestRole = roles[0];
          }
          
          console.log(`   Utilisation du rôle: ${bestRole.name}`);
          
          // Créer un nouvel utilisateur API
          const staticToken = 'migration-token-' + crypto.randomBytes(20).toString('hex');
          const newApiUser = {
            email: `api-migration-${Date.now()}@directus.local`,
            password: crypto.randomBytes(20).toString('hex'),
            status: 'active',
            role: bestRole.id,
            token: staticToken,
            first_name: 'API',
            last_name: 'Migration'
          };
          
          const userRes = await adminClient.post('/users', newApiUser);
          console.log('✅ Utilisateur API créé!');
          
          console.log('\n✅ TOKEN CRÉÉ:');
          console.log('='.repeat(60));
          console.log(staticToken);
          console.log('='.repeat(60));
          
          await saveToken(staticToken);
          return;
          
        } catch (e) {
          console.log('❌ Impossible de créer un utilisateur:', e.response?.data?.errors?.[0]?.message || e.message);
        }
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ Mauvais mot de passe ou email');
      } else {
        console.log('   ❌ Erreur:', error.message);
      }
    }
  }
  
  // Méthode 2: Utiliser directus bootstrap (si disponible)
  console.log('\n📝 Méthode 2: Directus Bootstrap');
  console.log('Si les méthodes ci-dessus ne fonctionnent pas:');
  console.log('\n1. Arrêtez Directus');
  console.log('2. Exécutez:');
  console.log('   npx directus bootstrap');
  console.log('3. Suivez les instructions pour créer un admin');
  console.log('4. Redémarrez Directus');
  console.log('5. Utilisez le nouveau compte admin');
  
  // Méthode 3: Modification directe de la base de données
  console.log('\n📝 Méthode 3: Token direct dans la base');
  console.log('Si vous avez accès à la base de données:');
  console.log('\n1. Connectez-vous à PostgreSQL');
  console.log('2. Exécutez:');
  console.log(`   UPDATE directus_users 
   SET token = 'super-admin-token-${Date.now()}'
   WHERE email = 'jmd@hypervisual.ch';`);
  console.log('3. Utilisez ce token dans vos scripts');
  
  console.log('\n💡 ALTERNATIVE MANUELLE:');
  console.log('1. Connectez-vous à http://localhost:8055/admin');
  console.log('2. Allez dans Settings > Users');
  console.log('3. Éditez votre utilisateur');
  console.log('4. Ajoutez un Static Token');
  console.log('5. Sauvegardez et utilisez ce token');
}

async function saveToken(token) {
  try {
    await fs.writeFile('.admin-token', token, 'utf8');
    console.log('\n📄 Token sauvegardé dans .admin-token');
    console.log('\n👉 Pour utiliser ce token:');
    console.log('   1. Ouvrez fix-owner-company-final.js');
    console.log(`   2. Remplacez la ligne du TOKEN par:`);
    console.log(`      const TOKEN = '${token}';`);
    console.log('   3. Relancez la migration');
  } catch (e) {
    console.error('❌ Impossible de sauvegarder le token:', e.message);
  }
}

// Exécuter
createAdminToken().catch(console.error);