# Migration Guide

Comprehensive guide for migrating to Directus UI from other component libraries.

## 📋 Table of Contents

- [From Material-UI (MUI)](#from-material-ui-mui)
- [From Ant Design](#from-ant-design)
- [From Chakra UI](#from-chakra-ui)
- [From Bootstrap](#from-bootstrap)
- [From Tailwind UI](#from-tailwind-ui)
- [Version Upgrades](#version-upgrades)
- [Breaking Changes](#breaking-changes)

## From Material-UI (MUI)

### Component Mapping

| MUI Component | Directus UI Component | Notes |
|---------------|----------------------|-------|
| `Button` | `Button` | Similar API, different variant names |
| `TextField` | `Input` | Split into `Input` and `Label` |
| `Select` | `Select` | Native select, simpler API |
| `Checkbox` | `Checkbox` | Similar functionality |
| `Radio` | `RadioGroup` | Group-based approach |
| `Switch` | `Switch` | Nearly identical |
| `Slider` | `Slider` | Similar with fewer props |
| `Dialog` | `Dialog` | Compound component pattern |
| `Snackbar` | `Toast` | Different positioning system |
| `Card` | `Card` | Simpler structure |
| `Tabs` | `Tabs` | Compound components |
| `Accordion` | `Accordion` | Similar structure |
| `Avatar` | `Avatar` | Simpler API |
| `Badge` | `Badge` | Different positioning |
| `Chip` | `Badge` | Use Badge with different styling |
| `CircularProgress` | `Progress` | Different visualization |
| `Alert` | `Alert` | Similar with fewer variants |
| `Tooltip` | `Tooltip` | Similar functionality |
| `Menu` | `DropdownMenu` | Different trigger pattern |
| `Drawer` | `Sheet` | Similar sliding panel |
| `DataGrid` | `DataGrid` | Similar but lighter |

### Migration Example

#### MUI Code
```tsx
// MUI Implementation
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions 
} from '@mui/material';

function MUIExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <TextField 
        label="Email" 
        variant="outlined"
        fullWidth
        margin="normal"
      />
      
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => setOpen(true)}
      >
        Open Dialog
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to proceed?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

#### Directus UI Code
```tsx
// Directus UI Implementation
import { 
  Button, 
  Input, 
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@directus/ui';

function DirectusExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          className="w-full"
        />
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <Button 
          variant="primary"
          onClick={() => setOpen(true)}
        >
          Open Dialog
        </Button>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to proceed?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Theme Migration

```tsx
// MUI Theme
const muiTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Roboto, Arial',
  },
});

// Directus UI Theme
const directusTheme = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  fontFamily: 'Roboto, Arial',
};

<UIProvider theme={directusTheme}>
  <App />
</UIProvider>
```

## From Ant Design

### Component Mapping

| Ant Design | Directus UI | Notes |
|------------|-------------|-------|
| `Button` | `Button` | Different type/variant naming |
| `Input` | `Input` | Simpler API |
| `Select` | `Select` | Native implementation |
| `DatePicker` | `DatePicker` | Different date library |
| `TimePicker` | `DatePicker` | Use with time mode |
| `Switch` | `Switch` | Similar |
| `Radio` | `RadioGroup` | Group-based |
| `Checkbox` | `Checkbox` | Similar |
| `Rate` | `Rating` | Similar star rating |
| `Slider` | `Slider` | Similar |
| `Upload` | `FileUpload` | Different API |
| `Modal` | `Dialog` | Different structure |
| `Drawer` | `Sheet` | Similar concept |
| `Message` | `Toast` | Different API |
| `Notification` | `Toast` | Unified toast system |
| `Popconfirm` | `AlertDialog` | Similar confirmation |
| `Tooltip` | `Tooltip` | Similar |
| `Table` | `Table` | Simpler API |
| `Form` | `Form` | Different validation |
| `Card` | `Card` | Simpler structure |
| `Tabs` | `Tabs` | Compound components |
| `Collapse` | `Accordion` | Similar |
| `Badge` | `Badge` | Similar |
| `Tag` | `Badge` | Use Badge |
| `Alert` | `Alert` | Similar |
| `Progress` | `Progress` | Similar |
| `Spin` | `Skeleton` | Loading states |

### Migration Example

#### Ant Design Code
```tsx
// Ant Design Implementation
import { Button, Input, Form, Modal, message } from 'antd';

function AntExample() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  
  const handleSubmit = (values) => {
    message.success('Form submitted!');
  };
  
  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item 
        name="username" 
        rules={[{ required: true, message: 'Required!' }]}
      >
        <Input placeholder="Username" />
      </Form.Item>
      
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
      
      <Modal
        visible={visible}
        title="Modal Title"
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
        Modal content
      </Modal>
    </Form>
  );
}
```

#### Directus UI Code
```tsx
// Directus UI Implementation
import { Button, Input, Form, Dialog, useToast } from '@directus/ui';

function DirectusExample() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Success!",
      description: "Form submitted!",
      variant: "success"
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Input 
          placeholder="Username" 
          required
        />
      </div>
      
      <Button type="submit" variant="primary">
        Submit
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal Title</DialogTitle>
          </DialogHeader>
          <p>Modal content</p>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
```

## From Chakra UI

### Component Mapping

| Chakra UI | Directus UI | Notes |
|-----------|-------------|-------|
| `Button` | `Button` | Different variant system |
| `Input` | `Input` | Simpler props |
| `Select` | `Select` | Native select |
| `Checkbox` | `Checkbox` | Similar |
| `Radio` | `RadioGroup` | Different structure |
| `Switch` | `Switch` | Similar |
| `Slider` | `Slider` | Similar |
| `Textarea` | `Textarea` | Similar |
| `FormControl` | `div` + `Label` | Manual structure |
| `Modal` | `Dialog` | Different API |
| `Drawer` | `Sheet` | Similar |
| `Alert` | `Alert` | Similar |
| `Toast` | `Toast` | Different hook |
| `Tooltip` | `Tooltip` | Similar |
| `Popover` | `Popover` | Similar |
| `Menu` | `DropdownMenu` | Different structure |
| `Tabs` | `Tabs` | Similar |
| `Accordion` | `Accordion` | Similar |
| `Badge` | `Badge` | Similar |
| `Card` | `Card` | Simpler |
| `Avatar` | `Avatar` | Similar |
| `Progress` | `Progress` | Similar |
| `Skeleton` | `Skeleton` | Similar |
| `Spinner` | `Progress` | Use circular progress |

### Migration Example

```tsx
// Chakra UI
import { 
  Box, 
  Button, 
  Input, 
  FormControl, 
  FormLabel,
  useToast 
} from '@chakra-ui/react';

// Directus UI
import { 
  Button, 
  Input, 
  Label,
  Card,
  useToast 
} from '@directus/ui';

// Component structure changes from Chakra's Box-based to semantic HTML
```

## Version Upgrades

### Upgrading from v0.x to v1.x

#### Breaking Changes

1. **Import Path Changes**
```tsx
// Old (v0.x)
import Button from '@directus/ui/button';

// New (v1.x)
import { Button } from '@directus/ui';
```

2. **Props Renaming**
```tsx
// Old (v0.x)
<Button type="primary" block>Click</Button>

// New (v1.x)
<Button variant="primary" fullWidth>Click</Button>
```

3. **Theme Provider**
```tsx
// Old (v0.x)
<ThemeProvider theme={theme}>

// New (v1.x)
<UIProvider theme={theme}>
```

4. **CSS Import**
```tsx
// Old (v0.x)
import '@directus/ui/styles/index.css';

// New (v1.x)
import '@directus/ui/dist/styles.css';
```

### Component-Specific Changes

#### Button
- `type` → `variant`
- `block` → `fullWidth`
- `icon` → `leftIcon`/`rightIcon`

#### Input
- `addonBefore` → use separate Label component
- `addonAfter` → use composition

#### Select
- `mode` prop removed
- Use `multiple` prop for multi-select

#### Modal/Dialog
- `visible` → `open`
- `onCancel` → `onOpenChange`

## Common Migration Patterns

### Form Handling

```tsx
// Generic Pattern
function MigratedForm() {
  const [formData, setFormData] = useState({});
  
  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  return (
    <form>
      <Label htmlFor="field">Field</Label>
      <Input 
        id="field"
        value={formData.field || ''}
        onChange={handleChange('field')}
      />
    </form>
  );
}
```

### Modal/Dialog Pattern

```tsx
// Generic Dialog Pattern
function MigratedDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
}
```

## Migration Checklist

- [ ] Update package.json dependencies
- [ ] Update import statements
- [ ] Update CSS imports
- [ ] Replace deprecated components
- [ ] Update component props
- [ ] Update theme configuration
- [ ] Test all interactive components
- [ ] Update TypeScript types
- [ ] Review accessibility
- [ ] Test responsive behavior
- [ ] Update documentation
- [ ] Run build and check for errors

## Automated Migration

### Codemod Script

We provide a codemod to help automate common migrations:

```bash
npx @directus/ui-codemod migrate --from mui --to directus-ui
```

Supported migrations:
- MUI → Directus UI
- Ant Design → Directus UI
- Chakra UI → Directus UI

## Need Help?

- 📖 [Documentation](../README.md)
- 💬 [Discord Community](https://discord.gg/directus)
- 🐛 [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 [Support Email](mailto:support@directus.io)

---

<div align="center">

[← Back to Guides](../README.md) | [Theming Guide →](./theming.md)

</div>
