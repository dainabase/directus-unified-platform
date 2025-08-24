/**
 * Component Status Checker - Diagnostic Script
 * This script checks which components are properly exported from the Design System
 */

// List of all components we're trying to use in the showcase
export const componentsToCheck = [
  // Buttons
  'Button',
  'ExecutiveButton',
  'ActionButton',
  'AnalyticsButton',
  'FinanceButton',
  
  // Forms
  'Input',
  'Label',
  'Textarea',
  'Select',
  'SelectContent',
  'SelectItem',
  'SelectTrigger',
  'SelectValue',
  'Checkbox',
  'RadioGroup',
  'Switch',
  'Slider',
  'Toggle',
  'ToggleGroup',
  
  // Data
  'Table',
  'Timeline',
  'DataGrid',
  'Chart',
  'DataGridAdvanced',
  
  // Navigation
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
  'Breadcrumb',
  'BreadcrumbItem',
  'BreadcrumbLink',
  'BreadcrumbList',
  'BreadcrumbPage',
  'BreadcrumbSeparator',
  'NavigationMenu',
  'NavigationMenuContent',
  'NavigationMenuItem',
  'NavigationMenuLink',
  'NavigationMenuList',
  'NavigationMenuTrigger',
  'Pagination',
  'PaginationContent',
  'PaginationEllipsis',
  'PaginationItem',
  'PaginationLink',
  'PaginationNext',
  'PaginationPrevious',
  'Stepper',
  
  // Feedback
  'Alert',
  'AlertDescription',
  'AlertTitle',
  'Toast',
  'toast',
  'Progress',
  'Skeleton',
  'Badge',
  
  // Layout
  'Card',
  'CardContent',
  'CardDescription',
  'CardFooter',
  'CardHeader',
  'CardTitle',
  'ScrollArea',
  'Resizable',
  'ResizableHandle',
  'ResizablePanel',
  'ResizablePanelGroup',
  'Collapsible',
  'CollapsibleContent',
  'CollapsibleTrigger',
  'Separator',
  
  // Media
  'Avatar',
  'AvatarFallback',
  'AvatarImage',
  'Carousel',
  'CarouselContent',
  'CarouselItem',
  'CarouselNext',
  'CarouselPrevious',
  
  // Advanced
  'Calendar',
  'ColorPicker',
  'DatePicker',
  'Rating',
  'Accordion',
  'CommandPalette',
  'DateRangePicker',
  'TextAnimations',
  
  // Overlays
  'Dialog',
  'DialogContent',
  'DialogDescription',
  'DialogFooter',
  'DialogHeader',
  'DialogTitle',
  'DialogTrigger',
  'Popover',
  'PopoverContent',
  'PopoverTrigger',
  'Tooltip',
  'TooltipContent',
  'TooltipProvider',
  'TooltipTrigger',
  'Sheet',
  'SheetContent',
  'SheetDescription',
  'SheetFooter',
  'SheetHeader',
  'SheetTitle',
  'SheetTrigger',
  'DropdownMenu',
  'DropdownMenuContent',
  'DropdownMenuItem',
  'DropdownMenuLabel',
  'DropdownMenuSeparator',
  'DropdownMenuTrigger',
  'HoverCard',
  'HoverCardContent',
  'HoverCardTrigger',
  'ContextMenu',
  'ContextMenuContent',
  'ContextMenuItem',
  'ContextMenuTrigger',
  'Menubar',
  'MenubarContent',
  'MenubarItem',
  'MenubarMenu',
  'MenubarSeparator',
  'MenubarTrigger',
  
  // Others
  'FileUpload',
  'Sonner',
  'ErrorBoundary',
  'FormsDemo',
  'Icon',
  'Form',
  'UIProvider'
];

// Function to check component status
export async function checkComponentStatus() {
  const results = {
    available: [] as string[],
    missing: [] as string[],
    error: [] as string[]
  };
  
  console.log('🔍 Checking component status...');
  console.log('=' .repeat(50));
  
  for (const component of componentsToCheck) {
    try {
      // Try to import from the main index
      const module = await import('../src/index');
      
      if (module[component]) {
        results.available.push(component);
        console.log(`✅ ${component} - Available`);
      } else {
        results.missing.push(component);
        console.log(`❌ ${component} - Not exported from index`);
      }
    } catch (error) {
      results.error.push(component);
      console.log(`🔴 ${component} - Import error: ${error}`);
    }
  }
  
  console.log('=' .repeat(50));
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Available: ${results.available.length}/${componentsToCheck.length}`);
  console.log(`❌ Missing: ${results.missing.length}/${componentsToCheck.length}`);
  console.log(`🔴 Errors: ${results.error.length}/${componentsToCheck.length}`);
  
  if (results.missing.length > 0) {
    console.log('\n⚠️ Missing components need to be:');
    console.log('1. Created as actual components OR');
    console.log('2. Added as exports to their parent components OR');
    console.log('3. Created as stub components');
  }
  
  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkComponentStatus().catch(console.error);
}
