// messages-notion.js - Intégration Notion pour les messages prestataire
// Ce fichier gère la connexion avec les bases de données Notion pour la messagerie

const MessagesNotion = {
    // Configuration
    DB_IDS: {
        MESSAGES: '236adb95-3c6f-8079-a142-d8b547321489',
        CONVERSATIONS: '236adb95-3c6f-8024-94b1-ef0928d5c8a9'
    },
    
    // État local
    currentConversation: null,
    allConversations: [],
    currentFilter: 'all',
    refreshTimer: null,
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la messagerie avec Notion');
        this.loadConversations();
        this.attachEventListeners();
        this.startAutoRefresh();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Bouton nouveau message
        const newMessageBtn = document.getElementById('new-message-btn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', () => this.showNewMessageModal());
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-messages');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadConversations());
        }
        
        // Recherche
        const searchInput = document.getElementById('search-messages');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchConversations(e.target.value);
            });
        }
        
        // Filtres
        document.querySelectorAll('[data-filter-messages]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterConversations(e.target.dataset.filterMessages);
            });
        });
        
        // Envoi de message
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Écouter Enter dans la zone de texte
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    },
    
    // Démarrer le rafraîchissement automatique
    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.loadConversations(true); // silent refresh
        }, 30000); // 30 secondes
    },
    
    // Arrêter le rafraîchissement automatique
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    
    // Charger les conversations depuis Notion
    async loadConversations(silent = false) {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les messages
            const canViewMessages = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'messages',
                'view.own'
            );
            
            if (!canViewMessages) {
                window.showNotification('Vous n\'avez pas accès aux messages', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            if (!silent) {
                this.showLoadingState();
            }
            
            // Récupérer les conversations avec le middleware sécurisé
            const conversations = await window.PermissionsMiddleware.secureApiCall(
                'messages',
                'view',
                this.getPrestataireConversations.bind(this),
                currentUser.id
            );
            
            // Enrichir les conversations
            const enrichedConversations = this.enrichConversationsData(conversations);
            
            // Stocker les conversations
            this.allConversations = enrichedConversations;
            
            // Mettre à jour l'interface
            this.updateConversationsView(enrichedConversations);
            this.updateMessagesStats(enrichedConversations);
            
            if (!silent) {
                this.hideLoadingState();
            }
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'messages.list', true, {
                conversationCount: conversations.length,
                prestataireId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des conversations:', error);
            if (!silent) {
                this.showErrorState();
            }
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'messages.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les conversations du prestataire (stub)
    async getPrestataireConversations(prestataireId) {
        // TODO: Implémenter la vraie requête Notion
        // Pour l'instant, on simule avec des données de démo
        return [
            {
                id: 'conv1',
                participantName: 'Marie Dubois',
                participantRole: 'client',
                participantAvatar: '../assets/img/avatars/001-man.jpg',
                lastMessage: 'Merci pour la livraison du module. Tout fonctionne parfaitement !',
                lastMessageDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
                unreadCount: 0,
                status: 'active',
                projectId: 'p1',
                projectName: 'Projet API TechCorp',
                messages: [
                    {
                        id: 'm1',
                        senderId: 'client1',
                        senderName: 'Marie Dubois',
                        content: 'Bonjour, j\'aimerais faire le point sur l\'avancement du projet API.',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        type: 'text'
                    },
                    {
                        id: 'm2',
                        senderId: prestataireId,
                        senderName: 'Vous',
                        content: 'Bonjour Marie, le développement avance bien. J\'ai terminé l\'authentification et je travaille actuellement sur les endpoints de gestion des utilisateurs.',
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        type: 'text'
                    },
                    {
                        id: 'm3',
                        senderId: 'client1',
                        senderName: 'Marie Dubois',
                        content: 'Merci pour la livraison du module. Tout fonctionne parfaitement !',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        type: 'text'
                    }
                ]
            },
            {
                id: 'conv2',
                participantName: 'Jean Martin',
                participantRole: 'client',
                participantAvatar: '../assets/img/avatars/002-woman.jpg',
                lastMessage: 'Pouvez-vous me envoyer une estimation pour les modifications ?',
                lastMessageDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // Il y a 8h
                unreadCount: 2,
                status: 'active',
                projectId: 'p2',
                projectName: 'App Mobile StartupFood',
                messages: [
                    {
                        id: 'm4',
                        senderId: 'client2',
                        senderName: 'Jean Martin',
                        content: 'Bonjour, nous aimerions ajouter une nouvelle fonctionnalité à l\'app.',
                        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                        type: 'text'
                    },
                    {
                        id: 'm5',
                        senderId: 'client2',
                        senderName: 'Jean Martin',
                        content: 'Pouvez-vous me envoyer une estimation pour les modifications ?',
                        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                        type: 'text'
                    }
                ]
            },
            {
                id: 'conv3',
                participantName: 'Support Technique',
                participantRole: 'admin',
                participantAvatar: '../assets/img/avatars/003-user.jpg',
                lastMessage: 'Votre ticket #1234 a été résolu.',
                lastMessageDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
                unreadCount: 1,
                status: 'archived',
                projectId: null,
                projectName: 'Support général',
                messages: [
                    {
                        id: 'm6',
                        senderId: 'admin1',
                        senderName: 'Support Technique',
                        content: 'Votre ticket #1234 a été résolu.',
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        type: 'text'
                    }
                ]
            }
        ];
    },
    
    // Enrichir les données des conversations
    enrichConversationsData(conversations) {
        return conversations.map(conv => ({
            ...conv,
            formattedLastMessageDate: this.formatMessageTime(conv.lastMessageDate),
            isRecent: this.isRecentMessage(conv.lastMessageDate),
            hasUnread: conv.unreadCount > 0
        }));
    },
    
    // Mettre à jour la vue des conversations
    updateConversationsView(conversations) {
        const container = document.getElementById('conversations-list');
        if (!container) return;
        
        if (conversations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="ti ti-message-off fs-1 mb-3"></i>
                    <h3>Aucune conversation</h3>
                    <p>Commencez une nouvelle conversation</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = conversations.map(conv => `
            <div class="list-group-item conversation-item ${conv.hasUnread ? 'unread' : ''}" 
                 data-conversation-id="${conv.id}"
                 onclick="MessagesNotion.openConversation('${conv.id}')">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="avatar" style="background-image: url(${conv.participantAvatar})"></span>
                    </div>
                    <div class="col">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <div class="font-weight-medium">${conv.participantName}</div>
                            <div class="text-muted small">${conv.formattedLastMessageDate}</div>
                        </div>
                        <div class="text-muted small mb-1">${conv.projectName}</div>
                        <div class="text-truncate ${conv.hasUnread ? 'font-weight-medium' : 'text-muted'}">
                            ${conv.lastMessage}
                        </div>
                    </div>
                    ${conv.hasUnread ? `
                        <div class="col-auto">
                            <span class="badge bg-red badge-pill">${conv.unreadCount}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les statistiques
    updateMessagesStats(conversations) {
        const stats = {
            total: conversations.length,
            unread: conversations.filter(c => c.hasUnread).length,
            active: conversations.filter(c => c.status === 'active').length,
            archived: conversations.filter(c => c.status === 'archived').length
        };
        
        // Mettre à jour les compteurs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('total-conversations', stats.total);
        updateStat('unread-conversations', stats.unread);
        updateStat('active-conversations', stats.active);
        updateStat('archived-conversations', stats.archived);
        
        // Mettre à jour les badges de filtre
        document.querySelectorAll('[data-filter-count]').forEach(badge => {
            const filter = badge.dataset.filterCount;
            if (filter === 'all') badge.textContent = stats.total;
            else if (filter === 'unread') badge.textContent = stats.unread;
            else if (filter === 'active') badge.textContent = stats.active;
            else if (filter === 'archived') badge.textContent = stats.archived;
        });
    },
    
    // Ouvrir une conversation
    async openConversation(conversationId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour voir cette conversation
            const canViewConversation = await window.PermissionsNotion.checkResourceAccess(
                'messages',
                'view',
                { conversationId: conversationId, userId: currentUser.id }
            );
            
            if (!canViewConversation) {
                window.showNotification('Vous n\'avez pas accès à cette conversation', 'error');
                return;
            }
            
            // Trouver la conversation
            const conversation = this.allConversations.find(c => c.id === conversationId);
            if (!conversation) return;
            
            this.currentConversation = conversation;
            
            // Mettre à jour l'interface de chat
            this.updateChatView(conversation);
            
            // Marquer comme lue
            if (conversation.hasUnread) {
                await this.markConversationAsRead(conversationId);
            }
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'messages.conversation', true, {
                conversationId: conversationId,
                participantRole: conversation.participantRole
            });
            
        } catch (error) {
            console.error('Erreur ouverture conversation:', error);
            window.showNotification('Erreur lors de l\'ouverture de la conversation', 'error');
        }
    },
    
    // Mettre à jour la vue du chat
    updateChatView(conversation) {
        // Mettre à jour l'en-tête du chat
        const chatHeader = document.getElementById('chat-header');
        if (chatHeader) {
            chatHeader.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="avatar me-3" style="background-image: url(${conversation.participantAvatar})"></span>
                    <div>
                        <div class="font-weight-medium">${conversation.participantName}</div>
                        <div class="text-muted small">${conversation.projectName}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-ghost-secondary" onclick="MessagesNotion.archiveConversation('${conversation.id}')">
                        <i class="ti ti-archive"></i>
                    </button>
                    <button class="btn btn-sm btn-ghost-secondary" onclick="MessagesNotion.deleteConversation('${conversation.id}')">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            `;
        }
        
        // Mettre à jour les messages
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = conversation.messages.map(message => `
                <div class="message ${message.senderId === window.AuthNotionModule?.getCurrentUser()?.id ? 'sent' : 'received'}">
                    <div class="message-content">
                        <div class="message-header">
                            <span class="sender-name">${message.senderName}</span>
                            <span class="message-time">${this.formatMessageTime(message.timestamp)}</span>
                        </div>
                        <div class="message-body">
                            ${message.content}
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Scroller vers le bas
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Activer l'interface d'envoi
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = `Écrire à ${conversation.participantName}...`;
        }
        
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.disabled = false;
        }
    },
    
    // Envoyer un message
    async sendMessage() {
        try {
            if (!this.currentConversation) return;
            
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour envoyer des messages
            const canSend = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'messages',
                'create'
            );
            
            if (!canSend) {
                window.showNotification('Vous n\'avez pas le droit d\'envoyer des messages', 'error');
                return;
            }
            
            const messageInput = document.getElementById('message-input');
            if (!messageInput || !messageInput.value.trim()) return;
            
            const messageContent = messageInput.value.trim();
            
            // Créer le message via l'API sécurisée
            const newMessage = await window.PermissionsMiddleware.secureApiCall(
                'messages',
                'create',
                this.createMessage.bind(this),
                {
                    conversationId: this.currentConversation.id,
                    content: messageContent,
                    senderId: currentUser.id,
                    senderName: currentUser.name
                }
            );
            
            // Ajouter le message à la conversation locale
            this.currentConversation.messages.push(newMessage);
            
            // Mettre à jour l'affichage
            this.updateChatView(this.currentConversation);
            
            // Vider l'input
            messageInput.value = '';
            
            // Recharger les conversations pour mettre à jour la liste
            await this.loadConversations(true);
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('create', 'messages', true, {
                conversationId: this.currentConversation.id,
                messageLength: messageContent.length
            });
            
        } catch (error) {
            console.error('Erreur envoi message:', error);
            window.showNotification('Erreur lors de l\'envoi du message', 'error');
        }
    },
    
    // Créer un message (stub)
    async createMessage(messageData) {
        // TODO: Implémenter la vraie création dans Notion
        return {
            id: 'm' + Date.now(),
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            content: messageData.content,
            timestamp: new Date().toISOString(),
            type: 'text'
        };
    },
    
    // Marquer conversation comme lue
    async markConversationAsRead(conversationId) {
        try {
            // TODO: Implémenter la vraie mise à jour dans Notion
            
            // Mettre à jour localement
            const conversation = this.allConversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.unreadCount = 0;
                conversation.hasUnread = false;
            }
            
            // Recharger la vue
            this.updateConversationsView(this.allConversations);
            this.updateMessagesStats(this.allConversations);
            
        } catch (error) {
            console.error('Erreur marquage lecture:', error);
        }
    },
    
    // Filtrer les conversations
    filterConversations(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour l'UI des filtres
        document.querySelectorAll('[data-filter-messages]').forEach(filterEl => {
            filterEl.classList.toggle('active', filterEl.dataset.filterMessages === filter);
        });
        
        // Filtrer les conversations
        let filteredConversations = [...this.allConversations];
        
        switch (filter) {
            case 'unread':
                filteredConversations = filteredConversations.filter(c => c.hasUnread);
                break;
            case 'active':
                filteredConversations = filteredConversations.filter(c => c.status === 'active');
                break;
            case 'archived':
                filteredConversations = filteredConversations.filter(c => c.status === 'archived');
                break;
            default: // 'all'
                break;
        }
        
        // Mettre à jour la vue
        this.updateConversationsView(filteredConversations);
    },
    
    // Rechercher dans les conversations
    searchConversations(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterConversations(this.currentFilter);
            return;
        }
        
        const filteredConversations = this.allConversations.filter(conv => 
            conv.participantName.toLowerCase().includes(searchTerm) ||
            conv.projectName.toLowerCase().includes(searchTerm) ||
            conv.lastMessage.toLowerCase().includes(searchTerm)
        );
        
        this.updateConversationsView(filteredConversations);
    },
    
    // Afficher le modal nouveau message
    async showNewMessageModal() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des messages
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'messages',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des messages', 'error');
                return;
            }
            
            // TODO: Implémenter le modal de nouveau message
            console.log('Nouveau message');
            
        } catch (error) {
            console.error('Erreur nouveau message:', error);
        }
    },
    
    // Archiver une conversation
    async archiveConversation(conversationId) {
        if (confirm('Êtes-vous sûr de vouloir archiver cette conversation ?')) {
            // TODO: Implémenter l'archivage
            window.showNotification('Conversation archivée', 'success');
            await this.loadConversations();
        }
    },
    
    // Supprimer une conversation
    async deleteConversation(conversationId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
            // TODO: Implémenter la suppression
            window.showNotification('Conversation supprimée', 'success');
            await this.loadConversations();
        }
    },
    
    // Fonctions utilitaires
    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Aujourd'hui - afficher l'heure
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        }
    },
    
    isRecentMessage(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        
        return diffHours < 24;
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('conversations-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des messages...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateConversationsView
    },
    
    showErrorState() {
        const container = document.getElementById('conversations-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                    <h3 class="text-danger">Erreur de chargement</h3>
                    <p class="text-muted">Impossible de charger les messages</p>
                    <button class="btn btn-primary mt-2" onclick="MessagesNotion.loadConversations()">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des messages', 'error');
        }
    },
    
    // Nettoyage lors de la destruction
    destroy() {
        this.stopAutoRefresh();
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des messages
    if (window.location.pathname.includes('messages.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                MessagesNotion.init();
            }
        }, 100);
    }
});

// Nettoyage lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.MessagesNotion) {
        window.MessagesNotion.destroy();
    }
});

// Export global
window.MessagesNotion = MessagesNotion;