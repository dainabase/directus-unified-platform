/**
 * SearchBar Component Tests - Enterprise-Grade Specialized Suite
 * 
 * Comprehensive testing for advanced search functionality:
 * - Intelligent search with debounce and auto-search
 * - Dynamic suggestions (recent/trending/popular/saved) 
 * - Advanced filters (checkbox/radio/select/range) with popover
 * - Real-time results with custom rendering and thumbnails
 * - Keyboard navigation (Enter/Escape) and focus management
 * - Recent searches management with persistence
 * - Multiple variants (default/minimal/expanded) and sizes (sm/md/lg)
 * - Loading states and customizable messages
 * - Edge cases and performance optimization
 * - Accessibility and ARIA compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar, SearchSuggestion, SearchFilter, SearchResult, SearchBarProps } from './search-bar';
import { vi } from 'vitest';

// Mock data - realistic search data for testing
const mockSuggestions: SearchSuggestion[] = [
  {
    id: '1',
    text: 'React hooks tutorial',
    type: 'trending',
    category: 'Programming'
  },
  {
    id: '2', 
    text: 'JavaScript best practices',
    type: 'popular',
    category: 'Development'
  },
  {
    id: '3',
    text: 'TypeScript guide',
    type: 'recent',
    category: 'Programming'
  },
  {
    id: '4',
    text: 'Node.js API development',
    type: 'saved',
    category: 'Backend'
  },
  {
    id: '5',
    text: 'CSS Grid layout',
    type: 'trending',
    category: 'Frontend'
  }
];

const mockFilters: SearchFilter[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'checkbox',
    options: [
      { value: 'programming', label: 'Programming' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' }
    ]
  },
  {
    id: 'difficulty',
    label: 'Difficulty',
    type: 'radio',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' }
    ]
  }
];

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Complete React Hooks Guide',
    description: 'Learn React hooks from useState to custom hooks with practical examples',
    category: 'Programming',
    tags: ['React', 'JavaScript', 'Hooks'],
    thumbnail: 'https://example.com/thumb1.jpg',
    url: 'https://example.com/react-hooks'
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    description: 'Master TypeScript with advanced patterns and best practices',
    category: 'Programming', 
    tags: ['TypeScript', 'JavaScript', 'Patterns'],
    thumbnail: 'https://example.com/thumb2.jpg',
    url: 'https://example.com/typescript'
  },
  {
    id: '3',
    title: 'CSS Grid Complete Course',
    description: 'Master CSS Grid layout system with hands-on projects',
    category: 'Frontend',
    tags: ['CSS', 'Grid', 'Layout'],
    url: 'https://example.com/css-grid'
  }
];

const mockRecentSearches = [
  'React components',
  'Vue.js tutorial', 
  'Node.js authentication'
];

// Helper to create search bar with common props
const createSearchBar = (props: Partial<SearchBarProps> = {}) => {
  const defaultProps: SearchBarProps = {
    suggestions: mockSuggestions,
    filters: mockFilters,
    results: mockResults,
    ...props
  };
  return render(<SearchBar {...defaultProps} />);
};

// Helper to get search input element
const getSearchInput = () => screen.getByRole('searchbox');

// Helper to type in search input
const typeInSearch = async (text: string) => {
  const user = userEvent.setup();
  const input = getSearchInput();
  await user.type(input, text);
  return input;
};

describe('SearchBar Component - Enterprise-Grade Testing Suite', () => {
  // ================================
  // 1. BASIC RENDERING & PROPS
  // ================================
  describe('Basic Rendering & Props', () => {
    it('renders search input with default props', () => {
      createSearchBar();
      const input = getSearchInput();
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search...');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('applies custom placeholder and className', () => {
      createSearchBar({
        placeholder: 'Search for tutorials...',
        className: 'custom-search',
        inputClassName: 'custom-input'
      });
      
      const input = getSearchInput();
      expect(input).toHaveAttribute('placeholder', 'Search for tutorials...');
      expect(input.parentElement?.parentElement).toHaveClass('custom-search');
      expect(input).toHaveClass('custom-input');
    });

    it('supports different sizes (sm, md, lg)', () => {
      const { rerender } = createSearchBar({ size: 'sm' });
      let input = getSearchInput();
      expect(input).toHaveClass('h-8', 'text-sm');

      rerender(<SearchBar size="md" />);
      input = getSearchInput();
      expect(input).toHaveClass('h-10');

      rerender(<SearchBar size="lg" />);
      input = getSearchInput();
      expect(input).toHaveClass('h-12', 'text-lg');
    });

    it('supports different variants (default, minimal, expanded)', () => {
      const { rerender } = createSearchBar({ variant: 'default' });
      let input = getSearchInput();
      expect(input).toHaveClass('border', 'rounded-md');

      rerender(<SearchBar variant="minimal" />);
      input = getSearchInput();
      expect(input).toHaveClass('border-b', 'rounded-none');

      rerender(<SearchBar variant="expanded" />);
      input = getSearchInput();
      expect(input).toHaveClass('border', 'rounded-lg', 'shadow-sm');
    });

    it('forwards ref correctly to input', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<SearchBar ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(getSearchInput());
    });

    it('supports autoFocus and controlled value', () => {
      createSearchBar({ 
        autoFocus: true,
        value: 'initial search'
      });
      
      const input = getSearchInput();
      expect(input).toHaveFocus();
      expect(input).toHaveValue('initial search');
    });
  });

  // ================================
  // 2. SEARCH FUNCTIONALITY
  // ================================
  describe('Search Functionality', () => {
    it('handles basic search input and onChange', async () => {
      const onChange = vi.fn();
      createSearchBar({ onChange });
      
      await typeInSearch('React');
      
      expect(onChange).toHaveBeenCalledWith('React');
      expect(getSearchInput()).toHaveValue('React');
    });

    it('triggers search on Enter key', async () => {
      const onSearch = vi.fn();
      createSearchBar({ onSearch });
      
      const input = await typeInSearch('TypeScript');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(onSearch).toHaveBeenCalledWith('TypeScript', {});
    });

    it('triggers search on search button click', async () => {
      const onSearch = vi.fn();
      createSearchBar({ onSearch, showSearchButton: true });
      
      await typeInSearch('JavaScript');
      fireEvent.click(screen.getByRole('button', { name: 'Search' }));
      
      expect(onSearch).toHaveBeenCalledWith('JavaScript', {});
    });

    it('implements debounced search when searchOnChange is enabled', async () => {
      vi.useFakeTimers();
      const onSearch = vi.fn();
      createSearchBar({ 
        onSearch, 
        searchOnChange: true, 
        debounceMs: 300 
      });
      
      await typeInSearch('Vue');
      
      // Should not search immediately
      expect(onSearch).not.toHaveBeenCalled();
      
      // Fast forward timer
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('Vue', {});
      });
      
      vi.useRealTimers();
    });

    it('shows and hides search button based on showSearchButton prop', () => {
      const { rerender } = createSearchBar({ showSearchButton: true });
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();

      rerender(<SearchBar showSearchButton={false} />);
      expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument();
    });

    it('disables search button when input is empty or searching', async () => {
      createSearchBar({ showSearchButton: true });
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      expect(searchButton).toBeDisabled();
      
      await typeInSearch('test');
      expect(searchButton).not.toBeDisabled();
    });

    it('clears search with X button', async () => {
      const onClear = vi.fn();
      const onChange = vi.fn();
      createSearchBar({ onClear, onChange });
      
      await typeInSearch('test query');
      
      const clearButton = document.querySelector('button[type="button"]');
      expect(clearButton).toBeInTheDocument();
      
      fireEvent.click(clearButton!);
      
      expect(getSearchInput()).toHaveValue('');
      expect(onClear).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  // ================================
  // 3. SUGGESTIONS SYSTEM
  // ================================
  describe('Suggestions System', () => {
    it('shows suggestions when typing and showSuggestions is true', async () => {
      createSearchBar({ showSuggestions: true });
      
      await typeInSearch('React');
      
      await waitFor(() => {
        expect(screen.getByText('React hooks tutorial')).toBeInTheDocument();
      });
    });

    it('hides suggestions when showSuggestions is false', async () => {
      createSearchBar({ showSuggestions: false });
      
      await typeInSearch('React');
      
      expect(screen.queryByText('React hooks tutorial')).not.toBeInTheDocument();
    });

    it('limits suggestions by maxSuggestions', async () => {
      createSearchBar({ 
        showSuggestions: true,
        maxSuggestions: 2 
      });
      
      await typeInSearch('a');
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('button').filter(btn => 
          btn.textContent?.includes('tutorial') || 
          btn.textContent?.includes('practices')
        );
        expect(suggestions).toHaveLength(2);
      });
    });

    it('displays different suggestion types with correct icons', async () => {
      createSearchBar({ showSuggestions: true });
      
      await typeInSearch('a');
      
      await waitFor(() => {
        // Check for different suggestion types in the DOM
        expect(screen.getByText('React hooks tutorial')).toBeInTheDocument(); // trending
        expect(screen.getByText('JavaScript best practices')).toBeInTheDocument(); // popular
        expect(screen.getByText('TypeScript guide')).toBeInTheDocument(); // recent
      });
    });

    it('handles suggestion clicks', async () => {
      const onSuggestionClick = vi.fn();
      const onChange = vi.fn();
      createSearchBar({ 
        showSuggestions: true,
        onSuggestionClick,
        onChange
      });
      
      await typeInSearch('React');
      await waitFor(() => screen.getByText('React hooks tutorial'));
      
      fireEvent.click(screen.getByText('React hooks tutorial'));
      
      expect(onSuggestionClick).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'React hooks tutorial' })
      );
      expect(onChange).toHaveBeenCalledWith('React hooks tutorial');
    });

    it('supports custom renderSuggestion', async () => {
      const renderSuggestion = (suggestion: SearchSuggestion) => (
        <div data-testid="custom-suggestion">
          Custom: {suggestion.text}
        </div>
      );
      
      createSearchBar({ 
        showSuggestions: true,
        renderSuggestion
      });
      
      await typeInSearch('React');
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-suggestion')).toBeInTheDocument();
        expect(screen.getByText('Custom: React hooks tutorial')).toBeInTheDocument();
      });
    });

    it('shows recent searches when enabled', async () => {
      createSearchBar({
        showSuggestions: true,
        showRecentSearches: true,
        recentSearches: mockRecentSearches
      });
      
      await typeInSearch('a');
      
      await waitFor(() => {
        expect(screen.getByText('Recent searches')).toBeInTheDocument();
        expect(screen.getByText('React components')).toBeInTheDocument();
        expect(screen.getByText('Vue.js tutorial')).toBeInTheDocument();
      });
    });

    it('clears recent searches when clear all is clicked', async () => {
      const onClearRecentSearches = vi.fn();
      createSearchBar({
        showSuggestions: true,
        showRecentSearches: true,
        recentSearches: mockRecentSearches,
        onClearRecentSearches
      });
      
      await typeInSearch('a');
      
      await waitFor(() => screen.getByText('Clear all'));
      fireEvent.click(screen.getByText('Clear all'));
      
      expect(onClearRecentSearches).toHaveBeenCalled();
    });
  });

  // ================================
  // 4. FILTERS SYSTEM
  // ================================
  describe('Filters System', () => {
    it('shows filters button when filters exist and showFilters is true', () => {
      createSearchBar({ 
        showFilters: true,
        filters: mockFilters
      });
      
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('hides filters when showFilters is false', () => {
      createSearchBar({ 
        showFilters: false,
        filters: mockFilters
      });
      
      expect(screen.queryByRole('button', { name: /filters/i })).not.toBeInTheDocument();
    });

    it('opens filters popover when filters button is clicked', async () => {
      createSearchBar({ 
        showFilters: true,
        filters: mockFilters
      });
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Difficulty')).toBeInTheDocument();
      });
    });

    it('handles checkbox filter changes', async () => {
      const onFilterChange = vi.fn();
      createSearchBar({ 
        showFilters: true,
        filters: mockFilters,
        onFilterChange
      });
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      await waitFor(() => screen.getByLabelText('Programming'));
      fireEvent.click(screen.getByLabelText('Programming'));
      
      expect(onFilterChange).toHaveBeenCalledWith({
        category: ['programming']
      });
    });

    it('handles radio filter changes', async () => {
      const onFilterChange = vi.fn();
      createSearchBar({ 
        showFilters: true,
        filters: mockFilters,
        onFilterChange
      });
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      await waitFor(() => screen.getByLabelText('Beginner'));
      fireEvent.click(screen.getByLabelText('Beginner'));
      
      expect(onFilterChange).toHaveBeenCalledWith({
        difficulty: 'beginner'
      });
    });

    it('shows active filter count badge', async () => {
      createSearchBar({ 
        showFilters: true,
        filters: mockFilters
      });
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      await waitFor(() => screen.getByLabelText('Programming'));
      fireEvent.click(screen.getByLabelText('Programming'));
      
      await waitFor(() => {
        const filtersButton = screen.getByRole('button', { name: /filters/i });
        expect(filtersButton).toHaveTextContent('1');
      });
    });

    it('clears all filters when clear button is clicked', async () => {
      const onFilterChange = vi.fn();
      createSearchBar({ 
        showFilters: true,
        filters: mockFilters,
        onFilterChange
      });
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Set some filters first
      await waitFor(() => screen.getByLabelText('Programming'));
      fireEvent.click(screen.getByLabelText('Programming'));
      
      // Clear filters
      fireEvent.click(screen.getByRole('button', { name: /clear all filters/i }));
      
      expect(onFilterChange).toHaveBeenCalledWith({});
    });
  });

  // ================================
  // 5. RESULTS DISPLAY
  // ================================
  describe('Results Display', () => {
    it('shows results when showResults is true', async () => {
      createSearchBar({ 
        showResults: true,
        results: mockResults
      });
      
      await typeInSearch('React');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Complete React Hooks Guide')).toBeInTheDocument();
        expect(screen.getByText('Advanced TypeScript Patterns')).toBeInTheDocument();
      });
    });

    it('limits results by maxResults', async () => {
      createSearchBar({ 
        showResults: true,
        results: mockResults,
        maxResults: 1
      });
      
      await typeInSearch('test');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Complete React Hooks Guide')).toBeInTheDocument();
        expect(screen.queryByText('Advanced TypeScript Patterns')).not.toBeInTheDocument();
      });
    });

    it('handles result clicks', async () => {
      const onResultClick = vi.fn();
      createSearchBar({ 
        showResults: true,
        results: mockResults,
        onResultClick
      });
      
      await typeInSearch('React');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => screen.getByText('Complete React Hooks Guide'));
      fireEvent.click(screen.getByText('Complete React Hooks Guide'));
      
      expect(onResultClick).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Complete React Hooks Guide' })
      );
    });

    it('supports custom renderResult', async () => {
      const renderResult = (result: SearchResult) => (
        <div data-testid="custom-result">
          Custom: {result.title}
        </div>
      );
      
      createSearchBar({ 
        showResults: true,
        results: mockResults,
        renderResult
      });
      
      await typeInSearch('test');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-result')).toBeInTheDocument();
        expect(screen.getByText('Custom: Complete React Hooks Guide')).toBeInTheDocument();
      });
    });

    it('shows loading state', async () => {
      createSearchBar({ 
        showResults: true,
        loading: true,
        loadingMessage: 'Finding results...'
      });
      
      await typeInSearch('test');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Finding results...')).toBeInTheDocument();
      });
    });

    it('shows empty state when no results', async () => {
      createSearchBar({ 
        showResults: true,
        results: [],
        emptyStateMessage: 'Nothing found'
      });
      
      await typeInSearch('test');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Nothing found')).toBeInTheDocument();
      });
    });
  });

  // ================================
  // 6. KEYBOARD NAVIGATION
  // ================================
  describe('Keyboard Navigation', () => {
    it('closes suggestions on Escape key', async () => {
      createSearchBar({ showSuggestions: true });
      
      await typeInSearch('React');
      await waitFor(() => screen.getByText('React hooks tutorial'));
      
      fireEvent.keyDown(getSearchInput(), { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('React hooks tutorial')).not.toBeInTheDocument();
      });
    });

    it('closes results on Escape key', async () => {
      createSearchBar({ showResults: true });
      
      await typeInSearch('test');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      await waitFor(() => screen.getByText('Complete React Hooks Guide'));
      
      fireEvent.keyDown(getSearchInput(), { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Complete React Hooks Guide')).not.toBeInTheDocument();
      });
    });

    it('maintains focus on input after interactions', async () => {
      createSearchBar({ showSuggestions: true });
      
      const input = await typeInSearch('React');
      await waitFor(() => screen.getByText('React hooks tutorial'));
      
      fireEvent.click(screen.getByText('React hooks tutorial'));
      
      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });
  });

  // ================================
  // 7. EDGE CASES & ERROR HANDLING
  // ================================
  describe('Edge Cases & Error Handling', () => {
    it('handles empty suggestions gracefully', async () => {
      createSearchBar({ 
        showSuggestions: true,
        suggestions: []
      });
      
      await typeInSearch('test');
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles async search errors gracefully', async () => {
      const onSearch = vi.fn().mockRejectedValue(new Error('Search failed'));
      createSearchBar({ onSearch });
      
      await typeInSearch('test');
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      // Should not throw error
      expect(onSearch).toHaveBeenCalled();
    });

    it('handles very long search queries', async () => {
      const longQuery = 'a'.repeat(1000);
      createSearchBar();
      
      await typeInSearch(longQuery);
      
      expect(getSearchInput()).toHaveValue(longQuery);
    });

    it('prevents search with empty value', async () => {
      const onSearch = vi.fn();
      createSearchBar({ onSearch });
      
      fireEvent.keyDown(getSearchInput(), { key: 'Enter' });
      
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('cleans up debounce timeout on unmount', () => {
      const { unmount } = createSearchBar({ 
        searchOnChange: true,
        debounceMs: 1000
      });
      
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  // ================================
  // 8. ACCESSIBILITY & PERFORMANCE
  // ================================
  describe('Accessibility & Performance', () => {
    it('supports standard input attributes', () => {
      createSearchBar({
        'aria-label': 'Search for content',
        'aria-describedby': 'search-help',
        autoComplete: 'off'
      });
      
      const input = getSearchInput();
      expect(input).toHaveAttribute('aria-label', 'Search for content');
      expect(input).toHaveAttribute('aria-describedby', 'search-help');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('maintains proper focus management', async () => {
      createSearchBar({ autoFocus: true });
      
      expect(getSearchInput()).toHaveFocus();
    });

    it('handles rapid typing without performance issues', async () => {
      const onChange = vi.fn();
      createSearchBar({ onChange, debounceMs: 50 });
      
      const input = getSearchInput();
      
      // Simulate rapid typing
      await userEvent.type(input, 'test', { delay: 10 });
      
      // Should still work correctly
      expect(onChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
    });
  });
});
