// Routes API pour le module CRM
const express = require('express');
const router = express.Router();
const NotionService = require('../../services/notion');
const { authenticateToken, checkRole } = require('../../middleware/auth');

const notionService = new NotionService();

// GET /api/crm/contacts
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const { search, type, entreprise_id } = req.query;
    
    const filters = [];
    
    if (search) {
      filters.push({
        or: [
          { property: 'Nom', title: { contains: search } },
          { property: 'Email', email: { contains: search } },
          { property: 'Téléphone', phone_number: { contains: search } }
        ]
      });
    }
    
    if (type) {
      filters.push({ property: 'Type', select: { equals: type } });
    }
    
    if (entreprise_id) {
      filters.push({ property: 'Entreprise', relation: { contains: entreprise_id } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.CONTACTS_PERSONNES,
      {
        filter,
        sorts: [{ property: 'Nom', direction: 'ascending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des contacts' });
  }
});

// GET /api/crm/entreprises
router.get('/entreprises', authenticateToken, async (req, res) => {
  try {
    const { search, secteur, status } = req.query;
    
    const filters = [];
    
    if (search) {
      filters.push({
        or: [
          { property: 'Nom', title: { contains: search } },
          { property: 'SIREN', rich_text: { contains: search } }
        ]
      });
    }
    
    if (secteur) {
      filters.push({ property: 'Secteur', select: { equals: secteur } });
    }
    
    if (status) {
      filters.push({ property: 'Statut', select: { equals: status } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.CONTACTS_ENTREPRISES,
      {
        filter,
        sorts: [{ property: 'Nom', direction: 'ascending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching entreprises:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises' });
  }
});

// GET /api/crm/pipeline
router.get('/pipeline', authenticateToken, checkRole(['superadmin', 'revendeur']), async (req, res) => {
  try {
    const { stage, responsable_id, date_from, date_to } = req.query;
    const user = req.user;
    
    const filters = [];
    
    // Si revendeur, filtrer par responsable
    if (user.role === 'revendeur') {
      filters.push({ property: 'Responsable', people: { contains: user.notion_id } });
    } else if (responsable_id) {
      filters.push({ property: 'Responsable', people: { contains: responsable_id } });
    }
    
    if (stage) {
      filters.push({ property: 'Étape', select: { equals: stage } });
    }
    
    if (date_from || date_to) {
      const dateFilter = {};
      if (date_from) dateFilter.on_or_after = date_from;
      if (date_to) dateFilter.on_or_before = date_to;
      filters.push({ property: 'Date création', date: dateFilter });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.SALES_PIPELINE,
      {
        filter,
        sorts: [{ property: 'Valeur', direction: 'descending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du pipeline' });
  }
});

// POST /api/crm/contacts
router.post('/contacts', authenticateToken, async (req, res) => {
  try {
    const properties = {
      ...req.body.properties,
      'Créé par': { people: [{ id: req.user.notion_id }] },
      'Date création': { date: { start: new Date().toISOString() } }
    };
    
    const result = await notionService.createPage(
      notionService.databases.CONTACTS_PERSONNES,
      properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Erreur lors de la création du contact' });
  }
});

// POST /api/crm/entreprises
router.post('/entreprises', authenticateToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const properties = {
      ...req.body.properties,
      'Créé par': { people: [{ id: req.user.notion_id }] },
      'Date création': { date: { start: new Date().toISOString() } }
    };
    
    const result = await notionService.createPage(
      notionService.databases.CONTACTS_ENTREPRISES,
      properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating entreprise:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'entreprise' });
  }
});

// POST /api/crm/pipeline
router.post('/pipeline', authenticateToken, checkRole(['superadmin', 'revendeur']), async (req, res) => {
  try {
    const properties = {
      ...req.body.properties,
      'Responsable': { people: [{ id: req.user.notion_id }] },
      'Date création': { date: { start: new Date().toISOString() } }
    };
    
    const result = await notionService.createPage(
      notionService.databases.SALES_PIPELINE,
      properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'opportunité' });
  }
});

// PUT /api/crm/pipeline/:id
router.put('/pipeline/:id', authenticateToken, checkRole(['superadmin', 'revendeur']), async (req, res) => {
  try {
    // Si changement d'étape, ajouter à l'historique
    if (req.body.properties['Étape']) {
      const currentPage = await notionService.getPage(req.params.id);
      const oldStage = currentPage.properties['Étape']?.select?.name;
      const newStage = req.body.properties['Étape'].select.name;
      
      if (oldStage !== newStage) {
        // Ajouter à l'historique des changements
        const history = currentPage.properties['Historique']?.rich_text[0]?.text?.content || '';
        const newHistory = `${new Date().toISOString()} - ${oldStage} → ${newStage} (${req.user.name})\n${history}`;
        
        req.body.properties['Historique'] = {
          rich_text: [{ text: { content: newHistory } }]
        };
      }
    }
    
    const result = await notionService.updatePage(
      req.params.id,
      req.body.properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'opportunité' });
  }
});

// GET /api/crm/statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const filters = [];
    
    // Filtrer selon le rôle
    if (user.role === 'revendeur') {
      filters.push({ property: 'Responsable', people: { contains: user.notion_id } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const [contacts, entreprises, pipeline] = await Promise.all([
      notionService.queryDatabase(notionService.databases.CONTACTS_PERSONNES, { filter }),
      notionService.queryDatabase(notionService.databases.CONTACTS_ENTREPRISES, { filter }),
      notionService.queryDatabase(notionService.databases.SALES_PIPELINE, { filter })
    ]);
    
    // Calculer les statistiques du pipeline
    const pipelineByStage = {};
    let totalValue = 0;
    let wonValue = 0;
    
    pipeline.results.forEach(opp => {
      const stage = opp.properties['Étape']?.select?.name || 'Non défini';
      const value = opp.properties['Valeur']?.number || 0;
      
      if (!pipelineByStage[stage]) {
        pipelineByStage[stage] = { count: 0, value: 0 };
      }
      
      pipelineByStage[stage].count++;
      pipelineByStage[stage].value += value;
      totalValue += value;
      
      if (stage === 'Gagné') {
        wonValue += value;
      }
    });
    
    const stats = {
      contacts_count: contacts.results.length,
      entreprises_count: entreprises.results.length,
      opportunities_count: pipeline.results.length,
      pipeline_value: totalValue,
      won_value: wonValue,
      conversion_rate: pipeline.results.length > 0 
        ? (pipeline.results.filter(o => o.properties['Étape']?.select?.name === 'Gagné').length / pipeline.results.length * 100).toFixed(1)
        : 0,
      pipeline_by_stage: pipelineByStage
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching CRM statistics:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques CRM' });
  }
});

module.exports = router;