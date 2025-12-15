/**
 * Commercial Hooks - Index
 *
 * Enregistrement et export de tous les hooks
 *
 * @date 15 Décembre 2025
 */

export * from './quote-hooks.js';
export * from './invoice-hooks.js';
export * from './lead-hooks.js';
export * from './scheduler.js';

import quoteHooks from './quote-hooks.js';
import invoiceHooks from './invoice-hooks.js';
import leadHooks from './lead-hooks.js';
import scheduler from './scheduler.js';

/**
 * Hook Registry
 * Mapping collection -> hooks
 */
export const hookRegistry = {
  quotes: {
    'items.create.before': quoteHooks.beforeQuoteCreate,
    'items.update.after': quoteHooks.afterQuoteUpdate
  },
  client_invoices: {
    'items.create.before': invoiceHooks.beforeInvoiceCreate,
    'items.update.after': invoiceHooks.afterInvoiceUpdate
  },
  leads: {
    'items.create.before': leadHooks.beforeLeadCreate,
    'items.create.after': leadHooks.afterLeadCreate,
    'items.update.after': leadHooks.afterLeadUpdate
  }
};

/**
 * Scheduled Tasks Registry
 */
export const scheduledTasks = {
  // Daily at midnight
  '0 0 * * *': scheduler.checkExpiredQuotes,

  // Daily at 9 AM
  '0 9 * * *': scheduler.sendPaymentReminders,

  // Every 3 days at 10 AM
  '0 10 */3 * *': scheduler.sendQuoteFollowUps,

  // Daily at 2 AM
  '0 2 * * *': scheduler.cleanupExpiredTokens,

  // Daily at 8 AM
  '0 8 * * *': scheduler.generateDailyReport
};

/**
 * Initialize hooks
 * Call this from Directus extension or server startup
 */
export function initializeHooks(directus) {
  console.log('🔄 Initializing commercial hooks...');

  // Note: In a real Directus extension, you would use:
  // directus.action('items.create', async (meta, context) => {...})

  // For now, we export the hooks for manual integration
  console.log('✅ Commercial hooks ready');
  console.log('  - Quote hooks: beforeCreate, afterUpdate');
  console.log('  - Invoice hooks: beforeCreate, afterUpdate');
  console.log('  - Lead hooks: beforeCreate, afterCreate, afterUpdate');
  console.log('  - Scheduler: 5 scheduled tasks');

  return {
    hooks: hookRegistry,
    scheduler: scheduledTasks
  };
}

export default {
  hookRegistry,
  scheduledTasks,
  initializeHooks,
  quoteHooks,
  invoiceHooks,
  leadHooks,
  scheduler
};
