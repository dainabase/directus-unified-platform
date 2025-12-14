/**
 * UnifiedInvoiceService
 * Crée des factures complètes avec QR-Facture suisse en une seule action
 *
 * Conformité suisse:
 * - TVA 8.1% (normal), 2.6% (réduit), 3.8% (hébergement)
 * - QR-Facture ISO 20022 v2.3
 * - IBAN QR obligatoire
 * - Intérêts retard 5% (art. 104 CO)
 */

import { createDirectus, rest, authentication, createItem, readItem, readItems, updateItem } from '@directus/sdk';

class UnifiedInvoiceService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;

    // Taux TVA suisse 2025
    this.TVA_RATES = {
      NORMAL: 8.1,
      REDUIT: 2.6,
      HEBERGEMENT: 3.8,
      EXONERE: 0
    };

    // Taux d'intérêts de retard (art. 104 CO)
    this.INTEREST_RATE = 5.0;
  }

  getDirectusClient() {
    const client = createDirectus(this.directusUrl)
      .with(authentication())
      .with(rest());
    client.setToken(this.directusToken);
    return client;
  }

  /**
   * Créer une facture complète avec QR suisse
   * @param {Object} invoiceData - Données de la facture
   * @param {string} invoiceData.owner_company - Entreprise émettrice (HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT)
   * @param {string} invoiceData.client_id - ID du client dans Directus
   * @param {Array} invoiceData.items - Lignes de facture [{description, quantity, unit_price, vat_rate}]
   * @param {string} [invoiceData.currency='CHF'] - Devise (CHF ou EUR)
   * @param {number} [invoiceData.payment_terms=30] - Délai de paiement en jours
   * @param {string} [invoiceData.notes] - Notes additionnelles
   * @param {Object} [options] - Options supplémentaires
   * @returns {Object} Facture créée avec données QR
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
    const invoice = await directus.request(
      createItem('client_invoices', {
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
        notes: invoiceData.notes || '',
        payment_terms: invoiceData.payment_terms || 30,
        created_at: new Date().toISOString()
      })
    );

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
   * @param {Array} items - Lignes de facture
   * @returns {Object} Totaux calculés {ht, tva, ttc, tvaByRate, itemCount}
   */
  calculateTotals(items) {
    let ht = 0;
    let tvaByRate = {};

    for (const item of items) {
      const lineHT = item.quantity * item.unit_price;
      const discount = item.discount || 0;
      const lineHTAfterDiscount = lineHT * (1 - discount / 100);
      const vatRate = item.vat_rate !== undefined ? item.vat_rate : this.TVA_RATES.NORMAL;
      const lineTVA = lineHTAfterDiscount * (vatRate / 100);

      ht += lineHTAfterDiscount;
      tvaByRate[vatRate] = (tvaByRate[vatRate] || 0) + lineTVA;
    }

    const tva = Object.values(tvaByRate).reduce((sum, val) => sum + val, 0);

    return {
      ht: Math.round(ht * 100) / 100,
      tva: Math.round(tva * 100) / 100,
      ttc: Math.round((ht + tva) * 100) / 100,
      tvaByRate,
      itemCount: items.length
    };
  }

  /**
   * Générer numéro séquentiel: {PREFIX}-{YEAR}-{0001}
   * @param {Object} directus - Client Directus
   * @param {string} companyName - Nom de l'entreprise
   * @returns {string} Numéro de facture unique
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
        readItems('client_invoices', {
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
      // Si erreur, générer avec timestamp unique
      return `${prefix}-${year}-${Date.now().toString().slice(-4)}`;
    }
  }

  /**
   * Générer référence QR (format suisse: 26 chiffres + modulo 10)
   * @returns {string} Référence QR de 27 caractères
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
   * @param {string} str - Chaîne de chiffres
   * @returns {number} Checksum (0-9)
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
   * Configuration des entreprises (IBAN QR, adresses, IDE)
   * @param {string} companyName - Nom de l'entreprise
   * @returns {Object} Configuration complète de l'entreprise
   */
  getCompanyConfig(companyName) {
    const configs = {
      'HYPERVISUAL': {
        name: 'HYPERVISUAL Sàrl',
        ide: 'CHE-123.456.789',
        street: 'Rue du Commerce 15',
        postal_code: '1003',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH4431999123000889012',
        email: 'contact@hypervisual.ch',
        phone: '+41 21 123 45 67',
        vat_number: 'CHE-123.456.789 TVA'
      },
      'DAINAMICS': {
        name: 'DAINAMICS SA',
        ide: 'CHE-234.567.890',
        street: 'Avenue de la Gare 10',
        postal_code: '1005',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH5604835012345678009',
        email: 'contact@dainamics.ch',
        phone: '+41 21 234 56 78',
        vat_number: 'CHE-234.567.890 TVA'
      },
      'LEXAIA': {
        name: 'LEXAIA Sàrl',
        ide: 'CHE-345.678.901',
        street: 'Place de la Riponne 3',
        postal_code: '1005',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH2909000000123456789',
        email: 'contact@lexaia.ch',
        phone: '+41 21 345 67 89',
        vat_number: 'CHE-345.678.901 TVA'
      },
      'ENKI REALTY': {
        name: 'ENKI REALTY SA',
        ide: 'CHE-456.789.012',
        street: 'Chemin des Vignes 8',
        postal_code: '1009',
        city: 'Pully',
        country: 'CH',
        qr_iban: 'CH3108390123000456789',
        email: 'contact@enkirealty.ch',
        phone: '+41 21 456 78 90',
        vat_number: 'CHE-456.789.012 TVA'
      },
      'TAKEOUT': {
        name: 'TAKEOUT Sàrl',
        ide: 'CHE-567.890.123',
        street: 'Rue de Genève 25',
        postal_code: '1004',
        city: 'Lausanne',
        country: 'CH',
        qr_iban: 'CH4800700110007852345',
        email: 'contact@takeout.ch',
        phone: '+41 21 567 89 01',
        vat_number: 'CHE-567.890.123 TVA'
      }
    };

    return configs[companyName] || configs['HYPERVISUAL'];
  }

  /**
   * Récupérer données client depuis Directus
   * @param {Object} directus - Client Directus
   * @param {string} clientId - ID du client
   * @returns {Object} Données client formatées
   */
  async getClientData(directus, clientId) {
    try {
      const client = await directus.request(
        readItem('companies', clientId)
      );

      return {
        id: client.id,
        name: client.name || 'Client',
        street: client.address || client.street || '',
        postal_code: client.postal_code || client.zip || '',
        city: client.city || '',
        country: client.country || 'CH',
        email: client.email || '',
        ide: client.ide || '',
        phone: client.phone || ''
      };
    } catch (error) {
      console.warn(`Client ${clientId} non trouvé, utilisation des valeurs par défaut`);
      return {
        id: clientId,
        name: 'Client',
        street: '',
        postal_code: '',
        city: '',
        country: 'CH',
        email: '',
        ide: '',
        phone: ''
      };
    }
  }

  /**
   * Calculer date d'échéance
   * @param {number} days - Nombre de jours
   * @returns {string} Date ISO (YYYY-MM-DD)
   */
  calculateDueDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(days));
    return date.toISOString().split('T')[0];
  }

  /**
   * Générer données QR Swiss (format SPC)
   * Conforme à la norme ISO 20022 v2.3
   * @param {Object} data - Données pour le QR code
   * @returns {Object} Données QR formatées
   */
  generateSwissQRData(data) {
    // Format Swiss QR Code selon ISO 20022
    const qrContent = [
      'SPC',                              // Header (Swiss Payments Code)
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
      '',                                 // Ultimate Creditor - Name (empty)
      '',                                 // Ultimate Creditor - Street
      '',                                 // Ultimate Creditor - Building
      '',                                 // Ultimate Creditor - Postal
      '',                                 // Ultimate Creditor - City
      '',                                 // Ultimate Creditor - Country
      '',                                 // Reserved
      data.amount.toFixed(2),             // Amount
      data.currency,                      // Currency (CHF or EUR)
      'S',                                // Debtor Address Type (Structured)
      data.debtor.name,                   // Debtor Name
      data.debtor.street,                 // Debtor Street
      '',                                 // Debtor Building
      data.debtor.postal_code,            // Debtor Postal Code
      data.debtor.city,                   // Debtor City
      data.debtor.country,                // Debtor Country
      'QRR',                              // Reference Type (QR Reference)
      data.reference,                     // Reference (27 digits)
      '',                                 // Additional Info (Unstructured Message)
      'EPD',                              // Trailer (End Payment Data)
    ].join('\n');

    return {
      content: qrContent,
      reference: data.reference,
      iban: data.creditor.qr_iban,
      amount: data.amount,
      currency: data.currency,
      creditor: {
        name: data.creditor.name,
        address: `${data.creditor.street}, ${data.creditor.postal_code} ${data.creditor.city}`,
        country: data.creditor.country
      },
      debtor: {
        name: data.debtor.name,
        address: `${data.debtor.street}, ${data.debtor.postal_code} ${data.debtor.city}`,
        country: data.debtor.country
      }
    };
  }

  /**
   * Validation des données de facture
   * @param {Object} data - Données à valider
   * @throws {Error} Si validation échouée avec détails des erreurs
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
      errors.push(`owner_company invalide. Valeurs acceptées: ${validCompanies.join(', ')}`);
    }

    if (data.items) {
      data.items.forEach((item, i) => {
        if (!item.description) errors.push(`items[${i}].description requis`);
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          errors.push(`items[${i}].quantity requis (number > 0)`);
        }
        if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
          errors.push(`items[${i}].unit_price requis (number >= 0)`);
        }
        if (item.vat_rate !== undefined && typeof item.vat_rate !== 'number') {
          errors.push(`items[${i}].vat_rate doit être un number`);
        }
        if (item.discount !== undefined && (typeof item.discount !== 'number' || item.discount < 0 || item.discount > 100)) {
          errors.push(`items[${i}].discount doit être un number entre 0 et 100`);
        }
      });
    }

    if (data.currency && !['CHF', 'EUR'].includes(data.currency)) {
      errors.push('currency doit être CHF ou EUR');
    }

    if (data.payment_terms && (typeof data.payment_terms !== 'number' || data.payment_terms < 0)) {
      errors.push('payment_terms doit être un number >= 0');
    }

    if (errors.length > 0) {
      throw new Error(`Validation échouée: ${errors.join(', ')}`);
    }
  }

  /**
   * Mettre à jour le statut d'une facture
   * @param {string} invoiceId - ID de la facture
   * @param {string} status - Nouveau statut
   * @returns {Object} Résultat de la mise à jour
   */
  async updateStatus(invoiceId, status) {
    const directus = this.getDirectusClient();
    const validStatuses = ['draft', 'sent', 'pending', 'paid', 'partial', 'overdue', 'cancelled', 'disputed'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`);
    }

    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'paid') updates.paid_at = new Date().toISOString();

    const result = await directus.request(updateItem('client_invoices', invoiceId, updates));

    return {
      success: true,
      invoice: result,
      message: `Statut mis à jour: ${status}`
    };
  }

  /**
   * Marquer une facture comme payée
   * @param {string} invoiceId - ID de la facture
   * @param {Object} paymentData - Données de paiement optionnelles
   * @returns {Object} Résultat de l'opération
   */
  async markAsPaid(invoiceId, paymentData = {}) {
    const directus = this.getDirectusClient();

    // Récupérer la facture
    const invoice = await directus.request(readItem('client_invoices', invoiceId));

    if (invoice.status === 'paid') {
      throw new Error('Cette facture est déjà marquée comme payée');
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Impossible de payer une facture annulée');
    }

    // Mettre à jour le statut
    await this.updateStatus(invoiceId, 'paid');

    // Créer le paiement
    const payment = await directus.request(
      createItem('payments', {
        owner_company: invoice.owner_company,
        invoice_id: invoiceId,
        amount: paymentData.amount || invoice.amount,
        currency: invoice.currency || 'CHF',
        payment_date: paymentData.date || new Date().toISOString(),
        payment_method: paymentData.method || 'bank_transfer',
        reference: paymentData.reference || invoice.qr_reference,
        bank_transaction_id: paymentData.transaction_id || null,
        status: 'completed',
        notes: paymentData.notes || ''
      })
    );

    return {
      success: true,
      message: 'Facture marquée comme payée',
      payment
    };
  }

  /**
   * Enregistrer un paiement partiel
   * @param {string} invoiceId - ID de la facture
   * @param {Object} paymentData - Données du paiement partiel
   * @returns {Object} Résultat avec solde restant
   */
  async recordPartialPayment(invoiceId, paymentData) {
    const directus = this.getDirectusClient();

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Montant de paiement requis et doit être positif');
    }

    // Récupérer la facture
    const invoice = await directus.request(readItem('client_invoices', invoiceId));

    // Récupérer les paiements existants
    const existingPayments = await directus.request(
      readItems('payments', {
        filter: { invoice_id: { _eq: invoiceId }, status: { _eq: 'completed' } },
        fields: ['amount']
      })
    );

    const totalPaid = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const remaining = parseFloat(invoice.amount) - totalPaid;

    if (paymentData.amount > remaining + 0.01) { // Tolérance de 1 centime
      throw new Error(`Montant trop élevé. Reste à payer: ${remaining.toFixed(2)} ${invoice.currency}`);
    }

    // Créer le paiement partiel
    const payment = await directus.request(
      createItem('payments', {
        owner_company: invoice.owner_company,
        invoice_id: invoiceId,
        amount: paymentData.amount,
        currency: invoice.currency || 'CHF',
        payment_date: paymentData.date || new Date().toISOString(),
        payment_method: paymentData.method || 'bank_transfer',
        reference: paymentData.reference || '',
        bank_transaction_id: paymentData.transaction_id || null,
        status: 'completed',
        notes: paymentData.notes || 'Paiement partiel'
      })
    );

    // Vérifier si la facture est entièrement payée
    const newTotalPaid = totalPaid + paymentData.amount;
    const newRemaining = parseFloat(invoice.amount) - newTotalPaid;

    if (newRemaining <= 0.01) { // Tolérance de 1 centime
      await this.updateStatus(invoiceId, 'paid');
    } else {
      await this.updateStatus(invoiceId, 'partial');
    }

    return {
      success: true,
      payment,
      totalPaid: Math.round(newTotalPaid * 100) / 100,
      remaining: Math.max(0, Math.round(newRemaining * 100) / 100),
      isFullyPaid: newRemaining <= 0.01
    };
  }

  /**
   * Récupérer une facture avec ses données QR
   * @param {string} invoiceId - ID de la facture
   * @returns {Object} Facture complète avec données QR
   */
  async getInvoiceWithQR(invoiceId) {
    const directus = this.getDirectusClient();
    const invoice = await directus.request(readItem('client_invoices', invoiceId));

    const companyData = this.getCompanyConfig(invoice.owner_company);
    const clientData = await this.getClientData(directus, invoice.company_id);

    const qrData = this.generateSwissQRData({
      creditor: companyData,
      debtor: clientData,
      amount: parseFloat(invoice.amount),
      currency: invoice.currency || 'CHF',
      reference: invoice.qr_reference
    });

    // Parser les items si nécessaire
    const items = typeof invoice.items === 'string'
      ? JSON.parse(invoice.items)
      : invoice.items;

    return {
      invoice: {
        ...invoice,
        items
      },
      qrData,
      companyData,
      clientData
    };
  }

  /**
   * Lister les factures avec filtres
   * @param {Object} filters - Filtres de recherche
   * @returns {Object} Liste paginée des factures
   */
  async listInvoices(filters = {}) {
    const directus = this.getDirectusClient();

    const queryFilter = {};

    if (filters.owner_company) {
      queryFilter.owner_company = { _eq: filters.owner_company };
    }
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        queryFilter.status = { _in: filters.status };
      } else {
        queryFilter.status = { _eq: filters.status };
      }
    }
    if (filters.client_id) {
      queryFilter.company_id = { _eq: filters.client_id };
    }
    if (filters.from_date) {
      queryFilter.date = { _gte: filters.from_date };
    }
    if (filters.to_date) {
      queryFilter.date = { ...queryFilter.date, _lte: filters.to_date };
    }
    if (filters.min_amount) {
      queryFilter.amount = { _gte: filters.min_amount };
    }
    if (filters.max_amount) {
      queryFilter.amount = { ...queryFilter.amount, _lte: filters.max_amount };
    }

    const invoices = await directus.request(
      readItems('client_invoices', {
        filter: queryFilter,
        sort: filters.sort || ['-date'],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        fields: ['*']
      })
    );

    return {
      data: invoices,
      count: invoices.length,
      filters: filters
    };
  }

  /**
   * Dupliquer une facture
   * @param {string} invoiceId - ID de la facture à dupliquer
   * @param {Object} overrides - Champs à modifier dans la nouvelle facture
   * @returns {Object} Nouvelle facture créée
   */
  async duplicateInvoice(invoiceId, overrides = {}) {
    const { invoice } = await this.getInvoiceWithQR(invoiceId);

    const newInvoiceData = {
      owner_company: invoice.owner_company,
      client_id: invoice.company_id,
      items: invoice.items,
      currency: invoice.currency,
      payment_terms: invoice.payment_terms,
      notes: invoice.notes,
      ...overrides
    };

    return this.createInvoice(newInvoiceData);
  }

  /**
   * Annuler une facture
   * @param {string} invoiceId - ID de la facture
   * @param {string} reason - Raison de l'annulation
   * @returns {Object} Résultat de l'annulation
   */
  async cancelInvoice(invoiceId, reason = '') {
    const directus = this.getDirectusClient();
    const invoice = await directus.request(readItem('client_invoices', invoiceId));

    if (invoice.status === 'paid') {
      throw new Error('Impossible d\'annuler une facture payée. Créez un avoir à la place.');
    }

    await directus.request(
      updateItem('client_invoices', invoiceId, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
    );

    return {
      success: true,
      message: `Facture ${invoice.invoice_number} annulée`,
      reason
    };
  }

  /**
   * Créer un avoir (note de crédit)
   * @param {string} invoiceId - ID de la facture originale
   * @param {Object} creditData - Données de l'avoir
   * @returns {Object} Avoir créé
   */
  async createCreditNote(invoiceId, creditData = {}) {
    const directus = this.getDirectusClient();
    const originalInvoice = await directus.request(readItem('client_invoices', invoiceId));

    const items = creditData.items || JSON.parse(originalInvoice.items);

    // Inverser les montants pour l'avoir
    const creditItems = items.map(item => ({
      ...item,
      quantity: -Math.abs(item.quantity),
      description: `[AVOIR] ${item.description}`
    }));

    const creditNote = await this.createInvoice({
      owner_company: originalInvoice.owner_company,
      client_id: originalInvoice.company_id,
      items: creditItems,
      currency: originalInvoice.currency,
      notes: `Avoir pour facture ${originalInvoice.invoice_number}. ${creditData.reason || ''}`
    });

    // Lier l'avoir à la facture originale
    await directus.request(
      updateItem('client_invoices', creditNote.invoice.id, {
        is_credit_note: true,
        original_invoice_id: invoiceId
      })
    );

    return {
      ...creditNote,
      originalInvoice: originalInvoice.invoice_number
    };
  }

  /**
   * Vérifier les factures en retard et les marquer
   * @param {string} ownerCompany - Entreprise (optionnel)
   * @returns {Object} Liste des factures marquées en retard
   */
  async checkOverdueInvoices(ownerCompany = null) {
    const directus = this.getDirectusClient();
    const today = new Date().toISOString().split('T')[0];

    const filter = {
      status: { _in: ['sent', 'pending', 'partial'] },
      due_date: { _lt: today }
    };

    if (ownerCompany) {
      filter.owner_company = { _eq: ownerCompany };
    }

    const overdueInvoices = await directus.request(
      readItems('client_invoices', {
        filter,
        fields: ['id', 'invoice_number', 'due_date', 'amount', 'status', 'owner_company']
      })
    );

    // Marquer les factures en retard
    const updated = [];
    for (const invoice of overdueInvoices) {
      await directus.request(
        updateItem('client_invoices', invoice.id, {
          status: 'overdue',
          updated_at: new Date().toISOString()
        })
      );
      updated.push({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        due_date: invoice.due_date,
        amount: invoice.amount
      });
    }

    return {
      count: updated.length,
      invoices: updated,
      message: `${updated.length} facture(s) marquée(s) en retard`
    };
  }

  /**
   * Calculer les intérêts de retard (art. 104 CO - 5%)
   * @param {string} invoiceId - ID de la facture
   * @returns {Object} Détail des intérêts de retard
   */
  async calculateLateInterest(invoiceId) {
    const directus = this.getDirectusClient();
    const invoice = await directus.request(readItem('client_invoices', invoiceId));

    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const daysLate = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));

    if (daysLate === 0) {
      return {
        invoiceId,
        daysLate: 0,
        interest: 0,
        message: 'Facture pas encore en retard'
      };
    }

    // Intérêts = Montant * Taux * (Jours / 365)
    const interest = parseFloat(invoice.amount) * (this.INTEREST_RATE / 100) * (daysLate / 365);

    return {
      invoiceId,
      invoiceNumber: invoice.invoice_number,
      amount: parseFloat(invoice.amount),
      dueDate: invoice.due_date,
      daysLate,
      interestRate: this.INTEREST_RATE,
      interest: Math.round(interest * 100) / 100,
      totalDue: Math.round((parseFloat(invoice.amount) + interest) * 100) / 100,
      currency: invoice.currency || 'CHF'
    };
  }

  /**
   * Obtenir les statistiques de facturation
   * @param {string} ownerCompany - Entreprise
   * @param {Object} period - Période {from, to}
   * @returns {Object} Statistiques complètes
   */
  async getInvoiceStats(ownerCompany, period = {}) {
    const directus = this.getDirectusClient();

    const filter = { owner_company: { _eq: ownerCompany } };

    if (period.from) filter.date = { _gte: period.from };
    if (period.to) filter.date = { ...filter.date, _lte: period.to };

    const invoices = await directus.request(
      readItems('client_invoices', {
        filter,
        fields: ['amount', 'amount_ht', 'amount_tva', 'status', 'currency', 'date']
      })
    );

    const stats = {
      total: invoices.length,
      totalAmount: 0,
      totalHT: 0,
      totalTVA: 0,
      byStatus: {},
      byCurrency: {},
      averageAmount: 0
    };

    for (const inv of invoices) {
      const amount = parseFloat(inv.amount) || 0;
      stats.totalAmount += amount;
      stats.totalHT += parseFloat(inv.amount_ht) || 0;
      stats.totalTVA += parseFloat(inv.amount_tva) || 0;

      stats.byStatus[inv.status] = (stats.byStatus[inv.status] || 0) + 1;
      stats.byCurrency[inv.currency] = (stats.byCurrency[inv.currency] || 0) + amount;
    }

    // Arrondir les montants
    stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
    stats.totalHT = Math.round(stats.totalHT * 100) / 100;
    stats.totalTVA = Math.round(stats.totalTVA * 100) / 100;
    stats.averageAmount = stats.total > 0 ? Math.round((stats.totalAmount / stats.total) * 100) / 100 : 0;

    return stats;
  }

  /**
   * Rechercher des factures par texte
   * @param {string} query - Terme de recherche
   * @param {Object} options - Options de recherche
   * @returns {Object} Résultats de recherche
   */
  async searchInvoices(query, options = {}) {
    const directus = this.getDirectusClient();

    const filter = {
      _or: [
        { invoice_number: { _contains: query } },
        { client_name: { _contains: query } },
        { notes: { _contains: query } }
      ]
    };

    if (options.owner_company) {
      filter.owner_company = { _eq: options.owner_company };
    }

    const invoices = await directus.request(
      readItems('client_invoices', {
        filter,
        sort: options.sort || ['-date'],
        limit: options.limit || 20,
        fields: ['*']
      })
    );

    return {
      query,
      count: invoices.length,
      data: invoices
    };
  }

  /**
   * Exporter les factures au format JSON
   * @param {Object} filters - Filtres d'export
   * @returns {Object} Données d'export
   */
  async exportInvoices(filters = {}) {
    const { data: invoices } = await this.listInvoices({ ...filters, limit: 10000 });

    const exportData = {
      exportDate: new Date().toISOString(),
      filters,
      count: invoices.length,
      invoices: invoices.map(inv => ({
        ...inv,
        items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items
      }))
    };

    return exportData;
  }
}

// Export singleton et classe
export const unifiedInvoiceService = new UnifiedInvoiceService();
export default UnifiedInvoiceService;
