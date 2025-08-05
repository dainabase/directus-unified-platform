const { logger } = require('../config/logger');
const patterns = require('../utils/patterns');

class ExtractionService {
  async extract(ocrResult, documentType) {
    const text = ocrResult.data.text;
    
    switch (documentType) {
      case 'invoice':
        return this.extractInvoiceData(text);
      case 'receipt':
        return this.extractReceiptData(text);
      default:
        return this.extractGenericData(text);
    }
  }

  extractInvoiceData(text) {
    const data = {
      type: 'invoice',
      supplier: this.extractSupplier(text),
      invoice: this.extractInvoiceInfo(text),
      amounts: this.extractAmounts(text),
      confidence: {}
    };

    data.globalConfidence = this.calculateConfidence(data);
    return data;
  }

  extractSupplier(text) {
    const supplier = {};
    
    // Email
    const emailMatch = text.match(patterns.email);
    if (emailMatch) {
      supplier.email = emailMatch[0];
    }

    // TVA Suisse
    const vatMatch = text.match(patterns.vat.swiss);
    if (vatMatch) {
      supplier.vatNumber = vatMatch[1] || vatMatch[0];
    }

    // IBAN
    const ibanMatch = text.match(patterns.iban);
    if (ibanMatch) {
      supplier.iban = ibanMatch[0].replace(/\s/g, '');
    }

    // Téléphone
    const phoneMatch = text.match(patterns.phone.swiss);
    if (phoneMatch) {
      supplier.phone = phoneMatch[0];
    }

    return supplier;
  }

  extractInvoiceInfo(text) {
    const invoice = {};
    
    // Numéro de facture
    for (const pattern of Object.values(patterns.invoice.number)) {
      const match = text.match(pattern);
      if (match) {
        invoice.number = match[1] || match[0];
        break;
      }
    }

    // Date
    const dateMatch = text.match(patterns.dates.swiss);
    if (dateMatch) {
      invoice.date = this.parseSwissDate(dateMatch[0]);
    }

    // Devise
    const currencyMatch = text.match(/\b(CHF|EUR|USD)\b/);
    if (currencyMatch) {
      invoice.currency = currencyMatch[1];
    } else {
      invoice.currency = 'CHF'; // Par défaut pour la Suisse
    }

    return invoice;
  }

  extractAmounts(text) {
    const amounts = {};
    
    // Total TTC
    const totalPattern = /(?:total|montant|à\s*payer)\s*:?\s*(?:CHF|€)?\s*([\d'\s,]+\.?\d{0,2})/gi;
    const totalMatch = text.match(totalPattern);
    if (totalMatch) {
      amounts.total = this.parseAmount(totalMatch[totalMatch.length - 1]);
    }

    // TVA
    const vatPattern = /(?:tva|mwst)\s*(?:(\d+(?:[,\.]\d+)?)\s*%)?\s*:?\s*(?:CHF|€)?\s*([\d'\s,]+\.?\d{0,2})/gi;
    const vatMatch = text.match(vatPattern);
    if (vatMatch) {
      const match = vatPattern.exec(vatMatch[0]);
      if (match) {
        if (match[1]) amounts.vatRate = parseFloat(match[1].replace(',', '.'));
        amounts.vatAmount = this.parseAmount(match[2]);
      }
    }

    // Sous-total
    if (amounts.total && amounts.vatAmount) {
      amounts.subtotal = amounts.total - amounts.vatAmount;
    }

    return amounts;
  }

  parseAmount(amountStr) {
    if (!amountStr) return null;
    
    const cleaned = amountStr
      .replace(/[^\d,\.']/g, '')
      .replace(/'/g, '')
      .replace(/\s/g, '');
    
    // Gérer virgule vs point
    if (cleaned.includes(',') && !cleaned.includes('.')) {
      const parts = cleaned.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        return parseFloat(cleaned.replace(',', '.'));
      } else {
        return parseFloat(cleaned.replace(/,/g, ''));
      }
    }
    
    return parseFloat(cleaned.replace(/,/g, ''));
  }

  parseSwissDate(dateStr) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  }

  calculateConfidence(data) {
    let score = 0;
    let fields = 0;
    
    if (data.supplier?.email) { score += 20; fields++; }
    if (data.supplier?.vatNumber) { score += 25; fields++; }
    if (data.invoice?.number) { score += 20; fields++; }
    if (data.invoice?.date) { score += 15; fields++; }
    if (data.amounts?.total) { score += 20; fields++; }
    
    return fields > 0 ? Math.round(score) : 0;
  }

  extractReceiptData(text) {
    return {
      type: 'receipt',
      merchant: {},
      amounts: this.extractAmounts(text),
      globalConfidence: 60
    };
  }

  extractGenericData(text) {
    return {
      type: 'generic',
      text: text,
      globalConfidence: 50
    };
  }
}

module.exports = new ExtractionService();