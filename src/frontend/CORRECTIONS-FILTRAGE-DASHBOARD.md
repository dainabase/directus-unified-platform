# ✅ CORRECTIONS DU FILTRAGE DASHBOARD V4

## 🔍 Problème résolu

Le Dashboard affichait toutes les données au lieu de filtrer par entreprise à cause d'une incompatibilité entre :
- Ce que le Dashboard envoyait : `{ owner_company: { _eq: selectedCompany } }`
- Ce que l'API attendait : `{ owner_company: selectedCompany }`

## 📋 Modifications appliquées

### 1. **field-mappings.js** (nouveau)
Créé un mapping centralisé pour :
- Normaliser les noms d'entreprises (ex: "ENKI REALTY" → "ENKI_REALTY")
- Centraliser le nom du champ `owner_company`

### 2. **projects.js**
Ajouté la gestion des deux formats de filtre :
```javascript
if (filters.owner_company._eq) {
  params.filter = { owner_company: { _eq: filters.owner_company._eq } }
} else if (typeof filters.owner_company === 'string') {
  params.filter = { owner_company: { _eq: filters.owner_company } }
}
```

### 3. **finances.js**
Même pattern appliqué pour getInvoices, getExpenses et getTransactions

### 4. **DashboardV4.jsx**
- Import du mapping centralisé
- Normalisation de selectedCompany pour tous les hooks
- Ajout de debug pour tracer le filtrage

## 🎯 Résultat attendu

1. Sélecteur "Toutes" → Affiche les 279 projets
2. Sélecteur "HYPERVISUAL" → Affiche uniquement ses projets
3. Sélecteur "ENKI REALTY" → Utilise automatiquement "ENKI_REALTY"
4. Les métriques financières sont filtrées par entreprise

## 🧪 Debug activé

La console affichera :
```
🎯 FILTRE ACTIF:
   selectedCompany: HYPERVISUAL
   normalized: HYPERVISUAL
   projects count: 48
   Entreprises dans les données: ['HYPERVISUAL']
```

## ⚠️ Points d'attention

- ENKI REALTY est stocké comme ENKI_REALTY dans la base
- Le filtrage se fait côté serveur Directus
- Pas de données démo, uniquement les vraies données