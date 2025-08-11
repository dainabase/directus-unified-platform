import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './search-bar'
import { describe, it, expect, vi } from 'vitest'

const mockSuggestions = [
  { id: '1', text: 'React', type: 'trending' as const },
  { id: '2', text: 'TypeScript', type: 'popular' as const },
]

const mockFilters = [
  {
    id: 'category',
    label: 'Category',
    type: 'checkbox' as const,
    options: [
      { value: 'docs', label: 'Documentation' },
      { value: 'tutorial', label: 'Tutorials' },
    ],
  },
]

const mockResults = [
  {
    id: '1',
    title: 'React Guide',
    description: 'Getting started with React',
  },
  {
    id: '2',
    title: 'TypeScript Handbook',
    description: 'Learn TypeScript',
  },
]

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar placeholder="Search here..." />)
    expect(screen.getByPlaceholderText('Search here...')).toBeInTheDocument()
  })

  it('updates value on input change', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onChange={onChange} />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'test query')
    
    expect(onChange).toHaveBeenLastCalledWith('test query')
  })

  it('triggers search on Enter key', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'search term')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(onSearch).toHaveBeenCalledWith('search term', {})
  })

  it('shows clear button when value exists', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'text')
    
    const clearButton = screen.getByRole('button', { hidden: true })
    expect(clearButton).toBeInTheDocument()
  })

  it('clears value when clear button is clicked', async () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onChange={onChange} onClear={onClear} />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'text')
    
    const clearButton = screen.getByRole('button', { hidden: true })
    fireEvent.click(clearButton)
    
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(onClear).toHaveBeenCalled()
  })

  it('shows suggestions when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar suggestions={mockSuggestions} showSuggestions />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'r')
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('handles suggestion click', async () => {
    const onSuggestionClick = vi.fn()
    const user = userEvent.setup()
    render(
      <SearchBar
        suggestions={mockSuggestions}
        showSuggestions
        onSuggestionClick={onSuggestionClick}
      />
    )
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'r')
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('React'))
    
    expect(onSuggestionClick).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'React' })
    )
  })

  it('shows filter button when filters are provided', () => {
    render(<SearchBar filters={mockFilters} showFilters />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('handles filter changes', async () => {
    const onFilterChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SearchBar
        filters={mockFilters}
        showFilters
        onFilterChange={onFilterChange}
      />
    )
    
    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)
    
    const checkbox = await screen.findByLabelText('Documentation')
    await user.click(checkbox)
    
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: ['docs'] })
    )
  })

  it('shows search button by default', () => {
    render(<SearchBar showSearchButton />)
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('triggers search when search button is clicked', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} showSearchButton />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'query')
    
    const searchButton = screen.getByText('Search')
    await user.click(searchButton)
    
    expect(onSearch).toHaveBeenCalledWith('query', {})
  })

  it('shows results when provided', () => {
    render(<SearchBar results={mockResults} showResults showResultsPopover />)
    expect(screen.getByText('React Guide')).toBeInTheDocument()
    expect(screen.getByText('TypeScript Handbook')).toBeInTheDocument()
  })

  it('handles result click', async () => {
    const onResultClick = vi.fn()
    render(
      <SearchBar
        results={mockResults}
        showResults
        showResultsPopover
        onResultClick={onResultClick}
      />
    )
    
    fireEvent.click(screen.getByText('React Guide'))
    
    expect(onResultClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'React Guide' })
    )
  })

  it('shows loading state', () => {
    render(<SearchBar loading loadingMessage="Searching..." />)
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('shows recent searches when enabled', () => {
    const recentSearches = ['Previous search 1', 'Previous search 2']
    render(
      <SearchBar
        showRecentSearches
        recentSearches={recentSearches}
        showSuggestions
      />
    )
    
    const input = screen.getByRole('searchbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'a' } })
    
    expect(screen.getByText('Recent searches')).toBeInTheDocument()
  })

  it('clears recent searches when clear button is clicked', async () => {
    const onClearRecentSearches = vi.fn()
    const recentSearches = ['Previous search']
    const user = userEvent.setup()
    
    render(
      <SearchBar
        showRecentSearches
        recentSearches={recentSearches}
        onClearRecentSearches={onClearRecentSearches}
        showSuggestions
      />
    )
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'a')
    
    const clearButton = screen.getByText('Clear all')
    await user.click(clearButton)
    
    expect(onClearRecentSearches).toHaveBeenCalled()
  })

  it('debounces search on change', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })
    
    render(<SearchBar onSearch={onSearch} searchOnChange debounceMs={300} />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'test')
    
    expect(onSearch).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test', {})
    })
    
    vi.useRealTimers()
  })

  it('respects maxSuggestions prop', async () => {
    const manySuggestions = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      text: `Suggestion ${i}`,
    }))
    
    const user = userEvent.setup()
    render(<SearchBar suggestions={manySuggestions} maxSuggestions={3} showSuggestions />)
    
    const input = screen.getByRole('searchbox')
    await user.type(input, 'a')
    
    await waitFor(() => {
      expect(screen.getByText('Suggestion 0')).toBeInTheDocument()
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument()
      expect(screen.queryByText('Suggestion 3')).not.toBeInTheDocument()
    })
  })
})