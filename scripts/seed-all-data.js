#!/usr/bin/env node
/**
 * seed-all-data.js — Comprehensive Directus Seeding Script
 * Populates ALL collections with realistic Swiss business data.
 * 450+ records across 27 collections.
 *
 * Usage:  node scripts/seed-all-data.js
 * Requires: Node 18+ (native fetch)
 * Idempotent: DELETE all → INSERT
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055'
const DIRECTUS_EMAIL = process.env.DIRECTUS_EMAIL || 'jmd@hypervisual.ch'
const DIRECTUS_PASSWORD = process.env.DIRECTUS_PASSWORD || 'Admin1234!'

let ACCESS_TOKEN = ''
const STATS = {}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(2)

function randomDate(daysAgoMax, daysAgoMin = 0) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(daysAgoMin, daysAgoMax))
  return d.toISOString().split('T')[0]
}

function randomDatetime(daysAgoMax, daysAgoMin = 0) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(daysAgoMin, daysAgoMax))
  d.setHours(randomInt(8, 18), randomInt(0, 59), randomInt(0, 59))
  return d.toISOString()
}

function randomAmount(min, max) {
  return Math.round(randomFloat(min, max) * 20) / 20 // Swiss rounding (0.05)
}

function formatCHF(v) {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v)
}

// ─── API LAYER ──────────────────────────────────────────────────────────────

async function apiRequest(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${DIRECTUS_URL}${path}`, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = await res.json().catch(() => ({}))
  return json.data
}

async function clearCollection(collection) {
  try {
    // Get all IDs
    const items = await apiRequest('GET', `/items/${collection}?fields=id&limit=-1`)
    if (!items || items.length === 0) return 0
    const ids = items.map(i => i.id)
    // Delete in batches of 100
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100)
      await apiRequest('DELETE', `/items/${collection}`, batch)
    }
    return ids.length
  } catch {
    return 0
  }
}

async function createItems(collection, items) {
  if (!items || items.length === 0) return []
  const created = []
  // Insert in batches of 50
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50)
    try {
      const result = await apiRequest('POST', `/items/${collection}`, batch)
      if (Array.isArray(result)) created.push(...result)
      else if (result) created.push(result)
    } catch (err) {
      // Try one by one on batch failure
      for (const item of batch) {
        try {
          const r = await apiRequest('POST', `/items/${collection}`, item)
          if (r) created.push(r)
        } catch (e2) {
          console.error(`    ⚠ Skip item in ${collection}: ${e2.message.slice(0, 100)}`)
        }
      }
    }
  }
  STATS[collection] = (STATS[collection] || 0) + created.length
  return created
}

async function createItem(collection, item) {
  const result = await apiRequest('POST', `/items/${collection}`, item)
  STATS[collection] = (STATS[collection] || 0) + 1
  return result
}

// ─── DATA CONSTANTS ─────────────────────────────────────────────────────────

const OWNER_COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT']

const OWNER_COMPANY_DETAILS = {
  HYPERVISUAL: { name: 'HYPERVISUAL', legal_name: 'HYPERVISUAL Studio Créatif SA', slug: 'hypervisual', industry: 'Digital Signage & LED', vat_number: 'CHE-123.456.789', registration_number: 'CH-550.1.001.001-1', country: 'CH', website: 'https://hypervisual.ch' },
  DAINAMICS: { name: 'DAINAMICS', legal_name: 'DAINAMICS Solutions Tech Sàrl', slug: 'dainamics', industry: 'Technologie & IA', vat_number: 'CHE-234.567.890', registration_number: 'CH-550.1.002.002-2', country: 'CH', website: 'https://dainamics.ch' },
  LEXAIA: { name: 'LEXAIA', legal_name: 'LEXAIA Services Juridiques SA', slug: 'lexaia', industry: 'Services Juridiques', vat_number: 'CHE-345.678.901', registration_number: 'CH-550.1.003.003-3', country: 'CH', website: 'https://lexaia.ch' },
  ENKI_REALTY: { name: 'ENKI REALTY', legal_name: 'ENKI REALTY Immobilier Premium SA', slug: 'enki-realty', industry: 'Immobilier Premium', vat_number: 'CHE-456.789.012', registration_number: 'CH-550.1.004.004-4', country: 'CH', website: 'https://enki-realty.ch' },
  TAKEOUT: { name: 'TAKEOUT', legal_name: 'TAKEOUT Restauration Sàrl', slug: 'takeout', industry: 'Restauration & Livraison', vat_number: 'CHE-567.890.123', registration_number: 'CH-550.1.005.005-5', country: 'CH', website: 'https://takeout.ch' }
}

const SWISS_FIRST_NAMES = ['Marc', 'Sophie', 'Thomas', 'Julie', 'Pierre', 'Marie', 'Nicolas', 'Isabelle', 'François', 'Claire', 'Jean', 'Nathalie', 'Christophe', 'Sandrine', 'Laurent', 'Valérie', 'Patrick', 'Caroline', 'Philippe', 'Stéphanie', 'David', 'Anna', 'Lukas', 'Elena', 'Simon', 'Laura', 'Daniel', 'Sarah', 'Michael', 'Céline']
const SWISS_LAST_NAMES = ['Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer', 'Gerber', 'Brunner', 'Baumann', 'Frei', 'Zimmermann', 'Moser', 'Widmer', 'Wyss', 'Graf', 'Roth', 'Dubois', 'Martin', 'Bernard', 'Favre', 'Rochat', 'Bonvin', 'Chenaux', 'Berset', 'Monney', 'Pythoud']
const SWISS_CITIES = ['Lausanne', 'Genève', 'Berne', 'Zurich', 'Fribourg', 'Neuchâtel', 'Sion', 'Bâle', 'Lucerne', 'Montreux', 'Nyon', 'Morges', 'Yverdon', 'Vevey', 'Bulle']
const COMPANY_NAMES = ['TechVision SA', 'AlpineData Sàrl', 'SwissDigital AG', 'LakeView Solutions', 'MontBlanc Tech', 'Helvetic Systems', 'Romand Services', 'BerneSoft AG', 'GenevaLab SA', 'ZuriTech GmbH', 'FribourgMedia', 'NeuchâtelIT', 'SionDigital', 'BaselInnovation', 'LucerneGroup', 'VaudConsulting SA', 'NyonDesign Sàrl', 'MorgesMarketing', 'VeveyCreative', 'BulleServices', 'SwissConnect SA', 'DigitalAlps AG', 'LémanTech Sàrl', 'JuraLogic SA', 'PlaineConseil']

const LEAD_SOURCE_NAMES = ['Site Web', 'LinkedIn', 'Recommandation', 'Salon professionnel', 'Google Ads', 'Cold Call', 'Partenaire', 'Email Marketing', 'Réseaux sociaux', 'Bouche-à-oreille']
const EXPENSE_CATEGORIES = ['Salaires', 'Loyer', 'Marketing', 'IT & Software', 'Fournitures', 'Déplacements', 'Assurances', 'Télécom', 'Formation', 'Comptabilité']
const PROJECT_TYPES = ['Site web', 'Application mobile', 'Branding', 'Campagne marketing', 'Audit juridique', 'Rénovation', 'Installation LED', 'Consulting', 'Formation', 'Intégration système']
const PRODUCT_NAMES = ['Écran LED Indoor P2.5', 'Écran LED Outdoor P4', 'Mur vidéo 3x3', 'Totem digital 55"', 'Borne interactive', 'Logiciel CMS', 'Support mural', 'Média player', 'Caméra PTZ', 'Licence annuelle']
const SERVICE_NAMES = ['Conseil stratégique', 'Développement web', 'Design UX/UI', 'Intégration API', 'Formation utilisateur', 'Support technique', 'Audit sécurité', 'Gestion de projet', 'Rédaction contenu', 'SEO/SEM']

// ─── STEP 1: AUTHENTICATE ───────────────────────────────────────────────────

async function authenticate() {
  console.log('1/27 — Authentification Directus...')
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DIRECTUS_EMAIL, password: DIRECTUS_PASSWORD })
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const json = await res.json()
  ACCESS_TOKEN = json.data.access_token
  console.log('   ✅ Authentifié\n')
}

// ─── STEP 2: OWNER COMPANIES ────────────────────────────────────────────────

async function seedOwnerCompanies() {
  console.log('2/27 — owner_companies (5 entreprises du groupe)...')
  const deleted = await clearCollection('owner_companies')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = OWNER_COMPANIES.map(key => ({
    ...OWNER_COMPANY_DETAILS[key]
  }))

  const created = await createItems('owner_companies', items)
  console.log(`   ✅ ${created.length} owner_companies créées\n`)
  return created
}

// ─── STEP 3: LEAD SOURCES ───────────────────────────────────────────────────

async function seedLeadSources() {
  console.log('3/27 — lead_sources (10 sources)...')
  const deleted = await clearCollection('lead_sources')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = LEAD_SOURCE_NAMES.map((name, i) => ({
    name,
    description: `Source de leads : ${name}`,
    is_active: true,
    sort_order: i + 1
  }))

  const created = await createItems('lead_sources', items)
  console.log(`   ✅ ${created.length} lead_sources créées\n`)
  return created
}

// ─── STEP 4: COMPANIES (CLIENTS/SUPPLIERS) ──────────────────────────────────

async function seedCompanies() {
  console.log('4/27 — companies (25 entreprises clients/fournisseurs)...')
  const deleted = await clearCollection('companies')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = COMPANY_NAMES.map((name, i) => {
    const oc = randomPick(OWNER_COMPANIES)
    const city = randomPick(SWISS_CITIES)
    return {
      owner_company: oc,
      name,
      legal_name: name,
      vat_number: `CHE-${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}`,
      industry: randomPick(['Technologie', 'Finance', 'Immobilier', 'Juridique', 'Restauration', 'Marketing', 'Industrie', 'Commerce', 'Santé', 'Éducation']),
      website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ch`,
      billing_address: JSON.stringify({ street: `Rue ${randomPick(['du Lac', 'de la Gare', 'Centrale', 'du Marché', 'des Alpes'])} ${randomInt(1, 99)}`, zip: `${randomInt(1000, 1999)}`, city, country: 'CH' }),
      credit_limit: randomAmount(10000, 100000),
      payment_terms: randomPick([15, 30, 45, 60]),
      customer_since: randomDate(730),
      risk_level: randomPick(['low', 'low', 'low', 'medium', 'medium', 'high'])
    }
  })

  const created = await createItems('companies', items)
  console.log(`   ✅ ${created.length} companies créées\n`)
  return created
}

// ─── STEP 5: PEOPLE / CONTACTS ──────────────────────────────────────────────

async function seedPeople(companyIds) {
  console.log('5/27 — people (50 contacts)...')
  const deleted = await clearCollection('people')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = Array.from({ length: 50 }, () => {
    const firstName = randomPick(SWISS_FIRST_NAMES)
    const lastName = randomPick(SWISS_LAST_NAMES)
    return {
      owner_company: randomPick(OWNER_COMPANIES),
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomPick(['gmail.com', 'outlook.com', 'protonmail.ch', 'bluewin.ch'])}`,
      phone: `+41 ${randomInt(21, 79)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      position: randomPick(['CEO', 'CTO', 'CFO', 'Directeur', 'Manager', 'Consultant', 'Designer', 'Développeur', 'Comptable', 'Avocat', 'Agent immobilier', 'Chef de projet']),
      department: randomPick(['Direction', 'Technique', 'Finance', 'Marketing', 'Ventes', 'RH', 'Juridique', 'Opérations']),
      company_id: companyIds.length > 0 ? randomPick(companyIds) : null,
      is_active: Math.random() > 0.1,
      notes: randomPick(['Client fidèle', 'Premier contact', 'Prospect intéressé', 'Partenaire potentiel', null, null])
    }
  })

  const created = await createItems('people', items)
  console.log(`   ✅ ${created.length} people créés\n`)
  return created
}

// ─── STEP 6: LEADS ──────────────────────────────────────────────────────────

async function seedLeads() {
  console.log('6/27 — leads (40 leads commerciaux)...')
  const deleted = await clearCollection('leads')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const priorities = ['low', 'medium', 'high', 'urgent']

  const items = Array.from({ length: 40 }, (_, i) => {
    const firstName = randomPick(SWISS_FIRST_NAMES)
    const lastName = randomPick(SWISS_LAST_NAMES)
    const oc = randomPick(OWNER_COMPANIES)
    return {
      company: oc,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomPick(['example.com', 'company.ch', 'startup.io'])}`,
      company_name: randomPick(COMPANY_NAMES),
      phone: `+41 ${randomInt(21, 79)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      status: randomPick(statuses),
      source: randomPick(LEAD_SOURCE_NAMES),
      priority: randomPick(priorities),
      estimated_value: randomAmount(5000, 150000),
      score: randomInt(10, 100),
      notes: randomPick([
        'Intéressé par nos solutions LED',
        'Demande de devis urgente',
        'Rencontré au salon de Lausanne',
        'Recommandé par un partenaire',
        'Contact via LinkedIn',
        'Besoin audit juridique',
        null
      ])
    }
  })

  const created = await createItems('leads', items)
  console.log(`   ✅ ${created.length} leads créés\n`)
  return created
}

// ─── STEP 7: PROJECTS ───────────────────────────────────────────────────────

async function seedProjects(companyIds) {
  console.log('7/27 — projects (30 projets)...')
  const deleted = await clearCollection('projects')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const projectStatuses = ['draft', 'active', 'in_progress', 'on_hold', 'completed', 'cancelled']

  const items = Array.from({ length: 30 }, (_, i) => {
    const oc = randomPick(OWNER_COMPANIES)
    const status = randomPick(projectStatuses)
    const startDate = randomDate(365, 30)
    const budget = randomAmount(5000, 200000)
    return {
      owner_company: oc,
      name: `${randomPick(PROJECT_TYPES)} — ${randomPick(COMPANY_NAMES).split(' ')[0]} #${i + 1}`,
      description: `Projet ${randomPick(PROJECT_TYPES).toLowerCase()} pour client ${randomPick(SWISS_CITIES)}.`,
      status,
      client_id: companyIds.length > 0 ? randomPick(companyIds) : null,
      start_date: startDate,
      end_date: randomDate(0, 0), // future-ish
      budget,
      actual_cost: status === 'completed' ? randomAmount(budget * 0.8, budget * 1.2) : randomAmount(0, budget * 0.6),
      progress: status === 'completed' ? 100 : status === 'cancelled' ? randomInt(0, 30) : randomInt(10, 90)
    }
  })

  const created = await createItems('projects', items)
  console.log(`   ✅ ${created.length} projets créés\n`)
  return created
}

// ─── STEP 8: DELIVERABLES ───────────────────────────────────────────────────

async function seedDeliverables(projectIds, peopleIds) {
  console.log('8/27 — deliverables (60 livrables)...')
  const deleted = await clearCollection('deliverables')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const deliverableStatuses = ['pending', 'in_progress', 'review', 'completed', 'cancelled']
  const deliverableNames = ['Maquette UI', 'Développement frontend', 'Backend API', 'Tests unitaires', 'Documentation', 'Déploiement', 'Formation client', 'Design système', 'Intégration CRM', 'Rapport final', 'Wireframes', 'Prototype', 'Audit technique', 'Optimisation SEO', 'Plan marketing']

  const items = Array.from({ length: 60 }, () => {
    const status = randomPick(deliverableStatuses)
    return {
      project_id: projectIds.length > 0 ? randomPick(projectIds) : null,
      name: randomPick(deliverableNames),
      description: `Livrable : ${randomPick(deliverableNames).toLowerCase()}`,
      status,
      due_date: randomDate(60, 0),
      completed_date: status === 'completed' ? randomDate(30) : null,
      responsible_id: peopleIds.length > 0 ? randomPick(peopleIds) : null
    }
  })

  const created = await createItems('deliverables', items)
  console.log(`   ✅ ${created.length} deliverables créés\n`)
  return created
}

// ─── STEP 9: PRODUCTS ───────────────────────────────────────────────────────

async function seedProducts() {
  console.log('9/27 — products (10 produits)...')
  const deleted = await clearCollection('products')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = PRODUCT_NAMES.map((name, i) => ({
    owner_company: i < 4 ? 'HYPERVISUAL' : randomPick(OWNER_COMPANIES),
    name,
    sku: `PROD-${String(i + 1).padStart(3, '0')}`,
    description: `${name} — produit de haute qualité pour solutions professionnelles.`,
    category: randomPick(['LED', 'Digital Signage', 'Accessoires', 'Logiciel', 'Installation']),
    unit_price: randomAmount(500, 25000),
    tax_rate: 8.1,
    is_active: true
  }))

  const created = await createItems('products', items)
  console.log(`   ✅ ${created.length} products créés\n`)
  return created
}

// ─── STEP 10: SERVICES ──────────────────────────────────────────────────────

async function seedServices() {
  console.log('10/27 — services (10 prestations)...')
  const deleted = await clearCollection('services')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = SERVICE_NAMES.map(name => ({
    owner_company: randomPick(OWNER_COMPANIES),
    name,
    description: `Prestation professionnelle : ${name.toLowerCase()}.`,
    category: randomPick(['Consulting', 'Technique', 'Créatif', 'Formation', 'Support']),
    hourly_rate: randomAmount(120, 350),
    tax_rate: 8.1,
    is_active: true
  }))

  const created = await createItems('services', items)
  console.log(`   ✅ ${created.length} services créés\n`)
  return created
}

// ─── STEP 11: QUOTES ────────────────────────────────────────────────────────

async function seedQuotes(companyIds, peopleIds) {
  console.log('11/27 — quotes (20 devis)...')
  const deleted = await clearCollection('quotes')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const quoteStatuses = ['draft', 'sent', 'viewed', 'signed', 'accepted', 'cancelled']

  const items = Array.from({ length: 20 }, (_, i) => {
    const oc = randomPick(OWNER_COMPANIES)
    const subtotal = randomAmount(3000, 120000)
    const taxRate = 8.1
    const taxAmount = Math.round(subtotal * taxRate / 100 * 20) / 20
    const total = subtotal + taxAmount
    const status = randomPick(quoteStatuses)
    return {
      owner_company: oc,
      quote_number: `DEV-${oc.slice(0, 2)}-${String(i + 1).padStart(4, '0')}`,
      company_id: companyIds.length > 0 ? randomPick(companyIds) : null,
      contact_id: peopleIds.length > 0 ? randomPick(peopleIds) : null,
      project_type: randomPick(PROJECT_TYPES),
      status,
      description: `Devis pour ${randomPick(PROJECT_TYPES).toLowerCase()} — ${randomPick(COMPANY_NAMES)}`,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      total_ttc: total,
      currency: 'CHF',
      valid_until: randomDate(0, 0), // future dates (using 0 days ago = today)
      is_signed: ['signed', 'accepted'].includes(status),
      cgv_accepted: ['signed', 'accepted'].includes(status),
      deposit_percentage: randomPick([0, 30, 50]),
      deposit_amount: ['signed', 'accepted'].includes(status) ? Math.round(total * 0.3) : 0,
      deposit_paid: status === 'accepted'
    }
  })

  const created = await createItems('quotes', items)
  console.log(`   ✅ ${created.length} quotes créés\n`)
  return created
}

// ─── STEP 12: CLIENT INVOICES ───────────────────────────────────────────────

async function seedClientInvoices(companyIds) {
  console.log('12/27 — client_invoices (50 factures clients)...')
  const deleted = await clearCollection('client_invoices')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const invoiceStatuses = ['draft', 'sent', 'pending', 'overdue', 'paid', 'cancelled']
  // Weighted: more paid, some pending/overdue
  const weightedStatuses = ['paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'overdue', 'sent', 'draft', 'cancelled']

  const items = Array.from({ length: 50 }, (_, i) => {
    const oc = randomPick(OWNER_COMPANIES)
    const amount = randomAmount(1500, 85000)
    const taxRate = 8.1
    const taxAmount = Math.round(amount * taxRate / 100 * 20) / 20
    const status = randomPick(weightedStatuses)
    const invoiceDate = randomDate(180, 5)
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 30)
    return {
      owner_company: oc,
      invoice_number: `FAC-${oc.slice(0, 2)}-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      client_name: randomPick(COMPANY_NAMES),
      client_id: companyIds.length > 0 ? randomPick(companyIds) : null,
      status,
      amount,
      subtotal: amount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total: amount + taxAmount,
      total_ttc: amount + taxAmount,
      currency: 'CHF',
      invoice_date: invoiceDate,
      due_date: dueDate.toISOString().split('T')[0],
      paid_date: status === 'paid' ? randomDate(30) : null,
      description: `Facture services ${randomPick(PROJECT_TYPES).toLowerCase()} — ${randomPick(SWISS_CITIES)}`,
      vat_rate: taxRate,
      vat_amount: taxAmount,
      tax_relevant: true
    }
  })

  const created = await createItems('client_invoices', items)
  console.log(`   ✅ ${created.length} client_invoices créées\n`)
  return created
}

// ─── STEP 13: SUPPLIER INVOICES ─────────────────────────────────────────────

async function seedSupplierInvoices(companyIds) {
  console.log('13/27 — supplier_invoices (25 factures fournisseurs)...')
  const deleted = await clearCollection('supplier_invoices')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = Array.from({ length: 25 }, (_, i) => {
    const oc = randomPick(OWNER_COMPANIES)
    const subtotal = randomAmount(500, 30000)
    const taxRate = 8.1
    const taxAmount = Math.round(subtotal * taxRate / 100 * 20) / 20
    const status = randomPick(['received', 'pending', 'paid', 'paid', 'paid'])
    const invoiceDate = randomDate(120, 5)
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 30)
    return {
      owner_company: oc,
      invoice_number: `FOUR-${String(i + 1).padStart(4, '0')}`,
      supplier_id: companyIds.length > 0 ? randomPick(companyIds) : null,
      status,
      invoice_date: invoiceDate,
      due_date: dueDate.toISOString().split('T')[0],
      paid_date: status === 'paid' ? randomDate(30) : null,
      description: `Achat ${randomPick(['matériel', 'logiciels', 'fournitures', 'services', 'sous-traitance'])} — ${randomPick(COMPANY_NAMES)}`,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total: subtotal + taxAmount,
      total_ttc: subtotal + taxAmount,
      currency: 'CHF',
      vat_rate: taxRate,
      vat_amount: taxAmount,
      tax_relevant: true
    }
  })

  const created = await createItems('supplier_invoices', items)
  console.log(`   ✅ ${created.length} supplier_invoices créées\n`)
  return created
}

// ─── STEP 14: PAYMENTS ──────────────────────────────────────────────────────

async function seedPayments(invoiceIds) {
  console.log('14/27 — payments (30 paiements)...')
  const deleted = await clearCollection('payments')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = Array.from({ length: 30 }, () => ({
    owner_company: randomPick(OWNER_COMPANIES),
    invoice_id: invoiceIds.length > 0 ? randomPick(invoiceIds) : null,
    payment_type: randomPick(['bank_transfer', 'bank_transfer', 'bank_transfer', 'card', 'cash']),
    amount: randomAmount(1000, 50000),
    currency: 'CHF',
    payment_date: randomDate(90),
    reference: `PAY-${randomInt(100000, 999999)}`,
    notes: randomPick(['Paiement reçu', 'Virement IBAN', 'Paiement carte', null]),
    reconciled: Math.random() > 0.3
  }))

  const created = await createItems('payments', items)
  console.log(`   ✅ ${created.length} payments créés\n`)
  return created
}

// ─── STEP 15: BANK ACCOUNTS ────────────────────────────────────────────────

async function seedBankAccounts() {
  console.log('15/27 — bank_accounts (5 comptes, 1 par entreprise)...')
  const deleted = await clearCollection('bank_accounts')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = OWNER_COMPANIES.map((oc, i) => ({
    owner_company: oc,
    name: `Compte principal ${OWNER_COMPANY_DETAILS[oc].name}`,
    account_number: `${randomInt(1000, 9999)}-${randomInt(1000, 9999)}-${randomInt(1, 9)}`,
    iban: `CH${randomInt(10, 99)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)} ${randomInt(1000, 9999)} ${randomInt(0, 9)}`,
    bic: 'REVOCH22XXX',
    bank_name: 'Revolut Business',
    currency: 'CHF',
    balance: randomAmount(15000, 350000),
    account_type: 'checking',
    is_active: true,
    revolut_account_id: `rev_${uuid().slice(0, 8)}`
  }))

  const created = await createItems('bank_accounts', items)
  console.log(`   ✅ ${created.length} bank_accounts créés\n`)
  return created
}

// ─── STEP 16: BANK TRANSACTIONS ─────────────────────────────────────────────

async function seedBankTransactions(bankAccountIds) {
  console.log('16/27 — bank_transactions (80 transactions bancaires)...')
  const deleted = await clearCollection('bank_transactions')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const items = Array.from({ length: 80 }, () => {
    const type = randomPick(['credit', 'credit', 'credit', 'debit', 'debit', 'debit', 'debit', 'fee'])
    const amount = type === 'fee' ? randomAmount(5, 50) : randomAmount(500, 45000)
    const balance = randomAmount(10000, 300000)
    return {
      owner_company: randomPick(OWNER_COMPANIES),
      bank_account_id: bankAccountIds.length > 0 ? randomPick(bankAccountIds) : null,
      date: randomDate(120),
      type,
      description: type === 'credit'
        ? `Paiement reçu — ${randomPick(COMPANY_NAMES)}`
        : type === 'fee'
          ? 'Frais bancaires Revolut'
          : `Paiement ${randomPick(['loyer', 'fournisseur', 'salaire', 'assurance', 'abonnement'])}`,
      amount,
      currency: 'CHF',
      balance_before: balance,
      balance_after: type === 'credit' ? balance + amount : balance - amount,
      reconciled: Math.random() > 0.4,
      tax_relevant: type !== 'fee',
      vat_rate: type !== 'fee' ? 8.1 : 0,
      vat_amount: type !== 'fee' ? Math.round(amount * 0.081 * 20) / 20 : 0,
      expense_category: type === 'debit' ? randomPick(EXPENSE_CATEGORIES) : null,
      business_purpose: type === 'debit' ? randomPick(['Frais opérationnels', 'Investissement', 'Charges fixes', 'Charges variables']) : null
    }
  })

  const created = await createItems('bank_transactions', items)
  console.log(`   ✅ ${created.length} bank_transactions créées\n`)
  return created
}

// ─── STEP 17: SUPPORT TICKETS ───────────────────────────────────────────────

async function seedSupportTickets(companyIds, peopleIds) {
  console.log('17/27 — support_tickets (15 tickets support)...')
  const deleted = await clearCollection('support_tickets')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const subjects = [
    'Problème d\'affichage écran LED', 'Erreur connexion CMS', 'Demande de formation',
    'Bug application mobile', 'Mise à jour firmware', 'Problème facturation',
    'Demande de support technique', 'Installation écran défectueuse',
    'Accès portail client bloqué', 'Demande de remboursement',
    'Câblage réseau défaillant', 'Performance dégradée du serveur',
    'Mise à jour sécurité urgente', 'Remplacement matériel garanti',
    'Question licence logiciel'
  ]

  const items = subjects.map((subject, i) => ({
    owner_company: randomPick(OWNER_COMPANIES),
    ticket_number: `TK-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    subject,
    description: `${subject}. Le client signale un problème nécessitant une intervention.`,
    status: randomPick(['new', 'open', 'open', 'in_progress', 'in_progress', 'waiting', 'resolved', 'closed']),
    priority: randomPick(['low', 'medium', 'medium', 'high', 'urgent']),
    assigned_to: peopleIds.length > 0 ? randomPick(peopleIds) : null,
    company: companyIds.length > 0 ? randomPick(companyIds) : null,
    due_date: randomDate(14, 0)
  }))

  const created = await createItems('support_tickets', items)
  console.log(`   ✅ ${created.length} support_tickets créés\n`)
  return created
}

// ─── STEP 18: CAMPAIGNS ─────────────────────────────────────────────────────

async function seedCampaigns() {
  console.log('18/27 — campaigns (10 campagnes marketing)...')
  const deleted = await clearCollection('campaigns')
  if (deleted) console.log(`   🗑  ${deleted} supprimés`)

  const campaignNames = [
    'Lancement produit LED 2026', 'Campagne LinkedIn Q1', 'Newsletter mensuelle',
    'Salon Lausanne Digital', 'Webinar Solutions Tech', 'Campagne Google Ads',
    'Partenariats immobiliers', 'Campagne réseaux sociaux', 'Email nurturing leads',
    'Event networking Genève'
  ]

  const items = campaignNames.map(name => ({
    owner_company: randomPick(OWNER_COMPANIES),
    name,
    description: `Campagne marketing : ${name.toLowerCase()}`,
    status: randomPick(['draft', 'planned', 'active', 'active', 'completed', 'paused']),
    start_date: randomDate(90, 0),
    end_date: randomDate(0, 0),
    budget: randomAmount(2000, 50000),
    target_segment: randomPick(['PME Suisse romande', 'Startups tech', 'Immobilier haut de gamme', 'Restauration', 'Entreprises 50+ employés'])
  }))

  const created = await createItems('campaigns', items)
  console.log(`   ✅ ${created.length} campaigns créées\n`)
  return created
}

// ─── STEP 19: WHATSAPP MESSAGES ─────────────────────────────────────────────

async function seedWhatsappMessages() {
  console.log('19/27 — whatsapp_messages (15 messages)...')
  try {
    const deleted = await clearCollection('whatsapp_messages')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = Array.from({ length: 15 }, (_, i) => ({
      owner_company: randomPick(OWNER_COMPANIES),
      phone_number: `+41${randomInt(76, 79)}${randomInt(1000000, 9999999)}`,
      message: randomPick([
        'Bonjour, avez-vous reçu notre devis ?',
        'Merci pour votre commande !',
        'Le technicien arrive dans 30 minutes.',
        'Rappel : réunion projet demain 10h.',
        'Votre facture est disponible sur le portail.',
        'Installation confirmée pour lundi.',
        'Merci de votre retour rapide.',
        'Nouveau catalogue produits disponible.',
        'Promotion -20% sur les écrans LED.',
        'Votre ticket support a été résolu.'
      ]),
      direction: randomPick(['outbound', 'outbound', 'inbound']),
      status: randomPick(['sent', 'delivered', 'read', 'failed']),
      sent_at: randomDatetime(30)
    }))

    const created = await createItems('whatsapp_messages', items)
    console.log(`   ✅ ${created.length} whatsapp_messages créés\n`)
    return created
  } catch {
    console.log('   ⚠ Collection whatsapp_messages non disponible, skip\n')
    return []
  }
}

// ─── STEP 20: TALENTS / EMPLOYEES ───────────────────────────────────────────

async function seedTalents() {
  console.log('20/27 — talents (15 collaborateurs)...')
  try {
    const deleted = await clearCollection('talents')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = Array.from({ length: 15 }, () => {
      const firstName = randomPick(SWISS_FIRST_NAMES)
      const lastName = randomPick(SWISS_LAST_NAMES)
      return {
        owner_company: randomPick(OWNER_COMPANIES),
        full_name: `${firstName} ${lastName}`,
        role: randomPick(['Développeur Full-Stack', 'Designer UX', 'Chef de projet', 'Commercial', 'Comptable', 'Technicien LED', 'Marketing Manager', 'Support Client', 'DevOps', 'Data Analyst']),
        skills: JSON.stringify(randomPick([
          ['React', 'Node.js', 'PostgreSQL'],
          ['Figma', 'Illustrator', 'UX Research'],
          ['Gestion de projet', 'Agile', 'JIRA'],
          ['Vente B2B', 'CRM', 'Négociation'],
          ['Comptabilité', 'TVA', 'Excel']
        ])),
        level: randomPick(['junior', 'mid', 'mid', 'senior', 'expert']),
        department: randomPick(['tech', 'marketing', 'sales', 'operations', 'finance', 'hr']),
        status: randomPick(['active', 'active', 'active', 'freelance']),
        start_date: randomDate(1095, 30),
        location: randomPick(SWISS_CITIES),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hypervisual.ch`,
        phone: `+41 ${randomInt(76, 79)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        performance_rating: randomFloat(3.0, 5.0)
      }
    })

    const created = await createItems('talents', items)
    console.log(`   ✅ ${created.length} talents créés\n`)
    return created
  } catch {
    console.log('   ⚠ Collection talents non disponible, skip\n')
    return []
  }
}

// ─── STEP 21: TIME TRACKING ────────────────────────────────────────────────

async function seedTimeTracking() {
  console.log('21/27 — time_tracking (40 entrées)...')
  try {
    const deleted = await clearCollection('time_tracking')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = Array.from({ length: 40 }, () => {
      const hours = randomFloat(0.5, 8.0)
      const hourlyRate = randomAmount(120, 280)
      return {
        owner_company: randomPick(OWNER_COMPANIES),
        project_name: `${randomPick(PROJECT_TYPES)} — ${randomPick(COMPANY_NAMES).split(' ')[0]}`,
        user_name: `${randomPick(SWISS_FIRST_NAMES)} ${randomPick(SWISS_LAST_NAMES)}`,
        task_description: randomPick([
          'Développement composant React', 'Design maquette', 'Réunion client',
          'Code review', 'Tests unitaires', 'Documentation API', 'Déploiement production',
          'Correction bugs', 'Optimisation performance', 'Sprint planning'
        ]),
        hours: +hours.toFixed(1),
        date: randomDate(30),
        billable: Math.random() > 0.2,
        billed: Math.random() > 0.5,
        hourly_rate: hourlyRate,
        category: randomPick(['development', 'design', 'meeting', 'support', 'admin', 'training']),
        status: randomPick(['draft', 'validated', 'validated', 'invoiced']),
        notes: null
      }
    })

    const created = await createItems('time_tracking', items)
    console.log(`   ✅ ${created.length} time_tracking créés\n`)
    return created
  } catch {
    console.log('   ⚠ Collection time_tracking non disponible, skip\n')
    return []
  }
}

// ─── STEP 22: SUBSCRIPTIONS ────────────────────────────────────────────────

async function seedSubscriptions(companyIds) {
  console.log('22/27 — subscriptions (10 abonnements)...')
  try {
    const deleted = await clearCollection('subscriptions')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = Array.from({ length: 10 }, () => {
      const nextBilling = new Date()
      nextBilling.setDate(nextBilling.getDate() + randomInt(1, 60))
      return {
        owner_company: randomPick(OWNER_COMPANIES),
        title: randomPick([
          'Licence CMS Pro', 'Abonnement maintenance LED', 'Support premium',
          'Hébergement cloud', 'Sauvegarde automatique', 'Monitoring 24/7',
          'Formation continue', 'Abonnement Revolut Business', 'Licence Adobe CC',
          'API Gateway Pro'
        ]),
        customer: companyIds.length > 0 ? randomPick(companyIds) : null,
        amount: randomAmount(50, 5000),
        billing_cycle: randomPick(['monthly', 'monthly', 'quarterly', 'annual']),
        status: randomPick(['active', 'active', 'active', 'paused', 'cancelled']),
        next_billing_date: nextBilling.toISOString().split('T')[0]
      }
    })

    const created = await createItems('subscriptions', items)
    console.log(`   ✅ ${created.length} subscriptions créées\n`)
    return created
  } catch {
    console.log('   ⚠ Collection subscriptions non disponible, skip\n')
    return []
  }
}

// ─── STEP 23: CONTRACTS ─────────────────────────────────────────────────────

async function seedContracts() {
  console.log('23/27 — contracts (8 contrats)...')
  try {
    const deleted = await clearCollection('contracts')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = Array.from({ length: 8 }, (_, i) => ({
      owner_company: randomPick(OWNER_COMPANIES),
      title: randomPick([
        'Contrat de maintenance annuel', 'CDI Développeur Senior', 'Contrat de prestation',
        'Accord de partenariat', 'NDA confidentiel', 'Contrat de bail',
        'Contrat de sous-traitance', 'Accord-cadre fournitures'
      ]),
      description: `Contrat juridique #${i + 1} — signé et en vigueur.`,
      contract_type: randomPick(['service', 'employment', 'partnership', 'nda', 'lease', 'subcontracting']),
      status: randomPick(['draft', 'active', 'active', 'active', 'expired', 'terminated']),
      start_date: randomDate(365, 30),
      end_date: randomDate(0, 0),
      value: randomAmount(5000, 200000),
      counterparty: randomPick(COMPANY_NAMES)
    }))

    const created = await createItems('contracts', items)
    console.log(`   ✅ ${created.length} contracts créés\n`)
    return created
  } catch {
    console.log('   ⚠ Collection contracts non disponible, skip\n')
    return []
  }
}

// ─── STEP 24: COMPLIANCE RECORDS ────────────────────────────────────────────

async function seedCompliance() {
  console.log('24/27 — compliance_records (6 audits conformité)...')
  try {
    const deleted = await clearCollection('compliance_records')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = [
      { owner_company: 'HYPERVISUAL', title: 'Audit RGPD 2025', type: 'gdpr', status: 'compliant', audit_date: '2025-06-15', next_audit: '2026-06-15', notes: 'Conforme — mesures techniques et organisationnelles en place.' },
      { owner_company: 'DAINAMICS', title: 'Audit sécurité IT', type: 'security', status: 'compliant', audit_date: '2025-09-01', next_audit: '2026-09-01', notes: 'Pentest réalisé, vulnérabilités corrigées.' },
      { owner_company: 'LEXAIA', title: 'Conformité LPD/nLPD', type: 'data_protection', status: 'compliant', audit_date: '2025-07-20', next_audit: '2026-07-20', notes: 'Nouvelle loi sur la protection des données respectée.' },
      { owner_company: 'ENKI_REALTY', title: 'Audit anti-blanchiment', type: 'aml', status: 'pending', audit_date: '2026-03-01', next_audit: '2027-03-01', notes: 'Audit programmé Q1 2026.' },
      { owner_company: 'TAKEOUT', title: 'Hygiène et sécurité alimentaire', type: 'food_safety', status: 'compliant', audit_date: '2025-11-10', next_audit: '2026-11-10', notes: 'Conforme normes HACCP.' },
      { owner_company: 'HYPERVISUAL', title: 'Certification ISO 27001', type: 'iso27001', status: 'in_progress', audit_date: '2026-01-15', next_audit: '2027-01-15', notes: 'Processus de certification en cours.' }
    ]

    const created = await createItems('compliance_records', items)
    console.log(`   ✅ ${created.length} compliance_records créés\n`)
    return created
  } catch {
    console.log('   ⚠ Collection compliance_records non disponible, skip\n')
    return []
  }
}

// ─── STEP 25: CGV VERSIONS ──────────────────────────────────────────────────

async function seedCGVVersions() {
  console.log('25/27 — cgv_versions (5 versions CGV)...')
  try {
    const deleted = await clearCollection('cgv_versions')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = OWNER_COMPANIES.map((oc, i) => ({
      owner_company: oc,
      version_number: `v${i + 1}.0`,
      content: `<h1>Conditions Générales de Vente — ${OWNER_COMPANY_DETAILS[oc].legal_name}</h1><p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre ${OWNER_COMPANY_DETAILS[oc].legal_name} et ses clients. Toute commande implique l'acceptation sans réserve de ces CGV.</p><h2>1. Objet</h2><p>Les présentes CGV ont pour objet de définir les droits et obligations des parties dans le cadre de la vente de produits et services.</p><h2>2. Prix</h2><p>Les prix sont indiqués en CHF, TVA 8.1% incluse sauf mention contraire.</p><h2>3. Paiement</h2><p>Sauf accord contraire, les factures sont payables à 30 jours.</p>`,
      is_active: true,
      effective_date: randomDate(180, 30)
    }))

    const created = await createItems('cgv_versions', items)
    console.log(`   ✅ ${created.length} cgv_versions créées\n`)
    return created
  } catch {
    console.log('   ⚠ Collection cgv_versions non disponible, skip\n')
    return []
  }
}

// ─── STEP 26: BUDGETS & EXPENSES ────────────────────────────────────────────

async function seedBudgets() {
  console.log('26/27 — budgets (10) + expenses (30)...')

  // Budgets
  try {
    const deletedB = await clearCollection('budgets')
    if (deletedB) console.log(`   🗑  ${deletedB} budgets supprimés`)

    const budgetItems = Array.from({ length: 10 }, (_, i) => {
      const amount = randomAmount(10000, 200000)
      const spent = randomAmount(0, amount * 0.9)
      return {
        owner_company: randomPick(OWNER_COMPANIES),
        title: `Budget ${randomPick(['Marketing', 'IT', 'Opérations', 'RH', 'R&D', 'Ventes'])} ${randomPick(['Q1', 'Q2', 'Q3', 'Q4', 'Annuel'])} 2026`,
        category: randomPick(['marketing', 'it', 'operations', 'hr', 'rd', 'sales']),
        budget_type: randomPick(['annual', 'quarterly', 'monthly']),
        amount,
        spent_amount: spent,
        remaining_amount: amount - spent,
        period: randomPick(['q1', 'q2', 'q3', 'q4', 'year']),
        year: 2026,
        status: randomPick(['draft', 'approved', 'active', 'active']),
        notes: null
      }
    })

    const createdB = await createItems('budgets', budgetItems)
    console.log(`   ✅ ${createdB.length} budgets créés`)
  } catch {
    console.log('   ⚠ Collection budgets non disponible, skip')
  }

  // Expenses
  try {
    const deletedE = await clearCollection('expenses')
    if (deletedE) console.log(`   🗑  ${deletedE} expenses supprimés`)

    const expenseItems = Array.from({ length: 30 }, () => ({
      owner_company: randomPick(OWNER_COMPANIES),
      title: `${randomPick(EXPENSE_CATEGORIES)} — ${randomPick(['janvier', 'février', 'mars', 'avril', 'mai', 'juin'])} 2026`,
      amount: randomAmount(200, 15000),
      currency: 'CHF',
      category: randomPick(EXPENSE_CATEGORIES),
      date: randomDate(90),
      status: randomPick(['pending', 'approved', 'approved', 'reimbursed']),
      notes: null
    }))

    const createdE = await createItems('expenses', expenseItems)
    console.log(`   ✅ ${createdE.length} expenses créées\n`)
  } catch {
    console.log('   ⚠ Collection expenses non disponible, skip\n')
  }
}

// ─── STEP 27: NOTIFICATIONS ─────────────────────────────────────────────────

async function seedNotifications() {
  console.log('27/27 — notifications (10 notifications)...')
  try {
    const deleted = await clearCollection('notifications')
    if (deleted) console.log(`   🗑  ${deleted} supprimés`)

    const items = [
      { message: 'Nouvelle facture en retard : FAC-HY-2026-0012', type: 'warning', is_read: false, related_collection: 'client_invoices' },
      { message: 'Lead urgent assigné : SwissDigital AG', type: 'info', is_read: false, related_collection: 'leads' },
      { message: 'Paiement reçu : 45\'000 CHF de TechVision SA', type: 'success', is_read: true, related_collection: 'payments' },
      { message: 'Ticket support #TK-2026-0003 résolu', type: 'success', is_read: true, related_collection: 'support_tickets' },
      { message: 'Budget Marketing Q1 dépassé de 12%', type: 'warning', is_read: false, related_collection: 'budgets' },
      { message: 'Nouveau devis signé : DEV-HY-0001', type: 'success', is_read: false, related_collection: 'quotes' },
      { message: 'Audit RGPD : action requise avant le 15/03', type: 'error', is_read: false, related_collection: 'compliance_records' },
      { message: 'Projet "Site web — TechVision" terminé', type: 'info', is_read: true, related_collection: 'projects' },
      { message: 'Contrat de maintenance expire dans 30 jours', type: 'warning', is_read: false, related_collection: 'contracts' },
      { message: 'Synchronisation Revolut terminée avec succès', type: 'info', is_read: true, related_collection: 'bank_transactions' }
    ]

    const created = await createItems('notifications', items)
    console.log(`   ✅ ${created.length} notifications créées\n`)
    return created
  } catch {
    console.log('   ⚠ Collection notifications non disponible, skip\n')
    return []
  }
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║       DIRECTUS UNIFIED PLATFORM — SEED ALL DATA            ║')
  console.log('║       450+ records across all collections                  ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  console.log(`Target: ${DIRECTUS_URL}`)
  console.log(`User:   ${DIRECTUS_EMAIL}\n`)

  const startTime = Date.now()

  try {
    // Step 1: Auth
    await authenticate()

    // Step 2: Owner companies
    const ownerCompanies = await seedOwnerCompanies()

    // Step 3: Lead sources
    await seedLeadSources()

    // Step 4: Companies
    const companies = await seedCompanies()
    const companyIds = companies.map(c => c.id)

    // Step 5: People
    const people = await seedPeople(companyIds)
    const peopleIds = people.map(p => p.id)

    // Step 6: Leads
    await seedLeads()

    // Step 7: Projects
    const projects = await seedProjects(companyIds)
    const projectIds = projects.map(p => p.id)

    // Step 8: Deliverables
    await seedDeliverables(projectIds, peopleIds)

    // Step 9: Products
    await seedProducts()

    // Step 10: Services
    await seedServices()

    // Step 11: Quotes
    await seedQuotes(companyIds, peopleIds)

    // Step 12: Client invoices
    const invoices = await seedClientInvoices(companyIds)
    const invoiceIds = invoices.map(inv => inv.id)

    // Step 13: Supplier invoices
    await seedSupplierInvoices(companyIds)

    // Step 14: Payments
    await seedPayments(invoiceIds)

    // Step 15: Bank accounts
    const bankAccounts = await seedBankAccounts()
    const bankAccountIds = bankAccounts.map(ba => ba.id)

    // Step 16: Bank transactions
    await seedBankTransactions(bankAccountIds)

    // Step 17: Support tickets
    await seedSupportTickets(companyIds, peopleIds)

    // Step 18: Campaigns
    await seedCampaigns()

    // Step 19: WhatsApp messages
    await seedWhatsappMessages()

    // Step 20: Talents
    await seedTalents()

    // Step 21: Time tracking
    await seedTimeTracking()

    // Step 22: Subscriptions
    await seedSubscriptions(companyIds)

    // Step 23: Contracts
    await seedContracts()

    // Step 24: Compliance
    await seedCompliance()

    // Step 25: CGV versions
    await seedCGVVersions()

    // Step 26: Budgets & expenses
    await seedBudgets()

    // Step 27: Notifications
    await seedNotifications()

    // ─── FINAL REPORT ─────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const totalRecords = Object.values(STATS).reduce((sum, n) => sum + n, 0)

    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║                    SEEDING TERMINÉ                          ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')
    console.log('  Collection                 │ Records')
    console.log('  ──────────────────────────-─┼─────────')
    for (const [collection, count] of Object.entries(STATS).sort()) {
      console.log(`  ${collection.padEnd(27)} │ ${count}`)
    }
    console.log('  ───────────────────────────-┼─────────')
    console.log(`  TOTAL                       │ ${totalRecords}`)
    console.log(`\n  Temps: ${elapsed}s`)
    console.log(`  URL:   ${DIRECTUS_URL}`)
    console.log('\n  ✅ Toutes les collections sont peuplées.')
    console.log('  🖥  Allez sur http://localhost:5173 pour voir le dashboard !\n')

  } catch (err) {
    console.error('\n❌ ERREUR FATALE:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

main()
