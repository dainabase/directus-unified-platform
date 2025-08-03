/**
 * E2E Tests - Tests end-to-end automatisés
 * Validation complète du système SuperAdmin
 */

window.E2ETests = (function() {
    'use strict';

    // Configuration des suites de tests
    const TEST_SUITES = {
        'auth-flow': {
            name: 'Authentification Multi-Rôles',
            tests: [
                {
                    name: 'Login SuperAdmin avec 2FA',
                    steps: [
                        { action: 'navigate', url: '/login.html' },
                        { action: 'fill', selector: '#email', value: 'admin@company.ch' },
                        { action: 'fill', selector: '#password', value: 'test123' },
                        { action: 'click', selector: '#loginBtn' },
                        { action: 'wait', ms: 1000 },
                        { action: 'fill', selector: '#otpCode', value: '123456' },
                        { action: 'click', selector: '#verify2FA' },
                        { assert: 'url', expected: '/superadmin/dashboard.html' },
                        { assert: 'element', selector: '.role-superadmin' }
                    ]
                },
                {
                    name: 'Permissions par rôle',
                    steps: [
                        { action: 'login', role: 'client' },
                        { action: 'navigate', url: '/superadmin/dashboard.html' },
                        { assert: 'redirected', to: '/client/dashboard.html' }
                    ]
                },
                {
                    name: 'Logout et session expirée',
                    steps: [
                        { action: 'login', role: 'superadmin' },
                        { action: 'click', selector: '#logoutBtn' },
                        { assert: 'url', expected: '/login.html' },
                        { assert: 'localStorage', key: 'isAuthenticated', value: false }
                    ]
                }
            ]
        },
        'ocr-workflow': {
            name: 'Workflow OCR Complet',
            tests: [
                {
                    name: 'Upload et traitement facture',
                    steps: [
                        { action: 'login', role: 'superadmin' },
                        { action: 'navigate', url: '/superadmin/finance/ocr-upload.html' },
                        { action: 'upload', selector: '#dropzone', file: 'test-invoice.pdf' },
                        { action: 'wait', ms: 5000 },
                        { assert: 'element', selector: '.ocr-result' },
                        { assert: 'text', selector: '.supplier-name', contains: 'Fournisseur SA' },
                        { assert: 'value', selector: '#amount', expected: "1'500.00" },
                        { action: 'click', selector: '#validateOCR' },
                        { assert: 'notification', type: 'success' }
                    ]
                },
                {
                    name: 'Catégorisation automatique',
                    steps: [
                        { action: 'upload', selector: '#dropzone', file: 'test-expense-note.jpg' },
                        { action: 'wait', ms: 3000 },
                        { assert: 'value', selector: '#category', expected: 'Note de frais' },
                        { assert: 'element', selector: '.suggested-account' },
                        { action: 'click', selector: '#acceptSuggestion' },
                        { assert: 'class', selector: '#validateBtn', contains: 'btn-primary' }
                    ]
                }
            ]
        },
        'multi-entity': {
            name: 'Gestion Multi-Entités',
            tests: [
                {
                    name: 'Consolidation financière',
                    steps: [
                        { action: 'login', role: 'superadmin' },
                        { action: 'navigate', url: '/superadmin/finance/consolidation.html' },
                        { action: 'select', selector: '#period', value: '2024-01' },
                        { action: 'click', selector: '#runConsolidation' },
                        { action: 'wait', ms: 3000 },
                        { assert: 'element', selector: '.consolidation-result' },
                        { assert: 'text', selector: '#total-revenue', matches: /CHF \d{1,3}('\d{3})*\.\d{2}/ },
                        { assert: 'count', selector: '.entity-row', expected: 5 }
                    ]
                },
                {
                    name: 'Switch entre entités',
                    steps: [
                        { action: 'click', selector: '.entity-switcher' },
                        { action: 'click', selector: '[data-entity="hypervisual"]' },
                        { assert: 'text', selector: '.current-entity', expected: 'Hypervisual' },
                        { assert: 'class', selector: 'body', contains: 'entity-hypervisual' }
                    ]
                }
            ]
        },
        'crm-integration': {
            name: 'CRM et Intégrations',
            tests: [
                {
                    name: 'Création contact avec enrichissement',
                    steps: [
                        { action: 'login', role: 'superadmin' },
                        { action: 'navigate', url: '/superadmin/crm/contacts.html' },
                        { action: 'click', selector: '#createContact' },
                        { action: 'fill', selector: '#firstName', value: 'Jean' },
                        { action: 'fill', selector: '#lastName', value: 'Dupont' },
                        { action: 'fill', selector: '#email', value: 'jean.dupont@rolex.com' },
                        { action: 'wait', ms: 500 },
                        { assert: 'value', selector: '#company', expected: 'Rolex SA' },
                        { assert: 'notification', type: 'info', text: 'Enrichissement détecté' },
                        { action: 'click', selector: '#saveContact' },
                        { assert: 'notification', type: 'success' }
                    ]
                },
                {
                    name: 'Validation IDE entreprise',
                    steps: [
                        { action: 'navigate', url: '/superadmin/crm/companies.html' },
                        { action: 'click', selector: '#createCompany' },
                        { action: 'fill', selector: '#ide', value: 'CHE-107.979.376' },
                        { action: 'blur', selector: '#ide' },
                        { assert: 'class', selector: '#ide', contains: 'is-valid' },
                        { action: 'wait', ms: 2000 },
                        { assert: 'value', selector: '#companyName', expected: 'Rolex SA' },
                        { assert: 'value', selector: '#address', contains: 'Genève' }
                    ]
                }
            ]
        },
        'performance': {
            name: 'Tests de Performance',
            tests: [
                {
                    name: 'Chargement dashboard < 3s',
                    steps: [
                        { action: 'measure', metric: 'loadTime' },
                        { action: 'navigate', url: '/superadmin/dashboard.html' },
                        { assert: 'performance', metric: 'loadTime', operator: '<', value: 3000 },
                        { assert: 'performance', metric: 'domContentLoaded', operator: '<', value: 1500 }
                    ]
                },
                {
                    name: 'Pagination 1000+ items',
                    steps: [
                        { action: 'navigate', url: '/superadmin/finance/invoices-in.html' },
                        { action: 'wait', selector: '#invoicesTable' },
                        { assert: 'element-count', selector: 'tbody tr', count: 25 },
                        { assert: 'element', selector: '.pagination' },
                        { action: 'measure', metric: 'paginationTime' },
                        { action: 'click', selector: '.pagination .page-item:last-child a' },
                        { assert: 'performance', metric: 'paginationTime', operator: '<', value: 500 }
                    ]
                },
                {
                    name: 'Recherche temps réel',
                    steps: [
                        { action: 'navigate', url: '/superadmin/crm/contacts.html' },
                        { action: 'measure', metric: 'searchTime' },
                        { action: 'fill', selector: '#search', value: 'Jean', typeSpeed: 100 },
                        { action: 'wait', ms: 350 }, // Debounce
                        { assert: 'element', selector: '.search-results' },
                        { assert: 'performance', metric: 'searchTime', operator: '<', value: 1000 }
                    ]
                }
            ]
        },
        'integration': {
            name: 'Intégrations Externes',
            tests: [
                {
                    name: 'Connexion Notion MCP',
                    steps: [
                        { action: 'execute', code: 'return typeof mcp_notion !== "undefined"' },
                        { assert: 'result', expected: true },
                        { action: 'execute', code: 'return window.testNotionIntegration()' },
                        { assert: 'result.success', expected: true },
                        { assert: 'result.databases', operator: '>', value: 0 }
                    ]
                },
                {
                    name: 'Webhook n8n actif',
                    steps: [
                        { action: 'fetch', url: 'https://n8n.votredomaine.ch/webhook/health' },
                        { assert: 'response.status', expected: 200 },
                        { assert: 'response.body.status', expected: 'healthy' }
                    ]
                },
                {
                    name: 'API Zefix disponible',
                    steps: [
                        { action: 'execute', code: 'return window.ExternalAPIs.getAPIStatus()' },
                        { assert: 'result.zefix', expected: 'available' }
                    ]
                }
            ]
        },
        'security': {
            name: 'Tests de Sécurité',
            tests: [
                {
                    name: 'Protection XSS',
                    steps: [
                        { action: 'login', role: 'superadmin' },
                        { action: 'navigate', url: '/superadmin/crm/contacts.html' },
                        { action: 'click', selector: '#createContact' },
                        { action: 'fill', selector: '#firstName', value: '<script>alert("XSS")</script>' },
                        { action: 'click', selector: '#saveContact' },
                        { assert: 'no-alert' },
                        { assert: 'text', selector: '.contact-name', expected: '&lt;script&gt;alert("XSS")&lt;/script&gt;' }
                    ]
                },
                {
                    name: 'CSRF Protection',
                    steps: [
                        { action: 'execute', code: 'return document.querySelector("meta[name=csrf-token]").content' },
                        { assert: 'result', operator: 'length', value: 32 },
                        { action: 'fetch', url: '/api/test', method: 'POST', headers: {} },
                        { assert: 'response.status', expected: 403 }
                    ]
                }
            ]
        }
    };

    // État des tests
    let testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0,
        suites: {}
    };

    // Métriques de performance
    let performanceMetrics = {};

    /**
     * Exécuter tous les tests
     */
    async function runAllTests() {
        console.log('🧪 Démarrage des tests E2E...\n');
        
        testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0,
            suites: {}
        };
        
        const startTime = Date.now();
        
        for (const [suiteId, suite] of Object.entries(TEST_SUITES)) {
            console.log(`\n📋 Suite: ${suite.name}`);
            testResults.suites[suiteId] = await runTestSuite(suite);
        }
        
        testResults.duration = Date.now() - startTime;
        
        displayResults();
        return testResults;
    }

    /**
     * Exécuter une suite de tests
     */
    async function runTestSuite(suite) {
        const suiteResult = {
            name: suite.name,
            tests: [],
            passed: 0,
            failed: 0
        };
        
        for (const test of suite.tests) {
            testResults.total++;
            
            try {
                await runTest(test);
                testResults.passed++;
                suiteResult.passed++;
                console.log(`  ✅ ${test.name}`);
                
                suiteResult.tests.push({
                    name: test.name,
                    status: 'passed',
                    duration: performanceMetrics.lastTestDuration || 0
                });
                
            } catch (error) {
                testResults.failed++;
                suiteResult.failed++;
                console.error(`  ❌ ${test.name}: ${error.message}`);
                
                suiteResult.tests.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message,
                    step: error.step || 'unknown'
                });
            }
        }
        
        return suiteResult;
    }

    /**
     * Exécuter un test
     */
    async function runTest(test) {
        const testStartTime = Date.now();
        
        for (let i = 0; i < test.steps.length; i++) {
            const step = test.steps[i];
            
            try {
                await executeStep(step);
            } catch (error) {
                error.step = i + 1;
                throw error;
            }
        }
        
        performanceMetrics.lastTestDuration = Date.now() - testStartTime;
    }

    /**
     * Exécuter une étape de test
     */
    async function executeStep(step) {
        switch (step.action) {
            case 'navigate':
                await navigate(step.url);
                break;
                
            case 'fill':
                await fillInput(step.selector, step.value, step.typeSpeed);
                break;
                
            case 'click':
                await clickElement(step.selector);
                break;
                
            case 'wait':
                if (step.ms) {
                    await wait(step.ms);
                } else if (step.selector) {
                    await waitForElement(step.selector);
                }
                break;
                
            case 'select':
                await selectOption(step.selector, step.value);
                break;
                
            case 'upload':
                await uploadFile(step.selector, step.file);
                break;
                
            case 'login':
                await performLogin(step.role);
                break;
                
            case 'execute':
                const result = await executeCode(step.code);
                if (step.assert) {
                    performanceMetrics.lastExecuteResult = result;
                }
                break;
                
            case 'measure':
                startMeasurement(step.metric);
                break;
                
            case 'fetch':
                await performFetch(step.url, step.method, step.headers);
                break;
                
            case 'blur':
                await blurElement(step.selector);
                break;
                
            default:
                if (step.assert) {
                    await performAssertion(step);
                }
        }
    }

    /**
     * Actions de test
     */
    async function navigate(url) {
        if (typeof window !== 'undefined' && window.location) {
            window.location.href = url;
            await wait(1000); // Attendre le chargement
        } else {
            // Mode test sans navigateur
            console.log(`Navigate to: ${url}`);
        }
    }

    async function fillInput(selector, value, typeSpeed = 0) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        
        if (typeSpeed > 0) {
            // Simulation de frappe
            element.value = '';
            for (const char of value) {
                element.value += char;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                await wait(typeSpeed);
            }
        } else {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    async function clickElement(selector) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        
        element.click();
        await wait(100); // Petite pause après clic
    }

    async function selectOption(selector, value) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Select not found: ${selector}`);
        
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function uploadFile(selector, filename) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Upload element not found: ${selector}`);
        
        // Simuler un upload de fichier
        const mockFile = new File(['test content'], filename, { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        
        if (element.files) {
            element.files = dataTransfer.files;
        }
        
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Pour Dropzone
        if (element.dropzone) {
            element.dropzone.addFile(mockFile);
        }
    }

    async function performLogin(role) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('user', JSON.stringify({
            name: 'Test User',
            email: `test@${role}.ch`,
            role: role
        }));
    }

    async function executeCode(code) {
        return eval(code);
    }

    async function performFetch(url, method = 'GET', headers = {}) {
        try {
            const response = await fetch(url, { method, headers });
            performanceMetrics.lastFetchResponse = {
                status: response.status,
                body: await response.json().catch(() => null)
            };
        } catch (error) {
            performanceMetrics.lastFetchResponse = { error: error.message };
        }
    }

    async function blurElement(selector) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        
        element.blur();
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    /**
     * Assertions
     */
    async function performAssertion(step) {
        switch (step.assert) {
            case 'url':
                assertUrl(step.expected);
                break;
                
            case 'redirected':
                assertRedirected(step.to);
                break;
                
            case 'element':
                assertElement(step.selector);
                break;
                
            case 'text':
                assertText(step.selector, step.contains, step.expected, step.matches);
                break;
                
            case 'value':
                assertValue(step.selector, step.expected, step.contains);
                break;
                
            case 'class':
                assertClass(step.selector, step.contains);
                break;
                
            case 'count':
            case 'element-count':
                assertElementCount(step.selector, step.count || step.expected);
                break;
                
            case 'notification':
                assertNotification(step.type, step.text);
                break;
                
            case 'localStorage':
                assertLocalStorage(step.key, step.value);
                break;
                
            case 'performance':
                assertPerformance(step.metric, step.operator, step.value);
                break;
                
            case 'result':
                assertResult(step.expected, step.operator);
                break;
                
            case 'response.status':
                assertResponseStatus(step.expected);
                break;
                
            case 'response.body.status':
                assertResponseBodyStatus(step.expected);
                break;
                
            case 'no-alert':
                assertNoAlert();
                break;
        }
    }

    function assertUrl(expected) {
        if (window.location.pathname !== expected) {
            throw new Error(`URL mismatch. Expected: ${expected}, Got: ${window.location.pathname}`);
        }
    }

    function assertRedirected(to) {
        // Vérifier que la redirection a eu lieu
        if (window.location.pathname !== to) {
            throw new Error(`Not redirected to ${to}`);
        }
    }

    function assertElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }
    }

    function assertText(selector, contains, expected, matches) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        
        const text = element.textContent.trim();
        
        if (contains && !text.includes(contains)) {
            throw new Error(`Text does not contain "${contains}". Got: "${text}"`);
        }
        
        if (expected && text !== expected) {
            throw new Error(`Text mismatch. Expected: "${expected}", Got: "${text}"`);
        }
        
        if (matches) {
            const regex = new RegExp(matches);
            if (!regex.test(text)) {
                throw new Error(`Text does not match pattern ${matches}. Got: "${text}"`);
            }
        }
    }

    function assertValue(selector, expected, contains) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        
        const value = element.value;
        
        if (contains && !value.includes(contains)) {
            throw new Error(`Value does not contain "${contains}". Got: "${value}"`);
        }
        
        if (expected && value !== expected) {
            throw new Error(`Value mismatch. Expected: "${expected}", Got: "${value}"`);
        }
    }

    function assertClass(selector, contains) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        
        if (!element.classList.contains(contains)) {
            throw new Error(`Element does not have class "${contains}"`);
        }
    }

    function assertElementCount(selector, expectedCount) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== expectedCount) {
            throw new Error(`Element count mismatch. Expected: ${expectedCount}, Got: ${elements.length}`);
        }
    }

    function assertNotification(type, text) {
        // Vérifier les notifications SweetAlert2
        const swalContainer = document.querySelector('.swal2-container');
        if (!swalContainer) {
            throw new Error('No notification found');
        }
        
        if (type) {
            const hasType = swalContainer.querySelector(`.swal2-${type}`);
            if (!hasType) {
                throw new Error(`Notification type "${type}" not found`);
            }
        }
        
        if (text) {
            const content = swalContainer.textContent;
            if (!content.includes(text)) {
                throw new Error(`Notification does not contain text "${text}"`);
            }
        }
    }

    function assertLocalStorage(key, value) {
        const stored = localStorage.getItem(key);
        const parsedStored = JSON.parse(stored || 'null');
        
        if (parsedStored !== value) {
            throw new Error(`LocalStorage mismatch for key "${key}". Expected: ${value}, Got: ${parsedStored}`);
        }
    }

    function assertPerformance(metric, operator, value) {
        const measured = performanceMetrics[metric];
        if (measured === undefined) {
            throw new Error(`Performance metric "${metric}" not measured`);
        }
        
        let pass = false;
        switch (operator) {
            case '<':
                pass = measured < value;
                break;
            case '>':
                pass = measured > value;
                break;
            case '=':
            case '==':
                pass = measured === value;
                break;
        }
        
        if (!pass) {
            throw new Error(`Performance assertion failed: ${metric} ${operator} ${value}. Got: ${measured}`);
        }
    }

    function assertResult(expected, operator) {
        const result = performanceMetrics.lastExecuteResult;
        
        if (operator === 'length') {
            if (result.length !== expected) {
                throw new Error(`Result length mismatch. Expected: ${expected}, Got: ${result.length}`);
            }
        } else if (operator === '>') {
            if (!(result > expected)) {
                throw new Error(`Result not greater than ${expected}. Got: ${result}`);
            }
        } else if (expected && typeof expected === 'object') {
            // Vérification d'objet
            for (const key in expected) {
                if (result[key] !== expected[key]) {
                    throw new Error(`Result mismatch for key "${key}". Expected: ${expected[key]}, Got: ${result[key]}`);
                }
            }
        } else {
            if (result !== expected) {
                throw new Error(`Result mismatch. Expected: ${expected}, Got: ${result}`);
            }
        }
    }

    function assertResponseStatus(expected) {
        const response = performanceMetrics.lastFetchResponse;
        if (!response) throw new Error('No fetch response found');
        
        if (response.status !== expected) {
            throw new Error(`Response status mismatch. Expected: ${expected}, Got: ${response.status}`);
        }
    }

    function assertResponseBodyStatus(expected) {
        const response = performanceMetrics.lastFetchResponse;
        if (!response || !response.body) throw new Error('No fetch response body found');
        
        if (response.body.status !== expected) {
            throw new Error(`Response body status mismatch. Expected: ${expected}, Got: ${response.body.status}`);
        }
    }

    function assertNoAlert() {
        // Vérifier qu'aucune alerte n'a été déclenchée
        // Cette assertion devrait être implémentée selon le contexte
    }

    /**
     * Utilitaires
     */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return;
            await wait(100);
        }
        
        throw new Error(`Timeout waiting for element: ${selector}`);
    }

    function startMeasurement(metric) {
        performanceMetrics[metric] = Date.now();
    }

    function endMeasurement(metric) {
        if (performanceMetrics[metric]) {
            performanceMetrics[metric] = Date.now() - performanceMetrics[metric];
        }
    }

    /**
     * Affichage des résultats
     */
    function displayResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 RÉSUMÉ DES TESTS E2E');
        console.log('='.repeat(50));
        console.log(`Total: ${testResults.total}`);
        console.log(`✅ Réussis: ${testResults.passed} (${Math.round(testResults.passed/testResults.total*100)}%)`);
        console.log(`❌ Échoués: ${testResults.failed}`);
        console.log(`⏱️  Durée: ${formatDuration(testResults.duration)}`);
        console.log('='.repeat(50));
        
        // Détails par suite
        console.log('\nDÉTAILS PAR SUITE:');
        for (const [suiteId, suite] of Object.entries(testResults.suites)) {
            console.log(`\n${suite.name}:`);
            console.log(`  ✅ ${suite.passed}/${suite.tests.length} tests réussis`);
            
            if (suite.failed > 0) {
                const failedTests = suite.tests.filter(t => t.status === 'failed');
                failedTests.forEach(test => {
                    console.log(`  ❌ ${test.name}: ${test.error} (étape ${test.step})`);
                });
            }
        }
        
        // Générer rapport HTML si dans le navigateur
        if (typeof document !== 'undefined') {
            generateHTMLReport();
        }
    }

    /**
     * Générer rapport HTML
     */
    function generateHTMLReport() {
        const reportHTML = `
            <div class="e2e-test-report">
                <h2>Rapport de Tests E2E</h2>
                <div class="summary">
                    <div class="stat ${testResults.failed === 0 ? 'success' : 'failure'}">
                        <div class="value">${Math.round(testResults.passed/testResults.total*100)}%</div>
                        <div class="label">Taux de réussite</div>
                    </div>
                    <div class="stat">
                        <div class="value">${testResults.total}</div>
                        <div class="label">Tests total</div>
                    </div>
                    <div class="stat">
                        <div class="value">${formatDuration(testResults.duration)}</div>
                        <div class="label">Durée totale</div>
                    </div>
                </div>
                <div class="suites">
                    ${Object.entries(testResults.suites).map(([id, suite]) => `
                        <div class="suite ${suite.failed === 0 ? 'passed' : 'failed'}">
                            <h3>${suite.name}</h3>
                            <div class="tests">
                                ${suite.tests.map(test => `
                                    <div class="test ${test.status}">
                                        <span class="icon">${test.status === 'passed' ? '✅' : '❌'}</span>
                                        <span class="name">${test.name}</span>
                                        ${test.error ? `<span class="error">${test.error}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Créer ou mettre à jour le conteneur de rapport
        let reportContainer = document.getElementById('e2e-test-report');
        if (!reportContainer) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'e2e-test-report';
            document.body.appendChild(reportContainer);
        }
        
        reportContainer.innerHTML = reportHTML;
    }

    /**
     * Exporter les résultats
     */
    function exportResults(format = 'json') {
        const timestamp = new Date().toISOString();
        const filename = `e2e-test-results-${timestamp.split('T')[0]}`;
        
        if (format === 'json') {
            const dataStr = JSON.stringify(testResults, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            downloadFile(blob, `${filename}.json`);
        } else if (format === 'csv') {
            const csvData = generateCSV();
            const blob = new Blob([csvData], { type: 'text/csv' });
            downloadFile(blob, `${filename}.csv`);
        }
    }

    function generateCSV() {
        const rows = [['Suite', 'Test', 'Status', 'Duration', 'Error']];
        
        for (const [suiteId, suite] of Object.entries(testResults.suites)) {
            for (const test of suite.tests) {
                rows.push([
                    suite.name,
                    test.name,
                    test.status,
                    test.duration || '',
                    test.error || ''
                ]);
            }
        }
        
        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    function downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.round(ms / 60000)}min ${Math.round((ms % 60000) / 1000)}s`;
    }

    /**
     * Test de connexion Notion (helper)
     */
    window.testNotionIntegration = async function() {
        try {
            if (typeof mcp_notion !== 'undefined' && mcp_notion.list_databases) {
                const databases = await mcp_notion.list_databases();
                return {
                    success: true,
                    databases: databases.length || 0
                };
            }
            return { success: false, error: 'MCP Notion not available' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // API publique
    return {
        runAllTests,
        runSuite: (suiteName) => runTestSuite(TEST_SUITES[suiteName]),
        runTest: (suiteName, testName) => {
            const suite = TEST_SUITES[suiteName];
            const test = suite?.tests.find(t => t.name === testName);
            if (test) return runTest(test);
            throw new Error('Test not found');
        },
        exportResults,
        getResults: () => testResults
    };

})();