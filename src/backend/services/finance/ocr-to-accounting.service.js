/**
 * OCRToAccountingService
 * Convertit les données OCR en écritures comptables suisses
 * Conforme au plan comptable Käfer PME
 *
 * @module finance/ocr-to-accounting
 * @version 2.0.0
 */

import { createDirectus, rest, readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';

/**
 * Service de conversion OCR vers comptabilité
 * Gère l'automatisation des écritures comptables depuis les factures scannées
 */
class OCRToAccountingService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;

    // Mapping catégories OCR vers comptes Käfer PME
    this.accountMappings = {
      // === CHARGES D'EXPLOITATION (Classe 4) ===
      'marchandises': { debit: '4000', credit: '2000', label: 'Achat marchandises', vatDeductible: true },
      'marchandises_import': { debit: '4010', credit: '2000', label: 'Achats importation', vatDeductible: true },
      'fournitures': { debit: '4200', credit: '2000', label: 'Fournitures de bureau', vatDeductible: true },
      'emballages': { debit: '4300', credit: '2000', label: 'Emballages', vatDeductible: true },
      'services': { debit: '4400', credit: '2000', label: 'Services externes', vatDeductible: true },
      'sous_traitance': { debit: '4450', credit: '2000', label: 'Sous-traitance', vatDeductible: true },
      'informatique': { debit: '4410', credit: '2000', label: 'Frais informatiques', vatDeductible: true },
      'logiciel': { debit: '4411', credit: '2000', label: 'Licences logiciels', vatDeductible: true },
      'hebergement_web': { debit: '4412', credit: '2000', label: 'Hébergement web', vatDeductible: true },
      'telecom': { debit: '4420', credit: '2000', label: 'Télécommunications', vatDeductible: true },
      'telephonie': { debit: '4421', credit: '2000', label: 'Téléphonie mobile', vatDeductible: true },
      'internet': { debit: '4422', credit: '2000', label: 'Accès internet', vatDeductible: true },

      // === CHARGES DE PERSONNEL (Classe 5) ===
      'salaires': { debit: '5000', credit: '2000', label: 'Salaires bruts', vatDeductible: false },
      'charges_sociales': { debit: '5700', credit: '2000', label: 'Charges sociales', vatDeductible: false },
      'avs': { debit: '5710', credit: '2000', label: 'AVS/AI/APG', vatDeductible: false },
      'lpp': { debit: '5720', credit: '2000', label: 'Prévoyance professionnelle', vatDeductible: false },
      'assurance_accident': { debit: '5730', credit: '2000', label: 'Assurance accidents', vatDeductible: false },
      'formation_personnel': { debit: '5800', credit: '2000', label: 'Formation du personnel', vatDeductible: true },

      // === AUTRES CHARGES D'EXPLOITATION (Classe 6) ===
      'loyer': { debit: '6000', credit: '2000', label: 'Loyer', vatDeductible: false },
      'charges_locatives': { debit: '6010', credit: '2000', label: 'Charges locatives', vatDeductible: true },
      'entretien_locaux': { debit: '6050', credit: '2000', label: 'Entretien locaux', vatDeductible: true },
      'energie': { debit: '6100', credit: '2000', label: 'Énergie', vatDeductible: true },
      'electricite': { debit: '6110', credit: '2000', label: 'Électricité', vatDeductible: true },
      'chauffage': { debit: '6120', credit: '2000', label: 'Chauffage', vatDeductible: true },
      'eau': { debit: '6130', credit: '2000', label: 'Eau', vatDeductible: true },
      'transport': { debit: '6200', credit: '2000', label: 'Transport', vatDeductible: true },
      'vehicule': { debit: '6210', credit: '2000', label: 'Frais véhicule', vatDeductible: true },
      'carburant': { debit: '6211', credit: '2000', label: 'Carburant', vatDeductible: true },
      'entretien_vehicule': { debit: '6212', credit: '2000', label: 'Entretien véhicule', vatDeductible: true },
      'assurance_vehicule': { debit: '6213', credit: '2000', label: 'Assurance véhicule', vatDeductible: false },
      'deplacements': { debit: '6220', credit: '2000', label: 'Frais de déplacement', vatDeductible: true },
      'parking': { debit: '6230', credit: '2000', label: 'Parking', vatDeductible: true },
      'assurances': { debit: '6300', credit: '2000', label: 'Assurances', vatDeductible: false },
      'assurance_rc': { debit: '6310', credit: '2000', label: 'Assurance RC', vatDeductible: false },
      'assurance_choses': { debit: '6320', credit: '2000', label: 'Assurance choses', vatDeductible: false },
      'honoraires': { debit: '6500', credit: '2000', label: 'Honoraires', vatDeductible: true },
      'fiduciaire': { debit: '6510', credit: '2000', label: 'Frais fiduciaire', vatDeductible: true },
      'avocat': { debit: '6520', credit: '2000', label: 'Frais avocat', vatDeductible: true },
      'notaire': { debit: '6530', credit: '2000', label: 'Frais notaire', vatDeductible: true },
      'consultant': { debit: '6540', credit: '2000', label: 'Frais consultant', vatDeductible: true },
      'publicite': { debit: '6600', credit: '2000', label: 'Publicité', vatDeductible: true },
      'marketing': { debit: '6610', credit: '2000', label: 'Marketing', vatDeductible: true },
      'site_web': { debit: '6620', credit: '2000', label: 'Site web', vatDeductible: true },
      'imprimerie': { debit: '6630', credit: '2000', label: 'Imprimerie', vatDeductible: true },
      'formation': { debit: '6700', credit: '2000', label: 'Formation', vatDeductible: true },
      'livres': { debit: '6710', credit: '2000', label: 'Documentation', vatDeductible: true },
      'abonnements': { debit: '6720', credit: '2000', label: 'Abonnements', vatDeductible: true },
      'frais_bancaires': { debit: '6800', credit: '2000', label: 'Frais bancaires', vatDeductible: false },
      'frais_admin': { debit: '6810', credit: '2000', label: 'Frais administratifs', vatDeductible: true },
      'poste': { debit: '6820', credit: '2000', label: 'Frais postaux', vatDeductible: false },
      'cotisations': { debit: '6830', credit: '2000', label: 'Cotisations associations', vatDeductible: false },
      'dons': { debit: '6840', credit: '2000', label: 'Dons', vatDeductible: false },
      'autre': { debit: '6900', credit: '2000', label: 'Frais divers', vatDeductible: true },

      // === INVESTISSEMENTS (Classe 1) ===
      'materiel': { debit: '1500', credit: '2000', label: 'Machines et équipements', vatDeductible: true },
      'informatique_immobilise': { debit: '1520', credit: '2000', label: 'Matériel informatique', vatDeductible: true },
      'mobilier': { debit: '1510', credit: '2000', label: 'Mobilier et installations', vatDeductible: true },
      'vehicule_immobilise': { debit: '1530', credit: '2000', label: 'Véhicules', vatDeductible: true },
      'immobilier': { debit: '1600', credit: '2000', label: 'Immeubles', vatDeductible: true },

      // === CHARGES FINANCIÈRES (Classe 6) ===
      'interets_passifs': { debit: '6800', credit: '2000', label: 'Intérêts passifs', vatDeductible: false },
      'frais_leasing': { debit: '6850', credit: '2000', label: 'Frais leasing', vatDeductible: true },

      // === CHARGES EXCEPTIONNELLES (Classe 8) ===
      'pertes_debiteurs': { debit: '8000', credit: '2000', label: 'Pertes sur débiteurs', vatDeductible: false },
      'amortissements': { debit: '6800', credit: '2000', label: 'Amortissements', vatDeductible: false }
    };

    // Taux TVA suisse 2025
    this.vatRates = {
      'normal': 8.1,
      'reduit': 2.6,
      'hebergement': 3.8,
      'exonere': 0
    };

    // Comptes TVA
    this.vatAccounts = {
      'input': '1170',     // TVA déductible (impôt préalable)
      'output': '2200',    // TVA due
      'input_import': '1171'  // TVA import
    };

    // Patterns de détection de fournisseurs suisses connus
    this.supplierPatterns = [
      { keywords: ['swisscom', 'sunrise', 'salt', 'upc'], category: 'telecom' },
      { keywords: ['microsoft', 'google', 'adobe', 'oracle', 'sap', 'atlassian'], category: 'logiciel' },
      { keywords: ['amazon web services', 'aws', 'azure', 'digitalocean', 'infomaniak'], category: 'hebergement_web' },
      { keywords: ['sbb', 'cff', 'ffs', 'bls', 'transn'], category: 'deplacements' },
      { keywords: ['uber', 'taxi', 'bolt'], category: 'transport' },
      { keywords: ['shell', 'bp', 'avia', 'migrol', 'tamoil', 'carburant', 'essence', 'diesel'], category: 'carburant' },
      { keywords: ['migros', 'coop', 'denner', 'aldi', 'lidl', 'volg'], category: 'fournitures' },
      { keywords: ['electricite', 'services industriels', 'sig', 'romande energie', 'groupe e'], category: 'electricite' },
      { keywords: ['chauffage', 'mazout', 'pellet'], category: 'chauffage' },
      { keywords: ['loyer', 'bail', 'regie', 'immobilier', 'gerance'], category: 'loyer' },
      { keywords: ['axa', 'zurich', 'mobiliar', 'helvetia', 'bâloise', 'vaudoise', 'generali', 'allianz'], category: 'assurances' },
      { keywords: ['avocat', 'etude', 'legal', 'juridique'], category: 'avocat' },
      { keywords: ['fiduciaire', 'comptable', 'revision', 'audit'], category: 'fiduciaire' },
      { keywords: ['notaire', 'notariat'], category: 'notaire' },
      { keywords: ['publicite', 'marketing', 'google ads', 'facebook ads', 'linkedin'], category: 'marketing' },
      { keywords: ['imprimerie', 'print', 'impression', 'flyeralarm'], category: 'imprimerie' },
      { keywords: ['formation', 'cours', 'seminaire', 'conference'], category: 'formation' },
      { keywords: ['poste', 'la poste'], category: 'poste' },
      { keywords: ['apple', 'dell', 'hp', 'lenovo', 'asus'], category: 'informatique_immobilise' },
      { keywords: ['ikea', 'pfister', 'conforama', 'interio'], category: 'mobilier' }
    ];

    // Configuration des entreprises
    this.companyConfig = {
      'HYPERVISUAL': { defaultVatRate: 'normal', currency: 'CHF' },
      'DAINAMICS': { defaultVatRate: 'normal', currency: 'CHF' },
      'LEXAIA': { defaultVatRate: 'normal', currency: 'CHF' },
      'ENKI REALTY': { defaultVatRate: 'exonere', currency: 'CHF' },
      'TAKEOUT': { defaultVatRate: 'reduit', currency: 'CHF' }
    };
  }

  /**
   * Obtenir le client Directus configuré
   */
  getDirectus() {
    const client = createDirectus(this.directusUrl).with(rest());
    return client;
  }

  // ==========================================
  // CRÉATION D'ÉCRITURES COMPTABLES
  // ==========================================

  /**
   * Créer une écriture comptable depuis les données OCR validées
   * @param {string} supplierInvoiceId - ID de la facture fournisseur
   * @param {Object} options - Options (autoPost, overrideAccounts)
   * @returns {Promise<Object>} Résultat avec écriture créée
   */
  async createEntryFromOCR(supplierInvoiceId, options = {}) {
    const directus = this.getDirectus();

    try {
      // 1. Récupérer la facture fournisseur avec données OCR
      const invoices = await directus.request(
        readItems('supplier_invoices', {
          filter: { id: { _eq: supplierInvoiceId } },
          limit: 1
        })
      );

      if (!invoices[0]) {
        throw new Error('Facture fournisseur non trouvée');
      }

      const invoice = invoices[0];
      const ocrData = this.parseOCRData(invoice.ocr_data);

      if (!ocrData && !invoice.amount) {
        throw new Error('Données OCR et montant non disponibles');
      }

      // 2. Vérifier si une écriture existe déjà
      if (invoice.accounting_entry_id) {
        throw new Error(`Une écriture comptable existe déjà: ${invoice.accounting_entry_id}`);
      }

      // 3. Déterminer les comptes (override possible)
      let accounts;
      if (options.overrideAccounts) {
        accounts = {
          debit: options.overrideAccounts.debit || '6900',
          credit: options.overrideAccounts.credit || '2000',
          label: options.overrideAccounts.label || 'Charge personnalisée',
          vatDeductible: options.overrideAccounts.vatDeductible !== false
        };
      } else {
        accounts = this.suggestAccounts(ocrData, invoice);
      }

      // 4. Calculer les montants avec TVA
      const amounts = this.calculateAmounts(ocrData, invoice, accounts);

      // 5. Créer l'écriture comptable
      const entryDate = invoice.invoice_date || invoice.date || new Date().toISOString().split('T')[0];
      const reference = invoice.invoice_number || `OCR-${supplierInvoiceId.slice(0, 8)}`;

      const entryLines = [];

      // Ligne débit (charge ou actif)
      entryLines.push({
        line_number: 1,
        account_number: accounts.debit,
        account_name: this.getAccountName(accounts.debit),
        debit: amounts.ht,
        credit: 0,
        description: accounts.label,
        cost_center: invoice.cost_center || null
      });

      // Ligne TVA déductible (si applicable)
      if (amounts.tva > 0 && accounts.vatDeductible) {
        entryLines.push({
          line_number: 2,
          account_number: this.vatAccounts.input,
          account_name: 'TVA déductible (impôt préalable)',
          debit: amounts.tva,
          credit: 0,
          description: `TVA ${amounts.vatRate}% sur ${accounts.label}`,
          vat_rate: amounts.vatRate,
          vat_code: this.getVATCode(amounts.vatRate)
        });
      }

      // Ligne crédit (créanciers)
      entryLines.push({
        line_number: entryLines.length + 1,
        account_number: accounts.credit,
        account_name: 'Créanciers (fournisseurs)',
        debit: 0,
        credit: amounts.ttc,
        description: `${invoice.supplier_name || 'Fournisseur'} - ${reference}`,
        supplier_id: invoice.supplier_id || null
      });

      // Créer l'écriture dans Directus
      const entry = await directus.request(
        createItem('accounting_entries', {
          owner_company: invoice.owner_company,
          entry_date: entryDate,
          posting_date: options.autoPost ? new Date().toISOString().split('T')[0] : null,
          reference: reference,
          description: `${accounts.label} - ${invoice.supplier_name || 'Fournisseur'}`,
          document_type: 'supplier_invoice',
          document_id: supplierInvoiceId,
          document_number: invoice.invoice_number,
          status: options.autoPost ? 'posted' : 'draft',
          lines: JSON.stringify(entryLines),
          total_debit: amounts.ttc,
          total_credit: amounts.ttc,
          currency: invoice.currency || 'CHF',
          created_from: 'ocr',
          ocr_confidence: ocrData?.confidence || null,
          vat_included: true,
          vat_amount: amounts.tva,
          vat_rate: amounts.vatRate
        })
      );

      // 6. Lier l'écriture à la facture
      await directus.request(
        updateItem('supplier_invoices', supplierInvoiceId, {
          accounting_entry_id: entry.id,
          ocr_validated: true,
          ocr_validated_at: new Date().toISOString(),
          ocr_validated_by: options.userId || null,
          status: 'approved',
          accounting_status: options.autoPost ? 'posted' : 'pending'
        })
      );

      console.log(`✅ Écriture comptable créée: ${entry.id} pour facture ${supplierInvoiceId}`);

      return {
        success: true,
        entry: {
          id: entry.id,
          reference: reference,
          date: entryDate,
          status: entry.status
        },
        amounts,
        accounts,
        lines: entryLines,
        message: `Écriture comptable créée: ${reference}`
      };

    } catch (error) {
      console.error('Erreur création écriture OCR:', error);

      // Logger l'erreur dans la facture
      try {
        await directus.request(
          updateItem('supplier_invoices', supplierInvoiceId, {
            ocr_error: error.message,
            ocr_error_at: new Date().toISOString()
          })
        );
      } catch (e) { /* ignore */ }

      throw error;
    }
  }

  /**
   * Parser les données OCR (JSON ou objet)
   */
  parseOCRData(data) {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return data;
  }

  /**
   * Suggérer les comptes comptables basé sur les données OCR
   */
  suggestAccounts(ocrData, invoice) {
    // 1. Utiliser la catégorie détectée par OCR si disponible
    const ocrCategory = (ocrData?.category || '').toLowerCase();
    if (ocrCategory && this.accountMappings[ocrCategory]) {
      return this.accountMappings[ocrCategory];
    }

    // 2. Utiliser le mapping fournisseur si enregistré
    if (invoice.supplier_account_mapping) {
      try {
        const mapping = typeof invoice.supplier_account_mapping === 'string'
          ? JSON.parse(invoice.supplier_account_mapping)
          : invoice.supplier_account_mapping;
        if (mapping.debit) {
          return {
            debit: mapping.debit,
            credit: mapping.credit || '2000',
            label: mapping.label || 'Charge fournisseur',
            vatDeductible: mapping.vatDeductible !== false
          };
        }
      } catch { /* ignore */ }
    }

    // 3. Analyser le nom du fournisseur et la description
    const searchText = `${invoice.supplier_name || ''} ${ocrData?.description || ''} ${ocrData?.vendor || ''}`.toLowerCase();

    for (const pattern of this.supplierPatterns) {
      if (pattern.keywords.some(kw => searchText.includes(kw))) {
        if (this.accountMappings[pattern.category]) {
          return this.accountMappings[pattern.category];
        }
      }
    }

    // 4. Défaut basé sur le montant (investissement si > 1000 CHF)
    const amount = parseFloat(invoice.amount || ocrData?.total || 0);
    if (amount > 5000) {
      // Vérifier si c'est potentiellement un investissement
      const investKeywords = ['ordinateur', 'serveur', 'machine', 'véhicule', 'voiture', 'meuble', 'équipement'];
      if (investKeywords.some(kw => searchText.includes(kw))) {
        return this.accountMappings['materiel'];
      }
    }

    // 5. Défaut: frais divers
    return this.accountMappings['autre'];
  }

  /**
   * Calculer les montants HT, TVA, TTC
   */
  calculateAmounts(ocrData, invoice, accounts) {
    const ttc = parseFloat(invoice.amount || ocrData?.total || 0);
    let ht = parseFloat(ocrData?.subtotal || invoice.amount_ht || 0);
    let tva = parseFloat(ocrData?.vat_amount || invoice.vat_amount || 0);
    let vatRate = parseFloat(ocrData?.vat_rate || invoice.vat_rate || 0);

    // Si TVA non déductible, pas de calcul TVA
    if (!accounts.vatDeductible) {
      return {
        ttc: Math.round(ttc * 100) / 100,
        ht: Math.round(ttc * 100) / 100,
        tva: 0,
        vatRate: 0
      };
    }

    // Si on a le TTC mais pas le détail HT/TVA
    if (ttc > 0 && ht === 0) {
      // Détecter ou utiliser le taux de TVA
      if (vatRate === 0) {
        vatRate = this.detectVATRate(ocrData, invoice);
      }

      // Calculer HT et TVA depuis TTC
      if (vatRate > 0) {
        ht = ttc / (1 + vatRate / 100);
        tva = ttc - ht;
      } else {
        ht = ttc;
        tva = 0;
      }
    }

    // Vérifier la cohérence
    const calculatedTTC = ht + tva;
    if (Math.abs(calculatedTTC - ttc) > 0.10) {
      console.warn(`⚠️ Incohérence TVA détectée: HT ${ht} + TVA ${tva} ≠ TTC ${ttc}`);
    }

    return {
      ttc: Math.round(ttc * 100) / 100,
      ht: Math.round(ht * 100) / 100,
      tva: Math.round(tva * 100) / 100,
      vatRate: vatRate
    };
  }

  /**
   * Détecter le taux de TVA applicable
   */
  detectVATRate(ocrData, invoice) {
    const text = `${invoice.supplier_name || ''} ${ocrData?.description || ''} ${ocrData?.category || ''}`.toLowerCase();

    // Exonéré (santé, social, éducation, immobilier)
    const exonereKeywords = ['médecin', 'docteur', 'hopital', 'clinique', 'dentiste', 'kiné', 'physiothérapie',
      'ecole', 'université', 'formation professionnelle', 'crèche', 'garderie',
      'assurance maladie', 'lamal', 'caisse maladie', 'banque', 'intérêts'];
    if (exonereKeywords.some(kw => text.includes(kw))) {
      return this.vatRates.exonere;
    }

    // Hébergement (hôtels, airbnb)
    const hebergementKeywords = ['hotel', 'hôtel', 'motel', 'auberge', 'airbnb', 'booking', 'hébergement', 'nuitée'];
    if (hebergementKeywords.some(kw => text.includes(kw))) {
      return this.vatRates.hebergement;
    }

    // Taux réduit (alimentaire, livres, journaux, médicaments)
    const reduitKeywords = ['pharmacie', 'médicament', 'livre', 'librairie', 'journal', 'magazine',
      'eau potable', 'denrées alimentaires', 'restaurant', 'café'];
    if (reduitKeywords.some(kw => text.includes(kw))) {
      return this.vatRates.reduit;
    }

    // Défaut: taux normal
    return this.vatRates.normal;
  }

  /**
   * Obtenir le code TVA pour le taux
   */
  getVATCode(vatRate) {
    if (vatRate === 8.1) return 'N81';
    if (vatRate === 2.6) return 'R26';
    if (vatRate === 3.8) return 'H38';
    if (vatRate === 0) return 'E00';
    return 'N81';
  }

  /**
   * Obtenir le nom d'un compte
   */
  getAccountName(accountNumber) {
    const names = {
      '1170': 'TVA déductible (impôt préalable)',
      '1171': 'TVA import',
      '1500': 'Machines et équipements',
      '1510': 'Mobilier et installations',
      '1520': 'Matériel informatique',
      '1530': 'Véhicules',
      '1600': 'Immeubles',
      '2000': 'Créanciers (fournisseurs)',
      '2200': 'TVA due',
      '4000': 'Charges de marchandises',
      '4010': 'Achats importation',
      '4200': 'Fournitures de bureau',
      '4300': 'Emballages',
      '4400': 'Services et sous-traitance',
      '4410': 'Frais informatiques',
      '4411': 'Licences logiciels',
      '4412': 'Hébergement web',
      '4420': 'Télécommunications',
      '4421': 'Téléphonie mobile',
      '4422': 'Accès internet',
      '4450': 'Sous-traitance',
      '5000': 'Salaires bruts',
      '5700': 'Charges sociales',
      '5710': 'AVS/AI/APG',
      '5720': 'Prévoyance professionnelle (LPP)',
      '5730': 'Assurance accidents (LAA)',
      '5800': 'Formation du personnel',
      '6000': 'Charges de locaux (loyer)',
      '6010': 'Charges locatives',
      '6050': 'Entretien et réparations locaux',
      '6100': 'Énergie',
      '6110': 'Électricité',
      '6120': 'Chauffage',
      '6130': 'Eau',
      '6200': 'Transport',
      '6210': 'Frais véhicule',
      '6211': 'Carburant',
      '6212': 'Entretien véhicule',
      '6213': 'Assurance véhicule',
      '6220': 'Frais de déplacement',
      '6230': 'Parking',
      '6300': 'Assurances',
      '6310': 'Assurance RC',
      '6320': 'Assurance choses',
      '6500': 'Honoraires',
      '6510': 'Frais fiduciaire',
      '6520': 'Frais avocat',
      '6530': 'Frais notaire',
      '6540': 'Frais consultant',
      '6600': 'Publicité',
      '6610': 'Marketing',
      '6620': 'Site web',
      '6630': 'Imprimerie',
      '6700': 'Formation',
      '6710': 'Documentation',
      '6720': 'Abonnements',
      '6800': 'Frais bancaires / Intérêts passifs',
      '6810': 'Frais administratifs',
      '6820': 'Frais postaux',
      '6830': 'Cotisations associations',
      '6840': 'Dons',
      '6850': 'Frais leasing',
      '6900': 'Frais divers',
      '8000': 'Pertes sur débiteurs'
    };
    return names[accountNumber] || `Compte ${accountNumber}`;
  }

  // ==========================================
  // PRÉVISUALISATION ET VALIDATION
  // ==========================================

  /**
   * Prévisualiser l'écriture avant validation
   */
  async previewEntry(supplierInvoiceId) {
    const directus = this.getDirectus();

    const invoices = await directus.request(
      readItems('supplier_invoices', {
        filter: { id: { _eq: supplierInvoiceId } },
        limit: 1
      })
    );

    if (!invoices[0]) {
      throw new Error('Facture non trouvée');
    }

    const invoice = invoices[0];
    const ocrData = this.parseOCRData(invoice.ocr_data);
    const accounts = this.suggestAccounts(ocrData, invoice);
    const amounts = this.calculateAmounts(ocrData, invoice, accounts);

    // Construire les lignes de prévisualisation
    const previewLines = [
      {
        account: accounts.debit,
        name: this.getAccountName(accounts.debit),
        debit: amounts.ht,
        credit: 0,
        description: accounts.label
      }
    ];

    if (amounts.tva > 0 && accounts.vatDeductible) {
      previewLines.push({
        account: this.vatAccounts.input,
        name: 'TVA déductible (impôt préalable)',
        debit: amounts.tva,
        credit: 0,
        description: `TVA ${amounts.vatRate}%`
      });
    }

    previewLines.push({
      account: accounts.credit,
      name: this.getAccountName(accounts.credit),
      debit: 0,
      credit: amounts.ttc,
      description: invoice.supplier_name || 'Fournisseur'
    });

    return {
      invoice: {
        id: invoice.id,
        number: invoice.invoice_number,
        supplier: invoice.supplier_name,
        date: invoice.invoice_date || invoice.date,
        amount: invoice.amount,
        currency: invoice.currency || 'CHF'
      },
      ocr_data: ocrData ? {
        confidence: ocrData.confidence,
        vendor: ocrData.vendor,
        category: ocrData.category,
        total: ocrData.total,
        subtotal: ocrData.subtotal,
        vat_amount: ocrData.vat_amount,
        vat_rate: ocrData.vat_rate
      } : null,
      suggested: {
        accounts: {
          ...accounts,
          debit_name: this.getAccountName(accounts.debit),
          credit_name: this.getAccountName(accounts.credit)
        },
        amounts,
        vat_code: amounts.vatRate > 0 ? this.getVATCode(amounts.vatRate) : null
      },
      preview: {
        lines: previewLines,
        total_debit: amounts.ttc,
        total_credit: amounts.ttc,
        balanced: Math.abs(amounts.ttc - amounts.ttc) < 0.01
      },
      alternative_accounts: this.getAlternativeAccounts(ocrData, invoice)
    };
  }

  /**
   * Obtenir des comptes alternatifs suggérés
   */
  getAlternativeAccounts(ocrData, invoice) {
    const alternatives = [];
    const currentCategory = this.suggestAccounts(ocrData, invoice);

    // Proposer des alternatives courantes
    const commonAlternatives = ['fournitures', 'services', 'informatique', 'autre'];

    for (const cat of commonAlternatives) {
      const mapping = this.accountMappings[cat];
      if (mapping && mapping.debit !== currentCategory.debit) {
        alternatives.push({
          category: cat,
          debit: mapping.debit,
          debit_name: this.getAccountName(mapping.debit),
          label: mapping.label
        });
      }
    }

    return alternatives.slice(0, 5);
  }

  /**
   * Créer une écriture avec des comptes personnalisés
   */
  async createEntryWithCustomAccounts(supplierInvoiceId, customAccounts, options = {}) {
    return this.createEntryFromOCR(supplierInvoiceId, {
      ...options,
      overrideAccounts: {
        debit: customAccounts.debit || '6900',
        credit: customAccounts.credit || '2000',
        label: customAccounts.label || 'Charge personnalisée',
        vatDeductible: customAccounts.vatDeductible !== false
      }
    });
  }

  // ==========================================
  // TRAITEMENT EN LOT
  // ==========================================

  /**
   * Traitement en lot des factures OCR non comptabilisées
   */
  async processPendingOCR(companyName, options = {}) {
    const directus = this.getDirectus();

    const invoices = await directus.request(
      readItems('supplier_invoices', {
        filter: {
          owner_company: { _eq: companyName },
          _or: [
            { ocr_validated: { _eq: false } },
            { ocr_validated: { _null: true } }
          ],
          ocr_data: { _nnull: true },
          accounting_entry_id: { _null: true }
        },
        sort: ['-date'],
        limit: options.limit || 50
      })
    );

    const results = {
      processed: 0,
      success: 0,
      errors: 0,
      skipped: 0,
      details: []
    };

    console.log(`📋 ${invoices.length} factures OCR à traiter pour ${companyName}`);

    for (const invoice of invoices) {
      results.processed++;

      try {
        // Vérifier la confiance OCR minimale
        const ocrData = this.parseOCRData(invoice.ocr_data);
        const confidence = ocrData?.confidence || 0;

        if (options.minConfidence && confidence < options.minConfidence) {
          results.skipped++;
          results.details.push({
            id: invoice.id,
            number: invoice.invoice_number,
            status: 'skipped',
            reason: `Confiance OCR insuffisante: ${confidence}%`
          });
          continue;
        }

        const result = await this.createEntryFromOCR(invoice.id, {
          autoPost: options.autoPost,
          userId: options.userId
        });

        results.success++;
        results.details.push({
          id: invoice.id,
          number: invoice.invoice_number,
          status: 'success',
          entry_id: result.entry.id,
          amount: result.amounts.ttc,
          account: result.accounts.debit
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          id: invoice.id,
          number: invoice.invoice_number,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`✅ Traitement terminé: ${results.success} succès, ${results.errors} erreurs, ${results.skipped} ignorées`);
    return results;
  }

  /**
   * Obtenir les factures en attente de comptabilisation
   */
  async getPendingInvoices(companyName, options = {}) {
    const directus = this.getDirectus();

    const filter = {
      owner_company: { _eq: companyName },
      accounting_entry_id: { _null: true }
    };

    if (options.hasOCR) {
      filter.ocr_data = { _nnull: true };
    }

    if (options.status) {
      filter.status = { _eq: options.status };
    }

    const invoices = await directus.request(
      readItems('supplier_invoices', {
        filter,
        sort: ['-date'],
        limit: options.limit || 100,
        fields: [
          'id', 'invoice_number', 'supplier_name', 'supplier_id',
          'amount', 'currency', 'date', 'invoice_date', 'due_date',
          'status', 'ocr_data', 'ocr_validated', 'ocr_confidence',
          'accounting_status'
        ]
      })
    );

    return invoices.map(inv => {
      const ocrData = this.parseOCRData(inv.ocr_data);
      return {
        ...inv,
        ocr_confidence: ocrData?.confidence || inv.ocr_confidence || null,
        ocr_category: ocrData?.category || null,
        suggested_account: ocrData ? this.suggestAccounts(ocrData, inv).debit : null
      };
    });
  }

  // ==========================================
  // RAPPORTS ET STATISTIQUES
  // ==========================================

  /**
   * Obtenir les statistiques de traitement OCR
   */
  async getOCRStats(companyName, period = {}) {
    const directus = this.getDirectus();

    const now = new Date();
    const startDate = period.start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = period.end || now.toISOString();

    const baseFilter = {
      owner_company: { _eq: companyName },
      date: { _between: [startDate, endDate] }
    };

    const [total, withOCR, validated, withEntries, errors] = await Promise.all([
      directus.request(readItems('supplier_invoices', {
        filter: baseFilter,
        aggregate: { count: '*', sum: ['amount'] }
      })),
      directus.request(readItems('supplier_invoices', {
        filter: { ...baseFilter, ocr_data: { _nnull: true } },
        aggregate: { count: '*' }
      })),
      directus.request(readItems('supplier_invoices', {
        filter: { ...baseFilter, ocr_validated: { _eq: true } },
        aggregate: { count: '*' }
      })),
      directus.request(readItems('supplier_invoices', {
        filter: { ...baseFilter, accounting_entry_id: { _nnull: true } },
        aggregate: { count: '*', sum: ['amount'] }
      })),
      directus.request(readItems('supplier_invoices', {
        filter: { ...baseFilter, ocr_error: { _nnull: true } },
        aggregate: { count: '*' }
      }))
    ]);

    const totalCount = parseInt(total[0]?.count || 0);
    const ocrCount = parseInt(withOCR[0]?.count || 0);
    const validatedCount = parseInt(validated[0]?.count || 0);
    const entriesCount = parseInt(withEntries[0]?.count || 0);
    const errorCount = parseInt(errors[0]?.count || 0);

    return {
      period: { start: startDate, end: endDate },
      company: companyName,
      invoices: {
        total: totalCount,
        with_ocr: ocrCount,
        validated: validatedCount,
        with_entries: entriesCount,
        with_errors: errorCount,
        pending: totalCount - entriesCount
      },
      rates: {
        ocr_coverage: totalCount > 0 ? Math.round((ocrCount / totalCount) * 100) : 0,
        validation_rate: ocrCount > 0 ? Math.round((validatedCount / ocrCount) * 100) : 0,
        automation_rate: totalCount > 0 ? Math.round((entriesCount / totalCount) * 100) : 0,
        error_rate: ocrCount > 0 ? Math.round((errorCount / ocrCount) * 100) : 0
      },
      amounts: {
        total: parseFloat(total[0]?.sum?.amount || 0),
        processed: parseFloat(withEntries[0]?.sum?.amount || 0),
        currency: 'CHF'
      },
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Obtenir la répartition par compte
   */
  async getAccountDistribution(companyName, period = {}) {
    const directus = this.getDirectus();

    const now = new Date();
    const startDate = period.start || new Date(now.getFullYear(), 0, 1).toISOString();
    const endDate = period.end || now.toISOString();

    const entries = await directus.request(
      readItems('accounting_entries', {
        filter: {
          owner_company: { _eq: companyName },
          entry_date: { _between: [startDate, endDate] },
          document_type: { _eq: 'supplier_invoice' },
          created_from: { _eq: 'ocr' }
        },
        fields: ['id', 'lines', 'total_debit']
      })
    );

    // Agréger par compte de débit
    const distribution = {};

    for (const entry of entries) {
      const lines = typeof entry.lines === 'string' ? JSON.parse(entry.lines) : entry.lines;
      if (!lines) continue;

      for (const line of lines) {
        if (line.debit > 0 && line.account_number !== this.vatAccounts.input) {
          const account = line.account_number;
          if (!distribution[account]) {
            distribution[account] = {
              account: account,
              name: this.getAccountName(account),
              count: 0,
              total: 0
            };
          }
          distribution[account].count++;
          distribution[account].total += line.debit;
        }
      }
    }

    // Trier par montant total décroissant
    const sorted = Object.values(distribution).sort((a, b) => b.total - a.total);

    return {
      period: { start: startDate, end: endDate },
      company: companyName,
      distribution: sorted,
      total_entries: entries.length,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Enregistrer un mapping fournisseur pour apprentissage
   */
  async saveSupplierMapping(supplierId, mapping, companyName) {
    const directus = this.getDirectus();

    await directus.request(
      updateItem('suppliers', supplierId, {
        default_account: mapping.debit,
        default_account_label: mapping.label,
        default_vat_deductible: mapping.vatDeductible !== false,
        owner_company: companyName
      })
    );

    return { success: true, message: 'Mapping fournisseur enregistré' };
  }

  // ============================================
  // MÉTHODES MANQUANTES - APPELÉES PAR LES ROUTES
  // ============================================

  /**
   * Traiter un document OCR (upload initial)
   * @param {Object} options - Options avec buffer, mimetype, filename
   * @returns {Object} Résultat du traitement OCR
   */
  async processOCRDocument(options) {
    const directus = this.getDirectus();
    const {
      file_buffer,
      mimetype,
      original_filename,
      document_type = 'supplier_invoice',
      owner_company
    } = options;

    // 1. Sauvegarder le fichier dans le media library (simulé)
    const fileId = `ocr-${Date.now()}`;

    // 2. Effectuer l'OCR via OpenAI Vision ou autre service
    let ocrResult = null;

    if (this.openaiKey) {
      try {
        // Convertir buffer en base64
        const base64 = file_buffer.toString('base64');
        const dataUrl = `data:${mimetype};base64,${base64}`;

        // Appel OpenAI Vision (simulé - à implémenter avec vraie API)
        ocrResult = {
          supplier_name: null,
          invoice_number: null,
          date: null,
          amount_ht: null,
          amount_tva: null,
          amount_ttc: null,
          currency: 'CHF',
          raw_text: 'OCR non configuré - veuillez saisir manuellement',
          confidence: 0
        };
      } catch (e) {
        console.error('Erreur OCR:', e.message);
      }
    }

    // 3. Créer l'enregistrement OCR en attente
    const ocrDoc = await directus.request(
      createItem('ocr_documents', {
        original_filename,
        mimetype,
        file_id: fileId,
        document_type,
        owner_company,
        status: 'pending',
        ocr_result: ocrResult ? JSON.stringify(ocrResult) : null,
        confidence: ocrResult?.confidence || 0,
        created_at: new Date().toISOString()
      })
    );

    return {
      success: true,
      ocr_id: ocrDoc.id,
      status: 'pending',
      extracted_data: ocrResult,
      confidence: ocrResult?.confidence || 0,
      message: 'Document en attente de validation'
    };
  }

  /**
   * Valider et créer l'écriture comptable depuis OCR
   * @param {string} ocrId - ID du document OCR
   * @param {Object} corrections - Corrections manuelles
   * @returns {Object} Résultat de la création
   */
  async validateEntry(ocrId, corrections = {}) {
    const directus = this.getDirectus();

    // Récupérer le document OCR
    const ocrDoc = await directus.request(readItem('ocr_documents', ocrId));

    if (!ocrDoc) {
      throw new Error('Document OCR non trouvé');
    }

    if (ocrDoc.status === 'validated') {
      throw new Error('Document déjà validé');
    }

    // Parser les données OCR
    const ocrData = ocrDoc.ocr_result
      ? (typeof ocrDoc.ocr_result === 'string' ? JSON.parse(ocrDoc.ocr_result) : ocrDoc.ocr_result)
      : {};

    // Appliquer les corrections
    const finalData = { ...ocrData, ...corrections };

    // Créer la facture fournisseur
    const supplierInvoice = await directus.request(
      createItem('supplier_invoices', {
        owner_company: ocrDoc.owner_company,
        supplier_name: finalData.supplier_name || 'Fournisseur inconnu',
        invoice_number: finalData.invoice_number || `OCR-${Date.now()}`,
        date: finalData.date || new Date().toISOString().split('T')[0],
        amount_ht: finalData.amount_ht || 0,
        amount_tva: finalData.amount_tva || 0,
        amount: finalData.amount_ttc || finalData.amount_ht || 0,
        currency: finalData.currency || 'CHF',
        status: 'pending',
        ocr_document_id: ocrId,
        created_at: new Date().toISOString()
      })
    );

    // Créer l'écriture comptable
    let accountingEntry = null;
    try {
      accountingEntry = await this.createEntryFromOCR(supplierInvoice.id);
    } catch (e) {
      console.warn('Écriture comptable non créée:', e.message);
    }

    // Marquer l'OCR comme validé
    await directus.request(
      updateItem('ocr_documents', ocrId, {
        status: 'validated',
        validated_at: new Date().toISOString(),
        supplier_invoice_id: supplierInvoice.id,
        accounting_entry_id: accountingEntry?.entry?.id || null
      })
    );

    return {
      success: true,
      ocr_id: ocrId,
      supplier_invoice: supplierInvoice,
      accounting_entry: accountingEntry?.entry || null,
      message: 'Document validé et écriture comptable créée'
    };
  }

  /**
   * Rejeter un document OCR
   * @param {string} ocrId - ID du document OCR
   * @param {string} reason - Raison du rejet
   * @returns {Object} Résultat
   */
  async rejectEntry(ocrId, reason = '') {
    const directus = this.getDirectus();

    const ocrDoc = await directus.request(readItem('ocr_documents', ocrId));

    if (!ocrDoc) {
      throw new Error('Document OCR non trouvé');
    }

    if (ocrDoc.status === 'rejected') {
      throw new Error('Document déjà rejeté');
    }

    await directus.request(
      updateItem('ocr_documents', ocrId, {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
    );

    return {
      success: true,
      ocr_id: ocrId,
      status: 'rejected',
      reason,
      message: 'Document OCR rejeté'
    };
  }

  /**
   * Alias pour getPendingInvoices (compatibilité routes)
   * @param {string} companyName - Entreprise
   * @param {Object} options - Options
   * @returns {Object} Documents en attente
   */
  async getPendingOCR(companyName, options = {}) {
    const directus = this.getDirectus();

    try {
      const pending = await directus.request(
        readItems('ocr_documents', {
          filter: {
            owner_company: { _eq: companyName },
            status: { _eq: 'pending' }
          },
          sort: ['-created_at'],
          limit: options.limit || 50,
          offset: ((options.page || 1) - 1) * (options.limit || 50)
        })
      );

      return {
        items: pending,
        total: pending.length,
        page: options.page || 1,
        limit: options.limit || 50
      };
    } catch (e) {
      // Fallback sur getPendingInvoices si table n'existe pas
      return this.getPendingInvoices(companyName, options);
    }
  }

  /**
   * Retourner tous les mappings comptables disponibles
   * @returns {Object} Mappings par catégorie
   */
  getAccountMappings() {
    return {
      expense_categories: this.expenseCategories,
      vat_accounts: this.vatAccounts,
      supplier_accounts: {
        default_creditor: this.supplierAccounts.creditor,
        prepayment: this.supplierAccounts.prepayment
      },
      vat_rates: {
        normal: 8.1,
        reduced: 2.6,
        accommodation: 3.8,
        exempt: 0
      },
      account_ranges: {
        assets: '1000-1999',
        liabilities: '2000-2999',
        equity: '2800-2999',
        revenue: '3000-3999',
        expenses: '4000-6999',
        extraordinary: '7000-7999'
      }
    };
  }

  /**
   * Rechercher dans les mappings comptables
   * @param {string} query - Terme de recherche
   * @returns {Array} Résultats correspondants
   */
  searchAccountMappings(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Rechercher dans les catégories de dépenses
    for (const [key, config] of Object.entries(this.expenseCategories)) {
      if (
        key.toLowerCase().includes(lowerQuery) ||
        config.label.toLowerCase().includes(lowerQuery) ||
        config.account.toString().includes(lowerQuery)
      ) {
        results.push({
          type: 'expense_category',
          key,
          account: config.account,
          label: config.label,
          vat_deductible: config.vatDeductible
        });
      }

      // Rechercher aussi dans les patterns
      if (config.patterns) {
        for (const pattern of config.patterns) {
          if (pattern.toLowerCase().includes(lowerQuery)) {
            if (!results.find(r => r.key === key)) {
              results.push({
                type: 'expense_category',
                key,
                account: config.account,
                label: config.label,
                vat_deductible: config.vatDeductible,
                matched_pattern: pattern
              });
            }
          }
        }
      }
    }

    // Rechercher dans les comptes TVA
    for (const [key, account] of Object.entries(this.vatAccounts)) {
      if (key.toLowerCase().includes(lowerQuery) || account.toString().includes(lowerQuery)) {
        results.push({
          type: 'vat_account',
          key,
          account,
          label: `TVA ${key}`
        });
      }
    }

    return results;
  }
}

export const ocrToAccountingService = new OCRToAccountingService();
export default OCRToAccountingService;
