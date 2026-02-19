# PROMPT PHASE D — PORTAIL PRESTATAIRE FONCTIONNEL
> Créé le 2026-02-19 | Stories : D-01 à D-07
> Prérequis : Phases B+C terminées (commits 5926787, f488d28)

Tu es Claude Code. Projet : Directus Unified Platform
Repo : /Users/jean-mariedelaunay/directus-unified-platform/
Directus : http://localhost:8055 (admin@hypervisual.ch / admin)
Frontend : src/frontend/ (port 5173)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ÉTAPE 0 — SKILLS OBLIGATOIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 0a. Skill-router EN PREMIER (scan des 939 skills)
1. .claude/skills/skill-router/SKILL.md
2. .claude/skills/skill-router/references/REGISTRY.md
3. Catégories pertinentes pour Phase D :
   Frontend (portail React), API (Directus), Security (auth prestataire),
   Multi-portal (isolation données), Forms (soumission devis + upload PDF)
4. Lire les fichiers catégories :
   .claude/skills/skill-router/references/categories/frontend.md
   .claude/skills/skill-router/references/categories/api.md
   .claude/skills/skill-router/references/categories/security.md
5. Choisir les 2-3 skills les plus adaptés, lire leurs SKILL.md complets

### 0b. Skills projet (obligatoires après 0a)
.claude/skills/multi-portal-architecture/SKILL.md
.claude/skills/directus-api-patterns/SKILL.md

### 0c. Vérifier champs Directus via MCP AVANT de coder
- directus:get_collection_items("providers", limit=1)
- directus:get_collection_items("orders", limit=1)
- directus:get_collection_items("proposals", limit=1)  ← vérifier champs manquants
JAMAIS inventer un champ. Fichier introuvable → STOP et signaler.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CONTEXTE PHASE D
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases B+C terminées. Cycle vente CEO + portail client opérationnels.
Phase D = portail prestataire fonctionnel.
Portail prestataire existant : src/frontend/src/portals/prestataire/
Objectif : un prestataire HYPERVISUAL (technicien LED, installateur, livreur)
reçoit une demande de devis, soumet son offre, voit son bon de commande
une fois le projet activé, et suit le statut de son paiement.
Tout ça sans email manuel d'HYPERVISUAL.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CHAMPS DIRECTUS VÉRIFIÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**proposals** :
  id, created_at, updated_at, name, description, status, owner_company
  Statuts : draft | submitted | accepted | rejected
  ⚠️ Vérifier les champs manquants via MCP (provider_id, project_id, amount, etc.)

**supplier_invoices** :
  id, invoice_number, supplier_name, amount, status, date_created,
  project_id, provider_id, approved_by, owner_company, owner_company_id
  Statuts : pending | approved | paid | rejected | cancelled

**payments** :
  id, created_at, updated_at, amount, currency, method, status,
  project_id, invoice_id, owner_company, payment_date, owner_company_id,
  bank_transaction_id

**projects** :
  id, name, description, status, start_date, end_date, budget,
  client_id, main_provider_id, owner_company, date_created

**providers** : ⚠️ vérifier champs via MCP (collection vide)
**orders** : ⚠️ vérifier champs via MCP (collection vide)

**people** :
  id, first_name, last_name, email, phone, position, company_id, owner_company

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STORIES À IMPLÉMENTER (ordre strict)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### D-01 · Auth portail prestataire
Fichiers à créer :
  src/frontend/src/portals/prestataire/ProviderAuth.jsx
  src/frontend/src/portals/prestataire/hooks/useProviderAuth.js
  src/frontend/src/portals/prestataire/ProviderPortalGuard.jsx

Même pattern que Phase C useClientAuth — adapter pour prestataire :
- Login email → token localStorage → fetch people (provider)
- Hook useProviderAuth : { provider, isAuthenticated, isLoading, logout }
- Guard sur /prestataire/*
- App.jsx : /prestataire/login public + /prestataire/* guarded

---

### D-02 · Dashboard prestataire
Fichier : src/frontend/src/portals/prestataire/ProviderDashboard.jsx

Tout filtré par provider_id = provider.id (ou main_provider_id dans projects).

1. Header : "Bonjour [prénom] — Espace prestataire HYPERVISUAL"
2. 4 cartes statut :
   - Demandes de devis en attente (count proposals status=pending)
   - Projets en cours (projects main_provider_id=provider.id, status=active)
   - Factures à soumettre (projets actifs sans supplier_invoice)
   - Paiements en attente (montant CHF payments status=pending)
3. Section "À faire" (prioritaire) :
   - Demandes non répondues → "Soumettre mon offre"
   - Projets actifs sans facture → "Soumettre ma facture"

---

### D-03 · Réception demande de devis + soumission offre
Fichier à créer : src/frontend/src/portals/prestataire/QuoteRequests.jsx

1. Liste des demandes (filtre provider_id, status=pending/submitted)
2. Modal détail → formulaire offre :
   - Montant HT (CHF), TVA 8.1% auto, TTC
   - Délai d'intervention + notes
   - Bouton "Soumettre mon offre"
3. PATCH proposals : status=submitted + champs disponibles
   Toast : "Offre soumise ✓ — HYPERVISUAL vous contactera sous 24h"

---

### D-04 · Bons de commande
Fichier à créer : src/frontend/src/portals/prestataire/PurchaseOrders.jsx

1. Projets actifs où main_provider_id = provider.id
2. Nom + dates + description mission + montant commandé
3. Bouton "Confirmer réception BC"
4. Utiliser orders si schéma adapté (vérifier 0c), sinon projects

---

### D-05 · Soumission facture fournisseur + suivi paiement
Fichier à créer : src/frontend/src/portals/prestataire/ProviderInvoices.jsx

1. Liste supplier_invoices (filtre provider_id) avec badges statut
2. Formulaire soumission :
   - N° facture, montant HT + TVA + TTC, projet associé
   - Upload PDF via Directus files API (POST /files FormData)
   - POST supplier_invoices avec vrais champs
3. Suivi paiement :
   - approved → "En cours Revolut"
   - paid → date + montant

---

### D-06 · Navigation portail prestataire
Fichier : layout existant dans src/frontend/src/portals/prestataire/
  (trouver le vrai nom)

Sidebar 4 items avec accent violet/indigo (différent du client emerald) :
- 🏠 Tableau de bord → /prestataire/dashboard
- 📋 Demandes de devis → /prestataire/quotes
- 📦 Bons de commande → /prestataire/orders
- 🧾 Mes factures → /prestataire/invoices

---

### D-07 · SuperAdmin — Gestion prestataires
Fichier : src/frontend/src/portals/superadmin/modules/providers/ProvidersModule.jsx

1. Liste prestataires
2. Créer demande de devis (POST proposals) :
   - Sélectionner prestataire + projet + décrire mission
3. Voir offres soumises :
   - Bouton "Accepter" → proposal=accepted + project.main_provider_id=[id]
   - Bouton "Refuser" → proposal=rejected
4. AlertsWidget : badge si nouvelle offre soumise

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CONTRAINTES TECHNIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Auth : pattern identique Phase C (copier useClientAuth → adapter)
- Filtrage provider_id SYSTÉMATIQUE
- Upload PDF D-05 : POST /files FormData → récupérer id → stocker dans supplier_invoices
- Montants : Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' })
- Dates : DD.MM.YYYY (fr-CH)
- Design : glassmorphism cohérent, accent violet/indigo (≠ client emerald)
- Tout depuis Directus, aucune donnée mockée
- try/catch + toast sur tous les appels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ORDRE D'EXÉCUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Lire tous les skills (0a → 0b → 0c)
2. Vérifier providers + orders + proposals via MCP
3. D-01 auth → D-06 layout → D-02 dashboard
4. D-03 demandes devis → D-04 bons commande → D-05 factures
5. D-07 SuperAdmin gestion prestataires
6. App.jsx routes /prestataire/*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ÉTAPE FINALE OBLIGATOIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. git add -A
2. git commit --no-verify -m "feat(phase-d): portail prestataire fonctionnel

   - D-01: auth useProviderAuth + guard
   - D-02: dashboard prestataire connecté
   - D-03: demandes devis + soumission offre
   - D-04: bons de commande
   - D-05: factures fournisseur + upload PDF
   - D-06: navigation portail prestataire
   - D-07: SuperAdmin gestion prestataires"
3. git push
4. ROADMAP.md → D-01 à D-07 : [ ] → [V] + date
5. Reporter résumé fichiers/lignes/découvertes
