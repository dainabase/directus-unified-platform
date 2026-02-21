/**
 * Serveur Unifié Directus - ES Modules
 * Port 3000 : Dashboard unifié
 * Port 8055 : Directus CMS
 *
 * @version 2.0.0
 * @author Claude Code
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validateEnv } from './config/env.validator.js';
import { initCache } from './lib/cache.js';
import { securityMonitor } from './middleware/security-logger.js';

// ============================================
// PROMETHEUS METRICS (Story 8.8) — optional
// ============================================
let metricsMiddleware = null;
let metricsEndpoint = null;
try {
  const metricsModule = await import('./middleware/metrics.middleware.js');
  metricsMiddleware = metricsModule.metricsMiddleware;
  metricsEndpoint = metricsModule.metricsEndpoint;
  console.log('[metrics] Prometheus metrics middleware loaded');
} catch (metricsErr) {
  console.warn('[metrics] Metrics middleware not available:', metricsErr.message);
}

// ES Modules: __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Valider les variables d'environnement
validateEnv();

// ============================================
// JWT SECURITY CHECK (Story 8.4)
// ============================================
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'change-me') {
  console.warn('[SECURITY] JWT_SECRET is weak or missing. Set a strong secret (32+ chars) in .env');
}

const app = express();
const PORT = process.env.UNIFIED_PORT || 3000;

// Configuration Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

console.log('Demarrage du serveur Directus Unifie (ES Modules)...');

// ============================================
// SECURITY HEADERS — Helmet (Story 8.4)
// ============================================
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for SPA
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ============================================
// SECURITY MONITOR (Story 8.4)
// ============================================
app.use(securityMonitor);

// ============================================
// PROMETHEUS METRICS MIDDLEWARE (Story 8.8)
// ============================================
if (metricsMiddleware) {
  app.use(metricsMiddleware);
}
if (metricsEndpoint) {
  app.get('/metrics', metricsEndpoint);
  console.log('[metrics] Prometheus endpoint available at /metrics');
}

// ============================================
// RATE LIMITING (Story 8.4)
// ============================================

// Global rate limiter (100 requests per minute per IP)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de requetes, reessayez dans 1 minute', code: 'RATE_LIMIT' },
});
app.use('/api/', globalLimiter);

// Strict rate limiter for auth endpoints (10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Trop de tentatives, reessayez dans 15 minutes', code: 'AUTH_RATE_LIMIT' },
});
app.use('/api/auth/', authLimiter);

// Webhook rate limiter (30 per minute — more generous for automated calls)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Webhook rate limit exceeded', code: 'WEBHOOK_RATE_LIMIT' },
});
app.use('/api/workflows/webhook/', webhookLimiter);

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// JSON body parser — SAUF pour les webhooks Revolut qui ont besoin du body brut (HMAC)
// Request size limited to 10mb (Story 8.4)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/revolut/webhook-receiver')) {
    return next(); // Laisser express.raw() du webhook-receiver gerer le body
  }
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS — whitelist origins from env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// API AUTHENTIFICATION
// ============================================

import authRoutes from './api/auth/auth.routes.js';
import { authMiddleware, optionalAuth, flexibleAuth, requireRole } from './middleware/auth.middleware.js';
import { companyFilter } from './middleware/company-filter.middleware.js';
app.use('/api/auth', authRoutes);
console.log('[api] Auth connected: /api/auth');

// ============================================
// API FINANCE - 80+ ENDPOINTS (Protected)
// ============================================

import financeRoutes from './api/finance/finance.routes.js';
// Finance API uses flexible auth (JWT or API Key) — route-level auth in finance.routes.js
app.use('/api/finance', flexibleAuth, companyFilter, financeRoutes);
console.log('[api] Finance connected: /api/finance (80+ endpoints)');

// ============================================
// API LEGAL - RECOUVREMENT
// ============================================

import legalRoutes from './api/legal/legal.routes.js';
app.use('/api/legal', authMiddleware, companyFilter, legalRoutes);
console.log('[api] Legal connected: /api/legal');

// ============================================
// API COLLECTION
// ============================================

import collectionRoutes from './api/collection/collection.routes.js';
app.use('/api/collection', authMiddleware, companyFilter, collectionRoutes);
console.log('[api] Collection connected: /api/collection');

// ============================================
// API COMMERCIAL - WORKFLOW COMPLET
// Lead → Quote → CGV → Signature → Acompte → Projet
// ============================================

try {
  const commercialRoutes = await import('./api/commercial/index.js');
  app.use('/api/commercial', authMiddleware, companyFilter, commercialRoutes.default);
  console.log('[api] Commercial connected: /api/commercial (workflow complet)');
} catch (err) {
  console.warn('[api] Commercial not available:', err.message);
}

// ============================================
// API PHASE J — KPI DASHBOARD + RAPPORT CEO
// ============================================

try {
  const kpisRouter = await import('./api/kpis/index.js');
  const kpisThresholdsRouter = await import('./api/kpis/thresholds.js');
  const kpisDailyReportRouter = await import('./api/kpis/daily-report.js');
  const kpisTreasuryRouter = await import('./api/kpis/treasury-forecast.js');

  app.use('/api/kpis', authMiddleware, requireRole(['superadmin']), kpisRouter.default);
  app.use('/api/kpis', authMiddleware, requireRole(['superadmin']), kpisThresholdsRouter.default);
  app.use('/api/kpis', authMiddleware, requireRole(['superadmin']), kpisDailyReportRouter.default);
  app.use('/api/kpis/treasury', authMiddleware, requireRole(['superadmin']), kpisTreasuryRouter.default);

  // Start daily CEO report CRON (07h00)
  const { startDailyCEOReport } = kpisDailyReportRouter;
  if (startDailyCEOReport) {
    startDailyCEOReport();
    console.log('[api] Daily CEO report CRON started (J-03)');
  }

  console.log('[api] KPIs connected: /api/kpis (J-01 to J-04)');
} catch (err) {
  console.warn('[api] KPIs not available:', err.message);
}

// ============================================
// API PHASE I — FINANCE AVANCEES (Milestones, Subscriptions, Credits, Supplier Invoices, Time Tracking, Support)
// ============================================

try {
  const milestonesRouter = await import('./api/milestones/index.js');
  app.use('/api/milestones', authMiddleware, companyFilter, milestonesRouter.default);
  console.log('[api] Milestones connected: /api/milestones (I-01)');
} catch (err) {
  console.warn('[api] Milestones not available:', err.message);
}

try {
  const subscriptionsApiRouter = await import('./api/subscriptions/index.js');
  app.use('/api/subscriptions', authMiddleware, companyFilter, subscriptionsApiRouter.default);
  console.log('[api] Subscriptions API connected: /api/subscriptions (I-02)');
} catch (err) {
  console.warn('[api] Subscriptions API not available:', err.message);
}

try {
  const billingCronRouter = await import('./api/subscriptions/billing-cron.js');
  app.use('/api/subscriptions', authMiddleware, billingCronRouter.default);
  const { startRecurringBillingCron } = billingCronRouter;
  if (startRecurringBillingCron) {
    startRecurringBillingCron();
    console.log('[api] Recurring billing CRON started (I-03)');
  }
} catch (err) {
  console.warn('[api] Billing CRON not available:', err.message);
}

try {
  const creditsRouter = await import('./api/credits/index.js');
  app.use('/api/credits', authMiddleware, companyFilter, creditsRouter.default);
  console.log('[api] Credits connected: /api/credits (I-04)');
} catch (err) {
  console.warn('[api] Credits not available:', err.message);
}

try {
  const supplierInvoicesRouter = await import('./api/supplier-invoices/index.js');
  app.use('/api/supplier-invoices', authMiddleware, companyFilter, supplierInvoicesRouter.default);
  console.log('[api] Supplier invoices connected: /api/supplier-invoices (I-05/I-06)');
} catch (err) {
  console.warn('[api] Supplier invoices not available:', err.message);
}

try {
  const timeTrackingApiRouter = await import('./api/time-tracking/index.js');
  app.use('/api/time-tracking', authMiddleware, companyFilter, timeTrackingApiRouter.default);
  console.log('[api] Time tracking API connected: /api/time-tracking (I-07)');
} catch (err) {
  console.warn('[api] Time tracking API not available:', err.message);
}

try {
  const supportApiRouter = await import('./api/support/index.js');
  app.use('/api/support', authMiddleware, companyFilter, supportApiRouter.default);
  console.log('[api] Support API connected: /api/support (I-08)');
} catch (err) {
  console.warn('[api] Support API not available:', err.message);
}

// ============================================
// API LEAD CAPTURE - Phase F (WordPress, WhatsApp, IMAP, Ringover)
// ============================================

try {
  const leadsRoutes = await import('./api/leads/index.js');
  // NOTE: Leads routes include external webhook endpoints (wp-webhook, whatsapp-webhook)
  // that handle their own authentication. Global authMiddleware not applied here.
  app.use('/api/leads', leadsRoutes.default);
  console.log('[api] Lead capture connected: /api/leads (F-01 WP, F-02 WhatsApp, F-03 IMAP, F-04 Ringover)');
} catch (err) {
  console.warn('[api] Lead capture not available:', err.message);
}

// ============================================
// API EMAIL AUTOMATION - Phase E (Mautic transactional)
// ============================================

try {
  const emailRoutes = await import('./api/email/index.js');
  // NOTE: Email routes are called by Directus Flows internally.
  // No JWT auth applied; routes should validate X-API-Key or internal origin.
  app.use('/api/email', emailRoutes.default);
  console.log('[api] Email automation connected: /api/email (6 flows Phase E)');
} catch (err) {
  console.warn('[api] Email automation not available:', err.message);
}

// ============================================
// API WORKFLOWS - Phase 7 (Lead qualification, Quote→Deposit, Payment→Project, Monthly Report)
// ============================================

try {
  const workflowsRouter = await import('./api/workflows/index.js');
  // NOTE: Workflow routes include external webhook endpoints (docuseal, revolut)
  // that handle their own HMAC authentication. Global authMiddleware not applied here.
  app.use('/api/workflows', workflowsRouter.default);

  // Start monthly CEO report CRON
  const { startMonthlyCron } = await import('./api/workflows/monthly-report.js');
  if (startMonthlyCron) {
    startMonthlyCron();
    console.log('[api] Monthly CEO report CRON started (Phase 7)');
  }

  console.log('[api] Workflows connected: /api/workflows (Phase 7 automation)');
} catch (err) {
  console.warn('[api] Workflows not available:', err.message);
}

// ============================================
// API NOTIFICATIONS - Phase 7 (SSE + REST)
// ============================================

try {
  const notificationsRouter = await import('./api/notifications/index.js');
  app.use('/api/notifications', authMiddleware, notificationsRouter.default);
  console.log('[api] Notifications connected: /api/notifications (Phase 7)');
} catch (err) {
  console.warn('[api] Notifications not available:', err.message);
}

// ============================================
// API INTEGRATIONS - DocuSeal, Invoice Ninja, Mautic
// ============================================

try {
  const integrationsRoutes = await import('./api/integrations/index.js');
  app.use('/api/integrations', authMiddleware, integrationsRoutes.default);
  console.log('[api] Integrations connected: /api/integrations (DocuSeal, Invoice Ninja, Mautic)');

  // Register DocuSeal webhook for local instance (Phase H)
  try {
    const { setupDocuSealWebhook } = await import('./services/integrations/docuseal.service.js');
    if (setupDocuSealWebhook) {
      await setupDocuSealWebhook();
      console.log('[docuseal] Webhook registered on local DocuSeal instance');
    }
  } catch (whErr) {
    console.warn('[docuseal] Webhook setup skipped:', whErr.message);
  }
} catch (err) {
  console.warn('[api] Integrations not available:', err.message);
}

// ============================================
// API REPORTS - CEO Daily Report
// ============================================

try {
  const reportsRoutes = await import('./api/reports/ceo-report.routes.js');
  app.use('/api/reports', flexibleAuth, reportsRoutes.default);
  console.log('[api] Reports connected: /api/reports (CEO daily report)');
} catch (err) {
  console.warn('[api] Reports not available:', err.message);
}

// ============================================
// PROXY DIRECTUS LEGACY
// ============================================

// Proxy simple vers Directus (protected)
app.get('/api/directus/items/:collection', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/items/${req.params.collection}`,
      {
        headers: { 'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
        params: req.query
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Erreur proxy Directus:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint OCR pour scanner les factures (protected)
app.post('/api/ocr/scan-invoice', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image requise' });
    }

    // Appeler OpenAI Vision pour analyser l'image
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4-vision-preview',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse cette facture et extrais: 1) Le montant total en CHF, 2) La date de la facture, 3) Le nom du client ou fournisseur, 4) Le numéro de facture. Retourne uniquement un JSON avec les clés: amount, date, company, invoice_number'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = openaiResponse.data.choices[0].message.content;
    let extractedData;
    try {
      const jsonMatch = content.match(/\{.*\}/s);
      extractedData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    } catch (e) {
      extractedData = {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        company: 'Non identifié',
        invoice_number: 'SCAN-' + Date.now()
      };
    }

    // Créer une facture draft dans Directus
    const invoiceData = {
      invoice_number: extractedData.invoice_number || 'SCAN-' + Date.now(),
      amount: parseFloat(extractedData.amount) || 0,
      currency: 'CHF',
      status: 'draft',
      issue_date: extractedData.date || new Date().toISOString().split('T')[0],
      description: `Facture scannée - ${extractedData.company || 'Client non identifié'}`,
      ocr_extracted: true,
      ocr_data: JSON.stringify(extractedData)
    };

    const directusResponse = await axios.post(
      `${DIRECTUS_URL}/items/client_invoices`,
      invoiceData,
      {
        headers: { 'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}` }
      }
    );

    res.json({
      success: true,
      extracted: extractedData,
      invoice: directusResponse.data.data
    });

  } catch (error) {
    console.error('Erreur OCR:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// ============================================
// FICHIERS STATIQUES - PORTAILS FRONTEND
// ============================================

// 1. Dashboard SuperAdmin avec OCR
app.use('/superadmin', express.static(path.join(__dirname, 'frontend/portals/superadmin'), {
  index: 'index.html',
  extensions: ['html']
}));

// 2. Portal Client
app.use('/client', express.static(path.join(__dirname, 'frontend/portals/client'), {
  index: 'index.html',
  extensions: ['html']
}));

// 3. Portal Prestataire
app.use('/prestataire', express.static(path.join(__dirname, 'frontend/portals/prestataire'), {
  index: 'index.html',
  extensions: ['html']
}));

// 4. Portal Revendeur
app.use('/revendeur', express.static(path.join(__dirname, 'frontend/portals/revendeur'), {
  index: 'index.html',
  extensions: ['html']
}));

// 5. Assets partagés (Tabler.io, etc)
app.use('/assets', express.static(path.join(__dirname, 'frontend/assets')));
app.use('/shared', express.static(path.join(__dirname, 'frontend/shared')));
app.use('/tabler', express.static(path.join(__dirname, 'frontend/shared/tabler')));
app.use('/dist', express.static(path.join(__dirname, 'frontend/shared/dist')));
app.use('/static', express.static(path.join(__dirname, 'frontend/shared/static')));

// 5b. Fichiers statiques à la racine
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/login.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/demo.html'));
});

// Nouveau design SuperAdmin
app.get('/superadmin/new-design', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/portals/superadmin/new-design/index.html'));
});

// Test moderne simple
app.get('/superadmin/test-moderne', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/portals/superadmin/test-moderne.html'));
});

// Design System
app.use('/design-system', express.static(path.join(__dirname, 'design-system')));

// ============================================
// PROXY VERS DIRECTUS ADMIN ET API
// ============================================

app.use('/admin', createProxyMiddleware({
  target: 'http://localhost:8055',
  changeOrigin: true,
  logLevel: 'warn'
}));

app.use('/items', createProxyMiddleware({
  target: 'http://localhost:8055',
  changeOrigin: true
}));

app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:8055',
  changeOrigin: true
}));

app.use('/graphql', createProxyMiddleware({
  target: 'http://localhost:8055',
  changeOrigin: true
}));

// ============================================
// EXTERNAL INTEGRATIONS (ES Modules)
// Invoice Ninja, Revolut, ERPNext, Mautic
// ============================================

// API Invoice Ninja - ES Modules
try {
  const invoiceNinjaRouter = await import('./api/invoice-ninja/index.js');
  app.use('/api/invoice-ninja', authMiddleware, requireRole(['superadmin']), invoiceNinjaRouter.default);
  console.log('✅ API Invoice Ninja connectée: /api/invoice-ninja (protected: superadmin)');
} catch (err) {
  console.warn('⚠️ API Invoice Ninja non disponible:', err.message);
}

// API Revolut - ES Modules
try {
  const revolutRouter = await import('./api/revolut/index.js');
  app.use('/api/revolut', authMiddleware, requireRole(['superadmin']), revolutRouter.default);
  console.log('✅ API Revolut connectée: /api/revolut (protected: superadmin)');
} catch (err) {
  console.warn('⚠️ API Revolut non disponible:', err.message);
}

// API ERPNext - À convertir
try {
  const erpnextRouter = await import('./api/erpnext/index.js');
  app.use('/api/erpnext', authMiddleware, requireRole(['superadmin']), erpnextRouter.default);
  console.log('✅ API ERPNext connectée: /api/erpnext (protected: superadmin)');
} catch (err) {
  console.warn('⚠️ API ERPNext non disponible:', err.message);
}

// API Mautic - À convertir
try {
  const mauticRouter = await import('./api/mautic/router.js');
  app.use('/api/mautic', authMiddleware, requireRole(['superadmin']), mauticRouter.default);
  console.log('✅ API Mautic connectée: /api/mautic (protected: superadmin)');
} catch (err) {
  console.warn('⚠️ API Mautic non disponible:', err.message);
}

// ============================================
// API OCR STATUS
// ============================================

app.get('/api/ocr/status', (req, res) => {
  res.json({
    status: process.env.OPENAI_API_KEY ? 'ready' : 'not_configured',
    message: process.env.OPENAI_API_KEY ? 'OCR service ready' : 'Clé OpenAI manquante',
    model: process.env.OPENAI_MODEL || 'gpt-4-vision-preview'
  });
});

// ============================================
// HEALTH CHECK (public — no auth)
// ============================================

import healthRoutes from './api/health/health.routes.js';
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
console.log('[api] Health check connected: /health + /api/health');

// ============================================
// PAGE D'ACCUEIL
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/all-portals.html'));
});

// Page d'accueil alternative (ancienne version)
app.get('/old-home', (req, res) => {
  const ocrStatus = !!process.env.OPENAI_API_KEY;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Directus Unified Platform</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/@tabler/core@latest/dist/css/tabler.min.css">
    </head>
    <body>
      <div class="page">
        <div class="page-wrapper">
          <div class="container-xl">
            <div class="page-header mt-5">
              <h1>🚀 Directus Unified Platform v2.0</h1>
              <p class="text-muted">Plateforme unifiée avec 4 portails, Finance API et OCR intégré</p>
            </div>

            <div class="row row-cards mt-4">
              <div class="col-md-3">
                <div class="card">
                  <div class="card-status-top bg-primary"></div>
                  <div class="card-body">
                    <h3>👨‍💼 SuperAdmin</h3>
                    <p class="text-muted">Gestion globale + OCR</p>
                    <a href="/superadmin" class="btn btn-primary w-100">Accéder</a>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card">
                  <div class="card-status-top bg-success"></div>
                  <div class="card-body">
                    <h3>👥 Portal Client</h3>
                    <p class="text-muted">Espace clients</p>
                    <a href="/client" class="btn btn-success w-100">Accéder</a>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card">
                  <div class="card-status-top bg-info"></div>
                  <div class="card-body">
                    <h3>🔧 Portal Prestataire</h3>
                    <p class="text-muted">Espace prestataires</p>
                    <a href="/prestataire" class="btn btn-info w-100">Accéder</a>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card">
                  <div class="card-status-top bg-warning"></div>
                  <div class="card-body">
                    <h3>🏪 Portal Revendeur</h3>
                    <p class="text-muted">Espace revendeurs</p>
                    <a href="/revendeur" class="btn btn-warning w-100">Accéder</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <h3>🛠️ Administration</h3>
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                      <a href="http://localhost:8055/admin" target="_blank" class="btn btn-secondary">⚙️ Directus Admin</a>
                      <a href="/api/finance/health" target="_blank" class="btn btn-outline-primary">💰 Finance API</a>
                      <a href="/api/health" target="_blank" class="btn btn-outline-info">📊 Health Check</a>
                      <span class="badge ${ocrStatus ? 'bg-success' : 'bg-danger'}">
                        OCR: ${ocrStatus ? '✅ Configuré' : '❌ Non configuré'}
                      </span>
                      <span class="badge bg-info">Port: ${PORT}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-12">
                <div class="card">
                  <div class="card-body">
                    <h4>📊 État du système</h4>
                    <ul>
                      <li>Base de données : PostgreSQL ✅</li>
                      <li>Cache : Redis ✅</li>
                      <li>CMS : Directus ✅</li>
                      <li>API Finance : 80+ endpoints ✅</li>
                      <li>OCR : OpenAI GPT-4o-mini ${ocrStatus ? '✅' : '❌'}</li>
                      <li>Collections : 51 avec schéma ✅</li>
                      <li>Relations : 96/105 ✅</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  console.log(`⚠️ 404: ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.url,
    available_apis: [
      '/api/finance - Finance API (80+ endpoints)',
      '/api/legal - Legal & Collection API',
      '/api/collection - Collection API',
      '/api/commercial - Commercial Workflow API',
      '/api/health - Health Check'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
Serveur Directus Unifie v2.1 demarre !
==========================================
Page d'accueil     : http://localhost:${PORT}
SuperAdmin + OCR   : http://localhost:${PORT}/superadmin
Portal Client      : http://localhost:${PORT}/client
Portal Prestataire : http://localhost:${PORT}/prestataire
Portal Revendeur   : http://localhost:${PORT}/revendeur
Directus Admin     : http://localhost:8055/admin

Finance API        : http://localhost:${PORT}/api/finance
Legal API          : http://localhost:${PORT}/api/legal
Commercial API     : http://localhost:${PORT}/api/commercial
Health Check       : http://localhost:${PORT}/api/health

Statut:
- OCR OpenAI : ${process.env.OPENAI_API_KEY ? 'Configure' : 'Manquant'}
- DocuSeal   : ${process.env.DOCUSEAL_API_KEY ? 'Configure' : 'Non configure'}
- Port       : ${PORT}
- PID        : ${process.pid}
- Mode       : ES Modules
  `);

  // Initialize Redis cache layer
  initCache();
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});
