/**
 * Mentions Component Tests - Enterprise-Grade Specialized Suite
 * 
 * Comprehensive testing for advanced mention functionality:
 * - Auto-completion with intelligent search (name/username/email)
 * - Keyboard navigation (Arrow keys, Enter, Escape) 
 * - Real-time highlighting with overlay rendering
 * - Mention extraction and state management
 * - Trigger character (@) and position management
 * - Debounced search with performance optimization
 * - Custom rendering (suggestions, mentions)
 * - Status indicators (online/offline/away/busy)
 * - Accessibility and ARIA compliance
 * - Edge cases and error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mentions, User, MentionsProps } from './mentions';
import { vi } from 'vitest';

// Mock data - realistic users for testing
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    avatar: 'https://avatars.example.com/john.jpg',
    status: 'online'
  },
  {
    id: '2', 
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    avatar: 'https://avatars.example.com/jane.jpg',
    status: 'away'
  },
  {
    id: '3',
    name: 'Alice Johnson',
    username: 'alicej',
    email: 'alice@company.com',
    status: 'busy'
  },
  {
    id: '4',
    name: 'Bob Wilson',
    username: 'bobw',
    email: 'bob@team.com',
    status: 'offline'
  },
  {
    id: '5',
    name: 'Charlie Brown',
    username: 'charlieb',
    email: 'charlie@test.com',
    status: 'online'
  }
];

// Helper to create mentions component with common props
const createMentions = (props: Partial<MentionsProps> = {}) => {
  const defaultProps: MentionsProps = {
    users: mockUsers,
    ...props
  };
  return render(<Mentions {...defaultProps} />);
};

// Helper to get textarea element
const getTextarea = () => screen.getByRole('textbox');

// Helper to type text and trigger mentions
const typeText = async (element: HTMLElement, text: string) => {
  const user = userEvent.setup();
  await user.type(element, text);
};

describe('Mentions Component - Enterprise-Grade Testing Suite', () => {
  // ================================
  // 1. BASIC RENDERING & PROPS
  // ================================
  describe('Basic Rendering & Props', () => {
    it('renders textarea with default props', () => {
      createMentions();
      const textarea = getTextarea();
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder', 'Type @ to mention someone...');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('applies custom className and styling', () => {
      createMentions({ 
        className: 'custom-mentions',
        containerClassName: 'custom-container',
        style: { backgroundColor: 'blue' }
      });
      
      const textarea = getTextarea();
      expect(textarea).toHaveClass('custom-mentions');
      expect(textarea.parentElement).toHaveClass('custom-container');
      expect(textarea).toHaveStyle({ backgroundColor: 'blue' });
    });

    it('handles disabled and readOnly states', () => {
      const { rerender } = createMentions({ disabled: true });
      let textarea = getTextarea();
      expect(textarea).toBeDisabled();

      rerender(<Mentions users={mockUsers} readOnly />);
      textarea = getTextarea();
      expect(textarea).toHaveAttribute('readonly');
    });

    it('forwards ref correctly to textarea', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Mentions ref={ref} users={mockUsers} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toBe(getTextarea());
    });

    it('supports custom trigger character', () => {
      createMentions({ triggerChar: '#' });
      const textarea = getTextarea();
      expect(textarea).toHaveAttribute('placeholder', 'Type @ to mention someone...');
    });
  });

  // ================================
  // 2. AUTO-COMPLETION INTELLIGENCE  
  // ================================
  describe('Auto-Completion Intelligence', () => {
    it('triggers suggestions on @ character', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, 'Hello @');
      
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).toBeInTheDocument();
      });
    });

    it('searches by name, username, and email', async () => {
      createMentions();
      const textarea = getTextarea();
      
      // Search by name
      await typeText(textarea, '@john');
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Clear and search by username
      await userEvent.clear(textarea);
      await typeText(textarea, '@janes');
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Clear and search by email
      await userEvent.clear(textarea);
      await typeText(textarea, '@alice@comp');
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('respects minSearchLength setting', async () => {
      createMentions({ minSearchLength: 3 });
      const textarea = getTextarea();
      
      await typeText(textarea, '@j');
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      
      await typeText(textarea, 'oh');
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('limits suggestions by maxSuggestions', async () => {
      createMentions({ maxSuggestions: 2 });
      const textarea = getTextarea();
      
      await typeText(textarea, '@');
      
      await waitFor(() => {
        const suggestions = screen.getAllByRole('button');
        expect(suggestions).toHaveLength(2);
      });
    });

    it('implements debounced search with delay', async () => {
      vi.useFakeTimers();
      const onChange = vi.fn();
      createMentions({ searchDelay: 500, onChange });
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      
      // Should not show suggestions immediately
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      
      // Fast forward timer
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });

    it('handles case-insensitive search', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, '@JOHN');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  // ================================
  // 3. KEYBOARD NAVIGATION
  // ================================
  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      createMentions();
      const textarea = getTextarea();
      await typeText(textarea, '@j');
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('navigates suggestions with arrow keys', async () => {
      const suggestions = screen.getAllByRole('button');
      expect(suggestions[0]).toHaveClass('bg-accent');
      
      fireEvent.keyDown(getTextarea(), { key: 'ArrowDown' });
      expect(suggestions[1]).toHaveClass('bg-accent');
      
      fireEvent.keyDown(getTextarea(), { key: 'ArrowUp' });
      expect(suggestions[0]).toHaveClass('bg-accent');
    });

    it('wraps navigation at boundaries', async () => {
      const suggestions = screen.getAllByRole('button');
      const lastIndex = suggestions.length - 1;
      
      // Navigate to last item
      for (let i = 0; i < lastIndex; i++) {
        fireEvent.keyDown(getTextarea(), { key: 'ArrowDown' });
      }
      expect(suggestions[lastIndex]).toHaveClass('bg-accent');
      
      // Should wrap to first
      fireEvent.keyDown(getTextarea(), { key: 'ArrowDown' });
      expect(suggestions[0]).toHaveClass('bg-accent');
      
      // Should wrap to last
      fireEvent.keyDown(getTextarea(), { key: 'ArrowUp' });
      expect(suggestions[lastIndex]).toHaveClass('bg-accent');
    });

    it('selects mention with Enter key', async () => {
      const textarea = getTextarea();
      
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea).toHaveValue('@johndoe ');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('closes suggestions with Escape key', async () => {
      fireEvent.keyDown(getTextarea(), { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('maintains focus on textarea after selection', async () => {
      const textarea = getTextarea();
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });
  });

  // ================================
  // 4. MENTION INSERTION & FORMATTING
  // ================================
  describe('Mention Insertion & Formatting', () => {
    it('inserts mention with default format', async () => {
      const onChange = vi.fn();
      createMentions({ onChange });
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      await waitFor(() => screen.getByText('John Doe'));
      
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(textarea).toHaveValue('@johndoe ');
        expect(onChange).toHaveBeenCalledWith('@johndoe ', expect.arrayContaining([
          expect.objectContaining({ username: 'johndoe' })
        ]));
      });
    });

    it('uses custom formatMention function', async () => {
      const formatMention = (user: User) => `@[${user.name}]`;
      createMentions({ formatMention });
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      await waitFor(() => screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(textarea).toHaveValue('@[John Doe] ');
      });
    });

    it('calls onMention callback when user is mentioned', async () => {
      const onMention = vi.fn();
      createMentions({ onMention });
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      await waitFor(() => screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(onMention).toHaveBeenCalledWith(mockUsers[0]);
      });
    });

    it('preserves text before and after mention', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, 'Hello @joh there');
      // Position cursor after @joh
      textarea.setSelectionRange(10, 10);
      
      await waitFor(() => screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(textarea).toHaveValue('Hello @johndoe  there');
      });
    });

    it('extracts mentions from text content', async () => {
      const onChange = vi.fn();
      createMentions({ value: 'Hi @johndoe and @janesmith!', onChange });
      
      expect(onChange).toHaveBeenCalledWith(
        'Hi @johndoe and @janesmith!',
        expect.arrayContaining([
          expect.objectContaining({ username: 'johndoe' }),
          expect.objectContaining({ username: 'janesmith' })
        ])
      );
    });
  });

  // ================================
  // 5. HIGHLIGHTING & RENDERING
  // ================================
  describe('Highlighting & Rendering', () => {
    it('highlights mentions in text when enabled', () => {
      createMentions({ 
        value: 'Hello @johndoe!',
        highlightMentions: true
      });
      
      const highlighted = document.querySelector('.text-primary');
      expect(highlighted).toHaveTextContent('@johndoe');
    });

    it('disables highlighting when highlightMentions is false', () => {
      createMentions({ 
        value: 'Hello @johndoe!',
        highlightMentions: false
      });
      
      expect(document.querySelector('.text-primary')).not.toBeInTheDocument();
    });

    it('applies custom mention className for highlighting', () => {
      createMentions({ 
        value: 'Hello @johndoe!',
        mentionClassName: 'custom-mention',
        highlightMentions: true
      });
      
      expect(document.querySelector('.custom-mention')).toBeInTheDocument();
    });

    it('uses custom renderMention for highlighting', () => {
      const renderMention = (user: User) => (
        <span data-testid="custom-mention">{user.name}</span>
      );
      
      createMentions({ 
        value: 'Hello @johndoe!',
        renderMention,
        highlightMentions: true
      });
      
      expect(screen.getByTestId('custom-mention')).toHaveTextContent('John Doe');
    });

    it('displays active mentions as badges', () => {
      createMentions({ value: 'Hi @johndoe and @janesmith!' });
      
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(screen.getByText('@janesmith')).toBeInTheDocument();
    });
  });

  // ================================
  // 6. CUSTOM RENDERING & STATUS
  // ================================
  describe('Custom Rendering & Status', () => {
    it('renders default suggestion with avatar and status', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
        expect(document.querySelector('.bg-green-500')).toBeInTheDocument(); // online status
      });
    });

    it('shows different status colors', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, '@');
      
      await waitFor(() => {
        expect(document.querySelector('.bg-green-500')).toBeInTheDocument(); // online
        expect(document.querySelector('.bg-yellow-500')).toBeInTheDocument(); // away  
        expect(document.querySelector('.bg-red-500')).toBeInTheDocument(); // busy
        expect(document.querySelector('.bg-gray-400')).toBeInTheDocument(); // offline
      });
    });

    it('hides status when showStatus is false', async () => {
      createMentions({ showStatus: false });
      const textarea = getTextarea();
      
      await typeText(textarea, '@');
      
      await waitFor(() => {
        expect(document.querySelector('.bg-green-500')).not.toBeInTheDocument();
        expect(document.querySelector('.bg-yellow-500')).not.toBeInTheDocument();
      });
    });

    it('uses custom renderSuggestion', async () => {
      const renderSuggestion = (user: User) => (
        <div data-testid="custom-suggestion">{user.name} - {user.email}</div>
      );
      
      createMentions({ renderSuggestion });
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-suggestion')).toHaveTextContent('John Doe - john@example.com');
      });
    });
  });

  // ================================
  // 7. EDGE CASES & ERROR HANDLING
  // ================================
  describe('Edge Cases & Error Handling', () => {
    it('handles spaces in search when allowSpaces is true', async () => {
      createMentions({ allowSpaces: true });
      const textarea = getTextarea();
      
      await typeText(textarea, '@john doe');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('cancels mention on space when allowSpaces is false', async () => {
      createMentions({ allowSpaces: false });
      const textarea = getTextarea();
      
      await typeText(textarea, '@john ');
      
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('handles empty users array gracefully', async () => {
      createMentions({ users: [] });
      const textarea = getTextarea();
      
      await typeText(textarea, '@test');
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles mention at start of text', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      await waitFor(() => screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(textarea).toHaveValue('@johndoe ');
      });
    });

    it('handles multiple mentions in same text', async () => {
      const onChange = vi.fn();
      createMentions({ onChange });
      const textarea = getTextarea();
      
      await typeText(textarea, '@joh');
      await waitFor(() => screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(textarea).toHaveValue('@johndoe ');
      });
      
      await typeText(textarea, 'and @jane');
      await waitFor(() => screen.getByText('Jane Smith'));
      fireEvent.click(screen.getByText('Jane Smith'));
      
      await waitFor(() => {
        expect(textarea).toHaveValue('@johndoe and @janesmith ');
        expect(onChange).toHaveBeenLastCalledWith(
          '@johndoe and @janesmith ',
          expect.arrayContaining([
            expect.objectContaining({ username: 'johndoe' }),
            expect.objectContaining({ username: 'janesmith' })
          ])
        );
      });
    });

    it('handles very long text content', async () => {
      const longText = 'a'.repeat(1000) + '@joh';
      createMentions({ value: longText });
      
      await waitFor(() => {
        expect(getTextarea()).toHaveValue(longText);
      });
    });

    it('handles custom trigger characters', async () => {
      createMentions({ triggerChar: '#' });
      const textarea = getTextarea();
      
      await typeText(textarea, 'Hello #joh');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  // ================================
  // 8. ACCESSIBILITY & ARIA
  // ================================
  describe('Accessibility & ARIA', () => {
    it('maintains proper focus management', async () => {
      createMentions({ autoFocus: true });
      const textarea = getTextarea();
      
      expect(textarea).toHaveFocus();
      
      await typeText(textarea, '@joh');
      await waitFor(() => screen.getByText('John Doe'));
      
      // Focus should remain on textarea
      expect(textarea).toHaveFocus();
      
      fireEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });

    it('supports textarea standard attributes', () => {
      createMentions({ 
        required: true,
        maxLength: 500,
        'aria-label': 'Mention users',
        'aria-describedby': 'mention-help'
      });
      
      const textarea = getTextarea();
      expect(textarea).toHaveAttribute('required');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toHaveAttribute('aria-label', 'Mention users');
      expect(textarea).toHaveAttribute('aria-describedby', 'mention-help');
    });

    it('makes suggestion list keyboard accessible', async () => {
      createMentions();
      const textarea = getTextarea();
      
      await typeText(textarea, '@');
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveAttribute('type', 'button');
        });
      });
    });
  });

  // ================================
  // 9. PERFORMANCE & CLEANUP
  // ================================
  describe('Performance & Cleanup', () => {
    it('cleans up search timeout on unmount', () => {
      const { unmount } = createMentions({ searchDelay: 1000 });
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('handles rapid typing without performance issues', async () => {
      createMentions({ searchDelay: 100 });
      const textarea = getTextarea();
      
      // Simulate rapid typing
      await typeText(textarea, '@j');
      await typeText(textarea, 'o');
      await typeText(textarea, 'h');
      await typeText(textarea, 'n');
      
      // Should still work correctly
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});
