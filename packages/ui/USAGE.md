# 📚 @dainabase/ui Usage Guide

## 🚀 Getting Started

### Installation

```bash
npm install @dainabase/ui@1.3.0
```

### Basic Setup

```tsx
// App.tsx
import React from 'react';
import { UIProvider } from '@dainabase/ui';
import '@dainabase/ui/styles.css'; // Optional default styles

function App() {
  return (
    <UIProvider>
      {/* Your app content */}
    </UIProvider>
  );
}
```

## 💡 Component Examples

### Button Component

```tsx
import { Button } from '@dainabase/ui';

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button>
  <Icon name="plus" />
  Add Item
</Button>

// Loading state
<Button loading>Processing...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Input Component

```tsx
import { Input, Label } from '@dainabase/ui';

// Basic input
<Input placeholder="Enter text..." />

// With label
<>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</>

// With validation
<Input 
  type="email" 
  required 
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
/>

// Different types
<Input type="password" />
<Input type="number" min="0" max="100" />
<Input type="date" />
```

### Form with React Hook Form

```tsx
import { Form, Input, Button } from '@dainabase/ui';
import { useForm } from 'react-hook-form';

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Field>
        <Form.Label>Name</Form.Label>
        <Input {...register('name', { required: true })} />
        {errors.name && <Form.Error>Name is required</Form.Error>}
      </Form.Field>

      <Form.Field>
        <Form.Label>Email</Form.Label>
        <Input 
          type="email" 
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })} 
        />
        {errors.email && <Form.Error>{errors.email.message}</Form.Error>}
      </Form.Field>

      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

### Dialog Component

```tsx
import { Dialog, Button } from '@dainabase/ui';
import { useState } from 'react';

function DeleteConfirmDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone. This will permanently delete
            your item and remove it from our servers.
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => {
            // Delete logic here
            setOpen(false);
          }}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
```

### Card Component

```tsx
import { Card, Badge } from '@dainabase/ui';

<Card>
  <Card.Header>
    <Card.Title>
      Project Status
      <Badge variant="success">Active</Badge>
    </Card.Title>
    <Card.Description>
      Current project metrics and progress
    </Card.Description>
  </Card.Header>

  <Card.Content>
    <p>Project content goes here...</p>
  </Card.Content>

  <Card.Footer>
    <Button>View Details</Button>
  </Card.Footer>
</Card>
```

### Data Table

```tsx
import { Table } from '@dainabase/ui';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

<Table>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Email</Table.Head>
      <Table.Head>Role</Table.Head>
      <Table.Head>Actions</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {data.map((user) => (
      <Table.Row key={user.id}>
        <Table.Cell>{user.name}</Table.Cell>
        <Table.Cell>{user.email}</Table.Cell>
        <Table.Cell>
          <Badge>{user.role}</Badge>
        </Table.Cell>
        <Table.Cell>
          <Button size="sm" variant="ghost">Edit</Button>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

### Toast Notifications

```tsx
import { Toast, Button, useToast } from '@dainabase/ui';

function NotificationExample() {
  const { toast } = useToast();

  return (
    <>
      <Button onClick={() => {
        toast({
          title: 'Success!',
          description: 'Your changes have been saved.',
          variant: 'success',
        });
      }}>
        Show Success Toast
      </Button>

      <Button onClick={() => {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }}>
        Show Error Toast
      </Button>
    </>
  );
}
```

### Select Component

```tsx
import { Select } from '@dainabase/ui';

<Select defaultValue="option1">
  <Select.Trigger>
    <Select.Value placeholder="Select an option" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
    <Select.Item value="option3">Option 3</Select.Item>
  </Select.Content>
</Select>
```

### Date Picker

```tsx
import { DatePicker } from '@dainabase/ui';
import { useState } from 'react';

function DateExample() {
  const [date, setDate] = useState<Date>();

  return (
    <DatePicker
      selected={date}
      onSelect={setDate}
      placeholder="Pick a date"
    />
  );
}
```

### Command Palette

```tsx
import { CommandPalette } from '@dainabase/ui';

<CommandPalette>
  <CommandPalette.Input placeholder="Type a command or search..." />
  <CommandPalette.List>
    <CommandPalette.Empty>No results found.</CommandPalette.Empty>
    
    <CommandPalette.Group heading="Suggestions">
      <CommandPalette.Item onSelect={() => console.log('Calendar')}>
        <Icon name="calendar" />
        Calendar
      </CommandPalette.Item>
      <CommandPalette.Item onSelect={() => console.log('Search')}>
        <Icon name="search" />
        Search Emoji
      </CommandPalette.Item>
    </CommandPalette.Group>

    <CommandPalette.Group heading="Settings">
      <CommandPalette.Item onSelect={() => console.log('Profile')}>
        <Icon name="user" />
        Profile
      </CommandPalette.Item>
      <CommandPalette.Item onSelect={() => console.log('Settings')}>
        <Icon name="settings" />
        Settings
      </CommandPalette.Item>
    </CommandPalette.Group>
  </CommandPalette.List>
</CommandPalette>
```

## 🎨 Theming

### Custom Theme

```tsx
import { UIProvider } from '@dainabase/ui';

const customTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
    },
  },
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};

<UIProvider theme={customTheme}>
  <App />
</UIProvider>
```

### Dark Mode

```tsx
import { UIProvider, useTheme } from '@dainabase/ui';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}

// In your app
<UIProvider darkMode="auto"> {/* or 'light' | 'dark' */}
  <ThemeToggle />
</UIProvider>
```

## 📦 TypeScript Support

All components are fully typed. Import types directly:

```tsx
import type { 
  ButtonProps,
  InputProps,
  SelectProps,
  DialogProps,
  CardProps 
} from '@dainabase/ui';

// Custom component with UI props
interface MyButtonProps extends ButtonProps {
  customProp?: string;
}

function MyButton({ customProp, ...props }: MyButtonProps) {
  return <Button {...props} />;
}
```

## 🌍 Internationalization

```tsx
import { UIProvider } from '@dainabase/ui';
import { enUS, frFR, deDE, esES, itIT } from '@dainabase/ui/locales';

// Use built-in locales
<UIProvider locale={frFR}>
  <App />
</UIProvider>

// Or provide custom translations
const customLocale = {
  code: 'pt-BR',
  name: 'Português (Brasil)',
  translations: {
    'button.submit': 'Enviar',
    'dialog.close': 'Fechar',
    // ... more translations
  },
};

<UIProvider locale={customLocale}>
  <App />
</UIProvider>
```

## 🎯 Best Practices

### 1. Always wrap your app with UIProvider

```tsx
<UIProvider>
  <App />
</UIProvider>
```

### 2. Use semantic HTML

```tsx
// Good
<Button type="submit">Submit</Button>

// Also good - asChild pattern for custom elements
<Button asChild>
  <a href="/home">Go Home</a>
</Button>
```

### 3. Handle loading and error states

```tsx
function DataComponent() {
  const { data, loading, error } = useData();

  if (loading) return <Skeleton />;
  if (error) return <Alert variant="error">{error.message}</Alert>;

  return <DataGrid data={data} />;
}
```

### 4. Use proper ARIA attributes

```tsx
<Dialog>
  <Dialog.Trigger asChild>
    <Button aria-label="Open settings">
      <Icon name="settings" />
    </Button>
  </Dialog.Trigger>
  {/* ... */}
</Dialog>
```

### 5. Optimize bundle size with tree-shaking

```tsx
// ✅ Good - only imports what you need
import { Button, Card } from '@dainabase/ui';

// ❌ Avoid - imports everything
import * as UI from '@dainabase/ui';
```

## 🔗 Resources

- [NPM Package](https://www.npmjs.com/package/@dainabase/ui)
- [GitHub Repository](https://github.com/dainabase/directus-unified-platform)
- [Storybook](https://storybook.dainabase.dev)
- [Documentation](https://docs.dainabase.dev/ui)
- [Discord Community](https://discord.gg/dainabase)

## 📝 License

MIT © 2025 Dainabase
