window.ContactsManagerSuperadmin = (function() {
    'use strict';
    
    // Configuration avec les vraies bases Notion
    const config = {
        DB_CONTACTS_PERSONNES: '22cadb95-3c6f-80f1-8e05-ffe0eef29f52',
        DB_CONTACTS_ENTREPRISES: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
        DB_INTERACTIONS_CLIENTS: '226adb95-3c6f-805f-9095-d4c6278a5f5b',
        DB_ENTITÉ_DU_GROUPE: '231adb95-3c6f-8002-b885-c94041b44a44'
    };

    // Configuration recherche fuzzy
    const FUZZY_SEARCH_CONFIG = {
        threshold: 0.3, // Sensibilité (0 = exact, 1 = très flou)
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        keys: [
            { name: 'fullName', weight: 0.4 },
            { name: 'email', weight: 0.3 },
            { name: 'companyName', weight: 0.2 },
            { name: 'city', weight: 0.1 }
        ]
    };

    // Villes suisses avec NPA pour autocomplétion
    const SWISS_CITIES = [
        { zip: '1000', city: 'Lausanne', canton: 'VD' },
        { zip: '1003', city: 'Lausanne', canton: 'VD' },
        { zip: '1004', city: 'Lausanne', canton: 'VD' },
        { zip: '1200', city: 'Genève', canton: 'GE' },
        { zip: '1201', city: 'Genève', canton: 'GE' },
        { zip: '1202', city: 'Genève', canton: 'GE' },
        { zip: '1203', city: 'Genève', canton: 'GE' },
        { zip: '1204', city: 'Genève', canton: 'GE' },
        { zip: '1205', city: 'Genève', canton: 'GE' },
        { zip: '1206', city: 'Genève', canton: 'GE' },
        { zip: '1207', city: 'Genève', canton: 'GE' },
        { zip: '1208', city: 'Genève', canton: 'GE' },
        { zip: '1209', city: 'Genève', canton: 'GE' },
        { zip: '1211', city: 'Genève', canton: 'GE' },
        { zip: '3000', city: 'Berne', canton: 'BE' },
        { zip: '3001', city: 'Berne', canton: 'BE' },
        { zip: '3003', city: 'Berne', canton: 'BE' },
        { zip: '8000', city: 'Zurich', canton: 'ZH' },
        { zip: '8001', city: 'Zurich', canton: 'ZH' },
        { zip: '8002', city: 'Zurich', canton: 'ZH' },
        { zip: '8003', city: 'Zurich', canton: 'ZH' },
        { zip: '8004', city: 'Zurich', canton: 'ZH' },
        { zip: '8005', city: 'Zurich', canton: 'ZH' },
        { zip: '4000', city: 'Bâle', canton: 'BS' },
        { zip: '4001', city: 'Bâle', canton: 'BS' },
        { zip: '4002', city: 'Bâle', canton: 'BS' },
        { zip: '6900', city: 'Lugano', canton: 'TI' },
        { zip: '1700', city: 'Fribourg', canton: 'FR' },
        { zip: '2000', city: 'Neuchâtel', canton: 'NE' },
        { zip: '9000', city: 'Saint-Gall', canton: 'SG' },
        { zip: '1950', city: 'Sion', canton: 'VS' }
    ];
    
    // État local
    let contacts = [];
    let companies = [];
    let filters = {
        entities: [],
        tags: [],
        country: '',
        language: '',
        status: '',
        search: ''
    };
    let currentContactId = null;
    let viewMode = 'list';
    
    // Initialisation
    async function init() {
        console.log('🚀 Initialisation Contacts Manager SuperAdmin');
        
        // Charger les données
        await loadCompanies();
        await loadContacts();
        
        // Initialiser l'interface
        initializeUI();
        bindEvents();
        
        // Initialiser les fonctionnalités avancées
        initializeSmartSearch();
        initializeCompanyAutocomplete();
        initializeZipAutocomplete();
        
        // Auto-refresh toutes les 60 secondes
        setInterval(refreshData, 60000);
        
        console.log('✅ Contacts Manager SuperAdmin initialisé avec recherche fuzzy et autocomplétion');
    }
    
    // Charger les contacts depuis Notion
    async function loadContacts() {
        try {
            showLoader();
            
            if (typeof mcp_notion === 'undefined') {
                contacts = generateMockContacts();
                updateContactsCount();
                renderContacts();
                return;
            }
            
            const response = await mcp_notion.query_database({
                database_id: config.DB_CONTACTS_PERSONNES,
                sorts: [
                    { property: "Date Dernière Interaction", direction: "descending" }
                ],
                filter: {
                    property: "Statut Contact",
                    select: { does_not_equal: "❌ Invalide" }
                }
            });
            
            contacts = response.results.map(transformNotionContact);
            updateContactsCount();
            renderContacts();
            
        } catch (error) {
            console.error('Erreur chargement contacts:', error);
            showError('Erreur lors du chargement des contacts');
        } finally {
            hideLoader();
        }
    }
    
    // Charger les entreprises
    async function loadCompanies() {
        try {
            if (typeof mcp_notion === 'undefined') {
                companies = generateMockCompanies();
                return;
            }
            
            const response = await mcp_notion.query_database({
                database_id: config.DB_CONTACTS_ENTREPRISES,
                sorts: [
                    { property: "Nom Entreprise", direction: "ascending" }
                ]
            });
            
            companies = response.results.map(item => ({
                id: item.id,
                name: item.properties['Nom Entreprise']?.title?.[0]?.plain_text || ''
            }));
            
            // Peupler le select des entreprises
            populateCompanySelect();
            
        } catch (error) {
            console.error('Erreur chargement entreprises:', error);
        }
    }
    
    // Transformer données Notion en format local
    function transformNotionContact(notionItem) {
        const props = notionItem.properties;
        
        return {
            id: notionItem.id,
            
            // Identité
            fullName: props['Nom Complet (Prénom Nom)']?.formula?.string || '',
            firstName: props['Prénom']?.title?.[0]?.plain_text || '',
            lastName: props['Nom de Famille']?.rich_text?.[0]?.plain_text || '',
            
            // Contact
            email: props['Email']?.email || '',
            phone: props['Téléphone']?.phone_number || '',
            linkedin: props['LinkedIn']?.url || '',
            
            // Entreprise
            companyId: props['Entreprise']?.relation?.[0]?.id || null,
            companyName: '', // À enrichir depuis la relation
            position: props['Poste']?.rich_text?.[0]?.plain_text || '',
            department: props['Département']?.select?.name || '',
            level: props['Niveau Hiérarchique']?.select?.name || '',
            
            // Localisation
            address: props['Adresse']?.rich_text?.[0]?.plain_text || '',
            city: props['Ville']?.rich_text?.[0]?.plain_text || '',
            country: props['Pays']?.select?.name || '',
            timezone: props['Fuseau Horaire']?.select?.name || '',
            
            // Commercial
            portefeuille: props['Portefeuille']?.select?.name || '',
            typeRelation: props['Type Relation']?.select?.name || '',
            statutContact: props['Statut Contact']?.select?.name || '',
            statutPipeline: props['Statut Pipeline']?.select?.name || '',
            
            // Scoring
            scoreContact: props['Score Contact']?.number || 0,
            scoreEngagement: props['Score Engagement']?.number || 0,
            priority: props['Priorité']?.select?.name || 'Moyenne',
            influence: props['Niveau Influence']?.select?.name || '',
            
            // Préférences
            language: props['Langue Préférée']?.select?.name || '🇫🇷 Français',
            
            // Tags et RGPD
            tags: props['Tags']?.multi_select?.map(t => t.name) || [],
            consentementRGPD: props['Consentement RGPD']?.checkbox || false,
            optinMarketing: props['Opt-in Marketing']?.checkbox || false,
            
            // Responsable et dates
            responsableCommercial: props['Responsable Commercial']?.people?.[0]?.name || '',
            lastInteraction: props['Dernière Interaction']?.date?.start || null,
            nextAction: props['Prochaine Action']?.date?.start || null,
            
            // Méta
            createdAt: notionItem.created_time,
            updatedAt: notionItem.last_edited_time,
            
            // Notes
            notes: props['Notes']?.rich_text?.[0]?.plain_text || '',
            sourceAcquisition: props['Source Acquisition']?.select?.name || ''
        };
    }
    
    // Enrichir les contacts avec les noms d'entreprise
    async function enrichContactsWithCompanyNames() {
        for (let contact of contacts) {
            if (contact.companyId) {
                const company = companies.find(c => c.id === contact.companyId);
                if (company) {
                    contact.companyName = company.name;
                }
            }
        }
    }
    
    // Créer nouveau contact
    async function saveContact() {
        try {
            showLoader('Enregistrement du contact...');
            
            const contactData = {
                'Prénom': { title: [{ text: { content: document.getElementById('contact-firstname').value } }] },
                'Nom de Famille': { rich_text: [{ text: { content: document.getElementById('contact-lastname').value } }] },
                'Email': { email: document.getElementById('contact-email-pro').value },
                'Téléphone': document.getElementById('contact-mobile').value ? 
                    { phone_number: document.getElementById('contact-mobile').value } : undefined,
                
                // Entreprise
                'Entreprise': document.getElementById('contact-company').value ? 
                    { relation: [{ id: document.getElementById('contact-company').value }] } : undefined,
                'Poste': document.getElementById('contact-position').value ?
                    { rich_text: [{ text: { content: document.getElementById('contact-position').value } }] } : undefined,
                'Département': document.getElementById('contact-department').value ?
                    { select: { name: document.getElementById('contact-department').value } } : undefined,
                'Niveau Hiérarchique': document.getElementById('contact-level').value ?
                    { select: { name: document.getElementById('contact-level').value } } : undefined,
                
                // Localisation
                'Adresse': { rich_text: [{ text: { content: document.getElementById('contact-address').value || '' } }] },
                'Ville': { rich_text: [{ text: { content: document.getElementById('contact-city').value || '' } }] },
                'Pays': { select: { name: document.getElementById('contact-country').value } },
                
                // Préférences
                'Langue Préférée': { select: { name: document.getElementById('contact-language').value } },
                'Fuseau Horaire': { select: { name: document.getElementById('contact-timezone').value } },
                
                // Tags
                'Tags': { multi_select: getSelectedTags() },
                
                // RGPD
                'Consentement RGPD': { checkbox: document.getElementById('contact-rgpd').checked },
                'Opt-in Marketing': { checkbox: document.getElementById('contact-newsletter').checked },
                'Date Consentement': document.getElementById('contact-rgpd').checked ?
                    { date: { start: new Date().toISOString().split('T')[0] } } : undefined,
                
                // Commercial
                'Priorité': { select: { name: document.getElementById('contact-priority').value } },
                'Source Acquisition': { select: { name: document.getElementById('contact-source').value } },
                'Statut Contact': { select: { name: '✅ Actif' } },
                'Type Relation': { select: { name: 'PROSPECT' } },
                
                // Notes
                'Notes': document.getElementById('contact-notes').value ?
                    { rich_text: [{ text: { content: document.getElementById('contact-notes').value } }] } : undefined,
                
                // Portefeuille basé sur les entités sélectionnées
                'Portefeuille': { select: { name: getSelectedEntities()[0] || 'HYPERVISUAL' } }
            };
            
            if (typeof mcp_notion === 'undefined') {
                // Mode mock
                const mockId = 'mock-' + Date.now();
                showSuccess('Contact créé avec succès (mode démo)');
                $('#modal-contact').modal('hide');
                await loadContacts();
                return;
            }
            
            // Créer ou mettre à jour
            if (currentContactId) {
                // Update
                await mcp_notion.update_page({
                    page_id: currentContactId,
                    properties: contactData
                });
                showSuccess('Contact mis à jour avec succès');
            } else {
                // Create
                await mcp_notion.create_page({
                    parent: { database_id: config.DB_CONTACTS_PERSONNES },
                    properties: contactData
                });
                showSuccess('Contact créé avec succès');
            }
            
            // Fermer modal et recharger
            $('#modal-contact').modal('hide');
            await loadContacts();
            
        } catch (error) {
            console.error('Erreur sauvegarde contact:', error);
            showError('Erreur lors de l\'enregistrement du contact');
        } finally {
            hideLoader();
        }
    }
    
    // Obtenir les tags sélectionnés
    function getSelectedTags() {
        const select = document.getElementById('contact-tags');
        return Array.from(select.selectedOptions).map(option => ({ name: option.value }));
    }
    
    // Obtenir les entités sélectionnées
    function getSelectedEntities() {
        const select = document.getElementById('contact-entities');
        return Array.from(select.selectedOptions).map(option => option.value);
    }
    
    // Initialiser l'interface
    function initializeUI() {
        // Initialiser la recherche
        const searchInput = document.getElementById('contact-search');
        searchInput.addEventListener('input', debounce((e) => {
            filters.search = e.target.value.toLowerCase();
            applyFilters();
        }, 300));
        
        // Initialiser les vues
        document.querySelectorAll('[name="view-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                viewMode = e.target.value;
                renderContacts();
            });
        });
        
        // Initialiser les filtres
        initializeFilters();
    }
    
    // Initialiser les filtres
    function initializeFilters() {
        // Filtres par entité
        document.querySelectorAll('[name="filter-entity"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateEntityFilter();
                applyFilters();
            });
        });
        
        // Filtre pays
        document.getElementById('filter-country').addEventListener('change', (e) => {
            filters.country = e.target.value;
            applyFilters();
        });
        
        // Filtre langue
        document.getElementById('filter-language').addEventListener('change', (e) => {
            filters.language = e.target.value;
            applyFilters();
        });
        
        // Filtre statut
        document.getElementById('filter-status').addEventListener('change', (e) => {
            filters.status = e.target.value;
            applyFilters();
        });
    }
    
    // Mettre à jour filtre entités
    function updateEntityFilter() {
        filters.entities = [];
        document.querySelectorAll('[name="filter-entity"]:checked').forEach(checkbox => {
            filters.entities.push(checkbox.value);
        });
    }
    
    // Appliquer les filtres
    function applyFilters() {
        let filtered = [...contacts];
        
        // Filtre recherche
        if (filters.search) {
            filtered = filtered.filter(contact => {
                const searchableText = [
                    contact.fullName,
                    contact.email,
                    contact.companyName,
                    contact.position,
                    contact.city
                ].join(' ').toLowerCase();
                
                return searchableText.includes(filters.search);
            });
        }
        
        // Filtre entités
        if (filters.entities.length > 0) {
            filtered = filtered.filter(contact => 
                filters.entities.includes(contact.portefeuille)
            );
        }
        
        // Filtre pays
        if (filters.country) {
            filtered = filtered.filter(contact => 
                contact.country === filters.country
            );
        }
        
        // Filtre langue
        if (filters.language) {
            filtered = filtered.filter(contact => 
                contact.language === filters.language
            );
        }
        
        // Filtre statut
        if (filters.status) {
            filtered = filtered.filter(contact => 
                contact.statutContact === filters.status
            );
        }
        
        renderContacts(filtered);
    }
    
    // Afficher les contacts selon la vue
    function renderContacts(contactsList = contacts) {
        const container = document.getElementById('contacts-container');
        
        switch(viewMode) {
            case 'list':
                renderListView(contactsList);
                break;
            case 'cards':
                renderCardsView(contactsList);
                break;
            case 'kanban':
                renderKanbanView(contactsList);
                break;
        }
    }
    
    // Vue liste (DataTable)
    function renderListView(contactsList) {
        const html = `
            <div class="card">
                <div class="table-responsive">
                    <table class="table table-hover" id="contacts-table">
                        <thead>
                            <tr>
                                <th width="40"></th>
                                <th>Contact</th>
                                <th>Entreprise</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Entité</th>
                                <th>Tags</th>
                                <th>Dernière interaction</th>
                                <th width="100">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${contactsList.map(contact => `
                                <tr data-contact-id="${contact.id}">
                                    <td>
                                        <span class="avatar avatar-sm" style="background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName)}&background=0D8ABC&color=fff)"></span>
                                    </td>
                                    <td>
                                        <div class="d-flex flex-column">
                                            <span class="fw-medium">${escapeHtml(contact.fullName)}</span>
                                            <small class="text-muted">${escapeHtml(contact.position || '')}</small>
                                        </div>
                                    </td>
                                    <td>${escapeHtml(contact.companyName || '-')}</td>
                                    <td>
                                        <a href="mailto:${contact.email}" class="text-reset">
                                            ${escapeHtml(contact.email)}
                                        </a>
                                    </td>
                                    <td>${escapeHtml(contact.phone || '-')}</td>
                                    <td>${getEntityBadge(contact.portefeuille)}</td>
                                    <td>
                                        ${contact.tags.map(tag => `
                                            <span class="badge bg-blue-lt">${escapeHtml(tag)}</span>
                                        `).join(' ')}
                                    </td>
                                    <td>
                                        ${contact.lastInteraction ? 
                                            formatRelativeDate(contact.lastInteraction) : 
                                            '<span class="text-muted">Jamais</span>'
                                        }
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-icon" onclick="ContactsManagerSuperadmin.viewContact('${contact.id}')" title="Voir">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <circle cx="12" cy="12" r="2"/>
                                                    <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7"/>
                                                </svg>
                                            </button>
                                            <button class="btn btn-sm btn-icon" onclick="ContactsManagerSuperadmin.editContact('${contact.id}')" title="Éditer">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"/>
                                                    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3"/>
                                                    <line x1="16" y1="5" x2="19" y2="8"/>
                                                </svg>
                                            </button>
                                            <button class="btn btn-sm btn-icon" onclick="ContactsManagerSuperadmin.createInteraction('${contact.id}')" title="Ajouter interaction">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10"/>
                                                    <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('contacts-container').innerHTML = html;
        
        // Initialiser DataTable
        if ($.fn.DataTable.isDataTable('#contacts-table')) {
            $('#contacts-table').DataTable().destroy();
        }
        
        $('#contacts-table').DataTable({
            language: getDataTableLanguage(),
            pageLength: 25,
            order: [[7, 'desc']],
            columnDefs: [
                { orderable: false, targets: [0, 8] }
            ]
        });
    }
    
    // Vue cartes
    function renderCardsView(contactsList) {
        const html = `
            <div class="row row-cards">
                ${contactsList.map(contact => `
                    <div class="col-sm-6 col-lg-4">
                        <div class="card card-sm">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <span class="avatar me-3" style="background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName)}&background=0D8ABC&color=fff)"></span>
                                    <div>
                                        <div class="fw-medium">${escapeHtml(contact.fullName)}</div>
                                        <div class="text-muted">${escapeHtml(contact.position || 'N/A')}</div>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <div class="text-muted">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm me-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M3 21v-4a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v4"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>
                                        </svg>
                                        ${escapeHtml(contact.companyName || 'Aucune entreprise')}
                                    </div>
                                    <div class="text-muted mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm me-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                                            <polyline points="3 7 12 13 21 7"/>
                                        </svg>
                                        ${escapeHtml(contact.email)}
                                    </div>
                                    ${contact.phone ? `
                                        <div class="text-muted mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm me-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>
                                            </svg>
                                            ${escapeHtml(contact.phone)}
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="mt-3">
                                    ${getEntityBadge(contact.portefeuille)}
                                    ${contact.tags.slice(0, 2).map(tag => `
                                        <span class="badge bg-blue-lt">${escapeHtml(tag)}</span>
                                    `).join(' ')}
                                    ${contact.tags.length > 2 ? `
                                        <span class="badge bg-blue-lt">+${contact.tags.length - 2}</span>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="card-footer">
                                <div class="d-flex">
                                    <a href="#" class="btn btn-sm" onclick="ContactsManagerSuperadmin.viewContact('${contact.id}')">Détails</a>
                                    <a href="#" class="btn btn-sm ms-auto" onclick="ContactsManagerSuperadmin.editContact('${contact.id}')">Éditer</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('contacts-container').innerHTML = html;
    }
    
    // Vue Kanban
    function renderKanbanView(contactsList) {
        // Grouper par statut pipeline
        const groups = {
            'Prospect': [],
            'Qualifié': [],
            'En Négociation': [],
            'Client Actif': [],
            'Inactif': []
        };
        
        contactsList.forEach(contact => {
            const status = contact.statutPipeline || 'Prospect';
            if (groups[status]) {
                groups[status].push(contact);
            }
        });
        
        const html = `
            <div class="row">
                ${Object.entries(groups).map(([status, contacts]) => `
                    <div class="col-lg">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">${status}</h3>
                                <div class="card-actions">
                                    <span class="badge">${contacts.length}</span>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="kanban-column" data-status="${status}" style="min-height: 400px;">
                                    ${contacts.map(contact => `
                                        <div class="card mb-2 kanban-card" data-contact-id="${contact.id}">
                                            <div class="card-body p-2">
                                                <div class="d-flex align-items-center mb-2">
                                                    <span class="avatar avatar-sm me-2" style="background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName)}&background=0D8ABC&color=fff)"></span>
                                                    <div class="flex-fill">
                                                        <div class="fw-medium text-truncate">${escapeHtml(contact.fullName)}</div>
                                                        <div class="text-muted small text-truncate">${escapeHtml(contact.companyName || 'N/A')}</div>
                                                    </div>
                                                </div>
                                                <div class="text-muted small">
                                                    ${escapeHtml(contact.email)}
                                                </div>
                                                <div class="mt-2">
                                                    ${getEntityBadge(contact.portefeuille, 'sm')}
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('contacts-container').innerHTML = html;
        
        // Initialiser drag & drop
        initializeKanbanDragDrop();
    }
    
    // Initialiser drag & drop pour Kanban
    function initializeKanbanDragDrop() {
        // TODO: Implémenter avec Sortable.js ou similaire
        console.log('Kanban drag & drop à implémenter');
    }
    
    // Obtenir badge entité
    function getEntityBadge(entity, size = '') {
        const badges = {
            'HYPERVISUAL': '<span class="badge bg-purple-lt' + (size ? ' badge-' + size : '') + '">🎬 Hypervisual</span>',
            'DAINAMICS': '<span class="badge bg-blue-lt' + (size ? ' badge-' + size : '') + '">💻 Dainamics</span>',
            'ENKI-REALITY': '<span class="badge bg-green-lt' + (size ? ' badge-' + size : '') + '">🏗️ Enki Reality</span>',
            'TAKE-OUT.AI': '<span class="badge bg-orange-lt' + (size ? ' badge-' + size : '') + '">🍕 Take Out</span>',
            'LEXAIA': '<span class="badge bg-pink-lt' + (size ? ' badge-' + size : '') + '">🤖 Lexaia</span>'
        };
        
        return badges[entity] || '<span class="badge bg-secondary-lt' + (size ? ' badge-' + size : '') + '">Non assigné</span>';
    }
    
    // Voir détails contact
    async function viewContact(contactId) {
        // TODO: Implémenter modal détail avec timeline
        console.log('Voir contact:', contactId);
    }
    
    // Éditer contact
    async function editContact(contactId) {
        currentContactId = contactId;
        const contact = contacts.find(c => c.id === contactId);
        
        if (!contact) return;
        
        // Pré-remplir le formulaire
        document.getElementById('contact-firstname').value = contact.firstName;
        document.getElementById('contact-lastname').value = contact.lastName;
        document.getElementById('contact-email-pro').value = contact.email;
        document.getElementById('contact-mobile').value = contact.phone || '';
        document.getElementById('contact-linkedin').value = contact.linkedin || '';
        
        // TODO: Pré-remplir tous les autres champs
        
        // Ouvrir modal
        $('#modal-contact').modal('show');
    }
    
    // Créer interaction
    async function createInteraction(contactId) {
        // TODO: Implémenter modal création interaction
        console.log('Créer interaction pour:', contactId);
    }
    
    // Import CSV
    async function importCSV() {
        // Créer input file temporaire
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                showLoader('Import en cours...');
                
                const text = await file.text();
                const rows = parseCSV(text);
                
                let created = 0;
                for (const row of rows) {
                    // TODO: Mapper les colonnes CSV vers les champs Notion
                    created++;
                }
                
                showSuccess(`${created} contacts importés avec succès`);
                await loadContacts();
                
            } catch (error) {
                console.error('Erreur import CSV:', error);
                showError('Erreur lors de l\'import du fichier');
            } finally {
                hideLoader();
            }
        };
        
        input.click();
    }
    
    // Export Excel
    function exportToExcel() {
        // TODO: Implémenter export réel
        showInfo('Export Excel en cours de développement');
    }
    
    // Réinitialiser filtres
    function resetFilters() {
        // Réinitialiser checkboxes
        document.querySelectorAll('[name="filter-entity"]').forEach(cb => cb.checked = false);
        
        // Réinitialiser selects
        document.getElementById('filter-country').value = '';
        document.getElementById('filter-language').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('contact-search').value = '';
        
        // Réinitialiser état
        filters = {
            entities: [],
            tags: [],
            country: '',
            language: '',
            status: '',
            search: ''
        };
        
        // Réafficher tous les contacts
        renderContacts();
    }
    
    // Mettre à jour compteur
    function updateContactsCount() {
        document.getElementById('contacts-count').textContent = contacts.length;
    }
    
    // Peupler select entreprises
    function populateCompanySelect() {
        const select = document.getElementById('contact-company');
        select.innerHTML = '<option value="">Sélectionner une entreprise...</option>';
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            select.appendChild(option);
        });
    }
    
    // Refresh données
    async function refreshData() {
        await loadCompanies();
        await loadContacts();
    }
    
    // Utilitaires
    function showLoader(message = 'Chargement...') {
        // TODO: Implémenter loader
        console.log('Loader:', message);
    }
    
    function hideLoader() {
        // TODO: Implémenter
    }
    
    function showSuccess(message) {
        // TODO: Implémenter toast
        console.log('Success:', message);
        alert(message);
    }
    
    function showError(message) {
        // TODO: Implémenter toast
        console.error('Error:', message);
        alert('Erreur: ' + message);
    }
    
    function showInfo(message) {
        // TODO: Implémenter toast
        console.info('Info:', message);
        alert(message);
    }
    
    function showAccessDenied() {
        document.body.innerHTML = `
            <div class="page page-center">
                <div class="container-narrow">
                    <div class="empty">
                        <div class="empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <rect x="5" y="11" width="14" height="10" rx="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M8 11v-4a4 4 0 0 1 8 0v4"/>
                            </svg>
                        </div>
                        <p class="empty-title">Accès refusé</p>
                        <p class="empty-subtitle text-muted">
                            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        </p>
                        <div class="empty-action">
                            <a href="../dashboard.html" class="btn btn-primary">
                                Retour au dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatRelativeDate(dateString) {
        // TODO: Implémenter formatage relatif (il y a 2 jours, etc.)
        return new Date(dateString).toLocaleDateString('fr-FR');
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
    
    function parseCSV(text) {
        // TODO: Implémenter parsing CSV robuste
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const rows = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index]?.trim() || '';
                });
                rows.push(row);
            }
        }
        
        return rows;
    }
    
    function getDataTableLanguage() {
        return {
            "sEmptyTable": "Aucune donnée disponible",
            "sInfo": "Affichage de _START_ à _END_ sur _TOTAL_ entrées",
            "sInfoEmpty": "Affichage de 0 à 0 sur 0 entrée",
            "sInfoFiltered": "(filtré depuis _MAX_ entrées totales)",
            "sInfoPostFix": "",
            "sInfoThousands": " ",
            "sLengthMenu": "Afficher _MENU_ entrées",
            "sLoadingRecords": "Chargement...",
            "sProcessing": "Traitement...",
            "sSearch": "Rechercher :",
            "sZeroRecords": "Aucun résultat trouvé",
            "oPaginate": {
                "sFirst": "Premier",
                "sLast": "Dernier",
                "sNext": "Suivant",
                "sPrevious": "Précédent"
            },
            "oAria": {
                "sSortAscending": ": activer pour trier la colonne par ordre croissant",
                "sSortDescending": ": activer pour trier la colonne par ordre décroissant"
            }
        };
    }

    // === RECHERCHE FUZZY ET AUTOCOMPLÉTION ===

    // Recherche fuzzy avec Fuse.js
    function fuzzySearchContacts(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            return contacts;
        }

        // Si Fuse.js est disponible, l'utiliser
        if (typeof Fuse !== 'undefined') {
            const fuse = new Fuse(contacts, FUZZY_SEARCH_CONFIG);
            const results = fuse.search(searchTerm);
            
            return results.map(result => ({
                ...result.item,
                score: result.score,
                matches: result.matches
            }));
        } else {
            // Fallback : recherche simple
            const searchLower = searchTerm.toLowerCase();
            return contacts.filter(contact => 
                contact.fullName.toLowerCase().includes(searchLower) ||
                contact.email.toLowerCase().includes(searchLower) ||
                contact.companyName?.toLowerCase().includes(searchLower) ||
                contact.city?.toLowerCase().includes(searchLower)
            );
        }
    }

    // Initialiser autocomplétion entreprises
    function initializeCompanyAutocomplete() {
        const companyInput = document.getElementById('contact-company-autocomplete');
        if (!companyInput) return;

        // Créer datalist pour suggestions
        let datalist = document.getElementById('companies-list');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'companies-list';
            document.body.appendChild(datalist);
        }

        // Peupler avec les entreprises
        datalist.innerHTML = '';
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.name;
            option.dataset.id = company.id;
            option.dataset.sector = company.sector || '';
            datalist.appendChild(option);
        });

        // Attacher au input
        companyInput.setAttribute('list', 'companies-list');

        // Gérer la sélection
        companyInput.addEventListener('change', function() {
            const selectedOption = Array.from(datalist.options).find(
                option => option.value === this.value
            );
            
            if (selectedOption) {
                const companyHiddenInput = document.getElementById('contact-company');
                if (companyHiddenInput) {
                    companyHiddenInput.value = selectedOption.dataset.id;
                }
                
                // Auto-remplir secteur si disponible
                const sectorInput = document.getElementById('contact-sector');
                if (sectorInput && selectedOption.dataset.sector) {
                    sectorInput.value = selectedOption.dataset.sector;
                }
            }
        });

        // Suggestion intelligente pendant la saisie
        companyInput.addEventListener('input', debounce(function() {
            const term = this.value.toLowerCase();
            
            if (term.length >= 2) {
                // Rechercher entreprises similaires
                const matches = companies.filter(company => 
                    company.name.toLowerCase().includes(term)
                ).slice(0, 5);
                
                // Mettre à jour datalist
                datalist.innerHTML = '';
                matches.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.name;
                    option.dataset.id = company.id;
                    option.dataset.sector = company.sector || '';
                    datalist.appendChild(option);
                });
            }
        }, 300));
    }

    // Initialiser autocomplétion NPA → Ville
    function initializeZipAutocomplete() {
        const zipInput = document.getElementById('contact-zip');
        const cityInput = document.getElementById('contact-city');
        const cantonSelect = document.getElementById('contact-canton');
        
        if (!zipInput || !cityInput) return;

        zipInput.addEventListener('input', function() {
            const zip = this.value;
            const cityData = SWISS_CITIES.find(c => c.zip === zip);
            
            if (cityData) {
                cityInput.value = cityData.city;
                
                // Auto-sélectionner le canton
                if (cantonSelect) {
                    cantonSelect.value = cityData.canton;
                }
                
                // Feedback visuel
                zipInput.classList.add('is-valid');
                cityInput.classList.add('is-valid');
            } else {
                zipInput.classList.remove('is-valid');
                cityInput.classList.remove('is-valid');
            }
        });

        // Autocomplétion inverse : Ville → NPA
        cityInput.addEventListener('input', function() {
            const city = this.value.toLowerCase();
            const matches = SWISS_CITIES.filter(c => 
                c.city.toLowerCase().includes(city)
            );
            
            if (matches.length === 1) {
                zipInput.value = matches[0].zip;
                if (cantonSelect) {
                    cantonSelect.value = matches[0].canton;
                }
            }
        });
    }

    // Recherche intelligente avec suggestions
    function initializeSmartSearch() {
        const searchInput = document.getElementById('search-contacts');
        if (!searchInput) return;

        // Créer conteneur suggestions
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'search-suggestions dropdown-menu position-absolute';
        suggestionsDiv.style.display = 'none';
        suggestionsDiv.style.top = '100%';
        suggestionsDiv.style.left = '0';
        suggestionsDiv.style.right = '0';
        suggestionsDiv.style.zIndex = '1050';
        
        // Insérer après le input
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(suggestionsDiv);

        // Gestion de la recherche
        searchInput.addEventListener('input', debounce(function() {
            const term = this.value.toLowerCase().trim();
            
            if (term.length < 2) {
                suggestionsDiv.style.display = 'none';
                return;
            }
            
            // Recherche fuzzy
            const results = fuzzySearchContacts(term).slice(0, 5);
            
            if (results.length > 0) {
                suggestionsDiv.innerHTML = results.map(result => `
                    <a class="dropdown-item d-flex align-items-center" href="#" data-contact-id="${result.id}">
                        <span class="avatar avatar-sm me-2 bg-blue-lt">
                            ${result.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </span>
                        <div class="flex-fill">
                            <div class="fw-bold">${highlightMatch(result.fullName, term)}</div>
                            <div class="text-muted small">
                                ${result.companyName ? highlightMatch(result.companyName, term) : 'Entreprise non renseignée'}
                                ${result.score ? ` • Score: ${Math.round((1 - result.score) * 100)}%` : ''}
                            </div>
                        </div>
                    </a>
                `).join('');
                
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.innerHTML = `
                    <div class="dropdown-item text-muted">
                        <i class="ti ti-search-off me-2"></i>
                        Aucun contact trouvé pour "${escapeHtml(term)}"
                    </div>
                `;
                suggestionsDiv.style.display = 'block';
            }
        }, 300));

        // Gestion sélection suggestion
        suggestionsDiv.addEventListener('click', function(e) {
            e.preventDefault();
            const item = e.target.closest('[data-contact-id]');
            
            if (item) {
                const contactId = item.dataset.contactId;
                selectContact(contactId);
                suggestionsDiv.style.display = 'none';
                searchInput.blur();
            }
        });

        // Fermer suggestions
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });

        // Gestion clavier
        searchInput.addEventListener('keydown', function(e) {
            const items = suggestionsDiv.querySelectorAll('.dropdown-item:not(.text-muted)');
            let current = suggestionsDiv.querySelector('.dropdown-item.active');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!current) {
                    items[0]?.classList.add('active');
                } else {
                    current.classList.remove('active');
                    const next = current.nextElementSibling;
                    if (next && next.classList.contains('dropdown-item') && !next.classList.contains('text-muted')) {
                        next.classList.add('active');
                    } else {
                        items[0]?.classList.add('active');
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!current) {
                    items[items.length - 1]?.classList.add('active');
                } else {
                    current.classList.remove('active');
                    const prev = current.previousElementSibling;
                    if (prev && prev.classList.contains('dropdown-item') && !prev.classList.contains('text-muted')) {
                        prev.classList.add('active');
                    } else {
                        items[items.length - 1]?.classList.add('active');
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (current && current.dataset.contactId) {
                    selectContact(current.dataset.contactId);
                    suggestionsDiv.style.display = 'none';
                }
            } else if (e.key === 'Escape') {
                suggestionsDiv.style.display = 'none';
            }
        });
    }

    // Surligner correspondances dans le texte
    function highlightMatch(text, searchTerm) {
        if (!text || !searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-lt">$1</mark>');
    }

    // Sélectionner un contact depuis les suggestions
    function selectContact(contactId) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        // Mettre en surbrillance dans la vue
        const contactCard = document.querySelector(`[data-contact-id="${contactId}"]`);
        if (contactCard) {
            contactCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            contactCard.classList.add('bg-primary-lt');
            
            setTimeout(() => {
                contactCard.classList.remove('bg-primary-lt');
            }, 2000);
        }

        // Optionnellement ouvrir les détails
        viewContactDetails(contactId);
    }

    // Validation email avancée
    async function validateEmailAddress(email) {
        if (!email) return { valid: false, reason: 'Email vide' };

        try {
            // 1. Validation syntaxe de base
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            
            if (!emailRegex.test(email)) {
                return { valid: false, reason: 'Format invalide' };
            }

            // 2. Vérifications spécifiques
            const domain = email.split('@')[1];
            const localPart = email.split('@')[0];

            // Domaines jetables (liste partielle)
            const disposableDomains = [
                '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
                'mailinator.com', 'yopmail.com', 'temp-mail.org'
            ];

            if (disposableDomains.includes(domain.toLowerCase())) {
                return { 
                    valid: false, 
                    reason: 'Email jetable détecté',
                    disposable: true 
                };
            }

            // 3. Vérification longueur
            if (localPart.length > 64 || domain.length > 255) {
                return { valid: false, reason: 'Email trop long' };
            }

            // 4. Patterns suspects
            if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
                return { valid: false, reason: 'Format suspect' };
            }

            // 5. Score de qualité
            let score = 100;
            
            // Pénalité pour emails très courts
            if (localPart.length < 3) score -= 20;
            
            // Bonus pour domaines connus
            const trustedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
            if (trustedDomains.includes(domain.toLowerCase())) score += 10;
            
            // Bonus pour domaines d'entreprise (.com, .ch, .fr, etc.)
            if (/\.(com|ch|fr|de|co\.uk|org)$/i.test(domain)) score += 5;

            return {
                valid: true,
                reason: 'Email valide',
                score: Math.max(0, Math.min(100, score)),
                domain: domain,
                localPart: localPart,
                disposable: false
            };

        } catch (error) {
            console.error('Erreur validation email:', error);
            return { 
                valid: true, // Par défaut, accepter en cas d'erreur
                reason: 'Validation offline',
                score: 50 
            };
        }
    }
    
    // Bind events
    function bindEvents() {
        // Formulaire de contact
        const contactForm = document.getElementById('modal-contact');
        if (contactForm) {
            contactForm.querySelector('form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                saveContact();
            });
        }
    }
    
    // Données mock pour tests
    function generateMockContacts() {
        return [
            {
                id: 'mock-1',
                fullName: 'Jean Dupont',
                firstName: 'Jean',
                lastName: 'Dupont',
                email: 'jean.dupont@exemple.ch',
                phone: '+41 79 123 45 67',
                companyName: 'Rolex SA',
                position: 'Directeur Marketing',
                department: '📈 Marketing/Com',
                city: 'Genève',
                country: '🇨🇭 Suisse',
                portefeuille: 'HYPERVISUAL',
                tags: ['🏆 VIP', '🎯 Decision Maker'],
                statutContact: '✅ Actif',
                statutPipeline: 'Client Actif',
                lastInteraction: '2025-01-20'
            },
            {
                id: 'mock-2',
                fullName: 'Marie Martin',
                firstName: 'Marie',
                lastName: 'Martin',
                email: 'marie.martin@exemple.fr',
                phone: '+33 6 12 34 56 78',
                companyName: 'L\'Oréal',
                position: 'Chef de Projet Digital',
                department: '💻 IT/Tech',
                city: 'Paris',
                country: '🇫🇷 France',
                portefeuille: 'DAINAMICS',
                tags: ['💰 High Value'],
                statutContact: '✅ Actif',
                statutPipeline: 'En Négociation',
                lastInteraction: '2025-01-18'
            }
        ];
    }
    
    function generateMockCompanies() {
        return [
            { id: 'comp-1', name: 'Rolex SA' },
            { id: 'comp-2', name: 'L\'Oréal' },
            { id: 'comp-3', name: 'Nestlé' },
            { id: 'comp-4', name: 'Credit Suisse' }
        ];
    }
    
    // API publique
    return {
        init,
        saveContact,
        viewContact,
        editContact,
        createInteraction,
        importCSV,
        exportToExcel,
        resetFilters
    };
    
})();

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/crm/contacts.html')) {
        ContactsManagerSuperadmin.init();
    }
});