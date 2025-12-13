# PROMPT 2/8 - GÉNÉRATEUR PDF AVEC QR SWISS

## Contexte
Ce service génère des PDFs de factures avec le QR-code suisse intégré directement dans le document. Il utilise PDFKit et le module qr-invoice existant.

## Fichier à créer
`src/backend/services/finance/pdf-generator.service.js`

## Dépendances à installer
```bash
npm install pdfkit qrcode --save
```

## Code complet

```javascript
/**
 * PDFGeneratorService
 * Génère des factures PDF avec QR-Facture suisse intégré
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

class PDFGeneratorService {
  constructor() {
    this.outputDir = process.env.PDF_OUTPUT_DIR || './uploads/invoices';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Générer une facture PDF complète avec QR Swiss
   * @param {Object} invoice - Données facture de Directus
   * @param {Object} qrData - Données QR générées par UnifiedInvoiceService
   * @param {Object} options - Options de génération
   * @returns {Promise<string>} - Chemin du fichier PDF
   */
  async generateInvoicePDF(invoice, qrData, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const filename = `${invoice.invoice_number}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        
        // Configuration couleurs par entreprise
        const colors = this.getCompanyColors(invoice.owner_company);
        
        // === EN-TÊTE ===
        await this.renderHeader(doc, invoice, colors);
        
        // === INFORMATIONS CLIENT ===
        this.renderClientInfo(doc, invoice);
        
        // === DÉTAILS FACTURE ===
        this.renderInvoiceDetails(doc, invoice);
        
        // === TABLEAU DES LIGNES ===
        this.renderLineItems(doc, invoice, colors);
        
        // === TOTAUX ===
        this.renderTotals(doc, invoice, colors);
        
        // === SECTION QR-FACTURE (bas de page) ===
        await this.renderQRSection(doc, invoice, qrData);
        
        // === FOOTER ===
        this.renderFooter(doc, invoice, colors);
        
        doc.end();
        
        stream.on('finish', () => {
          resolve({
            success: true,
            filepath,
            filename,
            url: `/uploads/invoices/${filename}`
          });
        });
        
        stream.on('error', reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Couleurs par entreprise
   */
  getCompanyColors(companyName) {
    const colorSchemes = {
      'HYPERVISUAL': { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
      'DAINAMICS': { primary: '#059669', secondary: '#047857', accent: '#10b981' },
      'LEXAIA': { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
      'ENKI REALTY': { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
      'TAKEOUT': { primary: '#ea580c', secondary: '#c2410c', accent: '#f97316' }
    };
    return colorSchemes[companyName] || colorSchemes['HYPERVISUAL'];
  }

  /**
   * En-tête de la facture
   */
  async renderHeader(doc, invoice, colors) {
    // Logo placeholder (rectangle coloré)
    doc.rect(50, 50, 120, 40)
       .fill(colors.primary);
    
    doc.fillColor('white')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(invoice.owner_company, 55, 62, { width: 110 });
    
    // Titre FACTURE
    doc.fillColor(colors.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('FACTURE', 400, 50, { align: 'right' });
    
    // Numéro et date
    doc.fillColor('#374151')
       .fontSize(10)
       .font('Helvetica')
       .text(`N° ${invoice.invoice_number}`, 400, 85, { align: 'right' })
       .text(`Date: ${this.formatDate(invoice.date)}`, 400, 100, { align: 'right' })
       .text(`Échéance: ${this.formatDate(invoice.due_date)}`, 400, 115, { align: 'right' });
    
    doc.moveDown(2);
  }

  /**
   * Informations client
   */
  renderClientInfo(doc, invoice) {
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('FACTURÉ À:', 50, 150);
    
    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(invoice.client_name || 'Client', 50, 165);
    
    // Adresse client si disponible
    if (invoice.client_address) {
      doc.font('Helvetica')
         .fontSize(10)
         .text(invoice.client_address, 50, 180);
    }
    
    doc.moveDown(3);
  }

  /**
   * Détails facture (référence, conditions)
   */
  renderInvoiceDetails(doc, invoice) {
    const y = 230;
    
    doc.fontSize(9)
       .fillColor('#6b7280');
    
    if (invoice.project_name) {
      doc.text(`Projet: ${invoice.project_name}`, 50, y);
    }
    
    doc.text(`Conditions: ${invoice.payment_terms || 30} jours net`, 50, y + 15);
    
    if (invoice.notes) {
      doc.text(`Note: ${invoice.notes}`, 50, y + 30, { width: 500 });
    }
    
    doc.moveDown(2);
  }

  /**
   * Tableau des lignes de facture
   */
  renderLineItems(doc, invoice, colors) {
    const tableTop = 290;
    const colWidths = { desc: 250, qty: 60, price: 80, vat: 50, total: 80 };
    
    // En-tête du tableau
    doc.rect(50, tableTop, 495, 25)
       .fill(colors.primary);
    
    doc.fillColor('white')
       .fontSize(9)
       .font('Helvetica-Bold');
    
    doc.text('Description', 55, tableTop + 8)
       .text('Qté', 310, tableTop + 8)
       .text('Prix unit.', 370, tableTop + 8)
       .text('TVA', 445, tableTop + 8)
       .text('Total', 490, tableTop + 8);
    
    // Lignes
    let y = tableTop + 30;
    const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
    
    doc.fillColor('#374151')
       .font('Helvetica')
       .fontSize(9);
    
    items.forEach((item, index) => {
      const lineTotal = item.quantity * item.unit_price;
      
      // Fond alterné
      if (index % 2 === 0) {
        doc.rect(50, y - 5, 495, 20).fill('#f9fafb');
        doc.fillColor('#374151');
      }
      
      doc.text(item.description, 55, y, { width: 245 })
         .text(item.quantity.toString(), 310, y)
         .text(this.formatMoney(item.unit_price), 370, y)
         .text(`${item.vat_rate || 8.1}%`, 445, y)
         .text(this.formatMoney(lineTotal), 490, y);
      
      y += 25;
    });
    
    // Ligne de séparation
    doc.moveTo(50, y + 5)
       .lineTo(545, y + 5)
       .stroke(colors.secondary);
    
    return y + 15;
  }

  /**
   * Section totaux
   */
  renderTotals(doc, invoice, colors) {
    const y = 480;
    const rightCol = 450;
    
    doc.fontSize(10)
       .font('Helvetica');
    
    // Sous-total HT
    doc.fillColor('#6b7280')
       .text('Sous-total HT:', rightCol - 100, y)
       .fillColor('#374151')
       .text(this.formatMoney(invoice.amount_ht) + ' ' + (invoice.currency || 'CHF'), rightCol, y, { align: 'right', width: 95 });
    
    // TVA
    doc.fillColor('#6b7280')
       .text('TVA:', rightCol - 100, y + 20)
       .fillColor('#374151')
       .text(this.formatMoney(invoice.amount_tva) + ' ' + (invoice.currency || 'CHF'), rightCol, y + 20, { align: 'right', width: 95 });
    
    // Ligne
    doc.moveTo(rightCol - 100, y + 40)
       .lineTo(545, y + 40)
       .stroke('#d1d5db');
    
    // Total TTC
    doc.rect(rightCol - 105, y + 45, 200, 30)
       .fill(colors.primary);
    
    doc.fillColor('white')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('TOTAL TTC:', rightCol - 100, y + 52)
       .text(this.formatMoney(invoice.amount) + ' ' + (invoice.currency || 'CHF'), rightCol, y + 52, { align: 'right', width: 90 });
  }

  /**
   * Section QR-Facture (bulletin de versement suisse)
   */
  async renderQRSection(doc, invoice, qrData) {
    const qrSectionY = 580;
    
    // Ligne de séparation perforée
    doc.moveTo(50, qrSectionY)
       .lineTo(545, qrSectionY)
       .dash(5, { space: 3 })
       .stroke('#9ca3af');
    
    doc.undash();
    
    // Titre section
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('✂ Bulletin de versement QR', 50, qrSectionY + 5);
    
    // Zone récépissé (gauche)
    doc.fontSize(7)
       .font('Helvetica-Bold')
       .fillColor('#000')
       .text('Récépissé', 55, qrSectionY + 25);
    
    doc.font('Helvetica')
       .fontSize(6)
       .text('Compte / Payable à', 55, qrSectionY + 40)
       .fontSize(7)
       .text(qrData.iban, 55, qrSectionY + 50)
       .text(this.getCreditorName(invoice.owner_company), 55, qrSectionY + 60);
    
    doc.fontSize(6)
       .text('Référence', 55, qrSectionY + 80)
       .fontSize(7)
       .text(this.formatQRReference(qrData.reference), 55, qrSectionY + 90);
    
    doc.fontSize(6)
       .text('Payable par', 55, qrSectionY + 110)
       .fontSize(7)
       .text(invoice.client_name, 55, qrSectionY + 120);
    
    // Montant récépissé
    doc.fontSize(6)
       .text('Monnaie', 55, qrSectionY + 145)
       .text('Montant', 100, qrSectionY + 145);
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .text(invoice.currency || 'CHF', 55, qrSectionY + 155)
       .text(this.formatMoney(invoice.amount), 100, qrSectionY + 155);
    
    // QR Code (centre-droit)
    const qrImage = await this.generateQRCodeImage(qrData.content);
    doc.image(qrImage, 250, qrSectionY + 30, { width: 120, height: 120 });
    
    // Zone paiement (droite)
    doc.fontSize(7)
       .font('Helvetica-Bold')
       .text('Section paiement', 390, qrSectionY + 25);
    
    doc.font('Helvetica')
       .fontSize(6)
       .text('Monnaie', 390, qrSectionY + 45)
       .text('Montant', 430, qrSectionY + 45);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(invoice.currency || 'CHF', 390, qrSectionY + 55)
       .text(this.formatMoney(invoice.amount), 430, qrSectionY + 55);
    
    doc.font('Helvetica')
       .fontSize(6)
       .text('Compte / Payable à', 390, qrSectionY + 80)
       .fontSize(7)
       .text(qrData.iban, 390, qrSectionY + 90)
       .text(this.getCreditorName(invoice.owner_company), 390, qrSectionY + 100);
    
    doc.fontSize(6)
       .text('Référence', 390, qrSectionY + 120)
       .fontSize(7)
       .text(this.formatQRReference(qrData.reference), 390, qrSectionY + 130);
  }

  /**
   * Footer
   */
  renderFooter(doc, invoice, colors) {
    doc.fontSize(7)
       .fillColor('#9ca3af')
       .text(
         `${invoice.owner_company} | Document généré le ${new Date().toLocaleDateString('fr-CH')}`,
         50, 780, { align: 'center', width: 495 }
       );
  }

  /**
   * Générer image QR code
   */
  async generateQRCodeImage(content) {
    return QRCode.toBuffer(content, {
      type: 'png',
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M'
    });
  }

  /**
   * Formatage monétaire suisse
   */
  formatMoney(amount) {
    return new Intl.NumberFormat('fr-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Formatage date
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatage référence QR (groupes de 5)
   */
  formatQRReference(ref) {
    if (!ref) return '';
    return ref.replace(/(.{5})/g, '$1 ').trim();
  }

  /**
   * Nom créditeur
   */
  getCreditorName(companyName) {
    const names = {
      'HYPERVISUAL': 'HYPERVISUAL Sàrl',
      'DAINAMICS': 'DAINAMICS SA',
      'LEXAIA': 'LEXAIA Sàrl',
      'ENKI REALTY': 'ENKI REALTY SA',
      'TAKEOUT': 'TAKEOUT Sàrl'
    };
    return names[companyName] || companyName;
  }
}

export const pdfGeneratorService = new PDFGeneratorService();
export default PDFGeneratorService;
```

## Instructions pour Claude Code
1. Installer les dépendances: `npm install pdfkit qrcode --save`
2. Créer le fichier dans `src/backend/services/finance/`
3. S'assurer que le dossier `uploads/invoices` existe
4. Tester la génération avec une facture mock

## Test
```javascript
import { pdfGeneratorService } from './pdf-generator.service.js';

const mockInvoice = {
  invoice_number: 'HYP-2025-0001',
  owner_company: 'HYPERVISUAL',
  client_name: 'Test Client SA',
  date: '2025-01-15',
  due_date: '2025-02-15',
  items: [{ description: 'Service web', quantity: 1, unit_price: 5000, vat_rate: 8.1 }],
  amount_ht: 5000,
  amount_tva: 405,
  amount: 5405,
  currency: 'CHF'
};

const mockQR = {
  content: 'SPC\n0200\n...',
  reference: '000000000000000000000000001',
  iban: 'CH4431999123000889012'
};

const result = await pdfGeneratorService.generateInvoicePDF(mockInvoice, mockQR);
console.log(result);
```
