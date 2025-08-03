/**
 * Notifications Manager - Gestion des règles de notification
 * Configuration multi-canaux et conditions
 */

window.NotificationsManager = (function() {
    'use strict';

    // Configuration des règles par défaut
    const NOTIFICATION_RULES = {
        'payment-overdue': {
            id: 'payment-overdue',
            name: 'Facture en retard',
            trigger: 'invoice.overdue',
            conditions: { days_overdue: 7 },
            channels: ['email', 'dashboard', 'slack'],
            recipients: ['account_manager', 'cfo'],
            frequency: 'daily',
            template: 'payment-reminder',
            priority: 'high',
            active: true
        },
        'project-milestone': {
            id: 'project-milestone',
            name: 'Jalon projet atteint',
            trigger: 'project.milestone_reached',
            channels: ['email', 'dashboard'],
            recipients: ['project_team', 'client'],
            frequency: 'immediate',
            template: 'milestone-achieved',
            priority: 'medium',
            active: true
        },
        'low-budget': {
            id: 'low-budget',
            name: 'Budget projet < 20%',
            trigger: 'project.budget_threshold',
            conditions: { remaining_percent: 20 },
            channels: ['email', 'dashboard', 'sms'],
            recipients: ['project_manager', 'ceo'],
            frequency: 'immediate',
            priority: 'critical',
            template: 'budget-alert',
            active: true
        },
        'task-overdue': {
            id: 'task-overdue',
            name: 'Tâche en retard',
            trigger: 'task.overdue',
            conditions: { days_overdue: 1 },
            channels: ['dashboard'],
            recipients: ['assignee', 'project_manager'],
            frequency: 'daily',
            priority: 'medium',
            active: true
        },
        'payment-received': {
            id: 'payment-received',
            name: 'Paiement reçu',
            trigger: 'payment.received',
            channels: ['email', 'dashboard'],
            recipients: ['client', 'account_manager'],
            frequency: 'immediate',
            template: 'payment-confirmation',
            priority: 'low',
            active: true
        },
        'user-login-failed': {
            id: 'user-login-failed',
            name: 'Échec connexion',
            trigger: 'user.login_failed',
            conditions: { attempts: 3 },
            channels: ['email', 'sms'],
            recipients: ['user', 'security_admin'],
            frequency: 'immediate',
            priority: 'high',
            active: true
        },
        'system-error': {
            id: 'system-error',
            name: 'Erreur système',
            trigger: 'system.error',
            conditions: { severity: 'critical' },
            channels: ['email', 'slack', 'sms'],
            recipients: ['devops', 'cto'],
            frequency: 'immediate',
            priority: 'critical',
            active: true
        }
    };

    // État local
    let allRules = [];
    let notificationHistory = [];
    let notificationStats = {
        activeRules: 0,
        notifsToday: 0,
        deliveryRate: 98,
        avgResponseTime: 1.2
    };

    // ID de la base Notion pour stocker règles
    const DB_NOTIFICATION_RULES = '238adb95-3c6f-8026-a8b8-eac97aa36ebf'; // Placeholder

    /**
     * Initialisation du module
     */
    async function init() {
        console.log('🔔 Initialisation Notifications Manager...');
        
        if (!await window.checkSuperadminAuth()) {
            console.error('❌ Authentification SuperAdmin requise');
            return;
        }

        setupEventListeners();
        await loadRules();
        await loadNotificationHistory();
        updateStats();
        startRealTimeMonitoring();
    }

    /**
     * Configuration des event listeners
     */
    function setupEventListeners() {
        // Boutons principaux
        document.getElementById('save-rule')?.addEventListener('click', saveRule);
        document.getElementById('test-notification')?.addEventListener('click', showTestModal);
        document.getElementById('send-test-notification')?.addEventListener('click', sendTestNotification);
        document.getElementById('export-history')?.addEventListener('click', exportHistory);
        document.getElementById('apply-filters')?.addEventListener('click', applyFilters);
        document.getElementById('add-condition')?.addEventListener('click', addConditionRow);

        // Changement de trigger
        document.getElementById('rule-trigger')?.addEventListener('change', handleTriggerChange);

        // Recherche temps réel
        document.getElementById('search-rules')?.addEventListener('input', debounce(searchRules, 300));
    }

    /**
     * Chargement des règles
     */
    async function loadRules() {
        try {
            if (window.MCPNotionWrapper && typeof window.MCPNotionWrapper.queryDatabase === 'function') {
                // Charger depuis Notion si disponible
                const response = await window.MCPNotionWrapper.queryDatabase(DB_NOTIFICATION_RULES);
                if (response.success) {
                    allRules = response.data.map(transformNotionRule);
                } else {
                    // Fallback sur config locale
                    allRules = Object.values(NOTIFICATION_RULES);
                }
            } else {
                // Pas de MCP, utiliser config locale
                allRules = Object.values(NOTIFICATION_RULES);
            }

            renderRules();
            populateTemplateSelect();

        } catch (error) {
            console.error('❌ Erreur chargement règles:', error);
            showNotification('error', 'Impossible de charger les règles');
        }
    }

    /**
     * Rendu des règles
     */
    function renderRules(rules = allRules) {
        const container = document.getElementById('notification-rules');
        if (!container) return;

        container.innerHTML = rules.map(rule => {
            const channelBadges = rule.channels.map(c => 
                `<span class="channel-badge channel-${c}">${getChannelLabel(c)}</span>`
            ).join('');

            const recipientTags = rule.recipients.map(r => 
                `<span class="recipient-tag">${getRecipientLabel(r)}</span>`
            ).join('');

            const conditionChips = rule.conditions ? Object.entries(rule.conditions).map(([key, value]) => 
                `<span class="condition-chip">${key}: ${value}</span>`
            ).join('') : '';

            return `
                <div class="notification-rule">
                    <div class="row align-items-center">
                        <div class="col-lg-4">
                            <h5 class="mb-1">${rule.name}</h5>
                            <div class="text-muted small">Trigger: ${getTriggerLabel(rule.trigger)}</div>
                            ${conditionChips ? `<div class="mt-2">${conditionChips}</div>` : ''}
                        </div>
                        
                        <div class="col-lg-3">
                            <div class="mb-2">${channelBadges}</div>
                            <div>${recipientTags}</div>
                        </div>
                        
                        <div class="col-lg-2">
                            <span class="priority-badge priority-${rule.priority}">${getPriorityLabel(rule.priority)}</span>
                            <div class="text-muted small mt-1">Fréq: ${getFrequencyLabel(rule.frequency)}</div>
                        </div>
                        
                        <div class="col-lg-1 text-center">
                            <label class="toggle-switch">
                                <input type="checkbox" ${rule.active ? 'checked' : ''} 
                                       onchange="NotificationsManager.toggleRule('${rule.id}')">
                                <span class="slider"></span>
                            </label>
                        </div>
                        
                        <div class="col-lg-2 text-end">
                            <div class="btn-list">
                                <button class="btn btn-sm btn-outline-primary" onclick="NotificationsManager.editRule('${rule.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"/>
                                        <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"/>
                                        <path d="M16 5l3 3"/>
                                    </svg>
                                </button>
                                <button class="btn btn-sm btn-outline-info" onclick="NotificationsManager.testRule('${rule.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/>
                                        <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
                                    </svg>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="NotificationsManager.deleteRule('${rule.id}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <line x1="4" y1="7" x2="20" y2="7"/>
                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Charger l'historique des notifications
     */
    async function loadNotificationHistory() {
        // Mock data pour démonstration
        const now = Date.now();
        notificationHistory = [
            {
                id: 'notif-001',
                ruleId: 'payment-overdue',
                ruleName: 'Facture en retard',
                timestamp: new Date(now - 3600000),
                channels: ['email', 'dashboard'],
                recipients: ['account_manager'],
                status: 'delivered',
                data: { invoice_number: 'INV-2024-001', days_overdue: 8 }
            },
            {
                id: 'notif-002',
                ruleId: 'project-milestone',
                ruleName: 'Jalon projet atteint',
                timestamp: new Date(now - 7200000),
                channels: ['email'],
                recipients: ['project_team', 'client'],
                status: 'delivered',
                data: { project_name: 'Site Web Corporate', milestone: 'Phase 1 terminée' }
            },
            {
                id: 'notif-003',
                ruleId: 'low-budget',
                ruleName: 'Budget projet < 20%',
                timestamp: new Date(now - 10800000),
                channels: ['email', 'sms'],
                recipients: ['project_manager', 'ceo'],
                status: 'failed',
                error: 'SMS delivery failed',
                data: { project_name: 'App Mobile', remaining_budget: '15%' }
            }
        ];

        renderHistory();
    }

    /**
     * Rendu de l'historique
     */
    function renderHistory() {
        const container = document.getElementById('notification-history');
        if (!container) return;

        container.innerHTML = notificationHistory.slice(0, 50).map(notif => `
            <div class="history-item">
                <div class="row align-items-center">
                    <div class="col-lg-3">
                        <div class="font-weight-medium">${notif.ruleName}</div>
                        <div class="text-muted small">${formatDate(notif.timestamp)}</div>
                    </div>
                    <div class="col-lg-3">
                        ${notif.channels.map(c => 
                            `<span class="channel-badge channel-${c} small">${getChannelLabel(c)}</span>`
                        ).join(' ')}
                    </div>
                    <div class="col-lg-3">
                        <div class="text-muted small">
                            ${notif.recipients.map(r => getRecipientLabel(r)).join(', ')}
                        </div>
                    </div>
                    <div class="col-lg-2">
                        <span class="badge bg-${notif.status === 'delivered' ? 'success' : 'danger'}">
                            ${notif.status === 'delivered' ? 'Délivré' : 'Échoué'}
                        </span>
                    </div>
                    <div class="col-lg-1 text-end">
                        <button class="btn btn-sm btn-outline-secondary" onclick="NotificationsManager.viewDetails('${notif.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>
                            </svg>
                        </button>
                    </div>
                </div>
                ${notif.error ? `<div class="text-danger small mt-1">Erreur: ${notif.error}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Mise à jour des statistiques
     */
    function updateStats() {
        notificationStats.activeRules = allRules.filter(r => r.active).length;
        notificationStats.notifsToday = notificationHistory.filter(n => 
            isToday(new Date(n.timestamp))
        ).length;

        // Mettre à jour l'UI
        document.getElementById('active-rules').textContent = notificationStats.activeRules;
        document.getElementById('notifs-today').textContent = notificationStats.notifsToday;
        document.getElementById('delivery-rate').textContent = `${notificationStats.deliveryRate}%`;
        document.getElementById('response-time').textContent = `${notificationStats.avgResponseTime}s`;
    }

    /**
     * Monitoring temps réel
     */
    function startRealTimeMonitoring() {
        // WebSocket ou polling pour notifications temps réel
        setInterval(() => {
            // Simuler nouvelles notifications
            if (Math.random() > 0.8) {
                const newNotif = generateMockNotification();
                notificationHistory.unshift(newNotif);
                renderHistory();
                updateStats();
                
                // Afficher notification temps réel
                showRealtimeNotification(newNotif);
            }
        }, 30000); // Toutes les 30 secondes
    }

    /**
     * Sauvegarder une règle
     */
    async function saveRule() {
        const ruleData = {
            name: document.getElementById('rule-name').value,
            trigger: document.getElementById('rule-trigger').value,
            conditions: collectConditions(),
            channels: collectChannels(),
            recipients: Array.from(document.getElementById('rule-recipients').selectedOptions).map(o => o.value),
            priority: document.getElementById('rule-priority').value,
            frequency: document.getElementById('rule-frequency').value,
            template: document.getElementById('rule-template').value,
            active: document.getElementById('rule-active').checked
        };

        if (!validateRule(ruleData)) {
            return;
        }

        try {
            showLoadingOverlay();

            // Sauvegarder dans Notion si disponible
            if (window.MCPNotionWrapper) {
                await window.MCPNotionWrapper.createPage({
                    parent_id: DB_NOTIFICATION_RULES,
                    parent_type: 'database',
                    title: ruleData.name,
                    properties: {
                        'Trigger': ruleData.trigger,
                        'Conditions': JSON.stringify(ruleData.conditions),
                        'Channels': ruleData.channels.join(','),
                        'Recipients': ruleData.recipients.join(','),
                        'Priority': ruleData.priority,
                        'Frequency': ruleData.frequency,
                        'Template': ruleData.template,
                        'Active': ruleData.active
                    }
                });
            }

            showNotification('success', 'Règle créée avec succès');
            bootstrap.Modal.getInstance(document.getElementById('createRuleModal')).hide();
            await loadRules();

        } catch (error) {
            console.error('❌ Erreur création règle:', error);
            showNotification('error', 'Erreur lors de la création de la règle');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Collecter les conditions
     */
    function collectConditions() {
        const conditions = {};
        document.querySelectorAll('.condition-row').forEach(row => {
            const variable = row.querySelector('[placeholder="Variable"]')?.value;
            const operator = row.querySelector('select')?.value;
            const value = row.querySelector('[placeholder="Valeur"]')?.value;
            
            if (variable && value) {
                conditions[variable] = value;
            }
        });
        return conditions;
    }

    /**
     * Collecter les canaux
     */
    function collectChannels() {
        const channels = [];
        document.querySelectorAll('#createRuleModal input[type="checkbox"]:checked').forEach(cb => {
            if (cb.value && cb.id.startsWith('channel-')) {
                channels.push(cb.value);
            }
        });
        return channels;
    }

    /**
     * Validation de la règle
     */
    function validateRule(data) {
        if (!data.name || !data.trigger) {
            showNotification('error', 'Nom et déclencheur requis');
            return false;
        }

        if (data.channels.length === 0) {
            showNotification('error', 'Au moins un canal requis');
            return false;
        }

        if (data.recipients.length === 0) {
            showNotification('error', 'Au moins un destinataire requis');
            return false;
        }

        return true;
    }

    /**
     * Ajouter une ligne de condition
     */
    function addConditionRow() {
        const container = document.getElementById('conditions-container');
        const newRow = document.createElement('div');
        newRow.className = 'condition-row mb-2';
        newRow.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="Variable">
                </div>
                <div class="col-md-3">
                    <select class="form-select">
                        <option value="=">=</option>
                        <option value=">">></option>
                        <option value="<"><</option>
                        <option value=">=">>=</option>
                        <option value="<="><=</option>
                        <option value="contains">Contient</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="Valeur">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.condition-row').remove()">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(newRow);
    }

    /**
     * Gérer le changement de trigger
     */
    function handleTriggerChange(e) {
        // Afficher/masquer les conditions selon le trigger
        const showConditions = ['invoice.overdue', 'project.budget_threshold', 'task.overdue', 'user.login_failed'].includes(e.target.value);
        document.getElementById('conditions-container').parentElement.style.display = showConditions ? 'block' : 'none';
    }

    /**
     * Basculer l'état d'une règle
     */
    async function toggleRule(ruleId) {
        const rule = allRules.find(r => r.id === ruleId);
        if (!rule) return;

        rule.active = !rule.active;

        try {
            // Mettre à jour dans Notion si disponible
            if (window.MCPNotionWrapper && rule.notionId) {
                await window.MCPNotionWrapper.updatePage(rule.notionId, {
                    properties: {
                        'Active': rule.active
                    }
                });
            }

            showNotification('success', `Règle ${rule.active ? 'activée' : 'désactivée'}`);
            updateStats();

        } catch (error) {
            console.error('❌ Erreur toggle règle:', error);
            rule.active = !rule.active; // Rollback
            showNotification('error', 'Erreur lors de la mise à jour');
        }
    }

    /**
     * Éditer une règle
     */
    function editRule(ruleId) {
        const rule = allRules.find(r => r.id === ruleId);
        if (!rule) return;

        // Pré-remplir le formulaire
        document.getElementById('rule-name').value = rule.name;
        document.getElementById('rule-trigger').value = rule.trigger;
        document.getElementById('rule-priority').value = rule.priority;
        document.getElementById('rule-frequency').value = rule.frequency;
        document.getElementById('rule-template').value = rule.template || '';
        document.getElementById('rule-active').checked = rule.active;

        // Pré-remplir les canaux
        rule.channels.forEach(channel => {
            const checkbox = document.getElementById(`channel-${channel}`);
            if (checkbox) checkbox.checked = true;
        });

        // Pré-remplir les destinataires
        const recipientsSelect = document.getElementById('rule-recipients');
        rule.recipients.forEach(recipient => {
            const option = recipientsSelect.querySelector(`option[value="${recipient}"]`);
            if (option) option.selected = true;
        });

        // Afficher le modal
        new bootstrap.Modal(document.getElementById('createRuleModal')).show();
    }

    /**
     * Supprimer une règle
     */
    async function deleteRule(ruleId) {
        const rule = allRules.find(r => r.id === ruleId);
        if (!rule) return;

        const result = await Swal.fire({
            title: 'Supprimer la règle ?',
            text: `Voulez-vous vraiment supprimer "${rule.name}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (!result.isConfirmed) return;

        try {
            showLoadingOverlay();

            // Supprimer de Notion si disponible
            if (window.MCPNotionWrapper && rule.notionId) {
                await window.MCPNotionWrapper.archivePage(rule.notionId);
            }

            // Retirer de la liste locale
            allRules = allRules.filter(r => r.id !== ruleId);
            renderRules();
            updateStats();

            showNotification('success', 'Règle supprimée');

        } catch (error) {
            console.error('❌ Erreur suppression règle:', error);
            showNotification('error', 'Erreur lors de la suppression');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Tester une règle
     */
    function testRule(ruleId) {
        const rule = allRules.find(r => r.id === ruleId);
        if (!rule) return;

        // Pré-remplir le formulaire de test
        document.getElementById('test-rule-select').value = ruleId;
        
        // Pré-cocher les canaux de la règle
        document.querySelectorAll('#testNotificationModal input[type="checkbox"]').forEach(cb => {
            cb.checked = rule.channels.includes(cb.value);
        });

        // Afficher le modal de test
        new bootstrap.Modal(document.getElementById('testNotificationModal')).show();
    }

    /**
     * Afficher modal de test
     */
    function showTestModal() {
        // Peupler le select avec les règles
        const select = document.getElementById('test-rule-select');
        select.innerHTML = '<option value="">Sélectionner une règle</option>' +
            allRules.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

        new bootstrap.Modal(document.getElementById('testNotificationModal')).show();
    }

    /**
     * Envoyer notification de test
     */
    async function sendTestNotification() {
        const ruleId = document.getElementById('test-rule-select').value;
        const testData = document.getElementById('test-data').value;
        
        if (!ruleId) {
            showNotification('error', 'Sélectionnez une règle');
            return;
        }

        try {
            const data = JSON.parse(testData);
            const rule = allRules.find(r => r.id === ruleId);
            
            showLoadingOverlay();

            // Simuler l'envoi
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Ajouter à l'historique
            const testNotif = {
                id: `notif-test-${Date.now()}`,
                ruleId: rule.id,
                ruleName: rule.name,
                timestamp: new Date(),
                channels: Array.from(document.querySelectorAll('#testNotificationModal input[type="checkbox"]:checked')).map(cb => cb.value),
                recipients: rule.recipients,
                status: 'delivered',
                data: data,
                isTest: true
            };

            notificationHistory.unshift(testNotif);
            renderHistory();

            showNotification('success', 'Notification de test envoyée');
            bootstrap.Modal.getInstance(document.getElementById('testNotificationModal')).hide();

        } catch (error) {
            console.error('❌ Erreur test notification:', error);
            showNotification('error', 'Erreur lors du test');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Rechercher des règles
     */
    function searchRules() {
        const searchTerm = document.getElementById('search-rules').value.toLowerCase();
        
        const filtered = allRules.filter(rule => 
            rule.name.toLowerCase().includes(searchTerm) ||
            rule.trigger.toLowerCase().includes(searchTerm)
        );

        renderRules(filtered);
    }

    /**
     * Appliquer les filtres
     */
    function applyFilters() {
        const channelFilter = document.getElementById('filter-channel').value;
        const priorityFilter = document.getElementById('filter-priority').value;
        const statusFilter = document.getElementById('filter-status').value;

        let filtered = allRules;

        if (channelFilter) {
            filtered = filtered.filter(r => r.channels.includes(channelFilter));
        }

        if (priorityFilter) {
            filtered = filtered.filter(r => r.priority === priorityFilter);
        }

        if (statusFilter) {
            filtered = filtered.filter(r => 
                statusFilter === 'active' ? r.active : !r.active
            );
        }

        renderRules(filtered);
    }

    /**
     * Exporter l'historique
     */
    function exportHistory() {
        const csvContent = [
            ['Date', 'Règle', 'Canaux', 'Destinataires', 'Statut', 'Données'],
            ...notificationHistory.map(n => [
                formatDate(n.timestamp),
                n.ruleName,
                n.channels.join(' '),
                n.recipients.join(' '),
                n.status,
                JSON.stringify(n.data)
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notifications-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Voir les détails d'une notification
     */
    async function viewDetails(notifId) {
        const notif = notificationHistory.find(n => n.id === notifId);
        if (!notif) return;

        await Swal.fire({
            title: 'Détails de la notification',
            html: `
                <div class="text-start">
                    <p><strong>Règle:</strong> ${notif.ruleName}</p>
                    <p><strong>Date:</strong> ${formatDate(notif.timestamp)}</p>
                    <p><strong>Canaux:</strong> ${notif.channels.map(c => getChannelLabel(c)).join(', ')}</p>
                    <p><strong>Destinataires:</strong> ${notif.recipients.map(r => getRecipientLabel(r)).join(', ')}</p>
                    <p><strong>Statut:</strong> <span class="badge bg-${notif.status === 'delivered' ? 'success' : 'danger'}">${notif.status}</span></p>
                    ${notif.error ? `<p><strong>Erreur:</strong> <span class="text-danger">${notif.error}</span></p>` : ''}
                    <p><strong>Données:</strong></p>
                    <pre class="bg-light p-2 rounded">${JSON.stringify(notif.data, null, 2)}</pre>
                </div>
            `,
            width: 600,
            showCloseButton: true,
            showConfirmButton: false
        });
    }

    /**
     * Afficher notification temps réel
     */
    function showRealtimeNotification(notif) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: 'info',
            title: notif.ruleName,
            html: `<small>${notif.channels.map(c => getChannelLabel(c)).join(' ')} → ${notif.recipients.map(r => getRecipientLabel(r)).join(', ')}</small>`
        });
    }

    /**
     * Générer notification mock
     */
    function generateMockNotification() {
        const rules = Object.values(NOTIFICATION_RULES);
        const rule = rules[Math.floor(Math.random() * rules.length)];
        
        return {
            id: `notif-${Date.now()}`,
            ruleId: rule.id,
            ruleName: rule.name,
            timestamp: new Date(),
            channels: rule.channels,
            recipients: rule.recipients,
            status: Math.random() > 0.1 ? 'delivered' : 'failed',
            data: generateMockData(rule.trigger)
        };
    }

    /**
     * Générer données mock selon le trigger
     */
    function generateMockData(trigger) {
        const mockData = {
            'invoice.overdue': { invoice_number: `INV-2024-${Math.floor(Math.random() * 100)}`, days_overdue: Math.floor(Math.random() * 30) },
            'project.milestone_reached': { project_name: 'Projet Test', milestone: `Phase ${Math.floor(Math.random() * 5) + 1}` },
            'project.budget_threshold': { project_name: 'Projet Budget', remaining_budget: `${Math.floor(Math.random() * 20)}%` },
            'task.overdue': { task_name: 'Tâche urgente', days_overdue: Math.floor(Math.random() * 7) },
            'payment.received': { amount: `CHF ${Math.floor(Math.random() * 10000)}`, invoice_number: `INV-2024-${Math.floor(Math.random() * 100)}` },
            'user.login_failed': { user_email: 'user@example.com', attempts: Math.floor(Math.random() * 5) + 3 },
            'system.error': { error_code: 'ERR_' + Math.random().toString(36).substr(2, 9), severity: 'critical' }
        };

        return mockData[trigger] || {};
    }

    /**
     * Peupler le select des templates
     */
    async function populateTemplateSelect() {
        const select = document.getElementById('rule-template');
        if (!select) return;

        // Charger les templates email si disponible
        try {
            const templates = await loadEmailTemplates();
            select.innerHTML = '<option value="">Sélectionner un template</option>' +
                templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        } catch (error) {
            console.warn('Templates email non disponibles');
        }
    }

    /**
     * Charger les templates email
     */
    async function loadEmailTemplates() {
        // Simuler le chargement des templates
        return [
            { id: 'payment-reminder', name: 'Rappel de paiement' },
            { id: 'milestone-achieved', name: 'Jalon atteint' },
            { id: 'budget-alert', name: 'Alerte budget' },
            { id: 'payment-confirmation', name: 'Confirmation paiement' }
        ];
    }

    /**
     * Transformer règle Notion
     */
    function transformNotionRule(notionPage) {
        const props = notionPage.properties;
        
        return {
            id: notionPage.id,
            notionId: notionPage.id,
            name: props['Name']?.title?.[0]?.plain_text || '',
            trigger: props['Trigger']?.select?.name || '',
            conditions: JSON.parse(props['Conditions']?.rich_text?.[0]?.plain_text || '{}'),
            channels: props['Channels']?.rich_text?.[0]?.plain_text?.split(',') || [],
            recipients: props['Recipients']?.rich_text?.[0]?.plain_text?.split(',') || [],
            priority: props['Priority']?.select?.name || 'medium',
            frequency: props['Frequency']?.select?.name || 'immediate',
            template: props['Template']?.rich_text?.[0]?.plain_text || '',
            active: props['Active']?.checkbox || false
        };
    }

    /**
     * Utilitaires
     */
    function getChannelLabel(channel) {
        const labels = {
            'email': '✉️ Email',
            'dashboard': '📊 Dashboard',
            'slack': '💬 Slack',
            'sms': '📱 SMS'
        };
        return labels[channel] || channel;
    }

    function getRecipientLabel(recipient) {
        const labels = {
            'account_manager': 'Account Manager',
            'project_manager': 'Project Manager',
            'cfo': 'CFO',
            'ceo': 'CEO',
            'cto': 'CTO',
            'client': 'Client',
            'project_team': 'Équipe Projet',
            'accountant': 'Comptable',
            'assignee': 'Assigné',
            'user': 'Utilisateur',
            'security_admin': 'Admin Sécurité',
            'devops': 'DevOps'
        };
        return labels[recipient] || recipient;
    }

    function getTriggerLabel(trigger) {
        const labels = {
            'invoice.overdue': 'Facture en retard',
            'project.milestone_reached': 'Jalon atteint',
            'project.budget_threshold': 'Seuil budget',
            'task.overdue': 'Tâche en retard',
            'payment.received': 'Paiement reçu',
            'user.login_failed': 'Échec connexion',
            'system.error': 'Erreur système'
        };
        return labels[trigger] || trigger;
    }

    function getPriorityLabel(priority) {
        const labels = {
            'low': 'Faible',
            'medium': 'Moyenne',
            'high': 'Élevée',
            'critical': 'Critique'
        };
        return labels[priority] || priority;
    }

    function getFrequencyLabel(frequency) {
        const labels = {
            'immediate': 'Immédiate',
            'hourly': 'Horaire',
            'daily': 'Quotidienne',
            'weekly': 'Hebdomadaire'
        };
        return labels[frequency] || frequency;
    }

    function formatDate(date) {
        return new Date(date).toLocaleString('fr-CH');
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showNotification(type, message) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: type,
            title: message
        });
    }

    function showLoadingOverlay() {
        // Implémenter si nécessaire
    }

    function hideLoadingOverlay() {
        // Implémenter si nécessaire
    }

    // API publique
    return {
        init,
        toggleRule,
        editRule,
        deleteRule,
        testRule,
        viewDetails
    };

})();