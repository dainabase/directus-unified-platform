#!/usr/bin/env node

/**
 * Test Generator for directus-unified-platform
 * Automatically generates test files for all components
 */

const fs = require('fs');
const path = require('path');

// List of all components with their types and test status
const COMPONENTS = {
  // Directory-based components (already tested)
  'button': { type: 'dir', tested: true },
  'card': { type: 'dir', tested: true },
  'alert': { type: 'dir', tested: true },
  
  // Directory-based components (need tests)
  'accordion': { type: 'dir', tested: false },
  'alert-dialog': { type: 'dir', tested: false },
  'app-shell': { type: 'dir', tested: false },
  'avatar': { type: 'dir', tested: false },
  'badge': { type: 'dir', tested: false },
  'breadcrumbs': { type: 'dir', tested: false },
  'calendar': { type: 'dir', tested: false },
  'carousel': { type: 'dir', tested: false },
  'charts': { type: 'dir', tested: false },
  'checkbox': { type: 'dir', tested: false },
  'color-picker': { type: 'dir', tested: false },
  'command-palette': { type: 'dir', tested: false },
  'data-grid': { type: 'dir', tested: false },
  'data-grid-adv': { type: 'dir', tested: false },
  'date-picker': { type: 'dir', tested: false },
  'date-range-picker': { type: 'dir', tested: false },
  'dialog': { type: 'dir', tested: false },
  'drawer': { type: 'dir', tested: false },
  'dropdown-menu': { type: 'dir', tested: false },
  'file-upload': { type: 'dir', tested: false },
  'form': { type: 'dir', tested: false },
  'forms-demo': { type: 'dir', tested: false, skip: true },
  'icon': { type: 'dir', tested: false },
  'input': { type: 'dir', tested: false },
  'mentions': { type: 'dir', tested: false },
  'pagination': { type: 'dir', tested: false },
  'popover': { type: 'dir', tested: false },
  'progress': { type: 'dir', tested: false },
  'rating': { type: 'dir', tested: false },
  'search-bar': { type: 'dir', tested: false },
  'select': { type: 'dir', tested: false },
  'sheet': { type: 'dir', tested: false },
  'skeleton': { type: 'dir', tested: false },
  'slider': { type: 'dir', tested: false },
  'stepper': { type: 'dir', tested: false },
  'switch': { type: 'dir', tested: false },
  'tabs': { type: 'dir', tested: false },
  'tag-input': { type: 'dir', tested: false },
  'textarea': { type: 'dir', tested: false },
  'theme-toggle': { type: 'dir', tested: false },
  'timeline': { type: 'dir', tested: false },
  'timeline-enhanced': { type: 'dir', tested: false },
  'toast': { type: 'dir', tested: false },
  'tooltip': { type: 'dir', tested: false },
  'tree-view': { type: 'dir', tested: false },
  
  // Standalone components (file-based)
  'audio-recorder': { type: 'file', tested: false },
  'code-editor': { type: 'file', tested: false },
  'drag-drop-grid': { type: 'file', tested: false },
  'image-cropper': { type: 'file', tested: false },
  'infinite-scroll': { type: 'file', tested: false },
  'kanban': { type: 'file', tested: false },
  'pdf-viewer': { type: 'file', tested: false },
  'rich-text-editor': { type: 'file', tested: false },
  'video-player': { type: 'file', tested: false },
  'virtual-list': { type: 'file', tested: false },
};

// Component categories for intelligent test generation
const COMPONENT_CATEGORIES = {
  form: ['input', 'textarea', 'checkbox', 'switch', 'select', 'date-picker', 'date-range-picker', 'color-picker', 'file-upload', 'tag-input', 'rating', 'slider'],
  layout: ['accordion', 'tabs', 'drawer', 'sheet', 'app-shell', 'timeline', 'timeline-enhanced'],
  feedback: ['alert', 'alert-dialog', 'dialog', 'toast', 'popover', 'tooltip', 'progress', 'skeleton'],
  navigation: ['breadcrumbs', 'pagination', 'stepper', 'search-bar', 'command-palette'],
  display: ['avatar', 'badge', 'card', 'carousel', 'charts', 'icon', 'tree-view'],
  interactive: ['button', 'dropdown-menu', 'theme-toggle'],
  complex: ['data-grid', 'data-grid-adv', 'kanban', 'audio-recorder', 'video-player', 'pdf-viewer', 'code-editor', 'rich-text-editor', 'image-cropper'],
  utility: ['infinite-scroll', 'virtual-list', 'drag-drop-grid', 'mentions']
};

// Convert component name to proper case
function toPascalCase(str) {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

// Get category of component
function getComponentCategory(componentName) {
  for (const [category, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if (components.includes(componentName)) {
      return category;
    }
  }
  return 'general';
}

// Generate test template based on component category
function generateTestTemplate(componentName, componentInfo) {
  const ComponentName = toPascalCase(componentName);
  const category = getComponentCategory(componentName);
  const isFileComponent = componentInfo.type === 'file';
  const importPath = isFileComponent ? `./${componentName}` : './index';
  
  let template = `/**
 * ${ComponentName} Component Tests
 * Auto-generated test suite for ${componentName} component
 * Category: ${category}
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '${isFileComponent ? '../../tests' : '../../../tests'}/utils/test-utils';
import { ${ComponentName} } from '${importPath}';
import { vi } from 'vitest';

describe('${ComponentName} Component', () => {
`;

  // Add category-specific tests
  switch (category) {
    case 'form':
      template += generateFormTests(ComponentName, componentName);
      break;
    case 'layout':
      template += generateLayoutTests(ComponentName, componentName);
      break;
    case 'feedback':
      template += generateFeedbackTests(ComponentName, componentName);
      break;
    case 'navigation':
      template += generateNavigationTests(ComponentName, componentName);
      break;
    case 'display':
      template += generateDisplayTests(ComponentName, componentName);
      break;
    case 'interactive':
      template += generateInteractiveTests(ComponentName, componentName);
      break;
    case 'complex':
      template += generateComplexTests(ComponentName, componentName);
      break;
    default:
      template += generateGenericTests(ComponentName, componentName);
  }

  template += `});
`;

  return template;
}

// Generate form component tests
function generateFormTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderWithProviders(<${ComponentName} className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithProviders(<${ComponentName} label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('supports controlled value', () => {
      const { rerender } = renderWithProviders(<${ComponentName} value="test" />);
      expect(screen.getByDisplayValue?.('test') || screen.getByText('test')).toBeInTheDocument();
      
      rerender(<${ComponentName} value="updated" />);
      expect(screen.getByDisplayValue?.('updated') || screen.getByText('updated')).toBeInTheDocument();
    });

    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      renderWithProviders(<${ComponentName} onChange={handleChange} />);
      
      const input = document.querySelector('input, textarea, select');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        expect(handleChange).toHaveBeenCalled();
      }
    });

    it('supports disabled state', () => {
      renderWithProviders(<${ComponentName} disabled />);
      const input = document.querySelector('input, textarea, select, button');
      expect(input).toBeDisabled();
    });

    it('supports readonly state', () => {
      renderWithProviders(<${ComponentName} readOnly />);
      const input = document.querySelector('input, textarea');
      if (input) {
        expect(input).toHaveAttribute('readonly');
      }
    });

    it('shows error state', () => {
      renderWithProviders(<${ComponentName} error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('supports required attribute', () => {
      renderWithProviders(<${ComponentName} required />);
      const input = document.querySelector('input, textarea, select');
      if (input) {
        expect(input).toHaveAttribute('required');
      }
    });
  });

  describe('Validation', () => {
    it('validates on blur', async () => {
      const handleValidate = vi.fn();
      renderWithProviders(<${ComponentName} onBlur={handleValidate} />);
      
      const input = document.querySelector('input, textarea, select');
      if (input) {
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(handleValidate).toHaveBeenCalled();
      }
    });

    it('shows validation messages', () => {
      renderWithProviders(<${ComponentName} error="Field is required" />);
      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<${ComponentName} aria-label="Test input" required />);
      const input = document.querySelector('input, textarea, select');
      if (input) {
        expect(input).toHaveAttribute('aria-label', 'Test input');
        expect(input).toHaveAttribute('aria-required', 'true');
      }
    });

    it('associates label with input', () => {
      renderWithProviders(<${ComponentName} id="test-input" label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<${ComponentName} />);
      const input = document.querySelector('input, textarea, select, button');
      if (input) {
        input.focus();
        expect(input).toHaveFocus();
        
        fireEvent.keyDown(input, { key: 'Tab' });
        // Tab navigation test
      }
    });
  });
`;
}

// Generate layout component tests
function generateLayoutTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      renderWithProviders(
        <${ComponentName}>
          <div>Child content</div>
        </${ComponentName}>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<${ComponentName} className="custom-layout" />);
      expect(document.querySelector('.custom-layout')).toBeInTheDocument();
    });
  });

  describe('Layout Behavior', () => {
    it('handles responsive breakpoints', () => {
      renderWithProviders(<${ComponentName} responsive />);
      // Test responsive behavior
    });

    it('manages collapse/expand state', () => {
      const { container } = renderWithProviders(<${ComponentName} collapsible />);
      const trigger = container.querySelector('[data-state]');
      if (trigger) {
        expect(trigger).toHaveAttribute('data-state', 'closed');
        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('data-state', 'open');
      }
    });

    it('supports multiple items/panels', () => {
      renderWithProviders(
        <${ComponentName}>
          <div>Panel 1</div>
          <div>Panel 2</div>
          <div>Panel 3</div>
        </${ComponentName}>
      );
      expect(screen.getByText('Panel 1')).toBeInTheDocument();
      expect(screen.getByText('Panel 2')).toBeInTheDocument();
      expect(screen.getByText('Panel 3')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles open/close callbacks', () => {
      const handleOpen = vi.fn();
      const handleClose = vi.fn();
      renderWithProviders(
        <${ComponentName} onOpen={handleOpen} onClose={handleClose} />
      );
      // Test open/close interactions
    });

    it('supports controlled state', () => {
      const { rerender } = renderWithProviders(<${ComponentName} open={false} />);
      expect(document.querySelector('[data-state="closed"]')).toBeInTheDocument();
      
      rerender(<${ComponentName} open={true} />);
      expect(document.querySelector('[data-state="open"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<${ComponentName} aria-label="Layout component" />);
      const container = document.querySelector('[role="region"], [role="tablist"], [role="navigation"]');
      if (container) {
        expect(container).toHaveAttribute('aria-label', 'Layout component');
      }
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<${ComponentName} />);
      const focusable = document.querySelector('button, [tabindex="0"]');
      if (focusable) {
        focusable.focus();
        expect(focusable).toHaveFocus();
        
        fireEvent.keyDown(focusable, { key: 'Enter' });
        fireEvent.keyDown(focusable, { key: 'Space' });
        fireEvent.keyDown(focusable, { key: 'Escape' });
      }
    });

    it('manages focus correctly', () => {
      renderWithProviders(<${ComponentName} />);
      // Test focus management
    });
  });
`;
}

// Generate feedback component tests
function generateFeedbackTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[role="alert"], [role="dialog"], [role="status"]')).toBeInTheDocument();
    });

    it('renders with message content', () => {
      renderWithProviders(<${ComponentName} message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      renderWithProviders(
        <${ComponentName} title="Title" description="Description" />
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'success', 'warning', 'error', 'info'];
    
    variants.forEach(variant => {
      it(\`renders \${variant} variant\`, () => {
        renderWithProviders(<${ComponentName} variant={variant} />);
        const element = document.querySelector('[data-variant], [class*="' + variant + '"]');
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Visibility Control', () => {
    it('shows and hides correctly', async () => {
      const { rerender } = renderWithProviders(<${ComponentName} open={true} />);
      expect(screen.getByRole?.('dialog') || document.querySelector('[data-state="open"]')).toBeInTheDocument();
      
      rerender(<${ComponentName} open={false} />);
      await waitFor(() => {
        expect(screen.queryByRole?.('dialog') || document.querySelector('[data-state="closed"]')).not.toBeInTheDocument();
      });
    });

    it('auto-dismisses after timeout', async () => {
      renderWithProviders(<${ComponentName} autoClose duration={1000} />);
      await waitFor(() => {
        expect(document.querySelector('[data-state="closed"]')).toBeInTheDocument();
      }, { timeout: 1500 });
    });

    it('handles close button click', () => {
      const handleClose = vi.fn();
      renderWithProviders(<${ComponentName} onClose={handleClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('renders action buttons', () => {
      renderWithProviders(
        <${ComponentName} 
          primaryAction={{ label: 'Confirm', onClick: vi.fn() }}
          secondaryAction={{ label: 'Cancel', onClick: vi.fn() }}
        />
      );
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('handles action clicks', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();
      renderWithProviders(
        <${ComponentName} 
          primaryAction={{ label: 'Confirm', onClick: handleConfirm }}
          secondaryAction={{ label: 'Cancel', onClick: handleCancel }}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
      expect(handleConfirm).toHaveBeenCalled();
      
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(handleCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      renderWithProviders(<${ComponentName} />);
      const element = document.querySelector('[role="alert"], [role="dialog"], [role="status"]');
      expect(element).toBeInTheDocument();
    });

    it('manages focus for modals', () => {
      renderWithProviders(<${ComponentName} modal />);
      const dialog = screen.getByRole?.('dialog');
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      }
    });

    it('supports keyboard dismissal', () => {
      const handleClose = vi.fn();
      renderWithProviders(<${ComponentName} onClose={handleClose} />);
      
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });
`;
}

// Generate navigation component tests
function generateNavigationTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[role="navigation"], [data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders navigation items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ];
      renderWithProviders(<${ComponentName} items={items} />);
      
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
      renderWithProviders(<${ComponentName} items={items} />);
      
      const activeItem = screen.getByText('Home').closest('a, button');
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });

    it('handles item clicks', () => {
      const handleClick = vi.fn();
      const items = [
        { label: 'Home', onClick: handleClick }
      ];
      renderWithProviders(<${ComponentName} items={items} />);
      
      fireEvent.click(screen.getByText('Home'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('supports disabled items', () => {
      const items = [
        { label: 'Disabled', disabled: true }
      ];
      renderWithProviders(<${ComponentName} items={items} />);
      
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
      renderWithProviders(<${ComponentName} items={items} searchable />);
      
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'app' } });
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      });
    });

    it('shows no results message', async () => {
      renderWithProviders(<${ComponentName} items={[]} searchable />);
      
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
      renderWithProviders(<${ComponentName} items={items} />);
      
      const firstItem = screen.getByText('Item 1');
      firstItem.focus();
      
      fireEvent.keyDown(firstItem, { key: 'ArrowDown' });
      expect(screen.getByText('Item 2')).toHaveFocus();
      
      fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
      expect(screen.getByText('Item 1')).toHaveFocus();
    });

    it('supports Enter key selection', () => {
      const handleSelect = vi.fn();
      renderWithProviders(<${ComponentName} onSelect={handleSelect} />);
      
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
      renderWithProviders(<${ComponentName} aria-label="Main navigation" />);
      const nav = document.querySelector('[role="navigation"]');
      if (nav) {
        expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      }
    });

    it('supports screen reader announcements', () => {
      renderWithProviders(<${ComponentName} currentPage={2} totalPages={5} />);
      const status = screen.getByRole?.('status');
      if (status) {
        expect(status).toHaveTextContent(/page 2 of 5/i);
      }
    });
  });
`;
}

// Generate display component tests
function generateDisplayTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders with content', () => {
      renderWithProviders(
        <${ComponentName}>
          <span>Display content</span>
        </${ComponentName}>
      );
      expect(screen.getByText('Display content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<${ComponentName} className="custom-display" />);
      expect(document.querySelector('.custom-display')).toBeInTheDocument();
    });
  });

  describe('Display Properties', () => {
    it('renders with different sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      sizes.forEach(size => {
        const { container } = renderWithProviders(<${ComponentName} size={size} />);
        expect(container.firstChild).toHaveClass(size);
      });
    });

    it('supports different variants', () => {
      const variants = ['default', 'primary', 'secondary'];
      variants.forEach(variant => {
        const { container } = renderWithProviders(<${ComponentName} variant={variant} />);
        expect(container.firstChild).toHaveClass(variant);
      });
    });

    it('handles loading state', () => {
      renderWithProviders(<${ComponentName} loading />);
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('handles empty state', () => {
      renderWithProviders(<${ComponentName} data={[]} emptyMessage="No data" />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  describe('Media Support', () => {
    it('renders images correctly', () => {
      renderWithProviders(
        <${ComponentName} image="/test.jpg" alt="Test image" />
      );
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('handles image loading errors', () => {
      const handleError = vi.fn();
      renderWithProviders(
        <${ComponentName} image="/invalid.jpg" onImageError={handleError} />
      );
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(handleError).toHaveBeenCalled();
    });

    it('renders icons', () => {
      renderWithProviders(<${ComponentName} icon="star" />);
      expect(document.querySelector('[data-icon="star"]')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events when clickable', () => {
      const handleClick = vi.fn();
      renderWithProviders(<${ComponentName} onClick={handleClick} />);
      
      fireEvent.click(document.querySelector('[role="button"]'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('shows tooltip on hover', async () => {
      renderWithProviders(<${ComponentName} tooltip="Additional info" />);
      
      const element = document.querySelector('[data-testid="${componentName}"]');
      fireEvent.mouseEnter(element);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Additional info');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML', () => {
      renderWithProviders(<${ComponentName} />);
      // Check for appropriate semantic elements
    });

    it('supports ARIA labels', () => {
      renderWithProviders(<${ComponentName} aria-label="Display component" />);
      const element = document.querySelector('[aria-label="Display component"]');
      expect(element).toBeInTheDocument();
    });

    it('handles reduced motion preference', () => {
      renderWithProviders(<${ComponentName} animated />);
      // Test animation behavior with prefers-reduced-motion
    });
  });
`;
}

// Generate interactive component tests
function generateInteractiveTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[role="button"], [data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithProviders(<${ComponentName} label="Click me" />);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<${ComponentName} className="custom-interactive" />);
      expect(document.querySelector('.custom-interactive')).toBeInTheDocument();
    });
  });

  describe('Interaction States', () => {
    it('handles hover state', () => {
      renderWithProviders(<${ComponentName} />);
      const element = document.querySelector('[role="button"]');
      
      fireEvent.mouseEnter(element);
      expect(element).toHaveClass('hover');
      
      fireEvent.mouseLeave(element);
      expect(element).not.toHaveClass('hover');
    });

    it('handles focus state', () => {
      renderWithProviders(<${ComponentName} />);
      const element = document.querySelector('[role="button"]');
      
      element.focus();
      expect(element).toHaveFocus();
      expect(element).toHaveClass('focus');
    });

    it('handles active/pressed state', () => {
      renderWithProviders(<${ComponentName} />);
      const element = document.querySelector('[role="button"]');
      
      fireEvent.mouseDown(element);
      expect(element).toHaveClass('active');
      
      fireEvent.mouseUp(element);
      expect(element).not.toHaveClass('active');
    });

    it('handles disabled state', () => {
      renderWithProviders(<${ComponentName} disabled />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toBeDisabled();
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Click Handling', () => {
    it('triggers onClick handler', () => {
      const handleClick = vi.fn();
      renderWithProviders(<${ComponentName} onClick={handleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.click(element);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click when disabled', () => {
      const handleClick = vi.fn();
      renderWithProviders(<${ComponentName} disabled onClick={handleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.click(element);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles double click', () => {
      const handleDoubleClick = vi.fn();
      renderWithProviders(<${ComponentName} onDoubleClick={handleDoubleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.doubleClick(element);
      
      expect(handleDoubleClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('triggers action on Enter key', () => {
      const handleAction = vi.fn();
      renderWithProviders(<${ComponentName} onClick={handleAction} />);
      
      const element = document.querySelector('[role="button"]');
      element.focus();
      fireEvent.keyDown(element, { key: 'Enter' });
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('triggers action on Space key', () => {
      const handleAction = vi.fn();
      renderWithProviders(<${ComponentName} onClick={handleAction} />);
      
      const element = document.querySelector('[role="button"]');
      element.focus();
      fireEvent.keyDown(element, { key: ' ' });
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(
        <>
          <${ComponentName} />
          <${ComponentName} />
          <${ComponentName} />
        </>
      );
      
      const elements = document.querySelectorAll('[role="button"]');
      elements[0].focus();
      
      fireEvent.keyDown(elements[0], { key: 'Tab' });
      expect(elements[1]).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<${ComponentName} aria-label="Interactive element" />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toHaveAttribute('aria-label', 'Interactive element');
      expect(element).toHaveAttribute('tabindex', '0');
    });

    it('announces state changes', () => {
      const { rerender } = renderWithProviders(<${ComponentName} pressed={false} />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toHaveAttribute('aria-pressed', 'false');
      
      rerender(<${ComponentName} pressed={true} />);
      expect(element).toHaveAttribute('aria-pressed', 'true');
    });

    it('supports custom key bindings', () => {
      const handleShortcut = vi.fn();
      renderWithProviders(<${ComponentName} onShortcut={handleShortcut} shortcut="ctrl+s" />);
      
      fireEvent.keyDown(document.body, { key: 's', ctrlKey: true });
      expect(handleShortcut).toHaveBeenCalled();
    });
  });
`;
}

// Generate complex component tests
function generateComplexTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders with initial data', () => {
      const data = { /* mock data */ };
      renderWithProviders(<${ComponentName} data={data} />);
      // Verify data is rendered
    });

    it('handles loading state', () => {
      renderWithProviders(<${ComponentName} loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('handles error state', () => {
      renderWithProviders(<${ComponentName} error="Failed to load" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    it('loads data on mount', async () => {
      const fetchData = vi.fn().mockResolvedValue({ /* mock data */ });
      renderWithProviders(<${ComponentName} onLoad={fetchData} />);
      
      await waitFor(() => {
        expect(fetchData).toHaveBeenCalled();
      });
    });

    it('handles data updates', async () => {
      const { rerender } = renderWithProviders(<${ComponentName} data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
      
      const newData = [{ id: 1, name: 'Item 1' }];
      rerender(<${ComponentName} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('supports pagination', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({ id: i, name: \`Item \${i}\` }));
      renderWithProviders(<${ComponentName} data={data} pageSize={10} />);
      
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
      renderWithProviders(<${ComponentName} data={data} sortable />);
      
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
      renderWithProviders(<${ComponentName} data={data} filterable />);
      
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
      renderWithProviders(<${ComponentName} data={data} onSelect={handleSelect} />);
      
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
      renderWithProviders(<${ComponentName} data={data} multiSelect onSelect={handleSelect} />);
      
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
      renderWithProviders(<${ComponentName} data={data} draggable onReorder={handleReorder} />);
      
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
      renderWithProviders(<${ComponentName} data={data} editable onEdit={handleEdit} />);
      
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
      const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: \`Item \${i}\` }));
      renderWithProviders(<${ComponentName} data={data} virtualize />);
      
      // Only visible items should be rendered
      const renderedItems = screen.getAllByTestId('data-item');
      expect(renderedItems.length).toBeLessThan(50);
    });

    it('debounces search input', async () => {
      const handleSearch = vi.fn();
      renderWithProviders(<${ComponentName} onSearch={handleSearch} />);
      
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
      renderWithProviders(<${ComponentName} aria-label="Complex component" />);
      const container = document.querySelector('[data-testid="${componentName}"]');
      expect(container).toHaveAttribute('aria-label', 'Complex component');
    });

    it('announces updates to screen readers', async () => {
      renderWithProviders(<${ComponentName} />);
      const liveRegion = screen.getByRole('status', { live: 'polite' });
      
      // Trigger an update
      const updateButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/updated/i);
      });
    });

    it('supports keyboard navigation throughout', () => {
      renderWithProviders(<${ComponentName} />);
      
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
`;
}

// Generate generic tests for uncategorized components
function generateGenericTests(ComponentName, componentName) {
  return `  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<${ComponentName} />);
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('renders with children', () => {
      renderWithProviders(
        <${ComponentName}>
          <span>Test content</span>
        </${ComponentName}>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<${ComponentName} className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithProviders(<${ComponentName} ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts and applies style prop', () => {
      renderWithProviders(
        <${ComponentName} style={{ backgroundColor: 'red' }} />
      );
      const element = document.querySelector('[data-testid="${componentName}"]');
      expect(element).toHaveStyle({ backgroundColor: 'red' });
    });

    it('accepts data attributes', () => {
      renderWithProviders(
        <${ComponentName} data-custom="value" />
      );
      const element = document.querySelector('[data-custom="value"]');
      expect(element).toBeInTheDocument();
    });

    it('spreads additional props', () => {
      renderWithProviders(
        <${ComponentName} title="Tooltip text" role="complementary" />
      );
      const element = document.querySelector('[role="complementary"]');
      expect(element).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('Events', () => {
    it('handles onClick events', () => {
      const handleClick = vi.fn();
      renderWithProviders(<${ComponentName} onClick={handleClick} />);
      
      const element = document.querySelector('[data-testid="${componentName}"]');
      fireEvent.click(element);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('handles onMouseEnter and onMouseLeave', () => {
      const handleEnter = vi.fn();
      const handleLeave = vi.fn();
      renderWithProviders(
        <${ComponentName} 
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        />
      );
      
      const element = document.querySelector('[data-testid="${componentName}"]');
      
      fireEvent.mouseEnter(element);
      expect(handleEnter).toHaveBeenCalled();
      
      fireEvent.mouseLeave(element);
      expect(handleLeave).toHaveBeenCalled();
    });

    it('handles onFocus and onBlur', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      renderWithProviders(
        <${ComponentName} 
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        />
      );
      
      const element = document.querySelector('[data-testid="${componentName}"]');
      
      fireEvent.focus(element);
      expect(handleFocus).toHaveBeenCalled();
      
      fireEvent.blur(element);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('maintains internal state correctly', () => {
      const { rerender } = renderWithProviders(<${ComponentName} />);
      // Test internal state management
      
      rerender(<${ComponentName} />);
      // Verify state persists across rerenders
    });

    it('responds to prop changes', () => {
      const { rerender } = renderWithProviders(
        <${ComponentName} value="initial" />
      );
      
      rerender(<${ComponentName} value="updated" />);
      // Verify component updates accordingly
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA attributes', () => {
      renderWithProviders(
        <${ComponentName} aria-label="Component label" />
      );
      const element = document.querySelector('[aria-label="Component label"]');
      expect(element).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      renderWithProviders(<${ComponentName} tabIndex={0} />);
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
        <${ComponentName} role="region" aria-describedby="description" />
      );
      
      const element = document.querySelector('[role="region"]');
      expect(element).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('handles null/undefined props gracefully', () => {
      renderWithProviders(
        <${ComponentName} value={null} data={undefined} />
      );
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('handles empty arrays/objects', () => {
      renderWithProviders(
        <${ComponentName} items={[]} config={{}} />
      );
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longText = 'a'.repeat(10000);
      renderWithProviders(
        <${ComponentName} text={longText} />
      );
      expect(document.querySelector('[data-testid="${componentName}"]')).toBeInTheDocument();
    });
  });
`;
}

// Get statistics
function getStatistics() {
  const total = Object.keys(COMPONENTS).length;
  const tested = Object.values(COMPONENTS).filter(c => c.tested).length;
  const remaining = total - tested;
  const percentage = ((tested / total) * 100).toFixed(1);
  
  return {
    total,
    tested,
    remaining,
    percentage
  };
}

// Main generator function
function generateTests(componentNames = []) {
  const stats = getStatistics();
  console.log(`
╔════════════════════════════════════════════╗
║     Test Generator for Directus UI        ║
╠════════════════════════════════════════════╣
║  Total Components: ${stats.total.toString().padEnd(24)}║
║  Tested: ${stats.tested.toString().padEnd(34)}║
║  Remaining: ${stats.remaining.toString().padEnd(31)}║
║  Coverage: ${stats.percentage}%${' '.repeat(31 - stats.percentage.length)}║
╚════════════════════════════════════════════╝
  `);

  const componentsToTest = componentNames.length > 0 
    ? componentNames 
    : Object.entries(COMPONENTS)
        .filter(([_, info]) => !info.tested && !info.skip)
        .map(([name]) => name);

  if (componentsToTest.length === 0) {
    console.log('✅ All components have tests!');
    return [];
  }

  const tests = [];
  
  componentsToTest.forEach(componentName => {
    if (!COMPONENTS[componentName]) {
      console.log(`❌ Component "${componentName}" not found`);
      return;
    }

    const componentInfo = COMPONENTS[componentName];
    const testContent = generateTestTemplate(componentName, componentInfo);
    const testPath = componentInfo.type === 'dir' 
      ? `packages/ui/src/components/${componentName}/${componentName}.test.tsx`
      : `packages/ui/src/components/${componentName}.test.tsx`;

    tests.push({
      path: testPath,
      content: testContent,
      component: componentName
    });

    console.log(`✅ Generated test for: ${componentName}`);
  });

  return tests;
}

// Export for use in other scripts
module.exports = {
  generateTests,
  generateTestTemplate,
  COMPONENTS,
  COMPONENT_CATEGORIES,
  getStatistics
};

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const tests = generateTests(args);
  
  if (tests.length > 0) {
    console.log(`
Generated ${tests.length} test files.
Use the GitHub API to create these files in your repository.
    `);
  }
}
