/**
 * Mock Data for Testing
 * Provides consistent test data across all component tests
 */

export const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    status: 'active',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Editor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    status: 'inactive',
  },
];

export const mockTableData = [
  {
    id: 1,
    product: 'Laptop',
    price: 999.99,
    quantity: 5,
    category: 'Electronics',
    inStock: true,
  },
  {
    id: 2,
    product: 'Mouse',
    price: 29.99,
    quantity: 50,
    category: 'Accessories',
    inStock: true,
  },
  {
    id: 3,
    product: 'Keyboard',
    price: 79.99,
    quantity: 0,
    category: 'Accessories',
    inStock: false,
  },
];

export const mockSelectOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4', disabled: true },
];

export const mockMenuItems = [
  {
    id: 'file',
    label: 'File',
    children: [
      { id: 'new', label: 'New', shortcut: 'Ctrl+N' },
      { id: 'open', label: 'Open', shortcut: 'Ctrl+O' },
      { id: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      { id: 'divider', type: 'separator' },
      { id: 'exit', label: 'Exit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    children: [
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
      { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
      { id: 'divider', type: 'separator' },
      { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
      { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
      { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
    ],
  },
];

export const mockChartData = [
  { month: 'Jan', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Apr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
];

export const mockTimelineEvents = [
  {
    id: '1',
    title: 'Project Started',
    description: 'Initial project kickoff meeting',
    date: '2024-01-01',
    type: 'milestone',
  },
  {
    id: '2',
    title: 'Design Phase',
    description: 'UI/UX design and prototyping',
    date: '2024-02-15',
    type: 'phase',
  },
  {
    id: '3',
    title: 'Development',
    description: 'Core functionality implementation',
    date: '2024-04-01',
    type: 'phase',
  },
  {
    id: '4',
    title: 'Testing',
    description: 'QA and user acceptance testing',
    date: '2024-06-01',
    type: 'phase',
  },
  {
    id: '5',
    title: 'Launch',
    description: 'Product launch and deployment',
    date: '2024-07-01',
    type: 'milestone',
  },
];

export const mockNotifications = [
  {
    id: '1',
    title: 'Success',
    message: 'Your changes have been saved.',
    type: 'success',
  },
  {
    id: '2',
    title: 'Warning',
    message: 'Please review your input.',
    type: 'warning',
  },
  {
    id: '3',
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    type: 'error',
  },
  {
    id: '4',
    title: 'Info',
    message: 'New features are available.',
    type: 'info',
  },
];
