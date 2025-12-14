/**
 * Finance API Routes
 * Endpoints REST complets pour le pole Finance
 *
 * @version 2.0.0
 * @author Claude Code
 *
 * Routes disponibles:
 *
 * DASHBOARD
 * - GET  /api/finance/dashboard/:company - Dashboard complet
 * - GET  /api/finance/dashboard/consolidated - Dashboard groupe (5 entreprises)
 * - GET  /api/finance/kpis/:company - KPIs uniquement
 * - GET  /api/finance/alerts/:company - Alertes prioritaires
 * - GET  /api/finance/evolution/:company - Evolution 12 mois
 * - GET  /api/finance/cash-position/:company - Position tresorerie
 * - GET  /api/finance/cash-forecast/:company - Previsions tresorerie
 * - GET  /api/finance/upcoming/:company - Echeances a venir
 * - GET  /api/finance/transactions/:company - Transactions recentes
 * - GET  /api/finance/yoy/:company - Comparaison annuelle
 * - GET  /api/finance/vat/:company - Solde TVA
 * - GET  /api/finance/client-stats/:company - Stats par client
 *
 * FACTURES CLIENTS
 * - POST /api/finance/invoices - Creer facture
 * - GET  /api/finance/invoices/:id - Detail facture
 * - GET  /api/finance/invoices/:id/qr - Facture avec QR
 * - PUT  /api/finance/invoices/:id - Modifier facture
 * - POST /api/finance/invoices/:id/send - Envoyer facture
 * - POST /api/finance/invoices/:id/mark-paid - Marquer payee
 * - POST /api/finance/invoices/:id/partial-payment - Paiement partiel
 * - POST /api/finance/invoices/:id/cancel - Annuler facture
 * - POST /api/finance/invoices/:id/duplicate - Dupliquer facture
 * - POST /api/finance/invoices/:id/credit-note - Creer avoir
 * - GET  /api/finance/invoices/list/:company - Liste factures
 * - GET  /api/finance/invoices/search/:company - Recherche
 * - GET  /api/finance/invoices/overdue/:company - Factures en retard
 * - GET  /api/finance/invoices/stats/:company - Statistiques
 *
 * PDF
 * - POST /api/finance/invoices/:id/pdf - Generer PDF
 * - GET  /api/finance/invoices/:id/pdf/download - Telecharger PDF
 * - POST /api/finance/reminder/:id/pdf - PDF rappel
 * - POST /api/finance/credit-note/:id/pdf - PDF avoir
 * - POST /api/finance/statement/:clientId/pdf - Releve compte
 *
 * RAPPELS ET RECOUVREMENT
 * - POST /api/finance/invoices/:id/reminder - Envoyer rappel
 * - GET  /api/finance/reminders/:company - Liste rappels
 * - POST /api/finance/reminders/batch/:company - Rappels batch
 *
 * RAPPROCHEMENT BANCAIRE
 * - GET  /api/finance/reconciliation/:company - En attente
 * - GET  /api/finance/reconciliation/suggestions/:txId - Suggestions
 * - POST /api/finance/reconciliation/match - Valider
 * - POST /api/finance/reconciliation/reject - Rejeter
 * - POST /api/finance/reconciliation/manual - Manuel
 * - POST /api/finance/reconciliation/undo/:id - Annuler
 * - POST /api/finance/reconciliation/auto/:company - Automatique
 * - GET  /api/finance/reconciliation/history/:company - Historique
 * - GET  /api/finance/reconciliation/report/:company - Rapport
 *
 * IMPORT BANCAIRE
 * - POST /api/finance/bank/import/camt053 - Import CAMT.053
 * - POST /api/finance/bank/import/csv - Import CSV
 * - GET  /api/finance/bank/accounts/:company - Comptes bancaires
 *
 * OCR
 * - POST /api/finance/ocr/process - Traiter document
 * - POST /api/finance/ocr/validate - Valider extraction
 * - GET  /api/finance/ocr/status/:id - Statut traitement
 * - GET  /api/finance/ocr/pending/:company - OCR en attente
 * - GET  /api/finance/ocr/stats/:company - Statistiques OCR
 * - POST /api/finance/ocr/preview - Apercu ecriture
 * - POST /api/finance/ocr/batch/:company - Traitement batch
 *
 * FACTURES FOURNISSEURS
 * - GET  /api/finance/supplier-invoices/:company - Liste
 * - POST /api/finance/supplier-invoices/:id/approve - Approuver
 * - POST /api/finance/supplier-invoices/:id/reject - Rejeter
 * - POST /api/finance/supplier-invoices/:id/schedule - Programmer paiement
 * - POST /api/finance/supplier-invoices/:id/mark-paid - Marquer payee
 *
 * RAPPORTS ET EXPORTS
 * - GET  /api/finance/report/:company - Rapport financier
 * - GET  /api/finance/export/json/:company - Export JSON
 * - GET  /api/finance/export/csv/:company/transactions - Export CSV
 * - GET  /api/finance/export/csv/:company/invoices - Export factures CSV
 */

import express from 'express';
import multer from 'multer';
import { financeDashboardService } from '../../services/finance/finance-dashboard.service.js';
import { unifiedInvoiceService } from '../../services/finance/unified-invoice.service.js';
import { pdfGeneratorService } from '../../services/finance/pdf-generator.service.js';
import { bankReconciliationService } from '../../services/finance/bank-reconciliation.service.js';
import { ocrToAccountingService } from '../../services/finance/ocr-to-accounting.service.js';

const router = express.Router();

// ============================================
// CONFIGURATION
// ============================================

// Entreprises valides
const VALID_COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

// Configuration Multer pour upload fichiers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/csv',
      'application/xml',
      'text/xml'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non supporte: ${file.mimetype}`), false);
    }
  }
});

// ============================================
// MIDDLEWARES
// ============================================

/**
 * Validation entreprise
 */
const validateCompany = (req, res, next) => {
  const company = req.params.company || req.body.owner_company;

  if (!company) {
    return res.status(400).json({
      success: false,
      error: 'Entreprise requise',
      valid_companies: VALID_COMPANIES
    });
  }

  const normalizedCompany = company.toUpperCase().replace(' ', '_');

  if (!VALID_COMPANIES.includes(normalizedCompany)) {
    return res.status(400).json({
      success: false,
      error: `Entreprise invalide: ${company}`,
      valid_companies: VALID_COMPANIES
    });
  }

  req.company = normalizedCompany;
  next();
};

/**
 * Gestion erreurs async
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation ID
 */
const validateId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id) {
    return res.status(400).json({
      success: false,
      error: `${paramName} requis`
    });
  }
  next();
};

/**
 * Log des requetes
 */
const logRequest = (req, res, next) => {
  console.log(`[Finance API] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRequest);

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

/**
 * GET /api/finance/dashboard/consolidated
 * Dashboard consolide groupe (5 entreprises)
 */
router.get('/dashboard/consolidated', asyncHandler(async (req, res) => {
  const dashboard = await financeDashboardService.getConsolidatedDashboard();

  res.json({
    success: true,
    data: dashboard
  });
}));

/**
 * GET /api/finance/dashboard/:company
 * Dashboard complet avec toutes les donnees
 */
router.get('/dashboard/:company', validateCompany, asyncHandler(async (req, res) => {
  const dashboard = await financeDashboardService.getFullDashboard(req.company);

  res.json({
    success: true,
    data: dashboard
  });
}));

/**
 * GET /api/finance/kpis/:company
 * KPIs et metriques principales
 */
router.get('/kpis/:company', validateCompany, asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const period = {};

  if (start) period.start = new Date(start).toISOString();
  if (end) period.end = new Date(end).toISOString();

  const kpis = await financeDashboardService.getOverviewMetrics(req.company, period);

  res.json({
    success: true,
    data: kpis
  });
}));

/**
 * GET /api/finance/alerts/:company
 * Alertes et actions prioritaires
 */
router.get('/alerts/:company', validateCompany, asyncHandler(async (req, res) => {
  const alerts = await financeDashboardService.getAlerts(req.company);

  res.json({
    success: true,
    data: alerts,
    count: alerts.length,
    by_severity: {
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    }
  });
}));

/**
 * GET /api/finance/evolution/:company
 * Evolution mensuelle
 */
router.get('/evolution/:company', validateCompany, asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const evolution = await financeDashboardService.getMonthlyEvolution(req.company, Math.min(months, 24));

  res.json({
    success: true,
    data: evolution,
    months: evolution.length
  });
}));

/**
 * GET /api/finance/cash-position/:company
 * Position de tresorerie detaillee
 */
router.get('/cash-position/:company', validateCompany, asyncHandler(async (req, res) => {
  const cashPosition = await financeDashboardService.getCashPosition(req.company);

  res.json({
    success: true,
    data: cashPosition
  });
}));

/**
 * GET /api/finance/cash-forecast/:company
 * Previsions de tresorerie
 */
router.get('/cash-forecast/:company', validateCompany, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 90;
  const forecast = await financeDashboardService.getCashFlowForecast(req.company, Math.min(days, 180));

  res.json({
    success: true,
    data: forecast
  });
}));

/**
 * GET /api/finance/upcoming/:company
 * Echeances a venir
 */
router.get('/upcoming/:company', validateCompany, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const upcoming = await financeDashboardService.getUpcomingDueDates(req.company, days);

  res.json({
    success: true,
    data: upcoming,
    receivables_count: upcoming.receivables?.length || 0,
    payables_count: upcoming.payables?.length || 0
  });
}));

/**
 * GET /api/finance/transactions/:company
 * Dernieres transactions bancaires
 */
router.get('/transactions/:company', validateCompany, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const transactions = await financeDashboardService.getRecentTransactions(req.company, limit);

  res.json({
    success: true,
    data: transactions,
    count: transactions.length
  });
}));

/**
 * GET /api/finance/yoy/:company
 * Comparaison Year over Year
 */
router.get('/yoy/:company', validateCompany, asyncHandler(async (req, res) => {
  const comparison = await financeDashboardService.getYearOverYearComparison(req.company);

  res.json({
    success: true,
    data: comparison
  });
}));

/**
 * GET /api/finance/vat/:company
 * Solde TVA trimestriel
 */
router.get('/vat/:company', validateCompany, asyncHandler(async (req, res) => {
  const vatBalance = await financeDashboardService.getVATBalance(req.company);

  res.json({
    success: true,
    data: vatBalance
  });
}));

/**
 * GET /api/finance/client-stats/:company
 * Statistiques par client
 */
router.get('/client-stats/:company', validateCompany, asyncHandler(async (req, res) => {
  const { client_id } = req.query;
  const stats = await financeDashboardService.getClientStats(req.company, client_id);

  res.json({
    success: true,
    data: stats,
    clients_count: Object.keys(stats).length
  });
}));

/**
 * GET /api/finance/receivables/:company
 * Creances detaillees avec aging
 */
router.get('/receivables/:company', validateCompany, asyncHandler(async (req, res) => {
  const receivables = await financeDashboardService.getReceivables(req.company);

  res.json({
    success: true,
    data: receivables
  });
}));

/**
 * GET /api/finance/payables/:company
 * Dettes detaillees avec aging
 */
router.get('/payables/:company', validateCompany, asyncHandler(async (req, res) => {
  const payables = await financeDashboardService.getPayables(req.company);

  res.json({
    success: true,
    data: payables
  });
}));

// ============================================
// INVOICE ENDPOINTS - CLIENT
// ============================================

/**
 * POST /api/finance/invoices
 * Creer une nouvelle facture client
 */
router.post('/invoices', asyncHandler(async (req, res) => {
  const invoiceData = req.body;

  // Validation
  const errors = [];
  if (!invoiceData.owner_company) errors.push('owner_company requis');
  if (!invoiceData.client_id && !invoiceData.client_name) errors.push('client_id ou client_name requis');
  if (!invoiceData.line_items?.length) errors.push('line_items requis (au moins 1)');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  const invoice = await unifiedInvoiceService.createInvoice(invoiceData);

  res.status(201).json({
    success: true,
    data: invoice,
    message: 'Facture creee avec succes'
  });
}));

/**
 * GET /api/finance/invoices/:id
 * Detail d'une facture
 */
router.get('/invoices/:id', validateId(), asyncHandler(async (req, res) => {
  const invoice = await unifiedInvoiceService.getInvoice(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Facture non trouvee'
    });
  }

  res.json({
    success: true,
    data: invoice
  });
}));

/**
 * GET /api/finance/invoices/:id/qr
 * Facture avec donnees QR suisse
 */
router.get('/invoices/:id/qr', validateId(), asyncHandler(async (req, res) => {
  const invoice = await unifiedInvoiceService.getInvoiceWithQR(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Facture non trouvee'
    });
  }

  res.json({
    success: true,
    data: invoice
  });
}));

/**
 * PUT /api/finance/invoices/:id
 * Mettre a jour une facture (brouillon uniquement)
 */
router.put('/invoices/:id', validateId(), asyncHandler(async (req, res) => {
  const invoice = await unifiedInvoiceService.updateInvoice(req.params.id, req.body);

  res.json({
    success: true,
    data: invoice,
    message: 'Facture mise a jour'
  });
}));

/**
 * POST /api/finance/invoices/:id/send
 * Envoyer une facture par email
 */
router.post('/invoices/:id/send', validateId(), asyncHandler(async (req, res) => {
  const { email, cc, message, attach_pdf = true } = req.body;

  const result = await unifiedInvoiceService.sendInvoice(req.params.id, {
    recipient_email: email,
    cc_emails: cc,
    custom_message: message,
    attach_pdf
  });

  res.json({
    success: true,
    data: result,
    message: 'Facture envoyee'
  });
}));

/**
 * POST /api/finance/invoices/:id/mark-paid
 * Marquer une facture comme payee
 */
router.post('/invoices/:id/mark-paid', validateId(), asyncHandler(async (req, res) => {
  const { payment_date, payment_method, transaction_id, notes } = req.body;

  const result = await unifiedInvoiceService.markAsPaid(req.params.id, {
    payment_date: payment_date || new Date().toISOString(),
    payment_method,
    transaction_id,
    notes
  });

  res.json({
    success: true,
    data: result,
    message: 'Facture marquee comme payee'
  });
}));

/**
 * POST /api/finance/invoices/:id/partial-payment
 * Enregistrer un paiement partiel
 */
router.post('/invoices/:id/partial-payment', validateId(), asyncHandler(async (req, res) => {
  const { amount, payment_date, payment_method, transaction_id, notes } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Montant invalide'
    });
  }

  const result = await unifiedInvoiceService.recordPartialPayment(req.params.id, {
    amount,
    payment_date: payment_date || new Date().toISOString(),
    payment_method,
    transaction_id,
    notes
  });

  res.json({
    success: true,
    data: result,
    message: 'Paiement partiel enregistre'
  });
}));

/**
 * POST /api/finance/invoices/:id/cancel
 * Annuler une facture
 */
router.post('/invoices/:id/cancel', validateId(), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: 'Raison requise pour annulation'
    });
  }

  const result = await unifiedInvoiceService.cancelInvoice(req.params.id, reason);

  res.json({
    success: true,
    data: result,
    message: 'Facture annulee'
  });
}));

/**
 * POST /api/finance/invoices/:id/duplicate
 * Dupliquer une facture
 */
router.post('/invoices/:id/duplicate', validateId(), asyncHandler(async (req, res) => {
  const result = await unifiedInvoiceService.duplicateInvoice(req.params.id);

  res.status(201).json({
    success: true,
    data: result,
    message: 'Facture dupliquee'
  });
}));

/**
 * POST /api/finance/invoices/:id/credit-note
 * Creer un avoir pour une facture
 */
router.post('/invoices/:id/credit-note', validateId(), asyncHandler(async (req, res) => {
  const { reason, line_items } = req.body;

  const result = await unifiedInvoiceService.createCreditNote(req.params.id, {
    reason,
    line_items // Optionnel, si pas fourni = avoir total
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Avoir cree'
  });
}));

/**
 * GET /api/finance/invoices/list/:company
 * Liste des factures d'une entreprise
 */
router.get('/invoices/list/:company', validateCompany, asyncHandler(async (req, res) => {
  const { status, client_id, from, to, page = 1, limit = 20, sort = '-created_at' } = req.query;

  const invoices = await unifiedInvoiceService.listInvoices(req.company, {
    status,
    client_id,
    from_date: from,
    to_date: to,
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    sort
  });

  res.json({
    success: true,
    data: invoices.items || invoices,
    pagination: invoices.pagination || {
      page: parseInt(page),
      limit: parseInt(limit),
      total: invoices.total || invoices.length
    }
  });
}));

/**
 * GET /api/finance/invoices/search/:company
 * Recherche de factures
 */
router.get('/invoices/search/:company', validateCompany, asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Terme de recherche trop court (min 2 caracteres)'
    });
  }

  const results = await unifiedInvoiceService.searchInvoices(req.company, q, {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50)
  });

  res.json({
    success: true,
    data: results,
    query: q
  });
}));

/**
 * GET /api/finance/invoices/overdue/:company
 * Factures en retard
 */
router.get('/invoices/overdue/:company', validateCompany, asyncHandler(async (req, res) => {
  const overdue = await unifiedInvoiceService.checkOverdueInvoices(req.company);

  res.json({
    success: true,
    data: overdue.items || overdue,
    count: overdue.count || (overdue.items || overdue).length,
    total_amount: overdue.total_amount || 0
  });
}));

/**
 * GET /api/finance/invoices/stats/:company
 * Statistiques de facturation
 */
router.get('/invoices/stats/:company', validateCompany, asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const stats = await unifiedInvoiceService.getInvoiceStats(req.company, {
    from_date: from,
    to_date: to
  });

  res.json({
    success: true,
    data: stats
  });
}));

// ============================================
// PDF GENERATION ENDPOINTS
// ============================================

/**
 * POST /api/finance/invoices/:id/pdf
 * Generer le PDF d'une facture
 */
router.post('/invoices/:id/pdf', validateId(), asyncHandler(async (req, res) => {
  const pdfResult = await pdfGeneratorService.generateInvoicePDF(req.params.id);

  if (req.query.download === 'true') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    return res.send(pdfResult.buffer);
  }

  res.json({
    success: true,
    data: {
      url: pdfResult.url,
      filename: pdfResult.filename,
      path: pdfResult.path
    }
  });
}));

/**
 * GET /api/finance/invoices/:id/pdf/download
 * Telecharger directement le PDF
 */
router.get('/invoices/:id/pdf/download', validateId(), asyncHandler(async (req, res) => {
  const pdfResult = await pdfGeneratorService.generateInvoicePDF(req.params.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
  res.send(pdfResult.buffer);
}));

/**
 * POST /api/finance/reminder/:id/pdf
 * Generer PDF de rappel
 */
router.post('/reminder/:id/pdf', validateId(), asyncHandler(async (req, res) => {
  const { level = 1 } = req.body;

  const pdfResult = await pdfGeneratorService.generatePaymentReminderPDF(
    req.params.id,
    Math.min(Math.max(parseInt(level), 1), 3)
  );

  if (req.query.download === 'true') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    return res.send(pdfResult.buffer);
  }

  res.json({
    success: true,
    data: {
      url: pdfResult.url,
      filename: pdfResult.filename,
      reminder_level: level
    }
  });
}));

/**
 * POST /api/finance/credit-note/:id/pdf
 * Generer PDF d'avoir
 */
router.post('/credit-note/:id/pdf', validateId(), asyncHandler(async (req, res) => {
  const pdfResult = await pdfGeneratorService.generateCreditNotePDF(req.params.id);

  if (req.query.download === 'true') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    return res.send(pdfResult.buffer);
  }

  res.json({
    success: true,
    data: {
      url: pdfResult.url,
      filename: pdfResult.filename
    }
  });
}));

/**
 * POST /api/finance/statement/:clientId/pdf
 * Generer releve de compte client
 */
router.post('/statement/:clientId/pdf', validateId('clientId'), asyncHandler(async (req, res) => {
  const { from, to, owner_company } = req.body;

  if (!owner_company) {
    return res.status(400).json({
      success: false,
      error: 'owner_company requis'
    });
  }

  const pdfResult = await pdfGeneratorService.generateAccountStatementPDF(
    req.params.clientId,
    owner_company,
    { from_date: from, to_date: to }
  );

  if (req.query.download === 'true') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    return res.send(pdfResult.buffer);
  }

  res.json({
    success: true,
    data: {
      url: pdfResult.url,
      filename: pdfResult.filename
    }
  });
}));

// ============================================
// REMINDERS ENDPOINTS
// ============================================

/**
 * POST /api/finance/invoices/:id/reminder
 * Envoyer un rappel de paiement
 */
router.post('/invoices/:id/reminder', validateId(), asyncHandler(async (req, res) => {
  const { level, send_email = true, email } = req.body;

  const result = await unifiedInvoiceService.sendReminder(req.params.id, {
    level: level || 'auto',
    send_email,
    recipient_email: email
  });

  res.json({
    success: true,
    data: result,
    message: `Rappel niveau ${result.level} envoye`
  });
}));

/**
 * GET /api/finance/reminders/:company
 * Liste des rappels envoyes
 */
router.get('/reminders/:company', validateCompany, asyncHandler(async (req, res) => {
  const { status, from, to, page = 1, limit = 20 } = req.query;

  const reminders = await unifiedInvoiceService.listReminders(req.company, {
    status,
    from_date: from,
    to_date: to,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: reminders
  });
}));

/**
 * POST /api/finance/reminders/batch/:company
 * Envoi batch de rappels
 */
router.post('/reminders/batch/:company', validateCompany, asyncHandler(async (req, res) => {
  const { invoice_ids, level, send_email = true } = req.body;

  if (!invoice_ids?.length) {
    return res.status(400).json({
      success: false,
      error: 'invoice_ids requis'
    });
  }

  const results = await unifiedInvoiceService.sendBatchReminders(
    req.company,
    invoice_ids,
    { level, send_email }
  );

  res.json({
    success: true,
    data: results,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  });
}));

// ============================================
// BANK RECONCILIATION ENDPOINTS
// ============================================

/**
 * GET /api/finance/reconciliation/:company
 * Transactions en attente de rapprochement
 */
router.get('/reconciliation/:company', validateCompany, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;

  const pending = await bankReconciliationService.getUnreconciledTransactions(req.company, {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 100),
    type
  });

  res.json({
    success: true,
    data: pending.items || pending,
    pagination: pending.pagination || {
      page: parseInt(page),
      limit: parseInt(limit),
      total: pending.total || (pending.items || pending).length
    }
  });
}));

/**
 * GET /api/finance/reconciliation/suggestions/:transactionId
 * Suggestions de rapprochement pour une transaction
 */
router.get('/reconciliation/suggestions/:transactionId', validateId('transactionId'), asyncHandler(async (req, res) => {
  const suggestions = await bankReconciliationService.findBestMatch(req.params.transactionId);

  res.json({
    success: true,
    data: suggestions
  });
}));

/**
 * GET /api/finance/reconciliation/pending/:company
 * Suggestions en attente de validation
 */
router.get('/reconciliation/pending/:company', validateCompany, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const pending = await bankReconciliationService.getPendingSuggestions(req.company, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: pending
  });
}));

/**
 * POST /api/finance/reconciliation/match
 * Valider un rapprochement
 */
router.post('/reconciliation/match', asyncHandler(async (req, res) => {
  const { transaction_id, invoice_id, invoice_type } = req.body;

  if (!transaction_id || !invoice_id) {
    return res.status(400).json({
      success: false,
      error: 'transaction_id et invoice_id requis'
    });
  }

  const result = await bankReconciliationService.confirmReconciliation(
    transaction_id,
    invoice_id,
    invoice_type || 'client'
  );

  res.json({
    success: true,
    data: result,
    message: 'Rapprochement valide'
  });
}));

/**
 * POST /api/finance/reconciliation/validate-suggestion
 * Valider une suggestion existante
 */
router.post('/reconciliation/validate-suggestion', asyncHandler(async (req, res) => {
  const { suggestion_id } = req.body;

  if (!suggestion_id) {
    return res.status(400).json({
      success: false,
      error: 'suggestion_id requis'
    });
  }

  const result = await bankReconciliationService.validateSuggestion(suggestion_id);

  res.json({
    success: true,
    data: result,
    message: 'Suggestion validee'
  });
}));

/**
 * POST /api/finance/reconciliation/reject
 * Rejeter une suggestion
 */
router.post('/reconciliation/reject', asyncHandler(async (req, res) => {
  const { suggestion_id, reason } = req.body;

  if (!suggestion_id) {
    return res.status(400).json({
      success: false,
      error: 'suggestion_id requis'
    });
  }

  const result = await bankReconciliationService.rejectSuggestion(suggestion_id, reason);

  res.json({
    success: true,
    data: result,
    message: 'Suggestion rejetee'
  });
}));

/**
 * POST /api/finance/reconciliation/manual
 * Rapprochement manuel
 */
router.post('/reconciliation/manual', asyncHandler(async (req, res) => {
  const { transaction_id, invoice_id, invoice_type, notes } = req.body;

  if (!transaction_id || !invoice_id) {
    return res.status(400).json({
      success: false,
      error: 'transaction_id et invoice_id requis'
    });
  }

  const result = await bankReconciliationService.manualReconcile(
    transaction_id,
    invoice_id,
    invoice_type || 'client',
    notes
  );

  res.json({
    success: true,
    data: result,
    message: 'Rapprochement manuel effectue'
  });
}));

/**
 * POST /api/finance/reconciliation/undo/:id
 * Annuler un rapprochement
 */
router.post('/reconciliation/undo/:id', validateId(), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const result = await bankReconciliationService.undoReconciliation(req.params.id, reason);

  res.json({
    success: true,
    data: result,
    message: 'Rapprochement annule'
  });
}));

/**
 * POST /api/finance/reconciliation/auto/:company
 * Lancer le rapprochement automatique
 */
router.post('/reconciliation/auto/:company', validateCompany, asyncHandler(async (req, res) => {
  const { threshold } = req.body;

  const result = await bankReconciliationService.autoReconcile(req.company, {
    confidence_threshold: threshold
  });

  res.json({
    success: true,
    data: result,
    message: `Rapprochement automatique: ${result.auto_matched || 0} valides, ${result.suggestions_created || 0} suggestions`
  });
}));

/**
 * GET /api/finance/reconciliation/history/:company
 * Historique des rapprochements
 */
router.get('/reconciliation/history/:company', validateCompany, asyncHandler(async (req, res) => {
  const { from, to, page = 1, limit = 50 } = req.query;

  const history = await bankReconciliationService.getReconciliationHistory(req.company, {
    from_date: from,
    to_date: to,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: history
  });
}));

/**
 * GET /api/finance/reconciliation/report/:company
 * Rapport de rapprochement
 */
router.get('/reconciliation/report/:company', validateCompany, asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const report = await bankReconciliationService.getReconciliationReport(req.company, {
    from_date: from,
    to_date: to
  });

  res.json({
    success: true,
    data: report
  });
}));

// ============================================
// BANK IMPORT ENDPOINTS
// ============================================

/**
 * POST /api/finance/bank/import/camt053
 * Import fichier bancaire CAMT.053 (ISO 20022)
 */
router.post('/bank/import/camt053', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Fichier requis'
    });
  }

  const { owner_company, bank_account_id } = req.body;

  if (!owner_company) {
    return res.status(400).json({
      success: false,
      error: 'owner_company requis'
    });
  }

  const result = await bankReconciliationService.importCAMT053(
    req.file.buffer.toString('utf-8'),
    owner_company,
    bank_account_id
  );

  res.json({
    success: true,
    data: result,
    message: `${result.imported || 0} transactions importees`
  });
}));

/**
 * POST /api/finance/bank/import/csv
 * Import fichier bancaire CSV
 */
router.post('/bank/import/csv', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Fichier requis'
    });
  }

  const { owner_company, bank_account_id, bank_format } = req.body;

  if (!owner_company) {
    return res.status(400).json({
      success: false,
      error: 'owner_company requis'
    });
  }

  const result = await bankReconciliationService.importCSV(
    req.file.buffer.toString('utf-8'),
    owner_company,
    bank_account_id,
    bank_format
  );

  res.json({
    success: true,
    data: result,
    message: `${result.imported || 0} transactions importees`
  });
}));

/**
 * GET /api/finance/bank/stats/:company
 * Statistiques de tresorerie
 */
router.get('/bank/stats/:company', validateCompany, asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const stats = await bankReconciliationService.getCashFlowStats(req.company, {
    from_date: from,
    to_date: to
  });

  res.json({
    success: true,
    data: stats
  });
}));

// ============================================
// OCR ENDPOINTS
// ============================================

/**
 * POST /api/finance/ocr/process
 * Traiter un document via OCR
 */
router.post('/ocr/process', upload.single('document'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Document requis'
    });
  }

  const { document_type = 'supplier_invoice', owner_company } = req.body;

  if (!owner_company) {
    return res.status(400).json({
      success: false,
      error: 'owner_company requis'
    });
  }

  const result = await ocrToAccountingService.processOCRDocument({
    file_buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    original_filename: req.file.originalname,
    document_type,
    owner_company
  });

  res.json({
    success: true,
    data: result,
    message: 'Document traite'
  });
}));

/**
 * POST /api/finance/ocr/preview
 * Apercu de l'ecriture comptable
 */
router.post('/ocr/preview', asyncHandler(async (req, res) => {
  const { ocr_id } = req.body;

  if (!ocr_id) {
    return res.status(400).json({
      success: false,
      error: 'ocr_id requis'
    });
  }

  const preview = await ocrToAccountingService.previewEntry(ocr_id);

  res.json({
    success: true,
    data: preview
  });
}));

/**
 * POST /api/finance/ocr/validate
 * Valider et enregistrer ecriture
 */
router.post('/ocr/validate', asyncHandler(async (req, res) => {
  const { ocr_id, corrections } = req.body;

  if (!ocr_id) {
    return res.status(400).json({
      success: false,
      error: 'ocr_id requis'
    });
  }

  const result = await ocrToAccountingService.validateEntry(ocr_id, corrections);

  res.json({
    success: true,
    data: result,
    message: 'Ecriture comptable creee'
  });
}));

/**
 * POST /api/finance/ocr/reject
 * Rejeter un document OCR
 */
router.post('/ocr/reject', asyncHandler(async (req, res) => {
  const { ocr_id, reason } = req.body;

  if (!ocr_id) {
    return res.status(400).json({
      success: false,
      error: 'ocr_id requis'
    });
  }

  const result = await ocrToAccountingService.rejectEntry(ocr_id, reason);

  res.json({
    success: true,
    data: result,
    message: 'Document rejete'
  });
}));

/**
 * GET /api/finance/ocr/pending/:company
 * Documents OCR en attente
 */
router.get('/ocr/pending/:company', validateCompany, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const pending = await ocrToAccountingService.getPendingOCR(req.company, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: pending
  });
}));

/**
 * GET /api/finance/ocr/stats/:company
 * Statistiques OCR
 */
router.get('/ocr/stats/:company', validateCompany, asyncHandler(async (req, res) => {
  const stats = await ocrToAccountingService.getOCRStats(req.company);

  res.json({
    success: true,
    data: stats
  });
}));

/**
 * POST /api/finance/ocr/batch/:company
 * Traitement batch OCR en attente
 */
router.post('/ocr/batch/:company', validateCompany, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.body;

  const result = await ocrToAccountingService.processPendingOCR(req.company, limit);

  res.json({
    success: true,
    data: result,
    message: `${result.processed || 0} documents traites`
  });
}));

/**
 * GET /api/finance/ocr/mappings
 * Liste des mappings comptables disponibles
 */
router.get('/ocr/mappings', asyncHandler(async (req, res) => {
  const { search } = req.query;

  const mappings = search
    ? await ocrToAccountingService.searchAccountMappings(search)
    : ocrToAccountingService.getAccountMappings();

  res.json({
    success: true,
    data: mappings
  });
}));

// ============================================
// SUPPLIER INVOICES ENDPOINTS
// ============================================

/**
 * GET /api/finance/supplier-invoices/:company
 * Liste des factures fournisseurs
 */
router.get('/supplier-invoices/:company', validateCompany, asyncHandler(async (req, res) => {
  const { status, supplier_id, from, to, page = 1, limit = 20 } = req.query;

  const invoices = await unifiedInvoiceService.listSupplierInvoices(req.company, {
    status,
    supplier_id,
    from_date: from,
    to_date: to,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: invoices.items || invoices,
    pagination: invoices.pagination
  });
}));

/**
 * POST /api/finance/supplier-invoices/:id/approve
 * Approuver une facture fournisseur
 */
router.post('/supplier-invoices/:id/approve', validateId(), asyncHandler(async (req, res) => {
  const { approved_by, notes } = req.body;

  const result = await unifiedInvoiceService.approveSupplierInvoice(req.params.id, {
    approved_by,
    notes
  });

  res.json({
    success: true,
    data: result,
    message: 'Facture approuvee'
  });
}));

/**
 * POST /api/finance/supplier-invoices/:id/reject
 * Rejeter une facture fournisseur
 */
router.post('/supplier-invoices/:id/reject', validateId(), asyncHandler(async (req, res) => {
  const { rejected_by, reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: 'Raison requise'
    });
  }

  const result = await unifiedInvoiceService.rejectSupplierInvoice(req.params.id, {
    rejected_by,
    reason
  });

  res.json({
    success: true,
    data: result,
    message: 'Facture rejetee'
  });
}));

/**
 * POST /api/finance/supplier-invoices/:id/schedule
 * Programmer le paiement
 */
router.post('/supplier-invoices/:id/schedule', validateId(), asyncHandler(async (req, res) => {
  const { payment_date, bank_account_id } = req.body;

  if (!payment_date) {
    return res.status(400).json({
      success: false,
      error: 'payment_date requis'
    });
  }

  const result = await unifiedInvoiceService.scheduleSupplierPayment(req.params.id, {
    payment_date,
    bank_account_id
  });

  res.json({
    success: true,
    data: result,
    message: 'Paiement programme'
  });
}));

/**
 * POST /api/finance/supplier-invoices/:id/mark-paid
 * Marquer comme payee
 */
router.post('/supplier-invoices/:id/mark-paid', validateId(), asyncHandler(async (req, res) => {
  const { payment_date, payment_method, transaction_id } = req.body;

  const result = await unifiedInvoiceService.markSupplierInvoicePaid(req.params.id, {
    payment_date: payment_date || new Date().toISOString(),
    payment_method,
    transaction_id
  });

  res.json({
    success: true,
    data: result,
    message: 'Facture fournisseur marquee comme payee'
  });
}));

// ============================================
// REPORTS & EXPORTS ENDPOINTS
// ============================================

/**
 * GET /api/finance/report/:company
 * Rapport financier complet
 */
router.get('/report/:company', validateCompany, asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  const report = await financeDashboardService.generateFinancialReport(req.company, period);

  res.json({
    success: true,
    data: report
  });
}));

/**
 * GET /api/finance/export/json/:company
 * Export JSON du dashboard
 */
router.get('/export/json/:company', validateCompany, asyncHandler(async (req, res) => {
  const json = await financeDashboardService.exportDashboardJSON(req.company);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="finance-${req.company}-${new Date().toISOString().split('T')[0]}.json"`);
  res.send(json);
}));

/**
 * GET /api/finance/export/csv/:company/transactions
 * Export CSV des transactions
 */
router.get('/export/csv/:company/transactions', validateCompany, asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const startDate = from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = to || new Date().toISOString();

  const csv = await financeDashboardService.exportTransactionsCSV(req.company, startDate, endDate);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="transactions-${req.company}-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
}));

/**
 * GET /api/finance/export/csv/:company/invoices
 * Export CSV des factures
 */
router.get('/export/csv/:company/invoices', validateCompany, asyncHandler(async (req, res) => {
  const { from, to, type = 'client' } = req.query;

  const invoices = await unifiedInvoiceService.exportInvoices(req.company, {
    type,
    from_date: from,
    to_date: to,
    format: 'csv'
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="invoices-${type}-${req.company}-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(invoices);
}));

// ============================================
// UTILITIES
// ============================================

/**
 * GET /api/finance/companies
 * Liste des entreprises supportees
 */
router.get('/companies', (req, res) => {
  const companies = financeDashboardService.getCompanies();

  res.json({
    success: true,
    data: companies
  });
});

/**
 * GET /api/finance/health
 * Health check de l'API Finance
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      dashboard: 'ok',
      invoice: 'ok',
      pdf: 'ok',
      reconciliation: 'ok',
      ocr: 'ok'
    }
  });
});

// ============================================
// ERROR HANDLER
// ============================================

router.use((error, req, res, next) => {
  console.error('[Finance API Error]', {
    method: req.method,
    path: req.path,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // Erreur Multer (upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'Fichier trop volumineux (max 20MB)'
    });
  }

  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Erreur upload: ${error.message}`
    });
  }

  // Erreur validation
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }

  // Erreur not found
  if (error.status === 404 || error.code === 'NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: error.message || 'Ressource non trouvee'
    });
  }

  // Erreur generique
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur',
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default router;
