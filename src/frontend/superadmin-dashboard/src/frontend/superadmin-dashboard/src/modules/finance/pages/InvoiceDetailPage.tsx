import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <Link
        to="/finance"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Finance</span>
      </Link>
      
      <div className="glass rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
        <p className="text-gray-500 mt-2">Invoice ID: {id}</p>
        <div className="mt-8">
          <p className="text-gray-600">Invoice detail page coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailPage