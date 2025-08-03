// virtual-scroll.js
const VirtualScroll = {
    // Configuration
    ITEM_HEIGHT: 60, // Hauteur d'un item en pixels
    BUFFER_SIZE: 5, // Items supplémentaires à rendre
    
    // Créer un conteneur virtual scroll
    create(containerId, data, renderItem, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const itemHeight = options.itemHeight || this.ITEM_HEIGHT;
        const bufferSize = options.bufferSize || this.BUFFER_SIZE;
        
        // Structure HTML
        container.innerHTML = `
            <div class="virtual-scroll-viewport" style="height: ${options.height || 400}px; overflow-y: auto;">
                <div class="virtual-scroll-spacer"></div>
                <div class="virtual-scroll-content"></div>
            </div>
        `;
        
        const viewport = container.querySelector('.virtual-scroll-viewport');
        const spacer = container.querySelector('.virtual-scroll-spacer');
        const content = container.querySelector('.virtual-scroll-content');
        
        // Calculer la hauteur totale
        const totalHeight = data.length * itemHeight;
        spacer.style.height = `${totalHeight}px`;
        
        // État du scroll
        let scrollTop = 0;
        let startIndex = 0;
        let endIndex = 0;
        
        // Fonction de rendu
        const render = () => {
            const viewportHeight = viewport.clientHeight;
            
            // Calculer les indices visibles
            startIndex = Math.floor(scrollTop / itemHeight) - bufferSize;
            endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize;
            
            // Limiter les indices
            startIndex = Math.max(0, startIndex);
            endIndex = Math.min(data.length, endIndex);
            
            // Rendre les items visibles
            const visibleItems = data.slice(startIndex, endIndex);
            
            content.innerHTML = visibleItems.map((item, index) => {
                const actualIndex = startIndex + index;
                const top = actualIndex * itemHeight;
                
                return `
                    <div class="virtual-scroll-item" 
                         style="position: absolute; top: ${top}px; height: ${itemHeight}px; width: 100%;">
                        ${renderItem(item, actualIndex)}
                    </div>
                `;
            }).join('');
        };
        
        // Gérer le scroll
        let scrollTimeout;
        viewport.addEventListener('scroll', () => {
            scrollTop = viewport.scrollTop;
            
            // Debounce pour performance
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(render, 10);
        });
        
        // Rendu initial
        render();
        
        // API publique
        return {
            update: (newData) => {
                data = newData;
                spacer.style.height = `${data.length * itemHeight}px`;
                render();
            },
            scrollTo: (index) => {
                viewport.scrollTop = index * itemHeight;
            },
            refresh: render
        };
    }
};

// Export global
window.VirtualScroll = VirtualScroll;