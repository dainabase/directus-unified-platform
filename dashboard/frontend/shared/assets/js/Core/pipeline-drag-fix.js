/**
 * Pipeline Drag Fix
 * Corrige le drag & drop du pipeline sur Firefox mobile
 */

const PipelineDragFix = {
    /**
     * Initialiser le fix
     */
    init() {
        console.log('🔧 Initialisation du fix pipeline drag Firefox');
        
        this.detectFirefoxMobile();
        this.fixExistingPipelines();
        this.observeNewPipelines();
        this.addFirefoxStyles();
    },

    /**
     * Détecter Firefox mobile
     */
    detectFirefoxMobile() {
        const ua = navigator.userAgent.toLowerCase();
        this.isFirefox = ua.includes('firefox');
        this.isMobile = /mobile|android|ios|iphone|ipad|tablet/i.test(ua);
        this.isFirefoxMobile = this.isFirefox && this.isMobile;
        
        if (this.isFirefoxMobile) {
            document.body.classList.add('firefox-mobile');
        }
    },

    /**
     * Ajouter les styles spécifiques Firefox
     */
    addFirefoxStyles() {
        const styles = `
        <style>
        /* Fix Firefox Mobile Pipeline Drag */
        .firefox-mobile .pipeline-card {
            -moz-user-select: none;
            user-select: none;
            touch-action: none;
        }
        
        .firefox-mobile .pipeline-card.dragging {
            opacity: 0.8;
            transform: scale(0.95);
            z-index: 1000;
            position: relative;
        }
        
        .firefox-mobile .pipeline-column {
            min-height: 100px;
            position: relative;
        }
        
        .firefox-mobile .pipeline-column.drag-over {
            background-color: rgba(32, 107, 196, 0.1);
            border: 2px dashed var(--tblr-primary);
        }
        
        /* Touch handle pour Firefox */
        .firefox-mobile .drag-handle {
            width: 40px;
            height: 40px;
            position: absolute;
            right: 0;
            top: 0;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.05);
            border-radius: 0 0.25rem 0 0.25rem;
        }
        
        .firefox-mobile .drag-handle::after {
            content: '⋮⋮';
            font-size: 1.2rem;
            color: var(--tblr-muted);
        }
        
        /* Placeholder lors du drag */
        .firefox-mobile .drag-placeholder {
            background: var(--tblr-gray-100);
            border: 2px dashed var(--tblr-gray-400);
            height: 100px;
            border-radius: 0.25rem;
            margin: 0.5rem 0;
        }
        
        /* Amélioration visuelle */
        .firefox-mobile .pipeline-card {
            transition: transform 0.2s, opacity 0.2s;
        }
        
        .firefox-mobile .pipeline-card:active {
            transform: scale(0.98);
        }
        
        /* Zone de drop élargie */
        .firefox-mobile .pipeline-column::after {
            content: '';
            position: absolute;
            top: -20px;
            left: -20px;
            right: -20px;
            bottom: -20px;
            pointer-events: none;
        }
        </style>
        `;

        if (!document.querySelector('#pipeline-drag-fix-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'pipeline-drag-fix-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Corriger les pipelines existants
     */
    fixExistingPipelines() {
        const pipelines = document.querySelectorAll('.pipeline, [data-pipeline], .kanban-board');
        pipelines.forEach(pipeline => {
            this.enhancePipeline(pipeline);
        });
    },

    /**
     * Améliorer un pipeline
     */
    enhancePipeline(pipeline) {
        const cards = pipeline.querySelectorAll('.pipeline-card, .kanban-card, [draggable="true"]');
        const columns = pipeline.querySelectorAll('.pipeline-column, .kanban-column');
        
        cards.forEach(card => {
            this.enhanceCard(card);
        });
        
        columns.forEach(column => {
            this.enhanceColumn(column);
        });
    },

    /**
     * Améliorer une carte
     */
    enhanceCard(card) {
        // Retirer les anciens handlers
        card.removeAttribute('draggable');
        card.removeAttribute('ondragstart');
        card.removeAttribute('ondragend');
        
        // Ajouter la classe
        card.classList.add('pipeline-card');
        
        // Ajouter le handle pour Firefox mobile
        if (this.isFirefoxMobile && !card.querySelector('.drag-handle')) {
            const handle = document.createElement('div');
            handle.className = 'drag-handle';
            card.appendChild(handle);
        }
        
        // Variables pour le drag
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let draggedElement = null;
        let placeholder = null;
        
        // Touch start
        const touchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentX = startX;
            currentY = startY;
            
            // Commencer le drag après un délai
            const dragTimeout = setTimeout(() => {
                isDragging = true;
                draggedElement = card.cloneNode(true);
                draggedElement.style.position = 'fixed';
                draggedElement.style.width = card.offsetWidth + 'px';
                draggedElement.style.pointerEvents = 'none';
                draggedElement.style.zIndex = '9999';
                draggedElement.classList.add('dragging');
                
                // Créer le placeholder
                placeholder = document.createElement('div');
                placeholder.className = 'drag-placeholder';
                placeholder.style.height = card.offsetHeight + 'px';
                card.parentNode.insertBefore(placeholder, card);
                card.style.display = 'none';
                
                document.body.appendChild(draggedElement);
                updateDraggedPosition(touch);
                
                // Vibration feedback si supporté
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }, 300);
            
            card.dataset.dragTimeout = dragTimeout;
        };
        
        // Touch move
        const touchMove = (e) => {
            if (!isDragging || !draggedElement) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            currentX = touch.clientX;
            currentY = touch.clientY;
            
            updateDraggedPosition(touch);
            
            // Trouver l'élément sous le doigt
            const elementBelow = document.elementFromPoint(currentX, currentY);
            const columnBelow = elementBelow?.closest('.pipeline-column, .kanban-column');
            
            // Highlight la colonne
            document.querySelectorAll('.pipeline-column, .kanban-column').forEach(col => {
                col.classList.remove('drag-over');
            });
            
            if (columnBelow) {
                columnBelow.classList.add('drag-over');
                
                // Déplacer le placeholder
                const cardsInColumn = Array.from(columnBelow.querySelectorAll('.pipeline-card:not(.dragging)'));
                let inserted = false;
                
                for (const otherCard of cardsInColumn) {
                    const rect = otherCard.getBoundingClientRect();
                    if (currentY < rect.top + rect.height / 2) {
                        columnBelow.insertBefore(placeholder, otherCard);
                        inserted = true;
                        break;
                    }
                }
                
                if (!inserted) {
                    columnBelow.appendChild(placeholder);
                }
            }
        };
        
        // Touch end
        const touchEnd = (e) => {
            clearTimeout(card.dataset.dragTimeout);
            
            if (!isDragging || !draggedElement) return;
            
            // Nettoyer
            document.querySelectorAll('.pipeline-column, .kanban-column').forEach(col => {
                col.classList.remove('drag-over');
            });
            
            // Déplacer la carte réelle
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(card, placeholder);
                card.style.display = '';
                placeholder.remove();
            }
            
            // Retirer l'élément cloné
            if (draggedElement) {
                draggedElement.remove();
            }
            
            // Reset
            isDragging = false;
            draggedElement = null;
            placeholder = null;
            
            // Déclencher l'événement
            card.dispatchEvent(new CustomEvent('pipeline-drop', {
                bubbles: true,
                detail: {
                    card: card,
                    column: card.closest('.pipeline-column, .kanban-column')
                }
            }));
        };
        
        // Mettre à jour la position
        const updateDraggedPosition = (touch) => {
            if (draggedElement) {
                draggedElement.style.left = (touch.clientX - startX + card.offsetLeft) + 'px';
                draggedElement.style.top = (touch.clientY - startY + card.offsetTop) + 'px';
            }
        };
        
        // Attacher les événements
        if (this.isFirefoxMobile) {
            const handle = card.querySelector('.drag-handle') || card;
            handle.addEventListener('touchstart', touchStart, { passive: false });
            handle.addEventListener('touchmove', touchMove, { passive: false });
            handle.addEventListener('touchend', touchEnd, { passive: false });
            handle.addEventListener('touchcancel', touchEnd, { passive: false });
        } else {
            // Fallback pour desktop et autres navigateurs
            card.draggable = true;
            
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.innerHTML);
                card.classList.add('dragging');
            });
            
            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
            });
        }
    },

    /**
     * Améliorer une colonne
     */
    enhanceColumn(column) {
        column.classList.add('pipeline-column');
        
        if (!this.isFirefoxMobile) {
            // Handlers standard pour desktop
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                if (e.target === column) {
                    column.classList.remove('drag-over');
                }
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const draggedCard = document.querySelector('.dragging');
                if (draggedCard) {
                    column.appendChild(draggedCard);
                    draggedCard.classList.remove('dragging');
                }
            });
        }
    },

    /**
     * Observer les nouveaux pipelines
     */
    observeNewPipelines() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches && (node.matches('.pipeline, [data-pipeline], .kanban-board'))) {
                            this.enhancePipeline(node);
                        }
                        
                        if (node.querySelectorAll) {
                            const pipelines = node.querySelectorAll('.pipeline, [data-pipeline], .kanban-board');
                            pipelines.forEach(pipeline => this.enhancePipeline(pipeline));
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
    PipelineDragFix.init();
});

// Exporter pour utilisation
window.PipelineDragFix = PipelineDragFix;