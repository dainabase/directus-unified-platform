// Theme Switcher for SuperAdmin
class ThemeSwitcher {
    constructor() {
        this.currentTheme = localStorage.getItem('superadmin-theme') || 'dark';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Create theme toggle button
        this.createThemeToggle();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('superadmin-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        this.currentTheme = theme;
        
        // Update theme color meta tag
        const themeColor = theme === 'dark' ? '#1a1b26' : '#ffffff';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        localStorage.setItem('superadmin-theme', newTheme);
        
        // Animate the toggle
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle btn-glass';
        toggle.innerHTML = `
            <i class="ti ti-sun theme-light-icon"></i>
            <i class="ti ti-moon theme-dark-icon"></i>
        `;
        toggle.onclick = () => this.toggleTheme();
        
        // Add to navbar if exists
        const navbar = document.querySelector('.navbar-actions');
        if (navbar) {
            navbar.prepend(toggle);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeSwitcher = new ThemeSwitcher();
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in-view');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animatable elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});