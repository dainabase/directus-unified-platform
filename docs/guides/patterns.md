# Patterns Guide

## Overview

This guide presents common patterns and best practices for using the Directus Unified Platform UI library effectively in your applications.

## Component Composition Patterns

### Compound Components

```tsx
import { Card, Button, Badge } from '@dainabase/directus-ui';

// Compound Card component
const ProductCard = ({ product }) => (
  <Card className="product-card">
    <Card.Header>
      <Card.Title>{product.name}</Card.Title>
      <Badge variant={product.inStock ? 'success' : 'error'}>
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </Badge>
    </Card.Header>
    <Card.Content>
      <img src={product.image} alt={product.name} />
      <p>{product.description}</p>
    </Card.Content>
    <Card.Footer>
      <span className="price">${product.price}</span>
      <Button variant="primary" size="sm">
        Add to Cart
      </Button>
    </Card.Footer>
  </Card>
);
```

### Wrapper Components

```tsx
import { Dialog, Button } from '@dainabase/directus-ui';

// Reusable confirmation dialog
const ConfirmDialog = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => (
  <Dialog open={isOpen} onOpenChange={onCancel}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <p>{message}</p>
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>
);

// Usage
const MyComponent = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>Delete</Button>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        onConfirm={() => {
          // Delete logic
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
```

## Form Patterns

### Controlled Forms

```tsx
import { Form, Input, Select, Checkbox, Button } from '@dainabase/directus-ui';

const ControlledForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    newsletter: false,
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Submit logic here
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        required
      />
      
      <Select
        label="Role"
        value={formData.role}
        onChange={(value) => handleChange('role', value)}
        options={[
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
        ]}
      />
      
      <Checkbox
        label="Subscribe to newsletter"
        checked={formData.newsletter}
        onChange={(checked) => handleChange('newsletter', checked)}
      />
      
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </Form>
  );
};
```

### Multi-Step Forms

```tsx
import { Stepper, Form, Button } from '@dainabase/directus-ui';

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  
  const steps = [
    { label: 'Personal Info', component: PersonalInfoStep },
    { label: 'Account Details', component: AccountDetailsStep },
    { label: 'Preferences', component: PreferencesStep },
    { label: 'Review', component: ReviewStep },
  ];
  
  const handleNext = (stepData) => {
    setFormData({ ...formData, ...stepData });
    setCurrentStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleSubmit = () => {
    console.log('Final submission:', formData);
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <div>
      <Stepper
        steps={steps.map(s => s.label)}
        currentStep={currentStep}
      />
      
      <CurrentStepComponent
        data={formData}
        onNext={handleNext}
        onBack={handleBack}
        onSubmit={handleSubmit}
        isLastStep={currentStep === steps.length - 1}
      />
    </div>
  );
};
```

## Data Fetching Patterns

### Loading States

```tsx
import { useState, useEffect } from 'react';
import { DataGrid, Skeleton, Alert } from '@dainabase/directus-ui';

const DataFetchingComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="error">
        <Alert.Title>Error Loading Data</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }
  
  return <DataGrid data={data} columns={columns} />;
};
```

### Infinite Scrolling

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { DataGrid, Button } from '@dainabase/directus-ui';

const InfiniteScrollList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
  });
  
  const allItems = data?.pages.flatMap(page => page.items) ?? [];
  
  return (
    <>
      <DataGrid
        data={allItems}
        columns={columns}
        onScrollEnd={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
      />
      {isFetchingNextPage && <Skeleton className="h-20" />}
    </>
  );
};
```

## Modal and Dialog Patterns

### Modal Management

```tsx
import { createContext, useContext, useState } from 'react';
import { Dialog } from '@dainabase/directus-ui';

// Modal context
const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);
  
  const openModal = (modal) => {
    const id = Date.now();
    setModals(prev => [...prev, { ...modal, id }]);
    return id;
  };
  
  const closeModal = (id) => {
    setModals(prev => prev.filter(m => m.id !== id));
  };
  
  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modals.map(modal => (
        <Dialog
          key={modal.id}
          open={true}
          onOpenChange={() => closeModal(modal.id)}
        >
          <Dialog.Content>
            {modal.content}
          </Dialog.Content>
        </Dialog>
      ))}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
```

## Navigation Patterns

### Breadcrumb Navigation

```tsx
import { Breadcrumb } from '@dainabase/directus-ui';
import { useLocation } from 'react-router-dom';

const DynamicBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <Breadcrumb>
      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
      {pathnames.map((name, index) => {
        const href = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <Breadcrumb.Item
            key={href}
            href={isLast ? undefined : href}
            active={isLast}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};
```

### Tab Navigation with Router

```tsx
import { Tabs } from '@dainabase/directus-ui';
import { useNavigate, useLocation } from 'react-router-dom';

const RoutedTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { value: 'overview', label: 'Overview', path: '/dashboard/overview' },
    { value: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    { value: 'reports', label: 'Reports', path: '/dashboard/reports' },
  ];
  
  const currentTab = tabs.find(tab => tab.path === location.pathname)?.value;
  
  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => {
        const tab = tabs.find(t => t.value === value);
        if (tab) navigate(tab.path);
      }}
    >
      <Tabs.List>
        {tabs.map(tab => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      
      {tabs.map(tab => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {/* Tab content */}
        </Tabs.Content>
      ))}
    </Tabs>
  );
};
```

## State Management Patterns

### Global State with Context

```tsx
import { createContext, useContext, useReducer } from 'react';

// State
const initialState = {
  user: null,
  theme: 'light',
  notifications: [],
};

// Actions
const actions = {
  SET_USER: 'SET_USER',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
};

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_USER:
      return { ...state, user: action.payload };
    case actions.SET_THEME:
      return { ...state, theme: action.payload };
    case actions.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    case actions.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          n => n.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const value = {
    ...state,
    setUser: (user) => dispatch({ type: actions.SET_USER, payload: user }),
    setTheme: (theme) => dispatch({ type: actions.SET_THEME, payload: theme }),
    addNotification: (notification) => {
      const id = Date.now();
      dispatch({ 
        type: actions.ADD_NOTIFICATION, 
        payload: { ...notification, id } 
      });
      return id;
    },
    removeNotification: (id) => {
      dispatch({ type: actions.REMOVE_NOTIFICATION, payload: id });
    },
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## Error Handling Patterns

### Error Boundaries

```tsx
import { Component } from 'react';
import { Alert, Button } from '@dainabase/directus-ui';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="error" className="m-4">
          <Alert.Title>Something went wrong</Alert.Title>
          <Alert.Description>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Alert.Description>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </Alert>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

## Accessibility Patterns

### Keyboard Navigation

```tsx
import { useEffect, useRef } from 'react';
import { Button } from '@dainabase/directus-ui';

const KeyboardNavigableList = ({ items, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef([]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(items[focusedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          // Handle escape
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items, onSelect]);
  
  useEffect(() => {
    itemRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);
  
  return (
    <ul role="listbox" aria-label="Select an item">
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          tabIndex={index === focusedIndex ? 0 : -1}
          ref={el => itemRefs.current[index] = el}
          onClick={() => onSelect(item)}
          className={index === focusedIndex ? 'focused' : ''}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

## Testing Patterns

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@dainabase/directus-ui';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');
    
    expect(button).toBeDisabled();
  });
});
```

## Next Steps

- Review [Component Documentation](../components/) for specific component patterns
- Check [TypeScript Setup](../getting-started/typescript-setup.md) for type-safe patterns
- Explore [Optimization Guide](./optimization.md) for performance patterns
