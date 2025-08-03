/**
 * OCR Drag & Drop Fix - Correction complète du système de dépôt de fichiers
 * @version 1.0.0
 */
const OCRDragDropFix = {
    init() {
        console.log('🔧 Initialisation Drag & Drop OCR Fix...');
        
        // Empêcher IMMÉDIATEMENT le comportement par défaut
        this.preventDefaultBehaviors();
        
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDropzones());
        } else {
            this.setupDropzones();
        }
    },

    preventDefaultBehaviors() {
        // CRUCIAL : Empêcher l'ouverture des fichiers sur TOUT le document
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            // Sur document avec capture
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, true);
            
            // Sur window aussi pour double sécurité
            window.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, true);
        });

        // Empêcher aussi sur body
        document.body.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'none';
            return false;
        });

        document.body.addEventListener('drop', e => {
            e.preventDefault();
            return false;
        });

        console.log('✅ Comportements par défaut désactivés globalement');
    },

    setupDropzones() {
        // Trouver TOUTES les zones de drop possibles
        const dropzoneSelectors = [
            '.dropzone',
            '#dropzone',
            '#ocr-dropzone',
            '#main-dropzone',
            '.dz-clickable',
            '[data-dropzone]'
        ];
        
        let dropzoneFound = false;
        
        dropzoneSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && !element.hasAttribute('data-dropzone-initialized')) {
                    this.initializeDropzone(element);
                    element.setAttribute('data-dropzone-initialized', 'true');
                    dropzoneFound = true;
                    console.log(`✅ Dropzone initialisée: ${selector}`);
                }
            });
        });
        
        if (!dropzoneFound) {
            console.error('❌ Aucune zone de drop trouvée! Vérifiez les sélecteurs.');
        }
    },

    initializeDropzone(dropzone) {
        // Réinitialiser les classes
        dropzone.classList.remove('dz-started');
        
        // Events de drag
        dropzone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover', 'dz-drag-hover');
            console.log('🎯 Fichier entre dans la zone');
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Vérifier si on quitte vraiment la zone
            const rect = dropzone.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX >= rect.right || 
                e.clientY < rect.top || e.clientY >= rect.bottom) {
                dropzone.classList.remove('dragover', 'dz-drag-hover');
            }
        });

        // DROP - Le plus important !
        dropzone.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            dropzone.classList.remove('dragover', 'dz-drag-hover');
            
            const files = Array.from(e.dataTransfer.files);
            console.log('📁 Fichiers déposés:', files);
            
            if (files.length > 0) {
                // Traiter les fichiers avec OCR
                await this.handleFiles(files, dropzone);
            }
            
            return false;
        });

        // Click pour ouvrir le sélecteur
        dropzone.addEventListener('click', (e) => {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                this.triggerFileInput();
            }
        });
    },

    async handleFiles(files, dropzone) {
        console.log('🚀 Traitement de', files.length, 'fichier(s)');
        
        // Si Dropzone.js est utilisé
        if (window.Dropzone && dropzone.dropzone) {
            files.forEach(file => {
                dropzone.dropzone.addFile(file);
            });
            return;
        }
        
        // Sinon, utiliser OCRProcessor directement
        if (window.OCRProcessor) {
            // Simuler l'objet Dropzone pour compatibilité
            if (!window.OCRProcessor.dropzone) {
                window.OCRProcessor.dropzone = {
                    files: [],
                    getQueuedFiles: () => window.OCRProcessor.dropzone.files,
                    addFile: (file) => {
                        file.status = 'queued';
                        file.previewElement = OCRDragDropFix.createPreviewElement(file);
                        window.OCRProcessor.dropzone.files.push(file);
                    }
                };
            }
            
            // Ajouter les fichiers
            files.forEach(file => {
                window.OCRProcessor.dropzone.addFile(file);
            });
            
            // Traiter automatiquement
            await window.OCRProcessor.processAllFiles();
        } else {
            console.error('❌ OCRProcessor non disponible');
            alert('Le module OCR n\'est pas chargé correctement');
        }
    },

    createPreviewElement(file) {
        const preview = document.createElement('div');
        preview.className = 'dz-preview dz-file-preview';
        preview.innerHTML = `
            <div class="dz-details">
                <div class="dz-filename"><span data-dz-name>${file.name}</span></div>
                <div class="dz-size" data-dz-size>${this.formatFileSize(file.size)}</div>
            </div>
            <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
            <div class="dz-success-mark">✅</div>
            <div class="dz-error-mark">❌</div>
            <div class="dz-error-message"><span data-dz-errormessage></span></div>
        `;
        
        // Ajouter au conteneur de résultats
        const container = document.getElementById('ocr-results-container') || 
                         document.querySelector('.results-container') ||
                         document.querySelector('.dropzone');
        
        if (container) {
            container.appendChild(preview);
        }
        
        return preview;
    },

    triggerFileInput() {
        // Chercher l'input file
        const fileInput = document.querySelector('input[type="file"][accept*="pdf"]') ||
                         document.getElementById('fileInput') ||
                         document.querySelector('input[type="file"]');
        
        if (fileInput) {
            fileInput.click();
        } else {
            // Créer un input temporaire
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.multiple = true;
            tempInput.accept = '.pdf,.jpg,.jpeg,.png,.heic';
            tempInput.style.display = 'none';
            
            tempInput.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    await this.handleFiles(files, document.querySelector('.dropzone'));
                }
                document.body.removeChild(tempInput);
            });
            
            document.body.appendChild(tempInput);
            tempInput.click();
        }
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Initialisation IMMÉDIATE pour capturer tous les events
OCRDragDropFix.init();

// Ré-initialiser après chargement complet si nécessaire
window.addEventListener('load', () => {
    setTimeout(() => {
        OCRDragDropFix.setupDropzones();
    }, 100);
});

// Export global
window.OCRDragDropFix = OCRDragDropFix;