# TypeScript Setup Guide

## Overview

The Directus Unified Platform UI library is built with TypeScript from the ground up, providing complete type safety and excellent IDE support. This guide covers everything you need to know about using TypeScript with our components.

## Prerequisites

- TypeScript 4.5 or higher
- React 18.0 or higher
- Node.js 16+

## Installation

First, ensure TypeScript is installed in your project:

```bash
npm install --save-dev typescript @types/react @types/react-dom
```

## TypeScript Configuration

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "types": ["react", "react-dom"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

## Type Imports

All components export their TypeScript types. You can import them directly:

```typescript
import type { ButtonProps, ButtonVariant, ButtonSize } from '@dainabase/directus-ui';
import { Button } from '@dainabase/directus-ui';

// Using the types
const buttonProps: ButtonProps = {
  variant: 'primary' as ButtonVariant,
  size: 'md' as ButtonSize,
  onClick: () => console.log('Clicked'),
};
```

## Component Props Types

### Basic Example

```typescript
import React from 'react';
import { Card, CardProps } from '@dainabase/directus-ui';

interface MyCardProps extends CardProps {
  customProp?: string;
}

const MyCard: React.FC<MyCardProps> = ({ customProp, ...cardProps }) => {
  return (
    <Card {...cardProps}>
      {customProp && <p>{customProp}</p>}
      {cardProps.children}
    </Card>
  );
};
```

### Form Components with TypeScript

```typescript
import { useState } from 'react';
import { 
  Form, 
  Input, 
  Select,
  FormData,
  ValidationRules 
} from '@dainabase/directus-ui';

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user'
  });

  const validationRules: ValidationRules<UserFormData> = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    role: { required: true }
  };

  const handleSubmit = (data: UserFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form<UserFormData>
      data={formData}
      onSubmit={handleSubmit}
      validationRules={validationRules}
    >
      <Input
        name="name"
        label="Name"
        placeholder="Enter your name"
      />
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
      />
      <Select
        name="role"
        label="Role"
        options={[
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' }
        ]}
      />
    </Form>
  );
};
```

## Generic Components

Many components use generics for better type safety:

```typescript
import { DataGrid, DataGridColumn } from '@dainabase/directus-ui';

interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

const columns: DataGridColumn<Product>[] = [
  { field: 'id', header: 'ID', width: 80 },
  { field: 'name', header: 'Product Name' },
  { field: 'price', header: 'Price', format: (val) => `$${val.toFixed(2)}` },
  { field: 'inStock', header: 'In Stock', render: (val) => val ? '✅' : '❌' }
];

const ProductGrid: React.FC<{ products: Product[] }> = ({ products }) => {
  return (
    <DataGrid<Product>
      data={products}
      columns={columns}
      onRowClick={(product) => console.log('Selected:', product.name)}
    />
  );
};
```

## Event Handlers

All event handlers are properly typed:

```typescript
import { Button, Dialog, useToast } from '@dainabase/directus-ui';
import { MouseEvent, FormEvent } from 'react';

const MyComponent: React.FC = () => {
  const { showToast } = useToast();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    showToast({
      title: 'Button clicked',
      type: 'success'
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button onClick={handleClick}>Click Me</Button>
    </form>
  );
};
```

## Custom Hooks with TypeScript

```typescript
import { useState, useCallback } from 'react';
import { useTheme, Theme } from '@dainabase/directus-ui';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

// Using with components
const MyModal: React.FC = () => {
  const modal = useModal();
  const theme = useTheme();

  return (
    <>
      <Button onClick={modal.open}>Open Modal</Button>
      <Dialog open={modal.isOpen} onClose={modal.close}>
        <p>Modal content with {theme.mode} theme</p>
      </Dialog>
    </>
  );
};
```

## Utility Types

The library provides several utility types:

```typescript
import type {
  DeepPartial,
  DeepRequired,
  Nullable,
  ValueOf,
  ExtractProps
} from '@dainabase/directus-ui/types';

// DeepPartial - Makes all properties optional recursively
type PartialConfig = DeepPartial<AppConfig>;

// Nullable - Makes type nullable
type NullableUser = Nullable<User>;

// ExtractProps - Extracts props type from component
type ButtonPropsType = ExtractProps<typeof Button>;
```

## Strict Mode Considerations

When using React Strict Mode with TypeScript:

```typescript
import { StrictMode } from 'react';
import { UIProvider } from '@dainabase/directus-ui';

const App: React.FC = () => {
  return (
    <StrictMode>
      <UIProvider
        theme={{
          mode: 'light',
          primaryColor: '#3b82f6'
        }}
        locale="en"
        strictMode={true}
      >
        {/* Your app */}
      </UIProvider>
    </StrictMode>
  );
};
```

## Troubleshooting

### Common TypeScript Issues

1. **Module Resolution Issues**
   ```typescript
   // If you encounter module resolution issues
   // Add to tsconfig.json:
   "paths": {
     "@dainabase/directus-ui": ["node_modules/@dainabase/directus-ui/dist/index.d.ts"]
   }
   ```

2. **Missing Types**
   ```bash
   # Ensure all type packages are installed
   npm install --save-dev @types/react @types/react-dom
   ```

3. **Strict Null Checks**
   ```typescript
   // Handle potential null/undefined values
   const ref = useRef<HTMLDivElement>(null);
   
   useEffect(() => {
     if (ref.current) {
       // Safe to use ref.current
       ref.current.focus();
     }
   }, []);
   ```

## IDE Support

### VS Code Settings

Recommended `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

## Next Steps

- Review [Component Documentation](../components/) for specific type information
- Check [Patterns Guide](../guides/patterns.md) for TypeScript best practices
- Explore [Theming Guide](../guides/theming.md) for typed theme configuration

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [DefinitelyTyped](https://definitelytyped.org/)
