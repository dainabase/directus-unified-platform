/**
 * Table Responsive Wrapper
 * Ajoute automatiquement table-responsive à toutes les tables
 */

const TableResponsiveWrapper = {
    /**
     * Initialiser le wrapper responsive
     */
    init() {
        console.log('📊 Initialisation du wrapper responsive pour tables');
        
        this.wrapAllTables();
        this.enhanceTableFeatures();
        this.addMobileOptimizations();
        this.observeNewTables();
    },

    /**
     * Envelopper toutes les tables existantes
     */
    wrapAllTables() {
        const tables = document.querySelectorAll('table:not(.no-responsive)');
        
        tables.forEach(table => {
            this.wrapTable(table);
        });
    },

    /**
     * Envelopper une table individuelle
     */
    wrapTable(table) {
        // Vérifier si la table est déjà dans un wrapper responsive
        if (table.closest('.table-responsive')) {
            return;
        }
        
        // S'assurer que la table a la classe de base Tabler
        if (!table.classList.contains('table')) {
            table.classList.add('table');
        }
        
        // Créer le wrapper responsive
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        
        // Insérer le wrapper avant la table
        table.parentNode.insertBefore(wrapper, table);
        
        // Déplacer la table dans le wrapper
        wrapper.appendChild(table);
        
        // Ajouter des classes supplémentaires selon le contexte
        this.enhanceTableClasses(table);
        
        // Gérer les tables dans les cards
        this.handleCardTables(table, wrapper);
    },

    /**
     * Améliorer les classes de table
     */
    enhanceTableClasses(table) {
        // Détecter le type de table et ajouter les classes appropriées
        const hasStripes = table.classList.contains('table-striped') || 
                          table.querySelector('tbody tr:nth-child(even)');
        const hasBorders = table.classList.contains('table-bordered');
        const isHoverable = table.classList.contains('table-hover') ||
                           table.querySelector('tbody tr[onclick]');
        
        // Ajouter les classes manquantes
        if (!hasStripes && !table.classList.contains('table-striped')) {
            // Ajouter striped par défaut pour une meilleure lisibilité
            table.classList.add('table-striped');
        }
        
        if (isHoverable && !table.classList.contains('table-hover')) {
            table.classList.add('table-hover');
        }
        
        // Vérifier si c'est une table compacte
        const isCompact = table.closest('.card-sm') || 
                         table.closest('.modal') ||
                         table.classList.contains('compact');
        
        if (isCompact && !table.classList.contains('table-sm')) {
            table.classList.add('table-sm');
        }
        
        // Ajouter table-vcenter si pas déjà présent
        if (!table.classList.contains('table-vcenter')) {
            table.classList.add('table-vcenter');
        }
    },

    /**
     * Gérer les tables dans les cards
     */
    handleCardTables(table, wrapper) {
        const card = wrapper.closest('.card');
        if (!card) return;
        
        // Si la table est directement dans la card (pas dans card-body)
        if (wrapper.parentElement === card) {
            // Ajouter une classe pour supprimer les marges
            wrapper.classList.add('table-responsive-card');
            
            // Supprimer les bordures en haut et en bas
            table.classList.add('card-table');
        }
        
        // Si c'est dans un card-body, vérifier s'il faut ajuster
        const cardBody = wrapper.closest('.card-body');
        if (cardBody && cardBody.children.length === 1) {
            // Si la table est le seul contenu du card-body
            cardBody.classList.add('p-0');
            wrapper.classList.add('table-responsive-card');
        }
    },

    /**
     * Améliorer les fonctionnalités des tables
     */
    enhanceTableFeatures() {
        const tables = document.querySelectorAll('table.table');
        
        tables.forEach(table => {
            // Ajouter le tri si nécessaire
            this.addSortingCapability(table);
            
            // Améliorer les checkboxes
            this.enhanceCheckboxes(table);
            
            // Ajouter les actions sur mobile
            this.addMobileActions(table);
            
            // Gérer les colonnes sticky
            this.handleStickyColumns(table);
        });
    },

    /**
     * Ajouter la capacité de tri
     */
    addSortingCapability(table) {
        const headers = table.querySelectorAll('thead th[data-sortable], thead th.sortable');
        
        headers.forEach(header => {
            if (!header.querySelector('.sort-indicator')) {
                // Ajouter l'indicateur de tri
                const indicator = document.createElement('span');
                indicator.className = 'sort-indicator ms-1';
                indicator.innerHTML = '<i class="ti ti-selector"></i>';
                header.appendChild(indicator);
                
                // Rendre le header cliquable
                header.style.cursor = 'pointer';
                header.setAttribute('role', 'button');
                
                // Ajouter l'événement de clic
                header.addEventListener('click', () => {
                    this.toggleSort(header, table);
                });
            }
        });
    },

    /**
     * Basculer le tri
     */
    toggleSort(header, table) {
        const currentSort = header.dataset.sort || 'none';
        const newSort = currentSort === 'none' ? 'asc' : 
                       currentSort === 'asc' ? 'desc' : 'none';
        
        // Réinitialiser tous les autres headers
        table.querySelectorAll('thead th').forEach(th => {
            th.dataset.sort = 'none';
            const indicator = th.querySelector('.sort-indicator i');
            if (indicator) {
                indicator.className = 'ti ti-selector';
            }
        });
        
        // Mettre à jour ce header
        header.dataset.sort = newSort;
        const indicator = header.querySelector('.sort-indicator i');
        if (indicator) {
            indicator.className = newSort === 'asc' ? 'ti ti-chevron-up' :
                               newSort === 'desc' ? 'ti ti-chevron-down' :
                               'ti ti-selector';
        }
        
        // Déclencher un événement pour que le JS de la page puisse gérer le tri
        table.dispatchEvent(new CustomEvent('table-sort', {
            detail: { column: header.cellIndex, direction: newSort }
        }));
    },

    /**
     * Améliorer les checkboxes dans les tables
     */
    enhanceCheckboxes(table) {
        // Checkbox "select all" dans le header
        const selectAllCheckbox = table.querySelector('thead input[type="checkbox"]');
        if (selectAllCheckbox && !selectAllCheckbox.dataset.enhanced) {
            selectAllCheckbox.dataset.enhanced = 'true';
            
            selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
                
                rowCheckboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                    // Déclencher l'événement change
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                });
            });
        }
        
        // Gérer l'état du "select all" basé sur les checkboxes des lignes
        const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
        rowCheckboxes.forEach(checkbox => {
            if (!checkbox.dataset.enhanced) {
                checkbox.dataset.enhanced = 'true';
                
                checkbox.addEventListener('change', () => {
                    if (selectAllCheckbox) {
                        const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
                        const someChecked = Array.from(rowCheckboxes).some(cb => cb.checked);
                        
                        selectAllCheckbox.checked = allChecked;
                        selectAllCheckbox.indeterminate = !allChecked && someChecked;
                    }
                });
            }
        });
    },

    /**
     * Ajouter des optimisations mobile
     */
    addMobileOptimizations() {
        // Détecter si on est sur mobile
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobile) {
            document.querySelectorAll('table.table').forEach(table => {
                // Ajouter la classe mobile
                table.classList.add('table-mobile-optimized');
                
                // Gérer les colonnes à cacher sur mobile
                this.handleMobileColumns(table);
                
                // Ajouter le swipe pour scroll horizontal
                this.addSwipeSupport(table);
            });
        }
    },

    /**
     * Gérer les colonnes sur mobile
     */
    handleMobileColumns(table) {
        // Cacher les colonnes marquées comme non essentielles
        const headers = table.querySelectorAll('th[data-mobile-hide]');
        headers.forEach((header, index) => {
            // Cacher la colonne entière
            const cells = table.querySelectorAll(`td:nth-child(${index + 1})`);
            header.style.display = 'none';
            cells.forEach(cell => cell.style.display = 'none');
        });
        
        // Réduire la largeur des colonnes d'actions
        const actionHeaders = table.querySelectorAll('th.actions, th:last-child');
        actionHeaders.forEach(header => {
            if (header.textContent.trim() === '' || header.textContent.includes('Actions')) {
                header.style.width = '50px';
            }
        });
    },

    /**
     * Ajouter le support du swipe
     */
    addSwipeSupport(table) {
        const wrapper = table.closest('.table-responsive');
        if (!wrapper) return;
        
        let startX = 0;
        let scrollLeft = 0;
        
        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });
        
        wrapper.addEventListener('touchmove', (e) => {
            if (!startX) return;
            e.preventDefault();
            const x = e.touches[0].pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 2;
            wrapper.scrollLeft = scrollLeft - walk;
        });
    },

    /**
     * Ajouter des actions mobile
     */
    addMobileActions(table) {
        // Sur mobile, convertir les dropdowns d'actions en boutons swipe
        if (window.matchMedia('(max-width: 768px)').matches) {
            const actionCells = table.querySelectorAll('td:last-child');
            
            actionCells.forEach(cell => {
                const dropdown = cell.querySelector('.dropdown');
                if (dropdown && !dropdown.dataset.mobileOptimized) {
                    dropdown.dataset.mobileOptimized = 'true';
                    
                    // Rendre le dropdown plus accessible sur mobile
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.classList.add('btn-lg');
                    }
                }
            });
        }
    },

    /**
     * Gérer les colonnes sticky
     */
    handleStickyColumns(table) {
        // Première colonne sticky si marquée
        const stickyHeaders = table.querySelectorAll('th[data-sticky]');
        stickyHeaders.forEach((header, index) => {
            header.style.position = 'sticky';
            header.style.left = '0';
            header.style.zIndex = '10';
            header.style.backgroundColor = 'var(--tblr-bg-surface)';
            
            // Appliquer aussi aux cellules de cette colonne
            const cells = table.querySelectorAll(`td:nth-child(${index + 1})`);
            cells.forEach(cell => {
                cell.style.position = 'sticky';
                cell.style.left = '0';
                cell.style.backgroundColor = 'var(--tblr-bg-surface)';
            });
        });
    },

    /**
     * Observer pour les nouvelles tables
     */
    observeNewTables() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Vérifier si c'est une table
                        if (node.tagName === 'TABLE') {
                            this.wrapTable(node);
                            this.enhanceTableFeatures();
                        }
                        // Vérifier les tables enfants
                        if (node.querySelectorAll) {
                            const tables = node.querySelectorAll('table');
                            tables.forEach(table => {
                                this.wrapTable(table);
                            });
                            if (tables.length > 0) {
                                this.enhanceTableFeatures();
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

// CSS pour les optimisations
const tableStyles = `
<style>
/* Wrapper responsive dans les cards */
.table-responsive-card {
    margin: 0;
    border-radius: 0;
}

.table-responsive-card .table {
    margin-bottom: 0;
}

/* Table mobile optimisée */
@media (max-width: 768px) {
    .table-mobile-optimized {
        font-size: 0.875rem;
    }
    
    .table-mobile-optimized td,
    .table-mobile-optimized th {
        padding: 0.5rem;
    }
    
    /* Réduire l'espace des boutons d'action */
    .table-mobile-optimized .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
    }
}

/* Indicateurs de tri */
.sort-indicator {
    opacity: 0.3;
    transition: opacity 0.2s;
}

th[data-sort="asc"] .sort-indicator,
th[data-sort="desc"] .sort-indicator {
    opacity: 1;
}

/* Colonnes sticky */
th[data-sticky],
td[style*="sticky"] {
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

/* Amélioration du scroll horizontal */
.table-responsive {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* Indicateur de scroll */
.table-responsive::-webkit-scrollbar {
    height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.table-responsive::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
`;

// Injecter les styles
if (!document.querySelector('#table-responsive-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'table-responsive-styles';
    styleElement.innerHTML = tableStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    TableResponsiveWrapper.init();
});

// Exporter pour utilisation
window.TableResponsiveWrapper = TableResponsiveWrapper;