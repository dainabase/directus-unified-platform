---
id: quick-start
title: Quick Start
sidebar_position: 3
---

# Quick Start

Get up and running with Dainabase UI in less than 5 minutes. This guide will walk you through creating your first application with our component library.

## 🚀 Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ and npm/yarn installed
- A React application (Create React App, Next.js, Vite, etc.)
- Basic knowledge of React and TypeScript (optional but recommended)

## 📦 Step 1: Installation

Install Dainabase UI and its peer dependencies:

```bash
# Using npm
npm install @dainabase/ui @radix-ui/react-slot @radix-ui/react-primitive

# Using yarn
yarn add @dainabase/ui @radix-ui/react-slot @radix-ui/react-primitive

# Using pnpm
pnpm add @dainabase/ui @radix-ui/react-slot @radix-ui/react-primitive
```

## 🎨 Step 2: Import Styles

Add Dainabase UI styles to your application. In your main CSS file or root component:

```css
/* In your global.css or App.css */
@import '@dainabase/ui/dist/styles.css';
```

Or in your JavaScript entry point:

```tsx
// In App.tsx or index.tsx
import '@dainabase/ui/dist/styles.css';
```

## 🏗️ Step 3: Setup Provider

Wrap your application with the UIProvider for theming and configuration:

```tsx
// App.tsx
import React from 'react';
import { UIProvider } from '@dainabase/ui';

function App() {
  return (
    <UIProvider>
      {/* Your app content */}
    </UIProvider>
  );
}

export default App;
```

## ✨ Step 4: Use Components

Now you can start using Dainabase UI components in your application!

```tsx
import React from 'react';
import { Button, Card, Input, Label } from '@dainabase/ui';

function MyFirstComponent() {
  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to Dainabase UI</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter your name" />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        
        <Button className="w-full">
          Get Started
        </Button>
      </div>
    </Card>
  );
}
```

## 🎯 Complete Example

Here's a complete example of a simple login form using Dainabase UI:

```tsx
// LoginForm.tsx
import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  Checkbox,
  Alert,
  AlertDescription
} from '@dainabase/ui';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (email === 'demo@example.com' && password === 'password') {
        alert('Login successful!');
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:underline">
                Sign up
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

## 🛠️ Framework-Specific Setup

### Next.js (App Router)

```tsx
// app/layout.tsx
import '@dainabase/ui/dist/styles.css';
import { UIProvider } from '@dainabase/ui';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UIProvider>
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
```

### Vite

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@dainabase/ui/dist/styles.css';
import { UIProvider } from '@dainabase/ui';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);
```

### Create React App

```tsx
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@dainabase/ui/dist/styles.css';
import { UIProvider } from '@dainabase/ui';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);
```

## 🎨 Customization

### Theme Configuration

Customize the theme by passing configuration to UIProvider:

```tsx
<UIProvider
  theme={{
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
    },
    darkMode: 'auto', // 'light' | 'dark' | 'auto'
    fontFamily: 'Inter, sans-serif',
  }}
>
  {/* Your app */}
</UIProvider>
```

### Using with Tailwind CSS

If you're using Tailwind CSS, extend your configuration:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@dainabase/ui/dist/**/*.{js,mjs}'
  ],
  theme: {
    extend: {
      // Your custom theme
    },
  },
  plugins: [],
}
```

## 📚 Available Components

Here are some of the most commonly used components to get you started:

### Layout Components
- `Card` - Container for content
- `Container` - Responsive container
- `Grid` - Grid layout system

### Form Components
- `Button` - Interactive buttons
- `Input` - Text input fields
- `Select` - Dropdown selection
- `Checkbox` - Checkboxes
- `Radio` - Radio buttons
- `Switch` - Toggle switches
- `Form` - Form wrapper with validation

### Feedback Components
- `Alert` - Alert messages
- `Toast` - Toast notifications
- `Progress` - Progress indicators
- `Skeleton` - Loading placeholders

### Overlay Components
- `Dialog` - Modal dialogs
- `Popover` - Popovers
- `Tooltip` - Tooltips
- `Sheet` - Slide-out panels

## 🚀 Next Steps

Now that you have Dainabase UI set up, explore:

1. **[Component Documentation](/docs/components/button)** - Detailed docs for each component
2. **[Theming Guide](/docs/theming/design-tokens)** - Customize the look and feel
3. **[Best Practices](/docs/patterns/forms)** - Learn patterns and best practices
4. **[Examples](https://github.com/dainabase/directus-unified-platform/tree/main/examples)** - Check out example projects

## 💡 Tips

- **IntelliSense**: Dainabase UI is fully typed - hover over components for documentation
- **Tree Shaking**: Only import what you use to keep bundle size small
- **Accessibility**: All components are WCAG 2.1 AA compliant by default
- **Dark Mode**: Automatic dark mode support with the UIProvider

## 🐛 Troubleshooting

### Styles not loading?
Make sure you've imported the CSS file in your application root.

### TypeScript errors?
Install the latest TypeScript types:
```bash
npm install --save-dev @types/react @types/react-dom
```

### Components not rendering?
Ensure you've wrapped your app with `UIProvider`.

## 🤝 Need Help?

- 📖 Read the [full documentation](/docs/getting-started/introduction)
- 💬 Join our [Discord community](https://discord.gg/dainabase)
- 🐛 Report issues on [GitHub](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 Email us at support@dainabase.com

---

**Congratulations!** 🎉 You're now ready to build amazing applications with Dainabase UI. Happy coding!
