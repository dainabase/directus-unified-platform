---
id: rich-text-editor
title: Rich Text Editor Component
sidebar_position: 57
---

import { RichTextEditor } from '@dainabase/ui';

# Rich Text Editor

A comprehensive WYSIWYG (What You See Is What You Get) text editor component with advanced formatting options, media embedding, and extensible functionality. Perfect for content management systems, blog platforms, and any application requiring rich text editing.

## Preview

```jsx live
function RichTextEditorDemo() {
  const [content, setContent] = useState(`
    <h2>Welcome to the Rich Text Editor</h2>
    <p>This is a <strong>powerful</strong> and <em>flexible</em> editor with many features.</p>
    <ul>
      <li>Format text with ease</li>
      <li>Insert images and media</li>
      <li>Create tables and lists</li>
    </ul>
  `);

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
      height="300px"
    />
  );
}
```

## Features

- 📝 **Rich Formatting** - Bold, italic, underline, strikethrough, and more
- 🎨 **Text Styling** - Colors, backgrounds, fonts, and sizes
- 📋 **Lists & Tables** - Ordered, unordered lists and complex tables
- 🖼️ **Media Embedding** - Images, videos, and embeds
- 🔗 **Link Management** - Smart link detection and editing
- 📏 **Block Formatting** - Headings, quotes, code blocks
- ↩️ **Undo/Redo** - Full history management
- 🎯 **Mentions** - @mentions with autocomplete
- 📊 **Markdown Support** - Import/export markdown
- 🔌 **Extensible** - Plugin system for custom functionality

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { RichTextEditor } from '@dainabase/ui';

function MyComponent() {
  const [content, setContent] = useState('');
  
  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Write something amazing..."
    />
  );
}
```

## Examples

### 1. Full-Featured Editor

```jsx live
function FullFeaturedExample() {
  const [content, setContent] = useState(`
    <h1>Full-Featured Rich Text Editor</h1>
    <p>This editor includes all available features and formatting options.</p>
    <h2>Text Formatting</h2>
    <p><strong>Bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <s>strikethrough</s>.</p>
    <h2>Lists</h2>
    <ul>
      <li>Unordered list item 1</li>
      <li>Unordered list item 2</li>
    </ul>
    <ol>
      <li>Ordered list item 1</li>
      <li>Ordered list item 2</li>
    </ol>
    <blockquote>This is a blockquote with important information.</blockquote>
  `);
  
  return (
    <div className="space-y-4">
      <RichTextEditor
        value={content}
        onChange={setContent}
        height="400px"
        toolbar={{
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          heading: true,
          quote: true,
          orderedList: true,
          unorderedList: true,
          link: true,
          image: true,
          table: true,
          code: true,
          clear: true,
          undo: true,
          redo: true
        }}
      />
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="text-sm font-medium mb-2">HTML Output:</h3>
        <pre className="text-xs overflow-x-auto">{content}</pre>
      </div>
    </div>
  );
}
```

### 2. Minimal Editor

```jsx live
function MinimalEditorExample() {
  const [content, setContent] = useState('Start typing here...');
  
  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      height="200px"
      minimal
      toolbar={{
        bold: true,
        italic: true,
        link: true
      }}
      placeholder="Write a simple message..."
    />
  );
}
```

### 3. Blog Post Editor

```jsx live
function BlogPostEditorExample() {
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: []
  });
  
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Post Title"
        value={post.title}
        onChange={(e) => setPost({...post, title: e.target.value})}
        className="w-full px-4 py-2 text-2xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none"
      />
      
      <textarea
        placeholder="Brief excerpt..."
        value={post.excerpt}
        onChange={(e) => setPost({...post, excerpt: e.target.value})}
        className="w-full px-4 py-2 border border-gray-200 rounded resize-none"
        rows={2}
      />
      
      <RichTextEditor
        value={post.content}
        onChange={(content) => setPost({...post, content})}
        height="400px"
        placeholder="Write your blog post..."
        toolbar={{
          heading: { levels: [1, 2, 3] },
          bold: true,
          italic: true,
          quote: true,
          orderedList: true,
          unorderedList: true,
          link: true,
          image: true,
          code: true,
          divider: true
        }}
      />
      
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Save Draft
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Publish
        </button>
      </div>
    </div>
  );
}
```

### 4. Comment Editor with Mentions

```jsx live
function CommentEditorExample() {
  const [comment, setComment] = useState('');
  const [mentions] = useState([
    { id: 1, name: 'Alice Johnson', username: 'alice' },
    { id: 2, name: 'Bob Smith', username: 'bob' },
    { id: 3, name: 'Carol Williams', username: 'carol' }
  ]);
  
  const handleMention = (searchTerm) => {
    return mentions.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <RichTextEditor
            value={comment}
            onChange={setComment}
            height="150px"
            placeholder="Write a comment... Use @ to mention someone"
            minimal
            mentions={{
              trigger: '@',
              data: handleMention,
              renderItem: (user) => (
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </div>
                </div>
              )
            }}
            toolbar={{
              bold: true,
              italic: true,
              link: true,
              emoji: true
            }}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              Cancel
            </button>
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Email Composer

```jsx live
function EmailComposerExample() {
  const [email, setEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });
  
  const templates = [
    { name: 'Welcome', content: '<h2>Welcome!</h2><p>Thank you for joining us...</p>' },
    { name: 'Newsletter', content: '<h2>Monthly Newsletter</h2><p>Here are the latest updates...</p>' },
    { name: 'Follow-up', content: '<p>Hi there,</p><p>I wanted to follow up on...</p>' }
  ];
  
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-300 space-y-2">
        <input
          type="email"
          placeholder="To:"
          value={email.to}
          onChange={(e) => setEmail({...email, to: e.target.value})}
          className="w-full px-3 py-1 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Subject:"
          value={email.subject}
          onChange={(e) => setEmail({...email, subject: e.target.value})}
          className="w-full px-3 py-1 border border-gray-300 rounded"
        />
      </div>
      
      <div className="p-4">
        <div className="mb-2 flex gap-2">
          {templates.map(template => (
            <button
              key={template.name}
              onClick={() => setEmail({...email, body: template.content})}
              className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              {template.name}
            </button>
          ))}
        </div>
        
        <RichTextEditor
          value={email.body}
          onChange={(body) => setEmail({...email, body})}
          height="300px"
          placeholder="Compose your email..."
          toolbar={{
            bold: true,
            italic: true,
            underline: true,
            orderedList: true,
            unorderedList: true,
            link: true,
            image: true,
            attachment: true,
            signature: true
          }}
        />
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-300 flex justify-between">
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Save Draft
          </button>
          <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Attach File
          </button>
        </div>
        <button className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send Email
        </button>
      </div>
    </div>
  );
}
```

### 6. Markdown Editor Mode

```jsx live
function MarkdownModeExample() {
  const [content, setContent] = useState('# Markdown Support\n\nType **markdown** and see it converted to *rich text* automatically!\n\n- List item 1\n- List item 2\n\n> Blockquote\n\n`inline code`');
  const [mode, setMode] = useState('rich');
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('rich')}
          className={`px-3 py-1 rounded ${
            mode === 'rich' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Rich Text
        </button>
        <button
          onClick={() => setMode('markdown')}
          className={`px-3 py-1 rounded ${
            mode === 'markdown' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Markdown
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`px-3 py-1 rounded ${
            mode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Preview
        </button>
      </div>
      
      <RichTextEditor
        value={content}
        onChange={setContent}
        height="300px"
        mode={mode}
        markdown={true}
        placeholder="Write in markdown or rich text..."
      />
    </div>
  );
}
```

### 7. Collaborative Editor

```jsx live
function CollaborativeEditorExample() {
  const [content, setContent] = useState('<p>Multiple users can edit this document simultaneously...</p>');
  const [activeUsers] = useState([
    { id: 1, name: 'You', color: '#3B82F6', cursor: { line: 1, char: 10 } },
    { id: 2, name: 'Alice', color: '#10B981', cursor: { line: 1, char: 25 } },
    { id: 3, name: 'Bob', color: '#F59E0B', cursor: { line: 2, char: 5 } }
  ]);
  const [activity, setActivity] = useState([]);
  
  const handleChange = (newContent) => {
    setContent(newContent);
    setActivity(prev => [...prev, {
      user: 'You',
      action: 'edited',
      time: new Date().toLocaleTimeString()
    }].slice(-5));
  };
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 border-b border-gray-300 flex items-center justify-between">
            <span className="text-sm font-medium">Collaborative Document</span>
            <div className="flex gap-2">
              {activeUsers.map(user => (
                <div key={user.id} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-xs">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
          <RichTextEditor
            value={content}
            onChange={handleChange}
            height="350px"
            collaboration={{
              enabled: true,
              users: activeUsers,
              showCursors: true,
              showSelections: true
            }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Activity</h3>
        <div className="space-y-1">
          {activity.map((item, i) => (
            <div key={i} className="text-sm text-gray-600">
              <span className="font-medium">{item.user}</span> {item.action}
              <span className="text-xs text-gray-400 ml-1">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 8. Form Builder

```jsx live
function FormBuilderExample() {
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState([]);
  
  const addField = (type) => {
    setFields([...fields, {
      id: Date.now(),
      type,
      label: `${type} Field`,
      required: false
    }]);
  };
  
  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4">
        <h3 className="font-medium mb-2">Form Description</h3>
        <RichTextEditor
          value={formDescription}
          onChange={setFormDescription}
          height="150px"
          placeholder="Describe your form..."
          minimal
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => addField('Text')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          + Text Field
        </button>
        <button
          onClick={() => addField('Email')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          + Email Field
        </button>
        <button
          onClick={() => addField('Select')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          + Dropdown
        </button>
      </div>
      
      <div className="space-y-2">
        {fields.map(field => (
          <div key={field.id} className="p-3 border border-gray-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={field.label}
                onChange={(e) => {
                  setFields(fields.map(f => 
                    f.id === field.id ? {...f, label: e.target.value} : f
                  ));
                }}
                className="font-medium bg-transparent"
              />
              <button
                onClick={() => setFields(fields.filter(f => f.id !== field.id))}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <input
              type={field.type.toLowerCase()}
              placeholder={`Enter ${field.type.toLowerCase()}...`}
              className="w-full px-3 py-1 border border-gray-300 rounded"
              disabled
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9. Documentation Editor

```jsx live
function DocumentationEditorExample() {
  const [doc, setDoc] = useState(`
    <h1>API Documentation</h1>
    <p>Welcome to our API documentation. This guide will help you get started.</p>
    <h2>Authentication</h2>
    <p>All API requests require authentication using an API key.</p>
    <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
    <h2>Endpoints</h2>
    <h3>GET /api/users</h3>
    <p>Retrieve a list of users.</p>
    <table>
      <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
      <tr><td>limit</td><td>integer</td><td>Number of results</td></tr>
      <tr><td>offset</td><td>integer</td><td>Skip results</td></tr>
    </table>
  `);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Documentation Editor</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Insert Code Block
          </button>
          <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Insert Table
          </button>
          <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Insert Warning
          </button>
        </div>
      </div>
      
      <RichTextEditor
        value={doc}
        onChange={setDoc}
        height="400px"
        toolbar={{
          heading: { levels: [1, 2, 3, 4] },
          bold: true,
          italic: true,
          code: true,
          codeBlock: true,
          quote: true,
          orderedList: true,
          unorderedList: true,
          table: true,
          link: true,
          divider: true
        }}
        codeBlock={{
          languages: ['javascript', 'python', 'bash', 'json', 'sql']
        }}
      />
    </div>
  );
}
```

### 10. Note Taking App

```jsx live
function NoteAppExample() {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Meeting Notes', content: '<p>Discuss project timeline...</p>', date: '2024-08-13' },
    { id: 2, title: 'Ideas', content: '<p>New feature concepts...</p>', date: '2024-08-12' }
  ]);
  const [selectedNote, setSelectedNote] = useState(notes[0]);
  
  const updateNote = (content) => {
    setNotes(notes.map(note => 
      note.id === selectedNote.id ? {...note, content} : note
    ));
    setSelectedNote({...selectedNote, content});
  };
  
  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '<p>Start writing...</p>',
      date: new Date().toISOString().split('T')[0]
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
  };
  
  return (
    <div className="grid grid-cols-4 gap-4 h-[500px]">
      <div className="col-span-1 border-r border-gray-300 pr-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Notes</h3>
          <button
            onClick={addNote}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + New
          </button>
        </div>
        <div className="space-y-2">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-2 rounded cursor-pointer ${
                selectedNote.id === note.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{note.title}</div>
              <div className="text-xs text-gray-500">{note.date}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="col-span-3">
        <input
          type="text"
          value={selectedNote.title}
          onChange={(e) => {
            const updatedNote = {...selectedNote, title: e.target.value};
            setSelectedNote(updatedNote);
            setNotes(notes.map(note => 
              note.id === selectedNote.id ? updatedNote : note
            ));
          }}
          className="w-full mb-4 text-xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none"
        />
        <RichTextEditor
          value={selectedNote.content}
          onChange={updateNote}
          height="400px"
          placeholder="Write your note..."
          autosave={{
            enabled: true,
            delay: 1000,
            onSave: (content) => console.log('Auto-saved:', content)
          }}
        />
      </div>
    </div>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | HTML content of the editor |
| `onChange` | `function` | `undefined` | Callback when content changes |
| `placeholder` | `string` | `''` | Placeholder text |
| `height` | `string \| number` | `'400px'` | Height of the editor |
| `width` | `string \| number` | `'100%'` | Width of the editor |
| `toolbar` | `object \| boolean` | `true` | Toolbar configuration |
| `readOnly` | `boolean` | `false` | Make editor read-only |
| `minimal` | `boolean` | `false` | Minimal UI mode |
| `mode` | `'rich' \| 'markdown' \| 'preview'` | `'rich'` | Editor mode |
| `markdown` | `boolean` | `false` | Enable markdown support |
| `mentions` | `object` | `undefined` | Mentions configuration |
| `collaboration` | `object` | `undefined` | Collaboration settings |
| `autosave` | `object` | `undefined` | Autosave configuration |
| `maxLength` | `number` | `undefined` | Maximum content length |
| `onFocus` | `function` | `undefined` | Focus event handler |
| `onBlur` | `function` | `undefined` | Blur event handler |
| `onReady` | `function` | `undefined` | Editor ready callback |

### Toolbar Options

| Option | Type | Description |
|--------|------|-------------|
| `bold` | `boolean` | Bold text |
| `italic` | `boolean` | Italic text |
| `underline` | `boolean` | Underline text |
| `strikethrough` | `boolean` | Strikethrough text |
| `heading` | `boolean \| object` | Heading levels |
| `quote` | `boolean` | Blockquote |
| `orderedList` | `boolean` | Numbered list |
| `unorderedList` | `boolean` | Bullet list |
| `link` | `boolean` | Insert/edit links |
| `image` | `boolean` | Insert images |
| `table` | `boolean` | Insert tables |
| `code` | `boolean` | Inline code |
| `codeBlock` | `boolean` | Code blocks |
| `divider` | `boolean` | Horizontal line |
| `undo` | `boolean` | Undo action |
| `redo` | `boolean` | Redo action |
| `clear` | `boolean` | Clear formatting |

### Methods

Available through ref:

| Method | Description |
|--------|-------------|
| `getHTML()` | Get HTML content |
| `getText()` | Get plain text content |
| `getMarkdown()` | Get markdown content |
| `setContent(html)` | Set HTML content |
| `clear()` | Clear all content |
| `focus()` | Focus the editor |
| `blur()` | Blur the editor |
| `insertText(text)` | Insert text at cursor |
| `insertHTML(html)` | Insert HTML at cursor |
| `format(type, value)` | Apply formatting |

## Accessibility

The Rich Text Editor follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and live regions
- **Focus Management**: Proper focus indicators
- **Semantic HTML**: Uses semantic elements
- **Contrast**: Meets WCAG contrast requirements

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + Shift + 7` | Ordered list |
| `Ctrl/Cmd + Shift + 8` | Unordered list |
| `Tab` | Indent |
| `Shift + Tab` | Outdent |

## Best Practices

### ✅ Do's

- Sanitize HTML content before saving
- Provide clear placeholder text
- Include essential formatting options
- Save drafts automatically
- Support keyboard shortcuts
- Validate content length
- Provide undo/redo functionality
- Make toolbar customizable

### ❌ Don'ts

- Don't allow unrestricted HTML
- Don't auto-focus without user action
- Don't remove formatting without confirmation
- Don't ignore accessibility
- Don't make toolbar too complex
- Don't forget mobile optimization
- Don't allow XSS vulnerabilities

## Use Cases

1. **Blog Platforms** - Article and post creation
2. **CMS Systems** - Content management
3. **Email Clients** - Email composition
4. **Forums** - Rich text discussions
5. **Documentation** - Technical documentation
6. **Note Taking** - Personal notes and journals
7. **Collaboration** - Team document editing
8. **Comments** - Rich text commenting
9. **Forms** - Complex form descriptions
10. **Knowledge Bases** - FAQ and help content

## Performance Considerations

- Lazy load toolbar components
- Debounce onChange events
- Virtualize long documents
- Optimize image uploads
- Cache formatting operations
- Use web workers for parsing

## Related Components

- [Textarea](./textarea) - Simple text input
- [Code Editor](./code-editor) - Code editing
- [Markdown Editor](./markdown-editor) - Markdown specific
- [Form](./form) - Form components
- [Mentions](./mentions) - Mention system
