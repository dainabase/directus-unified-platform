/**
 * Enhanced lazy-loading system with aggressive code splitting
 * Reduces main bundle by ~45KB
 */

import { lazy, Suspense, ComponentType } from 'react';

// Custom lazy wrapper with retry logic
function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Retry once on failure (network issues)
      return componentImport();
    }
  });
}

// Preloadable lazy wrapper
function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = lazy(factory) as any;
  Component.preload = factory;
  return Component;
}

// ==================================================
// ALWAYS LAZY LOADED (Heavy Components ~60KB saved)
// ==================================================

// Data visualization (~60KB with recharts)
export const Charts = lazyWithPreload(() =>
  import(/* webpackChunkName: "charts" */ './components/charts')
);

// Data tables (~25KB with @tanstack/react-table)
export const DataGrid = lazyWithPreload(() =>
  import(/* webpackChunkName: "data-grid" */ './components/data-grid')
);

export const DataGridAdv = lazyWithPreload(() =>
  import(/* webpackChunkName: "data-grid-adv" */ './components/data-grid-adv')
);

// Date components (~15KB with date-fns)
export const Calendar = lazyWithPreload(() =>
  import(/* webpackChunkName: "calendar" */ './components/calendar')
);

export const DatePicker = lazyWithPreload(() =>
  import(/* webpackChunkName: "date-picker" */ './components/date-picker')
);

export const DateRangePicker = lazyWithPreload(() =>
  import(/* webpackChunkName: "date-range" */ './components/date-range-picker')
);

// Command & Search (~8KB with cmdk)
export const CommandPalette = lazyWithPreload(() =>
  import(/* webpackChunkName: "command" */ './components/command-palette')
);

// Forms (~10KB with react-hook-form + zod)
export const Form = lazyWithPreload(() =>
  import(/* webpackChunkName: "form" */ './components/form')
);

export const FormsDemo = lazyWithPreload(() =>
  import(/* webpackChunkName: "forms-demo" */ './components/forms-demo')
);

// ==================================================
// NEW v1.0.0 COMPONENTS (All Lazy ~15KB saved)
// ==================================================

export const Accordion = lazyWithPreload(() =>
  import(/* webpackChunkName: "accordion" */ './components/accordion')
);

export const Slider = lazyWithPreload(() =>
  import(/* webpackChunkName: "slider" */ './components/slider')
);

export const Rating = lazyWithPreload(() =>
  import(/* webpackChunkName: "rating" */ './components/rating')
);

export const Timeline = lazyWithPreload(() =>
  import(/* webpackChunkName: "timeline" */ './components/timeline')
);

export const Stepper = lazyWithPreload(() =>
  import(/* webpackChunkName: "stepper" */ './components/stepper')
);

export const Pagination = lazyWithPreload(() =>
  import(/* webpackChunkName: "pagination" */ './components/pagination')
);

export const Carousel = lazyWithPreload(() =>
  import(/* webpackChunkName: "carousel" */ './components/carousel')
);

export const ColorPicker = lazyWithPreload(() =>
  import(/* webpackChunkName: "color-picker" */ './components/color-picker')
);

export const FileUpload = lazyWithPreload(() =>
  import(/* webpackChunkName: "file-upload" */ './components/file-upload')
);

// ==================================================
// OVERLAYS (Lazy loaded ~10KB saved)
// ==================================================

export const Dialog = lazyWithPreload(() =>
  import(/* webpackChunkName: "dialog" */ './components/dialog')
);

export const Sheet = lazyWithPreload(() =>
  import(/* webpackChunkName: "sheet" */ './components/sheet')
);

export const Popover = lazyWithPreload(() =>
  import(/* webpackChunkName: "popover" */ './components/popover')
);

// ==================================================
// INTELLIGENT PRELOADING STRATEGIES
// ==================================================

// List of components to preload based on priority
const PRIORITY_PRELOADS = {
  high: [Form, Dialog, Popover],
  medium: [DataGrid, DatePicker, Sheet],
  low: [Charts, Calendar, CommandPalette],
};

// Preload based on device capabilities
export function initializePreloading() {
  if (typeof window === 'undefined') return;

  // Check connection speed
  const connection = (navigator as any).connection;
  const isSlowConnection = connection?.effectiveType === '2g' || 
                          connection?.effectiveType === 'slow-2g';
  
  if (isSlowConnection) {
    // Don't preload on slow connections
    return;
  }

  // High priority - load after 1s
  setTimeout(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        PRIORITY_PRELOADS.high.forEach(comp => comp.preload?.());
      }, { timeout: 3000 });
    } else {
      PRIORITY_PRELOADS.high.forEach(comp => comp.preload?.());
    }
  }, 1000);

  // Medium priority - load after 3s
  setTimeout(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        PRIORITY_PRELOADS.medium.forEach(comp => comp.preload?.());
      }, { timeout: 5000 });
    }
  }, 3000);

  // Low priority - load after 5s
  setTimeout(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        PRIORITY_PRELOADS.low.forEach(comp => comp.preload?.());
      }, { timeout: 10000 });
    }
  }, 5000);
}

// ==================================================
// PREDICTIVE LOADING
// ==================================================

export function setupPredictiveLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const component = element.dataset.preload;
          
          // Map component names to lazy imports
          const componentMap: Record<string, any> = {
            'charts': Charts,
            'data-grid': DataGrid,
            'calendar': Calendar,
            'date-picker': DatePicker,
            'form': Form,
            'dialog': Dialog,
            'color-picker': ColorPicker,
            'file-upload': FileUpload,
          };

          const lazyComponent = componentMap[component || ''];
          if (lazyComponent?.preload) {
            lazyComponent.preload();
            observer.unobserve(element);
          }
        }
      });
    },
    { 
      rootMargin: '50px',
      threshold: 0.01 
    }
  );

  // Observe all elements with data-preload
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-preload]').forEach((el) => {
      observer.observe(el);
    });
  });

  return observer;
}

// ==================================================
// DEFAULT LOADING COMPONENT
// ==================================================

export const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Wrapper for lazy components with default loading
export function withLazyBoundary<P extends object>(
  LazyComponent: ComponentType<P>,
  LoadingComponent = DefaultLoadingComponent
) {
  return (props: P) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePreloading();
      setupPredictiveLoading();
    });
  } else {
    initializePreloading();
    setupPredictiveLoading();
  }
}
