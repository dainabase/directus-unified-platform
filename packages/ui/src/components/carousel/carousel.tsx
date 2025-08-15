'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Circle, Pause, Play } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button'

export interface CarouselItem {
  id: string | number
  content: React.ReactNode
  caption?: string
  alt?: string
}

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Array of carousel items */
  items: CarouselItem[]
  /** Current active slide index */
  activeIndex?: number
  /** Callback when slide changes */
  onChange?: (index: number) => void
  /** Enable autoplay */
  autoplay?: boolean
  /** Autoplay interval in milliseconds */
  autoplayInterval?: number
  /** Pause autoplay on hover */
  pauseOnHover?: boolean
  /** Show navigation arrows */
  showArrows?: boolean
  /** Show dot indicators */
  showDots?: boolean
  /** Show play/pause button when autoplay is enabled */
  showPlayPause?: boolean
  /** Enable infinite loop */
  loop?: boolean
  /** Enable keyboard navigation */
  keyboard?: boolean
  /** Enable touch/swipe on mobile */
  touch?: boolean
  /** Minimum swipe distance in pixels */
  swipeThreshold?: number
  /** Carousel orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Animation type */
  animation?: 'slide' | 'fade' | 'scale'
  /** Animation duration in milliseconds */
  animationDuration?: number
  /** Number of slides to show at once */
  slidesToShow?: number
  /** Number of slides to scroll */
  slidesToScroll?: number
  /** Gap between slides */
  gap?: number
  /** Carousel variant */
  variant?: 'default' | 'cards' | 'fullscreen' | 'thumbnail'
  /** Custom arrow component */
  renderArrow?: (direction: 'prev' | 'next', onClick: () => void, disabled: boolean) => React.ReactNode
  /** Custom dot component */
  renderDot?: (index: number, isActive: boolean, onClick: () => void) => React.ReactNode
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      items,
      activeIndex: controlledIndex,
      onChange,
      autoplay = false,
      autoplayInterval = 5000,
      pauseOnHover = true,
      showArrows = true,
      showDots = true,
      showPlayPause = false,
      loop = true,
      keyboard = true,
      touch = true,
      swipeThreshold = 50,
      orientation = 'horizontal',
      animation = 'slide',
      animationDuration = 300,
      slidesToShow = 1,
      slidesToScroll = 1,
      gap = 0,
      variant = 'default',
      renderArrow,
      renderDot,
      ...props
    },
    ref
  ) => {
    const [internalIndex, setInternalIndex] = React.useState(0)
    const [isPlaying, setIsPlaying] = React.useState(autoplay)
    const [touchStart, setTouchStart] = React.useState(0)
    const [touchEnd, setTouchEnd] = React.useState(0)
    const [isTransitioning, setIsTransitioning] = React.useState(false)
    
    const intervalRef = React.useRef<NodeJS.Timeout>()
    const containerRef = React.useRef<HTMLDivElement>(null)
    
    const isControlled = controlledIndex !== undefined
    const currentIndex = isControlled ? controlledIndex : internalIndex
    
    const totalSlides = items.length
    const maxIndex = Math.max(0, totalSlides - slidesToShow)
    
    // Calculate if navigation should be disabled
    const canGoPrev = loop || currentIndex > 0
    const canGoNext = loop || currentIndex < maxIndex
    
    const goToSlide = React.useCallback(
      (index: number) => {
        if (isTransitioning) return
        
        let newIndex = index
        
        if (loop) {
          if (index < 0) {
            newIndex = maxIndex
          } else if (index > maxIndex) {
            newIndex = 0
          }
        } else {
          newIndex = Math.max(0, Math.min(maxIndex, index))
        }
        
        if (newIndex === currentIndex) return
        
        setIsTransitioning(true)
        
        if (!isControlled) {
          setInternalIndex(newIndex)
        }
        
        onChange?.(newIndex)
        
        setTimeout(() => {
          setIsTransitioning(false)
        }, animationDuration)
      },
      [currentIndex, isControlled, isTransitioning, loop, maxIndex, onChange, animationDuration]
    )
    
    const goToPrev = React.useCallback(() => {
      goToSlide(currentIndex - slidesToScroll)
    }, [currentIndex, goToSlide, slidesToScroll])
    
    const goToNext = React.useCallback(() => {
      goToSlide(currentIndex + slidesToScroll)
    }, [currentIndex, goToSlide, slidesToScroll])
    
    // Autoplay logic
    React.useEffect(() => {
      if (isPlaying && autoplay) {
        intervalRef.current = setInterval(() => {
          goToNext()
        }, autoplayInterval)
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, [isPlaying, autoplay, autoplayInterval, goToNext])
    
    // Keyboard navigation
    React.useEffect(() => {
      if (!keyboard) return
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          goToPrev()
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          goToNext()
        }
      }
      
      const container = containerRef.current
      if (container) {
        container.addEventListener('keydown', handleKeyDown)
        return () => container.removeEventListener('keydown', handleKeyDown)
      }
    }, [keyboard, goToPrev, goToNext])
    
    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      if (!touch) return
      setTouchStart(e.targetTouches[0].clientX)
    }
    
    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touch) return
      setTouchEnd(e.targetTouches[0].clientX)
    }
    
    const handleTouchEnd = () => {
      if (!touch || !touchStart || !touchEnd) return
      
      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > swipeThreshold
      const isRightSwipe = distance < -swipeThreshold
      
      if (isLeftSwipe && canGoNext) {
        goToNext()
      }
      if (isRightSwipe && canGoPrev) {
        goToPrev()
      }
      
      setTouchStart(0)
      setTouchEnd(0)
    }
    
    // Mouse handlers for pause on hover
    const handleMouseEnter = () => {
      if (pauseOnHover && autoplay) {
        setIsPlaying(false)
      }
    }
    
    const handleMouseLeave = () => {
      if (pauseOnHover && autoplay) {
        setIsPlaying(true)
      }
    }
    
    const togglePlayPause = () => {
      setIsPlaying(!isPlaying)
    }
    
    // Calculate transform based on animation type
    const getTransform = () => {
      if (animation === 'fade' || animation === 'scale') {
        return undefined
      }
      
      const offset = currentIndex * (100 / slidesToShow)
      
      if (orientation === 'horizontal') {
        return `translateX(-${offset}%)`
      } else {
        return `translateY(-${offset}%)`
      }
    }
    
    // Get slide styles based on animation
    const getSlideStyles = (index: number): React.CSSProperties => {
      const isActive = index >= currentIndex && index < currentIndex + slidesToShow
      
      if (animation === 'fade') {
        return {
          position: 'absolute',
          inset: 0,
          opacity: isActive ? 1 : 0,
          transition: `opacity ${animationDuration}ms ease-in-out`,
        }
      }
      
      if (animation === 'scale') {
        return {
          position: 'absolute',
          inset: 0,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1)' : 'scale(0.8)',
          transition: `all ${animationDuration}ms ease-in-out`,
        }
      }
      
      return {
        flex: `0 0 ${100 / slidesToShow}%`,
        paddingLeft: gap / 2,
        paddingRight: gap / 2,
      }
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          variant === 'fullscreen' && 'h-screen w-full',
          variant === 'cards' && 'p-4',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        <div
          ref={containerRef}
          className={cn(
            'relative',
            variant === 'fullscreen' && 'h-full',
            animation === 'fade' || animation === 'scale' ? 'h-full' : 'flex',
            orientation === 'vertical' && animation === 'slide' && 'flex-col'
          )}
          style={
            animation === 'slide'
              ? {
                  transform: getTransform(),
                  transition: isTransitioning ? `transform ${animationDuration}ms ease-in-out` : undefined,
                  marginLeft: -gap / 2,
                  marginRight: -gap / 2,
                }
              : undefined
          }
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Carousel"
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'select-none',
                variant === 'cards' && 'rounded-lg overflow-hidden',
                variant === 'thumbnail' && 'aspect-video'
              )}
              style={getSlideStyles(index)}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}`}
              aria-hidden={index < currentIndex || index >= currentIndex + slidesToShow}
            >
              {item.content}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <p className="text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        {showArrows && (
          <>
            {renderArrow ? (
              renderArrow('prev', goToPrev, !canGoPrev)
            ) : (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 left-4 z-10',
                  variant === 'fullscreen' && 'bg-black/20 text-white hover:bg-black/40 border-transparent',
                  !canGoPrev && 'opacity-50 cursor-not-allowed'
                )}
                onClick={goToPrev}
                disabled={!canGoPrev}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {renderArrow ? (
              renderArrow('next', goToNext, !canGoNext)
            ) : (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 right-4 z-10',
                  variant === 'fullscreen' && 'bg-black/20 text-white hover:bg-black/40 border-transparent',
                  !canGoNext && 'opacity-50 cursor-not-allowed'
                )}
                onClick={goToNext}
                disabled={!canGoNext}
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        
        {/* Dot Indicators */}
        {showDots && (
          <div
            className={cn(
              'absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2',
              orientation === 'vertical' && 'flex-col'
            )}
            role="tablist"
            aria-label="Slides"
          >
            {Array.from({ length: totalSlides }).map((_, index) => {
              if (slidesToShow > 1 && index > maxIndex) return null
              
              const isActive = index === currentIndex
              
              return renderDot ? (
                renderDot(index, isActive, () => goToSlide(index))
              ) : (
                <button
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    isActive
                      ? variant === 'fullscreen'
                        ? 'bg-white w-8'
                        : 'bg-primary w-8'
                      : variant === 'fullscreen'
                      ? 'bg-white/50 hover:bg-white/75'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  )}
                  onClick={() => goToSlide(index)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${index + 1}`}
                />
              )
            })}
          </div>
        )}
        
        {/* Play/Pause Button */}
        {showPlayPause && autoplay && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute top-4 right-4 z-10',
              variant === 'fullscreen' && 'bg-black/20 text-white hover:bg-black/40 border-transparent'
            )}
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    )
  }
)

Carousel.displayName = 'Carousel'

export { Carousel }
