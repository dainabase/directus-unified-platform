import { COMPANY_MAPPING } from './company-mapping'

/**
 * Construit un filtre Directus pour owner_company
 * @param {string} value - La valeur de l'entreprise (peut être en minuscules, avec espaces, etc.)
 * @returns {object} - Le filtre Directus formaté ou un objet vide
 */
export const buildOwnerCompanyFilter = (value) => {
  if (!value || value === 'all') return {}
  
  const normalized = COMPANY_MAPPING.normalize(value)
  if (!normalized) return {}
  
  return {
    filter: {
      owner_company: { _eq: normalized }
    }
  }
}

/**
 * Extrait la valeur owner_company d'un objet de filtres
 * @param {object} filters - L'objet de filtres
 * @returns {string|null} - La valeur normalisée ou null
 */
export const extractOwnerCompany = (filters) => {
  if (!filters) return null
  
  // Format direct
  if (typeof filters.owner_company === 'string') {
    return COMPANY_MAPPING.normalize(filters.owner_company)
  }
  
  // Format avec _eq
  if (filters.owner_company?._eq) {
    return COMPANY_MAPPING.normalize(filters.owner_company._eq)
  }
  
  return null
}

/**
 * Ajoute le filtre owner_company aux paramètres existants
 * @param {object} params - Les paramètres existants
 * @param {object} filters - Les filtres à appliquer
 * @returns {object} - Les paramètres mis à jour
 */
export const addOwnerCompanyToParams = (params = {}, filters = {}) => {
  const ownerCompany = extractOwnerCompany(filters)
  
  if (ownerCompany) {
    return {
      ...params,
      filter: {
        ...params.filter,
        owner_company: { _eq: ownerCompany }
      }
    }
  }
  
  return params
}