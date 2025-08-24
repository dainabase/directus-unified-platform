# 🚀 SOLUTION SQL POUR AJOUTER OWNER_COMPANY

## 🎯 Approche directe via PostgreSQL

Puisque les scripts API échouent à cause des permissions, voici la solution SQL directe.

## 📋 Étapes à suivre

### 1. Copier le script SQL dans le container

```bash
# Copier le script SQL dans le container PostgreSQL
docker cp add-owner-company.sql directus-unified-platform-postgres-1:/tmp/
```

### 2. Se connecter à PostgreSQL

```bash
# Se connecter au container PostgreSQL
docker exec -it directus-unified-platform-postgres-1 psql -U directus
```

### 3. Exécuter le script SQL

Dans le prompt PostgreSQL :

```sql
-- Exécuter le script
\i /tmp/add-owner-company.sql
```

### 4. Vérifier les résultats

```sql
-- Vérifier que les colonnes ont été ajoutées
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE column_name = 'owner_company'
ORDER BY table_name;
```

### 5. Redémarrer Directus pour synchroniser

```bash
# Sortir de PostgreSQL
\q

# Redémarrer Directus
docker-compose restart directus
```

### 6. Vérifier dans l'interface Directus

1. Aller sur http://localhost:8055/admin
2. Settings > Data Model
3. Vérifier que le champ `owner_company` apparaît dans les collections

## 🔧 Script de vérification complet

```bash
# Créer et exécuter check-owner-company-sql.sh
chmod +x sync-directus-schema.js
node sync-directus-schema.js
./check-owner-company-sql.sh
```

## ⚠️ Si les champs n'apparaissent pas dans Directus

### Option 1 : Synchroniser manuellement

Dans l'interface Directus Admin :
- Settings > Project Settings
- Chercher "Schema" ou "Database"
- Cliquer sur "Sync Schema" ou similaire

### Option 2 : Ajouter les métadonnées Directus

```sql
-- Se reconnecter à PostgreSQL
docker exec -it directus-unified-platform-postgres-1 psql -U directus

-- Ajouter les métadonnées pour une collection (exemple: companies)
INSERT INTO directus_fields (collection, field, type, interface, display, options, display_options)
VALUES (
    'companies',
    'owner_company',
    'string',
    'select-dropdown',
    'labels',
    '{"choices":[{"text":"HYPERVISUAL","value":"HYPERVISUAL"},{"text":"DAINAMICS","value":"DAINAMICS"},{"text":"LEXAIA","value":"LEXAIA"},{"text":"ENKI REALTY","value":"ENKI_REALTY"},{"text":"TAKEOUT","value":"TAKEOUT"}]}',
    '{"showAsDot":true,"choices":[{"text":"HYPERVISUAL","value":"HYPERVISUAL","foreground":"#FFFFFF","background":"#2196F3"},{"text":"DAINAMICS","value":"DAINAMICS","foreground":"#FFFFFF","background":"#4CAF50"},{"text":"LEXAIA","value":"LEXAIA","foreground":"#FFFFFF","background":"#FF9800"},{"text":"ENKI REALTY","value":"ENKI_REALTY","foreground":"#FFFFFF","background":"#9C27B0"},{"text":"TAKEOUT","value":"TAKEOUT","foreground":"#FFFFFF","background":"#F44336"}]}'
)
ON CONFLICT (collection, field) DO NOTHING;
```

## 📊 Résultat attendu

Après ces étapes :
- ✅ 41 nouvelles colonnes `owner_company` dans PostgreSQL
- ✅ Directus reconnaît ces champs
- ✅ Le filtrage multi-entreprise fonctionne à 100%

## 🧪 Test final

```bash
# Tester le filtrage
node src/backend/tests/test-filtering.js
```

## 🆘 En cas de problème

1. Vérifier les logs Directus : `docker-compose logs directus`
2. Vérifier que PostgreSQL a bien les colonnes
3. Redémarrer tous les services : `docker-compose restart`
4. Utiliser l'interface Directus Admin pour ajouter manuellement si nécessaire