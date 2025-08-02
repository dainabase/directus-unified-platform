// Patterns de reconnaissance pour l'extraction
module.exports = {
  // Emails
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Téléphones suisses
  phone: {
    swiss: /(?:\+41|0041|0)\s?(?:\d{2})\s?\d{3}\s?\d{2}\s?\d{2}/g
  },
  
  // TVA Suisse
  vat: {
    swiss: /CHE[-\s]?(\d{3}[-.\s]?\d{3}[-.\s]?\d{3})\s?(?:TVA|MWST|IVA)?/gi
  },
  
  // IBAN
  iban: /[A-Z]{2}\d{2}\s?(?:[A-Z0-9]{4}\s?){4,7}[A-Z0-9]{1,4}/g,
  
  // Sites web
  website: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+/g,
  
  // Numéros de facture
  invoice: {
    number: {
      standard: /(?:facture|invoice|rechnung)\s*(?:n°|nr|no\.?|#)\s*:?\s*([A-Z0-9\-\/]+)/gi,
      withPrefix: /(?:FA|INV|RE|RG)[-\s]?(\d{4,})/gi,
      swiss: /(\d{4}[-.]?\d{3,4})/g
    }
  },
  
  // Montants avec devises
  amounts: {
    chf: /(?:CHF|Fr\.?)\s*([\d'\s,]+\.?\d{0,2})/gi,
    eur: /(?:EUR|€)\s*([\d'\s,]+\.?\d{0,2})/gi,
    generic: /([\d'\s,]+\.?\d{2})\s*(?:CHF|EUR|€|Fr\.?)/gi
  },
  
  // Dates
  dates: {
    swiss: /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g,
    iso: /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    european: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g
  }
};