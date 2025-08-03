// revolut-connector.js - Module d'intégration Revolut Business
// Gestion multi-comptes, sync transactions, rapprochement automatique

window.RevolutConnector = (function() {
    'use strict';
    
    // Configuration
    const config = {
        // Comptes par entité
        accounts: {
            hypervisual: {
                account_id: "acc_hypervisual_01",
                entity: "Hypervisual Sàrl",
                account_name: "Hypervisual CHF",
                currency: "CHF",
                iban: "GB29 REVO 0099 7077 3901 01",
                swift: "REVOGB21",
                last_4: "4242",
                color: "#e41e26"
            },
            dainamics: {
                account_id: "acc_dainamics_01",
                entity: "Dainamics SA",
                account_name: "Dainamics CHF",
                currency: "CHF",
                iban: "GB29 REVO 0099 7077 3901 02",
                swift: "REVOGB21",
                last_4: "7891",
                color: "#f39c12"
            },
            waveform: {
                account_id: "acc_waveform_01",
                entity: "Waveform Studio Sàrl",
                account_name: "Waveform CHF",
                currency: "CHF",
                iban: "GB29 REVO 0099 7077 3901 03",
                swift: "REVOGB21",
                last_4: "3456",
                color: "#00bcd4"
            },
            particule: {
                account_id: "acc_particule_01",
                entity: "Particule Lab Sàrl",
                account_name: "Particule CHF",
                currency: "CHF",
                iban: "GB29 REVO 0099 7077 3901 04",
                swift: "REVOGB21",
                last_4: "9012",
                color: "#9b59b6"
            },
            holding: {
                account_id: "acc_holding_01",
                entity: "Swiss Digital Holding SA",
                account_name: "Holding CHF",
                currency: "CHF",
                iban: "GB29 REVO 0099 7077 3901 05",
                swift: "REVOGB21",
                last_4: "5678",
                color: "#34495e"
            }
        },
        
        // Catégories de transactions
        categories: {
            // Revenus
            "Revenus clients": {
                type: "credit",
                icon: "💰",
                subcategories: ["Production vidéo", "Site web", "App mobile", "Consulting", "Formation"]
            },
            "Remboursements": {
                type: "credit",
                icon: "🔄",
                subcategories: ["TVA", "Fournisseurs", "Assurances", "Autres"]
            },
            "Virements internes": {
                type: "both",
                icon: "🔁",
                subcategories: ["Entre entités", "Avances", "Prêts"]
            },
            
            // Dépenses
            "Salaires": {
                type: "debit",
                icon: "👥",
                subcategories: ["Salaires nets", "Charges sociales", "LPP", "LAA"]
            },
            "Fournisseurs": {
                type: "debit",
                icon: "📦",
                subcategories: ["Freelances", "Licences", "Matériel", "Services"]
            },
            "Frais généraux": {
                type: "debit",
                icon: "🏢",
                subcategories: ["Loyer", "Électricité", "Internet", "Téléphone", "Assurances"]
            },
            "Taxes": {
                type: "debit",
                icon: "🏦",
                subcategories: ["TVA", "Impôts", "Taxes communales"]
            }
        },
        
        // Règles de matching pour rapprochement
        matchingRules: {
            exact: {
                priority: 1,
                confidence: 1.0,
                rules: [
                    { field: "reference", match: "exact" },
                    { field: "amount", match: "exact" },
                    { field: "date", tolerance: 0 }
                ]
            },
            strong: {
                priority: 2,
                confidence: 0.9,
                rules: [
                    { field: "amount", tolerance: 0.01 },
                    { field: "date", tolerance: 3 },
                    { field: "name", similarity: 0.8 }
                ]
            },
            probable: {
                priority: 3,
                confidence: 0.7,
                rules: [
                    { field: "amount", tolerance: 0.1 },
                    { field: "pattern", recurring: true }
                ]
            },
            weak: {
                priority: 4,
                confidence: 0.5,
                rules: [
                    { field: "historical", pattern: true }
                ]
            }
        },
        
        // Seuils d'alertes
        alerts: {
            lowBalance: 100000,      // CHF
            unusualAmount: 50000,    // CHF
            duplicateWindow: 7,      // jours
            vatPaymentDays: [25, 26, 27] // Jours du mois
        },
        
        // Configuration API
        api: {
            baseUrl: "https://api.revolut.com/api/1.0",
            timeout: 30000,
            retryAttempts: 3
        }
    };
    
    // État du module
    let state = {
        accounts: {},
        transactions: [],
        reconciliations: [],
        alerts: [],
        selectedEntity: 'all',
        syncInProgress: false,
        lastSync: null,
        forecastData: null,
        cards: [],
        currentUser: null
    };
    
    // Initialisation
    async function init() {
        try {
            console.log('🏦 Initialisation Revolut Connector...');
            
            // Vérifier permissions
            if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.banking')) {
                throw new Error('Permissions insuffisantes');
            }
            
            // Récupérer utilisateur actuel
            state.currentUser = window.AuthSuperadmin.getCurrentUser();
            
            // Charger les données
            await loadAccountsData();
            await loadTransactions();
            await loadCards();
            
            // Initialiser l'interface
            initializeInterface();
            attachEventListeners();
            setupAutoSync();
            
            // Lancer première sync
            await syncNow();
            
            console.log('✅ Revolut Connector initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation Revolut:', error);
            showNotification('Erreur lors du chargement des comptes bancaires', 'error');
        }
    }
    
    // Charger données des comptes
    async function loadAccountsData() {
        try {
            // Données de démonstration - En production: const response = await fetch('/api/revolut/accounts');
            state.accounts = {
                hypervisual: {
                    ...config.accounts.hypervisual,
                    balance: {
                        current: 320000.00,
                        available: 318500.00,
                        pending_in: 25000.00,
                        pending_out: 26500.00
                    },
                    monthly_stats: {
                        total_in: 185000.00,
                        total_out: 142000.00,
                        net_flow: 43000.00,
                        growth_percent: 15.2
                    }
                },
                dainamics: {
                    ...config.accounts.dainamics,
                    balance: {
                        current: 235000.00,
                        available: 234000.00,
                        pending_in: 15000.00,
                        pending_out: 16000.00
                    },
                    monthly_stats: {
                        total_in: 125000.00,
                        total_out: 98000.00,
                        net_flow: 27000.00,
                        growth_percent: 8.1
                    }
                },
                waveform: {
                    ...config.accounts.waveform,
                    balance: {
                        current: 187000.00,
                        available: 186500.00,
                        pending_in: 8000.00,
                        pending_out: 8500.00
                    },
                    monthly_stats: {
                        total_in: 95000.00,
                        total_out: 73000.00,
                        net_flow: 22000.00,
                        growth_percent: 12.3
                    }
                },
                particule: {
                    ...config.accounts.particule,
                    balance: {
                        current: 98000.00,
                        available: 97500.00,
                        pending_in: 5000.00,
                        pending_out: 5500.00
                    },
                    monthly_stats: {
                        total_in: 45000.00,
                        total_out: 48000.00,
                        net_flow: -3000.00,
                        growth_percent: -5.2
                    }
                },
                holding: {
                    ...config.accounts.holding,
                    balance: {
                        current: 52000.00,
                        available: 52000.00,
                        pending_in: 0,
                        pending_out: 0
                    },
                    monthly_stats: {
                        total_in: 10000.00,
                        total_out: 8000.00,
                        net_flow: 2000.00,
                        growth_percent: 3.8
                    }
                }
            };
            
            console.log(`💳 ${Object.keys(state.accounts).length} comptes chargés`);
            
        } catch (error) {
            console.error('❌ Erreur chargement comptes:', error);
            throw error;
        }
    }
    
    // Charger transactions
    async function loadTransactions() {
        try {
            // Données de démonstration
            state.transactions = [
                {
                    transaction_id: "txn_20250120_001",
                    account_id: "acc_hypervisual_01",
                    type: "credit",
                    amount: 13462.00,
                    currency: "CHF",
                    created_at: "2025-01-20T10:30:00Z",
                    completed_at: "2025-01-20T10:31:00Z",
                    counterparty: {
                        name: "Rolex SA",
                        account_number: "CH58 0079 1123 0008 8901 2",
                        bank: "UBS Switzerland AG"
                    },
                    reference: "Facture vidéo janvier",
                    description: "Paiement facture HYP-2025-0042",
                    category: "Revenus clients",
                    subcategory: "Production vidéo",
                    reconciliation: {
                        status: "matched",
                        invoice_id: "HYP-2025-0042",
                        confidence: 0.98,
                        matched_at: "2025-01-20T10:35:00Z",
                        method: "auto"
                    },
                    merchant_category: "5912",
                    location: { city: "Genève", country: "CH" }
                },
                {
                    transaction_id: "txn_20250120_002",
                    account_id: "acc_hypervisual_01",
                    type: "debit",
                    amount: 1077.25,
                    currency: "CHF",
                    created_at: "2025-01-20T09:15:00Z",
                    completed_at: "2025-01-20T09:15:00Z",
                    counterparty: {
                        name: "Swisscom SA",
                        account_number: "CH93 0076 2011 6238 5295 7",
                        bank: "PostFinance"
                    },
                    reference: "Facture télécom janvier",
                    description: "Internet fibre + mobile",
                    category: "Frais généraux",
                    subcategory: "Internet",
                    reconciliation: {
                        status: "suggested",
                        invoice_id: null,
                        confidence: 0.7,
                        matched_at: null,
                        method: null
                    }
                },
                {
                    transaction_id: "txn_20250119_001",
                    account_id: "acc_dainamics_01",
                    type: "credit",
                    amount: 8900.00,
                    currency: "CHF",
                    created_at: "2025-01-19T14:20:00Z",
                    completed_at: "2025-01-19T14:21:00Z",
                    counterparty: {
                        name: "Nestlé SA",
                        account_number: "CH31 8123 9000 0012 4568 9",
                        bank: "Credit Suisse"
                    },
                    reference: "Acompte projet app",
                    description: "Acompte 50% développement app",
                    category: "Revenus clients",
                    subcategory: "App mobile",
                    reconciliation: {
                        status: "unmatched",
                        invoice_id: null,
                        confidence: 0,
                        matched_at: null,
                        method: null
                    }
                },
                {
                    transaction_id: "txn_20250119_002",
                    account_id: "acc_waveform_01",
                    type: "debit",
                    amount: 15000.00,
                    currency: "CHF",
                    created_at: "2025-01-19T11:00:00Z",
                    completed_at: "2025-01-19T11:00:00Z",
                    counterparty: {
                        name: "Jean Dupont - Freelance",
                        account_number: "CH48 0483 5012 3456 7100 0",
                        bank: "Raiffeisen"
                    },
                    reference: "Honoraires production janvier",
                    description: "Production vidéo projet X",
                    category: "Fournisseurs",
                    subcategory: "Freelances",
                    reconciliation: {
                        status: "matched",
                        invoice_id: "SUP-2025-0156",
                        confidence: 0.95,
                        matched_at: "2025-01-19T11:30:00Z",
                        method: "auto"
                    }
                },
                {
                    transaction_id: "txn_20250118_001",
                    account_id: "acc_particule_01",
                    type: "debit",
                    amount: 3500.00,
                    currency: "CHF",
                    created_at: "2025-01-18T16:45:00Z",
                    completed_at: "2025-01-18T16:45:00Z",
                    counterparty: {
                        name: "Régie Immobilière Genève",
                        account_number: "CH62 0070 0115 2018 9100 2",
                        bank: "ZKB"
                    },
                    reference: "Loyer janvier bureau",
                    description: "Loyer + charges",
                    category: "Frais généraux",
                    subcategory: "Loyer",
                    reconciliation: {
                        status: "matched",
                        invoice_id: "AUTO-RENT-01",
                        confidence: 1.0,
                        matched_at: "2025-01-18T17:00:00Z",
                        method: "pattern"
                    }
                },
                {
                    transaction_id: "txn_20250117_001",
                    account_id: "acc_hypervisual_01",
                    type: "debit",
                    amount: 25000.00,
                    currency: "CHF",
                    created_at: "2025-01-17T10:00:00Z",
                    completed_at: "2025-01-17T10:01:00Z",
                    counterparty: {
                        name: "Dainamics SA",
                        account_number: "GB29 REVO 0099 7077 3901 02",
                        bank: "Revolut"
                    },
                    reference: "Prêt inter-entités",
                    description: "Avance trésorerie temporaire",
                    category: "Virements internes",
                    subcategory: "Entre entités",
                    reconciliation: {
                        status: "matched",
                        invoice_id: "INTERNAL-001",
                        confidence: 1.0,
                        matched_at: "2025-01-17T10:02:00Z",
                        method: "internal"
                    }
                }
            ];
            
            console.log(`💸 ${state.transactions.length} transactions chargées`);
            
        } catch (error) {
            console.error('❌ Erreur chargement transactions:', error);
            throw error;
        }
    }
    
    // Charger cartes
    async function loadCards() {
        try {
            state.cards = [
                {
                    card_id: "card_001",
                    account_id: "acc_hypervisual_01",
                    last_4: "4242",
                    holder: "Marie Dubois",
                    department: "Commercial",
                    spending_limit: 5000.00,
                    spent_this_month: 1845.00,
                    status: "active"
                },
                {
                    card_id: "card_002",
                    account_id: "acc_dainamics_01",
                    last_4: "7891",
                    holder: "Paul Martin",
                    department: "Direction",
                    spending_limit: 10000.00,
                    spent_this_month: 3250.00,
                    status: "active"
                },
                {
                    card_id: "card_003",
                    account_id: "acc_waveform_01",
                    last_4: "3456",
                    holder: "Sophie Bernard",
                    department: "Production",
                    spending_limit: 3000.00,
                    spent_this_month: 890.00,
                    status: "active"
                }
            ];
            
            console.log(`💳 ${state.cards.length} cartes chargées`);
            
        } catch (error) {
            console.error('❌ Erreur chargement cartes:', error);
        }
    }
    
    // Initialiser l'interface
    function initializeInterface() {
        updateAccountsDisplay();
        updateCashFlowWidget();
        renderTransactionsList();
        generateForecastChart();
        checkAlerts();
    }
    
    // Attacher les événements
    function attachEventListeners() {
        // Sync
        document.getElementById('sync-now')?.addEventListener('click', syncNow);
        
        // Actions rapides
        document.getElementById('new-payment')?.addEventListener('click', openNewPayment);
        document.getElementById('batch-payments')?.addEventListener('click', openBatchPayments);
        document.getElementById('reconciliation')?.addEventListener('click', openReconciliation);
        document.getElementById('export-data')?.addEventListener('click', exportFEC);
        
        // Filtres entité
        document.querySelectorAll('.entity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                filterByEntity(this.dataset.entity);
            });
        });
        
        // Cartes de compte
        document.querySelectorAll('.account-card').forEach(card => {
            card.addEventListener('click', function() {
                viewAccountDetails(this.dataset.entity);
            });
        });
        
        // Modal paiement
        document.getElementById('execute-payment')?.addEventListener('click', executePayment);
    }
    
    // Configuration auto-sync
    function setupAutoSync() {
        // Sync toutes les 5 minutes
        setInterval(async () => {
            if (!state.syncInProgress) {
                await syncNow(true);
            }
        }, 5 * 60 * 1000);
    }
    
    // Synchroniser maintenant
    async function syncNow(silent = false) {
        if (state.syncInProgress) return;
        
        try {
            state.syncInProgress = true;
            updateSyncStatus('syncing');
            
            if (!silent) {
                showNotification('Synchronisation en cours...', 'info');
            }
            
            // Simuler appel API Revolut
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Recharger les données
            await loadAccountsData();
            await loadTransactions();
            
            // Rapprochement automatique
            await performAutoReconciliation();
            
            // Mettre à jour l'interface
            updateAccountsDisplay();
            updateCashFlowWidget();
            renderTransactionsList();
            checkAlerts();
            
            state.lastSync = new Date();
            updateSyncStatus('completed');
            
            if (!silent) {
                showNotification('Synchronisation terminée', 'success');
            }
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('BANKING_SYNC', {
                accountsCount: Object.keys(state.accounts).length,
                transactionsCount: state.transactions.length
            });
            
        } catch (error) {
            console.error('❌ Erreur sync:', error);
            updateSyncStatus('error');
            if (!silent) {
                showNotification('Erreur lors de la synchronisation', 'error');
            }
        } finally {
            state.syncInProgress = false;
        }
    }
    
    // Mettre à jour statut sync
    function updateSyncStatus(status) {
        const indicator = document.getElementById('sync-status');
        const text = document.getElementById('sync-text');
        
        if (!indicator || !text) return;
        
        switch (status) {
            case 'syncing':
                indicator.classList.add('syncing');
                text.textContent = 'Synchronisation...';
                break;
            case 'completed':
                indicator.classList.remove('syncing');
                text.textContent = `Dernière sync: ${formatTimeAgo(state.lastSync)}`;
                break;
            case 'error':
                indicator.classList.remove('syncing');
                text.textContent = 'Erreur de synchronisation';
                break;
        }
    }
    
    // Mettre à jour affichage comptes
    function updateAccountsDisplay() {
        Object.entries(state.accounts).forEach(([entity, account]) => {
            // Solde
            const balanceEl = document.getElementById(`balance-${entity}`);
            if (balanceEl) {
                balanceEl.textContent = `CHF ${formatSwissAmount(account.balance.current)}`;
            }
            
            // En attente
            const pendingEl = document.getElementById(`pending-${entity}`);
            if (pendingEl) {
                const totalPending = account.balance.pending_in - account.balance.pending_out;
                const sign = totalPending >= 0 ? '+' : '';
                pendingEl.textContent = `${sign}${formatSwissAmount(totalPending)} CHF en attente`;
            }
            
            // Tendance
            const trendEl = document.querySelector(`[data-entity="${entity}"] .account-trend`);
            if (trendEl) {
                const isPositive = account.monthly_stats.growth_percent >= 0;
                trendEl.className = `account-trend trend-${isPositive ? 'up' : 'down'}`;
                trendEl.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        ${isPositive ? 
                            '<path d="M3 17l6 -6l4 4l8 -8" /><path d="M14 7l7 0l0 7" />' :
                            '<path d="M3 7l6 6l4 -4l8 8" /><path d="M21 17l0 -7l-7 0" />'
                        }
                    </svg>
                    ${isPositive ? '+' : ''}${account.monthly_stats.growth_percent.toFixed(1)}%
                `;
            }
        });
    }
    
    // Mettre à jour widget cash flow
    function updateCashFlowWidget() {
        let totalBalance = 0;
        let totalIn = 0;
        let totalOut = 0;
        
        Object.values(state.accounts).forEach(account => {
            totalBalance += account.balance.current;
            totalIn += account.monthly_stats.total_in;
            totalOut += account.monthly_stats.total_out;
        });
        
        const netFlow = totalIn - totalOut;
        
        document.getElementById('total-balance').textContent = `CHF ${formatSwissAmount(totalBalance)}`;
        document.getElementById('total-in').textContent = `CHF ${formatSwissAmount(totalIn)}`;
        document.getElementById('total-out').textContent = `CHF ${formatSwissAmount(totalOut)}`;
        document.getElementById('net-flow').textContent = `${netFlow >= 0 ? '+' : ''}CHF ${formatSwissAmount(netFlow)}`;
    }
    
    // Rendre liste transactions
    function renderTransactionsList() {
        const container = document.getElementById('transactions-list');
        if (!container) return;
        
        let filteredTransactions = state.transactions;
        
        // Filtrer par entité si sélectionnée
        if (state.selectedEntity !== 'all') {
            const accountId = state.accounts[state.selectedEntity]?.account_id;
            filteredTransactions = filteredTransactions.filter(t => t.account_id === accountId);
        }
        
        // Trier par date
        filteredTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        const html = filteredTransactions.map(transaction => renderTransactionRow(transaction)).join('');
        container.innerHTML = html || '<p class="text-muted text-center py-4">Aucune transaction</p>';
    }
    
    // Rendre ligne transaction
    function renderTransactionRow(transaction) {
        const isCredit = transaction.type === 'credit';
        const account = Object.values(state.accounts).find(a => a.account_id === transaction.account_id);
        
        return `
            <div class="transaction-row" data-transaction-id="${transaction.transaction_id}">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-fill">
                        <div class="d-flex align-items-center gap-3">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon ${isCredit ? 'text-success' : 'text-danger'}" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    ${isCredit ? 
                                        '<path d="M12 5l0 14" /><path d="M5 12l14 0" />' :
                                        '<path d="M5 12l14 0" />'
                                    }
                                </svg>
                            </div>
                            <div>
                                <div class="fw-bold">${transaction.counterparty.name}</div>
                                <div class="text-muted small">
                                    ${transaction.description} • ${formatDateTime(transaction.created_at)}
                                    ${account ? ` • ${account.entity}` : ''}
                                </div>
                                ${renderReconciliationBadge(transaction.reconciliation)}
                            </div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="transaction-amount ${isCredit ? 'amount-credit' : 'amount-debit'}">
                            ${isCredit ? '+' : '-'}${formatSwissAmount(transaction.amount)} ${transaction.currency}
                        </div>
                        <div class="text-muted small">${transaction.reference || 'Sans référence'}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Rendre badge rapprochement
    function renderReconciliationBadge(reconciliation) {
        if (!reconciliation) return '';
        
        const statusConfig = {
            matched: { class: 'reconciled', icon: '✓', text: 'Rapproché' },
            suggested: { class: 'suggested', icon: '🔄', text: 'Suggestion' },
            unmatched: { class: 'unmatched', icon: '⚠️', text: 'Non rapproché' }
        };
        
        const config = statusConfig[reconciliation.status] || statusConfig.unmatched;
        
        return `
            <div class="mt-1">
                <span class="reconciliation-badge ${config.class}">
                    ${config.icon} ${config.text}
                    ${reconciliation.invoice_id ? ` • ${reconciliation.invoice_id}` : ''}
                    ${reconciliation.confidence ? ` (${Math.round(reconciliation.confidence * 100)}%)` : ''}
                </span>
            </div>
        `;
    }
    
    // Rapprochement automatique
    async function performAutoReconciliation() {
        try {
            console.log('🔍 Démarrage rapprochement automatique...');
            
            // Récupérer factures non rapprochées
            const pendingInvoices = await getPendingInvoices();
            
            let matchedCount = 0;
            
            // Pour chaque transaction non rapprochée
            state.transactions.forEach(transaction => {
                if (transaction.reconciliation.status !== 'matched') {
                    const match = findBestMatch(transaction, pendingInvoices);
                    
                    if (match && match.confidence >= 0.7) {
                        transaction.reconciliation = {
                            status: 'matched',
                            invoice_id: match.invoice_id,
                            confidence: match.confidence,
                            matched_at: new Date().toISOString(),
                            method: 'auto'
                        };
                        matchedCount++;
                    } else if (match && match.confidence >= 0.5) {
                        transaction.reconciliation.status = 'suggested';
                        transaction.reconciliation.confidence = match.confidence;
                    }
                }
            });
            
            console.log(`✅ Rapprochement terminé: ${matchedCount} correspondances`);
            
        } catch (error) {
            console.error('❌ Erreur rapprochement:', error);
        }
    }
    
    // Récupérer factures en attente
    async function getPendingInvoices() {
        // Simulation - En production: appel API pour récupérer factures
        return [
            {
                invoice_id: "HYP-2025-0042",
                amount: 13462.00,
                client: "Rolex SA",
                date: "2025-01-20",
                reference: "Facture vidéo janvier"
            },
            {
                invoice_id: "DAI-2025-0018",
                amount: 8900.00,
                client: "Nestlé SA",
                date: "2025-01-19",
                reference: "Acompte app mobile"
            }
        ];
    }
    
    // Trouver meilleure correspondance
    function findBestMatch(transaction, invoices) {
        let bestMatch = null;
        let bestScore = 0;
        
        invoices.forEach(invoice => {
            let score = 0;
            
            // Correspondance montant
            const amountDiff = Math.abs(transaction.amount - invoice.amount);
            if (amountDiff < 0.01) {
                score += 0.4; // Exact
            } else if (amountDiff < invoice.amount * 0.01) {
                score += 0.3; // 1% tolérance
            } else if (amountDiff < invoice.amount * 0.1) {
                score += 0.1; // 10% tolérance
            }
            
            // Correspondance nom
            const nameSimilarity = calculateSimilarity(
                transaction.counterparty.name.toLowerCase(),
                invoice.client.toLowerCase()
            );
            score += nameSimilarity * 0.3;
            
            // Correspondance date (3 jours tolérance)
            const transDate = new Date(transaction.created_at);
            const invDate = new Date(invoice.date);
            const daysDiff = Math.abs((transDate - invDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 3) {
                score += 0.2;
            }
            
            // Correspondance référence
            if (transaction.reference && invoice.reference) {
                const refSimilarity = calculateSimilarity(
                    transaction.reference.toLowerCase(),
                    invoice.reference.toLowerCase()
                );
                score += refSimilarity * 0.1;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = {
                    invoice_id: invoice.invoice_id,
                    confidence: score
                };
            }
        });
        
        return bestMatch;
    }
    
    // Calculer similarité chaînes (Levenshtein simplifié)
    function calculateSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = getEditDistance(longer, shorter);
        return (longer.length - editDistance) / parseFloat(longer.length);
    }
    
    // Distance d'édition
    function getEditDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    // Vérifier alertes
    function checkAlerts() {
        state.alerts = [];
        
        // Vérifier soldes bas
        Object.entries(state.accounts).forEach(([entity, account]) => {
            if (account.balance.current < config.alerts.lowBalance) {
                state.alerts.push({
                    type: 'critical',
                    message: `Solde ${account.entity} < ${formatSwissAmount(config.alerts.lowBalance)} CHF`,
                    entity: entity
                });
            }
        });
        
        // Vérifier paiements inhabituels
        state.transactions.forEach(transaction => {
            if (transaction.type === 'debit' && transaction.amount > config.alerts.unusualAmount) {
                state.alerts.push({
                    type: 'warning',
                    message: `Paiement inhabituel: ${formatSwissAmount(transaction.amount)} CHF à ${transaction.counterparty.name}`,
                    transaction_id: transaction.transaction_id
                });
            }
        });
        
        // Afficher alertes
        displayAlerts();
    }
    
    // Afficher alertes
    function displayAlerts() {
        const container = document.getElementById('alerts-container');
        if (!container) return;
        
        if (state.alerts.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const html = state.alerts.map(alert => `
            <div class="alert-widget ${alert.type === 'critical' ? 'critical' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 9v4" />
                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                    <path d="M12 16h.01" />
                </svg>
                <div>${alert.message}</div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    // Générer graphique prévisions
    function generateForecastChart() {
        const chartEl = document.getElementById('forecast-chart');
        if (!chartEl || typeof ApexCharts === 'undefined') return;
        
        // Données prévisionnelles
        const dates = [];
        const forecast = [];
        const today = new Date();
        let balance = Object.values(state.accounts).reduce((sum, acc) => sum + acc.balance.current, 0);
        
        for (let i = 0; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toLocaleDateString('fr-CH'));
            
            // Simulation flux prévisionnels
            const dailyIn = Math.random() * 10000 + 5000;
            const dailyOut = Math.random() * 8000 + 4000;
            balance += dailyIn - dailyOut;
            
            forecast.push(Math.round(balance));
        }
        
        const options = {
            series: [{
                name: 'Solde prévisionnel',
                data: forecast
            }],
            chart: {
                type: 'area',
                height: 200,
                toolbar: { show: false },
                sparkline: { enabled: true }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3
                }
            },
            colors: ['#0054a6'],
            tooltip: {
                y: {
                    formatter: function(val) {
                        return 'CHF ' + formatSwissAmount(val);
                    }
                }
            }
        };
        
        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }
    
    // Filtrer par entité
    function filterByEntity(entity) {
        state.selectedEntity = entity;
        
        // Mettre à jour boutons
        document.querySelectorAll('.entity-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.entity === entity);
        });
        
        // Rafraîchir transactions
        renderTransactionsList();
    }
    
    // Ouvrir nouveau paiement
    function openNewPayment() {
        const modal = document.getElementById('newPaymentModal');
        if (!modal) return;
        
        new bootstrap.Modal(modal).show();
    }
    
    // Exécuter paiement
    async function executePayment() {
        try {
            const form = document.getElementById('paymentForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const paymentData = {
                source_account: document.getElementById('source-account').value,
                beneficiary_name: document.getElementById('beneficiary-name').value,
                beneficiary_iban: document.getElementById('beneficiary-iban').value,
                amount: parseFloat(document.getElementById('payment-amount').value),
                reference: document.getElementById('payment-reference').value
            };
            
            // Vérification 2FA pour montants élevés
            if (paymentData.amount > 1000) {
                const twoFACode = prompt('Code 2FA requis pour ce montant:');
                if (!twoFACode) return;
                
                // Vérifier code 2FA
                if (!await window.AuthSuperadmin.verifyTwoFactorCode(twoFACode)) {
                    showNotification('Code 2FA invalide', 'error');
                    return;
                }
            }
            
            showNotification('Virement en cours d\'exécution...', 'info');
            
            // Simuler exécution
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('PAYMENT_EXECUTED', {
                amount: paymentData.amount,
                beneficiary: paymentData.beneficiary_name,
                source: paymentData.source_account
            });
            
            showNotification(`Virement de ${formatSwissAmount(paymentData.amount)} CHF exécuté avec succès`, 'success');
            
            // Fermer modal et rafraîchir
            const modal = bootstrap.Modal.getInstance(document.getElementById('newPaymentModal'));
            modal.hide();
            
            await syncNow();
            
        } catch (error) {
            console.error('❌ Erreur exécution paiement:', error);
            showNotification('Erreur lors de l\'exécution du virement', 'error');
        }
    }
    
    // Ouvrir paiements groupés
    function openBatchPayments() {
        showNotification('Module paiements groupés en cours de développement', 'info');
    }
    
    // Ouvrir rapprochement
    function openReconciliation() {
        const modal = document.getElementById('reconciliationModal');
        if (!modal) return;
        
        const content = document.getElementById('reconciliation-content');
        if (content) {
            content.innerHTML = generateReconciliationHTML();
        }
        
        new bootstrap.Modal(modal).show();
    }
    
    // Générer HTML rapprochement
    function generateReconciliationHTML() {
        const unmatched = state.transactions.filter(t => t.reconciliation.status !== 'matched');
        
        return `
            <div class="row">
                <div class="col-12">
                    <h4>${unmatched.length} transactions à rapprocher</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Contrepartie</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${unmatched.map(t => `
                                    <tr>
                                        <td>${formatDate(t.created_at)}</td>
                                        <td>
                                            <div>${t.counterparty.name}</div>
                                            <small class="text-muted">${t.description}</small>
                                        </td>
                                        <td class="${t.type === 'credit' ? 'text-success' : 'text-danger'}">
                                            ${t.type === 'credit' ? '+' : '-'}${formatSwissAmount(t.amount)} CHF
                                        </td>
                                        <td>
                                            ${renderReconciliationBadge(t.reconciliation)}
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-primary">Rapprocher</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Export FEC
    async function exportFEC() {
        try {
            showNotification('Génération export FEC en cours...', 'info');
            
            // Préparer données FEC
            const fecData = state.transactions.map(t => ({
                'Journal': 'BQ',
                'Date': formatDate(t.created_at, 'YYYYMMDD'),
                'Compte': t.type === 'credit' ? '512000' : '401000',
                'Libellé': t.description,
                'Débit': t.type === 'debit' ? t.amount : 0,
                'Crédit': t.type === 'credit' ? t.amount : 0,
                'Pièce': t.transaction_id,
                'Référence': t.reference || ''
            }));
            
            const csv = convertToCSV(fecData);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export_fec_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            await window.AuthSuperadmin.logAuditEvent('FEC_EXPORT', {
                transactionsCount: fecData.length
            });
            
            showNotification('Export FEC généré avec succès', 'success');
            
        } catch (error) {
            console.error('❌ Erreur export FEC:', error);
            showNotification('Erreur lors de la génération de l\'export', 'error');
        }
    }
    
    // Voir détails compte
    function viewAccountDetails(entity) {
        // Future implémentation: modal avec détails compte
        console.log('Voir détails compte:', entity);
    }
    
    // Fonctions utilitaires
    function formatSwissAmount(amount) {
        return Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }
    
    function formatDate(dateString, format = 'DD.MM.YYYY') {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        if (format === 'YYYYMMDD') {
            return date.toISOString().split('T')[0].replace(/-/g, '');
        }
        
        return date.toLocaleDateString('fr-CH');
    }
    
    function formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-CH') + ' ' + date.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    }
    
    function formatTimeAgo(date) {
        if (!date) return 'jamais';
        
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'il y a quelques secondes';
        if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
        return `il y a ${Math.floor(seconds / 86400)} j`;
    }
    
    function convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(';'),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`))
        ].join('\n');
        
        return csvContent;
    }
    
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    // Interface publique
    return {
        init,
        syncNow,
        getAccounts: () => state.accounts,
        getTransactions: () => state.transactions,
        performAutoReconciliation
    };
    
})();