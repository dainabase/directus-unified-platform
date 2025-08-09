# @dainabase/ui - Design System

## 📚 Storybook

Le Design System est documenté et visualisable via Storybook.

### 🚀 Lancement local

```bash
# Depuis packages/ui
cd packages/ui
pnpm install
pnpm sb

# Storybook sera accessible sur http://localhost:6006
```

### 🐳 Docker

Pour lancer Storybook via Docker (build statique) :

```bash
# Depuis la racine du repo
docker compose -f docker-compose.storybook.yml up --build -d

# Accessible sur http://localhost:6006
```

### 📦 Build statique

Pour générer une version statique de Storybook :

```bash
cd packages/ui
pnpm build:sb:static

# Les fichiers seront dans packages/ui/storybook-static/
```

## 🎨 Composants disponibles

### Layout
- **AppShell** - Layout principal avec topbar et sidebar

### Components
- **Button** - Boutons avec variantes
- **Card** - Cartes conteneur
- **DataGrid** - Table de données avancée
- **CommandPalette** - Palette de commandes (Cmd+K)
- **DatePicker** - Sélecteur de date
- **DateRangePicker** - Sélecteur de plage de dates
- **Dialog** - Modale/Dialog
- **Sheet** - Panneau latéral
- **Tabs** - Onglets
- **Breadcrumbs** - Fil d'Ariane
- **DropdownMenu** - Menu contextuel
- **Toast** - Notifications temporaires

## 🎨 Design Tokens

Les tokens sont définis dans `packages/ui/tokens.ts` et utilisés dans la configuration Tailwind.

Police principale : **Montserrat**