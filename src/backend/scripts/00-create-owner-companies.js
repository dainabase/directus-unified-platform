#!/usr/bin/env node

/**
 * 🏢 SCRIPT DE CRÉATION DES 5 ENTREPRISES PROPRIÉTAIRES
 * 
 * Mission : Créer les 5 entreprises owner qui seront les propriétaires
 * de toutes les autres données dans l'écosystème multi-tenant
 */

import { Directus } from '@directus/sdk';

// Configuration Directus
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Mode dry-run par défaut
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Définition des 5 entreprises propriétaires
const OWNER_COMPANIES = [
    {
        name: 'HYPERVISUAL',
        full_name: 'HYPERVISUAL Sàrl',
        industry: 'Design & UX',
        sector: 'Créatif',
        location: 'Lausanne, Suisse',
        address: 'Avenue de la Gare 12, 1003 Lausanne',
        website: 'https://hypervisual.ch',
        email: 'contact@hypervisual.ch',
        phone: '+41 21 555 0100',
        description: 'Agence spécialisée en design UX/UI et identité visuelle pour startups et PME suisses',
        employees_count: 15,
        annual_revenue: 2500000,
        founded_year: 2019,
        vat_number: 'CHE-123.456.789',
        status: 'active',
        is_owner_company: true
    },
    {
        name: 'DAINAMICS',
        full_name: 'DAINAMICS AG',
        industry: 'Technology & AI',
        sector: 'Technologie',
        location: 'Zurich, Suisse',
        address: 'Bahnhofstrasse 45, 8001 Zürich',
        website: 'https://dainamics.ch',
        email: 'info@dainamics.ch', 
        phone: '+41 44 555 0200',
        description: 'Solutions d\'intelligence artificielle et automatisation pour entreprises et institutions',
        employees_count: 25,
        annual_revenue: 4200000,
        founded_year: 2020,
        vat_number: 'CHE-234.567.890',
        status: 'active',
        is_owner_company: true
    },
    {
        name: 'LEXAIA',
        full_name: 'LEXAIA Avocats SA',
        industry: 'Legal Services',
        sector: 'Juridique',
        location: 'Genève, Suisse',
        address: 'Rue du Rhône 88, 1204 Genève',
        website: 'https://lexaia.ch',
        email: 'cabinet@lexaia.ch',
        phone: '+41 22 555 0300',
        description: 'Cabinet d\'avocats spécialisé en droit des affaires, technologie et propriété intellectuelle',
        employees_count: 12,
        annual_revenue: 3800000,
        founded_year: 2018,
        vat_number: 'CHE-345.678.901',
        status: 'active',
        is_owner_company: true
    },
    {
        name: 'ENKI_REALTY',
        full_name: 'ENKI REALTY SA',
        industry: 'Real Estate',
        sector: 'Immobilier',
        location: 'Montreux, Suisse',
        address: 'Grand Rue 23, 1820 Montreux',
        website: 'https://enki-realty.ch',
        email: 'contact@enki-realty.ch',
        phone: '+41 21 555 0400',
        description: 'Agence immobilière haut de gamme spécialisée dans la Riviera vaudoise et les Alpes',
        employees_count: 8,
        annual_revenue: 1800000,
        founded_year: 2021,
        vat_number: 'CHE-456.789.012',
        status: 'active',
        is_owner_company: true
    },
    {
        name: 'TAKEOUT',
        full_name: 'TAKEOUT Gastronomie Sàrl',
        industry: 'Food & Beverage',
        sector: 'Restauration',
        location: 'Bâle, Suisse',
        address: 'Freie Strasse 67, 4001 Basel',
        website: 'https://takeout.ch',
        email: 'hello@takeout.ch',
        phone: '+41 61 555 0500',
        description: 'Chaîne de restaurants gastronomiques à emporter avec focus sur la qualité et durabilité',
        employees_count: 45,
        annual_revenue: 2900000,
        founded_year: 2022,
        vat_number: 'CHE-567.890.123',
        status: 'active',
        is_owner_company: true
    }
];

let stats = {
    companies_created: 0,
    companies_updated: 0,
    companies_existing: 0,
    errors: 0
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

async function checkCompanyExists(directus, companyName) {
    try {
        const response = await directus.items('companies').readByQuery({
            filter: { name: { _eq: companyName } },
            limit: 1
        });
        const companies = response.data || response;
        return companies.length > 0 ? companies[0] : null;
    } catch (error) {
        console.error(`❌ Erreur vérification entreprise ${companyName}:`, error.message);
        return null;
    }
}

async function createOrUpdateCompany(directus, companyData) {
    console.log(`\n🏢 Traitement de l'entreprise ${companyData.name}...`);
    
    try {
        // Vérifier si l'entreprise existe déjà
        const existing = await checkCompanyExists(directus, companyData.name);
        
        if (existing) {
            console.log(`   ℹ️  Entreprise existante trouvée (ID: ${existing.id})`);
            
            // Mettre à jour avec les nouvelles données si nécessaire
            const updateData = {
                ...companyData,
                owner_company: existing.id, // Elle est son propre propriétaire
                updated_at: new Date().toISOString()
            };
            
            if (!DRY_RUN) {
                await directus.items('companies').updateOne(existing.id, updateData);
            }
            
            console.log(`   ✅ Entreprise mise à jour: ${companyData.full_name}`);
            stats.companies_updated++;
            return existing.id;
            
        } else {
            console.log(`   🆕 Création nouvelle entreprise...`);
            
            const createData = {
                ...companyData,
                created_at: new Date().toISOString()
            };
            
            if (!DRY_RUN) {
                const result = await directus.items('companies').createOne(createData);
                const companyId = result.id;
                
                // Mettre à jour owner_company pour qu'elle soit son propre propriétaire
                await directus.items('companies').updateOne(companyId, {
                    owner_company: companyId,
                    updated_at: new Date().toISOString()
                });
                
                console.log(`   ✅ Entreprise créée: ${companyData.full_name} (ID: ${companyId})`);
                stats.companies_created++;
                return companyId;
            } else {
                console.log(`   🔍 Mode dry-run - Création simulée: ${companyData.full_name}`);
                stats.companies_created++;
                return 'dry-run-id';
            }
        }
        
    } catch (error) {
        console.error(`   ❌ Erreur traitement ${companyData.name}:`, error.message);
        stats.errors++;
        return null;
    }
}

async function verifyOwnerCompanies(directus, createdIds) {
    console.log('\n🔍 Vérification des entreprises propriétaires...');
    
    for (const companyData of OWNER_COMPANIES) {
        const existing = await checkCompanyExists(directus, companyData.name);
        if (existing) {
            console.log(`   ✅ ${companyData.name}: ID ${existing.id}, Owner: ${existing.owner_company}`);
        } else {
            console.log(`   ❌ ${companyData.name}: Non trouvée`);
        }
    }
}

async function main() {
    console.log('🏢 CRÉATION DES ENTREPRISES PROPRIÉTAIRES');
    console.log('=========================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ - Aucune modification réelle');
        console.log('💡 Utilisez --execute pour créer les entreprises\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Les créations seront RÉELLES\n');
    }
    
    const directus = await initDirectus();
    
    console.log('🏢 Entreprises à traiter:');
    OWNER_COMPANIES.forEach(company => {
        console.log(`   • ${company.name} (${company.full_name}) - ${company.industry}`);
    });
    
    // Créer ou mettre à jour chaque entreprise
    const createdIds = [];
    for (const companyData of OWNER_COMPANIES) {
        const id = await createOrUpdateCompany(directus, companyData);
        if (id) createdIds.push(id);
    }
    
    // Vérification finale
    if (!DRY_RUN) {
        await verifyOwnerCompanies(directus, createdIds);
    }
    
    // Statistiques finales
    console.log('\n✅ CRÉATION TERMINÉE');
    console.log('===================');
    console.log(`Entreprises créées: ${stats.companies_created}`);
    console.log(`Entreprises mises à jour: ${stats.companies_updated}`);
    console.log(`Total traité: ${stats.companies_created + stats.companies_updated}`);
    
    if (stats.errors > 0) {
        console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s)`);
    }
    
    if (DRY_RUN) {
        console.log('\n💡 Relancer avec --execute pour créer les entreprises réelles');
    } else {
        console.log('\n🎯 Entreprises propriétaires prêtes!');
        console.log('\n📋 Prochaines étapes:');
        console.log('1. node src/backend/scripts/02-create-real-data.js --execute');
        console.log('2. node src/backend/scripts/03-create-relations.js --execute');
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