# 📋 GUIDE : Ajout du champ owner_company aux collections manquantes

## 🚨 Problème actuel

Les collections suivantes n'ont PAS le champ `owner_company`, ce qui empêche le filtrage multi-entreprise de fonctionner correctement :

### Collections critiques (6)
- `companies`
- `people`
- `time_tracking`
- `support_tickets`
- `proposals`
- `quotes`

### Autres collections (35)
- `accounting_entries`
- `activities`
- `approvals`
- `audit_logs`
- `comments`
- `company_people`
- `compliance`
- `content_calendar`
- `credits`
- `customer_success`
- `debits`
- `deliveries`
- `departments`
- `evaluations`
- `events`
- `goals`
- `interactions`
- `notes`
- `notifications`
- `orders`
- `permissions`
- `projects_team`
- `providers`
- `reconciliations`
- `refunds`
- `returns`
- `roles`
- `settings`
- `skills`
- `tags`
- `talents`
- `talents_simple`
- `teams`
- `trainings`
- `workflows`

## 🛠️ Solution manuelle via l'interface Directus

### Étape 1 : Connexion à Directus Admin
1. Ouvrez http://localhost:8055/admin
2. Connectez-vous avec vos identifiants admin

### Étape 2 : Ajout du champ owner_company

Pour CHAQUE collection de la liste ci-dessus :

1. **Aller dans Settings > Data Model**
2. **Trouver la collection** dans la liste
3. **Cliquer sur la collection** pour l'ouvrir
4. **Cliquer sur "New Field"** (bouton + en haut)
5. **Configurer le champ** :
   
   **Onglet Interface :**
   - Type : `Dropdown`
   - Key : `owner_company`
   - Field Name : `Entreprise propriétaire`
   
   **Onglet Schema :**
   - Type : `String`
   - Length : `50`
   - Default Value : `HYPERVISUAL`
   - Allow NULL : ✅ Oui
   
   **Options du Dropdown :**
   ```
   HYPERVISUAL : HYPERVISUAL
   DAINAMICS : DAINAMICS
   LEXAIA : LEXAIA
   ENKI_REALTY : ENKI REALTY
   TAKEOUT : TAKEOUT
   ```
   
   **Display :**
   - Display as : `Labels`
   - Show as Dot : ✅ Oui
   - Colors :
     - HYPERVISUAL : Background `#2196F3`, Foreground `#FFFFFF`
     - DAINAMICS : Background `#4CAF50`, Foreground `#FFFFFF`
     - LEXAIA : Background `#FF9800`, Foreground `#FFFFFF`
     - ENKI_REALTY : Background `#9C27B0`, Foreground `#FFFFFF`
     - TAKEOUT : Background `#F44336`, Foreground `#FFFFFF`

6. **Cliquer sur "Save"**

### Étape 3 : Collections prioritaires

Commencez par ces 6 collections critiques :
1. `companies` 
2. `people`
3. `time_tracking`
4. `support_tickets`
5. `proposals`
6. `quotes`

## 🚀 Solution alternative : Token Admin

Si vous voulez automatiser le processus :

1. **Créer un token admin** :
   - Allez dans Settings > Users
   - Créez un nouvel utilisateur avec le rôle Administrator
   - OU éditez un utilisateur existant et donnez-lui le rôle Administrator
   - Ajoutez un Static Token à cet utilisateur
   - Sauvegardez

2. **Utiliser le token** :
   - Copiez le token
   - Ouvrez `fix-owner-company-working.js`
   - Remplacez la ligne `const TOKEN = '...'` avec votre nouveau token
   - Exécutez : `node fix-owner-company-working.js`

## ✅ Vérification

Après avoir ajouté les champs :

1. **Tester le filtrage** :
   ```bash
   node src/backend/tests/test-filtering.js
   ```

2. **Vérifier dans l'interface** :
   - http://localhost:3000/admin/testing
   - Sélectionnez différentes entreprises
   - Vérifiez que les données sont filtrées

3. **Dashboard CEO** :
   - http://localhost:3000/dashboards/ceo-v4
   - Les KPIs doivent changer selon l'entreprise sélectionnée

## 📊 Résultat attendu

Une fois tous les champs ajoutés :
- ✅ 62 collections avec le champ `owner_company`
- ✅ Filtrage multi-entreprise 100% fonctionnel
- ✅ Dashboard CEO avec données filtrées par entreprise
- ✅ Toutes les métriques correctement calculées

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de Directus
2. Consultez `test-complete-results.json` pour les détails
3. Relancez les tests de filtrage
4. Contactez l'équipe technique si nécessaire