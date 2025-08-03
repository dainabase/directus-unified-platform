// leads-notion.js - Intégration Notion pour la gestion des leads revendeur
// Ce fichier gère la connexion avec les bases de données Notion pour les leads

const LeadsNotion = {
    // Configuration
    DB_IDS: {
        LEADS: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
        CONTACTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
        SOURCES: '236adb95-3c6f-8079-a142-d8b547321489'
    },
    
    // État local
    allLeads: [],
    currentFilter: 'all',
    currentSort: 'recent',
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la gestion des leads avec Notion');
        this.loadLeads();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Filtres par statut
        document.querySelectorAll('[data-filter-status]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByStatus(e.target.dataset.filterStatus);
            });
        });
        
        // Tri
        const sortSelect = document.getElementById('sort-leads');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortLeads(e.target.value);
            });
        }
        
        // Recherche
        const searchInput = document.getElementById('search-leads');
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
        
        // Import leads
        const importBtn = document.getElementById('import-leads');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportModal());
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-leads');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadLeads());
        }
    },
    
    // Charger les leads depuis Notion
    async loadLeads() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les leads
            const canViewLeads = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'leads',
                'view.own'
            );
            
            if (!canViewLeads) {
                window.showNotification('Vous n\'avez pas accès aux leads', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les leads avec le middleware sécurisé
            const leads = await window.PermissionsMiddleware.secureApiCall(
                'leads',
                'view',
                this.getRevendeurLeads.bind(this),
                currentUser.id
            );
            
            // Enrichir les données des leads
            const enrichedLeads = this.enrichLeadsData(leads);
            
            // Stocker les leads
            this.allLeads = enrichedLeads;
            
            // Mettre à jour l'interface
            this.updateLeadsView(enrichedLeads);
            this.updateLeadsStats(enrichedLeads);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'leads', true, {
                leadCount: leads.length,
                revendeurId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des leads:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'leads', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les leads du revendeur (stub)
    async getRevendeurLeads(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'lead1',
                nom: 'Innovation Tech SA',
                contact: 'Marc Dubois',
                email: 'marc@innovationtech.ch',
                telephone: '+41 22 789 45 12',
                entreprise: 'Innovation Tech SA',
                poste: 'CTO',
                source: 'Site web',
                statut: 'Nouveau',
                score: 85,
                valeurEstimee: 75000,
                probabilite: 25,
                secteur: 'Technologie',
                taille: 'PME',
                besoin: 'Modernisation infrastructure IT',
                dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                dernierContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                prochaineAction: 'Appel de qualification',
                notes: 'Intéressé par nos solutions cloud. Budget confirmé.',
                tags: ['Cloud', 'Infrastructure', 'PME']
            },
            {
                id: 'lead2',
                nom: 'RetailPlus',
                contact: 'Sarah Martin',
                email: 'sarah.martin@retailplus.ch',
                telephone: '+41 21 456 78 90',
                entreprise: 'RetailPlus',
                poste: 'Directrice Digital',
                source: 'LinkedIn',
                statut: 'Qualification',
                score: 72,
                valeurEstimee: 45000,
                probabilite: 40,
                secteur: 'Retail',
                taille: 'Grande entreprise',
                besoin: 'E-commerce mobile',
                dateCreation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                dernierContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                prochaineAction: 'Démo produit',
                notes: 'Recherche une solution mobile-first pour leur e-commerce.',
                tags: ['E-commerce', 'Mobile', 'Retail']
            },
            {
                id: 'lead3',
                nom: 'FinanceSwiss',
                contact: 'Jean Leroy',
                email: 'j.leroy@financeswiss.ch',
                telephone: '+41 31 987 65 43',
                entreprise: 'FinanceSwiss',
                poste: 'Head of IT',
                source: 'Référence',
                statut: 'Proposition',
                score: 91,
                valeurEstimee: 120000,
                probabilite: 75,
                secteur: 'Finance',
                taille: 'Grande entreprise',
                besoin: 'Solution de trading automatisé',
                dateCreation: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                dernierContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                prochaineAction: 'Négociation contrat',
                notes: 'Très intéressé. Budget approuvé. Attente validation finale board.',
                tags: ['Finance', 'Trading', 'Automatisation']
            }
        ];
    },
    
    // Enrichir les données des leads
    enrichLeadsData(leads) {
        return leads.map(lead => ({
            ...lead,
            formattedDateCreation: this.formatDate(lead.dateCreation),
            formattedDernierContact: this.formatDate(lead.dernierContact),
            daysSinceCreation: this.calculateDaysSince(lead.dateCreation),
            daysSinceContact: this.calculateDaysSince(lead.dernierContact),
            scoreColor: this.getScoreColor(lead.score),
            statusColor: this.getStatusColor(lead.statut),
            isHot: lead.score >= 80,
            isStale: this.calculateDaysSince(lead.dernierContact) > 14,
            priority: this.calculatePriority(lead)
        }));
    },
    
    // Mettre à jour la vue des leads
    updateLeadsView(leads) {
        const container = document.getElementById('leads-container');
        if (!container) return;
        
        if (leads.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-target-off fs-1 text-muted mb-3"></i>
                            <h3 class="text-muted">Aucun lead trouvé</h3>
                            <p class="text-muted">Commencez par importer ou créer vos premiers leads</p>
                            <div class="btn-list mt-3">
                                <button class="btn btn-primary" onclick="LeadsNotion.showNewLeadModal()">
                                    <i class="ti ti-plus"></i> Nouveau lead
                                </button>
                                <button class="btn btn-secondary" onclick="LeadsNotion.showImportModal()">
                                    <i class="ti ti-upload"></i> Importer leads
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = leads.map(lead => `
            <div class="col-12 col-md-6 col-lg-4 lead-item" 
                 data-status="${lead.statut}"
                 data-score="${lead.score}"
                 data-priority="${lead.priority}">
                <div class="card ${lead.isHot ? 'border-danger' : lead.isStale ? 'border-warning' : ''}">
                    ${lead.isHot ? '<div class="ribbon ribbon-top bg-red"><i class="ti ti-flame"></i></div>' : ''}
                    <div class="card-status-top ${lead.statusColor}"></div>
                    
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="avatar avatar-md ${lead.scoreColor}-lt me-3">
                                <div class="fw-bold">${lead.score}</div>
                            </div>
                            <div class="flex-fill">
                                <h3 class="card-title mb-1">
                                    <a href="#" onclick="LeadsNotion.viewLead('${lead.id}'); return false;">
                                        ${lead.nom}
                                    </a>
                                </h3>
                                <div class="text-muted">${lead.contact}</div>
                                <div class="text-muted small">${lead.poste} • ${lead.secteur}</div>
                            </div>
                            <div class="text-end">
                                <span class="badge ${lead.statusColor}">${lead.statut}</span>
                                ${lead.isStale ? '<div class="text-warning small mt-1">Inactif</div>' : ''}
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="text-muted small mb-1">Valeur estimée</div>
                            <div class="h4 mb-0">${window.NotionConnector.utils.formatCurrency(lead.valeurEstimee)}</div>
                            <div class="text-muted small">Probabilité: ${lead.probabilite}%</div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Score</span>
                                <span class="text-muted">${lead.score}/100</span>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar ${lead.scoreColor}" 
                                     style="width: ${lead.score}%" 
                                     role="progressbar">
                                    <span class="visually-hidden">${lead.score}% Score</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row g-2 align-items-center text-muted small mb-3">
                            <div class="col-auto">
                                <i class="ti ti-calendar"></i>
                                Créé ${lead.formattedDateCreation}
                            </div>
                            <div class="col-auto">
                                <i class="ti ti-message"></i>
                                Contact ${lead.formattedDernierContact}
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="text-muted small">Prochaine action:</div>
                            <div class="fw-medium">${lead.prochaineAction}</div>
                        </div>
                        
                        ${lead.tags && lead.tags.length > 0 ? `
                            <div class="mb-3">
                                ${lead.tags.slice(0, 3).map(tag => `
                                    <span class="badge badge-outline me-1">${tag}</span>
                                `).join('')}
                                ${lead.tags.length > 3 ? `<span class="text-muted small">+${lead.tags.length - 3}</span>` : ''}
                            </div>
                        ` : ''}
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm flex-fill" 
                                    onclick="LeadsNotion.contactLead('${lead.id}')">
                                <i class="ti ti-phone"></i> Contacter
                            </button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="LeadsNotion.convertLead('${lead.id}')"
                                    data-bs-toggle="tooltip" 
                                    title="Convertir">
                                <i class="ti ti-check"></i>
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-ghost-secondary" 
                                        data-bs-toggle="dropdown">
                                    <i class="ti ti-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item" href="#" 
                                           onclick="LeadsNotion.editLead('${lead.id}'); return false;">
                                            <i class="ti ti-edit me-2"></i>
                                            Modifier
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" 
                                           onclick="LeadsNotion.addNote('${lead.id}'); return false;">
                                            <i class="ti ti-note me-2"></i>
                                            Ajouter note
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#" 
                                           onclick="LeadsNotion.deleteLead('${lead.id}'); return false;">
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
    
    // Mettre à jour les statistiques
    updateLeadsStats(leads) {
        const stats = {
            total: leads.length,
            hot: leads.filter(l => l.isHot).length,
            stale: leads.filter(l => l.isStale).length,
            totalValue: leads.reduce((sum, l) => sum + (l.valeurEstimee || 0), 0),
            weightedValue: leads.reduce((sum, l) => sum + ((l.valeurEstimee || 0) * (l.probabilite || 0) / 100), 0),
            avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
            conversionRate: this.calculateConversionRate(leads)
        };
        
        // Mettre à jour les KPIs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number' && id.includes('value')) {
                    element.textContent = window.NotionConnector.utils.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        };
        
        updateStat('total-leads', stats.total);
        updateStat('hot-leads', stats.hot);
        updateStat('stale-leads', stats.stale);
        updateStat('total-pipeline-value', stats.totalValue);
        updateStat('weighted-pipeline-value', stats.weightedValue);
        updateStat('avg-lead-score', stats.avgScore);
        updateStat('conversion-rate', stats.conversionRate + '%');
    },
    
    // Actions sur les leads
    async contactLead(leadId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // TODO: Implémenter l'interface de contact
            window.showNotification('Interface de contact à venir', 'info');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('contact', 'leads', true, {
                leadId: leadId
            });
            
        } catch (error) {
            console.error('Erreur contact lead:', error);
        }
    },
    
    async convertLead(leadId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour convertir
            const canConvert = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'leads',
                'convert'
            );
            
            if (!canConvert) {
                window.showNotification('Vous n\'avez pas le droit de convertir ce lead', 'error');
                return;
            }
            
            if (!confirm('Convertir ce lead en client ?')) {
                return;
            }
            
            // TODO: Implémenter la conversion
            window.showNotification('Lead converti avec succès', 'success');
            await this.loadLeads();
            
        } catch (error) {
            console.error('Erreur conversion lead:', error);
        }
    },
    
    async showNewLeadModal() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des leads
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'leads',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des leads', 'error');
                return;
            }
            
            // TODO: Implémenter le modal de création
            console.log('Nouveau lead');
            
        } catch (error) {
            console.error('Erreur nouveau lead:', error);
        }
    },
    
    // Filtrer par statut
    filterByStatus(status) {
        this.currentFilter = status;
        
        // Mettre à jour l'UI des filtres
        document.querySelectorAll('[data-filter-status]').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.filterStatus === status);
        });
        
        // Filtrer les leads
        let filteredLeads = [...this.allLeads];
        
        if (status !== 'all') {
            const statusMap = {
                'hot': leads => leads.filter(l => l.isHot),
                'stale': leads => leads.filter(l => l.isStale),
                'nouveau': 'Nouveau',
                'qualification': 'Qualification',
                'proposition': 'Proposition'
            };
            
            if (typeof statusMap[status] === 'function') {
                filteredLeads = statusMap[status](filteredLeads);
            } else {
                filteredLeads = filteredLeads.filter(l => l.statut === statusMap[status]);
            }
        }
        
        this.updateLeadsView(filteredLeads);
    },
    
    // Fonctions utilitaires
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    },
    
    calculateDaysSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24));
    },
    
    getScoreColor(score) {
        if (score >= 80) return 'bg-success';
        if (score >= 60) return 'bg-warning';
        return 'bg-danger';
    },
    
    getStatusColor(statut) {
        const colors = {
            'Nouveau': 'bg-info',
            'Qualification': 'bg-warning',
            'Proposition': 'bg-primary',
            'Négociation': 'bg-orange',
            'Gagné': 'bg-success',
            'Perdu': 'bg-danger'
        };
        return colors[statut] || 'bg-secondary';
    },
    
    calculatePriority(lead) {
        let priority = 0;
        priority += lead.score * 0.4;
        priority += lead.probabilite * 0.3;
        priority += (lead.valeurEstimee / 1000) * 0.2;
        priority += lead.isHot ? 20 : 0;
        priority -= lead.isStale ? 15 : 0;
        
        if (priority >= 80) return 'high';
        if (priority >= 60) return 'medium';
        return 'low';
    },
    
    calculateConversionRate(leads) {
        const converted = leads.filter(l => l.statut === 'Gagné').length;
        return leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('leads-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des leads...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateLeadsView
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des leads', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('leads.html')) {
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                LeadsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.LeadsNotion = LeadsNotion;