---
id: timeline
title: Timeline
sidebar_position: 43
---

import { Timeline } from "@dainabase/ui";

A versatile timeline component for displaying chronological events, project milestones, activity logs, and historical data with various layouts and styles.

## Preview

<ComponentPreview>
  <Timeline
    items={[
      {
        title: "Project Started",
        description: "Initial planning and setup completed",
        date: "2025-01-15",
        icon: "🚀",
        status: "completed"
      },
      {
        title: "Development Phase",
        description: "Core features implementation",
        date: "2025-03-01",
        icon: "💻",
        status: "completed"
      },
      {
        title: "Testing & QA",
        description: "Comprehensive testing in progress",
        date: "2025-06-15",
        icon: "🧪",
        status: "active"
      },
      {
        title: "Launch",
        description: "Public release scheduled",
        date: "2025-09-01",
        icon: "🎉",
        status: "upcoming"
      }
    ]}
  />
</ComponentPreview>

## Features

- 📅 **Multiple Layouts** - Vertical, horizontal, alternating, and compact views
- 🎨 **Customizable Styling** - Themes, colors, icons, and animations
- 📱 **Responsive Design** - Adapts to different screen sizes
- 🔄 **Interactive Elements** - Expandable items, clickable events
- 📊 **Status Indicators** - Progress tracking and state visualization
- 🎯 **Milestone Support** - Highlight important events
- 📝 **Rich Content** - Support for images, videos, and custom content
- ⏱️ **Real-time Updates** - Live timeline with streaming events
- 🔍 **Filtering & Search** - Filter by date, category, or search terms
- ♿ **Accessible** - WCAG 2.1 compliant with keyboard navigation

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Timeline } from "@dainabase/ui";

function BasicTimeline() {
  const events = [
    {
      title: "Event 1",
      description: "First event description",
      date: "2025-01-01",
    },
    {
      title: "Event 2",
      description: "Second event description",
      date: "2025-02-01",
    },
    {
      title: "Event 3",
      description: "Third event description",
      date: "2025-03-01",
    }
  ];

  return <Timeline items={events} />;
}
```

## Examples

### 1. Vertical Timeline

```tsx
import { Timeline } from "@dainabase/ui";

export default function VerticalTimelineExample() {
  const items = [
    {
      id: 1,
      title: "Company Founded",
      description: "Started with a small team of 3 passionate developers",
      date: "2020-01-15",
      icon: "🏢",
      color: "#3B82F6",
      tags: ["milestone", "beginning"]
    },
    {
      id: 2,
      title: "First Product Launch",
      description: "Released our flagship product to the market with great reception",
      date: "2020-06-30",
      icon: "🚀",
      color: "#10B981",
      tags: ["product", "launch"]
    },
    {
      id: 3,
      title: "Series A Funding",
      description: "Raised $5M in Series A funding from top-tier VCs",
      date: "2021-03-15",
      icon: "💰",
      color: "#F59E0B",
      tags: ["funding", "growth"]
    },
    {
      id: 4,
      title: "100 Employees",
      description: "Reached the milestone of 100 team members across 5 departments",
      date: "2022-01-10",
      icon: "👥",
      color: "#8B5CF6",
      tags: ["milestone", "team"]
    },
    {
      id: 5,
      title: "International Expansion",
      description: "Opened offices in London, Tokyo, and Singapore",
      date: "2023-06-01",
      icon: "🌍",
      color: "#EF4444",
      tags: ["expansion", "global"]
    },
    {
      id: 6,
      title: "IPO Announcement",
      description: "Announced plans to go public in Q4 2025",
      date: "2025-08-01",
      icon: "📈",
      color: "#10B981",
      tags: ["milestone", "ipo"],
      status: "active"
    }
  ];

  return (
    <Timeline
      items={items}
      layout="vertical"
      showConnector={true}
      showDate={true}
      dateFormat="MMM DD, YYYY"
      animated={true}
      className="max-w-3xl mx-auto"
    />
  );
}
```

### 2. Horizontal Timeline

```tsx
import { Timeline } from "@dainabase/ui";
import { useState } from "react";

export default function HorizontalTimelineExample() {
  const [activeIndex, setActiveIndex] = useState(2);
  
  const projectPhases = [
    {
      title: "Planning",
      description: "Requirements gathering and analysis",
      date: "Week 1-2",
      status: "completed",
      progress: 100
    },
    {
      title: "Design",
      description: "UI/UX design and prototyping",
      date: "Week 3-4",
      status: "completed",
      progress: 100
    },
    {
      title: "Development",
      description: "Frontend and backend implementation",
      date: "Week 5-8",
      status: "active",
      progress: 65
    },
    {
      title: "Testing",
      description: "QA and bug fixes",
      date: "Week 9-10",
      status: "upcoming",
      progress: 0
    },
    {
      title: "Deployment",
      description: "Production release",
      date: "Week 11",
      status: "upcoming",
      progress: 0
    }
  ];

  return (
    <div className="w-full overflow-x-auto">
      <Timeline
        items={projectPhases}
        layout="horizontal"
        activeIndex={activeIndex}
        onItemClick={(index) => setActiveIndex(index)}
        showProgress={true}
        connectorStyle="gradient"
        itemWidth={200}
        height={120}
      />
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">
          {projectPhases[activeIndex].title}
        </h3>
        <p className="text-gray-600 mb-2">
          {projectPhases[activeIndex].description}
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {projectPhases[activeIndex].date}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            projectPhases[activeIndex].status === 'completed' ? 'bg-green-100 text-green-800' :
            projectPhases[activeIndex].status === 'active' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-600'
          }`}>
            {projectPhases[activeIndex].status}
          </span>
          {projectPhases[activeIndex].progress > 0 && (
            <span className="text-sm font-medium">
              {projectPhases[activeIndex].progress}% Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. Alternating Timeline

```tsx
import { Timeline } from "@dainabase/ui";

export default function AlternatingTimelineExample() {
  const historicalEvents = [
    {
      title: "Product Ideation",
      description: "Initial brainstorming sessions with the founding team to identify market gaps and opportunities.",
      date: "January 2023",
      side: "left",
      image: "/images/ideation.jpg",
      category: "planning"
    },
    {
      title: "Market Research",
      description: "Conducted extensive market research, user interviews, and competitive analysis.",
      date: "March 2023",
      side: "right",
      image: "/images/research.jpg",
      category: "research"
    },
    {
      title: "MVP Development",
      description: "Built the minimum viable product with core features based on user feedback.",
      date: "June 2023",
      side: "left",
      image: "/images/development.jpg",
      category: "development"
    },
    {
      title: "Beta Testing",
      description: "Launched private beta with 100 early adopters, gathering valuable feedback.",
      date: "September 2023",
      side: "right",
      image: "/images/beta.jpg",
      category: "testing"
    },
    {
      title: "Public Launch",
      description: "Official product launch with full feature set and marketing campaign.",
      date: "December 2023",
      side: "left",
      image: "/images/launch.jpg",
      category: "launch"
    },
    {
      title: "Scale & Growth",
      description: "Rapid user growth, feature expansion, and team scaling.",
      date: "March 2024",
      side: "right",
      image: "/images/growth.jpg",
      category: "growth"
    }
  ];

  return (
    <Timeline
      items={historicalEvents}
      layout="alternating"
      showImages={true}
      connectorStyle="dashed"
      itemSpacing={60}
      centerLine={true}
      categoryColors={{
        planning: "#3B82F6",
        research: "#8B5CF6",
        development: "#10B981",
        testing: "#F59E0B",
        launch: "#EF4444",
        growth: "#06B6D4"
      }}
    />
  );
}
```

### 4. Activity Timeline

```tsx
import { Timeline, Avatar } from "@dainabase/ui";
import { useState, useEffect } from "react";

export default function ActivityTimelineExample() {
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: "/avatars/john.jpg",
        role: "Developer"
      },
      action: "pushed code",
      target: "main branch",
      description: "Fixed critical bug in payment processing",
      timestamp: "2025-08-13T10:30:00Z",
      type: "code"
    },
    {
      id: 2,
      user: {
        name: "Jane Smith",
        avatar: "/avatars/jane.jpg",
        role: "Designer"
      },
      action: "uploaded designs",
      target: "Project X",
      description: "New dashboard mockups v2.0",
      timestamp: "2025-08-13T09:15:00Z",
      type: "design"
    },
    {
      id: 3,
      user: {
        name: "Mike Johnson",
        avatar: "/avatars/mike.jpg",
        role: "PM"
      },
      action: "created task",
      target: "Sprint 15",
      description: "Implement user authentication flow",
      timestamp: "2025-08-13T08:45:00Z",
      type: "task"
    },
    {
      id: 4,
      user: {
        name: "Sarah Wilson",
        avatar: "/avatars/sarah.jpg",
        role: "QA"
      },
      action: "reported bug",
      target: "Issue #234",
      description: "Login button not responsive on mobile",
      timestamp: "2025-08-13T07:30:00Z",
      type: "bug"
    }
  ]);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'code': return '💻';
      case 'design': return '🎨';
      case 'task': return '📋';
      case 'bug': return '🐛';
      default: return '📌';
    }
  };

  const timelineItems = activities.map(activity => ({
    id: activity.id,
    title: (
      <div className="flex items-center gap-3">
        <Avatar
          src={activity.user.avatar}
          alt={activity.user.name}
          size="sm"
        />
        <div>
          <span className="font-semibold">{activity.user.name}</span>
          <span className="mx-2 text-gray-500">{activity.action}</span>
          <span className="font-medium text-blue-600">{activity.target}</span>
        </div>
      </div>
    ),
    description: activity.description,
    date: getRelativeTime(activity.timestamp),
    icon: getActivityIcon(activity.type),
    color: {
      code: "#3B82F6",
      design: "#8B5CF6",
      task: "#10B981",
      bug: "#EF4444"
    }[activity.type]
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Activity</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Filter
        </button>
      </div>
      
      <Timeline
        items={timelineItems}
        layout="vertical"
        compact={true}
        showConnector={true}
        connectorStyle="solid"
        animated={true}
      />
      
      <div className="mt-6 text-center">
        <button className="text-blue-600 hover:text-blue-700">
          Load more activities
        </button>
      </div>
    </div>
  );
}
```

### 5. Milestone Timeline

```tsx
import { Timeline, Progress } from "@dainabase/ui";

export default function MilestoneTimelineExample() {
  const milestones = [
    {
      id: 1,
      title: "🎯 Q1 Goals",
      description: "Launch MVP and acquire first 100 users",
      date: "March 31, 2025",
      progress: 100,
      status: "completed",
      metrics: [
        { label: "Users Acquired", value: "127", target: "100" },
        { label: "Revenue", value: "$15K", target: "$10K" },
        { label: "Features Shipped", value: "12", target: "10" }
      ]
    },
    {
      id: 2,
      title: "🚀 Q2 Goals",
      description: "Scale to 1000 users and launch premium features",
      date: "June 30, 2025",
      progress: 100,
      status: "completed",
      metrics: [
        { label: "Users Acquired", value: "1,247", target: "1,000" },
        { label: "Revenue", value: "$85K", target: "$50K" },
        { label: "Features Shipped", value: "8", target: "8" }
      ]
    },
    {
      id: 3,
      title: "📈 Q3 Goals",
      description: "Reach $500K ARR and expand to new markets",
      date: "September 30, 2025",
      progress: 65,
      status: "active",
      metrics: [
        { label: "ARR", value: "$320K", target: "$500K" },
        { label: "Markets", value: "3", target: "5" },
        { label: "Team Size", value: "25", target: "30" }
      ]
    },
    {
      id: 4,
      title: "🌟 Q4 Goals",
      description: "Series A preparation and enterprise features",
      date: "December 31, 2025",
      progress: 0,
      status: "upcoming",
      metrics: [
        { label: "ARR Target", value: "-", target: "$1M" },
        { label: "Enterprise Clients", value: "-", target: "10" },
        { label: "Team Size", value: "-", target: "50" }
      ]
    }
  ];

  return (
    <Timeline
      items={milestones}
      layout="vertical"
      renderItem={(item) => (
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
              <p className="text-sm text-gray-500 mt-2">{item.date}</p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              item.status === 'completed' ? 'bg-green-100 text-green-800' :
              item.status === 'active' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {item.status}
            </span>
          </div>
          
          <Progress value={item.progress} className="mb-4" />
          
          <div className="grid grid-cols-3 gap-4">
            {item.metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.label}</p>
                <p className="text-xs text-gray-400">Target: {metric.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
}
```

### 6. Roadmap Timeline

```tsx
import { Timeline } from "@dainabase/ui";
import { useState } from "react";

export default function RoadmapTimelineExample() {
  const [filter, setFilter] = useState("all");
  
  const roadmapItems = [
    {
      quarter: "Q1 2025",
      title: "Foundation",
      status: "completed",
      category: "infrastructure",
      features: [
        { name: "Core API", status: "done" },
        { name: "Authentication", status: "done" },
        { name: "Database Setup", status: "done" }
      ]
    },
    {
      quarter: "Q2 2025",
      title: "Core Features",
      status: "completed",
      category: "features",
      features: [
        { name: "User Dashboard", status: "done" },
        { name: "Analytics", status: "done" },
        { name: "Reporting", status: "done" }
      ]
    },
    {
      quarter: "Q3 2025",
      title: "Advanced Features",
      status: "active",
      category: "features",
      features: [
        { name: "AI Integration", status: "in-progress" },
        { name: "Advanced Analytics", status: "in-progress" },
        { name: "API v2", status: "planned" }
      ]
    },
    {
      quarter: "Q4 2025",
      title: "Scale & Optimize",
      status: "upcoming",
      category: "optimization",
      features: [
        { name: "Performance Optimization", status: "planned" },
        { name: "Global CDN", status: "planned" },
        { name: "Enterprise Features", status: "planned" }
      ]
    }
  ];

  const filteredItems = filter === "all" 
    ? roadmapItems 
    : roadmapItems.filter(item => item.category === filter);

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {["all", "infrastructure", "features", "optimization"].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded capitalize ${
              filter === cat 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <Timeline
        items={filteredItems.map(item => ({
          title: (
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">{item.quarter}</span>
              <span className="text-xl">{item.title}</span>
            </div>
          ),
          description: (
            <div className="mt-3 space-y-2">
              {item.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    feature.status === 'done' ? 'bg-green-500' :
                    feature.status === 'in-progress' ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`} />
                  <span className={
                    feature.status === 'done' ? 'line-through text-gray-400' : ''
                  }>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          ),
          status: item.status,
          color: {
            infrastructure: "#8B5CF6",
            features: "#3B82F6",
            optimization: "#10B981"
          }[item.category]
        }))}
        layout="vertical"
        animated={true}
      />
    </div>
  );
}
```

### 7. Process Timeline

```tsx
import { Timeline } from "@dainabase/ui";

export default function ProcessTimelineExample() {
  const orderProcess = [
    {
      step: 1,
      title: "Order Placed",
      description: "Your order has been received and is being processed",
      icon: "🛒",
      timestamp: "Aug 13, 10:30 AM",
      status: "completed",
      details: {
        orderId: "#ORD-2025-001234",
        items: 3,
        total: "$149.99"
      }
    },
    {
      step: 2,
      title: "Payment Confirmed",
      description: "Payment has been successfully processed",
      icon: "💳",
      timestamp: "Aug 13, 10:32 AM",
      status: "completed",
      details: {
        method: "Credit Card",
        last4: "4242"
      }
    },
    {
      step: 3,
      title: "Order Preparing",
      description: "Your items are being packed for shipment",
      icon: "📦",
      timestamp: "Aug 13, 11:45 AM",
      status: "completed",
      details: {
        warehouse: "Warehouse A",
        packingTime: "1 hour"
      }
    },
    {
      step: 4,
      title: "Shipped",
      description: "Your order is on its way",
      icon: "🚚",
      timestamp: "Aug 13, 2:00 PM",
      status: "active",
      details: {
        carrier: "FedEx",
        trackingNumber: "1234567890",
        estimatedDelivery: "Aug 15, 2025"
      }
    },
    {
      step: 5,
      title: "Out for Delivery",
      description: "Your package is with the delivery driver",
      icon: "📍",
      timestamp: "Expected: Aug 15, 9:00 AM",
      status: "upcoming"
    },
    {
      step: 6,
      title: "Delivered",
      description: "Your order has been delivered",
      icon: "✅",
      timestamp: "Expected: Aug 15, 2:00 PM",
      status: "upcoming"
    }
  ];

  return (
    <Timeline
      items={orderProcess}
      layout="vertical"
      renderItem={(item) => (
        <div className={`p-4 rounded-lg border-2 ${
          item.status === 'completed' ? 'border-green-500 bg-green-50' :
          item.status === 'active' ? 'border-blue-500 bg-blue-50' :
          'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">
                  Step {item.step}: {item.title}
                </h4>
                <span className="text-sm text-gray-500">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{item.description}</p>
              
              {item.details && (
                <div className="mt-3 p-3 bg-white rounded border">
                  {Object.entries(item.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      showConnector={true}
      connectorStyle="dotted"
    />
  );
}
```

### 8. Educational Timeline

```tsx
import { Timeline, Badge } from "@dainabase/ui";

export default function EducationalTimelineExample() {
  const curriculum = [
    {
      module: "Module 1",
      title: "Introduction to React",
      duration: "2 weeks",
      status: "completed",
      lessons: [
        { name: "React Basics", duration: "2h", completed: true },
        { name: "Components & Props", duration: "3h", completed: true },
        { name: "State & Lifecycle", duration: "3h", completed: true },
        { name: "Handling Events", duration: "2h", completed: true }
      ],
      skills: ["JSX", "Components", "Props", "State"]
    },
    {
      module: "Module 2",
      title: "Advanced React Patterns",
      duration: "3 weeks",
      status: "active",
      progress: 60,
      lessons: [
        { name: "Hooks Deep Dive", duration: "4h", completed: true },
        { name: "Context API", duration: "3h", completed: true },
        { name: "Custom Hooks", duration: "3h", completed: false },
        { name: "Performance Optimization", duration: "4h", completed: false }
      ],
      skills: ["Hooks", "Context", "Optimization"]
    },
    {
      module: "Module 3",
      title: "State Management",
      duration: "2 weeks",
      status: "upcoming",
      lessons: [
        { name: "Redux Fundamentals", duration: "4h", completed: false },
        { name: "Redux Toolkit", duration: "3h", completed: false },
        { name: "Zustand", duration: "2h", completed: false },
        { name: "State Patterns", duration: "3h", completed: false }
      ],
      skills: ["Redux", "Zustand", "State Patterns"]
    }
  ];

  return (
    <Timeline
      items={curriculum}
      layout="vertical"
      renderItem={(item) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {item.module}: {item.title}
                {item.status === 'completed' && (
                  <span className="text-green-500">✓</span>
                )}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Duration: {item.duration}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              item.status === 'completed' ? 'bg-green-100 text-green-800' :
              item.status === 'active' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {item.status}
            </span>
          </div>
          
          {item.progress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2 mb-4">
            {item.lessons.map((lesson, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={lesson.completed}
                    readOnly
                    className="rounded"
                  />
                  <span className={lesson.completed ? 'line-through text-gray-400' : ''}>
                    {lesson.name}
                  </span>
                </div>
                <span className="text-gray-500">{lesson.duration}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {item.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
      showConnector={true}
    />
  );
}
```

### 9. Changelog Timeline

```tsx
import { Timeline } from "@dainabase/ui";

export default function ChangelogTimelineExample() {
  const changelog = [
    {
      version: "v2.5.0",
      date: "August 13, 2025",
      type: "major",
      title: "Major Feature Release",
      changes: {
        features: [
          "Added AI-powered code suggestions",
          "New dashboard with real-time analytics",
          "Multi-language support (10+ languages)"
        ],
        improvements: [
          "50% faster build times",
          "Reduced bundle size by 30%",
          "Enhanced mobile responsiveness"
        ],
        fixes: [
          "Fixed memory leak in data processing",
          "Resolved authentication timeout issues"
        ]
      }
    },
    {
      version: "v2.4.2",
      date: "July 28, 2025",
      type: "patch",
      title: "Bug Fixes & Performance",
      changes: {
        improvements: [
          "Optimized database queries",
          "Improved error handling"
        ],
        fixes: [
          "Fixed date picker localization",
          "Resolved export functionality bug",
          "Fixed tooltip positioning on mobile"
        ]
      }
    },
    {
      version: "v2.4.0",
      date: "July 15, 2025",
      type: "minor",
      title: "New Features & Enhancements",
      changes: {
        features: [
          "Dark mode support",
          "CSV import/export functionality",
          "Advanced filtering options"
        ],
        improvements: [
          "Updated UI components library",
          "Better keyboard navigation"
        ]
      }
    }
  ];

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Timeline
      items={changelog}
      layout="vertical"
      renderItem={(item) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-bold rounded ${getVersionBadgeColor(item.type)}`}>
                {item.version}
              </span>
              <h3 className="text-xl font-bold">{item.title}</h3>
            </div>
            <span className="text-sm text-gray-500">{item.date}</span>
          </div>
          
          <div className="space-y-4">
            {item.changes.features && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2">✨ New Features</h4>
                <ul className="space-y-1">
                  {item.changes.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {item.changes.improvements && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">💪 Improvements</h4>
                <ul className="space-y-1">
                  {item.changes.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {item.changes.fixes && (
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">🐛 Bug Fixes</h4>
                <ul className="space-y-1">
                  {item.changes.fixes.map((fix, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      showConnector={true}
      connectorStyle="gradient"
    />
  );
}
```

### 10. Social Media Timeline

```tsx
import { Timeline, Avatar } from "@dainabase/ui";
import { useState } from "react";

export default function SocialTimelineExample() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "Alex Chen",
        username: "@alexchen",
        avatar: "/avatars/alex.jpg",
        verified: true
      },
      content: "Just launched our new product! 🚀 Excited to see what everyone thinks. Check it out at product.com",
      timestamp: "2h ago",
      engagement: {
        likes: 245,
        comments: 32,
        shares: 18
      },
      media: {
        type: "image",
        url: "/images/product-launch.jpg"
      }
    },
    {
      id: 2,
      author: {
        name: "Sarah Miller",
        username: "@sarahmiller",
        avatar: "/avatars/sarah.jpg",
        verified: false
      },
      content: "Great insights from today's conference on AI and the future of work. Key takeaway: adaptability is everything! 🤖💡",
      timestamp: "5h ago",
      engagement: {
        likes: 156,
        comments: 24,
        shares: 8
      }
    },
    {
      id: 3,
      author: {
        name: "Tech News",
        username: "@technews",
        avatar: "/avatars/technews.jpg",
        verified: true
      },
      content: "BREAKING: Major tech company announces groundbreaking AI model that can understand and generate code in 50+ programming languages.",
      timestamp: "8h ago",
      engagement: {
        likes: 1024,
        comments: 156,
        shares: 432
      },
      media: {
        type: "link",
        title: "Revolutionary AI Model Announced",
        description: "Learn more about the latest breakthrough in AI technology",
        thumbnail: "/images/ai-news.jpg"
      }
    }
  ]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, engagement: { ...post.engagement, likes: post.engagement.likes + 1 } }
        : post
    ));
  };

  return (
    <Timeline
      items={posts}
      layout="vertical"
      renderItem={(post) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-start gap-3 mb-4">
            <Avatar
              src={post.author.avatar}
              alt={post.author.name}
              size="md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.name}</span>
                {post.author.verified && (
                  <span className="text-blue-500">✓</span>
                )}
                <span className="text-gray-500 text-sm">{post.author.username}</span>
              </div>
              <span className="text-gray-400 text-sm">{post.timestamp}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">⋯</button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-800">{post.content}</p>
          </div>
          
          {post.media && post.media.type === 'image' && (
            <div className="mb-4">
              <img 
                src={post.media.url} 
                alt=""
                className="w-full rounded-lg"
              />
            </div>
          )}
          
          {post.media && post.media.type === 'link' && (
            <div className="mb-4 p-4 border rounded-lg">
              <h4 className="font-semibold">{post.media.title}</h4>
              <p className="text-sm text-gray-600">{post.media.description}</p>
            </div>
          )}
          
          <div className="flex items-center gap-6 pt-4 border-t">
            <button 
              onClick={() => handleLike(post.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500"
            >
              <span>❤️</span>
              <span className="text-sm">{post.engagement.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
              <span>💬</span>
              <span className="text-sm">{post.engagement.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-green-500">
              <span>🔄</span>
              <span className="text-sm">{post.engagement.shares}</span>
            </button>
            <button className="ml-auto text-gray-600 hover:text-blue-500">
              <span>🔖</span>
            </button>
          </div>
        </div>
      )}
      spacing={24}
      showConnector={false}
    />
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | `[]` | Array of timeline items |
| `layout` | `"vertical" \| "horizontal" \| "alternating"` | `"vertical"` | Timeline layout |
| `showConnector` | `boolean` | `true` | Show connector lines between items |
| `connectorStyle` | `"solid" \| "dashed" \| "dotted" \| "gradient"` | `"solid"` | Connector line style |
| `showDate` | `boolean` | `true` | Show date/time for items |
| `dateFormat` | `string` | `"MMM DD, YYYY"` | Date format string |
| `animated` | `boolean` | `false` | Enable animations |
| `compact` | `boolean` | `false` | Use compact spacing |
| `centerLine` | `boolean` | `false` | Center the timeline line |
| `activeIndex` | `number` | `undefined` | Active item index (controlled) |
| `onItemClick` | `(index: number) => void` | `undefined` | Item click handler |
| `renderItem` | `(item: TimelineItem) => ReactNode` | `undefined` | Custom item renderer |
| `itemSpacing` | `number` | `32` | Spacing between items in pixels |
| `itemWidth` | `number` | `undefined` | Width of items (horizontal layout) |
| `height` | `number` | `undefined` | Height (horizontal layout) |
| `showProgress` | `boolean` | `false` | Show progress indicators |
| `showImages` | `boolean` | `false` | Show item images |
| `categoryColors` | `Record<string, string>` | `{}` | Category color mapping |
| `className` | `string` | `undefined` | Additional CSS classes |
| `spacing` | `number` | `undefined` | Custom spacing between items |
| `orientation` | `"left" \| "right" \| "center"` | `"left"` | Content orientation |
| `lineWidth` | `number` | `2` | Connector line width |
| `lineColor` | `string` | `undefined` | Connector line color |
| `nodeSize` | `number` | `12` | Timeline node size |
| `nodeStyle` | `"circle" \| "square" \| "diamond"` | `"circle"` | Node shape style |

## Accessibility

The Timeline component follows WCAG 2.1 Level AA guidelines:

- **Semantic Structure**: Uses proper heading hierarchy
- **Keyboard Navigation**: Full keyboard support with Tab
- **Screen Readers**: ARIA labels and descriptions
- **Focus Management**: Clear focus indicators
- **Time Formats**: Accessible date/time formats

## Best Practices

### Do's ✅

- **Keep content concise** for better readability
- **Use consistent date formats** across items
- **Provide clear status indicators** for process timelines
- **Include icons or images** for visual interest
- **Group related items** logically
- **Use appropriate layouts** for content type
- **Test responsive behavior** on mobile
- **Consider loading states** for dynamic content

### Don'ts ❌

- **Don't overload** with too many items at once
- **Don't use tiny fonts** for dates/descriptions
- **Don't rely only on color** for status
- **Don't ignore mobile** layouts
- **Don't skip animation** performance testing
- **Don't forget loading states** for async data
- **Don't make items too dense** without spacing
- **Don't use without proper** time indicators

## Use Cases

1. **Project Management** - Milestones and deliverables
2. **Order Tracking** - Shipment and delivery status
3. **Activity Feeds** - User actions and events
4. **Change Logs** - Software version history
5. **Educational** - Course progress and curriculum
6. **Historical Events** - Company or product history
7. **Process Flows** - Step-by-step procedures
8. **Social Media** - Posts and updates feed
9. **Roadmaps** - Product development plans
10. **Audit Trails** - System logs and changes

## Performance Considerations

- **Virtualize long timelines** (> 100 items)
- **Lazy load images** and media content
- **Debounce scroll events** for animations
- **Use CSS transforms** for smooth animations
- **Memoize custom renderers** for performance
- **Paginate or infinite scroll** for large datasets

## Related Components

- [Stepper](./stepper) - Step-by-step navigation
- [Progress](./progress) - Progress indicators
- [Card](./card) - Content containers
- [Badge](./badge) - Status indicators
- [Avatar](./avatar) - User representations