const express = require('express');
const router = express.Router();
const MauticAPI = require('./index');
const { Directus } = require('@directus/sdk');

// Initialiser Mautic API
const mautic = new MauticAPI({
  baseURL: process.env.MAUTIC_URL || 'http://localhost:8084',
  username: process.env.MAUTIC_USERNAME || 'admin',
  password: process.env.MAUTIC_PASSWORD || 'Admin@Mautic2025'
});

// Initialiser Directus
const directus = new Directus('http://localhost:8055');

// Synchroniser un contact
router.post('/sync-contact', async (req, res) => {
  try {
    const contact = await mautic.upsertContact(req.body);
    res.json({ success: true, mautic_id: contact.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter à une campagne
router.post('/add-to-campaign', async (req, res) => {
  try {
    const { contact_id, campaign_id } = req.body;
    await mautic.addToCampaign(contact_id, campaign_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import en masse
router.post('/bulk-import', async (req, res) => {
  try {
    const { filter } = req.body;
    
    // Authentifier avec Directus
    await directus.auth.static(process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW');
    
    // Construire la requête selon le filtre
    let query = { limit: -1 };
    
    if (filter === 'new') {
      query.filter = {
        mautic_id: { _null: true }
      };
    } else if (filter === 'company') {
      query.filter = {
        company_id: req.body.company_id
      };
    }
    
    // Récupérer les contacts depuis Directus
    const contacts = await directus.items('contacts').readByQuery(query);
    
    // Importer dans Mautic
    const result = await mautic.bulkImportContacts(contacts.data);
    
    // Mettre à jour les contacts avec leur ID Mautic
    for (const contact of contacts.data) {
      if (result.imported > 0) {
        try {
          const mauticContact = await mautic.api.get('/contacts', {
            params: { search: `email:${contact.email}` }
          });
          
          if (mauticContact.data.total > 0) {
            const mauticId = Object.keys(mauticContact.data.contacts)[0];
            await directus.items('contacts').updateOne(contact.id, {
              mautic_id: mauticId
            });
          }
        } catch (err) {
          console.error('Erreur mise à jour contact:', err);
        }
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur import en masse:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les statistiques
router.get('/stats', async (req, res) => {
  try {
    const stats = await mautic.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les campagnes actives
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await mautic.getActiveCampaigns();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook Mautic
router.post('/webhook', async (req, res) => {
  try {
    const { trigger, lead, event } = req.body;
    
    console.log('Webhook Mautic reçu:', trigger);
    
    // Traiter les événements Mautic
    if (trigger === 'lead.updated' || trigger === 'mautic.lead_post_save_update') {
      // Mettre à jour le scoring dans Directus
      if (lead && lead.fields && lead.fields.email) {
        await directus.auth.static(process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW');
        
        // Chercher le contact par email
        const contacts = await directus.items('contacts').readByQuery({
          filter: {
            email: { _eq: lead.fields.email.value }
          }
        });
        
        if (contacts.data && contacts.data.length > 0) {
          const contact = contacts.data[0];
          await directus.items('contacts').updateOne(contact.id, {
            mautic_score: lead.points || 0,
            mautic_last_active: new Date().toISOString()
          });
        }
      }
    } else if (trigger === 'email.open') {
      // Enregistrer l'ouverture d'email
      console.log('Email ouvert par:', lead?.fields?.email?.value);
    } else if (trigger === 'page.hit') {
      // Enregistrer la visite de page
      console.log('Page visitée par:', lead?.fields?.email?.value);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(200).send('OK'); // Toujours retourner 200 pour éviter les renvois
  }
});

// Test de connexion
router.get('/test', async (req, res) => {
  try {
    const stats = await mautic.getStats();
    res.json({
      success: true,
      message: 'Connexion Mautic OK',
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;