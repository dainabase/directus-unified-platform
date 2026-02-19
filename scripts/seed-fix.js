#!/usr/bin/env node
/**
 * seed-fix.js — Fix collections that failed during initial seeding.
 * Targets: leads, deliverables, subscriptions, expenses, cgv_versions, compliance
 *
 * Usage:  node scripts/seed-fix.js
 * Requires: Node 18+ (native fetch), Directus running on localhost:8055
 */

const DIRECTUS_URL = 'http://localhost:8055'
const DIRECTUS_EMAIL = 'jmd@hypervisual.ch'
const DIRECTUS_PASSWORD = 'Admin1234!'

let ACCESS_TOKEN = ''
const STATS = {}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(2)
const randomAmount = (min, max) => Math.round(randomFloat(min, max) * 20) / 20

function randomDate(daysAgoMax, daysAgoMin = 0) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(daysAgoMin, daysAgoMax))
  return d.toISOString().split('T')[0]
}

// ─── API LAYER ──────────────────────────────────────────────────────────────

async function api(method, path, body = null) {
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
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`)
  }
  return (await res.json().catch(() => ({}))).data
}

async function createItems(collection, items) {
  if (!items.length) return []
  const created = []
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50)
    try {
      const result = await api('POST', `/items/${collection}`, batch)
      if (Array.isArray(result)) created.push(...result)
      else if (result) created.push(result)
    } catch (err) {
      // Fallback: insert one by one
      for (const item of batch) {
        try {
          const r = await api('POST', `/items/${collection}`, item)
          if (r) created.push(r)
        } catch (e2) {
          console.error(`    ⚠ Skip in ${collection}: ${e2.message.slice(0, 120)}`)
        }
      }
    }
  }
  STATS[collection] = (STATS[collection] || 0) + created.length
  return created
}

// ─── DATA CONSTANTS ─────────────────────────────────────────────────────────

const SWISS_FIRST_NAMES = ['Marc', 'Sophie', 'Thomas', 'Julie', 'Pierre', 'Marie', 'Nicolas', 'Isabelle', 'François', 'Claire', 'Jean', 'Nathalie', 'Christophe', 'Sandrine', 'Laurent', 'Valérie', 'Patrick', 'Caroline', 'Philippe', 'Stéphanie']
const SWISS_LAST_NAMES = ['Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer', 'Gerber', 'Brunner', 'Baumann', 'Frei', 'Zimmermann', 'Moser', 'Widmer', 'Wyss', 'Graf', 'Roth']
const COMPANY_NAMES = ['TechVision SA', 'AlpineData Sàrl', 'SwissDigital AG', 'LakeView Solutions', 'MontBlanc Tech', 'Helvetic Systems', 'Romand Services', 'BerneSoft AG', 'GenevaLab SA', 'ZuriTech GmbH', 'FribourgMedia', 'NeuchâtelIT', 'SionDigital', 'BaselInnovation', 'LucerneGroup']
const EXPENSE_CATEGORIES = ['Salaires', 'Loyer', 'Marketing', 'IT & Software', 'Fournitures', 'Déplacements', 'Assurances', 'Télécom', 'Formation', 'Comptabilité']

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║     SEED FIX — Correcting failed collections           ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  const startTime = Date.now()

  // ─── AUTH ───
  console.log('🔐 Authenticating...')
  const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DIRECTUS_EMAIL, password: DIRECTUS_PASSWORD })
  })
  if (!loginRes.ok) throw new Error(`Auth failed: ${loginRes.status}`)
  ACCESS_TOKEN = (await loginRes.json()).data.access_token
  console.log('   ✅ Authenticated\n')

  // ─── FETCH EXISTING IDS ───
  console.log('📦 Fetching existing IDs for foreign keys...')

  const ownerCompaniesData = await api('GET', '/items/owner_companies?fields=id,name&limit=-1')
  const OC_MAP = {}
  for (const oc of ownerCompaniesData) OC_MAP[oc.name] = oc.id
  const OC_NAMES = Object.keys(OC_MAP)
  console.log(`   owner_companies: ${OC_NAMES.join(', ')}`)

  const projectsData = await api('GET', '/items/projects?fields=id,owner_company&limit=-1')
  const projectIds = projectsData.map(p => p.id)
  console.log(`   projects: ${projectIds.length} found`)

  const peopleData = await api('GET', '/items/people?fields=id&limit=-1')
  const peopleIds = peopleData.map(p => p.id)
  console.log(`   people: ${peopleIds.length} found`)

  const leadSourcesData = await api('GET', '/items/lead_sources?fields=id,name&limit=-1')
  const leadSourceIds = leadSourcesData.map(ls => ls.id)
  console.log(`   lead_sources: ${leadSourceIds.length} found`)

  const companiesData = await api('GET', '/items/companies?fields=id&limit=50')
  const companyIds = companiesData.map(c => c.id)
  console.log(`   companies: ${companyIds.length} found\n`)

  // ═══════════════════════════════════════════════════════════════
  // 1. LEADS (40) — company is UUID FK to owner_companies
  //    source is UUID type but lead_sources has int IDs → skip source
  // ═══════════════════════════════════════════════════════════════
  // First clean up test leads
  try {
    const testLeads = await api('GET', '/items/leads?filter[first_name][_starts_with]=Test&fields=id&limit=-1')
    if (testLeads && testLeads.length > 0) {
      await api('DELETE', '/items/leads', testLeads.map(l => l.id))
      console.log(`   🗑  ${testLeads.length} test leads removed`)
    }
  } catch { /* ignore */ }

  console.log('1/6 — leads (40 leads)...')
  const leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const leadPriorities = ['low', 'medium', 'high', 'urgent']

  const leadItems = Array.from({ length: 40 }, () => {
    const firstName = randomPick(SWISS_FIRST_NAMES)
    const lastName = randomPick(SWISS_LAST_NAMES)
    const ocName = randomPick(OC_NAMES)
    return {
      company: OC_MAP[ocName],
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomPick(['example.com', 'company.ch', 'startup.io'])}`,
      company_name: randomPick(COMPANY_NAMES),
      phone: `+41 ${randomInt(21, 79)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      status: randomPick(leadStatuses),
      priority: randomPick(leadPriorities),
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

  const createdLeads = await createItems('leads', leadItems)
  console.log(`   ✅ ${createdLeads.length} leads créés\n`)

  // ═══════════════════════════════════════════════════════════════
  // 2. DELIVERABLES (60) — linked to existing projects
  // ═══════════════════════════════════════════════════════════════
  console.log('2/6 — deliverables (60 livrables)...')
  const deliverableStatuses = ['pending', 'in_progress', 'review', 'completed', 'cancelled']
  const deliverableTitles = [
    'Maquette UI', 'Développement frontend', 'Backend API', 'Tests unitaires',
    'Documentation technique', 'Déploiement production', 'Formation client',
    'Design système', 'Intégration CRM', 'Rapport final', 'Wireframes',
    'Prototype interactif', 'Audit technique', 'Optimisation SEO',
    'Plan marketing digital', 'Configuration serveur', 'Tests E2E',
    'Revue de code', 'Migration données', 'Intégration API tierce'
  ]

  const deliverableItems = Array.from({ length: 60 }, () => {
    const status = randomPick(deliverableStatuses)
    const projId = randomPick(projectIds)
    return {
      project_id: projId,
      title: randomPick(deliverableTitles),
      description: `Livrable technique assigné au projet.`,
      status,
      due_date: randomDate(60, 0),
      assigned_to: peopleIds.length > 0 ? randomPick(peopleIds) : null,
      owner_company: randomPick(OC_NAMES)
    }
  })

  const createdDeliverables = await createItems('deliverables', deliverableItems)
  console.log(`   ✅ ${createdDeliverables.length} deliverables créés\n`)

  // ═══════════════════════════════════════════════════════════════
  // 3. SUBSCRIPTIONS (10)
  // ═══════════════════════════════════════════════════════════════
  console.log('3/6 — subscriptions (10 abonnements)...')
  const subscriptionNames = [
    'Licence CMS Pro', 'Maintenance LED annuelle', 'Support premium 24/7',
    'Hébergement cloud', 'Sauvegarde automatique', 'Monitoring 24/7',
    'Formation continue', 'Revolut Business', 'Licence Adobe CC', 'API Gateway Pro'
  ]

  const subscriptionItems = subscriptionNames.map(name => ({
    name,
    owner_company: randomPick(OC_NAMES),
    amount: randomAmount(50, 5000),
    billing_cycle: randomPick(['monthly', 'monthly', 'quarterly', 'annual']),
    status: randomPick(['active', 'active', 'active', 'paused', 'cancelled']),
    start_date: randomDate(365, 30),
    project_id: projectIds.length > 0 ? randomPick(projectIds) : null
  }))

  const createdSubscriptions = await createItems('subscriptions', subscriptionItems)
  console.log(`   ✅ ${createdSubscriptions.length} subscriptions créées\n`)

  // ═══════════════════════════════════════════════════════════════
  // 4. EXPENSES (25)
  // ═══════════════════════════════════════════════════════════════
  console.log('4/6 — expenses (25 dépenses)...')
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin']

  const expenseItems = Array.from({ length: 25 }, () => ({
    owner_company: randomPick(OC_NAMES),
    description: `${randomPick(EXPENSE_CATEGORIES)} — ${randomPick(months)} 2026`,
    amount: randomAmount(200, 15000),
    category: randomPick(EXPENSE_CATEGORIES),
    date: randomDate(90)
  }))

  const createdExpenses = await createItems('expenses', expenseItems)
  console.log(`   ✅ ${createdExpenses.length} expenses créées\n`)

  // ═══════════════════════════════════════════════════════════════
  // 5. CGV VERSIONS (2) — linked to HYPERVISUAL via owner_company_id
  // ═══════════════════════════════════════════════════════════════
  console.log('5/6 — cgv_versions (2 versions CGV HYPERVISUAL)...')
  const hvId = OC_MAP['HYPERVISUAL']

  const cgvItems = [
    {
      owner_company_id: hvId,
      version: 'v1.0',
      title: 'CGV HYPERVISUAL — Version 1.0',
      content_html: '<h1>Conditions Générales de Vente — HYPERVISUAL Studio Créatif SA</h1><p>Les présentes CGV régissent les relations contractuelles entre HYPERVISUAL Studio Créatif SA et ses clients.</p><h2>1. Objet</h2><p>Les présentes CGV définissent les droits et obligations des parties dans le cadre de la vente de produits et services d\'affichage numérique et LED.</p><h2>2. Prix</h2><p>Les prix sont indiqués en CHF, TVA 8.1% incluse sauf mention contraire.</p><h2>3. Paiement</h2><p>Sauf accord contraire, les factures sont payables à 30 jours.</p><h2>4. Livraison</h2><p>Les délais de livraison sont indicatifs. Tout retard ne peut donner lieu à indemnisation.</p>',
      summary: 'CGV standard pour prestations digital signage et LED.',
      effective_date: '2025-01-01',
      status: 'archived',
      changelog: 'Version initiale.'
    },
    {
      owner_company_id: hvId,
      version: 'v2.0',
      title: 'CGV HYPERVISUAL — Version 2.0 (en vigueur)',
      content_html: '<h1>Conditions Générales de Vente — HYPERVISUAL Studio Créatif SA</h1><p>Version 2.0 — En vigueur depuis le 1er janvier 2026.</p><h2>1. Objet</h2><p>Les présentes CGV régissent les prestations de digital signage, solutions LED, et services associés.</p><h2>2. Prix et TVA</h2><p>Prix en CHF, TVA 8.1% selon législation suisse 2025. Acompte de 30% à la commande.</p><h2>3. Paiement</h2><p>Factures payables à 30 jours net. Intérêts moratoires de 5% en cas de retard.</p><h2>4. Garantie</h2><p>Garantie matériel : 24 mois. Garantie logiciel : mises à jour incluses pendant 12 mois.</p><h2>5. Responsabilité</h2><p>La responsabilité de HYPERVISUAL est limitée au montant de la prestation facturée.</p><h2>6. Droit applicable</h2><p>Droit suisse. For juridique : Fribourg.</p>',
      summary: 'CGV v2.0 avec nouvelles clauses garantie et acompte 30%.',
      effective_date: '2026-01-01',
      status: 'active',
      changelog: 'Ajout clauses garantie 24 mois matériel, acompte 30%, intérêts moratoires 5%.'
    }
  ]

  const createdCGV = await createItems('cgv_versions', cgvItems)
  console.log(`   ✅ ${createdCGV.length} cgv_versions créées\n`)

  // ═══════════════════════════════════════════════════════════════
  // 6. COMPLIANCE (8) — collection is "compliance" not "compliance_records"
  // ═══════════════════════════════════════════════════════════════
  console.log('6/6 — compliance (8 audits conformité)...')

  // First clear existing ones
  try {
    const existing = await api('GET', '/items/compliance?fields=id&limit=-1')
    if (existing && existing.length > 0) {
      await api('DELETE', '/items/compliance', existing.map(e => e.id))
      console.log(`   🗑  ${existing.length} supprimés`)
    }
  } catch { /* ignore */ }

  const complianceItems = [
    {
      owner_company: 'HYPERVISUAL',
      title: 'Audit RGPD 2025',
      compliance_type: 'gdpr',
      status: 'compliant',
      last_audit_date: '2025-06-15',
      next_audit_date: '2026-06-15',
      risk_level: 'low',
      description: 'Audit complet de conformité RGPD. Mesures techniques et organisationnelles vérifiées et conformes.'
    },
    {
      owner_company: 'DAINAMICS',
      title: 'Audit sécurité IT 2025',
      compliance_type: 'security',
      status: 'compliant',
      last_audit_date: '2025-09-01',
      next_audit_date: '2026-09-01',
      risk_level: 'low',
      description: 'Pentest externe réalisé par SecuSwiss SA. Toutes les vulnérabilités critiques corrigées.'
    },
    {
      owner_company: 'LEXAIA',
      title: 'Conformité nLPD (nouvelle Loi Protection Données)',
      compliance_type: 'data_protection',
      status: 'compliant',
      last_audit_date: '2025-07-20',
      next_audit_date: '2026-07-20',
      risk_level: 'low',
      description: 'Mise en conformité avec la nLPD entrée en vigueur le 1er septembre 2023.'
    },
    {
      owner_company: 'ENKI REALTY',
      title: 'Audit anti-blanchiment (LBA)',
      compliance_type: 'aml',
      status: 'pending',
      last_audit_date: '2025-03-01',
      next_audit_date: '2026-03-01',
      risk_level: 'medium',
      description: 'Audit LBA obligatoire pour les transactions immobilières. Programmé Q1 2026.'
    },
    {
      owner_company: 'TAKEOUT',
      title: 'Hygiène et sécurité alimentaire HACCP',
      compliance_type: 'food_safety',
      status: 'compliant',
      last_audit_date: '2025-11-10',
      next_audit_date: '2026-11-10',
      risk_level: 'low',
      description: 'Certification HACCP valide. Inspection cantonale passée avec succès.'
    },
    {
      owner_company: 'HYPERVISUAL',
      title: 'Certification ISO 27001',
      compliance_type: 'iso27001',
      status: 'in_progress',
      last_audit_date: '2026-01-15',
      next_audit_date: '2027-01-15',
      risk_level: 'medium',
      description: 'Processus de certification ISO 27001 en cours. Gap analysis terminée.'
    },
    {
      owner_company: 'DAINAMICS',
      title: 'Conformité IA Act (EU AI Regulation)',
      compliance_type: 'ai_regulation',
      status: 'pending',
      last_audit_date: null,
      next_audit_date: '2026-08-01',
      risk_level: 'high',
      description: 'Évaluation des systèmes IA selon la classification de risque EU AI Act.'
    },
    {
      owner_company: 'LEXAIA',
      title: 'Audit secret professionnel avocat',
      compliance_type: 'professional_secrecy',
      status: 'compliant',
      last_audit_date: '2025-12-01',
      next_audit_date: '2026-12-01',
      risk_level: 'low',
      description: 'Vérification annuelle des procédures de protection du secret professionnel.'
    }
  ]

  const createdCompliance = await createItems('compliance', complianceItems)
  console.log(`   ✅ ${createdCompliance.length} compliance créés\n`)

  // ─── FINAL REPORT ─────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const totalRecords = Object.values(STATS).reduce((sum, n) => sum + n, 0)

  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║               SEED FIX TERMINÉ                         ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')
  console.log('  Collection          │ Records')
  console.log('  ────────────────────┼─────────')
  for (const [collection, count] of Object.entries(STATS).sort()) {
    console.log(`  ${collection.padEnd(20)} │ ${count}`)
  }
  console.log('  ────────────────────┼─────────')
  console.log(`  TOTAL               │ ${totalRecords}`)
  console.log(`\n  Temps: ${elapsed}s\n`)
}

main().catch(err => {
  console.error('\n❌ ERREUR FATALE:', err.message)
  process.exit(1)
})
