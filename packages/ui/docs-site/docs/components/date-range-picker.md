---
id: date-range-picker
title: Date Range Picker
sidebar_position: 37
---

import { DateRangePicker } from '@dainabase/ui';

The DateRangePicker component enables users to select a range of dates with an intuitive dual-calendar interface. Perfect for booking systems, analytics dashboards, filters, and any application requiring date range selection.

## Preview

```jsx live
function DateRangePickerDemo() {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  return (
    <div className="space-y-4 w-full max-w-md">
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        placeholder="Select date range"
      />
      <p className="text-sm text-gray-600">
        {dateRange.startDate && dateRange.endDate
          ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
          : 'No range selected'}
      </p>
    </div>
  );
}
```

## Features

- 📅 **Dual Calendar View** - Side-by-side month navigation
- 🎯 **Smart Selection** - Intuitive click-and-drag or two-click selection
- 📍 **Preset Ranges** - Quick selection for common date ranges
- 🔄 **Flexible Input** - Manual text input with validation
- 🌍 **Internationalization** - Full locale and format support
- 📱 **Responsive Design** - Adapts to mobile and desktop views
- ♿ **Accessibility** - Complete keyboard navigation and ARIA support
- 🎨 **Customizable** - Themed calendars and selection styles
- 📊 **Range Validation** - Min/max dates and custom validation rules
- ⚡ **Performance** - Optimized rendering for large date ranges

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { DateRangePicker } from '@dainabase/ui';

function App() {
  const [range, setRange] = useState({
    startDate: null,
    endDate: null
  });
  
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      placeholder="Select dates"
    />
  );
}
```

## Examples

### With Preset Ranges

```jsx
function PresetRangesExample() {
  const [range, setRange] = useState({
    startDate: null,
    endDate: null
  });
  
  const presets = [
    {
      label: 'Today',
      getValue: () => {
        const today = new Date();
        return { startDate: today, endDate: today };
      }
    },
    {
      label: 'Last 7 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { startDate: start, endDate: end };
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { startDate: start, endDate: end };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: start, endDate: end };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: start, endDate: end };
      }
    }
  ];
  
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      presets={presets}
      showPresets
      placeholder="Select or choose preset"
    />
  );
}
```

### Booking Calendar with Restrictions

```jsx
function BookingCalendarExample() {
  const [booking, setBooking] = useState({
    startDate: null,
    endDate: null
  });
  
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
  
  // Minimum 2 nights, maximum 14 nights
  const validateRange = (range) => {
    if (!range.startDate || !range.endDate) return true;
    const nights = Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24));
    return nights >= 2 && nights <= 14;
  };
  
  // Block certain dates (e.g., already booked)
  const blockedDates = [
    new Date(2025, 7, 20),
    new Date(2025, 7, 21),
    new Date(2025, 7, 22),
  ];
  
  const isDateBlocked = (date) => {
    return blockedDates.some(blocked => 
      blocked.toDateString() === date.toDateString()
    );
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold">Select Your Stay</h3>
      
      <DateRangePicker
        value={booking}
        onChange={setBooking}
        minDate={today}
        maxDate={maxDate}
        isDateBlocked={isDateBlocked}
        validateRange={validateRange}
        placeholder="Check-in → Check-out"
        minNights={2}
        maxNights={14}
      />
      
      {booking.startDate && booking.endDate && (
        <div className="space-y-2">
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex justify-between text-sm">
              <span>Check-in:</span>
              <span>{booking.startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Check-out:</span>
              <span>{booking.endDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
              <span>Total Nights:</span>
              <span>{Math.ceil((booking.endDate - booking.startDate) / (1000 * 60 * 60 * 24))}</span>
            </div>
          </div>
          
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Continue to Payment
          </button>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        * Minimum 2 nights, maximum 14 nights
      </p>
    </div>
  );
}
```

### Analytics Date Filter

```jsx
function AnalyticsFilterExample() {
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  
  const [comparison, setComparison] = useState(false);
  const [compareRange, setCompareRange] = useState({
    startDate: null,
    endDate: null
  });
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Date Range</h4>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={comparison}
            onChange={(e) => setComparison(e.target.checked)}
          />
          <span className="text-sm">Compare to</span>
        </label>
      </div>
      
      <DateRangePicker
        value={dateFilter}
        onChange={setDateFilter}
        maxDate={new Date()}
        showPresets
        presetPosition="left"
        className="w-full"
      />
      
      {comparison && (
        <DateRangePicker
          value={compareRange}
          onChange={setCompareRange}
          maxDate={new Date()}
          placeholder="Select comparison period"
          variant="secondary"
          className="w-full"
        />
      )}
      
      <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
        Apply Filter
      </button>
    </div>
  );
}
```

### Inline Range Calendar

```jsx
function InlineRangeExample() {
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
  });
  
  return (
    <div className="flex space-x-8">
      <DateRangePicker
        value={range}
        onChange={setRange}
        inline
        numberOfMonths={2}
      />
      
      <div className="space-y-4">
        <h3 className="font-semibold">Selected Range</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Start:</strong> {range.startDate?.toLocaleDateString()}</p>
          <p><strong>End:</strong> {range.endDate?.toLocaleDateString()}</p>
          <p><strong>Duration:</strong> {
            range.startDate && range.endDate
              ? Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24)) + 1
              : 0
          } days</p>
        </div>
      </div>
    </div>
  );
}
```

### Multi-Language Support

```jsx
function LocalizedRangePickerExample() {
  const [range, setRange] = useState({
    startDate: null,
    endDate: null
  });
  const [locale, setLocale] = useState('en-US');
  
  const locales = {
    'en-US': { name: 'English', format: 'MM/dd/yyyy' },
    'es-ES': { name: 'Español', format: 'dd/MM/yyyy' },
    'fr-FR': { name: 'Français', format: 'dd/MM/yyyy' },
    'de-DE': { name: 'Deutsch', format: 'dd.MM.yyyy' },
    'ja-JP': { name: '日本語', format: 'yyyy/MM/dd' }
  };
  
  return (
    <div className="space-y-4">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        {Object.entries(locales).map(([code, { name }]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      
      <DateRangePicker
        value={range}
        onChange={setRange}
        locale={locale}
        dateFormat={locales[locale].format}
        placeholder={`Select dates (${locales[locale].format})`}
      />
      
      {range.startDate && range.endDate && (
        <p className="text-sm">
          {range.startDate.toLocaleDateString(locale)} - {range.endDate.toLocaleDateString(locale)}
        </p>
      )}
    </div>
  );
}
```

### Fiscal Quarter Selection

```jsx
function FiscalQuarterExample() {
  const [range, setRange] = useState({
    startDate: null,
    endDate: null
  });
  
  const fiscalQuarters = {
    Q1: { start: [0, 1], end: [2, 31] },  // Jan-Mar
    Q2: { start: [3, 1], end: [5, 30] },  // Apr-Jun
    Q3: { start: [6, 1], end: [8, 30] },  // Jul-Sep
    Q4: { start: [9, 1], end: [11, 31] }  // Oct-Dec
  };
  
  const selectQuarter = (quarter, year) => {
    const q = fiscalQuarters[quarter];
    const startDate = new Date(year, q.start[0], q.start[1]);
    const endDate = new Date(year, q.end[0], q.end[1]);
    setRange({ startDate, endDate });
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {Object.keys(fiscalQuarters).map(quarter => (
          <button
            key={quarter}
            onClick={() => selectQuarter(quarter, currentYear)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {quarter} {currentYear}
          </button>
        ))}
      </div>
      
      <DateRangePicker
        value={range}
        onChange={setRange}
        showQuarterButtons
        placeholder="Select fiscal quarter"
      />
    </div>
  );
}
```

### Event Planning Timeline

```jsx
function EventTimelineExample() {
  const [eventDates, setEventDates] = useState({
    startDate: null,
    endDate: null
  });
  
  const [phases, setPhases] = useState([]);
  
  const calculatePhases = (range) => {
    if (!range.startDate || !range.endDate) return [];
    
    const totalDays = Math.ceil((range.endDate - range.startDate) / (1000 * 60 * 60 * 24));
    const phases = [];
    
    // Planning phase (20% of time)
    const planningDays = Math.ceil(totalDays * 0.2);
    const planningEnd = new Date(range.startDate);
    planningEnd.setDate(planningEnd.getDate() + planningDays);
    phases.push({
      name: 'Planning',
      start: range.startDate,
      end: planningEnd,
      color: 'bg-blue-200'
    });
    
    // Preparation phase (60% of time)
    const prepStart = new Date(planningEnd);
    prepStart.setDate(prepStart.getDate() + 1);
    const prepDays = Math.ceil(totalDays * 0.6);
    const prepEnd = new Date(prepStart);
    prepEnd.setDate(prepEnd.getDate() + prepDays);
    phases.push({
      name: 'Preparation',
      start: prepStart,
      end: prepEnd,
      color: 'bg-yellow-200'
    });
    
    // Execution phase (remaining time)
    const execStart = new Date(prepEnd);
    execStart.setDate(execStart.getDate() + 1);
    phases.push({
      name: 'Execution',
      start: execStart,
      end: range.endDate,
      color: 'bg-green-200'
    });
    
    return phases;
  };
  
  useEffect(() => {
    setPhases(calculatePhases(eventDates));
  }, [eventDates]);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Event Timeline</h3>
        <DateRangePicker
          value={eventDates}
          onChange={setEventDates}
          minDate={new Date()}
          placeholder="Select event start and end dates"
        />
      </div>
      
      {phases.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Automated Phase Breakdown</h4>
          {phases.map((phase, index) => (
            <div key={index} className={`p-3 rounded ${phase.color}`}>
              <div className="font-medium">{phase.name}</div>
              <div className="text-sm">
                {phase.start.toLocaleDateString()} - {phase.end.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Leave Request Form

```jsx
function LeaveRequestExample() {
  const [leaveRange, setLeaveRange] = useState({
    startDate: null,
    endDate: null
  });
  const [leaveType, setLeaveType] = useState('vacation');
  
  // Calculate business days
  const calculateBusinessDays = (start, end) => {
    if (!start || !end) return 0;
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };
  
  const businessDays = calculateBusinessDays(leaveRange.startDate, leaveRange.endDate);
  
  return (
    <div className="max-w-md p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Request Time Off</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Dates</label>
          <DateRangePicker
            value={leaveRange}
            onChange={setLeaveRange}
            minDate={new Date()}
            filterDate={(date) => {
              const day = date.getDay();
              return day !== 0 && day !== 6; // Weekdays only
            }}
            placeholder="Start date → End date"
          />
        </div>
        
        {businessDays > 0 && (
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm">
              <strong>Total business days:</strong> {businessDays}
            </p>
            <p className="text-sm">
              <strong>Remaining balance:</strong> {21 - businessDays} days
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Reason</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            rows={3}
            placeholder="Optional reason..."
          />
        </div>
        
        <button
          disabled={!leaveRange.startDate || !leaveRange.endDate}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
```

### Report Generation Period

```jsx
function ReportPeriodExample() {
  const [reportPeriod, setReportPeriod] = useState({
    startDate: null,
    endDate: null
  });
  const [reportType, setReportType] = useState('monthly');
  
  const generateReport = () => {
    console.log('Generating report for:', reportPeriod);
  };
  
  const quickPeriods = {
    'This Week': () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      const end = new Date(now);
      end.setDate(now.getDate() + (6 - dayOfWeek));
      return { startDate: start, endDate: end };
    },
    'Last Week': () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek - 7);
      const end = new Date(now);
      end.setDate(now.getDate() - dayOfWeek - 1);
      return { startDate: start, endDate: end };
    },
    'This Month': () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: start, endDate: end };
    },
    'Last Month': () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start, endDate: end };
    },
    'Year to Date': () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: start, endDate: now };
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Generate Report</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Quick Select</label>
          <select
            onChange={(e) => {
              const period = quickPeriods[e.target.value];
              if (period) setReportPeriod(period());
            }}
            className="w-full px-3 py-2 border rounded"
            defaultValue=""
          >
            <option value="">Choose period...</option>
            {Object.keys(quickPeriods).map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
      </div>
      
      <DateRangePicker
        value={reportPeriod}
        onChange={setReportPeriod}
        maxDate={new Date()}
        placeholder="Select report period"
      />
      
      {reportPeriod.startDate && reportPeriod.endDate && (
        <div className="p-3 bg-gray-50 rounded text-sm">
          <p>Report will include data from:</p>
          <p className="font-medium">
            {reportPeriod.startDate.toLocaleDateString()} to {reportPeriod.endDate.toLocaleDateString()}
          </p>
        </div>
      )}
      
      <button
        onClick={generateReport}
        disabled={!reportPeriod.startDate || !reportPeriod.endDate}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Generate Report
      </button>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `{startDate: Date, endDate: Date}` | `{startDate: null, endDate: null}` | Selected date range |
| `onChange` | `(range: DateRange) => void` | `undefined` | Callback when range changes |
| `placeholder` | `string` | `'Select date range'` | Placeholder text |
| `dateFormat` | `string` | `'MM/dd/yyyy'` | Date format string |
| `locale` | `string` | `'en-US'` | Locale for internationalization |
| `minDate` | `Date` | `undefined` | Minimum selectable date |
| `maxDate` | `Date` | `undefined` | Maximum selectable date |
| `minNights` | `number` | `undefined` | Minimum nights for selection |
| `maxNights` | `number` | `undefined` | Maximum nights for selection |
| `numberOfMonths` | `number` | `2` | Number of months to display |
| `presets` | `Array<{label: string, getValue: () => DateRange}>` | `[]` | Preset range options |
| `showPresets` | `boolean` | `false` | Show preset ranges |
| `presetPosition` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Position of presets |
| `filterDate` | `(date: Date) => boolean` | `undefined` | Function to filter dates |
| `isDateBlocked` | `(date: Date) => boolean` | `undefined` | Function to block dates |
| `validateRange` | `(range: DateRange) => boolean` | `undefined` | Validate selected range |
| `inline` | `boolean` | `false` | Show inline calendars |
| `separator` | `string` | `' - '` | Text between date inputs |
| `disabled` | `boolean` | `false` | Disable the picker |
| `readOnly` | `boolean` | `false` | Make read-only |
| `required` | `boolean` | `false` | Mark as required |
| `clearable` | `boolean` | `true` | Show clear button |
| `showCalendarIcon` | `boolean` | `true` | Show calendar icon |
| `calendarClassName` | `string` | `''` | Calendar container classes |
| `inputClassName` | `string` | `''` | Input field classes |
| `className` | `string` | `''` | Container classes |
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `onCalendarOpen` | `() => void` | `undefined` | Calendar open callback |
| `onCalendarClose` | `() => void` | `undefined` | Calendar close callback |
| `highlightToday` | `boolean` | `true` | Highlight today's date |
| `showWeekNumbers` | `boolean` | `false` | Show week numbers |
| `firstDayOfWeek` | `number` | `0` | First day of week (0=Sunday) |

## Accessibility

The DateRangePicker component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Tab between inputs, arrow keys in calendar
- **Screen Readers**: Proper ARIA labels and announcements
- **Focus Management**: Logical focus flow between start and end dates
- **Range Announcements**: Selected range announced to screen readers
- **Clear Instructions**: Keyboard shortcuts explained
- **Error States**: Clear error messages for invalid ranges
- **Mobile Support**: Touch-optimized interactions
- **High Contrast**: Supports high contrast themes

```jsx
// Accessible implementation
<div role="group" aria-labelledby="date-range-label">
  <label id="date-range-label">
    Select Travel Dates
  </label>
  <DateRangePicker
    aria-label="Travel date range"
    aria-describedby="range-help"
    aria-required="true"
    required
  />
  <span id="range-help" className="sr-only">
    Select your check-in date, then check-out date
  </span>
</div>
```

## Best Practices

### Do's ✅

- **Do** provide clear labels for date ranges
- **Do** show visual feedback during selection
- **Do** validate ranges on both client and server
- **Do** provide preset options for common ranges
- **Do** handle timezone differences appropriately
- **Do** show the selected range clearly
- **Do** allow keyboard-only selection
- **Do** test with various locales

### Don'ts ❌

- **Don't** allow invalid date ranges
- **Don't** hide important date restrictions
- **Don't** use ambiguous date formats
- **Don't** forget mobile optimization
- **Don't** make calendars too small to interact with
- **Don't** ignore accessibility requirements
- **Don't** forget to handle edge cases
- **Don't** use for single date selection

## Use Cases

1. **Travel & Hospitality**: Hotel bookings, flight searches, car rentals
2. **Analytics & Reports**: Date range filters, custom report periods
3. **Project Management**: Sprint planning, milestone ranges, timelines
4. **HR Systems**: Leave requests, timesheet periods, scheduling
5. **E-commerce**: Delivery windows, promotional periods, sales events
6. **Financial**: Statement periods, transaction filters, fiscal quarters
7. **Event Management**: Multi-day events, registration periods
8. **Content Management**: Publication schedules, campaign durations

## Related Components

- [Date Picker](./date-picker) - Single date selection
- [Calendar](./calendar) - Standalone calendar view
- [Input](./input) - Text input fields
- [Popover](./popover) - Popover container
- [Button](./button) - Action buttons
- [Select](./select) - Dropdown selections