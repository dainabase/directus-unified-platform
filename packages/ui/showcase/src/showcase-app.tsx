// 🎨 DAINABASE DESIGN SYSTEM - SHOWCASE APP
// Complete interactive showcase for 132+ enterprise components

import React from 'react';
import { ButtonsSection } from './sections/buttons-section';
import { FormsSection } from './sections/forms-section';
import { DataSection } from './sections/data-section';

export const ShowcaseApp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dainabase Design System
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            132+ Enterprise Components • Interactive Showcase • Live Examples
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Buttons Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Forms Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Data Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-600">5 more sections in progress...</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                <a href="#buttons" className="block text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-lg">
                  ✅ Buttons & Actions
                </a>
                <a href="#forms" className="block text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                  ✅ Forms & Inputs
                </a>
                <a href="#data" className="block text-purple-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                  ✅ Data Display
                </a>
                <a href="#navigation" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  🔄 Navigation
                </a>
                <a href="#feedback" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  🔄 Feedback
                </a>
                <a href="#media" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  🔄 Media & Content
                </a>
                <a href="#layout" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  🔄 Layout & Structure
                </a>
                <a href="#advanced" className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  🔄 Advanced Components
                </a>
              </nav>
              
              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Progress</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">3/8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Components</span>
                    <span className="font-medium">65+ showcased</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 h-2 rounded-full w-3/8"></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    🔥 37.5% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-16">
              {/* Welcome Section */}
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🚀 Welcome to the Showcase
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Explore our comprehensive design system with live, interactive examples. 
                  Each component is production-ready and comes with multiple variants, 
                  themes, and customization options.
                </p>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">132+</div>
                    <div className="text-sm text-gray-500">Total Components</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">65+</div>
                    <div className="text-sm text-gray-500">Showcased</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">6</div>
                    <div className="text-sm text-gray-500">Premium Themes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">100%</div>
                    <div className="text-sm text-gray-500">Interactive</div>
                  </div>
                </div>

                {/* What's New */}
                <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">🔥 Latest Updates</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Complete ButtonsSection with 13 variants and 6 themes
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Full FormsSection with 18+ components and validation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Data Display section with charts, tables, and BI components
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                      Navigation section coming next...
                    </li>
                  </ul>
                </div>
              </section>

              {/* Buttons Section */}
              <section id="buttons" className="bg-white rounded-xl shadow-md p-8">
                <ButtonsSection />
              </section>

              {/* Forms Section */}
              <section id="forms" className="bg-white rounded-xl shadow-md p-8">
                <FormsSection />
              </section>

              {/* Data Section */}
              <section id="data" className="bg-white rounded-xl shadow-md p-8">
                <DataSection />
              </section>

              {/* Coming Soon Sections */}
              <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-8 border-2 border-dashed border-gray-200">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                    <div className="text-2xl">🚀</div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5 More Sections Coming Soon
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
                    We're rapidly developing the remaining sections of the design system. 
                    Each will showcase dozens of production-ready components with the same 
                    level of detail and interactivity as the first three.
                  </p>
                  
                  {/* Preview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                    {[
                      { name: 'Navigation', icon: '🧭', count: '15+', desc: 'Menus, Tabs, Breadcrumbs', priority: 'next' },
                      { name: 'Feedback', icon: '💬', count: '12+', desc: 'Alerts, Dialogs, Toasts', priority: 'soon' },
                      { name: 'Media', icon: '🎬', count: '10+', desc: 'Images, Videos, Carousels', priority: 'soon' },
                      { name: 'Layout', icon: '📐', count: '18+', desc: 'Grids, Cards, Containers', priority: 'soon' },
                      { name: 'Advanced', icon: '⚡', count: '25+', desc: 'Kanban, Workflows, AI', priority: 'soon' },
                    ].map((section) => (
                      <div key={section.name} className={`bg-white rounded-lg p-4 border-2 ${
                        section.priority === 'next' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                      }`}>
                        <div className="text-2xl mb-2">{section.icon}</div>
                        <h3 className="font-semibold text-gray-900 text-sm">{section.name}</h3>
                        <div className={`font-medium text-xs ${
                          section.priority === 'next' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {section.count} components
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{section.desc}</p>
                        {section.priority === 'next' && (
                          <div className="mt-2 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            Next in Queue
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Achievement Badges */}
                  <div className="mt-8 flex justify-center space-x-4">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                      🏆 3 Sections Complete
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                      📊 65+ Components Showcased
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                      ⚡ 37.5% Coverage
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Dainabase Design System</h3>
            <p className="text-gray-600 text-sm mb-4">
              Enterprise-grade components for modern applications
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>v1.0.1-beta.2</span>
              <span>•</span>
              <span>132+ Components</span>
              <span>•</span>
              <span>Bundle: 50KB</span>
              <span>•</span>
              <span>TypeScript</span>
              <span>•</span>
              <span className="text-green-600 font-medium">3/8 Sections Live</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};