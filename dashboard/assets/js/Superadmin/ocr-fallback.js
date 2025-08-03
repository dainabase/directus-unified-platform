/**
 * OCR Fallback - Tesseract.js pour mode hors-ligne
 */
const OCRFallback = {
  worker: null,
  isInitialized: false,

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Charger Tesseract.js dynamiquement
      if (!window.Tesseract) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
        document.head.appendChild(script);
        
        await new Promise(resolve => {
          script.onload = resolve;
        });
      }

      // Créer le worker SANS logger pour éviter DataCloneError
      this.worker = await Tesseract.createWorker();
      
      console.log('✅ Worker Tesseract créé avec succès');

      // Charger les langues
      await this.worker.loadLanguage('fra+eng');
      await this.worker.initialize('fra+eng');
      
      // Optimisations pour factures
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:-/€CHF()@éèêëàâäôöûüçÉÈÊËÀÂÄÔÖÛÜÇ',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO
      });

      this.isInitialized = true;
      console.log('✅ OCR Fallback initialisé');
    } catch (error) {
      console.error('❌ Erreur init OCR Fallback:', error);
      throw error;
    }
  },

  async processImage(file) {
    if (!this.isInitialized) await this.init();
    
    const startTime = Date.now();
    
    try {
      // Compression si fichier > 5MB
      let imageData = file;
      if (file.size > 5 * 1024 * 1024) {
        imageData = await this.compressImage(file);
      }

      // OCR
      const result = await this.worker.recognize(imageData);
      const processingTime = Date.now() - startTime;
      
      // Extraction des données
      const extractedData = this.extractInvoiceData(result.data.text);
      
      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence,
        extractedData,
        metadata: {
          processingTime,
          language: 'fra',
          fallbackMode: true
        }
      };
    } catch (error) {
      console.error('❌ Erreur OCR:', error);
      throw error;
    }
  },

  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Redimensionner si nécessaire
        const maxSize = 2000;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize/width, maxSize/height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/jpeg', 0.85);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  extractInvoiceData(text) {
    const patterns = {
      // Patterns suisses
      vatNumber: /CHE[-\s]?(\d{3}[-.\s]?\d{3}[-.\s]?\d{3})\s?(?:TVA|MWST|IVA)?/gi,
      invoiceNumber: /(?:Facture|Invoice|Rechnung)\s*(?:n°|Nr\.|#)?\s*:?\s*([A-Z0-9\-\/]+)/i,
      date: /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/g,
      amount: /CHF\s*([\d']+(?:[.,]\d{2})?)/gi,
      iban: /CH\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{1}/gi,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /(?:\+41|0041|0)\s?(?:\d{2})\s?\d{3}\s?\d{2}\s?\d{2}/g
    };

    const extracted = {
      supplier: {
        vatNumber: this.extractFirst(text, patterns.vatNumber),
        email: this.extractFirst(text, patterns.email),
        phone: this.extractFirst(text, patterns.phone)
      },
      invoice: {
        number: this.extractFirst(text, patterns.invoiceNumber, 1),
        date: this.extractFirst(text, patterns.date)
      },
      amounts: {
        total: this.extractAmount(text, patterns.amount)
      },
      banking: {
        iban: this.extractFirst(text, patterns.iban)
      }
    };

    return extracted;
  },

  extractFirst(text, pattern, group = 0) {
    const match = text.match(pattern);
    return match ? (group > 0 ? match[group] : match[0]) : null;
  },

  extractAmount(text, pattern) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length === 0) return null;
    
    // Prendre le montant le plus élevé (probablement le total)
    const amounts = matches.map(m => {
      const value = m[1].replace(/'/g, '').replace(',', '.');
      return parseFloat(value);
    });
    
    const maxAmount = Math.max(...amounts);
    return {
      value: maxAmount,
      formatted: `CHF ${maxAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`
    };
  },

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
};

// Export global
window.OCRFallback = OCRFallback;