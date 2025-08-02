// clients-notion.js - Intégration Notion pour la gestion des clients revendeur
// Ce fichier gère la connexion avec les bases de données Notion pour les clients

const ClientsNotion = {
    // Configuration
    DB_IDS: {
        CLIENTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
        CONTACTS: '236adb95-3c6f-8079-a142-d8b547321489',
        VENTES: '236adb95-3c6f-8018-b3ba-fa5c85c9e9e6'
    },
    
    // État local
    allClients: [],
    currentFilter: 'all',
    currentSort: 'recent',
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la gestion clients avec Notion');
        this.loadClients();
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
        const sortSelect = document.getElementById('sort-clients');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortClients(e.target.value);
            });
        }
        
        // Recherche
        const searchInput = document.getElementById('search-clients');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchClients(e.target.value);
            });
        }
        
        // Bouton nouveau client
        const newClientBtn = document.getElementById('new-client-btn');
        if (newClientBtn) {
            newClientBtn.addEventListener('click', () => this.showNewClientModal());
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-clients');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadClients());
        }
        
        // Export
        const exportBtn = document.getElementById('export-clients');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportClients());
        }
    },
    
    // Charger les clients depuis Notion
    async loadClients() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les clients
            const canViewClients = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'clients',
                'view.own'
            );
            
            if (!canViewClients) {
                window.showNotification('Vous n\'avez pas accès aux clients', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les clients avec le middleware sécurisé
            const clients = await window.PermissionsMiddleware.secureApiCall(
                'clients',
                'view',
                this.getRevendeurClients.bind(this),
                currentUser.id
            );
            
            // Enrichir les données des clients
            const enrichedClients = await this.enrichClientsData(clients);
            
            // Stocker les clients
            this.allClients = enrichedClients;
            
            // Mettre à jour l'interface
            this.updateClientsView(enrichedClients);
            this.updateClientsStats(enrichedClients);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'clients.list', true, {
                clientCount: clients.length,
                revendeurId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des clients:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'clients.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les clients du revendeur (stub)
    async getRevendeurClients(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        // Pour l'instant, on simule avec des données de démo
        return [
            {
                id: 'client1',
                name: 'TechCorp SA',
                contact: 'Marie Dubois',
                email: 'marie.dubois@techcorp.ch',
                phone: '+41 22 123 45 67',
                address: 'Route de la Tech 15, 1202 Genève',
                industry: 'Technologie',
                size: 'Grande entreprise',
                status: 'Actif',
                since: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 6 mois
                lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 semaine
                totalRevenue: 125000,
                currentProjects: 3,
                completedProjects: 8,
                satisfaction: 4.8,
                potentialValue: 85000,
                tags: ['VIP', 'Récurrent', 'Tech'],
                notes: 'Client principal dans le secteur tech. Très satisfait de nos services.'
            },
            {
                id: 'client2',
                name: 'StartupFood',
                contact: 'Jean Martin',
                email: 'jean@startupfood.com',
                phone: '+41 21 987 65 43',
                address: 'Av. de l\'Innovation 8, 1015 Lausanne',
                industry: 'Food & Beverage',
                size: 'Startup',
                status: 'Prospect chaud',
                since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 mois
                lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
                totalRevenue: 0,
                currentProjects: 1,
                completedProjects: 0,
                satisfaction: null,
                potentialValue: 45000,
                tags: ['Startup', 'Innovation', 'Food'],
                notes: 'Startup prometteuse avec un fort potentiel de croissance.'
            },
            {
                id: 'client3',
                name: 'DesignStudio',
                contact: 'Sophie Laurent',
                email: 'sophie@designstudio.ch',
                phone: '+41 26 456 78 90',
                address: 'Rue du Design 3, 1700 Fribourg',
                industry: 'Design & Communication',
                size: 'PME',
                status: 'Actif',
                since: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 an
                lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 semaines
                totalRevenue: 78000,
                currentProjects: 2,
                completedProjects: 12,
                satisfaction: 4.5,
                potentialValue: 30000,
                tags: ['Design', 'Créatif', 'PME'],
                notes: 'Collaboration très fluide. Apprécie notre approche créative.'
            },
            {
                id: 'client4',
                name: 'MobileBanking Corp',
                contact: 'Pierre Leroy',
                email: 'pierre.leroy@mobilebanking.ch',
                phone: '+41 31 321 54 76',
                address: 'Banking Street 20, 3000 Berne',
                industry: 'Finance',
                size: 'Grande entreprise',
                status: 'En négociation',
                since: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 mois
                lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Hier
                totalRevenue: 15000,
                currentProjects: 0,
                completedProjects: 1,
                satisfaction: 4.2,
                potentialValue: 150000,
                tags: ['Finance', 'Banking', 'Compliance'],
                notes: 'Projet pilote réussi. En discussion pour un contrat cadre important.'
            }
        ];
    },
    
    // Enrichir les données des clients
    async enrichClientsData(clients) {
        return clients.map(client => ({
            ...client,
            formattedSince: this.formatDate(client.since),
            formattedLastContact: this.formatDate(client.lastContact),
            daysSinceLastContact: this.calculateDaysSince(client.lastContact),
            statusColor: this.getStatusColor(client.status),
            sizeIcon: this.getSizeIcon(client.size),
            isVip: client.tags?.includes('VIP') || client.totalRevenue > 100000,
            isRecentContact: this.calculateDaysSince(client.lastContact) <= 7,
            healthScore: this.calculateHealthScore(client)
        }));
    },
    
    // Mettre à jour la vue des clients
    updateClientsView(clients) {
        const container = document.getElementById('clients-container');
        if (!container) return;
        
        if (clients.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-users-off fs-1 text-muted mb-3"></i>
                            <h3 class="text-muted">Aucun client trouvé</h3>
                            <p class="text-muted">Commencez par ajouter vos premiers clients</p>
                            <button class="btn btn-primary mt-2" onclick="ClientsNotion.showNewClientModal()">
                                <i class="ti ti-plus"></i> Ajouter un client
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = clients.map(client => `
            <div class="col-12 col-md-6 col-lg-4 client-item" 
                 data-status="${client.status}"
                 data-industry="${client.industry}">
                <div class="card ${client.isVip ? 'border-warning' : ''}">
                    ${client.isVip ? '<div class="ribbon ribbon-top bg-yellow"><i class="ti ti-crown"></i></div>' : ''}
                    <div class="card-status-top ${client.statusColor}"></div>
                    
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="avatar avatar-md ${client.statusColor}-lt me-3">
                                <i class="ti ${client.sizeIcon}"></i>
                            </div>
                            <div class="flex-fill">
                                <h3 class="card-title mb-1">
                                    <a href="client-detail.html?id=${client.id}" class="text-reset">
                                        ${client.name}
                                    </a>
                                </h3>
                                <div class="text-muted">${client.contact}</div>
                                <div class="text-muted small">${client.industry}</div>
                            </div>
                            <div class="text-end">
                                <span class="badge ${client.statusColor}">${client.status}</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="row g-2 text-muted small">
                                <div class="col-6">
                                    <i class="ti ti-calendar me-1"></i>
                                    Client depuis ${client.formattedSince}
                                </div>
                                <div class="col-6">
                                    <i class="ti ti-message me-1"></i>
                                    Contact: ${client.formattedLastContact}
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Santé client</span>
                                <span class="text-muted">${client.healthScore}/100</span>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar ${this.getHealthColor(client.healthScore)}" 
                                     style="width: ${client.healthScore}%" 
                                     role="progressbar">
                                    <span class="visually-hidden">${client.healthScore}% Health</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row g-2 align-items-center text-muted small mb-3">
                            <div class="col-auto">
                                <i class="ti ti-currency-dollar"></i>
                                CA: ${window.NotionConnector.utils.formatCurrency(client.totalRevenue)}
                            </div>
                            <div class="col-auto">
                                <i class="ti ti-folder"></i>
                                ${client.currentProjects} projets actifs
                            </div>
                            ${client.satisfaction ? `
                                <div class="col-auto">
                                    <i class="ti ti-star-filled text-yellow"></i>
                                    ${client.satisfaction}/5
                                </div>
                            ` : ''}
                        </div>
                        
                        ${client.tags && client.tags.length > 0 ? `
                            <div class="mb-3">
                                ${client.tags.slice(0, 3).map(tag => `
                                    <span class="badge badge-outline me-1">${tag}</span>
                                `).join('')}
                                ${client.tags.length > 3 ? `<span class="text-muted small">+${client.tags.length - 3}</span>` : ''}
                            </div>
                        ` : ''}
                        
                        <div class="d-flex gap-2">
                            <a href="client-detail.html?id=${client.id}" 
                               class="btn btn-primary btn-sm flex-fill">
                                <i class="ti ti-eye"></i> Voir détails
                            </a>
                            <button class="btn btn-success btn-sm" 
                                    onclick="ClientsNotion.contactClient('${client.id}')"
                                    data-bs-toggle="tooltip" 
                                    title="Contacter">
                                <i class="ti ti-phone"></i>
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-ghost-secondary" 
                                        data-bs-toggle="dropdown">
                                    <i class="ti ti-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item" href="#" 
                                           onclick="ClientsNotion.editClient('${client.id}'); return false;">
                                            <i class="ti ti-edit me-2"></i>
                                            Modifier
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" 
                                           onclick="ClientsNotion.addNote('${client.id}'); return false;">
                                            <i class="ti ti-note me-2"></i>
                                            Ajouter note
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#" 
                                           onclick="ClientsNotion.archiveClient('${client.id}'); return false;">
                                            <i class="ti ti-archive me-2"></i>
                                            Archiver
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Réinitialiser les tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Mettre à jour les statistiques
    updateClientsStats(clients) {
        const stats = {
            total: clients.length,
            active: clients.filter(c => c.status === 'Actif').length,
            prospects: clients.filter(c => c.status === 'Prospect chaud' || c.status === 'En négociation').length,
            totalRevenue: clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0),
            avgSatisfaction: this.calculateAverageSatisfaction(clients),
            potentialValue: clients.reduce((sum, c) => sum + (c.potentialValue || 0), 0),
            recentContacts: clients.filter(c => c.isRecentContact).length
        };
        
        // Mettre à jour les compteurs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number' && id.includes('revenue')) {
                    element.textContent = window.NotionConnector.utils.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        };
        
        updateStat('total-clients', stats.total);
        updateStat('active-clients', stats.active);
        updateStat('prospect-clients', stats.prospects);
        updateStat('total-revenue', stats.totalRevenue);
        updateStat('avg-satisfaction', stats.avgSatisfaction + '/5');
        updateStat('potential-value', stats.potentialValue);
        updateStat('recent-contacts', stats.recentContacts);
        
        // Mettre à jour les badges de filtre
        document.querySelectorAll('[data-filter-count]').forEach(badge => {
            const filter = badge.dataset.filterCount;
            if (filter === 'all') badge.textContent = stats.total;
            else if (filter === 'active') badge.textContent = stats.active;
            else if (filter === 'prospects') badge.textContent = stats.prospects;
        });
    },
    
    // Filtrer par statut
    filterByStatus(status) {
        this.currentFilter = status;
        
        // Mettre à jour l'UI des filtres
        document.querySelectorAll('[data-filter-status]').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.filterStatus === status);
        });
        
        // Filtrer les clients
        let filteredClients = [...this.allClients];
        
        if (status !== 'all') {
            const statusMap = {
                'active': 'Actif',
                'prospects': ['Prospect chaud', 'En négociation'],
                'inactive': 'Inactif'
            };
            
            if (Array.isArray(statusMap[status])) {
                filteredClients = filteredClients.filter(c => 
                    statusMap[status].includes(c.status)
                );
            } else {
                filteredClients = filteredClients.filter(c => 
                    c.status === statusMap[status]
                );
            }
        }
        
        // Appliquer le tri actuel
        this.applySorting(filteredClients);
        
        // Mettre à jour la vue
        this.updateClientsView(filteredClients);
    },
    
    // Trier les clients
    sortClients(sortBy) {
        this.currentSort = sortBy;
        
        const currentClients = this.getCurrentFilteredClients();
        this.applySorting(currentClients);
        this.updateClientsView(currentClients);
    },
    
    // Appliquer le tri
    applySorting(clients) {
        clients.sort((a, b) => {
            switch (this.currentSort) {
                case 'recent':
                    return new Date(b.lastContact) - new Date(a.lastContact);
                    
                case 'name':
                    return a.name.localeCompare(b.name);
                    
                case 'revenue':
                    return b.totalRevenue - a.totalRevenue;
                    
                case 'satisfaction':
                    return (b.satisfaction || 0) - (a.satisfaction || 0);
                    
                case 'potential':
                    return b.potentialValue - a.potentialValue;
                    
                default:
                    return 0;
            }
        });
    },
    
    // Rechercher dans les clients
    searchClients(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterByStatus(this.currentFilter);
            return;
        }
        
        const filteredClients = this.allClients.filter(client => 
            client.name.toLowerCase().includes(searchTerm) ||
            client.contact.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm) ||
            client.industry.toLowerCase().includes(searchTerm) ||
            client.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        this.updateClientsView(filteredClients);
    },
    
    // Actions sur les clients
    async contactClient(clientId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour contacter
            const canContact = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'clients',
                'contact'
            );
            
            if (!canContact) {
                window.showNotification('Vous n\'avez pas le droit de contacter ce client', 'error');
                return;
            }
            
            // TODO: Implémenter l'interface de contact
            window.showNotification('Interface de contact à venir', 'info');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('contact', 'clients', true, {
                clientId: clientId
            });
            
        } catch (error) {
            console.error('Erreur contact client:', error);
        }
    },
    
    async editClient(clientId) {
        // TODO: Implémenter l'édition
        console.log('Édition client:', clientId);
    },
    
    async addNote(clientId) {
        // TODO: Implémenter l'ajout de note
        console.log('Ajout note client:', clientId);
    },
    
    async archiveClient(clientId) {
        if (confirm('Êtes-vous sûr de vouloir archiver ce client ?')) {
            // TODO: Implémenter l'archivage
            window.showNotification('Client archivé', 'success');
            await this.loadClients();
        }
    },
    
    async showNewClientModal() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des clients
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'clients',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des clients', 'error');
                return;
            }
            
            // TODO: Implémenter le modal de création
            console.log('Nouveau client');
            
        } catch (error) {
            console.error('Erreur nouveau client:', error);
        }
    },
    
    async exportClients() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour exporter
            const canExport = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'clients',
                'export'
            );
            
            if (!canExport) {
                window.showNotification('Vous n\'avez pas le droit d\'exporter les clients', 'error');
                return;
            }
            
            window.showNotification('Export en cours...', 'info');
            
            // TODO: Implémenter l'export réel
            
        } catch (error) {
            console.error('Erreur export clients:', error);
        }
    },
    
    // Récupérer les clients filtrés actuels
    getCurrentFilteredClients() {
        if (this.currentFilter === 'all') {
            return [...this.allClients];
        }
        
        const statusMap = {
            'active': 'Actif',
            'prospects': ['Prospect chaud', 'En négociation'],
            'inactive': 'Inactif'
        };
        
        if (Array.isArray(statusMap[this.currentFilter])) {
            return this.allClients.filter(c => 
                statusMap[this.currentFilter].includes(c.status)
            );
        }
        
        return this.allClients.filter(c => 
            c.status === statusMap[this.currentFilter]
        );
    },
    
    // Fonctions utilitaires
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
        
        return date.toLocaleDateString('fr-FR', { 
            month: 'short', 
            year: 'numeric'
        });
    },
    
    calculateDaysSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    
    getStatusColor(status) {
        const colors = {
            'Actif': 'bg-success',
            'Prospect chaud': 'bg-warning',
            'En négociation': 'bg-primary',
            'Inactif': 'bg-secondary'
        };
        return colors[status] || 'bg-secondary';
    },
    
    getSizeIcon(size) {
        const icons = {
            'Startup': 'ti-rocket',
            'PME': 'ti-building',
            'Grande entreprise': 'ti-buildings'
        };
        return icons[size] || 'ti-building';
    },
    
    calculateHealthScore(client) {
        let score = 50; // Base
        
        // Facteur satisfaction
        if (client.satisfaction) {
            score += (client.satisfaction - 3) * 10; // +/-20 points
        }
        
        // Facteur contact récent
        const daysSinceContact = this.calculateDaysSince(client.lastContact);
        if (daysSinceContact <= 7) score += 20;
        else if (daysSinceContact <= 30) score += 10;
        else if (daysSinceContact > 90) score -= 20;
        
        // Facteur projets actifs
        if (client.currentProjects > 0) score += 15;
        
        // Facteur revenus
        if (client.totalRevenue > 50000) score += 15;
        
        return Math.max(0, Math.min(100, score));
    },
    
    getHealthColor(score) {
        if (score >= 80) return 'bg-success';
        if (score >= 60) return 'bg-warning';
        return 'bg-danger';
    },
    
    calculateAverageSatisfaction(clients) {
        const satisfiedClients = clients.filter(c => c.satisfaction !== null);
        if (satisfiedClients.length === 0) return 0;
        
        const total = satisfiedClients.reduce((sum, c) => sum + c.satisfaction, 0);
        return Math.round((total / satisfiedClients.length) * 10) / 10;
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('clients-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des clients...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateClientsView
    },
    
    showErrorState() {
        const container = document.getElementById('clients-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                            <h3 class="text-danger">Erreur de chargement</h3>
                            <p class="text-muted">Impossible de charger les clients</p>
                            <button class="btn btn-primary mt-2" onclick="ClientsNotion.loadClients()">
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des clients', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des clients
    if (window.location.pathname.includes('clients.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                ClientsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.ClientsNotion = ClientsNotion;