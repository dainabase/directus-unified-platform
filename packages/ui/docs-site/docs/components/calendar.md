---
id: calendar
title: Calendar
sidebar_position: 50
---

import { Calendar } from '@dainabase/ui';

# Calendar Component

A comprehensive calendar component for date selection, event display, and scheduling with support for multiple views, localization, and advanced interactions.

## Preview

```tsx live
function CalendarDemo() {
  const [date, setDate] = useState(new Date());
  
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
}
```

## Features

- 📅 **Multiple Views** - Month, week, day, and year views
- 🎯 **Date Selection** - Single, multiple, and range selection
- 🌍 **Internationalization** - Full i18n support with locale awareness
- 🎨 **Customizable** - Flexible theming and styling options
- 📱 **Responsive** - Mobile-friendly touch interactions
- ♿ **Accessible** - WCAG 2.1 compliant with ARIA support
- 🎭 **Event Support** - Display and manage calendar events
- 🔄 **Recurring Events** - Support for recurring patterns
- 📊 **Mini Calendar** - Compact view for sidebars
- ⚡ **Performance** - Optimized rendering with virtualization

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Calendar } from '@dainabase/ui';

function App() {
  const [date, setDate] = useState(new Date());
  
  return (
    <Calendar
      selected={date}
      onSelect={setDate}
    />
  );
}
```

## Examples

### 1. Event Calendar

```tsx
function EventCalendarExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  
  const events = [
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date(2025, 0, 15),
      time: '10:00 AM',
      color: 'blue',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: new Date(2025, 0, 20),
      time: 'EOD',
      color: 'red',
      type: 'deadline'
    },
    {
      id: '3',
      title: 'Conference',
      date: new Date(2025, 0, 25),
      time: '9:00 AM',
      duration: '3 days',
      color: 'green',
      type: 'event'
    },
    {
      id: '4',
      title: 'Birthday Party',
      date: new Date(2025, 0, 18),
      time: '6:00 PM',
      color: 'purple',
      type: 'personal'
    }
  ];
  
  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };
  
  const DayCell = ({ date }) => {
    const dayEvents = getEventsForDate(date);
    
    return (
      <div className="relative h-full min-h-[80px] p-1">
        <div className="text-sm font-medium mb-1">
          {date.getDate()}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map(event => (
            <div
              key={event.id}
              className={`text-xs px-1 py-0.5 rounded truncate bg-${event.color}-100 text-${event.color}-800`}
            >
              {event.time} - {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Event Calendar</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Day
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Month
          </button>
        </div>
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
        components={{
          DayContent: DayCell
        }}
      />
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">
          Events for {selectedDate.toLocaleDateString()}
        </h3>
        <div className="space-y-2">
          {getEventsForDate(selectedDate).map(event => (
            <div key={event.id} className="flex items-center space-x-3 p-2 bg-white rounded">
              <div className={`w-3 h-3 rounded-full bg-${event.color}-500`} />
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500">{event.time}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded bg-${event.color}-100 text-${event.color}-800`}>
                {event.type}
              </span>
            </div>
          ))}
          {getEventsForDate(selectedDate).length === 0 && (
            <p className="text-gray-500 text-sm">No events scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2. Date Range Picker

```tsx
function DateRangePickerExample() {
  const [range, setRange] = useState({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 0, 7)
  });
  
  const presets = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Last 7 days', getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { from: start, to: end };
    }},
    { label: 'Last 30 days', getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { from: start, to: end };
    }},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
    }},
    { label: 'Last Month', getValue: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0)
      };
    }}
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>
      
      <div className="flex space-x-6">
        <div className="flex-1">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </div>
        
        <div className="w-48">
          <h4 className="font-medium mb-3">Quick Select</h4>
          <div className="space-y-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setRange(preset.getValue())}
                className="w-full text-left px-3 py-2 text-sm border rounded hover:bg-gray-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {range?.from && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Selected range: {range.from.toLocaleDateString()} - {range.to?.toLocaleDateString() || '...'}
          </p>
          {range.to && (
            <p className="text-sm text-blue-600 mt-1">
              {Math.ceil((range.to - range.from) / (1000 * 60 * 60 * 24)) + 1} days selected
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3. Appointment Scheduler

```tsx
function AppointmentSchedulerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointments, setAppointments] = useState([
    { date: new Date(2025, 0, 15), time: '09:00', name: 'John Doe', service: 'Consultation' },
    { date: new Date(2025, 0, 15), time: '10:30', name: 'Jane Smith', service: 'Follow-up' },
    { date: new Date(2025, 0, 16), time: '14:00', name: 'Bob Johnson', service: 'Check-up' },
  ]);
  
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  
  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };
  
  const isTimeSlotBooked = (date, time) => {
    return appointments.some(apt => 
      apt.date.toDateString() === date.toDateString() && apt.time === time
    );
  };
  
  const bookAppointment = () => {
    if (selectedTime) {
      const name = prompt('Enter your name:');
      const service = prompt('Select service:');
      if (name && service) {
        setAppointments([...appointments, {
          date: selectedDate,
          time: selectedTime,
          name,
          service
        }]);
        setSelectedTime(null);
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
            className="rounded-md border"
          />
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">
            Available Times for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map(time => {
              const isBooked = isTimeSlotBooked(selectedDate, time);
              return (
                <button
                  key={time}
                  onClick={() => !isBooked && setSelectedTime(time)}
                  disabled={isBooked}
                  className={`px-3 py-2 rounded text-sm ${
                    isBooked 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : selectedTime === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  {time}
                  {isBooked && <span className="block text-xs">Booked</span>}
                </button>
              );
            })}
          </div>
          
          {selectedTime && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 mb-3">
                Selected: {selectedDate.toLocaleDateString()} at {selectedTime}
              </p>
              <button
                onClick={bookAppointment}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-3">Today's Appointments</h3>
        <div className="space-y-2">
          {getAppointmentsForDate(selectedDate).map((apt, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{apt.time}</span>
                <span className="mx-2">-</span>
                <span>{apt.name}</span>
              </div>
              <span className="text-sm text-gray-600">{apt.service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4. Multi-Month Calendar

```tsx
function MultiMonthCalendarExample() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [view, setView] = useState(3); // Number of months to show
  
  const holidays = [
    { date: new Date(2025, 0, 1), name: "New Year's Day" },
    { date: new Date(2025, 0, 20), name: "MLK Day" },
    { date: new Date(2025, 1, 17), name: "Presidents Day" },
    { date: new Date(2025, 2, 17), name: "St. Patrick's Day" },
  ];
  
  const isHoliday = (date) => {
    return holidays.some(h => h.date.toDateString() === date.toDateString());
  };
  
  const getHolidayName = (date) => {
    const holiday = holidays.find(h => h.date.toDateString() === date.toDateString());
    return holiday?.name;
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Multi-Month View</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView(1)}
            className={`px-3 py-1 rounded ${view === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            1 Month
          </button>
          <button
            onClick={() => setView(3)}
            className={`px-3 py-1 rounded ${view === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            3 Months
          </button>
          <button
            onClick={() => setView(6)}
            className={`px-3 py-1 rounded ${view === 6 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            6 Months
          </button>
        </div>
      </div>
      
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={setSelectedDates}
        numberOfMonths={view}
        className="rounded-md border"
        modifiers={{
          holiday: (date) => isHoliday(date)
        }}
        modifiersStyles={{
          holiday: { 
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontWeight: 'bold'
          }
        }}
        components={{
          DayContent: ({ date }) => (
            <div className="relative">
              <div>{date.getDate()}</div>
              {isHoliday(date) && (
                <div className="absolute -bottom-1 left-0 right-0 text-[8px] text-red-600 truncate px-1">
                  {getHolidayName(date)}
                </div>
              )}
            </div>
          )
        }}
      />
      
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Selected Dates ({selectedDates.length})</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {selectedDates.map((date, index) => (
              <div key={index} className="text-sm text-gray-600">
                {date.toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Upcoming Holidays</h3>
          <div className="space-y-2">
            {holidays.map((holiday, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-red-600 font-medium">{holiday.name}</span>
                <span className="text-gray-500">{holiday.date.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Task Calendar

```tsx
function TaskCalendarExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, date: new Date(2025, 0, 15), title: 'Submit report', priority: 'high', completed: false },
    { id: 2, date: new Date(2025, 0, 15), title: 'Team call', priority: 'medium', completed: true },
    { id: 3, date: new Date(2025, 0, 16), title: 'Code review', priority: 'medium', completed: false },
    { id: 4, date: new Date(2025, 0, 17), title: 'Deploy to production', priority: 'high', completed: false },
    { id: 5, date: new Date(2025, 0, 20), title: 'Client meeting', priority: 'high', completed: false },
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.date.toDateString() === date.toDateString()
    );
  };
  
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        date: selectedDate,
        title: newTask,
        priority,
        completed: false
      }]);
      setNewTask('');
    }
  };
  
  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Task Calendar</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasTask: (date) => getTasksForDate(date).length > 0
            }}
            modifiersStyles={{
              hasTask: { fontWeight: 'bold' }
            }}
            components={{
              DayContent: ({ date }) => {
                const dayTasks = getTasksForDate(date);
                return (
                  <div className="relative">
                    <div>{date.getDate()}</div>
                    {dayTasks.length > 0 && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full bg-${getPriorityColor(task.priority)}-500`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">
            Tasks for {selectedDate.toLocaleDateString()}
          </h3>
          
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {getTasksForDate(selectedDate).map(task => (
              <div key={task.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-4 w-4"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-800`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            {getTasksForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-sm">No tasks for this date</p>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Add New Task</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Task title..."
                className="w-full px-3 py-2 border rounded"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <div className="flex space-x-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. Birthday Calendar

```tsx
function BirthdayCalendarExample() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const birthdays = [
    { name: 'Alice Johnson', date: new Date(1990, 0, 15), avatar: '👩' },
    { name: 'Bob Smith', date: new Date(1985, 0, 22), avatar: '👨' },
    { name: 'Carol White', date: new Date(1992, 1, 5), avatar: '👩' },
    { name: 'David Brown', date: new Date(1988, 1, 14), avatar: '👨' },
    { name: 'Eve Davis', date: new Date(1995, 2, 10), avatar: '👩' },
    { name: 'Frank Wilson', date: new Date(1991, 2, 25), avatar: '👨' },
  ];
  
  const getBirthdayForDate = (date) => {
    return birthdays.find(b => 
      b.date.getMonth() === date.getMonth() && 
      b.date.getDate() === date.getDate()
    );
  };
  
  const getAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const upcomingBirthdays = birthdays
    .map(b => {
      const thisYear = new Date(new Date().getFullYear(), b.date.getMonth(), b.date.getDate());
      const daysUntil = Math.ceil((thisYear - new Date()) / (1000 * 60 * 60 * 24));
      return { ...b, daysUntil, thisYear };
    })
    .filter(b => b.daysUntil >= 0 && b.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🎂 Birthday Calendar</h2>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Calendar
            mode="single"
            selected={null}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => {
                const birthday = getBirthdayForDate(date);
                return (
                  <div className="relative">
                    <div className={birthday ? 'font-bold text-purple-600' : ''}>
                      {date.getDate()}
                    </div>
                    {birthday && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <span className="text-lg">{birthday.avatar}</span>
                      </div>
                    )}
                    {birthday && date.toDateString() === new Date().toDateString() && (
                      <div className="absolute -top-1 -right-1 text-xs">🎉</div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">Upcoming Birthdays</h3>
          <div className="space-y-3">
            {upcomingBirthdays.map((birthday, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-purple-50 rounded">
                <span className="text-2xl">{birthday.avatar}</span>
                <div className="flex-1">
                  <div className="font-medium">{birthday.name}</div>
                  <div className="text-sm text-gray-600">
                    {birthday.thisYear.toLocaleDateString()} 
                    <span className="ml-1 text-purple-600">
                      (turning {getAge(birthday.date) + 1})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {birthday.daysUntil === 0 ? 'Today!' : `In ${birthday.daysUntil} days`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 7. Availability Calendar

```tsx
function AvailabilityCalendarExample() {
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  
  const availabilityTypes = [
    { id: 'available', label: 'Available', color: 'green' },
    { id: 'busy', label: 'Busy', color: 'red' },
    { id: 'tentative', label: 'Tentative', color: 'yellow' },
    { id: 'away', label: 'Away', color: 'gray' },
  ];
  
  const setDateAvailability = (date, type) => {
    const dateStr = date.toDateString();
    setAvailability(prev => ({
      ...prev,
      [dateStr]: type
    }));
  };
  
  const getDateAvailability = (date) => {
    return availability[date.toDateString()] || 'available';
  };
  
  const bulkSetAvailability = (type) => {
    if (selectedDate) {
      setDateAvailability(selectedDate, type);
      setSelectedDate(null);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Set Your Availability</h2>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              available: (date) => getDateAvailability(date) === 'available',
              busy: (date) => getDateAvailability(date) === 'busy',
              tentative: (date) => getDateAvailability(date) === 'tentative',
              away: (date) => getDateAvailability(date) === 'away',
            }}
            modifiersStyles={{
              available: { backgroundColor: '#dcfce7', color: '#166534' },
              busy: { backgroundColor: '#fee2e2', color: '#991b1b' },
              tentative: { backgroundColor: '#fef3c7', color: '#92400e' },
              away: { backgroundColor: '#f3f4f6', color: '#6b7280' },
            }}
          />
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">Quick Set</h3>
          
          {selectedDate && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800 mb-2">
                Setting availability for:
              </p>
              <p className="font-medium">{selectedDate.toLocaleDateString()}</p>
            </div>
          )}
          
          <div className="space-y-2">
            {availabilityTypes.map(type => (
              <button
                key={type.id}
                onClick={() => bulkSetAvailability(type.id)}
                disabled={!selectedDate}
                className={`w-full text-left px-3 py-2 rounded border flex items-center space-x-2 ${
                  !selectedDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-${type.color}-500`} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Legend</h4>
            <div className="space-y-1 text-sm">
              {availabilityTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded bg-${type.color}-100 border border-${type.color}-500`} />
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setAvailability({})}
            className="mt-4 w-full py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 8. Habit Tracker Calendar

```tsx
function HabitTrackerExample() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Exercise', icon: '🏃', color: 'blue', dates: [] },
    { id: 2, name: 'Reading', icon: '📚', color: 'green', dates: [] },
    { id: 3, name: 'Meditation', icon: '🧘', color: 'purple', dates: [] },
    { id: 4, name: 'Water', icon: '💧', color: 'cyan', dates: [] },
  ]);
  
  const [selectedHabit, setSelectedHabit] = useState(habits[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const toggleHabitDate = (habit, date) => {
    const dateStr = date.toDateString();
    setHabits(habits.map(h => {
      if (h.id === habit.id) {
        const dates = h.dates.includes(dateStr)
          ? h.dates.filter(d => d !== dateStr)
          : [...h.dates, dateStr];
        return { ...h, dates };
      }
      return h;
    }));
  };
  
  const getStreak = (habit) => {
    const sortedDates = habit.dates
      .map(d => new Date(d))
      .sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sortedDates[0].getTime() !== today.getTime()) return 0;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i - 1] - sortedDates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    
    return streak;
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Habit Tracker</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        {habits.map(habit => (
          <button
            key={habit.id}
            onClick={() => setSelectedHabit(habit)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedHabit.id === habit.id
                ? `border-${habit.color}-500 bg-${habit.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{habit.icon}</div>
            <div className="font-medium">{habit.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              Streak: {getStreak(habit)} days
            </div>
            <div className="text-xs text-gray-500">
              Total: {habit.dates.length} days
            </div>
          </button>
        ))}
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">
          Track: {selectedHabit.name} {selectedHabit.icon}
        </h3>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              toggleHabitDate(selectedHabit, date);
              setSelectedDate(date);
            }
          }}
          className="rounded-md"
          modifiers={{
            completed: (date) => selectedHabit.dates.includes(date.toDateString())
          }}
          modifiersStyles={{
            completed: { 
              backgroundColor: `var(--${selectedHabit.color}-100)`,
              color: `var(--${selectedHabit.color}-900)`,
              fontWeight: 'bold'
            }
          }}
        />
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-gray-600">Current Streak</div>
            <div className="text-2xl font-bold text-green-600">
              {getStreak(selectedHabit)} days
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-gray-600">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {selectedHabit.dates.filter(d => {
                const date = new Date(d);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 9. Mini Calendar Widget

```tsx
function MiniCalendarWidget() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDate(selectedDate)}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-lg shadow-lg border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setIsOpen(false);
            }}
            className="p-3"
            classNames={{
              months: "space-y-0",
              month: "space-y-2",
              caption: "flex justify-center pt-1 relative items-center text-sm",
              caption_label: "font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-6 w-6 bg-transparent p-0 hover:bg-gray-100 rounded",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.7rem]",
              row: "flex w-full mt-1",
              cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: "h-8 w-8 p-0 font-normal hover:bg-gray-100 rounded",
              day_selected: "bg-blue-600 text-white hover:bg-blue-700",
              day_today: "bg-gray-100 font-semibold",
              day_outside: "text-gray-300",
              day_disabled: "text-gray-300",
            }}
          />
        </div>
      )}
    </div>
  );
}
```

### 10. Year View Calendar

```tsx
function YearViewCalendarExample() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const isDateSelected = (date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };
  
  const toggleDate = (date) => {
    if (isDateSelected(date)) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Year {selectedYear}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={() => setSelectedYear(new Date().getFullYear())}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {months.map((month, index) => (
          <div key={month} className="border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-2 text-center">{month}</h3>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates}
              month={new Date(selectedYear, index)}
              className="scale-75 origin-top"
              classNames={{
                months: "space-y-0",
                month: "space-y-1",
                caption: "hidden",
                table: "w-full",
                head_row: "flex",
                head_cell: "text-[0.6rem] w-6 font-normal",
                row: "flex w-full",
                cell: "text-[0.65rem] w-6 h-6 flex items-center justify-center",
                day: "h-5 w-5 p-0",
                day_selected: "bg-blue-600 text-white",
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {selectedDates.length} dates selected across {selectedYear}
        </p>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'multiple' \| 'range'` | `'single'` | Selection mode |
| `selected` | `Date \| Date[] \| DateRange` | `undefined` | Selected date(s) |
| `onSelect` | `(date: Date \| Date[] \| DateRange) => void` | `undefined` | Selection handler |
| `month` | `Date` | `current month` | Displayed month |
| `onMonthChange` | `(month: Date) => void` | `undefined` | Month change handler |
| `numberOfMonths` | `number` | `1` | Number of months to display |
| `disabled` | `Matcher \| Matcher[]` | `undefined` | Disabled dates |
| `modifiers` | `DayModifiers` | `undefined` | Custom day modifiers |
| `modifiersStyles` | `ModifiersStyles` | `undefined` | Styles for modifiers |
| `className` | `string` | `undefined` | Additional CSS classes |
| `classNames` | `ClassNames` | `undefined` | Custom class names |
| `components` | `Components` | `undefined` | Custom components |
| `locale` | `Locale` | `en-US` | Locale for internationalization |
| `weekStartsOn` | `0-6` | `0` | First day of week |
| `showOutsideDays` | `boolean` | `true` | Show days outside month |
| `showWeekNumber` | `boolean` | `false` | Show week numbers |

## Accessibility

The Calendar component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support
  - Arrow keys for date navigation
  - Tab/Shift+Tab for focus management
  - Enter/Space for selection
  - Page Up/Down for month navigation
- **Screen Reader Support**: Complete ARIA implementation
- **Focus Management**: Clear focus indicators
- **ARIA Attributes**:
  - `role="grid"` for calendar
  - `aria-label` for all controls
  - `aria-selected` for selections
  - `aria-disabled` for disabled dates

## Best Practices

### Do's ✅

- Provide clear date format examples
- Show selected dates clearly
- Include today's date indicator
- Support keyboard navigation
- Provide month/year navigation
- Consider mobile touch targets
- Use consistent date formats
- Include clear labels
- Test with screen readers
- Handle timezone properly

### Don'ts ❌

- Don't make calendar too small
- Don't forget disabled date handling
- Don't ignore locale preferences
- Don't use ambiguous date formats
- Don't forget loading states
- Don't make selection unclear
- Don't forget min/max dates
- Don't ignore accessibility
- Don't forget responsive design
- Don't use hard-coded strings

## Use Cases

1. **Date Pickers** - Form date selection
2. **Event Calendars** - Display events
3. **Scheduling** - Appointment booking
4. **Date Ranges** - Period selection
5. **Availability** - Show/set availability
6. **Task Management** - Deadline tracking
7. **Habit Tracking** - Daily habit logs
8. **Birthdays** - Birthday reminders
9. **Holiday Calendar** - Holiday display
10. **Booking Systems** - Reservation calendars

## Related Components

- [**DatePicker**](./date-picker) - Date picker input
- [**DateRangePicker**](./date-range-picker) - Date range selection
- [**TimePicker**](./time-picker) - Time selection
- [**Scheduler**](./scheduler) - Advanced scheduling
