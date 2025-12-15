/**
 * Migration 006: Commercial Workflow Collections
 *
 * Crée les collections nécessaires au workflow commercial complet:
 * - cgv_versions: Versioning des CGV
 * - cgv_acceptances: Acceptations CGV (preuves légales)
 * - signature_logs: Logs signatures DocuSeal
 * - deposit_configs: Configuration acomptes
 * - client_portal_accounts: Comptes portail client
 *
 * Et enrichit la collection quotes avec les champs workflow
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// ============================================
// PARTIE 2.1: Collection cgv_versions
// ============================================
async function createCgvVersionsCollection() {
  console.log('\n📋 Creating collection: cgv_versions');

  try {
    // Check if collection exists
    const existing = await api.get('/collections/cgv_versions').catch(() => null);
    if (existing?.data) {
      console.log('   ⚠️  Collection cgv_versions already exists, skipping...');
      return;
    }

    // Create collection
    await api.post('/collections', {
      collection: 'cgv_versions',
      meta: {
        icon: 'gavel',
        note: 'Versions des Conditions Générales de Vente par entreprise',
        display_template: '{{owner_company_id.name}} - v{{version}}',
        archive_field: 'status',
        archive_value: 'archived',
        unarchive_value: 'active',
        sort_field: 'sort',
        color: '#673AB7',
        singleton: false,
        translations: null,
        accountability: 'all',
        group: null
      },
      schema: {
        name: 'cgv_versions'
      }
    });

    console.log('   ✅ Collection created');

    // Create fields
    const fields = [
      {
        field: 'owner_company_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{name}}' },
          required: true,
          note: 'Entreprise propriétaire de ces CGV',
          sort: 1,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'version',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Numéro de version (ex: 1.0, 2.1)',
          sort: 2,
          width: 'half'
        },
        schema: { is_nullable: false, max_length: 10 }
      },
      {
        field: 'title',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Titre du document CGV',
          sort: 3,
          width: 'full'
        },
        schema: { is_nullable: false, max_length: 255 }
      },
      {
        field: 'content_html',
        type: 'text',
        meta: {
          interface: 'input-rich-text-html',
          required: true,
          note: 'Contenu complet des CGV en HTML',
          sort: 4,
          width: 'full'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'content_pdf',
        type: 'uuid',
        meta: {
          interface: 'file',
          note: 'Version PDF des CGV',
          sort: 5,
          width: 'half'
        }
      },
      {
        field: 'summary',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          note: 'Résumé des points clés',
          sort: 6,
          width: 'full'
        }
      },
      {
        field: 'effective_date',
        type: 'date',
        meta: {
          interface: 'datetime',
          required: true,
          note: "Date d'entrée en vigueur",
          sort: 7,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'expiry_date',
        type: 'date',
        meta: {
          interface: 'datetime',
          note: 'Date de fin de validité (null = pas expiration)',
          sort: 8,
          width: 'half'
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
              { text: 'Active', value: 'active' },
              { text: 'Archivée', value: 'archived' }
            ]
          },
          required: true,
          sort: 9,
          width: 'half'
        },
        schema: { is_nullable: false, default_value: 'draft' }
      },
      {
        field: 'changelog',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          note: 'Modifications vs version précédente',
          sort: 10,
          width: 'full'
        }
      },
      {
        field: 'legal_review_date',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          note: 'Date dernière revue juridique',
          sort: 11,
          width: 'half'
        }
      },
      {
        field: 'legal_reviewer',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Nom du juriste',
          sort: 12,
          width: 'half'
        },
        schema: { max_length: 100 }
      },
      {
        field: 'sort',
        type: 'integer',
        meta: { hidden: true, interface: 'input' },
        schema: { default_value: 0 }
      }
    ];

    for (const field of fields) {
      try {
        await api.post('/fields/cgv_versions', field);
        console.log(`   ✅ Field: ${field.field}`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ⚠️  Field ${field.field} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Create relation to owner_companies
    try {
      await api.post('/relations', {
        collection: 'cgv_versions',
        field: 'owner_company_id',
        related_collection: 'owner_companies',
        meta: { one_field: 'cgv_versions' },
        schema: { on_delete: 'SET NULL' }
      });
      console.log('   ✅ Relation: owner_company_id → owner_companies');
    } catch (err) {
      console.log('   ⚠️  Relation already exists');
    }

  } catch (error) {
    console.error('   ❌ Error creating cgv_versions:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// PARTIE 2.2: Collection cgv_acceptances
// ============================================
async function createCgvAcceptancesCollection() {
  console.log('\n📋 Creating collection: cgv_acceptances');

  try {
    const existing = await api.get('/collections/cgv_acceptances').catch(() => null);
    if (existing?.data) {
      console.log('   ⚠️  Collection cgv_acceptances already exists, skipping...');
      return;
    }

    await api.post('/collections', {
      collection: 'cgv_acceptances',
      meta: {
        icon: 'check_circle',
        note: 'Historique acceptations CGV - Preuve légale',
        display_template: '{{contact_id.first_name}} {{contact_id.last_name}} - {{accepted_at}}',
        color: '#4CAF50',
        singleton: false,
        accountability: 'all'
      },
      schema: { name: 'cgv_acceptances' }
    });

    console.log('   ✅ Collection created');

    const fields = [
      {
        field: 'contact_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{first_name}} {{last_name}}' },
          required: true,
          note: 'Client ayant accepté',
          sort: 1,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'company_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{name}}' },
          note: 'Entreprise cliente',
          sort: 2,
          width: 'half'
        }
      },
      {
        field: 'cgv_version_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: 'v{{version}}' },
          required: true,
          note: 'Version CGV acceptée',
          sort: 3,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'quote_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          note: 'Devis associé',
          sort: 4,
          width: 'half'
        }
      },
      {
        field: 'accepted_at',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          required: true,
          readonly: true,
          note: 'Horodatage exact acceptation',
          sort: 5,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'ip_address',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'Adresse IP client',
          sort: 6,
          width: 'half'
        },
        schema: { max_length: 45 }
      },
      {
        field: 'user_agent',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          readonly: true,
          note: 'User Agent navigateur',
          sort: 7,
          width: 'full'
        }
      },
      {
        field: 'acceptance_method',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Checkbox Portail Client', value: 'portal_checkbox' },
              { text: 'Signature Électronique', value: 'electronic_signature' },
              { text: 'Email avec lien', value: 'email_link' },
              { text: 'Signature manuscrite scannée', value: 'scanned_signature' }
            ]
          },
          required: true,
          sort: 8,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'cgv_content_snapshot',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          readonly: true,
          note: 'Copie CGV au moment acceptation',
          sort: 9,
          width: 'full'
        }
      },
      {
        field: 'cgv_hash',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'Hash SHA-256 pour vérification',
          sort: 10,
          width: 'half'
        },
        schema: { max_length: 64 }
      },
      {
        field: 'is_valid',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          note: 'Acceptation toujours valide',
          sort: 11,
          width: 'half'
        },
        schema: { default_value: true }
      },
      {
        field: 'revoked_at',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          note: 'Date révocation si applicable',
          sort: 12,
          width: 'half'
        }
      },
      {
        field: 'revocation_reason',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          note: 'Raison révocation',
          sort: 13,
          width: 'full'
        }
      }
    ];

    for (const field of fields) {
      try {
        await api.post('/fields/cgv_acceptances', field);
        console.log(`   ✅ Field: ${field.field}`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ⚠️  Field ${field.field} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Relations
    const relations = [
      { field: 'contact_id', related: 'people', one_field: 'cgv_acceptances' },
      { field: 'company_id', related: 'companies', one_field: 'cgv_acceptances' },
      { field: 'cgv_version_id', related: 'cgv_versions', one_field: 'acceptances' },
      { field: 'quote_id', related: 'quotes', one_field: 'cgv_acceptance' }
    ];

    for (const rel of relations) {
      try {
        await api.post('/relations', {
          collection: 'cgv_acceptances',
          field: rel.field,
          related_collection: rel.related,
          meta: { one_field: rel.one_field },
          schema: { on_delete: 'SET NULL' }
        });
        console.log(`   ✅ Relation: ${rel.field} → ${rel.related}`);
      } catch (err) {
        console.log(`   ⚠️  Relation ${rel.field} already exists`);
      }
    }

  } catch (error) {
    console.error('   ❌ Error creating cgv_acceptances:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// PARTIE 2.3: Collection signature_logs
// ============================================
async function createSignatureLogsCollection() {
  console.log('\n📋 Creating collection: signature_logs');

  try {
    const existing = await api.get('/collections/signature_logs').catch(() => null);
    if (existing?.data) {
      console.log('   ⚠️  Collection signature_logs already exists, skipping...');
      return;
    }

    await api.post('/collections', {
      collection: 'signature_logs',
      meta: {
        icon: 'draw',
        note: 'Historique signatures électroniques DocuSeal',
        display_template: '{{quote_id.quote_number}} - {{signer_name}} - {{signed_at}}',
        color: '#2196F3',
        singleton: false,
        accountability: 'all'
      },
      schema: { name: 'signature_logs' }
    });

    console.log('   ✅ Collection created');

    const fields = [
      {
        field: 'quote_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          required: true,
          note: 'Devis signé',
          sort: 1,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'contact_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{first_name}} {{last_name}}' },
          required: true,
          note: 'Signataire',
          sort: 2,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'signer_name',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'Nom complet signataire',
          sort: 3,
          width: 'half'
        },
        schema: { max_length: 255 }
      },
      {
        field: 'signer_email',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'Email signataire',
          sort: 4,
          width: 'half'
        },
        schema: { max_length: 255 }
      },
      {
        field: 'signer_role',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Client', value: 'client' },
              { text: 'Représentant légal', value: 'legal_representative' },
              { text: 'Mandataire', value: 'proxy' },
              { text: 'Co-signataire', value: 'co_signer' }
            ]
          },
          sort: 5,
          width: 'half'
        }
      },
      {
        field: 'docuseal_submission_id',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'ID soumission DocuSeal',
          sort: 6,
          width: 'half'
        },
        schema: { max_length: 100 }
      },
      {
        field: 'docuseal_document_id',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'ID document DocuSeal',
          sort: 7,
          width: 'half'
        },
        schema: { max_length: 100 }
      },
      {
        field: 'docuseal_audit_log_url',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'URL log audit DocuSeal',
          sort: 8,
          width: 'full'
        }
      },
      {
        field: 'signed_at',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          required: true,
          note: 'Horodatage signature',
          sort: 9,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'ip_address',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'IP lors signature',
          sort: 10,
          width: 'half'
        },
        schema: { max_length: 45 }
      },
      {
        field: 'user_agent',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          readonly: true,
          sort: 11,
          width: 'full'
        }
      },
      {
        field: 'geolocation',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: { language: 'JSON' },
          note: 'Géolocalisation si disponible',
          sort: 12,
          width: 'half'
        }
      },
      {
        field: 'signature_type',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'SES - Simple', value: 'SES' },
              { text: 'AES - Avancée', value: 'AES' },
              { text: 'QES - Qualifiée', value: 'QES' }
            ]
          },
          required: true,
          note: 'Niveau signature eIDAS/ZertES',
          sort: 13,
          width: 'half'
        },
        schema: { is_nullable: false, default_value: 'SES' }
      },
      {
        field: 'certificate_info',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: { language: 'JSON' },
          note: 'Info certificat (AES/QES)',
          sort: 14,
          width: 'full'
        }
      },
      {
        field: 'signed_document_url',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'URL document signé',
          sort: 15,
          width: 'full'
        }
      },
      {
        field: 'signed_document_file',
        type: 'uuid',
        meta: {
          interface: 'file',
          note: 'Fichier PDF signé',
          sort: 16,
          width: 'half'
        }
      },
      {
        field: 'document_hash',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'Hash SHA-256 document',
          sort: 17,
          width: 'half'
        },
        schema: { max_length: 64 }
      },
      {
        field: 'is_valid',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          sort: 18,
          width: 'half'
        },
        schema: { default_value: true }
      },
      {
        field: 'validation_errors',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: { language: 'JSON' },
          note: 'Erreurs validation',
          sort: 19,
          width: 'full'
        }
      }
    ];

    for (const field of fields) {
      try {
        await api.post('/fields/signature_logs', field);
        console.log(`   ✅ Field: ${field.field}`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ⚠️  Field ${field.field} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Relations
    const relations = [
      { field: 'quote_id', related: 'quotes', one_field: 'signature_logs' },
      { field: 'contact_id', related: 'people', one_field: 'signatures' }
    ];

    for (const rel of relations) {
      try {
        await api.post('/relations', {
          collection: 'signature_logs',
          field: rel.field,
          related_collection: rel.related,
          meta: { one_field: rel.one_field },
          schema: { on_delete: 'SET NULL' }
        });
        console.log(`   ✅ Relation: ${rel.field} → ${rel.related}`);
      } catch (err) {
        console.log(`   ⚠️  Relation ${rel.field} already exists`);
      }
    }

  } catch (error) {
    console.error('   ❌ Error creating signature_logs:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// PARTIE 2.4: Collection deposit_configs
// ============================================
async function createDepositConfigsCollection() {
  console.log('\n📋 Creating collection: deposit_configs');

  try {
    const existing = await api.get('/collections/deposit_configs').catch(() => null);
    if (existing?.data) {
      console.log('   ⚠️  Collection deposit_configs already exists, skipping...');
      return;
    }

    await api.post('/collections', {
      collection: 'deposit_configs',
      meta: {
        icon: 'percent',
        note: 'Configuration acomptes par entreprise et type projet',
        display_template: '{{owner_company_id.name}} - {{project_type}} : {{deposit_percentage}}%',
        color: '#FF9800',
        singleton: false,
        accountability: 'all'
      },
      schema: { name: 'deposit_configs' }
    });

    console.log('   ✅ Collection created');

    const fields = [
      {
        field: 'owner_company_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{name}}' },
          required: true,
          note: 'Entreprise',
          sort: 1,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'project_type',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Site Web / Application', value: 'web_design' },
              { text: 'Projet IA / Data', value: 'ai_project' },
              { text: 'Conseil / Consulting', value: 'consulting' },
              { text: 'Maintenance', value: 'maintenance' },
              { text: 'Formation', value: 'training' },
              { text: 'Location immobilière', value: 'rental' },
              { text: 'Vente immobilière', value: 'real_estate_sale' },
              { text: 'Restaurant / Takeout', value: 'food_service' },
              { text: 'Juridique', value: 'legal' },
              { text: 'Défaut (tous types)', value: 'default' }
            ]
          },
          required: true,
          note: 'Type projet',
          sort: 2,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'deposit_percentage',
        type: 'decimal',
        meta: {
          interface: 'input',
          options: { min: 0, max: 100, step: 5 },
          required: true,
          note: 'Pourcentage acompte (0-100)',
          sort: 3,
          width: 'half'
        },
        schema: { is_nullable: false, numeric_precision: 5, numeric_scale: 2 }
      },
      {
        field: 'min_amount_for_deposit',
        type: 'decimal',
        meta: {
          interface: 'input',
          note: 'Montant min devis pour acompte (0 = toujours)',
          sort: 4,
          width: 'half'
        },
        schema: { numeric_precision: 10, numeric_scale: 2, default_value: 0 }
      },
      {
        field: 'max_deposit_amount',
        type: 'decimal',
        meta: {
          interface: 'input',
          note: 'Montant max acompte (null = pas limite)',
          sort: 5,
          width: 'half'
        },
        schema: { numeric_precision: 10, numeric_scale: 2 }
      },
      {
        field: 'allow_split_deposit',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          note: 'Autoriser paiement en plusieurs fois',
          sort: 6,
          width: 'half'
        },
        schema: { default_value: false }
      },
      {
        field: 'split_count',
        type: 'integer',
        meta: {
          interface: 'input',
          options: { min: 2, max: 4 },
          note: 'Nombre versements si split',
          sort: 7,
          width: 'half'
        }
      },
      {
        field: 'auto_create_invoice',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          note: 'Créer facture acompte auto à signature',
          sort: 8,
          width: 'half'
        },
        schema: { default_value: true }
      },
      {
        field: 'payment_delay_days',
        type: 'integer',
        meta: {
          interface: 'input',
          options: { min: 0, max: 30 },
          note: 'Délai paiement (jours)',
          sort: 9,
          width: 'half'
        },
        schema: { default_value: 0 }
      },
      {
        field: 'priority',
        type: 'integer',
        meta: {
          interface: 'input',
          note: 'Priorité (plus haut = prioritaire)',
          sort: 10,
          width: 'half'
        },
        schema: { default_value: 10 }
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Actif', value: 'active' },
              { text: 'Inactif', value: 'inactive' }
            ]
          },
          sort: 11,
          width: 'half'
        },
        schema: { default_value: 'active' }
      }
    ];

    for (const field of fields) {
      try {
        await api.post('/fields/deposit_configs', field);
        console.log(`   ✅ Field: ${field.field}`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ⚠️  Field ${field.field} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Relation
    try {
      await api.post('/relations', {
        collection: 'deposit_configs',
        field: 'owner_company_id',
        related_collection: 'owner_companies',
        meta: { one_field: 'deposit_configs' },
        schema: { on_delete: 'CASCADE' }
      });
      console.log('   ✅ Relation: owner_company_id → owner_companies');
    } catch (err) {
      console.log('   ⚠️  Relation already exists');
    }

  } catch (error) {
    console.error('   ❌ Error creating deposit_configs:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// PARTIE 2.5: Collection client_portal_accounts
// ============================================
async function createClientPortalAccountsCollection() {
  console.log('\n📋 Creating collection: client_portal_accounts');

  try {
    const existing = await api.get('/collections/client_portal_accounts').catch(() => null);
    if (existing?.data) {
      console.log('   ⚠️  Collection client_portal_accounts already exists, skipping...');
      return;
    }

    await api.post('/collections', {
      collection: 'client_portal_accounts',
      meta: {
        icon: 'account_circle',
        note: "Comptes d'accès portail client",
        display_template: '{{contact_id.first_name}} {{contact_id.last_name}} - {{portal_domain}}',
        color: '#009688',
        singleton: false,
        accountability: 'all'
      },
      schema: { name: 'client_portal_accounts' }
    });

    console.log('   ✅ Collection created');

    const fields = [
      {
        field: 'contact_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{first_name}} {{last_name}}' },
          required: true,
          note: 'Contact associé',
          sort: 1,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'company_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{name}}' },
          note: 'Entreprise cliente',
          sort: 2,
          width: 'half'
        }
      },
      {
        field: 'owner_company_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{name}}' },
          required: true,
          note: 'Notre entreprise (détermine portail)',
          sort: 3,
          width: 'half'
        },
        schema: { is_nullable: false }
      },
      {
        field: 'email',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Email de connexion',
          sort: 4,
          width: 'half'
        },
        schema: { is_nullable: false, max_length: 255 }
      },
      {
        field: 'password_hash',
        type: 'string',
        meta: {
          interface: 'input',
          hidden: true,
          note: 'Hash mot de passe (bcrypt)',
          sort: 5
        },
        schema: { max_length: 255 }
      },
      {
        field: 'password_reset_token',
        type: 'string',
        meta: { interface: 'input', hidden: true, sort: 6 },
        schema: { max_length: 255 }
      },
      {
        field: 'password_reset_expires',
        type: 'timestamp',
        meta: { hidden: true, sort: 7 }
      },
      {
        field: 'portal_domain',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          note: 'Domaine portail (ex: client.hypervisual.ch)',
          sort: 8,
          width: 'half'
        },
        schema: { max_length: 100 }
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Actif', value: 'active' },
              { text: 'En attente activation', value: 'pending' },
              { text: 'Suspendu', value: 'suspended' },
              { text: 'Désactivé', value: 'disabled' }
            ]
          },
          sort: 9,
          width: 'half'
        },
        schema: { default_value: 'pending' }
      },
      {
        field: 'activation_token',
        type: 'string',
        meta: { hidden: true, sort: 10 },
        schema: { max_length: 255 }
      },
      {
        field: 'activated_at',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          sort: 11,
          width: 'half'
        }
      },
      {
        field: 'last_login_at',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          sort: 12,
          width: 'half'
        }
      },
      {
        field: 'last_login_ip',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          sort: 13,
          width: 'half'
        },
        schema: { max_length: 45 }
      },
      {
        field: 'failed_login_attempts',
        type: 'integer',
        meta: {
          interface: 'input',
          sort: 14,
          width: 'half'
        },
        schema: { default_value: 0 }
      },
      {
        field: 'locked_until',
        type: 'timestamp',
        meta: { hidden: true, sort: 15 }
      },
      {
        field: 'language',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Français', value: 'fr' },
              { text: 'English', value: 'en' },
              { text: 'Deutsch', value: 'de' },
              { text: 'Italiano', value: 'it' }
            ]
          },
          sort: 16,
          width: 'half'
        },
        schema: { default_value: 'fr' }
      },
      {
        field: 'notification_preferences',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: { language: 'JSON' },
          note: 'Préférences notification',
          sort: 17,
          width: 'full'
        }
      }
    ];

    for (const field of fields) {
      try {
        await api.post('/fields/client_portal_accounts', field);
        console.log(`   ✅ Field: ${field.field}`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ⚠️  Field ${field.field} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Relations
    const relations = [
      { field: 'contact_id', related: 'people', one_field: 'portal_accounts' },
      { field: 'company_id', related: 'companies', one_field: 'portal_accounts' },
      { field: 'owner_company_id', related: 'owner_companies', one_field: 'client_portal_accounts' }
    ];

    for (const rel of relations) {
      try {
        await api.post('/relations', {
          collection: 'client_portal_accounts',
          field: rel.field,
          related_collection: rel.related,
          meta: { one_field: rel.one_field },
          schema: { on_delete: 'SET NULL' }
        });
        console.log(`   ✅ Relation: ${rel.field} → ${rel.related}`);
      } catch (err) {
        console.log(`   ⚠️  Relation ${rel.field} already exists`);
      }
    }

  } catch (error) {
    console.error('   ❌ Error creating client_portal_accounts:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// PARTIE 2.6: Enrichir collection quotes
// ============================================
async function enrichQuotesCollection() {
  console.log('\n📋 Enriching collection: quotes');

  const fieldsToAdd = [
    {
      field: 'quote_number',
      type: 'string',
      meta: {
        interface: 'input',
        readonly: true,
        note: 'Numéro devis auto (DEV-YYYY-XXXX)',
        sort: 1,
        width: 'half'
      },
      schema: { max_length: 20 }
    },
    {
      field: 'lead_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        display: 'related-values',
        note: 'Lead source',
        sort: 2,
        width: 'half'
      }
    },
    {
      field: 'contact_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        display: 'related-values',
        display_options: { template: '{{first_name}} {{last_name}}' },
        required: true,
        note: 'Contact principal',
        sort: 3,
        width: 'half'
      },
      schema: { is_nullable: false }
    },
    {
      field: 'company_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        display: 'related-values',
        display_options: { template: '{{name}}' },
        note: 'Entreprise cliente',
        sort: 4,
        width: 'half'
      }
    },
    {
      field: 'owner_company_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        display: 'related-values',
        display_options: { template: '{{name}}' },
        required: true,
        note: 'Notre entreprise émettrice',
        sort: 5,
        width: 'half'
      },
      schema: { is_nullable: false }
    },
    {
      field: 'project_type',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Site Web / Application', value: 'web_design' },
            { text: 'Projet IA / Data', value: 'ai_project' },
            { text: 'Conseil / Consulting', value: 'consulting' },
            { text: 'Maintenance', value: 'maintenance' },
            { text: 'Formation', value: 'training' },
            { text: 'Location immobilière', value: 'rental' },
            { text: 'Vente immobilière', value: 'real_estate_sale' },
            { text: 'Restaurant / Takeout', value: 'food_service' },
            { text: 'Juridique', value: 'legal' }
          ]
        },
        note: 'Type projet',
        sort: 6,
        width: 'half'
      }
    },
    {
      field: 'subtotal',
      type: 'decimal',
      meta: {
        interface: 'input',
        note: 'Sous-total HT',
        sort: 10,
        width: 'half'
      },
      schema: { numeric_precision: 12, numeric_scale: 2 }
    },
    {
      field: 'tax_rate',
      type: 'decimal',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: '8.1% - Normal', value: '8.1' },
            { text: '2.6% - Réduit', value: '2.6' },
            { text: '3.8% - Hébergement', value: '3.8' },
            { text: '0% - Exonéré', value: '0' }
          ]
        },
        note: 'Taux TVA suisse 2025',
        sort: 11,
        width: 'half'
      },
      schema: { numeric_precision: 4, numeric_scale: 2, default_value: 8.1 }
    },
    {
      field: 'tax_amount',
      type: 'decimal',
      meta: {
        interface: 'input',
        readonly: true,
        note: 'Montant TVA',
        sort: 12,
        width: 'half'
      },
      schema: { numeric_precision: 12, numeric_scale: 2 }
    },
    {
      field: 'total',
      type: 'decimal',
      meta: {
        interface: 'input',
        note: 'Total TTC',
        sort: 13,
        width: 'half'
      },
      schema: { numeric_precision: 12, numeric_scale: 2 }
    },
    {
      field: 'currency',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'CHF', value: 'CHF' },
            { text: 'EUR', value: 'EUR' },
            { text: 'USD', value: 'USD' }
          ]
        },
        sort: 14,
        width: 'half'
      },
      schema: { max_length: 3, default_value: 'CHF' }
    },
    {
      field: 'sent_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        note: 'Date envoi client',
        sort: 20,
        width: 'half'
      }
    },
    {
      field: 'viewed_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        note: 'Date première consultation',
        sort: 21,
        width: 'half'
      }
    },
    {
      field: 'signed_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        note: 'Date signature',
        sort: 22,
        width: 'half'
      }
    },
    {
      field: 'valid_until',
      type: 'date',
      meta: {
        interface: 'datetime',
        note: 'Date validité devis',
        sort: 23,
        width: 'half'
      }
    },
    {
      field: 'is_signed',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        note: 'Devis signé électroniquement',
        sort: 30,
        width: 'half'
      },
      schema: { default_value: false }
    },
    {
      field: 'cgv_accepted',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        note: 'CGV acceptées',
        sort: 31,
        width: 'half'
      },
      schema: { default_value: false }
    },
    {
      field: 'cgv_version_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        note: 'Version CGV acceptée',
        sort: 32,
        width: 'half'
      }
    },
    {
      field: 'cgv_acceptance_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        note: 'Référence acceptation CGV',
        sort: 33,
        width: 'half'
      }
    },
    {
      field: 'deposit_percentage',
      type: 'decimal',
      meta: {
        interface: 'input',
        note: 'Pourcentage acompte',
        sort: 40,
        width: 'half'
      },
      schema: { numeric_precision: 5, numeric_scale: 2 }
    },
    {
      field: 'deposit_amount',
      type: 'decimal',
      meta: {
        interface: 'input',
        readonly: true,
        note: 'Montant acompte',
        sort: 41,
        width: 'half'
      },
      schema: { numeric_precision: 12, numeric_scale: 2 }
    },
    {
      field: 'deposit_invoice_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        note: "Facture d'acompte",
        sort: 42,
        width: 'half'
      }
    },
    {
      field: 'deposit_paid',
      type: 'boolean',
      meta: {
        interface: 'boolean',
        note: 'Acompte payé',
        sort: 43,
        width: 'half'
      },
      schema: { default_value: false }
    },
    {
      field: 'deposit_paid_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        sort: 44,
        width: 'half'
      }
    },
    {
      field: 'project_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        note: 'Projet créé',
        sort: 50,
        width: 'half'
      }
    }
  ];

  for (const field of fieldsToAdd) {
    try {
      await api.post('/fields/quotes', field);
      console.log(`   ✅ Field: ${field.field}`);
    } catch (err) {
      if (err.response?.status === 400) {
        console.log(`   ⚠️  Field ${field.field} already exists`);
      } else {
        console.error(`   ❌ Field ${field.field}:`, err.response?.data?.errors?.[0]?.message || err.message);
      }
    }
  }

  // Relations for quotes
  const relations = [
    { field: 'lead_id', related: 'leads', one_field: 'quotes' },
    { field: 'contact_id', related: 'people', one_field: 'quotes' },
    { field: 'company_id', related: 'companies', one_field: 'quotes' },
    { field: 'owner_company_id', related: 'owner_companies', one_field: 'quotes' },
    { field: 'cgv_version_id', related: 'cgv_versions', one_field: null },
    { field: 'cgv_acceptance_id', related: 'cgv_acceptances', one_field: null },
    { field: 'deposit_invoice_id', related: 'client_invoices', one_field: null },
    { field: 'project_id', related: 'projects', one_field: 'quote' }
  ];

  for (const rel of relations) {
    try {
      await api.post('/relations', {
        collection: 'quotes',
        field: rel.field,
        related_collection: rel.related,
        meta: rel.one_field ? { one_field: rel.one_field } : {},
        schema: { on_delete: 'SET NULL' }
      });
      console.log(`   ✅ Relation: ${rel.field} → ${rel.related}`);
    } catch (err) {
      console.log(`   ⚠️  Relation ${rel.field} already exists`);
    }
  }
}

// ============================================
// PARTIE 2.7: Seed data - Initial CGV versions
// ============================================
async function seedInitialData() {
  console.log('\n📋 Seeding initial data');

  try {
    // Get owner companies
    const companies = await api.get('/items/owner_companies');
    const ownerCompanies = companies.data.data;

    for (const company of ownerCompanies) {
      // Check if CGV already exists
      const existingCgv = await api.get('/items/cgv_versions', {
        params: {
          filter: { owner_company_id: { _eq: company.id } },
          limit: 1
        }
      });

      if (existingCgv.data.data.length > 0) {
        console.log(`   ⚠️  CGV already exists for ${company.name}`);
        continue;
      }

      // Create initial CGV
      await api.post('/items/cgv_versions', {
        owner_company_id: company.id,
        version: '1.0',
        title: `Conditions Générales de Vente - ${company.name}`,
        content_html: `<h1>Conditions Générales de Vente</h1>
<h2>Article 1 - Objet</h2>
<p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre ${company.name} et ses clients.</p>

<h2>Article 2 - Prix et paiement</h2>
<p>Les prix sont indiqués en CHF, hors TVA. La TVA applicable est de 8.1% sauf mention contraire.</p>
<p>Un acompte peut être demandé à la signature du devis. Le solde est payable selon les conditions indiquées sur la facture.</p>

<h2>Article 3 - Livraison</h2>
<p>Les délais de livraison sont donnés à titre indicatif et ne peuvent engager notre responsabilité.</p>

<h2>Article 4 - Propriété intellectuelle</h2>
<p>Tous les droits de propriété intellectuelle restent la propriété de ${company.name} jusqu'au paiement intégral.</p>

<h2>Article 5 - Responsabilité</h2>
<p>La responsabilité de ${company.name} est limitée au montant du contrat.</p>

<h2>Article 6 - Droit applicable</h2>
<p>Les présentes CGV sont soumises au droit suisse. Le for juridique est établi au siège de ${company.name}.</p>`,
        summary: `CGV de ${company.name} - Version initiale`,
        effective_date: new Date().toISOString().split('T')[0],
        status: 'active',
        changelog: 'Version initiale',
        sort: 1
      });

      console.log(`   ✅ Created CGV v1.0 for ${company.name}`);
    }

    // Create default deposit configs
    const projectTypes = [
      { type: 'web_design', percentage: 50 },
      { type: 'ai_project', percentage: 50 },
      { type: 'consulting', percentage: 30 },
      { type: 'maintenance', percentage: 0 },
      { type: 'training', percentage: 100 },
      { type: 'rental', percentage: 100 },
      { type: 'real_estate_sale', percentage: 10 },
      { type: 'food_service', percentage: 0 },
      { type: 'legal', percentage: 50 },
      { type: 'default', percentage: 30 }
    ];

    for (const company of ownerCompanies) {
      // Check if deposit config exists
      const existingConfig = await api.get('/items/deposit_configs', {
        params: {
          filter: { owner_company_id: { _eq: company.id } },
          limit: 1
        }
      });

      if (existingConfig.data.data.length > 0) {
        console.log(`   ⚠️  Deposit configs already exist for ${company.name}`);
        continue;
      }

      for (const pt of projectTypes) {
        await api.post('/items/deposit_configs', {
          owner_company_id: company.id,
          project_type: pt.type,
          deposit_percentage: pt.percentage,
          min_amount_for_deposit: 0,
          auto_create_invoice: true,
          payment_delay_days: 0,
          priority: pt.type === 'default' ? 1 : 10,
          status: 'active'
        });
      }
      console.log(`   ✅ Created deposit configs for ${company.name}`);
    }

  } catch (error) {
    console.error('   ❌ Error seeding data:', error.response?.data || error.message);
  }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  console.log('🚀 Starting Migration 006: Commercial Workflow Collections');
  console.log('=' .repeat(60));
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Token: ${DIRECTUS_TOKEN.substring(0, 10)}...`);

  try {
    // Test connection
    const ping = await api.get('/server/ping');
    if (ping.data !== 'pong') {
      throw new Error('Directus not responding');
    }
    console.log('\n✅ Directus connection OK');

    // Execute migrations
    await createCgvVersionsCollection();
    await createCgvAcceptancesCollection();
    await createSignatureLogsCollection();
    await createDepositConfigsCollection();
    await createClientPortalAccountsCollection();
    await enrichQuotesCollection();
    await seedInitialData();

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Migration 006 completed successfully!');
    console.log('=' .repeat(60));

    // Summary
    console.log('\n📊 Summary:');
    console.log('   - Created: cgv_versions');
    console.log('   - Created: cgv_acceptances');
    console.log('   - Created: signature_logs');
    console.log('   - Created: deposit_configs');
    console.log('   - Created: client_portal_accounts');
    console.log('   - Enriched: quotes (25+ new fields)');
    console.log('   - Seeded: Initial CGV and deposit configs');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
