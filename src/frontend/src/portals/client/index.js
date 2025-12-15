/**
 * Client Portal Module Exports
 *
 * Central exports for client portal components:
 * - Context providers
 * - Pages
 * - Components
 *
 * @date 15 Décembre 2025
 */

// Context
export { ClientAuthProvider, useClientAuth } from './context/ClientAuthContext';

// Pages
export { default as LoginPage } from './pages/LoginPage';
export { default as ActivationPage } from './pages/ActivationPage';
export { default as ResetPasswordPage } from './pages/ResetPasswordPage';
export { default as ClientPortalDashboard } from './pages/ClientPortalDashboard';

// Components
export { default as QuoteViewer } from './components/QuoteViewer';
export { default as InvoicesList } from './components/InvoicesList';
export { default as PaymentHistory } from './components/PaymentHistory';
export { default as SignatureEmbed } from './components/SignatureEmbed';
export { default as ProjectTimeline } from './components/ProjectTimeline';

// Main App Component
export { default as ClientPortalApp } from './ClientPortalApp';
