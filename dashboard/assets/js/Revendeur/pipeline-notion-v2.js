// pipeline-notion-v2.js - Version avec pagination intégrée
// Démonstration de l'intégration du système de pagination pour optimiser les performances

const PipelineNotionV2 = {
    // Configuration héritée
    ...window.PipelineNotion,
    
    // Configuration pagination
    ITEMS_PER_PAGE: 20,
    currentPage: 1,
    totalLeads: 0,
    paginatedLeads: [],
    
    // Initialisation avec pagination
    init() {
        console.log('🔌 Initialisation du pipeline CRM v2 avec pagination');
        
        // Créer l'état de pagination pour ce module
        window.PaginationSystem.createPaginationState('pipeline', {
            pageSize: this.ITEMS_PER_PAGE,
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        
        this.loadPipelineData();
        this.attachEventListeners();
        this.initializeDragAndDrop();
    },
    
    // Charger les données avec pagination
    async loadPipelineData() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions
            const canViewPipeline = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'pipeline',
                'view.own'
            );
            
            if (!canViewPipeline) {
                window.showNotification('Vous n\'avez pas accès au pipeline', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Obtenir l'état de pagination
            const paginationState = window.PaginationSystem.getState('pipeline');
            
            // Récupérer les données avec pagination
            const pipelineData = await window.PermissionsMiddleware.secureApiCall(
                'pipeline',
                'view',
                this.fetchPaginatedData.bind(this),
                {
                    userId: currentUser.id,
                    page: paginationState.currentPage,
                    pageSize: paginationState.pageSize,
                    sortBy: paginationState.sortBy,
                    sortOrder: paginationState.sortOrder,
                    filters: paginationState.filters
                }
            );
            
            // Mettre à jour l'état de pagination
            window.PaginationSystem.updateState('pipeline', {
                totalItems: pipelineData.totalCount,
                totalPages: Math.ceil(pipelineData.totalCount / paginationState.pageSize),
                hasNextPage: pipelineData.hasNext,
                hasPrevPage: paginationState.currentPage > 1
            });
            
            // Enrichir les leads
            const enrichedLeads = await this.enrichLeadsData(pipelineData.leads);
            
            // Stocker tous les leads et les leads paginés
            this.totalLeads = pipelineData.totalCount;
            this.allLeads = enrichedLeads; // Pour compatibilité avec v1
            this.paginatedLeads = enrichedLeads;
            
            // Mettre à jour l'interface
            this.updateView();
            
            // Créer les contrôles de pagination
            this.renderPaginationControls();
            
            // Mettre à jour les statistiques
            this.updatePipelineStats(pipelineData.stats);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'pipeline', true, {
                leadCount: pipelineData.totalCount,
                page: paginationState.currentPage,
                revendeurId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement du pipeline:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'pipeline', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Simuler la récupération paginée (à remplacer par vraie API)
    async fetchPaginatedData(params) {
        // Simuler un appel API avec pagination
        // En production, ceci appellerait window.NotionAPIClient.getPaginatedPipeline(params)
        
        // Pour la démo, générer des données mock
        const totalLeads = 150; // Simuler beaucoup de leads
        const { page, pageSize } = params;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        // Générer des leads mock
        const allMockLeads = [];
        for (let i = 0; i < totalLeads; i++) {
            allMockLeads.push({
                id: `lead_${i + 1}`,
                company: `Entreprise ${i + 1}`,
                contact: `Contact ${i + 1}`,
                email: `contact${i + 1}@entreprise.com`,
                phone: `+41 22 ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
                stage: this.STAGES[Math.floor(Math.random() * 4)].name,
                value: Math.floor(Math.random() * 150000) + 10000,
                probability: Math.floor(Math.random() * 80) + 20,
                lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastStageChange: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
                nextAction: Math.random() > 0.5 ? 'Appel de suivi' : 'Envoi proposition',
                meetingsCount: Math.floor(Math.random() * 5)
            });
        }
        
        // Appliquer le tri
        if (params.sortBy) {
            allMockLeads.sort((a, b) => {
                const aVal = a[params.sortBy];
                const bVal = b[params.sortBy];
                
                if (params.sortOrder === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }
        
        // Paginer
        const paginatedLeads = allMockLeads.slice(start, end);
        
        // Calculer les stats par étape
        const stats = {};
        this.STAGES.forEach(stage => {
            const stageLeads = allMockLeads.filter(l => l.stage === stage.name);
            stats[stage.name] = {
                count: stageLeads.length,
                value: stageLeads.reduce((sum, l) => sum + l.value, 0)
            };
        });
        
        return {
            leads: paginatedLeads,
            totalCount: totalLeads,
            page: page,
            pageSize: pageSize,
            hasNext: end < totalLeads,
            hasPrev: page > 1,
            stats: stats
        };
    },
    
    // Rendre les contrôles de pagination
    renderPaginationControls() {
        // Créer un conteneur pour la pagination si nécessaire
        let paginationContainer = document.getElementById('pipeline-pagination');
        
        if (!paginationContainer) {
            const pipelineContainer = document.getElementById('pipeline-container');
            if (pipelineContainer) {
                paginationContainer = document.createElement('div');
                paginationContainer.id = 'pipeline-pagination';
                paginationContainer.className = 'mt-3';
                pipelineContainer.parentNode.insertBefore(paginationContainer, pipelineContainer.nextSibling);
            }
        }
        
        // Rendre les contrôles
        if (paginationContainer) {
            window.PaginationSystem.createControls(
                'pipeline',
                'pipeline-pagination',
                this.handlePageChange.bind(this)
            );
        }
    },
    
    // Gérer le changement de page
    async handlePageChange(page, pageSize) {
        // Mettre à jour l'état
        window.PaginationSystem.updateState('pipeline', {
            currentPage: page,
            pageSize: pageSize
        });
        
        // Recharger les données
        await this.loadPipelineData();
    },
    
    // Override de updateView pour supporter la pagination
    updateView() {
        // Utiliser les leads paginés au lieu de tous les leads
        const originalAllLeads = this.allLeads;
        this.allLeads = this.paginatedLeads;
        
        // Appeler la méthode originale
        switch (this.currentView) {
            case 'kanban':
                this.renderKanbanViewPaginated();
                break;
            case 'list':
                this.renderListViewPaginated();
                break;
            case 'grid':
                this.renderGridViewPaginated();
                break;
        }
        
        // Restaurer
        this.allLeads = originalAllLeads;
    },
    
    // Vue Kanban avec indicateur de pagination
    renderKanbanViewPaginated() {
        const container = document.getElementById('pipeline-container');
        if (!container) return;
        
        // Ajouter un avertissement si on n'affiche pas tous les leads
        const paginationState = window.PaginationSystem.getState('pipeline');
        const showingAll = paginationState.totalItems <= paginationState.pageSize;
        
        if (!showingAll) {
            container.innerHTML = `
                <div class="alert alert-info mb-3">
                    <div class="d-flex">
                        <div>
                            <i class="ti ti-info-circle"></i>
                        </div>
                        <div class="ms-2">
                            <h4 class="alert-title">Vue paginée</h4>
                            <div class="text-muted">
                                Affichage de ${paginationState.pageSize} leads sur ${paginationState.totalItems}.
                                Pour une vue complète du Kanban, 
                                <a href="#" onclick="PipelineNotionV2.showAllLeads(); return false;">
                                    afficher tous les leads
                                </a> (peut ralentir l'interface).
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Rendre le Kanban normalement
        container.innerHTML += this.renderKanbanHTML();
        
        // Réinitialiser le drag and drop
        this.setupKanbanDragAndDrop();
    },
    
    // Vue liste avec pagination native
    renderListViewPaginated() {
        const container = document.getElementById('pipeline-container');
        if (!container) return;
        
        container.className = 'table-responsive';
        
        const leads = this.paginatedLeads; // Utiliser directement les leads paginés
        const paginationState = window.PaginationSystem.getState('pipeline');
        
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>Liste des leads</h4>
                <div class="text-muted">
                    Total : ${paginationState.totalItems} leads
                </div>
            </div>
            <table class="table table-vcenter card-table">
                <thead>
                    <tr>
                        <th>
                            <a href="#" onclick="PipelineNotionV2.sortBy('company'); return false;">
                                Entreprise <i class="ti ti-arrows-sort"></i>
                            </a>
                        </th>
                        <th>Contact</th>
                        <th>
                            <a href="#" onclick="PipelineNotionV2.sortBy('stage'); return false;">
                                Étape <i class="ti ti-arrows-sort"></i>
                            </a>
                        </th>
                        <th>
                            <a href="#" onclick="PipelineNotionV2.sortBy('value'); return false;">
                                Valeur <i class="ti ti-arrows-sort"></i>
                            </a>
                        </th>
                        <th>
                            <a href="#" onclick="PipelineNotionV2.sortBy('probability'); return false;">
                                Probabilité <i class="ti ti-arrows-sort"></i>
                            </a>
                        </th>
                        <th>Score</th>
                        <th>
                            <a href="#" onclick="PipelineNotionV2.sortBy('lastContact'); return false;">
                                Dernière activité <i class="ti ti-arrows-sort"></i>
                            </a>
                        </th>
                        <th class="w-1"></th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => this.renderListRow(lead)).join('')}
                </tbody>
            </table>
        `;
    },
    
    // Rendre une ligne de tableau
    renderListRow(lead) {
        return `
            <tr>
                <td>
                    <a href="#" onclick="PipelineNotion.showLeadDetails('${lead.id}'); return false;">
                        ${lead.company}
                    </a>
                </td>
                <td class="text-muted">${lead.contact}</td>
                <td>
                    <span class="badge bg-${this.getStageColor(lead.stage)}-lt">
                        ${lead.stage}
                    </span>
                </td>
                <td class="fw-bold">${lead.displayValue}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress progress-sm flex-fill me-2" style="width: 60px;">
                            <div class="progress-bar bg-${this.getProbabilityColor(lead.probability)}" 
                                 style="width: ${lead.probability}%">
                            </div>
                        </div>
                        <span>${lead.probability}%</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${this.getScoreBadgeClass(lead.score)}">
                        ${lead.score}/100
                    </span>
                </td>
                <td class="text-muted">
                    ${window.NotionConnector?.utils?.formatDate(lead.lastContact) || new Date(lead.lastContact).toLocaleDateString('fr-FR')}
                </td>
                <td>
                    <div class="btn-list flex-nowrap">
                        <button class="btn btn-sm btn-ghost-secondary" 
                                onclick="PipelineNotion.editLead('${lead.id}')">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost-secondary" 
                                onclick="PipelineNotion.convertToSale('${lead.id}')">
                            <i class="ti ti-check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },
    
    // Vue grille avec pagination
    renderGridViewPaginated() {
        const container = document.getElementById('pipeline-container');
        if (!container) return;
        
        container.className = 'row g-3';
        
        const leads = this.paginatedLeads;
        const paginationState = window.PaginationSystem.getState('pipeline');
        
        // Ajouter un header
        const header = document.createElement('div');
        header.className = 'col-12';
        header.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h4>Vue grille des leads</h4>
                <div class="text-muted">
                    Page ${paginationState.currentPage} sur ${paginationState.totalPages}
                </div>
            </div>
        `;
        container.appendChild(header);
        
        // Rendre les cartes
        container.innerHTML += leads.map(lead => this.renderGridCard(lead)).join('');
    },
    
    // Rendre une carte de grille
    renderGridCard(lead) {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-status-top bg-${this.getStageColor(lead.stage)}"></div>
                    <div class="card-body">
                        <h3 class="card-title">
                            <a href="#" onclick="PipelineNotion.showLeadDetails('${lead.id}'); return false;">
                                ${lead.company}
                            </a>
                        </h3>
                        <div class="mb-3">
                            <div class="row g-2 align-items-center mb-2">
                                <div class="col-auto">
                                    <i class="ti ti-user text-muted"></i>
                                </div>
                                <div class="col">
                                    ${lead.contact}
                                </div>
                            </div>
                            <div class="row g-2 align-items-center mb-2">
                                <div class="col-auto">
                                    <i class="ti ti-phone text-muted"></i>
                                </div>
                                <div class="col">
                                    ${lead.phone || 'Non renseigné'}
                                </div>
                            </div>
                            <div class="row g-2 align-items-center">
                                <div class="col-auto">
                                    <i class="ti ti-mail text-muted"></i>
                                </div>
                                <div class="col text-truncate">
                                    ${lead.email || 'Non renseigné'}
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex align-items-center mb-3">
                            <div class="me-3">
                                <div class="text-muted small">Valeur</div>
                                <div class="fw-bold">${lead.displayValue}</div>
                            </div>
                            <div class="me-3">
                                <div class="text-muted small">Probabilité</div>
                                <div class="fw-bold">${lead.probability}%</div>
                            </div>
                            <div>
                                <div class="text-muted small">Score</div>
                                <div class="fw-bold">${lead.score}/100</div>
                            </div>
                        </div>
                        
                        <div class="progress progress-sm mb-3">
                            <div class="progress-bar bg-${this.getStageColor(lead.stage)}" 
                                 style="width: ${this.getStageProgress(lead.stage)}%">
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill" 
                                    onclick="PipelineNotion.moveToNextStage('${lead.id}')">
                                <i class="ti ti-arrow-right"></i> Étape suivante
                            </button>
                            <button class="btn btn-sm btn-ghost-secondary" 
                                    onclick="PipelineNotion.editLead('${lead.id}')">
                                <i class="ti ti-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Trier par colonne
    async sortBy(field) {
        const paginationState = window.PaginationSystem.getState('pipeline');
        
        // Inverser l'ordre si on clique sur la même colonne
        let newOrder = 'asc';
        if (paginationState.sortBy === field && paginationState.sortOrder === 'asc') {
            newOrder = 'desc';
        }
        
        // Mettre à jour l'état
        window.PaginationSystem.updateState('pipeline', {
            sortBy: field,
            sortOrder: newOrder,
            currentPage: 1 // Retourner à la première page
        });
        
        // Recharger les données
        await this.loadPipelineData();
    },
    
    // Afficher tous les leads (désactiver la pagination temporairement)
    async showAllLeads() {
        if (!confirm('Afficher tous les leads peut ralentir l\'interface. Continuer ?')) {
            return;
        }
        
        // Augmenter temporairement la taille de page
        window.PaginationSystem.updateState('pipeline', {
            pageSize: 1000,
            currentPage: 1
        });
        
        // Recharger
        await this.loadPipelineData();
    },
    
    // Recherche avec pagination
    searchLeads(query) {
        const searchTerm = query.toLowerCase().trim();
        
        // Mettre à jour les filtres dans l'état de pagination
        window.PaginationSystem.updateState('pipeline', {
            filters: searchTerm ? { search: searchTerm } : {},
            currentPage: 1 // Retourner à la première page
        });
        
        // Recharger les données avec le filtre
        this.loadPipelineData();
    },
    
    // Appliquer un filtre avec pagination
    applyFilter(filter) {
        this.currentFilter = filter;
        
        // Convertir le filtre en paramètres
        let filters = {};
        switch (filter) {
            case 'hot':
                filters.minProbability = 70;
                break;
            case 'new':
                filters.maxDaysInStage = 7;
                break;
            case 'stale':
                filters.minDaysInStage = 30;
                break;
            case 'high-value':
                filters.minValue = 50000;
                break;
        }
        
        // Mettre à jour l'état
        window.PaginationSystem.updateState('pipeline', {
            filters: filters,
            currentPage: 1
        });
        
        // Mettre à jour les badges
        document.querySelectorAll('[data-filter-pipeline]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filterPipeline === filter);
        });
        
        // Recharger
        this.loadPipelineData();
    },
    
    // Rendre le HTML du Kanban
    renderKanbanHTML() {
        return `
            <div class="kanban-board">
                ${this.STAGES.map(stage => {
                    const stageLeads = this.paginatedLeads.filter(lead => 
                        lead.stage.toLowerCase() === stage.id || 
                        lead.stage === stage.name
                    );
                    
                    const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
                    
                    return `
                        <div class="kanban-column" data-stage="${stage.id}">
                            <div class="kanban-column-header bg-${stage.color}-lt">
                                <h4 class="kanban-title">
                                    ${stage.name}
                                    <span class="badge badge-sm bg-${stage.color} ms-2">${stageLeads.length}</span>
                                </h4>
                                <div class="text-muted small">
                                    ${window.NotionConnector?.utils?.formatCurrency(totalValue) || `CHF ${totalValue.toLocaleString('fr-CH')}`}
                                </div>
                            </div>
                            <div class="kanban-column-body" data-stage="${stage.id}">
                                ${stageLeads.map(lead => this.renderLeadCard(lead)).join('')}
                            </div>
                            ${stage.id !== 'gagne' && stage.id !== 'perdu' ? `
                                <div class="kanban-column-footer">
                                    <button class="btn btn-sm btn-ghost-primary w-100" 
                                            onclick="PipelineNotion.addLeadToStage('${stage.id}')">
                                        <i class="ti ti-plus"></i> Ajouter un lead
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
};

// Copier toutes les méthodes non overridées de la v1
Object.keys(window.PipelineNotion || {}).forEach(key => {
    if (typeof window.PipelineNotion[key] === 'function' && !PipelineNotionV2[key]) {
        PipelineNotionV2[key] = window.PipelineNotion[key];
    }
});

// Export global
window.PipelineNotionV2 = PipelineNotionV2;

// Auto-initialisation si on est sur la page pipeline
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pipeline.html')) {
        // Vérifier si on doit utiliser la v2
        const urlParams = new URLSearchParams(window.location.search);
        const useV2 = urlParams.get('v2') === 'true' || localStorage.getItem('USE_PIPELINE_V2') === 'true';
        
        if (useV2) {
            console.log('🚀 Utilisation de Pipeline v2 avec pagination');
            
            // Remplacer PipelineNotion par PipelineNotionV2
            window.PipelineNotion = window.PipelineNotionV2;
            
            // Attendre que les dépendances soient prêtes
            const checkDependencies = setInterval(() => {
                if (window.NotionConnector && window.AuthNotionModule && window.PaginationSystem) {
                    clearInterval(checkDependencies);
                    PipelineNotionV2.init();
                }
            }, 100);
        }
    }
});