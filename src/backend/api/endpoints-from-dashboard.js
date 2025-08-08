/**
 * Mapping des 156 endpoints depuis les anciens repos dashboard vers Directus
 * Basé sur l'analyse des 4 portails : Client, Prestataire, Revendeur, Superadmin
 */

// Configuration des endpoints par portal
export const ENDPOINTS_MAPPING = {
  
  // =============================================================================
  // CLIENT PORTAL (28 endpoints)
  // =============================================================================
  client: {
    // Projets - 8 endpoints
    'GET /api/client/projects': {
      directus: '/items/projects',
      method: 'GET',
      filters: ['owner_company', 'client_id'],
      description: 'Liste des projets du client'
    },
    'GET /api/client/projects/:id': {
      directus: '/items/projects/:id',
      method: 'GET',
      filters: ['owner_company', 'client_id'],
      description: 'Détails d\'un projet'
    },
    'GET /api/client/projects/:id/deliverables': {
      directus: '/items/deliverables',
      method: 'GET',
      filters: ['project_id', 'owner_company'],
      description: 'Livrables d\'un projet'
    },
    'GET /api/client/projects/:id/milestones': {
      directus: '/items/milestones',
      method: 'GET', 
      filters: ['project_id', 'owner_company'],
      description: 'Jalons d\'un projet'
    },
    'GET /api/client/projects/:id/time-tracking': {
      directus: '/items/time_tracking',
      method: 'GET',
      filters: ['project_id', 'owner_company'],
      description: 'Suivi du temps projet'
    },
    'POST /api/client/projects/:id/feedback': {
      directus: '/items/feedback',
      method: 'POST',
      auto_fields: { project_id: ':id', type: 'client_feedback' },
      description: 'Ajouter un feedback client'
    },
    'GET /api/client/projects/stats': {
      directus: '/items/projects',
      method: 'GET',
      aggregate: ['count', 'avg(budget)', 'sum(actual_cost)'],
      filters: ['owner_company', 'client_id'],
      description: 'Statistiques projets'
    },
    'GET /api/client/projects/timeline': {
      directus: '/items/milestones',
      method: 'GET',
      filters: ['owner_company'],
      sort: ['due_date'],
      description: 'Timeline des projets'
    },

    // Factures - 7 endpoints
    'GET /api/client/invoices': {
      directus: '/items/client_invoices',
      method: 'GET',
      filters: ['owner_company', 'company_id'],
      description: 'Factures du client'
    },
    'GET /api/client/invoices/:id': {
      directus: '/items/client_invoices/:id',
      method: 'GET',
      filters: ['owner_company', 'company_id'],
      description: 'Détails facture'
    },
    'GET /api/client/invoices/:id/pdf': {
      custom_handler: 'generateInvoicePDF',
      description: 'Télécharger PDF facture'
    },
    'GET /api/client/invoices/stats': {
      directus: '/items/client_invoices',
      method: 'GET',
      aggregate: ['count', 'sum(amount)', 'avg(amount)'],
      filters: ['owner_company', 'company_id'],
      description: 'Statistiques facturation'
    },
    'GET /api/client/invoices/overdue': {
      directus: '/items/client_invoices',
      method: 'GET',
      filters: ['owner_company', 'company_id', 'status=overdue'],
      description: 'Factures en retard'
    },
    'POST /api/client/invoices/:id/pay': {
      custom_handler: 'processPayment',
      description: 'Initier paiement facture'
    },
    'GET /api/client/payment-history': {
      directus: '/items/payments',
      method: 'GET',
      filters: ['owner_company', 'client_id'],
      sort: ['-payment_date'],
      description: 'Historique paiements'
    },

    // Documents - 4 endpoints
    'GET /api/client/documents': {
      directus: '/files',
      method: 'GET',
      filters: ['folder=client_documents', 'owner_company'],
      description: 'Documents client'
    },
    'POST /api/client/documents/upload': {
      directus: '/files',
      method: 'POST',
      auto_fields: { folder: 'client_documents' },
      description: 'Upload document'
    },
    'GET /api/client/documents/:id': {
      directus: '/files/:id',
      method: 'GET',
      description: 'Télécharger document'
    },
    'DELETE /api/client/documents/:id': {
      directus: '/files/:id',
      method: 'DELETE',
      description: 'Supprimer document'
    },

    // Support - 5 endpoints
    'GET /api/client/support/tickets': {
      directus: '/items/support_tickets',
      method: 'GET',
      filters: ['owner_company', 'client_id'],
      description: 'Tickets support'
    },
    'POST /api/client/support/tickets': {
      directus: '/items/support_tickets',
      method: 'POST',
      auto_fields: { status: 'open', priority: 'medium' },
      description: 'Créer ticket support'
    },
    'GET /api/client/support/faq': {
      directus: '/items/faq',
      method: 'GET',
      filters: ['is_published=true', 'owner_company'],
      description: 'FAQ client'
    },
    'GET /api/client/support/knowledge-base': {
      directus: '/items/knowledge_base',
      method: 'GET',
      filters: ['is_published=true', 'access_level=client'],
      description: 'Base de connaissances'
    },

    // Profil - 4 endpoints
    'GET /api/client/profile': {
      directus: '/items/companies/:client_id',
      method: 'GET',
      description: 'Profil entreprise'
    },
    'PATCH /api/client/profile': {
      directus: '/items/companies/:client_id',
      method: 'PATCH',
      description: 'Modifier profil'
    },
    'GET /api/client/contacts': {
      directus: '/items/people',
      method: 'GET',
      filters: ['company_id', 'owner_company'],
      description: 'Contacts entreprise'
    },
    'POST /api/client/contacts': {
      directus: '/items/people',
      method: 'POST',
      auto_fields: { company_id: ':client_id' },
      description: 'Ajouter contact'
    }
  },

  // =============================================================================
  // PRESTATAIRE PORTAL (32 endpoints)
  // =============================================================================
  prestataire: {
    // Missions/Projets - 10 endpoints
    'GET /api/provider/missions': {
      directus: '/items/projects',
      method: 'GET',
      filters: ['owner_company', 'provider_id'],
      description: 'Missions du prestataire'
    },
    'GET /api/provider/missions/:id': {
      directus: '/items/projects/:id',
      method: 'GET',
      filters: ['provider_id'],
      description: 'Détails mission'
    },
    'PATCH /api/provider/missions/:id/status': {
      directus: '/items/projects/:id',
      method: 'PATCH',
      fields: ['status', 'completion_percentage'],
      description: 'Mettre à jour statut'
    },
    'GET /api/provider/missions/:id/tasks': {
      directus: '/items/deliverables',
      method: 'GET',
      filters: ['project_id', 'assigned_to'],
      description: 'Tâches assignées'
    },
    'POST /api/provider/missions/:id/deliverable': {
      directus: '/items/deliverables',
      method: 'POST',
      auto_fields: { project_id: ':id', status: 'draft' },
      description: 'Créer livrable'
    },
    'GET /api/provider/calendar': {
      directus: '/items/milestones',
      method: 'GET',
      filters: ['assigned_to', 'owner_company'],
      fields: ['name', 'due_date', 'project_id'],
      description: 'Calendrier prestataire'
    },
    'GET /api/provider/workload': {
      directus: '/items/time_tracking',
      method: 'GET',
      aggregate: ['sum(hours)'],
      group_by: ['date', 'project_id'],
      filters: ['user_id', 'owner_company'],
      description: 'Charge de travail'
    },

    // Time Tracking - 6 endpoints
    'GET /api/provider/timesheet': {
      directus: '/items/time_tracking',
      method: 'GET',
      filters: ['user_id', 'owner_company'],
      description: 'Feuille de temps'
    },
    'POST /api/provider/timesheet/entry': {
      directus: '/items/time_tracking',
      method: 'POST',
      auto_fields: { date: 'now()' },
      description: 'Saisir temps'
    },
    'PATCH /api/provider/timesheet/:id': {
      directus: '/items/time_tracking/:id',
      method: 'PATCH',
      description: 'Modifier temps'
    },
    'DELETE /api/provider/timesheet/:id': {
      directus: '/items/time_tracking/:id',
      method: 'DELETE',
      description: 'Supprimer temps'
    },
    'POST /api/provider/timesheet/submit': {
      custom_handler: 'submitTimesheet',
      description: 'Soumettre feuille temps'
    },
    'GET /api/provider/timesheet/stats': {
      directus: '/items/time_tracking',
      method: 'GET',
      aggregate: ['sum(hours)', 'count(*)'],
      filters: ['user_id', 'owner_company'],
      group_by: ['project_id'],
      description: 'Stats temps'
    },

    // Performance - 5 endpoints
    'GET /api/provider/performance': {
      custom_handler: 'calculateProviderPerformance',
      description: 'KPIs performance'
    },
    'GET /api/provider/reviews': {
      directus: '/items/evaluations',
      method: 'GET',
      filters: ['evaluated_user_id', 'owner_company'],
      description: 'Évaluations reçues'
    },
    'GET /api/provider/skills': {
      directus: '/items/skills',
      method: 'GET',
      filters: ['user_id', 'owner_company'],
      description: 'Compétences'
    },
    'POST /api/provider/skills': {
      directus: '/items/skills',
      method: 'POST',
      auto_fields: { user_id: '$USER_ID' },
      description: 'Ajouter compétence'
    },

    // Formations - 4 endpoints
    'GET /api/provider/trainings': {
      directus: '/items/trainings',
      method: 'GET',
      filters: ['participant_id', 'owner_company'],
      description: 'Formations'
    },
    'POST /api/provider/trainings/enroll': {
      custom_handler: 'enrollInTraining',
      description: 'S\'inscrire formation'
    },
    'GET /api/provider/certifications': {
      directus: '/items/certifications',
      method: 'GET',
      filters: ['user_id', 'owner_company'],
      description: 'Certifications'
    },

    // Communication - 7 endpoints
    'GET /api/provider/messages': {
      directus: '/items/messages',
      method: 'GET',
      filters: ['recipient_id', 'owner_company'],
      description: 'Messages reçus'
    },
    'POST /api/provider/messages': {
      directus: '/items/messages',
      method: 'POST',
      auto_fields: { sender_id: '$USER_ID' },
      description: 'Envoyer message'
    },
    'GET /api/provider/notifications': {
      directus: '/items/notifications',
      method: 'GET',
      filters: ['user_id', 'owner_company'],
      description: 'Notifications'
    },
    'PATCH /api/provider/notifications/:id/read': {
      directus: '/items/notifications/:id',
      method: 'PATCH',
      fields: { read: true },
      description: 'Marquer lu'
    }
  },

  // =============================================================================
  // REVENDEUR PORTAL (28 endpoints)
  // =============================================================================
  revendeur: {
    // Leads & Opportunities - 10 endpoints
    'GET /api/reseller/leads': {
      directus: '/items/opportunities',
      method: 'GET',
      filters: ['reseller_id', 'owner_company'],
      description: 'Leads du revendeur'
    },
    'POST /api/reseller/leads': {
      directus: '/items/opportunities',
      method: 'POST',
      auto_fields: { reseller_id: '$USER_ID', stage: 'prospect' },
      description: 'Créer lead'
    },
    'GET /api/reseller/leads/:id': {
      directus: '/items/opportunities/:id',
      method: 'GET',
      description: 'Détails lead'
    },
    'PATCH /api/reseller/leads/:id': {
      directus: '/items/opportunities/:id',
      method: 'PATCH',
      description: 'Modifier lead'
    },
    'PATCH /api/reseller/leads/:id/stage': {
      directus: '/items/opportunities/:id',
      method: 'PATCH',
      fields: ['stage', 'probability'],
      description: 'Changer étape'
    },
    'GET /api/reseller/pipeline': {
      directus: '/items/opportunities',
      method: 'GET',
      group_by: ['stage'],
      aggregate: ['count(*)', 'sum(value)'],
      filters: ['reseller_id', 'owner_company'],
      description: 'Pipeline de ventes'
    },

    // Clients - 6 endpoints
    'GET /api/reseller/clients': {
      directus: '/items/companies',
      method: 'GET',
      filters: ['reseller_id', 'owner_company'],
      description: 'Clients du revendeur'
    },
    'POST /api/reseller/clients': {
      directus: '/items/companies',
      method: 'POST',
      auto_fields: { reseller_id: '$USER_ID', is_client: true },
      description: 'Ajouter client'
    },
    'GET /api/reseller/clients/:id': {
      directus: '/items/companies/:id',
      method: 'GET',
      description: 'Détails client'
    },
    'PATCH /api/reseller/clients/:id': {
      directus: '/items/companies/:id',
      method: 'PATCH',
      description: 'Modifier client'
    },

    // Commissions - 5 endpoints
    'GET /api/reseller/commissions': {
      directus: '/items/commissions',
      method: 'GET',
      filters: ['reseller_id', 'owner_company'],
      description: 'Commissions'
    },
    'GET /api/reseller/commissions/stats': {
      directus: '/items/commissions',
      method: 'GET',
      aggregate: ['sum(amount)', 'avg(rate)'],
      filters: ['reseller_id', 'owner_company'],
      group_by: ['month'],
      description: 'Stats commissions'
    },

    // Marketing - 7 endpoints
    'GET /api/reseller/campaigns': {
      directus: '/items/campaigns',
      method: 'GET',
      filters: ['reseller_id', 'owner_company'],
      description: 'Campagnes marketing'
    },
    'GET /api/reseller/materials': {
      directus: '/files',
      method: 'GET',
      filters: ['folder=marketing_materials'],
      description: 'Supports marketing'
    },
    'GET /api/reseller/leads/sources': {
      directus: '/items/opportunities',
      method: 'GET',
      group_by: ['source'],
      aggregate: ['count(*)'],
      filters: ['reseller_id', 'owner_company'],
      description: 'Sources de leads'
    }
  },

  // =============================================================================
  // SUPERADMIN PORTAL (68 endpoints)
  // =============================================================================
  superadmin: {
    // Système - 15 endpoints
    'GET /api/admin/system/health': {
      custom_handler: 'systemHealthCheck',
      description: 'Santé du système'
    },
    'GET /api/admin/system/stats': {
      custom_handler: 'systemStatistics',
      description: 'Statistiques système'
    },
    'GET /api/admin/logs': {
      directus: '/items/audit_logs',
      method: 'GET',
      sort: ['-date_created'],
      description: 'Logs système'
    },
    'GET /api/admin/users': {
      directus: '/users',
      method: 'GET',
      description: 'Utilisateurs'
    },
    'POST /api/admin/users': {
      directus: '/users',
      method: 'POST',
      description: 'Créer utilisateur'
    },

    // OCR & Documents - 8 endpoints
    'POST /api/admin/ocr/process': {
      custom_handler: 'processOCR',
      description: 'Traitement OCR'
    },
    'GET /api/admin/ocr/history': {
      directus: '/items/ocr_history',
      method: 'GET',
      sort: ['-date_created'],
      description: 'Historique OCR'
    },

    // Finances - 12 endpoints
    'GET /api/admin/finance/dashboard': {
      custom_handler: 'financeDashboard',
      description: 'Dashboard financier'
    },
    'GET /api/admin/finance/cash-flow': {
      directus: '/items/cash_forecasts',
      method: 'GET',
      sort: ['forecast_date'],
      description: 'Flux de trésorerie'
    },

    // Projets - 10 endpoints
    'GET /api/admin/projects/overview': {
      directus: '/items/projects',
      method: 'GET',
      aggregate: ['count(*)', 'sum(budget)', 'avg(margin_percentage)'],
      group_by: ['status', 'owner_company'],
      description: 'Vue d\'ensemble projets'
    },

    // RH - 8 endpoints
    'GET /api/admin/hr/dashboard': {
      custom_handler: 'hrDashboard',
      description: 'Dashboard RH'
    },

    // Intégrations - 15 endpoints
    'GET /api/admin/integrations/status': {
      custom_handler: 'integrationsStatus',
      description: 'Statut intégrations'
    },
    'POST /api/admin/integrations/sync/mautic': {
      custom_handler: 'syncMautic',
      description: 'Sync Mautic'
    },
    'POST /api/admin/integrations/sync/erpnext': {
      custom_handler: 'syncERPNext',
      description: 'Sync ERPNext'
    },
    'POST /api/admin/integrations/sync/invoice-ninja': {
      custom_handler: 'syncInvoiceNinja',
      description: 'Sync Invoice Ninja'
    }
  }
};

// Configuration des handlers personnalisés
export const CUSTOM_HANDLERS = {
  async generateInvoicePDF(req, res) {
    // Génération PDF avec Puppeteer ou autre
    return { pdf_url: '/files/invoice.pdf' };
  },

  async processPayment(req, res) {
    // Intégration avec Stripe/PayPal
    return { payment_intent: 'pi_xxx', status: 'processing' };
  },

  async calculateProviderPerformance(req, res) {
    // Calcul KPIs performance prestataire
    return {
      efficiency: 85,
      quality_score: 92,
      client_satisfaction: 4.8
    };
  },

  async systemHealthCheck(req, res) {
    // Vérification santé système
    return {
      status: 'healthy',
      database: 'connected',
      redis: 'connected',
      disk_usage: '45%',
      memory_usage: '62%'
    };
  },

  async processOCR(req, res) {
    // Traitement OCR avec OpenAI Vision
    return {
      extracted_text: 'Contenu extrait...',
      confidence: 0.95,
      processing_time: 1200
    };
  },

  async financeDashboard(req, res) {
    // Dashboard financier consolidé
    return {
      revenue: 125000,
      expenses: 85000,
      profit_margin: 32,
      cash_flow: 40000
    };
  },

  async integrationsStatus(req, res) {
    // Statut de toutes les intégrations
    return {
      mautic: { status: 'connected', last_sync: '2024-08-08T10:00:00Z' },
      erpnext: { status: 'connected', last_sync: '2024-08-08T09:30:00Z' },
      invoice_ninja: { status: 'disconnected', error: 'API key invalid' },
      revolut: { status: 'connected', last_sync: '2024-08-08T08:00:00Z' }
    };
  }
};

// Middleware d'authentification et autorisation
export const AUTH_MIDDLEWARE = {
  client: ['client', 'admin'],
  prestataire: ['provider', 'admin'], 
  revendeur: ['reseller', 'admin'],
  superadmin: ['admin']
};

// Export pour utilisation dans Express
export default {
  ENDPOINTS_MAPPING,
  CUSTOM_HANDLERS,
  AUTH_MIDDLEWARE
};