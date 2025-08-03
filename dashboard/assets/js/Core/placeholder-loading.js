/**
 * Placeholder Loading Component
 * Implémente les placeholders de chargement style Tabler
 */

const PlaceholderLoading = {
    /**
     * Initialiser le composant
     */
    init() {
        console.log('⏳ Initialisation du composant Placeholder Loading');
        
        this.createPlaceholderStyles();
        this.setupPlaceholderAPI();
        this.observeLoadingElements();
    },

    /**
     * Créer les styles pour les placeholders
     */
    createPlaceholderStyles() {
        const styles = `
        <style>
        /* Placeholder Styles */
        .placeholder {
            display: inline-block;
            min-height: 1em;
            vertical-align: middle;
            cursor: wait;
            background-color: currentColor;
            opacity: 0.2;
            border-radius: 0.25rem;
        }

        .placeholder.btn {
            display: inline-block;
            min-height: 2.5rem;
            min-width: 6rem;
        }

        /* Animation glow */
        .placeholder-glow .placeholder {
            animation: placeholder-glow 2s ease-in-out infinite;
        }

        @keyframes placeholder-glow {
            50% {
                opacity: 0.1;
            }
        }

        /* Animation wave */
        .placeholder-wave {
            mask-image: linear-gradient(130deg, #000 55%, rgba(0, 0, 0, 0.8) 75%, #000 95%);
            mask-size: 200% 100%;
            animation: placeholder-wave 2s linear infinite;
        }

        @keyframes placeholder-wave {
            100% {
                mask-position: -200% 0%;
            }
        }

        /* Largeurs prédéfinies */
        .placeholder-xs { width: 2rem; }
        .placeholder-sm { width: 4rem; }
        .placeholder-md { width: 6rem; }
        .placeholder-lg { width: 8rem; }
        .placeholder-xl { width: 10rem; }
        
        .w-25 { width: 25% !important; }
        .w-50 { width: 50% !important; }
        .w-75 { width: 75% !important; }
        .w-100 { width: 100% !important; }

        /* Placeholder pour cartes */
        .placeholder-card {
            background: var(--tblr-bg-surface);
            border: 1px solid var(--tblr-border-color);
            border-radius: 0.5rem;
            padding: 1.5rem;
        }

        .placeholder-card .placeholder-img {
            width: 100%;
            height: 200px;
            background: var(--tblr-gray-200);
            border-radius: 0.25rem;
            margin-bottom: 1rem;
        }

        /* Placeholder pour avatars */
        .placeholder-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: var(--tblr-gray-200);
            display: inline-block;
        }

        .placeholder-avatar-lg {
            width: 4rem;
            height: 4rem;
        }

        .placeholder-avatar-xl {
            width: 6rem;
            height: 6rem;
        }

        /* Placeholder pour tableaux */
        .placeholder-table {
            width: 100%;
        }

        .placeholder-table .placeholder-row {
            display: flex;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--tblr-border-color);
        }

        .placeholder-table .placeholder-cell {
            flex: 1;
            margin-right: 1rem;
        }

        /* Placeholder pour formulaires */
        .placeholder-input {
            height: 2.5rem;
            width: 100%;
            background: var(--tblr-gray-100);
            border: 1px solid var(--tblr-border-color);
            border-radius: 0.25rem;
            margin-bottom: 1rem;
        }

        .placeholder-textarea {
            height: 6rem;
            width: 100%;
            background: var(--tblr-gray-100);
            border: 1px solid var(--tblr-border-color);
            border-radius: 0.25rem;
        }

        /* Placeholder pour listes */
        .placeholder-list {
            padding: 0;
            list-style: none;
        }

        .placeholder-list-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--tblr-border-color);
        }

        .placeholder-list-item .placeholder-avatar {
            margin-right: 1rem;
        }

        /* Placeholder pour graphiques */
        .placeholder-chart {
            width: 100%;
            height: 300px;
            background: var(--tblr-gray-100);
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--tblr-muted);
        }

        /* Variantes de couleur */
        .placeholder-primary { background-color: var(--tblr-primary); opacity: 0.2; }
        .placeholder-secondary { background-color: var(--tblr-secondary); opacity: 0.2; }
        .placeholder-success { background-color: var(--tblr-success); opacity: 0.2; }
        .placeholder-danger { background-color: var(--tblr-danger); opacity: 0.2; }
        .placeholder-warning { background-color: var(--tblr-warning); opacity: 0.2; }
        .placeholder-info { background-color: var(--tblr-info); opacity: 0.2; }

        /* Mode skeleton */
        .skeleton {
            position: relative;
            overflow: hidden;
            background: var(--tblr-gray-200);
        }

        .skeleton::after {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0,
                rgba(255, 255, 255, 0.2) 20%,
                rgba(255, 255, 255, 0.5) 60%,
                rgba(255, 255, 255, 0)
            );
            animation: shimmer 2s infinite;
            content: '';
        }

        @keyframes shimmer {
            100% {
                transform: translateX(100%);
            }
        }

        /* États de chargement pour conteneurs */
        .loading-container {
            position: relative;
            min-height: 100px;
        }

        .loading-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            z-index: 10;
        }

        .loading-container::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 2rem;
            height: 2rem;
            border: 2px solid var(--tblr-primary);
            border-right-color: transparent;
            border-radius: 50%;
            animation: spin 0.75s linear infinite;
            z-index: 11;
        }

        @keyframes spin {
            100% {
                transform: translate(-50%, -50%) rotate(360deg);
            }
        }
        </style>
        `;

        if (!document.querySelector('#placeholder-loading-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'placeholder-loading-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Configuration de l'API
     */
    setupPlaceholderAPI() {
        window.Placeholder = {
            /**
             * Créer un placeholder de texte
             */
            text: (options = {}) => {
                const defaults = {
                    width: 'md',
                    animation: 'glow',
                    tag: 'span'
                };
                
                const config = { ...defaults, ...options };
                
                const element = document.createElement(config.tag);
                element.className = 'placeholder';
                
                if (config.width) {
                    if (['xs', 'sm', 'md', 'lg', 'xl'].includes(config.width)) {
                        element.classList.add(`placeholder-${config.width}`);
                    } else if (config.width.includes('%')) {
                        element.style.width = config.width;
                    } else {
                        element.classList.add(`w-${config.width}`);
                    }
                }
                
                return element;
            },

            /**
             * Créer un placeholder de bouton
             */
            button: (options = {}) => {
                const defaults = {
                    size: 'md',
                    variant: 'primary',
                    animation: 'glow'
                };
                
                const config = { ...defaults, ...options };
                
                const element = document.createElement('span');
                element.className = `placeholder btn btn-${config.variant}`;
                
                if (config.size === 'sm') {
                    element.style.minHeight = '2rem';
                    element.style.minWidth = '4rem';
                } else if (config.size === 'lg') {
                    element.style.minHeight = '3rem';
                    element.style.minWidth = '8rem';
                }
                
                return element;
            },

            /**
             * Créer une carte placeholder
             */
            card: (options = {}) => {
                const defaults = {
                    showImage: true,
                    showTitle: true,
                    showText: true,
                    showButton: true
                };
                
                const config = { ...defaults, ...options };
                
                const card = document.createElement('div');
                card.className = 'placeholder-card placeholder-glow';
                
                if (config.showImage) {
                    const img = document.createElement('div');
                    img.className = 'placeholder-img skeleton';
                    card.appendChild(img);
                }
                
                if (config.showTitle) {
                    const title = document.createElement('h5');
                    title.className = 'placeholder placeholder-lg w-75';
                    card.appendChild(title);
                }
                
                if (config.showText) {
                    const text1 = document.createElement('p');
                    text1.className = 'placeholder w-100';
                    card.appendChild(text1);
                    
                    const text2 = document.createElement('p');
                    text2.className = 'placeholder w-75';
                    card.appendChild(text2);
                }
                
                if (config.showButton) {
                    const btn = this.button();
                    card.appendChild(btn);
                }
                
                return card;
            },

            /**
             * Créer une ligne de tableau placeholder
             */
            tableRow: (columns = 4) => {
                const row = document.createElement('div');
                row.className = 'placeholder-row placeholder-glow';
                
                for (let i = 0; i < columns; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'placeholder-cell';
                    
                    const placeholder = document.createElement('span');
                    placeholder.className = 'placeholder w-100';
                    
                    cell.appendChild(placeholder);
                    row.appendChild(cell);
                }
                
                return row;
            },

            /**
             * Créer un élément de liste placeholder
             */
            listItem: (options = {}) => {
                const defaults = {
                    showAvatar: true,
                    showTitle: true,
                    showSubtitle: true
                };
                
                const config = { ...defaults, ...options };
                
                const item = document.createElement('div');
                item.className = 'placeholder-list-item placeholder-glow';
                
                if (config.showAvatar) {
                    const avatar = document.createElement('div');
                    avatar.className = 'placeholder-avatar skeleton';
                    item.appendChild(avatar);
                }
                
                const content = document.createElement('div');
                content.style.flex = '1';
                
                if (config.showTitle) {
                    const title = document.createElement('div');
                    title.className = 'placeholder placeholder-sm w-50 mb-1';
                    content.appendChild(title);
                }
                
                if (config.showSubtitle) {
                    const subtitle = document.createElement('div');
                    subtitle.className = 'placeholder placeholder-xs w-75';
                    content.appendChild(subtitle);
                }
                
                item.appendChild(content);
                
                return item;
            },

            /**
             * Créer un graphique placeholder
             */
            chart: (height = 300) => {
                const chart = document.createElement('div');
                chart.className = 'placeholder-chart skeleton';
                chart.style.height = `${height}px`;
                chart.innerHTML = '<i class="ti ti-chart-line" style="font-size: 3rem;"></i>';
                
                return chart;
            },

            /**
             * Remplacer un élément par son placeholder
             */
            replace: (element, placeholderType = 'text', options = {}) => {
                const placeholder = this[placeholderType](options);
                placeholder.dataset.originalId = element.id || '';
                placeholder.dataset.originalClass = element.className || '';
                
                element.style.display = 'none';
                element.parentNode.insertBefore(placeholder, element);
                
                return placeholder;
            },

            /**
             * Restaurer l'élément original
             */
            restore: (placeholder) => {
                const nextElement = placeholder.nextElementSibling;
                if (nextElement && nextElement.style.display === 'none') {
                    nextElement.style.display = '';
                    placeholder.remove();
                    return nextElement;
                }
                return null;
            },

            /**
             * Ajouter un état de chargement à un conteneur
             */
            loading: (container, show = true) => {
                if (show) {
                    container.classList.add('loading-container');
                } else {
                    container.classList.remove('loading-container');
                }
            },

            /**
             * Créer un ensemble de placeholders
             */
            createSet: (type, count, options = {}) => {
                const fragment = document.createDocumentFragment();
                
                for (let i = 0; i < count; i++) {
                    const placeholder = this[type](options);
                    fragment.appendChild(placeholder);
                }
                
                return fragment;
            }
        };
    },

    /**
     * Observer les éléments avec data-loading
     */
    observeLoadingElements() {
        // Observer les éléments qui doivent afficher un placeholder
        document.querySelectorAll('[data-loading="true"]').forEach(element => {
            const type = element.dataset.loadingType || 'text';
            const options = element.dataset.loadingOptions ? 
                JSON.parse(element.dataset.loadingOptions) : {};
            
            window.Placeholder.replace(element, type, options);
        });

        // Observer les changements
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-loading') {
                    const element = mutation.target;
                    if (element.dataset.loading === 'true') {
                        const type = element.dataset.loadingType || 'text';
                        const options = element.dataset.loadingOptions ? 
                            JSON.parse(element.dataset.loadingOptions) : {};
                        
                        window.Placeholder.replace(element, type, options);
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-loading'],
            subtree: true
        });
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    PlaceholderLoading.init();
});

// Exporter pour utilisation
window.PlaceholderLoading = PlaceholderLoading;