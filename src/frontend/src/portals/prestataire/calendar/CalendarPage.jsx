/**
 * CalendarPage — Story 4.5
 * Calendrier prestataire : missions (projects) + echeances (deliverables).
 * CSS Grid, vues mois/semaine, export iCal.
 * Auth via useProviderAuth, data via TanStack Query + Directus.
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, ChevronLeft, ChevronRight, Download, Eye, X
} from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay,
  isToday, addWeeks, subWeeks, startOfDay, parseISO
} from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// ── Status config for badges ──
const STATUS_COLORS = {
  active: { bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)' },
  'in_progress': { bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)' },
  'in-progress': { bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)' },
  completed: { bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)' },
  pending: { bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)' },
  draft: { bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)' },
  todo: { bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)' },
  done: { bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)' },
  cancelled: { bg: 'rgba(255,59,48,0.12)', fg: 'var(--semantic-red)' }
}

const DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ── Event detail modal ──
const EventDetailModal = ({ event, onClose, onNavigate }) => {
  if (!event) return null

  const isMission = event.type === 'mission'
  const statusCfg = STATUS_COLORS[event.status] || { bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{background: isMission ? 'var(--accent)' : 'var(--semantic-orange)'}} />
            <h3 className="text-base font-semibold text-gray-900">
              {isMission ? 'Mission' : 'Echeance'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{event.name}</p>
            {event.projectName && (
              <p className="text-sm text-gray-500 mt-0.5">Projet : {event.projectName}</p>
            )}
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {event.startDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{isMission ? 'Debut' : 'Echeance'}</span>
                <span className="font-medium text-gray-900">
                  {format(parseISO(event.startDate), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
            {isMission && event.endDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fin</span>
                <span className="font-medium text-gray-900">
                  {format(parseISO(event.endDate), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Statut :</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{background: statusCfg.bg, color: statusCfg.fg}}>
              {event.status || 'N/A'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
          {isMission && (
            <button
              onClick={() => {
                onClose()
                onNavigate(`/prestataire/missions/${event.id}`)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-hover)] text-white hover:opacity-90 transition-colors"
            >
              <Eye size={16} />
              Voir la mission
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Day detail sidebar ──
const DayDetailSidebar = ({ date, events, onClose, onEventClick }) => {
  if (!date) return null

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-white shadow-2xl border-l border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {format(date, 'EEEE d MMMM', { locale: fr })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {events.length} evenement{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Aucun evenement ce jour</p>
          </div>
        ) : (
          events.map((event, idx) => {
            const isMission = event.type === 'mission'
            return (
              <button
                key={`${event.type}-${event.id}-${idx}`}
                onClick={() => onEventClick(event)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{background: isMission ? 'var(--accent)' : 'var(--semantic-orange)'}} />
                  <span className="text-xs font-medium text-gray-500">
                    {isMission ? 'Mission' : 'Echeance'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{event.name}</p>
                {event.projectName && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{event.projectName}</p>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Skeleton loading ──
const CalendarSkeleton = ({ view }) => {
  const cellCount = view === 'month' ? 35 : 7

  return (
    <div className="ds-card p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
        ))}
      </div>
      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
        {Array.from({ length: cellCount }).map((_, i) => (
          <div
            key={i}
            className={`bg-white p-2 ${view === 'month' ? 'min-h-24' : 'min-h-40'}`}
          >
            <div className="h-4 w-6 bg-gray-100 rounded animate-pulse mb-2" />
            {i % 4 === 0 && <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main CalendarPage ──
const CalendarPage = () => {
  const { provider } = useProviderAuth()
  const providerId = provider?.id
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // 'month' | 'week'
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // ── Compute date range based on view ──
  const { rangeStart, rangeEnd, displayLabel } = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return {
        rangeStart: format(
          startOfWeek(monthStart, { weekStartsOn: 1 }),
          'yyyy-MM-dd'
        ),
        rangeEnd: format(
          endOfWeek(monthEnd, { weekStartsOn: 1 }),
          'yyyy-MM-dd'
        ),
        displayLabel: format(currentDate, 'MMMM yyyy', { locale: fr })
      }
    }
    // week view
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    return {
      rangeStart: format(weekStart, 'yyyy-MM-dd'),
      rangeEnd: format(weekEnd, 'yyyy-MM-dd'),
      displayLabel: `${format(weekStart, 'd', { locale: fr })} - ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`
    }
  }, [currentDate, view])

  // ── Fetch missions (projects) ──
  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['provider-calendar-missions', providerId, rangeStart, rangeEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            main_provider_id: { _eq: providerId },
            _or: [
              { start_date: { _between: [rangeStart, rangeEnd] } },
              { end_date: { _between: [rangeStart, rangeEnd] } }
            ]
          },
          fields: ['id', 'name', 'start_date', 'end_date', 'status'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch deliverable deadlines ──
  const { data: deadlines = [], isLoading: deadlinesLoading } = useQuery({
    queryKey: ['provider-calendar-deadlines', providerId, rangeStart, rangeEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: {
            assigned_provider_id: { _eq: providerId },
            due_date: { _between: [rangeStart, rangeEnd] }
          },
          fields: ['id', 'name', 'due_date', 'status', 'project_id.name'],
          limit: 100
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  const isLoading = missionsLoading || deadlinesLoading

  // ── Build normalized events list ──
  const events = useMemo(() => {
    const list = []

    missions.forEach(m => {
      if (m.start_date) {
        list.push({
          id: m.id,
          name: m.name,
          type: 'mission',
          startDate: m.start_date,
          endDate: m.end_date || m.start_date,
          status: m.status,
          projectName: null
        })
      }
    })

    deadlines.forEach(d => {
      if (d.due_date) {
        list.push({
          id: d.id,
          name: d.name,
          type: 'deadline',
          startDate: d.due_date,
          endDate: d.due_date,
          status: d.status,
          projectName: d.project_id?.name || null
        })
      }
    })

    return list
  }, [missions, deadlines])

  // ── Get events for a specific day ──
  const getEventsForDay = useCallback((day) => {
    const dayStart = startOfDay(day)
    return events.filter(event => {
      const eventStart = startOfDay(parseISO(event.startDate))
      const eventEnd = startOfDay(parseISO(event.endDate))
      return dayStart >= eventStart && dayStart <= eventEnd
    })
  }, [events])

  // ── Compute calendar grid days ──
  const calendarDays = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
      })
    }
    // week view
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate, view])

  // ── Navigation ──
  const goNext = () => {
    setSelectedDay(null)
    setCurrentDate(prev => view === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1))
  }

  const goPrev = () => {
    setSelectedDay(null)
    setCurrentDate(prev => view === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1))
  }

  const goToday = () => {
    setSelectedDay(null)
    setCurrentDate(new Date())
  }

  // ── iCal export ──
  const exportIcal = () => {
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HYPERVISUAL//Prestataire//FR\n'

    missions.forEach(m => {
      if (m.start_date) {
        ical += `BEGIN:VEVENT\nSUMMARY:Mission: ${m.name}\n`
        ical += `DTSTART:${format(parseISO(m.start_date), 'yyyyMMdd')}\n`
        if (m.end_date) ical += `DTEND:${format(parseISO(m.end_date), 'yyyyMMdd')}\n`
        ical += `END:VEVENT\n`
      }
    })

    deadlines.forEach(d => {
      if (d.due_date) {
        ical += `BEGIN:VEVENT\nSUMMARY:Echeance: ${d.name}\n`
        ical += `DTSTART:${format(parseISO(d.due_date), 'yyyyMMdd')}\n`
        ical += `DTEND:${format(parseISO(d.due_date), 'yyyyMMdd')}\n`
        ical += `END:VEVENT\n`
      }
    })

    ical += 'END:VCALENDAR'

    const blob = new Blob([ical], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hypervisual-calendar.ics'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Calendrier exporte')
  }

  // ── Day events for sidebar ──
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="ds-page-title text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-sm text-gray-500 mt-1">
            Missions et echeances de vos projets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => { setView('month'); setSelectedDay(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => { setView('week'); setSelectedDay(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Semaine
            </button>
          </div>

          {/* Export iCal */}
          <button
            onClick={exportIcal}
            disabled={events.length === 0}
            className="ds-btn ds-btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export iCal
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="ds-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Precedent"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize ml-2">
              {displayLabel}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={goToday}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Aujourd'hui
            </button>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{background:"var(--accent)"}} />
                <span>Missions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{background:"var(--semantic-orange)"}} />
                <span>Echeances</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <CalendarSkeleton view={view} />
      ) : (
        <div className="ds-card p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day)
              const inCurrentMonth = view === 'month' ? isSameMonth(day, currentDate) : true
              const today = isToday(day)
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              const cellMinH = view === 'month' ? 'min-h-24' : 'min-h-40'

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
                  className={`
                    ${cellMinH} border border-gray-100 p-1 bg-white text-left
                    flex flex-col transition-colors cursor-pointer
                    hover:bg-zinc-50
                    ${isSelected ? 'ring-2 ring-[var(--accent)] ring-inset' : ''}
                    ${!inCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className={`
                        text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                        ${today ? 'bg-[var(--accent-hover)] text-white' : 'text-gray-700'}
                        ${!inCurrentMonth ? 'text-gray-300' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Event pills */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, view === 'month' ? 3 : 10).map((event, idx) => {
                      const isMission = event.type === 'mission'
                      return (
                        <div
                          key={`${event.type}-${event.id}-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(event)
                          }}
                          className={`
                            text-xs rounded px-1 py-0.5 cursor-pointer
                            ${view === 'month' ? 'truncate' : 'line-clamp-2'}
                          `}
                          style={{
                            background: isMission ? 'rgba(0,113,227,0.10)' : 'rgba(255,149,0,0.12)',
                            color: isMission ? 'var(--accent)' : 'var(--semantic-orange)'
                          }}
                          title={event.name}
                        >
                          {event.name}
                        </div>
                      )
                    })}
                    {dayEvents.length > (view === 'month' ? 3 : 10) && (
                      <span className="text-xs text-gray-400 pl-1">
                        +{dayEvents.length - (view === 'month' ? 3 : 10)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="ds-card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucun evenement</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vos missions et echeances apparaitront ici une fois planifiees.
          </p>
        </div>
      )}

      {/* Day detail sidebar */}
      {selectedDay && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/10"
            onClick={() => setSelectedDay(null)}
          />
          <DayDetailSidebar
            date={selectedDay}
            events={selectedDayEvents}
            onClose={() => setSelectedDay(null)}
            onEventClick={(event) => {
              setSelectedDay(null)
              setSelectedEvent(event)
            }}
          />
        </>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onNavigate={(path) => navigate(path)}
        />
      )}
    </div>
  )
}

export default CalendarPage
