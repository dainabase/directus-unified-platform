'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Search, X, Filter, Clock, TrendingUp, Star, History } from 'lucide-react'
import { Input } from '../input'
import { Button } from '../button'
import { Badge } from '../badge'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { ScrollArea } from '../scroll-area'
import { Separator } from '../separator'
import { Checkbox } from '../checkbox'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { Label } from '../label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../command'

export interface SearchFilter {
  id: string
  label: string
  type: 'checkbox' | 'radio' | 'select' | 'range'
  options?: Array<{ value: string; label: string }>
  value?: any
}

export interface SearchSuggestion {
  id: string
  text: string
  type?: 'recent' | 'trending' | 'popular' | 'saved'
  icon?: React.ReactNode
  category?: string
  metadata?: Record<string, any>
}

export interface SearchResult {
  id: string
  title: string
  description?: string
  url?: string
  category?: string
  tags?: string[]
  thumbnail?: string
  metadata?: Record<string, any>
}

export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string, filters?: Record<string, any>) => void | Promise<void>
  onClear?: () => void
  placeholder?: string
  suggestions?: SearchSuggestion[]
  filters?: SearchFilter[]
  results?: SearchResult[]
  loading?: boolean
  autoFocus?: boolean
  showFilters?: boolean
  showSuggestions?: boolean
  showResults?: boolean
  maxSuggestions?: number
  maxResults?: number
  searchOnChange?: boolean
  debounceMs?: number
  className?: string
  inputClassName?: string
  resultsClassName?: string
  renderResult?: (result: SearchResult) => React.ReactNode
  renderSuggestion?: (suggestion: SearchSuggestion) => React.ReactNode
  onFilterChange?: (filters: Record<string, any>) => void
  onSuggestionClick?: (suggestion: SearchSuggestion) => void
  onResultClick?: (result: SearchResult) => void
  showRecentSearches?: boolean
  recentSearches?: string[]
  onClearRecentSearches?: () => void
  showSearchButton?: boolean
  searchButtonText?: string
  emptyStateMessage?: string
  loadingMessage?: string
  variant?: 'default' | 'minimal' | 'expanded'
  size?: 'sm' | 'md' | 'lg'
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value = '',
      onChange,
      onSearch,
      onClear,
      placeholder = 'Search...',
      suggestions = [],
      filters = [],
      results = [],
      loading = false,
      autoFocus = false,
      showFilters = true,
      showSuggestions = true,
      showResults = false,
      maxSuggestions = 5,
      maxResults = 10,
      searchOnChange = false,
      debounceMs = 300,
      className,
      inputClassName,
      resultsClassName,
      renderResult,
      renderSuggestion,
      onFilterChange,
      onSuggestionClick,
      onResultClick,
      showRecentSearches = false,
      recentSearches = [],
      onClearRecentSearches,
      showSearchButton = true,
      searchButtonText = 'Search',
      emptyStateMessage = 'No results found',
      loadingMessage = 'Searching...',
      variant = 'default',
      size = 'md',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [showSuggestionsPopover, setShowSuggestionsPopover] = React.useState(false)
    const [showResultsPopover, setShowResultsPopover] = React.useState(false)
    const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>({})
    const [isSearching, setIsSearching] = React.useState(false)
    const debounceRef = React.useRef<NodeJS.Timeout>()
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onChange?.(newValue)

      if (newValue && showSuggestions) {
        setShowSuggestionsPopover(true)
      } else {
        setShowSuggestionsPopover(false)
      }

      if (searchOnChange && newValue) {
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
          setIsSearching(true)
          await onSearch?.(newValue, activeFilters)
          setIsSearching(false)
          if (showResults) {
            setShowResultsPopover(true)
          }
        }, debounceMs)
      }
    }

    const handleSearch = async () => {
      if (!internalValue) return
      
      setIsSearching(true)
      setShowSuggestionsPopover(false)
      await onSearch?.(internalValue, activeFilters)
      setIsSearching(false)
      
      if (showResults) {
        setShowResultsPopover(true)
      }
    }

    const handleClear = () => {
      setInternalValue('')
      onChange?.('')
      onClear?.()
      setShowSuggestionsPopover(false)
      setShowResultsPopover(false)
      inputRef.current?.focus()
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      setInternalValue(suggestion.text)
      onChange?.(suggestion.text)
      onSuggestionClick?.(suggestion)
      setShowSuggestionsPopover(false)
      handleSearch()
    }

    const handleFilterChange = (filterId: string, value: any) => {
      const newFilters = { ...activeFilters, [filterId]: value }
      setActiveFilters(newFilters)
      onFilterChange?.(newFilters)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      } else if (e.key === 'Escape') {
        setShowSuggestionsPopover(false)
        setShowResultsPopover(false)
      }
    }

    const getSuggestionIcon = (suggestion: SearchSuggestion) => {
      if (suggestion.icon) return suggestion.icon
      
      switch (suggestion.type) {
        case 'recent':
          return <Clock className="h-4 w-4" />
        case 'trending':
          return <TrendingUp className="h-4 w-4" />
        case 'popular':
          return <Star className="h-4 w-4" />
        case 'saved':
          return <History className="h-4 w-4" />
        default:
          return <Search className="h-4 w-4" />
      }
    }

    const defaultRenderSuggestion = (suggestion: SearchSuggestion) => (
      <div className="flex items-center gap-2 p-2">
        <span className="text-muted-foreground">
          {getSuggestionIcon(suggestion)}
        </span>
        <div className="flex-1">
          <div className="text-sm">{suggestion.text}</div>
          {suggestion.category && (
            <div className="text-xs text-muted-foreground">{suggestion.category}</div>
          )}
        </div>
      </div>
    )

    const defaultRenderResult = (result: SearchResult) => (
      <div className="flex gap-3 p-3 hover:bg-accent rounded-md cursor-pointer">
        {result.thumbnail && (
          <img
            src={result.thumbnail}
            alt={result.title}
            className="h-12 w-12 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{result.title}</div>
          {result.description && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {result.description}
            </div>
          )}
          {result.tags && result.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {result.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    )

    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10',
      lg: 'h-12 text-lg',
    }

    const variantClasses = {
      default: 'border rounded-md',
      minimal: 'border-b border-x-0 border-t-0 rounded-none',
      expanded: 'border rounded-lg shadow-sm',
    }

    const displayedSuggestions = React.useMemo(() => {
      let allSuggestions = [...suggestions]
      
      if (showRecentSearches && recentSearches.length > 0) {
        const recentSuggestions: SearchSuggestion[] = recentSearches.map((text, index) => ({
          id: `recent-${index}`,
          text,
          type: 'recent',
        }))
        allSuggestions = [...recentSuggestions, ...allSuggestions]
      }
      
      return allSuggestions.slice(0, maxSuggestions)
    }, [suggestions, showRecentSearches, recentSearches, maxSuggestions])

    const displayedResults = results.slice(0, maxResults)

    return (
      <div className={cn('relative', className)}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              value={internalValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (internalValue && showSuggestions) {
                  setShowSuggestionsPopover(true)
                }
              }}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className={cn(
                'pl-10 pr-10',
                sizeClasses[size],
                variantClasses[variant],
                inputClassName
              )}
            />
            {internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showFilters && filters.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size={size === 'sm' ? 'sm' : 'default'}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.keys(activeFilters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(activeFilters).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Filters</h4>
                  <Separator />
                  <ScrollArea className="max-h-80">
                    <div className="space-y-4">
                      {filters.map((filter) => (
                        <div key={filter.id} className="space-y-2">
                          <Label className="text-sm">{filter.label}</Label>
                          {filter.type === 'checkbox' && filter.options && (
                            <div className="space-y-2">
                              {filter.options.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${filter.id}-${option.value}`}
                                    checked={activeFilters[filter.id]?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = activeFilters[filter.id] || []
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((v: string) => v !== option.value)
                                      handleFilterChange(filter.id, updated)
                                    }}
                                  />
                                  <Label
                                    htmlFor={`${filter.id}-${option.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                          {filter.type === 'radio' && filter.options && (
                            <RadioGroup
                              value={activeFilters[filter.id]}
                              onValueChange={(value) => handleFilterChange(filter.id, value)}
                            >
                              {filter.options.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={`${filter.id}-${option.value}`} />
                                  <Label
                                    htmlFor={`${filter.id}-${option.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {Object.keys(activeFilters).length > 0 && (
                    <>
                      <Separator />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveFilters({})
                          onFilterChange?.({})
                        }}
                        className="w-full"
                      >
                        Clear all filters
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {showSearchButton && (
            <Button
              onClick={handleSearch}
              disabled={!internalValue || isSearching}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {isSearching ? loadingMessage : searchButtonText}
            </Button>
          )}
        </div>

        {showSuggestionsPopover && displayedSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 rounded-md border bg-popover shadow-md">
            <ScrollArea className="max-h-80">
              {showRecentSearches && recentSearches.length > 0 && (
                <>
                  <div className="flex items-center justify-between p-2 text-sm text-muted-foreground">
                    <span>Recent searches</span>
                    {onClearRecentSearches && (
                      <button
                        onClick={onClearRecentSearches}
                        className="text-xs hover:text-foreground"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <Separator />
                </>
              )}
              {displayedSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left hover:bg-accent transition-colors"
                >
                  {renderSuggestion ? renderSuggestion(suggestion) : defaultRenderSuggestion(suggestion)}
                </button>
              ))}
            </ScrollArea>
          </div>
        )}

        {showResultsPopover && (
          <div className={cn(
            "absolute z-50 w-full mt-2 rounded-md border bg-popover shadow-md",
            resultsClassName
          )}>
            <ScrollArea className="max-h-96">
              {loading || isSearching ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {loadingMessage}
                </div>
              ) : displayedResults.length > 0 ? (
                <div className="p-2">
                  {displayedResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => {
                        onResultClick?.(result)
                        setShowResultsPopover(false)
                      }}
                      className="w-full text-left"
                    >
                      {renderResult ? renderResult(result) : defaultRenderResult(result)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {emptyStateMessage}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'

export { SearchBar }