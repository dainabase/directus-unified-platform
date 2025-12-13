/**
 * Finance API Routes
 * Endpoints REST pour le pôle Finance
 * 
 * Routes disponibles:
 * - GET /api/finance/dashboard/:company - Dashboard complet
 * - GET /api/finance/kpis/:company - KPIs uniquement
 * - GET /api/finance/alerts/:company - Alertes prioritaires
 * - POST /api/finance/invoices - Créer une facture
 * - GET /api/finance/invoices/:id - Détail facture
 * - POST /api/finance/invoices/:id/pdf - Générer PDF
 * - GET /api/finance/reconciliation/:company - Rapprochements en attente
 * - POST /api/finance/reconciliation/match - Valider un rapprochement
 * - POST /api/finance/ocr/process - Traiter un document OCR
 */

import express from 'express';
import multer from 'multer';
import { financeDashboardService } from '../../services/finance/finance-dashboard.service.js';
import { unifiedInvoiceService } from '../../services/finance/unified-invoice.service.js';
import { pdfGeneratorService } from '../../services/finance/pdf-generator.service.js';
import { bankReconciliationService } from '../../services/finance/bank-reconciliation.service.js';
import { ocrToAccountingService } from '../../services/finance/ocr-to-accounting.service.js';

const router = express.Router();

// Configuration Multer pour l'upload de fichiers
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

// Middleware de validation company
const validateCompany = (req, res, next) => {
  const validCompanies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT'];
  const company = req.params.company || req.body.owner_company;
  
  if (!company || !validCompanies.includes(company.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: 'Entreprise invalide',
      valid_companies: validCompanies
    });
  }
  
  req.company = company.toUpperCase();
  next();
};

// Middleware de gestion d'erreurs async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

/**
 * GET /api/finance/dashboard/:company
 * Dashboard complet avec toutes les données
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
 * KPIs et métriques principales uniquement
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
    count: alerts.length
  });
}));

/**
 * GET /api/finance/evolution/:company
 * Évolution mensuelle sur 12 mois
 */
router.get('/evolution/:company', validateCompany, asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const evolution = await financeDashboardService.getMonthlyEvolution(req.company, months);
  
  res.json({
    success: true,
    data: evolution
  });
}));

/**
 * GET /api/finance/cash-position/:company
 * Position de trésorerie détaillée
 */
router.get('/cash-position/:company', validateCompany, asyncHandler(async (req, res) => {
  const cashPosition = await financeDashboardService.getCashPosition(req.company);
  
  res.json({
    success: true,
    data: cashPosition
  });
}));

/**
 * GET /api/finance/upcoming/:company
 * Échéances à venir (30 jours)
 */
router.get('/upcoming/:company', validateCompany, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const upcoming = await financeDashboardService.getUpcomingDueDates(req.company, days);
  
  res.json({
    success: true,
    data: upcoming
  });
}));

/**
 * GET /api/finance/transactions/:company
 * Dernières transactions bancaires
 */
router.get('/transactions/:company', validateCompany, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const transactions = await financeDashboardService.getRecentTransactions(req.company, limit);
  
  res.json({
    success: true,
    data: transactions,
    count: transactions.length
  });
}));

// ============================================
// INVOICE ENDPOINTS
// ============================================

/**
 * POST /api/finance/invoices
 * Créer une nouvelle facture client
 */
router.post('/invoices', asyncHandler(async (req, res) => {
  const invoiceData = req.body;
  
  // Validation minimale
  if (!invoiceData.client_id || !invoiceData.line_items?.length) {
    return res.status(400).json({
      success: false,
      error: 'client_id et line_items sont requis'
    });
  }
  
  const invoice = await unifiedInvoiceService.createInvoice(invoiceData);
  
  res.status(201).json({
    success: true,
    data: invoice,
    message: 'Facture créée avec succès'
  });
}));

/**
 * GET /api/finance/invoices/:id
 * Détail d'une facture
 */
router.get('/invoices/:id', asyncHandler(async (req, res) => {
  const invoice = await unifiedInvoiceService.getInvoice(req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Facture non trouvée'
    });
  }
  
  res.json({
    success: true,
    data: invoice
  });
}));

/**
 * PUT /api/finance/invoices/:id
 * Mettre à jour une facture
 */
router.put('/invoices/:id', asyncHandler(async (req, res) => {
  const invoice = await unifiedInvoiceService.updateInvoice(req.params.id, req.body);
  
  res.json({
    success: true,
    data: invoice,
    message: 'Facture mise à jour'
  });
}));

/**
 * POST /api/finance/invoices/:id/send
 * Envoyer une facture par email
 */
router.post('/invoices/:id/send', asyncHandler(async (req, res) => {
  const { email, message } = req.body;
  
  const result = await unifiedInvoiceService.sendInvoice(req.params.id, {
    recipient_email: email,
    custom_message: message
  });
  
  res.json({
    success: true,
    data: result,
    message: 'Facture envoyée'
  });
}));

/**
 * POST /api/finance/invoices/:id/mark-paid
 * Marquer une facture comme payée
 */
router.post('/invoices/:id/mark-paid', asyncHandler(async (req, res) => {
  const { payment_date, payment_method, transaction_id } = req.body;
  
  const result = await unifiedInvoiceService.markAsPaid(req.params.id, {
    payment_date: payment_date || new Date().toISOString(),
    payment_method,
    transaction_id
  });
  
  res.json({
    success: true,
    data: result,
    message: 'Facture marquée comme payée'
  });
}));

/**
 * GET /api/finance/invoices/list/:company
 * Liste des factures d'une entreprise
 */
router.get('/invoices/list/:company', validateCompany, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  const invoices = await unifiedInvoiceService.listInvoices(req.company, {
    status,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.json({
    success: true,
    data: invoices.items,
    pagination: {
      page: invoices.page,
      limit: invoices.limit,
      total: invoices.total,
      pages: Math.ceil(invoices.total / invoices.limit)
    }
  });
}));

// ============================================
// PDF GENERATION ENDPOINTS
// ============================================

/**
 * POST /api/finance/invoices/:id/pdf
 * Générer le PDF d'une facture
 */
router.post('/invoices/:id/pdf', asyncHandler(async (req, res) => {
  const { template = 'default' } = req.body;
  
  const pdfResult = await pdfGeneratorService.generateInvoicePDF(req.params.id, {
    template
  });
  
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
      size: pdfResult.size
    }
  });
}));

/**
 * GET /api/finance/invoices/:id/pdf/download
 * Télécharger directement le PDF
 */
router.get('/invoices/:id/pdf/download', asyncHandler(async (req, res) => {
  const pdfResult = await pdfGeneratorService.generateInvoicePDF(req.params.id);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
  res.send(pdfResult.buffer);
}));

// ============================================
// BANK RECONCILIATION ENDPOINTS
// ============================================

/**
 * GET /api/finance/reconciliation/:company
 * Transactions en attente de rapprochement
 */
router.get('/reconciliation/:company', validateCompany, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  
  const pending = await bankReconciliationService.getPendingReconciliations(req.company, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.json({
    success: true,
    data: pending.items,
    pagination: {
      page: pending.page,
      limit: pending.limit,
      total: pending.total
    }
  });
}));

/**
 * GET /api/finance/reconciliation/suggestions/:transactionId
 * Suggestions de rapprochement pour une transaction
 */
router.get('/reconciliation/suggestions/:transactionId', asyncHandler(async (req, res) => {
  const suggestions = await bankReconciliationService.getSuggestions(req.params.transactionId);
  
  res.json({
    success: true,
    data: suggestions
  });
}));

/**
 * POST /api/finance/reconciliation/match
 * Valider un rapprochement
 */
router.post('/reconciliation/match', asyncHandler(async (req, res) => {
  const { transaction_id, invoice_id, type } = req.body;
  
  if (!transaction_id || !invoice_id) {
    return res.status(400).json({
      success: false,
      error: 'transaction_id et invoice_id sont requis'
    });
  }
  
  const result = await bankReconciliationService.confirmMatch(transaction_id, invoice_id, type);
  
  res.json({
    success: true,
    data: result,
    message: 'Rapprochement validé'
  });
}));

/**
 * POST /api/finance/reconciliation/reject
 * Rejeter une suggestion de rapprochement
 */
router.post('/reconciliation/reject', asyncHandler(async (req, res) => {
  const { transaction_id, reason } = req.body;
  
  const result = await bankReconciliationService.rejectSuggestion(transaction_id, reason);
  
  res.json({
    success: true,
    data: result,
    message: 'Suggestion rejetée'
  });
}));

/**
 * POST /api/finance/reconciliation/auto/:company
 * Lancer le rapprochement automatique
 */
router.post('/reconciliation/auto/:company', validateCompany, asyncHandler(async (req, res) => {
  const result = await bankReconciliationService.runAutoReconciliation(req.company);
  
  res.json({
    success: true,
    data: {
      processed: result.processed,
      matched: result.matched,
      pending: result.pending
    },
    message: `Rapprochement automatique terminé: ${result.matched} correspondances trouvées`
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
      error: 'Aucun fichier fourni'
    });
  }
  
  const { document_type = 'supplier_invoice', owner_company } = req.body;
  
  const result = await ocrToAccountingService.processDocument(
    req.file.buffer,
    req.file.mimetype,
    {
      document_type,
      owner_company,
      original_filename: req.file.originalname
    }
  );
  
  res.json({
    success: true,
    data: result,
    message: 'Document traité avec succès'
  });
}));

/**
 * POST /api/finance/ocr/validate
 * Valider et enregistrer les données OCR extraites
 */
router.post('/ocr/validate', asyncHandler(async (req, res) => {
  const { extraction_id, corrections, confirm } = req.body;
  
  if (!extraction_id) {
    return res.status(400).json({
      success: false,
      error: 'extraction_id requis'
    });
  }
  
  const result = await ocrToAccountingService.validateAndSave(
    extraction_id,
    corrections,
    confirm
  );
  
  res.json({
    success: true,
    data: result,
    message: confirm ? 'Document enregistré' : 'Données mises à jour'
  });
}));

/**
 * GET /api/finance/ocr/status/:extractionId
 * Statut d'un traitement OCR
 */
router.get('/ocr/status/:extractionId', asyncHandler(async (req, res) => {
  const status = await ocrToAccountingService.getExtractionStatus(req.params.extractionId);
  
  res.json({
    success: true,
    data: status
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
  const { status, page = 1, limit = 20 } = req.query;
  
  const invoices = await unifiedInvoiceService.listSupplierInvoices(req.company, {
    status,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.json({
    success: true,
    data: invoices.items,
    pagination: {
      page: invoices.page,
      limit: invoices.limit,
      total: invoices.total
    }
  });
}));

/**
 * POST /api/finance/supplier-invoices/:id/approve
 * Approuver une facture fournisseur
 */
router.post('/supplier-invoices/:id/approve', asyncHandler(async (req, res) => {
  const result = await unifiedInvoiceService.approveSupplierInvoice(req.params.id, {
    approved_by: req.body.approved_by,
    notes: req.body.notes
  });
  
  res.json({
    success: true,
    data: result,
    message: 'Facture approuvée'
  });
}));

/**
 * POST /api/finance/supplier-invoices/:id/schedule-payment
 * Programmer le paiement d'une facture fournisseur
 */
router.post('/supplier-invoices/:id/schedule-payment', asyncHandler(async (req, res) => {
  const { payment_date, bank_account_id } = req.body;
  
  const result = await unifiedInvoiceService.schedulePayment(req.params.id, {
    payment_date,
    bank_account_id
  });
  
  res.json({
    success: true,
    data: result,
    message: 'Paiement programmé'
  });
}));

// ============================================
// ERROR HANDLER
// ============================================

router.use((error, req, res, next) => {
  console.error('Finance API Error:', error);
  
  // Erreur Multer (upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'Fichier trop volumineux (max 10MB)'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default router;