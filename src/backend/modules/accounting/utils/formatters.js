/**
 * Accounting Utilities & Formatters
 * ==================================
 * 
 * Utilitaires pour:
 * - Formatage montants suisses
 * - Arrondi au centime
 * - Formatage dates
 * - Validation données
 * 
 * @version 1.0.0
 * @updated 2025-01-13
 */

const AccountingUtils = {
    
    /**
     * Arrondi au centime suisse (5 centimes)
     */
    roundCHF(amount) {
        return Math.round(amount * 20) / 20;
    },
    
    /**
     * Formate un montant selon les standards suisses
     */
    formatSwissAmount(amount) {
        return Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    },
    
    /**
     * Formate une date selon le format suisse
     */
    formatDate(dateString, format = 'DD.MM.YYYY') {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        if (format === 'DD.MM.YYYY') {
            return date.toLocaleDateString('fr-CH');
        }
        
        return dateString;
    },
    
    /**
     * Valide un IBAN suisse
     */
    validateSwissIBAN(iban) {
        const regex = /^CH\d{19}$/;
        if (!regex.test(iban)) return false;
        
        // Vérification modulo 97
        const rearranged = iban.substring(4) + iban.substring(0, 4);
        const numeric = rearranged.replace(/[A-Z]/g, (char) => {
            return (char.charCodeAt(0) - 55).toString();
        });
        
        let remainder = 0;
        for (let i = 0; i < numeric.length; i++) {
            remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
        }
        
        return remainder === 1;
    },
    
    /**
     * Parse un montant depuis une chaîne
     */
    parseAmount(amountString) {
        if (typeof amountString === 'number') return amountString;
        if (!amountString) return 0;
        
        // Supprimer espaces, apostrophes et caractères non numériques (sauf point et virgule)
        const cleaned = amountString.toString()
            .replace(/[\s']/g, '')
            .replace(/,/g, '.');
        
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    },
    
    /**
     * Valide si un compte appartient à une classe donnée
     */
    isAccountInClass(accountNumber, classNumber) {
        return accountNumber.toString().charAt(0) === classNumber.toString();
    },
    
    /**
     * Extrait la classe d'un numéro de compte
     */
    getAccountClass(accountNumber) {
        return accountNumber.toString().charAt(0);
    },
    
    /**
     * Génère un numéro de référence unique
     */
    generateReference(prefix = 'REF') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}-${random}`.toUpperCase();
    },
    
    /**
     * Calcule la différence en jours entre deux dates
     */
    daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    },
    
    /**
     * Vérifie si une date est dans l'exercice en cours
     */
    isDateInCurrentFiscalYear(date, fiscalYearStart = '01-01') {
        const checkDate = new Date(date);
        const currentYear = new Date().getFullYear();
        const fiscalStart = new Date(`${currentYear}-${fiscalYearStart}`);
        const fiscalEnd = new Date(`${currentYear + 1}-${fiscalYearStart}`);
        
        return checkDate >= fiscalStart && checkDate < fiscalEnd;
    },
    
    /**
     * Convertit un taux de pourcentage en décimal
     */
    percentToDecimal(percent) {
        return percent / 100;
    },
    
    /**
     * Convertit un décimal en pourcentage
     */
    decimalToPercent(decimal) {
        return decimal * 100;
    }
};

module.exports = AccountingUtils;