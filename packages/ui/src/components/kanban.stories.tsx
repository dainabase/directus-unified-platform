import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Kanban, KanbanColumn, KanbanCard, KanbanSwimlane } from './kanban';
import { Button } from './button';
import { Input } from './input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const meta = {
  title: 'Sprint-3/Kanban',
  component: Kanban,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A powerful Kanban board component with drag & drop, swimlanes, WIP limits, and customizable cards.',
      },
    },
  },
  tags: ['sprint-3', 'data-display', 'interactive'],
  argTypes: {
    enableSwimlanes: {
      control: 'boolean',
      description: 'Enable swimlane support',
    },
    enableColumnCollapse: {
      control: 'boolean',
      description: 'Allow columns to be collapsed',
    },
    enableWipLimits: {
      control: 'boolean',
      description: 'Enable Work In Progress limits',
    },
    enableSearch: {
      control: 'boolean',
      description: 'Show search bar',
    },
    enableFilters: {
      control: 'boolean',
      description: 'Show filter options',
    },
    autoScroll: {
      control: 'boolean',
      description: 'Auto-scroll during drag operations',
    },
    compactMode: {
      control: 'boolean',
      description: 'Use compact card layout',
    },
  },
} satisfies Meta<typeof Kanban>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data generator
const generateSampleCards = (count: number, columnId: string): KanbanCard[] => {
  const priorities = ['low', 'medium', 'high', 'critical'] as const;
  const statuses = ['todo', 'in-progress', 'review', 'done', 'blocked'] as const;
  const tags = [
    { id: '1', label: 'Frontend', color: '#3B82F6' },
    { id: '2', label: 'Backend', color: '#10B981' },
    { id: '3', label: 'Design', color: '#8B5CF6' },
    { id: '4', label: 'Bug', color: '#EF4444' },
    { id: '5', label: 'Feature', color: '#F59E0B' },
    { id: '6', label: 'Documentation', color: '#6B7280' },
  ];
  
  const assignees = [
    { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    { id: '3', name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { id: '4', name: 'Alice Brown', avatar: 'https://i.pravatar.cc/150?u=alice' },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${columnId}-card-${i + 1}`,
    title: `Task ${i + 1} in ${columnId}`,
    description: i % 2 === 0 ? `Description for task ${i + 1}. This is a sample task that needs to be completed.` : undefined,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    assignee: i % 3 !== 0 ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
    tags: i % 2 === 0 ? tags.slice(0, Math.floor(Math.random() * 4) + 1) : undefined,
    dueDate: i % 4 === 0 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    attachments: Math.floor(Math.random() * 5),
    comments: Math.floor(Math.random() * 10),
    progress: i % 3 === 0 ? Math.floor(Math.random() * 100) : undefined,
  }));
};

// Sample columns
const sampleColumns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: generateSampleCards(5, 'backlog'),
    color: '#6B7280',
    wipLimit: 10,
  },
  {
    id: 'todo',
    title: 'To Do',
    cards: generateSampleCards(4, 'todo'),
    color: '#3B82F6',
    wipLimit: 5,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: generateSampleCards(3, 'in-progress'),
    color: '#F59E0B',
    wipLimit: 3,
  },
  {
    id: 'review',
    title: 'Review',
    cards: generateSampleCards(2, 'review'),
    color: '#8B5CF6',
    wipLimit: 3,
  },
  {
    id: 'done',
    title: 'Done',
    cards: generateSampleCards(6, 'done'),
    color: '#10B981',
  },
];

// Sample swimlanes
const sampleSwimlanes: KanbanSwimlane[] = [
  { id: 'team-a', title: 'Team A' },
  { id: 'team-b', title: 'Team B' },
  { id: 'team-c', title: 'Team C' },
];

// Basic Kanban Board
export const Default: Story = {
  render: () => {
    const [columns, setColumns] = useState(sampleColumns);

    const handleCardMove = (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => {
      console.log('Card moved:', { cardId, fromColumnId, toColumnId, newIndex });
      
      setColumns(prev => {
        const fromColumn = prev.find(col => col.id === fromColumnId);
        const toColumn = prev.find(col => col.id === toColumnId);
        
        if (!fromColumn || !toColumn) return prev;
        
        const card = fromColumn.cards.find(c => c.id === cardId);
        if (!card) return prev;
        
        return prev.map(col => {
          if (col.id === fromColumnId) {
            return {
              ...col,
              cards: col.cards.filter(c => c.id !== cardId)
            };
          }
          if (col.id === toColumnId) {
            const newCards = [...col.cards];
            newCards.splice(newIndex, 0, card);
            return {
              ...col,
              cards: newCards
            };
          }
          return col;
        });
      });
    };

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Kanban
          columns={columns}
          onCardMove={handleCardMove}
          onCardEdit={(card) => console.log('Edit card:', card)}
          onCardDelete={(cardId) => console.log('Delete card:', cardId)}
          enableSearch
          enableFilters
          enableWipLimits
          enableColumnCollapse
          autoScroll
        />
      </div>
    );
  },
};

// With WIP Limits
export const WithWipLimits: Story = {
  render: () => {
    const [columns, setColumns] = useState(() => {
      const cols = [...sampleColumns];
      // Overload the In Progress column
      cols[2].cards = generateSampleCards(5, 'in-progress'); // Over the limit of 3
      return cols;
    });

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ WIP Limits enabled. "In Progress" column is over capacity (5/3 cards).
          </p>
        </div>
        <Kanban
          columns={columns}
          enableWipLimits
          enableColumnCollapse
          onCardMove={(cardId, from, to, index) => {
            console.log('Card move:', { cardId, from, to, index });
          }}
        />
      </div>
    );
  },
};

// Interactive Card Management
export const InteractiveManagement: Story = {
  render: () => {
    const [columns, setColumns] = useState(sampleColumns);
    const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
    const [addingCard, setAddingCard] = useState<string | null>(null);

    const handleAddCard = (columnId: string, card: Partial<KanbanCard>) => {
      const newCard: KanbanCard = {
        id: `card-${Date.now()}`,
        title: card.title || 'New Task',
        description: card.description,
        priority: card.priority || 'medium',
        status: card.status || 'todo',
        ...card
      };

      setColumns(prev => prev.map(col => 
        col.id === columnId 
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      ));
      setAddingCard(null);
    };

    const handleUpdateCard = (card: KanbanCard) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        cards: col.cards.map(c => c.id === card.id ? card : c)
      })));
      setEditingCard(null);
    };

    const handleDeleteCard = (cardId: string) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        cards: col.cards.filter(c => c.id !== cardId)
      })));
    };

    const handleAddColumn = (title: string) => {
      const newColumn: KanbanColumn = {
        id: `column-${Date.now()}`,
        title,
        cards: [],
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
      };
      setColumns(prev => [...prev, newColumn]);
    };

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Kanban
          columns={columns}
          onCardEdit={setEditingCard}
          onCardDelete={handleDeleteCard}
          onColumnAdd={handleAddColumn}
          enableSearch
          enableFilters
        />

        {/* Edit Card Dialog */}
        <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingCard && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingCard.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={editingCard.priority}
                    onValueChange={(value) => setEditingCard({ ...editingCard, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateCard(editingCard)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingCard(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

// Custom Card Template
export const CustomCardTemplate: Story = {
  render: () => {
    const CustomCard: React.FC<{ card: KanbanCard; isDragging?: boolean }> = ({ card, isDragging }) => (
      <div className={`p-4 rounded-lg bg-gradient-to-r ${
        card.priority === 'critical' ? 'from-red-500 to-pink-500' :
        card.priority === 'high' ? 'from-orange-500 to-yellow-500' :
        card.priority === 'medium' ? 'from-blue-500 to-cyan-500' :
        'from-green-500 to-teal-500'
      } text-white shadow-lg ${isDragging ? 'opacity-50 rotate-3' : ''}`}>
        <h4 className="font-bold text-lg mb-2">{card.title}</h4>
        {card.description && (
          <p className="text-sm opacity-90 mb-3">{card.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
            {card.priority?.toUpperCase()}
          </span>
          {card.assignee && (
            <img 
              src={card.assignee.avatar} 
              alt={card.assignee.name}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          )}
        </div>
      </div>
    );

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Kanban
          columns={sampleColumns}
          cardTemplate={CustomCard}
          enableSearch
          enableFilters
        />
      </div>
    );
  },
};

// With Swimlanes
export const WithSwimlanes: Story = {
  render: () => {
    const [columns, setColumns] = useState(sampleColumns);
    const [swimlanes, setSwimlanes] = useState(sampleSwimlanes);

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🏊 Swimlanes enabled - Organize tasks by teams or categories
          </p>
        </div>
        <Kanban
          columns={columns}
          swimlanes={swimlanes}
          enableSwimlanes
          enableSearch
          enableFilters
        />
      </div>
    );
  },
};

// Performance Test with Many Cards
export const PerformanceTest: Story = {
  render: () => {
    const [columns, setColumns] = useState<KanbanColumn[]>(() => [
      {
        id: 'backlog',
        title: 'Backlog (100 cards)',
        cards: generateSampleCards(100, 'backlog'),
        color: '#6B7280',
      },
      {
        id: 'todo',
        title: 'To Do (50 cards)',
        cards: generateSampleCards(50, 'todo'),
        color: '#3B82F6',
      },
      {
        id: 'in-progress',
        title: 'In Progress (25 cards)',
        cards: generateSampleCards(25, 'in-progress'),
        color: '#F59E0B',
      },
      {
        id: 'done',
        title: 'Done (150 cards)',
        cards: generateSampleCards(150, 'done'),
        color: '#10B981',
      },
    ]);

    const [dragCount, setDragCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              🚀 Performance test with 325 total cards. Drag operations: {dragCount}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setColumns(prev => prev.map(col => ({
                    ...col,
                    cards: generateSampleCards(Math.floor(Math.random() * 100) + 10, col.id)
                  })));
                }}
              >
                Regenerate Cards
              </Button>
            </div>
          </div>
        </div>
        <Kanban
          columns={columns.map(col => ({
            ...col,
            cards: searchQuery 
              ? col.cards.filter(card => 
                  card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  card.description?.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : col.cards
          }))}
          onCardMove={() => setDragCount(prev => prev + 1)}
          enableSearch={false} // Using custom search above
          enableFilters
          autoScroll
          compactMode
        />
      </div>
    );
  },
};