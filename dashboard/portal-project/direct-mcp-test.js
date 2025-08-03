/**
 * Test direct de connexion MCP Notion
 * Ce script vérifie l'accès aux bases de données Notion
 */

// Liste des bases de données à vérifier
const DATABASES_TO_CHECK = [
    { name: 'Contacts', id: '226adb95-3c6f-8006-b411-cfe20c8239f2' },
    { name: 'Entreprises', id: '226adb95-3c6f-8008-a3e5-f992fbe83f01' },
    { name: 'Factures Clients', id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a' },
    { name: 'Devis & Factures Fournisseurs', id: '226adb95-3c6f-8016-9379-e959ff862d5a' },
    { name: 'TVA Déclarations', id: '237adb95-3c6f-801f-a746-c0f0560f8d67' },
    { name: 'Notes de Frais', id: '237adb95-3c6f-804b-a530-e44d07ac9f7b' },
    { name: 'Écritures Comptables', id: '226adb95-3c6f-8054-aed2-d646e93f96f5' },
    { name: 'Cashflow', id: '226adb95-3c6f-8057-b4de-d1e853b31529' },
    { name: 'Gestion Stock', id: '226adb95-3c6f-805e-bd30-cebd93e5ea31' },
    { name: 'Projets Clients', id: '226adb95-3c6f-806e-9e61-e263baf7af69' },
    { name: 'Sales Pipeline', id: '226adb95-3c6f-805b-8cf1-d13fc59e8e68' }
];

console.log('🔍 AUDIT MCP NOTION - DÉMARRAGE');
console.log('================================\n');

// Vérifier la disponibilité de MCP
console.log('1. Vérification de la disponibilité MCP...');
console.log('   - typeof mcp_notion:', typeof mcp_notion);
console.log('   - typeof window.mcp_notion:', typeof window?.mcp_notion);

// Si MCP est disponible, tester les connexions
if (typeof mcp_notion !== 'undefined') {
    console.log('✅ MCP Notion détecté!\n');
    
    // Lister toutes les bases disponibles
    console.log('2. Liste de toutes les bases de données...');
    try {
        const allDatabases = await mcp_notion.list_databases();
        console.log(`✅ ${allDatabases.length} bases trouvées au total`);
        
        // Afficher les 5 premières
        console.log('\nPremières bases trouvées:');
        allDatabases.slice(0, 5).forEach((db, i) => {
            const title = db.title?.[0]?.plain_text || 'Sans titre';
            console.log(`   ${i + 1}. ${title} (${db.id})`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la liste des bases:', error.message);
    }
    
    // Tester chaque base spécifique
    console.log('\n3. Test des bases du projet...');
    
    for (const db of DATABASES_TO_CHECK) {
        try {
            console.log(`\n📊 Test: ${db.name}`);
            console.log(`   ID: ${db.id}`);
            
            const result = await mcp_notion.query_database({
                database_id: db.id,
                page_size: 1
            });
            
            if (result && result.results) {
                console.log(`   ✅ Accessible - ${result.results.length} entrées trouvées`);
                
                // Afficher les propriétés si disponibles
                if (result.results.length > 0) {
                    const properties = Object.keys(result.results[0].properties || {});
                    console.log(`   Propriétés: ${properties.join(', ')}`);
                }
            } else {
                console.log('   ❌ Base non accessible ou vide');
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}`);
        }
    }
    
    // Résumé
    console.log('\n================================');
    console.log('📊 RÉSUMÉ DE L\'AUDIT');
    console.log('================================');
    console.log('MCP Notion: ✅ Disponible');
    console.log('Bases testées: ' + DATABASES_TO_CHECK.length);
    
} else {
    console.log('❌ MCP Notion non disponible!');
    console.log('\nRaisons possibles:');
    console.log('1. L\'extension MCP n\'est pas installée');
    console.log('2. Le serveur MCP n\'est pas démarré');
    console.log('3. Les permissions ne sont pas configurées');
    console.log('\nSolution:');
    console.log('1. Installer l\'extension MCP Notion');
    console.log('2. Configurer le token d\'intégration Notion');
    console.log('3. Redémarrer le navigateur');
}

console.log('\n🔍 AUDIT TERMINÉ');