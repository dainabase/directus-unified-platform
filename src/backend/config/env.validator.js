/**
 * Environment Variable Validator
 * Validates all critical environment variables at startup.
 * If a REQUIRED variable is missing, the server will not start.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

const REQUIRED = [
  'DIRECTUS_URL',
  'DIRECTUS_ADMIN_TOKEN',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'REDIS_URL'
];

const OPTIONAL = [
  'INVOICE_NINJA_URL',
  'INVOICE_NINJA_TOKEN',
  'REVOLUT_CLIENT_ID',
  'REVOLUT_ENV',
  'REVOLUT_ACCESS_TOKEN',
  'REVOLUT_REFRESH_TOKEN',
  'REVOLUT_PRIVATE_KEY',
  'REVOLUT_PRIVATE_KEY_PATH',
  'REVOLUT_SANDBOX',
  'REVOLUT_WEBHOOK_SECRET',
  'MAUTIC_URL',
  'MAUTIC_CLIENT_ID',
  'MAUTIC_CLIENT_SECRET',
  'DOCUSEAL_URL',
  'DOCUSEAL_API_KEY',
  'OPENAI_API_KEY',
  'ERPNEXT_URL',
  'ERPNEXT_API_KEY',
  'ERPNEXT_API_SECRET',
  'ALLOWED_ORIGINS',
  'UNIFIED_PORT',
  'NODE_ENV',
  'FINANCE_API_KEY'
];

/**
 * Validates environment variables.
 * Throws an error if any REQUIRED variable is missing.
 * Logs warnings for missing OPTIONAL variables.
 */
export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const key of REQUIRED) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (warnings.length > 0) {
    console.warn(`[env] Optional variables not set: ${warnings.join(', ')}`);
  }

  if (missing.length > 0) {
    const message = `[env] Missing REQUIRED environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\nSee .env.example for the full list.`;

    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    } else {
      console.warn(`\n⚠️  ${message}\n⚠️  Running in dev mode — continuing with defaults.\n`);
    }
  }

  console.log('[env] Environment validation complete.');
}

export { REQUIRED, OPTIONAL };
export default validateEnv;
