/**
 * AudioRecorder Component Tests
 * Auto-generated test suite for audio-recorder component
 * Category: complex
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../tests/utils/test-utils';
import { AudioRecorder } from './audio-recorder';
import { vi } from 'vitest';

describe('AudioRecorder Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<AudioRecorder />);
      expect(document.querySelector('[data-testid="audio-recorder"]')).toBeInTheDocument();
    });

    it('renders with initial data', () => {
      const data = { /* mock data */ };
      renderWithProviders(<AudioRecorder data={data} />);
      // Verify data is rendered
    });

    it('handles loading state', () => {
      renderWithProviders(<AudioRecorder loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles error state', () => {
      renderWithProviders(<AudioRecorder error="Failed to load" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    it('loads data on mount', async () => {
      const fetchData = vi.fn().mockResolvedValue({ /* mock data */ });
      renderWithProviders(<AudioRecorder onLoad={fetchData} />);
      
      await waitFor(() => {
        expect(fetchData).toHaveBeenCalled();
      });
    });

    it('handles data updates', async () => {
      const { rerender } = renderWithProviders(<AudioRecorder data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
      
      const newData = [{ id: 1, name: 'Item 1' }];
      rerender(<AudioRecorder data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('supports pagination', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      renderWithProviders(<AudioRecorder data={data} pageSize={10} />);
      
      // Check first page
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.queryByText('Item 10')).not.toBeInTheDocument();
      
      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Item 10')).toBeInTheDocument();
        expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
      });
    });

    it('supports sorting', async () => {
      const data = [
        { id: 1, name: 'Zebra' },
        { id: 2, name: 'Apple' },
        { id: 3, name: 'Mango' }
      ];
      renderWithProviders(<AudioRecorder data={data} sortable />);
      
      const sortButton = screen.getByRole('button', { name: /sort/i });
      fireEvent.click(sortButton);
      
      await waitFor(() => {
        const items = screen.getAllByTestId('data-item');
        expect(items[0]).toHaveTextContent('Apple');
        expect(items[1]).toHaveTextContent('Mango');
        expect(items[2]).toHaveTextContent('Zebra');
      });
    });

    it('supports filtering', async () => {
      const data = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Cherry' }
      ];
      renderWithProviders(<AudioRecorder data={data} filterable />);
      
      const filterInput = screen.getByRole('textbox', { name: /filter/i });
      fireEvent.change(filterInput, { target: { value: 'app' } });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
        expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('handles item selection', () => {
      const handleSelect = vi.fn();
      const data = [{ id: 1, name: 'Item 1' }];
      renderWithProviders(<AudioRecorder data={data} onSelect={handleSelect} />);
      
      const item = screen.getByText('Item 1');
      fireEvent.click(item);
      
      expect(handleSelect).toHaveBeenCalledWith(data[0]);
    });

    it('supports multi-selection', () => {
      const handleSelect = vi.fn();
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      renderWithProviders(<AudioRecorder data={data} multiSelect onSelect={handleSelect} />);
      
      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');
      
      fireEvent.click(item1, { ctrlKey: true });
      fireEvent.click(item2, { ctrlKey: true });
      
      expect(handleSelect).toHaveBeenCalledWith([data[0], data[1]]);
    });

    it('supports drag and drop', async () => {
      const handleReorder = vi.fn();
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      renderWithProviders(<AudioRecorder data={data} draggable onReorder={handleReorder} />);
      
      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');
      
      // Simulate drag and drop
      fireEvent.dragStart(item1);
      fireEvent.dragEnter(item2);
      fireEvent.dragOver(item2);
      fireEvent.drop(item2);
      fireEvent.dragEnd(item1);
      
      expect(handleReorder).toHaveBeenCalled();
    });

    it('supports inline editing', async () => {
      const handleEdit = vi.fn();
      const data = [{ id: 1, name: 'Item 1' }];
      renderWithProviders(<AudioRecorder data={data} editable onEdit={handleEdit} />);
      
      const item = screen.getByText('Item 1');
      fireEvent.doubleClick(item);
      
      const input = await screen.findByRole('textbox');
      fireEvent.change(input, { target: { value: 'Updated Item' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(handleEdit).toHaveBeenCalledWith({ id: 1, name: 'Updated Item' });
    });
  });

  describe('Performance', () => {
    it('virtualizes long lists', () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      renderWithProviders(<AudioRecorder data={data} virtualize />);
      
      // Only visible items should be rendered
      const renderedItems = screen.getAllByTestId('data-item');
      expect(renderedItems.length).toBeLessThan(50);
    });

    it('debounces search input', async () => {
      const handleSearch = vi.fn();
      renderWithProviders(<AudioRecorder onSearch={handleSearch} />);
      
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      
      // Type quickly
      fireEvent.change(searchInput, { target: { value: 't' } });
      fireEvent.change(searchInput, { target: { value: 'te' } });
      fireEvent.change(searchInput, { target: { value: 'tes' } });
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should only call once after debounce
      await waitFor(() => {
        expect(handleSearch).toHaveBeenCalledTimes(1);
        expect(handleSearch).toHaveBeenCalledWith('test');
      }, { timeout: 500 });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<AudioRecorder aria-label="Complex component" />);
      const container = document.querySelector('[data-testid="audio-recorder"]');
      expect(container).toHaveAttribute('aria-label', 'Complex component');
    });

    it('announces updates to screen readers', async () => {
      renderWithProviders(<AudioRecorder />);
      const liveRegion = screen.getByRole('status', { live: 'polite' });
      
      // Trigger an update
      const updateButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/updated/i);
      });
    });

    it('supports keyboard navigation throughout', () => {
      renderWithProviders(<AudioRecorder />);
      
      // Test Tab navigation
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements[0].focus();
      expect(focusableElements[0]).toHaveFocus();
      
      // Tab through elements
      focusableElements.forEach((element, index) => {
        if (index > 0) {
          fireEvent.keyDown(document.activeElement, { key: 'Tab' });
          expect(focusableElements[index]).toHaveFocus();
        }
      });
    });
  });
});
