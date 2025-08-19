// Components re-export file for showcase
// This file provides a simplified way to import components in the showcase

// Button components
export { Button, ExecutiveButton, ActionButton, AnalyticsButton, FinanceButton } from '../../src/components/button';

// Form components - Import individually from their directories
export { Input } from '../../src/components/input';
export { Label } from '../../src/components/label';
export { Textarea } from '../../src/components/textarea';
export { Select } from '../../src/components/select';
export { Checkbox } from '../../src/components/checkbox';
export { RadioGroup } from '../../src/components/radio-group';
export { Switch } from '../../src/components/switch';
export { Slider } from '../../src/components/slider';
export { Toggle } from '../../src/components/toggle';
export { ToggleGroup } from '../../src/components/toggle-group';

// Data components
export { Table } from '../../src/components/table';
export { Timeline } from '../../src/components/timeline';

// Navigation components with sub-components
export { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../src/components/tabs';

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../../src/components/breadcrumb';

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '../../src/components/navigation-menu';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '../../src/components/pagination';

export { Stepper } from '../../src/components/stepper';

// Feedback components
export { Alert } from '../../src/components/alert';
export { Toast } from '../../src/components/toast';
export { Progress } from '../../src/components/progress';
export { Skeleton } from '../../src/components/skeleton';
export { Badge } from '../../src/components/badge';

// Layout components
export { Card } from '../../src/components/card';
export { ScrollArea } from '../../src/components/scroll-area';
export { Resizable } from '../../src/components/resizable';
export { Collapsible } from '../../src/components/collapsible';
export { Separator } from '../../src/components/separator';

// Media components
export { Avatar } from '../../src/components/avatar';
export { Carousel } from '../../src/components/carousel';

// Advanced components
export { Calendar } from '../../src/components/calendar';
export { ColorPicker } from '../../src/components/color-picker';
export { DatePicker } from '../../src/components/date-picker';
export { Rating } from '../../src/components/rating';
export { Accordion } from '../../src/components/accordion';
export { CommandPalette } from '../../src/components/command-palette';
export { DateRangePicker } from '../../src/components/date-range-picker';
export { TextAnimations } from '../../src/components/text-animations';

// Overlay components
export { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../src/components/dialog';

export { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../src/components/popover';

export { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../src/components/tooltip';

export { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '../../src/components/sheet';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../src/components/dropdown-menu';

export {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '../../src/components/hover-card';

export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../../src/components/context-menu';

export {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger
} from '../../src/components/menubar';

// For components that might not have proper exports, provide fallbacks
export const DataGrid = () => <div>DataGrid Component</div>;
export const Chart = () => <div>Chart Component</div>;
export const FileUpload = () => <div>FileUpload Component</div>;
export const Sonner = () => <div>Sonner Component</div>;
export const DataGridAdvanced = () => <div>DataGridAdvanced Component</div>;
export const ErrorBoundary = () => <div>ErrorBoundary Component</div>;
export const FormsDemo = () => <div>FormsDemo Component</div>;
export const Icon = () => <div>Icon Component</div>;
export const Form = () => <div>Form Component</div>;
export const UIProvider = () => <div>UIProvider Component</div>;

// Export all as a namespace for convenience
import * as AllComponents from '../../src/components';
export { AllComponents };
