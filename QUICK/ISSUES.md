# 🐛 ISSUES - PROBLÈMES IDENTIFIÉS

## 🔴 Issues Critiques

### ISSUE-001: Erreur 403 sur migration subscriptions
**Statut** : 🔴 OUVERT  
**Priorité** : HAUTE  
**Date** : 03/08/2025  

**Description** :
La migration de la collection `subscriptions` échoue avec une erreur 403 (Forbidden) lors de l'insertion des données.

**Détails techniques** :
```javascript
Error: Request failed with status code 403
at loadToDirectus (migrate-subscriptions.js:268)
```

**Impact** :
- Collection créée mais vide
- Blocage de la finalisation Phase 1
- 1 collection sur 12 incomplète

**Solutions tentées** :
- ✅ Collection créée avec succès
- ❌ Insertion des données refusée

**Actions requises** :
1. Vérifier les permissions du token Directus
2. Tester avec un token admin direct
3. Vérifier les permissions de la collection
4. Créer un nouveau token si nécessaire

**Workaround** : Aucun pour le moment

---

### ISSUE-002: Collection companies manquante
**Statut** : 🟡 OUVERT  
**Priorité** : MOYENNE  
**Date** : 03/08/2025  

**Description** :
La collection `companies` n'existe pas, empêchant la création des relations pour `interactions`.

**Impact** :
- Relations client_id non fonctionnelles
- Données interactions incomplètes
- Blocage futur pour d'autres collections

**Actions requises** :
1. Créer le schéma companies
2. Créer la collection dans Directus
3. Mettre à jour les relations
4. Re-migrer les interactions avec relations

**Workaround** : Relations préparées mais non activées

## 🟡 Issues Non-Critiques

### ISSUE-003: Relations auto-référentes complexes
**Statut** : ✅ RÉSOLU  
**Priorité** : MOYENNE  
**Date** : 03/08/2025  

**Description** :
La collection `talents` provoquait une erreur "Maximum call stack size exceeded" à cause de la relation auto-référente `manager_id`.

**Solution appliquée** :
Migration en 4 étapes :
1. Créer collection sans manager_id
2. Importer les données
3. Ajouter le champ manager_id
4. Établir les relations

**Fichier correctif** : `migrate-talents-fixed.js`

---

### ISSUE-004: Types datetime non supportés
**Statut** : ✅ RÉSOLU  
**Priorité** : BASSE  
**Date** : 03/08/2025  

**Description** :
Directus n'accepte pas le type `datetime`, uniquement `timestamp`.

**Solution appliquée** :
Conversion automatique dans tous les schémas :
```javascript
// Avant
"type": "datetime"
// Après  
"type": "timestamp"
```

**Fichiers corrigés** :
- Tous les schémas JSON
- Tous les scripts de migration

## 📊 Statistiques des Issues

| Catégorie | Total | Ouverts | Résolus |
|-----------|-------|---------|---------|
| Critiques | 1 | 1 | 0 |
| Moyennes | 2 | 1 | 1 |
| Basses | 1 | 0 | 1 |
| **TOTAL** | **4** | **2** | **2** |

## 🔍 Issues Potentiels à Surveiller

### Performances
- **Risque** : Lenteur sur grandes bases (>10k items)
- **Mitigation** : Batch processing à 50 items
- **Monitoring** : Temps moyen 2s/migration

### Mémoire
- **Risque** : Stack overflow sur relations complexes
- **Mitigation** : Migration par étapes
- **Monitoring** : Logs d'erreur

### Permissions
- **Risque** : Tokens insuffisants
- **Mitigation** : Utiliser token admin
- **Monitoring** : Erreurs 403/401

## 📝 Template pour Nouvelles Issues

```markdown
### ISSUE-XXX: [Titre]
**Statut** : 🔴 OUVERT  
**Priorité** : [HAUTE/MOYENNE/BASSE]  
**Date** : [Date]  

**Description** :
[Description claire du problème]

**Reproduction** :
1. [Étape 1]
2. [Étape 2]
3. [Résultat observé]

**Impact** :
- [Impact 1]
- [Impact 2]

**Solution proposée** :
[Description de la solution]

**Workaround** :
[Solution temporaire si disponible]
```

## 🚀 Plan de Résolution

### Priorité 1 (Lundi matin)
1. Résoudre ISSUE-001 (permissions subscriptions)
2. Documenter la solution

### Priorité 2 (Lundi après-midi)
1. Créer collection companies (ISSUE-002)
2. Mettre à jour les relations

### Priorité 3 (Si temps disponible)
1. Améliorer la gestion d'erreurs
2. Ajouter des logs détaillés
3. Créer des tests automatisés

## 📊 Métriques de Qualité

- **Temps moyen de résolution** : 2 heures
- **Taux de résolution** : 50% (2/4)
- **Issues critiques ouverts** : 1
- **Dernière mise à jour** : 03/08/2025

---

*Document créé le 3 août 2025 à 14:00 UTC*  
*Prochaine revue : Lundi 5 août 2025*  
*Contact : Équipe Migration Directus*