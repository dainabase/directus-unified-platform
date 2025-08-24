import React, { useState } from 'react';
import { 
  Filter,
  AlertTriangle,
  Layout,
  Grid3x3,
  PanelLeftOpen,
  Bell,
  Search,
  Hash,
  Palette,
  Moon,
  FolderTree,
  Table2,
  AtSign,
  Navigation,
  Database,
  Clock,
  TestTube
} from 'lucide-react';

export const AdvancedSection = () => {
  const [activeTab, setActiveTab] = useState('filter');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationCount] = useState(3);

  const advancedComponents = [
    {
      id: 'filter',
      name: 'Advanced Filter',
      icon: Filter,
      description: 'Complex filtering with multiple conditions',
      demo: (
        <div className="space-y-3">
          <div className="flex gap-2">
            <select className="modern-button modern-button-secondary flex-1">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="modern-button modern-button-secondary flex-1">
              <option>Type</option>
              <option>User</option>
              <option>Admin</option>
            </select>
            <select className="modern-button modern-button-secondary flex-1">
              <option>Date Range</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Search..." className="flex-1 px-3 py-2 border border-gray-200 rounded-md" />
            <button className="modern-button modern-button-primary">Apply Filters</button>
          </div>
        </div>
      )
    },
    {
      id: 'alert-dialog',
      name: 'Alert Dialog',
      icon: AlertTriangle,
      description: 'Confirmation dialogs with actions',
      demo: (
        <div className="text-center">
          <button className="modern-button modern-button-primary">
            Open Alert Dialog
          </button>
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Are you sure?</h4>
            <p className="text-sm text-gray-600 mb-3">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button className="modern-button modern-button-secondary">Cancel</button>
              <button className="modern-button modern-button-primary">Confirm</button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'app-shell',
      name: 'App Shell',
      icon: Layout,
      description: 'Complete application layout structure',
      demo: (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-900 text-white p-2 text-xs">Header</div>
          <div className="flex" style={{ height: '200px' }}>
            <div className="bg-gray-100 p-2 text-xs w-48">Sidebar</div>
            <div className="flex-1 p-4 bg-white">
              <div className="bg-gray-50 rounded p-4 h-full">Main Content</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard-grid',
      name: 'Dashboard Grid',
      icon: Grid3x3,
      description: 'Responsive grid layout for dashboards',
      demo: (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-gray-100 rounded-lg p-4 h-24">Wide Widget</div>
          <div className="bg-gray-100 rounded-lg p-4 h-24">Widget</div>
          <div className="bg-gray-100 rounded-lg p-4 h-24">Widget</div>
          <div className="bg-gray-100 rounded-lg p-4 h-24">Widget</div>
          <div className="bg-gray-100 rounded-lg p-4 h-24">Widget</div>
        </div>
      )
    },
    {
      id: 'drawer',
      name: 'Drawer',
      icon: PanelLeftOpen,
      description: 'Slide-out panels for additional content',
      demo: (
        <div>
          <button 
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="modern-button modern-button-primary"
          >
            {drawerOpen ? 'Close' : 'Open'} Drawer
          </button>
          {drawerOpen && (
            <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Drawer Content</h4>
              <p className="text-sm text-gray-600 mb-3">This is a drawer component that slides in from the side.</p>
              <button className="modern-button modern-button-ghost w-full">Action</button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'notification-center',
      name: 'Notification Center',
      icon: Bell,
      description: 'Centralized notification management',
      demo: (
        <div className="relative">
          <button className="modern-button modern-button-secondary relative">
            <Bell size={16} />
            Notifications
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          <div className="mt-3 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="p-2 bg-blue-50 rounded">New message from user</div>
            <div className="p-2 bg-green-50 rounded">Task completed successfully</div>
            <div className="p-2 bg-amber-50 rounded">System update available</div>
          </div>
        </div>
      )
    },
    {
      id: 'search-bar',
      name: 'Search Bar',
      icon: Search,
      description: 'Advanced search with suggestions',
      demo: (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">Recent: Dashboard settings</div>
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">Recent: User profile</div>
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">Recent: API documentation</div>
          </div>
        </div>
      )
    },
    {
      id: 'tag-input',
      name: 'Tag Input',
      icon: Hash,
      description: 'Multi-tag input with autocomplete',
      demo: (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="modern-badge">React</span>
            <span className="modern-badge">TypeScript</span>
            <span className="modern-badge">Design System</span>
          </div>
          <input 
            type="text" 
            placeholder="Add tags..." 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          />
        </div>
      )
    },
    {
      id: 'theme-builder',
      name: 'Theme Builder',
      icon: Palette,
      description: 'Visual theme customization tool',
      demo: (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded cursor-pointer"></div>
            <div className="w-8 h-8 bg-purple-500 rounded cursor-pointer"></div>
            <div className="w-8 h-8 bg-green-500 rounded cursor-pointer"></div>
            <div className="w-8 h-8 bg-orange-500 rounded cursor-pointer"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Border Radius</span>
              <input type="range" className="w-32" />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Spacing</span>
              <input type="range" className="w-32" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'theme-toggle',
      name: 'Theme Toggle',
      icon: Moon,
      description: 'Dark/light mode switcher',
      demo: (
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm">Light</span>
          <button className="modern-toggle active">
            <span className="modern-toggle-thumb">
              <Moon size={14} />
            </span>
          </button>
          <span className="text-sm">Dark</span>
        </div>
      )
    },
    {
      id: 'tree-view',
      name: 'Tree View',
      icon: FolderTree,
      description: 'Hierarchical data display',
      demo: (
        <div className="space-y-1 text-sm">
          <div className="p-2 hover:bg-gray-50 rounded">📁 src/</div>
          <div className="pl-4 space-y-1">
            <div className="p-2 hover:bg-gray-50 rounded">📁 components/</div>
            <div className="pl-4 space-y-1">
              <div className="p-2 hover:bg-gray-50 rounded">📄 Button.tsx</div>
              <div className="p-2 hover:bg-gray-50 rounded">📄 Card.tsx</div>
            </div>
            <div className="p-2 hover:bg-gray-50 rounded">📁 utils/</div>
            <div className="p-2 hover:bg-gray-50 rounded">📄 index.ts</div>
          </div>
        </div>
      )
    },
    {
      id: 'virtualized-table',
      name: 'Virtualized Table',
      icon: Table2,
      description: 'Performance table for large datasets',
      demo: (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="p-2">001</td><td className="p-2">Item 1</td><td className="p-2">Active</td></tr>
              <tr className="border-t"><td className="p-2">002</td><td className="p-2">Item 2</td><td className="p-2">Active</td></tr>
              <tr className="border-t"><td className="p-2">003</td><td className="p-2">Item 3</td><td className="p-2">Inactive</td></tr>
            </tbody>
          </table>
          <div className="p-2 bg-gray-50 text-center text-xs text-gray-500">
            Rendering 3 of 10,000 items
          </div>
        </div>
      )
    },
    {
      id: 'mentions',
      name: 'Mentions',
      icon: AtSign,
      description: 'User mention with autocomplete',
      demo: (
        <div>
          <textarea 
            className="w-full p-3 border border-gray-200 rounded-lg" 
            rows={3}
            placeholder="Type @ to mention someone..."
            defaultValue="Hey @john.doe, can you review this?"
          />
          <div className="mt-2 space-y-1 text-sm">
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              @john.doe
            </div>
            <div className="p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              @jane.smith
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'breadcrumbs',
      name: 'Breadcrumbs Enhanced',
      icon: Navigation,
      description: 'Advanced navigation breadcrumbs',
      demo: (
        <nav className="flex items-center space-x-2 text-sm">
          <a href="#" className="text-gray-500 hover:text-gray-700">Home</a>
          <span className="text-gray-400">/</span>
          <a href="#" className="text-gray-500 hover:text-gray-700">Products</a>
          <span className="text-gray-400">/</span>
          <a href="#" className="text-gray-500 hover:text-gray-700">Electronics</a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Laptops</span>
        </nav>
      )
    },
    {
      id: 'data-grid-adv',
      name: 'DataGrid Advanced',
      icon: Database,
      description: 'Excel-like data grid with editing',
      demo: (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 flex gap-2">
            <button className="text-xs px-2 py-1 bg-white rounded border">Filter</button>
            <button className="text-xs px-2 py-1 bg-white rounded border">Sort</button>
            <button className="text-xs px-2 py-1 bg-white rounded border">Export</button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-px bg-gray-200">
              <div className="bg-gray-50 p-2 font-medium text-sm">A</div>
              <div className="bg-gray-50 p-2 font-medium text-sm">B</div>
              <div className="bg-gray-50 p-2 font-medium text-sm">C</div>
              <div className="bg-gray-50 p-2 font-medium text-sm">D</div>
              <div className="bg-white p-2 text-sm">Cell A1</div>
              <div className="bg-white p-2 text-sm">Cell B1</div>
              <div className="bg-white p-2 text-sm">Cell C1</div>
              <div className="bg-white p-2 text-sm">Cell D1</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'timeline-enhanced',
      name: 'Timeline Enhanced',
      icon: Clock,
      description: 'Interactive timeline with events',
      demo: (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-px h-16 bg-gray-300"></div>
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-sm">Project Started</h5>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-px h-16 bg-gray-300"></div>
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-sm">Milestone Reached</h5>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex-1 opacity-50">
              <h5 className="font-medium text-sm">Next: Deploy</h5>
              <p className="text-xs text-gray-500">Planned</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'chromatic-test',
      name: 'Chromatic Test',
      icon: TestTube,
      description: 'Visual regression testing component',
      demo: (
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Component States</h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded text-center">✓ Default</div>
              <div className="bg-green-50 p-2 rounded text-center">✓ Hover</div>
              <div className="bg-green-50 p-2 rounded text-center">✓ Active</div>
              <div className="bg-green-50 p-2 rounded text-center">✓ Disabled</div>
              <div className="bg-red-50 p-2 rounded text-center">✗ Error</div>
              <div className="bg-green-50 p-2 rounded text-center">✓ Loading</div>
            </div>
          </div>
          <button className="modern-button modern-button-secondary w-full">
            Run Visual Tests
          </button>
        </div>
      )
    }
  ];

  const activeComponent = advancedComponents.find(c => c.id === activeTab) || advancedComponents[0];

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
        {advancedComponents.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.id}
              onClick={() => setActiveTab(component.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === component.id 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={16} />
              {component.name}
            </button>
          );
        })}
      </div>

      {/* Active Component Display */}
      <div className="modern-card modern-animate" key={activeTab}>
        <div className="flex items-start gap-4 mb-6">
          <activeComponent.icon className="w-8 h-8 text-gray-700" />
          <div>
            <h3 className="modern-heading">{activeComponent.name}</h3>
            <p className="modern-body mt-1">{activeComponent.description}</p>
          </div>
        </div>
        
        <div className="modern-preview">
          {activeComponent.demo}
        </div>
      </div>

      {/* Summary */}
      <div className="modern-card text-center">
        <h4 className="modern-subheading">17 Advanced Components</h4>
        <p className="modern-body mt-2">
          Powerful components for complex applications including data visualization, 
          AI features, and enterprise-grade UI patterns.
        </p>
      </div>
    </div>
  );
};