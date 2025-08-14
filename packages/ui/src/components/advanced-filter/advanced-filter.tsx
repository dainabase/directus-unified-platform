import React, { useState, useCallback, useMemo } from 'react';
import { X, Plus, Filter, Save, Download, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Select } from '../select';
import { Input } from '../input';
import { Badge } from '../badge';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Label } from '../label';
import { Switch } from '../switch';
import { DatePicker } from '../date-picker';

// Types for filter system
export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with'
  | 'greater_than' 
  | 'less_than' 
  | 'between'
  | 'is_empty' 
  | 'is_not_empty'
  | 'in' 
  | 'not_in';

export type FilterLogic = 'AND' | 'OR';

export type FilterValue = string | number | boolean | Date | null | undefined;

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: FilterValue | FilterValue[];
  label?: string;
}

export interface FilterGroup {
  id: string;
  logic: FilterLogic;
  conditions: FilterCondition[];
  groups?: FilterGroup[];
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filter: FilterGroup;
  createdAt: Date;
  updatedAt?: Date;
  isDefault?: boolean;
  isShared?: boolean;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  options?: Array<{ value: string; label: string }>;
  operators?: FilterOperator[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface AdvancedFilterProps {
  fields: FieldDefinition[];
  value?: FilterGroup;
  savedFilters?: SavedFilter[];
  onChange?: (filter: FilterGroup) => void;
  onSave?: (filter: SavedFilter) => void;
  onLoad?: (filterId: string) => void;
  onExport?: (filter: FilterGroup) => void;
  onClear?: () => void;
  showSavedFilters?: boolean;
  allowNesting?: boolean;
  maxNestingDepth?: number;
  className?: string;
}

// Default operators for different field types
const DEFAULT_OPERATORS: Record<string, FilterOperator[]> = {
  text: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'],
  date: ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'],
  boolean: ['equals', 'not_equals'],
  select: ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'],
  multiselect: ['contains', 'not_contains', 'is_empty', 'is_not_empty']
};

// Operator labels
const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  not_equals: 'Not equals',
  contains: 'Contains',
  not_contains: 'Does not contain',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
  greater_than: 'Greater than',
  less_than: 'Less than',
  between: 'Between',
  is_empty: 'Is empty',
  is_not_empty: 'Is not empty',
  in: 'In',
  not_in: 'Not in'
};

/**
 * Advanced Filter Component
 * 
 * A powerful filtering system with multi-criteria support, logical operators,
 * and the ability to save/load filter configurations.
 */
export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  fields,
  value,
  savedFilters = [],
  onChange,
  onSave,
  onLoad,
  onExport,
  onClear,
  showSavedFilters = true,
  allowNesting = false,
  maxNestingDepth = 3,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterGroup>(
    value || {
      id: generateId(),
      logic: 'AND',
      conditions: []
    }
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  // Generate unique ID
  function generateId(): string {
    return `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add new condition
  const addCondition = useCallback((groupId?: string) => {
    const newCondition: FilterCondition = {
      id: generateId(),
      field: fields[0]?.name || '',
      operator: 'equals',
      value: null
    };

    setFilter(prev => {
      const updated = { ...prev };
      if (groupId) {
        // Add to specific group (for nested filters)
        const addToGroup = (group: FilterGroup): FilterGroup => {
          if (group.id === groupId) {
            return {
              ...group,
              conditions: [...group.conditions, newCondition]
            };
          }
          if (group.groups) {
            return {
              ...group,
              groups: group.groups.map(addToGroup)
            };
          }
          return group;
        };
        return addToGroup(updated);
      } else {
        // Add to root
        return {
          ...updated,
          conditions: [...updated.conditions, newCondition]
        };
      }
    });
  }, [fields]);

  // Remove condition
  const removeCondition = useCallback((conditionId: string) => {
    setFilter(prev => {
      const removeFromGroup = (group: FilterGroup): FilterGroup => {
        return {
          ...group,
          conditions: group.conditions.filter(c => c.id !== conditionId),
          groups: group.groups?.map(removeFromGroup)
        };
      };
      return removeFromGroup(prev);
    });
  }, []);

  // Update condition
  const updateCondition = useCallback((
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => {
    setFilter(prev => {
      const updateInGroup = (group: FilterGroup): FilterGroup => {
        return {
          ...group,
          conditions: group.conditions.map(c =>
            c.id === conditionId ? { ...c, ...updates } : c
          ),
          groups: group.groups?.map(updateInGroup)
        };
      };
      return updateInGroup(prev);
    });
  }, []);

  // Toggle logic operator
  const toggleLogic = useCallback((groupId?: string) => {
    setFilter(prev => {
      if (!groupId) {
        return {
          ...prev,
          logic: prev.logic === 'AND' ? 'OR' : 'AND'
        };
      }
      const toggleInGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            logic: group.logic === 'AND' ? 'OR' : 'AND'
          };
        }
        if (group.groups) {
          return {
            ...group,
            groups: group.groups.map(toggleInGroup)
          };
        }
        return group;
      };
      return toggleInGroup(prev);
    });
  }, []);

  // Apply filter
  const applyFilter = useCallback(() => {
    onChange?.(filter);
    setIsOpen(false);
  }, [filter, onChange]);

  // Clear filter
  const clearFilter = useCallback(() => {
    const emptyFilter: FilterGroup = {
      id: generateId(),
      logic: 'AND',
      conditions: []
    };
    setFilter(emptyFilter);
    onChange?.(emptyFilter);
    onClear?.();
  }, [onChange, onClear]);

  // Save filter
  const saveFilter = useCallback(() => {
    if (!filterName) return;
    
    const savedFilter: SavedFilter = {
      id: generateId(),
      name: filterName,
      description: filterDescription,
      filter: filter,
      createdAt: new Date()
    };
    
    onSave?.(savedFilter);
    setSaveDialogOpen(false);
    setFilterName('');
    setFilterDescription('');
  }, [filter, filterName, filterDescription, onSave]);

  // Load saved filter
  const loadFilter = useCallback((filterId: string) => {
    const saved = savedFilters.find(f => f.id === filterId);
    if (saved) {
      setFilter(saved.filter);
      onLoad?.(filterId);
    }
  }, [savedFilters, onLoad]);

  // Export filter
  const exportFilter = useCallback(() => {
    onExport?.(filter);
  }, [filter, onExport]);

  // Count active conditions
  const activeConditionsCount = useMemo(() => {
    const countConditions = (group: FilterGroup): number => {
      let count = group.conditions.filter(c => c.value !== null && c.value !== undefined).length;
      if (group.groups) {
        count += group.groups.reduce((acc, g) => acc + countConditions(g), 0);
      }
      return count;
    };
    return countConditions(filter);
  }, [filter]);

  // Render value input based on field type and operator
  const renderValueInput = (condition: FilterCondition, field: FieldDefinition) => {
    // Skip value input for empty/not empty operators
    if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
      return null;
    }

    // Between operator needs two values
    if (condition.operator === 'between') {
      const values = (condition.value as FilterValue[]) || [null, null];
      return (
        <div className="flex gap-2">
          {field.type === 'date' ? (
            <>
              <DatePicker
                value={values[0] as Date}
                onChange={(date) => {
                  updateCondition(condition.id, {
                    value: [date, values[1]]
                  });
                }}
              />
              <span className="self-center">to</span>
              <DatePicker
                value={values[1] as Date}
                onChange={(date) => {
                  updateCondition(condition.id, {
                    value: [values[0], date]
                  });
                }}
              />
            </>
          ) : (
            <>
              <Input
                type={field.type === 'number' ? 'number' : 'text'}
                value={values[0] as string}
                onChange={(e) => {
                  updateCondition(condition.id, {
                    value: [e.target.value, values[1]]
                  });
                }}
                placeholder="From"
                min={field.min}
                max={field.max}
              />
              <span className="self-center">to</span>
              <Input
                type={field.type === 'number' ? 'number' : 'text'}
                value={values[1] as string}
                onChange={(e) => {
                  updateCondition(condition.id, {
                    value: [values[0], e.target.value]
                  });
                }}
                placeholder="To"
                min={field.min}
                max={field.max}
              />
            </>
          )}
        </div>
      );
    }

    // Regular inputs based on field type
    switch (field.type) {
      case 'boolean':
        return (
          <Switch
            checked={condition.value as boolean}
            onCheckedChange={(checked) => {
              updateCondition(condition.id, { value: checked });
            }}
          />
        );
      
      case 'date':
        return (
          <DatePicker
            value={condition.value as Date}
            onChange={(date) => {
              updateCondition(condition.id, { value: date });
            }}
          />
        );
      
      case 'select':
        if (condition.operator === 'in' || condition.operator === 'not_in') {
          // Multi-select for in/not_in operators
          return (
            <Select
              multiple
              value={condition.value as string[]}
              onValueChange={(value) => {
                updateCondition(condition.id, { value });
              }}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          );
        }
        return (
          <Select
            value={condition.value as string}
            onValueChange={(value) => {
              updateCondition(condition.id, { value });
            }}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={condition.value as number}
            onChange={(e) => {
              updateCondition(condition.id, {
                value: e.target.value ? Number(e.target.value) : null
              });
            }}
            placeholder={field.placeholder || 'Enter value'}
            min={field.min}
            max={field.max}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={condition.value as string}
            onChange={(e) => {
              updateCondition(condition.id, { value: e.target.value });
            }}
            placeholder={field.placeholder || 'Enter value'}
          />
        );
    }
  };

  // Render single condition
  const renderCondition = (condition: FilterCondition) => {
    const field = fields.find(f => f.name === condition.field);
    if (!field) return null;

    const operators = field.operators || DEFAULT_OPERATORS[field.type] || [];

    return (
      <div key={condition.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Field selector */}
        <Select
          value={condition.field}
          onValueChange={(value) => {
            const newField = fields.find(f => f.name === value);
            if (newField) {
              const newOperators = newField.operators || DEFAULT_OPERATORS[newField.type] || [];
              updateCondition(condition.id, {
                field: value,
                operator: newOperators.includes(condition.operator) ? condition.operator : newOperators[0],
                value: null
              });
            }
          }}
          className="w-40"
        >
          {fields.map(f => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </Select>

        {/* Operator selector */}
        <Select
          value={condition.operator}
          onValueChange={(value) => {
            updateCondition(condition.id, { operator: value as FilterOperator });
          }}
          className="w-40"
        >
          {operators.map(op => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </Select>

        {/* Value input */}
        <div className="flex-1">
          {renderValueInput(condition, field)}
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCondition(condition.id)}
          className="p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Render filter group
  const renderFilterGroup = (group: FilterGroup, depth = 0) => {
    if (depth > maxNestingDepth) return null;

    return (
      <div className={cn(
        "space-y-2",
        depth > 0 && "ml-8 p-2 border-l-2 border-gray-300 dark:border-gray-600"
      )}>
        {/* Logic toggle and group controls */}
        {group.conditions.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLogic(depth === 0 ? undefined : group.id)}
              className="font-semibold"
            >
              {group.logic}
            </Button>
            <span className="text-sm text-gray-500">
              {group.conditions.length} conditions
            </span>
          </div>
        )}

        {/* Conditions */}
        {group.conditions.map((condition, index) => (
          <React.Fragment key={condition.id}>
            {index > 0 && group.conditions.length > 1 && (
              <div className="flex items-center gap-2 pl-4">
                <span className="text-xs font-medium text-gray-500">
                  {group.logic}
                </span>
              </div>
            )}
            {renderCondition(condition)}
          </React.Fragment>
        ))}

        {/* Nested groups */}
        {allowNesting && group.groups?.map(nestedGroup => (
          <div key={nestedGroup.id}>
            {renderFilterGroup(nestedGroup, depth + 1)}
          </div>
        ))}

        {/* Add condition button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => addCondition(depth === 0 ? undefined : group.id)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={activeConditionsCount > 0 ? "default" : "outline"}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeConditionsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeConditionsCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[600px] p-4" align="start">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <div className="flex gap-2">
                {showSavedFilters && savedFilters.length > 0 && (
                  <Select
                    value=""
                    onValueChange={loadFilter}
                    placeholder="Load saved filter"
                  >
                    <option value="" disabled>
                      Load saved filter
                    </option>
                    {savedFilters.map(saved => (
                      <option key={saved.id} value={saved.id}>
                        {saved.name}
                      </option>
                    ))}
                  </Select>
                )}
                {onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportFilter}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter conditions */}
            <div className="max-h-[400px] overflow-y-auto">
              {filter.conditions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No filters applied</p>
                  <p className="text-sm mt-1">Click "Add Condition" to get started</p>
                </div>
              ) : (
                renderFilterGroup(filter)
              )}
            </div>

            {/* Footer actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={clearFilter}
                disabled={filter.conditions.length === 0}
              >
                Clear All
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={applyFilter}
                  disabled={activeConditionsCount === 0}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Save filter dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-name">Name</Label>
                <Input
                  id="filter-name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Enter filter name"
                />
              </div>
              <div>
                <Label htmlFor="filter-description">Description (optional)</Label>
                <Input
                  id="filter-description"
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveFilter}
                disabled={!filterName}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdvancedFilter.displayName = 'AdvancedFilter';

export default AdvancedFilter;