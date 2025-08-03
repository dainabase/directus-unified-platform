// Routes sécurisées pour l'OCR
const express = require('express');
const { Client } = require('@notionhq/client');
const ocrAuthMiddleware = require('../middleware/ocr-auth');
const router = express.Router();

// Client Notion pour l'OCR
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: '2022-06-28'
});

// Appliquer l'authentification OCR à toutes les routes
router.use(ocrAuthMiddleware);

// POST /api/ocr/notion/pages - Création sécurisée
router.post('/notion/pages', async (req, res) => {
  console.log('🔍 OCR API: Création page avec auth OCR');
  
  try {
    const { parent, properties } = req.body;
    
    if (!parent?.database_id) {
      return res.status(400).json({ 
        error: 'database_id requis' 
      });
    }

    const response = await notion.pages.create({
      parent: { database_id: parent.database_id },
      properties: properties
    });

    console.log('✅ Page OCR créée:', response.id);
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ Erreur OCR:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
});

// PATCH /api/ocr/notion/pages/:id - Mise à jour sécurisée
router.patch('/notion/pages/:id', async (req, res) => {
  console.log('🔍 OCR API: Mise à jour page avec auth OCR');
  
  try {
    const { id } = req.params;
    const { properties } = req.body;
    
    if (!properties) {
      return res.status(400).json({ 
        error: 'properties requis' 
      });
    }

    const response = await notion.pages.update({
      page_id: id,
      properties: properties
    });

    console.log('✅ Page OCR mise à jour:', response.id);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erreur OCR update:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
});

// POST /api/ocr/databases/:id/query - Recherche dans une base
router.post('/databases/:id/query', async (req, res) => {
  console.log('🔍 OCR API: Query database', req.params.id);
  
  try {
    const { filter, sorts, page_size } = req.body;
    
    const response = await notion.databases.query({
      database_id: req.params.id,
      filter: filter || undefined,
      sorts: sorts || undefined,
      page_size: page_size || 100
    });
    
    console.log(`✅ Query réussie: ${response.results.length} résultats`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erreur query database:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
});

// POST /api/notion/upload-proxy/create - Créer session upload
router.post('/upload-proxy/create', async (req, res) => {
  console.log('🔍 OCR API: Création session upload');
  
  try {
    const { filename, content_type } = req.body;
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    res.json({
      id: uploadId,
      filename: filename,
      content_type: content_type
    });
    
  } catch (error) {
    console.error('❌ Erreur création upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notion/upload-proxy/send/:id - Uploader fichier
router.post('/upload-proxy/send/:id', async (req, res) => {
  console.log('🔍 OCR API: Upload fichier ID:', req.params.id);
  
  try {
    // Simuler un upload réussi
    res.json({
      success: true,
      upload_id: req.params.id
    });
    
  } catch (error) {
    console.error('❌ Erreur upload fichier:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notion/upload-proxy/info/:id - Info fichier
router.get('/upload-proxy/info/:id', async (req, res) => {
  console.log('🔍 OCR API: Info fichier ID:', req.params.id);
  
  try {
    res.json({
      id: req.params.id,
      file_url: `https://files.notion.com/sample/${req.params.id}/document.pdf`,
      status: 'uploaded'
    });
    
  } catch (error) {
    console.error('❌ Erreur info fichier:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ocr/health - Vérification santé
router.get('/health', async (req, res) => {
  try {
    const me = await notion.users.me();
    res.json({
      status: 'ok',
      service: 'OCR API',
      notion_connected: true,
      bot: me.name
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'OCR API',
      notion_connected: false,
      error: error.message
    });
  }
});

module.exports = router;