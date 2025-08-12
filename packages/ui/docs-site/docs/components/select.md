---
id: select
title: Select
sidebar_position: 11
---

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel } from '@dainabase/ui';

# Select

A dropdown selection component that allows users to choose from a list of options. Built on top of Radix UI Select primitive.

<div className="component-preview">
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
      <SelectItem value="option3">Option 3</SelectItem>
    </SelectContent>
  </Select>
</div>

## Features

- **Accessible**: Full keyboard navigation and screen reader support
- **Searchable**: Optional type-ahead search functionality
- **Grouped Options**: Support for organizing options in groups
- **Custom Rendering**: Flexible option rendering with icons and descriptions
- **Controlled & Uncontrolled**: Works in both modes
- **Multiple Selection**: Support for multi-select mode
- **Async Loading**: Load options dynamically
- **Virtual Scrolling**: Handle large lists efficiently

## Installation

```bash
npm install @dainabase/ui @radix-ui/react-select
```

## Usage

```tsx
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@dainabase/ui';

export function BasicSelect() {
  return (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## Examples

### Basic Select

```jsx live
function BasicSelectExample() {
  return (
    <Select>
      <SelectTrigger className="w-[200px] p-2 border rounded">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">🍎 Apple</SelectItem>
        <SelectItem value="banana">🍌 Banana</SelectItem>
        <SelectItem value="orange">🍊 Orange</SelectItem>
        <SelectItem value="grape">🍇 Grape</SelectItem>
        <SelectItem value="strawberry">🍓 Strawberry</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Controlled Select

```jsx live
function ControlledSelectExample() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-[200px] p-2 border rounded">
          <SelectValue placeholder="Select a color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
          <SelectItem value="green">Green</SelectItem>
          <SelectItem value="yellow">Yellow</SelectItem>
          <SelectItem value="purple">Purple</SelectItem>
        </SelectContent>
      </Select>
      
      {value && (
        <p className="text-sm">
          Selected: <span className="font-semibold">{value}</span>
        </p>
      )}
    </div>
  );
}
```

### Grouped Options

```jsx live
function GroupedSelectExample() {
  return (
    <Select>
      <SelectTrigger className="w-[250px] p-2 border rounded">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="us">🇺🇸 United States</SelectItem>
          <SelectItem value="ca">🇨🇦 Canada</SelectItem>
          <SelectItem value="mx">🇲🇽 Mexico</SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
          <SelectItem value="fr">🇫🇷 France</SelectItem>
          <SelectItem value="de">🇩🇪 Germany</SelectItem>
          <SelectItem value="it">🇮🇹 Italy</SelectItem>
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="cn">🇨🇳 China</SelectItem>
          <SelectItem value="jp">🇯🇵 Japan</SelectItem>
          <SelectItem value="kr">🇰🇷 South Korea</SelectItem>
          <SelectItem value="in">🇮🇳 India</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

### Select with Icons and Descriptions

```jsx live
function RichSelectExample() {
  const plans = [
    {
      value: 'free',
      label: 'Free',
      icon: '🆓',
      description: 'For personal use'
    },
    {
      value: 'pro',
      label: 'Pro',
      icon: '⭐',
      description: '$9/month - For professionals'
    },
    {
      value: 'team',
      label: 'Team',
      icon: '👥',
      description: '$29/month - For teams'
    },
    {
      value: 'enterprise',
      label: 'Enterprise',
      icon: '🏢',
      description: 'Custom pricing'
    }
  ];

  return (
    <Select>
      <SelectTrigger className="w-[300px] p-2 border rounded">
        <SelectValue placeholder="Select a plan" />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{plan.icon}</span>
              <div>
                <div className="font-semibold">{plan.label}</div>
                <div className="text-sm text-gray-500">{plan.description}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Disabled Items

```jsx live
function DisabledItemsExample() {
  return (
    <Select>
      <SelectTrigger className="w-[200px] p-2 border rounded">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">✅ Active</SelectItem>
        <SelectItem value="pending">⏳ Pending</SelectItem>
        <SelectItem value="suspended" disabled>
          🚫 Suspended (Unavailable)
        </SelectItem>
        <SelectItem value="inactive">❌ Inactive</SelectItem>
        <SelectItem value="deleted" disabled>
          🗑️ Deleted (Unavailable)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Searchable Select

```jsx live
function SearchableSelectExample() {
  const [search, setSearch] = useState('');
  const countries = [
    'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina',
    'United Kingdom', 'France', 'Germany', 'Italy', 'Spain',
    'China', 'Japan', 'South Korea', 'India', 'Australia'
  ];

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Select>
      <SelectTrigger className="w-[250px] p-2 border rounded">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <SelectItem key={country} value={country.toLowerCase()}>
                {country}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500">
              No countries found
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
```

### Multi-Select

```jsx live
function MultiSelectExample() {
  const [selected, setSelected] = useState([]);
  const options = ['React', 'Vue', 'Angular', 'Svelte', 'Solid'];

  const toggleOption = (option) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-[300px] p-2 border rounded min-h-[40px] flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map(item => (
              <span key={item} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                {item}
                <button
                  onClick={() => toggleOption(item)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">Select frameworks...</span>
          )}
        </div>
      </div>
      
      <div className="border rounded p-2 w-[300px]">
        {options.map(option => (
          <label key={option} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleOption(option)}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>
      
      {selected.length > 0 && (
        <p className="text-sm">
          Selected: <span className="font-semibold">{selected.join(', ')}</span>
        </p>
      )}
    </div>
  );
}
```

### Async Loading

```jsx live
function AsyncSelectExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadOptions = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setOptions([
      { value: 'data1', label: 'Loaded Option 1' },
      { value: 'data2', label: 'Loaded Option 2' },
      { value: 'data3', label: 'Loaded Option 3' },
      { value: 'data4', label: 'Loaded Option 4' },
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && options.length === 0) {
      loadOptions();
    }
  }, [isOpen]);

  return (
    <Select open={isOpen} onOpenChange={setIsOpen}>
      <SelectTrigger className="w-[250px] p-2 border rounded">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">Loading options...</p>
          </div>
        ) : (
          options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
```

## API Reference

### Select

The root component that provides select context.

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
        <td><code>onValueChange</code></td>
        <td><code>(value: string) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when value changes</td>
      </tr>
      <tr>
        <td><code>defaultValue</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Default value for uncontrolled mode</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable the select</td>
      </tr>
      <tr>
        <td><code>open</code></td>
        <td><code>boolean</code></td>
        <td><code>undefined</code></td>
        <td>Controlled open state</td>
      </tr>
      <tr>
        <td><code>onOpenChange</code></td>
        <td><code>(open: boolean) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when open state changes</td>
      </tr>
    </tbody>
  </table>
</div>

### SelectTrigger

The button that triggers the select dropdown.

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
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>asChild</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Render as child element</td>
      </tr>
    </tbody>
  </table>
</div>

### SelectContent

The dropdown content container.

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
        <td><code>position</code></td>
        <td><code>'item-aligned' | 'popper'</code></td>
        <td><code>'item-aligned'</code></td>
        <td>Positioning mode</td>
      </tr>
      <tr>
        <td><code>side</code></td>
        <td><code>'top' | 'bottom'</code></td>
        <td><code>'bottom'</code></td>
        <td>Preferred side</td>
      </tr>
      <tr>
        <td><code>align</code></td>
        <td><code>'start' | 'center' | 'end'</code></td>
        <td><code>'start'</code></td>
        <td>Alignment</td>
      </tr>
    </tbody>
  </table>
</div>

### SelectItem

Individual selectable option.

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
        <td>Option value</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable the option</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td>Required</td>
        <td>Option content</td>
      </tr>
    </tbody>
  </table>
</div>

### SelectValue

Displays the selected value in the trigger.

### SelectGroup

Groups related options together.

### SelectLabel

Label for a group of options.

### SelectSeparator

Visual separator between options.

## Accessibility

The Select component follows WAI-ARIA combobox pattern:

- Full keyboard navigation (Arrow keys, Enter, Space, Escape)
- Screen reader announcements
- Proper ARIA attributes (`role="combobox"`, `aria-expanded`, `aria-haspopup`)
- Focus management
- Type-ahead search support
- Home/End key support for navigation

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Open select and select item |
| `Arrow Up/Down` | Navigate options |
| `Home/End` | Go to first/last option |
| `Escape` | Close select |
| `Type characters` | Search options |

## Best Practices

### Do's ✅

- Provide a clear placeholder text
- Use groups for related options
- Include icons for visual clarity
- Consider search for long lists
- Test keyboard navigation
- Provide default selections when appropriate
- Use descriptive option labels

### Don'ts ❌

- Don't use for less than 5 options (use radio buttons instead)
- Don't use for yes/no choices (use toggle/switch)
- Don't auto-select without user action
- Don't make lists too long without search
- Don't disable without explanation
- Don't use similar option labels

## Styling

```css
/* Custom select styles */
.select-trigger {
  --select-border-color: #e5e7eb;
  --select-background: white;
  --select-text-color: #111827;
  --select-placeholder-color: #9ca3af;
}

.select-content {
  --select-content-background: white;
  --select-content-border: 1px solid #e5e7eb;
  --select-item-hover: #f3f4f6;
  --select-item-selected: #eff6ff;
}
```

## Related Components

- [Input](/docs/components/input) - Text input field
- [RadioGroup](/docs/components/radio-group) - For single selection with few options
- [Checkbox](/docs/components/checkbox) - For multiple selections
- [ComboBox](/docs/components/combobox) - Select with text input
- [Dropdown Menu](/docs/components/dropdown-menu) - For actions menu
