import axios from 'axios';

const API_URL = 'http://localhost:8055';
const API_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function testDashboardAPI() {
    console.log('🧪 Test de l\'API pour le Dashboard V4\n');
    
    const client = axios.create({
        baseURL: API_URL,
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    
    const tests = [
        {
            name: 'Test serveur Directus',
            endpoint: '/server/info',
            expected: 'version'
        },
        {
            name: 'Test authentification',
            endpoint: '/users/me',
            expected: 'id'
        },
        {
            name: 'Test KPIs par entreprise',
            endpoint: '/items/kpis?filter[owner_company][_eq]=HYPERVISUAL',
            expected: 'data'
        },
        {
            name: 'Test projets actifs',
            endpoint: '/items/projects?filter[status][_eq]=active&filter[owner_company][_eq]=HYPERVISUAL',
            expected: 'data'
        },
        {
            name: 'Test transactions récentes',
            endpoint: '/items/bank_transactions?limit=10&filter[owner_company][_eq]=HYPERVISUAL',
            expected: 'data'
        },
        {
            name: 'Test factures impayées',
            endpoint: '/items/client_invoices?filter[status][_eq]=unpaid&filter[owner_company][_eq]=HYPERVISUAL',
            expected: 'data'
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const response = await client.get(test.endpoint);
            
            if (response.data && (test.expected in response.data || response.data[test.expected])) {
                console.log(`✅ ${test.name}: OK`);
                if (response.data.data && Array.isArray(response.data.data)) {
                    console.log(`   → ${response.data.data.length} éléments trouvés`);
                }
                passed++;
            } else {
                console.log(`❌ ${test.name}: Structure incorrecte`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
            failed++;
        }
    }
    
    // Test spécifique des métriques KPI
    console.log('\n📊 Test des métriques KPI par entreprise:');
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    
    for (const company of companies) {
        try {
            const response = await client.get(`/items/kpis?filter[owner_company][_eq]=${company}`);
            const kpis = response.data.data;
            const metrics = ['ARR', 'MRR', 'CASH_RUNWAY', 'NPS', 'EBITDA_MARGIN', 'LTV_CAC'];
            const foundMetrics = metrics.filter(m => kpis.some(k => k.metric_name === m));
            
            console.log(`   ${company}: ${foundMetrics.length}/6 métriques (${kpis.length} KPIs total)`);
        } catch (error) {
            console.log(`   ${company}: ❌ Erreur`);
        }
    }
    
    console.log(`\n📈 Résumé: ${passed}/${tests.length} tests passés`);
    console.log(`${failed > 0 ? '⚠️ Des erreurs ont été détectées' : '✅ Tous les tests sont passés'}`);
    
    return { passed, failed };
}

testDashboardAPI().catch(console.error);