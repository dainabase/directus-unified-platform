// superadmin-databases-config.js
// Configuration des bases de données Notion pour SUPERADMIN
// À utiliser pour créer les bases manuellement ou via MCP

const SUPERADMIN_DATABASES_CONFIG = {
  // Base de données des factures fournisseurs
  DB_FACTURES_IN: {
    name: "DB-FACTURES-FOURNISSEURS",
    description: "Gestion des factures de fournisseurs avec OCR et validation",
    properties: {
      "Numéro Facture": {
        type: "title",
        title: {}
      },
      "Fournisseur": {
        type: "relation",
        relation: {
          database_id: "223adb95-3c6f-80e7-aa2b-cfd9888f2af3" // DB-CONTACTS-ENTREPRISES
        }
      },
      "Entité Groupe": {
        type: "relation",
        relation: {
          database_id: "ENTITE_GROUPE_ID" // À définir lors de la création
        }
      },
      "Date Facture": {
        type: "date",
        date: {}
      },
      "Date Échéance": {
        type: "date", 
        date: {}
      },
      "Montant HT": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Montant TTC": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Taux TVA": {
        type: "select",
        select: {
          options: [
            { name: "8.1%", color: "blue" },
            { name: "2.6%", color: "green" },
            { name: "3.8%", color: "orange" },
            { name: "0%", color: "gray" }
          ]
        }
      },
      "Statut": {
        type: "select",
        select: {
          options: [
            { name: "Brouillon", color: "gray" },
            { name: "À valider", color: "yellow" },
            { name: "Validée", color: "blue" },
            { name: "Payée", color: "green" },
            { name: "En litige", color: "red" },
            { name: "Annulée", color: "default" }
          ]
        }
      },
      "Catégorie Comptable": {
        type: "select",
        select: {
          options: [
            { name: "Marchandises", color: "blue" },
            { name: "Services", color: "green" },
            { name: "Investissements", color: "purple" },
            { name: "Charges", color: "orange" },
            { name: "Frais généraux", color: "pink" }
          ]
        }
      },
      "Compte Débit": {
        type: "rich_text",
        rich_text: {}
      },
      "Compte Crédit": {
        type: "rich_text", 
        rich_text: {}
      },
      "Projet Lié": {
        type: "relation",
        relation: {
          database_id: "226adb95-3c6f-806e-9e61-e263baf7af69" // DB-PROJETS-CLIENTS
        }
      },
      "Document OCR": {
        type: "files",
        files: {}
      },
      "Texte OCR Extrait": {
        type: "rich_text",
        rich_text: {}
      },
      "Validation Manager": {
        type: "people",
        people: {}
      },
      "Date Validation": {
        type: "date",
        date: {}
      },
      "Notes": {
        type: "rich_text",
        rich_text: {}
      },
      "Référence Interne": {
        type: "rich_text",
        rich_text: {}
      }
    }
  },

  // Base de données des notes de frais
  DB_NOTES_FRAIS: {
    name: "DB-NOTES-FRAIS",
    description: "Gestion des notes de frais employés avec validation hiérarchique",
    properties: {
      "Description": {
        type: "title",
        title: {}
      },
      "Employé": {
        type: "people",
        people: {}
      },
      "Entité": {
        type: "relation",
        relation: {
          database_id: "ENTITE_GROUPE_ID"
        }
      },
      "Date Dépense": {
        type: "date",
        date: {}
      },
      "Montant": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Incluse": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Catégorie": {
        type: "select",
        select: {
          options: [
            { name: "Repas affaires", color: "orange" },
            { name: "Transport", color: "blue" },
            { name: "Hébergement", color: "purple" },
            { name: "Matériel bureau", color: "green" },
            { name: "Formation", color: "yellow" },
            { name: "Marketing", color: "pink" },
            { name: "Télécoms", color: "default" },
            { name: "Autres", color: "gray" }
          ]
        }
      },
      "Justificatif": {
        type: "files",
        files: {}
      },
      "Projet": {
        type: "relation",
        relation: {
          database_id: "226adb95-3c6f-806e-9e61-e263baf7af69"
        }
      },
      "Statut Validation": {
        type: "select",
        select: {
          options: [
            { name: "Brouillon", color: "gray" },
            { name: "Soumise", color: "yellow" },
            { name: "Validée", color: "green" },
            { name: "Rejetée", color: "red" },
            { name: "Remboursée", color: "blue" }
          ]
        }
      },
      "Validé Par": {
        type: "people",
        people: {}
      },
      "Date Validation": {
        type: "date",
        date: {}
      },
      "Carte Utilisée": {
        type: "select",
        select: {
          options: [
            { name: "Revolut Business", color: "blue" },
            { name: "Carte perso", color: "orange" },
            { name: "Espèces", color: "green" },
            { name: "Virement", color: "purple" }
          ]
        }
      },
      "Kilométrage": {
        type: "number",
        number: {
          format: "number"
        }
      },
      "Taux Kilométrique": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Notes": {
        type: "rich_text",
        rich_text: {}
      }
    }
  },

  // Base de données écritures comptables
  DB_ECRITURES_COMPTABLES: {
    name: "DB-ECRITURES-COMPTABLES",
    description: "Journal général des écritures comptables",
    properties: {
      "Libellé": {
        type: "title",
        title: {}
      },
      "Date": {
        type: "date",
        date: {}
      },
      "Numéro Pièce": {
        type: "rich_text",
        rich_text: {}
      },
      "Compte Débit": {
        type: "rich_text",
        rich_text: {}
      },
      "Intitulé Compte Débit": {
        type: "rich_text",
        rich_text: {}
      },
      "Compte Crédit": {
        type: "rich_text",
        rich_text: {}
      },
      "Intitulé Compte Crédit": {
        type: "rich_text",
        rich_text: {}
      },
      "Montant": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Entité": {
        type: "relation",
        relation: {
          database_id: "ENTITE_GROUPE_ID"
        }
      },
      "Référence": {
        type: "rich_text",
        rich_text: {}
      },
      "Type Écriture": {
        type: "select",
        select: {
          options: [
            { name: "Facture fournisseur", color: "blue" },
            { name: "Facture client", color: "green" },
            { name: "Note de frais", color: "orange" },
            { name: "Banque", color: "purple" },
            { name: "TVA", color: "yellow" },
            { name: "Salaires", color: "pink" },
            { name: "À nouveau", color: "gray" },
            { name: "Régularisation", color: "red" }
          ]
        }
      },
      "Période": {
        type: "rich_text",
        rich_text: {}
      },
      "Exercice": {
        type: "number",
        number: {
          format: "number"
        }
      },
      "Validé": {
        type: "checkbox",
        checkbox: {}
      },
      "Validé Par": {
        type: "people",
        people: {}
      },
      "Date Validation": {
        type: "date",
        date: {}
      },
      "Source": {
        type: "relation",
        relation: {
          database_id: "DYNAMIC" // Peut pointer vers différentes bases
        }
      },
      "Notes": {
        type: "rich_text",
        rich_text: {}
      }
    }
  },

  // Base de données déclarations TVA
  DB_TVA_DECLARATIONS: {
    name: "DB-TVA-DECLARATIONS", 
    description: "Déclarations TVA trimestrielles et historique",
    properties: {
      "Période": {
        type: "title",
        title: {}
      },
      "Entité": {
        type: "relation",
        relation: {
          database_id: "ENTITE_GROUPE_ID"
        }
      },
      "Année": {
        type: "number",
        number: {
          format: "number"
        }
      },
      "Trimestre": {
        type: "select",
        select: {
          options: [
            { name: "Q1", color: "blue" },
            { name: "Q2", color: "green" },
            { name: "Q3", color: "orange" },
            { name: "Q4", color: "purple" }
          ]
        }
      },
      "Date Début": {
        type: "date",
        date: {}
      },
      "Date Fin": {
        type: "date",
        date: {}
      },
      "Date Échéance": {
        type: "date",
        date: {}
      },
      "CA Total": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "CA Taux Normal": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Collectée Normal": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "CA Taux Réduit": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Collectée Réduit": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "CA Hébergement": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Collectée Hébergement": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Total TVA Collectée": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Déductible Marchandises": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Déductible Services": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA Déductible Investissements": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Total TVA Déductible": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "TVA à Payer": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Crédit TVA": {
        type: "number",
        number: {
          format: "number_with_commas"
        }
      },
      "Statut": {
        type: "select",
        select: {
          options: [
            { name: "Brouillon", color: "gray" },
            { name: "En cours", color: "yellow" },
            { name: "Prête", color: "blue" },
            { name: "Soumise AFC", color: "orange" },
            { name: "Validée AFC", color: "green" },
            { name: "Payée", color: "purple" }
          ]
        }
      },
      "Date Déclaration": {
        type: "date",
        date: {}
      },
      "Numéro Déclaration AFC": {
        type: "rich_text",
        rich_text: {}
      },
      "Référence Paiement": {
        type: "rich_text",
        rich_text: {}
      },
      "Date Paiement": {
        type: "date",
        date: {}
      },
      "Détail Rubriques AFC": {
        type: "rich_text",
        rich_text: {}
      },
      "Export XML": {
        type: "files",
        files: {}
      },
      "Contrôles Effectués": {
        type: "rich_text",
        rich_text: {}
      },
      "Notes": {
        type: "rich_text",
        rich_text: {}
      }
    }
  }
};

// IDs des bases créées - CONNECTÉES AUX VRAIES BASES NOTION !
const SUPERADMIN_DB_IDS = {
  FACTURES_IN: "237adb95-3c6f-80de-9f92-c795334e5561", // DB-FACTURES-FOURNISSEURS
  NOTES_FRAIS: "237adb95-3c6f-80d2-8b88-eab97aa36ebf", // DB-NOTES-FRAIS  
  ECRITURES_COMPTABLES: "237adb95-3c6f-80b5-b6c3-ff7e37f9b2b3", // DB-ECRITURES-COMPTABLES
  TVA_DECLARATIONS: "237adb95-3c6f-801f-a746-c0f0560f8d67", // DB-TVA-DECLARATIONS
  TRANSACTIONS_BANCAIRES: "237adb95-3c6f-8036-9158-f5ca9a1c12e4", // DB-TRANSACTIONS-BANCAIRES
  ENTITE_GROUPE: "237adb95-3c6f-8041-896d-f9c037397a4e" // DB-ENTITES-GROUPE
};

// Export des configurations
if (typeof window !== 'undefined') {
  window.SUPERADMIN_DATABASES_CONFIG = SUPERADMIN_DATABASES_CONFIG;
  window.SUPERADMIN_DB_IDS = SUPERADMIN_DB_IDS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPERADMIN_DATABASES_CONFIG,
    SUPERADMIN_DB_IDS
  };
}