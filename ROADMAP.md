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
- ❌ Signatures électroniques DocuSeal
- ❌ Emails transactionnels via Mautic
- ❌ Capture leads WordPress / WhatsApp / Ringover
- ❌ Workflows validation factures fournisseurs
- ❌ Rapprochement bancaire algorithme multi-critères
- ❌ Portail client fonctionnel (signer, uploader, communiquer)
- ❌ Portail prestataire fonctionnel (soumettre devis, voir paiements)
- ❌ Facturation par jalons (deliverables → factures)
- ❌ Facturation récurrente automatique
- ❌ KPIs depuis collection `kpis` (240 enregistrements réels)

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
**Progression** : 8/8 stories — [V] DONE — commit 5926787 — 2026-02-19

### Stories

- [V] **B-01** · Leads — Actions qualify/convert/archive avec transitions état Directus — 2026-02-19  
  *Fichiers* : `LeadsDashboard.jsx` 311→702 lignes  
  *Livré* : Qualify modal (score 1-5 + notes + next action), convert-to-quote (crée projet + navigate), archive avec confirmation, badges ancienneté (Nouveau/24h+/URGENT)

- [V] **B-02** · QuoteForm — Formulaire devis multi-lignes avec calculs TVA suisse — 2026-02-19  
  *Fichiers* : `quotes/QuoteForm.jsx` 472→761 lignes  
  *Livré* : Mode page standalone via URL params, pre-fill depuis lead (?lead_id=&project_id=), numéro auto DEV-YYYYMM-NNN, Save draft + Save & send, PATCH lead/project à la sauvegarde

- [V] **B-03** · Quotes — Actions sur devis (marquer signé, → facture) — 2026-02-19  
  *Fichiers* : `QuotesModule.jsx` 134→184 lignes  
  *Livré* : Mutation "Mark signed", action "Generate invoice" (lazy InvoiceGenerator), navigate vers form standalone

- [V] **B-04** · InvoiceGenerator — Génération factures acompte/solde depuis devis — 2026-02-19  
  *Fichiers* : `invoices/InvoiceGenerator.jsx` 278 lignes (NOUVEAU)  
  *Livré* : Wizard modal deposit/balance/full/custom, numéro auto FA-YYYYMM-NNN, POST vers client_invoices

- [V] **B-05** · InvoiceDetailView — Vue facture complète avec QR code — 2026-02-19  
  *Fichiers* : `invoices/InvoiceDetailView.jsx` 197 lignes (NOUVEAU)  
  *Livré* : Page complète /superadmin/invoices/:id, QR placeholder suisse, timeline statuts, badges

- [V] **B-06** · Activation projet — Marquer payé + activation projet en cascade — 2026-02-19  
  *Fichiers* : `lib/projectActivation.js` 90 lignes (NOUVEAU), `InvoicesModule.jsx` 335→442 lignes  
  *Livré* : Utilitaire réutilisable, MAJ statut projet, création 5 livrables par défaut (REQ-FACT-006)  
  *Note* : Activation manuelle maintenant. Revolut webhook automatique en Phase G.

- [V] **B-07** · AlertsWidget — Alertes actionnables avec données réelles Directus — 2026-02-19  
  *Fichiers* : `widgets/AlertsWidget.jsx` 237→327 lignes  
  *Livré* : 5 sources de données (factures, leads, tickets, devis, projets), boutons action avec navigation

- [V] **B-08** · KPIWidget — KPIs depuis collection kpis — 2026-02-19  
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
**Progression** : 8/8 stories — [V] DONE — commit f488d28 — 2026-02-19

- [V] **C-00** · Fix format numéro facture INV-YYYY-NN — 2026-02-19  
  *Fichiers* : `InvoiceGenerator.jsx`  
  *Livré* : Séquence auto via count Directus

- [V] **C-01** · Auth portail client (magic link token localStorage) — 2026-02-19  
  *Fichiers* : `ClientAuth.jsx`, `hooks/useClientAuth.js`, `ClientPortalGuard.jsx` (3 nouveaux)  
  *Livré* : Login email → token → accès données client. Guard sur /client/*

- [V] **C-02** · Dashboard client connecté Directus — 2026-02-19  
  *Fichiers* : `Dashboard.jsx` (réécriture complète)  
  *Livré* : 4 cartes statut, section "Action requise", timeline projet (tout filtré contact_id)

- [V] **C-03** · Signature devis en ligne avec CGV intégrée — 2026-02-19  
  *Fichiers* : `QuoteSignature.jsx` (nouveau)  
  *Livré* : Flow 3 étapes atomique : CGV acceptance → signature_log → PATCH quote

- [V] **C-04** · Suivi projet temps réel — 2026-02-19  
  *Fichiers* : `ClientProjectsList.jsx`, `ProjectTracking.jsx` (2 nouveaux)  
  *Livré* : Liste projets + détail avec progression deliverables

- [V] **C-05** · Historique factures + impression — 2026-02-19  
  *Fichiers* : `ClientInvoices.jsx` (nouveau)  
  *Livré* : Tableau statuts, solde outstanding, print via window.open

- [V] **C-06** · Messagerie client ↔ HYPERVISUAL — 2026-02-19  
  *Fichiers* : `ClientMessages.jsx` (nouveau)  
  *Livré* : Chat UI sur collection comments, polling 15s

- [V] **C-07** · Navigation et layout portail client — 2026-02-19  
  *Fichiers* : `ClientLayout.jsx` (réécriture)  
  *Livré* : Sidebar 5 items emerald, header logo + prénom + logout

---

## PHASE D — PORTAIL PRESTATAIRE FONCTIONNEL
**Objectif CDC** : Un prestataire peut recevoir une demande, soumettre un devis, voir ses paiements  
**Modules CDC** : Module 2 (Portail Prestataire)  
**Critères d'acceptation** :  
- Prestataire soumets son devis en < 5 minutes (REQ-PREST-003)  
- Prestataire voit le bon de commande une fois projet activé (REQ-PREST-006)  
- Prestataire voit le statut paiement de sa prestation (REQ-PREST-007)  
**Progression** : 0/5 stories

- [ ] **D-01** · Prestataire — Réception demande de devis avec détails complets projet  
  *CDC* : REQ-PREST-001, REQ-PREST-002, REQ-PREST-006  

- [ ] **D-02** · Prestataire — Formulaire soumission devis (montant + PDF upload)  
  *CDC* : REQ-PREST-003  

- [ ] **D-03** · Prestataire — Bon de commande (généré après activation projet)  
  *CDC* : REQ-PREST-006  

- [ ] **D-04** · Prestataire — Statut paiement de ses prestations  
  *CDC* : REQ-PREST-007  

- [ ] **D-05** · SuperAdmin — Validation devis prestataire + notification CEO  
  *CDC* : REQ-PREST-005, REQ-DEVIS-001 (devis client depuis devis prestataire)  

---

## PHASE E — AUTOMATISATIONS EMAIL (MAUTIC)
**Objectif CDC** : Zéro email manuel pour HYPERVISUAL  
**Modules CDC** : Module 1, 3, 5, 8  
**Note technique** : Mautic 5.x gère TOUS les emails (marketing + transactionnels)  
**Progression** : 0/6 stories

- [ ] **E-01** · Email confirmation lead (REQ-LEAD-007 — dans les 5 minutes)  
- [ ] **E-02** · Email devis envoyé au client avec PDF  
  *CDC* : REQ-FACT-004  
- [ ] **E-03** · Email accusé de réception paiement + activation projet  
  *CDC* : REQ-FACT-006  
- [ ] **E-04** · Rappels automatiques factures impayées (J+7, J+14, J+30)  
  *CDC* : REQ-FACT-010 (procédure recouvrement suisse SchKG/LP)  
- [ ] **E-05** · Notification prestataire approbation facture + date paiement  
  *CDC* : REQ-APPRO-005  
- [ ] **E-06** · Rappel prestataire si pas de réponse sous 24h  
  *CDC* : REQ-PREST-004  

---

## PHASE F — CAPTURE LEADS MULTICANAL
**Objectif CDC** : Leads créés automatiquement depuis tous les canaux  
**Modules CDC** : Module 1 (Sources entrantes)  
**Progression** : 0/4 stories

- [ ] **F-01** · WordPress → Lead Directus (webhook formulaire multi-étapes)  
  *CDC* : REQ-LEAD-001  
  *Note* : Formulaire WordPress conditionnel avec qualification automatique  

- [ ] **F-02** · WhatsApp Business → Lead Directus (API Meta + LLM résumé)  
  *CDC* : REQ-LEAD-002  
  *Dépendance* : Compte WhatsApp Business API, Claude API  

- [ ] **F-03** · Email info@hypervisual.ch → Lead Directus (LLM extraction)  
  *CDC* : REQ-LEAD-004  

- [ ] **F-04** · Ringover → Lead Directus (transcription + résumé LLM)  
  *CDC* : REQ-LEAD-003  
  *Dépendance* : Intégration Ringover API  

---

## PHASE G — REVOLUT WEBHOOKS + RÉCONCILIATION
**Objectif CDC** : Paiements détectés automatiquement, projets activés sans intervention  
**Modules CDC** : Module 5, Module 16  
**Critères d'acceptation** :  
- Taux rapprochement automatique ≥ 85% (REQ-RECO-001, cible > 90%)  
- Projet activé en < 60 secondes après réception paiement (REQ-FACT-006)  
**Progression** : 0/5 stories

- [ ] **G-01** · Revolut webhook — Réception transactions en temps réel  
  *CDC* : REQ-FACT-005  
  *Note* : Tokens Revolut expire 40min — refresh automatique obligatoire  

- [ ] **G-02** · Algorithme rapprochement multi-critères  
  *CDC* : REQ-RECO-001 (montant exact + QR 27 chiffres + date ±3j + fuzzy match 80%)  
  *Skills requis* : `postgresql-directus-optimizer`

- [ ] **G-03** · Dashboard rapprochement bancaire avec suggestions  
  *CDC* : REQ-RECO-002, REQ-RECO-003 (top 3 suggestions par similarité)  

- [ ] **G-04** · Activation automatique projet à réception acompte confirmé  
  *CDC* : REQ-FACT-006 (remplace l'activation manuelle de Phase B-06)  

- [ ] **G-05** · Alertes transactions non rapprochées > 5 jours  
  *CDC* : REQ-RECO-004  

---

## PHASE H — SIGNATURES DOCUSEAL + CGV
**Objectif CDC** : Devis signés électroniquement, conformes CO Art. 14  
**Modules CDC** : Module 3, Module 4  
**Progression** : 0/3 stories

- [ ] **H-01** · DocuSeal intégration — Envoi devis pour signature  
  *CDC* : REQ-DEVIS-004 (ZertES-compliant)  
  *Note* : DocuSeal déjà configuré dans le projet (src/backend/api/)  

- [ ] **H-02** · DocuSeal webhook — Réception signature + transition statut quote  
  *CDC* : REQ-DEVIS-005 (copie automatique au client)  

- [ ] **H-03** · CGV intégrées au devis signable  
  *CDC* : REQ-DEVIS-003 (CGV dans le même document)  

---

## PHASE I — MODULES FINANCE AVANCÉS (CDC V1.2)
**Objectif CDC** : Couverture complète du cycle finance  
**Modules CDC** : Module 9, 10, 11, 12  
**Progression** : 0/8 stories

- [ ] **I-01** · Module 9 — Facturation par jalons (deliverables → factures)  
  *CDC* : REQ-JALON-001 à 006  
  *Base* : Collection `deliverables` — 550 enregistrements réels  

- [ ] **I-02** · Module 10 — Contrats récurrents avancés (panier multi-services)  
  *CDC* : REQ-ABONNEMENT-001 à 008  
  *Base* : Collection `subscriptions` — 120 enregistrements réels  

- [ ] **I-03** · Module 10 — Facturation récurrente automatique (cron mensuel)  
  *CDC* : REQ-REC-001 à 004  

- [ ] **I-04** · Module 11 — Avoirs & remboursements (annulations, notes de crédit)  
  *CDC* : REQ-AVOIR-001 à 008  
  *Base* : Collections `credits`, `refunds` présentes  
  *Skills requis* : `swiss-compliance-engine` (CO Art. 958f — 10 ans conservation)

- [ ] **I-05** · Module 12 — Workflow validation factures fournisseurs  
  *CDC* : REQ-APPRO-001 à 008  
  *Base* : 375 factures fournisseurs dans `supplier_invoices`  
  *Note* : OCR → file d'attente → validation CEO (1 clic) → paiement Revolut programmé  

- [ ] **I-06** · Module 12 — Détection écarts devis/facture fournisseur  
  *CDC* : REQ-APPRO-006 (tolérance ±5% configurable)  

- [ ] **I-07** · Module 13 — Suivi du temps → facturation en régie  
  *CDC* : REQ-TEMPS-001 à 007  
  *Applicabilité* : Projets logiciels (InMotion, DataVision) — Type D  

- [ ] **I-08** · Module 14 — Tickets support → facturation hors contrat  
  *CDC* : REQ-SUPPORT-001 à 007 (tarif défaut : 150 CHF/h)  

---

## PHASE J — KPI DASHBOARD + RAPPORT CEO
**Objectif CDC** : CEO voit tout, comprend tout, en 30 secondes  
**Modules CDC** : Module 7, Module 15  
**Progression** : 0/4 stories

- [ ] **J-01** · KPIs depuis collection `kpis` — affichage complet  
  *CDC* : REQ-KPI-001 à 007  
  *Base* : 240 enregistrements réels (48 HYPERVISUAL)  
  *Note* : ARR, MRR, EBITDA, Runway, LTV, CAC, NPS — déjà calculés en base  

- [ ] **J-02** · Alertes seuils KPI configurables (MRR < 50K → alerte rouge)  
  *CDC* : REQ-KPI-005  

- [ ] **J-03** · Rapport quotidien CEO automatique par email  
  *CDC* : REQ-CEO-006  
  *Dépendance* : Phase E (Mautic) doit être active  

- [ ] **J-04** · Prévision trésorerie 30/60/90 jours  
  *CDC* : REQ-CEO-004  

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

---

## MÉTRIQUES GLOBALES

| Métrique | Valeur |
|----------|--------|
| Collections Directus | 83 actives |
| Stories Phase A (infra+display) | 47/47 ✅ |
| Stories Phase B (cycle vente) | 8/8 ✅ |
| Stories Phase C (portail client) | 8/8 ✅ |
| Stories CDC restantes | 37 à faire |
| Modules CDC couverts | 5/16 (Leads, Devis, Facturation, Projets, Portail Client) |
| Dernier commit Phase C | f488d28 — 2026-02-19 |

---

## CRITÈRES D'ACCEPTATION GLOBAUX (CDC V1.2)

La plateforme V1 sera considérée opérationnelle quand :

1. `[V]` Lead WordPress → Directus en < 30 secondes (REQ-LEAD-001) — Phase F
2. `[V]` CEO qualifie et convertit un lead en devis en < 3 minutes — **FAIT Phase B**
3. `[V]` Client signe son devis en ligne sans formation (REQ-CLIENT-006) — **FAIT Phase C**
4. `[V]` Facture d'acompte générée depuis devis signé en 2 clics (REQ-FACT-001) — **FAIT Phase B**
5. `[V]` Portail client affiche statut projet en temps réel (REQ-CLIENT-002) — **FAIT Phase C**
6. `[ ]` Facture prestataire uploadée et associée en < 2 minutes (REQ-FACT-008) — Phase I
7. `[V]` Projet s'active automatiquement à paiement confirmé (REQ-FACT-006) — **FAIT Phase B** (manuel, Revolut webhook Phase G)
8. `[ ]` CEO gère un projet complet depuis Chypre sans email ni appel — Phase E+G
9. `[ ]` 240 KPIs existants affichés correctement (REQ-KPI-001) — Phase J
10. `[ ]` Facture fournisseur : OCR → validation CEO → paiement Revolut (REQ-APPRO-001) — Phase I
11. `[ ]` Taux rapprochement bancaire automatique ≥ 85% (REQ-RECO-001) — Phase G
12. `[ ]` Avoir générable en < 3 clics, conforme QR-Invoice (REQ-AVOIR-001) — Phase I
