import type { Meta, StoryObj } from '@storybook/react'
import { Carousel, CarouselItem } from './carousel'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card/card'
import { Badge } from '../badge/badge'
import { Button } from '../button/button'
import { Skeleton } from '../skeleton/skeleton'
import { Alert, AlertDescription } from '../alert/alert'

const meta = {
  title: 'Components/Media/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile carousel component with touch support, autoplay, and multiple animation styles. Supports accessibility, performance optimization, and complex integrations.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    autoplay: {
      control: { type: 'boolean' },
      description: 'Enable automatic slide progression'
    },
    autoplayInterval: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: 'Time between automatic slide changes (ms)'
    },
    pauseOnHover: {
      control: { type: 'boolean' },
      description: 'Pause autoplay when hovering'
    },
    showArrows: {
      control: { type: 'boolean' },
      description: 'Show navigation arrows'
    },
    showDots: {
      control: { type: 'boolean' },
      description: 'Show dot indicators'
    },
    showPlayPause: {
      control: { type: 'boolean' },
      description: 'Show play/pause button for autoplay'
    },
    loop: {
      control: { type: 'boolean' },
      description: 'Enable infinite loop'
    },
    keyboard: {
      control: { type: 'boolean' },
      description: 'Enable keyboard navigation'
    },
    touch: {
      control: { type: 'boolean' },
      description: 'Enable touch/swipe support'
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Carousel orientation'
    },
    animation: {
      control: { type: 'select' },
      options: ['slide', 'fade', 'scale'],
      description: 'Animation type'
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'cards', 'fullscreen', 'thumbnail'],
      description: 'Visual variant'
    },
    slidesToShow: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Number of slides visible at once'
    },
    slidesToScroll: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Number of slides to scroll'
    },
    gap: {
      control: { type: 'number', min: 0, max: 32 },
      description: 'Gap between slides (px)'
    }
  }
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

// Sample image data
const imageItems: CarouselItem[] = [
  {
    id: 1,
    content: (
      <img
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
        alt="Mountain landscape with snow-capped peaks and golden sunset reflections"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
    caption: 'Beautiful mountain landscape at sunset'
  },
  {
    id: 2,
    content: (
      <img
        src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800"
        alt="Misty forest path with autumn colors and morning fog"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
    caption: 'Misty forest path in autumn'
  },
  {
    id: 3,
    content: (
      <img
        src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800"
        alt="Tropical beach with palm trees and golden hour lighting"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
    caption: 'Tropical beach at golden hour'
  },
  {
    id: 4,
    content: (
      <img
        src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800"
        alt="Dramatic mountain peaks with snow and blue sky"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
    caption: 'Snow-capped mountain peaks'
  },
  {
    id: 5,
    content: (
      <img
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
        alt="Golden desert sand dunes with sunrise shadows"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
    caption: 'Golden desert dunes at sunrise'
  }
]

// Sample card content
const cardItems: CarouselItem[] = [
  {
    id: 1,
    content: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Feature 1</CardTitle>
          <CardDescription>Amazing feature description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the first feature card with detailed information about the feature.</p>
        </CardContent>
      </Card>
    )
  },
  {
    id: 2,
    content: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Feature 2</CardTitle>
          <CardDescription>Incredible capability</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Learn more about this incredible capability that enhances your workflow.</p>
        </CardContent>
      </Card>
    )
  },
  {
    id: 3,
    content: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Feature 3</CardTitle>
          <CardDescription>Revolutionary technology</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Discover how our revolutionary technology can transform your business.</p>
        </CardContent>
      </Card>
    )
  },
  {
    id: 4,
    content: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Feature 4</CardTitle>
          <CardDescription>Seamless integration</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Experience seamless integration with your existing tools and workflows.</p>
        </CardContent>
      </Card>
    )
  }
]

// Helper component for controlled carousel
function ControlledCarousel(props: any) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  return (
    <Carousel
      {...props}
      activeIndex={activeIndex}
      onChange={setActiveIndex}
    />
  )
}

// Performance monitoring component
function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<{
    renderTime: number
    memoryUsage: number
    fps: number
  }>({ renderTime: 0, memoryUsage: 0, fps: 0 })

  useEffect(() => {
    const start = performance.now()
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'carousel-render') {
          setMetrics(prev => ({ ...prev, renderTime: entry.duration }))
        }
      })
    })
    observer.observe({ entryTypes: ['measure'] })

    // Simulated metrics for demo
    const interval = setInterval(() => {
      setMetrics({
        renderTime: Math.round(performance.now() - start),
        memoryUsage: Math.round(Math.random() * 50 + 10),
        fps: Math.round(Math.random() * 10 + 55)
      })
    }, 1000)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.renderTime}ms</div>
          <div className="text-sm text-muted-foreground">Render Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.memoryUsage}MB</div>
          <div className="text-sm text-muted-foreground">Memory Usage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.fps} FPS</div>
          <div className="text-sm text-muted-foreground">Frame Rate</div>
        </div>
      </div>
      {children}
    </div>
  )
}

// Accessibility helper component
function AccessibilityInfo({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    const messages = [
      'Carousel loaded with 5 slides',
      'Auto-play enabled, press spacebar to pause',
      'Use arrow keys to navigate manually'
    ]
    messages.forEach((msg, i) => {
      setTimeout(() => {
        setAnnouncements(prev => [...prev, msg])
      }, i * 1000)
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🎯 Accessibility Features Active</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keyboard navigation (Arrow keys, Home, End)</li>
          <li>• Focus management and visual indicators</li>
          <li>• Screen reader announcements</li>
          <li>• ARIA labels and roles</li>
          <li>• Reduced motion support</li>
        </ul>
      </div>
      {announcements.length > 0 && (
        <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
          <h5 className="font-semibold text-green-800">Screen Reader Announcements:</h5>
          <ul className="text-sm text-green-700 mt-1">
            {announcements.map((announcement, i) => (
              <li key={i}>• {announcement}</li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  )
}

export const Default: Story = {
  args: {
    items: imageItems,
    className: 'w-[600px] h-[400px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const Autoplay: Story = {
  args: {
    items: imageItems,
    autoplay: true,
    autoplayInterval: 3000,
    showPlayPause: true,
    className: 'w-[600px] h-[400px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const FadeAnimation: Story = {
  args: {
    items: imageItems,
    animation: 'fade',
    className: 'w-[600px] h-[400px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const ScaleAnimation: Story = {
  args: {
    items: imageItems,
    animation: 'scale',
    className: 'w-[600px] h-[400px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const MultipleSlides: Story = {
  args: {
    items: cardItems,
    slidesToShow: 2,
    slidesToScroll: 2,
    gap: 16,
    className: 'w-[800px] h-[300px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const CardsVariant: Story = {
  args: {
    items: cardItems,
    variant: 'cards',
    slidesToShow: 3,
    gap: 16,
    className: 'w-[900px] h-[250px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const NoControls: Story = {
  args: {
    items: imageItems,
    showArrows: false,
    showDots: false,
    className: 'w-[600px] h-[400px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const NoLoop: Story = {
  args: {
    items: imageItems.slice(0, 3),
    loop: false,
    className: 'w-[600px] h-[400px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const VerticalOrientation: Story = {
  args: {
    items: cardItems,
    orientation: 'vertical',
    className: 'w-[400px] h-[500px]'
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const CustomArrows: Story = {
  args: {
    items: imageItems,
    className: 'w-[600px] h-[400px]',
    renderArrow: (direction, onClick, disabled) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`absolute top-1/2 -translate-y-1/2 ${
          direction === 'prev' ? 'left-2' : 'right-2'
        } z-10 bg-white/80 rounded-full p-3 hover:bg-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} slide`}
      >
        {direction === 'prev' ? '←' : '→'}
      </button>
    )
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const CustomDots: Story = {
  args: {
    items: imageItems,
    className: 'w-[600px] h-[400px]',
    renderDot: (index, isActive, onClick) => (
      <button
        onClick={onClick}
        className={`${
          isActive ? 'bg-blue-500 scale-125' : 'bg-gray-400'
        } h-3 w-3 rounded-full transition-all mx-1 focus:ring-2 focus:ring-blue-300 focus:outline-none`}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={isActive}
      />
    )
  },
  render: (args) => <ControlledCarousel {...args} />
}

export const Testimonials: Story = {
  render: () => {
    const testimonials: CarouselItem[] = [
      {
        id: 1,
        content: (
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4" />
            <p className="text-lg mb-4 italic">
              "This product has completely transformed our workflow. Highly recommended!"
            </p>
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-muted-foreground">CEO, TechCorp</p>
          </div>
        )
      },
      {
        id: 2,
        content: (
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-600 mb-4" />
            <p className="text-lg mb-4 italic">
              "Outstanding support and incredible features. Best decision we made!"
            </p>
            <p className="font-semibold">Jane Smith</p>
            <p className="text-sm text-muted-foreground">CTO, StartupXYZ</p>
          </div>
        )
      },
      {
        id: 3,
        content: (
          <div className="flex flex-col items-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-4" />
            <p className="text-lg mb-4 italic">
              "The ROI has been phenomenal. We saw results within weeks!"
            </p>
            <p className="font-semibold">Mike Johnson</p>
            <p className="text-sm text-muted-foreground">Director, BigCo</p>
          </div>
        )
      }
    ]
    
    return (
      <ControlledCarousel
        items={testimonials}
        animation="fade"
        autoplay
        autoplayInterval={5000}
        className="w-[600px] h-[300px] bg-muted/20 rounded-lg"
      />
    )
  }
}

export const ProductGallery: Story = {
  render: () => {
    const products: CarouselItem[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      content: (
        <div className="p-4">
          <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg mb-2" />
          <h3 className="font-semibold">Product {i + 1}</h3>
          <p className="text-sm text-muted-foreground">$99.99</p>
        </div>
      )
    }))
    
    return (
      <ControlledCarousel
        items={products}
        slidesToShow={4}
        slidesToScroll={1}
        gap={16}
        className="w-[900px]"
      />
    )
  }
}

export const HeroCarousel: Story = {
  render: () => {
    const heroItems: CarouselItem[] = [
      {
        id: 1,
        content: (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Welcome to Our Platform</h1>
              <p className="text-xl mb-8">Discover amazing features and capabilities</p>
              <button className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 focus:ring-2 focus:ring-white focus:outline-none">
                Get Started
              </button>
            </div>
          </div>
        )
      },
      {
        id: 2,
        content: (
          <div className="relative w-full h-full bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Boost Your Productivity</h1>
              <p className="text-xl mb-8">Work smarter, not harder</p>
              <button className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 focus:ring-2 focus:ring-white focus:outline-none">
                Learn More
              </button>
            </div>
          </div>
        )
      },
      {
        id: 3,
        content: (
          <div className="relative w-full h-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Join Our Community</h1>
              <p className="text-xl mb-8">Connect with thousands of users</p>
              <button className="bg-white text-red-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 focus:ring-2 focus:ring-white focus:outline-none">
                Sign Up Now
              </button>
            </div>
          </div>
        )
      }
    ]
    
    return (
      <ControlledCarousel
        items={heroItems}
        animation="fade"
        autoplay
        autoplayInterval={7000}
        showPlayPause
        className="w-full h-[500px]"
      />
    )
  }
}

export const MobileResponsive: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Mobile (Touch Enabled)</h3>
          <ControlledCarousel
            items={imageItems}
            showArrows={false}
            touch={true}
            className="w-[320px] h-[200px]"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Tablet</h3>
          <ControlledCarousel
            items={imageItems}
            className="w-[600px] h-[350px]"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Desktop</h3>
          <ControlledCarousel
            items={imageItems}
            className="w-[900px] h-[500px]"
          />
        </div>
      </div>
    )
  }
}

// 🎯 ACCESSIBILITY EXCELLENCE STORIES
export const AccessibilityShowcase: Story = {
  render: () => {
    return (
      <AccessibilityInfo>
        <ControlledCarousel
          items={imageItems}
          autoplay
          autoplayInterval={4000}
          keyboard
          className="w-[700px] h-[400px]"
          aria-label="Accessibility-optimized image carousel"
          role="region"
        />
      </AccessibilityInfo>
    )
  }
}

export const KeyboardNavigation: Story = {
  render: () => {
    const [focusedElement, setFocusedElement] = useState<string>('')
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">⌨️ Keyboard Controls</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <Badge variant="outline" className="mr-2">←/→</Badge>
              Navigate slides
            </div>
            <div>
              <Badge variant="outline" className="mr-2">Space</Badge>
              Play/Pause autoplay
            </div>
            <div>
              <Badge variant="outline" className="mr-2">Home</Badge>
              First slide
            </div>
            <div>
              <Badge variant="outline" className="mr-2">End</Badge>
              Last slide
            </div>
            <div>
              <Badge variant="outline" className="mr-2">Tab</Badge>
              Focus navigation
            </div>
            <div>
              <Badge variant="outline" className="mr-2">Enter</Badge>
              Activate control
            </div>
          </div>
          {focusedElement && (
            <p className="mt-2 text-yellow-700">Currently focused: {focusedElement}</p>
          )}
        </div>
        <ControlledCarousel
          items={imageItems}
          keyboard
          showPlayPause
          autoplay
          className="w-[600px] h-[400px]"
          onFocus={(element) => setFocusedElement(element)}
        />
      </div>
    )
  }
}

export const ScreenReaderFriendly: Story = {
  render: () => {
    const accessibleItems: CarouselItem[] = imageItems.map((item, index) => ({
      ...item,
      content: (
        <div className="relative w-full h-full">
          {item.content}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
            <p className="sr-only">
              Image {index + 1} of {imageItems.length}: {item.caption}
            </p>
            <p aria-hidden="true" className="text-sm">
              {item.caption}
            </p>
          </div>
        </div>
      )
    }))

    return (
      <ControlledCarousel
        items={accessibleItems}
        className="w-[600px] h-[400px]"
        aria-labelledby="carousel-title"
        aria-describedby="carousel-description"
        role="region"
      />
    )
  }
}

// ⚡ PERFORMANCE EXCELLENCE STORIES
export const PerformanceOptimized: Story = {
  render: () => {
    return (
      <PerformanceMonitor>
        <ControlledCarousel
          items={imageItems}
          lazyLoad
          preloadNext={2}
          className="w-[700px] h-[400px]"
        />
      </PerformanceMonitor>
    )
  }
}

export const VirtualScrolling: Story = {
  render: () => {
    // Generate large dataset for virtual scrolling demo
    const largeDataset: CarouselItem[] = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      content: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-400 to-pink-600 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold">#{i + 1}</div>
            <div className="text-sm">Virtual Item</div>
          </div>
        </div>
      )
    }))

    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            🚀 This carousel efficiently handles 1,000 items using virtual scrolling technology.
            Only visible items are rendered for optimal performance.
          </AlertDescription>
        </Alert>
        <ControlledCarousel
          items={largeDataset}
          virtualScroll
          slidesToShow={3}
          className="w-[800px] h-[300px]"
        />
      </div>
    )
  }
}

export const LazyLoadingDemo: Story = {
  render: () => {
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
    
    const lazyItems: CarouselItem[] = imageItems.map((item, index) => ({
      ...item,
      content: (
        <div className="relative w-full h-full">
          {loadedImages.has(index) ? (
            item.content
          ) : (
            <Skeleton className="w-full h-full" />
          )}
          <img
            src={item.content.props.src}
            alt={item.content.props.alt}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            onLoad={() => setLoadedImages(prev => new Set([...prev, index]))}
          />
        </div>
      )
    }))

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-green-50 rounded">
          <div className="text-green-800">
            Images loaded: {loadedImages.size}/{imageItems.length}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: imageItems.length }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded ${
                  loadedImages.has(i) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <ControlledCarousel
          items={lazyItems}
          className="w-[600px] h-[400px]"
        />
      </div>
    )
  }
}

// 🔄 ADVANCED ANIMATIONS STORIES
export const SpringAnimations: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Gentle Spring</h4>
            <ControlledCarousel
              items={cardItems.slice(0, 3)}
              animation="spring"
              springConfig={{ tension: 120, friction: 14 }}
              className="w-[250px] h-[200px]"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">Bouncy Spring</h4>
            <ControlledCarousel
              items={cardItems.slice(0, 3)}
              animation="spring"
              springConfig={{ tension: 200, friction: 8 }}
              className="w-[250px] h-[200px]"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">Smooth Spring</h4>
            <ControlledCarousel
              items={cardItems.slice(0, 3)}
              animation="spring"
              springConfig={{ tension: 300, friction: 20 }}
              className="w-[250px] h-[200px]"
            />
          </div>
        </div>
      </div>
    )
  }
}

export const ParallaxEffect: Story = {
  render: () => {
    const parallaxItems: CarouselItem[] = imageItems.map((item, index) => ({
      ...item,
      content: (
        <div className="relative w-full h-full overflow-hidden">
          <div 
            className="absolute inset-0 scale-110 transition-transform duration-1000"
            style={{
              transform: `translateX(${index * -20}px) scale(1.1)`
            }}
          >
            {item.content}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{item.caption}</h3>
            <p className="text-white/80">Parallax effect in action</p>
          </div>
        </div>
      )
    }))

    return (
      <ControlledCarousel
        items={parallaxItems}
        animation="parallax"
        autoplay
        autoplayInterval={4000}
        className="w-[800px] h-[500px]"
      />
    )
  }
}

export const StaggeredAnimations: Story = {
  render: () => {
    const staggeredItems: CarouselItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      content: (
        <div className="grid grid-cols-2 gap-4 p-6 h-full">
          {Array.from({ length: 4 }, (_, j) => (
            <div
              key={j}
              className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{
                animationDelay: `${j * 100}ms`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              Item {j + 1}
            </div>
          ))}
        </div>
      )
    }))

    return (
      <div className="space-y-4">
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <ControlledCarousel
          items={staggeredItems}
          className="w-[600px] h-[400px]"
        />
      </div>
    )
  }
}

// 🧩 INTEGRATION STORIES
export const ModalIntegration: Story = {
  render: () => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null)
    
    const modalItems: CarouselItem[] = imageItems.map((item, index) => ({
      ...item,
      content: (
        <div 
          className="relative w-full h-full cursor-pointer group"
          onClick={() => setSelectedImage(index)}
        >
          {item.content}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3">
              🔍
            </div>
          </div>
        </div>
      )
    }))

    return (
      <div>
        <ControlledCarousel
          items={modalItems}
          slidesToShow={3}
          gap={16}
          className="w-[900px] h-[300px]"
        />
        {selectedImage !== null && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-4xl">
              <img
                src={imageItems[selectedImage].content.props.src}
                alt={imageItems[selectedImage].content.props.alt}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export const FormIntegration: Story = {
  render: () => {
    const [selectedFeatures, setSelectedFeatures] = useState<number[]>([])
    
    const featureItems: CarouselItem[] = cardItems.map((item, index) => ({
      ...item,
      content: (
        <div className="relative h-full">
          {item.content}
          <div className="absolute bottom-4 right-4">
            <input
              type="checkbox"
              checked={selectedFeatures.includes(index)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedFeatures(prev => [...prev, index])
                } else {
                  setSelectedFeatures(prev => prev.filter(i => i !== index))
                }
              }}
              className="w-5 h-5"
            />
          </div>
        </div>
      )
    }))

    return (
      <div className="space-y-4">
        <ControlledCarousel
          items={featureItems}
          slidesToShow={2}
          gap={16}
          className="w-[800px] h-[300px]"
        />
        <div className="p-4 bg-muted/20 rounded">
          <h4 className="font-semibold mb-2">Selected Features:</h4>
          <div className="flex gap-2">
            {selectedFeatures.map(index => (
              <Badge key={index} variant="secondary">
                Feature {index + 1}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

// 🚨 EDGE CASES STORIES
export const SingleItem: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            This carousel gracefully handles a single item by hiding navigation controls.
          </AlertDescription>
        </Alert>
        <ControlledCarousel
          items={[imageItems[0]]}
          className="w-[600px] h-[400px]"
        />
      </div>
    )
  }
}

export const EmptyState: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            When no items are provided, the carousel shows an appropriate empty state.
          </AlertDescription>
        </Alert>
        <ControlledCarousel
          items={[]}
          className="w-[600px] h-[400px]"
          emptyState={(
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-semibold mb-2">No items to display</h3>
                <p>Add some items to see them in the carousel</p>
              </div>
            </div>
          )}
        />
      </div>
    )
  }
}

export const LoadingState: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 3000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsLoading(true)}
            variant="outline"
            size="sm"
          >
            Simulate Loading
          </Button>
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : 'Loaded'}
          </span>
        </div>
        
        <ControlledCarousel
          items={isLoading ? [] : imageItems}
          className="w-[600px] h-[400px]"
          loading={isLoading}
          loadingState={(
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading carousel content...</p>
              </div>
            </div>
          )}
        />
      </div>
    )
  }
}

export const ErrorState: Story = {
  render: () => {
    const [hasError, setHasError] = useState(false)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setHasError(!hasError)}
            variant="outline"
            size="sm"
          >
            Toggle Error State
          </Button>
        </div>
        
        <ControlledCarousel
          items={hasError ? [] : imageItems}
          className="w-[600px] h-[400px]"
          error={hasError}
          errorState={(
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4 text-red-500">⚠️</div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">Failed to load content</h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the carousel items
                </p>
                <Button 
                  onClick={() => setHasError(false)}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        />
      </div>
    )
  }
}

export const DynamicContent: Story = {
  render: () => {
    const [items, setItems] = useState(imageItems.slice(0, 3))
    
    const addItem = () => {
      const newItem: CarouselItem = {
        id: Date.now(),
        content: (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-400 to-blue-600 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">New Item</div>
              <div className="text-sm">Added dynamically</div>
            </div>
          </div>
        ),
        caption: `Dynamic item ${items.length + 1}`
      }
      setItems(prev => [...prev, newItem])
    }
    
    const removeItem = () => {
      setItems(prev => prev.slice(0, -1))
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={addItem} variant="outline" size="sm">
            Add Item
          </Button>
          <Button 
            onClick={removeItem} 
            variant="outline" 
            size="sm"
            disabled={items.length === 0}
          >
            Remove Item
          </Button>
          <span className="text-sm text-muted-foreground flex items-center">
            {items.length} items
          </span>
        </div>
        
        <ControlledCarousel
          items={items}
          className="w-[600px] h-[400px]"
          key={items.length} // Force re-render on item changes
        />
      </div>
    )
  }
}

export const VariableSizes: Story = {
  render: () => {
    const variableItems: CarouselItem[] = [
      {
        id: 1,
        content: (
          <div className="h-[200px] bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center text-white font-bold">
            Small
          </div>
        )
      },
      {
        id: 2,
        content: (
          <div className="h-[350px] bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
            Medium
          </div>
        )
      },
      {
        id: 3,
        content: (
          <div className="h-[500px] bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white font-bold">
            Large
          </div>
        )
      },
      {
        id: 4,
        content: (
          <div className="h-[150px] bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white font-bold">
            Tiny
          </div>
        )
      }
    ]

    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            This carousel adapts to items of varying heights, maintaining proper alignment.
          </AlertDescription>
        </Alert>
        <ControlledCarousel
          items={variableItems}
          adaptiveHeight
          className="w-[600px]"
        />
      </div>
    )
  }
}
