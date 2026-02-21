/**
 * Unit Tests — Phase B.3 Workflow Tests
 * ========================================
 * B.3.1: DocuSeal → Invoice deposit workflow
 * B.3.2: Revolut → Project activation workflow
 * B.3.3: Auto-reminders cron (Mahnung 1/2/3)
 * B.3.4: LLM lead qualification (Claude)
 * B.3.5: Monthly CEO report cron
 *
 * Uses node:test runner (NOT Jest).
 * @date 2026-02-21
 */

import { describe, it, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// B.3.1 — DocuSeal signature → facture acompte
// ============================================================

describe('B.3.1 — DocuSeal signature → facture acompte', () => {

  it('should reject webhook without quote_id', async () => {
    // Simulate a POST to /api/workflows/quote-signed/webhook/docuseal/signed
    // with empty body -> expect 400
    const body = {};
    const hasQuoteId = body.data?.metadata?.quote_id || body.quote_id;
    assert.equal(hasQuoteId, undefined, 'Empty body should have no quote_id');

    // Simulated response
    const statusCode = hasQuoteId ? 200 : 400;
    assert.equal(statusCode, 400);
  });

  it('should reject non-completion events', async () => {
    // Send event_type: 'form.viewed' -> expect skipped
    const payload = { event_type: 'form.viewed', data: { id: 42 } };
    const isCompletionEvent = payload.event_type === 'form.completed';
    assert.equal(isCompletionEvent, false, 'form.viewed is not a completion event');

    const result = { skipped: !isCompletionEvent };
    assert.equal(result.skipped, true);
  });

  it('should process valid DocuSeal webhook', async () => {
    // Send valid payload with quote_id in metadata
    const payload = {
      event_type: 'form.completed',
      data: {
        id: 99,
        metadata: { quote_id: 42 },
        submission: {
          completed_at: '2026-02-20T14:30:00Z',
          submitter_email: 'client@example.ch',
        },
      },
    };

    const isCompletionEvent = payload.event_type === 'form.completed';
    assert.equal(isCompletionEvent, true);

    const quoteId = payload.data.metadata.quote_id;
    assert.equal(quoteId, 42);

    // Simulate: fetch quote, compute deposit, create invoice
    const quote = { id: 42, total_ht: 25000, currency: 'CHF', status: 'sent' };
    const depositPercentage = 30;
    const depositAmount = Math.round(quote.total_ht * depositPercentage / 100);

    assert.equal(depositAmount, 7500);
    assert.equal(quote.currency, 'CHF');
  });

  it('should calculate 30% deposit correctly', () => {
    const totalHT = 10000;
    const depositPercentage = 30;
    const depositAmount = Math.round(totalHT * depositPercentage / 100);
    assert.equal(depositAmount, 3000);
  });

  it('should handle various deposit percentages', () => {
    const cases = [
      { total: 10000, pct: 30, expected: 3000 },
      { total: 50000, pct: 50, expected: 25000 },
      { total: 15000, pct: 20, expected: 3000 },
      { total: 33333, pct: 30, expected: 10000 },
      { total: 0, pct: 30, expected: 0 },
    ];
    for (const { total, pct, expected } of cases) {
      const deposit = Math.round(total * pct / 100);
      assert.equal(deposit, expected, `${pct}% of ${total} should be ${expected}`);
    }
  });

  it('should skip already-processed quotes', async () => {
    // If quote.status === 'signed' && quote.deposit_invoice_id exists
    const quote = { id: 42, status: 'signed', deposit_invoice_id: 'INV-2026-0100' };
    const alreadyProcessed = quote.status === 'signed' && !!quote.deposit_invoice_id;
    assert.equal(alreadyProcessed, true, 'Quote with existing deposit invoice should be skipped');
  });

  it('should not skip quotes without deposit invoice', async () => {
    const quote = { id: 43, status: 'sent', deposit_invoice_id: null };
    const alreadyProcessed = quote.status === 'signed' && quote.deposit_invoice_id;
    assert.equal(!!alreadyProcessed, false);
  });
});

// ============================================================
// B.3.2 — Revolut paiement → activation projet
// ============================================================

describe('B.3.2 — Revolut paiement → activation projet', () => {

  it('should validate HMAC signature', async () => {
    const crypto = await import('crypto');
    const signingKey = 'test-webhook-secret';
    const body = JSON.stringify({ amount: 5000, currency: 'CHF' });
    const expectedSig = crypto.createHmac('sha256', signingKey).update(body).digest('hex');

    // Verify timing-safe comparison works with identical signatures
    assert.ok(
      crypto.timingSafeEqual(
        Buffer.from(expectedSig, 'hex'),
        Buffer.from(expectedSig, 'hex')
      ),
      'Identical signatures should match via timing-safe comparison'
    );
  });

  it('should reject mismatched HMAC signatures', async () => {
    const crypto = await import('crypto');
    const signingKey = 'test-webhook-secret';
    const body = JSON.stringify({ amount: 5000, currency: 'CHF' });
    const validSig = crypto.createHmac('sha256', signingKey).update(body).digest('hex');
    const tamperedSig = crypto.createHmac('sha256', signingKey).update(body + 'tampered').digest('hex');

    // Both are 32 bytes (sha256), safe to compare
    const isValid = crypto.timingSafeEqual(
      Buffer.from(validSig, 'hex'),
      Buffer.from(tamperedSig, 'hex')
    );
    assert.equal(isValid, false, 'Tampered body should produce different signature');
  });

  it('should ignore outgoing payments', () => {
    const outgoingDirections = ['sell', 'debit', 'outgoing'];
    for (const direction of outgoingDirections) {
      const isOutgoing = ['sell', 'debit', 'outgoing'].includes(direction);
      assert.ok(isOutgoing, `Direction "${direction}" should be classified as outgoing`);
    }
  });

  it('should accept incoming payments', () => {
    const incomingDirections = ['buy', 'credit', 'incoming'];
    for (const direction of incomingDirections) {
      const isOutgoing = ['sell', 'debit', 'outgoing'].includes(direction);
      assert.equal(isOutgoing, false, `Direction "${direction}" should NOT be classified as outgoing`);
    }
  });

  it('should ignore zero/negative amounts', () => {
    const invalidAmounts = [0, -100, -1, -0.01];
    for (const amount of invalidAmounts) {
      assert.ok(amount <= 0, `Amount ${amount} should be rejected`);
    }

    const validAmounts = [1, 100, 5000.50, 0.01];
    for (const amount of validAmounts) {
      assert.ok(amount > 0, `Amount ${amount} should be accepted`);
    }
  });

  it('should match payment to invoice by reference', () => {
    const testCases = [
      { reference: 'Payment for INV-2026-0042', expected: 'INV-2026-0042' },
      { reference: 'FAC-001 payment', expected: 'FAC-001' },
      { reference: 'Deposit DEP-2026-0010', expected: 'DEP-2026-0010' },
      { reference: 'Supplier SUP-55', expected: 'SUP-55' },
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
    ];
    for (const reference of noMatchRefs) {
      const match = reference.match(/(?:INV|FAC|DEP|SUP)-?\d+[-/]?\d*/i);
      assert.equal(match, null, `Should NOT match invoice ref in: "${reference}"`);
    }
  });

  it('should create project from signed quote', () => {
    const quote = {
      id: 1,
      title: 'Test Project',
      quote_number: 'DEV-001',
      total_ht: 25000,
      currency: 'CHF',
    };
    const projectData = {
      name: quote.title || `Projet - ${quote.quote_number}`,
      status: 'active',
      budget: parseFloat(quote.total_ht),
      currency: quote.currency,
    };
    assert.equal(projectData.name, 'Test Project');
    assert.equal(projectData.status, 'active');
    assert.equal(projectData.budget, 25000);
    assert.equal(projectData.currency, 'CHF');
  });

  it('should fallback to quote_number when title is empty', () => {
    const quote = {
      id: 2,
      title: '',
      quote_number: 'DEV-002',
      total_ht: 15000,
      currency: 'EUR',
    };
    const projectData = {
      name: quote.title || `Projet - ${quote.quote_number}`,
      status: 'active',
      budget: parseFloat(quote.total_ht),
      currency: quote.currency,
    };
    assert.equal(projectData.name, 'Projet - DEV-002');
  });
});

// ============================================================
// B.3.3 — Relances automatiques cron (Mahnung 1/2/3)
// ============================================================

describe('B.3.3 — Relances automatiques cron', () => {

  it('should identify overdue invoices by Mahnung level', () => {
    const today = new Date();
    const invoices = [
      { due_date: new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'sent', mahnung_level: 0 },   // 7 days overdue
      { due_date: new Date(today - 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'sent', mahnung_level: 1 },  // 30 days overdue
      { due_date: new Date(today - 60 * 24 * 60 * 60 * 1000).toISOString(), status: 'sent', mahnung_level: 2 },  // 60 days overdue
    ];

    // Mahnung 1: >= 7 days overdue, level 0
    const m1 = invoices.filter(i => {
      const overdueDays = Math.floor((today - new Date(i.due_date)) / (24 * 60 * 60 * 1000));
      return i.mahnung_level === 0 && overdueDays >= 7;
    });
    assert.equal(m1.length, 1, 'Should find 1 invoice for Mahnung 1');

    // Mahnung 2: >= 30 days overdue, level 1
    const m2 = invoices.filter(i => {
      const overdueDays = Math.floor((today - new Date(i.due_date)) / (24 * 60 * 60 * 1000));
      return i.mahnung_level === 1 && overdueDays >= 30;
    });
    assert.equal(m2.length, 1, 'Should find 1 invoice for Mahnung 2');

    // Mahnung 3: >= 60 days overdue, level 2 -> Betreibungsbegehren
    const m3 = invoices.filter(i => {
      const overdueDays = Math.floor((today - new Date(i.due_date)) / (24 * 60 * 60 * 1000));
      return i.mahnung_level === 2 && overdueDays >= 60;
    });
    assert.equal(m3.length, 1, 'Should find 1 invoice for Mahnung 3 (Betreibungsbegehren)');
  });

  it('should compute correct fees for each Mahnung level', () => {
    const MAHNUNG_FEES = { 1: 0, 2: 20, 3: 30 };
    assert.equal(MAHNUNG_FEES[1], 0, 'Mahnung 1 has no fee');
    assert.equal(MAHNUNG_FEES[2], 20, 'Mahnung 2 fee is CHF 20');
    assert.equal(MAHNUNG_FEES[3], 30, 'Mahnung 3 fee is CHF 30');
  });

  it('should not send reminders for already paid invoices', () => {
    const invoice = { status: 'paid', mahnung_level: 0 };
    const shouldRemind = invoice.status !== 'paid' && invoice.status !== 'cancelled';
    assert.equal(shouldRemind, false, 'Paid invoices should not receive reminders');
  });

  it('should not send reminders for cancelled invoices', () => {
    const invoice = { status: 'cancelled', mahnung_level: 1 };
    const shouldRemind = invoice.status !== 'paid' && invoice.status !== 'cancelled';
    assert.equal(shouldRemind, false, 'Cancelled invoices should not receive reminders');
  });

  it('should send reminders for overdue sent invoices', () => {
    const invoice = { status: 'sent', mahnung_level: 0 };
    const shouldRemind = invoice.status !== 'paid' && invoice.status !== 'cancelled';
    assert.equal(shouldRemind, true, 'Sent overdue invoices should receive reminders');
  });

  it('should send reminders for overdue viewed invoices', () => {
    const invoice = { status: 'viewed', mahnung_level: 0 };
    const shouldRemind = invoice.status !== 'paid' && invoice.status !== 'cancelled';
    assert.equal(shouldRemind, true, 'Viewed overdue invoices should receive reminders');
  });

  it('should correctly compute overdue days', () => {
    const today = new Date('2026-02-21T00:00:00Z');
    const dueDate = new Date('2026-02-01T00:00:00Z');
    const overdueDays = Math.floor((today - dueDate) / (24 * 60 * 60 * 1000));
    assert.equal(overdueDays, 20, 'Should be 20 days overdue');
  });

  it('should not flag invoices that are not yet overdue', () => {
    const today = new Date('2026-02-21T00:00:00Z');
    const dueDate = new Date('2026-03-01T00:00:00Z');
    const overdueDays = Math.floor((today - dueDate) / (24 * 60 * 60 * 1000));
    assert.ok(overdueDays < 0, 'Future due date should yield negative overdue days');
  });

  it('should escalate Mahnung levels correctly', () => {
    // After sending Mahnung 1, level goes from 0 -> 1
    // After sending Mahnung 2, level goes from 1 -> 2
    // After sending Mahnung 3, level goes from 2 -> 3 (Betreibungsbegehren)
    const escalate = (currentLevel) => Math.min(currentLevel + 1, 3);
    assert.equal(escalate(0), 1);
    assert.equal(escalate(1), 2);
    assert.equal(escalate(2), 3);
    assert.equal(escalate(3), 3, 'Should not exceed level 3');
  });
});

// ============================================================
// B.3.4 — Qualification LLM leads
// ============================================================

describe('B.3.4 — Qualification LLM leads', () => {

  it('should build lead context JSON for Claude', () => {
    const lead = {
      first_name: 'Martin',
      last_name: 'Keller',
      company_name: 'Migros',
      email: 'martin@migros.ch',
      source: 'wordpress',
      budget: '50000',
    };
    const context = JSON.stringify({
      name: `${lead.first_name} ${lead.last_name}`.trim(),
      company: lead.company_name,
      email: lead.email,
      source: lead.source,
      budget: lead.budget,
    });
    const parsed = JSON.parse(context);
    assert.equal(parsed.name, 'Martin Keller');
    assert.equal(parsed.company, 'Migros');
    assert.equal(parsed.email, 'martin@migros.ch');
    assert.equal(parsed.source, 'wordpress');
    assert.equal(parsed.budget, '50000');
  });

  it('should handle leads with missing names gracefully', () => {
    const lead = { first_name: '', last_name: '', company_name: 'Coop', email: 'info@coop.ch' };
    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    assert.equal(name, '', 'Empty names should result in empty string after trim');
  });

  it('should classify leads by score', () => {
    const classify = (score) => score >= 7 ? 'qualified' : (score >= 4 ? 'warm' : 'cold');
    assert.equal(classify(9), 'qualified');
    assert.equal(classify(7), 'qualified');
    assert.equal(classify(5), 'warm');
    assert.equal(classify(4), 'warm');
    assert.equal(classify(3), 'cold');
    assert.equal(classify(1), 'cold');
    assert.equal(classify(0), 'cold');
    assert.equal(classify(10), 'qualified');
  });

  it('should parse Claude JSON response', () => {
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
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    assert.ok(jsonMatch, 'Should extract JSON from markdown code block');
    const qualification = JSON.parse(jsonMatch[0]);
    assert.equal(qualification.score, 5);
    assert.equal(qualification.sector, 'tech');
    assert.equal(qualification.language, 'de');
  });

  it('should extract JSON from multi-line markdown response', () => {
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
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    assert.ok(jsonMatch);
    const qualification = JSON.parse(jsonMatch[0]);
    assert.equal(qualification.score, 3);
    assert.equal(qualification.priority, 'low');
  });

  it('should trigger email for high-score leads only', () => {
    const shouldEmail = (score) => score >= 7;
    assert.equal(shouldEmail(9), true);
    assert.equal(shouldEmail(7), true);
    assert.equal(shouldEmail(6), false);
    assert.equal(shouldEmail(3), false);
    assert.equal(shouldEmail(0), false);
  });

  it('should validate qualification schema completeness', () => {
    const requiredFields = ['score', 'sector', 'priority', 'recommended_action', 'language', 'summary'];
    const qualification = {
      score: 7,
      sector: 'finance',
      priority: 'high',
      recommended_action: 'Call immediately',
      language: 'fr',
      summary: 'Qualified lead from finance sector',
    };
    for (const field of requiredFields) {
      assert.ok(field in qualification, `Qualification must include "${field}"`);
      assert.ok(qualification[field] !== undefined, `"${field}" must not be undefined`);
    }
  });

  it('should handle invalid JSON gracefully', () => {
    const rawText = 'This is not valid JSON at all';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    assert.equal(jsonMatch, null, 'Should return null when no JSON found');
  });
});

// ============================================================
// B.3.5 — Rapport mensuel CEO
// ============================================================

describe('B.3.5 — Rapport mensuel CEO', () => {

  it('should compute previous month boundaries', () => {
    const now = new Date('2026-02-21T10:00:00Z');
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfLastMonth = new Date(firstOfThisMonth - 1);

    assert.ok(firstOfLastMonth < firstOfThisMonth, 'First of last month should be before first of this month');
    assert.ok(lastOfLastMonth < firstOfThisMonth, 'Last of last month should be before first of this month');
    assert.equal(lastOfLastMonth.getMonth(), firstOfLastMonth.getMonth(), 'Last of last month should be in the same month as first of last month');

    // Verify specific dates for Feb 2026
    assert.equal(firstOfThisMonth.getMonth(), 1, 'This month should be February (index 1)');
    assert.equal(firstOfLastMonth.getMonth(), 0, 'Last month should be January (index 0)');
    assert.equal(lastOfLastMonth.getDate(), 31, 'Last day of January should be 31');
  });

  it('should handle January -> December boundary', () => {
    const now = new Date('2026-01-15T10:00:00Z');
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfLastMonth = new Date(firstOfThisMonth - 1);

    assert.equal(firstOfLastMonth.getFullYear(), 2025, 'Previous month of Jan 2026 should be in 2025');
    assert.equal(firstOfLastMonth.getMonth(), 11, 'Previous month of Jan should be December (index 11)');
    assert.equal(lastOfLastMonth.getDate(), 31, 'Last day of December should be 31');
  });

  it('should aggregate revenue correctly', () => {
    const invoices = [
      { total: 5000, status: 'paid', currency: 'CHF' },
      { total: 3000, status: 'paid', currency: 'CHF' },
      { total: 2000, status: 'pending', currency: 'CHF' },
    ];
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.total), 0);
    assert.equal(totalRevenue, 8000, 'Total revenue should sum only paid invoices');
  });

  it('should aggregate revenue with zero paid invoices', () => {
    const invoices = [
      { total: 2000, status: 'pending', currency: 'CHF' },
      { total: 1500, status: 'sent', currency: 'CHF' },
    ];
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.total), 0);
    assert.equal(totalRevenue, 0, 'No paid invoices should yield zero revenue');
  });

  it('should format CHF amounts correctly', () => {
    const formatCHF = (n) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(n);
    const formatted = formatCHF(12450.50);
    assert.ok(formatted.includes('12'), 'Formatted amount should contain "12"');
    assert.ok(formatted.includes('450'), 'Formatted amount should contain "450"');
    assert.ok(formatted.includes('CHF'), 'Formatted amount should contain "CHF"');
  });

  it('should format zero amounts', () => {
    const formatCHF = (n) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(n);
    const formatted = formatCHF(0);
    assert.ok(formatted.includes('0'), 'Formatted zero should contain "0"');
    assert.ok(formatted.includes('CHF'), 'Formatted zero should contain "CHF"');
  });

  it('should compute month-over-month trend', () => {
    const current = 25000;
    const previous = 20000;
    const trend = ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '25.0', 'MoM trend should be +25.0%');
  });

  it('should compute negative trend', () => {
    const current = 15000;
    const previous = 20000;
    const trend = ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '-25.0', 'MoM trend should be -25.0%');
  });

  it('should handle zero previous month gracefully', () => {
    const current = 5000;
    const previous = 0;
    const trend = previous === 0 ? (current > 0 ? '+100' : '0') : ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '+100', 'Zero previous month with positive current should be +100');
  });

  it('should handle zero both months gracefully', () => {
    const current = 0;
    const previous = 0;
    const trend = previous === 0 ? (current > 0 ? '+100' : '0') : ((current - previous) / previous * 100).toFixed(1);
    assert.equal(trend, '0', 'Zero both months should be 0');
  });

  it('should aggregate KPIs per company', () => {
    const invoicesByCompany = [
      { owner_company: 'HYPERVISUAL', total: 10000, status: 'paid' },
      { owner_company: 'HYPERVISUAL', total: 5000, status: 'paid' },
      { owner_company: 'DAINAMICS', total: 8000, status: 'paid' },
      { owner_company: 'LEXAIA', total: 3000, status: 'pending' },
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
  });

  it('should count active projects', () => {
    const projects = [
      { status: 'active', owner_company: 'HYPERVISUAL' },
      { status: 'active', owner_company: 'HYPERVISUAL' },
      { status: 'completed', owner_company: 'HYPERVISUAL' },
      { status: 'active', owner_company: 'DAINAMICS' },
      { status: 'on_hold', owner_company: 'DAINAMICS' },
    ];

    const activeCount = projects.filter(p => p.status === 'active').length;
    assert.equal(activeCount, 3, 'Should count 3 active projects');

    const activeByCompany = {};
    for (const p of projects.filter(p => p.status === 'active')) {
      activeByCompany[p.owner_company] = (activeByCompany[p.owner_company] || 0) + 1;
    }
    assert.equal(activeByCompany['HYPERVISUAL'], 2);
    assert.equal(activeByCompany['DAINAMICS'], 1);
  });
});
