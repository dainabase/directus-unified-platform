---
id: app-shell
title: App Shell Component
sidebar_position: 58
---

import { AppShell, AppShellHeader, AppShellSidebar, AppShellMain, AppShellFooter } from '@dainabase/ui';

# App Shell

A comprehensive layout component that provides the fundamental structure for modern web applications. The App Shell component offers a flexible, responsive layout system with header, sidebar, main content area, and footer sections.

## Preview

```jsx live
function AppShellDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <AppShell>
      <AppShellHeader>
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">My Application</h1>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar open={sidebarOpen}>
        <nav className="p-4">
          <div className="space-y-2">
            <a href="#" className="block px-3 py-2 bg-blue-500 text-white rounded">Dashboard</a>
            <a href="#" className="block px-3 py-2 hover:bg-gray-100 rounded">Projects</a>
            <a href="#" className="block px-3 py-2 hover:bg-gray-100 rounded">Settings</a>
          </div>
        </nav>
      </AppShellSidebar>
      
      <AppShellMain>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to App Shell</h2>
          <p>This is the main content area of your application.</p>
        </div>
      </AppShellMain>
      
      <AppShellFooter>
        <div className="text-center text-sm text-gray-500">
          © 2024 My Application. All rights reserved.
        </div>
      </AppShellFooter>
    </AppShell>
  );
}
```

## Features

- 🎨 **Flexible Layout** - Customizable header, sidebar, main, and footer sections
- 📱 **Responsive Design** - Adapts seamlessly to mobile, tablet, and desktop
- 🎯 **Navigation Ready** - Built-in support for navigation patterns
- ⚡ **Performance Optimized** - Efficient rendering and layout calculations
- 🔄 **Dynamic Sections** - Show/hide sections programmatically
- 📏 **Fixed & Fluid** - Support for fixed and fluid width layouts
- 🎭 **Theme Support** - Built-in light and dark theme support
- ♿ **Accessible** - ARIA landmarks and keyboard navigation
- 🔒 **Scroll Management** - Independent scrolling for each section
- 🎪 **Nested Layouts** - Support for complex nested layouts

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { 
  AppShell, 
  AppShellHeader, 
  AppShellSidebar, 
  AppShellMain,
  AppShellFooter 
} from '@dainabase/ui';

function MyApp() {
  return (
    <AppShell>
      <AppShellHeader>Header Content</AppShellHeader>
      <AppShellSidebar>Sidebar Navigation</AppShellSidebar>
      <AppShellMain>Main Content</AppShellMain>
      <AppShellFooter>Footer Content</AppShellFooter>
    </AppShell>
  );
}
```

## Examples

### 1. Dashboard Layout

```jsx live
function DashboardExample() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];
  
  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%' },
    { label: 'Revenue', value: '$45,678', change: '+8%' },
    { label: 'Active Projects', value: '23', change: '+3' },
    { label: 'Completion Rate', value: '87%', change: '+5%' }
  ];
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar 
        width={sidebarCollapsed ? '60px' : '240px'}
        className="bg-gray-50 border-r transition-all duration-300"
      >
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>
      </AppShellSidebar>
      
      <AppShellMain className="bg-gray-100">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-green-500">{stat.change}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm">User action {i}</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  New Project
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Add User
                </button>
                <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                  Generate Report
                </button>
                <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppShellMain>
    </AppShell>
  );
}
```

### 2. Admin Panel Layout

```jsx live
function AdminPanelExample() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <AppShell className={`h-[600px] ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <AppShellHeader className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-b`}>
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Panel
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className={`w-64 px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            <button className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600`}>
              New Item
            </button>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar 
        width="260px"
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'} border-r`}
      >
        <div className="p-4">
          <div className="mb-6">
            <div className={`text-xs uppercase tracking-wider mb-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Main Menu
            </div>
            <div className="space-y-1">
              {['Dashboard', 'Users', 'Products', 'Orders', 'Analytics'].map(item => (
                <button
                  key={item}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className={`text-xs uppercase tracking-wider mb-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Settings
            </div>
            <div className="space-y-1">
              {['Profile', 'Security', 'Notifications', 'Integrations'].map(item => (
                <button
                  key={item}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShellSidebar>
      
      <AppShellMain className={darkMode ? 'bg-gray-900' : 'bg-white'}>
        <div className="p-6">
          <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Content Area
            </h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              This is the main content area with dark mode support.
            </p>
          </div>
        </div>
      </AppShellMain>
    </AppShell>
  );
}
```

### 3. E-Commerce Layout

```jsx live
function EcommerceExample() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems] = useState(3);
  
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  const products = Array(6).fill(null).map((_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: `$${(Math.random() * 100).toFixed(2)}`,
    image: `📦`
  }));
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600">ShopHub</h1>
            <nav className="hidden md:flex items-center gap-6">
              {categories.slice(0, 4).map(cat => (
                <button key={cat} className="text-gray-600 hover:text-blue-600">
                  {cat}
                </button>
              ))}
              <button className="text-gray-600 hover:text-blue-600">More</button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button 
              onClick={() => setCartOpen(!cartOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar 
        position="left"
        width="240px"
        className="bg-gray-50 border-r"
      >
        <div className="p-4">
          <h3 className="font-medium mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <button
                key={cat}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center justify-between"
              >
                <span>{cat}</span>
                <span className="text-xs text-gray-400">→</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-4">Price Range</h3>
            <input type="range" className="w-full" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-4">Brand</h3>
            <div className="space-y-2">
              {['Brand A', 'Brand B', 'Brand C'].map(brand => (
                <label key={brand} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </AppShellSidebar>
      
      {cartOpen && (
        <AppShellSidebar 
          position="right"
          width="320px"
          className="bg-white border-l"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Shopping Cart</h3>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 pb-4 border-b">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Product {i}</div>
                    <div className="text-sm text-gray-500">Quantity: 1</div>
                    <div className="text-sm font-medium">${(Math.random() * 100).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">$234.56</span>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Checkout
              </button>
            </div>
          </div>
        </AppShellSidebar>
      )}
      
      <AppShellMain>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Featured Products</h2>
            <p className="text-gray-600">Discover our best selling items</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl">
                  {product.image}
                </div>
                <h4 className="font-medium mb-1">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{product.price}</span>
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShellMain>
      
      <AppShellFooter className="bg-gray-100 border-t">
        <div className="px-6 py-3 flex items-center justify-between text-sm text-gray-600">
          <div>© 2024 ShopHub. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Help</a>
          </div>
        </div>
      </AppShellFooter>
    </AppShell>
  );
}
```

### 4. Documentation Layout

```jsx live
function DocumentationExample() {
  const [activeSection, setActiveSection] = useState('getting-started');
  
  const sections = [
    {
      title: 'Introduction',
      items: ['Getting Started', 'Installation', 'Quick Start']
    },
    {
      title: 'Components',
      items: ['Button', 'Card', 'Dialog', 'Form', 'Table']
    },
    {
      title: 'Utilities',
      items: ['Colors', 'Typography', 'Spacing', 'Layout']
    },
    {
      title: 'Advanced',
      items: ['Theming', 'Customization', 'API Reference']
    }
  ];
  
  const tableOfContents = [
    'Overview',
    'Prerequisites',
    'Installation Steps',
    'Configuration',
    'First Steps',
    'Troubleshooting'
  ];
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">📚 Documentation</h1>
            <nav className="flex items-center gap-6">
              <button className="text-gray-600 hover:text-blue-600">Docs</button>
              <button className="text-gray-600 hover:text-blue-600">API</button>
              <button className="text-gray-600 hover:text-blue-600">Examples</button>
              <button className="text-gray-600 hover:text-blue-600">Blog</button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search docs..."
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
            <button className="text-sm text-gray-600 hover:text-blue-600">v2.0.0</button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar width="260px" className="bg-gray-50 border-r">
        <div className="p-4">
          {sections.map(section => (
            <div key={section.title} className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map(item => (
                  <button
                    key={item}
                    onClick={() => setActiveSection(item.toLowerCase().replace(' ', '-'))}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded ${
                      activeSection === item.toLowerCase().replace(' ', '-')
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppShellSidebar>
      
      <AppShellMain>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Getting Started</h1>
            <p className="text-gray-600">Learn how to set up and use our component library</p>
          </div>
          
          <div className="prose prose-blue max-w-none">
            <h2>Overview</h2>
            <p>
              Welcome to our comprehensive documentation. This guide will walk you through 
              everything you need to know to get started with our component library.
            </p>
            
            <h2>Prerequisites</h2>
            <p>Before you begin, make sure you have the following installed:</p>
            <ul>
              <li>Node.js 14.0 or later</li>
              <li>npm or yarn package manager</li>
              <li>A modern web browser</li>
            </ul>
            
            <h2>Installation Steps</h2>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 my-4">
              <code>npm install @dainabase/ui</code>
            </div>
            
            <h2>Configuration</h2>
            <p>
              After installation, you'll need to configure the library in your application.
              Add the following to your main entry file:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm">
{`import { UIProvider } from '@dainabase/ui';

function App() {
  return (
    <UIProvider>
      <YourApp />
    </UIProvider>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </AppShellMain>
      
      <AppShellSidebar position="right" width="200px" className="border-l">
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            On This Page
          </h3>
          <nav className="space-y-2">
            {tableOfContents.map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="block text-sm text-gray-600 hover:text-blue-600"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </AppShellSidebar>
    </AppShell>
  );
}
```

### 5. Social Media Layout

```jsx live
function SocialMediaExample() {
  const [posts] = useState([
    { id: 1, author: 'Alice', content: 'Just launched my new project! 🚀', likes: 42, comments: 5 },
    { id: 2, author: 'Bob', content: 'Beautiful sunset today 🌅', likes: 128, comments: 12 },
    { id: 3, author: 'Carol', content: 'Coffee and code ☕️💻', likes: 67, comments: 8 }
  ]);
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold text-blue-500">Connect</h1>
          
          <div className="flex-1 max-w-xl mx-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">🏠</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">💬</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar width="200px" className="border-r">
        <nav className="p-4 space-y-2">
          <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
            🏠 Home
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg">
            👤 Profile
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg">
            📧 Messages
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg">
            🔖 Bookmarks
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg">
            ⚙️ Settings
          </button>
        </nav>
      </AppShellSidebar>
      
      <AppShellMain className="bg-gray-50">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-lg p-4 mb-4">
            <textarea
              placeholder="What's on your mind?"
              className="w-full p-2 border border-gray-200 rounded-lg resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded">📷</button>
                <button className="p-2 hover:bg-gray-100 rounded">🎥</button>
                <button className="p-2 hover:bg-gray-100 rounded">😊</button>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Post
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium">{post.author}</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>
                <p className="mb-3">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    ❤️ {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    💬 {post.comments}
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    🔄 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShellMain>
      
      <AppShellSidebar position="right" width="280px" className="border-l">
        <div className="p-4">
          <h3 className="font-medium mb-3">Trending Topics</h3>
          <div className="space-y-2">
            {['#WebDevelopment', '#React', '#Design', '#Technology'].map(tag => (
              <button key={tag} className="block text-sm text-blue-600 hover:underline">
                {tag}
              </button>
            ))}
          </div>
          
          <h3 className="font-medium mt-6 mb-3">Who to Follow</h3>
          <div className="space-y-3">
            {['David', 'Emma', 'Frank'].map(name => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">{name}</span>
                </div>
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </AppShellSidebar>
    </AppShell>
  );
}
```

### 6. Music Player Layout

```jsx live
function MusicPlayerExample() {
  const [currentSong, setCurrentSong] = useState('Song 1');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playlists = ['Favorites', 'Recently Played', 'Discover Weekly', 'Chill Mix'];
  const songs = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    title: `Song ${i + 1}`,
    artist: `Artist ${(i % 3) + 1}`,
    duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
  }));
  
  return (
    <AppShell className="h-[600px] bg-black text-white">
      <AppShellSidebar width="240px" className="bg-gray-900 border-r border-gray-800">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6 text-green-500">🎵 Music</h1>
          
          <nav className="space-y-4">
            <div>
              <button className="w-full text-left px-3 py-2 hover:text-white text-gray-300">
                🏠 Home
              </button>
              <button className="w-full text-left px-3 py-2 hover:text-white text-gray-300">
                🔍 Search
              </button>
              <button className="w-full text-left px-3 py-2 hover:text-white text-gray-300">
                📚 Your Library
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 px-3">
                Playlists
              </h3>
              {playlists.map(playlist => (
                <button
                  key={playlist}
                  className="w-full text-left px-3 py-1 text-sm hover:text-white text-gray-400"
                >
                  {playlist}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </AppShellSidebar>
      
      <AppShellMain className="bg-gradient-to-b from-gray-900 to-black">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Good Evening</h2>
            <div className="grid grid-cols-2 gap-4">
              {playlists.slice(0, 4).map(playlist => (
                <button
                  key={playlist}
                  className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded p-2"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                  <span className="font-medium">{playlist}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Recently Played</h3>
            <div className="space-y-2">
              {songs.map(song => (
                <button
                  key={song.id}
                  onClick={() => setCurrentSong(song.title)}
                  className={`w-full flex items-center gap-4 px-4 py-2 rounded hover:bg-gray-800 ${
                    currentSong === song.title ? 'bg-gray-800' : ''
                  }`}
                >
                  <span className="text-gray-400">{song.id}</span>
                  <div className="flex-1 text-left">
                    <div className={currentSong === song.title ? 'text-green-500' : ''}>
                      {song.title}
                    </div>
                    <div className="text-sm text-gray-400">{song.artist}</div>
                  </div>
                  <span className="text-sm text-gray-400">{song.duration}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShellMain>
      
      <AppShellFooter className="bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-between px-4 h-20">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded"></div>
            <div>
              <div className="font-medium">{currentSong}</div>
              <div className="text-sm text-gray-400">Artist Name</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white">⏮</button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="text-gray-400 hover:text-white">⏭</button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>1:23</span>
              <div className="w-96 h-1 bg-gray-700 rounded-full">
                <div className="w-1/3 h-full bg-white rounded-full"></div>
              </div>
              <span>3:45</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white">🔊</button>
            <div className="w-24 h-1 bg-gray-700 rounded-full">
              <div className="w-2/3 h-full bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </AppShellFooter>
    </AppShell>
  );
}
```

### 7. Project Management Layout

```jsx live
function ProjectManagementExample() {
  const [activeView, setActiveView] = useState('kanban');
  
  const projects = [
    { name: 'Website Redesign', tasks: 12, progress: 65 },
    { name: 'Mobile App', tasks: 24, progress: 40 },
    { name: 'API Development', tasks: 18, progress: 80 }
  ];
  
  const kanbanColumns = [
    { title: 'To Do', tasks: ['Task 1', 'Task 2', 'Task 3'] },
    { title: 'In Progress', tasks: ['Task 4', 'Task 5'] },
    { title: 'Review', tasks: ['Task 6'] },
    { title: 'Done', tasks: ['Task 7', 'Task 8'] }
  ];
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">ProjectHub</h1>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>Website Redesign</option>
              <option>Mobile App</option>
              <option>API Development</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-3 py-1 text-sm rounded ${
                activeView === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1 text-sm rounded ${
                activeView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1 text-sm rounded ${
                activeView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar width="240px" className="bg-gray-50 border-r">
        <div className="p-4">
          <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4">
            + New Project
          </button>
          
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Projects</h3>
          <div className="space-y-2">
            {projects.map(project => (
              <button
                key={project.name}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
              >
                <div className="font-medium text-sm">{project.name}</div>
                <div className="text-xs text-gray-500 mt-1">{project.tasks} tasks</div>
                <div className="mt-2">
                  <div className="w-full h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Team</h3>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
              ))}
              <button className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs">
                +3
              </button>
            </div>
          </div>
        </div>
      </AppShellSidebar>
      
      <AppShellMain className="bg-gray-100">
        <div className="p-6">
          {activeView === 'kanban' && (
            <div className="flex gap-4 overflow-x-auto">
              {kanbanColumns.map(column => (
                <div key={column.title} className="flex-shrink-0 w-72">
                  <div className="bg-gray-200 rounded-t-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{column.title}</h3>
                      <span className="text-sm text-gray-600">{column.tasks.length}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 min-h-[400px] p-2 space-y-2">
                    {column.tasks.map(task => (
                      <div key={task} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="font-medium text-sm mb-2">{task}</div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"></div>
                            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
                          </div>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600">
                      + Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeView === 'list' && (
            <div className="bg-white rounded-lg">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3">Task</th>
                    <th className="text-left p-3">Assignee</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(8).fill(null).map((_, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3">Task {i + 1}</td>
                      <td className="p-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          In Progress
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-500">Aug {15 + i}, 2024</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeView === 'calendar' && (
            <div className="bg-white rounded-lg p-6">
              <div className="text-center text-gray-500">Calendar View Coming Soon</div>
            </div>
          )}
        </div>
      </AppShellMain>
    </AppShell>
  );
}
```

### 8. Messaging App Layout

```jsx live
function MessagingExample() {
  const [selectedChat, setSelectedChat] = useState(1);
  
  const chats = [
    { id: 1, name: 'Alice Johnson', lastMessage: 'Hey, how are you?', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Bob Smith', lastMessage: 'Meeting at 3 PM', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'Team Chat', lastMessage: 'Great work everyone!', time: 'Monday', unread: 5 }
  ];
  
  const messages = [
    { id: 1, sender: 'Alice', content: 'Hi there!', time: '10:00 AM', isMe: false },
    { id: 2, sender: 'Me', content: 'Hello! How can I help you?', time: '10:05 AM', isMe: true },
    { id: 3, sender: 'Alice', content: 'I have a question about the project', time: '10:10 AM', isMe: false },
    { id: 4, sender: 'Me', content: 'Sure, what would you like to know?', time: '10:15 AM', isMe: true },
    { id: 5, sender: 'Alice', content: 'Hey, how are you?', time: '10:30 AM', isMe: false }
  ];
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar width="320px" className="bg-white border-r">
        <div className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm"
            />
          </div>
          
          <div className="space-y-1">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                  selectedChat === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{chat.name}</div>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{chat.lastMessage}</div>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </AppShellSidebar>
      
      <AppShellMain className="bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div>
              <div className="font-medium">Alice Johnson</div>
              <div className="text-xs text-green-500">Active now</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">📞</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">📹</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">ℹ️</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs ${message.isMe ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    message.isMe 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white'
                  }`}>
                    {message.content}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.isMe ? 'text-right' : 'text-left'
                  }`}>
                    {message.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">📎</button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-lg"
            />
            <button className="p-2 hover:bg-gray-100 rounded-lg">😊</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      </AppShellMain>
    </AppShell>
  );
}
```

### 9. Video Platform Layout

```jsx live
function VideoPlatformExample() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['All', 'Gaming', 'Music', 'Sports', 'News', 'Learning'];
  const videos = Array(6).fill(null).map((_, i) => ({
    id: i + 1,
    title: `Video Title ${i + 1}`,
    channel: `Channel ${(i % 3) + 1}`,
    views: `${Math.floor(Math.random() * 900) + 100}K views`,
    time: `${Math.floor(Math.random() * 10) + 1} days ago`
  }));
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">📺 VideoHub</h1>
          </div>
          
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-full"
              />
              <button className="absolute right-2 top-2 p-1 hover:bg-gray-200 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellSidebar width="200px" className="bg-white border-r">
        <nav className="p-4">
          <div className="space-y-1 mb-6">
            <button className="w-full text-left px-3 py-2 bg-gray-100 rounded-lg font-medium">
              🏠 Home
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg">
              🔥 Trending
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg">
              📚 Subscriptions
            </button>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 px-3">Library</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                📜 History
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                ⏰ Watch Later
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                👍 Liked Videos
              </button>
            </div>
          </div>
        </nav>
      </AppShellSidebar>
      
      <AppShellMain className="bg-gray-50">
        <div className="p-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-4 py-1 rounded-full whitespace-nowrap ${
                  selectedCategory === cat.toLowerCase()
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(video => (
              <div key={video.id} className="cursor-pointer group">
                <div className="aspect-video bg-gray-300 rounded-lg mb-2 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    ▶️
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black text-white text-xs px-1 rounded">
                    12:34
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium line-clamp-2">{video.title}</h3>
                    <div className="text-sm text-gray-600">
                      <div>{video.channel}</div>
                      <div>{video.views} • {video.time}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShellMain>
    </AppShell>
  );
}
```

### 10. Analytics Dashboard Layout

```jsx live
function AnalyticsDashboardExample() {
  const [dateRange, setDateRange] = useState('7d');
  
  const metrics = [
    { label: 'Page Views', value: '45.2K', change: '+12.5%', trend: 'up' },
    { label: 'Users', value: '8,391', change: '+3.2%', trend: 'up' },
    { label: 'Bounce Rate', value: '42.3%', change: '-2.1%', trend: 'down' },
    { label: 'Avg Duration', value: '3m 24s', change: '+18s', trend: 'up' }
  ];
  
  return (
    <AppShell className="h-[600px]">
      <AppShellHeader className="bg-white border-b">
        <div className="flex items-center justify-between px-6 h-14">
          <h1 className="text-xl font-bold">Analytics Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              Export Report
            </button>
          </div>
        </div>
      </AppShellHeader>
      
      <AppShellMain>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{metric.label}</span>
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="mt-2 h-8 bg-gray-100 rounded flex items-end px-1 gap-1">
                  {[40, 65, 45, 70, 55, 80, 60].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg p-6 border">
              <h3 className="font-medium mb-4">Traffic Overview</h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                Chart Placeholder
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-medium mb-4">Top Pages</h3>
              <div className="space-y-3">
                {['/home', '/products', '/about', '/contact', '/blog'].map((page, i) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm">{page}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${100 - i * 15}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{100 - i * 15}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShellMain>
    </AppShell>
  );
}
```

## API Reference

### AppShell Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Child components |
| `className` | `string` | `undefined` | Additional CSS classes |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme mode |
| `layout` | `'default' \| 'compact' \| 'fluid'` | `'default'` | Layout type |

### AppShellHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Header content |
| `className` | `string` | `undefined` | Additional CSS classes |
| `height` | `string \| number` | `'64px'` | Header height |
| `fixed` | `boolean` | `false` | Fixed positioning |
| `shadow` | `boolean` | `true` | Show shadow |

### AppShellSidebar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Sidebar content |
| `className` | `string` | `undefined` | Additional CSS classes |
| `width` | `string \| number` | `'250px'` | Sidebar width |
| `position` | `'left' \| 'right'` | `'left'` | Sidebar position |
| `open` | `boolean` | `true` | Open state |
| `collapsible` | `boolean` | `false` | Can collapse |
| `breakpoint` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | Responsive breakpoint |

### AppShellMain Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Main content |
| `className` | `string` | `undefined` | Additional CSS classes |
| `padding` | `boolean` | `true` | Add default padding |

### AppShellFooter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Footer content |
| `className` | `string` | `undefined` | Additional CSS classes |
| `height` | `string \| number` | `'auto'` | Footer height |
| `fixed` | `boolean` | `false` | Fixed positioning |

## Accessibility

The App Shell component follows accessibility best practices:

- **Semantic HTML**: Uses semantic landmark elements
- **ARIA Landmarks**: Proper ARIA roles for regions
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Compatible with screen readers
- **Focus Management**: Proper focus management
- **Responsive**: Mobile-friendly with touch support

### ARIA Landmarks

| Section | ARIA Role |
|---------|-----------|
| Header | `banner` |
| Sidebar | `navigation` |
| Main | `main` |
| Footer | `contentinfo` |

## Best Practices

### ✅ Do's

- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure responsive design
- Test on multiple devices
- Implement keyboard navigation
- Use consistent spacing
- Optimize for performance
- Consider mobile-first design

### ❌ Don'ts

- Don't nest AppShell components
- Don't forget responsive breakpoints
- Don't use fixed heights unnecessarily
- Don't ignore accessibility
- Don't overcomplicate the layout
- Don't forget scroll management
- Don't mix layout systems

## Use Cases

1. **Admin Dashboards** - Complex administrative interfaces
2. **SaaS Applications** - Software as a service platforms
3. **E-Commerce** - Online shopping platforms
4. **Social Media** - Social networking sites
5. **Content Management** - CMS and blog platforms
6. **Project Management** - Task and project tools
7. **Analytics Platforms** - Data visualization dashboards
8. **Communication Apps** - Chat and messaging interfaces
9. **Documentation Sites** - Technical documentation
10. **Media Platforms** - Video and music streaming

## Performance Considerations

- Use CSS Grid/Flexbox for layout
- Implement virtual scrolling for long lists
- Lazy load sidebar content
- Optimize re-renders with React.memo
- Use CSS transforms for animations
- Implement code splitting

## Related Components

- [Drawer](./drawer) - Sliding panels
- [Navigation Menu](./navigation-menu) - Navigation components
- [Header](./header) - Header component
- [Footer](./footer) - Footer component
- [Sidebar](./sidebar) - Sidebar component
