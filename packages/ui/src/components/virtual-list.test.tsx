/**
 * VirtualList Component Tests
 * Auto-generated test suite for virtual-list component
 * Category: utility
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../tests/utils/test-utils';
import { VirtualList } from './virtual-list';
import { vi } from 'vitest';

describe('VirtualList Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<VirtualList />);
      expect(document.querySelector('[data-testid="virtual-list"]')).toBeInTheDocument();
    });

    it('renders with children', () => {
      renderWithProviders(
        <VirtualList>
          <span>Test content</span>
        </VirtualList>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<VirtualList className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithProviders(<VirtualList ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts and applies style prop', () => {
      renderWithProviders(
        <VirtualList style={{ backgroundColor: 'red' }} />
      );
      const element = document.querySelector('[data-testid="virtual-list"]');
      expect(element).toHaveStyle({ backgroundColor: 'red' });
    });

    it('accepts data attributes', () => {
      renderWithProviders(
        <VirtualList data-custom="value" />
      );
      const element = document.querySelector('[data-custom="value"]');
      expect(element).toBeInTheDocument();
    });

    it('spreads additional props', () => {
      renderWithProviders(
        <VirtualList title="Tooltip text" role="complementary" />
      );
      const element = document.querySelector('[role="complementary"]');
      expect(element).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('Events', () => {
    it('handles onClick events', () => {
      const handleClick = vi.fn();
      renderWithProviders(<VirtualList onClick={handleClick} />);
      
      const element = document.querySelector('[data-testid="virtual-list"]');
      fireEvent.click(element);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('handles onMouseEnter and onMouseLeave', () => {
      const handleEnter = vi.fn();
      const handleLeave = vi.fn();
      renderWithProviders(
        <VirtualList 
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        />
      );
      
      const element = document.querySelector('[data-testid="virtual-list"]');
      
      fireEvent.mouseEnter(element);
      expect(handleEnter).toHaveBeenCalled();
      
      fireEvent.mouseLeave(element);
      expect(handleLeave).toHaveBeenCalled();
    });

    it('handles onFocus and onBlur', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      renderWithProviders(
        <VirtualList 
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        />
      );
      
      const element = document.querySelector('[data-testid="virtual-list"]');
      
      fireEvent.focus(element);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(element);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('maintains internal state correctly', () => {
      const { rerender } = renderWithProviders(<VirtualList />);
      // Test internal state management
      
      rerender(<VirtualList />);
      // Verify state persists across rerenders
    });

    it('responds to prop changes', () => {
      const { rerender } = renderWithProviders(
        <VirtualList value="initial" />
      );
      
      rerender(<VirtualList value="updated" />);
      // Verify component updates accordingly
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA attributes', () => {
      renderWithProviders(
        <VirtualList aria-label="Component label" />
      );
      const element = document.querySelector('[aria-label="Component label"]');
      expect(element).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      renderWithProviders(<VirtualList tabIndex={0} />);
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
        <VirtualList role="region" aria-describedby="description" />
      );
      
      const element = document.querySelector('[role="region"]');
      expect(element).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('handles null/undefined props gracefully', () => {
      renderWithProviders(
        <VirtualList value={null} data={undefined} />
      );
      expect(document.querySelector('[data-testid="virtual-list"]')).toBeInTheDocument();
    });

    it('handles empty arrays/objects', () => {
      renderWithProviders(
        <VirtualList items={[]} config={{}} />
      );
      expect(document.querySelector('[data-testid="virtual-list"]')).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longText = 'a'.repeat(10000);
      renderWithProviders(
        <VirtualList text={longText} />
      );
      expect(document.querySelector('[data-testid="virtual-list"]')).toBeInTheDocument();
    });
  });

  describe('Virtualization Features', () => {
    it('only renders visible items', () => {
      const items = Array.from({ length: 10000 }, (_, i) => ({ 
        id: i, 
        content: `Item ${i}` 
      }));
      
      renderWithProviders(
        <VirtualList 
          items={items}
          itemHeight={50}
          containerHeight={500}
        />
      );
      
      // Should only render items that fit in viewport plus buffer
      const renderedItems = screen.getAllByText(/Item \d+/);
      expect(renderedItems.length).toBeLessThan(20);
    });

    it('updates visible items on scroll', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ 
        id: i, 
        content: `Item ${i}` 
      }));
      
      renderWithProviders(
        <VirtualList 
          items={items}
          itemHeight={50}
          containerHeight={200}
        />
      );
      
      const container = document.querySelector('[data-testid="virtual-list"]');
      
      // Initially shows first items
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.queryByText('Item 50')).not.toBeInTheDocument();
      
      // Scroll down
      fireEvent.scroll(container, { target: { scrollTop: 2500 } });
      
      await waitFor(() => {
        expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
        expect(screen.getByText('Item 50')).toBeInTheDocument();
      });
    });

    it('handles dynamic item heights', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ 
        id: i, 
        content: `Item ${i}`,
        height: 30 + (i % 3) * 20 // Variable heights
      }));
      
      renderWithProviders(
        <VirtualList 
          items={items}
          dynamicHeight
          containerHeight={300}
        />
      );
      
      // Should handle variable heights correctly
      const renderedItems = screen.getAllByText(/Item \d+/);
      expect(renderedItems.length).toBeGreaterThan(0);
    });

    it('maintains scroll position on data updates', async () => {
      const initialItems = Array.from({ length: 100 }, (_, i) => ({ 
        id: i, 
        content: `Item ${i}` 
      }));
      
      const { rerender } = renderWithProviders(
        <VirtualList 
          items={initialItems}
          itemHeight={50}
          containerHeight={200}
        />
      );
      
      const container = document.querySelector('[data-testid="virtual-list"]');
      
      // Scroll to middle
      fireEvent.scroll(container, { target: { scrollTop: 2500 } });
      
      // Update items
      const updatedItems = initialItems.map(item => ({
        ...item,
        content: `Updated ${item.content}`
      }));
      
      rerender(
        <VirtualList 
          items={updatedItems}
          itemHeight={50}
          containerHeight={200}
        />
      );
      
      // Should maintain scroll position
      expect(container.scrollTop).toBe(2500);
    });

    it('handles overscan correctly', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ 
        id: i, 
        content: `Item ${i}` 
      }));
      
      renderWithProviders(
        <VirtualList 
          items={items}
          itemHeight={50}
          containerHeight={200}
          overscan={3}
        />
      );
      
      // Should render visible items plus overscan buffer
      const renderedItems = screen.getAllByText(/Item \d+/);
      const visibleCount = Math.ceil(200 / 50);
      const expectedCount = visibleCount + (3 * 2); // overscan on both sides
      
      expect(renderedItems.length).toBeLessThanOrEqual(expectedCount);
    });
  });
});
