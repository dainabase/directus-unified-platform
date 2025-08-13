---
id: forms-demo
title: Forms Demo
sidebar_position: 60
---

import { FormsDemo } from '@dainabase/ui';

A comprehensive showcase component demonstrating best practices for building complex, accessible, and user-friendly forms using the Design System components with validation, error handling, and advanced interactions.

## Preview

```jsx live
function FormsDemoPreview() {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (data) => {
    setFormData(data);
    setSubmitted(true);
  };
  
  return (
    <div className="space-y-6">
      <FormsDemo
        onSubmit={handleSubmit}
        showValidation={true}
        layout="vertical"
      />
      
      {submitted && (
        <Alert>
          <AlertTitle>Form Submitted!</AlertTitle>
          <AlertDescription>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Features

- 📝 **Complete Form Examples**: Registration, login, checkout, survey forms
- ✅ **Built-in Validation**: Comprehensive validation patterns
- 🎯 **Error Handling**: Inline and summary error displays
- 🔄 **State Management**: Form state with React Hook Form
- 📱 **Responsive Layouts**: Mobile-first form designs
- ♿ **Accessible**: WCAG 2.1 compliant forms
- 🎨 **Multiple Layouts**: Vertical, horizontal, grid layouts
- 📊 **Progress Indicators**: Multi-step form progress
- 🔐 **Security Patterns**: Password strength, CAPTCHA integration
- 🌍 **Internationalization**: Multi-language form support

## Installation

```bash
npm install @dainabase/ui react-hook-form zod
```

## Basic Usage

```jsx
import { FormsDemo } from '@dainabase/ui';

function App() {
  return (
    <FormsDemo
      type="registration"
      onSubmit={(data) => console.log(data)}
    />
  );
}
```

## Examples

### Registration Form

```jsx
function RegistrationFormDemo() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName', { required: 'First name is required' })}
          error={errors.firstName?.message}
        />
        
        <Input
          label="Last Name"
          {...register('lastName', { required: 'Last name is required' })}
          error={errors.lastName?.message}
        />
      </div>
      
      <Input
        type="email"
        label="Email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
      />
      
      <Input
        type="password"
        label="Password"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        })}
        error={errors.password?.message}
      />
      
      <Checkbox
        {...register('terms', { required: 'You must accept the terms' })}
      >
        I accept the terms and conditions
      </Checkbox>
      
      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
```

### Multi-Step Form

```jsx
function MultiStepFormDemo() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const steps = [
    { id: 1, title: 'Personal Info', icon: 'user' },
    { id: 2, title: 'Contact Details', icon: 'mail' },
    { id: 3, title: 'Preferences', icon: 'settings' },
    { id: 4, title: 'Review', icon: 'check' }
  ];
  
  const handleStepSubmit = (stepData) => {
    setFormData({ ...formData, ...stepData });
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Final submission
      console.log('Complete form:', { ...formData, ...stepData });
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Stepper activeStep={step} steps={steps} />
      
      <div className="mt-8">
        {step === 1 && (
          <PersonalInfoStep onSubmit={handleStepSubmit} />
        )}
        {step === 2 && (
          <ContactDetailsStep onSubmit={handleStepSubmit} />
        )}
        {step === 3 && (
          <PreferencesStep onSubmit={handleStepSubmit} />
        )}
        {step === 4 && (
          <ReviewStep data={formData} onSubmit={handleStepSubmit} />
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setStep(step + 1)}
          disabled={step === steps.length}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Dynamic Form Builder

```jsx
function DynamicFormDemo() {
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: 'Name', required: true },
    { id: 2, type: 'email', label: 'Email', required: true }
  ]);
  
  const addField = (type) => {
    setFields([...fields, {
      id: Date.now(),
      type,
      label: `New ${type} field`,
      required: false
    }]);
  };
  
  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={() => addField('text')}>Add Text Field</Button>
        <Button onClick={() => addField('select')}>Add Select</Button>
        <Button onClick={() => addField('checkbox')}>Add Checkbox</Button>
      </div>
      
      <form className="space-y-4">
        {fields.map(field => (
          <div key={field.id} className="flex gap-2">
            <DynamicField {...field} className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeField(field.id)}
            >
              <X />
            </Button>
          </div>
        ))}
      </form>
    </div>
  );
}
```

### Payment Form

```jsx
function PaymentFormDemo() {
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            pattern="[0-9\s]{13,19}"
            autoComplete="cc-number"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              placeholder="MM/YY"
              pattern="^(0[1-9]|1[0-2])\/\d{2}$"
              autoComplete="cc-exp"
            />
            
            <Input
              label="CVV"
              placeholder="123"
              maxLength={4}
              pattern="[0-9]{3,4}"
              autoComplete="cc-csc"
            />
          </div>
          
          <Input
            label="Cardholder Name"
            autoComplete="cc-name"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Street Address" autoComplete="street-address" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" autoComplete="address-level2" />
            <Input label="ZIP Code" autoComplete="postal-code" />
          </div>
          <Select label="Country" autoComplete="country">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="uk">United Kingdom</option>
          </Select>
        </CardContent>
      </Card>
      
      <Button type="submit" className="w-full">
        Complete Payment
      </Button>
    </form>
  );
}
```

### Survey Form

```jsx
function SurveyFormDemo() {
  const questions = [
    {
      id: 1,
      type: 'rating',
      question: 'How satisfied are you with our service?',
      scale: 5
    },
    {
      id: 2,
      type: 'radio',
      question: 'How often do you use our product?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
    },
    {
      id: 3,
      type: 'checkbox',
      question: 'Which features do you use? (Select all that apply)',
      options: ['Dashboard', 'Reports', 'Analytics', 'API']
    },
    {
      id: 4,
      type: 'textarea',
      question: 'Any additional feedback?'
    }
  ];
  
  return (
    <form className="space-y-6">
      {questions.map((q, index) => (
        <Card key={q.id}>
          <CardContent className="pt-6">
            <Label className="text-lg mb-4">
              {index + 1}. {q.question}
            </Label>
            
            {q.type === 'rating' && (
              <Rating max={q.scale} />
            )}
            
            {q.type === 'radio' && (
              <RadioGroup>
                {q.options.map(option => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </RadioGroup>
            )}
            
            {q.type === 'checkbox' && (
              <div className="space-y-2">
                {q.options.map(option => (
                  <Checkbox key={option}>
                    {option}
                  </Checkbox>
                ))}
              </div>
            )}
            
            {q.type === 'textarea' && (
              <Textarea rows={4} />
            )}
          </CardContent>
        </Card>
      ))}
      
      <Button type="submit" className="w-full">
        Submit Survey
      </Button>
    </form>
  );
}
```

### Settings Form

```jsx
function SettingsFormDemo() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailDigest: 'weekly',
    privacy: 'friends',
    twoFactor: false
  });
  
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Switch
            checked={settings.notifications}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, notifications: checked })
            }
          >
            Enable notifications
          </Switch>
          
          <Select
            value={settings.emailDigest}
            onChange={(e) => 
              setSettings({ ...settings, emailDigest: e.target.value })
            }
          >
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly digest</option>
            <option value="monthly">Monthly digest</option>
            <option value="never">Never</option>
          </Select>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.privacy}
            onValueChange={(value) => 
              setSettings({ ...settings, privacy: value })
            }
          >
            <Radio value="public">Public</Radio>
            <Radio value="friends">Friends only</Radio>
            <Radio value="private">Private</Radio>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <Switch
            checked={settings.twoFactor}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, twoFactor: checked })
            }
          >
            Enable two-factor authentication
          </Switch>
        </CardContent>
      </Card>
      
      <Button type="submit">Save Settings</Button>
    </form>
  );
}
```

### Conditional Fields

```jsx
function ConditionalFormDemo() {
  const [formType, setFormType] = useState('individual');
  
  return (
    <form className="space-y-4">
      <RadioGroup
        value={formType}
        onValueChange={setFormType}
      >
        <Radio value="individual">Individual</Radio>
        <Radio value="business">Business</Radio>
      </RadioGroup>
      
      {formType === 'individual' ? (
        <>
          <Input label="Full Name" required />
          <Input label="Social Security Number" />
        </>
      ) : (
        <>
          <Input label="Company Name" required />
          <Input label="Tax ID" required />
          <Input label="Number of Employees" type="number" />
        </>
      )}
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### File Upload Form

```jsx
function FileUploadFormDemo() {
  const [files, setFiles] = useState([]);
  
  return (
    <form className="space-y-4">
      <FileUpload
        multiple
        accept="image/*,application/pdf"
        maxSize={5 * 1024 * 1024} // 5MB
        onFilesChange={setFiles}
      />
      
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Files:</Label>
          {files.map(file => (
            <div key={file.name} className="flex items-center gap-2">
              <File size={16} />
              <span>{file.name}</span>
              <span className="text-sm text-muted">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          ))}
        </div>
      )}
      
      <Button type="submit" disabled={files.length === 0}>
        Upload Files
      </Button>
    </form>
  );
}
```

### Search Form

```jsx
function SearchFormDemo() {
  const [filters, setFilters] = useState({
    query: '',
    category: 'all',
    priceRange: [0, 1000],
    inStock: false
  });
  
  return (
    <form className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={filters.query}
          onChange={(e) => 
            setFilters({ ...filters, query: e.target.value })
          }
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Select
          value={filters.category}
          onChange={(e) => 
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
        </Select>
        
        <div>
          <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => 
              setFilters({ ...filters, priceRange: value })
            }
            max={1000}
            step={10}
          />
        </div>
        
        <Checkbox
          checked={filters.inStock}
          onCheckedChange={(checked) => 
            setFilters({ ...filters, inStock: checked })
          }
        >
          In Stock Only
        </Checkbox>
      </div>
    </form>
  );
}
```

## API Reference

### FormsDemo Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `FormType` | `'basic'` | Type of form demo |
| `onSubmit` | `(data) => void` | - | Form submission handler |
| `validation` | `'client' \| 'server' \| 'both'` | `'client'` | Validation type |
| `layout` | `'vertical' \| 'horizontal' \| 'grid'` | `'vertical'` | Form layout |
| `showValidation` | `boolean` | `true` | Show validation messages |
| `showProgress` | `boolean` | `false` | Show progress indicator |
| `disabled` | `boolean` | `false` | Disable all form fields |
| `readonly` | `boolean` | `false` | Make form read-only |
| `autoSave` | `boolean` | `false` | Enable auto-save |
| `className` | `string` | - | Additional CSS classes |

### Form Types

```typescript
type FormType = 
  | 'registration'
  | 'login'
  | 'checkout'
  | 'survey'
  | 'contact'
  | 'settings'
  | 'profile'
  | 'payment'
  | 'search'
  | 'multi-step';
```

## Validation Patterns

```jsx
// Common validation patterns
const validationPatterns = {
  email: /^\S+@\S+\.\S+$/,
  phone: /^\+?[\d\s-()]+$/,
  zip: /^\d{5}(-\d{4})?$/,
  url: /^https?:\/\/.+\..+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
};
```

## Accessibility

Forms follow WCAG 2.1 Level AA guidelines:

- **Labels**: All inputs have associated labels
- **Error Messages**: Clear, descriptive error messages
- **Keyboard Navigation**: Full keyboard support
- **ARIA Attributes**: Proper ARIA labels and descriptions
- **Focus Management**: Logical focus order
- **Required Fields**: Clear indication of required fields
- **Field Instructions**: Helper text for complex fields
- **Error Summary**: Summary of all errors at form level

## Best Practices

### Do's ✅

- Provide clear labels and instructions
- Group related fields
- Show validation in real-time
- Use appropriate input types
- Provide helpful error messages
- Save progress in multi-step forms
- Use loading states for async operations
- Make forms mobile-friendly
- Test with screen readers
- Provide clear success feedback

### Don'ts ❌

- Don't use placeholder as labels
- Don't hide important information
- Don't disable submit without explanation
- Don't clear form on error
- Don't use too many required fields
- Don't forget confirmation for destructive actions
- Don't ignore accessibility
- Don't use confusing layouts
- Don't forget to handle errors
- Don't make forms too long

## Use Cases

1. **User Registration**: Account creation flows
2. **E-commerce Checkout**: Payment and shipping forms
3. **Survey Applications**: Feedback collection
4. **Admin Panels**: Settings and configuration
5. **Contact Forms**: Customer inquiries
6. **Job Applications**: Multi-step application process
7. **Booking Systems**: Reservation forms
8. **Profile Management**: User preference forms
9. **Data Entry**: Business data collection
10. **Search Interfaces**: Advanced filter forms

## Related Components

- [Form](./form) - Base form component
- [Input](./input) - Text input fields
- [Select](./select) - Dropdown selections
- [Checkbox](./checkbox) - Checkbox inputs
- [RadioGroup](./radio-group) - Radio button groups
- [Button](./button) - Form actions
- [DatePicker](./date-picker) - Date selection
- [FileUpload](./file-upload) - File uploads
- [Stepper](./stepper) - Multi-step forms
- [Alert](./alert) - Error and success messages