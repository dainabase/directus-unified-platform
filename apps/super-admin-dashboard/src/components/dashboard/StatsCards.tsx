'use client';

import {
  Card,
  Icon,
  Badge
} from '../../../../packages/ui/src';
import { ArrowUp, ArrowDown, Users, FileText, Activity, Heart } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    activeContent: number;
    apiCalls: number;
    systemHealth: number;
    growth: {
      users: number;
      content: number;
      api: number;
    };
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      growth: stats.growth.users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Active Content',
      value: stats.activeContent.toLocaleString(),
      icon: FileText,
      growth: stats.growth.content,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'API Calls',
      value: stats.apiCalls.toLocaleString(),
      icon: Activity,
      growth: stats.growth.api,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: Heart,
      growth: 0,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isPositive = card.growth > 0;
        const isNeutral = card.growth === 0;
        
        return (
          <Card key={card.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold">
                  {card.value}
                </p>
                {!isNeutral && (
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(card.growth)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </div>
                )}
                {isNeutral && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      Optimal
                    </Badge>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
