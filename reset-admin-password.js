#!/usr/bin/env node

import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:8055';

// Générer un nouveau mot de passe
const newPassword = 'Directus2025!';

console.log('🔐 Réinitialisation du mot de passe admin Directus');
console.log('='.repeat(50));
console.log(`Email: admin@dainabase.com`);
console.log(`Nouveau mot de passe: ${newPassword}`);
console.log('='.repeat(50));

// Fonction pour hasher le mot de passe (Directus utilise argon2 mais on va essayer avec l'API)
async function resetPassword() {
  try {
    // D'abord, essayons de nous connecter avec le token que nous utilisons
    const adminToken = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
    
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    // Chercher l'utilisateur admin
    console.log('\n🔍 Recherche de l\'utilisateur admin...');
    const usersResponse = await client.get('/users', {
      params: {
        filter: {
          email: { _eq: 'admin@dainabase.com' }
        }
      }
    });
    
    const adminUser = usersResponse.data?.data?.[0];
    
    if (!adminUser) {
      console.error('❌ Utilisateur admin@dainabase.com non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${adminUser.id}`);
    
    // Mettre à jour le mot de passe
    console.log('\n🔄 Mise à jour du mot de passe...');
    await client.patch(`/users/${adminUser.id}`, {
      password: newPassword
    });
    
    console.log('✅ Mot de passe mis à jour avec succès!');
    
    console.log('\n📝 Instructions de connexion:');
    console.log('1. Allez sur http://localhost:8055/admin');
    console.log('2. Email: admin@dainabase.com');
    console.log(`3. Mot de passe: ${newPassword}`);
    console.log('\n⚠️  Changez ce mot de passe après votre première connexion!');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.response?.data?.errors?.[0]?.message || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n💡 Alternative: Utilisez la commande Directus CLI');
      console.log('1. Assurez-vous que PostgreSQL est démarré');
      console.log('2. Exécutez: npx directus users passwd --email admin@dainabase.com');
    }
  }
}

// Alternative: créer un nouvel admin si nécessaire
async function createNewAdmin() {
  console.log('\n🆕 Tentative de création d\'un nouvel admin...');
  
  try {
    // Utiliser l'endpoint public de création si disponible
    const response = await axios.post(`${API_URL}/users`, {
      email: 'admin@directus.local',
      password: newPassword,
      role: '1', // ID du rôle admin (généralement 1)
      status: 'active',
      first_name: 'Admin',
      last_name: 'Directus'
    });
    
    console.log('✅ Nouvel admin créé: admin@directus.local');
    console.log(`   Mot de passe: ${newPassword}`);
    
  } catch (error) {
    console.log('❌ Impossible de créer un nouvel admin');
  }
}

// Exécuter
resetPassword().catch(async (error) => {
  console.error('Tentative de reset échouée, essai de création...');
  await createNewAdmin();
});