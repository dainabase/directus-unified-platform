// routes/notion.js - Routes pour l'API Notion
const express = require('express');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const notionService = require('../services/notion');
const { Client } = require('@notionhq/client');

const router = express.Router();

// Client Notion pour le test OCR
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

// Debug pour l'OCR
router.use((req, res, next) => {
  console.log(`🔍 Notion API: ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path === '/pages') {
    console.log('📄 Création page:', req.body.parent?.database_id);
  }
  next();
});

// Route de test spécifique pour l'OCR
router.get('/test-ocr', async (req, res) => {
  try {
    const me = await notion.users.me();
    const dbTest = await notion.databases.retrieve({ 
      database_id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a' 
    });
    res.json({
      status: 'ok',
      bot: me.name,
      database: dbTest.title[0].plain_text,
      message: '✅ Connexion Notion OK pour l\'OCR'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      code: error.code
    });
  }
});

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// IDs des bases de données Notion
const DATABASES = {
  // Client
  PROJECTS: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  DOCUMENTS: 'b2c3d4e5-f678-9012-bcde-f23456789012',
  INVOICES: 'c3d4e5f6-7890-1234-cdef-345678901234',
  
  // Prestataire
  MISSIONS: 'd4e5f6a7-8901-2345-defa-456789012345',
  TASKS: 'e5f6a7b8-9012-3456-efab-567890123456',
  REWARDS: 'f6a7b8c9-0123-4567-fabc-678901234567',
  CALENDAR: '147adb95-3c6f-8012-90ab-def456789abc',
  
  // Revendeur
  PIPELINE: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
  CLIENTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
  COMMISSIONS: '236adb95-3c6f-80c0-9751-fcf5dfe35564',
  LEADS: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
  
  // Partagé
  MESSAGES: '158adb95-3c6f-8034-01bc-efg567890bcd',
  TIME_ENTRIES: '269adb95-3c6f-8089-c753-ggf8e0d6f745'
};

// POST /api/notion/query - Query générique d'une base de données
router.post('/query', async (req, res) => {
  try {
    const { database_id, filter, sorts, page_size, start_cursor } = req.body;
    
    if (!database_id) {
      return res.status(400).json({ error: 'database_id requis' });
    }
    
    // Construire les options de query
    const options = {};
    if (filter) options.filter = filter;
    if (sorts) options.sorts = sorts;
    if (page_size) options.page_size = page_size;
    if (start_cursor) options.start_cursor = start_cursor;
    
    // Ajouter automatiquement le filtre utilisateur selon le contexte
    const userId = req.user.id;
    const userFilter = this.buildUserFilter(database_id, userId, req.user.roles);
    
    if (userFilter) {
      options.filter = options.filter 
        ? { and: [options.filter, userFilter] }
        : userFilter;
    }
    
    const result = await notionService.queryDatabase(database_id, options);
    res.json(result);
    
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notion/page/:id - Récupérer une page spécifique
router.get('/page/:id', async (req, res) => {
  try {
    const page = await notionService.getPage(req.params.id);
    
    // Vérifier que l'utilisateur a accès à cette page
    if (!this.userCanAccessPage(page, req.user)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notion/page - Créer une nouvelle page
router.post('/page', async (req, res) => {
  try {
    const { database_id, properties, children } = req.body;
    
    if (!database_id || !properties) {
      return res.status(400).json({ 
        error: 'database_id et properties requis' 
      });
    }
    
    // Ajouter automatiquement l'utilisateur créateur
    properties.createdBy = req.user.id;
    properties.createdAt = new Date();
    
    const page = await notionService.createPage(database_id, properties, children);
    res.status(201).json(page);
    
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notion/page/:id - Mettre à jour une page
router.patch('/page/:id', async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!properties) {
      return res.status(400).json({ error: 'properties requis' });
    }
    
    // Vérifier que l'utilisateur peut modifier cette page
    const page = await notionService.getPage(req.params.id);
    if (!this.userCanEditPage(page, req.user)) {
      return res.status(403).json({ error: 'Modification non autorisée' });
    }
    
    // Ajouter les métadonnées de modification
    properties.lastEditedBy = req.user.id;
    properties.lastEditedAt = new Date();
    
    const updatedPage = await notionService.updatePage(req.params.id, properties);
    res.json(updatedPage);
    
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes spécifiques par domaine

// --- CLIENT ---
router.get('/client/projects', checkPermission('projects', 'view'), async (req, res) => {
  try {
    const filter = {
      property: 'Client',
      relation: {
        contains: req.user.id
      }
    };
    
    const projects = await notionService.queryDatabase(DATABASES.PROJECTS, {
      filter,
      sorts: [{ property: 'CreatedAt', direction: 'descending' }]
    });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/client/documents', checkPermission('documents', 'view'), async (req, res) => {
  try {
    const filter = {
      property: 'Client',
      relation: {
        contains: req.user.id
      }
    };
    
    const documents = await notionService.queryDatabase(DATABASES.DOCUMENTS, {
      filter,
      sorts: [{ property: 'UploadedAt', direction: 'descending' }]
    });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRESTATAIRE ---
router.get('/prestataire/missions', checkPermission('missions', 'view'), async (req, res) => {
  try {
    const filter = {
      property: 'Prestataire Assigné',
      people: {
        contains: req.user.id
      }
    };
    
    const missions = await notionService.queryDatabase(DATABASES.MISSIONS, {
      filter,
      sorts: [{ property: 'StartDate', direction: 'ascending' }]
    });
    
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/prestataire/tasks', checkPermission('tasks', 'view'), async (req, res) => {
  try {
    const filter = {
      property: 'Prestataire Assigné',
      people: {
        contains: req.user.id
      }
    };
    
    const tasks = await notionService.queryDatabase(DATABASES.TASKS, {
      filter,
      sorts: [{ property: 'DueDate', direction: 'ascending' }]
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- REVENDEUR ---
router.get('/revendeur/pipeline', checkPermission('pipeline', 'view'), async (req, res) => {
  try {
    const filter = {
      property: 'OwnerId',
      relation: {
        contains: req.user.id
      }
    };
    
    const leads = await notionService.queryDatabase(DATABASES.PIPELINE, {
      filter,
      sorts: [{ property: 'CreatedAt', direction: 'descending' }]
    });
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SHARED ---
router.get('/timetracking/entries', checkPermission('timetracking', 'view'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let filter = {
      property: 'UserId',
      relation: {
        contains: req.user.id
      }
    };
    
    // Ajouter filtre de dates si fourni
    if (start_date || end_date) {
      const dateFilter = { property: 'StartTime', date: {} };
      if (start_date) dateFilter.date.on_or_after = start_date;
      if (end_date) dateFilter.date.on_or_before = end_date;
      
      filter = { and: [filter, dateFilter] };
    }
    
    const entries = await notionService.queryDatabase(DATABASES.TIME_ENTRIES, {
      filter,
      sorts: [{ property: 'StartTime', direction: 'descending' }]
    });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fonctions utilitaires pour les filtres et permissions
router.buildUserFilter = function(databaseId, userId, roles) {
  // Logique pour construire un filtre selon la base et le rôle
  // Retourne null si pas de filtre nécessaire
  
  // Pour les bases client
  if ([DATABASES.PROJECTS, DATABASES.DOCUMENTS, DATABASES.INVOICES].includes(databaseId)) {
    return {
      property: 'ClientId',
      relation: { contains: userId }
    };
  }
  
  // Pour les bases prestataire
  if ([DATABASES.MISSIONS, DATABASES.TASKS].includes(databaseId)) {
    return {
      property: 'AssignedTo',
      people: { contains: userId }
    };
  }
  
  // Pour les bases revendeur
  if ([DATABASES.PIPELINE, DATABASES.LEADS, DATABASES.COMMISSIONS].includes(databaseId)) {
    return {
      property: 'OwnerId',
      relation: { contains: userId }
    };
  }
  
  return null;
};

router.userCanAccessPage = function(page, user) {
  // Vérifier si l'utilisateur peut accéder à cette page
  if (user.roles.includes('admin')) return true;
  
  // Vérifier selon les propriétés de la page
  if (page.clientId === user.id) return true;
  if (page.ownerId === user.id) return true;
  if (page.assignedTo?.includes(user.id)) return true;
  if (page.createdBy === user.id) return true;
  
  return false;
};

router.userCanEditPage = function(page, user) {
  // Même logique que l'accès pour l'instant
  return this.userCanAccessPage(page, user);
};

module.exports = router;