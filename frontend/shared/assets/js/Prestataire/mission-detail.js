/**
 * Mission Detail Page
 * Gestion des détails d'une mission avec timeline, chat, budget et temps
 */

// Variables globales
let currentMissionId = null;
let timelineChart = null;
let budgetChart = null;
let chatManager = null;

// Configuration pour ApexCharts
const chartConfig = {
    colors: ['#206bc4', '#2fb344', '#f76707', '#f59f00'],
    chart: {
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: 240,
        type: 'line',
        parentHeightOffset: 0,
        toolbar: {
            show: false,
        },
        animations: {
            enabled: true
        },
    },
    dataLabels: {
        enabled: false,
    },
    fill: {
        opacity: 0.16,
        type: 'solid'
    },
    stroke: {
        width: 2,
        lineCap: "round",
        curve: "smooth",
    },
    grid: {
        strokeDashArray: 4,
    },
    xaxis: {
        labels: {
            padding: 0,
        },
        tooltip: {
            enabled: false
        },
        axisBorder: {
            show: false,
        },
        type: 'datetime',
    },
    yaxis: {
        labels: {
            padding: 4
        },
    },
    legend: {
        show: true,
        position: 'bottom',
    }
};

// Données simulées pour la mission
const missionData = {
    1: {
        id: 1,
        title: 'Développement API REST',
        client: 'TechCorp SA',
        project: 'Refonte Infrastructure',
        status: 'active',
        priority: 'high',
        startDate: '2024-01-15',
        endDate: '2024-01-25',
        budget: 10000,
        used: 8500,
        estimatedHours: 120,
        actualHours: 89,
        progress: 65,
        health: 85,
        description: 'Développement d\'une API REST complète pour la gestion des produits avec authentification JWT, validation des données et documentation Swagger.',
        requirements: [
            'Authentification JWT sécurisée',
            'CRUD complet pour les produits',
            'Validation des données en entrée',
            'Tests unitaires et d\'intégration',
            'Documentation API avec Swagger',
            'Gestion des erreurs standardisée'
        ],
        deliverables: [
            { name: 'Endpoints authentification', status: 'completed', dueDate: '2024-01-18' },
            { name: 'CRUD produits', status: 'inprogress', dueDate: '2024-01-22' },
            { name: 'Tests unitaires', status: 'pending', dueDate: '2024-01-24' },
            { name: 'Documentation', status: 'pending', dueDate: '2024-01-25' }
        ],
        team: [
            { name: 'Vous', role: 'Développeur Lead', avatar: 'https://ui-avatars.com/api/?name=Vous' },
            { name: 'Marie Dubois', role: 'QA Tester', avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois' },
            { name: 'Jean Martin', role: 'Client', avatar: 'https://ui-avatars.com/api/?name=Jean+Martin' }
        ],
        milestones: [
            { title: 'Setup initial', date: '2024-01-15', status: 'completed' },
            { title: 'Authentification', date: '2024-01-18', status: 'completed' },
            { title: 'API Core', date: '2024-01-22', status: 'inprogress' },
            { title: 'Tests & Doc', date: '2024-01-25', status: 'pending' }
        ]
    }
};

// Classe principale pour la gestion des détails de mission
class MissionDetail {
    constructor(missionId) {
        this.missionId = missionId;
        this.mission = missionData[missionId];
        if (!this.mission) {
            console.error('Mission non trouvée:', missionId);
            return;
        }
    }
    
    init() {
        console.log('🎯 Initialisation MissionDetail pour mission', this.missionId);
        this.loadMissionData();
        this.initCharts();
        this.initTabs();
        this.initEventListeners();
    }
    
    // Charger les données de la mission
    loadMissionData() {
        // Mettre à jour les informations générales
        this.updateGeneralInfo();
        this.updateProgress();
        this.updateTeam();
        this.updateTimeline();
        this.updateDeliverables();
    }
    
    // Mettre à jour les informations générales
    updateGeneralInfo() {
        const mission = this.mission;
        
        // Title et breadcrumb
        document.title = `${mission.title} - Mission Detail`;
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = mission.title;
        }
        
        // Informations de base
        const clientInfo = document.getElementById('clientInfo');
        if (clientInfo) {
            clientInfo.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Client</label>
                            <div class="form-control-plaintext">${mission.client}</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Projet</label>
                            <div class="form-control-plaintext">${mission.project}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Période</label>
                            <div class="form-control-plaintext">
                                ${this.formatDate(mission.startDate)} - ${this.formatDate(mission.endDate)}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Statut</label>
                            <div class="form-control-plaintext">
                                <span class="badge bg-${this.getStatusColor(mission.status)}">
                                    ${this.getStatusLabel(mission.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <div class="form-control-plaintext">${mission.description}</div>
                </div>
            `;
        }
        
        // Exigences
        const requirementsList = document.getElementById('requirementsList');
        if (requirementsList && mission.requirements) {
            requirementsList.innerHTML = mission.requirements.map(req => 
                `<li class="list-group-item">
                    <i class="ti ti-check icon text-success me-2"></i>
                    ${req}
                </li>`
            ).join('');
        }
    }
    
    // Mettre à jour la barre de progression
    updateProgress() {
        const mission = this.mission;
        
        // Barre de progression principale
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${mission.progress}%`;
            progressBar.textContent = `${mission.progress}%`;
        }
        
        // Statistiques
        const statsCards = {
            'budget-used': `CHF ${this.formatCurrency(mission.used)}`,
            'budget-total': `CHF ${this.formatCurrency(mission.budget)}`,
            'hours-actual': `${mission.actualHours}h`,
            'hours-estimated': `${mission.estimatedHours}h`,
            'health-score': `${mission.health}/100`
        };
        
        Object.entries(statsCards).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    // Mettre à jour l'équipe
    updateTeam() {
        const teamList = document.getElementById('teamList');
        if (teamList && this.mission.team) {
            teamList.innerHTML = this.mission.team.map(member => `
                <div class="d-flex align-items-center mb-3">
                    <span class="avatar me-3" style="background-image: url(${member.avatar})"></span>
                    <div>
                        <div class="font-weight-medium">${member.name}</div>
                        <div class="text-muted small">${member.role}</div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Mettre à jour la timeline
    updateTimeline() {
        const timeline = document.getElementById('timelineList');
        if (timeline && this.mission.milestones) {
            timeline.innerHTML = this.mission.milestones.map(milestone => `
                <div class="timeline-item ${milestone.status}">
                    <div class="timeline-marker ${this.getStatusColor(milestone.status)}">
                        <i class="ti ti-${this.getStatusIcon(milestone.status)} icon"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">${milestone.title}</div>
                        <div class="timeline-date">${this.formatDate(milestone.date)}</div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Mettre à jour les livrables
    updateDeliverables() {
        const deliverablesList = document.getElementById('deliverablesList');
        if (deliverablesList && this.mission.deliverables) {
            deliverablesList.innerHTML = this.mission.deliverables.map(deliverable => `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="ti ti-${this.getStatusIcon(deliverable.status)} icon me-2 text-${this.getStatusColor(deliverable.status)}"></i>
                            ${deliverable.name}
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-${this.getStatusColor(deliverable.status)}">
                            ${this.getStatusLabel(deliverable.status)}
                        </span>
                    </td>
                    <td>${this.formatDate(deliverable.dueDate)}</td>
                    <td>
                        <div class="btn-list">
                            ${deliverable.status === 'completed' ? 
                                '<button class="btn btn-sm btn-success"><i class="ti ti-download icon"></i></button>' :
                                '<button class="btn btn-sm btn-primary"><i class="ti ti-upload icon"></i></button>'
                            }
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // Initialiser les graphiques
    initCharts() {
        this.initTimelineChart();
        this.initBudgetChart();
    }
    
    // Graphique timeline
    initTimelineChart() {
        const timelineChartElement = document.getElementById('timelineChart');
        if (!timelineChartElement) return;
        
        const options = {
            ...chartConfig,
            chart: {
                ...chartConfig.chart,
                type: 'area',
                height: 300
            },
            series: [{
                name: 'Progression',
                data: [
                    [new Date('2024-01-15').getTime(), 0],
                    [new Date('2024-01-18').getTime(), 25],
                    [new Date('2024-01-20').getTime(), 45],
                    [new Date('2024-01-22').getTime(), 65],
                    [new Date('2024-01-25').getTime(), 100]
                ]
            }],
            xaxis: {
                type: 'datetime',
                labels: {
                    format: 'dd MMM'
                }
            },
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return val + '%';
                    }
                }
            },
            tooltip: {
                x: {
                    format: 'dd MMM yyyy'
                },
                y: {
                    formatter: function(val) {
                        return val + '% complété';
                    }
                }
            }
        };
        
        timelineChart = new ApexCharts(timelineChartElement, options);
        timelineChart.render();
    }
    
    // Graphique budget
    initBudgetChart() {
        const budgetChartElement = document.getElementById('budgetChart');
        if (!budgetChartElement) return;
        
        const options = {
            chart: {
                type: 'donut',
                height: 300,
                fontFamily: 'inherit'
            },
            series: [this.mission.used, this.mission.budget - this.mission.used],
            labels: ['Utilisé', 'Restant'],
            colors: ['#f76707', '#e9ecef'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '22px',
                                fontFamily: 'inherit',
                                fontWeight: 600,
                                color: undefined,
                                offsetY: -10
                            },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                color: undefined,
                                offsetY: 16,
                                formatter: function (val) {
                                    return 'CHF ' + parseInt(val).toLocaleString('de-CH');
                                }
                            },
                            total: {
                                show: true,
                                showAlways: false,
                                label: 'Budget total',
                                fontSize: '22px',
                                fontFamily: 'inherit',
                                fontWeight: 600,
                                color: '#373d3f',
                                formatter: function () {
                                    return 'CHF 10\'000';
                                }
                            }
                        }
                    }
                }
            },
            legend: {
                show: true,
                position: 'bottom'
            }
        };
        
        budgetChart = new ApexCharts(budgetChartElement, options);
        budgetChart.render();
    }
    
    // Initialiser les onglets
    initTabs() {
        const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabLinks.forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const targetId = e.target.getAttribute('href').substring(1);
                this.onTabChange(targetId);
            });
        });
    }
    
    // Gestion du changement d'onglet
    onTabChange(tabId) {
        switch(tabId) {
            case 'tab-progress':
                // Redimensionner les graphiques si nécessaire
                setTimeout(() => {
                    if (timelineChart) timelineChart.resize();
                    if (budgetChart) budgetChart.resize();
                }, 100);
                break;
            case 'tab-chat':
                this.initChat();
                break;
            case 'tab-files':
                this.loadFiles();
                break;
        }
    }
    
    // Initialiser le chat
    initChat() {
        if (chatManager) return;
        
        chatManager = new ChatManager(this.missionId);
        chatManager.init();
    }
    
    // Charger les fichiers
    loadFiles() {
        const filesList = document.getElementById('filesList');
        if (filesList) {
            filesList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <span class="avatar avatar-sm" style="background-color: #206bc4;">
                                    <i class="ti ti-file-code icon"></i>
                                </span>
                            </div>
                            <div class="col">
                                <div class="font-weight-medium">api-endpoints.js</div>
                                <div class="text-muted small">Mis à jour il y a 2h • 145 KB</div>
                            </div>
                            <div class="col-auto">
                                <div class="btn-list">
                                    <button class="btn btn-sm btn-white">
                                        <i class="ti ti-download icon"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="list-group-item">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <span class="avatar avatar-sm" style="background-color: #2fb344;">
                                    <i class="ti ti-file-text icon"></i>
                                </span>
                            </div>
                            <div class="col">
                                <div class="font-weight-medium">documentation.pdf</div>
                                <div class="text-muted small">Mis à jour hier • 2.3 MB</div>
                            </div>
                            <div class="col-auto">
                                <div class="btn-list">
                                    <button class="btn btn-sm btn-white">
                                        <i class="ti ti-download icon"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Initialiser les événements
    initEventListeners() {
        // Bouton upload fichier
        const uploadBtn = document.getElementById('uploadFileBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadFile());
        }
        
        // Bouton nouveau message
        const newMessageBtn = document.getElementById('newMessageBtn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', () => this.sendMessage());
        }
    }
    
    // Upload fichier
    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.processFileUpload(files);
        };
        input.click();
    }
    
    // Traiter l'upload de fichier
    processFileUpload(files) {
        files.forEach(file => {
            PortalApp.showToast(`Fichier "${file.name}" ajouté avec succès`, 'success');
        });
        this.loadFiles(); // Recharger la liste
    }
    
    // Envoyer un message
    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput && messageInput.value.trim()) {
            if (chatManager) {
                chatManager.sendMessage(messageInput.value.trim());
                messageInput.value = '';
            }
        }
    }
    
    // Utilitaires de formatage
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-CH', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
    }
    
    formatCurrency(amount) {
        return amount.toLocaleString('de-CH').replace(/,/g, '\'');
    }
    
    getStatusColor(status) {
        const colors = {
            'active': 'blue',
            'completed': 'success',
            'inprogress': 'blue',
            'pending': 'warning',
            'review': 'orange'
        };
        return colors[status] || 'secondary';
    }
    
    getStatusLabel(status) {
        const labels = {
            'active': 'Actif',
            'completed': 'Terminé',
            'inprogress': 'En cours',
            'pending': 'En attente',
            'review': 'En review'
        };
        return labels[status] || status;
    }
    
    getStatusIcon(status) {
        const icons = {
            'active': 'play',
            'completed': 'check',
            'inprogress': 'loader',
            'pending': 'clock',
            'review': 'eye'
        };
        return icons[status] || 'circle';
    }
}

// Gestionnaire de chat
class ChatManager {
    constructor(missionId) {
        this.missionId = missionId;
        this.messages = this.loadMessages();
    }
    
    init() {
        this.renderMessages();
        this.scrollToBottom();
    }
    
    loadMessages() {
        // Messages simulés
        return [
            {
                id: 1,
                author: 'Jean Martin',
                role: 'Client',
                message: 'Bonjour, j\'aimerais avoir un point sur l\'avancement de l\'API.',
                timestamp: new Date('2024-01-20T10:30:00'),
                avatar: 'https://ui-avatars.com/api/?name=Jean+Martin'
            },
            {
                id: 2,
                author: 'Vous',
                role: 'Développeur',
                message: 'Bonjour Jean, l\'authentification est terminée et je travaille actuellement sur les endpoints CRUD. Le planning est respecté.',
                timestamp: new Date('2024-01-20T11:15:00'),
                avatar: 'https://ui-avatars.com/api/?name=Vous',
                isCurrentUser: true
            },
            {
                id: 3,
                author: 'Marie Dubois',
                role: 'QA Tester',
                message: 'J\'ai commencé à préparer les tests pour les endpoints d\'authentification. Tout semble bien fonctionner.',
                timestamp: new Date('2024-01-20T14:20:00'),
                avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois'
            }
        ];
    }
    
    renderMessages() {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = this.messages.map(msg => `
            <div class="message ${msg.isCurrentUser ? 'message-out' : 'message-in'}">
                <div class="message-avatar">
                    <span class="avatar avatar-sm" style="background-image: url(${msg.avatar})"></span>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-author">${msg.author}</div>
                        <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                    </div>
                    <div class="message-text">${msg.message}</div>
                </div>
            </div>
        `).join('');
    }
    
    sendMessage(text) {
        const newMessage = {
            id: this.messages.length + 1,
            author: 'Vous',
            role: 'Développeur',
            message: text,
            timestamp: new Date(),
            avatar: 'https://ui-avatars.com/api/?name=Vous',
            isCurrentUser: true
        };
        
        this.messages.push(newMessage);
        this.renderMessages();
        this.scrollToBottom();
        
        PortalApp.showToast('Message envoyé', 'success');
    }
    
    scrollToBottom() {
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('fr-CH', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
}

// Fonctions globales
function initMissionDetail() {
    console.log('🎯 Initialisation Mission Detail');
    
    // Récupérer l'ID de la mission depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    currentMissionId = parseInt(urlParams.get('id')) || 1;
    
    // Initialiser le gestionnaire de détails de mission
    window.missionDetail = new MissionDetail(currentMissionId);
    window.missionDetail.init();
}

// Actions sur les livrables
function uploadDeliverable() {
    PortalApp.showToast('Fonctionnalité d\'upload de livrable à implémenter', 'info');
}

function downloadDeliverable(id) {
    PortalApp.showToast(`Téléchargement du livrable ${id}`, 'info');
}

// Actions sur les messages
function markAsRead(messageId) {
    PortalApp.showToast('Message marqué comme lu', 'success');
}

function replyToMessage(messageId) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.focus();
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le détail de mission si on est sur la bonne page
    if (window.location.pathname.includes('mission-detail.html')) {
        initMissionDetail();
    }
});