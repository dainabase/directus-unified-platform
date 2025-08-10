import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Carousel, CarouselItem } from './carousel'

describe('Carousel', () => {
  const mockItems: CarouselItem[] = [
    { id: 1, content: <div>Slide 1</div> },
    { id: 2, content: <div>Slide 2</div> },
    { id: 3, content: <div>Slide 3</div> },
    { id: 4, content: <div>Slide 4</div> },
    { id: 5, content: <div>Slide 5</div> }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render carousel with items', () => {
      render(<Carousel items={mockItems} />)
      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should render navigation arrows by default', () => {
      render(<Carousel items={mockItems} />)
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
    })

    it('should render dot indicators by default', () => {
      render(<Carousel items={mockItems} />)
      const dots = screen.getAllByRole('tab')
      expect(dots).toHaveLength(mockItems.length)
    })

    it('should not render arrows when showArrows is false', () => {
      render(<Carousel items={mockItems} showArrows={false} />)
      expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument()
    })

    it('should not render dots when showDots is false', () => {
      render(<Carousel items={mockItems} showDots={false} />)
      expect(screen.queryAllByRole('tab')).toHaveLength(0)
    })

    it('should render play/pause button when showPlayPause is true and autoplay is enabled', () => {
      render(<Carousel items={mockItems} autoplay showPlayPause />)
      expect(screen.getByLabelText('Pause autoplay')).toBeInTheDocument()
    })

    it('should render item captions when provided', () => {
      const itemsWithCaptions: CarouselItem[] = [
        { id: 1, content: <div>Slide</div>, caption: 'Test caption' }
      ]
      render(<Carousel items={itemsWithCaptions} />)
      expect(screen.getByText('Test caption')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to next slide when next button is clicked', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} onChange={onChange} />)
      
      const nextButton = screen.getByLabelText('Next slide')
      fireEvent.click(nextButton)
      
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should navigate to previous slide when previous button is clicked', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} activeIndex={2} onChange={onChange} />)
      
      const prevButton = screen.getByLabelText('Previous slide')
      fireEvent.click(prevButton)
      
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should navigate to specific slide when dot is clicked', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} onChange={onChange} />)
      
      const dots = screen.getAllByRole('tab')
      fireEvent.click(dots[2])
      
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('should loop to last slide when going previous from first slide', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} activeIndex={0} onChange={onChange} loop />)
      
      const prevButton = screen.getByLabelText('Previous slide')
      fireEvent.click(prevButton)
      
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('should loop to first slide when going next from last slide', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} activeIndex={4} onChange={onChange} loop />)
      
      const nextButton = screen.getByLabelText('Next slide')
      fireEvent.click(nextButton)
      
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('should disable previous button on first slide when loop is false', () => {
      render(<Carousel items={mockItems} activeIndex={0} loop={false} />)
      
      const prevButton = screen.getByLabelText('Previous slide')
      expect(prevButton).toBeDisabled()
    })

    it('should disable next button on last slide when loop is false', () => {
      render(<Carousel items={mockItems} activeIndex={4} loop={false} />)
      
      const nextButton = screen.getByLabelText('Next slide')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Autoplay', () => {
    it('should auto-advance slides when autoplay is enabled', async () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} autoplay autoplayInterval={1000} onChange={onChange} />)
      
      vi.advanceTimersByTime(1000)
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(1))
      
      vi.advanceTimersByTime(1000)
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(2))
    })

    it('should pause autoplay on hover when pauseOnHover is true', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel items={mockItems} autoplay autoplayInterval={1000} pauseOnHover onChange={onChange} />
      )
      
      const carousel = container.firstChild as HTMLElement
      fireEvent.mouseEnter(carousel)
      
      vi.advanceTimersByTime(2000)
      await waitFor(() => expect(onChange).not.toHaveBeenCalled())
    })

    it('should resume autoplay on mouse leave', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel items={mockItems} autoplay autoplayInterval={1000} pauseOnHover onChange={onChange} />
      )
      
      const carousel = container.firstChild as HTMLElement
      fireEvent.mouseEnter(carousel)
      fireEvent.mouseLeave(carousel)
      
      vi.advanceTimersByTime(1000)
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(1))
    })

    it('should toggle play/pause when button is clicked', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} autoplay showPlayPause onChange={onChange} />)
      
      const pauseButton = screen.getByLabelText('Pause autoplay')
      fireEvent.click(pauseButton)
      
      expect(screen.getByLabelText('Start autoplay')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys when keyboard is enabled', () => {
      const onChange = vi.fn()
      const { container } = render(<Carousel items={mockItems} keyboard onChange={onChange} />)
      
      const carouselInner = container.querySelector('[role="region"]') as HTMLElement
      
      fireEvent.keyDown(carouselInner, { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith(1)
      
      onChange.mockClear()
      fireEvent.keyDown(carouselInner, { key: 'ArrowLeft' })
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('should navigate with vertical arrow keys', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel items={mockItems} keyboard orientation="vertical" onChange={onChange} />
      )
      
      const carouselInner = container.querySelector('[role="region"]') as HTMLElement
      
      fireEvent.keyDown(carouselInner, { key: 'ArrowDown' })
      expect(onChange).toHaveBeenCalledWith(1)
      
      onChange.mockClear()
      fireEvent.keyDown(carouselInner, { key: 'ArrowUp' })
      expect(onChange).toHaveBeenCalledWith(0)
    })
  })

  describe('Touch Support', () => {
    it('should navigate on swipe when touch is enabled', () => {
      const onChange = vi.fn()
      const { container } = render(<Carousel items={mockItems} touch onChange={onChange} />)
      
      const carousel = container.firstChild as HTMLElement
      
      // Simulate swipe left (next)
      fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 100 }] })
      fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 20 }] })
      fireEvent.touchEnd(carousel)
      
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should navigate backwards on swipe right', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel items={mockItems} touch activeIndex={2} onChange={onChange} />
      )
      
      const carousel = container.firstChild as HTMLElement
      
      // Simulate swipe right (previous)
      fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 20 }] })
      fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 100 }] })
      fireEvent.touchEnd(carousel)
      
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should not navigate on small swipe distance', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel items={mockItems} touch swipeThreshold={50} onChange={onChange} />
      )
      
      const carousel = container.firstChild as HTMLElement
      
      // Small swipe (less than threshold)
      fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 100 }] })
      fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 80 }] })
      fireEvent.touchEnd(carousel)
      
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Multiple Slides', () => {
    it('should show multiple slides when slidesToShow is greater than 1', () => {
      const items: CarouselItem[] = [
        { id: 1, content: <div>Slide 1</div> },
        { id: 2, content: <div>Slide 2</div> },
        { id: 3, content: <div>Slide 3</div> }
      ]
      
      render(<Carousel items={items} slidesToShow={2} />)
      
      // Both slides should be visible
      expect(screen.getByText('Slide 1')).toBeVisible()
      expect(screen.getByText('Slide 2')).toBeVisible()
    })

    it('should scroll multiple slides when slidesToScroll is greater than 1', () => {
      const onChange = vi.fn()
      render(
        <Carousel 
          items={mockItems} 
          slidesToShow={2} 
          slidesToScroll={2} 
          onChange={onChange} 
        />
      )
      
      const nextButton = screen.getByLabelText('Next slide')
      fireEvent.click(nextButton)
      
      expect(onChange).toHaveBeenCalledWith(2)
    })
  })

  describe('Animations', () => {
    it('should apply fade animation styles', () => {
      const { container } = render(<Carousel items={mockItems} animation="fade" />)
      const slides = container.querySelectorAll('[role="group"]')
      
      expect(slides[0]).toHaveStyle({ position: 'absolute' })
    })

    it('should apply scale animation styles', () => {
      const { container } = render(<Carousel items={mockItems} animation="scale" />)
      const slides = container.querySelectorAll('[role="group"]')
      
      expect(slides[0]).toHaveStyle({ position: 'absolute' })
    })
  })

  describe('Custom Renderers', () => {
    it('should use custom arrow renderer when provided', () => {
      const customArrow = vi.fn((direction, onClick) => (
        <button onClick={onClick} data-testid={`custom-${direction}`}>
          Custom {direction}
        </button>
      ))
      
      render(<Carousel items={mockItems} renderArrow={customArrow} />)
      
      expect(screen.getByTestId('custom-prev')).toBeInTheDocument()
      expect(screen.getByTestId('custom-next')).toBeInTheDocument()
      expect(customArrow).toHaveBeenCalledTimes(2)
    })

    it('should use custom dot renderer when provided', () => {
      const customDot = vi.fn((index, isActive, onClick) => (
        <button onClick={onClick} data-testid={`dot-${index}`}>
          {isActive ? 'Active' : 'Inactive'}
        </button>
      ))
      
      render(<Carousel items={mockItems} renderDot={customDot} />)
      
      expect(screen.getByTestId('dot-0')).toHaveTextContent('Active')
      expect(screen.getByTestId('dot-1')).toHaveTextContent('Inactive')
      expect(customDot).toHaveBeenCalledTimes(5)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Carousel items={mockItems} />)
      
      const carousel = screen.getByRole('region')
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
      expect(carousel).toHaveAttribute('aria-label', 'Carousel')
    })

    it('should have proper slide ARIA attributes', () => {
      const { container } = render(<Carousel items={mockItems} />)
      const slides = container.querySelectorAll('[role="group"]')
      
      expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide')
      expect(slides[0]).toHaveAttribute('aria-label', 'Slide 1 of 5')
      expect(slides[0]).toHaveAttribute('aria-hidden', 'false')
      expect(slides[1]).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper dot ARIA attributes', () => {
      render(<Carousel items={mockItems} />)
      
      const dots = screen.getAllByRole('tab')
      expect(dots[0]).toHaveAttribute('aria-selected', 'true')
      expect(dots[1]).toHaveAttribute('aria-selected', 'false')
      expect(dots[0]).toHaveAttribute('aria-label', 'Go to slide 1')
    })

    it('should be keyboard focusable', () => {
      const { container } = render(<Carousel items={mockItems} />)
      const carouselInner = container.querySelector('[role="region"]') as HTMLElement
      
      expect(carouselInner).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', () => {
      const { rerender } = render(<Carousel items={mockItems} activeIndex={0} />)
      expect(screen.getByText('Slide 1')).toBeVisible()
      
      rerender(<Carousel items={mockItems} activeIndex={2} />)
      // Slide 3 should now be visible (would need to check transform/opacity)
    })

    it('should work as uncontrolled component', () => {
      const onChange = vi.fn()
      render(<Carousel items={mockItems} onChange={onChange} />)
      
      const nextButton = screen.getByLabelText('Next slide')
      fireEvent.click(nextButton)
      
      expect(onChange).toHaveBeenCalledWith(1)
    })
  })
})
