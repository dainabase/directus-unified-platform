'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button, ButtonProps } from '../button/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select/select'

export interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Number of items per page */
  pageSize?: number
  /** Total number of items */
  totalItems?: number
  /** Available page sizes for selection */
  pageSizes?: number[]
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void
  /** Number of sibling pages to show */
  siblingCount?: number
  /** Number of boundary pages to show */
  boundaryCount?: number
  /** Show first/last navigation buttons */
  showFirstLast?: boolean
  /** Show page size selector */
  showPageSize?: boolean
  /** Show page jumper input */
  showPageJumper?: boolean
  /** Show total items count */
  showTotal?: boolean
  /** Variant style */
  variant?: 'default' | 'compact' | 'dots'
  /** Size of the pagination controls */
  size?: 'sm' | 'md' | 'lg'
  /** Custom labels */
  labels?: {
    first?: string
    previous?: string
    next?: string
    last?: string
    page?: string
    of?: string
    items?: string
    itemsPerPage?: string
    goToPage?: string
  }
}

const defaultLabels = {
  first: 'First',
  previous: 'Previous',
  next: 'Next',
  last: 'Last',
  page: 'Page',
  of: 'of',
  items: 'items',
  itemsPerPage: 'Items per page',
  goToPage: 'Go to page',
}

function usePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): (number | 'ellipsis')[] {
  const range = React.useMemo(() => {
    const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2
    
    if (totalNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount)
    
    const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 1
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - boundaryCount
    
    const items: (number | 'ellipsis')[] = []
    
    // Add boundary pages at start
    for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
      items.push(i)
    }
    
    // Add left ellipsis
    if (shouldShowLeftEllipsis) {
      items.push('ellipsis')
    }
    
    // Add sibling pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (!items.includes(i)) {
        items.push(i)
      }
    }
    
    // Add right ellipsis
    if (shouldShowRightEllipsis) {
      items.push('ellipsis')
    }
    
    // Add boundary pages at end
    for (let i = Math.max(totalPages - boundaryCount + 1, 1); i <= totalPages; i++) {
      if (!items.includes(i)) {
        items.push(i)
      }
    }
    
    return items
  }, [currentPage, totalPages, siblingCount, boundaryCount])
  
  return range
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      currentPage = 1,
      totalPages,
      pageSize = 10,
      totalItems,
      pageSizes = [10, 20, 30, 50, 100],
      onPageChange,
      onPageSizeChange,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstLast = true,
      showPageSize = false,
      showPageJumper = false,
      showTotal = false,
      variant = 'default',
      size = 'md',
      labels: customLabels,
      ...props
    },
    ref
  ) => {
    const labels = { ...defaultLabels, ...customLabels }
    const [jumperValue, setJumperValue] = React.useState('')
    
    const paginationRange = usePaginationRange(currentPage, totalPages, siblingCount, boundaryCount)
    
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange?.(page)
      }
    }
    
    const handlePageSizeChange = (newSize: string) => {
      const size = parseInt(newSize, 10)
      onPageSizeChange?.(size)
    }
    
    const handleJumperSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const page = parseInt(jumperValue, 10)
      if (!isNaN(page)) {
        handlePageChange(page)
        setJumperValue('')
      }
    }
    
    const buttonSize: ButtonProps['size'] = 
      size === 'sm' ? 'sm' : size === 'lg' ? 'default' : 'sm'
    
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18
    
    if (variant === 'dots') {
      return (
        <nav
          ref={ref}
          className={cn('flex items-center gap-1', className)}
          aria-label="Pagination Navigation"
          role="navigation"
          {...props}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 disabled:opacity-50"
            aria-label={labels.previous}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1">
            {paginationRange.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-1">
                    •••
                  </span>
                )
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    currentPage === page
                      ? 'w-6 bg-primary'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  )}
                  aria-label={`${labels.page} ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                />
              )
            })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 disabled:opacity-50"
            aria-label={labels.next}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )
    }
    
    if (variant === 'compact') {
      return (
        <nav
          ref={ref}
          className={cn('flex items-center gap-2 text-sm', className)}
          aria-label="Pagination Navigation"
          role="navigation"
          {...props}
        >
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label={labels.previous}
          >
            <ChevronLeft className={cn('h-4 w-4')} />
          </Button>
          <span className="px-2 text-muted-foreground">
            {labels.page} {currentPage} {labels.of} {totalPages}
          </span>
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label={labels.next}
          >
            <ChevronRight className={cn('h-4 w-4')} />
          </Button>
        </nav>
      )
    }
    
    // Default variant
    return (
      <nav
        ref={ref}
        className={cn('flex flex-wrap items-center gap-2', className)}
        aria-label="Pagination Navigation"
        role="navigation"
        {...props}
      >
        {showTotal && totalItems && (
          <span className="text-sm text-muted-foreground">
            {totalItems} {labels.items}
          </span>
        )}
        
        {showPageSize && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">
              {labels.itemsPerPage}:
            </label>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {showFirstLast && (
            <Button
              variant="outline"
              size={buttonSize}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label={labels.first}
            >
              <ChevronsLeft className={cn('h-4 w-4')} />
            </Button>
          )}
          
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label={labels.previous}
          >
            <ChevronLeft className={cn('h-4 w-4')} />
          </Button>
          
          <div className="flex items-center gap-1">
            {paginationRange.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-9 w-9 items-center justify-center"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </span>
                )
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size={buttonSize}
                  onClick={() => handlePageChange(page)}
                  aria-label={`${labels.page} ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={cn(
                    currentPage === page && 'pointer-events-none'
                  )}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label={labels.next}
          >
            <ChevronRight className={cn('h-4 w-4')} />
          </Button>
          
          {showFirstLast && (
            <Button
              variant="outline"
              size={buttonSize}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label={labels.last}
            >
              <ChevronsRight className={cn('h-4 w-4')} />
            </Button>
          )}
        </div>
        
        {showPageJumper && (
          <form onSubmit={handleJumperSubmit} className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">
              {labels.goToPage}:
            </label>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumperValue}
              onChange={(e) => setJumperValue(e.target.value)}
              className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm"
              aria-label={labels.goToPage}
            />
          </form>
        )}
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'

export { Pagination }
