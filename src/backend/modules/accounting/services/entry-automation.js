/**
 * Entry Automation Service
 * =========================
 * 
 * Service pour la génération automatique d'écritures comptables:
 * - Factures clients/fournisseurs
 * - Paiements
 * - Salaires
 * - Notes de frais
 * 
 * @version 1.0.0
 * @updated 2025-01-13
 */

const EntryAutomationService = {
    
    /**
     * Templates pour génération automatique d'écritures
     */
    templates: {
        // Facture client créée
        invoice_out_created: {
            description: "Création facture client",
            generate: function(data, context) {
                const tvaCode = data.vatCode || 'V81';
                const vatInfo = context.TVA_CONFIG.CODES[tvaCode] || context.TVA_CONFIG.CODES.V81;
                
                return {
                    lignes: [
                        {
                            compte: "1100",
                            libelle: `${data.client} - Facture ${data.numero}`,
                            debit: data.total_ttc,
                            credit: 0
                        },
                        {
                            compte: data.compte_produit || "3200",
                            libelle: data.description,
                            debit: 0,
                            credit: data.total_ht
                        },
                        {
                            compte: "2200",
                            libelle: `TVA ${vatInfo.percent}%`,
                            debit: 0,
                            credit: data.tva
                        }
                    ]
                };
            }
        },
        
        // Paiement client reçu
        payment_received: {
            description: "Encaissement client",
            generate: function(data, context) {
                const comptesBanque = {
                    "hypervisual": "1021",
                    "dainamics": "1022",
                    "waveform": "1023",
                    "particule": "1024",
                    "holding": "1025"
                };
                
                return {
                    lignes: [
                        {
                            compte: comptesBanque[data.entity] || "1020",
                            libelle: `Encaissement ${data.client}`,
                            debit: data.montant,
                            credit: 0
                        },
                        {
                            compte: "1100",
                            libelle: `${data.client} - Règlement facture ${data.facture}`,
                            debit: 0,
                            credit: data.montant
                        }
                    ]
                };
            }
        },
        
        // Facture fournisseur validée
        invoice_in_validated: {
            description: "Validation facture fournisseur",
            generate: function(data, context) {
                const tvaCode = data.vatCode || 'A81';
                const vatInfo = context.TVA_CONFIG.CODES[tvaCode] || context.TVA_CONFIG.CODES.A81;
                
                return {
                    lignes: [
                        {
                            compte: data.compte_charge || "4200",
                            libelle: data.description,
                            debit: data.total_ht,
                            credit: 0
                        },
                        {
                            compte: "1170",
                            libelle: `TVA récupérable ${vatInfo.percent}%`,
                            debit: data.tva,
                            credit: 0
                        },
                        {
                            compte: "2000",
                            libelle: `${data.fournisseur} - Facture ${data.numero}`,
                            debit: 0,
                            credit: data.total_ttc
                        }
                    ]
                };
            }
        },
        
        // Paiement fournisseur
        payment_sent: {
            description: "Paiement fournisseur",
            generate: function(data, context) {
                const comptesBanque = {
                    "hypervisual": "1021",
                    "dainamics": "1022",
                    "waveform": "1023",
                    "particule": "1024",
                    "holding": "1025"
                };
                
                return {
                    lignes: [
                        {
                            compte: "2000",
                            libelle: `${data.fournisseur} - Règlement facture ${data.facture}`,
                            debit: data.montant,
                            credit: 0
                        },
                        {
                            compte: comptesBanque[data.entity] || "1020",
                            libelle: `Paiement ${data.fournisseur}`,
                            debit: 0,
                            credit: data.montant
                        }
                    ]
                };
            }
        },
        
        // Salaires
        payroll_processed: {
            description: "Traitement paie mensuelle",
            generate: function(data, context) {
                return {
                    lignes: [
                        {
                            compte: "5000",
                            libelle: `Salaires ${data.mois}/${data.annee}`,
                            debit: data.salaires_bruts,
                            credit: 0
                        },
                        {
                            compte: "5700",
                            libelle: `Charges sociales patronales ${data.mois}/${data.annee}`,
                            debit: data.charges_patronales,
                            credit: 0
                        },
                        {
                            compte: "2270",
                            libelle: "Charges sociales à payer",
                            debit: 0,
                            credit: data.charges_sociales_totales
                        },
                        {
                            compte: "1020",
                            libelle: `Salaires nets ${data.mois}/${data.annee}`,
                            debit: 0,
                            credit: data.salaires_nets
                        }
                    ]
                };
            }
        }
    },
    
    /**
     * Crée une écriture automatique
     */
    async createAutomaticEntry(templateName, data, context) {
        try {
            const template = this.templates[templateName];
            if (!template) {
                throw new Error(`Template '${templateName}' non trouvé`);
            }
            
            const ecritureData = template.generate(data, context);
            if (!ecritureData || !ecritureData.lignes) {
                throw new Error('Template a retourné des données invalides');
            }
            
            // Vérifier équilibre
            const totalDebit = ecritureData.lignes.reduce((sum, ligne) => sum + ligne.debit, 0);
            const totalCredit = ecritureData.lignes.reduce((sum, ligne) => sum + ligne.credit, 0);
            
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                throw new Error('Écriture automatique non équilibrée');
            }
            
            const ecriture = {
                ecriture_id: `ECR-2025-${context.state.nextEntryNumber.toString().padStart(5, '0')}`,
                numero_piece: data.numero_piece || '',
                date_ecriture: data.date || new Date().toISOString().split('T')[0],
                periode: (data.date || new Date().toISOString()).substring(0, 7),
                exercice: (data.date || new Date().toISOString()).substring(0, 4),
                libelle: data.libelle || template.description,
                reference: data.reference || '',
                lignes: ecritureData.lignes,
                statut: 'validee',
                total_debit: totalDebit,
                total_credit: totalCredit,
                balance: 0,
                source: 'auto',
                module_origine: data.module || 'system',
                entity: data.entity || 'holding',
                created_at: new Date().toISOString(),
                created_by: 'system',
                validated_at: new Date().toISOString(),
                validated_by: 'system'
            };
            
            context.state.ecritures.unshift(ecriture);
            context.state.nextEntryNumber++;
            
            console.log(`✅ Écriture automatique créée: ${ecriture.ecriture_id}`);
            return ecriture;
            
        } catch (error) {
            console.error('❌ Erreur création écriture automatique:', error);
            throw error;
        }
    }
};

module.exports = EntryAutomationService;