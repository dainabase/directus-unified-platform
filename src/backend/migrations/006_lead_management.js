/**
 * Migration: Lead Management System
 * Creates leads, lead_sources, lead_activities, campaigns, email_templates, automation_rules
 *
 * @version 2.0.0
 * Run: node src/backend/migrations/006_lead_management.js
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

async function createCollection_(directus, config) {
  const { collection, meta, fields } = config;
  console.log(`Creating ${collection} collection...`);

  try {
    await directus.request(createCollection({
      collection,
      meta,
      schema: {}
    }));

    for (const field of fields) {
      try {
        await directus.request(createField(collection, field));
        console.log(`  ✅ Field ${field.field} created`);
      } catch (e) {
        const errorMsg = e.errors?.[0]?.message || '';
        if (e.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS' || errorMsg.includes('already exists')) {
          console.log(`  ⏭️  Field ${field.field} already exists`);
        } else {
          console.error(`  ❌ Error creating field ${field.field}:`, errorMsg);
        }
      }
    }

    console.log(`✅ ${collection} collection created`);
  } catch (error) {
    const errorMsg = error.errors?.[0]?.message || '';
    if (error.errors?.[0]?.extensions?.code === 'COLLECTION_ALREADY_EXISTS' || errorMsg.includes('already exists')) {
      console.log(`⏭️  ${collection} already exists, checking fields...`);
      // Try to add missing fields anyway
      for (const field of fields) {
        try {
          await directus.request(createField(collection, field));
          console.log(`  ✅ Field ${field.field} created`);
        } catch (e) {
          const fieldErr = e.errors?.[0]?.message || '';
          if (fieldErr.includes('already exists')) {
            console.log(`  ⏭️  Field ${field.field} already exists`);
          } else {
            console.error(`  ❌ Error: ${fieldErr}`);
          }
        }
      }
    } else {
      console.error(`❌ Error creating ${collection}:`, errorMsg);
    }
  }
}

const collections = [
  // Lead Sources
  {
    collection: 'lead_sources',
    meta: {
      icon: 'source',
      note: 'Sources des leads (WhatsApp, Email, Web, etc.)',
      display_template: '{{name}}'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'code', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_unique: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'WhatsApp', value: 'whatsapp' }, { text: 'Email', value: 'email' }, { text: 'Telephone', value: 'phone' }, { text: 'Web Form', value: 'web' }, { text: 'Referral', value: 'referral' }, { text: 'LinkedIn', value: 'linkedin' }, { text: 'Facebook', value: 'facebook' }, { text: 'Google Ads', value: 'google_ads' }, { text: 'Other', value: 'other' }] } } },
      { field: 'icon', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'color', type: 'string', meta: { interface: 'select-color', width: 'half' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: true } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 0 } }
    ]
  },

  // Leads
  {
    collection: 'leads',
    meta: {
      icon: 'person_add',
      note: 'Leads et prospects',
      display_template: '{{first_name}} {{last_name}} - {{company_name}}'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'first_name', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'last_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'email', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'phone', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'whatsapp', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'company_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'job_title', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'website', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'source', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', options: { template: '{{name}}' } } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [{ text: 'Nouveau', value: 'new' }, { text: 'Contacte', value: 'contacted' }, { text: 'Qualifie', value: 'qualified' }, { text: 'Proposition', value: 'proposal' }, { text: 'Negociation', value: 'negotiation' }, { text: 'Gagne', value: 'won' }, { text: 'Perdu', value: 'lost' }, { text: 'Inactif', value: 'inactive' }] } }, schema: { default_value: 'new' } },
      { field: 'score', type: 'integer', meta: { interface: 'slider', width: 'half', options: { min: 0, max: 100 } }, schema: { default_value: 0 } },
      { field: 'priority', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Haute', value: 'high' }, { text: 'Moyenne', value: 'medium' }, { text: 'Basse', value: 'low' }] } }, schema: { default_value: 'medium' } },
      { field: 'assigned_to', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'company', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'HYPERVISUAL', value: 'HYPERVISUAL' }, { text: 'DAINAMICS', value: 'DAINAMICS' }, { text: 'LEXAIA', value: 'LEXAIA' }, { text: 'ENKI_REALTY', value: 'ENKI_REALTY' }, { text: 'TAKEOUT', value: 'TAKEOUT' }] } } },
      { field: 'estimated_value', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 12, numeric_scale: 2 } },
      { field: 'currency', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'CHF', value: 'CHF' }, { text: 'EUR', value: 'EUR' }] } }, schema: { default_value: 'CHF' } },
      { field: 'tags', type: 'json', meta: { interface: 'tags', width: 'full' } },
      { field: 'notes', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'address', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'city', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'postal_code', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'country', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { default_value: 'CH' } },
      { field: 'last_contacted_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'next_followup_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'converted_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'lost_reason', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
    ]
  },

  // Lead Activities
  {
    collection: 'lead_activities',
    meta: {
      icon: 'history',
      note: 'Historique des interactions avec les leads',
      display_template: '{{type}} - {{subject}}'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'lead', type: 'uuid', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [{ text: 'Appel', value: 'call' }, { text: 'Email', value: 'email' }, { text: 'WhatsApp', value: 'whatsapp' }, { text: 'Reunion', value: 'meeting' }, { text: 'Note', value: 'note' }, { text: 'Tache', value: 'task' }, { text: 'Proposition', value: 'proposal' }, { text: 'Contrat', value: 'contract' }] } } },
      { field: 'subject', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'outcome', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Positif', value: 'positive' }, { text: 'Neutre', value: 'neutral' }, { text: 'Negatif', value: 'negative' }, { text: 'En attente', value: 'pending' }] } } },
      { field: 'duration_minutes', type: 'integer', meta: { interface: 'input', width: 'half' } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'scheduled_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'completed_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'is_automated', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'metadata', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full' } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } }
    ]
  },

  // Campaigns
  {
    collection: 'campaigns',
    meta: {
      icon: 'campaign',
      note: 'Campagnes marketing',
      display_template: '{{name}} ({{status}})'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'code', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { is_unique: true } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Email', value: 'email' }, { text: 'WhatsApp', value: 'whatsapp' }, { text: 'SMS', value: 'sms' }, { text: 'Multi-canal', value: 'multi' }] } } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Brouillon', value: 'draft' }, { text: 'Planifie', value: 'scheduled' }, { text: 'Active', value: 'active' }, { text: 'Pause', value: 'paused' }, { text: 'Terminee', value: 'completed' }, { text: 'Archivee', value: 'archived' }] } }, schema: { default_value: 'draft' } },
      { field: 'company', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'HYPERVISUAL', value: 'HYPERVISUAL' }, { text: 'DAINAMICS', value: 'DAINAMICS' }, { text: 'LEXAIA', value: 'LEXAIA' }, { text: 'ENKI_REALTY', value: 'ENKI_REALTY' }, { text: 'TAKEOUT', value: 'TAKEOUT' }] } } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'start_date', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'end_date', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
      { field: 'budget', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 12, numeric_scale: 2 } },
      { field: 'target_audience', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full', note: 'Criteres de ciblage' } },
      { field: 'stats', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full', note: 'Statistiques (sent, opened, clicked, converted)' } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
    ]
  },

  // Email Templates
  {
    collection: 'email_templates',
    meta: {
      icon: 'mail',
      note: 'Templates emails',
      display_template: '{{name}} ({{category}})'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'code', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { is_unique: true } },
      { field: 'category', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Lead Nurturing', value: 'nurturing' }, { text: 'Welcome', value: 'welcome' }, { text: 'Follow-up', value: 'followup' }, { text: 'Proposition', value: 'proposal' }, { text: 'Reminder', value: 'reminder' }, { text: 'Newsletter', value: 'newsletter' }, { text: 'Transactionnel', value: 'transactional' }] } } },
      { field: 'subject', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'body_html', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
      { field: 'body_text', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'variables', type: 'json', meta: { interface: 'tags', width: 'full', note: 'Variables disponibles ({{first_name}}, {{company}}, etc.)' } },
      { field: 'company', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Toutes', value: 'ALL' }, { text: 'HYPERVISUAL', value: 'HYPERVISUAL' }, { text: 'DAINAMICS', value: 'DAINAMICS' }, { text: 'LEXAIA', value: 'LEXAIA' }, { text: 'ENKI_REALTY', value: 'ENKI_REALTY' }, { text: 'TAKEOUT', value: 'TAKEOUT' }] } }, schema: { default_value: 'ALL' } },
      { field: 'is_active', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: true } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
    ]
  },

  // Automation Rules
  {
    collection: 'automation_rules',
    meta: {
      icon: 'auto_fix_high',
      note: 'Regles d\'automatisation',
      display_template: '{{name}} ({{status}})'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'code', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { is_unique: true } },
      { field: 'trigger_type', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [{ text: 'Nouveau Lead', value: 'lead_created' }, { text: 'Lead Status Change', value: 'lead_status_changed' }, { text: 'Inactivite', value: 'inactivity' }, { text: 'Score Change', value: 'score_changed' }, { text: 'Date Trigger', value: 'date_trigger' }, { text: 'Manual', value: 'manual' }] } } },
      { field: 'trigger_conditions', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full', note: 'Conditions de declenchement JSON' } },
      { field: 'action_type', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [{ text: 'Envoyer Email', value: 'send_email' }, { text: 'Envoyer WhatsApp', value: 'send_whatsapp' }, { text: 'Envoyer SMS', value: 'send_sms' }, { text: 'Assigner Lead', value: 'assign_lead' }, { text: 'Changer Status', value: 'change_status' }, { text: 'Ajouter Tag', value: 'add_tag' }, { text: 'Creer Tache', value: 'create_task' }, { text: 'Webhook', value: 'webhook' }] } } },
      { field: 'action_config', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full', note: 'Configuration action JSON' } },
      { field: 'delay_minutes', type: 'integer', meta: { interface: 'input', width: 'half', note: 'Delai avant execution (0 = immediat)' }, schema: { default_value: 0 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Actif', value: 'active' }, { text: 'Pause', value: 'paused' }, { text: 'Brouillon', value: 'draft' }] } }, schema: { default_value: 'draft' } },
      { field: 'company', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Toutes', value: 'ALL' }, { text: 'HYPERVISUAL', value: 'HYPERVISUAL' }, { text: 'DAINAMICS', value: 'DAINAMICS' }, { text: 'LEXAIA', value: 'LEXAIA' }, { text: 'ENKI_REALTY', value: 'ENKI_REALTY' }, { text: 'TAKEOUT', value: 'TAKEOUT' }] } }, schema: { default_value: 'ALL' } },
      { field: 'execution_count', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'last_executed_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
    ]
  },

  // Automation Logs
  {
    collection: 'automation_logs',
    meta: {
      icon: 'list',
      note: 'Logs des automatisations',
      display_template: '{{rule_name}} - {{status}}'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'rule', type: 'uuid', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half' } },
      { field: 'rule_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'lead', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'trigger_data', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full' } },
      { field: 'action_data', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Succes', value: 'success' }, { text: 'Echec', value: 'failed' }, { text: 'En attente', value: 'pending' }, { text: 'Annule', value: 'cancelled' }] } } },
      { field: 'error_message', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'executed_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } }
    ]
  },

  // Appointments
  {
    collection: 'appointments',
    meta: {
      icon: 'event',
      note: 'Rendez-vous et calendrier',
      display_template: '{{title}} - {{start_time}}'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, width: 'full' } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'lead', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'contact', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Appel', value: 'call' }, { text: 'Video', value: 'video' }, { text: 'En personne', value: 'in_person' }, { text: 'Demo', value: 'demo' }] } } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Planifie', value: 'scheduled' }, { text: 'Confirme', value: 'confirmed' }, { text: 'Termine', value: 'completed' }, { text: 'Annule', value: 'cancelled' }, { text: 'No-show', value: 'no_show' }] } }, schema: { default_value: 'scheduled' } },
      { field: 'start_time', type: 'timestamp', meta: { interface: 'datetime', required: true, width: 'half' } },
      { field: 'end_time', type: 'timestamp', meta: { interface: 'datetime', required: true, width: 'half' } },
      { field: 'location', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'meeting_link', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'assigned_to', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'reminder_sent', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'notes', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'outcome', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'company', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'HYPERVISUAL', value: 'HYPERVISUAL' }, { text: 'DAINAMICS', value: 'DAINAMICS' }, { text: 'LEXAIA', value: 'LEXAIA' }, { text: 'ENKI_REALTY', value: 'ENKI_REALTY' }, { text: 'TAKEOUT', value: 'TAKEOUT' }] } } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
    ]
  },

  // WhatsApp Messages
  {
    collection: 'whatsapp_messages',
    meta: {
      icon: 'chat',
      note: 'Messages WhatsApp',
      display_template: '{{phone}} - {{direction}}'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true } },
      { field: 'lead', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
      { field: 'phone', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      { field: 'direction', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Entrant', value: 'inbound' }, { text: 'Sortant', value: 'outbound' }] } } },
      { field: 'message_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Texte', value: 'text' }, { text: 'Image', value: 'image' }, { text: 'Document', value: 'document' }, { text: 'Audio', value: 'audio' }, { text: 'Video', value: 'video' }, { text: 'Template', value: 'template' }] } } },
      { field: 'content', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'media_url', type: 'string', meta: { interface: 'input', width: 'full' } },
      { field: 'template_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'Envoye', value: 'sent' }, { text: 'Delivre', value: 'delivered' }, { text: 'Lu', value: 'read' }, { text: 'Echec', value: 'failed' }] } } },
      { field: 'external_id', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'metadata', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full' } },
      { field: 'company', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: { choices: [{ text: 'HYPERVISUAL', value: 'HYPERVISUAL' }, { text: 'DAINAMICS', value: 'DAINAMICS' }, { text: 'LEXAIA', value: 'LEXAIA' }, { text: 'ENKI_REALTY', value: 'ENKI_REALTY' }, { text: 'TAKEOUT', value: 'TAKEOUT' }] } } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'NOW()' } }
    ]
  }
];

async function runMigration() {
  console.log('\n🚀 Starting Lead Management Migration...\n');

  const directus = getDirectus();

  for (const config of collections) {
    await createCollection_(directus, config);
    console.log('');
  }

  console.log('\n✅ Lead Management Migration complete!\n');
}

runMigration().catch(console.error);

export { runMigration };
