/**
 * Companies SuperAdmin Module
 * Gestion des entreprises stratégiques avec vue consolidée
 */

window.CompaniesSuperadmin = (function() {
    'use strict';

    // Configuration
    const database = 'DB-CONTACTS-ENTREPRISES';
    const view = '🔴 SUPERADMIN - Entreprises Consolidées';
    
    // DataTable instance
    let dataTable = null;
    
    // Companies data cache
    let companiesData = [];
    
    // Current filters
    let filters = {
        entity: '',
        score: '',
        status: '',
        search: ''
    };

    /**
     * Initialize module
     */
    async function init() {
        console.log('🏢 Companies SuperAdmin module initializing...');
        
        // Verify permissions
        const hasPermission = await PermissionsSuperadmin.checkPermission('superadmin.crm.manage');
        if (!hasPermission) {
            console.error('❌ Missing permission: superadmin.crm.manage');
            return false;
        }

        // Initialize event listeners
        initializeEventListeners();
        
        // Load initial data
        await loadCompanies();
        
        return true;
    }

    /**
     * Load companies from Notion
     */
    async function loadCompanies() {
        try {
            showLoading(true);
            
            // Build filter
            const notionFilter = {
                and: [
                    {
                        or: [
                            { property: 'Status', select: { equals: 'Client' } },
                            { property: 'Status', select: { equals: 'En cours' } },
                            { property: 'Status', select: { equals: 'Prospect' } }
                        ]
                    }
                ]
            };

            // Add entity filter if selected
            if (filters.entity) {
                notionFilter.and.push({
                    property: 'Entité du Groupe',
                    select: { equals: filters.entity }
                });
            }

            // Query database
            const response = await NotionConnector.queryDatabase(database, {
                filter: notionFilter,
                sorts: [{
                    property: 'CA Estimé',
                    direction: 'descending'
                }]
            });

            // Transform data
            companiesData = response.results.map(page => ({
                id: page.id,
                name: page.properties['Nom Entreprise']?.title?.[0]?.text?.content || '',
                entity: page.properties['Entité du Groupe']?.select?.name || '',
                sector: page.properties['Secteur']?.select?.name || '',
                revenue: page.properties['CA Estimé']?.number || 0,
                score: page.properties['Score Client']?.number || 0,
                status: page.properties['Status']?.select?.name || '',
                manager: page.properties['Responsable']?.people?.[0]?.name || 'Non assigné',
                lastInteraction: page.properties['Dernière Interaction']?.date?.start || null,
                notes: page.properties['Notes SUPERADMIN']?.rich_text?.[0]?.text?.content || ''
            }));

            // Apply local filters
            applyFilters();
            
            // Update UI
            renderTable();
            updateStatistics();
            
            showLoading(false);
            showToast('Données chargées', 'success');

        } catch (error) {
            console.error('Error loading companies:', error);
            showToast('Erreur lors du chargement', 'error');
            showLoading(false);
        }
    }

    /**
     * Apply filters to data
     */
    function applyFilters() {
        let filtered = [...companiesData];

        // Score filter
        if (filters.score) {
            filtered = filtered.filter(company => {
                const score = company.score;
                switch(filters.score) {
                    case 'A+': return score >= 90;
                    case 'A': return score >= 80 && score < 90;
                    case 'B': return score >= 60 && score < 80;
                    case 'C': return score < 60;
                    default: return true;
                }
            });
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(company => company.status === filters.status);
        }

        // Search filter
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(company => 
                company.name.toLowerCase().includes(search) ||
                company.sector.toLowerCase().includes(search)
            );
        }

        return filtered;
    }

    /**
     * Render DataTable
     */
    function renderTable() {
        // Destroy existing table
        if (dataTable) {
            dataTable.destroy();
        }

        // Render data
        const tbody = document.querySelector('#companies-table tbody');
        tbody.innerHTML = '';

        const filteredData = applyFilters();
        
        filteredData.forEach(company => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div>
                            <div class="font-weight-medium">${company.name}</div>
                            <div class="text-secondary small">${company.sector}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge entity-${company.entity.toLowerCase().replace(' ', '')}">${company.entity}</span>
                </td>
                <td>${company.sector}</td>
                <td data-order="${company.revenue}">${formatCurrency(company.revenue)}</td>
                <td data-order="${company.score}">
                    <span class="score-badge score-${getScoreClass(company.score)}">${company.score}/100</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-sm me-2">${getInitials(company.manager)}</span>
                        <span>${company.manager}</span>
                    </div>
                </td>
                <td data-order="${company.lastInteraction || ''}">
                    ${company.lastInteraction ? formatDate(company.lastInteraction) : 
                      '<span class="text-secondary">Aucune</span>'}
                </td>
                <td>
                    <div class="btn-list flex-nowrap">
                        <button class="btn btn-ghost-secondary btn-icon" onclick="CompaniesSuperadmin.viewDetails('${company.id}')" title="Voir détails">
                            <i class="ti ti-eye"></i>
                        </button>
                        <button class="btn btn-ghost-secondary btn-icon" onclick="CompaniesSuperadmin.editCompany('${company.id}')" title="Édition rapide">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button class="btn btn-ghost-secondary btn-icon" onclick="CompaniesSuperadmin.addNote('${company.id}')" title="Ajouter note">
                            <i class="ti ti-note"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Initialize DataTable with grouping
        dataTable = $('#companies-table').DataTable({
            responsive: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/fr-FR.json'
            },
            order: [[3, 'desc']], // Sort by revenue
            rowGroup: {
                dataSrc: 1, // Group by entity column
                startRender: function(rows, group) {
                    const sum = rows
                        .data()
                        .pluck(3) // Revenue column
                        .reduce((a, b) => a + (parseInt(b.replace(/[^0-9]/g, '')) || 0), 0);
                    
                    return `<strong>${group}</strong> - ${rows.count()} entreprises - Total: ${formatCurrency(sum)}`;
                }
            },
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'csv',
                    text: 'Export CSV',
                    filename: `entreprises-strategiques-${new Date().toISOString().split('T')[0]}`,
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5, 6]
                    }
                }
            ],
            drawCallback: function(settings) {
                // Update footer total
                let total = 0;
                this.api().column(3, {page: 'current'}).data().each(function(value) {
                    total += parseInt(value.replace(/[^0-9]/g, '')) || 0;
                });
                document.getElementById('total-ca').textContent = formatCurrency(total);
            }
        });
    }

    /**
     * Update statistics
     */
    function updateStatistics() {
        const stats = {
            hypervisual: { count: 0, total: 0 },
            dainamics: { count: 0, total: 0 },
            enki: { count: 0, total: 0 },
            takeout: { count: 0, total: 0 },
            lexaia: { count: 0, total: 0 },
            total: { count: 0, total: 0 }
        };

        companiesData.forEach(company => {
            const key = company.entity.toLowerCase().replace(' reality', '').replace(' ', '');
            if (stats[key]) {
                stats[key].count++;
                stats[key].total += company.revenue;
            }
            stats.total.count++;
            stats.total.total += company.revenue;
        });

        // Update UI
        Object.keys(stats).forEach(key => {
            const stat = stats[key];
            const avg = stat.count > 0 ? stat.total / stat.count : 0;
            
            document.getElementById(`stat-${key}-count`).textContent = stat.count;
            document.getElementById(`stat-${key}-total`).textContent = formatCurrency(stat.total);
            document.getElementById(`stat-${key}-avg`).textContent = formatCurrency(avg);
        });
    }

    /**
     * Edit company
     */
    async function editCompany(companyId) {
        const company = companiesData.find(c => c.id === companyId);
        if (!company) return;

        // Populate modal
        document.getElementById('edit-company-id').value = company.id;
        document.getElementById('edit-company-name').value = company.name;
        document.getElementById('edit-score').value = company.score;
        document.getElementById('edit-notes').value = company.notes;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('modal-quick-edit'));
        modal.show();
    }

    /**
     * Save company edits
     */
    async function saveCompanyEdit(event) {
        event.preventDefault();
        
        const companyId = document.getElementById('edit-company-id').value;
        const score = parseInt(document.getElementById('edit-score').value);
        const notes = document.getElementById('edit-notes').value;

        try {
            showLoading(true);
            
            // Check permission for update
            if (!await PermissionsSuperadmin.checkPermission('superadmin.crm.manage')) {
                throw new Error('Permission denied');
            }

            // Update in Notion
            await NotionConnector.updateRecord(database, companyId, {
                'Score Client': { number: score },
                'Notes SUPERADMIN': { 
                    rich_text: [{
                        type: 'text',
                        text: { content: notes }
                    }]
                }
            });

            // Update local cache
            const company = companiesData.find(c => c.id === companyId);
            if (company) {
                company.score = score;
                company.notes = notes;
            }

            // Refresh table
            renderTable();
            updateStatistics();

            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('modal-quick-edit')).hide();
            
            showToast('Entreprise mise à jour', 'success');
            showLoading(false);

        } catch (error) {
            console.error('Error updating company:', error);
            showToast('Erreur lors de la mise à jour', 'error');
            showLoading(false);
        }
    }

    /**
     * Export to CSV
     */
    function exportToCSV() {
        const data = applyFilters();
        
        // Headers
        const headers = ['Entreprise', 'Entité', 'Secteur', 'CA Estimé', 'Score', 'Status', 'Responsable', 'Dernière interaction'];
        
        // Rows
        const rows = data.map(company => [
            company.name,
            company.entity,
            company.sector,
            company.revenue,
            company.score,
            company.status,
            company.manager,
            company.lastInteraction || ''
        ]);

        // Create CSV
        const csv = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');

        // Download
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `entreprises-strategiques-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    /**
     * Helper functions
     */
    function formatCurrency(amount) {
        return 'CHF ' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        
        if (days === 0) return "Aujourd'hui";
        if (days === 1) return "Hier";
        if (days < 30) return `Il y a ${days} jours`;
        
        return date.toLocaleDateString('fr-CH');
    }

    function getScoreClass(score) {
        if (score >= 90) return 'a-plus';
        if (score >= 80) return 'a';
        if (score >= 60) return 'b';
        return 'c';
    }

    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    function showLoading(show) {
        const card = document.querySelector('.card');
        if (show) {
            card.classList.add('card-loading');
        } else {
            card.classList.remove('card-loading');
        }
    }

    function showToast(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Implement toast notification
    }

    /**
     * Initialize event listeners
     */
    function initializeEventListeners() {
        // Filter changes
        document.getElementById('filter-entity').addEventListener('change', function() {
            filters.entity = this.value;
            if (this.value) {
                // Reload from Notion with entity filter
                loadCompanies();
            } else {
                renderTable();
                updateStatistics();
            }
        });

        document.getElementById('filter-score').addEventListener('change', function() {
            filters.score = this.value;
            renderTable();
        });

        document.getElementById('filter-status').addEventListener('change', function() {
            filters.status = this.value;
            renderTable();
        });

        document.getElementById('search-global').addEventListener('input', function() {
            filters.search = this.value;
            renderTable();
        });

        // Form submission
        document.getElementById('form-quick-edit').addEventListener('submit', saveCompanyEdit);
    }

    /**
     * Public API
     */
    return {
        init,
        refreshData: loadCompanies,
        exportToCSV,
        editCompany,
        viewDetails: function(companyId) {
            // Navigate to company details page
            window.location.href = `company-details.html?id=${companyId}`;
        },
        addNote: function(companyId) {
            // Quick note functionality
            editCompany(companyId);
            document.getElementById('edit-notes').focus();
        }
    };
})();