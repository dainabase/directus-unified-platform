/**
 * TreeView Component Tests
 * Comprehensive test suite for advanced tree-view component
 * Tests all features: expansion, selection, drag&drop, checkboxes, accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeView, TreeNode } from './tree-view';
import { vi } from 'vitest';

// Mock data for testing
const mockTreeData: TreeNode[] = [
  {
    id: 'root1',
    label: 'Root Node 1',
    children: [
      {
        id: 'child1-1',
        label: 'Child 1.1',
        children: [
          { id: 'grandchild1-1-1', label: 'Grandchild 1.1.1' },
          { id: 'grandchild1-1-2', label: 'Grandchild 1.1.2' }
        ]
      },
      { id: 'child1-2', label: 'Child 1.2' }
    ]
  },
  {
    id: 'root2',
    label: 'Root Node 2',
    disabled: true,
    children: [
      { id: 'child2-1', label: 'Child 2.1' }
    ]
  },
  {
    id: 'root3',
    label: 'Root Node 3',
    selectable: false
  }
];

describe('TreeView Component', () => {
  describe('Basic Rendering', () => {
    it('renders tree structure correctly', () => {
      render(<TreeView data={mockTreeData} />);
      
      expect(screen.getByText('Root Node 1')).toBeInTheDocument();
      expect(screen.getByText('Root Node 2')).toBeInTheDocument();
      expect(screen.getByText('Root Node 3')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <TreeView data={mockTreeData} className="custom-tree" />
      );
      expect(container.firstChild).toHaveClass('custom-tree');
    });

    it('renders with empty data', () => {
      const { container } = render(<TreeView data={[]} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('Node Expansion', () => {
    it('expands and collapses nodes on toggle', async () => {
      const user = userEvent.setup();
      render(<TreeView data={mockTreeData} />);

      // Initially children should be hidden
      expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
      
      // Click expand button
      const expandButton = screen.getAllByRole('button')[0];
      await user.click(expandButton);
      
      // Children should now be visible
      expect(screen.getByText('Child 1.1')).toBeInTheDocument();
      expect(screen.getByText('Child 1.2')).toBeInTheDocument();

      // Click to collapse
      await user.click(expandButton);
      
      // Children should be hidden again
      expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
    });

    it('calls onNodeExpand callback', async () => {
      const user = userEvent.setup();
      const onNodeExpand = vi.fn();
      render(<TreeView data={mockTreeData} onNodeExpand={onNodeExpand} />);

      const expandButton = screen.getAllByRole('button')[0];
      await user.click(expandButton);

      expect(onNodeExpand).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root1' }),
        true
      );
    });

    it('handles controlled expansion with expandedKeys', () => {
      render(<TreeView data={mockTreeData} expandedKeys={['root1']} />);
      
      expect(screen.getByText('Child 1.1')).toBeInTheDocument();
    });

    it('uses defaultExpandedKeys for initial state', () => {
      render(<TreeView data={mockTreeData} defaultExpandedKeys={['root1']} />);
      
      expect(screen.getByText('Child 1.1')).toBeInTheDocument();
    });
  });

  describe('Node Selection', () => {
    it('selects node on click', async () => {
      const user = userEvent.setup();
      const onNodeSelect = vi.fn();
      render(<TreeView data={mockTreeData} onNodeSelect={onNodeSelect} />);

      await user.click(screen.getByText('Root Node 1'));

      expect(onNodeSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root1' })
      );
    });

    it('supports single selection mode', async () => {
      const user = userEvent.setup();
      render(<TreeView data={mockTreeData} selectedKeys={['root1']} />);

      const node1 = screen.getByText('Root Node 1').closest('div');
      const node3 = screen.getByText('Root Node 3').closest('div');

      expect(node1).toHaveClass('bg-muted');
      expect(node3).not.toHaveClass('bg-muted');
    });

    it('supports multi-selection mode', async () => {
      const user = userEvent.setup();
      render(
        <TreeView 
          data={mockTreeData} 
          multiSelect 
          selectedKeys={['root1', 'root3']} 
        />
      );

      const node1 = screen.getByText('Root Node 1').closest('div');
      const node3 = screen.getByText('Root Node 3').closest('div');

      expect(node1).toHaveClass('bg-muted');
      expect(node3).toHaveClass('bg-muted');
    });

    it('respects selectable property', async () => {
      const user = userEvent.setup();
      const onNodeSelect = vi.fn();
      render(<TreeView data={mockTreeData} onNodeSelect={onNodeSelect} />);

      // Root Node 3 has selectable: false
      await user.click(screen.getByText('Root Node 3'));

      expect(onNodeSelect).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root3' })
      );
    });

    it('respects disabled property', async () => {
      const user = userEvent.setup();
      const onNodeSelect = vi.fn();
      render(<TreeView data={mockTreeData} onNodeSelect={onNodeSelect} />);

      const disabledNode = screen.getByText('Root Node 2').closest('div');
      expect(disabledNode).toHaveClass('opacity-50');

      await user.click(screen.getByText('Root Node 2'));
      expect(onNodeSelect).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root2' })
      );
    });
  });

  describe('Checkbox Functionality', () => {
    it('renders checkboxes when checkable=true', () => {
      render(<TreeView data={mockTreeData} checkable />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // Only root nodes visible initially
    });

    it('handles checkbox changes', async () => {
      const user = userEvent.setup();
      const onCheck = vi.fn();
      render(<TreeView data={mockTreeData} checkable onCheck={onCheck} />);

      const checkbox = screen.getAllByRole('checkbox')[0];
      await user.click(checkbox);

      expect(onCheck).toHaveBeenCalledWith(['root1'], expect.any(Object));
    });

    it('controls checked state with checkedKeys prop', () => {
      render(<TreeView data={mockTreeData} checkable checkedKeys={['root1']} />);
      
      const checkbox = screen.getAllByRole('checkbox')[0];
      expect(checkbox).toBeChecked();
    });
  });

  describe('Icons and Custom Rendering', () => {
    it('shows default icons when showIcon=true', () => {
      render(<TreeView data={mockTreeData} showIcon />);
      
      // Should render folder icons for nodes with children
      const icons = document.querySelectorAll('.lucide-folder');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('hides icons when showIcon=false', () => {
      render(<TreeView data={mockTreeData} showIcon={false} />);
      
      const icons = document.querySelectorAll('.lucide-folder, .lucide-file');
      expect(icons).toHaveLength(0);
    });

    it('uses custom node icons', () => {
      const dataWithIcons: TreeNode[] = [{
        id: 'custom',
        label: 'Custom Icon Node',
        icon: <span data-testid="custom-icon">★</span>
      }];

      render(<TreeView data={dataWithIcons} showIcon />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('uses custom renderNode function', () => {
      const renderNode = (node: TreeNode) => (
        <div data-testid="custom-render">{node.label.toUpperCase()}</div>
      );

      render(<TreeView data={mockTreeData} renderNode={renderNode} />);
      
      expect(screen.getByTestId('custom-render')).toHaveTextContent('ROOT NODE 1');
    });
  });

  describe('Expand on Click', () => {
    it('expands node when expandOnClick=true and node has children', async () => {
      const user = userEvent.setup();
      render(<TreeView data={mockTreeData} expandOnClick />);

      expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
      
      await user.click(screen.getByText('Root Node 1'));
      
      expect(screen.getByText('Child 1.1')).toBeInTheDocument();
    });

    it('selects leaf nodes when expandOnClick=true', async () => {
      const user = userEvent.setup();
      const onNodeSelect = vi.fn();
      render(<TreeView data={mockTreeData} expandOnClick onNodeSelect={onNodeSelect} />);

      await user.click(screen.getByText('Root Node 3')); // Leaf node
      
      expect(onNodeSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root3' })
      );
    });
  });

  describe('Drag and Drop', () => {
    it('makes nodes draggable when draggable=true', () => {
      render(<TreeView data={mockTreeData} draggable />);
      
      const nodeElements = screen.getAllByText(/Root Node/);
      nodeElements.forEach(element => {
        const draggableElement = element.closest('[draggable="true"]');
        expect(draggableElement).toBeInTheDocument();
      });
    });

    it('calls drag event handlers', () => {
      const onDragStart = vi.fn();
      const onDragEnd = vi.fn();
      
      render(
        <TreeView 
          data={mockTreeData} 
          draggable 
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      );

      const draggableElement = screen.getByText('Root Node 1').closest('[draggable="true"]');
      
      fireEvent.dragStart(draggableElement!);
      expect(onDragStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'root1' }));
      
      fireEvent.dragEnd(draggableElement!);
      expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ id: 'root1' }));
    });

    it('handles drop operations', () => {
      const onDrop = vi.fn();
      
      render(<TreeView data={mockTreeData} draggable onDrop={onDrop} />);

      const source = screen.getByText('Root Node 1').closest('[draggable="true"]');
      const target = screen.getByText('Root Node 3').closest('div');

      // Simulate drag and drop
      fireEvent.dragStart(source!);
      fireEvent.dragOver(target!);
      fireEvent.drop(target!);

      expect(onDrop).toHaveBeenCalled();
    });
  });

  describe('Line Indicators', () => {
    it('shows connection lines when showLine=true', () => {
      render(
        <TreeView 
          data={mockTreeData} 
          showLine 
          defaultExpandedKeys={['root1']} 
        />
      );
      
      // Check for line styling elements
      const lineElements = document.querySelectorAll('.border-l');
      expect(lineElements.length).toBeGreaterThan(0);
    });

    it('hides lines when showLine=false', () => {
      render(
        <TreeView 
          data={mockTreeData} 
          showLine={false}
          defaultExpandedKeys={['root1']} 
        />
      );
      
      const lineElements = document.querySelectorAll('.border-l');
      expect(lineElements).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TreeView data={mockTreeData} />);

      const firstNode = screen.getByText('Root Node 1');
      firstNode.focus();

      // Test that element can receive focus
      expect(firstNode).toHaveFocus();
    });

    it('has proper ARIA attributes for checkboxes', () => {
      render(<TreeView data={mockTreeData} checkable />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('stops event propagation for interactive elements', async () => {
      const user = userEvent.setup();
      const onNodeSelect = vi.fn();
      
      render(<TreeView data={mockTreeData} onNodeSelect={onNodeSelect} />);

      // Click expand button should not trigger node selection
      const expandButton = screen.getAllByRole('button')[0];
      await user.click(expandButton);

      expect(onNodeSelect).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles undefined children gracefully', () => {
      const dataWithUndefinedChildren: TreeNode[] = [{
        id: 'node1',
        label: 'Node with undefined children',
        children: undefined
      }];

      expect(() => {
        render(<TreeView data={dataWithUndefinedChildren} />);
      }).not.toThrow();
    });

    it('handles empty node array', () => {
      expect(() => {
        render(<TreeView data={[]} />);
      }).not.toThrow();
    });

    it('handles nodes without required properties', () => {
      const minimalData = [{ id: 'test', label: 'Test Node' }];
      
      expect(() => {
        render(<TreeView data={minimalData} />);
      }).not.toThrow();
    });
  });
});
