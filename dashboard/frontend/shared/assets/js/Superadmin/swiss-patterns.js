/**
 * Swiss Patterns - Patterns de reconnaissance spécifiques à la Suisse
 * @version 1.0.0
 */
const SwissPatterns = {
  /**
   * Patterns pour les montants
   */
  amounts: {
    // Format suisse avec apostrophes : CHF 1'234.56
    CHF: /CHF\s*([\d']+(?:\.\d{2})?)|(?:[\d']+(?:\.\d{2})?)\s*CHF/gi,
    
    // Format européen : EUR 1.234,56 ou 1 234,56 €
    EUR: /EUR\s*([\d\s.]+,\d{2})|(?:[\d\s.]+,\d{2})\s*(?:EUR|€)/gi,
    
    // Dollar US
    USD: /USD\s*([\d,]+\.?\d{0,2})|(?:\$\s*[\d,]+\.?\d{0,2})/gi,
    
    // Extraction générique de montants
    generic: /(?:CHF|EUR|USD|€|\$)\s*([\d'.,\s]+)/gi,
    
    // Total patterns
    total: /(?:total|montant\s+total|total\s+ttc|gesamtbetrag|totale)\s*:?\s*(?:CHF|EUR|€)?\s*([\d'.,\s]+)/gi,
    
    // TVA patterns
    vat: /(?:tva|mwst|iva|vat)\s*:?\s*(?:CHF|EUR|€)?\s*([\d'.,\s]+)/gi,
    
    // HT/TTC
    ht: /(?:ht|hors\s+taxes?|excl\.\s*vat|ohne\s+mwst)\s*:?\s*(?:CHF|EUR|€)?\s*([\d'.,\s]+)/gi,
    ttc: /(?:ttc|toutes\s+taxes|incl\.\s*vat|inkl\.\s*mwst)\s*:?\s*(?:CHF|EUR|€)?\s*([\d'.,\s]+)/gi
  },
  
  /**
   * Patterns TVA suisse
   */
  vat: {
    // Taux standards
    standard: /(?:TVA|MWST|IVA)\s*(?:8[.,]1|7[.,]7)\s*%/gi,
    reduced: /(?:TVA|MWST|IVA)\s*2[.,]6\s*%/gi,
    hotels: /(?:TVA|MWST|IVA)\s*3[.,]8\s*%/gi,
    
    // Extraction du taux
    rate: /(?:TVA|MWST|IVA)\s*(\d+[.,]\d+)\s*%/gi,
    
    // Montant TVA avec taux
    withRate: /(?:TVA|MWST|IVA)\s*(\d+[.,]\d+)\s*%\s*:?\s*(?:CHF|EUR|€)?\s*([\d'.,\s]+)/gi
  },
  
  /**
   * Identifiants business suisses
   */
  business_ids: {
    // Numéro IDE/UID (CHE-123.456.789)
    che: /CHE[-\s]?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{3})(?:\s*(?:TVA|MWST|IVA|VAT))?/gi,
    
    // Ancien format TVA
    oldVat: /(?:TVA|MWST|IVA)\s*(?:Nr?\.?|n°)?\s*(\d{3}[-.\s]?\d{3})/gi,
    
    // IBAN suisse
    iban: /CH\d{2}\s?(?:\d{4}\s?){4}\d/gi,
    
    // QR-IBAN
    qrIban: /QR-IBAN\s*:?\s*(CH\d{2}\s?(?:\d{4}\s?){4}\d)/gi,
    
    // BIC/SWIFT
    bic: /(?:BIC|SWIFT)\s*:?\s*([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)/gi,
    
    // ESR/BVR participant number
    esr: /(?:ESR|BVR|LSV)\s*:?\s*(\d{2}-\d{1,6}-\d)/gi
  },
  
  /**
   * Fournisseurs récurrents suisses
   */
  suppliers: {
    // Utilities
    utilities: {
      electricity: /(?:Romande\s*Energie|SIG|EWZ|BKW|CKW|EWB|IWB|Services\s*Industriels|SI\s*Lausanne)/i,
      water: /(?:Service\s*des\s*eaux|Eau\s*de|SIG\s*Eau)/i,
      gas: /(?:Gaznat|Energie\s*360|Gaz\s*naturel)/i
    },
    
    // Telecom
    telecom: {
      mobile: /(?:Swisscom|Salt|Sunrise|UPC|Wingo|yallo|Lebara|Lycamobile)/i,
      internet: /(?:Init7|Fiber7|Green\.ch|VTX|Quickline)/i
    },
    
    // Finance
    banks: /(?:UBS|Credit\s*Suisse|CS|Raiffeisen|PostFinance|Zürcher\s*Kantonalbank|ZKB|Banque\s*Cantonale|BCG[EFV]|BCV|BCGE|Migros\s*Bank)/i,
    insurance: /(?:Zurich|AXA|Helvetia|Mobilière|Vaudoise|Bâloise|Generali|Allianz|CSS|Helsana|Concordia|Visana|Sanitas|KPT|Groupe\s*Mutuel)/i,
    
    // Transport
    transport: /(?:CFF|SBB|FFS|TPG|TL|VBZ|BLS|ZVV|Mobility|PubliBike)/i,
    
    // Retail
    retail: /(?:Migros|Coop|Denner|Aldi|Lidl|Manor|Globus|Jelmoli|Loeb|EPA)/i,
    
    // Services
    post: /(?:La\s*Poste|Die\s*Post|Swiss\s*Post)/i,
    
    // Détection générique
    generic: /(?:SA|Sàrl|Sarl|GmbH|AG|Ltd|Inc\.|Co\.)/i
  },
  
  /**
   * Patterns de dates
   */
  dates: {
    // Format suisse : 25.07.2025 ou 25.7.25
    swiss: /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g,
    
    // Format européen : 25/07/2025
    european: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
    
    // Format ISO : 2025-07-25
    iso: /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    
    // Dates textuelles en français
    textFr: /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi,
    
    // Dates textuelles en allemand
    textDe: /(\d{1,2})\s+(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+(\d{4})/gi,
    
    // Mots-clés de dates
    keywords: {
      invoice: /(?:date\s*(?:de\s*)?facture|rechnungsdatum|data\s*fattura)\s*:?\s*/i,
      due: /(?:échéance|fälligkeit|scadenza|due\s*date)\s*:?\s*/i,
      delivery: /(?:livraison|lieferung|consegna)\s*:?\s*/i
    }
  },
  
  /**
   * Patterns d'adresses suisses
   */
  addresses: {
    // Code postal suisse (4 chiffres)
    postalCode: /\b(?:CH-)?\d{4}\b/g,
    
    // Villes principales
    cities: /(?:Genève|Lausanne|Bern|Berne|Zürich|Zurich|Basel|Bâle|Winterthur|Lucerne|Luzern|St\.?\s*Gallen|Lugano|Biel|Bienne|Thun|Köniz|La\s*Chaux-de-Fonds|Fribourg|Freiburg|Schaffhausen|Chur|Coire|Neuchâtel|Uster|Sion|Sitten|Vernier|Lancy|Emmen|Rapperswil-Jona|Zug|Zoug|Kriens|Yverdon-les-Bains|Montreux|Frauenfeld|Wil|Bulle|Carouge|Aarau|Allschwil|Renens|Wettingen|Meyrin|Horgen|Kreuzlingen|Vevey|Reinach|Wädenswil|Kloten|Dietikon)/i,
    
    // Cantons
    cantons: /\b(?:AG|AI|AR|BE|BL|BS|FR|GE|GL|GR|JU|LU|NE|NW|OW|SG|SH|SO|SZ|TG|TI|UR|VD|VS|ZG|ZH)\b/g,
    
    // Pattern complet
    full: /(?:rue|route|chemin|avenue|place|quai|boulevard|Strasse|Weg|Gasse|Platz|via|piazza)\s+[^,\n]+,?\s*(?:CH-)?\d{4}\s+\w+/gi
  },
  
  /**
   * Numéros de référence
   */
  references: {
    // Facture
    invoice: /(?:facture|rechnung|fattura|invoice)\s*(?:n[°o]?\.?|nr\.?|#)\s*:?\s*([A-Z0-9\-\/]+)/gi,
    
    // Commande
    order: /(?:commande|bestellung|ordine|order)\s*(?:n[°o]?\.?|nr\.?|#)\s*:?\s*([A-Z0-9\-\/]+)/gi,
    
    // Client
    customer: /(?:client|kunde|cliente|customer)\s*(?:n[°o]?\.?|nr\.?|#)\s*:?\s*([A-Z0-9\-\/]+)/gi,
    
    // QR reference (for Swiss QR bills)
    qrReference: /(?:référence|referenz|riferimento)\s*:?\s*(\d{2}\s?\d{5}\s?\d{5}\s?\d{5}\s?\d{5}\s?\d{5})/gi,
    
    // ESR reference
    esrReference: /\d{2}\s?\d{5}\s?\d{5}\s?\d{5}\s?\d{5}\s?\d{5}/g
  },
  
  /**
   * Patterns multilingues
   */
  multilingual: {
    // Termes de facturation
    invoice: /facture|rechnung|fattura|invoice/i,
    amount: /montant|betrag|importo|amount/i,
    total: /total|gesamtbetrag|totale/i,
    vat: /tva|mwst|iva|vat/i,
    date: /date|datum|data/i,
    
    // Devises
    currency: /(?:francs?\s*suisses?|CHF|schweizer\s*franken|franchi\s*svizzeri)/i
  },
  
  /**
   * Validation et normalisation
   */
  validators: {
    // Valider un numéro CHE
    isValidCHE(che) {
      const cleaned = che.replace(/[^\d]/g, '');
      if (cleaned.length !== 9) return false;
      
      // Algorithme de validation CHE
      const weights = [5, 4, 3, 2, 7, 6, 5, 4];
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(cleaned[i]) * weights[i];
      }
      const checkDigit = (11 - (sum % 11)) % 11;
      return checkDigit === parseInt(cleaned[8]);
    },
    
    // Valider un IBAN suisse
    isValidSwissIBAN(iban) {
      const cleaned = iban.replace(/\s/g, '');
      return /^CH\d{2}\d{5}[A-Z0-9]{12}$/.test(cleaned);
    },
    
    // Normaliser un montant
    normalizeAmount(amount) {
      // Enlever CHF, espaces, etc.
      let cleaned = amount.replace(/[^\d'.,\-]/g, '');
      // Remplacer apostrophes par rien
      cleaned = cleaned.replace(/'/g, '');
      // Remplacer virgule par point si c'est le séparateur décimal
      if (cleaned.match(/^\d+,\d{2}$/)) {
        cleaned = cleaned.replace(',', '.');
      }
      return parseFloat(cleaned) || 0;
    }
  },
  
  /**
   * Extraction intelligente
   */
  extract: {
    // Extraire le fournisseur le plus probable
    supplier(text) {
      // Chercher d'abord les fournisseurs connus
      for (const [category, pattern] of Object.entries(SwissPatterns.suppliers)) {
        if (pattern instanceof RegExp) {
          const match = text.match(pattern);
          if (match) return { name: match[0], category };
        } else {
          for (const [subcat, subpattern] of Object.entries(pattern)) {
            const match = text.match(subpattern);
            if (match) return { name: match[0], category, subcategory: subcat };
          }
        }
      }
      
      // Sinon chercher une société générique
      const genericMatch = text.match(/^.+(?:SA|Sàrl|GmbH|AG)\b/m);
      return genericMatch ? { name: genericMatch[0], category: 'unknown' } : null;
    },
    
    // Extraire tous les montants et identifier le total
    amounts(text) {
      const amounts = [];
      const matches = text.matchAll(SwissPatterns.amounts.generic);
      
      for (const match of matches) {
        const value = SwissPatterns.validators.normalizeAmount(match[1]);
        if (value > 0) {
          amounts.push({
            raw: match[0],
            value,
            currency: match[0].includes('EUR') || match[0].includes('€') ? 'EUR' : 'CHF',
            context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
          });
        }
      }
      
      // Identifier le total (généralement le montant le plus élevé ou celui avec le mot "total")
      const totalMatch = text.match(SwissPatterns.amounts.total);
      let total = null;
      
      if (totalMatch) {
        total = amounts.find(a => a.raw.includes(totalMatch[1]));
      }
      
      if (!total && amounts.length > 0) {
        // Prendre le montant le plus élevé
        total = amounts.reduce((max, curr) => curr.value > max.value ? curr : max);
      }
      
      return { all: amounts, total };
    }
  }
};

// Export global
window.SwissPatterns = SwissPatterns;