'use client';

import {
  Chart,
  Card,
  Button,
  Select,
  Badge,
  Progress,
  Icon,
  Tabs,
  DataGrid
} from '../../../../packages/ui/src';
import { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

// Mock data for analytics
const trafficData = [
  { date: 'Mon', visits: 2400, unique: 1800, pageViews: 4200 },
  { date: 'Tue', visits: 3200, unique: 2400, pageViews: 5600 },
  { date: 'Wed', visits: 2800, unique: 2100, pageViews: 4900 },
  { date: 'Thu', visits: 3600, unique: 2700, pageViews: 6300 },
  { date: 'Fri', visits: 4200, unique: 3150, pageViews: 7350 },
  { date: 'Sat', visits: 3800, unique: 2850, pageViews: 6650 },
  { date: 'Sun', visits: 3400, unique: 2550, pageViews: 5950 },
];

const contentPerformance = [
  { name: 'Blog Posts', value: 35, growth: 12 },
  { name: 'Landing Pages', value: 28, growth: 8 },
  { name: 'Documentation', value: 22, growth: -3 },
  { name: 'Case Studies', value: 15, growth: 25 },
];

const userEngagement = [
  { metric: 'Avg. Session Duration', value: '4m 32s', change: '+12%', trend: 'up' },
  { metric: 'Bounce Rate', value: '42.3%', change: '-5%', trend: 'down' },
  { metric: 'Pages per Session', value: '3.8', change: '+8%', trend: 'up' },
  { metric: 'Return Visitor Rate', value: '68%', change: '+15%', trend: 'up' },
];

const topPages = [
  { page: '/dashboard', views: 15234, avgTime: '2:45', bounceRate: '25%' },
  { page: '/products', views: 12456, avgTime: '3:12', bounceRate: '35%' },
  { page: '/blog/ai-trends', views: 8934, avgTime: '5:23', bounceRate: '42%' },
  { page: '/documentation', views: 7623, avgTime: '4:56', bounceRate: '38%' },
  { page: '/pricing', views: 6234, avgTime: '1:34', bounceRate: '55%' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState('traffic');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your platform performance and user engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <Select.Trigger className="w-[140px]">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="24h">Last 24 Hours</Select.Item>
              <Select.Item value="7d">Last 7 Days</Select.Item>
              <Select.Item value="30d">Last 30 Days</Select.Item>
              <Select.Item value="90d">Last 90 Days</Select.Item>
              <Select.Item value="12m">Last 12 Months</Select.Item>
            </Select.Content>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userEngagement.map((metric) => (
          <Card key={metric.metric} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{metric.metric}</p>
                <p className="text-2xl font-bold mt-2">{metric.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <Tabs.List className="grid w-full grid-cols-3">
          <Tabs.Trigger value="traffic">
            <BarChart3 className="h-4 w-4 mr-2" />
            Traffic
          </Tabs.Trigger>
          <Tabs.Trigger value="content">
            <PieChart className="h-4 w-4 mr-2" />
            Content
          </Tabs.Trigger>
          <Tabs.Trigger value="realtime">
            <Activity className="h-4 w-4 mr-2" />
            Real-time
          </Tabs.Trigger>
        </Tabs.List>

        {/* Traffic Tab */}
        <Tabs.Content value="traffic" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Website Traffic Overview</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-1" />
                  <span className="text-sm">Visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2" />
                  <span className="text-sm">Unique Visitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-3" />
                  <span className="text-sm">Page Views</span>
                </div>
              </div>
            </div>
            <Chart
              type="line"
              data={trafficData}
              config={{
                visits: { label: 'Visits', color: 'hsl(var(--chart-1))' },
                unique: { label: 'Unique Visitors', color: 'hsl(var(--chart-2))' },
                pageViews: { label: 'Page Views', color: 'hsl(var(--chart-3))' },
              }}
              className="h-[350px]"
            />
          </Card>

          {/* Top Pages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
            <DataGrid
              data={topPages}
              columns={[
                {
                  key: 'page',
                  header: 'Page',
                  cell: (item: any) => (
                    <span className="font-medium">{item.page}</span>
                  ),
                },
                {
                  key: 'views',
                  header: 'Views',
                  cell: (item: any) => (
                    <span>{item.views.toLocaleString()}</span>
                  ),
                },
                {
                  key: 'avgTime',
                  header: 'Avg. Time',
                  cell: (item: any) => (
                    <span className="text-muted-foreground">{item.avgTime}</span>
                  ),
                },
                {
                  key: 'bounceRate',
                  header: 'Bounce Rate',
                  cell: (item: any) => (
                    <Badge variant="outline">{item.bounceRate}</Badge>
                  ),
                },
              ]}
              className="border-0"
            />
          </Card>
        </Tabs.Content>

        {/* Content Tab */}
        <Tabs.Content value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Distribution</h3>
              <Chart
                type="pie"
                data={contentPerformance}
                config={{
                  value: { label: 'Content', color: 'hsl(var(--chart-1))' },
                }}
                className="h-[300px]"
              />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Performance</h3>
              <div className="space-y-4">
                {contentPerformance.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.value}%
                        </span>
                        <Badge 
                          variant={item.growth > 0 ? 'success' : 'destructive'}
                          className="text-xs"
                        >
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Content Engagement Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement by Content Type</h3>
            <Chart
              type="bar"
              data={[
                { type: 'Blog', engagement: 85, shares: 120, comments: 45 },
                { type: 'Video', engagement: 92, shares: 200, comments: 78 },
                { type: 'Infographic', engagement: 78, shares: 150, comments: 23 },
                { type: 'Podcast', engagement: 65, shares: 80, comments: 34 },
              ]}
              config={{
                engagement: { label: 'Engagement Rate', color: 'hsl(var(--chart-1))' },
                shares: { label: 'Shares', color: 'hsl(var(--chart-2))' },
                comments: { label: 'Comments', color: 'hsl(var(--chart-3))' },
              }}
              className="h-[300px]"
            />
          </Card>
        </Tabs.Content>

        {/* Real-time Tab */}
        <Tabs.Content value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Users</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
              <p className="text-4xl font-bold">247</p>
              <p className="text-sm text-muted-foreground mt-2">
                +23% from last hour
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Pages</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">/dashboard</span>
                  <Badge>42 users</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">/products</span>
                  <Badge>38 users</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">/checkout</span>
                  <Badge>24 users</Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Direct</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Search</span>
                    <span>30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Social</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </div>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Activity Feed</h3>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm">
                      User from <strong>New York</strong> visited <strong>/products</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
