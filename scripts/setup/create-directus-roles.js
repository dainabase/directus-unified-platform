#!/usr/bin/env node

/**
 * Create Directus Roles
 * Idempotent script: safe to run multiple times.
 *
 * Required env: DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN
 *
 * Usage: node scripts/setup/create-directus-roles.js
 */

import { createDirectus, rest, staticToken, readRoles, createRole } from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('[roles] DIRECTUS_ADMIN_TOKEN is required');
  process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(TOKEN))
  .with(rest());

const ROLES = [
  { name: 'superadmin', admin_access: true, enforce_tfa: false, description: 'Full platform access' },
  { name: 'client', admin_access: false, enforce_tfa: false, description: 'Client portal access' },
  { name: 'prestataire', admin_access: false, enforce_tfa: false, description: 'Prestataire portal access' },
  { name: 'revendeur', admin_access: false, enforce_tfa: false, description: 'Revendeur portal access' }
];

async function main() {
  console.log('[roles] Fetching existing roles...');
  const existingRoles = await directus.request(readRoles());
  const existingNames = existingRoles.map(r => r.name?.toLowerCase());

  for (const role of ROLES) {
    if (existingNames.includes(role.name.toLowerCase())) {
      console.log(`[roles] SKIP — "${role.name}" already exists`);
      continue;
    }

    try {
      const created = await directus.request(createRole(role));
      console.log(`[roles] CREATED — "${role.name}" (id: ${created.id})`);
    } catch (err) {
      console.error(`[roles] ERROR creating "${role.name}":`, err.message);
    }
  }

  console.log('[roles] Done.');
}

main().catch(err => {
  console.error('[roles] Fatal error:', err);
  process.exit(1);
});
