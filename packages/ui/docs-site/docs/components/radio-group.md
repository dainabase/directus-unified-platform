---
id: radio-group
title: Radio Group
sidebar_position: 15
---

import { RadioGroup, RadioGroupItem } from '@dainabase/ui';

# Radio Group

A set of checkable buttons where only one can be selected.

<div className="component-preview">
  <RadioGroup defaultValue="option-1">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option-1" id="option-1" />
      <label htmlFor="option-1">Option 1</label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option-2" id="option-2" />
      <label htmlFor="option-2">Option 2</label>
    </div>
  </RadioGroup>
</div>

## Features

- **Single Selection**: Ensures only one option is selected
- **Keyboard Navigation**: Arrow keys for navigation
- **Form Ready**: Native form integration support
- **Accessible**: Full ARIA support and screen reader friendly
- **Customizable**: Flexible styling options
- **TypeScript**: Complete type definitions

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from '@dainabase/ui';

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <label htmlFor="option-1">Option 1</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <label htmlFor="option-2">Option 2</label>
      </div>
    </RadioGroup>
  );
}
```

## Examples

### Basic Radio Group

```jsx live
function BasicRadioGroup() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <label htmlFor="r1">Default</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <label htmlFor="r2">Comfortable</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <label htmlFor="r3">Compact</label>
      </div>
    </RadioGroup>
  );
}
```

### Controlled Radio Group

```jsx live
function ControlledRadioGroup() {
  const [value, setValue] = React.useState("option-1");
  
  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-1" id="option-1" />
          <label htmlFor="option-1">Option 1</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-2" id="option-2" />
          <label htmlFor="option-2">Option 2</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-3" id="option-3" />
          <label htmlFor="option-3">Option 3</label>
        </div>
      </RadioGroup>
      <p className="text-sm text-muted-foreground">
        Selected: {value}
      </p>
    </div>
  );
}
```

### Horizontal Layout

```jsx live
function HorizontalRadioGroup() {
  return (
    <RadioGroup defaultValue="card" className="flex flex-row gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="card" id="card" />
        <label htmlFor="card">Card</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paypal" id="paypal" />
        <label htmlFor="paypal">PayPal</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="apple" id="apple" />
        <label htmlFor="apple">Apple Pay</label>
      </div>
    </RadioGroup>
  );
}
```

### Radio Cards

```jsx live
function RadioCards() {
  const [selected, setSelected] = React.useState("standard");
  
  const plans = [
    {
      value: "free",
      title: "Free",
      description: "Basic features",
      price: "$0/mo"
    },
    {
      value: "standard",
      title: "Standard",
      description: "Most popular",
      price: "$10/mo"
    },
    {
      value: "premium",
      title: "Premium",
      description: "All features",
      price: "$20/mo"
    }
  ];
  
  return (
    <RadioGroup value={selected} onValueChange={setSelected}>
      <div className="grid gap-3">
        {plans.map((plan) => (
          <label
            key={plan.value}
            htmlFor={plan.value}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent ${
              selected === plan.value ? "border-primary bg-accent" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value={plan.value} id={plan.value} />
              <div>
                <div className="font-medium">{plan.title}</div>
                <div className="text-sm text-muted-foreground">
                  {plan.description}
                </div>
              </div>
            </div>
            <div className="font-bold">{plan.price}</div>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
}
```

### With Icons

```jsx live
function RadioGroupWithIcons() {
  return (
    <RadioGroup defaultValue="email">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="email" id="email" />
          <label htmlFor="email" className="flex items-center gap-2">
            <MailIcon className="h-4 w-4" />
            Email notifications
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sms" id="sms" />
          <label htmlFor="sms" className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4" />
            SMS notifications
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="push" id="push" />
          <label htmlFor="push" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Push notifications
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="none" />
          <label htmlFor="none" className="flex items-center gap-2">
            <XIcon className="h-4 w-4" />
            No notifications
          </label>
        </div>
      </div>
    </RadioGroup>
  );
}
```

### Disabled Options

```jsx live
function DisabledRadioOptions() {
  return (
    <RadioGroup defaultValue="option-2">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-1" id="d1" />
          <label htmlFor="d1">Available option</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-2" id="d2" />
          <label htmlFor="d2">Selected option</label>
        </div>
        <div className="flex items-center space-x-2 opacity-50">
          <RadioGroupItem value="option-3" id="d3" disabled />
          <label htmlFor="d3" className="cursor-not-allowed">
            Disabled option
          </label>
        </div>
        <div className="flex items-center space-x-2 opacity-50">
          <RadioGroupItem value="option-4" id="d4" disabled />
          <label htmlFor="d4" className="cursor-not-allowed">
            Another disabled option
          </label>
        </div>
      </div>
    </RadioGroup>
  );
}
```

### Form Integration

```jsx live
function RadioGroupInForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    alert(`Selected size: ${formData.get('size')}`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium mb-3">Choose your size</legend>
        <RadioGroup name="size" defaultValue="medium" required>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <label htmlFor="small">Small (S)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <label htmlFor="medium">Medium (M)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <label htmlFor="large">Large (L)</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="xlarge" id="xlarge" />
              <label htmlFor="xlarge">Extra Large (XL)</label>
            </div>
          </div>
        </RadioGroup>
      </fieldset>
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
        Submit
      </button>
    </form>
  );
}
```

## API Reference

### RadioGroup Props

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
        <td><code>value</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Controlled selected value</td>
      </tr>
      <tr>
        <td><code>defaultValue</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Default value for uncontrolled</td>
      </tr>
      <tr>
        <td><code>onValueChange</code></td>
        <td><code>(value: string) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when selection changes</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable all radio items</td>
      </tr>
      <tr>
        <td><code>name</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Name for form submission</td>
      </tr>
      <tr>
        <td><code>required</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Required for form submission</td>
      </tr>
      <tr>
        <td><code>orientation</code></td>
        <td><code>'horizontal' | 'vertical'</code></td>
        <td><code>'vertical'</code></td>
        <td>Layout orientation</td>
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

### RadioGroupItem Props

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
        <td><code>value</code></td>
        <td><code>string</code></td>
        <td>Required</td>
        <td>The value of this radio item</td>
      </tr>
      <tr>
        <td><code>id</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>ID for label association</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable this specific item</td>
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

The Radio Group component follows WAI-ARIA guidelines:
- `role="radiogroup"` on the container
- `role="radio"` on each item
- Arrow keys navigate between options
- Space/Enter selects an option
- `aria-checked` indicates selection
- `aria-disabled` for disabled items
- Proper label association
- Tab key moves focus in/out of group

## Best Practices

### Do's ✅

- Always provide labels for each option
- Use fieldset/legend for semantic grouping
- Set a default value when appropriate
- Keep options concise and clear
- Test keyboard navigation
- Consider touch target size (44x44px)

### Don'ts ❌

- Don't use for multi-selection (use Checkbox instead)
- Don't have too many options (>7)
- Don't nest interactive elements in labels
- Don't change options dynamically
- Don't use for on/off toggles (use Switch)

## Use Cases

- **Forms**: Single choice questions
- **Settings**: Preference selection
- **Filters**: Mutually exclusive filters
- **Payment**: Payment method selection
- **Surveys**: Multiple choice questions
- **Configuration**: Mode or variant selection

## Related Components

- [Checkbox](/docs/components/checkbox) - For multiple selections
- [Switch](/docs/components/switch) - For on/off toggles
- [Select](/docs/components/select) - For dropdown selections
- [Toggle Group](/docs/components/toggle-group) - For toggle button groups
