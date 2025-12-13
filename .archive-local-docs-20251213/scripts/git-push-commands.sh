#!/bin/bash

# Script pour pusher le design system sur GitHub

echo "📋 Ajout des nouveaux fichiers..."
git add design-system/
git add frontend/all-portals.html
git add frontend/assets/css/animations.css
git add frontend/assets/css/glassmorphism.css
git add frontend/assets/css/modern-theme.css
git add frontend/assets/css/modern/
git add frontend/assets/js/modern-interactions.js
git add frontend/demo.html
git add frontend/portals/superadmin/new-design/
git add frontend/portals/superadmin/test-moderne.html
git add server-directus-unified.js

echo "✅ Fichiers ajoutés au staging"

echo "📝 Création du commit..."
git commit -m "feat: 🎨 Add complete design system with glassmorphism

- Create organized design system structure in /design-system
- Add SuperAdmin prototype with dark/light mode toggle
- Implement glassmorphism CSS framework with animations
- Add comprehensive documentation (getting started, components, theming)
- Create reusable themes (dark-theme.css, light-theme.css)
- Add KPI cards, buttons, tables with glass effects
- Implement smooth theme transitions with localStorage
- Add counter animations and hover effects
- Create design system index page for easy navigation
- Document color palettes for all 4 portals
- Add CHANGELOG and component guide

🌓 Features:
- Dark mode by default with smooth light mode toggle
- Glassmorphism effects with backdrop-filter
- 40+ animations and transitions
- Command palette ready (Cmd+K)
- Chart.js integration with adaptive themes
- Responsive sidebar with glass effect
- Modern UI components library

📁 Structure:
design-system/
├── themes/        # CSS themes
├── documentation/ # Guides
├── prototypes/    # Live demos
└── components/    # Reusable parts"

echo "🚀 Push vers GitHub..."
git push origin main

echo "✅ Terminé ! Voir sur GitHub :"
echo "https://github.com/dainabase/directus-unified-platform"