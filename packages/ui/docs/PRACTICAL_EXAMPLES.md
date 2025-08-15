# Practical Examples - @dainabase/ui v1.3.0

This guide provides practical, real-world examples of using the @dainabase/ui Design System in various scenarios.

## Table of Contents
- [Quick Start Examples](#quick-start-examples)
- [Form Examples](#form-examples)
- [Data Display Examples](#data-display-examples)
- [Dashboard Example](#dashboard-example)
- [E-commerce Example](#e-commerce-example)
- [Admin Panel Example](#admin-panel-example)
- [Performance Patterns](#performance-patterns)
- [Accessibility Patterns](#accessibility-patterns)

## Quick Start Examples

### Basic Setup with Theme

```tsx
// App.tsx
import React from 'react';
import { ThemeProvider, Button, Card, Input, Label } from '@dainabase/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen p-8">
        <Card className="max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to Dainabase UI</h1>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <Button className="w-full">Get Started</Button>
          </div>
        </Card>
      </div>
    </ThemeProvider>
  );
}
```

### Dark Mode Toggle

```tsx
import React from 'react';
import { ThemeProvider, Button, Icon } from '@dainabase/ui';
import { useTheme } from '@dainabase/ui/hooks';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} />
    </Button>
  );
}
```

## Form Examples

### Complete Login Form

```tsx
import React, { useState } from 'react';
import { 
  Card,
  Input,
  Label,
  Button,
  Checkbox,
  Alert,
  Separator
} from '@dainabase/ui';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Your login logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md p-6">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-gray-500">Enter your credentials to continue</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Checkbox id="remember">
            Remember me
          </Checkbox>
          <Button variant="link" className="text-sm">
            Forgot password?
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          loading={loading}
        >
          Sign In
        </Button>
      </form>
      
      <Separator className="my-6" />
      
      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Button variant="link" className="p-0">
          Sign up
        </Button>
      </div>
    </Card>
  );
}
```

### Multi-Step Form with Validation

```tsx
import React, { useState } from 'react';
import { 
  Card,
  Stepper,
  Button,
  Input,
  Label,
  Select,
  RadioGroup,
  DatePicker,
  Form
} from '@dainabase/ui';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  // Step 1
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  
  // Step 2
  company: z.string().optional(),
  role: z.string(),
  experience: z.string(),
  
  // Step 3
  startDate: z.date(),
  preferences: z.object({
    notifications: z.boolean(),
    newsletter: z.boolean()
  })
});

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm({
    resolver: zodResolver(schema)
  });
  
  const steps = [
    {
      title: 'Personal Info',
      fields: ['firstName', 'lastName', 'email']
    },
    {
      title: 'Professional',
      fields: ['company', 'role', 'experience']
    },
    {
      title: 'Preferences',
      fields: ['startDate', 'preferences']
    }
  ];
  
  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await form.trigger(fields);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };
  
  return (
    <Card className="max-w-2xl mx-auto p-8">
      <Stepper 
        steps={steps}
        currentStep={currentStep}
        className="mb-8"
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input {...form.register('firstName')} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input {...form.register('lastName')} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" {...form.register('email')} />
              </div>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Company (Optional)</Label>
                <Input {...form.register('company')} />
              </div>
              <div>
                <Label>Role</Label>
                <Select {...form.register('role')}>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Label>Experience</Label>
                <RadioGroup {...form.register('experience')}>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </RadioGroup>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Start Date</Label>
                <DatePicker {...form.register('startDate')} />
              </div>
              <div className="space-y-2">
                <Checkbox {...form.register('preferences.notifications')}>
                  Email notifications
                </Checkbox>
                <Checkbox {...form.register('preferences.newsletter')}>
                  Weekly newsletter
                </Checkbox>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit">
                Submit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
}
```

## Data Display Examples

### Advanced Data Table with Filters

```tsx
import React, { useState, useMemo } from 'react';
import { 
  DataGrid,
  Input,
  Select,
  Button,
  Badge,
  Card,
  DateRangePicker
} from '@dainabase/ui';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

function UserTable({ users }: { users: User[] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesDate = !dateRange || 
        (user.createdAt >= dateRange.from && user.createdAt <= dateRange.to);
      
      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });
  }, [users, search, roleFilter, statusFilter, dateRange]);
  
  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'active' ? 'success' : 
                  value === 'inactive' ? 'destructive' : 
                  'warning'}
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value: Date) => value.toLocaleDateString()
    },
    {
      key: 'actions',
      header: '',
      render: (_, user: User) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">Edit</Button>
          <Button size="sm" variant="ghost">Delete</Button>
        </div>
      )
    }
  ];
  
  return (
    <Card className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          
          <Select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </Select>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </Select>
          
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Filter by date"
          />
        </div>
      </div>
      
      <DataGrid
        data={filteredUsers}
        columns={columns}
        pagination
        pageSize={10}
        sortable
        selectable
        virtualized
      />
    </Card>
  );
}
```

## Dashboard Example

### Complete Analytics Dashboard

```tsx
import React, { Suspense, lazy } from 'react';
import { 
  Card,
  Skeleton,
  Badge,
  Button,
  Icon,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@dainabase/ui';

// Lazy load heavy components
const Chart = lazy(() => import('@dainabase/ui/lazy/chart').then(m => ({ default: m.Chart })));
const DataGrid = lazy(() => import('@dainabase/ui/lazy/data-grid').then(m => ({ default: m.DataGrid })));

function Dashboard() {
  const stats = [
    { label: 'Total Revenue', value: '$45,231', change: '+12.5%', trend: 'up' },
    { label: 'Active Users', value: '2,431', change: '+5.2%', trend: 'up' },
    { label: 'Conversion Rate', value: '3.4%', change: '-0.5%', trend: 'down' },
    { label: 'Avg Order Value', value: '$127', change: '+8.1%', trend: 'up' }
  ];
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <Button>
          <Icon name="download" className="mr-2" />
          Export Report
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <Badge 
                variant={stat.trend === 'up' ? 'success' : 'destructive'}
                className="ml-2"
              >
                {stat.change}
              </Badge>
            </div>
            <Progress 
              value={Math.random() * 100} 
              className="mt-4"
            />
          </Card>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <Suspense fallback={<Skeleton className="h-64" />}>
            <Chart
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Revenue',
                  data: [30000, 35000, 32000, 40000, 38000, 45000],
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }]
              }}
              height={250}
            />
          </Suspense>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
          <Suspense fallback={<Skeleton className="h-64" />}>
            <Chart
              type="doughnut"
              data={{
                labels: ['Direct', 'Organic', 'Social', 'Referral'],
                datasets: [{
                  data: [35, 30, 20, 15],
                  backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(251, 146, 60)',
                    'rgb(147, 51, 234)'
                  ]
                }]
              }}
              height={250}
            />
          </Suspense>
        </Card>
      </div>
      
      {/* Tabbed Content */}
      <Card className="p-6">
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent Orders</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
            <TabsTrigger value="products">Best Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-4">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <DataGrid
                data={[
                  { id: '#3210', customer: 'John Doe', amount: '$312', status: 'completed' },
                  { id: '#3209', customer: 'Jane Smith', amount: '$127', status: 'processing' },
                  { id: '#3208', customer: 'Bob Johnson', amount: '$89', status: 'completed' }
                ]}
                columns={[
                  { key: 'id', header: 'Order ID' },
                  { key: 'customer', header: 'Customer' },
                  { key: 'amount', header: 'Amount' },
                  { 
                    key: 'status', 
                    header: 'Status',
                    render: (value: string) => (
                      <Badge variant={value === 'completed' ? 'success' : 'warning'}>
                        {value}
                      </Badge>
                    )
                  }
                ]}
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            {/* Customer content */}
          </TabsContent>
          
          <TabsContent value="products" className="mt-4">
            {/* Products content */}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
```

## E-commerce Example

### Product Card Component

```tsx
import React from 'react';
import { 
  Card,
  Badge,
  Button,
  Icon,
  Rating
} from '@dainabase/ui';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
}

function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
        />
        {product.badge && (
          <Badge className="absolute top-2 left-2">
            {product.badge}
          </Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            -{discount}%
          </Badge>
        )}
        <Button 
          size="icon"
          variant="ghost"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="heart" />
        </Button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold truncate">{product.name}</h3>
        
        <div className="flex items-center gap-2 mt-2">
          <Rating value={product.rating} readonly size="sm" />
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <Button size="sm">
            <Icon name="shopping-cart" className="mr-2" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

## Performance Patterns

### Optimized Component Loading

```tsx
import React, { lazy, Suspense, useState, useTransition } from 'react';
import { Button, Skeleton, Tabs } from '@dainabase/ui';

// Lazy load heavy components
const DataGrid = lazy(() => import('@dainabase/ui/lazy/data-grid'));
const Chart = lazy(() => import('@dainabase/ui/lazy/chart'));
const Calendar = lazy(() => import('@dainabase/ui/lazy/calendar'));

function PerformantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();
  
  const handleTabChange = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };
  
  return (
    <div className={isPending ? 'opacity-50' : ''}>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <DataGrid {...dataGridProps} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <Chart {...chartProps} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <Calendar {...calendarProps} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Bundle Splitting Strategy

```tsx
// routes/index.tsx - Only load core components
import { Button, Card, Input } from '@dainabase/ui';

// routes/dashboard.tsx - Load data components when needed
const loadDataComponents = () => import('@dainabase/ui/lazy/data');

// routes/forms.tsx - Load form components when needed
const loadFormComponents = () => import('@dainabase/ui/lazy/forms');

// Component with progressive enhancement
function ProgressiveForm() {
  const [enhanced, setEnhanced] = useState(false);
  const [FormComponents, setFormComponents] = useState(null);
  
  useEffect(() => {
    // Load enhanced form components after initial render
    loadFormComponents().then(module => {
      setFormComponents(module);
      setEnhanced(true);
    });
  }, []);
  
  if (!enhanced) {
    // Basic HTML form as fallback
    return (
      <form>
        <input type="text" placeholder="Name" />
        <button type="submit">Submit</button>
      </form>
    );
  }
  
  // Enhanced form with full components
  const { Form, Input, DatePicker, Select } = FormComponents;
  return <Form>...</Form>;
}
```

## Accessibility Patterns

### Keyboard Navigation Example

```tsx
import React, { useRef, useEffect } from 'react';
import { Card, Button, Input } from '@dainabase/ui';
import { useFocusTrap, useKeyboardShortcuts } from '@dainabase/ui/hooks';

function AccessibleModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  // Trap focus within modal
  useFocusTrap(modalRef, isOpen);
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'Escape': onClose,
    'cmd+s': () => console.log('Save'),
    'cmd+enter': () => console.log('Submit')
  });
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <Card className="relative z-10 max-w-md p-6">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          Accessible Modal
        </h2>
        
        <div className="space-y-4">
          <Input
            aria-label="Email address"
            placeholder="Enter your email"
          />
          
          <div className="flex gap-2 justify-end">
            <Button
              ref={closeButtonRef}
              variant="outline"
              onClick={onClose}
            >
              Cancel (Esc)
            </Button>
            <Button>
              Submit (⌘+Enter)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### Screen Reader Announcements

```tsx
import React from 'react';
import { Alert, Toast, Progress } from '@dainabase/ui';
import { useAnnounce } from '@dainabase/ui/hooks';

function AccessibleNotifications() {
  const announce = useAnnounce();
  
  const handleSuccess = () => {
    announce('Operation completed successfully', 'polite');
  };
  
  const handleError = () => {
    announce('An error occurred. Please try again.', 'assertive');
  };
  
  return (
    <div>
      {/* Live region for dynamic updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        <Alert>Form saved successfully</Alert>
      </div>
      
      {/* Progress with ARIA */}
      <Progress
        value={75}
        aria-label="Upload progress"
        aria-valuenow={75}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      
      {/* Toast with role="alert" for immediate announcement */}
      <Toast role="alert">
        Critical system update available
      </Toast>
    </div>
  );
}
```

## Testing Patterns

### Component Testing Example

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@dainabase/ui';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
  
  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
    
    rerender(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

---

## Resources

- **Storybook**: Interactive component playground
- **API Docs**: Full component API reference
- **GitHub**: Source code and issues
- **Discord**: Community support

## Contributing

We welcome contributions! See our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © Dainabase