import type { Meta, StoryObj } from '@storybook/react';
import { CodeEditor } from './code-editor';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Alert, AlertDescription } from './alert';
import { 
  Code2, 
  FileCode, 
  Terminal, 
  GitBranch,
  Zap,
  BookOpen,
  Palette,
  Bug,
  PlayCircle,
  Save,
  Copy,
  FileText,
  Database,
  Globe,
  Cpu
} from 'lucide-react';

const meta = {
  title: 'Advanced/CodeEditor',
  component: CodeEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Advanced code editor with syntax highlighting, auto-completion, and multi-language support.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'markdown', 'sql', 'yaml', 'xml'],
      description: 'Programming language for syntax highlighting'
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark', 'monokai', 'github', 'dracula', 'auto'],
      description: 'Editor color theme'
    },
    fontSize: {
      control: { type: 'number', min: 10, max: 24, step: 1 },
      description: 'Font size in pixels'
    },
    tabSize: {
      control: { type: 'number', min: 2, max: 8, step: 2 },
      description: 'Number of spaces for tab'
    },
    lineNumbers: {
      control: 'boolean',
      description: 'Show line numbers'
    },
    wordWrap: {
      control: 'boolean',
      description: 'Enable word wrapping'
    },
    minimap: {
      control: 'boolean',
      description: 'Show code minimap'
    },
    readOnly: {
      control: 'boolean',
      description: 'Make editor read-only'
    }
  }
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default JavaScript Editor
export const Default: Story = {
  args: {
    language: 'javascript',
    theme: 'dark',
    defaultValue: `// Welcome to the Code Editor
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log('Fibonacci of 10:', fibonacci(10));

// Arrow function example
const greet = (name) => {
  return \`Hello, \${name}! Welcome to the code editor.\`;
};

console.log(greet('Developer'));`,
    lineNumbers: true,
    minimap: true,
    fontSize: 14
  },
  render: (args) => (
    <div className="w-[900px] h-[600px]">
      <CodeEditor {...args} />
    </div>
  )
};

// React Component Editor
export const ReactComponent: Story = {
  args: {
    language: 'typescript',
    theme: 'github',
    defaultValue: `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Load todos from localStorage
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={addTodo}>Add</Button>
          </div>
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className={\`cursor-pointer \${todo.completed ? 'line-through' : ''}\`}
              >
                {todo.text}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};`,
    lineNumbers: true,
    minimap: true,
    autoComplete: true,
    enableSnippets: true
  },
  render: (args) => (
    <div className="w-[1000px] h-[700px]">
      <CodeEditor {...args} />
    </div>
  )
};

// Python Data Science
export const PythonDataScience: Story = {
  args: {
    language: 'python',
    theme: 'monokai',
    defaultValue: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Generate synthetic data
np.random.seed(42)
n_samples = 100
X = np.random.randn(n_samples, 1) * 10
y = 2.5 * X.squeeze() + np.random.randn(n_samples) * 5 + 10

# Create DataFrame
df = pd.DataFrame({
    'feature': X.squeeze(),
    'target': y
})

print("Dataset Info:")
print(df.describe())
print("\\nCorrelation:", df.corr())

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\\nModel Performance:")
print(f"Mean Squared Error: {mse:.2f}")
print(f"R² Score: {r2:.2f}")
print(f"Coefficients: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")

# Visualization
plt.figure(figsize=(10, 6))
plt.scatter(X_test, y_test, color='blue', label='Actual', alpha=0.6)
plt.scatter(X_test, y_pred, color='red', label='Predicted', alpha=0.6)
plt.plot(X_test, y_pred, color='green', linewidth=2, label='Regression Line')
plt.xlabel('Feature')
plt.ylabel('Target')
plt.title('Linear Regression Results')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`,
    lineNumbers: true,
    minimap: true,
    fontSize: 13
  },
  render: (args) => (
    <div className="w-[900px] h-[700px] space-y-4">
      <Alert>
        <Cpu className="h-4 w-4" />
        <AlertDescription>
          Python editor with data science libraries and visualization support
        </AlertDescription>
      </Alert>
      <CodeEditor {...args} />
    </div>
  )
};

// SQL Query Editor
export const SQLQueryEditor: Story = {
  args: {
    language: 'sql',
    theme: 'light',
    defaultValue: `-- Customer Analytics Query
WITH customer_metrics AS (
  SELECT 
    c.customer_id,
    c.customer_name,
    c.registration_date,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_spent,
    AVG(o.total_amount) AS avg_order_value,
    MAX(o.order_date) AS last_order_date,
    DATEDIFF(CURRENT_DATE, MAX(o.order_date)) AS days_since_last_order
  FROM customers c
  LEFT JOIN orders o ON c.customer_id = o.customer_id
  WHERE c.is_active = TRUE
  GROUP BY c.customer_id, c.customer_name, c.registration_date
),
customer_segments AS (
  SELECT 
    *,
    CASE
      WHEN total_spent > 10000 AND total_orders > 50 THEN 'VIP'
      WHEN total_spent > 5000 AND total_orders > 20 THEN 'Premium'
      WHEN total_spent > 1000 AND total_orders > 5 THEN 'Regular'
      ELSE 'New'
    END AS customer_segment,
    CASE
      WHEN days_since_last_order <= 30 THEN 'Active'
      WHEN days_since_last_order <= 90 THEN 'At Risk'
      WHEN days_since_last_order <= 180 THEN 'Dormant'
      ELSE 'Lost'
    END AS activity_status
  FROM customer_metrics
)
SELECT 
  customer_segment,
  activity_status,
  COUNT(*) AS customer_count,
  AVG(total_spent) AS avg_lifetime_value,
  AVG(total_orders) AS avg_orders,
  AVG(avg_order_value) AS avg_order_size
FROM customer_segments
GROUP BY customer_segment, activity_status
ORDER BY 
  FIELD(customer_segment, 'VIP', 'Premium', 'Regular', 'New'),
  FIELD(activity_status, 'Active', 'At Risk', 'Dormant', 'Lost');`,
    lineNumbers: true,
    minimap: false,
    fontSize: 14
  },
  render: (args) => (
    <div className="w-[900px] h-[600px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Query Editor
          </CardTitle>
          <CardDescription>
            Write and execute SQL queries with syntax highlighting
          </CardDescription>
        </CardHeader>
      </Card>
      <CodeEditor {...args} />
    </div>
  )
};

// HTML/CSS Live Preview
export const HTMLCSSEditor: Story = {
  render: () => {
    const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animated Card</title>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Welcome</h2>
                <span class="card-badge">New</span>
            </div>
            <div class="card-content">
                <p>This is a beautifully styled card component with animations.</p>
                <button class="btn btn-primary">Get Started</button>
            </div>
        </div>
    </div>
</body>
</html>`);
    
    const [cssCode, setCssCode] = useState(`* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    padding: 2rem;
}

.card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.card-title {
    color: #333;
    font-size: 1.5rem;
}

.card-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.card-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}`);
    
    return (
      <div className="w-[1200px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              HTML/CSS Live Editor
            </CardTitle>
            <CardDescription>
              Edit HTML and CSS with live preview
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">HTML</h3>
            <div className="h-[300px]">
              <CodeEditor
                language="html"
                theme="github"
                value={htmlCode}
                onChange={setHtmlCode}
                lineNumbers={true}
                minimap={false}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">CSS</h3>
            <div className="h-[300px]">
              <CodeEditor
                language="css"
                theme="github"
                value={cssCode}
                onChange={setCssCode}
                lineNumbers={true}
                minimap={false}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Preview</h3>
          <div className="border rounded-lg p-4 bg-white">
            <iframe
              srcDoc={`${htmlCode}<style>${cssCode}</style>`}
              className="w-full h-[300px] border-0"
              title="Preview"
            />
          </div>
        </div>
      </div>
    );
  }
};

// JSON Configuration Editor
export const JSONEditor: Story = {
  args: {
    language: 'json',
    theme: 'dark',
    defaultValue: `{
  "name": "directus-unified-platform",
  "version": "1.0.0",
  "description": "A comprehensive UI component library",
  "main": "dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "storybook": "storybook dev -p 6006"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/dainabase/directus-unified-platform"
  },
  "keywords": [
    "react",
    "components",
    "ui",
    "design-system",
    "typescript"
  ],
  "author": "dainabase",
  "license": "MIT"
}`,
    lineNumbers: true,
    minimap: false,
    syntaxValidation: true
  },
  render: (args) => (
    <div className="w-[800px] h-[600px] space-y-4">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          JSON editor with validation and formatting
        </AlertDescription>
      </Alert>
      <CodeEditor {...args} />
    </div>
  )
};

// Markdown Editor with Preview
export const MarkdownEditor: Story = {
  render: () => {
    const [markdown, setMarkdown] = useState(`# Welcome to the Markdown Editor

This is a **powerful** markdown editor with *live preview* support.

## Features

- 📝 Live preview
- 🎨 Syntax highlighting
- ⚡ Fast rendering
- 🔧 Customizable

### Code Blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

1. First item
2. Second item
   - Nested item
   - Another nested item
3. Third item

### Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Editor | ✅ Done | High |
| Preview | ✅ Done | High |
| Export | 🚧 WIP | Medium |

### Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

### Links and Images

[Visit GitHub](https://github.com)

![Placeholder](https://via.placeholder.com/150)

---

Made with ❤️ using React`);
    
    return (
      <div className="w-[1200px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Markdown Editor
            </CardTitle>
            <CardDescription>
              Write markdown with live preview
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Editor</h3>
            <div className="h-[500px]">
              <CodeEditor
                language="markdown"
                theme="github"
                value={markdown}
                onChange={setMarkdown}
                lineNumbers={false}
                wordWrap={true}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Preview</h3>
            <Card className="h-[500px] overflow-auto">
              <CardContent className="prose prose-sm max-w-none p-4">
                <div dangerouslySetInnerHTML={{ __html: markdown }} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
};

// YAML Configuration
export const YAMLEditor: Story = {
  args: {
    language: 'yaml',
    theme: 'monokai',
    defaultValue: `# Docker Compose Configuration
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: web-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    volumes:
      - ./src:/app/src
      - node_modules:/app/node_modules
    depends_on:
      - db
      - redis
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:
  node_modules:

networks:
  app-network:
    driver: bridge`,
    lineNumbers: true,
    minimap: false
  },
  render: (args) => (
    <div className="w-[800px] h-[600px]">
      <CodeEditor {...args} />
    </div>
  )
};

// Multi-file Project
export const MultiFileProject: Story = {
  render: () => {
    const [activeFile, setActiveFile] = useState('app.tsx');
    
    const files = {
      'app.tsx': `import React from 'react';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import './styles/app.css';

export const App: React.FC = () => {
  return (
    <div className="app">
      <Header title="My Todo App" />
      <main className="container">
        <TodoList />
      </main>
      <Footer />
    </div>
  );
};

export default App;`,
      'components/TodoList.tsx': `import React, { useState } from 'react';
import { TodoItem } from './TodoItem';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }]);
      setInput('');
    }
  };

  return (
    <div className="todo-list">
      <div className="todo-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
};`,
      'styles/app.css': `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
}

.todo-list {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-input button {
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}`,
      'package.json': `{
  "name": "todo-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
    };
    
    const getLanguage = (filename: string) => {
      if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
      if (filename.endsWith('.css')) return 'css';
      if (filename.endsWith('.json')) return 'json';
      return 'javascript';
    };
    
    return (
      <div className="w-[1000px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Multi-File Project Editor
            </CardTitle>
            <CardDescription>
              Work with multiple files in a project
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Tabs value={activeFile} onValueChange={setActiveFile}>
          <TabsList>
            {Object.keys(files).map(filename => (
              <TabsTrigger key={filename} value={filename}>
                <FileCode className="h-3 w-3 mr-1" />
                {filename}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(files).map(([filename, content]) => (
            <TabsContent key={filename} value={filename}>
              <div className="h-[500px]">
                <CodeEditor
                  language={getLanguage(filename)}
                  theme="dark"
                  defaultValue={content}
                  lineNumbers={true}
                  minimap={true}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }
};

// Live Collaboration (Mock)
export const LiveCollaboration: Story = {
  render: () => {
    const [code, setCode] = useState(`// Collaborative Editing Session
// 3 users currently editing

function calculateStatistics(data) {
  // Alice is editing here...
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  
  // Bob added this function
  const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  
  // Charlie is working on standard deviation
  const stdDev = Math.sqrt(
    data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length
  );
  
  return { mean, median: median(data), stdDev };
}`);
    
    const collaborators = [
      { name: 'Alice', color: '#FF6B6B', line: 5 },
      { name: 'Bob', color: '#4ECDC4', line: 8 },
      { name: 'Charlie', color: '#45B7D1', line: 15 }
    ];
    
    return (
      <div className="w-[900px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Collaboration
              </span>
              <div className="flex items-center gap-2">
                {collaborators.map(user => (
                  <Badge
                    key={user.name}
                    style={{ backgroundColor: user.color }}
                    className="text-white"
                  >
                    {user.name}
                  </Badge>
                ))}
              </div>
            </CardTitle>
            <CardDescription>
              Real-time collaborative editing with multiple users
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="h-[500px]">
          <CodeEditor
            language="javascript"
            theme="dark"
            value={code}
            onChange={setCode}
            lineNumbers={true}
            minimap={true}
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {collaborators.map(user => (
            <div key={user.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span>{user.name} editing line {user.line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

// Code Playground
export const CodePlayground: Story = {
  render: () => {
    const [code, setCode] = useState(`// JavaScript Playground
// Write your code and click Run to see the output

function isPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Find first 10 prime numbers
const primes = [];
let num = 2;
while (primes.length < 10) {
  if (isPrime(num)) {
    primes.push(num);
  }
  num++;
}

console.log('First 10 prime numbers:', primes);

// Fibonacci sequence
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
const fibSequence = Array.from({ length: 10 }, () => fib.next().value);
console.log('Fibonacci sequence:', fibSequence);`);
    
    const [output, setOutput] = useState<string[]>([]);
    
    const runCode = () => {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.join(' '));
      
      try {
        // WARNING: eval is dangerous, only for demo
        eval(code);
        setOutput(logs);
      } catch (error: any) {
        setOutput([`Error: ${error.message}`]);
      } finally {
        console.log = originalLog;
      }
    };
    
    return (
      <div className="w-[1000px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Code Playground
              </span>
              <Button onClick={runCode} size="sm">
                <PlayCircle className="h-4 w-4 mr-1" />
                Run Code
              </Button>
            </CardTitle>
            <CardDescription>
              Write and execute JavaScript code instantly
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Code</h3>
            <div className="h-[400px]">
              <CodeEditor
                language="javascript"
                theme="monokai"
                value={code}
                onChange={setCode}
                lineNumbers={true}
                minimap={false}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Output
            </h3>
            <Card className="h-[400px] overflow-auto bg-gray-900 text-green-400">
              <CardContent className="p-4 font-mono text-sm">
                {output.length === 0 ? (
                  <span className="text-gray-500">Click "Run Code" to see output...</span>
                ) : (
                  output.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
};

// Diff Viewer
export const DiffViewer: Story = {
  render: () => {
    const originalCode = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;
    
    const modifiedCode = `function calculateTotal(items) {
  // Using reduce for better readability
  return items.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);
}`;
    
    return (
      <div className="w-[1000px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Code Diff Viewer
            </CardTitle>
            <CardDescription>
              Compare code changes side by side
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-red-600">Original</h3>
            <div className="h-[300px]">
              <CodeEditor
                language="javascript"
                theme="github"
                defaultValue={originalCode}
                readOnly={true}
                lineNumbers={true}
                minimap={false}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-green-600">Modified</h3>
            <div className="h-[300px]">
              <CodeEditor
                language="javascript"
                theme="github"
                defaultValue={modifiedCode}
                readOnly={true}
                lineNumbers={true}
                minimap={false}
              />
            </div>
          </div>
        </div>
        
        <Alert>
          <GitBranch className="h-4 w-4" />
          <AlertDescription>
            <strong>Changes:</strong> Refactored to use reduce() method, added quantity support, improved readability
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

// Read-only Documentation
export const ReadOnlyDocumentation: Story = {
  args: {
    language: 'typescript',
    theme: 'github',
    readOnly: true,
    defaultValue: `/**
 * Advanced Code Editor Component
 * 
 * A feature-rich code editor with syntax highlighting,
 * auto-completion, and multi-language support.
 */

interface CodeEditorProps {
  /** The programming language for syntax highlighting */
  language?: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json';
  
  /** Editor color theme */
  theme?: 'light' | 'dark' | 'monokai' | 'github' | 'dracula';
  
  /** Initial code value */
  defaultValue?: string;
  
  /** Controlled value */
  value?: string;
  
  /** Change handler */
  onChange?: (value: string) => void;
  
  /** Make editor read-only */
  readOnly?: boolean;
  
  /** Show line numbers */
  lineNumbers?: boolean;
  
  /** Enable word wrapping */
  wordWrap?: boolean;
  
  /** Show code minimap */
  minimap?: boolean;
  
  /** Font size in pixels */
  fontSize?: number;
  
  /** Tab size in spaces */
  tabSize?: number;
  
  /** Enable auto-completion */
  autoComplete?: boolean;
}

// Example usage:
const MyEditor = () => {
  const [code, setCode] = useState('');
  
  return (
    <CodeEditor
      language="typescript"
      theme="dark"
      value={code}
      onChange={setCode}
      lineNumbers={true}
      autoComplete={true}
    />
  );
};`,
    lineNumbers: true,
    minimap: true
  },
  render: (args) => (
    <div className="w-[800px] h-[600px] space-y-4">
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          Read-only mode for displaying documentation and examples
        </AlertDescription>
      </Alert>
      <CodeEditor {...args} />
    </div>
  )
};

// Mobile Responsive
export const MobileResponsive: Story = {
  args: {
    language: 'javascript',
    theme: 'dark',
    defaultValue: `// Mobile-optimized editor
const greeting = 'Hello, Mobile!';
console.log(greeting);`,
    lineNumbers: false,
    minimap: false,
    fontSize: 12,
    wordWrap: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  render: (args) => (
    <div className="w-full max-w-[400px] h-[400px] mx-auto p-4">
      <CodeEditor {...args} />
    </div>
  )
};