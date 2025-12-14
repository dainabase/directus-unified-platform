/**
 * Mautic Router - ES Modules
 * Routes API pour l'integration Mautic
 * @version 2.0.0
 */

import express from 'express';
import MauticAPI from './index.js';
import { createDirectus, rest, authentication, readItems, updateItem } from '@directus/sdk';

const router = express.Router();

// Initialiser Mautic API
const mautic = new MauticAPI({
  baseURL: process.env.MAUTIC_URL || 'http://localhost:8084',
  username: process.env.MAUTIC_USERNAME || 'admin',
  password: process.env.MAUTIC_PASSWORD || 'Admin@Mautic2025'
});

// Initialiser Directus SDK v17
const directus = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

// Synchroniser un contact
router.post('/sync-contact', async (req, res) => {
  try {
    const contact = await mautic.upsertContact(req.body);
    res.json({ success: true, mautic_id: contact.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter a une campagne
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
    directus.setToken(process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW');

    // Construire la requete selon le filtre
    let queryFilter = {};

    if (filter === 'new') {
      queryFilter = { mautic_id: { _null: true } };
    } else if (filter === 'company') {
      queryFilter = { company_id: req.body.company_id };
    }

    // Recuperer les contacts depuis Directus
    const contacts = await directus.request(
      readItems('contacts', {
        filter: queryFilter,
        limit: -1
      })
    );

    // Importer dans Mautic
    const result = await mautic.bulkImportContacts(contacts);

    // Mettre a jour les contacts avec leur ID Mautic
    for (const contact of contacts) {
      if (result.imported > 0) {
        try {
          const mauticContact = await mautic.api.get('/contacts', {
            params: { search: `email:${contact.email}` }
          });

          if (mauticContact.data.total > 0) {
            const mauticId = Object.keys(mauticContact.data.contacts)[0];
            await directus.request(
              updateItem('contacts', contact.id, {
                mautic_id: mauticId
              })
            );
          }
        } catch (err) {
          console.error('Erreur mise a jour contact:', err);
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur import en masse:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recuperer les statistiques
router.get('/stats', async (req, res) => {
  try {
    const stats = await mautic.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recuperer les campagnes actives
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
    const { trigger, lead } = req.body;

    console.log('Webhook Mautic recu:', trigger);

    // Traiter les evenements Mautic
    if (trigger === 'lead.updated' || trigger === 'mautic.lead_post_save_update') {
      if (lead && lead.fields && lead.fields.email) {
        directus.setToken(process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW');

        // Chercher le contact par email
        const contacts = await directus.request(
          readItems('contacts', {
            filter: { email: { _eq: lead.fields.email.value } }
          })
        );

        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          await directus.request(
            updateItem('contacts', contact.id, {
              mautic_score: lead.points || 0,
              mautic_last_active: new Date().toISOString()
            })
          );
        }
      }
    } else if (trigger === 'email.open') {
      console.log('Email ouvert par:', lead?.fields?.email?.value);
    } else if (trigger === 'page.hit') {
      console.log('Page visitee par:', lead?.fields?.email?.value);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(200).send('OK');
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

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'mautic',
    timestamp: new Date().toISOString()
  });
});

export default router;
