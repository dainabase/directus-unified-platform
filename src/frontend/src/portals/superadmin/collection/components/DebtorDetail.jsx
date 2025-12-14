// src/portals/superadmin/collection/components/DebtorDetail.jsx
import React from 'react';
import { ArrowLeft, Mail, Phone, FileText, Clock, DollarSign } from 'lucide-react';

const DebtorDetail = ({ debtorId, onBack, onRefresh }) => {
  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Retour à la liste
      </button>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Détail du débiteur #{debtorId}</h3>
        <p className="text-gray-500">Chargement des informations...</p>
      </div>
    </div>
  );
};

export default DebtorDetail;
