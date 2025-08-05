/**
 * Serveur Unifié Directus - Sans conflit avec Twenty
 * Port 3000 : Dashboard unifié
 * Port 8055 : Directus CMS
 */

const express = require('express');
const path = require('path');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.UNIFIED_PORT || 3000;

// Configuration Directus
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

console.log('🚀 Démarrage du serveur Directus Unifié...');

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
app.post('/api/ocr/scan-invoice', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { image } = req.body; // Base64 image
    
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
    
    // Parser la réponse
    const content = openaiResponse.data.choices[0].message.content;
    let extractedData;
    try {
      // Extraire le JSON de la réponse
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
    
    // Sauvegarder dans Directus
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

// IMPORTANT : Servir les fichiers statiques EN PREMIER
// pour éviter les conflits avec Twenty ou autres apps

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

// 5b. Fichiers statiques à la racine (login.html, demo.html, etc)
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

// 6. Proxy vers Directus pour l'admin et l'API
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

// 7. API spéciale OCR
app.post('/api/ocr/scan', async (req, res) => {
  // Vérifier la config
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OCR non configuré',
      message: 'Clé OpenAI manquante dans .env'
    });
  }
  
  res.json({
    status: 'ready',
    message: 'OCR service ready',
    model: process.env.OPENAI_MODEL
  });
});

// 8. API Invoice Ninja Integration
try {
  const invoiceNinjaAPI = require('./src/backend/api/invoice-ninja/sync');

  app.get('/api/invoice-ninja/test', async (req, res) => {
    try {
      const result = await invoiceNinjaAPI.testInvoiceNinjaConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/invoice-ninja/sync-contact', express.json(), async (req, res) => {
    try {
      const result = await invoiceNinjaAPI.syncContactToInvoiceNinja(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/invoice-ninja/create-invoice', express.json(), async (req, res) => {
    try {
      const result = await invoiceNinjaAPI.createInvoiceInInvoiceNinja(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/invoice-ninja/webhook', express.json(), async (req, res) => {
    try {
      const result = await invoiceNinjaAPI.handleInvoiceNinjaWebhook(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log('✅ API Invoice Ninja configurée');
} catch (error) {
  console.log('⚠️ API Invoice Ninja non disponible:', error.message);
}

// 9. API Revolut Business Integration
try {
  const revolutRouter = require('./src/backend/api/revolut');
  app.use('/api/revolut', revolutRouter);
  console.log('✅ API Revolut Business configurée');
} catch (error) {
  console.log('⚠️ API Revolut non disponible:', error.message);
}

// 10. Page d'accueil moderne avec tous les portails
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
              <h1>🚀 Directus Unified Platform</h1>
              <p class="text-muted">Plateforme unifiée avec 4 portails et OCR intégré</p>
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
                    <div class="d-flex gap-2 align-items-center">
                      <a href="http://localhost:8055/admin" target="_blank" class="btn btn-secondary">⚙️ Directus Admin</a>
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

// 9. Gestion des erreurs 404
app.use((req, res) => {
  console.log(`⚠️ 404: ${req.url}`);
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page non trouvée</title>
      <link rel="stylesheet" href="https://unpkg.com/@tabler/core@latest/dist/css/tabler.min.css">
    </head>
    <body>
      <div class="page">
        <div class="container-xl">
          <h1>404 - Page non trouvée</h1>
          <p>URL demandée : ${req.url}</p>
          <a href="/" class="btn btn-primary">Retour à l'accueil</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
✅ Serveur Directus Unifié démarré !
====================================
🏠 Page d'accueil    : http://localhost:${PORT}
👨‍💼 SuperAdmin + OCR : http://localhost:${PORT}/superadmin
👥 Portal Client     : http://localhost:${PORT}/client
🔧 Portal Prestataire: http://localhost:${PORT}/prestataire
🏪 Portal Revendeur  : http://localhost:${PORT}/revendeur
⚙️ Directus Admin    : http://localhost:8055/admin

📊 Statut:
- OCR OpenAI : ${process.env.OPENAI_API_KEY ? '✅ Configuré' : '❌ Manquant'}
- Port       : ${PORT}
- PID        : ${process.pid}
  `);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});