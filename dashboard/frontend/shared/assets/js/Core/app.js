/**
 * Application Portal Multi-Rôles
 * Gestion de l'interface et des interactions utilisateur
 */

// Charger automatiquement les optimisations v2
(function loadOptimizations() {
    const script = document.createElement('script');
    script.src = '/assets/js/optimization-activator.js';
    script.async = true;
    document.head.appendChild(script);
})();

// Configuration de l'application
const APP_CONFIG = {
    appName: 'Portal Multi-Rôles',
    version: '1.0.0',
    apiUrl: '/api', // URL de l'API (simulée pour le dev)
    roles: {
        client: {
            name: 'Client',
            color: '#206bc4',
            icon: 'ti-briefcase',
            path: '/client/'
        },
        prestataire: {
            name: 'Prestataire', 
            color: '#2fb344',
            icon: 'ti-tools',
            path: '/prestataire/'
        },
        revendeur: {
            name: 'Revendeur',
            color: '#f76707',
            icon: 'ti-building-store',
            path: '/revendeur/'
        }
    }
};

// Objet principal de l'application
const PortalApp = {
    // Propriétés
    currentUser: null,
    currentRole: null,
    notifications: [],
    
    // Initialisation de l'application
    init() {
        console.log('🚀 Initialisation de ' + APP_CONFIG.appName);
        
        // Vérifier si un utilisateur est connecté
        this.checkAuthentication();
        
        // Initialiser les événements
        this.initEventListeners();
        
        // Initialiser les notifications
        this.initNotifications();
        
        // Appliquer le thème du rôle si connecté
        if (this.currentUser) {
            this.applyRoleTheme();
        }
    },
    
    // Vérifier l'authentification
    checkAuthentication() {
        const userData = localStorage.getItem('portal_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.currentRole = this.currentUser.role;
            console.log('✅ Utilisateur connecté:', this.currentUser.name);
        }
    },
    
    // Détecter le rôle de l'utilisateur
    detectUserRole() {
        if (!this.currentUser) return null;
        return this.currentUser.role;
    },
    
    // Simulation de connexion améliorée
    simulateLogin(email, password, role = null) {
        // En mode développement, créer un utilisateur selon le rôle sélectionné
        if (role) {
            const usersByRole = {
                client: {
                    id: 1,
                    name: 'Jean Dupont',
                    email: email || 'jean.dupont@email.ch',
                    role: 'client',
                    avatar: 'JD',
                    company: 'Société ABC SA',
                    createdAt: new Date()
                },
                prestataire: {
                    id: 2,
                    name: 'Marie Martin',
                    email: email || 'marie.martin@email.ch',
                    role: 'prestataire',
                    avatar: 'MM',
                    skills: ['Développement web', 'Design UI/UX'],
                    rating: 4.5,
                    level: 'GOLD',
                    createdAt: new Date()
                },
                revendeur: {
                    id: 3,
                    name: 'Pierre Durand',
                    email: email || 'pierre.durand@email.ch',
                    role: 'revendeur',
                    avatar: 'PD',
                    company: 'Solutions Pro SA',
                    region: 'Région Léman',
                    createdAt: new Date()
                }
            };
            
            const user = usersByRole[role];
            if (user) {
                // Stocker l'utilisateur
                this.currentUser = user;
                this.currentRole = role;
                localStorage.setItem('portal_user', JSON.stringify(user));
                
                // Rediriger vers le dashboard approprié
                this.redirectToDashboard();
                return true;
            }
        }
        
        // Base de données simulée des utilisateurs (fallback)
        const users = [
            {
                id: 1,
                name: 'Jean Dupont',
                email: 'jean.dupont@email.ch',
                password: 'demo123',
                role: 'client',
                avatar: 'JD',
                company: 'Société ABC SA'
            },
            {
                id: 2,
                name: 'Marie Martin',
                email: 'marie.martin@email.ch',
                password: 'demo123',
                role: 'prestataire',
                avatar: 'MM',
                skills: ['Développement web', 'Design UI/UX'],
                rating: 4.5
            },
            {
                id: 3,
                name: 'Pierre Durand',
                email: 'pierre.durand@email.ch',
                password: 'demo123',
                role: 'revendeur',
                avatar: 'PD',
                company: 'Solutions Pro SA'
            }
        ];
        
        // Vérifier les identifiants
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Stocker l'utilisateur
            this.currentUser = user;
            this.currentRole = user.role;
            localStorage.setItem('portal_user', JSON.stringify(user));
            
            // Rediriger vers le dashboard approprié
            this.redirectToDashboard();
            return true;
        }
        
        return false;
    },
    
    // Gérer la soumission du formulaire de connexion
    handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const role = form.querySelector('input[name="role"]:checked')?.value || 'client';
        const remember = form.remember?.checked || false;
        
        // Validation basique
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // En mode développement, accepter toute connexion avec le rôle sélectionné
        if (this.simulateLogin(email, password, role)) {
            if (remember) {
                localStorage.setItem('portal_remember', 'true');
            }
            // Redirection automatique gérée dans simulateLogin
        } else {
            this.showAlert('Identifiants incorrects. Veuillez réessayer.', 'danger');
        }
    },
    
    // Gérer l'inscription
    handleRegister(formData) {
        // Simuler la création d'un compte
        const newUser = {
            id: Date.now(),
            name: formData.name,
            email: formData.email,
            role: formData.accountType,
            avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
            createdAt: new Date()
        };
        
        // Ajouter les champs spécifiques selon le rôle
        if (formData.accountType === 'client' || formData.accountType === 'revendeur') {
            newUser.company = formData.company;
        } else if (formData.accountType === 'prestataire') {
            newUser.skills = formData.skills.split(',').map(s => s.trim());
            newUser.rating = 0;
            newUser.level = 'BRONZE';
        }
        
        // Afficher un message de succès
        this.showToast('Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.', 'success');
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        return true;
    },
    
    // Vérifier l'authentification et les permissions
    checkAuth() {
        const userData = localStorage.getItem('portal_user');
        
        if (!userData) {
            return false;
        }
        
        try {
            const user = JSON.parse(userData);
            this.currentUser = user;
            this.currentRole = user.role;
            
            // Vérifier que l'utilisateur accède au bon espace
            const currentPath = window.location.pathname;
            const allowedPath = `/${user.role}/`;
            
            if (!currentPath.includes(allowedPath) && !currentPath.includes('login.html') && !currentPath.includes('index.html')) {
                console.warn('⚠️ Accès non autorisé à cet espace');
                this.redirectToDashboard();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
            localStorage.removeItem('portal_user');
            return false;
        }
    },
    
    // Rediriger vers le bon dashboard selon le rôle
    redirectToDashboard() {
        if (!this.currentRole) return;
        
        const roleConfig = APP_CONFIG.roles[this.currentRole];
        if (roleConfig) {
            window.location.href = `${roleConfig.path}dashboard.html`;
        }
    },
    
    // Déconnexion
    logout() {
        localStorage.removeItem('portal_user');
        this.currentUser = null;
        this.currentRole = null;
        window.location.href = '/index.html';
    },
    
    // Appliquer le thème du rôle
    applyRoleTheme() {
        if (!this.currentRole) return;
        
        // Ajouter la classe du rôle au body
        document.body.classList.add(`role-${this.currentRole}`);
        
        // Mettre à jour les couleurs CSS si nécessaire
        const roleConfig = APP_CONFIG.roles[this.currentRole];
        if (roleConfig && roleConfig.color) {
            document.documentElement.style.setProperty('--tblr-primary', roleConfig.color);
        }
    },
    
    // Initialiser les notifications
    initNotifications() {
        // Notifications simulées
        this.notifications = [
            {
                id: 1,
                title: 'Nouveau message',
                message: 'Vous avez reçu un nouveau message',
                type: 'info',
                time: new Date(Date.now() - 300000), // Il y a 5 minutes
                read: false
            },
            {
                id: 2,
                title: 'Tâche terminée',
                message: 'La tâche #1234 a été complétée',
                type: 'success',
                time: new Date(Date.now() - 3600000), // Il y a 1 heure
                read: false
            }
        ];
        
        // Mettre à jour le compteur
        this.updateNotificationCount();
    },
    
    // Mettre à jour le compteur de notifications
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    },
    
    // Marquer une notification comme lue
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationCount();
        }
    },
    
    // Initialiser les événements
    initEventListeners() {
        // Formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Formulaire d'inscription
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validation
                if (!registerForm.checkValidity()) {
                    e.stopPropagation();
                    registerForm.classList.add('was-validated');
                    return;
                }
                
                // Récupérer les données du formulaire
                const formData = {
                    name: registerForm.name.value,
                    email: registerForm.email.value,
                    password: registerForm.password.value,
                    accountType: registerForm.accountType.value,
                    company: registerForm.company?.value,
                    skills: registerForm.skills?.value
                };
                
                // Vérifier que les mots de passe correspondent
                if (formData.password !== registerForm.confirmPassword.value) {
                    registerForm.confirmPassword.classList.add('is-invalid');
                    return;
                }
                
                // Gérer l'inscription
                this.handleRegister(formData);
            });
        }
        
        // Boutons de déconnexion
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    },
    
    // Afficher une alerte
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible`;
        alertDiv.innerHTML = `
            ${message}
            <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
        `;
        
        // Ajouter l'alerte en haut de la page
        const container = document.querySelector('.page-body') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-fermer après 5 secondes
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    },
    
    // Helpers pour le formatage
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-CH', {
            style: 'currency',
            currency: 'CHF'
        }).format(amount);
    },
    
    formatDate(date) {
        return new Intl.DateTimeFormat('fr-CH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },
    
    formatDateTime(date) {
        return new Intl.DateTimeFormat('fr-CH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },
    
    // Générer un graphique (nécessite Chart.js)
    generateChart(elementId, type, data, options = {}) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        // Vérifier si Chart.js est chargé
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js n\'est pas chargé');
            return;
        }
        
        return new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });
    },
    
    // Charger des données (simulation)
    async loadData(endpoint) {
        // Simulation d'un appel API
        console.log(`📊 Chargement des données: ${endpoint}`);
        
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retourner des données simulées selon l'endpoint
        const mockData = {
            '/api/dashboard/stats': {
                totalProjects: 12,
                activeProjects: 5,
                completedProjects: 7,
                revenue: 45000
            },
            '/api/notifications': this.notifications,
            '/api/user/profile': this.currentUser
        };
        
        return mockData[endpoint] || {};
    },
    
    // Utilitaire pour la gestion des formulaires
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    },
    
    // Gestion du drag & drop pour la dropzone
    initDropzone(element) {
        if (!element) return;
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('dragover');
        });
        
        element.addEventListener('dragleave', () => {
            element.classList.remove('dragover');
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            console.log('📎 Fichiers déposés:', files);
            
            // Traiter les fichiers...
            this.handleFileUpload(files);
        });
    },
    
    // Gestion de l'upload de fichiers
    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            console.log(`📄 Fichier: ${file.name} (${this.formatFileSize(file.size)})`);
            // Logique d'upload...
        });
    },
    
    // Formater la taille de fichier
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    // Charger le layout de base
    async loadLayout() {
        try {
            // Charger le layout de base
            const layoutResponse = await fetch('../shared/layout-base.html');
            const layoutHtml = await layoutResponse.text();
            
            // Parser le HTML
            const parser = new DOMParser();
            const layoutDoc = parser.parseFromString(layoutHtml, 'text/html');
            
            // Charger la navbar
            const navbarResponse = await fetch('../shared/navbar-top.html');
            const navbarHtml = await navbarResponse.text();
            
            // Charger la sidebar selon le rôle
            const sidebarFile = `../shared/sidebar-${this.currentRole}.html`;
            const sidebarResponse = await fetch(sidebarFile);
            const sidebarHtml = await sidebarResponse.text();
            
            // Injecter le contenu
            const navbarPlaceholder = document.querySelector('header.navbar');
            if (navbarPlaceholder) {
                navbarPlaceholder.innerHTML = navbarHtml;
            }
            
            const sidebarPlaceholder = document.querySelector('#sidebar-menu');
            if (sidebarPlaceholder) {
                sidebarPlaceholder.innerHTML = sidebarHtml;
            }
            
            // Mettre à jour les infos utilisateur
            this.updateUserInfo();
            
            // Initialiser le menu actif
            this.setActiveMenuItem();
            
            // Réinitialiser les événements après le chargement du layout
            this.initEventListeners();
            
            console.log('✅ Layout chargé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement du layout:', error);
        }
    },
    
    // Mettre à jour les informations utilisateur dans l'interface
    updateUserInfo() {
        if (!this.currentUser) return;
        
        // Mettre à jour l'avatar
        const avatars = document.querySelectorAll('.user-avatar');
        avatars.forEach(avatar => {
            avatar.textContent = this.currentUser.avatar;
            avatar.style.backgroundColor = APP_CONFIG.roles[this.currentRole].color;
        });
        
        // Mettre à jour le nom
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = this.currentUser.name;
        }
        
        // Mettre à jour le rôle
        const userRole = document.getElementById('user-role');
        if (userRole) {
            userRole.textContent = APP_CONFIG.roles[this.currentRole].name;
        }
        
        // Mettre à jour le compteur de notifications
        this.updateNotificationCount();
    },
    
    // Définir l'élément de menu actif
    setActiveMenuItem(pageName = null) {
        // Si aucun nom de page n'est fourni, essayer de le détecter depuis l'URL
        if (!pageName) {
            const path = window.location.pathname;
            const match = path.match(/\/([^\/]+)\.html$/);
            pageName = match ? match[1] : 'dashboard';
        }
        
        // Retirer toutes les classes actives
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('.nav-link');
            if (link) link.classList.remove('active');
        });
        
        // Ajouter la classe active à l'élément correspondant
        const activeItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            const link = activeItem.querySelector('.nav-link');
            if (link) link.classList.add('active');
        }
    },
    
    // Basculer la sidebar mobile
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.navbar-vertical');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
            document.body.classList.toggle('sidebar-open');
        }
    },
    
    // Initialiser le layout (appelé depuis layout-base.html)
    initLayout() {
        // Vérifier l'authentification
        if (!this.currentUser) {
            // Rediriger vers la page de connexion si non connecté
            window.location.href = '../login.html';
            return;
        }
        
        // Appliquer le thème du rôle
        this.applyRoleTheme();
        
        // Charger le layout
        this.loadLayout();
        
        // Gérer la sidebar mobile
        const toggleBtn = document.querySelector('.navbar-toggler');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileSidebar();
            });
        }
        
        // Fermer la sidebar mobile lors du clic sur l'overlay
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }
    },
    
    // Afficher un toast de notification
    showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toastId = `toast-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: duration
        });
        
        toast.show();
        
        // Supprimer le toast après sa fermeture
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },
    
    // Fonction pour initialiser les graphiques du dashboard
    initDashboardCharts() {
        console.log('📊 Initialisation des graphiques du dashboard');
        // Cette fonction sera implémentée dans dashboard-client.js
    },
    
    // Charger les données du dashboard (sera surchargée dans dashboard-client.js)
    loadDashboardData() {
        console.log('📊 Chargement des données du dashboard');
        // Cette fonction sera implémentée spécifiquement dans chaque dashboard
    }
};

// Initialiser l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    PortalApp.init();
    
    // Charger le module de navigation mobile
    const mobileNavScript = document.createElement('script');
    mobileNavScript.src = '/portal-project/assets/js/Core/mobile-navigation.js';
    mobileNavScript.async = true;
    document.head.appendChild(mobileNavScript);
    
    // Charger le gestionnaire de breadcrumbs
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.src = '/portal-project/assets/js/Core/breadcrumb-manager.js';
    breadcrumbScript.async = true;
    document.head.appendChild(breadcrumbScript);
    
    // Charger le gestionnaire des états actifs de la sidebar
    const sidebarScript = document.createElement('script');
    sidebarScript.src = '/portal-project/assets/js/Core/sidebar-active-state.js';
    sidebarScript.async = true;
    document.head.appendChild(sidebarScript);
    
    // Charger le gestionnaire de modals
    const modalScript = document.createElement('script');
    modalScript.src = '/portal-project/assets/js/Core/modal-manager.js';
    modalScript.async = true;
    document.head.appendChild(modalScript);
    
    // Charger le standardiseur de boutons
    const buttonScript = document.createElement('script');
    buttonScript.src = '/portal-project/assets/js/Core/button-standardizer.js';
    buttonScript.async = true;
    document.head.appendChild(buttonScript);
    
    // Charger le wrapper responsive pour tables
    const tableScript = document.createElement('script');
    tableScript.src = '/portal-project/assets/js/Core/table-responsive-wrapper.js';
    tableScript.async = true;
    document.head.appendChild(tableScript);
    
    // Charger le composant Timeline
    const timelineScript = document.createElement('script');
    timelineScript.src = '/portal-project/assets/js/Core/timeline-component.js';
    timelineScript.async = true;
    document.head.appendChild(timelineScript);
    
    // Charger le composant Steps
    const stepsScript = document.createElement('script');
    stepsScript.src = '/portal-project/assets/js/Core/steps-component.js';
    stepsScript.async = true;
    document.head.appendChild(stepsScript);
    
    // Charger le composant Placeholder Loading
    const placeholderScript = document.createElement('script');
    placeholderScript.src = '/portal-project/assets/js/Core/placeholder-loading.js';
    placeholderScript.async = true;
    document.head.appendChild(placeholderScript);
    
    // Charger l'optimiseur calendrier mobile
    const calendarMobileScript = document.createElement('script');
    calendarMobileScript.src = '/portal-project/assets/js/Core/calendar-mobile-optimizer.js';
    calendarMobileScript.async = true;
    document.head.appendChild(calendarMobileScript);
    
    // Charger le lazy loading des images
    const lazyLoadingScript = document.createElement('script');
    lazyLoadingScript.src = '/portal-project/assets/js/Core/lazy-loading-images.js';
    lazyLoadingScript.async = true;
    document.head.appendChild(lazyLoadingScript);
    
    // Charger le fix memory leak calendrier
    const calendarFixScript = document.createElement('script');
    calendarFixScript.src = '/portal-project/assets/js/Core/calendar-memory-fix.js';
    calendarFixScript.async = true;
    document.head.appendChild(calendarFixScript);
    
    // Charger le fix pipeline drag Firefox
    const pipelineFixScript = document.createElement('script');
    pipelineFixScript.src = '/portal-project/assets/js/Core/pipeline-drag-fix.js';
    pipelineFixScript.async = true;
    document.head.appendChild(pipelineFixScript);
    
    // Charger les corrections UI cosmétiques
    const uiPolishScript = document.createElement('script');
    uiPolishScript.src = '/portal-project/assets/js/Core/ui-polish-fixes.js';
    uiPolishScript.async = true;
    document.head.appendChild(uiPolishScript);
});

// Exporter pour utilisation dans d'autres scripts
window.PortalApp = PortalApp;