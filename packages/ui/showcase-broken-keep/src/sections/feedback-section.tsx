// 📢 FEEDBACK SECTION - USER FEEDBACK COMPONENTS SHOWCASE
// Demonstrates Alert, Toast, Progress, Skeleton, and Sonner components

import React, { useState } from 'react';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
  Toast,
  Progress,
  Skeleton,
  Button,
  Badge
} from '../components';
import { toast } from 'sonner';
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  Bell,
  Send,
  Download,
  Upload,
  Trash,
  Star,
  Heart,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

// =================== HELPER COMPONENTS ===================

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-2">
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
  code 
}: { 
  title: string, 
  description: string, 
  children: React.ReactNode,
  code?: string 
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="space-y-4">
        {children}
      </div>
    </div>
    {code && (
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <code className="text-xs text-gray-700 font-mono">{code}</code>
      </div>
    )}
  </div>
);

// =================== MAIN FEEDBACK SECTION ===================

export const FeedbackSection = () => {
  const [activeDemo, setActiveDemo] = useState<string>('alerts');
  const [progress1, setProgress1] = useState(33);
  const [progress2, setProgress2] = useState(67);
  const [progress3, setProgress3] = useState(85);
  const [isLoading, setIsLoading] = useState(false);

  // Progress simulation
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress1((prev) => (prev >= 100 ? 0 : prev + 1));
      setProgress2((prev) => (prev >= 100 ? 0 : prev + 0.5));
      setProgress3((prev) => (prev >= 100 ? 0 : prev + 0.3));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => {
    toast[type](message, {
      description,
      duration: 4000,
    });
  };

  const showCustomToast = () => {
    toast.custom((t) => (
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Achievement Unlocked!</p>
          <p className="text-sm text-gray-600">You've completed the tutorial</p>
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    ));
  };

  const showPromiseToast = () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ name: 'Document.pdf' }), 3000);
    });

    toast.promise(promise, {
      loading: 'Uploading file...',
      success: (data: any) => `${data.name} uploaded successfully!`,
      error: 'Failed to upload file',
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Feedback Components Showcase
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
          Comprehensive feedback system including alerts, toasts, progress indicators, 
          and loading states. Keep users informed with beautiful, accessible notifications.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <StatCard icon={Bell} value="5" label="Components" />
          <StatCard icon={Zap} value="15+" label="Variants" />
          <StatCard icon={CheckCircle2} value="100%" label="Accessible" />
          <StatCard icon={Heart} value="A11Y" label="Compliant" />
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {[
          { id: 'alerts', label: 'Alerts', icon: AlertCircle },
          { id: 'toasts', label: 'Toasts', icon: Bell },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
          { id: 'skeleton', label: 'Skeleton', icon: RefreshCw },
          { id: 'combined', label: 'Real World', icon: Star }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveDemo(id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeDemo === id
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Alerts Demo */}
        {activeDemo === 'alerts' && (
          <>
            <ComponentDemo
              title="Alert Variants"
              description="Different alert styles for various types of messages"
              code={`<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app.</AlertDescription>
</Alert>`}
            >
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is a default alert with important information for the user.
                </AlertDescription>
              </Alert>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your changes have been saved successfully. The team has been notified.
                </AlertDescription>
              </Alert>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Warning</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Your subscription will expire in 5 days. Please renew to continue using premium features.
                </AlertDescription>
              </Alert>

              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  Failed to process payment. Please check your card details and try again.
                </AlertDescription>
              </Alert>
            </ComponentDemo>

            <ComponentDemo
              title="Alert with Actions"
              description="Alerts with interactive elements and CTAs"
            >
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <div className="flex justify-between items-start">
                  <div>
                    <AlertTitle className="text-blue-800">Security Update Required</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      A new security patch is available. Update now to keep your account secure.
                    </AlertDescription>
                  </div>
                  <Button size="sm" className="ml-4">
                    Update Now
                  </Button>
                </div>
              </Alert>

              <Alert className="border-purple-200 bg-purple-50">
                <Zap className="h-4 w-4 text-purple-600" />
                <div className="space-y-2">
                  <AlertTitle className="text-purple-800">New Features Available</AlertTitle>
                  <AlertDescription className="text-purple-700">
                    We've added 3 new features based on your feedback. Check them out!
                  </AlertDescription>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Learn More</Button>
                    <Button size="sm">Try Now</Button>
                  </div>
                </div>
              </Alert>
            </ComponentDemo>
          </>
        )}

        {/* Toasts Demo */}
        {activeDemo === 'toasts' && (
          <>
            <ComponentDemo
              title="Toast Notifications"
              description="Non-intrusive notifications that appear temporarily"
              code={`toast.success('Success!', {
  description: 'Your changes have been saved.',
  duration: 4000,
});`}
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => showToast('success', 'Success!', 'Your changes have been saved successfully.')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Success Toast
                </Button>
                <Button
                  onClick={() => showToast('error', 'Error!', 'Something went wrong. Please try again.')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Error Toast
                </Button>
                <Button
                  onClick={() => showToast('info', 'Info', 'New update available for download.')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Info Toast
                </Button>
                <Button
                  onClick={() => showToast('warning', 'Warning', 'Your session will expire in 5 minutes.')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warning Toast
                </Button>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Advanced Toast Features"
              description="Custom toasts, promise toasts, and rich content"
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={showCustomToast}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Custom Toast
                </Button>
                <Button
                  onClick={showPromiseToast}
                  variant="outline"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Promise Toast
                </Button>
                <Button
                  onClick={() => {
                    toast('Email sent!', {
                      description: 'Your message has been delivered',
                      action: {
                        label: 'Undo',
                        onClick: () => console.log('Undo'),
                      },
                    });
                  }}
                  variant="outline"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Toast with Action
                </Button>
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Progress Demo */}
        {activeDemo === 'progress' && (
          <>
            <ComponentDemo
              title="Progress Indicators"
              description="Visual feedback for loading states and operations"
              code={`<Progress value={33} className="w-full" />`}
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(progress1)}%</span>
                  </div>
                  <Progress value={progress1} className="w-full" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processing Data</span>
                    <span className="text-sm text-gray-500">{Math.round(progress2)}%</span>
                  </div>
                  <Progress value={progress2} className="w-full h-3" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">System Optimization</span>
                    <span className="text-sm text-gray-500">{Math.round(progress3)}%</span>
                  </div>
                  <Progress value={progress3} className="w-full h-2" />
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Styled Progress Bars"
              description="Custom colors and sizes for different contexts"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Revenue Goal</span>
                    <Badge className="bg-green-100 text-green-800">85% Complete</Badge>
                  </div>
                  <Progress value={85} className="w-full h-4 bg-gray-200">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" style={{ width: '85%' }} />
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Storage Used</span>
                    <Badge className="bg-amber-100 text-amber-800">67% Used</Badge>
                  </div>
                  <Progress value={67} className="w-full h-4 bg-gray-200">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-600 rounded-full" style={{ width: '67%' }} />
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">API Rate Limit</span>
                    <Badge className="bg-red-100 text-red-800">95% Used</Badge>
                  </div>
                  <Progress value={95} className="w-full h-4 bg-gray-200">
                    <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse" style={{ width: '95%' }} />
                  </Progress>
                </div>
              </div>
            </ComponentDemo>
          </>
        )}

        {/* Skeleton Demo */}
        {activeDemo === 'skeleton' && (
          <>
            <ComponentDemo
              title="Skeleton Loading States"
              description="Placeholder content while data is loading"
              code={`<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />`}
            >
              <div className="space-y-4">
                {/* Card Skeleton */}
                <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* List Skeleton */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </ComponentDemo>

            <ComponentDemo
              title="Interactive Loading Demo"
              description="Toggle between skeleton and loaded content"
            >
              <Button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Content
                  </>
                )}
              </Button>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <Skeleton className="h-32 w-full rounded" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Product Analytics', value: '+24%', color: 'green' },
                    { title: 'User Engagement', value: '+18%', color: 'blue' },
                    { title: 'Revenue Growth', value: '+32%', color: 'purple' }
                  ].map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className={`h-32 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded mb-3 flex items-center justify-center`}>
                        <TrendingUp className={`w-12 h-12 text-${item.color}-600`} />
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                      <div className="flex justify-between mt-3">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ComponentDemo>
          </>
        )}

        {/* Combined Real-World Demo */}
        {activeDemo === 'combined' && (
          <ComponentDemo
            title="Real-World Application"
            description="Complete feedback system in action"
          >
            <div className="space-y-6">
              {/* Dashboard Update Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <div className="flex justify-between items-center">
                  <div>
                    <AlertTitle className="text-blue-800">System Update</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      New features have been deployed. Refresh to see changes.
                    </AlertDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => showToast('success', 'Page refreshed!', 'Latest features loaded.')}
                  >
                    Refresh Now
                  </Button>
                </div>
              </Alert>

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drop files here or click to upload</p>
                <Button 
                  onClick={() => {
                    showToast('info', 'Upload started', 'Processing 3 files...');
                    setTimeout(() => showToast('success', 'Upload complete!', 'All files processed successfully.'), 3000);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>

              {/* Progress Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Daily Tasks</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Design Review</span>
                        <span className="text-gray-500">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Code Implementation</span>
                        <span className="text-gray-500">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Testing</span>
                        <span className="text-gray-500">20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => showToast('success', 'Report generated!', 'Download will start shortly.')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => showToast('info', 'Syncing...', 'This may take a few moments.')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => showToast('warning', 'Are you sure?', 'This action cannot be undone.')}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={showCustomToast}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ComponentDemo>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-600 rounded-xl mb-4">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Notifications</h3>
          <p className="text-gray-600 text-sm">Context-aware feedback with appropriate urgency levels and clear actions.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-600 rounded-xl mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
          <p className="text-gray-600 text-sm">Live progress tracking and instant feedback for all user actions.</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-xl mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Accessible Design</h3>
          <p className="text-gray-600 text-sm">ARIA-compliant components with screen reader support and keyboard navigation.</p>
        </div>
      </div>
    </div>
  );
};