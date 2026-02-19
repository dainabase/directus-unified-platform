---
name: docker-stack-ops
description: Opérations Docker Compose pour stack Directus + PostgreSQL 15 + Redis 7 + Node.js — configuration production, health checks, volume management, variables d'environnement. Ce skill doit être utilisé quand l'utilisateur travaille sur Docker, le déploiement, ou la configuration des services.
---

# Docker Stack Operations

## Production docker-compose Template
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: directus_db
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  directus:
    image: directus/directus:10.13
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    environment:
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: directus_db
      CACHE_ENABLED: "true"
      CACHE_STORE: redis
      REDIS: redis://redis:6379
      EXTENSIONS_AUTO_RELOAD: "false"
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions

volumes:
  pgdata:
```

## Memory Allocation (minimum)
- PostgreSQL: 2GB
- Directus: 1GB
- Redis: 512MB
