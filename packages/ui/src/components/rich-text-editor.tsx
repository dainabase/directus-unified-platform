import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '../utils/cn';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Toggle } from './toggle';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Link2,
  Image,
  Video,
  Table,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Type,
  Palette,
  Highlighter,
  ChevronDown,
  FileText,
  Eye,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Code2,
  Hash,
  Heading1,
  Heading2,
  Heading3,
  ListChecks,
  Indent,
  Outdent,
  Subscript,
  Superscript,
  RemoveFormatting,
  Smile,
  AtSign,
  Calendar,
  Clock,
  Search,
  Settings
} from 'lucide-react';

// Types
export interface RichTextEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onChangeHtml?: (html: string) => void;
  onChangeMarkdown?: (markdown: string) => void;
  placeholder?: string;
  mode?: 'wysiwyg' | 'markdown' | 'split';
  enableMarkdown?: boolean;
  enableToolbar?: boolean;
  enableFloatingToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom' | 'floating';
  toolbarItems?: ToolbarItem[];
  minHeight?: number;
  maxHeight?: number;
  maxLength?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  mentions?: MentionConfig;
  emojis?: boolean;
  mediaUpload?: MediaUploadConfig;
  customCommands?: CustomCommand[];
  className?: string;
  editorClassName?: string;
  toolbarClassName?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelectionChange?: (selection: Selection | null) => void;
}

export interface ToolbarItem {
  id: string;
  icon?: React.ReactNode;
  label: string;
  command: string | (() => void);
  active?: boolean;
  disabled?: boolean;
  group?: string;
}

export interface MentionConfig {
  trigger: string;
  suggestions: Array<{ id: string; label: string; avatar?: string }>;
  onMention?: (mention: { id: string; label: string }) => void;
}

export interface MediaUploadConfig {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<string>;
  onError?: (error: Error) => void;
}

export interface CustomCommand {
  id: string;
  label: string;
  icon?: React.ReactNode;
  execute: (editor: HTMLDivElement) => void;
}

// Toolbar groups and items
const defaultToolbarGroups = {
  text: [
    { id: 'bold', icon: <Bold className="h-4 w-4" />, label: 'Bold', command: 'bold' },
    { id: 'italic', icon: <Italic className="h-4 w-4" />, label: 'Italic', command: 'italic' },
    { id: 'underline', icon: <Underline className="h-4 w-4" />, label: 'Underline', command: 'underline' },
    { id: 'strikethrough', icon: <Strikethrough className="h-4 w-4" />, label: 'Strikethrough', command: 'strikeThrough' },
    { id: 'code', icon: <Code className="h-4 w-4" />, label: 'Code', command: 'code' },
  ],
  format: [
    { id: 'h1', icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', command: 'formatBlock:h1' },
    { id: 'h2', icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', command: 'formatBlock:h2' },
    { id: 'h3', icon: <Heading3 className="h-4 w-4" />, label: 'Heading 3', command: 'formatBlock:h3' },
    { id: 'quote', icon: <Quote className="h-4 w-4" />, label: 'Quote', command: 'formatBlock:blockquote' },
  ],
  lists: [
    { id: 'ul', icon: <List className="h-4 w-4" />, label: 'Bullet List', command: 'insertUnorderedList' },
    { id: 'ol', icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered List', command: 'insertOrderedList' },
    { id: 'checklist', icon: <ListChecks className="h-4 w-4" />, label: 'Checklist', command: 'checklist' },
  ],
  align: [
    { id: 'left', icon: <AlignLeft className="h-4 w-4" />, label: 'Align Left', command: 'justifyLeft' },
    { id: 'center', icon: <AlignCenter className="h-4 w-4" />, label: 'Align Center', command: 'justifyCenter' },
    { id: 'right', icon: <AlignRight className="h-4 w-4" />, label: 'Align Right', command: 'justifyRight' },
    { id: 'justify', icon: <AlignJustify className="h-4 w-4" />, label: 'Justify', command: 'justifyFull' },
  ],
  indent: [
    { id: 'outdent', icon: <Outdent className="h-4 w-4" />, label: 'Decrease Indent', command: 'outdent' },
    { id: 'indent', icon: <Indent className="h-4 w-4" />, label: 'Increase Indent', command: 'indent' },
  ],
  insert: [
    { id: 'link', icon: <Link2 className="h-4 w-4" />, label: 'Insert Link', command: 'createLink' },
    { id: 'image', icon: <Image className="h-4 w-4" />, label: 'Insert Image', command: 'insertImage' },
    { id: 'video', icon: <Video className="h-4 w-4" />, label: 'Insert Video', command: 'insertVideo' },
    { id: 'table', icon: <Table className="h-4 w-4" />, label: 'Insert Table', command: 'insertTable' },
    { id: 'hr', icon: <Minus className="h-4 w-4" />, label: 'Horizontal Line', command: 'insertHorizontalRule' },
  ],
  misc: [
    { id: 'removeFormat', icon: <RemoveFormatting className="h-4 w-4" />, label: 'Clear Formatting', command: 'removeFormat' },
    { id: 'subscript', icon: <Subscript className="h-4 w-4" />, label: 'Subscript', command: 'subscript' },
    { id: 'superscript', icon: <Superscript className="h-4 w-4" />, label: 'Superscript', command: 'superscript' },
  ],
  actions: [
    { id: 'undo', icon: <Undo className="h-4 w-4" />, label: 'Undo', command: 'undo' },
    { id: 'redo', icon: <Redo className="h-4 w-4" />, label: 'Redo', command: 'redo' },
    { id: 'copy', icon: <Copy className="h-4 w-4" />, label: 'Copy', command: 'copy' },
    { id: 'cut', icon: <Scissors className="h-4 w-4" />, label: 'Cut', command: 'cut' },
    { id: 'paste', icon: <Clipboard className="h-4 w-4" />, label: 'Paste', command: 'paste' },
  ],
};

// Markdown conversion utilities
const htmlToMarkdown = (html: string): string => {
  let markdown = html;
  
  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');
  
  // Text formatting
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Links and images
  markdown = markdown.replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  
  // Lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let index = 0;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      index++;
      return `${index}. $1\n`;
    });
  });
  
  // Blockquote
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n');
  
  // Line breaks and paragraphs
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  markdown = markdown.replace(/<hr[^>]*>/gi, '---\n');
  
  // Clean up
  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
};

const markdownToHtml = (markdown: string): string => {
  let html = markdown;
  
  // Headers
  html = html.replace(/^###### (.*?)$/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*?)$/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*?)$/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*?)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Strikethrough
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  
  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  
  // Unordered lists
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Paragraphs
  html = html.split('\n\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  
  return html;
};

// Toolbar Component
const EditorToolbar: React.FC<{
  items: ToolbarItem[];
  onCommand: (command: string) => void;
  className?: string;
  floating?: boolean;
}> = ({ items, onCommand, className, floating }) => {
  const groupedItems = useMemo(() => {
    const groups: Record<string, ToolbarItem[]> = {};
    items.forEach(item => {
      const group = item.group || 'default';
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [items]);

  return (
    <div 
      className={cn(
        "flex items-center gap-1 p-2 border rounded-lg bg-background",
        floating && "shadow-lg",
        className
      )}
    >
      {Object.entries(groupedItems).map(([group, groupItems], index) => (
        <React.Fragment key={group}>
          {index > 0 && <Separator orientation="vertical" className="h-6" />}
          <div className="flex items-center gap-1">
            {groupItems.map(item => (
              <Toggle
                key={item.id}
                size="sm"
                pressed={item.active}
                disabled={item.disabled}
                onPressedChange={() => onCommand(item.command as string)}
                aria-label={item.label}
              >
                {item.icon}
              </Toggle>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// Main RichTextEditor Component
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  defaultValue,
  onChange,
  onChangeHtml,
  onChangeMarkdown,
  placeholder = 'Start typing...',
  mode = 'wysiwyg',
  enableMarkdown = true,
  enableToolbar = true,
  enableFloatingToolbar = false,
  toolbarPosition = 'top',
  toolbarItems,
  minHeight = 200,
  maxHeight = 600,
  maxLength,
  autoFocus = false,
  readOnly = false,
  disabled = false,
  mentions,
  emojis = false,
  mediaUpload,
  customCommands = [],
  className,
  editorClassName,
  toolbarClassName,
  onFocus,
  onBlur,
  onSelectionChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(value || defaultValue || '');
  const [currentMode, setCurrentMode] = useState(mode);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Default toolbar items
  const defaultItems = useMemo(() => {
    const items: ToolbarItem[] = [];
    
    Object.entries(defaultToolbarGroups).forEach(([group, groupItems]) => {
      groupItems.forEach(item => {
        items.push({ ...item, group });
      });
    });
    
    return items;
  }, []);

  const activeToolbarItems = toolbarItems || defaultItems;

  // Execute command
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Handle special commands
    if (command.startsWith('formatBlock:')) {
      const tag = command.split(':')[1];
      document.execCommand('formatBlock', false, tag);
    } else if (command === 'createLink') {
      setShowLinkDialog(true);
    } else if (command === 'insertImage') {
      setShowImageDialog(true);
    } else if (command === 'insertVideo') {
      setShowVideoDialog(true);
    } else if (command === 'insertTable') {
      setShowTableDialog(true);
    } else if (command === 'checklist') {
      // Custom checklist implementation
      const html = '<ul style="list-style-type: none;"><li>☐ </li></ul>';
      document.execCommand('insertHTML', false, html);
    } else if (command === 'code') {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        const code = `<code>${selection.toString()}</code>`;
        document.execCommand('insertHTML', false, code);
      }
    } else {
      // Standard commands
      document.execCommand(command, false, value);
    }
    
    // Update content
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      handleContentChange(newContent);
    }
  }, []);

  // Handle content change
  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    setCharCount(html.replace(/<[^>]*>/g, '').length);
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), html]);
    setHistoryIndex(prev => prev + 1);
    
    // Callbacks
    onChange?.(html.replace(/<[^>]*>/g, ''));
    onChangeHtml?.(html);
    
    if (enableMarkdown) {
      onChangeMarkdown?.(htmlToMarkdown(html));
    }
  }, [onChange, onChangeHtml, onChangeMarkdown, enableMarkdown, historyIndex]);

  // Handle input
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.innerHTML;
    
    // Check max length
    if (maxLength) {
      const text = html.replace(/<[^>]*>/g, '');
      if (text.length > maxLength) {
        editorRef.current.innerHTML = content;
        return;
      }
    }
    
    handleContentChange(html);
  }, [content, maxLength, handleContentChange]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            executeCommand('redo');
          } else {
            executeCommand('undo');
          }
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    }
    
    // Tab for indent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        executeCommand('outdent');
      } else {
        executeCommand('indent');
      }
    }
  }, [executeCommand]);

  // Handle selection change
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    setSelection(sel);
    onSelectionChange?.(sel);
  }, [onSelectionChange]);

  // Insert link
  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const html = `<a href="${linkUrl}" target="_blank">${linkText}</a>`;
      executeCommand('insertHTML', html);
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, executeCommand]);

  // Insert image
  const insertImage = useCallback(() => {
    if (imageUrl) {
      const html = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%;">`;
      executeCommand('insertHTML', html);
    }
    setShowImageDialog(false);
    setImageUrl('');
    setImageAlt('');
  }, [imageUrl, imageAlt, executeCommand]);

  // Insert video
  const insertVideo = useCallback(() => {
    if (videoUrl) {
      const html = `<video src="${videoUrl}" controls style="max-width: 100%;"></video>`;
      executeCommand('insertHTML', html);
    }
    setShowVideoDialog(false);
    setVideoUrl('');
  }, [videoUrl, executeCommand]);

  // Insert table
  const insertTable = useCallback(() => {
    let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    for (let i = 0; i < tableRows; i++) {
      html += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        html += `<td style="padding: 8px; border: 1px solid #ddd;">&nbsp;</td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    executeCommand('insertHTML', html);
    setShowTableDialog(false);
    setTableRows(3);
    setTableCols(3);
  }, [tableRows, tableCols, executeCommand]);

  // Initialize
  useEffect(() => {
    if (editorRef.current && (value || defaultValue)) {
      editorRef.current.innerHTML = value || defaultValue || '';
    }
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (value !== undefined && editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      setContent(value);
    }
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  // Selection change listener
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div 
      className={cn(
        "rich-text-editor border rounded-lg",
        isFullscreen && "fixed inset-0 z-50 bg-background",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Toolbar */}
      {enableToolbar && toolbarPosition === 'top' && (
        <div className={cn("border-b", toolbarClassName)}>
          <EditorToolbar
            items={activeToolbarItems}
            onCommand={executeCommand}
          />
        </div>
      )}

      {/* Editor Tabs */}
      {enableMarkdown && (
        <Tabs value={currentMode} onValueChange={(v) => setCurrentMode(v as typeof mode)}>
          <div className="flex items-center justify-between border-b px-3">
            <TabsList className="h-9">
              <TabsTrigger value="wysiwyg" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="markdown" className="text-xs">
                <Code2 className="h-3 w-3 mr-1" />
                Markdown
              </TabsTrigger>
              <TabsTrigger value="split" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Split
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {maxLength && (
                <span className="text-xs text-muted-foreground">
                  {charCount}/{maxLength}
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className={cn(
            "flex",
            currentMode === 'split' && "divide-x"
          )}>
            {/* WYSIWYG Editor */}
            {(currentMode === 'wysiwyg' || currentMode === 'split') && (
              <TabsContent 
                value={currentMode} 
                className={cn(
                  "mt-0",
                  currentMode === 'split' && "w-1/2"
                )}
              >
                <ScrollArea 
                  className="w-full"
                  style={{ 
                    minHeight: `${minHeight}px`,
                    maxHeight: `${maxHeight}px`
                  }}
                >
                  <div
                    ref={editorRef}
                    contentEditable={!readOnly && !disabled}
                    className={cn(
                      "p-4 outline-none prose prose-sm max-w-none",
                      "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      editorClassName
                    )}
                    style={{ minHeight: `${minHeight}px` }}
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    data-placeholder={placeholder}
                    suppressContentEditableWarning
                  />
                </ScrollArea>
              </TabsContent>
            )}

            {/* Markdown Editor */}
            {(currentMode === 'markdown' || currentMode === 'split') && (
              <TabsContent 
                value={currentMode}
                className={cn(
                  "mt-0",
                  currentMode === 'split' && "w-1/2"
                )}
              >
                <ScrollArea 
                  className="w-full"
                  style={{ 
                    minHeight: `${minHeight}px`,
                    maxHeight: `${maxHeight}px`
                  }}
                >
                  <textarea
                    className={cn(
                      "w-full h-full p-4 font-mono text-sm bg-transparent outline-none resize-none",
                      "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      editorClassName
                    )}
                    style={{ minHeight: `${minHeight}px` }}
                    value={htmlToMarkdown(content)}
                    onChange={(e) => {
                      const markdown = e.target.value;
                      const html = markdownToHtml(markdown);
                      setContent(html);
                      if (editorRef.current) {
                        editorRef.current.innerHTML = html;
                      }
                      handleContentChange(html);
                    }}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </ScrollArea>
              </TabsContent>
            )}
          </div>
        </Tabs>
      )}

      {/* Simple editor without tabs */}
      {!enableMarkdown && (
        <ScrollArea 
          className="w-full"
          style={{ 
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`
          }}
        >
          <div
            ref={editorRef}
            contentEditable={!readOnly && !disabled}
            className={cn(
              "p-4 outline-none prose prose-sm max-w-none",
              "focus:ring-2 focus:ring-primary focus:ring-offset-2",
              editorClassName
            )}
            style={{ minHeight: `${minHeight}px` }}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            data-placeholder={placeholder}
            suppressContentEditableWarning
          />
        </ScrollArea>
      )}

      {/* Bottom Toolbar */}
      {enableToolbar && toolbarPosition === 'bottom' && (
        <div className={cn("border-t", toolbarClassName)}>
          <EditorToolbar
            items={activeToolbarItems}
            onCommand={executeCommand}
          />
        </div>
      )}

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Link Text</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter link text"
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertImage}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Video URL</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertVideo}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rows</Label>
              <Input
                type="number"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <div>
              <Label>Columns</Label>
              <Input
                type="number"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value))}
                min={1}
                max={20}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertTable}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;