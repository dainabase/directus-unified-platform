# 🚨 PROMPT DE CONTEXTE - SESSION 40 - CRÉATION DU DASHBOARD SUPER ADMIN
# ⚠️ TRAVAIL EXCLUSIVEMENT VIA GITHUB API - AUCUNE COMMANDE LOCALE

## 📍 INFORMATIONS CRITIQUES DU PROJET
```yaml
Date: À partir du 16 Août 2025
Session: 40 (après 39 sessions de développement)
Repository: github.com/dainabase/directus-unified-platform
Owner: dainabase
Branch: main
Méthode: 100% GitHub API (github:* tools uniquement)
Environnement: TOUT sur GitHub - RIEN en local
```

## 🎯 CONTEXTE COMPLET DU PROJET

### HISTORIQUE DES SESSIONS
```yaml
Sessions 1-35: Création du Design System de zéro
Session 36: Tentatives publication NPM (abandonnées)
Session 37: Audit et nettoyage (110 → 75 composants)
Session 38: Suppression des 26 workflows NPM
Session 39: Vérification complète et corrections finales

Décision finale: JAMAIS NPM - Usage GitHub uniquement
État actuel: Design System 100% FONCTIONNEL
Objectif Session 40: CRÉER LE DASHBOARD SUPER ADMIN
```

## ✅ CE QUI EST DÉJÀ FAIT - NE PAS REFAIRE

### DESIGN SYSTEM COMPLET (packages/ui/)
```yaml
Version: 1.3.0-local
Private: true (JAMAIS sur NPM)
Composants: 75 TOUS EXPORTÉS ET FONCTIONNELS
Structure:
  - 58 Core Components (Button, Card, DataGrid, etc.)
  - 17 Advanced Components (Kanban, PdfViewer, etc.)
Export principal: packages/ui/src/index.ts
Import: '../../../packages/ui/src' (relatif depuis apps/)
Bundle: ~38KB
Tests: 0% (à faire plus tard)
```

### COMPOSANTS DISPONIBLES POUR LE DASHBOARD
```typescript
// TOUS ces composants sont prêts à l'emploi:

// Structure & Layout
AppShell, Drawer, NavigationMenu, Menubar, Resizable

// Core UI
Button, Card, Badge, Icon, Label, Separator

// Forms & Inputs
Form, Input, Textarea, Select, Checkbox, RadioGroup,
Switch, Slider, DatePicker, DateRangePicker, FileUpload

// Data Display
DataGrid, DataGridAdvanced, Table, VirtualizedTable,
Chart, Timeline, Tree View

// Feedback
Alert, Toast, Dialog, Sheet, Popover, Tooltip,
NotificationCenter, Progress, Skeleton

// Advanced
Kanban, CommandPalette, RichTextEditor, CodeEditor,
PdfViewer, VideoPlayer, AudioRecorder, ImageCropper,
InfiniteScroll, VirtualList, SearchBar, AdvancedFilter

// Theming
ThemeToggle, ThemeBuilder, UIProvider
```

### CONFIGURATION EXISTANTE
```json
// packages/ui/package.json
{
  "name": "@dainabase/ui",
  "version": "1.3.0-local",
  "private": true,
  // Build fonctionne avec: pnpm build
  // 75 composants exportés
}
```

## 🎯 OBJECTIF SESSION 40: CRÉER LE DASHBOARD

### STRUCTURE À CRÉER (NOUVELLE)
```bash
apps/super-admin-dashboard/         # NOUVEAU DOSSIER
├── package.json                    # Next.js 14 config
├── tsconfig.json                   # TypeScript config
├── next.config.js                  # Next.js config
├── tailwind.config.js              # Tailwind (étendre celui de UI)
├── .env.local                      # Variables d'environnement
├── public/                         # Assets statiques
│   └── favicon.ico
├── src/
│   ├── app/                        # App Router Next.js 14
│   │   ├── layout.tsx              # Root layout avec AppShell
│   │   ├── page.tsx                # Dashboard home
│   │   ├── globals.css             # Styles globaux
│   │   ├── users/
│   │   │   └── page.tsx            # Gestion users avec DataGrid
│   │   ├── content/
│   │   │   └── page.tsx            # Gestion contenu avec Kanban
│   │   ├── analytics/
│   │   │   └── page.tsx            # Analytics avec Charts
│   │   ├── settings/
│   │   │   └── page.tsx            # Settings avec Forms
│   │   └── api/                    # API routes si nécessaire
│   ├── components/
│   │   └── dashboard/
│   │       ├── Sidebar.tsx         # Navigation latérale
│   │       ├── Header.tsx          # Header avec ThemeToggle
│   │       ├── StatsCards.tsx      # Cards de statistiques
│   │       └── UserTable.tsx       # Table spécifique users
│   └── lib/
│       ├── directus.ts             # Directus SDK client
│       └── utils.ts                # Helpers
└── README.md
```

### PACKAGE.JSON DU DASHBOARD À CRÉER
```json
{
  "name": "super-admin-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@directus/sdk": "^16.1.1",
    "@tanstack/react-query": "^5.51.0",
    "zustand": "^4.5.4",
    "next-auth": "^4.24.7",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "@types/react": "^18.3.4",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5"
  }
}
```

### EXEMPLE D'IMPORT DANS LE DASHBOARD
```typescript
// apps/super-admin-dashboard/src/app/layout.tsx
import {
  AppShell,
  ThemeToggle,
  NotificationCenter,
  CommandPalette,
  Button,
  Card
} from '../../../packages/ui/src';

// IMPORTANT: Import RELATIF depuis GitHub
// PAS de npm install @dainabase/ui
// TOUT reste sur GitHub
```

## 🚨 RÈGLES ABSOLUES - MÉMORISER

### ✅ CE QU'IL FAUT FAIRE
```yaml
Outils GitHub API à utiliser:
  - github:get_file_contents (lecture)
  - github:create_or_update_file (création/modification)
  - github:create_branch (si besoin)
  - github:create_pull_request (si besoin)

Chemins corrects:
  - apps/super-admin-dashboard/* (nouveau)
  - packages/ui/* (existant, ne pas modifier)
  
Import des composants:
  - Toujours: '../../../packages/ui/src'
  - Jamais: '@dainabase/ui' (pas de NPM)
```

### ❌ CE QU'IL NE FAUT JAMAIS FAIRE
```yaml
Commandes interdites:
  - npm/yarn/pnpm install
  - npm publish
  - git clone/pull/push
  - cd/mkdir/rm
  - node/npx
  - Toute commande système

Erreurs à éviter:
  - Créer dans src/ au lieu de apps/
  - Modifier packages/ui/ (déjà parfait)
  - Utiliser des imports NPM
  - Créer des fichiers locaux
```

## 📋 TÂCHES SESSION 40

### PHASE 1: Setup Initial
1. Créer `apps/super-admin-dashboard/package.json`
2. Créer `apps/super-admin-dashboard/tsconfig.json`
3. Créer `apps/super-admin-dashboard/next.config.js`
4. Créer `apps/super-admin-dashboard/tailwind.config.js`

### PHASE 2: Structure de Base
1. Créer `src/app/layout.tsx` avec AppShell
2. Créer `src/app/page.tsx` (dashboard home)
3. Créer `src/app/globals.css`
4. Créer `src/components/dashboard/Sidebar.tsx`
5. Créer `src/components/dashboard/Header.tsx`

### PHASE 3: Pages Principales
1. Créer `src/app/users/page.tsx` avec DataGrid
2. Créer `src/app/content/page.tsx` avec Kanban
3. Créer `src/app/analytics/page.tsx` avec Chart
4. Créer `src/app/settings/page.tsx` avec Forms

### PHASE 4: Intégration
1. Configurer Directus SDK
2. Ajouter ThemeToggle (dark mode)
3. Implémenter NotificationCenter
4. Ajouter CommandPalette (Cmd+K)

## 📊 MÉTRIQUES DE SUCCÈS

```yaml
Session 40 complète quand:
  ✅ Structure Dashboard créée dans apps/
  ✅ Layout avec AppShell fonctionnel
  ✅ 4 pages principales créées
  ✅ Import des composants UI réussi
  ✅ Dark mode toggle fonctionnel
  ✅ Navigation entre pages OK
```

## 🔧 COMMANDES DE RÉFÉRENCE (NE PAS EXÉCUTER)

```bash
# Ces commandes sont pour RÉFÉRENCE uniquement
# NE PAS les exécuter - utiliser GitHub API

# Structure à créer (référence visuelle)
tree apps/super-admin-dashboard/

# Build local (sera fait via GitHub Actions)
cd apps/super-admin-dashboard && npm run build

# Dev server (sera fait via GitHub Actions)
npm run dev
```

## 💡 CONSEILS POUR LA SESSION 40

1. **Commencer petit**: D'abord la structure de base
2. **Tester les imports**: Vérifier que '../../../packages/ui/src' fonctionne
3. **Une page à la fois**: Ne pas tout faire d'un coup
4. **AppShell d'abord**: C'est la base de tout
5. **Dark mode ensuite**: Avec ThemeToggle
6. **Kanban en dernier**: C'est le plus complexe

## 📝 ISSUES & TRACKING

- Issue #72: Session 39 ✅ TERMINÉ (Vérification Design System)
- Issue #73: [À CRÉER] Session 40 - Dashboard Setup
- Issue #74: [À CRÉER] Session 41 - Dashboard Features
- Issue #75: [À CRÉER] Session 42 - Dashboard Testing

## 🎯 RÉSUMÉ POUR COMMENCER

**OÙ**: Repository GitHub `dainabase/directus-unified-platform`
**QUOI**: Créer Dashboard dans `apps/super-admin-dashboard/`
**COMMENT**: GitHub API uniquement (github:create_or_update_file)
**IMPORTS**: Depuis `'../../../packages/ui/src'`
**COMPOSANTS**: 75 disponibles et prêts
**JAMAIS**: NPM, commandes locales, modifications de packages/ui/

---

**IMPORTANT**: Ce projet a 39 sessions d'historique. Le Design System est TERMINÉ avec 75 composants. L'objectif est maintenant de créer le Dashboard Super Admin en utilisant ces composants via import relatif depuis GitHub.

**RAPPEL CRUCIAL**: TOUT le code reste sur GitHub. "Local" signifie import direct depuis le repo GitHub, PAS de fichiers sur une machine locale.

**ÉTAT**: Design System ✅ | Dashboard ⏳ À CRÉER