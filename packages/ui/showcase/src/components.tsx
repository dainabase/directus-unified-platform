/**
 * Components re-export file for showcase
 * SIMPLIFIED VERSION - Uses local mock components for missing exports
 * This allows the showcase to run while the Design System is being fixed
 */

import React from 'react';

// ============================================
// WORKING IMPORTS - Components that exist
// ============================================

// Try to import working components with fallbacks
let Button: any, Input: any, Label: any, Badge: any, Separator: any;

try {
  const buttonModule = require('../src/components/button');
  Button = buttonModule.Button || (() => <button className="px-4 py-2 bg-blue-500 text-white rounded">Button</button>);
} catch {
  Button = () => <button className="px-4 py-2 bg-blue-500 text-white rounded">Button</button>;
}

try {
  const inputModule = require('../src/components/input');
  Input = inputModule.Input || (() => <input className="px-3 py-2 border rounded" />);
} catch {
  Input = () => <input className="px-3 py-2 border rounded" />;
}

try {
  const labelModule = require('../src/components/label');
  Label = labelModule.Label || (() => <label className="text-sm font-medium">Label</label>);
} catch {
  Label = () => <label className="text-sm font-medium">Label</label>;
}

// ============================================
// MOCK COMPONENTS - Temporary replacements
// ============================================

// Executive variants
export const ExecutiveButton = ({ children, ...props }: any) => (
  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold" {...props}>
    {children}
  </button>
);

export const ActionButton = ({ children, ...props }: any) => (
  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg" {...props}>
    {children}
  </button>
);

export const AnalyticsButton = ({ children, ...props }: any) => (
  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg" {...props}>
    {children}
  </button>
);

export const FinanceButton = ({ children, ...props }: any) => (
  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg" {...props}>
    {children}
  </button>
);

// Form components
export const Textarea = ({ ...props }: any) => (
  <textarea className="px-3 py-2 border rounded-lg w-full" rows={4} {...props} />
);

export const Select = ({ children, ...props }: any) => <div className="relative" {...props}>{children}</div>;
export const SelectTrigger = ({ children, ...props }: any) => (
  <button className="px-3 py-2 border rounded-lg w-full text-left flex justify-between items-center" {...props}>
    {children}
    <span>▼</span>
  </button>
);
export const SelectValue = ({ placeholder, ...props }: any) => <span {...props}>{placeholder}</span>;
export const SelectContent = ({ children, ...props }: any) => (
  <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50" {...props}>{children}</div>
);
export const SelectItem = ({ children, ...props }: any) => (
  <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" {...props}>{children}</div>
);

export const Checkbox = ({ ...props }: any) => <input type="checkbox" className="w-4 h-4" {...props} />;
export const RadioGroup = ({ children, ...props }: any) => <div className="space-y-2" {...props}>{children}</div>;
export const Switch = ({ ...props }: any) => (
  <button className="w-11 h-6 bg-gray-300 rounded-full relative" {...props}>
    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
  </button>
);
export const Slider = ({ ...props }: any) => <input type="range" className="w-full" {...props} />;
export const Toggle = ({ children, ...props }: any) => (
  <button className="px-3 py-2 border rounded-lg" {...props}>{children}</button>
);
export const ToggleGroup = ({ children, ...props }: any) => (
  <div className="inline-flex rounded-lg border" {...props}>{children}</div>
);

// Data components
export const Table = ({ children, ...props }: any) => (
  <table className="w-full border-collapse" {...props}>{children}</table>
);
export const Timeline = ({ children, ...props }: any) => (
  <div className="space-y-4 relative before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-gray-200" {...props}>
    {children}
  </div>
);

// Navigation components
export const Tabs = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const TabsList = ({ children, ...props }: any) => (
  <div className="inline-flex bg-gray-100 rounded-lg p-1" {...props}>{children}</div>
);
export const TabsTrigger = ({ children, ...props }: any) => (
  <button className="px-3 py-1.5 rounded-md" {...props}>{children}</button>
);
export const TabsContent = ({ children, ...props }: any) => <div className="mt-4" {...props}>{children}</div>;

export const Breadcrumb = ({ children, ...props }: any) => <nav {...props}>{children}</nav>;
export const BreadcrumbList = ({ children, ...props }: any) => <ol className="flex space-x-2" {...props}>{children}</ol>;
export const BreadcrumbItem = ({ children, ...props }: any) => <li {...props}>{children}</li>;
export const BreadcrumbLink = ({ children, ...props }: any) => <a className="text-blue-500 hover:underline" {...props}>{children}</a>;
export const BreadcrumbPage = ({ children, ...props }: any) => <span className="text-gray-700" {...props}>{children}</span>;
export const BreadcrumbSeparator = () => <span className="text-gray-400">/</span>;

// Feedback components
export const Alert = ({ children, ...props }: any) => (
  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200" {...props}>{children}</div>
);
export const AlertTitle = ({ children, ...props }: any) => <h5 className="font-semibold mb-1" {...props}>{children}</h5>;
export const AlertDescription = ({ children, ...props }: any) => <div className="text-sm" {...props}>{children}</div>;

export const Toast = ({ children, ...props }: any) => (
  <div className="fixed bottom-4 right-4 p-4 bg-gray-900 text-white rounded-lg" {...props}>{children}</div>
);
export const toast = (message: string) => console.log('Toast:', message);

export const Progress = ({ value = 50, ...props }: any) => (
  <div className="w-full bg-gray-200 rounded-full h-2" {...props}>
    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${value}%` }}></div>
  </div>
);

export const Skeleton = ({ className = '', ...props }: any) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} {...props}></div>
);

Badge = Badge || (({ children, ...props }: any) => (
  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full" {...props}>{children}</span>
));

// Layout components
export const Card = ({ children, ...props }: any) => (
  <div className="border rounded-lg bg-white shadow-sm" {...props}>{children}</div>
);
export const CardHeader = ({ children, ...props }: any) => <div className="p-6 pb-3" {...props}>{children}</div>;
export const CardTitle = ({ children, ...props }: any) => <h3 className="text-lg font-semibold" {...props}>{children}</h3>;
export const CardDescription = ({ children, ...props }: any) => <p className="text-sm text-gray-500 mt-1" {...props}>{children}</p>;
export const CardContent = ({ children, ...props }: any) => <div className="p-6 pt-0" {...props}>{children}</div>;
export const CardFooter = ({ children, ...props }: any) => <div className="p-6 pt-0" {...props}>{children}</div>;

export const ScrollArea = ({ children, ...props }: any) => (
  <div className="overflow-auto" {...props}>{children}</div>
);

export const Resizable = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ResizablePanelGroup = ({ children, ...props }: any) => <div className="flex" {...props}>{children}</div>;
export const ResizablePanel = ({ children, ...props }: any) => <div className="flex-1" {...props}>{children}</div>;
export const ResizableHandle = () => <div className="w-1 bg-gray-300 cursor-col-resize"></div>;

export const Collapsible = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const CollapsibleTrigger = ({ children, ...props }: any) => <button {...props}>{children}</button>;
export const CollapsibleContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;

Separator = Separator || (() => <hr className="my-4 border-gray-200" />);

// Media components
export const Avatar = ({ children, ...props }: any) => (
  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center" {...props}>{children}</div>
);
export const AvatarImage = ({ src, ...props }: any) => <img src={src} className="w-full h-full rounded-full object-cover" {...props} />;
export const AvatarFallback = ({ children, ...props }: any) => <span {...props}>{children}</span>;

export const Carousel = ({ children, ...props }: any) => <div className="overflow-hidden" {...props}>{children}</div>;
export const CarouselContent = ({ children, ...props }: any) => <div className="flex" {...props}>{children}</div>;
export const CarouselItem = ({ children, ...props }: any) => <div className="min-w-full" {...props}>{children}</div>;
export const CarouselPrevious = () => <button className="p-2">←</button>;
export const CarouselNext = () => <button className="p-2">→</button>;

// Advanced components
export const Calendar = () => <div className="p-4 border rounded-lg">Calendar Component</div>;
export const ColorPicker = () => <div className="p-4 border rounded-lg">Color Picker Component</div>;
export const DatePicker = () => <div className="p-4 border rounded-lg">Date Picker Component</div>;
export const Rating = () => <div className="flex space-x-1">{'★★★★☆'}</div>;
export const Accordion = ({ children, ...props }: any) => <div className="space-y-2" {...props}>{children}</div>;
export const CommandPalette = () => <div className="p-4 border rounded-lg">Command Palette Component</div>;
export const DateRangePicker = () => <div className="p-4 border rounded-lg">Date Range Picker Component</div>;
export const TextAnimations = () => <div className="p-4 border rounded-lg">Text Animations Component</div>;

// Overlay components
export const Dialog = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DialogTrigger = ({ children, ...props }: any) => <button {...props}>{children}</button>;
export const DialogContent = ({ children, ...props }: any) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">{children}</div>
  </div>
);
export const DialogHeader = ({ children, ...props }: any) => <div className="mb-4" {...props}>{children}</div>;
export const DialogTitle = ({ children, ...props }: any) => <h2 className="text-lg font-semibold" {...props}>{children}</h2>;
export const DialogDescription = ({ children, ...props }: any) => <p className="text-sm text-gray-500" {...props}>{children}</p>;
export const DialogFooter = ({ children, ...props }: any) => <div className="mt-4 flex justify-end space-x-2" {...props}>{children}</div>;

// Similar pattern for other overlay components
export const Popover = Dialog;
export const PopoverTrigger = DialogTrigger;
export const PopoverContent = ({ children, ...props }: any) => (
  <div className="absolute bg-white border rounded-lg shadow-lg p-4 z-50" {...props}>{children}</div>
);

export const Tooltip = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const TooltipProvider = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const TooltipTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const TooltipContent = ({ children, ...props }: any) => (
  <div className="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 z-50" {...props}>{children}</div>
);

// All other components follow similar patterns...
export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetContent = DialogContent;
export const SheetHeader = DialogHeader;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
export const SheetFooter = DialogFooter;

export const DropdownMenu = ({ children, ...props }: any) => <div className="relative" {...props}>{children}</div>;
export const DropdownMenuTrigger = ({ children, ...props }: any) => <button {...props}>{children}</button>;
export const DropdownMenuContent = PopoverContent;
export const DropdownMenuItem = ({ children, ...props }: any) => (
  <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" {...props}>{children}</div>
);
export const DropdownMenuLabel = ({ children, ...props }: any) => (
  <div className="px-3 py-2 text-sm font-semibold text-gray-500" {...props}>{children}</div>
);
export const DropdownMenuSeparator = () => <hr className="my-1" />;

export const HoverCard = Popover;
export const HoverCardTrigger = PopoverTrigger;
export const HoverCardContent = PopoverContent;

export const ContextMenu = DropdownMenu;
export const ContextMenuTrigger = DropdownMenuTrigger;
export const ContextMenuContent = DropdownMenuContent;
export const ContextMenuItem = DropdownMenuItem;

export const Menubar = ({ children, ...props }: any) => <div className="flex space-x-2" {...props}>{children}</div>;
export const MenubarMenu = DropdownMenu;
export const MenubarTrigger = DropdownMenuTrigger;
export const MenubarContent = DropdownMenuContent;
export const MenubarItem = DropdownMenuItem;
export const MenubarSeparator = DropdownMenuSeparator;

export const NavigationMenu = ({ children, ...props }: any) => <nav {...props}>{children}</nav>;
export const NavigationMenuList = ({ children, ...props }: any) => <ul className="flex space-x-4" {...props}>{children}</ul>;
export const NavigationMenuItem = ({ children, ...props }: any) => <li {...props}>{children}</li>;
export const NavigationMenuTrigger = ({ children, ...props }: any) => <button className="px-3 py-2" {...props}>{children}</button>;
export const NavigationMenuContent = ({ children, ...props }: any) => <div className="absolute bg-white border rounded-lg shadow-lg p-4" {...props}>{children}</div>;
export const NavigationMenuLink = ({ children, ...props }: any) => <a className="text-blue-500 hover:underline" {...props}>{children}</a>;

export const Pagination = ({ children, ...props }: any) => <nav {...props}>{children}</nav>;
export const PaginationContent = ({ children, ...props }: any) => <ul className="flex space-x-2" {...props}>{children}</ul>;
export const PaginationItem = ({ children, ...props }: any) => <li {...props}>{children}</li>;
export const PaginationLink = ({ children, ...props }: any) => <a className="px-3 py-2 border rounded" {...props}>{children}</a>;
export const PaginationPrevious = () => <button className="px-3 py-2 border rounded">Previous</button>;
export const PaginationNext = () => <button className="px-3 py-2 border rounded">Next</button>;
export const PaginationEllipsis = () => <span>...</span>;

export const Stepper = () => <div className="flex items-center space-x-4">Step 1 → Step 2 → Step 3</div>;

// Special components
export const DataGrid = () => <div className="p-4 border rounded-lg">DataGrid Component</div>;
export const Chart = () => <div className="p-4 border rounded-lg">Chart Component</div>;
export const FileUpload = () => <div className="p-4 border rounded-lg">FileUpload Component</div>;
export const Sonner = () => <div className="p-4 border rounded-lg">Sonner Component</div>;
export const DataGridAdvanced = () => <div className="p-4 border rounded-lg">DataGridAdvanced Component</div>;
export const ErrorBoundary = ({ children }: any) => <div>{children}</div>;
export const FormsDemo = () => <div className="p-4 border rounded-lg">FormsDemo Component</div>;
export const Icon = () => <div className="p-4 border rounded-lg">Icon Component</div>;
export const Form = () => <div className="p-4 border rounded-lg">Form Component</div>;
export const UIProvider = ({ children }: any) => <div>{children}</div>;
export const Mail = () => <div className="p-4 border rounded-lg">Mail Component</div>;

// Export the few components that might work
export { Button, Input, Label, Badge, Separator };

// Export namespace for convenience
export const AllComponents = {
  Button,
  Input,
  Label,
  Badge,
  Separator,
  // ... all other components
};
