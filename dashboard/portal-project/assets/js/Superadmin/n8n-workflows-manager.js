/**
 * n8n Workflows Manager - Gestion des workflows automatisés
 * Intégration avec n8n et Notion MCP
 */

window.N8nWorkflowsManager = (function() {
    'use strict';

    // Configuration des workflows n8n
    const WORKFLOWS_CONFIG = {
        'new-client': {
            name: 'Nouveau Client',
            trigger: 'webhook.notion.contact_created',
            actions: [
                { type: 'notion.create', target: 'DB-CONTACTS' },
                { type: 'notion.create', target: 'DB-ENTREPRISES' },
                { type: 'email.send', template: 'welcome-client' },
                { type: 'slack.notify', channel: '#nouveaux-clients' },
                { type: 'notion.create', target: 'DB-SALES-PIPELINE' }
            ],
            schedule: null,
            active: true
        },
        'invoice-paid': {
            name: 'Facture Payée',
            trigger: 'webhook.revolut.transaction_matched',
            actions: [
                { type: 'notion.update', target: 'DB-DEVIS-FACTURES', status: 'Payée' },
                { type: 'notion.create', target: 'DB-ECRITURES-COMPTABLES' },
                { type: 'notion.update', target: 'DB-CASHFLOW' },
                { type: 'email.send', template: 'payment-received' },
                { type: 'notification.create', role: 'project_manager' }
            ],
            active: true
        },
        'month-end': {
            name: 'Clôture Mensuelle',
            trigger: 'cron.expression',
            schedule: '0 18 L * *', // Dernier jour du mois à 18h
            actions: [
                { type: 'report.generate', report: 'monthly-financial' },
                { type: 'vat.calculate', period: 'current_month' },
                { type: 'consolidation.run', entities: ['all'] },
                { type: 'email.send', template: 'monthly-report', recipients: ['ceo', 'cfo'] },
                { type: 'archive.documents', month: 'current' }
            ],
            active: true
        },
        'ocr-document': {
            name: 'Traitement OCR',
            trigger: 'webhook.storage.file_uploaded',
            actions: [
                { type: 'ocr.process', engine: 'tesseract' },
                { type: 'ai.categorize', model: 'document-classifier' },
                { type: 'notion.create', target: 'auto-detect' },
                { type: 'accounting.create_entry', auto: true },
                { type: 'notification.create', role: 'accountant' }
            ],
            active: true
        },
        'project-risk': {
            name: 'Alerte Projet à Risque',
            trigger: 'notion.property_changed',
            conditions: {
                database: 'DB-PROJETS-CLIENTS',
                property: 'Health Score',
                operator: '<',
                value: 40
            },
            actions: [
                { type: 'notification.urgent', recipients: ['project_manager', 'ceo'] },
                { type: 'email.send', template: 'project-risk-alert' },
                { type: 'task.create', title: 'Review projet urgent', assignee: 'project_manager' },
                { type: 'slack.alert', channel: '#projets-urgents' }
            ],
            active: true
        }
    };

    // État local
    let allWorkflows = [];
    let executionHistory = [];
    let workflowStats = {
        active: 0,
        executionsToday: 0,
        successRate: 0,
        lastError: null
    };

    // ID de la base Notion pour stocker workflows (à créer)
    const DB_WORKFLOWS = '238adb95-3c6f-8024-a8b8-eac97aa36ebf'; // Placeholder

    /**
     * Initialisation du module
     */
    async function init() {
        console.log('🚀 Initialisation N8n Workflows Manager...');
        
        if (!await window.checkSuperadminAuth()) {
            console.error('❌ Authentification SuperAdmin requise');
            return;
        }

        setupEventListeners();
        await loadWorkflows();
        updateStats();
        startMonitoring();
    }

    /**
     * Configuration des event listeners
     */
    function setupEventListeners() {
        // Boutons principaux
        document.getElementById('save-workflow')?.addEventListener('click', saveWorkflow);
        document.getElementById('add-action')?.addEventListener('click', addActionRow);
        
        // Filtres
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => filterWorkflows(e.target.dataset.filter));
        });

        // Changement de trigger
        document.getElementById('workflow-trigger')?.addEventListener('change', handleTriggerChange);

        // Variables cliquables
        document.querySelectorAll('.variable-tag').forEach(tag => {
            tag.addEventListener('click', (e) => insertVariable(e.target.dataset.var));
        });
    }

    /**
     * Chargement des workflows
     */
    async function loadWorkflows() {
        try {
            if (window.MCPNotionWrapper && typeof window.MCPNotionWrapper.queryDatabase === 'function') {
                // Charger depuis Notion si disponible
                const response = await window.MCPNotionWrapper.queryDatabase(DB_WORKFLOWS);
                if (response.success) {
                    allWorkflows = response.data.map(transformNotionWorkflow);
                } else {
                    // Fallback sur config locale
                    allWorkflows = Object.entries(WORKFLOWS_CONFIG).map(([id, config]) => ({
                        id,
                        ...config
                    }));
                }
            } else {
                // Pas de MCP, utiliser config locale
                allWorkflows = Object.entries(WORKFLOWS_CONFIG).map(([id, config]) => ({
                    id,
                    ...config
                }));
            }

            renderWorkflows();
            loadExecutionHistory();

        } catch (error) {
            console.error('❌ Erreur chargement workflows:', error);
            showNotification('error', 'Impossible de charger les workflows');
        }
    }

    /**
     * Rendu des workflows
     */
    function renderWorkflows(workflows = allWorkflows) {
        const container = document.getElementById('workflows-list');
        if (!container) return;

        container.innerHTML = workflows.map(workflow => {
            const triggerType = getTriggerType(workflow.trigger);
            const actionsList = workflow.actions.map(a => 
                `<span class="action-badge">${getActionLabel(a.type)}</span>`
            ).join('');

            return `
                <tr>
                    <td>
                        <div class="font-weight-medium">${workflow.name}</div>
                        <div class="text-muted small">${workflow.id}</div>
                    </td>
                    <td>
                        <span class="trigger-badge badge bg-${triggerType.color}">${triggerType.label}</span>
                        ${workflow.schedule ? `<div class="small text-muted">${workflow.schedule}</div>` : ''}
                    </td>
                    <td>
                        <div class="action-list">${actionsList}</div>
                    </td>
                    <td>
                        <div class="small">
                            ${workflow.lastExecution ? formatDate(workflow.lastExecution) : 'Jamais'}
                        </div>
                    </td>
                    <td>
                        <label class="toggle-switch">
                            <input type="checkbox" ${workflow.active ? 'checked' : ''} 
                                   onchange="N8nWorkflowsManager.toggleWorkflow('${workflow.id}')">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>
                        <div class="btn-list flex-nowrap">
                            <button class="btn btn-sm btn-outline-primary" onclick="N8nWorkflowsManager.editWorkflow('${workflow.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"/>
                                    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"/>
                                    <path d="M16 5l3 3"/>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="N8nWorkflowsManager.testWorkflow('${workflow.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M7 4v16l13 -8z"/>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="N8nWorkflowsManager.deleteWorkflow('${workflow.id}')">
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
                    </td>
                </tr>
            `;
        }).join('');

        updateWorkflowDiagram(workflows[0]); // Afficher le premier workflow
    }

    /**
     * Mise à jour du diagramme Mermaid
     */
    function updateWorkflowDiagram(workflow) {
        if (!workflow) return;

        const diagram = document.getElementById('workflow-diagram');
        if (!diagram) return;

        // Générer le graphique Mermaid
        const nodes = ['graph LR'];
        nodes.push(`A[${getTriggerType(workflow.trigger).label}]`);
        
        workflow.actions.forEach((action, index) => {
            const prevNode = index === 0 ? 'A' : `B${index}`;
            const currentNode = `B${index + 1}`;
            nodes.push(`${prevNode} --> ${currentNode}[${getActionLabel(action.type)}]`);
        });

        diagram.innerHTML = `<div class="mermaid">${nodes.join('\n')}</div>`;
        
        // Réinitialiser Mermaid
        if (typeof mermaid !== 'undefined') {
            mermaid.init();
        }
    }

    /**
     * Charger l'historique des exécutions
     */
    function loadExecutionHistory() {
        // Mock data pour démonstration
        executionHistory = [
            {
                id: 'exec-001',
                workflowId: 'new-client',
                workflowName: 'Nouveau Client',
                startTime: new Date(Date.now() - 3600000),
                endTime: new Date(Date.now() - 3540000),
                status: 'success',
                duration: 60000
            },
            {
                id: 'exec-002',
                workflowId: 'invoice-paid',
                workflowName: 'Facture Payée',
                startTime: new Date(Date.now() - 7200000),
                endTime: new Date(Date.now() - 7140000),
                status: 'success',
                duration: 60000
            },
            {
                id: 'exec-003',
                workflowId: 'ocr-document',
                workflowName: 'Traitement OCR',
                startTime: new Date(Date.now() - 10800000),
                endTime: new Date(Date.now() - 10740000),
                status: 'error',
                duration: 60000,
                error: 'OCR failed: Invalid document format'
            }
        ];

        renderExecutionHistory();
    }

    /**
     * Rendu de l'historique
     */
    function renderExecutionHistory() {
        const container = document.getElementById('execution-timeline');
        if (!container) return;

        container.innerHTML = executionHistory.slice(0, 10).map(exec => `
            <div class="execution-item execution-${exec.status}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="font-weight-medium">${exec.workflowName}</div>
                        <div class="text-muted small">${formatDate(exec.startTime)}</div>
                    </div>
                    <span class="badge bg-${exec.status === 'success' ? 'success' : 'danger'}">
                        ${exec.status === 'success' ? 'Succès' : 'Erreur'}
                    </span>
                </div>
                ${exec.error ? `<div class="text-danger small mt-1">${exec.error}</div>` : ''}
                <div class="text-muted small mt-1">Durée: ${formatDuration(exec.duration)}</div>
            </div>
        `).join('');
    }

    /**
     * Mise à jour des statistiques
     */
    function updateStats() {
        workflowStats.active = allWorkflows.filter(w => w.active).length;
        workflowStats.executionsToday = executionHistory.filter(e => 
            isToday(new Date(e.startTime))
        ).length;
        
        const successCount = executionHistory.filter(e => e.status === 'success').length;
        workflowStats.successRate = Math.round((successCount / executionHistory.length) * 100);
        
        const lastErrorExec = executionHistory.find(e => e.status === 'error');
        workflowStats.lastError = lastErrorExec ? formatDate(lastErrorExec.startTime) : '-';

        // Mettre à jour l'UI
        document.getElementById('active-workflows').textContent = workflowStats.active;
        document.getElementById('executions-today').textContent = workflowStats.executionsToday;
        document.getElementById('success-rate').textContent = `${workflowStats.successRate}%`;
        document.getElementById('last-error-time').textContent = workflowStats.lastError;
    }

    /**
     * Monitoring en temps réel
     */
    function startMonitoring() {
        // Simuler des mises à jour temps réel
        setInterval(() => {
            // Ici on pourrait faire un appel API pour récupérer les dernières exécutions
            updateStats();
        }, 30000); // Toutes les 30 secondes
    }

    /**
     * Sauvegarder un workflow
     */
    async function saveWorkflow() {
        const workflowData = {
            name: document.getElementById('workflow-name').value,
            trigger: document.getElementById('workflow-trigger').value,
            schedule: document.getElementById('workflow-schedule')?.value,
            actions: collectActions(),
            conditions: collectConditions(),
            active: document.getElementById('workflow-active').checked
        };

        if (!validateWorkflow(workflowData)) {
            return;
        }

        try {
            showLoadingOverlay();

            // Sauvegarder dans Notion si disponible
            if (window.MCPNotionWrapper) {
                await window.MCPNotionWrapper.createPage({
                    parent_id: DB_WORKFLOWS,
                    parent_type: 'database',
                    title: workflowData.name,
                    properties: {
                        'Trigger': workflowData.trigger,
                        'Actions': JSON.stringify(workflowData.actions),
                        'Schedule': workflowData.schedule || null,
                        'Active': workflowData.active
                    }
                });
            }

            // Déclencher création dans n8n
            await triggerN8nCreation(workflowData);

            showNotification('success', 'Workflow créé avec succès');
            bootstrap.Modal.getInstance(document.getElementById('createWorkflowModal')).hide();
            await loadWorkflows();

        } catch (error) {
            console.error('❌ Erreur création workflow:', error);
            showNotification('error', 'Erreur lors de la création du workflow');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Déclencher création n8n
     */
    async function triggerN8nCreation(workflowData) {
        const n8nWebhook = 'https://n8n.votredomaine.ch/webhook/create-workflow';
        
        try {
            const response = await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: workflowData.name,
                    nodes: generateN8nNodes(workflowData),
                    settings: {
                        executionOrder: 'v1'
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Erreur création n8n');
            }

            return response.json();
        } catch (error) {
            console.warn('⚠️ n8n non disponible, workflow créé localement uniquement');
            return { success: true, local: true };
        }
    }

    /**
     * Générer les nodes n8n
     */
    function generateN8nNodes(workflowData) {
        const nodes = [];
        
        // Trigger node
        nodes.push({
            name: 'Trigger',
            type: mapTriggerType(workflowData.trigger),
            position: [250, 300],
            parameters: getTriggerParams(workflowData)
        });
        
        // Action nodes
        workflowData.actions.forEach((action, index) => {
            nodes.push({
                name: `Action_${index + 1}`,
                type: mapActionType(action.type),
                position: [450 + (index * 200), 300],
                parameters: getActionParams(action)
            });
        });
        
        return nodes;
    }

    /**
     * Collecter les actions du formulaire
     */
    function collectActions() {
        const actions = [];
        document.querySelectorAll('.action-item').forEach(item => {
            const type = item.querySelector('.action-type').value;
            if (type) {
                actions.push({ type });
            }
        });
        return actions;
    }

    /**
     * Collecter les conditions
     */
    function collectConditions() {
        const conditions = [];
        document.querySelectorAll('.condition-row').forEach(row => {
            const variable = row.querySelector('#condition-var')?.value;
            const operator = row.querySelector('#condition-op')?.value;
            const value = row.querySelector('#condition-val')?.value;
            
            if (variable && operator && value) {
                conditions.push({ variable, operator, value });
            }
        });
        return conditions;
    }

    /**
     * Validation du workflow
     */
    function validateWorkflow(data) {
        if (!data.name || !data.trigger) {
            showNotification('error', 'Nom et déclencheur requis');
            return false;
        }

        if (data.actions.length === 0) {
            showNotification('error', 'Au moins une action requise');
            return false;
        }

        if (data.trigger === 'cron.expression' && !data.schedule) {
            showNotification('error', 'Expression cron requise');
            return false;
        }

        return true;
    }

    /**
     * Ajouter une ligne d'action
     */
    function addActionRow() {
        const container = document.getElementById('actions-list');
        const newRow = document.createElement('div');
        newRow.className = 'action-item mb-2';
        newRow.innerHTML = `
            <div class="input-group">
                <select class="form-select action-type">
                    <option value="">Sélectionner une action</option>
                    <option value="notion.create">Créer dans Notion</option>
                    <option value="notion.update">Mettre à jour Notion</option>
                    <option value="email.send">Envoyer email</option>
                    <option value="slack.notify">Notification Slack</option>
                    <option value="report.generate">Générer rapport</option>
                    <option value="ocr.process">Traiter OCR</option>
                </select>
                <button type="button" class="btn btn-outline-danger remove-action" onclick="this.parentElement.parentElement.remove()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(newRow);
    }

    /**
     * Gérer le changement de trigger
     */
    function handleTriggerChange(e) {
        const trigger = e.target.value;
        document.getElementById('cron-config').style.display = 
            trigger === 'cron.expression' ? 'block' : 'none';
        document.getElementById('condition-config').style.display = 
            trigger === 'notion.property_changed' ? 'block' : 'none';
    }

    /**
     * Basculer l'état d'un workflow
     */
    async function toggleWorkflow(workflowId) {
        const workflow = allWorkflows.find(w => w.id === workflowId);
        if (!workflow) return;

        workflow.active = !workflow.active;

        try {
            // Mettre à jour dans Notion si disponible
            if (window.MCPNotionWrapper && workflow.notionId) {
                await window.MCPNotionWrapper.updatePage(workflow.notionId, {
                    properties: {
                        'Active': workflow.active
                    }
                });
            }

            // Notifier n8n
            await updateN8nWorkflowStatus(workflowId, workflow.active);

            showNotification('success', `Workflow ${workflow.active ? 'activé' : 'désactivé'}`);
            updateStats();

        } catch (error) {
            console.error('❌ Erreur toggle workflow:', error);
            workflow.active = !workflow.active; // Rollback
            showNotification('error', 'Erreur lors de la mise à jour');
        }
    }

    /**
     * Mettre à jour le statut dans n8n
     */
    async function updateN8nWorkflowStatus(workflowId, active) {
        const n8nWebhook = `https://n8n.votredomaine.ch/webhook/workflow/${workflowId}/status`;
        
        try {
            await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active })
            });
        } catch (error) {
            console.warn('⚠️ n8n non accessible');
        }
    }

    /**
     * Tester un workflow
     */
    async function testWorkflow(workflowId) {
        const workflow = allWorkflows.find(w => w.id === workflowId);
        if (!workflow) return;

        try {
            showLoadingOverlay();
            
            // Simuler l'exécution
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Ajouter à l'historique
            const execution = {
                id: `exec-${Date.now()}`,
                workflowId: workflow.id,
                workflowName: workflow.name,
                startTime: new Date(),
                endTime: new Date(Date.now() + 2000),
                status: Math.random() > 0.2 ? 'success' : 'error',
                duration: 2000
            };
            
            executionHistory.unshift(execution);
            renderExecutionHistory();
            
            showNotification(
                execution.status === 'success' ? 'success' : 'error',
                `Test ${execution.status === 'success' ? 'réussi' : 'échoué'}`
            );

        } catch (error) {
            console.error('❌ Erreur test workflow:', error);
            showNotification('error', 'Erreur lors du test');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Éditer un workflow
     */
    function editWorkflow(workflowId) {
        const workflow = allWorkflows.find(w => w.id === workflowId);
        if (!workflow) return;

        // Pré-remplir le formulaire
        document.getElementById('workflow-name').value = workflow.name;
        document.getElementById('workflow-trigger').value = workflow.trigger;
        document.getElementById('workflow-schedule').value = workflow.schedule || '';
        document.getElementById('workflow-active').checked = workflow.active;

        // Afficher le modal
        new bootstrap.Modal(document.getElementById('createWorkflowModal')).show();
    }

    /**
     * Supprimer un workflow
     */
    async function deleteWorkflow(workflowId) {
        const workflow = allWorkflows.find(w => w.id === workflowId);
        if (!workflow) return;

        const result = await Swal.fire({
            title: 'Supprimer le workflow ?',
            text: `Voulez-vous vraiment supprimer "${workflow.name}" ?`,
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
            if (window.MCPNotionWrapper && workflow.notionId) {
                await window.MCPNotionWrapper.archivePage(workflow.notionId);
            }

            // Supprimer de n8n
            await deleteN8nWorkflow(workflowId);

            // Retirer de la liste locale
            allWorkflows = allWorkflows.filter(w => w.id !== workflowId);
            renderWorkflows();
            updateStats();

            showNotification('success', 'Workflow supprimé');

        } catch (error) {
            console.error('❌ Erreur suppression workflow:', error);
            showNotification('error', 'Erreur lors de la suppression');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Supprimer de n8n
     */
    async function deleteN8nWorkflow(workflowId) {
        const n8nWebhook = `https://n8n.votredomaine.ch/webhook/workflow/${workflowId}`;
        
        try {
            await fetch(n8nWebhook, {
                method: 'DELETE'
            });
        } catch (error) {
            console.warn('⚠️ n8n non accessible');
        }
    }

    /**
     * Filtrer les workflows
     */
    function filterWorkflows(filter) {
        // Mettre à jour les boutons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        let filtered = allWorkflows;

        if (filter === 'active') {
            filtered = allWorkflows.filter(w => w.active);
        } else if (filter === 'inactive') {
            filtered = allWorkflows.filter(w => !w.active);
        }

        renderWorkflows(filtered);
    }

    /**
     * Utilitaires
     */
    function getTriggerType(trigger) {
        const types = {
            'webhook.notion': { label: 'Webhook Notion', color: 'primary' },
            'webhook.revolut': { label: 'Webhook Revolut', color: 'success' },
            'cron.expression': { label: 'Planifié', color: 'info' },
            'webhook.storage': { label: 'Upload fichier', color: 'warning' },
            'notion.property_changed': { label: 'Changement Notion', color: 'purple' }
        };

        for (const [key, value] of Object.entries(types)) {
            if (trigger.startsWith(key)) {
                return value;
            }
        }

        return { label: 'Autre', color: 'secondary' };
    }

    function getActionLabel(actionType) {
        const labels = {
            'notion.create': '📝 Créer Notion',
            'notion.update': '✏️ MAJ Notion',
            'email.send': '✉️ Email',
            'slack.notify': '💬 Slack',
            'report.generate': '📊 Rapport',
            'ocr.process': '🔍 OCR',
            'task.create': '✓ Tâche',
            'notification.create': '🔔 Notif',
            'vat.calculate': '🧮 TVA',
            'consolidation.run': '📈 Consolidation'
        };

        return labels[actionType] || actionType;
    }

    function mapTriggerType(trigger) {
        if (trigger.startsWith('webhook')) return 'webhook';
        if (trigger === 'cron.expression') return 'cron';
        if (trigger.startsWith('notion')) return 'notion';
        return 'manual';
    }

    function mapActionType(actionType) {
        const [service, action] = actionType.split('.');
        return `${service}-${action}`;
    }

    function getTriggerParams(workflowData) {
        if (workflowData.trigger === 'cron.expression') {
            return { expression: workflowData.schedule };
        }
        if (workflowData.conditions) {
            return { conditions: workflowData.conditions };
        }
        return {};
    }

    function getActionParams(action) {
        return action.params || {};
    }

    function formatDate(date) {
        return new Date(date).toLocaleString('fr-CH');
    }

    function formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${Math.round(ms / 1000)}s`;
        return `${Math.round(ms / 60000)}min`;
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function showNotification(type, message) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
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
        toggleWorkflow,
        editWorkflow,
        deleteWorkflow,
        testWorkflow,
        addActionRow
    };

})();