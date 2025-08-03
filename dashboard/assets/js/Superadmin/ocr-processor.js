/**
 * Module OCR Processor - Version Microservice Docker avec Monitoring
 * @version 2.1.0
 */
const OCRProcessor = {
  OCR_SERVICE_URL: window.location.protocol === 'file:' 
    ? 'http://localhost:3001/api/ocr'
    : window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/ocr'
      : '/api/ocr',
  
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  dropzone: null,
  
  init() {
    console.log('🔍 Initialisation OCR Processor v2.0 (Docker)');
    this.checkServiceHealth();
    this.setupDropzone();
    this.bindEvents();
  },

  async checkServiceHealth() {
    // Skip health check si on est en file://
    if (window.location.protocol === 'file:') {
      console.warn('⚠️ Mode file:// détecté - health check désactivé');
      this.updateServiceStatus(false, { message: 'Mode local file://' });
      return;
    }
    
    try {
      const baseUrl = this.OCR_SERVICE_URL.replace('/api/ocr', '');
      const response = await fetch(`${baseUrl}/health`);
      const health = await response.json();
      
      this.updateServiceStatus(health.status === 'healthy', health);
    } catch (error) {
      console.error('❌ Service OCR indisponible:', error);
      this.updateServiceStatus(false);
    }
  },

  updateServiceStatus(isHealthy, details = {}) {
    const statusEl = document.getElementById('ocr-service-status');
    if (!statusEl) return;
    
    statusEl.innerHTML = `
      <div class="alert alert-${isHealthy ? 'success' : 'warning'} mb-3">
        <h4 class="alert-title">Service OCR ${isHealthy ? 'Opérationnel' : 'Dégradé'}</h4>
        ${details.version ? `<div>Version: ${details.version}</div>` : ''}
        ${details.uptime ? `<div>Uptime: ${Math.round(details.uptime / 60)}min</div>` : ''}
      </div>
    `;
  },

  setupDropzone() {
    const dropzoneElement = document.getElementById('dropzone');
    console.log('🎯 Dropzone trouvée:', dropzoneElement ? 'OUI' : 'NON');
    if (!dropzoneElement) return;

    // DÉSACTIVER Dropzone.js qui interfère avec nos events
    // Utiliser uniquement notre système personnalisé
    console.log('ℹ️ Dropzone.js désactivé - utilisation du système d\'events personnalisé');
    
    // Stocker la référence pour compatibilité
    this.dropzone = {
      files: [],
      getQueuedFiles: () => this.dropzone.files,
      addFile: (file) => {
        file.id = this.generateFileId();
        file.status = 'queued';
        this.dropzone.files.push(file);
      }
    };
  },

  bindEvents() {
    const processBtn = document.getElementById('btn-process-ocr');
    if (processBtn) {
      processBtn.addEventListener('click', () => this.processAllFiles());
    }
  },

  async processAllFiles() {
    const files = this.dropzone.getQueuedFiles();
    if (files.length === 0) return;

    for (const file of files) {
      await this.processSingleFile(file);
    }
  },

  async processSingleFile(file) {
    const startTime = performance.now();
    let mode = 'tesseract';
    
    try {
      let result;
      let processFile = file;
      
      // Charger les dépendances si nécessaire
      await this.loadDependencies();
      
      // FORCER TESSERACT DIRECTEMENT - PAS DE DOCKER
      console.log('🔄 Utilisation Tesseract.js directement (pas de Docker)');
      this.updateFileStatus(file, 'processing', 'Traitement OCR...');
      
      // Si c'est un PDF, convertir en image d'abord
      if (file.type === 'application/pdf') {
        console.log('📄 PDF détecté - conversion en image nécessaire');
        this.updateFileStatus(file, 'processing', 'Conversion PDF → Image...');
        processFile = await this.convertPDFToImage(file);
        console.log('✅ PDF converti en image');
      }
      
      // Utiliser directement Tesseract fallback
      if (window.OCRFallback) {
        result = await window.OCRFallback.processImage(processFile);
      } else {
        // Si OCRFallback pas encore chargé, faire un OCR simple
        console.log('📄 OCR simple direct...');
        const ocrResult = await Tesseract.recognize(
          processFile,
          'fra+eng'
          // Pas de logger pour éviter DataCloneError
        );
        
        result = {
          success: true,
          text: ocrResult.data.text,
          confidence: ocrResult.data.confidence,
          extractedData: {},
          metadata: { fallbackMode: true }
        };
      }

      // Enrichir avec patterns suisses
      if (window.SwissPatterns && result.text) {
        result.extractedData = this.enrichWithSwissPatterns(result.text, result.extractedData);
      }

      const processingTime = performance.now() - startTime;
      
      // Tracking metrics
      if (window.OCRMetrics) {
        window.OCRMetrics.trackProcessing({
          mode,
          duration: processingTime,
          success: true,
          fileSize: file.size,
          fileType: file.type,
          confidence: result.confidence || 0,
          extractedFields: result.extractedData || {},
          language: result.metadata?.language || 'unknown'
        });
      }

      if (result.success || result.text) {
        this.handleOCRResult(file, result);
      } else {
        this.updateFileStatus(file, 'error', result.error || 'Échec OCR');
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      this.updateFileStatus(file, 'error', error.message);
      
      // Track error
      if (window.OCRMetrics) {
        window.OCRMetrics.trackProcessing({
          mode,
          duration: performance.now() - startTime,
          success: false,
          fileSize: file.size,
          fileType: file.type,
          error: { type: error.name, message: error.message }
        });
      }
    }
  },

  async loadDependencies() {
    // Charger OCR Fallback
    if (!window.OCRFallback) {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = '../../assets/js/Superadmin/ocr-fallback.js';
      document.body.appendChild(fallbackScript);
      await new Promise(resolve => fallbackScript.onload = resolve);
    }
    
    // Charger Swiss Patterns
    if (!window.SwissPatterns) {
      const patternsScript = document.createElement('script');
      patternsScript.src = '../../assets/js/Superadmin/swiss-patterns.js';
      document.body.appendChild(patternsScript);
      await new Promise(resolve => patternsScript.onload = resolve);
    }
    
    // Charger OCR Metrics
    if (!window.OCRMetrics) {
      const metricsScript = document.createElement('script');
      metricsScript.src = '../../assets/js/Superadmin/ocr-metrics.js';
      document.body.appendChild(metricsScript);
      await new Promise(resolve => metricsScript.onload = resolve);
    }
  },

  enrichWithSwissPatterns(text, existingData = {}) {
    const enriched = { ...existingData };
    
    // Extraire avec les patterns suisses
    const amounts = SwissPatterns.extract.amounts(text);
    const supplier = SwissPatterns.extract.supplier(text);
    
    // CHE/IDE
    const cheMatch = text.match(SwissPatterns.business_ids.che);
    if (cheMatch) {
      enriched.supplier = enriched.supplier || {};
      enriched.supplier.vatNumber = cheMatch[0];
      enriched.supplier.vatValid = SwissPatterns.validators.isValidCHE(cheMatch[0]);
    }
    
    // IBAN
    const ibanMatch = text.match(SwissPatterns.business_ids.iban);
    if (ibanMatch) {
      enriched.banking = enriched.banking || {};
      enriched.banking.iban = ibanMatch[0];
      enriched.banking.ibanValid = SwissPatterns.validators.isValidSwissIBAN(ibanMatch[0]);
    }
    
    // Montants
    if (amounts.total) {
      enriched.amounts = enriched.amounts || {};
      enriched.amounts.total = {
        value: amounts.total.value,
        formatted: amounts.total.raw,
        currency: amounts.total.currency
      };
    }
    
    // Fournisseur
    if (supplier && !enriched.supplier?.name) {
      enriched.supplier = enriched.supplier || {};
      enriched.supplier.name = supplier.name;
      enriched.supplier.category = supplier.category;
    }
    
    return enriched;
  },

  handleOCRResult(file, result) {
    this.updateFileStatus(file, 'success', 'Terminé');
    
    // Sauvegarder le résultat pour debug
    window.lastOCRResult = result;
    
    // S'assurer que les données sont dans le bon format
    const displayData = {
      confidence: Math.round(result.confidence || 0),
      structuredData: result.extractedData || {},
      _rawText: result.text || ''
    };
    
    console.log('📤 Envoi données pour affichage:', displayData);
    this.displayResults(file, displayData);
    
    // Notification (si disponible)
    if (window.notyf) {
      window.notyf.success(
        `✅ ${file.name} traité (${displayData.confidence}% confiance)`
      );
    } else {
      console.log(`✅ ${file.name} traité (${displayData.confidence}% confiance)`);
    }
  },

  displayResults(file, result) {
    const container = document.getElementById('ocr-results-container');
    if (!container) return;

    const resultCard = document.createElement('div');
    resultCard.className = 'card mb-3';
    resultCard.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${file.name}</h3>
        <span class="badge bg-${result.confidence > 80 ? 'success' : 'warning'}">
          ${result.confidence}% confiance
        </span>
      </div>
      <div class="card-body">
        ${this.renderInvoiceData(result.structuredData)}
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" onclick="OCRProcessor.validateAndSave('${file.id}')">
          Valider et enregistrer
        </button>
      </div>
    `;

    container.appendChild(resultCard);
  },

  renderInvoiceData(data) {
    console.log('📊 Données reçues pour affichage:', data);
    
    // PROTECTION contre undefined ou null
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Données invalides:', data);
      data = {};
    }
    
    // Créer une structure sécurisée avec valeurs par défaut
    const safeData = {
      supplier: {
        name: data.supplier?.name || 'Non détecté',
        email: data.supplier?.email || '',
        vatNumber: data.supplier?.vatNumber || '',
        phone: data.supplier?.phone || ''
      },
      invoice: {
        number: data.invoice?.number || '',
        date: data.invoice?.date || ''
      },
      amounts: {
        total: data.amounts?.total?.value || data.amounts?.total || '',
        vatAmount: data.amounts?.vatAmount || '',
        currency: data.amounts?.total?.currency || 'CHF'
      },
      banking: {
        iban: data.banking?.iban || ''
      }
    };
    
    console.log('📊 Données sécurisées:', safeData);
    
    let html = '<div class="row">';
    
    // Fournisseur
    html += '<div class="col-md-6"><h4>Fournisseur</h4><dl>';
    if (safeData.supplier.name) {
      html += `<dt>Nom:</dt><dd><input class="form-control form-control-sm" value="${safeData.supplier.name}" data-field="supplier.name"></dd>`;
    }
    if (safeData.supplier.email) {
      html += `<dt>Email:</dt><dd><input class="form-control form-control-sm" value="${safeData.supplier.email}" data-field="supplier.email"></dd>`;
    }
    if (safeData.supplier.vatNumber) {
      html += `<dt>TVA:</dt><dd><input class="form-control form-control-sm" value="${safeData.supplier.vatNumber}" data-field="supplier.vatNumber"></dd>`;
    }
    html += '</dl></div>';
    
    // Facture
    html += '<div class="col-md-6"><h4>Facture</h4><dl>';
    if (safeData.invoice.number) {
      html += `<dt>Numéro:</dt><dd><input class="form-control form-control-sm" value="${safeData.invoice.number}" data-field="invoice.number"></dd>`;
    }
    if (safeData.invoice.date) {
      html += `<dt>Date:</dt><dd><input type="date" class="form-control form-control-sm" value="${safeData.invoice.date}" data-field="invoice.date"></dd>`;
    }
    html += '</dl></div>';
    
    // Montants
    html += '</div><h4>Montants</h4><dl class="row">';
    if (safeData.amounts.total) {
      html += `<dt class="col-4">Total ${safeData.amounts.currency}:</dt><dd class="col-8"><input type="number" class="form-control form-control-sm" value="${safeData.amounts.total}" data-field="amounts.total"></dd>`;
    }
    if (safeData.amounts.vatAmount) {
      html += `<dt class="col-4">TVA:</dt><dd class="col-8"><input type="number" class="form-control form-control-sm" value="${safeData.amounts.vatAmount}" data-field="amounts.vatAmount"></dd>`;
    }
    html += '</dl>';
    
    // IBAN si présent
    if (safeData.banking.iban) {
      html += '<h4>Coordonnées bancaires</h4><dl class="row">';
      html += `<dt class="col-4">IBAN:</dt><dd class="col-8"><input class="form-control form-control-sm" value="${safeData.banking.iban}" data-field="banking.iban"></dd>`;
      html += '</dl>';
    }
    
    // Afficher le texte brut pour debug
    if (data._rawText) {
      html += '<details class="mt-3"><summary>Texte OCR brut (debug)</summary>';
      html += `<pre class="bg-light p-2 small">${data._rawText.substring(0, 500)}...</pre>`;
      html += '</details>';
    }
    
    return html;
  },

  async validateAndSave(fileId) {
    // Collecter les données modifiées et sauvegarder dans Notion
    try {
      const editedData = this.collectEditedData(fileId);
      const response = await window.apiClient.createInvoice(editedData);
      
      if (response.success) {
        window.notyf?.success('✅ Facture enregistrée');
      }
    } catch (error) {
      window.notyf?.error(`Erreur: ${error.message}`);
    }
  },

  collectEditedData(fileId) {
    const inputs = document.querySelectorAll(`#result-${fileId} input[data-field]`);
    const data = {};
    
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      const value = input.type === 'number' ? parseFloat(input.value) : input.value;
      this.setNestedValue(data, field, value);
    });
    
    return data;
  },

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  },

  updateFileStatus(file, status, message) {
    // Créer un élément de statut simple si pas de preview
    if (!file.previewElement) {
      const container = document.getElementById('ocr-results-container');
      if (container) {
        const statusDiv = document.createElement('div');
        statusDiv.className = `alert alert-${status === 'error' ? 'danger' : 'info'} mb-2`;
        statusDiv.id = `status-${file.name}`;
        statusDiv.innerHTML = `<strong>${file.name}:</strong> ${message}`;
        
        // Remplacer si existe déjà
        const existing = document.getElementById(`status-${file.name}`);
        if (existing) {
          existing.replaceWith(statusDiv);
        } else {
          container.appendChild(statusDiv);
        }
      }
    } else {
      // Utiliser l'élément preview existant
      const element = file.previewElement;
      element.classList.remove('dz-processing', 'dz-success', 'dz-error');
      element.classList.add(`dz-${status}`);
      
      const statusEl = element.querySelector('.dz-error-message');
      if (statusEl) statusEl.textContent = message;
    }
  },

  generateFileId() {
    return 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  },
  
  async convertPDFToImage(file) {
    console.log('📄 Conversion PDF → Image...');
    
    // Vérifier que PDF.js est disponible
    if (!window.pdfjsLib) {
      throw new Error('PDF.js non disponible - impossible de convertir le PDF');
    }
    
    try {
      // Lire le PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`📄 PDF chargé: ${pdf.numPages} page(s)`);
      
      // Prendre la première page
      const page = await pdf.getPage(1);
      
      // Haute résolution pour meilleur OCR
      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      
      // Créer canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      console.log(`📐 Canvas: ${canvas.width}x${canvas.height}px`);
      
      // Rendre la page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      console.log('✅ Page PDF rendue sur canvas');
      
      // Convertir en blob PNG
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (blob) {
              // Créer un nouveau File object avec le nom original mais en .png
              const imageFile = new File(
                [blob], 
                file.name.replace('.pdf', '_page1.png'),
                { type: 'image/png' }
              );
              console.log(`✅ Image créée: ${imageFile.name} (${(imageFile.size/1024/1024).toFixed(2)} MB)`);
              resolve(imageFile);
            } else {
              reject(new Error('Échec conversion canvas → blob'));
            }
          },
          'image/png',
          1.0 // Qualité maximale
        );
      });
      
    } catch (error) {
      console.error('❌ Erreur conversion PDF:', error);
      throw error;
    }
  },

  rejectDocument() {
    const reason = document.getElementById('reject-reason').value;
    const comment = document.getElementById('reject-comment').value;
    
    console.log('Document rejeté:', { reason, comment });
    
    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-reject-ocr'));
    if (modal) modal.hide();
    
    // Notification
    window.notyf?.error(`Document rejeté: ${reason}`);
    
    // TODO: Envoyer au backend pour logging
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dropzone')) {
    OCRProcessor.init();
  }
});

window.OCRProcessor = OCRProcessor;