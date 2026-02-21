/**
 * Helper global pour gérer le filtrage par entreprise
 * Centralise toute la logique de filtrage multi-entreprises
 */

// Les 5 entreprises du groupe
export const OWNER_COMPANIES = {
  HYPERVISUAL: {
    code: 'HYPERVISUAL',
    name: 'HYPERVISUAL',
    color: '#2196F3',
    type: 'main',
    description: 'Entreprise principale - Solutions de visualisation et développement'
  },
  DAINAMICS: {
    code: 'DAINAMICS',
    name: 'DAINAMICS',
    color: '#4CAF50',
    type: 'subsidiary',
    description: 'Filiale spécialisée en data analytics et intelligence artificielle'
  },
  LEXAIA: {
    code: 'LEXAIA',
    name: 'LEXAIA',
    color: '#FF9800',
    type: 'subsidiary',
    description: 'Solutions juridiques et conformité réglementaire'
  },
  ENKI_REALTY: {
    code: 'ENKI_REALTY',
    name: 'ENKI REALTY',
    color: '#9C27B0',
    type: 'subsidiary',
    description: 'Immobilier commercial et résidentiel'
  },
  TAKEOUT: {
    code: 'TAKEOUT',
    name: 'TAKEOUT',
    color: '#F44336',
    type: 'subsidiary',
    description: 'Services de restauration et livraison'
  }
};

// Liste des codes pour itération
export const COMPANY_CODES = Object.keys(OWNER_COMPANIES);

/**
 * Ajoute les paramètres de filtrage par owner_company à une requête Directus
 * @param {Object} params - Paramètres de requête existants
 * @param {Object} filters - Filtres appliqués { company: 'HYPERVISUAL' }
 * @returns {Object} Paramètres avec filtrage owner_company ajouté
 */
export function addOwnerCompanyFilter(params = {}, filters = {}) {
  // Si pas de filtre spécifique ou "all", retourner les params inchangés
  if (!filters.company || filters.company === 'all') {
    return params;
  }

  // Normaliser le nom de l'entreprise
  const normalizedCompany = normalizeCompanyName(filters.company);
  
  return {
    ...params,
    filter: {
      ...params.filter,
      owner_company: {
        _eq: normalizedCompany
      }
    }
  };
}

/**
 * Normalise le nom d'entreprise (gestion des variantes)
 * @param {string} companyName - Nom brut de l'entreprise
 * @returns {string} Nom normalisé
 */
export function normalizeCompanyName(companyName) {
  if (!companyName) return null;
  
  const normalized = companyName.toString().toUpperCase().trim();
  
  // Mapping pour les variantes
  const mappings = {
    'ENKI REALTY': 'ENKI_REALTY',
    'ENKI-REALTY': 'ENKI_REALTY',
    'ENKIREALTY': 'ENKI_REALTY'
  };
  
  return mappings[normalized] || normalized;
}

/**
 * Filtre les données localement par owner_company
 * @param {Array} data - Données à filtrer
 * @param {string} company - Code de l'entreprise
 * @returns {Array} Données filtrées
 */
export function filterByOwnerCompany(data, company) {
  if (!Array.isArray(data)) return [];
  if (!company || company === 'all') return data;
  
  const normalizedCompany = normalizeCompanyName(company);
  return data.filter(item => item.owner_company === normalizedCompany);
}

/**
 * Compte les éléments uniques par owner_company
 * @param {Array} data - Données à compter
 * @param {string} company - Code de l'entreprise
 * @returns {number} Nombre d'éléments
 */
export function countByOwnerCompany(data, company) {
  const filtered = filterByOwnerCompany(data, company);
  return filtered.length;
}

/**
 * Groupe les données par owner_company
 * @param {Array} data - Données à grouper
 * @returns {Object} Données groupées par entreprise
 */
export function groupByOwnerCompany(data) {
  if (!Array.isArray(data)) return {};
  
  return data.reduce((acc, item) => {
    const company = item.owner_company || 'UNKNOWN';
    if (!acc[company]) acc[company] = [];
    acc[company].push(item);
    return acc;
  }, {});
}

/**
 * Calcule des statistiques par entreprise
 * @param {Array} data - Données à analyser
 * @returns {Object} Statistiques par entreprise
 */
export function getStatsByOwnerCompany(data) {
  if (!Array.isArray(data)) return {};
  
  const grouped = groupByOwnerCompany(data);
  const stats = {};
  
  for (const [company, items] of Object.entries(grouped)) {
    const companyInfo = OWNER_COMPANIES[company];
    
    stats[company] = {
      code: company,
      name: companyInfo?.name || company,
      color: companyInfo?.color || '#666',
      count: items.length,
      percentage: ((items.length / data.length) * 100).toFixed(1),
      items: items
    };
  }
  
  return stats;
}

/**
 * Vérifie si une entreprise existe
 * @param {string} company - Code de l'entreprise
 * @returns {boolean} True si l'entreprise existe
 */
export function isValidCompany(company) {
  if (!company) return false;
  const normalized = normalizeCompanyName(company);
  return COMPANY_CODES.includes(normalized);
}

/**
 * Récupère les informations d'une entreprise
 * @param {string} company - Code de l'entreprise
 * @returns {Object|null} Informations de l'entreprise
 */
export function getCompanyInfo(company) {
  if (!company) return null;
  const normalized = normalizeCompanyName(company);
  return OWNER_COMPANIES[normalized] || null;
}

/**
 * Génère des options pour un select d'entreprises
 * @param {boolean} includeAll - Inclure l'option "Toutes"
 * @returns {Array} Options pour select
 */
export function getCompanyOptions(includeAll = true) {
  const options = [];
  
  if (includeAll) {
    options.push({
      value: 'all',
      label: 'Toutes les entreprises',
      color: '#666'
    });
  }
  
  COMPANY_CODES.forEach(code => {
    const company = OWNER_COMPANIES[code];
    options.push({
      value: code,
      label: company.name,
      color: company.color,
      type: company.type
    });
  });
  
  return options;
}

/**
 * Formate un nom d'entreprise pour l'affichage
 * @param {string} company - Code de l'entreprise
 * @returns {string} Nom formaté
 */
export function formatCompanyName(company) {
  if (!company || company === 'all') return 'Toutes les entreprises';
  
  const companyInfo = getCompanyInfo(company);
  return companyInfo?.name || company;
}

/**
 * Debug : log les informations de filtrage (no-op in production)
 * @param {string} context - Contexte du debug
 * @param {Object} filters - Filtres appliqués
 * @param {Array} data - Données résultantes
 */
export function debugCompanyFilter(context, filters, data) {
  // Debug logging removed for production
}