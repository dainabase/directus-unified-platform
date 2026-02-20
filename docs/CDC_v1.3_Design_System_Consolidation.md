# CAHIER DES CHARGES — HYPERVISUAL SWITZERLAND
## Plateforme Directus Unified Platform — Version 1.3

**Version** : 1.3  
**Date** : Février 2026  
**Statut** : Document de référence — Design System & Consolidation Repos  
**Auteur** : Jean (CEO HYPERVISUAL) + Claude (Architecte IA)  
**Confidentialité** : Usage interne uniquement

> **Changelog v1.3** :
> - Nouveau **Section 14 — Design System Apple Premium** (monochromatic, sobre, professionnel)
> - Nouveau **Module 17 — Finance : Rapports Mensuels** (récupéré ancien repo, 98KB de logique)
> - Nouveau **Module 18 — Finance : Rapports TVA Suisse** (récupéré ancien repo, 70KB)
> - Nouveau **Module 19 — Finance : Gestion des Dépenses** (récupéré ancien repo)
> - Nouveau **Module 20 — Automation : Email Templates** (récupéré ancien repo)
> - Nouveau **Module 21 — Automation : Workflows Visuels** (récupéré ancien repo)
> - Nouveau **Module 22 — Prestataire : Base de Connaissances** (récupéré ancien repo)
> - Nouveau **Module 23 — Prestataire : Calendrier Missions** (récupéré ancien repo)
> - Nouveau **Module 24 — Prestataire : Messagerie** (récupéré ancien repo)
> - Nouveau **Module 25 — Revendeur : Commissions** (récupéré ancien repo)
> - **Supprimés** : Prestataire — Performance & Récompenses (non pertinents métier)
> - Tous les contenus v1.2 sont préservés intégralement

> **Scope V1** : HYPERVISUAL Switzerland uniquement. Architecture multi-entreprises anticipée dès la conception.

> **Principe directeur** : Prendre le meilleur des deux repos (ancien Notion + Directus actuel) sans perdre aucune fonctionnalité.

---

## TABLE DES MATIÈRES

*(Sections 1 à 13 : identiques à v1.2 — voir CDC_HYPERVISUAL_Switzerland_Directus_Unified_Platform.md)*

14. [Design System — Apple Premium Monochromatic](#14-design-system--apple-premium-monochromatic) ← **NOUVEAU**
15. [Consolidation Repos — Plan de Migration UI](#15-consolidation-repos--plan-de-migration-ui) ← **NOUVEAU**
16. [Modules 17 à 25 — Fonctionnalités Récupérées](#16-modules-17-à-25--fonctionnalités-récupérées) ← **NOUVEAU**
17. [Roadmap v2.0](#17-roadmap-v20) ← **MIS À JOUR**

---

## 14. DESIGN SYSTEM — APPLE PREMIUM MONOCHROMATIC

### 14.1 Philosophie

L'interface doit transmettre **autorité, clarté et sobriété**. C'est un outil de travail professionnel utilisé quotidiennement par le CEO — pas une landing page marketing. Chaque élément doit justifier sa présence.

**Références** : Apple Business Intelligence, Linear, Notion (sidebar), Vercel Dashboard  
**Anti-références** : Tableaux de bord colorés type Google Analytics, Bootstrap admin templates

### 14.2 Palette de Couleurs

#### Couleurs de base (monochromatic)

```
Background principal   : #F5F5F7  (gris Apple clair)
Surface / Cards        : #FFFFFF  (blanc pur)
Surface secondaire     : rgba(255,255,255,0.80) (glassmorphism sidebar)
Texte principal        : #1D1D1F  (noir Apple)
Texte secondaire       : #6E6E73  (gris moyen)
Texte tertiaire        : #AEAEB2  (gris clair — labels, meta)
Bordures légères       : rgba(0,0,0,0.08)
Bordures moyennes      : rgba(0,0,0,0.12)
```

#### Couleur d'accentuation unique

```
Accent principal       : #0071E3  (bleu Apple — SEULE couleur vive)
Accent hover           : #0077ED
Accent light (bg)      : rgba(0,113,227,0.10)
```

#### Couleurs sémantiques (signaux uniquement — usage limité)

Ces couleurs ne servent qu'à communiquer un **état** (jamais pour la décoration) :

```
Succès / Payé          : #34C759  (vert Apple)  — point • ou badge minimal
Attention / En cours   : #FF9500  (orange Apple) — point • ou badge minimal
Danger / Retard        : #FF3B30  (rouge Apple)  — point • ou badge minimal
Info                   : #0071E3  (bleu — même que l'accent)
```

**Règle d'or** : Un badge de statut = fond très clair (opacity 12%) + texte couleur + taille max 11px. Jamais de couleur pleine sur un badge ou une icône sans raison fonctionnelle.

### 14.3 Typographie

```
Font principale        : -apple-system, 'SF Pro Display', 'Inter', sans-serif
Antialiasing          : -webkit-font-smoothing: antialiased
Taille de base        : 14px
Line height           : 1.5

Hiérarchie :
  Titre de page        : 15px, weight 600, letter-spacing -0.2px
  Titre de card        : 13.5px, weight 600
  Corps                : 13.5px, weight 450
  Label                : 12px, weight 450, color text-secondary
  Meta / timestamp     : 11px, weight 400, color text-tertiary
  Badge / pill         : 11px, weight 600
  Nav item             : 13.5px, weight 450 (500 si actif)
  Nav label section    : 11px, weight 600, uppercase, letter-spacing 0.6px
```

### 14.4 Espacements et Géométrie

```
Border radius :
  Petits éléments (badges, inputs)  : 6-8px
  Cards, modals                      : 12px
  Grande card hero                   : 16px
  Sidebar logo mark                  : 8px
  Avatar                             : 50% (cercle)

Padding :
  Card body                          : 16px 18px
  Card header                        : 16px 18px 14px
  Sidebar nav item                   : 8px 12px
  Topbar                             : 0 24px
  Content area                       : 24px

Gaps :
  KPI grid                           : 12px
  Main grid                          : 16px
  Sidebar nav items                  : 2px
  Inline icon + text                 : 10px
```

### 14.5 Ombres

```
Shadow sm (cards au repos)           : 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
Shadow (cards au hover)              : 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)
Shadow lg (modals, dropdowns)        : 0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)
Focus ring                           : 0 0 0 3px rgba(0,113,227,0.20)
```

### 14.6 Composants — Spécifications

#### Sidebar
- Largeur : 240px fixe
- Fond : `rgba(255,255,255,0.80)` + `backdrop-filter: blur(20px) saturate(180%)`
- Bordure droite : `1px solid rgba(0,0,0,0.08)`
- Logo mark : 32x32px, fond `#1D1D1F`, radius 8px
- Company switcher : pills compactes en haut (HV / DA / LX / ER / TO)
- Nav item actif : fond `rgba(0,113,227,0.10)`, texte `#0071E3`
- Section labels : uppercase 11px, gris tertiaire, espacement 0.6px
- Footer user : avatar gradient + nom + rôle

#### Topbar
- Hauteur : 52px
- Fond : même glassmorphism que sidebar
- Bordure basse : `1px solid rgba(0,0,0,0.08)`
- Search bar : s'élargit au focus (200→250px), focus ring bleu

#### Cards
- Fond : `#FFFFFF` + bordure + shadow-sm
- Hover : shadow md + transform translateY(-1px) — transition 0.2s
- Header : toujours séparé du body par une fine bordure
- Action link : texte bleu 12px aligné à droite du titre

#### KPI Cards
- 4 colonnes en grille
- Icône : 34x34px, radius 9px, fond light de la couleur d'état ou bleu
- Valeur : 26px, weight 700, letter-spacing -0.5px
- Trend badge : vert ou rouge selon direction, fond opacity 12%

#### Badges de statut
```
Structure : fond couleur-light (opacity 12%) + texte couleur + padding 2-3px 7-8px + radius 6px
Taille : 11px weight 600
Largeur fixe recommandée pour l'alignement tableau : 64-72px text-align center
```

#### Tableaux / Listes
- Pas de fond alternant sur les lignes
- Séparateur : `border-bottom: 1px solid rgba(0,0,0,0.06)` uniquement
- Point de statut (•) : 8px diameter, couleur sémantique, flex-shrink 0

#### Inputs / Forms
```
Background        : rgba(0,0,0,0.05)
Border            : 1px solid rgba(0,0,0,0.08)
Border radius     : 8px
Padding           : 8px 12px
Font              : 13px, inherit
Focus             : background white, border bleu, ring bleu
```

#### Boutons
```
Primary    : bg #0071E3, text white, radius 8px, padding 7px 14px, font 13px 500
Secondary  : bg rgba(0,0,0,0.06), text primary, mêmes dimensions
Hover      : primary → #0077ED / secondary → rgba(0,0,0,0.09)
Transition : all 0.15s
Icon       : 14x14px, gap 6px
```

### 14.7 Micro-interactions

```
Card hover         : box-shadow + translateY(-1px), durée 200ms, ease
Nav item hover     : background fade, durée 150ms
Search bar focus   : width expand + border + ring, durée 200ms
Button hover       : color shift, durée 150ms
Sidebar collapse   : slide + fade, durée 250ms, ease-out
Progress bar       : width animée, durée 300ms
```

### 14.8 Règles d'utilisation des couleurs (résumé)

| Contexte | Couleur autorisée |
|----------|------------------|
| Interface générale | Noir, blanc, gris uniquement |
| Élément interactif, lien, CTA | Bleu #0071E3 uniquement |
| Icône de navigation | Gris secondaire (actif → bleu) |
| Badge statut payé | Vert (fond light + texte) |
| Badge statut en attente | Orange (fond light + texte) |
| Badge statut retard/danger | Rouge (fond light + texte) |
| Badge statut info | Bleu (fond light + texte) |
| Graphiques | Bleu dominant + gris pour les autres séries |
| Fond de KPI icon | Bleu light uniquement (pas de vert/orange/violet en icône) |

---

## 15. CONSOLIDATION REPOS — PLAN DE MIGRATION UI

### 15.1 Décision architecturale

**Architecture conservée à 100%** : Directus + PostgreSQL + React 18.2  
**Source UI** : Meilleur des deux repos — ancien Notion repo pour richesse des pages, Directus pour structure React

### 15.2 Matrice de décision page par page

#### SuperAdmin

| Page | Source retenue | Raison |
|------|---------------|--------|
| Dashboard CEO | Directus (base) + ancien (widgets) | Combiner |
| CRM — Companies | Ancien (34KB) | Plus complet |
| CRM — Contacts | Ancien (43KB) | Plus complet |
| CRM — Dashboard | Ancien (25KB) | À récupérer |
| Finance — Factures entrantes | Ancien (44KB) | Plus complet |
| Finance — Factures sortantes | Ancien (49KB) | Plus complet |
| Finance — Comptabilité | Ancien (79KB) | **Nettement plus complet** |
| Finance — Rapports mensuels | Ancien (98KB) | **Absent de Directus → Module 17** |
| Finance — TVA | Ancien (70KB) | **Absent de Directus → Module 18** |
| Finance — Banking | Directus (BankingDashboard) | Plus connecté Revolut |
| Finance — Dépenses | Ancien (39KB) | **Absent de Directus → Module 19** |
| OCR Premium | Directus (fonctionnel) + ancien (UI) | Combiner |
| Automation — Email templates | Ancien (18KB) | **Absent de Directus → Module 20** |
| Automation — Notifications | Ancien (28KB) | Plus complet |
| Automation — Workflows | Ancien (19KB) | **Absent de Directus → Module 21** |
| Leads | Directus | Connecté Directus |
| Pipeline | Directus | Connecté Directus |
| Marketing | Directus | Connecté Mautic |
| Legal | Directus | Absent ancien repo |
| Abonnements | Directus | Absent ancien repo |
| Support | Directus | Absent ancien repo |
| Timetracking | Directus | Absent ancien repo |
| Paramètres | Directus | Absent ancien repo |

#### Portail Prestataire

| Page | Source retenue | Statut |
|------|---------------|--------|
| Dashboard | Combiner | Garder |
| Missions | Ancien (64KB + détail 75KB) | Garder — très complet |
| Calendrier | Ancien (52KB) | **Module 23 — récupérer** |
| Messages | Ancien (46KB) | **Module 24 — récupérer** |
| Base de connaissances | Ancien (50KB + article) | **Module 22 — récupérer** |
| Tâches | Ancien (65KB) | Garder |
| Profil | Directus | Garder |
| Performance | ~~Ancien~~ | **SUPPRIMÉ — non pertinent** |
| Récompenses | ~~Ancien~~ | **SUPPRIMÉ — non pertinent** |

#### Portail Revendeur

| Page | Source retenue | Statut |
|------|---------------|--------|
| Dashboard | Combiner | Garder |
| Pipeline | Ancien (59KB) | Plus complet |
| Leads | Ancien (58KB) | Plus complet |
| Clients + Détail | Ancien (51KB + 69KB) | Très complet |
| Commissions | Ancien (55KB) | **Module 25 — récupérer** |
| Marketing | Combiner | Garder |
| Devis | Directus (quotes/) | Garder |
| Rapports | Ancien (52KB) | Récupérer |

#### Portail Client

| Page | Source retenue | Statut |
|------|---------------|--------|
| Dashboard | Ancien | Plus complet |
| Projets | Directus | Connecté Directus |
| Documents | Ancien + Directus | Combiner |
| Finances | Ancien | Plus complet |
| Paiement | Directus (Revolut) | Garder — intégration active |
| Profil | Combiner | Garder |
| Support/Tickets | Directus | Absent ancien repo |

### 15.3 Règles de conversion

Toutes les pages récupérées de l'ancien repo doivent suivre ces règles de conversion :

1. **Supprimer** tout code lié à l'API Notion (notion-proxy, databases Notion)
2. **Remplacer** par appels Directus (`/api/directus/collections/...`)
3. **Convertir** HTML statique → composants React avec hooks
4. **Appliquer** le Design System v1.3 (monochromatic, sobriété)
5. **Vérifier** les champs via MCP Directus avant tout mapping
6. **Conserver** 100% de la logique métier et des calculs

---

## 16. MODULES 17 À 25 — FONCTIONNALITÉS RÉCUPÉRÉES

### Module 17 — Finance : Rapports Mensuels

**Source** : `portal-project/superadmin/finance/monthly-reports.html` (98KB)  
**Priorité** : HIGH  
**Collections Directus** : `bank_transactions`, `client_invoices`, `supplier_invoices`, `payments`, `kpis`

**Fonctionnalités** :
- Vue mensuelle P&L (revenus, dépenses, marge brute, marge nette)
- Comparaison mois/mois et YTD
- Ventilation par catégorie de revenus (vente, location, maintenance, software)
- Export PDF rapport mensuel
- Graphique d'évolution sur 12 mois (Recharts — barres + ligne tendance)
- Résumé automatique en texte (montants clés + variation)

**Design System** : Graphiques en bleu dominant + gris pour les autres séries. Aucune couleur décorative.

---

### Module 18 — Finance : Rapports TVA Suisse

**Source** : `portal-project/superadmin/finance/vat-reports.html` (70KB)  
**Priorité** : HIGH (obligation légale)  
**Collections Directus** : `client_invoices`, `supplier_invoices`, `vat_records`

**Fonctionnalités** :
- Calcul automatique TVA par taux (8.1% standard, 2.6% réduit, 3.8% hébergement)
- Préparation automatique Formulaire 200 AFC
- Déclaration trimestrielle / annuelle configurable
- Réconciliation TVA collectée vs TVA déductible
- Solde TVA à payer / à récupérer
- Export conforme AFC
- Alertes dates de dépôt

**Conformité** : 100% conforme AFC 2025. Taux corrects (8.1 / 2.6 / 3.8 — pas 7.7/2.5/3.7).

---

### Module 19 — Finance : Gestion des Dépenses

**Source** : `portal-project/superadmin/finance/expenses.html` (39KB)  
**Priorité** : MEDIUM  
**Collections Directus** : `expenses` (à confirmer via MCP), `bank_transactions`

**Fonctionnalités** :
- Saisie manuelle de dépenses + catégorisation
- Upload justificatif (intégration OCR)
- Catégories : déplacements, matériel, software, frais bancaires, prestataires
- Ventilation par projet → calcul marge en temps réel
- Vue mensuelle dépenses vs budget
- Export comptable (plan PME Käfer)

---

### Module 20 — Automation : Email Templates

**Source** : `portal-project/superadmin/automation/email-templates.html` (18KB)  
**Priorité** : MEDIUM  
**Intégration** : Mautic 5.x

**Fonctionnalités** :
- Bibliothèque de templates emails (devis, facture, relance, confirmation projet)
- Éditeur WYSIWYG inline
- Variables dynamiques : `{{client.name}}`, `{{invoice.total}}`, `{{project.name}}`
- Prévisualisation desktop + mobile
- Test d'envoi
- Langues : français, allemand, anglais
- Synchronisation bidirectionnelle avec Mautic

---

### Module 21 — Automation : Workflows Visuels

**Source** : `portal-project/superadmin/automation/workflows.html` (19KB)  
**Priorité** : MEDIUM  
**Intégration** : Directus Flows + Make.com/n8n (décision à prendre)

**Fonctionnalités** :
- Vue liste des workflows actifs avec statut ON/OFF
- Description et déclencheur de chaque workflow
- Historique d'exécutions (succès / échec / en cours)
- Alertes si workflow en échec
- Workflows standards :
  - Lead entrant → email qualification automatique
  - Signature devis → génération facture acompte
  - Paiement Revolut reçu → activation projet
  - Facture en retard → relance automatique (J+7, J+14, J+30)
  - Facture prestataire → notification CEO pour validation
  - Rapport mensuel → envoi automatique CEO le 1er du mois

---

### Module 22 — Prestataire : Base de Connaissances

**Source** : `portal-project/prestataire/knowledge.html` (50KB) + `knowledge-article.html` (49KB)  
**Priorité** : LOW  
**Collections Directus** : `knowledge_base` (à créer si absent)

**Fonctionnalités** :
- Bibliothèque d'articles : guides d'installation, procédures, FAQ
- Catégorisation par type de matériel (LED, totem, hologramme)
- Recherche full-text
- Vue article avec navigation breadcrumb
- Upload PDF/images dans articles
- Visible uniquement par prestataires (RBAC)

---

### Module 23 — Prestataire : Calendrier Missions

**Source** : `portal-project/prestataire/calendar.html` (52KB)  
**Priorité** : HIGH  
**Collections Directus** : `projects`, `deliverables`, `contacts`

**Fonctionnalités** :
- Vue calendrier mensuel / hebdomadaire
- Missions du prestataire affichées (dates, lieu, projet)
- Confirmation de disponibilité depuis le calendrier
- Détail mission au clic (brief, matériel, contact HYPERVISUAL)
- Export iCal / Google Calendar
- Notifications rappel J-7 et J-1 (via Mautic)

---

### Module 24 — Prestataire : Messagerie

**Source** : `portal-project/prestataire/messages.html` (46KB)  
**Priorité** : LOW  
**Collections Directus** : `messages` (à confirmer via MCP)

**Fonctionnalités** :
- Messagerie interne CEO ↔ Prestataire par fil de discussion
- Attachement de fichiers
- Notifications email (via Mautic) à chaque nouveau message
- Badge non-lu dans la sidebar du portail prestataire
- Archivage par projet

*Note : Si `messages` absent de Directus, créer avec : sender_id, recipient_id, project_id, content, attachments, read_at, created_at.*

---

### Module 25 — Revendeur : Commissions

**Source** : `portal-project/revendeur/commissions.html` (55KB)  
**Priorité** : MEDIUM  
**Collections Directus** : `resellers`, `commissions` (à confirmer via MCP)

**Fonctionnalités** :
- Vue revendeur : commissions dues par deal signé
- Historique paiements commissions reçus
- Détail calcul commission (% appliqué, base de calcul, montant)
- Statut : en attente / validé / payé
- Vue CEO : liste tous les revendeurs + commissions à payer
- Export mensuel commissions pour comptabilité
- Alertes commissions à régler

---

## 17. ROADMAP v2.0

*(Voir document séparé ROADMAP_v2.0.md)*

---

*Document généré en février 2026 — Version 1.3*  
*Sections 1 à 13 inchangées depuis v1.2 (voir CDC_HYPERVISUAL_Switzerland_Directus_Unified_Platform.md).*  
*Cette version ajoute le Design System, la consolidation repos et les Modules 17 à 25.*  
*Aucun contenu des versions précédentes n'a été supprimé (sauf Performance/Récompenses prestataire — décision validée par Jean).*
