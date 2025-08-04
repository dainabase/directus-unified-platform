// Permissions management for Directus
window.PermissionsDirectus = {
    // Permission definitions by role
    rolePermissions: {
        superadmin: ['*'], // All permissions
        client: [
            'client.*',
            'dashboard.view',
            'projects.view',
            'projects.create',
            'projects.edit.own',
            'invoices.view.own',
            'documents.view.own',
            'documents.upload',
            'support.create',
            'profile.edit'
        ],
        prestataire: [
            'prestataire.*',
            'dashboard.view',
            'missions.view.assigned',
            'missions.update.assigned',
            'timesheets.create',
            'timesheets.edit.own',
            'timesheets.view.own',
            'documents.view.project',
            'documents.upload',
            'calendar.view',
            'messages.view',
            'profile.edit'
        ],
        revendeur: [
            'revendeur.*',
            'dashboard.view',
            'catalog.view',
            'orders.create',
            'orders.view.own',
            'orders.edit.own',
            'clients.view.own',
            'clients.create',
            'clients.edit.own',
            'commissions.view.own',
            'marketing.view',
            'profile.edit'
        ]
    },
    
    // Get user permissions based on role
    getUserPermissions: function() {
        const user = window.AuthDirectus.getUser();
        if (!user) return [];
        
        return this.rolePermissions[user.role] || [];
    },
    
    // Check if user has permission
    hasPermission: function(permission) {
        const permissions = this.getUserPermissions();
        
        // Check for wildcard permission
        if (permissions.includes('*')) return true;
        
        // Check exact permission
        if (permissions.includes(permission)) return true;
        
        // Check wildcard patterns
        return this.checkWildcardPermission(permissions, permission);
    },
    
    // Check wildcard permissions
    checkWildcardPermission: function(permissions, permission) {
        for (let perm of permissions) {
            // Check for namespace wildcard (e.g., 'client.*')
            if (perm.endsWith('.*')) {
                const namespace = perm.slice(0, -2);
                if (permission.startsWith(namespace + '.')) {
                    return true;
                }
            }
            
            // Check for action wildcard (e.g., 'projects.*.own')
            if (perm.includes('.*.')) {
                const pattern = perm.replace('.*.', '\\.[^.]+\\.');
                const regex = new RegExp('^' + pattern + '$');
                if (regex.test(permission)) {
                    return true;
                }
            }
        }
        return false;
    },
    
    // Check if user can perform action on resource
    canAccess: function(resource, action, ownership = null) {
        // Build permission string
        let permission = `${resource}.${action}`;
        
        // Add ownership qualifier if needed
        if (ownership) {
            permission += `.${ownership}`;
        }
        
        return this.hasPermission(permission);
    },
    
    // Common permission checks
    canView: function(resource) {
        return this.canAccess(resource, 'view');
    },
    
    canEdit: function(resource) {
        return this.canAccess(resource, 'edit');
    },
    
    canCreate: function(resource) {
        return this.canAccess(resource, 'create');
    },
    
    canDelete: function(resource) {
        return this.canAccess(resource, 'delete');
    },
    
    // Check if user owns resource
    isOwner: function(resource, userId) {
        const user = window.AuthDirectus.getUser();
        if (!user) return false;
        
        // Superadmin owns everything
        if (user.role === 'superadmin') return true;
        
        // Check ownership
        return resource.user_id === user.id || 
               resource.owner_id === user.id ||
               resource.created_by === user.id;
    },
    
    // Apply permissions to UI
    applyToUI: function() {
        // Hide/show elements based on permissions
        document.querySelectorAll('[data-permission]').forEach(element => {
            const required = element.dataset.permission;
            const hasAccess = this.hasPermission(required);
            
            if (!hasAccess) {
                element.style.display = 'none';
                element.setAttribute('aria-hidden', 'true');
            } else {
                element.style.display = '';
                element.removeAttribute('aria-hidden');
            }
        });
        
        // Disable/enable form elements
        document.querySelectorAll('[data-permission-edit]').forEach(element => {
            const resource = element.dataset.permissionEdit;
            const canEdit = this.canEdit(resource);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                element.disabled = !canEdit;
            } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                if (!canEdit) {
                    element.classList.add('disabled');
                    element.setAttribute('aria-disabled', 'true');
                }
            }
        });
        
        // Update UI messages
        this.updatePermissionMessages();
    },
    
    // Update permission-related messages
    updatePermissionMessages: function() {
        const user = window.AuthDirectus.getUser();
        if (!user) return;
        
        // Update role badges
        document.querySelectorAll('.role-badge').forEach(element => {
            element.textContent = this.getRoleLabel(user.role);
            element.className = 'badge role-badge ' + this.getRoleBadgeClass(user.role);
        });
    },
    
    // Get role display label
    getRoleLabel: function(role) {
        const labels = {
            superadmin: 'Super Admin',
            client: 'Client',
            prestataire: 'Prestataire',
            revendeur: 'Revendeur'
        };
        return labels[role] || role;
    },
    
    // Get role badge class
    getRoleBadgeClass: function(role) {
        const classes = {
            superadmin: 'bg-danger',
            client: 'bg-primary',
            prestataire: 'bg-success',
            revendeur: 'bg-warning'
        };
        return classes[role] || 'bg-secondary';
    },
    
    // Filter data based on permissions
    filterData: function(data, resource) {
        const user = window.AuthDirectus.getUser();
        if (!user) return [];
        
        // Superadmin sees everything
        if (user.role === 'superadmin') return data;
        
        // Check if user can view all
        if (this.canAccess(resource, 'view')) {
            return data;
        }
        
        // Check if user can only view own
        if (this.canAccess(resource, 'view', 'own')) {
            return data.filter(item => this.isOwner(item, user.id));
        }
        
        // Check if user can view assigned
        if (this.canAccess(resource, 'view', 'assigned')) {
            return data.filter(item => 
                item.assigned_to === user.id ||
                (item.assigned_users && item.assigned_users.includes(user.id))
            );
        }
        
        // No permission
        return [];
    },
    
    // Initialize permissions
    init: function() {
        console.log('🔐 Initializing permissions');
        
        // Apply permissions to UI on load
        this.applyToUI();
        
        // Re-apply on dynamic content changes
        const observer = new MutationObserver(() => {
            this.applyToUI();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.PermissionsDirectus.init();
});