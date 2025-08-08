import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Champs à ajouter depuis les anciens repos
const FIELDS_TO_ADD = {
  companies: {
    // Identification légale
    vat_number: { type: 'string', interface: 'input', required: false, note: 'Numéro de TVA' },
    registration_number: { type: 'string', interface: 'input', required: false, note: 'Numéro SIRET/SIREN' },
    legal_name: { type: 'string', interface: 'input', required: false, note: 'Raison sociale officielle' },
    trade_name: { type: 'string', interface: 'input', required: false, note: 'Nom commercial' },
    
    // Adresses (JSON pour flexibilité)
    billing_address: { type: 'json', interface: 'input-code', required: false, note: 'Adresse de facturation (JSON)' },
    shipping_address: { type: 'json', interface: 'input-code', required: false, note: 'Adresse de livraison (JSON)' },
    
    // Données financières
    credit_limit: { type: 'decimal', interface: 'input', required: false, note: 'Limite de crédit accordée' },
    payment_terms: { type: 'integer', interface: 'input', required: false, note: 'Délai de paiement en jours' },
    discount_rate: { type: 'decimal', interface: 'input', required: false, note: 'Taux de remise habituel (%)' },
    payment_behavior: { 
      type: 'string', 
      interface: 'select-dropdown',
      required: false,
      note: 'Comportement de paiement',
      options: {
        choices: [
          { text: 'Excellent', value: 'excellent' },
          { text: 'Bon', value: 'good' },
          { text: 'Moyen', value: 'average' },
          { text: 'Retardataire', value: 'late' },
          { text: 'Problématique', value: 'problematic' }
        ]
      }
    },
    
    // CRM
    customer_since: { type: 'date', interface: 'datetime', required: false, note: 'Client depuis le' },
    lifetime_value: { type: 'decimal', interface: 'input', required: false, note: 'Valeur client (CLV)' },
    risk_level: {
      type: 'string',
      interface: 'select-dropdown',
      required: false,
      note: 'Niveau de risque',
      options: {
        choices: [
          { text: 'Faible', value: 'low' },
          { text: 'Moyen', value: 'medium' },
          { text: 'Élevé', value: 'high' },
          { text: 'Critique', value: 'critical' }
        ]
      }
    },
    
    // Intégrations
    mautic_id: { type: 'string', interface: 'input', required: false, note: 'ID Mautic' },
    invoice_ninja_id: { type: 'string', interface: 'input', required: false, note: 'ID Invoice Ninja' },
    erpnext_id: { type: 'string', interface: 'input', required: false, note: 'ID ERPNext' }
  },
  
  client_invoices: {
    // Fiscalité avancée
    tax_rate: { type: 'decimal', interface: 'input', required: false, note: 'Taux de TVA (%)' },
    tax_type: { 
      type: 'string', 
      interface: 'select-dropdown',
      required: false,
      note: 'Type de TVA',
      options: {
        choices: [
          { text: 'TVA normale', value: 'normal' },
          { text: 'TVA réduite', value: 'reduced' },
          { text: 'TVA super-réduite', value: 'super_reduced' },
          { text: 'Exonéré', value: 'exempt' },
          { text: 'Autoliquidation', value: 'reverse_charge' }
        ]
      }
    },
    reverse_charge: { type: 'boolean', interface: 'boolean', required: false, note: 'Autoliquidation de TVA' },
    intracom_vat_number: { type: 'string', interface: 'input', required: false, note: 'N° TVA intracommunautaire' },
    
    // Documents
    pdf_url: { type: 'string', interface: 'input', required: false, note: 'URL du PDF de facture' },
    xml_url: { type: 'string', interface: 'input', required: false, note: 'URL du fichier XML (factur-x)' },
    
    // Comptabilité analytique
    accounting_code: { type: 'string', interface: 'input', required: false, note: 'Code comptable' },
    cost_center: { type: 'string', interface: 'input', required: false, note: 'Centre de coût' },
    profit_center: { type: 'string', interface: 'input', required: false, note: 'Centre de profit' },
    
    // Intégrations
    invoice_ninja_id: { type: 'string', interface: 'input', required: false, note: 'ID Invoice Ninja' },
    erpnext_id: { type: 'string', interface: 'input', required: false, note: 'ID ERPNext' }
  },
  
  bank_transactions: {
    // API Revolut
    revolut_id: { type: 'string', interface: 'input', required: false, note: 'ID transaction Revolut' },
    counterparty_iban: { type: 'string', interface: 'input', required: false, note: 'IBAN contrepartie' },
    counterparty_bic: { type: 'string', interface: 'input', required: false, note: 'BIC contrepartie' },
    balance_after: { type: 'decimal', interface: 'input', required: false, note: 'Solde après transaction' },
    
    // Fiscalité
    tax_relevant: { type: 'boolean', interface: 'boolean', required: false, note: 'Pertinent pour la TVA' },
    vat_amount: { type: 'decimal', interface: 'input', required: false, note: 'Montant TVA récupérable' },
    vat_rate: { type: 'decimal', interface: 'input', required: false, note: 'Taux TVA (%)' },
    
    // Catégorisation
    expense_category: {
      type: 'string',
      interface: 'select-dropdown',
      required: false,
      note: 'Catégorie de dépense',
      options: {
        choices: [
          { text: 'Frais généraux', value: 'general' },
          { text: 'Marketing', value: 'marketing' },
          { text: 'Personnel', value: 'personnel' },
          { text: 'Équipement', value: 'equipment' },
          { text: 'Voyage', value: 'travel' },
          { text: 'Formation', value: 'training' }
        ]
      }
    },
    business_purpose: { type: 'text', interface: 'input-multiline', required: false, note: 'Justification métier' }
  },
  
  projects: {
    // Gestion avancée
    project_code: { type: 'string', interface: 'input', required: false, note: 'Code projet unique' },
    priority: {
      type: 'string',
      interface: 'select-dropdown',
      required: false,
      note: 'Priorité du projet',
      options: {
        choices: [
          { text: 'Critique', value: 'critical' },
          { text: 'Haute', value: 'high' },
          { text: 'Moyenne', value: 'medium' },
          { text: 'Basse', value: 'low' }
        ]
      }
    },
    health_status: {
      type: 'string',
      interface: 'select-dropdown',
      required: false,
      note: 'Santé du projet',
      options: {
        choices: [
          { text: '🟢 Vert', value: 'green' },
          { text: '🟡 Jaune', value: 'yellow' },
          { text: '🔴 Rouge', value: 'red' },
          { text: '⚫ Noir', value: 'black' }
        ]
      }
    },
    
    // Finance projet
    actual_cost: { type: 'decimal', interface: 'input', required: false, note: 'Coût réel' },
    margin_percentage: { type: 'decimal', interface: 'input', required: false, note: 'Marge (%)' },
    
    // Intégrations
    erpnext_id: { type: 'string', interface: 'input', required: false, note: 'ID ERPNext' },
    github_repo: { type: 'string', interface: 'input', required: false, note: 'Repository GitHub' }
  },
  
  people: {
    // Détails professionnels
    employee_id: { type: 'string', interface: 'input', required: false, note: 'ID employé' },
    job_title: { type: 'string', interface: 'input', required: false, note: 'Intitulé du poste' },
    hire_date: { type: 'date', interface: 'datetime', required: false, note: 'Date d\'embauche' },
    salary: { type: 'decimal', interface: 'input', required: false, note: 'Salaire' },
    
    // Contact étendu
    linkedin_url: { type: 'string', interface: 'input', required: false, note: 'Profil LinkedIn' },
    timezone: { type: 'string', interface: 'input', required: false, note: 'Fuseau horaire' },
    languages: { type: 'json', interface: 'tags', required: false, note: 'Langues parlées' },
    
    // Intégrations
    mautic_contact_id: { type: 'string', interface: 'input', required: false, note: 'ID contact Mautic' }
  }
};

class FieldsCompleter {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      fields_added: [],
      fields_failed: [],
      collections_processed: 0,
      summary: {
        total_fields: 0,
        added: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  async addFieldsToCollection(collectionName, fields) {
    console.log(`\n📊 Traitement de la collection: ${collectionName}`);
    
    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      try {
        // Vérifier si le champ existe déjà
        try {
          await client.get(`/fields/${collectionName}/${fieldName}`);
          console.log(`   ⏭️  Champ ${fieldName} existe déjà - ignoré`);
          this.report.summary.skipped++;
          continue;
        } catch (e) {
          // Le champ n'existe pas, on peut l'ajouter
        }

        const fieldData = {
          collection: collectionName,
          field: fieldName,
          type: fieldConfig.type,
          schema: {
            is_nullable: !fieldConfig.required,
            default_value: null
          },
          meta: {
            interface: fieldConfig.interface,
            special: null,
            required: fieldConfig.required || false,
            readonly: false,
            hidden: false,
            sort: null,
            width: 'full',
            options: fieldConfig.options || null,
            translations: null,
            note: fieldConfig.note
          }
        };

        await client.post('/fields', fieldData);
        console.log(`   ✅ Champ ajouté: ${fieldName} (${fieldConfig.type})`);
        
        this.report.fields_added.push({
          collection: collectionName,
          field: fieldName,
          type: fieldConfig.type,
          note: fieldConfig.note
        });
        this.report.summary.added++;
        
      } catch (error) {
        const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
        console.log(`   ❌ Erreur pour ${fieldName}: ${errorMsg}`);
        
        this.report.fields_failed.push({
          collection: collectionName,
          field: fieldName,
          error: errorMsg
        });
        this.report.summary.failed++;
      }
    }
  }

  async processAllCollections() {
    console.log('🚀 Début du traitement des champs legacy...\n');
    
    for (const [collectionName, fields] of Object.entries(FIELDS_TO_ADD)) {
      this.report.summary.total_fields += Object.keys(fields).length;
      
      try {
        // Vérifier que la collection existe
        await client.get(`/collections/${collectionName}`);
        
        await this.addFieldsToCollection(collectionName, fields);
        this.report.collections_processed++;
        
      } catch (error) {
        console.log(`❌ Collection ${collectionName} non trouvée ou inaccessible`);
        
        // Marquer tous les champs comme échoués
        for (const fieldName of Object.keys(fields)) {
          this.report.fields_failed.push({
            collection: collectionName,
            field: fieldName,
            error: 'Collection not found or inaccessible'
          });
          this.report.summary.failed++;
        }
      }
    }
  }

  async saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, '..', '..', '..', 'audit-results', `fields-completion-${timestamp}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n✅ Rapport sauvegardé: ${reportPath}`);
  }

  generateMarkdownReport() {
    let md = `# 📊 RAPPORT DE COMPLÉTION DES CHAMPS LEGACY\n`;
    md += `## Date : ${new Date().toLocaleString('fr-FR')}\n\n`;

    md += `## 📈 RÉSUMÉ\n`;
    md += `- Collections traitées : ${this.report.collections_processed}/${Object.keys(FIELDS_TO_ADD).length}\n`;
    md += `- Champs ajoutés : ${this.report.summary.added}\n`;
    md += `- Champs ignorés (existants) : ${this.report.summary.skipped}\n`;
    md += `- Champs en erreur : ${this.report.summary.failed}\n\n`;

    if (this.report.fields_added.length > 0) {
      md += `## ✅ CHAMPS AJOUTÉS AVEC SUCCÈS\n\n`;
      md += `| Collection | Champ | Type | Description |\n`;
      md += `|------------|-------|------|-------------|\n`;
      
      this.report.fields_added.forEach(field => {
        md += `| ${field.collection} | ${field.field} | ${field.type} | ${field.note} |\n`;
      });
      md += `\n`;
    }

    if (this.report.fields_failed.length > 0) {
      md += `## ❌ CHAMPS EN ERREUR\n\n`;
      md += `| Collection | Champ | Erreur |\n`;
      md += `|------------|-------|--------|\n`;
      
      this.report.fields_failed.forEach(field => {
        md += `| ${field.collection} | ${field.field} | ${field.error} |\n`;
      });
    }

    return md;
  }

  async saveMarkdownReport() {
    const mdContent = this.generateMarkdownReport();
    const mdPath = path.join(__dirname, '..', '..', '..', 'audit-results', 'FIELDS_COMPLETION_REPORT.md');
    
    await fs.writeFile(mdPath, mdContent);
    console.log(`✅ Rapport Markdown sauvegardé: ${mdPath}`);
  }

  async run() {
    try {
      await this.processAllCollections();
      await this.saveReport();
      await this.saveMarkdownReport();

      // Afficher le résumé
      console.log('\n' + '='.repeat(60));
      console.log('📊 RÉSUMÉ DE LA COMPLÉTION DES CHAMPS');
      console.log('='.repeat(60));
      console.log(`Collections traitées: ${this.report.collections_processed}`);
      console.log(`Champs ajoutés: ${this.report.summary.added}`);
      console.log(`Champs ignorés: ${this.report.summary.skipped}`);
      console.log(`Champs en erreur: ${this.report.summary.failed}`);
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ Erreur fatale:', error);
    }
  }
}

// Exécution
const completer = new FieldsCompleter();
completer.run().catch(console.error);