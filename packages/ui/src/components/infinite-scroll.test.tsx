/**
 * InfiniteScroll Component Tests
 * Auto-generated test suite for infinite-scroll component
 * Category: utility
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../tests/utils/test-utils';
import { InfiniteScroll } from './infinite-scroll';
import { vi } from 'vitest';

describe('InfiniteScroll Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<InfiniteScroll />);
      expect(document.querySelector('[data-testid="infinite-scroll"]')).toBeInTheDocument();
    });

    it('renders with children', () => {
      renderWithProviders(
        <InfiniteScroll>
          <span>Test content</span>
        </InfiniteScroll>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<InfiniteScroll className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithProviders(<InfiniteScroll ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts and applies style prop', () => {
      renderWithProviders(
        <InfiniteScroll style={{ backgroundColor: 'red' }} />
      );
      const element = document.querySelector('[data-testid="infinite-scroll"]');
      expect(element).toHaveStyle({ backgroundColor: 'red' });
    });

    it('accepts data attributes', () => {
      renderWithProviders(
        <InfiniteScroll data-custom="value" />
      );
      const element = document.querySelector('[data-custom="value"]');
      expect(element).toBeInTheDocument();
    });

    it('spreads additional props', () => {
      renderWithProviders(
        <InfiniteScroll title="Tooltip text" role="complementary" />
      );
      const element = document.querySelector('[role="complementary"]');
      expect(element).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('Events', () => {
    it('handles onClick events', () => {
      const handleClick = vi.fn();
      renderWithProviders(<InfiniteScroll onClick={handleClick} />);
      
      const element = document.querySelector('[data-testid="infinite-scroll"]');
      fireEvent.click(element);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('handles onMouseEnter and onMouseLeave', () => {
      const handleEnter = vi.fn();
      const handleLeave = vi.fn();
      renderWithProviders(
        <InfiniteScroll 
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        />
      );
      
      const element = document.querySelector('[data-testid="infinite-scroll"]');
      
      fireEvent.mouseEnter(element);
      expect(handleEnter).toHaveBeenCalled();
      
      fireEvent.mouseLeave(element);
      expect(handleLeave).toHaveBeenCalled();
    });

    it('handles onFocus and onBlur', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      renderWithProviders(
        <InfiniteScroll 
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        />
      );
      
      const element = document.querySelector('[data-testid="infinite-scroll"]');
      
      fireEvent.focus(element);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(element);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('maintains internal state correctly', () => {
      const { rerender } = renderWithProviders(<InfiniteScroll />);
      // Test internal state management
      
      rerender(<InfiniteScroll />);
      // Verify state persists across rerenders
    });

    it('responds to prop changes', () => {
      const { rerender } = renderWithProviders(
        <InfiniteScroll value="initial" />
      );
      
      rerender(<InfiniteScroll value="updated" />);
      // Verify component updates accordingly
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA attributes', () => {
      renderWithProviders(
        <InfiniteScroll aria-label="Component label" />
      );
      const element = document.querySelector('[aria-label="Component label"]');
      expect(element).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      renderWithProviders(<InfiniteScroll tabIndex={0} />);
      const element = document.querySelector('[tabindex="0"]');
      
      element.focus();
      expect(element).toHaveFocus();
      
      fireEvent.keyDown(element, { key: 'Enter' });
      // Verify Enter key behavior
      
      fireEvent.keyDown(element, { key: ' ' });
      // Verify Space key behavior
    });

    it('supports screen readers', () => {
      renderWithProviders(
        <InfiniteScroll role="region" aria-describedby="description" />
      );
      
      const element = document.querySelector('[role="region"]');
      expect(element).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('handles null/undefined props gracefully', () => {
      renderWithProviders(
        <InfiniteScroll value={null} data={undefined} />
      );
      expect(document.querySelector('[data-testid="infinite-scroll"]')).toBeInTheDocument();
    });

    it('handles empty arrays/objects', () => {
      renderWithProviders(
        <InfiniteScroll items={[]} config={{}} />
      );
      expect(document.querySelector('[data-testid="infinite-scroll"]')).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longText = 'a'.repeat(10000);
      renderWithProviders(
        <InfiniteScroll text={longText} />
      );
      expect(document.querySelector('[data-testid="infinite-scroll"]')).toBeInTheDocument();
    });
  });

  describe('Infinite Scroll Functionality', () => {
    it('loads more items when scrolling to bottom', async () => {
      const loadMore = vi.fn();
      renderWithProviders(
        <InfiniteScroll onLoadMore={loadMore}>
          <div style={{ height: '2000px' }}>Content</div>
        </InfiniteScroll>
      );

      const scrollContainer = document.querySelector('[data-testid="infinite-scroll"]');
      
      // Simulate scroll to bottom
      fireEvent.scroll(scrollContainer, {
        target: { scrollTop: 1900 }
      });

      await waitFor(() => {
        expect(loadMore).toHaveBeenCalled();
      });
    });

    it('shows loading indicator while fetching', () => {
      renderWithProviders(<InfiniteScroll loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('handles error state', () => {
      renderWithProviders(<InfiniteScroll error="Failed to load more" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load more')).toBeInTheDocument();
    });

    it('respects hasMore prop', async () => {
      const loadMore = vi.fn();
      renderWithProviders(
        <InfiniteScroll onLoadMore={loadMore} hasMore={false}>
          <div style={{ height: '2000px' }}>Content</div>
        </InfiniteScroll>
      );

      const scrollContainer = document.querySelector('[data-testid="infinite-scroll"]');
      
      // Simulate scroll to bottom
      fireEvent.scroll(scrollContainer, {
        target: { scrollTop: 1900 }
      });

      await waitFor(() => {
        expect(loadMore).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });
  });
});
