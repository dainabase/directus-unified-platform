/**
 * Collaboration System
 * Gestion complète du chat, calendrier et base de connaissances
 */

// Chat temps réel (simulation)
class ChatSystem {
    constructor() {
        this.activeConversation = null;
        this.typingTimeout = null;
        this.conversations = this.loadConversations();
        this.messages = this.loadMessages();
        this.unreadCount = 0;
    }
    
    init() {
        console.log('💬 Initialisation du système de chat');
        this.updateUnreadCount();
        this.initWebSocket();
    }
    
    // Simulation WebSocket
    initWebSocket() {
        // En production, ce serait une vraie connexion WebSocket
        this.socket = {
            send: (data) => {
                console.log('WebSocket send:', data);
            },
            close: () => {
                console.log('WebSocket closed');
            }
        };
        
        // Simuler des messages entrants
        this.simulateIncomingMessages();
    }
    
    // Charger les conversations
    loadConversations() {
        return [
            {
                id: 1,
                type: 'project',
                name: 'Marie D. - Projet API',
                avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois',
                lastMessage: "J'ai validé les endpoints, tu peux...",
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                unread: 2,
                online: true
            },
            {
                id: 2,
                type: 'support',
                name: 'Support Technique',
                avatar: null,
                icon: 'ti-headset',
                lastMessage: 'Votre ticket #1234 a été résolu',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                unread: 0,
                online: true
            },
            {
                id: 3,
                type: 'project',
                name: 'Équipe Mobile App',
                avatars: [
                    'https://ui-avatars.com/api/?name=Jean+Martin',
                    'https://ui-avatars.com/api/?name=Sophie+Laurent'
                ],
                lastMessage: 'Meeting demain à 14h pour...',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                unread: 0,
                online: false
            }
        ];
    }
    
    // Charger les messages
    loadMessages() {
        return {
            1: [
                {
                    id: 1,
                    sender: 'Marie Dubois',
                    content: "Salut ! J'ai revu ton code pour les endpoints API.",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    status: 'read',
                    type: 'text'
                },
                {
                    id: 2,
                    sender: 'me',
                    content: "Super ! Qu'est-ce que tu en penses ?",
                    timestamp: new Date(Date.now() - 25 * 60 * 1000),
                    status: 'read',
                    type: 'text'
                },
                {
                    id: 3,
                    sender: 'Marie Dubois',
                    content: "J'ai validé les endpoints, tu peux continuer l'implémentation. Voici mes notes :",
                    timestamp: new Date(Date.now() - 20 * 60 * 1000),
                    status: 'read',
                    type: 'text',
                    attachment: {
                        name: 'review-api.pdf',
                        size: 245000,
                        type: 'application/pdf'
                    }
                },
                {
                    id: 4,
                    sender: 'me',
                    content: "Parfait, je regarde ça tout de suite ! Je pense pouvoir terminer d'ici demain.",
                    timestamp: new Date(Date.now() - 15 * 60 * 1000),
                    status: 'sent',
                    type: 'text'
                }
            ]
        };
    }
    
    // Charger une conversation
    loadConversation(conversationId) {
        this.activeConversation = conversationId;
        const messages = this.messages[conversationId] || [];
        
        // Marquer comme lus
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.unread = 0;
            this.updateUnreadCount();
        }
        
        // Mettre à jour l'interface
        this.renderMessages(messages);
        this.scrollToBottom();
    }
    
    // Afficher les messages
    renderMessages(messages) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        let currentDate = null;
        let html = '';
        
        messages.forEach(msg => {
            // Divider de date
            const msgDate = msg.timestamp.toDateString();
            if (msgDate !== currentDate) {
                currentDate = msgDate;
                html += `
                    <div class="chat-date-divider text-center my-3">
                        <span class="badge bg-muted-lt">${this.formatDateDivider(msg.timestamp)}</span>
                    </div>
                `;
            }
            
            // Message
            if (msg.sender === 'me') {
                html += this.renderSentMessage(msg);
            } else {
                html += this.renderReceivedMessage(msg);
            }
        });
        
        container.innerHTML = html;
    }
    
    // Afficher message envoyé
    renderSentMessage(msg) {
        const statusIcon = msg.status === 'read' ? 'ti-checks text-success' : 
                          msg.status === 'sent' ? 'ti-check text-muted' : 
                          'ti-clock text-muted';
        
        return `
            <div class="chat-message mb-3">
                <div class="d-flex justify-content-end">
                    <div class="chat-bubble me">
                        <div class="chat-bubble-content">${msg.content}</div>
                        ${msg.attachment ? this.renderAttachment(msg.attachment) : ''}
                        <div class="chat-bubble-meta text-end">
                            <span class="text-muted small">${this.formatTime(msg.timestamp)}</span>
                            <i class="ti ${statusIcon} icon ms-1"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Afficher message reçu
    renderReceivedMessage(msg) {
        const conversation = this.conversations.find(c => c.id === this.activeConversation);
        const avatar = conversation?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(msg.sender);
        
        return `
            <div class="chat-message mb-3">
                <div class="d-flex">
                    <span class="avatar avatar-sm me-2" style="background-image: url(${avatar})"></span>
                    <div class="chat-bubble">
                        <div class="chat-bubble-content">${msg.content}</div>
                        ${msg.attachment ? this.renderAttachment(msg.attachment) : ''}
                        <div class="chat-bubble-meta">
                            <span class="text-muted small">${this.formatTime(msg.timestamp)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Afficher pièce jointe
    renderAttachment(attachment) {
        const icon = this.getFileIcon(attachment.type);
        const size = this.formatFileSize(attachment.size);
        
        return `
            <div class="chat-attachment mt-2">
                <div class="card">
                    <div class="card-body p-2">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <span class="avatar avatar-sm bg-blue-lt">
                                    <i class="ti ${icon} icon"></i>
                                </span>
                            </div>
                            <div class="col">
                                <div class="font-weight-medium">${attachment.name}</div>
                                <div class="text-muted small">${size}</div>
                            </div>
                            <div class="col-auto">
                                <a href="#" class="btn btn-sm btn-white" onclick="downloadFile('${attachment.name}')">
                                    <i class="ti ti-download icon"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Envoi message
    sendMessage(content, attachments = []) {
        if (!content.trim() && attachments.length === 0) return;
        
        const msg = {
            id: Date.now(),
            sender: 'me',
            content: content,
            timestamp: new Date(),
            status: 'sending',
            type: 'text',
            attachments: attachments
        };
        
        // Ajouter au messages
        if (!this.messages[this.activeConversation]) {
            this.messages[this.activeConversation] = [];
        }
        this.messages[this.activeConversation].push(msg);
        
        // Afficher immédiatement
        this.displayMessage(msg);
        
        // Simulation envoi
        setTimeout(() => {
            msg.status = 'sent';
            this.updateMessageStatus(msg.id, 'sent');
            
            // Simulation lecture
            setTimeout(() => {
                msg.status = 'read';
                this.updateMessageStatus(msg.id, 'read');
            }, 1000);
        }, 500);
        
        // Mettre à jour dernière conversation
        const conversation = this.conversations.find(c => c.id === this.activeConversation);
        if (conversation) {
            conversation.lastMessage = content || 'Fichier envoyé';
            conversation.timestamp = new Date();
        }
    }
    
    // Afficher un message
    displayMessage(msg) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        // Vérifier si on doit ajouter un divider de date
        const lastMessage = container.lastElementChild;
        const today = new Date().toDateString();
        
        if (!lastMessage || !lastMessage.classList.contains('chat-date-divider')) {
            const divider = document.createElement('div');
            divider.className = 'chat-date-divider text-center my-3';
            divider.innerHTML = `<span class="badge bg-muted-lt">Aujourd'hui</span>`;
            container.appendChild(divider);
        }
        
        // Ajouter le message
        const messageEl = document.createElement('div');
        messageEl.innerHTML = msg.sender === 'me' ? 
            this.renderSentMessage(msg) : 
            this.renderReceivedMessage(msg);
        
        container.appendChild(messageEl.firstElementChild);
        this.scrollToBottom();
    }
    
    // Mettre à jour statut message
    updateMessageStatus(messageId, status) {
        const msg = this.messages[this.activeConversation]?.find(m => m.id === messageId);
        if (msg) {
            msg.status = status;
            // Mettre à jour l'icône dans l'UI
            const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageEl) {
                // Update status icon
            }
        }
    }
    
    // Indicateur frappe
    showTypingIndicator(user) {
        const indicator = document.getElementById('typingIndicator');
        if (!indicator) return;
        
        indicator.innerHTML = `
            <span class="avatar avatar-sm me-2" style="background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(user)})"></span>
            <span class="text-muted small">${user} est en train d'écrire...</span>
        `;
        indicator.classList.add('show');
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, 3000);
    }
    
    // Upload fichier avec preview
    handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const preview = {
                name: file.name,
                size: file.size,
                type: file.type,
                url: e.target.result
            };
            
            if (file.type.startsWith('image/')) {
                this.showImagePreview(preview);
            } else {
                this.showFilePreview(preview);
            }
            
            // Envoyer avec le message
            this.sendMessage('', [{
                name: file.name,
                size: file.size,
                type: file.type
            }]);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Preview image
    showImagePreview(preview) {
        console.log('Image preview:', preview);
        // Implémenter modal preview
    }
    
    // Preview fichier
    showFilePreview(preview) {
        console.log('File preview:', preview);
        // Afficher info fichier
    }
    
    // Simuler messages entrants
    simulateIncomingMessages() {
        // Simuler un nouveau message après 10 secondes
        setTimeout(() => {
            if (this.activeConversation === 1) {
                this.showTypingIndicator('Marie Dubois');
                
                setTimeout(() => {
                    const msg = {
                        id: Date.now(),
                        sender: 'Marie Dubois',
                        content: "J'ai aussi remarqué que tu pourrais optimiser la gestion des erreurs. Je t'envoie un exemple.",
                        timestamp: new Date(),
                        status: 'read',
                        type: 'text'
                    };
                    
                    this.messages[1].push(msg);
                    this.displayMessage(msg);
                    
                    // Notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Nouveau message de Marie Dubois', {
                            body: msg.content,
                            icon: 'https://ui-avatars.com/api/?name=Marie+Dubois'
                        });
                    }
                }, 3000);
            }
        }, 10000);
    }
    
    // Mettre à jour compteur non lus
    updateUnreadCount() {
        this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unread, 0);
        
        // Mettre à jour badge dans UI
        const badge = document.querySelector('.navbar .badge.bg-red');
        if (badge && this.unreadCount > 0) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'inline-block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }
    
    // Scroll en bas
    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
    
    // Utilitaires
    formatTime(date) {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    formatDateDivider(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        } else {
            return date.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
            });
        }
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
        else return Math.round(bytes / 1048576) + ' MB';
    }
    
    getFileIcon(mimeType) {
        if (mimeType.includes('pdf')) return 'ti-file-text';
        if (mimeType.includes('image')) return 'ti-photo';
        if (mimeType.includes('video')) return 'ti-video';
        if (mimeType.includes('audio')) return 'ti-music';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'ti-file-zip';
        if (mimeType.includes('word') || mimeType.includes('doc')) return 'ti-file-word';
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'ti-file-excel';
        return 'ti-file';
    }
}

// Gestion calendrier
class CalendarManager {
    constructor() {
        this.events = [];
        this.filters = {
            deadline: true,
            meeting: true,
            livrable: true,
            formation: true
        };
    }
    
    init(calendar) {
        this.calendar = calendar;
        console.log('📅 CalendarManager initialisé');
    }
    
    // Ajouter événement
    addEvent(eventData) {
        this.calendar.addEvent(eventData);
        this.events.push(eventData);
        
        // Sync avec backend (simulation)
        console.log('Sync événement:', eventData);
    }
    
    // Filtrer événements
    filterEvents(filters) {
        this.filters = filters;
        
        this.calendar.getEvents().forEach(event => {
            const eventType = event.extendedProps.type;
            if (filters[eventType]) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    }
    
    // Exporter calendrier
    exportCalendar() {
        const events = this.calendar.getEvents();
        const icsContent = this.generateICS(events);
        
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'calendrier-missions.ics';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Générer format ICS
    generateICS(events) {
        let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Portal//Missions Calendar//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
        
        events.forEach(event => {
            const start = this.formatICSDate(event.start);
            const end = event.end ? this.formatICSDate(event.end) : start;
            
            ics += `BEGIN:VEVENT
UID:${event.id}@portal.com
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.extendedProps.description || ''}
END:VEVENT
`;
        });
        
        ics += 'END:VCALENDAR';
        return ics;
    }
    
    formatICSDate(date) {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
}

// Knowledge base
class KnowledgeBase {
    constructor() {
        this.articles = [];
        this.searchIndex = null;
        this.favorites = this.loadFavorites();
    }
    
    init(miniSearch) {
        this.searchIndex = miniSearch;
        console.log('📚 Knowledge base initialisée');
    }
    
    // Rechercher articles
    search(query) {
        if (!this.searchIndex || query.length < 3) return [];
        
        const results = this.searchIndex.search(query, {
            boost: { title: 2 },
            fuzzy: 0.2,
            prefix: true
        });
        
        return results.slice(0, 10); // Top 10 résultats
    }
    
    // Charger favoris
    loadFavorites() {
        const saved = localStorage.getItem('kb_favorites');
        return saved ? JSON.parse(saved) : [];
    }
    
    // Ajouter aux favoris
    addToFavorites(articleId) {
        if (!this.favorites.includes(articleId)) {
            this.favorites.push(articleId);
            localStorage.setItem('kb_favorites', JSON.stringify(this.favorites));
            return true;
        }
        return false;
    }
    
    // Retirer des favoris
    removeFromFavorites(articleId) {
        const index = this.favorites.indexOf(articleId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            localStorage.setItem('kb_favorites', JSON.stringify(this.favorites));
            return true;
        }
        return false;
    }
    
    // Noter article
    rateArticle(articleId, rating) {
        // Sauvegarder la note
        const ratings = this.loadRatings();
        ratings[articleId] = rating;
        localStorage.setItem('kb_ratings', JSON.stringify(ratings));
        
        // Sync avec backend
        console.log('Article noté:', articleId, rating);
    }
    
    loadRatings() {
        const saved = localStorage.getItem('kb_ratings');
        return saved ? JSON.parse(saved) : {};
    }
}

// Fonctions globales
function downloadFile(filename) {
    console.log('Téléchargement:', filename);
    PortalApp.showToast(`Téléchargement de ${filename}...`, 'info');
}

// Demander permission notifications
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notifications activées');
            }
        });
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Demander permission notifications
    requestNotificationPermission();
    
    console.log('🤝 Module Collaboration chargé');
});