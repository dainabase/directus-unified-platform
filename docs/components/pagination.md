# Pagination

Page navigation controls

## Import

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@dainabase/ui/pagination';
```

## Basic Usage

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@dainabase/ui/pagination';

export default function PaginationExample() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationPrevious href="#" />
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationNext href="#" />
      </PaginationContent>
    </Pagination>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| currentPage | `number` | 1 | No | Current page |
| totalPages | `number` | - | Yes | Total pages |
| onPageChange | `(page: number) => void` | - | No | Page change callback |

## Related Components

- [Data Grid](./data-grid.md) - Grid with pagination
- [Table](./table.md) - Table pagination

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>