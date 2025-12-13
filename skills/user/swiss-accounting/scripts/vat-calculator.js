/**
 * VAT Calculator for Swiss SMEs
 * Taux TVA 2025 en vigueur depuis le 01.01.2024
 */

const VAT_RATES_2025 = {
  normal: {
    rate: 0.081,
    code: "N",
    form_field_base: "302",
    form_field_tax: "303",
    description: "Taux normal - majorité des biens/services",
    examples: ["Services informatiques", "Conseils", "Électronique", "Vêtements"]
  },
  reduced: {
    rate: 0.026,
    code: "R",
    form_field_base: "312",
    form_field_tax: "313",
    description: "Taux réduit - alimentation, livres, médicaments",
    examples: ["Alimentation", "Boissons non alcoolisées", "Livres", "Journaux", "Médicaments"]
  },
  accommodation: {
    rate: 0.038,
    code: "H",
    form_field_base: "342",
    form_field_tax: "343",
    description: "Taux hébergement - nuitées avec petit-déjeuner",
    examples: ["Hôtels", "Chambres d'hôtes", "Camping"]
  },
  exempt: {
    rate: 0,
    code: "E",
    form_field_base: "200",
    form_field_tax: null,
    description: "Exonéré - prestations exclues du champ TVA",
    examples: ["Services médicaux", "Formation", "Assurances", "Services bancaires"]
  },
  export: {
    rate: 0,
    code: "X",
    form_field_base: "220",
    form_field_tax: null,
    description: "Export - livraisons à l'étranger",
    examples: ["Ventes export", "Services internationaux"]
  }
};

/**
 * Calculate VAT amount from net amount
 * @param {number} netAmount - Amount without VAT
 * @param {string} rateType - Type of VAT rate (normal, reduced, accommodation)
 * @returns {object} VAT calculation details
 */
function calculateVATFromNet(netAmount, rateType = 'normal') {
  const rateConfig = VAT_RATES_2025[rateType];
  if (!rateConfig) {
    throw new Error(`Invalid VAT rate type: ${rateType}`);
  }
  
  const vatAmount = netAmount * rateConfig.rate;
  const grossAmount = netAmount + vatAmount;
  
  return {
    netAmount: roundToRappen(netAmount),
    vatRate: rateConfig.rate,
    vatRatePercent: (rateConfig.rate * 100).toFixed(1) + '%',
    vatCode: rateConfig.code,
    vatAmount: roundToRappen(vatAmount),
    grossAmount: roundToRappen(grossAmount),
    formFieldBase: rateConfig.form_field_base,
    formFieldTax: rateConfig.form_field_tax
  };
}

/**
 * Calculate VAT amount from gross amount (extract VAT)
 * @param {number} grossAmount - Amount including VAT
 * @param {string} rateType - Type of VAT rate
 * @returns {object} VAT calculation details
 */
function calculateVATFromGross(grossAmount, rateType = 'normal') {
  const rateConfig = VAT_RATES_2025[rateType];
  if (!rateConfig) {
    throw new Error(`Invalid VAT rate type: ${rateType}`);
  }
  
  const netAmount = grossAmount / (1 + rateConfig.rate);
  const vatAmount = grossAmount - netAmount;
  
  return {
    grossAmount: roundToRappen(grossAmount),
    vatRate: rateConfig.rate,
    vatRatePercent: (rateConfig.rate * 100).toFixed(1) + '%',
    vatCode: rateConfig.code,
    vatAmount: roundToRappen(vatAmount),
    netAmount: roundToRappen(netAmount),
    formFieldBase: rateConfig.form_field_base,
    formFieldTax: rateConfig.form_field_tax
  };
}

/**
 * Round to Swiss Rappen (0.05 CHF)
 * @param {number} amount - Amount to round
 * @returns {number} Rounded amount
 */
function roundToRappen(amount) {
  return Math.round(amount * 20) / 20;
}

/**
 * Format amount in Swiss format (1'234.56)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
function formatSwissAmount(amount) {
  const parts = amount.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return parts.join('.');
}

/**
 * Generate VAT declaration summary
 * @param {Array} transactions - Array of transactions with amounts and VAT types
 * @returns {object} VAT declaration data
 */
function generateVATDeclaration(transactions) {
  const declaration = {
    period: null,
    totalRevenue: 0,
    deductions: 0,
    taxableBase: {
      normal: { base: 0, tax: 0 },
      reduced: { base: 0, tax: 0 },
      accommodation: { base: 0, tax: 0 }
    },
    totalTaxDue: 0,
    inputTax: 0,
    netTaxDue: 0
  };
  
  transactions.forEach(tx => {
    if (tx.type === 'sale') {
      const rateType = tx.vatType || 'normal';
      const calc = calculateVATFromNet(tx.amount, rateType);
      declaration.taxableBase[rateType].base += calc.netAmount;
      declaration.taxableBase[rateType].tax += calc.vatAmount;
      declaration.totalRevenue += calc.grossAmount;
    } else if (tx.type === 'purchase' && tx.deductible !== false) {
      const calc = calculateVATFromGross(tx.amount, tx.vatType || 'normal');
      declaration.inputTax += calc.vatAmount;
    }
  });
  
  declaration.totalTaxDue = 
    declaration.taxableBase.normal.tax + 
    declaration.taxableBase.reduced.tax + 
    declaration.taxableBase.accommodation.tax;
  
  declaration.netTaxDue = declaration.totalTaxDue - declaration.inputTax;
  
  return declaration;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VAT_RATES_2025,
    calculateVATFromNet,
    calculateVATFromGross,
    roundToRappen,
    formatSwissAmount,
    generateVATDeclaration
  };
}

// For browser usage
if (typeof window !== 'undefined') {
  window.SwissVAT = {
    VAT_RATES_2025,
    calculateVATFromNet,
    calculateVATFromGross,
    roundToRappen,
    formatSwissAmount,
    generateVATDeclaration
  };
}