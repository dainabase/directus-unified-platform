/**
 * Breadcrumb Manager
 * Gère automatiquement les breadcrumbs sur toutes les pages
 */

const BreadcrumbManager = {
    // Configuration des breadcrumbs par rôle et page
    config: {
        client: {
            base: { name: 'Accueil', url: 'dashboard.html' },
            pages: {
                'dashboard.html': { name: 'Tableau de bord', parent: null },
                'projects.html': { name: 'Projets', parent: null },
                'project-detail.html': { name: 'Détail du projet', parent: 'projects.html' },
                'documents.html': { name: 'Documents', parent: null },
                'document-preview.html': { name: 'Aperçu document', parent: 'documents.html' },
                'finances.html': { name: 'Finances', parent: null },
                'invoice-detail.html': { name: 'Détail facture', parent: 'finances.html' },
                'payment.html': { name: 'Paiement', parent: 'finances.html' },
                'support.html': { name: 'Support', parent: null },
                'profile.html': { name: 'Mon profil', parent: null }
            }
        },
        prestataire: {
            base: { name: 'Accueil', url: 'dashboard.html' },
            pages: {
                'dashboard.html': { name: 'Tableau de bord', parent: null },
                'missions.html': { name: 'Missions', parent: null },
                'mission-detail.html': { name: 'Détail mission', parent: 'missions.html' },
                'tasks.html': { name: 'Tâches', parent: null },
                'calendar.html': { name: 'Planning', parent: null },
                'timetracking.html': { name: 'Suivi temps', parent: null },
                'rewards.html': { name: 'Récompenses', parent: null },
                'performance.html': { name: 'Performance', parent: null },
                'knowledge.html': { name: 'Base de connaissances', parent: null },
                'knowledge-article.html': { name: 'Article', parent: 'knowledge.html' },
                'messages.html': { name: 'Messages', parent: null },
                'profile.html': { name: 'Mon profil', parent: null }
            }
        },
        revendeur: {
            base: { name: 'Accueil', url: 'dashboard.html' },
            pages: {
                'dashboard.html': { name: 'Tableau de bord', parent: null },
                'pipeline.html': { name: 'Pipeline', parent: null },
                'leads.html': { name: 'Prospects', parent: null },
                'clients.html': { name: 'Clients', parent: null },
                'client-detail.html': { name: 'Détail client', parent: 'clients.html' },
                'commissions.html': { name: 'Commissions', parent: null },
                'marketing.html': { name: 'Marketing', parent: null },
                'reports.html': { name: 'Rapports', parent: null },
                'quotes.html': { name: 'Devis', parent: null },
                'profile.html': { name: 'Mon profil', parent: null }
            }
        },
        superadmin: {
            base: { name: 'Administration', url: 'dashboard.html' },
            pages: {
                'dashboard.html': { name: 'Dashboard CEO', parent: null },
                // Finance
                'finance/accounting.html': { name: 'Comptabilité', parent: 'finance' },
                'finance/banking.html': { name: 'Banking', parent: 'finance' },
                'finance/invoices-out.html': { name: 'Factures Clients', parent: 'finance' },
                'finance/invoices-in.html': { name: 'Factures Fournisseurs', parent: 'finance' },
                'finance/expenses.html': { name: 'Notes de Frais', parent: 'finance' },
                'finance/vat-reports.html': { name: 'Déclarations TVA', parent: 'finance' },
                'finance/ocr-upload.html': { name: 'OCR Factures', parent: 'finance' },
                'finance/monthly-reports.html': { name: 'Rapports Mensuels', parent: 'finance' },
                // CRM
                'crm/dashboard.html': { name: 'Dashboard CRM', parent: 'crm' },
                'crm/contacts.html': { name: 'Contacts', parent: 'crm' },
                'crm/companies.html': { name: 'Entreprises', parent: 'crm' },
                'crm/opportunities.html': { name: 'Opportunités', parent: 'crm' },
                // Projets
                'projets/projets-admin.html': { name: 'Gestion Projets', parent: 'projets' },
                'projects/resources.html': { name: 'Ressources', parent: 'projets' },
                'projects/templates.html': { name: 'Templates', parent: 'projets' },
                // Entités
                'entities/entities-config.html': { name: 'Configuration', parent: 'entities' },
                'entities/consolidation.html': { name: 'Consolidation', parent: 'entities' },
                'entities/inter-company.html': { name: 'Inter-sociétés', parent: 'entities' },
                // Automatisation
                'automation/workflows.html': { name: 'Workflows n8n', parent: 'automation' },
                'automation/notifications.html': { name: 'Notifications', parent: 'automation' },
                'automation/email-templates.html': { name: 'Templates Email', parent: 'automation' },
                // Utilisateurs
                'users/users-list.html': { name: 'Liste Utilisateurs', parent: 'users' },
                'users/roles.html': { name: 'Rôles', parent: 'users' },
                'users/permissions.html': { name: 'Permissions', parent: 'users' },
                'users/onboarding.html': { name: 'Onboarding', parent: 'users' },
                // Système
                'system/settings.html': { name: 'Paramètres', parent: 'system' },
                'system/2fa-setup.html': { name: '2FA Config', parent: 'system' },
                'system/audit-logs.html': { name: 'Logs d\'Audit', parent: 'system' },
                'system/backups.html': { name: 'Sauvegardes', parent: 'system' },
                'system/integrations.html': { name: 'Intégrations', parent: 'system' }
            },
            sections: {
                'finance': { name: 'Finance', icon: 'ti-cash' },
                'crm': { name: 'CRM', icon: 'ti-users' },
                'projets': { name: 'Projets', icon: 'ti-briefcase' },
                'entities': { name: 'Multi-Entités', icon: 'ti-building' },
                'automation': { name: 'Automatisation', icon: 'ti-robot' },
                'users': { name: 'Utilisateurs', icon: 'ti-user' },
                'system': { name: 'Système', icon: 'ti-settings' }
            }
        }
    },

    /**
     * Initialiser le gestionnaire de breadcrumbs
     */
    init() {
        console.log('🍞 Initialisation du gestionnaire de breadcrumbs');
        this.injectBreadcrumb();
    },

    /**
     * Détecter le rôle et la page actuels
     */
    detectContext() {
        // Détecter le rôle depuis l'URL ou le localStorage
        const path = window.location.pathname;
        let role = 'client'; // Par défaut
        
        if (path.includes('/client/')) role = 'client';
        else if (path.includes('/prestataire/')) role = 'prestataire';
        else if (path.includes('/revendeur/')) role = 'revendeur';
        else if (path.includes('/superadmin/')) role = 'superadmin';
        
        // Extraire le nom de la page
        const pageName = path.substring(path.lastIndexOf('/') + 1);
        
        // Pour SuperAdmin, inclure le dossier parent si nécessaire
        let fullPageName = pageName;
        if (role === 'superadmin' && path.includes('/finance/')) {
            fullPageName = 'finance/' + pageName;
        } else if (role === 'superadmin' && path.includes('/crm/')) {
            fullPageName = 'crm/' + pageName;
        } else if (role === 'superadmin' && path.includes('/projets/')) {
            fullPageName = 'projets/' + pageName;
        } else if (role === 'superadmin' && path.includes('/projects/')) {
            fullPageName = 'projects/' + pageName;
        } else if (role === 'superadmin' && path.includes('/entities/')) {
            fullPageName = 'entities/' + pageName;
        } else if (role === 'superadmin' && path.includes('/automation/')) {
            fullPageName = 'automation/' + pageName;
        } else if (role === 'superadmin' && path.includes('/users/')) {
            fullPageName = 'users/' + pageName;
        } else if (role === 'superadmin' && path.includes('/system/')) {
            fullPageName = 'system/' + pageName;
        }
        
        return { role, pageName: fullPageName };
    },

    /**
     * Construire le breadcrumb
     */
    buildBreadcrumb() {
        const { role, pageName } = this.detectContext();
        const roleConfig = this.config[role];
        
        if (!roleConfig) return null;
        
        const breadcrumb = [];
        
        // Ajouter la base
        breadcrumb.push({
            name: roleConfig.base.name,
            url: roleConfig.base.url,
            active: false
        });
        
        // Trouver la page actuelle
        const currentPage = roleConfig.pages[pageName];
        if (!currentPage) {
            console.warn(`Page non configurée pour breadcrumb: ${pageName}`);
            return breadcrumb;
        }
        
        // Construire la hiérarchie
        const hierarchy = [];
        let page = currentPage;
        let currentPageName = pageName;
        
        while (page) {
            hierarchy.unshift({
                name: page.name,
                url: currentPageName,
                active: currentPageName === pageName
            });
            
            if (page.parent) {
                // Pour SuperAdmin, gérer les sections
                if (role === 'superadmin' && roleConfig.sections[page.parent]) {
                    hierarchy.unshift({
                        name: roleConfig.sections[page.parent].name,
                        url: null,
                        active: false
                    });
                    break;
                } else {
                    currentPageName = page.parent;
                    page = roleConfig.pages[page.parent];
                }
            } else {
                break;
            }
        }
        
        // Ajouter la hiérarchie au breadcrumb
        breadcrumb.push(...hierarchy);
        
        return breadcrumb;
    },

    /**
     * Générer le HTML du breadcrumb
     */
    generateBreadcrumbHTML() {
        const breadcrumb = this.buildBreadcrumb();
        if (!breadcrumb || breadcrumb.length === 0) return '';
        
        const items = breadcrumb.map((item, index) => {
            if (item.active) {
                return `<li class="breadcrumb-item active" aria-current="page">${item.name}</li>`;
            } else if (item.url) {
                return `<li class="breadcrumb-item"><a href="${item.url}">${item.name}</a></li>`;
            } else {
                return `<li class="breadcrumb-item">${item.name}</li>`;
            }
        }).join('');
        
        return `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    ${items}
                </ol>
            </nav>
        `;
    },

    /**
     * Injecter le breadcrumb dans la page
     */
    injectBreadcrumb() {
        // Chercher l'emplacement du breadcrumb
        let breadcrumbContainer = document.querySelector('.page-pretitle');
        
        // Si pas trouvé, chercher dans page-header
        if (!breadcrumbContainer) {
            const pageHeader = document.querySelector('.page-header');
            if (pageHeader) {
                // Créer la structure si elle n'existe pas
                let pageHeaderContent = pageHeader.querySelector('.container-xl .row .col');
                if (!pageHeaderContent) {
                    pageHeader.innerHTML = `
                        <div class="container-xl">
                            <div class="row g-2 align-items-center">
                                <div class="col">
                                    <div class="page-pretitle"></div>
                                    <h2 class="page-title"></h2>
                                </div>
                            </div>
                        </div>
                    `;
                    pageHeaderContent = pageHeader.querySelector('.col');
                }
                
                breadcrumbContainer = pageHeaderContent.querySelector('.page-pretitle');
                if (!breadcrumbContainer) {
                    breadcrumbContainer = document.createElement('div');
                    breadcrumbContainer.className = 'page-pretitle';
                    pageHeaderContent.insertBefore(breadcrumbContainer, pageHeaderContent.firstChild);
                }
            }
        }
        
        if (breadcrumbContainer) {
            const breadcrumbHTML = this.generateBreadcrumbHTML();
            breadcrumbContainer.innerHTML = breadcrumbHTML;
        } else {
            console.warn('Impossible de trouver un emplacement pour le breadcrumb');
        }
    },

    /**
     * Mettre à jour dynamiquement le breadcrumb
     */
    updateBreadcrumb(customName = null) {
        if (customName) {
            const { role, pageName } = this.detectContext();
            const roleConfig = this.config[role];
            if (roleConfig && roleConfig.pages[pageName]) {
                roleConfig.pages[pageName].name = customName;
            }
        }
        this.injectBreadcrumb();
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    BreadcrumbManager.init();
});

// Exporter pour utilisation
window.BreadcrumbManager = BreadcrumbManager;