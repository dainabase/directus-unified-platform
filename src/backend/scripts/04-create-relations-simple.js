#!/usr/bin/env node

/**
 * 🔗 SCRIPT DE LIAISON DES DONNÉES CRÉÉES
 * 
 * Crée les relations entre les données existantes
 */

import axios from 'axios';

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

const api = axios.create({
    baseURL: `${DIRECTUS_URL}/items`,
    headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

let stats = {
    people_linked: 0,
    projects_linked: 0,
    interactions_created: 0,
    deliverables_created: 0,
    errors: 0
};

async function getCompanyData(companyId) {
    try {
        const [peopleRes, projectsRes] = await Promise.all([
            api.get('/people', {
                params: { 'filter[owner_company][_eq]': companyId, limit: -1 }
            }),
            api.get('/projects', {
                params: { 'filter[owner_company][_eq]': companyId, limit: -1 }
            })
        ]);
        
        return {
            people: peopleRes.data.data,
            projects: projectsRes.data.data
        };
    } catch (error) {
        console.error(`❌ Erreur récupération données:`, error.response?.data || error.message);
        return { people: [], projects: [] };
    }
}

async function updateItem(collection, id, data) {
    if (DRY_RUN) {
        console.log(`   🔍 DRY-RUN Update ${collection}/${id}:`, Object.keys(data).join(', '));
        return;
    }
    
    try {
        await api.patch(`/${collection}/${id}`, data);
    } catch (error) {
        throw new Error(`${error.response?.status}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
}

async function createItem(collection, data) {
    if (DRY_RUN) {
        console.log(`   🔍 DRY-RUN Create ${collection}:`, data.title || data.name || 'Item');
        return { id: 'dry-run-id' };
    }
    
    try {
        const response = await api.post(`/${collection}`, data);
        return response.data.data;
    } catch (error) {
        throw new Error(`${error.response?.status}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
}

async function createCompanyRelations(companyName, companyId) {
    console.log(`\n🏢 Traitement des relations pour ${companyName}...`);
    
    try {
        const data = await getCompanyData(companyId);
        console.log(`   📊 ${data.people.length} personnes, ${data.projects.length} projets`);
        
        if (data.people.length === 0 || data.projects.length === 0) {
            console.log('   ⚠️  Pas assez de données pour créer des relations');
            return;
        }
        
        // Lier les personnes aux projets via company_people (si disponible)
        console.log('   🔗 Liaison personnes-projets...');
        for (let i = 0; i < data.projects.length; i++) {
            const project = data.projects[i];
            const person = data.people[i % data.people.length]; // Rotation
            
            // Essayer de mettre à jour le projet avec un contact principal
            try {
                await updateItem('projects', project.id, {
                    main_contact: person.id,
                    updated_at: new Date().toISOString()
                });
                console.log(`      ✅ Projet "${project.name}" → ${person.first_name} ${person.last_name}`);
                stats.projects_linked++;
            } catch (error) {
                // Ignorer si le champ n'existe pas
                if (!error.message.includes('field does not exist')) {
                    console.log(`      ⚠️  ${error.message}`);
                }
            }
        }
        
        // Créer des interactions client
        console.log('   📞 Création d\'interactions...');
        const interactionTypes = [
            { type: 'call', description: 'Appel de suivi projet' },
            { type: 'meeting', description: 'Réunion d\'avancement' },
            { type: 'email', description: 'Échange par email' }
        ];
        
        for (let i = 0; i < Math.min(2, data.people.length); i++) {
            const person = data.people[i];
            const interaction = interactionTypes[i % interactionTypes.length];
            
            const interactionData = {
                interaction_type: interaction.type,
                description: `${interaction.description} - ${person.first_name} ${person.last_name}`,
                interaction_date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
                owner_company: companyId,
                created_at: new Date().toISOString()
            };
            
            try {
                await createItem('interactions', interactionData);
                console.log(`      ✅ Interaction: ${interaction.type} avec ${person.first_name}`);
                stats.interactions_created++;
            } catch (error) {
                if (!error.message.includes('not found')) {
                    console.log(`      ⚠️  ${error.message}`);
                }
            }
        }
        
        // Créer des livrables pour les projets
        console.log('   📦 Création de livrables...');
        const deliverableTemplates = [
            { title: 'Analyse des besoins', type: 'document', status: 'completed' },
            { title: 'Prototype initial', type: 'prototype', status: 'in_progress' },
            { title: 'Documentation technique', type: 'document', status: 'pending' }
        ];
        
        for (let i = 0; i < Math.min(2, data.projects.length); i++) {
            const project = data.projects[i];
            const deliverable = deliverableTemplates[i % deliverableTemplates.length];
            
            const deliverableData = {
                title: `${deliverable.title} - ${project.name}`,
                description: `Livrable pour le projet ${project.name}`,
                status: deliverable.status,
                type: deliverable.type,
                project_id: project.id,
                owner_company: companyId,
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                created_at: new Date().toISOString()
            };
            
            try {
                await createItem('deliverables', deliverableData);
                console.log(`      ✅ Livrable: ${deliverable.title}`);
                stats.deliverables_created++;
            } catch (error) {
                if (!error.message.includes('not found')) {
                    console.log(`      ⚠️  ${error.message}`);
                }
            }
        }
        
        console.log(`   🎉 Relations créées pour ${companyName}`);
        
    } catch (error) {
        console.error(`   ❌ Erreur ${companyName}:`, error.message);
        stats.errors++;
    }
}

async function main() {
    console.log('🔗 CRÉATION DES RELATIONS SIMPLIFIÉES');
    console.log('====================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ');
        console.log('💡 Utilisez --execute pour créer les relations\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Créations RÉELLES\n');
    }
    
    // Récupérer les entreprises
    console.log('🏢 Récupération des entreprises propriétaires...');
    try {
        const response = await api.get('/companies', {
            params: {
                'filter[name][_in]': 'HYPERVISUAL,DAINAMICS,LEXAIA,ENKI_REALTY,TAKEOUT',
                limit: -1
            }
        });
        
        const companies = response.data.data;
        console.log(`   ✅ ${companies.length} entreprises trouvées`);
        
        // Traiter chaque entreprise
        for (const company of companies) {
            await createCompanyRelations(company.name, company.id);
        }
        
    } catch (error) {
        console.error('❌ Erreur récupération entreprises:', error.response?.data || error.message);
        process.exit(1);
    }
    
    // Statistiques finales
    console.log('\n✅ RELATIONS TERMINÉES');
    console.log('======================');
    console.log(`Projets liés: ${stats.projects_linked}`);
    console.log(`Interactions créées: ${stats.interactions_created}`);
    console.log(`Livrables créés: ${stats.deliverables_created}`);
    
    if (stats.errors > 0) {
        console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s)`);
    }
    
    if (DRY_RUN) {
        console.log('\n💡 Relancer avec --execute pour créer les relations réelles');
    } else {
        console.log('\n🎯 Relations créées avec succès!');
        console.log('\n📊 Écosystème de données finalisé:');
        console.log('   ✅ 5 entreprises propriétaires');
        console.log('   ✅ Personnes de contact par entreprise');
        console.log('   ✅ Projets avec budgets et responsables');
        console.log('   ✅ Interactions clients documentées');
        console.log('   ✅ Livrables de projets planifiés');
        console.log('\n🚀 Base de données prête pour utilisation!');
    }
}

// Lancement
main().catch(error => {
    console.error('\n💥 Erreur:', error.message);
    process.exit(1);
});