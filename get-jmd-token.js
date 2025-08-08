#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';

async function getJMDToken() {
  console.log('🔑 RÉCUPÉRATION DU TOKEN DE JMD');
  console.log('='.repeat(80));
  
  try {
    // Login
    console.log('Connexion avec jmd@hypervisual.ch...');
    
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
    
    // Récupérer les infos utilisateur avec le token
    const meRes = await client.get('/users/me', {
      params: {
        fields: ['*', 'token']
      }
    });
    const user = meRes.data.data;
    
    if (user.token) {
      console.log('\n✅ TOKEN TROUVÉ!');
      console.log('='.repeat(60));
      console.log(user.token);
      console.log('='.repeat(60));
      
      // Sauvegarder le token
      await fs.writeFile('.jmd-token', user.token, 'utf8');
      console.log('\n📄 Token sauvegardé dans .jmd-token');
      
      // Aussi sauvegarder comme best-token
      await fs.writeFile('.best-token', user.token, 'utf8');
      console.log('📄 Token sauvegardé dans .best-token');
      
      console.log('\n👉 Utilisez ce token dans fix-owner-company-working.js');
      console.log(`   const TOKEN = '${user.token}';`);
      
      return user.token;
    } else {
      console.log('\n❌ Aucun token statique trouvé pour cet utilisateur');
      console.log('\n💡 Pour créer un token:');
      console.log('1. Connectez-vous à http://localhost:8055/admin');
      console.log('2. Allez dans votre profil (en haut à droite)');
      console.log('3. Dans la section "Token", ajoutez un token statique');
      console.log('4. Sauvegardez et relancez ce script');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter
getJMDToken().catch(console.error);