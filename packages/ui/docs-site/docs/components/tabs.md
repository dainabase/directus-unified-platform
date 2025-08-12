---
id: tabs
title: Tabs
sidebar_position: 38
---

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dainabase/ui';

# Tabs

A set of layered sections of content (known as tab panels) that display one panel at a time.

## Preview

<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
    <TabsTrigger value="team">Team</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Manage your account settings here.</TabsContent>
  <TabsContent value="password">Change your password securely.</TabsContent>
  <TabsContent value="team">Manage team members and permissions.</TabsContent>
</Tabs>

## Features

- **Keyboard Navigation**: Full keyboard support with arrow keys navigation
- **ARIA Compliant**: Built with accessibility in mind following WAI-ARIA guidelines
- **Flexible Layout**: Support for horizontal and vertical orientations
- **Controlled & Uncontrolled**: Works in both controlled and uncontrolled modes
- **Customizable Styling**: Full control over appearance with className props
- **Lazy Loading**: Tab content can be lazy loaded for performance
- **Icon Support**: Easy integration with icons in tab triggers
- **Disabled States**: Individual tabs can be disabled
- **Animation Ready**: Built-in support for content transitions

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dainabase/ui';

export default function TabsDemo() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content for tab 1</TabsContent>
      <TabsContent value="tab2">Content for tab 2</TabsContent>
    </Tabs>
  );
}
```

## Examples

### Default Tabs

```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <div className="p-4">
      <h3>Overview</h3>
      <p>Welcome to your dashboard overview.</p>
    </div>
  </TabsContent>
  <TabsContent value="analytics">
    <div className="p-4">
      <h3>Analytics</h3>
      <p>View your analytics and metrics here.</p>
    </div>
  </TabsContent>
  <TabsContent value="reports">
    <div className="p-4">
      <h3>Reports</h3>
      <p>Generate and view reports.</p>
    </div>
  </TabsContent>
</Tabs>
```

### Controlled Tabs

```tsx
function ControlledTabs() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">Profile content</TabsContent>
      <TabsContent value="settings">Settings content</TabsContent>
      <TabsContent value="notifications">Notifications content</TabsContent>
    </Tabs>
  );
}
```

### Vertical Tabs

```tsx
<Tabs defaultValue="general" orientation="vertical" className="flex">
  <TabsList className="flex-col h-full">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
    <TabsTrigger value="privacy">Privacy</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
  <div className="flex-1">
    <TabsContent value="general">General settings</TabsContent>
    <TabsContent value="security">Security settings</TabsContent>
    <TabsContent value="privacy">Privacy settings</TabsContent>
    <TabsContent value="advanced">Advanced settings</TabsContent>
  </div>
</Tabs>
```

### Tabs with Icons

```tsx
import { User, Settings, Bell, Shield } from 'lucide-react';

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">
      <User className="w-4 h-4 mr-2" />
      Account
    </TabsTrigger>
    <TabsTrigger value="preferences">
      <Settings className="w-4 h-4 mr-2" />
      Preferences
    </TabsTrigger>
    <TabsTrigger value="notifications">
      <Bell className="w-4 h-4 mr-2" />
      Notifications
    </TabsTrigger>
    <TabsTrigger value="security">
      <Shield className="w-4 h-4 mr-2" />
      Security
    </TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="preferences">Preferences settings</TabsContent>
  <TabsContent value="notifications">Notification settings</TabsContent>
  <TabsContent value="security">Security settings</TabsContent>
</Tabs>
```

### Disabled Tabs

```tsx
<Tabs defaultValue="active">
  <TabsList>
    <TabsTrigger value="active">Active</TabsTrigger>
    <TabsTrigger value="disabled" disabled>
      Disabled
    </TabsTrigger>
    <TabsTrigger value="pending">Pending</TabsTrigger>
  </TabsList>
  <TabsContent value="active">This tab is active</TabsContent>
  <TabsContent value="disabled">This won't be shown</TabsContent>
  <TabsContent value="pending">This tab is pending</TabsContent>
</Tabs>
```

### Card Tabs

```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <Card>
    <TabsContent value="overview">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          View your account overview and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overview content */}
      </CardContent>
    </TabsContent>
    <TabsContent value="activity">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your recent account activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Activity content */}
      </CardContent>
    </TabsContent>
    <TabsContent value="settings">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Settings content */}
      </CardContent>
    </TabsContent>
  </Card>
</Tabs>
```

### Lazy Loading Content

```tsx
function LazyTabs() {
  const [loadedTabs, setLoadedTabs] = useState(new Set(['tab1']));

  const handleTabChange = (value: string) => {
    setLoadedTabs(prev => new Set(prev).add(value));
  };

  return (
    <Tabs defaultValue="tab1" onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div>Content 1 (loaded immediately)</div>
      </TabsContent>
      <TabsContent value="tab2">
        {loadedTabs.has('tab2') ? (
          <ExpensiveComponent />
        ) : (
          <div>Loading...</div>
        )}
      </TabsContent>
      <TabsContent value="tab3">
        {loadedTabs.has('tab3') ? (
          <AnotherExpensiveComponent />
        ) : (
          <div>Loading...</div>
        )}
      </TabsContent>
    </Tabs>
  );
}
```

### Form Tabs

```tsx
<Tabs defaultValue="personal">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="personal">Personal</TabsTrigger>
    <TabsTrigger value="address">Address</TabsTrigger>
    <TabsTrigger value="payment">Payment</TabsTrigger>
    <TabsTrigger value="review">Review</TabsTrigger>
  </TabsList>
  
  <TabsContent value="personal">
    <Form>
      <FormField name="firstName" label="First Name">
        <Input placeholder="John" />
      </FormField>
      <FormField name="lastName" label="Last Name">
        <Input placeholder="Doe" />
      </FormField>
      <FormField name="email" label="Email">
        <Input type="email" placeholder="john@example.com" />
      </FormField>
    </Form>
  </TabsContent>
  
  <TabsContent value="address">
    <Form>
      <FormField name="street" label="Street Address">
        <Input placeholder="123 Main St" />
      </FormField>
      <FormField name="city" label="City">
        <Input placeholder="New York" />
      </FormField>
      <FormField name="zip" label="ZIP Code">
        <Input placeholder="10001" />
      </FormField>
    </Form>
  </TabsContent>
  
  <TabsContent value="payment">
    <Form>
      <FormField name="cardNumber" label="Card Number">
        <Input placeholder="1234 5678 9012 3456" />
      </FormField>
      <FormField name="expiry" label="Expiry Date">
        <Input placeholder="MM/YY" />
      </FormField>
      <FormField name="cvv" label="CVV">
        <Input placeholder="123" />
      </FormField>
    </Form>
  </TabsContent>
  
  <TabsContent value="review">
    <div className="space-y-4">
      <h3>Review Your Information</h3>
      <p>Please review all information before submitting.</p>
      <Button type="submit">Submit Application</Button>
    </div>
  </TabsContent>
</Tabs>
```

## API Reference

### Tabs

The root component that provides context for all tab components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The controlled value of the active tab |
| `defaultValue` | `string` | - | The default active tab value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | - | Callback when the active tab changes |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the tabs |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The tab components |

### TabsList

Container for the tab triggers.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | TabsTrigger components |

### TabsTrigger

Individual tab button that activates a tab panel.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Unique value for this tab |
| `disabled` | `boolean` | `false` | Whether the tab is disabled |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Tab label content |

### TabsContent

Container for the content of each tab panel.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Value matching a TabsTrigger |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Tab panel content |
| `forceMount` | `boolean` | `false` | Force mount even when inactive |

## Accessibility

The Tabs component follows WAI-ARIA guidelines for tabs pattern:

- **Role Management**: Proper ARIA roles (`tablist`, `tab`, `tabpanel`)
- **Keyboard Navigation**:
  - `Tab`: Move focus to the next focusable element
  - `Arrow Left/Up`: Move to previous tab (horizontal/vertical)
  - `Arrow Right/Down`: Move to next tab (horizontal/vertical)
  - `Home`: Move to first tab
  - `End`: Move to last tab
  - `Enter/Space`: Activate focused tab
- **ARIA Attributes**: Proper use of `aria-selected`, `aria-controls`, `aria-labelledby`
- **Focus Management**: Automatic focus management and roving tabindex

## Best Practices

### Do's ✅

- Use clear, concise labels for tabs
- Group related content logically
- Provide visual feedback for active state
- Consider mobile responsiveness with scrollable tabs
- Use icons to enhance recognition
- Implement lazy loading for heavy content

### Don'ts ❌

- Don't use too many tabs (consider alternative navigation for 7+ tabs)
- Don't nest tabs within tabs
- Don't use tabs for sequential forms (use steppers instead)
- Don't hide critical information in inactive tabs
- Don't change tab structure dynamically without user action

## Use Cases

- **Settings Pages**: Organize different setting categories
- **User Profiles**: Separate profile sections (info, posts, media)
- **Product Details**: Show specifications, reviews, shipping info
- **Analytics Dashboards**: Different data views and time periods
- **Documentation**: Organize code examples by language/framework
- **Multi-step Forms**: Non-linear form sections
- **Content Filters**: Different views of the same dataset

## Related Components

- [Accordion](./accordion) - For collapsible content sections
- [Navigation Menu](./navigation-menu) - For site-wide navigation
- [Stepper](./stepper) - For sequential multi-step processes
- [Card](./card) - Often used with tabs for grouped content
- [Sheet](./sheet) - For mobile-friendly tab alternatives