---
id: checkbox
title: Checkbox
sidebar_position: 14
---

import { Checkbox } from '@dainabase/ui';

# Checkbox

A control that allows the user to toggle between checked and not checked.

<div className="component-preview">
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <label htmlFor="terms">Accept terms and conditions</label>
  </div>
</div>

## Features

- **Accessible**: Full keyboard support and ARIA attributes
- **Indeterminate State**: Support for partial selection
- **Form Integration**: Works with React Hook Form and native forms
- **Customizable**: Extensive styling and animation options
- **TypeScript**: Complete type definitions
- **Controlled & Uncontrolled**: Flexible state management

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Checkbox } from '@dainabase/ui';

export function CheckboxDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label htmlFor="terms">
        Accept terms and conditions
      </label>
    </div>
  );
}
```

## Examples

### Basic Checkbox

```jsx live
function BasicCheckbox() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" />
        <label htmlFor="option1">Option 1</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" defaultChecked />
        <label htmlFor="option2">Option 2 (default checked)</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" disabled />
        <label htmlFor="option3" className="text-muted-foreground">
          Option 3 (disabled)
        </label>
      </div>
    </div>
  );
}
```

### Controlled Checkbox

```jsx live
function ControlledCheckbox() {
  const [checked, setChecked] = React.useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="controlled" 
          checked={checked}
          onCheckedChange={setChecked}
        />
        <label htmlFor="controlled">
          Controlled checkbox
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        State: {checked ? "Checked" : "Unchecked"}
      </p>
      <button 
        onClick={() => setChecked(!checked)}
        className="px-3 py-1 border rounded"
      >
        Toggle
      </button>
    </div>
  );
}
```

### Indeterminate State

```jsx live
function IndeterminateCheckbox() {
  const [checkedItems, setCheckedItems] = React.useState([false, false, false]);
  
  const allChecked = checkedItems.every(Boolean);
  const someChecked = checkedItems.some(Boolean);
  const parentChecked = allChecked ? true : someChecked ? "indeterminate" : false;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="parent"
          checked={parentChecked}
          onCheckedChange={(checked) => {
            setCheckedItems([checked, checked, checked]);
          }}
        />
        <label htmlFor="parent" className="font-medium">
          Select All
        </label>
      </div>
      <div className="ml-6 space-y-2">
        {["Item 1", "Item 2", "Item 3"].map((item, index) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={item}
              checked={checkedItems[index]}
              onCheckedChange={(checked) => {
                const newItems = [...checkedItems];
                newItems[index] = checked;
                setCheckedItems(newItems);
              }}
            />
            <label htmlFor={item}>{item}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Checkbox Group

```jsx live
function CheckboxGroup() {
  const [selected, setSelected] = React.useState([]);
  
  const options = [
    { id: "react", label: "React" },
    { id: "vue", label: "Vue" },
    { id: "angular", label: "Angular" },
    { id: "svelte", label: "Svelte" },
  ];
  
  const handleChange = (id, checked) => {
    setSelected(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(item => item !== id)
    );
  };
  
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium mb-3">
          Select your favorite frameworks
        </legend>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={selected.includes(option.id)}
                onCheckedChange={(checked) => handleChange(option.id, checked)}
              />
              <label htmlFor={option.id}>{option.label}</label>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="text-sm text-muted-foreground">
        Selected: {selected.length > 0 ? selected.join(", ") : "None"}
      </div>
    </div>
  );
}
```

### With Form

```jsx live
function CheckboxInForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData);
    alert(JSON.stringify(values, null, 2));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="newsletter" name="newsletter" value="yes" />
          <label htmlFor="newsletter">
            Subscribe to newsletter
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" name="terms" value="accepted" required />
          <label htmlFor="terms">
            I agree to the terms and conditions *
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="marketing" name="marketing" value="yes" />
          <label htmlFor="marketing">
            Receive marketing emails
          </label>
        </div>
      </div>
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
        Submit
      </button>
    </form>
  );
}
```

### Custom Styled Checkbox

```jsx live
function CustomStyledCheckbox() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="custom1" 
          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
        />
        <label htmlFor="custom1">Green when checked</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="custom2" 
          className="rounded-full"
        />
        <label htmlFor="custom2">Rounded checkbox</label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="custom3" 
          className="h-6 w-6"
        />
        <label htmlFor="custom3">Large checkbox</label>
      </div>
    </div>
  );
}
```

## API Reference

### Checkbox Props

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
        <td><code>boolean | 'indeterminate'</code></td>
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
        <td><code>(checked: boolean | 'indeterminate') => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when state changes</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable the checkbox</td>
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
        <td>Value for form submission</td>
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

The Checkbox component follows WAI-ARIA guidelines:
- `role="checkbox"` with proper ARIA attributes
- `aria-checked` reflects the current state
- `aria-disabled` when disabled
- Space key toggles the checkbox
- Proper label association with `htmlFor`
- Focus indicators and keyboard navigation
- Screen reader announcements

## Best Practices

### Do's ✅

- Always provide a label for context
- Use fieldset/legend for checkbox groups
- Indicate required fields clearly
- Test keyboard navigation
- Consider mobile touch targets (44x44px minimum)
- Use indeterminate state for partial selection

### Don'ts ❌

- Don't use checkboxes for binary settings (use Switch instead)
- Don't nest interactive elements inside labels
- Don't rely only on color to indicate state
- Don't make touch targets too small
- Don't forget form validation feedback

## Use Cases

- **Forms**: Multiple choice selections
- **Settings**: Toggle preferences and options
- **Lists**: Bulk actions and selections
- **Filters**: Multi-select filtering options
- **Terms**: Agreement and consent forms
- **Tables**: Row selection for batch operations

## Related Components

- [Switch](/docs/components/switch) - For on/off toggles
- [Radio Group](/docs/components/radio-group) - For single selection
- [Toggle](/docs/components/toggle) - For binary actions
- [Form](/docs/components/form) - For form integration
