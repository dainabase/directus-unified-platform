/**
 * Configuration de l'adaptateur Directus
 * Généré automatiquement le 2025-08-03T20:33:48.118Z
 */

// Mapping des collections Notion vers Directus
const COLLECTION_MAPPING = {
  'DB-PROJETS': 'projects',
  'DB-CLIENTS': 'companies',
  'DB-CONTACTS': 'people',
  'DB-TACHES': 'deliverables',
  'DB-FACTURES-CLIENTS': 'client_invoices',
  'DB-FACTURES-FOURNISSEURS': 'supplier_invoices',
  'DB-BANQUE': 'bank_transactions',
  'DB-BUDGET': 'budgets',
  'DB-DEPENSES': 'expenses',
  'DB-ABONNEMENTS': 'subscriptions',
  'DB-TALENTS': 'talents',
  'DB-INTERACTIONS': 'interactions',
  'DB-SUPPORT': 'support_tickets'
};

// Export pour utilisation dans les services
module.exports = {
  COLLECTION_MAPPING,
  
  // Fonction utilitaire pour mapper les collections
  mapCollection(notionDb) {
    return COLLECTION_MAPPING[notionDb] || notionDb.toLowerCase().replace('db-', '');
  }
};