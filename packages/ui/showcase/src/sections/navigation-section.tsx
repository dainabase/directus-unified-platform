import React, { useState } from 'react';
import { 
  Home, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowLeft, 
  ArrowRight,
  MoreHorizontal 
} from 'lucide-react';

export const NavigationSection = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'details', label: 'Details', icon: Menu },
    { id: 'analytics', label: 'Analytics', icon: MoreHorizontal },
  ];

  const steps = [
    { id: 1, label: 'Account', status: 'completed' },
    { id: 2, label: 'Profile', status: 'current' },
    { id: 3, label: 'Settings', status: 'upcoming' },
    { id: 4, label: 'Review', status: 'upcoming' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Navigation Components
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          15+ navigation patterns including tabs, breadcrumbs, steppers, pagination, and menus.
        </p>
      </div>

      {/* Tabs Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tabs Component</h3>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Active tab: {activeTab}</p>
        </div>
      </div>

      {/* Breadcrumb Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Breadcrumb Navigation</h3>
        <nav className="flex items-center space-x-2">
          <a href="#" className="text-gray-500 hover:text-gray-700">Home</a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <a href="#" className="text-gray-500 hover:text-gray-700">Products</a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <a href="#" className="text-gray-500 hover:text-gray-700">Electronics</a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Laptops</span>
        </nav>
      </div>

      {/* Stepper Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Stepper Component</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500 text-white' :
                  step.status === 'current' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step.status === 'completed' ? '✓' : step.id}
                </div>
                <div className="text-xs text-center mt-2">{step.label}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 mx-2 ${
                  steps[index + 1].status !== 'upcoming' ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Pagination Component</h3>
        <div className="flex items-center justify-center space-x-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};