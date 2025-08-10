# Migration Guide: v0.2.0 → v0.3.0

## 🎯 Overview

This guide helps you migrate from @dainabase/ui v0.2.0 to v0.3.0, which brings the Design System score from 96/100 to 98/100.

## ✨ What's New in v0.3.0

### New Components (3)
- `Calendar` - Full-featured date selection component
- `DateRangePicker` - Advanced date range selector with presets
- `Popover` - Utility component for floating UI elements

### Improvements
- Test coverage increased from 72% to 80%
- All components now have complete TypeScript definitions
- Enhanced accessibility support across all components

## 📦 Installation

```bash
# Update the package
npm update @dainabase/ui@0.3.0
# or
yarn upgrade @dainabase/ui@0.3.0
# or
pnpm update @dainabase/ui@0.3.0
```

## 🔄 Breaking Changes

**Good news!** There are NO breaking changes in v0.3.0. All existing components remain backward compatible.

## 🆕 Using New Components

### Calendar Component

```tsx
import { Calendar } from '@dainabase/ui';

// Single date selection
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>

// Multiple dates selection
<Calendar
  mode="multiple"
  selected={dates}
  onSelect={setDates}
/>

// Date range selection
<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
/>
```

### DateRangePicker Component

```tsx
import { DateRangePicker } from '@dainabase/ui';
import { DateRange } from 'react-day-picker';

function MyComponent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <DateRangePicker
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      placeholder="Select date range"
      numberOfMonths={2}
    />
  );
}
```

### Popover Component

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@dainabase/ui';

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content here</p>
  </PopoverContent>
</Popover>
```

## 📝 Component Updates

### Previously Non-functional Components

The following components were exported but not implemented in v0.2.0. They are now fully functional:

1. **Calendar** - Was throwing import errors, now fully implemented
2. **DateRangePicker** - Was throwing import errors, now fully implemented

If you had workarounds for these components, you can now remove them and use the official implementations.

## 🎨 Style Updates

No changes to the design tokens or Tailwind configuration. All existing styles remain compatible.

## 🧪 Testing Updates

### New Test Coverage Areas

If you have custom tests that interact with date components, consider adding:

```tsx
// Example test for DateRangePicker
it('should handle date range selection', () => {
  const onDateRangeChange = jest.fn();
  render(
    <DateRangePicker 
      onDateRangeChange={onDateRangeChange}
    />
  );
  
  // Your test logic here
});
```

## 🚀 Performance Improvements

- Bundle size remains optimized at ~78kb
- Tree-shaking improvements for better code splitting
- No performance regressions in existing components

## 📚 TypeScript Updates

All new components include full TypeScript support:

```typescript
// Type definitions are exported
import type { 
  CalendarProps,
  DateRangePickerProps,
  PopoverProps 
} from '@dainabase/ui';
```

## 🔧 Configuration Updates

No configuration changes required. Your existing setup will work without modifications.

## 📖 Documentation

Updated Storybook documentation is available at:
https://dainabase.github.io/directus-unified-platform

## 🐛 Bug Fixes

- Fixed export errors for Calendar and DateRangePicker components
- Resolved TypeScript definition issues in date-related components
- Improved accessibility labels across all form components

## 💡 Migration Checklist

- [ ] Update @dainabase/ui to v0.3.0
- [ ] Run your test suite to ensure compatibility
- [ ] Remove any workarounds for Calendar/DateRangePicker
- [ ] Update your TypeScript types if using the new components
- [ ] Review new component documentation in Storybook
- [ ] Test your application in development
- [ ] Deploy to staging environment
- [ ] Verify production build

## 🆘 Getting Help

If you encounter any issues during migration:

1. Check the [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
2. Review the [Storybook documentation](https://dainabase.github.io/directus-unified-platform)
3. Contact support at admin@dainamics.ch

## 🎉 Congratulations!

You've successfully migrated to v0.3.0! Enjoy the new components and improved test coverage.

---

**Next milestone**: v1.0.0 will bring the final 2 points for a perfect 100/100 score with performance optimizations and advanced theming features.
