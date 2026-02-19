# PHASE 5 — NPM PACKAGES ESSENTIELS

## Contexte
Suite de la configuration `directus-unified-platform`. Phases 1-4 terminées. On installe maintenant les packages nécessaires aux 156 endpoints custom et aux intégrations.

## Mission Phase 5
Installe les packages npm dans le bon répertoire. Si une commande échoue, signale l'erreur immédiatement.

### 5.1 Packages Backend (racine du projet)

```bash
# Swiss compliance
npm install swissqrbill dinero.js @dinero.js/currencies

# Intégrations
npm install openai jsonwebtoken axios

# Job processing & resilience
npm install bullmq bottleneck p-retry

# Validation
npm install zod

# Directus SDK
npm install @directus/sdk @directus/extensions-sdk
```

### 5.2 Packages Frontend

```bash
# Naviguer vers le dossier frontend (adapter si nécessaire)
cd frontend && npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers recharts react-router-dom react-hot-toast @tabler/icons-react
```

> ⚠️ Si le dossier `frontend` n'existe pas, vérifie la structure du projet et adapte le chemin.

### 5.3 Vérification Phase 5

```bash
echo "=== Packages Backend ==="
npm list swissqrbill dinero.js openai zod bullmq @directus/sdk 2>/dev/null

echo ""
echo "=== Packages Frontend ==="
cd frontend && npm list @tanstack/react-query zustand recharts 2>/dev/null
```

## Résultat attendu
- ~15 packages installés (backend + frontend)
- Signale-moi le résultat pour lancer la Phase 6 (vérification finale).
