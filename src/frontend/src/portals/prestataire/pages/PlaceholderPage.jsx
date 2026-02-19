/**
 * PlaceholderPage — Placeholder générique pour les routes prestataire en attente.
 */

import React from 'react'
import { Construction } from 'lucide-react'

const PlaceholderPage = ({ title = 'En cours de développement', description }) => {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
      <Construction className="w-12 h-12 text-gray-300 mb-4" />
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </div>
  )
}

export default PlaceholderPage
