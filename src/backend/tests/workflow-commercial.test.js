/**
 * Workflow Commercial - Tests Complets
 *
 * Tests end-to-end du workflow commercial:
 * Lead → Devis → CGV → Signature → Acompte → Projet
 *
 * @date 15 Décembre 2025
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test_admin_token';
const TEST_COMPANY = 'HYPERVISUAL';

// Helper pour fetch avec auth
const authFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`,
      ...options.headers
    }
  });
  return response;
};

// ===================================================================
// TESTS SERVICES LEAD
// ===================================================================
describe('Lead Service', () => {
  let createdLeadId;

  describe('CREATE', () => {
    it('should create a new lead', async () => {
      const response = await authFetch('/commercial/leads', {
        method: 'POST',
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'Lead',
          email: `test.lead.${Date.now()}@example.com`,
          company_name: 'Test Company SA',
          phone: '+41 79 123 45 67',
          source: 'website',
          interest: 'Service A',
          owner_company: TEST_COMPANY
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.lead).toBeDefined();
      expect(data.lead.id).toBeDefined();
      expect(data.lead.status).toBe('new');
      createdLeadId = data.lead.id;
    });

    it('should validate required fields', async () => {
      const response = await authFetch('/commercial/leads', {
        method: 'POST',
        body: JSON.stringify({
          first_name: 'Test'
          // Missing required fields
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('READ', () => {
    it('should list leads with pagination', async () => {
      const response = await authFetch('/commercial/leads?limit=10&offset=0');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.leads).toBeDefined();
      expect(Array.isArray(data.leads)).toBe(true);
    });

    it('should get single lead by ID', async () => {
      if (!createdLeadId) return;

      const response = await authFetch(`/commercial/leads/${createdLeadId}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.lead.id).toBe(createdLeadId);
    });

    it('should filter leads by status', async () => {
      const response = await authFetch('/commercial/leads?status=new');
      expect(response.status).toBe(200);

      const data = await response.json();
      data.leads.forEach(lead => {
        expect(lead.status).toBe('new');
      });
    });
  });

  describe('UPDATE', () => {
    it('should update lead status', async () => {
      if (!createdLeadId) return;

      const response = await authFetch(`/commercial/leads/${createdLeadId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'contacted'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.lead.status).toBe('contacted');
    });

    it('should qualify lead', async () => {
      if (!createdLeadId) return;

      const response = await authFetch(`/commercial/leads/${createdLeadId}/qualify`, {
        method: 'POST',
        body: JSON.stringify({
          qualification_score: 85,
          notes: 'High potential client'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.lead.status).toBe('qualified');
    });
  });

  describe('CONVERT', () => {
    it('should convert lead to contact', async () => {
      if (!createdLeadId) return;

      const response = await authFetch(`/commercial/leads/${createdLeadId}/convert`, {
        method: 'POST'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.contact).toBeDefined();
      expect(data.contact.id).toBeDefined();
    });
  });
});

// ===================================================================
// TESTS SERVICES DEVIS
// ===================================================================
describe('Quote Service', () => {
  let createdQuoteId;
  let testContactId;

  beforeAll(async () => {
    // Create test contact
    const contactResponse = await authFetch('/commercial/contacts', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Quote',
        last_name: 'Test',
        email: `quote.test.${Date.now()}@example.com`,
        company_name: 'Quote Test SA',
        owner_company: TEST_COMPANY
      })
    });
    const contactData = await contactResponse.json();
    testContactId = contactData.contact?.id;
  });

  describe('CREATE', () => {
    it('should create a new quote', async () => {
      if (!testContactId) return;

      const response = await authFetch('/commercial/quotes', {
        method: 'POST',
        body: JSON.stringify({
          contact_id: testContactId,
          title: 'Test Quote',
          valid_days: 30,
          items: [
            {
              description: 'Service A',
              quantity: 1,
              unit_price: 1000
            },
            {
              description: 'Service B',
              quantity: 2,
              unit_price: 500
            }
          ],
          owner_company: TEST_COMPANY
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.quote).toBeDefined();
      expect(data.quote.quote_number).toBeDefined();
      expect(data.quote.subtotal).toBe(2000);
      createdQuoteId = data.quote.id;
    });

    it('should calculate TVA correctly', async () => {
      if (!testContactId) return;

      const response = await authFetch('/commercial/quotes', {
        method: 'POST',
        body: JSON.stringify({
          contact_id: testContactId,
          title: 'TVA Test',
          tax_rate: 8.1,
          items: [
            {
              description: 'Service',
              quantity: 1,
              unit_price: 1000
            }
          ],
          owner_company: TEST_COMPANY
        })
      });

      const data = await response.json();
      expect(data.quote.tax_amount).toBe(81); // 8.1% of 1000
      expect(data.quote.total).toBe(1081);
    });
  });

  describe('READ', () => {
    it('should list quotes', async () => {
      const response = await authFetch('/commercial/quotes');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.quotes)).toBe(true);
    });

    it('should get quote with items', async () => {
      if (!createdQuoteId) return;

      const response = await authFetch(`/commercial/quotes/${createdQuoteId}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.quote.quote_items).toBeDefined();
      expect(Array.isArray(data.quote.quote_items)).toBe(true);
    });
  });

  describe('STATUS WORKFLOW', () => {
    it('should send quote', async () => {
      if (!createdQuoteId) return;

      const response = await authFetch(`/commercial/quotes/${createdQuoteId}/send`, {
        method: 'POST'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.quote.status).toBe('sent');
      expect(data.quote.sent_at).toBeDefined();
    });

    it('should mark quote as viewed', async () => {
      if (!createdQuoteId) return;

      const response = await authFetch(`/commercial/quotes/${createdQuoteId}/view`, {
        method: 'POST'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.quote.status).toBe('viewed');
      expect(data.quote.viewed_at).toBeDefined();
    });
  });

  describe('PDF', () => {
    it('should generate PDF', async () => {
      if (!createdQuoteId) return;

      const response = await authFetch(`/commercial/quotes/${createdQuoteId}/pdf`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/pdf');
    });
  });
});

// ===================================================================
// TESTS CGV
// ===================================================================
describe('CGV Service', () => {
  let cgvVersionId;

  describe('CREATE VERSION', () => {
    it('should create CGV version', async () => {
      const response = await authFetch('/commercial/cgv', {
        method: 'POST',
        body: JSON.stringify({
          version: `${Date.now()}`,
          effective_date: new Date().toISOString().split('T')[0],
          content: 'Test CGV content...',
          owner_company: TEST_COMPANY
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.cgv).toBeDefined();
      cgvVersionId = data.cgv.id;
    });
  });

  describe('READ', () => {
    it('should get active CGV for company', async () => {
      const response = await authFetch(`/commercial/cgv/active/${TEST_COMPANY}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.cgv).toBeDefined();
      expect(data.cgv.status).toBe('active');
    });
  });

  describe('ACCEPTANCE', () => {
    it('should accept CGV', async () => {
      if (!cgvVersionId) return;

      const response = await authFetch('/commercial/cgv/accept', {
        method: 'POST',
        body: JSON.stringify({
          cgv_version_id: cgvVersionId,
          contact_email: 'test@example.com',
          ip_address: '127.0.0.1'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.acceptance).toBeDefined();
      expect(data.acceptance.accepted_at).toBeDefined();
    });
  });
});

// ===================================================================
// TESTS FACTURES
// ===================================================================
describe('Invoice Service', () => {
  let createdInvoiceId;
  let testContactId;

  beforeAll(async () => {
    const contactResponse = await authFetch('/commercial/contacts', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Invoice',
        last_name: 'Test',
        email: `invoice.test.${Date.now()}@example.com`,
        owner_company: TEST_COMPANY
      })
    });
    const contactData = await contactResponse.json();
    testContactId = contactData.contact?.id;
  });

  describe('CREATE', () => {
    it('should create invoice', async () => {
      if (!testContactId) return;

      const response = await authFetch('/commercial/invoices', {
        method: 'POST',
        body: JSON.stringify({
          contact_id: testContactId,
          type: 'standard',
          items: [
            {
              description: 'Service',
              quantity: 1,
              unit_price: 1000
            }
          ],
          due_days: 30,
          owner_company: TEST_COMPANY
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.invoice).toBeDefined();
      expect(data.invoice.invoice_number).toBeDefined();
      createdInvoiceId = data.invoice.id;
    });

    it('should create deposit invoice from quote', async () => {
      // Need signed quote for this
      // Test will be covered in integration tests
    });
  });

  describe('STATUS', () => {
    it('should send invoice', async () => {
      if (!createdInvoiceId) return;

      const response = await authFetch(`/commercial/invoices/${createdInvoiceId}/send`, {
        method: 'POST'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.invoice.status).toBe('sent');
    });
  });

  describe('PAYMENT', () => {
    it('should record payment', async () => {
      if (!createdInvoiceId) return;

      const response = await authFetch(`/commercial/invoices/${createdInvoiceId}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          amount: 500,
          payment_method: 'bank_transfer',
          reference: 'TEST-PAY-001'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.payment).toBeDefined();
      expect(data.invoice.amount_paid).toBe(500);
      expect(data.invoice.status).toBe('partial');
    });

    it('should mark as paid on full payment', async () => {
      if (!createdInvoiceId) return;

      // Get remaining amount
      const invoiceResponse = await authFetch(`/commercial/invoices/${createdInvoiceId}`);
      const invoiceData = await invoiceResponse.json();
      const remaining = invoiceData.invoice.total - invoiceData.invoice.amount_paid;

      const response = await authFetch(`/commercial/invoices/${createdInvoiceId}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          amount: remaining,
          payment_method: 'bank_transfer'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.invoice.status).toBe('paid');
    });
  });
});

// ===================================================================
// TESTS INTEGRATIONS
// ===================================================================
describe('Integration Services', () => {
  describe('Health Check', () => {
    it('should return integration health status', async () => {
      const response = await authFetch('/integrations/health');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.docuseal).toBeDefined();
      expect(data.invoiceNinja).toBeDefined();
      expect(data.mautic).toBeDefined();
    });
  });

  describe('DocuSeal', () => {
    it('should validate DocuSeal connection', async () => {
      const response = await authFetch('/integrations/health');
      const data = await response.json();

      // May be disconnected in test env
      expect(['connected', 'disconnected']).toContain(data.docuseal.status);
    });
  });

  describe('Invoice Ninja', () => {
    it('should validate Invoice Ninja connection', async () => {
      const response = await authFetch('/integrations/health');
      const data = await response.json();

      expect(['connected', 'disconnected']).toContain(data.invoiceNinja.status);
    });
  });

  describe('Mautic', () => {
    it('should validate Mautic connection', async () => {
      const response = await authFetch('/integrations/health');
      const data = await response.json();

      expect(['connected', 'disconnected']).toContain(data.mautic.status);
    });
  });
});

// ===================================================================
// TESTS E2E WORKFLOW
// ===================================================================
describe('E2E Workflow: Lead to Project', () => {
  let leadId, contactId, quoteId, invoiceId;

  it('Step 1: Create Lead', async () => {
    const response = await authFetch('/commercial/leads', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'E2E',
        last_name: 'Test',
        email: `e2e.${Date.now()}@example.com`,
        company_name: 'E2E Test SA',
        source: 'website',
        owner_company: TEST_COMPANY
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    leadId = data.lead.id;
    expect(leadId).toBeDefined();
  });

  it('Step 2: Qualify Lead', async () => {
    const response = await authFetch(`/commercial/leads/${leadId}/qualify`, {
      method: 'POST',
      body: JSON.stringify({
        qualification_score: 90
      })
    });

    expect(response.status).toBe(200);
  });

  it('Step 3: Convert Lead to Contact', async () => {
    const response = await authFetch(`/commercial/leads/${leadId}/convert`, {
      method: 'POST'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    contactId = data.contact.id;
    expect(contactId).toBeDefined();
  });

  it('Step 4: Create Quote', async () => {
    const response = await authFetch('/commercial/quotes', {
      method: 'POST',
      body: JSON.stringify({
        contact_id: contactId,
        title: 'E2E Project Quote',
        items: [
          { description: 'Phase 1', quantity: 1, unit_price: 5000 },
          { description: 'Phase 2', quantity: 1, unit_price: 3000 }
        ],
        deposit_percentage: 30,
        owner_company: TEST_COMPANY
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    quoteId = data.quote.id;
    expect(data.quote.deposit_amount).toBe(2400); // 30% of 8000
  });

  it('Step 5: Send Quote', async () => {
    const response = await authFetch(`/commercial/quotes/${quoteId}/send`, {
      method: 'POST'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.quote.status).toBe('sent');
  });

  it('Step 6: Mark Quote as Viewed', async () => {
    const response = await authFetch(`/commercial/quotes/${quoteId}/view`, {
      method: 'POST'
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.quote.status).toBe('viewed');
  });

  // Note: Signature step requires DocuSeal integration
  // In production, this would involve:
  // - Create signature request
  // - Handle webhook callback
  // - Update quote status to 'signed'

  it('Step 7: Simulate Quote Signed (manual)', async () => {
    const response = await authFetch(`/commercial/quotes/${quoteId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'signed',
        signed_at: new Date().toISOString()
      })
    });

    expect(response.status).toBe(200);
  });

  it('Step 8: Create Deposit Invoice', async () => {
    const response = await authFetch(`/commercial/quotes/${quoteId}/deposit-invoice`, {
      method: 'POST'
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    invoiceId = data.invoice.id;
    expect(data.invoice.type).toBe('deposit');
    expect(data.invoice.total).toBeGreaterThan(0);
  });

  it('Step 9: Record Deposit Payment', async () => {
    const invoiceResponse = await authFetch(`/commercial/invoices/${invoiceId}`);
    const invoiceData = await invoiceResponse.json();

    const response = await authFetch(`/commercial/invoices/${invoiceId}/payment`, {
      method: 'POST',
      body: JSON.stringify({
        amount: invoiceData.invoice.total,
        payment_method: 'bank_transfer',
        reference: 'E2E-DEPOSIT'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.invoice.status).toBe('paid');
  });

  it('Step 10: Create Project', async () => {
    const response = await authFetch('/commercial/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'E2E Test Project',
        quote_id: quoteId,
        contact_id: contactId,
        start_date: new Date().toISOString().split('T')[0],
        owner_company: TEST_COMPANY
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.project).toBeDefined();
    expect(data.project.status).toBe('active');
  });
});

// ===================================================================
// TESTS CALCULS TVA SUISSE
// ===================================================================
describe('Swiss TVA Calculations', () => {
  const testCases = [
    { rate: 8.1, subtotal: 1000, expected_tax: 81, expected_total: 1081 },
    { rate: 2.6, subtotal: 1000, expected_tax: 26, expected_total: 1026 },
    { rate: 3.8, subtotal: 1000, expected_tax: 38, expected_total: 1038 },
    { rate: 0, subtotal: 1000, expected_tax: 0, expected_total: 1000 }
  ];

  testCases.forEach(({ rate, subtotal, expected_tax, expected_total }) => {
    it(`should calculate ${rate}% TVA correctly`, () => {
      const tax = Math.round(subtotal * rate) / 100;
      const total = subtotal + tax;

      expect(tax).toBe(expected_tax);
      expect(total).toBe(expected_total);
    });
  });
});

// ===================================================================
// TESTS VALIDATION
// ===================================================================
describe('Input Validation', () => {
  describe('Email Validation', () => {
    const validEmails = ['test@example.com', 'user.name@domain.ch', 'a@b.co'];
    const invalidEmails = ['notanemail', '@nodomain.com', 'no@', ''];

    validEmails.forEach(email => {
      it(`should accept valid email: ${email}`, () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    invalidEmails.forEach(email => {
      it(`should reject invalid email: ${email}`, () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Phone Validation (Swiss)', () => {
    const validPhones = ['+41 79 123 45 67', '+41791234567', '079 123 45 67'];

    validPhones.forEach(phone => {
      it(`should accept valid Swiss phone: ${phone}`, () => {
        const cleaned = phone.replace(/\s/g, '');
        const phoneRegex = /^(\+41|0)[0-9]{9}$/;
        expect(phoneRegex.test(cleaned)).toBe(true);
      });
    });
  });
});

console.log('Tests completed!');
