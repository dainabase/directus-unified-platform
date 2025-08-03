/**
 * Mobile Navigation Handler
 * Gère le menu burger et la navigation mobile responsive
 * Compatible avec tous les espaces (Client, Prestataire, Revendeur, SuperAdmin)
 */

const MobileNavigation = {
    init() {
        console.log('📱 Initialisation navigation mobile');
        
        this.setupBurgerMenu();
        this.setupMobileMenuClose();
        this.setupSwipeGestures();
        this.handleResponsive();
        this.persistMenuState();
    },
    
    /**
     * Configuration du menu burger
     */
    setupBurgerMenu() {
        // Créer le bouton burger s'il n'existe pas
        this.createBurgerButton();
        
        // Gérer le toggle du menu
        const burgerBtn = document.querySelector('.navbar-toggler');
        const sidebar = document.querySelector('.navbar-vertical');
        const overlay = this.createOverlay();
        
        if (burgerBtn && sidebar) {
            burgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }
    },
    
    /**
     * Créer le bouton burger dans la navbar
     */
    createBurgerButton() {
        const navbar = document.querySelector('.navbar.navbar-expand-md');
        if (!navbar) return;
        
        // Vérifier si le bouton existe déjà
        let burgerBtn = navbar.querySelector('.navbar-toggler');
        if (!burgerBtn) {
            burgerBtn = document.createElement('button');
            burgerBtn.className = 'navbar-toggler';
            burgerBtn.type = 'button';
            burgerBtn.setAttribute('aria-label', 'Toggle navigation');
            burgerBtn.innerHTML = `
                <span class="navbar-toggler-icon"></span>
            `;
            
            // Insérer au début de la navbar
            navbar.insertBefore(burgerBtn, navbar.firstChild);
        }
    },
    
    /**
     * Créer l'overlay pour mobile
     */
    createOverlay() {
        let overlay = document.querySelector('.mobile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
            
            // Fermer le menu au clic sur l'overlay
            overlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
        return overlay;
    },
    
    /**
     * Toggle du menu
     */
    toggleMenu() {
        const sidebar = document.querySelector('.navbar-vertical');
        const overlay = document.querySelector('.mobile-overlay');
        const body = document.body;
        
        if (sidebar.classList.contains('show')) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    },
    
    /**
     * Ouvrir le menu
     */
    openMenu() {
        const sidebar = document.querySelector('.navbar-vertical');
        const overlay = document.querySelector('.mobile-overlay');
        const body = document.body;
        
        sidebar.classList.add('show');
        overlay.classList.add('show');
        body.classList.add('navbar-vertical-open');
        
        // Empêcher le scroll du body
        body.style.overflow = 'hidden';
        
        // Sauvegarder l'état
        sessionStorage.setItem('mobile-menu-open', 'true');
    },
    
    /**
     * Fermer le menu
     */
    closeMenu() {
        const sidebar = document.querySelector('.navbar-vertical');
        const overlay = document.querySelector('.mobile-overlay');
        const body = document.body;
        
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        body.classList.remove('navbar-vertical-open');
        
        // Restaurer le scroll
        body.style.overflow = '';
        
        // Sauvegarder l'état
        sessionStorage.removeItem('mobile-menu-open');
    },
    
    /**
     * Fermeture automatique après clic sur un lien
     */
    setupMobileMenuClose() {
        const sidebar = document.querySelector('.navbar-vertical');
        if (!sidebar) return;
        
        // Fermer au clic sur un lien du menu
        sidebar.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link') && window.innerWidth < 992) {
                // Petit délai pour permettre la navigation
                setTimeout(() => {
                    this.closeMenu();
                }, 100);
            }
        });
    },
    
    /**
     * Gestion des gestes swipe (optionnel)
     */
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const sidebar = document.querySelector('.navbar-vertical');
            
            // Swipe de gauche à droite pour ouvrir
            if (touchEndX > touchStartX + swipeThreshold && touchStartX < 50) {
                this.openMenu();
            }
            
            // Swipe de droite à gauche pour fermer
            if (touchStartX > touchEndX + swipeThreshold && sidebar.classList.contains('show')) {
                this.closeMenu();
            }
        };
    },
    
    /**
     * Gérer le responsive
     */
    handleResponsive() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Si on passe en desktop, fermer le menu mobile
                if (window.innerWidth >= 992) {
                    this.closeMenu();
                }
            }, 250);
        });
    },
    
    /**
     * Persister l'état du menu
     */
    persistMenuState() {
        // Restaurer l'état au chargement
        if (sessionStorage.getItem('mobile-menu-open') === 'true' && window.innerWidth < 992) {
            this.openMenu();
        }
    },
    
    /**
     * Méthode utilitaire pour vérifier si on est en mobile
     */
    isMobile() {
        return window.innerWidth < 992;
    }
};

// CSS requis (à ajouter dans custom.css)
const mobileNavStyles = `
<style>
/* Mobile Navigation Styles */
@media (max-width: 991.98px) {
    .navbar-toggler {
        display: block !important;
        padding: 0.25rem 0.5rem;
        font-size: 1.25rem;
        line-height: 1;
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 0.25rem;
        transition: box-shadow 0.15s ease-in-out;
    }
    
    .navbar-toggler:focus {
        text-decoration: none;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(32, 107, 196, 0.25);
    }
    
    .navbar-toggler-icon {
        display: inline-block;
        width: 1.5em;
        height: 1.5em;
        vertical-align: middle;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100%;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2833, 37, 41, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }
    
    .navbar-vertical {
        position: fixed !important;
        top: 0;
        left: -280px;
        width: 280px;
        height: 100vh;
        background: var(--tblr-bg-surface);
        transition: left 0.3s ease-in-out;
        z-index: 1045;
        overflow-y: auto;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    
    .navbar-vertical.show {
        left: 0;
    }
    
    .mobile-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        z-index: 1040;
    }
    
    .mobile-overlay.show {
        opacity: 1;
        visibility: visible;
    }
    
    body.navbar-vertical-open {
        overflow: hidden;
    }
}

@media (min-width: 992px) {
    .navbar-toggler {
        display: none !important;
    }
    
    .mobile-overlay {
        display: none !important;
    }
}
</style>
`;

// Injecter les styles si nécessaire
if (!document.querySelector('#mobile-nav-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'mobile-nav-styles';
    styleElement.innerHTML = mobileNavStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    MobileNavigation.init();
});

// Export pour utilisation dans d'autres modules
window.MobileNavigation = MobileNavigation;