#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Structure exacte d'un champ owner_company qui fonctionne
const OWNER_COMPANY_FIELD_TEMPLATE = {
  "field": "owner_company",
  "type": "string",
  "schema": {
    "name": "owner_company",
    "table": null, // Sera remplacé dynamiquement
    "data_type": "character varying",
    "default_value": "HYPERVISUAL",
    "generation_expression": null,
    "max_length": 50,
    "numeric_precision": null,
    "numeric_scale": null,
    "is_generated": false,
    "is_nullable": true,
    "is_unique": false,
    "is_indexed": false,
    "is_primary_key": false,
    "has_auto_increment": false,
    "foreign_key_schema": null,
    "foreign_key_table": null,
    "foreign_key_column": null,
    "comment": null
  },
  "meta": {
    "collection": null, // Sera remplacé dynamiquement
    "field": "owner_company",
    "special": null,
    "interface": "select-dropdown",
    "options": {
      "choices": [
        { "text": "HYPERVISUAL", "value": "HYPERVISUAL" },
        { "text": "DAINAMICS", "value": "DAINAMICS" },
        { "text": "LEXAIA", "value": "LEXAIA" },
        { "text": "ENKI REALTY", "value": "ENKI_REALTY" },
        { "text": "TAKEOUT", "value": "TAKEOUT" }
      ]
    },
    "display": "labels",
    "display_options": {
      "showAsDot": true,
      "choices": [
        {
          "text": "HYPERVISUAL",
          "value": "HYPERVISUAL",
          "foreground": "#FFFFFF",
          "background": "#2196F3"
        },
        {
          "text": "DAINAMICS",
          "value": "DAINAMICS",
          "foreground": "#FFFFFF",
          "background": "#4CAF50"
        },
        {
          "text": "LEXAIA",
          "value": "LEXAIA",
          "foreground": "#FFFFFF",
          "background": "#FF9800"
        },
        {
          "text": "ENKI REALTY",
          "value": "ENKI_REALTY",
          "foreground": "#FFFFFF",
          "background": "#9C27B0"
        },
        {
          "text": "TAKEOUT",
          "value": "TAKEOUT",
          "foreground": "#FFFFFF",
          "background": "#F44336"
        }
      ]
    },
    "readonly": false,
    "hidden": false,
    "sort": 20,
    "width": "half",
    "translations": null,
    "note": "Entreprise propriétaire",
    "conditions": null,
    "required": false,
    "group": null,
    "validation": null,
    "validation_message": null
  }
};

// Collections qui n'ont PAS owner_company
const COLLECTIONS_WITHOUT_OWNER_COMPANY = [
  'companies',
  'people',
  'time_tracking',
  'proposals',
  'quotes',
  'support_tickets',
  'orders',
  'talents',
  'interactions',
  'teams',
  'accounting_entries',
  'activities',
  'approvals',
  'audit_logs',
  'comments',
  'company_people',
  'compliance',
  'content_calendar',
  'credits',
  'customer_success',
  'debits',
  'deliveries',
  'departments',
  'evaluations',
  'events',
  'goals',
  'notes',
  'notifications',
  'permissions',
  'projects_team',
  'providers',
  'reconciliations',
  'refunds',
  'returns',
  'roles',
  'settings',
  'skills',
  'tags',
  'talents_simple',
  'trainings',
  'workflows'
];

async function createOwnerCompanyTemplate() {
  console.log('🔨 CRÉATION DU TEMPLATE POUR OWNER_COMPANY');
  console.log('='.repeat(80));
  
  try {
    // Créer un répertoire pour le nouveau template
    const templateDir = './owner-company-migration';
    await fs.mkdir(templateDir, { recursive: true });
    await fs.mkdir(path.join(templateDir, 'src'), { recursive: true });
    
    // Créer package.json
    const packageJson = {
      "name": "owner-company-migration",
      "version": "1.0.0",
      "description": "Ajoute le champ owner_company aux collections manquantes",
      "type": "module"
    };
    
    await fs.writeFile(
      path.join(templateDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Créer README.md
    const readme = `# Owner Company Migration Template

Ce template ajoute le champ \`owner_company\` aux ${COLLECTIONS_WITHOUT_OWNER_COMPANY.length} collections qui ne l'ont pas encore.

## Utilisation

\`\`\`bash
npx directus-template-cli@latest apply ./owner-company-migration
\`\`\`

## Collections modifiées

${COLLECTIONS_WITHOUT_OWNER_COMPANY.map(c => `- ${c}`).join('\n')}
`;
    
    await fs.writeFile(path.join(templateDir, 'README.md'), readme);
    
    // Créer le fichier fields.json avec les définitions
    const fields = [];
    
    for (const collection of COLLECTIONS_WITHOUT_OWNER_COMPANY) {
      const field = JSON.parse(JSON.stringify(OWNER_COMPANY_FIELD_TEMPLATE));
      field.collection = collection;
      field.schema.table = collection;
      field.meta.collection = collection;
      fields.push(field);
    }
    
    await fs.writeFile(
      path.join(templateDir, 'src', 'fields.json'),
      JSON.stringify(fields, null, 2)
    );
    
    // Créer des fichiers vides pour les autres éléments (nécessaires pour directus-template-cli)
    const emptyFiles = [
      'collections.json',
      'relations.json',
      'roles.json',
      'permissions.json',
      'settings.json',
      'flows.json',
      'operations.json',
      'dashboards.json',
      'panels.json'
    ];
    
    for (const file of emptyFiles) {
      await fs.writeFile(
        path.join(templateDir, 'src', file),
        '[]'
      );
    }
    
    console.log('✅ Template créé avec succès dans:', templateDir);
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Vérifier le contenu du template:');
    console.log('   cat owner-company-migration/src/fields.json | head -50');
    console.log('\n2. Appliquer le template à Directus:');
    console.log('   npx directus-template-cli@latest apply ./owner-company-migration -p \\');
    console.log('     --directusUrl="http://localhost:8055" \\');
    console.log('     --directusToken="e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW"');
    console.log('\n3. Vérifier le résultat:');
    console.log('   node src/backend/tests/test-filtering.js');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter
createOwnerCompanyTemplate();