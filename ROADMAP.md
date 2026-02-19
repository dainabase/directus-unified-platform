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

## PHASE B — CYCLE DE VENTE OPÉRATIONNEL *(PRIORITÉ 1)*
**Objectif CDC** : Un lead devient un projet actif sans intervention manuelle  
**Modules CDC** : Module 1 (Leads), Module 3 (Devis), Module 5 (Facturation), Module 6 (Projets)  
**Critères d'acceptation** :  
- Un lead peut être qualifié et converti en devis en < 3 minutes (REQ-CEO)  
- Une facture QR conforme est générée depuis un devis signé en 2 clics  
- Un projet s'active automatiquement à la confirmation de paiement (REQ-FACT-006)  
**Progression** : 0/8 stories

### Stories

- [ ] **B-01** · Leads — Actions qualify/convert/archive avec transitions état Directus  
  *Fichiers* : `LeadsDashboard.jsx` — Modales qualification, bouton → Devis, badge ancienneté  
  *CDC* : REQ-LEAD-005, REQ-LEAD-008, REQ-LEAD-009  

- [ ] **B-02** · QuoteForm — Formulaire devis multi-lignes avec calculs TVA suisse  
  *Fichiers* : `quotes/QuoteForm.jsx` (CRÉER)  
  *CDC* : REQ-DEVIS-001, REQ-DEVIS-002, REQ-DEVIS-006, REQ-DEVIS-008  
  *Skills requis* : `swiss-compliance-engine`, `directus-api-patterns`

- [ ] **B-03** · Quotes — Actions sur devis (marquer signé, dupliquer, → facture)  
  *Fichiers* : `QuotesModule.jsx` — Boutons contextuels par statut  
  *CDC* : REQ-DEVIS-004 (signature), REQ-PROJ-001 (projet auto à signature)  

- [ ] **B-04** · InvoiceGenerator — Génération factures acompte/solde depuis devis  
  *Fichiers* : `invoices/InvoiceGenerator.jsx` (CRÉER)  
  *CDC* : REQ-FACT-001, REQ-FACT-002, REQ-FACT-003  
  *Skills requis* : `swiss-compliance-engine` (QR-Invoice v2.3)

- [ ] **B-05** · InvoiceDetailView — Vue facture complète avec QR code  
  *Fichiers* : `invoices/InvoiceDetailView.jsx` (CRÉER)  
  *CDC* : REQ-FACT-003 (QR-Invoice), REQ-FACT-002 (conformité suisse)

- [ ] **B-06** · Activation projet — Marquer payé + activation projet en cascade  
  *Fichiers* : `lib/projectActivation.js`, `InvoicesModule.jsx`  
  *CDC* : REQ-FACT-006, REQ-FACT-006b (CRITIQUE — règle business principale)  
  *Note* : Activation manuelle maintenant, Revolut webhook en Phase D

- [ ] **B-07** · AlertsWidget — Alertes actionnables avec données réelles Directus  
  *Fichiers* : `widgets/AlertsWidget.jsx`  
  *CDC* : REQ-CEO-001, REQ-CEO-003  

- [ ] **B-08** · KPIWidget — KPIs depuis collection `kpis` (240 enregistrements réels)  
  *Fichiers* : `widgets/KPIWidget.jsx`  
  *CDC* : REQ-KPI-001, REQ-KPI-002, REQ-KPI-003  

---

## PHASE C — PORTAIL CLIENT FONCTIONNEL *(PRIORITÉ 2)*
**Objectif CDC** : Un client peut signer, payer, suivre son projet sans appel HYPERVISUAL  
**Modules CDC** : Module 4 (Portail Client)  
**Critères d'acceptation** :  
- Client signe son devis en ligne depuis son portail (REQ-CLIENT-006)  
- Client télécharge ses factures et voit le statut paiement (REQ-CLIENT-003/005)  
- Client uploade des documents (plans, briefs) (REQ-CLIENT-004)  
**Progression** : 0/5 stories

- [ ] **C-01** · Client — Signature devis intégrée (DocuSeal ou fallback acceptation CGV)  
  *CDC* : REQ-CLIENT-006, REQ-DEVIS-004  
  *Note* : DocuSeal intégration complète en Phase E. Phase C = acceptation in-app.

- [ ] **C-02** · Client — Upload documents (plans, briefs, visuels)  
  *CDC* : REQ-CLIENT-004  
  *Fichiers* : `portals/client/documents/DocumentUpload.jsx`

- [ ] **C-03** · Client — Suivi projet temps réel avec statuts  
  *CDC* : REQ-CLIENT-002, REQ-PROJ-002  

- [ ] **C-04** · Client — Historique factures + téléchargement PDF  
  *CDC* : REQ-CLIENT-003, REQ-CLIENT-005  

- [ ] **C-05** · Client — Messagerie simple client ↔ HYPERVISUAL  
  *CDC* : REQ-CLIENT-008  

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
5. **Skills OBLIGATOIRES** : Claude Code DOIT lire le SKILL.md approprié avant chaque story
   - Swiss compliance → `.claude/skills/swiss-compliance-engine/SKILL.md`
   - Directus patterns → `.claude/skills/directus-api-patterns/SKILL.md`
   - Multi-portal → `.claude/skills/multi-portal-architecture/SKILL.md`
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

---

## MÉTRIQUES GLOBALES

| Métrique | Valeur |
|----------|--------|
| Collections Directus | 83 actives |
| Stories Phase A (infra+display) | 47/47 ✅ |
| Stories CDC restantes | 53 à faire |
| Modules CDC couverts | 2/16 (partiel) |
| Modules CDC opérationnels | 0/16 |
| Dernier commit infra | v1.0.0-phase-6-complete |

---

## CRITÈRES D'ACCEPTATION GLOBAUX (CDC V1.2)

La plateforme V1 sera considérée opérationnelle quand :

1. `[ ]` Lead WordPress → Directus en < 30 secondes (REQ-LEAD-001)
2. `[ ]` CEO crée et envoie demande devis prestataire en < 3 minutes (REQ-PREST-001)
3. `[ ]` Client signe son devis en ligne sans formation (REQ-CLIENT-006)
4. `[ ]` Facture d'acompte QR conforme générée automatiquement à la signature (REQ-FACT-001/003)
5. `[ ]` Portail client affiche statut projet en temps réel (REQ-CLIENT-002)
6. `[ ]` Facture prestataire uploadée et associée en < 2 minutes (REQ-FACT-008)
7. `[ ]` Marge brute projet visible en temps réel dans dashboard CEO (REQ-FACT-009)
8. `[ ]` CEO gère un projet complet depuis Chypre sans email ni appel (REQ-CEO général)
9. `[ ]` 240 KPIs existants affichés correctement sans recalcul (REQ-KPI-001)
10. `[ ]` Facture fournisseur suit OCR → validation CEO → paiement Revolut (REQ-APPRO-001)
11. `[ ]` Taux rapprochement bancaire automatique ≥ 85% (REQ-RECO-001)
12. `[ ]` Avoir générable en < 3 clics, conforme QR-Invoice (REQ-AVOIR-001)
