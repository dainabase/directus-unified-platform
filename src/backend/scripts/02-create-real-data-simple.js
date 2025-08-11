#!/usr/bin/env node

/**
 * 🏗️ SCRIPT CRÉATION DONNÉES SIMPLIFIÉE
 * 
 * Utilise les collections accessibles : people, projects, activities, notes
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
    people_created: 0,
    projects_created: 0,
    activities_created: 0,
    notes_created: 0,
    errors: 0
};

const BUSINESS_DATA = [
    {
        company: 'HYPERVISUAL',
        people: [
            {
                first_name: 'Sarah',
                last_name: 'Müller',
                email: 's.muller@hypervisual.ch',
                position: 'Creative Director',
                phone: '+41 21 555 0101'
            },
            {
                first_name: 'Marc',
                last_name: 'Dubois',
                email: 'm.dubois@hypervisual.ch',
                position: 'UX Designer',
                phone: '+41 21 555 0102'
            }
        ],
        projects: [
            {
                name: 'Identité visuelle StartupTech',
                description: 'Création logo, charte graphique et guidelines',
                status: 'in_progress',
                budget: 25000
            },
            {
                name: 'Refonte UX E-commerce',
                description: 'Modernisation complète interface utilisateur',
                status: 'planning',
                budget: 45000
            }
        ]
    },
    {
        company: 'DAINAMICS',
        people: [
            {
                first_name: 'Thomas',
                last_name: 'Weber',
                email: 't.weber@dainamics.ch',
                position: 'CTO',
                phone: '+41 44 555 0201'
            },
            {
                first_name: 'Elena',
                last_name: 'Rossi',
                email: 'e.rossi@dainamics.ch',
                position: 'AI Research Lead',
                phone: '+41 44 555 0202'
            }
        ],
        projects: [
            {
                name: 'Chatbot Intelligence Bancaire',
                description: 'Assistant IA pour service client bancaire',
                status: 'planning',
                budget: 120000
            },
            {
                name: 'Système de recommandation IA',
                description: 'Algorithme de recommandation personnalisé',
                status: 'proposal',
                budget: 85000
            }
        ]
    },
    {
        company: 'LEXAIA',
        people: [
            {
                first_name: 'Marie',
                last_name: 'Favre',
                email: 'm.favre@lexaia.ch',
                position: 'Avocate Associée',
                phone: '+41 22 555 0301'
            }
        ],
        projects: [
            {
                name: 'Restructuration Holding SA',
                description: 'Réorganisation juridique et fiscale',
                status: 'active',
                budget: 55000
            }
        ]
    },
    {
        company: 'ENKI_REALTY',
        people: [
            {
                first_name: 'Philippe',
                last_name: 'Duchamp',
                email: 'p.duchamp@enki-realty.ch',
                position: 'Directeur Commercial',
                phone: '+41 21 555 0401'
            }
        ],
        projects: [
            {
                name: 'Promotion Résidence Lac',
                description: 'Commercialisation 24 appartements neufs',
                status: 'in_progress',
                budget: 85000
            }
        ]
    },
    {
        company: 'TAKEOUT',
        people: [
            {
                first_name: 'Alessandro',
                last_name: 'Conti',
                email: 'a.conti@takeout.ch',
                position: 'Chef Exécutif',
                phone: '+41 61 555 0501'
            }
        ],
        projects: [
            {
                name: 'Application Mobile Commandes',
                description: 'Développement app iOS/Android',
                status: 'planning',
                budget: 65000
            }
        ]
    }
];

async function getOwnerCompanies() {
    console.log('🏢 Récupération des entreprises propriétaires...');
    try {
        const response = await api.get('/companies', {
            params: {
                'filter[name][_in]': 'HYPERVISUAL,DAINAMICS,LEXAIA,ENKI_REALTY,TAKEOUT',
                limit: -1
            }
        });
        
        const companies = response.data.data;
        const companyMap = {};
        companies.forEach(company => {
            companyMap[company.name] = company;
        });
        
        console.log(`   ✅ ${companies.length} entreprises trouvées`);
        return companyMap;
    } catch (error) {
        console.error('❌ Erreur récupération entreprises:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function createItem(collection, data) {
    if (DRY_RUN) {
        console.log(`   🔍 DRY-RUN ${collection}:`, data.name || data.first_name || 'Item');
        return { id: 'dry-run-id' };
    }
    
    try {
        const response = await api.post(`/${collection}`, data);
        return response.data.data;
    } catch (error) {
        throw new Error(`${error.response?.status}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
}

async function createBusinessData(companyData, company) {
    console.log(`\n🏢 Création données pour ${companyData.company}...`);
    
    const peopleIds = [];
    const projectIds = [];
    
    try {
        // Créer les personnes
        console.log('   👥 Création des personnes...');
        for (const personData of companyData.people) {
            const person = {
                ...personData,
                owner_company: company.id,
                created_at: new Date().toISOString()
            };
            
            const result = await createItem('people', person);
            if (result?.id) peopleIds.push(result.id);
            
            console.log(`      ✅ ${person.first_name} ${person.last_name} (${person.position})`);
            stats.people_created++;
        }
        
        // Créer les projets
        console.log('   📋 Création des projets...');
        for (const projectData of companyData.projects) {
            const project = {
                ...projectData,
                owner_company: company.id,
                created_at: new Date().toISOString()
            };
            
            const result = await createItem('projects', project);
            if (result?.id) projectIds.push(result.id);
            
            console.log(`      ✅ ${project.name} (${project.budget} CHF)`);
            stats.projects_created++;
        }
        
        // Créer des activités
        console.log('   📱 Création des activités...');
        const activityTemplates = [
            { type: 'call', description: 'Appel de suivi client' },
            { type: 'meeting', description: 'Réunion avancement projet' },
            { type: 'email', description: 'Envoi rapport d\'avancement' }
        ];
        
        for (let i = 0; i < Math.min(3, peopleIds.length); i++) {
            const template = activityTemplates[i % activityTemplates.length];
            const activity = {
                type: template.type,
                description: `${template.description} - ${companyData.company}`,
                owner_company: company.id,
                created_at: new Date().toISOString(),
                date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            
            await createItem('activities', activity);
            console.log(`      ✅ Activité: ${activity.type} - ${activity.description}`);
            stats.activities_created++;
        }
        
        // Créer des notes
        console.log('   📝 Création des notes...');
        for (let i = 0; i < Math.min(2, projectIds.length); i++) {
            const noteContent = `Notes importantes pour le projet ${companyData.projects[i]?.name || 'Projet'} - ${companyData.company}`;
            const note = {
                title: `Notes projet ${companyData.projects[i]?.name || 'Projet'}`,
                content: noteContent,
                owner_company: company.id,
                created_at: new Date().toISOString()
            };
            
            await createItem('notes', note);
            console.log(`      ✅ Note: ${note.title}`);
            stats.notes_created++;
        }
        
        console.log(`   🎉 Données créées pour ${companyData.company}`);
        
    } catch (error) {
        console.error(`   ❌ Erreur ${companyData.company}:`, error.message);
        stats.errors++;
    }
}

async function main() {
    console.log('🏗️ CRÉATION DONNÉES BUSINESS SIMPLIFIÉE');
    console.log('=======================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ - Aucune création réelle');
        console.log('💡 Utilisez --execute pour créer les données\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Créations RÉELLES');
        console.log('📋 Collections utilisées: people, projects, activities, notes\n');
    }
    
    const companies = await getOwnerCompanies();
    
    if (Object.keys(companies).length === 0) {
        console.error('❌ Aucune entreprise trouvée. Exécutez 00-create-owner-companies.js');
        process.exit(1);
    }
    
    // Créer les données pour chaque entreprise
    for (const companyData of BUSINESS_DATA) {
        const company = companies[companyData.company];
        if (company) {
            await createBusinessData(companyData, company);
        } else {
            console.error(`❌ Entreprise ${companyData.company} non trouvée`);
            stats.errors++;
        }
    }
    
    // Statistiques finales
    console.log('\n✅ CRÉATION TERMINÉE');
    console.log('===================');
    console.log(`Personnes créées: ${stats.people_created}`);
    console.log(`Projets créés: ${stats.projects_created}`);
    console.log(`Activités créées: ${stats.activities_created}`);
    console.log(`Notes créées: ${stats.notes_created}`);
    console.log(`Total items: ${stats.people_created + stats.projects_created + stats.activities_created + stats.notes_created}`);
    
    if (stats.errors > 0) {
        console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s)`);
    }
    
    if (DRY_RUN) {
        console.log('\n💡 Relancer avec --execute pour créer les données réelles');
    } else {
        console.log('\n🎯 Données business créées avec succès!');
        console.log('\n📊 Base de données enrichie avec des données réalistes:');
        console.log('   • 5 entreprises propriétaires');
        console.log('   • Contacts/personnes métier par entreprise');  
        console.log('   • Projets en cours avec budgets');
        console.log('   • Historique d\'activités client');
        console.log('   • Notes de projets documentées');
    }
}

// Lancement
main().catch(error => {
    console.error('\n💥 Erreur:', error.message);
    process.exit(1);
});