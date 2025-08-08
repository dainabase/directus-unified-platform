import axios from 'axios';

async function testDashboardKPIs() {
    const API_URL = 'http://localhost:8055';
    const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
    
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    const metrics = ['ARR', 'MRR', 'EBITDA_MARGIN', 'LTV_CAC', 'NPS', 'CASH_RUNWAY'];
    
    console.log('🔍 Test des KPIs par entreprise:\n');
    
    for (const company of companies) {
        console.log(`\n📊 ${company}:`);
        console.log('-'.repeat(40));
        
        try {
            // Récupérer les KPIs pour cette entreprise
            const response = await axios.get(`${API_URL}/items/kpis`, {
                params: {
                    filter: {
                        owner_company: { _eq: company },
                        status: { _eq: 'active' }
                    }
                },
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            
            const kpis = response.data.data;
            
            // Grouper par metric_name
            const kpisByMetric = {};
            kpis.forEach(kpi => {
                if (kpi.metric_name) {
                    kpisByMetric[kpi.metric_name] = kpi;
                }
            });
            
            // Afficher les métriques
            for (const metric of metrics) {
                const kpi = kpisByMetric[metric];
                if (kpi) {
                    const value = metric === 'EBITDA_MARGIN' || metric === 'NPS' 
                        ? `${kpi.value}%` 
                        : metric === 'CASH_RUNWAY' 
                        ? `${kpi.value} mois`
                        : metric === 'LTV_CAC'
                        ? `${kpi.value}x`
                        : `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(kpi.value)}`;
                    
                    console.log(`  ${metric}: ${value}`);
                } else {
                    console.log(`  ${metric}: ❌ Non trouvé`);
                }
            }
            
            console.log(`  Total KPIs: ${kpis.length}`);
            
        } catch (error) {
            console.error(`❌ Erreur pour ${company}:`, error.message);
        }
    }
    
    // Test du filtrage multi-entreprises
    console.log('\n\n🧪 Test du filtrage multi-entreprises:');
    console.log('='.repeat(50));
    
    try {
        // Tous les KPIs
        const allResponse = await axios.get(`${API_URL}/items/kpis`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        console.log(`✅ Total tous KPIs: ${allResponse.data.data.length}`);
        
        // KPIs par entreprise
        for (const company of companies) {
            const filteredResponse = await axios.get(`${API_URL}/items/kpis`, {
                params: {
                    filter: {
                        owner_company: { _eq: company }
                    }
                },
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            console.log(`✅ KPIs ${company}: ${filteredResponse.data.data.length}`);
        }
        
    } catch (error) {
        console.error('❌ Erreur test filtrage:', error.message);
    }
}

testDashboardKPIs();