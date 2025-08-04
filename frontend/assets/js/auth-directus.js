// Authentication module for Directus
window.AuthDirectus = {
    tokenKey: 'directus_token',
    userKey: 'directus_user',
    refreshKey: 'directus_refresh',
    
    // Check if authenticated
    isAuthenticated: function() {
        return !!this.getToken();
    },
    
    // Get stored token
    getToken: function() {
        // Use default token for development
        return localStorage.getItem(this.tokenKey) || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
    },
    
    // Get refresh token
    getRefreshToken: function() {
        return localStorage.getItem(this.refreshKey);
    },
    
    // Get current user
    getUser: function() {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    },
    
    // Get user role
    getUserRole: function() {
        const user = this.getUser();
        return user?.role || 'guest';
    },
    
    // Login
    login: async function(email, password) {
        try {
            // For development, use mock authentication
            // In production, this would call Directus auth endpoint
            const mockUser = {
                id: 1,
                email: email,
                first_name: email.split('@')[0],
                last_name: 'User',
                role: this.determineRole(email),
                avatar: null
            };
            
            // Store user data
            localStorage.setItem(this.userKey, JSON.stringify(mockUser));
            
            // Redirect based on role
            this.redirectToDashboard(mockUser.role);
            
            return { 
                success: true, 
                user: mockUser,
                message: 'Connexion réussie'
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.message || 'Erreur de connexion'
            };
        }
    },
    
    // Determine role from email (for mock)
    determineRole: function(email) {
        if (email.includes('admin')) return 'superadmin';
        if (email.includes('prestataire')) return 'prestataire';
        if (email.includes('revendeur')) return 'revendeur';
        return 'client';
    },
    
    // Logout
    logout: function() {
        // Clear storage
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshKey);
        
        // Clear session storage
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/login.html';
    },
    
    // Redirect to appropriate dashboard
    redirectToDashboard: function(role) {
        const dashboards = {
            superadmin: '/superadmin/dashboard.html',
            client: '/client/dashboard.html',
            prestataire: '/prestataire/dashboard.html',
            revendeur: '/revendeur/dashboard.html'
        };
        
        const dashboard = dashboards[role] || '/client/dashboard.html';
        window.location.href = dashboard;
    },
    
    // Check and redirect if not authenticated
    requireAuth: function() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    },
    
    // Check if user has specific role
    hasRole: function(requiredRole) {
        const userRole = this.getUserRole();
        
        // Superadmin has access to everything
        if (userRole === 'superadmin') return true;
        
        // Check specific role
        return userRole === requiredRole;
    },
    
    // Update user profile
    updateProfile: async function(data) {
        try {
            const user = this.getUser();
            if (!user) throw new Error('User not found');
            
            // Update local storage (in production, would call API)
            const updatedUser = { ...user, ...data };
            localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
            
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Initialize auth check on page load
    init: function() {
        // Check if we're on a protected page
        const publicPages = ['/login.html', '/register.html', '/forgot-password.html', '/'];
        const currentPath = window.location.pathname;
        
        if (!publicPages.includes(currentPath) && !this.isAuthenticated()) {
            this.requireAuth();
        }
        
        // Add logout handler to any logout buttons
        document.querySelectorAll('[data-action="logout"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
        
        // Display user info if authenticated
        if (this.isAuthenticated()) {
            this.displayUserInfo();
        }
    },
    
    // Display user info in UI
    displayUserInfo: function() {
        const user = this.getUser();
        if (!user) return;
        
        // Update user name displays
        document.querySelectorAll('.user-name').forEach(element => {
            element.textContent = `${user.first_name} ${user.last_name}`;
        });
        
        // Update user email displays
        document.querySelectorAll('.user-email').forEach(element => {
            element.textContent = user.email;
        });
        
        // Update user role displays
        document.querySelectorAll('.user-role').forEach(element => {
            element.textContent = user.role;
        });
        
        // Update user avatar
        if (user.avatar) {
            document.querySelectorAll('.user-avatar').forEach(element => {
                element.src = user.avatar;
            });
        }
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.AuthDirectus.init();
});