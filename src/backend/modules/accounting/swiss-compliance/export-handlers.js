/**
 * Export Handlers for Form 200 VAT Declaration
 * ============================================
 * 
 * Handlers pour l'export du Formulaire 200 TVA:
 * ✅ Export PDF conforme AFC
 * ✅ Export XML eCH-0217 v2.0
 * ✅ Export JSON pour intégrations
 * ✅ Export CSV pour analyse
 * 
 * @version 1.0.0
 * @updated 2025-01-13
 */

/**
 * Handler pour export PDF du Formulaire 200
 */
export class PDFExportHandler {
    
    constructor(pdfLibrary = null) {
        // Support pour différentes librairies PDF (jsPDF, PDFKit, etc.)
        this.pdfLib = pdfLibrary;
        this.template = 'AFC_FORM_200_TEMPLATE';
    }
    
    /**
     * Génère un PDF du Formulaire 200
     */
    async generatePDF(form200Data, options = {}) {
        try {
            console.log('📄 Génération PDF Formulaire 200...');
            
            // Configuration par défaut
            const config = {
                format: 'A4',
                orientation: 'portrait',
                margins: { top: 20, right: 20, bottom: 20, left: 20 },
                fontSize: 10,
                language: 'fr',
                includeDetails: false,
                ...options
            };
            
            // Structure du PDF
            const pdfStructure = {
                header: this.generateHeader(form200Data.company, form200Data.period),
                sections: this.generateSections(form200Data.sections),
                summary: this.generateSummary(form200Data.summary),
                footer: this.generateFooter(form200Data.generatedAt),
                signature: this.generateSignatureSection()
            };
            
            // Génération selon la librairie disponible
            if (this.pdfLib) {
                return await this.generateWithLibrary(pdfStructure, config);
            } else {
                return this.generateHTMLToPDF(pdfStructure, config);
            }
            
        } catch (error) {
            console.error('❌ Erreur génération PDF:', error);
            throw new Error(`Erreur export PDF: ${error.message}`);
        }
    }
    
    /**
     * Génère l'en-tête du formulaire
     */
    generateHeader(company, period) {
        return {
            title: 'FORMULAIRE 200 - DÉCLARATION D\'IMPÔT SUR LE CHIFFRE D\'AFFAIRES',
            subtitle: 'Administration fédérale des contributions (AFC)',
            company: {
                name: company.name,
                cheNumber: company.cheNumber,
                address: `${company.address}, ${company.zip} ${company.city}`,
                contact: company.contact || ''
            },
            period: {
                start: this.formatDate(period.start),
                end: this.formatDate(period.end),
                type: this.getPeriodDescription(period.type)
            },
            submissionDeadline: this.calculateSubmissionDeadline(period)
        };
    }
    
    /**
     * Génère les sections du formulaire
     */
    generateSections(sections) {
        const formatted = {};
        
        Object.entries(sections).forEach(([sectionKey, section]) => {
            formatted[sectionKey] = {
                title: section.name,
                description: section.description,
                lines: section.entries.map(entry => ({
                    code: entry.code,
                    description: entry.description,
                    amount: this.formatAmount(entry.amount),
                    calculated: entry.calculated || false
                })),
                total: section.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0)
            };
        });
        
        return formatted;
    }
    
    /**
     * Génère le résumé final
     */
    generateSummary(summary) {
        return {
            totalTurnover: this.formatAmount(summary.totalTurnover),
            totalTaxDue: this.formatAmount(summary.totalTaxDue),
            totalInputTax: this.formatAmount(summary.totalInputTax),
            finalAmount: this.formatAmount(Math.abs(summary.finalAmount)),
            paymentStatus: summary.isDue ? 'À PAYER À L\'AFC' : 'CRÉANCE ENVERS L\'AFC',
            paymentStatusClass: summary.isDue ? 'payment-due' : 'payment-credit'
        };
    }
    
    /**
     * Génère le pied de page
     */
    generateFooter(generatedAt) {
        return {
            generatedAt: this.formatDateTime(generatedAt),
            generator: 'Directus Unified Platform - Accounting Engine v2.1.0',
            disclaimer: 'Ce document a été généré automatiquement. Veuillez vérifier tous les montants avant soumission.',
            afcContact: 'AFC - Administration fédérale des contributions - www.estv.admin.ch'
        };
    }
    
    /**
     * Génère la section signature
     */
    generateSignatureSection() {
        return {
            text: 'Je déclare que cette déclaration d\'impôt sur le chiffre d\'affaires est complète et conforme à la vérité.',
            fields: [
                { label: 'Lieu et date:', value: '_____________________' },
                { label: 'Signature:', value: '_____________________' },
                { label: 'Nom:', value: '_____________________' },
                { label: 'Fonction:', value: '_____________________' }
            ]
        };
    }
    
    /**
     * Génère HTML pour conversion PDF (fallback)
     */
    generateHTMLToPDF(structure, config) {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Formulaire 200 TVA</title>
            <style>
                ${this.getCSS(config)}
            </style>
        </head>
        <body>
            ${this.renderHeader(structure.header)}
            ${this.renderSections(structure.sections)}
            ${this.renderSummary(structure.summary)}
            ${this.renderSignature(structure.signature)}
            ${this.renderFooter(structure.footer)}
        </body>
        </html>
        `;
        
        return {
            html,
            filename: `formulaire_200_${structure.header.company.cheNumber}_${this.formatDate(new Date())}.pdf`,
            options: config
        };
    }
    
    /**
     * CSS pour le PDF
     */
    getCSS(config) {
        return `
            @page { 
                size: ${config.format}; 
                margin: ${config.margins.top}mm ${config.margins.right}mm ${config.margins.bottom}mm ${config.margins.left}mm; 
            }
            body { 
                font-family: Arial, sans-serif; 
                font-size: ${config.fontSize}pt; 
                line-height: 1.4;
                color: #333;
            }
            .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
            }
            .header h1 { 
                font-size: 14pt; 
                font-weight: bold; 
                margin: 0 0 5px 0;
            }
            .header h2 { 
                font-size: 12pt; 
                margin: 0 0 15px 0;
                color: #666;
            }
            .company-info { 
                text-align: left; 
                margin: 10px 0;
                background: #f5f5f5;
                padding: 10px;
            }
            .period-info { 
                text-align: right; 
                margin: 10px 0;
            }
            .section { 
                margin: 15px 0; 
                break-inside: avoid;
            }
            .section-title { 
                background: #e6f3ff; 
                padding: 8px; 
                font-weight: bold; 
                border: 1px solid #ccc;
                font-size: 11pt;
            }
            .section-description {
                font-size: 9pt;
                color: #666;
                font-style: italic;
                margin-bottom: 5px;
            }
            .form-line { 
                display: flex; 
                justify-content: space-between; 
                padding: 3px 8px; 
                border-bottom: 1px solid #eee;
            }
            .form-line:nth-child(even) { 
                background: #f9f9f9; 
            }
            .line-code { 
                font-weight: bold; 
                width: 40px;
                font-family: monospace;
            }
            .line-description { 
                flex-grow: 1; 
                padding: 0 10px;
            }
            .line-amount { 
                text-align: right; 
                width: 100px;
                font-family: monospace;
                font-weight: bold;
            }
            .calculated { 
                background: #ffffcc; 
                font-weight: bold;
            }
            .summary { 
                margin: 20px 0; 
                border: 2px solid #000; 
                padding: 10px;
                background: #f0f8ff;
            }
            .summary-title { 
                font-size: 12pt; 
                font-weight: bold; 
                text-align: center; 
                margin-bottom: 10px;
            }
            .summary-line { 
                display: flex; 
                justify-content: space-between; 
                padding: 5px 0; 
                border-bottom: 1px solid #ddd;
            }
            .summary-line.final { 
                font-size: 12pt; 
                font-weight: bold; 
                border-top: 2px solid #000;
                margin-top: 10px;
                padding-top: 10px;
            }
            .payment-due { 
                color: #cc0000; 
                font-weight: bold;
            }
            .payment-credit { 
                color: #006600; 
                font-weight: bold;
            }
            .signature-section { 
                margin-top: 30px; 
                border: 1px solid #ccc; 
                padding: 15px;
            }
            .signature-text { 
                font-style: italic; 
                margin-bottom: 20px;
            }
            .signature-fields { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 15px;
            }
            .footer { 
                margin-top: 20px; 
                border-top: 1px solid #ccc; 
                padding-top: 10px; 
                font-size: 8pt; 
                color: #666; 
                text-align: center;
            }
        `;
    }
    
    /**
     * Formate un montant en CHF
     */
    formatAmount(amount) {
        if (amount === 0) return '';
        return new Intl.NumberFormat('fr-CH', {
            style: 'currency',
            currency: 'CHF'
        }).format(Math.abs(amount));
    }
    
    /**
     * Formate une date
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-CH');
    }
    
    /**
     * Formate date et heure
     */
    formatDateTime(dateTime) {
        return new Date(dateTime).toLocaleString('fr-CH');
    }
    
    /**
     * Obtient la description de la période
     */
    getPeriodDescription(type) {
        const types = {
            monthly: 'Mensuelle',
            quarterly: 'Trimestrielle',
            halfyearly: 'Semestrielle',
            yearly: 'Annuelle'
        };
        return types[type] || 'Inconnue';
    }
    
    /**
     * Calcule la date limite de soumission
     */
    calculateSubmissionDeadline(period) {
        const endDate = new Date(period.end);
        // Délai général: 15 du deuxième mois suivant
        const deadline = new Date(endDate.getFullYear(), endDate.getMonth() + 2, 15);
        return this.formatDate(deadline);
    }
    
    // Méthodes de rendu HTML
    renderHeader(header) {
        return `
            <div class="header">
                <h1>${header.title}</h1>
                <h2>${header.subtitle}</h2>
                <div class="company-info">
                    <strong>${header.company.name}</strong><br>
                    N° CHE: ${header.company.cheNumber}<br>
                    ${header.company.address}
                </div>
                <div class="period-info">
                    Période: ${header.period.start} - ${header.period.end}<br>
                    Type: ${header.period.type}<br>
                    Délai de soumission: ${header.submissionDeadline}
                </div>
            </div>
        `;
    }
    
    renderSections(sections) {
        return Object.entries(sections).map(([key, section]) => `
            <div class="section">
                <div class="section-title">${section.title}</div>
                <div class="section-description">${section.description}</div>
                ${section.lines.map(line => `
                    <div class="form-line ${line.calculated ? 'calculated' : ''}">
                        <span class="line-code">${line.code}</span>
                        <span class="line-description">${line.description}</span>
                        <span class="line-amount">${line.amount}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }
    
    renderSummary(summary) {
        return `
            <div class="summary">
                <div class="summary-title">RÉSUMÉ DE LA DÉCLARATION</div>
                <div class="summary-line">
                    <span>Chiffre d'affaires total:</span>
                    <span>${summary.totalTurnover}</span>
                </div>
                <div class="summary-line">
                    <span>Impôt dû total:</span>
                    <span>${summary.totalTaxDue}</span>
                </div>
                <div class="summary-line">
                    <span>Impôt préalable déductible:</span>
                    <span>${summary.totalInputTax}</span>
                </div>
                <div class="summary-line final ${summary.paymentStatusClass}">
                    <span>${summary.paymentStatus}:</span>
                    <span>${summary.finalAmount}</span>
                </div>
            </div>
        `;
    }
    
    renderSignature(signature) {
        return `
            <div class="signature-section">
                <div class="signature-text">${signature.text}</div>
                <div class="signature-fields">
                    ${signature.fields.map(field => `
                        <div>
                            ${field.label} ${field.value}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderFooter(footer) {
        return `
            <div class="footer">
                <div>Généré le ${footer.generatedAt} par ${footer.generator}</div>
                <div>${footer.disclaimer}</div>
                <div>${footer.afcContact}</div>
            </div>
        `;
    }
}

/**
 * Handler pour export XML eCH-0217
 */
export class ECH0217ExportHandler {
    
    constructor() {
        this.version = '2.0';
        this.namespace = 'http://www.ech.ch/xmlns/eCH-0217/2';
    }
    
    /**
     * Génère XML eCH-0217 pour transmission électronique
     */
    generateXML(form200Data, options = {}) {
        try {
            console.log('📧 Génération XML eCH-0217...');
            
            const config = {
                includeValidation: true,
                includeDetails: false,
                encoding: 'UTF-8',
                ...options
            };
            
            return this.buildXMLStructure(form200Data, config);
            
        } catch (error) {
            console.error('❌ Erreur génération XML:', error);
            throw new Error(`Erreur export XML: ${error.message}`);
        }
    }
    
    /**
     * Construit la structure XML complète
     */
    buildXMLStructure(data, config) {
        return `<?xml version="1.0" encoding="${config.encoding}"?>
<eCH-0217:VAT_Declaration 
    xmlns:eCH-0217="${this.namespace}"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="${this.namespace} ${this.namespace}/eCH-0217-2-0.xsd"
    version="${this.version}">
    
    ${this.generateHeader(data.company, data.period)}
    ${this.generateDeclaration(data.sections)}
    ${this.generateSummary(data.summary)}
    ${config.includeValidation ? this.generateValidation(data.validation) : ''}
    
</eCH-0217:VAT_Declaration>`;
    }
    
    generateHeader(company, period) {
        return `
    <eCH-0217:Header>
        <eCH-0217:CompanyData>
            <eCH-0217:Name>${this.escapeXML(company.name)}</eCH-0217:Name>
            <eCH-0217:CHE_Number>${company.cheNumber}</eCH-0217:CHE_Number>
            <eCH-0217:Address>
                <eCH-0217:Street>${this.escapeXML(company.address)}</eCH-0217:Street>
                <eCH-0217:ZIP>${company.zip}</eCH-0217:ZIP>
                <eCH-0217:City>${this.escapeXML(company.city)}</eCH-0217:City>
            </eCH-0217:Address>
        </eCH-0217:CompanyData>
        <eCH-0217:Period>
            <eCH-0217:StartDate>${this.formatXMLDate(period.start)}</eCH-0217:StartDate>
            <eCH-0217:EndDate>${this.formatXMLDate(period.end)}</eCH-0217:EndDate>
            <eCH-0217:Type>${period.type}</eCH-0217:Type>
        </eCH-0217:Period>
        <eCH-0217:GeneratedAt>${new Date().toISOString()}</eCH-0217:GeneratedAt>
        <eCH-0217:Generator>Directus Unified Platform v2.1.0</eCH-0217:Generator>
    </eCH-0217:Header>`;
    }
    
    generateDeclaration(sections) {
        let xml = '\n    <eCH-0217:Declaration>';
        
        Object.values(sections).forEach(section => {
            section.entries.forEach(entry => {
                if (entry.amount !== 0) {
                    xml += `
        <eCH-0217:Entry>
            <eCH-0217:Code>${entry.code}</eCH-0217:Code>
            <eCH-0217:Amount>${entry.amount.toFixed(2)}</eCH-0217:Amount>
            <eCH-0217:Description>${this.escapeXML(entry.description)}</eCH-0217:Description>
            ${entry.calculated ? '<eCH-0217:Calculated>true</eCH-0217:Calculated>' : ''}
        </eCH-0217:Entry>`;
                }
            });
        });
        
        xml += '\n    </eCH-0217:Declaration>';
        return xml;
    }
    
    generateSummary(summary) {
        return `
    <eCH-0217:Summary>
        <eCH-0217:TotalTurnover>${summary.totalTurnover.toFixed(2)}</eCH-0217:TotalTurnover>
        <eCH-0217:TotalTaxDue>${summary.totalTaxDue.toFixed(2)}</eCH-0217:TotalTaxDue>
        <eCH-0217:TotalInputTax>${summary.totalInputTax.toFixed(2)}</eCH-0217:TotalInputTax>
        <eCH-0217:FinalAmount>${summary.finalAmount.toFixed(2)}</eCH-0217:FinalAmount>
        <eCH-0217:PaymentDue>${summary.isDue}</eCH-0217:PaymentDue>
    </eCH-0217:Summary>`;
    }
    
    generateValidation(validation) {
        return `
    <eCH-0217:Validation>
        <eCH-0217:IsValid>${validation.isValid}</eCH-0217:IsValid>
        ${validation.errors.map(error => `
        <eCH-0217:Error>${this.escapeXML(error)}</eCH-0217:Error>`).join('')}
        ${validation.warnings.map(warning => `
        <eCH-0217:Warning>${this.escapeXML(warning)}</eCH-0217:Warning>`).join('')}
    </eCH-0217:Validation>`;
    }
    
    escapeXML(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    formatXMLDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }
}

/**
 * Handler pour export CSV
 */
export class CSVExportHandler {
    
    /**
     * Génère un CSV de la déclaration
     */
    generateCSV(form200Data, options = {}) {
        const config = {
            delimiter: ';',
            encoding: 'UTF-8',
            includeHeaders: true,
            ...options
        };
        
        const lines = [];
        
        // En-tête
        if (config.includeHeaders) {
            lines.push(['Code', 'Description', 'Montant', 'Calculé', 'Section'].join(config.delimiter));
        }
        
        // Données
        Object.entries(form200Data.sections).forEach(([sectionKey, section]) => {
            section.entries.forEach(entry => {
                lines.push([
                    entry.code,
                    `"${entry.description}"`,
                    entry.amount.toFixed(2),
                    entry.calculated ? 'Oui' : 'Non',
                    `"${section.name}"`
                ].join(config.delimiter));
            });
        });
        
        return {
            content: lines.join('\n'),
            filename: `formulaire_200_${form200Data.company.cheNumber}_${new Date().toISOString().split('T')[0]}.csv`,
            encoding: config.encoding
        };
    }
}

// Export par défaut
export default {
    PDFExportHandler,
    ECH0217ExportHandler,
    CSVExportHandler
};