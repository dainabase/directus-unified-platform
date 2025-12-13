# Plan Comptable PME Suisse (Käfer)

## Structure par Classes

### Classe 1 - ACTIFS
```
10   Actif circulant
1000 Caisse
1010 Caisse en devises étrangères
1020 Banque (compte postal)
1021 Compte bancaire CHF
1022 Compte bancaire EUR
1023 Compte bancaire USD
1100 Débiteurs (clients)
1109 Provision pour débiteurs douteux
1170 TVA à récupérer (impôt préalable)
1200 Stock marchandises
1210 Stock matières premières
1300 Charges payées d'avance

14   Actif immobilisé
1500 Matériel informatique
1509 Amortissements cumulés matériel informatique
1510 Mobilier
1519 Amortissements cumulés mobilier
1520 Véhicules
1529 Amortissements cumulés véhicules
1600 Immobilisations incorporelles
```

### Classe 2 - PASSIFS
```
20   Capitaux étrangers à court terme
2000 Créanciers (fournisseurs)
2100 Dettes bancaires à court terme
2200 TVA due
2201 TVA 8.1% due
2202 TVA 2.6% due
2203 TVA 3.8% due
2270 Impôts à payer
2300 Charges sociales à payer

24   Capitaux étrangers à long terme
2400 Emprunts bancaires
2450 Emprunts hypothécaires

28   Capitaux propres
2800 Capital social
2900 Réserves légales
2950 Réserves facultatives
2970 Report à nouveau
2990 Bénéfice/Perte de l'exercice
```

### Classe 3 - PRODUITS D'EXPLOITATION
```
32   Ventes de marchandises et prestations
3200 Ventes marchandises Suisse
3201 Ventes marchandises Export
3400 Prestations de services Suisse
3401 Prestations de services Export
3800 Rabais accordés
3900 Variation de stock
```

### Classe 4 - CHARGES MARCHANDISES
```
40   Charges matières et marchandises
4000 Achats marchandises
4200 Achats matières premières
4400 Frais accessoires d'achat
4900 Variation de stock
```

### Classe 5 - CHARGES DE PERSONNEL
```
50   Salaires et charges sociales
5000 Salaires
5200 Allocations familiales
5700 Charges sociales AVS/AI/APG
5710 Charges sociales LPP
5720 Charges sociales AC
5730 Assurance accidents
5800 Autres frais de personnel
```

### Classe 6 - AUTRES CHARGES D'EXPLOITATION
```
60   Loyers
6000 Loyer locaux
6100 Entretien et réparations
6200 Assurances
6300 Énergie
6400 Frais de transport
6500 Frais administratifs
6510 Téléphone, internet
6520 Fournitures de bureau
6600 Publicité et marketing
6700 Autres charges d'exploitation
6800 Amortissements immobilisations
6900 Charges financières
6950 Produits financiers
```

### Classe 7 - RÉSULTATS ANNEXES (optionnel)
```
7000 Produits immobiliers
7500 Charges immobilières
```

### Classe 8 - COMPTES DE RÉSULTAT
```
80   Résultat
8000 Résultat de l'exercice
8100 Résultat extraordinaire
8500 Impôts sur le bénéfice
```

### Classe 9 - CLÔTURE (optionnel)
```
9000 Bilan d'ouverture
9100 Compte de résultat
```