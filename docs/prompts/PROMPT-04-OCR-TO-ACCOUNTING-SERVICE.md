# PROMPT 4/8 - SERVICE OCR VERS COMPTABILITÉ

## Contexte
Ce service convertit les données extraites par OCR (factures fournisseurs scannées) en écritures comptables automatiques. Il utilise le module comptabilité suisse existant.

## Fichier à créer
`src/backend/services/finance/ocr-to-accounting.service.js`

## Dépendances existantes
- OCR Service: `src/backend/api/legacy/ocr-service/`
- Module Comptabilité: `src/backend/modules/accounting/`
- Plan comptable Käfer: `src/backend/modules/accounting/swiss-compliance/chart-of-accounts.js`

## Code complet

```javascript
/**
 * OCRToAccountingService
 * Convertit les données OCR en écritures comptables suisses
 */

import { createDirectus, rest, authentication, readItems, createItem, updateItem } from '@directus/sdk';

class OCRToAccountingService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
    
    // Mapping catégories OCR vers comptes Käfer PME
    this.accountMappings = {
      // Charges d'exploitation
      'marchandises': { debit: '4000', credit: '2000', label: 'Achat marchandises' },
      'fournitures': { debit: '4200', credit: '2000', label: 'Fournitures de bureau' },
      'services': { debit: '4400', credit: '2000', label: 'Services externes' },
      'informatique': { debit: '4410', credit: '2000', label: 'Frais informatiques' },
      'telecom': { debit: '4420', credit: '2000', label: 'Télécommunications' },
      'loyer': { debit: '6000', credit: '2000', label: 'Loyer' },
      'energie': { debit: '6100', credit: '2000', label: 'Énergie' },
      'assurances': { debit: '6300', credit: '2000', label: 'Assurances' },
      'honoraires': { debit: '6500', credit: '2000', label: 'Honoraires' },
      'transport': { debit: '6200', credit: '2000', label: 'Transport' },
      'publicite': { debit: '6600', credit: '2000', label: 'Publicité' },
      'formation': { debit: '6700', credit: '2000', label: 'Formation' },
      'autre': { debit: '6800', credit: '2000', label: 'Frais divers' },
      
      // Investissements
      'materiel': { debit: '1500', credit: '2000', label: 'Matériel' },
      'mobilier': { debit: '1510', credit: '2000', label: 'Mobilier' },
      'vehicule': { debit: '1530', credit: '2000', label: 'Véhicule' }
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
      'input': '1170',   // TVA déductible (impôt préalable)
      'output': '2200'   // TVA due
    };
  }

  getDirectus() {
    const client = createDirectus(this.directusUrl)
      .with(authentication())
      .with(rest());
    client.setToken(this.directusToken);
    return client;
  }

  /**
   * Créer une écriture comptable depuis les données OCR validées
   * @param {string} supplierInvoiceId - ID de la facture fournisseur dans Directus
   * @param {Object} options - Options supplémentaires
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
      const ocrData = typeof invoice.ocr_data === 'string' 
        ? JSON.parse(invoice.ocr_data) 
        : invoice.ocr_data;

      if (!ocrData) {
        throw new Error('Données OCR non disponibles');
      }

      // 2. Déterminer les comptes
      const accounts = this.suggestAccounts(ocrData, invoice);

      // 3. Calculer les montants avec TVA
      const amounts = this.calculateAmounts(ocrData, invoice);

      // 4. Créer l'écriture comptable
      const entryData = {
        owner_company: invoice.owner_company,
        entry_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        reference: invoice.invoice_number || `OCR-${supplierInvoiceId.slice(0, 8)}`,
        description: `${accounts.label} - ${invoice.supplier_name || 'Fournisseur'}`,
        document_type: 'supplier_invoice',
        document_id: supplierInvoiceId,
        status: options.autoPost ? 'posted' : 'draft',
        lines: []
      };

      // Ligne débit (charge ou actif)
      entryData.lines.push({
        account_number: accounts.debit,
        account_name: this.getAccountName(accounts.debit),
        debit: amounts.ht,
        credit: 0,
        description: accounts.label
      });

      // Ligne TVA déductible (si applicable)
      if (amounts.tva > 0) {
        entryData.lines.push({
          account_number: this.vatAccounts.input,
          account_name: 'TVA déductible (impôt préalable)',
          debit: amounts.tva,
          credit: 0,
          description: `TVA ${amounts.vatRate}% sur ${accounts.label}`
        });
      }

      // Ligne crédit (créanciers)
      entryData.lines.push({
        account_number: accounts.credit,
        account_name: 'Créanciers (fournisseurs)',
        debit: 0,
        credit: amounts.ttc,
        description: `${invoice.supplier_name || 'Fournisseur'} - ${invoice.invoice_number || ''}`
      });

      // Créer l'écriture dans Directus
      const entry = await directus.request(
        createItem('accounting_entries', {
          ...entryData,
          lines: JSON.stringify(entryData.lines),
          total_debit: amounts.ttc,
          total_credit: amounts.ttc
        })
      );

      // 5. Lier l'écriture à la facture
      await directus.request(
        updateItem('supplier_invoices', supplierInvoiceId, {
          accounting_entry_id: entry.id,
          ocr_validated: true,
          ocr_validated_at: new Date().toISOString(),
          status: 'posted'
        })
      );

      console.log(`✅ Écriture comptable créée: ${entry.id} pour facture ${supplierInvoiceId}`);

      return {
        success: true,
        entry,
        amounts,
        accounts,
        message: `Écriture comptable créée: ${entry.reference}`
      };

    } catch (error) {
      console.error('Erreur création écriture OCR:', error);
      throw error;
    }
  }

  /**
   * Suggérer les comptes comptables basé sur les données OCR
   */
  suggestAccounts(ocrData, invoice) {
    // 1. Utiliser la catégorie détectée par OCR
    const category = (ocrData.category || 'autre').toLowerCase();
    
    if (this.accountMappings[category]) {
      return this.accountMappings[category];
    }

    // 2. Analyser le nom du fournisseur ou la description
    const text = `${invoice.supplier_name || ''} ${ocrData.description || ''}`.toLowerCase();

    // Patterns de détection
    const patterns = [
      { keywords: ['swisscom', 'sunrise', 'salt', 'telecom'], mapping: 'telecom' },
      { keywords: ['microsoft', 'google', 'adobe', 'software', 'logiciel'], mapping: 'informatique' },
      { keywords: ['sbb', 'cff', 'uber', 'taxi', 'carburant', 'essence'], mapping: 'transport' },
      { keywords: ['migros', 'coop', 'denner', 'aldi'], mapping: 'fournitures' },
      { keywords: ['electricite', 'gaz', 'services industriels', 'sig'], mapping: 'energie' },
      { keywords: ['loyer', 'bail', 'immobilier'], mapping: 'loyer' },
      { keywords: ['assurance', 'zurich', 'axa', 'mobiliar'], mapping: 'assurances' },
      { keywords: ['avocat', 'fiduciaire', 'expert', 'conseil'], mapping: 'honoraires' },
      { keywords: ['publicite', 'marketing', 'google ads', 'facebook'], mapping: 'publicite' }
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some(kw => text.includes(kw))) {
        return this.accountMappings[pattern.mapping];
      }
    }

    // 3. Défaut
    return this.accountMappings['autre'];
  }

  /**
   * Calculer les montants HT, TVA, TTC
   */
  calculateAmounts(ocrData, invoice) {
    const ttc = parseFloat(invoice.amount || ocrData.total || 0);
    let ht = parseFloat(ocrData.subtotal || 0);
    let tva = parseFloat(ocrData.vat_amount || 0);
    let vatRate = parseFloat(ocrData.vat_rate || 0);

    // Si on a le TTC mais pas le détail
    if (ttc > 0 && ht === 0) {
      // Détecter le taux de TVA
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

    return {
      ttc: Math.round(ttc * 100) / 100,
      ht: Math.round(ht * 100) / 100,
      tva: Math.round(tva * 100) / 100,
      vatRate
    };
  }

  /**
   * Détecter le taux de TVA applicable
   */
  detectVATRate(ocrData, invoice) {
    const text = `${invoice.supplier_name || ''} ${ocrData.description || ''}`.toLowerCase();
    
    // Hébergement
    if (text.includes('hotel') || text.includes('logement') || text.includes('airbnb')) {
      return this.vatRates.hebergement;
    }
    
    // Taux réduit (alimentaire, livres, journaux, médicaments)
    if (text.includes('pharmacie') || text.includes('livre') || text.includes('journal')) {
      return this.vatRates.reduit;
    }
    
    // Exonéré (santé, formation, certains services)
    if (text.includes('médecin') || text.includes('hopital') || text.includes('formation')) {
      return this.vatRates.exonere;
    }
    
    // Défaut: taux normal
    return this.vatRates.normal;
  }

  /**
   * Obtenir le nom d'un compte
   */
  getAccountName(accountNumber) {
    const names = {
      '1170': 'TVA déductible (impôt préalable)',
      '1500': 'Machines et équipements',
      '1510': 'Mobilier et installations',
      '1530': 'Véhicules',
      '2000': 'Créanciers (fournisseurs)',
      '2200': 'TVA due',
      '4000': 'Charges de marchandises',
      '4200': 'Fournitures de bureau',
      '4400': 'Services et sous-traitance',
      '4410': 'Frais informatiques',
      '4420': 'Télécommunications',
      '6000': 'Charges de locaux',
      '6100': 'Énergie',
      '6200': 'Transport',
      '6300': 'Assurances',
      '6500': 'Honoraires',
      '6600': 'Publicité',
      '6700': 'Formation',
      '6800': 'Frais divers'
    };
    return names[accountNumber] || `Compte ${accountNumber}`;
  }

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
    const ocrData = typeof invoice.ocr_data === 'string' 
      ? JSON.parse(invoice.ocr_data) 
      : invoice.ocr_data || {};

    const accounts = this.suggestAccounts(ocrData, invoice);
    const amounts = this.calculateAmounts(ocrData, invoice);

    return {
      invoice: {
        id: invoice.id,
        number: invoice.invoice_number,
        supplier: invoice.supplier_name,
        date: invoice.invoice_date
      },
      suggested: {
        accounts,
        amounts
      },
      preview: {
        lines: [
          {
            account: accounts.debit,
            name: this.getAccountName(accounts.debit),
            debit: amounts.ht,
            credit: 0
          },
          ...(amounts.tva > 0 ? [{
            account: this.vatAccounts.input,
            name: 'TVA déductible',
            debit: amounts.tva,
            credit: 0
          }] : []),
          {
            account: accounts.credit,
            name: this.getAccountName(accounts.credit),
            debit: 0,
            credit: amounts.ttc
          }
        ],
        total_debit: amounts.ttc,
        total_credit: amounts.ttc,
        balanced: true
      }
    };
  }

  /**
   * Modifier les comptes suggérés avant validation
   */
  async createEntryWithCustomAccounts(supplierInvoiceId, customAccounts) {
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
    const ocrData = typeof invoice.ocr_data === 'string' 
      ? JSON.parse(invoice.ocr_data) 
      : invoice.ocr_data || {};

    const amounts = this.calculateAmounts(ocrData, invoice);

    // Utiliser les comptes personnalisés
    const accounts = {
      debit: customAccounts.debit || '6800',
      credit: customAccounts.credit || '2000',
      label: customAccounts.label || 'Charge personnalisée'
    };

    // Créer l'écriture avec les comptes modifiés
    const entry = await directus.request(
      createItem('accounting_entries', {
        owner_company: invoice.owner_company,
        entry_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        reference: invoice.invoice_number,
        description: `${accounts.label} - ${invoice.supplier_name}`,
        document_type: 'supplier_invoice',
        document_id: supplierInvoiceId,
        status: 'posted',
        lines: JSON.stringify([
          { account_number: accounts.debit, debit: amounts.ht, credit: 0 },
          ...(amounts.tva > 0 ? [{ account_number: this.vatAccounts.input, debit: amounts.tva, credit: 0 }] : []),
          { account_number: accounts.credit, debit: 0, credit: amounts.ttc }
        ]),
        total_debit: amounts.ttc,
        total_credit: amounts.ttc
      })
    );

    // Mettre à jour la facture
    await directus.request(
      updateItem('supplier_invoices', supplierInvoiceId, {
        accounting_entry_id: entry.id,
        ocr_validated: true,
        ocr_validated_at: new Date().toISOString()
      })
    );

    return { success: true, entry };
  }

  /**
   * Traitement en lot des factures OCR non comptabilisées
   */
  async processPendingOCR(companyName, options = {}) {
    const directus = this.getDirectus();
    
    const invoices = await directus.request(
      readItems('supplier_invoices', {
        filter: {
          owner_company: { _eq: companyName },
          ocr_validated: { _eq: false },
          ocr_data: { _nnull: true }
        },
        limit: options.limit || 50
      })
    );

    const results = {
      processed: 0,
      success: 0,
      errors: 0,
      details: []
    };

    for (const invoice of invoices) {
      results.processed++;
      try {
        const result = await this.createEntryFromOCR(invoice.id, { autoPost: options.autoPost });
        results.success++;
        results.details.push({ id: invoice.id, status: 'success', entry: result.entry.id });
      } catch (error) {
        results.errors++;
        results.details.push({ id: invoice.id, status: 'error', message: error.message });
      }
    }

    return results;
  }
}

export const ocrToAccountingService = new OCRToAccountingService();
export default OCRToAccountingService;
```

## Instructions pour Claude Code
1. Créer le fichier dans `src/backend/services/finance/`
2. S'assurer que le champ `ocr_data` existe dans `supplier_invoices`
3. Le mapping des comptes peut être ajusté selon les besoins

## Test
```javascript
import { ocrToAccountingService } from './ocr-to-accounting.service.js';

// Prévisualiser une écriture
const preview = await ocrToAccountingService.previewEntry('uuid-facture');
console.log(preview);

// Créer l'écriture
const result = await ocrToAccountingService.createEntryFromOCR('uuid-facture');
console.log(result);

// Traitement en lot
const batch = await ocrToAccountingService.processPendingOCR('HYPERVISUAL');
console.log(batch);
```
