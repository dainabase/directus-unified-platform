import React, { useState, useEffect } from 'react';
import { Moon, Sun, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { ButtonsSection } from './sections/buttons-section';
import { FormsSection } from './sections/forms-section';
import { DataSection } from './sections/data-section';
import { NavigationSection } from './sections/navigation-section';
import { FeedbackSection } from './sections/feedback-section';
import { MediaSection } from './sections/media-section';
import { LayoutSection } from './sections/layout-section';
import { AdvancedSection } from './sections/advanced-section';
import './modern-design.css';

export const ShowcaseApp = () => {
  const [activeSection, setActiveSection] = useState('buttons');
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#fcfcfc';
    }
  }, [darkMode]);
  
  const sections = [
    { id: 'buttons', label: 'Buttons & Actions', count: 12, component: ButtonsSection },
    { id: 'forms', label: 'Forms & Inputs', count: 24, component: FormsSection },
    { id: 'data', label: 'Data Display', count: 22, component: DataSection },
    { id: 'navigation', label: 'Navigation', count: 14, component: NavigationSection },
    { id: 'feedback', label: 'Feedback & Alerts', count: 12, component: FeedbackSection },
    { id: 'media', label: 'Media & Content', count: 16, component: MediaSection },
    { id: 'layout', label: 'Layout & Structure', count: 15, component: LayoutSection },
    { id: 'advanced', label: 'Advanced', count: 17, component: AdvancedSection }
  ];

  const totalComponents = sections.reduce((sum, section) => sum + section.count, 0);
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || ButtonsSection;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Ultra Modern Header */}
      <header className="border-b border-violet-500/20 backdrop-blur-xl bg-black/60 sticky top-0 z-50 shadow-lg shadow-violet-500/10">
        <div className="modern-container">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-110">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">Dainabase UI</h1>
                  <p className="text-sm text-gray-400">AI Design System 2025</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-8">
                <a href="#" className="text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-violet-500/30 transition-all">Components</a>
                <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Resources</a>
              </nav>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="modern-button modern-button-secondary">
                v2.0
              </button>
              
              {/* Modern Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl hover:bg-violet-500/20 transition-colors text-gray-300 hover:text-white"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} className="text-cyan-400" /> : <Moon size={20} className="text-violet-400" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - AI Tech Style */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none"></div>
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.3)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.3)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.2)_0%,transparent_50%)]"></div>
        <div className="modern-container py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-full text-sm font-medium mb-12 shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 border border-violet-500/30">
              <Zap className="w-4 h-4 animate-pulse text-cyan-300" />
              <span className="font-bold">{totalComponents}</span> AI-Powered Components
            </div>
            
            <h2 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-none">
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Build faster.</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent relative">
                Ship sooner.
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Next-generation AI design system built for the future. 
              <span className="text-violet-400 font-semibold">TypeScript-first</span>, <span className="text-pink-400 font-semibold">fully accessible</span>, and <span className="text-cyan-400 font-semibold">blazing fast</span>.
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              <button className="modern-button modern-button-primary text-base px-10 py-5 group shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300">
                Get Started 
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="modern-button modern-button-secondary text-base px-10 py-5 hover:scale-105 transition-all duration-300 border-2">
                View on GitHub
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid - AI Tech */}
      <section className="py-20 border-y border-violet-500/20 bg-gradient-to-r from-violet-900/10 via-black to-cyan-900/10">
        <div className="modern-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{totalComponents}</div>
              <div className="text-sm text-gray-400 font-medium">AI Components</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">100%</div>
              <div className="text-sm text-gray-400 font-medium">TypeScript</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">&lt;50KB</div>
              <div className="text-sm text-gray-400 font-medium">Bundle Size</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">A11y</div>
              <div className="text-sm text-gray-400 font-medium">Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - AI Tech Layout */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)]"></div>
        <div className="modern-container">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
            {/* Modern Sidebar */}
            <aside>
              <div className="modern-nav">
                <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-4 px-1">
                  AI Components
                </h3>
                <div className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`modern-nav-item ${
                        activeSection === section.id 
                          ? 'active' 
                          : ''
                      }`}
                    >
                      <span>{section.label}</span>
                      <span className={`text-xs ${
                        activeSection === section.id ? 'text-white' : 'text-gray-500'
                      }`}>{section.count}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-violet-500/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{totalComponents}</div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Components</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <main>
              <div className="modern-animate" key={activeSection}>
                <div className="mb-12">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-lg text-gray-300">
                    Explore our collection of <span className="text-violet-400 font-semibold">{sections.find(s => s.id === activeSection)?.count}</span> AI-powered components.
                  </p>
                </div>
                
                <div className="modern-card">
                  <ActiveComponent />
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-violet-500/20 py-20 bg-gradient-to-b from-black to-violet-950/20">
        <div className="modern-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Dainabase UI</h3>
              </div>
              <p className="text-gray-400 max-w-sm">
                Next-generation AI design system built for the future. 
                Create stunning applications with our AI-powered components.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-violet-400">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-violet-400 transition-colors">Components</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">License</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-violet-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Dainabase UI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="text-violet-400">Version 2.0</span>
              <span className="text-gray-600">•</span>
              <span className="text-pink-400">{totalComponents} Components</span>
              <span className="text-gray-600">•</span>
              <span className="text-cyan-400">MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};