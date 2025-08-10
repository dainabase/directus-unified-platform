/**
 * Lazy-loaded component exports for optimal performance
 * Use these imports for code splitting
 */

import { lazyWithPreload, lazyWithRetry } from './lib/lazy';

// Heavy components that should always be lazy loaded
export const DataGrid = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/data-grid'))
);

export const DataGridAdv = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/data-grid-adv'))
);

export const Charts = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/charts'))
);

export const Calendar = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/calendar'))
);

export const DateRangePicker = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/date-range-picker'))
);

export const CommandPalette = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/command-palette'))
);

// Form components (lazy load for better initial performance)
export const Form = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/form'))
);

// New v1.0.0 components (all lazy loaded)
export const Accordion = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/accordion'))
);

export const Slider = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/slider'))
);

export const Rating = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/rating'))
);

export const Timeline = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/timeline'))
);

export const Stepper = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/stepper'))
);

export const Pagination = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/pagination'))
);

export const Carousel = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/carousel'))
);

export const ColorPicker = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/color-picker'))
);

export const FileUpload = lazyWithPreload(() =>
  lazyWithRetry(() => import('./components/file-upload'))
);

// Preload strategies
if (typeof window !== 'undefined') {
  // Preload critical components after initial render
  setTimeout(() => {
    // Preload commonly used components
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        Form.preload();
        DataGrid.preload();
      });
    }
  }, 2000);

  // Preload on route change hints
  if ('IntersectionObserver' in window) {
    // Setup observers for predictive loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const component = element.dataset.preload;
            
            switch (component) {
              case 'calendar':
                Calendar.preload();
                break;
              case 'charts':
                Charts.preload();
                break;
              case 'data-grid':
                DataGrid.preload();
                break;
              // Add more as needed
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    // Observe elements with data-preload attribute
    document.querySelectorAll('[data-preload]').forEach((el) => {
      observer.observe(el);
    });
  }
}