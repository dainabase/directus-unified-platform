// 🎯 NAVIGATION SECTION - MENUS, TABS & BREADCRUMBS SHOWCASE
// Demonstrates navigation components for app structure and user flow

import React, { useState } from 'react';
import { 
  Tabs,
  NavigationMenu,
  Breadcrumb,
  Pagination,
  Stepper,
  Menubar,
  CommandPalette
} from '../components';
import { 
  Navigation,
  Menu,
  ChevronRight,
  Command,
  Home,
  Package,
  Settings,
  Users,
  FileText,
  Grid3x3,
  Activity,
  ArrowLeft,
  ArrowRight,
  Search
} from 'lucide-react';

// =================== DEMO COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mb-2">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ComponentDemo = ({ 
  title, 
  description, 
  children, 
  fullWidth = false 
}: { 
  title: string, 
  description: string, 
  children: React.ReactNode,
  fullWidth?: boolean
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className={fullWidth ? "w-full" : "flex flex-wrap gap-4"}>
        {children}
      </div>
    </div>
  </div>
);

// =================== MAIN NAVIGATION SECTION ===================

export const NavigationSection = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStep, setCurrentStep] = useState(2);

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Electronics', href: '#' },
    { label: 'Laptops' }
  ];

  const menuItems = [
    { label: 'Dashboard', icon: Home },
    { label: 'Products', icon: Package },
    { label: 'Users', icon: Users },
    { label: 'Settings', icon: Settings }
  ];

  const stepperItems = [
    { label: 'Account Info', status: 'completed' },
    { label: 'Personal Details', status: 'current' },
    { label: 'Payment Method', status: 'upcoming' },
    { label: 'Review & Submit', status: 'upcoming' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Navigation Components
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Complete navigation system with tabs, menus, breadcrumbs, steppers,
          and pagination for intuitive user experiences.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={Navigation} value="7+" label="Components" />
          <StatCard icon={Menu} value="Responsive" label="Design" />
          <StatCard icon={Command} value="Keyboard" label="Navigation" />
          <StatCard icon={Grid3x3} value="A11Y" label="Compliant" />
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Tabs Component */}
        <ComponentDemo
          title="Tab Navigation"
          description="Modern tab component with smooth transitions and keyboard navigation"
          fullWidth
        >
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex space-x-1 border-b border-gray-200">
                {['overview', 'analytics', 'reports', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium text-sm capitalize transition-all ${
                      activeTab === tab
                        ? 'text-violet-600 border-b-2 border-violet-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="py-4">
                <div className="text-sm text-gray-600">
                  Active tab: <span className="font-semibold text-gray-900">{activeTab}</span>
                </div>
              </div>
            </Tabs>
          </div>
        </ComponentDemo>

        {/* Breadcrumb Component */}
        <ComponentDemo
          title="Breadcrumb Navigation"
          description="Clear path indication with interactive breadcrumb trails"
          fullWidth
        >
          <div className="w-full">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {breadcrumbItems.map((item, index) => (
                  <li key={index} className="inline-flex items-center">
                    {index > 0 && (
                      <ChevronRight className="w-5 h-5 text-gray-400 mx-1" />
                    )}
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-gray-700 hover:text-violet-600"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </ComponentDemo>

        {/* Stepper Component */}
        <ComponentDemo
          title="Process Stepper"
          description="Multi-step process indicators for forms and wizards"
          fullWidth
        >
          <div className="w-full">
            <div className="flex items-center justify-between">
              {stepperItems.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'current' ? 'bg-violet-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? '✓' : index + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      step.status === 'current' ? 'text-violet-600 font-semibold' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < stepperItems.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentStep - 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ComponentDemo>

        {/* Navigation Menu */}
        <ComponentDemo
          title="Navigation Menu"
          description="Dropdown navigation menus with sub-items and icons"
          fullWidth
        >
          <div className="w-full">
            <nav className="flex space-x-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </ComponentDemo>

        {/* Pagination Component */}
        <ComponentDemo
          title="Pagination"
          description="Navigate through large datasets with style"
          fullWidth
        >
          <div className="w-full flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-violet-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 5}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </ComponentDemo>

        {/* Command Palette */}
        <ComponentDemo
          title="Command Palette"
          description="Quick actions and search with keyboard shortcuts"
          fullWidth
        >
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Type a command or search... (⌘K)"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Press ⌘K to open the command palette
            </div>
          </div>
        </ComponentDemo>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-600 rounded-xl mb-4">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Intuitive Navigation</h3>
          <p className="text-gray-600 text-sm">Clear paths and smooth transitions for seamless user journeys.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <Command className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Keyboard Shortcuts</h3>
          <p className="text-gray-600 text-sm">Full keyboard navigation support for power users and accessibility.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Responsive Design</h3>
          <p className="text-gray-600 text-sm">Adaptive layouts that work perfectly on all device sizes.</p>
        </div>
      </div>
    </div>
  );
};