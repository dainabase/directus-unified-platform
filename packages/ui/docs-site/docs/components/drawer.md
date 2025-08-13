---
id: drawer
title: Drawer Component
sidebar_position: 55
---

import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@dainabase/ui';

# Drawer

A sliding panel component that overlays content from the edge of the viewport. Perfect for navigation menus, forms, filters, and detailed information panels.

## Preview

```jsx live
function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Open Drawer
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>
            This is a drawer component that slides in from the side.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Drawer content goes here...</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Close
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

## Features

- 📱 **Responsive Design** - Adapts to mobile and desktop layouts
- 🎯 **Multiple Positions** - Slide from left, right, top, or bottom
- 🎨 **Customizable Styling** - Full control over appearance
- ♿ **Accessible** - Focus management and keyboard navigation
- 🎭 **Smooth Animations** - Hardware-accelerated transitions
- 📏 **Flexible Sizing** - Fixed or responsive widths/heights
- 🔒 **Scroll Lock** - Prevents body scroll when open
- 🎪 **Nested Drawers** - Support for multiple drawer levels
- 🎯 **Focus Trap** - Keeps focus within drawer when open
- 🔄 **Swipe Gestures** - Touch support for mobile devices

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { 
  Drawer, 
  DrawerTrigger, 
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose 
} from '@dainabase/ui';

function MyComponent() {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>
        <div>Content</div>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

## Examples

### 1. Different Positions

```jsx live
function PositionsExample() {
  const positions = ['left', 'right', 'top', 'bottom'];
  
  return (
    <div className="flex gap-3 flex-wrap">
      {positions.map(position => (
        <Drawer key={position} position={position}>
          <DrawerTrigger asChild>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 capitalize">
              From {position}
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer from {position}</DrawerTitle>
              <DrawerDescription>
                This drawer slides in from the {position} side of the screen.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <p>Content for {position} drawer</p>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Close
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
```

### 2. Navigation Drawer

```jsx live
function NavigationDrawerExample() {
  const [activeItem, setActiveItem] = useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'messages', label: 'Messages', icon: '💬', badge: 3 },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 7 },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'help', label: 'Help & Support', icon: '❓' }
  ];
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-80">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              D
            </div>
            <div>
              <DrawerTitle>Dainabase</DrawerTitle>
              <DrawerDescription>Navigation Menu</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        
        <nav className="flex-1 px-4 py-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors ${
                activeItem === item.id 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeItem === item.id 
                    ? 'bg-white text-blue-500' 
                    : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <DrawerFooter className="border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-500">john@example.com</div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 3. Form Drawer

```jsx live
function FormDrawerExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
    notifications: true
  });
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Add New User
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-96">
        <DrawerHeader>
          <DrawerTitle>Create New User</DrawerTitle>
          <DrawerDescription>
            Fill in the information below to create a new user account.
          </DrawerDescription>
        </DrawerHeader>
        
        <form className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifications"
              checked={formData.notifications}
              onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="notifications" className="text-sm">
              Send email notifications
            </label>
          </div>
        </form>
        
        <DrawerFooter className="flex gap-2">
          <DrawerClose asChild>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </DrawerClose>
          <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Create User
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 4. Filter Drawer

```jsx live
function FilterDrawerExample() {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false
  });
  
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  
  return (
    <Drawer position="right">
      <DrawerTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-80">
        <DrawerHeader>
          <DrawerTitle>Filter Products</DrawerTitle>
          <DrawerDescription>
            Refine your search results
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({...filters, categories: [...filters.categories, category]});
                      } else {
                        setFilters({...filters, categories: filters.categories.filter(c => c !== category)});
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters({...filters, priceRange: [Number(e.target.value), filters.priceRange[1]]})}
                  className="w-24 px-2 py-1 border rounded"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], Number(e.target.value)]})}
                  className="w-24 px-2 py-1 border rounded"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], Number(e.target.value)]})}
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Minimum Rating</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setFilters({...filters, rating: star})}
                  className={`text-2xl ${star <= filters.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">In Stock Only</span>
            </label>
          </div>
        </div>
        
        <DrawerFooter className="flex gap-2">
          <button 
            onClick={() => setFilters({ categories: [], priceRange: [0, 1000], rating: 0, inStock: false })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear All
          </button>
          <DrawerClose asChild>
            <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Apply Filters
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 5. Detail Panel Drawer

```jsx live
function DetailPanelExample() {
  const [selectedUser, setSelectedUser] = useState(null);
  
  const users = [
    { id: 1, name: 'Alice Johnson', role: 'Admin', email: 'alice@example.com', status: 'active' },
    { id: 2, name: 'Bob Smith', role: 'User', email: 'bob@example.com', status: 'active' },
    { id: 3, name: 'Carol White', role: 'Moderator', email: 'carol@example.com', status: 'inactive' }
  ];
  
  return (
    <>
      <div className="space-y-2">
        {users.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {user.status}
            </span>
          </div>
        ))}
      </div>
      
      <Drawer open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DrawerContent className="w-96">
          {selectedUser && (
            <>
              <DrawerHeader>
                <DrawerTitle>User Details</DrawerTitle>
                <DrawerDescription>
                  View and manage user information
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div>
                    <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.role}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className="font-medium capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">User ID</label>
                    <p className="font-medium">USR-00{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Active</label>
                    <p className="font-medium">2 hours ago</p>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Edit User
                  </button>
                  <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    Delete User
                  </button>
                </div>
              </div>
              
              <DrawerFooter>
                <DrawerClose asChild>
                  <button className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Close
                  </button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
```

### 6. Shopping Cart Drawer

```jsx live
function CartDrawerExample() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Product 1', price: 29.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 49.99, quantity: 1 },
    { id: 3, name: 'Product 3', price: 19.99, quantity: 3 }
  ]);
  
  const updateQuantity = (id, delta) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  return (
    <Drawer position="right">
      <DrawerTrigger asChild>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-96">
        <DrawerHeader>
          <DrawerTitle>Shopping Cart</DrawerTitle>
          <DrawerDescription>
            {cartItems.length} items in your cart
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        <DrawerFooter>
          {cartItems.length > 0 ? (
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Checkout
            </button>
          ) : (
            <DrawerClose asChild>
              <button className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Continue Shopping
              </button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 7. Settings Drawer

```jsx live
function SettingsDrawerExample() {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    sound: false,
    autoSave: true,
    compactMode: false
  });
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-96">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Customize your application preferences
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Appearance</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({...settings, theme: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <label className="flex items-center justify-between">
                <span className="text-sm">Compact Mode</span>
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) => setSettings({...settings, compactMode: e.target.checked})}
                  className="rounded"
                />
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Language & Region</h3>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Enable Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Sound Effects</span>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => setSettings({...settings, sound: e.target.checked})}
                  className="rounded"
                />
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Data & Storage</h3>
            <label className="flex items-center justify-between">
              <span className="text-sm">Auto-save</span>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                className="rounded"
              />
            </label>
          </div>
        </div>
        
        <DrawerFooter className="flex gap-2">
          <button 
            onClick={() => setSettings({
              theme: 'light',
              language: 'en',
              notifications: true,
              sound: false,
              autoSave: true,
              compactMode: false
            })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <DrawerClose asChild>
            <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Changes
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 8. Nested Drawers

```jsx live
function NestedDrawersExample() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
          Open Primary Drawer
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-96">
        <DrawerHeader>
          <DrawerTitle>Primary Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer contains another drawer
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4">
          <p className="mb-4">This is the primary drawer content.</p>
          
          <Drawer>
            <DrawerTrigger asChild>
              <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                Open Secondary Drawer
              </button>
            </DrawerTrigger>
            <DrawerContent className="w-80" position="right">
              <DrawerHeader>
                <DrawerTitle>Secondary Drawer</DrawerTitle>
                <DrawerDescription>
                  Nested drawer content
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="p-4">
                <p>This is a nested drawer that appears on top of the primary drawer.</p>
              </div>
              
              <DrawerFooter>
                <DrawerClose asChild>
                  <button className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Close Secondary
                  </button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <button className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Close Primary
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 9. Full-Screen Drawer

```jsx live
function FullScreenDrawerExample() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600">
          Open Full Screen
        </button>
      </DrawerTrigger>
      <DrawerContent fullScreen>
        <div className="h-full flex flex-col">
          <DrawerHeader className="border-b">
            <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
              <div>
                <DrawerTitle>Full Screen Experience</DrawerTitle>
                <DrawerDescription>
                  Immersive full-screen drawer interface
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Content {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t p-4">
            <div className="max-w-6xl mx-auto flex justify-end">
              <DrawerClose asChild>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Done
                </button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

### 10. Mobile-Optimized Bottom Drawer

```jsx live
function MobileBottomDrawerExample() {
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <Drawer position="bottom">
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
          Open Bottom Sheet
        </button>
      </DrawerTrigger>
      <DrawerContent 
        className="rounded-t-2xl"
        style={{ maxHeight: '90vh' }}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>
        
        <DrawerHeader>
          <DrawerTitle>Bottom Sheet</DrawerTitle>
          <DrawerDescription>
            Swipe down to close
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4">
          <div className="space-y-4">
            <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3">
              <span className="text-2xl">📷</span>
              <div>
                <div className="font-medium">Take Photo</div>
                <div className="text-sm text-gray-500">Use camera to capture</div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3">
              <span className="text-2xl">🖼️</span>
              <div>
                <div className="font-medium">Choose from Gallery</div>
                <div className="text-sm text-gray-500">Select existing photo</div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-medium">Browse Files</div>
                <div className="text-sm text-gray-500">Choose from file system</div>
              </div>
            </button>
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <button className="w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

## API Reference

### Drawer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Default open state (uncontrolled) |
| `onOpenChange` | `function` | `undefined` | Callback when open state changes |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Position of the drawer |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Size of the drawer |
| `modal` | `boolean` | `true` | Whether to render as modal |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking outside |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape |
| `lockScroll` | `boolean` | `true` | Lock body scroll when open |
| `trapFocus` | `boolean` | `true` | Trap focus within drawer |
| `swipeToClose` | `boolean` | `true` | Enable swipe to close on mobile |
| `animationDuration` | `number` | `300` | Animation duration in ms |

### DrawerContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `style` | `object` | `undefined` | Inline styles |
| `fullScreen` | `boolean` | `false` | Full screen mode |
| `overlay` | `boolean` | `true` | Show overlay backdrop |
| `overlayClassName` | `string` | `undefined` | Overlay CSS classes |

## Accessibility

The Drawer component follows WAI-ARIA dialog pattern:

- **Focus Management**: Focus is moved to drawer on open and restored on close
- **Keyboard Navigation**: Tab cycles through focusable elements
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Trap**: Focus is trapped within drawer when open
- **Escape Key**: Closes drawer (configurable)

### Keyboard Support

| Key | Description |
|-----|-------------|
| `Tab` | Move focus to next focusable element |
| `Shift + Tab` | Move focus to previous focusable element |
| `Escape` | Close the drawer |
| `Enter` | Activate focused element |

## Best Practices

### ✅ Do's

- Use appropriate drawer position based on content and device
- Provide clear titles and descriptions
- Include close buttons or actions
- Implement proper focus management
- Use overlays for modal drawers
- Optimize for mobile with touch gestures
- Keep drawer content focused and relevant
- Test on various screen sizes

### ❌ Don'ts

- Don't nest too many drawer levels
- Don't use for critical alerts
- Don't auto-open drawers without user action
- Don't make drawers too wide/tall for the viewport
- Don't forget to handle keyboard navigation
- Don't use for simple confirmations (use dialogs instead)
- Don't block important content permanently

## Use Cases

1. **Navigation Menus** - App navigation and site menus
2. **Forms & Filters** - Complex forms and filter panels
3. **Shopping Carts** - E-commerce cart interfaces
4. **Settings Panels** - Application preferences
5. **Detail Views** - Additional information panels
6. **File Browsers** - File selection interfaces
7. **Chat Interfaces** - Messaging sidebars
8. **Notifications** - Notification centers
9. **Help & Documentation** - Help panels
10. **Mobile Menus** - Bottom sheets for mobile

## Performance Considerations

- Lazy load drawer content when possible
- Use CSS transforms for animations
- Implement virtual scrolling for long lists
- Debounce resize events
- Clean up event listeners on unmount

## Related Components

- [Dialog](./dialog) - Modal dialogs
- [Sheet](./sheet) - Similar sliding panel
- [Popover](./popover) - Floating panels
- [Modal](./modal) - Modal overlays
- [Sidebar](./sidebar) - Fixed sidebars
