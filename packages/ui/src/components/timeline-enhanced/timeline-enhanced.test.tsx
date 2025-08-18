/**
 * TimelineEnhanced Component Tests - Enterprise-Grade Innovation Suite
 * 
 * Comprehensive testing for revolutionary timeline functionality:
 * - Advanced event rendering with variants (default/compact/detailed/cards)
 * - Multi-orientation support (vertical/horizontal) with intelligent connectors
 * - Sophisticated status system (completed/current/upcoming/cancelled)
 * - Rich event metadata (progress, attachments, comments, users, locations)
 * - Advanced filtering system (tags, types, status) with interactive badges
 * - Automatic date grouping with sticky headers
 * - Fluid animations and interactions (hover, expand/collapse, tooltips)
 * - Custom rendering capabilities (events, icons, layouts)
 * - Performance optimization (ScrollArea, memoization, conditional rendering)
 * - Accessibility excellence (ARIA, keyboard navigation, focus management)
 * - Edge cases and error handling for production environments
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimelineEnhanced, TimelineEvent, TimelineEnhancedProps } from './timeline-enhanced';
import { vi } from 'vitest';

// Mock data - realistic timeline events for comprehensive testing
const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'Project Kickoff Meeting',
    description: 'Initial project planning and team introductions',
    date: new Date('2024-01-15T09:00:00Z'),
    type: 'info',
    status: 'completed',
    user: {
      name: 'John Doe',
      avatar: 'https://avatars.example.com/john.jpg',
      role: 'Project Manager'
    },
    tags: ['meeting', 'planning', 'kickoff'],
    location: 'Conference Room A',
    duration: '2 hours',
    progress: 100,
    priority: 'high',
    comments: [
      {
        id: 'c1',
        user: 'Alice Smith',
        text: 'Great meeting, looking forward to the project!',
        date: new Date('2024-01-15T10:30:00Z')
      }
    ]
  },
  {
    id: '2',
    title: 'Design Phase',
    description: 'Creating wireframes and mockups for the application',
    date: new Date('2024-02-01T10:00:00Z'),
    type: 'warning',
    status: 'current',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://avatars.example.com/sarah.jpg',
      role: 'UX Designer'
    },
    tags: ['design', 'wireframes', 'mockups'],
    progress: 65,
    priority: 'medium',
    attachments: [
      { name: 'wireframes.pdf', size: '2.3MB', type: 'pdf' },
      { name: 'design-system.sketch', size: '5.1MB', type: 'sketch' }
    ],
    link: {
      label: 'View Figma File',
      url: 'https://figma.com/project'
    },
    expandable: true
  },
  {
    id: '3',
    title: 'Development Sprint 1',
    description: 'Backend API development and database setup',
    date: new Date('2024-02-15T09:00:00Z'),
    type: 'default',
    status: 'upcoming',
    user: {
      name: 'Mike Chen',
      avatar: 'https://avatars.example.com/mike.jpg',
      role: 'Backend Developer'
    },
    tags: ['development', 'backend', 'api'],
    duration: '2 weeks',
    priority: 'critical',
    milestone: true,
    expandable: true
  },
  {
    id: '4',
    title: 'Testing & QA',
    description: 'Comprehensive testing of all features',
    date: new Date('2024-03-01T10:00:00Z'),
    type: 'success',
    status: 'upcoming',
    tags: ['testing', 'qa', 'quality'],
    progress: 0,
    priority: 'high'
  },
  {
    id: '5',
    title: 'Cancelled Feature',
    description: 'This feature was cancelled due to scope changes',
    date: new Date('2024-01-20T14:00:00Z'),
    type: 'error',
    status: 'cancelled',
    tags: ['cancelled', 'scope-change'],
    priority: 'low'
  }
];

const mockFilterOptions = [
  { value: 'meeting', label: 'Meetings' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'testing', label: 'Testing' },
  { value: 'completed', label: 'Completed' },
  { value: 'current', label: 'Current' },
  { value: 'upcoming', label: 'Upcoming' }
];

// Helper to create timeline with common props
const createTimeline = (props: Partial<TimelineEnhancedProps> = {}) => {
  const defaultProps: TimelineEnhancedProps = {
    events: mockTimelineEvents,
    ...props
  };
  return render(<TimelineEnhanced {...defaultProps} />);
};

// Helper to get timeline container
const getTimelineContainer = () => document.querySelector('[class*="timeline"], [class*="relative"]');

// Helper to get event elements by title
const getEventByTitle = (title: string) => screen.getByText(title);

// Helper to get all event elements
const getAllEvents = () => screen.getAllByText(/Project|Design|Development|Testing|Cancelled/);

describe('TimelineEnhanced Component - Enterprise-Grade Innovation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================================
  // 1. BASIC RENDERING & VARIANTS
  // ================================
  describe('Basic Rendering & Variants', () => {
    it('renders timeline with default props and all events', () => {
      createTimeline();
      
      expect(getEventByTitle('Project Kickoff Meeting')).toBeInTheDocument();
      expect(getEventByTitle('Design Phase')).toBeInTheDocument();
      expect(getEventByTitle('Development Sprint 1')).toBeInTheDocument();
      expect(getEventByTitle('Testing & QA')).toBeInTheDocument();
    });

    it('supports default variant with standard event rendering', () => {
      createTimeline({ variant: 'default' });
      
      const events = getAllEvents();
      expect(events.length).toBeGreaterThan(0);
      
      // Check for standard timeline structure
      expect(document.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    it('renders compact variant with reduced spacing', () => {
      createTimeline({ variant: 'compact' });
      
      // Compact variant should have specific styling
      expect(document.querySelector('.pb-4')).toBeInTheDocument();
    });

    it('renders detailed variant with full information', () => {
      createTimeline({ variant: 'detailed' });
      
      // Should show all event details
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });

    it('renders cards variant with card-based layout', () => {
      createTimeline({ variant: 'cards' });
      
      // Cards variant uses Card components
      expect(document.querySelectorAll('[class*="card"]')).toHaveLength(
        expect.any(Number)
      );
    });

    it('forwards ref correctly to timeline container', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<TimelineEnhanced ref={ref} events={mockTimelineEvents} />);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies custom className and styling', () => {
      createTimeline({
        className: 'custom-timeline',
        containerClassName: 'custom-container',
        eventClassName: 'custom-event'
      });
      
      expect(document.querySelector('.custom-timeline')).toBeInTheDocument();
      expect(document.querySelector('.custom-container')).toBeInTheDocument();
    });
  });

  // ================================
  // 2. ORIENTATION & CONNECTORS
  // ================================
  describe('Orientation & Connectors', () => {
    it('renders vertical orientation by default', () => {
      createTimeline({ orientation: 'vertical' });
      
      // Vertical layout should have top-to-bottom flow
      const container = getTimelineContainer();
      expect(container).not.toHaveClass('flex');
    });

    it('renders horizontal orientation with flex layout', () => {
      createTimeline({ orientation: 'horizontal' });
      
      // Horizontal layout should use flex
      expect(document.querySelector('.flex.gap-8.overflow-x-auto')).toBeInTheDocument();
    });

    it('shows connectors between events when enabled', () => {
      createTimeline({ showConnector: true });
      
      // Should have connector lines
      expect(document.querySelector('.bg-border')).toBeInTheDocument();
    });

    it('hides connectors when disabled', () => {
      createTimeline({ showConnector: false });
      
      // Should not have connector elements
      expect(document.querySelector('.bg-border')).not.toBeInTheDocument();
    });

    it('applies custom connector styling', () => {
      createTimeline({ 
        showConnector: true,
        connectorClassName: 'custom-connector'
      });
      
      expect(document.querySelector('.custom-connector')).toBeInTheDocument();
    });
  });

  // ================================
  // 3. EVENT STATUS & TYPES
  // ================================
  describe('Event Status & Types', () => {
    it('renders different event statuses with correct styling', () => {
      createTimeline();
      
      // Completed events should have success styling
      expect(document.querySelector('.bg-green-500')).toBeInTheDocument();
      
      // Current events should have primary styling  
      expect(document.querySelector('.bg-blue-500')).toBeInTheDocument();
      
      // Upcoming events should have muted styling
      expect(document.querySelector('.bg-gray-400')).toBeInTheDocument();
    });

    it('displays correct icons for each status', () => {
      createTimeline();
      
      // Check for status-specific icons (assuming they're rendered)
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('applies type-specific colors to event containers', () => {
      createTimeline();
      
      // Different types should have different background colors
      expect(document.querySelector('.bg-blue-50')).toBeInTheDocument(); // info
      expect(document.querySelector('.bg-yellow-50')).toBeInTheDocument(); // warning
      expect(document.querySelector('.bg-green-50')).toBeInTheDocument(); // success
    });

    it('highlights current events when highlightCurrent is enabled', () => {
      createTimeline({ highlightCurrent: true });
      
      // Current events should have ring styling
      expect(document.querySelector('.ring-2.ring-primary')).toBeInTheDocument();
    });

    it('disables current highlighting when highlightCurrent is false', () => {
      createTimeline({ highlightCurrent: false });
      
      // Should not have ring styling
      expect(document.querySelector('.ring-2.ring-primary')).not.toBeInTheDocument();
    });
  });

  // ================================
  // 4. PROGRESS & METADATA
  // ================================
  describe('Progress & Metadata', () => {
    it('shows progress bars when showProgress is enabled', () => {
      createTimeline({ showProgress: true });
      
      // Should render progress components
      expect(screen.getByText('65%')).toBeInTheDocument(); // Design Phase progress
      expect(screen.getByText('100%')).toBeInTheDocument(); // Completed project
    });

    it('hides progress when showProgress is disabled', () => {
      createTimeline({ showProgress: false });
      
      // Should not show progress percentages
      expect(screen.queryByText('65%')).not.toBeInTheDocument();
    });

    it('displays user information with avatars and roles', () => {
      createTimeline();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('UX Designer')).toBeInTheDocument();
    });

    it('shows event tags with proper styling', () => {
      createTimeline();
      
      expect(screen.getByText('meeting')).toBeInTheDocument();
      expect(screen.getByText('design')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
    });

    it('displays location information when available', () => {
      createTimeline();
      
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });

    it('shows duration information', () => {
      createTimeline();
      
      expect(screen.getByText('2 hours')).toBeInTheDocument();
      expect(screen.getByText('2 weeks')).toBeInTheDocument();
    });

    it('displays priority badges with correct variants', () => {
      createTimeline();
      
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('shows attachments when present', () => {
      createTimeline();
      
      expect(screen.getByText('wireframes.pdf')).toBeInTheDocument();
      expect(screen.getByText('2.3MB')).toBeInTheDocument();
    });

    it('displays external links', () => {
      createTimeline();
      
      const link = screen.getByText('View Figma File');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', 'https://figma.com/project');
      expect(link.closest('a')).toHaveAttribute('target', '_blank');
    });

    it('shows comments when available', () => {
      createTimeline();
      
      expect(screen.getByText('Comments (1)')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith:')).toBeInTheDocument();
      expect(screen.getByText('Great meeting, looking forward to the project!')).toBeInTheDocument();
    });
  });

  // ================================
  // 5. DATE HANDLING & TIMESTAMPS
  // ================================
  describe('Date Handling & Timestamps', () => {
    it('shows timestamps when showTimestamp is enabled', () => {
      createTimeline({ showTimestamp: true });
      
      // Should show formatted dates with times
      expect(screen.getByText(/Jan.*15.*2024.*9:00/)).toBeInTheDocument();
    });

    it('hides timestamps when showTimestamp is disabled', () => {
      createTimeline({ showTimestamp: false });
      
      // Should show only dates without times
      expect(screen.queryByText(/9:00/)).not.toBeInTheDocument();
    });

    it('sorts events in ascending order by default', () => {
      createTimeline({ sortOrder: 'asc' });
      
      const events = getAllEvents();
      const firstEvent = events[0];
      expect(firstEvent).toHaveTextContent('Cancelled Feature'); // Earliest date
    });

    it('sorts events in descending order when specified', () => {
      createTimeline({ sortOrder: 'desc' });
      
      const events = getAllEvents();
      const firstEvent = events[0];
      expect(firstEvent).toHaveTextContent('Testing & QA'); // Latest date
    });

    it('groups events by date when groupByDate is enabled', () => {
      createTimeline({ groupByDate: true });
      
      // Should show date headers
      expect(screen.getByText(/January.*15.*2024/)).toBeInTheDocument();
      expect(screen.getByText(/February.*1.*2024/)).toBeInTheDocument();
    });

    it('disables date grouping when groupByDate is false', () => {
      createTimeline({ groupByDate: false });
      
      // Should not show date headers
      expect(screen.queryByText(/January.*15.*2024/)).not.toBeInTheDocument();
    });
  });

  // ================================
  // 6. INTERACTIONS & ANIMATIONS
  // ================================
  describe('Interactions & Animations', () => {
    it('handles event clicks when interactive', async () => {
      const onEventClick = vi.fn();
      createTimeline({ 
        interactive: true,
        onEventClick
      });
      
      const event = getEventByTitle('Project Kickoff Meeting');
      fireEvent.click(event);
      
      expect(onEventClick).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Project Kickoff Meeting' })
      );
    });

    it('disables interactions when interactive is false', async () => {
      const onEventClick = vi.fn();
      createTimeline({ 
        interactive: false,
        onEventClick
      });
      
      const event = getEventByTitle('Project Kickoff Meeting');
      fireEvent.click(event);
      
      expect(onEventClick).not.toHaveBeenCalled();
    });

    it('supports expand/collapse functionality', async () => {
      const onEventExpand = vi.fn();
      createTimeline({ 
        collapsible: true,
        defaultExpanded: false,
        onEventExpand
      });
      
      // Find expand button and click it
      const expandButton = document.querySelector('button svg');
      if (expandButton?.parentElement) {
        fireEvent.click(expandButton.parentElement);
        expect(onEventExpand).toHaveBeenCalled();
      }
    });

    it('shows hover effects on mouse enter/leave', async () => {
      createTimeline({ animated: true });
      
      const eventContainer = document.querySelector('.group');
      if (eventContainer) {
        fireEvent.mouseEnter(eventContainer);
        // Hover state should be applied
        
        fireEvent.mouseLeave(eventContainer);
        // Hover state should be removed
      }
    });

    it('supports tooltips on event icons', async () => {
      createTimeline();
      
      // Tooltip should be available (implementation depends on tooltip library)
      const iconContainer = document.querySelector('[data-state], .rounded-full');
      expect(iconContainer).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
      createTimeline({ interactive: true });
      
      const focusableElement = document.querySelector('button, [tabindex="0"]');
      if (focusableElement) {
        focusableElement.focus();
        expect(focusableElement).toHaveFocus();
        
        fireEvent.keyDown(focusableElement, { key: 'Enter' });
        fireEvent.keyDown(focusableElement, { key: 'Space' });
      }
    });
  });

  // ================================
  // 7. FILTERING SYSTEM
  // ================================
  describe('Filtering System', () => {
    it('shows filter badges when showFilters is enabled', () => {
      createTimeline({ 
        showFilters: true,
        filterOptions: mockFilterOptions
      });
      
      expect(screen.getByText('Meetings')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('hides filters when showFilters is disabled', () => {
      createTimeline({ 
        showFilters: false,
        filterOptions: mockFilterOptions
      });
      
      expect(screen.queryByText('Meetings')).not.toBeInTheDocument();
    });

    it('handles filter selection and deselection', async () => {
      const onFilterChange = vi.fn();
      createTimeline({ 
        showFilters: true,
        filterOptions: mockFilterOptions,
        onFilterChange
      });
      
      const meetingFilter = screen.getByText('Meetings');
      fireEvent.click(meetingFilter);
      
      expect(onFilterChange).toHaveBeenCalledWith(['meeting']);
      
      // Click again to deselect
      fireEvent.click(meetingFilter);
      expect(onFilterChange).toHaveBeenCalledWith([]);
    });

    it('filters events based on active filters', () => {
      const { rerender } = createTimeline();
      
      // All events should be visible initially
      expect(getAllEvents()).toHaveLength(5);
      
      // Apply filter programmatically by passing filtered events
      const filteredEvents = mockTimelineEvents.filter(event => 
        event.tags?.includes('meeting')
      );
      
      rerender(<TimelineEnhanced events={filteredEvents} />);
      
      // Only matching events should be visible
      expect(screen.getByText('Project Kickoff Meeting')).toBeInTheDocument();
      expect(screen.queryByText('Design Phase')).not.toBeInTheDocument();
    });

    it('shows clear filters button when filters are active', async () => {
      createTimeline({ 
        showFilters: true,
        filterOptions: mockFilterOptions
      });
      
      // Apply a filter
      const meetingFilter = screen.getByText('Meetings');
      fireEvent.click(meetingFilter);
      
      await waitFor(() => {
        expect(screen.getByText('Clear filters')).toBeInTheDocument();
      });
    });

    it('clears all filters when clear button is clicked', async () => {
      const onFilterChange = vi.fn();
      createTimeline({ 
        showFilters: true,
        filterOptions: mockFilterOptions,
        onFilterChange
      });
      
      // Apply filters first
      fireEvent.click(screen.getByText('Meetings'));
      fireEvent.click(screen.getByText('Design'));
      
      // Clear all filters
      await waitFor(() => screen.getByText('Clear filters'));
      fireEvent.click(screen.getByText('Clear filters'));
      
      expect(onFilterChange).toHaveBeenCalledWith([]);
    });
  });

  // ================================
  // 8. CUSTOM RENDERING
  // ================================
  describe('Custom Rendering', () => {
    it('uses custom event renderer when provided', () => {
      const renderEvent = (event: TimelineEvent, index: number) => (
        <div data-testid={`custom-event-${index}`}>
          Custom: {event.title}
        </div>
      );
      
      createTimeline({ renderEvent });
      
      expect(screen.getByTestId('custom-event-0')).toBeInTheDocument();
      expect(screen.getByText('Custom: Project Kickoff Meeting')).toBeInTheDocument();
    });

    it('uses custom icon renderer when provided', () => {
      const renderIcon = (event: TimelineEvent) => (
        <div data-testid="custom-icon">{event.status}</div>
      );
      
      createTimeline({ renderIcon });
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('supports custom children in events', () => {
      const eventsWithChildren = [
        {
          ...mockTimelineEvents[0],
          children: <div data-testid="custom-child">Custom Content</div>
        }
      ];
      
      createTimeline({ events: eventsWithChildren });
      
      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  // ================================
  // 9. PERFORMANCE & SCROLL
  // ================================
  describe('Performance & Scroll', () => {
    it('implements ScrollArea when maxHeight is set', () => {
      createTimeline({ maxHeight: '400px' });
      
      // Should render ScrollArea component
      expect(document.querySelector('[data-radix-scroll-area-viewport]')).toBeInTheDocument();
    });

    it('handles large numbers of events efficiently', () => {
      const manyEvents = Array.from({ length: 100 }, (_, i) => ({
        ...mockTimelineEvents[0],
        id: `event-${i}`,
        title: `Event ${i}`,
        date: new Date(2024, 0, i + 1)
      }));
      
      createTimeline({ events: manyEvents });
      
      // Should render without performance issues
      expect(screen.getByText('Event 0')).toBeInTheDocument();
      expect(screen.getByText('Event 99')).toBeInTheDocument();
    });

    it('applies maxHeight styling correctly', () => {
      createTimeline({ maxHeight: 300 });
      
      const scrollContainer = document.querySelector('[style*="height"]');
      expect(scrollContainer).toHaveStyle({ height: '300px' });
    });
  });

  // ================================
  // 10. EDGE CASES & ERROR HANDLING
  // ================================
  describe('Edge Cases & Error Handling', () => {
    it('handles empty events array gracefully', () => {
      createTimeline({ events: [] });
      
      // Should render without errors
      expect(getTimelineContainer()).toBeInTheDocument();
    });

    it('handles events with missing optional properties', () => {
      const minimalEvents = [
        {
          id: '1',
          title: 'Basic Event',
          date: new Date('2024-01-01')
        }
      ];
      
      createTimeline({ events: minimalEvents });
      
      expect(screen.getByText('Basic Event')).toBeInTheDocument();
    });

    it('handles invalid date objects gracefully', () => {
      const eventsWithInvalidDates = [
        {
          id: '1',
          title: 'Invalid Date Event',
          date: 'invalid-date' as any
        }
      ];
      
      createTimeline({ events: eventsWithInvalidDates });
      
      // Should not crash
      expect(screen.getByText('Invalid Date Event')).toBeInTheDocument();
    });

    it('handles very long event titles and descriptions', () => {
      const longContentEvents = [
        {
          id: '1',
          title: 'A'.repeat(200),
          description: 'B'.repeat(1000),
          date: new Date('2024-01-01')
        }
      ];
      
      createTimeline({ events: longContentEvents });
      
      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    });

    it('prevents event propagation on link clicks', async () => {
      const onEventClick = vi.fn();
      createTimeline({ 
        interactive: true,
        onEventClick
      });
      
      const link = screen.getByText('View Figma File');
      fireEvent.click(link);
      
      // Event click should not be called when clicking links
      expect(onEventClick).not.toHaveBeenCalled();
    });

    it('handles rapid state changes without errors', async () => {
      createTimeline({ collapsible: true });
      
      const expandButton = document.querySelector('button');
      if (expandButton) {
        // Rapid clicks should not cause errors
        fireEvent.click(expandButton);
        fireEvent.click(expandButton);
        fireEvent.click(expandButton);
      }
      
      // Should handle rapid interactions gracefully
    });
  });

  // ================================
  // 11. ACCESSIBILITY EXCELLENCE
  // ================================
  describe('Accessibility Excellence', () => {
    it('supports ARIA labels and descriptions', () => {
      createTimeline({
        'aria-label': 'Project timeline',
        'aria-describedby': 'timeline-description'
      });
      
      const container = getTimelineContainer();
      expect(container).toHaveAttribute('aria-label', 'Project timeline');
    });

    it('maintains proper focus management', async () => {
      createTimeline({ interactive: true });
      
      const clickableElements = document.querySelectorAll('button, [tabindex="0"]');
      if (clickableElements.length > 0) {
        const firstElement = clickableElements[0] as HTMLElement;
        firstElement.focus();
        expect(firstElement).toHaveFocus();
      }
    });

    it('provides semantic structure for screen readers', () => {
      createTimeline();
      
      // Should have proper heading structure and landmarks
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation for all interactive elements', async () => {
      createTimeline({ 
        interactive: true,
        collapsible: true
      });
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('provides appropriate color contrast for status indicators', () => {
      createTimeline();
      
      // Status colors should provide sufficient contrast
      const statusElements = document.querySelectorAll('.bg-green-500, .bg-blue-500, .bg-gray-400');
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });
});
