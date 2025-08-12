---
id: progress
title: Progress
sidebar_position: 31
---

import { Progress } from '@dainabase/ui';

# Progress

Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.

## Preview

<div className="space-y-4">
  <Progress value={33} />
  <Progress value={66} />
  <Progress value={100} />
</div>

## Features

- **Accessible**: Built with proper ARIA attributes for screen readers
- **Customizable**: Full control over colors, sizes, and animations
- **Determinate & Indeterminate**: Support for both known and unknown duration
- **Animated**: Smooth transitions between progress values
- **Label Support**: Built-in or custom label positioning
- **Multiple Variants**: Different styles for various use cases
- **Responsive**: Adapts to container width
- **Performance**: Optimized rendering with React
- **Theming**: Integrates with design system tokens

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Progress } from '@dainabase/ui';

export default function ProgressDemo() {
  return <Progress value={50} />;
}
```

## Examples

### Basic Progress

```tsx
<div className="w-full space-y-4">
  <Progress value={0} />
  <Progress value={25} />
  <Progress value={50} />
  <Progress value={75} />
  <Progress value={100} />
</div>
```

### With Labels

```tsx
function ProgressWithLabel() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Processing...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
```

### Animated Progress

```tsx
function AnimatedProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <Progress value={progress} className="transition-all duration-500" />
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {progress}% Complete
      </p>
    </div>
  );
}
```

### Different Sizes

```tsx
<div className="space-y-4 w-full">
  <div>
    <p className="text-sm mb-2">Small</p>
    <Progress value={60} className="h-1" />
  </div>
  
  <div>
    <p className="text-sm mb-2">Default</p>
    <Progress value={60} />
  </div>
  
  <div>
    <p className="text-sm mb-2">Large</p>
    <Progress value={60} className="h-4" />
  </div>
  
  <div>
    <p className="text-sm mb-2">Extra Large</p>
    <Progress value={60} className="h-6" />
  </div>
</div>
```

### Color Variants

```tsx
<div className="space-y-4 w-full">
  <Progress value={40} className="[&>div]:bg-blue-500" />
  <Progress value={55} className="[&>div]:bg-green-500" />
  <Progress value={70} className="[&>div]:bg-yellow-500" />
  <Progress value={85} className="[&>div]:bg-red-500" />
  <Progress value={95} className="[&>div]:bg-purple-500" />
</div>
```

### File Upload Progress

```tsx
function FileUploadProgress() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('idle');

  const simulateUpload = () => {
    setStatus('uploading');
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('complete');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          <span className="text-sm">document.pdf</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(uploadProgress)}%
        </span>
      </div>
      
      <Progress value={uploadProgress} />
      
      <div className="flex justify-between">
        <Button 
          onClick={simulateUpload} 
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload File'}
        </Button>
        {status === 'complete' && (
          <Badge variant="success">Upload Complete</Badge>
        )}
      </div>
    </div>
  );
}
```

### Multi-Step Progress

```tsx
function MultiStepProgress({ currentStep = 2, totalSteps = 5 }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-sm">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center",
              i < currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {i + 1}
            </div>
            <span>Step {i + 1}</span>
          </div>
        ))}
      </div>
      <Progress value={progress} />
    </div>
  );
}
```

### Indeterminate Progress

```tsx
<div className="w-full space-y-4">
  <div>
    <p className="text-sm mb-2">Loading...</p>
    <Progress className="animate-pulse" />
  </div>
  
  <div>
    <p className="text-sm mb-2">Processing...</p>
    <div className="relative">
      <Progress value={100} className="opacity-20" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="h-full w-1/3 bg-primary animate-slide" />
      </div>
    </div>
  </div>
</div>

<style jsx>{`
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
  .animate-slide {
    animation: slide 1.5s ease-in-out infinite;
  }
`}</style>
```

### Progress with Status

```tsx
function ProgressWithStatus() {
  const [progress, setProgress] = useState(0);
  
  const getStatus = () => {
    if (progress < 30) return { text: 'Starting...', color: 'text-blue-500' };
    if (progress < 60) return { text: 'Processing...', color: 'text-yellow-500' };
    if (progress < 90) return { text: 'Almost done...', color: 'text-orange-500' };
    if (progress < 100) return { text: 'Finalizing...', color: 'text-green-500' };
    return { text: 'Complete!', color: 'text-green-600' };
  };

  const status = getStatus();

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className={cn("text-sm font-medium", status.color)}>
          {status.text}
        </span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
          Increase
        </Button>
        <Button size="sm" variant="outline" onClick={() => setProgress(0)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
```

### Circular Progress

```tsx
function CircularProgress({ value = 75, size = 120 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}
```

## API Reference

### Progress

The progress bar component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value (0-100) |
| `max` | `number` | `100` | Maximum progress value |
| `className` | `string` | - | Additional CSS classes |
| `indicatorClassName` | `string` | - | Classes for the progress indicator |
| `getValueLabel` | `(value: number, max: number) => string` | - | Custom label formatter |

## Accessibility

The Progress component follows accessibility best practices:

- **ARIA Attributes**:
  - `role="progressbar"` for semantic meaning
  - `aria-valuenow` for current value
  - `aria-valuemin` for minimum value (0)
  - `aria-valuemax` for maximum value
  - `aria-label` or `aria-labelledby` for description
- **Screen Reader Support**: Announces progress changes
- **Keyboard**: Not interactive by default (display only)
- **Color Contrast**: Meets WCAG 2.1 AA standards

## Best Practices

### Do's ✅

- Provide context with labels or descriptions
- Use appropriate colors (green for success, red for errors)
- Show percentage or fraction for clarity
- Animate smoothly between values
- Consider using indeterminate for unknown duration
- Provide status updates for long operations

### Don'ts ❌

- Don't use progress bars for non-linear processes
- Don't hide progress bars abruptly (fade out gracefully)
- Don't use too many progress bars simultaneously
- Don't forget to handle error states
- Don't make progress bars too small to see
- Don't use misleading progress values

## Use Cases

- **File Uploads**: Show upload progress with percentage
- **Form Completion**: Multi-step form progress indication
- **Loading States**: Page or data loading progress
- **Installation**: Software installation progress
- **Downloads**: File download progress tracking
- **Processing**: Long-running task progress
- **Skill Levels**: Visual representation of proficiency
- **Health/Stats**: Game or app statistics display
- **Media Playback**: Video/audio playback progress

## Related Components

- [Skeleton](./skeleton) - For loading placeholders
- [Spinner](./spinner) - For indeterminate loading
- [Badge](./badge) - For status indicators
- [Alert](./alert) - For progress completion messages
- [Slider](./slider) - For interactive progress control