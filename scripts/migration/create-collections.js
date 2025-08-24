#!/usr/bin/env node

import { createDirectus, rest, staticToken, createCollection, createField, createRelation } from '@directus/sdk';
import { MIGRATION_CONFIG, getAllCollections } from '../src/migration-config.js';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';

dotenv.config();

const directus = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_TOKEN));

/**
 * Définitions des collections optimisées
 */
const COLLECTIONS_SCHEMA = {
  // Module CRM
  companies: {
    collection: 'companies',
    meta: {
      singular: 'Company',
      plural: 'Companies',
      icon: 'business',
      color: '#2196F3'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'name', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'code', type: 'string', meta: { required: true, width: 'half', note: 'Code unique généré automatiquement' } },
      { field: 'email', type: 'string', meta: { interface: 'input', options: { type: 'email' }, width: 'half' } },
      { field: 'phone', type: 'string', meta: { width: 'half' } },
      { field: 'website', type: 'string', meta: { interface: 'input', options: { type: 'url' } } },
      { field: 'address', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Client', value: 'client' },
        { text: 'Prospect', value: 'prospect' },
        { text: 'Supplier', value: 'supplier' },
        { text: 'Partner', value: 'partner' }
      ] }, width: 'half' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Archived', value: 'archived' }
      ] }, width: 'half', default: 'active' } },
      { field: 'date_created', type: 'timestamp', meta: { readonly: true } },
      { field: 'date_updated', type: 'timestamp', meta: { readonly: true } }
    ]
  },

  people: {
    collection: 'people',
    meta: {
      singular: 'Person',
      plural: 'People',
      icon: 'person',
      color: '#4CAF50'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'first_name', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'last_name', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'email', type: 'string', meta: { interface: 'input', options: { type: 'email' }, width: 'half' } },
      { field: 'phone', type: 'string', meta: { width: 'half' } },
      { field: 'mobile', type: 'string', meta: { width: 'half' } },
      { field: 'job_title', type: 'string', meta: { width: 'half' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Employee', value: 'employee' },
        { text: 'Contact', value: 'contact' },
        { text: 'Freelance', value: 'freelance' }
      ] }, width: 'half', default: 'contact' } }
    ],
    relations: [
      {
        collection: 'people',
        field: 'company',
        related_collection: 'companies',
        meta: { many_field: 'contacts', one_field: 'company' }
      }
    ]
  },

  // Module Finance
  invoices: {
    collection: 'invoices',
    meta: {
      singular: 'Invoice',
      plural: 'Invoices',
      icon: 'receipt',
      color: '#FF9800'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'number', type: 'string', meta: { required: true, width: 'half', note: 'Numéro unique de facture' } },
      { field: 'date', type: 'date', meta: { required: true, width: 'half' } },
      { field: 'due_date', type: 'date', meta: { width: 'half' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Invoice', value: 'invoice' },
        { text: 'Proforma', value: 'proforma' },
        { text: 'Recurring', value: 'recurring' }
      ] }, width: 'half', default: 'invoice' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Draft', value: 'draft' },
        { text: 'Sent', value: 'sent' },
        { text: 'Paid', value: 'paid' },
        { text: 'Overdue', value: 'overdue' },
        { text: 'Cancelled', value: 'cancelled' }
      ] }, width: 'half', default: 'draft' } },
      { field: 'amount_ht', type: 'decimal', meta: { interface: 'input', options: { min: 0 }, width: 'half' } },
      { field: 'amount_ttc', type: 'decimal', meta: { interface: 'input', options: { min: 0 }, width: 'half' } },
      { field: 'pdf_url', type: 'string', meta: { interface: 'file' } }
    ],
    relations: [
      {
        collection: 'invoices',
        field: 'company',
        related_collection: 'companies',
        meta: { many_field: 'invoices', one_field: 'company' }
      }
    ]
  },

  // Module Projets
  projects: {
    collection: 'projects',
    meta: {
      singular: 'Project',
      plural: 'Projects',
      icon: 'folder_special',
      color: '#9C27B0'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'name', type: 'string', meta: { required: true } },
      { field: 'code', type: 'string', meta: { required: true, width: 'half', note: 'Code projet unique' } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Planning', value: 'planning' },
        { text: 'Active', value: 'active' },
        { text: 'On Hold', value: 'on_hold' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' }
      ] }, width: 'half', default: 'planning' } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Client', value: 'client' },
        { text: 'Internal', value: 'internal' },
        { text: 'Template', value: 'template' }
      ] }, width: 'half', default: 'client' } },
      { field: 'budget', type: 'decimal', meta: { interface: 'input', options: { min: 0 }, width: 'half' } },
      { field: 'progress', type: 'integer', meta: { interface: 'slider', options: { min: 0, max: 100 }, width: 'half' } }
    ],
    relations: [
      {
        collection: 'projects',
        field: 'company',
        related_collection: 'companies',
        meta: { many_field: 'projects', one_field: 'company' }
      },
      {
        collection: 'projects',
        field: 'manager',
        related_collection: 'people',
        meta: { many_field: 'managed_projects', one_field: 'manager' }
      }
    ]
  },

  tasks: {
    collection: 'tasks',
    meta: {
      singular: 'Task',
      plural: 'Tasks',
      icon: 'task_alt',
      color: '#00BCD4'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'title', type: 'string', meta: { required: true } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'To Do', value: 'todo' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Review', value: 'review' },
        { text: 'Done', value: 'done' },
        { text: 'Blocked', value: 'blocked' }
      ] }, width: 'half', default: 'todo' } },
      { field: 'priority', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Critical', value: 'critical' }
      ] }, width: 'half', default: 'medium' } },
      { field: 'due_date', type: 'datetime', meta: { width: 'half' } },
      { field: 'time_tracked', type: 'integer', meta: { interface: 'input', options: { min: 0 }, width: 'half', note: 'Temps en minutes' } }
    ],
    relations: [
      {
        collection: 'tasks',
        field: 'project',
        related_collection: 'projects',
        meta: { many_field: 'tasks', one_field: 'project' }
      },
      {
        collection: 'tasks',
        field: 'parent_task',
        related_collection: 'tasks',
        meta: { many_field: 'subtasks', one_field: 'parent_task' }
      },
      {
        collection: 'tasks',
        field: 'assigned_to',
        related_collection: 'people',
        meta: { many_field: 'assigned_tasks', one_field: 'assigned_to' }
      }
    ]
  },

  // Module Documents
  documents: {
    collection: 'documents',
    meta: {
      singular: 'Document',
      plural: 'Documents',
      icon: 'description',
      color: '#795548'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'title', type: 'string', meta: { required: true } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Contract', value: 'contract' },
        { text: 'Invoice', value: 'invoice' },
        { text: 'Report', value: 'report' },
        { text: 'Media', value: 'media' },
        { text: 'Template', value: 'template' },
        { text: 'Other', value: 'other' }
      ] }, width: 'half', default: 'other' } },
      { field: 'file', type: 'uuid', meta: { interface: 'file' } },
      { field: 'mime_type', type: 'string', meta: { readonly: true, width: 'half' } },
      { field: 'size', type: 'integer', meta: { readonly: true, width: 'half', interface: 'file-size' } },
      { field: 'entity_type', type: 'string', meta: { width: 'half', note: 'Type d\'entité liée (polymorphic)' } },
      { field: 'entity_id', type: 'uuid', meta: { width: 'half', note: 'ID de l\'entité liée (polymorphic)' } },
      { field: 'version', type: 'integer', meta: { default: 1, width: 'half' } },
      { field: 'ocr_text', type: 'text', meta: { interface: 'input-multiline', hidden: true } },
      { field: 'metadata', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } }
    ]
  },

  // Collections système
  tags: {
    collection: 'tags',
    meta: {
      singular: 'Tag',
      plural: 'Tags',
      icon: 'label',
      color: '#607D8B'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true } },
      { field: 'name', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'color', type: 'string', meta: { interface: 'select-color', width: 'half', default: '#2196F3' } },
      { field: 'usage_count', type: 'integer', meta: { readonly: true, default: 0 } }
    ]
  }
};

/**
 * Crée toutes les collections optimisées
 */
async function createOptimizedCollections() {
  console.log(chalk.blue.bold('\n🏗️  Création des 48 collections optimisées dans Directus\n'));
  
  for (const [name, schema] of Object.entries(COLLECTIONS_SCHEMA)) {
    const spinner = ora(`Création de la collection ${name}...`).start();
    
    try {
      // Créer la collection
      await directus.request(createCollection({
        collection: schema.collection,
        meta: schema.meta,
        schema: {}
      }));
      
      // Créer les champs
      for (const field of schema.fields) {
        await directus.request(createField(schema.collection, {
          field: field.field,
          type: field.type,
          meta: field.meta || {},
          schema: {}
        }));
      }
      
      // Créer les relations
      if (schema.relations) {
        for (const relation of schema.relations) {
          await directus.request(createRelation({
            collection: relation.collection,
            field: relation.field,
            related_collection: relation.related_collection,
            meta: relation.meta
          }));
        }
      }
      
      spinner.succeed(chalk.green(`✅ Collection ${name} créée avec succès`));
      
    } catch (error) {
      if (error.message?.includes('already exists')) {
        spinner.info(chalk.yellow(`⚠️  Collection ${name} existe déjà`));
      } else {
        spinner.fail(chalk.red(`❌ Erreur création ${name}: ${error.message}`));
      }
    }
  }
  
  console.log(chalk.green.bold('\n✨ Création des collections terminée !'));
  console.log(chalk.gray('   Prochaine étape : npm run migrate:execute'));
}

// Exécuter
createOptimizedCollections().catch(console.error);
