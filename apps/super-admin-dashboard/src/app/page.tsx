'use client';

import {
  Card,
  Badge,
  Button,
  Progress,
  Chart,
  DataGrid,
  Alert,
  Icon,
  Skeleton
} from '../../../packages/ui/src';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { useState, useEffect } from 'react';

// Données de démonstration
const mockStats = {
  totalUsers: 1247,
  activeContent: 3842,
  apiCalls: 98432,
  systemHealth: 98.5,
  growth: {
    users: 12.5,
    content: 23.8,
    api: 15.2,
  }
};

const recentActivities = [
  { id: 1, user: 'Admin User', action: 'Created new collection', time: '2 minutes ago', status: 'success' },
  { id: 2, user: 'John Doe', action: 'Updated user permissions', time: '15 minutes ago', status: 'info' },
  { id: 3, user: 'System', action: 'Backup completed', time: '1 hour ago', status: 'success' },
  { id: 4, user: 'Jane Smith', action: 'Published content', time: '2 hours ago', status: 'success' },
  { id: 5, user: 'API Service', action: 'Rate limit exceeded', time: '3 hours ago', status: 'warning' },
];

const chartData = [
  { name: 'Jan', users: 400, content: 240, api: 2400 },
  { name: 'Feb', users: 450, content: 300, api: 2800 },
  { name: 'Mar', users: 520, content: 380, api: 3200 },
  { name: 'Apr', users: 680, content: 420, api: 3900 },
  { name: 'May', users: 890, content: 560, api: 4800 },
  { name: 'Jun', users: 1247, content: 720, api: 5600 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert for important notifications */}
      <Alert variant="info">
        <Icon name="Info" className="h-4 w-4" />
        <div className="ml-2">
          <h4 className="font-semibold">System Update Available</h4>
          <p className="text-sm">Version 2.1.0 is now available. Update includes performance improvements and bug fixes.</p>
        </div>
      </Alert>

      {/* Stats Cards */}
      <StatsCards stats={mockStats} />

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Platform Activity</h3>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setSelectedPeriod('7d')}
              >
                7D
              </Button>
              <Button
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setSelectedPeriod('30d')}
              >
                30D
              </Button>
              <Button
                variant={selectedPeriod === '90d' ? 'default' : 'outline'}
                size="xs"
                onClick={() => setSelectedPeriod('90d')}
              >
                90D
              </Button>
            </div>
          </div>
          <Chart
            type="area"
            data={chartData}
            config={{
              users: { label: 'Users', color: 'hsl(var(--chart-1))' },
              content: { label: 'Content', color: 'hsl(var(--chart-2))' },
              api: { label: 'API Calls', color: 'hsl(var(--chart-3))' },
            }}
            className="h-[300px]"
          />
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm">
              View All
              <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-1">
                  <Badge
                    variant={
                      activity.status === 'success' ? 'success' :
                      activity.status === 'warning' ? 'warning' :
                      'default'
                    }
                    className="w-2 h-2 p-0 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">CPU Usage</span>
              <span className="text-sm font-medium">42%</span>
            </div>
            <Progress value={42} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Memory Usage</span>
              <span className="text-sm font-medium">68%</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Storage Usage</span>
              <span className="text-sm font-medium">35%</span>
            </div>
            <Progress value={35} className="h-2" />
          </div>
        </div>
      </Card>
    </div>
  );
}
