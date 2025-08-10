import type { Meta, StoryObj } from '@storybook/react'
import { Carousel, CarouselItem } from './carousel'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card/card'

const meta = {
  title: 'Components/Media/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile carousel component with touch support, autoplay, and multiple animation styles.'
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
        alt="Mountain landscape"
        className="w-full h-full object-cover"
      />
    ),
    caption: 'Beautiful mountain landscape at sunset'
  },
  {
    id: 2,
    content: (
      <img
        src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800"
        alt="Forest path"
        className="w-full h-full object-cover"
      />
    ),
    caption: 'Misty forest path in autumn'
  },
  {
    id: 3,
    content: (
      <img
        src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800"
        alt="Beach sunset"
        className="w-full h-full object-cover"
      />
    ),
    caption: 'Tropical beach at golden hour'
  },
  {
    id: 4,
    content: (
      <img
        src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800"
        alt="Mountain peaks"
        className="w-full h-full object-cover"
      />
    ),
    caption: 'Snow-capped mountain peaks'
  },
  {
    id: 5,
    content: (
      <img
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
        alt="Desert dunes"
        className="w-full h-full object-cover"
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
        } z-10 bg-white/80 rounded-full p-3 hover:bg-white disabled:opacity-50`}
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
        } h-3 w-3 rounded-full transition-all mx-1`}
        aria-label={`Go to slide ${index + 1}`}
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
              <button className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
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
              <button className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
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
              <button className="bg-white text-red-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
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
