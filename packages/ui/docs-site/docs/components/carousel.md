---
id: carousel
title: Carousel
sidebar_position: 51
---

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@dainabase/ui';

# Carousel Component

A flexible and feature-rich carousel component for creating image sliders, content carousels, and interactive galleries with smooth animations and comprehensive controls.

## Preview

```tsx live
function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="flex aspect-square items-center justify-center p-6 bg-gray-100 rounded-lg">
                <span className="text-4xl font-semibold">{index + 1}</span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

## Features

- 🎯 **Touch & Swipe** - Full touch and swipe support for mobile
- ♾️ **Infinite Loop** - Optional infinite scrolling
- 🎬 **Auto-play** - Automatic slide progression
- 📱 **Responsive** - Adapts to container size
- 🎨 **Customizable** - Flexible styling and animations
- ⌨️ **Keyboard Navigation** - Arrow key support
- 📍 **Indicators** - Dot navigation indicators
- 🖼️ **Multiple Items** - Show multiple items per view
- ♿ **Accessible** - ARIA compliant with screen reader support
- ⚡ **Performance** - Optimized rendering and animations

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@dainabase/ui';

function App() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

## Examples

### 1. Image Gallery Carousel

```tsx
function ImageGalleryExample() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const images = [
    { id: 1, src: 'https://picsum.photos/800/400?random=1', alt: 'Mountain landscape', caption: 'Beautiful mountain view' },
    { id: 2, src: 'https://picsum.photos/800/400?random=2', alt: 'Ocean sunset', caption: 'Stunning ocean sunset' },
    { id: 3, src: 'https://picsum.photos/800/400?random=3', alt: 'Forest path', caption: 'Peaceful forest trail' },
    { id: 4, src: 'https://picsum.photos/800/400?random=4', alt: 'City skyline', caption: 'Modern city architecture' },
    { id: 5, src: 'https://picsum.photos/800/400?random=5', alt: 'Desert dunes', caption: 'Endless desert landscape' },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Carousel 
        className="w-full" 
        opts={{ loop: true }}
        onSlideChange={setCurrentSlide}
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
                  <h3 className="text-white text-xl font-semibold">{image.caption}</h3>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
        
        {/* Indicators */}
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </Carousel>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2 mt-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setCurrentSlide(index)}
            className={`relative overflow-hidden rounded border-2 transition-all ${
              index === currentSlide ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <img 
              src={image.src} 
              alt={image.alt}
              className="w-full h-20 object-cover"
            />
            {index === currentSlide && (
              <div className="absolute inset-0 bg-blue-600/20" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. Product Showcase Carousel

```tsx
function ProductShowcaseExample() {
  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: '$199',
      rating: 4.5,
      image: 'https://picsum.photos/300/300?random=10',
      badge: 'Best Seller',
      discount: '-20%'
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: '$299',
      rating: 4.8,
      image: 'https://picsum.photos/300/300?random=11',
      badge: 'New',
    },
    {
      id: 3,
      name: 'Laptop Stand',
      price: '$49',
      rating: 4.2,
      image: 'https://picsum.photos/300/300?random=12',
    },
    {
      id: 4,
      name: 'USB-C Hub',
      price: '$79',
      rating: 4.6,
      image: 'https://picsum.photos/300/300?random=13',
      badge: 'Limited',
    },
    {
      id: 5,
      name: 'Mechanical Keyboard',
      price: '$149',
      rating: 4.9,
      image: 'https://picsum.photos/300/300?random=14',
      discount: '-15%'
    },
    {
      id: 6,
      name: 'Webcam HD',
      price: '$89',
      rating: 4.3,
      image: 'https://picsum.photos/300/300?random=15',
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                      {product.badge}
                    </span>
                  )}
                  {product.discount && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      {product.discount}
                    </span>
                  )}
                  <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
```

### 3. Testimonials Carousel

```tsx
function TestimonialsCarouselExample() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'CEO at TechCorp',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'This product has completely transformed how we handle our daily operations. The efficiency gains have been remarkable.',
      rating: 5
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Product Manager',
      avatar: 'https://i.pravatar.cc/150?img=2',
      content: 'Outstanding service and support. The team went above and beyond to ensure our success.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'Designer',
      avatar: 'https://i.pravatar.cc/150?img=3',
      content: 'The user interface is intuitive and beautiful. It\'s a joy to work with every day.',
      rating: 4
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Developer',
      avatar: 'https://i.pravatar.cc/150?img=4',
      content: 'Excellent documentation and API design. Integration was smooth and straightforward.',
      rating: 5
    },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-8">What Our Customers Say</h2>
      
      <Carousel 
        opts={{ 
          loop: true,
          autoplay: true,
          autoplayInterval: 5000 
        }}
        className="w-full"
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id}>
              <div className="p-8">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="mb-4">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                  <blockquote className="text-xl text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="flex justify-center space-x-2 mt-4">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className="h-1 w-8 bg-gray-300 rounded-full"
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
```

### 4. Feature Cards Carousel

```tsx
function FeatureCardsExample() {
  const features = [
    {
      icon: '🚀',
      title: 'Lightning Fast',
      description: 'Optimized performance with sub-second load times'
    },
    {
      icon: '🔒',
      title: 'Secure by Default',
      description: 'Enterprise-grade security with end-to-end encryption'
    },
    {
      icon: '📱',
      title: 'Mobile First',
      description: 'Responsive design that works on all devices'
    },
    {
      icon: '🎨',
      title: 'Customizable',
      description: 'Flexible theming system with unlimited possibilities'
    },
    {
      icon: '🌍',
      title: 'Global Scale',
      description: 'Deploy worldwide with CDN integration'
    },
    {
      icon: '🤝',
      title: '24/7 Support',
      description: 'Round-the-clock assistance from our expert team'
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
        <p className="text-gray-600">Discover the features that set us apart</p>
      </div>
      
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {features.map((feature, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
```

### 5. Video Carousel

```tsx
function VideoCarouselExample() {
  const [playing, setPlaying] = useState(null);
  
  const videos = [
    {
      id: 1,
      title: 'Product Demo',
      thumbnail: 'https://picsum.photos/800/450?random=20',
      duration: '2:45',
      views: '10K',
    },
    {
      id: 2,
      title: 'Customer Success Story',
      thumbnail: 'https://picsum.photos/800/450?random=21',
      duration: '3:20',
      views: '5.2K',
    },
    {
      id: 3,
      title: 'Tutorial: Getting Started',
      thumbnail: 'https://picsum.photos/800/450?random=22',
      duration: '5:15',
      views: '8.7K',
    },
    {
      id: 4,
      title: 'Behind the Scenes',
      thumbnail: 'https://picsum.photos/800/450?random=23',
      duration: '4:00',
      views: '3.1K',
    },
  ];
  
  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Featured Videos</h2>
      
      <Carousel className="w-full">
        <CarouselContent>
          {videos.map((video) => (
            <CarouselItem key={video.id}>
              <div className="relative group cursor-pointer">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-[450px] object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors rounded-lg" />
                
                {/* Play Button */}
                <button 
                  onClick={() => setPlaying(video.id)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <svg className="w-8 h-8 ml-1 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
                
                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {video.duration}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {video.views}
                    </span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/90" />
        <CarouselNext className="right-4 bg-white/90" />
      </Carousel>
    </div>
  );
}
```

### 6. News/Blog Carousel

```tsx
function NewsCarouselExample() {
  const articles = [
    {
      id: 1,
      category: 'Technology',
      title: 'The Future of AI in 2025',
      excerpt: 'Exploring the latest advancements in artificial intelligence and machine learning.',
      author: 'Jane Smith',
      date: '2 hours ago',
      image: 'https://picsum.photos/400/250?random=30',
      readTime: '5 min read'
    },
    {
      id: 2,
      category: 'Business',
      title: 'Market Trends to Watch',
      excerpt: 'Key insights into emerging market opportunities and investment strategies.',
      author: 'John Doe',
      date: '5 hours ago',
      image: 'https://picsum.photos/400/250?random=31',
      readTime: '3 min read'
    },
    {
      id: 3,
      category: 'Design',
      title: 'UI/UX Best Practices',
      excerpt: 'Modern design principles for creating exceptional user experiences.',
      author: 'Emily Chen',
      date: '1 day ago',
      image: 'https://picsum.photos/400/250?random=32',
      readTime: '7 min read'
    },
    {
      id: 4,
      category: 'Development',
      title: 'React 19 Released',
      excerpt: 'Breaking down the new features and improvements in the latest React version.',
      author: 'Mike Johnson',
      date: '2 days ago',
      image: 'https://picsum.photos/400/250?random=33',
      readTime: '4 min read'
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Latest Articles</h2>
        <a href="#" className="text-blue-600 hover:text-blue-700">View All →</a>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {articles.map((article) => (
            <CarouselItem key={article.id} className="pl-4 md:basis-1/2">
              <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
```

### 7. Team Members Carousel

```tsx
function TeamCarouselExample() {
  const team = [
    {
      id: 1,
      name: 'Alice Johnson',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 15+ years of experience in tech innovation.',
      avatar: 'https://i.pravatar.cc/300?img=5',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 2,
      name: 'Bob Smith',
      role: 'CTO',
      bio: 'Technology expert specializing in scalable architecture and AI.',
      avatar: 'https://i.pravatar.cc/300?img=6',
      social: { linkedin: '#', github: '#' }
    },
    {
      id: 3,
      name: 'Carol White',
      role: 'Head of Design',
      bio: 'Award-winning designer focused on user-centered experiences.',
      avatar: 'https://i.pravatar.cc/300?img=7',
      social: { dribbble: '#', twitter: '#' }
    },
    {
      id: 4,
      name: 'David Brown',
      role: 'Lead Engineer',
      bio: 'Full-stack developer passionate about clean code and performance.',
      avatar: 'https://i.pravatar.cc/300?img=8',
      social: { github: '#', linkedin: '#' }
    },
    {
      id: 5,
      name: 'Eve Davis',
      role: 'Product Manager',
      bio: 'Strategic thinker driving product innovation and user satisfaction.',
      avatar: 'https://i.pravatar.cc/300?img=9',
      social: { linkedin: '#', twitter: '#' }
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
        <p className="text-gray-600">The talented people behind our success</p>
      </div>
      
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {team.map((member) => (
            <CarouselItem key={member.id} className="md:basis-1/3">
              <div className="p-6 bg-white rounded-lg shadow-lg text-center">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-100"
                />
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-blue-600 mb-3">{member.role}</p>
                <p className="text-gray-600 mb-4 text-sm">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  {Object.entries(member.social).map(([platform, link]) => (
                    <a
                      key={platform}
                      href={link}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <span className="sr-only">{platform}</span>
                      {platform === 'linkedin' && '🔗'}
                      {platform === 'twitter' && '🐦'}
                      {platform === 'github' && '🐙'}
                      {platform === 'dribbble' && '🏀'}
                    </a>
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
```

### 8. Timeline Carousel

```tsx
function TimelineCarouselExample() {
  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize the industry',
      achievements: ['First prototype', 'Seed funding', 'Team of 5']
    },
    {
      year: '2021',
      title: 'Product Launch',
      description: 'Released our first product to market',
      achievements: ['1000 users', 'Series A funding', 'Team of 20']
    },
    {
      year: '2022',
      title: 'Rapid Growth',
      description: 'Expanded operations globally',
      achievements: ['10K users', 'New offices', 'Team of 50']
    },
    {
      year: '2023',
      title: 'Market Leader',
      description: 'Became industry leader in our segment',
      achievements: ['100K users', 'Series B funding', 'Team of 150']
    },
    {
      year: '2024',
      title: 'Innovation Awards',
      description: 'Recognized for excellence and innovation',
      achievements: ['500K users', '5 awards', 'Team of 300']
    },
    {
      year: '2025',
      title: 'Future Vision',
      description: 'Continuing to push boundaries',
      achievements: ['1M+ users', 'IPO planning', 'Global presence']
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
      
      <Carousel className="w-full">
        <CarouselContent>
          {milestones.map((milestone, index) => (
            <CarouselItem key={index}>
              <div className="p-8 text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">{milestone.year}</div>
                <h3 className="text-2xl font-semibold mb-3">{milestone.title}</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{milestone.description}</p>
                <div className="flex justify-center space-x-8">
                  {milestone.achievements.map((achievement, i) => (
                    <div key={i} className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-blue-600">{i + 1}</span>
                      </div>
                      <p className="text-sm">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        
        {/* Timeline dots */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          {milestones.map((_, index) => (
            <div key={index} className="relative">
              <div className="w-3 h-3 bg-gray-300 rounded-full" />
              {index < milestones.length - 1 && (
                <div className="absolute left-3 top-1.5 w-16 h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </Carousel>
    </div>
  );
}
```

### 9. Stats/Metrics Carousel

```tsx
function StatsCarouselExample() {
  const stats = [
    {
      category: 'Users',
      metrics: [
        { label: 'Total Users', value: '1.2M', change: '+15%', trend: 'up' },
        { label: 'Active Users', value: '850K', change: '+22%', trend: 'up' },
        { label: 'New Signups', value: '45K', change: '+8%', trend: 'up' },
      ]
    },
    {
      category: 'Revenue',
      metrics: [
        { label: 'Monthly Revenue', value: '$2.4M', change: '+18%', trend: 'up' },
        { label: 'Annual Revenue', value: '$28.8M', change: '+45%', trend: 'up' },
        { label: 'Average Order', value: '$156', change: '-3%', trend: 'down' },
      ]
    },
    {
      category: 'Performance',
      metrics: [
        { label: 'Uptime', value: '99.9%', change: '+0.1%', trend: 'up' },
        { label: 'Response Time', value: '45ms', change: '-12ms', trend: 'up' },
        { label: 'Error Rate', value: '0.02%', change: '-0.01%', trend: 'up' },
      ]
    },
    {
      category: 'Engagement',
      metrics: [
        { label: 'Session Duration', value: '8m 32s', change: '+1m 15s', trend: 'up' },
        { label: 'Page Views', value: '4.2M', change: '+28%', trend: 'up' },
        { label: 'Bounce Rate', value: '32%', change: '-5%', trend: 'up' },
      ]
    },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Key Metrics</h2>
      
      <Carousel 
        opts={{ 
          loop: true,
          autoplay: true,
          autoplayInterval: 4000 
        }}
        className="w-full"
      >
        <CarouselContent>
          {stats.map((stat, index) => (
            <CarouselItem key={index}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">{stat.category}</h3>
                <div className="grid grid-cols-3 gap-6">
                  {stat.metrics.map((metric, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-6">
                      <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                      <p className="text-3xl font-bold text-white mb-2">{metric.value}</p>
                      <div className={`flex items-center text-sm ${
                        metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className="mr-1">
                          {metric.trend === 'up' ? '↑' : '↓'}
                        </span>
                        {metric.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
```

### 10. Comparison Carousel

```tsx
function ComparisonCarouselExample() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: 'per month',
      features: [
        { name: 'Users', value: '5', included: true },
        { name: 'Storage', value: '10GB', included: true },
        { name: 'Support', value: 'Email', included: true },
        { name: 'API Access', value: 'Limited', included: true },
        { name: 'Custom Domain', value: '', included: false },
        { name: 'Analytics', value: '', included: false },
      ]
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      popular: true,
      features: [
        { name: 'Users', value: '20', included: true },
        { name: 'Storage', value: '100GB', included: true },
        { name: 'Support', value: 'Priority', included: true },
        { name: 'API Access', value: 'Full', included: true },
        { name: 'Custom Domain', value: '1', included: true },
        { name: 'Analytics', value: 'Basic', included: true },
      ]
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        { name: 'Users', value: 'Unlimited', included: true },
        { name: 'Storage', value: '1TB', included: true },
        { name: 'Support', value: '24/7 Phone', included: true },
        { name: 'API Access', value: 'Full + Priority', included: true },
        { name: 'Custom Domain', value: 'Unlimited', included: true },
        { name: 'Analytics', value: 'Advanced', included: true },
      ]
    },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for your needs</p>
      </div>
      
      <Carousel className="w-full max-w-sm mx-auto md:max-w-full">
        <CarouselContent className="md:-ml-4">
          {plans.map((plan, index) => (
            <CarouselItem key={index} className="md:pl-4 md:basis-1/3">
              <div className={`relative bg-white rounded-lg shadow-lg p-6 ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    Most Popular
                  </span>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-blue-600">{plan.price}</div>
                  <p className="text-gray-500 text-sm">{plan.period}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <span className={`mr-2 ${feature.included ? 'text-green-500' : 'text-gray-300'}`}>
                        {feature.included ? '✓' : '×'}
                      </span>
                      <span className={feature.included ? '' : 'text-gray-400'}>
                        {feature.name}
                        {feature.value && `: ${feature.value}`}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-2 rounded ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors`}>
                  Get Started
                </button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="md:hidden" />
        <CarouselNext className="md:hidden" />
      </Carousel>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `opts` | `CarouselOptions` | `{}` | Carousel configuration options |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Carousel orientation |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onSlideChange` | `(index: number) => void` | `undefined` | Slide change callback |

### CarouselOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Slide alignment |
| `loop` | `boolean` | `false` | Enable infinite loop |
| `autoplay` | `boolean` | `false` | Enable autoplay |
| `autoplayInterval` | `number` | `3000` | Autoplay interval in ms |
| `slidesToShow` | `number` | `1` | Number of slides to show |
| `slidesToScroll` | `number` | `1` | Number of slides to scroll |
| `speed` | `number` | `300` | Animation speed in ms |
| `gap` | `number` | `0` | Gap between slides |
| `draggable` | `boolean` | `true` | Enable drag/swipe |
| `dragThreshold` | `number` | `50` | Drag threshold in pixels |

## Accessibility

The Carousel component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Arrow keys for navigation
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Proper focus handling
- **ARIA Attributes**:
  - `role="region"` with `aria-roledescription="carousel"`
  - `aria-label` for navigation buttons
  - `aria-live` for announcements
  - `aria-current` for active slide

## Best Practices

### Do's ✅

- Provide clear navigation controls
- Include pause button for autoplay
- Show slide indicators
- Ensure touch/swipe support
- Test keyboard navigation
- Optimize image sizes
- Add loading states
- Provide alt text for images
- Consider reduced motion
- Test on mobile devices

### Don'ts ❌

- Don't autoplay without user control
- Don't make slides too fast
- Don't hide navigation on mobile
- Don't use for critical content only
- Don't forget touch targets
- Don't load all images at once
- Don't ignore accessibility
- Don't make carousel only option
- Don't use excessive animations
- Don't forget responsive design

## Use Cases

1. **Image Galleries** - Photo showcases
2. **Product Showcases** - E-commerce displays
3. **Testimonials** - Customer reviews
4. **News/Blog** - Article previews
5. **Feature Highlights** - Service features
6. **Team Members** - Staff profiles
7. **Portfolio** - Work samples
8. **Videos** - Media galleries
9. **Onboarding** - Tutorial steps
10. **Promotions** - Marketing banners

## Related Components

- [**Gallery**](./gallery) - Image gallery component
- [**Slider**](./slider) - Range slider input
- [**Tabs**](./tabs) - Tab navigation
- [**Stepper**](./stepper) - Step navigation
