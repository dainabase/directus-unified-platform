#!/usr/bin/env node

/**
 * Script pour corriger les 8 collections virtuelles restantes
 * Collections: providers, client_invoices, supplier_invoices, expenses, 
 *              bank_transactions, accounting_entries, support_tickets, subscriptions
 */

const axios = require('axios');

// Configuration
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'hHKnrW949zcwx2372KH2AjwDyROAjgZ2';

// Client Directus
const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections à corriger avec leurs définitions
const collectionsToFix = [
  {
    collection: 'providers',
    meta: {
      icon: 'business',
      display_template: '{{name}}',
      archive_field: 'status',
      archive_value: 'archived',
      unarchive_value: 'published',
      singleton: false,
      sort_field: 'sort'
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'name',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          width: 'full',
          required: true
        }
      },
      {
        field: 'status',
        type: 'string',
        schema: {
          default_value: 'published'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Published', value: 'published' },
              { text: 'Draft', value: 'draft' },
              { text: 'Archived', value: 'archived' }
            ]
          }
        }
      },
      {
        field: 'sort',
        type: 'integer',
        schema: {},
        meta: {
          interface: 'input',
          hidden: true
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          width: 'half',
          special: ['date-created']
        }
      },
      {
        field: 'date_updated',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          width: 'half',
          special: ['date-updated']
        }
      }
    ]
  },
  {
    collection: 'client_invoices',
    meta: {
      icon: 'receipt',
      display_template: '{{invoice_number}} - {{client_name}}',
      archive_field: 'status',
      archive_value: 'cancelled',
      unarchive_value: 'draft',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'invoice_number',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'client_name',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input'
        }
      },
      {
        field: 'amount',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'status',
        type: 'string',
        schema: {
          default_value: 'draft'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Draft', value: 'draft' },
              { text: 'Sent', value: 'sent' },
              { text: 'Paid', value: 'paid' },
              { text: 'Overdue', value: 'overdue' },
              { text: 'Cancelled', value: 'cancelled' }
            ]
          }
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  },
  {
    collection: 'supplier_invoices',
    meta: {
      icon: 'receipt_long',
      display_template: '{{invoice_number}} - {{supplier_name}}',
      archive_field: 'status',
      archive_value: 'cancelled',
      unarchive_value: 'pending',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'invoice_number',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'supplier_name',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input'
        }
      },
      {
        field: 'amount',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'status',
        type: 'string',
        schema: {
          default_value: 'pending'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Pending', value: 'pending' },
              { text: 'Approved', value: 'approved' },
              { text: 'Paid', value: 'paid' },
              { text: 'Disputed', value: 'disputed' },
              { text: 'Cancelled', value: 'cancelled' }
            ]
          }
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  },
  {
    collection: 'expenses',
    meta: {
      icon: 'payments',
      display_template: '{{description}} - {{amount}}€',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'description',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'amount',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'category',
        type: 'string',
        schema: {},
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Transport', value: 'transport' },
              { text: 'Equipment', value: 'equipment' },
              { text: 'Software', value: 'software' },
              { text: 'Office', value: 'office' },
              { text: 'Marketing', value: 'marketing' },
              { text: 'Other', value: 'other' }
            ]
          }
        }
      },
      {
        field: 'date',
        type: 'date',
        schema: {},
        meta: {
          interface: 'datetime'
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  },
  {
    collection: 'bank_transactions',
    meta: {
      icon: 'account_balance',
      display_template: '{{date}} - {{amount}}€ - {{description}}',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'description',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input'
        }
      },
      {
        field: 'amount',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'type',
        type: 'string',
        schema: {},
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Credit', value: 'credit' },
              { text: 'Debit', value: 'debit' }
            ]
          }
        }
      },
      {
        field: 'date',
        type: 'date',
        schema: {},
        meta: {
          interface: 'datetime'
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  },
  {
    collection: 'accounting_entries',
    meta: {
      icon: 'calculate',
      display_template: '{{entry_number}} - {{description}}',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'entry_number',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'description',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input'
        }
      },
      {
        field: 'debit',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'credit',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'date',
        type: 'date',
        schema: {},
        meta: {
          interface: 'datetime'
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  },
  {
    collection: 'support_tickets',
    meta: {
      icon: 'support_agent',
      display_template: '#{{ticket_number}} - {{subject}}',
      archive_field: 'status',
      archive_value: 'closed',
      unarchive_value: 'open',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'ticket_number',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'subject',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'description',
        type: 'text',
        schema: {},
        meta: {
          interface: 'input-rich-text-html'
        }
      },
      {
        field: 'priority',
        type: 'string',
        schema: {
          default_value: 'medium'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Low', value: 'low' },
              { text: 'Medium', value: 'medium' },
              { text: 'High', value: 'high' },
              { text: 'Critical', value: 'critical' }
            ]
          }
        }
      },
      {
        field: 'status',
        type: 'string',
        schema: {
          default_value: 'open'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Open', value: 'open' },
              { text: 'In Progress', value: 'in_progress' },
              { text: 'Waiting', value: 'waiting' },
              { text: 'Resolved', value: 'resolved' },
              { text: 'Closed', value: 'closed' }
            ]
          }
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  },
  {
    collection: 'subscriptions',
    meta: {
      icon: 'subscriptions',
      display_template: '{{name}} - {{status}}',
      archive_field: 'status',
      archive_value: 'cancelled',
      unarchive_value: 'active',
      singleton: false
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true
        },
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        }
      },
      {
        field: 'name',
        type: 'string',
        schema: {
          is_nullable: false
        },
        meta: {
          interface: 'input',
          required: true
        }
      },
      {
        field: 'amount',
        type: 'decimal',
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        },
        meta: {
          interface: 'input',
          display: 'formatted-value',
          display_options: {
            format: true,
            prefix: '€'
          }
        }
      },
      {
        field: 'billing_cycle',
        type: 'string',
        schema: {},
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Monthly', value: 'monthly' },
              { text: 'Quarterly', value: 'quarterly' },
              { text: 'Yearly', value: 'yearly' }
            ]
          }
        }
      },
      {
        field: 'status',
        type: 'string',
        schema: {
          default_value: 'active'
        },
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Active', value: 'active' },
              { text: 'Paused', value: 'paused' },
              { text: 'Cancelled', value: 'cancelled' },
              { text: 'Expired', value: 'expired' }
            ]
          }
        }
      },
      {
        field: 'start_date',
        type: 'date',
        schema: {},
        meta: {
          interface: 'datetime'
        }
      },
      {
        field: 'end_date',
        type: 'date',
        schema: {},
        meta: {
          interface: 'datetime'
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {},
        meta: {
          interface: 'datetime',
          readonly: true,
          special: ['date-created']
        }
      }
    ]
  }
];

// Fonction pour supprimer une collection
async function deleteCollection(collectionName) {
  try {
    await directus.delete(`/collections/${collectionName}`);
    console.log(`    ✅ Collection ${collectionName} supprimée`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`    ℹ️  Collection ${collectionName} n'existe pas`);
      return true;
    }
    console.log(`    ⚠️  Impossible de supprimer ${collectionName}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    return false;
  }
}

// Fonction pour créer une collection avec schéma SQL
async function createCollection(collectionDef) {
  try {
    const payload = {
      collection: collectionDef.collection,
      meta: collectionDef.meta,
      schema: {
        name: collectionDef.collection,
        comment: `Table for ${collectionDef.collection}`
      },
      fields: collectionDef.fields
    };
    
    await directus.post('/collections', payload);
    console.log(`    ✅ Collection ${collectionDef.collection} créée avec schéma SQL`);
    return true;
  } catch (error) {
    console.error(`    ❌ Erreur création ${collectionDef.collection}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🔧 Correction des collections virtuelles restantes');
  console.log('=' .repeat(50));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    process.exit(1);
  }
  
  const results = { fixed: [], failed: [] };
  
  // Traiter chaque collection
  for (const collectionDef of collectionsToFix) {
    console.log(`\n📦 Traitement de ${collectionDef.collection}:`);
    console.log('-'.repeat(40));
    
    // 1. Supprimer la collection virtuelle existante
    console.log('  1. Suppression de la version virtuelle...');
    const deleted = await deleteCollection(collectionDef.collection);
    
    if (deleted) {
      // 2. Recréer avec schéma SQL
      console.log('  2. Création avec schéma SQL...');
      const created = await createCollection(collectionDef);
      
      if (created) {
        results.fixed.push(collectionDef.collection);
      } else {
        results.failed.push(collectionDef.collection);
      }
    } else {
      results.failed.push(collectionDef.collection);
    }
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RAPPORT FINAL\n');
  
  if (results.fixed.length > 0) {
    console.log(`✅ Collections corrigées: ${results.fixed.length}`);
    results.fixed.forEach(c => console.log(`   - ${c}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Collections non corrigées: ${results.failed.length}`);
    results.failed.forEach(c => console.log(`   - ${c}`));
  }
  
  console.log('\n✨ Opération terminée!');
  
  if (results.fixed.length === collectionsToFix.length) {
    console.log('🎉 Toutes les collections ont été corrigées avec succès!');
    console.log('\n👉 Vous pouvez maintenant relancer le script create-projects-relations.js');
  }
  
  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    operation: 'fix_virtual_collections_batch2',
    fixed: results.fixed,
    failed: results.failed,
    total: collectionsToFix.length
  };
  
  require('fs').writeFileSync(
    '/Users/jean-mariedelaunay/directus-unified-platform/STATUS/fix-virtual-collections-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('\n📄 Rapport sauvegardé dans STATUS/fix-virtual-collections-report.json');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});