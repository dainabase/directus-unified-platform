// chat-notion.js - Système de chat transversal avec Notion
// Ce fichier gère les communications temps réel entre tous les utilisateurs

const ChatNotion = {
    // Configuration
    DB_IDS: {
        COMMUNICATIONS: '230adb95-3c6f-807f-81b1-e5e90ea9dd17',
        PROJETS: '226adb95-3c6f-806e-9e61-e263baf7af69',
        MISSIONS: '236adb95-3c6f-80ca-a317-c7ff9dc7153c'
    },
    
    // Configuration du polling
    POLLING_INTERVAL: 5000, // 5 secondes
    pollingTimer: null,
    
    // État local
    currentContext: null, // { type: 'project'|'mission'|'global', id: string }
    messages: [],
    participants: [],
    unreadCount: 0,
    isMinimized: false,
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du système de chat avec Notion');
        this.detectContext();
        this.createChatWidget();
        this.attachEventListeners();
        this.loadMessages();
        this.startPolling();
    },
    
    // Détecter le contexte actuel (projet, mission, etc.)
    detectContext() {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        
        // Détection selon la page et les paramètres
        if (path.includes('project-detail.html') && params.has('id')) {
            this.currentContext = {
                type: 'project',
                id: params.get('id'),
                name: 'Projet'
            };
        } else if (path.includes('mission-detail.html') && params.has('id')) {
            this.currentContext = {
                type: 'mission',
                id: params.get('id'),
                name: 'Mission'
            };
        } else if (path.includes('dashboard.html')) {
            this.currentContext = {
                type: 'dashboard',
                id: 'general',
                name: 'Dashboard'
            };
        } else {
            this.currentContext = {
                type: 'global',
                id: 'global',
                name: 'Chat général'
            };
        }
        
        console.log('Contexte détecté:', this.currentContext);
    },
    
    // Créer le widget de chat
    createChatWidget() {
        // Vérifier si le widget existe déjà
        if (document.getElementById('chat-widget')) return;
        
        // Créer le HTML du widget
        const chatHTML = `
            <div id="chat-widget" class="chat-widget ${this.isMinimized ? 'minimized' : ''}">
                <div class="chat-header">
                    <div class="chat-header-content">
                        <div class="chat-title">
                            <i class="ti ti-message-circle me-2"></i>
                            <span id="chat-context-name">${this.currentContext.name}</span>
                            <span class="badge badge-primary ms-2" id="chat-unread-count" style="display: none;">0</span>
                        </div>
                        <div class="chat-actions">
                            <button class="btn btn-sm btn-ghost-light" id="chat-minimize-btn" title="Réduire">
                                <i class="ti ti-minus"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost-light" id="chat-close-btn" title="Fermer">
                                <i class="ti ti-x"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="chat-body">
                    <div class="chat-messages" id="chat-messages">
                        <div class="text-center text-muted py-4">
                            <div class="spinner-border spinner-border-sm" role="status">
                                <span class="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-participants" id="chat-participants" style="display: none;">
                        <div class="participants-header">
                            <h6 class="mb-0">Participants</h6>
                        </div>
                        <div class="participants-list" id="participants-list"></div>
                    </div>
                </div>
                
                <div class="chat-footer">
                    <div class="chat-input-group">
                        <div class="chat-input-actions">
                            <button class="btn btn-sm btn-ghost-light" id="chat-emoji-btn" title="Emojis">
                                <i class="ti ti-mood-smile"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost-light" id="chat-attach-btn" title="Joindre un fichier">
                                <i class="ti ti-paperclip"></i>
                            </button>
                        </div>
                        <input type="text" 
                               class="form-control chat-input" 
                               id="chat-input" 
                               placeholder="Tapez votre message..."
                               autocomplete="off">
                        <button class="btn btn-primary btn-sm" id="chat-send-btn">
                            <i class="ti ti-send"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Bouton flottant pour ouvrir le chat -->
            <button id="chat-floating-btn" class="chat-floating-btn" style="display: none;">
                <i class="ti ti-message-circle"></i>
                <span class="chat-notification-badge" id="floating-unread-count" style="display: none;">0</span>
            </button>
        `;
        
        // Ajouter le widget au body
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        
        // Ajouter les styles CSS
        this.injectStyles();
    },
    
    // Injecter les styles CSS
    injectStyles() {
        if (document.getElementById('chat-notion-styles')) return;
        
        const styles = `
            <style id="chat-notion-styles">
                /* Widget de chat */
                .chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border: 1px solid var(--bs-border-color);
                    border-radius: 0.5rem;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    z-index: 1050;
                    transition: all 0.3s ease;
                }
                
                .chat-widget.minimized {
                    height: auto;
                }
                
                .chat-widget.minimized .chat-body,
                .chat-widget.minimized .chat-footer {
                    display: none;
                }
                
                /* Header du chat */
                .chat-header {
                    background: var(--bs-primary);
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem 0.5rem 0 0;
                    cursor: move;
                }
                
                .chat-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .chat-title {
                    display: flex;
                    align-items: center;
                    font-weight: 600;
                }
                
                .chat-actions {
                    display: flex;
                    gap: 0.25rem;
                }
                
                .chat-actions .btn {
                    padding: 0.25rem 0.5rem;
                    color: white;
                }
                
                /* Corps du chat */
                .chat-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    background: #f8f9fa;
                }
                
                /* Messages */
                .chat-message {
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
                
                .chat-message.own {
                    flex-direction: row-reverse;
                }
                
                .chat-message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bs-gray-300);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }
                
                .chat-message-content {
                    max-width: 70%;
                }
                
                .chat-message-bubble {
                    background: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                
                .chat-message.own .chat-message-bubble {
                    background: var(--bs-primary);
                    color: white;
                }
                
                .chat-message-info {
                    font-size: 0.75rem;
                    color: var(--bs-gray-600);
                    margin-top: 0.25rem;
                    display: flex;
                    gap: 0.5rem;
                }
                
                .chat-message.own .chat-message-info {
                    justify-content: flex-end;
                }
                
                /* Date separator */
                .chat-date-separator {
                    text-align: center;
                    margin: 1rem 0;
                    position: relative;
                }
                
                .chat-date-separator span {
                    background: #f8f9fa;
                    padding: 0 0.5rem;
                    color: var(--bs-gray-600);
                    font-size: 0.75rem;
                    position: relative;
                    z-index: 1;
                }
                
                .chat-date-separator::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--bs-border-color);
                }
                
                /* Footer du chat */
                .chat-footer {
                    padding: 0.75rem;
                    border-top: 1px solid var(--bs-border-color);
                    background: white;
                    border-radius: 0 0 0.5rem 0.5rem;
                }
                
                .chat-input-group {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                
                .chat-input-actions {
                    display: flex;
                    gap: 0.25rem;
                }
                
                .chat-input {
                    flex: 1;
                    border: 1px solid var(--bs-border-color);
                    border-radius: 0.25rem;
                    padding: 0.5rem;
                    font-size: 0.875rem;
                }
                
                /* Bouton flottant */
                .chat-floating-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: var(--bs-primary);
                    color: white;
                    border: none;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 1040;
                }
                
                .chat-floating-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.2);
                }
                
                .chat-notification-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: var(--bs-danger);
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                /* Participants */
                .chat-participants {
                    border-top: 1px solid var(--bs-border-color);
                    padding: 0.75rem;
                    max-height: 150px;
                    overflow-y: auto;
                }
                
                .participants-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                
                .participant-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    background: var(--bs-gray-100);
                    border-radius: 0.25rem;
                    font-size: 0.8125rem;
                }
                
                .participant-status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--bs-success);
                }
                
                /* Responsive */
                @media (max-width: 576px) {
                    .chat-widget {
                        width: 100%;
                        height: 100%;
                        bottom: 0;
                        right: 0;
                        border-radius: 0;
                        max-width: 100%;
                        max-height: 100%;
                    }
                }
                
                /* Animations */
                @keyframes slideInUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .chat-widget {
                    animation: slideInUp 0.3s ease-out;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Minimize/Maximize
        const minimizeBtn = document.getElementById('chat-minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        
        // Close chat
        const closeBtn = document.getElementById('chat-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChat());
        }
        
        // Floating button
        const floatingBtn = document.getElementById('chat-floating-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => this.openChat());
        }
        
        // Send message
        const sendBtn = document.getElementById('chat-send-btn');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Emoji button
        const emojiBtn = document.getElementById('chat-emoji-btn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        }
        
        // Attach file button
        const attachBtn = document.getElementById('chat-attach-btn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.attachFile());
        }
        
        // Make header draggable
        this.makeWidgetDraggable();
    },
    
    // Rendre le widget déplaçable
    makeWidgetDraggable() {
        const widget = document.getElementById('chat-widget');
        const header = widget.querySelector('.chat-header');
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            if (e.target.closest('.chat-actions')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === header || e.target.closest('.chat-title')) {
                isDragging = true;
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                widget.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
        
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    },
    
    // Charger les messages
    async loadMessages() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Récupérer les messages selon le contexte
            const messages = await window.NotionConnector.common.getMessageHistory(
                this.currentContext.id,
                this.currentContext.type
            );
            
            // Trier par date
            messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // Stocker les messages
            this.messages = messages;
            
            // Afficher les messages
            this.renderMessages();
            
            // Marquer comme lus
            this.markMessagesAsRead();
            
        } catch (error) {
            console.error('Erreur chargement messages:', error);
            this.showError('Impossible de charger les messages');
        }
    },
    
    // Afficher les messages
    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return;
        
        if (this.messages.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="ti ti-message-off fs-1 mb-2"></i>
                    <p>Aucun message pour le moment</p>
                    <small>Commencez la conversation!</small>
                </div>
            `;
            return;
        }
        
        let html = '';
        let lastDate = null;
        
        this.messages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const dateStr = messageDate.toLocaleDateString('fr-FR');
            
            // Ajouter un séparateur de date si nécessaire
            if (dateStr !== lastDate) {
                html += `<div class="chat-date-separator"><span>${this.getRelativeDate(messageDate)}</span></div>`;
                lastDate = dateStr;
            }
            
            // Déterminer si c'est notre message
            const isOwn = message.sender === currentUser.name || message.senderId === currentUser.id;
            
            // Générer l'avatar
            const initials = message.sender.split(' ').map(n => n[0]).join('').toUpperCase();
            
            html += `
                <div class="chat-message ${isOwn ? 'own' : ''}">
                    <div class="chat-message-avatar" style="background-color: ${this.getAvatarColor(message.sender)}">
                        ${initials}
                    </div>
                    <div class="chat-message-content">
                        <div class="chat-message-bubble">
                            ${this.formatMessageContent(message.content)}
                        </div>
                        <div class="chat-message-info">
                            ${!isOwn ? `<span>${message.sender}</span>` : ''}
                            <span>${messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            ${message.type === 'system' ? '<span class="badge badge-sm bg-secondary">Système</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Scroll vers le bas
        container.scrollTop = container.scrollHeight;
    },
    
    // Envoyer un message
    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }
            
            // Créer l'objet message
            const messageData = {
                content: message,
                sender: currentUser.name,
                senderId: currentUser.id,
                contextId: this.currentContext.id,
                contextType: this.currentContext.type,
                timestamp: new Date().toISOString(),
                type: 'text'
            };
            
            // Ajouter le message localement d'abord (optimistic update)
            this.messages.push(messageData);
            this.renderMessages();
            
            // Envoyer à Notion
            const result = await window.NotionConnector.common.sendMessage(messageData);
            
            if (result.success) {
                // Mettre à jour l'ID du message
                messageData.id = result.id;
            } else {
                throw new Error('Échec de l\'envoi');
            }
            
        } catch (error) {
            console.error('Erreur envoi message:', error);
            this.showError('Impossible d\'envoyer le message');
            
            // Retirer le message de la liste locale en cas d'erreur
            this.messages.pop();
            this.renderMessages();
        }
    },
    
    // Démarrer le polling
    startPolling() {
        // Arrêter le polling existant
        this.stopPolling();
        
        // Démarrer un nouveau polling
        this.pollingTimer = setInterval(() => {
            this.checkNewMessages();
        }, this.POLLING_INTERVAL);
    },
    
    // Arrêter le polling
    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    },
    
    // Vérifier les nouveaux messages
    async checkNewMessages() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Récupérer les messages récents
            const messages = await window.NotionConnector.common.getMessageHistory(
                this.currentContext.id,
                this.currentContext.type
            );
            
            // Identifier les nouveaux messages
            const lastMessageId = this.messages.length > 0 
                ? this.messages[this.messages.length - 1].id 
                : null;
            
            const newMessages = [];
            let foundLastMessage = false;
            
            for (const message of messages) {
                if (!lastMessageId || foundLastMessage) {
                    newMessages.push(message);
                } else if (message.id === lastMessageId) {
                    foundLastMessage = true;
                }
            }
            
            if (newMessages.length > 0) {
                // Ajouter les nouveaux messages
                this.messages.push(...newMessages);
                this.renderMessages();
                
                // Mettre à jour le compteur de non-lus
                const unreadMessages = newMessages.filter(m => 
                    m.sender !== currentUser.name && m.senderId !== currentUser.id
                );
                
                if (unreadMessages.length > 0) {
                    this.unreadCount += unreadMessages.length;
                    this.updateUnreadCount();
                    
                    // Jouer un son si disponible
                    this.playNotificationSound();
                    
                    // Afficher une notification si le chat est minimisé
                    if (this.isMinimized || document.getElementById('chat-widget').style.display === 'none') {
                        this.showNotification(unreadMessages[0]);
                    }
                }
            }
            
        } catch (error) {
            console.error('Erreur vérification nouveaux messages:', error);
        }
    },
    
    // Mettre à jour le compteur de non-lus
    updateUnreadCount() {
        const badges = [
            document.getElementById('chat-unread-count'),
            document.getElementById('floating-unread-count')
        ];
        
        badges.forEach(badge => {
            if (badge) {
                if (this.unreadCount > 0) {
                    badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                    badge.style.display = 'inline-flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        });
    },
    
    // Marquer les messages comme lus
    markMessagesAsRead() {
        this.unreadCount = 0;
        this.updateUnreadCount();
    },
    
    // Basculer minimiser/maximiser
    toggleMinimize() {
        const widget = document.getElementById('chat-widget');
        if (widget) {
            this.isMinimized = !this.isMinimized;
            widget.classList.toggle('minimized');
            
            // Mettre à jour l'icône
            const minimizeBtn = document.getElementById('chat-minimize-btn');
            if (minimizeBtn) {
                minimizeBtn.innerHTML = this.isMinimized 
                    ? '<i class="ti ti-maximize"></i>' 
                    : '<i class="ti ti-minus"></i>';
            }
        }
    },
    
    // Fermer le chat
    closeChat() {
        const widget = document.getElementById('chat-widget');
        const floatingBtn = document.getElementById('chat-floating-btn');
        
        if (widget) widget.style.display = 'none';
        if (floatingBtn) floatingBtn.style.display = 'flex';
        
        // Arrêter le polling
        this.stopPolling();
    },
    
    // Ouvrir le chat
    openChat() {
        const widget = document.getElementById('chat-widget');
        const floatingBtn = document.getElementById('chat-floating-btn');
        
        if (widget) widget.style.display = 'flex';
        if (floatingBtn) floatingBtn.style.display = 'none';
        
        // Marquer comme lu
        this.markMessagesAsRead();
        
        // Redémarrer le polling
        this.startPolling();
        
        // Focus sur l'input
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }, 100);
    },
    
    // Afficher le sélecteur d'emojis
    showEmojiPicker() {
        // TODO: Implémenter un vrai sélecteur d'emojis
        const emojis = ['😊', '👍', '❤️', '😂', '🎉', '🤔', '👏', '🙏'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        const input = document.getElementById('chat-input');
        if (input) {
            input.value += randomEmoji;
            input.focus();
        }
    },
    
    // Joindre un fichier
    async attachFile() {
        // TODO: Implémenter l'upload de fichiers
        if (window.showNotification) {
            window.showNotification('Upload de fichiers à venir', 'info');
        }
    },
    
    // Fonctions utilitaires
    getRelativeDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        } else {
            return date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long' 
            });
        }
    },
    
    getAvatarColor(name) {
        // Générer une couleur basée sur le nom
        const colors = [
            '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545',
            '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    },
    
    formatMessageContent(content) {
        // Échapper le HTML
        content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Convertir les URLs en liens
        content = content.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>'
        );
        
        // Convertir les sauts de ligne
        content = content.replace(/\n/g, '<br>');
        
        return content;
    },
    
    showError(message) {
        const container = document.getElementById('chat-messages');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger alert-sm mb-2';
            errorDiv.textContent = message;
            container.appendChild(errorDiv);
            
            setTimeout(() => errorDiv.remove(), 5000);
        }
    },
    
    playNotificationSound() {
        // TODO: Implémenter le son de notification
        // Pour l'instant, on utilise l'API Notification si disponible
        if ('Notification' in window && Notification.permission === 'granted') {
            // Le son sera joué par la notification système
        }
    },
    
    showNotification(message) {
        // Notification navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Nouveau message de ${message.sender}`, {
                body: message.content,
                icon: '/assets/img/logo.svg',
                tag: 'chat-notification'
            });
        }
    },
    
    // Demander la permission pour les notifications
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Permission notifications:', permission);
        }
    },
    
    // Changer de contexte (projet, mission, etc.)
    changeContext(newContext) {
        this.currentContext = newContext;
        
        // Mettre à jour le titre
        const contextName = document.getElementById('chat-context-name');
        if (contextName) {
            contextName.textContent = newContext.name;
        }
        
        // Recharger les messages
        this.messages = [];
        this.loadMessages();
    },
    
    // Détruire le widget
    destroy() {
        this.stopPolling();
        
        const widget = document.getElementById('chat-widget');
        const floatingBtn = document.getElementById('chat-floating-btn');
        const styles = document.getElementById('chat-notion-styles');
        
        if (widget) widget.remove();
        if (floatingBtn) floatingBtn.remove();
        if (styles) styles.remove();
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier que NotionConnector est disponible
    const checkNotionConnector = setInterval(() => {
        if (window.NotionConnector && window.AuthNotionModule) {
            clearInterval(checkNotionConnector);
            
            // Vérifier si l'utilisateur est connecté
            const currentUser = window.AuthNotionModule.getCurrentUser();
            if (currentUser) {
                // Initialiser le chat
                ChatNotion.init();
                
                // Demander la permission pour les notifications
                ChatNotion.requestNotificationPermission();
            }
        }
    }, 100);
});

// Nettoyage lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.ChatNotion) {
        window.ChatNotion.destroy();
    }
});

// Export global
window.ChatNotion = ChatNotion;