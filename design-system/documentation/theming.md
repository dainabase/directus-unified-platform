# 🎨 Theming Guide

## Theme Structure

### 1. Base Theme Variables

All themes share these CSS variables that can be customized:

```css
:root {
    /* Primary Colors */
    --primary: #6366F1;
    --secondary: #8B5CF6;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    
    /* Glass Effects */
    --glass-blur: 10px;
    --glass-saturation: 180%;
    --glass-opacity: 0.08;
    --glass-border-opacity: 0.15;
    
    /* Transitions */
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2. Dark Theme

```css
[data-theme="dark"] {
    --bg-color: #0a0a0b;
    --surface-color: rgba(255, 255, 255, 0.05);
    --surface-hover: rgba(255, 255, 255, 0.1);
    --text-color: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.6);
    --border-color: rgba(255, 255, 255, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.3);
}
```

### 3. Light Theme

```css
[data-theme="light"] {
    --bg-color: #f8f9fa;
    --surface-color: rgba(255, 255, 255, 0.9);
    --surface-hover: rgba(0, 0, 0, 0.05);
    --text-color: #1e293b;
    --text-muted: #64748b;
    --border-color: rgba(0, 0, 0, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.1);
}
```

## Portal-Specific Themes

### SuperAdmin Portal
```css
.portal-superadmin {
    --primary: #6366F1;
    --secondary: #8B5CF6;
    --accent: #EC4899;
}
```

### Client Portal
```css
.portal-client {
    --primary: #10B981;
    --secondary: #0891B2;
    --accent: #F59E0B;
}
```

### Prestataire Portal
```css
.portal-prestataire {
    --primary: #06B6D4;
    --secondary: #3B82F6;
    --accent: #8B5CF6;
}
```

### Revendeur Portal
```css
.portal-revendeur {
    --primary: #7C3AED;
    --secondary: #EC4899;
    --accent: #F97316;
}
```

## Theme Toggle Implementation

### HTML Structure
```html
<button class="btn btn-glass btn-sm" id="themeToggle">
    <i class="ti ti-moon" id="themeIcon"></i>
</button>
```

### JavaScript Implementation
```javascript
// Theme Toggle with localStorage
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

// Check saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add transition
    html.style.transition = 'background-color 0.3s ease';
    
    // Change theme
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Remove transition after completion
    setTimeout(() => {
        html.style.transition = '';
    }, 300);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'ti ti-moon';
    } else {
        themeIcon.className = 'ti ti-sun';
    }
}
```

## Custom Theme Creation

### Step 1: Define Your Variables
```css
:root[data-theme="custom"] {
    --primary: #YOUR_COLOR;
    --secondary: #YOUR_COLOR;
    --bg-color: #YOUR_COLOR;
    --surface-color: rgba(YOUR_COLOR);
    --text-color: #YOUR_COLOR;
    /* ... other variables */
}
```

### Step 2: Create Theme File
Create `/design-system/themes/custom-theme.css`:

```css
/* Custom Theme Name */
[data-theme="custom"] {
    /* Override all necessary variables */
}

/* Component-specific overrides */
[data-theme="custom"] .glass-card {
    /* Custom glass effect */
}
```

### Step 3: Include Theme
```html
<link rel="stylesheet" href="/design-system/themes/custom-theme.css">
```

## Theme Best Practices

1. **Always use CSS variables** - Never hardcode colors
2. **Test all themes** - Ensure components work in both light and dark
3. **Consider contrast** - Maintain WCAG AA compliance
4. **Smooth transitions** - Use CSS transitions for theme changes
5. **Persist choice** - Save theme preference in localStorage
6. **Respect system preference** - Check `prefers-color-scheme`

## System Preference Detection

```javascript
// Detect system theme preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const defaultTheme = prefersDark ? 'dark' : 'light';

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        // Only change if user hasn't set a preference
        const newTheme = e.matches ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
    }
});
```

## Chart.js Theme Integration

```javascript
// Update chart colors based on theme
function updateChartTheme() {
    const theme = html.getAttribute('data-theme');
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#64748b';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    if (window.myChart) {
        window.myChart.options.scales.x.ticks.color = textColor;
        window.myChart.options.scales.y.ticks.color = textColor;
        window.myChart.options.scales.x.grid.color = gridColor;
        window.myChart.options.scales.y.grid.color = gridColor;
        window.myChart.update();
    }
}

// Listen for theme changes
const observer = new MutationObserver(() => {
    updateChartTheme();
});

observer.observe(html, { 
    attributes: true, 
    attributeFilter: ['data-theme'] 
});
```