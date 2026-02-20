/**
 * Integrations API Router
 *
 * Endpoints for external integrations:
 * - DocuSeal webhooks and status
 * - Invoice Ninja sync and webhooks
 * - Mautic triggers and stats
 *
 * @date 15 Décembre 2025
 */

import { Router } from 'express';
import {
  DocuSealService,
  InvoiceNinjaService,
  MauticService,
  integrationManager
} from '../../services/integrations/index.js';

const router = Router();

// ============================================
// HEALTH & STATUS
// ============================================

/**
 * GET /api/integrations/health
 * Get health status of all integrations
 */
router.get('/health', async (req, res) => {
  try {
    const status = await integrationManager.getHealthStatus();
    res.json({
      success: true,
      integrations: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DOCUSEAL ROUTES
// ============================================

/**
 * POST /api/integrations/docuseal/signature/quote/:quoteId
 * Create signature request for a quote
 */
router.post('/docuseal/signature/quote/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const options = {
      ...req.body,
      clientIP: req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await DocuSealService.createQuoteSignatureRequest(quoteId, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/docuseal/signature/cgv/:acceptanceId
 * Create signature request for CGV acceptance
 */
router.post('/docuseal/signature/cgv/:acceptanceId', async (req, res) => {
  try {
    const { acceptanceId } = req.params;
    const result = await DocuSealService.createCGVSignatureRequest(acceptanceId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/docuseal/signature/:submissionId/status
 * Get signature request status
 */
router.get('/docuseal/signature/:submissionId/status', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const status = await DocuSealService.getSignatureStatus(submissionId);
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/docuseal/signature/:submissionId/embed
 * Get embed URL for signing
 */
router.get('/docuseal/signature/:submissionId/embed', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await DocuSealService.getEmbedSigningUrl(submissionId, email);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/docuseal/signature/:submissionId/cancel
 * Cancel a signature request
 */
router.post('/docuseal/signature/:submissionId/cancel', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const result = await DocuSealService.cancelSignatureRequest(submissionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/docuseal/signature/:submissionId/remind
 * Resend signature request reminder
 */
router.post('/docuseal/signature/:submissionId/remind', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await DocuSealService.resendSignatureRequest(submissionId, email);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/docuseal/webhook
 * DocuSeal webhook handler
 */
router.post('/docuseal/webhook', async (req, res) => {
  // ACK immediat (200) — DocuSeal reessaiera si non-200
  const signature = req.headers['x-docuseal-signature'];
  res.json({ received: true });

  // Traitement asynchrone apres ACK
  try {
    await DocuSealService.handleWebhook(req.body, signature);
  } catch (error) {
    console.error('DocuSeal webhook error:', error.message);
  }
});

// ============================================
// INVOICE NINJA ROUTES
// ============================================

/**
 * POST /api/integrations/invoice-ninja/sync/:invoiceId
 * Sync invoice to Invoice Ninja
 */
router.post('/invoice-ninja/sync/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const result = await InvoiceNinjaService.syncInvoiceToNinja(invoiceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/invoice-ninja/deposit/:quoteId
 * Create deposit invoice in Invoice Ninja
 */
router.post('/invoice-ninja/deposit/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const result = await InvoiceNinjaService.createDepositInvoiceInNinja(quoteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/invoice-ninja/pdf/:invoiceId
 * Get invoice PDF from Invoice Ninja
 */
router.get('/invoice-ninja/pdf/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { company } = req.query;

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'Company code is required'
      });
    }

    const result = await InvoiceNinjaService.getInvoicePDF(invoiceId, company);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceId}.pdf"`);
    res.send(result.pdf);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/invoice-ninja/email/:invoiceId
 * Send invoice email via Invoice Ninja
 */
router.post('/invoice-ninja/email/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { company, email } = req.body;

    if (!company || !email) {
      return res.status(400).json({
        success: false,
        error: 'Company code and email are required'
      });
    }

    const result = await InvoiceNinjaService.sendInvoiceEmail(invoiceId, company, email);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/invoice-ninja/invoices
 * Get invoices from Invoice Ninja
 */
router.get('/invoice-ninja/invoices', async (req, res) => {
  try {
    const { company, ...filters } = req.query;

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'Company code is required'
      });
    }

    const result = await InvoiceNinjaService.getInvoicesFromNinja(company, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/invoice-ninja/webhook
 * Invoice Ninja webhook handler
 */
router.post('/invoice-ninja/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-ninja-signature'];
    const webhookSecret = process.env.INVOICE_NINJA_WEBHOOK_SECRET;

    const result = await InvoiceNinjaService.handleWebhook(req.body, signature, webhookSecret);
    res.json(result);
  } catch (error) {
    console.error('Invoice Ninja webhook error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// MAUTIC ROUTES
// ============================================

/**
 * POST /api/integrations/mautic/sync/contact
 * Sync contact to Mautic
 */
router.post('/mautic/sync/contact', async (req, res) => {
  try {
    const result = await MauticService.syncContactToMautic(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/mautic/sync/lead/:leadId
 * Sync lead to Mautic
 */
router.post('/mautic/sync/lead/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    const result = await MauticService.syncLeadToMautic(leadId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/mautic/trigger/quote-sent/:quoteId
 * Trigger quote sent campaign
 */
router.post('/mautic/trigger/quote-sent/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const result = await MauticService.triggerQuoteSentCampaign(quoteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/mautic/trigger/quote-followup/:quoteId
 * Trigger quote follow-up
 */
router.post('/mautic/trigger/quote-followup/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const result = await MauticService.triggerQuoteFollowUp(quoteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/mautic/trigger/payment-reminder/:invoiceId
 * Trigger payment reminder
 */
router.post('/mautic/trigger/payment-reminder/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { level } = req.body;
    const result = await MauticService.triggerPaymentReminder(invoiceId, level || 'first');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/mautic/trigger/welcome/:contactId
 * Trigger welcome campaign
 */
router.post('/mautic/trigger/welcome/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const result = await MauticService.triggerWelcomeCampaign(contactId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/mautic/campaign/:campaignId/stats
 * Get campaign statistics
 */
router.get('/mautic/campaign/:campaignId/stats', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const stats = await MauticService.getCampaignStats(campaignId);
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/mautic/segment/:segmentId/stats
 * Get segment statistics
 */
router.get('/mautic/segment/:segmentId/stats', async (req, res) => {
  try {
    const { segmentId } = req.params;
    const stats = await MauticService.getSegmentStats(segmentId);
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integrations/mautic/dashboard
 * Get marketing dashboard data
 */
router.get('/mautic/dashboard', async (req, res) => {
  try {
    const dashboard = await MauticService.getMarketingDashboard();
    res.json({
      success: true,
      ...dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ORCHESTRATED ACTIONS
// ============================================

/**
 * POST /api/integrations/orchestrate/quote-sent/:quoteId
 * Orchestrate all integrations when quote is sent
 */
router.post('/orchestrate/quote-sent/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const results = await integrationManager.onQuoteSent(quoteId);
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/orchestrate/quote-signed/:quoteId
 * Orchestrate all integrations when quote is signed
 */
router.post('/orchestrate/quote-signed/:quoteId', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const results = await integrationManager.onQuoteSigned(quoteId, req.body);
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/orchestrate/payment-received/:invoiceId
 * Orchestrate all integrations when payment is received
 */
router.post('/orchestrate/payment-received/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const results = await integrationManager.onPaymentReceived(invoiceId);
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integrations/orchestrate/lead-created/:leadId
 * Orchestrate all integrations when lead is created
 */
router.post('/orchestrate/lead-created/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    const results = await integrationManager.onLeadCreated(leadId);
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
