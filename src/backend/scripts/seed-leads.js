/**
 * Seed Script - Leads et Lead Sources
 * Génère 50+ leads réalistes pour le dashboard
 */

const API_URL = process.env.DIRECTUS_URL || 'http://localhost:8055'
const API_TOKEN = process.env.DIRECTUS_TOKEN || 'dashboard-api-token-2025'

// Les 5 entreprises du groupe
const OWNER_COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT']

// Sources de leads
const LEAD_SOURCES = [
  { code: 'WEBSITE', name: 'Site Web', type: 'inbound', icon: 'globe', color: '#3B82F6', is_active: true, sort_order: 1 },
  { code: 'LINKEDIN', name: 'LinkedIn', type: 'social', icon: 'linkedin', color: '#0A66C2', is_active: true, sort_order: 2 },
  { code: 'REFERRAL', name: 'Recommandation', type: 'organic', icon: 'users', color: '#10B981', is_active: true, sort_order: 3 },
  { code: 'COLD_CALL', name: 'Cold Call', type: 'outbound', icon: 'phone', color: '#F59E0B', is_active: true, sort_order: 4 },
  { code: 'EMAIL', name: 'Email Marketing', type: 'outbound', icon: 'mail', color: '#8B5CF6', is_active: true, sort_order: 5 },
  { code: 'TRADE_SHOW', name: 'Salon professionnel', type: 'event', icon: 'calendar', color: '#EC4899', is_active: true, sort_order: 6 },
  { code: 'GOOGLE_ADS', name: 'Google Ads', type: 'paid', icon: 'target', color: '#EF4444', is_active: true, sort_order: 7 },
  { code: 'PARTNER', name: 'Partenaire', type: 'partner', icon: 'briefcase', color: '#06B6D4', is_active: true, sort_order: 8 }
]

// Statuts possibles pour les leads
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

// Données suisses réalistes
const SWISS_FIRST_NAMES = [
  'Marc', 'Thomas', 'David', 'Nicolas', 'Michael', 'Daniel', 'Patrick', 'Christian', 'Martin', 'Stefan',
  'Sarah', 'Laura', 'Sandra', 'Nicole', 'Andrea', 'Claudia', 'Anna', 'Maria', 'Lisa', 'Julia',
  'Pierre', 'Jean', 'François', 'Philippe', 'Laurent', 'Olivier', 'Sébastien', 'Christophe', 'Yann', 'Maxime'
]

const SWISS_LAST_NAMES = [
  'Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer',
  'Gerber', 'Brunner', 'Baumann', 'Frei', 'Zimmermann', 'Moser', 'Graf', 'Widmer', 'Roth', 'Beck',
  'Dubois', 'Favre', 'Martin', 'Blanc', 'Rochat', 'Perrin', 'Bonvin', 'Jaccard', 'Berset', 'Vuilloud'
]

const SWISS_COMPANIES = [
  'Swisscom AG', 'UBS AG', 'Credit Suisse', 'Nestlé SA', 'Novartis AG',
  'Roche Holding', 'ABB Ltd', 'Zurich Insurance', 'Swiss Re', 'Swatch Group',
  'Logitech', 'Sonova', 'Geberit', 'Schindler', 'Straumann',
  'SIG Combibloc', 'Givaudan', 'Clariant', 'Lonza', 'Sika AG',
  'Implenia', 'Bobst', 'Kudelski', 'Medacta', 'Vifor Pharma',
  'Meyer Burger', 'Bachem', 'Tecan', 'Basilea', 'Sensirion',
  'Inficon', 'VAT Group', 'Temenos', 'Dufry', 'Glencore',
  'Partners Group', 'Julius Bär', 'Vontobel', 'Helvetia', 'Baloise',
  'Banque Cantonale Vaudoise', 'Raiffeisen', 'PostFinance', 'Migros Bank', 'Coop'
]

const JOB_TITLES = [
  'CEO', 'CTO', 'CFO', 'COO', 'CMO',
  'Directeur Général', 'Directeur Technique', 'Directeur Financier',
  'Responsable IT', 'Chef de Projet', 'Responsable Marketing',
  'Responsable Commercial', 'Directeur des Ventes', 'Account Manager',
  'Consultant Senior', 'Architecte Solutions', 'Product Owner',
  'Responsable RH', 'Directeur Juridique', 'Compliance Officer'
]

const SWISS_CITIES = [
  { city: 'Zürich', postal: '8001' },
  { city: 'Genève', postal: '1201' },
  { city: 'Basel', postal: '4001' },
  { city: 'Lausanne', postal: '1003' },
  { city: 'Bern', postal: '3001' },
  { city: 'Winterthur', postal: '8400' },
  { city: 'Lucerne', postal: '6003' },
  { city: 'St. Gallen', postal: '9000' },
  { city: 'Lugano', postal: '6900' },
  { city: 'Fribourg', postal: '1700' },
  { city: 'Neuchâtel', postal: '2000' },
  { city: 'Sion', postal: '1950' }
]

const TAGS_BY_COMPANY = {
  HYPERVISUAL: ['web-dev', 'ui-ux', 'branding', 'digital', 'e-commerce'],
  DAINAMICS: ['ai', 'machine-learning', 'data-analytics', 'automation', 'iot'],
  LEXAIA: ['legal-tech', 'compliance', 'contract-management', 'gdpr', 'audit'],
  ENKI_REALTY: ['real-estate', 'property', 'investment', 'commercial', 'residential'],
  TAKEOUT: ['food-tech', 'delivery', 'restaurant', 'catering', 'franchise']
}

// Helpers
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomDate = (daysBack = 90) => {
  const date = new Date()
  date.setDate(date.getDate() - randomInt(0, daysBack))
  return date.toISOString()
}

// Générer un email professionnel
const generateEmail = (firstName, lastName, company) => {
  const domain = company.toLowerCase()
    .replace(/\s+ag$/i, '')
    .replace(/\s+sa$/i, '')
    .replace(/\s+ltd$/i, '')
    .replace(/\s+group$/i, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '') + '.ch'

  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
}

// Générer un numéro de téléphone suisse
const generatePhone = () => {
  const prefixes = ['079', '078', '076', '077', '044', '022', '021', '041', '031']
  return `${randomItem(prefixes)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`
}

// API Helper
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(`${API_URL}${endpoint}`, options)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${response.status} - ${error}`)
  }

  return response.json()
}

// Créer les lead_sources
async function seedLeadSources() {
  console.log('📝 Creating lead sources...')

  // Vérifier si déjà existants
  const existing = await apiCall('/items/lead_sources?limit=1')
  if (existing.data && existing.data.length > 0) {
    console.log('✅ Lead sources already exist, skipping...')
    return await apiCall('/items/lead_sources')
  }

  const result = await apiCall('/items/lead_sources', 'POST', LEAD_SOURCES)
  console.log(`✅ Created ${LEAD_SOURCES.length} lead sources`)
  return result
}

// Générer un lead
function generateLead(sourceIds, sourceNames) {
  const firstName = randomItem(SWISS_FIRST_NAMES)
  const lastName = randomItem(SWISS_LAST_NAMES)
  const companyName = randomItem(SWISS_COMPANIES)
  const ownerCompany = randomItem(OWNER_COMPANIES)
  const location = randomItem(SWISS_CITIES)
  const status = randomItem(LEAD_STATUSES)

  // Score basé sur le statut
  const scoreByStatus = {
    'new': randomInt(10, 30),
    'contacted': randomInt(20, 50),
    'qualified': randomInt(40, 70),
    'proposal': randomInt(60, 85),
    'negotiation': randomInt(70, 95),
    'won': 100,
    'lost': randomInt(5, 40)
  }

  // Valeur estimée basée sur le statut et l'entreprise
  const baseValue = {
    HYPERVISUAL: randomInt(15000, 150000),
    DAINAMICS: randomInt(20000, 200000),
    LEXAIA: randomInt(10000, 80000),
    ENKI_REALTY: randomInt(50000, 500000),
    TAKEOUT: randomInt(5000, 50000)
  }

  // source est un UUID dans leads mais nos IDs sont des integers
  // On ne peut pas utiliser la relation directement, on stocke le nom de la source dans notes
  const sourceIndex = randomInt(0, sourceNames.length - 1)
  const sourceName = sourceNames[sourceIndex]

  const lead = {
    first_name: firstName,
    last_name: lastName,
    email: generateEmail(firstName, lastName, companyName),
    phone: generatePhone(),
    company_name: companyName,
    job_title: randomItem(JOB_TITLES),
    website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/gi, '')}.ch`,
    // source: null, // Ne pas utiliser - type mismatch UUID vs integer
    status: status,
    score: scoreByStatus[status],
    priority: randomItem(PRIORITIES),
    company: ownerCompany, // owner_company
    estimated_value: baseValue[ownerCompany],
    currency: 'CHF',
    tags: [randomItem(TAGS_BY_COMPANY[ownerCompany]), randomItem(TAGS_BY_COMPANY[ownerCompany])],
    city: location.city,
    postal_code: location.postal,
    country: 'Suisse',
    date_created: randomDate(90),
    notes: `Source: ${sourceName}. Lead généré depuis ${randomItem(['site web', 'salon', 'recommandation', 'campagne marketing'])}. Intéressé par nos solutions ${ownerCompany.toLowerCase()}.`
  }

  // Ajouter dates conditionnelles
  if (['contacted', 'qualified', 'proposal', 'negotiation', 'won'].includes(status)) {
    lead.last_contacted_at = randomDate(30)
  }

  if (['qualified', 'proposal', 'negotiation'].includes(status)) {
    const followup = new Date()
    followup.setDate(followup.getDate() + randomInt(1, 14))
    lead.next_followup_at = followup.toISOString()
  }

  if (status === 'won') {
    lead.converted_at = randomDate(30)
  }

  if (status === 'lost') {
    lead.lost_reason = randomItem([
      'Budget insuffisant',
      'Projet reporté',
      'Choix concurrent',
      'Pas de réponse',
      'Changement de priorités'
    ])
  }

  return lead
}

// Créer les leads
async function seedLeads(sourceIds, sourceNames, count = 60) {
  console.log(`📝 Creating ${count} leads...`)

  const leads = []
  for (let i = 0; i < count; i++) {
    leads.push(generateLead(sourceIds, sourceNames))
  }

  // Créer par batch de 10
  const batchSize = 10
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    await apiCall('/items/leads', 'POST', batch)
    console.log(`   Created leads ${i + 1}-${Math.min(i + batchSize, leads.length)}`)
  }

  console.log(`✅ Created ${count} leads`)
}

// Main
async function main() {
  console.log('🚀 Starting leads seed script...')
  console.log(`   API URL: ${API_URL}`)

  try {
    // 1. Créer les lead_sources
    const sourcesResult = await seedLeadSources()
    const sourceIds = sourcesResult.data.map(s => s.id)
    const sourceNames = sourcesResult.data.map(s => s.name)
    console.log(`   Source IDs: ${sourceIds.join(', ')}`)
    console.log(`   Source Names: ${sourceNames.join(', ')}`)

    // 2. Créer les leads
    await seedLeads(sourceIds, sourceNames, 60)

    console.log('')
    console.log('✅ Seed completed successfully!')
    console.log('')

    // Stats finales
    const leadsCount = await apiCall('/items/leads?limit=1&meta=total_count')
    console.log(`📊 Total leads in database: ${leadsCount.meta.total_count}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
