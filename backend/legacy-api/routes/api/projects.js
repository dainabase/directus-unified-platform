// Routes API pour le module Projets
const express = require('express');
const router = express.Router();
const NotionService = require('../../services/notion');
const { authenticateToken, checkRole } = require('../../middleware/auth');

const notionService = new NotionService();

// GET /api/projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, client_id, responsable_id, sort_by = 'Date début' } = req.query;
    const user = req.user;
    
    const filters = [];
    
    // Filtrer selon le rôle
    if (user.role === 'client' && user.company_id) {
      filters.push({ property: 'Client', relation: { contains: user.company_id } });
    } else if (user.role === 'prestataire') {
      filters.push({ property: 'Équipe', people: { contains: user.notion_id } });
    }
    
    if (status) {
      filters.push({ property: 'Statut', select: { equals: status } });
    }
    
    if (client_id) {
      filters.push({ property: 'Client', relation: { contains: client_id } });
    }
    
    if (responsable_id) {
      filters.push({ property: 'Responsable', people: { contains: responsable_id } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const result = await notionService.queryDatabase(
      notionService.databases.PROJECTS,
      {
        filter,
        sorts: [{ property: sort_by, direction: 'descending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// GET /api/projects/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await notionService.getPage(req.params.id);
    
    // Vérifier les permissions
    const user = req.user;
    if (user.role === 'client' && project.properties.Client?.relation[0]?.id !== user.company_id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
  }
});

// GET /api/projects/:id/tasks
router.get('/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const { status, assignee_id } = req.query;
    
    const filters = [
      { property: 'Projet', relation: { contains: req.params.id } }
    ];
    
    if (status) {
      filters.push({ property: 'Statut', select: { equals: status } });
    }
    
    if (assignee_id) {
      filters.push({ property: 'Assigné à', people: { contains: assignee_id } });
    }
    
    const result = await notionService.queryDatabase(
      notionService.databases.TASKS,
      {
        filter: { and: filters },
        sorts: [{ property: 'Priorité', direction: 'descending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
});

// GET /api/projects/:id/documents
router.get('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { type, search } = req.query;
    
    const filters = [
      { property: 'Projet', relation: { contains: req.params.id } }
    ];
    
    if (type) {
      filters.push({ property: 'Type', select: { equals: type } });
    }
    
    if (search) {
      filters.push({
        or: [
          { property: 'Nom', title: { contains: search } },
          { property: 'Description', rich_text: { contains: search } }
        ]
      });
    }
    
    const result = await notionService.queryDatabase(
      notionService.databases.DOCUMENTS,
      {
        filter: { and: filters },
        sorts: [{ property: 'Date création', direction: 'descending' }]
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching project documents:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

// POST /api/projects
router.post('/', authenticateToken, checkRole(['superadmin']), async (req, res) => {
  try {
    const properties = {
      ...req.body.properties,
      'Créé par': { people: [{ id: req.user.notion_id }] },
      'Date création': { date: { start: new Date().toISOString() } }
    };
    
    const result = await notionService.createPage(
      notionService.databases.PROJECTS,
      properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Erreur lors de la création du projet' });
  }
});

// POST /api/projects/:id/tasks
router.post('/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const properties = {
      ...req.body.properties,
      'Projet': { relation: [{ id: req.params.id }] },
      'Créé par': { people: [{ id: req.user.notion_id }] },
      'Date création': { date: { start: new Date().toISOString() } }
    };
    
    const result = await notionService.createPage(
      notionService.databases.TASKS,
      properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
  }
});

// PUT /api/projects/:id
router.put('/:id', authenticateToken, checkRole(['superadmin', 'prestataire']), async (req, res) => {
  try {
    const result = await notionService.updatePage(
      req.params.id,
      req.body.properties
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
});

// GET /api/projects/statistics/overview
router.get('/statistics/overview', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const filters = [];
    
    // Appliquer les filtres selon le rôle
    if (user.role === 'client' && user.company_id) {
      filters.push({ property: 'Client', relation: { contains: user.company_id } });
    } else if (user.role === 'prestataire') {
      filters.push({ property: 'Équipe', people: { contains: user.notion_id } });
    }
    
    const filter = filters.length > 0 ? { and: filters } : undefined;
    
    const projects = await notionService.queryDatabase(
      notionService.databases.PROJECTS,
      { filter }
    );
    
    // Calculer les statistiques
    const stats = {
      total: projects.results.length,
      active: projects.results.filter(p => p.properties['Statut']?.select?.name === 'En cours').length,
      completed: projects.results.filter(p => p.properties['Statut']?.select?.name === 'Terminé').length,
      pending: projects.results.filter(p => p.properties['Statut']?.select?.name === 'En attente').length,
      overdue: projects.results.filter(p => {
        const deadline = p.properties['Date fin']?.date?.start;
        return deadline && new Date(deadline) < new Date() && 
               p.properties['Statut']?.select?.name !== 'Terminé';
      }).length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

module.exports = router;