// Finance OCR Integration
const FinanceOCR = {
    // URL absolue pour fonctionner même en file://
    OCR_SERVICE_URL: 'http://localhost:3001/api/ocr',
    
    init() {
        this.preventDefaultDragDrop();
        this.setupDropzone();
        this.checkServiceStatus();
    },
    
    preventDefaultDragDrop() {
        // Empêcher le comportement par défaut du navigateur pour le drag & drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
    },
    
    checkServiceStatus() {
        // URL absolue pour fonctionner même en file://
        const healthUrl = 'http://localhost:3001/health';
            
        fetch(healthUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'healthy') {
                    console.log('✅ Service OCR opérationnel');
                    // Afficher un badge de statut
                    const statusBadge = document.createElement('span');
                    statusBadge.className = 'badge bg-green ms-2';
                    statusBadge.textContent = 'OCR Actif';
                    const pageTitle = document.querySelector('.page-title');
                    if (pageTitle && !pageTitle.querySelector('.badge')) {
                        pageTitle.appendChild(statusBadge);
                    }
                }
            })
            .catch(error => {
                console.error('⚠️ Service OCR non disponible:', error);
                // Afficher un badge d'erreur
                const statusBadge = document.createElement('span');
                statusBadge.className = 'badge bg-red ms-2';
                statusBadge.textContent = 'OCR Hors ligne';
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle && !pageTitle.querySelector('.badge')) {
                    pageTitle.appendChild(statusBadge);
                }
            });
    },
    
    setupDropzone() {
        // Détruire l'instance existante si elle existe
        if (Dropzone.instances.length > 0) {
            Dropzone.instances.forEach(dz => dz.destroy());
        }
        
        // Créer une nouvelle instance de Dropzone
        const dropzoneElement = document.getElementById("dropzone");
        if (!dropzoneElement) {
            console.error("❌ Element dropzone non trouvé!");
            return;
        }
        
        const myDropzone = new Dropzone("#dropzone", {
            url: `${this.OCR_SERVICE_URL}/process`,
            paramName: "document",
            maxFilesize: 10,
            acceptedFiles: ".pdf,.jpg,.jpeg,.png,.heic",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            addRemoveLinks: true,
            dictDefaultMessage: `
                <i class="ti ti-file-upload" style="font-size: 48px; color: var(--tblr-secondary);"></i>
                <h3 class="mt-4">Glissez vos documents ici</h3>
                <p class="text-secondary">
                    Factures, reçus, notes de frais, relevés bancaires<br>
                    Formats acceptés : PDF, JPG, PNG, HEIC • Max 10MB
                </p>
            `,
            init: function() {
                console.log("✅ Dropzone initialisée");
                
                this.on("sending", function(file, xhr, formData) {
                    // Add document type
                    formData.append("documentType", "invoice");
                    formData.append("options", JSON.stringify({
                        confidence: true,
                        preprocessing: true
                    }));
                });
                
                this.on("success", function(file, response) {
                    console.log("✅ OCR terminé:", response);
                    
                    // Display results
                    FinanceOCR.displayResults(file, response);
                    
                    // Show success notification
                    const notification = document.createElement('div');
                    notification.className = 'alert alert-success alert-dismissible position-fixed top-0 end-0 m-3';
                    notification.style.zIndex = '9999';
                    notification.innerHTML = `
                        <div class="d-flex">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M5 12l5 5l10 -10"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="alert-title">Document traité avec succès!</h4>
                                <div class="text-secondary">${file.name} - ${response.metadata.processingTime}ms</div>
                            </div>
                        </div>
                        <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                    `;
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.remove();
                    }, 5000);
                });
                
                this.on("error", function(file, errorMessage) {
                    console.error("❌ Erreur OCR:", errorMessage);
                    
                    // Show error notification
                    const notification = document.createElement('div');
                    notification.className = 'alert alert-danger alert-dismissible position-fixed top-0 end-0 m-3';
                    notification.style.zIndex = '9999';
                    notification.innerHTML = `
                        <div class="d-flex">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <circle cx="12" cy="12" r="9"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div>
                                <h4 class="alert-title">Erreur lors du traitement</h4>
                                <div class="text-secondary">${file.name} - ${errorMessage}</div>
                            </div>
                        </div>
                        <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                    `;
                    document.body.appendChild(notification);
                });
            }
        };
    },
    
    displayResults(file, response) {
        // Create a new row in the recent documents table
        const tbody = document.querySelector('.table tbody');
        const newRow = document.createElement('tr');
        
        // Extract key data
        const extractedData = response.extractedData;
        const supplier = extractedData.supplier?.name || 'Non détecté';
        const invoiceNumber = extractedData.invoice?.number || file.name;
        const totalAmount = extractedData.amounts?.total?.value || 'Non détecté';
        const confidence = response.confidence || 0;
        
        // Determine confidence badge color
        let confidenceBadge = 'bg-green';
        if (confidence < 0.8) confidenceBadge = 'bg-yellow';
        if (confidence < 0.6) confidenceBadge = 'bg-red';
        
        newRow.innerHTML = `
            <td data-label="Document">
                <div class="d-flex py-1 align-items-center">
                    <span class="avatar me-2" style="background-image: url(https://eu.ui-avatars.com/api/?name=OCR&background=206bc4&color=fff)">OCR</span>
                    <div class="flex-fill">
                        <div class="font-weight-medium">${invoiceNumber}</div>
                        <div class="text-secondary">
                            <a href="#" class="text-reset" onclick="FinanceOCR.showDetails('${btoa(JSON.stringify(response))}')">Voir les détails</a>
                        </div>
                    </div>
                </div>
            </td>
            <td data-label="Type">
                <span class="badge bg-blue-lt">Facture</span>
            </td>
            <td class="text-secondary" data-label="Fournisseur">
                ${supplier}
            </td>
            <td class="text-secondary" data-label="Montant">
                ${totalAmount}
            </td>
            <td data-label="Statut">
                <span class="badge ${confidenceBadge}">OCR ${Math.round(confidence * 100)}%</span>
            </td>
            <td class="text-secondary" data-label="Date">
                À l'instant
            </td>
            <td>
                <div class="btn-list flex-nowrap">
                    <a href="#" class="btn btn-green btn-sm" onclick="FinanceOCR.validateDocument('${btoa(JSON.stringify(response))}')">
                        Valider
                    </a>
                </div>
            </td>
        `;
        
        // Insert at the beginning of the table
        tbody.insertBefore(newRow, tbody.firstChild);
    },
    
    showDetails(encodedData) {
        const data = JSON.parse(atob(encodedData));
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal modal-blur fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de l'extraction OCR</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <h4>Données extraites</h4>
                        <pre class="bg-gray-100 p-3 rounded">${JSON.stringify(data.extractedData, null, 2)}</pre>
                        
                        <h4 class="mt-4">Métadonnées</h4>
                        <ul>
                            <li>Temps de traitement: ${data.metadata.processingTime}ms</li>
                            <li>Confiance: ${Math.round((data.confidence || 0) * 100)}%</li>
                            <li>Langue détectée: ${data.metadata.language}</li>
                        </ul>
                        
                        <h4 class="mt-4">Texte brut</h4>
                        <div class="bg-gray-100 p-3 rounded" style="max-height: 300px; overflow-y: auto;">
                            ${data.text.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fermer</button>
                        <button type="button" class="btn btn-primary" onclick="FinanceOCR.validateDocument('${encodedData}')">Valider et créer la facture</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.onclick = () => {
            modal.remove();
            backdrop.remove();
        };
        document.body.appendChild(backdrop);
    },
    
    validateDocument(encodedData) {
        const data = JSON.parse(atob(encodedData));
        console.log('Validation du document:', data);
        
        // Here you would normally send the validated data to your backend
        alert('Document validé! Les données seront créées dans le système.');
        
        // Close modal if open
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    FinanceOCR.init();
});