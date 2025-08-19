# 🎨 PROMPT COMPLET POUR CLAUDE CODE - SHOWCASE DESIGN SYSTEM DAINABASE

## 🎯 MISSION PRINCIPALE
Développer le showcase le plus impressionnant et complet possible pour le Design System Dainabase - une vitrine interactive de 132+ composants enterprise avec des couleurs modernes et des animations sophistiquées.

## 📍 CONTEXTE TECHNIQUE
- **Repository**: `dainabase/directus-unified-platform`
- **Chemin de travail**: `packages/ui/showcase/`
- **Design System**: `packages/ui/src/components/` (132+ composants disponibles)
- **Framework**: React 18 + TypeScript + Vite + Tailwind CSS
- **Objectif**: Site web showcase complet, interactif, avec couleurs modernes

## 🏗️ ARCHITECTURE EXISTANTE (PRÉPARÉE)
```
packages/ui/showcase/
├── 📄 index.html                    ✅ Créé - Template moderne
├── 📄 package.json                  ✅ Créé - Dependencies complètes
├── 📄 vite.config.ts                ✅ Créé - Configuration optimisée
├── 📄 tsconfig.json                 ✅ Créé - TypeScript strict
├── 📁 src/
│   ├── 📄 main.tsx                  ✅ Créé - Point d'entrée
│   ├── 📄 showcase-app.tsx          ✅ Créé - Structure de base
│   ├── 📄 styles.css                ✅ Créé - Système couleurs moderne
│   └── 📁 sections/
│       └── 📄 buttons-section.tsx   ✅ Créé - Structure exemple
```

## 🎨 PALETTE DE COULEURS MODERNES (IMPLÉMENTÉE)
### Couleurs Primaires Sophistiquées
- **Bleu Principal**: `#3B82F6` → `#1D4ED8` (Moderne, tech, professionnel)
- **Vert Émeraude**: `#10B981` → `#059669` (Success, validation, nature)
- **Violet Accent**: `#8B5CF6` → `#7C3AED` (Premium, innovation, créativité)
- **Orange Warm**: `#F59E0B` → `#D97706` (Warning, énergie, attention)
- **Rouge Corail**: `#EF4444` → `#DC2626` (Danger, urgence, importance)

### Grays Sophistiqués
Échelle complète 50-950 avec transitions douces pour un rendu professionnel.

## 🚀 PLAN DE DÉVELOPPEMENT DÉTAILLÉ

### Phase 1: Architecture & Layout Principal (PRIORITÉ 1)
1. **Améliorer `showcase-app.tsx`** avec :
   - Navigation sidebar sophistiquée avec icônes colorées
   - Header avec gradient et stats animées
   - Layout responsive parfait
   - Animations d'entrée fluides
   - Theme switcher (light/dark)

2. **Créer `src/components/showcase-layout.tsx`** :
   - Sidebar collapsible avec recherche
   - Navigation par catégories avec compteurs
   - Breadcrumb navigation
   - Progress indicator
   - Quick actions toolbar

### Phase 2: Sections Complètes (TOUTES LES 8)
Développer CHAQUE section avec TOUS les composants :

#### 1. **Buttons & Actions Section** (`buttons-section.tsx`)
- Button (primary, secondary, ghost, outline, destructive)
- ActionButton avec thèmes (executive, analytics, finance, dashboard)
- IconButton, ButtonGroup, ToggleButton
- FloatingActionButton, SplitButton
- **Démo interactive** : Playground avec toutes variantes

#### 2. **Forms & Inputs Section** (`forms-section.tsx`)
- Input (text, password, email, number, search)
- Textarea, Select, Checkbox, RadioGroup
- Switch, Slider, ColorPicker, DatePicker
- FileUpload, TagInput, RichTextEditor
- **Démo interactive** : Formulaire complet fonctionnel

#### 3. **Data Display Section** (`data-section.tsx`)
- Table, DataGrid, DataGridAdvanced
- Charts (AreaChart, BarChart, LineChart, DonutChart)
- Avatar, Badge, Progress, Rating
- Timeline, KPICards, DashboardMetrics
- **Démo interactive** : Dashboard avec données live

#### 4. **Navigation Section** (`navigation-section.tsx`)
- NavigationMenu, Menubar, Breadcrumb, Tabs
- Stepper, Pagination, TreeView
- CommandPalette, ContextMenu
- **Démo interactive** : Site complet navigable

#### 5. **Feedback Section** (`feedback-section.tsx`)
- Dialog, Sheet, Popover, Toast
- Alert, Progress, Skeleton, ErrorBoundary
- HoverCard, Tooltip
- **Démo interactive** : Tous les modals et notifications

#### 6. **Media & Content Section** (`media-section.tsx`)
- Image, VideoPlayer, AudioPlayer, PDFViewer
- Carousel, Gallery, ImageCropper
- Icon, Separator, Collapsible
- **Démo interactive** : Media gallery complète

#### 7. **Layout & Structure Section** (`layout-section.tsx`)
- Card, AppShell, DashboardGrid, Container
- ScrollArea, Resizable, Accordion
- Drawer, Sheet, Separator
- **Démo interactive** : Layouts multiples

#### 8. **Advanced Components Section** (`advanced-section.tsx`)
- Kanban, VirtualList, WorkflowBuilder
- ThemeBuilder, ConfigManager, ReportsEngine
- TextAnimations, HeavyComponents
- **Démo interactive** : Composants sophistiqués

### Phase 3: Interactivité Avancée
1. **Live Code Editor** (`src/components/live-editor.tsx`) :
   - Éditeur avec syntax highlighting
   - Preview en temps réel
   - Copy/paste code
   - Export configurations

2. **Theme Switcher** (`src/components/theme-switcher.tsx`) :
   - Light/Dark mode
   - Multiple color schemes
   - Custom theme builder
   - Prévisualisation live

3. **Component Playground** :
   - Props editor interactive
   - Variations en temps réel
   - State management
   - Performance monitoring

### Phase 4: Exemples Pratiques
Créer dans `src/examples/` :
1. **Dashboard Example** : Dashboard business complet
2. **E-commerce Example** : Interface e-commerce
3. **Form Example** : Formulaires complexes
4. **Data Example** : Visualisations avancées

### Phase 5: Animations & Polish
1. **Framer Motion Integration** :
   - Animations d'entrée/sortie
   - Transitions entre sections
   - Micro-interactions
   - Loading states

2. **Responsive Excellence** :
   - Mobile-first design
   - Tablet optimizations
   - Desktop experience
   - Touch interactions

## 🎯 FONCTIONNALITÉS OBLIGATOIRES

### Interface Principale
- [x] Header avec gradient et branding
- [ ] Sidebar navigation avec catégories
- [ ] Recherche globale des composants
- [ ] Theme switcher light/dark
- [ ] Progress indicator de navigation
- [ ] Breadcrumb navigation
- [ ] Quick actions toolbar

### Chaque Section DOIT Avoir
- [ ] Hero avec description et statistiques
- [ ] Grille de composants organisée
- [ ] Live preview pour chaque composant
- [ ] Code snippet copy/paste
- [ ] Props editor interactif
- [ ] Variations et thèmes
- [ ] État responsive
- [ ] Animations d'entrée

### Composants Utilitaires
- [ ] Code syntax highlighter
- [ ] Props table generator
- [ ] Color palette viewer
- [ ] Component status badges
- [ ] Usage examples
- [ ] Best practices tips
- [ ] Accessibility notes

## 🎨 DIRECTIVES DE DESIGN

### Couleurs et Visuels
- **OBLIGATOIRE** : Utiliser la palette moderne définie
- **PAS d'arc-en-ciel** : Maximum 3-4 couleurs par vue
- **Gradients subtils** : Pour headers et cards
- **Ombres douces** : Depth sans être criard
- **Icônes colorées** : Lucide React avec couleurs primaires

### Typographie
- **Hiérarchie claire** : h1-h6 bien définies
- **Contrast suffisant** : AA minimum
- **Line-height généreux** : Lisibilité optimale
- **Font weights variés** : Emphasis appropriée

### Animations
- **Transitions fluides** : 300ms maximum
- **Easing naturel** : ease-out preferred
- **States interactifs** : hover, focus, active
- **Loading states** : Skeleton screens
- **Micro-interactions** : Feedback utilisateur

## 📋 CHECKLIST DE DÉVELOPPEMENT

### Architecture ✅
- [x] Package.json configuré
- [x] Vite.config.ts optimisé
- [x] TypeScript strict
- [x] Styles CSS modernes
- [x] Structure de dossiers

### Développement Principal
- [ ] ShowcaseApp component complet
- [ ] Navigation sidebar interactive
- [ ] 8 sections complètes développées
- [ ] Live code editor fonctionnel
- [ ] Theme switcher opérationnel
- [ ] Responsive design parfait

### Contenu et Données
- [ ] Tous les 132+ composants showcasés
- [ ] Code examples pour chaque composant
- [ ] Props documentation
- [ ] Usage examples
- [ ] Best practices
- [ ] Accessibility guidelines

### Polish et Optimisations
- [ ] Animations fluides
- [ ] Performance optimisée
- [ ] Mobile experience
- [ ] Loading states
- [ ] Error boundaries
- [ ] SEO meta tags

## 🎪 EXEMPLE D'EXCELLENCE ATTENDU

Chaque section doit ressembler à :
```tsx
// Exemple structure section
export const ButtonsSection = () => {
  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Buttons & Actions
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          25+ button variants for every use case, from simple actions to complex workflows
        </p>
        <div className="grid grid-cols-4 gap-4 mt-6 max-w-md mx-auto">
          <StatCard icon={Play} value="25+" label="Variants" />
          <StatCard icon={Palette} value="6" label="Themes" />
          <StatCard icon={Zap} value="100%" label="Interactive" />
          <StatCard icon={Code} value="TS" label="TypeScript" />
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentDemo
          title="Primary Buttons"
          description="Main action buttons for key workflows"
          component={<ButtonVariants />}
          code={buttonExampleCode}
          props={buttonProps}
        />
        {/* More demos... */}
      </div>
    </section>
  );
};
```

## 🚀 COMMANDES DE DÉVELOPPEMENT

Une fois développé, l'utilisateur pourra :
```bash
cd packages/ui/showcase
npm run dev     # Lancer le showcase en mode dev
npm run build   # Builder pour production
npm run preview # Prévisualiser le build
```

## 🎯 OBJECTIF FINAL

Créer le showcase de Design System le plus impressionnant possible qui :
- **WOW Factor** : Impressionne immédiatement
- **Complétude** : Montre TOUS les composants
- **Interactivité** : Tout est clickable et responsive
- **Performance** : Rapide et fluide
- **Professionalisme** : Niveau enterprise
- **Modernité** : Couleurs et animations 2025

**GO CLAUDE CODE ! 🚀✨**