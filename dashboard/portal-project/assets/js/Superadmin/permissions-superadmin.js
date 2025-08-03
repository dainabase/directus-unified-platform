/**
 * Module de permissions étendu pour Superadmin
 * Gestion granulaire des accès avec audit
 */
window.PermissionsSuperadmin = (function() {
    'use strict';

    // Permissions disponibles pour superadmin
    const PERMISSIONS = {
        // Finance
        'superadmin.finance.view': 'Voir données financières',
        'superadmin.finance.create': 'Créer factures/notes',
        'superadmin.finance.edit': 'Modifier données financières',
        'superadmin.finance.delete': 'Supprimer données financières',
        'superadmin.finance.validate': 'Valider factures/notes',
        'superadmin.finance.export': 'Exporter données financières',
        'superadmin.finance.ocr': 'Utiliser OCR',
        'superadmin.finance.banking': 'Accès banking',
        'superadmin.finance.accounting': 'Écritures comptables',
        'superadmin.finance.vat': 'Déclarations TVA',
        'superadmin.finance.full': 'Accès complet finance',
        
        // CRM
        'superadmin.crm.view': 'Voir contacts/entreprises',
        'superadmin.crm.create': 'Créer contacts/entreprises',
        'superadmin.crm.edit': 'Modifier CRM',
        'superadmin.crm.delete': 'Supprimer CRM',
        'superadmin.crm.export': 'Exporter CRM',
        'superadmin.crm.full': 'Accès complet CRM',
        
        // Projets
        'superadmin.projects.view': 'Voir tous projets',
        'superadmin.projects.create': 'Créer projets',
        'superadmin.projects.edit': 'Modifier projets',
        'superadmin.projects.delete': 'Supprimer projets',
        'superadmin.projects.allocate': 'Allouer ressources',
        'superadmin.projects.full': 'Accès complet projets',
        
        // Utilisateurs
        'superadmin.users.view': 'Voir utilisateurs',
        'superadmin.users.create': 'Créer utilisateurs',
        'superadmin.users.edit': 'Modifier utilisateurs',
        'superadmin.users.delete': 'Supprimer utilisateurs',
        'superadmin.users.permissions': 'Gérer permissions',
        'superadmin.users.2fa': 'Gérer 2FA utilisateurs',
        'superadmin.users.full': 'Accès complet utilisateurs',
        
        // Entités
        'superadmin.entities.view': 'Voir configuration entités',
        'superadmin.entities.edit': 'Modifier entités',
        'superadmin.entities.consolidate': 'Consolidation groupe',
        'superadmin.entities.full': 'Accès complet entités',
        
        // Système
        'superadmin.system.view': 'Voir configuration système',
        'superadmin.system.edit': 'Modifier système',
        'superadmin.system.audit': 'Voir logs audit',
        'superadmin.system.backup': 'Gérer sauvegardes',
        'superadmin.system.integrations': 'Gérer intégrations',
        'superadmin.system.full': 'Accès complet système',
        
        // Automatisations
        'superadmin.automation.view': 'Voir workflows',
        'superadmin.automation.create': 'Créer workflows',
        'superadmin.automation.edit': 'Modifier workflows',
        'superadmin.automation.execute': 'Exécuter workflows',
        'superadmin.automation.full': 'Accès complet automation',
        
        // Full access
        'superadmin.*': 'Accès complet SUPERADMIN'
    };

    // Cache des permissions utilisateur
    let userPermissionsCache = null;
    let cacheTimestamp = null;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Charger les permissions de l'utilisateur
     */
    async function loadUserPermissions(forceRefresh = false) {
        // Utiliser cache si valide
        if (!forceRefresh && userPermissionsCache && cacheTimestamp && 
            (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            return userPermissionsCache;
        }

        const user = window.AuthSuperadmin.getCurrentUser();
        if (!user) {
            return [];
        }

        // En dev, donner toutes les permissions au superadmin
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Si c'est le superadmin principal, donner accès complet
            if (user.email === 'admin@groupe.ch') {
                userPermissionsCache = ['superadmin.*'];
            } else {
                // Sinon, donner des permissions limitées pour test
                userPermissionsCache = [
                    'superadmin.finance.view',
                    'superadmin.crm.view',
                    'superadmin.projects.view',
                    'superadmin.users.view',
                    'superadmin.system.view'
                ];
            }
            cacheTimestamp = Date.now();
            return userPermissionsCache;
        }

        // En prod, charger depuis API
        try {
            const response = await fetch('/api/superadmin/permissions', {
                headers: {
                    'Authorization': `Bearer ${window.AuthSuperadmin.getSession()?.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur chargement permissions');
            }

            const data = await response.json();
            userPermissionsCache = data.permissions;
            cacheTimestamp = Date.now();
            
            return userPermissionsCache;
        } catch (error) {
            console.error('Erreur chargement permissions:', error);
            return [];
        }
    }

    /**
     * Vérifier si l'utilisateur a une permission
     */
    async function hasPermission(permission, options = {}) {
        const permissions = await loadUserPermissions();
        
        // Vérifier wildcard complet
        if (permissions.includes('superadmin.*')) {
            if (options.log) {
                await logPermissionCheck(permission, true, 'wildcard');
            }
            return true;
        }

        // Vérifier permission exacte
        if (permissions.includes(permission)) {
            if (options.log) {
                await logPermissionCheck(permission, true, 'exact');
            }
            return true;
        }

        // Vérifier wildcards partiels
        const permissionParts = permission.split('.');
        for (let i = permissionParts.length - 1; i > 0; i--) {
            const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
            if (permissions.includes(wildcardPermission)) {
                if (options.log) {
                    await logPermissionCheck(permission, true, 'partial_wildcard');
                }
                return true;
            }
        }

        // Permission refusée
        if (options.log) {
            await logPermissionCheck(permission, false, 'denied');
        }
        
        return false;
    }

    /**
     * Vérifier plusieurs permissions (AND)
     */
    async function hasAllPermissions(permissions, options = {}) {
        for (const permission of permissions) {
            if (!await hasPermission(permission, options)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Vérifier plusieurs permissions (OR)
     */
    async function hasAnyPermission(permissions, options = {}) {
        for (const permission of permissions) {
            if (await hasPermission(permission, options)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Middleware pour sécuriser les appels API
     */
    async function secureSuperadminCall(permission, apiCall, options = {}) {
        // Vérifier authentification
        if (!window.AuthSuperadmin.isAuthenticated()) {
            throw new Error('Non authentifié');
        }

        // Vérifier 2FA
        if (!window.AuthSuperadmin.isTwoFactorVerified()) {
            throw new Error('2FA non vérifié');
        }

        // Vérifier permission
        if (!await hasPermission(permission, { log: true })) {
            await window.AuthSuperadmin.logAuditEvent('PERMISSION_DENIED', {
                permission,
                context: options.context
            });
            throw new Error(`Permission refusée : ${permission}`);
        }

        // Logger l'action
        await window.AuthSuperadmin.logAuditEvent('API_CALL', {
            permission,
            action: options.action,
            context: options.context
        });

        // Exécuter l'appel
        try {
            const result = await apiCall();
            
            // Logger succès si demandé
            if (options.logSuccess) {
                await window.AuthSuperadmin.logAuditEvent('API_SUCCESS', {
                    permission,
                    action: options.action,
                    context: options.context
                });
            }
            
            return result;
        } catch (error) {
            // Logger erreur
            await window.AuthSuperadmin.logAuditEvent('API_ERROR', {
                permission,
                action: options.action,
                context: options.context,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Logger une vérification de permission
     */
    async function logPermissionCheck(permission, granted, reason) {
        const log = {
            timestamp: new Date().toISOString(),
            permission,
            granted,
            reason,
            user: window.AuthSuperadmin.getCurrentUser()?.email
        };

        // En dev, logger dans console
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[Permission Check]', log);
        }

        // Toujours logger dans audit trail
        await window.AuthSuperadmin.logAuditEvent('PERMISSION_CHECK', log);
    }

    /**
     * UI Helpers pour afficher/cacher éléments selon permissions
     */
    async function updateUIPermissions() {
        // Trouver tous les éléments avec data-permission
        const elements = document.querySelectorAll('[data-permission]');
        
        for (const element of elements) {
            const permission = element.dataset.permission;
            const hasAccess = await hasPermission(permission);
            
            if (hasAccess) {
                element.style.display = '';
                element.classList.remove('permission-denied');
            } else {
                element.style.display = 'none';
                element.classList.add('permission-denied');
            }
        }

        // Éléments avec permissions multiples (AND)
        const multiElements = document.querySelectorAll('[data-permissions-all]');
        for (const element of multiElements) {
            const permissions = element.dataset.permissionsAll.split(',');
            const hasAccess = await hasAllPermissions(permissions);
            
            element.style.display = hasAccess ? '' : 'none';
        }

        // Éléments avec permissions multiples (OR)
        const anyElements = document.querySelectorAll('[data-permissions-any]');
        for (const element of anyElements) {
            const permissions = element.dataset.permissionsAny.split(',');
            const hasAccess = await hasAnyPermission(permissions);
            
            element.style.display = hasAccess ? '' : 'none';
        }
    }

    /**
     * Invalider le cache
     */
    function invalidateCache() {
        userPermissionsCache = null;
        cacheTimestamp = null;
    }

    /**
     * Obtenir liste des permissions
     */
    function getAllPermissions() {
        return { ...PERMISSIONS };
    }

    /**
     * Obtenir permissions par catégorie
     */
    function getPermissionsByCategory() {
        const categories = {};
        
        for (const [key, label] of Object.entries(PERMISSIONS)) {
            const category = key.split('.')[1]; // finance, crm, etc.
            if (!categories[category]) {
                categories[category] = {};
            }
            categories[category][key] = label;
        }
        
        return categories;
    }

    // API publique
    return {
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        secureSuperadminCall,
        updateUIPermissions,
        invalidateCache,
        getAllPermissions,
        getPermissionsByCategory,
        loadUserPermissions
    };

})();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour UI selon permissions
    window.PermissionsSuperadmin.updateUIPermissions();
    
    // Rafraîchir périodiquement
    setInterval(() => {
        window.PermissionsSuperadmin.updateUIPermissions();
    }, 60000); // Toutes les minutes
});