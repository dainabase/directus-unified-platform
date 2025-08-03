/**
 * Projects Management
 * Gestion de la page des projets avec DataTable
 */

// Variable globale pour la DataTable
let projectsTable = null;

// Configuration de la DataTable
const dataTableConfig = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/fr-CH.json',
        decimal: ',',
        thousands: '\''
    },
    responsive: true,
    pageLength: 10,
    order: [[5, 'asc']], // Tri par échéance
    columnDefs: [
        { 
            targets: 0,
            width: '25%'
        },
        { 
            targets: 3,
            orderable: false,
            width: '15%'
        },
        { 
            targets: 4,
            type: 'currency'
        },
        { 
            targets: 5,
            type: 'date'
        },
        { 
            targets: 7,
            orderable: false,
            searchable: false,
            width: '50px'
        }
    ],
    dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex"l><"d-flex"fB>>rtip',
    buttons: [
        {
            extend: 'excel',
            text: '<i class="ti ti-file-spreadsheet icon"></i> Excel',
            className: 'btn btn-sm btn-ghost-secondary',
            exportOptions: {
                columns: ':not(:last-child)'
            }
        },
        {
            extend: 'pdf',
            text: '<i class="ti ti-file-text icon"></i> PDF',
            className: 'btn btn-sm btn-ghost-secondary',
            exportOptions: {
                columns: ':not(:last-child)'
            }
        },
        {
            extend: 'print',
            text: '<i class="ti ti-printer icon"></i> Imprimer',
            className: 'btn btn-sm btn-ghost-secondary',
            exportOptions: {
                columns: ':not(:last-child)'
            }
        }
    ]
};

// Initialisation de la DataTable
function initProjectsTable() {
    projectsTable = $('#projectsTable').DataTable(dataTableConfig);
    
    // Personnaliser l'apparence après initialisation
    $('.dataTables_filter input').addClass('form-control form-control-sm').attr('placeholder', 'Rechercher...');
    $('.dataTables_length select').addClass('form-select form-select-sm');
    
    // Ajuster les boutons
    $('.dt-buttons').addClass('btn-list');
}

// Fonction pour filtrer les projets
function applyFilters() {
    if (!projectsTable) return;
    
    const status = document.getElementById('filter-status').value;
    const manager = document.getElementById('filter-manager').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    
    // Réinitialiser la recherche
    projectsTable.search('').columns().search('');
    
    // Appliquer les filtres
    if (status) {
        projectsTable.column(2).search(status);
    }
    
    if (manager) {
        projectsTable.column(6).search(manager);
    }
    
    // Filtrage par date (custom)
    if (dateFrom || dateTo) {
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            const projectDate = moment(data[5], 'DD.MM.YYYY');
            const from = dateFrom ? moment(dateFrom) : null;
            const to = dateTo ? moment(dateTo) : null;
            
            if (from && projectDate.isBefore(from)) return false;
            if (to && projectDate.isAfter(to)) return false;
            
            return true;
        });
    }
    
    // Redessiner la table
    projectsTable.draw();
    
    // Afficher un message
    PortalApp.showToast('Filtres appliqués', 'info', 2000);
}

// Fonction pour basculer l'affichage des filtres
function toggleFilters() {
    const filtersCard = document.getElementById('filters-card');
    const isShowing = filtersCard.classList.contains('show');
    
    if (isShowing) {
        filtersCard.classList.remove('show');
    } else {
        filtersCard.classList.add('show');
    }
}

// Fonction pour réinitialiser les filtres
function resetFilters() {
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-manager').value = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    
    // Réinitialiser la recherche DataTable
    if (projectsTable) {
        $.fn.dataTable.ext.search.pop();
        projectsTable.search('').columns().search('').draw();
    }
    
    PortalApp.showToast('Filtres réinitialisés', 'info', 2000);
}

// Fonction pour exporter les données
function exportProjects(format) {
    if (!projectsTable) return;
    
    switch(format) {
        case 'excel':
            projectsTable.button('.buttons-excel').trigger();
            break;
        case 'pdf':
            projectsTable.button('.buttons-pdf').trigger();
            break;
        case 'print':
            projectsTable.button('.buttons-print').trigger();
            break;
    }
}

// Fonction pour gérer les actions sur les projets
function handleProjectAction(action, projectId) {
    switch(action) {
        case 'view':
            window.location.href = `project-detail.html?id=${projectId}`;
            break;
        case 'edit':
            // Ouvrir le modal d'édition
            console.log('Édition du projet', projectId);
            PortalApp.showToast('Fonction d\'édition en cours de développement', 'info');
            break;
        case 'archive':
            if (confirm('Êtes-vous sûr de vouloir archiver ce projet ?')) {
                console.log('Archivage du projet', projectId);
                PortalApp.showToast('Projet archivé avec succès', 'success');
                // Recharger les données
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
            break;
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la DataTable
    initProjectsTable();
    
    // Gérer les actions dropdown
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const action = this.href.includes('project-detail') ? 'view' : 
                          this.textContent.includes('Modifier') ? 'edit' : 'archive';
            const projectId = new URLSearchParams(this.href.split('?')[1]).get('id') || 
                            this.closest('tr').dataset.projectId;
            
            handleProjectAction(action, projectId);
        });
    });
    
    // Bouton reset des filtres
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-sm btn-ghost-secondary ms-2';
    resetBtn.innerHTML = '<i class="ti ti-refresh icon"></i> Réinitialiser';
    resetBtn.onclick = resetFilters;
    
    const filterBtn = document.querySelector('button[onclick="applyFilters()"]');
    if (filterBtn) {
        filterBtn.parentElement.appendChild(resetBtn);
    }
    
    // Animation des cards de statistiques
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});