/**
 * CommandPalette Stories - ULTRA-SOPHISTICATED DEMOS
 * Command Palette showcase with 10+ interactive stories
 * Target: 12,000+ bytes, comprehensive use cases, enterprise demos
 * 
 * Story Categories:
 * 1. Basic Command Palette
 * 2. With Icons & Groups  
 * 3. Real-time Search Results
 * 4. Recent Commands & History
 * 5. Custom Actions & Shortcuts
 * 6. Large Dataset Performance Demo
 * 7. Developer Tools Style
 * 8. E-commerce Actions
 * 9. Admin Dashboard Commands
 * 10. Advanced Customization & Theming
 * 11. Custom Triggers & Interactive
 * 12. Error States & Edge Cases Demo
 */

import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useCallback, useEffect } from "react";
import { CommandPalette, CommandPaletteItem } from "./index";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof CommandPalette> = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: `
# CommandPalette

A powerful command palette component for executing actions via keyboard shortcuts and search.
Perfect for power users and productivity-focused applications.

## Features

- 🔍 **Real-time search** with fuzzy matching
- ⌨️ **Keyboard shortcuts** (Cmd+K/Ctrl+K)
- 🎯 **Action execution** with onSelect callbacks
- 📂 **Command grouping** and categorization
- 🎨 **Icons & shortcuts** display
- 🚀 **High performance** with large datasets
- ♿ **Full accessibility** support
- 🎨 **Customizable triggers** and styling

## Usage

\`\`\`tsx
import { CommandPalette } from "@dainabase/ui";

const items = [
  {
    id: "search",
    label: "Search Files",
    group: "Navigation", 
    icon: "🔍",
    shortcut: "Cmd+P",
    onSelect: () => console.log("Search executed"),
  },
];

<CommandPalette items={items} />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    items: {
      description: "Array of command items to display",
      control: "object",
    },
    placeholder: {
      description: "Placeholder text for search input",
      control: "text",
    },
    emptyText: {
      description: "Text shown when no commands match search",
      control: "text", 
    },
    trigger: {
      description: "Custom trigger element (optional)",
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

// =================================================================
// 1. BASIC COMMAND PALETTE
// =================================================================
export const Basic: Story = {
  name: "1. Basic Command Palette",
  args: {
    items: [
      { 
        id: "dashboard", 
        label: "Go to Dashboard", 
        group: "Navigation",
        onSelect: action("dashboard-selected"),
      },
      { 
        id: "reports", 
        label: "Create Report", 
        group: "Actions", 
        shortcut: "R",
        onSelect: action("report-created"),
      },
      { 
        id: "settings", 
        label: "Open Settings", 
        group: "Navigation",
        onSelect: action("settings-opened"),
      },
      { 
        id: "help", 
        label: "Show Help", 
        group: "Support",
        onSelect: action("help-shown"),
      },
    ],
    placeholder: "Search commands...",
    emptyText: "No commands found",
  },
  parameters: {
    docs: {
      description: {
        story: `
### Basic Command Palette

Simple command palette with essential functionality:
- Press **Cmd+K** (Mac) or **Ctrl+K** (PC) to open
- Type to search commands
- Click or press **Enter** to execute
- Press **Escape** to close

This demo shows the basic grouping and command execution.
        `,
      },
    },
  },
};

// =================================================================
// 2. WITH ICONS & GROUPS
// =================================================================
export const WithIconsAndGroups: Story = {
  name: "2. With Icons & Groups",
  args: {
    items: [
      // Navigation Group
      { 
        id: "home", 
        label: "Home Page", 
        group: "Navigation",
        icon: "🏠",
        shortcut: "H",
        onSelect: action("home-selected"),
      },
      { 
        id: "search", 
        label: "Search Files", 
        group: "Navigation",
        icon: "🔍", 
        shortcut: "Cmd+P",
        onSelect: action("search-opened"),
      },
      { 
        id: "recent", 
        label: "Recent Items", 
        group: "Navigation",
        icon: "🕒",
        shortcut: "Cmd+R", 
        onSelect: action("recent-shown"),
      },
      
      // File Operations
      { 
        id: "new-file", 
        label: "New File", 
        group: "File Operations",
        icon: "📄",
        shortcut: "Cmd+N",
        onSelect: action("file-created"),
      },
      { 
        id: "save", 
        label: "Save Current", 
        group: "File Operations",
        icon: "💾",
        shortcut: "Cmd+S",
        onSelect: action("file-saved"),
      },
      { 
        id: "save-all", 
        label: "Save All", 
        group: "File Operations",
        icon: "💾",
        shortcut: "Cmd+Shift+S",
        onSelect: action("all-saved"),
      },
      
      // Tools & Utilities
      { 
        id: "calculator", 
        label: "Calculator", 
        group: "Tools & Utilities",
        icon: "🧮",
        onSelect: action("calculator-opened"),
      },
      { 
        id: "color-picker", 
        label: "Color Picker", 
        group: "Tools & Utilities",
        icon: "🎨",
        onSelect: action("color-picker-opened"),
      },
      { 
        id: "terminal", 
        label: "Terminal", 
        group: "Tools & Utilities",
        icon: "💻",
        shortcut: "Cmd+`",
        onSelect: action("terminal-opened"),
      },
      
      // System
      { 
        id: "preferences", 
        label: "Preferences", 
        group: "System",
        icon: "⚙️",
        shortcut: "Cmd+,",
        onSelect: action("preferences-opened"),
      },
      { 
        id: "quit", 
        label: "Quit Application", 
        group: "System",
        icon: "🚪",
        shortcut: "Cmd+Q",
        onSelect: action("app-quit"),
      },
    ],
    placeholder: "Search commands with icons...",
    emptyText: "No matching commands found",
  },
  parameters: {
    docs: {
      description: {
        story: `
### Command Palette with Icons & Groups

Enhanced version featuring:
- **Visual icons** for quick command recognition
- **Organized groups** (Navigation, File Operations, Tools, System)
- **Keyboard shortcuts** displayed for each command
- **Rich visual hierarchy** with proper grouping

Try searching for terms like "file", "save", or "tool" to see filtering in action.
        `,
      },
    },
  },
};

// =================================================================
// 3. REAL-TIME SEARCH RESULTS
// =================================================================
const SearchResultsDemo = () => {
  const [searchResults, setSearchResults] = useState<CommandPaletteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockSearchAPI = useCallback(async (query: string): Promise<CommandPaletteItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allItems = [
      { id: "user-1", label: "John Doe", group: "Users", icon: "👤" },
      { id: "user-2", label: "Jane Smith", group: "Users", icon: "👤" },
      { id: "user-3", label: "Bob Johnson", group: "Users", icon: "👤" },
      { id: "file-1", label: "project-plan.pdf", group: "Files", icon: "📄" },
      { id: "file-2", label: "budget-2024.xlsx", group: "Files", icon: "📊" },
      { id: "file-3", label: "meeting-notes.md", group: "Files", icon: "📝" },
      { id: "task-1", label: "Review PR #123", group: "Tasks", icon: "✅" },
      { id: "task-2", label: "Update documentation", group: "Tasks", icon: "📚" },
      { id: "task-3", label: "Fix login bug", group: "Tasks", icon: "🐛" },
    ];

    return allItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await mockSearchAPI(query);
      setSearchResults(results.map(item => ({
        ...item,
        onSelect: action(`search-result-selected-${item.id}`),
      })));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mockSearchAPI]);

  // Simulate search on mount
  useEffect(() => {
    handleSearch("project");
  }, [handleSearch]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p><strong>Real-time Search Demo</strong></p>
        <p>Try searching for: "john", "pdf", "task", "update"</p>
        {isLoading && <p className="text-blue-600">🔄 Searching...</p>}
      </div>
      
      <CommandPalette
        items={searchResults}
        placeholder="Search users, files, and tasks..."
        emptyText="No results found. Try a different search term."
      />
    </div>
  );
};

export const RealTimeSearch: Story = {
  name: "3. Real-time Search Results",
  render: () => <SearchResultsDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Real-time Search with API Integration

This demo simulates real-time search functionality:
- **API integration** with simulated 300ms delay
- **Loading states** during search
- **Dynamic results** from multiple data sources
- **Cross-category search** (Users, Files, Tasks)

Perfect for applications that need to search across:
- User directories
- File systems  
- Task management systems
- Knowledge bases
        `,
      },
    },
  },
};

// =================================================================
// 4. RECENT COMMANDS & HISTORY
// =================================================================
const RecentCommandsDemo = () => {
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<Array<{ id: string; label: string; timestamp: Date }>>([]);

  const allCommands: CommandPaletteItem[] = [
    { id: "deploy", label: "Deploy to Production", group: "Deployment", icon: "🚀" },
    { id: "rollback", label: "Rollback Last Deploy", group: "Deployment", icon: "⏪" },
    { id: "logs", label: "View Server Logs", group: "Monitoring", icon: "📊" },
    { id: "metrics", label: "System Metrics", group: "Monitoring", icon: "📈" },
    { id: "backup", label: "Create Backup", group: "Maintenance", icon: "💾" },
    { id: "cleanup", label: "Cleanup Old Files", group: "Maintenance", icon: "🧹" },
    { id: "users", label: "Manage Users", group: "Admin", icon: "👥" },
    { id: "permissions", label: "Update Permissions", group: "Admin", icon: "🔐" },
  ];

  const executeCommand = useCallback((commandId: string, commandLabel: string) => {
    // Add to recent commands (limit to 5)
    setRecentCommands(prev => {
      const updated = [commandId, ...prev.filter(id => id !== commandId)];
      return updated.slice(0, 5);
    });

    // Add to command history
    setCommandHistory(prev => [
      { id: commandId, label: commandLabel, timestamp: new Date() },
      ...prev.slice(0, 9) // Keep last 10
    ]);

    action(`command-executed-${commandId}`)();
  }, []);

  const commandsWithHistory = allCommands.map(cmd => {
    const isRecent = recentCommands.includes(cmd.id);
    return {
      ...cmd,
      label: isRecent ? `⭐ ${cmd.label}` : cmd.label,
      group: isRecent ? "Recent Commands" : cmd.group,
      onSelect: () => executeCommand(cmd.id, cmd.label),
    };
  });

  // Sort to put recent commands first
  const sortedCommands = commandsWithHistory.sort((a, b) => {
    const aIsRecent = recentCommands.includes(a.id);
    const bIsRecent = recentCommands.includes(b.id);
    
    if (aIsRecent && !bIsRecent) return -1;
    if (!aIsRecent && bIsRecent) return 1;
    
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Recent Commands & History Demo</strong></p>
        <p>Execute commands to see them marked as recent (⭐) and moved to top</p>
        
        {commandHistory.length > 0 && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium mb-2">Command History:</p>
            <ul className="text-xs space-y-1">
              {commandHistory.slice(0, 5).map((entry, index) => (
                <li key={index} className="flex justify-between">
                  <span>{entry.label}</span>
                  <span className="text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <CommandPalette
        items={sortedCommands}
        placeholder="Search commands (recent commands appear first)..."
        emptyText="No commands found"
      />
    </div>
  );
};

export const RecentCommandsHistory: Story = {
  name: "4. Recent Commands & History",
  render: () => <RecentCommandsDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Recent Commands & History Tracking

Advanced command palette with memory:
- **Recent commands** marked with ⭐ and prioritized at top
- **Command history** with timestamps
- **Smart sorting** - recent items appear first
- **Usage tracking** for power user workflows

Execute a few commands to see the recent/history behavior in action.
Perfect for applications where users repeatedly use certain commands.
        `,
      },
    },
  },
};

// =================================================================
// 5. CUSTOM ACTIONS & SHORTCUTS
// =================================================================
const CustomActionsDemo = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 3000);
  }, []);

  const customCommands: CommandPaletteItem[] = [
    {
      id: "toggle-theme",
      label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
      group: "Appearance",
      icon: theme === 'light' ? '🌙' : '☀️',
      shortcut: "Cmd+Shift+T",
      onSelect: () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        addNotification(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
      },
    },
    {
      id: "toggle-fullscreen",
      label: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
      group: "View",
      icon: isFullscreen ? '🪟' : '📺',
      shortcut: "F11",
      onSelect: () => {
        setIsFullscreen(prev => !prev);
        addNotification(isFullscreen ? "Exited fullscreen" : "Entered fullscreen");
      },
    },
    {
      id: "take-screenshot",
      label: "Take Screenshot",
      group: "Tools",
      icon: "📸",
      shortcut: "Cmd+Shift+3",
      onSelect: () => addNotification("Screenshot saved to clipboard"),
    },
    {
      id: "copy-url",
      label: "Copy Current URL",
      group: "Tools", 
      icon: "🔗",
      shortcut: "Cmd+L",
      onSelect: () => addNotification("URL copied to clipboard"),
    },
    {
      id: "refresh-data",
      label: "Refresh All Data",
      group: "Actions",
      icon: "🔄",
      shortcut: "Cmd+R",
      onSelect: () => addNotification("Data refreshed successfully"),
    },
    {
      id: "export-data",
      label: "Export Data",
      group: "Actions",
      icon: "📤",
      shortcut: "Cmd+E",
      onSelect: () => addNotification("Data export started"),
    },
    {
      id: "clear-cache",
      label: "Clear Cache",
      group: "System",
      icon: "🧹",
      onSelect: () => addNotification("Cache cleared"),
    },
    {
      id: "restart-app",
      label: "Restart Application", 
      group: "System",
      icon: "🔄",
      shortcut: "Cmd+Shift+R",
      onSelect: () => addNotification("Application will restart in 3 seconds..."),
    },
  ];

  return (
    <div className={`space-y-4 p-4 rounded-lg transition-colors ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <div className="text-sm space-y-2">
        <p><strong>Custom Actions & Shortcuts Demo</strong></p>
        <p>Interactive commands that modify the demo state in real-time</p>
        
        {notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.map((notification, index) => (
              <div 
                key={index}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-xs"
              >
                ✅ {notification}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs opacity-70">
          Current theme: {theme} | Fullscreen: {isFullscreen ? 'Yes' : 'No'}
        </div>
      </div>
      
      <CommandPalette
        items={customCommands}
        placeholder="Execute custom actions..."
        emptyText="No actions found"
      />
    </div>
  );
};

export const CustomActionsShortcuts: Story = {
  name: "5. Custom Actions & Shortcuts",
  render: () => <CustomActionsDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Custom Actions & Shortcuts

Interactive command palette with real-time state changes:
- **Theme switching** (Light/Dark mode)
- **Fullscreen toggle** with state tracking
- **System actions** (Screenshot, Clear cache, Restart)
- **Notification system** for action feedback
- **Dynamic command labels** based on current state

Try commands like "theme", "fullscreen", "screenshot" to see the interactive behavior.
        `,
      },
    },
  },
};

// =================================================================
// 6. LARGE DATASET PERFORMANCE DEMO
// =================================================================
const LargeDatasetDemo = () => {
  const [datasetSize, setDatasetSize] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceStats, setPerformanceStats] = useState<{
    renderTime: number;
    searchTime: number;
    filteredCount: number;
  } | null>(null);

  const generateLargeDataset = useCallback((size: number): CommandPaletteItem[] => {
    const startTime = performance.now();
    
    const categories = ['Navigation', 'Actions', 'Tools', 'System', 'Files', 'Users', 'Reports', 'Settings'];
    const icons = ['🔍', '⚙️', '📄', '👤', '📊', '🚀', '💾', '🎯', '📝', '🔧'];
    const actions = ['Create', 'Edit', 'Delete', 'View', 'Download', 'Share', 'Copy', 'Move', 'Archive'];
    const objects = ['File', 'User', 'Report', 'Project', 'Task', 'Note', 'Image', 'Document'];
    
    const items = Array.from({ length: size }, (_, i) => {
      const action = actions[i % actions.length];
      const object = objects[i % objects.length];
      const category = categories[i % categories.length];
      const icon = icons[i % icons.length];
      
      return {
        id: `item-${i}`,
        label: `${action} ${object} ${i + 1}`,
        group: category,
        icon,
        shortcut: i < 100 ? `Cmd+${i}` : undefined,
        onSelect: action(`large-dataset-item-${i}-selected`),
      };
    });
    
    const renderTime = performance.now() - startTime;
    setPerformanceStats(prev => prev ? { ...prev, renderTime } : { renderTime, searchTime: 0, filteredCount: size });
    
    return items;
  }, []);

  const largeDataset = React.useMemo(() => generateLargeDataset(datasetSize), [datasetSize, generateLargeDataset]);

  const filteredItems = React.useMemo(() => {
    const startTime = performance.now();
    
    const filtered = searchTerm 
      ? largeDataset.filter(item => 
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.group.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : largeDataset;
    
    const searchTime = performance.now() - startTime;
    setPerformanceStats(prev => prev ? { 
      ...prev, 
      searchTime, 
      filteredCount: filtered.length 
    } : { renderTime: 0, searchTime, filteredCount: filtered.length });
    
    return filtered;
  }, [largeDataset, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Large Dataset Performance Demo</strong></p>
        
        <div className="flex gap-2 items-center">
          <label>Dataset size:</label>
          <select 
            value={datasetSize} 
            onChange={(e) => setDatasetSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={100}>100 items</option>
            <option value={500}>500 items</option>
            <option value={1000}>1,000 items</option>
            <option value={2000}>2,000 items</option>
            <option value={5000}>5,000 items</option>
          </select>
        </div>
        
        {performanceStats && (
          <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
            <p><strong>Performance Metrics:</strong></p>
            <p>• Render time: {performanceStats.renderTime.toFixed(2)}ms</p>
            <p>• Search time: {performanceStats.searchTime.toFixed(2)}ms</p>
            <p>• Items shown: {performanceStats.filteredCount.toLocaleString()}</p>
            <p>• Total items: {datasetSize.toLocaleString()}</p>
          </div>
        )}
        
        <p>Try searching: "Create", "User", "File", "Report", "Project"</p>
      </div>
      
      <CommandPalette
        items={filteredItems}
        placeholder={`Search ${datasetSize.toLocaleString()} commands...`}
        emptyText="No commands match your search"
      />
    </div>
  );
};

export const LargeDatasetPerformance: Story = {
  name: "6. Large Dataset Performance",
  render: () => <LargeDatasetDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Large Dataset Performance Testing

Stress test the command palette with large datasets:
- **Scalable from 100 to 5,000+ items**
- **Performance monitoring** with render and search times
- **Real-time filtering** with performance metrics
- **Memory efficiency** testing
- **Smooth scrolling** with virtual rendering

Perfect for testing command palettes in enterprise applications with extensive command sets.
        `,
      },
    },
  },
};

// =================================================================
// 7. DEVELOPER TOOLS STYLE
// =================================================================
export const DeveloperToolsStyle: Story = {
  name: "7. Developer Tools Style",
  args: {
    items: [
      // Code Actions
      { 
        id: "format-code", 
        label: "Format Document", 
        group: "Code Actions",
        icon: "✨",
        shortcut: "Shift+Alt+F",
        onSelect: action("format-code"),
      },
      { 
        id: "organize-imports", 
        label: "Organize Imports", 
        group: "Code Actions",
        icon: "📦",
        shortcut: "Shift+Alt+O",
        onSelect: action("organize-imports"),
      },
      { 
        id: "rename-symbol", 
        label: "Rename Symbol", 
        group: "Code Actions",
        icon: "✏️",
        shortcut: "F2",
        onSelect: action("rename-symbol"),
      },
      
      // Debugging
      { 
        id: "start-debugging", 
        label: "Start Debugging", 
        group: "Debug",
        icon: "🐛",
        shortcut: "F5",
        onSelect: action("start-debug"),
      },
      { 
        id: "toggle-breakpoint", 
        label: "Toggle Breakpoint", 
        group: "Debug",
        icon: "🔴",
        shortcut: "F9",
        onSelect: action("toggle-breakpoint"),
      },
      { 
        id: "step-over", 
        label: "Step Over", 
        group: "Debug",
        icon: "⏭️",
        shortcut: "F10",
        onSelect: action("step-over"),
      },
      
      // Git Operations
      { 
        id: "git-commit", 
        label: "Git: Commit All", 
        group: "Source Control",
        icon: "✅",
        shortcut: "Cmd+Enter",
        onSelect: action("git-commit"),
      },
      { 
        id: "git-push", 
        label: "Git: Push", 
        group: "Source Control",
        icon: "📤",
        onSelect: action("git-push"),
      },
      { 
        id: "git-pull", 
        label: "Git: Pull", 
        group: "Source Control",
        icon: "📥",
        onSelect: action("git-pull"),
      },
      { 
        id: "git-branch", 
        label: "Git: Create Branch", 
        group: "Source Control",
        icon: "🌿",
        onSelect: action("git-branch"),
      },
      
      // Terminal
      { 
        id: "new-terminal", 
        label: "New Terminal", 
        group: "Terminal",
        icon: "💻",
        shortcut: "Ctrl+Shift+`",
        onSelect: action("new-terminal"),
      },
      { 
        id: "run-task", 
        label: "Run Task", 
        group: "Terminal",
        icon: "⚡",
        shortcut: "Cmd+Shift+P",
        onSelect: action("run-task"),
      },
      
      // Extensions
      { 
        id: "install-extension", 
        label: "Install Extension", 
        group: "Extensions",
        icon: "🧩",
        onSelect: action("install-extension"),
      },
      { 
        id: "reload-window", 
        label: "Reload Window", 
        group: "Developer",
        icon: "🔄",
        shortcut: "Cmd+R",
        onSelect: action("reload-window"),
      },
      { 
        id: "toggle-devtools", 
        label: "Toggle Developer Tools", 
        group: "Developer",
        icon: "🔧",
        shortcut: "F12",
        onSelect: action("toggle-devtools"),
      },
    ],
    placeholder: "Search developer commands...",
    emptyText: "No developer commands found",
  },
  parameters: {
    docs: {
      description: {
        story: `
### Developer Tools Style Command Palette

VSCode-inspired command palette with developer-focused commands:
- **Code actions** (Format, Organize Imports, Rename)
- **Debugging controls** (Start/Stop, Breakpoints, Step Over)
- **Git integration** (Commit, Push, Pull, Branch)
- **Terminal operations** (New Terminal, Run Task)
- **Extension management** (Install, Reload)

Perfect for IDEs, code editors, and development tools.
        `,
      },
    },
  },
};

// =================================================================
// 8. E-COMMERCE ACTIONS
// =================================================================
const EcommerceDemo = () => {
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [orderHistory, setOrderHistory] = useState<Array<{ id: string; date: Date; total: number }>>([]);

  const addToCart = useCallback((product: { id: string; name: string; price: number }) => {
    setCart(prev => [...prev, product]);
    action(`add-to-cart-${product.id}`)();
  }, []);

  const createOrder = useCallback(() => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const order = {
      id: `order-${Date.now()}`,
      date: new Date(),
      total,
    };
    
    setOrderHistory(prev => [order, ...prev.slice(0, 4)]);
    setCart([]);
    action('order-created')(order);
  }, [cart]);

  const ecommerceCommands: CommandPaletteItem[] = [
    // Quick Add Products
    { 
      id: "add-laptop", 
      label: "Add MacBook Pro to Cart", 
      group: "Quick Add",
      icon: "💻",
      shortcut: "1",
      onSelect: () => addToCart({ id: "laptop", name: "MacBook Pro", price: 1999 }),
    },
    { 
      id: "add-phone", 
      label: "Add iPhone to Cart", 
      group: "Quick Add",
      icon: "📱",
      shortcut: "2",
      onSelect: () => addToCart({ id: "phone", name: "iPhone", price: 999 }),
    },
    { 
      id: "add-headphones", 
      label: "Add AirPods to Cart", 
      group: "Quick Add",
      icon: "🎧",
      shortcut: "3",
      onSelect: () => addToCart({ id: "headphones", name: "AirPods", price: 249 }),
    },
    
    // Cart Actions
    { 
      id: "view-cart", 
      label: `View Cart (${cart.length} items)`, 
      group: "Cart",
      icon: "🛒",
      shortcut: "C",
      onSelect: action("view-cart"),
    },
    { 
      id: "checkout", 
      label: "Proceed to Checkout", 
      group: "Cart",
      icon: "💳",
      shortcut: "Enter",
      onSelect: createOrder,
    },
    { 
      id: "clear-cart", 
      label: "Clear Cart", 
      group: "Cart",
      icon: "🗑️",
      onSelect: () => {
        setCart([]);
        action("clear-cart")();
      },
    },
    
    // Navigation
    { 
      id: "browse-products", 
      label: "Browse All Products", 
      group: "Navigation",
      icon: "🛍️",
      shortcut: "B",
      onSelect: action("browse-products"),
    },
    { 
      id: "search-products", 
      label: "Search Products", 
      group: "Navigation",
      icon: "🔍",
      shortcut: "S",
      onSelect: action("search-products"),
    },
    { 
      id: "view-orders", 
      label: "Order History", 
      group: "Navigation",
      icon: "📋",
      shortcut: "H",
      onSelect: action("view-orders"),
    },
    
    // Customer Service
    { 
      id: "contact-support", 
      label: "Contact Support", 
      group: "Help",
      icon: "💬",
      onSelect: action("contact-support"),
    },
    { 
      id: "track-order", 
      label: "Track Order", 
      group: "Help",
      icon: "📦",
      onSelect: action("track-order"),
    },
    { 
      id: "return-item", 
      label: "Return Item", 
      group: "Help",
      icon: "↩️",
      onSelect: action("return-item"),
    },
  ];

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>E-commerce Action Center</strong></p>
        <p>Quick actions for shopping, cart management, and customer service</p>
        
        <div className="bg-blue-50 p-3 rounded space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Shopping Cart:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {cart.length > 0 && (
            <ul className="text-xs space-y-1">
              {cart.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>${item.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {orderHistory.length > 0 && (
          <div className="bg-green-50 p-3 rounded">
            <p className="font-medium mb-2">Recent Orders:</p>
            <ul className="text-xs space-y-1">
              {orderHistory.map((order) => (
                <li key={order.id} className="flex justify-between">
                  <span>{order.id}</span>
                  <span>${order.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <CommandPalette
        items={ecommerceCommands}
        placeholder="Search products, manage cart, get help..."
        emptyText="No actions found"
      />
    </div>
  );
};

export const EcommerceActions: Story = {
  name: "8. E-commerce Actions",
  render: () => <EcommerceDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### E-commerce Action Center

Shopping-focused command palette with:
- **Quick product addition** to cart with number shortcuts
- **Cart management** (View, Checkout, Clear)
- **Navigation shortcuts** (Browse, Search, Orders)
- **Customer service** (Support, Tracking, Returns)
- **Real-time cart state** with running total
- **Order history** tracking

Try: "Add MacBook", "View Cart", "Checkout", "Contact Support"
        `,
      },
    },
  },
};

// =================================================================
// 9. ADMIN DASHBOARD COMMANDS
// =================================================================
export const AdminDashboardCommands: Story = {
  name: "9. Admin Dashboard Commands",
  args: {
    items: [
      // User Management
      { 
        id: "create-user", 
        label: "Create New User", 
        group: "User Management",
        icon: "👤",
        shortcut: "Cmd+U",
        onSelect: action("create-user"),
      },
      { 
        id: "bulk-import", 
        label: "Bulk Import Users", 
        group: "User Management",
        icon: "📥",
        onSelect: action("bulk-import"),
      },
      { 
        id: "export-users", 
        label: "Export User List", 
        group: "User Management",
        icon: "📤",
        onSelect: action("export-users"),
      },
      { 
        id: "user-permissions", 
        label: "Manage Permissions", 
        group: "User Management",
        icon: "🔐",
        onSelect: action("user-permissions"),
      },
      
      // System Monitoring
      { 
        id: "system-health", 
        label: "System Health Check", 
        group: "Monitoring",
        icon: "💚",
        shortcut: "Cmd+H",
        onSelect: action("system-health"),
      },
      { 
        id: "view-logs", 
        label: "View System Logs", 
        group: "Monitoring",
        icon: "📊",
        shortcut: "Cmd+L",
        onSelect: action("view-logs"),
      },
      { 
        id: "performance-metrics", 
        label: "Performance Metrics", 
        group: "Monitoring",
        icon: "📈",
        onSelect: action("performance-metrics"),
      },
      { 
        id: "alert-management", 
        label: "Manage Alerts", 
        group: "Monitoring",
        icon: "🚨",
        onSelect: action("alert-management"),
      },
      
      // Content Management
      { 
        id: "publish-content", 
        label: "Publish Content", 
        group: "Content",
        icon: "📝",
        shortcut: "Cmd+P",
        onSelect: action("publish-content"),
      },
      { 
        id: "moderate-comments", 
        label: "Moderate Comments", 
        group: "Content",
        icon: "💬",
        onSelect: action("moderate-comments"),
      },
      { 
        id: "backup-database", 
        label: "Backup Database", 
        group: "Content",
        icon: "💾",
        onSelect: action("backup-database"),
      },
      
      // Security & Compliance
      { 
        id: "security-scan", 
        label: "Run Security Scan", 
        group: "Security",
        icon: "🔒",
        onSelect: action("security-scan"),
      },
      { 
        id: "audit-logs", 
        label: "View Audit Logs", 
        group: "Security",
        icon: "📋",
        onSelect: action("audit-logs"),
      },
      { 
        id: "gdpr-export", 
        label: "GDPR Data Export", 
        group: "Security",
        icon: "🛡️",
        onSelect: action("gdpr-export"),
      },
      
      // Quick Actions
      { 
        id: "maintenance-mode", 
        label: "Toggle Maintenance Mode", 
        group: "Quick Actions",
        icon: "🚧",
        shortcut: "Cmd+M",
        onSelect: action("maintenance-mode"),
      },
      { 
        id: "clear-cache", 
        label: "Clear All Caches", 
        group: "Quick Actions",
        icon: "🧹",
        shortcut: "Cmd+Shift+C",
        onSelect: action("clear-cache"),
      },
      { 
        id: "restart-services", 
        label: "Restart Services", 
        group: "Quick Actions",
        icon: "🔄",
        onSelect: action("restart-services"),
      },
    ],
    placeholder: "Search admin commands...",
    emptyText: "No admin commands found",
  },
  parameters: {
    docs: {
      description: {
        story: `
### Admin Dashboard Commands

Enterprise-grade admin command palette:
- **User Management** (Create, Import, Export, Permissions)
- **System Monitoring** (Health, Logs, Metrics, Alerts)
- **Content Management** (Publish, Moderate, Backup)
- **Security & Compliance** (Scans, Audits, GDPR)
- **Quick Actions** (Maintenance, Cache, Restart)

Perfect for admin dashboards, CMS backends, and enterprise applications.
        `,
      },
    },
  },
};

// =================================================================
// 10. ADVANCED CUSTOMIZATION & THEMING
// =================================================================
const CustomizationDemo = () => {
  const [customTheme, setCustomTheme] = useState({
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    border: '#d1d5db',
  });

  const [customPlaceholder, setCustomPlaceholder] = useState("Search with custom styling...");
  const [customEmpty, setCustomEmpty] = useState("No results in custom theme");

  const customCommands: CommandPaletteItem[] = [
    { 
      id: "theme-blue", 
      label: "Blue Theme", 
      group: "Themes",
      icon: "🔵",
      onSelect: () => setCustomTheme({
        primary: '#3b82f6',
        background: '#ffffff', 
        text: '#1f2937',
        border: '#d1d5db',
      }),
    },
    { 
      id: "theme-green", 
      label: "Green Theme", 
      group: "Themes",
      icon: "🟢",
      onSelect: () => setCustomTheme({
        primary: '#10b981',
        background: '#f0fdf4',
        text: '#14532d',
        border: '#bbf7d0',
      }),
    },
    { 
      id: "theme-purple", 
      label: "Purple Theme", 
      group: "Themes",
      icon: "🟣",
      onSelect: () => setCustomTheme({
        primary: '#8b5cf6',
        background: '#faf5ff',
        text: '#581c87',
        border: '#d8b4fe',
      }),
    },
    { 
      id: "theme-dark", 
      label: "Dark Theme", 
      group: "Themes",
      icon: "⚫",
      onSelect: () => setCustomTheme({
        primary: '#60a5fa',
        background: '#111827',
        text: '#f9fafb',
        border: '#374151',
      }),
    },
    
    // Customization Options
    { 
      id: "change-placeholder", 
      label: "Change Placeholder Text", 
      group: "Customization",
      icon: "✏️",
      onSelect: () => {
        const newPlaceholder = prompt("Enter new placeholder:", customPlaceholder);
        if (newPlaceholder) setCustomPlaceholder(newPlaceholder);
      },
    },
    { 
      id: "change-empty", 
      label: "Change Empty Message", 
      group: "Customization",
      icon: "📝",
      onSelect: () => {
        const newEmpty = prompt("Enter new empty message:", customEmpty);
        if (newEmpty) setCustomEmpty(newEmpty);
      },
    },
    
    // Sample Commands
    { 
      id: "sample-1", 
      label: "Sample Command 1", 
      group: "Samples",
      icon: "1️⃣",
      onSelect: action("sample-1"),
    },
    { 
      id: "sample-2", 
      label: "Sample Command 2", 
      group: "Samples",
      icon: "2️⃣",
      onSelect: action("sample-2"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Advanced Customization & Theming Demo</strong></p>
        <p>Try different themes and customize the text to see real-time changes</p>
        
        <div className="bg-gray-50 p-3 rounded space-y-2">
          <p className="font-medium">Current Theme:</p>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: customTheme.primary }}
              />
              Primary: {customTheme.primary}
            </div>
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded border" 
                style={{ backgroundColor: customTheme.background }}
              />
              Background: {customTheme.background}
            </div>
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: customTheme.text }}
              />
              Text: {customTheme.text}
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: customTheme.background,
          borderColor: customTheme.border,
          color: customTheme.text,
        }}
      >
        <CommandPalette
          items={customCommands}
          placeholder={customPlaceholder}
          emptyText={customEmpty}
        />
      </div>
    </div>
  );
};

export const AdvancedCustomization: Story = {
  name: "10. Advanced Customization & Theming",
  render: () => <CustomizationDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Advanced Customization & Theming

Fully customizable command palette with:
- **Live theme switching** (Blue, Green, Purple, Dark)
- **Custom colors** for primary, background, text, border
- **Dynamic text customization** (placeholder, empty message)
- **Real-time preview** of styling changes
- **Interactive theme commands** for instant switching

Perfect for applications that need branded or customizable command palettes.
        `,
      },
    },
  },
};

// =================================================================
// 11. CUSTOM TRIGGERS & INTERACTIVE
// =================================================================
const CustomTriggersDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string>("default");

  const commands: CommandPaletteItem[] = [
    { 
      id: "trigger-1", 
      label: "Switch to Default Trigger", 
      group: "Triggers",
      icon: "🔘",
      onSelect: () => setSelectedTrigger("default"),
    },
    { 
      id: "trigger-2", 
      label: "Switch to Icon Trigger", 
      group: "Triggers",
      icon: "🎯",
      onSelect: () => setSelectedTrigger("icon"),
    },
    { 
      id: "trigger-3", 
      label: "Switch to Custom Button", 
      group: "Triggers",
      icon: "🔲",
      onSelect: () => setSelectedTrigger("button"),
    },
    { 
      id: "trigger-4", 
      label: "Switch to Search Bar Style", 
      group: "Triggers",
      icon: "🔍",
      onSelect: () => setSelectedTrigger("searchbar"),
    },
    
    { 
      id: "action-1", 
      label: "Action Command 1", 
      group: "Actions",
      icon: "⚡",
      onSelect: action("action-1"),
    },
    { 
      id: "action-2", 
      label: "Action Command 2", 
      group: "Actions",
      icon: "🚀",
      onSelect: action("action-2"),
    },
  ];

  const getTriggerElement = () => {
    switch (selectedTrigger) {
      case "icon":
        return (
          <button className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center">
            🎯
          </button>
        );
      case "button":
        return (
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium">
            Open Commands
          </button>
        );
      case "searchbar":
        return (
          <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer min-w-[250px]">
            <span className="text-gray-400">🔍</span>
            <span className="text-gray-500">Search commands...</span>
            <span className="ml-auto text-xs text-gray-400 border border-gray-300 rounded px-1">⌘K</span>
          </div>
        );
      default:
        return undefined; // Use default trigger
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Custom Triggers & Interactive Demo</strong></p>
        <p>Try different trigger styles and see how they affect the user experience</p>
        
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-medium mb-2">Current Trigger: {selectedTrigger}</p>
          <p className="text-xs">Use the command palette to switch between different trigger styles</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-gray-500">
          Click the trigger below to open the command palette:
        </div>
        
        <CommandPalette
          items={commands}
          placeholder="Try different trigger styles..."
          emptyText="No commands found"
          trigger={getTriggerElement()}
        />
        
        <div className="text-xs text-gray-400 text-center max-w-md">
          Each trigger style offers different UX patterns:
          • Default: Familiar ⌘K button
          • Icon: Minimal floating action button
          • Custom Button: Branded call-to-action
          • Search Bar: Discoverable search interface
        </div>
      </div>
    </div>
  );
};

export const CustomTriggersInteractive: Story = {
  name: "11. Custom Triggers & Interactive",
  render: () => <CustomTriggersDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Custom Triggers & Interactive Demo

Showcase of different trigger patterns:
- **Default trigger** - Standard ⌘K button
- **Icon trigger** - Floating action button style
- **Custom button** - Branded call-to-action
- **Search bar trigger** - Discoverable search interface

Interactive demo where you can switch between trigger styles to see the UX impact.
Perfect for testing different interaction patterns in your application.
        `,
      },
    },
  },
};

// =================================================================
// 12. ERROR STATES & EDGE CASES DEMO
// =================================================================
const ErrorStatesDemo = () => {
  const [demoMode, setDemoMode] = useState<'normal' | 'empty' | 'loading' | 'error'>('normal');
  const [isLoading, setIsLoading] = useState(false);

  const normalCommands: CommandPaletteItem[] = [
    { id: "normal-1", label: "Normal Command 1", group: "Normal", icon: "✅" },
    { id: "normal-2", label: "Normal Command 2", group: "Normal", icon: "✅" },
  ];

  const errorCommands: CommandPaletteItem[] = [
    { 
      id: "error-cmd", 
      label: "Command That Throws Error", 
      group: "Error Demo",
      icon: "💥",
      onSelect: () => {
        throw new Error("This is a demo error");
      },
    },
    { 
      id: "null-callback", 
      label: "Command With Null Callback", 
      group: "Error Demo",
      icon: "❌",
      onSelect: null as any,
    },
  ];

  const getCurrentItems = (): CommandPaletteItem[] => {
    switch (demoMode) {
      case 'empty':
        return [];
      case 'loading':
        return isLoading ? [] : normalCommands;
      case 'error':
        return errorCommands;
      default:
        return normalCommands;
    }
  };

  const getDemoControls = (): CommandPaletteItem[] => [
    {
      id: "mode-normal",
      label: "Switch to Normal Mode",
      group: "Demo Controls",
      icon: "✅",
      onSelect: () => setDemoMode('normal'),
    },
    {
      id: "mode-empty",
      label: "Switch to Empty State",
      group: "Demo Controls", 
      icon: "🗂️",
      onSelect: () => setDemoMode('empty'),
    },
    {
      id: "mode-loading",
      label: "Switch to Loading State",
      group: "Demo Controls",
      icon: "⏳",
      onSelect: () => {
        setDemoMode('loading');
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
      },
    },
    {
      id: "mode-error",
      label: "Switch to Error State",
      group: "Demo Controls",
      icon: "💥",
      onSelect: () => setDemoMode('error'),
    },
    ...getCurrentItems(),
  ];

  const getEmptyMessage = () => {
    switch (demoMode) {
      case 'empty':
        return "No commands available. This is the empty state demo.";
      case 'loading':
        return isLoading ? "Loading commands..." : "Commands loaded successfully!";
      case 'error':
        return "Error commands loaded. Try executing them to see error handling.";
      default:
        return "No commands found";
    }
  };

  const getPlaceholder = () => {
    switch (demoMode) {
      case 'empty':
        return "No commands to search...";
      case 'loading':
        return isLoading ? "Loading..." : "Search loaded commands...";
      case 'error':
        return "Search error demo commands...";
      default:
        return "Search commands...";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Error States & Edge Cases Demo</strong></p>
        <p>Test different error conditions and edge cases</p>
        
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-medium mb-2">Current Mode: {demoMode}</p>
          <div className="text-xs space-y-1">
            <p><strong>Available modes:</strong></p>
            <p>• Normal: Standard operation with working commands</p>
            <p>• Empty: No commands available (empty state)</p>
            <p>• Loading: Simulated loading with delay</p>
            <p>• Error: Commands that intentionally throw errors</p>
          </div>
        </div>
        
        {demoMode === 'loading' && isLoading && (
          <div className="bg-blue-50 p-3 rounded flex items-center gap-2">
            <div className="animate-spin">⏳</div>
            <span>Loading commands... (simulated 2s delay)</span>
          </div>
        )}
        
        {demoMode === 'error' && (
          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <p className="text-red-700 text-xs">
              ⚠️ Error mode active. Commands in this mode will throw errors when executed.
              Check browser console for error messages.
            </p>
          </div>
        )}
      </div>
      
      <CommandPalette
        items={getDemoControls()}
        placeholder={getPlaceholder()}
        emptyText={getEmptyMessage()}
      />
    </div>
  );
};

export const ErrorStatesEdgeCases: Story = {
  name: "12. Error States & Edge Cases",
  render: () => <ErrorStatesDemo />,
  parameters: {
    docs: {
      description: {
        story: `
### Error States & Edge Cases Demo

Comprehensive testing of error conditions:
- **Empty state** - No commands available
- **Loading state** - Simulated async loading with delay
- **Error handling** - Commands that throw errors
- **Null callbacks** - Commands with missing onSelect handlers
- **Dynamic state switching** - Test different scenarios

Perfect for QA testing and ensuring robust error handling in production.
        `,
      },
    },
  },
};
