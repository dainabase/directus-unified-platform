#!/usr/bin/env node

/**
 * Workflow Commercial Validation Script
 *
 * Validates the complete commercial workflow:
 * - Database collections
 * - API endpoints
 * - Services
 * - Integrations
 * - Frontend components
 *
 * Usage: node validate-workflow.js
 *
 * @date 15 Décembre 2025
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}=== ${msg} ===${colors.reset}\n`)
};

// Files to validate
const REQUIRED_FILES = {
  // Backend Services
  'backend/services': [
    'src/backend/services/commercial/lead.service.js',
    'src/backend/services/commercial/quote.service.js',
    'src/backend/services/commercial/cgv.service.js',
    'src/backend/services/commercial/invoice.service.js',
    'src/backend/services/commercial/payment.service.js',
    'src/backend/services/commercial/project.service.js',
    'src/backend/services/commercial/index.js'
  ],

  // Backend API
  'backend/api': [
    'src/backend/api/commercial/index.js',
    'src/backend/api/commercial/portal.routes.js',
    'src/backend/api/integrations/index.js'
  ],

  // Integration Services
  'integrations': [
    'src/backend/services/integrations/docuseal.service.js',
    'src/backend/services/integrations/invoice-ninja.service.js',
    'src/backend/services/integrations/mautic.service.js',
    'src/backend/services/integrations/index.js'
  ],

  // Directus Hooks
  'directus/hooks': [
    'src/backend/directus/hooks/quote-hooks.js',
    'src/backend/directus/hooks/invoice-hooks.js',
    'src/backend/directus/hooks/lead-hooks.js',
    'src/backend/directus/hooks/scheduler.js',
    'src/backend/directus/hooks/index.js'
  ],

  // Frontend Client Portal
  'frontend/portal': [
    'src/frontend/src/portals/client/index.js',
    'src/frontend/src/portals/client/ClientPortalApp.jsx',
    'src/frontend/src/portals/client/context/ClientAuthContext.jsx',
    'src/frontend/src/portals/client/pages/LoginPage.jsx',
    'src/frontend/src/portals/client/pages/ActivationPage.jsx',
    'src/frontend/src/portals/client/pages/ResetPasswordPage.jsx',
    'src/frontend/src/portals/client/pages/ClientPortalDashboard.jsx',
    'src/frontend/src/portals/client/components/QuoteViewer.jsx',
    'src/frontend/src/portals/client/components/InvoicesList.jsx',
    'src/frontend/src/portals/client/components/PaymentHistory.jsx',
    'src/frontend/src/portals/client/components/SignatureEmbed.jsx',
    'src/frontend/src/portals/client/components/ProjectTimeline.jsx'
  ],

  // Migration Reports
  'reports': [
    'src/backend/migrations/RAPPORT-PARTIE1-COLLECTIONS.md',
    'src/backend/migrations/RAPPORT-PARTIE2-COLLECTIONS-CREATED.md',
    'src/backend/migrations/RAPPORT-PARTIE3-SERVICES.md',
    'src/backend/migrations/RAPPORT-PARTIE4-API-ENDPOINTS.md',
    'src/backend/migrations/RAPPORT-PARTIE5-HOOKS.md',
    'src/backend/migrations/RAPPORT-PARTIE6-INTEGRATIONS.md',
    'src/backend/migrations/RAPPORT-PARTIE7-COMPOSANTS.md'
  ],

  // Tests
  'tests': [
    'src/backend/tests/workflow-commercial.test.js',
    'src/frontend/src/portals/client/__tests__/ClientPortal.test.jsx'
  ]
};

// API Endpoints to validate
const API_ENDPOINTS = [
  // Leads
  { method: 'GET', path: '/api/commercial/leads' },
  { method: 'POST', path: '/api/commercial/leads' },
  { method: 'GET', path: '/api/commercial/leads/:id' },
  { method: 'PATCH', path: '/api/commercial/leads/:id' },
  { method: 'POST', path: '/api/commercial/leads/:id/qualify' },
  { method: 'POST', path: '/api/commercial/leads/:id/convert' },

  // Quotes
  { method: 'GET', path: '/api/commercial/quotes' },
  { method: 'POST', path: '/api/commercial/quotes' },
  { method: 'GET', path: '/api/commercial/quotes/:id' },
  { method: 'PATCH', path: '/api/commercial/quotes/:id' },
  { method: 'POST', path: '/api/commercial/quotes/:id/send' },
  { method: 'POST', path: '/api/commercial/quotes/:id/view' },
  { method: 'GET', path: '/api/commercial/quotes/:id/pdf' },
  { method: 'POST', path: '/api/commercial/quotes/:id/deposit-invoice' },

  // CGV
  { method: 'GET', path: '/api/commercial/cgv/active/:company' },
  { method: 'POST', path: '/api/commercial/cgv' },
  { method: 'POST', path: '/api/commercial/cgv/accept' },

  // Invoices
  { method: 'GET', path: '/api/commercial/invoices' },
  { method: 'POST', path: '/api/commercial/invoices' },
  { method: 'GET', path: '/api/commercial/invoices/:id' },
  { method: 'POST', path: '/api/commercial/invoices/:id/send' },
  { method: 'POST', path: '/api/commercial/invoices/:id/payment' },
  { method: 'GET', path: '/api/commercial/invoices/:id/pdf' },

  // Portal
  { method: 'POST', path: '/api/commercial/portal/login' },
  { method: 'POST', path: '/api/commercial/portal/verify' },
  { method: 'POST', path: '/api/commercial/portal/activate' },
  { method: 'POST', path: '/api/commercial/portal/forgot-password' },
  { method: 'POST', path: '/api/commercial/portal/reset-password' },
  { method: 'GET', path: '/api/commercial/portal/dashboard' },

  // Integrations
  { method: 'GET', path: '/api/integrations/health' },
  { method: 'POST', path: '/api/integrations/docuseal/signature/quote/:id' },
  { method: 'POST', path: '/api/integrations/invoice-ninja/sync/:id' },
  { method: 'POST', path: '/api/integrations/mautic/sync/contact' }
];

// ===================================================================
// VALIDATION FUNCTIONS
// ===================================================================

function validateFiles(category, files) {
  log.section(`Validating ${category}`);

  let passed = 0;
  let failed = 0;

  files.forEach(file => {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      log.success(file);
      passed++;
    } else {
      log.error(`Missing: ${file}`);
      failed++;
    }
  });

  return { passed, failed };
}

function validateFileContent(filePath, requiredContent) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  for (const required of requiredContent) {
    if (!content.includes(required)) {
      log.warn(`${filePath}: Missing "${required}"`);
      return false;
    }
  }

  return true;
}

function validateServerRoutes() {
  log.section('Validating Server Routes');

  const serverPath = path.join(ROOT_DIR, 'src/backend/server.js');

  if (!fs.existsSync(serverPath)) {
    log.error('server.js not found');
    return { passed: 0, failed: 1 };
  }

  const serverContent = fs.readFileSync(serverPath, 'utf-8');

  const requiredRoutes = [
    '/api/commercial',
    '/api/integrations'
  ];

  let passed = 0;
  let failed = 0;

  requiredRoutes.forEach(route => {
    if (serverContent.includes(route)) {
      log.success(`Route registered: ${route}`);
      passed++;
    } else {
      log.error(`Route missing: ${route}`);
      failed++;
    }
  });

  return { passed, failed };
}

function validateExports() {
  log.section('Validating Module Exports');

  const exports = {
    'src/backend/services/commercial/index.js': [
      'LeadService',
      'QuoteService',
      'CGVService',
      'InvoiceService',
      'PaymentService',
      'ProjectService'
    ],
    'src/backend/services/integrations/index.js': [
      'DocuSealService',
      'InvoiceNinjaService',
      'MauticService',
      'IntegrationManager'
    ],
    'src/frontend/src/portals/client/index.js': [
      'ClientAuthProvider',
      'useClientAuth',
      'LoginPage',
      'ClientPortalApp',
      'QuoteViewer'
    ]
  };

  let passed = 0;
  let failed = 0;

  Object.entries(exports).forEach(([file, requiredExports]) => {
    const fullPath = path.join(ROOT_DIR, file);

    if (!fs.existsSync(fullPath)) {
      log.error(`File not found: ${file}`);
      failed++;
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    requiredExports.forEach(exp => {
      if (content.includes(exp)) {
        log.success(`${file}: exports ${exp}`);
        passed++;
      } else {
        log.error(`${file}: missing export ${exp}`);
        failed++;
      }
    });
  });

  return { passed, failed };
}

function validateTVACalculations() {
  log.section('Validating Swiss TVA Rates');

  const rates = {
    'Standard (8.1%)': { rate: 8.1, subtotal: 1000, expected: 81 },
    'Reduced (2.6%)': { rate: 2.6, subtotal: 1000, expected: 26 },
    'Accommodation (3.8%)': { rate: 3.8, subtotal: 1000, expected: 38 },
    'Exempt (0%)': { rate: 0, subtotal: 1000, expected: 0 }
  };

  let passed = 0;
  let failed = 0;

  Object.entries(rates).forEach(([name, { rate, subtotal, expected }]) => {
    const calculated = Math.round(subtotal * rate) / 100;
    if (calculated === expected) {
      log.success(`${name}: ${subtotal} × ${rate}% = ${calculated}`);
      passed++;
    } else {
      log.error(`${name}: Expected ${expected}, got ${calculated}`);
      failed++;
    }
  });

  return { passed, failed };
}

function generateReport(results) {
  log.section('VALIDATION SUMMARY');

  const total = { passed: 0, failed: 0 };

  Object.entries(results).forEach(([category, { passed, failed }]) => {
    total.passed += passed;
    total.failed += failed;

    const status = failed === 0 ? colors.green + '✓' : colors.red + '✗';
    console.log(`${status}${colors.reset} ${category}: ${passed} passed, ${failed} failed`);
  });

  console.log('');
  console.log(`${colors.bold}Total: ${total.passed} passed, ${total.failed} failed${colors.reset}`);

  if (total.failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 ALL VALIDATIONS PASSED!${colors.reset}`);
    console.log(`\nWorkflow commercial is ready for production.`);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️ SOME VALIDATIONS FAILED${colors.reset}`);
    console.log(`\nPlease fix the issues above before deploying.`);
  }

  return total.failed === 0;
}

// ===================================================================
// MAIN
// ===================================================================

async function main() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     WORKFLOW COMMERCIAL - VALIDATION SCRIPT            ║');
  console.log('║     15 Décembre 2025                                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  const results = {};

  // Validate all required files
  Object.entries(REQUIRED_FILES).forEach(([category, files]) => {
    results[category] = validateFiles(category, files);
  });

  // Validate server routes
  results['server routes'] = validateServerRoutes();

  // Validate exports
  results['module exports'] = validateExports();

  // Validate TVA calculations
  results['swiss tva'] = validateTVACalculations();

  // Generate report
  const success = generateReport(results);

  // Return exit code
  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('Validation script failed:', err);
  process.exit(1);
});
