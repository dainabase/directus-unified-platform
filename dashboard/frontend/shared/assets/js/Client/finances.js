/**
 * Finances Management
 * Gestion des finances, factures et graphiques
 */

// Variables globales
let spendingChart = null;
let categoryChart = null;
let budgetForecastChart = null;

// Données simulées
const financesData = {
    invoices: [
        {
            id: 'FAC-2024-0125',
            date: '2024-01-15',
            description: 'Développement phase 1',
            project: 'Refonte Site Web',
            amount: 15000,
            status: 'paid',
            dueDate: '2024-02-15',
            items: [
                { description: 'Développement Frontend', quantity: 40, unitPrice: 150, total: 6000 },
                { description: 'Développement Backend', quantity: 30, unitPrice: 180, total: 5400 },
                { description: 'Tests et optimisation', quantity: 15, unitPrice: 120, total: 1800 },
                { description: 'Gestion de projet', quantity: 10, unitPrice: 100, total: 1000 }
            ]
        },
        {
            id: 'FAC-2024-0124',
            date: '2024-01-10',
            description: 'Design maquettes',
            project: 'Refonte Site Web',
            amount: 8500,
            status: 'pending',
            dueDate: '2024-02-10'
        },
        {
            id: 'FAC-2024-0123',
            date: '2024-01-05',
            description: 'Analyse et cahier des charges',
            project: 'App Mobile',
            amount: 12000,
            status: 'overdue',
            dueDate: '2024-01-05'
        }
    ],
    monthlyData: {
        budget: [45000, 48000, 52000, 51000, 55000, 58000, 60000, 62000, 61000, 64000, 67000, 70000],
        actual: [43000, 46000, 49000, 53000, 54000, 56000, 59000, 61000, 63000, 65000, null, null]
    },
    categories: {
        'Développement': 112500,
        'Design': 62500,
        'Marketing': 50000,
        'Autres': 25000
    }
};

// Initialiser les graphiques
function initFinanceCharts() {
    // Graphique évolution des dépenses
    const spendingOptions = {
        series: [{
            name: 'Budget prévu',
            data: financesData.monthlyData.budget
        }, {
            name: 'Dépenses réelles',
            data: financesData.monthlyData.actual
        }],
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#206bc4', '#2fb344'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return 'CHF ' + (val/1000).toFixed(0) + 'k';
                },
                style: {
                    fontSize: '12px'
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    if (val === null) return 'N/A';
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    };
    
    const spendingElement = document.querySelector("#chart-spending-evolution");
    if (spendingElement) {
        spendingChart = new ApexCharts(spendingElement, spendingOptions);
        spendingChart.render();
    }
    
    // Graphique répartition par catégorie
    const categoryOptions = {
        series: Object.values(financesData.categories),
        chart: {
            type: 'donut',
            height: 300
        },
        labels: Object.keys(financesData.categories),
        colors: ['#206bc4', '#2fb344', '#f76707', '#ae3ec9'],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: function() {
                                const total = Object.values(financesData.categories).reduce((a, b) => a + b, 0);
                                return 'CHF ' + total.toLocaleString('fr-CH');
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        }
    };
    
    const categoryElement = document.querySelector("#chart-category-distribution");
    if (categoryElement) {
        categoryChart = new ApexCharts(categoryElement, categoryOptions);
        categoryChart.render();
    }
    
    // Graphique prévisions budget
    const forecastOptions = {
        series: [{
            name: 'Prévu',
            data: [80000, 120000, 50000]
        }, {
            name: 'Consommé',
            data: [45200, 12500, 28000]
        }],
        chart: {
            type: 'bar',
            height: 250,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                endingShape: 'rounded'
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#e0e0e0', '#206bc4'],
        xaxis: {
            categories: ['Refonte Site Web', 'App Mobile', 'Migration CRM'],
            labels: {
                style: {
                    fontSize: '11px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return 'CHF ' + (val/1000).toFixed(0) + 'k';
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    };
    
    const forecastElement = document.querySelector("#chart-budget-forecast");
    if (forecastElement) {
        budgetForecastChart = new ApexCharts(forecastElement, forecastOptions);
        budgetForecastChart.render();
    }
}

// Changer la période du graphique
function changePeriod(period) {
    // Mettre à jour les données selon la période
    console.log('Changement de période:', period);
    PortalApp.showToast(`Vue ${period} sélectionnée`, 'info');
}

// Télécharger le rapport financier
function downloadFinancialReport() {
    PortalApp.showToast('Génération du rapport en cours...', 'info');
    
    setTimeout(() => {
        PortalApp.showToast('Rapport financier téléchargé', 'success');
    }, 2000);
}

// Exporter les données
function exportData(format) {
    const formats = {
        'csv': 'CSV',
        'excel': 'Excel',
        'pdf': 'PDF'
    };
    
    PortalApp.showToast(`Export en format ${formats[format]} en cours...`, 'info');
    
    setTimeout(() => {
        PortalApp.showToast(`Données exportées en ${formats[format]}`, 'success');
    }, 1500);
}

// Actions sur les factures
function downloadInvoice(invoiceId) {
    PortalApp.showToast(`Téléchargement de la facture ${invoiceId}...`, 'info');
    
    setTimeout(() => {
        PortalApp.showToast('Facture téléchargée', 'success');
    }, 1000);
}

function duplicateInvoice(invoiceId) {
    if (confirm(`Dupliquer la facture ${invoiceId} ?`)) {
        const newId = `FAC-2024-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
        PortalApp.showToast(`Nouvelle facture créée: ${newId}`, 'success');
    }
}

function sendReminder(invoiceId) {
    PortalApp.showToast(`Rappel envoyé pour la facture ${invoiceId}`, 'success');
}

function contactSupport(invoiceId) {
    PortalApp.showToast('Ouverture du chat support...', 'info');
}

// Actions détail facture
function loadInvoiceDetails(invoiceId) {
    const invoice = financesData.invoices.find(inv => inv.id === invoiceId);
    
    if (invoice) {
        // Mettre à jour le statut
        if (invoice.status === 'paid') {
            document.getElementById('invoice-status').classList.remove('bg-warning', 'bg-danger');
            document.getElementById('invoice-status').classList.add('bg-success');
            document.getElementById('invoice-status').textContent = 'Payée';
            document.getElementById('pay-button').style.display = 'none';
        } else if (invoice.status === 'overdue') {
            document.getElementById('invoice-status').classList.remove('bg-success', 'bg-warning');
            document.getElementById('invoice-status').classList.add('bg-danger');
            document.getElementById('invoice-status').textContent = 'En retard';
        } else {
            document.getElementById('invoice-status').classList.remove('bg-success', 'bg-danger');
            document.getElementById('invoice-status').classList.add('bg-warning');
            document.getElementById('invoice-status').textContent = 'En attente';
        }
    }
}

function downloadInvoicePDF() {
    PortalApp.showToast('Génération du PDF en cours...', 'info');
    
    setTimeout(() => {
        PortalApp.showToast('Facture PDF téléchargée', 'success');
    }, 1500);
}

function sendInvoiceByEmail() {
    const email = prompt('Adresse email du destinataire:', 'client@email.ch');
    if (email) {
        PortalApp.showToast(`Facture envoyée à ${email}`, 'success');
    }
}

function createCreditNote() {
    if (confirm('Créer un avoir pour cette facture ?')) {
        PortalApp.showToast('Avoir créé avec succès', 'success');
    }
}

function cancelInvoice() {
    if (confirm('Êtes-vous sûr de vouloir annuler cette facture ? Cette action est irréversible.')) {
        PortalApp.showToast('Facture annulée', 'warning');
        
        setTimeout(() => {
            window.location.href = 'finances.html';
        }, 1000);
    }
}

// Afficher le formulaire de nouvelle facture
function showInvoiceForm() {
    PortalApp.showToast('Fonction de création de facture en cours de développement', 'info');
}

// Recherche et filtres
document.addEventListener('DOMContentLoaded', function() {
    // Recherche factures
    const searchInput = document.getElementById('search-invoices');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterInvoices(searchTerm);
        });
    }
    
    // Filtre statut
    const statusFilter = document.getElementById('filter-status');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterInvoices();
        });
    }
});

// Filtrer les factures
function filterInvoices(searchTerm = '') {
    const statusFilter = document.getElementById('filter-status')?.value;
    const rows = document.querySelectorAll('#tab-invoices tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.querySelector('.badge')?.textContent.toLowerCase();
        
        let showRow = true;
        
        // Filtre recherche
        if (searchTerm && !text.includes(searchTerm)) {
            showRow = false;
        }
        
        // Filtre statut
        if (statusFilter) {
            const statusMap = {
                'paid': 'payée',
                'pending': 'en attente',
                'overdue': 'en retard'
            };
            
            if (!status.includes(statusMap[statusFilter])) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Calculs automatiques
function calculateTotals() {
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    
    financesData.invoices.forEach(invoice => {
        switch(invoice.status) {
            case 'paid':
                totalPaid += invoice.amount;
                break;
            case 'pending':
                totalPending += invoice.amount;
                break;
            case 'overdue':
                totalOverdue += invoice.amount;
                break;
        }
    });
    
    return {
        total: totalPaid + totalPending + totalOverdue,
        paid: totalPaid,
        pending: totalPending,
        overdue: totalOverdue
    };
}

// Alertes automatiques
function checkOverdueInvoices() {
    const overdueCount = financesData.invoices.filter(inv => inv.status === 'overdue').length;
    
    if (overdueCount > 0) {
        const totalOverdue = financesData.invoices
            .filter(inv => inv.status === 'overdue')
            .reduce((sum, inv) => sum + inv.amount, 0);
        
        console.warn(`⚠️ ${overdueCount} facture(s) en retard pour un total de CHF ${totalOverdue.toLocaleString('fr-CH')}`);
    }
}

// Prévisions budget
function calculateBudgetForecast() {
    const currentMonth = new Date().getMonth();
    const monthlyAverage = financesData.monthlyData.actual
        .filter(val => val !== null)
        .reduce((sum, val, idx, arr) => sum + val/arr.length, 0);
    
    const yearEndProjection = monthlyAverage * 12;
    const budgetTotal = financesData.monthlyData.budget.reduce((sum, val) => sum + val, 0);
    
    const variance = ((yearEndProjection - budgetTotal) / budgetTotal * 100).toFixed(1);
    
    return {
        projection: yearEndProjection,
        budget: budgetTotal,
        variance: variance
    };
}

// Export comptable format suisse
function exportSwissAccountingFormat() {
    // Format spécifique pour la comptabilité suisse
    console.log('Export au format comptable suisse');
    PortalApp.showToast('Export comptable CH généré', 'success');
}