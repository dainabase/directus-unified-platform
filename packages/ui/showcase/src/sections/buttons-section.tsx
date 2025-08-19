// 🎯 BUTTONS & ACTIONS SECTION - COMPLETE INTERACTIVE SHOWCASE
// Demonstrates all 132+ button variants, themes, and specialized components

import React, { useState } from 'react';
import { 
  Button, 
  ExecutiveButton, 
  ActionButton, 
  AnalyticsButton, 
  FinanceButton,
  type ButtonTheme,
  type ButtonVariant,
  type ButtonSize 
} from '../../../src/components/button';
import { 
  Zap, 
  Palette, 
  Code, 
  Download,
  TrendingUp,
  BarChart3,
  DollarSign,
  Settings,
  Play,
  Pause,
  Star,
  Bell,
  Users,
  Globe,
  Shield,
  Clock
} from 'lucide-react';

// =================== INTERACTIVE DEMO COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-2">
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
  code 
}: { 
  title: string, 
  description: string, 
  children: React.ReactNode,
  code?: string 
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-3">
        {children}
      </div>
    </div>
    {code && (
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <code className="text-xs text-gray-700 font-mono">{code}</code>
      </div>
    )}
  </div>
);

const ThemeDemo = ({ theme, children }: { theme: ButtonTheme, children: React.ReactNode }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
    <h4 className="font-medium text-gray-800 mb-3 capitalize">{theme} Theme</h4>
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  </div>
);

// =================== MAIN BUTTONS SECTION ===================

export const ButtonsSection = () => {
  const [activeDemo, setActiveDemo] = useState<string>('themes');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleLoadingDemo = (buttonId: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    }, 3000);
  };

  const themes: ButtonTheme[] = ['executive', 'analytics', 'finance', 'dashboard', 'minimal', 'default'];
  const variants: ButtonVariant[] = ['primary', 'secondary', 'executive', 'action', 'analytics', 'finance', 'danger', 'success', 'ghost', 'outline', 'link'];
  const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  return (
    <div className="space-y-8">
      {/* Hero Section with impressive stats */}
      <div className="text-center bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Buttons & Actions Showcase
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Enterprise-grade button system with 6 premium themes, 13 specialized variants, 
          and advanced features like glassmorphism, keyboard shortcuts, and real-time analytics.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={Zap} value="13+" label="Variants" />
          <StatCard icon={Palette} value="6" label="Themes" />
          <StatCard icon={Code} value="100%" label="TypeScript" />
          <StatCard icon={Star} value="A11Y" label="Accessible" />
        </div>
      </div>

      {/* Interactive Demo Navigation */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {[
          { id: 'themes', label: 'Premium Themes', icon: Palette },
          { id: 'variants', label: 'All Variants', icon: Zap },
          { id: 'specialized', label: 'Specialized', icon: Star },
          { id: 'interactive', label: 'Interactive', icon: Play },
          { id: 'advanced', label: 'Advanced', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveDemo(id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeDemo === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Premium Themes Demo */}
        {activeDemo === 'themes' && (
          <ComponentDemo
            title="Premium Theme System"
            description="6 sophisticated themes designed for executive dashboards, analytics, finance, and modern business applications"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {themes.map((theme) => (
                <ThemeDemo key={theme} theme={theme}>
                  <Button theme={theme} variant="primary" size="md">
                    Primary
                  </Button>
                  <Button theme={theme} variant="secondary" size="md">
                    Secondary
                  </Button>
                  <Button theme={theme} variant="ghost" size="md">
                    Ghost
                  </Button>
                </ThemeDemo>
              ))}
            </div>
          </ComponentDemo>
        )}

        {/* All Variants Demo */}
        {activeDemo === 'variants' && (
          <>
            <ComponentDemo
              title="Core Variants"
              description="Essential button variants for every business scenario"
              code="<Button variant='primary'>Primary</Button>"
            >
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size="md">
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Button>
              ))}
            </ComponentDemo>

            <ComponentDemo
              title="Size System"
              description="Consistent sizing system from compact UIs to hero actions"
              code="<Button size='lg'>Large Button</Button>"
            >
              {sizes.map((size) => (
                <Button key={size} size={size}>
                  Size {size.toUpperCase()}
                </Button>
              ))}
            </ComponentDemo>
          </>
        )}

        {/* Specialized Components Demo */}
        {activeDemo === 'specialized' && (
          <>
            <ComponentDemo
              title="Executive Buttons"
              description="C-level dashboard buttons with metrics and trends"
              code="<ExecutiveButton metric='Q4 Revenue' trend='up' priority='high'>$2.4M</ExecutiveButton>"
            >
              <ExecutiveButton metric="Q4 Revenue" trend="up" priority="high">
                $2.4M Growth
              </ExecutiveButton>
              <ExecutiveButton metric="User Engagement" trend="up" priority="medium">
                +24% Month
              </ExecutiveButton>
              <ExecutiveButton metric="Cost Savings" trend="down" priority="low">
                -$150K Annual
              </ExecutiveButton>
            </ComponentDemo>

            <ComponentDemo
              title="Analytics Buttons"
              description="Data visualization and business intelligence actions"
              code="<AnalyticsButton dataType='chart' visualizationType='line'>Generate Report</AnalyticsButton>"
            >
              <AnalyticsButton dataType="chart" visualizationType="line">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </AnalyticsButton>
              <AnalyticsButton dataType="export">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </AnalyticsButton>
              <AnalyticsButton dataType="drill-down">
                <TrendingUp className="w-4 h-4 mr-2" />
                Drill Down
              </AnalyticsButton>
            </ComponentDemo>

            <ComponentDemo
              title="Finance Buttons"
              description="Financial operations with currency formatting"
              code="<FinanceButton financialAction='approve' amount={15000}>Approve Budget</FinanceButton>"
            >
              <FinanceButton financialAction="approve" amount={15000}>
                Approve Budget
              </FinanceButton>
              <FinanceButton financialAction="review" amount={75000}>
                Review Proposal
              </FinanceButton>
              <FinanceButton financialAction="forecast" amount={250000}>
                Q1 Forecast
              </FinanceButton>
            </ComponentDemo>

            <ComponentDemo
              title="Action Buttons"
              description="Quick action buttons with contextual icons"
              code="<ActionButton actionType='create'>New Project</ActionButton>"
            >
              <ActionButton actionType="create">New Project</ActionButton>
              <ActionButton actionType="edit">Edit Settings</ActionButton>
              <ActionButton actionType="export">Export All</ActionButton>
              <ActionButton actionType="delete" variant="danger">Delete Item</ActionButton>
            </ComponentDemo>
          </>
        )}

        {/* Interactive Features Demo */}
        {activeDemo === 'interactive' && (
          <>
            <ComponentDemo
              title="Loading States & Animations"
              description="Advanced loading states with custom animations and feedback"
              code="<Button loading loadingText='Processing...'>Submit</Button>"
            >
              <Button 
                loading={loadingStates.submit} 
                loadingText="Processing..."
                onClick={() => handleLoadingDemo('submit')}
              >
                Submit Form
              </Button>
              <Button 
                loading={loadingStates.save} 
                loadingText="Saving..."
                variant="secondary"
                onClick={() => handleLoadingDemo('save')}
              >
                Save Draft
              </Button>
              <Button 
                loading={loadingStates.upload} 
                loadingText="Uploading..."
                variant="success"
                onClick={() => handleLoadingDemo('upload')}
              >
                Upload File
              </Button>
            </ComponentDemo>

            <ComponentDemo
              title="Icons & Badges"
              description="Rich icon system with notification badges and indicators"
              code="<Button icon='bell' badge={3} badgeVariant='error'>Notifications</Button>"
            >
              <Button icon="bell" badge={3} badgeVariant="error">
                Notifications
              </Button>
              <Button icon="users" badge="New" badgeVariant="success">
                Team Members
              </Button>
              <Button icon="download" badge={12} badgeVariant="warning">
                Downloads
              </Button>
              <Button icon="shield" badge="Pro" badgeVariant="default">
                Security
              </Button>
            </ComponentDemo>

            <ComponentDemo
              title="Keyboard Shortcuts"
              description="Built-in keyboard shortcuts for power users"
              code="<Button shortcut='Ctrl+S' icon='download'>Save Report</Button>"
            >
              <Button shortcut="Ctrl+S" icon="download">
                Save Report
              </Button>
              <Button shortcut="Ctrl+N" icon="zap">
                New Project
              </Button>
              <Button shortcut="Ctrl+E" icon="settings">
                Edit Settings
              </Button>
            </ComponentDemo>
          </>
        )}

        {/* Advanced Features Demo */}
        {activeDemo === 'advanced' && (
          <>
            <ComponentDemo
              title="Glassmorphism & Modern Effects"
              description="Premium visual effects with glassmorphism and gradients"
              code="<Button glassmorphism gradient animateOnHover>Premium Action</Button>"
            >
              <Button glassmorphism theme="executive" className="backdrop-blur-lg">
                Glassmorphism
              </Button>
              <Button gradient theme="analytics">
                Gradient Theme
              </Button>
              <Button animateOnHover theme="finance" className="hover:scale-105">
                Hover Animation
              </Button>
              <Button pulseOnMount theme="dashboard">
                Pulse Effect
              </Button>
            </ComponentDemo>

            <ComponentDemo
              title="Floating Action Buttons"
              description="Modern FAB design for primary actions"
              code="<Button variant='floating' icon='zap'>FAB</Button>"
            >
              <div className="relative h-20 w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600 mb-8">Floating buttons appear fixed</p>
                <Button 
                  variant="floating" 
                  icon="zap" 
                  className="relative bottom-0 right-0"
                  size="fab"
                />
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Enterprise Dashboard Integration"
              description="Real-world examples with business metrics and KPIs"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-4">Revenue Dashboard</h4>
                  <div className="space-y-3">
                    <ExecutiveButton metric="Monthly" trend="up" priority="high" className="w-full">
                      $847K Revenue
                    </ExecutiveButton>
                    <FinanceButton financialAction="forecast" amount={1200000} className="w-full">
                      Q1 Projection
                    </FinanceButton>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-4">Analytics Hub</h4>
                  <div className="space-y-3">
                    <AnalyticsButton dataType="chart" className="w-full">
                      Generate Report
                    </AnalyticsButton>
                    <ActionButton actionType="export" className="w-full">
                      Export Insights
                    </ActionButton>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-emerald-900 mb-4">Operations</h4>
                  <div className="space-y-3">
                    <Button theme="minimal" icon="users" className="w-full">
                      Team Management
                    </Button>
                    <Button theme="minimal" icon="settings" className="w-full">
                      System Config
                    </Button>
                  </div>
                </div>
              </div>
            </ComponentDemo>
          </>
        )}
      </div>

      {/* Implementation Code Examples */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 text-white">🚀 Quick Implementation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Basic Usage</h4>
            <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
{`import { Button } from '@dainabase/ui';

<Button variant="primary" theme="executive">
  Executive Action
</Button>`}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Advanced Features</h4>
            <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
{`<ExecutiveButton 
  metric="Q4 Revenue" 
  trend="up" 
  priority="high"
  shortcut="Ctrl+R"
  badge={2}
>
  $2.4M Growth
</ExecutiveButton>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Premium Themes</h3>
          <p className="text-gray-600 text-sm">Executive, Analytics, Finance, Dashboard, and more premium themes for enterprise applications.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Rich Interactions</h3>
          <p className="text-gray-600 text-sm">Loading states, keyboard shortcuts, badges, glassmorphism, and advanced animations.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Enterprise Ready</h3>
          <p className="text-gray-600 text-sm">TypeScript support, accessibility features, analytics tracking, and production-tested reliability.</p>
        </div>
      </div>
    </div>
  );
};