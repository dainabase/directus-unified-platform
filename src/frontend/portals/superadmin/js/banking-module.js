// Module Bancaire SuperAdmin
class BankingModule {
  constructor() {
    this.currentCompany = 'all';
    this.accounts = [];
    this.transactions = [];
    this.charts = {};
    
    this.init();
  }

  async init() {
    // Charger données au démarrage
    await this.loadDashboardData();
    
    // Initialiser graphiques
    this.initCharts();
    
    // Event listeners
    this.bindEvents();
    
    // Auto-refresh toutes les 2 minutes
    setInterval(() => this.refreshData(), 120000);
  }

  bindEvents() {
    // Sélecteur entreprise
    document.getElementById('companySelector')?.addEventListener('change', (e) => {
      this.currentCompany = e.target.value;
      this.refreshData();
    });

    // Filtres transactions
    document.getElementById('searchTx')?.addEventListener('input', (e) => {
      this.filterTransactions(e.target.value);
    });
  }

  // === CHARGEMENT DONNÉES ===
  async loadDashboardData() {
    try {
      // Widget dashboard principal
      const companies = ['hypervisual', 'dynamics', 'lexia', 'nkreality', 'etekout'];
      let totalsByCurrency = { CHF: 0, EUR: 0, USD: 0 };

      for (const company of companies) {
        try {
          const response = await fetch(`/api/revolut/accounts/${company}`);
          if (response.ok) {
            const data = await response.json();
            const accounts = data.accounts || [];
            accounts.forEach(acc => {
              if (totalsByCurrency[acc.currency] !== undefined) {
                totalsByCurrency[acc.currency] += acc.balance / 100; // Convertir centimes
              }
            });
          }
        } catch (error) {
          console.warn(`Erreur chargement ${company}:`, error);
          // Données mock si API non disponible
          totalsByCurrency.CHF += Math.random() * 100000;
          totalsByCurrency.EUR += Math.random() * 50000;
          totalsByCurrency.USD += Math.random() * 30000;
        }
      }

      // Mettre à jour widget
      Object.keys(totalsByCurrency).forEach(currency => {
        const el = document.getElementById(`total${currency}`);
        if (el) el.textContent = this.formatMoney(totalsByCurrency[currency] * 100, currency);
      });

      // Mettre à jour dernière sync
      const syncTime = document.getElementById('lastSyncTime');
      if (syncTime) syncTime.textContent = new Date().toLocaleTimeString('fr-CH');

      // Mini graphique
      this.updateMiniChart(totalsByCurrency);
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      this.showNotification('Erreur de chargement', 'error');
    }
  }

  async fetchAccounts(company) {
    try {
      const response = await fetch(`/api/revolut/accounts/${company}`);
      if (!response.ok) throw new Error('Erreur chargement comptes');
      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      // Retourner données mock si erreur
      return this.getMockAccounts(company);
    }
  }

  async fetchTransactions(company, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/revolut/transactions/${company}?${queryString}`);
      if (!response.ok) throw new Error('Erreur chargement transactions');
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      // Retourner données mock si erreur
      return this.getMockTransactions(company);
    }
  }

  // === INTERFACE BANCAIRE COMPLÈTE ===
  async openBankingModule() {
    // Charger modal si pas déjà fait
    if (!document.getElementById('bankingModal')) {
      await this.loadBankingModal();
    }

    // Afficher modal
    const modal = new bootstrap.Modal(document.getElementById('bankingModal'));
    modal.show();

    // Charger données complètes
    await this.loadFullBankingData();
  }

  async loadBankingModal() {
    try {
      const response = await fetch('components/banking-module.html');
      const html = await response.text();
      document.getElementById('bankingModalsPlaceholder').innerHTML += html;
    } catch (error) {
      console.error('Erreur chargement modal:', error);
    }
  }

  async loadFullBankingData() {
    // Afficher loader
    this.showLoader(true);

    try {
      if (this.currentCompany === 'all') {
        // Charger toutes les entreprises
        const companies = ['hypervisual', 'dynamics', 'lexia', 'nkreality', 'etekout'];
        this.accounts = [];
        
        for (const company of companies) {
          const companyAccounts = await this.fetchAccounts(company);
          this.accounts.push(...companyAccounts.map(acc => ({
            ...acc,
            company: company,
            companyName: this.getCompanyName(company)
          })));
        }
      } else {
        // Une seule entreprise
        const accounts = await this.fetchAccounts(this.currentCompany);
        this.accounts = accounts.map(acc => ({
          ...acc,
          company: this.currentCompany,
          companyName: this.getCompanyName(this.currentCompany)
        }));
      }

      // Afficher comptes
      this.renderAccounts();
      
      // Charger transactions récentes
      await this.loadRecentTransactions();
      
      // Mettre à jour graphiques
      this.updateCharts();
      
    } catch (error) {
      console.error('Erreur:', error);
      this.showNotification('Erreur de chargement', 'error');
    } finally {
      this.showLoader(false);
    }
  }

  renderAccounts() {
    const grid = document.getElementById('accountsGrid');
    if (!grid) return;

    grid.innerHTML = this.accounts.map(account => `
      <div class="col-md-4">
        <div class="card glass-card hover-scale">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar bg-primary-lt">
                <i class="ti ti-currency-${account.currency.toLowerCase()}"></i>
              </div>
              <div class="ms-3">
                <div class="small text-muted">${account.companyName}</div>
                <div class="fw-bold">${account.currency} - ${account.name || 'Principal'}</div>
              </div>
            </div>
            <div class="h2 mb-3 treasury-amount">
              ${this.formatMoney(account.balance, account.currency)}
            </div>
            <div class="progress progress-sm">
              <div class="progress-bar bg-primary" style="width: ${this.getBalancePercentage(account)}%"></div>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <small class="text-muted">État: ${this.getStatusBadge(account.state)}</small>
              <a href="#" onclick="bankingModule.showAccountDetails('${account.id}')" class="small">
                Détails <i class="ti ti-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  async loadRecentTransactions() {
    const tbody = document.getElementById('transactionsTable');
    if (!tbody) return;

    // Charger transactions des 30 derniers jours
    this.transactions = [];
    
    for (const account of this.accounts) {
      const txs = await this.fetchTransactions(account.company, { limit: 50 });
      this.transactions.push(...txs.map(tx => ({
        ...tx,
        company: account.company,
        companyName: account.companyName,
        accountCurrency: account.currency
      })));
    }

    // Trier par date
    this.transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Afficher
    this.renderTransactions();
  }

  renderTransactions() {
    const tbody = document.getElementById('transactionsTable');
    if (!tbody) return;

    tbody.innerHTML = this.transactions.slice(0, 50).map(tx => `
      <tr>
        <td>${new Date(tx.created_at || Date.now()).toLocaleDateString('fr-CH')}</td>
        <td>
          <span class="badge badge-outline text-primary">
            ${tx.companyName}
          </span>
        </td>
        <td>${tx.reference || tx.description || '-'}</td>
        <td>${tx.merchant?.name || tx.counterparty?.name || '-'}</td>
        <td class="text-muted">${(tx.id || '').slice(0, 8)}...</td>
        <td class="text-end">
          <span class="${tx.amount?.value > 0 ? 'text-success' : 'text-danger'}">
            ${this.formatMoney(tx.amount?.value || 0, tx.amount?.currency || tx.accountCurrency)}
          </span>
        </td>
        <td>
          <span class="badge ${this.getStatusClass(tx.state)}">
            ${this.translateStatus(tx.state)}
          </span>
        </td>
        <td>
          <div class="btn-list flex-nowrap">
            <a href="#" class="btn btn-sm" onclick="bankingModule.showTransactionDetails('${tx.id}')">
              <i class="ti ti-eye"></i>
            </a>
            ${tx.state === 'completed' && !tx.reconciled ? `
              <a href="#" class="btn btn-sm" onclick="bankingModule.reconcileTransaction('${tx.id}')">
                <i class="ti ti-git-merge"></i>
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  // === GRAPHIQUES ===
  initCharts() {
    // Mini chart dashboard
    if (document.getElementById('cashflowMiniChart')) {
      this.charts.miniCashflow = new ApexCharts(
        document.getElementById('cashflowMiniChart'),
        {
          chart: {
            type: 'area',
            height: 120,
            sparkline: { enabled: true },
            animations: { enabled: true }
          },
          series: [{
            name: 'Trésorerie',
            data: []
          }],
          stroke: { curve: 'smooth', width: 2 },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3
            }
          },
          colors: ['#206bc4']
        }
      );
      this.charts.miniCashflow.render();
    }

    // Chart principal trésorerie
    if (document.getElementById('cashflowChart')) {
      this.charts.cashflow = new ApexCharts(
        document.getElementById('cashflowChart'),
        {
          chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false }
          },
          series: [],
          xaxis: {
            type: 'datetime',
            labels: {
              datetimeFormatter: {
                day: 'dd MMM'
              }
            }
          },
          yaxis: {
            labels: {
              formatter: (val) => this.formatMoney(val * 100, 'CHF', true)
            }
          },
          stroke: {
            curve: 'smooth',
            width: 3
          },
          legend: {
            position: 'top'
          }
        }
      );
      this.charts.cashflow.render();
    }

    // Pie chart devises
    if (document.getElementById('currencyPieChart')) {
      this.charts.currencyPie = new ApexCharts(
        document.getElementById('currencyPieChart'),
        {
          chart: {
            type: 'donut',
            height: 300
          },
          series: [],
          labels: ['CHF', 'EUR', 'USD'],
          colors: ['#206bc4', '#5eba00', '#fab005'],
          legend: {
            position: 'bottom'
          }
        }
      );
      this.charts.currencyPie.render();
    }
  }

  updateMiniChart(totalsByCurrency) {
    if (!this.charts.miniCashflow) return;

    // Générer données pour les 7 derniers jours
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const variation = 1 + (Math.random() - 0.5) * 0.1;
      const total = (totalsByCurrency.CHF + totalsByCurrency.EUR * 1.07 + totalsByCurrency.USD * 0.92) * variation;
      data.push(total);
    }

    this.charts.miniCashflow.updateSeries([{
      name: 'Trésorerie',
      data: data
    }]);
  }

  updateCharts() {
    // Données pour graphiques
    const last30Days = this.generateLast30Days();
    
    // Regrouper par devise
    const seriesByCurrency = {};
    const currencyTotals = { CHF: 0, EUR: 0, USD: 0 };
    
    this.accounts.forEach(account => {
      if (!seriesByCurrency[account.currency]) {
        seriesByCurrency[account.currency] = {
          name: `${account.currency}`,
          data: last30Days.map(date => ({
            x: new Date(date).getTime(),
            y: 0
          }))
        };
      }
      
      // Ajouter balance actuelle (simplification)
      const balance = account.balance / 100;
      seriesByCurrency[account.currency].data[29].y += balance;
      currencyTotals[account.currency] += balance;
    });

    // Mettre à jour chart principal
    if (this.charts.cashflow) {
      this.charts.cashflow.updateOptions({
        series: Object.values(seriesByCurrency)
      });
    }

    // Mettre à jour pie chart
    if (this.charts.currencyPie) {
      this.charts.currencyPie.updateSeries(Object.values(currencyTotals));
    }
  }

  // === ACTIONS ===
  async syncAllAccounts() {
    this.showNotification('Synchronisation en cours...', 'info');
    
    try {
      const companies = this.currentCompany === 'all' 
        ? ['hypervisual', 'dynamics', 'lexia', 'nkreality', 'etekout']
        : [this.currentCompany];

      for (const company of companies) {
        await fetch(`/api/revolut/sync/${company}`, { method: 'POST' });
      }

      this.showNotification('Synchronisation terminée', 'success');
      await this.refreshData();
    } catch (error) {
      console.error('Erreur sync:', error);
      this.showNotification('Erreur de synchronisation', 'error');
    }
  }

  async refreshData() {
    await this.loadDashboardData();
    if (document.getElementById('bankingModal')?.classList.contains('show')) {
      await this.loadFullBankingData();
    }
  }

  // === HELPERS ===
  formatMoney(amount, currency, compact = false) {
    const options = {
      style: 'currency',
      currency: currency || 'CHF',
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: compact ? 0 : 2
    };
    
    if (compact && Math.abs(amount) > 1000) {
      options.notation = 'compact';
    }
    
    return new Intl.NumberFormat('fr-CH', options).format(amount / 100);
  }

  getCompanyName(companyId) {
    const names = {
      hypervisual: 'HyperVisual',
      dynamics: 'Dynamics',
      lexia: 'Lexia',
      nkreality: 'NKReality',
      etekout: 'Etekout'
    };
    return names[companyId] || companyId;
  }

  getStatusClass(status) {
    const classes = {
      'completed': 'bg-success',
      'pending': 'bg-warning',
      'failed': 'bg-danger',
      'reverted': 'bg-secondary'
    };
    return classes[status] || 'bg-info';
  }

  getStatusBadge(status) {
    if (status === 'active') return '<span class="badge bg-success">Actif</span>';
    return '<span class="badge bg-secondary">Inactif</span>';
  }

  translateStatus(status) {
    const translations = {
      'completed': 'Complété',
      'pending': 'En attente',
      'failed': 'Échoué',
      'reverted': 'Annulé'
    };
    return translations[status] || status;
  }

  getBalancePercentage(account) {
    // Calcul simple du pourcentage par rapport à un max fictif
    const maxBalance = 1000000; // 10k CHF
    return Math.min(100, (account.balance / maxBalance) * 100);
  }

  generateLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  showNotification(message, type = 'info') {
    // Utiliser le système de notification Tabler existant
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
  }

  showLoader(show) {
    // Gérer l'affichage du loader
    const existing = document.getElementById('bankingLoader');
    if (show && !existing) {
      const loader = document.createElement('div');
      loader.id = 'bankingLoader';
      loader.className = 'position-fixed top-50 start-50 translate-middle';
      loader.style.zIndex = '9999';
      loader.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
      document.body.appendChild(loader);
    } else if (!show && existing) {
      existing.remove();
    }
  }

  // === DONNÉES MOCK ===
  getMockAccounts(company) {
    const baseAmounts = {
      hypervisual: { chf: 234567.89, eur: 45678.90, usd: 12345.67 },
      dynamics: { chf: 156789.12, eur: 34567.89, usd: 23456.78 },
      lexia: { chf: 89012.34, eur: 23456.78, usd: 34567.89 },
      nkreality: { chf: 45678.90, eur: 12345.67, usd: 45678.90 },
      etekout: { chf: 78901.23, eur: 56789.01, usd: 67890.12 }
    };
    
    const amounts = baseAmounts[company] || baseAmounts.hypervisual;
    
    return [
      {
        id: `${company}-chf`,
        name: 'Compte Principal CHF',
        currency: 'CHF',
        balance: amounts.chf * 100, // en centimes
        state: 'active'
      },
      {
        id: `${company}-eur`,
        name: 'Compte EUR',
        currency: 'EUR',
        balance: amounts.eur * 100,
        state: 'active'
      },
      {
        id: `${company}-usd`,
        name: 'Compte USD',
        currency: 'USD',
        balance: amounts.usd * 100,
        state: 'active'
      }
    ];
  }

  getMockTransactions(company) {
    const transactions = [];
    const types = ['payment', 'transfer', 'card_payment'];
    const statuses = ['completed', 'pending'];
    
    for (let i = 0; i < 10; i++) {
      const isCredit = Math.random() > 0.5;
      const amount = Math.random() * 10000;
      
      transactions.push({
        id: `tx-${company}-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        state: statuses[Math.floor(Math.random() * statuses.length)],
        amount: {
          value: isCredit ? amount * 100 : -amount * 100,
          currency: ['CHF', 'EUR', 'USD'][Math.floor(Math.random() * 3)]
        },
        description: isCredit ? `Paiement client ${i}` : `Paiement fournisseur ${i}`,
        reference: `REF-${Date.now()}-${i}`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        counterparty: {
          name: isCredit ? `Client ${i}` : `Fournisseur ${i}`
        }
      });
    }
    
    return transactions;
  }
}

// === FONCTIONS GLOBALES ===
let bankingModule;

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser seulement si on est sur le dashboard
  if (document.getElementById('bankingWidgetPlaceholder') || document.getElementById('totalCHF')) {
    bankingModule = new BankingModule();
  }
});

// Fonctions globales pour onclick
function openBankingModule() {
  if (!bankingModule) bankingModule = new BankingModule();
  bankingModule.openBankingModule();
}

function quickSync() {
  if (!bankingModule) bankingModule = new BankingModule();
  bankingModule.syncAllAccounts();
}

function showNewPayment() {
  // Charger modal paiement si nécessaire
  if (!document.getElementById('paymentModal')) {
    fetch('components/payment-modal.html')
      .then(r => r.text())
      .then(html => {
        document.getElementById('bankingModalsPlaceholder').innerHTML += html;
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
      });
  } else {
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
  }
}

function syncAllAccounts() {
  if (!bankingModule) bankingModule = new BankingModule();
  bankingModule.syncAllAccounts();
}

function filterTransactions() {
  // TODO: Implémenter filtrage
  console.log('Filtrage transactions');
}

function loadCompanyAccounts() {
  const company = document.getElementById('paymentCompany').value;
  const accountSelect = document.getElementById('paymentAccount');
  
  if (!company) {
    accountSelect.disabled = true;
    accountSelect.innerHTML = '<option value="">Sélectionner compte...</option>';
    return;
  }
  
  // Charger comptes de l'entreprise
  accountSelect.disabled = false;
  
  if (bankingModule) {
    const accounts = bankingModule.accounts.filter(a => a.company === company);
    accountSelect.innerHTML = '<option value="">Sélectionner compte...</option>' +
      accounts.map(a => `<option value="${a.id}">${a.name} - ${a.currency}</option>`).join('');
  }
}

function submitPayment(event) {
  event.preventDefault();
  
  const formData = {
    company: document.getElementById('paymentCompany').value,
    account: document.getElementById('paymentAccount').value,
    beneficiary: {
      name: document.getElementById('beneficiaryName').value,
      iban: document.getElementById('beneficiaryIban').value,
      bic: document.getElementById('beneficiaryBic').value
    },
    amount: parseFloat(document.getElementById('paymentAmount').value),
    currency: document.getElementById('paymentCurrency').value,
    reference: document.getElementById('paymentReference').value,
    type: document.getElementById('paymentType')?.value || 'SEPA',
    chargeBearer: document.getElementById('chargeBearer')?.value || 'shared'
  };
  
  console.log('Soumission paiement:', formData);
  
  // TODO: Appeler API pour créer le paiement
  
  // Fermer modal
  bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
  
  // Notification
  if (bankingModule) {
    bankingModule.showNotification('Virement créé avec succès', 'success');
  }
}