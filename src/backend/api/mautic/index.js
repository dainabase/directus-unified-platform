/**
 * Mautic API Service
 * Integration Mautic Marketing Automation - ES Modules
 * @version 2.0.0
 */

import axios from 'axios';

class MauticAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'http://localhost:8084';
    this.username = config.username;
    this.password = config.password;

    this.api = axios.create({
      baseURL: `${this.baseURL}/api`,
      auth: {
        username: this.username,
        password: this.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Creer/Mettre a jour un contact
  async upsertContact(contact) {
    try {
      const search = await this.api.get('/contacts', {
        params: { search: `email:${contact.email}` }
      });

      let mauticContact = {
        firstname: contact.first_name,
        lastname: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        tags: contact.tags || ['directus-import'],
        customFields: {
          directus_id: contact.id,
          company_id: contact.company_id
        }
      };

      if (search.data.total > 0) {
        const existingId = Object.keys(search.data.contacts)[0];
        const response = await this.api.patch(`/contacts/${existingId}`, mauticContact);
        return response.data.contact;
      } else {
        const response = await this.api.post('/contacts/new', mauticContact);
        return response.data.contact;
      }
    } catch (error) {
      console.error('Erreur upsert contact:', error.response?.data || error.message);
      throw error;
    }
  }

  // Ajouter a un segment
  async addToSegment(contactId, segmentId) {
    try {
      return await this.api.post(`/segments/${segmentId}/contact/${contactId}/add`);
    } catch (error) {
      console.error('Erreur ajout segment:', error.response?.data || error.message);
      throw error;
    }
  }

  // Ajouter a une campagne
  async addToCampaign(contactId, campaignId) {
    try {
      return await this.api.post(`/campaigns/${campaignId}/contact/${contactId}/add`);
    } catch (error) {
      console.error('Erreur ajout campagne:', error.response?.data || error.message);
      throw error;
    }
  }

  // Creer une campagne
  async createCampaign(campaign) {
    try {
      const mauticCampaign = {
        name: campaign.name,
        description: campaign.description,
        isPublished: true,
        events: campaign.events || [],
        lists: campaign.segments || []
      };

      const response = await this.api.post('/campaigns/new', mauticCampaign);
      return response.data.campaign;
    } catch (error) {
      console.error('Erreur creation campagne:', error.response?.data || error.message);
      throw error;
    }
  }

  // Creer un segment
  async createSegment(segment) {
    try {
      const mauticSegment = {
        name: segment.name,
        alias: segment.alias,
        isPublished: true,
        filters: segment.filters || []
      };

      const response = await this.api.post('/segments/new', mauticSegment);
      return response.data.list;
    } catch (error) {
      console.error('Erreur creation segment:', error.response?.data || error.message);
      throw error;
    }
  }

  // Creer un email
  async createEmail(email) {
    try {
      const mauticEmail = {
        name: email.name,
        subject: email.subject,
        customHtml: email.content,
        isPublished: true,
        emailType: 'template'
      };

      const response = await this.api.post('/emails/new', mauticEmail);
      return response.data.email;
    } catch (error) {
      console.error('Erreur creation email:', error.response?.data || error.message);
      throw error;
    }
  }

  // Tracking des evenements
  async trackEvent(contactId, event) {
    try {
      return await this.api.post('/events/new', {
        contact_id: contactId,
        event: event.name,
        event_properties: event.properties
      });
    } catch (error) {
      console.error('Erreur tracking evenement:', error.response?.data || error.message);
      throw error;
    }
  }

  // Recuperer les statistiques
  async getStats() {
    try {
      const [contacts, campaigns, emails] = await Promise.all([
        this.api.get('/contacts?limit=1'),
        this.api.get('/campaigns?limit=1'),
        this.api.get('/emails?limit=1')
      ]);

      const emailStats = await this.api.get('/emails/1/stats');

      return {
        contacts: contacts.data.total || 0,
        campaigns: campaigns.data.total || 0,
        emails: emails.data.total || 0,
        emails_sent: emailStats.data?.sent || 0,
        open_rate: emailStats.data?.openRate || 0
      };
    } catch (error) {
      console.error('Erreur recuperation stats:', error.response?.data || error.message);
      return {
        contacts: 0,
        campaigns: 0,
        emails: 0,
        emails_sent: 0,
        open_rate: 0
      };
    }
  }

  // Recuperer les campagnes actives
  async getActiveCampaigns() {
    try {
      const response = await this.api.get('/campaigns', {
        params: {
          isPublished: 1,
          limit: 10
        }
      });

      return response.data.campaigns || [];
    } catch (error) {
      console.error('Erreur recuperation campagnes:', error.response?.data || error.message);
      return [];
    }
  }

  // Envoyer un email transactionnel a un contact
  async sendEmail(contactId, emailData) {
    try {
      // Creer l'email transactionnel dans Mautic
      const mauticEmail = {
        name: emailData.name || `transactional-${Date.now()}`,
        subject: emailData.subject,
        customHtml: emailData.html,
        isPublished: true,
        emailType: 'template'
      };

      const emailResponse = await this.api.post('/emails/new', mauticEmail);
      const emailId = emailResponse.data.email?.id;

      if (!emailId) {
        throw new Error('Impossible de creer l email dans Mautic');
      }

      // Envoyer l'email au contact
      const sendResponse = await this.api.post(`/emails/${emailId}/contact/${contactId}/send`);
      return { success: true, emailId, sendResponse: sendResponse.data };
    } catch (error) {
      console.error('Erreur envoi email Mautic:', error.response?.data || error.message);
      throw error;
    }
  }

  // Envoyer un email direct par adresse (upsert contact puis envoie)
  async sendEmailToAddress(email, contact, emailData) {
    try {
      const mauticContact = await this.upsertContact({
        email,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        company: contact.company || '',
        tags: contact.tags || ['directus-automation']
      });
      return await this.sendEmail(mauticContact.id, emailData);
    } catch (error) {
      console.error('Erreur envoi email a:', email, error.message);
      throw error;
    }
  }

  // Import en masse depuis Directus
  async bulkImportContacts(contacts) {
    let imported = 0;
    let errors = [];

    for (const contact of contacts) {
      try {
        await this.upsertContact(contact);
        imported++;
      } catch (error) {
        errors.push({
          contact: contact.email,
          error: error.message
        });
      }
    }

    return {
      imported,
      total: contacts.length,
      errors
    };
  }
}

export default MauticAPI;
