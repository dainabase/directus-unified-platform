// permissions-notion.js - Système de gestion des permissions avec Notion
// Ce fichier gère les autorisations et contrôles d'accès pour tous les utilisateurs

const PermissionsNotion = {
    // Configuration
    DB_IDS: {
        PERMISSIONS: '236adb95-3c6f-80ff-8918-fd5c388dcbd9', // DB_PERMISSIONS_ACCES
        ROLES: '237adb95-3c6f-80d5-bd9f-ef96b4fd46ba', // DB Rôles et permissions
        AUDIT_LOG: '238adb95-3c6f-8034-97f0-dc4b907b8a2f' // DB Journal d'audit
    },
    
    // Cache des permissions (15 minutes)
    CACHE_DURATION: 15 * 60 * 1000,
    permissionsCache: new Map(),
    
    // Permissions par défaut par rôle
    DEFAULT_PERMISSIONS: {
        client: {
            // Permissions de base pour les clients
            'projects.view': true,
            'projects.create': true,
            'projects.edit.own': true,
            'documents.view.own': true,
            'documents.upload.own': true,
            'finances.view.own': true,
            'chat.use': true,
            'profile.edit.own': true
        },
        prestataire: {
            // Permissions pour les prestataires
            'missions.view.assigned': true,
            'missions.update.assigned': true,
            'tasks.view.assigned': true,
            'tasks.complete': true,
            'documents.view.project': true,
            'documents.upload.project': true,
            'rewards.view.own': true,
            'calendar.view': true,
            'calendar.edit.own': true,
            'chat.use': true,
            'timetracking.use': true,
            'profile.edit.own': true
        },
        revendeur: {
            // Permissions pour les revendeurs
            'dashboard.view.all': true,
            'pipeline.view.all': true,
            'pipeline.edit.all': true,
            'leads.view.all': true,
            'leads.create': true,
            'leads.edit.all': true,
            'clients.view.all': true,
            'clients.create': true,
            'clients.edit.all': true,
            'commissions.view.own': true,
            'reports.view.all': true,
            'reports.create': true,
            'marketing.view': true,
            'marketing.download': true,
            'chat.use': true,
            'profile.edit.own': true
        },
        admin: {
            // Toutes les permissions pour les admins
            '*': true
        }
    },
    
    // Initialisation
    init() {
        console.log('🔐 Initialisation du système de permissions');
        
        // Charger les permissions de l'utilisateur actuel
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (currentUser) {
            this.loadUserPermissions(currentUser.id);
        }
        
        // Nettoyer le cache périodiquement
        setInterval(() => this.cleanCache(), this.CACHE_DURATION);
    },
    
    // Vérifier une permission
    async checkPermission(userId, resource, action) {
        try {
            // Construire la clé de permission
            const permissionKey = `${resource}.${action}`;
            console.log(`Vérification permission: ${permissionKey} pour utilisateur ${userId}`);
            
            // Récupérer les permissions de l'utilisateur
            const permissions = await this.getUserPermissions(userId);
            
            // Vérifier permission wildcard admin
            if (permissions['*'] === true) {
                return true;
            }
            
            // Vérifier permission spécifique
            if (permissions[permissionKey] !== undefined) {
                return permissions[permissionKey];
            }
            
            // Vérifier permissions avec wildcards
            const resourceWildcard = `${resource}.*`;
            if (permissions[resourceWildcard] === true) {
                return true;
            }
            
            // Vérifier permissions partielles (ex: projects.edit.own)
            const partialPermission = this.checkPartialPermission(permissions, permissionKey, userId);
            if (partialPermission !== null) {
                return partialPermission;
            }
            
            // Permission non trouvée = refusée
            return false;
            
        } catch (error) {
            console.error('Erreur vérification permission:', error);
            // En cas d'erreur, refuser l'accès par sécurité
            return false;
        }
    },
    
    // Récupérer les permissions d'un utilisateur
    async getUserPermissions(userId) {
        try {
            // Vérifier le cache
            const cacheKey = `permissions_${userId}`;
            const cached = this.permissionsCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                console.log('📋 Permissions récupérées du cache');
                return cached.data;
            }
            
            // Sinon, charger depuis Notion
            console.log('🔄 Chargement des permissions depuis Notion');
            
            // Récupérer l'utilisateur et son rôle
            const user = await this.loadUserFromNotion(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Récupérer les permissions du rôle
            const rolePermissions = this.DEFAULT_PERMISSIONS[user.role] || {};
            
            // Récupérer les permissions personnalisées
            const customPermissions = await this.loadCustomPermissions(userId);
            
            // Fusionner les permissions
            const mergedPermissions = {
                ...rolePermissions,
                ...customPermissions
            };
            
            // Mettre en cache
            this.permissionsCache.set(cacheKey, {
                data: mergedPermissions,
                timestamp: Date.now()
            });
            
            return mergedPermissions;
            
        } catch (error) {
            console.error('Erreur chargement permissions:', error);
            // Retourner permissions minimales en cas d'erreur
            return {};
        }
    },
    
    // Charger un utilisateur depuis Notion
    async loadUserFromNotion(userId) {
        try {
            // Simuler l'appel Notion
            return await window.NotionConnector.mockData.getUserById(userId);
        } catch (error) {
            console.error('Erreur chargement utilisateur:', error);
            return null;
        }
    },
    
    // Charger les permissions personnalisées
    async loadCustomPermissions(userId) {
        try {
            // Simuler l'appel Notion pour les permissions custom
            // Dans la vraie implémentation, ceci ferait une requête à la DB Permissions
            const mockCustomPermissions = {
                // Exemple de permissions personnalisées
                'reports.export': true,
                'analytics.advanced': false
            };
            
            return mockCustomPermissions;
        } catch (error) {
            console.error('Erreur chargement permissions custom:', error);
            return {};
        }
    },
    
    // Vérifier les permissions partielles (own, assigned, etc.)
    checkPartialPermission(permissions, permissionKey, userId) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return null;
        
        // Vérifier les permissions .own
        if (permissionKey.includes('.own')) {
            const basePermission = permissionKey.replace('.own', '.own');
            if (permissions[basePermission] && userId === currentUser.id) {
                return true;
            }
        }
        
        // Vérifier les permissions .assigned
        if (permissionKey.includes('.assigned')) {
            // Logique pour vérifier si l'utilisateur est assigné
            // À implémenter selon le contexte
        }
        
        return null;
    },
    
    // Filtrer les données selon le rôle
    filterDataByRole(data, userRole) {
        if (!data || !userRole) return data;
        
        // Pour les admins, retourner toutes les données
        if (userRole === 'admin') {
            return data;
        }
        
        // Appliquer les filtres selon le rôle
        switch (userRole) {
            case 'client':
                // Les clients ne voient que leurs propres données
                return this.filterOwnData(data);
                
            case 'prestataire':
                // Les prestataires voient les données qui leur sont assignées
                return this.filterAssignedData(data);
                
            case 'revendeur':
                // Les revendeurs voient toutes les données de leur zone
                return this.filterZoneData(data);
                
            default:
                return data;
        }
    },
    
    // Filtrer pour ne garder que les données de l'utilisateur
    filterOwnData(data) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return [];
        
        if (Array.isArray(data)) {
            return data.filter(item => 
                item.userId === currentUser.id || 
                item.ownerId === currentUser.id ||
                item.clientId === currentUser.id
            );
        }
        
        // Pour un objet unique
        if (data.userId === currentUser.id || 
            data.ownerId === currentUser.id ||
            data.clientId === currentUser.id) {
            return data;
        }
        
        return null;
    },
    
    // Filtrer pour les données assignées
    filterAssignedData(data) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return [];
        
        if (Array.isArray(data)) {
            return data.filter(item => 
                item.assignedTo === currentUser.id ||
                item.prestataireId === currentUser.id ||
                (item.assignedUsers && item.assignedUsers.includes(currentUser.id))
            );
        }
        
        // Pour un objet unique
        if (data.assignedTo === currentUser.id ||
            data.prestataireId === currentUser.id ||
            (data.assignedUsers && data.assignedUsers.includes(currentUser.id))) {
            return data;
        }
        
        return null;
    },
    
    // Filtrer par zone géographique
    filterZoneData(data) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser || !currentUser.zone) return data;
        
        if (Array.isArray(data)) {
            return data.filter(item => 
                !item.zone || // Pas de zone définie = visible
                item.zone === currentUser.zone ||
                (item.zones && item.zones.includes(currentUser.zone))
            );
        }
        
        return data;
    },
    
    // Vérifier l'accès à une ressource
    async checkResourceAccess(resource, action, resourceData = null) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return false;
        
        // Vérifier la permission de base
        const hasPermission = await this.checkPermission(currentUser.id, resource, action);
        if (!hasPermission) return false;
        
        // Si pas de données de ressource, la permission de base suffit
        if (!resourceData) return true;
        
        // Vérifications supplémentaires selon le contexte
        if (action.includes('own')) {
            return this.isResourceOwner(resourceData, currentUser.id);
        }
        
        if (action.includes('assigned')) {
            return this.isAssignedToResource(resourceData, currentUser.id);
        }
        
        return true;
    },
    
    // Vérifier si l'utilisateur est propriétaire
    isResourceOwner(resource, userId) {
        return resource.userId === userId || 
               resource.ownerId === userId ||
               resource.createdBy === userId;
    },
    
    // Vérifier si l'utilisateur est assigné
    isAssignedToResource(resource, userId) {
        return resource.assignedTo === userId ||
               resource.prestataireId === userId ||
               (resource.assignedUsers && resource.assignedUsers.includes(userId));
    },
    
    // Logger les accès (audit trail)
    async logAccess(action, resource, result, details = {}) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            const logEntry = {
                timestamp: new Date().toISOString(),
                userId: currentUser.id,
                userName: currentUser.name,
                action: action,
                resource: resource,
                result: result ? 'granted' : 'denied',
                ip: await this.getUserIP(),
                userAgent: navigator.userAgent,
                details: details
            };
            
            // Envoyer à Notion (simulé pour l'instant)
            console.log('📝 Audit log:', logEntry);
            
            // Dans la vraie implémentation, sauvegarder dans DB_AUDIT_LOG
            await window.NotionConnector.common.createAuditLog(logEntry);
            
        } catch (error) {
            console.error('Erreur logging audit:', error);
        }
    },
    
    // Obtenir l'IP de l'utilisateur (simulé)
    async getUserIP() {
        // Dans un environnement réel, utiliser un service comme ipify
        return '127.0.0.1';
    },
    
    // Nettoyer le cache
    cleanCache() {
        const now = Date.now();
        const keysToDelete = [];
        
        this.permissionsCache.forEach((value, key) => {
            if (now - value.timestamp > this.CACHE_DURATION) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => this.permissionsCache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`🧹 Nettoyage cache: ${keysToDelete.length} entrées supprimées`);
        }
    },
    
    // Recharger les permissions d'un utilisateur
    async refreshUserPermissions(userId) {
        const cacheKey = `permissions_${userId}`;
        this.permissionsCache.delete(cacheKey);
        return await this.getUserPermissions(userId);
    },
    
    // Middleware pour les requêtes
    async requirePermission(resource, action) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) {
            throw new Error('Non authentifié');
        }
        
        const hasPermission = await this.checkPermission(currentUser.id, resource, action);
        
        // Logger l'accès
        await this.logAccess(action, resource, hasPermission);
        
        if (!hasPermission) {
            throw new Error(`Permission refusée: ${resource}.${action}`);
        }
        
        return true;
    },
    
    // Décorateur pour protéger les fonctions
    protect(resource, action) {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = async function(...args) {
                await PermissionsNotion.requirePermission(resource, action);
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    },
    
    // Utilitaires pour les vues
    canView(resource) {
        return this.checkCurrentUserPermission(resource, 'view');
    },
    
    canEdit(resource) {
        return this.checkCurrentUserPermission(resource, 'edit');
    },
    
    canDelete(resource) {
        return this.checkCurrentUserPermission(resource, 'delete');
    },
    
    canCreate(resource) {
        return this.checkCurrentUserPermission(resource, 'create');
    },
    
    // Vérifier permission pour l'utilisateur actuel
    async checkCurrentUserPermission(resource, action) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return false;
        
        return await this.checkPermission(currentUser.id, resource, action);
    },
    
    // Obtenir toutes les permissions de l'utilisateur actuel
    async getCurrentUserPermissions() {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return {};
        
        return await this.getUserPermissions(currentUser.id);
    },
    
    // Vérifier si l'utilisateur a un rôle spécifique
    hasRole(role) {
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        return currentUser && currentUser.role === role;
    },
    
    // Vérifier si l'utilisateur est admin
    isAdmin() {
        return this.hasRole('admin');
    }
};

// Middleware pour intégration avec les modules existants
const PermissionsMiddleware = {
    // Wrapper pour les appels API
    async secureApiCall(resource, action, apiFunction, ...args) {
        // Vérifier les permissions
        await PermissionsNotion.requirePermission(resource, action);
        
        // Exécuter la fonction
        const result = await apiFunction(...args);
        
        // Filtrer les données selon le rôle
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (currentUser && result) {
            return PermissionsNotion.filterDataByRole(result, currentUser.role);
        }
        
        return result;
    },
    
    // Intégration avec NotionConnector
    wrapNotionConnector() {
        const connector = window.NotionConnector;
        if (!connector) return;
        
        // Wrapper pour les méthodes client
        const originalGetProjects = connector.client.getProjects;
        connector.client.getProjects = async function(...args) {
            return await PermissionsMiddleware.secureApiCall(
                'projects', 'view', originalGetProjects.bind(connector.client), ...args
            );
        };
        
        // Wrapper pour les méthodes prestataire
        const originalGetMissions = connector.prestataire.getMissions;
        connector.prestataire.getMissions = async function(...args) {
            return await PermissionsMiddleware.secureApiCall(
                'missions', 'view', originalGetMissions.bind(connector.prestataire), ...args
            );
        };
        
        // Wrapper pour les méthodes revendeur
        const originalGetPipeline = connector.revendeur.getPipelineDeals;
        connector.revendeur.getPipelineDeals = async function(...args) {
            return await PermissionsMiddleware.secureApiCall(
                'pipeline', 'view', originalGetPipeline.bind(connector.revendeur), ...args
            );
        };
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que NotionConnector et AuthNotionModule soient disponibles
    const checkDependencies = setInterval(() => {
        if (window.NotionConnector && window.AuthNotionModule) {
            clearInterval(checkDependencies);
            
            // Initialiser les permissions
            PermissionsNotion.init();
            
            // Appliquer le middleware
            PermissionsMiddleware.wrapNotionConnector();
            
            console.log('✅ Système de permissions initialisé');
        }
    }, 100);
});

// Export global
window.PermissionsNotion = PermissionsNotion;
window.PermissionsMiddleware = PermissionsMiddleware;