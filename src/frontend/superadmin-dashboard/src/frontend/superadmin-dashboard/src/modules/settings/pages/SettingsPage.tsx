import React from 'react'
import { useParams } from 'react-router-dom'

const SettingsPage: React.FC = () => {
  const { section } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Configure your platform preferences and settings
        </p>
      </div>
      
      <div className="glass rounded-xl p-8">
        <p className="text-gray-600">
          Settings {section ? `- ${section}` : ''} page implementation coming soon...
        </p>
      </div>
    </div>
  )
}

export default SettingsPage