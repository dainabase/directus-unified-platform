'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Input } from './input';
import { Label } from './label';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { Toggle } from './toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { 
  Code2, 
  Copy, 
  Download, 
  Upload,
  Search,
  Replace,
  Undo,
  Redo,
  Save,
  FileCode,
  Settings,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Terminal,
  Bug,
  PlayCircle,
  Zap,
  GitBranch,
  GitCommit,
  GitMerge,
  Eye,
  EyeOff,
  WrapText,
  Braces,
  FileText,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  BookOpen,
  Palette
} from 'lucide-react';

// Types and Interfaces
export interface CodeEditorProps {
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  readOnly?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  minimap?: boolean;
  fontSize?: number;
  tabSize?: number;
  autoComplete?: boolean;
  syntaxValidation?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  highlightActiveLine?: boolean;
  showGutter?: boolean;
  showFoldingControls?: boolean;
  enableSnippets?: boolean;
  enableMultiCursor?: boolean;
  enableBracketMatching?: boolean;
  enableLiveAutoComplete?: boolean;
  onSave?: (value: string) => void;
  onFormat?: (value: string) => string;
  onValidate?: (value: string) => ValidationResult[];
  customThemes?: Record<string, EditorTheme>;
  extensions?: EditorExtension[];
  placeholder?: string;
  maxLines?: number;
  minLines?: number;
}

export interface ValidationResult {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source?: string;
}

export interface EditorTheme {
  background: string;
  foreground: string;
  selection: string;
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  variable: string;
  operator: string;
  lineNumber: string;
  activeLine: string;
}

export interface EditorExtension {
  name: string;
  initialize: (editor: any) => void;
  destroy?: () => void;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  expanded?: boolean;
}

export interface EditorTab {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

// Language configurations
const LANGUAGE_CONFIG = {
  javascript: {
    extensions: ['.js', '.jsx'],
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'default', 'async', 'await'],
    comment: '//',
    multiLineComment: ['/*', '*/'],
    brackets: { '(': ')', '{': '}', '[': ']' },
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' }
    ]
  },
  typescript: {
    extensions: ['.ts', '.tsx'],
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'extends', 'implements', 'import', 'export', 'default', 'async', 'await', 'public', 'private', 'protected'],
    comment: '//',
    multiLineComment: ['/*', '*/'],
    brackets: { '(': ')', '{': '}', '[': ']', '<': '>' },
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '<', close: '>' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' }
    ]
  },
  python: {
    extensions: ['.py'],
    keywords: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'pass', 'break', 'continue'],
    comment: '#',
    multiLineComment: ['"""', '"""'],
    brackets: { '(': ')', '{': '}', '[': ']' },
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  },
  html: {
    extensions: ['.html', '.htm'],
    keywords: [],
    comment: '<!--',
    multiLineComment: ['<!--', '-->'],
    brackets: { '<': '>', '(': ')', '{': '}', '[': ']' },
    autoClosingPairs: [
      { open: '<', close: '>' },
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  },
  css: {
    extensions: ['.css', '.scss', '.sass', '.less'],
    keywords: ['@import', '@media', '@keyframes', '@font-face', '!important'],
    comment: '/*',
    multiLineComment: ['/*', '*/'],
    brackets: { '(': ')', '{': '}', '[': ']' },
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  },
  json: {
    extensions: ['.json'],
    keywords: ['true', 'false', 'null'],
    comment: '',
    multiLineComment: [],
    brackets: { '{': '}', '[': ']' },
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' }
    ]
  },
  markdown: {
    extensions: ['.md', '.markdown'],
    keywords: [],
    comment: '',
    multiLineComment: [],
    brackets: { '(': ')', '[': ']', '{': '}' },
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '*', close: '*' },
      { open: '_', close: '_' },
      { open: '`', close: '`' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  },
  sql: {
    extensions: ['.sql'],
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT'],
    comment: '--',
    multiLineComment: ['/*', '*/'],
    brackets: { '(': ')' },
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  },
  yaml: {
    extensions: ['.yml', '.yaml'],
    keywords: ['true', 'false', 'null'],
    comment: '#',
    multiLineComment: [],
    brackets: { '{': '}', '[': ']' },
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  },
  xml: {
    extensions: ['.xml'],
    keywords: [],
    comment: '<!--',
    multiLineComment: ['<!--', '-->'],
    brackets: { '<': '>' },
    autoClosingPairs: [
      { open: '<', close: '>' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  }
};

// Code snippets
const CODE_SNIPPETS: Record<string, Record<string, { trigger: string; description: string; snippet: string }>> = {
  javascript: {
    'console.log': {
      trigger: 'log',
      description: 'Console log',
      snippet: 'console.log($1);'
    },
    'function': {
      trigger: 'fn',
      description: 'Function declaration',
      snippet: 'function $1($2) {\n  $3\n}'
    },
    'arrow-function': {
      trigger: 'af',
      description: 'Arrow function',
      snippet: 'const $1 = ($2) => {\n  $3\n};'
    },
    'for-loop': {
      trigger: 'for',
      description: 'For loop',
      snippet: 'for (let i = 0; i < $1; i++) {\n  $2\n}'
    },
    'if-else': {
      trigger: 'if',
      description: 'If-else statement',
      snippet: 'if ($1) {\n  $2\n} else {\n  $3\n}'
    }
  },
  typescript: {
    'interface': {
      trigger: 'int',
      description: 'Interface declaration',
      snippet: 'interface $1 {\n  $2\n}'
    },
    'type': {
      trigger: 'type',
      description: 'Type alias',
      snippet: 'type $1 = $2;'
    },
    'class': {
      trigger: 'class',
      description: 'Class declaration',
      snippet: 'class $1 {\n  constructor($2) {\n    $3\n  }\n}'
    }
  },
  python: {
    'function': {
      trigger: 'def',
      description: 'Function definition',
      snippet: 'def $1($2):\n    $3'
    },
    'class': {
      trigger: 'class',
      description: 'Class definition',
      snippet: 'class $1:\n    def __init__(self, $2):\n        $3'
    },
    'for-loop': {
      trigger: 'for',
      description: 'For loop',
      snippet: 'for $1 in $2:\n    $3'
    },
    'if-else': {
      trigger: 'if',
      description: 'If-else statement',
      snippet: 'if $1:\n    $2\nelse:\n    $3'
    }
  }
};

// Editor themes
const EDITOR_THEMES = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    selection: '#add6ff',
    comment: '#008000',
    keyword: '#0000ff',
    string: '#a31515',
    number: '#098658',
    function: '#795e26',
    variable: '#001080',
    operator: '#000000',
    lineNumber: '#6e7681',
    activeLine: '#f0f0f0'
  },
  dark: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    selection: '#264f78',
    comment: '#6a9955',
    keyword: '#569cd6',
    string: '#ce9178',
    number: '#b5cea8',
    function: '#dcdcaa',
    variable: '#9cdcfe',
    operator: '#d4d4d4',
    lineNumber: '#858585',
    activeLine: '#2a2a2a'
  },
  monokai: {
    background: '#272822',
    foreground: '#f8f8f2',
    selection: '#49483e',
    comment: '#75715e',
    keyword: '#f92672',
    string: '#e6db74',
    number: '#ae81ff',
    function: '#a6e22e',
    variable: '#fd971f',
    operator: '#f8f8f2',
    lineNumber: '#90908a',
    activeLine: '#3e3d32'
  },
  github: {
    background: '#ffffff',
    foreground: '#24292e',
    selection: '#c8c8fa',
    comment: '#6a737d',
    keyword: '#d73a49',
    string: '#032f62',
    number: '#005cc5',
    function: '#6f42c1',
    variable: '#e36209',
    operator: '#24292e',
    lineNumber: '#959da5',
    activeLine: '#f6f8fa'
  },
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    selection: '#44475a',
    comment: '#6272a4',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    number: '#bd93f9',
    function: '#50fa7b',
    variable: '#8be9fd',
    operator: '#ff79c6',
    lineNumber: '#6272a4',
    activeLine: '#44475a'
  }
};

// Main Component
export const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (
    {
      className,
      defaultValue = '',
      value,
      onChange,
      language = 'javascript',
      theme = 'dark',
      readOnly = false,
      lineNumbers = true,
      wordWrap = false,
      minimap = true,
      fontSize = 14,
      tabSize = 2,
      autoComplete = true,
      syntaxValidation = true,
      formatOnPaste = true,
      formatOnType = false,
      highlightActiveLine = true,
      showGutter = true,
      showFoldingControls = true,
      enableSnippets = true,
      enableMultiCursor = true,
      enableBracketMatching = true,
      enableLiveAutoComplete = true,
      onSave,
      onFormat,
      onValidate,
      customThemes = {},
      extensions = [],
      placeholder = 'Start typing...',
      maxLines,
      minLines = 10,
      ...props
    },
    ref
  ) => {
    // State Management
    const [code, setCode] = useState(value || defaultValue);
    const [selectedLanguage, setSelectedLanguage] = useState(language);
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationResult[]>([]);
    const [showMinimap, setShowMinimap] = useState(minimap);
    const [showLineNumbers, setShowLineNumbers] = useState(lineNumbers);
    const [wrapLines, setWrapLines] = useState(wordWrap);
    const [currentFontSize, setCurrentFontSize] = useState(fontSize);
    const [history, setHistory] = useState<string[]>([code]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [autocompleteVisible, setAutocompleteVisible] = useState(false);
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const [tabs, setTabs] = useState<EditorTab[]>([
      {
        id: '1',
        name: 'untitled-1.js',
        content: code,
        language: selectedLanguage,
        isDirty: false,
        isActive: true
      }
    ]);
    const [activeTabId, setActiveTabId] = useState('1');
    const [showSettings, setShowSettings] = useState(false);
    const [files, setFiles] = useState<FileNode[]>([
      {
        id: '1',
        name: 'src',
        type: 'folder',
        expanded: true,
        children: [
          { id: '2', name: 'index.js', type: 'file', content: '// Main entry point', language: 'javascript' },
          { id: '3', name: 'app.js', type: 'file', content: '// App component', language: 'javascript' },
          { id: '4', name: 'styles.css', type: 'file', content: '/* Styles */', language: 'css' }
        ]
      }
    ]);
    const [showFileExplorer, setShowFileExplorer] = useState(false);
    const [showConsole, setShowConsole] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    
    // Refs
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    // Get current theme
    const currentTheme = useMemo(() => {
      const allThemes = { ...EDITOR_THEMES, ...customThemes };
      return allThemes[selectedTheme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : selectedTheme] || EDITOR_THEMES.dark;
    }, [selectedTheme, customThemes]);
    
    // Handle code change
    const handleCodeChange = useCallback((newCode: string) => {
      setCode(newCode);
      setIsDirty(true);
      
      // Update history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newCode]);
      setHistoryIndex(prev => prev + 1);
      
      // Update active tab
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId
          ? { ...tab, content: newCode, isDirty: true }
          : tab
      ));
      
      // Trigger validation
      if (syntaxValidation && onValidate) {
        const errors = onValidate(newCode);
        setValidationErrors(errors);
      }
      
      // Trigger autocomplete
      if (autoComplete && enableLiveAutoComplete) {
        updateAutocompleteSuggestions(newCode);
      }
      
      if (onChange) {
        onChange(newCode);
      }
    }, [activeTabId, historyIndex, syntaxValidation, onValidate, autoComplete, enableLiveAutoComplete, onChange]);
    
    // Update autocomplete suggestions
    const updateAutocompleteSuggestions = useCallback((text: string) => {
      const cursor = editorRef.current?.selectionStart || 0;
      const textBeforeCursor = text.substring(0, cursor);
      const words = textBeforeCursor.split(/\s+/);
      const currentWord = words[words.length - 1];
      
      if (currentWord.length > 1) {
        const langConfig = LANGUAGE_CONFIG[selectedLanguage as keyof typeof LANGUAGE_CONFIG];
        const keywords = langConfig?.keywords || [];
        const suggestions = keywords.filter(kw => kw.startsWith(currentWord));
        
        // Add snippets
        if (enableSnippets) {
          const snippets = CODE_SNIPPETS[selectedLanguage] || {};
          Object.entries(snippets).forEach(([key, snippet]) => {
            if (snippet.trigger.startsWith(currentWord)) {
              suggestions.push(snippet.trigger);
            }
          });
        }
        
        setAutocompleteSuggestions(suggestions);
        setAutocompleteVisible(suggestions.length > 0);
      } else {
        setAutocompleteVisible(false);
      }
    }, [selectedLanguage, enableSnippets]);
    
    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Ctrl/Cmd + F: Find
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      
      // Ctrl/Cmd + H: Replace
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      }
      
      // Tab: Insert spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const spaces = ' '.repeat(tabSize);
        const newCode = code.substring(0, start) + spaces + code.substring(end);
        handleCodeChange(newCode);
        
        // Restore cursor position
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = start + tabSize;
            editorRef.current.selectionEnd = start + tabSize;
          }
        }, 0);
      }
      
      // Enter: Auto-indent
      if (e.key === 'Enter') {
        const start = e.currentTarget.selectionStart;
        const lines = code.substring(0, start).split('\n');
        const currentLine = lines[lines.length - 1];
        const indentMatch = currentLine.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        
        // Check if we should increase indent
        const shouldIncreaseIndent = /[{([]$/.test(currentLine.trim());
        const additionalIndent = shouldIncreaseIndent ? ' '.repeat(tabSize) : '';
        
        e.preventDefault();
        const newCode = code.substring(0, start) + '\n' + indent + additionalIndent + code.substring(start);
        handleCodeChange(newCode);
        
        // Set cursor position
        setTimeout(() => {
          if (editorRef.current) {
            const newPosition = start + 1 + indent.length + additionalIndent.length;
            editorRef.current.selectionStart = newPosition;
            editorRef.current.selectionEnd = newPosition;
          }
        }, 0);
      }
      
      // Autocomplete navigation
      if (autocompleteVisible) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestion(prev => Math.min(prev + 1, autocompleteSuggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestion(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          insertAutocompleteSuggestion();
        } else if (e.key === 'Escape') {
          setAutocompleteVisible(false);
        }
      }
      
      // Bracket matching
      if (enableBracketMatching) {
        const langConfig = LANGUAGE_CONFIG[selectedLanguage as keyof typeof LANGUAGE_CONFIG];
        const pairs = langConfig?.autoClosingPairs || [];
        
        pairs.forEach(pair => {
          if (e.key === pair.open) {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newCode = code.substring(0, start) + pair.open + pair.close + code.substring(end);
            handleCodeChange(newCode);
            
            setTimeout(() => {
              if (editorRef.current) {
                editorRef.current.selectionStart = start + 1;
                editorRef.current.selectionEnd = start + 1;
              }
            }, 0);
          }
        });
      }
    }, [code, tabSize, autocompleteVisible, autocompleteSuggestions, selectedLanguage, enableBracketMatching, handleCodeChange]);
    
    // Insert autocomplete suggestion
    const insertAutocompleteSuggestion = useCallback(() => {
      const suggestion = autocompleteSuggestions[selectedSuggestion];
      if (!suggestion) return;
      
      const cursor = editorRef.current?.selectionStart || 0;
      const textBeforeCursor = code.substring(0, cursor);
      const words = textBeforeCursor.split(/\s+/);
      const currentWord = words[words.length - 1];
      const startPos = cursor - currentWord.length;
      
      // Check if it's a snippet
      const snippets = CODE_SNIPPETS[selectedLanguage] || {};
      const snippet = Object.values(snippets).find(s => s.trigger === suggestion);
      
      if (snippet) {
        const expandedSnippet = snippet.snippet.replace(/\$\d+/g, '');
        const newCode = code.substring(0, startPos) + expandedSnippet + code.substring(cursor);
        handleCodeChange(newCode);
      } else {
        const newCode = code.substring(0, startPos) + suggestion + code.substring(cursor);
        handleCodeChange(newCode);
      }
      
      setAutocompleteVisible(false);
    }, [autocompleteSuggestions, selectedSuggestion, code, selectedLanguage, handleCodeChange]);
    
    // Handle save
    const handleSave = useCallback(() => {
      setIsDirty(false);
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId
          ? { ...tab, isDirty: false }
          : tab
      ));
      
      if (onSave) {
        onSave(code);
      }
    }, [code, activeTabId, onSave]);
    
    // Handle format
    const handleFormat = useCallback(() => {
      let formattedCode = code;
      
      if (onFormat) {
        formattedCode = onFormat(code);
      } else {
        // Basic formatting
        formattedCode = code
          .replace(/\s+$/gm, '') // Remove trailing whitespace
          .replace(/\t/g, ' '.repeat(tabSize)); // Replace tabs with spaces
      }
      
      handleCodeChange(formattedCode);
    }, [code, tabSize, onFormat, handleCodeChange]);
    
    // Handle undo
    const handleUndo = useCallback(() => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCode(history[newIndex]);
      }
    }, [history, historyIndex]);
    
    // Handle redo
    const handleRedo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCode(history[newIndex]);
      }
    }, [history, historyIndex]);
    
    // Handle search
    const handleSearch = useCallback(() => {
      if (!searchQuery) return;
      
      const index = code.toLowerCase().indexOf(searchQuery.toLowerCase());
      if (index !== -1 && editorRef.current) {
        editorRef.current.selectionStart = index;
        editorRef.current.selectionEnd = index + searchQuery.length;
        editorRef.current.focus();
      }
    }, [code, searchQuery]);
    
    // Handle replace
    const handleReplace = useCallback(() => {
      if (!searchQuery) return;
      
      const newCode = code.replace(new RegExp(searchQuery, 'g'), replaceQuery);
      handleCodeChange(newCode);
    }, [code, searchQuery, replaceQuery, handleCodeChange]);
    
    // Handle file selection
    const handleFileSelect = useCallback((file: FileNode) => {
      if (file.type === 'file' && file.content !== undefined) {
        const existingTab = tabs.find(tab => tab.name === file.name);
        
        if (existingTab) {
          setActiveTabId(existingTab.id);
          setCode(existingTab.content);
        } else {
          const newTab: EditorTab = {
            id: Date.now().toString(),
            name: file.name,
            content: file.content,
            language: file.language || 'plaintext',
            isDirty: false,
            isActive: true
          };
          
          setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), newTab]);
          setActiveTabId(newTab.id);
          setCode(file.content);
          setSelectedLanguage(file.language || 'plaintext');
        }
      }
    }, [tabs]);
    
    // Handle tab close
    const handleTabClose = useCallback((tabId: string) => {
      setTabs(prev => {
        const newTabs = prev.filter(tab => tab.id !== tabId);
        if (newTabs.length === 0) {
          // Create a new untitled tab if all tabs are closed
          const newTab: EditorTab = {
            id: Date.now().toString(),
            name: 'untitled-1.js',
            content: '',
            language: 'javascript',
            isDirty: false,
            isActive: true
          };
          return [newTab];
        }
        
        // Activate the last tab if the active tab was closed
        if (activeTabId === tabId && newTabs.length > 0) {
          const lastTab = newTabs[newTabs.length - 1];
          lastTab.isActive = true;
          setActiveTabId(lastTab.id);
          setCode(lastTab.content);
          setSelectedLanguage(lastTab.language);
        }
        
        return newTabs;
      });
    }, [activeTabId]);
    
    // Update cursor position
    const updateCursorPosition = useCallback(() => {
      if (editorRef.current) {
        const position = editorRef.current.selectionStart;
        const textBeforeCursor = code.substring(0, position);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        setCursorPosition({ line, column });
      }
    }, [code]);
    
    // Handle running code (simplified)
    const handleRunCode = useCallback(() => {
      try {
        // This is a simplified example - in production, you'd use a proper sandbox
        const output: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => output.push(args.join(' ')),
          error: (...args: any[]) => output.push(`ERROR: ${args.join(' ')}`),
          warn: (...args: any[]) => output.push(`WARN: ${args.join(' ')}`)
        };
        
        // WARNING: eval is dangerous and should not be used in production
        // Use a proper sandboxed environment instead
        const func = new Function('console', code);
        func(mockConsole);
        
        setConsoleOutput(output);
        setShowConsole(true);
      } catch (error: any) {
        setConsoleOutput([`Error: ${error.message}`]);
        setShowConsole(true);
      }
    }, [code]);
    
    // File Explorer Component
    const FileExplorer = ({ nodes }: { nodes: FileNode[] }) => {
      const renderNode = (node: FileNode, depth: number = 0) => (
        <div key={node.id} style={{ paddingLeft: `${depth * 12}px` }}>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 hover:bg-muted rounded cursor-pointer',
              node.type === 'file' && 'hover:bg-primary/10'
            )}
            onClick={() => {
              if (node.type === 'folder') {
                setFiles(prev => {
                  const updateExpanded = (nodes: FileNode[]): FileNode[] => {
                    return nodes.map(n => {
                      if (n.id === node.id) {
                        return { ...n, expanded: !n.expanded };
                      }
                      if (n.children) {
                        return { ...n, children: updateExpanded(n.children) };
                      }
                      return n;
                    });
                  };
                  return updateExpanded(prev);
                });
              } else {
                handleFileSelect(node);
              }
            }}
          >
            {node.type === 'folder' ? (
              node.expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            ) : null}
            {node.type === 'folder' ? (
              <FolderOpen className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span className="text-xs">{node.name}</span>
          </div>
          {node.type === 'folder' && node.expanded && node.children && (
            <div>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
      
      return <div className="py-2">{nodes.map(node => renderNode(node))}</div>;
    };
    
    // Initialize extensions
    useEffect(() => {
      extensions.forEach(ext => {
        ext.initialize(editorRef.current);
      });
      
      return () => {
        extensions.forEach(ext => {
          if (ext.destroy) ext.destroy();
        });
      };
    }, [extensions]);
    
    // Update value from prop
    useEffect(() => {
      if (value !== undefined && value !== code) {
        setCode(value);
      }
    }, [value]);
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full min-h-[400px] border rounded-lg overflow-hidden',
          isFullscreen && 'fixed inset-0 z-50',
          className
        )}
        style={{
          backgroundColor: currentTheme.background,
          color: currentTheme.foreground
        }}
        {...props}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(LANGUAGE_CONFIG).map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Separator orientation="vertical" className="h-6" />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={!isDirty}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save (Ctrl+S)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Separator orientation="vertical" className="h-6" />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Find (Ctrl+F)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFormat}
                  >
                    <Braces className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Format Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRunCode}
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </span>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Toggle
              size="sm"
              pressed={showFileExplorer}
              onPressedChange={setShowFileExplorer}
            >
              <FolderOpen className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={showLineNumbers}
              onPressedChange={setShowLineNumbers}
            >
              <span className="text-xs font-mono">#</span>
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={wrapLines}
              onPressedChange={setWrapLines}
            >
              <WrapText className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              size="sm"
              pressed={showMinimap}
              onPressedChange={setShowMinimap}
            >
              <span className="text-xs">Map</span>
            </Toggle>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Select
              value={selectedTheme}
              onValueChange={setSelectedTheme}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="monokai">Monokai</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="dracula">Dracula</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search/Replace Bar */}
        {showSearch && (
          <div className="px-4 py-2 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                placeholder="Find..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-[200px] h-8"
              />
              <Input
                placeholder="Replace..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="w-[200px] h-8"
              />
              <Button size="sm" variant="outline" onClick={handleSearch}>
                Find
              </Button>
              <Button size="sm" variant="outline" onClick={handleReplace}>
                Replace All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSearch(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex items-center border-b bg-background/95 backdrop-blur overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 border-r cursor-pointer hover:bg-muted/50',
                tab.isActive && 'bg-muted'
              )}
              onClick={() => {
                setActiveTabId(tab.id);
                setCode(tab.content);
                setSelectedLanguage(tab.language);
              }}
            >
              <FileCode className="h-3 w-3" />
              <span className="text-xs">{tab.name}</span>
              {tab.isDirty && <span className="text-xs">•</span>}
              <button
                className="ml-1 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClose(tab.id);
                }}
              >
                <XCircle className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="h-full px-2"
            onClick={() => {
              const newTab: EditorTab = {
                id: Date.now().toString(),
                name: `untitled-${tabs.length + 1}.js`,
                content: '',
                language: 'javascript',
                isDirty: false,
                isActive: true
              };
              setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), newTab]);
              setActiveTabId(newTab.id);
              setCode('');
            }}
          >
            +
          </Button>
        </div>
        
        {/* Main Editor Area */}
        <div className="flex flex-1 h-[calc(100%-120px)]">
          {/* File Explorer */}
          {showFileExplorer && (
            <div className="w-[200px] border-r bg-background/95 backdrop-blur">
              <div className="p-2 border-b">
                <h3 className="text-xs font-semibold">Files</h3>
              </div>
              <ScrollArea className="h-full">
                <FileExplorer nodes={files} />
              </ScrollArea>
            </div>
          )}
          
          {/* Editor Container */}
          <div className="flex-1 relative" ref={editorContainerRef}>
            <div className="absolute inset-0 flex">
              {/* Line Numbers */}
              {showLineNumbers && (
                <div
                  className="px-2 py-2 text-right select-none border-r"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.lineNumber,
                    fontSize: `${currentFontSize}px`,
                    lineHeight: '1.5',
                    minWidth: '40px'
                  }}
                >
                  {code.split('\n').map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
              )}
              
              {/* Code Editor */}
              <div className="flex-1 relative">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onSelect={updateCursorPosition}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full px-4 py-2 resize-none outline-none bg-transparent font-mono"
                  style={{
                    fontSize: `${currentFontSize}px`,
                    lineHeight: '1.5',
                    tabSize,
                    whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
                    wordWrap: wrapLines ? 'break-word' : 'normal',
                    color: currentTheme.foreground,
                    caretColor: currentTheme.foreground
                  }}
                />
                
                {/* Autocomplete Dropdown */}
                {autocompleteVisible && autocompleteSuggestions.length > 0 && (
                  <div
                    className="absolute z-10 mt-1 bg-popover border rounded-md shadow-lg"
                    style={{
                      top: `${(cursorPosition.line) * 24}px`,
                      left: `${cursorPosition.column * 8}px`
                    }}
                  >
                    {autocompleteSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        className={cn(
                          'px-2 py-1 cursor-pointer text-sm',
                          index === selectedSuggestion && 'bg-primary text-primary-foreground'
                        )}
                        onClick={() => {
                          setSelectedSuggestion(index);
                          insertAutocompleteSuggestion();
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/95 border-t p-2 max-h-[100px] overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {error.severity === 'error' && <XCircle className="h-3 w-3 text-red-500" />}
                        {error.severity === 'warning' && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                        {error.severity === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                        <span>
                          Line {error.line}:{error.column} - {error.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Minimap */}
              {showMinimap && (
                <div className="w-[100px] border-l bg-muted/20 p-2">
                  <div className="text-[4px] font-mono opacity-50 select-none">
                    {code}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Console Output */}
        {showConsole && (
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-background border-t">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Console Output
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConsole(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)] p-4">
              <div className="font-mono text-xs space-y-1">
                {consoleOutput.map((line, index) => (
                  <div key={index} className={cn(
                    line.startsWith('ERROR:') && 'text-red-500',
                    line.startsWith('WARN:') && 'text-yellow-500'
                  )}>
                    {line}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-[40px] right-0 w-[300px] h-full bg-background border-l p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-4">Editor Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={currentFontSize}
                  onChange={(e) => setCurrentFontSize(parseInt(e.target.value))}
                  min={10}
                  max={24}
                />
              </div>
              
              <div>
                <Label htmlFor="tabSize">Tab Size</Label>
                <Input
                  id="tabSize"
                  type="number"
                  value={tabSize}
                  min={2}
                  max={8}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableBracketMatching}
                    disabled
                  />
                  <span className="text-sm">Bracket Matching</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableSnippets}
                    disabled
                  />
                  <span className="text-sm">Enable Snippets</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableMultiCursor}
                    disabled
                  />
                  <span className="text-sm">Multi-Cursor</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={highlightActiveLine}
                    disabled
                  />
                  <span className="text-sm">Highlight Active Line</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOnPaste}
                    disabled
                  />
                  <span className="text-sm">Format On Paste</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOnType}
                    disabled
                  />
                  <span className="text-sm">Format On Type</span>
                </label>
              </div>
            </div>
            
            <Button
              className="absolute top-4 right-4"
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(false)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;