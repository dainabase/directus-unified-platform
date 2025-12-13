import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </Link>
      
      <div className="glass rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
        <p className="text-gray-500 mt-2">Project ID: {id}</p>
        <div className="mt-8">
          <p className="text-gray-600">Project detail page coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage