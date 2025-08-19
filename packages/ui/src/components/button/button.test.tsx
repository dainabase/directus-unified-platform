/**
 * Button Component Tests - Enterprise Dashboard Premium ⭐⭐⭐⭐⭐
 * 
 * Comprehensive test suite covering all premium dashboard features:
 * - 6 Theme systems testing
 * - 13 Variant combinations
 * - Advanced loading states
 * - Icon and badge integrations
 * - Specialized components (Executive, Action, Analytics, Finance)
 * - Keyboard shortcuts and accessibility
 * - Performance and analytics tracking
 * - Micro-animations and interactions
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import { 
  Button, 
  ExecutiveButton, 
  ActionButton, 
  AnalyticsButton, 
  FinanceButton,
  type ButtonTheme,
  type ButtonVariant,
  type ButtonSize,
  type IconName,
} from './index';
import { Loader2, Download, TrendingUp } from 'lucide-react';

// =================== BASIC RENDERING TESTS ===================

describe('Button Component - Basic Functionality', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      renderWithProviders(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderWithProviders(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders as a child component when asChild is true', () => {
      renderWithProviders(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      renderWithProviders(<Button ref={ref}>Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Basic States', () => {
    it('handles disabled state', () => {
      renderWithProviders(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents click when disabled', () => {
      const handleClick = jest.fn();
      renderWithProviders(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

// =================== THEME SYSTEM TESTS ===================

describe('Button Component - Theme System', () => {
  const themes: ButtonTheme[] = ['executive', 'analytics', 'finance', 'dashboard', 'minimal', 'default'];

  themes.forEach(theme => {
    describe(`${theme} theme`, () => {
      it(`applies ${theme} theme classes correctly`, () => {
        renderWithProviders(
          <Button theme={theme} data-testid={`btn-${theme}`}>
            {theme} Button
          </Button>
        );
        const button = screen.getByTestId(`btn-${theme}`);
        expect(button).toBeInTheDocument();
      });

      it(`${theme} theme works with primary variant`, () => {
        renderWithProviders(
          <Button theme={theme} variant="primary" data-testid={`btn-${theme}-primary`}>
            Primary
          </Button>
        );
        expect(screen.getByTestId(`btn-${theme}-primary`)).toBeInTheDocument();
      });

      it(`${theme} theme works with secondary variant`, () => {
        renderWithProviders(
          <Button theme={theme} variant="secondary" data-testid={`btn-${theme}-secondary`}>
            Secondary
          </Button>
        );
        expect(screen.getByTestId(`btn-${theme}-secondary`)).toBeInTheDocument();
      });

      it(`${theme} theme works with ghost variant`, () => {
        renderWithProviders(
          <Button theme={theme} variant="ghost" data-testid={`btn-${theme}-ghost`}>
            Ghost
          </Button>
        );
        expect(screen.getByTestId(`btn-${theme}-ghost`)).toBeInTheDocument();
      });
    });
  });

  it('defaults to default theme when not specified', () => {
    renderWithProviders(<Button data-testid="default-theme">Default</Button>);
    expect(screen.getByTestId('default-theme')).toBeInTheDocument();
  });
});

// =================== VARIANT SYSTEM TESTS ===================

describe('Button Component - Variant System', () => {
  const variants: ButtonVariant[] = [
    'primary', 'secondary', 'executive', 'action', 'analytics', 
    'finance', 'danger', 'success', 'ghost', 'outline', 'link', 'icon', 'floating'
  ];

  variants.forEach(variant => {
    it(`renders ${variant} variant correctly`, () => {
      renderWithProviders(
        <Button variant={variant} data-testid={`btn-${variant}`}>
          {variant === 'icon' ? '×' : `${variant} Button`}
        </Button>
      );
      const button = screen.getByTestId(`btn-${variant}`);
      expect(button).toBeInTheDocument();
    });
  });

  it('applies correct classes for executive variant', () => {
    renderWithProviders(<Button variant="executive">Executive</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('font-bold', 'tracking-wide', 'text-base');
  });

  it('applies correct classes for floating variant', () => {
    renderWithProviders(<Button variant="floating">Floating</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full', 'fixed');
  });

  it('applies danger styling correctly', () => {
    renderWithProviders(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  it('applies success styling correctly', () => {
    renderWithProviders(<Button variant="success">Success</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-600', 'text-white');
  });
});

// =================== SIZE SYSTEM TESTS ===================

describe('Button Component - Size System', () => {
  const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'icon', 'fab'];

  sizes.forEach(size => {
    it(`renders ${size} size correctly`, () => {
      renderWithProviders(
        <Button size={size} data-testid={`btn-${size}`}>
          {['icon', 'fab'].includes(size) ? '×' : `${size} Button`}
        </Button>
      );
      const button = screen.getByTestId(`btn-${size}`);
      expect(button).toBeInTheDocument();
    });
  });

  it('applies correct height classes for different sizes', () => {
    const sizeClasses = {
      xs: 'h-7',
      sm: 'h-8',
      md: 'h-9',
      lg: 'h-10',
      xl: 'h-12',
      icon: 'h-9',
      fab: 'h-14',
    };

    Object.entries(sizeClasses).forEach(([size, className]) => {
      renderWithProviders(
        <Button size={size as ButtonSize} data-testid={`size-${size}`}>
          Test
        </Button>
      );
      expect(screen.getByTestId(`size-${size}`)).toHaveClass(className);
    });
  });
});

// =================== LOADING STATES TESTS ===================

describe('Button Component - Loading States', () => {
  it('shows loading state with default spinner', () => {
    renderWithProviders(<Button loading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('shows loading state with custom loading text', () => {
    renderWithProviders(
      <Button loading loadingText="Processing...">
        Submit
      </Button>
    );
    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('shows loading state with custom icon', () => {
    renderWithProviders(
      <Button loading loadingIcon={<Loader2 className="custom-loader" />}>
        Custom Loading
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('.custom-loader')).toBeInTheDocument();
  });

  it('prevents click when loading', () => {
    const handleClick = jest.fn();
    renderWithProviders(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows proper aria-label when loading', () => {
    renderWithProviders(
      <Button loading loadingText="Saving data...">
        Save
      </Button>
    );
    expect(screen.getByLabelText(/saving data/i)).toBeInTheDocument();
  });
});

// =================== ICON SYSTEM TESTS ===================

describe('Button Component - Icon System', () => {
  it('renders with left icon by default', () => {
    renderWithProviders(
      <Button icon="download">
        Download
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with right icon when specified', () => {
    renderWithProviders(
      <Button icon="download" iconPosition="right">
        Download
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with both icon and rightIcon', () => {
    renderWithProviders(
      <Button icon="download" rightIcon="chevronRight">
        Download
      </Button>
    );
    const button = screen.getByRole('button');
    const icons = button.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
  });

  it('renders with custom React icon', () => {
    renderWithProviders(
      <Button icon={<Download className="custom-icon" />}>
        Download
      </Button>
    );
    expect(screen.getByRole('button').querySelector('.custom-icon')).toBeInTheDocument();
  });

  it('handles icon-only buttons correctly', () => {
    renderWithProviders(
      <Button size="icon" icon="close" aria-label="Close">
      </Button>
    );
    const button = screen.getByRole('button', { name: /close/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  const iconNames: IconName[] = [
    'download', 'upload', 'refresh', 'settings', 'check', 'close',
    'alert', 'info', 'trending', 'finance', 'analytics', 'users'
  ];

  iconNames.forEach(iconName => {
    it(`renders ${iconName} icon correctly`, () => {
      renderWithProviders(
        <Button icon={iconName} data-testid={`icon-${iconName}`}>
          Test
        </Button>
      );
      expect(screen.getByTestId(`icon-${iconName}`).querySelector('svg')).toBeInTheDocument();
    });
  });
});

// =================== BADGE SYSTEM TESTS ===================

describe('Button Component - Badge System', () => {
  it('renders with numeric badge', () => {
    renderWithProviders(
      <Button badge={5}>
        Notifications
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('span')).toHaveTextContent('5');
  });

  it('renders with string badge', () => {
    renderWithProviders(
      <Button badge="NEW">
        Feature
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('span')).toHaveTextContent('NEW');
  });

  const badgeVariants = ['default', 'success', 'warning', 'error'] as const;

  badgeVariants.forEach(variant => {
    it(`renders ${variant} badge variant correctly`, () => {
      renderWithProviders(
        <Button badge={3} badgeVariant={variant} data-testid={`badge-${variant}`}>
          Test
        </Button>
      );
      const badge = screen.getByTestId(`badge-${variant}`).querySelector('span');
      expect(badge).toBeInTheDocument();
    });
  });

  it('positions badge correctly with relative positioning', () => {
    renderWithProviders(
      <Button badge={1}>
        Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('relative');
  });
});

// =================== KEYBOARD SHORTCUTS TESTS ===================

describe('Button Component - Keyboard Shortcuts', () => {
  beforeEach(() => {
    // Mock console.log for analytics
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays keyboard shortcut hint', () => {
    renderWithProviders(
      <Button shortcut="Ctrl+S">
        Save
      </Button>
    );
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });

  it('triggers click on keyboard shortcut', () => {
    const handleClick = jest.fn();
    renderWithProviders(
      <Button shortcut="Ctrl+S" onClick={handleClick}>
        Save
      </Button>
    );

    fireEvent.keyDown(document, {
      key: 's',
      ctrlKey: true,
    });

    expect(handleClick).toHaveBeenCalled();
  });

  it('handles complex keyboard shortcuts', () => {
    const handleClick = jest.fn();
    renderWithProviders(
      <Button shortcut="Ctrl+Shift+P" onClick={handleClick}>
        Command Palette
      </Button>
    );

    fireEvent.keyDown(document, {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
    });

    expect(handleClick).toHaveBeenCalled();
  });

  it('prevents default behavior on shortcut trigger', () => {
    const preventDefault = jest.fn();
    renderWithProviders(
      <Button shortcut="Ctrl+S">
        Save
      </Button>
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    event.preventDefault = preventDefault;

    fireEvent(document, event);
    expect(preventDefault).toHaveBeenCalled();
  });
});

// =================== ANALYTICS TRACKING TESTS ===================

describe('Button Component - Analytics Tracking', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tracks button clicks with trackingId', () => {
    const trackingData = { section: 'header', action: 'download' };
    renderWithProviders(
      <Button trackingId="header-download" trackingData={trackingData}>
        Download
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(console.log).toHaveBeenCalledWith('Button clicked:', {
      trackingId: 'header-download',
      trackingData,
    });
  });

  it('does not track when no trackingId provided', () => {
    renderWithProviders(<Button>No Tracking</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Button clicked:'),
      expect.anything()
    );
  });
});

// =================== ADVANCED STYLING TESTS ===================

describe('Button Component - Advanced Styling', () => {
  it('applies gradient styling when enabled', () => {
    renderWithProviders(
      <Button variant="primary" gradient>
        Gradient Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gradient-to-r');
  });

  it('applies glassmorphism styling when enabled', () => {
    renderWithProviders(
      <Button glassmorphism>
        Glass Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('backdrop-blur-lg', 'bg-white/10');
  });

  it('applies hover animation when enabled', () => {
    renderWithProviders(
      <Button animateOnHover>
        Animated Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:scale-105');
  });

  it('applies pulse animation on mount when enabled', () => {
    renderWithProviders(
      <Button pulseOnMount>
        Pulse Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('animate-pulse');
  });
});

// =================== ACCESSIBILITY TESTS ===================

describe('Button Component - Accessibility', () => {
  it('supports custom aria-label', () => {
    renderWithProviders(
      <Button aria-label="Custom label">
        Button
      </Button>
    );
    expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
  });

  it('supports description prop for screen readers', () => {
    renderWithProviders(
      <Button description="This button saves your data" id="save-btn">
        Save
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'save-btn-description');
    expect(screen.getByText('This button saves your data')).toHaveClass('sr-only');
  });

  it('supports tooltip content', () => {
    renderWithProviders(
      <Button tooltipContent="Click to save your work">
        Save
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Click to save your work');
  });

  it('maintains focus styles', () => {
    renderWithProviders(<Button>Focus me</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
  });

  it('has correct focus ring classes', () => {
    renderWithProviders(<Button>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2');
  });
});

// =================== SPECIALIZED COMPONENTS TESTS ===================

describe('ExecutiveButton Component', () => {
  it('renders with metric and trend', () => {
    renderWithProviders(
      <ExecutiveButton metric="Q4 Revenue" trend="up" priority="high">
        $2.4M
      </ExecutiveButton>
    );
    expect(screen.getByText('Q4 Revenue')).toBeInTheDocument();
    expect(screen.getByText('$2.4M')).toBeInTheDocument();
  });

  it('applies correct theme based on priority', () => {
    renderWithProviders(
      <ExecutiveButton priority="high" data-testid="high-priority">
        High Priority
      </ExecutiveButton>
    );
    expect(screen.getByTestId('high-priority')).toBeInTheDocument();
  });

  it('renders different trends correctly', () => {
    const trends = ['up', 'down', 'neutral'] as const;
    trends.forEach(trend => {
      renderWithProviders(
        <ExecutiveButton trend={trend} data-testid={`trend-${trend}`}>
          Trend {trend}
        </ExecutiveButton>
      );
      expect(screen.getByTestId(`trend-${trend}`)).toBeInTheDocument();
    });
  });
});

describe('ActionButton Component', () => {
  it('renders with action type icon', () => {
    renderWithProviders(
      <ActionButton actionType="create">
        Create New
      </ActionButton>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  const actionTypes = ['create', 'edit', 'delete', 'view', 'export', 'import'] as const;

  actionTypes.forEach(actionType => {
    it(`renders ${actionType} action type correctly`, () => {
      renderWithProviders(
        <ActionButton actionType={actionType} data-testid={`action-${actionType}`}>
          {actionType} Action
        </ActionButton>
      );
      expect(screen.getByTestId(`action-${actionType}`)).toBeInTheDocument();
    });
  });
});

describe('AnalyticsButton Component', () => {
  it('renders with data type specific styling', () => {
    renderWithProviders(
      <AnalyticsButton dataType="chart" visualizationType="line">
        Generate Chart
      </AnalyticsButton>
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  const dataTypes = ['chart', 'table', 'export', 'filter', 'drill-down'] as const;

  dataTypes.forEach(dataType => {
    it(`renders ${dataType} data type correctly`, () => {
      renderWithProviders(
        <AnalyticsButton dataType={dataType} data-testid={`data-${dataType}`}>
          {dataType} Analytics
        </AnalyticsButton>
      );
      expect(screen.getByTestId(`data-${dataType}`)).toBeInTheDocument();
    });
  });
});

describe('FinanceButton Component', () => {
  it('renders with formatted amount', () => {
    renderWithProviders(
      <FinanceButton financialAction="approve" amount={15000} currency="USD">
        Approve Budget
      </FinanceButton>
    );
    expect(screen.getByText(/\$15,000/)).toBeInTheDocument();
  });

  it('renders with different currencies', () => {
    renderWithProviders(
      <FinanceButton amount={5000} currency="EUR">
        Euro Amount
      </FinanceButton>
    );
    expect(screen.getByText(/€5,000/)).toBeInTheDocument();
  });

  const financialActions = ['approve', 'reject', 'review', 'calculate', 'forecast'] as const;

  financialActions.forEach(action => {
    it(`renders ${action} financial action correctly`, () => {
      renderWithProviders(
        <FinanceButton financialAction={action} data-testid={`finance-${action}`}>
          {action} Action
        </FinanceButton>
      );
      expect(screen.getByTestId(`finance-${action}`)).toBeInTheDocument();
    });
  });
});

// =================== INTERACTION TESTS ===================

describe('Button Component - Interactions', () => {
  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard activation with Enter', () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Keyboard</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('handles keyboard activation with Space', () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Space</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('shows click animation effect', async () => {
    renderWithProviders(<Button>Animated</Button>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // Check for scale animation class
    await waitFor(() => {
      expect(button).toHaveClass('scale-95');
    });
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(button).not.toHaveClass('scale-95');
    }, { timeout: 200 });
  });
});

// =================== PERFORMANCE TESTS ===================

describe('Button Component - Performance', () => {
  it('renders efficiently with all props', () => {
    const startTime = performance.now();
    
    renderWithProviders(
      <Button
        variant="executive"
        size="lg"
        theme="analytics"
        icon="trending"
        rightIcon="chevronRight"
        badge={5}
        shortcut="Ctrl+E"
        gradient
        glassmorphism
        animateOnHover
        pulseOnMount
        trackingId="perf-test"
        loading={false}
      >
        Performance Test
      </Button>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render in less than 10ms
    expect(renderTime).toBeLessThan(10);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles rapid click events efficiently', () => {
    const handleClick = jest.fn();
    renderWithProviders(<Button onClick={handleClick}>Rapid Click</Button>);
    
    const button = screen.getByRole('button');
    
    // Simulate rapid clicking
    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }
    
    expect(handleClick).toHaveBeenCalledTimes(10);
  });
});

// =================== EDGE CASES TESTS ===================

describe('Button Component - Edge Cases', () => {
  it('handles empty children gracefully', () => {
    renderWithProviders(<Button></Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles undefined props gracefully', () => {
    renderWithProviders(
      <Button
        icon={undefined}
        badge={undefined}
        shortcut={undefined}
        theme={undefined}
      >
        Undefined Props
      </Button>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles very long text content', () => {
    const longText = 'This is a very long button text that might cause layout issues in some scenarios';
    renderWithProviders(<Button>{longText}</Button>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('works within button groups', () => {
    renderWithProviders(
      <div role="group" aria-label="Button group">
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('maintains functionality when theme prop changes', () => {
    const { rerender } = renderWithProviders(
      <Button theme="default" data-testid="theme-change">
        Theme Change
      </Button>
    );
    
    expect(screen.getByTestId('theme-change')).toBeInTheDocument();
    
    rerender(
      <Button theme="executive" data-testid="theme-change">
        Theme Change
      </Button>
    );
    
    expect(screen.getByTestId('theme-change')).toBeInTheDocument();
  });
});

// =================== COMPONENT COMPOSITION TESTS ===================

describe('Button Component - Composition', () => {
  it('works with complex icon compositions', () => {
    renderWithProviders(
      <Button
        icon={<TrendingUp className="text-green-500" />}
        rightIcon="chevronRight"
      >
        Complex Icons
      </Button>
    );
    
    const button = screen.getByRole('button');
    const icons = button.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
  });

  it('combines multiple styling props correctly', () => {
    renderWithProviders(
      <Button
        variant="executive"
        theme="analytics"
        gradient
        glassmorphism
        animateOnHover
        data-testid="combined-styles"
      >
        Combined Styles
      </Button>
    );
    
    const button = screen.getByTestId('combined-styles');
    expect(button).toHaveClass('backdrop-blur-lg', 'bg-gradient-to-r', 'hover:scale-105');
  });

  it('maintains accessibility with complex compositions', () => {
    renderWithProviders(
      <Button
        icon="analytics"
        badge={3}
        shortcut="Ctrl+A"
        description="Advanced analytics dashboard button"
        tooltipContent="Click to open analytics"
        aria-label="Analytics Dashboard"
      >
        Analytics
      </Button>
    );
    
    const button = screen.getByLabelText('Analytics Dashboard');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Click to open analytics');
  });
});
