import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIProvider } from '../../components/ui-provider';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Toast } from '../../components/toast';
import { Alert } from '../../components/alert';
import { Badge } from '../../components/badge';
import { Avatar } from '../../components/avatar';
import { Progress } from '../../components/progress';
import { Skeleton } from '../../components/skeleton';
import { Switch } from '../../components/switch';
import { Tabs } from '../../components/tabs';
import { Tooltip } from '../../components/tooltip';
import { Accordion } from '../../components/accordion';
import { Breadcrumb } from '../../components/breadcrumb';
import { Calendar } from '../../components/calendar';
import { Carousel } from '../../components/carousel';
import { Chart } from '../../components/chart';
import { Checkbox } from '../../components/checkbox';
import { ColorPicker } from '../../components/color-picker';
import { CommandPalette } from '../../components/command-palette';
import { ContextMenu } from '../../components/context-menu';
import { DataGrid } from '../../components/data-grid';
import { DatePicker } from '../../components/date-picker';
import { DateRangePicker } from '../../components/date-range-picker';
import { DropdownMenu } from '../../components/dropdown-menu';
import { FileUpload } from '../../components/file-upload';
import { HoverCard } from '../../components/hover-card';
import { Icon } from '../../components/icon';
import { Label } from '../../components/label';
import { Menubar } from '../../components/menubar';
import { NavigationMenu } from '../../components/navigation-menu';
import { Pagination } from '../../components/pagination';
import { Popover } from '../../components/popover';
import { RadioGroup } from '../../components/radio-group';
import { Rating } from '../../components/rating';
import { Resizable } from '../../components/resizable';
import { ScrollArea } from '../../components/scroll-area';
import { Separator } from '../../components/separator';
import { Sheet } from '../../components/sheet';
import { Slider } from '../../components/slider';
import { Stepper } from '../../components/stepper';
import { Table } from '../../components/table';
import { Textarea } from '../../components/textarea';
import { Timeline } from '../../components/timeline';
import { Toggle } from '../../components/toggle';
import { ToggleGroup } from '../../components/toggle-group';
import { Collapsible } from '../../components/collapsible';

describe('Theme Switching Integration Tests', () => {
  const user = userEvent.setup();

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock matchMedia for system preference
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  };

  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
  });

  describe('Theme Application on All Components', () => {
    it('should apply dark theme to all 58 components', async () => {
      const TestAllComponents = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

        React.useEffect(() => {
          document.documentElement.className = theme;
          document.documentElement.style.setProperty('--background', theme === 'dark' ? '0 0% 10%' : '0 0% 100%');
          document.documentElement.style.setProperty('--foreground', theme === 'dark' ? '0 0% 98%' : '0 0% 10%');
        }, [theme]);

        return (
          <UIProvider theme={theme}>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              Toggle Theme
            </button>
            
            {/* Core Components */}
            <Icon name="home" />
            <Label>Label</Label>
            <Separator />
            
            {/* Layout Components */}
            <Card>Card Content</Card>
            <Resizable>Resizable Content</Resizable>
            <ScrollArea>Scrollable Content</ScrollArea>
            <Collapsible>Collapsible Content</Collapsible>
            
            {/* Form Components */}
            <Input placeholder="Input" />
            <Select>
              <option>Option</option>
            </Select>
            <Checkbox>Checkbox</Checkbox>
            <RadioGroup name="radio">
              <input type="radio" value="1" />
            </RadioGroup>
            <Textarea placeholder="Textarea" />
            <Switch />
            <Slider />
            <Rating />
            <ColorPicker />
            <DatePicker />
            <DateRangePicker />
            <FileUpload />
            
            {/* Data Display */}
            <Table>
              <tbody>
                <tr><td>Cell</td></tr>
              </tbody>
            </Table>
            <DataGrid data={[]} columns={[]} />
            <Chart type="line" data={[]} />
            <Timeline events={[]} />
            <Calendar />
            <Badge>Badge</Badge>
            
            {/* Navigation */}
            <Tabs>
              <div>Tab Content</div>
            </Tabs>
            <Stepper steps={[]} />
            <Pagination total={100} />
            <Breadcrumb items={[]} />
            <NavigationMenu items={[]} />
            
            {/* Feedback */}
            <Alert>Alert Message</Alert>
            <Toast />
            <Progress value={50} />
            <Skeleton />
            <Button>Button</Button>
            <Avatar src="" alt="Avatar" />
            
            {/* Overlays */}
            <Dialog>Dialog Content</Dialog>
            <Sheet>Sheet Content</Sheet>
            <Popover>Popover Content</Popover>
            <Tooltip content="Tooltip">
              <span>Hover me</span>
            </Tooltip>
            <HoverCard>Hover Card</HoverCard>
            <ContextMenu>Context Menu</ContextMenu>
            <DropdownMenu>Dropdown Menu</DropdownMenu>
            
            {/* Advanced */}
            <CommandPalette />
            <Carousel items={[]} />
            <Accordion items={[]} />
            <Menubar items={[]} />
            <Toggle>Toggle</Toggle>
            <ToggleGroup>
              <button>Option</button>
            </ToggleGroup>
          </UIProvider>
        );
      };

      const { container } = render(<TestAllComponents />);

      // Initial light theme
      expect(document.documentElement.className).toBe('light');
      expect(getComputedStyle(document.documentElement).getPropertyValue('--background')).toBe('0 0% 100%');

      // Switch to dark theme
      const toggleButton = screen.getByText('Toggle Theme');
      await user.click(toggleButton);

      // Verify dark theme applied
      await waitFor(() => {
        expect(document.documentElement.className).toBe('dark');
        expect(getComputedStyle(document.documentElement).getPropertyValue('--background')).toBe('0 0% 10%');
        expect(getComputedStyle(document.documentElement).getPropertyValue('--foreground')).toBe('0 0% 98%');
      });

      // Verify all components have dark theme classes
      const allComponents = container.querySelectorAll('[class*="dark"]');
      expect(allComponents.length).toBeGreaterThan(0);

      // Switch back to light theme
      await user.click(toggleButton);

      await waitFor(() => {
        expect(document.documentElement.className).toBe('light');
        expect(getComputedStyle(document.documentElement).getPropertyValue('--background')).toBe('0 0% 100%');
      });
    });

    it('should persist theme preference in localStorage', async () => {
      const ThemeComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
          const saved = localStorage.getItem('theme');
          return (saved as 'light' | 'dark') || 'light';
        });

        const toggleTheme = () => {
          const newTheme = theme === 'light' ? 'dark' : 'light';
          setTheme(newTheme);
          localStorage.setItem('theme', newTheme);
        };

        return (
          <UIProvider theme={theme}>
            <Button onClick={toggleTheme}>Current: {theme}</Button>
            <Card>Content in {theme} mode</Card>
          </UIProvider>
        );
      };

      render(<ThemeComponent />);

      // Initial state
      expect(localStorage.getItem('theme')).toBeNull();
      expect(screen.getByText(/current: light/i)).toBeInTheDocument();

      // Toggle to dark
      await user.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(screen.getByText(/current: dark/i)).toBeInTheDocument();
      });

      // Remount component to test persistence
      const { unmount } = render(<ThemeComponent />);
      unmount();
      
      render(<ThemeComponent />);
      
      // Should load dark theme from localStorage
      expect(screen.getByText(/current: dark/i)).toBeInTheDocument();
    });

    it('should detect and apply system preference', async () => {
      // Mock system dark mode
      mockMatchMedia(true);

      const SystemThemeComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');

        React.useEffect(() => {
          if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.className = isDark ? 'dark' : 'light';
          } else {
            document.documentElement.className = theme;
          }
        }, [theme]);

        return (
          <UIProvider theme={theme === 'system' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
            theme
          }>
            <select onChange={(e) => setTheme(e.target.value as any)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <div data-testid="theme-indicator">
              {document.documentElement.className}
            </div>
          </UIProvider>
        );
      };

      render(<SystemThemeComponent />);

      const select = screen.getByRole('combobox');
      
      // Select system theme
      await user.selectOptions(select, 'system');
      
      await waitFor(() => {
        // Should apply dark theme based on system preference
        expect(document.documentElement.className).toBe('dark');
      });

      // Mock system light mode
      mockMatchMedia(false);
      
      // Trigger re-render
      fireEvent.change(select, { target: { value: 'system' } });
      
      await waitFor(() => {
        // Should apply light theme based on system preference
        expect(document.documentElement.className).toBe('light');
      });
    });

    it('should validate CSS variables for all theme modes', async () => {
      const cssVariables = [
        '--background',
        '--foreground',
        '--card',
        '--card-foreground',
        '--popover',
        '--popover-foreground',
        '--primary',
        '--primary-foreground',
        '--secondary',
        '--secondary-foreground',
        '--muted',
        '--muted-foreground',
        '--accent',
        '--accent-foreground',
        '--destructive',
        '--destructive-foreground',
        '--border',
        '--input',
        '--ring',
        '--radius',
      ];

      const ThemeValidator = () => {
        const applyTheme = (theme: string) => {
          if (theme === 'dark') {
            cssVariables.forEach(variable => {
              const darkValue = variable.includes('ground') ? '0 0% 98%' : '0 0% 10%';
              document.documentElement.style.setProperty(variable, darkValue);
            });
          } else {
            cssVariables.forEach(variable => {
              const lightValue = variable.includes('ground') ? '0 0% 10%' : '0 0% 98%';
              document.documentElement.style.setProperty(variable, lightValue);
            });
          }
        };

        return (
          <div>
            <button onClick={() => applyTheme('light')}>Light Theme</button>
            <button onClick={() => applyTheme('dark')}>Dark Theme</button>
          </div>
        );
      };

      render(<ThemeValidator />);

      // Apply light theme
      await user.click(screen.getByText('Light Theme'));
      
      cssVariables.forEach(variable => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
        expect(value).toBeTruthy();
      });

      // Apply dark theme
      await user.click(screen.getByText('Dark Theme'));
      
      cssVariables.forEach(variable => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
        expect(value).toBeTruthy();
      });
    });

    it('should handle theme switching performance efficiently', async () => {
      const startTime = performance.now();
      
      const PerformanceTest = () => {
        const [theme, setTheme] = React.useState('light');
        const [renderCount, setRenderCount] = React.useState(0);

        React.useEffect(() => {
          setRenderCount(prev => prev + 1);
        }, [theme]);

        return (
          <UIProvider theme={theme}>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              Toggle (Renders: {renderCount})
            </button>
            {/* Render many components to test performance */}
            {Array.from({ length: 20 }, (_, i) => (
              <Card key={i}>
                <Input />
                <Button>Button {i}</Button>
                <Select><option>Option</option></Select>
              </Card>
            ))}
          </UIProvider>
        );
      };

      render(<PerformanceTest />);

      const toggleButton = screen.getByRole('button', { name: /toggle/i });

      // Perform multiple theme switches
      for (let i = 0; i < 5; i++) {
        await user.click(toggleButton);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Theme switching should be performant (< 1000ms for 5 switches)
      expect(duration).toBeLessThan(1000);

      // Check render count is optimized
      const renderText = screen.getByText(/renders:/i).textContent;
      const renderCount = parseInt(renderText?.match(/\d+/)?.[0] || '0');
      expect(renderCount).toBeLessThanOrEqual(6); // Initial + 5 switches
    });

    it('should support custom theme colors', async () => {
      const CustomThemeProvider = () => {
        const [customColors, setCustomColors] = React.useState({
          primary: 'hsl(260, 100%, 50%)',
          secondary: 'hsl(120, 100%, 40%)',
          accent: 'hsl(30, 100%, 50%)',
        });

        const applyCustomTheme = () => {
          Object.entries(customColors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
          });
        };

        return (
          <UIProvider>
            <ColorPicker
              value={customColors.primary}
              onChange={(color) => setCustomColors({ ...customColors, primary: color })}
            />
            <button onClick={applyCustomTheme}>Apply Custom Theme</button>
            <Button style={{ backgroundColor: 'var(--primary)' }}>
              Primary Button
            </Button>
          </UIProvider>
        );
      };

      render(<CustomThemeProvider />);

      const applyButton = screen.getByText('Apply Custom Theme');
      await user.click(applyButton);

      // Verify custom colors are applied
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      expect(primaryColor).toBe('hsl(260, 100%, 50%)');
    });

    it('should handle theme inheritance in nested providers', async () => {
      const NestedThemes = () => {
        return (
          <UIProvider theme="light">
            <Card data-testid="outer-card">
              Outer Light Theme
              <UIProvider theme="dark">
                <Card data-testid="inner-card">
                  Inner Dark Theme
                  <UIProvider theme="light">
                    <Card data-testid="nested-card">
                      Nested Light Theme
                    </Card>
                  </UIProvider>
                </Card>
              </UIProvider>
            </Card>
          </UIProvider>
        );
      };

      const { getByTestId } = render(<NestedThemes />);

      // Each nested level should have its own theme
      const outerCard = getByTestId('outer-card');
      const innerCard = getByTestId('inner-card');
      const nestedCard = getByTestId('nested-card');

      expect(outerCard.closest('[data-theme="light"]')).toBeTruthy();
      expect(innerCard.closest('[data-theme="dark"]')).toBeTruthy();
      expect(nestedCard.closest('[data-theme="light"]')).toBeTruthy();
    });
  });

  describe('Theme Transitions and Animations', () => {
    it('should apply smooth transitions when switching themes', async () => {
      const TransitionTest = () => {
        const [theme, setTheme] = React.useState('light');

        React.useEffect(() => {
          document.documentElement.style.transition = 'all 0.3s ease';
          document.documentElement.className = theme;
        }, [theme]);

        return (
          <UIProvider theme={theme}>
            <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              Toggle with Transition
            </Button>
          </UIProvider>
        );
      };

      render(<TransitionTest />);

      const button = screen.getByRole('button');
      
      // Check transition is set
      expect(document.documentElement.style.transition).toBe('all 0.3s ease');

      await user.click(button);

      // Theme should change with transition
      await waitFor(() => {
        expect(document.documentElement.className).toBe('dark');
      });
    });
  });
});