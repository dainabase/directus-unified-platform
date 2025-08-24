# Scripts Directory

## Structure
- **testing/** : Scripts de test et validation
- **migration/** : Scripts de migration de données
- **deployment/** : Scripts de déploiement et serveurs
- **utilities/** : Scripts utilitaires divers
- **archive/** : Anciens scripts conservés pour référence

## Usage
Tous les scripts sont maintenant organisés par catégorie.
Utilisez `node scripts/[category]/[script].js` pour exécuter.

## Catégories

### Testing
Scripts pour tester les différentes parties de l'application :
- Tests d'API et de connexion
- Tests de permissions et de filtrage
- Tests visuels et de dashboard
- Rapports de tests JSON

### Migration
Scripts pour migrer et synchroniser les données :
- Migration avec Directus SDK
- Création de companies et de données KPI
- Synchronisation de schéma Directus
- Backups SQL

### Deployment
Scripts pour démarrer et gérer les services :
- Scripts de démarrage/arrêt de la plateforme
- Configuration ecosystem pour PM2
- Serveurs Node.js
- Docker compose pour MCP et Storybook

### Utilities
Scripts utilitaires pour la maintenance :
- Vérification des collections et permissions
- Nettoyage de fichiers temporaires
- Réinitialisation de mots de passe
- Diagnostic système

### Archive
Anciens scripts conservés pour référence historique.