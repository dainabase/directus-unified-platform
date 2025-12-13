# TVA Suisse 2025 - Guide Complet

## Taux en Vigueur (depuis 01.01.2024)

| Type | Taux | Code | Champ décompte |
|------|------|------|----------------|
| Normal | 8.1% | N | 302/303 |
| Réduit | 2.6% | R | 312/313 |
| Hébergement | 3.8% | H | 342/343 |

## Nouveautés 2025

### 1. Décompte TVA en Ligne Obligatoire
- Via ePortal AFC (Administration Fédérale des Contributions)
- Plus de formulaires papier acceptés
- Échéances strictes

### 2. Nouvelles Fréquences de Décompte
- **Mensuelle** : grandes entreprises
- **Trimestrielle** : standard (défaut)
- **Semestrielle** : sur demande
- **Annuelle** : si CA < 5'005'000 CHF

### 3. Plateformes de Vente en Ligne
- Assujettissement obligatoire des plateformes
- Responsabilité TVA transférée

## Calcul TVA

### Méthode Effective
```
TVA Due = TVA Collectée - TVA Récupérable
```

### Méthode Forfaitaire (TDFN)
- Taux forfaitaires par branche
- Pas de récupération de l'impôt préalable

## Comptes Comptables

| Compte | Libellé |
|--------|--------|
| 1170 | TVA à récupérer (impôt préalable) |
| 2200 | TVA due |
| 2201 | TVA 8.1% due |
| 2202 | TVA 2.6% due |
| 2203 | TVA 3.8% due |

## Configuration JavaScript

```javascript
const VAT_RATES_2025 = {
  normal: {
    rate: 0.081,
    code: "N",
    form_field_base: "302",
    form_field_tax: "303",
    description: "Taux normal - majorité des biens/services"
  },
  reduced: {
    rate: 0.026,
    code: "R",
    form_field_base: "312",
    form_field_tax: "313",
    description: "Taux réduit - alimentation, livres, médicaments"
  },
  accommodation: {
    rate: 0.038,
    code: "H",
    form_field_base: "342",
    form_field_tax: "343",
    description: "Taux hébergement - nuitées avec petit-déjeuner"
  }
};
```

## Échéances 2025

| Période | Échéance |
|---------|----------|
| T1 (jan-mar) | 31 mai |
| T2 (avr-jun) | 31 août |
| T3 (jul-sep) | 30 novembre |
| T4 (oct-déc) | 28 février N+1 |

## Ressources Officielles

- [AFC - Administration Fédérale des Contributions](https://www.estv.admin.ch)
- [ePortal TVA](https://www.eportal.admin.ch)
- [Mémento TVA](https://www.estv.admin.ch/estv/fr/home/mehrwertsteuer.html)