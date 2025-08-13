---
id: collapsible
title: Collapsible
sidebar_position: 46
---

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@dainabase/ui';

# Collapsible Component

A flexible collapsible/expandable content component that provides smooth animations and accessibility features for showing and hiding content sections.

## Preview

```tsx live
function CollapsibleDemo() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          @dainabase/ui - Advanced Configuration
        </h4>
        <CollapsibleTrigger asChild>
          <button className="p-2 hover:bg-gray-100 rounded">
            {isOpen ? 'Hide' : 'Show'} Details
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="px-4">
        <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2">
          npm install @dainabase/ui
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2">
          yarn add @dainabase/ui
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2">
          pnpm add @dainabase/ui
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## Features

- 🎯 **Controlled & Uncontrolled** - Works in both controlled and uncontrolled modes
- ⚡ **Smooth Animations** - Hardware-accelerated expand/collapse animations
- ♿ **Fully Accessible** - ARIA compliant with keyboard navigation
- 🎨 **Customizable Styling** - Full control over appearance and animations
- 📱 **Mobile Optimized** - Touch-friendly and responsive
- 🔄 **Flexible Triggers** - Multiple trigger support with custom elements
- 📏 **Auto Height** - Automatic height calculation for dynamic content
- 🎭 **Animation Control** - Customizable animation duration and easing
- 🔒 **Disable Support** - Can be disabled while maintaining visual state
- 🎬 **Callbacks** - Rich event system for state changes

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@dainabase/ui';

function App() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
      <CollapsibleContent>
        <p>This content can be expanded or collapsed.</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## Examples

### 1. FAQ Accordion Style

```tsx
function FAQExample() {
  const faqs = [
    {
      question: "What is Dainabase UI?",
      answer: "Dainabase UI is a comprehensive React component library built with TypeScript and Tailwind CSS, offering 58+ production-ready components."
    },
    {
      question: "How do I install it?",
      answer: "You can install Dainabase UI using npm, yarn, or pnpm. Simply run 'npm install @dainabase/ui' in your project directory."
    },
    {
      question: "Is it TypeScript compatible?",
      answer: "Yes! Dainabase UI is built with TypeScript from the ground up, providing full type safety and excellent IDE support."
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-2xl">
      {faqs.map((faq, index) => (
        <Collapsible key={index}>
          <div className="border rounded-lg">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                <h3 className="text-left font-medium">{faq.question}</h3>
                <svg
                  className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 text-gray-600">
                {faq.answer}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
```

### 2. Sidebar Navigation

```tsx
function SidebarNavExample() {
  const [openSections, setOpenSections] = useState({
    components: true,
    utilities: false,
    hooks: false,
  });

  const navItems = {
    components: ['Button', 'Input', 'Card', 'Dialog', 'Table'],
    utilities: ['cn', 'formatDate', 'debounce', 'throttle'],
    hooks: ['useTheme', 'useMediaQuery', 'useLocalStorage', 'useDebounce'],
  };

  return (
    <div className="w-64 border-r h-full">
      <div className="p-4 space-y-2">
        {Object.entries(navItems).map(([section, items]) => (
          <Collapsible
            key={section}
            open={openSections[section]}
            onOpenChange={(open) =>
              setOpenSections(prev => ({ ...prev, [section]: open }))
            }
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded">
                <span className="font-medium capitalize">{section}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${
                    openSections[section] ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 space-y-1 mt-1">
                {items.map((item) => (
                  <button
                    key={item}
                    className="block w-full text-left py-1.5 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
```

### 3. Product Details Expansion

```tsx
function ProductDetailsExample() {
  const [showSpecs, setShowSpecs] = useState(false);
  
  const product = {
    name: "Professional Laptop",
    price: "$1,299",
    description: "High-performance laptop for professionals",
    specs: {
      processor: "Intel Core i7-12700H",
      memory: "32GB DDR5 RAM",
      storage: "1TB NVMe SSD",
      display: "15.6\" 4K OLED",
      graphics: "NVIDIA RTX 3070",
      battery: "90Wh, up to 12 hours",
      weight: "1.8kg",
      ports: "2x USB-C, 2x USB-A, HDMI 2.1, SD Card",
    }
  };

  return (
    <div className="max-w-md border rounded-lg p-6">
      <h2 className="text-2xl font-bold">{product.name}</h2>
      <p className="text-3xl font-semibold text-blue-600 mt-2">{product.price}</p>
      <p className="text-gray-600 mt-3">{product.description}</p>
      
      <Collapsible open={showSpecs} onOpenChange={setShowSpecs} className="mt-6">
        <CollapsibleTrigger asChild>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
            <span>{showSpecs ? 'Hide' : 'Show'} Specifications</span>
            <svg
              className={`h-4 w-4 transition-transform ${showSpecs ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-3 border-t pt-4">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
        Add to Cart
      </button>
    </div>
  );
}
```

### 4. Code Snippet with Expand

```tsx
function CodeSnippetExample() {
  const [expanded, setExpanded] = useState(false);
  
  const codeSnippet = `
// Complete React Component Example
import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@dainabase/ui';

export function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserData().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
      <div className="mt-4 space-y-4">
        <Input placeholder="Search..." />
        <Button>Update Profile</Button>
      </div>
    </Card>
  );
}`;

  return (
    <div className="max-w-2xl">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-400 text-sm">UserDashboard.tsx</span>
          <button className="text-gray-400 hover:text-white text-sm">
            Copy
          </button>
        </div>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <div className="relative">
            <pre className="p-4 text-gray-300 overflow-x-auto">
              <code className="text-sm">
                {expanded ? codeSnippet : codeSnippet.split('\n').slice(0, 8).join('\n')}
              </code>
            </pre>
            {!expanded && (
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />
            )}
          </div>
          <CollapsibleTrigger asChild>
            <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
              {expanded ? 'Show Less' : 'Show More'}
            </button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>
    </div>
  );
}
```

### 5. Multi-level Nested Collapsibles

```tsx
function NestedCollapsibleExample() {
  const fileStructure = {
    src: {
      components: {
        'Button.tsx': null,
        'Input.tsx': null,
        forms: {
          'Form.tsx': null,
          'FormField.tsx': null,
          'FormLabel.tsx': null,
        },
        layout: {
          'Card.tsx': null,
          'Container.tsx': null,
          'Grid.tsx': null,
        }
      },
      utils: {
        'cn.ts': null,
        'helpers.ts': null,
      },
      'App.tsx': null,
      'index.tsx': null,
    }
  };

  const renderTree = (node, name, level = 0) => {
    if (!node || typeof node !== 'object') {
      return (
        <div
          className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 rounded"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          <span className="text-gray-400">📄</span>
          <span className="text-sm">{name}</span>
        </div>
      );
    }

    return (
      <Collapsible key={name}>
        <CollapsibleTrigger className="w-full">
          <div
            className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 rounded"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            <span className="text-gray-400">📁</span>
            <span className="text-sm font-medium">{name}/</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {Object.entries(node).map(([key, value]) => renderTree(value, key, level + 1))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="max-w-md border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Project Structure</h3>
      <div className="font-mono">
        {Object.entries(fileStructure).map(([key, value]) => renderTree(value, key))}
      </div>
    </div>
  );
}
```

### 6. Settings Panel with Categories

```tsx
function SettingsPanelExample() {
  const [openCategories, setOpenCategories] = useState({
    appearance: true,
    notifications: false,
    privacy: false,
    advanced: false,
  });

  const toggleCategory = (category) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="max-w-2xl space-y-2">
      <Collapsible open={openCategories.appearance} onOpenChange={() => toggleCategory('appearance')}>
        <div className="border rounded-lg">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎨</span>
              <div className="text-left">
                <h3 className="font-medium">Appearance</h3>
                <p className="text-sm text-gray-500">Customize the look and feel</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              <label className="flex items-center justify-between">
                <span>Dark Mode</span>
                <input type="checkbox" className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span>Compact View</span>
                <input type="checkbox" className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span>Show Animations</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Collapsible open={openCategories.notifications} onOpenChange={() => toggleCategory('notifications')}>
        <div className="border rounded-lg">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔔</span>
              <div className="text-left">
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-gray-500">Manage your notification preferences</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              <label className="flex items-center justify-between">
                <span>Email Notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span>Push Notifications</span>
                <input type="checkbox" className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span>SMS Alerts</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
```

### 7. Comment Thread with Replies

```tsx
function CommentThreadExample() {
  const [showReplies, setShowReplies] = useState({});
  
  const comments = [
    {
      id: 1,
      author: "Alice Johnson",
      time: "2 hours ago",
      text: "This is a fantastic implementation! Really clean code.",
      replies: [
        {
          id: 2,
          author: "Bob Smith",
          time: "1 hour ago",
          text: "I agree! The animation is particularly smooth."
        },
        {
          id: 3,
          author: "Carol White",
          time: "30 minutes ago",
          text: "Great work on the accessibility features too!"
        }
      ]
    }
  ];

  return (
    <div className="max-w-2xl space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {comment.author[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.author}</span>
                <span className="text-sm text-gray-500">{comment.time}</span>
              </div>
              <p className="mt-1 text-gray-700">{comment.text}</p>
              
              {comment.replies && comment.replies.length > 0 && (
                <Collapsible
                  open={showReplies[comment.id]}
                  onOpenChange={(open) => setShowReplies(prev => ({ ...prev, [comment.id]: open }))}
                >
                  <CollapsibleTrigger asChild>
                    <button className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700">
                      {showReplies[comment.id] ? 'Hide' : 'Show'} {comment.replies.length} replies
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                            {reply.author[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{reply.author}</span>
                              <span className="text-xs text-gray-500">{reply.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 8. Table Row Expansion

```tsx
function TableRowExpansionExample() {
  const [expandedRows, setExpandedRows] = useState({});
  
  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2025-01-15',
      total: '$250.00',
      status: 'Delivered',
      items: [
        { name: 'Product A', quantity: 2, price: '$50.00' },
        { name: 'Product B', quantity: 1, price: '$150.00' },
      ]
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2025-01-14',
      total: '$180.00',
      status: 'Processing',
      items: [
        { name: 'Product C', quantity: 3, price: '$60.00' },
      ]
    },
  ];

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <div className="max-w-4xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3"></th>
            <th className="text-left p-3">Order ID</th>
            <th className="text-left p-3">Customer</th>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Total</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <button
                    onClick={() => toggleRow(order.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        expandedRows[order.id] ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
                <td className="p-3 font-mono text-sm">{order.id}</td>
                <td className="p-3">{order.customer}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3 font-semibold">{order.total}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
              {expandedRows[order.id] && (
                <tr>
                  <td colSpan={6} className="bg-gray-50 p-0">
                    <Collapsible open={expandedRows[order.id]}>
                      <CollapsibleContent>
                        <div className="p-4">
                          <h4 className="font-medium mb-2">Order Items</h4>
                          <table className="w-full">
                            <thead>
                              <tr className="text-sm text-gray-600">
                                <th className="text-left pb-2">Product</th>
                                <th className="text-left pb-2">Quantity</th>
                                <th className="text-left pb-2">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="py-1">{item.name}</td>
                                  <td className="py-1">{item.quantity}</td>
                                  <td className="py-1">{item.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 9. Filter Panel

```tsx
function FilterPanelExample() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    priceRange: 'all',
    rating: 0,
    availability: false,
  });

  return (
    <div className="max-w-xs border rounded-lg">
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium">Filters</span>
            </div>
            <span className="text-sm text-gray-500">
              {filtersOpen ? 'Hide' : 'Show'}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t pt-4">
            <div>
              <h4 className="font-medium mb-2">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Electronics</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Clothing</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Books</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Price Range</h4>
              <select className="w-full p-2 border rounded">
                <option value="all">All Prices</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100+">$100+</option>
              </select>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Minimum Rating</h4>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`text-2xl ${
                      star <= activeFilters.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setActiveFilters(prev => ({ ...prev, rating: star }))}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">In Stock Only</span>
            </label>
            
            <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
```

### 10. Mobile Menu

```tsx
function MobileMenuExample() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenus, setSubMenus] = useState({
    products: false,
    resources: false,
    company: false,
  });

  const toggleSubMenu = (menu) => {
    setSubMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <div className="max-w-sm mx-auto border rounded-lg">
      <div className="bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">DainaBase</span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        <Collapsible open={menuOpen}>
          <CollapsibleContent>
            <nav className="p-4 space-y-2">
              <a href="#" className="block py-2 hover:text-blue-600">Home</a>
              
              <Collapsible open={subMenus.products} onOpenChange={() => toggleSubMenu('products')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-2 hover:text-blue-600">
                    <span>Products</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        subMenus.products ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 space-y-2 mt-2">
                    <a href="#" className="block py-1 text-sm text-gray-600 hover:text-blue-600">UI Components</a>
                    <a href="#" className="block py-1 text-sm text-gray-600 hover:text-blue-600">Templates</a>
                    <a href="#" className="block py-1 text-sm text-gray-600 hover:text-blue-600">Icons</a>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible open={subMenus.resources} onOpenChange={() => toggleSubMenu('resources')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-2 hover:text-blue-600">
                    <span>Resources</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        subMenus.resources ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 space-y-2 mt-2">
                    <a href="#" className="block py-1 text-sm text-gray-600 hover:text-blue-600">Documentation</a>
                    <a href="#" className="block py-1 text-sm text-gray-600 hover:text-blue-600">Tutorials</a>
                    <a href="#" className="block py-1 text-sm text-gray-600 hover:text-blue-600">Blog</a>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <a href="#" className="block py-2 hover:text-blue-600">Pricing</a>
              <a href="#" className="block py-2 hover:text-blue-600">Contact</a>
            </nav>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Default open state for uncontrolled mode |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback when open state changes |
| `disabled` | `boolean` | `false` | Whether the collapsible is disabled |
| `className` | `string` | `undefined` | Additional CSS classes |
| `asChild` | `boolean` | `false` | Render as child component |
| `forceMount` | `boolean` | `false` | Force mount content when closed |

### CollapsibleTrigger Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as child component |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onClick` | `(event: MouseEvent) => void` | `undefined` | Click event handler |
| `disabled` | `boolean` | `false` | Whether the trigger is disabled |

### CollapsibleContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `asChild` | `boolean` | `false` | Render as child component |
| `forceMount` | `boolean` | `false` | Keep in DOM when closed |
| `animationDuration` | `number` | `200` | Animation duration in ms |
| `animationEasing` | `string` | `'ease-in-out'` | CSS easing function |
| `style` | `CSSProperties` | `undefined` | Inline styles |

## Accessibility

The Collapsible component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with Space/Enter to toggle
- **ARIA Attributes**:
  - `aria-expanded` on trigger to indicate state
  - `aria-controls` to associate trigger with content
  - `aria-hidden` when content is collapsed
  - `role="button"` on trigger elements
- **Focus Management**: Proper focus indicators and tab order
- **Screen Reader Support**: Announces state changes
- **Motion Preferences**: Respects `prefers-reduced-motion`

### Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` | Toggle expanded/collapsed state |
| `Enter` | Toggle expanded/collapsed state |
| `Tab` | Navigate to next focusable element |
| `Shift + Tab` | Navigate to previous focusable element |

## Best Practices

### Do's ✅

- Use clear trigger labels that indicate expandable content
- Provide visual indicators (icons) showing state
- Keep trigger and content visually connected
- Use appropriate animation duration (200-300ms)
- Test with keyboard navigation
- Consider mobile touch targets (min 44x44px)
- Group related collapsibles together
- Remember user's expanded state when appropriate
- Use `forceMount` for SEO-critical content
- Implement proper ARIA labels

### Don'ts ❌

- Don't nest too many levels (max 2-3)
- Don't auto-collapse when clicking outside
- Don't use for primary navigation on desktop
- Don't hide critical information by default
- Don't use very long animations (> 500ms)
- Don't disable without visual indication
- Don't change trigger position when expanding
- Don't use for single small content
- Don't forget loading states for async content
- Don't override native form elements

## Use Cases

1. **FAQ Sections** - Questions and answers
2. **Sidebar Navigation** - Nested menu items
3. **Product Details** - Specifications and descriptions
4. **Code Examples** - Expandable code snippets
5. **Comment Threads** - Show/hide replies
6. **Settings Panels** - Grouped configuration options
7. **File Trees** - Directory structures
8. **Mobile Menus** - Responsive navigation
9. **Filter Panels** - E-commerce filters
10. **Table Rows** - Expandable row details

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Content jumps when expanding | Set fixed height or use CSS transforms |
| Animation not smooth | Check for CSS conflicts, use `will-change` |
| Content not accessible | Ensure proper ARIA attributes |
| State not persisting | Implement controlled mode with state management |
| Nested collapsibles not working | Check event propagation, use `stopPropagation` |
| Mobile performance issues | Reduce animation complexity, use CSS transforms |

## Related Components

- [**Accordion**](./accordion) - Multiple collapsible sections with single expansion
- [**Tabs**](./tabs) - Alternative content organization
- [**Dialog**](./dialog) - Modal content display
- [**Sheet**](./sheet) - Slide-out panels
- [**Popover**](./popover) - Floating content panels
- [**DropdownMenu**](./dropdown-menu) - Collapsible menu items
