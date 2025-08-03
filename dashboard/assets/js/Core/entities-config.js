/**
 * Configuration Multi-Entités Groupe
 * Extensible pour tous pays/devises/langues
 */
const ENTITIES_CONFIG = {
    hypervisual: {
        name: 'HYPERVISUAL by HMF Corporation SA',
        identifiers: [
            'HYPERVISUAL',
            'HMF Corporation',
            'info@hypervisual.ch',
            'Avenue de Beauregard 1',
            'CHE-100.968.497'
        ],
        country: 'CH',
        currency: 'CHF',
        vat_format: /CHE-\d{3}\.\d{3}\.\d{3}/,
        iban_format: /CH\d{2}|GB\d{2}/
    },
    
    dainamics: {
        name: 'Dainamics Solutions',
        identifiers: [
            'DAINAMICS',
            'Dainamics',
            'contact@dainamics.com'
        ],
        country: 'FR', // Exemple
        currency: 'EUR',
        vat_format: /FR\d{11}/,
        iban_format: /FR\d{2}/
    },
    
    enki_reality: {
        name: 'Enki Reality',
        identifiers: [
            'ENKI REALITY',
            'Enki Reality',
            'hello@enkireality.com'
        ],
        country: 'US', // Exemple
        currency: 'USD',
        vat_format: /EIN\s?\d{2}-\d{7}/,
        iban_format: /US\d{2}/
    },
    
    takeout: {
        name: 'Takeout Services',
        identifiers: [
            'TAKEOUT',
            'Takeout',
            'orders@takeout.delivery'
        ],
        country: 'DE', // Exemple
        currency: 'EUR',
        vat_format: /DE\d{9}/,
        iban_format: /DE\d{2}/
    },
    
    lexaia: {
        name: 'Lexaia AI',
        identifiers: [
            'LEXAIA',
            'Lexaia',
            'ai@lexaia.tech'
        ],
        country: 'CA', // Exemple
        currency: 'CAD',
        vat_format: /\d{9}RT\d{4}/,
        iban_format: /CA\d{2}/
    }
};

// Patterns de devises internationales
const CURRENCY_PATTERNS = {
    CHF: /CHF[\s]*[\d']+(?:[.,]\d{1,2})?|[\d']+(?:[.,]\d{1,2})?[\s]*CHF/g,
    EUR: /EUR[\s]*[\d']+(?:[.,]\d{1,2})?|[\d']+(?:[.,]\d{1,2})?[\s]*EUR|€[\s]*[\d']+(?:[.,]\d{1,2})?/g,
    USD: /USD[\s]*[\d']+(?:[.,]\d{1,2})?|[\d']+(?:[.,]\d{1,2})?[\s]*USD|\$[\s]*[\d']+(?:[.,]\d{1,2})?/g,
    GBP: /GBP[\s]*[\d']+(?:[.,]\d{1,2})?|[\d']+(?:[.,]\d{1,2})?[\s]*GBP|£[\s]*[\d']+(?:[.,]\d{1,2})?/g,
    CAD: /CAD[\s]*[\d']+(?:[.,]\d{1,2})?|[\d']+(?:[.,]\d{1,2})?[\s]*CAD/g
};

// Mots-clés par langue
const KEYWORDS_BY_LANGUAGE = {
    fr: {
        invoice: ['facture', 'devis', 'offre'],
        total: ['total', 'montant', 'sous-total'],
        date: ['date', 'échéance'],
        client: ['client', 'destinataire']
    },
    en: {
        invoice: ['invoice', 'bill', 'offer', 'quote'],
        total: ['total', 'amount', 'subtotal', 'sum'],
        date: ['date', 'due date'],
        client: ['client', 'customer']
    },
    de: {
        invoice: ['rechnung', 'angebot'],
        total: ['betrag', 'summe', 'total'],
        date: ['datum', 'fällig'],
        client: ['kunde', 'klient']
    },
    es: {
        invoice: ['factura', 'presupuesto'],
        total: ['total', 'importe', 'suma'],
        date: ['fecha', 'vencimiento'],
        client: ['cliente']
    }
};

window.ENTITIES_CONFIG = ENTITIES_CONFIG;
window.CURRENCY_PATTERNS = CURRENCY_PATTERNS;
window.KEYWORDS_BY_LANGUAGE = KEYWORDS_BY_LANGUAGE;