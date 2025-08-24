# 📁 Organisation des Scripts

## 📋 Structure

Ce dossier contient tous les scripts utilitaires du projet, organisés par catégorie :

### 📂 Dossiers

- **`archive/`** - Scripts d'archivage et de sauvegarde
- **`deployment/`** - Scripts de déploiement et de release
- **`migration/`** - Scripts de migration de données et de structures
- **`testing/`** - Scripts de test et de validation
- **`analysis/`** - Scripts d'analyse et de diagnostic
- **`validation/`** - Scripts de validation et de vérification
- **`utilities/`** - Scripts utilitaires divers
- **`setup/`** - Scripts d'installation et de configuration
- **`populate-data/`** - Scripts de population de données
- **`maintenance/`** - Scripts de maintenance
- **`kpis-personnalization/`** - Scripts de personnalisation des KPIs

### 📄 Fichiers à la racine

Seuls quelques fichiers essentiels restent à la racine :
- `adapt-endpoints.js` - Adaptation des endpoints Directus
- `force-create-collections.js` - Création forcée de collections
- `generate-docs-simple.js` - Génération simple de documentation
- `generate-docs.ts` - Génération avancée de documentation (TypeScript)
- `ORGANIZE_SCRIPTS_SAFE.sh` - Script d'organisation (à supprimer après usage)

## 🚀 Utilisation

### Pour exécuter un script :

```bash
# Scripts JavaScript
node scripts/[dossier]/[script].js

# Scripts Bash
bash scripts/[dossier]/[script].sh

# Scripts Python
python scripts/[dossier]/[script].py
```

### Scripts fréquemment utilisés :

#### Migration
```bash
node scripts/migration/create-collections.js
node scripts/migration/create-relations-final.js
node scripts/migration/migrate-massive-data.js
```

#### Testing
```bash
node scripts/testing/test-token.js
node scripts/testing/test-portals.js
node scripts/testing/test-ocr.js
```

#### Deployment
```bash
bash scripts/deployment/release-v1.0.0-beta.1.sh
bash scripts/deployment/npm-publish-auto.sh
```

## 📝 Conventions

- **Nommage** : `[action]-[cible]-[details].[extension]`
  - Ex: `create-collections.js`, `test-ocr.js`, `migrate-sample-data.js`
  
- **Extensions** :
  - `.js` - Scripts Node.js
  - `.sh` - Scripts Bash
  - `.py` - Scripts Python
  - `.ts` - Scripts TypeScript

## ⚠️ Important

- Toujours vérifier les variables d'environnement avant d'exécuter un script
- Les scripts de migration peuvent modifier la base de données
- Les scripts de déploiement nécessitent des droits spécifiques
- Certains scripts nécessitent Docker pour fonctionner

## 🔧 Variables d'environnement requises

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=votre_token_admin
OPENAI_API_KEY=votre_clé_openai
```

## 📅 Dernière organisation

- **Date** : 24/12/2024
- **Scripts organisés** : 53
- **Dossiers créés** : 11
- **Par** : Script d'organisation automatique

## 🆘 Support

En cas de problème avec un script :
1. Vérifier les logs dans `/logs`
2. Consulter la documentation du script
3. Contacter l'équipe de développement
