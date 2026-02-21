#!/usr/bin/env node

/**
 * 🧹 SCRIPT DE NETTOYAGE DES DONNÉES DE TEST
 * 
 * Mission : Supprimer toutes les données Faker.js en préservant :
 * - Les 5 entreprises propriétaires (HYPERVISUAL, DAINAMICS, LEXAIA, ENKI_REALTY, TAKEOUT)
 * - Les vraies entreprises suisses existantes
 * - La structure des collections
 */

import { Directus } from '@directus/sdk';

// Configuration Directus
const DIRECTUS_URL = 'http://localhost:8055';
import 'dotenv/config';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// Mode dry-run par défaut (pour sécurité)
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Entreprises à PRÉSERVER (ne pas supprimer)
const OWNER_COMPANIES = [
    'HYPERVISUAL',
    'DAINAMICS', 
    'LEXAIA',
    'ENKI_REALTY',
    'TAKEOUT'
];

// Collections avec des données potentiellement Faker
const COLLECTIONS_TO_CLEAN = [
    'leads',
    'companies', 
    'contacts',
    'projects',
    'tasks',
    'invoices',
    'quotes',
    'products',
    'services',
    'meetings',
    'campaigns',
    'opportunities',
    'documents',
    'notes',
    'activities',
    'users' // Attention : préserver les vrais utilisateurs
];

// Patterns Faker.js à détecter
const FAKER_PATTERNS = [
    /example\.com$/i,
    /test\.com$/i,
    /faker\.js/i,
    /lorem ipsum/i,
    /^user\d+@/i,
    /^test.*@/i,
    /^demo.*@/i,
    /\.fake$/i,
    /@example\./i,
    /Fake\s+(Company|Corp|Ltd|Inc)/i,
    /Test\s+(Company|Corp|Ltd|Inc)/i,
    /Demo\s+(Company|Corp|Ltd|Inc)/i
];

// Domaines email suspects
const SUSPICIOUS_DOMAINS = [
    'example.com',
    'test.com', 
    'fake.com',
    'dummy.com',
    'lorem.com',
    'faker.com'
];

let stats = {
    collections_scanned: 0,
    items_analyzed: 0,
    items_to_delete: 0,
    items_deleted: 0,
    preserved_companies: 0,
    errors: 0
};

async function initDirectus() {
    console.log('🔗 Connexion à Directus...');
    const directus = new Directus(DIRECTUS_URL);
    
    try {
        // Authentification avec token statique
        await directus.auth.static(DIRECTUS_TOKEN);
        
        // Test de connexion
        await directus.items('directus_collections').readByQuery({ limit: 1 });
        console.log('✅ Connexion Directus établie');
        return directus;
    } catch (error) {
        console.error('❌ Erreur connexion Directus:', error.message);
        process.exit(1);
    }
}

function isFakerData(item, collectionName) {
    if (!item) return false;
    
    const textFields = [];
    
    // Collecter tous les champs texte
    for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string' && value.trim().length > 0) {
            textFields.push({ field: key, value: value.trim() });
        }
    }
    
    // Vérifier les patterns Faker
    for (const { field, value } of textFields) {
        for (const pattern of FAKER_PATTERNS) {
            if (pattern.test(value)) {
                return { isFaker: true, reason: `Pattern Faker détecté dans ${field}: ${value}` };
            }
        }
        
        // Vérifier domaines email suspects
        if (field.includes('email') || field.includes('mail')) {
            for (const domain of SUSPICIOUS_DOMAINS) {
                if (value.toLowerCase().includes(domain)) {
                    return { isFaker: true, reason: `Domaine suspect dans ${field}: ${domain}` };
                }
            }
        }
    }
    
    return { isFaker: false };
}

function isOwnerCompany(item) {
    if (!item) return false;
    
    // Vérifier différents champs possibles
    const nameFields = ['name', 'company_name', 'title', 'label'];
    
    for (const field of nameFields) {
        if (item[field]) {
            const name = String(item[field]).toUpperCase().trim();
            if (OWNER_COMPANIES.includes(name)) {
                return true;
            }
        }
    }
    
    return false;
}

async function scanCollection(directus, collectionName) {
    console.log(`\n📊 Analyse de la collection "${collectionName}"...`);
    
    try {
        // Récupérer tous les items
        const response = await directus.items(collectionName).readByQuery({
            limit: -1, // Récupérer tous les items
            fields: '*' // Tous les champs
        });
        const items = response.data || response;
        
        console.log(`   📦 ${items.length} items trouvés`);
        stats.items_analyzed += items.length;
        
        const itemsToDelete = [];
        let preservedCount = 0;
        
        for (const item of items) {
            // Vérifier si c'est une entreprise propriétaire (à préserver)
            if (collectionName === 'companies' && isOwnerCompany(item)) {
                console.log(`   🛡️  Entreprise propriétaire préservée: ${item.name || item.id}`);
                preservedCount++;
                stats.preserved_companies++;
                continue;
            }
            
            // Vérifier si c'est des données Faker
            const fakerCheck = isFakerData(item, collectionName);
            if (fakerCheck.isFaker) {
                itemsToDelete.push({
                    id: item.id,
                    reason: fakerCheck.reason
                });
            }
        }
        
        console.log(`   🗑️  ${itemsToDelete.length} items Faker identifiés`);
        console.log(`   🛡️  ${preservedCount} items préservés`);
        stats.items_to_delete += itemsToDelete.length;
        
        // Afficher quelques exemples
        if (itemsToDelete.length > 0) {
            console.log(`   📋 Exemples d'items à supprimer :`);
            itemsToDelete.slice(0, 3).forEach(item => {
                console.log(`      - ID: ${item.id} - ${item.reason}`);
            });
            if (itemsToDelete.length > 3) {
                console.log(`      ... et ${itemsToDelete.length - 3} autres`);
            }
        }
        
        return itemsToDelete;
        
    } catch (error) {
        console.error(`   ❌ Erreur lors de l'analyse de "${collectionName}":`, error.message);
        stats.errors++;
        return [];
    }
}

async function deleteItems(directus, collectionName, itemIds) {
    if (itemIds.length === 0) return;
    
    console.log(`\n🗑️ Suppression de ${itemIds.length} items de "${collectionName}"...`);
    
    if (DRY_RUN) {
        console.log('   🔍 MODE DRY-RUN - Aucune suppression réelle');
        stats.items_deleted += itemIds.length; // Simulation
        return;
    }
    
    try {
        // Supprimer par petits lots pour éviter les timeouts
        const batchSize = 50;
        let deleted = 0;
        
        for (let i = 0; i < itemIds.length; i += batchSize) {
            const batch = itemIds.slice(i, i + batchSize);
            await directus.items(collectionName).deleteMany(batch);
            deleted += batch.length;
            console.log(`   ✅ ${deleted}/${itemIds.length} supprimés`);
        }
        
        stats.items_deleted += deleted;
        console.log(`   🎯 Suppression terminée: ${deleted} items`);
        
    } catch (error) {
        console.error(`   ❌ Erreur lors de la suppression de "${collectionName}":`, error.message);
        stats.errors++;
    }
}

async function main() {
    console.log('🧹 NETTOYAGE DES DONNÉES DE TEST DIRECTUS');
    console.log('=========================================\n');
    
    if (DRY_RUN) {
        console.log('🔍 MODE DRY-RUN ACTIVÉ - Aucune modification réelle');
        console.log('💡 Utilisez --execute pour effectuer les suppressions\n');
    } else {
        console.log('⚠️  MODE EXÉCUTION - Les suppressions seront RÉELLES');
        console.log('🛡️ Entreprises propriétaires préservées:', OWNER_COMPANIES.join(', '));
        console.log('');
    }
    
    const directus = await initDirectus();
    
    console.log('📋 Collections à analyser:', COLLECTIONS_TO_CLEAN.join(', '));
    
    // Scanner chaque collection
    const allDeletions = {};
    
    for (const collectionName of COLLECTIONS_TO_CLEAN) {
        stats.collections_scanned++;
        const itemsToDelete = await scanCollection(directus, collectionName);
        
        if (itemsToDelete.length > 0) {
            allDeletions[collectionName] = itemsToDelete.map(item => item.id);
        }
    }
    
    // Résumé avant suppression
    console.log('\n📊 RÉSUMÉ DE L\'ANALYSE');
    console.log('=======================');
    console.log(`Collections analysées: ${stats.collections_scanned}`);
    console.log(`Items analysés: ${stats.items_analyzed}`);
    console.log(`Items Faker détectés: ${stats.items_to_delete}`);
    console.log(`Entreprises préservées: ${stats.preserved_companies}`);
    console.log(`Erreurs: ${stats.errors}`);
    
    if (stats.items_to_delete === 0) {
        console.log('\n✅ Aucune donnée Faker détectée - Base de données propre');
        return;
    }
    
    // Effectuer les suppressions
    console.log('\n🗑️ PHASE DE SUPPRESSION');
    console.log('========================');
    
    for (const [collectionName, itemIds] of Object.entries(allDeletions)) {
        await deleteItems(directus, collectionName, itemIds);
    }
    
    // Statistiques finales
    console.log('\n✅ NETTOYAGE TERMINÉ');
    console.log('====================');
    console.log(`Items supprimés: ${stats.items_deleted}`);
    console.log(`Items préservés: ${stats.items_analyzed - stats.items_deleted}`);
    console.log(`Taux de suppression: ${((stats.items_deleted / stats.items_analyzed) * 100).toFixed(1)}%`);
    
    if (stats.errors > 0) {
        console.log(`\n⚠️  ${stats.errors} erreur(s) rencontrée(s)`);
    }
    
    if (DRY_RUN) {
        console.log('\n💡 Relancer avec --execute pour effectuer les suppressions réelles');
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