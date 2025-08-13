---
id: label
title: Label
sidebar_position: 48
---

import { Label } from '@dainabase/ui';

# Label Component

A flexible and accessible form label component that provides semantic labeling for form controls with built-in support for required indicators, helper text, and proper ARIA associations.

## Preview

```tsx live
function LabelDemo() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <Label htmlFor="password" required>
          Password
        </Label>
        <input
          type="password"
          id="password"
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
      </div>
    </div>
  );
}
```

## Features

- ♿ **Full Accessibility** - WCAG 2.1 AA compliant with proper ARIA
- 🎯 **Form Association** - Automatic form control association via htmlFor
- ⭐ **Required Indicators** - Built-in required field indicators
- 💬 **Helper Text Support** - Integrated helper and error text
- 🎨 **Flexible Styling** - Fully customizable appearance
- 📱 **Touch Friendly** - Increased touch targets on mobile
- 🌐 **RTL Support** - Right-to-left language support
- 🎭 **State Variants** - Error, disabled, and focus states
- 🔤 **Typography Control** - Font weight, size, and color options
- 🧩 **Composable** - Works with any form control

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Label } from '@dainabase/ui';

function App() {
  return (
    <div>
      <Label htmlFor="username">Username</Label>
      <input id="username" type="text" />
    </div>
  );
}
```

## Examples

### 1. Complete Form Example

```tsx
function CompleteFormExample() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    bio: '',
    terms: false,
  });

  return (
    <form className="max-w-lg mx-auto space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" required>
            First Name
          </Label>
          <input
            id="firstName"
            type="text"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="lastName" required>
            Last Name
          </Label>
          <input
            id="lastName"
            type="text"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <input
          id="email"
          type="email"
          className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <p className="mt-1 text-sm text-gray-500">We'll never share your email with anyone else.</p>
      </div>
      
      <div>
        <Label htmlFor="phone">
          Phone Number
          <span className="ml-1 text-sm text-gray-500">(Optional)</span>
        </Label>
        <input
          id="phone"
          type="tel"
          className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      
      <div>
        <Label htmlFor="country">
          Country
        </Label>
        <select
          id="country"
          className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.country}
          onChange={(e) => setFormData({...formData, country: e.target.value})}
        >
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="au">Australia</option>
        </select>
      </div>
      
      <div>
        <Label htmlFor="bio">
          Bio
          <span className="ml-1 text-sm text-gray-500">(Max 200 characters)</span>
        </Label>
        <textarea
          id="bio"
          rows={4}
          maxLength={200}
          className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
        />
        <p className="mt-1 text-sm text-gray-500 text-right">{formData.bio.length}/200</p>
      </div>
      
      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          checked={formData.terms}
          onChange={(e) => setFormData({...formData, terms: e.target.checked})}
        />
        <Label htmlFor="terms" className="ml-2" required>
          I agree to the Terms and Conditions
        </Label>
      </div>
      
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Submit
      </button>
    </form>
  );
}
```

### 2. Validation States

```tsx
function ValidationStatesExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const emailValid = email.includes('@');
  const passwordValid = password.length >= 8;
  
  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      <div>
        <Label 
          htmlFor="email-validation" 
          className={email && !emailValid ? 'text-red-600' : ''}
          required
        >
          Email Address
        </Label>
        <input
          id="email-validation"
          type="email"
          className={`mt-1 w-full px-3 py-2 border rounded-md ${
            email && !emailValid 
              ? 'border-red-500 focus:ring-red-500' 
              : email && emailValid 
              ? 'border-green-500 focus:ring-green-500'
              : 'focus:ring-blue-500'
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={email && !emailValid}
          aria-describedby="email-error"
        />
        {email && !emailValid && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            Please enter a valid email address
          </p>
        )}
        {email && emailValid && (
          <p className="mt-1 text-sm text-green-600">
            ✓ Email format is valid
          </p>
        )}
      </div>
      
      <div>
        <Label 
          htmlFor="password-validation"
          className={password && !passwordValid ? 'text-red-600' : ''}
          required
        >
          Password
        </Label>
        <input
          id="password-validation"
          type="password"
          className={`mt-1 w-full px-3 py-2 border rounded-md ${
            password && !passwordValid 
              ? 'border-red-500 focus:ring-red-500' 
              : password && passwordValid 
              ? 'border-green-500 focus:ring-green-500'
              : 'focus:ring-blue-500'
          }`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={password && !passwordValid}
          aria-describedby="password-error"
        />
        <div className="mt-2 space-y-1">
          <p className={`text-sm ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
            {password.length >= 8 ? '✓' : '○'} At least 8 characters
          </p>
          <p className={`text-sm ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
            {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
          </p>
          <p className={`text-sm ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
            {/[0-9]/.test(password) ? '✓' : '○'} One number
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 3. Radio Button Group

```tsx
function RadioButtonGroupExample() {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  
  const plans = [
    { id: 'basic', name: 'Basic', price: '$9/month', features: '10 projects, 2GB storage' },
    { id: 'pro', name: 'Pro', price: '$29/month', features: 'Unlimited projects, 100GB storage' },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: 'Everything + dedicated support' },
  ];
  
  return (
    <fieldset className="max-w-md mx-auto p-6">
      <legend className="text-lg font-semibold mb-4">Select Your Plan</legend>
      <div className="space-y-3">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedPlan === plan.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <div className="flex items-start">
              <input
                type="radio"
                id={plan.id}
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <Label htmlFor={plan.id} className="font-medium cursor-pointer">
                  {plan.name}
                </Label>
                <p className="text-sm text-gray-600 mt-1">{plan.price}</p>
                <p className="text-sm text-gray-500 mt-1">{plan.features}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
```

### 4. Checkbox Group

```tsx
function CheckboxGroupExample() {
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  
  const features = [
    { id: 'analytics', name: 'Advanced Analytics', description: 'Detailed insights and reports' },
    { id: 'api', name: 'API Access', description: 'Programmatic access to your data' },
    { id: 'export', name: 'Data Export', description: 'Export data in multiple formats' },
    { id: 'collaboration', name: 'Team Collaboration', description: 'Invite team members' },
    { id: 'priority', name: 'Priority Support', description: '24/7 dedicated support' },
  ];
  
  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };
  
  return (
    <fieldset className="max-w-md mx-auto p-6">
      <legend className="text-lg font-semibold mb-4">
        Select Additional Features
        <span className="ml-2 text-sm text-gray-500 font-normal">
          ({selectedFeatures.length} selected)
        </span>
      </legend>
      <div className="space-y-3">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className="flex items-start p-3 border rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              id={feature.id}
              checked={selectedFeatures.includes(feature.id)}
              onChange={() => toggleFeature(feature.id)}
              className="mt-1 h-4 w-4 text-blue-600 rounded"
            />
            <div className="ml-3">
              <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                {feature.name}
              </Label>
              <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedFeatures.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {selectedFeatures.map(id => 
              features.find(f => f.id === id)?.name
            ).join(', ')}
          </p>
        </div>
      )}
    </fieldset>
  );
}
```

### 5. Floating Label Pattern

```tsx
function FloatingLabelExample() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const FloatingInput = ({ id, type = 'text', label, value, onChange }) => (
    <div className="relative">
      <input
        id={id}
        type={type}
        className="peer w-full px-3 py-3 border rounded-md placeholder-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={label}
        value={value}
        onChange={onChange}
      />
      <Label
        htmlFor={id}
        className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </Label>
    </div>
  );
  
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
      
      <FloatingInput
        id="floating-name"
        label="Your Name"
        value={values.name}
        onChange={(e) => setValues({...values, name: e.target.value})}
      />
      
      <FloatingInput
        id="floating-email"
        type="email"
        label="Email Address"
        value={values.email}
        onChange={(e) => setValues({...values, email: e.target.value})}
      />
      
      <div className="relative">
        <textarea
          id="floating-message"
          className="peer w-full px-3 py-3 border rounded-md placeholder-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your Message"
          rows={4}
          value={values.message}
          onChange={(e) => setValues({...values, message: e.target.value})}
        />
        <Label
          htmlFor="floating-message"
          className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
        >
          Your Message
        </Label>
      </div>
      
      <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Send Message
      </button>
    </div>
  );
}
```

### 6. Inline Labels

```tsx
function InlineLabelsExample() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Label htmlFor="inline-search" className="whitespace-nowrap">
          Search:
        </Label>
        <input
          id="inline-search"
          type="search"
          className="flex-1 px-3 py-2 border rounded-md"
          placeholder="Enter search terms..."
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Search
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <Label htmlFor="inline-sort" className="whitespace-nowrap">
          Sort by:
        </Label>
        <select
          id="inline-sort"
          className="px-3 py-2 border rounded-md"
        >
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Most Popular</option>
          <option>Alphabetical</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-4">
        <Label htmlFor="inline-range" className="whitespace-nowrap">
          Price Range:
        </Label>
        <input
          id="inline-min"
          type="number"
          className="w-24 px-3 py-2 border rounded-md"
          placeholder="Min"
        />
        <span>to</span>
        <input
          id="inline-max"
          type="number"
          className="w-24 px-3 py-2 border rounded-md"
          placeholder="Max"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <input
            id="inline-active"
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded"
          />
          <Label htmlFor="inline-active">
            Active Only
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="inline-featured"
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded"
          />
          <Label htmlFor="inline-featured">
            Featured
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="inline-sale"
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded"
          />
          <Label htmlFor="inline-sale">
            On Sale
          </Label>
        </div>
      </div>
    </div>
  );
}
```

### 7. Switch Labels

```tsx
function SwitchLabelsExample() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    publicProfile: false,
    newsletter: true,
  });
  
  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const Switch = ({ id, checked, onChange }) => (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
  
  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="switch-notifications" className="font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-gray-500">Receive notifications about updates</p>
          </div>
          <Switch
            id="switch-notifications"
            checked={settings.notifications}
            onChange={() => toggleSetting('notifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="switch-dark" className="font-medium">
              Dark Mode
            </Label>
            <p className="text-sm text-gray-500">Use dark theme across the app</p>
          </div>
          <Switch
            id="switch-dark"
            checked={settings.darkMode}
            onChange={() => toggleSetting('darkMode')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="switch-save" className="font-medium">
              Auto Save
            </Label>
            <p className="text-sm text-gray-500">Automatically save your work</p>
          </div>
          <Switch
            id="switch-save"
            checked={settings.autoSave}
            onChange={() => toggleSetting('autoSave')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="switch-public" className="font-medium">
              Public Profile
            </Label>
            <p className="text-sm text-gray-500">Make your profile visible to everyone</p>
          </div>
          <Switch
            id="switch-public"
            checked={settings.publicProfile}
            onChange={() => toggleSetting('publicProfile')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="switch-newsletter" className="font-medium">
              Newsletter
            </Label>
            <p className="text-sm text-gray-500">Receive our weekly newsletter</p>
          </div>
          <Switch
            id="switch-newsletter"
            checked={settings.newsletter}
            onChange={() => toggleSetting('newsletter')}
          />
        </div>
      </div>
    </div>
  );
}
```

### 8. File Upload Labels

```tsx
function FileUploadLabelsExample() {
  const [files, setFiles] = useState({
    avatar: null,
    resume: null,
    portfolio: [],
  });
  
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div>
        <Label htmlFor="avatar-upload" className="block mb-2">
          Profile Picture
        </Label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            {files.avatar ? (
              <img 
                src={URL.createObjectURL(files.avatar)} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFiles({...files, avatar: e.target.files[0]})}
            />
            <label
              htmlFor="avatar-upload"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              Choose File
            </label>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="resume-upload" required>
          Resume/CV
        </Label>
        <div className="mt-1 flex items-center justify-center w-full">
          <label
            htmlFor="resume-upload"
            className="w-full flex flex-col items-center px-4 py-6 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {files.resume ? files.resume.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
          </label>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFiles({...files, resume: e.target.files[0]})}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="portfolio-upload">
          Portfolio Items
          <span className="ml-1 text-sm text-gray-500">(Multiple files allowed)</span>
        </Label>
        <input
          id="portfolio-upload"
          type="file"
          multiple
          accept="image/*,.pdf"
          className="mt-1 w-full px-3 py-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={(e) => setFiles({...files, portfolio: Array.from(e.target.files)})}
        />
        {files.portfolio.length > 0 && (
          <ul className="mt-2 text-sm text-gray-600">
            {files.portfolio.map((file, i) => (
              <li key={i}>• {file.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

### 9. Slider Labels

```tsx
function SliderLabelsExample() {
  const [values, setValues] = useState({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    temperature: 5000,
    volume: 70,
  });
  
  const SliderField = ({ id, label, value, min, max, step, unit, onChange }) => (
    <div>
      <div className="flex justify-between mb-2">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <span className="text-sm text-gray-600">
          {value}{unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Image Adjustments</h3>
      
      <SliderField
        id="brightness"
        label="Brightness"
        value={values.brightness}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(e) => setValues({...values, brightness: e.target.value})}
      />
      
      <SliderField
        id="contrast"
        label="Contrast"
        value={values.contrast}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(e) => setValues({...values, contrast: e.target.value})}
      />
      
      <SliderField
        id="saturation"
        label="Saturation"
        value={values.saturation}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(e) => setValues({...values, saturation: e.target.value})}
      />
      
      <SliderField
        id="temperature"
        label="Color Temperature"
        value={values.temperature}
        min={2000}
        max={10000}
        step={100}
        unit="K"
        onChange={(e) => setValues({...values, temperature: e.target.value})}
      />
      
      <SliderField
        id="volume"
        label="Volume"
        value={values.volume}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(e) => setValues({...values, volume: e.target.value})}
      />
      
      <div className="flex space-x-3 pt-4">
        <button className="flex-1 py-2 border rounded-md hover:bg-gray-50">
          Reset
        </button>
        <button className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Apply
        </button>
      </div>
    </div>
  );
}
```

### 10. Dynamic Form Builder

```tsx
function DynamicFormBuilderExample() {
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: 'Full Name', required: true },
    { id: 2, type: 'email', label: 'Email Address', required: true },
  ]);
  
  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      label: `New ${type} field`,
      required: false,
    };
    setFields([...fields, newField]);
  };
  
  const updateField = (id, updates) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };
  
  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-lg font-semibold mb-4">Dynamic Form Builder</h3>
      
      <div className="space-y-4 mb-6">
        {fields.map((field) => (
          <div key={field.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`label-${field.id}`} className="text-sm">
                    Field Label
                  </Label>
                  <input
                    id={`label-${field.id}`}
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="mt-1 w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor={`type-${field.id}`} className="text-sm">
                    Field Type
                  </Label>
                  <select
                    id={`type-${field.id}`}
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value })}
                    className="mt-1 w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => removeField(field.id)}
                className="ml-3 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Required</span>
              </label>
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <Label htmlFor={`preview-${field.id}`} required={field.required}>
                {field.label}
              </Label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`preview-${field.id}`}
                  className="mt-1 w-full px-3 py-2 border rounded"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  disabled
                />
              ) : (
                <input
                  id={`preview-${field.id}`}
                  type={field.type}
                  className="mt-1 w-full px-3 py-2 border rounded"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  disabled
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => addField('text')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Text Field
        </button>
        <button
          onClick={() => addField('email')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Email Field
        </button>
        <button
          onClick={() => addField('textarea')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Textarea
        </button>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `string` | `undefined` | ID of the form control this label is for |
| `required` | `boolean` | `false` | Shows required indicator |
| `disabled` | `boolean` | `false` | Applies disabled styling |
| `error` | `boolean` | `false` | Applies error styling |
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Label content |
| `asChild` | `boolean` | `false` | Render as child component |
| `onClick` | `(event: MouseEvent) => void` | `undefined` | Click handler |

## Accessibility

The Label component follows WCAG 2.1 Level AA guidelines:

- **Semantic HTML**: Uses `<label>` element for proper semantics
- **Form Association**: Automatic association via `htmlFor` attribute
- **Required Indicators**: Visual and semantic required field indicators
- **Click Targets**: Labels increase click target area for inputs
- **Screen Reader Support**: Properly announced by assistive technology
- **ARIA Attributes**:
  - `aria-required` for required fields
  - `aria-invalid` for error states
  - `aria-describedby` for helper text
  - `aria-label` when needed

### Best Practices for Accessibility

1. Always use `htmlFor` to associate labels with controls
2. Include required indicators for mandatory fields
3. Provide helper text for complex inputs
4. Use clear, descriptive label text
5. Ensure sufficient color contrast
6. Don't rely on placeholder text alone
7. Group related fields with fieldsets
8. Use proper heading hierarchy
9. Test with screen readers
10. Ensure keyboard navigation works

## Best Practices

### Do's ✅

- Always associate labels with form controls
- Use clear, concise label text
- Show required indicators for mandatory fields
- Position labels consistently (above or to the left)
- Use sentence case for labels
- Include helper text for complex fields
- Group related fields visually
- Test with screen readers
- Ensure labels are clickable
- Use proper semantic HTML

### Don'ts ❌

- Don't use placeholder text as labels
- Don't hide labels (use screen-reader-only if needed)
- Don't use all caps for labels
- Don't make labels too long
- Don't use unclear abbreviations
- Don't forget required indicators
- Don't use color alone to indicate state
- Don't position labels inconsistently
- Don't use labels for non-form elements
- Don't forget to test accessibility

## Use Cases

1. **Form Fields** - Text inputs, selects, textareas
2. **Checkboxes** - Single and grouped checkboxes
3. **Radio Buttons** - Radio button groups
4. **File Uploads** - File input fields
5. **Switches/Toggles** - Toggle switches
6. **Sliders** - Range inputs
7. **Date Pickers** - Date/time inputs
8. **Search Fields** - Search inputs
9. **Filters** - Filter controls
10. **Settings** - Configuration options

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Label not clickable | Check `htmlFor` matches input `id` |
| Required indicator not showing | Verify `required` prop is set |
| Screen reader not announcing | Check proper label association |
| Styling not applied | Check className and CSS specificity |
| Label wrapping incorrectly | Use `whitespace-nowrap` class |
| Click target too small | Increase padding on label |

## Related Components

- [**Input**](./input) - Text input fields
- [**Select**](./select) - Dropdown select fields
- [**Checkbox**](./checkbox) - Checkbox inputs
- [**RadioGroup**](./radio-group) - Radio button groups
- [**Switch**](./switch) - Toggle switches
- [**Textarea**](./textarea) - Multi-line text inputs
- [**Form**](./form) - Form wrapper component
- [**Slider**](./slider) - Range slider inputs
