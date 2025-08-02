/**
 * Document Preview
 * Gestion de l'aperçu, validation et partage des documents
 */

// Document actuel
let currentDocument = null;

// Charger les détails du document
function loadDocument(docId) {
    // Récupérer le document depuis documentsData (défini dans documents.js)
    currentDocument = window.documentsData ? window.documentsData.find(d => d.id == docId) : null;
    
    if (!currentDocument) {
        // Document par défaut pour la démo
        currentDocument = {
            id: 1,
            name: "Contrat_Principal_2024.pdf",
            type: "contract",
            fileType: "pdf",
            size: 2516582,
            sizeFormatted: "2.4 MB",
            date: new Date("2024-01-15"),
            project: "Refonte Site Web",
            projectId: 1,
            status: "validated",
            author: "Marie D.",
            description: "Contrat principal pour le projet de refonte du site web corporate. Inclut tous les livrables et échéances."
        };
    }
    
    // Mettre à jour l'interface
    updateDocumentInfo();
    
    // Charger le preview selon le type
    loadPreview();
}

// Mettre à jour les informations du document
function updateDocumentInfo() {
    // Titre et breadcrumb
    document.getElementById('doc-name').textContent = currentDocument.name;
    document.getElementById('doc-name-breadcrumb').textContent = currentDocument.name;
    
    // Détails
    document.getElementById('doc-type').textContent = getFileTypeLabel(currentDocument.fileType);
    document.getElementById('doc-size').textContent = currentDocument.sizeFormatted;
    document.getElementById('doc-date').textContent = currentDocument.date.toLocaleDateString('fr-CH');
    document.getElementById('doc-author').textContent = currentDocument.author;
    
    // Description
    const descTextarea = document.querySelector('textarea[placeholder="Ajouter une description..."]');
    if (descTextarea && currentDocument.description) {
        descTextarea.value = currentDocument.description;
    }
}

// Obtenir le label du type de fichier
function getFileTypeLabel(fileType) {
    const labels = {
        'pdf': 'PDF',
        'word': 'Document Word',
        'excel': 'Feuille de calcul Excel',
        'image': 'Image',
        'archive': 'Archive compressée'
    };
    return labels[fileType] || 'Document';
}

// Charger le preview
function loadPreview() {
    // Masquer tous les previews
    document.getElementById('pdf-preview').style.display = 'none';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('office-preview').style.display = 'none';
    document.getElementById('default-preview').style.display = 'none';
    
    switch(currentDocument.fileType) {
        case 'pdf':
            loadPDFPreview();
            break;
        case 'image':
            loadImagePreview();
            break;
        case 'word':
        case 'excel':
            document.getElementById('office-preview').style.display = 'block';
            break;
        default:
            document.getElementById('default-preview').style.display = 'block';
    }
}

// Charger preview PDF
function loadPDFPreview() {
    const pdfPreview = document.getElementById('pdf-preview');
    pdfPreview.style.display = 'block';
    
    // En production, charger le vrai PDF
    // Pour la démo, afficher un placeholder
    pdfPreview.src = 'data:application/pdf;base64,JVBERi0xLjMKJeLjz9MKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL091dGxpbmVzIDIgMCBSCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzQgMCBSXQo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA5IDAgUiAKPj4KL1Byb2NTZXQgOCAwIFIKPj4KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjUgMCBvYmoKPDwgL0xlbmd0aCA2IDAgUiA+PgpzdHJlYW0KMi4wMDAgdy0wIEcKQlQKL0YxIDE4IFRmCjAgMCAwIHJnCjQ1LjAwMCA3NTIuMDAwIFRkCihTYW1wbGUgUERGIERvY3VtZW50KSBUagpFVApCVAovRjEgMTIgVGYKMCAwIDAgcmcKNDUuMDAwIDcwMC4wMDAgVGQKKFRoaXMgaXMgYSBzYW1wbGUgUERGIGRvY3VtZW50IGZvciBwcmV2aWV3IHB1cnBvc2VzLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKNiAwIG9iagoxODQKZW5kb2JqCgo3IDAgb2JqCjw8Ci9UeXBlIC9Gb250RGVzY3JpcHRvcgovQXNjZW50IDc1MAovQ2FwSGVpZ2h0IDY2MgovRGVzY2VudCAtMjUwCi9GbGFncyAzMgovRm9udEJCb3ggWy00NSAtMjEwIDEwNDAgNzUwXQovRm9udE5hbWUgL0FyaWFsCi9JdGFsaWNBbmdsZSAwCi9TdGVtViA4MAovWEhlaWdodCA1NDIKL1N0ZW1IIDgwCj4+CmVuZG9iagoKOCAwIG9iagpbL1BERiAvVGV4dF0KZW5kb2JqCgo5IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UcnVlVHlwZQovTmFtZSAvRjEKL0Jhc2VGb250IC9BcmlhbAovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwovRm9udERlc2NyaXB0b3IgNyAwIFIKPj4KZW5kb2JqCgoxMCAwIG9iago8PAovQ3JlYXRvciAoU2FtcGxlIENyZWF0b3IpCi9Qcm9kdWNlciAoU2FtcGxlIFByb2R1Y2VyKQovQ3JlYXRpb25EYXRlIChEOjIwMjQwMTE1MTQzMDAwKQo+PgplbmRvYmoKCnhyZWYKMCAxMQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5MyAwMDAwMCBuIAowMDAwMDAwMTQ3IDAwMDAwIG4gCjAwMDAwMDAyMjIgMDAwMDAgbiAKMDAwMDAwMDM5MCAwMDAwMCBuIAowMDAwMDAwNjI1IDAwMDAwIG4gCjAwMDAwMDA2NDUgMDAwMDAgbiAKMDAwMDAwMDg3MSAwMDAwMCBuIAowMDAwMDAwOTA0IDAwMDAwIG4gCjAwMDAwMDEwNDggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSAxMQovUm9vdCAxIDAgUgovSW5mbyAxMCAwIFIKPj4Kc3RhcnR4cmVmCjExNjEKJSVFT0YK';
}

// Charger preview image
function loadImagePreview() {
    const imagePreview = document.getElementById('image-preview');
    imagePreview.style.display = 'block';
    
    // En production, charger la vraie image
    // Pour la démo, utiliser un placeholder
    const img = imagePreview.querySelector('img');
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5OTk5OTkiPk1hcXVldHRlIEhvbWVwYWdlPC90ZXh0Pgo8L3N2Zz4=';
    
    // Zoom sur clic
    img.style.cursor = 'zoom-in';
    img.onclick = function() {
        // Créer un modal lightbox
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop show';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 p-4" onclick="this.parentElement.remove()">
                <img src="${img.src}" class="img-fluid" style="max-height: 90vh; cursor: zoom-out;">
            </div>
        `;
        document.body.appendChild(modal);
    };
}

// Actions du document
function downloadDocument() {
    if (currentDocument) {
        PortalApp.showToast(`Téléchargement de "${currentDocument.name}" démarré`, "info");
        
        // Simulation du téléchargement
        setTimeout(() => {
            PortalApp.showToast(`"${currentDocument.name}" téléchargé avec succès`, "success");
        }, 2000);
    }
}

function printDocument() {
    if (currentDocument.fileType === 'pdf' || currentDocument.fileType === 'image') {
        window.print();
    } else {
        PortalApp.showToast("Ce type de document ne peut pas être imprimé directement", "warning");
    }
}

function shareDocument() {
    // Utiliser la fonction de partage depuis la page
    generateShareLink();
}

function moveDocument() {
    // Modal pour choisir le dossier de destination
    const folders = ['Contrats', 'Livrables', 'Factures', 'Resources', 'Archives'];
    const destination = prompt(`Déplacer vers quel dossier ?\n${folders.join('\n')}`);
    
    if (destination) {
        PortalApp.showToast(`Document déplacé vers "${destination}"`, "success");
    }
}

function renameDocument() {
    const newName = prompt("Nouveau nom du fichier:", currentDocument.name);
    if (newName && newName !== currentDocument.name) {
        currentDocument.name = newName;
        updateDocumentInfo();
        PortalApp.showToast("Document renommé avec succès", "success");
    }
}

function deleteDocument() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${currentDocument.name}" ?`)) {
        PortalApp.showToast("Document supprimé avec succès", "success");
        
        // Retour à la liste après 1 seconde
        setTimeout(() => {
            window.location.href = 'documents.html';
        }, 1000);
    }
}

// Gestion du partage
function generateShareLink() {
    const duration = document.getElementById('share-duration').value;
    const usePassword = document.getElementById('share-password').checked;
    const password = document.getElementById('share-password-input').value;
    
    if (usePassword && !password) {
        PortalApp.showToast("Veuillez entrer un mot de passe", "warning");
        return;
    }
    
    // Générer un ID unique
    const shareId = Math.random().toString(36).substr(2, 9);
    const shareLink = `https://portal.ch/share/${shareId}`;
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(shareLink).then(() => {
        PortalApp.showToast("Lien de partage copié dans le presse-papier", "success");
        
        // Afficher les partages actifs
        document.getElementById('active-shares').style.display = 'block';
        
        // Ajouter le nouveau partage à la liste (simulation)
        addActiveShare(shareLink, duration);
    });
}

// Ajouter un partage actif
function addActiveShare(link, duration) {
    const activeSharesList = document.querySelector('#active-shares .list-group');
    
    const durationLabels = {
        '24h': '1 jour',
        '7d': '7 jours',
        '30d': '30 jours'
    };
    
    const newShare = document.createElement('div');
    newShare.className = 'list-group-item px-0';
    newShare.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="flex-fill">
                <div class="text-muted small">Expire dans ${durationLabels[duration]}</div>
                <div class="text-truncate small">${link}</div>
            </div>
            <button class="btn btn-ghost-danger btn-icon btn-sm" onclick="this.closest('.list-group-item').remove()">
                <i class="ti ti-trash"></i>
            </button>
        </div>
    `;
    
    activeSharesList.appendChild(newShare);
}

// Afficher le modal de signature
function showSignatureModal() {
    const modal = new bootstrap.Modal(document.getElementById('modal-signature'));
    modal.show();
}

// Vérifier la signature
function verifySignature() {
    // Simulation de vérification
    PortalApp.showToast("Signature vérifiée et authentique", "success");
    
    // Animation de vérification
    const icon = document.createElement('i');
    icon.className = 'ti ti-shield-check icon text-success';
    icon.style.fontSize = '48px';
    
    const modalBody = document.querySelector('#modal-signature .modal-body');
    modalBody.appendChild(icon);
    
    setTimeout(() => {
        icon.remove();
    }, 2000);
}

// Gestion des tags
function initTags() {
    const tagInput = document.querySelector('.tags-input input');
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tagText = this.value.trim();
                if (tagText) {
                    addTag(tagText);
                    this.value = '';
                }
            }
        });
    }
}

// Ajouter un tag
function addTag(text) {
    const tagsContainer = document.querySelector('.tags-input');
    const newTag = document.createElement('span');
    newTag.className = 'badge bg-blue-lt me-1';
    newTag.innerHTML = `${text} <i class="ti ti-x ms-1" style="cursor: pointer;" onclick="this.parentElement.remove()"></i>`;
    
    // Insérer avant l'input
    const input = tagsContainer.querySelector('input');
    tagsContainer.insertBefore(newTag, input);
}

// Sauvegarder les modifications
function saveDocumentChanges() {
    // Récupérer la description
    const description = document.querySelector('textarea[placeholder="Ajouter une description..."]').value;
    
    // Récupérer les tags
    const tags = Array.from(document.querySelectorAll('.tags-input .badge')).map(badge => 
        badge.textContent.replace(' ×', '').trim()
    );
    
    // Sauvegarder (simulation)
    currentDocument.description = description;
    currentDocument.tags = tags;
    
    PortalApp.showToast("Modifications sauvegardées", "success");
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les tags
    initTags();
    
    // Auto-save de la description
    const descTextarea = document.querySelector('textarea[placeholder="Ajouter une description..."]');
    if (descTextarea) {
        let saveTimeout;
        descTextarea.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveDocumentChanges();
            }, 2000); // Sauvegarde après 2 secondes d'inactivité
        });
    }
    
    // Animation d'entrée
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