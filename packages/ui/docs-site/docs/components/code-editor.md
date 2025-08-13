---
id: code-editor
title: Code Editor Component
sidebar_position: 56
---

import { CodeEditor } from '@dainabase/ui';

# Code Editor

A powerful code editing component with syntax highlighting, auto-completion, themes, and advanced editing features. Built for developers who need a robust code editing experience in their applications.

## Preview

```jsx live
function CodeEditorDemo() {
  const [code, setCode] = useState(`function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: \`Welcome, \${name}!\` };
}

greet('World');`);

  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="javascript"
      height="200px"
      theme="vs-dark"
    />
  );
}
```

## Features

- 🎨 **Syntax Highlighting** - Support for 100+ languages
- 🎯 **IntelliSense** - Auto-completion and suggestions
- 🌈 **Multiple Themes** - Light, dark, and custom themes
- ⚡ **High Performance** - Virtual scrolling for large files
- 🔍 **Find & Replace** - Advanced search capabilities
- 📝 **Multi-cursor** - Edit multiple locations simultaneously
- 🎭 **Code Folding** - Collapse and expand code blocks
- 📏 **Line Numbers** - With breakpoint support
- 🔄 **Diff View** - Compare code changes side-by-side
- ♿ **Accessible** - Keyboard navigation and screen reader support

## Installation

```bash
npm install @dainabase/ui monaco-editor
```

## Basic Usage

```jsx
import { CodeEditor } from '@dainabase/ui';

function MyComponent() {
  const [code, setCode] = useState('// Write your code here');
  
  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="javascript"
      height="400px"
    />
  );
}
```

## Examples

### 1. Different Languages

```jsx live
function LanguagesExample() {
  const [language, setLanguage] = useState('javascript');
  
  const examples = {
    javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
    python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
    typescript: `// TypeScript Example
interface User {
  id: number;
  name: string;
  email?: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}`,
    html: `<!-- HTML Example -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Page</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a sample HTML page.</p>
</body>
</html>`,
    css: `/* CSS Example */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}`,
    sql: `-- SQL Example
SELECT 
  u.id,
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY total_spent DESC
LIMIT 10;`
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Object.keys(examples).map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 rounded ${
              language === lang 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      <CodeEditor
        value={examples[language]}
        language={language}
        height="300px"
        theme="vs-dark"
        readOnly
      />
    </div>
  );
}
```

### 2. Theme Selection

```jsx live
function ThemeExample() {
  const [theme, setTheme] = useState('vs-light');
  const [code] = useState(`// Theme Example
const themes = {
  light: 'vs-light',
  dark: 'vs-dark',
  highContrast: 'hc-black',
  github: 'github',
  monokai: 'monokai'
};

function applyTheme(themeName) {
  const selectedTheme = themes[themeName];
  editor.setTheme(selectedTheme);
  console.log(\`Applied theme: \${themeName}\`);
}`);
  
  const themes = [
    { value: 'vs-light', label: 'Light' },
    { value: 'vs-dark', label: 'Dark' },
    { value: 'hc-black', label: 'High Contrast' },
    { value: 'github', label: 'GitHub' },
    { value: 'monokai', label: 'Monokai' }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {themes.map(t => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`px-3 py-1 rounded ${
              theme === t.value 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeEditor
        value={code}
        language="javascript"
        height="250px"
        theme={theme}
        readOnly
      />
    </div>
  );
}
```

### 3. Live Preview

```jsx live
function LivePreviewExample() {
  const [html, setHtml] = useState(`<div class="container">
  <h1>Live Preview</h1>
  <p>Edit the HTML and see changes instantly!</p>
  <button onclick="alert('Hello!')">Click Me</button>
</div>`);
  
  const [css, setCss] = useState(`.container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 10px;
}

h1 {
  margin: 0 0 10px 0;
}

button {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}`);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="font-medium">HTML</h3>
        <CodeEditor
          value={html}
          onChange={setHtml}
          language="html"
          height="150px"
          theme="vs-dark"
          minimap={false}
        />
        <h3 className="font-medium">CSS</h3>
        <CodeEditor
          value={css}
          onChange={setCss}
          language="css"
          height="150px"
          theme="vs-dark"
          minimap={false}
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Preview</h3>
        <div className="border border-gray-300 rounded p-4 h-[320px] overflow-auto">
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
```

### 4. Code Diff Viewer

```jsx live
function DiffViewerExample() {
  const original = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

  const modified = `function calculateTotal(items) {
  // Using reduce for better readability
  return items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);
}`;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Code Comparison</h3>
        <div className="flex gap-2 text-sm">
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded">- Original</span>
          <span className="px-2 py-1 bg-green-100 text-green-600 rounded">+ Modified</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <CodeEditor
          value={original}
          language="javascript"
          height="200px"
          theme="vs-light"
          readOnly
          options={{
            lineNumbers: 'on',
            glyphMargin: true,
            folding: false
          }}
        />
        <CodeEditor
          value={modified}
          language="javascript"
          height="200px"
          theme="vs-light"
          readOnly
          options={{
            lineNumbers: 'on',
            glyphMargin: true,
            folding: false
          }}
        />
      </div>
    </div>
  );
}
```

### 5. Collaborative Editing

```jsx live
function CollaborativeExample() {
  const [code, setCode] = useState(`// Collaborative Editing Demo
// Multiple users can edit simultaneously

function collaborate() {
  // User 1 cursor here
  const message = "Hello from User 1";
  
  // User 2 cursor here
  const response = "Hello from User 2";
  
  return { message, response };
}`);
  
  const [users] = useState([
    { id: 1, name: 'Alice', color: '#3B82F6', line: 4, column: 20 },
    { id: 2, name: 'Bob', color: '#10B981', line: 7, column: 20 }
  ]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Live Collaboration</h3>
        <div className="flex gap-2">
          {users.map(user => (
            <div key={user.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
      <CodeEditor
        value={code}
        onChange={setCode}
        language="javascript"
        height="250px"
        theme="vs-dark"
        options={{
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false
        }}
      />
    </div>
  );
}
```

### 6. JSON Editor with Validation

```jsx live
function JsonEditorExample() {
  const [json, setJson] = useState(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "gaming"]
}`);
  
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  
  const handleChange = (value) => {
    setJson(value);
    try {
      JSON.parse(value);
      setIsValid(true);
      setError('');
    } catch (e) {
      setIsValid(false);
      setError(e.message);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">JSON Editor</h3>
        <div className={`px-3 py-1 rounded text-sm ${
          isValid 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
        </div>
      </div>
      <CodeEditor
        value={json}
        onChange={handleChange}
        language="json"
        height="300px"
        theme="vs-dark"
        options={{
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true
        }}
      />
      {error && (
        <div className="p-2 bg-red-50 text-red-600 text-sm rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

### 7. Markdown Editor with Preview

```jsx live
function MarkdownEditorExample() {
  const [markdown, setMarkdown] = useState(`# Markdown Editor

This is a **markdown** editor with *live preview*.

## Features
- Syntax highlighting
- Live preview
- GitHub flavored markdown

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote

[Link to GitHub](https://github.com)`);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="font-medium">Markdown</h3>
        <CodeEditor
          value={markdown}
          onChange={setMarkdown}
          language="markdown"
          height="350px"
          theme="vs-dark"
          options={{
            wordWrap: 'on',
            minimap: { enabled: false }
          }}
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Preview</h3>
        <div className="prose prose-sm max-w-none p-4 border border-gray-300 rounded h-[350px] overflow-auto bg-white">
          <div dangerouslySetInnerHTML={{ 
            __html: markdown
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
              .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
              .replace(/\n/g, '<br>')
          }} />
        </div>
      </div>
    </div>
  );
}
```

### 8. Code Snippets Manager

```jsx live
function SnippetsManagerExample() {
  const [selectedSnippet, setSelectedSnippet] = useState('react-component');
  
  const snippets = {
    'react-component': {
      name: 'React Component',
      language: 'javascript',
      code: `import React from 'react';

const MyComponent = ({ title, children }) => {
  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default MyComponent;`
    },
    'express-server': {
      name: 'Express Server',
      language: 'javascript',
      code: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
    },
    'api-fetch': {
      name: 'API Fetch',
      language: 'javascript',
      code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}`
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Object.entries(snippets).map(([key, snippet]) => (
          <button
            key={key}
            onClick={() => setSelectedSnippet(key)}
            className={`px-3 py-1 rounded text-sm ${
              selectedSnippet === key 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {snippet.name}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Language: {snippets[selectedSnippet].language}
          </span>
          <button 
            onClick={() => navigator.clipboard.writeText(snippets[selectedSnippet].code)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Copy Code
          </button>
        </div>
        <CodeEditor
          value={snippets[selectedSnippet].code}
          language={snippets[selectedSnippet].language}
          height="250px"
          theme="vs-dark"
          readOnly
        />
      </div>
    </div>
  );
}
```

### 9. Multi-File Editor

```jsx live
function MultiFileEditorExample() {
  const [activeFile, setActiveFile] = useState('index.js');
  const [files, setFiles] = useState({
    'index.js': {
      language: 'javascript',
      content: `import React from 'react';
import App from './App';
import './styles.css';

ReactDOM.render(<App />, document.getElementById('root'));`
    },
    'App.js': {
      language: 'javascript',
      content: `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello World</h1>
    </div>
  );
}

export default App;`
    },
    'styles.css': {
      language: 'css',
      content: `.app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f0f0;
}

h1 {
  color: #333;
  font-size: 2rem;
}`
    },
    'package.json': {
      language: 'json',
      content: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`
    }
  });
  
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex bg-gray-100 border-b border-gray-300">
        {Object.keys(files).map(filename => (
          <button
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`px-4 py-2 text-sm border-r border-gray-300 ${
              activeFile === filename 
                ? 'bg-white' 
                : 'hover:bg-gray-50'
            }`}
          >
            {filename}
          </button>
        ))}
      </div>
      <CodeEditor
        value={files[activeFile].content}
        onChange={(value) => setFiles({
          ...files,
          [activeFile]: { ...files[activeFile], content: value }
        })}
        language={files[activeFile].language}
        height="300px"
        theme="vs-light"
        options={{
          minimap: { enabled: false }
        }}
      />
    </div>
  );
}
```

### 10. Terminal Output Viewer

```jsx live
function TerminalOutputExample() {
  const [command, setCommand] = useState('npm run build');
  const [output] = useState(`$ npm run build

> my-app@1.0.0 build
> webpack --mode production

ℹ ｢wds｣: Project is running at http://localhost:3000/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from ./public

✔ Compiled successfully
✔ Build completed in 12.3s

Hash: a1b2c3d4e5f6
Version: webpack 5.74.0
Time: 12345ms
Built at: 08/13/2025 10:30:00 AM
        Asset       Size  Chunks             Chunk Names
    bundle.js    1.2 MiB       0  [emitted]  main
   styles.css    42 KiB       0  [emitted]  main
   index.html    2.3 KiB          [emitted]  

✨ Build successful!`);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded"
          placeholder="Enter command..."
        />
        <button className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          Run
        </button>
      </div>
      <CodeEditor
        value={output}
        language="shell"
        height="300px"
        theme="vs-dark"
        readOnly
        options={{
          lineNumbers: 'off',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none'
        }}
      />
    </div>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The code content |
| `onChange` | `function` | `undefined` | Callback when code changes |
| `language` | `string` | `'javascript'` | Programming language for syntax highlighting |
| `theme` | `string` | `'vs-light'` | Editor theme |
| `height` | `string \| number` | `'400px'` | Height of the editor |
| `width` | `string \| number` | `'100%'` | Width of the editor |
| `options` | `object` | `{}` | Monaco editor options |
| `readOnly` | `boolean` | `false` | Make editor read-only |
| `loading` | `ReactNode` | `'Loading...'` | Loading component |
| `onMount` | `function` | `undefined` | Callback when editor mounts |
| `beforeMount` | `function` | `undefined` | Callback before editor mounts |
| `onValidate` | `function` | `undefined` | Callback for validation markers |
| `minimap` | `boolean \| object` | `true` | Minimap configuration |
| `lineNumbers` | `'on' \| 'off' \| 'relative'` | `'on'` | Line numbers display |
| `wordWrap` | `'on' \| 'off' \| 'wordWrapColumn'` | `'off'` | Word wrap behavior |
| `fontSize` | `number` | `14` | Font size in pixels |
| `tabSize` | `number` | `2` | Tab size |
| `autoClosingBrackets` | `boolean` | `true` | Auto close brackets |
| `formatOnPaste` | `boolean` | `false` | Format on paste |
| `formatOnType` | `boolean` | `false` | Format while typing |

### Methods

Methods available through ref:

| Method | Description |
|--------|-------------|
| `getValue()` | Get current code value |
| `setValue(value)` | Set code value |
| `getEditor()` | Get Monaco editor instance |
| `focus()` | Focus the editor |
| `formatDocument()` | Format the entire document |
| `undo()` | Undo last change |
| `redo()` | Redo last undone change |
| `findNext()` | Find next occurrence |
| `findPrevious()` | Find previous occurrence |
| `revealLine(line)` | Scroll to specific line |

### Language Support

Supported languages include:
- JavaScript, TypeScript, JSX, TSX
- Python, Java, C++, C#, Go, Rust
- HTML, CSS, SCSS, Less
- JSON, XML, YAML, TOML
- SQL, GraphQL
- Markdown, Shell, PowerShell
- And many more...

## Accessibility

The Code Editor component follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support for editing
- **Screen Readers**: Compatible with screen readers
- **High Contrast**: Support for high contrast themes
- **Focus Management**: Proper focus indicators
- **ARIA Labels**: Descriptive labels for controls

### Keyboard Shortcuts

| Shortcut | Description |
|----------|-------------|
| `Ctrl/Cmd + S` | Save (triggers onChange) |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + F` | Find |
| `Ctrl/Cmd + H` | Replace |
| `Ctrl/Cmd + /` | Toggle comment |
| `Alt + Up/Down` | Move line up/down |
| `Ctrl/Cmd + D` | Duplicate selection |
| `F1` | Command palette |

## Best Practices

### ✅ Do's

- Choose appropriate language for syntax highlighting
- Provide proper height for the editor
- Use themes that match your app design
- Implement auto-save for important content
- Add validation for structured formats (JSON, XML)
- Use read-only mode for code examples
- Provide keyboard shortcuts documentation
- Optimize for the target file sizes

### ❌ Don'ts

- Don't use for simple text input (use textarea)
- Don't load extremely large files without virtualization
- Don't ignore accessibility requirements
- Don't forget to handle errors gracefully
- Don't use without proper font loading
- Don't mix tabs and spaces inconsistently
- Don't enable all features unnecessarily

## Use Cases

1. **Code Playgrounds** - Interactive coding environments
2. **Configuration Editors** - JSON/YAML configuration
3. **Documentation** - Code examples and tutorials
4. **IDEs** - Integrated development environments
5. **Code Reviews** - Diff viewers and commenting
6. **Learning Platforms** - Educational coding interfaces
7. **API Testing** - Request/response editors
8. **Database Clients** - SQL query editors
9. **Content Management** - Markdown/HTML editors
10. **DevTools** - Debugging and inspection tools

## Performance Considerations

- Use virtual scrolling for large files
- Lazy load language definitions
- Debounce onChange callbacks
- Implement code splitting for Monaco
- Use web workers for syntax highlighting
- Cache parsed results
- Optimize bundle size with dynamic imports

## Related Components

- [Textarea](./textarea) - Simple text input
- [Rich Text Editor](./rich-text-editor) - WYSIWYG editing
- [Markdown Editor](./markdown-editor) - Markdown specific editor
- [Terminal](./terminal) - Terminal emulator
- [Diff Viewer](./diff-viewer) - Code comparison
