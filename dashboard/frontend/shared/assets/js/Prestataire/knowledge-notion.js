// knowledge-notion.js - Intégration Notion pour la base de connaissances prestataire
// Ce fichier gère la connexion avec les bases de données Notion pour les articles

const KnowledgeNotion = {
    // Configuration
    DB_IDS: {
        ARTICLES: '236adb95-3c6f-8024-94b1-ef0928d5c8a9',
        CATEGORIES: '236adb95-3c6f-8079-a142-d8b547321489'
    },
    
    // État local
    allArticles: [],
    allCategories: [],
    currentFilter: 'all',
    currentSort: 'recent',
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la base de connaissances avec Notion');
        this.loadKnowledgeBase();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Recherche
        const searchInput = document.getElementById('search-knowledge');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchArticles(e.target.value);
            });
        }
        
        // Filtres par catégorie
        document.querySelectorAll('[data-filter-category]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(e.target.dataset.filterCategory);
            });
        });
        
        // Tri
        const sortSelect = document.getElementById('sort-articles');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortArticles(e.target.value);
            });
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-knowledge');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadKnowledgeBase());
        }
        
        // Bouton créer article
        const newArticleBtn = document.getElementById('new-article-btn');
        if (newArticleBtn) {
            newArticleBtn.addEventListener('click', () => this.showNewArticleModal());
        }
    },
    
    // Charger la base de connaissances depuis Notion
    async loadKnowledgeBase() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir la base de connaissances
            const canViewKnowledge = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'knowledge',
                'view'
            );
            
            if (!canViewKnowledge) {
                window.showNotification('Vous n\'avez pas accès à la base de connaissances', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Charger articles et catégories en parallèle avec permissions
            const [articles, categories] = await Promise.all([
                window.PermissionsMiddleware.secureApiCall(
                    'knowledge',
                    'view',
                    this.getKnowledgeArticles.bind(this),
                    currentUser.id
                ),
                window.PermissionsMiddleware.secureApiCall(
                    'knowledge',
                    'view',
                    this.getKnowledgeCategories.bind(this),
                    currentUser.id
                )
            ]);
            
            // Enrichir les articles
            const enrichedArticles = this.enrichArticlesData(articles, categories);
            
            // Stocker les données
            this.allArticles = enrichedArticles;
            this.allCategories = categories;
            
            // Mettre à jour l'interface
            this.updateArticlesView(enrichedArticles);
            this.updateCategoriesView(categories);
            this.updateKnowledgeStats(enrichedArticles);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'knowledge.list', true, {
                articleCount: articles.length,
                categoryCount: categories.length
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement de la base de connaissances:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'knowledge.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les articles (stub)
    async getKnowledgeArticles(userId) {
        // TODO: Implémenter la vraie requête Notion
        // Pour l'instant, on simule avec des données de démo
        return [
            {
                id: 'kb1',
                title: 'Guide de développement API REST',
                excerpt: 'Bonnes pratiques pour développer des APIs REST robustes et sécurisées...',
                content: 'Ce guide couvre les principales bonnes pratiques pour développer des APIs REST...',
                categoryId: 'cat1',
                categoryName: 'Développement',
                categoryColor: 'blue',
                author: 'Expert Technique',
                authorId: 'expert1',
                createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                readTime: 8,
                difficulty: 'Intermédiaire',
                tags: ['API', 'REST', 'Backend', 'Sécurité'],
                views: 156,
                likes: 23,
                bookmarks: 12,
                status: 'published',
                featured: true
            },
            {
                id: 'kb2',
                title: 'Optimisation des performances React',
                excerpt: 'Techniques avancées pour optimiser les performances de vos applications React...',
                content: 'Dans cet article, nous allons explorer les différentes techniques...',
                categoryId: 'cat1',
                categoryName: 'Développement',
                categoryColor: 'blue',
                author: 'React Expert',
                authorId: 'expert2',
                createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                readTime: 12,
                difficulty: 'Avancé',
                tags: ['React', 'Performance', 'Frontend', 'Optimisation'],
                views: 89,
                likes: 34,
                bookmarks: 18,
                status: 'published',
                featured: false
            },
            {
                id: 'kb3',
                title: 'Gestion de projet Agile',
                excerpt: 'Méthodologies et outils pour une gestion de projet agile efficace...',
                content: 'La méthodologie Agile révolutionne la gestion de projet...',
                categoryId: 'cat2',
                categoryName: 'Gestion de projet',
                categoryColor: 'green',
                author: 'Chef de projet',
                authorId: 'expert3',
                createdDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                readTime: 6,
                difficulty: 'Débutant',
                tags: ['Agile', 'Scrum', 'Management', 'Projet'],
                views: 203,
                likes: 45,
                bookmarks: 28,
                status: 'published',
                featured: true
            },
            {
                id: 'kb4',
                title: 'Sécurité des applications web',
                excerpt: 'Principales vulnérabilités et mesures de protection pour sécuriser vos applications...',
                content: 'La sécurité des applications web est cruciale...',
                categoryId: 'cat3',
                categoryName: 'Sécurité',
                categoryColor: 'red',
                author: 'Security Expert',
                authorId: 'expert4',
                createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                readTime: 15,
                difficulty: 'Avancé',
                tags: ['Sécurité', 'OWASP', 'Web', 'Cybersécurité'],
                views: 267,
                likes: 67,
                bookmarks: 42,
                status: 'published',
                featured: false
            }
        ];
    },
    
    // Récupérer les catégories (stub)
    async getKnowledgeCategories(userId) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'cat1',
                name: 'Développement',
                description: 'Articles sur les technologies et pratiques de développement',
                color: 'blue',
                icon: 'ti-code',
                articleCount: 15
            },
            {
                id: 'cat2',
                name: 'Gestion de projet',
                description: 'Méthodologies et outils de gestion de projet',
                color: 'green',
                icon: 'ti-checklist',
                articleCount: 8
            },
            {
                id: 'cat3',
                name: 'Sécurité',
                description: 'Sécurité informatique et cybersécurité',
                color: 'red',
                icon: 'ti-shield',
                articleCount: 6
            },
            {
                id: 'cat4',
                name: 'Design & UX',
                description: 'Design interface et expérience utilisateur',
                color: 'purple',
                icon: 'ti-palette',
                articleCount: 12
            }
        ];
    },
    
    // Enrichir les données des articles
    enrichArticlesData(articles, categories) {
        return articles.map(article => ({
            ...article,
            isRecent: this.isRecentArticle(article.createdDate),
            formattedCreatedDate: this.formatDate(article.createdDate),
            formattedUpdatedDate: this.formatDate(article.updatedDate),
            difficultyColor: this.getDifficultyColor(article.difficulty),
            engagementScore: this.calculateEngagementScore(article)
        }));
    },
    
    // Mettre à jour la vue des articles
    updateArticlesView(articles) {
        const container = document.getElementById('articles-container');
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-book-off fs-1 text-muted mb-3"></i>
                            <h3 class="text-muted">Aucun article trouvé</h3>
                            <p class="text-muted">Aucun article ne correspond à votre recherche</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = articles.map(article => `
            <div class="col-md-6 col-lg-4 article-item" 
                 data-category="${article.categoryId}"
                 data-difficulty="${article.difficulty}">
                <div class="card ${article.featured ? 'card-featured' : ''}">
                    ${article.featured ? '<div class="ribbon ribbon-top bg-yellow"><i class="ti ti-star"></i></div>' : ''}
                    ${article.isRecent ? '<div class="card-status-top bg-success"></div>' : ''}
                    
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <span class="badge bg-${article.categoryColor}-lt me-2">
                                ${article.categoryName}
                            </span>
                            <span class="badge ${article.difficultyColor} me-auto">
                                ${article.difficulty}
                            </span>
                            ${article.isRecent ? '<span class="badge badge-success">Nouveau</span>' : ''}
                        </div>
                        
                        <h3 class="card-title mb-2">
                            <a href="knowledge-article.html?id=${article.id}" class="text-reset">
                                ${article.title}
                            </a>
                        </h3>
                        
                        <p class="text-muted mb-3">${article.excerpt}</p>
                        
                        <div class="mb-3">
                            ${article.tags.slice(0, 3).map(tag => `
                                <span class="badge badge-outline me-1">${tag}</span>
                            `).join('')}
                            ${article.tags.length > 3 ? `<span class="text-muted small">+${article.tags.length - 3}</span>` : ''}
                        </div>
                        
                        <div class="row g-2 align-items-center text-muted small mb-3">
                            <div class="col-auto">
                                <i class="ti ti-clock"></i>
                                ${article.readTime} min
                            </div>
                            <div class="col-auto">
                                <i class="ti ti-eye"></i>
                                ${article.views}
                            </div>
                            <div class="col-auto">
                                <i class="ti ti-heart"></i>
                                ${article.likes}
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="text-muted small">
                                Par ${article.author}<br>
                                ${article.formattedCreatedDate}
                            </div>
                            <div class="btn-list">
                                <button class="btn btn-sm btn-ghost-secondary" 
                                        onclick="KnowledgeNotion.bookmarkArticle('${article.id}')"
                                        data-bs-toggle="tooltip" 
                                        title="Ajouter aux favoris">
                                    <i class="ti ti-bookmark"></i>
                                </button>
                                <button class="btn btn-sm btn-ghost-secondary" 
                                        onclick="KnowledgeNotion.shareArticle('${article.id}')"
                                        data-bs-toggle="tooltip" 
                                        title="Partager">
                                    <i class="ti ti-share"></i>
                                </button>
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
    
    // Mettre à jour la vue des catégories
    updateCategoriesView(categories) {
        const container = document.getElementById('categories-sidebar');
        if (!container) return;
        
        container.innerHTML = `
            <div class="list-group list-group-flush">
                <a href="#" class="list-group-item list-group-item-action active" 
                   data-filter-category="all">
                    <div class="d-flex justify-content-between align-items-center">
                        <span><i class="ti ti-folder me-2"></i> Toutes les catégories</span>
                        <span class="badge badge-secondary">${this.allArticles.length}</span>
                    </div>
                </a>
                ${categories.map(category => `
                    <a href="#" class="list-group-item list-group-item-action" 
                       data-filter-category="${category.id}">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>
                                <i class="ti ${category.icon} me-2" style="color: var(--tblr-${category.color})"></i>
                                ${category.name}
                            </span>
                            <span class="badge bg-${category.color}-lt">${category.articleCount}</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    },
    
    // Mettre à jour les statistiques
    updateKnowledgeStats(articles) {
        const stats = {
            total: articles.length,
            recent: articles.filter(a => a.isRecent).length,
            featured: articles.filter(a => a.featured).length,
            totalViews: articles.reduce((sum, a) => sum + a.views, 0),
            totalLikes: articles.reduce((sum, a) => sum + a.likes, 0),
            avgReadTime: Math.round(articles.reduce((sum, a) => sum + a.readTime, 0) / articles.length)
        };
        
        // Mettre à jour les compteurs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('total-articles', stats.total);
        updateStat('recent-articles', stats.recent);
        updateStat('featured-articles', stats.featured);
        updateStat('total-views', stats.totalViews.toLocaleString());
        updateStat('total-likes', stats.totalLikes);
        updateStat('avg-read-time', `${stats.avgReadTime} min`);
    },
    
    // Filtrer par catégorie
    filterByCategory(categoryId) {
        this.currentFilter = categoryId;
        
        // Mettre à jour l'UI des filtres
        document.querySelectorAll('[data-filter-category]').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.filterCategory === categoryId);
        });
        
        // Filtrer les articles
        let filteredArticles = [...this.allArticles];
        
        if (categoryId !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.categoryId === categoryId
            );
        }
        
        // Appliquer le tri actuel
        this.applySorting(filteredArticles);
        
        // Mettre à jour la vue
        this.updateArticlesView(filteredArticles);
    },
    
    // Trier les articles
    sortArticles(sortBy) {
        this.currentSort = sortBy;
        
        // Récupérer les articles actuellement affichés
        const currentArticles = this.getCurrentFilteredArticles();
        
        // Appliquer le tri
        this.applySorting(currentArticles);
        
        // Mettre à jour la vue
        this.updateArticlesView(currentArticles);
    },
    
    // Appliquer le tri
    applySorting(articles) {
        articles.sort((a, b) => {
            switch (this.currentSort) {
                case 'recent':
                    return new Date(b.createdDate) - new Date(a.createdDate);
                    
                case 'updated':
                    return new Date(b.updatedDate) - new Date(a.updatedDate);
                    
                case 'popular':
                    return b.views - a.views;
                    
                case 'liked':
                    return b.likes - a.likes;
                    
                case 'title':
                    return a.title.localeCompare(b.title);
                    
                case 'readtime':
                    return a.readTime - b.readTime;
                    
                default:
                    return 0;
            }
        });
    },
    
    // Rechercher dans les articles
    searchArticles(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterByCategory(this.currentFilter);
            return;
        }
        
        const filteredArticles = this.allArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm) ||
            article.content.toLowerCase().includes(searchTerm) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            article.categoryName.toLowerCase().includes(searchTerm)
        );
        
        this.updateArticlesView(filteredArticles);
    },
    
    // Actions sur les articles
    async bookmarkArticle(articleId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des bookmarks
            const canBookmark = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'knowledge',
                'bookmark'
            );
            
            if (!canBookmark) {
                window.showNotification('Vous n\'avez pas le droit d\'ajouter des favoris', 'error');
                return;
            }
            
            // TODO: Implémenter l'ajout aux favoris dans Notion
            window.showNotification('Article ajouté aux favoris', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('bookmark', 'knowledge', true, {
                articleId: articleId
            });
            
        } catch (error) {
            console.error('Erreur bookmark article:', error);
            window.showNotification('Erreur lors de l\'ajout aux favoris', 'error');
        }
    },
    
    async shareArticle(articleId) {
        try {
            // Copier l'URL dans le clipboard
            const url = `${window.location.origin}/knowledge-article.html?id=${articleId}`;
            await navigator.clipboard.writeText(url);
            window.showNotification('Lien copié dans le presse-papiers', 'success');
            
            // Logger l'action
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (currentUser) {
                await window.PermissionsNotion.logAccess('share', 'knowledge', true, {
                    articleId: articleId
                });
            }
            
        } catch (error) {
            console.error('Erreur partage article:', error);
            window.showNotification('Erreur lors du partage', 'error');
        }
    },
    
    async showNewArticleModal() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des articles
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'knowledge',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des articles', 'error');
                return;
            }
            
            // TODO: Implémenter le modal de création d'article
            console.log('Nouvel article');
            
        } catch (error) {
            console.error('Erreur nouveau article:', error);
        }
    },
    
    // Récupérer les articles filtrés actuels
    getCurrentFilteredArticles() {
        if (this.currentFilter === 'all') {
            return [...this.allArticles];
        }
        
        return this.allArticles.filter(article => 
            article.categoryId === this.currentFilter
        );
    },
    
    // Fonctions utilitaires
    isRecentArticle(createdDate) {
        const date = new Date(createdDate);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 7; // Récent si créé dans les 7 derniers jours
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        
        return date.toLocaleDateString('fr-FR', { 
            month: 'long', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    },
    
    getDifficultyColor(difficulty) {
        const colors = {
            'Débutant': 'badge-success',
            'Intermédiaire': 'badge-warning',
            'Avancé': 'badge-danger'
        };
        return colors[difficulty] || 'badge-secondary';
    },
    
    calculateEngagementScore(article) {
        // Score basé sur les vues, likes et bookmarks
        return Math.round((article.views * 0.1) + (article.likes * 2) + (article.bookmarks * 3));
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('articles-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement de la base de connaissances...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateArticlesView
    },
    
    showErrorState() {
        const container = document.getElementById('articles-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                            <h3 class="text-danger">Erreur de chargement</h3>
                            <p class="text-muted">Impossible de charger la base de connaissances</p>
                            <button class="btn btn-primary mt-2" onclick="KnowledgeNotion.loadKnowledgeBase()">
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des articles', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page de la base de connaissances
    if (window.location.pathname.includes('knowledge.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                KnowledgeNotion.init();
            }
        }, 100);
    }
});

// Export global
window.KnowledgeNotion = KnowledgeNotion;