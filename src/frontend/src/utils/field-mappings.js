// Mapping centralisé des champs pour éviter les erreurs
export const FIELD_MAPPINGS = {
  COMPANY_FIELD: 'owner_company', // PAS 'company'
  
  // Nos 5 entreprises (exactement comme dans la base)
  COMPANIES: {
    HYPERVISUAL: 'HYPERVISUAL',
    DAINAMICS: 'DAINAMICS',
    LEXAIA: 'LEXAIA',
    ENKI_REALTY: 'ENKI_REALTY', // ATTENTION: underscore dans la base
    TAKEOUT: 'TAKEOUT'
  },
  
  // Helper pour normaliser le nom d'entreprise
  normalizeCompany: (company) => {
    if (company === 'ENKI REALTY') return 'ENKI_REALTY'
    return company
  }
}