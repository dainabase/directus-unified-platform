/**
 * Migration: Company Configurations
 * Creates company_configs, tva_rates, and finance_settings collections
 *
 * @version 2.0.0
 * Run: node src/backend/migrations/005_company_configs.js
 */

import { createDirectus, rest, staticToken, createCollection, createField } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

const getDirectus = () => {
  return createDirectus(DIRECTUS_URL)
    .with(staticToken(DIRECTUS_TOKEN))
    .with(rest());
};

async function createCompanyConfigsCollection(directus) {
  console.log('Creating company_configs collection...');

  try {
    await directus.request(createCollection({
      collection: 'company_configs',
      meta: {
        icon: 'business',
        note: 'Configuration des entreprises du groupe',
        display_template: '{{name}} ({{code}})',
        sort_field: 'sort_order'
      },
      schema: {}
    }));

    // Fields
    const fields = [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, has_auto_increment: false } },
      { field: 'code', type: 'string', meta: { interface: 'input', required: true, width: 'half', note: 'Code unique (ex: HYPERVISUAL)' }, schema: { is_unique: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half', note: 'Nom legal' } },
      { field: 'display_name', type: 'string', meta: { interface: 'input', width: 'half', note: 'Nom d\'affichage' } },
      { field: 'ide', type: 'string', meta: { interface: 'input', width: 'half', note: 'Numero IDE (CHE-XXX.XXX.XXX)' } },
      { field: 'vat_number', type: 'string', meta: { interface: 'input', width: 'half', note: 'Numero TVA' } },
      { field: 'street', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'postal_code', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'city', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'country', type: 'string', meta: { interface: 'input', width: 'half', options: { placeholder: 'CH' } }, schema: { default_value: 'CH' } },
      { field: 'qr_iban', type: 'string', meta: { interface: 'input', width: 'half', note: 'IBAN QR pour factures' } },
      { field: 'regular_iban', type: 'string', meta: { interface: 'input', width: 'half', note: 'IBAN standard' } },
      { field: 'email', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'phone', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'website', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'color', type: 'string', meta: { interface: 'select-color', width: 'half' } },
      { field: 'currency', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'CHF', value: 'CHF' }, { text: 'EUR', value: 'EUR' }] } }, schema: { default_value: 'CHF' } },
      { field: 'logo_url', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'settings', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full', note: 'Parametres additionnels JSON' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: true } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 0 } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
    ];

    for (const field of fields) {
      try {
        await directus.request(createField('company_configs', field));
        console.log(`  ✅ Field ${field.field} created`);
      } catch (e) {
        if (e.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
          console.log(`  ⏭️  Field ${field.field} already exists`);
        } else {
          throw e;
        }
      }
    }

    console.log('✅ company_configs collection created');
  } catch (error) {
    if (error.errors?.[0]?.extensions?.code === 'COLLECTION_ALREADY_EXISTS') {
      console.log('⏭️  company_configs already exists');
    } else {
      throw error;
    }
  }
}

async function createTvaRatesCollection(directus) {
  console.log('Creating tva_rates collection...');

  try {
    await directus.request(createCollection({
      collection: 'tva_rates',
      meta: {
        icon: 'percent',
        note: 'Taux TVA suisse',
        display_template: '{{code}}: {{rate}}%'
      },
      schema: {}
    }));

    const fields = [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, has_auto_increment: false } },
      { field: 'code', type: 'string', meta: { interface: 'input', required: true, width: 'half', note: 'Code (NORMAL, REDUIT, etc.)' }, schema: { is_unique: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', width: 'half', note: 'Nom descriptif' } },
      { field: 'rate', type: 'decimal', meta: { interface: 'input', required: true, width: 'half', note: 'Taux en %' }, schema: { numeric_precision: 5, numeric_scale: 2 } },
      { field: 'account_code', type: 'string', meta: { interface: 'input', width: 'half', note: 'Compte comptable TVA' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: true } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 0 } },
      { field: 'effective_from', type: 'date', meta: { interface: 'datetime', width: 'half', note: 'Date d\'effet' } },
      { field: 'effective_to', type: 'date', meta: { interface: 'datetime', width: 'half', note: 'Date de fin (null = en vigueur)' } }
    ];

    for (const field of fields) {
      try {
        await directus.request(createField('tva_rates', field));
        console.log(`  ✅ Field ${field.field} created`);
      } catch (e) {
        if (e.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
          console.log(`  ⏭️  Field ${field.field} already exists`);
        } else {
          throw e;
        }
      }
    }

    console.log('✅ tva_rates collection created');
  } catch (error) {
    if (error.errors?.[0]?.extensions?.code === 'COLLECTION_ALREADY_EXISTS') {
      console.log('⏭️  tva_rates already exists');
    } else {
      throw error;
    }
  }
}

async function createFinanceSettingsCollection(directus) {
  console.log('Creating finance_settings collection...');

  try {
    await directus.request(createCollection({
      collection: 'finance_settings',
      meta: {
        icon: 'settings',
        note: 'Parametres finance configurables',
        display_template: '{{category}}: {{key}} = {{value}}'
      },
      schema: {}
    }));

    const fields = [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, has_auto_increment: false } },
      { field: 'category', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [{ text: 'Alertes', value: 'alerts' }, { text: 'Rappels', value: 'reminders' }, { text: 'PDF', value: 'pdf' }, { text: 'OCR', value: 'ocr' }, { text: 'General', value: 'general' }] } } },
      { field: 'key', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'value', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'data_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'String', value: 'string' }, { text: 'Number', value: 'number' }, { text: 'Boolean', value: 'boolean' }, { text: 'JSON', value: 'json' }] } }, schema: { default_value: 'string' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: true } }
    ];

    for (const field of fields) {
      try {
        await directus.request(createField('finance_settings', field));
        console.log(`  ✅ Field ${field.field} created`);
      } catch (e) {
        if (e.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
          console.log(`  ⏭️  Field ${field.field} already exists`);
        } else {
          throw e;
        }
      }
    }

    console.log('✅ finance_settings collection created');
  } catch (error) {
    if (error.errors?.[0]?.extensions?.code === 'COLLECTION_ALREADY_EXISTS') {
      console.log('⏭️  finance_settings already exists');
    } else {
      throw error;
    }
  }
}

async function createFinanceUsersCollection(directus) {
  console.log('Creating finance_users collection...');

  try {
    await directus.request(createCollection({
      collection: 'finance_users',
      meta: {
        icon: 'people',
        note: 'Utilisateurs Finance API',
        display_template: '{{first_name}} ({{email}})'
      },
      schema: {}
    }));

    const fields = [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, has_auto_increment: false } },
      { field: 'email', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_unique: true } },
      { field: 'password', type: 'hash', meta: { interface: 'input-hash', required: true, width: 'half' } },
      { field: 'first_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'last_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'role', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Admin', value: 'admin' }, { text: 'Manager', value: 'manager' }, { text: 'Comptable', value: 'accountant' }, { text: 'Utilisateur', value: 'user' }] } }, schema: { default_value: 'user' } },
      { field: 'companies', type: 'json', meta: { interface: 'tags', width: 'full', note: 'Entreprises accessibles (vide = toutes)' } },
      { field: 'permissions', type: 'json', meta: { interface: 'tags', width: 'full', note: 'Permissions specifiques' } },
      { field: 'avatar', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Actif', value: 'active' }, { text: 'Inactif', value: 'inactive' }, { text: 'Suspendu', value: 'suspended' }] } }, schema: { default_value: 'active' } },
      { field: 'last_login', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } },
      { field: 'password_updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'created_by', type: 'string', meta: { interface: 'input', readonly: true, width: 'half' } }
    ];

    for (const field of fields) {
      try {
        await directus.request(createField('finance_users', field));
        console.log(`  ✅ Field ${field.field} created`);
      } catch (e) {
        if (e.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
          console.log(`  ⏭️  Field ${field.field} already exists`);
        } else {
          throw e;
        }
      }
    }

    console.log('✅ finance_users collection created');
  } catch (error) {
    if (error.errors?.[0]?.extensions?.code === 'COLLECTION_ALREADY_EXISTS') {
      console.log('⏭️  finance_users already exists');
    } else {
      throw error;
    }
  }
}

async function runMigration() {
  console.log('\\n🚀 Starting Finance Configuration Migration...\\n');

  const directus = getDirectus();

  await createCompanyConfigsCollection(directus);
  await createTvaRatesCollection(directus);
  await createFinanceSettingsCollection(directus);
  await createFinanceUsersCollection(directus);

  console.log('\\n✅ Migration complete!\\n');
}

runMigration().catch(console.error);

export { runMigration };
