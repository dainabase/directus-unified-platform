# 📂 DESIGN SYSTEM - STRUCTURE & LOCALISATION EXACTE

> **DOCUMENT CRITIQUE** : À lire avant tout développement  
> **Package**: `@dainabase/ui` v1.0.1-beta.2  
> **Localisation**: `packages/ui/` dans le repository

## 🔴 INFORMATIONS ESSENTIELLES

### Repository & Accès
```yaml
Repository: github.com/dainabase/directus-unified-platform
Owner: dainabase
Branche: main
Package: packages/ui/
Méthode: 100% via API GitHub (github:* tools)
```

### ⚠️ JAMAIS de commandes locales
```bash
# ❌ INTERDIT
git clone / npm install / npm test / yarn / pnpm

# ✅ OBLIGATOIRE
github:get_file_contents / github:create_or_update_file
```

## 📍 STRUCTURE COMPLÈTE DU DESIGN SYSTEM

### Arborescence Détaillée

```
📁 directus-unified-platform/              # Repository racine
│
├── 📁 .github/
│   └── 📁 workflows/                     # CI/CD Workflows
│       ├── bundle-size.yml               # Monitor taille bundle (limite: 500KB)
│       ├── test-suite.yml                # Tests globaux
│       ├── ui-chromatic.yml              # Tests visuels Chromatic
│       ├── ui-unit.yml                   # Tests unitaires UI
│       ├── ui-a11y.yml                   # Tests accessibilité
│       └── e2e-tests.yml                 # Tests end-to-end
│
├── 📁 packages/
│   └── 📁 ui/                           # 🎯 DESIGN SYSTEM ICI
│       │
│       ├── 📁 src/                      # Code source principal
│       │   ├── 📁 components/           # 58 composants
│       │   │   ├── accordion/
│       │   │   ├── alert/
│       │   │   ├── avatar/
│       │   │   ├── badge/
│       │   │   ├── breadcrumb/
│       │   │   ├── button/              # Exemple de structure
│       │   │   │   ├── index.tsx        # Export
│       │   │   │   ├── button.tsx       # Composant
│       │   │   │   ├── button.test.tsx  # Tests
│       │   │   │   ├── button.stories.tsx # Storybook
│       │   │   │   └── types.ts         # Types
│       │   │   ├── calendar/
│       │   │   ├── card/
│       │   │   ├── carousel/
│       │   │   ├── chart/
│       │   │   ├── checkbox/
│       │   │   ├── collapsible/
│       │   │   ├── color-picker/
│       │   │   ├── command-palette/
│       │   │   ├── context-menu/
│       │   │   ├── data-grid/
│       │   │   ├── data-grid-advanced/
│       │   │   ├── date-picker/
│       │   │   ├── date-range-picker/
│       │   │   ├── dialog/
│       │   │   ├── dropdown-menu/
│       │   │   ├── error-boundary/
│       │   │   ├── file-upload/
│       │   │   ├── form/
│       │   │   ├── forms-demo/
│       │   │   ├── hover-card/
│       │   │   ├── icon/
│       │   │   ├── input/
│       │   │   ├── label/
│       │   │   ├── menubar/
│       │   │   ├── navigation-menu/
│       │   │   ├── pagination/
│       │   │   ├── popover/
│       │   │   ├── progress/
│       │   │   ├── radio-group/
│       │   │   ├── rating/
│       │   │   ├── resizable/
│       │   │   ├── scroll-area/
│       │   │   ├── select/
│       │   │   ├── separator/
│       │   │   ├── sheet/
│       │   │   ├── skeleton/
│       │   │   ├── slider/
│       │   │   ├── sonner/
│       │   │   ├── stepper/
│       │   │   ├── switch/
│       │   │   ├── table/
│       │   │   ├── tabs/
│       │   │   ├── text-animations/
│       │   │   ├── textarea/
│       │   │   ├── timeline/
│       │   │   ├── toast/
│       │   │   ├── toggle/
│       │   │   ├── toggle-group/
│       │   │   ├── tooltip/
│       │   │   └── ui-provider/
│       │   │
│       │   ├── 📁 lib/                  # Utilitaires
│       │   │   ├── utils.ts             # Helper functions
│       │   │   └── cn.ts                # Class names utility
│       │   │
│       │   ├── 📁 providers/            # Contextes React
│       │   ├── 📁 styles/               # Styles globaux
│       │   ├── 📁 theme/                # Configuration thème
│       │   ├── 📁 theming/              # Système de theming
│       │   ├── 📁 i18n/                 # Internationalisation
│       │   │   ├── locales/
│       │   │   │   ├── en.json
│       │   │   │   ├── fr.json
│       │   │   │   └── ...
│       │   │   └── index.ts
│       │   │
│       │   ├── 📁 test/                 # Test helpers
│       │   ├── 📁 tests/                # Tests unitaires
│       │   │
│       │   ├── index.ts                 # Export principal (50KB)
│       │   └── components-lazy.ts       # Lazy loading exports
│       │
│       ├── 📁 tests/                    # Tests globaux
│       │   ├── setup.ts
│       │   ├── utils/
│       │   └── integration/
│       │
│       ├── 📁 e2e/                      # Tests E2E Playwright
│       │   ├── components/
│       │   └── scenarios/
│       │
│       ├── 📁 docs/                     # Documentation
│       │   ├── components/              # Doc par composant
│       │   ├── guides/                  # Guides d'utilisation
│       │   └── api/                     # API reference
│       │
│       ├── 📁 scripts/                  # Scripts utilitaires
│       │   ├── build.js
│       │   ├── analyze-bundle.js
│       │   └── generate-tests.js
│       │
│       ├── 📁 .storybook/               # Config Storybook
│       │   ├── main.js
│       │   └── preview.js
│       │
│       ├── 📄 package.json              # v1.0.1-beta.2
│       ├── 📄 tsup.config.ts            # Build optimisé
│       ├── 📄 jest.config.js            # Tests unitaires
│       ├── 📄 playwright.config.ts      # Tests E2E
│       ├── 📄 vite.config.ts            # Dev server
│       ├── 📄 vitest.config.ts          # Alternative tests
│       └── 📄 stryker.config.mjs        # Mutation testing
│
├── 📁 apps/                             # Applications (hors scope)
├── 📁 src/                              # Backend/Frontend (hors scope)
└── 📄 DEVELOPMENT_ROADMAP_2025.md       # Roadmap principale
```

## 📝 EXEMPLES D'UTILISATION CORRECTS

### ✅ Créer un nouveau test
```javascript
// 1. Lire le composant existant
github:get_file_contents
owner: "dainabase"
repo: "directus-unified-platform"
path: "packages/ui/src/components/button/index.tsx"
branch: "main"

// 2. Créer le test
github:create_or_update_file
owner: "dainabase"
repo: "directus-unified-platform"
path: "packages/ui/src/components/button/button.test.tsx"
branch: "main"
message: "test: Add button component unit tests"
content: "// Test implementation"
```

### ✅ Modifier une configuration
```javascript
// 1. Obtenir le SHA
github:get_file_contents
path: "packages/ui/jest.config.js"

// 2. Mettre à jour avec SHA
github:create_or_update_file
path: "packages/ui/jest.config.js"
sha: "SHA_REQUIS"
content: "// Updated config"
```

### ✅ Ajouter un workflow CI/CD
```javascript
github:create_or_update_file
path: ".github/workflows/test-coverage.yml"
content: "// Workflow YAML"
```

## ❌ ERREURS FRÉQUENTES À ÉVITER

| ❌ Incorrect | ✅ Correct | Raison |
|-------------|-----------|---------|
| `src/components/` | `packages/ui/src/components/` | Chemin incomplet |
| `button.test.tsx` | `packages/ui/src/components/button/button.test.tsx` | Chemin relatif |
| `tests/button.test.tsx` | `packages/ui/tests/components/button.test.tsx` | Mauvais dossier |
| `.github/test.yml` | `.github/workflows/test.yml` | Manque workflows/ |

## 🎯 OÙ CRÉER QUOI ?

| Type de fichier | Emplacement correct | Exemple |
|-----------------|-------------------|---------|
| **Composant** | `packages/ui/src/components/[name]/` | `button/button.tsx` |
| **Test unitaire** | `packages/ui/src/components/[name]/` | `button/button.test.tsx` |
| **Test E2E** | `packages/ui/e2e/` | `button.spec.ts` |
| **Story** | `packages/ui/src/components/[name]/` | `button/button.stories.tsx` |
| **Documentation** | `packages/ui/docs/components/` | `button.md` |
| **Workflow CI** | `.github/workflows/` | `ui-tests.yml` |
| **Script** | `packages/ui/scripts/` | `analyze.js` |
| **Config** | `packages/ui/` | `jest.config.js` |
| **Types globaux** | `packages/ui/src/types/` | `global.d.ts` |
| **Utilitaires** | `packages/ui/src/lib/` | `utils.ts` |

## 📊 STATISTIQUES ACTUELLES

### Composants (58 total)
- **Core**: 3 (Icon, Label, Separator)
- **Layout**: 4 (Card, Resizable, ScrollArea, Collapsible)
- **Forms**: 13 (Input, Select, Checkbox, etc.)
- **Data Display**: 6 (Table, DataGrid, Charts, etc.)
- **Navigation**: 5 (Tabs, Stepper, Pagination, etc.)
- **Feedback**: 6 (Alert, Toast, Progress, etc.)
- **Overlays**: 7 (Dialog, Sheet, Popover, etc.)
- **Advanced**: 14 (CommandPalette, Carousel, etc.)

### Structure des Tests
```
packages/ui/
├── src/components/*/**.test.tsx  # Tests unitaires par composant
├── tests/                         # Tests d'intégration
├── e2e/                          # Tests end-to-end
└── coverage/                     # Rapports de couverture
```

## 🔑 POINTS CLÉS À RETENIR

1. **Tout est dans `packages/ui/`** pour le Design System
2. **Workflows dans `.github/workflows/`** à la racine
3. **Toujours utiliser les chemins complets** depuis la racine
4. **SHA obligatoire** pour modifier un fichier existant
5. **Tests dans le dossier du composant** de préférence
6. **GitHub Actions** exécute tout automatiquement

## 📞 Support

- **Repository**: [github.com/dainabase/directus-unified-platform](https://github.com/dainabase/directus-unified-platform)
- **Package**: `packages/ui/`
- **Issues**: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- **Roadmap**: [DEVELOPMENT_ROADMAP_2025.md](./DEVELOPMENT_ROADMAP_2025.md)

---

*Ce document est LA référence pour la localisation du Design System*  
*Dernière mise à jour: 12 Août 2025*
