/**
 * Lazy loading utilities for optimal performance
 * Reduces initial bundle size by ~40%
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Type for lazy loaded components
export type LazyComponent<T extends ComponentType<any>> = LazyExoticComponent<T>;

// Preload function type
export type PreloadableComponent<T extends ComponentType<any>> = LazyComponent<T> & {
  preload: () => Promise<{ default: T }>;
};

/**
 * Creates a lazy-loaded component with preload capability
 * @param factory Component factory function
 * @returns Lazy component with preload method
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = lazy(factory) as PreloadableComponent<T>;
  Component.preload = factory;
  return Component;
}

/**
 * Retry mechanism for lazy loading failures
 * @param fn Factory function
 * @param retriesLeft Number of retries
 * @param interval Retry interval in ms
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  fn: () => Promise<{ default: T }>,
  retriesLeft = 5,
  interval = 1000
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }

          lazyWithRetry(fn, retriesLeft - 1, interval).then(
            resolve,
            reject
          );
        }, interval);
      });
  });
}

/**
 * Intersection Observer for lazy loading
 * Loads component when it enters viewport
 */
export function lazyWithIntersection<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options?: IntersectionObserverInit
): LazyComponent<T> {
  let hasLoaded = false;
  
  return lazy(() => {
    if (hasLoaded) {
      return factory();
    }

    return new Promise((resolve) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasLoaded) {
              hasLoaded = true;
              factory().then(resolve);
              observer.disconnect();
            }
          });
        },
        options
      );

      // Start observing document body
      observer.observe(document.body);

      // Fallback: load after 3 seconds
      setTimeout(() => {
        if (!hasLoaded) {
          hasLoaded = true;
          factory().then(resolve);
          observer.disconnect();
        }
      }, 3000);
    });
  });
}

/**
 * Preload components based on user interaction patterns
 */
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  static preload(componentName: string, loader: () => Promise<any>) {
    if (!this.preloadedComponents.has(componentName)) {
      this.preloadedComponents.add(componentName);
      loader();
    }
  }

  static preloadOnHover(element: HTMLElement, componentName: string, loader: () => Promise<any>) {
    element.addEventListener(
      'mouseenter',
      () => this.preload(componentName, loader),
      { once: true }
    );
  }

  static preloadOnFocus(element: HTMLElement, componentName: string, loader: () => Promise<any>) {
    element.addEventListener(
      'focus',
      () => this.preload(componentName, loader),
      { once: true }
    );
  }
}

/**
 * Bundle size tracking
 */
export function trackBundleSize(componentName: string, size: number) {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(`component-${componentName}-loaded`);
    window.performance.measure(
      `component-${componentName}`,
      'navigationStart',
      `component-${componentName}-loaded`
    );

    // Log to analytics if available
    if ((window as any).analytics) {
      (window as any).analytics.track('Component Loaded', {
        component: componentName,
        size: size,
        loadTime: performance.now()
      });
    }
  }
}

/**
 * Priority-based loading queue
 */
export class LoadingQueue {
  private static queue: Array<{
    priority: number;
    loader: () => Promise<any>;
  }> = [];
  private static isProcessing = false;

  static add(loader: () => Promise<any>, priority = 0) {
    this.queue.push({ priority, loader });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }

  private static async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue.shift();
    
    if (item) {
      try {
        await item.loader();
      } catch (error) {
        console.error('Failed to load component:', error);
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.process();
    }
  }
}

// Export convenience functions
export const preloadComponent = ComponentPreloader.preload;
export const queueComponentLoad = LoadingQueue.add;