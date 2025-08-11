'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Check, Circle, Clock, AlertCircle, X, ChevronDown, ChevronUp, Calendar, User, Tag, Link, MapPin, MessageSquare, Paperclip } from 'lucide-react'
import { Badge } from '../badge'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { Avatar } from '../avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'
import { Progress } from '../progress'
import { ScrollArea } from '../scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible'

export interface TimelineEvent {
  id: string
  title: string
  description?: string
  date: Date | string
  type?: 'default' | 'success' | 'warning' | 'error' | 'info'
  status?: 'completed' | 'current' | 'upcoming' | 'cancelled'
  icon?: React.ReactNode
  user?: {
    name: string
    avatar?: string
    role?: string
  }
  tags?: string[]
  location?: string
  link?: {
    label: string
    url: string
  }
  attachments?: Array<{
    name: string
    size?: string
    type?: string
  }>
  comments?: Array<{
    id: string
    user: string
    text: string
    date: Date | string
  }>
  metadata?: Record<string, any>
  children?: React.ReactNode
  expandable?: boolean
  progress?: number
  milestone?: boolean
  duration?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface TimelineEnhancedProps {
  events: TimelineEvent[]
  orientation?: 'vertical' | 'horizontal'
  variant?: 'default' | 'compact' | 'detailed' | 'cards'
  showConnector?: boolean
  showProgress?: boolean
  animated?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  onEventClick?: (event: TimelineEvent) => void
  onEventExpand?: (event: TimelineEvent, expanded: boolean) => void
  className?: string
  containerClassName?: string
  eventClassName?: string
  connectorClassName?: string
  renderEvent?: (event: TimelineEvent, index: number) => React.ReactNode
  renderIcon?: (event: TimelineEvent) => React.ReactNode
  sortOrder?: 'asc' | 'desc'
  groupByDate?: boolean
  showTimestamp?: boolean
  highlightCurrent?: boolean
  maxHeight?: string | number
  interactive?: boolean
  showFilters?: boolean
  filterOptions?: Array<{ value: string; label: string }>
  onFilterChange?: (filters: string[]) => void
}

const TimelineEnhanced = React.forwardRef<HTMLDivElement, TimelineEnhancedProps>(
  (
    {
      events,
      orientation = 'vertical',
      variant = 'default',
      showConnector = true,
      showProgress = false,
      animated = true,
      collapsible = false,
      defaultExpanded = true,
      onEventClick,
      onEventExpand,
      className,
      containerClassName,
      eventClassName,
      connectorClassName,
      renderEvent,
      renderIcon,
      sortOrder = 'asc',
      groupByDate = false,
      showTimestamp = true,
      highlightCurrent = true,
      maxHeight,
      interactive = true,
      showFilters = false,
      filterOptions = [],
      onFilterChange,
    },
    ref
  ) => {
    const [expandedEvents, setExpandedEvents] = React.useState<Set<string>>(
      new Set(defaultExpanded ? events.map(e => e.id) : [])
    )
    const [hoveredEvent, setHoveredEvent] = React.useState<string | null>(null)
    const [activeFilters, setActiveFilters] = React.useState<string[]>([])

    const sortedEvents = React.useMemo(() => {
      const sorted = [...events].sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })

      if (activeFilters.length > 0) {
        return sorted.filter(event => 
          event.tags?.some(tag => activeFilters.includes(tag)) ||
          activeFilters.includes(event.type || 'default') ||
          activeFilters.includes(event.status || 'default')
        )
      }

      return sorted
    }, [events, sortOrder, activeFilters])

    const groupedEvents = React.useMemo(() => {
      if (!groupByDate) return { '': sortedEvents }

      return sortedEvents.reduce((groups, event) => {
        const date = new Date(event.date)
        const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        if (!groups[key]) groups[key] = []
        groups[key].push(event)
        return groups
      }, {} as Record<string, TimelineEvent[]>)
    }, [sortedEvents, groupByDate])

    const toggleEventExpansion = (eventId: string) => {
      setExpandedEvents(prev => {
        const next = new Set(prev)
        if (next.has(eventId)) {
          next.delete(eventId)
          const event = events.find(e => e.id === eventId)
          if (event) onEventExpand?.(event, false)
        } else {
          next.add(eventId)
          const event = events.find(e => e.id === eventId)
          if (event) onEventExpand?.(event, true)
        }
        return next
      })
    }

    const getEventIcon = (event: TimelineEvent) => {
      if (renderIcon) return renderIcon(event)
      if (event.icon) return event.icon

      switch (event.status) {
        case 'completed':
          return <Check className="h-4 w-4" />
        case 'current':
          return <Circle className="h-4 w-4" />
        case 'cancelled':
          return <X className="h-4 w-4" />
        case 'upcoming':
          return <Clock className="h-4 w-4" />
        default:
          return <Circle className="h-4 w-4" />
      }
    }

    const getEventColors = (event: TimelineEvent) => {
      const baseColors = {
        default: 'bg-muted border-border',
        success: 'bg-green-50 border-green-500 dark:bg-green-950',
        warning: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950',
        error: 'bg-red-50 border-red-500 dark:bg-red-950',
        info: 'bg-blue-50 border-blue-500 dark:bg-blue-950',
      }

      const statusColors = {
        completed: 'bg-green-500',
        current: 'bg-blue-500',
        upcoming: 'bg-gray-400',
        cancelled: 'bg-red-500',
      }

      return {
        container: baseColors[event.type || 'default'],
        icon: statusColors[event.status || 'upcoming'],
      }
    }

    const formatDate = (date: Date | string) => {
      const d = new Date(date)
      if (showTimestamp) {
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    const renderDefaultEvent = (event: TimelineEvent, index: number) => {
      const colors = getEventColors(event)
      const isExpanded = expandedEvents.has(event.id)
      const isHovered = hoveredEvent === event.id
      const isCurrent = event.status === 'current'

      if (variant === 'cards') {
        return (
          <Card
            className={cn(
              "transition-all",
              interactive && "hover:shadow-lg cursor-pointer",
              isCurrent && highlightCurrent && "ring-2 ring-primary",
              eventClassName
            )}
            onClick={() => interactive && onEventClick?.(event)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    colors.icon,
                    "text-white"
                  )}>
                    {getEventIcon(event)}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatDate(event.date)}
                    </CardDescription>
                  </div>
                </div>
                {event.priority && (
                  <Badge
                    variant={event.priority === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {event.priority}
                  </Badge>
                )}
              </div>
            </CardHeader>
            {(event.description || event.children) && (
              <CardContent className="pt-0">
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                )}
                {event.children}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      }

      return (
        <div
          className={cn(
            "flex gap-4 group",
            orientation === 'horizontal' && "flex-col items-center",
            eventClassName
          )}
          onMouseEnter={() => setHoveredEvent(event.id)}
          onMouseLeave={() => setHoveredEvent(null)}
        >
          {/* Icon/Dot */}
          <div className="relative flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      colors.icon,
                      "text-white",
                      isHovered && "scale-110",
                      animated && "animate-in zoom-in-50 duration-300",
                      interactive && "cursor-pointer"
                    )}
                    onClick={() => interactive && onEventClick?.(event)}
                  >
                    {getEventIcon(event)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{event.status || 'Event'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Connector Line */}
            {showConnector && index < sortedEvents.length - 1 && (
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2",
                  orientation === 'vertical' ? "top-10 w-0.5 h-20" : "left-10 h-0.5 w-20 top-1/2 -translate-y-1/2",
                  "bg-border",
                  connectorClassName
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className={cn(
            "flex-1 pb-8",
            variant === 'compact' && "pb-4"
          )}>
            <div
              className={cn(
                "rounded-lg border p-4 transition-all",
                colors.container,
                isHovered && "shadow-md",
                isCurrent && highlightCurrent && "ring-2 ring-primary",
                interactive && "cursor-pointer"
              )}
              onClick={() => interactive && onEventClick?.(event)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm leading-none">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                    {event.duration && (
                      <>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                {collapsible && event.expandable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleEventExpansion(event.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Progress */}
              {showProgress && event.progress !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{event.progress}%</span>
                  </div>
                  <Progress value={event.progress} className="h-2" />
                </div>
              )}

              {/* Main Content */}
              <Collapsible open={!collapsible || isExpanded}>
                <CollapsibleContent>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {event.description}
                    </p>
                  )}

                  {/* User Info */}
                  {event.user && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <img src={event.user.avatar} alt={event.user.name} />
                      </Avatar>
                      <div className="text-xs">
                        <span className="font-medium">{event.user.name}</span>
                        {event.user.role && (
                          <span className="text-muted-foreground"> • {event.user.role}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {/* Link */}
                  {event.link && (
                    <a
                      href={event.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link className="h-3 w-3" />
                      {event.link.label}
                    </a>
                  )}

                  {/* Attachments */}
                  {event.attachments && event.attachments.length > 0 && (
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1 text-xs font-medium">
                        <Paperclip className="h-3 w-3" />
                        Attachments
                      </div>
                      {event.attachments.map((attachment, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground ml-4">
                          {attachment.name}
                          {attachment.size && ` (${attachment.size})`}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {event.comments && event.comments.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center gap-1 text-xs font-medium mb-2">
                        <MessageSquare className="h-3 w-3" />
                        Comments ({event.comments.length})
                      </div>
                      <div className="space-y-2">
                        {event.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="text-xs">
                            <span className="font-medium">{comment.user}:</span>{' '}
                            <span className="text-muted-foreground">{comment.text}</span>
                          </div>
                        ))}
                        {event.comments.length > 2 && (
                          <button className="text-xs text-primary hover:underline">
                            View all comments
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Children */}
                  {event.children}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      )
    }

    const content = (
      <div
        ref={ref}
        className={cn(
          "relative",
          orientation === 'horizontal' && "flex gap-8 overflow-x-auto",
          className
        )}
      >
        {groupByDate ? (
          Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date} className="mb-8">
              {date && (
                <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background z-10">
                  {date}
                </h3>
              )}
              <div className={cn(
                orientation === 'horizontal' && "flex gap-8"
              )}>
                {events.map((event, index) => (
                  <React.Fragment key={event.id}>
                    {renderEvent ? renderEvent(event, index) : renderDefaultEvent(event, index)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))
        ) : (
          sortedEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              {renderEvent ? renderEvent(event, index) : renderDefaultEvent(event, index)}
            </React.Fragment>
          ))
        )}
      </div>
    )

    if (maxHeight) {
      return (
        <div className={containerClassName}>
          {showFilters && filterOptions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={activeFilters.includes(option.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setActiveFilters(prev => {
                      const next = prev.includes(option.value)
                        ? prev.filter(f => f !== option.value)
                        : [...prev, option.value]
                      onFilterChange?.(next)
                      return next
                    })
                  }}
                >
                  {option.label}
                </Badge>
              ))}
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveFilters([])
                    onFilterChange?.([])
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
          <ScrollArea style={{ height: maxHeight }}>
            {content}
          </ScrollArea>
        </div>
      )
    }

    return (
      <div className={containerClassName}>
        {showFilters && filterOptions.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Badge
                key={option.value}
                variant={activeFilters.includes(option.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setActiveFilters(prev => {
                    const next = prev.includes(option.value)
                      ? prev.filter(f => f !== option.value)
                      : [...prev, option.value]
                    onFilterChange?.(next)
                    return next
                  })
                }}
              >
                {option.label}
              </Badge>
            ))}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFilters([])
                  onFilterChange?.([])
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
        {content}
      </div>
    )
  }
)

TimelineEnhanced.displayName = 'TimelineEnhanced'

export { TimelineEnhanced }