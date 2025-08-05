# 🚀 Getting Started - Design System

## Installation

### 1. Prérequis
- Node.js 16+
- Git
- Navigateur moderne

### 2. Structure de base

```html
<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
    <!-- Tabler Core -->
    <link rel="stylesheet" href="https://unpkg.com/@tabler/core@latest/dist/css/tabler.min.css">
    
    <!-- Design System -->
    <link rel="stylesheet" href="/design-system/themes/glassmorphism.css">
    <link rel="stylesheet" href="/design-system/themes/dark-theme.css">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://unpkg.com/@tabler/icons@latest/iconfont/tabler-icons.min.css">
</head>
<body>
    <!-- Votre contenu -->
    
    <!-- Scripts -->
    <script src="https://unpkg.com/@tabler/core@latest/dist/js/tabler.min.js"></script>
    <script src="/design-system/js/theme-toggle.js"></script>
</body>
</html>
```

### 3. Variables CSS disponibles

```css
/* Couleurs principales */
--primary: #6366F1;
--secondary: #8B5CF6;
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;

/* Surfaces */
--bg-color: var(--dark-bg);
--surface-color: rgba(255, 255, 255, 0.05);
--border-color: rgba(255, 255, 255, 0.1);

/* Texte */
--text-color: #ffffff;
--text-muted: rgba(255, 255, 255, 0.6);
```

## Components de base

### Glass Card
```html
<div class="card glass-card">
    <div class="card-body">
        Contenu
    </div>
</div>
```

### KPI Card
```html
<div class="kpi-card">
    <div class="kpi-label">Métrique</div>
    <div class="kpi-value" data-counter="1250">0</div>
    <div class="kpi-change positive">
        <i class="ti ti-trending-up"></i> +23%
    </div>
</div>
```

### Button Glass
```html
<button class="btn btn-glass">
    <i class="ti ti-plus"></i> Action
</button>

<button class="btn btn-glass btn-primary">
    Action Principale
</button>
```

## Theme Toggle

```javascript
// Automatiquement inclus dans theme-toggle.js
// Toggle avec bouton id="themeToggle"
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});
```

## Animations

Classes disponibles :
- `.animate-in` : Fade in par défaut
- `.delay-1` à `.delay-5` : Délais d'animation
- `.hover-lift` : Élévation au survol
- `.pulse-glow` : Effet de pulsation

## Best Practices

1. **Toujours** utiliser les variables CSS
2. **Préférer** les classes utilitaires de Tabler
3. **Ajouter** l'effet glass avec parcimonie
4. **Tester** dark et light mode
5. **Optimiser** les performances (backdrop-filter)