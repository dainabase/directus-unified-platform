import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Landmark,
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  RefreshCw,
  Clock,
  DollarSign,
  Euro,
  PoundSterling
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Simulate API - replace with real Directus calls
const fetchBankAccounts = async (company) => {
  // Demo data - will be replaced by Directus API
  return [
    { id: 1, currency: 'CHF', balance: 125430.50, iban: 'CH93 0076 2011 6238 5295 7', name: 'Compte Principal', last_sync: new Date() },
    { id: 2, currency: 'EUR', balance: 45230.80, iban: 'CH93 0076 2011 6238 5295 8', name: 'Compte EUR', last_sync: new Date() },
    { id: 3, currency: 'USD', balance: 28150.25, iban: 'CH93 0076 2011 6238 5295 9', name: 'Compte USD', last_sync: new Date() },
  ];
};

const fetchTransactions = async (company) => {
  // Demo data - will be replaced by Directus API
  return [
    { id: 1, type: 'credit', amount: 15000, currency: 'CHF', description: 'Paiement client - Projet Web', merchant_name: 'ABC Corp', date: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 2, type: 'debit', amount: 2500, currency: 'CHF', description: 'Abonnement serveurs', merchant_name: 'AWS', date: new Date(Date.now() - 1000 * 60 * 60) },
    { id: 3, type: 'credit', amount: 8500, currency: 'EUR', description: 'Facture #2024-089', merchant_name: 'Client FR', date: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: 4, type: 'debit', amount: 450, currency: 'CHF', description: 'Licences logiciels', merchant_name: 'Adobe', date: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: 5, type: 'debit', amount: 1200, currency: 'CHF', description: 'Marketing digital', merchant_name: 'Google Ads', date: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  ];
};

const CurrencyIcon = ({ currency, className }) => {
  switch (currency) {
    case 'EUR': return <Euro className={className} />;
    case 'USD': return <DollarSign className={className} />;
    case 'GBP': return <PoundSterling className={className} />;
    default: return <span className={`font-bold ${className}`}>₣</span>;
  }
};

const BankingDashboard = ({ selectedCompany }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('CHF');
  
  const exchangeRates = {
    EUR: 0.94,
    USD: 0.88,
    GBP: 1.12,
    CHF: 1
  };

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts', selectedCompany],
    queryFn: () => fetchBankAccounts(selectedCompany),
    refetchInterval: 30000
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['bank-transactions', selectedCompany],
    queryFn: () => fetchTransactions(selectedCompany),
    refetchInterval: 10000
  });

  // Calculate totals
  const totalBalanceCHF = accounts.reduce((total, account) => {
    const rate = exchangeRates[account.currency] || 1;
    return total + (account.balance / rate);
  }, 0);

  const todayExpenses = transactions
    .filter(tx => tx.type === 'debit' && new Date(tx.date).toDateString() === new Date().toDateString())
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthRevenue = transactions
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (accountsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking Dashboard</h1>
          <p className="text-gray-500">Revolut Business - Comptes multi-devises</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw size={16} />
          Synchroniser
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Solde Total</p>
            <h2 className="text-4xl font-bold mt-2">
              {totalBalanceCHF.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-sm">
                <TrendingUp size={14} />
                +12.5% ce mois
              </span>
            </div>
          </div>
          <Landmark size={48} className="text-white/30" />
        </div>
      </div>

      {/* Currency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => setSelectedCurrency(account.currency)}
            className={`
              p-6 rounded-xl border-2 transition-all text-left
              ${selectedCurrency === account.currency 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 bg-white/80 backdrop-blur hover:border-blue-300'
              }
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${selectedCurrency === account.currency ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <CurrencyIcon currency={account.currency} className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-400">{account.name}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {account.balance.toLocaleString('fr-CH', { style: 'currency', currency: account.currency })}
            </p>
            {account.currency !== 'CHF' && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {(account.balance / exchangeRates[account.currency]).toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
              </p>
            )}
            <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min((account.balance / 200000) * 100, 100)}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Dépenses du jour</p>
          <p className="text-xl font-bold text-gray-900">
            {todayExpenses.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Revenus du mois</p>
          <p className="text-xl font-bold text-green-600">
            +{monthRevenue.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Dernière sync</p>
          <p className="text-xl font-bold text-gray-900">À l'instant</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-200/50 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Transactions récentes</h3>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map((tx, index) => (
            <div 
              key={tx.id} 
              className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}
                `}>
                  {tx.type === 'credit' 
                    ? <ArrowDownRight className="w-5 h-5 text-green-600" />
                    : <ArrowUpRight className="w-5 h-5 text-red-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">
                    {tx.merchant_name} • {formatDistanceToNow(new Date(tx.date), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              <div className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'credit' ? '+' : '-'}
                {tx.amount.toLocaleString('fr-CH', { style: 'currency', currency: tx.currency })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 text-center">
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Voir toutes les transactions →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankingDashboard;
