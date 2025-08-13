---
id: pagination
title: Pagination
sidebar_position: 29
---

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@dainabase/ui';

# Pagination

A component for navigating through multiple pages of content. Essential for tables, lists, and search results.

## Preview

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>

## Features

- **Flexible Layout**: Support for different pagination patterns
- **Responsive Design**: Adapts to mobile and desktop screens
- **Keyboard Navigation**: Full keyboard support
- **Accessibility**: ARIA labels and screen reader support
- **Custom Ranges**: Show specific page ranges
- **Jump to Page**: Direct page number input
- **Items per Page**: Configurable page size selector
- **Loading States**: Support for async data loading
- **Customizable**: Full control over appearance and behavior

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@dainabase/ui';

export default function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## Examples

### Basic Pagination

```tsx
function BasicPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          />
        </PaginationItem>
        
        {[...Array(totalPages)].map((_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink
              onClick={() => setCurrentPage(i + 1)}
              isActive={currentPage === i + 1}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

### With Ellipsis

```tsx
function PaginationWithEllipsis() {
  const [currentPage, setCurrentPage] = useState(5);
  const totalPages = 20;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => setCurrentPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (showEllipsisStart) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (showEllipsisEnd) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          />
        </PaginationItem>
        
        {renderPageNumbers()}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

### Table Pagination

```tsx
function TableWithPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 234;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Table rows here */}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
          <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {totalPages > 5 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
```

### Simple Pagination

```tsx
function SimplePagination() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <span className="text-sm">
        Page {page} of {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Jump to Page

```tsx
function PaginationWithJump() {
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpValue, setJumpValue] = useState('');
  const totalPages = 50;

  const handleJump = () => {
    const page = parseInt(jumpValue);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpValue('');
    }
  };

  return (
    <div className="space-y-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          <PaginationItem>
            <PaginationLink isActive>{currentPage}</PaginationLink>
          </PaginationItem>
          
          <PaginationItem>
            <span className="px-2 text-muted-foreground">of {totalPages}</span>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="flex items-center gap-2">
        <Label htmlFor="jump">Go to page:</Label>
        <Input
          id="jump"
          type="number"
          min="1"
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          className="w-20"
          onKeyDown={(e) => e.key === 'Enter' && handleJump()}
        />
        <Button size="sm" onClick={handleJump}>Go</Button>
      </div>
    </div>
  );
}
```

### Load More Pattern

```tsx
function LoadMorePagination() {
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => i + 1));
  const [loading, setLoading] = useState(false);
  const totalItems = 100;
  const hasMore = items.length < totalItems;

  const loadMore = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItems = Array.from(
      { length: Math.min(10, totalItems - items.length) },
      (_, i) => items.length + i + 1
    );
    setItems([...items, ...newItems]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {items.map(item => (
          <Card key={item} className="p-4">
            Item {item}
          </Card>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More
                <span className="ml-2 text-muted-foreground">
                  ({items.length}/{totalItems})
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Infinite Scroll

```tsx
function InfiniteScrollPagination() {
  const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => i + 1));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  const loadMore = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItems = Array.from({ length: 20 }, (_, i) => items.length + i + 1);
    setItems(prev => [...prev, ...newItems]);
    
    if (items.length + newItems.length >= 100) {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {items.map(item => (
        <Card key={item} className="p-4">
          Item {item}
        </Card>
      ))}
      
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center p-4">
          {loading && <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
      )}
      
      {!hasMore && (
        <p className="text-center text-muted-foreground">
          No more items to load
        </p>
      )}
    </div>
  );
}
```

### Card Grid Pagination

```tsx
function CardGridPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalItems = 48;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="aspect-square bg-muted rounded mb-2" />
            <h3 className="font-semibold">Item {(currentPage - 1) * itemsPerPage + i + 1}</h3>
            <p className="text-sm text-muted-foreground">Description</p>
          </Card>
        ))}
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1} className="hidden sm:block">
              <PaginationLink
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem className="sm:hidden">
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
          
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
```

### API Response Pagination

```tsx
function ApiPagination() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items?page=${pageNum}&limit=10`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {data.items.map(item => (
            <Card key={item.id} className="p-4">
              {item.name}
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total: {data.total} items
        </p>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.hasPrevious || loading}
              />
            </PaginationItem>
            
            <PaginationItem>
              <span className="px-4">
                Page {data.currentPage} of {data.totalPages}
              </span>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(p => p + 1)}
                disabled={!data.hasNext || loading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
```

## API Reference

### Pagination

The root pagination container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Pagination content |

### PaginationContent

Container for pagination items.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Pagination items |

### PaginationItem

Individual pagination item wrapper.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Item content |

### PaginationLink

Clickable page number link.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | Link destination |
| `onClick` | `() => void` | - | Click handler |
| `isActive` | `boolean` | `false` | Active state |
| `disabled` | `boolean` | `false` | Disabled state |

### PaginationPrevious

Previous page button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | Link destination |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disabled state |

### PaginationNext

Next page button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | Link destination |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disabled state |

### PaginationEllipsis

Ellipsis indicator for page ranges.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |

## Accessibility

The Pagination component follows accessibility best practices:

- **ARIA Labels**: Proper labeling for navigation
- **Keyboard Navigation**:
  - `Tab`: Move between pagination controls
  - `Enter/Space`: Activate focused control
  - `Arrow Keys`: Navigate between pages (optional)
- **Screen Readers**: Clear announcements
- **Focus Management**: Visible focus indicators
- **Disabled States**: Proper disabled handling

## Best Practices

### Do's ✅

- Show total items/pages when possible
- Provide page size options for tables
- Include first/last page buttons for large sets
- Maintain current page after data updates
- Use loading states during transitions
- Consider mobile layout carefully

### Don'ts ❌

- Don't show all page numbers for large datasets
- Don't reset to page 1 unnecessarily
- Don't hide pagination on mobile
- Don't use tiny click targets
- Don't forget loading states
- Don't break back button behavior

## Use Cases

- **Data Tables**: Navigate table pages
- **Search Results**: Browse search pages
- **Product Listings**: E-commerce catalogs
- **Blog Posts**: Article archives
- **Image Galleries**: Photo collections
- **User Lists**: Member directories
- **Comments**: Discussion threads
- **API Results**: Paginated API responses

## Related Components

- [Table](./table) - Often used with pagination
- [Select](./select) - For page size selection
- [Input](./input) - For jump to page
- [Button](./button) - For navigation controls
- [Skeleton](./skeleton) - For loading states