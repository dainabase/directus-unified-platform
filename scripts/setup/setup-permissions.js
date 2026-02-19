#!/usr/bin/env node

/**
 * Setup Directus Permissions
 * Idempotent: deletes existing permissions for managed roles then recreates them.
 *
 * Required env: DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN
 * Prerequisite: run create-directus-roles.js first
 *
 * Usage: node scripts/setup/setup-permissions.js
 */

import { createDirectus, rest, staticToken, readRoles, readPermissions, createPermission, deletePermission } from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('[permissions] DIRECTUS_ADMIN_TOKEN is required');
  process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(TOKEN))
  .with(rest());

/**
 * Permission matrix per role.
 * SuperAdmin has admin_access=true in Directus, so no permissions needed.
 *
 * Format: { collection, action, permissions (filter), fields }
 * permissions: {} means no filter (all items), filter object means restricted
 */
function buildPermissions(roleId, roleName) {
  const own = (field) => ({ [field]: { _eq: '$CURRENT_USER' } });

  switch (roleName) {
    case 'client':
      return [
        // Projects — read own
        { role: roleId, collection: 'projects', action: 'read', permissions: own('client_id'), fields: ['*'] },
        // Quotes — read own
        { role: roleId, collection: 'quotes', action: 'read', permissions: own('contact_id'), fields: ['*'] },
        // Client invoices — read own
        { role: roleId, collection: 'client_invoices', action: 'read', permissions: own('contact_id'), fields: ['*'] },
        // Payments — read own
        { role: roleId, collection: 'payments', action: 'read', permissions: own('contact_id'), fields: ['*'] },
        // Deliverables — read via project
        { role: roleId, collection: 'deliverables', action: 'read', permissions: {}, fields: ['*'] },
        // Support tickets — read + create own
        { role: roleId, collection: 'support_tickets', action: 'read', permissions: own('contact_id'), fields: ['*'] },
        { role: roleId, collection: 'support_tickets', action: 'create', permissions: {}, fields: ['subject', 'description', 'priority', 'contact_id'] },
        // Owner companies — read (for display)
        { role: roleId, collection: 'owner_companies', action: 'read', permissions: {}, fields: ['id', 'name', 'code', 'logo'] },
        // Contacts — read own profile
        { role: roleId, collection: 'contacts', action: 'read', permissions: own('id'), fields: ['*'] },
        { role: roleId, collection: 'contacts', action: 'update', permissions: own('id'), fields: ['phone', 'address', 'city', 'postal_code'] },
      ];

    case 'prestataire':
      return [
        // Projects — read assigned
        { role: roleId, collection: 'projects', action: 'read', permissions: own('assigned_to'), fields: ['*'] },
        // Supplier invoices — CRUD own
        { role: roleId, collection: 'supplier_invoices', action: 'read', permissions: own('supplier_id'), fields: ['*'] },
        { role: roleId, collection: 'supplier_invoices', action: 'create', permissions: {}, fields: ['*'] },
        { role: roleId, collection: 'supplier_invoices', action: 'update', permissions: own('supplier_id'), fields: ['status', 'amount', 'description', 'file'] },
        // Deliverables — read + update assigned
        { role: roleId, collection: 'deliverables', action: 'read', permissions: own('assigned_to'), fields: ['*'] },
        { role: roleId, collection: 'deliverables', action: 'update', permissions: own('assigned_to'), fields: ['status', 'progress', 'notes'] },
        // Time tracking — CRUD own
        { role: roleId, collection: 'time_entries', action: 'read', permissions: own('user_id'), fields: ['*'] },
        { role: roleId, collection: 'time_entries', action: 'create', permissions: {}, fields: ['*'] },
        { role: roleId, collection: 'time_entries', action: 'update', permissions: own('user_id'), fields: ['*'] },
        // Owner companies — read
        { role: roleId, collection: 'owner_companies', action: 'read', permissions: {}, fields: ['id', 'name', 'code'] },
      ];

    case 'revendeur':
      return [
        // Products/services — read
        { role: roleId, collection: 'products', action: 'read', permissions: {}, fields: ['*'] },
        { role: roleId, collection: 'services', action: 'read', permissions: {}, fields: ['*'] },
        // Quotes — create + read own
        { role: roleId, collection: 'quotes', action: 'read', permissions: own('reseller_id'), fields: ['*'] },
        { role: roleId, collection: 'quotes', action: 'create', permissions: {}, fields: ['*'] },
        // Client invoices — read own commissions
        { role: roleId, collection: 'client_invoices', action: 'read', permissions: own('reseller_id'), fields: ['*'] },
        // Owner companies — read
        { role: roleId, collection: 'owner_companies', action: 'read', permissions: {}, fields: ['id', 'name', 'code'] },
      ];

    default:
      return [];
  }
}

async function main() {
  console.log('[permissions] Fetching roles...');
  const roles = await directus.request(readRoles());

  const managedRoles = ['client', 'prestataire', 'revendeur'];
  const roleMap = {};

  for (const role of roles) {
    if (managedRoles.includes(role.name?.toLowerCase())) {
      roleMap[role.name.toLowerCase()] = role.id;
    }
  }

  const missing = managedRoles.filter(r => !roleMap[r]);
  if (missing.length > 0) {
    console.error(`[permissions] Missing roles: ${missing.join(', ')}. Run create-directus-roles.js first.`);
    process.exit(1);
  }

  // Delete existing managed permissions to avoid duplicates
  console.log('[permissions] Cleaning existing managed permissions...');
  try {
    const existing = await directus.request(readPermissions());
    for (const perm of existing) {
      if (Object.values(roleMap).includes(perm.role)) {
        await directus.request(deletePermission(perm.id));
      }
    }
    console.log('[permissions] Existing permissions cleared.');
  } catch (err) {
    console.warn('[permissions] Could not clear existing permissions:', err.message);
  }

  // Create permissions for each role
  let created = 0;
  let errors = 0;

  for (const [roleName, roleId] of Object.entries(roleMap)) {
    const perms = buildPermissions(roleId, roleName);
    console.log(`[permissions] Creating ${perms.length} permissions for "${roleName}"...`);

    for (const perm of perms) {
      try {
        await directus.request(createPermission(perm));
        created++;
      } catch (err) {
        // Collection may not exist yet — warn but continue
        console.warn(`[permissions] WARN — ${perm.collection}/${perm.action}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`[permissions] Done. Created: ${created}, Errors: ${errors}`);
}

main().catch(err => {
  console.error('[permissions] Fatal error:', err);
  process.exit(1);
});
