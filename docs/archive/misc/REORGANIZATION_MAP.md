# 📍 MAPPING DE RÉORGANISATION

## Fichiers Déplacés

| Ancien Emplacement | Nouvel Emplacement |
|-------------------|-------------------|
| /backend/* | /src/backend/api/legacy/ |
| /frontend/* | /src/frontend/ |
| /dashboard/* | /src/frontend/portals/dashboard-legacy/ |
| /server-directus-unified.js | /src/backend/server.js |
| /STATUS/* | /migration/reports/status/ |
| /QUICK/* | /migration/reports/quick/ |
| /migration/scripts/* | /migration/active/ |

## Fichiers Préservés

- ✅ Dashboard complet (268 fichiers)
- ✅ OCR Service (247 fichiers)
- ✅ 156 endpoints legacy
- ✅ Scripts de migration
- ✅ Configuration Docker

## Nouvelle Organisation

- `/src` : Code source unifié
- `/docs` : Documentation centralisée
- `/migration` : Migration Notion organisée par phases
- `/design-system` : Composants Tabler.io
- `/tests` : Tests automatisés
