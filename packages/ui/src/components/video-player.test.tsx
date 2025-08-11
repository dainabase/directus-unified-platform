/**
 * VideoPlayer Component Tests
 * Auto-generated test suite for video-player component
 * Category: complex
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../tests/utils/test-utils';
import { VideoPlayer } from './video-player';
import { vi } from 'vitest';

describe('VideoPlayer Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<VideoPlayer />);
      expect(document.querySelector('[data-testid="video-player"]')).toBeInTheDocument();
    });

    it('renders with initial data', () => {
      const data = { /* mock data */ };
      renderWithProviders(<VideoPlayer data={data} />);
      // Verify data is rendered
    });

    it('handles loading state', () => {
      renderWithProviders(<VideoPlayer loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles error state', () => {
      renderWithProviders(<VideoPlayer error="Failed to load" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    it('loads data on mount', async () => {
      const fetchData = vi.fn().mockResolvedValue({ /* mock data */ });
      renderWithProviders(<VideoPlayer onLoad={fetchData} />);
      
      await waitFor(() => {
        expect(fetchData).toHaveBeenCalled();
      });
    });

    it('handles data updates', async () => {
      const { rerender } = renderWithProviders(<VideoPlayer data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
      
      const newData = [{ id: 1, name: 'Item 1' }];
      rerender(<VideoPlayer data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('supports pagination', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      renderWithProviders(<VideoPlayer data={data} pageSize={10} />);
      
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
      renderWithProviders(<VideoPlayer data={data} sortable />);
      
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
      renderWithProviders(<VideoPlayer data={data} filterable />);
      
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
      renderWithProviders(<VideoPlayer data={data} onSelect={handleSelect} />);
      
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
      renderWithProviders(<VideoPlayer data={data} multiSelect onSelect={handleSelect} />);
      
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
      renderWithProviders(<VideoPlayer data={data} draggable onReorder={handleReorder} />);
      
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
      renderWithProviders(<VideoPlayer data={data} editable onEdit={handleEdit} />);
      
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
      renderWithProviders(<VideoPlayer data={data} virtualize />);
      
      // Only visible items should be rendered
      const renderedItems = screen.getAllByTestId('data-item');
      expect(renderedItems.length).toBeLessThan(50);
    });

    it('debounces search input', async () => {
      const handleSearch = vi.fn();
      renderWithProviders(<VideoPlayer onSearch={handleSearch} />);
      
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
      renderWithProviders(<VideoPlayer aria-label="Complex component" />);
      const container = document.querySelector('[data-testid="video-player"]');
      expect(container).toHaveAttribute('aria-label', 'Complex component');
    });

    it('announces updates to screen readers', async () => {
      renderWithProviders(<VideoPlayer />);
      const liveRegion = screen.getByRole('status', { live: 'polite' });
      
      // Trigger an update
      const updateButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/updated/i);
      });
    });

    it('supports keyboard navigation throughout', () => {
      renderWithProviders(<VideoPlayer />);
      
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

  describe('Video Player Controls', () => {
    it('handles play/pause functionality', () => {
      renderWithProviders(<VideoPlayer src="/test-video.mp4" />);
      
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);
      
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('handles volume control', () => {
      renderWithProviders(<VideoPlayer src="/test-video.mp4" />);
      
      const volumeSlider = screen.getByRole('slider', { name: /volume/i });
      
      fireEvent.change(volumeSlider, { target: { value: '50' } });
      expect(volumeSlider).toHaveValue('50');
      
      const muteButton = screen.getByRole('button', { name: /mute/i });
      fireEvent.click(muteButton);
      
      expect(volumeSlider).toHaveValue('0');
    });

    it('handles seek functionality', () => {
      renderWithProviders(<VideoPlayer src="/test-video.mp4" duration={120} />);
      
      const seekBar = screen.getByRole('slider', { name: /seek/i });
      
      fireEvent.change(seekBar, { target: { value: '60' } });
      expect(screen.getByText(/1:00/)).toBeInTheDocument();
    });

    it('handles fullscreen toggle', () => {
      const handleFullscreen = vi.fn();
      renderWithProviders(
        <VideoPlayer src="/test-video.mp4" onFullscreenChange={handleFullscreen} />
      );
      
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);
      
      expect(handleFullscreen).toHaveBeenCalledWith(true);
    });

    it('handles playback speed control', () => {
      renderWithProviders(<VideoPlayer src="/test-video.mp4" />);
      
      const speedButton = screen.getByRole('button', { name: /speed/i });
      fireEvent.click(speedButton);
      
      const speed2x = screen.getByRole('menuitem', { name: /2x/i });
      fireEvent.click(speed2x);
      
      expect(screen.getByText(/2x/)).toBeInTheDocument();
    });

    it('handles quality selection', () => {
      const qualities = ['360p', '720p', '1080p'];
      renderWithProviders(
        <VideoPlayer src="/test-video.mp4" qualities={qualities} />
      );
      
      const qualityButton = screen.getByRole('button', { name: /quality/i });
      fireEvent.click(qualityButton);
      
      const hd720 = screen.getByRole('menuitem', { name: /720p/i });
      fireEvent.click(hd720);
      
      expect(screen.getByText(/720p/)).toBeInTheDocument();
    });
  });
});
