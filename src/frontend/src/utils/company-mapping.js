export const COMPANY_MAPPING = {
  // Mapping exact avec Directus
  HYPERVISUAL: 'HYPERVISUAL',
  DAINAMICS: 'DAINAMICS',
  LEXAIA: 'LEXAIA',
  ENKI_REALTY: 'ENKI_REALTY',  // Underscore obligatoire
  TAKEOUT: 'TAKEOUT',
  
  // Helper pour normaliser
  normalize: (company) => {
    if (!company || company === 'all') return null
    
    // Convertir en majuscules
    const upper = company.toUpperCase()
    
    // Cas spécial ENKI
    if (upper === 'ENKI' || upper === 'ENKI REALTY') {
      return 'ENKI_REALTY'
    }
    
    return upper
  },
  
  // Liste des entreprises pour affichage
  getAll: () => [
    { value: 'HYPERVISUAL', label: 'HYPERVISUAL' },
    { value: 'DAINAMICS', label: 'DAINAMICS' },
    { value: 'LEXAIA', label: 'LEXAIA' },
    { value: 'ENKI_REALTY', label: 'ENKI REALTY' },
    { value: 'TAKEOUT', label: 'TAKEOUT' }
  ]
}