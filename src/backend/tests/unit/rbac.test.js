/**
 * Unit Tests - RBAC Configuration
 * =================================
 *
 * Tests the Role-Based Access Control system for HYPERVISUAL platform:
 * - 4 roles: superadmin, client, prestataire, revendeur
 * - Permission format: 'resource.action'
 * - Wildcard matching: '*.*'
 * - hasPermission function
 * - requireOwnership middleware
 *
 * Uses node:test runner (NOT Jest).
 *
 * @version 1.0.0
 * @date 2026-02-21
 * @author Claude Code
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES,
  hasPermission,
  getRolePermissions,
  getAllRoles,
  getRoleLabel,
  requireOwnership,
} from '../../config/rbac.config.js';

// ── Mock helpers ──

function createMockReq(overrides = {}) {
  return {
    headers: {},
    params: {},
    query: {},
    body: {},
    user: null,
    ...overrides,
  };
}

function createMockRes() {
  const res = {
    _status: null,
    _json: null,
    status(code) {
      res._status = code;
      return res;
    },
    json(data) {
      res._json = data;
      return res;
    },
  };
  return res;
}

function createMockNext() {
  let called = false;
  const fn = () => { called = true; };
  fn.wasCalled = () => called;
  return fn;
}

// ============================================================
// TEST SUITE
// ============================================================

describe('RBAC Configuration', () => {

  // ──────────────────────────────────────────
  // 1. Role definitions
  // ──────────────────────────────────────────

  describe('1. Role Definitions', () => {

    it('defines exactly 4 roles', () => {
      const roles = getAllRoles();
      assert.equal(roles.length, 4, 'Should have exactly 4 roles');
    });

    it('defines superadmin, client, prestataire, revendeur', () => {
      const roles = getAllRoles();
      assert.ok(roles.includes('superadmin'), 'Should have superadmin role');
      assert.ok(roles.includes('client'), 'Should have client role');
      assert.ok(roles.includes('prestataire'), 'Should have prestataire role');
      assert.ok(roles.includes('revendeur'), 'Should have revendeur role');
    });

    it('each role has a label', () => {
      for (const role of getAllRoles()) {
        const label = getRoleLabel(role);
        assert.ok(label, `Role "${role}" should have a label`);
        assert.ok(typeof label === 'string', `Label for "${role}" should be a string`);
        assert.ok(label.length > 0, `Label for "${role}" should not be empty`);
      }
    });

    it('each role has a permissions array', () => {
      for (const role of getAllRoles()) {
        const config = ROLES[role];
        assert.ok(Array.isArray(config.permissions), `Role "${role}" should have a permissions array`);
        assert.ok(config.permissions.length > 0, `Role "${role}" should have at least one permission`);
      }
    });

    it('each role has an inherits array', () => {
      for (const role of getAllRoles()) {
        const config = ROLES[role];
        assert.ok(Array.isArray(config.inherits), `Role "${role}" should have an inherits array`);
      }
    });

    it('getRoleLabel returns null for unknown role', () => {
      assert.equal(getRoleLabel('nonexistent'), null);
    });
  });

  // ──────────────────────────────────────────
  // 2. Superadmin permissions (full access)
  // ──────────────────────────────────────────

  describe('2. Superadmin Permissions', () => {

    it('superadmin has wildcard permission (*.*)', () => {
      const perms = getRolePermissions('superadmin');
      assert.ok(perms.includes('*.*'), 'Superadmin should have *.*');
    });

    it('superadmin has access to finance.read', () => {
      assert.ok(hasPermission('superadmin', 'finance.read'));
    });

    it('superadmin has access to finance.write', () => {
      assert.ok(hasPermission('superadmin', 'finance.write'));
    });

    it('superadmin has access to any arbitrary permission', () => {
      const arbitraryPerms = [
        'projects.read',
        'invoices.write',
        'leads.delete',
        'anything.everything',
        'foo.bar',
      ];

      for (const perm of arbitraryPerms) {
        assert.ok(
          hasPermission('superadmin', perm),
          `Superadmin should have access to "${perm}"`
        );
      }
    });
  });

  // ──────────────────────────────────────────
  // 3. Client permissions (limited)
  // ──────────────────────────────────────────

  describe('3. Client Permissions', () => {

    it('client can read projects', () => {
      assert.ok(hasPermission('client', 'projects.read'));
    });

    it('client can list projects', () => {
      assert.ok(hasPermission('client', 'projects.list'));
    });

    it('client can read invoices', () => {
      assert.ok(hasPermission('client', 'invoices.read'));
    });

    it('client can sign quotes', () => {
      assert.ok(hasPermission('client', 'quotes.sign'));
    });

    it('client can create support tickets', () => {
      assert.ok(hasPermission('client', 'support.create'));
    });

    it('client can update own profile', () => {
      assert.ok(hasPermission('client', 'profile.update'));
    });

    it('client can read notifications', () => {
      assert.ok(hasPermission('client', 'notifications.read'));
    });

    it('client CANNOT access finance resources', () => {
      assert.ok(!hasPermission('client', 'finance.read'),
        'Client should NOT have finance.read');
      assert.ok(!hasPermission('client', 'finance.write'),
        'Client should NOT have finance.write');
    });

    it('client CANNOT create leads', () => {
      assert.ok(!hasPermission('client', 'leads.create'));
    });

    it('client CANNOT manage commissions', () => {
      assert.ok(!hasPermission('client', 'commissions.read'));
    });

    it('client CANNOT manage missions', () => {
      assert.ok(!hasPermission('client', 'missions.read'));
    });

    it('client CANNOT manage time tracking', () => {
      assert.ok(!hasPermission('client', 'time-tracking.create'));
    });
  });

  // ──────────────────────────────────────────
  // 4. Prestataire permissions
  // ──────────────────────────────────────────

  describe('4. Prestataire Permissions', () => {

    it('prestataire can read missions', () => {
      assert.ok(hasPermission('prestataire', 'missions.read'));
    });

    it('prestataire can update tasks', () => {
      assert.ok(hasPermission('prestataire', 'tasks.update'));
    });

    it('prestataire can create time entries', () => {
      assert.ok(hasPermission('prestataire', 'time-tracking.create'));
    });

    it('prestataire can read and update own time entries', () => {
      assert.ok(hasPermission('prestataire', 'time-tracking.read'));
      assert.ok(hasPermission('prestataire', 'time-tracking.update'));
      assert.ok(hasPermission('prestataire', 'time-tracking.delete'));
    });

    it('prestataire can submit invoices', () => {
      assert.ok(hasPermission('prestataire', 'invoices.create'));
    });

    it('prestataire can upload documents', () => {
      assert.ok(hasPermission('prestataire', 'documents.upload'));
    });

    it('prestataire CANNOT access leads', () => {
      assert.ok(!hasPermission('prestataire', 'leads.create'));
      assert.ok(!hasPermission('prestataire', 'leads.read'));
    });

    it('prestataire CANNOT access commissions', () => {
      assert.ok(!hasPermission('prestataire', 'commissions.read'));
    });

    it('prestataire CANNOT access finance', () => {
      assert.ok(!hasPermission('prestataire', 'finance.read'));
    });

    it('prestataire CANNOT sign quotes', () => {
      assert.ok(!hasPermission('prestataire', 'quotes.sign'));
    });
  });

  // ──────────────────────────────────────────
  // 5. Revendeur permissions
  // ──────────────────────────────────────────

  describe('5. Revendeur Permissions', () => {

    it('revendeur can create leads', () => {
      assert.ok(hasPermission('revendeur', 'leads.create'));
    });

    it('revendeur can read and update own leads', () => {
      assert.ok(hasPermission('revendeur', 'leads.read'));
      assert.ok(hasPermission('revendeur', 'leads.update'));
    });

    it('revendeur can view pipeline', () => {
      assert.ok(hasPermission('revendeur', 'pipeline.read'));
    });

    it('revendeur can create quotes', () => {
      assert.ok(hasPermission('revendeur', 'quotes.create'));
    });

    it('revendeur can view commissions', () => {
      assert.ok(hasPermission('revendeur', 'commissions.read'));
    });

    it('revendeur can download marketing assets', () => {
      assert.ok(hasPermission('revendeur', 'marketing.download'));
    });

    it('revendeur CANNOT access missions', () => {
      assert.ok(!hasPermission('revendeur', 'missions.read'));
    });

    it('revendeur CANNOT access time tracking', () => {
      assert.ok(!hasPermission('revendeur', 'time-tracking.create'));
    });

    it('revendeur CANNOT access finance', () => {
      assert.ok(!hasPermission('revendeur', 'finance.read'));
    });

    it('revendeur CANNOT sign quotes', () => {
      assert.ok(!hasPermission('revendeur', 'quotes.sign'));
    });
  });

  // ──────────────────────────────────────────
  // 6. hasPermission function
  // ──────────────────────────────────────────

  describe('6. hasPermission Function', () => {

    it('returns false for unknown role', () => {
      assert.ok(!hasPermission('nonexistent', 'any.perm'));
    });

    it('returns false for undefined role', () => {
      assert.ok(!hasPermission(undefined, 'any.perm'));
    });

    it('returns false for null role', () => {
      assert.ok(!hasPermission(null, 'any.perm'));
    });

    it('wildcard resource matches any resource', () => {
      // Superadmin has '*.*'
      assert.ok(hasPermission('superadmin', 'anything.read'));
      assert.ok(hasPermission('superadmin', 'anything.write'));
      assert.ok(hasPermission('superadmin', 'anything.delete'));
    });

    it('wildcard action matches any action', () => {
      assert.ok(hasPermission('superadmin', 'finance.anything'));
    });

    it('exact match works for specific permissions', () => {
      assert.ok(hasPermission('client', 'projects.read'));
      assert.ok(!hasPermission('client', 'projects.delete'));
    });
  });

  // ──────────────────────────────────────────
  // 7. getRolePermissions function
  // ──────────────────────────────────────────

  describe('7. getRolePermissions Function', () => {

    it('returns array of permissions for valid role', () => {
      const perms = getRolePermissions('client');
      assert.ok(Array.isArray(perms));
      assert.ok(perms.length > 0);
    });

    it('returns empty array for unknown role', () => {
      const perms = getRolePermissions('nonexistent');
      assert.ok(Array.isArray(perms));
      assert.equal(perms.length, 0);
    });

    it('superadmin permissions include *.*', () => {
      const perms = getRolePermissions('superadmin');
      assert.ok(perms.includes('*.*'));
    });

    it('client permissions include projects.read', () => {
      const perms = getRolePermissions('client');
      assert.ok(perms.includes('projects.read'));
    });

    it('permissions are deduplicated', () => {
      for (const role of getAllRoles()) {
        const perms = getRolePermissions(role);
        const unique = [...new Set(perms)];
        assert.equal(perms.length, unique.length,
          `Permissions for "${role}" should not have duplicates`);
      }
    });
  });

  // ──────────────────────────────────────────
  // 8. requireOwnership middleware
  // ──────────────────────────────────────────

  describe('8. requireOwnership Middleware', () => {

    it('superadmin bypasses ownership check', () => {
      const middleware = requireOwnership('owner_company');

      const req = createMockReq({
        user: { role: 'superadmin', id: 'admin-1' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.ok(next.wasCalled(), 'Superadmin should bypass ownership');
      assert.equal(req.ownershipCheck, undefined,
        'No ownershipCheck should be set for superadmin');
    });

    it('admin bypasses ownership check', () => {
      const middleware = requireOwnership('owner_company');

      const req = createMockReq({
        user: { role: 'admin', id: 'admin-2' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.ok(next.wasCalled(), 'Admin should bypass ownership');
    });

    it('client role sets ownershipCheck field', () => {
      const middleware = requireOwnership('owner_company');

      const req = createMockReq({
        user: { role: 'client', id: 'client-1' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.ok(next.wasCalled(), 'Client should pass (ownership checked later)');
      assert.equal(req.ownershipCheck, 'owner_company',
        'ownershipCheck field should be set for client');
    });

    it('prestataire role sets ownershipCheck field', () => {
      const middleware = requireOwnership('contact_id');

      const req = createMockReq({
        user: { role: 'prestataire', id: 'prest-1' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.ok(next.wasCalled());
      assert.equal(req.ownershipCheck, 'contact_id');
    });

    it('default ownerField is owner_company', () => {
      const middleware = requireOwnership();

      const req = createMockReq({
        user: { role: 'revendeur', id: 'rev-1' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.equal(req.ownershipCheck, 'owner_company');
    });
  });

  // ──────────────────────────────────────────
  // 9. Cross-role isolation
  // ──────────────────────────────────────────

  describe('9. Cross-Role Permission Isolation', () => {

    it('client permissions do not overlap with prestataire-exclusive permissions', () => {
      const clientPerms = getRolePermissions('client');
      const prestataireExclusive = [
        'missions.read',
        'missions.list',
        'tasks.update',
        'time-tracking.create',
        'documents.upload',
      ];

      for (const perm of prestataireExclusive) {
        assert.ok(
          !clientPerms.includes(perm),
          `Client should NOT have prestataire-exclusive permission "${perm}"`
        );
      }
    });

    it('revendeur permissions do not overlap with prestataire-exclusive permissions', () => {
      const revendeurPerms = getRolePermissions('revendeur');
      const prestataireExclusive = [
        'missions.read',
        'tasks.update',
        'time-tracking.create',
      ];

      for (const perm of prestataireExclusive) {
        assert.ok(
          !revendeurPerms.includes(perm),
          `Revendeur should NOT have prestataire-exclusive permission "${perm}"`
        );
      }
    });

    it('prestataire permissions do not overlap with revendeur-exclusive permissions', () => {
      const prestatairePerms = getRolePermissions('prestataire');
      const revendeurExclusive = [
        'leads.create',
        'leads.update',
        'pipeline.read',
        'pipeline.update',
        'commissions.read',
        'commissions.list',
      ];

      for (const perm of revendeurExclusive) {
        assert.ok(
          !prestatairePerms.includes(perm),
          `Prestataire should NOT have revendeur-exclusive permission "${perm}"`
        );
      }
    });
  });
});
