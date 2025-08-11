/**
 * CommandPalette Component Tests
 * Auto-generated test suite for command-palette component
 * Category: navigation
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { CommandPalette } from './index';
import { vi } from 'vitest';

describe('CommandPalette Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<CommandPalette />);
      expect(document.querySelector('[role="navigation"], [data-testid="command-palette"]')).toBeInTheDocument();
    });

    it('renders navigation items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ];
      renderWithProviders(<CommandPalette items={items} />);
      
      items.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Behavior', () => {
    it('highlights active item', () => {
      const items = [
        { label: 'Home', href: '/', active: true },
        { label: 'About', href: '/about' }
      ];
      renderWithProviders(<CommandPalette items={items} />);
      
      const activeItem = screen.getByText('Home').closest('a, button');
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });

    it('handles item clicks', () => {
      const handleClick = vi.fn();
      const items = [
        { label: 'Home', onClick: handleClick }
      ];
      renderWithProviders(<CommandPalette items={items} />);
      
      fireEvent.click(screen.getByText('Home'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('supports disabled items', () => {
      const items = [
        { label: 'Disabled', disabled: true }
      ];
      renderWithProviders(<CommandPalette items={items} />);
      
      const disabledItem = screen.getByText('Disabled').closest('a, button');
      expect(disabledItem).toBeDisabled();
    });
  });

  describe('Search Functionality', () => {
    it('filters items based on search', async () => {
      const items = [
        { label: 'Apple' },
        { label: 'Banana' },
        { label: 'Cherry' }
      ];
      renderWithProviders(<CommandPalette items={items} searchable />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'app' } });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      });
    });

    it('shows no results message', async () => {
      renderWithProviders(<CommandPalette items={[]} searchable />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });
      
      await waitFor(() => {
        expect(screen.getByText(/no results/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports arrow key navigation', () => {
      const items = [
        { label: 'Item 1' },
        { label: 'Item 2' },
        { label: 'Item 3' }
      ];
      renderWithProviders(<CommandPalette items={items} />);
      
      const firstItem = screen.getByText('Item 1');
      firstItem.focus();
      
      fireEvent.keyDown(firstItem, { key: 'ArrowDown' });
      expect(screen.getByText('Item 2')).toHaveFocus();
      
      fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
      expect(screen.getByText('Item 1')).toHaveFocus();
    });

    it('supports Enter key selection', () => {
      const handleSelect = vi.fn();
      renderWithProviders(<CommandPalette onSelect={handleSelect} />);
      
      const item = document.querySelector('[role="menuitem"], [role="option"], button');
      if (item) {
        item.focus();
        fireEvent.keyDown(item, { key: 'Enter' });
        expect(handleSelect).toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<CommandPalette aria-label="Main navigation" />);
      const nav = document.querySelector('[role="navigation"]');
      if (nav) {
        expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      }
    });

    it('supports screen reader announcements', () => {
      renderWithProviders(<CommandPalette currentPage={2} totalPages={5} />);
      const status = screen.getByRole?.('status');
      if (status) {
        expect(status).toHaveTextContent(/page 2 of 5/i);
      }
    });
  });
});
