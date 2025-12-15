/**
 * Client Portal Tests
 *
 * Tests for React components:
 * - Authentication flow
 * - Components rendering
 * - User interactions
 *
 * @date 15 Décembre 2025
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Components to test
import { ClientAuthProvider, useClientAuth } from '../context/ClientAuthContext';
import LoginPage from '../pages/LoginPage';
import ActivationPage from '../pages/ActivationPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import QuoteViewer from '../components/QuoteViewer';
import InvoicesList from '../components/InvoicesList';
import PaymentHistory from '../components/PaymentHistory';

// Mock fetch globally
global.fetch = vi.fn();

// Helper to wrap components with auth provider
const renderWithAuth = (component) => {
  return render(
    <ClientAuthProvider>
      {component}
    </ClientAuthProvider>
  );
};

// ===================================================================
// TESTS AUTH CONTEXT
// ===================================================================
describe('ClientAuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should start with isAuthenticated false', () => {
      const TestComponent = () => {
        const { isAuthenticated } = useClientAuth();
        return <div data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</div>;
      };

      renderWithAuth(<TestComponent />);
      expect(screen.getByTestId('auth')).toHaveTextContent('no');
    });

    it('should check localStorage for existing token', async () => {
      localStorage.setItem('client_portal_token', 'test_token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, email: 'test@example.com' } })
      });

      const TestComponent = () => {
        const { isAuthenticated, user } = useClientAuth();
        return (
          <div>
            <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
            <span data-testid="user">{user?.email}</span>
          </div>
        );
      };

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('auth')).toHaveTextContent('yes');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'new_token',
          user: { id: 1, email: 'test@example.com' }
        })
      });

      const TestComponent = () => {
        const { login, isAuthenticated } = useClientAuth();

        return (
          <div>
            <button onClick={() => login('test@example.com', 'password')}>
              Login
            </button>
            <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
          </div>
        );
      };

      renderWithAuth(<TestComponent />);

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('auth')).toHaveTextContent('yes');
        expect(localStorage.getItem('client_portal_token')).toBe('new_token');
      });
    });

    it('should handle login error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      });

      const TestComponent = () => {
        const { login, error } = useClientAuth();

        return (
          <div>
            <button onClick={() => login('test@example.com', 'wrong')}>
              Login
            </button>
            <span data-testid="error">{error}</span>
          </div>
        );
      };

      renderWithAuth(<TestComponent />);

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });
    });
  });

  describe('Logout', () => {
    it('should clear tokens on logout', () => {
      localStorage.setItem('client_portal_token', 'token');
      localStorage.setItem('client_portal_refresh', 'refresh');

      const TestComponent = () => {
        const { logout, isAuthenticated } = useClientAuth();

        return (
          <div>
            <button onClick={logout}>Logout</button>
            <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
          </div>
        );
      };

      renderWithAuth(<TestComponent />);

      fireEvent.click(screen.getByText('Logout'));

      expect(localStorage.getItem('client_portal_token')).toBeNull();
      expect(localStorage.getItem('client_portal_refresh')).toBeNull();
      expect(screen.getByTestId('auth')).toHaveTextContent('no');
    });
  });
});

// ===================================================================
// TESTS LOGIN PAGE
// ===================================================================
describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderWithAuth(<LoginPage />);

    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should show validation error for empty fields', async () => {
    renderWithAuth(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/veuillez remplir tous les champs/i)).toBeInTheDocument();
    });
  });

  it('should switch to forgot password mode', () => {
    renderWithAuth(<LoginPage />);

    fireEvent.click(screen.getByText(/mot de passe oublié/i));

    expect(screen.getByText(/réinitialisez votre mot de passe/i)).toBeInTheDocument();
  });

  it('should call onLoginSuccess on successful login', async () => {
    const onLoginSuccess = vi.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        token: 'token',
        user: { id: 1, email: 'test@example.com' }
      })
    });

    renderWithAuth(<LoginPage onLoginSuccess={onLoginSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/votre@email.com/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });
});

// ===================================================================
// TESTS ACTIVATION PAGE
// ===================================================================
describe('ActivationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate token on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true, email: 'test@example.com' })
    });

    renderWithAuth(<ActivationPage token="valid_token" />);

    await waitFor(() => {
      expect(screen.getByText(/activez votre compte/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid token', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ valid: false, error: 'Token expired' })
    });

    renderWithAuth(<ActivationPage token="invalid_token" />);

    await waitFor(() => {
      expect(screen.getByText(/lien invalide/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirements', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true })
    });

    renderWithAuth(<ActivationPage token="valid_token" />);

    await waitFor(() => {
      expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
      expect(screen.getByText(/une majuscule/i)).toBeInTheDocument();
      expect(screen.getByText(/une minuscule/i)).toBeInTheDocument();
      expect(screen.getByText(/un chiffre/i)).toBeInTheDocument();
    });
  });

  it('should show password strength indicator', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true })
    });

    renderWithAuth(<ActivationPage token="valid_token" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    });

    const passwordInput = screen.getAllByPlaceholderText(/••••••••/)[0];
    await userEvent.type(passwordInput, 'Test123!');

    expect(screen.getByText(/force:/i)).toBeInTheDocument();
  });
});

// ===================================================================
// TESTS QUOTE VIEWER
// ===================================================================
describe('QuoteViewer', () => {
  const mockQuote = {
    id: 1,
    quote_number: 'Q-2025-001',
    title: 'Test Quote',
    status: 'sent',
    subtotal: 1000,
    tax_rate: 8.1,
    tax_amount: 81,
    total: 1081,
    currency: 'CHF',
    deposit_percentage: 30,
    deposit_amount: 324.30,
    date_created: '2025-12-15',
    valid_until: '2026-01-15',
    quote_items: [
      { description: 'Service A', quantity: 1, unit_price: 1000 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));

    renderWithAuth(<QuoteViewer quoteId={1} />);

    expect(screen.getByText(/chargement du devis/i)).toBeInTheDocument();
  });

  it('should render quote details', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ quote: mockQuote })
    });

    renderWithAuth(<QuoteViewer quoteId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Q-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Test Quote')).toBeInTheDocument();
      expect(screen.getByText(/1'081/)).toBeInTheDocument(); // CHF formatting
    });
  });

  it('should show CGV acceptance section', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          quote: { ...mockQuote, owner_company_id: 'HYPERVISUAL' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          cgv: { id: 1, version: '2025.1' }
        })
      });

    renderWithAuth(<QuoteViewer quoteId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/conditions générales de vente/i)).toBeInTheDocument();
      expect(screen.getByText(/j'ai lu et j'accepte/i)).toBeInTheDocument();
    });
  });

  it('should show sign button for sent quotes', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ quote: mockQuote })
    });

    renderWithAuth(<QuoteViewer quoteId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/signer le devis/i)).toBeInTheDocument();
    });
  });

  it('should show signed status for completed quotes', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        quote: { ...mockQuote, status: 'signed', signed_at: '2025-12-15' }
      })
    });

    renderWithAuth(<QuoteViewer quoteId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/devis signé/i)).toBeInTheDocument();
    });
  });
});

// ===================================================================
// TESTS INVOICES LIST
// ===================================================================
describe('InvoicesList', () => {
  const mockInvoices = [
    {
      id: 1,
      invoice_number: 'F-2025-001',
      status: 'sent',
      total: 1081,
      amount_paid: 0,
      currency: 'CHF',
      date_created: '2025-12-15',
      due_date: '2026-01-15'
    },
    {
      id: 2,
      invoice_number: 'F-2025-002',
      status: 'paid',
      total: 500,
      amount_paid: 500,
      currency: 'CHF',
      date_created: '2025-12-01',
      due_date: '2025-12-31'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render invoices list', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices })
    });

    renderWithAuth(<InvoicesList />);

    await waitFor(() => {
      expect(screen.getByText('F-2025-001')).toBeInTheDocument();
      expect(screen.getByText('F-2025-002')).toBeInTheDocument();
    });
  });

  it('should show total due summary', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices })
    });

    renderWithAuth(<InvoicesList />);

    await waitFor(() => {
      expect(screen.getByText(/total à payer/i)).toBeInTheDocument();
    });
  });

  it('should filter invoices by status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices })
    });

    renderWithAuth(<InvoicesList />);

    await waitFor(() => {
      expect(screen.getByText('Payées')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Payées'));

    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining('status=paid'),
      expect.any(Object)
    );
  });

  it('should call onPayInvoice when clicking pay button', async () => {
    const onPayInvoice = vi.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices })
    });

    renderWithAuth(<InvoicesList onPayInvoice={onPayInvoice} />);

    await waitFor(() => {
      expect(screen.getByText('F-2025-001')).toBeInTheDocument();
    });

    const payButtons = screen.getAllByText('Payer');
    fireEvent.click(payButtons[0]);

    expect(onPayInvoice).toHaveBeenCalledWith(mockInvoices[0]);
  });
});

// ===================================================================
// TESTS PAYMENT HISTORY
// ===================================================================
describe('PaymentHistory', () => {
  const mockPayments = [
    {
      id: 1,
      amount: 500,
      currency: 'CHF',
      payment_method: 'bank_transfer',
      date_created: '2025-12-15T10:30:00Z',
      reference: 'PAY-001'
    },
    {
      id: 2,
      amount: 1000,
      currency: 'CHF',
      payment_method: 'credit_card',
      date_created: '2025-12-10T14:00:00Z',
      reference: 'PAY-002'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render payment history', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    renderWithAuth(<PaymentHistory />);

    await waitFor(() => {
      expect(screen.getByText(/historique des paiements/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no payments', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: [] })
    });

    renderWithAuth(<PaymentHistory />);

    await waitFor(() => {
      expect(screen.getByText(/aucun paiement/i)).toBeInTheDocument();
    });
  });

  it('should filter by date range', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    renderWithAuth(<PaymentHistory />);

    await waitFor(() => {
      expect(screen.getByText('Ce mois')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ce trimestre'));

    expect(global.fetch).toHaveBeenCalled();
  });

  it('should show payment method icons', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ payments: mockPayments })
    });

    renderWithAuth(<PaymentHistory />);

    await waitFor(() => {
      expect(screen.getByText(/virement bancaire/i)).toBeInTheDocument();
      expect(screen.getByText(/carte de crédit/i)).toBeInTheDocument();
    });
  });
});

// ===================================================================
// TESTS UTILS / FORMATTING
// ===================================================================
describe('Formatting Utils', () => {
  it('should format Swiss currency correctly', () => {
    const formatCurrency = (amount, currency = 'CHF') => {
      return new Intl.NumberFormat('fr-CH', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };

    expect(formatCurrency(1000)).toContain('1');
    expect(formatCurrency(1000)).toContain('000');
    expect(formatCurrency(1000)).toContain('CHF');
  });

  it('should format Swiss dates correctly', () => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-CH');
    };

    const formatted = formatDate('2025-12-15');
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/12/);
    expect(formatted).toMatch(/2025/);
  });
});

console.log('Client Portal tests completed!');
