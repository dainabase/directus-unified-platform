---
id: date-picker
title: Date Picker
sidebar_position: 36
---

import { DatePicker } from '@dainabase/ui';

The DatePicker component provides an intuitive calendar interface for selecting dates with support for various formats, localization, date ranges, and advanced validation. Essential for forms, booking systems, and any application requiring date input.

## Preview

```jsx live
function DatePickerDemo() {
  const [date, setDate] = useState(new Date());
  
  return (
    <div className="space-y-4 w-full max-w-sm">
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder="Select a date"
      />
      <p className="text-sm text-gray-600">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
}
```

## Features

- 📅 **Calendar Interface** - Intuitive month/year navigation
- 🌍 **Internationalization** - Full i18n support with locale formatting
- 🎨 **Custom Styling** - Fully themeable calendar components
- 📝 **Manual Input** - Type dates directly with validation
- 🚫 **Date Restrictions** - Min/max dates and disabled dates
- 🎯 **Smart Navigation** - Keyboard shortcuts and quick navigation
- 📱 **Mobile Optimized** - Native date picker on mobile devices
- ♿ **Accessible** - Full ARIA support and screen reader friendly
- 🔄 **Format Flexibility** - Multiple date format support
- ⏰ **Time Support** - Optional time picker integration

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { DatePicker } from '@dainabase/ui';

function App() {
  const [date, setDate] = useState(null);
  
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Pick a date"
    />
  );
}
```

## Examples

### With Min and Max Dates

```jsx
function DateRangeExample() {
  const [date, setDate] = useState(null);
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  
  return (
    <div className="space-y-4">
      <DatePicker
        value={date}
        onChange={setDate}
        minDate={today}
        maxDate={nextMonth}
        placeholder="Select within next 30 days"
      />
      <p className="text-sm text-gray-500">
        You can only select dates between today and next month
      </p>
    </div>
  );
}
```

### Disabled Specific Dates

```jsx
function DisabledDatesExample() {
  const [date, setDate] = useState(null);
  
  // Disable weekends
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  
  // Disable specific dates
  const disabledDates = [
    new Date(2025, 7, 15), // August 15
    new Date(2025, 7, 20), // August 20
  ];
  
  const isDateDisabled = (date) => {
    return isWeekend(date) || 
           disabledDates.some(d => 
             d.toDateString() === date.toDateString()
           );
  };
  
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      isDateDisabled={isDateDisabled}
      placeholder="Weekdays only"
    />
  );
}
```

### With Custom Format

```jsx
function CustomFormatExample() {
  const [date, setDate] = useState(null);
  
  return (
    <div className="space-y-4">
      <DatePicker
        value={date}
        onChange={setDate}
        dateFormat="dd/MM/yyyy"
        placeholder="DD/MM/YYYY"
      />
      <DatePicker
        value={date}
        onChange={setDate}
        dateFormat="MMM dd, yyyy"
        placeholder="Month DD, YYYY"
      />
      <DatePicker
        value={date}
        onChange={setDate}
        dateFormat="yyyy-MM-dd"
        placeholder="YYYY-MM-DD"
      />
    </div>
  );
}
```

### With Time Selection

```jsx
function DateTimePickerExample() {
  const [dateTime, setDateTime] = useState(null);
  
  return (
    <div className="space-y-4">
      <DatePicker
        value={dateTime}
        onChange={setDateTime}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholder="Select date and time"
      />
      {dateTime && (
        <p className="text-sm">
          Selected: {dateTime.toLocaleString()}
        </p>
      )}
    </div>
  );
}
```

### Inline Calendar

```jsx
function InlineCalendarExample() {
  const [date, setDate] = useState(new Date());
  
  return (
    <div className="flex space-x-8">
      <DatePicker
        value={date}
        onChange={setDate}
        inline
        showMonthYearPicker={false}
      />
      <div className="space-y-2">
        <h3 className="font-semibold">Selected Date:</h3>
        <p>{date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </div>
    </div>
  );
}
```

### Multi-Language Support

```jsx
function LocalizationExample() {
  const [date, setDate] = useState(null);
  const [locale, setLocale] = useState('en-US');
  
  const locales = {
    'en-US': 'English',
    'es-ES': 'Español',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'ja-JP': '日本語'
  };
  
  return (
    <div className="space-y-4">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        {Object.entries(locales).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      
      <DatePicker
        value={date}
        onChange={setDate}
        locale={locale}
        placeholder="Select a date"
      />
      
      {date && (
        <p className="text-sm">
          {date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      )}
    </div>
  );
}
```

### Booking Calendar

```jsx
function BookingCalendarExample() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const today = new Date();
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold">Book Your Stay</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Check-in Date
          </label>
          <DatePicker
            value={checkIn}
            onChange={setCheckIn}
            minDate={today}
            maxDate={checkOut}
            placeholder="Select check-in"
            highlightToday
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Check-out Date
          </label>
          <DatePicker
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn || today}
            placeholder="Select check-out"
            highlightToday
          />
        </div>
      </div>
      
      {checkIn && checkOut && (
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm">
            <strong>Duration:</strong> {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} nights
          </p>
          <p className="text-sm">
            <strong>Total:</strong> ${Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) * 150}
          </p>
        </div>
      )}
      
      <button
        disabled={!checkIn || !checkOut}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Book Now
      </button>
    </div>
  );
}
```

### Birthday Picker

```jsx
function BirthdayPickerExample() {
  const [birthday, setBirthday] = useState(null);
  const today = new Date();
  const minAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const maxAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  
  const calculateAge = (birthDate) => {
    const ageDiff = today - birthDate;
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Date of Birth (18+ only)
        </label>
        <DatePicker
          value={birthday}
          onChange={setBirthday}
          minDate={minAge}
          maxDate={maxAge}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          placeholder="MM/DD/YYYY"
        />
      </div>
      
      {birthday && (
        <div className="p-3 bg-green-50 rounded">
          <p className="text-sm text-green-800">
            Age: {calculateAge(birthday)} years old
          </p>
        </div>
      )}
    </div>
  );
}
```

### Appointment Scheduler

```jsx
function AppointmentSchedulerExample() {
  const [appointment, setAppointment] = useState(null);
  
  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ];
  
  // Only allow weekdays
  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Schedule an Appointment</h3>
      
      <DatePicker
        value={appointment}
        onChange={setAppointment}
        minDate={new Date()}
        filterDate={isWeekday}
        showTimeSelect
        showTimeSelectOnly={false}
        includeTimes={timeSlots.map(time => {
          const [hours, minutes] = time.split(':');
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes), 0);
          return date;
        })}
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholder="Select date and time"
      />
      
      {appointment && (
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm font-medium">Appointment confirmed for:</p>
          <p className="text-lg">{appointment.toLocaleString()}</p>
        </div>
      )}
      
      <button
        disabled={!appointment}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        Confirm Appointment
      </button>
    </div>
  );
}
```

### With Custom Day Rendering

```jsx
function CustomDayRenderExample() {
  const [date, setDate] = useState(null);
  
  const events = {
    '2025-08-15': { type: 'holiday', name: 'Independence Day' },
    '2025-08-20': { type: 'meeting', name: 'Team Meeting' },
    '2025-08-25': { type: 'deadline', name: 'Project Deadline' }
  };
  
  const renderDayContents = (day, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const event = events[dateStr];
    
    if (event) {
      return (
        <div className="relative">
          <span>{day}</span>
          <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
            event.type === 'holiday' ? 'bg-green-500' :
            event.type === 'meeting' ? 'bg-blue-500' :
            'bg-red-500'
          }`} />
        </div>
      );
    }
    return day;
  };
  
  return (
    <div className="space-y-4">
      <DatePicker
        value={date}
        onChange={setDate}
        renderDayContents={renderDayContents}
        placeholder="Select a date"
      />
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Holiday</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Meeting</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span>Deadline</span>
        </div>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | `null` | Selected date value |
| `onChange` | `(date: Date \| null) => void` | `undefined` | Callback when date changes |
| `placeholder` | `string` | `'Select date'` | Placeholder text |
| `dateFormat` | `string` | `'MM/dd/yyyy'` | Date format string |
| `locale` | `string` | `'en-US'` | Locale for internationalization |
| `minDate` | `Date` | `undefined` | Minimum selectable date |
| `maxDate` | `Date` | `undefined` | Maximum selectable date |
| `filterDate` | `(date: Date) => boolean` | `undefined` | Function to filter selectable dates |
| `isDateDisabled` | `(date: Date) => boolean` | `undefined` | Function to disable specific dates |
| `highlightDates` | `Date[]` | `[]` | Dates to highlight |
| `includeDates` | `Date[]` | `undefined` | Only allow these dates |
| `excludeDates` | `Date[]` | `[]` | Dates to exclude |
| `inline` | `boolean` | `false` | Show inline calendar |
| `showTimeSelect` | `boolean` | `false` | Enable time selection |
| `showTimeSelectOnly` | `boolean` | `false` | Show only time picker |
| `timeFormat` | `string` | `'HH:mm'` | Time format string |
| `timeIntervals` | `number` | `30` | Time intervals in minutes |
| `includeTimes` | `Date[]` | `undefined` | Specific times to include |
| `showMonthDropdown` | `boolean` | `false` | Show month dropdown |
| `showYearDropdown` | `boolean` | `false` | Show year dropdown |
| `dropdownMode` | `'scroll' \| 'select'` | `'scroll'` | Dropdown mode |
| `showWeekNumbers` | `boolean` | `false` | Show week numbers |
| `calendarStartDay` | `number` | `0` | First day of week (0=Sunday) |
| `disabled` | `boolean` | `false` | Disable the date picker |
| `readOnly` | `boolean` | `false` | Make read-only |
| `required` | `boolean` | `false` | Mark as required |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `clearable` | `boolean` | `true` | Show clear button |
| `todayButton` | `string` | `undefined` | Text for today button |
| `renderDayContents` | `(day: number, date: Date) => ReactNode` | `undefined` | Custom day renderer |
| `onCalendarOpen` | `() => void` | `undefined` | Calendar open callback |
| `onCalendarClose` | `() => void` | `undefined` | Calendar close callback |
| `className` | `string` | `''` | Additional CSS classes |
| `calendarClassName` | `string` | `''` | Calendar container classes |
| `popperPlacement` | `string` | `'bottom-start'` | Popper placement |
| `popperModifiers` | `object` | `{}` | Popper modifiers |

## Accessibility

The DatePicker component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, and Escape
- **Screen Readers**: Proper ARIA labels and live regions
- **Focus Management**: Logical focus flow and focus trapping
- **Date Announcements**: Selected dates announced to screen readers
- **Clear Instructions**: Helper text for keyboard navigation
- **High Contrast**: Supports high contrast mode
- **Mobile Support**: Falls back to native date input on mobile
- **Labels**: Proper label association

```jsx
// Accessible implementation
<div>
  <label htmlFor="appointment-date">
    Select Appointment Date
  </label>
  <DatePicker
    id="appointment-date"
    aria-label="Appointment date"
    aria-describedby="date-help"
    aria-required="true"
    required
  />
  <span id="date-help" className="text-sm text-gray-600">
    Use arrow keys to navigate calendar
  </span>
</div>
```

## Best Practices

### Do's ✅

- **Do** provide clear date format hints
- **Do** validate dates on both client and server
- **Do** use appropriate min/max date ranges
- **Do** localize for international users
- **Do** provide keyboard shortcuts
- **Do** show clear visual feedback
- **Do** handle timezone considerations
- **Do** test with screen readers

### Don'ts ❌

- **Don't** use for time-only selection
- **Don't** disable too many dates
- **Don't** hide important dates
- **Don't** use ambiguous date formats
- **Don't** forget mobile experience
- **Don't** ignore locale preferences
- **Don't** make calendar too small
- **Don't** forget to handle null dates

## Use Cases

1. **Booking Systems**: Hotels, flights, appointments
2. **Event Planning**: Event dates, deadlines, schedules
3. **Forms**: Birth dates, expiry dates, start/end dates
4. **Filters**: Date range filters for data
5. **Scheduling**: Meeting planners, availability calendars
6. **Project Management**: Milestones, due dates, timelines
7. **Financial**: Transaction dates, billing periods
8. **Content Management**: Publish dates, embargo dates

## Related Components

- [Date Range Picker](./date-range-picker) - Select date ranges
- [Input](./input) - Text input fields
- [Select](./select) - Dropdown selection
- [Form](./form) - Form wrapper
- [Popover](./popover) - Popover container
- [Calendar](./calendar) - Standalone calendar