/**
 * Test du système OCR v3 avec détection intelligente
 * Simule le traitement de différents types de documents
 */

console.log('🧪 === TEST OCR V3 - DÉTECTION INTELLIGENTE ===\n');

// Exemples de textes OCR pour tester la détection
const testDocuments = {
  // Facture CLIENT (sortante) - HYPERVISUAL envoie à un client
  factureClient: `
HYPERVISUAL
Rue de la Gare 45
1000 Lausanne
CHE-123.456.789 TVA

FACTURE
N° AN-00087
Date: 15.01.2025

Destinataire:
PUBLIGRAMA ADVERTISING S.L.
Carrer Major 123
08001 Barcelona
España

Description des services:
- Création site web responsive                CHF 8'500.00
- Design logo et charte graphique            CHF 3'200.00
- Maintenance 3 mois                         CHF 1'800.00

Sous-total                                   CHF 13'500.00
TVA 8.1%                                     CHF 1'093.50
TOTAL À PAYER                                CHF 14'593.50

Coordonnées bancaires:
IBAN: CH93 0076 2011 6238 5295 7
BIC: BCVLCH2LXXX

Conditions de paiement: 30 jours net
`,

  // Facture FOURNISSEUR (entrante) - HYPERVISUAL reçoit d'un fournisseur
  factureFournisseur: `
Microsoft Azure
One Microsoft Way
Redmond, WA 98052
USA

INVOICE
Invoice #: AZ-2025-789456
Date: January 10, 2025

Bill To:
HYPERVISUAL
Rue de la Gare 45
1000 Lausanne
Switzerland

Cloud Services - January 2025
- Virtual Machines (4 instances)              $450.00
- Storage (500GB)                            $125.00
- Bandwidth (2TB)                            $180.00
- SQL Database                               $220.00

Subtotal                                     $975.00
VAT (8.1%)                                   $78.98
TOTAL DUE                                    $1,053.98

Payment Terms: Due upon receipt
Wire Transfer: Bank of America
SWIFT: BOFAUS3N
`,

  // Note de frais
  noteDefFrais: `
NOTE DE FRAIS
Employé: Jean Dupont
Service: Commercial
Date: 12.01.2025

HYPERVISUAL
Rue de la Gare 45
1000 Lausanne

Détail des frais:
- Train Lausanne-Genève A/R                  CHF 58.40
- Repas client (Restaurant Le Bistrot)       CHF 156.80
- Taxi aéroport                              CHF 45.00
- Hôtel (1 nuit)                            CHF 185.00

TOTAL À REMBOURSER                           CHF 445.20

Approuvé par: Marie Martin
Date: 13.01.2025
`
};

// Fonction de test
async function testDocumentDetection() {
  // Vérifier que OCRProcessor v3 est chargé
  if (!window.OCRProcessor || !window.OCRProcessor.detectInvoiceType) {
    console.error('❌ OCRProcessor v3 non trouvé ou incomplet');
    console.log('💡 Assurez-vous que ocr-processor-v3.js est chargé');
    return;
  }

  console.log('✅ OCRProcessor v3 détecté\n');

  // Tester chaque document
  for (const [type, text] of Object.entries(testDocuments)) {
    console.log(`\n📄 TEST: ${type}`);
    console.log('─'.repeat(50));
    
    // Détecter le type
    const detectedType = window.OCRProcessor.detectInvoiceType(text);
    console.log(`Type détecté: ${detectedType}`);
    
    // Parser selon le type
    let result;
    const mockOcrResult = { data: { text } };
    
    if (detectedType === 'client') {
      result = window.OCRProcessor.parseClientInvoice(text, mockOcrResult);
    } else {
      result = window.OCRProcessor.parseSupplierInvoice(text, mockOcrResult);
    }
    
    console.log('\n📊 Données extraites:');
    console.log(JSON.stringify(result.extractedData, null, 2));
    
    // Vérifications
    console.log('\n✓ Vérifications:');
    if (type === 'factureClient') {
      console.log(`- Type correct: ${detectedType === 'client' ? '✅' : '❌'}`);
      console.log(`- Client trouvé: ${result.extractedData.client?.name === 'PUBLIGRAMA ADVERTISING S.L.' ? '✅' : '❌'}`);
      console.log(`- Montant correct: ${result.extractedData.amounts?.total?.value === 14593.50 ? '✅' : '❌'}`);
    } else if (type === 'factureFournisseur') {
      console.log(`- Type correct: ${detectedType === 'supplier' ? '✅' : '❌'}`);
      console.log(`- Fournisseur trouvé: ${result.extractedData.supplier?.name === 'Microsoft Azure' ? '✅' : '❌'}`);
    }
  }
}

// Fonction pour tester avec un vrai fichier
window.testRealFile = async function() {
  console.log('\n🎯 TEST AVEC FICHIER RÉEL');
  
  const fileInput = document.getElementById('file-input');
  if (!fileInput || !fileInput.files[0]) {
    console.error('❌ Aucun fichier sélectionné');
    console.log('💡 Sélectionnez d\'abord un fichier via l\'interface');
    return;
  }
  
  const file = fileInput.files[0];
  console.log(`📄 Fichier: ${file.name}`);
  
  // Simuler le traitement OCR
  await window.OCRProcessor.processSingleFile(file);
};

// Instructions
console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('testDocumentDetection()  - Tester la détection sur des exemples');
console.log('testRealFile()          - Tester avec un vrai fichier (sélectionnez d\'abord)');
console.log('\n🎯 COMMENCEZ PAR: testDocumentDetection()');

// Auto-exécution du test
testDocumentDetection();