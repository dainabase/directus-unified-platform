/**
 * Documents Management
 * Gestion complète des documents avec Dropzone
 */

// Configuration Dropzone
Dropzone.autoDiscover = false;

// Données simulées des documents
const documentsData = [
    {
        id: 1,
        name: "Contrat_Principal_2024.pdf",
        type: "contract",
        fileType: "pdf",
        size: 2516582, // en bytes
        sizeFormatted: "2.4 MB",
        date: new Date("2024-01-15"),
        project: "Refonte Site Web",
        projectId: 1,
        status: "validated",
        icon: "ti-file-text",
        iconColor: "bg-red-lt",
        author: "Marie D.",
        isNew: true,
        folder: "contracts"
    },
    {
        id: 2,
        name: "Budget_Projet_2024.xlsx",
        type: "document",
        fileType: "excel",
        size: 876544,
        sizeFormatted: "856 KB",
        date: new Date("2024-01-10"),
        project: "Refonte Site Web",
        projectId: 1,
        status: "pending",
        icon: "ti-file-spreadsheet",
        iconColor: "bg-green-lt",
        author: "Jean P.",
        isNew: false,
        folder: "livrables"
    },
    {
        id: 3,
        name: "Maquette_Homepage_v2.jpg",
        type: "image",
        fileType: "image",
        size: 3355443,
        sizeFormatted: "3.2 MB",
        date: new Date("2024-01-12"),
        project: "Refonte Site Web",
        projectId: 1,
        status: "approved",
        icon: "ti-photo",
        iconColor: "bg-blue-lt",
        author: "Pierre L.",
        isNew: true,
        folder: "livrables"
    },
    {
        id: 4,
        name: "Cahier_des_charges_v3.docx",
        type: "document",
        fileType: "word",
        size: 1887437,
        sizeFormatted: "1.8 MB",
        date: new Date("2024-01-08"),
        project: "App Mobile",
        projectId: 2,
        status: "validated",
        icon: "ti-file-text",
        iconColor: "bg-azure-lt",
        author: "Marie D.",
        isNew: false,
        folder: "livrables"
    },
    {
        id: 5,
        name: "Facture_2024_001.pdf",
        type: "invoice",
        fileType: "pdf",
        size: 435200,
        sizeFormatted: "425 KB",
        date: new Date("2024-01-05"),
        project: "Refonte Site Web",
        projectId: 1,
        status: "validated",
        icon: "ti-file-invoice",
        iconColor: "bg-yellow-lt",
        author: "Comptabilité",
        isNew: false,
        folder: "factures"
    },
    // Plus de documents...
    {
        id: 6,
        name: "Logo_Variations.zip",
        type: "document",
        fileType: "archive",
        size: 15728640,
        sizeFormatted: "15 MB",
        date: new Date("2024-01-03"),
        project: "Refonte Site Web",
        projectId: 1,
        status: "approved",
        icon: "ti-file-zip",
        iconColor: "bg-purple-lt",
        author: "Design Team",
        isNew: false,
        folder: "resources"
    }
];

// Variables globales
let dropzoneInstance = null;
let currentView = 'grid';
let selectedFiles = new Set();
let currentFolder = '';

// Initialisation Dropzone
function initDropzone() {
    if (document.getElementById('documents-dropzone')) {
        dropzoneInstance = new Dropzone("#documents-dropzone", {
            url: "/upload", // URL simulée
            maxFilesize: 50, // MB
            acceptedFiles: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar",
            dictDefaultMessage: "Glissez vos fichiers ici ou cliquez pour parcourir",
            dictFileTooBig: "Fichier trop volumineux ({{filesize}}MB). Max: {{maxFilesize}}MB",
            dictInvalidFileType: "Type de fichier non autorisé",
            dictResponseError: "Erreur serveur: {{statusCode}}",
            dictCancelUpload: "Annuler",
            dictUploadCanceled: "Upload annulé",
            dictCancelUploadConfirmation: "Êtes-vous sûr de vouloir annuler cet upload ?",
            dictRemoveFile: "Supprimer",
            dictMaxFilesExceeded: "Vous ne pouvez pas uploader plus de fichiers",
            addRemoveLinks: true,
            
            init: function() {
                this.on("addedfile", function(file) {
                    // Animation d'upload
                    console.log("Fichier ajouté:", file.name);
                });
                
                this.on("uploadprogress", function(file, progress) {
                    console.log("Progression:", file.name, progress + "%");
                });
                
                this.on("success", function(file, response) {
                    // Simulation de succès
                    PortalApp.showToast(`Fichier "${file.name}" uploadé avec succès`, "success");
                    
                    // Recharger la liste après 1.5s
                    setTimeout(() => {
                        this.removeFile(file);
                        refreshDocumentsList();
                    }, 1500);
                });
                
                this.on("error", function(file, errorMessage) {
                    PortalApp.showToast(`Erreur: ${errorMessage}`, "danger");
                });
            }
        });
    }
}

// Toggle zone d'upload
function toggleUploadZone() {
    const uploadZone = document.getElementById('upload-zone');
    uploadZone.classList.toggle('show');
    
    // Focus sur la dropzone si ouverte
    if (uploadZone.classList.contains('show')) {
        uploadZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Changer de vue (grille/liste)
function setView(view) {
    currentView = view;
    localStorage.setItem('documents_view', view);
    
    // Mettre à jour les boutons
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-ghost-primary');
    });
    
    if (view === 'grid') {
        document.querySelector('[onclick="setView(\'grid\')"]').classList.remove('btn-ghost-primary');
        document.querySelector('[onclick="setView(\'grid\')"]').classList.add('btn-primary');
        document.getElementById('grid-view').style.display = 'flex';
        document.getElementById('list-view').style.display = 'none';
    } else {
        document.querySelector('[onclick="setView(\'list\')"]').classList.remove('btn-ghost-primary');
        document.querySelector('[onclick="setView(\'list\')"]').classList.add('btn-primary');
        document.getElementById('grid-view').style.display = 'none';
        document.getElementById('list-view').style.display = 'block';
    }
}

// Navigation dans les dossiers
function navigateToFolder(folder) {
    currentFolder = folder;
    updateBreadcrumb(folder);
    refreshDocumentsList();
    
    // Animation
    const cards = document.querySelectorAll('.file-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 50);
    });
}

// Mettre à jour le breadcrumb
function updateBreadcrumb(folder) {
    const breadcrumb = document.getElementById('folder-breadcrumb');
    let html = '<li class="breadcrumb-item"><a href="#" onclick="navigateToFolder(\'\')"><i class="ti ti-home icon"></i> Racine</a></li>';
    
    if (folder) {
        const folderNames = {
            'contracts': 'Contrats',
            'livrables': 'Livrables',
            'factures': 'Factures',
            'resources': 'Resources',
            'archives': 'Archives'
        };
        html += `<li class="breadcrumb-item active">${folderNames[folder] || folder}</li>`;
    }
    
    breadcrumb.innerHTML = html;
}

// Recherche en temps réel
function initSearch() {
    const searchInput = document.getElementById('search-documents');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterDocuments(searchTerm);
        });
    }
}

// Filtrer les documents
function filterDocuments(searchTerm = '') {
    const typeFilter = document.getElementById('filter-type').value;
    const sortBy = document.getElementById('sort-documents').value;
    
    let filteredDocs = documentsData;
    
    // Filtre par dossier
    if (currentFolder) {
        filteredDocs = filteredDocs.filter(doc => doc.folder === currentFolder);
    }
    
    // Filtre par recherche
    if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm) ||
            doc.project.toLowerCase().includes(searchTerm) ||
            doc.author.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtre par type
    if (typeFilter) {
        filteredDocs = filteredDocs.filter(doc => doc.type === typeFilter);
    }
    
    // Tri
    filteredDocs.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return b.date - a.date;
            case 'size':
                return b.size - a.size;
            case 'type':
                return a.fileType.localeCompare(b.fileType);
            default:
                return 0;
        }
    });
    
    // Afficher les résultats
    updateDocumentsDisplay(filteredDocs);
}

// Rafraîchir la liste des documents
function refreshDocumentsList() {
    filterDocuments();
}

// Actions sur les fichiers
function downloadFile(fileId) {
    const file = documentsData.find(f => f.id === fileId);
    if (file) {
        PortalApp.showToast(`Téléchargement de "${file.name}" démarré`, "info");
        // Simulation du téléchargement
        setTimeout(() => {
            PortalApp.showToast(`"${file.name}" téléchargé avec succès`, "success");
        }, 2000);
    }
}

function renameFile(fileId) {
    const file = documentsData.find(f => f.id === fileId);
    if (file) {
        const newName = prompt("Nouveau nom du fichier:", file.name);
        if (newName && newName !== file.name) {
            file.name = newName;
            PortalApp.showToast("Fichier renommé avec succès", "success");
            refreshDocumentsList();
        }
    }
}

function shareFile(fileId) {
    const file = documentsData.find(f => f.id === fileId);
    if (file) {
        // Générer un lien de partage
        const shareLink = `https://portal.ch/share/${Math.random().toString(36).substr(2, 9)}`;
        
        // Copier dans le presse-papier
        navigator.clipboard.writeText(shareLink).then(() => {
            PortalApp.showToast("Lien de partage copié dans le presse-papier", "success");
        });
    }
}

function deleteFile(fileId) {
    const file = documentsData.find(f => f.id === fileId);
    if (file && confirm(`Êtes-vous sûr de vouloir supprimer "${file.name}" ?`)) {
        // Supprimer du tableau
        const index = documentsData.findIndex(f => f.id === fileId);
        documentsData.splice(index, 1);
        
        PortalApp.showToast("Fichier supprimé avec succès", "success");
        refreshDocumentsList();
    }
}

// Créer un nouveau dossier
function createFolder() {
    const folderName = document.getElementById('new-folder-name').value;
    if (folderName) {
        PortalApp.showToast(`Dossier "${folderName}" créé avec succès`, "success");
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal-new-folder'));
        modal.hide();
        
        // Réinitialiser le champ
        document.getElementById('new-folder-name').value = '';
    }
}

// Gestion de la sélection multiple
function initMultiSelect() {
    // Select all checkbox
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.file-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = this.checked;
                const fileId = parseInt(cb.closest('tr').dataset.fileId);
                if (this.checked) {
                    selectedFiles.add(fileId);
                } else {
                    selectedFiles.delete(fileId);
                }
            });
            updateSelectionCounter();
        });
    }
}

// Mettre à jour le compteur de sélection
function updateSelectionCounter() {
    const counter = document.getElementById('selection-counter');
    const count = document.getElementById('selected-count');
    
    if (selectedFiles.size > 0) {
        counter.style.display = 'block';
        count.textContent = selectedFiles.size;
    } else {
        counter.style.display = 'none';
    }
}

// Effacer la sélection
function clearSelection() {
    selectedFiles.clear();
    document.querySelectorAll('.file-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('select-all').checked = false;
    updateSelectionCounter();
}

// Formater la taille des fichiers
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Formater la date relative
function formatRelativeDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    
    return date.toLocaleDateString('fr-CH');
}

// Raccourcis clavier
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+A - Tout sélectionner
        if (e.ctrlKey && e.key === 'a' && currentView === 'list') {
            e.preventDefault();
            document.getElementById('select-all').click();
        }
        
        // Delete - Supprimer la sélection
        if (e.key === 'Delete' && selectedFiles.size > 0) {
            if (confirm(`Supprimer ${selectedFiles.size} fichier(s) ?`)) {
                selectedFiles.forEach(fileId => {
                    const index = documentsData.findIndex(f => f.id === fileId);
                    if (index > -1) documentsData.splice(index, 1);
                });
                PortalApp.showToast(`${selectedFiles.size} fichier(s) supprimé(s)`, "success");
                clearSelection();
                refreshDocumentsList();
            }
        }
        
        // Esc - Fermer la zone d'upload
        if (e.key === 'Escape') {
            const uploadZone = document.getElementById('upload-zone');
            if (uploadZone.classList.contains('show')) {
                toggleUploadZone();
            }
        }
    });
}

// Mise à jour de l'affichage des documents
function updateDocumentsDisplay(documents) {
    // Pour la vue grille et liste, implémenter le rendu HTML
    // (Code similaire à la structure HTML existante mais généré dynamiquement)
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser Dropzone
    initDropzone();
    
    // Initialiser la recherche
    initSearch();
    
    // Initialiser les filtres
    document.getElementById('filter-type').addEventListener('change', () => filterDocuments());
    document.getElementById('sort-documents').addEventListener('change', () => filterDocuments());
    
    // Initialiser la sélection multiple
    initMultiSelect();
    
    // Initialiser les raccourcis clavier
    initKeyboardShortcuts();
    
    // Charger les documents
    refreshDocumentsList();
    
    // Double-click pour renommer (vue grille)
    document.addEventListener('dblclick', function(e) {
        const fileCard = e.target.closest('.file-card');
        if (fileCard && !e.target.closest('.folder-card')) {
            const fileId = parseInt(fileCard.dataset.fileId);
            if (fileId) renameFile(fileId);
        }
    });
});