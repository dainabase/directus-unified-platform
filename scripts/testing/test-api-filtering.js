const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8055';
const TOKEN = 'Gy1qvOikJ-IxDIHRot8YDdAm_XJ8S5A0';

// Headers par défaut
const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
};

// Entreprises à tester
const OWNER_COMPANIES = {
    "HYPERVISUAL": "2d6b906a-5b8a-4d9e-a37b-aee8c1281b22",
    "DAINAMICS": "55483d07-6621-43d4-89a9-5ebbffe86fea",
    "ENKI REALTY": "6f4bc42a-d083-4df5-ace3-6b910164ae18",
    "LEXAIA": "9314fda4-cf3b-4021-9556-3acaa5f35b3f",
    "TAKEOUT": "a1313adf-0347-424b-aff2-c5f0b33c4a05"
};

async function testFilteringForCompany(companyName, companyId) {
    console.log(`\n🏢 Test pour ${companyName} (${companyId})`);
    console.log('='.repeat(60));
    
    const tests = [
        {
            name: 'Projects',
            endpoint: '/items/projects',
            filter: { owner_company: { _eq: companyId } }
        },
        {
            name: 'Deliverables',
            endpoint: '/items/deliverables',
            filter: { owner_company: { _eq: companyId } }
        },
        {
            name: 'Client Invoices',
            endpoint: '/items/client_invoices',
            filter: { owner_company: { _eq: companyId } }
        },
        {
            name: 'Supplier Invoices',
            endpoint: '/items/supplier_invoices',
            filter: { owner_company: { _eq: companyId } }
        },
        {
            name: 'Payments',
            endpoint: '/items/payments',
            filter: { owner_company: { _eq: companyId } }
        },
        {
            name: 'Bank Transactions',
            endpoint: '/items/bank_transactions',
            filter: { owner_company: { _eq: companyId } }
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            // Test avec filtrage
            const url = `${BASE_URL}${test.endpoint}?filter=${JSON.stringify(test.filter)}&limit=100`;
            const response = await axios.get(url, { headers });
            
            const count = response.data.data ? response.data.data.length : 0;
            
            // Vérifier que tous les résultats appartiennent bien à la bonne entreprise
            let validCount = 0;
            if (response.data.data && count > 0) {
                validCount = response.data.data.filter(item => 
                    item.owner_company === companyId
                ).length;
            }
            
            const isValid = count === validCount;
            const status = isValid ? '✅' : '⚠️';
            
            console.log(`${status} ${test.name}: ${count} enregistrements (${validCount} valides)`);
            
            results.push({
                collection: test.name,
                total: count,
                valid: validCount,
                isValid
            });
            
        } catch (error) {
            console.log(`❌ ${test.name}: Erreur - ${error.message}`);
            results.push({
                collection: test.name,
                error: error.message
            });
        }
    }
    
    return results;
}

async function testGlobalCounts() {
    console.log('\n📊 COMPTE GLOBAL (sans filtrage)');
    console.log('='.repeat(60));
    
    const collections = [
        'projects', 'deliverables', 'client_invoices', 
        'supplier_invoices', 'payments', 'bank_transactions'
    ];
    
    for (const collection of collections) {
        try {
            const response = await axios.get(
                `${BASE_URL}/items/${collection}?aggregate[count]=*`,
                { headers }
            );
            
            const count = response.data.data?.[0]?.count || 0;
            console.log(`📁 ${collection}: ${count} total`);
            
        } catch (error) {
            console.log(`❌ ${collection}: Erreur - ${error.message}`);
        }
    }
}

async function main() {
    console.log('🔍 TEST DU FILTRAGE PAR OWNER_COMPANY');
    console.log('='.repeat(60));
    
    // Test des comptes globaux
    await testGlobalCounts();
    
    // Test pour chaque entreprise
    const allResults = {};
    
    for (const [name, id] of Object.entries(OWNER_COMPANIES)) {
        const results = await testFilteringForCompany(name, id);
        allResults[name] = results;
    }
    
    // Résumé final
    console.log('\n📈 RÉSUMÉ FINAL');
    console.log('='.repeat(60));
    
    for (const [company, results] of Object.entries(allResults)) {
        const totalRecords = results.reduce((sum, r) => sum + (r.total || 0), 0);
        const validRecords = results.reduce((sum, r) => sum + (r.valid || 0), 0);
        const hasErrors = results.some(r => r.error);
        
        const status = hasErrors ? '⚠️' : (totalRecords === validRecords ? '✅' : '⚠️');
        console.log(`${status} ${company}: ${totalRecords} enregistrements (${validRecords} valides)`);
    }
    
    console.log('\n✅ Tests terminés!');
}

main().catch(error => {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
});