/**
 * Test du système OCR Multi-Entités
 * Teste la détection et le parsing pour différentes entités du groupe
 */

console.log('🌍 === TEST MULTI-ENTITÉS OCR V3 ===\n');

// Exemples de documents pour chaque entité
const testDocumentsMultiEntities = {
  // HYPERVISUAL - Facture en CHF
  hypervisualClient: `
HYPERVISUAL by HMF Corporation SA
Avenue de Beauregard 1
1700 Fribourg
CHE-100.968.497 TVA

FACTURE N° HYP-2025-001
Date: 15.01.2025

Client:
PUBLIGRAMA ADVERTISING S.L.
Carrer Major 123
08001 Barcelona, España

Services de design graphique             CHF 8'500.00
Développement site web                   CHF 12'300.00

Sous-total                              CHF 20'800.00
TVA 8.1%                                CHF  1'684.80
TOTAL                                   CHF 22'484.80

IBAN: CH93 0076 2011 6238 5295 7
`,

  // DAINAMICS - Facture en EUR
  dainamicsSupplier: `
Adobe Systems Europe Limited
4-6 Riverwalk
Citywest Business Campus
Dublin 24, Ireland

INVOICE
Invoice #: IE-2025-78945
Date: January 10, 2025

Bill To:
DAINAMICS Solutions
123 Tech Boulevard
75001 Paris, France

Creative Cloud Enterprise               €450.00/month
Stock Photos (500 downloads)            €250.00
Support Premium                         €100.00

Subtotal                               €800.00
VAT (20%)                              €160.00
TOTAL                                  €960.00

Payment due: 30 days
`,

  // ENKI REALITY - Facture en USD
  enkiClient: `
ENKI REALITY
1234 Innovation Drive
San Francisco, CA 94105
EIN 45-1234567

INVOICE #ER-2025-456
Date: 01/15/2025

Bill To:
Meta Platforms Inc.
1 Hacker Way
Menlo Park, CA 94025

AR/VR Development Services:
- Custom Reality OS Module              $45,000.00
- 3D Asset Creation                     $12,500.00
- Technical Consulting (80h)            $16,000.00

Subtotal                               $73,500.00
CA Sales Tax (8.5%)                     $6,247.50
TOTAL DUE                              $79,747.50

Wire: Bank of America - SWIFT: BOFAUS3N
`,

  // TAKEOUT - Facture en EUR
  takeoutSupplier: `
Delivery Hero SE
Oranienburger Straße 70
10117 Berlin
Germany
DE123456789

RECHNUNG
Rechnungsnr: DH-2025-4567
Datum: 10.01.2025

An:
TAKEOUT Services
Friedrichstraße 123
10117 Berlin

Platform-Gebühren Januar 2025           €1,234.56
Transaktionsgebühren                     €567.89
Marketing-Services                        €890.00

Zwischensumme                          €2,692.45
MwSt 19%                                 €511.57
GESAMTBETRAG                           €3,204.02

IBAN: DE89 3704 0044 0532 0130 00
`,

  // LEXAIA - Facture en CAD
  lexaiaClient: `
LEXAIA AI
500 Tech Park Avenue
Toronto, ON M5V 3C7
123456789RT0001

INVOICE
Invoice #: LEX-2025-789
Date: January 15, 2025

To:
Royal Bank of Canada
200 Bay Street
Toronto, ON M5J 2J5

AI Legal Analysis Platform:
- Annual License (Enterprise)           CAD 125,000.00
- Custom Model Training                 CAD  45,000.00
- Priority Support                      CAD  15,000.00

Subtotal                               CAD 185,000.00
HST (13%)                              CAD  24,050.00
TOTAL                                  CAD 209,050.00

Payment Terms: Net 30
`
};

// Fonction de test améliorée
async function testMultiEntitiesDetection() {
  console.log('✅ Vérification des dépendances...\n');
  
  // Vérifier que tout est chargé
  if (!window.ENTITIES_CONFIG) {
    console.error('❌ ENTITIES_CONFIG non trouvé');
    return;
  }
  
  if (!window.ocrProcessor) {
    console.error('❌ OCR Processor non trouvé');
    return;
  }
  
  console.log('🏢 Entités configurées:');
  Object.entries(ENTITIES_CONFIG).forEach(([key, config]) => {
    console.log(`  - ${key}: ${config.name} (${config.currency})`);
  });
  
  console.log('\n📊 Tests de détection:\n');
  
  // Tester chaque document
  for (const [docType, text] of Object.entries(testDocumentsMultiEntities)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 TEST: ${docType}`);
    console.log('='.repeat(60));
    
    // Détecter le type
    const detection = window.ocrProcessor.detectInvoiceType(text);
    
    console.log('\n🔍 Résultat détection:');
    console.log(`  Type: ${detection.type}`);
    console.log(`  Entité: ${detection.entity?.config.name || 'Non détectée'}`);
    console.log(`  Devise: ${detection.currency || 'Non détectée'}`);
    console.log(`  Langue: ${detection.language || 'Non détectée'}`);
    console.log(`  Confiance: ${detection.confidence}%`);
    
    // Parser le document
    const mockOcrResult = { data: { text, confidence: 95 } };
    let parsedResult;
    
    if (detection.type === 'client_invoice') {
      parsedResult = window.ocrProcessor.parseClientInvoiceGeneric(text, mockOcrResult, detection);
    } else if (detection.type === 'supplier_invoice') {
      parsedResult = window.ocrProcessor.parseSupplierInvoiceGeneric(text, mockOcrResult, detection);
    } else {
      parsedResult = window.ocrProcessor.parseUnknownDocument(text, mockOcrResult, detection);
    }
    
    console.log('\n📋 Données extraites:');
    const data = parsedResult.extractedData;
    
    if (detection.type === 'client_invoice') {
      console.log(`  Client: ${data.client?.name || 'Non trouvé'}`);
      console.log(`  Montant: ${data.amounts?.total || 'Non trouvé'} ${data.amounts?.currency || ''}`);
    } else {
      console.log(`  Fournisseur: ${data.supplier?.name || 'Non trouvé'}`);
      console.log(`  Montant: ${data.amounts?.total || 'Non trouvé'} ${data.amounts?.currency || ''}`);
    }
    
    console.log(`  N° Document: ${data.invoice?.number || 'Non trouvé'}`);
    console.log(`  Badge: ${data.display?.badge || 'Non défini'}`);
    
    // Vérifications spécifiques
    console.log('\n✓ Vérifications:');
    const checks = [];
    
    // Vérifier la détection d'entité
    if (docType.includes('hypervisual')) {
      checks.push(`Entité HYPERVISUAL: ${detection.entity?.key === 'hypervisual' ? '✅' : '❌'}`);
    } else if (docType.includes('dainamics')) {
      checks.push(`Entité DAINAMICS: ${detection.entity?.key === 'dainamics' ? '✅' : '❌'}`);
    } else if (docType.includes('enki')) {
      checks.push(`Entité ENKI: ${detection.entity?.key === 'enki_reality' ? '✅' : '❌'}`);
    } else if (docType.includes('takeout')) {
      checks.push(`Entité TAKEOUT: ${detection.entity?.key === 'takeout' ? '✅' : '❌'}`);
    } else if (docType.includes('lexaia')) {
      checks.push(`Entité LEXAIA: ${detection.entity?.key === 'lexaia' ? '✅' : '❌'}`);
    }
    
    // Vérifier la devise
    if (text.includes('CHF')) {
      checks.push(`Devise CHF: ${detection.currency === 'CHF' ? '✅' : '❌'}`);
    } else if (text.includes('€') || text.includes('EUR')) {
      checks.push(`Devise EUR: ${detection.currency === 'EUR' ? '✅' : '❌'}`);
    } else if (text.includes('$') || text.includes('USD')) {
      checks.push(`Devise USD: ${detection.currency === 'USD' ? '✅' : '❌'}`);
    } else if (text.includes('CAD')) {
      checks.push(`Devise CAD: ${detection.currency === 'CAD' ? '✅' : '❌'}`);
    }
    
    // Vérifier le type (client/supplier)
    if (docType.includes('Client')) {
      checks.push(`Type client: ${detection.type === 'client_invoice' ? '✅' : '❌'}`);
    } else if (docType.includes('Supplier')) {
      checks.push(`Type fournisseur: ${detection.type === 'supplier_invoice' ? '✅' : '❌'}`);
    }
    
    checks.forEach(check => console.log(`  - ${check}`));
  }
  
  console.log('\n\n✅ Tests terminés!');
}

// Test avec fichier réel
window.testMultiEntitiesFile = async function() {
  console.log('\n🎯 TEST AVEC FICHIER RÉEL MULTI-ENTITÉS');
  
  const fileInput = document.getElementById('file-input');
  if (!fileInput || !fileInput.files[0]) {
    console.error('❌ Aucun fichier sélectionné');
    return;
  }
  
  const file = fileInput.files[0];
  console.log(`📄 Fichier: ${file.name}`);
  
  // Utiliser directement le processeur
  await window.ocrProcessor.processFile(file);
};

// Instructions
console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('testMultiEntitiesDetection()  - Tester tous les exemples multi-entités');
console.log('testMultiEntitiesFile()       - Tester avec un vrai fichier');
console.log('\n🏢 Le système supporte: HYPERVISUAL, DAINAMICS, ENKI REALITY, TAKEOUT, LEXAIA');

// Auto-exécution
testMultiEntitiesDetection();