# ROADMAP v2.0 — DIRECTUS UNIFIED PLATFORM
## HYPERVISUAL Switzerland

**Version** : 2.0  
**Date** : Février 2026  
**Méthode** : Story-by-story, Claude Code exécute sur instructions de l'Architecte  
**Repo** : github.com/dainabase/directus-unified-platform  

---

## LÉGENDE

```
🟢 Fait / En prod
🟡 En cours / Partiellement fait
🔴 À faire
🔵 Récupéré depuis ancien repo (à convertir React + Directus)
⚫ Supprimé (décision validée)
```

**Priorités** : 🔥 Critique · ⚡ High · 📌 Medium · 💡 Low

---

## PHASE 0 — FONDATION ✅ (Complété V1)

| # | Story | Statut | Notes |
|---|-------|--------|-------|
| 0.1 | Docker : Directus + PostgreSQL + Redis | 🟢 | |
| 0.2 | 82+ collections Directus créées | 🟢 | |
| 0.3 | OCR OpenAI Vision | 🟢 | 100% fonctionnel |
| 0.4 | Intégration Invoice Ninja v5 | 🟢 | |
| 0.5 | Intégration Revolut Business API | 🟢 | Audité phase G |
| 0.6 | Intégration ERPNext v15 | 🟢 | |
| 0.7 | Intégration Mautic 5.x | 🟢 | |
| 0.8 | Scaffold React 18.2 + Vite | 🟢 | |
| 0.9 | 4 portails structurés | 🟢 | SuperAdmin, Client, Prestataire, Revendeur |
| 0.10 | Backend Finance (16 modules, phases A-J) | 🟢 | 96/96 stories auditées — 28 bugs corrigés |

---

## PHASE 1 — DESIGN SYSTEM 🔥

**Objectif** : Appliquer le Design System Apple Premium Monochromatic (CDC §14) sur toute la plateforme avant toute nouvelle fonctionnalité.  
**Référence** : `docs/CDC_v1.3_Design_System_Consolidation.md`  
**Durée estimée** : 1 semaine (Claude Code en continu)

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 1.1 | Créer `src/styles/design-system.css` (tokens CSS complets) | 🔥 | 🔴 | Variables CSS conformes CDC §14 — palette monochromatic + accent #0071E3 |
| 1.2 | Créer composants UI de base : `Button`, `Badge`, `Card`, `Input` | 🔥 | 🔴 | Lib interne — pas de dépendance externe |
| 1.3 | Sidebar redesign complet | 🔥 | 🔴 | Glassmorphism, company switcher 5 entités, nav structure |
| 1.4 | Topbar redesign | 🔥 | 🔴 | Search dynamique, actions, notifications dot |
| 1.5 | Dashboard SuperAdmin — appliquer Design System | 🔥 | 🔴 | Layout validé CDC §14 |
| 1.6 | Créer composants réutilisables : `StatusDot`, `KPICard`, `DataTable`, `ProgressBar` | ⚡ | 🔴 | Utilisés dans tous les portails |
| 1.7 | Appliquer Design System — Portail Client | ⚡ | 🔴 | |
| 1.8 | Appliquer Design System — Portail Prestataire | ⚡ | 🔴 | |
| 1.9 | Appliquer Design System — Portail Revendeur | ⚡ | 🔴 | |

**Critère de sortie** : Tous les portails respectent le Design System. Zéro couleur décorative. Seuls les badges de statut utilisent les couleurs sémantiques.

---

## PHASE 2 — CONNEXION DONNÉES RÉELLES 🔥

**Objectif** : Brancher React ↔ Directus sur les pages déjà structurées.  
**Durée estimée** : 1-2 semaines

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 2.1 | Service layer Directus (`src/services/directus.js`) | 🔥 | 🟡 | Auth + CRUD + error handling |
| 2.2 | Authentification multi-portails JWT | 🔥 | 🟡 | 4 rôles : superadmin, client, prestataire, revendeur |
| 2.3 | Dashboard CEO — KPIs depuis vraies données | 🔥 | 🔴 | Collections : kpis, client_invoices, payments, projects |
| 2.4 | Dashboard CEO — Projets actifs en temps réel | 🔥 | 🔴 | Collection : projects, deliverables |
| 2.5 | Dashboard CEO — Pipeline commercial | 🔥 | 🔴 | Collection : leads, quotes |
| 2.6 | Dashboard CEO — Trésorerie Revolut live | 🔥 | 🔴 | API Revolut → balance + dernières transactions |
| 2.7 | Dashboard CEO — Alertes intelligentes | ⚡ | 🔴 | Factures retard, paiements en attente, projets bloqués |
| 2.8 | CRM — Companies (connecté Directus) | ⚡ | 🔴 | Récupérer UI ancien repo + data Directus |
| 2.9 | CRM — Contacts (connecté Directus) | ⚡ | 🔴 | |
| 2.10 | Leads — Liste + pipeline (connecté Directus) | ⚡ | 🔴 | |
| 2.11 | Projets — Liste + détail (connecté Directus) | ⚡ | 🔴 | |
| 2.12 | WebSocket / polling temps réel (30s) | 📌 | 🔴 | Pour dashboard CEO |

**Critère de sortie** : Le CEO peut voir ses vrais KPIs, projets et trésorerie sur le dashboard sans données mockées.

---

## PHASE 3 — FINANCE COMPLÈTE ⚡

**Objectif** : Module Finance exhaustif — toutes les pages récupérées de l'ancien repo + nouvelles.  
**Durée estimée** : 2 semaines

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 3.1 | Finance — Factures clients (liste + détail + création) | 🔥 | 🔵 | Récupérer ancien 49KB + connecter Directus |
| 3.2 | Finance — Factures fournisseurs (liste + OCR + validation) | 🔥 | 🔵 | Récupérer ancien 44KB |
| 3.3 | Finance — Comptabilité (plan PME Käfer) | ⚡ | 🔵 | Récupérer ancien 79KB — très complet |
| 3.4 | Finance — Banking Revolut (transactions + rapprochement) | 🔥 | 🟡 | BankingDashboard existant → compléter |
| 3.5 | **Module 17** — Rapports Mensuels P&L | ⚡ | 🔵 | Récupérer ancien 98KB |
| 3.6 | **Module 18** — Rapports TVA Suisse (Formulaire 200) | 🔥 | 🔵 | Récupérer ancien 70KB — obligation légale — taux 8.1/2.6/3.8 |
| 3.7 | **Module 19** — Dépenses (saisie + catégorisation + OCR) | ⚡ | 🔵 | Récupérer ancien 39KB |
| 3.8 | QR-Invoice génération (ISO 20022 v2.3) | 🔥 | 🟡 | Taux TVA confirmés 8.1/2.6/3.8 |
| 3.9 | Module 9 — Facturation par jalons | ⚡ | 🔴 | deliverables → factures auto |
| 3.10 | Module 10 — Contrats récurrents avancés | 📌 | 🔴 | MRR/ARR |
| 3.11 | Module 11 — Avoirs & Remboursements | 📌 | 🔴 | |
| 3.12 | Module 12 — Validation factures fournisseurs | ⚡ | 🔴 | Workflow OCR → CEO → Revolut |
| 3.13 | Module 15 — Dashboard KPI Finance | ⚡ | 🟡 | 240 KPIs déjà en base |
| 3.14 | Module 16 — Rapprochement bancaire renforcé | ⚡ | 🟡 | ≥85% auto-match |

**Critère de sortie** : Toute la finance accessible depuis la plateforme. Zéro besoin d'aller sur Invoice Ninja ou Revolut directement.

---

## PHASE 4 — PORTAIL PRESTATAIRE COMPLET ⚡

**Durée estimée** : 1 semaine

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 4.1 | Dashboard prestataire — données réelles | 🔥 | 🟡 | |
| 4.2 | Missions — liste (connecté Directus) | 🔥 | 🔵 | Récupérer ancien 64KB |
| 4.3 | Mission — détail (brief + matériel + contact) | 🔥 | 🔵 | Récupérer ancien 75KB |
| 4.4 | Tâches prestataire | ⚡ | 🔵 | Récupérer ancien 65KB |
| 4.5 | **Module 23** — Calendrier missions | ⚡ | 🔵 | Récupérer ancien 52KB + export iCal |
| 4.6 | **Module 24** — Messagerie CEO ↔ Prestataire | 📌 | 🔵 | Récupérer ancien 46KB |
| 4.7 | **Module 22** — Base de connaissances | 💡 | 🔵 | Récupérer ancien 50KB + article 49KB |
| 4.8 | Profil prestataire | 📌 | 🟡 | |
| 4.9 | Upload facture prestataire + OCR auto | 🔥 | 🔴 | Déclencheur → Module 12 |
| ~~4.10~~ | ~~Performance~~ | ⚫ | ⚫ | Supprimé — non pertinent |
| ~~4.11~~ | ~~Récompenses~~ | ⚫ | ⚫ | Supprimé — non pertinent |

---

## PHASE 5 — PORTAIL REVENDEUR COMPLET ⚡

**Durée estimée** : 1 semaine

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 5.1 | Dashboard revendeur — données réelles | 🔥 | 🟡 | |
| 5.2 | Pipeline revendeur (Kanban + liste) | ⚡ | 🔵 | Récupérer ancien 59KB |
| 5.3 | Leads revendeur | ⚡ | 🔵 | Récupérer ancien 58KB |
| 5.4 | Clients revendeur + détail | ⚡ | 🔵 | Récupérer ancien 51KB + 69KB |
| 5.5 | **Module 25** — Commissions | ⚡ | 🔵 | Récupérer ancien 55KB |
| 5.6 | Devis revendeur | ⚡ | 🟡 | quotes/ existant → compléter |
| 5.7 | Marketing revendeur (assets + campagnes) | 📌 | 🔵 | Récupérer ancien 54KB |
| 5.8 | Rapports revendeur | 📌 | 🔵 | Récupérer ancien 52KB |

---

## PHASE 6 — PORTAIL CLIENT COMPLET ⚡

**Durée estimée** : 1 semaine

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 6.1 | Dashboard client — suivi projet temps réel | 🔥 | 🟡 | |
| 6.2 | Projets client — statut + jalons | 🔥 | 🔴 | |
| 6.3 | Documents client (devis, contrats, factures) | ⚡ | 🔵 | Combiner ancien + Directus |
| 6.4 | Finances client (factures + solde) | ⚡ | 🔵 | Récupérer ancien |
| 6.5 | Paiement client (QR-Invoice + Revolut link) | 🔥 | 🟡 | |
| 6.6 | Signature devis DocuSeal | 🔥 | 🟡 | Audité phase H |
| 6.7 | Activation projet automatique à paiement | 🔥 | 🔴 | Revolut webhook → Directus |
| 6.8 | Support/Tickets client | 📌 | 🟡 | |
| 6.9 | Profil client | 📌 | 🟡 | |

---

## PHASE 7 — AUTOMATION & IA ⚡

**Durée estimée** : 1-2 semaines

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 7.1 | **Module 20** — Email Templates (éditeur + Mautic sync) | ⚡ | 🔵 | Récupérer ancien 18KB |
| 7.2 | **Module 21** — Workflows visuels (liste + historique) | ⚡ | 🔵 | Récupérer ancien 19KB |
| 7.3 | Workflow : Lead entrant → qualification LLM | 🔥 | 🔴 | Claude API |
| 7.4 | Workflow : Signature → facture acompte auto | 🔥 | 🔴 | |
| 7.5 | Workflow : Paiement → activation projet auto | 🔥 | 🔴 | Revolut webhook |
| 7.6 | Workflow : Relances automatiques (J+7, J+14, J+30) | ⚡ | 🔴 | Via Mautic |
| 7.7 | Workflow : Rapport mensuel CEO (1er du mois) | 📌 | 🔴 | |
| 7.8 | Notification — Automation (hub + historique) | ⚡ | 🔵 | Récupérer ancien 28KB |
| 7.9 | Module 13 — Time tracking → facturation régie | 📌 | 🔴 | |
| 7.10 | Module 14 — Tickets support → facturation hors contrat | 📌 | 🔴 | |
| 7.11 | Intégration WhatsApp Business → Lead auto | 💡 | 🔴 | Déféré |
| 7.12 | Intégration Ringover + résumé LLM appels | 💡 | 🔴 | |

---

## PHASE 8 — QUALITÉ & PRODUCTION 📌

**Durée estimée** : 1 semaine

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 8.1 | Tests end-to-end cycle complet (Lead → Paiement) | 🔥 | 🔴 | |
| 8.2 | Correction taux TVA OCR (7.7→8.1, 2.5→2.6, 3.7→3.8) | 🔥 | 🔴 | TODO urgent — fichiers : finance-ocr-ai.js, ocr-hybrid-processor.js, expenses-notion.js |
| 8.3 | Permissions granulaires RBAC (4 rôles) | ⚡ | 🟡 | |
| 8.4 | Audit sécurité (JWT expiry, HTTPS, rate limiting) | ⚡ | 🔴 | |
| 8.5 | Performance (lazy loading, pagination, cache Redis) | ⚡ | 🔴 | |
| 8.6 | Responsive mobile (dashboard CEO en tablet) | 📌 | 🔴 | |
| 8.7 | Documentation API des 156 endpoints custom | 📌 | 🔴 | |
| 8.8 | Grafana monitoring (dashboards existants) | 📌 | 🟡 | |
| 8.9 | Mise à jour ROADMAP.md après chaque story | 🔥 | 🟢 | Règle Claude Code — en cours |

---

## PHASE 9 — MULTI-ENTREPRISES 📌

**Déclencheur** : HYPERVISUAL Switzerland V2 validée et stable

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 9.1 | Architecture isolation données par entreprise | 🔥 | 🔴 | company_id sur toutes collections |
| 9.2 | DAINAMICS — onboarding | 📌 | 🔴 | |
| 9.3 | LEXAIA — onboarding | 📌 | 🔴 | |
| 9.4 | ENKI REALTY — onboarding | 📌 | 🔴 | orthographe exacte : ENKI REALTY |
| 9.5 | TAKEOUT — onboarding | 📌 | 🔴 | |
| 9.6 | Dashboard CEO multi-entreprises (vue consolidée) | ⚡ | 🔴 | |

---

## RÉCAPITULATIF CHIFFRÉ

| Phase | Stories | Statut global |
|-------|---------|--------------|
| Phase 0 — Fondation + V1 backend | 10 | ✅ 100% complété |
| Phase 1 — Design System | 9 | 🔴 0% — priorité absolue |
| Phase 2 — Données réelles | 12 | 🟡 ~15% |
| Phase 3 — Finance UI | 14 | 🟡 ~25% |
| Phase 4 — Prestataire | 9 | 🟡 ~20% |
| Phase 5 — Revendeur | 8 | 🟡 ~15% |
| Phase 6 — Client | 9 | 🟡 ~30% |
| Phase 7 — Automation & IA | 12 | 🔴 ~5% |
| Phase 8 — Qualité | 9 | 🟡 ~10% |
| Phase 9 — Multi-entreprises | 6 | 🔴 0% |
| **TOTAL** | **98 stories** | **~20% global** |

---

## RÈGLES POUR CLAUDE CODE (RAPPEL)

Chaque prompt Claude Code doit obligatoirement inclure :

1. **Skills à lire** : chemins `~/.claude/skills-repos/` pertinents
2. **Vérification Directus** : utiliser MCP pour confirmer les champs avant de coder
3. **MAJ ROADMAP.md** : marquer la story comme complétée après chaque livraison
4. **Design System** : référencer `src/styles/design-system.css` (tokens CSS)
5. **Commit clair** : `feat(phase-X): story X.X — description`

## POINTS D'ATTENTION CRITIQUES

- **ENKI REALTY** : orthographe exacte (pas ENKY, pas ENKI seul)
- **Recharts** pour les graphiques (PAS ApexCharts)
- **Design System §14** : monochromatic, accent #0071E3 uniquement, zéro couleur décorative
- **TVA Suisse** : 8.1% / 2.6% / 3.8% (pas 7.7/2.5/3.7)
- **Projet démarre** uniquement après signature DocuSeal + paiement Revolut confirmé
- **Mautic** pour TOUS les emails (marketing + transactionnels)

---

*Roadmap v2.0 — Février 2026*  
*Remplace ROADMAP.md V1 (phases A-J archivé dans docs/archive/)*  
*98 stories identifiées — Phase 1 (Design System) : PRIORITÉ ABSOLUE*
