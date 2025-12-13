import React from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'

interface Event {
  id: string
  title: string
  type: 'meeting' | 'deadline' | 'reminder'
  time: string
  location?: string
  attendees?: number
  color: string
}

export const CalendarWidget: React.FC = () => {
  const today = startOfDay(new Date())
  
  // Mock events
  const events: Event[] = [
    {
      id: '1',
      title: 'Team Standup',
      type: 'meeting',
      time: '09:00',
      location: 'Zoom',
      attendees: 8,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Client Review',
      type: 'meeting',
      time: '14:00',
      location: 'Conference Room A',
      attendees: 4,
      color: 'bg-purple-500'
    },
    {
      id: '3',
      title: 'Project Deadline',
      type: 'deadline',
      time: '17:00',
      color: 'bg-red-500'
    },
    {
      id: '4',
      title: 'Monthly Report Due',
      type: 'reminder',
      time: '18:00',
      color: 'bg-yellow-500'
    }
  ]

  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View full calendar
        </button>
      </div>

      {/* Mini calendar */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              className={`text-sm py-1.5 rounded cursor-pointer transition-colors ${
                isSameDay(day, today)
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </div>

      {/* Today's events */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Today's Schedule</h4>
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`w-1 h-12 ${event.color} rounded`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                <span className="text-xs text-gray-500">{event.time}</span>
              </div>
              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                {event.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.attendees && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors">
          <CalendarIcon className="h-4 w-4" />
          <span>Add event</span>
        </button>
      </div>
    </div>
  )
}