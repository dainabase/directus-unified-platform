const MauticAPI = require('../../../src/backend/api/mautic');
require('dotenv').config();

async function setupMauticCampaigns() {
  console.log('🚀 Configuration des campagnes Mautic...');
  
  const mautic = new MauticAPI({
    baseURL: process.env.MAUTIC_URL || 'http://localhost:8084',
    username: process.env.MAUTIC_USERNAME || 'admin',
    password: process.env.MAUTIC_PASSWORD || 'Admin@Mautic2025'
  });

  try {
    // Test de connexion
    console.log('📡 Test de connexion à Mautic...');
    const stats = await mautic.getStats();
    console.log('✅ Connexion OK! Stats actuelles:', stats);

    // Créer segments par entreprise
    console.log('\n📊 Création des segments par entreprise...');
    const companies = ['HyperVisual', 'Dynamics', 'Lexia', 'NKReality', 'Etekout'];
    const segments = {};
    
    for (const company of companies) {
      try {
        const segment = await mautic.createSegment({
          name: `Clients ${company}`,
          alias: `clients-${company.toLowerCase()}`,
          filters: [{
            glue: 'and',
            field: 'company',
            object: 'lead',
            type: 'text',
            operator: 'eq',
            filter: company
          }]
        });
        segments[company] = segment.id;
        console.log(`✅ Segment créé: Clients ${company} (ID: ${segment.id})`);
      } catch (error) {
        console.log(`⚠️ Segment ${company} existe peut-être déjà:`, error.message);
      }
    }

    // Créer templates d'emails
    console.log('\n📧 Création des templates d\'emails...');
    const emailTemplates = [];
    
    try {
      // Email de bienvenue
      const welcomeEmail = await mautic.createEmail({
        name: 'Email de Bienvenue',
        subject: 'Bienvenue chez {leadfield=company} !',
        content: `
          <!DOCTYPE html>
          <html>
          <head>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Bienvenue {leadfield=firstname} !</h1>
                  </div>
                  <div class="content">
                      <p>Nous sommes ravis de vous compter parmi nos clients.</p>
                      <p>Chez <strong>{leadfield=company}</strong>, nous nous engageons à vous fournir les meilleurs services.</p>
                      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                      <a href="http://localhost:3000/client" class="button">Accéder à votre espace client</a>
                  </div>
              </div>
          </body>
          </html>
        `
      });
      emailTemplates.push(welcomeEmail);
      console.log(`✅ Template créé: Email de Bienvenue (ID: ${welcomeEmail.id})`);

      // Email de suivi
      const followUpEmail = await mautic.createEmail({
        name: 'Email de Suivi',
        subject: '{leadfield=firstname}, comment se passe votre expérience ?',
        content: `
          <!DOCTYPE html>
          <html>
          <head>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #667eea; }
                  .content { padding: 30px; }
                  .cta { text-align: center; margin: 30px 0; }
                  .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2>Comment se passe votre expérience ?</h2>
                  </div>
                  <div class="content">
                      <p>Bonjour {leadfield=firstname},</p>
                      <p>Cela fait maintenant quelques jours que vous utilisez nos services.</p>
                      <p>Nous aimerions avoir votre retour pour continuer à nous améliorer.</p>
                      <div class="cta">
                          <a href="#" class="button">Donner mon avis</a>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `
      });
      emailTemplates.push(followUpEmail);
      console.log(`✅ Template créé: Email de Suivi (ID: ${followUpEmail.id})`);

    } catch (error) {
      console.log('⚠️ Erreur création templates:', error.message);
    }

    // Créer campagne de bienvenue
    console.log('\n🎯 Création de la campagne de bienvenue...');
    try {
      const welcomeCampaign = await mautic.createCampaign({
        name: 'Campagne de Bienvenue Automatique',
        description: 'Séquence d\'emails automatique pour les nouveaux clients',
        events: [
          {
            name: 'Déclencheur: Nouveau Contact',
            description: 'Déclenché quand un contact est ajouté',
            type: 'lead.create',
            eventType: 'trigger',
            order: 1
          },
          {
            name: 'Envoyer Email de Bienvenue',
            description: 'Envoyer l\'email de bienvenue immédiatement',
            type: 'email.send',
            eventType: 'action',
            order: 2,
            properties: {
              email: emailTemplates[0]?.id || 1
            }
          },
          {
            name: 'Attendre 3 jours',
            type: 'interval',
            eventType: 'decision',
            order: 3,
            properties: {
              interval_value: 3,
              interval_unit: 'd'
            }
          },
          {
            name: 'Envoyer Email de Suivi',
            type: 'email.send',
            eventType: 'action',
            order: 4,
            properties: {
              email: emailTemplates[1]?.id || 2
            }
          }
        ],
        segments: Object.values(segments)
      });
      
      console.log(`✅ Campagne créée: ${welcomeCampaign.name} (ID: ${welcomeCampaign.id})`);
    } catch (error) {
      console.log('⚠️ Erreur création campagne:', error.message);
    }

    // Créer campagne de réengagement
    console.log('\n🎯 Création de la campagne de réengagement...');
    try {
      const reengagementCampaign = await mautic.createCampaign({
        name: 'Campagne de Réengagement',
        description: 'Réactiver les contacts inactifs',
        events: [
          {
            name: 'Déclencheur: Inactivité 30 jours',
            type: 'lead.inactive',
            eventType: 'trigger',
            order: 1,
            properties: {
              days_inactive: 30
            }
          },
          {
            name: 'Envoyer Email de Réengagement',
            type: 'email.send',
            eventType: 'action',
            order: 2,
            properties: {
              email: 3
            }
          }
        ]
      });
      
      console.log(`✅ Campagne créée: ${reengagementCampaign.name} (ID: ${reengagementCampaign.id})`);
    } catch (error) {
      console.log('⚠️ Erreur création campagne réengagement:', error.message);
    }

    console.log('\n✅ Configuration terminée!');
    console.log('\n📌 Prochaines étapes:');
    console.log('1. Connectez-vous à Mautic: http://localhost:8084');
    console.log('2. Configurez les paramètres SMTP pour l\'envoi d\'emails');
    console.log('3. Testez l\'import de contacts depuis Directus');
    console.log('4. Activez les webhooks dans Mautic pour la synchronisation bidirectionnelle');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  setupMauticCampaigns().catch(console.error);
}

module.exports = setupMauticCampaigns;