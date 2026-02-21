import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_URL = 'http://localhost:8055';
import 'dotenv/config';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections manquantes prioritaires depuis les anciens repos
const MISSING_COLLECTIONS = {
  // PHASE 1 - URGENT
  opportunities: {
    icon: 'trending_up',
    note: 'Pipeline commercial - prospects et opportunités',
    fields: {
      id: { type: 'uuid', primary_key: true },
      name: { type: 'string', required: true, note: 'Nom de l\'opportunité' },
      company_id: { type: 'uuid', note: 'Entreprise concernée' },
      contact_id: { type: 'uuid', note: 'Contact principal' },
      assigned_to: { type: 'uuid', note: 'Commercial assigné' },
      stage: { 
        type: 'string', 
        interface: 'select-dropdown',
        note: 'Étape du pipeline',
        options: {
          choices: [
            { text: 'Prospect', value: 'prospect' },
            { text: 'Qualifié', value: 'qualified' },
            { text: 'Proposition', value: 'proposal' },
            { text: 'Négociation', value: 'negotiation' },
            { text: 'Gagné', value: 'won' },
            { text: 'Perdu', value: 'lost' }
          ]
        }
      },
      value: { type: 'decimal', note: 'Valeur estimée' },
      probability: { type: 'integer', note: 'Probabilité de concrétisation (%)' },
      expected_close_date: { type: 'date', note: 'Date de clôture prévue' },
      source: { 
        type: 'string',
        interface: 'select-dropdown',
        note: 'Source de l\'opportunité',
        options: {
          choices: [
            { text: 'Site web', value: 'website' },
            { text: 'Référencement', value: 'referral' },
            { text: 'LinkedIn', value: 'linkedin' },
            { text: 'Email', value: 'email' },
            { text: 'Téléphone', value: 'phone' },
            { text: 'Salon', value: 'event' }
          ]
        }
      },
      description: { type: 'text', interface: 'input-multiline', note: 'Description détaillée' },
      next_action: { type: 'text', note: 'Prochaine action à effectuer' },
      next_action_date: { type: 'date', note: 'Date de la prochaine action' },
      owner_company: { type: 'string', default_value: 'HYPERVISUAL' },
      date_created: { type: 'timestamp', special: ['date-created'] },
      date_updated: { type: 'timestamp', special: ['date-updated'] }
    }
  },
  
  tax_declarations: {
    icon: 'receipt_long',
    note: 'Déclarations fiscales et TVA',
    fields: {
      id: { type: 'uuid', primary_key: true },
      declaration_period: { type: 'string', required: true, note: 'Période (ex: 2024-Q1)' },
      tax_type: {
        type: 'string',
        interface: 'select-dropdown',
        required: true,
        note: 'Type de taxe',
        options: {
          choices: [
            { text: 'TVA', value: 'vat' },
            { text: 'IS - Impôt sur les sociétés', value: 'corporate_tax' },
            { text: 'CET - Contribution économique territoriale', value: 'cet' },
            { text: 'CVAE - Cotisation sur la valeur ajoutée', value: 'cvae' }
          ]
        }
      },
      amount_declared: { type: 'decimal', required: true, note: 'Montant déclaré' },
      amount_paid: { type: 'decimal', note: 'Montant payé' },
      status: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Statut de la déclaration',
        options: {
          choices: [
            { text: 'Brouillon', value: 'draft' },
            { text: 'Soumise', value: 'submitted' },
            { text: 'Acceptée', value: 'accepted' },
            { text: 'Payée', value: 'paid' },
            { text: 'En retard', value: 'overdue' }
          ]
        }
      },
      due_date: { type: 'date', required: true, note: 'Date limite' },
      payment_date: { type: 'date', note: 'Date de paiement' },
      reference_number: { type: 'string', note: 'Numéro de référence fiscal' },
      attachments: { type: 'alias', special: ['files'], note: 'Documents joints' },
      owner_company: { type: 'string', default_value: 'HYPERVISUAL' },
      date_created: { type: 'timestamp', special: ['date-created'] },
      date_updated: { type: 'timestamp', special: ['date-updated'] }
    }
  },

  cash_forecasts: {
    icon: 'trending_up',
    note: 'Prévisions de trésorerie',
    fields: {
      id: { type: 'uuid', primary_key: true },
      forecast_date: { type: 'date', required: true, note: 'Date de la prévision' },
      forecast_amount: { type: 'decimal', required: true, note: 'Montant prévu' },
      actual_amount: { type: 'decimal', note: 'Montant réel (une fois connu)' },
      variance: { type: 'decimal', note: 'Écart prévision/réel' },
      category: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Catégorie',
        options: {
          choices: [
            { text: 'Recettes - Factures clients', value: 'client_invoices' },
            { text: 'Dépenses - Fournisseurs', value: 'suppliers' },
            { text: 'Dépenses - Salaires', value: 'payroll' },
            { text: 'Dépenses - Charges', value: 'expenses' },
            { text: 'Investissements', value: 'investments' },
            { text: 'Financements', value: 'financing' }
          ]
        }
      },
      project_id: { type: 'uuid', note: 'Projet associé (optionnel)' },
      confidence_level: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Niveau de confiance',
        options: {
          choices: [
            { text: 'Très élevé (90-100%)', value: 'very_high' },
            { text: 'Élevé (70-90%)', value: 'high' },
            { text: 'Moyen (50-70%)', value: 'medium' },
            { text: 'Faible (30-50%)', value: 'low' },
            { text: 'Très faible (<30%)', value: 'very_low' }
          ]
        }
      },
      notes: { type: 'text', interface: 'input-multiline', note: 'Notes et justifications' },
      owner_company: { type: 'string', default_value: 'HYPERVISUAL' },
      date_created: { type: 'timestamp', special: ['date-created'] },
      date_updated: { type: 'timestamp', special: ['date-updated'] }
    }
  },

  milestones: {
    icon: 'flag',
    note: 'Jalons et étapes importantes des projets',
    fields: {
      id: { type: 'uuid', primary_key: true },
      project_id: { type: 'uuid', required: true, note: 'Projet concerné' },
      name: { type: 'string', required: true, note: 'Nom du jalon' },
      description: { type: 'text', interface: 'input-multiline', note: 'Description détaillée' },
      due_date: { type: 'date', required: true, note: 'Date prévue' },
      completion_date: { type: 'date', note: 'Date de réalisation' },
      status: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Statut du jalon',
        options: {
          choices: [
            { text: 'Planifié', value: 'planned' },
            { text: 'En cours', value: 'in_progress' },
            { text: 'Terminé', value: 'completed' },
            { text: 'En retard', value: 'overdue' },
            { text: 'Annulé', value: 'cancelled' }
          ]
        }
      },
      completion_percentage: { type: 'integer', note: 'Pourcentage de completion (0-100)' },
      priority: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Priorité',
        options: {
          choices: [
            { text: 'Critique', value: 'critical' },
            { text: 'Haute', value: 'high' },
            { text: 'Moyenne', value: 'medium' },
            { text: 'Basse', value: 'low' }
          ]
        }
      },
      assigned_to: { type: 'uuid', note: 'Responsable du jalon' },
      deliverables: { type: 'json', interface: 'list', note: 'Liste des livrables' },
      budget: { type: 'decimal', note: 'Budget alloué' },
      actual_cost: { type: 'decimal', note: 'Coût réel' },
      owner_company: { type: 'string', default_value: 'HYPERVISUAL' },
      date_created: { type: 'timestamp', special: ['date-created'] },
      date_updated: { type: 'timestamp', special: ['date-updated'] }
    }
  },

  // PHASE 2 - IMPORTANTE
  campaigns: {
    icon: 'campaign',
    note: 'Campagnes marketing et communication',
    fields: {
      id: { type: 'uuid', primary_key: true },
      name: { type: 'string', required: true, note: 'Nom de la campagne' },
      type: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Type de campagne',
        options: {
          choices: [
            { text: 'Email', value: 'email' },
            { text: 'Réseaux sociaux', value: 'social' },
            { text: 'Google Ads', value: 'google_ads' },
            { text: 'LinkedIn Ads', value: 'linkedin_ads' },
            { text: 'Événement', value: 'event' },
            { text: 'Webinar', value: 'webinar' },
            { text: 'Content Marketing', value: 'content' }
          ]
        }
      },
      status: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Statut de la campagne',
        options: {
          choices: [
            { text: 'Planifiée', value: 'planned' },
            { text: 'En cours', value: 'active' },
            { text: 'Terminée', value: 'completed' },
            { text: 'En pause', value: 'paused' },
            { text: 'Annulée', value: 'cancelled' }
          ]
        }
      },
      budget: { type: 'decimal', note: 'Budget alloué' },
      actual_cost: { type: 'decimal', note: 'Coût réel' },
      start_date: { type: 'date', note: 'Date de début' },
      end_date: { type: 'date', note: 'Date de fin' },
      target_audience: { type: 'text', interface: 'input-multiline', note: 'Audience cible' },
      objectives: { type: 'text', interface: 'input-multiline', note: 'Objectifs de la campagne' },
      conversion_rate: { type: 'decimal', note: 'Taux de conversion (%)' },
      impressions: { type: 'integer', note: 'Nombre d\'impressions' },
      clicks: { type: 'integer', note: 'Nombre de clics' },
      leads: { type: 'integer', note: 'Leads générés' },
      sales: { type: 'integer', note: 'Ventes générées' },
      roi: { type: 'decimal', note: 'Retour sur investissement (%)' },
      mautic_id: { type: 'string', note: 'ID campagne Mautic' },
      owner_company: { type: 'string', default_value: 'HYPERVISUAL' },
      date_created: { type: 'timestamp', special: ['date-created'] },
      date_updated: { type: 'timestamp', special: ['date-updated'] }
    }
  },

  faq: {
    icon: 'help_outline',
    note: 'Questions fréquemment posées',
    fields: {
      id: { type: 'uuid', primary_key: true },
      question: { type: 'string', required: true, note: 'Question' },
      answer: { type: 'text', interface: 'input-rich-text-html', required: true, note: 'Réponse détaillée' },
      category: {
        type: 'string',
        interface: 'select-dropdown',
        note: 'Catégorie',
        options: {
          choices: [
            { text: 'Général', value: 'general' },
            { text: 'Facturation', value: 'billing' },
            { text: 'Support technique', value: 'technical' },
            { text: 'Projets', value: 'projects' },
            { text: 'Compte utilisateur', value: 'account' }
          ]
        }
      },
      priority: { type: 'integer', note: 'Ordre d\'affichage' },
      is_published: { type: 'boolean', default_value: true, note: 'Publié sur le site' },
      views: { type: 'integer', default_value: 0, note: 'Nombre de vues' },
      helpful_count: { type: 'integer', default_value: 0, note: 'Votes utiles' },
      tags: { type: 'json', interface: 'tags', note: 'Mots-clés' },
      owner_company: { type: 'string', default_value: 'HYPERVISUAL' },
      date_created: { type: 'timestamp', special: ['date-created'] },
      date_updated: { type: 'timestamp', special: ['date-updated'] }
    }
  }
};

class CollectionCreator {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      collections_created: [],
      collections_failed: [],
      fields_created: 0,
      relations_created: [],
      summary: {
        total_collections: Object.keys(MISSING_COLLECTIONS).length,
        created: 0,
        failed: 0
      }
    };
  }

  async createCollection(collectionName, config) {
    console.log(`\n📊 Création de la collection: ${collectionName}`);
    
    try {
      // 1. Créer la collection
      const collectionData = {
        collection: collectionName,
        meta: {
          collection: collectionName,
          icon: config.icon,
          note: config.note,
          display_template: null,
          hidden: false,
          singleton: false,
          translations: null,
          archive_field: null,
          archive_app_filter: true,
          archive_value: null,
          unarchive_value: null,
          sort_field: null,
          accountability: 'all',
          color: null,
          item_duplication_fields: null,
          sort: null,
          group: null,
          collapse: 'open'
        },
        schema: {
          name: collectionName
        }
      };

      await client.post('/collections', collectionData);
      console.log(`   ✅ Collection créée: ${collectionName}`);
      
      // 2. Créer les champs
      let fieldsCount = 0;
      for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        try {
          await this.createField(collectionName, fieldName, fieldConfig);
          fieldsCount++;
        } catch (error) {
          console.log(`   ⚠️  Erreur champ ${fieldName}: ${error.message}`);
        }
      }

      this.report.collections_created.push({
        collection: collectionName,
        fields_count: fieldsCount,
        icon: config.icon,
        note: config.note
      });
      this.report.summary.created++;
      this.report.fields_created += fieldsCount;
      
      console.log(`   ✅ Collection ${collectionName} terminée (${fieldsCount} champs)`);
      
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
      console.log(`   ❌ Erreur collection ${collectionName}: ${errorMsg}`);
      
      this.report.collections_failed.push({
        collection: collectionName,
        error: errorMsg
      });
      this.report.summary.failed++;
    }
  }

  async createField(collectionName, fieldName, fieldConfig) {
    const fieldData = {
      collection: collectionName,
      field: fieldName,
      type: fieldConfig.type,
      schema: {
        is_primary_key: fieldConfig.primary_key || false,
        is_nullable: !fieldConfig.required,
        default_value: fieldConfig.default_value || null,
        is_unique: fieldConfig.unique || false
      },
      meta: {
        interface: fieldConfig.interface || this.getDefaultInterface(fieldConfig.type),
        special: fieldConfig.special || null,
        required: fieldConfig.required || false,
        readonly: fieldConfig.readonly || false,
        hidden: fieldConfig.hidden || false,
        sort: null,
        width: 'full',
        options: fieldConfig.options || null,
        translations: null,
        note: fieldConfig.note || null
      }
    };

    await client.post('/fields', fieldData);
    // console.log(`     ✅ Champ créé: ${fieldName}`);
  }

  getDefaultInterface(type) {
    const interfaces = {
      'uuid': 'input',
      'string': 'input',
      'text': 'input-multiline',
      'integer': 'input',
      'decimal': 'input',
      'boolean': 'boolean',
      'date': 'datetime',
      'timestamp': 'datetime',
      'json': 'input-code',
      'alias': 'file'
    };
    
    return interfaces[type] || 'input';
  }

  async createCriticalRelations() {
    console.log('\n🔗 Création des relations critiques...');
    
    const relations = [
      {
        collection: 'opportunities',
        field: 'company_id',
        related_collection: 'companies',
        note: 'Entreprise de l\'opportunité'
      },
      {
        collection: 'opportunities', 
        field: 'contact_id',
        related_collection: 'people',
        note: 'Contact principal'
      },
      {
        collection: 'opportunities',
        field: 'assigned_to',
        related_collection: 'directus_users',
        note: 'Commercial assigné'
      },
      {
        collection: 'milestones',
        field: 'project_id', 
        related_collection: 'projects',
        note: 'Projet du jalon'
      },
      {
        collection: 'milestones',
        field: 'assigned_to',
        related_collection: 'directus_users',
        note: 'Responsable du jalon'
      },
      {
        collection: 'cash_forecasts',
        field: 'project_id',
        related_collection: 'projects', 
        note: 'Projet associé (optionnel)'
      }
    ];

    for (const relation of relations) {
      try {
        const relationData = {
          collection: relation.collection,
          field: relation.field,
          related_collection: relation.related_collection,
          meta: {
            many_collection: relation.collection,
            many_field: relation.field,
            one_collection: relation.related_collection,
            one_field: null,
            one_collection_field: null,
            one_allowed_collections: null,
            junction_field: null,
            sort_field: null,
            one_deselect_action: 'nullify'
          },
          schema: {
            on_delete: 'SET NULL'
          }
        };

        await client.post('/relations', relationData);
        console.log(`   ✅ Relation: ${relation.collection}.${relation.field} -> ${relation.related_collection}`);
        
        this.report.relations_created.push(relation);
        
      } catch (error) {
        console.log(`   ❌ Relation ${relation.collection}.${relation.field}: ${error.message}`);
      }
    }
  }

  async saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, '..', '..', '..', 'audit-results', `collections-creation-${timestamp}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n✅ Rapport sauvegardé: ${reportPath}`);
  }

  async run() {
    console.log('🚀 Début de création des collections manquantes...\n');
    
    try {
      // Créer toutes les collections
      for (const [collectionName, config] of Object.entries(MISSING_COLLECTIONS)) {
        await this.createCollection(collectionName, config);
        // Petite pause pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Créer les relations
      await this.createCriticalRelations();
      
      // Sauvegarder le rapport
      await this.saveReport();

      // Afficher le résumé
      console.log('\n' + '='.repeat(60));
      console.log('📊 RÉSUMÉ DE CRÉATION DES COLLECTIONS');
      console.log('='.repeat(60));
      console.log(`Collections créées: ${this.report.summary.created}/${this.report.summary.total_collections}`);
      console.log(`Champs créés: ${this.report.fields_created}`);
      console.log(`Relations créées: ${this.report.relations_created.length}`);
      console.log(`Échecs: ${this.report.summary.failed}`);
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ Erreur fatale:', error);
    }
  }
}

// Exécution
const creator = new CollectionCreator();
creator.run().catch(console.error);