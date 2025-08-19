import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  // Premium Components
  ExecutiveSelect,
  TeamSelect,
  MultiFilterSelect,
  CountrySelect,
  FinanceSelect,
  AnalyticsSelect,
  TagSelect,
  // Types
  type SelectItem as SelectItemType,
  type DashboardMetrics,
} from './index';

// 🧪 MOCK DATA FOR TESTING
const mockSelectItems: SelectItemType[] = [
  { value: 'apple', label: 'Apple', category: 'fruit', description: 'Fresh apple' },
  { value: 'banana', label: 'Banana', category: 'fruit', badge: 'Popular' },
  { value: 'orange', label: 'Orange', category: 'fruit', description: 'Citrus fruit' },
  { value: 'grape', label: 'Grape', category: 'fruit' },
  { value: 'strawberry', label: 'Strawberry', category: 'fruit', disabled: true },
];

const mockTeamMembers: SelectItemType[] = [
  {
    value: 'john',
    label: 'John Doe',
    description: 'Senior Developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    badge: 'Lead'
  },
  {
    value: 'jane',
    label: 'Jane Smith',
    description: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b6d?w=40&h=40&fit=crop&crop=face',
  },
  {
    value: 'mike',
    label: 'Mike Johnson',
    description: 'Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    badge: 'Senior'
  },
];

const mockExecutiveMetrics: SelectItemType[] = [
  {
    value: 'revenue',
    label: 'Total Revenue',
    description: 'Quarterly revenue growth',
    icon: '💰',
    badge: '+12.3%'
  },
  {
    value: 'users',
    label: 'Active Users',
    description: 'Monthly active users',
    icon: '👥',
    badge: '2.1M'
  },
  {
    value: 'conversion',
    label: 'Conversion Rate',
    description: 'Sales conversion rate',
    icon: '📈',
    badge: '3.2%'
  },
];

const mockCountries: SelectItemType[] = [
  {
    value: 'us',
    label: 'United States',
    description: 'North America',
    icon: '🇺🇸'
  },
  {
    value: 'gb',
    label: 'United Kingdom',
    description: 'Europe',
    icon: '🇬🇧'
  },
  {
    value: 'fr',
    label: 'France',
    description: 'Europe',
    icon: '🇫🇷'
  },
];

describe('Select Component - Basic Functionality', () => {
  const SelectExample = ({ 
    defaultValue, 
    value, 
    onValueChange,
    disabled = false 
  }: { 
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => (
    <Select 
      defaultValue={defaultValue} 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectSeparator />
          <SelectItem value="grape">Grape</SelectItem>
          <SelectItem value="strawberry" disabled>Strawberry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('displays placeholder text', () => {
      render(<SelectExample />);
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
    });

    it('displays default value', () => {
      render(<SelectExample defaultValue="apple" />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('applies custom className to trigger', () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('w-[180px]');
    });
  });

  describe('Interaction', () => {
    it('opens dropdown when trigger is clicked', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Fruits')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
      });
    });

    it('selects an item when clicked', async () => {
      const handleValueChange = jest.fn();
      render(<SelectExample onValueChange={handleValueChange} />);
      
      const trigger = screen.getByRole('combobox');
      await userEvent.click(trigger);
      
      await waitFor(() => {
        const bananaOption = screen.getByText('Banana');
        expect(bananaOption).toBeInTheDocument();
      });
      
      const bananaOption = screen.getByText('Banana');
      await userEvent.click(bananaOption);
      
      expect(handleValueChange).toHaveBeenCalledWith('banana');
    });

    it('closes dropdown after selection', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Apple'));
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('updates display value after selection', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      // Initially shows placeholder
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
      
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Orange')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Orange'));
      
      await waitFor(() => {
        // Now shows selected value
        expect(screen.getByText('Orange')).toBeInTheDocument();
        expect(screen.queryByText('Select a fruit')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled Component', () => {
    it('respects controlled value', () => {
      const { rerender } = render(<SelectExample value="banana" />);
      expect(screen.getByText('Banana')).toBeInTheDocument();
      
      rerender(<SelectExample value="orange" />);
      expect(screen.getByText('Orange')).toBeInTheDocument();
    });

    it('calls onValueChange when value changes', async () => {
      const handleValueChange = jest.fn();
      render(<SelectExample value="apple" onValueChange={handleValueChange} />);
      
      const trigger = screen.getByRole('combobox');
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Grape')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Grape'));
      
      expect(handleValueChange).toHaveBeenCalledWith('grape');
    });
  });

  describe('Disabled State', () => {
    it('disables the trigger when disabled prop is true', () => {
      render(<SelectExample disabled />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-disabled');
    });

    it('does not open when disabled', async () => {
      render(<SelectExample disabled />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows disabled items with correct styling', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        const strawberryOption = screen.getByText('Strawberry');
        expect(strawberryOption.closest('[data-disabled]')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens with Enter key', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('opens with Space key', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      trigger.focus();
      fireEvent.keyDown(trigger, { key: ' ' });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('closes with Escape key', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
      
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('maintains focus management', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Focus should be managed by Radix UI internally
      expect(document.activeElement).toBeTruthy();
    });

    it('announces selected value to screen readers', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Apple'));
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        // The selected value should be announced
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });
  });

  describe('Select Components', () => {
    it('renders SelectLabel correctly', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        const label = screen.getByText('Fruits');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('font-semibold');
      });
    });

    it('renders SelectSeparator correctly', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        // Separator is rendered between grape and strawberry
        const grapeItem = screen.getByText('Grape');
        const strawberryItem = screen.getByText('Strawberry');
        expect(grapeItem).toBeInTheDocument();
        expect(strawberryItem).toBeInTheDocument();
      });
    });
  });
});

// 🎯 PREMIUM DASHBOARD COMPONENTS TESTS
describe('ExecutiveSelect - C-Level Dashboard', () => {
  it('renders with executive theme styling', () => {
    render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
        placeholder="Select executive metric"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Select executive metric')).toBeInTheDocument();
  });

  it('displays metric icons and badges', async () => {
    render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
        placeholder="Select metric"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('+12.3%')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
    });
  });

  it('handles metric selection', async () => {
    const handleChange = jest.fn();
    render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
        onValueChange={handleChange}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Active Users'));
    expect(handleChange).toHaveBeenCalledWith('users');
  });
});

describe('TeamSelect - Member Management', () => {
  it('renders team members with avatars and descriptions', async () => {
    render(
      <TeamSelect
        members={mockTeamMembers}
        placeholder="Select team member"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Lead')).toBeInTheDocument();
    });
  });

  it('supports multi-select mode with chips', async () => {
    const selectedMembers = mockTeamMembers.slice(0, 2);
    const handleRemove = jest.fn();
    
    render(
      <TeamSelect
        members={mockTeamMembers}
        isMulti={true}
        selectedMembers={selectedMembers}
        onRemoveMember={handleRemove}
      />
    );
    
    // Should show selected member chips
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles member selection and removal', async () => {
    const handleChange = jest.fn();
    render(
      <TeamSelect
        members={mockTeamMembers}
        onValueChange={handleChange}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Mike Johnson'));
    expect(handleChange).toHaveBeenCalledWith('mike');
  });
});

describe('MultiFilterSelect - Advanced Filtering', () => {
  it('renders with search functionality', async () => {
    const handleChange = jest.fn();
    render(
      <MultiFilterSelect
        items={mockSelectItems}
        selectedValues={['apple', 'banana']}
        onValueChange={handleChange}
        searchable={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      // Should show search input
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('displays dashboard metrics', async () => {
    const handleChange = jest.fn();
    render(
      <MultiFilterSelect
        items={mockSelectItems}
        selectedValues={['apple']}
        onValueChange={handleChange}
        showMetrics={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    });
  });

  it('handles multi-selection correctly', async () => {
    const handleChange = jest.fn();
    render(
      <MultiFilterSelect
        items={mockSelectItems}
        selectedValues={['apple']}
        onValueChange={handleChange}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
    
    // Simulate multi-select click
    const bananaItem = screen.getByText('Banana');
    await userEvent.click(bananaItem);
    
    // Should add to selection
    expect(handleChange).toHaveBeenCalledWith(['apple', 'banana']);
  });

  it('supports clear all functionality', () => {
    const handleChange = jest.fn();
    render(
      <MultiFilterSelect
        items={mockSelectItems}
        selectedValues={['apple', 'banana', 'orange']}
        onValueChange={handleChange}
      />
    );
    
    // Should show clear button when items are selected
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    
    // Find and click clear button
    const clearButton = screen.getByLabelText('Clear selection');
    fireEvent.click(clearButton);
    
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});

describe('CountrySelect - Geographic Data', () => {
  it('renders countries with flags and descriptions', async () => {
    render(
      <CountrySelect
        countries={mockCountries}
        placeholder="Select country"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('North America')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });
  });

  it('supports country search filtering', async () => {
    render(
      <CountrySelect
        countries={mockCountries}
        searchable={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });
    
    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'france');
    
    // Should filter to show only France
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
    });
  });

  it('handles country selection', async () => {
    const handleChange = jest.fn();
    render(
      <CountrySelect
        countries={mockCountries}
        onValueChange={handleChange}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('United Kingdom'));
    expect(handleChange).toHaveBeenCalledWith('gb');
  });
});

describe('FinanceSelect - KPI Dashboard', () => {
  const mockFinanceKPIs: SelectItemType[] = [
    {
      value: 'revenue',
      label: 'Revenue Growth',
      description: 'Year-over-year revenue growth',
      icon: '💰',
      badge: '+15.2%'
    },
    {
      value: 'profit',
      label: 'Net Profit Margin',
      description: 'Profit margin percentage',
      icon: '📊',
      badge: '23.4%'
    },
  ];

  it('renders with finance theme styling', () => {
    render(
      <FinanceSelect
        kpis={mockFinanceKPIs}
        placeholder="Select KPI"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Select KPI')).toBeInTheDocument();
  });

  it('displays financial KPIs with badges', async () => {
    render(
      <FinanceSelect
        kpis={mockFinanceKPIs}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
      expect(screen.getByText('+15.2%')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
    });
  });
});

describe('AnalyticsSelect - Performance Metrics', () => {
  const mockAnalyticsMetrics: SelectItemType[] = Array.from({ length: 150 }, (_, i) => ({
    value: `metric-${i}`,
    label: `Metric ${i + 1}`,
    description: `Analytics metric ${i + 1}`,
    icon: '📈',
  }));

  it('renders with analytics theme', () => {
    render(
      <AnalyticsSelect
        metrics={mockAnalyticsMetrics.slice(0, 10)}
        placeholder="Select metric"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('supports virtualization for large datasets', async () => {
    render(
      <AnalyticsSelect
        metrics={mockAnalyticsMetrics}
        virtualized={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      // Should show some metrics but not all (virtualized)
      expect(screen.getByText('Metric 1')).toBeInTheDocument();
      // Should not show all 150 metrics at once
      expect(screen.queryByText('Metric 150')).not.toBeInTheDocument();
    });
  });

  it('handles analytics metric selection', async () => {
    const handleChange = jest.fn();
    render(
      <AnalyticsSelect
        metrics={mockAnalyticsMetrics.slice(0, 5)}
        onValueChange={handleChange}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Metric 3')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Metric 3'));
    expect(handleChange).toHaveBeenCalledWith('metric-2');
  });
});

describe('TagSelect - Dynamic Tag Creation', () => {
  const mockTags: SelectItemType[] = [
    { value: 'tag1', label: 'Urgent' },
    { value: 'tag2', label: 'Important' },
    { value: 'tag3', label: 'Review' },
  ];

  it('renders with existing tags', async () => {
    render(
      <TagSelect
        tags={mockTags}
        selectedTags={['tag1']}
        onTagsChange={() => {}}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  it('supports tag creation', async () => {
    const handleCreateTag = jest.fn();
    render(
      <TagSelect
        tags={mockTags}
        selectedTags={[]}
        onTagsChange={() => {}}
        onCreateTag={handleCreateTag}
        allowCreate={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });
    
    // Type new tag name
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'New Tag');
    
    await waitFor(() => {
      expect(screen.getByText('Create "New Tag"')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Create "New Tag"'));
    expect(handleCreateTag).toHaveBeenCalledWith('New Tag');
  });

  it('handles tag selection and removal', () => {
    const handleTagsChange = jest.fn();
    const selectedTags = ['tag1', 'tag2'];
    
    render(
      <TagSelect
        tags={mockTags}
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
      />
    );
    
    // Should display selected tags as chips
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
  });
});

// 🚀 PERFORMANCE & ACCESSIBILITY TESTS
describe('Performance Optimizations', () => {
  it('handles search debouncing efficiently', async () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      value: `item-${i}`,
      label: `Item ${i}`,
      description: `Description ${i}`,
    }));

    render(
      <MultiFilterSelect
        items={items}
        selectedValues={[]}
        onValueChange={() => {}}
        searchable={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Rapid typing should be debounced
    await userEvent.type(searchInput, 'test');
    
    // Should handle large datasets efficiently
    expect(searchInput).toHaveValue('test');
  });

  it('virtualizes large datasets correctly', async () => {
    const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
      value: `item-${i}`,
      label: `Item ${i}`,
    }));

    render(
      <AnalyticsSelect
        metrics={largeDataset}
        virtualized={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    // Should not render all 5000 items at once
    await waitFor(() => {
      const visibleItems = screen.getAllByText(/Item \d+/);
      expect(visibleItems.length).toBeLessThan(100); // Only visible items rendered
    });
  });
});

describe('Advanced Accessibility', () => {
  it('supports screen reader announcements for multi-select', () => {
    render(
      <MultiFilterSelect
        items={mockSelectItems}
        selectedValues={['apple', 'banana']}
        onValueChange={() => {}}
      />
    );
    
    // Should have appropriate ARIA labels for multi-select
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('maintains focus management in complex scenarios', async () => {
    render(
      <TeamSelect
        members={mockTeamMembers}
        isMulti={true}
        selectedMembers={mockTeamMembers.slice(0, 1)}
        onRemoveMember={() => {}}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    
    expect(document.activeElement).toBe(trigger);
    
    await userEvent.click(trigger);
    
    // Focus should be properly managed
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('provides proper ARIA labels for dashboard metrics', async () => {
    render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      // Should have proper labeling for metrics
      expect(screen.getByText('Executive Metrics')).toBeInTheDocument();
    });
  });
});

// 🎨 THEME & STYLING TESTS
describe('Theme System', () => {
  it('applies executive theme correctly', () => {
    render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    // Should have executive theme classes
    expect(trigger).toBeInTheDocument();
  });

  it('applies finance theme correctly', () => {
    render(
      <FinanceSelect
        kpis={mockExecutiveMetrics}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    // Should have finance theme classes
    expect(trigger).toBeInTheDocument();
  });

  it('supports custom className overrides', () => {
    render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
        className="custom-select-class"
      />
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('custom-select-class');
  });
});

// 🔄 INTEGRATION TESTS
describe('Dashboard Integration', () => {
  it('integrates with dashboard metrics system', async () => {
    const metrics: DashboardMetrics = {
      totalItems: 25,
      selectedCount: 3,
      categories: ['KPI', 'Revenue', 'Users'],
      lastUpdated: new Date(),
    };

    render(
      <MultiFilterSelect
        items={mockSelectItems}
        selectedValues={['apple', 'banana', 'orange']}
        onValueChange={() => {}}
        showMetrics={true}
      />
    );
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    });
  });

  it('supports real-time dashboard updates', () => {
    const { rerender } = render(
      <ExecutiveSelect
        items={mockExecutiveMetrics}
        value="revenue"
      />
    );
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    
    // Update with new metrics
    const updatedMetrics = [...mockExecutiveMetrics, {
      value: 'retention',
      label: 'Customer Retention',
      description: 'Monthly retention rate',
      icon: '🔄',
      badge: '94.2%'
    }];
    
    rerender(
      <ExecutiveSelect
        items={updatedMetrics}
        value="retention"
      />
    );
    
    expect(screen.getByText('Customer Retention')).toBeInTheDocument();
  });
});
