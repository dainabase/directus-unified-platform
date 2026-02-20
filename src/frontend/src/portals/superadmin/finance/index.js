// Legacy exports
export { FinanceDashboard } from './FinanceDashboard';
export { KPICards } from './components/KPICards';
export { AlertsPanel } from './components/AlertsPanel';
export { CashFlowChart } from './components/CashFlowChart';
export { RecentTransactions } from './components/RecentTransactions';
export { useFinanceData } from './hooks/useFinanceData';
export { financeApi } from './services/financeApi';

// Phase 3 — Finance Complète
export { default as FinanceDashboardPage } from './FinanceDashboardPage';
export { default as InvoicesPage } from './components/InvoicesPage';
export { default as InvoiceDetail } from './components/InvoiceDetail';
export { default as InvoiceForm } from './components/InvoiceForm';
export { default as SupplierInvoicesPage } from './SupplierInvoicesPage';
export { default as AccountingPage } from './AccountingPage';
export { default as BankingPage } from './BankingPage';
export { default as MonthlyReportsPage } from './MonthlyReportsPage';
export { default as VATReportsPage } from './VATReportsPage';
export { default as ExpensesPage } from './ExpensesPage';
export { default as QRInvoiceGenerator } from './QRInvoiceGenerator';
export { default as MilestoneInvoicingPage } from './MilestoneInvoicingPage';

export default FinanceDashboard;
