// pagination-system.js
const PaginationSystem = {
    // Configuration par défaut
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    
    // État de pagination par module
    paginationStates: new Map(),
    
    // Créer un état de pagination
    createPaginationState(moduleId, options = {}) {
        const state = {
            currentPage: 1,
            pageSize: options.pageSize || this.DEFAULT_PAGE_SIZE,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            isLoading: false,
            sortBy: options.sortBy || 'created_at',
            sortOrder: options.sortOrder || 'desc',
            filters: options.filters || {}
        };
        
        this.paginationStates.set(moduleId, state);
        return state;
    },
    
    // Obtenir l'état de pagination
    getState(moduleId) {
        return this.paginationStates.get(moduleId) || this.createPaginationState(moduleId);
    },
    
    // Mettre à jour l'état
    updateState(moduleId, updates) {
        const state = this.getState(moduleId);
        Object.assign(state, updates);
        this.paginationStates.set(moduleId, state);
        return state;
    },
    
    // Calculer les métadonnées de pagination
    calculateMetadata(totalItems, currentPage, pageSize) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        
        return {
            totalItems,
            totalPages,
            currentPage,
            pageSize,
            startIndex,
            endIndex,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            displayRange: `${startIndex + 1}-${endIndex} sur ${totalItems}`
        };
    },
    
    // Paginer un tableau de données
    paginateArray(data, page, pageSize) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    },
    
    // Créer les contrôles de pagination
    createControls(moduleId, containerId, onPageChange) {
        const state = this.getState(moduleId);
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        const metadata = this.calculateMetadata(
            state.totalItems,
            state.currentPage,
            state.pageSize
        );
        
        container.innerHTML = `
            <div class="pagination-controls d-flex align-items-center justify-content-between">
                <div class="pagination-info text-muted">
                    ${metadata.displayRange}
                </div>
                
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${!metadata.hasPrevPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="1" title="Première page">
                                <i class="ti ti-chevrons-left"></i>
                            </a>
                        </li>
                        <li class="page-item ${!metadata.hasPrevPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${metadata.currentPage - 1}" title="Page précédente">
                                <i class="ti ti-chevron-left"></i>
                            </a>
                        </li>
                        
                        ${this.generatePageNumbers(metadata).map(page => `
                            <li class="page-item ${page === metadata.currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}">
                                <a class="page-link" href="#" data-page="${page}">${page}</a>
                            </li>
                        `).join('')}
                        
                        <li class="page-item ${!metadata.hasNextPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${metadata.currentPage + 1}" title="Page suivante">
                                <i class="ti ti-chevron-right"></i>
                            </a>
                        </li>
                        <li class="page-item ${!metadata.hasNextPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${metadata.totalPages}" title="Dernière page">
                                <i class="ti ti-chevrons-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
                
                <div class="pagination-size">
                    <select class="form-select form-select-sm" id="${moduleId}-page-size">
                        <option value="10" ${state.pageSize === 10 ? 'selected' : ''}>10 / page</option>
                        <option value="20" ${state.pageSize === 20 ? 'selected' : ''}>20 / page</option>
                        <option value="50" ${state.pageSize === 50 ? 'selected' : ''}>50 / page</option>
                        <option value="100" ${state.pageSize === 100 ? 'selected' : ''}>100 / page</option>
                    </select>
                </div>
            </div>
        `;
        
        // Attacher les événements
        container.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                if (!isNaN(page) && page !== metadata.currentPage) {
                    this.goToPage(moduleId, page, onPageChange);
                }
            });
        });
        
        // Changement de taille de page
        const pageSizeSelect = document.getElementById(`${moduleId}-page-size`);
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                const newSize = parseInt(e.target.value);
                this.changePageSize(moduleId, newSize, onPageChange);
            });
        }
    },
    
    // Générer les numéros de page
    generatePageNumbers(metadata) {
        const { currentPage, totalPages } = metadata;
        const pages = [];
        
        if (totalPages <= 7) {
            // Afficher toutes les pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Affichage avec ellipses
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    },
    
    // Aller à une page
    async goToPage(moduleId, page, callback) {
        const state = this.getState(moduleId);
        
        if (page < 1 || page > Math.ceil(state.totalItems / state.pageSize)) {
            return;
        }
        
        this.updateState(moduleId, { 
            currentPage: page,
            isLoading: true 
        });
        
        if (callback) {
            await callback(page, state.pageSize);
        }
        
        this.updateState(moduleId, { isLoading: false });
    },
    
    // Changer la taille de page
    async changePageSize(moduleId, newSize, callback) {
        const state = this.getState(moduleId);
        
        // Calculer la nouvelle page pour garder la position
        const firstItemIndex = (state.currentPage - 1) * state.pageSize;
        const newPage = Math.floor(firstItemIndex / newSize) + 1;
        
        this.updateState(moduleId, {
            pageSize: newSize,
            currentPage: newPage,
            isLoading: true
        });
        
        if (callback) {
            await callback(newPage, newSize);
        }
        
        this.updateState(moduleId, { isLoading: false });
    }
};

// Export global
window.PaginationSystem = PaginationSystem;