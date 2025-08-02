// Routes API pour le module Finance
const express = require('express');
const router = express.Router();
const NotionService = require('../../services/notion');
const { authenticateToken, checkRole } = require('../../middleware/auth');

const notionService = new NotionService();

// GET /api/finance/factures-clients
router.get('/factures-clients', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, status, client_id, page_size = 100 } = req.query;
    
    // Construire les filtres
    const filters = [];
    
    if (start_date || end_date) {
      const dateFilter = {};
      if (start_date) dateFilter.on_or_after = start_date;
      if (end_date) dateFilter.on_or_before = end_date;
      filters.push({ property: 'Date', date: dateFilter });
    }
    
    if (status) {
      filters.push({ property: 'Statut', select: { equals: status } });
    }
    
    if (client_id) {
      filters.push({ property: 'Client', relation: { contains: client_id } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.FACTURES_CLIENTS,
      {
        filter,
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: parseInt(page_size)
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching factures clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
});

// GET /api/finance/factures-fournisseurs
router.get('/factures-fournisseurs', authenticateToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const { start_date, end_date, status, fournisseur_id } = req.query;
    
    const filters = [];
    
    if (start_date || end_date) {
      const dateFilter = {};
      if (start_date) dateFilter.on_or_after = start_date;
      if (end_date) dateFilter.on_or_before = end_date;
      filters.push({ property: 'Date Facture', date: dateFilter });
    }
    
    if (status) {
      filters.push({ property: 'Statut', select: { equals: status } });
    }
    
    if (fournisseur_id) {
      filters.push({ property: 'Fournisseur', relation: { contains: fournisseur_id } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.FACTURES_FOURNISSEURS,
      {
        filter,
        sorts: [{ property: 'Date Facture', direction: 'descending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching factures fournisseurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures fournisseurs' });
  }
});

// GET /api/finance/notes-frais
router.get('/notes-frais', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, status, employe_id } = req.query;
    const user = req.user;
    
    const filters = [];
    
    // Si pas superadmin, filtrer par employé
    if (user.role !== 'superadmin') {
      filters.push({ property: 'Employé', people: { contains: user.notion_id } });
    } else if (employe_id) {
      filters.push({ property: 'Employé', people: { contains: employe_id } });
    }
    
    if (start_date || end_date) {
      const dateFilter = {};
      if (start_date) dateFilter.on_or_after = start_date;
      if (end_date) dateFilter.on_or_before = end_date;
      filters.push({ property: 'Date Dépense', date: dateFilter });
    }
    
    if (status) {
      filters.push({ property: 'Statut Validation', select: { equals: status } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.NOTES_FRAIS,
      {
        filter,
        sorts: [{ property: 'Date Dépense', direction: 'descending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching notes de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notes de frais' });
  }
});

// GET /api/finance/tva-declarations
router.get('/tva-declarations', authenticateToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const { year, trimestre, entite, status } = req.query;
    
    const filters = [];
    
    if (year) {
      filters.push({ property: 'Année', number: { equals: parseInt(year) } });
    }
    
    if (trimestre) {
      filters.push({ property: 'Trimestre', select: { equals: trimestre } });
    }
    
    if (entite) {
      filters.push({ property: 'Entité', relation: { contains: entite } });
    }
    
    if (status) {
      filters.push({ property: 'Statut', select: { equals: status } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.TVA_DECLARATIONS,
      {
        filter,
        sorts: [
          { property: 'Année', direction: 'descending' },
          { property: 'Trimestre', direction: 'descending' }
        ]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching TVA declarations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des déclarations TVA' });
  }
});

// POST /api/finance/factures-clients
router.post('/factures-clients', authenticateToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const result = await notionService.createPage(
      notionService.databases.FACTURES_CLIENTS,
      req.body.properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating facture client:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
});

// POST /api/finance/notes-frais
router.post('/notes-frais', authenticateToken, async (req, res) => {
  try {
    const properties = {
      ...req.body.properties,
      'Employé': { people: [{ id: req.user.notion_id }] }
    };
    
    const result = await notionService.createPage(
      notionService.databases.NOTES_FRAIS,
      properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la note de frais' });
  }
});

// PUT /api/finance/factures-clients/:id
router.put('/factures-clients/:id', authenticateToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const result = await notionService.updatePage(
      req.params.id,
      req.body.properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating facture client:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
  }
});

// GET /api/finance/statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;
    
    // Récupérer les données pour les statistiques
    const [factures, notes, tva] = await Promise.all([
      notionService.queryDatabase(notionService.databases.FACTURES_CLIENTS, {
        filter: {
          and: [
            { property: 'Date', date: { on_or_after: `${year}-01-01` } },
            { property: 'Date', date: { on_or_before: `${year}-12-31` } }
          ]
        }
      }),
      notionService.queryDatabase(notionService.databases.NOTES_FRAIS, {
        filter: {
          and: [
            { property: 'Date Dépense', date: { on_or_after: `${year}-01-01` } },
            { property: 'Date Dépense', date: { on_or_before: `${year}-12-31` } }
          ]
        }
      }),
      notionService.queryDatabase(notionService.databases.TVA_DECLARATIONS, {
        filter: { property: 'Année', number: { equals: parseInt(year) } }
      })
    ]);
    
    // Calculer les statistiques
    const stats = {
      revenue: factures.results.reduce((sum, f) => sum + (f.properties['Montant TTC']?.number || 0), 0),
      expenses: notes.results.reduce((sum, n) => sum + (n.properties['Montant']?.number || 0), 0),
      vat_to_pay: tva.results.reduce((sum, t) => sum + (t.properties['TVA à Payer']?.number || 0), 0),
      invoices_count: factures.results.length,
      pending_invoices: factures.results.filter(f => f.properties['Statut']?.select?.name === 'En attente').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

module.exports = router;