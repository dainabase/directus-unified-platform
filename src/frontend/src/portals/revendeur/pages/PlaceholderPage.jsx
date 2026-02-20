import React from 'react'
import { Construction } from 'lucide-react'

const PlaceholderPage = ({ title = 'Module', description = 'En cours de developpement' }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Construction className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500">{description}</p>
    </div>
  </div>
)

export default PlaceholderPage
