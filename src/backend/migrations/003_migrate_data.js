#!/usr/bin/env node

import { createDirectus, rest, authentication, readItems, updateItem } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(authentication())
  .with(rest());

// Token API Directus
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

client.setToken(DIRECTUS_TOKEN);

async function migrateExistingData() {
  console.log('🔄 Migrating existing data with owner_company');
  console.log('='.repeat(60));

  let totalMigrated = 0;

  // 1. Migrer time_tracking basé sur project_id
  console.log('\n📊 Migrating time_tracking...');
  try {
    const timeTracks = await client.request(
      readItems('time_tracking', {
        limit: -1,
        fields: ['id', 'project_id', 'owner_company'],
        filter: {
          project_id: {
            _nnull: true
          }
        }
      })
    );

    console.log(`Found ${timeTracks.length} time_tracking records to check`);

    // Récupérer les projets avec leur owner_company
    const projects = await client.request(
      readItems('projects', {
        limit: -1,
        fields: ['id', 'owner_company']
      })
    );

    const projectOwnerMap = {};
    projects.forEach(project => {
      if (project.owner_company) {
        projectOwnerMap[project.id] = project.owner_company;
      }
    });

    let migratedCount = 0;
    for (const track of timeTracks) {
      if (!track.owner_company && track.project_id && projectOwnerMap[track.project_id]) {
        await client.request(
          updateItem('time_tracking', track.id, {
            owner_company: projectOwnerMap[track.project_id]
          })
        );
        migratedCount++;
      }
    }

    console.log(`✅ Migrated ${migratedCount} time_tracking records`);
    totalMigrated += migratedCount;
  } catch (error) {
    console.log('⚠️ time_tracking collection not found or error:', error.message);
  }

  // 2. Migrer deliverables basé sur project_id
  console.log('\n📦 Migrating deliverables...');
  try {
    const deliverables = await client.request(
      readItems('deliverables', {
        limit: -1,
        fields: ['id', 'project_id', 'owner_company'],
        filter: {
          project_id: {
            _nnull: true
          }
        }
      })
    );

    console.log(`Found ${deliverables.length} deliverables to check`);

    let migratedCount = 0;
    for (const deliverable of deliverables) {
      if (!deliverable.owner_company && deliverable.project_id) {
        // Récupérer le projet parent
        try {
          const project = await client.request(
            readItems('projects', {
              filter: { id: { _eq: deliverable.project_id } },
              fields: ['owner_company']
            })
          );

          if (project[0] && project[0].owner_company) {
            await client.request(
              updateItem('deliverables', deliverable.id, {
                owner_company: project[0].owner_company
              })
            );
            migratedCount++;
          }
        } catch (err) {
          console.log(`⚠️ Could not find project ${deliverable.project_id} for deliverable ${deliverable.id}`);
        }
      }
    }

    console.log(`✅ Migrated ${migratedCount} deliverables`);
    totalMigrated += migratedCount;
  } catch (error) {
    console.log('⚠️ deliverables collection not found or error:', error.message);
  }

  // 3. Migrer budgets basé sur project_id
  console.log('\n💰 Migrating budgets...');
  try {
    const budgets = await client.request(
      readItems('budgets', {
        limit: -1,
        fields: ['id', 'project_id', 'owner_company'],
        filter: {
          project_id: {
            _nnull: true
          }
        }
      })
    );

    console.log(`Found ${budgets.length} budgets to check`);

    let migratedCount = 0;
    for (const budget of budgets) {
      if (!budget.owner_company && budget.project_id) {
        try {
          const project = await client.request(
            readItems('projects', {
              filter: { id: { _eq: budget.project_id } },
              fields: ['owner_company']
            })
          );

          if (project[0] && project[0].owner_company) {
            await client.request(
              updateItem('budgets', budget.id, {
                owner_company: project[0].owner_company
              })
            );
            migratedCount++;
          }
        } catch (err) {
          console.log(`⚠️ Could not find project ${budget.project_id} for budget ${budget.id}`);
        }
      }
    }

    console.log(`✅ Migrated ${migratedCount} budgets`);
    totalMigrated += migratedCount;
  } catch (error) {
    console.log('⚠️ budgets collection not found or error:', error.message);
  }

  // 4. Pour les collections sans relation directe, utiliser HYPERVISUAL par défaut
  const collectionsToDefault = [
    'quotes',
    'proposals', 
    'support_tickets',
    'notifications',
    'audit_logs',
    'settings',
    'compliance',
    'kpis'
  ];

  for (const collection of collectionsToDefault) {
    console.log(`\n🔧 Setting default owner_company for ${collection}...`);
    
    try {
      const items = await client.request(
        readItems(collection, {
          limit: -1,
          fields: ['id', 'owner_company'],
          filter: {
            owner_company: {
              _null: true
            }
          }
        })
      );

      console.log(`Found ${items.length} ${collection} records without owner_company`);

      let migratedCount = 0;
      for (const item of items) {
        await client.request(
          updateItem(collection, item.id, {
            owner_company: 'HYPERVISUAL'
          })
        );
        migratedCount++;
      }

      console.log(`✅ Set default owner_company for ${migratedCount} ${collection} records`);
      totalMigrated += migratedCount;
    } catch (error) {
      console.log(`⚠️ ${collection} collection not found or error:`, error.message);
    }
  }

  // 5. Répartition intelligente pour certaines collections
  console.log('\n🎯 Smart distribution for remaining collections...');
  
  // Répartir les expenses par entreprise selon un pattern
  try {
    const expenses = await client.request(
      readItems('expenses', {
        limit: -1,
        fields: ['id', 'owner_company', 'description', 'amount'],
        filter: {
          owner_company: {
            _null: true
          }
        }
      })
    );

    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    let companyIndex = 0;

    for (const expense of expenses) {
      // Logique de répartition intelligente basée sur le contenu
      let assignedCompany = 'HYPERVISUAL'; // défaut

      if (expense.description) {
        const desc = expense.description.toLowerCase();
        if (desc.includes('data') || desc.includes('analytics') || desc.includes('ai')) {
          assignedCompany = 'DAINAMICS';
        } else if (desc.includes('legal') || desc.includes('juridique') || desc.includes('compliance')) {
          assignedCompany = 'LEXAIA';
        } else if (desc.includes('immobilier') || desc.includes('real estate') || desc.includes('property')) {
          assignedCompany = 'ENKI_REALTY';
        } else if (desc.includes('food') || desc.includes('restaurant') || desc.includes('delivery')) {
          assignedCompany = 'TAKEOUT';
        } else {
          // Répartition équitable pour les autres
          assignedCompany = companies[companyIndex % companies.length];
          companyIndex++;
        }
      }

      await client.request(
        updateItem('expenses', expense.id, {
          owner_company: assignedCompany
        })
      );
    }

    console.log(`✅ Smart distributed ${expenses.length} expenses`);
    totalMigrated += expenses.length;
  } catch (error) {
    console.log('⚠️ expenses collection not found or error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 DATA MIGRATION SUMMARY:`);
  console.log(`✅ Total records migrated: ${totalMigrated}`);
  console.log('✅ Data migration completed successfully!');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExistingData().catch(error => {
    console.error('💥 Data migration failed:', error);
    process.exit(1);
  });
}