/**
 * Commercial Services - Index Export
 *
 * Services pour le workflow commercial complet:
 * Lead → Quote → CGV → Signature → Acompte → Projet
 *
 * @date 15 Décembre 2025
 */

export * as quoteService from './quote.service.js';
export * as cgvService from './cgv.service.js';
export * as signatureService from './signature.service.js';
export * as depositService from './deposit.service.js';
export * as portalService from './client-portal.service.js';
export * as workflowService from './workflow.service.js';

// Re-export commonly used functions for convenience
export {
  createQuote,
  getQuote,
  listQuotes,
  updateQuoteStatus,
  getQuoteStats
} from './quote.service.js';

export {
  getActiveCGV,
  recordAcceptance,
  hasAcceptedCurrentCGV
} from './cgv.service.js';

export {
  createSignatureRequest,
  signQuoteManually,
  processWebhook as processSignatureWebhook
} from './signature.service.js';

export {
  calculateDeposit,
  createDepositInvoice,
  markDepositPaid,
  getDepositStats
} from './deposit.service.js';

export {
  createPortalAccount,
  authenticateUser,
  verifyToken
} from './client-portal.service.js';

export {
  convertLeadToQuote,
  sendQuoteToClient,
  initiateSigningProcess,
  completeSigningProcess,
  createProjectFromQuote,
  processDepositPayment,
  getWorkflowStatus,
  getPipelineStats
} from './workflow.service.js';
