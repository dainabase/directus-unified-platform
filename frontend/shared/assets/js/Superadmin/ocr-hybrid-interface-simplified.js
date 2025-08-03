/**
 * OCR Hybrid Interface Simplified v2.0
 * Interface simplifiée pour le nouveau design multi-devises
 */

class OCRHybridInterfaceSimplified {
    constructor() {
        this.processor = null;
        this.currentFile = null;
        this.currentResult = null;
        
        console.log('🎨 OCR Interface Simplifiée v2.0');
    }

    /**
     * Initialisation simplifiée
     */
    async init() {
        try {
            // Créer et initialiser le processeur
            this.processor = new OCRHybridProcessor();
            await this.processor.init();
            
            // Vérifier la clé OpenAI
            this.checkOpenAIKey();
            
            console.log('✅ Interface prête');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur init:', error);
            this.showNotification('error', 'Erreur initialisation: ' + error.message);
            return false;
        }
    }

    /**
     * Vérification clé OpenAI simplifiée
     */
    checkOpenAIKey() {
        const hasKey = localStorage.getItem('openai_api_key');
        if (!hasKey) {
            console.warn('⚠️ Clé OpenAI manquante - mode Tesseract uniquement');
        }
        return !!hasKey;
    }

    /**
     * Traitement d'un fichier
     */
    async processFile(file, options = {}) {
        if (this.isProcessing) {
            this.showNotification('warning', 'Un traitement est déjà en cours');
            return null;
        }

        this.currentFile = file;
        this.isProcessing = true;

        try {
            // Afficher la progression
            this.showProgress(true, 'Extraction en cours...');

            // Traiter avec le processeur
            const result = await this.processor.processDocument(file, {
                useOpenAI: options.useOpenAI !== false,
                entity: options.entity
            });

            if (result.success) {
                this.currentResult = result;
                
                // Enrichir avec validation business
                if (window.FinanceOCRAI) {
                    const businessValidation = await FinanceOCRAI.businessValidation(result.data);
                    result.businessValidation = businessValidation;
                }
                
                return result;
            } else {
                throw new Error(result.error || 'Échec extraction');
            }

        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.showNotification('error', 'Erreur: ' + error.message);
            return null;
            
        } finally {
            this.isProcessing = false;
            this.showProgress(false);
        }
    }

    /**
     * Afficher/masquer la progression
     */
    showProgress(show, text = '') {
        const container = document.getElementById('progressContainer');
        const textEl = document.getElementById('progressText');
        
        if (container) {
            if (show) {
                container.classList.remove('d-none');
                if (textEl) textEl.textContent = text;
            } else {
                container.classList.add('d-none');
            }
        }
    }

    /**
     * Afficher une notification
     */
    showNotification(type, message) {
        // Utiliser la fonction globale si disponible
        if (typeof showNotification === 'function') {
            showNotification(type, message);
            return;
        }

        // Fallback simple
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'warning' ? 'alert-warning' : 'alert-danger';
        const icon = type === 'success' ? 'check' : 
                    type === 'warning' ? 'alert-triangle' : 'alert-circle';
        
        const alert = document.createElement('div');
        alert.className = `alert ${alertClass} alert-dismissible position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            <div class="d-flex">
                <div>
                    <i class="ti ti-${icon} me-2"></i>
                    ${message}
                </div>
            </div>
            <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    /**
     * Formater les données pour l'affichage
     */
    formatDataForDisplay(data) {
        // Adapter les données selon la devise
        const formatted = { ...data };
        
        // Formater les montants selon la devise
        if (data.devise === 'CHF') {
            // Format suisse: 1'234.56
            ['montant_ht', 'montant_tva', 'montant_ttc'].forEach(field => {
                if (formatted[field]) {
                    formatted[field + '_display'] = this.formatSwissAmount(formatted[field]);
                }
            });
        } else if (data.devise === 'EUR') {
            // Format européen: 1 234,56
            ['montant_ht', 'montant_tva', 'montant_ttc'].forEach(field => {
                if (formatted[field]) {
                    formatted[field + '_display'] = this.formatEuroAmount(formatted[field]);
                }
            });
        }
        
        // Badge devise
        formatted.devise_badge = this.getDeviseBadgeClass(data.devise);
        
        // Badge statut TVA
        formatted.vat_status_badge = this.getVATStatusBadge(data.vat_status);
        
        return formatted;
    }

    /**
     * Format montant suisse
     */
    formatSwissAmount(amount) {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    /**
     * Format montant européen
     */
    formatEuroAmount(amount) {
        return amount.toFixed(2)
            .replace('.', ',')
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    /**
     * Classe CSS pour badge devise
     */
    getDeviseBadgeClass(devise) {
        const classes = {
            'CHF': 'currency-CHF',
            'EUR': 'currency-EUR',
            'USD': 'currency-USD',
            'GBP': 'currency-GBP',
            'CAD': 'currency-CAD'
        };
        return classes[devise] || 'bg-secondary';
    }

    /**
     * Configuration badge TVA
     */
    getVATStatusBadge(status) {
        const configs = {
            'hors_tva': { text: 'HORS TVA', class: 'bg-secondary' },
            'ttc': { text: 'TTC', class: 'bg-success' },
            'non_applicable': { text: 'N/A', class: 'bg-warning' }
        };
        return configs[status] || configs['ttc'];
    }

    /**
     * Valider les données avant sauvegarde
     */
    validateBeforeSave(data) {
        const errors = [];
        
        // Champs obligatoires
        if (!data.fournisseur) errors.push('Fournisseur requis');
        if (!data.montant_ttc || data.montant_ttc <= 0) errors.push('Montant TTC requis');
        if (!data.date) errors.push('Date requise');
        if (!data.numero) errors.push('Numéro document requis');
        
        // Validation cohérence montants selon statut
        if (data.vat_status === 'ttc' && data.montant_ht && data.montant_tva) {
            const calculated = data.montant_ht + data.montant_tva;
            const diff = Math.abs(calculated - data.montant_ttc);
            if (diff > 0.02) {
                errors.push(`Incohérence montants: ${calculated.toFixed(2)} ≠ ${data.montant_ttc}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Obtenir les statistiques d'utilisation
     */
    getUsageStats() {
        const stats = {
            totalProcessed: parseInt(localStorage.getItem('ocr_total_processed') || '0'),
            successRate: parseFloat(localStorage.getItem('ocr_success_rate') || '0'),
            averageTime: parseFloat(localStorage.getItem('ocr_avg_time') || '0'),
            lastProcess: localStorage.getItem('ocr_last_process'),
            byDevise: {
                CHF: parseInt(localStorage.getItem('ocr_devise_CHF') || '0'),
                EUR: parseInt(localStorage.getItem('ocr_devise_EUR') || '0'),
                USD: parseInt(localStorage.getItem('ocr_devise_USD') || '0'),
                GBP: parseInt(localStorage.getItem('ocr_devise_GBP') || '0'),
                CAD: parseInt(localStorage.getItem('ocr_devise_CAD') || '0')
            }
        };
        
        return stats;
    }

    /**
     * Mettre à jour les statistiques
     */
    updateStats(result) {
        if (!result || !result.data) return;
        
        // Total traité
        const total = parseInt(localStorage.getItem('ocr_total_processed') || '0') + 1;
        localStorage.setItem('ocr_total_processed', total.toString());
        
        // Taux de succès
        if (result.success) {
            const successCount = parseInt(localStorage.getItem('ocr_success_count') || '0') + 1;
            localStorage.setItem('ocr_success_count', successCount.toString());
            const rate = (successCount / total * 100).toFixed(1);
            localStorage.setItem('ocr_success_rate', rate);
        }
        
        // Par devise
        if (result.data.devise) {
            const key = `ocr_devise_${result.data.devise}`;
            const count = parseInt(localStorage.getItem(key) || '0') + 1;
            localStorage.setItem(key, count.toString());
        }
        
        // Dernière utilisation
        localStorage.setItem('ocr_last_process', new Date().toISOString());
    }

    /**
     * Export des données en CSV
     */
    exportToCSV(data) {
        const headers = [
            'Type', 'Entité', 'Fournisseur', 'Numéro', 'Date',
            'Montant HT', 'TVA', 'Montant TTC', 'Taux TVA', 'Devise', 'Statut TVA'
        ];
        
        const row = [
            data.type || '',
            data.entite || '',
            data.fournisseur || '',
            data.numero || '',
            data.date || '',
            data.montant_ht || '0',
            data.montant_tva || '0',
            data.montant_ttc || '0',
            data.taux_tva || '0',
            data.devise || 'CHF',
            data.vat_status || 'ttc'
        ];
        
        const csv = [
            headers.join(';'),
            row.join(';')
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ocr_export_${data.numero || Date.now()}.csv`;
        link.click();
    }
}

// Export global
window.OCRHybridInterfaceSimplified = OCRHybridInterfaceSimplified;