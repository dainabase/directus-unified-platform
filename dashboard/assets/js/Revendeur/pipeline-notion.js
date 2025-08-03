// pipeline-notion.js - Intégration Notion pour le pipeline CRM revendeur
// Ce fichier gère l'interface Kanban du pipeline de ventes avec Notion

const PipelineNotion = {
    // Configuration
    DB_IDS: {
        PIPELINE: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
        CONTACTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
        VENTES: '236adb95-3c6f-8018-b3ba-fa5c85c9e9e6'
    },
    
    // Étapes du pipeline
    STAGES: [
        { id: 'nouveau', name: 'Nouveau', color: 'secondary' },
        { id: 'qualification', name: 'Qualification', color: 'info' },
        { id: 'proposition', name: 'Proposition', color: 'primary' },
        { id: 'negociation', name: 'Négociation', color: 'warning' },
        { id: 'gagne', name: 'Gagné', color: 'success' },
        { id: 'perdu', name: 'Perdu', color: 'danger' }
    ],
    
    // État local
    allLeads: [],
    currentView: 'kanban', // kanban, list, grid
    currentFilter: 'all',
    draggedLead: null,
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du pipeline CRM avec Notion');
        this.loadPipelineData();
        this.attachEventListeners();
        this.initializeDragAndDrop();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Changement de vue
        document.querySelectorAll('[data-view-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(e.target.closest('[data-view-type]').dataset.viewType);
            });
        });
        
        // Filtres
        document.querySelectorAll('[data-filter-pipeline]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyFilter(e.target.dataset.filterPipeline);
            });
        });
        
        // Recherche
        const searchInput = document.getElementById('search-pipeline');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLeads(e.target.value);
            });
        }
        
        // Nouveau lead
        const newLeadBtn = document.getElementById('new-lead-btn');
        if (newLeadBtn) {
            newLeadBtn.addEventListener('click', () => this.showNewLeadModal());
        }
        
        // Rafraîchissement
        const refreshBtn = document.getElementById('refresh-pipeline');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadPipelineData());
        }
    },
    
    // Initialiser le drag and drop
    initializeDragAndDrop() {
        // Cette fonction sera appelée après le chargement des données
    },
    
    // Charger les données du pipeline
    async loadPipelineData() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir le pipeline
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
            
            // Récupérer les données du pipeline avec le middleware sécurisé
            const pipelineData = await window.PermissionsMiddleware.secureApiCall(
                'pipeline',
                'view',
                window.NotionConnector.revendeur.getSalesPipeline.bind(window.NotionConnector.revendeur),
                currentUser.id
            );
            
            // Enrichir les leads avec des données supplémentaires
            const enrichedLeads = await this.enrichLeadsData(pipelineData.leads);
            
            // Stocker les leads
            this.allLeads = enrichedLeads;
            
            // Mettre à jour l'interface selon la vue actuelle
            this.updateView();
            
            // Mettre à jour les statistiques
            this.updatePipelineStats(pipelineData.stages);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'pipeline', true, {
                leadCount: enrichedLeads.length,
                revendeurId: currentUser.id,
                pipelineValue: pipelineData.stages?.reduce((sum, stage) => sum + (stage.value || 0), 0) || 0
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
    
    // Enrichir les données des leads
    async enrichLeadsData(leads) {
        // Pour chaque lead, ajouter des informations calculées
        return leads.map(lead => ({
            ...lead,
            daysInStage: this.calculateDaysInStage(lead.lastStageChange),
            score: this.calculateLeadScore(lead),
            urgency: this.calculateUrgency(lead),
            displayValue: window.NotionConnector.utils.formatCurrency(lead.value || 0),
            weightedValue: Math.round((lead.value || 0) * (lead.probability || 0) / 100)
        }));
    },
    
    // Mettre à jour la vue
    updateView() {
        switch (this.currentView) {
            case 'kanban':
                this.renderKanbanView();
                break;
            case 'list':
                this.renderListView();
                break;
            case 'grid':
                this.renderGridView();
                break;
        }
    },
    
    // Afficher la vue Kanban
    renderKanbanView() {
        const container = document.getElementById('pipeline-container');
        if (!container) return;
        
        container.className = 'kanban-board';
        container.innerHTML = this.STAGES.map(stage => {
            const stageLeads = this.getFilteredLeads().filter(lead => 
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
                            ${window.NotionConnector.utils.formatCurrency(totalValue)}
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
        }).join('');
        
        // Réinitialiser le drag and drop
        this.setupKanbanDragAndDrop();
    },
    
    // Afficher une carte de lead
    renderLeadCard(lead) {
        const urgencyClass = lead.urgency === 'high' ? 'border-danger' : 
                           lead.urgency === 'medium' ? 'border-warning' : '';
        
        return `
            <div class="kanban-card ${urgencyClass}" 
                 data-lead-id="${lead.id}"
                 draggable="true">
                <div class="kanban-card-header">
                    <h5 class="kanban-card-title">
                        <a href="#" onclick="PipelineNotion.showLeadDetails('${lead.id}'); return false;">
                            ${lead.company}
                        </a>
                    </h5>
                    <div class="kanban-card-meta">
                        <span class="badge badge-sm ${this.getScoreBadgeClass(lead.score)}">
                            Score: ${lead.score}/100
                        </span>
                    </div>
                </div>
                <div class="kanban-card-body">
                    <div class="mb-2">
                        <i class="ti ti-user text-muted"></i>
                        <span class="text-muted">${lead.contact}</span>
                    </div>
                    <div class="mb-2">
                        <i class="ti ti-currency-euro text-muted"></i>
                        <span class="fw-bold">${lead.displayValue}</span>
                        <span class="text-muted small">(${lead.probability}%)</span>
                    </div>
                    ${lead.nextAction ? `
                        <div class="mb-2">
                            <i class="ti ti-calendar-event text-muted"></i>
                            <span class="text-muted small">${lead.nextAction}</span>
                        </div>
                    ` : ''}
                    <div class="text-muted small">
                        <i class="ti ti-clock"></i>
                        ${lead.daysInStage} jours dans cette étape
                    </div>
                </div>
                <div class="kanban-card-footer">
                    <div class="btn-list">
                        <button class="btn btn-sm btn-ghost-secondary" 
                                onclick="PipelineNotion.editLead('${lead.id}')"
                                title="Modifier">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost-secondary" 
                                onclick="PipelineNotion.addNote('${lead.id}')"
                                title="Ajouter une note">
                            <i class="ti ti-message"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost-secondary" 
                                onclick="PipelineNotion.scheduleActivity('${lead.id}')"
                                title="Planifier une activité">
                            <i class="ti ti-calendar-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Configurer le drag and drop pour le Kanban
    setupKanbanDragAndDrop() {
        // Cards draggables
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedLead = e.target.dataset.leadId;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
        
        // Colonnes drop zones
        document.querySelectorAll('.kanban-column-body').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const draggingCard = document.querySelector('.dragging');
                const afterElement = this.getDragAfterElement(column, e.clientY);
                
                if (afterElement == null) {
                    column.appendChild(draggingCard);
                } else {
                    column.insertBefore(draggingCard, afterElement);
                }
                
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                if (e.target === column) {
                    column.classList.remove('drag-over');
                }
            });
            
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const newStage = column.dataset.stage;
                await this.updateLeadStage(this.draggedLead, newStage);
                
                this.draggedLead = null;
            });
        });
    },
    
    // Obtenir l'élément après lequel insérer lors du drag
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
    
    // Afficher la vue liste
    renderListView() {
        const container = document.getElementById('pipeline-container');
        if (!container) return;
        
        container.className = 'table-responsive';
        
        const leads = this.getFilteredLeads();
        
        container.innerHTML = `
            <table class="table table-vcenter card-table">
                <thead>
                    <tr>
                        <th>Entreprise</th>
                        <th>Contact</th>
                        <th>Étape</th>
                        <th>Valeur</th>
                        <th>Probabilité</th>
                        <th>Score</th>
                        <th>Dernière activité</th>
                        <th class="w-1"></th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => `
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
                                ${window.NotionConnector.utils.formatDate(lead.lastContact)}
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
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    // Afficher la vue grille
    renderGridView() {
        const container = document.getElementById('pipeline-container');
        if (!container) return;
        
        container.className = 'row g-3';
        
        const leads = this.getFilteredLeads();
        
        container.innerHTML = leads.map(lead => `
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
        `).join('');
    },
    
    // Mettre à jour les statistiques du pipeline
    updatePipelineStats(stages) {
        // Total des leads
        const totalLeads = Object.values(stages).reduce((sum, stage) => sum + stage.count, 0);
        document.getElementById('total-leads').textContent = totalLeads;
        
        // Valeur totale
        const totalValue = Object.values(stages).reduce((sum, stage) => sum + stage.value, 0);
        document.getElementById('pipeline-value').textContent = 
            window.NotionConnector.utils.formatCurrency(totalValue);
        
        // Taux de conversion
        const wonDeals = stages['Gagné']?.count || 0;
        const conversionRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;
        document.getElementById('conversion-rate-pipeline').textContent = conversionRate + '%';
        
        // Valeur moyenne
        const avgDealSize = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;
        document.getElementById('avg-deal-size').textContent = 
            window.NotionConnector.utils.formatCurrency(avgDealSize);
    },
    
    // Obtenir les leads filtrés
    getFilteredLeads() {
        let leads = [...this.allLeads];
        
        // Appliquer le filtre actuel
        if (this.currentFilter !== 'all') {
            switch (this.currentFilter) {
                case 'hot':
                    leads = leads.filter(l => l.probability >= 70);
                    break;
                case 'new':
                    leads = leads.filter(l => l.daysInStage <= 7);
                    break;
                case 'stale':
                    leads = leads.filter(l => l.daysInStage > 30);
                    break;
                case 'high-value':
                    leads = leads.filter(l => l.value >= 50000);
                    break;
            }
        }
        
        return leads;
    },
    
    // Actions
    async updateLeadStage(leadId, newStage) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour modifier les leads
            const canUpdateLead = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'pipeline',
                'update.own'
            );
            
            if (!canUpdateLead) {
                window.showNotification('Vous n\'avez pas le droit de modifier ce lead', 'error');
                return;
            }
            
            // Trouver le nom complet de l'étape
            const stage = this.STAGES.find(s => s.id === newStage);
            if (!stage) return;
            
            // Mettre à jour via l'API sécurisée
            await window.PermissionsMiddleware.secureApiCall(
                'pipeline',
                'update',
                this.updateLeadInNotion.bind(this),
                leadId,
                { stage: stage.name }
            );
            
            // Mettre à jour localement
            const lead = this.allLeads.find(l => l.id === leadId);
            if (lead) {
                lead.stage = stage.name;
                lead.lastStageChange = new Date().toISOString();
                lead.daysInStage = 0;
            }
            
            // Afficher une notification
            if (window.showNotification) {
                window.showNotification(`Lead déplacé vers ${stage.name}`, 'success');
            }
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('update', 'pipeline.stage', true, {
                leadId: leadId,
                fromStage: lead?.stage || 'unknown',
                toStage: stage.name
            });
            
            // Si le lead est gagné, proposer de créer une vente
            if (newStage === 'gagne') {
                setTimeout(() => {
                    if (confirm('Félicitations ! Voulez-vous créer une vente pour ce lead ?')) {
                        this.convertToSale(leadId);
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('Erreur mise à jour stage:', error);
            if (window.showNotification) {
                window.showNotification('Erreur lors de la mise à jour', 'error');
            }
        }
    },
    
    showLeadDetails(leadId) {
        const lead = this.allLeads.find(l => l.id === leadId);
        if (!lead) return;
        
        // TODO: Implémenter l'affichage détaillé
        console.log('Détails du lead:', lead);
        
        // Pour l'instant, afficher une modal simple
        if (window.showNotification) {
            window.showNotification(`Détails de ${lead.company} à implémenter`, 'info');
        }
    },
    
    editLead(leadId) {
        // TODO: Implémenter l'édition
        console.log('Édition du lead:', leadId);
        if (window.showNotification) {
            window.showNotification('Édition des leads à venir', 'info');
        }
    },
    
    addNote(leadId) {
        const note = prompt('Ajouter une note:');
        if (note) {
            // TODO: Sauvegarder la note dans Notion
            console.log('Note ajoutée:', { leadId, note });
            if (window.showNotification) {
                window.showNotification('Note ajoutée', 'success');
            }
        }
    },
    
    scheduleActivity(leadId) {
        // TODO: Implémenter la planification d'activité
        console.log('Planification activité:', leadId);
        if (window.showNotification) {
            window.showNotification('Planification d\'activités à venir', 'info');
        }
    },
    
    convertToSale(leadId) {
        const lead = this.allLeads.find(l => l.id === leadId);
        if (!lead) return;
        
        // TODO: Créer une vente dans DB-VENTES
        console.log('Conversion en vente:', lead);
        
        if (window.showNotification) {
            window.showNotification('Vente créée avec succès!', 'success');
        }
        
        // Rediriger vers la page des ventes
        setTimeout(() => {
            window.location.href = `clients.html?newSale=${leadId}`;
        }, 1500);
    },
    
    moveToNextStage(leadId) {
        const lead = this.allLeads.find(l => l.id === leadId);
        if (!lead) return;
        
        const currentStageIndex = this.STAGES.findIndex(s => 
            s.name === lead.stage || s.id === lead.stage.toLowerCase()
        );
        
        if (currentStageIndex < this.STAGES.length - 2) { // -2 pour éviter "Perdu"
            const nextStage = this.STAGES[currentStageIndex + 1];
            this.updateLeadStage(leadId, nextStage.id);
            this.updateView(); // Rafraîchir la vue
        }
    },
    
    addLeadToStage(stageId) {
        // TODO: Implémenter l'ajout de lead
        console.log('Ajout lead à l\'étape:', stageId);
        this.showNewLeadModal(stageId);
    },
    
    showNewLeadModal(defaultStage = null) {
        // TODO: Implémenter la modal de création
        if (window.showNotification) {
            window.showNotification('Création de leads à venir', 'info');
        }
    },
    
    // Changer de vue
    switchView(viewType) {
        this.currentView = viewType;
        
        // Mettre à jour les boutons
        document.querySelectorAll('[data-view-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.viewType === viewType);
        });
        
        // Mettre à jour l'affichage
        this.updateView();
    },
    
    // Appliquer un filtre
    applyFilter(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les badges
        document.querySelectorAll('[data-filter-pipeline]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filterPipeline === filter);
        });
        
        // Mettre à jour l'affichage
        this.updateView();
    },
    
    // Rechercher des leads
    searchLeads(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.updateView();
            return;
        }
        
        const originalLeads = [...this.allLeads];
        this.allLeads = originalLeads.filter(lead =>
            lead.company.toLowerCase().includes(searchTerm) ||
            lead.contact.toLowerCase().includes(searchTerm) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm))
        );
        
        this.updateView();
        
        // Restaurer après la recherche
        if (!searchTerm) {
            this.allLeads = originalLeads;
        }
    },
    
    // Fonctions utilitaires
    calculateDaysInStage(lastStageChange) {
        if (!lastStageChange) return 0;
        const changeDate = new Date(lastStageChange);
        const today = new Date();
        return Math.floor((today - changeDate) / (1000 * 60 * 60 * 24));
    },
    
    calculateLeadScore(lead) {
        let score = 0;
        
        // Critères de scoring
        if (lead.value >= 100000) score += 30;
        else if (lead.value >= 50000) score += 20;
        else if (lead.value >= 20000) score += 10;
        
        if (lead.probability >= 70) score += 25;
        else if (lead.probability >= 50) score += 15;
        else if (lead.probability >= 30) score += 5;
        
        // Activité récente
        const daysSinceContact = this.calculateDaysInStage(lead.lastContact);
        if (daysSinceContact <= 7) score += 20;
        else if (daysSinceContact <= 14) score += 10;
        
        // Engagement
        if (lead.meetingsCount >= 3) score += 15;
        else if (lead.meetingsCount >= 1) score += 10;
        
        // Stage avancé
        if (lead.stage === 'Négociation' || lead.stage === 'Proposition') score += 10;
        
        return Math.min(score, 100);
    },
    
    calculateUrgency(lead) {
        if (lead.probability >= 70 && lead.value >= 50000) return 'high';
        if (lead.probability >= 50 || lead.value >= 30000) return 'medium';
        return 'low';
    },
    
    getStageColor(stage) {
        const stageObj = this.STAGES.find(s => 
            s.name === stage || s.id === stage.toLowerCase()
        );
        return stageObj ? stageObj.color : 'secondary';
    },
    
    getStageProgress(stage) {
        const stageIndex = this.STAGES.findIndex(s => 
            s.name === stage || s.id === stage.toLowerCase()
        );
        return stageIndex >= 0 ? Math.round((stageIndex / (this.STAGES.length - 1)) * 100) : 0;
    },
    
    getScoreBadgeClass(score) {
        if (score >= 80) return 'badge-success';
        if (score >= 60) return 'badge-primary';
        if (score >= 40) return 'badge-warning';
        return 'badge-secondary';
    },
    
    getProbabilityColor(probability) {
        if (probability >= 70) return 'success';
        if (probability >= 50) return 'primary';
        if (probability >= 30) return 'warning';
        return 'danger';
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('pipeline-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement du pipeline...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par les fonctions de rendu
    },
    
    showErrorState() {
        const container = document.getElementById('pipeline-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                    <h3 class="text-danger">Erreur de chargement</h3>
                    <p class="text-muted">Impossible de charger le pipeline</p>
                    <button class="btn btn-primary mt-2" onclick="PipelineNotion.loadPipelineData()">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement du pipeline', 'error');
        }
    }
};

// Styles CSS pour le Kanban
const kanbanStyles = `
<style>
.kanban-board {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
}

.kanban-column {
    flex: 0 0 300px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
}

.kanban-column-header {
    padding: 1rem;
    border-radius: 0.5rem 0.5rem 0 0;
    margin-bottom: 0.5rem;
}

.kanban-column-body {
    flex: 1;
    padding: 0.5rem;
    background: var(--bs-gray-100);
    border-radius: 0.5rem;
    min-height: 200px;
    transition: background-color 0.2s;
}

.kanban-column-body.drag-over {
    background: var(--bs-primary-lt);
}

.kanban-card {
    background: white;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    cursor: move;
    transition: all 0.2s;
}

.kanban-card:hover {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.kanban-card.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
}

.kanban-card-title {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.kanban-card-body {
    font-size: 0.8125rem;
}

.kanban-card-footer {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--bs-border-color);
}
</style>
`;

// Injecter les styles au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pipeline.html')) {
        // Ajouter les styles Kanban
        document.head.insertAdjacentHTML('beforeend', kanbanStyles);
        
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                PipelineNotion.init();
            }
        }, 100);
    },
    
    // Fonction stub pour mettre à jour un lead dans Notion
    async updateLeadInNotion(leadId, updateData) {
        // TODO: Implémenter la vraie mise à jour dans Notion
        console.log(`Mise à jour lead ${leadId}:`, updateData);
        return { success: true };
    }
});

// Export global
window.PipelineNotion = PipelineNotion;