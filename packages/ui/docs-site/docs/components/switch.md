---
id: switch
title: Switch
sidebar_position: 16
---

import { Switch } from '@dainabase/ui';

# Switch

A toggle control for on/off states.

<div className="component-preview">
  <div className="flex items-center space-x-2">
    <Switch id="airplane-mode" />
    <label htmlFor="airplane-mode">Airplane Mode</label>
  </div>
</div>

## Features

- **Binary State**: Clear on/off indication
- **Accessible**: Full keyboard and screen reader support
- **Smooth Animations**: Fluid toggle transitions
- **Form Integration**: Works with native forms
- **TypeScript**: Complete type definitions
- **Customizable**: Size and color variants

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Switch } from '@dainabase/ui';

export function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label htmlFor="airplane-mode">
        Airplane Mode
      </label>
    </div>
  );
}
```

## Examples

### Basic Switch

```jsx live
function BasicSwitch() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="s1" />
        <label htmlFor="s1">Enable notifications</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="s2" defaultChecked />
        <label htmlFor="s2">Dark mode (on by default)</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="s3" disabled />
        <label htmlFor="s3" className="text-muted-foreground">
          Disabled switch
        </label>
      </div>
    </div>
  );
}
```

### Controlled Switch

```jsx live
function ControlledSwitch() {
  const [enabled, setEnabled] = React.useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="controlled" 
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <label htmlFor="controlled">
          {enabled ? "Enabled" : "Disabled"}
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        The switch is currently {enabled ? "ON" : "OFF"}
      </p>
      <button 
        onClick={() => setEnabled(!enabled)}
        className="px-3 py-1 border rounded"
      >
        Toggle programmatically
      </button>
    </div>
  );
}
```

### Settings Panel

```jsx live
function SettingsPanel() {
  const [settings, setSettings] = React.useState({
    notifications: true,
    marketing: false,
    analytics: true,
    performance: true,
    accessibility: false
  });
  
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="notifications" className="text-sm font-medium">
                Push Notifications
              </label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your account activity
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleChange('notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="marketing" className="text-sm font-medium">
                Marketing Emails
              </label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and offers
              </p>
            </div>
            <Switch
              id="marketing"
              checked={settings.marketing}
              onCheckedChange={(checked) => handleChange('marketing', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="analytics" className="text-sm font-medium">
                Usage Analytics
              </label>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.analytics}
              onCheckedChange={(checked) => handleChange('analytics', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Switch Sizes

```jsx live
function SwitchSizes() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center space-x-2">
        <Switch id="small" className="scale-75" />
        <label htmlFor="small">Small</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="medium" />
        <label htmlFor="medium">Medium</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="large" className="scale-125" />
        <label htmlFor="large">Large</label>
      </div>
    </div>
  );
}
```

### With Icons

```jsx live
function SwitchWithIcons() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [sound, setSound] = React.useState(true);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          {darkMode ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </div>
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          {sound ? <VolumeIcon className="h-4 w-4" /> : <VolumeMuteIcon className="h-4 w-4" />}
          <span>Sound {sound ? "On" : "Off"}</span>
        </div>
        <Switch
          checked={sound}
          onCheckedChange={setSound}
        />
      </div>
    </div>
  );
}
```

### Form Integration

```jsx live
function SwitchInForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = {
      newsletter: formData.get('newsletter') === 'on',
      terms: formData.get('terms') === 'on',
      privacy: formData.get('privacy') === 'on'
    };
    alert(JSON.stringify(values, null, 2));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="newsletter">Subscribe to newsletter</label>
          <Switch id="newsletter" name="newsletter" />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="terms">Accept terms and conditions</label>
          <Switch id="terms" name="terms" required />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="privacy">Accept privacy policy</label>
          <Switch id="privacy" name="privacy" required />
        </div>
      </div>
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
        Submit
      </button>
    </form>
  );
}
```

### Custom Styled Switch

```jsx live
function CustomStyledSwitch() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="green" 
          className="data-[state=checked]:bg-green-500"
        />
        <label htmlFor="green">Green when on</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="red" 
          className="data-[state=checked]:bg-red-500"
        />
        <label htmlFor="red">Red when on</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="purple" 
          className="data-[state=checked]:bg-purple-500"
        />
        <label htmlFor="purple">Purple when on</label>
      </div>
    </div>
  );
}
```

## API Reference

### Switch Props

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>checked</code></td>
        <td><code>boolean</code></td>
        <td><code>undefined</code></td>
        <td>Controlled checked state</td>
      </tr>
      <tr>
        <td><code>defaultChecked</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Default checked state for uncontrolled</td>
      </tr>
      <tr>
        <td><code>onCheckedChange</code></td>
        <td><code>(checked: boolean) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when state changes</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable the switch</td>
      </tr>
      <tr>
        <td><code>required</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Required for form submission</td>
      </tr>
      <tr>
        <td><code>name</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Name for form submission</td>
      </tr>
      <tr>
        <td><code>value</code></td>
        <td><code>string</code></td>
        <td><code>'on'</code></td>
        <td>Value when checked for forms</td>
      </tr>
      <tr>
        <td><code>id</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>ID for label association</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
    </tbody>
  </table>
</div>

## Accessibility

The Switch component follows WAI-ARIA guidelines:
- `role="switch"` for semantic meaning
- `aria-checked` reflects current state
- `aria-disabled` when disabled
- Space key toggles the switch
- Enter key also supported
- Focus indicators for keyboard navigation
- Screen reader announcements for state changes
- Proper label association

## Best Practices

### Do's ✅

- Use for binary on/off settings
- Provide clear labels describing the setting
- Show immediate effect when toggled
- Use appropriate colors (green for on)
- Group related switches together
- Consider mobile touch targets (44x44px)

### Don'ts ❌

- Don't use for multiple options (use Radio Group)
- Don't require confirmation for toggle
- Don't use for actions (use Button)
- Don't hide critical settings
- Don't use ambiguous labels
- Don't disable without explanation

## Use Cases

- **Settings**: Enable/disable features
- **Preferences**: User preferences toggles
- **Permissions**: Grant/revoke permissions
- **Modes**: Dark/light mode switching
- **Features**: Feature flags and toggles
- **Notifications**: Notification preferences
- **Privacy**: Privacy and tracking settings

## Comparison with Similar Components

| Component | Use Case | Example |
|-----------|----------|---------|
| **Switch** | Binary on/off settings | Dark mode toggle |
| **Checkbox** | Multiple selections or agreements | Terms acceptance |
| **Radio** | Single choice from options | Payment method |
| **Toggle** | Stateless action buttons | Bold text formatting |

## Related Components

- [Checkbox](/docs/components/checkbox) - For multiple selections
- [Radio Group](/docs/components/radio-group) - For single selection
- [Toggle](/docs/components/toggle) - For toggle buttons
- [Button](/docs/components/button) - For actions
