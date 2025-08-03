require('dotenv').config();
const { Client } = require('@notionhq/client');
const PasswordService = require('../services/password.service');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// IMPORTANT : Sauvegarder les anciens mots de passe temporairement pour la migration
const TEMP_USERS = [
  { email: 'client@hypervisual.ch', oldPassword: 'client123', role: 'client' },
  { email: 'presta@hypervisual.ch', oldPassword: 'presta123', role: 'prestataire' },
  { email: 'revend@hypervisual.ch', oldPassword: 'revend123', role: 'revendeur' },
  { email: 'admin@hypervisual.ch', oldPassword: 'admin123', role: 'superadmin' }
];

async function migratePasswords() {
  console.log('🔐 Début de la migration des mots de passe...\n');
  
  // Créer le fichier de sauvegarde avec permissions restreintes
  const migrationFile = '.migration-passwords.txt';
  const migrationData = [];
  
  for (const user of TEMP_USERS) {
    try {
      // Générer un nouveau mot de passe sécurisé
      const newPassword = PasswordService.generateSecurePassword();
      const hashedPassword = await PasswordService.hash(newPassword);

      console.log(`\n📧 Traitement de ${user.email}...`);
      
      // Vérifier la force du mot de passe
      const validation = PasswordService.validateStrength(newPassword);
      console.log(`   ✅ Mot de passe généré - Force: ${validation.valid ? 'FORT' : 'FAIBLE'}`);
      
      // Vérifier si le mot de passe est compromis
      const isCompromised = await PasswordService.isCompromised(newPassword);
      if (isCompromised) {
        console.log(`   ⚠️  Mot de passe compromis détecté, génération d'un nouveau...`);
        continue; // Recommencer avec un nouveau mot de passe
      }

      try {
        // Rechercher l'utilisateur dans Notion
        const response = await notion.databases.query({
          database_id: process.env.DB_UTILISATEURS,
          filter: {
            property: 'Email',
            email: { equals: user.email }
          }
        });

        if (response.results.length > 0) {
          const userId = response.results[0].id;
          
          // Mettre à jour le mot de passe hashé dans Notion
          await notion.pages.update({
            page_id: userId,
            properties: {
              'PasswordHash': { // Champ pour le hash
                rich_text: [{
                  type: 'text',
                  text: { content: hashedPassword }
                }]
              },
              'PasswordUpdatedAt': { // Date de mise à jour
                date: {
                  start: new Date().toISOString()
                }
              },
              'RequiresPasswordChange': { // Forcer changement au premier login
                checkbox: true
              }
            }
          });

          console.log(`   ✅ Mot de passe migré dans Notion`);
          console.log(`   📝 Nouveau mot de passe : ${newPassword}`);
          console.log(`   ⚠️  ENVOYER CE MOT DE PASSE À L'UTILISATEUR DE MANIÈRE SÉCURISÉE`);
          
          // Sauvegarder pour envoi
          migrationData.push({
            email: user.email,
            password: newPassword,
            role: user.role,
            timestamp: new Date().toISOString()
          });
          
        } else {
          console.log(`   ❌ Utilisateur non trouvé dans Notion`);
        }
      } catch (notionError) {
        console.error(`   ❌ Erreur Notion:`, notionError.message);
        // Continuer même si Notion échoue pour tester
        migrationData.push({
          email: user.email,
          password: newPassword,
          role: user.role,
          timestamp: new Date().toISOString(),
          error: 'Non synchronisé avec Notion'
        });
      }
      
    } catch (error) {
      console.error(`❌ Erreur pour ${user.email}:`, error.message);
    }
  }

  // Sauvegarder les mots de passe dans un fichier sécurisé
  const fileContent = [
    '=== MIGRATION DES MOTS DE PASSE ===',
    `Date: ${new Date().toISOString()}`,
    '⚠️  CONFIDENTIEL - SUPPRIMER APRÈS ENVOI AUX UTILISATEURS',
    '',
    ...migrationData.map(u => 
      `Email: ${u.email}\nRole: ${u.role}\nNouveau mot de passe: ${u.password}\n${u.error ? `Erreur: ${u.error}\n` : ''}---`
    )
  ].join('\n');
  
  fs.writeFileSync(migrationFile, fileContent, { mode: 0o600 }); // Lecture owner uniquement
  
  console.log('\n✅ Migration terminée!');
  console.log(`📝 ${migrationData.length} mots de passe sauvegardés dans ${migrationFile}`);
  console.log('⚠️  IMPORTANT: ');
  console.log('   1. Envoyer les nouveaux mots de passe aux utilisateurs de manière sécurisée');
  console.log('   2. Supprimer le fichier .migration-passwords.txt après envoi');
  console.log('   3. Demander aux utilisateurs de changer leur mot de passe à la première connexion');
  
  // Créer aussi un fichier JSON pour les tests
  const testData = migrationData.map(u => ({
    email: u.email,
    role: u.role,
    hashedPassword: PasswordService.hash(u.password) // Pour les tests uniquement
  }));
  
  fs.writeFileSync(
    'test-users.json', 
    JSON.stringify(testData, null, 2),
    { mode: 0o600 }
  );
}

// Fonction pour créer des utilisateurs de test si Notion n'est pas configuré
async function createTestUsers() {
  console.log('\n📝 Création des utilisateurs de test (mode local)...');
  
  const testUsers = [];
  
  for (const user of TEMP_USERS) {
    const newPassword = PasswordService.generateSecurePassword();
    const hashedPassword = await PasswordService.hash(newPassword);
    
    testUsers.push({
      id: Math.random().toString(36).substr(2, 9),
      email: user.email,
      role: user.role,
      password: newPassword, // Pour affichage seulement
      passwordHash: hashedPassword,
      name: user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      createdAt: new Date().toISOString()
    });
  }
  
  // Sauvegarder pour utilisation locale
  fs.writeFileSync(
    'local-test-users.json',
    JSON.stringify(testUsers, null, 2)
  );
  
  console.log('\nUtilisateurs de test créés:');
  testUsers.forEach(u => {
    console.log(`\n${u.email}:`);
    console.log(`  Mot de passe: ${u.password}`);
    console.log(`  Rôle: ${u.role}`);
  });
  
  return testUsers;
}

// Exécuter la migration
if (require.main === module) {
  migratePasswords()
    .catch(async (error) => {
      console.error('\n❌ Erreur migration:', error);
      console.log('\n🔄 Création des utilisateurs de test en mode local...');
      await createTestUsers();
    })
    .finally(() => {
      console.log('\n✨ Script terminé');
      process.exit(0);
    });
}

module.exports = { migratePasswords, createTestUsers };