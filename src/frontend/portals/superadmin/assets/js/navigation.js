// Navigation Controller - SuperAdmin 2025
class NavigationController {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.megaMenuToggles = document.querySelectorAll('[data-toggle="mega-menu"]');
        this.themeToggle = document.getElementById('themeToggle');
        this.searchInput = document.querySelector('.search-input');
        this.companySelector = document.querySelector('.company-selector');
        
        this.init();
    }
    
    init() {
        // Sidebar toggle
        this.sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        this.mobileMenuToggle?.addEventListener('click', () => this.toggleMobileSidebar());
        
        // Mega menu
        this.megaMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.toggleMegaMenu(e));
        });
        
        // Close mega menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mega-menu-wrapper')) {
                this.closeAllMegaMenus();
            }
        });
        
        // Theme toggle
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Search shortcut (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // ESC to close modals
            if (e.key === 'Escape') {
                this.closeAllMegaMenus();
                this.closeMobileSidebar();
            }
        });
        
        // Submenu toggles
        document.querySelectorAll('.has-submenu').forEach(item => {
            item.addEventListener('click', (e) => this.toggleSubmenu(e));
        });
        
        // Company selector
        this.companySelector?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Initialize animations
        this.initAnimations();
        
        // Restore preferences
        this.restorePreferences();
        
        // Active page highlighting
        this.highlightActivePage();
        
        // Initialize tooltips
        this.initTooltips();
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('sidebar-collapsed'));
        
        // Trigger resize event for charts
        window.dispatchEvent(new Event('resize'));
    }
    
    toggleMobileSidebar() {
        this.sidebar.classList.toggle('sidebar-mobile-open');
        document.body.classList.toggle('sidebar-open');
        
        // Create overlay
        if (document.body.classList.contains('sidebar-open')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => this.closeMobileSidebar());
            document.body.appendChild(overlay);
        } else {
            document.querySelector('.sidebar-overlay')?.remove();
        }
    }
    
    closeMobileSidebar() {
        this.sidebar.classList.remove('sidebar-mobile-open');
        document.body.classList.remove('sidebar-open');
        document.querySelector('.sidebar-overlay')?.remove();
    }
    
    toggleMegaMenu(e) {
        e.stopPropagation();
        const megaMenu = e.currentTarget.nextElementSibling;
        const isOpen = megaMenu.classList.contains('active');
        
        this.closeAllMegaMenus();
        
        if (!isOpen) {
            megaMenu.classList.add('active');
            // Animate menu items
            megaMenu.querySelectorAll('.mega-menu-item').forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }
    }
    
    closeAllMegaMenus() {
        document.querySelectorAll('.mega-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class
        document.documentElement.classList.add('theme-transition');
        
        // Change theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Animate icon rotation
        this.themeToggle.style.transform = 'rotate(180deg)';
        
        // Remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
            this.themeToggle.style.transform = '';
        }, 300);
    }
    
    focusSearch() {
        this.searchInput?.focus();
        this.searchInput?.select();
        
        // Add glow effect
        const searchWrapper = this.searchInput?.closest('.search-wrapper');
        searchWrapper?.classList.add('search-focused');
        
        this.searchInput?.addEventListener('blur', () => {
            searchWrapper?.classList.remove('search-focused');
        }, { once: true });
    }
    
    toggleSubmenu(e) {
        e.preventDefault();
        const item = e.currentTarget;
        const isExpanded = item.classList.contains('expanded');
        
        // Close other submenus
        document.querySelectorAll('.has-submenu.expanded').forEach(el => {
            if (el !== item) {
                el.classList.remove('expanded');
                const submenu = el.nextElementSibling;
                if (submenu && submenu.classList.contains('submenu')) {
                    submenu.style.maxHeight = '0';
                }
            }
        });
        
        // Toggle current submenu
        item.classList.toggle('expanded');
        const submenu = item.nextElementSibling;
        if (submenu && submenu.classList.contains('submenu')) {
            if (isExpanded) {
                submenu.style.maxHeight = '0';
            } else {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            }
        }
    }
    
    initAnimations() {
        // Animate cards on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all animatable elements
        document.querySelectorAll('.glass-card, .kpi-card, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Ripple effect on buttons
        document.querySelectorAll('.btn-glass, .nav-item, .btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => this.createRipple(e));
        });
        
        // Parallax effect on scroll
        let ticking = false;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    parallaxElements.forEach(el => {
                        const speed = el.dataset.speed || 0.5;
                        el.style.transform = `translateY(${scrolled * speed}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Remove any existing ripples
        button.querySelectorAll('.ripple').forEach(r => r.remove());
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    restorePreferences() {
        // Restore theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Restore sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed && window.innerWidth > 991) {
            this.sidebar?.classList.add('sidebar-collapsed');
        }
        
        // Restore company selection
        const savedCompany = localStorage.getItem('selectedCompany');
        if (savedCompany) {
            // Update company selector UI
            this.updateCompanySelector(savedCompany);
        }
    }
    
    highlightActivePage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();
        
        // Remove all active classes
        document.querySelectorAll('.nav-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current page
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href && (href === currentPage || href.includes(currentPage))) {
                item.classList.add('active');
                
                // Expand parent if in submenu
                const parent = item.closest('.nav-section');
                const parentToggle = parent?.querySelector('.has-submenu');
                if (parentToggle) {
                    parentToggle.classList.add('expanded');
                    const submenu = parentToggle.nextElementSibling;
                    if (submenu) {
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    }
                }
            }
        });
    }
    
    updateCompanySelector(companyId) {
        const companies = {
            'all': { name: 'Toutes les entreprises', icon: '🏢', count: '5 actives' },
            'hypervisual': { name: 'HyperVisual', icon: '📹', count: 'Production vidéo' },
            'dynamics': { name: 'Dynamics', icon: '💡', count: 'Conseil & Innovation' },
            'lexia': { name: 'Lexia', icon: '🗣️', count: 'Services linguistiques' },
            'nkreality': { name: 'NKReality', icon: '🏠', count: 'Immobilier' },
            'etekout': { name: 'Etekout', icon: '🛒', count: 'E-commerce' }
        };
        
        const company = companies[companyId];
        if (company && this.companySelector) {
            const nameEl = this.companySelector.querySelector('.company-name');
            const countEl = this.companySelector.querySelector('.company-count');
            const iconEl = this.companySelector.querySelector('.company-avatar i');
            
            if (nameEl) nameEl.textContent = company.name;
            if (countEl) countEl.textContent = company.count;
            if (iconEl) iconEl.textContent = company.icon;
            
            localStorage.setItem('selectedCompany', companyId);
        }
    }
    
    initTooltips() {
        // Initialize tooltips for collapsed sidebar
        if (window.innerWidth > 991) {
            const tooltips = [];
            
            document.querySelectorAll('.nav-item').forEach(item => {
                const text = item.querySelector('.nav-text')?.textContent;
                if (text) {
                    item.setAttribute('data-tooltip', text);
                }
            });
            
            // Show tooltip on hover when sidebar is collapsed
            document.addEventListener('mouseenter', (e) => {
                if (this.sidebar?.classList.contains('sidebar-collapsed')) {
                    const navItem = e.target.closest('.nav-item');
                    if (navItem && navItem.dataset.tooltip) {
                        this.showTooltip(navItem, navItem.dataset.tooltip);
                    }
                }
            }, true);
            
            document.addEventListener('mouseleave', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem) {
                    this.hideTooltip();
                }
            }, true);
        }
    }
    
    showTooltip(element, text) {
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = rect.top + rect.height / 2 + 'px';
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }
    
    hideTooltip() {
        document.querySelectorAll('.nav-tooltip').forEach(tooltip => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 200);
        });
    }
}

// Search functionality
class SearchController {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.searchWrapper = document.querySelector('.search-wrapper');
        this.searchResults = null;
        this.searchDebounce = null;
        
        this.init();
    }
    
    init() {
        if (!this.searchInput) return;
        
        // Create search results container
        this.createSearchResults();
        
        // Search input handler
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounce);
            this.searchDebounce = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        // Focus/blur handlers
        this.searchInput.addEventListener('focus', () => {
            this.searchWrapper.classList.add('search-focused');
        });
        
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.searchWrapper.classList.remove('search-focused');
                this.hideSearchResults();
            }, 200);
        });
    }
    
    createSearchResults() {
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'search-results glass-card';
        this.searchResults.style.display = 'none';
        this.searchWrapper.appendChild(this.searchResults);
    }
    
    performSearch(query) {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }
        
        // Mock search results
        const results = this.mockSearch(query);
        this.displayResults(results);
    }
    
    mockSearch(query) {
        const allItems = [
            { type: 'page', icon: 'ti-file', title: 'Factures', desc: 'Gestion des factures', url: 'invoices.html' },
            { type: 'page', icon: 'ti-building-bank', title: 'Banking', desc: 'Comptes Revolut', url: 'banking.html' },
            { type: 'page', icon: 'ti-mail', title: 'Marketing', desc: 'Campagnes Mautic', url: 'marketing.html' },
            { type: 'action', icon: 'ti-plus', title: 'Nouvelle facture', desc: 'Créer une facture', action: 'newInvoice' },
            { type: 'client', icon: 'ti-user', title: 'Client ABC', desc: 'client@abc.com', url: '#' },
            { type: 'setting', icon: 'ti-settings', title: 'Paramètres', desc: 'Configuration système', url: 'settings.html' }
        ];
        
        return allItems.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.desc.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-empty">
                    <i class="ti ti-search-off"></i>
                    <p>Aucun résultat trouvé</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.map(result => `
                <a href="${result.url || '#'}" class="search-result-item hover-lift" data-action="${result.action || ''}">
                    <div class="result-icon ${result.type}">
                        <i class="ti ${result.icon}"></i>
                    </div>
                    <div class="result-content">
                        <div class="result-title">${result.title}</div>
                        <div class="result-desc">${result.desc}</div>
                    </div>
                    <div class="result-type">${this.getTypeLabel(result.type)}</div>
                </a>
            `).join('');
        }
        
        this.searchResults.style.display = 'block';
        
        // Add click handlers for actions
        this.searchResults.querySelectorAll('[data-action]').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action) {
                    e.preventDefault();
                    this.handleAction(action);
                }
            });
        });
    }
    
    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }
    
    getTypeLabel(type) {
        const labels = {
            'page': 'Page',
            'action': 'Action',
            'client': 'Client',
            'setting': 'Paramètre'
        };
        return labels[type] || type;
    }
    
    handleAction(action) {
        switch(action) {
            case 'newInvoice':
                // Trigger new invoice modal
                window.showCreateInvoiceModal?.();
                break;
            // Add more actions as needed
        }
        this.hideSearchResults();
        this.searchInput.value = '';
    }
}

// Company selector functionality
class CompanySelector {
    constructor() {
        this.selector = document.querySelector('.company-selector');
        this.dropdown = document.querySelector('.company-dropdown');
        this.init();
    }
    
    init() {
        if (!this.selector) return;
        
        // Toggle dropdown
        this.selector.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Company selection
        this.dropdown?.querySelectorAll('.company-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const companyName = item.querySelector('span:last-child').textContent;
                this.selectCompany(companyName, item);
            });
        });
        
        // Close on outside click
        document.addEventListener('click', () => {
            this.closeDropdown();
        });
    }
    
    toggleDropdown() {
        this.dropdown?.classList.toggle('show');
    }
    
    closeDropdown() {
        this.dropdown?.classList.remove('show');
    }
    
    selectCompany(name, element) {
        // Update UI
        const nameEl = this.selector.querySelector('.company-name');
        const iconEl = element.querySelector('.company-icon').textContent;
        
        if (nameEl) {
            nameEl.textContent = name;
            this.selector.querySelector('.company-avatar').innerHTML = `<span style="font-size: 1.25rem">${iconEl}</span>`;
        }
        
        // Update active state
        this.dropdown.querySelectorAll('.company-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');
        
        // Close dropdown
        this.closeDropdown();
        
        // Trigger company change event
        window.dispatchEvent(new CustomEvent('companyChanged', { detail: { company: name } }));
    }
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    window.navigationController = new NavigationController();
    window.searchController = new SearchController();
    window.companySelector = new CompanySelector();
    
    // Add page transition effects
    document.body.classList.add('page-loaded');
    
    // Handle page transitions
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http') && !link.hasAttribute('target')) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
    
    // Performance monitoring
    if (window.performance && performance.navigation.type === 1) {
        console.log('Page reloaded');
    }
    
    // Log navigation timing
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
        }, 0);
    });
});

// Export for use in other modules
export { NavigationController, SearchController, CompanySelector };