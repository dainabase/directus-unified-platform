// notion-connector.js - Connecteur pour les bases de données Notion via MCP
// Ce fichier centralise toutes les connexions aux bases de données Notion

// Configuration des IDs des bases de données Notion
const NOTION_DBS = {
  // BASES PRINCIPALES
  PROJETS: '226adb95-3c6f-806e-9e61-e263baf7af69',        // DB-PROJETS CLIENTS
  UTILISATEURS: '236adb95-3c6f-807f-9ea9-d08076830f7c',   // DB-UTILISATEURS
  TACHES: '227adb95-3c6f-8047-b7c1-e7d309071682',         // DB-TACHES
  DOCUMENTS: '230adb95-3c6f-80eb-9903-ff117c2a518f',      // DB-DOCUMENTS
  
  // FINANCES
  FINANCES: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a',       // DB-DEVIS & FACTURES
  
  // PRESTATAIRES
  MISSIONS: '236adb95-3c6f-80ca-a317-c7ff9dc7153c',       // DB-MISSIONS-PRESTATAIRE
  LIVRABLES: '236adb95-3c6f-801f-94d8-ee19736de74c',      // DB-LIVRABLES-PRESTATAIRE
  PERFORMANCE: '236adb95-3c6f-804b-807e-ffb4318fb667',    // DB-PERFORMANCE-HISTORIQUE
  REWARDS: '236adb95-3c6f-80f7-8034-dedae4272189',        // DB-REWARDS-TRACKING
  
  // REVENDEURS
  PIPELINE: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',       // DB-SALES-PIPELINE
  VENTES: '236adb95-3c6f-8018-b3ba-fa5c85c9e9e6',         // DB-VENTES
  COMMISSIONS: '236adb95-3c6f-80c0-9751-fcf5dfe35564',    // DB-COMMISSIONS-REVENDEUR
  ZONES_GEO: '236adb95-3c6f-801b-b7d2-fce14f6c3d11',      // DB-ZONES-GEOGRAPHIQUES
  
  // SUPPORT
  CONTACTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',       // DB-CONTACTS-ENTREPRISES
  CONTACTS_PERSONNES: '22cadb95-3c6f-80f1-8e05-ffe0eef29f52', // DB-CONTACTS-PERSONNES
  COMMUNICATIONS: '230adb95-3c6f-807f-81b1-e5e90ea9dd17', // DB-COMMUNICATION
  TIME_TRACKING: '236adb95-3c6f-80a0-b65d-d69ea599d39a',  // DB-TIME-TRACKING
  PERMISSIONS: '236adb95-3c6f-80ff-8918-fd5c388dcbd9'     // DB-PERMISSIONS-ACCÈS
};

// Cache pour stocker temporairement les données et réduire les appels API
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utilitaire pour gérer le cache
const cacheManager = {
  get: (key) => {
    const cached = dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    dataCache.delete(key);
    return null;
  },
  
  set: (key, data) => {
    dataCache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  },
  
  clear: () => {
    dataCache.clear();
  }
};

// Gestion des erreurs centralisée
const handleError = (error, context) => {
  console.error(`Erreur ${context}:`, error);
  // Afficher un message d'erreur à l'utilisateur
  if (window.showNotification) {
    window.showNotification(`Erreur lors de ${context}`, 'error');
  }
  return null;
};

// Fonctions d'authentification
const authFunctions = {
  // Vérifier les credentials lors du login
  authenticateUser: async (email, password) => {
    try {
      // Simuler l'authentification en attendant l'intégration complète
      // TODO: Implémenter la vraie authentification avec DB-UTILISATEURS
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'client', // ou 'prestataire' ou 'revendeur'
        avatar: '/assets/img/avatar-default.png'
      };
      
      // Stocker en session
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: mockUser,
        role: mockUser.role
      }));
      
      return mockUser;
    } catch (error) {
      return handleError(error, 'authentification');
    }
  },
  
  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authData = JSON.parse(auth);
      return authData.user;
    }
    return null;
  },
  
  // Vérifier les permissions
  checkPermission: async (resource, action) => {
    try {
      const user = authFunctions.getCurrentUser();
      if (!user) return false;
      
      // TODO: Vérifier dans DB-PERMISSIONS
      // Pour l'instant, autoriser tout selon le rôle
      return true;
    } catch (error) {
      return handleError(error, 'vérification des permissions');
    }
  }
};

// Fonctions pour l'espace CLIENT
const clientFunctions = {
  // Récupérer les projets d'un client
  getClientProjects: async (clientId) => {
    const cacheKey = `projects_${clientId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.PROJETS,
        filter: {
          property: 'Client',
          relation: {
            contains: clientId
          }
        },
        sorts: [{
          property: 'Date Début',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les projets');
        return [];
      }
      
      // Transformer les données Notion en format utilisable
      const projects = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          name: properties['Nom du Projet']?.title?.[0]?.text?.content || 'Projet sans nom',
          client: properties['Client']?.relation?.[0]?.id || null,
          status: properties['Statut Projet']?.select?.name || 'Non défini',
          progress: properties['% Avancement']?.number || 0,
          budget: properties['Budget']?.number || 0,
          startDate: properties['Date Début']?.date?.start || null,
          endDate: properties['Date Fin Prévue']?.date?.start || null,
          description: properties['Description']?.rich_text?.[0]?.text?.content || '',
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time
        };
      });
      
      cacheManager.set(cacheKey, projects);
      return projects;
    } catch (error) {
      return handleError(error, 'récupération des projets');
    }
  },
  
  // Récupérer les tâches d'un projet
  getProjectTasks: async (projectId) => {
    const cacheKey = `tasks_${projectId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les tâches
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.TACHES,
        filter: {
          property: 'Tâches Projets CRM',
          relation: {
            contains: projectId
          }
        },
        sorts: [{
          property: 'Date de création',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les tâches');
        return [];
      }
      
      // Transformer les données Notion
      const tasks = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          title: properties['Titre']?.title?.[0]?.text?.content || 'Tâche sans nom',
          projectId: projectId,
          status: properties['Statut']?.select?.name || 'À faire',
          priority: properties['Priorité']?.select?.name || 'Moyenne',
          assignee: properties['Assigné à']?.people?.[0]?.name || 'Non assigné',
          dueDate: properties['Échéance']?.date?.start || null,
          description: properties['Description']?.rich_text?.[0]?.text?.content || '',
          createdTime: page.created_time
        };
      });
      
      cacheManager.set(cacheKey, tasks);
      return tasks;
    } catch (error) {
      return handleError(error, 'récupération des tâches');
    }
  },
  
  // Récupérer les documents d'un projet
  getProjectDocuments: async (projectId) => {
    const cacheKey = `documents_${projectId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les documents
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.DOCUMENTS,
        filter: {
          property: 'Projet',
          relation: {
            contains: projectId
          }
        },
        sorts: [{
          property: 'Date Upload',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les documents');
        return [];
      }
      
      // Transformer les données Notion
      const documents = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          name: properties['Nom Fichier']?.title?.[0]?.text?.content || 'Document sans nom',
          type: properties['Type Fichier']?.select?.name || 'Autre',
          size: properties['Taille']?.rich_text?.[0]?.text?.content || 'Inconnue',
          uploadDate: properties['Date Upload']?.date?.start || page.created_time,
          status: properties['Statut']?.select?.name || 'En attente',
          projectId: projectId,
          url: properties['URL Fichier']?.url || null,
          version: properties['Version']?.number || 1,
          uploadedBy: properties['Uploadé par']?.people?.[0]?.name || 'Inconnu',
          createdTime: page.created_time
        };
      });
      
      cacheManager.set(cacheKey, documents);
      return documents;
    } catch (error) {
      console.error('Erreur récupération documents MCP:', error);
      return handleError(error, 'récupération des documents');
    }
  },
  
  // Récupérer les données financières
  getClientFinances: async (clientId) => {
    const cacheKey = `finances_${clientId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les finances
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.FINANCES,
        filter: {
          property: 'Client',
          relation: {
            contains: clientId
          }
        },
        sorts: [{
          property: 'Date',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les finances');
        return { invoices: [], quotes: [], totals: {} };
      }
      
      // Séparer les factures et les devis
      const invoices = [];
      const quotes = [];
      
      response.results.forEach(page => {
        const properties = page.properties || {};
        const type = properties['Type Document']?.select?.name || 'Autre';
        
        const item = {
          id: page.id,
          number: properties['Numéro']?.rich_text?.[0]?.text?.content || 'Sans numéro',
          date: properties['Date']?.date?.start || page.created_time,
          amount: properties['Montant']?.number || 0,
          status: properties['Statut']?.select?.name || 'Non défini',
          projectId: properties['Projet']?.relation?.[0]?.id || null,
          dueDate: properties['Échéance']?.date?.start || null,
          createdTime: page.created_time
        };
        
        if (type === 'Facture') {
          invoices.push(item);
        } else if (type === 'Devis') {
          quotes.push(item);
        }
      });
      
      // Calculer les totaux
      const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const totalPaid = invoices
        .filter(inv => inv.status === 'Payée')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const totalPending = invoices
        .filter(inv => inv.status === 'En attente')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const totalQuoted = quotes
        .filter(quote => quote.status !== 'Refusé')
        .reduce((sum, quote) => sum + (quote.amount || 0), 0);
      
      const finances = {
        invoices,
        quotes,
        totals: {
          totalInvoiced,
          totalPaid,
          totalPending,
          totalQuoted
        }
      };
      
      cacheManager.set(cacheKey, finances);
      return finances;
    } catch (error) {
      console.error('Erreur récupération finances MCP:', error);
      return handleError(error, 'récupération des données financières');
    }
  }
};

// Fonctions pour l'espace PRESTATAIRE
const prestataireFunctions = {
  // Récupérer les missions d'un prestataire
  getPrestataireMissions: async (prestataireId) => {
    const cacheKey = `missions_${prestataireId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les missions
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.MISSIONS,
        filter: {
          property: 'Prestataire Assigné',
          relation: {
            contains: prestataireId
          }
        },
        sorts: [{
          property: 'Priorité',
          direction: 'ascending'
        }, {
          property: 'Échéance',
          direction: 'ascending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les missions');
        return [];
      }
      
      // Transformer les données Notion
      const missions = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          title: properties['Titre Mission']?.title?.[0]?.text?.content || 'Mission sans titre',
          client: properties['Client']?.relation?.[0]?.id || 'Client inconnu',
          clientName: properties['Nom Client']?.rollup?.array?.[0]?.title?.[0]?.text?.content || 'Inconnu',
          status: properties['Statut']?.select?.name || 'À faire',
          priority: properties['Priorité']?.select?.name || 'Moyenne',
          deadline: properties['Échéance']?.date?.start || null,
          reward: properties['Points Récompense']?.number || 0,
          progress: properties['% Avancement']?.number || 0,
          description: properties['Description']?.rich_text?.[0]?.text?.content || '',
          assignedDate: properties['Date Attribution']?.date?.start || page.created_time,
          estimatedHours: properties['Heures Estimées']?.number || 0,
          actualHours: properties['Heures Réelles']?.number || 0,
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time
        };
      });
      
      cacheManager.set(cacheKey, missions);
      return missions;
    } catch (error) {
      console.error('Erreur récupération missions MCP:', error);
      return handleError(error, 'récupération des missions');
    }
  },
  
  // Récupérer les données de performance
  getPrestatairePerformance: async (prestataireId) => {
    const cacheKey = `performance_${prestataireId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les performances
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.PERFORMANCE,
        filter: {
          property: 'Prestataire',
          relation: {
            contains: prestataireId
          }
        },
        sorts: [{
          property: 'Date Enregistrement',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results || response.results.length === 0) {
        console.warn('Pas de données de performance dans Notion');
        // Retourner des valeurs par défaut plutôt que des mocks
        return {
          globalScore: 0,
          completedMissions: 0,
          onTimeMissions: 0,
          avgQualityScore: 0,
          totalPoints: 0,
          level: 'Débutant',
          nextLevelPoints: 1000,
          monthlyStats: []
        };
      }
      
      // Prendre les dernières données de performance
      const latestPerformance = response.results[0];
      const properties = latestPerformance.properties || {};
      
      // Récupérer les statistiques mensuelles (simplifié)
      const monthlyStats = [];
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const currentMonth = new Date().getMonth();
      
      for (let i = Math.max(0, currentMonth - 2); i <= currentMonth; i++) {
        monthlyStats.push({
          month: months[i],
          completed: Math.floor(Math.random() * 10), // TODO: Calculer depuis les vraies missions
          points: Math.floor(Math.random() * 500) // TODO: Calculer depuis les vrais points
        });
      }
      
      const performance = {
        globalScore: properties['Score Global']?.number || 0,
        completedMissions: properties['Missions Complétées']?.number || 0,
        onTimeMissions: properties['Missions à Temps']?.number || 0,
        avgQualityScore: properties['Note Qualité Moyenne']?.number || 0,
        totalPoints: properties['Total Points']?.number || 0,
        level: properties['Niveau']?.select?.name || 'Débutant',
        nextLevelPoints: properties['Points Niveau Suivant']?.number || 1000,
        monthlyStats: monthlyStats,
        lastUpdate: properties['Date Enregistrement']?.date?.start || latestPerformance.created_time
      };
      
      cacheManager.set(cacheKey, performance);
      return performance;
    } catch (error) {
      console.error('Erreur récupération performance MCP:', error);
      return handleError(error, 'récupération des performances');
    }
  },
  
  // Gérer les livrables
  submitLivrable: async (missionId, livrableData) => {
    try {
      // Créer un nouveau livrable dans Notion via MCP
      const response = await window.mcp_notion?.pages.create({
        parent: { database_id: NOTION_DBS.LIVRABLES },
        properties: {
          'Mission': {
            relation: [{ id: missionId }]
          },
          'Nom Livrable': {
            title: [{
              text: {
                content: livrableData.name || 'Livrable sans nom'
              }
            }]
          },
          'Description': {
            rich_text: [{
              text: {
                content: livrableData.description || ''
              }
            }]
          },
          'URL/Fichier': {
            url: livrableData.url || null
          },
          'Statut Validation': {
            select: {
              name: 'En attente de validation'
            }
          },
          'Date Soumission': {
            date: {
              start: new Date().toISOString().split('T')[0]
            }
          }
        }
      });
      
      if (response && response.id) {
        return {
          success: true,
          id: response.id,
          validationStatus: 'En attente de validation'
        };
      } else {
        throw new Error('Impossible de créer le livrable dans Notion');
      }
    } catch (error) {
      console.error('Erreur soumission livrable MCP:', error);
      return handleError(error, 'soumission du livrable');
    }
  },
  
  // Récupérer les rewards
  getPrestataireRewards: async (prestataireId) => {
    const cacheKey = `rewards_${prestataireId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les rewards
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.REWARDS,
        filter: {
          property: 'Prestataire',
          relation: {
            contains: prestataireId
          }
        },
        sorts: [{
          property: 'Date Obtention',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les rewards');
        return {
          totalPoints: 0,
          availablePoints: 0,
          level: 'Débutant',
          rank: 0,
          badges: [],
          history: []
        };
      }
      
      // Traiter les résultats
      let totalPoints = 0;
      let availablePoints = 0;
      const badges = [];
      const history = [];
      
      response.results.forEach(page => {
        const properties = page.properties || {};
        const rewardType = properties['Type Récompense']?.select?.name;
        
        if (rewardType === 'Points') {
          const points = properties['Nombre Points']?.number || 0;
          const status = properties['Statut']?.select?.name || 'Actif';
          
          totalPoints += points;
          if (status === 'Disponible') {
            availablePoints += points;
          }
          
          history.push({
            date: properties['Date Obtention']?.date?.start || page.created_time,
            points: points,
            reason: properties['Raison']?.rich_text?.[0]?.text?.content || 'Récompense gagnée',
            status: status
          });
        } else if (rewardType === 'Badge') {
          badges.push({
            name: properties['Nom Badge']?.rich_text?.[0]?.text?.content || 'Badge',
            icon: properties['Icône']?.rich_text?.[0]?.text?.content || '🏆',
            date: properties['Date Obtention']?.date?.start || page.created_time,
            description: properties['Description']?.rich_text?.[0]?.text?.content || ''
          });
        }
      });
      
      // Calculer le niveau et le rang (simplifié pour l'instant)
      let level = 'Débutant';
      if (totalPoints >= 5000) level = 'Expert';
      else if (totalPoints >= 2000) level = 'Avancé';
      else if (totalPoints >= 500) level = 'Intermédiaire';
      
      const rewards = {
        totalPoints,
        availablePoints,
        level,
        rank: Math.floor(Math.random() * 50) + 1, // TODO: Calculer le vrai rang
        badges: badges.slice(0, 10), // Limiter à 10 badges
        history: history.slice(0, 20) // Limiter à 20 entrées d'historique
      };
      
      cacheManager.set(cacheKey, rewards);
      return rewards;
    } catch (error) {
      console.error('Erreur récupération rewards MCP:', error);
      return handleError(error, 'récupération des rewards');
    }
  }
};

// Fonctions pour l'espace REVENDEUR
const revendeurFunctions = {
  // Récupérer le pipeline de ventes
  getSalesPipeline: async (revendeurId) => {
    const cacheKey = `pipeline_${revendeurId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour le pipeline
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.PIPELINE,
        filter: {
          property: 'Revendeur',
          relation: {
            contains: revendeurId
          }
        },
        sorts: [{
          property: 'Valeur Deal',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour le pipeline');
        return { leads: [], stages: {} };
      }
      
      // Transformer les données Notion en format utilisable
      const leads = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          company: properties['Entreprise']?.rich_text?.[0]?.text?.content || 'Entreprise inconnue',
          contact: properties['Contact']?.rich_text?.[0]?.text?.content || 'Contact inconnu',
          value: properties['Valeur Deal']?.number || 0,
          stage: properties['Étape Pipeline']?.select?.name || 'Nouveau',
          probability: properties['Probabilité %']?.number || 0,
          nextAction: properties['Prochaine Action']?.rich_text?.[0]?.text?.content || 'À définir',
          lastContact: properties['Dernier Contact']?.date?.start || null,
          expectedCloseDate: properties['Clôture Prévue']?.date?.start || null,
          source: properties['Source Lead']?.select?.name || 'Non définie',
          priority: properties['Priorité']?.select?.name || 'Moyenne',
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time
        };
      });
      
      // Calculer les statistiques par étape
      const stages = {};
      const stageNames = ['Nouveau', 'Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
      
      stageNames.forEach(stageName => {
        const stageLeads = leads.filter(lead => lead.stage === stageName);
        stages[stageName] = {
          count: stageLeads.length,
          value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
        };
      });
      
      const result = {
        leads,
        stages
      };
      
      cacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur récupération pipeline MCP:', error);
      return handleError(error, 'récupération du pipeline');
    }
  },
  
  // Récupérer les ventes
  getRevendeurSales: async (revendeurId) => {
    const cacheKey = `sales_${revendeurId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les ventes
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.VENTES,
        filter: {
          property: 'Revendeur',
          relation: {
            contains: revendeurId
          }
        },
        sorts: [{
          property: 'Date de vente',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les ventes');
        return [];
      }
      
      // Transformer les données Notion en format utilisable
      const sales = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          client: properties['Client']?.relation?.[0]?.id || null,
          clientName: properties['Nom Client']?.rich_text?.[0]?.text?.content || 'Client inconnu',
          product: properties['Produit']?.select?.name || 'Produit non défini',
          amount: properties['Montant']?.number || 0,
          commission: properties['Commission']?.number || 0,
          date: properties['Date de vente']?.date?.start || null,
          status: properties['Statut']?.select?.name || 'Non défini',
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time
        };
      });
      
      cacheManager.set(cacheKey, sales);
      return sales;
    } catch (error) {
      console.error('Erreur récupération ventes MCP:', error);
      return handleError(error, 'récupération des ventes');
    }
  },
  
  // Récupérer les commissions
  getRevendeurCommissions: async (revendeurId) => {
    const cacheKey = `commissions_${revendeurId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les commissions
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.COMMISSIONS,
        filter: {
          property: 'Revendeur',
          relation: {
            contains: revendeurId
          }
        },
        sorts: [{
          property: 'Période',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les commissions');
        return { total: 0, paid: 0, pending: 0, thisMonth: 0, lastMonth: 0, details: [] };
      }
      
      // Transformer les données Notion en format utilisable
      const commissions = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          period: properties['Période']?.rich_text?.[0]?.text?.content || 'Non défini',
          sales: properties['Nombre de Ventes']?.number || 0,
          revenue: properties['CA Généré']?.number || 0,
          commission: properties['Montant Commission']?.number || 0,
          status: properties['Statut Paiement']?.select?.name || 'Non défini',
          paymentDate: properties['Date Paiement']?.date?.start || null,
          createdTime: page.created_time
        };
      });
      
      // Calculer les totaux
      const total = commissions.reduce((sum, c) => sum + (c.commission || 0), 0);
      const paid = commissions
        .filter(c => c.status === 'Payée')
        .reduce((sum, c) => sum + (c.commission || 0), 0);
      const pending = commissions
        .filter(c => c.status === 'En attente')
        .reduce((sum, c) => sum + (c.commission || 0), 0);
      
      // Calculer ce mois et le mois dernier
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
      
      const thisMonth = commissions
        .filter(c => c.period === currentMonth)
        .reduce((sum, c) => sum + (c.commission || 0), 0);
      const lastMonthAmount = commissions
        .filter(c => c.period === lastMonth)
        .reduce((sum, c) => sum + (c.commission || 0), 0);
      
      const result = {
        total,
        paid,
        pending,
        thisMonth,
        lastMonth: lastMonthAmount,
        details: commissions.slice(0, 12) // 12 derniers mois
      };
      
      cacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur récupération commissions MCP:', error);
      return handleError(error, 'récupération des commissions');
    }
  },
  
  // Gérer les zones géographiques
  getGeographicZones: async (revendeurId) => {
    const cacheKey = `zones_${revendeurId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les zones géographiques
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.ZONES_GEO,
        filter: {
          property: 'Revendeur Assigné',
          relation: {
            contains: revendeurId
          }
        },
        sorts: [{
          property: 'CA Réalisé',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les zones géographiques');
        return [];
      }
      
      // Transformer les données Notion en format utilisable
      const zones = response.results.map(page => {
        const properties = page.properties || {};
        
        // Extraire les villes de la propriété multi-select ou rich_text
        let cities = [];
        if (properties['Villes']?.multi_select) {
          cities = properties['Villes'].multi_select.map(city => city.name);
        } else if (properties['Villes']?.rich_text?.[0]) {
          cities = properties['Villes'].rich_text[0].text.content.split(',').map(s => s.trim());
        }
        
        return {
          id: page.id,
          name: properties['Nom Zone']?.title?.[0]?.text?.content || 'Zone inconnue',
          cities: cities,
          clients: properties['Nombre de Clients']?.number || 0,
          revenue: properties['CA Réalisé']?.number || 0,
          potential: properties['Potentiel Marché']?.number || 0,
          region: properties['Région']?.select?.name || 'Non définie',
          lastUpdate: properties['Dernière MAJ']?.date?.start || page.last_edited_time,
          createdTime: page.created_time
        };
      });
      
      cacheManager.set(cacheKey, zones);
      return zones;
    } catch (error) {
      console.error('Erreur récupération zones géographiques MCP:', error);
      return handleError(error, 'récupération des zones géographiques');
    }
  }
};

// Fonctions transversales
const commonFunctions = {
  // Gérer les communications
  sendMessage: async (messageData) => {
    try {
      // Créer un nouveau message dans Notion via MCP
      const response = await window.mcp_notion?.pages.create({
        parent: { database_id: NOTION_DBS.COMMUNICATIONS },
        properties: {
          'Expéditeur': {
            rich_text: [{
              text: {
                content: messageData.sender || 'Utilisateur anonyme'
              }
            }]
          },
          'Contenu': {
            rich_text: [{
              text: {
                content: messageData.content || ''
              }
            }]
          },
          'Type': {
            select: {
              name: messageData.type || 'info'
            }
          },
          'Contexte ID': {
            rich_text: [{
              text: {
                content: messageData.contextId || ''
              }
            }]
          },
          'Contexte Type': {
            select: {
              name: messageData.contextType || 'general'
            }
          },
          'Date Envoi': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      });
      
      if (response && response.id) {
        return {
          success: true,
          id: response.id,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Impossible de créer le message dans Notion');
      }
    } catch (error) {
      console.error('Erreur envoi message MCP:', error);
      return handleError(error, 'envoi du message');
    }
  },
  
  // Récupérer l'historique des communications
  getMessageHistory: async (contextId, contextType) => {
    const cacheKey = `messages_${contextType}_${contextId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Vraie requête Notion MCP pour les messages
      const response = await window.mcp_notion?.databases.query({
        database_id: NOTION_DBS.COMMUNICATIONS,
        filter: {
          and: [
            {
              property: 'Contexte ID',
              rich_text: {
                equals: contextId
              }
            },
            {
              property: 'Contexte Type',
              select: {
                equals: contextType
              }
            }
          ]
        },
        sorts: [{
          property: 'Date Envoi',
          direction: 'descending'
        }]
      });
      
      if (!response || !response.results) {
        console.warn('Pas de réponse de l\'API Notion pour les messages');
        return [];
      }
      
      // Transformer les données Notion
      const messages = response.results.map(page => {
        const properties = page.properties || {};
        
        return {
          id: page.id,
          sender: properties['Expéditeur']?.rich_text?.[0]?.text?.content || 'Utilisateur anonyme',
          content: properties['Contenu']?.rich_text?.[0]?.text?.content || '',
          timestamp: properties['Date Envoi']?.date?.start || page.created_time,
          type: properties['Type']?.select?.name || 'info',
          contextId: contextId,
          contextType: contextType
        };
      });
      
      cacheManager.set(cacheKey, messages);
      return messages;
    } catch (error) {
      console.error('Erreur récupération messages MCP:', error);
      return handleError(error, 'récupération des messages');
    }
  },
  
  // Tracker le temps
  trackTime: async (activityData) => {
    try {
      // Créer une nouvelle entrée de tracking dans Notion via MCP
      const response = await window.mcp_notion?.pages.create({
        parent: { database_id: NOTION_DBS.TIME_TRACKING },
        properties: {
          'Utilisateur': {
            relation: [{
              id: activityData.userId || ''
            }]
          },
          'Activité': {
            rich_text: [{
              text: {
                content: activityData.activity || 'Activité non spécifiée'
              }
            }]
          },
          'Durée (minutes)': {
            number: activityData.duration || 0
          },
          'Date Début': {
            date: {
              start: activityData.startTime || new Date().toISOString()
            }
          },
          'Date Fin': {
            date: {
              start: activityData.endTime || new Date().toISOString()
            }
          },
          'Projet/Mission': {
            relation: activityData.projectId ? [{ id: activityData.projectId }] : []
          },
          'Description': {
            rich_text: [{
              text: {
                content: activityData.description || ''
              }
            }]
          }
        }
      });
      
      if (response && response.id) {
        return {
          success: true,
          id: response.id
        };
      } else {
        throw new Error('Impossible de créer l\'entrée de tracking dans Notion');
      }
    } catch (error) {
      console.error('Erreur tracking temps MCP:', error);
      return handleError(error, 'tracking du temps');
    }
  }
};

// Fonctions utilitaires
const utilityFunctions = {
  // Formater la date au format suisse
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CH', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  },
  
  // Formater le montant en CHF
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return 'CHF 0.00';
    return `CHF ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
  },
  
  // Calculer le pourcentage
  calculatePercentage: (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }
};

// Export du module
const NotionConnector = {
  // Configuration
  DATABASES: NOTION_DBS,
  
  // Gestion du cache
  cache: cacheManager,
  
  // Authentification
  auth: authFunctions,
  
  // Fonctions par espace
  client: clientFunctions,
  prestataire: prestataireFunctions,
  revendeur: revendeurFunctions,
  
  // Fonctions communes
  common: commonFunctions,
  
  // Utilitaires
  utils: utilityFunctions,
  
  // Initialisation
  init: async () => {
    console.log('NotionConnector initialisé');
    // TODO: Vérifier la connexion aux bases de données
    // TODO: Initialiser les listeners d'événements
    return true;
  }
};

// Rendre disponible globalement
window.NotionConnector = NotionConnector;

// Auto-initialisation si le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', NotionConnector.init);
} else {
  NotionConnector.init();
}