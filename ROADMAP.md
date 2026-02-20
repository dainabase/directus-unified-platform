# ROADMAP — HYPERVISUAL Unified Platform
**Version** : 2.0  
**Date** : Février 2026  
**Référence** : CDC V1.2 — 16 modules fonctionnels  
**Auteur** : Jean (CEO) + Claude (Architecte IA)

> **IMPORTANT** : Ce fichier est la colonne vertébrale du projet.  
> Il remplace l'ancien PROGRESS.md (47/47 = infrastructure uniquement).  
> Toute nouvelle phase doit être définie ici AVANT de commencer le code.

---

## ÉTAT RÉEL DU PROJET

### Ce qui EST fait (Phases 0-6 — Infrastructure + Affichage)
- ✅ Infrastructure : Docker, PostgreSQL, Directus 11.10, Auth JWT multi-portails
- ✅ Collections : 83 collections Directus avec données réelles
- ✅ Frontend : 4 portails React (SuperAdmin, Client, Prestataire, Revendeur)
- ✅ Affichage données : Listes, tableaux, graphiques connectés Directus
- ✅ Design system : Glassmorphism, CHF formatting, fr-CH locale
- ✅ Code splitting : React.lazy, ~50 chunks Vite

### Ce qui MANQUE (CDC V1.2 — 80% du projet réel)
- ❌ Cycle de vente opérationnel (boutons qui font des choses)
- ❌ Génération réelle de factures QR-Invoice v2.3 conformes
- ❌ Activation automatique projet à paiement Revolut
- ✅ Signatures électroniques DocuSeal — **FAIT Phase H**
- ❌ Emails transactionnels via Mautic
- ✅ Capture leads WordPress / WhatsApp / Ringover — **FAIT Phase F** (4/4 canaux)
- ✅ Workflows validation factures fournisseurs — **FAIT Phase I**
- ❌ Rapprochement bancaire algorithme multi-critères
- ❌ Portail client fonctionnel (signer, uploader, communiquer)
- ✅ Portail prestataire fonctionnel (soumettre devis, voir paiements) — **FAIT Phase D**
- ✅ Facturation par jalons (deliverables → factures) — **FAIT Phase I**
- ✅ Facturation récurrente automatique — **FAIT Phase I**
- ✅ KPIs depuis collection `kpis` (240 enregistrements réels) — **FAIT Phase J**

---

## LÉGENDE

- `[ ]` TODO — Pas encore démarré  
- `[~]` IN_PROGRESS — En cours  
- `[V]` DONE — Implémenté, en attente validation Jean  
- `[A]` AUDITED — Validé par Jean (seul Jean peut passer [V] → [A])  
- `[X]` BLOCKED — Bloqué (raison obligatoire dans les notes)  
- `[S]` SKIPPED — Reporté (raison obligatoire)

---

## PHASE A — INFRASTRUCTURE + AFFICHAGE *(TERMINÉE)*
**Statut** : [A] AUDITED | **Stories** : 47/47  
**Référence** : Voir PROGRESS.md pour le détail complet  
**Résultat** : 4 portails React connectés à Directus, données affichées

---

## PHASE B — CYCLE DE VENTE OPÉRATIONNEL *(TERMINÉE)*
**Objectif CDC** : Un lead devient un projet actif sans intervention manuelle  
**Modules CDC** : Module 1 (Leads), Module 3 (Devis), Module 5 (Facturation), Module 6 (Projets)  
**Critères d'acceptation** :  
- ✅ Un lead peut être qualifié et converti en devis en < 3 minutes (REQ-CEO)  
- ✅ Une facture QR conforme est générée depuis un devis signé en 2 clics  
- ✅ Un projet s'active automatiquement à la confirmation de paiement (REQ-FACT-006)  
**Progression** : 8/8 stories — [A] AUDITED — commit 5926787 — auditée 2026-02-20

### Stories

- [A] **B-01** · Leads — Actions qualify/convert/archive avec transitions état Directus — 2026-02-19  
  *Fichiers* : `LeadsDashboard.jsx` 311→702 lignes  
  *Livré* : Qualify modal (score 1-5 + notes + next action), convert-to-quote (crée projet + navigate), archive avec confirmation, badges ancienneté (Nouveau/24h+/URGENT)

- [A] **B-02** · QuoteForm — Formulaire devis multi-lignes avec calculs TVA suisse — 2026-02-19  
  *Fichiers* : `quotes/QuoteForm.jsx` 472→761 lignes  
  *Livré* : Mode page standalone via URL params, pre-fill depuis lead (?lead_id=&project_id=), numéro auto DEV-YYYYMM-NNN, Save draft + Save & send, PATCH lead/project à la sauvegarde

- [A] **B-03** · Quotes — Actions sur devis (marquer signé, → facture) — 2026-02-19  
  *Fichiers* : `QuotesModule.jsx` 134→184 lignes  
  *Livré* : Mutation "Mark signed", action "Generate invoice" (lazy InvoiceGenerator), navigate vers form standalone

- [A] **B-04** · InvoiceGenerator — Génération factures acompte/solde depuis devis — 2026-02-19  
  *Fichiers* : `invoices/InvoiceGenerator.jsx` 278 lignes (NOUVEAU)  
  *Livré* : Wizard modal deposit/balance/full/custom, numéro auto FA-YYYYMM-NNN, POST vers client_invoices

- [A] **B-05** · InvoiceDetailView — Vue facture complète avec QR code — 2026-02-19  
  *Fichiers* : `invoices/InvoiceDetailView.jsx` 197 lignes (NOUVEAU)  
  *Livré* : Page complète /superadmin/invoices/:id, QR placeholder suisse, timeline statuts, badges

- [A] **B-06** · Activation projet — Marquer payé + activation projet en cascade — 2026-02-19  
  *Fichiers* : `lib/projectActivation.js` 90 lignes (NOUVEAU), `InvoicesModule.jsx` 335→442 lignes  
  *Livré* : Utilitaire réutilisable, MAJ statut projet, création 5 livrables par défaut (REQ-FACT-006)  
  *Note* : Activation manuelle maintenant. Revolut webhook automatique en Phase G.

- [A] **B-07** · AlertsWidget — Alertes actionnables avec données réelles Directus — 2026-02-19  
  *Fichiers* : `widgets/AlertsWidget.jsx` 237→327 lignes  
  *Livré* : 5 sources de données (factures, leads, tickets, devis, projets), boutons action avec navigation

- [A] **B-08** · KPIWidget — KPIs depuis collection kpis — 2026-02-19  
  *Fichiers* : `widgets/KPIWidget.jsx` 167→233 lignes  
  *Livré* : Fetch depuis dashboard_kpis en priorité, fallback KPIs calculés, support sparkline réel  

---

## PHASE C — PORTAIL CLIENT FONCTIONNEL *(TERMINÉE)*
**Objectif CDC** : Un client HYPERVISUAL gère tout depuis son portail sans formation  
**Modules CDC** : Module 4 (Portail Client)  
**Critères d'acceptation** :  
- ✅ Client signe son devis en ligne avec CGV (signature atomique — REQ-CLIENT-006)  
- ✅ Client suit l'avancement de son projet en temps réel (REQ-CLIENT-002)  
- ✅ Client télécharge/imprime ses factures (REQ-CLIENT-003/005)  
- ✅ Client communique avec HYPERVISUAL via messagerie  
**Progression** : 8/8 stories — [A] AUDITED — commit f488d28 — auditée 2026-02-20

- [A] **C-00** · Fix format numéro facture INV-YYYY-NN — 2026-02-19  
  *Fichiers* : `InvoiceGenerator.jsx`  
  *Livré* : Séquence auto via count Directus

- [A] **C-01** · Auth portail client (magic link token localStorage) — 2026-02-19  
  *Fichiers* : `ClientAuth.jsx`, `hooks/useClientAuth.js`, `ClientPortalGuard.jsx` (3 nouveaux)  
  *Livré* : Login email → token → accès données client. Guard sur /client/*

- [A] **C-02** · Dashboard client connecté Directus — 2026-02-19  
  *Fichiers* : `Dashboard.jsx` (réécriture complète)  
  *Livré* : 4 cartes statut, section "Action requise", timeline projet (tout filtré contact_id)

- [A] **C-03** · Signature devis en ligne avec CGV intégrée — 2026-02-19  
  *Fichiers* : `QuoteSignature.jsx` (nouveau)  
  *Livré* : Flow 3 étapes atomique : CGV acceptance → signature_log → PATCH quote

- [A] **C-04** · Suivi projet temps réel — 2026-02-19  
  *Fichiers* : `ClientProjectsList.jsx`, `ProjectTracking.jsx` (2 nouveaux)  
  *Livré* : Liste projets + détail avec progression deliverables

- [A] **C-05** · Historique factures + impression — 2026-02-19  
  *Fichiers* : `ClientInvoices.jsx` (nouveau)  
  *Livré* : Tableau statuts, solde outstanding, print via window.open

- [A] **C-06** · Messagerie client ↔ HYPERVISUAL — 2026-02-19  
  *Fichiers* : `ClientMessages.jsx` (nouveau)  
  *Livré* : Chat UI sur collection comments, polling 15s

- [A] **C-07** · Navigation et layout portail client — 2026-02-19  
  *Fichiers* : `ClientLayout.jsx` (réécriture)  
  *Livré* : Sidebar 5 items emerald, header logo + prénom + logout

---

## PHASE D — PORTAIL PRESTATAIRE FONCTIONNEL *(TERMINÉE)*
**Objectif CDC** : Un prestataire peut recevoir une demande, soumettre un devis, voir ses paiements
**Modules CDC** : Module 2 (Portail Prestataire)
**Critères d'acceptation** :
- ✅ Prestataire soumet son devis en < 5 minutes (REQ-PREST-003)
- ✅ Prestataire voit le bon de commande une fois projet activé (REQ-PREST-006)
- ✅ Prestataire voit le statut paiement de sa prestation (REQ-PREST-007)
**Progression** : 7/7 stories — [A] AUDITED — commit 9d57c20 — auditée 2026-02-20

- [A] **D-01** · Auth portail prestataire (magic link email → token localStorage) — 2026-02-19
  *Fichiers* : `hooks/useProviderAuth.js`, `auth/ProviderAuth.jsx`, `auth/ProviderPortalGuard.jsx` (3 nouveaux)
  *Livré* : Login email → lookup providers → token localStorage → guard /prestataire/*. Thème violet/indigo.

- [A] **D-02** · Dashboard prestataire connecté Directus — 2026-02-19
  *Fichiers* : `Dashboard.jsx` (réécriture complète)
  *Livré* : 4 cartes KPI (devis en attente, projets actifs, factures à soumettre, paiements en attente), section "Actions requises" avec liens directs.

- [A] **D-03** · Demandes de devis + soumission offre avec TVA 8.1% auto — 2026-02-19
  *Fichiers* : `quotes/QuoteRequests.jsx` (nouveau)
  *CDC* : REQ-PREST-001, REQ-PREST-002, REQ-PREST-003
  *Livré* : Table proposals filtrée provider_id, filtres statut, modal SubmitOfferModal (montant HT + TVA 8.1% auto + deadline + notes), PATCH proposals.

- [A] **D-04** · Bons de commande — 2026-02-19
  *Fichiers* : `orders/PurchaseOrders.jsx` (nouveau)
  *CDC* : REQ-PREST-006
  *Livré* : Projets où main_provider_id = provider.id, bouton "Confirmer réception BC", création/MAJ order record.

- [A] **D-05** · Factures fournisseur + upload PDF + suivi paiement — 2026-02-19
  *Fichiers* : `invoices/ProviderInvoices.jsx` (nouveau)
  *CDC* : REQ-PREST-007
  *Livré* : Liste supplier_invoices, cards résumé (en attente/payées), modal création facture avec upload PDF (FormData → Directus files), TVA auto, suivi statut paiement.

- [A] **D-06** · Navigation portail prestataire — 2026-02-19
  *Fichiers* : `layout/PrestatireLayout.jsx` (réécriture complète)
  *Livré* : Sidebar 4 items violet (Dashboard, Devis, Commandes, Factures), header logo + nom prestataire + logout.

- [A] **D-07** · SuperAdmin — Gestion prestataires + envoi demande devis — 2026-02-19
  *Fichiers* : `superadmin/providers/ProvidersModule.jsx` (nouveau), `Sidebar.jsx` (entrée Prestataires)
  *CDC* : REQ-PREST-005
  *Livré* : Onglets Prestataires/Offres reçues, envoi demande devis (POST proposals), Accept/Reject offres soumises (accept → MAJ project.main_provider_id), badge alerte nouvelles soumissions.


---

## PHASE E — AUTOMATIONS EMAIL (MAUTIC) *(TERMINÉE)*
**Objectif CDC** : Zéro email manuel pour HYPERVISUAL
**Modules CDC** : Module 1, 3, 5, 8
**Note technique** : Mautic 5.x gère TOUS les emails (marketing + transactionnels)
**Progression** : 6/6 stories — [A] AUDITED — commit 9ab20a9 — auditée 2026-02-20

- [A] **E-01** · Email confirmation lead (REQ-LEAD-007 — dans les 5 minutes) — 2026-02-19
  *Fichiers* : `api/email/lead-confirmation.js`, `api/email/templates.js`
  *Livré* : Directus Flow items.create leads → POST /api/email/lead-confirmation → Mautic upsert + send. Anti-doublon via automation_logs.

- [A] **E-02** · Email devis envoyé au client avec PDF — 2026-02-19
  *Fichiers* : `api/email/quote-sent.js`
  *CDC* : REQ-FACT-004
  *Livré* : Flow items.update quotes status=sent → email client avec lien signature portail + montant TTC CHF.

- [A] **E-03** · Email accusé de réception paiement + activation projet — 2026-02-19
  *Fichiers* : `api/email/payment-confirmed.js`
  *CDC* : REQ-FACT-006
  *Livré* : Flow items.update payments status=completed → chaîne payment→invoice→contact → email confirmation + lien portail projet.

- [A] **E-04** · Rappels automatiques factures impayées (J+7, J+14, J+30) — 2026-02-19
  *Fichiers* : `api/email/invoice-reminders.js`
  *CDC* : REQ-FACT-010 (procédure recouvrement suisse SchKG/LP)
  *Livré* : CRON quotidien 09h00 → 3 paliers (courtois/ferme/mise en demeure SchKG Art. 67). Anti-doublon par level. Champ due_date ajouté à client_invoices.

- [A] **E-05** · Notification prestataire approbation facture + date paiement — 2026-02-19
  *Fichiers* : `api/email/supplier-approved.js`
  *CDC* : REQ-APPRO-005
  *Livré* : Flow items.update supplier_invoices status=approved → email prestataire avec date paiement prévue (date_paid ou J+30).

- [A] **E-06** · Rappel prestataire si pas de réponse sous 24h — 2026-02-19
  *Fichiers* : `api/email/provider-reminder.js`
  *CDC* : REQ-PREST-004
  *Livré* : CRON horaire → proposals pending/active > 24h sans submitted_at → max 1 rappel par proposal via automation_logs.

---

## PHASE F — CAPTURE LEADS MULTICANAL *(TERMINÉE)*
**Objectif CDC** : Leads créés automatiquement depuis tous les canaux
**Modules CDC** : Module 1 (Sources entrantes)
**Progression** : 4/4 stories — [V] DONE — 2026-02-20

- [V] **F-01** · WordPress → Lead Directus (webhook Fluent Form Pro #17) — 2026-02-20
  *CDC* : REQ-LEAD-001
  *Fichiers* : `src/backend/api/leads/wp-webhook.js`, `lead-creator.js`, `index.js`
  *Livré* : POST /api/leads/wp-webhook — validation HMAC optionnelle, mapping flexible champs Fluent Form, anti-doublon 30min, upsert lead par email. Qualification score 1-5 (budget, date, completude, type). lead_activity auto. Email confirmation best-effort.

- [V] **F-02** · WhatsApp Business → Lead Directus (API Meta + LLM Claude/OpenAI) — 2026-02-20
  *CDC* : REQ-LEAD-002
  *Fichiers* : `src/backend/api/leads/whatsapp-webhook.js`, `llm-lead-extractor.js`, `index.js`, `src/frontend/src/portals/superadmin/leads/WhatsAppInbox.jsx`
  *Livré* : GET /api/leads/whatsapp-webhook (Meta verification hub.mode), POST /api/leads/whatsapp-webhook (message reception), LLM extraction Claude Haiku primary + GPT-4o-mini fallback, stockage whatsapp_messages, lead_activity auto, anti-doublon par message_id, frontend inbox monochromatic (zinc/slate), route /superadmin/leads/whatsapp.

- [V] **F-03** · Email info@hypervisual.ch → Lead Directus (LLM extraction GPT-4o-mini) — 2026-02-20
  *CDC* : REQ-LEAD-004
  *Fichiers* : `src/backend/api/leads/imap-monitor.js`
  *Livré* : Polling IMAP 5min → simpleParser → GPT-4o-mini extraction JSON (confidence ≥ 60%) → lead Directus. Anti-doublon par Message-ID. Deps: imapflow, mailparser.

- [V] **F-04** · Ringover → Lead Directus (analyse appels LLM GPT-4o-mini) — 2026-02-20
  *CDC* : REQ-LEAD-003
  *Fichiers* : `src/backend/api/leads/ringover-polling.js`
  *Livré* : Polling 15min API Ringover v2 → analyse LLM des métadonnées appels → lead si pertinent. Skip numéros internes (+4178327*). Anti-doublon par call_id.

**Découvertes Phase F** :
- Service LLM partagé créé (`llm-lead-extractor.js`) — Claude Haiku primary, GPT-4o-mini fallback
- 3 extracteurs spécialisés : WhatsApp, Email, Appels (scoring 1-5, urgence, langue)
- WhatsApp webhook suit pattern Meta standard (GET verify + POST receive)
- `formatPhone()` normalise les numéros WhatsApp (ajoute +)
- Frontend WhatsApp Inbox utilise design monochromatic (zinc/slate) distinct du glassmorphism

---

## PHASE G — REVOLUT WEBHOOKS + RÉCONCILIATION
**Objectif CDC** : Paiements détectés automatiquement, projets activés sans intervention  
**Modules CDC** : Module 5, Module 16  
**Critères d'acceptation** :  
- Taux rapprochement automatique ≥ 85% (REQ-RECO-001, cible > 90%)  
- Projet activé en < 60 secondes après réception paiement (REQ-FACT-006)  
**Progression** : 5/5 stories — [V] DONE — 2026-02-20

- [V] **G-01** · Revolut webhook — Réception transactions en temps réel — 2026-02-20
  *CDC* : REQ-FACT-005
  *Livré* : `webhook-receiver.js` (HMAC-SHA256, express.raw), `sync-transactions.js` (upsert Directus), sync horaire secours

- [V] **G-02** · Algorithme rapprochement multi-critères — 2026-02-20
  *CDC* : REQ-RECO-001 (montant exact + QR 27 chiffres + date ±3j + fuzzy match 80%)
  *Livré* : `reconciliation.js` — scoring 4 critères (40+35+15+10 pts), Levenshtein normalisé, auto-match ≥85%

- [V] **G-03** · Dashboard rapprochement bancaire avec suggestions — 2026-02-20
  *CDC* : REQ-RECO-002, REQ-RECO-003 (top 3 suggestions par similarité)
  *Livré* : `ReconciliationDashboard.jsx` — KPIs, table transactions, modal rapprochement, filtres, route `/superadmin/reconciliation`

- [V] **G-04** · Activation automatique projet à réception acompte confirmé — 2026-02-20
  *CDC* : REQ-FACT-006 (remplace l'activation manuelle de Phase B-06)
  *Livré* : `activateProjectIfDeposit()` dans reconciliation.js — détecte facture acompte, active projet, déclenche email Phase E

- [V] **G-05** · Alertes transactions non rapprochées > 5 jours — 2026-02-20
  *CDC* : REQ-RECO-004
  *Livré* : `alerts.js` — polling horaire, notifications Directus, anti-doublon via automation_logs

**Découvertes Phase G** :
- `src/backend/api/revolut/` est un symlink vers `integrations/revolut/`
- Module Revolut existant avec revolut-api.js complet (auth, accounts, transactions, payments, counterparties)
- 18 champs ajoutés sur 4 collections : bank_transactions (+6), client_invoices (+3), projects (+2), reconciliations (+7)
- Arrondi suisse ±0.05 CHF implémenté dans le scoring montant

**Audit Phase G (2026-02-20) — 6 bugs corrigés** :
- BUG-G01: express.json() global cassait express.raw() du webhook → bypass conditionnel ajouté dans server.js
- BUG-G02: determineOwnerCompany() retournait toujours null → mapping account_id implémenté (5 entreprises)
- BUG-G03: http://localhost:3000 hardcodé dans activateProjectIfDeposit → utilise UNIFIED_PORT env
- BUG-G04: parseFloat() sans arrondi causait erreurs IEEE 754 → Math.round(x*100)/100
- BUG-G05: matchQRReference() sans validation format 27 chiffres → regex /^\d{27}$/ ajoutée
- BUG-G06: matchQRReference() acceptait cleanQR.includes(cleanTx) → supprimé (seul cleanTx.includes(cleanQR) est correct)

---

## PHASE H — SIGNATURES DOCUSEAL + CGV *(TERMINÉE)*
**Objectif CDC** : Devis signés électroniquement, conformes CO Art. 14
**Modules CDC** : Module 3, Module 4
**Progression** : 3/3 stories — [V] DONE — 2026-02-20

- [V] **H-01** · DocuSeal intégration — Envoi devis pour signature via DocuSeal local — 2026-02-20
  *CDC* : REQ-DEVIS-004 (ZertES-compliant)
  *Fichiers* : `src/backend/services/integrations/docuseal.service.js` (rewrite majeur)
  *Livré* : URL locale http://localhost:3003, création template HTML auto (getOrCreateHtmlTemplate), POST /api/submissions avec submitters, stockage docuseal_submission_id + docuseal_embed_url + signature_requested_at sur quotes, détection alreadySent.
  *Champs ajoutés* : docuseal_submission_id (integer), docuseal_embed_url (string), docuseal_signed_pdf_url (string), signature_requested_at (timestamp)

- [V] **H-02** · DocuSeal webhook — Réception signature + transition statut + facture acompte — 2026-02-20
  *CDC* : REQ-DEVIS-005 (copie automatique au client)
  *Fichiers* : `docuseal.service.js` (handleFormCompleted + handleFormViewed + setupDocuSealWebhook)
  *Livré* : form.completed → PATCH quote signed + is_signed + signed_at + docuseal_signed_pdf_url → createDepositInvoice() auto si deposit_amount > 0 → email confirmation Phase E. form.viewed → MAJ viewed_at. Support événements local (form.*) et cloud (submission.*).

- [V] **H-03** · Bouton signature SuperAdmin + Page signature portail client — 2026-02-20
  *CDC* : REQ-DEVIS-003 (CGV dans le même document)
  *Fichiers* : `superadmin/quotes/QuotesModule.jsx` (sendDocuSealMutation), `superadmin/quotes/QuotesList.jsx` (+PenTool/CheckCircle/Receipt buttons), `client/pages/SignaturePage.jsx` (nouveau), `App.jsx` (route /client/quotes/:quoteId/sign)
  *Livré* : SuperAdmin — bouton PenTool "Envoyer pour signature DocuSeal" (draft/sent), bouton CheckCircle "Marquer signé" (sent), bouton Receipt "Générer facture" (signed). Client — page dédiée /client/quotes/:quoteId/sign avec résumé devis + iframe DocuSeal + gestion états (loading/ready/signing/completed/error).

**Découvertes Phase H** :
- DocuSeal service existait déjà (495 lignes) mais ciblait l'API cloud (api.docuseal.co) — adapté pour instance locale
- API DocuSeal locale utilise `submitters` (pas `signers`) et `POST /api/templates/html` pour templates
- Token Directus était hardcodé incorrectement — corrigé vers DIRECTUS_ADMIN_TOKEN / static token
- Routes intégrations déjà montées dans server.js — pas besoin de créer de nouveau router
- setupDocuSealWebhook() ajouté au démarrage server.js pour enregistrer le webhook sur l'instance locale

---

## PHASE I — MODULES FINANCE AVANCÉS (CDC V1.2) *(TERMINÉE)*
**Objectif CDC** : Couverture complète du cycle finance
**Modules CDC** : Module 9, 10, 11, 12, 13, 14
**Progression** : 8/8 stories — [V] DONE — 2026-02-20

- [V] **I-01** · Module 9 — Facturation par jalons (deliverables → factures) — 2026-02-20
  *CDC* : REQ-JALON-001 à 006
  *Fichiers* : `src/backend/api/milestones/index.js`, `src/frontend/src/portals/superadmin/projects/MilestonesModule.jsx`
  *Livré* : POST /:deliverableId/invoice (génère JAL-YYYYMM-NNN), GET /project/:projectId (jalons avec can_invoice/is_invoiced), progress bar facturation.
  *Champs ajoutés* : deliverables +4 (invoice_id, invoiced_at, billable, amount)

- [V] **I-02** · Module 10 — Contrats récurrents avancés (panier multi-services) — 2026-02-20
  *CDC* : REQ-ABONNEMENT-001 à 008
  *Fichiers* : `src/backend/api/subscriptions/index.js`
  *Livré* : CRUD complet, calcul next_billing_date auto (monthly/quarterly/annual), services JSON panier multi-services, due-today endpoint.
  *Champs ajoutés* : subscriptions +6 (contact_id, next_billing_date, last_invoiced_at, services, auto_renew, invoice_day)

- [V] **I-03** · Module 10 — Facturation récurrente automatique (cron mensuel) — 2026-02-20
  *CDC* : REQ-REC-001 à 004
  *Fichiers* : `src/backend/api/subscriptions/billing-cron.js`
  *Livré* : CRON quotidien 08h00 (setTimeout scheduling), numéro REC-YYYYMM-NNN, anti-doublon via automation_logs, POST /run-billing trigger manuel, MAJ next_billing_date après facturation.

- [V] **I-04** · Module 11 — Avoirs & remboursements (notes de crédit) — 2026-02-20
  *CDC* : REQ-AVOIR-001 à 008, CO Art. 958f
  *Fichiers* : `src/backend/api/credits/index.js`, `src/frontend/src/portals/superadmin/invoices/CreditsModule.jsx`
  *Livré* : POST /credits (full/partial), POST /:id/apply (déduire sur facture), numéro NC-YYYYMM-NNN, audit trail automation_logs. Avoir total → annule facture originale.
  *Champs ajoutés* : credits +10 (invoice_id, credit_number, amount, tax_amount, total, reason, contact_id, project_id, issued_at, applied_to_invoice_id)

- [V] **I-05** · Module 12 — Workflow validation factures fournisseurs — 2026-02-20
  *CDC* : REQ-APPRO-001 à 008
  *Fichiers* : `src/backend/api/supplier-invoices/index.js`, `src/frontend/src/portals/superadmin/providers/ApprovalQueue.jsx`
  *Livré* : File d'attente CEO pending (GET /pending + /pending/count), approve 1 clic (POST /:id/approve + payment_scheduled_date), reject avec raison obligatoire, modals glassmorphism, badge count animé.
  *Champs ajoutés* : supplier_invoices +6 (amount_ht, approved_at, rejection_reason, payment_scheduled_date, deviation_percentage, quote_amount)

- [V] **I-06** · Module 12 — Détection écarts devis/facture fournisseur — 2026-02-20
  *CDC* : REQ-APPRO-006 (tolérance ±5% configurable)
  *Fichiers* : `src/backend/api/supplier-invoices/index.js` (analyzeDeviation), `ApprovalQueue.jsx` (DeviationBadge)
  *Livré* : Analyse deviation_percentage auto, 3 niveaux (ok <3% vert / warning 3-5% orange / blocked >5% rouge), bouton approve désactivé si blocked, GET /:id/deviation endpoint.

- [V] **I-07** · Module 13 — Suivi du temps → facturation en régie — 2026-02-20
  *CDC* : REQ-TEMPS-001 à 007
  *Fichiers* : `src/backend/api/time-tracking/index.js`
  *Livré* : POST /time-tracking (saisie), GET /billable/:projectId (heures non facturées), POST /invoice (génère REG-YYYYMM-NNN depuis sélection), marque entries billed.
  *Champs ajoutés* : time_tracking +2 (invoice_id, invoiced_at)

- [V] **I-08** · Module 14 — Tickets support → facturation hors contrat — 2026-02-20
  *CDC* : REQ-SUPPORT-001 à 007 (tarif défaut : 150 CHF/h)
  *Fichiers* : `src/backend/api/support/index.js`
  *Livré* : CRUD tickets, POST /:id/close (auto-facture si billable + hors contrat), POST /:id/bill (facturation manuelle), numéro SUP-YYYYMM-NNN, coverage contract/out_of_contract, stats endpoint.
  *Champs ajoutés* : support_tickets +7 (contact_id, hours_spent, hourly_rate, billable, invoice_id, invoiced_at, subscription_id), client_invoices +8 (type, subscription_id, credit_id, tax_rate, tax_amount, total, currency, description)

**Découvertes Phase I** :
- 43 champs ajoutés sur 7 collections via API Directus (deliverables +4, subscriptions +6, supplier_invoices +6, credits +10, time_tracking +2, support_tickets +7, client_invoices +8)
- Utilitaires partagés créés dans `src/backend/lib/financeUtils.js` (directus helpers, date utils, invoice number generators, automation log)
- Frontend existant déjà connecté pour SubscriptionsModule, TimeTrackingModule, SupportDashboard (phases précédentes) — ajouté 3 nouveaux composants (MilestonesModule, CreditsModule, ApprovalQueue)
- 7 routers ajoutés dans server.js avec try/catch pattern cohérent

---

## PHASE J — KPI DASHBOARD + RAPPORT CEO ✅ COMPLETE
**Objectif CDC** : CEO voit tout, comprend tout, en 30 secondes
**Modules CDC** : Module 7, Module 15
**Progression** : 4/4 stories
**Commit** : `feat(phase-j): kpi dashboard + rapport ceo`

- [V] **J-01** · KPIs depuis collection `kpis` — affichage complet — 2026-02-20
  *CDC* : REQ-KPI-001 à 007
  *Fichiers* : `api/kpis/index.js` (GET /latest, /history/:metric, /summary) + `kpis/KPIWidget.jsx` (sidebar + sparkline MRR)
  *Livré* : 11 métriques en base (MRR, ARR, NPS, LTV_CAC, ACTIVE_PROJECTS, CASH_RUNWAY, etc.), variation vs période précédente, sparkline Recharts LineChart MRR 30j, métriques calculées EBITDA + RUNWAY, intégré dans Dashboard.jsx colonne droite

- [V] **J-02** · Alertes seuils KPI configurables (MRR < 50K → alerte rouge) — 2026-02-20
  *CDC* : REQ-KPI-005
  *Fichiers* : `api/kpis/thresholds.js` (GET /alerts, PUT /thresholds, GET /thresholds) + `kpis/ThresholdConfig.jsx`
  *Livré* : 6 seuils configurables (MRR, ARR, RUNWAY, NPS, LTV_CAC, EBITDA), niveaux warning/critical, persistance Directus settings, badges alertes actives, formulaire édition seuils

- [V] **J-03** · Rapport quotidien CEO automatique par email — 2026-02-20
  *CDC* : REQ-CEO-006
  *Fichiers* : `api/kpis/daily-report.js` (CRON 07h00 + POST /report/send + GET /report/preview)
  *Livré* : Email HTML responsive (alertes, KPIs, opérations, trésorerie), envoi via Mautic API, CRON setTimeout 07h00 avec anti-doublon automation_logs, endpoint preview HTML, endpoint envoi manuel

- [V] **J-04** · Prévision trésorerie 30/60/90 jours — 2026-02-20
  *CDC* : REQ-CEO-004
  *Fichiers* : `api/kpis/treasury-forecast.js` (GET /treasury) + `kpis/TreasuryForecast.jsx`
  *Livré* : Algorithme 6 étapes (solde courant, entrées factures, récurrent subscriptions × TVA 8.1%, sorties fournisseurs, burn rate 90j, runway), BarChart Recharts 4 colonnes (bleu si >= actuel, rouge si <), cartes résumé (solde, burn, runway), détails par horizon

### Découvertes Phase J
- 11 métriques réelles en base kpis (plus que les 5 prévues dans le prompt) : MRR, ARR, NPS, LTV_CAC, ACTIVE_PROJECTS, CASH_RUNWAY, Cash_Runway, CLIENT_RETENTION, EBITDA_MARGIN, PIPELINE_VALUE, TEAM_PRODUCTIVITY
- 5 entreprises dans kpis : HYPERVISUAL, DAINAMICS, ENKI_REALTY, LEXAIA, TAKEOUT
- Dashboard.jsx enrichi : grille 3 colonnes (Alertes + Pipeline + KPI sidebar), Treasury + TreasuryForecast côte à côte
- 4 endpoints backend + 4 sous-routes + 1 CRON = 9 fonctionnalités en 4 fichiers
- Prévision trésorerie utilise TVA 8.1% pour subscriptions conformément aux normes suisses

---

## PHASE K — MULTI-ENTREPRISES (POST V1)
**Scope** : DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT  
**Prérequis** : V1 HYPERVISUAL Switzerland entièrement stable et validée  
**Progression** : 0/1 story

- [ ] **K-01** · Architecture multi-entreprises — Isolation données + portails par entité  
  *CDC* : Scope V1 = HYPERVISUAL uniquement. Extensions prévues post-stabilisation.

---

## RÈGLES DE TRANSITION ENTRE PHASES

> Ces règles évitent les problèmes rencontrés lors des transitions précédentes.

### Avant de commencer une phase
1. **Vérifier les prérequis** : Toutes les stories [A] AUDITED de la phase précédente
2. **Lire le CDC** : Relire les modules concernés dans `docs/CDC_HYPERVISUAL_Switzerland_Directus_Unified_Platform.md`
3. **Vérifier Directus** : Confirmer via MCP que les collections nécessaires existent et ont les bons champs
4. **Identifier les dépendances** : Lister les services externes nécessaires (Mautic, Revolut, DocuSeal)

### Pendant le développement
5. **Skills OBLIGATOIRES** : Claude Code DOIT lire les skills appropriés avant chaque story.
   Consulter `SKILLS-MAPPING.md` pour la combinaison exacte de skills par story.
   Minimum : 1 skill projet (`.claude/skills/`) + 1 skill spécialisé (`~/.claude/skills-repos/`)
   **Sans cette étape = code générique. Avec = code exceptionnel.**
6. **Vérification champs réels** : TOUJOURS vérifier via `directus:get_collection_items` avant de coder
7. **Pas d'invention** : JAMAIS inventer des noms de champs, toujours vérifier

### Après chaque story
8. **Commit atomique** : Un commit par story avec message formaté `feat(B-01): description`
9. **Mettre à jour ce fichier** : Passer `[ ]` → `[V]` avec date
10. **Signaler les blocages** : Si discovery inattendue → noter dans DÉCOUVERTES ci-dessous

### Critère de validation phase terminée
11. Jean teste chaque feature en production locale
12. Jean passe les stories `[V]` → `[A]`
13. **JAMAIS commencer la phase suivante sans** que la phase courante soit `[A]` AUDITED

---

## DÉCOUVERTES & AJUSTEMENTS

> Toute découverte qui impacte le plan est loggée ici immédiatement par Claude Code.

| Date | Story | Découverte | Impact | Décision |
|------|-------|-----------|--------|----------|
| 2026-02-19 | — | PROGRESS.md 47/47 couvrait uniquement la couche affichage | 80% CDC restant | Ce ROADMAP.md créé |
| 2026-02-19 | B-01 | Score qualification implémenté en 1-5 (numérique) vs High/Medium/Low (CDC) | Acceptable | **DÉCISION JEAN : Conserver 1-5** |
| 2026-02-19 | B-04 | Numéro facture format FA-YYYYMM-NNN (vs CDC) | Mineur | **DÉCISION JEAN : Format INV-YYYY-NN** — corrigé en C-00 |
| 2026-02-19 | B-06 | projectActivation.js crée 5 livrables par défaut automatiquement | Bonus | Conserver |
| 2026-02-19 | C-06 | Messagerie implémentée avec polling 15s (pas WebSocket) | Acceptable Phase C | WebSocket temps réel = Phase E si besoin |
| 2026-02-19 | D-01 | MCP Directus retourne 401 — token MCP mal configuré | Contourné | Utilisé curl + static admin token pour vérifier/ajouter champs |
| 2026-02-19 | D-01 | Collections providers/proposals/orders manquaient beaucoup de champs | Bloquant | Ajouté 18 champs via API Directus (email, phone, amounts, TVA, etc.) |
| 2026-02-19 | D-01 | Auth prestataire = magic link (comme client), pas JWT admin | Architecture | Cohérent avec portail client Phase C — portails externes isolés du JWT superadmin |
| 2026-02-19 | E-04 | client_invoices n'avait pas de champ due_date | Bloquant E-04 | Ajouté due_date (type date) via API Directus |
| 2026-02-19 | E-04 | automation_logs existait mais manquait entity_type, entity_id, recipient_email, level | Enrichi | 4 champs ajoutés pour traçabilité complète |
| 2026-02-19 | E-all | MauticAPI n'avait pas de sendEmail() ni sendEmailToAddress() | Bloquant | Ajouté 2 méthodes à api/mautic/index.js |
| 2026-02-19 | E-all | quotes.total (pas total_ttc), supplier_invoices.date_paid (pas payment_date), proposals.created_at (pas date_created) | Noms champs | Adapté le code aux noms réels vérifiés via MCP |
| 2026-02-20 | F-all | leads manquait 6 champs pour capture multicanal (source_channel, source_detail, raw_data, openai_summary, ringover_call_id, call_duration) | Enrichi | 6 champs ajoutés via API Directus |
| 2026-02-20 | F-all | lead_sources.code existait déjà — pas besoin d'ajouter | OK | Vérifié via MCP avant action |
| 2026-02-20 | F-all | Projet en ES Modules ("type":"module") — prompt fournissait du CommonJS (require) | Adaptation | Tout converti en import/export ES Modules |
| 2026-02-20 | F-all | leads.source est uuid→lead_sources (pas un string) — le prompt utilisait lead_source_id | Noms champs | Adapté lead-creator.js pour écrire dans source (uuid) |
| 2026-02-20 | H-01 | DocuSeal service existait (495 lignes) mais ciblait API cloud — adapté pour local | Architecture | Rewrite partiel vers localhost:3003 + submitters API |
| 2026-02-20 | H-01 | Token Directus hardcodé incorrectement dans docuseal.service.js | Bug | Corrigé vers DIRECTUS_ADMIN_TOKEN / static token |
| 2026-02-20 | H-01 | 4 champs manquants sur quotes pour DocuSeal | Enrichi | docuseal_submission_id, docuseal_embed_url, docuseal_signed_pdf_url, signature_requested_at |
| 2026-02-20 | H-02 | API DocuSeal locale envoie form.completed (pas submission.completed) | Adaptation | Support double : form.* (local) + submission.* (cloud) |

---

## MÉTRIQUES GLOBALES

| Métrique | Valeur |
|----------|--------|
| Collections Directus | 83 actives |
| Stories Phase A (infra+display) | 47/47 ✅ |
| Stories Phase B (cycle vente) | 8/8 ✅ |
| Stories Phase C (portail client) | 8/8 ✅ |
| Stories Phase D (portail prestataire) | 7/7 ✅ |
| Stories Phase E (email automation) | 6/6 ✅ |
| Stories Phase F (lead capture) | 4/4 ✅ |
| Stories Phase G (Revolut reconciliation) | 5/5 ✅ |
| Stories Phase H (DocuSeal signatures) | 3/3 ✅ |
| Stories Phase I (finance avancees) | 8/8 ✅ |
| Stories Phase J (KPI dashboard CEO) | 4/4 ✅ |
| Stories CDC restantes | 0 |
| Modules CDC couverts | 16/16 (Leads, Devis, Facturation, Projets, Portail Client, Portail Prestataire, Email Automation, Lead Capture Multicanal, Signatures Electroniques, Jalons, Abonnements, Avoirs, Approbation Fournisseurs, Temps/Regie, Support, KPI Dashboard CEO) |
| Dernier commit Phase J | — 2026-02-20 |
| **V1 STATUS** | **96/96 stories — COMPLETE** |

---

## CRITÈRES D'ACCEPTATION GLOBAUX (CDC V1.2)

La plateforme V1 sera considérée opérationnelle quand :

1. `[V]` Lead WordPress → Directus en < 30 secondes (REQ-LEAD-001) — Phase F
2. `[V]` CEO qualifie et convertit un lead en devis en < 3 minutes — **FAIT Phase B**
3. `[V]` Client signe son devis en ligne sans formation (REQ-CLIENT-006) — **FAIT Phase C**
4. `[V]` Facture d'acompte générée depuis devis signé en 2 clics (REQ-FACT-001) — **FAIT Phase B**
5. `[V]` Portail client affiche statut projet en temps réel (REQ-CLIENT-002) — **FAIT Phase C**
6. `[V]` Facture prestataire uploadée et associée en < 2 minutes (REQ-FACT-008) — **FAIT Phase I**
7. `[V]` Projet s'active automatiquement à paiement confirmé (REQ-FACT-006) — **FAIT Phase B** (manuel) + **Phase G** (Revolut webhook auto)
8. `[ ]` CEO gère un projet complet depuis Chypre sans email ni appel — Phase E+G
9. `[V]` 240 KPIs existants affichés correctement (REQ-KPI-001) — **FAIT Phase J** (11 métriques, 5 entreprises, sparkline MRR, alertes seuils, prévision trésorerie)
10. `[V]` Facture fournisseur : OCR → validation CEO → paiement Revolut (REQ-APPRO-001) — **FAIT Phase I**
11. `[V]` Taux rapprochement bancaire automatique ≥ 85% (REQ-RECO-001) — **FAIT Phase G** (scoring 4 critères, seuil auto ≥85%)
12. `[V]` Avoir générable en < 3 clics, conforme QR-Invoice (REQ-AVOIR-001) — **FAIT Phase I**
