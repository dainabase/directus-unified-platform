# 🔌 Intégrations Directus Unified Platform

## Architecture

```
integrations/
├── invoice-ninja/   # Facturation (Port 8090)
├── revolut/        # Banking API (Port 3002)
├── mautic/         # Marketing (Port 8084)
└── erpnext/        # ERP (Port 8083)
```

## Quick Start

```bash
# Démarrer tous les services
../start-all-services.sh

# Ou individuellement
cd [service-name]
docker-compose up -d
```

## Services

| Service | Port | Docker | Documentation |
|---------|------|--------|--------------|
| Invoice Ninja | 8090 | ✅ | [README](invoice-ninja/README.md) |
| Revolut API | 3002 | N/A | [README](revolut/README.md) |
| Mautic | 8084 | ✅ | [README](mautic/README.md) |
| ERPNext | 8083 | ✅ | [README](erpnext/README.md) |

## Troubleshooting

### Container qui crash
```bash
docker logs [container-name] --tail 100
docker-compose down && docker-compose up -d
```

### Port déjà utilisé
```bash
lsof -i :[port]
kill -9 [PID]
```

### Reset complet
```bash
docker-compose down -v
docker-compose up -d
```