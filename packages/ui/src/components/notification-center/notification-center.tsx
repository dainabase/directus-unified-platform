import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Filter,
  Settings,
  Volume2,
  VolumeX,
  ExternalLink,
  Clock,
  User,
  ChevronDown,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Badge } from '../badge';
import { Card } from '../card';
import { ScrollArea } from '../scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Switch } from '../switch';
import { Label } from '../label';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface NotificationAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

export interface NotificationMeta {
  sender?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  category?: string;
  tags?: string[];
  url?: string;
  relatedId?: string;
  relatedType?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  status: NotificationStatus;
  priority?: NotificationPriority;
  actions?: NotificationAction[];
  meta?: NotificationMeta;
  persistent?: boolean;
  sound?: boolean;
  vibrate?: boolean;
}

export interface NotificationGroup {
  id: string;
  name: string;
  notifications: Notification[];
  collapsed?: boolean;
}

export interface NotificationPreferences {
  sound: boolean;
  vibrate: boolean;
  desktop: boolean;
  groupByCategory: boolean;
  showTimestamps: boolean;
  autoMarkAsRead: boolean;
  autoArchiveAfterDays?: number;
}

export interface NotificationCenterProps {
  notifications?: Notification[];
  groups?: NotificationGroup[];
  preferences?: NotificationPreferences;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  onNotificationAction?: (notificationId: string, actionId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onArchive?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
  onRefresh?: () => void;
  maxHeight?: number | string;
  showSearch?: boolean;
  showFilters?: boolean;
  showPreferences?: boolean;
  emptyStateMessage?: string;
  className?: string;
  realtime?: boolean;
  wsUrl?: string;
}

// Helper functions
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4" />;
    case 'success':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'system':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return 'text-blue-500';
    case 'success':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    case 'system':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};

const getPriorityBadge = (priority: NotificationPriority) => {
  const variants: Record<NotificationPriority, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600'
  };
  
  return (
    <Badge className={cn('text-xs', variants[priority])}>
      {priority}
    </Badge>
  );
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return date.toLocaleDateString();
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Notification Center Component
 * 
 * A comprehensive notification management system with real-time updates,
 * grouping, filtering, and user preferences.
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications: initialNotifications = [],
  groups: initialGroups = [],
  preferences: initialPreferences = {
    sound: true,
    vibrate: true,
    desktop: true,
    groupByCategory: false,
    showTimestamps: true,
    autoMarkAsRead: false
  },
  onNotificationClick,
  onNotificationDismiss,
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  onPreferencesChange,
  onRefresh,
  maxHeight = 600,
  showSearch = true,
  showFilters = true,
  showPreferences = true,
  emptyStateMessage = 'No notifications',
  className,
  realtime = false,
  wsUrl
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [groups, setGroups] = useState<NotificationGroup[]>(initialGroups);
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined' && preferences.sound) {
      audioRef.current = new Audio('/notification-sound.mp3');
    }
  }, [preferences.sound]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (realtime && wsUrl) {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const notification: Notification = JSON.parse(event.data);
        handleNewNotification(notification);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return () => {
        wsRef.current?.close();
      };
    }
  }, [realtime, wsUrl]);

  // Handle new notification
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Play sound if enabled
    if (preferences.sound && audioRef.current) {
      audioRef.current.play().catch(e => console.error('Failed to play sound:', e));
    }
    
    // Vibrate if enabled and supported
    if (preferences.vibrate && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
    
    // Show desktop notification if enabled
    if (preferences.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png',
        tag: notification.id
      });
    }
  }, [preferences]);

  // Request notification permission
  useEffect(() => {
    if (preferences.desktop && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [preferences.desktop]);

  // Auto-archive old notifications
  useEffect(() => {
    if (preferences.autoArchiveAfterDays) {
      const archiveThreshold = new Date();
      archiveThreshold.setDate(archiveThreshold.getDate() - preferences.autoArchiveAfterDays);
      
      setNotifications(prev => prev.map(notif => {
        if (notif.timestamp < archiveThreshold && notif.status !== 'archived') {
          return { ...notif, status: 'archived' };
        }
        return notif;
      }));
    }
  }, [preferences.autoArchiveAfterDays]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    
    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => n.status === 'unread');
    } else if (activeTab === 'archived') {
      filtered = filtered.filter(n => n.status === 'archived');
    } else {
      filtered = filtered.filter(n => n.status !== 'archived');
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }
    
    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }
    
    // Sort by timestamp
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return filtered;
  }, [notifications, activeTab, searchQuery, selectedType, selectedPriority]);

  // Group notifications by category if enabled
  const groupedNotifications = useMemo(() => {
    if (!preferences.groupByCategory) {
      return null;
    }
    
    const grouped: Record<string, Notification[]> = {};
    
    filteredNotifications.forEach(notif => {
      const category = notif.meta?.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(notif);
    });
    
    return grouped;
  }, [filteredNotifications, preferences.groupByCategory]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.status === 'unread').length;
  }, [notifications]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read if auto-mark is enabled
    if (preferences.autoMarkAsRead && notification.status === 'unread') {
      setNotifications(prev => prev.map(n =>
        n.id === notification.id ? { ...n, status: 'read' } : n
      ));
      onMarkAsRead?.(notification.id);
    }
    
    onNotificationClick?.(notification);
  }, [preferences.autoMarkAsRead, onNotificationClick, onMarkAsRead]);

  // Handle mark as read
  const handleMarkAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, status: 'read' } : n
    ));
    onMarkAsRead?.(notificationId);
  }, [onMarkAsRead]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n =>
      n.status === 'unread' ? { ...n, status: 'read' } : n
    ));
    onMarkAllAsRead?.();
  }, [onMarkAllAsRead]);

  // Handle archive
  const handleArchive = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, status: 'archived' } : n
    ));
    onArchive?.(notificationId);
  }, [onArchive]);

  // Handle delete
  const handleDelete = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    onDelete?.(notificationId);
  }, [onDelete]);

  // Handle preferences change
  const handlePreferencesChange = useCallback((newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  }, [onPreferencesChange]);

  // Render single notification
  const renderNotification = (notification: Notification) => {
    const isUnread = notification.status === 'unread';
    
    return (
      <div
        key={notification.id}
        className={cn(
          "group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b",
          isUnread && "bg-blue-50/50 dark:bg-blue-900/10",
          notification.status === 'archived' && "opacity-60"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "mt-1 flex-shrink-0",
            getNotificationColor(notification.type)
          )}>
            {getNotificationIcon(notification.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "text-sm font-medium",
                    isUnread && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  {notification.priority && getPriorityBadge(notification.priority)}
                  {notification.meta?.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
                
                {/* Meta info */}
                {notification.meta && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {notification.meta.sender && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{notification.meta.sender.name}</span>
                      </div>
                    )}
                    {notification.meta.category && (
                      <span>{notification.meta.category}</span>
                    )}
                    {notification.meta.url && (
                      <a
                        href={notification.meta.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View</span>
                      </a>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actions.map(action => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant={action.variant === 'primary' ? 'default' : 
                                action.variant === 'danger' ? 'destructive' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                          onNotificationAction?.(notification.id, action.id);
                        }}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Timestamp & Actions */}
              <div className="flex items-start gap-2">
                {preferences.showTimestamps && (
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isUnread && (
                      <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    {notification.status !== 'archived' && (
                      <DropdownMenuItem onClick={() => handleArchive(notification.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        
        {/* Unread indicator */}
        {isUnread && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
        )}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {/* Notification Panel */}
      {isOpen && (
        <Card className={cn(
          "absolute right-0 top-12 w-96 shadow-lg z-50",
          "max-h-[600px] overflow-hidden"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {showPreferences && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferencesDialog(true)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex-1">
                Archived
              </TabsTrigger>
            </TabsList>
            
            {/* Filters */}
            {showFilters && (
              <div className="p-3 border-b bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <select
                    className="text-sm px-2 py-1 border rounded"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                  >
                    <option value="all">All Types</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="system">System</option>
                  </select>
                  
                  <select
                    className="text-sm px-2 py-1 border rounded"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="ml-auto"
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Notifications List */}
            <ScrollArea className="h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mb-3 opacity-20" />
                  <p>{emptyStateMessage}</p>
                </div>
              ) : (
                <div>
                  {preferences.groupByCategory && groupedNotifications ? (
                    // Grouped view
                    Object.entries(groupedNotifications).map(([category, notifs]) => (
                      <div key={category}>
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                          {category} ({notifs.length})
                        </div>
                        {notifs.map(renderNotification)}
                      </div>
                    ))
                  ) : (
                    // Flat view
                    filteredNotifications.map(renderNotification)
                  )}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </Card>
      )}
      
      {/* Preferences Dialog */}
      {showPreferencesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound</Label>
                <Switch
                  id="sound"
                  checked={preferences.sound}
                  onCheckedChange={(checked) => 
                    handlePreferencesChange({ ...preferences, sound: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vibrate">Vibration</Label>
                <Switch
                  id="vibrate"
                  checked={preferences.vibrate}
                  onCheckedChange={(checked) => 
                    handlePreferencesChange({ ...preferences, vibrate: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="desktop">Desktop Notifications</Label>
                <Switch
                  id="desktop"
                  checked={preferences.desktop}
                  onCheckedChange={(checked) => 
                    handlePreferencesChange({ ...preferences, desktop: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="group">Group by Category</Label>
                <Switch
                  id="group"
                  checked={preferences.groupByCategory}
                  onCheckedChange={(checked) => 
                    handlePreferencesChange({ ...preferences, groupByCategory: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="timestamps">Show Timestamps</Label>
                <Switch
                  id="timestamps"
                  checked={preferences.showTimestamps}
                  onCheckedChange={(checked) => 
                    handlePreferencesChange({ ...preferences, showTimestamps: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="autoread">Auto Mark as Read</Label>
                <Switch
                  id="autoread"
                  checked={preferences.autoMarkAsRead}
                  onCheckedChange={(checked) => 
                    handlePreferencesChange({ ...preferences, autoMarkAsRead: checked })
                  }
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPreferencesDialog(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;