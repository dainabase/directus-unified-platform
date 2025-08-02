# 📊 Status Module : CRM & Contacts

**Dernière MAJ** : 2025-08-02 16:31
**Status** : 🔴 Non démarré

## 🎯 Objectif
Migrer les 5 bases Notion de gestion des contacts vers 4 collections Directus optimisées avec relations.

## 📋 Plan de migration

### Bases Notion sources
1. **DB-CONTACTS-ENTREPRISES** (Priorité 1)
   - Records estimés : ~200
   - Champs principaux : nom, secteur, CA, effectifs, adresse
   
2. **DB-CONTACTS-PERSONNES**
   - Records estimés : ~150
   - Champs : nom, prénom, fonction, entreprise_id, email, téléphone

3. **DB-CONTACTS-REVENDEURS**
   - Records estimés : ~50
   - Spécificités : commission, zone géographique

4. **DB-CONTACTS-PRESTATAIRES**
   - Records estimés : ~75
   - Spécificités : compétences, tarifs, disponibilité

5. **DB-CONTACTS-LEADS**
   - Records estimés : ~25
   - Pipeline : prospect → qualifié → client

### Collections Directus cibles
1. **companies** : Entreprises unifiées
2. **people** : Contacts personnes avec relations
3. **resellers** : Extension de companies pour revendeurs
4. **providers** : Extension de companies pour prestataires

### Endpoints à adapter
- `/api/companies` : CRUD entreprises
- `/api/people` : CRUD personnes
- `/api/contacts/search` : Recherche unifiée

## ⏳ État actuel
- Migration : 0%
- Collections créées : 0/4
- Records migrés : 0/~500
- Endpoints adaptés : 0/3

## 🚀 Prochaines étapes
1. Analyser structure DB-CONTACTS-ENTREPRISES
2. Créer collection "companies" dans Directus
3. Migrer 10 records test
4. Valider mapping des champs
5. Migration complète batch par batch

## 📝 Notes
- Prévoir dédoublonnage entreprises
- Gérer relations many-to-many personnes/entreprises
- Conserver historique dans champs meta