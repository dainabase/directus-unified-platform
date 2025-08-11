import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimelineEnhanced } from './timeline-enhanced'
import { describe, it, expect, vi } from 'vitest'

const mockEvents = [
  {
    id: '1',
    title: 'Event 1',
    description: 'First event description',
    date: new Date('2024-01-01'),
    status: 'completed' as const,
    type: 'success' as const,
  },
  {
    id: '2',
    title: 'Event 2',
    description: 'Second event description',
    date: new Date('2024-01-15'),
    status: 'current' as const,
    type: 'info' as const,
    progress: 50,
  },
  {
    id: '3',
    title: 'Event 3',
    description: 'Third event description',
    date: new Date('2024-02-01'),
    status: 'upcoming' as const,
    type: 'default' as const,
    tags: ['important', 'milestone'],
  },
]

describe('TimelineEnhanced', () => {
  it('renders all events', () => {
    render(<TimelineEnhanced events={mockEvents} />)
    
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
    expect(screen.getByText('Event 3')).toBeInTheDocument()
  })

  it('renders event descriptions', () => {
    render(<TimelineEnhanced events={mockEvents} />)
    
    expect(screen.getByText('First event description')).toBeInTheDocument()
    expect(screen.getByText('Second event description')).toBeInTheDocument()
    expect(screen.getByText('Third event description')).toBeInTheDocument()
  })

  it('sorts events by date in ascending order by default', () => {
    render(<TimelineEnhanced events={mockEvents} />)
    
    const titles = screen.getAllByText(/Event \d/).map(el => el.textContent)
    expect(titles).toEqual(['Event 1', 'Event 2', 'Event 3'])
  })

  it('sorts events by date in descending order when specified', () => {
    render(<TimelineEnhanced events={mockEvents} sortOrder="desc" />)
    
    const titles = screen.getAllByText(/Event \d/).map(el => el.textContent)
    expect(titles).toEqual(['Event 3', 'Event 2', 'Event 1'])
  })

  it('shows progress bar when showProgress is true', () => {
    render(<TimelineEnhanced events={mockEvents} showProgress />)
    
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('handles event click', async () => {
    const onEventClick = vi.fn()
    const user = userEvent.setup()
    
    render(
      <TimelineEnhanced
        events={mockEvents}
        onEventClick={onEventClick}
        interactive
      />
    )
    
    const event1 = screen.getByText('Event 1').closest('div')
    if (event1) await user.click(event1)
    
    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Event 1' })
    )
  })

  it('renders in cards variant', () => {
    render(<TimelineEnhanced events={mockEvents} variant="cards" />)
    
    // Cards should have specific card classes
    const cards = screen.getAllByText(/Event \d/).map(el => el.closest('[class*="card"]'))
    expect(cards.every(card => card !== null)).toBe(true)
  })

  it('groups events by date when groupByDate is true', () => {
    render(<TimelineEnhanced events={mockEvents} groupByDate />)
    
    // Should show date headers
    expect(screen.getByText(/January.*2024/)).toBeInTheDocument()
    expect(screen.getByText(/February.*2024/)).toBeInTheDocument()
  })

  it('shows tags when present', () => {
    render(<TimelineEnhanced events={mockEvents} />)
    
    expect(screen.getByText('important')).toBeInTheDocument()
    expect(screen.getByText('milestone')).toBeInTheDocument()
  })

  it('handles collapsible events', async () => {
    const collapsibleEvents = mockEvents.map(e => ({ ...e, expandable: true }))
    const user = userEvent.setup()
    
    render(
      <TimelineEnhanced
        events={collapsibleEvents}
        collapsible
        defaultExpanded={false}
      />
    )
    
    // Descriptions should be hidden initially
    expect(screen.queryByText('First event description')).not.toBeInTheDocument()
    
    // Find and click expand button
    const expandButtons = screen.getAllByRole('button')
    const expandButton = expandButtons.find(btn => btn.querySelector('[class*="chevron"]'))
    
    if (expandButton) {
      await user.click(expandButton)
      
      // Description should now be visible
      await waitFor(() => {
        expect(screen.getByText('First event description')).toBeInTheDocument()
      })
    }
  })

  it('shows filters when enabled', async () => {
    const filterOptions = [
      { value: 'completed', label: 'Completed' },
      { value: 'current', label: 'Current' },
    ]
    
    render(
      <TimelineEnhanced
        events={mockEvents}
        showFilters
        filterOptions={filterOptions}
      />
    )
    
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('filters events when filter is clicked', async () => {
    const filterOptions = [
      { value: 'completed', label: 'Completed' },
      { value: 'current', label: 'Current' },
    ]
    const onFilterChange = vi.fn()
    const user = userEvent.setup()
    
    render(
      <TimelineEnhanced
        events={mockEvents}
        showFilters
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
      />
    )
    
    const completedFilter = screen.getByText('Completed')
    await user.click(completedFilter)
    
    expect(onFilterChange).toHaveBeenCalledWith(['completed'])
  })

  it('renders with horizontal orientation', () => {
    render(<TimelineEnhanced events={mockEvents} orientation="horizontal" />)
    
    // Should still render all events
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
    expect(screen.getByText('Event 3')).toBeInTheDocument()
  })

  it('shows user information when provided', () => {
    const eventsWithUser = [{
      ...mockEvents[0],
      user: {
        name: 'John Doe',
        role: 'Developer',
      },
    }]
    
    render(<TimelineEnhanced events={eventsWithUser} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText(/Developer/)).toBeInTheDocument()
  })

  it('shows location when provided', () => {
    const eventsWithLocation = [{
      ...mockEvents[0],
      location: 'San Francisco, CA',
    }]
    
    render(<TimelineEnhanced events={eventsWithLocation} />)
    
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
  })

  it('shows link when provided', () => {
    const eventsWithLink = [{
      ...mockEvents[0],
      link: {
        label: 'View Details',
        url: 'https://example.com',
      },
    }]
    
    render(<TimelineEnhanced events={eventsWithLink} />)
    
    const link = screen.getByText('View Details')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com')
  })

  it('shows attachments when provided', () => {
    const eventsWithAttachments = [{
      ...mockEvents[0],
      attachments: [
        { name: 'document.pdf', size: '2.5MB' },
        { name: 'image.png', size: '1.2MB' },
      ],
    }]
    
    render(<TimelineEnhanced events={eventsWithAttachments} />)
    
    expect(screen.getByText(/document\.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/image\.png/)).toBeInTheDocument()
  })

  it('shows comments when provided', () => {
    const eventsWithComments = [{
      ...mockEvents[0],
      comments: [
        { id: '1', user: 'Alice', text: 'Great work!', date: new Date() },
        { id: '2', user: 'Bob', text: 'Looks good', date: new Date() },
      ],
    }]
    
    render(<TimelineEnhanced events={eventsWithComments} />)
    
    expect(screen.getByText(/Great work!/)).toBeInTheDocument()
    expect(screen.getByText(/Looks good/)).toBeInTheDocument()
  })

  it('respects maxHeight prop with scrollable area', () => {
    render(
      <TimelineEnhanced
        events={mockEvents}
        maxHeight={200}
      />
    )
    
    // Should still render events within scrollable area
    expect(screen.getByText('Event 1')).toBeInTheDocument()
  })

  it('highlights current event when highlightCurrent is true', () => {
    render(
      <TimelineEnhanced
        events={mockEvents}
        highlightCurrent
      />
    )
    
    // Event 2 has status 'current'
    const currentEvent = screen.getByText('Event 2').closest('div')
    expect(currentEvent?.className).toContain('ring')
  })
})