import * as React from 'react';
import { cn } from '../../lib/utils';

export interface FormsDemoProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onSubmit?: (data: any) => void;
  variant?: 'default' | 'card' | 'inline';
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | undefined;
}

const defaultFields: FormField[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter your first name',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter your last name',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john.doe@example.com',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter a secure password',
    required: true,
  },
  {
    name: 'birthDate',
    label: 'Date of Birth',
    type: 'date',
    required: false,
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Select a country' },
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
    ],
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    placeholder: 'Tell us about yourself...',
    required: false,
  },
  {
    name: 'terms',
    label: 'I agree to the terms and conditions',
    type: 'checkbox',
    required: true,
  },
  {
    name: 'newsletter',
    label: 'Subscribe to newsletter',
    type: 'checkbox',
    required: false,
  },
];

const FormInput: React.FC<{
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}> = ({ field, value, onChange, error }) => {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={field.name}
          name={field.name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive'
          )}
        />
      );
    
    case 'select':
      return (
        <select
          id={field.name}
          name={field.name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive'
          )}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            required={field.required}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
          />
          <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
          </label>
        </div>
      );
    
    default:
      return (
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive'
          )}
        />
      );
  }
};

export const FormsDemo = React.forwardRef<HTMLDivElement, FormsDemoProps>(
  ({ 
    className, 
    title = 'Form Demo',
    description = 'This is a demonstration of various form components',
    onSubmit,
    variant = 'default',
    ...props 
  }, ref) => {
    const [formData, setFormData] = React.useState<Record<string, any>>({});
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [submitted, setSubmitted] = React.useState(false);

    const handleFieldChange = (fieldName: string, value: any) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
      // Clear error when field is modified
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic validation
      const newErrors: Record<string, string> = {};
      defaultFields.forEach(field => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setSubmitted(true);
      onSubmit?.(formData);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    };

    const containerClass = cn(
      'w-full',
      variant === 'card' && 'rounded-lg border bg-card p-6',
      className
    );

    return (
      <div ref={ref} className={containerClass} {...props}>
        {title && (
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
        )}
        {description && (
          <p className="text-muted-foreground mb-6">{description}</p>
        )}
        
        {submitted && (
          <div className="mb-4 p-4 rounded-md bg-green-50 text-green-800 border border-green-200">
            Form submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {defaultFields.map(field => (
            <div key={field.name}>
              {field.type !== 'checkbox' && (
                <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
              )}
              <FormInput
                field={field}
                value={formData[field.name]}
                onChange={(value) => handleFieldChange(field.name, value)}
                error={errors[field.name]}
              />
              {errors[field.name] && (
                <p className="text-sm text-destructive mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className={cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'h-10 px-4 py-2 transition-colors'
              )}
            >
              Submit Form
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({});
                setErrors({});
              }}
              className={cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium',
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                'h-10 px-4 py-2 transition-colors'
              )}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    );
  }
);

FormsDemo.displayName = 'FormsDemo';

export default FormsDemo;
