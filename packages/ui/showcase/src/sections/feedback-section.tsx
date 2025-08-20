// 🎯 FEEDBACK SECTION - ALERTS, TOASTS & NOTIFICATIONS SHOWCASE
// Demonstrates feedback components for user communication

import React, { useState } from 'react';
import { 
  Alert,
  Toast,
  Badge,
  Progress,
  Skeleton,
  Sonner,
  Tooltip,
  HoverCard,
  Popover
} from '../components';
import { 
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Bell,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Loader2
} from 'lucide-react';

// =================== DEMO COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-2">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ComponentDemo = ({ 
  title, 
  description, 
  children, 
  fullWidth = false 
}: { 
  title: string, 
  description: string, 
  children: React.ReactNode,
  fullWidth?: boolean
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className={fullWidth ? "w-full space-y-4" : "flex flex-wrap gap-4"}>
        {children}
      </div>
    </div>
  </div>
);

// =================== MAIN FEEDBACK SECTION ===================

export const FeedbackSection = () => {
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(65);
  const [loading, setLoading] = useState(false);

  const triggerToast = (type: string) => {
    // Toast notification logic
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const alertVariants = [
    { 
      type: 'success', 
      icon: CheckCircle, 
      title: 'Success!',
      message: 'Your changes have been saved successfully.',
      color: 'green'
    },
    { 
      type: 'error', 
      icon: XCircle, 
      title: 'Error!',
      message: 'Something went wrong. Please try again.',
      color: 'red'
    },
    { 
      type: 'warning', 
      icon: AlertTriangle, 
      title: 'Warning!',
      message: 'This action cannot be undone.',
      color: 'yellow'
    },
    { 
      type: 'info', 
      icon: Info, 
      title: 'Information',
      message: 'New features are now available.',
      color: 'blue'
    }
  ];

  const badgeVariants = [
    { label: 'New', variant: 'default' as const },
    { label: 'Success', variant: 'success' as const },
    { label: 'Warning', variant: 'warning' as const },
    { label: 'Error', variant: 'destructive' as const },
    { label: 'Info', variant: 'secondary' as const },
    { label: 'Premium', variant: 'outline' as const }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Feedback & Notifications
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Comprehensive feedback system with alerts, toasts, badges, progress indicators,
          and loading states for clear user communication.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={Bell} value="9+" label="Components" />
          <StatCard icon={Sparkles} value="Animated" label="Feedback" />
          <StatCard icon={Shield} value="A11Y" label="Compliant" />
          <StatCard icon={Zap} value="Real-time" label="Updates" />
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Alert Components */}
        <ComponentDemo
          title="Alert Messages"
          description="Contextual feedback messages with different severity levels"
          fullWidth
        >
          <div className="space-y-3 w-full">
            {alertVariants.map((alert) => (
              <div
                key={alert.type}
                className={`flex items-start p-4 rounded-lg border ${
                  alert.color === 'green' ? 'bg-green-50 border-green-200' :
                  alert.color === 'red' ? 'bg-red-50 border-red-200' :
                  alert.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <alert.icon className={`w-5 h-5 mt-0.5 mr-3 ${
                  alert.color === 'green' ? 'text-green-600' :
                  alert.color === 'red' ? 'text-red-600' :
                  alert.color === 'yellow' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    alert.color === 'green' ? 'text-green-900' :
                    alert.color === 'red' ? 'text-red-900' :
                    alert.color === 'yellow' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    alert.color === 'green' ? 'text-green-700' :
                    alert.color === 'red' ? 'text-red-700' :
                    alert.color === 'yellow' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ComponentDemo>

        {/* Toast Notifications */}
        <ComponentDemo
          title="Toast Notifications"
          description="Non-intrusive notifications that appear temporarily"
          fullWidth
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <button
              onClick={() => triggerToast('success')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() => triggerToast('error')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() => triggerToast('warning')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Warning Toast
            </button>
            <button
              onClick={() => triggerToast('info')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Info Toast
            </button>
          </div>
          {showToast && (
            <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Toast notification triggered!</span>
            </div>
          )}
        </ComponentDemo>

        {/* Badge Components */}
        <ComponentDemo
          title="Badge Variants"
          description="Small status indicators and labels"
        >
          {badgeVariants.map((badge) => (
            <Badge key={badge.label} variant={badge.variant}>
              {badge.label}
            </Badge>
          ))}
        </ComponentDemo>

        {/* Progress Indicators */}
        <ComponentDemo
          title="Progress Indicators"
          description="Visual progress feedback for long-running operations"
          fullWidth
        >
          <div className="space-y-6 w-full">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  -10%
                </button>
                <button
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  +10%
                </button>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Task Progress</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Database Migration</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>File Processing</span>
                    <span className="text-blue-600">In Progress</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Email Notifications</span>
                    <span className="text-gray-600">Pending</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </ComponentDemo>

        {/* Loading States */}
        <ComponentDemo
          title="Loading States & Skeletons"
          description="Placeholder content while data is loading"
          fullWidth
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-800">Skeleton Loading</h5>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-800">Loading Spinners</h5>
              <div className="flex items-center space-x-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
              <button
                onClick={() => setLoading(!loading)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Click to Load'
                )}
              </button>
            </div>
          </div>
        </ComponentDemo>

        {/* Tooltips & Popovers */}
        <ComponentDemo
          title="Tooltips & Hover Cards"
          description="Contextual information on hover or click"
        >
          <div className="flex flex-wrap gap-4">
            <div className="relative group">
              <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                Hover for tooltip
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                This is a tooltip
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
              Click for popover
            </button>

            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
              Hover card demo
            </button>
          </div>
        </ComponentDemo>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-600 rounded-xl mb-4">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Notifications</h3>
          <p className="text-gray-600 text-sm">Context-aware feedback that doesn't interrupt user flow.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-xl mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
          <p className="text-gray-600 text-sm">Live progress tracking and instant status updates.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-600 rounded-xl mb-4">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Clear Communication</h3>
          <p className="text-gray-600 text-sm">Consistent messaging with appropriate severity levels.</p>
        </div>
      </div>
    </div>
  );
};