/**
 * Email Templates Manager - Gestion des templates email
 * Intégration avec éditeur WYSIWYG et Handlebars
 */

window.EmailTemplatesManager = (function() {
    'use strict';

    // Configuration des templates par défaut
    const EMAIL_TEMPLATES = {
        'welcome-client': {
            id: 'welcome-client',
            name: 'Bienvenue Client',
            subject: 'Bienvenue chez {{company_name}}',
            variables: ['client_name', 'company_name', 'project_name', 'portal_url'],
            html: `
                <h1>Bienvenue {{client_name}} !</h1>
                <p>Nous sommes ravis de démarrer le projet <strong>{{project_name}}</strong> avec vous.</p>
                <p>Vous pouvez accéder à votre espace client pour suivre l'avancement du projet :</p>
                <a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background-color: #206bc4; color: white; text-decoration: none; border-radius: 4px;">Accéder au portail</a>
                <p>Cordialement,<br>L'équipe {{company_name}}</p>
            `,
            category: 'onboarding',
            active: true,
            stats: { sent: 125, opened: 98, clicked: 67 }
        },
        'payment-received': {
            id: 'payment-received',
            name: 'Paiement Reçu',
            subject: 'Confirmation de paiement - Facture {{invoice_number}}',
            variables: ['amount', 'invoice_number', 'date', 'client_name'],
            html: `
                <h2>Paiement confirmé</h2>
                <p>Bonjour {{client_name}},</p>
                <p>Nous avons bien reçu votre paiement de <strong>CHF {{amount}}</strong> pour la facture {{invoice_number}}.</p>
                <table style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
                    <tr>
                        <td><strong>Numéro de facture :</strong></td>
                        <td>{{invoice_number}}</td>
                    </tr>
                    <tr>
                        <td><strong>Montant :</strong></td>
                        <td>CHF {{amount}}</td>
                    </tr>
                    <tr>
                        <td><strong>Date de paiement :</strong></td>
                        <td>{{date}}</td>
                    </tr>
                </table>
                <p>Merci pour votre confiance.</p>
            `,
            category: 'finance',
            active: true,
            stats: { sent: 89, opened: 87, clicked: 12 }
        },
        'project-risk-alert': {
            id: 'project-risk-alert',
            name: 'Alerte Projet à Risque',
            subject: '⚠️ Projet {{project_name}} nécessite votre attention',
            variables: ['project_name', 'health_score', 'issues', 'action_url'],
            html: `
                <div style="border: 2px solid #ef4444; border-radius: 8px; padding: 20px; background: #fee2e2;">
                    <h3 style="color: #991b1b;">⚠️ Projet à risque : {{project_name}}</h3>
                    <p><strong>Health Score :</strong> {{health_score}}/100</p>
                    <h4>Problèmes détectés :</h4>
                    <ul>
                        {{#each issues}}
                        <li>{{this}}</li>
                        {{/each}}
                    </ul>
                    <a href="{{action_url}}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 4px;">Voir le projet</a>
                </div>
            `,
            category: 'alerts',
            active: true,
            stats: { sent: 15, opened: 15, clicked: 14 }
        },
        'monthly-report': {
            id: 'monthly-report',
            name: 'Rapport Mensuel',
            subject: 'Rapport mensuel {{month}} {{year}} - {{company_name}}',
            variables: ['month', 'year', 'revenue', 'expenses', 'profit', 'kpis', 'company_name'],
            html: `
                <h1>Rapport Mensuel - {{month}} {{year}}</h1>
                <h2>Résumé Financier</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f3f4f6;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Revenus</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">CHF {{revenue}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Dépenses</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">CHF {{expenses}}</td>
                    </tr>
                    <tr style="background: #e0f2fe;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Profit</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>CHF {{profit}}</strong></td>
                    </tr>
                </table>
                <h3>KPIs Principaux</h3>
                {{#each kpis}}
                <p>• {{this.name}}: {{this.value}}</p>
                {{/each}}
                <p style="margin-top: 30px;">Rapport complet en pièce jointe.</p>
            `,
            category: 'reports',
            active: true,
            attachments: ['monthly-report.pdf'],
            stats: { sent: 36, opened: 34, clicked: 28 }
        }
    };

    // État local
    let allTemplates = [];
    let currentTemplate = null;
    let quillEditor = null;
    let codeMirrorEditor = null;
    let currentView = 'visual';

    // ID de la base Notion pour stocker templates
    const DB_EMAIL_TEMPLATES = '238adb95-3c6f-8025-a8b8-eac97aa36ebf'; // Placeholder

    /**
     * Initialisation du module
     */
    async function init() {
        console.log('📧 Initialisation Email Templates Manager...');
        
        if (!await window.checkSuperadminAuth()) {
            console.error('❌ Authentification SuperAdmin requise');
            return;
        }

        initEditors();
        setupEventListeners();
        await loadTemplates();
    }

    /**
     * Initialisation des éditeurs
     */
    function initEditors() {
        // Quill WYSIWYG Editor
        if (typeof Quill !== 'undefined') {
            quillEditor = new Quill('#quill-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            // Synchroniser avec l'aperçu
            quillEditor.on('text-change', debounce(updatePreview, 300));
        }

        // CodeMirror HTML Editor
        if (typeof CodeMirror !== 'undefined') {
            codeMirrorEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
                mode: 'htmlmixed',
                theme: 'monokai',
                lineNumbers: true,
                autoCloseTags: true,
                autoCloseBrackets: true
            });

            codeMirrorEditor.on('change', debounce(updatePreview, 300));
        }
    }

    /**
     * Configuration des event listeners
     */
    function setupEventListeners() {
        // Boutons principaux
        document.getElementById('save-template')?.addEventListener('click', saveTemplate);
        document.getElementById('test-email')?.addEventListener('click', showTestModal);
        document.getElementById('send-test-email')?.addEventListener('click', sendTestEmail);

        // Filtres catégories
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.addEventListener('click', (e) => filterByCategory(e.target.dataset.category));
        });

        // Changement de vue éditeur
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => switchEditorView(e.target.dataset.view));
        });

        // Variables cliquables
        document.querySelectorAll('.variable-tag').forEach(tag => {
            tag.addEventListener('click', (e) => insertVariable(e.target.dataset.var));
        });

        // Changement de catégorie
        document.getElementById('template-category')?.addEventListener('change', updateCategoryStyles);
    }

    /**
     * Chargement des templates
     */
    async function loadTemplates() {
        try {
            if (window.MCPNotionWrapper && typeof window.MCPNotionWrapper.queryDatabase === 'function') {
                // Charger depuis Notion si disponible
                const response = await window.MCPNotionWrapper.queryDatabase(DB_EMAIL_TEMPLATES);
                if (response.success) {
                    allTemplates = response.data.map(transformNotionTemplate);
                } else {
                    // Fallback sur templates par défaut
                    allTemplates = Object.values(EMAIL_TEMPLATES);
                }
            } else {
                // Pas de MCP, utiliser templates par défaut
                allTemplates = Object.values(EMAIL_TEMPLATES);
            }

            renderTemplatesGrid();
            populateTestSelect();

        } catch (error) {
            console.error('❌ Erreur chargement templates:', error);
            showNotification('error', 'Impossible de charger les templates');
        }
    }

    /**
     * Rendu de la grille de templates
     */
    function renderTemplatesGrid(templates = allTemplates) {
        const container = document.getElementById('templates-grid');
        if (!container) return;

        container.innerHTML = templates.map(template => `
            <div class="col-md-6 col-lg-4">
                <div class="template-card card" onclick="EmailTemplatesManager.editTemplate('${template.id}')">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h4 class="card-title mb-0">${template.name}</h4>
                            <span class="template-category category-${template.category}">${getCategoryLabel(template.category)}</span>
                        </div>
                        
                        <p class="text-muted mb-3">${template.subject}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="text-muted small">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/>
                                    <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/>
                                    <line x1="3" y1="6" x2="3" y2="19"/>
                                    <line x1="12" y1="6" x2="12" y2="19"/>
                                    <line x1="21" y1="6" x2="21" y2="19"/>
                                </svg>
                                ${template.variables.length} variables
                            </div>
                            <span class="badge ${template.active ? 'bg-success' : 'bg-secondary'}">
                                ${template.active ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                        
                        ${template.stats ? `
                            <div class="row text-center small">
                                <div class="col">
                                    <div class="text-muted">Envoyés</div>
                                    <div class="font-weight-medium">${template.stats.sent}</div>
                                </div>
                                <div class="col">
                                    <div class="text-muted">Ouverts</div>
                                    <div class="font-weight-medium">${Math.round(template.stats.opened / template.stats.sent * 100)}%</div>
                                </div>
                                <div class="col">
                                    <div class="text-muted">Clics</div>
                                    <div class="font-weight-medium">${Math.round(template.stats.clicked / template.stats.sent * 100)}%</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Éditer un template
     */
    function editTemplate(templateId) {
        const template = allTemplates.find(t => t.id === templateId);
        if (!template) return;

        currentTemplate = template;

        // Pré-remplir le formulaire
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-subject').value = template.subject;
        document.getElementById('template-category').value = template.category;
        document.getElementById('template-active').checked = template.active;

        // Charger le contenu dans les éditeurs
        if (quillEditor) {
            quillEditor.root.innerHTML = template.html;
        }
        if (codeMirrorEditor) {
            codeMirrorEditor.setValue(template.html);
        }

        // Mettre à jour les variables disponibles
        updateAvailableVariables(template.variables);

        // Mettre à jour l'aperçu
        updatePreview();

        // Afficher le modal
        new bootstrap.Modal(document.getElementById('createTemplateModal')).show();
    }

    /**
     * Sauvegarder un template
     */
    async function saveTemplate() {
        const templateData = {
            name: document.getElementById('template-name').value,
            subject: document.getElementById('template-subject').value,
            category: document.getElementById('template-category').value,
            active: document.getElementById('template-active').checked,
            html: currentView === 'visual' ? quillEditor.root.innerHTML : codeMirrorEditor.getValue(),
            variables: extractVariables()
        };

        if (!validateTemplate(templateData)) {
            return;
        }

        try {
            showLoadingOverlay();

            // Sauvegarder dans Notion si disponible
            if (window.MCPNotionWrapper) {
                if (currentTemplate?.notionId) {
                    // Mise à jour
                    await window.MCPNotionWrapper.updatePage(currentTemplate.notionId, {
                        properties: {
                            'Name': templateData.name,
                            'Subject': templateData.subject,
                            'Category': templateData.category,
                            'HTML': templateData.html,
                            'Variables': templateData.variables.join(','),
                            'Active': templateData.active
                        }
                    });
                } else {
                    // Création
                    await window.MCPNotionWrapper.createPage({
                        parent_id: DB_EMAIL_TEMPLATES,
                        parent_type: 'database',
                        title: templateData.name,
                        properties: {
                            'Subject': templateData.subject,
                            'Category': templateData.category,
                            'HTML': templateData.html,
                            'Variables': templateData.variables.join(','),
                            'Active': templateData.active
                        }
                    });
                }
            }

            showNotification('success', 'Template sauvegardé avec succès');
            bootstrap.Modal.getInstance(document.getElementById('createTemplateModal')).hide();
            await loadTemplates();

        } catch (error) {
            console.error('❌ Erreur sauvegarde template:', error);
            showNotification('error', 'Erreur lors de la sauvegarde');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Extraire les variables du template
     */
    function extractVariables() {
        const html = currentView === 'visual' ? quillEditor.root.innerHTML : codeMirrorEditor.getValue();
        const regex = /\{\{([^}]+)\}\}/g;
        const variables = new Set();
        let match;

        while ((match = regex.exec(html)) !== null) {
            const variable = match[1].trim();
            // Ignorer les helpers Handlebars
            if (!variable.startsWith('#') && !variable.startsWith('/')) {
                variables.add(variable);
            }
        }

        return Array.from(variables);
    }

    /**
     * Validation du template
     */
    function validateTemplate(data) {
        if (!data.name || !data.subject || !data.html) {
            showNotification('error', 'Tous les champs sont requis');
            return false;
        }

        if (data.variables.length === 0) {
            showNotification('warning', 'Aucune variable détectée dans le template');
        }

        return true;
    }

    /**
     * Changer de vue éditeur
     */
    function switchEditorView(view) {
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        document.getElementById('editor-visual').style.display = view === 'visual' ? 'block' : 'none';
        document.getElementById('editor-code').style.display = view === 'code' ? 'block' : 'none';

        currentView = view;

        // Synchroniser le contenu entre éditeurs
        if (view === 'code' && quillEditor && codeMirrorEditor) {
            codeMirrorEditor.setValue(quillEditor.root.innerHTML);
        } else if (view === 'visual' && quillEditor && codeMirrorEditor) {
            quillEditor.root.innerHTML = codeMirrorEditor.getValue();
        }
    }

    /**
     * Insérer une variable
     */
    function insertVariable(varName) {
        const variable = `{{${varName}}}`;

        if (currentView === 'visual' && quillEditor) {
            const range = quillEditor.getSelection();
            if (range) {
                quillEditor.insertText(range.index, variable);
            } else {
                quillEditor.insertText(quillEditor.getLength() - 1, variable);
            }
        } else if (currentView === 'code' && codeMirrorEditor) {
            codeMirrorEditor.replaceSelection(variable);
        }

        updatePreview();
    }

    /**
     * Mettre à jour l'aperçu
     */
    function updatePreview() {
        const preview = document.getElementById('email-preview');
        if (!preview) return;

        const html = currentView === 'visual' ? quillEditor.root.innerHTML : codeMirrorEditor.getValue();
        
        // Exemple de données pour l'aperçu
        const sampleData = {
            client_name: 'Jean Dupont',
            company_name: 'Ma Société SA',
            project_name: 'Projet Exemple',
            portal_url: 'https://portal.masociete.ch',
            amount: "1'500.00",
            invoice_number: 'INV-2024-001',
            date: new Date().toLocaleDateString('fr-CH'),
            health_score: 45,
            issues: ['Budget dépassé de 20%', 'Délai retardé de 2 semaines', 'Ressources manquantes'],
            action_url: '#',
            month: 'Janvier',
            year: '2024',
            revenue: "125'000",
            expenses: "87'500",
            profit: "37'500",
            kpis: [
                { name: 'Nouveaux clients', value: '12' },
                { name: 'Taux de satisfaction', value: '94%' },
                { name: 'Projets livrés', value: '8' }
            ]
        };

        try {
            const compiledTemplate = Handlebars.compile(html);
            preview.innerHTML = compiledTemplate(sampleData);
        } catch (error) {
            preview.innerHTML = `<div class="text-danger">Erreur template: ${error.message}</div>`;
        }
    }

    /**
     * Filtrer par catégorie
     */
    function filterByCategory(category) {
        // Mettre à jour les boutons
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        let filtered = allTemplates;
        if (category !== 'all') {
            filtered = allTemplates.filter(t => t.category === category);
        }

        renderTemplatesGrid(filtered);
    }

    /**
     * Afficher modal de test
     */
    function showTestModal() {
        new bootstrap.Modal(document.getElementById('testEmailModal')).show();
    }

    /**
     * Peupler le select de test
     */
    function populateTestSelect() {
        const select = document.getElementById('test-template-select');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un template</option>' +
            allTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    /**
     * Envoyer email de test
     */
    async function sendTestEmail() {
        const templateId = document.getElementById('test-template-select').value;
        const recipient = document.getElementById('test-recipient').value;
        const variablesJson = document.getElementById('test-variables').value;

        if (!templateId || !recipient) {
            showNotification('error', 'Template et destinataire requis');
            return;
        }

        try {
            const variables = JSON.parse(variablesJson);
            const template = allTemplates.find(t => t.id === templateId);
            
            if (!template) {
                throw new Error('Template non trouvé');
            }

            showLoadingOverlay();

            // Simuler l'envoi (en production, appeler l'API d'envoi)
            await new Promise(resolve => setTimeout(resolve, 2000));

            showNotification('success', `Email de test envoyé à ${recipient}`);
            bootstrap.Modal.getInstance(document.getElementById('testEmailModal')).hide();

        } catch (error) {
            console.error('❌ Erreur envoi test:', error);
            showNotification('error', 'Erreur lors de l\'envoi du test');
        } finally {
            hideLoadingOverlay();
        }
    }

    /**
     * Mettre à jour les styles de catégorie
     */
    function updateCategoryStyles() {
        const category = document.getElementById('template-category').value;
        // Implémenter si nécessaire
    }

    /**
     * Mettre à jour les variables disponibles
     */
    function updateAvailableVariables(variables) {
        const container = document.getElementById('variables-list');
        if (!container) return;

        // Ajouter les variables spécifiques du template
        const defaultVars = ['client_name', 'company_name', 'date'];
        const allVars = [...new Set([...defaultVars, ...variables])];

        container.innerHTML = allVars.map(v => 
            `<span class="variable-tag" data-var="${v}" onclick="EmailTemplatesManager.insertVariable('${v}')">{{${v}}}</span>`
        ).join('');
    }

    /**
     * Transformer template Notion
     */
    function transformNotionTemplate(notionPage) {
        const props = notionPage.properties;
        
        return {
            id: notionPage.id,
            notionId: notionPage.id,
            name: props['Name']?.title?.[0]?.plain_text || '',
            subject: props['Subject']?.rich_text?.[0]?.plain_text || '',
            category: props['Category']?.select?.name || 'other',
            html: props['HTML']?.rich_text?.[0]?.plain_text || '',
            variables: props['Variables']?.rich_text?.[0]?.plain_text?.split(',') || [],
            active: props['Active']?.checkbox || false,
            stats: {
                sent: props['Sent']?.number || 0,
                opened: props['Opened']?.number || 0,
                clicked: props['Clicked']?.number || 0
            }
        };
    }

    /**
     * Utilitaires
     */
    function getCategoryLabel(category) {
        const labels = {
            'onboarding': 'Onboarding',
            'finance': 'Finance',
            'alerts': 'Alertes',
            'reports': 'Rapports'
        };
        return labels[category] || category;
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
        editTemplate,
        insertVariable
    };

})();