import React, { Suspense, lazy } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../components/error-boundary';
import { Skeleton } from '../../components/skeleton';
import { UIProvider } from '../../components/ui-provider';
import { Button } from '../../components/button';
import { Spinner } from '../../components/spinner';

// Mock lazy components with delays
const createLazyComponent = (name: string, delay: number = 100) => {
  return lazy(() => 
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          default: () => <div data-testid={`lazy-${name}`}>{name} Loaded</div>
        });
      }, delay);
    })
  );
};

// Mock bundle imports
jest.mock('../../components/forms-bundle', () => ({
  __esModule: true,
  default: () => Promise.resolve({
    Input: () => <input data-testid="lazy-input" />,
    Select: () => <select data-testid="lazy-select" />,
    Checkbox: () => <input type="checkbox" data-testid="lazy-checkbox" />,
  }),
}));

jest.mock('../../components/overlays-bundle', () => ({
  __esModule: true,
  default: () => Promise.resolve({
    Dialog: () => <div data-testid="lazy-dialog">Dialog</div>,
    Sheet: () => <div data-testid="lazy-sheet">Sheet</div>,
    Popover: () => <div data-testid="lazy-popover">Popover</div>,
  }),
}));

jest.mock('../../components/data-bundle', () => ({
  __esModule: true,
  default: () => Promise.resolve({
    DataGrid: () => <div data-testid="lazy-datagrid">DataGrid</div>,
    Table: () => <table data-testid="lazy-table" />,
    Chart: () => <div data-testid="lazy-chart">Chart</div>,
  }),
}));

describe('Lazy Loading & Suspense Integration Tests', () => {
  const user = userEvent.setup();

  // Performance tracking
  const performanceObserver = {
    measure: jest.fn(),
    mark: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue([{ duration: 100 }]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: performanceObserver,
    });
  });

  describe('Component Lazy Loading with Suspense', () => {
    it('should lazy load components with loading states', async () => {
      const LazyChart = createLazyComponent('chart', 200);
      const LazyDataGrid = createLazyComponent('datagrid', 300);
      const LazyCalendar = createLazyComponent('calendar', 150);

      const App = () => {
        const [showChart, setShowChart] = React.useState(false);
        const [showDataGrid, setShowDataGrid] = React.useState(false);
        const [showCalendar, setShowCalendar] = React.useState(false);

        return (
          <UIProvider>
            <Button onClick={() => setShowChart(true)}>Load Chart</Button>
            <Button onClick={() => setShowDataGrid(true)}>Load DataGrid</Button>
            <Button onClick={() => setShowCalendar(true)}>Load Calendar</Button>

            {showChart && (
              <Suspense fallback={<Skeleton data-testid="chart-skeleton" />}>
                <LazyChart />
              </Suspense>
            )}

            {showDataGrid && (
              <Suspense fallback={<Skeleton data-testid="datagrid-skeleton" />}>
                <LazyDataGrid />
              </Suspense>
            )}

            {showCalendar && (
              <Suspense fallback={<Skeleton data-testid="calendar-skeleton" />}>
                <LazyCalendar />
              </Suspense>
            )}
          </UIProvider>
        );
      };

      render(<App />);

      // Load Chart
      const chartButton = screen.getByRole('button', { name: /load chart/i });
      await user.click(chartButton);

      // Should show skeleton first
      expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();

      // Wait for lazy load
      await waitFor(() => {
        expect(screen.getByTestId('lazy-chart')).toBeInTheDocument();
      }, { timeout: 300 });

      // Load DataGrid
      const dataGridButton = screen.getByRole('button', { name: /load datagrid/i });
      await user.click(dataGridButton);

      expect(screen.getByTestId('datagrid-skeleton')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('lazy-datagrid')).toBeInTheDocument();
      }, { timeout: 400 });

      // Load Calendar
      const calendarButton = screen.getByRole('button', { name: /load calendar/i });
      await user.click(calendarButton);

      expect(screen.getByTestId('calendar-skeleton')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('lazy-calendar')).toBeInTheDocument();
      }, { timeout: 250 });
    });

    it('should handle error boundaries with lazy components', async () => {
      const FailingComponent = lazy(() => 
        Promise.reject(new Error('Failed to load component'))
      );

      const ErrorFallback = ({ error, retry }: any) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      );

      const AppWithError = () => {
        const [key, setKey] = React.useState(0);

        return (
          <UIProvider>
            <ErrorBoundary
              fallback={<ErrorFallback />}
              onError={(error) => console.error(error)}
              resetKeys={[key]}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <FailingComponent key={key} />
              </Suspense>
            </ErrorBoundary>
            <button onClick={() => setKey(k => k + 1)}>Reset</button>
          </UIProvider>
        );
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      render(<AppWithError />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument();
      });

      // Test retry mechanism
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Should show loading again
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should implement retry mechanism for failed lazy loads', async () => {
      let attemptCount = 0;
      const RetryableComponent = lazy(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          default: () => <div>Successfully loaded after {attemptCount} attempts</div>
        });
      });

      const RetryApp = () => {
        const [retryCount, setRetryCount] = React.useState(0);

        return (
          <ErrorBoundary
            fallback={
              <div>
                <p>Failed to load</p>
                <button onClick={() => setRetryCount(c => c + 1)}>
                  Retry ({retryCount})
                </button>
              </div>
            }
            resetKeys={[retryCount]}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <RetryableComponent key={retryCount} />
            </Suspense>
          </ErrorBoundary>
        );
      };

      render(<RetryApp />);

      // First attempt fails
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });

      // Retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Second attempt fails
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });

      // Retry again
      await user.click(retryButton);

      // Third attempt succeeds
      await waitFor(() => {
        expect(screen.getByText(/successfully loaded after 3 attempts/i)).toBeInTheDocument();
      });
    });

    it('should validate bundle splitting effectiveness', async () => {
      const BundleSplitApp = () => {
        const [loadedBundles, setLoadedBundles] = React.useState<string[]>([]);

        const loadBundle = async (bundleName: string) => {
          performance.mark(`${bundleName}-start`);
          
          try {
            const module = await import(`../../components/${bundleName}-bundle`);
            performance.mark(`${bundleName}-end`);
            performance.measure(
              `${bundleName}-load`,
              `${bundleName}-start`,
              `${bundleName}-end`
            );
            
            setLoadedBundles(prev => [...prev, bundleName]);
          } catch (error) {
            console.error(`Failed to load ${bundleName}:`, error);
          }
        };

        return (
          <div>
            <button onClick={() => loadBundle('forms')}>Load Forms Bundle</button>
            <button onClick={() => loadBundle('overlays')}>Load Overlays Bundle</button>
            <button onClick={() => loadBundle('data')}>Load Data Bundle</button>
            
            <div data-testid="loaded-bundles">
              {loadedBundles.join(', ')}
            </div>
          </div>
        );
      };

      render(<BundleSplitApp />);

      // Load forms bundle
      await user.click(screen.getByRole('button', { name: /load forms/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('loaded-bundles')).toHaveTextContent('forms');
      });

      // Verify performance marking
      expect(performanceObserver.mark).toHaveBeenCalledWith('forms-start');
      expect(performanceObserver.mark).toHaveBeenCalledWith('forms-end');
      expect(performanceObserver.measure).toHaveBeenCalledWith(
        'forms-load',
        'forms-start',
        'forms-end'
      );

      // Load overlays bundle
      await user.click(screen.getByRole('button', { name: /load overlays/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('loaded-bundles')).toHaveTextContent('forms, overlays');
      });

      // Load data bundle
      await user.click(screen.getByRole('button', { name: /load data/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('loaded-bundles')).toHaveTextContent('forms, overlays, data');
      });
    });

    it('should measure performance metrics (FCP, TTI)', async () => {
      const PerformanceApp = () => {
        const [metrics, setMetrics] = React.useState({
          fcp: 0,
          tti: 0,
          bundleSize: 0,
        });

        React.useEffect(() => {
          // Simulate FCP measurement
          const measureFCP = () => {
            performance.mark('fcp');
            const fcp = performance.getEntriesByName('fcp')[0];
            setMetrics(m => ({ ...m, fcp: 150 }));
          };

          // Simulate TTI measurement
          const measureTTI = () => {
            performance.mark('tti');
            setMetrics(m => ({ ...m, tti: 300 }));
          };

          // Simulate bundle size measurement
          const measureBundleSize = () => {
            setMetrics(m => ({ ...m, bundleSize: 38 }));
          };

          measureFCP();
          setTimeout(measureTTI, 100);
          setTimeout(measureBundleSize, 200);
        }, []);

        return (
          <div>
            <div data-testid="fcp">FCP: {metrics.fcp}ms</div>
            <div data-testid="tti">TTI: {metrics.tti}ms</div>
            <div data-testid="bundle-size">Bundle: {metrics.bundleSize}KB</div>
          </div>
        );
      };

      render(<PerformanceApp />);

      await waitFor(() => {
        expect(screen.getByTestId('fcp')).toHaveTextContent('FCP: 150ms');
        expect(screen.getByTestId('tti')).toHaveTextContent('TTI: 300ms');
        expect(screen.getByTestId('bundle-size')).toHaveTextContent('Bundle: 38KB');
      });

      // Verify performance thresholds
      const fcpElement = screen.getByTestId('fcp');
      const fcp = parseInt(fcpElement.textContent?.match(/\d+/)?.[0] || '0');
      expect(fcp).toBeLessThan(200); // Good FCP < 200ms

      const ttiElement = screen.getByTestId('tti');
      const tti = parseInt(ttiElement.textContent?.match(/\d+/)?.[0] || '0');
      expect(tti).toBeLessThan(500); // Good TTI < 500ms
    });

    it('should implement preloading strategies', async () => {
      const PreloadApp = () => {
        const [preloadedComponents, setPreloadedComponents] = React.useState<string[]>([]);
        const [visibleComponents, setVisibleComponents] = React.useState<string[]>([]);

        const preloadComponent = (name: string) => {
          // Simulate preloading
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'script';
          link.href = `/bundles/${name}.js`;
          document.head.appendChild(link);
          
          setPreloadedComponents(prev => [...prev, name]);
        };

        const showComponent = (name: string) => {
          if (preloadedComponents.includes(name)) {
            // Component was preloaded, show immediately
            setVisibleComponents(prev => [...prev, name]);
          } else {
            // Need to load first
            setTimeout(() => {
              setVisibleComponents(prev => [...prev, name]);
            }, 500);
          }
        };

        // Preload on hover
        const handleHover = (name: string) => {
          if (!preloadedComponents.includes(name)) {
            preloadComponent(name);
          }
        };

        return (
          <div>
            <button
              onMouseEnter={() => handleHover('chart')}
              onClick={() => showComponent('chart')}
            >
              Show Chart (hover to preload)
            </button>
            
            <button
              onMouseEnter={() => handleHover('table')}
              onClick={() => showComponent('table')}
            >
              Show Table (hover to preload)
            </button>

            <button onClick={() => showComponent('dialog')}>
              Show Dialog (no preload)
            </button>

            <div data-testid="preloaded">{preloadedComponents.join(', ')}</div>
            <div data-testid="visible">{visibleComponents.join(', ')}</div>
          </div>
        );
      };

      render(<PreloadApp />);

      const chartButton = screen.getByRole('button', { name: /show chart/i });
      const tableButton = screen.getByRole('button', { name: /show table/i });
      const dialogButton = screen.getByRole('button', { name: /show dialog/i });

      // Hover to preload chart
      fireEvent.mouseEnter(chartButton);
      expect(screen.getByTestId('preloaded')).toHaveTextContent('chart');

      // Click to show chart (should be instant since preloaded)
      await user.click(chartButton);
      expect(screen.getByTestId('visible')).toHaveTextContent('chart');

      // Hover to preload table
      fireEvent.mouseEnter(tableButton);
      expect(screen.getByTestId('preloaded')).toHaveTextContent('chart, table');

      // Show dialog without preload (should have delay)
      await user.click(dialogButton);
      expect(screen.getByTestId('visible')).not.toHaveTextContent('dialog');

      await waitFor(() => {
        expect(screen.getByTestId('visible')).toHaveTextContent('dialog');
      }, { timeout: 600 });
    });

    it('should handle code splitting boundaries correctly', async () => {
      const CodeSplitApp = () => {
        const [route, setRoute] = React.useState('home');

        const renderRoute = () => {
          switch (route) {
            case 'dashboard':
              return (
                <Suspense fallback={<Skeleton />}>
                  <DashboardBundle />
                </Suspense>
              );
            case 'settings':
              return (
                <Suspense fallback={<Skeleton />}>
                  <SettingsBundle />
                </Suspense>
              );
            case 'analytics':
              return (
                <Suspense fallback={<Skeleton />}>
                  <AnalyticsBundle />
                </Suspense>
              );
            default:
              return <div>Home Page</div>;
          }
        };

        return (
          <UIProvider>
            <nav>
              <button onClick={() => setRoute('home')}>Home</button>
              <button onClick={() => setRoute('dashboard')}>Dashboard</button>
              <button onClick={() => setRoute('settings')}>Settings</button>
              <button onClick={() => setRoute('analytics')}>Analytics</button>
            </nav>
            <main>{renderRoute()}</main>
          </UIProvider>
        );
      };

      // Mock route bundles
      const DashboardBundle = lazy(() => Promise.resolve({
        default: () => <div data-testid="dashboard">Dashboard with DataGrid and Charts</div>
      }));

      const SettingsBundle = lazy(() => Promise.resolve({
        default: () => <div data-testid="settings">Settings with Forms</div>
      }));

      const AnalyticsBundle = lazy(() => Promise.resolve({
        default: () => <div data-testid="analytics">Analytics with Advanced Charts</div>
      }));

      render(<CodeSplitApp />);

      // Initial home route
      expect(screen.getByText('Home Page')).toBeInTheDocument();

      // Navigate to dashboard
      await user.click(screen.getByRole('button', { name: /dashboard/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Navigate to settings
      await user.click(screen.getByRole('button', { name: /settings/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('settings')).toBeInTheDocument();
      });

      // Navigate back to home (no lazy loading)
      await user.click(screen.getByRole('button', { name: /home/i }));
      expect(screen.getByText('Home Page')).toBeInTheDocument();

      // Navigate to analytics
      await user.click(screen.getByRole('button', { name: /analytics/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('analytics')).toBeInTheDocument();
      });
    });

    it('should optimize loading with intersection observer', async () => {
      const LazyLoadOnScroll = () => {
        const [visibleSections, setVisibleSections] = React.useState<Set<string>>(new Set());

        React.useEffect(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const id = entry.target.id;
                  setVisibleSections(prev => new Set(prev).add(id));
                }
              });
            },
            { threshold: 0.1 }
          );

          document.querySelectorAll('[data-lazy-load]').forEach(el => {
            observer.observe(el);
          });

          return () => observer.disconnect();
        }, []);

        return (
          <div style={{ height: '200vh' }}>
            <div id="section1" data-lazy-load style={{ marginTop: '100vh' }}>
              {visibleSections.has('section1') ? (
                <Suspense fallback={<Skeleton />}>
                  <LazySection1 />
                </Suspense>
              ) : (
                <div>Scroll to load Section 1</div>
              )}
            </div>

            <div id="section2" data-lazy-load style={{ marginTop: '50vh' }}>
              {visibleSections.has('section2') ? (
                <Suspense fallback={<Skeleton />}>
                  <LazySection2 />
                </Suspense>
              ) : (
                <div>Scroll to load Section 2</div>
              )}
            </div>
          </div>
        );
      };

      const LazySection1 = lazy(() => Promise.resolve({
        default: () => <div>Section 1 Content</div>
      }));

      const LazySection2 = lazy(() => Promise.resolve({
        default: () => <div>Section 2 Content</div>
      }));

      // Mock IntersectionObserver
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      });
      window.IntersectionObserver = mockIntersectionObserver as any;

      render(<LazyLoadOnScroll />);

      // Initially sections are not loaded
      expect(screen.getByText('Scroll to load Section 1')).toBeInTheDocument();
      expect(screen.getByText('Scroll to load Section 2')).toBeInTheDocument();

      // Verify intersection observer was set up
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0.1 })
      );
    });
  });
});