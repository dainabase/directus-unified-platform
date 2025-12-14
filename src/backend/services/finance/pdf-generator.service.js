/**
 * PDFGeneratorService
 * Genere des factures PDF avec QR-Facture suisse integre
 *
 * Conformite suisse:
 * - QR-Facture ISO 20022 v2.3
 * - Format A4 standard
 * - Section paiement detachable
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
   * Generer une facture PDF complete avec QR Swiss
   * @param {Object} invoice - Donnees facture de Directus
   * @param {Object} qrData - Donnees QR generees par UnifiedInvoiceService
   * @param {Object} options - Options de generation
   * @returns {Promise<Object>} - Chemin du fichier PDF et metadonnees
   */
  async generateInvoicePDF(invoice, qrData, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const filename = `${invoice.invoice_number}.pdf`;
        const filepath = path.join(this.outputDir, filename);

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Facture ${invoice.invoice_number}`,
            Author: invoice.owner_company,
            Subject: `Facture pour ${invoice.client_name}`,
            Creator: 'Directus Unified Platform',
            Producer: 'PDFKit',
            CreationDate: new Date()
          }
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Configuration couleurs par entreprise
        const colors = this.getCompanyColors(invoice.owner_company);

        // === EN-TETE ===
        await this.renderHeader(doc, invoice, colors);

        // === INFORMATIONS CLIENT ===
        this.renderClientInfo(doc, invoice);

        // === DETAILS FACTURE ===
        this.renderInvoiceDetails(doc, invoice);

        // === TABLEAU DES LIGNES ===
        this.renderLineItems(doc, invoice, colors);

        // === TOTAUX ===
        this.renderTotals(doc, invoice, colors);

        // === CONDITIONS DE PAIEMENT ===
        this.renderPaymentConditions(doc, invoice);

        // === SECTION QR-FACTURE (bas de page) ===
        await this.renderQRSection(doc, invoice, qrData);

        // === FOOTER ===
        this.renderFooter(doc, invoice, colors);

        doc.end();

        stream.on('finish', () => {
          const stats = fs.statSync(filepath);
          resolve({
            success: true,
            filepath,
            filename,
            url: `/uploads/invoices/${filename}`,
            size: stats.size,
            createdAt: new Date().toISOString()
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generer un rappel de paiement PDF
   * @param {Object} invoice - Facture en retard
   * @param {Object} qrData - Donnees QR
   * @param {number} reminderLevel - Niveau de rappel (1, 2, 3)
   * @param {Object} interestData - Donnees interets de retard
   * @returns {Promise<Object>} - Fichier PDF genere
   */
  async generatePaymentReminderPDF(invoice, qrData, reminderLevel = 1, interestData = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const filename = `RAPPEL-${reminderLevel}-${invoice.invoice_number}.pdf`;
        const filepath = path.join(this.outputDir, filename);

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        const colors = this.getCompanyColors(invoice.owner_company);
        const reminderTitles = {
          1: 'RAPPEL DE PAIEMENT',
          2: 'SECOND RAPPEL',
          3: 'MISE EN DEMEURE'
        };

        // En-tete
        await this.renderHeader(doc, invoice, colors);

        // Titre du rappel
        doc.fillColor(reminderLevel >= 3 ? '#dc2626' : colors.primary)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(reminderTitles[reminderLevel] || 'RAPPEL', 50, 140);

        // Reference facture
        doc.fillColor('#374151')
           .fontSize(11)
           .font('Helvetica')
           .text(`Concernant la facture N ${invoice.invoice_number} du ${this.formatDate(invoice.date)}`, 50, 170)
           .text(`Echeance: ${this.formatDate(invoice.due_date)}`, 50, 185);

        // Message de rappel
        const messages = {
          1: `Nous nous permettons de vous rappeler que la facture mentionnee ci-dessus n'a pas encore ete reglee. Nous vous prions de bien vouloir proceder au paiement dans les plus brefs delais.`,
          2: `Malgre notre premier rappel, nous n'avons toujours pas recu le paiement de la facture mentionnee ci-dessus. Nous vous prions instamment de regulariser votre situation dans un delai de 10 jours.`,
          3: `Cette mise en demeure constitue notre dernier avertissement avant transmission du dossier aux services de recouvrement. Le non-paiement dans un delai de 10 jours entrainera des frais supplementaires et des poursuites.`
        };

        doc.fontSize(10)
           .text(messages[reminderLevel] || messages[1], 50, 210, { width: 495, align: 'justify' });

        // Montants
        let yPos = 280;
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('Recapitulatif:', 50, yPos);

        yPos += 20;
        doc.font('Helvetica')
           .fontSize(10)
           .text('Montant facture:', 50, yPos)
           .text(`${this.formatMoney(invoice.amount)} ${invoice.currency || 'CHF'}`, 400, yPos, { align: 'right', width: 145 });

        if (interestData && interestData.interest > 0) {
          yPos += 18;
          doc.text(`Interets de retard (${interestData.daysLate} jours a ${interestData.interestRate}%):`, 50, yPos)
             .text(`${this.formatMoney(interestData.interest)} ${invoice.currency || 'CHF'}`, 400, yPos, { align: 'right', width: 145 });

          yPos += 18;
          const reminderFees = this.getReminderFees(reminderLevel);
          doc.text('Frais de rappel:', 50, yPos)
             .text(`${this.formatMoney(reminderFees)} ${invoice.currency || 'CHF'}`, 400, yPos, { align: 'right', width: 145 });

          yPos += 25;
          const totalDue = parseFloat(invoice.amount) + interestData.interest + reminderFees;
          doc.font('Helvetica-Bold')
             .fontSize(12)
             .text('TOTAL A PAYER:', 50, yPos)
             .fillColor(colors.primary)
             .text(`${this.formatMoney(totalDue)} ${invoice.currency || 'CHF'}`, 400, yPos, { align: 'right', width: 145 });
        }

        // Section QR
        await this.renderQRSection(doc, invoice, qrData);

        // Footer
        this.renderFooter(doc, invoice, colors);

        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            filepath,
            filename,
            url: `/uploads/invoices/${filename}`,
            reminderLevel
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generer un releve de compte PDF
   * @param {Object} client - Donnees client
   * @param {Array} invoices - Liste des factures
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Fichier PDF genere
   */
  async generateAccountStatementPDF(client, invoices, ownerCompany, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const date = new Date().toISOString().split('T')[0];
        const filename = `RELEVE-${client.name.replace(/\s+/g, '-')}-${date}.pdf`;
        const filepath = path.join(this.outputDir, filename);

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        const colors = this.getCompanyColors(ownerCompany);

        // En-tete
        doc.rect(50, 50, 120, 40).fill(colors.primary);
        doc.fillColor('white')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(ownerCompany, 55, 62, { width: 110 });

        doc.fillColor(colors.primary)
           .fontSize(22)
           .font('Helvetica-Bold')
           .text('RELEVE DE COMPTE', 300, 50, { align: 'right' });

        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(`Date: ${this.formatDate(date)}`, 400, 80, { align: 'right' });

        // Client
        doc.fontSize(10)
           .fillColor('#6b7280')
           .text('CLIENT:', 50, 120);
        doc.fontSize(12)
           .fillColor('#111827')
           .font('Helvetica-Bold')
           .text(client.name, 50, 135);

        // Tableau des factures
        const tableTop = 180;
        doc.rect(50, tableTop, 495, 25).fill(colors.primary);
        doc.fillColor('white')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('N Facture', 55, tableTop + 8)
           .text('Date', 150, tableTop + 8)
           .text('Echeance', 220, tableTop + 8)
           .text('Montant', 300, tableTop + 8)
           .text('Paye', 380, tableTop + 8)
           .text('Solde', 450, tableTop + 8)
           .text('Statut', 510, tableTop + 8);

        let y = tableTop + 30;
        let totalDue = 0;
        let totalPaid = 0;

        doc.fillColor('#374151')
           .font('Helvetica')
           .fontSize(8);

        invoices.forEach((inv, index) => {
          if (index % 2 === 0) {
            doc.rect(50, y - 3, 495, 18).fill('#f9fafb');
            doc.fillColor('#374151');
          }

          const paid = inv.status === 'paid' ? parseFloat(inv.amount) : 0;
          const due = inv.status !== 'paid' && inv.status !== 'cancelled' ? parseFloat(inv.amount) - paid : 0;

          totalDue += due;
          totalPaid += paid;

          doc.text(inv.invoice_number, 55, y)
             .text(this.formatDate(inv.date), 150, y)
             .text(this.formatDate(inv.due_date), 220, y)
             .text(this.formatMoney(inv.amount), 300, y)
             .text(this.formatMoney(paid), 380, y)
             .text(this.formatMoney(due), 450, y)
             .text(this.getStatusLabel(inv.status), 510, y);

          y += 20;
        });

        // Totaux
        y += 10;
        doc.moveTo(50, y).lineTo(545, y).stroke('#d1d5db');
        y += 15;

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text('TOTAL FACTURE:', 300, y)
           .text(this.formatMoney(totalPaid + totalDue), 450, y, { align: 'right', width: 95 });

        y += 20;
        doc.text('TOTAL PAYE:', 300, y)
           .fillColor('#059669')
           .text(this.formatMoney(totalPaid), 450, y, { align: 'right', width: 95 });

        y += 20;
        doc.fillColor(totalDue > 0 ? '#dc2626' : '#059669')
           .fontSize(12)
           .text('SOLDE DU:', 300, y)
           .text(this.formatMoney(totalDue), 450, y, { align: 'right', width: 95 });

        // Footer
        this.renderFooter(doc, { owner_company: ownerCompany }, colors);

        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            filepath,
            filename,
            url: `/uploads/invoices/${filename}`,
            totalDue,
            totalPaid
          });
        });

        stream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generer un avoir (note de credit) PDF
   * @param {Object} creditNote - Donnees de l'avoir
   * @param {Object} originalInvoice - Facture originale
   * @returns {Promise<Object>} - Fichier PDF genere
   */
  async generateCreditNotePDF(creditNote, originalInvoice = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const filename = `AVOIR-${creditNote.invoice_number}.pdf`;
        const filepath = path.join(this.outputDir, filename);

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        const colors = this.getCompanyColors(creditNote.owner_company);

        // En-tete special avoir
        doc.rect(50, 50, 120, 40).fill('#dc2626');
        doc.fillColor('white')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(creditNote.owner_company, 55, 60, { width: 110 });

        doc.fillColor('#dc2626')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('AVOIR', 400, 50, { align: 'right' });

        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(`N ${creditNote.invoice_number}`, 400, 85, { align: 'right' })
           .text(`Date: ${this.formatDate(creditNote.date)}`, 400, 100, { align: 'right' });

        if (originalInvoice) {
          doc.text(`Ref. facture: ${originalInvoice.invoice_number}`, 400, 115, { align: 'right' });
        }

        // Informations client
        this.renderClientInfo(doc, creditNote);

        // Lignes (montants negatifs)
        this.renderLineItems(doc, creditNote, { ...colors, primary: '#dc2626' });

        // Totaux (en negatif)
        const y = 480;
        doc.fontSize(10)
           .font('Helvetica');

        doc.fillColor('#6b7280')
           .text('Sous-total HT:', 350, y)
           .fillColor('#dc2626')
           .text(`-${this.formatMoney(Math.abs(creditNote.amount_ht))} ${creditNote.currency || 'CHF'}`, 450, y, { align: 'right', width: 95 });

        doc.fillColor('#6b7280')
           .text('TVA:', 350, y + 20)
           .fillColor('#dc2626')
           .text(`-${this.formatMoney(Math.abs(creditNote.amount_tva))} ${creditNote.currency || 'CHF'}`, 450, y + 20, { align: 'right', width: 95 });

        doc.rect(345, y + 45, 200, 30).fill('#dc2626');
        doc.fillColor('white')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('TOTAL AVOIR:', 350, y + 52)
           .text(`-${this.formatMoney(Math.abs(creditNote.amount))} ${creditNote.currency || 'CHF'}`, 450, y + 52, { align: 'right', width: 90 });

        // Footer
        this.renderFooter(doc, creditNote, colors);

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
   * En-tete de la facture
   */
  async renderHeader(doc, invoice, colors) {
    // Logo placeholder (rectangle colore)
    doc.rect(50, 50, 120, 40).fill(colors.primary);

    doc.fillColor('white')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(invoice.owner_company, 55, 62, { width: 110 });

    // Titre FACTURE
    doc.fillColor(colors.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('FACTURE', 400, 50, { align: 'right' });

    // Numero et date
    doc.fillColor('#374151')
       .fontSize(10)
       .font('Helvetica')
       .text(`N ${invoice.invoice_number}`, 400, 85, { align: 'right' })
       .text(`Date: ${this.formatDate(invoice.date)}`, 400, 100, { align: 'right' })
       .text(`Echeance: ${this.formatDate(invoice.due_date)}`, 400, 115, { align: 'right' });

    doc.moveDown(2);
  }

  /**
   * Informations client
   */
  renderClientInfo(doc, invoice) {
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('FACTURE A:', 50, 150);

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
   * Details facture (reference, conditions)
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

    // En-tete du tableau
    doc.rect(50, tableTop, 495, 25).fill(colors.primary);

    doc.fillColor('white')
       .fontSize(9)
       .font('Helvetica-Bold');

    doc.text('Description', 55, tableTop + 8)
       .text('Qte', 310, tableTop + 8)
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

      // Fond alterne
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

    // Ligne de separation
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
    doc.rect(rightCol - 105, y + 45, 200, 30).fill(colors.primary);

    doc.fillColor('white')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('TOTAL TTC:', rightCol - 100, y + 52)
       .text(this.formatMoney(invoice.amount) + ' ' + (invoice.currency || 'CHF'), rightCol, y + 52, { align: 'right', width: 90 });
  }

  /**
   * Conditions de paiement
   */
  renderPaymentConditions(doc, invoice) {
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('Paiement a effectuer dans les ' + (invoice.payment_terms || 30) + ' jours sur le compte indique ci-dessous.', 50, 540)
       .text('En cas de retard, des interets de 5% seront appliques conformement a l\'art. 104 CO.', 50, 552);
  }

  /**
   * Section QR-Facture (bulletin de versement suisse)
   */
  async renderQRSection(doc, invoice, qrData) {
    const qrSectionY = 580;

    // Ligne de separation perforee
    doc.moveTo(50, qrSectionY)
       .lineTo(545, qrSectionY)
       .dash(5, { space: 3 })
       .stroke('#9ca3af');

    doc.undash();

    // Titre section
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('Bulletin de versement QR', 50, qrSectionY + 5);

    // Zone recepisse (gauche)
    doc.fontSize(7)
       .font('Helvetica-Bold')
       .fillColor('#000')
       .text('Recepisse', 55, qrSectionY + 25);

    doc.font('Helvetica')
       .fontSize(6)
       .text('Compte / Payable a', 55, qrSectionY + 40)
       .fontSize(7)
       .text(qrData.iban, 55, qrSectionY + 50)
       .text(this.getCreditorName(invoice.owner_company), 55, qrSectionY + 60);

    doc.fontSize(6)
       .text('Reference', 55, qrSectionY + 80)
       .fontSize(7)
       .text(this.formatQRReference(qrData.reference), 55, qrSectionY + 90);

    doc.fontSize(6)
       .text('Payable par', 55, qrSectionY + 110)
       .fontSize(7)
       .text(invoice.client_name, 55, qrSectionY + 120);

    // Montant recepisse
    doc.fontSize(6)
       .text('Monnaie', 55, qrSectionY + 145)
       .text('Montant', 100, qrSectionY + 145);
    doc.fontSize(8)
       .font('Helvetica-Bold')
       .text(invoice.currency || 'CHF', 55, qrSectionY + 155)
       .text(this.formatMoney(invoice.amount), 100, qrSectionY + 155);

    // QR Code (centre-droit)
    try {
      const qrImage = await this.generateQRCodeImage(qrData.content);
      doc.image(qrImage, 250, qrSectionY + 30, { width: 120, height: 120 });
    } catch (error) {
      console.error('Erreur generation QR code:', error);
      doc.rect(250, qrSectionY + 30, 120, 120).stroke('#ccc');
      doc.fontSize(8).text('QR Code', 290, qrSectionY + 85);
    }

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
       .text('Compte / Payable a', 390, qrSectionY + 80)
       .fontSize(7)
       .text(qrData.iban, 390, qrSectionY + 90)
       .text(this.getCreditorName(invoice.owner_company), 390, qrSectionY + 100);

    doc.fontSize(6)
       .text('Reference', 390, qrSectionY + 120)
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
         `${invoice.owner_company} | Document genere le ${new Date().toLocaleDateString('fr-CH')}`,
         50, 780, { align: 'center', width: 495 }
       );
  }

  /**
   * Generer image QR code
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
   * Formatage monetaire suisse
   */
  formatMoney(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  /**
   * Formatage date
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatage reference QR (groupes de 5)
   */
  formatQRReference(ref) {
    if (!ref) return '';
    return ref.replace(/(.{5})/g, '$1 ').trim();
  }

  /**
   * Nom crediteur
   */
  getCreditorName(companyName) {
    const names = {
      'HYPERVISUAL': 'HYPERVISUAL Sarl',
      'DAINAMICS': 'DAINAMICS SA',
      'LEXAIA': 'LEXAIA Sarl',
      'ENKI REALTY': 'ENKI REALTY SA',
      'TAKEOUT': 'TAKEOUT Sarl'
    };
    return names[companyName] || companyName;
  }

  /**
   * Frais de rappel par niveau
   */
  getReminderFees(level) {
    const fees = { 1: 0, 2: 20, 3: 50 };
    return fees[level] || 0;
  }

  /**
   * Label statut
   */
  getStatusLabel(status) {
    const labels = {
      'draft': 'Brouillon',
      'sent': 'Envoyee',
      'pending': 'En attente',
      'paid': 'Payee',
      'partial': 'Partiel',
      'overdue': 'En retard',
      'cancelled': 'Annulee',
      'disputed': 'Litige'
    };
    return labels[status] || status;
  }

  /**
   * Supprimer un fichier PDF
   */
  async deletePDF(filename) {
    const filepath = path.join(this.outputDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { success: true, message: `Fichier ${filename} supprime` };
    }
    return { success: false, message: 'Fichier non trouve' };
  }

  /**
   * Lister les PDFs generes
   */
  listGeneratedPDFs() {
    const files = fs.readdirSync(this.outputDir);
    return files
      .filter(f => f.endsWith('.pdf'))
      .map(f => ({
        filename: f,
        filepath: path.join(this.outputDir, f),
        url: `/uploads/invoices/${f}`,
        stats: fs.statSync(path.join(this.outputDir, f))
      }));
  }
}

export const pdfGeneratorService = new PDFGeneratorService();
export default PDFGeneratorService;
