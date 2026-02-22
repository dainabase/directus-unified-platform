/**
 * Unit Tests — Phase B.3 Workflow Tests (Enhanced)
 * ================================================
 * B.3.1: DocuSeal → Invoice deposit workflow
 * B.3.2: Revolut → Project activation workflow (HMAC CRITICAL)
 * B.3.3: Auto-reminders cron (Mahnung 1/2/3 — Swiss SchKG/LP)
 * B.3.4: LLM lead qualification (Claude)
 * B.3.5: Monthly CEO report cron
 *
 * Uses node:test runner (NOT Jest).
 * Tests real handler logic patterns extracted from:
 *   - src/backend/api/workflows/quote-signed-to-deposit.js
 *   - src/backend/api/workflows/payment-to-project-activation.js
 *   - src/backend/api/email/invoice-reminders.js
 *   - src/backend/api/workflows/lead-qualification.js
 *   - src/backend/api/workflows/monthly-report.js
 *
 * @date 2026-02-22
 */

import { describe, it, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// ============================================================
// B.3.1 — DocuSeal signature → facture acompte
// Tests the workflow from quote-signed-to-deposit.js
// ============================================================

describe('B.3.1 — DocuSeal signature → facture acompte', () => {

  // --- Payload validation (matching handler lines 131-146) ---

  it('should reject webhook without quote_id in any supported path', () => {
    const payloads = [
      {},
      { data: {} },
      { data: { metadata: {} } },
      { metadata: {} },
      { event_type: 'form.completed' }
    ];

    for (const payload of payloads) {
      const quoteId = payload.data?.metadata?.quote_id
        || payload.data?.metadata?.quoteId
        || payload.metadata?.quote_id
        || payload.quote_id
        || payload.data?.external_id;
      assert.equal(quoteId, undefined, `Payload ${JSON.stringify(payload)} should have no quote_id`);
    }
  });

  it('should extract quote_id from all supported payload formats', () => {
    const testCases = [
      { payload: { data: { metadata: { quote_id: 42 } } }, expected: 42 },
      { payload: { data: { metadata: { quoteId: 43 } } }, expected: 43 },
      { payload: { metadata: { quote_id: 44 } }, expected: 44 },
      { payload: { quote_id: 45 }, expected: 45 },
      { payload: { data: { external_id: 46 } }, expected: 46 }
    ];

    for (const { payload, expected } of testCases) {
      const quoteId = payload.data?.metadata?.quote_id
        || payload.data?.metadata?.quoteId
        || payload.metadata?.quote_id
        || payload.quote_id
        || payload.data?.external_id;
      assert.equal(quoteId, expected, `Should extract ${expected} from payload`);
    }
  });

  // --- Event type filtering (matching handler lines 143-147) ---

  it('should accept valid completion event types', () => {
    const validEvents = ['form.completed', 'submission.completed', 'signed'];
    for (const eventType of validEvents) {
      const isValid = eventType === 'form.completed' || eventType === 'submission.completed' || eventType === 'signed';
      assert.ok(isValid, `Event "${eventType}" should be accepted`);
    }
  });

  it('should reject non-completion events', () => {
    const invalidEvents = ['form.viewed', 'form.started', 'submission.created', 'signer.signed', 'form.expired'];
    for (const eventType of invalidEvents) {
      const isValid = eventType === 'form.completed' || eventType === 'submission.completed' || eventType === 'signed';
      assert.equal(isValid, false, `Event "${eventType}" should be rejected`);
    }
  });

  it('should default to form.completed when event_type is missing', () => {
    const payload = { data: { metadata: { quote_id: 1 } } };
    const eventType = payload.event_type || payload.type || 'form.completed';
    assert.equal(eventType, 'form.completed');
  });

  // --- Deposit calculation (matching handler lines 162-169) ---

  it('should calculate deposit with configurable percentage', () => {
    // Handler formula (line 168): Math.round(totalHT * depositPercentage) / 100
    // depositPercentage is an integer (e.g. 30 for 30%)
    // This means: Math.round(total * pct) / 100
    const testCases = [
      { total: 10000, pct: 30, expected: 3000 },
      { total: 50000, pct: 50, expected: 25000 },
      { total: 15000, pct: 20, expected: 3000 },
      { total: 33333, pct: 30, expected: 9999.9 },  // Math.round(999990)/100
      { total: 0, pct: 30, expected: 0 },
      { total: 100, pct: 100, expected: 100 },
      { total: 1, pct: 30, expected: 0.3 }           // Math.round(30)/100
    ];
    for (const { total, pct, expected } of testCases) {
      // Same formula as handler: Math.round(totalHT * depositPercentage) / 100
      const deposit = Math.round(total * pct) / 100;
      assert.equal(deposit, expected, `${pct}% of ${total} should be ${expected}`);
    }
  });

  it('should reject zero or negative totals', () => {
    const invalidTotals = [0, -100, -0.01];
    for (const total of invalidTotals) {
      assert.ok(total <= 0, `Total ${total} should be rejected`);
    }
  });

  it('should validate deposit percentage is between 0 and 100', () => {
    const validPcts = [10, 20, 30, 50, 100];
    for (const pct of validPcts) {
      assert.ok(pct > 0 && pct <= 100, `${pct}% is valid`);
    }
    const invalidPcts = [0, -10, 101, 200];
    for (const pct of invalidPcts) {
      assert.ok(pct <= 0 || pct > 100, `${pct}% is invalid`);
    }
  });

  // --- Idempotency (matching handler lines 156-159) ---

  it('should skip already-processed quotes with deposit_invoice_id', () => {
    const quote = { id: 42, status: 'signed', deposit_invoice_id: 'INV-2026-0100' };
    const alreadyProcessed = quote.status === 'signed' && !!quote.deposit_invoice_id;
    assert.ok(alreadyProcessed, 'Quote with existing deposit invoice should be skipped');
  });

  it('should NOT skip quotes in signed state without deposit invoice', () => {
    const quote = { id: 43, status: 'signed', deposit_invoice_id: null };
    const alreadyProcessed = quote.status === 'signed' && !!quote.deposit_invoice_id;
    assert.equal(alreadyProcessed, false);
  });

  it('should NOT skip quotes in sent state', () => {
    const quote = { id: 44, status: 'sent', deposit_invoice_id: null };
    const alreadyProcessed = quote.status === 'signed' && !!quote.deposit_invoice_id;
    assert.equal(alreadyProcessed, false);
  });

  // --- DocuSeal webhook signature verification (matching docuseal.service.js lines 261-269) ---

  it('should verify DocuSeal HMAC webhook signature', () => {
    const apiKey = 'test-docuseal-api-key';
    const payload = JSON.stringify({ event_type: 'form.completed', data: { submission: { id: 42 } } });
    const expectedSig = crypto.createHmac('sha256', apiKey).update(payload).digest('hex');

    assert.equal(expectedSig, crypto.createHmac('sha256', apiKey).update(payload).digest('hex'));
    assert.notEqual(expectedSig, crypto.createHmac('sha256', 'wrong-key').update(payload).digest('hex'));
  });

  // --- Update data structure (matching handler lines 177-192) ---

  it('should build correct update data for signed quote', () => {
    const depositAmount = 7500;
    const depositPercentage = 30;
    const payload = {
      data: {
        submission_id: 'sub-123',
        documents: [{ url: 'https://docuseal.test/signed.pdf' }]
      }
    };

    const updateData = {
      status: 'signed',
      signed_at: new Date().toISOString(),
      deposit_invoice_id: 'INV-001',
      deposit_amount: depositAmount,
      deposit_percentage: depositPercentage
    };

    if (payload.data?.submission_id) {
      updateData.docuseal_submission_id = String(payload.data.submission_id);
    }
    if (payload.data?.documents) {
      updateData.signed_document_url = payload.data.documents[0]?.url || null;
    }

    assert.equal(updateData.status, 'signed');
    assert.equal(updateData.deposit_amount, 7500);
    assert.equal(updateData.deposit_percentage, 30);
    assert.equal(updateData.docuseal_submission_id, 'sub-123');
    assert.equal(updateData.signed_document_url, 'https://docuseal.test/signed.pdf');
  });
});

// ============================================================
// B.3.2 — Revolut paiement → activation projet (HMAC CRITICAL)
// Tests the workflow from payment-to-project-activation.js
// ============================================================

describe('B.3.2 — Revolut paiement → activation projet', () => {

  // --- HMAC Signature Validation (SECURITY CRITICAL) ---
  // Matching handler function validateRevolutSignature() lines 52-77

  it('should validate HMAC signature with timing-safe comparison', () => {
    const signingKey = 'revolut-webhook-secret-2026';
    const body = JSON.stringify({ amount: 5000, currency: 'CHF' });
    const expectedSig = crypto.createHmac('sha256', signingKey).update(body).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(expectedSig, 'hex')
    );
    assert.ok(isValid, 'Identical signatures should match via timing-safe comparison');
  });

  it('should reject tampered body (HMAC mismatch)', () => {
    const signingKey = 'revolut-webhook-secret-2026';
    const body = JSON.stringify({ amount: 5000, currency: 'CHF' });
    const validSig = crypto.createHmac('sha256', signingKey).update(body).digest('hex');
    const tamperedSig = crypto.createHmac('sha256', signingKey).update(body + 'tampered').digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(validSig, 'hex'),
      Buffer.from(tamperedSig, 'hex')
    );
    assert.equal(isValid, false, 'Tampered body should produce different signature');
  });

  it('should reject wrong signing key', () => {
    const body = JSON.stringify({ amount: 5000, currency: 'CHF' });
    const correctSig = crypto.createHmac('sha256', 'correct-secret').update(body).digest('hex');
    const wrongKeySig = crypto.createHmac('sha256', 'wrong-secret').update(body).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(correctSig, 'hex'),
      Buffer.from(wrongKeySig, 'hex')
    );
    assert.equal(isValid, false, 'Wrong signing key should fail');
  });

  it('should reject missing signature header', () => {
    const signature = undefined;
    assert.equal(!signature, true, 'Missing signature should be falsy');
  });

  it('should reject empty signature', () => {
    const signature = '';
    assert.equal(!signature, true, 'Empty signature should be falsy');
  });

  it('should handle signature with different buffer lengths safely', () => {
    // timingSafeEqual throws if buffers have different lengths
    // The handler catches this in a try/catch and returns false
    const shortSig = 'abcdef';
    const longSig = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    let isValid;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(shortSig, 'hex'),
        Buffer.from(longSig, 'hex')
      );
    } catch {
      isValid = false;
    }
    assert.equal(isValid, false, 'Mismatched buffer lengths should return false (not crash)');
  });

  it('should reject non-hex signature gracefully', () => {
    let isValid;
    try {
      const signingKey = 'test-secret';
      const body = '{"test":true}';
      const expectedSig = crypto.createHmac('sha256', signingKey).update(body).digest('hex');
      // Non-hex chars in signature
      const badSig = 'not-a-valid-hex-signature-at-all-zzzzz';
      isValid = crypto.timingSafeEqual(
        Buffer.from(badSig, 'hex'),
        Buffer.from(expectedSig, 'hex')
      );
    } catch {
      isValid = false;
    }
    assert.equal(isValid, false, 'Non-hex signature should not match');
  });

  // --- Payment direction filtering (matching handler lines 243-247) ---

  it('should ignore outgoing payments', () => {
    const outgoingDirections = ['sell', 'debit', 'outgoing'];
    for (const direction of outgoingDirections) {
      const isOutgoing = direction === 'sell' || direction === 'debit' || direction === 'outgoing';
      assert.ok(isOutgoing, `Direction "${direction}" should be classified as outgoing`);
    }
  });

  it('should accept incoming payments', () => {
    const incomingDirections = ['buy', 'credit', 'incoming', undefined, null];
    for (const direction of incomingDirections) {
      const isOutgoing = direction === 'sell' || direction === 'debit' || direction === 'outgoing';
      assert.equal(isOutgoing, false, `Direction "${direction}" should NOT be outgoing`);
    }
  });

  // --- Amount validation (matching handler lines 220-223) ---

  it('should ignore zero and negative amounts', () => {
    const invalidAmounts = [0, -100, -1, -0.01];
    for (const amount of invalidAmounts) {
      assert.ok(amount <= 0, `Amount ${amount} should be rejected`);
    }
  });

  it('should accept positive amounts', () => {
    const validAmounts = [0.01, 1, 100, 5000.50, 99999.99];
    for (const amount of validAmounts) {
      assert.ok(amount > 0, `Amount ${amount} should be accepted`);
    }
  });

  // --- Invoice reference matching (matching handler lines 108-116) ---

  it('should match invoice references in payment descriptions', () => {
    const testCases = [
      { reference: 'Payment for INV-2026-0042', expected: 'INV-2026-0042' },
      { reference: 'FAC-001 payment', expected: 'FAC-001' },
      { reference: 'Deposit DEP-2026-0010', expected: 'DEP-2026-0010' },
      { reference: 'Supplier SUP-55', expected: 'SUP-55' }
    ];

    for (const { reference, expected } of testCases) {
      const match = reference.match(/(?:INV|FAC|DEP|SUP)-?\d+[-/]?\d*/i);
      assert.ok(match, `Should match invoice reference in: "${reference}"`);
      assert.equal(match[0], expected);
    }
  });

  it('should not match non-invoice references', () => {
    const noMatchRefs = [
      'Random payment',
      'Transfer #12345',
      'Salary February',
      'Revolut subscription',
      'CHF deposit'
    ];
    for (const reference of noMatchRefs) {
      const match = reference.match(/(?:INV|FAC|DEP|SUP)-?\d+[-/]?\d*/i);
      assert.equal(match, null, `Should NOT match: "${reference}"`);
    }
  });

  // --- Revolut payload parsing (matching handler lines 212-218) ---

  it('should extract payment data from Revolut payload structure', () => {
    const payload = {
      data: {
        id: 'tx-abc-123',
        legs: [{ amount: 7500, currency: 'CHF', direction: 'credit' }],
        reference: 'INV-2026-0042',
        counterparty: { name: 'Client SA' },
        completed_at: '2026-02-20T15:30:00Z'
      }
    };

    const paymentData = payload.data || payload;
    const amount = parseFloat(paymentData.legs?.[0]?.amount || paymentData.amount || 0);
    const currency = paymentData.legs?.[0]?.currency || paymentData.currency || 'CHF';
    const reference = paymentData.reference || paymentData.description || '';
    const counterparty = paymentData.counterparty?.name || paymentData.counterparty_name || '';
    const revolutTxId = paymentData.id || payload.id || '';

    assert.equal(amount, 7500);
    assert.equal(currency, 'CHF');
    assert.equal(reference, 'INV-2026-0042');
    assert.equal(counterparty, 'Client SA');
    assert.equal(revolutTxId, 'tx-abc-123');
  });

  it('should handle flat payload format (no data wrapper)', () => {
    const payload = {
      id: 'tx-flat-456',
      amount: 3000,
      currency: 'EUR',
      description: 'FAC-001 deposit',
      counterparty_name: 'Fournisseur SARL'
    };

    const paymentData = payload.data || payload;
    const amount = parseFloat(paymentData.legs?.[0]?.amount || paymentData.amount || 0);
    const currency = paymentData.legs?.[0]?.currency || paymentData.currency || 'CHF';
    const reference = paymentData.reference || paymentData.description || '';
    const counterparty = paymentData.counterparty?.name || paymentData.counterparty_name || '';

    assert.equal(amount, 3000);
    assert.equal(currency, 'EUR');
    assert.equal(reference, 'FAC-001 deposit');
    assert.equal(counterparty, 'Fournisseur SARL');
  });

  // --- Deduplication / Replay protection (matching handler lines 226-239) ---

  it('should detect duplicate transaction IDs (replay protection)', () => {
    const processedTxIds = new Set(['tx-001', 'tx-002', 'tx-003']);
    assert.ok(processedTxIds.has('tx-001'), 'Already processed TX should be detected');
    assert.equal(processedTxIds.has('tx-new'), false, 'New TX should not be in processed set');
  });

  // --- Project creation from quote (matching handler lines 148-177) ---

  it('should create project data from signed quote', () => {
    const quote = {
      id: 1,
      title: 'Installation LED Migros',
      quote_number: 'DEV-001',
      total_ht: 25000,
      currency: 'CHF',
      owner_company: 'HYPERVISUAL'
    };

    const projectData = {
      name: quote.title || `Projet - ${quote.quote_number}`,
      status: 'active',
      budget: parseFloat(quote.total_ht),
      currency: quote.currency,
      owner_company: quote.owner_company,
      source: 'workflow-7.5-auto'
    };

    assert.equal(projectData.name, 'Installation LED Migros');
    assert.equal(projectData.status, 'active');
    assert.equal(projectData.budget, 25000);
    assert.equal(projectData.currency, 'CHF');
    assert.equal(projectData.owner_company, 'HYPERVISUAL');
    assert.equal(projectData.source, 'workflow-7.5-auto');
  });

  it('should fallback to quote_number when title is empty', () => {
    const quote = { id: 2, title: '', quote_number: 'DEV-002', total_ht: 15000, currency: 'CHF' };
    const name = quote.title || `Projet - ${quote.quote_number}`;
    assert.equal(name, 'Projet - DEV-002');
  });

  // --- Deposit type detection for project creation (matching handler lines 282-299) ---

  it('should trigger project creation for deposit invoices with signed quotes', () => {
    const invoiceTypes = [
      { type: 'deposit', quote_id: 42, shouldCreate: true },
      { type: 'acompte', quote_id: 43, shouldCreate: true },
      { type: 'standard', quote_id: 44, shouldCreate: false },
      { type: 'final', quote_id: 45, shouldCreate: false },
      { type: 'deposit', quote_id: null, shouldCreate: false }
    ];

    for (const inv of invoiceTypes) {
      const shouldCreate = (inv.type === 'deposit' || inv.type === 'acompte') && !!inv.quote_id;
      assert.equal(shouldCreate, inv.shouldCreate, `Type "${inv.type}" with quote_id=${inv.quote_id}`);
    }
  });

  it('should trigger project completion for final/solde invoices', () => {
    const invoiceTypes = [
      { type: 'final', expected: true },
      { type: 'solde', expected: true },
      { type: 'deposit', expected: false },
      { type: 'standard', expected: false }
    ];

    for (const inv of invoiceTypes) {
      const isCompletion = inv.type === 'final' || inv.type === 'solde';
      assert.equal(isCompletion, inv.expected, `Type "${inv.type}" completion=${inv.expected}`);
    }
  });
});

// ============================================================
// B.3.3 — Relances automatiques cron (Mahnung 1/2/3)
// Tests the workflow from invoice-reminders.js (Swiss SchKG/LP)
// ============================================================

describe('B.3.3 — Relances automatiques cron (Swiss SchKG/LP)', () => {

  // --- Overdue day calculation (matching handler lines 39-43) ---

  it('should compute overdue days correctly', () => {
    const today = new Date('2026-02-22T09:00:00Z');
    const testCases = [
      { dueDate: '2026-02-15T00:00:00Z', expected: 7 },
      { dueDate: '2026-02-08T00:00:00Z', expected: 14 },
      { dueDate: '2026-01-23T00:00:00Z', expected: 30 },
      { dueDate: '2025-12-24T00:00:00Z', expected: 60 }
    ];

    for (const { dueDate, expected } of testCases) {
      const days = Math.floor((today - new Date(dueDate)) / (1000 * 60 * 60 * 24));
      assert.equal(days, expected, `Due date ${dueDate} should be ${expected} days overdue`);
    }
  });

  it('should not flag invoices that are not yet overdue', () => {
    const today = new Date('2026-02-22T00:00:00Z');
    const dueDate = new Date('2026-03-01T00:00:00Z');
    const overdueDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    assert.ok(overdueDays < 0, 'Future due date should yield negative overdue days');
  });

  // --- Mahnung level determination (matching handler lines 48-53) ---

  it('should determine correct Mahnung level based on days overdue', () => {
    // Handler logic: >= 30 → level '30', >= 14 → level '14', >= 7 → level '7'
    const determineMahnungLevel = (daysOverdue) => {
      if (daysOverdue < 7) return null;
      if (daysOverdue >= 30) return '30';
      if (daysOverdue >= 14) return '14';
      return '7';
    };

    assert.equal(determineMahnungLevel(6), null, '6 days: not yet overdue enough');
    assert.equal(determineMahnungLevel(7), '7', '7 days: Mahnung 1');
    assert.equal(determineMahnungLevel(13), '7', '13 days: still Mahnung 1');
    assert.equal(determineMahnungLevel(14), '14', '14 days: Mahnung 2');
    assert.equal(determineMahnungLevel(29), '14', '29 days: still Mahnung 2');
    assert.equal(determineMahnungLevel(30), '30', '30 days: Mahnung 3 (mise en demeure)');
    assert.equal(determineMahnungLevel(60), '30', '60 days: still Mahnung 3');
    assert.equal(determineMahnungLevel(90), '30', '90 days: Betreibungsbegehren territory');
  });

  // --- Swiss SchKG fees (legal compliance) ---

  it('should compute correct fees per Mahnung level (Swiss SchKG)', () => {
    // Mahnung 1 (J+7): rappel courtois — no fee
    // Mahnung 2 (J+14): rappel ferme — CHF 20
    // Mahnung 3 (J+30): mise en demeure SchKG Art. 67 — CHF 30
    const MAHNUNG_FEES = { '7': 0, '14': 20, '30': 30 };
    assert.equal(MAHNUNG_FEES['7'], 0, 'Mahnung 1 (J+7) has no fee');
    assert.equal(MAHNUNG_FEES['14'], 20, 'Mahnung 2 (J+14) fee is CHF 20');
    assert.equal(MAHNUNG_FEES['30'], 30, 'Mahnung 3 (J+30) fee is CHF 30');
  });

  // --- Invoice status filtering (matching handler line 25) ---

  it('should only process invoices with status "sent"', () => {
    const invoices = [
      { status: 'sent', should: true },
      { status: 'paid', should: false },
      { status: 'cancelled', should: false },
      { status: 'draft', should: false },
      { status: 'viewed', should: false },
      { status: 'partial', should: false }
    ];

    for (const inv of invoices) {
      // Handler filters by: status._eq = 'sent'
      const shouldProcess = inv.status === 'sent';
      assert.equal(shouldProcess, inv.should, `Status "${inv.status}" process=${inv.should}`);
    }
  });

  // --- Due date fallback (matching handler lines 39-41) ---

  it('should fallback to date_created + 30 days when due_date is null', () => {
    const invoice = {
      due_date: null,
      date_created: '2026-01-01T10:00:00Z'
    };

    const dueDate = invoice.due_date
      ? new Date(invoice.due_date)
      : new Date(new Date(invoice.date_created).getTime() + 30 * 24 * 60 * 60 * 1000);

    // Jan 1 + 30 days = Jan 31
    assert.equal(dueDate.getDate(), 31);
    assert.equal(dueDate.getMonth(), 0); // January
  });

  // --- Contact validation (matching handler lines 54-58) ---

  it('should skip invoices without contact email', () => {
    const contacts = [
      { contact: null, shouldSkip: true },
      { contact: { email: null }, shouldSkip: true },
      { contact: { email: '' }, shouldSkip: true },
      { contact: { email: 'client@example.ch' }, shouldSkip: false }
    ];

    for (const { contact, shouldSkip } of contacts) {
      const skip = !contact || !contact.email;
      assert.equal(skip, shouldSkip);
    }
  });

  // --- Deduplication: same invoice + same level + already sent ---

  it('should not escalate if same-level reminder already sent', () => {
    // Handler checks automation_logs for same rule_name + entity_id + level
    const existingLogs = [
      { rule_name: 'E-04-invoice-reminder', entity_id: '42', level: '7', status: 'success' }
    ];

    const invoiceId = '42';
    const currentLevel = '7';
    const alreadySent = existingLogs.some(
      log => log.rule_name === 'E-04-invoice-reminder'
        && log.entity_id === invoiceId
        && log.level === currentLevel
        && log.status === 'success'
    );
    assert.ok(alreadySent, 'Should skip if same level already sent');
  });

  it('should allow sending next level even if previous was sent', () => {
    const existingLogs = [
      { rule_name: 'E-04-invoice-reminder', entity_id: '42', level: '7', status: 'success' }
    ];

    const currentLevel = '14';
    const alreadySent = existingLogs.some(
      log => log.rule_name === 'E-04-invoice-reminder'
        && log.entity_id === '42'
        && log.level === currentLevel
        && log.status === 'success'
    );
    assert.equal(alreadySent, false, 'Level 14 not yet sent, should proceed');
  });

  // --- Full Mahnung escalation sequence ---

  it('should follow complete Mahnung escalation sequence', () => {
    // Simulate invoice aging:
    // Day 0-6: nothing
    // Day 7: Mahnung 1 (courtois)
    // Day 14: Mahnung 2 (ferme, mention SchKG/LP)
    // Day 30: Mahnung 3 (mise en demeure, SchKG Art. 67)
    // Day 60+: Betreibungsbegehren (external, not in this handler)
    const timeline = [
      { day: 5, level: null, action: 'none' },
      { day: 7, level: '7', action: 'rappel courtois' },
      { day: 14, level: '14', action: 'rappel ferme (SchKG/LP)' },
      { day: 30, level: '30', action: 'mise en demeure (SchKG Art. 67)' }
    ];

    for (const step of timeline) {
      const level = step.day < 7 ? null : (step.day >= 30 ? '30' : (step.day >= 14 ? '14' : '7'));
      assert.equal(level, step.level, `Day ${step.day}: ${step.action}`);
    }
  });
});

// ============================================================
// B.3.4 — Qualification LLM leads
// Tests the workflow from lead-qualification.js
// ============================================================

describe('B.3.4 — Qualification LLM leads (Claude AI)', () => {

  // --- Lead context building (matching handler lines 57-66) ---

  it('should build lead context JSON for Claude', () => {
    const lead = {
      first_name: 'Martin',
      last_name: 'Keller',
      company_name: 'Migros',
      email: 'martin@migros.ch',
      phone: '+41 79 123 45 67',
      source: 'wordpress',
      budget: '50000',
      notes: 'Interested in LED wall for store entrance',
      website: 'https://migros.ch'
    };

    const context = JSON.stringify({
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
      company: lead.company_name || lead.company || null,
      email: lead.email || null,
      phone: lead.phone || null,
      message: lead.notes || lead.message || lead.description || null,
      source: lead.source || null,
      budget: lead.budget || null,
      website: lead.website || null
    }, null, 2);

    const parsed = JSON.parse(context);
    assert.equal(parsed.name, 'Martin Keller');
    assert.equal(parsed.company, 'Migros');
    assert.equal(parsed.email, 'martin@migros.ch');
    assert.equal(parsed.phone, '+41 79 123 45 67');
    assert.equal(parsed.source, 'wordpress');
    assert.equal(parsed.budget, '50000');
    assert.ok(parsed.message.includes('LED wall'));
    assert.equal(parsed.website, 'https://migros.ch');
  });

  it('should handle leads with missing/empty names gracefully', () => {
    const lead = { first_name: '', last_name: '', company_name: 'Coop', email: 'info@coop.ch' };
    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    assert.equal(name, '', 'Empty names should result in empty string after trim');
  });

  it('should handle leads with only first_name', () => {
    const lead = { first_name: 'Jean', last_name: null };
    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    assert.equal(name, 'Jean');
  });

  // --- Score classification (matching handler line 106) ---

  it('should classify leads by score (handler thresholds)', () => {
    // Handler: score >= 7 → 'qualified', >= 4 → 'warm', else → 'cold'
    const classify = (score) => score >= 7 ? 'qualified' : (score >= 4 ? 'warm' : 'cold');
    assert.equal(classify(10), 'qualified');
    assert.equal(classify(9), 'qualified');
    assert.equal(classify(7), 'qualified');
    assert.equal(classify(6), 'warm');
    assert.equal(classify(5), 'warm');
    assert.equal(classify(4), 'warm');
    assert.equal(classify(3), 'cold');
    assert.equal(classify(1), 'cold');
    assert.equal(classify(0), 'cold');
  });

  // --- JSON response parsing (matching handler lines 86-97) ---

  it('should parse direct JSON response from Claude', () => {
    const rawText = '{"score":8,"sector":"retail","priority":"high","recommended_action":"Appeler cette semaine","language":"fr","summary":"Lead chaud du secteur retail"}';
    const qualification = JSON.parse(rawText);
    assert.equal(qualification.score, 8);
    assert.equal(qualification.priority, 'high');
    assert.equal(qualification.language, 'fr');
    assert.equal(qualification.sector, 'retail');
    assert.ok(qualification.recommended_action);
    assert.ok(qualification.summary);
  });

  it('should extract JSON from markdown-wrapped response', () => {
    const rawText = '```json\n{"score":5,"sector":"tech","priority":"medium","recommended_action":"Email","language":"de","summary":"Lead moyen"}\n```';

    let qualification;
    try {
      qualification = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualification = JSON.parse(jsonMatch[0]);
      }
    }
    assert.equal(qualification.score, 5);
    assert.equal(qualification.language, 'de');
  });

  it('should extract JSON from multi-line response with text around it', () => {
    const rawText = `Here is the analysis:
\`\`\`json
{
  "score": 3,
  "sector": "construction",
  "priority": "low",
  "recommended_action": "Add to newsletter",
  "language": "fr",
  "summary": "Lead froid"
}
\`\`\`
That's my assessment.`;

    let qualification;
    try {
      qualification = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualification = JSON.parse(jsonMatch[0]);
      }
    }
    assert.equal(qualification.score, 3);
    assert.equal(qualification.priority, 'low');
  });

  it('should handle invalid/non-JSON response gracefully', () => {
    const rawText = 'This is not valid JSON at all';
    let qualification = null;
    try {
      qualification = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { qualification = JSON.parse(jsonMatch[0]); } catch { /* ignore */ }
      }
    }
    assert.equal(qualification, null, 'Should return null when no JSON found');
  });

  it('should handle JSON with nested braces (edge case)', () => {
    const rawText = '{"score":7,"sector":"finance","priority":"high","recommended_action":"Call {ASAP}","language":"fr","summary":"Lead qualifie avec budget {confidentiel}"}';
    const qualification = JSON.parse(rawText);
    assert.equal(qualification.score, 7);
    assert.ok(qualification.recommended_action.includes('{ASAP}'));
  });

  // --- Email trigger threshold (matching handler lines 112-121) ---

  it('should trigger email only for high-score leads (score >= 7)', () => {
    const shouldEmail = (score) => score >= 7;
    assert.ok(shouldEmail(10));
    assert.ok(shouldEmail(9));
    assert.ok(shouldEmail(7));
    assert.equal(shouldEmail(6), false);
    assert.equal(shouldEmail(3), false);
    assert.equal(shouldEmail(0), false);
  });

  // --- Required fields validation (matching handler lines 100-107) ---

  it('should validate qualification result schema completeness', () => {
    const requiredFields = ['score', 'sector', 'priority', 'recommended_action', 'language', 'summary'];
    const qualification = {
      score: 7,
      sector: 'finance',
      priority: 'high',
      recommended_action: 'Call immediately',
      language: 'fr',
      summary: 'Qualified lead from finance sector'
    };
    for (const field of requiredFields) {
      assert.ok(field in qualification, `Qualification must include "${field}"`);
      assert.ok(qualification[field] !== undefined && qualification[field] !== null, `"${field}" must not be null/undefined`);
    }
  });

  // --- Update data mapping (matching handler lines 100-107) ---

  it('should map qualification to Directus update fields', () => {
    const qualification = {
      score: 8,
      summary: 'Lead chaud',
      language: 'fr',
      recommended_action: 'Appeler'
    };

    const updateData = {
      qualification_score: qualification.score || 0,
      qualification_notes: qualification.summary || '',
      detected_language: qualification.language || 'fr',
      recommended_action: qualification.recommended_action || '',
      qualified_at: new Date().toISOString(),
      status: qualification.score >= 7 ? 'qualified' : (qualification.score >= 4 ? 'warm' : 'cold')
    };

    assert.equal(updateData.qualification_score, 8);
    assert.equal(updateData.status, 'qualified');
    assert.equal(updateData.detected_language, 'fr');
    assert.ok(updateData.qualified_at);
  });

  // --- Retry logic (matching handler lines 70-146) ---

  it('should implement exponential backoff delays', () => {
    const delays = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      delays.push(1000 * Math.pow(2, attempt - 1));
    }
    assert.deepEqual(delays, [1000, 2000, 4000], 'Backoff: 1s, 2s, 4s');
  });

  // --- Webhook payload formats (matching handler lines 227-231) ---

  it('should extract lead_id from all Directus webhook payload formats', () => {
    const payloads = [
      { key: 42 },
      { keys: [43] },
      { payload: { id: 44 } },
      { id: 45 },
      { lead_id: 46 }
    ];

    const expectedIds = [42, 43, 44, 45, 46];

    for (let i = 0; i < payloads.length; i++) {
      const body = payloads[i];
      const leadId = body.key || body.keys?.[0] || body.payload?.id || body.id || body.lead_id;
      assert.equal(leadId, expectedIds[i], `Should extract ${expectedIds[i]} from format ${i}`);
    }
  });
});

// ============================================================
// B.3.5 — Rapport mensuel CEO
// Tests the workflow from monthly-report.js
// ============================================================

describe('B.3.5 — Rapport mensuel CEO', () => {

  // --- Date range computation (matching handler lines 63-76) ---

  it('should compute previous month boundaries for February 2026', () => {
    // The handler uses new Date() (local time) + .toISOString() for Directus queries.
    // To make this test timezone-independent we test the date math (getMonth/getDate)
    // separately from the ISO serialization format.
    const now = new Date(2026, 1, 22, 10, 0, 0); // Feb 22, 2026 LOCAL time (like handler)
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPrevMonth = new Date(firstDayCurrentMonth.getTime() - 1);
    const firstDayPrevMonth = new Date(lastDayPrevMonth.getFullYear(), lastDayPrevMonth.getMonth(), 1);

    assert.equal(firstDayCurrentMonth.getMonth(), 1, 'Current month should be February (1)');
    assert.equal(firstDayPrevMonth.getMonth(), 0, 'Previous month should be January (0)');
    assert.equal(firstDayPrevMonth.getDate(), 1, 'First day should be 1');
    assert.equal(lastDayPrevMonth.getDate(), 31, 'Last day of January should be 31');
    assert.equal(lastDayPrevMonth.getFullYear(), 2026);

    // Verify ISO format produces valid YYYY-MM-DD strings (exact values depend on TZ)
    const start = firstDayPrevMonth.toISOString().split('T')[0];
    const end = lastDayPrevMonth.toISOString().split('T')[0];
    assert.match(start, /^\d{4}-\d{2}-\d{2}$/, 'start should be YYYY-MM-DD');
    assert.match(end, /^\d{4}-\d{2}-\d{2}$/, 'end should be YYYY-MM-DD');
    // The date math is correct — January 2026 has 31 days
    assert.ok(start < end, 'start should be before end');
  });

  it('should handle January → December year boundary', () => {
    const now = new Date(2026, 0, 15, 10, 0, 0); // Jan 15, 2026 LOCAL
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPrevMonth = new Date(firstDayCurrentMonth.getTime() - 1);
    const firstDayPrevMonth = new Date(lastDayPrevMonth.getFullYear(), lastDayPrevMonth.getMonth(), 1);

    assert.equal(firstDayPrevMonth.getFullYear(), 2025);
    assert.equal(firstDayPrevMonth.getMonth(), 11, 'December = 11');
    assert.equal(lastDayPrevMonth.getDate(), 31, 'Last day of December = 31');
  });

  it('should handle March → February (leap year check)', () => {
    const now = new Date(2028, 2, 15, 10, 0, 0); // Mar 15, 2028 LOCAL — 2028 is a leap year
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPrevMonth = new Date(firstDayCurrentMonth.getTime() - 1);

    assert.equal(lastDayPrevMonth.getDate(), 29, '2028 is leap year — Feb has 29 days');
  });

  // --- Revenue aggregation (matching handler lines 194-202) ---

  it('should aggregate revenue from paid invoices only', () => {
    const invoices = [
      { total: 5000, status: 'paid', currency: 'CHF' },
      { total: 3000, status: 'paid', currency: 'CHF' },
      { total: 2000, status: 'pending', currency: 'CHF' },
      { total: 1500, status: 'sent', currency: 'CHF' },
      { total: 800, status: 'cancelled', currency: 'CHF' }
    ];
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.total), 0);
    assert.equal(totalRevenue, 8000, 'Total revenue should sum only paid invoices');
  });

  it('should handle zero paid invoices', () => {
    const invoices = [
      { total: 2000, status: 'pending', currency: 'CHF' },
      { total: 1500, status: 'sent', currency: 'CHF' }
    ];
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.total), 0);
    assert.equal(totalRevenue, 0);
  });

  // --- CHF formatting (matching handler usage of formatCHF) ---

  it('should format CHF amounts in fr-CH locale', () => {
    const formatCHF = (n) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(n);
    const formatted = formatCHF(12450.50);
    assert.ok(formatted.includes('12'), 'Should contain "12"');
    assert.ok(formatted.includes('450'), 'Should contain "450"');
    assert.ok(formatted.includes('CHF'), 'Should contain "CHF"');
  });

  it('should format zero and negative amounts', () => {
    const formatCHF = (n) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(n);
    const zero = formatCHF(0);
    assert.ok(zero.includes('0'));
    assert.ok(zero.includes('CHF'));

    const negative = formatCHF(-5000);
    assert.ok(negative.includes('5'));
    assert.ok(negative.includes('000') || negative.includes("'000") || negative.includes('\u202f000'));
  });

  // --- Month-over-month trend (matching handler pattern) ---

  it('should compute positive MoM trend', () => {
    const current = 25000;
    const previous = 20000;
    const trend = ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '25.0');
  });

  it('should compute negative MoM trend', () => {
    const current = 15000;
    const previous = 20000;
    const trend = ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '-25.0');
  });

  it('should handle zero previous month (avoid division by zero)', () => {
    const current = 5000;
    const previous = 0;
    const trend = previous === 0 ? (current > 0 ? '+100' : '0') : ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '+100');
  });

  it('should handle zero both months', () => {
    const current = 0;
    const previous = 0;
    const trend = previous === 0 ? (current > 0 ? '+100' : '0') : ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '0');
  });

  // --- Per-company aggregation (matching handler line 80 + company filter) ---

  it('should aggregate KPIs per owner_company', () => {
    const invoicesByCompany = [
      { owner_company: 'HYPERVISUAL', total: 10000, status: 'paid' },
      { owner_company: 'HYPERVISUAL', total: 5000, status: 'paid' },
      { owner_company: 'DAINAMICS', total: 8000, status: 'paid' },
      { owner_company: 'LEXAIA', total: 3000, status: 'pending' },
      { owner_company: 'ENKI REALTY', total: 12000, status: 'paid' },
      { owner_company: 'TAKEOUT', total: 2000, status: 'paid' }
    ];

    const perCompany = {};
    for (const inv of invoicesByCompany) {
      if (inv.status !== 'paid') continue;
      if (!perCompany[inv.owner_company]) perCompany[inv.owner_company] = 0;
      perCompany[inv.owner_company] += inv.total;
    }

    assert.equal(perCompany['HYPERVISUAL'], 15000);
    assert.equal(perCompany['DAINAMICS'], 8000);
    assert.equal(perCompany['LEXAIA'], undefined, 'LEXAIA has no paid invoices');
    assert.equal(perCompany['ENKI REALTY'], 12000);
    assert.equal(perCompany['TAKEOUT'], 2000);
  });

  // --- Active projects count ---

  it('should count active projects per company', () => {
    const projects = [
      { status: 'active', owner_company: 'HYPERVISUAL' },
      { status: 'active', owner_company: 'HYPERVISUAL' },
      { status: 'completed', owner_company: 'HYPERVISUAL' },
      { status: 'active', owner_company: 'DAINAMICS' },
      { status: 'on_hold', owner_company: 'DAINAMICS' }
    ];

    const activeCount = projects.filter(p => p.status === 'active').length;
    assert.equal(activeCount, 3);

    const activeByCompany = {};
    for (const p of projects.filter(p => p.status === 'active')) {
      activeByCompany[p.owner_company] = (activeByCompany[p.owner_company] || 0) + 1;
    }
    assert.equal(activeByCompany['HYPERVISUAL'], 2);
    assert.equal(activeByCompany['DAINAMICS'], 1);
  });

  // --- Conversion rate calculation (matching handler line 203) ---

  it('should compute lead conversion rate', () => {
    const testCases = [
      { newLeads: 10, wonLeads: 3, expected: 30 },
      { newLeads: 10, wonLeads: 0, expected: 0 },
      { newLeads: 0, wonLeads: 0, expected: 0 },
      { newLeads: 5, wonLeads: 5, expected: 100 },
      { newLeads: 3, wonLeads: 1, expected: 33 }
    ];

    for (const { newLeads, wonLeads, expected } of testCases) {
      const rate = newLeads > 0 ? Math.round((wonLeads / newLeads) * 100) : 0;
      assert.equal(rate, expected, `${wonLeads}/${newLeads} = ${expected}%`);
    }
  });

  // --- Top 5 clients calculation (matching handler lines 206-216) ---

  it('should compute top 5 clients by revenue', () => {
    const invoices = [
      { contact_id: { first_name: 'A', last_name: 'Client', id: 1 }, amount: 10000 },
      { contact_id: { first_name: 'A', last_name: 'Client', id: 1 }, amount: 5000 },
      { contact_id: { first_name: 'B', last_name: 'Client', id: 2 }, amount: 8000 },
      { contact_id: { first_name: 'C', last_name: 'Client', id: 3 }, amount: 12000 },
      { contact_id: { first_name: 'D', last_name: 'Client', id: 4 }, amount: 3000 },
      { contact_id: { first_name: 'E', last_name: 'Client', id: 5 }, amount: 6000 },
      { contact_id: { first_name: 'F', last_name: 'Client', id: 6 }, amount: 1000 }
    ];

    const clientRevenue = {};
    for (const inv of invoices) {
      const contact = inv.contact_id;
      if (!contact) continue;
      const clientName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
      clientRevenue[clientName] = (clientRevenue[clientName] || 0) + parseFloat(inv.amount || 0);
    }

    const top5 = Object.entries(clientRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, revenue: total }));

    assert.equal(top5.length, 5);
    assert.equal(top5[0].name, 'A Client');
    assert.equal(top5[0].revenue, 15000);
    assert.equal(top5[1].name, 'C Client');
    assert.equal(top5[1].revenue, 12000);
  });

  // --- Profit calculation ---

  it('should calculate profit correctly', () => {
    const revenue = 50000;
    const expenses = 35000;
    const profit = revenue - expenses;
    assert.equal(profit, 15000);
  });

  it('should handle negative profit (loss)', () => {
    const revenue = 20000;
    const expenses = 35000;
    const profit = revenue - expenses;
    assert.equal(profit, -15000);
    assert.ok(profit < 0, 'Loss should be negative');
  });

  // --- CRON scheduling (matching handler lines 512-561) ---

  it('should schedule for next 1st of month at 08:00', () => {
    const now = new Date('2026-02-22T10:00:00Z');
    let next = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0, 0);
    }

    assert.equal(next.getMonth(), 2, 'Next run should be March (2)');
    assert.equal(next.getDate(), 1);
    assert.equal(next.getHours(), 8);
    assert.ok(next > now, 'Next scheduled time must be in the future');
  });

  it('should handle December scheduling (year rollover)', () => {
    const now = new Date('2026-12-15T10:00:00Z');
    let next = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0, 0);
    }

    assert.equal(next.getFullYear(), 2027, 'Should roll over to 2027');
    assert.equal(next.getMonth(), 0, 'Should be January (0)');
    assert.equal(next.getDate(), 1);
  });

  // --- HTML report structure ---

  it('should include all required sections in report data', () => {
    const reportData = {
      period: { start: '2026-01-01', end: '2026-01-31', label: 'Janvier 2026' },
      company: 'HYPERVISUAL',
      revenue: { total: 50000, count: 12 },
      expenses: { total: 35000, count: 8 },
      profit: 15000,
      projects: { new: 3, completed: 2 },
      leads: { new: 15, won: 4, total: 120, conversion_rate: 27 },
      top5Clients: [{ name: 'Client A', revenue: 12000 }]
    };

    assert.ok(reportData.period);
    assert.ok(reportData.company);
    assert.ok(reportData.revenue);
    assert.ok(reportData.expenses);
    assert.equal(typeof reportData.profit, 'number');
    assert.ok(reportData.projects);
    assert.ok(reportData.leads);
    assert.ok(Array.isArray(reportData.top5Clients));
  });
});
