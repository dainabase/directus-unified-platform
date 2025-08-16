# 🔍 PROMPT DE CONTEXTE - SESSION 37 - AUDIT & NETTOYAGE
# Design System @dainabase/ui - Focus Dashboard Super Admin (pas de NPM)
# 📅 16 Août 2025 | Version: 1.3.0 | Composants: 100+ | Bundle: 38KB

## 🚨 RÈGLES ABSOLUES DE TRAVAIL
```yaml
MÉTHODE: 100% GITHUB API - ZÉRO COMMANDE LOCALE

✅ COMMANDES AUTORISÉES:
  - github:get_file_contents      # Lecture fichiers
  - github:create_or_update_file  # Création/modification (SHA requis)
  - github:create_issue           # Issues
  - github:list_* / search_*      # Recherche

❌ INTERDITES (NE JAMAIS UTILISER):
  - git (clone, pull, push, etc.)
  - npm, yarn, pnpm, npx
  - node, tsx, ts-node
  - cd, mkdir, rm, touch, cat
  - docker, curl, wget
  - TOUTE commande système

REPOSITORY:
  owner: "dainabase"
  repo: "directus-unified-platform"
  branch: "main"
```

## 🎯 OBJECTIF SESSION 37: AUDIT COMPLET & NETTOYAGE

### DÉCISIONS IMPORTANTES
```yaml
NPM Publication: ❌ ANNULÉE - PAS DE PUBLICATION
Usage: LOCAL UNIQUEMENT pour Dashboard Super Admin
Import: Direct depuis packages/ui/src/
Priorité: Audit → Nettoyage → Dashboard
```

## 📊 INVENTAIRE ACTUEL - 100+ COMPOSANTS

### 58 COMPOSANTS PRINCIPAUX
```yaml
Layout & Structure:
  - card, resizable, scroll-area, collapsible

Navigation:
  - tabs, stepper, pagination, breadcrumb, navigation-menu, menubar

Forms & Inputs:
  - input, textarea, select, checkbox, radio-group
  - date-picker, date-range-picker, file-upload
  - slider, switch, toggle, toggle-group
  - color-picker, rating

Data Display:
  - table, data-grid, data-grid-advanced
  - badge, label, separator, icon

Feedback:
  - alert, toast, progress, skeleton, sonner

Overlays:
  - dialog, sheet, popover, dropdown-menu
  - hover-card, context-menu, tooltip

Specialized:
  - accordion, avatar, button, calendar
  - carousel, chart, command-palette
  - error-boundary, form, forms-demo
  - text-animations, timeline, ui-provider
```

### 40+ COMPOSANTS BONUS AVANCÉS
```yaml
Éditeurs & Viewers:
  - code-editor (49KB)      # Monaco-like editor
  - rich-text-editor (29KB)  # WYSIWYG
  - pdf-viewer (57KB)        # PDF display
  - markdown-editor*         # À vérifier

Multimedia:
  - audio-recorder (33KB)    # Enregistrement audio
  - video-player (25KB)      # Player custom
  - image-cropper (50KB)     # Crop & resize

Data Management:
  - kanban (22KB)            # Board drag & drop
  - drag-drop-grid (13KB)    # Grid draggable
  - virtual-list (4KB)       # Performance list
  - virtualized-table        # Large datasets
  - infinite-scroll (8KB)    # Lazy loading
  - tree-view                # Hierarchical data

UI Advanced:
  - dashboard-grid           # Dashboard layout
  - search-bar              # Search with filters
  - mentions                # @mentions system
  - notification-center     # Notifications hub
  - theme-builder           # Theme customizer
  - theme-toggle            # Dark/light switch
  - timeline-enhanced       # Advanced timeline
  - app-shell              # Application wrapper
  - tag-input              # Tags management
  - advanced-filter        # Complex filtering
```

### FICHIERS ADDITIONNELS DÉTECTÉS
```yaml
Bundles:
  - advanced-bundle.ts
  - data-bundle.ts
  - feedback-bundle.ts
  - forms-bundle.ts
  - navigation-bundle.ts
  - overlays-bundle.ts
  - heavy-components.tsx

Doublons potentiels:
  - breadcrumb vs breadcrumbs
  - chart vs charts
  - data-grid vs data-grid-adv
  - timeline vs timeline-enhanced
  - code-editor/ (dossier) vs code-editor.tsx
  - [Autres à identifier]

Tests & Stories orphelins:
  - audio-recorder.test.tsx (sans dossier?)
  - video-player.stories.tsx (sans dossier?)
  - [À vérifier]
```

## 🧹 PLAN DE NETTOYAGE DÉTAILLÉ

### WORKFLOWS À SUPPRIMER (8)
```bash
.github/workflows/:
  ❌ emergency-npm-publish.yml
  ❌ final-solution-npm.yml
  ❌ ultra-fix-everything.yml
  ❌ complete-solution.yml
  ❌ auto-fix-build.yml
  ❌ fix-build-deps.yml
  ❌ npm-publish-production.yml
  ❌ npm-publish-ultra-simple.yml
  
  ✅ GARDER: simple-build-publish.yml → renommer en build-local.yml
```

### SCRIPTS PACKAGE.JSON À NETTOYER
```json
À SUPPRIMER:
  - "prepublishOnly"
  - "release"
  - "release:minor"
  - "release:major"
  - Scripts NPM inutiles

À GARDER/ADAPTER:
  - "build": "tsup"
  - "dev": "vite"
  - "test": "jest"
  - "storybook": "storybook dev"
```

### FICHIERS À SUPPRIMER
```yaml
Documentation obsolète:
  - TEST_TRIGGER.md
  - WORKFLOWS_CLEANUP.md (après nettoyage)
  - Old session logs
  - Backup files (.backup, .temp)

Config NPM:
  - .npmignore (si existe)
  - publishConfig dans package.json
```

## 📋 CHECKLIST AUDIT COMPLET

### 1. INVENTAIRE TECHNIQUE
```yaml
Pour chaque composant:
  [ ] Nom exact et chemin
  [ ] Taille du fichier
  [ ] Dépendances (Radix UI, etc.)
  [ ] État (fonctionnel/bug/incomplet)
  [ ] Tests existants
  [ ] Stories Storybook
  [ ] Documentation inline
  [ ] Types TypeScript exports
```

### 2. ANALYSE QUALITÉ
```yaml
[ ] Performance:
    - Bundle size par composant
    - Render performance
    - Memory leaks
    - Re-renders inutiles

[ ] Accessibilité:
    - ARIA labels
    - Keyboard navigation
    - Screen reader support
    - Focus management

[ ] Responsive:
    - Mobile first
    - Breakpoints
    - Touch support
    - Orientation

[ ] Theming:
    - Dark mode
    - CSS variables
    - Customization
    - Consistency
```

### 3. IDENTIFICATION PROBLÈMES
```yaml
[ ] Doublons à merger/supprimer
[ ] Composants incomplets
[ ] Dépendances manquantes
[ ] Imports circulaires
[ ] Dead code
[ ] Tests manquants
[ ] Documentation manquante
[ ] Types incomplets
```

### 4. OPTIMISATIONS
```yaml
[ ] Tree-shaking efficace
[ ] Code splitting points
[ ] Lazy loading candidates
[ ] Bundle size réduction
[ ] CSS optimization
[ ] Assets optimization
[ ] Build time improvement
```

## 🎯 STRUCTURE CIBLE APRÈS NETTOYAGE

```yaml
packages/ui/
├── src/
│   ├── components/        # Uniquement composants validés
│   │   ├── [core]/        # 30-40 essentiels
│   │   ├── [advanced]/    # 20-30 avancés
│   │   └── [specialized]/ # 10-20 spécialisés
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   └── index.ts           # Clean exports
├── docs/                  # Documentation
│   ├── components/        # Par composant
│   ├── guides/            # Usage guides
│   └── api/               # API reference
├── tests/                 # Tests globaux
├── package.json           # Nettoyé
├── tsconfig.json          # Optimisé
├── tsup.config.ts         # Build config
└── README.md              # Documentation principale
```

## 📊 MÉTRIQUES À COLLECTER

```yaml
Avant nettoyage:
  - Nombre total fichiers
  - Taille totale (MB)
  - Composants: 100+
  - Tests: coverage %
  - Build time
  - Bundle size: 38KB

Objectifs après:
  - Fichiers: -30%
  - Taille: -20%
  - Composants: 60-80 validés
  - Tests: 100% sur validés
  - Build time: < 30s
  - Bundle size: < 35KB
```

## 🚀 UTILISATION FUTURE - DASHBOARD

### Architecture Dashboard Super Admin
```yaml
apps/super-admin-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx     # AppShell du design system
│   │   └── page.tsx       # Dashboard principal
│   ├── pages/
│   │   ├── users/         # Gestion utilisateurs
│   │   ├── content/       # Gestion contenu
│   │   ├── analytics/     # Analytics
│   │   ├── settings/      # Configuration
│   │   └── system/        # Monitoring
│   ├── features/
│   └── hooks/
└── package.json
```

### Import depuis Design System
```typescript
// Pas de NPM, import local direct
import { 
  DataGridAdvanced,
  KanbanBoard,
  PDFViewer,
  CodeEditor,
  NotificationCenter,
  CommandPalette
} from '../../../packages/ui/src'
```

## 📝 QUESTIONS À RÉSOUDRE

1. **Doublons**: Que faire avec breadcrumb/breadcrumbs, chart/charts?
2. **Bundles**: À quoi servent les *-bundle.ts?
3. **Tests orphelins**: Fichiers .test sans composant?
4. **Stories orphelines**: Fichiers .stories sans composant?
5. **Composants incomplets**: Lesquels finaliser/supprimer?
6. **Dépendances**: Toutes nécessaires?
7. **i18n**: Implémenter ou supprimer?
8. **Storybook**: Garder ou remplacer par doc simple?

## 🔗 FICHIERS CLÉS ACTUELS

```yaml
package.json: SHA c00ad8e4ee9760b02dacc99365d40d69d991bc99
tsup.config.ts: SHA f36a97c93208df37865b142a7d73dd9c9308b550
src/index.ts: SHA 7f41ca63f5f1d005b62bddef693afb61a2e72c8a
simple-build-publish.yml: SHA afd9576aa91e3434bc3db8813f184387618dc317
DEVELOPMENT_ROADMAP_2025.md: SHA f057df510f0de89b520a32f7aeb24dbd5f49f925
```

## ⚡ ACTIONS PRIORITAIRES SESSION 37

### PHASE 1: AUDIT (2h)
1. Lister TOUS les fichiers dans packages/ui/src/components/
2. Identifier les doublons exacts
3. Vérifier chaque composant (existe? complet? testé?)
4. Analyser les dépendances
5. Mesurer les tailles

### PHASE 2: DÉCISIONS (30min)
1. Quoi garder/supprimer
2. Quoi merger
3. Quoi finaliser
4. Structure finale

### PHASE 3: NETTOYAGE (1h)
1. Supprimer workflows inutiles
2. Nettoyer package.json
3. Supprimer doublons
4. Supprimer fichiers obsolètes
5. Réorganiser structure

### PHASE 4: DOCUMENTATION (30min)
1. README principal
2. Liste composants finaux
3. Guide utilisation locale
4. Préparation dashboard

## 🎯 RÉSULTAT ATTENDU

Un Design System:
- ✅ 60-80 composants validés et testés
- ✅ 0 doublon, 0 code mort
- ✅ Structure claire et organisée
- ✅ Documentation complète
- ✅ Prêt pour le Dashboard Super Admin
- ✅ Usage local uniquement (pas NPM)
- ✅ Build rapide et optimisé

---

## 🚨 RAPPELS CRITIQUES

1. **PAS DE NPM** - Ne jamais publier, usage local seulement
2. **100% GITHUB API** - Aucune commande locale
3. **AUDIT D'ABORD** - Comprendre avant de nettoyer
4. **DASHBOARD FOCUS** - Garder que l'utile pour le dashboard
5. **DOCUMENTATION** - Chaque décision documentée

---

*Session 37: Audit complet et nettoyage du Design System*
*Objectif: Préparer pour Dashboard Super Admin (local only)*
*Méthode: 100% GitHub API*
*NPM: ❌ JAMAIS*