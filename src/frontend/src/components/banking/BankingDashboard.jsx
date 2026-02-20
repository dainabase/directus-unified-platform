/**
 * BankingDashboard — Connected to Directus `bank_accounts` + `bank_transactions`
 * Multi-currency banking overview with live transaction feed.
 */
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Landmark, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  CreditCard, Wallet, RefreshCw, Clock, DollarSign, Euro, PoundSterling
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'

const formatCHF = (amount, currency = 'CHF') =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency }).format(amount)

const fetchBankAccounts = async (company) => {
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
    const res = await api.get('/items/bank_accounts', {
      params: { filter, fields: ['*'], limit: -1 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const fetchTransactions = async (company) => {
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
    const res = await api.get('/items/bank_transactions', {
      params: { filter, fields: ['*'], sort: ['-date', '-date_created'], limit: 20 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const CurrencyIcon = ({ currency, className }) => {
  switch (currency) {
    case 'EUR': return <Euro className={className} />
    case 'USD': return <DollarSign className={className} />
    case 'GBP': return <PoundSterling className={className} />
    default: return <span className={`font-bold ${className}`}>CHF</span>
  }
}

const BankingDashboard = ({ selectedCompany }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('CHF')

  const exchangeRates = { EUR: 0.94, USD: 0.88, GBP: 1.12, CHF: 1 }

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts', selectedCompany],
    queryFn: () => fetchBankAccounts(selectedCompany),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 30
  })

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['bank-transactions', selectedCompany],
    queryFn: () => fetchTransactions(selectedCompany),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 15
  })

  // Calculate totals
  const totalBalanceCHF = accounts.reduce((total, account) => {
    const rate = exchangeRates[account.currency] || 1
    return total + (parseFloat(account.balance || 0) / rate)
  }, 0)

  const todayExpenses = transactions
    .filter(tx => {
      const isDebit = tx.type === 'debit' || parseFloat(tx.amount || 0) < 0
      const txDate = new Date(tx.date || tx.date_created)
      return isDebit && txDate.toDateString() === new Date().toDateString()
    })
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0)

  const monthRevenue = transactions
    .filter(tx => tx.type === 'credit' || parseFloat(tx.amount || 0) > 0)
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0)

  if (accountsLoading || transactionsLoading) {
    return (
      <div className="space-y-4">
        <div className="ds-card p-8"><div className="h-32 ds-skeleton rounded-lg" /></div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="ds-card p-6"><div className="h-24 ds-skeleton rounded-lg" /></div>)}
        </div>
        <div className="ds-card p-6"><div className="h-64 ds-skeleton rounded-lg" /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking Dashboard</h1>
          <p className="text-gray-500">Revolut Business - Comptes multi-devises</p>
        </div>
        <button className="ds-btn ds-btn-primary flex items-center gap-2">
          <RefreshCw size={16} />
          Synchroniser
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-zinc-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Solde Total</p>
            <h2 className="text-4xl font-bold mt-2">{formatCHF(totalBalanceCHF)}</h2>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-sm">
                {accounts.length} compte{accounts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <Landmark size={48} className="text-white/30" />
        </div>
      </div>

      {/* Currency Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedCurrency(account.currency || 'CHF')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedCurrency === (account.currency || 'CHF')
                  ? 'border-zinc-900 bg-zinc-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedCurrency === (account.currency || 'CHF') ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <CurrencyIcon currency={account.currency || 'CHF'} className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-400">{account.name || account.currency}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCHF(parseFloat(account.balance || 0), account.currency || 'CHF')}
              </p>
              {(account.currency || 'CHF') !== 'CHF' && (
                <p className="text-xs text-gray-500 mt-1">
                  ≈ {formatCHF(parseFloat(account.balance || 0) / (exchangeRates[account.currency] || 1))}
                </p>
              )}
              <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ background: 'var(--accent)', width: `${Math.min((parseFloat(account.balance || 0) / 200000) * 100, 100)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Depenses du jour</p>
          <p className="text-xl font-bold text-gray-900">{formatCHF(todayExpenses)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Revenus recents</p>
          <p className="text-xl font-bold text-green-600">+{formatCHF(monthRevenue)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-zinc-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-zinc-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Derniere sync</p>
          <p className="text-xl font-bold text-gray-900">Live</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="ds-card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Transactions recentes</h3>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.length > 0 ? transactions.map((tx, index) => {
            const isCredit = tx.type === 'credit' || parseFloat(tx.amount || 0) > 0
            const txDate = tx.date || tx.date_created
            return (
              <div
                key={tx.id}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-zinc-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isCredit
                      ? <ArrowDownRight className="w-5 h-5 text-green-600" />
                      : <ArrowUpRight className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.description || 'Transaction'}</p>
                    <p className="text-sm text-gray-500">
                      {tx.merchant_name || tx.reference || ''} {txDate && `· ${formatDistanceToNow(new Date(txDate), { addSuffix: true, locale: fr })}`}
                    </p>
                  </div>
                </div>
                <div className={`text-right font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                  {isCredit ? '+' : '-'}
                  {formatCHF(Math.abs(parseFloat(tx.amount || 0)), tx.currency || 'CHF')}
                </div>
              </div>
            )
          }) : (
            <div className="p-8 text-center text-gray-400">
              <Wallet size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune transaction</p>
            </div>
          )}
        </div>
        {transactions.length > 0 && (
          <div className="p-4 bg-gray-50 text-center">
            <button className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              Voir toutes les transactions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BankingDashboard
