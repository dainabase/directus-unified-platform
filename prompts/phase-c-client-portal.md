# PROMPT PHASE C — PORTAIL CLIENT FONCTIONNEL
> Créé le 2026-02-19 | Stories : C-00 à C-07
> Prérequis : Phase B terminée (commit 5926787)

Tu es Claude Code. Tu travailles sur le projet Directus Unified Platform.
Repo : /Users/jean-mariedelaunay/directus-unified-platform/
Directus : http://localhost:8055 (admin@hypervisual.ch / admin)
Frontend React : src/frontend/ (port 5173 via pnpm dev)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ÉTAPE 0 — SKILLS OBLIGATOIRES (lire AVANT toute ligne de code)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 0a. Skill-router EN PREMIER (scan des 939 skills disponibles)

Lire dans cet ordre :
1. .claude/skills/skill-router/SKILL.md
2. .claude/skills/skill-router/references/REGISTRY.md
3. Identifier les catégories pertinentes pour Phase C :
   Frontend (portail React), API (Directus queries), Security (auth token client),
   Multi-portal (isolation données), Swiss compliance (CGV, signatures)
4. Lire les fichiers catégories correspondants :
   .claude/skills/skill-router/references/categories/frontend.md
   .claude/skills/skill-router/references/categories/api.md
   .claude/skills/skill-router/references/categories/security.md
5. Dans chaque catégorie, identifier les 2-3 skills les plus adaptés
   à ce travail précis (portail client, auth token, signature CGV, chat)
6. Lire le SKILL.md complet de chaque skill retenu AVANT de coder

→ Ce processus garantit que les 939 skills sont considérés,
  pas seulement les 4-5 connus d'habitude.

### 0b. Skills projet (toujours obligatoires — lire après 0a)

.claude/skills/multi-portal-architecture/SKILL.md
.claude/skills/swiss-compliance-engine/SKILL.md
.claude/skills/directus-api-patterns/SKILL.md

### 0c. Vérifier les champs Directus via MCP AVANT de coder

Pour les collections vides dont on ne connaît pas le schéma exact :
- directus:get_collection_items("cgv_acceptances", limit=1)
- directus:get_collection_items("signature_logs", limit=1)
- directus:get_collection_items("comments", limit=1)

RÈGLE ABSOLUE : JAMAIS supposer un nom de champ.
Si un fichier skill est introuvable → STOP et signaler l'erreur, ne pas deviner.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CONTEXTE PHASE C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase B (cycle vente SuperAdmin) est terminée — commit 5926787.
Phase C = rendre le portail client FONCTIONNEL.
Portail client existant : src/frontend/src/portals/client/
Objectif : un client HYPERVISUAL peut, depuis son portail, signer son devis,
voir ses projets en temps réel, uploader des documents, payer ses factures,
et communiquer avec HYPERVISUAL. Sans formation. Sans appel téléphonique.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CHAMPS DIRECTUS VÉRIFIÉS (NE PAS INVENTER D'AUTRES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**quotes** : id, quote_number, name, description, status, owner_company,
  project_type, subtotal, tax_rate, tax_amount, total, currency,
  sent_at, viewed_at, signed_at, valid_until, is_signed, cgv_accepted,
  cgv_version_id, cgv_acceptance_id, deposit_percentage, deposit_amount,
  deposit_invoice_id, deposit_paid, deposit_paid_at, project_id,
  contact_id, owner_company_id, lead_id, company_id, created_at, updated_at
  Statuts : draft | sent | viewed | signed | rejected | expired

**projects** : id, name, description, status, start_date, end_date,
  budget, client_id, main_provider_id, project_manager_id, sales_person_id,
  company_id, owner_company, date_created
  Statuts : pending | active | on_hold | completed | cancelled

**deliverables** : id, title, description, status, due_date, project_id,
  assigned_to, reviewed_by, parent_task_id, owner_company
  Statuts : pending | in_progress | completed | cancelled

**client_invoices** : id, invoice_number, client_name, amount, status,
  date_created, project_id, company_id, contact_id, owner_company, owner_company_id
  Statuts : draft | pending | paid | overdue | cancelled
  ⚠️ FORMAT NUMÉRO : INV-YYYY-NN (ex: INV-2026-01) — corriger dans InvoiceGenerator.jsx

**client_portal_accounts** : id, contact_id, portal_domain

**cgv_versions** : id, owner_company_id, version, title, content_html,
  content_pdf, summary, effective_date, expiry_date, status, changelog, sort
  Statuts : draft | active | archived

**cgv_acceptances** : ⚠️ vérifier les vrais champs via MCP (collection vide)
**signature_logs** : ⚠️ vérifier les vrais champs via MCP (collection vide)
**comments** : ⚠️ vérifier les vrais champs via MCP (collection vide)

**people** : id, first_name, last_name, email, phone, position,
  company_id, manager_id, department_id, team_id, role_id,
  is_employee, employee_company, owner_company

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STORIES À IMPLÉMENTER (ordre strict)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### C-00 · FIX numéro facture (AVANT TOUT)
Fichier : src/frontend/src/portals/superadmin/modules/invoices/InvoiceGenerator.jsx
Format : FA-YYYYMM-NNN → INV-YYYY-NN
Exemple : INV-2026-01, INV-2026-02
La séquence NN = count des factures existantes + 1.

---

### C-01 · Authentification portail client (magic link token)
Fichier à créer : src/frontend/src/portals/client/ClientAuth.jsx
Fichier à créer : src/frontend/src/portals/client/hooks/useClientAuth.js
Fichier à créer : src/frontend/src/portals/client/ClientPortalGuard.jsx

Le portail client n'a PAS de mot de passe classique.
Fonctionnement : email → token localStorage → accès aux données du client.

1. ClientAuth.jsx :
   - Champ email + bouton "Recevoir mon lien d'accès"
   - Mock Phase C : si email existe dans `people`, créer token localStorage
     et rediriger vers /client/dashboard
   - Page "Lien envoyé — vérifiez votre email" (vraie email = Phase E)
   - Design glassmorphism cohérent

2. useClientAuth.js :
   - Lit token depuis localStorage
   - Expose : { client, isLoading, isAuthenticated, logout }
   - client = objet people fetché depuis Directus
   - Token invalide/absent → redirect /client/login

3. ClientPortalGuard.jsx :
   - Wrap les routes protégées du portail client
   - Redirect /client/login si non authentifié

4. App.jsx : ajouter routes /client/login et guard sur /client/*

---

### C-02 · Dashboard client — Vue d'ensemble
Fichier : src/frontend/src/portals/client/ClientDashboard.jsx

Tout filtré par contact_id = client.id (RÈGLE ABSOLUE).

1. Header : "Bonjour [prénom] — Bienvenue sur votre espace HYPERVISUAL"
2. 4 cartes statut :
   - Devis en attente de signature (count)
   - Projets actifs (count)
   - Factures à régler (count + montant CHF)
   - Prochaine échéance (date la plus proche)
3. Section "Action requise" (rouge/orange si non vide) :
   - Devis envoyés non signés → "Signer maintenant"
   - Factures overdue → "Payer"
4. Timeline du projet le plus récent :
   Progression deliverables (completed/total), barre %

---

### C-03 · Signature de devis en ligne (CGV intégrée)
Fichier à créer : src/frontend/src/portals/client/QuoteSignature.jsx

Flow :
1. Liste des devis du client (filtre contact_id)
2. Clic → modal avec :
   - Résumé lignes + TVA 8.1% + total CHF
   - CGV depuis cgv_versions (status='active', owner_company='HYPERVISUAL')
   - Checkbox "J'ai lu et j'accepte les CGV"
   - Champ texte "Tapez votre nom complet pour signer"
     (signature simple CO Art. 14 — DocuSeal = Phase H)
   - Bouton "Signer et accepter"
3. À la signature :
   a. PATCH quotes : is_signed=true, signed_at=now(), status='signed',
      cgv_accepted=true, cgv_version_id=[id CGV active]
   b. POST cgv_acceptances (vérifier champs MCP avant)
   c. POST signature_logs (vérifier champs MCP avant)
   d. Toast : "Devis signé ✓ — Vous recevrez votre facture d'acompte"

⚠️ Aucune CGV active trouvée → message "CGV en cours de mise à jour"
   + désactiver bouton signature.

---

### C-04 · Suivi de projet temps réel
Fichier à créer : src/frontend/src/portals/client/ProjectTracking.jsx
Route : /client/projects/:id

1. Nom projet + badge statut coloré + dates (DD.MM.YYYY fr-CH)
2. Barre progression : deliverables completed / total en %
3. Liste deliverables :
   - pending (gris) / in_progress (bleu) / completed (vert)
   - title + description + due_date
   - PAS assigned_to ni champs internes CEO
4. Timeline activités si disponible

---

### C-05 · Historique factures + impression
Fichier à créer : src/frontend/src/portals/client/ClientInvoices.jsx
Route : /client/invoices

1. Tableau : N° facture, date, montant CHF, badge statut
   - pending → jaune | paid → vert | overdue → rouge
2. "Télécharger PDF" → modale données facture + bouton window.print()
   (vrai PDF = Phase I)
3. Total outstanding en haut (pending + overdue)
4. Facture overdue → bouton "Contacter HYPERVISUAL" → /client/messages

---

### C-06 · Messagerie simple client ↔ HYPERVISUAL
Fichier à créer : src/frontend/src/portals/client/ClientMessages.jsx
Route : /client/messages

⚠️ Vérifier les vrais champs de `comments` via MCP AVANT de coder.
Si les champs ne permettent pas le cas d'usage → signaler à Jean,
ne pas inventer de champs inexistants.

1. Afficher messages filtrés (contact_id ou project_id)
2. Composer + envoyer (POST comments avec vrais champs)
3. Messages client (droite) vs HYPERVISUAL (gauche)
4. Design chat glassmorphism

---

### C-07 · Navigation portail client
Fichier : src/frontend/src/portals/client/ClientLayout.jsx
  (trouver le vrai nom du fichier layout existant)

Sidebar 5 items :
- 🏠 Tableau de bord → /client/dashboard
- 📄 Mes devis → /client/quotes
- 📁 Mes projets → /client/projects
- 🧾 Mes factures → /client/invoices
- 💬 Messages → /client/messages

Header : logo HYPERVISUAL + prénom client + bouton logout

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## CONTRAINTES TECHNIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- React 18 + hooks uniquement
- Montants : Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' })
- Dates : format DD.MM.YYYY (fr-CH locale)
- Design : glassmorphism cohérent SuperAdmin (backdrop-blur, transparences)
- Filtrage contact_id SYSTÉMATIQUE — un client ne voit JAMAIS les données d'un autre
- Pas de données mockées — tout depuis Directus http://localhost:8055/items/[collection]
- Gestion erreurs sur tous les appels API (try/catch + toast)
- Loading states sur tous les fetches

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ORDRE D'EXÉCUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Lire tous les skills (ÉTAPE 0a → 0b → 0c)
2. Vérifier champs Directus : cgv_acceptances, signature_logs, comments
3. C-00 : fix format numéro facture
4. C-01 : auth + hook + guard
5. C-07 : layout/navigation (base de tout)
6. C-02 : dashboard client
7. C-03 : signature devis (la plus critique)
8. C-04 : suivi projet
9. C-05 : factures
10. C-06 : messagerie
11. App.jsx : toutes les nouvelles routes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ÉTAPE FINALE OBLIGATOIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. git add -A
2. git commit --no-verify -m "feat(phase-c): portail client fonctionnel

   - C-00: format facture INV-YYYY-NN
   - C-01: auth magic link + useClientAuth + ClientPortalGuard
   - C-02: dashboard client connecté Directus
   - C-03: signature devis en ligne avec CGV
   - C-04: suivi projet temps réel
   - C-05: historique factures + print
   - C-06: messagerie client Directus
   - C-07: navigation portail client"
3. git push
4. Ouvrir ROADMAP.md → passer C-00 à C-07 de [ ] → [V] avec date YYYY-MM-DD
5. Reporter un résumé : fichiers créés/modifiés, lignes, découvertes importantes
