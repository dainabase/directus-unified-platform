# Setup Scripts

Run these scripts in order to configure a fresh Directus instance.

## Prerequisites

- Directus running on `DIRECTUS_URL` (default: http://localhost:8055)
- `DIRECTUS_ADMIN_TOKEN` set in `.env`

## Order of execution

```bash
# 1. Create the 4 portal roles (superadmin, client, prestataire, revendeur)
node scripts/setup/create-directus-roles.js

# 2. Apply permission matrix for each role
node scripts/setup/setup-permissions.js
```

Both scripts are idempotent — safe to re-run.
