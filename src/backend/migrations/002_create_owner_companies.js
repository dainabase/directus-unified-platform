#!/usr/bin/env node

import { createDirectus, rest, authentication, createCollection, createItem } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(authentication())
  .with(rest());

// Token API Directus
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

client.setToken(DIRECTUS_TOKEN);

async function createOwnerCompaniesCollection() {
  console.log('🏢 Creating owner_companies collection and data');
  console.log('='.repeat(60));

  // Créer la collection owner_companies
  try {
    console.log('📝 Creating owner_companies collection...');
    
    await client.request(
      createCollection({
        collection: 'owner_companies',
        meta: {
          collection: 'owner_companies',
          icon: 'business',
          note: 'Les 5 entreprises du groupe unifié',
          display_template: '{{name}} ({{code}})',
          color: '#2196F3',
          sort_field: 'sort',
          translations: [
            {
              language: 'fr-FR',
              translation: 'Entreprises propriétaires',
              singular: 'Entreprise propriétaire',
              plural: 'Entreprises propriétaires'
            }
          ]
        },
        schema: {
          name: 'owner_companies'
        },
        fields: [
          {
            field: 'id',
            type: 'uuid',
            schema: {
              is_primary_key: true
            },
            meta: {
              interface: 'input',
              readonly: true,
              hidden: true
            }
          },
          {
            field: 'code',
            type: 'string',
            schema: {
              max_length: 50,
              is_unique: true,
              is_nullable: false
            },
            meta: {
              interface: 'input',
              readonly: false,
              required: true,
              sort: 1,
              width: 'half',
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Code'
                }
              ]
            }
          },
          {
            field: 'name',
            type: 'string',
            schema: {
              max_length: 255,
              is_nullable: false
            },
            meta: {
              interface: 'input',
              required: true,
              sort: 2,
              width: 'half',
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Nom'
                }
              ]
            }
          },
          {
            field: 'type',
            type: 'string',
            schema: {
              max_length: 50,
              default_value: 'subsidiary'
            },
            meta: {
              interface: 'select-dropdown',
              sort: 3,
              width: 'half',
              options: {
                choices: [
                  { text: 'Entreprise principale', value: 'main' },
                  { text: 'Filiale', value: 'subsidiary' },
                  { text: 'Division', value: 'division' }
                ]
              },
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Type'
                }
              ]
            }
          },
          {
            field: 'color',
            type: 'string',
            schema: {
              max_length: 7,
              default_value: '#2196F3'
            },
            meta: {
              interface: 'select-color',
              sort: 4,
              width: 'half',
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Couleur'
                }
              ]
            }
          },
          {
            field: 'logo',
            type: 'uuid',
            meta: {
              interface: 'file-image',
              sort: 5,
              width: 'half',
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Logo'
                }
              ]
            }
          },
          {
            field: 'sort',
            type: 'integer',
            schema: {
              default_value: 1
            },
            meta: {
              interface: 'input',
              sort: 6,
              width: 'half',
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Ordre d\'affichage'
                }
              ]
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
              sort: 7,
              width: 'half',
              options: {
                choices: [
                  { text: 'Actif', value: 'active' },
                  { text: 'Inactif', value: 'inactive' },
                  { text: 'Archivé', value: 'archived' }
                ]
              },
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Statut'
                }
              ]
            }
          },
          {
            field: 'description',
            type: 'text',
            meta: {
              interface: 'input-multiline',
              sort: 8,
              width: 'full',
              translations: [
                {
                  language: 'fr-FR',
                  translation: 'Description'
                }
              ]
            }
          },
          {
            field: 'created_at',
            type: 'timestamp',
            schema: {
              default_value: 'CURRENT_TIMESTAMP'
            },
            meta: {
              interface: 'datetime',
              readonly: true,
              sort: 9,
              width: 'half',
              special: ['date-created']
            }
          },
          {
            field: 'updated_at',
            type: 'timestamp',
            meta: {
              interface: 'datetime',
              readonly: true,
              sort: 10,
              width: 'half',
              special: ['date-updated']
            }
          }
        ]
      })
    );
    
    console.log('✅ Created owner_companies collection successfully');
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('⚠️ owner_companies collection already exists');
    } else {
      console.error('❌ Error creating collection:', error.message || error);
      throw error;
    }
  }

  // Insérer les 5 entreprises
  console.log('\n📊 Inserting company data...');
  const companies = [
    {
      code: 'HYPERVISUAL',
      name: 'HYPERVISUAL',
      type: 'main',
      color: '#2196F3',
      sort: 1,
      status: 'active',
      description: 'Entreprise principale - Solutions de visualisation et développement'
    },
    {
      code: 'DAINAMICS',
      name: 'DAINAMICS', 
      type: 'subsidiary',
      color: '#4CAF50',
      sort: 2,
      status: 'active',
      description: 'Filiale spécialisée en data analytics et intelligence artificielle'
    },
    {
      code: 'LEXAIA',
      name: 'LEXAIA',
      type: 'subsidiary',
      color: '#FF9800',
      sort: 3,
      status: 'active',
      description: 'Solutions juridiques et conformité réglementaire'
    },
    {
      code: 'ENKI_REALTY',
      name: 'ENKI REALTY',
      type: 'subsidiary',
      color: '#9C27B0',
      sort: 4,
      status: 'active',
      description: 'Immobilier commercial et résidentiel'
    },
    {
      code: 'TAKEOUT',
      name: 'TAKEOUT',
      type: 'subsidiary',
      color: '#F44336',
      sort: 5,
      status: 'active',
      description: 'Services de restauration et livraison'
    }
  ];

  let insertedCount = 0;
  for (const company of companies) {
    try {
      await client.request(
        createItem('owner_companies', company)
      );
      console.log(`✅ Inserted ${company.name} (${company.code})`);
      insertedCount++;
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log(`⚠️ ${company.name} already exists`);
      } else {
        console.error(`❌ Error inserting ${company.name}:`, error.message || error);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY: ${insertedCount}/${companies.length} companies inserted`);
  console.log('✅ owner_companies setup completed!');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  createOwnerCompaniesCollection().catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}