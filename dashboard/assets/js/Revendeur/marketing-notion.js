// marketing-notion.js - Intégration Notion pour le marketing revendeur
// Ce fichier gère la connexion avec les bases de données Notion pour les campagnes marketing

const MarketingNotion = {
    // Configuration
    DB_IDS: {
        CAMPAIGNS: '22eadb95-3c6f-804c-9690-f39a1e567458', // DB_CAMPAIGNS correct
        LEADS_SOURCE: '236adb95-3c6f-8079-a142-d8b547321489',
        EMAIL_TEMPLATES: '258adb95-3c6f-8056-a753-f9e652c7bd21',
        ANALYTICS: '269adb95-3c6f-8067-b864-09f763d8ce32'
    },
    
    // État local
    allCampaigns: [],
    currentView: 'campaigns', // campaigns, analytics, templates
    currentFilter: 'all',
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du marketing avec Notion');
        this.loadMarketingData();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Changement de vue
        document.querySelectorAll('[data-marketing-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(e.target.dataset.marketingView);
            });
        });
        
        // Filtres
        document.querySelectorAll('[data-filter-campaign]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterCampaigns(e.target.dataset.filterCampaign);
            });
        });
        
        // Recherche
        const searchInput = document.getElementById('search-campaigns');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCampaigns(e.target.value);
            });
        }
        
        // Nouvelle campagne
        const newCampaignBtn = document.getElementById('new-campaign-btn');
        if (newCampaignBtn) {
            newCampaignBtn.addEventListener('click', () => this.showNewCampaignModal());
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-marketing');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadMarketingData());
        }
        
        // Export
        const exportBtn = document.getElementById('export-campaigns');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCampaigns());
        }
    },
    
    // Charger les données marketing depuis Notion
    async loadMarketingData() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir le marketing
            const canViewMarketing = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'marketing',
                'view.own'
            );
            
            if (!canViewMarketing) {
                window.showNotification('Vous n\'avez pas accès au marketing', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les données avec le middleware sécurisé
            const [campaigns, analytics, templates] = await Promise.all([
                window.PermissionsMiddleware.secureApiCall(
                    'marketing',
                    'view',
                    this.getRevendeurCampaigns.bind(this),
                    currentUser.id
                ),
                window.PermissionsMiddleware.secureApiCall(
                    'marketing',
                    'view',
                    this.getMarketingAnalytics.bind(this),
                    currentUser.id
                ),
                window.PermissionsMiddleware.secureApiCall(
                    'marketing',
                    'view',
                    this.getEmailTemplates.bind(this),
                    currentUser.id
                )
            ]);
            
            // Enrichir les données des campagnes
            const enrichedCampaigns = this.enrichCampaignsData(campaigns);
            
            // Stocker les données
            this.allCampaigns = enrichedCampaigns;
            
            // Mettre à jour l'interface
            this.updateMarketingView(enrichedCampaigns);
            this.updateMarketingStats(enrichedCampaigns, analytics);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'marketing', true, {
                campaignCount: campaigns.length,
                totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
                revendeurId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement du marketing:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'marketing', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les campagnes du revendeur (stub)
    async getRevendeurCampaigns(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'camp1',
                nom: 'Campagne Digital Q1 2024',
                type: 'Email',
                statut: 'Active',
                dateDebut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 15000,
                budgetUtilise: 8500,
                objectif: 'Génération de leads',
                cible: 'PME Tech',
                canal: 'Email + LinkedIn',
                leads: 142,
                conversions: 28,
                coutParLead: 59.86,
                roi: 245,
                impressions: 25000,
                clics: 890,
                tauxOuverture: 24.5,
                tauxClic: 3.6
            },
            {
                id: 'camp2',
                nom: 'Webinar Solutions Cloud',
                type: 'Événement',
                statut: 'Terminée',
                dateDebut: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                dateFin: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 8000,
                budgetUtilise: 7200,
                objectif: 'Éducation prospects',
                cible: 'CTO/DSI',
                canal: 'Webinar + Social',
                leads: 67,
                conversions: 15,
                coutParLead: 107.46,
                roi: 187,
                impressions: 12000,
                clics: 430,
                participants: 67,
                satisfaction: 4.3
            },
            {
                id: 'camp3',
                nom: 'Retargeting Display',
                type: 'Display',
                statut: 'En pause',
                dateDebut: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                dateFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 5000,
                budgetUtilise: 2100,
                objectif: 'Reconversion',
                cible: 'Visiteurs site',
                canal: 'Google Display',
                leads: 23,
                conversions: 4,
                coutParLead: 91.30,
                roi: 95,
                impressions: 45000,
                clics: 340,
                tauxClic: 0.76,
                tauxConversion: 1.18
            }
        ];
    },
    
    // Récupérer les analytics marketing (stub)
    async getMarketingAnalytics(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        return {
            overview: {
                totalBudget: 28000,
                budgetUtilise: 17800,
                totalLeads: 232,
                totalConversions: 47,
                roiMoyen: 209,
                coutMoyenParLead: 76.72
            },
            performance: {
                moisActuel: {
                    leads: 85,
                    conversions: 18,
                    budget: 6200
                },
                moisPrecedent: {
                    leads: 72,
                    conversions: 15,
                    budget: 5800
                }
            },
            canaux: [
                { nom: 'Email', leads: 142, conversions: 28, roi: 245 },
                { nom: 'Social Media', leads: 67, conversions: 15, roi: 187 },
                { nom: 'Display', leads: 23, conversions: 4, roi: 95 }
            ],
            tendances: {
                derniers6Mois: [65, 72, 89, 95, 85, 92]
            }
        };
    },
    
    // Récupérer les templates email (stub)
    async getEmailTemplates(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'tpl1',
                nom: 'Welcome Sequence',
                type: 'Automation',
                sujet: 'Bienvenue chez TechSolutions',
                tauxOuverture: 32.5,
                tauxClic: 8.2,
                utilise: 15
            },
            {
                id: 'tpl2',
                nom: 'Product Demo Invite',
                type: 'Promotion',
                sujet: 'Découvrez nos solutions en live',
                tauxOuverture: 28.7,
                tauxClic: 12.4,
                utilise: 8
            }
        ];
    },
    
    // Enrichir les données des campagnes
    enrichCampaignsData(campaigns) {
        return campaigns.map(campaign => ({
            ...campaign,
            formattedDateDebut: this.formatDate(campaign.dateDebut),
            formattedDateFin: this.formatDate(campaign.dateFin),
            dureeJours: this.calculateDuration(campaign.dateDebut, campaign.dateFin),
            budgetRestant: campaign.budget - campaign.budgetUtilise,
            progressBudget: Math.round((campaign.budgetUtilise / campaign.budget) * 100),
            tauxConversion: campaign.leads > 0 ? Math.round((campaign.conversions / campaign.leads) * 100) : 0,
            statusColor: this.getStatusColor(campaign.statut),
            roiColor: this.getRoiColor(campaign.roi),
            isActive: campaign.statut === 'Active',
            isOverBudget: campaign.budgetUtilise > campaign.budget,
            performance: this.calculatePerformance(campaign)
        }));
    },
    
    // Mettre à jour la vue marketing
    updateMarketingView(campaigns) {
        switch (this.currentView) {
            case 'campaigns':
                this.renderCampaignsView(campaigns);
                break;
            case 'analytics':
                this.renderAnalyticsView(campaigns);
                break;
            case 'templates':
                this.renderTemplatesView();
                break;
        }
    },
    
    // Afficher la vue des campagnes
    renderCampaignsView(campaigns) {
        const container = document.getElementById('marketing-container');
        if (!container) return;
        
        if (campaigns.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-bullhorn-off fs-1 text-muted mb-3"></i>
                            <h3 class="text-muted">Aucune campagne trouvée</h3>
                            <p class="text-muted">Créez votre première campagne marketing</p>
                            <button class="btn btn-primary mt-2" onclick="MarketingNotion.showNewCampaignModal()">
                                <i class="ti ti-plus"></i> Nouvelle campagne
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = campaigns.map(campaign => `
            <div class="col-12 col-md-6 col-lg-4 campaign-item" 
                 data-status="${campaign.statut}"
                 data-type="${campaign.type}">
                <div class="card ${campaign.isOverBudget ? 'border-danger' : ''}">
                    ${campaign.isActive ? '<div class="ribbon ribbon-top bg-green"><i class="ti ti-broadcast"></i></div>' : ''}
                    <div class="card-status-top ${campaign.statusColor}"></div>
                    
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="avatar avatar-md ${campaign.statusColor}-lt me-3">
                                <i class="ti ${this.getTypeIcon(campaign.type)}"></i>
                            </div>
                            <div class="flex-fill">
                                <h3 class="card-title mb-1">
                                    <a href="#" onclick="MarketingNotion.viewCampaign('${campaign.id}'); return false;">
                                        ${campaign.nom}
                                    </a>
                                </h3>
                                <div class="text-muted">${campaign.objectif}</div>
                                <div class="text-muted small">${campaign.cible}</div>
                            </div>
                            <div class="text-end">
                                <span class="badge ${campaign.statusColor}">${campaign.statut}</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="text-muted small mb-1">Budget utilisé</div>
                            <div class="d-flex justify-content-between mb-1">
                                <span>${window.NotionConnector.utils.formatCurrency(campaign.budgetUtilise)}</span>
                                <span class="text-muted">${window.NotionConnector.utils.formatCurrency(campaign.budget)}</span>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar ${campaign.isOverBudget ? 'bg-danger' : 'bg-primary'}" 
                                     style="width: ${Math.min(campaign.progressBudget, 100)}%" 
                                     role="progressbar">
                                    <span class="visually-hidden">${campaign.progressBudget}% Budget</span>
                                </div>
                            </div>
                            ${campaign.isOverBudget ? '<div class="text-danger small mt-1">Budget dépassé</div>' : ''}
                        </div>
                        
                        <div class="row g-2 align-items-center text-muted small mb-3">
                            <div class="col-6">
                                <i class="ti ti-users"></i>
                                ${campaign.leads} leads
                            </div>
                            <div class="col-6">
                                <i class="ti ti-target"></i>
                                ${campaign.conversions} conversions
                            </div>
                            <div class="col-6">
                                <i class="ti ti-percentage"></i>
                                ${campaign.tauxConversion}% conv.
                            </div>
                            <div class="col-6">
                                <i class="ti ti-trending-up"></i>
                                ROI: ${campaign.roi}%
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="text-muted small">Performance</div>
                            <div class="d-flex align-items-center">
                                <div class="h4 mb-0 ${campaign.roiColor}">${campaign.performance}</div>
                                <div class="ms-auto">
                                    <span class="badge ${this.getPerformanceBadgeClass(campaign.performance)}">
                                        ${campaign.performance}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row g-2 align-items-center text-muted small mb-3">
                            <div class="col-auto">
                                <i class="ti ti-calendar"></i>
                                ${campaign.formattedDateDebut}
                            </div>
                            <div class="col-auto">
                                <i class="ti ti-clock"></i>
                                ${campaign.dureeJours} jours
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill" 
                                    onclick="MarketingNotion.viewCampaign('${campaign.id}')">
                                <i class="ti ti-chart-line"></i> Analytics
                            </button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="MarketingNotion.duplicateCampaign('${campaign.id}')"
                                    data-bs-toggle="tooltip" 
                                    title="Dupliquer">
                                <i class="ti ti-copy"></i>
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-ghost-secondary" 
                                        data-bs-toggle="dropdown">
                                    <i class="ti ti-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item" href="#" 
                                           onclick="MarketingNotion.editCampaign('${campaign.id}'); return false;">
                                            <i class="ti ti-edit me-2"></i>
                                            Modifier
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" 
                                           onclick="MarketingNotion.pauseCampaign('${campaign.id}'); return false;">
                                            <i class="ti ti-player-pause me-2"></i>
                                            ${campaign.isActive ? 'Mettre en pause' : 'Reprendre'}
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#" 
                                           onclick="MarketingNotion.deleteCampaign('${campaign.id}'); return false;">
                                            <i class="ti ti-trash me-2"></i>
                                            Supprimer
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les statistiques marketing
    updateMarketingStats(campaigns, analytics) {
        const stats = {
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter(c => c.isActive).length,
            totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
            budgetUtilise: campaigns.reduce((sum, c) => sum + (c.budgetUtilise || 0), 0),
            totalLeads: campaigns.reduce((sum, c) => sum + (c.leads || 0), 0),
            totalConversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
            roiMoyen: campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length) : 0,
            coutMoyenParLead: this.calculateAvgCostPerLead(campaigns)
        };
        
        // Mettre à jour les KPIs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number' && id.includes('budget')) {
                    element.textContent = window.NotionConnector.utils.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        };
        
        updateStat('total-campaigns', stats.totalCampaigns);
        updateStat('active-campaigns', stats.activeCampaigns);
        updateStat('total-marketing-budget', stats.totalBudget);
        updateStat('used-marketing-budget', stats.budgetUtilise);
        updateStat('total-marketing-leads', stats.totalLeads);
        updateStat('total-marketing-conversions', stats.totalConversions);
        updateStat('avg-roi', stats.roiMoyen + '%');
        updateStat('avg-cost-per-lead', window.NotionConnector.utils.formatCurrency(stats.coutMoyenParLead));
        
        // Progression budget
        const budgetProgress = document.getElementById('budget-progress');
        if (budgetProgress) {
            const percentage = stats.totalBudget > 0 ? Math.round((stats.budgetUtilise / stats.totalBudget) * 100) : 0;
            budgetProgress.style.width = percentage + '%';
            budgetProgress.className = `progress-bar ${percentage >= 90 ? 'bg-danger' : percentage >= 70 ? 'bg-warning' : 'bg-success'}`;
        }
    },
    
    // Actions sur les campagnes
    async viewCampaign(campaignId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // TODO: Implémenter la vue détaillée de campagne
            window.showNotification('Analytics de campagne à venir', 'info');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('view', 'marketing.campaign', true, {
                campaignId: campaignId
            });
            
        } catch (error) {
            console.error('Erreur vue campagne:', error);
        }
    },
    
    async showNewCampaignModal() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des campagnes
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'marketing',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des campagnes', 'error');
                return;
            }
            
            // TODO: Implémenter le modal de création
            console.log('Nouvelle campagne');
            
        } catch (error) {
            console.error('Erreur nouvelle campagne:', error);
        }
    },
    
    async duplicateCampaign(campaignId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des campagnes
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'marketing',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de dupliquer des campagnes', 'error');
                return;
            }
            
            // TODO: Implémenter la duplication
            window.showNotification('Campagne dupliquée avec succès', 'success');
            await this.loadMarketingData();
            
        } catch (error) {
            console.error('Erreur duplication campagne:', error);
        }
    },
    
    async exportCampaigns() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour exporter
            const canExport = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'marketing',
                'export'
            );
            
            if (!canExport) {
                window.showNotification('Vous n\'avez pas le droit d\'exporter', 'error');
                return;
            }
            
            window.showNotification('Export en cours...', 'info');
            
            // TODO: Implémenter l'export réel
            
        } catch (error) {
            console.error('Erreur export:', error);
        }
    },
    
    // Changer de vue
    switchView(viewType) {
        this.currentView = viewType;
        
        // Mettre à jour les boutons
        document.querySelectorAll('[data-marketing-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.marketingView === viewType);
        });
        
        // Mettre à jour l'affichage
        this.updateMarketingView(this.allCampaigns);
    },
    
    // Fonctions utilitaires
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', { 
            month: 'short', 
            day: 'numeric' 
        });
    },
    
    calculateDuration(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = endDate - startDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    getStatusColor(statut) {
        const colors = {
            'Active': 'bg-success',
            'En pause': 'bg-warning',
            'Terminée': 'bg-secondary',
            'Brouillon': 'bg-info'
        };
        return colors[statut] || 'bg-secondary';
    },
    
    getRoiColor(roi) {
        if (roi >= 200) return 'text-success';
        if (roi >= 100) return 'text-primary';
        if (roi >= 50) return 'text-warning';
        return 'text-danger';
    },
    
    getTypeIcon(type) {
        const icons = {
            'Email': 'ti-mail',
            'Display': 'ti-ad',
            'Social': 'ti-brand-facebook',
            'Événement': 'ti-calendar-event',
            'SEO': 'ti-search'
        };
        return icons[type] || 'ti-bullhorn';
    },
    
    calculatePerformance(campaign) {
        // Score basé sur ROI, taux de conversion et coût par lead
        let score = 0;
        
        if (campaign.roi >= 200) score += 40;
        else if (campaign.roi >= 150) score += 30;
        else if (campaign.roi >= 100) score += 20;
        else score += 10;
        
        if (campaign.tauxConversion >= 15) score += 30;
        else if (campaign.tauxConversion >= 10) score += 20;
        else if (campaign.tauxConversion >= 5) score += 10;
        
        if (campaign.coutParLead <= 50) score += 30;
        else if (campaign.coutParLead <= 100) score += 20;
        else score += 10;
        
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Bon';
        if (score >= 40) return 'Moyen';
        return 'Faible';
    },
    
    getPerformanceBadgeClass(performance) {
        const classes = {
            'Excellent': 'badge-success',
            'Bon': 'badge-primary',
            'Moyen': 'badge-warning',
            'Faible': 'badge-danger'
        };
        return classes[performance] || 'badge-secondary';
    },
    
    calculateAvgCostPerLead(campaigns) {
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budgetUtilise || 0), 0);
        const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
        return totalLeads > 0 ? Math.round(totalBudget / totalLeads) : 0;
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('marketing-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des campagnes...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par renderCampaignsView
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des campagnes', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('marketing.html')) {
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                MarketingNotion.init();
            }
        }, 100);
    }
});

// Export global
window.MarketingNotion = MarketingNotion;