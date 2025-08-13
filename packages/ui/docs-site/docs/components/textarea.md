---
id: textarea
title: Textarea
sidebar_position: 34
---

import { Textarea } from '@dainabase/ui';

The Textarea component provides a multi-line text input field with advanced features like auto-resize, character counting, and validation support. Perfect for comments, descriptions, messages, and any long-form text input.

## Preview

```jsx live
function TextareaDemo() {
  const [value, setValue] = useState('');
  
  return (
    <div className="space-y-4 w-full max-w-md">
      <Textarea
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="text-sm text-gray-500">
        Character count: {value.length}
      </p>
    </div>
  );
}
```

## Features

- 🎨 **Multiple variants** - Default, filled, outlined, and ghost styles
- 📏 **Auto-resize** - Automatically adjusts height based on content
- 📊 **Character counting** - Built-in character counter with max length support
- ✅ **Validation states** - Error, warning, and success visual feedback
- ♿ **Accessibility** - Full ARIA support and keyboard navigation
- 🎯 **Focus management** - Proper focus states and tab navigation
- 📱 **Responsive** - Mobile-optimized with proper touch targets
- 🔧 **Customizable** - Extensive styling and configuration options
- 💾 **Form integration** - Works seamlessly with form libraries
- 🚀 **Performance** - Debounced input and optimized re-renders

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { Textarea } from '@dainabase/ui';

function App() {
  return (
    <Textarea 
      placeholder="Enter your text..."
      rows={4}
    />
  );
}
```

## Examples

### Controlled Textarea

```jsx
function ControlledExample() {
  const [text, setText] = useState('');
  
  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Controlled textarea..."
      />
      <button onClick={() => setText('')}>
        Clear
      </button>
    </div>
  );
}
```

### With Character Limit

```jsx
function CharacterLimitExample() {
  const [text, setText] = useState('');
  const maxLength = 200;
  
  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={maxLength}
        placeholder="Maximum 200 characters..."
      />
      <div className="text-right text-sm">
        <span className={text.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}>
          {text.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
```

### Auto-Resize Textarea

```jsx
function AutoResizeExample() {
  return (
    <Textarea
      autoResize
      minRows={2}
      maxRows={8}
      placeholder="This textarea will grow as you type..."
      className="w-full"
    />
  );
}
```

### Different Variants

```jsx
function VariantsExample() {
  return (
    <div className="space-y-4">
      <Textarea variant="default" placeholder="Default variant..." />
      <Textarea variant="filled" placeholder="Filled variant..." />
      <Textarea variant="outlined" placeholder="Outlined variant..." />
      <Textarea variant="ghost" placeholder="Ghost variant..." />
    </div>
  );
}
```

### With Validation States

```jsx
function ValidationExample() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  const validate = (text) => {
    if (text.length < 10) {
      setError('Message must be at least 10 characters');
      return false;
    }
    setError('');
    return true;
  };
  
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          validate(e.target.value);
        }}
        error={!!error}
        placeholder="Minimum 10 characters..."
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

### With Label and Helper Text

```jsx
function LabeledExample() {
  return (
    <div className="space-y-2">
      <label htmlFor="message" className="text-sm font-medium">
        Your Message
      </label>
      <Textarea
        id="message"
        placeholder="Share your thoughts..."
        rows={4}
      />
      <p className="text-sm text-gray-500">
        Your message will be reviewed before posting.
      </p>
    </div>
  );
}
```

### Disabled and Read-Only States

```jsx
function StatesExample() {
  return (
    <div className="space-y-4">
      <Textarea
        disabled
        value="This textarea is disabled"
        rows={2}
      />
      <Textarea
        readOnly
        value="This textarea is read-only"
        rows={2}
      />
    </div>
  );
}
```

### With Custom Styling

```jsx
function CustomStyleExample() {
  return (
    <Textarea
      className="bg-gray-50 border-2 border-blue-300 focus:border-blue-500 rounded-lg p-4 font-mono"
      placeholder="Custom styled textarea..."
      style={{ lineHeight: '1.8' }}
      rows={5}
    />
  );
}
```

### Form Integration Example

```jsx
function FormExample() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Comments:', formData.get('comments'));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comments" className="block text-sm font-medium mb-2">
          Comments
        </label>
        <Textarea
          id="comments"
          name="comments"
          required
          minLength={20}
          maxLength={500}
          placeholder="Share your feedback..."
          rows={5}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Submit Feedback
      </button>
    </form>
  );
}
```

### With Mention/Autocomplete Support

```jsx
function MentionExample() {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleChange = (e) => {
    const text = e.target.value;
    setValue(text);
    
    // Detect @ mentions
    const lastChar = text[text.length - 1];
    setShowSuggestions(lastChar === '@');
  };
  
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Type @ to mention someone..."
        rows={4}
      />
      {showSuggestions && (
        <div className="absolute mt-2 bg-white border rounded-lg shadow-lg p-2">
          <div className="hover:bg-gray-100 p-2 cursor-pointer">@john_doe</div>
          <div className="hover:bg-gray-100 p-2 cursor-pointer">@jane_smith</div>
          <div className="hover:bg-gray-100 p-2 cursor-pointer">@team_lead</div>
        </div>
      )}
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Controlled value of the textarea |
| `defaultValue` | `string` | `''` | Default value for uncontrolled mode |
| `onChange` | `(e: ChangeEvent) => void` | `undefined` | Change event handler |
| `placeholder` | `string` | `''` | Placeholder text |
| `rows` | `number` | `3` | Number of visible text rows |
| `cols` | `number` | `undefined` | Number of visible text columns |
| `variant` | `'default' \| 'filled' \| 'outlined' \| 'ghost'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the textarea |
| `autoResize` | `boolean` | `false` | Enable automatic height adjustment |
| `minRows` | `number` | `2` | Minimum rows when autoResize is enabled |
| `maxRows` | `number` | `10` | Maximum rows when autoResize is enabled |
| `maxLength` | `number` | `undefined` | Maximum character limit |
| `minLength` | `number` | `undefined` | Minimum character requirement |
| `disabled` | `boolean` | `false` | Disable the textarea |
| `readOnly` | `boolean` | `false` | Make textarea read-only |
| `required` | `boolean` | `false` | Mark as required field |
| `error` | `boolean` | `false` | Show error state |
| `success` | `boolean` | `false` | Show success state |
| `warning` | `boolean` | `false` | Show warning state |
| `resize` | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | `'vertical'` | Resize behavior |
| `spellCheck` | `boolean` | `true` | Enable spell checking |
| `autoComplete` | `string` | `'off'` | Autocomplete attribute |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `name` | `string` | `undefined` | Form field name |
| `id` | `string` | `undefined` | Element ID |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `onBlur` | `(e: FocusEvent) => void` | `undefined` | Blur event handler |
| `onFocus` | `(e: FocusEvent) => void` | `undefined` | Focus event handler |
| `onKeyDown` | `(e: KeyboardEvent) => void` | `undefined` | Keydown event handler |
| `onKeyUp` | `(e: KeyboardEvent) => void` | `undefined` | Keyup event handler |
| `onPaste` | `(e: ClipboardEvent) => void` | `undefined` | Paste event handler |

## Accessibility

The Textarea component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab navigation
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators and logical tab order
- **Error Announcements**: Error messages are announced to screen readers
- **Labels**: Associated with label elements using `htmlFor`
- **Required Fields**: ARIA required attribute for mandatory fields
- **Character Limits**: ARIA live regions for character count announcements
- **Resize Handles**: Keyboard-accessible resize functionality

```jsx
// Accessible implementation
<div role="group" aria-labelledby="message-label">
  <label id="message-label" htmlFor="message">
    Message *
  </label>
  <Textarea
    id="message"
    aria-describedby="message-hint message-error"
    aria-invalid={!!error}
    aria-required={true}
    required
  />
  <span id="message-hint" className="sr-only">
    Enter your message, maximum 500 characters
  </span>
  {error && (
    <span id="message-error" role="alert">
      {error}
    </span>
  )}
</div>
```

## Best Practices

### Do's ✅

- **Do** provide clear labels and helper text
- **Do** use appropriate rows for expected content length
- **Do** implement character limits for constrained inputs
- **Do** provide real-time validation feedback
- **Do** use autoResize for dynamic content
- **Do** maintain consistent styling across forms
- **Do** provide clear error messages
- **Do** test with screen readers

### Don'ts ❌

- **Don't** use textarea for single-line inputs (use Input instead)
- **Don't** disable spell check for user content
- **Don't** make textarea too small for expected content
- **Don't** forget to handle edge cases (paste, drag-drop)
- **Don't** use placeholder as the only label
- **Don't** auto-focus without user expectation
- **Don't** ignore mobile keyboard behavior
- **Don't** forget to sanitize user input

## Use Cases

1. **Comment Systems**: Blog comments, forum posts, discussion threads
2. **Feedback Forms**: User feedback, bug reports, feature requests
3. **Messaging**: Chat applications, email composers, direct messages
4. **Content Creation**: Blog post editors, note-taking apps, documentation
5. **Data Entry**: Addresses, descriptions, biographical information
6. **Code Editors**: Simple code input, configuration files, JSON data
7. **Reviews**: Product reviews, testimonials, ratings with comments
8. **Support Tickets**: Customer support forms, help desk systems

## Related Components

- [Input](./input) - Single-line text input
- [Form](./form) - Form wrapper with validation
- [Label](./label) - Form field labels
- [Select](./select) - Dropdown selection
- [Switch](./switch) - Toggle switches
- [Checkbox](./checkbox) - Checkbox inputs
- [Radio Group](./radio-group) - Radio button groups