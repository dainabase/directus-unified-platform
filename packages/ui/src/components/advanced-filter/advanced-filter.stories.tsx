import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AdvancedFilter } from './advanced-filter';
import type { 
  FieldDefinition, 
  FilterGroup, 
  SavedFilter 
} from './advanced-filter';

const meta = {
  title: 'Components/AdvancedFilter',
  component: AdvancedFilter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A powerful advanced filter component with multi-criteria support, logical operators, and save/load functionality.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    fields: {
      description: 'Array of field definitions for filtering',
      control: { type: 'object' }
    },
    value: {
      description: 'Current filter value',
      control: { type: 'object' }
    },
    savedFilters: {
      description: 'Array of saved filter configurations',
      control: { type: 'object' }
    },
    showSavedFilters: {
      description: 'Show saved filters dropdown',
      control: { type: 'boolean' }
    },
    allowNesting: {
      description: 'Allow nested filter groups',
      control: { type: 'boolean' }
    },
    maxNestingDepth: {
      description: 'Maximum nesting depth for filter groups',
      control: { type: 'number', min: 1, max: 5 }
    }
  }
} satisfies Meta<typeof AdvancedFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample field definitions
const sampleFields: FieldDefinition[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter name'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Enter email'
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    min: 0,
    max: 120,
    placeholder: 'Enter age'
  },
  {
    name: 'salary',
    label: 'Salary',
    type: 'number',
    min: 0,
    placeholder: 'Enter salary'
  },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' }
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' }
    ]
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'manager', label: 'Manager' },
      { value: 'developer', label: 'Developer' },
      { value: 'designer', label: 'Designer' },
      { value: 'analyst', label: 'Analyst' }
    ]
  },
  {
    name: 'hireDate',
    label: 'Hire Date',
    type: 'date'
  },
  {
    name: 'lastLogin',
    label: 'Last Login',
    type: 'date'
  },
  {
    name: 'isVerified',
    label: 'Email Verified',
    type: 'boolean'
  },
  {
    name: 'hasAvatar',
    label: 'Has Avatar',
    type: 'boolean'
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'multiselect',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'premium', label: 'Premium' },
      { value: 'beta', label: 'Beta Tester' },
      { value: 'contributor', label: 'Contributor' }
    ]
  }
];

// Sample saved filters
const sampleSavedFilters: SavedFilter[] = [
  {
    id: 'filter-1',
    name: 'Active Engineers',
    description: 'All active employees in engineering department',
    filter: {
      id: 'group-1',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-1',
          field: 'status',
          operator: 'equals',
          value: 'active'
        },
        {
          id: 'cond-2',
          field: 'department',
          operator: 'equals',
          value: 'engineering'
        }
      ]
    },
    createdAt: new Date('2025-01-15'),
    isDefault: true
  },
  {
    id: 'filter-2',
    name: 'High Earners',
    description: 'Employees with salary above 100k',
    filter: {
      id: 'group-2',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-3',
          field: 'salary',
          operator: 'greater_than',
          value: 100000
        }
      ]
    },
    createdAt: new Date('2025-02-01')
  },
  {
    id: 'filter-3',
    name: 'Recent Hires',
    description: 'Employees hired in the last 90 days',
    filter: {
      id: 'group-3',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-4',
          field: 'hireDate',
          operator: 'greater_than',
          value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    createdAt: new Date('2025-02-15')
  },
  {
    id: 'filter-4',
    name: 'Unverified Accounts',
    description: 'Users who haven\'t verified their email',
    filter: {
      id: 'group-4',
      logic: 'OR',
      conditions: [
        {
          id: 'cond-5',
          field: 'isVerified',
          operator: 'equals',
          value: false
        },
        {
          id: 'cond-6',
          field: 'status',
          operator: 'equals',
          value: 'pending'
        }
      ]
    },
    createdAt: new Date('2025-03-01'),
    isShared: true
  }
];

// Basic story
export const Default: Story = {
  args: {
    fields: sampleFields
  }
};

// With existing filter
export const WithExistingFilter: Story = {
  args: {
    fields: sampleFields,
    value: {
      id: 'existing-filter',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-1',
          field: 'status',
          operator: 'equals',
          value: 'active'
        },
        {
          id: 'cond-2',
          field: 'department',
          operator: 'in',
          value: ['engineering', 'sales']
        }
      ]
    }
  }
};

// With saved filters
export const WithSavedFilters: Story = {
  args: {
    fields: sampleFields,
    savedFilters: sampleSavedFilters,
    showSavedFilters: true
  }
};

// Complex filter with multiple conditions
export const ComplexFilter: Story = {
  args: {
    fields: sampleFields,
    value: {
      id: 'complex-filter',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-1',
          field: 'status',
          operator: 'equals',
          value: 'active'
        },
        {
          id: 'cond-2',
          field: 'age',
          operator: 'between',
          value: [25, 45]
        },
        {
          id: 'cond-3',
          field: 'salary',
          operator: 'greater_than',
          value: 75000
        },
        {
          id: 'cond-4',
          field: 'isVerified',
          operator: 'equals',
          value: true
        },
        {
          id: 'cond-5',
          field: 'department',
          operator: 'not_in',
          value: ['hr', 'finance']
        }
      ]
    }
  }
};

// Interactive example with state management
export const Interactive = () => {
  const [filter, setFilter] = useState<FilterGroup>({
    id: 'interactive-filter',
    logic: 'AND',
    conditions: []
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(sampleSavedFilters);
  const [lastAction, setLastAction] = useState<string>('');

  const handleChange = (newFilter: FilterGroup) => {
    setFilter(newFilter);
    setLastAction(`Filter updated: ${newFilter.conditions.length} conditions`);
    console.log('Filter changed:', newFilter);
  };

  const handleSave = (savedFilter: SavedFilter) => {
    setSavedFilters([...savedFilters, savedFilter]);
    setLastAction(`Filter saved: ${savedFilter.name}`);
    console.log('Filter saved:', savedFilter);
  };

  const handleLoad = (filterId: string) => {
    const loaded = savedFilters.find(f => f.id === filterId);
    if (loaded) {
      setFilter(loaded.filter);
      setLastAction(`Filter loaded: ${loaded.name}`);
    }
  };

  const handleExport = (exportFilter: FilterGroup) => {
    const json = JSON.stringify(exportFilter, null, 2);
    console.log('Filter exported:', json);
    setLastAction('Filter exported to console');
    // In real app, you might download as JSON file
  };

  const handleClear = () => {
    setLastAction('All filters cleared');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Interactive Filter Demo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Try adding conditions, saving filters, and see the state updates below.
        </p>
        
        <AdvancedFilter
          fields={sampleFields}
          value={filter}
          savedFilters={savedFilters}
          onChange={handleChange}
          onSave={handleSave}
          onLoad={handleLoad}
          onExport={handleExport}
          onClear={handleClear}
          showSavedFilters={true}
        />
      </div>

      {lastAction && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium">Last Action:</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{lastAction}</p>
        </div>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">Current Filter State:</h4>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(filter, null, 2)}
        </pre>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">Saved Filters ({savedFilters.length}):</h4>
        <div className="space-y-2">
          {savedFilters.map(saved => (
            <div key={saved.id} className="text-sm">
              <span className="font-medium">{saved.name}</span>
              {saved.description && (
                <span className="text-gray-500 ml-2">- {saved.description}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// With nesting enabled
export const WithNesting: Story = {
  args: {
    fields: sampleFields,
    allowNesting: true,
    maxNestingDepth: 3,
    value: {
      id: 'nested-filter',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-1',
          field: 'status',
          operator: 'equals',
          value: 'active'
        }
      ],
      groups: [
        {
          id: 'nested-group-1',
          logic: 'OR',
          conditions: [
            {
              id: 'cond-2',
              field: 'department',
              operator: 'equals',
              value: 'engineering'
            },
            {
              id: 'cond-3',
              field: 'department',
              operator: 'equals',
              value: 'sales'
            }
          ]
        }
      ]
    }
  }
};

// Minimal fields
export const MinimalFields: Story = {
  args: {
    fields: [
      {
        name: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Search...'
      },
      {
        name: 'active',
        label: 'Active Only',
        type: 'boolean'
      }
    ]
  }
};

// Date range filtering
export const DateRangeFiltering: Story = {
  args: {
    fields: [
      {
        name: 'createdDate',
        label: 'Created Date',
        type: 'date'
      },
      {
        name: 'modifiedDate',
        label: 'Modified Date',
        type: 'date'
      },
      {
        name: 'publishDate',
        label: 'Publish Date',
        type: 'date'
      }
    ],
    value: {
      id: 'date-filter',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-1',
          field: 'createdDate',
          operator: 'between',
          value: [
            new Date('2025-01-01'),
            new Date('2025-12-31')
          ]
        }
      ]
    }
  }
};

// Empty state
export const EmptyState: Story = {
  args: {
    fields: sampleFields,
    value: {
      id: 'empty-filter',
      logic: 'AND',
      conditions: []
    }
  }
};

// Dark mode preview
export const DarkMode: Story = {
  args: {
    fields: sampleFields,
    savedFilters: sampleSavedFilters
  },
  parameters: {
    backgrounds: { default: 'dark' }
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    )
  ]
};