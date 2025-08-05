/**
 * Serveur unifié : Directus + Dashboard Legacy
 * Combine les deux systèmes en un seul point d'entrée
 */

const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use('/assets', express.static(path.join(__dirname, 'frontend/shared/assets')));
app.use('/tabler', express.static(path.join(__dirname, 'frontend/shared/tabler')));

// 1. Dashboard Legacy - Fichiers statiques
app.use('/superadmin', express.static(path.join(__dirname, 'frontend/portals/superadmin')));
app.use('/client', express.static(path.join(__dirname, 'frontend/portals/client')));
app.use('/prestataire', express.static(path.join(__dirname, 'frontend/portals/prestataire')));
app.use('/revendeur', express.static(path.join(__dirname, 'frontend/portals/revendeur')));

// 2. Proxy vers Directus pour l'admin et l'API
app.use('/admin', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:8055${req.url}`,
      headers: req.headers,
      data: req.body
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || 'Proxy error');
  }
});

app.use('/items', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:8055/items${req.url}`,
      headers: req.headers,
      data: req.body
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Proxy error' });
  }
});

// 3. Route de test OCR
app.post('/api/ocr/test', async (req, res) => {
  const isConfigured = !!(process.env.OPENAI_API_KEY || process.env.OCR_OPENAI_API_KEY);
  res.json({
    status: 'ready',
    openai_configured: isConfigured,
    message: isConfigured ? 'OCR prêt' : 'Configurer OPENAI_API_KEY dans .env',
    endpoint: '/api/ocr/scan'
  });
});

// 4. Page d'accueil avec liens
app.get('/', (req, res) => {
  const ocrConfigured = !!(process.env.OPENAI_API_KEY || process.env.OCR_OPENAI_API_KEY);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Directus Unified Platform</title>
      <link rel="stylesheet" href="https://unpkg.com/@tabler/core@latest/dist/css/tabler.min.css">
    </head>
    <body>
      <div class="page">
        <div class="container-xl">
          <h1 class="page-title mt-5">🚀 Plateforme Directus Unifiée</h1>
          
          <div class="row row-cards mt-5">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h2>Administration</h2>
                  <a href="http://localhost:8055/admin" class="btn btn-primary" target="_blank">Directus Admin</a>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h2>Portails Dashboard</h2>
                  <a href="/superadmin" class="btn btn-info">SuperAdmin (OCR)</a>
                  <a href="/client" class="btn btn-success">Client</a>
                  <a href="/prestataire" class="btn btn-warning">Prestataire</a>
                  <a href="/revendeur" class="btn btn-danger">Revendeur</a>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-3">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <h3>État du système</h3>
                  <p>OCR: ${ocrConfigured ? '✅ Configuré' : '❌ Non configuré (ajouter OPENAI_API_KEY dans .env)'}</p>
                  <p>Directus: <a href="http://localhost:8055" target="_blank">http://localhost:8055</a></p>
                  <p>Dashboard: http://localhost:3000</p>
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

app.listen(PORT, () => {
  const ocrStatus = !!(process.env.OPENAI_API_KEY || process.env.OCR_OPENAI_API_KEY);
  console.log(`
🚀 Serveur Unifié Démarré !
================================
- Page d'accueil : http://localhost:${PORT}
- Directus Admin : http://localhost:8055/admin
- SuperAdmin OCR : http://localhost:${PORT}/superadmin
- Portal Client  : http://localhost:${PORT}/client
- Portal Presta  : http://localhost:${PORT}/prestataire
- Portal Revend  : http://localhost:${PORT}/revendeur
- API Directus   : http://localhost:8055/items/

✅ OCR Config: ${ocrStatus ? 'OK' : 'MISSING! Ajouter OPENAI_API_KEY dans .env'}
  `);
});