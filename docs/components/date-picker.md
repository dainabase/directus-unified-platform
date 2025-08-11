# Date Picker

Calendar-based date selection

## Import

```tsx
import { DatePicker } from '@dainabase/ui/date-picker';
```

## Basic Usage

```tsx
import { DatePicker } from '@dainabase/ui/date-picker';

export default function DatePickerExample() {
  return (
    <DatePicker 
      placeholder="Select date"
      onChange={(date) => console.log(date)}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `Date` | - | No | Selected date |
| onChange | `(date: Date) => void` | - | No | Date change callback |
| minDate | `Date` | - | No | Minimum selectable date |
| maxDate | `Date` | - | No | Maximum selectable date |
| format | `string` | 'MM/dd/yyyy' | No | Date format |

## Related Components

- [Date Range Picker](./date-range-picker.md) - Range selection
- [Calendar](./calendar.md) - Calendar view

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>