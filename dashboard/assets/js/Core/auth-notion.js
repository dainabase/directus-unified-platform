// auth-notion.js - Authentification avec Notion
// Ce module gère la connexion réelle avec la base de données des utilisateurs Notion

const AuthNotionModule = {
    // Configuration
    USERS_DB_ID: '236adb95-3c6f-807f-9ea9-d08076830f7c',
    SESSION_KEY: 'auth_session',
    
    // Initialisation
    init() {
        console.log('🔐 Initialisation de l\'authentification Notion');
        this.attachEventListeners();
        this.checkExistingSession();
    },
    
    // Attacher les événements aux formulaires
    attachEventListeners() {
        // Formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e.target);
            });
        }
        
        // Formulaire d'inscription
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister(e.target);
            });
        }
        
        // Déconnexion
        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });
    },
    
    // Vérifier la session existante
    checkExistingSession() {
        const session = this.getSession();
        if (session && session.isAuthenticated) {
            // Rediriger vers le bon dashboard selon le rôle
            const currentPath = window.location.pathname;
            if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
                this.redirectToRoleDashboard(session.user.role);
            }
        }
    },
    
    // Gérer la connexion
    async handleLogin(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Valider le formulaire
            if (!AuthModule.validateForm(form)) {
                return;
            }
            
            // Afficher le spinner
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Connexion...';
            
            const email = form.email.value.trim().toLowerCase();
            const password = form.password.value;
            const rememberMe = form.rememberMe?.checked || false;
            
            // Si c'est un superadmin, utiliser le module superadmin
            if (email === 'admin@groupe.ch' && window.AuthSuperadmin) {
                try {
                    const superadminResult = await window.AuthSuperadmin.login(email, password);
                    if (superadminResult.success && superadminResult.requiresTwoFactor) {
                        window.location.href = superadminResult.redirectTo;
                        return;
                    }
                } catch (error) {
                    this.showNotification(error.message, 'error');
                    AuthModule.animateError(form);
                    return;
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
            
            // Authentifier avec Notion - Le rôle est déterminé par la DB
            const result = await this.authenticateUser(email, password);
            
            if (result.success) {
                const user = result.user;
                
                // Gérer les utilisateurs multi-rôles
                if (user.roles && user.roles.length > 1) {
                    // Si l'utilisateur a plusieurs rôles, afficher un sélecteur
                    await this.showRoleSelector(user, rememberMe);
                } else {
                    // Un seul rôle, connexion directe
                    const finalRole = user.roles ? user.roles[0] : user.role;
                    user.role = finalRole; // Normaliser le rôle
                    
                    // Créer la session
                    this.createSession(user, rememberMe);
                    
                    // Afficher le succès
                    this.showNotification(`Bienvenue ${user.name}!`, 'success');
                    
                    // Rediriger après un court délai
                    setTimeout(() => {
                        this.redirectToRoleDashboard(user.role);
                    }, 1000);
                }
            } else {
                // Afficher l'erreur de manière sécurisée
                if (result.reason === 'disabled') {
                    this.showNotification('Votre compte a été désactivé. Veuillez contacter l\'administrateur.', 'error');
                } else {
                    // Message générique pour la sécurité
                    this.showNotification('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.', 'error');
                }
                AuthModule.animateError(form);
            }
            
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            // Restaurer le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },
    
    // Gérer l'inscription
    async handleRegister(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Valider le formulaire
            if (!AuthModule.validateForm(form)) {
                return;
            }
            
            // Vérifier que les mots de passe correspondent
            if (form.password.value !== form.confirmPassword.value) {
                AuthModule.showFieldError(form.confirmPassword, 'Les mots de passe ne correspondent pas');
                return;
            }
            
            // Afficher le spinner
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Création du compte...';
            
            const userData = {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                password: form.password.value,
                role: form.role.value,
                company: form.company?.value.trim() || ''
            };
            
            // Créer l'utilisateur dans Notion
            const newUser = await this.createUser(userData);
            
            if (newUser) {
                // Créer automatiquement la session
                this.createSession(newUser, false);
                
                // Afficher le succès
                this.showNotification('Compte créé avec succès!', 'success');
                
                // Rediriger après un court délai
                setTimeout(() => {
                    this.redirectToRoleDashboard(newUser.role);
                }, 1500);
            } else {
                this.showNotification('Erreur lors de la création du compte', 'error');
            }
            
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            this.showNotification('Erreur lors de l\'inscription. Veuillez réessayer.', 'error');
        } finally {
            // Restaurer le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },
    
    // Gérer la déconnexion
    handleLogout() {
        // Afficher une confirmation
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            // Supprimer la session
            this.clearSession();
            
            // Afficher le message
            this.showNotification('Déconnexion réussie', 'success');
            
            // Rediriger vers la page de connexion
            setTimeout(() => {
                window.location.href = '/portal-project/login.html';
            }, 1000);
        }
    },
    
    // Authentifier un utilisateur avec la DB Notion
    async authenticateUser(email, password) {
        try {
            // Normaliser l'email
            email = email.toLowerCase();
            
            // Base de données des utilisateurs avec rôles déterminés par la DB
            const demoUsers = {
                'client@demo.ch': {
                    id: 'user_client_001',
                    name: 'Jean Dupont',
                    email: 'client@demo.ch',
                    role: 'client',
                    roles: ['client'], // Un seul rôle
                    company: 'Entreprise ABC',
                    avatar: '/assets/img/avatar-default.png',
                    password: 'demo123',
                    status: 'active'
                },
                'prestataire@demo.ch': {
                    id: 'user_prest_001',
                    name: 'Marie Martin',
                    email: 'prestataire@demo.ch',
                    role: 'prestataire',
                    roles: ['prestataire'], // Un seul rôle
                    company: 'Freelance Dev',
                    avatar: '/assets/img/avatar-default.png',
                    password: 'demo123',
                    status: 'active'
                },
                'revendeur@demo.ch': {
                    id: 'user_rev_001',
                    name: 'Pierre Durand',
                    email: 'revendeur@demo.ch',
                    role: 'revendeur',
                    roles: ['revendeur'], // Un seul rôle
                    company: 'Solutions Plus SA',
                    avatar: '/assets/img/avatar-default.png',
                    password: 'demo123',
                    status: 'active'
                },
                'admin@demo.ch': {
                    id: 'user_admin_001',
                    name: 'Admin System',
                    email: 'admin@demo.ch',
                    role: 'admin',
                    roles: ['admin'], // Rôle admin
                    company: 'Portal Admin',
                    avatar: '/assets/img/avatar-default.png',
                    password: 'demo123',
                    status: 'active'
                },
                'multi@demo.ch': {
                    id: 'user_multi_001',
                    name: 'Sophie Multi',
                    email: 'multi@demo.ch',
                    role: 'prestataire', // Rôle principal
                    roles: ['prestataire', 'revendeur'], // Multi-rôles
                    company: 'Multi Services SA',
                    avatar: '/assets/img/avatar-default.png',
                    password: 'demo123',
                    status: 'active'
                },
                'admin@groupe.ch': {
                    id: 'usr_005',
                    email: 'admin@groupe.ch',
                    password: 'superadmin123', // À changer en production
                    name: 'Paul Martin',
                    role: 'superadmin',
                    roles: ['superadmin'],
                    primaryRole: 'superadmin',
                    company: 'Groupe Consolidé',
                    avatar: '/assets/img/avatars/000m.jpg',
                    twoFactorEnabled: true, // 2FA obligatoire
                    ipWhitelist: ['127.0.0.1', '::1'], // À configurer avec vraies IPs
                    status: 'active'
                }
            };
            
            // Vérifier si l'utilisateur existe
            const user = demoUsers[email];
            if (!user) {
                return { success: false, reason: 'not_found' };
            }
            
            // Vérifier le mot de passe
            if (user.password !== password) {
                return { success: false, reason: 'wrong_password' };
            }
            
            // Vérifier le statut du compte
            if (user.status === 'disabled') {
                return { success: false, reason: 'disabled' };
            }
            
            // Retourner l'utilisateur sans le mot de passe
            const { password: _, ...userWithoutPassword } = user;
            
            // Quand Notion sera connecté, utiliser :
            // const response = await window.NotionConnector.auth.authenticateUser(email, password);
            
            return { success: true, user: userWithoutPassword };
            
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
            return { success: false, reason: 'error' };
        }
    },
    
    // Créer un nouvel utilisateur (simulé pour l'instant)
    async createUser(userData) {
        try {
            // TODO: Implémenter la création avec Notion MCP
            
            // Pour l'instant, on simule la création
            const newUser = {
                id: 'user_' + Date.now(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                company: userData.company,
                avatar: '/assets/img/avatar-default.png',
                createdAt: new Date().toISOString()
            };
            
            // Quand Notion sera connecté, utiliser :
            // const response = await window.NotionConnector.auth.createUser(userData);
            
            return newUser;
            
        } catch (error) {
            console.error('Erreur de création d\'utilisateur:', error);
            throw error;
        }
    },
    
    // Créer une session
    createSession(user, rememberMe = false) {
        const session = {
            isAuthenticated: true,
            user: user,
            role: user.role,
            timestamp: Date.now(),
            expiresAt: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000)
        };
        
        // Stocker la session
        if (rememberMe) {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } else {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
        
        // Mettre à jour l'état global si NotionConnector est disponible
        if (window.NotionConnector) {
            localStorage.setItem('auth', JSON.stringify({
                isAuthenticated: true,
                user: user,
                role: user.role
            }));
        }
    },
    
    // Récupérer la session
    getSession() {
        let session = sessionStorage.getItem(this.SESSION_KEY);
        if (!session) {
            session = localStorage.getItem(this.SESSION_KEY);
        }
        
        if (session) {
            const parsedSession = JSON.parse(session);
            
            // Vérifier l'expiration
            if (parsedSession.expiresAt && Date.now() > parsedSession.expiresAt) {
                this.clearSession();
                return null;
            }
            
            return parsedSession;
        }
        
        return null;
    },
    
    // Supprimer la session
    clearSession() {
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem('auth');
        
        // Vider le cache si NotionConnector est disponible
        if (window.NotionConnector && window.NotionConnector.cache) {
            window.NotionConnector.cache.clear();
        }
    },
    
    // Rediriger vers le dashboard approprié
    redirectToRoleDashboard(role) {
        const dashboards = {
            'client': '/portal-project/client/dashboard.html',
            'prestataire': '/portal-project/prestataire/dashboard.html',
            'revendeur': '/portal-project/revendeur/dashboard.html',
            'admin': '/portal-project/admin/dashboard.html', // Pour un futur espace admin
            'superadmin': '/portal-project/superadmin/dashboard.html' // Espace superadmin
        };
        
        const dashboard = dashboards[role] || '/portal-project/login.html';
        window.location.href = dashboard;
    },
    
    // Afficher le sélecteur de rôle pour les utilisateurs multi-rôles
    async showRoleSelector(user, rememberMe) {
        // Créer un modal pour la sélection du rôle
        const modalHTML = `
            <div class="modal modal-blur fade show" id="roleSelector" tabindex="-1" style="display: block;" aria-modal="true">
                <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Sélectionner votre espace</h5>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <span class="avatar avatar-xl">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                                <h3 class="mt-2">${user.name}</h3>
                                <div class="text-muted">Vous avez accès à plusieurs espaces</div>
                            </div>
                            <div class="form-selectgroup form-selectgroup-vertical">
                                ${user.roles.map(role => `
                                    <label class="form-selectgroup-item">
                                        <input type="radio" name="selectedRole" value="${role}" class="form-selectgroup-input">
                                        <span class="form-selectgroup-label d-flex align-items-center">
                                            ${this.getRoleIcon(role)}
                                            <div class="ms-3">
                                                <div class="font-weight-medium">${this.getRoleLabel(role)}</div>
                                                <div class="text-muted small">${this.getRoleDescription(role)}</div>
                                            </div>
                                        </span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary w-100" id="confirmRole">
                                <i class="ti ti-login icon"></i>
                                Accéder à cet espace
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        `;
        
        // Ajouter le modal au body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Gérer la sélection
        return new Promise((resolve) => {
            const confirmBtn = document.getElementById('confirmRole');
            confirmBtn.addEventListener('click', () => {
                const selectedRole = document.querySelector('input[name="selectedRole"]:checked')?.value;
                
                if (selectedRole) {
                    // Mettre à jour le rôle de l'utilisateur
                    user.role = selectedRole;
                    
                    // Créer la session
                    this.createSession(user, rememberMe);
                    
                    // Fermer le modal
                    document.getElementById('roleSelector').remove();
                    document.querySelector('.modal-backdrop').remove();
                    
                    // Afficher le succès
                    this.showNotification(`Bienvenue ${user.name}!`, 'success');
                    
                    // Rediriger
                    setTimeout(() => {
                        this.redirectToRoleDashboard(selectedRole);
                    }, 1000);
                    
                    resolve(selectedRole);
                }
            });
            
            // Sélectionner le premier rôle par défaut
            document.querySelector('input[name="selectedRole"]').checked = true;
        });
    },
    
    // Obtenir l'icône du rôle
    getRoleIcon(role) {
        const icons = {
            'client': '<i class="ti ti-briefcase icon text-blue"></i>',
            'prestataire': '<i class="ti ti-tools icon text-green"></i>',
            'revendeur': '<i class="ti ti-building-store icon text-orange"></i>',
            'admin': '<i class="ti ti-shield icon text-red"></i>',
            'superadmin': '<i class="ti ti-crown icon text-red"></i>'
        };
        return icons[role] || '<i class="ti ti-user icon"></i>';
    },
    
    // Obtenir le label du rôle
    getRoleLabel(role) {
        const labels = {
            'client': 'Espace Client',
            'prestataire': 'Espace Prestataire',
            'revendeur': 'Espace Revendeur',
            'admin': 'Administration',
            'superadmin': 'Superadmin Groupe'
        };
        return labels[role] || role;
    },
    
    // Obtenir la description du rôle
    getRoleDescription(role) {
        const descriptions = {
            'client': 'Gérer vos projets et documents',
            'prestataire': 'Accéder à vos missions et récompenses',
            'revendeur': 'Gérer votre pipeline et vos clients',
            'admin': 'Administration complète du système',
            'superadmin': 'Gestion consolidée du groupe et des entités'
        };
        return descriptions[role] || '';
    },
    
    // Afficher une notification
    showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        notification.innerHTML = `
            <div class="d-flex">
                <div>
                    ${type === 'success' ? '<i class="ti ti-check icon"></i>' : 
                      type === 'error' ? '<i class="ti ti-alert-circle icon"></i>' : 
                      '<i class="ti ti-info-circle icon"></i>'}
                </div>
                <div class="ms-2">
                    <h4 class="alert-title">${type === 'success' ? 'Succès' : 
                                             type === 'error' ? 'Erreur' : 'Information'}</h4>
                    <div class="text-secondary">${message}</div>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Ajouter au body
        document.body.appendChild(notification);
        
        // Auto-fermer après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 150);
        }, 5000);
    },
    
    // Récupérer les informations de l'utilisateur connecté
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
    },
    
    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        const session = this.getSession();
        return session && session.isAuthenticated;
    },
    
    // Vérifier le rôle de l'utilisateur
    hasRole(role) {
        const session = this.getSession();
        return session && session.user && session.user.role === role;
    },
    
    // Mettre à jour les informations de l'utilisateur
    async updateUserProfile(updates) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }
            
            // TODO: Implémenter la mise à jour avec Notion MCP
            
            // Pour l'instant, on met à jour localement
            const updatedUser = { ...currentUser, ...updates };
            
            // Mettre à jour la session
            const session = this.getSession();
            if (session) {
                session.user = updatedUser;
                
                if (localStorage.getItem(this.SESSION_KEY)) {
                    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
                } else {
                    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
                }
            }
            
            return updatedUser;
            
        } catch (error) {
            console.error('Erreur de mise à jour du profil:', error);
            throw error;
        }
    }
};

// Exporter le module
window.AuthNotionModule = AuthNotionModule;

// Initialiser automatiquement si le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthNotionModule.init());
} else {
    AuthNotionModule.init();
}

// Rendre la fonction showNotification globale pour d'autres modules
window.showNotification = AuthNotionModule.showNotification;