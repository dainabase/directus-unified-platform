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

// Navigation components
export { Tabs } from '../../src/components/tabs';
export { NavigationMenu } from '../../src/components/navigation-menu';
export { Pagination } from '../../src/components/pagination';
export { Stepper } from '../../src/components/stepper';
export { Breadcrumb } from '../../src/components/breadcrumb';

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

// Media components
export { Avatar } from '../../src/components/avatar';
export { Carousel } from '../../src/components/carousel';

// Advanced components
export { Calendar } from '../../src/components/calendar';
export { ColorPicker } from '../../src/components/color-picker';
export { DatePicker } from '../../src/components/date-picker';
export { Rating } from '../../src/components/rating';

// Overlay components
export { Dialog } from '../../src/components/dialog';
export { Popover } from '../../src/components/popover';
export { Tooltip } from '../../src/components/tooltip';
export { Sheet } from '../../src/components/sheet';

// For components that might not have proper exports, provide fallbacks
export const DataGrid = () => <div>DataGrid Component</div>;
export const Chart = () => <div>Chart Component</div>;
export const FileUpload = () => <div>FileUpload Component</div>;

// Export all as a namespace for convenience
import * as AllComponents from '../../src/components';
export { AllComponents };
