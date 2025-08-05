# 🏗️ Architecture Overview

## Vue d'ensemble

Le projet Directus Unified Platform est une application web moderne composée de :

- **Backend API** : Node.js + Express + Directus SDK
- **Frontend** : 4 portails métier avec Tabler.io
- **CMS** : Directus v10
- **Base de données** : PostgreSQL
- **Cache** : Redis
- **OCR** : OpenAI Vision API

## Structure Réorganisée

La structure a été réorganisée pour une meilleure maintenabilité :

- `/src` : Tout le code source
- `/migration` : Scripts de migration Notion
- `/docs` : Documentation technique
- `/design-system` : Composants Tabler.io
- `/tests` : Tests automatisés

## Notes de Réorganisation

- Dashboard original préservé dans `src/frontend/portals/dashboard-legacy/`
- Aucun code n'a été supprimé, seulement réorganisé
- Tous les endpoints legacy sont accessibles
