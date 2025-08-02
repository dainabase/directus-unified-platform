/**
 * Companies Manager for SuperAdmin
 * Manages companies across all entities with Notion integration
 * Features: Swiss company enrichment, IDE validation, multi-entity filtering
 */

const CompaniesManagerSuperadmin = (function() {
    'use strict';

    // Configuration
    const config = {
        // Notion Database IDs
        DB_CONTACTS_ENTREPRISES: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
        DB_INTERACTIONS_CLIENTS: '226adb95-3c6f-805f-9095-d4c6278a5f5b',
        DB_ENTITÉ_DU_GROUPE: '231adb95-3c6f-8002-b885-c94041b44a44',
        
        // API endpoints (simulated)
        ZEFIX_API: 'https://www.zefix.ch/api/v1/company/',
        
        // Swiss cantons
        CANTONS: {
            'AG': 'Argovie', 'AI': 'Appenzell Rhodes-Intérieures', 'AR': 'Appenzell Rhodes-Extérieures',
            'BE': 'Berne', 'BL': 'Bâle-Campagne', 'BS': 'Bâle-Ville', 'FR': 'Fribourg',
            'GE': 'Genève', 'GL': 'Glaris', 'GR': 'Grisons', 'JU': 'Jura', 'LU': 'Lucerne',
            'NE': 'Neuchâtel', 'NW': 'Nidwald', 'OW': 'Obwald', 'SG': 'Saint-Gall',
            'SH': 'Schaffhouse', 'SO': 'Soleure', 'SZ': 'Schwyz', 'TG': 'Thurgovie',
            'TI': 'Tessin', 'UR': 'Uri', 'VD': 'Vaud', 'VS': 'Valais', 'ZG': 'Zoug', 'ZH': 'Zurich'
        }
    };

    let companiesData = [];
    let dataTable = null;
    let currentFilters = {
        entity: '',
        score: '',
        status: '',
        search: ''
    };

    // Initialize module
    const init = async function() {
        console.log('🏢 Initializing Companies Manager SuperAdmin...');
        
        initializeEventHandlers();
        await loadCompaniesFromNotion();
        initializeDataTable();
        updateStatistics();
    };

    // Load companies from Notion
    const loadCompaniesFromNotion = async function() {
        try {
            if (typeof window.mcp_notion !== 'undefined') {
                const response = await window.mcp_notion.query_database({
                    database_id: config.DB_CONTACTS_ENTREPRISES,
                    page_size: 100
                });
                
                companiesData = response.results.map(transformNotionCompany);
            } else {
                // Use mock data for testing
                companiesData = generateMockCompanies();
            }
            
            console.log(`✅ Loaded ${companiesData.length} companies`);
        } catch (error) {
            console.error('❌ Error loading companies:', error);
            companiesData = generateMockCompanies();
        }
    };

    // Transform Notion company data
    const transformNotionCompany = function(notionPage) {
        const props = notionPage.properties;
        
        return {
            id: notionPage.id,
            name: props['Nom']?.title?.[0]?.plain_text || 'Sans nom',
            ide: props['IDE']?.rich_text?.[0]?.plain_text || '',
            sector: props['Secteur']?.select?.name || 'Non défini',
            revenue: props['CA Estimé']?.number || 0,
            score: calculateScore(props),
            entity: props['Entité']?.relation?.map(r => r.id) || [],
            entityNames: props['Entité Names']?.rollup?.array?.map(e => e.title?.[0]?.plain_text) || [],
            responsible: props['Responsable']?.people?.[0]?.name || 'Non assigné',
            lastInteraction: props['Dernière Interaction']?.date?.start || null,
            status: props['Statut']?.select?.name || 'Prospect',
            address: {
                street: props['Adresse']?.rich_text?.[0]?.plain_text || '',
                npa: props['NPA']?.number || '',
                city: props['Ville']?.rich_text?.[0]?.plain_text || '',
                canton: props['Canton']?.select?.name || ''
            },
            contact: {
                phone: props['Téléphone']?.phone_number || '',
                email: props['Email']?.email || '',
                website: props['Site Web']?.url || ''
            },
            notes: props['Notes']?.rich_text?.[0]?.plain_text || '',
            createdAt: notionPage.created_time,
            updatedAt: notionPage.last_edited_time
        };
    };

    // Calculate company score
    const calculateScore = function(props) {
        let score = 50; // Base score
        
        // Revenue impact
        const revenue = props['CA Estimé']?.number || 0;
        if (revenue > 10000000) score += 30;
        else if (revenue > 5000000) score += 20;
        else if (revenue > 1000000) score += 10;
        
        // Status impact
        const status = props['Statut']?.select?.name;
        if (status === 'Client') score += 15;
        else if (status === 'En cours') score += 5;
        
        // Interaction recency
        const lastInteraction = props['Dernière Interaction']?.date?.start;
        if (lastInteraction) {
            const daysSince = Math.floor((new Date() - new Date(lastInteraction)) / (1000 * 60 * 60 * 24));
            if (daysSince < 30) score += 10;
            else if (daysSince < 90) score += 5;
        }
        
        return Math.min(100, score);
    };

    // Generate mock companies for testing
    const generateMockCompanies = function() {
        const companies = [
            {
                id: '1',
                name: 'Rolex SA',
                ide: 'CHE-100.123.456',
                sector: 'Luxe & Horlogerie',
                revenue: 15000000,
                score: 95,
                entity: ['hypervisual'],
                entityNames: ['Hypervisual'],
                responsible: 'Marie Dubois',
                lastInteraction: '2024-01-10',
                status: 'Client',
                address: {
                    street: 'Rue François-Dussaud 3',
                    npa: '1211',
                    city: 'Genève',
                    canton: 'GE'
                },
                contact: {
                    phone: '+41 22 302 22 00',
                    email: 'contact@rolex.com',
                    website: 'https://www.rolex.com'
                },
                notes: 'Client stratégique - Renouvellement contrat Q2 2024'
            },
            {
                id: '2',
                name: 'Nestlé Suisse SA',
                ide: 'CHE-200.456.789',
                sector: 'Agroalimentaire',
                revenue: 25000000,
                score: 90,
                entity: ['dainamics', 'lexaia'],
                entityNames: ['Dainamics', 'Lexaia'],
                responsible: 'Paul Martin',
                lastInteraction: '2024-01-08',
                status: 'Client',
                address: {
                    street: 'Avenue Nestlé 55',
                    npa: '1800',
                    city: 'Vevey',
                    canton: 'VD'
                },
                contact: {
                    phone: '+41 21 924 21 11',
                    email: 'info@nestle.ch',
                    website: 'https://www.nestle.ch'
                },
                notes: 'Projet IA en cours - Budget 500k CHF'
            },
            {
                id: '3',
                name: 'UBS Group AG',
                ide: 'CHE-300.789.012',
                sector: 'Finance & Banque',
                revenue: 50000000,
                score: 85,
                entity: ['hypervisual', 'dainamics', 'lexaia'],
                entityNames: ['Hypervisual', 'Dainamics', 'Lexaia'],
                responsible: 'Sophie Laurent',
                lastInteraction: '2024-01-05',
                status: 'En cours',
                address: {
                    street: 'Bahnhofstrasse 45',
                    npa: '8001',
                    city: 'Zurich',
                    canton: 'ZH'
                },
                contact: {
                    phone: '+41 44 234 11 11',
                    email: 'corporate@ubs.com',
                    website: 'https://www.ubs.com'
                },
                notes: 'RFP en cours pour transformation digitale'
            }
        ];

        // Add more mock companies
        const additionalCompanies = [
            { name: 'Swatch Group', ide: 'CHE-400.123.456', sector: 'Luxe & Horlogerie', canton: 'BE' },
            { name: 'Roche Holding', ide: 'CHE-500.234.567', sector: 'Pharma & Santé', canton: 'BS' },
            { name: 'ABB Suisse', ide: 'CHE-600.345.678', sector: 'Industrie & Tech', canton: 'ZH' },
            { name: 'Migros', ide: 'CHE-700.456.789', sector: 'Retail & Distribution', canton: 'ZH' },
            { name: 'Coop', ide: 'CHE-800.567.890', sector: 'Retail & Distribution', canton: 'BS' },
            { name: 'Swiss Re', ide: 'CHE-900.678.901', sector: 'Assurance', canton: 'ZH' },
            { name: 'Glencore', ide: 'CHE-100.789.012', sector: 'Matières premières', canton: 'ZG' }
        ];

        additionalCompanies.forEach((company, index) => {
            companies.push({
                id: `${companies.length + 1}`,
                name: company.name,
                ide: company.ide,
                sector: company.sector,
                revenue: Math.floor(Math.random() * 20000000) + 1000000,
                score: Math.floor(Math.random() * 40) + 50,
                entity: [['hypervisual'], ['dainamics'], ['enki'], ['takeout'], ['lexaia']][Math.floor(Math.random() * 5)],
                entityNames: [['Hypervisual'], ['Dainamics'], ['Enki Reality'], ['Takeout'], ['Lexaia']][Math.floor(Math.random() * 5)],
                responsible: ['Marie Dubois', 'Paul Martin', 'Sophie Laurent', 'Thomas Müller'][Math.floor(Math.random() * 4)],
                lastInteraction: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: ['Client', 'En cours', 'Prospect'][Math.floor(Math.random() * 3)],
                address: {
                    street: `Rue Example ${index + 1}`,
                    npa: `${Math.floor(Math.random() * 9000) + 1000}`,
                    city: ['Genève', 'Zurich', 'Bâle', 'Lausanne', 'Berne'][Math.floor(Math.random() * 5)],
                    canton: company.canton
                },
                contact: {
                    phone: `+41 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
                    email: `contact@${company.name.toLowerCase().replace(/\s+/g, '')}.ch`,
                    website: `https://www.${company.name.toLowerCase().replace(/\s+/g, '')}.ch`
                },
                notes: ''
            });
        });

        return companies;
    };

    // Initialize DataTable
    const initializeDataTable = function() {
        if ($.fn.DataTable.isDataTable('#companies-table')) {
            $('#companies-table').DataTable().destroy();
        }

        dataTable = $('#companies-table').DataTable({
            data: companiesData,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/fr-FR.json'
            },
            columns: [
                {
                    data: 'name',
                    render: function(data, type, row) {
                        return `
                            <div class="d-flex align-items-center">
                                <div>
                                    <div class="fw-bold">${data}</div>
                                    <div class="text-secondary small">${row.ide || 'Pas d\'IDE'}</div>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    data: 'entityNames',
                    render: function(data) {
                        return data.map(entity => {
                            const colors = {
                                'Hypervisual': 'blue',
                                'Dainamics': 'green',
                                'Enki Reality': 'purple',
                                'Takeout': 'orange',
                                'Lexaia': 'red'
                            };
                            return `<span class="badge bg-${colors[entity] || 'secondary'}-lt">${entity}</span>`;
                        }).join(' ');
                    }
                },
                {
                    data: 'sector',
                    render: function(data) {
                        return `<span class="text-secondary">${data}</span>`;
                    }
                },
                {
                    data: 'revenue',
                    render: function(data) {
                        return `<span class="ca-amount">CHF ${formatSwissAmount(data)}</span>`;
                    }
                },
                {
                    data: 'score',
                    render: function(data) {
                        let badge = 'C';
                        let badgeClass = 'score-c';
                        
                        if (data >= 90) {
                            badge = 'A+';
                            badgeClass = 'score-a-plus';
                        } else if (data >= 80) {
                            badge = 'A';
                            badgeClass = 'score-a';
                        } else if (data >= 60) {
                            badge = 'B';
                            badgeClass = 'score-b';
                        }
                        
                        return `<span class="score-badge ${badgeClass}">${badge} (${data})</span>`;
                    }
                },
                {
                    data: 'responsible',
                    render: function(data) {
                        return `<span class="text-secondary">${data}</span>`;
                    }
                },
                {
                    data: 'lastInteraction',
                    render: function(data) {
                        if (!data) return '<span class="text-secondary">Jamais</span>';
                        
                        const date = new Date(data);
                        const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
                        
                        let color = 'green';
                        if (days > 30) color = 'yellow';
                        if (days > 60) color = 'red';
                        
                        return `
                            <div>
                                <span class="text-${color}">${formatDate(data)}</span>
                                <div class="small text-secondary">Il y a ${days} jours</div>
                            </div>
                        `;
                    }
                },
                {
                    data: null,
                    orderable: false,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group">
                                <button class="btn btn-sm btn-white" onclick="CompaniesManagerSuperadmin.viewCompany('${row.id}')" title="Voir les détails">
                                    <i class="ti ti-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-white" onclick="CompaniesManagerSuperadmin.quickEdit('${row.id}')" title="Édition rapide">
                                    <i class="ti ti-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-white" onclick="CompaniesManagerSuperadmin.enrichCompany('${row.id}')" title="Enrichir les données">
                                    <i class="ti ti-refresh"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            order: [[4, 'desc']], // Sort by score
            pageLength: 25,
            dom: 'rtip',
            drawCallback: function() {
                updateStatistics();
            }
        });
    };

    // Initialize event handlers
    const initializeEventHandlers = function() {
        // Filters
        $('#filter-entity').on('change', function() {
            currentFilters.entity = $(this).val();
            applyFilters();
        });

        $('#filter-score').on('change', function() {
            currentFilters.score = $(this).val();
            applyFilters();
        });

        $('#filter-status').on('change', function() {
            currentFilters.status = $(this).val();
            applyFilters();
        });

        $('#search-global').on('keyup', function() {
            currentFilters.search = $(this).val();
            applyFilters();
        });

        // Quick edit form
        $('#form-quick-edit').on('submit', async function(e) {
            e.preventDefault();
            await saveQuickEdit();
        });
    };

    // Apply filters to DataTable
    const applyFilters = function() {
        if (!dataTable) return;

        // Custom search function
        $.fn.dataTable.ext.search.pop(); // Remove previous custom search
        
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            const company = companiesData[dataIndex];
            
            // Entity filter
            if (currentFilters.entity && !company.entityNames.includes(currentFilters.entity)) {
                return false;
            }
            
            // Score filter
            if (currentFilters.score) {
                const score = company.score;
                switch (currentFilters.score) {
                    case 'A+':
                        if (score < 90) return false;
                        break;
                    case 'A':
                        if (score < 80 || score >= 90) return false;
                        break;
                    case 'B':
                        if (score < 60 || score >= 80) return false;
                        break;
                    case 'C':
                        if (score >= 60) return false;
                        break;
                }
            }
            
            // Status filter
            if (currentFilters.status && company.status !== currentFilters.status) {
                return false;
            }
            
            // Global search
            if (currentFilters.search) {
                const searchLower = currentFilters.search.toLowerCase();
                const searchableText = `${company.name} ${company.ide} ${company.sector} ${company.address.city}`.toLowerCase();
                if (!searchableText.includes(searchLower)) {
                    return false;
                }
            }
            
            return true;
        });

        dataTable.draw();
    };

    // Update statistics
    const updateStatistics = function() {
        const stats = {
            hypervisual: { count: 0, total: 0 },
            dainamics: { count: 0, total: 0 },
            enki: { count: 0, total: 0 },
            takeout: { count: 0, total: 0 },
            lexaia: { count: 0, total: 0 },
            total: { count: 0, total: 0 }
        };

        // Calculate stats from filtered data
        const filteredData = dataTable ? dataTable.rows({ search: 'applied' }).data().toArray() : companiesData;
        
        filteredData.forEach(company => {
            stats.total.count++;
            stats.total.total += company.revenue;

            company.entityNames.forEach(entity => {
                const key = entity.toLowerCase().replace(' reality', '').replace(' shops', '').replace(' ventures', '');
                if (stats[key]) {
                    stats[key].count++;
                    stats[key].total += company.revenue;
                }
            });
        });

        // Update UI
        $('#companies-count').text(`${stats.total.count} entreprises`);
        $('#total-ca').text(`CHF ${formatSwissAmount(stats.total.total)}`);

        // Update entity stats
        Object.keys(stats).forEach(entity => {
            if (entity !== 'total') {
                $(`#stat-${entity}-count`).text(stats[entity].count);
                $(`#stat-${entity}-total`).text(`CHF ${formatSwissAmount(stats[entity].total)}`);
                $(`#stat-${entity}-avg`).text(`CHF ${formatSwissAmount(stats[entity].count > 0 ? Math.round(stats[entity].total / stats[entity].count) : 0)}`);
                
                const percentage = stats.total.total > 0 ? (stats[entity].total / stats.total.total * 100) : 0;
                $(`#stat-${entity}-progress`).css('width', `${percentage}%`);
            }
        });

        $('#stat-total-count').text(stats.total.count);
        $('#stat-total-total').text(`CHF ${formatSwissAmount(stats.total.total)}`);
        $('#stat-total-avg').text(`CHF ${formatSwissAmount(stats.total.count > 0 ? Math.round(stats.total.total / stats.total.count) : 0)}`);
    };

    // Format Swiss amount
    const formatSwissAmount = function(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    };

    // Format date
    const formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // View company details
    const viewCompany = function(companyId) {
        const company = companiesData.find(c => c.id === companyId);
        if (!company) return;

        // Redirect to company detail page or show modal
        window.location.href = `company-detail.html?id=${companyId}`;
    };

    // Quick edit company
    const quickEdit = function(companyId) {
        const company = companiesData.find(c => c.id === companyId);
        if (!company) return;

        $('#edit-company-id').val(company.id);
        $('#edit-company-name').val(company.name);
        $('#edit-score').val(company.score);
        $('#edit-notes').val(company.notes);

        $('#modal-quick-edit').modal('show');
    };

    // Save quick edit
    const saveQuickEdit = async function() {
        const companyId = $('#edit-company-id').val();
        const score = parseInt($('#edit-score').val());
        const notes = $('#edit-notes').val();

        try {
            if (typeof window.mcp_notion !== 'undefined') {
                await window.mcp_notion.update_page({
                    page_id: companyId,
                    properties: {
                        'Score': { number: score },
                        'Notes': { rich_text: [{ text: { content: notes } }] }
                    }
                });
            }

            // Update local data
            const company = companiesData.find(c => c.id === companyId);
            if (company) {
                company.score = score;
                company.notes = notes;
                dataTable.row($(`#companies-table tr:has(button[onclick*="${companyId}"])`)).data(company).draw();
            }

            $('#modal-quick-edit').modal('hide');
            
            // Show success notification
            Swal.fire({
                icon: 'success',
                title: 'Modifications enregistrées',
                text: 'Les informations ont été mises à jour avec succès.',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error saving quick edit:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de sauvegarder les modifications.'
            });
        }
    };

    // Enrich company data
    const enrichCompany = async function(companyId) {
        const company = companiesData.find(c => c.id === companyId);
        if (!company || !company.ide) {
            Swal.fire({
                icon: 'warning',
                title: 'IDE manquant',
                text: 'Cette entreprise n\'a pas de numéro IDE pour l\'enrichissement.'
            });
            return;
        }

        try {
            // Show loading
            Swal.fire({
                title: 'Enrichissement en cours...',
                text: 'Récupération des données depuis Zefix',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Simulate Zefix API call (in production, use real API)
            const enrichedData = await simulateZefixEnrichment(company.ide);

            if (enrichedData) {
                // Update company data
                Object.assign(company, enrichedData);

                // Update in Notion
                if (typeof window.mcp_notion !== 'undefined') {
                    await window.mcp_notion.update_page({
                        page_id: company.id,
                        properties: {
                            'Forme Juridique': { select: { name: enrichedData.legalForm } },
                            'Date Fondation': { date: { start: enrichedData.foundedDate } },
                            'Capital Social': { number: enrichedData.shareCapital },
                            'Nombre Employés': { select: { name: enrichedData.employeeRange } },
                            'Adresse': { rich_text: [{ text: { content: enrichedData.address.street } }] },
                            'NPA': { number: parseInt(enrichedData.address.npa) },
                            'Ville': { rich_text: [{ text: { content: enrichedData.address.city } }] }
                        }
                    });
                }

                // Update DataTable
                dataTable.row($(`#companies-table tr:has(button[onclick*="${companyId}"])`)).data(company).draw();

                Swal.fire({
                    icon: 'success',
                    title: 'Enrichissement réussi',
                    html: `
                        <div class="text-start">
                            <p><strong>Données mises à jour :</strong></p>
                            <ul>
                                <li>Forme juridique : ${enrichedData.legalForm}</li>
                                <li>Date de fondation : ${formatDate(enrichedData.foundedDate)}</li>
                                <li>Capital social : CHF ${formatSwissAmount(enrichedData.shareCapital)}</li>
                                <li>Employés : ${enrichedData.employeeRange}</li>
                            </ul>
                        </div>
                    `
                });
            }

        } catch (error) {
            console.error('Error enriching company:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur d\'enrichissement',
                text: 'Impossible de récupérer les données depuis Zefix.'
            });
        }
    };

    // Simulate Zefix enrichment (replace with real API in production)
    const simulateZefixEnrichment = async function(ide) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return enriched data based on IDE
        const enrichments = {
            'CHE-100.123.456': {
                legalForm: 'SA',
                foundedDate: '1905-05-01',
                shareCapital: 50000000,
                employeeRange: '1000+',
                address: {
                    street: 'Rue François-Dussaud 3-5-7',
                    npa: '1211',
                    city: 'Genève 26'
                }
            },
            'CHE-200.456.789': {
                legalForm: 'SA',
                foundedDate: '1866-09-01',
                shareCapital: 100000000,
                employeeRange: '10000+',
                address: {
                    street: 'Avenue Nestlé 55',
                    npa: '1800',
                    city: 'Vevey'
                }
            },
            'CHE-300.789.012': {
                legalForm: 'AG',
                foundedDate: '1998-06-29',
                shareCapital: 385000000,
                employeeRange: '10000+',
                address: {
                    street: 'Bahnhofstrasse 45',
                    npa: '8001',
                    city: 'Zürich'
                }
            }
        };

        // Return enriched data or generate random
        return enrichments[ide] || {
            legalForm: ['SA', 'Sàrl', 'AG', 'GmbH'][Math.floor(Math.random() * 4)],
            foundedDate: new Date(2000 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
            shareCapital: Math.floor(Math.random() * 10) * 100000 + 100000,
            employeeRange: ['1-10', '11-50', '51-250', '250-1000', '1000+'][Math.floor(Math.random() * 5)],
            address: {
                street: `Rue Example ${Math.floor(Math.random() * 100)}`,
                npa: `${Math.floor(Math.random() * 9000) + 1000}`,
                city: ['Genève', 'Zurich', 'Bâle', 'Lausanne', 'Berne'][Math.floor(Math.random() * 5)]
            }
        };
    };

    // Validate Swiss IDE number
    const validateIDE = function(ide) {
        // Swiss IDE format: CHE-XXX.XXX.XXX
        const idePattern = /^CHE-\d{3}\.\d{3}\.\d{3}$/;
        
        if (!idePattern.test(ide)) {
            return { valid: false, message: 'Format IDE invalide. Format attendu: CHE-XXX.XXX.XXX' };
        }

        // Extract numbers and calculate checksum
        const numbers = ide.replace(/[^0-9]/g, '');
        const weights = [5, 4, 3, 2, 7, 6, 5, 4];
        let sum = 0;

        for (let i = 0; i < 8; i++) {
            sum += parseInt(numbers[i]) * weights[i];
        }

        const checkDigit = (11 - (sum % 11)) % 11;
        const lastDigit = parseInt(numbers[8]);

        if (checkDigit === lastDigit) {
            return { valid: true, message: 'IDE valide' };
        } else {
            return { valid: false, message: 'Checksum IDE invalide' };
        }
    };

    // Export to CSV
    const exportToCSV = function() {
        const csvData = [];
        const headers = ['Entreprise', 'IDE', 'Secteur', 'CA Estimé', 'Score', 'Entités', 'Responsable', 'Statut', 'Ville', 'Canton'];
        csvData.push(headers.join(';'));

        const filteredData = dataTable ? dataTable.rows({ search: 'applied' }).data().toArray() : companiesData;
        
        filteredData.forEach(company => {
            const row = [
                company.name,
                company.ide || '',
                company.sector,
                company.revenue,
                company.score,
                company.entityNames.join(', '),
                company.responsible,
                company.status,
                company.address.city,
                company.address.canton
            ];
            csvData.push(row.map(value => `"${value}"`).join(';'));
        });

        // Create and download file
        const csvContent = '\ufeff' + csvData.join('\n'); // UTF-8 BOM
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `entreprises_crm_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Refresh data from Notion
    const refreshData = async function() {
        Swal.fire({
            title: 'Actualisation en cours...',
            text: 'Récupération des données depuis Notion',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        await loadCompaniesFromNotion();
        dataTable.clear().rows.add(companiesData).draw();
        updateStatistics();

        Swal.fire({
            icon: 'success',
            title: 'Données actualisées',
            text: `${companiesData.length} entreprises chargées`,
            timer: 2000,
            showConfirmButton: false
        });
    };

    // Public API
    return {
        init: init,
        viewCompany: viewCompany,
        quickEdit: quickEdit,
        enrichCompany: enrichCompany,
        validateIDE: validateIDE,
        exportToCSV: exportToCSV,
        refreshData: refreshData
    };

})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof CompaniesManagerSuperadmin !== 'undefined') {
        CompaniesManagerSuperadmin.init();
    }
});

// Also make it available globally for the HTML file
window.CompaniesManagerSuperadmin = CompaniesManagerSuperadmin;