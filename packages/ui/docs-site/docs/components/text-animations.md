---
id: text-animations
title: Text Animations
sidebar_position: 59
---

import { TextAnimation } from '@dainabase/ui';

A collection of stunning text animation components that bring life to your typography with smooth, performant animations including typewriter effects, fade-ins, glitch effects, and more.

## Preview

```jsx live
function TextAnimationsDemo() {
  const [animation, setAnimation] = useState('typewriter');
  
  return (
    <div className="space-y-6">
      <select 
        value={animation} 
        onChange={(e) => setAnimation(e.target.value)}
        className="px-4 py-2 border rounded"
      >
        <option value="typewriter">Typewriter</option>
        <option value="fade">Fade In</option>
        <option value="slide">Slide In</option>
        <option value="glitch">Glitch</option>
        <option value="wave">Wave</option>
      </select>
      
      <TextAnimation
        type={animation}
        text="Welcome to Amazing Animations!"
        className="text-3xl font-bold"
        duration={2000}
        delay={100}
      />
    </div>
  );
}
```

## Features

- ✨ **20+ Animation Types**: Diverse collection of text effects
- 🎭 **Customizable**: Full control over timing, easing, and styles
- ⚡ **Performant**: GPU-accelerated animations
- 📱 **Responsive**: Mobile-optimized animations
- ♿ **Accessible**: Respects prefers-reduced-motion
- 🎯 **Intersection Observer**: Trigger on scroll
- 🔄 **Repeatable**: Loop and replay animations
- 🎨 **Styled**: Works with any CSS framework
- 📝 **Word/Letter Split**: Animate by word or character
- 🌍 **RTL Support**: Right-to-left language compatible

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { TextAnimation } from '@dainabase/ui';

function App() {
  return (
    <TextAnimation
      type="typewriter"
      text="Hello, World!"
      duration={2000}
    />
  );
}
```

## Examples

### Typewriter Effect

```jsx
<TextAnimation
  type="typewriter"
  text="I'm being typed out character by character..."
  duration={3000}
  cursor={true}
  cursorStyle="_"
  loop={false}
/>
```

### Fade In Animation

```jsx
<TextAnimation
  type="fade"
  text="Smoothly fading into view"
  duration={1500}
  delay={200}
  easing="ease-in-out"
/>
```

### Slide In From Direction

```jsx
<div className="space-y-4">
  <TextAnimation
    type="slide"
    direction="left"
    text="Sliding in from the left"
    duration={1000}
  />
  
  <TextAnimation
    type="slide"
    direction="right"
    text="Sliding in from the right"
    duration={1000}
    delay={200}
  />
  
  <TextAnimation
    type="slide"
    direction="up"
    text="Sliding up from below"
    duration={1000}
    delay={400}
  />
</div>
```

### Glitch Effect

```jsx
<TextAnimation
  type="glitch"
  text="SYSTEM ERROR"
  duration={2000}
  glitchIntensity="high"
  colors={['#ff0000', '#00ff00', '#0000ff']}
  className="font-mono text-4xl"
/>
```

### Wave Animation

```jsx
<TextAnimation
  type="wave"
  text="Making waves with every letter"
  waveHeight={20}
  waveSpeed={100}
  stagger={50}
  className="text-2xl"
/>
```

### Word by Word Reveal

```jsx
<TextAnimation
  type="words"
  text="Each word appears one at a time with style"
  duration={2000}
  stagger={200}
  animation="fade-up"
/>
```

### Letter by Letter Scale

```jsx
<TextAnimation
  type="letters"
  text="SCALING"
  animation="scale"
  duration={1500}
  stagger={100}
  from={0}
  to={1}
  className="text-6xl font-black"
/>
```

### Gradient Animation

```jsx
<TextAnimation
  type="gradient"
  text="Colorful Gradient Text"
  colors={['#667eea', '#764ba2', '#f093fb', '#fecfef']}
  duration={3000}
  angle={45}
  className="text-4xl font-bold"
/>
```

### Blur to Focus

```jsx
<TextAnimation
  type="blur"
  text="Coming into focus..."
  blurAmount={10}
  duration={2000}
  easing="cubic-bezier(0.4, 0.0, 0.2, 1)"
/>
```

### Scroll Triggered

```jsx
function ScrollTriggeredText() {
  return (
    <div className="min-h-screen">
      <div className="h-screen flex items-center justify-center">
        <p>Scroll down to see the animation</p>
      </div>
      
      <TextAnimation
        type="typewriter"
        text="This text animates when you scroll to it!"
        trigger="scroll"
        threshold={0.5}
        once={true}
        className="text-3xl"
      />
    </div>
  );
}
```

### Combined Animations

```jsx
<TextAnimation
  type="combined"
  text="Multiple Effects!"
  animations={[
    { type: 'fade', duration: 500 },
    { type: 'scale', from: 0.5, to: 1, duration: 500 },
    { type: 'rotate', degrees: 360, duration: 1000 }
  ]}
  sequential={true}
/>
```

### Custom Keyframes

```jsx
<TextAnimation
  type="custom"
  text="Custom Animation"
  keyframes={`
    @keyframes customBounce {
      0% { transform: translateY(0); }
      25% { transform: translateY(-20px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-10px); }
      100% { transform: translateY(0); }
    }
  `}
  animationName="customBounce"
  duration={1000}
  iterationCount="infinite"
/>
```

### Matrix Rain Effect

```jsx
<TextAnimation
  type="matrix"
  text="ENTER THE MATRIX"
  characters="01"
  rainSpeed={50}
  fontSize={20}
  color="#00ff00"
  className="font-mono"
/>
```

### Scramble Text

```jsx
<TextAnimation
  type="scramble"
  text="Decrypting message..."
  scrambleCharacters="!@#$%^&*"
  duration={3000}
  revealDelay={2000}
/>
```

## API Reference

### TextAnimation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `AnimationType` | `'fade'` | Animation type |
| `text` | `string` | Required | Text to animate |
| `duration` | `number` | `1000` | Animation duration (ms) |
| `delay` | `number` | `0` | Animation delay (ms) |
| `easing` | `string` | `'ease'` | CSS easing function |
| `stagger` | `number` | `50` | Stagger delay between elements |
| `loop` | `boolean` | `false` | Loop animation |
| `trigger` | `'auto' \| 'scroll' \| 'hover' \| 'click'` | `'auto'` | Animation trigger |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | - | Direction for slide animations |
| `className` | `string` | - | Additional CSS classes |
| `onComplete` | `() => void` | - | Animation complete callback |
| `paused` | `boolean` | `false` | Pause animation |
| `reverse` | `boolean` | `false` | Reverse animation |

### Animation Types

```typescript
type AnimationType = 
  | 'typewriter'
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'blur'
  | 'glitch'
  | 'wave'
  | 'bounce'
  | 'shake'
  | 'gradient'
  | 'words'
  | 'letters'
  | 'matrix'
  | 'scramble'
  | 'flip'
  | 'zoom'
  | 'elastic'
  | 'neon'
  | 'custom';
```

### Typewriter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cursor` | `boolean` | `true` | Show typing cursor |
| `cursorStyle` | `string` | `'\|'` | Cursor character |
| `cursorBlink` | `boolean` | `true` | Blinking cursor |
| `deleteSpeed` | `number` | `50` | Delete animation speed |
| `typingSpeed` | `number` | `100` | Typing speed |

### Glitch Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glitchIntensity` | `'low' \| 'medium' \| 'high'` | `'medium'` | Glitch intensity |
| `colors` | `string[]` | `['#ff0000', '#00ff00']` | Glitch colors |
| `layers` | `number` | `3` | Number of glitch layers |

### Wave Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `waveHeight` | `number` | `20` | Wave amplitude (px) |
| `waveSpeed` | `number` | `100` | Wave speed (ms) |
| `waveType` | `'sine' \| 'bounce'` | `'sine'` | Wave pattern |

## Animation Methods

```jsx
const animationRef = useRef();

// Control methods
animationRef.current.play();
animationRef.current.pause();
animationRef.current.restart();
animationRef.current.reverse();
animationRef.current.seek(0.5); // Seek to 50%

<TextAnimation
  ref={animationRef}
  type="typewriter"
  text="Controlled animation"
/>
```

## Accessibility

The Text Animation component follows WCAG 2.1 guidelines:

- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Screen Readers**: Provides immediate text content for screen readers
- **Keyboard Control**: Pauseable animations via keyboard
- **ARIA Labels**: Proper ARIA attributes for animated content
- **Focus Management**: Maintains focus during animations
- **Alternative Content**: Static text fallback option

```jsx
<TextAnimation
  type="typewriter"
  text="Accessible animation"
  aria-label="Accessible animation"
  respectReducedMotion={true}
  fallback={<span>Accessible animation</span>}
/>
```

## Performance Optimization

```jsx
// Use CSS transforms for better performance
<TextAnimation
  type="slide"
  useGPU={true}
  willChange="transform"
/>

// Lazy load for scroll-triggered animations
<TextAnimation
  type="fade"
  trigger="scroll"
  lazy={true}
/>

// Optimize for mobile
<TextAnimation
  type={isMobile ? 'fade' : 'typewriter'}
  duration={isMobile ? 500 : 2000}
/>
```

## Best Practices

### Do's ✅

- Use appropriate animation for content type
- Keep animations short and sweet
- Provide reduced motion alternatives
- Test on various devices
- Use GPU acceleration for complex animations
- Consider loading states
- Match animation to brand personality
- Use scroll triggers sparingly
- Optimize for performance
- Test with screen readers

### Don'ts ❌

- Don't overuse animations
- Don't make essential content animation-dependent
- Don't use distracting animations for body text
- Don't ignore accessibility
- Don't use long durations
- Don't animate large blocks of text
- Don't trigger too many animations at once
- Don't forget mobile users
- Don't use animations in critical paths
- Don't rely solely on animation for meaning

## Use Cases

1. **Hero Sections**: Engaging headline animations
2. **Loading States**: Skeleton text animations
3. **Notifications**: Attention-grabbing alerts
4. **Storytelling**: Progressive content reveal
5. **Code Demos**: Typewriter for code examples
6. **Marketing Sites**: Eye-catching CTAs
7. **Dashboards**: Data update animations
8. **Tutorials**: Step-by-step reveals
9. **Gaming UIs**: Dramatic text effects
10. **Creative Portfolios**: Artistic text presentations

## Troubleshooting

Common issues and solutions:

```jsx
// Issue: Animation not triggering
// Solution: Check trigger conditions
<TextAnimation
  trigger="scroll"
  threshold={0.5} // Adjust threshold
  rootMargin="0px" // Adjust margin
/>

// Issue: Performance issues
// Solution: Use GPU acceleration
<TextAnimation
  type="slide"
  style={{ transform: 'translateZ(0)' }}
/>

// Issue: Text jumping
// Solution: Set explicit dimensions
<div style={{ minHeight: '100px' }}>
  <TextAnimation type="typewriter" text="Stable text" />
</div>
```

## Related Components

- [Spinner](./spinner) - Loading animations
- [Skeleton](./skeleton) - Loading placeholders
- [Toast](./toast) - Animated notifications
- [Alert](./alert) - Animated alerts
- [Badge](./badge) - Animated badges