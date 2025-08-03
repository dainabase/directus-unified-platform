/**
 * Modal Manager
 * Standardise toutes les modals pour utiliser Bootstrap 5
 */

const ModalManager = {
    /**
     * Initialiser le gestionnaire de modals
     */
    init() {
        console.log('🪟 Initialisation du gestionnaire de modals');
        
        this.standardizeExistingModals();
        this.createCommonModals();
        this.setupGlobalHandlers();
    },

    /**
     * Standardiser les modals existantes
     */
    standardizeExistingModals() {
        // Rechercher tous les éléments avec onclick pour les modals
        const elementsWithOnclick = document.querySelectorAll('[onclick*="Modal"], [onclick*="modal"]');
        
        elementsWithOnclick.forEach(element => {
            const onclickAttr = element.getAttribute('onclick');
            if (onclickAttr) {
                // Extraire l'ID de la modal
                const modalIdMatch = onclickAttr.match(/['"]([^'"]+modal[^'"]*)['"]/i);
                if (modalIdMatch) {
                    const modalId = modalIdMatch[1].replace('#', '');
                    
                    // Remplacer onclick par data-bs-toggle
                    element.removeAttribute('onclick');
                    element.setAttribute('data-bs-toggle', 'modal');
                    element.setAttribute('data-bs-target', `#${modalId}`);
                }
            }
        });

        // Standardiser les modals elles-mêmes
        document.querySelectorAll('.modal').forEach(modal => {
            // S'assurer que la structure est correcte
            if (!modal.querySelector('.modal-dialog')) {
                const content = modal.innerHTML;
                modal.innerHTML = `
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            ${content}
                        </div>
                    </div>
                `;
            }

            // Ajouter les attributs manquants
            if (!modal.hasAttribute('tabindex')) {
                modal.setAttribute('tabindex', '-1');
            }
            if (!modal.hasAttribute('aria-hidden')) {
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    },

    /**
     * Créer les modals communes manquantes
     */
    createCommonModals() {
        // Modal de confirmation générique
        if (!document.getElementById('modal-confirm-delete')) {
            this.createConfirmDeleteModal();
        }

        // Modal de création de projet
        if (!document.getElementById('modal-create-project')) {
            this.createProjectModal();
        }

        // Modal pour nouveau deal (revendeur)
        if (!document.getElementById('modal-new-deal')) {
            this.createNewDealModal();
        }

        // Modal de rejet (superadmin)
        if (!document.getElementById('modal-reject')) {
            this.createRejectModal();
        }
    },

    /**
     * Modal de confirmation de suppression
     */
    createConfirmDeleteModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modal-confirm-delete';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmer la suppression</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
                        <p class="text-muted small">Cette action est irréversible.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-danger" id="confirm-delete-btn">Supprimer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Modal de création de projet
     */
    createProjectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modal-create-project';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nouveau projet</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <form id="form-create-project">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Nom du projet</label>
                                <input type="text" class="form-control" name="project_name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="3"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Date de début</label>
                                        <input type="date" class="form-control" name="start_date" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Date de fin</label>
                                        <input type="date" class="form-control" name="end_date">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Budget</label>
                                <div class="input-group">
                                    <span class="input-group-text">CHF</span>
                                    <input type="number" class="form-control" name="budget" step="0.01">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" class="btn btn-primary">Créer le projet</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Modal nouveau deal (revendeur)
     */
    createNewDealModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modal-new-deal';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nouvelle opportunité</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <form id="form-new-deal">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Nom de l'opportunité</label>
                                <input type="text" class="form-control" name="deal_name" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Client</label>
                                        <select class="form-select" name="client_id" required>
                                            <option value="">Sélectionner un client</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Valeur estimée</label>
                                        <div class="input-group">
                                            <span class="input-group-text">CHF</span>
                                            <input type="number" class="form-control" name="value" step="0.01" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Étape</label>
                                <select class="form-select" name="stage" required>
                                    <option value="prospect">Prospect</option>
                                    <option value="qualification">Qualification</option>
                                    <option value="proposition">Proposition</option>
                                    <option value="negociation">Négociation</option>
                                    <option value="closing">Closing</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Probabilité de closing (%)</label>
                                <input type="range" class="form-range" name="probability" min="0" max="100" value="50">
                                <span class="probability-value">50%</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" class="btn btn-primary">Créer l'opportunité</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Modal de rejet (superadmin)
     */
    createRejectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modal-reject';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rejeter le document</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <form id="form-reject">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Motif du rejet</label>
                                <select class="form-select" name="reason" required>
                                    <option value="">Sélectionner un motif</option>
                                    <option value="incomplete">Document incomplet</option>
                                    <option value="incorrect">Informations incorrectes</option>
                                    <option value="quality">Qualité insuffisante</option>
                                    <option value="duplicate">Doublon</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Commentaire</label>
                                <textarea class="form-control" name="comment" rows="3" placeholder="Détaillez le motif du rejet..." required></textarea>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="notify_sender" id="notify-sender" checked>
                                <label class="form-check-label" for="notify-sender">
                                    Notifier l'expéditeur
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" class="btn btn-danger">Rejeter</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Configuration des handlers globaux
     */
    setupGlobalHandlers() {
        // Handler pour la modal de confirmation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-confirm-delete]')) {
                e.preventDefault();
                const targetId = e.target.dataset.confirmDelete;
                const modal = new bootstrap.Modal(document.getElementById('modal-confirm-delete'));
                
                // Stocker l'ID de l'élément à supprimer
                document.getElementById('confirm-delete-btn').dataset.targetId = targetId;
                
                modal.show();
            }
        });

        // Handler pour le bouton de confirmation
        const confirmBtn = document.getElementById('confirm-delete-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                const targetId = this.dataset.targetId;
                console.log('Suppression confirmée pour:', targetId);
                
                // Fermer la modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modal-confirm-delete'));
                modal.hide();
                
                // Déclencher l'événement de suppression
                document.dispatchEvent(new CustomEvent('confirm-delete', { detail: { id: targetId } }));
            });
        }

        // Handler pour le range de probabilité
        document.addEventListener('input', (e) => {
            if (e.target.name === 'probability') {
                const value = e.target.value;
                const label = e.target.parentElement.querySelector('.probability-value');
                if (label) {
                    label.textContent = value + '%';
                }
            }
        });
    },

    /**
     * Méthode utilitaire pour ouvrir une modal
     */
    openModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    },

    /**
     * Méthode utilitaire pour fermer une modal
     */
    closeModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    },

    /**
     * Créer une modal dynamique
     */
    createDynamicModal(options) {
        const defaults = {
            id: 'modal-dynamic-' + Date.now(),
            title: 'Modal',
            body: '',
            size: 'md', // sm, md, lg, xl
            centered: true,
            buttons: [
                { text: 'Fermer', class: 'btn-secondary', dismiss: true }
            ]
        };

        const config = { ...defaults, ...options };

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = config.id;
        modal.setAttribute('tabindex', '-1');

        const sizeClass = config.size !== 'md' ? `modal-${config.size}` : '';
        const centeredClass = config.centered ? 'modal-dialog-centered' : '';

        const buttonsHTML = config.buttons.map(btn => {
            const dismissAttr = btn.dismiss ? 'data-bs-dismiss="modal"' : '';
            const clickHandler = btn.onClick ? `onclick="${btn.onClick}"` : '';
            return `<button type="button" class="btn ${btn.class}" ${dismissAttr} ${clickHandler}>${btn.text}</button>`;
        }).join('');

        modal.innerHTML = `
            <div class="modal-dialog ${sizeClass} ${centeredClass}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${config.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        ${config.body}
                    </div>
                    <div class="modal-footer">
                        ${buttonsHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-cleanup après fermeture
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });

        return new bootstrap.Modal(modal);
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    ModalManager.init();
});

// Exporter pour utilisation
window.ModalManager = ModalManager;