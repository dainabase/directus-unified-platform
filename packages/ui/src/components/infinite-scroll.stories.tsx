import type { Meta, StoryObj } from '@storybook/react';
import { InfiniteScroll } from './infinite-scroll';
import { useState, useCallback } from 'react';

const meta = {
  title: 'Sprint3/InfiniteScroll',
  component: InfiniteScroll,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
InfiniteScroll provides seamless content loading as users scroll.
Perfect for feeds, galleries, and large datasets that load progressively.

## Features

- **Automatic loading**: Loads more content when reaching threshold
- **Pull to refresh**: Mobile-friendly pull-down gesture
- **Inverse mode**: For chat-like interfaces (loads older messages on scroll up)
- **Custom loaders**: Configurable loading indicators
- **Window or container**: Can use window scroll or container scroll
- **Error handling**: Graceful error recovery

## Use Cases

- Social media feeds
- Product catalogs
- Image galleries
- Chat histories
- News articles
- Search results
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    threshold: {
      control: { type: 'number', min: 0.1, max: 1, step: 0.1 },
      description: 'Scroll threshold to trigger loading (0-1)'
    },
    hasMore: {
      control: 'boolean',
      description: 'Whether more items are available'
    },
    inverse: {
      control: 'boolean',
      description: 'Inverse scroll direction (chat style)'
    },
    pullDownToRefresh: {
      control: 'boolean',
      description: 'Enable pull to refresh'
    }
  }
} satisfies Meta<typeof InfiniteScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate mock data
const generateItems = (start: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: `Item ${start + i + 1}`,
    description: `This is the description for item ${start + i + 1}`,
    image: `https://via.placeholder.com/300x200?text=Item+${start + i + 1}`,
    date: new Date(Date.now() - (start + i) * 86400000).toLocaleDateString()
  }));
};

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(generateItems(0, 20));
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItems = generateItems(items.length, 20);
      setItems(prev => [...prev, ...newItems]);
      
      if (items.length >= 80) {
        setHasMore(false);
      }
      setLoading(false);
    }, [items.length]);

    return (
      <div className="w-[400px] h-[600px] border rounded-lg">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          height="100%"
        >
          <div className="p-4 space-y-4">
            {items.map(item => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
};

export const ImageGallery: Story = {
  render: () => {
    const [images, setImages] = useState(generateItems(0, 12));
    const [hasMore, setHasMore] = useState(true);

    const loadMore = useCallback(async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newImages = generateItems(images.length, 12);
      setImages(prev => [...prev, ...newImages]);
      
      if (images.length >= 48) {
        setHasMore(false);
      }
    }, [images.length]);

    return (
      <div className="w-[600px] h-[600px] border rounded-lg">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          threshold={0.9}
          loader={
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading images...</span>
              </div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-gray-500">
              <p>🎉 You've seen all images!</p>
            </div>
          }
        >
          <div className="grid grid-cols-3 gap-2 p-4">
            {images.map(image => (
              <div key={image.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={image.image} 
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                />
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
};

export const ChatMessages: Story = {
  render: () => {
    const [messages, setMessages] = useState(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        text: `Message ${i + 1}: This is a chat message that can be of varying length. ${i % 3 === 0 ? 'This one is longer to show how the interface handles different message sizes.' : ''}`,
        sender: i % 2 === 0 ? 'You' : 'Friend',
        time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString()
      }))
    );
    const [hasMore, setHasMore] = useState(true);

    const loadOlderMessages = useCallback(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const oldestId = messages[0]?.id || 0;
      const olderMessages = Array.from({ length: 10 }, (_, i) => ({
        id: oldestId - 10 + i,
        text: `Older message ${oldestId - 10 + i + 1}`,
        sender: (oldestId - 10 + i) % 2 === 0 ? 'You' : 'Friend',
        time: new Date(Date.now() - (40 - (oldestId - 10 + i)) * 60000).toLocaleTimeString()
      }));
      
      setMessages(prev => [...olderMessages, ...prev]);
      
      if (messages.length >= 50) {
        setHasMore(false);
      }
    }, [messages]);

    return (
      <div className="w-[400px] h-[600px] border rounded-lg bg-gray-50">
        <div className="bg-white border-b p-4">
          <h3 className="font-semibold">Chat Room</h3>
        </div>
        <InfiniteScroll
          loadMore={loadOlderMessages}
          hasMore={hasMore}
          inverse={true}
          height="calc(100% - 60px)"
          loader={
            <div className="text-center py-2 text-gray-500 text-sm">
              Loading older messages...
            </div>
          }
        >
          <div className="p-4 space-y-2">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.sender === 'You' 
                    ? 'bg-blue-500 text-white ml-auto max-w-[70%]' 
                    : 'bg-white max-w-[70%]'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className={`text-xs ${msg.sender === 'You' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.time}
                </span>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
};

export const WithPullToRefresh: Story = {
  render: () => {
    const [items, setItems] = useState(generateItems(0, 20));
    const [hasMore, setHasMore] = useState(true);

    const loadMore = useCallback(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newItems = generateItems(items.length, 20);
      setItems(prev => [...prev, ...newItems]);
      
      if (items.length >= 60) {
        setHasMore(false);
      }
    }, [items.length]);

    const refresh = useCallback(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setItems(generateItems(0, 20));
      setHasMore(true);
    }, []);

    return (
      <div className="w-[400px] h-[600px] border rounded-lg">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          pullDownToRefresh={true}
          refreshFunction={refresh}
          pullDownToRefreshThreshold={80}
          height="100%"
        >
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              📱 Pull down to refresh (mobile gesture)
            </div>
            {items.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
};

export const ProductGrid: Story = {
  render: () => {
    const [products, setProducts] = useState(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        name: `Product ${i + 1}`,
        price: Math.floor(Math.random() * 100) + 20,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 10
      }))
    );
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const newProducts = Array.from({ length: 12 }, (_, i) => ({
        id: products.length + i,
        name: `Product ${products.length + i + 1}`,
        price: Math.floor(Math.random() * 100) + 20,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 10
      }));
      
      setProducts(prev => [...prev, ...newProducts]);
      
      if (products.length >= 36) {
        setHasMore(false);
      }
      setLoading(false);
    }, [products.length]);

    return (
      <div className="w-[800px] h-[600px] border rounded-lg">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          threshold={0.8}
          height="100%"
        >
          <div className="grid grid-cols-4 gap-4 p-4">
            {products.map(product => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-lg font-bold text-blue-600">${product.price}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span>⭐ {product.rating}</span>
                  <span className="ml-2">({product.reviews})</span>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
};

export const NewsFeed: Story = {
  render: () => {
    const [articles, setArticles] = useState(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        title: `Breaking: Important News Article ${i + 1}`,
        summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        author: ['John Doe', 'Jane Smith', 'Bob Johnson'][i % 3],
        readTime: Math.floor(Math.random() * 10) + 3,
        timestamp: new Date(Date.now() - i * 3600000).toLocaleString()
      }))
    );
    const [hasMore, setHasMore] = useState(true);

    const loadMore = useCallback(async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newArticles = Array.from({ length: 5 }, (_, i) => ({
        id: articles.length + i,
        title: `News Article ${articles.length + i + 1}`,
        summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        author: ['John Doe', 'Jane Smith', 'Bob Johnson'][(articles.length + i) % 3],
        readTime: Math.floor(Math.random() * 10) + 3,
        timestamp: new Date(Date.now() - (articles.length + i) * 3600000).toLocaleString()
      }));
      
      setArticles(prev => [...prev, ...newArticles]);
      
      if (articles.length >= 25) {
        setHasMore(false);
      }
    }, [articles.length]);

    return (
      <div className="w-[600px] h-[700px] border rounded-lg bg-gray-50">
        <div className="bg-white border-b p-4">
          <h2 className="text-xl font-bold">Latest News</h2>
        </div>
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          threshold={0.7}
          height="calc(100% - 60px)"
          endMessage={
            <div className="text-center py-8">
              <p className="text-gray-500">You're all caught up! 📰</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                Refresh Feed
              </button>
            </div>
          }
        >
          <div className="space-y-4 p-4">
            {articles.map(article => (
              <article key={article.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-3">{article.summary}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>By {article.author} • {article.readTime} min read</span>
                  <span>{article.timestamp}</span>
                </div>
              </article>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
};