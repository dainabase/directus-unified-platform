/**
 * RichTextEditor Component Tests
 * Auto-generated test suite for rich-text-editor component
 * Category: complex
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../tests/utils/test-utils';
import { RichTextEditor } from './rich-text-editor';
import { vi } from 'vitest';

describe('RichTextEditor Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<RichTextEditor />);
      expect(document.querySelector('[data-testid="rich-text-editor"]')).toBeInTheDocument();
    });

    it('renders with initial data', () => {
      const data = { /* mock data */ };
      renderWithProviders(<RichTextEditor data={data} />);
      // Verify data is rendered
    });

    it('handles loading state', () => {
      renderWithProviders(<RichTextEditor loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles error state', () => {
      renderWithProviders(<RichTextEditor error="Failed to load" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    it('loads data on mount', async () => {
      const fetchData = vi.fn().mockResolvedValue({ /* mock data */ });
      renderWithProviders(<RichTextEditor onLoad={fetchData} />);
      
      await waitFor(() => {
        expect(fetchData).toHaveBeenCalled();
      });
    });

    it('handles data updates', async () => {
      const { rerender } = renderWithProviders(<RichTextEditor data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
      
      const newData = [{ id: 1, name: 'Item 1' }];
      rerender(<RichTextEditor data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('supports pagination', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      renderWithProviders(<RichTextEditor data={data} pageSize={10} />);
      
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
      renderWithProviders(<RichTextEditor data={data} sortable />);
      
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
      renderWithProviders(<RichTextEditor data={data} filterable />);
      
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
      renderWithProviders(<RichTextEditor data={data} onSelect={handleSelect} />);
      
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
      renderWithProviders(<RichTextEditor data={data} multiSelect onSelect={handleSelect} />);
      
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
      renderWithProviders(<RichTextEditor data={data} draggable onReorder={handleReorder} />);
      
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
      renderWithProviders(<RichTextEditor data={data} editable onEdit={handleEdit} />);
      
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
      renderWithProviders(<RichTextEditor data={data} virtualize />);
      
      // Only visible items should be rendered
      const renderedItems = screen.getAllByTestId('data-item');
      expect(renderedItems.length).toBeLessThan(50);
    });

    it('debounces search input', async () => {
      const handleSearch = vi.fn();
      renderWithProviders(<RichTextEditor onSearch={handleSearch} />);
      
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
      renderWithProviders(<RichTextEditor aria-label="Complex component" />);
      const container = document.querySelector('[data-testid="rich-text-editor"]');
      expect(container).toHaveAttribute('aria-label', 'Complex component');
    });

    it('announces updates to screen readers', async () => {
      renderWithProviders(<RichTextEditor />);
      const liveRegion = screen.getByRole('status', { live: 'polite' });
      
      // Trigger an update
      const updateButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/updated/i);
      });
    });

    it('supports keyboard navigation throughout', () => {
      renderWithProviders(<RichTextEditor />);
      
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

  describe('Editor Specific Features', () => {
    it('applies text formatting', () => {
      renderWithProviders(<RichTextEditor value="Test content" />);
      
      const boldButton = screen.getByRole('button', { name: /bold/i });
      const italicButton = screen.getByRole('button', { name: /italic/i });
      const underlineButton = screen.getByRole('button', { name: /underline/i });
      
      fireEvent.click(boldButton);
      expect(document.querySelector('[style*="font-weight: bold"]')).toBeInTheDocument();
      
      fireEvent.click(italicButton);
      expect(document.querySelector('[style*="font-style: italic"]')).toBeInTheDocument();
      
      fireEvent.click(underlineButton);
      expect(document.querySelector('[style*="text-decoration: underline"]')).toBeInTheDocument();
    });

    it('supports heading levels', () => {
      renderWithProviders(<RichTextEditor />);
      
      const headingDropdown = screen.getByRole('combobox', { name: /heading/i });
      
      fireEvent.change(headingDropdown, { target: { value: 'h1' } });
      expect(document.querySelector('h1')).toBeInTheDocument();
      
      fireEvent.change(headingDropdown, { target: { value: 'h2' } });
      expect(document.querySelector('h2')).toBeInTheDocument();
    });

    it('handles lists', () => {
      renderWithProviders(<RichTextEditor />);
      
      const bulletListButton = screen.getByRole('button', { name: /bullet list/i });
      const numberListButton = screen.getByRole('button', { name: /number list/i });
      
      fireEvent.click(bulletListButton);
      expect(document.querySelector('ul')).toBeInTheDocument();
      
      fireEvent.click(numberListButton);
      expect(document.querySelector('ol')).toBeInTheDocument();
    });

    it('supports undo/redo', () => {
      const handleChange = vi.fn();
      renderWithProviders(<RichTextEditor onChange={handleChange} />);
      
      const undoButton = screen.getByRole('button', { name: /undo/i });
      const redoButton = screen.getByRole('button', { name: /redo/i });
      
      // Make a change
      const editor = document.querySelector('[contenteditable="true"]');
      fireEvent.input(editor, { target: { innerHTML: 'New content' } });
      
      // Undo
      fireEvent.click(undoButton);
      expect(handleChange).toHaveBeenCalledWith('');
      
      // Redo
      fireEvent.click(redoButton);
      expect(handleChange).toHaveBeenCalledWith('New content');
    });

    it('handles link insertion', async () => {
      renderWithProviders(<RichTextEditor />);
      
      const linkButton = screen.getByRole('button', { name: /insert link/i });
      fireEvent.click(linkButton);
      
      const urlInput = await screen.findByPlaceholderText(/enter url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
      
      expect(document.querySelector('a[href="https://example.com"]')).toBeInTheDocument();
    });
  });
});
