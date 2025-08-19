// 🎨 DAINABASE DESIGN SYSTEM - SHOWCASE APP
// Complete interactive showcase for 132+ enterprise components

import React from 'react';
import { ButtonsSection } from './sections/buttons-section';

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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                <a href="#buttons" className="block text-blue-600 font-medium">
                  Buttons & Actions
                </a>
                <a href="#forms" className="block text-gray-600 hover:text-blue-600">
                  Forms & Inputs
                </a>
                <a href="#data" className="block text-gray-600 hover:text-blue-600">
                  Data Display
                </a>
                <a href="#navigation" className="block text-gray-600 hover:text-blue-600">
                  Navigation
                </a>
                <a href="#feedback" className="block text-gray-600 hover:text-blue-600">
                  Feedback
                </a>
                <a href="#media" className="block text-gray-600 hover:text-blue-600">
                  Media & Content
                </a>
                <a href="#layout" className="block text-gray-600 hover:text-blue-600">
                  Layout & Structure
                </a>
                <a href="#advanced" className="block text-gray-600 hover:text-blue-600">
                  Advanced Components
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-12">
              {/* Welcome Section */}
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to the Showcase
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Explore our comprehensive design system with live, interactive examples. 
                  Each component is production-ready and comes with multiple variants, 
                  themes, and customization options.
                </p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">132+</div>
                    <div className="text-sm text-gray-500">Components</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-500">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">6</div>
                    <div className="text-sm text-gray-500">Themes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">100%</div>
                    <div className="text-sm text-gray-500">Interactive</div>
                  </div>
                </div>
              </section>

              {/* Buttons Section */}
              <section id="buttons" className="bg-white rounded-xl shadow-md p-8">
                <ButtonsSection />
              </section>

              {/* More sections will be added by Claude Code */}
              <section className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🚀 Ready for Development
                </h2>
                <p className="text-gray-600">
                  This is the foundation structure. Claude Code will expand this into a 
                  complete, interactive showcase with all 132+ components, live examples, 
                  code snippets, and beautiful animations.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};