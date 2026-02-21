#!/usr/bin/env node

/**
 * 🏗️ SCRIPT DE CRÉATION DES DONNÉES BUSINESS RÉALISTES
 * 
 * Mission : Créer des données professionnelles pour les 5 entreprises :
 * - HYPERVISUAL (Design & UX)
 * - DAINAMICS (Tech & IA) 
 * - LEXAIA (Juridique)
 * - ENKI_REALTY (Immobilier)
 * - TAKEOUT (Restauration)
 */

import { Directus } from '@directus/sdk';

// Configuration Directus
const DIRECTUS_URL = 'http://localhost:8055';
import 'dotenv/config';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// Mode dry-run par défaut
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

let stats = {
    companies_created: 0,
    contacts_created: 0,
    leads_created: 0,
    projects_created: 0,
    tasks_created: 0,
    products_created: 0,
    invoices_created: 0,
    errors: 0
};

// Définition des 5 entreprises et leurs données
const COMPANIES_DATA = {
    HYPERVISUAL: {
        name: 'HYPERVISUAL',
        industry: 'Design & UX',
        sector: 'Créatif',
        location: 'Lausanne, Suisse',
        website: 'https://hypervisual.ch',
        description: 'Agence spécialisée en design UX/UI et identité visuelle',
        employees_count: 15,
        annual_revenue: 2500000,
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
                budget: 25000,
                deadline: '2025-10-15'
            }
        ],
        products: [
            {
                name: 'Audit UX Complet',
                description: 'Analyse heuristique et tests utilisateurs',
                price: 8500,
                category: 'Services'
            },
            {
                name: 'Design System',
                description: 'Librairie de composants réutilisables',
                price: 15000,
                category: 'Services'
            }
        ]
    },

    DAINAMICS: {
        name: 'DAINAMICS',
        industry: 'Technology & AI',
        sector: 'Technologie',
        location: 'Zurich, Suisse',
        website: 'https://dainamics.ch',
        description: 'Solutions IA et automatisation pour entreprises',
        employees_count: 25,
        annual_revenue: 4200000,
        contacts: [
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
                budget: 120000,
                deadline: '2025-12-01'
            }
        ],
        products: [
            {
                name: 'AutoML Platform',
                description: 'Plateforme de machine learning automatisé',
                price: 50000,
                category: 'Software'
            },
            {
                name: 'AI Consulting',
                description: 'Conseil en stratégie intelligence artificielle',
                price: 1200,
                category: 'Services'
            }
        ]
    },

    LEXAIA: {
        name: 'LEXAIA',
        industry: 'Legal Services',
        sector: 'Juridique',
        location: 'Genève, Suisse', 
        website: 'https://lexaia.ch',
        description: 'Cabinet d\'avocats spécialisé en droit des affaires',
        employees_count: 12,
        annual_revenue: 3800000,
        contacts: [
            {
                first_name: 'Marie',
                last_name: 'Favre',
                email: 'm.favre@lexaia.ch',
                position: 'Avocate Associée',
                phone: '+41 22 555 0301'
            },
            {
                first_name: 'Jean-Pierre',
                last_name: 'Martin',
                email: 'jp.martin@lexaia.ch',
                position: 'Avocat Senior',
                phone: '+41 22 555 0302'
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
                budget: 55000,
                deadline: '2025-09-30'
            }
        ],
        products: [
            {
                name: 'Conseil Juridique Heure',
                description: 'Consultation juridique spécialisée',
                price: 450,
                category: 'Services'
            },
            {
                name: 'Contrat Type SaaS',
                description: 'Modèle de contrat logiciel personnalisé',
                price: 2500,
                category: 'Documents'
            }
        ]
    },

    ENKI_REALTY: {
        name: 'ENKI_REALTY',
        industry: 'Real Estate',
        sector: 'Immobilier',
        location: 'Montreux, Suisse',
        website: 'https://enki-realty.ch', 
        description: 'Agence immobilière haut de gamme Riviera vaudoise',
        employees_count: 8,
        annual_revenue: 1800000,
        contacts: [
            {
                first_name: 'Philippe',
                last_name: 'Duchamp',
                email: 'p.duchamp@enki-realty.ch',
                position: 'Directeur Commercial',
                phone: '+41 21 555 0401'
            },
            {
                first_name: 'Isabelle',
                last_name: 'Vernay',
                email: 'i.vernay@enki-realty.ch',
                position: 'Consultante Senior',
                phone: '+41 21 555 0402'
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
                budget: 85000,
                deadline: '2026-03-15'
            }
        ],
        products: [
            {
                name: 'Estimation Immobilière',
                description: 'Évaluation professionnelle de bien',
                price: 800,
                category: 'Services'
            },
            {
                name: 'Mandat de Vente Exclusif',
                description: 'Commission sur vente immobilière',
                price: 15000,
                category: 'Services'
            }
        ]
    },

    TAKEOUT: {
        name: 'TAKEOUT',
        industry: 'Food & Beverage',
        sector: 'Restauration',
        location: 'Bâle, Suisse',
        website: 'https://takeout.ch',
        description: 'Chaîne de restaurants gastronomiques à emporter',
        employees_count: 45,
        annual_revenue: 2900000,
        contacts: [
            {
                first_name: 'Alessandro',
                last_name: 'Conti',
                email: 'a.conti@takeout.ch',
                position: 'Chef Exécutif',
                phone: '+41 61 555 0501'
            },
            {
                first_name: 'Sophie',
                last_name: 'Bernhard',
                email: 's.bernhard@takeout.ch',
                position: 'Responsable Développement',
                phone: '+41 61 555 0502'
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
                budget: 65000,
                deadline: '2025-11-20'
            }
        ],
        products: [
            {
                name: 'Menu Signature',
                description: 'Plat gastronomique chef signature',
                price: 28,
                category: 'Food'
            },
            {
                name: 'Catering Événements',
                description: 'Service traiteur pour événements',
                price: 85,
                category: 'Services'
            }
        ]
    }
};

async function initDirectus() {
    console.log('🔗 Connexion à Directus...');
    const directus = new Directus(DIRECTUS_URL);
    
    try {
        await directus.auth.static(DIRECTUS_TOKEN);
        await directus.items('directus_collections').readByQuery({ limit: 1 });
        console.log('✅ Connexion Directus établie');
        return directus;
    } catch (error) {
        console.error('❌ Erreur connexion Directus:', error.message);
        process.exit(1);
    }
}

async function getOwnerCompanyId(directus, companyName) {
    try {
        const response = await directus.items('companies').readByQuery({
            filter: { name: { _eq: companyName } },
            limit: 1
        });
        const companies = response.data || response;
        
        if (companies.length > 0) {
            return companies[0].id;
        }
        
        console.log(`⚠️  Entreprise "${companyName}" non trouvée dans la base`);
        return null;
        
    } catch (error) {
        console.error(`❌ Erreur recherche entreprise "${companyName}":`, error.message);
        return null;
    }
}

async function createCompanyData(directus, companyName, companyData) {
    console.log(`\n🏢 Création des données pour ${companyName}...`);
    
    const ownerCompanyId = await getOwnerCompanyId(directus, companyName);
    if (!ownerCompanyId) {
        console.error(`❌ Impossible de trouver l'entreprise propriétaire ${companyName}`);
        stats.errors++;
        return;
    }
    
    try {
        // 1. Créer les contacts
        console.log('   👥 Création des contacts...');
        const contactIds = [];
        for (const contactData of companyData.contacts) {
            const contact = {
                ...contactData,
                company: ownerCompanyId,
                owner_company: ownerCompanyId,
                created_at: new Date().toISOString()
            };
            
            if (!DRY_RUN) {
                const result = await directus.items('contacts').createOne(contact);
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
                company: ownerCompanyId,
                owner_company: ownerCompanyId,
                contact: contactIds.length > 0 ? contactIds[0] : null,
                created_at: new Date().toISOString()
            };
            
            if (!DRY_RUN) {
                await directus.items('leads').createOne(lead);
            }
            
            console.log(`      ✅ Lead: ${lead.title} (${lead.value} CHF)`);
            stats.leads_created++;
        }
        
        // 3. Créer les projets
        console.log('   📋 Création des projets...');
        const projectIds = [];
        for (const projectData of companyData.projects) {
            const project = {
                ...projectData,
                company: ownerCompanyId,
                owner_company: ownerCompanyId,
                contact: contactIds.length > 0 ? contactIds[0] : null,
                created_at: new Date().toISOString()
            };
            
            if (!DRY_RUN) {
                const result = await directus.items('projects').createOne(project);
                projectIds.push(result.id);
            }
            
            console.log(`      ✅ Projet: ${project.name}`);
            stats.projects_created++;
        }
        
        // 4. Créer les produits/services
        console.log('   🛍️ Création des produits...');
        for (const productData of companyData.products) {
            const product = {
                ...productData,
                company: ownerCompanyId,
                owner_company: ownerCompanyId,
                created_at: new Date().toISOString()
            };
            
            if (!DRY_RUN) {
                await directus.items('products').createOne(product);
            }
            
            console.log(`      ✅ Produit: ${product.name} (${product.price} CHF)`);
            stats.products_created++;
        }
        
        // 5. Créer des tâches pour les projets
        console.log('   ✅ Création des tâches...');
        const taskTemplates = [
            { name: 'Analyse des besoins', status: 'completed' },
            { name: 'Développement Phase 1', status: 'in_progress' },
            { name: 'Tests et validation', status: 'pending' },
            { name: 'Formation équipe', status: 'pending' },
            { name: 'Mise en production', status: 'pending' }
        ];
        
        for (const projectId of projectIds) {
            for (const taskTemplate of taskTemplates) {
                const task = {
                    ...taskTemplate,
                    project: projectId,
                    company: ownerCompanyId,
                    owner_company: ownerCompanyId,
                    assigned_to: contactIds.length > 0 ? contactIds[0] : null,
                    created_at: new Date().toISOString()
                };
                
                if (!DRY_RUN) {
                    await directus.items('tasks').createOne(task);
                }
                
                stats.tasks_created++;
            }
        }
        
        // 6. Créer une facture exemple
        console.log('   🧾 Création d\'une facture...');
        const invoice = {
            invoice_number: `INV-${companyName}-${new Date().getFullYear()}-001`,
            client_company: ownerCompanyId,
            owner_company: ownerCompanyId,
            amount: companyData.products[0]?.price || 5000,
            status: 'sent',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            description: `Facturation services ${companyData.industry}`
        };
        
        if (!DRY_RUN) {
            await directus.items('invoices').createOne(invoice);
        }
        
        console.log(`      ✅ Facture: ${invoice.invoice_number}`);
        stats.invoices_created++;
        
        console.log(`   🎉 Données créées avec succès pour ${companyName}`);
        
    } catch (error) {
        console.error(`   ❌ Erreur création données ${companyName}:`, error.message);
        stats.errors++;
    }
}

async function main() {
    console.log('🏗️ CRÉATION DES DONNÉES BUSINESS RÉALISTES');
    console.log('==========================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ - Aucune création réelle');
        console.log('💡 Utilisez --execute pour créer les données\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Les créations seront RÉELLES\n');
    }
    
    const directus = await initDirectus();
    
    console.log('🏢 Entreprises à traiter:', Object.keys(COMPANIES_DATA).join(', '));
    
    // Traiter chaque entreprise
    for (const [companyName, companyData] of Object.entries(COMPANIES_DATA)) {
        await createCompanyData(directus, companyName, companyData);
    }
    
    // Statistiques finales
    console.log('\n✅ CRÉATION TERMINÉE');
    console.log('===================');
    console.log(`Entreprises traitées: ${Object.keys(COMPANIES_DATA).length}`);
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
        console.log('\n🎯 Données business créées avec succès!');
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