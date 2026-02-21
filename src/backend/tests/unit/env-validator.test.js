/**
 * Unit Tests - Environment Variable Validator
 * =============================================
 *
 * Tests the env validator for the HYPERVISUAL platform:
 * - Missing required variables triggers error (production) or warning (dev)
 * - All required vars present passes validation
 * - Optional vars don't cause errors when missing
 * - REQUIRED and OPTIONAL arrays are correctly defined
 *
 * Uses node:test runner (NOT Jest).
 *
 * @version 1.0.0
 * @date 2026-02-21
 * @author Claude Code
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv, REQUIRED, OPTIONAL } from '../../config/env.validator.js';

// ── Helpers ──

/**
 * Save current env values for the given keys, then clear them.
 * Returns a restore function.
 */
function clearEnvKeys(keys) {
  const saved = {};
  for (const key of keys) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  return () => {
    for (const key of keys) {
      if (saved[key] !== undefined) {
        process.env[key] = saved[key];
      } else {
        delete process.env[key];
      }
    }
  };
}

/**
 * Set env values for the given map.
 */
function setEnvKeys(map) {
  for (const [key, value] of Object.entries(map)) {
    process.env[key] = value;
  }
}

// ============================================================
// TEST SUITE
// ============================================================

describe('Environment Variable Validator', () => {

  // ──────────────────────────────────────────
  // 1. REQUIRED and OPTIONAL arrays
  // ──────────────────────────────────────────

  describe('1. Configuration Arrays', () => {

    it('REQUIRED is a non-empty array of strings', () => {
      assert.ok(Array.isArray(REQUIRED), 'REQUIRED should be an array');
      assert.ok(REQUIRED.length > 0, 'REQUIRED should not be empty');
      for (const key of REQUIRED) {
        assert.equal(typeof key, 'string', `REQUIRED entry "${key}" should be a string`);
        assert.ok(key.length > 0, 'REQUIRED entries should not be empty strings');
      }
    });

    it('OPTIONAL is a non-empty array of strings', () => {
      assert.ok(Array.isArray(OPTIONAL), 'OPTIONAL should be an array');
      assert.ok(OPTIONAL.length > 0, 'OPTIONAL should not be empty');
      for (const key of OPTIONAL) {
        assert.equal(typeof key, 'string', `OPTIONAL entry "${key}" should be a string`);
        assert.ok(key.length > 0, 'OPTIONAL entries should not be empty strings');
      }
    });

    it('REQUIRED includes critical database and auth vars', () => {
      const criticalVars = [
        'DIRECTUS_URL',
        'DIRECTUS_ADMIN_TOKEN',
        'JWT_SECRET',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'REDIS_URL',
      ];

      for (const key of criticalVars) {
        assert.ok(
          REQUIRED.includes(key),
          `"${key}" should be in REQUIRED list`
        );
      }
    });

    it('OPTIONAL includes integration vars', () => {
      const integrationVars = [
        'INVOICE_NINJA_URL',
        'REVOLUT_CLIENT_ID',
        'MAUTIC_URL',
        'DOCUSEAL_URL',
        'OPENAI_API_KEY',
        'ERPNEXT_URL',
      ];

      for (const key of integrationVars) {
        assert.ok(
          OPTIONAL.includes(key),
          `"${key}" should be in OPTIONAL list`
        );
      }
    });

    it('REQUIRED and OPTIONAL do not overlap', () => {
      const overlap = REQUIRED.filter(k => OPTIONAL.includes(k));
      assert.equal(
        overlap.length, 0,
        `REQUIRED and OPTIONAL should not overlap: ${overlap.join(', ')}`
      );
    });

    it('no duplicate entries in REQUIRED', () => {
      const unique = [...new Set(REQUIRED)];
      assert.equal(REQUIRED.length, unique.length, 'REQUIRED should have no duplicates');
    });

    it('no duplicate entries in OPTIONAL', () => {
      const unique = [...new Set(OPTIONAL)];
      assert.equal(OPTIONAL.length, unique.length, 'OPTIONAL should have no duplicates');
    });
  });

  // ──────────────────────────────────────────
  // 2. Validation with all required vars present
  // ──────────────────────────────────────────

  describe('2. All Required Vars Present', () => {

    let restoreEnv;

    beforeEach(() => {
      // Save and set all required vars
      const allKeys = [...REQUIRED, ...OPTIONAL];
      restoreEnv = clearEnvKeys(allKeys);

      // Set all required vars to dummy values
      for (const key of REQUIRED) {
        process.env[key] = `test-value-${key}`;
      }

      // Ensure we are in dev mode
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      restoreEnv();
    });

    it('does not throw when all required vars are set', () => {
      assert.doesNotThrow(
        () => validateEnv(),
        'validateEnv should not throw when all required vars are present'
      );
    });
  });

  // ──────────────────────────────────────────
  // 3. Missing required vars in production
  // ──────────────────────────────────────────

  describe('3. Missing Required Vars (Production Mode)', () => {

    let restoreEnv;

    beforeEach(() => {
      const allKeys = [...REQUIRED, ...OPTIONAL, 'NODE_ENV'];
      restoreEnv = clearEnvKeys(allKeys);
    });

    afterEach(() => {
      restoreEnv();
    });

    it('throws in production when required vars are missing', () => {
      process.env.NODE_ENV = 'production';
      // No REQUIRED vars set

      assert.throws(
        () => validateEnv(),
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes('Missing REQUIRED'),
            'Error message should mention "Missing REQUIRED"');
          return true;
        }
      );
    });

    it('error message lists missing variable names', () => {
      process.env.NODE_ENV = 'production';

      try {
        validateEnv();
        assert.fail('Should have thrown');
      } catch (err) {
        for (const key of REQUIRED) {
          assert.ok(
            err.message.includes(key),
            `Error message should mention missing var "${key}"`
          );
        }
      }
    });

    it('throws even if only one required var is missing', () => {
      process.env.NODE_ENV = 'production';

      // Set all required vars except the first one
      for (let i = 1; i < REQUIRED.length; i++) {
        process.env[REQUIRED[i]] = `test-value-${REQUIRED[i]}`;
      }

      assert.throws(
        () => validateEnv(),
        (err) => {
          assert.ok(err.message.includes(REQUIRED[0]),
            `Should mention missing var "${REQUIRED[0]}"`);
          return true;
        }
      );
    });
  });

  // ──────────────────────────────────────────
  // 4. Missing required vars in development (warning, no throw)
  // ──────────────────────────────────────────

  describe('4. Missing Required Vars (Development Mode)', () => {

    let restoreEnv;

    beforeEach(() => {
      const allKeys = [...REQUIRED, ...OPTIONAL, 'NODE_ENV'];
      restoreEnv = clearEnvKeys(allKeys);
    });

    afterEach(() => {
      restoreEnv();
    });

    it('does NOT throw in dev mode when required vars are missing', () => {
      process.env.NODE_ENV = 'development';
      // No REQUIRED vars set

      assert.doesNotThrow(
        () => validateEnv(),
        'validateEnv should warn but not throw in development mode'
      );
    });

    it('does NOT throw when NODE_ENV is not set (default = dev)', () => {
      // NODE_ENV is not set (cleared in beforeEach)
      // No REQUIRED vars set

      assert.doesNotThrow(
        () => validateEnv(),
        'validateEnv should not throw when NODE_ENV is unset (treated as dev)'
      );
    });
  });

  // ──────────────────────────────────────────
  // 5. Optional vars
  // ──────────────────────────────────────────

  describe('5. Optional Variables', () => {

    let restoreEnv;

    beforeEach(() => {
      const allKeys = [...REQUIRED, ...OPTIONAL, 'NODE_ENV'];
      restoreEnv = clearEnvKeys(allKeys);
    });

    afterEach(() => {
      restoreEnv();
    });

    it('does not throw when optional vars are missing', () => {
      // Set all required vars
      for (const key of REQUIRED) {
        process.env[key] = `test-value-${key}`;
      }
      process.env.NODE_ENV = 'production';
      // Explicitly do NOT set any optional vars

      assert.doesNotThrow(
        () => validateEnv(),
        'Missing optional vars should not cause an error'
      );
    });

    it('does not throw when all optional vars are also set', () => {
      // Set ALL vars
      for (const key of REQUIRED) {
        process.env[key] = `test-value-${key}`;
      }
      for (const key of OPTIONAL) {
        process.env[key] = `test-optional-${key}`;
      }
      process.env.NODE_ENV = 'production';

      assert.doesNotThrow(
        () => validateEnv(),
        'Validation should pass when all vars are set'
      );
    });
  });

  // ──────────────────────────────────────────
  // 6. Specific required vars
  // ──────────────────────────────────────────

  describe('6. Specific Required Variables', () => {

    it('JWT_SECRET is required', () => {
      assert.ok(REQUIRED.includes('JWT_SECRET'), 'JWT_SECRET must be required');
    });

    it('JWT_REFRESH_SECRET is required', () => {
      assert.ok(REQUIRED.includes('JWT_REFRESH_SECRET'), 'JWT_REFRESH_SECRET must be required');
    });

    it('DIRECTUS_URL is required', () => {
      assert.ok(REQUIRED.includes('DIRECTUS_URL'), 'DIRECTUS_URL must be required');
    });

    it('DIRECTUS_ADMIN_TOKEN is required', () => {
      assert.ok(REQUIRED.includes('DIRECTUS_ADMIN_TOKEN'), 'DIRECTUS_ADMIN_TOKEN must be required');
    });

    it('REDIS_URL is required', () => {
      assert.ok(REQUIRED.includes('REDIS_URL'), 'REDIS_URL must be required');
    });

    it('database vars (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) are required', () => {
      assert.ok(REQUIRED.includes('DB_HOST'));
      assert.ok(REQUIRED.includes('DB_NAME'));
      assert.ok(REQUIRED.includes('DB_USER'));
      assert.ok(REQUIRED.includes('DB_PASSWORD'));
    });
  });

  // ──────────────────────────────────────────
  // 7. Specific optional vars
  // ──────────────────────────────────────────

  describe('7. Specific Optional Variables', () => {

    it('FINANCE_API_KEY is optional', () => {
      assert.ok(OPTIONAL.includes('FINANCE_API_KEY'), 'FINANCE_API_KEY should be optional');
    });

    it('NODE_ENV is optional', () => {
      assert.ok(OPTIONAL.includes('NODE_ENV'), 'NODE_ENV should be optional');
    });

    it('ALLOWED_ORIGINS is optional', () => {
      assert.ok(OPTIONAL.includes('ALLOWED_ORIGINS'), 'ALLOWED_ORIGINS should be optional');
    });

    it('UNIFIED_PORT is optional', () => {
      assert.ok(OPTIONAL.includes('UNIFIED_PORT'), 'UNIFIED_PORT should be optional');
    });
  });
});
