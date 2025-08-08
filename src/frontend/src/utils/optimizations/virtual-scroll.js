/**
 * Système de défilement virtuel pour les grandes listes
 * Optimise les performances en ne rendant que les éléments visibles
 */

class VirtualScroll {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      throw new Error('Container introuvable pour VirtualScroll');
    }

    this.options = {
      itemHeight: 50,
      bufferSize: 10,
      tolerance: 0,
      maxHeight: null,
      horizontal: false,
      renderDelay: 16,
      reuseNodes: true,
      estimatedItemHeight: true,
      ...options
    };

    // État
    this.data = [];
    this.itemHeights = new Map();
    this.renderedItems = new Map();
    this.itemNodes = [];
    this.scrollTop = 0;
    this.containerHeight = 0;
    this.totalHeight = 0;
    this.startIndex = 0;
    this.endIndex = 0;
    
    // Performance
    this.renderFrame = null;
    this.isScrolling = false;
    this.scrollEndTimer = null;
    
    // Callbacks
    this.renderItem = options.renderItem || this.defaultRenderItem.bind(this);
    this.onScroll = options.onScroll || (() => {});
    this.onDataChanged = options.onDataChanged || (() => {});
    
    this.init();
  }

  init() {
    this.setupContainer();
    this.createScrollContent();
    this.setupEventListeners();
    this.updateDimensions();
  }

  setupContainer() {
    // Style du container
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    if (this.options.maxHeight) {
      this.container.style.maxHeight = typeof this.options.maxHeight === 'number' 
        ? `${this.options.maxHeight}px` 
        : this.options.maxHeight;
    }

    // Classes CSS
    this.container.classList.add('virtual-scroll-container');
    if (this.options.horizontal) {
      this.container.classList.add('virtual-scroll-horizontal');
    }
  }

  createScrollContent() {
    // Wrapper pour le contenu total
    this.scrollWrapper = document.createElement('div');
    this.scrollWrapper.className = 'virtual-scroll-wrapper';
    this.scrollWrapper.style.position = 'relative';
    
    // Container visible pour les éléments rendus
    this.viewportContent = document.createElement('div');
    this.viewportContent.className = 'virtual-scroll-viewport';
    this.viewportContent.style.position = 'relative';
    
    this.scrollWrapper.appendChild(this.viewportContent);
    this.container.appendChild(this.scrollWrapper);
  }

  setupEventListeners() {
    // Optimisation du scroll avec RAF
    this.container.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // Resize observer pour redimensionnement
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
      this.resizeObserver.observe(this.container);
    }
    
    // Scroll end detection
    this.container.addEventListener('scrollend', this.handleScrollEnd.bind(this), { passive: true });
  }

  handleScroll() {
    if (this.renderFrame) return;
    
    this.isScrolling = true;
    this.renderFrame = requestAnimationFrame(() => {
      this.updateScroll();
      this.renderFrame = null;
    });

    // Fallback pour scrollend si non supporté
    clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => {
      this.handleScrollEnd();
    }, 150);
  }

  handleScrollEnd() {
    this.isScrolling = false;
    clearTimeout(this.scrollEndTimer);
    this.onScroll({
      scrollTop: this.scrollTop,
      isScrolling: false
    });
  }

  handleResize() {
    this.updateDimensions();
    this.render();
  }

  updateScroll() {
    const newScrollTop = this.container.scrollTop;
    
    if (Math.abs(this.scrollTop - newScrollTop) < this.options.tolerance) {
      return;
    }
    
    this.scrollTop = newScrollTop;
    
    const newStartIndex = this.getStartIndex();
    const newEndIndex = this.getEndIndex(newStartIndex);
    
    if (newStartIndex !== this.startIndex || newEndIndex !== this.endIndex) {
      this.startIndex = newStartIndex;
      this.endIndex = newEndIndex;
      this.render();
    }

    this.onScroll({
      scrollTop: this.scrollTop,
      isScrolling: this.isScrolling,
      visibleStartIndex: this.startIndex,
      visibleEndIndex: this.endIndex
    });
  }

  updateDimensions() {
    const rect = this.container.getBoundingClientRect();
    this.containerHeight = this.options.horizontal ? rect.width : rect.height;
    this.updateTotalHeight();
  }

  updateTotalHeight() {
    if (this.options.estimatedItemHeight) {
      // Calcul dynamique basé sur les hauteurs mesurées
      let totalHeight = 0;
      for (let i = 0; i < this.data.length; i++) {
        totalHeight += this.getItemHeight(i);
      }
      this.totalHeight = totalHeight;
    } else {
      // Calcul simple
      this.totalHeight = this.data.length * this.options.itemHeight;
    }

    // Mise à jour de la hauteur du wrapper
    if (this.options.horizontal) {
      this.scrollWrapper.style.width = `${this.totalHeight}px`;
      this.scrollWrapper.style.height = 'auto';
    } else {
      this.scrollWrapper.style.height = `${this.totalHeight}px`;
      this.scrollWrapper.style.width = 'auto';
    }
  }

  getItemHeight(index) {
    if (this.itemHeights.has(index)) {
      return this.itemHeights.get(index);
    }
    return this.options.itemHeight;
  }

  setItemHeight(index, height) {
    const oldHeight = this.getItemHeight(index);
    if (oldHeight !== height) {
      this.itemHeights.set(index, height);
      this.updateTotalHeight();
    }
  }

  getStartIndex() {
    if (!this.options.estimatedItemHeight) {
      return Math.max(0, Math.floor(this.scrollTop / this.options.itemHeight) - this.options.bufferSize);
    }

    // Calcul avec hauteurs variables
    let index = 0;
    let offset = 0;
    
    while (index < this.data.length && offset < this.scrollTop) {
      offset += this.getItemHeight(index);
      index++;
    }
    
    return Math.max(0, index - this.options.bufferSize - 1);
  }

  getEndIndex(startIndex) {
    if (!this.options.estimatedItemHeight) {
      const visibleCount = Math.ceil(this.containerHeight / this.options.itemHeight);
      return Math.min(this.data.length, startIndex + visibleCount + this.options.bufferSize * 2);
    }

    // Calcul avec hauteurs variables
    let index = startIndex;
    let offset = this.getOffsetForIndex(startIndex);
    
    while (index < this.data.length && offset < this.scrollTop + this.containerHeight) {
      offset += this.getItemHeight(index);
      index++;
    }
    
    return Math.min(this.data.length, index + this.options.bufferSize);
  }

  getOffsetForIndex(index) {
    if (!this.options.estimatedItemHeight) {
      return index * this.options.itemHeight;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getItemHeight(i);
    }
    return offset;
  }

  render() {
    if (this.renderFrame) {
      cancelAnimationFrame(this.renderFrame);
    }

    this.renderFrame = requestAnimationFrame(() => {
      this.doRender();
      this.renderFrame = null;
    });
  }

  doRender() {
    const fragment = document.createDocumentFragment();
    const nodesToReuse = this.options.reuseNodes ? [...this.itemNodes] : [];
    this.itemNodes = [];

    // Nettoyer le viewport
    this.viewportContent.innerHTML = '';

    for (let i = this.startIndex; i < this.endIndex; i++) {
      if (i >= this.data.length) break;

      const item = this.data[i];
      let node = nodesToReuse.pop();
      
      if (!node) {
        node = document.createElement('div');
        node.className = 'virtual-scroll-item';
      }

      // Position absolue
      const offset = this.getOffsetForIndex(i);
      if (this.options.horizontal) {
        node.style.position = 'absolute';
        node.style.left = `${offset}px`;
        node.style.top = '0';
      } else {
        node.style.position = 'absolute';
        node.style.top = `${offset}px`;
        node.style.left = '0';
        node.style.width = '100%';
      }

      // Rendu du contenu
      node.innerHTML = '';
      const renderedContent = this.renderItem(item, i);
      
      if (typeof renderedContent === 'string') {
        node.innerHTML = renderedContent;
      } else if (renderedContent instanceof Node) {
        node.appendChild(renderedContent);
      }

      // Mesurer la hauteur après rendu
      fragment.appendChild(node);
      this.itemNodes.push(node);
    }

    this.viewportContent.appendChild(fragment);

    // Mesurer les hauteurs des nouveaux éléments
    if (this.options.estimatedItemHeight) {
      this.measureItemHeights();
    }
  }

  measureItemHeights() {
    this.itemNodes.forEach((node, index) => {
      const actualIndex = this.startIndex + index;
      const rect = node.getBoundingClientRect();
      const height = this.options.horizontal ? rect.width : rect.height;
      
      if (height > 0) {
        this.setItemHeight(actualIndex, height);
      }
    });
  }

  defaultRenderItem(item, index) {
    if (typeof item === 'object') {
      return `<div class="item-content">${JSON.stringify(item)}</div>`;
    }
    return `<div class="item-content">${item}</div>`;
  }

  // API publique
  setData(newData) {
    this.data = newData || [];
    this.itemHeights.clear();
    this.renderedItems.clear();
    this.scrollTop = 0;
    this.startIndex = 0;
    this.endIndex = 0;
    
    this.updateDimensions();
    this.render();
    this.onDataChanged(this.data);
  }

  updateData(newData) {
    const oldLength = this.data.length;
    this.setData(newData);
    
    // Maintenir position si possible
    if (this.scrollTop > 0 && newData.length > 0) {
      const ratio = oldLength > 0 ? newData.length / oldLength : 1;
      const newScrollTop = this.scrollTop * ratio;
      this.scrollTo(newScrollTop);
    }
  }

  appendData(newItems) {
    this.data = [...this.data, ...newItems];
    this.updateDimensions();
    this.render();
    this.onDataChanged(this.data);
  }

  prependData(newItems) {
    const oldScrollTop = this.scrollTop;
    const oldTotalHeight = this.totalHeight;
    
    this.data = [...newItems, ...this.data];
    this.updateDimensions();
    
    // Ajuster le scroll pour maintenir la position relative
    const heightDiff = this.totalHeight - oldTotalHeight;
    this.scrollTo(oldScrollTop + heightDiff);
    
    this.onDataChanged(this.data);
  }

  scrollTo(position, smooth = false) {
    if (smooth) {
      this.container.scrollTo({
        top: this.options.horizontal ? 0 : position,
        left: this.options.horizontal ? position : 0,
        behavior: 'smooth'
      });
    } else {
      if (this.options.horizontal) {
        this.container.scrollLeft = position;
      } else {
        this.container.scrollTop = position;
      }
    }
  }

  scrollToIndex(index, position = 'start', smooth = false) {
    const offset = this.getOffsetForIndex(index);
    let scrollPosition = offset;

    if (position === 'center') {
      scrollPosition = offset - this.containerHeight / 2;
    } else if (position === 'end') {
      scrollPosition = offset - this.containerHeight + this.getItemHeight(index);
    }

    this.scrollTo(Math.max(0, scrollPosition), smooth);
  }

  refresh() {
    this.updateDimensions();
    this.render();
  }

  // Nettoyage
  destroy() {
    if (this.renderFrame) {
      cancelAnimationFrame(this.renderFrame);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    clearTimeout(this.scrollEndTimer);
    
    this.container.removeEventListener('scroll', this.handleScroll);
    this.container.innerHTML = '';
    
    // Nettoyer les références
    this.data = [];
    this.itemHeights.clear();
    this.renderedItems.clear();
    this.itemNodes = [];
  }

  // Statistiques
  getStats() {
    return {
      totalItems: this.data.length,
      renderedItems: this.itemNodes.length,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      scrollTop: this.scrollTop,
      totalHeight: this.totalHeight,
      containerHeight: this.containerHeight,
      averageItemHeight: this.itemHeights.size > 0 
        ? Array.from(this.itemHeights.values()).reduce((a, b) => a + b, 0) / this.itemHeights.size
        : this.options.itemHeight
    };
  }
}

// CSS par défaut
const defaultStyles = `
  .virtual-scroll-container {
    contain: strict;
  }
  
  .virtual-scroll-wrapper {
    min-height: 100%;
  }
  
  .virtual-scroll-viewport {
    transform: translateZ(0); /* Force GPU acceleration */
  }
  
  .virtual-scroll-item {
    contain: layout size style;
    will-change: transform;
  }
  
  .virtual-scroll-horizontal .virtual-scroll-wrapper {
    display: flex;
    flex-direction: row;
  }
  
  .virtual-scroll-horizontal .virtual-scroll-viewport {
    height: 100%;
  }
`;

// Injection des styles
function injectVirtualScrollStyles() {
  if (!document.querySelector('#virtual-scroll-styles')) {
    const style = document.createElement('style');
    style.id = 'virtual-scroll-styles';
    style.textContent = defaultStyles;
    document.head.appendChild(style);
  }
}

// Auto-injection des styles
if (typeof window !== 'undefined') {
  injectVirtualScrollStyles();
}

export default VirtualScroll;