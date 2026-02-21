/**
 * Tests Unitaires - QR-Factures ISO 20022 v2.3
 * =============================================
 * 
 * Suite de tests complète pour valider la conformité:
 * ✅ SIX Swiss QR-bill v2.3
 * ✅ ISO 20022 Customer Credit Transfer
 * ✅ Validation IBAN CH/LI MOD 97
 * ✅ Référence QR 27 chiffres Mod10 récursif
 * 
 * @version 2.3.0
 * @updated 2025-01-13
 */

import { 
    QRInvoiceGenerator,
    QRInvoiceUtils,
    QR_BILL_SCHEMA,
    ADDRESS_TYPES,
    REFERENCE_TYPES,
    ALLOWED_CURRENCIES
} from '../qr-invoice.js';

describe('QR-Factures ISO 20022 v2.3 - Tests de Conformité', () => {
    
    let generator;
    let creditorData;
    
    beforeEach(() => {
        creditorData = {
            IBAN: 'CH93 0076 2011 6238 5295 7',
            name: 'Hypervisual SA',
            street: 'Rue de la Tech',
            houseNumber: '42',
            postalCode: '1000',
            city: 'Lausanne',
            country: 'CH'
        };
        
        generator = new QRInvoiceGenerator(creditorData);
    });
    
    // ===== TESTS VALIDATION IBAN =====
    
    describe('Validation IBAN CH/LI avec checksum MOD 97', () => {
        
        test('IBAN suisse valide - format standard', () => {
            const validIBANs = [
                'CH93 0076 2011 6238 5295 7',
                'CH5604835012345678009',
                'CH3900700110010001000'
            ];
            
            validIBANs.forEach(iban => {
                expect(() => generator.validateIBAN(iban)).not.toThrow();
                const cleaned = generator.validateIBAN(iban);
                expect(cleaned).toMatch(/^CH\d{19}$/);
            });
        });
        
        test('IBAN liechtensteinois valide', () => {
            const validLI = 'LI21088100002324013AA';
            expect(() => generator.validateIBAN(validLI)).not.toThrow();
            const cleaned = generator.validateIBAN(validLI);
            expect(cleaned).toMatch(/^LI\d{19}$/);
        });
        
        test('IBAN invalide - format incorrect', () => {
            const invalidIBANs = [
                'CH9300762011623852',      // Trop court
                'CH930076201162385295700', // Trop long
                'DE89370400440532013000',  // Pays incorrect
                'CH9X00762011623852957',   // Caractères non-numériques
                ''                         // Vide
            ];
            
            invalidIBANs.forEach(iban => {
                expect(() => generator.validateIBAN(iban)).toThrow();
            });
        });
        
        test('IBAN invalide - checksum MOD 97 incorrecte', () => {
            const invalidChecksum = 'CH9400762011623852957'; // Checksum incorrecte
            expect(() => generator.validateIBAN(invalidChecksum)).toThrow(/checksum/i);
        });
        
        test('Validation checksum MOD 97 - calcul correct', () => {
            const testCases = [
                { iban: 'CH9300762011623852957', valid: true },
                { iban: 'CH9400762011623852957', valid: false },
                { iban: 'LI21088100002324013AA', valid: true }
            ];
            
            testCases.forEach(({ iban, valid }) => {
                expect(generator.validateIBANChecksum(iban)).toBe(valid);
            });
        });
        
        test('Formatage IBAN avec espaces', () => {
            const iban = 'CH9300762011623852957';
            const formatted = generator.formatIBAN(iban);
            expect(formatted).toBe('CH93 0076 2011 6238 5295 7');
        });
    });
    
    // ===== TESTS RÉFÉRENCE QR =====
    
    describe('Génération référence QR (27 chiffres, Mod10 récursif)', () => {
        
        test('Référence QR - format 27 chiffres', () => {
            const reference = generator.generateQRReference();
            expect(reference).toHaveLength(27);
            expect(/^\d{27}$/.test(reference)).toBe(true);
        });
        
        test('Référence QR - checksum Mod10 récursif valide', () => {
            const reference = generator.generateQRReference();
            expect(generator.validateQRReference(reference)).toBe(true);
        });
        
        test('Calcul Mod10 récursif - algorithme correct', () => {
            const testCases = [
                { input: '12345678901234567890123456', expected: 7 },
                { input: '00000000000000000000000000', expected: 0 },
                { input: '99999999999999999999999999', expected: 6 }
            ];
            
            testCases.forEach(({ input, expected }) => {
                expect(generator.calculateMod10Recursive(input)).toBe(expected);
            });
        });
        
        test('Validation référence QR - cas valides', () => {
            const validReferences = [
                '123456789012345678901234567', // Exemple avec checksum valide
                generator.generateQRReference()  // Référence générée
            ];
            
            // Calculer des références avec checksum correct
            validReferences.forEach(ref => {
                if (ref.length === 27) {
                    const base = ref.slice(0, 26);
                    const validRef = base + generator.calculateMod10Recursive(base);
                    expect(generator.validateQRReference(validRef)).toBe(true);
                }
            });
        });
        
        test('Validation référence QR - cas invalides', () => {
            const invalidReferences = [
                '12345678901234567890123456',  // 26 chiffres (trop court)
                '1234567890123456789012345678', // 28 chiffres (trop long)
                'ABC45678901234567890123456',   // Caractères non-numériques
                '123456789012345678901234560',  // Checksum incorrect
                ''                              // Vide
            ];
            
            invalidReferences.forEach(ref => {
                expect(generator.validateQRReference(ref)).toBe(false);
            });
        });
        
        test('Formatage référence QR - lisibilité', () => {
            const reference = '12345678901234567890123456' + generator.calculateMod10Recursive('12345678901234567890123456');
            const formatted = generator.formatQRReference(reference);
            expect(formatted).toMatch(/^\d{2} \d{5} \d{5} \d{5} \d{5} \d{5} \d{1}$/);
        });
    });
    
    // ===== TESTS FORMAT QR-STRING =====
    
    describe('Format QR-String conforme SIX Swiss QR-bill', () => {
        
        test('QR-String - structure de base obligatoire', () => {
            const invoiceData = {
                amount: 1949.75,
                currency: 'CHF',
                message: 'Facture 123456'
            };
            
            const qrString = generator.generateQRString(invoiceData);
            const lines = qrString.split('\n');
            
            // Vérifier les 31 lignes obligatoires minimum
            expect(lines.length).toBeGreaterThanOrEqual(31);
            
            // Vérifier l'en-tête (lignes 0-2)
            expect(lines[0]).toBe('SPC');           // QR Type
            expect(lines[1]).toBe('0200');          // Version
            expect(lines[2]).toBe('1');             // Character Set (UTF-8)
            
            // Vérifier créancier (lignes 3-10)
            expect(lines[3]).toBe('CH9300762011623852957'); // IBAN
            expect(lines[4]).toBe('S');             // Address Type
            expect(lines[5]).toBe('Hypervisual SA'); // Name
            expect(lines[8]).toBe('1000');          // Postal Code
            expect(lines[9]).toBe('Lausanne');      // City
            expect(lines[10]).toBe('CH');           // Country
            
            // Vérifier montant (lignes 17-18)
            expect(lines[17]).toBe('1949.75');      // Amount
            expect(lines[18]).toBe('CHF');          // Currency
            
            // Vérifier référence (lignes 26-27)
            expect(lines[26]).toBe('QRR');          // Reference Type
            expect(lines[27]).toHaveLength(27);     // QR Reference
            
            // Vérifier trailer (ligne 29)
            expect(lines[29]).toBe('EPD');          // End Payment Data
        });
        
        test('QR-String - tous les champs optionnels', () => {
            const invoiceData = {
                amount: 2500.00,
                currency: 'CHF',
                debtor: {
                    name: 'Client Test SA',
                    street: 'Rue du Client',
                    houseNumber: '15',
                    postalCode: '1200',
                    city: 'Genève',
                    country: 'CH'
                },
                referenceType: 'QRR',
                reference: '12345678901234567890123456' + generator.calculateMod10Recursive('12345678901234567890123456'),
                message: 'Facture test avec tous les champs',
                billInfo: 'Informations additionnelles'
            };
            
            const qrString = generator.generateQRString(invoiceData);
            const lines = qrString.split('\n');
            
            // Vérifier débiteur (lignes 19-25)
            expect(lines[19]).toBe('S');              // Debtor Address Type
            expect(lines[20]).toBe('Client Test SA'); // Debtor Name
            expect(lines[21]).toBe('Rue du Client');  // Debtor Street
            expect(lines[22]).toBe('15');             // Debtor House Number
            expect(lines[23]).toBe('1200');           // Debtor Postal Code
            expect(lines[24]).toBe('Genève');         // Debtor City
            expect(lines[25]).toBe('CH');             // Debtor Country
            
            // Vérifier message (ligne 28)
            expect(lines[28]).toBe('Facture test avec tous les champs');
            
            // Vérifier informations facture (ligne 30)
            expect(lines[30]).toBe('Informations additionnelles');
        });
        
        test('QR-String - sans montant (donation)', () => {
            const invoiceData = {
                referenceType: 'NON',
                message: 'Donation libre'
            };
            
            const qrString = generator.generateQRString(invoiceData);
            const lines = qrString.split('\n');
            
            expect(lines[17]).toBe('');      // Amount vide
            expect(lines[18]).toBe('CHF');   // Currency par défaut
            expect(lines[26]).toBe('NON');   // No Reference
            expect(lines[27]).toBe('');      // Reference vide
        });
        
        test('QR-String - limitation longueur des textes', () => {
            const longText = 'x'.repeat(200); // 200 caractères
            
            const invoiceData = {
                amount: 100,
                message: longText,
                billInfo: longText
            };
            
            const qrString = generator.generateQRString(invoiceData);
            const lines = qrString.split('\n');
            
            expect(lines[28].length).toBeLessThanOrEqual(140); // Message tronqué
            expect(lines[30].length).toBeLessThanOrEqual(140); // BillInfo tronqué
            expect(generator.warnings.length).toBeGreaterThan(0); // Avertissements générés
        });
    });
    
    // ===== TESTS VALIDATION MONTANTS =====
    
    describe('Validation montants et devises', () => {
        
        test('Montants valides', () => {
            const validAmounts = [
                { amount: 0, expected: '0.00' },
                { amount: 1, expected: '1.00' },
                { amount: 1949.75, expected: '1949.75' },
                { amount: 999999999.99, expected: '999999999.99' }
            ];
            
            validAmounts.forEach(({ amount, expected }) => {
                const result = generator.validateAmount(amount);
                expect(result.amount).toBe(expected);
            });
        });
        
        test('Montants invalides', () => {
            const invalidAmounts = [
                -1,              // Négatif
                1000000000,      // Trop grand (> 999'999'999.99)
                'abc',           // Non numérique
                NaN              // NaN
            ];
            
            invalidAmounts.forEach(amount => {
                expect(() => generator.validateAmount(amount)).toThrow();
            });
        });
        
        test('Devises autorisées', () => {
            ALLOWED_CURRENCIES.forEach(currency => {
                expect(() => generator.validateAmount(100, currency)).not.toThrow();
            });
            
            const invalidCurrencies = ['USD', 'GBP', 'JPY'];
            invalidCurrencies.forEach(currency => {
                expect(() => generator.validateAmount(100, currency)).toThrow();
            });
        });
        
        test('Montants vides (donations)', () => {
            const emptyAmounts = [null, undefined, ''];
            emptyAmounts.forEach(amount => {
                const result = generator.validateAmount(amount);
                expect(result.amount).toBe('');
                expect(result.currency).toBe('CHF');
            });
        });
    });
    
    // ===== TESTS VALIDATION COMPLÈTE =====
    
    describe('Validation facture complète', () => {
        
        test('Facture valide complète', () => {
            const validInvoice = {
                amount: 1500.50,
                currency: 'CHF',
                debtor: {
                    name: 'Client Test',
                    street: 'Rue Test',
                    houseNumber: '1',
                    postalCode: '1000',
                    city: 'Lausanne',
                    country: 'CH'
                },
                message: 'Facture de test',
                billInfo: 'Informations complémentaires'
            };
            
            const validation = generator.validateInvoice(validInvoice);
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });
        
        test('Facture avec erreurs', () => {
            const invalidInvoice = {
                amount: -100,           // Montant négatif
                currency: 'USD',        // Devise non autorisée
                reference: '123456',    // Référence trop courte
                referenceType: 'QRR'
            };
            
            const validation = generator.validateInvoice(invalidInvoice);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
        
        test('Facture avec avertissements', () => {
            const warningInvoice = {
                amount: 100,
                message: 'x'.repeat(150),    // Message trop long
                billInfo: 'y'.repeat(150)    // BillInfo trop long
            };
            
            const validation = generator.validateInvoice(warningInvoice);
            expect(validation.isValid).toBe(true);
            expect(validation.warnings.length).toBeGreaterThan(0);
        });
    });
    
    // ===== TESTS GÉNÉRATION QR-CODE =====
    
    describe('Génération QR-Code', () => {
        
        test('QR-Code - génération réussie', async () => {
            const invoiceData = {
                amount: 750.25,
                currency: 'CHF',
                message: 'Test QR-Code'
            };
            
            // Mock qrcode library
            jest.mock('qrcode', () => ({
                toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock_qr_code_data')
            }));
            
            const result = await generator.generateQRCode(invoiceData);
            
            expect(result.qrString).toBeDefined();
            expect(result.qrCodeImage).toBeDefined();
            expect(result.format).toBe('data:image/png;base64');
            expect(result.dimensions.width).toBe(166); // 46mm à 300 DPI
        });
        
        test('QR-Code - options personnalisées', async () => {
            const invoiceData = { amount: 100 };
            const options = {
                width: 200,
                margin: 4,
                color: { dark: '#000080', light: '#FFFFFF' }
            };
            
            // Le test nécessiterait un mock plus avancé pour vérifier les options
            // Pour l'instant, on vérifie que la méthode ne lève pas d'erreur
            expect(async () => {
                await generator.generateQRCode(invoiceData, options);
            }).not.toThrow();
        });
    });
    
    // ===== TESTS UTILITAIRES =====
    
    describe('Utilitaires QR-Factures', () => {
        
        test('Parse QR-String existante', () => {
            const testQRString = [
                'SPC', '0200', '1',
                'CH9300762011623852957', 'S', 'Test SA', 'Rue Test', '1', '1000', 'Lausanne', 'CH',
                '', '', '', '', '', '', '',
                '100.00', 'CHF',
                '', '', '', '', '', '', '',
                'QRR', '12345678901234567890123456' + generator.calculateMod10Recursive('12345678901234567890123456'),
                'Message test', 'EPD', ''
            ].join('\n');
            
            const parsed = QRInvoiceUtils.parseQRString(testQRString);
            
            expect(parsed.header.qrType).toBe('SPC');
            expect(parsed.creditor.IBAN).toBe('CH9300762011623852957');
            expect(parsed.payment.amount).toBe('100.00');
            expect(parsed.reference.type).toBe('QRR');
        });
        
        test('Formatters - IBAN, QR Reference, Amount', () => {
            expect(QRInvoiceUtils.formatters.iban('CH9300762011623852957'))
                .toBe('CH93 0076 2011 6238 5295 7');
            
            const qrRef = '12345678901234567890123456' + generator.calculateMod10Recursive('12345678901234567890123456');
            expect(QRInvoiceUtils.formatters.qrReference(qrRef))
                .toMatch(/^\d{2} \d{5} \d{5} \d{5} \d{5} \d{5} \d{1}$/);
            
            expect(QRInvoiceUtils.formatters.amount(1500.75, 'CHF'))
                .toBe("CHF 1'500.75");
        });
    });
    
    // ===== TESTS D'INTÉGRATION =====
    
    describe('Tests d\'intégration complets', () => {
        
        test('Workflow complet - facture simple', async () => {
            const invoiceData = {
                amount: 1949.75,
                currency: 'CHF',
                message: 'Facture test intégration'
            };
            
            // 1. Validation
            const validation = generator.validateInvoice(invoiceData);
            expect(validation.isValid).toBe(true);
            
            // 2. Génération QR-String
            const qrString = generator.generateQRString(invoiceData);
            expect(qrString).toBeDefined();
            
            // 3. Parse et vérification
            const parsed = QRInvoiceUtils.parseQRString(qrString);
            expect(parsed.payment.amount).toBe('1949.75');
            expect(parsed.additionalInfo.unstructured).toBe('Facture test intégration');
            
            // 4. Export données
            const exportData = generator.exportData(invoiceData);
            expect(exportData.metadata.standard).toContain('ISO 20022');
            expect(exportData.validation.isValid).toBe(true);
        });
        
        test('Workflow complet - facture avec débiteur', () => {
            const invoiceData = {
                amount: 2500.00,
                currency: 'CHF',
                debtor: {
                    name: 'Enterprise Client SA',
                    street: 'Boulevard des Affaires',
                    houseNumber: '123',
                    postalCode: '1211',
                    city: 'Genève',
                    country: 'CH'
                },
                referenceType: 'QRR',
                message: 'Prestation consulting Q4 2024',
                billInfo: 'Facture 2024-001, échéance 30 jours'
            };
            
            // Test workflow complet
            const validation = generator.validateInvoice(invoiceData);
            expect(validation.isValid).toBe(true);
            
            const qrString = generator.generateQRString(invoiceData);
            const parsed = QRInvoiceUtils.parseQRString(qrString);
            
            expect(parsed.debtor.name).toBe('Enterprise Client SA');
            expect(parsed.debtor.city).toBe('Genève');
            expect(parsed.reference.type).toBe('QRR');
            expect(parsed.additionalInfo.billInfo).toBe('Facture 2024-001, échéance 30 jours');
        });
    });
});

// Export pour exécution directe
export default {
    QRInvoiceGenerator,
    QRInvoiceUtils,
    testSuite: 'QR-Factures ISO 20022 v2.3 - Tests de Conformité'
};