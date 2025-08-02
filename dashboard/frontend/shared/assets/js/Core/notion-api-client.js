// notion-api-client.js - Client pour communiquer avec le serveur API Notion
const NotionAPIClient = {
    // Configuration
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api' 
        : 'https://api.votredomaine.com/api',
    
    // Token JWT stocké en mémoire (plus sécurisé que localStorage)
    _token: null,
    
    // Setter/Getter pour le token
    setToken(token) {
        this._token = token;
    },
    
    getToken() {
        return this._token;
    },
    
    // Headers par défaut
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this._token) {
            headers['Authorization'] = `Bearer ${this._token}`;
        }
        
        return headers;
    },
    
    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${this.API_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });
            
            // Gérer les erreurs HTTP
            if (!response.ok) {
                const error = await response.json();
                
                // Si token expiré, essayer de le rafraîchir
                if (response.status === 401 && error.error === 'Token expiré') {
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Réessayer la requête avec le nouveau token
                        return this.request(endpoint, options);
                    }
                }
                
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },
    
    // Authentification
    async login(email, password) {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (response.success) {
                this.setToken(response.token);
                return response;
            }
            
            throw new Error(response.error || 'Erreur de connexion');
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    async register(userData) {
        try {
            const response = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (response.success) {
                this.setToken(response.token);
                return response;
            }
            
            throw new Error(response.error || 'Erreur d\'inscription');
            
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },
    
    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
            
            this.setToken(null);
            return { success: true };
            
        } catch (error) {
            console.error('Logout error:', error);
            // Même en cas d'erreur, on supprime le token local
            this.setToken(null);
            return { success: true };
        }
    },
    
    async getCurrentUser() {
        try {
            return await this.request('/auth/me');
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },
    
    async refreshToken() {
        try {
            if (!this._token) return false;
            
            const response = await this.request('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ token: this._token })
            });
            
            if (response.success) {
                this.setToken(response.token);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Refresh token error:', error);
            return false;
        }
    },
    
    // Requêtes Notion génériques
    async queryDatabase(databaseId, options = {}) {
        return this.request('/notion/query', {
            method: 'POST',
            body: JSON.stringify({
                database_id: databaseId,
                ...options
            })
        });
    },
    
    async getPage(pageId) {
        return this.request(`/notion/page/${pageId}`);
    },
    
    async createPage(databaseId, properties, children = []) {
        return this.request('/notion/page', {
            method: 'POST',
            body: JSON.stringify({
                database_id: databaseId,
                properties,
                children
            })
        });
    },
    
    async updatePage(pageId, properties) {
        return this.request(`/notion/page/${pageId}`, {
            method: 'PATCH',
            body: JSON.stringify({ properties })
        });
    },
    
    // Méthodes spécifiques par domaine
    
    // CLIENT
    async getClientProjects() {
        return this.request('/notion/client/projects');
    },
    
    async getClientDocuments() {
        return this.request('/notion/client/documents');
    },
    
    // PRESTATAIRE
    async getPrestataireMissions() {
        return this.request('/notion/prestataire/missions');
    },
    
    async getPrestataireTasks() {
        return this.request('/notion/prestataire/tasks');
    },
    
    // REVENDEUR
    async getRevendeurPipeline() {
        return this.request('/notion/revendeur/pipeline');
    },
    
    // TIME TRACKING
    async getTimeEntries(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        return this.request(`/notion/timetracking/entries?${params}`);
    },
    
    // Utilitaires
    
    // Gestion du cache côté client
    cache: new Map(),
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    
    async cachedRequest(key, requestFn) {
        // Vérifier le cache
        const cached = this.cache.get(key);
        if (cached && Date.now() < cached.expires) {
            return cached.data;
        }
        
        // Faire la requête
        const data = await requestFn();
        
        // Mettre en cache
        this.cache.set(key, {
            data,
            expires: Date.now() + this.CACHE_TTL
        });
        
        return data;
    },
    
    invalidateCache(pattern) {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    },
    
    // Gestion des erreurs réseau avec retry
    async retryRequest(requestFn, maxRetries = 3) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                // Ne pas réessayer pour les erreurs client
                if (error.message.includes('4')) {
                    throw error;
                }
                
                // Attendre avant de réessayer (backoff exponentiel)
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, i) * 1000)
                );
            }
        }
        
        throw lastError;
    },
    
    // Observer pour les changements de token
    _tokenObservers: [],
    
    onTokenChange(callback) {
        this._tokenObservers.push(callback);
    },
    
    _notifyTokenChange() {
        this._tokenObservers.forEach(callback => callback(this._token));
    }
};

// Override du setToken pour notifier les observers
const originalSetToken = NotionAPIClient.setToken.bind(NotionAPIClient);
NotionAPIClient.setToken = function(token) {
    originalSetToken(token);
    this._notifyTokenChange();
};

// Export global
window.NotionAPIClient = NotionAPIClient;