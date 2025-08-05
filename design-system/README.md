# 🎨 Design System - Directus Unified Platform

## 📋 Vue d'ensemble

Système de design moderne pour la plateforme Directus avec 4 portails distincts utilisant Tabler.io comme base et des effets glassmorphism 2025.

## 🚀 Progression

- [x] Structure de base créée
- [x] Prototype SuperAdmin validé
- [x] Thème Dark/Light implémenté
- [ ] Portail Client
- [ ] Portail Prestataire  
- [ ] Portail Revendeur
- [ ] Documentation complète
- [ ] Components réutilisables

## 🎨 Design Principles

### 1. **Glassmorphism Modern**
- Backdrop blur: 10-20px
- Opacité: 0.05-0.1
- Bordures: rgba(255,255,255,0.1)
- Ombres multicouches

### 2. **Palette de couleurs**

#### SuperAdmin (Tech/AI)
- Primary: `#6366F1` (Indigo)
- Secondary: `#8B5CF6` (Purple)
- Accent: `#EC4899` (Pink)

#### Client (Premium/Trust)
- Primary: `#10B981` (Emerald)
- Secondary: `#0891B2` (Cyan)
- Accent: `#F59E0B` (Amber)

#### Prestataire (Efficace/Pro)
- Primary: `#06B6D4` (Cyan)
- Secondary: `#3B82F6` (Blue)
- Accent: `#8B5CF6` (Purple)

#### Revendeur (Business)
- Primary: `#7C3AED` (Violet)
- Secondary: `#EC4899` (Pink)
- Accent: `#F97316` (Orange)

### 3. **Typographie**
- Font principale: System fonts stack
- Titres: Bold 600-700
- Corps: Regular 400
- Small: 0.875rem

### 4. **Espacements**
- Base: 8px
- Scale: 8, 16, 24, 32, 48, 64

## 📁 Structure des fichiers

```
design-system/
├── README.md (ce fichier)
├── components/
│   ├── buttons.html
│   ├── cards.html
│   ├── forms.html
│   ├── navigation.html
│   └── tables.html
├── themes/
│   ├── _variables.scss
│   ├── dark-theme.css
│   ├── light-theme.css
│   ├── glassmorphism.css
│   └── portal-specific.css
├── documentation/
│   ├── getting-started.md
│   ├── components-guide.md
│   ├── theming.md
│   └── best-practices.md
├── screenshots/
│   ├── superadmin-dark.png
│   ├── superadmin-light.png
│   └── [autres captures]
└── prototypes/
    ├── superadmin-test.html
    └── [autres prototypes]
```

## 🚀 Quick Start

1. **Voir le prototype**
   ```bash
   open http://localhost:3000/design-system/prototypes/superadmin-prototype.html
   ```

2. **Utiliser les thèmes**
   ```html
   <link rel="stylesheet" href="/design-system/themes/glassmorphism.css">
   <link rel="stylesheet" href="/design-system/themes/dark-theme.css">
   ```

3. **Implémenter un composant**
   ```html
   <!-- KPI Card -->
   <div class="kpi-card glass-effect">
       <div class="kpi-label">Métrique</div>
       <div class="kpi-value">1,250</div>
       <div class="kpi-change positive">+23%</div>
   </div>
   ```

## 📊 Statut par portail

| Portail | Design | Prototype | Implémentation | Documentation |
|---------|---------|-----------|----------------|---------------|
| SuperAdmin | ✅ | ✅ | 🔄 | 📝 |
| Client | 📝 | ❌ | ❌ | ❌ |
| Prestataire | 📝 | ❌ | ❌ | ❌ |
| Revendeur | 📝 | ❌ | ❌ | ❌ |

## 🔗 Ressources

- [Tabler.io Documentation](https://tabler.io/docs)
- [Prototype Live](http://localhost:3000/superadmin/test-moderne)
- [Figma Design File](#) (à créer)
- [Storybook](#) (à implémenter)

## 👥 Contributeurs

- Jean-Marie Delaunay - Product Owner
- Claude Desktop - Design Architect
- Claude Code - Implementation

---

Dernière mise à jour : 03/02/2025