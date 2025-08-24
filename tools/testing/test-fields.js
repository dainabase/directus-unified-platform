import axios from 'axios';

async function testFields() {
    const API_URL = 'http://localhost:8055';
    const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
    
    try {
        // Test KPIs
        const kpiResponse = await axios.get(`${API_URL}/items/kpis?limit=1`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        console.log('✅ KPIs fields:', Object.keys(kpiResponse.data.data[0] || {}));
        
        // Test Payments
        const paymentResponse = await axios.get(`${API_URL}/items/payments?limit=1`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        console.log('✅ Payments fields:', Object.keys(paymentResponse.data.data[0] || {}));
        
        // Vérifier les champs critiques
        const kpiFields = Object.keys(kpiResponse.data.data[0] || {});
        const hasKpiFields = kpiFields.includes('metric_name') && 
                            kpiFields.includes('value') && 
                            kpiFields.includes('date');
        
        const paymentFields = Object.keys(paymentResponse.data.data[0] || {});
        const hasPaymentField = paymentFields.includes('payment_date');
        
        console.log('\n📊 Résultat:');
        console.log(`KPIs: ${hasKpiFields ? '✅ COMPLET' : '❌ INCOMPLET'}`);
        console.log(`Payments: ${hasPaymentField ? '✅ COMPLET' : '❌ INCOMPLET'}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testFields();