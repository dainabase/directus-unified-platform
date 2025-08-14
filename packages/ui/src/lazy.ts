// Lazy-loaded component exports
// These components are loaded on-demand to reduce initial bundle size
// Target: Reduce bundle from 50KB to < 45KB

import { lazy, Suspense, ComponentType } from 'react';

// Heavy components lazy loaded (v1.2.0 new components)
export const VirtualizedTable = lazy(() => import('./components/virtualized-table'));
export const AdvancedFilter = lazy(() => import('./components/advanced-filter'));
export const DashboardGrid = lazy(() => import('./components/dashboard-grid'));
export const NotificationCenter = lazy(() => import('./components/notification-center'));
export const ThemeBuilder = lazy(() => import('./components/theme-builder'));

// Data visualization components
export const Chart = lazy(() => import('./components/chart'));
export const DataGrid = lazy(() => import('./components/data-grid'));
export const DataGridAdvanced = lazy(() => import('./components/data-grid-advanced'));
export const Timeline = lazy(() => import('./components/timeline'));

// Complex form components
export const ColorPicker = lazy(() => import('./components/color-picker'));
export const DatePicker = lazy(() => import('./components/date-picker'));
export const DateRangePicker = lazy(() => import('./components/date-range-picker'));
export const FileUpload = lazy(() => import('./components/file-upload'));
export const FormsDemo = lazy(() => import('./components/forms-demo'));

// Heavy UI components
export const Calendar = lazy(() => import('./components/calendar'));
export const Carousel = lazy(() => import('./components/carousel'));
export const CommandPalette = lazy(() => import('./components/command-palette'));
export const TextAnimations = lazy(() => import('./components/text-animations'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
  </div>
);

// Export wrapper for lazy loading with custom fallback
export const withLazyLoad = <P extends object>(
  Component: ComponentType<P>,
  fallback: React.ReactNode = <LoadingFallback />
) => {
  return (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Preload functions for critical components
export const preloadVirtualizedTable = () => import('./components/virtualized-table');
export const preloadAdvancedFilter = () => import('./components/advanced-filter');
export const preloadDashboardGrid = () => import('./components/dashboard-grid');
export const preloadChart = () => import('./components/chart');
export const preloadDataGrid = () => import('./components/data-grid');

// Utility to preload all heavy components
export const preloadHeavyComponents = () => {
  return Promise.all([
    preloadVirtualizedTable(),
    preloadAdvancedFilter(),
    preloadDashboardGrid(),
    preloadChart(),
    preloadDataGrid(),
  ]);
};

// Bundle size optimization metadata
export const LAZY_LOAD_SAVINGS = {
  VirtualizedTable: '~3.2KB',
  AdvancedFilter: '~2.8KB',
  DashboardGrid: '~2.5KB',
  NotificationCenter: '~1.9KB',
  ThemeBuilder: '~2.1KB',
  Chart: '~4.5KB',
  DataGrid: '~3.8KB',
  CommandPalette: '~2.2KB',
  Total: '~23KB'
};