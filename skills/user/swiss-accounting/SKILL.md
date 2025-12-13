# 🇨🇭 Skill Comptabilité Suisse PME

## Description
Skill complet pour la gestion comptable des PME suisses, conforme au Code des Obligations (CO) et aux normes fiscales 2025.

## Domaines Couverts

### 1. Plan Comptable PME Suisse (Käfer)
- 300+ comptes structurés par classes (1-9)
- Conformité CO art. 957-963
- Support multi-devises (CHF, EUR, USD)

### 2. TVA Suisse 2025
- **Taux normal** : 8.1% (biens et services standard)
- **Taux réduit** : 2.6% (alimentation, livres, médicaments)
- **Taux hébergement** : 3.8% (nuitées avec petit-déjeuner)
- Décompte en ligne obligatoire (ePortal AFC)
- Nouvelles fréquences disponibles

### 3. QR-Factures v2.3
- Adresses structurées OBLIGATOIRES depuis 22.11.2025
- Jeu de caractères étendu (trémas, accents)
- Conformité Swiss QR Code
- Composant React inclus

### 4. Rapports Légaux (CO)
- Bilan (actifs/passifs)
- Compte de résultat
- Annexe aux comptes annuels
- Tableau de flux de trésorerie

### 5. Multi-Devises
- Taux de change journaliers
- Écarts de conversion
- Comptes en devises étrangères

## Utilisation

```javascript
// Importer les taux TVA 2025
import { VAT_RATES_2025 } from './scripts/vat-calculator.js';

// Calculer la TVA
const amount = 1000;
const vat = amount * VAT_RATES_2025.normal.rate; // 81 CHF
```

## Fichiers Inclus

- `references/plan-comptable-pme.md` - Plan comptable complet
- `references/tva-suisse-2025.md` - Documentation TVA
- `references/qr-facture-v23.md` - Spécifications QR-Facture
- `references/rapports-legaux-co.md` - Exigences légales
- `scripts/vat-calculator.js` - Calculateur TVA
- `scripts/validate-qr-bill.js` - Validateur QR-Facture
- `assets/templates/QRBill.jsx` - Composant React

## Conformité

- ✅ Code des Obligations (CO) art. 957-963
- ✅ Loi TVA (LTVA) 2025
- ✅ ISO 20022 (paiements)
- ✅ Swiss QR-Bill Standard v2.3

## Dernière mise à jour
13 décembre 2025