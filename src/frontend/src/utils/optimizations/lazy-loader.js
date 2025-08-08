/**
 * Système de chargement paresseux pour optimiser les performances
 * Inspiré des optimisations du dashboard legacy
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '50px',
      retryAttempts: 3,
      retryDelay: 1000,
      enablePrefetch: true,
      ...options
    };
    
    this.observer = null;
    this.loadingQueue = new Map();
    this.prefetchQueue = new Set();
    this.loadedElements = new WeakSet();
    this.retryCount = new Map();
    
    this.initIntersectionObserver();
    this.setupPrefetching();
  }

  initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback pour les anciens navigateurs
      console.warn('IntersectionObserver non supporté, chargement immédiat');
      return this.loadAllFallback();
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  // Chargement paresseux d'images
  lazyLoadImage(img) {
    return new Promise((resolve, reject) => {
      const element = typeof img === 'string' ? document.querySelector(img) : img;
      
      if (!element || this.loadedElements.has(element)) {
        resolve(element);
        return;
      }

      const src = element.dataset.src || element.dataset.lazySrc;
      if (!src) {
        reject(new Error('Aucune source d\'image trouvée'));
        return;
      }

      // Image de placeholder pendant chargement
      if (element.dataset.placeholder) {
        element.src = element.dataset.placeholder;
      }

      const tempImg = new Image();
      
      tempImg.onload = () => {
        element.src = src;
        element.classList.remove('lazy-loading');
        element.classList.add('lazy-loaded');
        
        // Srcset pour images responsive
        if (element.dataset.srcset) {
          element.srcset = element.dataset.srcset;
        }
        
        this.loadedElements.add(element);
        this.triggerEvent(element, 'lazyloaded');
        resolve(element);
      };

      tempImg.onerror = () => {
        this.handleLoadError(element, src, reject);
      };

      element.classList.add('lazy-loading');
      tempImg.src = src;
    });
  }

  // Chargement paresseux de composants
  lazyLoadComponent(element) {
    return new Promise((resolve, reject) => {
      const componentName = element.dataset.component;
      const componentProps = element.dataset.props ? JSON.parse(element.dataset.props) : {};
      
      if (!componentName) {
        reject(new Error('Nom du composant manquant'));
        return;
      }

      // Afficher un skeleton pendant le chargement
      if (element.dataset.skeleton) {
        element.innerHTML = this.createSkeleton(element.dataset.skeleton);
      }

      // Import dynamique du composant
      import(`../components/${componentName}.vue`)
        .then(module => {
          const Component = module.default;
          
          // Si on utilise Vue 3
          if (window.Vue && window.Vue.createApp) {
            const app = window.Vue.createApp(Component, componentProps);
            app.mount(element);
          }
          
          this.loadedElements.add(element);
          this.triggerEvent(element, 'componentloaded');
          resolve(element);
        })
        .catch(error => {
          this.handleLoadError(element, componentName, reject);
        });
    });
  }

  // Chargement paresseux de données
  lazyLoadData(element) {
    return new Promise((resolve, reject) => {
      const endpoint = element.dataset.endpoint;
      const cacheKey = element.dataset.cacheKey || endpoint;
      
      if (!endpoint) {
        reject(new Error('Endpoint manquant'));
        return;
      }

      // Vérifier le cache d'abord
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        this.renderData(element, cachedData);
        resolve(element);
        return;
      }

      // Loader pendant le chargement
      element.classList.add('loading-data');
      
      fetch(endpoint)
        .then(response => response.json())
        .then(data => {
          this.cacheData(cacheKey, data);
          this.renderData(element, data);
          
          element.classList.remove('loading-data');
          this.loadedElements.add(element);
          this.triggerEvent(element, 'dataloaded');
          resolve(element);
        })
        .catch(error => {
          element.classList.remove('loading-data');
          this.handleLoadError(element, endpoint, reject);
        });
    });
  }

  // Gestionnaire principal de chargement
  async loadElement(element) {
    if (this.loadedElements.has(element)) return;

    const type = element.dataset.lazyType || 'image';
    
    try {
      switch (type) {
        case 'image':
          await this.lazyLoadImage(element);
          break;
        case 'component':
          await this.lazyLoadComponent(element);
          break;
        case 'data':
          await this.lazyLoadData(element);
          break;
        default:
          console.warn(`Type de lazy loading non supporté: ${type}`);
      }
    } catch (error) {
      console.error(`Erreur lors du lazy loading:`, error);
    }
  }

  // Gestion des erreurs avec retry
  handleLoadError(element, source, reject) {
    const key = element.dataset.id || source;
    const currentRetries = this.retryCount.get(key) || 0;
    
    if (currentRetries < this.options.retryAttempts) {
      this.retryCount.set(key, currentRetries + 1);
      
      setTimeout(() => {
        this.loadElement(element);
      }, this.options.retryDelay * (currentRetries + 1));
    } else {
      element.classList.add('lazy-error');
      this.triggerEvent(element, 'lazyerror');
      reject(new Error(`Échec du chargement après ${this.options.retryAttempts} tentatives`));
    }
  }

  // Prefetching intelligent
  setupPrefetching() {
    if (!this.options.enablePrefetch) return;

    // Prefetch au survol
    document.addEventListener('mouseover', this.handleMouseOver.bind(this));
    
    // Prefetch des liens visibles
    this.prefetchVisibleLinks();
  }

  handleMouseOver(event) {
    const element = event.target.closest('[data-prefetch]');
    if (!element) return;

    const url = element.dataset.prefetch || element.href;
    if (url && !this.prefetchQueue.has(url)) {
      this.prefetchResource(url);
    }
  }

  prefetchResource(url) {
    if (this.prefetchQueue.has(url)) return;
    this.prefetchQueue.add(url);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    link.onload = () => {
      console.log(`Prefetch réussi: ${url}`);
    };
    
    link.onerror = () => {
      console.warn(`Prefetch échoué: ${url}`);
      this.prefetchQueue.delete(url);
    };

    document.head.appendChild(link);
  }

  prefetchVisibleLinks() {
    const links = document.querySelectorAll('a[href]:not([data-no-prefetch])');
    
    links.forEach(link => {
      if (this.isElementInViewport(link, 200)) {
        this.prefetchResource(link.href);
      }
    });
  }

  // Utilitaires
  createSkeleton(type) {
    const skeletons = {
      card: `
        <div class="skeleton-card">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      `,
      list: `
        <div class="skeleton-list">
          ${Array(3).fill('<div class="skeleton-item"></div>').join('')}
        </div>
      `,
      table: `
        <div class="skeleton-table">
          <div class="skeleton-header"></div>
          ${Array(5).fill('<div class="skeleton-row"></div>').join('')}
        </div>
      `
    };

    return skeletons[type] || '<div class="skeleton-placeholder"></div>';
  }

  isElementInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight + threshold &&
      rect.bottom >= -threshold &&
      rect.left <= window.innerWidth + threshold &&
      rect.right >= -threshold
    );
  }

  getCachedData(key) {
    const cached = localStorage.getItem(`lazy_cache_${key}`);
    if (!cached) return null;

    const { data, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      localStorage.removeItem(`lazy_cache_${key}`);
      return null;
    }

    return data;
  }

  cacheData(key, data, ttl = 300000) { // 5 minutes par défaut
    const cacheData = {
      data,
      expiry: Date.now() + ttl
    };
    
    localStorage.setItem(`lazy_cache_${key}`, JSON.stringify(cacheData));
  }

  renderData(element, data) {
    const template = element.dataset.template;
    
    if (template) {
      element.innerHTML = this.processTemplate(template, data);
    } else {
      element.innerHTML = JSON.stringify(data, null, 2);
    }
  }

  processTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || '';
    });
  }

  triggerEvent(element, eventName) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      detail: { element }
    });
    element.dispatchEvent(event);
  }

  // API publique
  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback - charger immédiatement
      this.loadElement(element);
    }
  }

  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  observeAll(selector = '[data-lazy]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => this.observe(element));
    return elements.length;
  }

  loadAllFallback() {
    const elements = document.querySelectorAll('[data-lazy]');
    elements.forEach(element => this.loadElement(element));
  }

  // Nettoyage
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.loadingQueue.clear();
    this.prefetchQueue.clear();
    this.retryCount.clear();
  }

  // Statistiques
  getStats() {
    return {
      observedElements: this.observer ? 'Observer actif' : 'Fallback mode',
      loadingQueue: this.loadingQueue.size,
      prefetchQueue: this.prefetchQueue.size,
      retryCount: this.retryCount.size
    };
  }
}

// Auto-initialisation
let defaultLazyLoader = null;

function initLazyLoader(options = {}) {
  defaultLazyLoader = new LazyLoader(options);
  
  // Observer automatiquement au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      defaultLazyLoader.observeAll();
    });
  } else {
    defaultLazyLoader.observeAll();
  }
  
  return defaultLazyLoader;
}

// Fonction utilitaire globale
function lazyLoad(element) {
  if (!defaultLazyLoader) {
    defaultLazyLoader = initLazyLoader();
  }
  
  return defaultLazyLoader.loadElement(element);
}

// CSS par défaut (injecté dynamiquement)
const defaultStyles = `
  .lazy-loading {
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }
  
  .lazy-loaded {
    opacity: 1;
  }
  
  .lazy-error {
    opacity: 0.3;
    filter: grayscale(100%);
  }
  
  .loading-data::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #ddd;
    border-top: 2px solid #007cba;
    border-radius: 50%;
    animation: lazy-spin 1s linear infinite;
  }
  
  @keyframes lazy-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .skeleton-card, .skeleton-list, .skeleton-table {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  
  .skeleton-line {
    height: 12px;
    background: #ddd;
    border-radius: 6px;
    margin: 8px 0;
  }
  
  .skeleton-line.short {
    width: 60%;
  }
  
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Injection des styles
function injectStyles() {
  if (!document.querySelector('#lazy-loader-styles')) {
    const style = document.createElement('style');
    style.id = 'lazy-loader-styles';
    style.textContent = defaultStyles;
    document.head.appendChild(style);
  }
}

// Export
export { LazyLoader, initLazyLoader, lazyLoad };

// Auto-init si pas de module bundler
if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
  window.initLazyLoader = initLazyLoader;
  window.lazyLoad = lazyLoad;
  
  injectStyles();
  
  // Init automatique si attribut présent
  if (document.querySelector('[data-lazy-auto-init]')) {
    initLazyLoader();
  }
}