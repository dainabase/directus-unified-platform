/**
 * Sidebar Active State Manager
 * Gère les états actifs de la sidebar et des sous-menus
 */

const SidebarActiveState = {
    /**
     * Initialiser la gestion des états actifs
     */
    init() {
        console.log('🎯 Initialisation des états actifs de la sidebar');
        
        this.setActiveMenuItem();
        this.handleDropdownStates();
        this.persistDropdownStates();
        this.setupEventListeners();
    },

    /**
     * Définir l'élément de menu actif basé sur l'URL courante
     */
    setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        
        // Retirer toutes les classes actives
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            // Retirer aussi de l'élément parent nav-item
            const navItem = link.closest('.nav-item');
            if (navItem) {
                navItem.classList.remove('active');
            }
        });
        
        // Chercher le lien correspondant à la page actuelle
        let activeLink = null;
        
        // D'abord essayer une correspondance exacte
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || href === `./${currentPage}`) {
                activeLink = link;
            } else if (currentPath.includes(href) && href !== '#' && href !== '') {
                // Correspondance partielle pour les sous-dossiers
                activeLink = link;
            }
        });
        
        // Si on a trouvé un lien actif
        if (activeLink) {
            // Ajouter la classe active au lien
            activeLink.classList.add('active');
            
            // Ajouter aussi à l'élément parent nav-item
            const navItem = activeLink.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
            }
            
            // Si c'est dans un dropdown, ouvrir le dropdown parent
            const dropdownParent = activeLink.closest('.dropdown-menu');
            if (dropdownParent) {
                const dropdownToggle = dropdownParent.previousElementSibling;
                if (dropdownToggle && dropdownToggle.classList.contains('dropdown-toggle')) {
                    dropdownToggle.classList.add('active');
                    dropdownParent.classList.add('show');
                    
                    // Ajouter la classe active au nav-item parent
                    const parentNavItem = dropdownToggle.closest('.nav-item');
                    if (parentNavItem) {
                        parentNavItem.classList.add('active');
                    }
                }
            }
        } else {
            // Si aucune correspondance exacte, essayer de détecter par data-page
            const pageName = currentPage.replace('.html', '');
            const dataPageLink = document.querySelector(`[data-page="${pageName}"]`);
            if (dataPageLink) {
                const link = dataPageLink.querySelector('.nav-link') || dataPageLink;
                link.classList.add('active');
                const navItem = link.closest('.nav-item');
                if (navItem) {
                    navItem.classList.add('active');
                }
            }
        }
    },

    /**
     * Gérer l'état des dropdowns (ouvert/fermé)
     */
    handleDropdownStates() {
        // Pour les dropdowns Bootstrap dans la sidebar
        const dropdowns = document.querySelectorAll('.navbar-nav .dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // Vérifier si un élément enfant est actif
                const hasActiveChild = menu.querySelector('.dropdown-item.active') || 
                                     menu.querySelector('.dropdown-item .active');
                
                if (hasActiveChild) {
                    // Ouvrir le dropdown si un enfant est actif
                    menu.classList.add('show');
                    toggle.setAttribute('aria-expanded', 'true');
                    dropdown.classList.add('active');
                }
                
                // Gérer le clic sur le toggle
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle l'état
                    const isOpen = menu.classList.contains('show');
                    
                    if (isOpen) {
                        menu.classList.remove('show');
                        toggle.setAttribute('aria-expanded', 'false');
                    } else {
                        // Fermer les autres dropdowns
                        this.closeOtherDropdowns(dropdown);
                        
                        // Ouvrir celui-ci
                        menu.classList.add('show');
                        toggle.setAttribute('aria-expanded', 'true');
                    }
                    
                    // Sauvegarder l'état
                    this.saveDropdownState(dropdown);
                });
            }
        });
    },

    /**
     * Fermer les autres dropdowns
     */
    closeOtherDropdowns(currentDropdown) {
        document.querySelectorAll('.navbar-nav .dropdown').forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                if (toggle && menu) {
                    menu.classList.remove('show');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    },

    /**
     * Persister l'état des dropdowns
     */
    persistDropdownStates() {
        // Restaurer les états sauvegardés
        const savedStates = this.getSavedDropdownStates();
        
        if (savedStates) {
            Object.keys(savedStates).forEach(dropdownId => {
                const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
                if (dropdown && savedStates[dropdownId]) {
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    
                    if (toggle && menu) {
                        menu.classList.add('show');
                        toggle.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        }
    },

    /**
     * Sauvegarder l'état d'un dropdown
     */
    saveDropdownState(dropdown) {
        // Générer un ID unique pour le dropdown s'il n'en a pas
        if (!dropdown.dataset.dropdownId) {
            const text = dropdown.querySelector('.nav-link-title')?.textContent || '';
            dropdown.dataset.dropdownId = this.generateId(text);
        }
        
        const dropdownId = dropdown.dataset.dropdownId;
        const isOpen = dropdown.querySelector('.dropdown-menu').classList.contains('show');
        
        // Récupérer les états existants
        const states = this.getSavedDropdownStates() || {};
        states[dropdownId] = isOpen;
        
        // Sauvegarder
        sessionStorage.setItem('sidebar-dropdown-states', JSON.stringify(states));
    },

    /**
     * Récupérer les états sauvegardés
     */
    getSavedDropdownStates() {
        const saved = sessionStorage.getItem('sidebar-dropdown-states');
        return saved ? JSON.parse(saved) : null;
    },

    /**
     * Générer un ID unique basé sur le texte
     */
    generateId(text) {
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    },

    /**
     * Configuration des event listeners supplémentaires
     */
    setupEventListeners() {
        // Highlight au survol
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            
            link.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
        });
        
        // Gestion du clic sur les liens
        document.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', function(e) {
                // Ne pas interférer avec la navigation normale
                if (this.getAttribute('href') && this.getAttribute('href') !== '#') {
                    // Ajouter une classe de transition
                    this.classList.add('transitioning');
                }
            });
        });
        
        // Réinitialiser l'état actif lors du changement de page (pour SPA)
        window.addEventListener('popstate', () => {
            this.setActiveMenuItem();
        });
    },

    /**
     * Méthode utilitaire pour mettre à jour l'état actif programmatiquement
     */
    setActive(selector) {
        // Retirer tous les états actifs
        document.querySelectorAll('.nav-link.active, .nav-item.active').forEach(el => {
            el.classList.remove('active');
        });
        
        // Ajouter l'état actif au nouvel élément
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('active');
            
            // Si c'est un nav-link, activer aussi le nav-item parent
            if (element.classList.contains('nav-link')) {
                const navItem = element.closest('.nav-item');
                if (navItem) {
                    navItem.classList.add('active');
                }
            }
            
            // Si c'est dans un dropdown, l'ouvrir
            const dropdownParent = element.closest('.dropdown-menu');
            if (dropdownParent) {
                const dropdown = dropdownParent.closest('.dropdown');
                if (dropdown) {
                    dropdownParent.classList.add('show');
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'true');
                        toggle.classList.add('active');
                    }
                    dropdown.classList.add('active');
                }
            }
        }
    }
};

// CSS additionnels pour les états actifs
const activeStateStyles = `
<style>
/* États actifs de la sidebar */
.navbar-nav .nav-link.active {
    color: var(--tblr-primary) !important;
    background-color: rgba(32, 107, 196, 0.1);
}

.navbar-nav .nav-item.active > .nav-link {
    color: var(--tblr-primary) !important;
}

/* Hover states */
.navbar-nav .nav-link.hover {
    background-color: rgba(0, 0, 0, 0.05);
}

/* Transition lors du clic */
.navbar-nav .nav-link.transitioning {
    opacity: 0.7;
    transition: opacity 0.2s;
}

/* Dropdown actif */
.navbar-nav .dropdown.active > .dropdown-toggle {
    color: var(--tblr-primary) !important;
}

/* Indicateur visuel pour les dropdowns ouverts */
.navbar-nav .dropdown-toggle[aria-expanded="true"]:after {
    transform: rotate(-180deg);
}

.navbar-nav .dropdown-toggle:after {
    transition: transform 0.3s ease;
}

/* Style pour les éléments actifs dans les dropdowns */
.dropdown-menu .dropdown-item.active,
.dropdown-menu .dropdown-item:active {
    color: var(--tblr-primary);
    background-color: rgba(32, 107, 196, 0.1);
}

/* Amélioration visuelle des dropdowns */
.navbar-vertical .dropdown-menu {
    border: none;
    box-shadow: none;
    background-color: rgba(0, 0, 0, 0.02);
    margin-left: 1rem;
    padding: 0.25rem 0;
}

.navbar-vertical .dropdown-item {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    margin: 0.125rem 0.5rem;
}

/* Animation d'ouverture des dropdowns */
.navbar-vertical .dropdown-menu {
    display: block;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.navbar-vertical .dropdown-menu.show {
    max-height: 500px;
}

/* Styles spécifiques par rôle */
.role-client .nav-link.active {
    color: #206bc4 !important;
    background-color: rgba(32, 107, 196, 0.1);
}

.role-prestataire .nav-link.active {
    color: #2fb344 !important;
    background-color: rgba(47, 179, 68, 0.1);
}

.role-revendeur .nav-link.active {
    color: #f76707 !important;
    background-color: rgba(247, 103, 7, 0.1);
}

.role-superadmin .nav-link.active {
    color: #d63939 !important;
    background-color: rgba(214, 57, 57, 0.1);
}
</style>
`;

// Injecter les styles
if (!document.querySelector('#sidebar-active-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'sidebar-active-styles';
    styleElement.innerHTML = activeStateStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Attendre un peu pour que la sidebar soit chargée
    setTimeout(() => {
        SidebarActiveState.init();
    }, 100);
});

// Exporter pour utilisation
window.SidebarActiveState = SidebarActiveState;