# QR-Factures v2.3 - Spécifications Suisses

## Changements Majeurs v2.3 (22.11.2025)

### 1. Adresses Structurées OBLIGATOIRES
- Plus d'adresses combinées acceptées
- Champs séparés obligatoires :
  - Nom/Raison sociale
  - Rue
  - Numéro
  - Code postal
  - Localité
  - Pays (code ISO)

### 2. Jeu de Caractères Étendu
- Support complet UTF-8
- Trémas : ä, ö, ü, Ä, Ö, Ü
- Caractères spéciaux : é, è, ê, à, ç

## Structure du Code QR

```
SPC                          // Header
0200                         // Version
1                            // Coding type
CH44 3199 9123 0008 8901 2   // IBAN
S                            // Address type (S=Structured)
HYPERVISUAL Sàrl             // Name
Rue du Commerce              // Street
12                           // Building number
1204                         // Postal code
Genève                       // City
CH                           // Country





1234.56                      // Amount
CHF                          // Currency
S                            // Debtor address type
Client SA                    // Debtor name
Avenue des Alpes             // Debtor street
45                           // Debtor building
1000                         // Debtor postal code
Lausanne                     // Debtor city
CH                           // Debtor country
QRR                          // Reference type
210000000003139471430009017  // Reference
Facture 2025-001             // Message
EPD                          // Trailer
```

## Validation Obligatoire

### Règles de Validation
1. **IBAN** : Format CH suisse valide
2. **Référence QRR** : 27 chiffres avec check digit
3. **Montant** : Max 999'999'999.99
4. **Devise** : CHF ou EUR uniquement

### Codes d'Erreur
| Code | Description |
|------|-------------|
| QR001 | IBAN invalide |
| QR002 | Référence invalide |
| QR003 | Adresse non structurée |
| QR004 | Caractère non supporté |
| QR005 | Montant hors limites |

## Dimensions

- **Code QR** : 46 x 46 mm
- **Section paiement** : 105 x 210 mm (A6 portrait)
- **Zone blanche** : minimum 5 mm autour du QR

## Implémentation React

Voir `assets/templates/QRBill.jsx` pour le composant complet.