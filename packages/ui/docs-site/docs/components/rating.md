---
id: rating
title: Rating
sidebar_position: 32
---

import { Rating } from '@dainabase/ui';

# Rating

A customizable star rating component for collecting user feedback with support for half-stars, custom icons, and various sizes.

## Preview

```jsx live
function RatingDemo() {
  const [value, setValue] = useState(3);
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Rate your experience</label>
        <Rating 
          value={value} 
          onChange={setValue}
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          You rated: {value} stars
        </p>
      </div>
    </div>
  );
}
```

## Features

- ⭐ **Customizable icons** - Use any icon or emoji for ratings
- 🌗 **Half-star support** - Allow fractional ratings like 3.5 stars
- 🎨 **Multiple sizes** - Small, medium, large, and custom sizes
- 🎯 **Keyboard navigation** - Full keyboard support with arrow keys
- ♿ **Accessible** - ARIA labels and screen reader support
- 🎭 **Hover effects** - Visual feedback on hover
- 📱 **Touch friendly** - Works great on mobile devices
- 🔄 **Controlled/Uncontrolled** - Flexible state management
- 🎪 **Animation support** - Smooth transitions and effects
- 🌈 **Custom colors** - Fully customizable styling

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```jsx
import { Rating } from '@dainabase/ui';

function MyComponent() {
  const [rating, setRating] = useState(0);
  
  return (
    <Rating 
      value={rating} 
      onChange={setRating}
    />
  );
}
```

## Examples

### Basic Rating

```jsx
<Rating />

// With default value
<Rating defaultValue={3} />

// Controlled
function ControlledRating() {
  const [value, setValue] = useState(4);
  return <Rating value={value} onChange={setValue} />;
}
```

### Different Sizes

```jsx
<div className="space-y-4">
  <Rating size="sm" defaultValue={3} />
  <Rating size="md" defaultValue={3} />
  <Rating size="lg" defaultValue={3} />
  <Rating size="xl" defaultValue={3} />
  
  {/* Custom size */}
  <Rating 
    className="text-4xl" 
    defaultValue={3}
  />
</div>
```

### Half Stars

```jsx
<Rating 
  allowHalf 
  defaultValue={3.5}
  onChange={(value) => console.log('Rating:', value)}
/>

// Display only with half stars
<Rating 
  value={4.5} 
  readonly 
  allowHalf
/>
```

### Custom Icons

```jsx
// Heart icons
<Rating 
  icon="❤️"
  emptyIcon="🤍"
  defaultValue={3}
/>

// Custom React icons
<Rating 
  icon={<Icon name="star-filled" />}
  emptyIcon={<Icon name="star" />}
  defaultValue={3}
/>

// Emoji ratings
<Rating 
  count={5}
  icon="😍"
  emptyIcon="😐"
  defaultValue={3}
/>

// Thumbs up
<Rating 
  count={1}
  icon="👍"
  emptyIcon="👍"
  className="text-2xl"
/>
```

### Custom Count

```jsx
// 10-star rating
<Rating count={10} defaultValue={7} />

// 3-star rating
<Rating count={3} defaultValue={2} />

// Binary rating (like/dislike)
<Rating 
  count={1} 
  icon="👍"
  emptyIcon="👎"
/>
```

### Read-only Display

```jsx
// Read-only rating
<Rating value={4} readonly />

// With text
<div className="flex items-center gap-2">
  <Rating value={4.5} readonly allowHalf />
  <span className="text-sm text-muted-foreground">
    4.5 out of 5
  </span>
</div>

// With review count
<div className="flex items-center gap-2">
  <Rating value={4.2} readonly allowHalf />
  <span className="text-sm text-muted-foreground">
    (128 reviews)
  </span>
</div>
```

### Disabled State

```jsx
<Rating disabled defaultValue={3} />

// Disabled with custom styling
<Rating 
  disabled 
  defaultValue={3}
  className="opacity-50 cursor-not-allowed"
/>
```

### With Labels

```jsx
function RatingWithLabels() {
  const [value, setValue] = useState(0);
  const labels = [
    'Terrible',
    'Bad',
    'Okay',
    'Good',
    'Excellent'
  ];
  
  return (
    <div className="space-y-2">
      <Rating value={value} onChange={setValue} />
      {value > 0 && (
        <p className="text-sm font-medium">
          {labels[value - 1]}
        </p>
      )}
    </div>
  );
}
```

### Custom Colors

```jsx
// Gold stars
<Rating 
  defaultValue={3}
  className="text-yellow-400"
  emptyClassName="text-gray-300"
/>

// Gradient colors
<Rating 
  defaultValue={3}
  className="text-gradient-to-r from-purple-400 to-pink-400"
/>

// Different colors per rating level
function ColorfulRating() {
  const [value, setValue] = useState(0);
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-lime-500',
    'text-green-500'
  ];
  
  return (
    <Rating 
      value={value}
      onChange={setValue}
      className={value > 0 ? colors[value - 1] : ''}
    />
  );
}
```

### With Form Integration

```jsx
function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ rating, review });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Rating
        </label>
        <Rating 
          value={rating}
          onChange={setRating}
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">
          Review
        </label>
        <Textarea 
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience..."
        />
      </div>
      
      <Button type="submit" disabled={!rating}>
        Submit Review
      </Button>
    </form>
  );
}
```

### Product Rating Display

```jsx
function ProductRating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Rating value={rating} readonly allowHalf size="sm" />
        <span className="text-lg font-semibold">{rating}</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <Button variant="link" className="text-sm">
        {reviews} reviews
      </Button>
    </div>
  );
}

// Usage
<ProductRating rating={4.5} reviews={1234} />
```

### Rating Distribution

```jsx
function RatingDistribution({ distribution }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => (
        <div key={stars} className="flex items-center gap-2">
          <Rating value={stars} readonly size="sm" />
          <Progress 
            value={(distribution[stars] / total) * 100} 
            className="flex-1 h-2"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {distribution[stars]}
          </span>
        </div>
      ))}
    </div>
  );
}

// Usage
<RatingDistribution 
  distribution={{
    5: 234,
    4: 123,
    3: 45,
    2: 12,
    1: 5
  }}
/>
```

## API Reference

### Rating Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Controlled value |
| `defaultValue` | `number` | `0` | Default value (uncontrolled) |
| `onChange` | `(value: number) => void` | - | Change handler |
| `count` | `number` | `5` | Number of stars |
| `allowHalf` | `boolean` | `false` | Allow half-star ratings |
| `allowClear` | `boolean` | `true` | Allow clearing rating |
| `readonly` | `boolean` | `false` | Read-only mode |
| `disabled` | `boolean` | `false` | Disabled state |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Size preset |
| `icon` | `ReactNode \| string` | `"⭐"` | Filled icon |
| `emptyIcon` | `ReactNode \| string` | `"☆"` | Empty icon |
| `halfIcon` | `ReactNode \| string` | - | Half-filled icon |
| `className` | `string` | - | Container class |
| `iconClassName` | `string` | - | Icon class |
| `emptyClassName` | `string` | - | Empty icon class |
| `activeClassName` | `string` | - | Active icon class |
| `hoverClassName` | `string` | - | Hover icon class |
| `onHoverChange` | `(value: number) => void` | - | Hover change handler |
| `tooltips` | `string[]` | - | Tooltip for each star |
| `direction` | `"ltr" \| "rtl"` | `"ltr"` | Direction |
| `name` | `string` | - | Form field name |
| `required` | `boolean` | `false` | Required field |
| `autoFocus` | `boolean` | `false` | Auto focus |

### Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `clear()` | Clear the rating | - |
| `focus()` | Focus the rating | - |
| `blur()` | Blur the rating | - |

### Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `onChange` | Fired when value changes | `(value: number) => void` |
| `onHoverChange` | Fired when hovering | `(value: number) => void` |
| `onFocus` | Fired on focus | `(event: FocusEvent) => void` |
| `onBlur` | Fired on blur | `(event: FocusEvent) => void` |
| `onKeyDown` | Fired on key down | `(event: KeyboardEvent) => void` |

## Accessibility

The Rating component is built with accessibility in mind:

- Keyboard navigation with arrow keys (Left/Right, Up/Down)
- Home/End keys for first/last rating
- Space/Enter to select rating
- ARIA labels for screen readers
- ARIA live region for value announcements
- Proper focus management
- Support for reduced motion
- High contrast mode support
- Touch-friendly targets

## Best Practices

### ✅ Do's

- Provide clear labels for what is being rated
- Use appropriate rating scales (5-star is most common)
- Show the current rating value as text
- Allow users to clear their rating
- Provide visual feedback on hover
- Use half-stars for display, whole stars for input
- Include review count when displaying averages
- Make touch targets at least 44x44 pixels
- Test keyboard navigation thoroughly
- Consider cultural differences in rating systems

### ❌ Don'ts

- Don't use too many rating levels (5-10 is ideal)
- Avoid tiny click targets on mobile
- Don't rely only on color to show state
- Avoid auto-submitting ratings without confirmation
- Don't hide important actions behind ratings
- Avoid complex rating scales for simple feedback
- Don't forget hover states and transitions
- Avoid forcing users to rate
- Don't use ratings for non-subjective data
- Avoid inconsistent rating scales in the same app

## Use Cases

- **Product reviews** - E-commerce product ratings
- **App store ratings** - Mobile app feedback
- **Service feedback** - Customer satisfaction surveys
- **Content rating** - Article or video ratings
- **Restaurant reviews** - Food and service ratings
- **Hotel bookings** - Accommodation ratings
- **Course evaluations** - Educational content feedback
- **Employee reviews** - Performance evaluations
- **Movie ratings** - Entertainment content ratings
- **Priority indicators** - Task or item importance levels

## Related Components

- [Slider](/docs/components/slider) - For continuous value selection
- [Radio Group](/docs/components/radio-group) - For single choice selection
- [Toggle Group](/docs/components/toggle-group) - For multiple toggle options
- [Button](/docs/components/button) - For like/dislike actions
- [Progress](/docs/components/progress) - For showing rating distributions
