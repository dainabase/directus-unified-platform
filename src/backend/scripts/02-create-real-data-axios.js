#!/usr/bin/env node

/**
 * 🏗️ SCRIPT DE CRÉATION DES DONNÉES BUSINESS RÉALISTES (AXIOS VERSION)
 * 
 * Mission : Créer des données professionnelles avec API REST directe
 * pour contourner les limitations du SDK
 */

import axios from 'axios';

// Configuration Directus
const DIRECTUS_URL = 'http://localhost:8055';
import 'dotenv/config';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// Mode dry-run par défaut
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Configuration axios avec token
const api = axios.create({
    baseURL: `${DIRECTUS_URL}/items`,
    headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

let stats = {
    companies_found: 0,
    contacts_created: 0,
    leads_created: 0,
    projects_created: 0,
    tasks_created: 0,
    products_created: 0,
    invoices_created: 0,
    errors: 0
};

// Données des 5 entreprises (version simplifiée)
const COMPANIES_DATA = {
    HYPERVISUAL: {
        contacts: [
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
        leads: [
            {
                title: 'Refonte site e-commerce',
                description: 'Modernisation complète de l\'interface utilisateur',
                value: 45000,
                stage: 'proposal',
                source: 'referral'
            }
        ],
        projects: [
            {
                name: 'Identité visuelle StartupTech',
                description: 'Création logo, charte graphique et guidelines',
                status: 'in_progress',
                budget: 25000
            }
        ],
        products: [
            {
                name: 'Audit UX Complet',
                description: 'Analyse heuristique et tests utilisateurs',
                price: 8500
            },
            {
                name: 'Design System',
                description: 'Librairie de composants réutilisables', 
                price: 15000
            }
        ]
    },

    DAINAMICS: {
        contacts: [
            {
                first_name: 'Thomas',
                last_name: 'Weber',
                email: 't.weber@dainamics.ch',
                position: 'CTO',
                phone: '+41 44 555 0201'
            }
        ],
        leads: [
            {
                title: 'Système de recommandation IA',
                description: 'Algorithme de recommandation personnalisé',
                value: 85000,
                stage: 'negotiation',
                source: 'website'
            }
        ],
        projects: [
            {
                name: 'Chatbot Intelligence Bancaire',
                description: 'Assistant IA pour service client bancaire',
                status: 'planning',
                budget: 120000
            }
        ],
        products: [
            {
                name: 'AutoML Platform',
                description: 'Plateforme de machine learning automatisé',
                price: 50000
            }
        ]
    },

    LEXAIA: {
        contacts: [
            {
                first_name: 'Marie',
                last_name: 'Favre',
                email: 'm.favre@lexaia.ch',
                position: 'Avocate Associée',
                phone: '+41 22 555 0301'
            }
        ],
        leads: [
            {
                title: 'Acquisition entreprise tech',
                description: 'Due diligence et négociation acquisition',
                value: 75000,
                stage: 'qualified',
                source: 'network'
            }
        ],
        projects: [
            {
                name: 'Restructuration Holding SA',
                description: 'Réorganisation juridique et fiscale',
                status: 'active',
                budget: 55000
            }
        ],
        products: [
            {
                name: 'Conseil Juridique Heure',
                description: 'Consultation juridique spécialisée',
                price: 450
            }
        ]
    },

    ENKI_REALTY: {
        contacts: [
            {
                first_name: 'Philippe',
                last_name: 'Duchamp',
                email: 'p.duchamp@enki-realty.ch',
                position: 'Directeur Commercial',
                phone: '+41 21 555 0401'
            }
        ],
        leads: [
            {
                title: 'Villa luxe Crans-Montana',
                description: 'Mandat de vente exclusif villa 8.5 pièces',
                value: 125000,
                stage: 'proposal',
                source: 'referral'
            }
        ],
        projects: [
            {
                name: 'Promotion Résidence Lac',
                description: 'Commercialisation 24 appartements neufs',
                status: 'in_progress',
                budget: 85000
            }
        ],
        products: [
            {
                name: 'Estimation Immobilière',
                description: 'Évaluation professionnelle de bien',
                price: 800
            }
        ]
    },

    TAKEOUT: {
        contacts: [
            {
                first_name: 'Alessandro',
                last_name: 'Conti',
                email: 'a.conti@takeout.ch',
                position: 'Chef Exécutif',
                phone: '+41 61 555 0501'
            }
        ],
        leads: [
            {
                title: 'Nouveau point de vente Zurich',
                description: 'Ouverture franchise centre-ville Zurich',
                value: 95000,
                stage: 'qualified',
                source: 'direct'
            }
        ],
        projects: [
            {
                name: 'Application Mobile Commandes',
                description: 'Développement app iOS/Android',
                status: 'planning',
                budget: 65000
            }
        ],
        products: [
            {
                name: 'Menu Signature',
                description: 'Plat gastronomique chef signature',
                price: 28
            }
        ]
    }
};

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
        console.log(`   ✅ ${companies.length} entreprises trouvées`);
        stats.companies_found = companies.length;
        
        // Créer un map pour faciliter la recherche
        const companyMap = {};
        companies.forEach(company => {
            companyMap[company.name] = company;
        });
        
        return companyMap;
        
    } catch (error) {
        console.error('❌ Erreur récupération entreprises:', error.response?.data || error.message);
        process.exit(1);
    }
}

async function createItem(collection, data) {
    if (DRY_RUN) {
        console.log(`   🔍 DRY-RUN: Création dans ${collection}:`, data.name || data.title || data.first_name || 'Item');
        return { id: 'dry-run-id' };
    }
    
    try {
        const response = await api.post(`/${collection}`, data);
        return response.data.data;
    } catch (error) {
        throw new Error(`${error.response?.status}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
}

async function createCompanyData(companyName, companyData, ownerId) {
    console.log(`\n🏢 Création des données pour ${companyName}...`);
    
    const contactIds = [];
    const projectIds = [];
    
    try {
        // 1. Créer les contacts
        console.log('   👥 Création des contacts...');
        for (const contactData of companyData.contacts) {
            const contact = {
                ...contactData,
                company: ownerId,
                owner_company: ownerId,
                created_at: new Date().toISOString()
            };
            
            const result = await createItem('contacts', contact);
            if (result && result.id) {
                contactIds.push(result.id);
            }
            
            console.log(`      ✅ Contact: ${contact.first_name} ${contact.last_name}`);
            stats.contacts_created++;
        }
        
        // 2. Créer les leads
        console.log('   🎯 Création des leads...');
        for (const leadData of companyData.leads) {
            const lead = {
                ...leadData,
                company: ownerId,
                owner_company: ownerId,
                contact: contactIds.length > 0 ? contactIds[0] : null,
                created_at: new Date().toISOString()
            };
            
            await createItem('leads', lead);
            console.log(`      ✅ Lead: ${lead.title} (${lead.value} CHF)`);
            stats.leads_created++;
        }
        
        // 3. Créer les projets
        console.log('   📋 Création des projets...');
        for (const projectData of companyData.projects) {
            const project = {
                ...projectData,
                company: ownerId,
                owner_company: ownerId,
                client_company: ownerId,
                client_contact: contactIds.length > 0 ? contactIds[0] : null,
                created_at: new Date().toISOString()
            };
            
            const result = await createItem('projects', project);
            if (result && result.id) {
                projectIds.push(result.id);
            }
            
            console.log(`      ✅ Projet: ${project.name}`);
            stats.projects_created++;
        }
        
        // 4. Créer les produits
        console.log('   🛍️ Création des produits...');
        for (const productData of companyData.products) {
            const product = {
                ...productData,
                company: ownerId,
                owner_company: ownerId,
                created_at: new Date().toISOString()
            };
            
            await createItem('products', product);
            console.log(`      ✅ Produit: ${product.name} (${product.price} CHF)`);
            stats.products_created++;
        }
        
        // 5. Créer des tâches pour les projets
        console.log('   ✅ Création des tâches...');
        const taskTemplates = [
            { name: 'Analyse des besoins', status: 'completed' },
            { name: 'Développement Phase 1', status: 'in_progress' },
            { name: 'Tests et validation', status: 'pending' }
        ];
        
        for (const projectId of projectIds) {
            for (const taskTemplate of taskTemplates) {
                const task = {
                    ...taskTemplate,
                    project: projectId,
                    company: ownerId,
                    owner_company: ownerId,
                    assigned_to: contactIds.length > 0 ? contactIds[0] : null,
                    created_at: new Date().toISOString()
                };
                
                await createItem('tasks', task);
                stats.tasks_created++;
            }
        }
        
        // 6. Créer une facture
        console.log('   🧾 Création d\'une facture...');
        const invoice = {
            invoice_number: `INV-${companyName}-${new Date().getFullYear()}-001`,
            client_company: ownerId,
            owner_company: ownerId,
            amount: companyData.products[0]?.price || 5000,
            status: 'sent',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            project: projectIds.length > 0 ? projectIds[0] : null,
            created_at: new Date().toISOString(),
            description: `Facturation services ${companyName}`
        };
        
        await createItem('invoices', invoice);
        console.log(`      ✅ Facture: ${invoice.invoice_number}`);
        stats.invoices_created++;
        
        console.log(`   🎉 Données créées avec succès pour ${companyName}`);
        
    } catch (error) {
        console.error(`   ❌ Erreur création données ${companyName}:`, error.message);
        stats.errors++;
    }
}

async function main() {
    console.log('🏗️ CRÉATION DES DONNÉES BUSINESS (AXIOS VERSION)');
    console.log('================================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ - Aucune création réelle');
        console.log('💡 Utilisez --execute pour créer les données\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Les créations seront RÉELLES');
        console.log('🔧 Utilisation de l\'API REST directe avec axios\n');
    }
    
    // Récupérer les entreprises propriétaires
    const companies = await getOwnerCompanies();
    
    if (stats.companies_found === 0) {
        console.error('❌ Aucune entreprise propriétaire trouvée. Exécutez d\'abord le script 00-create-owner-companies.js');
        process.exit(1);
    }
    
    // Traiter chaque entreprise
    for (const [companyName, companyData] of Object.entries(COMPANIES_DATA)) {
        const company = companies[companyName];
        if (company) {
            await createCompanyData(companyName, companyData, company.id);
        } else {
            console.error(`❌ Entreprise ${companyName} non trouvée`);
            stats.errors++;
        }
    }
    
    // Statistiques finales
    console.log('\n✅ CRÉATION TERMINÉE');
    console.log('===================');
    console.log(`Entreprises trouvées: ${stats.companies_found}`);
    console.log(`Contacts créés: ${stats.contacts_created}`);
    console.log(`Leads créés: ${stats.leads_created}`);
    console.log(`Projets créés: ${stats.projects_created}`);
    console.log(`Tâches créées: ${stats.tasks_created}`);
    console.log(`Produits créés: ${stats.products_created}`);
    console.log(`Factures créées: ${stats.invoices_created}`);
    
    if (stats.errors > 0) {
        console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s)`);
    }
    
    if (DRY_RUN) {
        console.log('\n💡 Relancer avec --execute pour créer les données réelles');
    } else {
        console.log('\n🎯 Données business créées avec succès via axios!');
        console.log('\n📋 Prochaine étape:');
        console.log('node src/backend/scripts/03-create-relations-axios.js --execute');
    }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('\n💥 Erreur critique:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('\n💥 Promesse rejetée:', error.message);
    process.exit(1);
});

// Lancement du script
main().catch(error => {
    console.error('\n💥 Erreur lors de l\'exécution:', error.message);
    process.exit(1);
});