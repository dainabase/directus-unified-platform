import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
  MeasuringStrategy,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
  getFirstCollision
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { cn } from '../utils/cn';
import { Button } from './button';
import { Card } from './card';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { Avatar } from './avatar';
import { 
  MoreHorizontal, 
  Plus, 
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  GripVertical,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Types
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: Array<{ id: string; label: string; color?: string }>;
  dueDate?: Date;
  attachments?: number;
  comments?: number;
  progress?: number;
  customFields?: Record<string, any>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  wipLimit?: number;
  collapsed?: boolean;
  sortOrder?: number;
}

export interface KanbanSwimlane {
  id: string;
  title: string;
  collapsed?: boolean;
}

export interface KanbanProps {
  columns: KanbanColumn[];
  swimlanes?: KanbanSwimlane[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
  onColumnAdd?: (title: string) => void;
  onColumnEdit?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnReorder?: (columns: KanbanColumn[]) => void;
  cardTemplate?: React.ComponentType<{ card: KanbanCard; isDragging?: boolean }>;
  enableSwimlanes?: boolean;
  enableColumnCollapse?: boolean;
  enableWipLimits?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  className?: string;
  containerClassName?: string;
  columnClassName?: string;
  cardClassName?: string;
  autoScroll?: boolean;
  compactMode?: boolean;
}

// Draggable Column Component
const DraggableColumn: React.FC<{
  column: KanbanColumn;
  children: React.ReactNode;
  onEdit?: (updates: Partial<KanbanColumn>) => void;
  onDelete?: () => void;
  enableWipLimits?: boolean;
  enableCollapse?: boolean;
  className?: string;
}> = ({ column, children, onEdit, onDelete, enableWipLimits, enableCollapse, className }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isOverLimit = enableWipLimits && column.wipLimit && column.cards.length > column.wipLimit;
  const isAtLimit = enableWipLimits && column.wipLimit && column.cards.length === column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg min-w-[320px] max-w-[380px] h-full",
        isDragging && "ring-2 ring-primary",
        className
      )}
    >
      <div 
        className={cn(
          "flex items-center justify-between p-3 border-b",
          column.color && `border-l-4`,
          isOverLimit && "bg-red-50 dark:bg-red-900/20"
        )}
        style={{ borderLeftColor: column.color }}
      >
        <div className="flex items-center gap-2 flex-1">
          <button
            className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {column.cards.length}
            {column.wipLimit && ` / ${column.wipLimit}`}
          </Badge>
          {isOverLimit && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {enableCollapse && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit?.({ collapsed: !column.collapsed })}
            >
              {column.collapsed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          )}
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {!column.collapsed && (
        <ScrollArea className="flex-1 p-2">
          {children}
        </ScrollArea>
      )}
    </div>
  );
};

// Draggable Card Component
const DraggableCard: React.FC<{
  card: KanbanCard;
  isDragging?: boolean;
  template?: React.ComponentType<{ card: KanbanCard; isDragging?: boolean }>;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ card, isDragging, template: Template, className, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isLocalDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isLocalDragging ? 0.5 : 1
  };

  if (Template) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Template card={card} isDragging={isDragging || isLocalDragging} />
      </div>
    );
  }

  const getPriorityIcon = () => {
    switch (card.priority) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (card.status) {
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className={cn(
          "p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
          (isDragging || isLocalDragging) && "ring-2 ring-primary",
          className
        )}
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">{card.title}</h4>
            {getPriorityIcon()}
          </div>

          {/* Description */}
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map(tag => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-xs py-0 px-1"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.label}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-1">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {card.progress !== undefined && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {card.assignee && (
                <Avatar className="h-6 w-6">
                  <img src={card.assignee.avatar} alt={card.assignee.name} />
                </Avatar>
              )}
              {card.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(card.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {card.attachments && card.attachments > 0 && (
                <span>{card.attachments} 📎</span>
              )}
              {card.comments && card.comments > 0 && (
                <span>{card.comments} 💬</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Main Kanban Component
export const Kanban: React.FC<KanbanProps> = ({
  columns: initialColumns,
  swimlanes,
  onCardMove,
  onCardEdit,
  onCardDelete,
  onColumnAdd,
  onColumnEdit,
  onColumnDelete,
  onColumnReorder,
  cardTemplate,
  enableSwimlanes = false,
  enableColumnCollapse = true,
  enableWipLimits = false,
  enableSearch = true,
  enableFilters = true,
  className,
  containerClassName,
  columnClassName,
  cardClassName,
  autoScroll = true,
  compactMode = false
}) => {
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find active card or column
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    
    // Check if it's a column
    const column = columns.find(col => col.id === activeId);
    if (column) return { type: 'column', data: column };
    
    // Check if it's a card
    for (const col of columns) {
      const card = col.cards.find(c => c.id === activeId);
      if (card) return { type: 'card', data: card, columnId: col.id };
    }
    
    return null;
  }, [activeId, columns]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    setOverId(over.id);

    const activeContainer = columns.find(col => 
      col.cards.some(card => card.id === active.id)
    );
    const overContainer = columns.find(col => 
      col.id === over.id || col.cards.some(card => card.id === over.id)
    );

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns(prev => {
      const activeCard = activeContainer.cards.find(c => c.id === active.id);
      if (!activeCard) return prev;

      const newColumns = prev.map(col => {
        if (col.id === activeContainer.id) {
          return {
            ...col,
            cards: col.cards.filter(c => c.id !== active.id)
          };
        }
        if (col.id === overContainer.id) {
          const overIndex = col.cards.findIndex(c => c.id === over.id);
          const newCards = [...col.cards];
          
          if (overIndex >= 0) {
            newCards.splice(overIndex, 0, activeCard);
          } else {
            newCards.push(activeCard);
          }
          
          return {
            ...col,
            cards: newCards
          };
        }
        return col;
      });

      return newColumns;
    });
  }, [columns]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // Check if we're moving a column
    const activeColumn = columns.find(col => col.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);
    
    if (activeColumn && overColumn) {
      const activeIndex = columns.findIndex(col => col.id === active.id);
      const overIndex = columns.findIndex(col => col.id === over.id);
      
      if (activeIndex !== overIndex) {
        const newColumns = arrayMove(columns, activeIndex, overIndex);
        setColumns(newColumns);
        onColumnReorder?.(newColumns);
      }
    } else {
      // Moving a card
      const activeContainer = columns.find(col => 
        col.cards.some(card => card.id === active.id)
      );
      const overContainer = columns.find(col => 
        col.id === over.id || col.cards.some(card => card.id === over.id)
      );

      if (activeContainer && overContainer) {
        const activeIndex = activeContainer.cards.findIndex(c => c.id === active.id);
        const overIndex = overContainer.cards.findIndex(c => c.id === over.id);
        
        if (activeContainer.id === overContainer.id) {
          // Moving within the same column
          const newCards = arrayMove(activeContainer.cards, activeIndex, overIndex !== -1 ? overIndex : overContainer.cards.length);
          setColumns(prev => prev.map(col => 
            col.id === activeContainer.id 
              ? { ...col, cards: newCards }
              : col
          ));
        }
        
        // Trigger callback
        onCardMove?.(
          active.id as string,
          activeContainer.id,
          overContainer.id,
          overIndex !== -1 ? overIndex : overContainer.cards.length
        );
      }
    }

    setActiveId(null);
    setOverId(null);
  }, [columns, onCardMove, onColumnReorder]);

  // Filter cards based on search
  const filteredColumns = useMemo(() => {
    if (!searchQuery && selectedFilters.length === 0) return columns;
    
    return columns.map(column => ({
      ...column,
      cards: column.cards.filter(card => {
        const matchesSearch = !searchQuery || 
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilters = selectedFilters.length === 0 ||
          selectedFilters.some(filter => 
            card.tags?.some(tag => tag.label === filter) ||
            card.priority === filter ||
            card.status === filter
          );
        
        return matchesSearch && matchesFilters;
      })
    }));
  }, [columns, searchQuery, selectedFilters]);

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    if (activeId && activeId in columns.map(c => c.id)) {
      return closestCorners(args);
    }

    const pointerIntersections = pointerWithin(args);
    const intersections = pointerIntersections.length > 0 
      ? pointerIntersections 
      : rectIntersection(args);

    let overId = getFirstCollision(intersections, 'id');

    if (overId != null) {
      const overContainer = columns.find(col => 
        col.id === overId || col.cards.some(card => card.id === overId)
      );
      
      if (overContainer && overContainer.cards.length > 0) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            container => container.id === overContainer.id ||
              overContainer.cards.some(card => card.id === container.id)
          ),
        })[0]?.id || overId;
      }
    }

    return [{id: overId}];
  }, [activeId, columns]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      {(enableSearch || enableFilters) && (
        <div className="flex items-center gap-4 p-4 border-b bg-background">
          {enableSearch && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border rounded-md"
              />
            </div>
          )}
          {enableFilters && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {selectedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          )}
          {onColumnAdd && (
            <Button size="sm" onClick={() => onColumnAdd('New Column')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className={cn("flex-1 overflow-auto", containerClassName)}>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            }
          }}
          autoScroll={autoScroll}
        >
          <div className="flex gap-4 p-4 min-h-full">
            <SortableContext 
              items={filteredColumns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredColumns.map(column => (
                <DraggableColumn
                  key={column.id}
                  column={column}
                  onEdit={(updates) => onColumnEdit?.(column.id, updates)}
                  onDelete={() => onColumnDelete?.(column.id)}
                  enableWipLimits={enableWipLimits}
                  enableCollapse={enableColumnCollapse}
                  className={columnClassName}
                >
                  <SortableContext 
                    items={column.cards.map(card => card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[100px]">
                      {column.cards.map(card => (
                        <DraggableCard
                          key={card.id}
                          card={card}
                          template={cardTemplate}
                          className={cardClassName}
                          onEdit={() => onCardEdit?.(card)}
                          onDelete={() => onCardDelete?.(card.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  {/* Add Card Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 justify-start"
                    onClick={() => {
                      // Add card logic
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </DraggableColumn>
              ))}
            </SortableContext>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem && (
              activeItem.type === 'column' ? (
                <div className="opacity-80 rotate-3">
                  <DraggableColumn 
                    column={activeItem.data as KanbanColumn}
                    enableWipLimits={enableWipLimits}
                    enableCollapse={enableColumnCollapse}
                  >
                    {(activeItem.data as KanbanColumn).cards.map(card => (
                      <DraggableCard
                        key={card.id}
                        card={card}
                        isDragging
                        template={cardTemplate}
                      />
                    ))}
                  </DraggableColumn>
                </div>
              ) : (
                <div className="opacity-80 rotate-3">
                  <DraggableCard
                    card={activeItem.data as KanbanCard}
                    isDragging
                    template={cardTemplate}
                  />
                </div>
              )
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

Kanban.displayName = 'Kanban';

export default Kanban;