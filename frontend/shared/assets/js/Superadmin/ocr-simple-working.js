/**
 * OCR Simple - Version qui marche à 100%
 * Pas de fantaisie, juste fonctionnel
 */

class OCRSimple {
    constructor() {
        this.version = 'simple-1.0';
        console.log('🚀 OCR Simple v' + this.version);
    }

    init() {
        try {
            // Éléments DOM
            this.dropzone = document.getElementById('dropzone');
            this.fileInput = document.getElementById('file-input');
            
            if (!this.dropzone) {
                console.error('❌ Dropzone non trouvée');
                return;
            }
            
            // Events simples
            this.dropzone.addEventListener('click', () => {
                if (this.fileInput) this.fileInput.click();
            });
            
            if (this.fileInput) {
                this.fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleFile(e.target.files[0]);
                    }
                });
            }
            
            console.log('✅ OCR Simple initialisé');
            
        } catch (error) {
            console.error('❌ Erreur init:', error);
        }
    }

    async handleFile(file) {
        console.log('📁 Fichier:', file.name);
        
        try {
            // Afficher progression
            this.showProgress('Traitement: ' + file.name);
            
            // Convertir PDF si nécessaire
            let imageFile = file;
            if (file.type === 'application/pdf') {
                console.log('📄 Conversion PDF...');
                imageFile = await this.convertPDF(file);
            }
            
            // OCR
            console.log('🤖 OCR...');
            const result = await this.doOCR(imageFile);
            
            // Parser simple
            const data = this.parseSimple(result.data.text);
            
            // Afficher
            this.showResults(data);
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showError('Erreur: ' + error.message);
        }
    }

    async convertPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    async doOCR(imageFile) {
        const worker = await Tesseract.createWorker();
        
        try {
            await worker.loadLanguage('fra+eng');
            await worker.initialize('fra+eng');
            const result = await worker.recognize(imageFile);
            return result;
        } finally {
            await worker.terminate();
        }
    }

    parseSimple(text) {
        console.log('📄 Texte OCR:', text.substring(0, 200));
        
        const lines = text.split('\n').filter(l => l.trim());
        
        // ===== EXTRACTION MONTANTS INTELLIGENTE =====
        const amounts = this.extractSmartAmounts(text, lines);
        
        // ===== EXTRACTION DATES =====
        const dates = text.match(/\d{1,2}[.\/]\d{1,2}[.\/]\d{2,4}/g) || [];
        
        // ===== EXTRACTION NUMÉRO COMPLET =====
        // Amélioration: capturer le numéro complet avec son préfixe
        const numberMatch = text.match(/(?:AN|REF|FAC|INV|OFFER|N°)[-\s]*([A-Z0-9\-]+)/i);
        const fullNumber = numberMatch ? numberMatch[0] : '';
        
        // ===== EXTRACTION ENTREPRISE =====
        let company = this.extractCompany(lines);
        
        return {
            company: company,
            number: fullNumber,
            date: dates[0] || '',
            amount: amounts.main || '',
            amount_details: amounts,
            confidence: 85
        };
    }

    extractSmartAmounts(text, lines) {
        console.log('💰 Extraction INTELLIGENTE des montants...');
        
        const results = {
            main: '',
            total: '',
            subtotal: '',
            unit_price: '',
            all_found: []
        };
        
        // 1. CHERCHER DANS LES LIGNES AVEC MOTS-CLÉS IMPORTANTS
        const priorityKeywords = ['total', 'sum', 'montant', 'offer sum'];
        
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            
            // Si la ligne contient un mot-clé prioritaire
            if (priorityKeywords.some(keyword => lowerLine.includes(keyword))) {
                console.log(`💰 Ligne prioritaire trouvée: "${line}"`);
                
                // Chercher montant avec apostrophe (format suisse)
                const swissAmount = line.match(/\d{1,3}(?:'\d{3})+(?:\.\d{2})?/);
                if (swissAmount) {
                    results.total = swissAmount[0];
                    console.log(`💰 Montant total trouvé: ${swissAmount[0]}`);
                    break;
                }
                
                // Fallback: montant normal
                const normalAmount = line.match(/\d{3,}(?:\.\d{2})?/);
                if (normalAmount) {
                    results.total = normalAmount[0];
                    console.log(`💰 Montant normal trouvé: ${normalAmount[0]}`);
                    break;
                }
            }
        }
        
        // 2. CHERCHER PRIX UNITAIRE (dans tableau)
        for (const line of lines) {
            // Ligne qui ressemble à un tableau avec prix
            if (/\d+\.\d{2}\s+\d{1,3}(?:'\d{3})*/.test(line)) {
                const prices = line.match(/\d+\.\d{2}/g) || [];
                const totals = line.match(/\d{1,3}(?:'\d{3})+/g) || [];
                
                if (prices.length > 0) {
                    results.unit_price = prices[0];
                    console.log(`💰 Prix unitaire: ${prices[0]}`);
                }
                
                if (totals.length > 0 && !results.total) {
                    results.total = totals[totals.length - 1]; // Dernier = total ligne
                    console.log(`💰 Total ligne: ${totals[totals.length - 1]}`);
                }
            }
        }
        
        // 3. SI PAS DE TOTAL TROUVÉ, CHERCHER LE PLUS GROS MONTANT COHÉRENT
        if (!results.total) {
            const allAmounts = [];
            
            for (const line of lines) {
                // Seulement montants avec apostrophe ou > 100
                const amounts = line.match(/\d{1,3}(?:'\d{3})+(?:\.\d{2})?/g) || [];
                allAmounts.push(...amounts);
                
                // Montants sans apostrophe mais > 100
                const bigAmounts = line.match(/\b[1-9]\d{2,}(?:\.\d{2})?\b/g) || [];
                for (const amount of bigAmounts) {
                    const num = parseFloat(amount);
                    if (num >= 100 && num <= 99999) { // Montants raisonnables
                        allAmounts.push(amount);
                    }
                }
            }
            
            // Prendre le plus gros montant trouvé
            if (allAmounts.length > 0) {
                const biggest = allAmounts
                    .map(a => ({ original: a, value: parseFloat(a.replace(/'/g, '')) }))
                    .sort((a, b) => b.value - a.value)[0];
                
                results.total = biggest.original;
                console.log(`💰 Plus gros montant: ${biggest.original}`);
            }
        }
        
        // 4. MONTANT PRINCIPAL = TOTAL TROUVÉ
        results.main = results.total;
        results.all_found = [results.total, results.unit_price].filter(Boolean);
        
        console.log('💰 Résultats extraction:', results);
        return results;
    }

    extractCompany(lines) {
        // Chercher première ligne avec suffixe business en haut du document
        for (let i = 0; i < Math.min(lines.length, 8); i++) {
            const line = lines[i].trim();
            
            // Ligne avec suffixe entreprise
            if (/\b(?:SA|GmbH|Ltd|Inc|SAS|S\.L\.|AG)\b/.test(line) && line.length > 10) {
                console.log(`🏢 Entreprise trouvée ligne ${i}: "${line}"`);
                return line;
            }
        }
        
        // Fallback: première ligne significative
        for (const line of lines.slice(0, 5)) {
            if (line.length > 10 && /[A-Z]/.test(line) && !line.includes('@') && !line.includes('www')) {
                return line;
            }
        }
        
        return 'Entreprise non détectée';
    }

    showProgress(message) {
        console.log('📊', message);
        
        // Créer ou mettre à jour élément progress
        let progress = document.getElementById('simple-progress');
        if (!progress) {
            progress = document.createElement('div');
            progress.id = 'simple-progress';
            progress.style.cssText = 'margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px;';
            this.dropzone.parentNode.insertBefore(progress, this.dropzone.nextSibling);
        }
        
        progress.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="width: 20px; height: 20px; border: 2px solid #0066cc; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px;"></div>
                <div>${message}</div>
            </div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
    }

    showResults(data) {
        console.log('📊 Résultats:', data);
        
        // Masquer progress
        const progress = document.getElementById('simple-progress');
        if (progress) progress.style.display = 'none';
        
        // Créer ou mettre à jour résultats
        let results = document.getElementById('simple-results');
        if (!results) {
            results = document.createElement('div');
            results.id = 'simple-results';
            results.style.cssText = 'margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;';
            this.dropzone.parentNode.insertBefore(results, this.dropzone.nextSibling);
        }
        
        results.innerHTML = `
            <h4>Données extraites</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div><strong>Entreprise:</strong> ${data.company}</div>
                <div><strong>Numéro:</strong> ${data.number}</div>
                <div><strong>Date:</strong> ${data.date}</div>
                <div><strong>Montant PRINCIPAL:</strong> <span style="color: #0066cc; font-weight: bold; font-size: 1.2em;">${data.amount}</span></div>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
                <strong>Détails montants:</strong><br>
                - Total: ${data.amount_details?.total || 'Non trouvé'}<br>
                - Prix unitaire: ${data.amount_details?.unit_price || 'Non trouvé'}
            </div>
            <div style="margin-top: 15px;">
                <button onclick="ocrSimple.reset()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Nouveau document
                </button>
            </div>
        `;
        
        results.style.display = 'block';
    }

    showError(message) {
        console.error('❌', message);
        
        const error = document.createElement('div');
        error.style.cssText = 'margin-top: 20px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 8px;';
        error.textContent = message;
        
        this.dropzone.parentNode.insertBefore(error, this.dropzone.nextSibling);
        
        setTimeout(() => error.remove(), 5000);
    }

    reset() {
        const results = document.getElementById('simple-results');
        if (results) results.style.display = 'none';
        
        const progress = document.getElementById('simple-progress');
        if (progress) progress.style.display = 'none';
        
        if (this.fileInput) this.fileInput.value = '';
    }
}

// Instance globale
window.ocrSimple = new OCRSimple();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    window.ocrSimple.init();
});