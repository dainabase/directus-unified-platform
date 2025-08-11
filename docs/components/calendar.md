# Calendar

Calendar view for events and scheduling

## Import

```tsx
import { Calendar } from '@dainabase/ui/calendar';
```

## Basic Usage

```tsx
import { Calendar } from '@dainabase/ui/calendar';

export default function CalendarExample() {
  return (
    <Calendar 
      events={[
        { date: '2024-03-15', title: 'Meeting' },
        { date: '2024-03-20', title: 'Deadline' }
      ]}
      onDateSelect={(date) => console.log(date)}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| events | `Event[]` | [] | No | Calendar events |
| view | `'month' \| 'week' \| 'day'` | 'month' | No | Calendar view |
| onDateSelect | `(date: Date) => void` | - | No | Date selection callback |

## Related Components

- [Date Picker](./date-picker.md) - Date selection
- [Timeline](./timeline.md) - Chronological view

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>