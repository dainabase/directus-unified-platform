'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Badge } from '../badge'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Avatar } from '../avatar'
import { ScrollArea } from '../scroll-area'

export interface User {
  id: string
  name: string
  username: string
  avatar?: string
  email?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
}

export interface MentionsProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  users?: User[]
  value?: string
  onChange?: (value: string, mentions?: User[]) => void
  onMention?: (user: User) => void
  placeholder?: string
  maxSuggestions?: number
  triggerChar?: string
  allowSpaces?: boolean
  formatMention?: (user: User) => string
  renderSuggestion?: (user: User) => React.ReactNode
  renderMention?: (user: User) => React.ReactNode
  searchDelay?: number
  minSearchLength?: number
  className?: string
  containerClassName?: string
  popoverClassName?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  autoFocus?: boolean
  maxLength?: number
  rows?: number
  showStatus?: boolean
  mentionClassName?: string
  highlightMentions?: boolean
}

const Mentions = React.forwardRef<HTMLTextAreaElement, MentionsProps>(
  (
    {
      users = [],
      value = '',
      onChange,
      onMention,
      placeholder = 'Type @ to mention someone...',
      maxSuggestions = 5,
      triggerChar = '@',
      allowSpaces = false,
      formatMention = (user) => `@${user.username}`,
      renderSuggestion,
      renderMention,
      searchDelay = 300,
      minSearchLength = 1,
      className,
      containerClassName,
      popoverClassName,
      disabled = false,
      readOnly = false,
      required = false,
      autoFocus = false,
      maxLength,
      rows = 4,
      showStatus = true,
      mentionClassName,
      highlightMentions = true,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [mentionStart, setMentionStart] = React.useState(-1)
    const [cursorPosition, setCursorPosition] = React.useState(0)
    const [activeMentions, setActiveMentions] = React.useState<User[]>([])
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const searchTimeoutRef = React.useRef<NodeJS.Timeout>()
    const popoverRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const filteredUsers = React.useMemo(() => {
      if (!searchTerm || searchTerm.length < minSearchLength) return []
      
      const filtered = users.filter(user => {
        const searchLower = searchTerm.toLowerCase()
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        )
      })
      
      return filtered.slice(0, maxSuggestions)
    }, [users, searchTerm, minSearchLength, maxSuggestions])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const newCursorPos = e.target.selectionStart
      
      setInternalValue(newValue)
      setCursorPosition(newCursorPos)
      
      // Check for mention trigger
      const lastChar = newValue[newCursorPos - 1]
      if (lastChar === triggerChar) {
        const prevChar = newValue[newCursorPos - 2]
        if (!prevChar || prevChar === ' ' || prevChar === '\n') {
          setMentionStart(newCursorPos - 1)
          setShowSuggestions(true)
          setSearchTerm('')
          setSelectedIndex(0)
        }
      } else if (mentionStart >= 0 && newCursorPos > mentionStart) {
        // Extract search term
        const search = newValue.substring(mentionStart + 1, newCursorPos)
        
        // Check if search contains spaces and spaces are not allowed
        if (!allowSpaces && search.includes(' ')) {
          setShowSuggestions(false)
          setMentionStart(-1)
        } else {
          clearTimeout(searchTimeoutRef.current)
          searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(search)
          }, searchDelay)
        }
      } else {
        setShowSuggestions(false)
        setMentionStart(-1)
      }
      
      // Extract mentions from text
      const mentionRegex = new RegExp(`${triggerChar}([a-zA-Z0-9_]+)`, 'g')
      const mentions: User[] = []
      let match
      
      while ((match = mentionRegex.exec(newValue)) !== null) {
        const username = match[1]
        const user = users.find(u => u.username === username)
        if (user && !mentions.find(m => m.id === user.id)) {
          mentions.push(user)
        }
      }
      
      setActiveMentions(mentions)
      onChange?.(newValue, mentions)
    }

    const insertMention = (user: User) => {
      if (!textareaRef.current) return
      
      const mention = formatMention(user)
      const before = internalValue.substring(0, mentionStart)
      const after = internalValue.substring(cursorPosition)
      const newValue = `${before}${mention} ${after}`
      const newCursorPos = mentionStart + mention.length + 1
      
      setInternalValue(newValue)
      onChange?.(newValue, [...activeMentions, user])
      onMention?.(user)
      
      setShowSuggestions(false)
      setMentionStart(-1)
      setSearchTerm('')
      
      // Reset cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          textareaRef.current.focus()
        }
      }, 0)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions || filteredUsers.length === 0) return
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          insertMention(filteredUsers[selectedIndex])
          break
        case 'Escape':
          setShowSuggestions(false)
          setMentionStart(-1)
          break
      }
    }

    const defaultRenderSuggestion = (user: User) => (
      <div className="flex items-center gap-2 p-2">
        <Avatar 
          src={user.avatar} 
          alt={user.name} 
          className="h-8 w-8"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
        </div>
        {showStatus && user.status && (
          <div className="flex-shrink-0">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                user.status === 'online' && "bg-green-500",
                user.status === 'away' && "bg-yellow-500",
                user.status === 'busy' && "bg-red-500",
                user.status === 'offline' && "bg-gray-400"
              )}
            />
          </div>
        )}
      </div>
    )

    const highlightedValue = React.useMemo(() => {
      if (!highlightMentions || !internalValue) return internalValue
      
      const mentionRegex = new RegExp(`(${triggerChar}[a-zA-Z0-9_]+)`, 'g')
      const parts = internalValue.split(mentionRegex)
      
      return (
        <div className="absolute inset-0 pointer-events-none p-[9px] whitespace-pre-wrap break-words">
          {parts.map((part, index) => {
            if (part.startsWith(triggerChar)) {
              const username = part.substring(1)
              const user = users.find(u => u.username === username)
              if (user) {
                if (renderMention) {
                  return <span key={index}>{renderMention(user)}</span>
                }
                return (
                  <span
                    key={index}
                    className={cn(
                      "text-primary font-medium",
                      mentionClassName
                    )}
                  >
                    {part}
                  </span>
                )
              }
            }
            return <span key={index} className="text-transparent">{part}</span>
          })}
        </div>
      )
    }, [internalValue, highlightMentions, triggerChar, users, renderMention, mentionClassName])

    return (
      <div className={cn("relative", containerClassName)}>
        {highlightMentions && (
          <div className="absolute inset-0 overflow-hidden rounded-md border bg-background">
            {highlightedValue}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoFocus={autoFocus}
          maxLength={maxLength}
          rows={rows}
          className={cn(
            "relative z-10 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            highlightMentions && "bg-transparent",
            className
          )}
          {...props}
        />
        
        {showSuggestions && filteredUsers.length > 0 && (
          <div
            ref={popoverRef}
            className={cn(
              "absolute z-50 w-64 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95",
              "mt-1",
              popoverClassName
            )}
          >
            <ScrollArea className="max-h-60">
              {filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => insertMention(user)}
                  className={cn(
                    "w-full rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    index === selectedIndex && "bg-accent text-accent-foreground"
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {renderSuggestion ? renderSuggestion(user) : defaultRenderSuggestion(user)}
                </button>
              ))}
            </ScrollArea>
          </div>
        )}
        
        {activeMentions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {activeMentions.map((user) => (
              <Badge key={user.id} variant="secondary" className="text-xs">
                @{user.username}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }
)

Mentions.displayName = 'Mentions'

export { Mentions }