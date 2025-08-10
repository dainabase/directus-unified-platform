import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './pagination'

describe('Pagination', () => {
  describe('Rendering', () => {
    it('should render pagination component', () => {
      render(<Pagination currentPage={1} totalPages={5} />)
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
    })

    it('should render correct number of page buttons', () => {
      render(<Pagination currentPage={1} totalPages={5} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render first/last buttons when showFirstLast is true', () => {
      render(<Pagination currentPage={3} totalPages={10} showFirstLast={true} />)
      expect(screen.getByLabelText('First')).toBeInTheDocument()
      expect(screen.getByLabelText('Last')).toBeInTheDocument()
    })

    it('should not render first/last buttons when showFirstLast is false', () => {
      render(<Pagination currentPage={3} totalPages={10} showFirstLast={false} />)
      expect(screen.queryByLabelText('First')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Last')).not.toBeInTheDocument()
    })

    it('should render total items when showTotal is true', () => {
      render(<Pagination currentPage={1} totalPages={5} totalItems={50} showTotal={true} />)
      expect(screen.getByText('50 items')).toBeInTheDocument()
    })

    it('should render page size selector when showPageSize is true', () => {
      render(<Pagination currentPage={1} totalPages={5} showPageSize={true} />)
      expect(screen.getByText('Items per page:')).toBeInTheDocument()
    })

    it('should render page jumper when showPageJumper is true', () => {
      render(<Pagination currentPage={1} totalPages={5} showPageJumper={true} />)
      expect(screen.getByLabelText('Go to page')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should call onPageChange when clicking page number', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)
      
      fireEvent.click(screen.getByText('3'))
      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('should call onPageChange when clicking previous button', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
      
      fireEvent.click(screen.getByLabelText('Previous'))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when clicking next button', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
      
      fireEvent.click(screen.getByLabelText('Next'))
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('should call onPageChange when clicking first button', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={3} totalPages={5} showFirstLast={true} onPageChange={onPageChange} />)
      
      fireEvent.click(screen.getByLabelText('First'))
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('should call onPageChange when clicking last button', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={3} totalPages={5} showFirstLast={true} onPageChange={onPageChange} />)
      
      fireEvent.click(screen.getByLabelText('Last'))
      expect(onPageChange).toHaveBeenCalledWith(5)
    })

    it('should disable previous button on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} />)
      expect(screen.getByLabelText('Previous')).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} />)
      expect(screen.getByLabelText('Next')).toBeDisabled()
    })

    it('should disable first button on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} showFirstLast={true} />)
      expect(screen.getByLabelText('First')).toBeDisabled()
    })

    it('should disable last button on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} showFirstLast={true} />)
      expect(screen.getByLabelText('Last')).toBeDisabled()
    })
  })

  describe('Page Size', () => {
    it('should call onPageSizeChange when selecting new page size', async () => {
      const onPageSizeChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          currentPage={1} 
          totalPages={5} 
          pageSize={10}
          showPageSize={true}
          onPageSizeChange={onPageSizeChange}
        />
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      const option = screen.getByRole('option', { name: '20' })
      await user.click(option)
      
      expect(onPageSizeChange).toHaveBeenCalledWith(20)
    })
  })

  describe('Page Jumper', () => {
    it('should navigate to entered page number', async () => {
      const onPageChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          currentPage={1} 
          totalPages={10} 
          showPageJumper={true}
          onPageChange={onPageChange}
        />
      )
      
      const input = screen.getByLabelText('Go to page')
      await user.type(input, '5')
      await user.type(input, '{Enter}')
      
      expect(onPageChange).toHaveBeenCalledWith(5)
    })

    it('should not navigate to invalid page number', async () => {
      const onPageChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          currentPage={1} 
          totalPages={10} 
          showPageJumper={true}
          onPageChange={onPageChange}
        />
      )
      
      const input = screen.getByLabelText('Go to page')
      await user.type(input, 'abc')
      await user.type(input, '{Enter}')
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should clear input after navigation', async () => {
      const onPageChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          currentPage={1} 
          totalPages={10} 
          showPageJumper={true}
          onPageChange={onPageChange}
        />
      )
      
      const input = screen.getByLabelText('Go to page') as HTMLInputElement
      await user.type(input, '5')
      await user.type(input, '{Enter}')
      
      expect(input.value).toBe('')
    })
  })

  describe('Ellipsis', () => {
    it('should show ellipsis for large page ranges', () => {
      render(
        <Pagination 
          currentPage={10} 
          totalPages={20}
          siblingCount={1}
          boundaryCount={1}
        />
      )
      
      const ellipses = screen.getAllByLabelText('', { selector: 'svg' })
      expect(ellipses.length).toBeGreaterThan(0)
    })

    it('should not show ellipsis for small page ranges', () => {
      render(
        <Pagination 
          currentPage={3} 
          totalPages={5}
          siblingCount={1}
          boundaryCount={1}
        />
      )
      
      const ellipses = screen.queryAllByLabelText('', { selector: 'svg.lucide-more-horizontal' })
      expect(ellipses).toHaveLength(0)
    })
  })

  describe('Variants', () => {
    it('should render compact variant', () => {
      render(<Pagination currentPage={3} totalPages={10} variant="compact" />)
      expect(screen.getByText('Page 3 of 10')).toBeInTheDocument()
    })

    it('should render dots variant', () => {
      render(<Pagination currentPage={3} totalPages={5} variant="dots" />)
      const buttons = screen.getAllByRole('button')
      // Should have dot buttons plus prev/next
      expect(buttons.length).toBeGreaterThan(2)
    })
  })

  describe('Custom Labels', () => {
    it('should use custom labels', () => {
      const customLabels = {
        first: 'Premier',
        previous: 'Précédent',
        next: 'Suivant',
        last: 'Dernier',
        items: 'éléments'
      }
      
      render(
        <Pagination 
          currentPage={3} 
          totalPages={10}
          totalItems={100}
          showFirstLast={true}
          showTotal={true}
          labels={customLabels}
        />
      )
      
      expect(screen.getByLabelText('Premier')).toBeInTheDocument()
      expect(screen.getByLabelText('Précédent')).toBeInTheDocument()
      expect(screen.getByLabelText('Suivant')).toBeInTheDocument()
      expect(screen.getByLabelText('Dernier')).toBeInTheDocument()
      expect(screen.getByText('100 éléments')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Pagination currentPage={3} totalPages={5} />)
      
      const nav = screen.getByRole('navigation', { name: /pagination/i })
      expect(nav).toHaveAttribute('aria-label', 'Pagination Navigation')
      
      const currentPageButton = screen.getByRole('button', { name: 'Page 3' })
      expect(currentPageButton).toHaveAttribute('aria-current', 'page')
    })

    it('should properly label all interactive elements', () => {
      render(
        <Pagination 
          currentPage={3} 
          totalPages={10}
          showFirstLast={true}
        />
      )
      
      expect(screen.getByLabelText('First')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous')).toBeInTheDocument()
      expect(screen.getByLabelText('Next')).toBeInTheDocument()
      expect(screen.getByLabelText('Last')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const onPageChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          currentPage={1} 
          totalPages={5}
          onPageChange={onPageChange}
        />
      )
      
      const page2Button = screen.getByText('2')
      page2Button.focus()
      await user.keyboard('{Enter}')
      
      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single page', () => {
      render(<Pagination currentPage={1} totalPages={1} />)
      
      expect(screen.getByLabelText('Previous')).toBeDisabled()
      expect(screen.getByLabelText('Next')).toBeDisabled()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should not navigate to page less than 1', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)
      
      const prevButton = screen.getByLabelText('Previous')
      fireEvent.click(prevButton)
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should not navigate to page greater than totalPages', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />)
      
      const nextButton = screen.getByLabelText('Next')
      fireEvent.click(nextButton)
      
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should not navigate when clicking current page', () => {
      const onPageChange = vi.fn()
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
      
      fireEvent.click(screen.getByText('3'))
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })
})
