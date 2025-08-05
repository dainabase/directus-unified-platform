#!/usr/bin/env node

/**
 * Script pour créer la collection permissions dans Directus
 * Base Notion source : DB-PERMISSIONS-ACCÈS (11 propriétés simples)
 */

const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;

async function createPermissionsCollection() {
  console.log('🚀 Création de la collection permissions dans Directus...\n');

  // Configuration de la collection
  const collectionConfig = {
    collection: 'permissions',
    meta: {
      collection: 'permissions',
      icon: 'lock',
      display_template: '{{resource}} - {{role}} - {{action}}',
      color: '#F44336',
      translations: [
        {
          language: 'fr-FR',
          translation: 'Permissions',
          singular: 'Permission',
          plural: 'Permissions'
        }
      ]
    },
    schema: {
      name: 'permissions'
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
          note: 'ID original de Notion'
        },
        schema: {
          max_length: 255,
          is_unique: true
        }
      },
      {
        field: 'resource',
        type: 'string',
        meta: {
          interface: 'input',
          options: { trim: true },
          width: 'full',
          field: 'resource',
          display: 'formatted-value',
          display_options: { bold: true },
          required: true,
          note: 'Ressource concernée (collection, endpoint, etc.)'
        },
        schema: {
          max_length: 255,
          is_nullable: false
        }
      },
      {
        field: 'role',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Admin', value: 'admin' },
              { text: 'Manager', value: 'manager' },
              { text: 'Editor', value: 'editor' },
              { text: 'Viewer', value: 'viewer' },
              { text: 'Guest', value: 'guest' },
              { text: 'API', value: 'api' },
              { text: 'Service', value: 'service' }
            ]
          },
          width: 'half',
          field: 'role',
          display: 'labels',
          display_options: {
            showAsDot: true,
            choices: [
              { text: 'Admin', value: 'admin', foreground: '#FFFFFF', background: '#F44336' },
              { text: 'Manager', value: 'manager', foreground: '#FFFFFF', background: '#FF9800' },
              { text: 'Editor', value: 'editor', foreground: '#FFFFFF', background: '#2196F3' },
              { text: 'Viewer', value: 'viewer', foreground: '#FFFFFF', background: '#4CAF50' },
              { text: 'Guest', value: 'guest', foreground: '#000000', background: '#E0E0E0' },
              { text: 'API', value: 'api', foreground: '#FFFFFF', background: '#9C27B0' },
              { text: 'Service', value: 'service', foreground: '#FFFFFF', background: '#607D8B' }
            ]
          },
          required: true
        },
        schema: {
          max_length: 50,
          is_nullable: false
        }
      },
      {
        field: 'action',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Create', value: 'create' },
              { text: 'Read', value: 'read' },
              { text: 'Update', value: 'update' },
              { text: 'Delete', value: 'delete' },
              { text: 'Execute', value: 'execute' },
              { text: 'Export', value: 'export' },
              { text: 'Import', value: 'import' },
              { text: 'Approve', value: 'approve' }
            ]
          },
          width: 'half',
          field: 'action',
          display: 'labels',
          required: true
        },
        schema: {
          max_length: 50,
          is_nullable: false
        }
      },
      {
        field: 'scope',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Global', value: 'global' },
              { text: 'Organization', value: 'organization' },
              { text: 'Team', value: 'team' },
              { text: 'Project', value: 'project' },
              { text: 'Personal', value: 'personal' }
            ]
          },
          width: 'half',
          field: 'scope',
          display: 'labels',
          note: 'Portée de la permission'
        },
        schema: {
          max_length: 50,
          default_value: 'global'
        }
      },
      {
        field: 'conditions',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: {
            language: 'json',
            template: '{\n  "field": "",\n  "operator": "=",\n  "value": ""\n}'
          },
          width: 'full',
          field: 'conditions',
          note: 'Conditions supplémentaires (JSON)'
        },
        schema: {
          is_nullable: true
        }
      },
      {
        field: 'is_active',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          options: {
            label: 'Permission active'
          },
          width: 'half',
          field: 'is_active',
          display: 'boolean',
          special: ['cast-boolean']
        },
        schema: {
          default_value: true,
          is_nullable: false
        }
      },
      {
        field: 'priority',
        type: 'integer',
        meta: {
          interface: 'input',
          options: {
            min: 0,
            max: 100,
            step: 1
          },
          width: 'half',
          field: 'priority',
          note: 'Priorité (0-100, plus élevé = plus prioritaire)'
        },
        schema: {
          default_value: 50,
          is_nullable: false
        }
      },
      {
        field: 'description',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          options: { trim: true },
          width: 'full',
          field: 'description'
        },
        schema: {
          is_nullable: true
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

    console.log('✅ Collection permissions créée avec succès !');
    console.log('📊 Détails :');
    console.log('   - Collection : permissions');
    console.log('   - Champs : 15 (11 métier + 4 système)');
    console.log('   - Icône : lock');
    console.log('   - Couleur : #F44336 (rouge)');
    console.log('\n🎯 Prochaine étape : Créer le script de migration');
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ La collection permissions existe déjà');
      return null;
    }
    
    console.error('❌ Erreur lors de la création de la collection :');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createPermissionsCollection()
    .then(() => {
      console.log('\n✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur fatale :', error);
      process.exit(1);
    });
}

module.exports = { createPermissionsCollection };