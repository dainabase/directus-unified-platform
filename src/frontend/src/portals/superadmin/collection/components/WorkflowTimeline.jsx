// src/portals/superadmin/collection/components/WorkflowTimeline.jsx
import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const WorkflowTimeline = ({ debtorId }) => {
  const steps = [
    { id: 1, label: 'Rappel 1', status: 'completed', date: '2024-01-15' },
    { id: 2, label: 'Rappel 2', status: 'completed', date: '2024-01-30' },
    { id: 3, label: 'Mise en demeure', status: 'current', date: '2024-02-15' },
    { id: 4, label: 'Réquisition de poursuite', status: 'pending', date: null },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-4">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
              step.status === 'current' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-400'}
          `}>
            {step.status === 'completed' ? <CheckCircle size={16} /> : 
             step.status === 'current' ? <Clock size={16} /> : 
             <span className="text-xs">{index + 1}</span>}
          </div>
          <div>
            <p className="font-medium text-gray-900">{step.label}</p>
            <p className="text-sm text-gray-500">{step.date || 'En attente'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowTimeline;
