import React from 'react'
import { DollarSign, TrendingUp, FileText, CreditCard } from 'lucide-react'

const FinancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-sm text-gray-500">
          Manage invoices, payments, and financial reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <DollarSign className="h-8 w-8 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">CHF 524,320</p>
          <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
        </div>

        <div className="glass rounded-xl p-6">
          <FileText className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Outstanding</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">CHF 45,200</p>
          <p className="text-sm text-gray-500 mt-1">12 invoices pending</p>
        </div>

        <div className="glass rounded-xl p-6">
          <CreditCard className="h-8 w-8 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">CHF 182,450</p>
          <p className="text-sm text-red-600 mt-1">+8.3% from last month</p>
        </div>

        <div className="glass rounded-xl p-6">
          <TrendingUp className="h-8 w-8 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Profit Margin</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">34.8%</p>
          <p className="text-sm text-green-600 mt-1">+2.1% improvement</p>
        </div>
      </div>

      <div className="glass rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <p className="text-gray-600">Finance module implementation coming soon...</p>
      </div>
    </div>
  )
}

export default FinancePage