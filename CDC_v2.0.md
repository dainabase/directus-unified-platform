# CAHIER DES CHARGES — HYPERVISUAL SWITZERLAND
## Plateforme Directus Unified Platform — Version 2.0

**Version** : 2.0  
**Date** : Février 2026  
**Statut** : Document de référence — Post-Audit, Orienté Production  
**Auteur** : Jean (CEO HYPERVISUAL) + Claude (Architecte Senior IA)  
**Confidentialité** : Usage interne uniquement

> **Changelog v2.0** :
> - Basé sur l'**État des lieux v1.0** (audit terrain du 21 février 2026)
> - Abandon du paradigme "feature-first" → adoption du paradigme "**workflow-first**"
> - 3 axes stratégiques v3 : **CONNECTER · SIMPLIFIER UX · RENDRE VISIBLE**
> - Intégration du feedback CEO direct (test utilisateur réel du 21/02/2026)
> - Design System v1.3 (monochromatic Apple Premium) conservé intégralement
> - Toutes les sections v1.3 sont préservées — ce document les complète et les corrige
> - Suppression des chiffres optimistes : on travaille sur les vrais chiffres désormais

> **Vérité de départ v2.0** :
> - Code écrit : 94% ✅
> - Connecté à Directus (données réelles) : ~45% ⚠️
> - Intégrations visibles dans l'UI : ~25% ❌
> - Boutons/actions fonctionnels : ~40% ⚠️
> - Prêt pour production : **Non — 6-8 semaines**

---

## TABLE DES MATIÈRES

1. [Contexte et diagnostic](#1-contexte-et-diagnostic)
2. [Les 5 workflows CEO quotidiens](#2-les-5-workflows-ceo-quotidiens)
3. [Architecture cible v3](#3-architecture-cible-v3)
4. [Axe 1 — CONNECTER](#4-axe-1--connecter)
5. [Axe 2 — SIMPLIFIER L'UX](#5-axe-2--simplifier-lux)
6. [Axe 3 — RENDRE VISIBLE](#6-axe-3--rendre-visible)
7. [Collections manquantes](#7-collections-manquantes)
8. [Intégrations externes — Cible](#8-intégrations-externes--cible)
9. [Conformité Suisse](#9-conformité-suisse)
10. [Design System v1.3](#10-design-system-v13) *(identique à CDC v1.3 §14)*
11. [Règles de développement Claude Code](#11-règles-de-développement-claude-code)
12. [Critères de succès production](#12-critères-de-succès-production)

---

## 1. CONTEXTE ET DIAGNOSTIC

### 1.1 Situation au 21 février 2026

La plateforme a traversé 10 phases de développement (Phase 0 à Phase 10), totalisant 102 stories. Le code est solide, testé (136 tests 100% pass), sécurisé (post-audit Phase 10, score 72/100). Cependant, un test utilisateur terrain du CEO le 21 février a révélé un écart fondamental entre ce qui est codé et ce qui est utilisable.

**Feedback CEO direct** :
- *"Énormément de boutons qui ne fonctionnent pas"*
- *"Invoice Ninja, Mautic — on ne les voit même pas"*
- *"On dirait que rien n'est connecté"*
- *"L'UX n'est pas logique par rapport à comment je travaille"*
- *"C'est très brouillon"*
- *"On est loin de passer en production"*

### 1.2 Cause racine

La plateforme a été construite **feature-by-feature** en suivant le ROADMAP, jamais **workflow-by-workflow** en suivant la journée réelle du CEO.

Résultat : 102 stories complétées, mais le CEO ne peut pas accomplir ses 5 tâches quotidiennes primaires sans quitter la plateforme.

### 1.3 Décision architecturale v2.0

**Pivot de paradigme** : Feature-first → **Workflow-first**

La v3 ne rajoute aucune nouvelle feature tant que les workflows existants ne fonctionnent pas de bout en bout. Chaque story v3 doit répondre à la question : *"Quel workflow CEO cette story complète-t-elle ?"*

---

## 2. LES 5 WORKFLOWS CEO QUOTIDIENS

Ce sont les 5 workflows non-négociables. La plateforme est prête pour la production quand ces 5 workflows fonctionnent sans quitter l'interface.

### Workflow 1 — Cycle Vente Complet

```
Lead entrant
  → Qualification LLM automatique
  → Devis créé dans Directus
  → Devis envoyé via Invoice Ninja
  → Signature DocuSeal + CGV acceptées
  → Facture acompte 30% générée automatiquement
  → Paiement Revolut reçu + HMAC validé
  → Projet activé automatiquement
  → Email accusé réception client (Mautic)
```

**État actuel** : Code backend OK pour chaque étape. Aucun workflow testé en condition réelle. La chaîne complète n'a jamais été exécutée de bout en bout.

### Workflow 2 — Gestion Paiements Entrants

```
Transaction Revolut reçue
  → Matching automatique facture (3 stratégies)
  → Statut facture mis à jour (Directus + Invoice Ninja)
  → Notification CEO si anomalie
  → Rapprochement bancaire automatique
  → Comptabilité PME Käfer mise à jour
```

**État actuel** : Banking page conditionnelle au token Revolut actif. Pas d'alerte si token expiré.

### Workflow 3 — Validation Facture Prestataire

```
Prestataire upload facture
  → OCR automatique (OpenAI Vision)
  → Extraction TVA, montants, fournisseur
  → Notification CEO pour validation
  → CEO valide depuis l'interface
  → Paiement Revolut déclenché
  → Comptabilité mise à jour
```

**État actuel** : OCR 100% fonctionnel. Bouton "Valider + Payer via Revolut" absent de l'UI.

### Workflow 4 — Vue Projet CEO

```
Dashboard CEO
  → Liste projets actifs avec statut en un coup d'œil
  → Jalons en retard signalés
  → Prestataires assignés
  → Budget restant
  → Prochaine action requise
```

**État actuel** : Dashboard fragmenté. Pas de vue projet consolidée. Le CEO doit naviguer entre plusieurs sections.

### Workflow 5 — Relance Client

```
Facture en retard détectée (J+7)
  → Alerte dans dashboard CEO
  → CEO déclenche relance (ou automatique)
  → Email Mautic envoyé avec QR-Invoice
  → Statut relance tracé
  → Escalade J+14, J+30
```

**État actuel** : Cron relances codé. Non déclenché depuis l'UI. Mautic invisible dans l'interface.

---

## 3. ARCHITECTURE CIBLE v3

### 3.1 Navigation SuperAdmin — Cible

La sidebar SuperAdmin passe de **15+ entrées** à **7 entrées niveau 1** maximum :

```
HYPERVISUAL
├── 🏠 Dashboard CEO          ← Vue unifiée des 5 workflows
├── 💼 Projets & Opérations   ← Projets + Prestataires + Tâches
├── 💰 Finance                ← Sous-menu : Factures, Banking, Compta, TVA, Dépenses
├── 👥 CRM & Commercial       ← Leads, Companies, Contacts, Pipeline, Devis
├── ⚙️  Automation            ← Workflows, Email Templates, Notifications
├── 🔗 Intégrations           ← Invoice Ninja Hub, Mautic Hub, Revolut Hub, ERPNext Hub
└── ⚙️  Paramètres            ← Configuration, Utilisateurs, Sécurité
```

### 3.2 Hub Intégrations — Concept

Chaque service externe dispose d'une page Hub dédiée, accessible depuis la sidebar "Intégrations" :

**Invoice Ninja Hub** :
- Statut connexion (online/offline)
- Dernières factures envoyées
- Raccourcis : Créer devis, Envoyer facture, Voir impayés
- Synchronisation manuelle si besoin

**Mautic Hub** :
- Statut connexion
- Campagnes actives + stats (ouvertures, clics)
- Raccourcis : Envoyer relance, Nouvelle campagne, Templates
- File d'attente emails

**Revolut Hub** :
- Balances multi-comptes (CHF, EUR, USD)
- Transactions récentes
- Raccourcis : Initier virement, Rapprocher transaction
- Statut OAuth token (expire le...)

**ERPNext Hub** :
- Statut synchronisation
- Stock critique, RH, fournisseurs
- Raccourcis vers modules ERPNext pertinents

### 3.3 Dashboard CEO — Cible

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 Actions Urgentes (si >0)                                     │
│  • 3 factures en retard  • 1 signature en attente               │
├──────────────────┬──────────────────┬──────────────────────────┤
│  MRR / ARR       │  Cash Revolut    │  Projets actifs (N)       │
│  CHF xx,xxx      │  CHF xx,xxx      │  N en retard              │
├──────────────────┴──────────────────┴──────────────────────────┤
│  Workflow Cycle Vente          │  Trésorerie 30j               │
│  [Leads N] [Devis N] [Proj N]  │  [Recharts BarChart]          │
├────────────────────────────────┴──────────────────────────────┤
│  Projets actifs (DataTable, 5 colonnes max)                     │
│  + Alertes intelligentes (retards, paiements en attente)        │
├────────────────────────────────────────────────────────────────┤
│  Statut intégrations : [Invoice Ninja ✅] [Mautic ✅] [Revolut ✅] [ERPNext ✅] │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. AXE 1 — CONNECTER

**Objectif** : Tout ce qui est codé doit devenir fonctionnel. Zéro mock data dans l'interface.

### 4.1 Collections Directus à créer

| Collection | Module | Champs requis | Priorité |
|------------|--------|---------------|----------|
| `commissions` | Module 25 Revendeur | reseller_id, deal_id, amount, rate, base, status, paid_at | 🔥 CRITIQUE |
| `messages` | Module 24 Messagerie | sender_id, recipient_id, project_id, content, attachments, read_at, created_at | 🔥 CRITIQUE |
| `knowledge_base` | Module 22 Prestataire | title, content, category, tags, author_id, published, created_at | ⚡ HIGH |
| `email_templates` | Module 20 Automation | name, subject, body_html, variables, language, mautic_id, created_at | ⚡ HIGH |

### 4.2 Mock data à éliminer

| Fichier | Type mock | Remplacement |
|---------|-----------|-------------|
| `CommissionsPage.jsx` | 100% mock | Collection `commissions` Directus |
| `Dashboard.jsx` (Revendeur) | Commissions en mock | Collection `commissions` |
| `Marketing.jsx` (Revendeur) | 3 templates mock | Collection `email_templates` + Mautic API |
| `BudgetManager` | Fallback cascade | Collections `budgets`, `kpis` réelles uniquement |
| `WorkflowsPage.jsx` | Statuts fictifs | Vraie vérification Directus Flows |

### 4.3 Pages non connectées à corriger

| Page | Problème | Correction |
|------|----------|------------|
| Settings / Paramètres | Actions non connectées | Endpoints API + Directus config |
| Banking Dashboard | Silencieux si token expiré | Graceful degradation + alerte + lien renouvellement |
| WorkflowsPage | États non vérifiés | Polling état réel Directus Flows |
| Module 20 Email Templates | Mautic sync non testée | Test live + fallback UI |

### 4.4 Workflows backend à valider en conditions réelles

1. **Workflow Signature DocuSeal → facture acompte** : Test avec un vrai document DocuSeal
2. **Workflow Paiement Revolut → activation projet** : Test avec une vraie transaction Revolut
3. **Workflow Relances automatiques** : Vérification cron en production
4. **Workflow Lead qualification LLM** : Test avec un vrai lead entrant
5. **Workflow Rapport mensuel CEO** : Vérification cron 1er du mois

### 4.5 Revolut Token Management — Cible

```
Si token valide :     Afficher données temps réel
Si token expirant :   Banner orange "Token Revolut expire dans X jours — Renouveler"
Si token expiré :     Page dégradée propre + bouton "Reconnecter Revolut OAuth2"
                      (jamais une page blanche ou une erreur console)
```

---

## 5. AXE 2 — SIMPLIFIER L'UX

**Objectif** : La navigation suit les workflows CEO, pas la liste des features.

### 5.1 Nouvelle structure sidebar SuperAdmin

```
HYPERVISUAL
├── 🏠 Dashboard
│
├── 💰 Finance
│   ├── Factures clients
│   ├── Factures fournisseurs
│   ├── Banking Revolut
│   ├── Comptabilité (PME Käfer)
│   ├── Rapports mensuels
│   ├── TVA (Formulaire 200)
│   ├── Dépenses
│   └── Abonnements
│
├── 💼 Projets
│   ├── Vue d'ensemble
│   ├── Jalons & Livrables
│   ├── Time tracking
│   ├── Legal & Contrats
│   └── Support & Tickets
│
├── 👥 CRM
│   ├── Dashboard CRM
│   ├── Leads & Pipeline
│   ├── Companies
│   └── Contacts
│
├── ⚙️ Automation
│   ├── Workflows
│   ├── Email Templates
│   └── Notifications
│
├── 🔗 Intégrations          ← NOUVELLE SECTION
│   ├── Invoice Ninja Hub
│   ├── Mautic Hub
│   ├── Revolut Hub
│   └── ERPNext Hub
│
└── ⚙️ Paramètres
```

### 5.2 Règle UX — Actions contextuelles

- **Page Facture client** : Bouton "Envoyer via Invoice Ninja" · "Envoyer relance Mautic" · "Télécharger QR-Invoice"
- **Page Facture fournisseur validée** : Bouton "Payer via Revolut"
- **Page Projet** : Bouton "Contacter prestataire" · "Voir facture liée"
- **Page Devis** : Bouton "Envoyer pour signature (DocuSeal)" · "Envoyer par email (Mautic)"

---

## 6. AXE 3 — RENDRE VISIBLE

**Objectif** : Invoice Ninja, Mautic, ERPNext apparaissent naturellement dans les pages pertinentes.

### 6.1 Intégration Invoice Ninja dans les pages existantes

| Page | Ajout |
|------|-------|
| Factures clients (liste) | Statut Invoice Ninja en colonne · Bouton Envoyer |
| Facture client (détail) | Section "Invoice Ninja" : statut envoi, vue dans IN, resend |
| Devis (liste + détail) | Bouton "Envoyer via Invoice Ninja" · Statut IN |
| Dashboard CEO | Widget "Impayés Invoice Ninja" |

### 6.2 Intégration Mautic dans les pages existantes

| Page | Ajout |
|------|-------|
| Facture client en retard | Bouton "Envoyer relance (Mautic)" |
| Dashboard CEO | Stat "Emails envoyés ce mois" depuis Mautic |
| Automation → Workflows | Lien direct vers campagnes Mautic actives |
| Hub Mautic | Page dédiée complète |

### 6.3 Intégration Revolut dans les pages existantes

| Page | Ajout |
|------|-------|
| Facture fournisseur validée | Bouton "Payer via Revolut" → confirmation → paiement |
| Dashboard CEO | Balance Revolut live (CHF, EUR) |
| Banking Dashboard | Si token expiré : dégradation gracieuse |

### 6.4 Dashboard CEO — Barre statut intégrations

```
Intégrations : [🟢 Invoice Ninja] [🟢 Mautic] [🟡 Revolut — token expire dans 3j] [🔴 ERPNext — déconnecté]
```

Clic sur chaque pastille → Hub de l'intégration.

---

## 7. COLLECTIONS MANQUANTES

### 7.1 Collection `commissions`

```javascript
{
  id: uuid (PK),
  reseller_id: m2o → contacts,
  deal_id: m2o → projects,
  invoice_id: m2o → client_invoices,
  amount: decimal(10,2),
  rate: decimal(5,2),
  base_amount: decimal(10,2),
  status: enum ['pending', 'validated', 'paid'],
  paid_at: timestamp nullable,
  payment_ref: string nullable,
  notes: text nullable,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 7.2 Collection `messages`

```javascript
{
  id: uuid (PK),
  sender_id: m2o → directus_users,
  recipient_id: m2o → directus_users,
  project_id: m2o → projects nullable,
  content: text,
  attachments: json [],
  read_at: timestamp nullable,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 7.3 Collection `knowledge_base`

```javascript
{
  id: uuid (PK),
  title: string,
  content: text (markdown),
  category: enum ['led', 'totem', 'hologramme', 'software', 'general'],
  tags: json [],
  author_id: m2o → directus_users,
  published: boolean default false,
  featured_image: uuid → directus_files nullable,
  attachments: json [],
  created_at: timestamp,
  updated_at: timestamp
}
```

### 7.4 Collection `email_templates`

```javascript
{
  id: uuid (PK),
  name: string,
  type: enum ['devis', 'facture', 'relance', 'confirmation_projet', 'acompte', 'autre'],
  subject: string,
  body_html: text,
  body_text: text nullable,
  variables: json [],
  language: enum ['fr', 'de', 'en'],
  mautic_id: integer nullable,
  active: boolean default true,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 7.5 Vérifications MCP obligatoires avant développement

**Règle** : Toujours `list_collections` + `describe_table` avant de coder.

---

## 8. INTÉGRATIONS EXTERNES — CIBLE

| Service | Backend | UI Hub | Actions contextuelles | Tests live |
|---------|---------|--------|-----------------------|------------|
| Invoice Ninja v5 | ✅ OK | 🔴 À créer | 🔴 À ajouter | 🔴 À faire |
| Revolut Business | ✅ OK | 🟡 Partiel | 🔴 Paiement fournisseur | 🔴 À faire |
| Mautic 5.x | ✅ OK | 🔴 À créer | 🔴 Relance client | 🔴 À faire |
| ERPNext v15 | ✅ OK | 🔴 À créer | 📌 Optionnel v3 | 🔴 À faire |
| DocuSeal | ✅ OK | ✅ Via portail client | 🟡 Webhook non testé | 🔴 À faire |
| OpenAI Vision (OCR) | ✅ OK | ✅ Upload fournisseur | ✅ OK | ✅ Seul testé |
| Claude AI (LLM) | ✅ OK | 🔴 Invisible | 📌 Rapport CEO | 🔴 À faire |

**Priorités v3** :
1. Invoice Ninja — envoi devis/factures, cœur du cycle vente
2. Revolut — paiement fournisseur + gestion token
3. Mautic — relances + emails transactionnels
4. DocuSeal — validation webhook en conditions réelles
5. ERPNext — Hub lecture seule en v3

---

## 9. CONFORMITÉ SUISSE

### 9.1 Taux TVA 2025 (non-négociables)

```
TVA Standard     : 8.1%
TVA Réduit       : 2.6%
TVA Hébergement  : 3.8%
```

**Règle** : Aucun fichier ne doit contenir les anciens taux (7.7, 2.5, 3.7).

### 9.2 Standards implémentés

- QR-Invoice ISO 20022 v2.3 : ✅ Implémenté
- Formulaire TVA 200 AFC : ✅ Implémenté
- Plan comptable PME Käfer : ✅ Implémenté

### 9.3 Points légaux en suspens (→ v4)

- LPD Suisse / RGPD : Aucune politique rétention, pas de DPA
- Archivage légal CO : Durée minimale 10 ans
- Signature DocuSeal : Valeur légale à confirmer

---

## 10. DESIGN SYSTEM v1.3

*Identique à CDC v1.3 Section 14 — Apple Premium Monochromatic*

**Règles non-négociables** :
- Background : `#F5F5F7` | Texte : `#1D1D1F` | Accent unique : `#0071E3`
- Couleurs sémantiques uniquement pour les statuts
- Sidebar : 240px, glassmorphism `rgba(255,255,255,0.80)` + `backdrop-filter: blur(20px)`
- Zéro couleur pleine sur badge ou icône sans raison fonctionnelle

*Référence : `src/styles/design-system.css`*

---

## 11. RÈGLES DE DÉVELOPPEMENT CLAUDE CODE

1. **Audit d'abord** : Lire le fichier existant AVANT toute modification
2. **MCP Directus** : `list_collections` + `describe_table` avant tout mapping données
3. **MCP GitHub** : Vérifier commits récents avant de coder
4. **Zéro mock data** : Toute donnée vient de Directus ou API concernée
5. **Design System** : `src/styles/design-system.css` — aucune couleur hors palette
6. **TVA** : Vérifier 8.1/2.6/3.8 dans tout fichier Finance
7. **Tests** : `npm test` doit passer après chaque story (136 tests)
8. **Commit** : `feat(axe-X): story X.X — description`
9. **ROADMAP** : Marquer story complétée après chaque livraison

---

## 12. CRITÈRES DE SUCCÈS PRODUCTION

### Critères Fonctionnels (Go/No-Go)

- [ ] **W1** : Cycle vente complet sans quitter la plateforme
- [ ] **W2** : Balances Revolut CHF/EUR visibles en temps réel
- [ ] **W3** : Paiement Revolut → activation projet (webhook testé en réel)
- [ ] **W4** : Validation facture fournisseur + paiement via Revolut depuis l'UI
- [ ] **W5** : Relance client déclenchable depuis page facture (email Mautic tracé)

### Critères Qualité

- [ ] Zéro données mockées visibles
- [ ] Sidebar SuperAdmin ≤7 entrées niveau 1
- [ ] Invoice Ninja, Mautic, Revolut accessibles depuis pages concernées
- [ ] Barre statut intégrations visible sur dashboard
- [ ] Banking Dashboard gère gracieusement l'expiration token Revolut

### Critères Technique

- [ ] Score sécurité ≥ 85/100
- [ ] SSL certificats production configurés
- [ ] Audit npm CVE — zéro vulnérabilité critique
- [ ] Grafana monitoring déployé
- [ ] Build de production déployé

---

*CDC v2.0 — Février 2026*  
*Basé sur l'État des lieux v1.0 (audit terrain du 21 février 2026)*  
*Remplace et complète CDC v1.3 — toutes les sections v1.3 restent valides*
