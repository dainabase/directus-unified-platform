/**
 * Lazy Loading Images
 * Implémente le chargement différé des images pour améliorer les performances
 */

const LazyLoadingImages = {
    /**
     * Configuration
     */
    config: {
        rootMargin: '50px 0px',
        threshold: 0.01,
        fadeIn: true,
        placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23adb5bd"%3EChargement...%3C/text%3E%3C/svg%3E',
        errorImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23dc3545"%3EErreur%3C/text%3E%3C/svg%3E'
    },

    /**
     * Initialiser le lazy loading
     */
    init() {
        console.log('🖼️ Initialisation du lazy loading des images');
        
        this.createStyles();
        this.setupIntersectionObserver();
        this.processExistingImages();
        this.setupDynamicObserver();
        this.setupNativeLazyLoading();
    },

    /**
     * Créer les styles
     */
    createStyles() {
        const styles = `
        <style>
        /* Lazy loading styles */
        .lazy-image {
            display: block;
            background: #f8f9fa;
            position: relative;
            overflow: hidden;
        }
        
        .lazy-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.2) 20%,
                rgba(255, 255, 255, 0.5) 60%,
                rgba(255, 255, 255, 0)
            );
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            100% {
                left: 100%;
            }
        }
        
        .lazy-image.lazy-loading {
            filter: blur(5px);
        }
        
        .lazy-image.lazy-loaded {
            animation: lazyFadeIn 0.3s;
        }
        
        @keyframes lazyFadeIn {
            from {
                opacity: 0;
                filter: blur(5px);
            }
            to {
                opacity: 1;
                filter: blur(0);
            }
        }
        
        .lazy-image.lazy-error {
            background: #fee;
            border: 1px solid #fcc;
        }
        
        /* Placeholder avec ratio */
        .lazy-image-wrapper {
            position: relative;
            background: #f8f9fa;
            overflow: hidden;
        }
        
        .lazy-image-wrapper.ratio-16x9 {
            padding-bottom: 56.25%;
        }
        
        .lazy-image-wrapper.ratio-4x3 {
            padding-bottom: 75%;
        }
        
        .lazy-image-wrapper.ratio-1x1 {
            padding-bottom: 100%;
        }
        
        .lazy-image-wrapper.ratio-21x9 {
            padding-bottom: 42.857143%;
        }
        
        .lazy-image-wrapper img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* Indicateur de chargement */
        .lazy-image-loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
        }
        
        .lazy-image-loader::after {
            content: '';
            display: block;
            width: 100%;
            height: 100%;
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--tblr-primary);
            border-radius: 50%;
            animation: lazySpin 1s linear infinite;
        }
        
        @keyframes lazySpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Images dans les cards */
        .card .lazy-image {
            border-radius: inherit;
        }
        
        .card-img-top.lazy-image {
            border-radius: var(--tblr-card-border-radius) var(--tblr-card-border-radius) 0 0;
        }
        
        /* Avatars lazy */
        .avatar.lazy-image {
            background: var(--tblr-gray-200);
        }
        
        .avatar.lazy-image.lazy-loaded {
            background: transparent;
        }
        
        /* Gallery lazy loading */
        .gallery-item.lazy-image {
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .gallery-item.lazy-image:hover {
            transform: scale(1.05);
        }
        
        /* Background images lazy */
        .lazy-bg {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
        
        .lazy-bg.lazy-loading {
            background-image: none !important;
            background-color: #f8f9fa;
        }
        
        /* Progressive loading */
        .lazy-image-progressive {
            filter: blur(20px);
            transition: filter 0.5s;
        }
        
        .lazy-image-progressive.lazy-loaded {
            filter: blur(0);
        }
        
        /* Mode sombre */
        .theme-dark .lazy-image {
            background: #1e293b;
        }
        
        .theme-dark .lazy-image::before {
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.05) 20%,
                rgba(255, 255, 255, 0.1) 60%,
                rgba(255, 255, 255, 0)
            );
        }
        
        /* Performance mobile */
        @media (max-width: 768px) {
            .lazy-image.lazy-loaded {
                animation: none;
            }
            
            .lazy-image::before {
                animation: none;
            }
        }
        
        /* Réduction de la bande passante */
        @media (prefers-reduced-data: reduce) {
            .lazy-image {
                background: #e9ecef;
            }
            
            .lazy-image::after {
                content: 'Image';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #6c757d;
                font-size: 0.875rem;
            }
        }
        </style>
        `;

        if (!document.querySelector('#lazy-loading-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'lazy-loading-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Configuration de l'Intersection Observer
     */
    setupIntersectionObserver() {
        // Vérifier le support
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver non supporté, chargement immédiat des images');
            this.loadAllImages();
            return;
        }

        // Créer l'observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, this.config);
    },

    /**
     * Traiter les images existantes
     */
    processExistingImages() {
        // Images avec data-src
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        lazyImages.forEach(img => {
            this.prepareImage(img);
        });

        // Backgrounds avec data-bg
        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        lazyBackgrounds.forEach(element => {
            this.prepareBackground(element);
        });

        // Images dans les srcset
        const lazySrcsets = document.querySelectorAll('img[data-srcset]');
        lazySrcsets.forEach(img => {
            this.prepareSrcset(img);
        });
    },

    /**
     * Préparer une image pour le lazy loading
     */
    prepareImage(img) {
        // Ajouter la classe
        img.classList.add('lazy-image');

        // Placeholder temporaire
        if (!img.src) {
            img.src = this.config.placeholder;
        }

        // Ajouter le loader si nécessaire
        if (img.dataset.showLoader === 'true') {
            this.addLoader(img);
        }

        // Observer l'image
        this.observer.observe(img);
    },

    /**
     * Préparer un background
     */
    prepareBackground(element) {
        element.classList.add('lazy-bg', 'lazy-loading');
        this.observer.observe(element);
    },

    /**
     * Préparer srcset
     */
    prepareSrcset(img) {
        this.prepareImage(img);
    },

    /**
     * Charger une image
     */
    loadImage(img) {
        if (img.dataset.loaded === 'true') return;

        // Marquer comme en chargement
        img.classList.add('lazy-loading');

        // Créer une nouvelle image pour précharger
        const tempImg = new Image();

        // Gérer le succès
        tempImg.onload = () => {
            // Image normale
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }

            // Srcset
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }

            // Sizes
            if (img.dataset.sizes) {
                img.sizes = img.dataset.sizes;
            }

            // Background
            if (img.dataset.bg) {
                img.style.backgroundImage = `url(${img.dataset.bg})`;
            }

            // Marquer comme chargée
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            img.dataset.loaded = 'true';

            // Retirer le loader
            this.removeLoader(img);

            // Ne plus observer
            this.observer.unobserve(img);

            // Callback
            if (img.dataset.callback) {
                window[img.dataset.callback]?.(img);
            }
        };

        // Gérer l'erreur
        tempImg.onerror = () => {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
            
            // Image d'erreur
            if (img.dataset.errorSrc) {
                img.src = img.dataset.errorSrc;
            } else {
                img.src = this.config.errorImage;
            }

            // Retirer le loader
            this.removeLoader(img);

            // Ne plus observer
            this.observer.unobserve(img);
        };

        // Démarrer le chargement
        const src = img.dataset.src || img.dataset.bg;
        if (src) {
            tempImg.src = src;
        }
    },

    /**
     * Ajouter un loader
     */
    addLoader(img) {
        const wrapper = img.closest('.lazy-image-wrapper');
        if (wrapper) {
            const loader = document.createElement('div');
            loader.className = 'lazy-image-loader';
            wrapper.appendChild(loader);
        }
    },

    /**
     * Retirer le loader
     */
    removeLoader(img) {
        const wrapper = img.closest('.lazy-image-wrapper');
        if (wrapper) {
            const loader = wrapper.querySelector('.lazy-image-loader');
            if (loader) {
                loader.remove();
            }
        }
    },

    /**
     * Observer les nouvelles images
     */
    setupDynamicObserver() {
        const mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Vérifier si c'est une image
                        if (node.tagName === 'IMG' && (node.dataset.src || node.dataset.lazy)) {
                            this.prepareImage(node);
                        }

                        // Vérifier les backgrounds
                        if (node.dataset?.bg) {
                            this.prepareBackground(node);
                        }

                        // Vérifier les enfants
                        if (node.querySelectorAll) {
                            const images = node.querySelectorAll('img[data-src], img[data-lazy]');
                            images.forEach(img => this.prepareImage(img));

                            const backgrounds = node.querySelectorAll('[data-bg]');
                            backgrounds.forEach(bg => this.prepareBackground(bg));
                        }
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * Configuration du lazy loading natif
     */
    setupNativeLazyLoading() {
        // Vérifier le support
        if ('loading' in HTMLImageElement.prototype) {
            // Appliquer aux images qui n'ont pas data-src
            const images = document.querySelectorAll('img:not([data-src]):not([loading])');
            images.forEach(img => {
                // Ne pas appliquer aux petites images (avatars, icônes)
                if (img.width > 50 || img.height > 50 || (!img.width && !img.height)) {
                    img.loading = 'lazy';
                }
            });
        }
    },

    /**
     * Charger toutes les images (fallback)
     */
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src], [data-bg]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            if (img.dataset.bg) {
                img.style.backgroundImage = `url(${img.dataset.bg})`;
            }
        });
    },

    /**
     * API publique
     */
    api: {
        /**
         * Forcer le chargement d'une image
         */
        load: (element) => {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (element) {
                LazyLoadingImages.loadImage(element);
            }
        },

        /**
         * Forcer le chargement de toutes les images visibles
         */
        loadVisible: () => {
            const images = document.querySelectorAll('.lazy-image:not(.lazy-loaded)');
            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    LazyLoadingImages.loadImage(img);
                }
            });
        },

        /**
         * Rafraîchir l'observer
         */
        refresh: () => {
            LazyLoadingImages.processExistingImages();
        },

        /**
         * Précharger des images
         */
        preload: (urls) => {
            if (!Array.isArray(urls)) {
                urls = [urls];
            }
            
            urls.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        }
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    LazyLoadingImages.init();
});

// Exporter l'API
window.LazyLoading = LazyLoadingImages.api;

// Auto-init sur les images avec attribut loading="lazy" pour le support progressif
if (!('loading' in HTMLImageElement.prototype)) {
    document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.dataset.lazy = 'true';
            if (img.src && !img.dataset.src) {
                img.dataset.src = img.src;
                img.src = LazyLoadingImages.config.placeholder;
            }
        });
    });
}