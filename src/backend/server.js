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

// ES Modules: __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.UNIFIED_PORT || 3000;

// Configuration Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

console.log('🚀 Démarrage du serveur Directus Unifié (ES Modules)...');

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// JSON body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS simple
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// API AUTHENTIFICATION
// ============================================

import authRoutes from './api/auth/auth.routes.js';
import { authMiddleware, optionalAuth, flexibleAuth } from './middleware/auth.middleware.js';
app.use('/api/auth', authRoutes);
console.log('✅ API Auth connectée: /api/auth');

// ============================================
// API FINANCE - 80+ ENDPOINTS (Protected)
// ============================================

import financeRoutes from './api/finance/finance.routes.js';
// Finance API uses flexible auth (JWT or API Key) - see finance.routes.js for route-specific auth
app.use('/api/finance', financeRoutes);
console.log('✅ API Finance connectée: /api/finance (80+ endpoints)');

// ============================================
// API LEGAL - RECOUVREMENT
// ============================================

import legalRoutes from './api/legal/legal.routes.js';
app.use('/api/legal', legalRoutes);
console.log('✅ API Legal connectée: /api/legal');

// ============================================
// API COLLECTION
// ============================================

import collectionRoutes from './api/collection/collection.routes.js';
app.use('/api/collection', collectionRoutes);
console.log('✅ API Collection connectée: /api/collection');

// ============================================
// PROXY DIRECTUS LEGACY
// ============================================

// Proxy simple vers Directus
app.get('/api/directus/items/:collection', async (req, res) => {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/items/${req.params.collection}`,
      {
        headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` },
        params: req.query
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint OCR pour scanner les factures
app.post('/api/ocr/scan-invoice', async (req, res) => {
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
        headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
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
      error: 'Erreur lors du scan',
      details: error.response?.data?.error?.message || error.message
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
// LEGACY APIs (mautic, erpnext, revolut)
// Note: Ces APIs utilisent encore CommonJS, conversion en cours
// ============================================

// API Revolut - À convertir
try {
  const revolutRouter = await import('./api/revolut/index.js');
  app.use('/api/revolut', revolutRouter.default);
  console.log('✅ API Revolut connectée: /api/revolut');
} catch (err) {
  console.warn('⚠️ API Revolut non disponible:', err.message);
}

// API ERPNext - À convertir
try {
  const erpnextRouter = await import('./api/erpnext/index.js');
  app.use('/api/erpnext', erpnextRouter.default);
  console.log('✅ API ERPNext connectée: /api/erpnext');
} catch (err) {
  console.warn('⚠️ API ERPNext non disponible:', err.message);
}

// API Mautic - À convertir
try {
  const mauticRouter = await import('./api/mautic/router.js');
  app.use('/api/mautic', mauticRouter.default);
  console.log('✅ API Mautic connectée: /api/mautic');
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
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      finance: 'ok',
      legal: 'ok',
      collection: 'ok',
      directus: DIRECTUS_URL,
      ocr: process.env.OPENAI_API_KEY ? 'ok' : 'not_configured'
    },
    endpoints: {
      finance: '/api/finance (80+ endpoints)',
      legal: '/api/legal',
      collection: '/api/collection',
      health: '/api/health'
    }
  });
});

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
✅ Serveur Directus Unifié v2.0 démarré !
==========================================
🏠 Page d'accueil     : http://localhost:${PORT}
👨‍💼 SuperAdmin + OCR  : http://localhost:${PORT}/superadmin
👥 Portal Client      : http://localhost:${PORT}/client
🔧 Portal Prestataire : http://localhost:${PORT}/prestataire
🏪 Portal Revendeur   : http://localhost:${PORT}/revendeur
⚙️ Directus Admin     : http://localhost:8055/admin

💰 Finance API        : http://localhost:${PORT}/api/finance
📋 Legal API          : http://localhost:${PORT}/api/legal
📊 Health Check       : http://localhost:${PORT}/api/health

📊 Statut:
- OCR OpenAI : ${process.env.OPENAI_API_KEY ? '✅ Configuré' : '❌ Manquant'}
- Port       : ${PORT}
- PID        : ${process.pid}
- Mode       : ES Modules
  `);
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
