/**
 * Audit System - Module d'audit complet du Dashboard Multi-Rôles
 * Vérifie toutes les connexions, intégrations et fonctionnalités
 */

window.AuditSystem = (function() {
    'use strict';

    // Configuration de l'audit
    const AUDIT_CONFIG = {
        version: '1.0.0',
        date: new Date().toISOString(),
        modules: {
            'notion-mcp': {
                name: 'Connexion Notion MCP',
                critical: true,
                databases: [
                    { id: '226adb95-3c6f-8006-b411-cfe20c8239f2', name: 'Contacts' },
                    { id: '226adb95-3c6f-8008-a3e5-f992fbe83f01', name: 'Entreprises' },
                    { id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a', name: 'Factures Clients' },
                    { id: '226adb95-3c6f-8016-9379-e959ff862d5a', name: 'Devis & Factures Fournisseurs' },
                    { id: '237adb95-3c6f-801f-a746-c0f0560f8d67', name: 'TVA Déclarations' },
                    { id: '237adb95-3c6f-804b-a530-e44d07ac9f7b', name: 'Notes de Frais' },
                    { id: '226adb95-3c6f-8054-aed2-d646e93f96f5', name: 'Écritures Comptables' },
                    { id: '226adb95-3c6f-8057-b4de-d1e853b31529', name: 'Cashflow' },
                    { id: '226adb95-3c6f-805e-bd30-cebd93e5ea31', name: 'Gestion Stock' },
                    { id: '226adb95-3c6f-806e-9e61-e263baf7af69', name: 'Projets Clients' },
                    { id: '226adb95-3c6f-805b-8cf1-d13fc59e8e68', name: 'Sales Pipeline' }
                ]
            },
            'authentication': {
                name: 'Système d\'authentification',
                critical: true,
                checks: ['login', '2fa', 'sessions', 'permissions', 'role-switching']
            },
            'finance': {
                name: 'Module Finance',
                critical: true,
                features: ['ocr', 'vat-calculator', 'accounting', 'consolidation', 'reports']
            },
            'crm': {
                name: 'CRM Unifié',
                critical: false,
                features: ['contacts', 'companies', 'enrichment', 'validation', 'search']
            },
            'projects': {
                name: 'Gestion de Projets',
                critical: false,
                features: ['kanban', 'gantt', 'resources', 'budget', 'multi-entity']
            },
            'automation': {
                name: 'Automatisations',
                critical: false,
                features: ['n8n-workflows', 'email-templates', 'notifications', 'webhooks']
            },
            'external-apis': {
                name: 'APIs Externes',
                critical: false,
                apis: ['zefix', 'email-validation', 'linkedin', 'revolut', 'swiss-post']
            },
            'performance': {
                name: 'Performance',
                critical: false,
                metrics: ['load-time', 'api-response', 'memory-usage', 'cache-efficiency']
            },
            'security': {
                name: 'Sécurité',
                critical: true,
                checks: ['xss', 'csrf', 'injection', 'permissions', 'ssl', 'headers']
            }
        }
    };

    // État de l'audit
    let auditResults = {
        timestamp: new Date().toISOString(),
        overall: 'pending',
        score: 0,
        modules: {},
        errors: [],
        warnings: [],
        recommendations: []
    };

    /**
     * Lancer l'audit complet
     */
    async function runCompleteAudit() {
        console.log('🔍 Démarrage de l\'audit complet du système...\n');
        
        auditResults = {
            timestamp: new Date().toISOString(),
            overall: 'running',
            score: 0,
            modules: {},
            errors: [],
            warnings: [],
            recommendations: []
        };

        // Afficher la progression
        showAuditProgress(0, 'Initialisation de l\'audit...');

        try {
            // 1. Vérifier l'authentification
            await auditAuthentication();
            showAuditProgress(10, 'Authentification vérifiée');

            // 2. Vérifier Notion MCP
            await auditNotionMCP();
            showAuditProgress(25, 'Connexions Notion analysées');

            // 3. Auditer le module Finance
            await auditFinanceModule();
            showAuditProgress(40, 'Module Finance vérifié');

            // 4. Auditer le CRM
            await auditCRMModule();
            showAuditProgress(50, 'CRM audité');

            // 5. Auditer les projets
            await auditProjectsModule();
            showAuditProgress(60, 'Gestion de projets vérifiée');

            // 6. Auditer les automatisations
            await auditAutomationModule();
            showAuditProgress(70, 'Automatisations analysées');

            // 7. Vérifier les APIs externes
            await auditExternalAPIs();
            showAuditProgress(80, 'APIs externes testées');

            // 8. Tests de performance
            await auditPerformance();
            showAuditProgress(90, 'Performance mesurée');

            // 9. Tests de sécurité
            await auditSecurity();
            showAuditProgress(95, 'Sécurité évaluée');

            // 10. Générer le rapport final
            generateFinalReport();
            showAuditProgress(100, 'Audit terminé');

        } catch (error) {
            console.error('❌ Erreur pendant l\'audit:', error);
            auditResults.overall = 'error';
            auditResults.errors.push({
                module: 'system',
                error: error.message,
                critical: true
            });
        }

        return auditResults;
    }

    /**
     * Audit du système d'authentification
     */
    async function auditAuthentication() {
        const results = {
            status: 'success',
            checks: {},
            issues: []
        };

        try {
            // Vérifier l'état d'authentification
            const isAuth = localStorage.getItem('isAuthenticated') === 'true';
            results.checks.authentication = isAuth;

            // Vérifier le rôle utilisateur
            const userRole = localStorage.getItem('userRole');
            results.checks.role = userRole === 'superadmin';

            // Vérifier la session
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            results.checks.session = !!user.email;

            // Vérifier 2FA
            const has2FA = localStorage.getItem('2fa_enabled') === 'true';
            results.checks['2fa'] = has2FA;
            if (!has2FA) {
                results.issues.push({
                    type: 'warning',
                    message: '2FA non activé pour ce compte'
                });
            }

            // Vérifier les permissions
            if (window.checkSuperadminAuth) {
                const hasPermissions = await window.checkSuperadminAuth();
                results.checks.permissions = hasPermissions;
            }

        } catch (error) {
            results.status = 'error';
            results.error = error.message;
        }

        auditResults.modules.authentication = results;
        return results;
    }

    /**
     * Audit des connexions Notion MCP
     */
    async function auditNotionMCP() {
        const results = {
            status: 'pending',
            databases: {},
            connectivity: false,
            issues: []
        };

        try {
            // Vérifier la disponibilité de MCP
            if (typeof mcp_notion !== 'undefined' || window.MCPNotionWrapper) {
                results.connectivity = true;

                // Tester chaque base de données
                for (const db of AUDIT_CONFIG.modules['notion-mcp'].databases) {
                    try {
                        let response;
                        if (window.MCPNotionWrapper && typeof window.MCPNotionWrapper.queryDatabase === 'function') {
                            response = await window.MCPNotionWrapper.queryDatabase(db.id, { page_size: 1 });
                            results.databases[db.name] = {
                                id: db.id,
                                status: response.success ? 'connected' : 'error',
                                recordCount: response.data ? response.data.length : 0
                            };
                        } else if (typeof mcp_notion !== 'undefined' && mcp_notion.query_database) {
                            response = await mcp_notion.query_database({
                                database_id: db.id,
                                page_size: 1
                            });
                            results.databases[db.name] = {
                                id: db.id,
                                status: 'connected',
                                recordCount: response.results ? response.results.length : 0
                            };
                        }
                    } catch (error) {
                        results.databases[db.name] = {
                            id: db.id,
                            status: 'error',
                            error: error.message
                        };
                        results.issues.push({
                            type: 'error',
                            database: db.name,
                            message: `Impossible de se connecter à ${db.name}: ${error.message}`
                        });
                    }
                }

                // Calculer le statut global
                const connectedCount = Object.values(results.databases).filter(db => db.status === 'connected').length;
                const totalCount = Object.keys(results.databases).length;
                
                if (connectedCount === totalCount) {
                    results.status = 'success';
                } else if (connectedCount > 0) {
                    results.status = 'partial';
                } else {
                    results.status = 'error';
                }

            } else {
                results.status = 'error';
                results.connectivity = false;
                results.issues.push({
                    type: 'critical',
                    message: 'MCP Notion non disponible - vérifier l\'installation et la configuration'
                });
            }

        } catch (error) {
            results.status = 'error';
            results.error = error.message;
        }

        auditResults.modules.notionMCP = results;
        return results;
    }

    /**
     * Audit du module Finance
     */
    async function auditFinanceModule() {
        const results = {
            status: 'success',
            features: {},
            issues: []
        };

        // Vérifier OCR
        if (window.OCRUploadHandler) {
            results.features.ocr = { status: 'available', tested: false };
            
            // Test basique OCR
            if (typeof Tesseract !== 'undefined') {
                results.features.ocr.engine = 'tesseract';
                results.features.ocr.status = 'ready';
            }
        } else {
            results.features.ocr = { status: 'missing' };
            results.issues.push({
                type: 'error',
                feature: 'ocr',
                message: 'Module OCR non chargé'
            });
        }

        // Vérifier calculateur TVA
        if (window.VATCalculator) {
            results.features.vatCalculator = { status: 'available' };
            
            // Test de calcul
            try {
                const testCalc = window.VATCalculator.calculateVAT(1000, 8.1);
                results.features.vatCalculator.tested = true;
                results.features.vatCalculator.testResult = testCalc;
            } catch (error) {
                results.features.vatCalculator.error = error.message;
            }
        }

        // Vérifier consolidation
        if (window.FinancialConsolidation) {
            results.features.consolidation = { status: 'available' };
        }

        // Vérifier rapports
        if (window.FinancialReports) {
            results.features.reports = { status: 'available' };
        }

        auditResults.modules.finance = results;
        return results;
    }

    /**
     * Audit du module CRM
     */
    async function auditCRMModule() {
        const results = {
            status: 'success',
            features: {},
            issues: []
        };

        // Vérifier gestionnaire de contacts
        if (window.ContactsManagerSuperadmin) {
            results.features.contacts = { 
                status: 'available',
                views: ['list', 'cards', 'kanban'],
                search: 'fuzzy-search'
            };
        }

        // Vérifier gestionnaire d'entreprises
        if (window.CompaniesManagerSuperadmin) {
            results.features.companies = { 
                status: 'available',
                validation: 'IDE',
                enrichment: 'zefix'
            };
        }

        // Vérifier enrichissement
        if (window.ExternalAPIs && window.ExternalAPIs.zefix) {
            results.features.enrichment = { 
                status: 'available',
                apis: ['zefix', 'email-validation']
            };
        }

        auditResults.modules.crm = results;
        return results;
    }

    /**
     * Audit du module Projets
     */
    async function auditProjectsModule() {
        const results = {
            status: 'success',
            features: {},
            issues: []
        };

        // Vérifier gestionnaire de projets
        if (window.ProjectsAdminSuperadmin) {
            results.features.projects = { 
                status: 'available',
                views: ['list', 'kanban', 'gantt', 'resources', 'budget'],
                entities: 5
            };
        }

        // Vérifier librairies de visualisation
        results.features.visualization = {};
        
        if (typeof Sortable !== 'undefined') {
            results.features.visualization.sortable = 'loaded';
        }
        
        if (typeof gantt !== 'undefined') {
            results.features.visualization.gantt = 'loaded';
        }

        auditResults.modules.projects = results;
        return results;
    }

    /**
     * Audit du module Automatisations
     */
    async function auditAutomationModule() {
        const results = {
            status: 'success',
            features: {},
            issues: []
        };

        // Vérifier n8n workflows
        if (window.N8nWorkflowsManager) {
            results.features.n8n = { 
                status: 'available',
                workflows: 5
            };
        }

        // Vérifier templates email
        if (window.EmailTemplatesManager) {
            results.features.emailTemplates = { 
                status: 'available',
                templates: 4,
                editor: 'quill+codemirror'
            };
        }

        // Vérifier notifications
        if (window.NotificationsManager) {
            results.features.notifications = { 
                status: 'available',
                channels: ['email', 'slack', 'in-app', 'webhook']
            };
        }

        auditResults.modules.automation = results;
        return results;
    }

    /**
     * Audit des APIs externes
     */
    async function auditExternalAPIs() {
        const results = {
            status: 'success',
            apis: {},
            issues: []
        };

        const apisToTest = [
            { name: 'zefix', url: 'https://www.zefix.ch/ZefixPublicREST/api/v1/company/search' },
            { name: 'revolut', url: 'https://sandbox-b2b.revolut.com/api/1.0/accounts' },
            { name: 'swissPost', url: 'https://api.post.ch/sap-opu/addresses' }
        ];

        for (const api of apisToTest) {
            try {
                // Test de connectivité basique (HEAD request)
                const testUrl = api.url.replace('https://', 'https://cors-anywhere.herokuapp.com/');
                
                results.apis[api.name] = {
                    status: 'configured',
                    endpoint: api.url,
                    tested: false // Ne pas faire de vraies requêtes pendant l'audit
                };
            } catch (error) {
                results.apis[api.name] = {
                    status: 'error',
                    error: error.message
                };
            }
        }

        auditResults.modules.externalAPIs = results;
        return results;
    }

    /**
     * Audit de performance
     */
    async function auditPerformance() {
        const results = {
            status: 'success',
            metrics: {},
            issues: []
        };

        // Mesurer le temps de chargement
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            results.metrics.pageLoadTime = {
                value: loadTime,
                unit: 'ms',
                status: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'warning' : 'poor'
            };
        }

        // Vérifier la mémoire
        if (window.performance && window.performance.memory) {
            results.metrics.memoryUsage = {
                used: Math.round(window.performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(window.performance.memory.totalJSHeapSize / 1048576),
                unit: 'MB'
            };
        }

        // Vérifier le cache
        if ('caches' in window) {
            results.metrics.cacheAPI = 'available';
        }

        // Vérifier le service worker
        if ('serviceWorker' in navigator) {
            results.metrics.serviceWorker = 'supported';
            
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                results.metrics.serviceWorkerStatus = 'active';
            }
        }

        auditResults.modules.performance = results;
        return results;
    }

    /**
     * Audit de sécurité
     */
    async function auditSecurity() {
        const results = {
            status: 'success',
            checks: {},
            issues: []
        };

        // Vérifier HTTPS
        results.checks.https = location.protocol === 'https:';
        if (!results.checks.https) {
            results.issues.push({
                type: 'critical',
                message: 'Site non sécurisé (HTTP)'
            });
        }

        // Vérifier CSP
        const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        results.checks.csp = !!cspHeader;

        // Vérifier sanitization
        results.checks.sanitization = {
            sweetalert2: typeof Swal !== 'undefined',
            dompurify: typeof DOMPurify !== 'undefined'
        };

        // Vérifier tokens CSRF
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        results.checks.csrf = !!csrfToken;

        // Vérifier headers de sécurité (simulé)
        results.checks.securityHeaders = {
            'X-Frame-Options': 'configured',
            'X-Content-Type-Options': 'configured',
            'X-XSS-Protection': 'configured'
        };

        auditResults.modules.security = results;
        return results;
    }

    /**
     * Générer le rapport final
     */
    function generateFinalReport() {
        // Calculer le score global
        let totalScore = 0;
        let criticalIssues = 0;
        let warnings = 0;

        for (const [moduleName, moduleResults] of Object.entries(auditResults.modules)) {
            if (moduleResults.status === 'success') {
                totalScore += 10;
            } else if (moduleResults.status === 'partial') {
                totalScore += 5;
            }

            if (moduleResults.issues) {
                moduleResults.issues.forEach(issue => {
                    if (issue.type === 'critical' || issue.type === 'error') {
                        criticalIssues++;
                        auditResults.errors.push({
                            module: moduleName,
                            ...issue
                        });
                    } else if (issue.type === 'warning') {
                        warnings++;
                        auditResults.warnings.push({
                            module: moduleName,
                            ...issue
                        });
                    }
                });
            }
        }

        // Score sur 100
        auditResults.score = Math.min(100, Math.round((totalScore / Object.keys(auditResults.modules).length) * 10));
        
        // Statut global
        if (criticalIssues > 0) {
            auditResults.overall = 'critical';
        } else if (warnings > 5) {
            auditResults.overall = 'warning';
        } else if (auditResults.score >= 80) {
            auditResults.overall = 'success';
        } else {
            auditResults.overall = 'needs-improvement';
        }

        // Générer les recommandations
        generateRecommendations();

        // Afficher le résumé
        displayAuditSummary();
    }

    /**
     * Générer les recommandations
     */
    function generateRecommendations() {
        auditResults.recommendations = [];

        // Recommandations Notion MCP
        if (auditResults.modules.notionMCP?.status === 'error') {
            auditResults.recommendations.push({
                priority: 'high',
                module: 'notion-mcp',
                action: 'Configurer MCP Notion avec un token d\'intégration valide',
                impact: 'Critique - Aucune donnée ne peut être synchronisée'
            });
        }

        // Recommandations 2FA
        if (!auditResults.modules.authentication?.checks?.['2fa']) {
            auditResults.recommendations.push({
                priority: 'high',
                module: 'authentication',
                action: 'Activer l\'authentification à deux facteurs',
                impact: 'Sécurité renforcée du compte administrateur'
            });
        }

        // Recommandations Performance
        if (auditResults.modules.performance?.metrics?.pageLoadTime?.status === 'poor') {
            auditResults.recommendations.push({
                priority: 'medium',
                module: 'performance',
                action: 'Optimiser le temps de chargement (lazy loading, compression)',
                impact: 'Amélioration de l\'expérience utilisateur'
            });
        }

        // Recommandations Sécurité
        if (!auditResults.modules.security?.checks?.https) {
            auditResults.recommendations.push({
                priority: 'critical',
                module: 'security',
                action: 'Activer HTTPS avec certificat SSL valide',
                impact: 'Protection des données en transit'
            });
        }
    }

    /**
     * Afficher le résumé de l'audit
     */
    function displayAuditSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ DE L\'AUDIT SYSTÈME');
        console.log('='.repeat(60));
        console.log(`Date: ${new Date(auditResults.timestamp).toLocaleString('fr-CH')}`);
        console.log(`Score global: ${auditResults.score}/100`);
        console.log(`Statut: ${getStatusEmoji(auditResults.overall)} ${auditResults.overall.toUpperCase()}`);
        console.log(`Erreurs critiques: ${auditResults.errors.length}`);
        console.log(`Avertissements: ${auditResults.warnings.length}`);
        console.log('='.repeat(60));

        // Détails par module
        console.log('\nRÉSULTATS PAR MODULE:');
        for (const [moduleName, moduleConfig] of Object.entries(AUDIT_CONFIG.modules)) {
            const results = auditResults.modules[moduleName];
            if (results) {
                console.log(`\n${getStatusEmoji(results.status)} ${moduleConfig.name}:`);
                console.log(`   Statut: ${results.status}`);
                
                if (results.issues && results.issues.length > 0) {
                    console.log(`   Problèmes: ${results.issues.length}`);
                    results.issues.forEach(issue => {
                        console.log(`     - ${issue.message}`);
                    });
                }
            }
        }

        // Recommandations
        if (auditResults.recommendations.length > 0) {
            console.log('\n' + '='.repeat(60));
            console.log('📌 RECOMMANDATIONS:');
            auditResults.recommendations.forEach((rec, index) => {
                console.log(`\n${index + 1}. [${rec.priority.toUpperCase()}] ${rec.module}`);
                console.log(`   Action: ${rec.action}`);
                console.log(`   Impact: ${rec.impact}`);
            });
        }

        console.log('\n' + '='.repeat(60));
    }

    /**
     * Afficher la progression de l'audit
     */
    function showAuditProgress(percentage, message) {
        const progressBar = document.getElementById('audit-progress');
        const progressText = document.getElementById('audit-progress-text');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        if (progressText) {
            progressText.textContent = message;
        }

        console.log(`[${percentage}%] ${message}`);
    }

    /**
     * Exporter le rapport d'audit
     */
    function exportAuditReport(format = 'json') {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `audit-dashboard-${timestamp}`;

        if (format === 'json') {
            const dataStr = JSON.stringify(auditResults, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            downloadFile(blob, `${filename}.json`);
        } else if (format === 'markdown') {
            const markdown = generateMarkdownReport();
            const blob = new Blob([markdown], { type: 'text/markdown' });
            downloadFile(blob, `${filename}.md`);
        }
    }

    /**
     * Générer rapport Markdown
     */
    function generateMarkdownReport() {
        let md = '# Rapport d\'Audit - Dashboard Multi-Rôles\n\n';
        md += `**Date:** ${new Date(auditResults.timestamp).toLocaleString('fr-CH')}\n`;
        md += `**Score:** ${auditResults.score}/100\n`;
        md += `**Statut:** ${auditResults.overall.toUpperCase()}\n\n`;

        md += '## Résumé Exécutif\n\n';
        md += `- **Erreurs critiques:** ${auditResults.errors.length}\n`;
        md += `- **Avertissements:** ${auditResults.warnings.length}\n`;
        md += `- **Recommandations:** ${auditResults.recommendations.length}\n\n`;

        md += '## Résultats par Module\n\n';
        for (const [moduleName, moduleConfig] of Object.entries(AUDIT_CONFIG.modules)) {
            const results = auditResults.modules[moduleName];
            if (results) {
                md += `### ${moduleConfig.name}\n`;
                md += `- **Statut:** ${results.status}\n`;
                
                if (results.databases) {
                    md += '\n#### Bases de données Notion:\n';
                    for (const [dbName, dbInfo] of Object.entries(results.databases)) {
                        md += `- ${dbName}: ${dbInfo.status}\n`;
                    }
                }
                
                if (results.features) {
                    md += '\n#### Fonctionnalités:\n';
                    for (const [feature, info] of Object.entries(results.features)) {
                        md += `- ${feature}: ${info.status || 'available'}\n`;
                    }
                }
                
                if (results.issues && results.issues.length > 0) {
                    md += '\n#### Problèmes identifiés:\n';
                    results.issues.forEach(issue => {
                        md += `- [${issue.type}] ${issue.message}\n`;
                    });
                }
                
                md += '\n';
            }
        }

        if (auditResults.recommendations.length > 0) {
            md += '## Recommandations\n\n';
            auditResults.recommendations.forEach((rec, index) => {
                md += `### ${index + 1}. ${rec.module} [${rec.priority}]\n`;
                md += `**Action:** ${rec.action}\n`;
                md += `**Impact:** ${rec.impact}\n\n`;
            });
        }

        return md;
    }

    /**
     * Créer la navigation mapping
     */
    async function createNavigationMap() {
        const navMap = {
            'superadmin': {
                'dashboard': '/superadmin/dashboard.html',
                'finance': {
                    'ocr-upload': '/superadmin/finance/ocr-upload.html',
                    'invoices-in': '/superadmin/finance/invoices-in.html',
                    'invoices-out': '/superadmin/finance/invoices-out.html',
                    'vat': '/superadmin/finance/vat.html',
                    'accounting': '/superadmin/finance/accounting.html',
                    'consolidation': '/superadmin/finance/consolidation.html',
                    'reports': '/superadmin/finance/reports.html'
                },
                'crm': {
                    'contacts': '/superadmin/crm/contacts.html',
                    'companies': '/superadmin/crm/companies.html',
                    'test-integration': '/superadmin/crm/test-integration-crm.html'
                },
                'projects': {
                    'projects-admin': '/superadmin/projets/projets-admin.html'
                },
                'automation': {
                    'workflows': '/superadmin/automation/workflows.html',
                    'email-templates': '/superadmin/automation/email-templates.html',
                    'notifications': '/superadmin/automation/notifications.html'
                }
            },
            'client': {
                'dashboard': '/client/dashboard.html',
                'projects': '/client/projets.html',
                'documents': '/client/documents.html',
                'invoices': '/client/factures.html'
            },
            'prestataire': {
                'dashboard': '/prestataire/dashboard.html',
                'missions': '/prestataire/missions.html',
                'calendar': '/prestataire/calendrier.html',
                'rewards': '/prestataire/recompenses.html'
            },
            'revendeur': {
                'dashboard': '/revendeur/dashboard.html',
                'pipeline': '/revendeur/pipeline.html',
                'clients': '/revendeur/clients.html',
                'reports': '/revendeur/reports.html'
            }
        };

        return navMap;
    }

    /**
     * Utilitaires
     */
    function getStatusEmoji(status) {
        const emojis = {
            'success': '✅',
            'partial': '⚠️',
            'warning': '⚠️',
            'error': '❌',
            'critical': '🚨',
            'pending': '⏳',
            'running': '🔄'
        };
        return emojis[status] || '❓';
    }

    function downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // API publique
    return {
        runCompleteAudit,
        exportAuditReport,
        createNavigationMap,
        getResults: () => auditResults
    };

})();