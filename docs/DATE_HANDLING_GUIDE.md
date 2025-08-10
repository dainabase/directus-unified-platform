# 📅 Date Handling Guide

## Overview
The Design System uses `date-fns` for date formatting and manipulation, integrated with `react-day-picker` for date selection components.

## Dependencies
- **date-fns** v3.0.0 - Modern JavaScript date utility library
- **react-day-picker** v8.9.0 - Flexible date picker component

## Usage in Components

### DatePicker Component
```tsx
import { format, parseISO, isValid } from 'date-fns';
import { DatePicker } from '@dainabase/ui';

// Basic usage
<DatePicker
  value={date}
  onChange={setDate}
  format="dd/MM/yyyy"
/>
```

### DateRangePicker Component
```tsx
import { DateRangePicker } from '@dainabase/ui';

// Date range selection
<DateRangePicker
  from={startDate}
  to={endDate}
  onChange={({ from, to }) => {
    setStartDate(from);
    setEndDate(to);
  }}
/>
```

## Date Formatting

### Using date-fns directly
```tsx
import { format, formatDistance, formatRelative } from 'date-fns';

// Format date
format(new Date(), 'dd/MM/yyyy'); // "10/08/2025"
format(new Date(), 'EEEE, MMMM do, yyyy'); // "Sunday, August 10th, 2025"

// Relative time
formatDistance(new Date(2025, 7, 1), new Date()); // "9 days ago"
formatRelative(new Date(2025, 7, 1), new Date()); // "last Thursday at 12:00 AM"
```

### Localization
```tsx
import { format } from 'date-fns';
import { fr, de, es } from 'date-fns/locale';

// French
format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr });
// "dimanche 10 août 2025"

// German
format(new Date(), 'EEEE dd MMMM yyyy', { locale: de });
// "Sonntag 10 August 2025"

// Spanish
format(new Date(), 'EEEE dd MMMM yyyy', { locale: es });
// "domingo 10 agosto 2025"
```

## Common Patterns

### Date Validation
```tsx
import { isValid, parseISO, isAfter, isBefore } from 'date-fns';

const validateDate = (dateString: string) => {
  const date = parseISO(dateString);
  
  if (!isValid(date)) {
    return 'Invalid date';
  }
  
  if (isBefore(date, new Date())) {
    return 'Date must be in the future';
  }
  
  return null; // Valid
};
```

### Date Range Utilities
```tsx
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  addDays,
  subDays 
} from 'date-fns';

// This week
const thisWeek = {
  from: startOfWeek(new Date()),
  to: endOfWeek(new Date())
};

// This month
const thisMonth = {
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date())
};

// Last 7 days
const last7Days = {
  from: subDays(new Date(), 7),
  to: new Date()
};
```

### Business Days Calculation
```tsx
import { addBusinessDays, isWeekend } from 'date-fns';

// Add 5 business days
const deliveryDate = addBusinessDays(new Date(), 5);

// Check if weekend
if (isWeekend(date)) {
  console.log('Selected date is a weekend');
}
```

## Integration with Forms

### React Hook Form
```tsx
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@dainabase/ui';
import { format } from 'date-fns';

function Form() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder="Select birth date"
          />
        )}
      />
    </form>
  );
}
```

### Zod Validation
```tsx
import { z } from 'zod';
import { parseISO, isValid } from 'date-fns';

const dateSchema = z
  .string()
  .refine((val) => {
    const date = parseISO(val);
    return isValid(date);
  }, 'Invalid date format')
  .transform((val) => parseISO(val));

const formSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);
```

## Best Practices

### 1. Consistent Format
Always use the same date format throughout your application:
```tsx
// Define in constants
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';
```

### 2. Timezone Handling
```tsx
import { formatInTimeZone } from 'date-fns-tz';

// Display in specific timezone
formatInTimeZone(
  date,
  'America/New_York',
  'yyyy-MM-dd HH:mm:ss zzz'
);
```

### 3. Error Boundaries
```tsx
const safeDateFormat = (date: any, formatStr: string) => {
  try {
    if (!date) return '-';
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsed) ? format(parsed, formatStr) : '-';
  } catch {
    return '-';
  }
};
```

### 4. Performance
```tsx
import { memoize } from 'lodash';

// Memoize expensive date calculations
const getBusinessDays = memoize((start: Date, end: Date) => {
  // Complex calculation
  return businessDays;
});
```

## Migration Guide

### From Moment.js
```tsx
// Moment.js
moment().format('DD/MM/YYYY');
moment().add(7, 'days');
moment().startOf('month');

// date-fns
format(new Date(), 'dd/MM/yyyy');
addDays(new Date(), 7);
startOfMonth(new Date());
```

### From Native Date
```tsx
// Native
new Date().toLocaleDateString();
new Date().setDate(date.getDate() + 7);

// date-fns
format(new Date(), 'P');
addDays(new Date(), 7);
```

## Component API

### DatePicker Props
```tsx
interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
}
```

### DateRangePicker Props
```tsx
interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onChange?: (range: { from?: Date; to?: Date }) => void;
  format?: string;
  numberOfMonths?: number;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}
```

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '@dainabase/ui';

test('formats date correctly', async () => {
  const onChange = jest.fn();
  render(
    <DatePicker 
      value={new Date(2025, 7, 10)} 
      onChange={onChange}
      format="dd/MM/yyyy"
    />
  );
  
  expect(screen.getByDisplayValue('10/08/2025')).toBeInTheDocument();
});
```

## Resources

- [date-fns Documentation](https://date-fns.org/)
- [react-day-picker Documentation](https://react-day-picker.js.org/)
- [Date Format Patterns](https://date-fns.org/docs/format)
- [Timezone Support](https://github.com/marnusw/date-fns-tz)

---

**Last Updated**: 2025-08-10
**Maintained by**: Dainabase UI Team
