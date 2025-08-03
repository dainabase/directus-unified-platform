/**
 * Test VAT Integration with Notion
 * 
 * This script tests the complete VAT workflow:
 * 1. Load invoices from Notion
 * 2. Calculate VAT amounts
 * 3. Save declaration to Notion
 * 4. Load history from Notion
 */

// Test function for VAT integration
async function testVATIntegration() {
    console.log('🧪 Starting VAT Integration Tests...\n');
    
    const results = {
        loadInvoices: false,
        calculateVAT: false,
        saveDeclaration: false,
        loadHistory: false,
        exportXML: false
    };
    
    try {
        // Test 1: Load invoices for current period
        console.log('📋 Test 1: Loading invoices for current period...');
        const now = new Date();
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startDate = new Date(now.getFullYear(), currentQuarter * 3, 1).toISOString();
        const endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0).toISOString();
        
        const invoices = await VATCalculator.loadInvoicesForPeriod(startDate, endDate);
        console.log(`✅ Loaded ${invoices.clientInvoices.length} client invoices`);
        console.log(`✅ Loaded ${invoices.supplierInvoices.length} supplier invoices`);
        console.log(`✅ Loaded ${invoices.expenses.length} expenses`);
        results.loadInvoices = true;
        
        // Test 2: Calculate VAT amounts
        console.log('\n💰 Test 2: Calculating VAT amounts...');
        await VATCalculator.loadPeriodData(now.getFullYear(), `Q${currentQuarter + 1}`);
        const declaration = VATCalculator.getCurrentDeclaration();
        
        console.log(`TVA Collectée:`);
        console.log(`  - Taux normal (8.1%): CHF ${VATCalculator.formatSwissAmount(declaration.collected.normalRate.vatAmount)}`);
        console.log(`  - Taux réduit (2.6%): CHF ${VATCalculator.formatSwissAmount(declaration.collected.reducedRate.vatAmount)}`);
        console.log(`  - Taux hébergement (3.8%): CHF ${VATCalculator.formatSwissAmount(declaration.collected.lodgingRate.vatAmount)}`);
        console.log(`  - Total: CHF ${VATCalculator.formatSwissAmount(declaration.collected.totalCollected)}`);
        
        console.log(`\nTVA Déductible:`);
        console.log(`  - Marchandises: CHF ${VATCalculator.formatSwissAmount(declaration.deductible.goods.vatAmount)}`);
        console.log(`  - Services: CHF ${VATCalculator.formatSwissAmount(declaration.deductible.services.vatAmount)}`);
        console.log(`  - Investissements: CHF ${VATCalculator.formatSwissAmount(declaration.deductible.investments.vatAmount)}`);
        console.log(`  - Total: CHF ${VATCalculator.formatSwissAmount(declaration.deductible.totalDeductible)}`);
        
        console.log(`\n📊 Résultat:`);
        if (declaration.result.vatToPay > 0) {
            console.log(`  ⚠️ TVA à payer: CHF ${VATCalculator.formatSwissAmount(declaration.result.vatToPay)}`);
        } else {
            console.log(`  ✅ TVA à récupérer: CHF ${VATCalculator.formatSwissAmount(declaration.result.vatToRecover)}`);
        }
        results.calculateVAT = true;
        
        // Test 3: Run coherence controls
        console.log('\n🔍 Test 3: Running coherence controls...');
        const controls = VATCalculator.runCoherenceControls();
        controls.forEach(control => {
            const icon = control.status === 'success' ? '✅' : control.status === 'warning' ? '⚠️' : '❌';
            console.log(`${icon} ${control.name}: ${control.message}`);
        });
        
        // Test 4: Save declaration to Notion
        if (typeof mcp_notion !== 'undefined') {
            console.log('\n💾 Test 4: Saving declaration to Notion...');
            const success = await VATCalculator.submitDeclaration();
            if (success) {
                console.log('✅ Declaration saved successfully');
                console.log(`   Reference: ${declaration.result.paymentReference}`);
                results.saveDeclaration = true;
            } else {
                console.log('❌ Failed to save declaration (errors in controls)');
            }
            
            // Test 5: Load history from Notion
            console.log('\n📚 Test 5: Loading VAT history...');
            const history = await VATCalculator.loadVATHistory(now.getFullYear());
            console.log(`✅ Loaded ${history.length} declarations for ${now.getFullYear()}`);
            history.slice(0, 3).forEach(decl => {
                console.log(`   - ${decl.period.year} ${decl.period.code}: CHF ${VATCalculator.formatSwissAmount(decl.result.vatToPay || -decl.result.vatToRecover)}`);
            });
            results.loadHistory = true;
        } else {
            console.log('\n⚠️ MCP Notion not available - skipping save/load tests');
        }
        
        // Test 6: Generate XML export
        console.log('\n📄 Test 6: Generating AFC XML export...');
        const xml = VATCalculator.generateAFCExport();
        if (xml) {
            console.log('✅ XML export generated successfully');
            console.log(`   Length: ${xml.length} characters`);
            results.exportXML = true;
            
            // Save XML to file (in real app, this would download)
            if (typeof window !== 'undefined') {
                const blob = new Blob([xml], { type: 'application/xml' });
                const url = URL.createObjectURL(blob);
                console.log(`   Download URL: ${url}`);
            }
        }
        
        // Test 7: Compare methods
        console.log('\n🔄 Test 7: Comparing declaration methods...');
        const revenue = declaration.collected.normalRate.netAmount + 
                       declaration.collected.reducedRate.netAmount + 
                       declaration.collected.lodgingRate.netAmount;
        
        const comparison = VATCalculator.compareDeclarationMethods(revenue);
        console.log(`Revenue trimestriel: CHF ${VATCalculator.formatSwissAmount(revenue)}`);
        console.log(`Méthode effective: CHF ${VATCalculator.formatSwissAmount(comparison.effective)}`);
        console.log(`Méthodes forfaitaires:`);
        Object.entries(comparison.forfait).forEach(([type, amount]) => {
            console.log(`  - ${type}: CHF ${VATCalculator.formatSwissAmount(amount)}`);
        });
        console.log(`\n💡 Recommandation: Méthode ${comparison.recommendation}`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY:');
    console.log('='.repeat(60));
    
    let passed = 0;
    let total = 0;
    
    Object.entries(results).forEach(([test, result]) => {
        total++;
        if (result) passed++;
        console.log(`${result ? '✅' : '❌'} ${test}`);
    });
    
    console.log(`\nTotal: ${passed}/${total} tests passed`);
    
    return results;
}

// Run tests if called directly
if (typeof window !== 'undefined') {
    window.testVATIntegration = testVATIntegration;
    
    // Auto-run if on VAT reports page
    if (window.location.pathname.includes('vat-reports')) {
        console.log('VAT Reports page detected - running integration tests...');
        setTimeout(async () => {
            await testVATIntegration();
        }, 2000);
    }
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testVATIntegration };
}