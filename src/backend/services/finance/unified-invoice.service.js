/**
 * UnifiedInvoiceService
 * Crée des factures complètes avec QR-Facture suisse en une seule action
 */

import { Directus } from '@directus/sdk';

class UnifiedInvoiceService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
  }

  getDirectusClient() {
    const client = new Directus(this.directusUrl);
    if (this.directusToken) {
      client.auth.static(this.directusToken);
    }
    return client;
  }

  /**
   * Créer une facture complète avec QR suisse
   */
  async createInvoice(invoiceData, options = {}) {
    const directus = this.getDirectusClient();
    
    // 1. Valider les données
    this.validateInvoiceData(invoiceData);
    
    // 2. Calculer les totaux
    const totals = this.calculateTotals(invoiceData.items);
    
    // 3. Générer le numéro de facture
    const invoiceNumber = await this.generateInvoiceNumber(directus, invoiceData.owner_company);
    
    // 4. Générer la référence QR (26 chiffres + checksum)
    const qrReference = this.generateQRReference();
    
    // 5. Récupérer les données entreprise et client
    const companyData = this.getCompanyConfig(invoiceData.owner_company);
    const clientData = await this.getClientData(directus, invoiceData.client_id);
    
    // 6. Créer la facture dans Directus
    const invoice = await directus.items('client_invoices').createOne({
        invoice_number: invoiceNumber,
        owner_company: invoiceData.owner_company,
        company_id: invoiceData.client_id,
        client_name: clientData.name,
        date: new Date().toISOString().split('T')[0],
        due_date: this.calculateDueDate(invoiceData.payment_terms || 30),
        items: JSON.stringify(invoiceData.items),
        amount_ht: totals.ht,
        amount_tva: totals.tva,
        amount: totals.ttc,
        currency: invoiceData.currency || 'CHF',
        qr_reference: qrReference,
        qr_iban: companyData.qr_iban,
        status: 'draft',
        notes: invoiceData.notes || ''
      });
    
    // 7. Générer les données QR Swiss
    const qrData = this.generateSwissQRData({
      creditor: companyData,
      debtor: clientData,
      amount: totals.ttc,
      currency: invoiceData.currency || 'CHF',
      reference: qrReference
    });
    
    return {
      success: true,
      invoice,
      qrData,
      totals,
      message: `Facture ${invoiceNumber} créée avec succès`
    };
  }

  /**
   * Calculer les totaux avec TVA suisse 2025
   */
  calculateTotals(items) {
    let ht = 0;
    let tvaByRate = {};
    
    for (const item of items) {
      const lineHT = item.quantity * item.unit_price;
      const vatRate = item.vat_rate || 8.1; // Taux normal par défaut
      const lineTVA = lineHT * (vatRate / 100);
      
      ht += lineHT;
      tvaByRate[vatRate] = (tvaByRate[vatRate] || 0) + lineTVA;
    }
    
    const tva = Object.values(tvaByRate).reduce((sum, val) => sum + val, 0);
    
    return {
      ht: Math.round(ht * 100) / 100,
      tva: Math.round(tva * 100) / 100,
      ttc: Math.round((ht + tva) * 100) / 100,
      tvaByRate
    };
  }

  /**
   * Générer numéro séquentiel: {PREFIX}-{YEAR}-{0001}
   */
  async generateInvoiceNumber(directus, companyName) {
    const year = new Date().getFullYear();
    const prefixes = {
      'HYPERVISUAL': 'HYP',
      'DAINAMICS': 'DAI',
      'LEXAIA': 'LEX',
      'ENKI REALTY': 'ENK',
      'TAKEOUT': 'TKO'
    };
    const prefix = prefixes[companyName] || 'INV';
    
    try {
      const result = await directus.request(
        directus.items('client_invoices').readMany({
          filter: {
            owner_company: { _eq: companyName },
            invoice_number: { _starts_with: `${prefix}-${year}` }
          },
          sort: ['-invoice_number'],
          limit: 1,
          fields: ['invoice_number']
        })
      );
      
      let sequence = 1;
      if (result && result.length > 0) {
        const lastNum = result[0].invoice_number;
        const parts = lastNum.split('-');
        sequence = parseInt(parts[2] || '0') + 1;
      }
      
      return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      // Si erreur, générer avec timestamp
      return `${prefix}-${year}-${Date.now().toString().slice(-4)}`;
    }
  }

  /**
   * Générer référence QR (format suisse: 26 chiffres + modulo 10)
   */
  generateQRReference() {
    // Format: RRRRRRRRRRRRRRRRRRRRRRRRRC (26 chiffres + checksum)
    const timestamp = Date.now().toString();
    const random = Math.random().toString().slice(2, 10);
    let reference = (timestamp + random).padEnd(26, '0').slice(0, 26);
    
    // Calculer checksum modulo 10 récursif
    const checksum = this.calculateMod10(reference);
    return reference + checksum;
  }

  /**
   * Algorithme Modulo 10 récursif (standard suisse)
   */
  calculateMod10(str) {
    const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
    let carry = 0;
    for (const char of str) {
      carry = table[(carry + parseInt(char)) % 10];
    }
    return (10 - carry) % 10;
  }

  /**
   * Configuration des entreprises (IBAN QR, adresses)
   */
  getCompanyConfig(companyName) {
    const configs = {
      'HYPERVISUAL': {
        name: 'HYPERVISUAL Sàrl',
        street: 'Rue du Commerce 15',
        postal_code: '1003',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH4431999123000889012' // À REMPLACER par vrai IBAN QR
      },
      'DAINAMICS': {
        name: 'DAINAMICS SA',
        street: 'Avenue de la Gare 10',
        postal_code: '1005',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH5604835012345678009'
      },
      'LEXAIA': {
        name: 'LEXAIA Sàrl',
        street: 'Place de la Riponne 3',
        postal_code: '1005',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH2909000000123456789'
      },
      'ENKI REALTY': {
        name: 'ENKI REALTY SA',
        street: 'Chemin des Vignes 8',
        postal_code: '1009',
        city: 'Pully',
        country: 'CH',
        qr_iban: 'CH3108390123000456789'
      },
      'TAKEOUT': {
        name: 'TAKEOUT Sàrl',
        street: 'Rue de Genève 25',
        postal_code: '1004',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH4800700110007852345'
      }
    };
    
    return configs[companyName] || configs['HYPERVISUAL'];
  }

  /**
   * Récupérer données client depuis Directus
   */
  async getClientData(directus, clientId) {
    try {
      const client = await directus.request(
        directus.items('companies').readOne(clientId)
      );
      
      return {
        name: client.name || 'Client',
        street: client.address || client.street || '',
        postal_code: client.postal_code || client.zip || '',
        city: client.city || '',
        country: client.country || 'CH'
      };
    } catch (error) {
      return {
        name: 'Client',
        street: '',
        postal_code: '',
        city: '',
        country: 'CH'
      };
    }
  }

  /**
   * Calculer date d'échéance
   */
  calculateDueDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date.toISOString().split('T')[0];
  }

  /**
   * Générer données QR Swiss (format SPC)
   */
  generateSwissQRData(data) {
    // Format Swiss QR Code selon ISO 20022
    const qrContent = [
      'SPC',                              // Header
      '0200',                             // Version
      '1',                                // Coding Type (UTF-8)
      data.creditor.qr_iban,              // IBAN
      'S',                                // Address Type (Structured)
      data.creditor.name,                 // Creditor Name
      data.creditor.street,               // Street
      '',                                 // Building Number (optional)
      data.creditor.postal_code,          // Postal Code
      data.creditor.city,                 // City
      data.creditor.country,              // Country
      '',                                 // Ultimate Creditor (empty)
      '',                                 // 
      '',                                 // 
      '',                                 // 
      '',                                 // 
      '',                                 // 
      '',                                 // 
      data.amount.toFixed(2),             // Amount
      data.currency,                      // Currency
      'S',                                // Debtor Address Type
      data.debtor.name,                   // Debtor Name
      data.debtor.street,                 // 
      '',                                 // 
      data.debtor.postal_code,            // 
      data.debtor.city,                   // 
      data.debtor.country,                // 
      'QRR',                              // Reference Type (QR Reference)
      data.reference,                     // Reference
      '',                                 // Additional Info
      'EPD',                              // Trailer
    ].join('\n');
    
    return {
      content: qrContent,
      reference: data.reference,
      iban: data.creditor.qr_iban,
      amount: data.amount,
      currency: data.currency
    };
  }

  /**
   * Validation des données
   */
  validateInvoiceData(data) {
    const errors = [];
    
    if (!data.owner_company) errors.push('owner_company requis');
    if (!data.client_id) errors.push('client_id requis');
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('items requis (tableau non vide)');
    }
    
    const validCompanies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT'];
    if (data.owner_company && !validCompanies.includes(data.owner_company)) {
      errors.push(`owner_company invalide. Valeurs: ${validCompanies.join(', ')}`);
    }
    
    if (data.items) {
      data.items.forEach((item, i) => {
        if (!item.description) errors.push(`items[${i}].description requis`);
        if (typeof item.quantity !== 'number') errors.push(`items[${i}].quantity requis (number)`);
        if (typeof item.unit_price !== 'number') errors.push(`items[${i}].unit_price requis (number)`);
      });
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation échouée: ${errors.join(', ')}`);
    }
  }

  /**
   * Mettre à jour le statut
   */
  async updateStatus(invoiceId, status) {
    const directus = this.getDirectusClient();
    const validStatuses = ['draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Statut invalide. Valeurs: ${validStatuses.join(', ')}`);
    }
    
    const updates = { status };
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    
    return directus.items('client_invoices').updateOne(invoiceId, updates);
  }

  /**
   * Marquer comme payée
   */
  async markAsPaid(invoiceId, paymentData = {}) {
    const directus = this.getDirectusClient();
    
    // Récupérer la facture
    const invoice = await directus.items('client_invoices').readOne(invoiceId);
    
    // Mettre à jour le statut
    await this.updateStatus(invoiceId, 'paid');
    
    // Créer le paiement
    await directus.items('payments').createOne({
        owner_company: invoice.owner_company,
        invoice_id: invoiceId,
        amount: paymentData.amount || invoice.amount,
        currency: invoice.currency || 'CHF',
        payment_date: paymentData.date || new Date().toISOString(),
        payment_method: paymentData.method || 'bank_transfer',
        reference: paymentData.reference || '',
        bank_transaction_id: paymentData.transaction_id || null,
        status: 'completed'
      });
    
    return { success: true, message: 'Facture marquée comme payée' };
  }

  /**
   * Récupérer une facture avec ses données QR
   */
  async getInvoiceWithQR(invoiceId) {
    const directus = this.getDirectusClient();
    const invoice = await directus.items('client_invoices').readOne(invoiceId);
    
    const companyData = this.getCompanyConfig(invoice.owner_company);
    const clientData = await this.getClientData(directus, invoice.company_id);
    
    const qrData = this.generateSwissQRData({
      creditor: companyData,
      debtor: clientData,
      amount: parseFloat(invoice.amount),
      currency: invoice.currency || 'CHF',
      reference: invoice.qr_reference
    });
    
    return { invoice, qrData };
  }
}

// Import des fonctions Directus SDK
// Imports supprimés - utilisés via Directus client

export const unifiedInvoiceService = new UnifiedInvoiceService();
export default UnifiedInvoiceService;