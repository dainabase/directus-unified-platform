---
name: swiss-compliance-engine
description: Spécialiste conformité business suisse — QR-Invoice v2.3 (SIX Group), TVA 2025 (8.1%/2.6%/3.8%), Plan comptable PME Käfer, signatures électroniques ZertES, ISO 20022, multi-devises CHF/EUR/USD. Ce skill doit être utilisé quand l'utilisateur travaille sur des factures, la TVA, la comptabilité, la conformité, ou les QR-bills pour le marché suisse.
---

# Swiss Business Compliance Engine

## QR-Invoice (QR-Facture)
- **Norme**: SIX Group Implementation Guidelines v2.3
- **Library**: `swissqrbill` npm v4.2.0 (seule library JS maintenue)
- **Format**: Adresses structurées OBLIGATOIRES depuis Nov 2025
- **QR-IBAN vs IBAN**: QR-IBAN commence par 30/31 (positions 5-6), IBAN standard sinon
- **Types de référence**: QR Reference (26 chiffres + check digit), Creditor Reference (ISO 11649)
- **Layout**: A6 payment slip (148×105mm)
- **Monnaies acceptées**: CHF et EUR uniquement

```javascript
import { SwissQRBill } from 'swissqrbill';

const bill = new SwissQRBill({
  currency: 'CHF',
  amount: 1500.00,
  creditor: {
    name: 'HYPERVISUAL Switzerland Sàrl',
    address: 'Rue Example 1',
    zip: '1000',
    city: 'Lausanne',
    country: 'CH',
    account: 'CH44 3199 9123 0008 8901 2'
  },
  debtor: {
    name: 'Client Sàrl',
    address: 'Avenue Test 2',
    zip: '1200',
    city: 'Genève',
    country: 'CH'
  },
  reference: '210000000003139471430009017',
  message: 'Facture 2024-001'
});
```

## TVA Suisse 2025
- **Taux normal**: 8.1% (majorité des biens et services)
- **Taux réduit**: 2.6% (alimentation, livres, médicaments)
- **Taux hébergement**: 3.8% (hôtellerie)
- **Seuil d'assujettissement**: CHF 100'000 de CA annuel
- **Méthodes**: Effective ou forfaitaire
- **Déclaration**: Trimestrielle auprès de l'AFC/FTA
- **⚠️ JAMAIS hardcoder les taux** → toujours référencer un fichier de config

```javascript
// config/vat-rates.js — SOURCE UNIQUE DE VÉRITÉ
export const VAT_RATES_2025 = {
  NORMAL: 0.081,
  REDUCED: 0.026,
  ACCOMMODATION: 0.038,
  EXEMPT: 0,
};
```

## Plan Comptable PME Käfer (9 classes décimales)
| Classe | Désignation | Exemples |
|--------|-------------|----------|
| 1 | Actifs | 1000 Caisse, 1020 Banque, 1100 Débiteurs |
| 2 | Passifs & Capitaux propres | 2000 Créanciers, 2200 TVA due, 2800 Capital |
| 3 | Produits d'exploitation | 3000 Ventes, 3200 Prestations services |
| 4 | Charges matières | 4000 Achats, 4400 Sous-traitance |
| 5 | Charges personnel | 5000 Salaires, 5700 Charges sociales |
| 6 | Autres charges exploit. | 6000 Loyer, 6500 Assurances, 6600 Amortissements |
| 7 | Produits hors exploit. | 7000 Produits financiers |
| 8 | Charges hors exploit. | 8000 Charges financières, 8500 Charges except. |
| 9 | Clôture | 9000 Bilan d'ouverture, 9100 Compte résultat |

## Signatures Électroniques (ZertES)
- **SES** (Simple): Email, SMS — pas de valeur juridique forte
- **AES** (Avancée): Identité vérifiée — valeur juridique moyenne
- **QES** (Qualifiée): Équivalent signature manuscrite — Swisscom Trust Services ou SwissSign AG
- Double conformité ZertES (Suisse) + eIDAS (UE) pour le transfrontalier

## Multi-Devises
- **Library**: `Dinero.js` v2 pour l'arithmétique monétaire
- **Devise primaire**: CHF (centimes = integer cents)
- **Taux de change**: SNB Data Portal ou ECB API pour EUR/CHF
- **⚠️ JAMAIS de float pour les montants** → toujours integer centimes + Dinero.js

```javascript
import { dinero, add, multiply } from 'dinero.js';
import { CHF, EUR } from '@dinero.js/currencies';

const price = dinero({ amount: 150000, currency: CHF }); // CHF 1'500.00
const vat = multiply(price, { amount: 81, scale: 3 });
const total = add(price, vat);
```

## Zefix API (Registre du commerce)
- URL: `https://www.zefix.admin.ch/ZefixPublicREST/`
- Format UID: CHE-xxx.xxx.xxx

## Recouvrement (SchKG/LP)
1. Mahnung 1 (rappel amiable) — 10 jours
2. Mahnung 2 (mise en demeure) — 10 jours
3. Mahnung 3 (dernier avertissement) — 10 jours
4. Betreibungsbegehren — Office des poursuites
5. Commandement de payer — 20 jours pour opposition
6. Si opposition → 10 jours mainlevée
7. Intérêt moratoire: 5% (Art. 104 CO)
