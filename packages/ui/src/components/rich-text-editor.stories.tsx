import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RichTextEditor, ToolbarItem } from './rich-text-editor';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link2, 
  Image, 
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Table,
  Heading1,
  Heading2,
  Smile,
  AtSign
} from 'lucide-react';

const meta = {
  title: 'Sprint-3/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A powerful rich text editor with WYSIWYG editing, Markdown support, and customizable toolbar.',
      },
    },
  },
  tags: ['sprint-3', 'form', 'input'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['wysiwyg', 'markdown', 'split'],
      description: 'Editor mode',
    },
    enableMarkdown: {
      control: 'boolean',
      description: 'Enable Markdown support',
    },
    enableToolbar: {
      control: 'boolean',
      description: 'Show toolbar',
    },
    toolbarPosition: {
      control: 'select',
      options: ['top', 'bottom', 'floating'],
      description: 'Toolbar position',
    },
    minHeight: {
      control: 'number',
      description: 'Minimum editor height',
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum editor height',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum character length',
    },
    readOnly: {
      control: 'boolean',
      description: 'Read-only mode',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    emojis: {
      control: 'boolean',
      description: 'Enable emoji picker',
    },
  },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content
const sampleHtml = `
<h1>Welcome to the Rich Text Editor</h1>
<p>This is a <strong>powerful</strong> and <em>flexible</em> rich text editor with many features:</p>
<ul>
  <li>WYSIWYG editing</li>
  <li>Markdown support</li>
  <li>Customizable toolbar</li>
  <li>Multiple view modes</li>
</ul>
<blockquote>
  <p>Create beautiful content with ease!</p>
</blockquote>
<p>You can add <a href="https://example.com">links</a>, format text, and much more.</p>
`;

const sampleMarkdown = `# Welcome to the Rich Text Editor

This is a **powerful** and *flexible* rich text editor with many features:

- WYSIWYG editing
- Markdown support
- Customizable toolbar
- Multiple view modes

> Create beautiful content with ease!

You can add [links](https://example.com), format text, and much more.
`;

// Default Editor
export const Default: Story = {
  render: () => {
    const [content, setContent] = useState('');
    const [html, setHtml] = useState('');
    const [markdown, setMarkdown] = useState('');

    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rich Text Editor</h3>
          <RichTextEditor
            placeholder="Start typing your content..."
            onChange={setContent}
            onChangeHtml={setHtml}
            onChangeMarkdown={setMarkdown}
            enableMarkdown
            enableToolbar
          />
        </Card>
        
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="font-medium mb-2">Plain Text</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {content || 'No content yet...'}
            </p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">HTML Output</h4>
            <code className="text-xs text-muted-foreground line-clamp-3">
              {html || '<p>No HTML yet...</p>'}
            </code>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">Markdown Output</h4>
            <code className="text-xs text-muted-foreground line-clamp-3">
              {markdown || '# No markdown yet...'}
            </code>
          </Card>
        </div>
      </div>
    );
  },
};

// With Initial Content
export const WithInitialContent: Story = {
  render: () => {
    const [value, setValue] = useState(sampleHtml);

    return (
      <div className="w-full max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pre-filled Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setValue(sampleHtml)}
            >
              Reset Content
            </Button>
          </div>
          <RichTextEditor
            value={value}
            onChange={(text) => console.log('Text:', text)}
            onChangeHtml={setValue}
            enableMarkdown
            enableToolbar
            minHeight={300}
          />
        </Card>
      </div>
    );
  },
};

// Markdown Mode
export const MarkdownMode: Story = {
  render: () => {
    const [markdown, setMarkdown] = useState(sampleMarkdown);
    const [preview, setPreview] = useState('');

    return (
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Markdown Editor</h3>
            <RichTextEditor
              mode="markdown"
              defaultValue={sampleMarkdown}
              onChangeMarkdown={setMarkdown}
              onChangeHtml={setPreview}
              enableMarkdown
              enableToolbar
              minHeight={400}
            />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </Card>
        </div>
        
        <Card className="p-4 mt-4">
          <h4 className="font-medium mb-2">Raw Markdown</h4>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
            {markdown}
          </pre>
        </Card>
      </div>
    );
  },
};

// Split View Mode
export const SplitView: Story = {
  render: () => {
    const [content, setContent] = useState('');

    return (
      <div className="w-full max-w-6xl">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Split View Editor</h3>
            <Badge>WYSIWYG + Markdown</Badge>
          </div>
          <RichTextEditor
            mode="split"
            placeholder="Edit in visual or markdown mode..."
            onChange={setContent}
            enableMarkdown
            enableToolbar
            minHeight={400}
            defaultValue={sampleHtml}
          />
        </Card>
      </div>
    );
  },
};

// Custom Toolbar
export const CustomToolbar: Story = {
  render: () => {
    const customToolbarItems: ToolbarItem[] = [
      { id: 'bold', icon: <Bold className="h-4 w-4" />, label: 'Bold', command: 'bold', group: 'format' },
      { id: 'italic', icon: <Italic className="h-4 w-4" />, label: 'Italic', command: 'italic', group: 'format' },
      { id: 'underline', icon: <Underline className="h-4 w-4" />, label: 'Underline', command: 'underline', group: 'format' },
      { id: 'h1', icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', command: 'formatBlock:h1', group: 'heading' },
      { id: 'h2', icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', command: 'formatBlock:h2', group: 'heading' },
      { id: 'ul', icon: <List className="h-4 w-4" />, label: 'Bullet List', command: 'insertUnorderedList', group: 'list' },
      { id: 'ol', icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered List', command: 'insertOrderedList', group: 'list' },
      { id: 'link', icon: <Link2 className="h-4 w-4" />, label: 'Link', command: 'createLink', group: 'insert' },
      { id: 'image', icon: <Image className="h-4 w-4" />, label: 'Image', command: 'insertImage', group: 'insert' },
      { id: 'emoji', icon: <Smile className="h-4 w-4" />, label: 'Emoji', command: 'insertEmoji', group: 'insert' },
    ];

    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Custom Toolbar Configuration</h3>
          <RichTextEditor
            toolbarItems={customToolbarItems}
            placeholder="Editor with custom toolbar..."
            enableMarkdown={false}
            minHeight={250}
          />
        </Card>
        
        <Card className="p-4">
          <h4 className="font-medium mb-2">Available Toolbar Groups</h4>
          <div className="flex flex-wrap gap-2">
            {['format', 'heading', 'list', 'insert'].map(group => (
              <Badge key={group} variant="secondary">
                {group}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    );
  },
};

// Character Limit
export const WithCharacterLimit: Story = {
  render: () => {
    const [content, setContent] = useState('');
    const maxLength = 500;

    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Limited Editor</h3>
            <Badge variant={content.length > maxLength * 0.8 ? 'destructive' : 'secondary'}>
              {content.length}/{maxLength} characters
            </Badge>
          </div>
          <RichTextEditor
            onChange={setContent}
            maxLength={maxLength}
            placeholder={`Write up to ${maxLength} characters...`}
            enableMarkdown
            enableToolbar
            minHeight={200}
          />
        </Card>
        
        {content.length > maxLength * 0.8 && (
          <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              ⚠️ You're approaching the character limit!
            </p>
          </Card>
        )}
      </div>
    );
  },
};

// Multiple Editors
export const MultipleEditors: Story = {
  render: () => {
    const [bio, setBio] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');

    return (
      <div className="w-full max-w-4xl space-y-4">
        <h3 className="text-lg font-semibold">Form with Multiple Rich Text Fields</h3>
        
        <Card className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <RichTextEditor
              value={bio}
              onChange={setBio}
              placeholder="Write your bio..."
              maxLength={200}
              minHeight={100}
              enableToolbar
              toolbarPosition="bottom"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Add a detailed description..."
              minHeight={150}
              enableMarkdown
              mode="markdown"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <RichTextEditor
              value={notes}
              onChange={setNotes}
              placeholder="Additional notes..."
              minHeight={100}
              enableToolbar={false}
            />
          </div>
          
          <div className="flex gap-2">
            <Button>Save All</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </Card>
      </div>
    );
  },
};

// Read-only Mode
export const ReadOnlyMode: Story = {
  render: () => {
    const blogPost = `
      <h1>The Future of Web Development</h1>
      <p class="lead">Exploring emerging trends and technologies shaping the web.</p>
      
      <h2>1. AI-Powered Development</h2>
      <p>Artificial intelligence is revolutionizing how we write code. From intelligent code completion to automated testing, AI tools are becoming essential for modern developers.</p>
      
      <blockquote>
        <p>"The best way to predict the future is to invent it." - Alan Kay</p>
      </blockquote>
      
      <h2>2. WebAssembly Revolution</h2>
      <p>WebAssembly enables near-native performance in browsers, opening doors for:</p>
      <ul>
        <li>High-performance web applications</li>
        <li>Complex computations in the browser</li>
        <li>Cross-platform development</li>
      </ul>
      
      <h2>3. Edge Computing</h2>
      <p>Moving computation closer to users reduces latency and improves performance. Edge functions are becoming the new standard for dynamic content delivery.</p>
      
      <h3>Key Benefits:</h3>
      <ol>
        <li><strong>Reduced Latency:</strong> Faster response times</li>
        <li><strong>Improved Security:</strong> Data stays regional</li>
        <li><strong>Better Scalability:</strong> Distributed architecture</li>
      </ol>
      
      <p>Stay tuned for more insights on web development trends!</p>
    `;

    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Published Article</h3>
            <Badge variant="secondary">Read Only</Badge>
          </div>
          <RichTextEditor
            value={blogPost}
            readOnly
            enableToolbar={false}
            enableMarkdown={false}
            minHeight={400}
          />
        </Card>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <AtSign className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            Export as PDF
          </Button>
        </div>
      </div>
    );
  },
};

// With Mentions
export const WithMentions: Story = {
  render: () => {
    const [content, setContent] = useState('');
    
    const mentionConfig = {
      trigger: '@',
      suggestions: [
        { id: '1', label: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        { id: '2', label: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
        { id: '3', label: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?u=bob' },
        { id: '4', label: 'Alice Brown', avatar: 'https://i.pravatar.cc/150?u=alice' },
        { id: '5', label: 'Charlie Wilson', avatar: 'https://i.pravatar.cc/150?u=charlie' },
      ],
      onMention: (mention: any) => {
        console.log('Mentioned:', mention);
      }
    };

    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collaboration Editor</h3>
          <RichTextEditor
            onChange={setContent}
            placeholder="Type @ to mention someone..."
            mentions={mentionConfig}
            emojis
            enableMarkdown
            enableToolbar
            minHeight={250}
          />
        </Card>
        
        <Card className="p-4">
          <h4 className="font-medium mb-2">Available Mentions</h4>
          <div className="flex flex-wrap gap-2">
            {mentionConfig.suggestions.map(user => (
              <Badge key={user.id} variant="outline">
                @{user.label}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    );
  },
};

// Performance Test
export const PerformanceTest: Story = {
  render: () => {
    const [editors, setEditors] = useState<string[]>(Array(10).fill(''));
    const [activeTab, setActiveTab] = useState('0');

    const longContent = Array(50).fill(null).map((_, i) => 
      `<p>This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`
    ).join('');

    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Test - 10 Editors</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditors(editors.map(() => longContent))}
              >
                Fill All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditors(Array(10).fill(''))}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-10 w-full">
              {editors.map((_, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {editors.map((content, index) => (
              <TabsContent key={index} value={index.toString()}>
                <RichTextEditor
                  value={content}
                  onChange={(value) => {
                    const newEditors = [...editors];
                    newEditors[index] = value;
                    setEditors(newEditors);
                  }}
                  placeholder={`Editor ${index + 1}`}
                  enableMarkdown
                  enableToolbar
                  minHeight={300}
                />
              </TabsContent>
            ))}
          </Tabs>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total characters: {editors.reduce((acc, e) => acc + e.length, 0)}
            </span>
            <span className="text-sm text-muted-foreground">
              Active editor: {parseInt(activeTab) + 1}
            </span>
          </div>
        </Card>
      </div>
    );
  },
};