# Date Range Picker

Select date ranges with calendar

## Import

```tsx
import { DateRangePicker } from '@dainabase/ui/date-range-picker';
```

## Basic Usage

```tsx
import { DateRangePicker } from '@dainabase/ui/date-range-picker';

export default function DateRangePickerExample() {
  return (
    <DateRangePicker 
      placeholder="Select date range"
      onChange={(range) => console.log(range)}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `{ from: Date, to: Date }` | - | No | Selected range |
| onChange | `(range: DateRange) => void` | - | No | Range change callback |
| minDate | `Date` | - | No | Minimum date |
| maxDate | `Date` | - | No | Maximum date |

## Related Components

- [Date Picker](./date-picker.md) - Single date selection
- [Calendar](./calendar.md) - Calendar component

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>