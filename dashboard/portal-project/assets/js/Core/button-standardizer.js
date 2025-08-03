/**
 * Button Standardizer
 * Standardise tous les boutons pour utiliser les classes Tabler
 */

const ButtonStandardizer = {
    /**
     * Configuration des mappings de classes
     */
    classMap: {
        // Classes Bootstrap génériques vers Tabler
        'btn-default': 'btn-secondary',
        'btn-xs': 'btn-sm',
        'btn-block': 'w-100',
        'pull-right': 'float-end',
        'pull-left': 'float-start',
        
        // Classes custom à remplacer
        'custom-btn': 'btn',
        'action-btn': 'btn',
        'submit-btn': 'btn btn-primary',
        'cancel-btn': 'btn btn-secondary',
        'delete-btn': 'btn btn-danger',
        'edit-btn': 'btn btn-warning',
        'save-btn': 'btn btn-success',
        
        // Classes de taille
        'btn-large': 'btn-lg',
        'btn-small': 'btn-sm',
        'btn-mini': 'btn-sm',
        
        // Classes d'état
        'btn-disabled': 'disabled',
        'btn-loading': 'btn-loading'
    },

    /**
     * Initialiser la standardisation
     */
    init() {
        console.log('🔘 Initialisation de la standardisation des boutons');
        
        this.standardizeAllButtons();
        this.addMissingIcons();
        this.fixButtonGroups();
        this.ensureAccessibility();
    },

    /**
     * Standardiser tous les boutons
     */
    standardizeAllButtons() {
        // Sélectionner tous les éléments qui devraient être des boutons
        const buttons = document.querySelectorAll(
            'button, .btn, [role="button"], input[type="submit"], input[type="button"], a.button'
        );
        
        buttons.forEach(button => {
            this.standardizeButton(button);
        });
        
        // Gérer les liens qui ressemblent à des boutons
        const linkButtons = document.querySelectorAll('a[class*="btn-"], a[class*="button"]');
        linkButtons.forEach(link => {
            this.standardizeButton(link);
        });
    },

    /**
     * Standardiser un bouton individuel
     */
    standardizeButton(button) {
        // S'assurer que l'élément a la classe btn de base
        if (!button.classList.contains('btn') && 
            !button.tagName.match(/^(INPUT|SELECT|TEXTAREA)$/)) {
            button.classList.add('btn');
        }
        
        // Remplacer les classes non standard
        const classList = Array.from(button.classList);
        classList.forEach(className => {
            if (this.classMap[className]) {
                button.classList.remove(className);
                // Si c'est une classe composée (avec espace)
                if (this.classMap[className].includes(' ')) {
                    this.classMap[className].split(' ').forEach(newClass => {
                        button.classList.add(newClass);
                    });
                } else {
                    button.classList.add(this.classMap[className]);
                }
            }
        });
        
        // Vérifier les variantes de couleur
        this.standardizeButtonVariant(button);
        
        // Vérifier la taille
        this.standardizeButtonSize(button);
        
        // Gérer les boutons outline
        this.handleOutlineButtons(button);
        
        // Gérer les boutons ghost
        this.handleGhostButtons(button);
    },

    /**
     * Standardiser les variantes de couleur
     */
    standardizeButtonVariant(button) {
        const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'dark', 'light'];
        const hasVariant = variants.some(variant => 
            button.classList.contains(`btn-${variant}`) || 
            button.classList.contains(`btn-outline-${variant}`)
        );
        
        // Si pas de variante, ajouter secondary par défaut
        if (!hasVariant && button.classList.contains('btn')) {
            // Détecter le contexte pour choisir la variante appropriée
            if (button.type === 'submit' || button.textContent.match(/enregistrer|sauvegarder|créer|ajouter/i)) {
                button.classList.add('btn-primary');
            } else if (button.textContent.match(/supprimer|effacer|annuler/i)) {
                button.classList.add('btn-danger');
            } else {
                button.classList.add('btn-secondary');
            }
        }
    },

    /**
     * Standardiser la taille des boutons
     */
    standardizeButtonSize(button) {
        // Vérifier si une taille est déjà définie
        const sizes = ['btn-lg', 'btn-sm'];
        const hasSize = sizes.some(size => button.classList.contains(size));
        
        // Pour les boutons dans des toolbars ou des actions de table, utiliser btn-sm
        if (!hasSize) {
            const isInToolbar = button.closest('.btn-toolbar, .toolbar, .actions');
            const isInTable = button.closest('td, th');
            const isInDropdown = button.closest('.dropdown-menu');
            
            if (isInToolbar || isInTable || isInDropdown) {
                button.classList.add('btn-sm');
            }
        }
    },

    /**
     * Gérer les boutons outline
     */
    handleOutlineButtons(button) {
        // Convertir les anciennes classes outline
        const outlinePatterns = [
            /btn-outline$/,
            /outline-btn/,
            /btn-line/
        ];
        
        outlinePatterns.forEach(pattern => {
            const matches = Array.from(button.classList).filter(c => pattern.test(c));
            matches.forEach(match => {
                button.classList.remove(match);
                // Déterminer la variante
                const variant = this.detectButtonVariant(button);
                button.classList.add(`btn-outline-${variant}`);
            });
        });
    },

    /**
     * Gérer les boutons ghost
     */
    handleGhostButtons(button) {
        // Les boutons ghost dans Tabler
        if (button.classList.contains('btn-ghost') || 
            button.classList.contains('ghost-btn')) {
            button.classList.remove('btn-ghost', 'ghost-btn');
            button.classList.add('btn-ghost-primary');
        }
    },

    /**
     * Ajouter les icônes manquantes
     */
    addMissingIcons() {
        // Configuration des icônes par type de bouton
        const iconMap = {
            'Ajouter': 'ti-plus',
            'Créer': 'ti-plus',
            'Nouveau': 'ti-plus',
            'Supprimer': 'ti-trash',
            'Éditer': 'ti-pencil',
            'Modifier': 'ti-pencil',
            'Enregistrer': 'ti-device-floppy',
            'Sauvegarder': 'ti-device-floppy',
            'Télécharger': 'ti-download',
            'Exporter': 'ti-file-export',
            'Importer': 'ti-file-import',
            'Rechercher': 'ti-search',
            'Filtrer': 'ti-filter',
            'Actualiser': 'ti-refresh',
            'Paramètres': 'ti-settings',
            'Fermer': 'ti-x',
            'Retour': 'ti-arrow-left',
            'Suivant': 'ti-arrow-right',
            'Précédent': 'ti-arrow-left'
        };
        
        document.querySelectorAll('.btn').forEach(button => {
            // Vérifier si le bouton a déjà une icône
            if (!button.querySelector('i, svg, .icon')) {
                const buttonText = button.textContent.trim();
                
                // Chercher une correspondance dans iconMap
                for (const [text, iconClass] of Object.entries(iconMap)) {
                    if (buttonText.toLowerCase().includes(text.toLowerCase())) {
                        // Créer l'icône
                        const icon = document.createElement('i');
                        icon.className = `icon ${iconClass}`;
                        
                        // Insérer l'icône au début
                        button.insertBefore(icon, button.firstChild);
                        
                        // Ajouter un espace après l'icône si nécessaire
                        if (button.childNodes.length > 1) {
                            button.insertBefore(document.createTextNode(' '), icon.nextSibling);
                        }
                        
                        break;
                    }
                }
            }
        });
    },

    /**
     * Corriger les groupes de boutons
     */
    fixButtonGroups() {
        // Trouver tous les groupes de boutons
        const groups = document.querySelectorAll('.btn-group, .button-group, .btn-toolbar');
        
        groups.forEach(group => {
            // S'assurer que la classe correcte est utilisée
            if (group.classList.contains('button-group')) {
                group.classList.remove('button-group');
                group.classList.add('btn-group');
            }
            
            // Vérifier que tous les enfants sont des boutons
            const children = group.querySelectorAll(':scope > *');
            children.forEach(child => {
                if (!child.classList.contains('btn') && 
                    !child.classList.contains('btn-group') &&
                    !child.classList.contains('dropdown')) {
                    this.standardizeButton(child);
                }
            });
            
            // Gérer les rôles ARIA
            if (!group.hasAttribute('role')) {
                group.setAttribute('role', 'group');
            }
        });
        
        // Gérer les boutons radio/toggle
        this.handleToggleButtons();
    },

    /**
     * Gérer les boutons toggle
     */
    handleToggleButtons() {
        // Boutons radio dans les groupes
        document.querySelectorAll('.btn-group-toggle').forEach(group => {
            const buttons = group.querySelectorAll('.btn');
            buttons.forEach(button => {
                // S'assurer que le input radio est correctement caché
                const input = button.querySelector('input[type="radio"], input[type="checkbox"]');
                if (input) {
                    input.classList.add('btn-check');
                    // Générer un ID unique si nécessaire
                    if (!input.id) {
                        input.id = `btn-check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    }
                    // Associer le label
                    if (!button.hasAttribute('for') && button.tagName === 'LABEL') {
                        button.setAttribute('for', input.id);
                    }
                }
            });
        });
    },

    /**
     * Assurer l'accessibilité
     */
    ensureAccessibility() {
        document.querySelectorAll('.btn').forEach(button => {
            // Ajouter role="button" si nécessaire
            if (!button.hasAttribute('role') && button.tagName !== 'BUTTON') {
                button.setAttribute('role', 'button');
            }
            
            // S'assurer que les boutons désactivés sont correctement marqués
            if (button.classList.contains('disabled') || button.hasAttribute('disabled')) {
                button.setAttribute('aria-disabled', 'true');
                if (!button.hasAttribute('disabled') && button.tagName === 'BUTTON') {
                    button.setAttribute('disabled', 'disabled');
                }
            }
            
            // Ajouter tabindex pour les éléments non-focusables
            if (!button.hasAttribute('tabindex') && 
                !['BUTTON', 'A', 'INPUT'].includes(button.tagName)) {
                button.setAttribute('tabindex', '0');
            }
            
            // S'assurer que les boutons avec icônes seulement ont un aria-label
            if (!button.textContent.trim() || button.textContent.trim().length < 3) {
                if (!button.hasAttribute('aria-label') && !button.hasAttribute('title')) {
                    // Essayer de déduire le label depuis l'icône
                    const icon = button.querySelector('i, svg');
                    if (icon) {
                        const iconClass = icon.className;
                        const label = this.guessLabelFromIcon(iconClass);
                        if (label) {
                            button.setAttribute('aria-label', label);
                            button.setAttribute('title', label);
                        }
                    }
                }
            }
        });
    },

    /**
     * Deviner le label depuis la classe d'icône
     */
    guessLabelFromIcon(iconClass) {
        const iconLabels = {
            'ti-plus': 'Ajouter',
            'ti-trash': 'Supprimer',
            'ti-pencil': 'Modifier',
            'ti-x': 'Fermer',
            'ti-settings': 'Paramètres',
            'ti-download': 'Télécharger',
            'ti-search': 'Rechercher',
            'ti-filter': 'Filtrer',
            'ti-refresh': 'Actualiser',
            'ti-dots': 'Plus d\'options',
            'ti-dots-vertical': 'Plus d\'options',
            'ti-eye': 'Voir',
            'ti-copy': 'Copier',
            'ti-share': 'Partager'
        };
        
        for (const [icon, label] of Object.entries(iconLabels)) {
            if (iconClass.includes(icon)) {
                return label;
            }
        }
        
        return null;
    },

    /**
     * Détecter la variante d'un bouton
     */
    detectButtonVariant(button) {
        const text = button.textContent.toLowerCase();
        const classes = button.className.toLowerCase();
        
        if (text.match(/supprimer|effacer|delete|remove/) || classes.includes('danger')) {
            return 'danger';
        } else if (text.match(/enregistrer|sauvegarder|save|créer|ajouter/) || classes.includes('success')) {
            return 'success';
        } else if (text.match(/modifier|éditer|edit/) || classes.includes('warning')) {
            return 'warning';
        } else if (classes.includes('info')) {
            return 'info';
        } else if (classes.includes('primary')) {
            return 'primary';
        }
        
        return 'secondary';
    },

    /**
     * Observer pour les nouveaux boutons ajoutés dynamiquement
     */
    observeNewButtons() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Vérifier si c'est un bouton
                        if (node.matches && (node.matches('.btn, button, [role="button"]'))) {
                            this.standardizeButton(node);
                        }
                        // Vérifier les boutons enfants
                        if (node.querySelectorAll) {
                            const buttons = node.querySelectorAll('.btn, button, [role="button"]');
                            buttons.forEach(btn => this.standardizeButton(btn));
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
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    ButtonStandardizer.init();
    ButtonStandardizer.observeNewButtons();
});

// Exporter pour utilisation
window.ButtonStandardizer = ButtonStandardizer;