// 🧭 NAVIGATION SECTION - COMPLETE NAVIGATION COMPONENTS SHOWCASE
// Demonstrates Tabs, Breadcrumb, NavigationMenu, Stepper, and Pagination components

import React, { useState } from 'react';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Stepper,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '../components';
import { 
  Home,
  ChevronRight,
  FileText,
  Settings,
  Users,
  BarChart,
  Package,
  CreditCard,
  Bell,
  Mail,
  Calendar,
  Search,
  Globe,
  Zap,
  ShoppingCart,
  Heart,
  BookOpen,
  Database,
  Cloud,
  Shield
} from 'lucide-react';

// =================== HELPER COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-2">
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
      <div className="flex flex-col gap-4">
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

// =================== MAIN NAVIGATION SECTION ===================

export const NavigationSection = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePage, setActivePage] = useState(1);
  const [currentStep, setCurrentStep] = useState(2);
  const [activeDemo, setActiveDemo] = useState<string>('tabs');

  const steps = [
    { id: 1, title: 'Account', description: 'Create your account', icon: Users },
    { id: 2, title: 'Profile', description: 'Setup your profile', icon: FileText },
    { id: 3, title: 'Billing', description: 'Add payment method', icon: CreditCard },
    { id: 4, title: 'Confirm', description: 'Review and confirm', icon: Shield }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Navigation Components Showcase
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Professional navigation patterns including tabs, breadcrumbs, menus, steppers, 
          and pagination. Built for complex enterprise applications with accessibility in mind.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={Globe} value="5" label="Components" />
          <StatCard icon={Zap} value="100%" label="Accessible" />
          <StatCard icon={Shield} value="WCAG" label="Compliant" />
          <StatCard icon={Heart} value="A11Y" label="Ready" />
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {[
          { id: 'tabs', label: 'Tabs', icon: FileText },
          { id: 'breadcrumb', label: 'Breadcrumb', icon: ChevronRight },
          { id: 'menu', label: 'Navigation Menu', icon: Globe },
          { id: 'stepper', label: 'Stepper', icon: Zap },
          { id: 'pagination', label: 'Pagination', icon: BookOpen }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveDemo(id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeDemo === id
                ? 'bg-indigo-600 text-white shadow-lg'
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
        
        {/* Tabs Demo */}
        {activeDemo === 'tabs' && (
          <>
            <ComponentDemo
              title="Modern Tab Navigation"
              description="Flexible tab system with icons, badges, and different styles"
              code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Content</TabsContent>
</Tabs>`}
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Reports
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Dashboard Overview</h4>
                  <p className="text-gray-600">Welcome to your dashboard. Here you can view all your important metrics and KPIs at a glance.</p>
                </TabsContent>
                <TabsContent value="analytics" className="mt-4 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics Dashboard</h4>
                  <p className="text-gray-600">Deep dive into your data with advanced analytics and custom reports.</p>
                </TabsContent>
                <TabsContent value="reports" className="mt-4 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Reports Center</h4>
                  <p className="text-gray-600">Generate and download comprehensive reports for your team.</p>
                </TabsContent>
                <TabsContent value="settings" className="mt-4 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Settings & Configuration</h4>
                  <p className="text-gray-600">Customize your dashboard experience and manage preferences.</p>
                </TabsContent>
              </Tabs>
            </ComponentDemo>

            <ComponentDemo
              title="Vertical Tabs Layout"
              description="Side navigation tabs for complex interfaces"
            >
              <div className="flex gap-4">
                <Tabs defaultValue="profile" orientation="vertical" className="flex gap-4">
                  <TabsList className="flex-col h-fit">
                    <TabsTrigger value="profile" className="w-full justify-start">Profile</TabsTrigger>
                    <TabsTrigger value="security" className="w-full justify-start">Security</TabsTrigger>
                    <TabsTrigger value="notifications" className="w-full justify-start">Notifications</TabsTrigger>
                    <TabsTrigger value="billing" className="w-full justify-start">Billing</TabsTrigger>
                  </TabsList>
                  <div className="flex-1">
                    <TabsContent value="profile" className="p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Profile Settings</h4>
                      <p className="text-gray-600">Manage your personal information and preferences.</p>
                    </TabsContent>
                    <TabsContent value="security" className="p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Security Settings</h4>
                      <p className="text-gray-600">Configure two-factor authentication and password policies.</p>
                    </TabsContent>
                    <TabsContent value="notifications" className="p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Notification Preferences</h4>
                      <p className="text-gray-600">Choose how and when you receive notifications.</p>
                    </TabsContent>
                    <TabsContent value="billing" className="p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Billing Information</h4>
                      <p className="text-gray-600">Manage payment methods and view invoices.</p>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Breadcrumb Demo */}
        {activeDemo === 'breadcrumb' && (
          <>
            <ComponentDemo
              title="Breadcrumb Navigation"
              description="Hierarchical navigation showing the current page location"
              code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink>Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Products</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Electronics</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Smartphones</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>/</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Analytics</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>/</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Revenue Report</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Documentation</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>→</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">API Reference</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>→</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Authentication</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>→</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>OAuth 2.0</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </ComponentDemo>
          </>
        )}

        {/* Navigation Menu Demo */}
        {activeDemo === 'menu' && (
          <ComponentDemo
            title="Navigation Menu"
            description="Dropdown navigation menu with rich content support"
            code={`<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Analytics</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
          >
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Products
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-500 to-purple-600 p-6 no-underline outline-none focus:shadow-md"
                            href="#"
                          >
                            <Package className="h-6 w-6 text-white" />
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              Product Suite
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Explore our comprehensive product offerings designed for enterprise scale.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100">
                            <div className="text-sm font-medium leading-none">Analytics Platform</div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              Real-time business intelligence and data visualization
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100">
                            <div className="text-sm font-medium leading-none">Cloud Infrastructure</div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              Scalable and secure cloud solutions
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100">
                            <div className="text-sm font-medium leading-none">Security Suite</div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              Enterprise-grade security and compliance
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {[
                        { title: "Enterprise", description: "Complete solutions for large organizations", icon: Shield },
                        { title: "Startups", description: "Agile tools for growing companies", icon: Zap },
                        { title: "Government", description: "Secure and compliant solutions", icon: Database },
                        { title: "Education", description: "Tools for educational institutions", icon: BookOpen },
                        { title: "Healthcare", description: "HIPAA-compliant platforms", icon: Heart },
                        { title: "Finance", description: "Banking and fintech solutions", icon: CreditCard }
                      ].map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100">
                              <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-indigo-600" />
                                <div className="text-sm font-medium leading-none">{item.title}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-600 mt-2">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    <FileText className="w-4 h-4 mr-2" />
                    Documentation
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </ComponentDemo>
        )}

        {/* Stepper Demo */}
        {activeDemo === 'stepper' && (
          <ComponentDemo
            title="Step-by-Step Navigation"
            description="Multi-step forms and wizards with progress indication"
            code={`<Stepper currentStep={2}>
  <Step title="Account" description="Create your account" />
  <Step title="Profile" description="Setup your profile" />
  <Step title="Complete" description="You're all set!" />
</Stepper>`}
          >
            <div className="w-full">
              <div className="flex justify-between mb-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                            isActive
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : isCompleted
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-white border-gray-300 text-gray-500'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-sm font-semibold ${isActive ? 'text-indigo-600' : 'text-gray-900'}`}>
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-500">{step.description}</div>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-4 ${
                            step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={currentStep === 1}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  disabled={currentStep === steps.length}
                >
                  {currentStep === steps.length ? 'Complete' : 'Next'}
                </button>
              </div>
            </div>
          </ComponentDemo>
        )}

        {/* Pagination Demo */}
        {activeDemo === 'pagination' && (
          <>
            <ComponentDemo
              title="Pagination Controls"
              description="Navigate through large datasets with flexible pagination"
              code={`<Pagination>
  <PaginationContent>
    <PaginationPrevious />
    <PaginationItem>
      <PaginationLink>1</PaginationLink>
    </PaginationItem>
    <PaginationNext />
  </PaginationContent>
</Pagination>`}
            >
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => setActivePage(Math.max(1, activePage - 1))} />
                  </PaginationItem>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#"
                        isActive={page === activePage}
                        onClick={() => setActivePage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">20</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" onClick={() => setActivePage(Math.min(20, activePage + 1))} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(activePage - 1) * 10 + 1} to {Math.min(activePage * 10, 200)} of 200 results
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={() => setActivePage(Math.max(1, activePage - 1))}
                        className={activePage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <select 
                        value={activePage}
                        onChange={(e) => setActivePage(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((page) => (
                          <option key={page} value={page}>
                            Page {page}
                          </option>
                        ))}
                      </select>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={() => setActivePage(Math.min(20, activePage + 1))}
                        className={activePage === 20 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </ComponentDemo>
          </>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Enterprise Navigation</h3>
          <p className="text-gray-600 text-sm">Complete navigation system for complex applications with multi-level hierarchies.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
          <p className="text-gray-600 text-sm">Full keyboard support with arrow keys, tab navigation, and shortcuts.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Accessibility First</h3>
          <p className="text-gray-600 text-sm">WCAG 2.1 AA compliant with proper ARIA labels and screen reader support.</p>
        </div>
      </div>
    </div>
  );
};