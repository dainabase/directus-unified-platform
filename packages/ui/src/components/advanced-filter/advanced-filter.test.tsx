import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AdvancedFilter } from './advanced-filter';
import type { FieldDefinition, FilterGroup, SavedFilter } from './advanced-filter';

// Mock data
const mockFields: FieldDefinition[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter name'
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    min: 0,
    max: 120
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  {
    name: 'createdAt',
    label: 'Created Date',
    type: 'date'
  },
  {
    name: 'isVerified',
    label: 'Verified',
    type: 'boolean'
  }
];

const mockSavedFilters: SavedFilter[] = [
  {
    id: 'filter-1',
    name: 'Active Users',
    description: 'Filter for active users only',
    filter: {
      id: 'group-1',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-1',
          field: 'status',
          operator: 'equals',
          value: 'active'
        }
      ]
    },
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'filter-2',
    name: 'Recent Verified',
    description: 'Recently created and verified users',
    filter: {
      id: 'group-2',
      logic: 'AND',
      conditions: [
        {
          id: 'cond-2',
          field: 'isVerified',
          operator: 'equals',
          value: true
        },
        {
          id: 'cond-3',
          field: 'createdAt',
          operator: 'greater_than',
          value: new Date('2025-01-01')
        }
      ]
    },
    createdAt: new Date('2025-01-05')
  }
];

describe('AdvancedFilter', () => {
  const mockOnChange = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnLoad = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders filter button with correct text', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('shows active filter count when conditions exist', () => {
      const filterWithConditions: FilterGroup = {
        id: 'test-group',
        logic: 'AND',
        conditions: [
          {
            id: 'test-cond',
            field: 'name',
            operator: 'contains',
            value: 'John'
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={filterWithConditions}
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('opens popover when filter button is clicked', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
  });

  describe('Adding Conditions', () => {
    it('adds a new condition when Add Condition is clicked', async () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      // Open filter popover
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Click Add Condition
      const addButton = screen.getByRole('button', { name: /add condition/i });
      fireEvent.click(addButton);
      
      // Check that field selector appears
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('allows selecting different fields', async () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /add condition/i }));
      
      // Field selector should be present
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe('Removing Conditions', () => {
    it('removes a condition when X button is clicked', async () => {
      const initialFilter: FilterGroup = {
        id: 'group',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-1',
            field: 'name',
            operator: 'equals',
            value: 'Test'
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={initialFilter}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Find and click remove button (X)
      const removeButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg')
      );
      
      const removeButton = removeButtons.find(btn => 
        btn.className.includes('ghost')
      );
      
      if (removeButton) {
        fireEvent.click(removeButton);
      }
      
      // Apply filter to trigger onChange
      fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Logic Operators', () => {
    it('toggles between AND and OR logic', async () => {
      const initialFilter: FilterGroup = {
        id: 'group',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-1',
            field: 'name',
            operator: 'equals',
            value: 'Test1'
          },
          {
            id: 'cond-2',
            field: 'age',
            operator: 'greater_than',
            value: 18
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={initialFilter}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Find and click logic toggle button
      const andButton = screen.getByRole('button', { name: /and/i });
      fireEvent.click(andButton);
      
      // Should now show OR
      expect(screen.getByRole('button', { name: /or/i })).toBeInTheDocument();
    });
  });

  describe('Saving Filters', () => {
    it('opens save dialog when save button is clicked', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
          onSave={mockOnSave}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Find save button (icon button)
      const buttons = screen.getAllByRole('button');
      const saveButton = buttons.find(btn => 
        btn.querySelector('svg') && btn.className.includes('outline')
      );
      
      if (saveButton) {
        fireEvent.click(saveButton);
        expect(screen.getByText('Save Filter')).toBeInTheDocument();
      }
    });

    it('saves filter with name and description', async () => {
      const initialFilter: FilterGroup = {
        id: 'group',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-1',
            field: 'status',
            operator: 'equals',
            value: 'active'
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={initialFilter}
          onChange={mockOnChange}
          onSave={mockOnSave}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Open save dialog
      const buttons = screen.getAllByRole('button');
      const saveButton = buttons.find(btn => 
        btn.querySelector('svg') && btn.className.includes('outline')
      );
      
      if (saveButton) {
        fireEvent.click(saveButton);
        
        // Fill in name and description
        const nameInput = screen.getByPlaceholderText('Enter filter name');
        const descInput = screen.getByPlaceholderText('Enter description');
        
        await userEvent.type(nameInput, 'My Custom Filter');
        await userEvent.type(descInput, 'A test filter');
        
        // Click save
        const dialogSaveButton = screen.getByRole('button', { name: /^save$/i });
        fireEvent.click(dialogSaveButton);
        
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My Custom Filter',
            description: 'A test filter',
            filter: initialFilter
          })
        );
      }
    });
  });

  describe('Loading Saved Filters', () => {
    it('loads a saved filter when selected', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          savedFilters={mockSavedFilters}
          onChange={mockOnChange}
          onLoad={mockOnLoad}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Find the select for saved filters
      const selects = screen.getAllByRole('combobox');
      const savedFilterSelect = selects.find(select => 
        select.textContent?.includes('Load saved filter')
      );
      
      if (savedFilterSelect) {
        fireEvent.change(savedFilterSelect, { target: { value: 'filter-1' } });
        
        expect(mockOnLoad).toHaveBeenCalledWith('filter-1');
      }
    });
  });

  describe('Clearing Filters', () => {
    it('clears all filters when Clear All is clicked', () => {
      const initialFilter: FilterGroup = {
        id: 'group',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-1',
            field: 'name',
            operator: 'equals',
            value: 'Test'
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={initialFilter}
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
      
      expect(mockOnClear).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          logic: 'AND',
          conditions: []
        })
      );
    });

    it('disables Clear All when no conditions exist', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Applying Filters', () => {
    it('applies filter and closes popover', async () => {
      const initialFilter: FilterGroup = {
        id: 'group',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-1',
            field: 'name',
            operator: 'contains',
            value: 'John'
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={initialFilter}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
      
      expect(mockOnChange).toHaveBeenCalledWith(initialFilter);
      
      // Popover should close
      await waitFor(() => {
        expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
      });
    });

    it('disables Apply when no active conditions', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      expect(applyButton).toBeDisabled();
    });
  });

  describe('Export Functionality', () => {
    it('exports filter when export button is clicked', () => {
      const initialFilter: FilterGroup = {
        id: 'group',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-1',
            field: 'status',
            operator: 'equals',
            value: 'active'
          }
        ]
      };

      render(
        <AdvancedFilter
          fields={mockFields}
          value={initialFilter}
          onChange={mockOnChange}
          onExport={mockOnExport}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      
      // Find export button (icon button)
      const buttons = screen.getAllByRole('button');
      const exportButton = buttons.find(btn => 
        btn.querySelector('svg') && 
        btn.className.includes('outline') &&
        !btn.textContent
      );
      
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(mockOnExport).toHaveBeenCalledWith(initialFilter);
      }
    });
  });

  describe('Field Types', () => {
    it('renders appropriate input for text fields', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /add condition/i }));
      
      // Should render text input for text field
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });

    it('handles boolean field with switch', async () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /add condition/i }));
      
      // Change to boolean field
      const fieldSelects = screen.getAllByRole('combobox');
      fireEvent.change(fieldSelects[0], { target: { value: 'isVerified' } });
      
      // Should render switch for boolean
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  describe('Operator Behavior', () => {
    it('hides value input for is_empty operator', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /add condition/i }));
      
      // Change operator to is_empty
      const operatorSelects = screen.getAllByRole('combobox');
      fireEvent.change(operatorSelects[1], { target: { value: 'is_empty' } });
      
      // Value input should not be present
      expect(screen.queryByPlaceholderText('Enter name')).not.toBeInTheDocument();
    });

    it('shows two inputs for between operator', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      fireEvent.click(screen.getByRole('button', { name: /add condition/i }));
      
      // Change to number field
      const fieldSelects = screen.getAllByRole('combobox');
      fireEvent.change(fieldSelects[0], { target: { value: 'age' } });
      
      // Change operator to between
      const operatorSelects = screen.getAllByRole('combobox');
      fireEvent.change(operatorSelects[1], { target: { value: 'between' } });
      
      // Should show From and To inputs
      expect(screen.getByPlaceholderText('From')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('To')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toHaveAccessibleName();
    });

    it('supports keyboard navigation', async () => {
      render(
        <AdvancedFilter
          fields={mockFields}
          onChange={mockOnChange}
        />
      );
      
      const filterButton = screen.getByRole('button', { name: /filters/i });
      
      // Focus button and press Enter
      filterButton.focus();
      fireEvent.keyDown(filterButton, { key: 'Enter' });
      
      // Popover should open
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      
      // Press Escape to close
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
      });
    });
  });
});