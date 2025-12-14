// src/portals/superadmin/collection/components/WorkflowConfig.jsx
import React from 'react';
import { Settings, Clock, Mail, FileText } from 'lucide-react';

const WorkflowConfig = ({ company }) => {
  const steps = [
    { id: 1, name: 'Rappel 1', delay: 7, template: 'reminder_1', active: true },
    { id: 2, name: 'Rappel 2', delay: 14, template: 'reminder_2', active: true },
    { id: 3, name: 'Mise en demeure', delay: 30, template: 'formal_notice', active: true },
    { id: 4, name: 'Réquisition LP', delay: 45, template: 'lp_request', active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuration du workflow</h3>
        <span className="text-sm text-gray-500">{company}</span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Configuration du workflow de recouvrement automatisé selon la législation suisse (LP).
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{step.name}</p>
              <p className="text-sm text-gray-500">Délai: J+{step.delay}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">{step.template}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={step.active} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowConfig;
