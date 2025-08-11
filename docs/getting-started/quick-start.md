# Quick Start Guide

Get up and running with Directus UI in 5 minutes!

## 🚀 Quick Setup

### Step 1: Create Your React App

Choose your preferred setup method:

#### Using Vite (Recommended)

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

#### Using Next.js

```bash
npx create-next-app@latest my-app --typescript
cd my-app
```

#### Using Create React App

```bash
npx create-react-app my-app --template typescript
cd my-app
```

### Step 2: Install Directus UI

```bash
npm install @directus/ui
```

### Step 3: Import Styles

Add to your main file (`App.tsx`, `_app.tsx`, or `main.tsx`):

```tsx
import '@directus/ui/dist/styles.css';
```

### Step 4: Start Using Components

```tsx
import { Button, Card, Alert, Badge } from '@directus/ui';

function App() {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to Directus UI
        </h1>
        
        <Alert variant="success" className="mb-4">
          <Badge variant="success" className="mr-2">NEW</Badge>
          Setup completed successfully!
        </Alert>
        
        <div className="flex gap-2">
          <Button variant="primary">
            Get Started
          </Button>
          <Button variant="outline">
            Learn More
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default App;
```

### Step 5: Run Your App

```bash
npm run dev
```

That's it! You're now using Directus UI components! 🎉

## 📚 Complete Example

Here's a complete example showcasing multiple components:

```tsx
import React, { useState } from 'react';
import {
  UIProvider,
  Button,
  Card,
  Alert,
  Input,
  Label,
  Select,
  Switch,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Toast,
  useToast,
} from '@directus/ui';
import '@directus/ui/dist/styles.css';

function QuickStartDemo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Success!',
      description: 'Your settings have been saved.',
      variant: 'success',
    });
  };

  return (
    <UIProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-gray-600">Total Users</div>
              <Badge variant="success" className="mt-2">
                +12% this month
              </Badge>
            </Card>
            <Card>
              <div className="text-2xl font-bold">567</div>
              <div className="text-gray-600">Active Projects</div>
              <Badge variant="primary" className="mt-2">
                23 new
              </Badge>
            </Card>
            <Card>
              <div className="text-2xl font-bold">89%</div>
              <div className="text-gray-600">Success Rate</div>
              <Badge variant="outline" className="mt-2">
                Above target
              </Badge>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={role}
                      onValueChange={setRole}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                      <Label htmlFor="notifications">
                        Enable notifications
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Profile Preview</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <p><strong>Name:</strong> {name || 'Not set'}</p>
                          <p><strong>Email:</strong> {email || 'Not set'}</p>
                          <p><strong>Role:</strong> {role}</p>
                          <p><strong>Notifications:</strong> {notifications ? 'Enabled' : 'Disabled'}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="settings">
                <Alert variant="info">
                  Settings panel - Configure your application preferences here.
                </Alert>
              </TabsContent>

              <TabsContent value="notifications">
                <Alert variant="warning">
                  Notification preferences - Manage how you receive updates.
                </Alert>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <Toast />
      </div>
    </UIProvider>
  );
}

export default QuickStartDemo;
```

## 🎨 Basic Styling

### Using Tailwind CSS

Directus UI works great with Tailwind CSS:

```tsx
<Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  <p className="text-gray-600">Card content goes here</p>
</Card>
```

### Using CSS Modules

```css
/* styles.module.css */
.customCard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  color: white;
}
```

```tsx
import styles from './styles.module.css';

<Card className={styles.customCard}>
  Custom styled card
</Card>
```

## 🔌 Essential Hooks

### useToast

```tsx
import { useToast } from '@directus/ui';

function MyComponent() {
  const { toast } = useToast();
  
  const showNotification = () => {
    toast({
      title: "Action completed",
      description: "Your changes have been saved",
      variant: "success",
    });
  };
  
  return <Button onClick={showNotification}>Show Toast</Button>;
}
```

### useTheme

```tsx
import { useTheme } from '@directus/ui';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </Button>
  );
}
```

## 📱 Responsive Design

All components are mobile-first and responsive:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Mobile: Full Width</Card>
  <Card>Tablet: Half Width</Card>
  <Card>Desktop: Third Width</Card>
</div>
```

## ⚡ Performance Tips

### 1. Lazy Load Heavy Components

```tsx
import { lazy, Suspense } from 'react';

const DataGrid = lazy(() => 
  import('@directus/ui').then(mod => ({ default: mod.DataGrid }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading grid...</div>}>
      <DataGrid data={data} />
    </Suspense>
  );
}
```

### 2. Use Production Build

```bash
# Always use production build for deployment
npm run build
```

### 3. Import Only What You Need

```tsx
// ✅ Good - Only imports what's needed
import { Button, Card } from '@directus/ui';

// ❌ Avoid - Imports entire library
import * as DirectusUI from '@directus/ui';
```

## 🎯 Next Steps

Now that you have the basics, explore:

1. **[Component Documentation](../components/README.md)** - Deep dive into each component
2. **[TypeScript Setup](./typescript-setup.md)** - Full TypeScript configuration
3. **[Theming Guide](../guides/theming.md)** - Customize the look and feel
4. **[Advanced Patterns](../guides/patterns.md)** - Best practices and patterns

## 💡 Pro Tips

1. **Use the UIProvider** for global configuration
2. **Enable TypeScript** for better IntelliSense
3. **Check bundle size** with `npm run build:analyze`
4. **Use Storybook** for component exploration: `npm run sb`
5. **Follow accessibility guidelines** for better UX

## 🆘 Need Help?

- 📖 [Full Documentation](../README.md)
- 💬 [Discord Community](https://discord.gg/directus)
- 🐛 [Report Issues](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 [Contact Support](mailto:support@directus.io)

---

<div align="center">

[← Installation](./installation.md) | [TypeScript Setup →](./typescript-setup.md)

</div>
