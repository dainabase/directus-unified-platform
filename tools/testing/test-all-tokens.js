#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';

// TOUS les tokens potentiels à tester
const TOKENS_TO_TEST = [
  {
    name: 'Token Principal (JMD)',
    token: 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW'
  },
  {
    name: 'Token Admin .env',
    token: 'de366613eba7c0fa39d9e6c3ced8b0ac282fe7726741e44d9f04dd65ca67ca3c'
  },
  {
    name: 'Token Directus .env',
    token: 'de366613eba7c0fa39d9e6c3ced8b0ac282fe7726741e44d9f04dd65ca67ca3c'
  },
  {
    name: 'Dashboard Token',
    token: 'dashboard-token-2025'
  }
];

// Variable pour stocker le meilleur token trouvé
let bestToken = null;
let bestTokenInfo = null;

async function testTokenPermissions() {
  console.log('🔐 TEST DES PERMISSIONS DES TOKENS');
  console.log('='.repeat(80));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`API URL: ${API_URL}`);
  console.log('='.repeat(80));
  
  // D'abord chercher d'autres tokens dans les fichiers
  await searchForMoreTokens();
  
  console.log(`\n📋 Total tokens à tester: ${TOKENS_TO_TEST.length}`);
  
  for (const tokenInfo of TOKENS_TO_TEST) {
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`🔑 Test: ${tokenInfo.name}`);
    console.log('Token:', tokenInfo.token.substring(0, 20) + '...');
    console.log('='.repeat(60));
    
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${tokenInfo.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const tokenScore = {
      canReadUser: false,
      canReadRole: false,
      canReadPermissions: false,
      canCreateFields: false,
      isAdmin: false,
      score: 0
    };
    
    // Test 1: Récupération utilisateur
    try {
      const userRes = await client.get('/users/me');
      const user = userRes.data.data;
      console.log('✅ Utilisateur:', user.email);
      console.log('   ID:', user.id);
      console.log('   Role ID:', user.role);
      console.log('   Status:', user.status);
      tokenScore.canReadUser = true;
      tokenScore.score += 1;
      
      // Test 2: Récupération des détails du rôle
      try {
        const roleRes = await client.get(`/roles/${user.role}`);
        const role = roleRes.data.data;
        console.log('\n✅ Role Name:', role.name);
        console.log('   Admin Access:', role.admin_access);
        console.log('   App Access:', role.app_access);
        tokenScore.canReadRole = true;
        tokenScore.score += 1;
        
        if (role.admin_access) {
          tokenScore.isAdmin = true;
          tokenScore.score += 10;
        }
      } catch (e) {
        console.log('❌ Cannot fetch role details');
      }
      
      // Test 3: Permissions sur les collections
      try {
        const permRes = await client.get('/permissions', {
          params: {
            filter: { role: { _eq: user.role } },
            limit: -1
          }
        });
        const permissions = permRes.data.data || [];
        
        // Compter les permissions par action
        const permsByAction = {};
        permissions.forEach(p => {
          if (!permsByAction[p.action]) permsByAction[p.action] = 0;
          permsByAction[p.action]++;
        });
        
        console.log('\n✅ Permissions:');
        console.log('   Total count:', permissions.length);
        console.log('   By action:', permsByAction);
        tokenScore.canReadPermissions = true;
        tokenScore.score += 2;
        
        // Vérifier permissions spécifiques sur directus_fields
        const fieldPerms = permissions.filter(p => p.collection === 'directus_fields');
        if (fieldPerms.length > 0) {
          console.log('   Directus fields permissions:', fieldPerms.map(p => p.action).join(', '));
        }
        
      } catch (e) {
        console.log('❌ Cannot fetch permissions');
      }
      
      // Test 4: Essayer de créer un champ (TEST CRITIQUE)
      console.log('\n📝 Test création de champ:');
      try {
        // Essayer sur une collection de test
        const testField = {
          collection: 'companies',
          field: 'test_permission_' + Date.now(),
          type: 'string',
          schema: {
            name: 'test_permission_' + Date.now(),
            table: 'companies',
            data_type: 'varchar',
            max_length: 50,
            is_nullable: true
          },
          meta: {
            collection: 'companies',
            field: 'test_permission_' + Date.now(),
            interface: 'input',
            hidden: true,
            readonly: false,
            required: false
          }
        };
        
        // Essayer sur la collection 'companies'
        const fieldRes = await client.post('/fields/companies', testField);
        console.log('✅ PEUT CRÉER DES CHAMPS! 🎉');
        tokenScore.canCreateFields = true;
        tokenScore.score += 20;
        
        // Supprimer le champ de test
        await client.delete(`/fields/companies/${testField.field}`);
        console.log('   ✅ Champ de test supprimé');
        
      } catch (error) {
        console.log('❌ NE PEUT PAS créer de champs:', error.response?.status);
        if (error.response?.data?.errors) {
          console.log('   Erreur:', error.response.data.errors[0].message);
        }
      }
      
      // Test 5: Lister les utilisateurs avec tokens (si admin)
      if (tokenScore.isAdmin || tokenScore.canCreateFields) {
        try {
          const usersRes = await client.get('/users', {
            params: {
              filter: { token: { _nnull: true } },
              fields: ['email', 'token', 'role', 'status'],
              limit: -1
            }
          });
          const usersWithTokens = usersRes.data.data || [];
          
          if (usersWithTokens.length > 0) {
            console.log('\n📋 Autres utilisateurs avec tokens:');
            usersWithTokens.forEach(u => {
              if (u.token) {
                console.log(`   - ${u.email}: ${u.token.substring(0, 20)}... (status: ${u.status})`);
                
                // Ajouter ce token à la liste s'il n'y est pas déjà
                if (!TOKENS_TO_TEST.find(t => t.token === u.token)) {
                  TOKENS_TO_TEST.push({
                    name: `Token de ${u.email}`,
                    token: u.token
                  });
                }
              }
            });
          }
        } catch (e) {
          // Normal si pas admin
        }
      }
      
      // Calculer le score final
      console.log(`\n📊 Score du token: ${tokenScore.score}/33`);
      console.log('   - Peut lire utilisateur:', tokenScore.canReadUser ? '✅' : '❌');
      console.log('   - Peut lire rôle:', tokenScore.canReadRole ? '✅' : '❌');
      console.log('   - Peut lire permissions:', tokenScore.canReadPermissions ? '✅' : '❌');
      console.log('   - Peut créer des fields:', tokenScore.canCreateFields ? '✅' : '❌');
      console.log('   - Est admin:', tokenScore.isAdmin ? '✅' : '❌');
      
      // Garder le meilleur token
      if (!bestToken || tokenScore.score > bestToken.score) {
        bestToken = tokenScore;
        bestTokenInfo = tokenInfo;
      }
      
    } catch (error) {
      console.log('❌ Token invalide ou erreur');
      if (error.response?.status === 401) {
        console.log('   Erreur: Non autorisé (token invalide)');
      } else if (error.response?.status === 403) {
        console.log('   Erreur: Permissions insuffisantes');
      } else {
        console.log('   Erreur:', error.message);
      }
    }
  }
  
  // Résumé final
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('='.repeat(80));
  
  if (bestToken && bestToken.canCreateFields) {
    console.log('\n✅ MEILLEUR TOKEN TROUVÉ:');
    console.log(`   Nom: ${bestTokenInfo.name}`);
    console.log(`   Token: ${bestTokenInfo.token}`);
    console.log(`   Score: ${bestToken.score}/33`);
    console.log('\n🎉 CE TOKEN PEUT CRÉER DES FIELDS!');
    console.log('\n👉 Utilise ce token dans fix-owner-company-final.js:');
    console.log(`   const TOKEN = '${bestTokenInfo.token}';`);
    
    // Sauvegarder le meilleur token
    try {
      await fs.writeFile('.best-token', bestTokenInfo.token, 'utf8');
      console.log('\n✅ Token sauvegardé dans .best-token');
    } catch (e) {
      // Ignorer
    }
    
  } else {
    console.log('\n❌ AUCUN TOKEN AVEC LES PERMISSIONS NÉCESSAIRES');
    console.log('\n💡 Recommandations:');
    console.log('   1. Exécute create-admin-token.js pour créer un nouveau token admin');
    console.log('   2. Ou connecte-toi à Directus Admin et modifie les permissions');
    console.log('   3. Ou utilise directus bootstrap pour créer un token admin');
  }
}

async function searchForMoreTokens() {
  console.log('\n🔍 Recherche de tokens dans les fichiers...');
  
  // Chercher dans .env
  try {
    const envContent = await fs.readFile('.env', 'utf8');
    
    // Patterns pour trouver des tokens
    const patterns = [
      /TOKEN\s*=\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
      /API_TOKEN\s*=\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
      /DIRECTUS_TOKEN\s*=\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
      /ADMIN_TOKEN\s*=\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = envContent.matchAll(pattern);
      for (const match of matches) {
        const token = match[1];
        if (token && token !== 'your-token-here' && !TOKENS_TO_TEST.find(t => t.token === token)) {
          console.log(`   Trouvé dans .env: ${token.substring(0, 20)}...`);
          TOKENS_TO_TEST.push({
            name: 'Token depuis .env',
            token: token
          });
        }
      }
    });
    
  } catch (e) {
    console.log('   .env non trouvé ou non lisible');
  }
  
  // Chercher dans docker-compose.yml
  try {
    const dockerContent = await fs.readFile('docker-compose.yml', 'utf8');
    const tokenMatches = dockerContent.match(/ADMIN_TOKEN:\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi);
    if (tokenMatches) {
      tokenMatches.forEach(match => {
        const token = match.split(':')[1].trim().replace(/['"]/g, '');
        if (token && !TOKENS_TO_TEST.find(t => t.token === token)) {
          console.log(`   Trouvé dans docker-compose.yml: ${token.substring(0, 20)}...`);
          TOKENS_TO_TEST.push({
            name: 'Token depuis docker-compose',
            token: token
          });
        }
      });
    }
  } catch (e) {
    // docker-compose.yml n'existe pas
  }
}

// Exécuter le test
testTokenPermissions().catch(console.error);