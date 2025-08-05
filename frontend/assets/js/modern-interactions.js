/* =============================================
   MODERN INTERACTIONS 2025
   ============================================= */

class ModernUI {
    constructor() {
        this.init();
    }

    init() {
        this.initCommandPalette();
        this.initThemeToggle();
        this.initAnimations();
        this.initGlassmorphism();
        this.initScrollEffects();
        this.initCounters();
        this.initTooltips();
        this.initParallax();
        this.initHoverEffects();
        this.initSoundEffects();
    }

    // ===== Command Palette (Cmd+K) =====
    initCommandPalette() {
        const createPalette = () => {
            const palette = document.createElement('div');
            palette.id = 'command-palette';
            palette.className = 'command-palette glass-card';
            palette.innerHTML = `
                <div class="command-palette-overlay"></div>
                <div class="command-palette-modal glass-card">
                    <div class="command-palette-header">
                        <input type="text" 
                               class="command-palette-input form-control-glass" 
                               placeholder="Rechercher une commande..."
                               autocomplete="off">
                        <button class="command-palette-close btn-glass">
                            <i class="ti ti-x"></i>
                        </button>
                    </div>
                    <div class="command-palette-results">
                        <!-- Results will be inserted here -->
                    </div>
                    <div class="command-palette-footer">
                        <span class="text-muted small">
                            <kbd>↑↓</kbd> Naviguer
                            <kbd>Enter</kbd> Sélectionner
                            <kbd>Esc</kbd> Fermer
                        </span>
                    </div>
                </div>
            `;
            document.body.appendChild(palette);
            return palette;
        };

        const palette = document.getElementById('command-palette') || createPalette();
        const input = palette.querySelector('.command-palette-input');
        const results = palette.querySelector('.command-palette-results');

        // Commands data
        const commands = [
            { icon: 'ti-home', label: 'Dashboard', action: () => window.location.href = '/dashboard.html' },
            { icon: 'ti-users', label: 'Clients', action: () => window.location.href = '/clients.html' },
            { icon: 'ti-file-invoice', label: 'Factures', action: () => window.location.href = '/invoices.html' },
            { icon: 'ti-briefcase', label: 'Projets', action: () => window.location.href = '/projects.html' },
            { icon: 'ti-settings', label: 'Paramètres', action: () => window.location.href = '/settings.html' },
            { icon: 'ti-moon', label: 'Mode sombre', action: () => this.toggleTheme() },
            { icon: 'ti-sun', label: 'Mode clair', action: () => this.toggleTheme() },
            { icon: 'ti-logout', label: 'Déconnexion', action: () => this.logout() },
        ];

        // Open/Close palette
        const openPalette = () => {
            palette.classList.add('active');
            input.value = '';
            input.focus();
            this.renderCommands(commands, results);
        };

        const closePalette = () => {
            palette.classList.remove('active');
        };

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openPalette();
            }
            if (e.key === 'Escape' && palette.classList.contains('active')) {
                closePalette();
            }
        });

        // Close button
        palette.querySelector('.command-palette-close').addEventListener('click', closePalette);

        // Overlay click
        palette.querySelector('.command-palette-overlay').addEventListener('click', closePalette);

        // Search functionality
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = commands.filter(cmd => 
                cmd.label.toLowerCase().includes(query)
            );
            this.renderCommands(filtered, results);
        });
    }

    renderCommands(commands, container) {
        if (commands.length === 0) {
            container.innerHTML = `
                <div class="command-palette-empty">
                    <i class="ti ti-search-off"></i>
                    <p>Aucun résultat trouvé</p>
                </div>
            `;
            return;
        }

        container.innerHTML = commands.map((cmd, index) => `
            <div class="command-palette-item ${index === 0 ? 'active' : ''}" 
                 data-index="${index}">
                <i class="${cmd.icon}"></i>
                <span>${cmd.label}</span>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.command-palette-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                commands[index].action();
                document.getElementById('command-palette').classList.remove('active');
            });
        });
    }

    // ===== Theme Toggle with Smooth Transition =====
    initThemeToggle() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', currentTheme);

        // Create theme toggle button if not exists
        if (!document.querySelector('[data-theme-toggle]')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn-glass theme-toggle';
            toggleBtn.setAttribute('data-theme-toggle', '');
            toggleBtn.innerHTML = currentTheme === 'dark' ? 
                '<i class="ti ti-sun"></i>' : 
                '<i class="ti ti-moon"></i>';
            
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.appendChild(toggleBtn);
            }
        }

        const themeToggle = document.querySelector('[data-theme-toggle]');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class
        html.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Change theme
        html.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update toggle button icon
        const toggleBtn = document.querySelector('[data-theme-toggle]');
        if (toggleBtn) {
            toggleBtn.innerHTML = newTheme === 'dark' ? 
                '<i class="ti ti-sun"></i>' : 
                '<i class="ti ti-moon"></i>';
        }
        
        // Remove transition after completion
        setTimeout(() => {
            html.style.transition = '';
        }, 300);

        // Play sound effect
        this.playSound('switch');
    }

    // ===== Animations on Scroll =====
    initAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ===== Glassmorphism Effects =====
    initGlassmorphism() {
        // Add glass effect to cards on hover
        document.querySelectorAll('.card').forEach(card => {
            if (!card.classList.contains('glass-card')) {
                card.classList.add('glass-card');
            }
        });

        // Convert regular buttons to glass buttons
        document.querySelectorAll('.btn:not(.btn-glass)').forEach(btn => {
            if (!btn.classList.contains('btn-primary') && 
                !btn.classList.contains('btn-danger') && 
                !btn.classList.contains('btn-success')) {
                btn.classList.add('btn-glass');
            }
        });

        // Add glass effect to modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('modal-glass');
        });
    }

    // ===== Scroll Effects =====
    initScrollEffects() {
        let lastScroll = 0;
        const navbar = document.querySelector('.glass-nav, .navbar');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add scrolled class
            if (currentScroll > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
            
            // Hide/show on scroll
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar?.classList.add('navbar-hidden');
            } else {
                navbar?.classList.remove('navbar-hidden');
            }
            
            lastScroll = currentScroll;
        });
    }

    // ===== Counter Animations =====
    initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        const animateCounter = (element) => {
            const target = +element.getAttribute('data-counter');
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const update = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target.toLocaleString();
                }
            };
            
            update();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ===== Modern Tooltips =====
    initTooltips() {
        const elements = document.querySelectorAll('[data-tooltip]');
        
        elements.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const text = e.target.getAttribute('data-tooltip');
                const tooltip = document.createElement('div');
                tooltip.className = 'glass-tooltip';
                tooltip.textContent = text;
                
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    tooltip.style.transition = 'all 0.3s ease';
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateY(0)';
                }, 10);
                
                e.target.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateY(5px)';
                    setTimeout(() => tooltip.remove(), 300);
                }, { once: true });
            });
        });
    }

    // ===== Parallax Effects =====
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = el.getAttribute('data-parallax') || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // ===== Hover Effects =====
    initHoverEffects() {
        // Magnetic buttons
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });

        // 3D card tilt
        document.querySelectorAll('.card-3d').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const tiltX = (y - 0.5) * 20;
                const tiltY = (x - 0.5) * -20;
                
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    // ===== Sound Effects =====
    initSoundEffects() {
        this.sounds = {
            click: '/assets/sounds/click.mp3',
            hover: '/assets/sounds/hover.mp3',
            success: '/assets/sounds/success.mp3',
            error: '/assets/sounds/error.mp3',
            switch: '/assets/sounds/switch.mp3'
        };

        // Add click sounds to buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => this.playSound('click'));
        });
    }

    playSound(soundName) {
        // Only play if sounds are enabled (check user preference)
        const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        if (!soundEnabled) return;

        const audio = new Audio(this.sounds[soundName]);
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Silently fail if audio can't play
        });
    }

    // ===== Utility Functions =====
    logout() {
        // Add logout logic here
        window.location.href = '/login.html';
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.modernUI = new ModernUI();
    
    // Add page load animation
    document.body.classList.add('animate-fadeIn');
    
    // Add stagger animation to lists
    document.querySelectorAll('.row').forEach(row => {
        row.classList.add('stagger-animation');
    });
});

// Add CSS for command palette
const style = document.createElement('style');
style.textContent = `
    .command-palette {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
    }
    
    .command-palette.active {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 10vh;
    }
    
    .command-palette-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    }
    
    .command-palette-modal {
        position: relative;
        width: 90%;
        max-width: 600px;
        max-height: 60vh;
        display: flex;
        flex-direction: column;
        animation: fadeInDown 0.3s ease;
    }
    
    .command-palette-header {
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .command-palette-input {
        flex: 1;
        background: transparent !important;
        border: none !important;
        font-size: 1.125rem;
        padding: 0.5rem !important;
    }
    
    .command-palette-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
    }
    
    .command-palette-results {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
    }
    
    .command-palette-item {
        padding: 0.75rem 1rem;
        margin: 0.25rem 0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .command-palette-item:hover,
    .command-palette-item.active {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
    }
    
    .command-palette-footer {
        padding: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
    }
    
    .command-palette-empty {
        padding: 3rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
    }
    
    .command-palette-empty i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .navbar-hidden {
        transform: translateY(-100%);
    }
    
    .card-3d {
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
    }
    
    .btn-magnetic {
        transition: transform 0.2s ease;
    }
`;
document.head.appendChild(style);