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

class CollectionFixer {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      fixes_applied: [],
      fixes_failed: [],
      summary: {
        total_issues: 0,
        fixed: 0,
        failed: 0
      }
    };
  }

  async loadAuditReport() {
    try {
      const auditPath = path.join(__dirname, '..', '..', '..', 'audit-results');
      const files = await fs.readdir(auditPath);
      const jsonFiles = files.filter(f => f.startsWith('audit-report-') && f.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        throw new Error('Aucun rapport d\'audit trouvé');
      }

      // Prendre le plus récent
      jsonFiles.sort().reverse();
      const latestReport = jsonFiles[0];
      
      console.log(`📄 Chargement du rapport: ${latestReport}`);
      const reportContent = await fs.readFile(path.join(auditPath, latestReport), 'utf-8');
      return JSON.parse(reportContent);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du rapport:', error.message);
      throw error;
    }
  }

  async fixMissingFields() {
    console.log('\n🔧 Correction des champs manquants...');
    
    const fieldsToAdd = {
      bank_transactions: [
        { field: 'transaction_date', type: 'date', required: true },
        { field: 'transaction_type', type: 'string', required: true }
      ],
      expenses: [
        { field: 'expense_date', type: 'date', required: true }
      ],
      kpis: [
        { field: 'metric_name', type: 'string', required: true },
        { field: 'value', type: 'float', required: true },
        { field: 'date', type: 'date', required: true }
      ],
      payments: [
        { field: 'payment_date', type: 'date', required: true }
      ]
    };

    for (const [collection, fields] of Object.entries(fieldsToAdd)) {
      console.log(`\n📊 Collection: ${collection}`);
      
      for (const fieldConfig of fields) {
        try {
          const fieldData = {
            collection: collection,
            field: fieldConfig.field,
            type: fieldConfig.type,
            schema: {
              is_nullable: !fieldConfig.required,
              default_value: fieldConfig.type === 'date' ? 'now()' : null
            },
            meta: {
              interface: fieldConfig.type === 'date' ? 'datetime' : 'input',
              special: null,
              required: fieldConfig.required,
              readonly: false,
              hidden: false,
              sort: null,
              width: 'full',
              translations: null,
              note: null
            }
          };

          await client.post('/fields', fieldData);
          console.log(`   ✅ Champ ajouté: ${fieldConfig.field}`);
          
          this.report.fixes_applied.push({
            type: 'field_added',
            collection,
            field: fieldConfig.field
          });
        } catch (error) {
          console.log(`   ❌ Erreur pour ${fieldConfig.field}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
          this.report.fixes_failed.push({
            type: 'field_addition',
            collection,
            field: fieldConfig.field,
            error: error.response?.data?.errors?.[0]?.message || error.message
          });
        }
      }
    }
  }

  async fixMissingRelations() {
    console.log('\n🔗 Correction des relations manquantes...');
    
    const relationsToCreate = [
      {
        collection: 'projects',
        field: 'client_id',
        related_collection: 'companies',
        type: 'many_to_one'
      },
      {
        collection: 'projects',
        field: 'project_manager_id',
        related_collection: 'people',
        type: 'many_to_one'
      },
      {
        collection: 'client_invoices',
        field: 'project_id',
        related_collection: 'projects',
        type: 'many_to_one'
      },
      {
        collection: 'client_invoices',
        field: 'contact_id',
        related_collection: 'people',
        type: 'many_to_one'
      },
      {
        collection: 'deliverables',
        field: 'reviewed_by',
        related_collection: 'people',
        type: 'many_to_one'
      },
      {
        collection: 'people',
        field: 'manager_id',
        related_collection: 'people',
        type: 'many_to_one'
      },
      {
        collection: 'people',
        field: 'department_id',
        related_collection: 'departments',
        type: 'many_to_one'
      },
      {
        collection: 'people',
        field: 'team_id',
        related_collection: 'teams',
        type: 'many_to_one'
      },
      {
        collection: 'payments',
        field: 'supplier_invoice_id',
        related_collection: 'supplier_invoices',
        type: 'many_to_one'
      }
    ];

    for (const relation of relationsToCreate) {
      try {
        const relationData = {
          collection: relation.collection,
          field: relation.field,
          related_collection: relation.related_collection,
          schema: {
            on_delete: 'SET NULL'
          },
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
          }
        };

        await client.post('/relations', relationData);
        console.log(`✅ Relation créée: ${relation.collection}.${relation.field} -> ${relation.related_collection}`);
        
        this.report.fixes_applied.push({
          type: 'relation_created',
          ...relation
        });
      } catch (error) {
        const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
        console.log(`❌ Erreur relation ${relation.collection}.${relation.field}: ${errorMsg}`);
        
        this.report.fixes_failed.push({
          type: 'relation_creation',
          ...relation,
          error: errorMsg
        });
      }
    }
  }

  async updateNullOwnerCompany() {
    console.log('\n🏢 Mise à jour des enregistrements sans owner_company...');
    
    // Pour la collection budgets qui a 53 enregistrements sans owner_company
    try {
      const response = await client.patch('/items/budgets', {
        owner_company: 'HYPERVISUAL'
      }, {
        params: {
          filter: {
            owner_company: {
              _null: true
            }
          }
        }
      });
      
      console.log(`✅ Budgets mis à jour: ${response.data.data?.length || 'tous'} enregistrements`);
      
      this.report.fixes_applied.push({
        type: 'owner_company_updated',
        collection: 'budgets',
        count: response.data.data?.length || 53
      });
    } catch (error) {
      console.log(`❌ Erreur mise à jour budgets: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      
      this.report.fixes_failed.push({
        type: 'owner_company_update',
        collection: 'budgets',
        error: error.response?.data?.errors?.[0]?.message || error.message
      });
    }
  }

  async createMissingOwnerCompanyField() {
    console.log('\n🏢 Ajout du champ owner_company à la collection owner_companies...');
    
    try {
      const fieldData = {
        collection: 'owner_companies',
        field: 'owner_company',
        type: 'string',
        schema: {
          max_length: 50,
          default_value: 'HYPERVISUAL',
          is_nullable: false
        },
        meta: {
          interface: 'select-dropdown',
          special: null,
          required: true,
          readonly: false,
          hidden: false,
          sort: null,
          width: 'full',
          options: {
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
              { text: 'DAINAMICS', value: 'DAINAMICS' },
              { text: 'LEXAIA', value: 'LEXAIA' },
              { text: 'ENKI_REALTY', value: 'ENKI_REALTY' },
              { text: 'TAKEOUT', value: 'TAKEOUT' }
            ]
          },
          translations: null,
          note: 'Entreprise propriétaire'
        }
      };

      await client.post('/fields', fieldData);
      console.log('✅ Champ owner_company ajouté à owner_companies');
      
      this.report.fixes_applied.push({
        type: 'field_added',
        collection: 'owner_companies',
        field: 'owner_company'
      });
      
      // Mettre à jour les 5 enregistrements existants
      const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
      for (const company of companies) {
        try {
          await client.patch(`/items/owner_companies`, {
            owner_company: company
          }, {
            params: {
              filter: {
                code: {
                  _eq: company
                }
              }
            }
          });
        } catch (e) {
          console.log(`⚠️  Impossible de mettre à jour ${company}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur ajout owner_company: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      
      this.report.fixes_failed.push({
        type: 'field_addition',
        collection: 'owner_companies',
        field: 'owner_company',
        error: error.response?.data?.errors?.[0]?.message || error.message
      });
    }
  }

  async saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, '..', '..', '..', 'audit-results', `fix-report-${timestamp}.json`);
    
    this.report.summary.total_issues = this.report.fixes_applied.length + this.report.fixes_failed.length;
    this.report.summary.fixed = this.report.fixes_applied.length;
    this.report.summary.failed = this.report.fixes_failed.length;
    
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n✅ Rapport de correction sauvegardé: ${reportPath}`);
  }

  async run() {
    console.log('🚀 Démarrage des corrections automatiques...\n');
    
    try {
      // Charger le rapport d'audit
      const auditReport = await this.loadAuditReport();
      console.log(`📊 Rapport chargé: ${auditReport.summary.critical_issues.length} problèmes critiques trouvés`);
      
      // Appliquer les corrections
      await this.fixMissingFields();
      await this.fixMissingRelations();
      await this.updateNullOwnerCompany();
      await this.createMissingOwnerCompanyField();
      
      // Sauvegarder le rapport
      await this.saveReport();
      
      // Afficher le résumé
      console.log('\n' + '='.repeat(60));
      console.log('📊 RÉSUMÉ DES CORRECTIONS');
      console.log('='.repeat(60));
      console.log(`Total de problèmes traités: ${this.report.summary.total_issues}`);
      console.log(`Corrections réussies: ${this.report.summary.fixed}`);
      console.log(`Corrections échouées: ${this.report.summary.failed}`);
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ Erreur fatale:', error);
    }
  }
}

// Exécution
const fixer = new CollectionFixer();
fixer.run().catch(console.error);