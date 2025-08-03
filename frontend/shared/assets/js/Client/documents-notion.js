// documents-notion.js - Intégration Notion pour la page des documents
// Ce fichier remplace les données mockées par de vraies données Notion

const DocumentsNotion = {
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la page documents avec Notion');
        this.loadDocuments();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Filtres
        document.querySelectorAll('[data-filter]').forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-documents');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDocuments());
        }
        
        // Upload de documents
        this.initDropzone();
    },
    
    // Charger les documents depuis Notion
    async loadDocuments() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) {
                console.warn('Utilisateur non connecté');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les documents
            const canViewDocuments = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'documents',
                'view.own'
            );
            
            if (!canViewDocuments) {
                window.showNotification('Vous n\'avez pas accès aux documents', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer d'abord les projets du client avec permissions
            const projects = await window.PermissionsMiddleware.secureApiCall(
                'projects',
                'view',
                window.NotionConnector.client.getClientProjects.bind(window.NotionConnector.client),
                currentUser.id
            );
            
            // Récupérer tous les documents de tous les projets
            const allDocuments = [];
            for (const project of projects) {
                // Vérifier les permissions pour chaque projet
                const canViewProjectDocs = await window.PermissionsNotion.checkResourceAccess(
                    'documents',
                    'view',
                    { projectId: project.id, ownerId: currentUser.id }
                );
                
                if (canViewProjectDocs) {
                    const projectDocs = await window.PermissionsMiddleware.secureApiCall(
                        'documents',
                        'view',
                        window.NotionConnector.client.getProjectDocuments.bind(window.NotionConnector.client),
                        project.id
                    );
                    
                    // Enrichir chaque document avec les infos du projet
                    projectDocs.forEach(doc => {
                        allDocuments.push({
                            ...doc,
                            project: project.name,
                            projectId: project.id,
                            projectStatus: project.status
                        });
                    });
                }
            }
            
            // Trier par date (plus récent en premier)
            allDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            
            // Mettre à jour l'interface
            this.updateDocumentsView(allDocuments);
            this.updateDocumentsStats(allDocuments);
            
            // Stocker les documents pour les filtres
            this.allDocuments = allDocuments;
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'documents.list', true, {
                documentCount: allDocuments.length,
                projectCount: projects.length
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des documents:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'documents.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Mettre à jour la vue des documents
    updateDocumentsView(documents) {
        const container = document.getElementById('documents-container');
        if (!container) return;
        
        if (documents.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="ti ti-files-off fs-1 text-muted mb-3"></i>
                    <h3 class="text-muted">Aucun document trouvé</h3>
                    <p class="text-muted">Commencez par télécharger vos premiers documents</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = documents.map(doc => `
            <div class="col-md-6 col-lg-4 document-item" 
                 data-type="${this.getDocumentType(doc.type)}"
                 data-project="${doc.projectId}"
                 data-status="${doc.status}">
                <div class="card file-card">
                    ${this.isNewDocument(doc.uploadDate) ? '<div class="card-status-top bg-primary"></div>' : ''}
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <div class="avatar avatar-md ${this.getIconColor(doc.type)}">
                                    <i class="ti ${this.getFileIcon(doc.type)} fs-1"></i>
                                </div>
                            </div>
                            <div class="col">
                                <h4 class="card-title m-0">
                                    <a href="#" onclick="DocumentsNotion.previewDocument('${doc.id}'); return false;">
                                        ${doc.name}
                                    </a>
                                </h4>
                                <div class="text-muted">
                                    <div class="row">
                                        <div class="col-auto">
                                            <i class="ti ti-briefcase"></i> ${doc.project}
                                        </div>
                                        <div class="col-auto">
                                            <i class="ti ti-file"></i> ${doc.size || 'Taille inconnue'}
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <span class="badge ${this.getStatusBadgeClass(doc.status)}">
                                        ${this.getStatusLabel(doc.status)}
                                    </span>
                                    <small class="text-muted ms-2">
                                        ${window.NotionConnector.utils.formatDate(doc.uploadDate)}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <a href="#" class="text-muted" 
                                   onclick="DocumentsNotion.downloadDocument('${doc.id}'); return false;">
                                    <i class="ti ti-download"></i> Télécharger
                                </a>
                            </div>
                            <div class="col-auto ms-auto">
                                <div class="dropdown">
                                    <a href="#" class="text-muted" data-bs-toggle="dropdown">
                                        <i class="ti ti-dots-vertical"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-end">
                                        <a class="dropdown-item" href="#" 
                                           onclick="DocumentsNotion.previewDocument('${doc.id}'); return false;">
                                            <i class="ti ti-eye"></i> Aperçu
                                        </a>
                                        <a class="dropdown-item" href="#" 
                                           onclick="DocumentsNotion.shareDocument('${doc.id}'); return false;">
                                            <i class="ti ti-share"></i> Partager
                                        </a>
                                        <div class="dropdown-divider"></div>
                                        <a class="dropdown-item text-danger" href="#" 
                                           onclick="DocumentsNotion.deleteDocument('${doc.id}'); return false;">
                                            <i class="ti ti-trash"></i> Supprimer
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les statistiques
    updateDocumentsStats(documents) {
        const stats = {
            total: documents.length,
            validated: documents.filter(d => d.status === 'Validé').length,
            pending: documents.filter(d => d.status === 'En attente').length,
            totalSize: documents.reduce((sum, d) => {
                const size = parseFloat(d.size) || 0;
                return sum + size;
            }, 0)
        };
        
        // Mettre à jour les éléments du DOM
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('total-documents', stats.total);
        updateStat('validated-documents', stats.validated);
        updateStat('pending-documents', stats.pending);
        updateStat('total-size', this.formatFileSize(stats.totalSize * 1024 * 1024)); // Convertir MB en bytes
    },
    
    // Initialiser Dropzone pour l'upload
    initDropzone() {
        const dropzoneElement = document.querySelector("#dropzone-documents");
        if (!dropzoneElement || dropzoneElement.dropzone) return;
        
        const myDropzone = new Dropzone(dropzoneElement, {
            url: "/upload", // URL temporaire
            maxFilesize: 50, // MB
            acceptedFiles: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar",
            dictDefaultMessage: "Glissez vos fichiers ici ou cliquez pour parcourir",
            dictFileTooBig: "Le fichier est trop volumineux ({{filesize}}MB). Taille max: {{maxFilesize}}MB.",
            dictInvalidFileType: "Ce type de fichier n'est pas autorisé.",
            dictResponseError: "Erreur lors du téléchargement: {{statusCode}}",
            
            init: function() {
                this.on("success", function(file, response) {
                    // TODO: Implémenter l'upload vers Notion
                    console.log("Fichier uploadé:", file);
                    window.showNotification("Document téléchargé avec succès", "success");
                    
                    // Recharger les documents
                    setTimeout(() => {
                        DocumentsNotion.loadDocuments();
                    }, 1500);
                });
                
                this.on("error", function(file, errorMessage) {
                    console.error("Erreur upload:", errorMessage);
                    window.showNotification("Erreur lors du téléchargement", "error");
                });
                
                // Pour l'instant, simuler le succès
                this.on("sending", function(file, xhr, formData) {
                    // Intercepter et simuler le succès
                    setTimeout(() => {
                        file.status = Dropzone.SUCCESS;
                        myDropzone.emit("success", file, {});
                        myDropzone.emit("complete", file);
                    }, 1500);
                    
                    // Empêcher l'envoi réel
                    xhr.abort();
                });
            }
        });
    },
    
    // Appliquer les filtres
    applyFilters() {
        if (!this.allDocuments) return;
        
        const typeFilter = document.getElementById('filter-type')?.value || 'all';
        const projectFilter = document.getElementById('filter-project')?.value || 'all';
        const statusFilter = document.getElementById('filter-status')?.value || 'all';
        
        let filteredDocuments = [...this.allDocuments];
        
        // Filtrer par type
        if (typeFilter !== 'all') {
            filteredDocuments = filteredDocuments.filter(doc => 
                this.getDocumentType(doc.type) === typeFilter
            );
        }
        
        // Filtrer par projet
        if (projectFilter !== 'all') {
            filteredDocuments = filteredDocuments.filter(doc => 
                doc.projectId === projectFilter
            );
        }
        
        // Filtrer par statut
        if (statusFilter !== 'all') {
            filteredDocuments = filteredDocuments.filter(doc => 
                doc.status === statusFilter
            );
        }
        
        // Mettre à jour la vue
        this.updateDocumentsView(filteredDocuments);
    },
    
    // Utilitaires
    getDocumentType(type) {
        const typeMap = {
            'PDF': 'contract',
            'Excel': 'document',
            'Word': 'document',
            'Image': 'image',
            'Figma': 'image',
            'ZIP': 'archive'
        };
        return typeMap[type] || 'document';
    },
    
    getFileIcon(type) {
        const iconMap = {
            'PDF': 'ti-file-text',
            'Excel': 'ti-file-spreadsheet',
            'Word': 'ti-file-text',
            'Image': 'ti-photo',
            'Figma': 'ti-brand-figma',
            'ZIP': 'ti-file-zip'
        };
        return iconMap[type] || 'ti-file';
    },
    
    getIconColor(type) {
        const colorMap = {
            'PDF': 'bg-red-lt',
            'Excel': 'bg-green-lt',
            'Word': 'bg-blue-lt',
            'Image': 'bg-azure-lt',
            'Figma': 'bg-purple-lt',
            'ZIP': 'bg-yellow-lt'
        };
        return colorMap[type] || 'bg-secondary-lt';
    },
    
    getStatusBadgeClass(status) {
        const statusClasses = {
            'Validé': 'badge-success',
            'En attente': 'badge-warning',
            'Rejeté': 'badge-danger',
            'En cours': 'badge-primary'
        };
        return statusClasses[status] || 'badge-secondary';
    },
    
    getStatusLabel(status) {
        return status || 'Non défini';
    },
    
    isNewDocument(uploadDate) {
        const date = new Date(uploadDate);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    },
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Actions sur les documents
    async previewDocument(documentId) {
        // TODO: Implémenter la prévisualisation
        window.location.href = `document-preview.html?id=${documentId}`;
    },
    
    async downloadDocument(documentId) {
        // TODO: Implémenter le téléchargement depuis Notion
        if (window.showNotification) {
            window.showNotification('Téléchargement en cours...', 'info');
        }
    },
    
    async shareDocument(documentId) {
        // TODO: Implémenter le partage
        if (window.showNotification) {
            window.showNotification('Fonction de partage à venir', 'info');
        }
    },
    
    async deleteDocument(documentId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            // TODO: Implémenter la suppression dans Notion
            if (window.showNotification) {
                window.showNotification('Document supprimé', 'success');
            }
            this.loadDocuments();
        }
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('documents-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des documents...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateDocumentsView
    },
    
    showErrorState() {
        const container = document.getElementById('documents-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                    <h3 class="text-danger">Erreur de chargement</h3>
                    <p class="text-muted">Impossible de charger les documents</p>
                    <button class="btn btn-primary mt-2" onclick="DocumentsNotion.loadDocuments()">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des documents', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des documents
    if (window.location.pathname.includes('documents.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                DocumentsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.DocumentsNotion = DocumentsNotion;