import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './search-bar'
import React from 'react'

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An advanced search bar with filters, suggestions, and results display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'minimal', 'expanded'],
      description: 'Visual variant of the search bar',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the search bar',
    },
    showFilters: {
      control: 'boolean',
      description: 'Show filter button',
    },
    showSuggestions: {
      control: 'boolean',
      description: 'Show search suggestions',
    },
    showResults: {
      control: 'boolean',
      description: 'Show search results',
    },
    showSearchButton: {
      control: 'boolean',
      description: 'Show search button',
    },
    searchOnChange: {
      control: 'boolean',
      description: 'Search as user types',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const sampleSuggestions = [
  { id: '1', text: 'React components', type: 'trending' as const },
  { id: '2', text: 'TypeScript tutorial', type: 'popular' as const },
  { id: '3', text: 'Next.js documentation', type: 'recent' as const },
  { id: '4', text: 'Tailwind CSS', type: 'trending' as const },
  { id: '5', text: 'JavaScript async await', type: 'saved' as const },
]

const sampleFilters = [
  {
    id: 'category',
    label: 'Category',
    type: 'checkbox' as const,
    options: [
      { value: 'docs', label: 'Documentation' },
      { value: 'tutorial', label: 'Tutorials' },
      { value: 'api', label: 'API Reference' },
      { value: 'examples', label: 'Examples' },
    ],
  },
  {
    id: 'date',
    label: 'Date Range',
    type: 'radio' as const,
    options: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'year', label: 'This Year' },
    ],
  },
]

const sampleResults = [
  {
    id: '1',
    title: 'Getting Started with React',
    description: 'Learn the basics of React including components, props, and state management.',
    category: 'Tutorial',
    tags: ['react', 'javascript', 'frontend'],
    thumbnail: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    description: 'A comprehensive guide to writing clean and maintainable TypeScript code.',
    category: 'Documentation',
    tags: ['typescript', 'javascript', 'types'],
    thumbnail: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    title: 'Building a Design System',
    description: 'How to create a scalable design system from scratch using modern tools.',
    category: 'Guide',
    tags: ['design', 'ui', 'components'],
    thumbnail: 'https://via.placeholder.com/100',
  },
]

export const Default: Story = {
  args: {
    placeholder: 'Search documentation...',
    suggestions: sampleSuggestions,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[600px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          onSearch={(val) => console.log('Searching for:', val)}
        />
      </div>
    )
  },
}

export const WithFilters: Story = {
  args: {
    placeholder: 'Search with filters...',
    suggestions: sampleSuggestions,
    filters: sampleFilters,
    showFilters: true,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    const [filters, setFilters] = React.useState({})
    
    return (
      <div className="w-[600px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          onFilterChange={setFilters}
          onSearch={(val, filters) => {
            console.log('Searching for:', val)
            console.log('With filters:', filters)
          }}
        />
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 p-4 rounded-md bg-muted">
            <p className="text-sm font-medium mb-2">Active Filters:</p>
            <pre className="text-xs">{JSON.stringify(filters, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  },
}

export const WithResults: Story = {
  args: {
    placeholder: 'Search and see results...',
    suggestions: sampleSuggestions,
    results: sampleResults,
    showResults: true,
    searchOnChange: true,
    debounceMs: 500,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    const [results, setResults] = React.useState(sampleResults)
    const [loading, setLoading] = React.useState(false)
    
    const handleSearch = async (searchValue: string) => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Filter results based on search
      const filtered = sampleResults.filter(result =>
        result.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        result.description.toLowerCase().includes(searchValue.toLowerCase())
      )
      setResults(filtered)
      setLoading(false)
    }
    
    return (
      <div className="w-[600px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          results={results}
          loading={loading}
          onSearch={handleSearch}
          onResultClick={(result) => console.log('Clicked result:', result)}
        />
      </div>
    )
  },
}

export const WithRecentSearches: Story = {
  args: {
    placeholder: 'Search...',
    showRecentSearches: true,
    recentSearches: [
      'React hooks',
      'CSS Grid',
      'JavaScript promises',
      'Node.js streams',
    ],
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    const [recentSearches, setRecentSearches] = React.useState(args.recentSearches || [])
    
    return (
      <div className="w-[600px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          recentSearches={recentSearches}
          onClearRecentSearches={() => setRecentSearches([])}
          onSearch={(val) => {
            console.log('Searching for:', val)
            if (!recentSearches.includes(val)) {
              setRecentSearches([val, ...recentSearches.slice(0, 3)])
            }
          }}
        />
      </div>
    )
  },
}

export const MinimalVariant: Story = {
  args: {
    placeholder: 'Type to search...',
    variant: 'minimal',
    showSearchButton: false,
    searchOnChange: true,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[600px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          onSearch={(val) => console.log('Searching for:', val)}
        />
      </div>
    )
  },
}

export const ExpandedVariant: Story = {
  args: {
    placeholder: 'Search everything...',
    variant: 'expanded',
    size: 'lg',
    suggestions: sampleSuggestions,
    filters: sampleFilters,
    showFilters: true,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[700px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          onSearch={(val) => console.log('Searching for:', val)}
        />
      </div>
    )
  },
}

export const SmallSize: Story = {
  args: {
    placeholder: 'Quick search...',
    size: 'sm',
    showSearchButton: false,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[400px]">
        <SearchBar
          {...args}
          value={value}
          onChange={setValue}
          onSearch={(val) => console.log('Searching for:', val)}
        />
      </div>
    )
  },
}

export const Loading: Story = {
  args: {
    placeholder: 'Search...',
    loading: true,
    loadingMessage: 'Searching database...',
    results: [],
    showResults: true,
  },
  render: (args) => (
    <div className="w-[600px]">
      <SearchBar {...args} value="example search" />
    </div>
  ),
}