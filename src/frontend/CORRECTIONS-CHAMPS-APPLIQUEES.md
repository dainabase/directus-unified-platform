# ✅ CORRECTIONS DES CHAMPS DIRECTUS - COMPLÉTÉ

## 📋 Modifications effectuées :

### 1. **finances.js** ✅
- Remplacé `amount_ttc` par `amount` partout
- Ajouté filtrage par `owner_company` dans toutes les méthodes :
  - `getInvoices(filters)`
  - `getExpenses(filters)` 
  - `getTransactions(filters)`
  - `getCashFlow(filters)`
  - `getRevenue(filters)`
  - `getRunway(filters)`
  - `getMonthlyBurn(filters)`

### 2. **projects.js** ✅
- Utilise `owner_company` au lieu de `company` dans `getAll()`
- Filtrage correct : `{ owner_company: { _eq: filters.owner_company } }`

### 3. **companies.js** ✅
- Corrigé `getMetrics()` pour utiliser :
  - `owner_company` au lieu de `company` 
  - `amount` au lieu de `amount_ttc`

### 4. **useFinances.js** ✅
- Mis à jour tous les hooks pour accepter des filtres :
  - `useCashFlow(filters)`
  - `useRevenue(filters)`
  - `useRunway(filters)`

### 5. **DashboardV4.jsx** ✅
- Passe maintenant `owner_company` aux hooks financiers :
  ```javascript
  const { data: cashFlow } = useCashFlow(selectedCompany !== 'all' ? { owner_company: selectedCompany } : {})
  const { data: revenue } = useRevenue(selectedCompany !== 'all' ? { owner_company: selectedCompany } : {})
  const { data: runway } = useRunway(selectedCompany !== 'all' ? { owner_company: selectedCompany } : {})
  ```

### 6. **test-fields.html** ✅
- Créé pour vérifier les vrais noms de champs dans Directus
- Teste les filtres avec `owner_company`
- Vérifie la présence des champs `amount`, `amount_ttc`, `owner_company`

## 🎯 Résultat :

Toutes les références aux champs incorrects ont été corrigées :
- ❌ `company` → ✅ `owner_company` 
- ❌ `amount_ttc` → ✅ `amount`

Le dashboard devrait maintenant :
1. Afficher les vraies données Directus
2. Filtrer correctement par entreprise propriétaire
3. Calculer les métriques avec les bons champs