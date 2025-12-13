/**
 * QR-Bill Validator for Swiss Payment Standards v2.3
 * Validates QR-bills according to Swiss Implementation Guidelines
 */

const QR_BILL_ERRORS = {
  QR001: 'IBAN invalide',
  QR002: 'Référence invalide',
  QR003: 'Adresse non structurée détectée',
  QR004: 'Caractère non supporté',
  QR005: 'Montant hors limites',
  QR006: 'Devise non supportée',
  QR007: 'Type de référence invalide',
  QR008: 'Code pays invalide',
  QR009: 'Code postal invalide',
  QR010: 'Champ obligatoire manquant'
};

/**
 * Validate Swiss IBAN
 * @param {string} iban - IBAN to validate
 * @returns {object} Validation result
 */
function validateIBAN(iban) {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // Check format
  if (!/^CH\d{2}[A-Z0-9]{17}$/.test(cleanIBAN)) {
    return { valid: false, error: 'QR001', message: 'Format IBAN suisse invalide' };
  }
  
  // Check digit validation (ISO 7064 Mod 97-10)
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, char => (char.charCodeAt(0) - 55).toString());
  
  let remainder = '';
  for (let i = 0; i < numeric.length; i++) {
    remainder = (parseInt(remainder + numeric[i]) % 97).toString();
  }
  
  if (parseInt(remainder) !== 1) {
    return { valid: false, error: 'QR001', message: 'Chiffre de contrôle IBAN invalide' };
  }
  
  return { valid: true, formatted: formatIBAN(cleanIBAN) };
}

/**
 * Format IBAN with spaces
 * @param {string} iban - IBAN to format
 * @returns {string} Formatted IBAN
 */
function formatIBAN(iban) {
  const clean = iban.replace(/\s/g, '');
  return clean.match(/.{1,4}/g).join(' ');
}

/**
 * Validate QR Reference (QRR) - 27 digits with check digit
 * @param {string} reference - QRR reference to validate
 * @returns {object} Validation result
 */
function validateQRReference(reference) {
  const cleanRef = reference.replace(/\s/g, '');
  
  if (!/^\d{27}$/.test(cleanRef)) {
    return { valid: false, error: 'QR002', message: 'La référence QRR doit contenir 27 chiffres' };
  }
  
  // Validate check digit (Modulo 10 recursive)
  const weights = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  
  for (let i = 0; i < 26; i++) {
    carry = weights[(carry + parseInt(cleanRef[i])) % 10];
  }
  
  const checkDigit = (10 - carry) % 10;
  
  if (parseInt(cleanRef[26]) !== checkDigit) {
    return { valid: false, error: 'QR002', message: 'Chiffre de contrôle de référence invalide' };
  }
  
  return { valid: true, formatted: formatQRReference(cleanRef) };
}

/**
 * Format QR Reference with spaces
 * @param {string} reference - Reference to format
 * @returns {string} Formatted reference
 */
function formatQRReference(reference) {
  const clean = reference.replace(/\s/g, '');
  // Format: XX XXXXX XXXXX XXXXX XXXXX XXXXX X
  return clean.slice(0, 2) + ' ' + 
         clean.slice(2, 7) + ' ' + 
         clean.slice(7, 12) + ' ' + 
         clean.slice(12, 17) + ' ' + 
         clean.slice(17, 22) + ' ' + 
         clean.slice(22, 27);
}

/**
 * Validate structured address (required since v2.3)
 * @param {object} address - Address object to validate
 * @returns {object} Validation result
 */
function validateStructuredAddress(address) {
  const errors = [];
  
  // Required fields
  if (!address.name || address.name.trim() === '') {
    errors.push({ field: 'name', error: 'QR010', message: 'Nom/Raison sociale obligatoire' });
  }
  
  if (!address.street || address.street.trim() === '') {
    errors.push({ field: 'street', error: 'QR010', message: 'Rue obligatoire' });
  }
  
  if (!address.postalCode || address.postalCode.trim() === '') {
    errors.push({ field: 'postalCode', error: 'QR010', message: 'Code postal obligatoire' });
  }
  
  if (!address.city || address.city.trim() === '') {
    errors.push({ field: 'city', error: 'QR010', message: 'Localité obligatoire' });
  }
  
  if (!address.country || !/^[A-Z]{2}$/.test(address.country)) {
    errors.push({ field: 'country', error: 'QR008', message: 'Code pays ISO à 2 lettres obligatoire' });
  }
  
  // Swiss postal code validation
  if (address.country === 'CH' && address.postalCode) {
    if (!/^\d{4}$/.test(address.postalCode)) {
      errors.push({ field: 'postalCode', error: 'QR009', message: 'Code postal suisse invalide (4 chiffres)' });
    }
  }
  
  // Character validation (extended Latin set)
  const validCharPattern = /^[a-zA-ZÀ-ÿ0-9\s.,;:'"\-/()]+$/;
  
  ['name', 'street', 'city'].forEach(field => {
    if (address[field] && !validCharPattern.test(address[field])) {
      errors.push({ field, error: 'QR004', message: `Caractères non supportés dans ${field}` });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
    addressType: 'S' // Structured
  };
}

/**
 * Validate amount
 * @param {number} amount - Amount to validate
 * @returns {object} Validation result
 */
function validateAmount(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'QR005', message: 'Montant invalide' };
  }
  
  if (amount < 0.01 || amount > 999999999.99) {
    return { valid: false, error: 'QR005', message: 'Montant hors limites (0.01 - 999999999.99)' };
  }
  
  return { valid: true, formatted: amount.toFixed(2) };
}

/**
 * Validate currency
 * @param {string} currency - Currency code to validate
 * @returns {object} Validation result
 */
function validateCurrency(currency) {
  const validCurrencies = ['CHF', 'EUR'];
  
  if (!validCurrencies.includes(currency?.toUpperCase())) {
    return { valid: false, error: 'QR006', message: 'Devise invalide (CHF ou EUR uniquement)' };
  }
  
  return { valid: true, currency: currency.toUpperCase() };
}

/**
 * Complete QR-Bill validation
 * @param {object} qrBill - QR-Bill data object
 * @returns {object} Complete validation result
 */
function validateQRBill(qrBill) {
  const validationResult = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // Validate IBAN
  const ibanResult = validateIBAN(qrBill.iban || '');
  if (!ibanResult.valid) {
    validationResult.valid = false;
    validationResult.errors.push(ibanResult);
  }
  
  // Validate creditor address
  const creditorResult = validateStructuredAddress(qrBill.creditor || {});
  if (!creditorResult.valid) {
    validationResult.valid = false;
    validationResult.errors.push(...creditorResult.errors);
  }
  
  // Validate amount (if provided)
  if (qrBill.amount !== undefined && qrBill.amount !== null) {
    const amountResult = validateAmount(qrBill.amount);
    if (!amountResult.valid) {
      validationResult.valid = false;
      validationResult.errors.push(amountResult);
    }
  }
  
  // Validate currency
  const currencyResult = validateCurrency(qrBill.currency || 'CHF');
  if (!currencyResult.valid) {
    validationResult.valid = false;
    validationResult.errors.push(currencyResult);
  }
  
  // Validate reference (if QRR type)
  if (qrBill.referenceType === 'QRR' && qrBill.reference) {
    const refResult = validateQRReference(qrBill.reference);
    if (!refResult.valid) {
      validationResult.valid = false;
      validationResult.errors.push(refResult);
    }
  }
  
  // Validate debtor address (if provided)
  if (qrBill.debtor) {
    const debtorResult = validateStructuredAddress(qrBill.debtor);
    if (!debtorResult.valid) {
      validationResult.warnings.push(...debtorResult.errors.map(e => ({
        ...e,
        field: `debtor.${e.field}`
      })));
    }
  }
  
  return validationResult;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QR_BILL_ERRORS,
    validateIBAN,
    validateQRReference,
    validateStructuredAddress,
    validateAmount,
    validateCurrency,
    validateQRBill,
    formatIBAN,
    formatQRReference
  };
}

// For browser usage
if (typeof window !== 'undefined') {
  window.QRBillValidator = {
    QR_BILL_ERRORS,
    validateIBAN,
    validateQRReference,
    validateStructuredAddress,
    validateAmount,
    validateCurrency,
    validateQRBill,
    formatIBAN,
    formatQRReference
  };
}