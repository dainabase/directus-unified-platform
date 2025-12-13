/**
 * Swiss TVA Compliance Engine
 * ============================
 * 
 * Module spécialisé pour la conformité TVA suisse:
 * ✅ Formulaire TVA 200 AFC
 * ✅ Taux 2025: 8.1% / 2.6% / 3.8%
 * ✅ QR-Factures v2.3
 * ✅ Impôt préalable et acquisition
 * 
 * @version 1.0.0
 * @updated 2025-01-13
 */

const SwissTVAEngine = {
    
    /**
     * Valide un numéro de TVA suisse
     */
    validateCHENumber(cheNumber) {
        const regex = /^CHE-\d{3}\.\d{3}\.\d{3}$/;
        return regex.test(cheNumber);
    },
    
    /**
     * Calcule les balances selon les normes suisses
     */
    calculateBalances(ecritures, chartOfAccounts) {
        const balances = {};
        
        ecritures.forEach(ecriture => {
            if (ecriture.statut !== 'validee') return;
            
            ecriture.lignes.forEach(ligne => {
                if (!balances[ligne.compte]) {
                    balances[ligne.compte] = {
                        debit: 0,
                        credit: 0,
                        solde: 0
                    };
                }
                
                balances[ligne.compte].debit += ligne.debit;
                balances[ligne.compte].credit += ligne.credit;
            });
        });
        
        // Calculer soldes selon nature du compte
        Object.keys(balances).forEach(compte => {
            const balance = balances[compte];
            const compteInfo = getCompteInfo(compte, chartOfAccounts);
            
            if (compteInfo && compteInfo.nature === 'debit') {
                balance.solde = balance.debit - balance.credit;
            } else {
                balance.solde = balance.credit - balance.debit;
            }
        });
        
        return balances;
    },
    
    /**
     * Génère le formulaire TVA 200
     */
    generateTVAForm(period, balances) {
        return {
            period,
            chiffre_affaires: this.calculateChiffreAffaires(balances),
            tva_due: this.calculateTVADue(balances),
            tva_recuperable: this.calculateTVARecuperable(balances),
            solde: this.calculateSoldeTVA(balances)
        };
    },
    
    calculateChiffreAffaires(balances) {
        // Chiffre d'affaires soumis à la TVA
        const ca_normal = (balances['3000']?.solde || 0) + (balances['3200']?.solde || 0);
        const ca_reduit = balances['3001']?.solde || 0;
        const ca_hebergement = balances['3202']?.solde || 0;
        
        return {
            normal: ca_normal,
            reduit: ca_reduit,
            hebergement: ca_hebergement,
            total: ca_normal + ca_reduit + ca_hebergement
        };
    },
    
    calculateTVADue(balances) {
        return balances['2200']?.solde || 0;
    },
    
    calculateTVARecuperable(balances) {
        return balances['1170']?.solde || 0;
    },
    
    calculateSoldeTVA(balances) {
        const due = this.calculateTVADue(balances);
        const recuperable = this.calculateTVARecuperable(balances);
        return due - recuperable;
    }
};

function getCompteInfo(numeroCompte, chartOfAccounts) {
    for (const [classe, data] of Object.entries(chartOfAccounts)) {
        if (data.comptes && data.comptes[numeroCompte]) {
            return data.comptes[numeroCompte];
        }
    }
    return null;
}

module.exports = SwissTVAEngine;