// auth-notion-v2.js - Version migrée avec vraie API Notion
// Ce module remplacera auth-notion.js une fois testé

const AuthNotionModuleV2 = {
    // État de l'authentification
    isAuthenticated: false,
    currentUser: null,
    
    // Initialisation
    init() {
        console.log('🔐 Initialisation Auth v2 avec API Notion réelle');
        
        // Observer les changements de token
        window.NotionAPIClient.onTokenChange((token) => {
            this.isAuthenticated = !!token;
            if (!token) {
                this.currentUser = null;
            }
        });
        
        // Vérifier si on a un token sauvegardé (sessionStorage plus sécurisé)
        const savedToken = sessionStorage.getItem('auth_token');
        if (savedToken) {
            window.NotionAPIClient.setToken(savedToken);
            this.checkAuthStatus();
        }
    },
    
    // Vérifier le statut d'authentification
    async checkAuthStatus() {
        try {
            const user = await window.NotionAPIClient.getCurrentUser();
            this.currentUser = user;
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            this.logout();
            return false;
        }
    },
    
    // Connexion
    async authenticateUser(email, password) {
        try {
            // Valider les entrées
            if (!email || !password) {
                return {
                    success: false,
                    error: 'Email et mot de passe requis'
                };
            }
            
            // Appeler l'API
            const response = await window.NotionAPIClient.login(email, password);
            
            if (response.success) {
                // Sauvegarder le token
                sessionStorage.setItem('auth_token', response.token);
                
                // Mettre à jour l'état
                this.isAuthenticated = true;
                this.currentUser = response.user;
                
                // Logger l'accès
                if (window.PermissionsNotion) {
                    await window.PermissionsNotion.logAccess('login', 'auth', true, {
                        userId: response.user.id,
                        email: response.user.email
                    });
                }
                
                return {
                    success: true,
                    user: response.user
                };
            }
            
            return {
                success: false,
                error: 'Connexion échouée'
            };
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Logger l'échec
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('login', 'auth', false, {
                    error: error.message
                });
            }
            
            return {
                success: false,
                error: this.getSecureErrorMessage(error.message)
            };
        }
    },
    
    // Inscription
    async registerUser(email, password, name, role) {
        try {
            // Validation
            if (!email || !password || !name || !role) {
                return {
                    success: false,
                    error: 'Tous les champs sont requis'
                };
            }
            
            if (password.length < 8) {
                return {
                    success: false,
                    error: 'Le mot de passe doit contenir au moins 8 caractères'
                };
            }
            
            // Appeler l'API
            const response = await window.NotionAPIClient.register({
                email,
                password,
                name,
                role
            });
            
            if (response.success) {
                // Sauvegarder le token
                sessionStorage.setItem('auth_token', response.token);
                
                // Mettre à jour l'état
                this.isAuthenticated = true;
                this.currentUser = response.user;
                
                return {
                    success: true,
                    user: response.user
                };
            }
            
            return {
                success: false,
                error: 'Inscription échouée'
            };
            
        } catch (error) {
            console.error('Register error:', error);
            
            return {
                success: false,
                error: this.getSecureErrorMessage(error.message)
            };
        }
    },
    
    // Déconnexion
    async logout() {
        try {
            // Appeler l'API
            await window.NotionAPIClient.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Nettoyer l'état local dans tous les cas
            this.isAuthenticated = false;
            this.currentUser = null;
            sessionStorage.removeItem('auth_token');
            
            // Rediriger vers la page de connexion
            window.location.href = '/portal-project/login.html';
        }
    },
    
    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        return this.currentUser;
    },
    
    // Vérifier si l'utilisateur est connecté
    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    },
    
    // Vérifier le rôle de l'utilisateur
    hasRole(role) {
        if (!this.currentUser) return false;
        return this.currentUser.roles && this.currentUser.roles.includes(role);
    },
    
    // Vérifier plusieurs rôles
    hasAnyRole(roles) {
        if (!this.currentUser || !Array.isArray(roles)) return false;
        return roles.some(role => this.hasRole(role));
    },
    
    // Obtenir le rôle principal (pour la navigation)
    getPrimaryRole() {
        if (!this.currentUser || !this.currentUser.roles) return null;
        
        // Priorité : client > prestataire > revendeur
        if (this.hasRole('client')) return 'client';
        if (this.hasRole('prestataire')) return 'prestataire';
        if (this.hasRole('revendeur')) return 'revendeur';
        
        return this.currentUser.roles[0] || null;
    },
    
    // Afficher le sélecteur de rôle pour les utilisateurs multi-rôles
    async showRoleSelector() {
        const roles = this.currentUser?.roles || [];
        
        if (roles.length <= 1) {
            return roles[0] || null;
        }
        
        // Créer un modal de sélection
        const modal = document.createElement('div');
        modal.className = 'modal modal-blur fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Choisir un espace</h5>
                    </div>
                    <div class="modal-body">
                        <p>Vous avez accès à plusieurs espaces. Veuillez en choisir un :</p>
                        <div class="list-group">
                            ${roles.map(role => `
                                <a href="#" class="list-group-item list-group-item-action" data-role="${role}">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar avatar-md ${this.getRoleColor(role)}-lt me-3">
                                            <i class="ti ${this.getRoleIcon(role)}"></i>
                                        </div>
                                        <div>
                                            <div class="font-weight-medium">${this.getRoleName(role)}</div>
                                            <div class="text-muted small">${this.getRoleDescription(role)}</div>
                                        </div>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la sélection
        return new Promise((resolve) => {
            modal.querySelectorAll('[data-role]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedRole = e.currentTarget.dataset.role;
                    document.body.removeChild(modal);
                    resolve(selectedRole);
                });
            });
        });
    },
    
    // Rafraîchir le token
    async refreshToken() {
        try {
            const refreshed = await window.NotionAPIClient.refreshToken();
            
            if (refreshed) {
                // Le nouveau token est automatiquement sauvegardé par NotionAPIClient
                const token = window.NotionAPIClient.getToken();
                if (token) {
                    sessionStorage.setItem('auth_token', token);
                }
            }
            
            return refreshed;
            
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    },
    
    // Messages d'erreur sécurisés
    getSecureErrorMessage(error) {
        if (error.includes('Email et mot de passe requis')) {
            return 'Veuillez remplir tous les champs';
        }
        if (error.includes('Identifiants invalides')) {
            return 'Email ou mot de passe incorrect';
        }
        if (error.includes('Compte désactivé')) {
            return 'Votre compte a été désactivé';
        }
        if (error.includes('email est déjà utilisé')) {
            return 'Cet email est déjà enregistré';
        }
        if (error.includes('Token')) {
            return 'Session expirée, veuillez vous reconnecter';
        }
        if (error.includes('Network') || error.includes('fetch')) {
            return 'Erreur de connexion au serveur';
        }
        
        return 'Une erreur est survenue, veuillez réessayer';
    },
    
    // Utilitaires pour les rôles
    getRoleColor(role) {
        const colors = {
            'client': 'bg-blue',
            'prestataire': 'bg-green',
            'revendeur': 'bg-orange',
            'admin': 'bg-purple'
        };
        return colors[role] || 'bg-secondary';
    },
    
    getRoleIcon(role) {
        const icons = {
            'client': 'ti-briefcase',
            'prestataire': 'ti-tools',
            'revendeur': 'ti-building-store',
            'admin': 'ti-shield'
        };
        return icons[role] || 'ti-user';
    },
    
    getRoleName(role) {
        const names = {
            'client': 'Espace Client',
            'prestataire': 'Espace Prestataire',
            'revendeur': 'Espace Revendeur',
            'admin': 'Administration'
        };
        return names[role] || role;
    },
    
    getRoleDescription(role) {
        const descriptions = {
            'client': 'Gérez vos projets et documents',
            'prestataire': 'Suivez vos missions et performances',
            'revendeur': 'Gérez votre pipeline et vos clients',
            'admin': 'Accès complet au système'
        };
        return descriptions[role] || '';
    },
    
    // Auto-refresh du token avant expiration
    startTokenRefreshTimer() {
        // Rafraîchir le token 5 minutes avant expiration
        const REFRESH_BEFORE = 5 * 60 * 1000; // 5 minutes
        const TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 heures
        
        setInterval(async () => {
            if (this.isAuthenticated) {
                await this.refreshToken();
            }
        }, TOKEN_LIFETIME - REFRESH_BEFORE);
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que NotionAPIClient soit chargé
    if (window.NotionAPIClient) {
        AuthNotionModuleV2.init();
        AuthNotionModuleV2.startTokenRefreshTimer();
    }
});

// Export global
window.AuthNotionModuleV2 = AuthNotionModuleV2;