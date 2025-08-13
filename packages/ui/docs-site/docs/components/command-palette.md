---
id: command-palette
title: CommandPalette
sidebar_position: 49
---

import { CommandPalette } from '@dainabase/ui';

# CommandPalette Component

A powerful command palette component providing instant access to application commands, search functionality, and keyboard-driven navigation inspired by modern developer tools.

## Preview

```tsx live
function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Press{' '}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </p>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Open Command Palette
        </button>
      </div>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={[
          { id: '1', label: 'Search Documentation', icon: '📖', action: () => console.log('Search') },
          { id: '2', label: 'Create New File', icon: '📄', action: () => console.log('New File') },
          { id: '3', label: 'Open Settings', icon: '⚙️', action: () => console.log('Settings') },
        ]}
      />
    </>
  );
}
```

## Features

- ⌨️ **Keyboard First** - Fully keyboard navigable with shortcuts
- 🔍 **Fuzzy Search** - Intelligent fuzzy matching algorithm
- 🎯 **Smart Ranking** - Contextual command prioritization
- 🚀 **Lightning Fast** - Optimized for instant response
- 📱 **Responsive** - Works on all device sizes
- 🎨 **Customizable** - Flexible theming and styling
- 🔄 **Recent Commands** - Track frequently used commands
- 🌳 **Nested Commands** - Support for command hierarchies
- ♿ **Accessible** - Full ARIA support and screen reader compatible
- 🎭 **Multiple Modes** - Search, command, and navigation modes

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { CommandPalette } from '@dainabase/ui';

function App() {
  const [open, setOpen] = useState(false);
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={[
        { id: '1', label: 'Home', action: () => navigate('/') },
        { id: '2', label: 'Settings', action: () => navigate('/settings') },
      ]}
    />
  );
}
```

## Examples

### 1. Full Application Command Center

```tsx
function ApplicationCommandCenter() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  
  const commands = [
    {
      group: 'Navigation',
      items: [
        { id: 'home', label: 'Go to Home', icon: '🏠', shortcut: 'G H', action: () => router.push('/') },
        { id: 'dashboard', label: 'Dashboard', icon: '📊', shortcut: 'G D', action: () => router.push('/dashboard') },
        { id: 'profile', label: 'Profile', icon: '👤', shortcut: 'G P', action: () => router.push('/profile') },
        { id: 'settings', label: 'Settings', icon: '⚙️', shortcut: 'G S', action: () => router.push('/settings') },
      ]
    },
    {
      group: 'Actions',
      items: [
        { id: 'new-file', label: 'Create New File', icon: '📄', shortcut: '⌘ N', action: () => createNewFile() },
        { id: 'new-folder', label: 'Create New Folder', icon: '📁', action: () => createNewFolder() },
        { id: 'upload', label: 'Upload File', icon: '⬆️', shortcut: '⌘ U', action: () => openUploadDialog() },
        { id: 'share', label: 'Share', icon: '🔗', action: () => openShareDialog() },
      ]
    },
    {
      group: 'Search',
      items: [
        { id: 'search-files', label: 'Search Files', icon: '🔍', shortcut: '⌘ F', action: () => openFileSearch() },
        { id: 'search-users', label: 'Search Users', icon: '👥', action: () => openUserSearch() },
        { id: 'search-help', label: 'Search Help', icon: '❓', shortcut: '⌘ /', action: () => openHelp() },
      ]
    },
    {
      group: 'Tools',
      items: [
        { id: 'calculator', label: 'Calculator', icon: '🧮', action: () => openCalculator() },
        { id: 'color-picker', label: 'Color Picker', icon: '🎨', action: () => openColorPicker() },
        { id: 'emoji-picker', label: 'Emoji Picker', icon: '😊', shortcut: '⌘ E', action: () => openEmojiPicker() },
      ]
    },
    {
      group: 'System',
      items: [
        { id: 'theme', label: 'Toggle Theme', icon: '🌓', shortcut: '⌘ T', action: () => toggleTheme() },
        { id: 'fullscreen', label: 'Toggle Fullscreen', icon: '🖥️', shortcut: 'F11', action: () => toggleFullscreen() },
        { id: 'logout', label: 'Log Out', icon: '🚪', action: () => logout() },
      ]
    }
  ];
  
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      search={search}
      onSearchChange={setSearch}
      placeholder="Type a command or search..."
      commands={commands}
      emptyMessage="No results found."
      footer={
        <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>⎋ Close</span>
          </div>
          <span>⌘K to open</span>
        </div>
      }
    />
  );
}
```

### 2. File Explorer Command Palette

```tsx
function FileExplorerPalette() {
  const [open, setOpen] = useState(false);
  const [recentFiles, setRecentFiles] = useState([
    { id: '1', name: 'index.tsx', path: '/src/index.tsx', modified: '2 hours ago' },
    { id: '2', name: 'App.tsx', path: '/src/App.tsx', modified: '3 hours ago' },
    { id: '3', name: 'package.json', path: '/package.json', modified: 'Yesterday' },
  ]);
  
  const fileCommands = [
    {
      group: 'Recent Files',
      items: recentFiles.map(file => ({
        id: file.id,
        label: file.name,
        description: file.path,
        meta: file.modified,
        icon: '📄',
        action: () => openFile(file.path),
      }))
    },
    {
      group: 'File Actions',
      items: [
        { id: 'new', label: 'New File', icon: '➕', shortcut: '⌘ N' },
        { id: 'open', label: 'Open File', icon: '📂', shortcut: '⌘ O' },
        { id: 'save', label: 'Save', icon: '💾', shortcut: '⌘ S' },
        { id: 'save-as', label: 'Save As...', icon: '💾', shortcut: '⌘ ⇧ S' },
        { id: 'close', label: 'Close File', icon: '❌', shortcut: '⌘ W' },
      ]
    },
    {
      group: 'Edit',
      items: [
        { id: 'undo', label: 'Undo', icon: '↶', shortcut: '⌘ Z' },
        { id: 'redo', label: 'Redo', icon: '↷', shortcut: '⌘ ⇧ Z' },
        { id: 'cut', label: 'Cut', icon: '✂️', shortcut: '⌘ X' },
        { id: 'copy', label: 'Copy', icon: '📋', shortcut: '⌘ C' },
        { id: 'paste', label: 'Paste', icon: '📋', shortcut: '⌘ V' },
      ]
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={fileCommands}
      className="max-w-2xl"
    />
  );
}
```

### 3. AI Assistant Command Palette

```tsx
function AIAssistantPalette() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('command'); // 'command' | 'chat'
  const [input, setInput] = useState('');
  
  const aiCommands = [
    {
      group: 'AI Actions',
      items: [
        { 
          id: 'ask', 
          label: 'Ask AI', 
          icon: '🤖', 
          description: 'Get answers to your questions',
          action: () => setMode('chat')
        },
        { 
          id: 'generate-code', 
          label: 'Generate Code', 
          icon: '💻', 
          description: 'Create code snippets',
          action: () => generateCode()
        },
        { 
          id: 'explain', 
          label: 'Explain Code', 
          icon: '📖', 
          description: 'Get explanations for selected code',
          action: () => explainCode()
        },
        { 
          id: 'refactor', 
          label: 'Refactor Code', 
          icon: '🔧', 
          description: 'Improve code quality',
          action: () => refactorCode()
        },
        { 
          id: 'translate', 
          label: 'Translate', 
          icon: '🌐', 
          description: 'Translate text to another language',
          action: () => translateText()
        },
        { 
          id: 'summarize', 
          label: 'Summarize', 
          icon: '📝', 
          description: 'Create a summary of selected text',
          action: () => summarizeText()
        },
      ]
    },
    {
      group: 'Templates',
      items: [
        { id: 'email', label: 'Write Email', icon: '✉️', description: 'Compose professional email' },
        { id: 'blog', label: 'Write Blog Post', icon: '📰', description: 'Create blog content' },
        { id: 'docs', label: 'Write Documentation', icon: '📚', description: 'Generate documentation' },
        { id: 'test', label: 'Write Tests', icon: '🧪', description: 'Create unit tests' },
      ]
    }
  ];
  
  return (
    <>
      {mode === 'command' ? (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          commands={aiCommands}
          placeholder="Ask AI anything or choose an action..."
          header={
            <div className="flex items-center space-x-2 px-4 py-3 border-b">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold">AI Assistant</span>
            </div>
          }
        />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat with AI</h3>
              <button onClick={() => { setMode('command'); setOpen(false); }}>✕</button>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-32 p-3 border rounded-md"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### 4. Developer Tools Palette

```tsx
function DeveloperToolsPalette() {
  const [open, setOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  
  const devCommands = [
    {
      group: 'Console',
      items: [
        { 
          id: 'console-log', 
          label: 'Console Log', 
          icon: '📝',
          action: () => {
            console.log('Debug output');
            setConsoleOutput([...consoleOutput, 'Debug output']);
          }
        },
        { id: 'clear-console', label: 'Clear Console', icon: '🗑️', action: () => setConsoleOutput([]) },
        { id: 'inspect', label: 'Inspect Element', icon: '🔍', shortcut: '⌘ ⇧ C' },
      ]
    },
    {
      group: 'Performance',
      items: [
        { id: 'profile', label: 'Start Profiling', icon: '⏱️', action: () => console.profile() },
        { id: 'memory', label: 'Memory Snapshot', icon: '💾', action: () => console.memory },
        { id: 'network', label: 'Network Monitor', icon: '🌐', action: () => openNetworkMonitor() },
        { id: 'lighthouse', label: 'Run Lighthouse', icon: '🏠', action: () => runLighthouse() },
      ]
    },
    {
      group: 'Debug',
      items: [
        { id: 'breakpoint', label: 'Add Breakpoint', icon: '🔴', shortcut: 'F9' },
        { id: 'step-over', label: 'Step Over', icon: '⏭️', shortcut: 'F10' },
        { id: 'step-into', label: 'Step Into', icon: '⬇️', shortcut: 'F11' },
        { id: 'continue', label: 'Continue', icon: '▶️', shortcut: 'F5' },
      ]
    },
    {
      group: 'Git',
      items: [
        { id: 'git-status', label: 'Git Status', icon: '📊', action: () => runGitCommand('status') },
        { id: 'git-commit', label: 'Git Commit', icon: '✅', shortcut: '⌘ K' },
        { id: 'git-push', label: 'Git Push', icon: '⬆️', action: () => runGitCommand('push') },
        { id: 'git-pull', label: 'Git Pull', icon: '⬇️', action: () => runGitCommand('pull') },
      ]
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={devCommands}
      placeholder="Run developer command..."
      className="font-mono"
    />
  );
}
```

### 5. Project Switcher

```tsx
function ProjectSwitcherPalette() {
  const [open, setOpen] = useState(false);
  const [projects] = useState([
    { id: '1', name: 'Website Redesign', status: 'active', progress: 75, team: 'Design Team' },
    { id: '2', name: 'Mobile App', status: 'active', progress: 45, team: 'Mobile Team' },
    { id: '3', name: 'API Development', status: 'completed', progress: 100, team: 'Backend Team' },
    { id: '4', name: 'Data Migration', status: 'planning', progress: 10, team: 'Data Team' },
    { id: '5', name: 'Security Audit', status: 'active', progress: 60, team: 'Security Team' },
  ]);
  
  const projectCommands = projects.map(project => ({
    id: project.id,
    label: project.name,
    description: project.team,
    icon: project.status === 'completed' ? '✅' : project.status === 'active' ? '🔄' : '📋',
    meta: (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-0.5 text-xs rounded ${
          project.status === 'completed' ? 'bg-green-100 text-green-800' :
          project.status === 'active' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {project.status}
        </span>
        <span className="text-xs text-gray-500">{project.progress}%</span>
      </div>
    ),
    action: () => switchToProject(project.id),
  }));
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={[{ group: 'Projects', items: projectCommands }]}
      placeholder="Search projects..."
      header={
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">Switch Project</h3>
          <p className="text-sm text-gray-500 mt-1">Select a project to work on</p>
        </div>
      }
    />
  );
}
```

### 6. Emoji Picker Palette

```tsx
function EmojiPickerPalette() {
  const [open, setOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  
  const emojiCategories = [
    {
      group: 'Smileys & Emotion',
      items: [
        { id: 'smile', label: 'Smile', icon: '😊', action: () => setSelectedEmoji('😊') },
        { id: 'laugh', label: 'Laugh', icon: '😂', action: () => setSelectedEmoji('😂') },
        { id: 'love', label: 'Love', icon: '❤️', action: () => setSelectedEmoji('❤️') },
        { id: 'wink', label: 'Wink', icon: '😉', action: () => setSelectedEmoji('😉') },
        { id: 'cool', label: 'Cool', icon: '😎', action: () => setSelectedEmoji('😎') },
      ]
    },
    {
      group: 'Animals & Nature',
      items: [
        { id: 'dog', label: 'Dog', icon: '🐕', action: () => setSelectedEmoji('🐕') },
        { id: 'cat', label: 'Cat', icon: '🐈', action: () => setSelectedEmoji('🐈') },
        { id: 'tree', label: 'Tree', icon: '🌳', action: () => setSelectedEmoji('🌳') },
        { id: 'flower', label: 'Flower', icon: '🌸', action: () => setSelectedEmoji('🌸') },
        { id: 'rainbow', label: 'Rainbow', icon: '🌈', action: () => setSelectedEmoji('🌈') },
      ]
    },
    {
      group: 'Food & Drink',
      items: [
        { id: 'pizza', label: 'Pizza', icon: '🍕', action: () => setSelectedEmoji('🍕') },
        { id: 'coffee', label: 'Coffee', icon: '☕', action: () => setSelectedEmoji('☕') },
        { id: 'cake', label: 'Cake', icon: '🎂', action: () => setSelectedEmoji('🎂') },
        { id: 'apple', label: 'Apple', icon: '🍎', action: () => setSelectedEmoji('🍎') },
        { id: 'beer', label: 'Beer', icon: '🍺', action: () => setSelectedEmoji('🍺') },
      ]
    },
    {
      group: 'Activities',
      items: [
        { id: 'soccer', label: 'Soccer', icon: '⚽', action: () => setSelectedEmoji('⚽') },
        { id: 'music', label: 'Music', icon: '🎵', action: () => setSelectedEmoji('🎵') },
        { id: 'art', label: 'Art', icon: '🎨', action: () => setSelectedEmoji('🎨') },
        { id: 'game', label: 'Game', icon: '🎮', action: () => setSelectedEmoji('🎮') },
        { id: 'travel', label: 'Travel', icon: '✈️', action: () => setSelectedEmoji('✈️') },
      ]
    }
  ];
  
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 border rounded-md hover:bg-gray-50"
      >
        {selectedEmoji || 'Select Emoji'} 😊
      </button>
      
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={emojiCategories}
        placeholder="Search emoji..."
        className="max-w-md"
      />
      
      {selectedEmoji && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {selectedEmoji}
        </p>
      )}
    </div>
  );
}
```

### 7. Calculator Command Palette

```tsx
function CalculatorPalette() {
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);
  
  const calculate = (expr) => {
    try {
      // In production, use a proper math expression parser
      const res = eval(expr);
      setResult(res);
      return res;
    } catch {
      setResult('Error');
      return 'Error';
    }
  };
  
  const calculatorCommands = [
    {
      group: 'Basic Operations',
      items: [
        { id: 'add', label: 'Addition (+)', description: 'Add numbers', action: () => setExpression(expression + '+') },
        { id: 'subtract', label: 'Subtraction (-)', description: 'Subtract numbers', action: () => setExpression(expression + '-') },
        { id: 'multiply', label: 'Multiplication (*)', description: 'Multiply numbers', action: () => setExpression(expression + '*') },
        { id: 'divide', label: 'Division (/)', description: 'Divide numbers', action: () => setExpression(expression + '/') },
      ]
    },
    {
      group: 'Advanced',
      items: [
        { id: 'power', label: 'Power (^)', description: 'Exponentiation', action: () => setExpression(expression + '**') },
        { id: 'sqrt', label: 'Square Root', description: '√x', action: () => setExpression(`Math.sqrt(${expression})`) },
        { id: 'sin', label: 'Sine', description: 'sin(x)', action: () => setExpression(`Math.sin(${expression})`) },
        { id: 'cos', label: 'Cosine', description: 'cos(x)', action: () => setExpression(`Math.cos(${expression})`) },
      ]
    },
    {
      group: 'Actions',
      items: [
        { id: 'equals', label: 'Calculate (=)', icon: '=', action: () => calculate(expression) },
        { id: 'clear', label: 'Clear', icon: 'C', action: () => { setExpression(''); setResult(null); } },
        { id: 'delete', label: 'Delete', icon: '⌫', action: () => setExpression(expression.slice(0, -1)) },
      ]
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={calculatorCommands}
      placeholder="Enter expression or choose operation..."
      search={expression}
      onSearchChange={setExpression}
      header={
        <div className="px-4 py-3 border-b">
          <div className="font-mono text-lg">{expression || '0'}</div>
          {result !== null && (
            <div className="text-2xl font-bold text-blue-600 mt-1">= {result}</div>
          )}
        </div>
      }
    />
  );
}
```

### 8. Theme Switcher Palette

```tsx
function ThemeSwitcherPalette() {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const themes = [
    {
      group: 'Light Themes',
      items: [
        { 
          id: 'light', 
          label: 'Light', 
          icon: '☀️',
          description: 'Default light theme',
          preview: <div className="w-full h-8 bg-white border rounded" />,
          action: () => setCurrentTheme('light')
        },
        { 
          id: 'sepia', 
          label: 'Sepia', 
          icon: '📜',
          description: 'Warm, paper-like theme',
          preview: <div className="w-full h-8 bg-yellow-50 border border-yellow-200 rounded" />,
          action: () => setCurrentTheme('sepia')
        },
        { 
          id: 'blue', 
          label: 'Blue Light', 
          icon: '💙',
          description: 'Cool blue tones',
          preview: <div className="w-full h-8 bg-blue-50 border border-blue-200 rounded" />,
          action: () => setCurrentTheme('blue')
        },
      ]
    },
    {
      group: 'Dark Themes',
      items: [
        { 
          id: 'dark', 
          label: 'Dark', 
          icon: '🌙',
          description: 'Default dark theme',
          preview: <div className="w-full h-8 bg-gray-900 border border-gray-700 rounded" />,
          action: () => setCurrentTheme('dark')
        },
        { 
          id: 'midnight', 
          label: 'Midnight', 
          icon: '🌌',
          description: 'Deep blue dark theme',
          preview: <div className="w-full h-8 bg-blue-950 border border-blue-800 rounded" />,
          action: () => setCurrentTheme('midnight')
        },
        { 
          id: 'amoled', 
          label: 'AMOLED', 
          icon: '⚫',
          description: 'Pure black for OLED screens',
          preview: <div className="w-full h-8 bg-black border border-gray-800 rounded" />,
          action: () => setCurrentTheme('amoled')
        },
      ]
    },
    {
      group: 'Special',
      items: [
        { 
          id: 'high-contrast', 
          label: 'High Contrast', 
          icon: '🔲',
          description: 'Enhanced contrast for accessibility',
          preview: <div className="w-full h-8 bg-white border-4 border-black rounded" />,
          action: () => setCurrentTheme('high-contrast')
        },
        { 
          id: 'auto', 
          label: 'Auto', 
          icon: '🔄',
          description: 'Follow system preference',
          action: () => setCurrentTheme('auto')
        },
      ]
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={themes}
      placeholder="Choose a theme..."
      header={
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">Theme Selector</h3>
          <p className="text-sm text-gray-500 mt-1">Current: {currentTheme}</p>
        </div>
      }
    />
  );
}
```

### 9. Quick Actions Menu

```tsx
function QuickActionsMenu() {
  const [open, setOpen] = useState(false);
  const [clipboard, setClipboard] = useState('');
  
  const quickActions = [
    {
      group: 'Clipboard',
      items: [
        { 
          id: 'copy-all', 
          label: 'Copy All', 
          icon: '📋',
          shortcut: '⌘ A',
          action: () => {
            document.execCommand('selectAll');
            document.execCommand('copy');
          }
        },
        { 
          id: 'paste-plain', 
          label: 'Paste as Plain Text', 
          icon: '📝',
          shortcut: '⌘ ⇧ V',
          action: () => navigator.clipboard.readText().then(setClipboard)
        },
        { 
          id: 'clear-clipboard', 
          label: 'Clear Clipboard', 
          icon: '🗑️',
          action: () => setClipboard('')
        },
      ]
    },
    {
      group: 'Window',
      items: [
        { id: 'new-window', label: 'New Window', icon: '🪟', shortcut: '⌘ N' },
        { id: 'new-tab', label: 'New Tab', icon: '📑', shortcut: '⌘ T' },
        { id: 'close-window', label: 'Close Window', icon: '❌', shortcut: '⌘ W' },
        { id: 'minimize', label: 'Minimize', icon: '➖', shortcut: '⌘ M' },
        { id: 'maximize', label: 'Maximize', icon: '⬜', shortcut: '⌘ ⇧ M' },
      ]
    },
    {
      group: 'View',
      items: [
        { id: 'zoom-in', label: 'Zoom In', icon: '🔍', shortcut: '⌘ +' },
        { id: 'zoom-out', label: 'Zoom Out', icon: '🔍', shortcut: '⌘ -' },
        { id: 'reset-zoom', label: 'Reset Zoom', icon: '🔍', shortcut: '⌘ 0' },
        { id: 'fullscreen', label: 'Fullscreen', icon: '🖥️', shortcut: 'F11' },
      ]
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={quickActions}
      placeholder="Quick action..."
    />
  );
}
```

### 10. Workflow Automation Palette

```tsx
function WorkflowAutomationPalette() {
  const [open, setOpen] = useState(false);
  const [workflows] = useState([
    {
      id: '1',
      name: 'Deploy to Production',
      steps: ['Run Tests', 'Build', 'Deploy', 'Notify Team'],
      status: 'ready',
      lastRun: '2 hours ago',
    },
    {
      id: '2',
      name: 'Daily Backup',
      steps: ['Export Database', 'Compress Files', 'Upload to S3'],
      status: 'running',
      lastRun: 'In progress',
    },
    {
      id: '3',
      name: 'Generate Reports',
      steps: ['Fetch Data', 'Process', 'Generate PDF', 'Email'],
      status: 'scheduled',
      lastRun: 'Tomorrow at 9 AM',
    },
  ]);
  
  const workflowCommands = [
    {
      group: 'Workflows',
      items: workflows.map(workflow => ({
        id: workflow.id,
        label: workflow.name,
        description: workflow.steps.join(' → '),
        icon: workflow.status === 'running' ? '🔄' : workflow.status === 'scheduled' ? '⏰' : '▶️',
        meta: (
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 text-xs rounded ${
              workflow.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
              workflow.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {workflow.status}
            </span>
            <span className="text-xs text-gray-500">{workflow.lastRun}</span>
          </div>
        ),
        action: () => runWorkflow(workflow.id),
      }))
    },
    {
      group: 'Actions',
      items: [
        { id: 'create', label: 'Create Workflow', icon: '➕', action: () => createWorkflow() },
        { id: 'schedule', label: 'Schedule Workflow', icon: '📅', action: () => scheduleWorkflow() },
        { id: 'history', label: 'View History', icon: '📜', action: () => viewHistory() },
        { id: 'logs', label: 'View Logs', icon: '📋', action: () => viewLogs() },
      ]
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={workflowCommands}
      placeholder="Run workflow or action..."
      header={
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">Workflow Automation</h3>
          <p className="text-sm text-gray-500 mt-1">Execute automated workflows</p>
        </div>
      }
    />
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls palette visibility |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback when open state changes |
| `commands` | `Command[] \| CommandGroup[]` | `[]` | Array of commands or grouped commands |
| `search` | `string` | `''` | Controlled search value |
| `onSearchChange` | `(search: string) => void` | `undefined` | Search change handler |
| `placeholder` | `string` | `'Type a command...'` | Search input placeholder |
| `emptyMessage` | `string \| ReactNode` | `'No results found'` | Message when no results |
| `className` | `string` | `undefined` | Additional CSS classes |
| `header` | `ReactNode` | `undefined` | Custom header content |
| `footer` | `ReactNode` | `undefined` | Custom footer content |
| `filter` | `(value: string, search: string) => number` | `fuzzyFilter` | Custom filter function |
| `onSelect` | `(command: Command) => void` | `undefined` | Command selection handler |
| `loading` | `boolean` | `false` | Show loading state |
| `disabled` | `boolean` | `false` | Disable interactions |

### Command Type

```typescript
interface Command {
  id: string;
  label: string;
  icon?: string | ReactNode;
  description?: string;
  shortcut?: string;
  meta?: ReactNode;
  action?: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

interface CommandGroup {
  group: string;
  items: Command[];
}
```

## Accessibility

The CommandPalette component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard control
  - `↑/↓` - Navigate commands
  - `Enter` - Select command
  - `Escape` - Close palette
  - `Tab` - Focus navigation
- **Screen Reader Support**: Full ARIA implementation
- **Focus Management**: Proper focus trap and restoration
- **ARIA Attributes**:
  - `role="dialog"` for modal
  - `role="combobox"` for search
  - `role="listbox"` for commands
  - `aria-selected` for selection
  - `aria-label` for all controls

## Best Practices

### Do's ✅

- Provide keyboard shortcut (⌘K or Ctrl+K)
- Group related commands
- Include search/filter functionality
- Show keyboard shortcuts in UI
- Keep command labels concise
- Provide descriptions for complex commands
- Remember frequently used commands
- Support fuzzy search
- Optimize for performance with many commands
- Test with keyboard navigation

### Don'ts ❌

- Don't have too many ungrouped commands
- Don't use long command names
- Don't forget escape key handling
- Don't block page interaction
- Don't forget loading states
- Don't use complex nesting
- Don't ignore mobile experience
- Don't forget error handling
- Don't make it too small
- Don't forget focus management

## Use Cases

1. **Application Navigation** - Quick access to pages
2. **Search Interface** - Universal search
3. **Command Execution** - Run application commands
4. **File Operations** - Open, save, create files
5. **Settings Access** - Quick settings changes
6. **Tool Selection** - Switch between tools
7. **Project Switching** - Change active project
8. **Help System** - Access documentation
9. **Workflow Automation** - Run automated tasks
10. **AI Integration** - AI-powered commands

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands not filtering | Check filter function implementation |
| Keyboard navigation broken | Verify focus management |
| Performance issues | Implement virtualization for long lists |
| Search not working | Check search prop and handler |
| Commands not executing | Verify action callbacks |
| Style issues | Check CSS classes and theme |

## Related Components

- [**Search**](./search) - Search input component
- [**Dialog**](./dialog) - Modal dialog
- [**DropdownMenu**](./dropdown-menu) - Dropdown menus
- [**ContextMenu**](./context-menu) - Context menus
- [**Combobox**](./combobox) - Combobox component
- [**Sheet**](./sheet) - Slide-out panels
