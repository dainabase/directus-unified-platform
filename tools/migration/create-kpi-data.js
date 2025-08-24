import axios from 'axios';

async function createKPIData() {
    const API_URL = 'http://localhost:8055';
    const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
    
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    const metrics = [
        { name: 'ARR', value: 850000 },
        { name: 'MRR', value: 70833 },
        { name: 'EBITDA_MARGIN', value: 22.5 },
        { name: 'LTV_CAC', value: 3.8 },
        { name: 'NPS', value: 72 },
        { name: 'CASH_RUNWAY', value: 18 }
    ];
    
    let createdCount = 0;
    
    for (const company of companies) {
        for (const metric of metrics) {
            try {
                await axios.post(`${API_URL}/items/kpis`, {
                    metric_name: metric.name,
                    value: metric.value + (Math.random() * 10 - 5), // Variation aléatoire
                    date: new Date().toISOString().split('T')[0],
                    owner_company: company,
                    status: 'active',
                    name: `${metric.name} - ${company}`,
                    description: `KPI ${metric.name} pour ${company}`
                }, {
                    headers: { 'Authorization': `Bearer ${TOKEN}` }
                });
                
                createdCount++;
                console.log(`✅ KPI créé: ${metric.name} pour ${company}`);
            } catch (error) {
                console.error(`❌ Erreur pour ${metric.name}:`, error.message);
                if (error.response) {
                    console.error('Details:', error.response.data);
                }
            }
        }
    }
    
    console.log(`\n📊 Total KPIs créés: ${createdCount}/30`);
}

createKPIData();