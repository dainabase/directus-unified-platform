/**
 * Calculateur d'intérêts moratoires - Droit Suisse
 * 
 * Art. 104 CO : Taux légal 5% par an
 * Art. 104 al. 2 CO : Taux contractuel supérieur possible
 */

// Taux légal suisse (inchangé depuis 1912)
const LEGAL_INTEREST_RATE = 5; // %

// Jours dans une année (convention bancaire)
const DAYS_IN_YEAR = 365;

class InterestCalculator {
  /**
   * Calculer les intérêts moratoires
   * @param {number} principal - Montant principal
   * @param {number} rate - Taux annuel en % (défaut: 5%)
   * @param {number} days - Nombre de jours de retard
   * @returns {number} Intérêts calculés
   */
  calculate(principal, rate = LEGAL_INTEREST_RATE, days) {
    if (principal <= 0 || days <= 0) return 0;
    
    // Formule : Principal × Taux × Jours / 365
    const interest = (principal * (rate / 100) * days) / DAYS_IN_YEAR;
    
    // Arrondir à 2 décimales (centimes)
    return Math.round(interest * 100) / 100;
  }

  /**
   * Calculer les intérêts entre deux dates
   * @param {number} principal - Montant principal
   * @param {number} rate - Taux annuel en %
   * @param {Date|string} startDate - Date de début (mise en demeure)
   * @param {Date|string} endDate - Date de fin (paiement)
   * @returns {object} Détails du calcul
   */
  calculateBetweenDates(principal, rate, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const interest = this.calculate(principal, rate, days);
    
    return {
      principal,
      rate,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      days,
      interest,
      total: principal + interest
    };
  }

  /**
   * Générer le détail des intérêts pour une facture
   * Utile pour le document de mise en demeure
   * @param {object} invoice - Données de la facture
   * @param {Date|string} calculationDate - Date de calcul
   * @returns {object} Détail complet des intérêts
   */
  generateInterestStatement(invoice, calculationDate = new Date()) {
    const dueDate = new Date(invoice.due_date);
    const calcDate = new Date(calculationDate);
    
    // Vérifier si en retard
    if (calcDate <= dueDate) {
      return {
        is_overdue: false,
        principal: invoice.amount,
        interest: 0,
        total: invoice.amount,
        message: 'Facture dans les délais de paiement'
      };
    }

    const days = Math.floor((calcDate - dueDate) / (1000 * 60 * 60 * 24));
    const rate = invoice.contractual_interest_rate || LEGAL_INTEREST_RATE;
    const interest = this.calculate(invoice.amount, rate, days);

    return {
      is_overdue: true,
      invoice_number: invoice.number,
      invoice_date: invoice.date,
      due_date: invoice.due_date,
      calculation_date: calcDate.toISOString().split('T')[0],
      days_overdue: days,
      principal: invoice.amount,
      interest_rate: rate,
      interest_rate_type: invoice.contractual_interest_rate ? 'contractual' : 'legal',
      interest: interest,
      total: invoice.amount + interest,
      legal_reference: 'Art. 104 CO - Intérêts moratoires',
      calculation_formula: `${invoice.amount} CHF × ${rate}% × ${days} jours / 365 = ${interest} CHF`
    };
  }

  /**
   * Calculer les intérêts composés (mensuel)
   * Pour les situations de long retard
   */
  calculateCompound(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    const amount = principal * Math.pow(1 + monthlyRate, months);
    return Math.round((amount - principal) * 100) / 100;
  }

  /**
   * Vérifier si un taux est acceptable (non usuraire)
   * Art. 157 CP : L'usure est punissable
   */
  isRateAcceptable(rate) {
    // Seuil généralement accepté en B2B
    const MAX_B2B_RATE = 15;
    // Seuil scruté par les tribunaux
    const SCRUTINY_THRESHOLD = 18;

    if (rate <= LEGAL_INTEREST_RATE) {
      return { acceptable: true, level: 'legal', message: 'Taux légal' };
    } else if (rate <= 10) {
      return { acceptable: true, level: 'standard', message: 'Taux B2B standard' };
    } else if (rate <= MAX_B2B_RATE) {
      return { acceptable: true, level: 'elevated', message: 'Taux élevé mais acceptable' };
    } else if (rate <= SCRUTINY_THRESHOLD) {
      return { acceptable: true, level: 'risky', message: 'Risque de contestation' };
    } else {
      return { acceptable: false, level: 'usurious', message: 'Risque usure (art. 157 CP)' };
    }
  }
}

export const interestCalculator = new InterestCalculator();
export default interestCalculator;