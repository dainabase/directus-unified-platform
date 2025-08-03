#!/usr/bin/env node

/**
 * Script pour créer la collection time_tracking dans Directus
 * Base Notion source : DB-TIME-TRACKING (12 propriétés simples)
 */

const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;

async function createTimeTrackingCollection() {
  console.log('🚀 Création de la collection time_tracking dans Directus...\n');

  // Configuration de la collection
  const collectionConfig = {
    collection: 'time_tracking',
    meta: {
      collection: 'time_tracking',
      icon: 'schedule',
      display_template: '{{project_name}} - {{hours}}h - {{date}}',
      color: '#4CAF50',
      translations: [
        {
          language: 'fr-FR',
          translation: 'Suivi du temps',
          singular: 'Entrée de temps',
          plural: 'Entrées de temps'
        }
      ]
    },
    schema: {
      name: 'time_tracking'
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        meta: {
          interface: 'input',
          readonly: true,
          hidden: true,
          field: 'id',
          special: ['uuid']
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: false
        }
      },
      {
        field: 'notion_id',
        type: 'string',
        meta: {
          interface: 'input',
          options: { trim: true },
          readonly: true,
          width: 'half',
          field: 'notion_id',
          display: 'raw',
          display_options: {},
          note: 'ID original de Notion'
        },
        schema: {
          max_length: 255,
          is_unique: true
        }
      },
      {
        field: 'project_name',
        type: 'string',
        meta: {
          interface: 'input',
          options: { trim: true },
          width: 'full',
          field: 'project_name',
          display: 'formatted-value',
          display_options: { bold: true },
          required: true
        },
        schema: {
          max_length: 255,
          is_nullable: false
        }
      },
      {
        field: 'user_name',
        type: 'string',
        meta: {
          interface: 'input',
          options: { trim: true },
          width: 'half',
          field: 'user_name',
          required: true
        },
        schema: {
          max_length: 255,
          is_nullable: false
        }
      },
      {
        field: 'task_description',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          options: { trim: true },
          width: 'full',
          field: 'task_description'
        },
        schema: {
          is_nullable: true
        }
      },
      {
        field: 'hours',
        type: 'decimal',
        meta: {
          interface: 'input',
          options: {
            min: 0,
            max: 24,
            step: 0.25
          },
          width: 'half',
          field: 'hours',
          display: 'formatted-value',
          display_options: { suffix: ' heures' },
          required: true
        },
        schema: {
          numeric_precision: 10,
          numeric_scale: 2,
          is_nullable: false,
          default_value: '0'
        }
      },
      {
        field: 'date',
        type: 'date',
        meta: {
          interface: 'datetime',
          options: { includeTime: false },
          width: 'half',
          field: 'date',
          display: 'datetime',
          display_options: { format: 'short' },
          required: true
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'billable',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          options: {
            label: 'Temps facturable'
          },
          width: 'half',
          field: 'billable',
          display: 'boolean',
          special: ['cast-boolean']
        },
        schema: {
          default_value: true,
          is_nullable: false
        }
      },
      {
        field: 'billed',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          options: {
            label: 'Déjà facturé'
          },
          width: 'half',
          field: 'billed',
          display: 'boolean',
          special: ['cast-boolean']
        },
        schema: {
          default_value: false,
          is_nullable: false
        }
      },
      {
        field: 'hourly_rate',
        type: 'decimal',
        meta: {
          interface: 'input',
          options: {
            min: 0,
            step: 1,
            prefix: '€'
          },
          width: 'half',
          field: 'hourly_rate',
          display: 'formatted-value',
          display_options: { prefix: '€', suffix: '/h' }
        },
        schema: {
          numeric_precision: 10,
          numeric_scale: 2,
          is_nullable: true
        }
      },
      {
        field: 'category',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Développement', value: 'development' },
              { text: 'Design', value: 'design' },
              { text: 'Réunion', value: 'meeting' },
              { text: 'Support', value: 'support' },
              { text: 'Administration', value: 'admin' },
              { text: 'Formation', value: 'training' },
              { text: 'Autre', value: 'other' }
            ]
          },
          width: 'half',
          field: 'category',
          display: 'labels',
          display_options: {
            showAsDot: true,
            choices: [
              { text: 'Développement', value: 'development', foreground: '#FFFFFF', background: '#2196F3' },
              { text: 'Design', value: 'design', foreground: '#FFFFFF', background: '#9C27B0' },
              { text: 'Réunion', value: 'meeting', foreground: '#FFFFFF', background: '#FF9800' },
              { text: 'Support', value: 'support', foreground: '#FFFFFF', background: '#4CAF50' },
              { text: 'Administration', value: 'admin', foreground: '#FFFFFF', background: '#607D8B' },
              { text: 'Formation', value: 'training', foreground: '#FFFFFF', background: '#00BCD4' },
              { text: 'Autre', value: 'other', foreground: '#FFFFFF', background: '#9E9E9E' }
            ]
          }
        },
        schema: {
          max_length: 50,
          default_value: 'development',
          is_nullable: false
        }
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Brouillon', value: 'draft' },
              { text: 'Validé', value: 'validated' },
              { text: 'Facturé', value: 'invoiced' }
            ]
          },
          width: 'half',
          field: 'status',
          display: 'labels',
          display_options: {
            showAsDot: true,
            choices: [
              { text: 'Brouillon', value: 'draft', foreground: '#000000', background: '#FFC107' },
              { text: 'Validé', value: 'validated', foreground: '#FFFFFF', background: '#4CAF50' },
              { text: 'Facturé', value: 'invoiced', foreground: '#FFFFFF', background: '#2196F3' }
            ]
          }
        },
        schema: {
          max_length: 20,
          default_value: 'draft',
          is_nullable: false
        }
      },
      {
        field: 'notes',
        type: 'text',
        meta: {
          interface: 'input-rich-text-html',
          options: {},
          width: 'full',
          field: 'notes',
          display: 'raw'
        },
        schema: {
          is_nullable: true
        }
      },
      // Champs système
      {
        field: 'date_created',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          width: 'half',
          field: 'date_created',
          special: ['date-created']
        },
        schema: {}
      },
      {
        field: 'date_updated',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          width: 'half',
          field: 'date_updated',
          special: ['date-updated']
        },
        schema: {}
      },
      {
        field: 'user_created',
        type: 'string',
        meta: {
          interface: 'select-dropdown-m2o',
          readonly: true,
          hidden: true,
          width: 'half',
          field: 'user_created',
          special: ['user-created']
        },
        schema: {}
      },
      {
        field: 'user_updated',
        type: 'string',
        meta: {
          interface: 'select-dropdown-m2o',
          readonly: true,
          hidden: true,
          width: 'half',
          field: 'user_updated',
          special: ['user-updated']
        },
        schema: {}
      }
    ]
  };

  try {
    // Créer la collection
    const response = await axios.post(
      `${DIRECTUS_URL}/collections`,
      collectionConfig,
      {
        headers: {
          'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Collection time_tracking créée avec succès !');
    console.log('📊 Détails :');
    console.log('   - Collection : time_tracking');
    console.log('   - Champs : 17 (12 métier + 5 système)');
    console.log('   - Icône : schedule');
    console.log('   - Couleur : #4CAF50 (vert)');
    console.log('\n🎯 Prochaine étape : Créer le script de migration');
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ La collection time_tracking existe déjà');
      return null;
    }
    
    console.error('❌ Erreur lors de la création de la collection :');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createTimeTrackingCollection()
    .then(() => {
      console.log('\n✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur fatale :', error);
      process.exit(1);
    });
}

module.exports = { createTimeTrackingCollection };