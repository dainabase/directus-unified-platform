import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  Input, 
  ExecutiveInput, 
  ValidationInput, 
  AnalyticsInput, 
  FinanceInput,
  validationRules,
  type ValidationRule
} from './index';

// ===============================
// 🎯 STORYBOOK META CONFIGURATION
// ===============================

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# 🎯 Input Component - Enterprise Forms Foundation

A comprehensive input component designed for enterprise applications with advanced theming, validation, and business-focused variants.

## ✨ Key Features

- **6 Premium Themes**: Executive, Dashboard, Finance, Analytics, Minimal, Default
- **13 Variants**: Primary, Secondary, Executive, Error, Success, Ghost, and more
- **4 Specialized Components**: ExecutiveInput, ValidationInput, AnalyticsInput, FinanceInput
- **Advanced Validation**: Real-time validation with 8+ built-in rules
- **Icon System**: 25+ icons with left/right positioning
- **Loading & Success States**: Professional feedback indicators
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Business Scenarios**: KPI forms, user management, financial data entry

## 🚀 Perfect For

- Executive dashboards and C-level interfaces
- Financial applications and data entry forms
- Analytics platforms and data science tools
- User registration and profile management
- Search and filtering interfaces
- Real-time validation requirements
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['default', 'executive', 'dashboard', 'finance', 'analytics', 'minimal'],
      description: 'Visual theme for different business contexts'
    },
    variant: {
      control: { type: 'select' },
      options: [
        'primary', 'secondary', 'executive', 'dashboard', 'finance', 'analytics',
        'error', 'success', 'ghost', 'outline', 'link', 'icon', 'floating'
      ],
      description: 'Input variant for different use cases'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'xl'],
      description: 'Input size'
    },
    icon: {
      control: { type: 'select' },
      options: [
        'user', 'email', 'search', 'lock', 'briefcase', 
        'chartBar', 'currency', 'check', 'exclamation', 'loading'
      ],
      description: 'Left icon'
    },
    rightIcon: {
      control: { type: 'select' },
      options: [
        'user', 'email', 'search', 'lock', 'briefcase', 
        'chartBar', 'currency', 'check', 'exclamation', 'loading'
      ],
      description: 'Right icon'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner'
    },
    success: {
      control: 'boolean',
      description: 'Show success state'
    },
    showValidation: {
      control: 'boolean',
      description: 'Display validation messages'
    },
    validateOnChange: {
      control: 'boolean',
      description: 'Validate on every change'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// ===============================
// 🎯 BASIC STORIES
// ===============================

export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...'
  }
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email'
  }
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    helperText: 'Must be at least 3 characters long'
  }
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    validation: [validationRules.required()],
    showValidation: true
  }
};

// ===============================
// 🎭 THEME SHOWCASE
// ===============================

export const ThemeShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎨 Theme System Showcase</h2>
        <p className="text-gray-600">Six premium themes for different business contexts</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Executive Theme */}
        <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="font-semibold mb-3 text-blue-900">🎯 Executive Theme</h3>
          <Input 
            theme="executive"
            label="Executive Dashboard"
            placeholder="C-level interface input"
            icon="briefcase"
          />
        </div>
        
        {/* Dashboard Theme */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3 text-gray-900">📊 Dashboard Theme</h3>
          <Input 
            theme="dashboard"
            label="Business Intelligence"
            placeholder="Dashboard filter input"
            icon="chartBar"
          />
        </div>
        
        {/* Finance Theme */}
        <div className="p-4 border rounded-lg bg-gradient-to-br from-emerald-50 to-green-50">
          <h3 className="font-semibold mb-3 text-emerald-900">💰 Finance Theme</h3>
          <Input 
            theme="finance"
            label="Financial Amount"
            placeholder="0.00"
            icon="currency"
          />
        </div>
        
        {/* Analytics Theme */}
        <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <h3 className="font-semibold mb-3 text-purple-900">📈 Analytics Theme</h3>
          <Input 
            theme="analytics"
            label="Data Science Metric"
            placeholder="Enter metric value"
            icon="chartBar"
          />
        </div>
        
        {/* Minimal Theme */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3 text-gray-700">🎨 Minimal Theme</h3>
          <Input 
            theme="minimal"
            label="Clean Interface"
            placeholder="Minimal design input"
          />
        </div>
        
        {/* Default Theme */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">🔹 Default Theme</h3>
          <Input 
            theme="default"
            label="Standard Input"
            placeholder="Versatile enterprise input"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Six premium themes designed for different business contexts and use cases.'
      }
    }
  }
};

// ===============================
// 🎭 VARIANT GALLERY
// ===============================

export const VariantGallery: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎭 Variant Gallery</h2>
        <p className="text-gray-600">13 variants for every business scenario</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="font-medium text-sm">Primary</label>
          <Input variant="primary" placeholder="Primary variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Secondary</label>
          <Input variant="secondary" placeholder="Secondary variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Executive</label>
          <Input variant="executive" placeholder="Executive variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Dashboard</label>
          <Input variant="dashboard" placeholder="Dashboard variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Finance</label>
          <Input variant="finance" placeholder="Finance variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Analytics</label>
          <Input variant="analytics" placeholder="Analytics variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Error</label>
          <Input variant="error" placeholder="Error state" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Success</label>
          <Input variant="success" placeholder="Success state" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Ghost</label>
          <Input variant="ghost" placeholder="Ghost variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Outline</label>
          <Input variant="outline" placeholder="Outline variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Link</label>
          <Input variant="link" placeholder="Link variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Icon</label>
          <Input variant="icon" icon="user" placeholder="Icon variant" />
        </div>
        
        <div className="space-y-2">
          <label className="font-medium text-sm">Floating</label>
          <Input variant="floating" placeholder="Floating variant" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete gallery of all 13 variants showcasing different styling approaches.'
      }
    }
  }
};

// ===============================
// 🎯 SIZE VARIANTS
// ===============================

export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">📏 Size Variants</h2>
        <p className="text-gray-600">Four sizes to fit any interface</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-sm mb-2">Small (sm)</label>
          <Input size="sm" placeholder="Small input for compact interfaces" />
        </div>
        
        <div>
          <label className="block font-medium text-sm mb-2">Default</label>
          <Input size="default" placeholder="Default size for most use cases" />
        </div>
        
        <div>
          <label className="block font-medium text-sm mb-2">Large (lg)</label>
          <Input size="lg" placeholder="Large input for emphasis and accessibility" />
        </div>
        
        <div>
          <label className="block font-medium text-sm mb-2">Extra Large (xl)</label>
          <Input size="xl" placeholder="Extra large for maximum impact" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Four size variants from compact to extra large for different interface needs.'
      }
    }
  }
};

// ===============================
// 🎨 ICON SYSTEM SHOWCASE
// ===============================

export const IconShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎨 Icon System</h2>
        <p className="text-gray-600">25+ icons with flexible positioning</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Icons */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Left Icons</h3>
          <Input icon="user" placeholder="User icon" />
          <Input icon="email" placeholder="Email icon" />
          <Input icon="search" placeholder="Search icon" />
          <Input icon="lock" placeholder="Lock icon" />
          <Input icon="briefcase" placeholder="Briefcase icon" />
          <Input icon="chartBar" placeholder="Chart icon" />
          <Input icon="currency" placeholder="Currency icon" />
        </div>
        
        {/* Right Icons */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Right Icons</h3>
          <Input rightIcon="check" placeholder="Check icon" success />
          <Input rightIcon="exclamation" placeholder="Warning icon" variant="error" />
          <Input rightIcon="search" placeholder="Search on right" />
          <Input loading placeholder="Loading state" />
        </div>
      </div>
      
      {/* Both Icons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Both Icons</h3>
        <Input icon="user" rightIcon="check" placeholder="Both left and right icons" />
        <Input icon="email" loading placeholder="Left icon with loading" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive icon system with flexible positioning and status indicators.'
      }
    }
  }
};

// ===============================
// ⚡ VALIDATION SYSTEM SHOWCASE
// ===============================

export const ValidationShowcase: Story = {
  render: () => {
    const [emailValid, setEmailValid] = useState(false);
    const [phoneValid, setPhoneValid] = useState(false);
    const [currencyValid, setCurrencyValid] = useState(false);
    
    return (
      <div className="space-y-8 p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">⚡ Validation System</h2>
          <p className="text-gray-600">Real-time validation with comprehensive rules</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Validation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Validation</h3>
            
            <Input 
              label="Required Field"
              placeholder="This field is required"
              validation={[validationRules.required()]}
              showValidation
              helperText="Try leaving this empty and clicking away"
            />
            
            <Input 
              label="Minimum Length (5 chars)"
              placeholder="Enter at least 5 characters"
              validation={[validationRules.minLength(5)]}
              showValidation
              validateOnChange
            />
            
            <Input 
              label="Maximum Length (10 chars)"
              placeholder="Max 10 characters"
              validation={[validationRules.maxLength(10)]}
              showValidation
              validateOnChange
            />
          </div>
          
          {/* Advanced Validation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Advanced Validation</h3>
            
            <Input 
              label="Email Address"
              placeholder="user@example.com"
              validation={[validationRules.email()]}
              showValidation
              validateOnChange
              onValidationChange={(isValid) => setEmailValid(isValid)}
              successText={emailValid ? "Valid email format!" : undefined}
              icon="email"
            />
            
            <Input 
              label="Phone Number"
              placeholder="+1234567890"
              validation={[validationRules.phoneNumber()]}
              showValidation
              validateOnChange
              onValidationChange={(isValid) => setPhoneValid(isValid)}
              successText={phoneValid ? "Valid phone number!" : undefined}
            />
            
            <Input 
              label="Currency Amount"
              placeholder="1234.56"
              validation={[validationRules.currency()]}
              showValidation
              validateOnChange
              onValidationChange={(isValid) => setCurrencyValid(isValid)}
              successText={currencyValid ? "Valid amount!" : undefined}
              icon="currency"
            />
          </div>
        </div>
        
        {/* Complex Validation */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Complex Multi-Rule Validation</h3>
          
          <Input 
            label="Secure Password"
            type="password"
            placeholder="Enter a secure password"
            validation={[
              validationRules.required("Password is required"),
              validationRules.minLength(8, "Password must be at least 8 characters"),
              validationRules.pattern(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                "Password must contain uppercase, lowercase, number, and special character"
              )
            ]}
            showValidation
            validateOnChange
            helperText="Must be 8+ characters with uppercase, lowercase, number, and special character"
            icon="lock"
          />
          
          <Input 
            label="Business Email"
            placeholder="john.doe@company.com"
            validation={[
              validationRules.required(),
              validationRules.email(),
              validationRules.pattern(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov)$/,
                "Must be a valid business email with common TLD"
              )
            ]}
            showValidation
            validateOnChange
            helperText="Enter your business email address"
            icon="briefcase"
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive validation system with real-time feedback and multiple rule combinations.'
      }
    }
  }
};

// ===============================
// 🔧 SPECIALIZED COMPONENTS
// ===============================

export const SpecializedComponents: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🔧 Specialized Components</h2>
        <p className="text-gray-600">Purpose-built components for specific business needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Executive Input */}
        <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="font-semibold text-lg mb-4 text-blue-900">🎯 ExecutiveInput</h3>
          <div className="space-y-4">
            <ExecutiveInput 
              label="Executive Dashboard Filter"
              placeholder="C-level interface optimized"
            />
            <ExecutiveInput 
              label="Strategic Metric"
              placeholder="Enter KPI value"
              validation={[validationRules.required()]}
              showValidation
            />
          </div>
          <p className="text-sm text-blue-700 mt-3">
            Pre-configured with executive theme, large size, and premium styling
          </p>
        </div>
        
        {/* Validation Input */}
        <div className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="font-semibold text-lg mb-4 text-green-900">⚡ ValidationInput</h3>
          <div className="space-y-4">
            <ValidationInput 
              label="Email Validation"
              placeholder="Auto-validates email format"
              validationType="email"
            />
            <ValidationInput 
              label="Phone Validation"
              placeholder="Auto-validates phone numbers"
              validationType="phone"
            />
          </div>
          <p className="text-sm text-green-700 mt-3">
            Built-in validation types: email, phone, currency, alphanumeric
          </p>
        </div>
        
        {/* Analytics Input */}
        <div className="p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <h3 className="font-semibold text-lg mb-4 text-purple-900">📈 AnalyticsInput</h3>
          <div className="space-y-4">
            <AnalyticsInput 
              label="Data Science Metric"
              placeholder="Chart icon included"
            />
            <AnalyticsInput 
              label="Algorithm Parameter"
              placeholder="Purple theme optimized"
              validation={[validationRules.required()]}
              showValidation
            />
          </div>
          <p className="text-sm text-purple-700 mt-3">
            Analytics theme with chart icon for data science interfaces
          </p>
        </div>
        
        {/* Finance Input */}
        <div className="p-6 border rounded-lg bg-gradient-to-br from-emerald-50 to-green-50">
          <h3 className="font-semibold text-lg mb-4 text-emerald-900">💰 FinanceInput</h3>
          <div className="space-y-4">
            <FinanceInput 
              label="Financial Amount"
              placeholder="Currency icon included"
            />
            <FinanceInput 
              label="Budget Entry"
              placeholder="0.00"
              validation={[validationRules.currency()]}
              showValidation
              validateOnChange
            />
          </div>
          <p className="text-sm text-emerald-700 mt-3">
            Finance theme with currency icon for financial applications
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Four specialized components pre-configured for specific business domains.'
      }
    }
  }
};

// ===============================
// 💼 BUSINESS SCENARIOS
// ===============================

export const BusinessScenarios: Story = {
  render: () => {
    const [registrationData, setRegistrationData] = useState({
      fullName: '',
      email: '',
      password: ''
    });
    
    const [financeData, setFinanceData] = useState({
      amount: '',
      description: ''
    });
    
    return (
      <div className="space-y-10 p-6 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">💼 Business Scenarios</h2>
          <p className="text-gray-600">Real-world use cases and implementations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Registration */}
          <div className="p-6 border rounded-lg bg-blue-50">
            <h3 className="font-semibold text-lg mb-4 text-blue-900">👤 User Registration Form</h3>
            <div className="space-y-4">
              <Input 
                label="Full Name"
                placeholder="Enter your full name"
                validation={[validationRules.required(), validationRules.minLength(2)]}
                showValidation
                icon="user"
                value={registrationData.fullName}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, fullName: e.target.value }))}
              />
              
              <ValidationInput 
                label="Email Address"
                placeholder="user@company.com"
                validationType="email"
                validation={[validationRules.required()]}
                icon="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
              />
              
              <Input 
                label="Password"
                type="password"
                placeholder="Create a secure password"
                validation={[
                  validationRules.required(),
                  validationRules.minLength(8),
                  validationRules.pattern(/(?=.*[A-Z])/, "Must contain uppercase letter"),
                  validationRules.pattern(/(?=.*\d)/, "Must contain number")
                ]}
                showValidation
                validateOnChange
                icon="lock"
                value={registrationData.password}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Financial Data Entry */}
          <div className="p-6 border rounded-lg bg-emerald-50">
            <h3 className="font-semibold text-lg mb-4 text-emerald-900">💰 Financial Data Entry</h3>
            <div className="space-y-4">
              <FinanceInput 
                label="Amount"
                placeholder="0.00"
                validation={[validationRules.required(), validationRules.currency()]}
                showValidation
                validateOnChange
                successText="Valid amount format"
                value={financeData.amount}
                onChange={(e) => setFinanceData(prev => ({ ...prev, amount: e.target.value }))}
              />
              
              <Input 
                theme="finance"
                label="Description"
                placeholder="Transaction description"
                validation={[validationRules.required(), validationRules.minLength(5)]}
                showValidation
                helperText="Describe the financial transaction"
                value={financeData.description}
                onChange={(e) => setFinanceData(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <Input 
                theme="finance"
                label="Category"
                placeholder="Select or enter category"
                rightIcon="chartBar"
              />
            </div>
          </div>
          
          {/* Search Interface */}
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">🔍 Advanced Search</h3>
            <div className="space-y-4">
              <Input 
                variant="ghost"
                size="lg"
                placeholder="Search users, projects, or documents..."
                icon="search"
                className="bg-white shadow-sm"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  variant="outline"
                  placeholder="Filter by department"
                  size="sm"
                />
                <Input 
                  variant="outline"
                  placeholder="Date range"
                  type="date"
                  size="sm"
                />
              </div>
            </div>
          </div>
          
          {/* Analytics Dashboard */}
          <div className="p-6 border rounded-lg bg-purple-50">
            <h3 className="font-semibold text-lg mb-4 text-purple-900">📊 Analytics Dashboard</h3>
            <div className="space-y-4">
              <AnalyticsInput 
                label="Metric Name"
                placeholder="Monthly Revenue"
              />
              
              <Input 
                theme="analytics"
                label="Time Period"
                type="date"
                icon="chartBar"
              />
              
              <Input 
                theme="analytics"
                label="Target Value"
                placeholder="Enter target KPI"
                validation={[validationRules.pattern(/^\d+\.?\d*$/, "Must be a number")]}
                showValidation
                validateOnChange
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Real-world business scenarios showcasing practical implementations and use cases.'
      }
    }
  }
};

// ===============================
// 🚀 INTERACTIVE FEATURES
// ===============================

export const InteractiveFeatures: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState('');
    
    const handleSubmit = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }, 2000);
    };
    
    return (
      <div className="space-y-8 p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">🚀 Interactive Features</h2>
          <p className="text-gray-600">Dynamic states and micro-interactions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loading States */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Loading & Success States</h3>
            
            <Input 
              label="Simulated API Call"
              placeholder="Enter data to submit"
              loading={loading}
              success={success}
              successText="Data submitted successfully!"
              value={formData}
              onChange={(e) => setFormData(e.target.value)}
            />
            
            <button
              onClick={handleSubmit}
              disabled={loading || !formData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Data'}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <Input loading placeholder="Always loading" />
              <Input success successText="Always success" />
            </div>
          </div>
          
          {/* Focus & Hover States */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Focus & Hover Effects</h3>
            
            <Input 
              theme="executive"
              label="Executive Focus"
              placeholder="Focus to see gradient highlights"
              helperText="Notice the premium focus animation"
            />
            
            <Input 
              variant="analytics"
              label="Analytics Hover"
              placeholder="Hover for scale animation"
              icon="chartBar"
            />
            
            <Input 
              variant="floating"
              label="Floating Label"
              placeholder="Floating label animation"
              theme="finance"
            />
          </div>
        </div>
        
        {/* Real-time Validation Demo */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Real-time Validation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ValidationInput 
              label="Email"
              validationType="email"
              placeholder="Watch validation change"
              validateOnChange
            />
            
            <ValidationInput 
              label="Phone"
              validationType="phone"
              placeholder="Real-time phone validation"
              validateOnChange
            />
            
            <ValidationInput 
              label="Currency"
              validationType="currency"
              placeholder="Live currency validation"
              validateOnChange
            />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive features showcasing dynamic states, animations, and real-time feedback.'
      }
    }
  }
};

// ===============================
// ♿ ACCESSIBILITY SHOWCASE
// ===============================

export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">♿ Accessibility Features</h2>
        <p className="text-gray-600">WCAG 2.1 AA compliant with enhanced accessibility</p>
      </div>
      
      <div className="space-y-6">
        {/* Proper Labeling */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">🏷️ Proper Labeling & Association</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              id="accessible-email"
              label="Email Address"
              placeholder="user@example.com"
              aria-describedby="email-help"
              helperText="We'll never share your email"
            />
            
            <Input 
              id="accessible-password"
              label="Password"
              type="password"
              placeholder="Enter secure password"
              aria-describedby="password-help"
              helperText="Must be at least 8 characters"
              validation={[validationRules.minLength(8)]}
              showValidation
            />
          </div>
        </div>
        
        {/* Focus Management */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">⌨️ Focus Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              label="Tab Order 1"
              placeholder="Tab to next field"
              autoFocus
            />
            <Input 
              label="Tab Order 2"
              placeholder="Focus indicator visible"
            />
            <Input 
              label="Tab Order 3"
              placeholder="Keyboard navigation"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Try using Tab and Shift+Tab to navigate between fields
          </p>
        </div>
        
        {/* Error States */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">⚠️ Error Communication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Required Field"
              placeholder="Leave empty and blur"
              validation={[validationRules.required()]}
              showValidation
              aria-invalid="false"
              helperText="This field is required for form submission"
            />
            
            <Input 
              label="Format Validation"
              placeholder="Enter invalid email"
              validation={[validationRules.email()]}
              showValidation
              validateOnChange
              helperText="Email format will be validated in real-time"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Error messages are announced to screen readers
          </p>
        </div>
        
        {/* High Contrast */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">🎨 High Contrast Support</h3>
          <div className="space-y-4">
            <Input 
              variant="outline"
              label="High Contrast Outline"
              placeholder="Visible in high contrast mode"
            />
            
            <Input 
              variant="error"
              label="Error State Contrast"
              placeholder="Clear error indication"
              validation={[validationRules.required()]}
              showValidation
              errorText="High contrast error message"
            />
            
            <Input 
              variant="success"
              label="Success State Contrast"
              placeholder="Clear success indication"
              success
              successText="High contrast success message"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive accessibility features ensuring WCAG 2.1 AA compliance and inclusive design.'
      }
    }
  }
};

// ===============================
// 🎮 INTERACTIVE PLAYGROUND
// ===============================

export const InteractivePlayground: Story = {
  render: () => {
    const [config, setConfig] = useState({
      theme: 'default' as const,
      variant: 'primary' as const,
      size: 'default' as const,
      icon: 'user' as const,
      rightIcon: '' as any,
      loading: false,
      success: false,
      showValidation: true,
      validateOnChange: false,
      label: 'Interactive Input',
      placeholder: 'Try different configurations...',
      helperText: 'Customize the input using the controls below'
    });
    
    const handleConfigChange = (key: string, value: any) => {
      setConfig(prev => ({ ...prev, [key]: value }));
    };
    
    return (
      <div className="space-y-8 p-6 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">🎮 Interactive Playground</h2>
          <p className="text-gray-600">Experiment with all input configurations</p>
        </div>
        
        {/* Live Preview */}
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
          <h3 className="font-semibold mb-6 text-lg">Live Preview</h3>
          <div className="max-w-md mx-auto">
            <Input 
              {...config}
              rightIcon={config.rightIcon || undefined}
              validation={config.showValidation ? [validationRules.email()] : []}
            />
          </div>
        </div>
        
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="font-medium">Theme</label>
            <select 
              value={config.theme}
              onChange={(e) => handleConfigChange('theme', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="default">Default</option>
              <option value="executive">Executive</option>
              <option value="dashboard">Dashboard</option>
              <option value="finance">Finance</option>
              <option value="analytics">Analytics</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          
          {/* Variant Selection */}
          <div className="space-y-2">
            <label className="font-medium">Variant</label>
            <select 
              value={config.variant}
              onChange={(e) => handleConfigChange('variant', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="executive">Executive</option>
              <option value="dashboard">Dashboard</option>
              <option value="finance">Finance</option>
              <option value="analytics">Analytics</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
              <option value="ghost">Ghost</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          
          {/* Size Selection */}
          <div className="space-y-2">
            <label className="font-medium">Size</label>
            <select 
              value={config.size}
              onChange={(e) => handleConfigChange('size', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="sm">Small</option>
              <option value="default">Default</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          
          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="font-medium">Left Icon</label>
            <select 
              value={config.icon}
              onChange={(e) => handleConfigChange('icon', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">None</option>
              <option value="user">User</option>
              <option value="email">Email</option>
              <option value="search">Search</option>
              <option value="lock">Lock</option>
              <option value="briefcase">Briefcase</option>
              <option value="chartBar">Chart</option>
              <option value="currency">Currency</option>
            </select>
          </div>
          
          {/* Right Icon Selection */}
          <div className="space-y-2">
            <label className="font-medium">Right Icon</label>
            <select 
              value={config.rightIcon}
              onChange={(e) => handleConfigChange('rightIcon', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">None</option>
              <option value="search">Search</option>
              <option value="check">Check</option>
              <option value="exclamation">Exclamation</option>
            </select>
          </div>
          
          {/* Text Inputs */}
          <div className="space-y-2">
            <label className="font-medium">Label</label>
            <input 
              type="text"
              value={config.label}
              onChange={(e) => handleConfigChange('label', e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-medium">Placeholder</label>
            <input 
              type="text"
              value={config.placeholder}
              onChange={(e) => handleConfigChange('placeholder', e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-medium">Helper Text</label>
            <input 
              type="text"
              value={config.helperText}
              onChange={(e) => handleConfigChange('helperText', e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          {/* Boolean Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={config.loading}
                  onChange={(e) => handleConfigChange('loading', e.target.checked)}
                  className="rounded"
                />
                <span>Loading State</span>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={config.success}
                  onChange={(e) => handleConfigChange('success', e.target.checked)}
                  className="rounded"
                />
                <span>Success State</span>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={config.showValidation}
                  onChange={(e) => handleConfigChange('showValidation', e.target.checked)}
                  className="rounded"
                />
                <span>Show Validation</span>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={config.validateOnChange}
                  onChange={(e) => handleConfigChange('validateOnChange', e.target.checked)}
                  className="rounded"
                />
                <span>Validate on Change</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Generated Code */}
        <div className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto">
          <h3 className="font-semibold mb-2 text-white">Generated Code:</h3>
          <pre className="text-sm">
{`<Input
  theme="${config.theme}"
  variant="${config.variant}"
  size="${config.size}"${config.icon ? `
  icon="${config.icon}"` : ''}${config.rightIcon ? `
  rightIcon="${config.rightIcon}"` : ''}
  label="${config.label}"
  placeholder="${config.placeholder}"
  helperText="${config.helperText}"${config.loading ? `
  loading={true}` : ''}${config.success ? `
  success={true}` : ''}${config.showValidation ? `
  showValidation={true}` : ''}${config.validateOnChange ? `
  validateOnChange={true}` : ''}
/>`}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all input configurations and generate code.'
      }
    }
  }
};

// ===============================
// 📚 DOCUMENTATION EXAMPLES
// ===============================

export const DocumentationExamples: Story = {
  render: () => (
    <div className="space-y-8 p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">📚 Code Examples</h2>
        <p className="text-gray-600">Ready-to-use examples for common scenarios</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Usage */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Basic Usage</h3>
          <div className="p-4 border rounded-lg">
            <Input 
              label="Basic Input"
              placeholder="Enter text"
              helperText="This is a basic input example"
            />
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Input 
  label="Basic Input"
  placeholder="Enter text"
  helperText="This is a basic input example"
/>`}
          </pre>
        </div>
        
        {/* With Validation */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">With Validation</h3>
          <div className="p-4 border rounded-lg">
            <Input 
              label="Email Address"
              placeholder="user@example.com"
              validation={[validationRules.required(), validationRules.email()]}
              showValidation
              validateOnChange
              icon="email"
            />
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Input 
  label="Email Address"
  placeholder="user@example.com"
  validation={[
    validationRules.required(), 
    validationRules.email()
  ]}
  showValidation
  validateOnChange
  icon="email"
/>`}
          </pre>
        </div>
        
        {/* Specialized Component */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Specialized Component</h3>
          <div className="p-4 border rounded-lg">
            <ExecutiveInput 
              label="Executive Dashboard"
              placeholder="C-level optimized input"
            />
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<ExecutiveInput 
  label="Executive Dashboard"
  placeholder="C-level optimized input"
/>`}
          </pre>
        </div>
        
        {/* Custom Theme */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Custom Theme</h3>
          <div className="p-4 border rounded-lg">
            <Input 
              theme="finance"
              variant="finance"
              label="Financial Amount"
              placeholder="0.00"
              icon="currency"
              validation={[validationRules.currency()]}
              showValidation
            />
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Input 
  theme="finance"
  variant="finance"
  label="Financial Amount"
  placeholder="0.00"
  icon="currency"
  validation={[validationRules.currency()]}
  showValidation
/>`}
          </pre>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete code examples for common implementation patterns and use cases.'
      }
    }
  }
};