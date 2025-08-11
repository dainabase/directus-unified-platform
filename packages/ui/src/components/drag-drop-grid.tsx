import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../utils/cn';

export interface DragDropItem {
  id: string;
  content: React.ReactNode;
  order?: number;
  disabled?: boolean;
}

export interface DragDropGridProps {
  items: DragDropItem[];
  columns?: number;
  gap?: number;
  onReorder?: (items: DragDropItem[]) => void;
  onDragStart?: (item: DragDropItem) => void;
  onDragEnd?: (item: DragDropItem) => void;
  className?: string;
  itemClassName?: string;
  dragHandleClassName?: string;
  placeholderClassName?: string;
  draggingClassName?: string;
  disabledClassName?: string;
  renderItem?: (item: DragDropItem, isDragging: boolean) => React.ReactNode;
  renderDragHandle?: () => React.ReactNode;
  animationDuration?: number;
  showDragHandle?: boolean;
  lockAxis?: 'x' | 'y' | null;
  autoScroll?: boolean;
  scrollSpeed?: number;
  allowKeyboardNavigation?: boolean;
  'aria-label'?: string;
}

interface DragState {
  draggedItem: DragDropItem | null;
  draggedOverItem: DragDropItem | null;
  draggedIndex: number;
  targetIndex: number;
  isDragging: boolean;
  mousePosition: { x: number; y: number };
}

export const DragDropGrid = React.forwardRef<HTMLDivElement, DragDropGridProps>(
  (
    {
      items: initialItems,
      columns = 3,
      gap = 16,
      onReorder,
      onDragStart,
      onDragEnd,
      className,
      itemClassName,
      dragHandleClassName,
      placeholderClassName,
      draggingClassName,
      disabledClassName,
      renderItem,
      renderDragHandle,
      animationDuration = 200,
      showDragHandle = true,
      lockAxis = null,
      autoScroll = true,
      scrollSpeed = 10,
      allowKeyboardNavigation = true,
      'aria-label': ariaLabel = 'Drag and drop grid',
      ...props
    },
    ref
  ) => {
    const [items, setItems] = useState<DragDropItem[]>(() =>
      initialItems.map((item, index) => ({
        ...item,
        order: item.order ?? index,
      }))
    );

    const [dragState, setDragState] = useState<DragState>({
      draggedItem: null,
      draggedOverItem: null,
      draggedIndex: -1,
      targetIndex: -1,
      isDragging: false,
      mousePosition: { x: 0, y: 0 },
    });

    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const animationFrameRef = useRef<number>();

    useEffect(() => {
      setItems(
        initialItems.map((item, index) => ({
          ...item,
          order: item.order ?? index,
        }))
      );
    }, [initialItems]);

    const handleAutoScroll = useCallback(() => {
      if (!autoScroll || !containerRef.current || !dragState.isDragging) return;

      const container = containerRef.current;
      const { y } = dragState.mousePosition;
      const rect = container.getBoundingClientRect();
      const threshold = 50;

      if (y < rect.top + threshold) {
        container.scrollTop -= scrollSpeed;
      } else if (y > rect.bottom - threshold) {
        container.scrollTop += scrollSpeed;
      }

      animationFrameRef.current = requestAnimationFrame(handleAutoScroll);
    }, [autoScroll, dragState.isDragging, dragState.mousePosition, scrollSpeed]);

    useEffect(() => {
      if (dragState.isDragging && autoScroll) {
        animationFrameRef.current = requestAnimationFrame(handleAutoScroll);
      }
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [dragState.isDragging, handleAutoScroll, autoScroll]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: DragDropItem, index: number) => {
      if (item.disabled) {
        e.preventDefault();
        return;
      }

      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.8';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setTimeout(() => document.body.removeChild(dragImage), 0);

      e.dataTransfer.effectAllowed = 'move';
      setDragState({
        ...dragState,
        draggedItem: item,
        draggedIndex: index,
        isDragging: true,
      });
      onDragStart?.(item);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, item: DragDropItem, index: number) => {
      e.preventDefault();
      if (dragState.draggedItem && dragState.draggedItem.id !== item.id && !item.disabled) {
        setDragState(prev => ({
          ...prev,
          draggedOverItem: item,
          targetIndex: index,
        }));
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      setDragState(prev => ({
        ...prev,
        mousePosition: { x: e.clientX, y: e.clientY },
      }));

      if (lockAxis === 'x') {
        e.dataTransfer.dropEffect = 'none';
        if (Math.abs(e.movementY) > Math.abs(e.movementX)) {
          e.preventDefault();
        }
      } else if (lockAxis === 'y') {
        e.dataTransfer.dropEffect = 'none';
        if (Math.abs(e.movementX) > Math.abs(e.movementY)) {
          e.preventDefault();
        }
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: DragDropItem, targetIndex: number) => {
      e.preventDefault();
      
      if (!dragState.draggedItem || targetItem.disabled) return;

      const newItems = [...items];
      const draggedIndex = items.findIndex(item => item.id === dragState.draggedItem!.id);
      
      if (draggedIndex !== targetIndex) {
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
        
        setItems(reorderedItems);
        onReorder?.(reorderedItems);
      }

      setDragState({
        draggedItem: null,
        draggedOverItem: null,
        draggedIndex: -1,
        targetIndex: -1,
        isDragging: false,
        mousePosition: { x: 0, y: 0 },
      });
      
      onDragEnd?.(dragState.draggedItem);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      setDragState({
        draggedItem: null,
        draggedOverItem: null,
        draggedIndex: -1,
        targetIndex: -1,
        isDragging: false,
        mousePosition: { x: 0, y: 0 },
      });
      
      if (dragState.draggedItem) {
        onDragEnd?.(dragState.draggedItem);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, item: DragDropItem, index: number) => {
      if (!allowKeyboardNavigation || item.disabled) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      switch (e.key) {
        case 'ArrowUp':
          if (isCtrlOrCmd) {
            e.preventDefault();
            moveItem(index, Math.max(0, index - columns));
          } else {
            e.preventDefault();
            const newIndex = Math.max(0, index - columns);
            setFocusedIndex(newIndex);
            itemRefs.current.get(items[newIndex].id)?.focus();
          }
          break;
        case 'ArrowDown':
          if (isCtrlOrCmd) {
            e.preventDefault();
            moveItem(index, Math.min(items.length - 1, index + columns));
          } else {
            e.preventDefault();
            const newIndex = Math.min(items.length - 1, index + columns);
            setFocusedIndex(newIndex);
            itemRefs.current.get(items[newIndex].id)?.focus();
          }
          break;
        case 'ArrowLeft':
          if (isCtrlOrCmd) {
            e.preventDefault();
            moveItem(index, Math.max(0, index - 1));
          } else {
            e.preventDefault();
            const newIndex = Math.max(0, index - 1);
            setFocusedIndex(newIndex);
            itemRefs.current.get(items[newIndex].id)?.focus();
          }
          break;
        case 'ArrowRight':
          if (isCtrlOrCmd) {
            e.preventDefault();
            moveItem(index, Math.min(items.length - 1, index + 1));
          } else {
            e.preventDefault();
            const newIndex = Math.min(items.length - 1, index + 1);
            setFocusedIndex(newIndex);
            itemRefs.current.get(items[newIndex].id)?.focus();
          }
          break;
        case ' ':
        case 'Enter':
          if (isCtrlOrCmd) {
            e.preventDefault();
            // Toggle selection or perform action
          }
          break;
      }
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));
      
      setItems(reorderedItems);
      onReorder?.(reorderedItems);
      
      // Keep focus on moved item
      setTimeout(() => {
        itemRefs.current.get(movedItem.id)?.focus();
      }, 0);
    };

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`,
    };

    return (
      <div
        ref={ref || containerRef}
        className={cn('relative', className)}
        style={gridStyle}
        role="grid"
        aria-label={ariaLabel}
        {...props}
      >
        {items.map((item, index) => {
          const isDragging = dragState.draggedItem?.id === item.id;
          const isDraggedOver = dragState.draggedOverItem?.id === item.id;
          const isDisabled = item.disabled;

          return (
            <div
              key={item.id}
              ref={el => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
              className={cn(
                'relative cursor-move transition-all',
                itemClassName,
                isDragging && cn('opacity-50', draggingClassName),
                isDraggedOver && cn('ring-2 ring-primary ring-offset-2', placeholderClassName),
                isDisabled && cn('cursor-not-allowed opacity-50', disabledClassName)
              )}
              style={{
                transitionDuration: `${animationDuration}ms`,
              }}
              draggable={!isDisabled}
              onDragStart={e => handleDragStart(e, item, index)}
              onDragEnter={e => handleDragEnter(e, item, index)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, item, index)}
              onDragEnd={handleDragEnd}
              onKeyDown={e => handleKeyDown(e, item, index)}
              tabIndex={isDisabled ? -1 : 0}
              role="gridcell"
              aria-grabbed={isDragging}
              aria-disabled={isDisabled}
              aria-label={`Item ${index + 1} of ${items.length}`}
            >
              {showDragHandle && !isDisabled && (
                <div
                  className={cn(
                    'absolute top-2 right-2 cursor-move p-1',
                    dragHandleClassName
                  )}
                  aria-label="Drag handle"
                >
                  {renderDragHandle ? (
                    renderDragHandle()
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-400"
                    >
                      <path
                        d="M7 4.5C7 5.32843 6.32843 6 5.5 6C4.67157 6 4 5.32843 4 4.5C4 3.67157 4.67157 3 5.5 3C6.32843 3 7 3.67157 7 4.5Z"
                        fill="currentColor"
                      />
                      <path
                        d="M7 10C7 10.8284 6.32843 11.5 5.5 11.5C4.67157 11.5 4 10.8284 4 10C4 9.17157 4.67157 8.5 5.5 8.5C6.32843 8.5 7 9.17157 7 10Z"
                        fill="currentColor"
                      />
                      <path
                        d="M5.5 17C6.32843 17 7 16.3284 7 15.5C7 14.6716 6.32843 14 5.5 14C4.67157 14 4 14.6716 4 15.5C4 16.3284 4.67157 17 5.5 17Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16 4.5C16 5.32843 15.3284 6 14.5 6C13.6716 6 13 5.32843 13 4.5C13 3.67157 13.6716 3 14.5 3C15.3284 3 16 3.67157 16 4.5Z"
                        fill="currentColor"
                      />
                      <path
                        d="M14.5 11.5C15.3284 11.5 16 10.8284 16 10C16 9.17157 15.3284 8.5 14.5 8.5C13.6716 8.5 13 9.17157 13 10C13 10.8284 13.6716 11.5 14.5 11.5Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16 15.5C16 16.3284 15.3284 17 14.5 17C13.6716 17 13 16.3284 13 15.5C13 14.6716 13.6716 14 14.5 14C15.3284 14 16 14.6716 16 15.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </div>
              )}
              {renderItem ? renderItem(item, isDragging) : item.content}
            </div>
          );
        })}
      </div>
    );
  }
);

DragDropGrid.displayName = 'DragDropGrid';
