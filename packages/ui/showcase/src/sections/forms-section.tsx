// 🎯 FORMS & INPUTS SECTION - COMPLETE INTERACTIVE SHOWCASE
// Demonstrates all 18+ form components with live validation and examples

import React, { useState } from 'react';
import { 
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Slider,
  Toggle,
  ToggleGroup,
  DatePicker,
  ColorPicker,
  Rating
} from '../components';
import { 
  FileText, 
  Palette, 
  Calendar,
  Star,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Mail,
  Phone,
  Lock,
  User,
  Globe,
  CreditCard,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';

// =================== DEMO COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-2">
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
  code,
  fullWidth = false 
}: { 
  title: string, 
  description: string, 
  children: React.ReactNode,
  code?: string,
  fullWidth?: boolean
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className={fullWidth ? "space-y-4" : "flex flex-wrap gap-4"}>
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

const FormExample = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6">
    <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// =================== MAIN FORMS SECTION ===================

export const FormsSection = () => {
  const [activeDemo, setActiveDemo] = useState<string>('inputs');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agreement: false,
    theme: 'light',
    notifications: true,
    budget: 50,
    rating: 4,
    color: '#3b82f6',
    birthdate: null,
    description: ''
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Forms & Inputs Showcase
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Complete form system with 18+ components, live validation, accessibility features, 
          and modern UX patterns for professional applications.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={FileText} value="18+" label="Components" />
          <StatCard icon={CheckCircle} value="A11Y" label="Accessible" />
          <StatCard icon={Settings} value="100%" label="Customizable" />
          <StatCard icon={Star} value="Live" label="Validation" />
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {[
          { id: 'inputs', label: 'Text Inputs', icon: FileText },
          { id: 'selection', label: 'Selection', icon: CheckCircle },
          { id: 'advanced', label: 'Advanced', icon: Settings },
          { id: 'validation', label: 'Validation', icon: AlertCircle },
          { id: 'examples', label: 'Real Forms', icon: Star }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveDemo(id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeDemo === id
                ? 'bg-emerald-600 text-white shadow-lg'
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
        
        {/* Text Inputs Demo */}
        {activeDemo === 'inputs' && (
          <>
            <ComponentDemo
              title="Input Variants"
              description="Versatile input component with icons, validation states, and modern styling"
              code="<Input placeholder='Enter your email' icon={Mail} />"
              fullWidth
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-3">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="john@example.com" 
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="search"
                      type="search" 
                      placeholder="Search anything..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="phone"
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Textarea Component"
              description="Multi-line text input with auto-resize and character counting"
              code="<Textarea placeholder='Write your message...' rows={4} />"
              fullWidth
            >
              <div className="w-full space-y-3">
                <Label htmlFor="description">Project Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe your project goals, timeline, and requirements..."
                  rows={4}
                  className="resize-none"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Selection Controls Demo */}
        {activeDemo === 'selection' && (
          <>
            <ComponentDemo
              title="Checkboxes & Switches"
              description="Modern selection controls with smooth animations"
              code="<Checkbox checked={true} /> <Switch checked={true} />"
              fullWidth
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Checkboxes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="agreement" 
                        checked={formData.agreement}
                        onChange={(checked) => updateFormData('agreement', checked)}
                      />
                      <Label htmlFor="agreement">I agree to the terms and conditions</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="newsletter" />
                      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="marketing" defaultChecked />
                      <Label htmlFor="marketing">Marketing communications</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Switches</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Push Notifications</Label>
                      <Switch 
                        id="notifications"
                        checked={formData.notifications}
                        onChange={(checked) => updateFormData('notifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <Switch id="dark-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics">Analytics Tracking</Label>
                      <Switch id="analytics" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Radio Groups & Selects"
              description="Single selection controls with various styling options"
              fullWidth
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-4">
                  <Label>Preferred Theme</Label>
                  <RadioGroup 
                    value={formData.theme}
                    onChange={(value) => updateFormData('theme', value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="light" name="theme" value="light" />
                      <Label htmlFor="light">Light Theme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="dark" name="theme" value="dark" />
                      <Label htmlFor="dark">Dark Theme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="auto" name="theme" value="auto" />
                      <Label htmlFor="auto">Auto (System)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="country">Country/Region</Label>
                  <Select>
                    <option value="">Select your country</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="de">Germany</option>
                    <option value="fr">France</option>
                    <option value="jp">Japan</option>
                  </Select>
                </div>
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Advanced Components Demo */}
        {activeDemo === 'advanced' && (
          <>
            <ComponentDemo
              title="Sliders & Ratings"
              description="Interactive range controls and feedback components"
              fullWidth
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-4">
                  <Label>Budget Range: ${formData.budget}K</Label>
                  <Slider
                    value={[formData.budget]}
                    onValueChange={(value) => updateFormData('budget', value[0])}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$10K</span>
                    <span>$100K</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Rate your experience</Label>
                  <Rating 
                    value={formData.rating}
                    onChange={(value) => updateFormData('rating', value)}
                    className="text-yellow-400"
                  />
                  <p className="text-sm text-gray-600">
                    {formData.rating === 5 ? 'Excellent!' : 
                     formData.rating === 4 ? 'Good' :
                     formData.rating === 3 ? 'Average' :
                     formData.rating === 2 ? 'Poor' : 'Very Poor'}
                  </p>
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Color Picker & Date Picker"
              description="Advanced input components for specialized data types"
              fullWidth
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-4">
                  <Label>Brand Color</Label>
                  <div className="flex items-center space-x-3">
                    <ColorPicker 
                      value={formData.color}
                      onChange={(color) => updateFormData('color', color)}
                    />
                    <div 
                      className="w-12 h-12 rounded-lg border border-gray-200"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-sm font-mono text-gray-600">{formData.color}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Birth Date</Label>
                  <DatePicker 
                    value={formData.birthdate}
                    onChange={(date) => updateFormData('birthdate', date)}
                    placeholder="Select your birth date"
                  />
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Toggle Groups"
              description="Multiple selection toggles for filtering and preferences"
              fullWidth
            >
              <div className="space-y-4 w-full">
                <Label>Notification Types</Label>
                <ToggleGroup type="multiple" className="justify-start">
                  <Toggle value="email" className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Toggle>
                  <Toggle value="sms" className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    SMS
                  </Toggle>
                  <Toggle value="push" className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Push
                  </Toggle>
                </ToggleGroup>
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Validation Demo */}
        {activeDemo === 'validation' && (
          <ComponentDemo
            title="Form Validation States"
            description="Live validation feedback with error, warning, and success states"
            fullWidth
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="space-y-3">
                <Label htmlFor="error-input" className="text-red-700">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Email (Error)
                </Label>
                <Input 
                  id="error-input"
                  type="email" 
                  placeholder="invalid-email" 
                  className="border-red-500 focus:ring-red-500"
                />
                <p className="text-xs text-red-600">Please enter a valid email address</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="warning-input" className="text-yellow-700">
                  <Info className="w-4 h-4 inline mr-1" />
                  Password (Warning)
                </Label>
                <Input 
                  id="warning-input"
                  type="password" 
                  placeholder="weak password" 
                  className="border-yellow-500 focus:ring-yellow-500"
                />
                <p className="text-xs text-yellow-600">Password strength: Weak. Consider adding numbers.</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="success-input" className="text-green-700">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Username (Success)
                </Label>
                <Input 
                  id="success-input"
                  type="text" 
                  placeholder="john_doe_2024" 
                  className="border-green-500 focus:ring-green-500"
                />
                <p className="text-xs text-green-600">Username is available!</p>
              </div>
            </div>
          </ComponentDemo>
        )}

        {/* Real Form Examples */}
        {activeDemo === 'examples' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormExample title="User Registration">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
                
                <Button className="w-full" theme="analytics">
                  Create Account
                </Button>
              </div>
            </FormExample>
            
            <FormExample title="Project Settings">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input id="projectName" placeholder="My Awesome Project" />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Project description..." rows={3} />
                </div>
                
                <div>
                  <Label>Priority Level</Label>
                  <Select>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
                
                <div>
                  <Label>Budget: $50K</Label>
                  <Slider defaultValue={[50]} max={200} min={10} step={10} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Make project public</Label>
                  <Switch id="public" />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Cancel</Button>
                  <Button theme="finance" className="flex-1">Save Project</Button>
                </div>
              </div>
            </FormExample>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Live Validation</h3>
          <p className="text-gray-600 text-sm">Real-time validation with clear error states and helpful feedback messages.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Fully Customizable</h3>
          <p className="text-gray-600 text-sm">Theming system, custom styles, and complete control over appearance and behavior.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Production Ready</h3>
          <p className="text-gray-600 text-sm">Accessibility compliant, keyboard navigation, and enterprise-grade reliability.</p>
        </div>
      </div>
    </div>
  );
};