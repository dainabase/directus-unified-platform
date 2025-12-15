/**
 * Integrations Services - Index
 *
 * Central export for all external integrations:
 * - DocuSeal (electronic signatures)
 * - Invoice Ninja (invoicing)
 * - Mautic (marketing automation)
 *
 * @date 15 Décembre 2025
 */

// DocuSeal Service
export * from './docuseal.service.js';
export { default as DocuSealService } from './docuseal.service.js';

// Invoice Ninja Service
export * from './invoice-ninja.service.js';
export { default as InvoiceNinjaService } from './invoice-ninja.service.js';

// Mautic Service
export * from './mautic.service.js';
export { default as MauticService } from './mautic.service.js';

import DocuSealService from './docuseal.service.js';
import InvoiceNinjaService from './invoice-ninja.service.js';
import MauticService from './mautic.service.js';

/**
 * Integration Manager
 *
 * Coordinates actions across multiple integrations
 */
export class IntegrationManager {
  constructor() {
    this.docuseal = DocuSealService;
    this.invoiceNinja = InvoiceNinjaService;
    this.mautic = MauticService;
  }

  /**
   * Handle quote sent - orchestrate all integrations
   */
  async onQuoteSent(quoteId) {
    const results = {
      docuseal: null,
      mautic: null
    };

    try {
      // Trigger Mautic campaign
      results.mautic = await this.mautic.triggerQuoteSentCampaign(quoteId);
    } catch (error) {
      console.warn('Mautic integration error:', error.message);
      results.mautic = { success: false, error: error.message };
    }

    return results;
  }

  /**
   * Handle quote signed - orchestrate all integrations
   */
  async onQuoteSigned(quoteId, options = {}) {
    const results = {
      invoiceNinja: null,
      mautic: null
    };

    try {
      // Create deposit invoice in Invoice Ninja
      results.invoiceNinja = await this.invoiceNinja.createDepositInvoiceInNinja(quoteId);
    } catch (error) {
      console.warn('Invoice Ninja integration error:', error.message);
      results.invoiceNinja = { success: false, error: error.message };
    }

    return results;
  }

  /**
   * Handle payment received - orchestrate all integrations
   */
  async onPaymentReceived(invoiceId) {
    const results = {
      mautic: null
    };

    try {
      // Track in Mautic
      results.mautic = await this.mautic.trackPaymentReceived(invoiceId);
    } catch (error) {
      console.warn('Mautic integration error:', error.message);
      results.mautic = { success: false, error: error.message };
    }

    return results;
  }

  /**
   * Handle lead created - orchestrate all integrations
   */
  async onLeadCreated(leadId) {
    const results = {
      mautic: null
    };

    try {
      // Sync to Mautic
      results.mautic = await this.mautic.syncLeadToMautic(leadId);
    } catch (error) {
      console.warn('Mautic integration error:', error.message);
      results.mautic = { success: false, error: error.message };
    }

    return results;
  }

  /**
   * Handle client conversion - orchestrate all integrations
   */
  async onClientConverted(contactId) {
    const results = {
      mautic: null
    };

    try {
      // Trigger welcome campaign
      results.mautic = await this.mautic.triggerWelcomeCampaign(contactId);
    } catch (error) {
      console.warn('Mautic integration error:', error.message);
      results.mautic = { success: false, error: error.message };
    }

    return results;
  }

  /**
   * Request signature for quote
   */
  async requestQuoteSignature(quoteId, options = {}) {
    try {
      return await this.docuseal.createQuoteSignatureRequest(quoteId, options);
    } catch (error) {
      console.error('DocuSeal signature request error:', error.message);
      throw error;
    }
  }

  /**
   * Sync invoice to Invoice Ninja
   */
  async syncInvoice(invoiceId) {
    try {
      return await this.invoiceNinja.syncInvoiceToNinja(invoiceId);
    } catch (error) {
      console.error('Invoice Ninja sync error:', error.message);
      throw error;
    }
  }

  /**
   * Get integration health status
   */
  async getHealthStatus() {
    const status = {
      docuseal: { available: false, error: null },
      invoiceNinja: { available: false, error: null },
      mautic: { available: false, error: null }
    };

    // Check DocuSeal
    try {
      // DocuSeal doesn't have a health endpoint, check if API key is set
      status.docuseal.available = !!process.env.DOCUSEAL_API_KEY;
      if (!status.docuseal.available) {
        status.docuseal.error = 'API key not configured';
      }
    } catch (error) {
      status.docuseal.error = error.message;
    }

    // Check Invoice Ninja
    try {
      const hasKey = Object.values(process.env).some(v =>
        v && v.startsWith && v.startsWith('INVOICE_NINJA_KEY')
      );
      status.invoiceNinja.available = hasKey || !!process.env.INVOICE_NINJA_KEY_HYPERVISUAL;
      if (!status.invoiceNinja.available) {
        status.invoiceNinja.error = 'No API keys configured';
      }
    } catch (error) {
      status.invoiceNinja.error = error.message;
    }

    // Check Mautic
    try {
      const dashboard = await this.mautic.getMarketingDashboard();
      status.mautic.available = dashboard.totalContacts !== undefined;
    } catch (error) {
      status.mautic.error = error.message;
    }

    return status;
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager();

export default {
  DocuSealService,
  InvoiceNinjaService,
  MauticService,
  IntegrationManager,
  integrationManager
};
