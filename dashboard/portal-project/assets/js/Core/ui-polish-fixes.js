/**
 * UI Polish Fixes
 * Corrige les bugs cosmétiques (tooltips, spinner, focus outline)
 */

const UIPolishFixes = {
    /**
     * Initialiser les corrections
     */
    init() {
        console.log('✨ Initialisation des corrections UI cosmétiques');
        
        this.fixTooltipsPosition();
        this.fixSpinnerAnimation();
        this.fixFocusOutlines();
        this.addPolishStyles();
    },

    /**
     * Ajouter les styles de correction
     */
    addPolishStyles() {
        const styles = `
        <style>
        /* Fix Tooltips Mobile */
        @media (max-width: 768px) {
            .tooltip {
                position: fixed !important;
                z-index: 9999;
            }
            
            .tooltip.show {
                opacity: 0.95;
            }
            
            .tooltip-inner {
                max-width: 200px;
                padding: 0.5rem 0.75rem;
                font-size: 0.875rem;
            }
            
            /* Forcer le placement en haut sur mobile */
            .tooltip.bs-tooltip-auto,
            .tooltip.bs-tooltip-bottom {
                top: auto !important;
                bottom: 60px !important;
            }
            
            .tooltip .tooltip-arrow {
                display: none;
            }
        }
        
        /* Fix Spinner Safari */
        @keyframes spinner-border-safari {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        .spinner-border {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            vertical-align: text-bottom;
            border: 0.25em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner-border-safari 0.75s linear infinite;
            margin: 0 auto;
        }
        
        /* Centrage spinner dans conteneurs */
        .text-center .spinner-border,
        .d-flex .spinner-border {
            margin: 0 auto;
        }
        
        .modal-body .spinner-border,
        .card-body .spinner-border {
            display: block;
            margin: 2rem auto;
        }
        
        /* Safari specific fix */
        @supports (-webkit-appearance: none) {
            .spinner-border {
                -webkit-animation: spinner-border-safari 0.75s linear infinite;
                transform-origin: center center;
            }
        }
        
        /* Fix Focus Outlines */
        button:focus-visible,
        .btn:focus-visible,
        a.btn:focus-visible,
        [role="button"]:focus-visible {
            outline: 2px solid var(--tblr-primary);
            outline-offset: 2px;
        }
        
        /* Focus pour les éléments interactifs */
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible,
        .form-control:focus-visible,
        .form-select:focus-visible {
            outline: 2px solid var(--tblr-primary);
            outline-offset: -2px;
            box-shadow: 0 0 0 0.25rem rgba(32, 107, 196, 0.25);
        }
        
        /* Focus pour les liens */
        a:focus-visible:not(.btn) {
            outline: 2px solid var(--tblr-primary);
            outline-offset: 2px;
            text-decoration: underline;
        }
        
        /* Focus pour les cards cliquables */
        .card[onclick]:focus-visible,
        .card[role="button"]:focus-visible,
        .card.cursor-pointer:focus-visible {
            outline: 2px solid var(--tblr-primary);
            outline-offset: 4px;
        }
        
        /* Focus pour les éléments de navigation */
        .nav-link:focus-visible {
            outline: 2px solid var(--tblr-primary);
            outline-offset: -2px;
            border-radius: 0.25rem;
        }
        
        /* Focus pour dropdowns */
        .dropdown-toggle:focus-visible {
            outline: 2px solid var(--tblr-primary);
            outline-offset: 2px;
        }
        
        .dropdown-item:focus-visible {
            outline: 2px solid var(--tblr-primary);
            outline-offset: -2px;
        }
        
        /* Améliorer la visibilité du focus */
        :focus-visible {
            transition: outline-offset 0.2s ease;
        }
        
        /* Supprimer l'outline par défaut du navigateur */
        *:focus:not(:focus-visible) {
            outline: none;
        }
        
        /* Styles spécifiques par rôle */
        .role-client button:focus-visible,
        .role-client .btn:focus-visible {
            outline-color: #206bc4;
        }
        
        .role-prestataire button:focus-visible,
        .role-prestataire .btn:focus-visible {
            outline-color: #2fb344;
        }
        
        .role-revendeur button:focus-visible,
        .role-revendeur .btn:focus-visible {
            outline-color: #f76707;
        }
        
        /* Amélioration accessibilité */
        @media (prefers-reduced-motion: reduce) {
            .spinner-border {
                animation-duration: 1.5s;
            }
            
            :focus-visible {
                transition: none;
            }
        }
        
        /* Mode haute contrast */
        @media (prefers-contrast: high) {
            :focus-visible {
                outline-width: 3px;
            }
            
            .spinner-border {
                border-width: 0.3em;
            }
        }
        </style>
        `;

        if (!document.querySelector('#ui-polish-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'ui-polish-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Corriger la position des tooltips sur mobile
     */
    fixTooltipsPosition() {
        // Override Bootstrap tooltip pour mobile
        if (window.bootstrap && window.bootstrap.Tooltip) {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            
            if (isMobile) {
                // Patcher le constructeur Tooltip
                const OriginalTooltip = window.bootstrap.Tooltip;
                
                window.bootstrap.Tooltip = function(element, config) {
                    // Forcer le placement en haut sur mobile
                    if (!config) config = {};
                    config.placement = 'top';
                    config.fallbackPlacements = ['top', 'bottom'];
                    config.boundary = 'viewport';
                    config.container = 'body';
                    
                    return new OriginalTooltip(element, config);
                };
                
                // Copier les méthodes statiques
                Object.setPrototypeOf(window.bootstrap.Tooltip, OriginalTooltip);
                window.bootstrap.Tooltip.prototype = OriginalTooltip.prototype;
            }
        }
        
        // Réinitialiser les tooltips existants
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            // Détruire l'instance existante
            const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
            
            // Créer une nouvelle instance avec les bonnes options
            new bootstrap.Tooltip(tooltipTriggerEl, {
                boundary: 'viewport',
                container: 'body',
                placement: window.matchMedia('(max-width: 768px)').matches ? 'top' : 'auto'
            });
        });
        
        // Observer les nouveaux éléments
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches('[data-bs-toggle="tooltip"]')) {
                            new bootstrap.Tooltip(node);
                        }
                        
                        if (node.querySelectorAll) {
                            const tooltips = node.querySelectorAll('[data-bs-toggle="tooltip"]');
                            tooltips.forEach(el => new bootstrap.Tooltip(el));
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * Corriger l'animation du spinner sur Safari
     */
    fixSpinnerAnimation() {
        // Détecter Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isSafari) {
            document.body.classList.add('browser-safari');
            
            // Corriger les spinners existants
            document.querySelectorAll('.spinner-border, .spinner-grow').forEach(spinner => {
                this.fixSpinner(spinner);
            });
            
            // Observer les nouveaux spinners
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.matches && (node.matches('.spinner-border') || node.matches('.spinner-grow'))) {
                                this.fixSpinner(node);
                            }
                            
                            if (node.querySelectorAll) {
                                const spinners = node.querySelectorAll('.spinner-border, .spinner-grow');
                                spinners.forEach(spinner => this.fixSpinner(spinner));
                            }
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    },

    /**
     * Corriger un spinner individuel
     */
    fixSpinner(spinner) {
        // S'assurer que le spinner est centré dans son conteneur
        const parent = spinner.parentElement;
        
        if (parent) {
            // Si le parent est un flex container
            if (window.getComputedStyle(parent).display === 'flex') {
                parent.style.alignItems = 'center';
                parent.style.justifyContent = 'center';
            }
            
            // Si le parent a text-center
            if (parent.classList.contains('text-center')) {
                spinner.style.display = 'block';
                spinner.style.margin = '0 auto';
            }
        }
        
        // Forcer le redraw pour Safari
        spinner.style.display = 'none';
        spinner.offsetHeight; // Force reflow
        spinner.style.display = '';
    },

    /**
     * Corriger les focus outlines manquants
     */
    fixFocusOutlines() {
        // Ajouter tabindex aux éléments cliquables sans focus naturel
        const clickableElements = document.querySelectorAll(`
            .card[onclick],
            .card[role="button"],
            div[onclick],
            span[onclick],
            [data-bs-toggle]:not(button):not(a),
            .cursor-pointer:not(button):not(a)
        `);
        
        clickableElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            // Ajouter le rôle button si nécessaire
            if (!element.hasAttribute('role') && !element.matches('a, button, input, select, textarea')) {
                element.setAttribute('role', 'button');
            }
        });
        
        // S'assurer que tous les boutons ont un état focus visible
        const buttons = document.querySelectorAll('button, .btn, [role="button"]');
        buttons.forEach(button => {
            // Retirer les classes qui pourraient interférer
            button.classList.remove('focus:outline-none', 'outline-none');
        });
        
        // Gérer le focus au clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    UIPolishFixes.init();
});

// Réinitialiser lors du resize pour les tooltips
window.addEventListener('resize', debounce(() => {
    UIPolishFixes.fixTooltipsPosition();
}, 250));

// Fonction debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exporter pour utilisation
window.UIPolishFixes = UIPolishFixes;