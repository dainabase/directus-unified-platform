---
id: stepper
title: Stepper
sidebar_position: 39
---

import { Stepper, Step, StepIndicator, StepSeparator, StepContent, StepTitle, StepDescription } from '@dainabase/ui';

# Stepper

A component that guides users through multi-step processes with clear visual progress indication. Perfect for forms, wizards, and onboarding flows.

## Preview

<Stepper activeStep={1}>
  <Step>
    <StepIndicator>1</StepIndicator>
    <StepContent>
      <StepTitle>Account Details</StepTitle>
      <StepDescription>Enter your account information</StepDescription>
    </StepContent>
  </Step>
  <StepSeparator />
  <Step>
    <StepIndicator>2</StepIndicator>
    <StepContent>
      <StepTitle>Personal Info</StepTitle>
      <StepDescription>Tell us about yourself</StepDescription>
    </StepContent>
  </Step>
  <StepSeparator />
  <Step>
    <StepIndicator>3</StepIndicator>
    <StepContent>
      <StepTitle>Review</StepTitle>
      <StepDescription>Review and confirm</StepDescription>
    </StepContent>
  </Step>
</Stepper>

## Features

- **Linear & Non-linear**: Support for both sequential and free navigation
- **Horizontal & Vertical**: Multiple layout orientations
- **Status Indicators**: Visual states for completed, active, and upcoming steps
- **Validation Support**: Built-in error and warning states
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Navigation**: Full keyboard support
- **Customizable Icons**: Use numbers, icons, or custom indicators
- **Progress Tracking**: Clear visual progress indication
- **Accessible**: Full ARIA support for screen readers

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Stepper, Step, StepIndicator, StepContent, StepTitle } from '@dainabase/ui';

export default function StepperDemo() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Stepper activeStep={activeStep}>
      <Step>
        <StepIndicator>1</StepIndicator>
        <StepContent>
          <StepTitle>First Step</StepTitle>
        </StepContent>
      </Step>
      <Step>
        <StepIndicator>2</StepIndicator>
        <StepContent>
          <StepTitle>Second Step</StepTitle>
        </StepContent>
      </Step>
      <Step>
        <StepIndicator>3</StepIndicator>
        <StepContent>
          <StepTitle>Third Step</StepTitle>
        </StepContent>
      </Step>
    </Stepper>
  );
}
```

## Examples

### Basic Stepper

```tsx
function BasicStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Plan', 'Enter Details', 'Confirm'];

  return (
    <div className="w-full">
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => (
          <Step key={step}>
            <StepIndicator>{index + 1}</StepIndicator>
            <StepContent>
              <StepTitle>{step}</StepTitle>
            </StepContent>
            {index < steps.length - 1 && <StepSeparator />}
          </Step>
        ))}
      </Stepper>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={activeStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Form Wizard

```tsx
function FormWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});

  const steps = [
    { title: 'Account', description: 'Create your account' },
    { title: 'Profile', description: 'Setup your profile' },
    { title: 'Preferences', description: 'Set your preferences' },
    { title: 'Review', description: 'Review and confirm' }
  ];

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <FormField>
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" />
            </FormField>
            <FormField>
              <Label>Password</Label>
              <Input type="password" />
            </FormField>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <FormField>
              <Label>Full Name</Label>
              <Input placeholder="John Doe" />
            </FormField>
            <FormField>
              <Label>Phone</Label>
              <Input type="tel" placeholder="+1 234 567 8900" />
            </FormField>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <FormField>
              <Label>Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Email notifications</Label>
              </div>
            </FormField>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready to submit!</AlertTitle>
              <AlertDescription>
                Please review your information before submitting.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> john@example.com</p>
              <p><strong>Name:</strong> John Doe</p>
              <p><strong>Phone:</strong> +1 234 567 8900</p>
              <p><strong>Language:</strong> English</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <Stepper activeStep={activeStep} className="mb-8">
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              {activeStep > index ? <Check className="h-4 w-4" /> : index + 1}
            </StepIndicator>
            <StepContent>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </StepContent>
            {index < steps.length - 1 && <StepSeparator />}
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardHeader>
          <CardTitle>{steps[activeStep].title}</CardTitle>
          <CardDescription>{steps[activeStep].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={activeStep === steps.length - 1 ? undefined : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### Vertical Stepper

```tsx
<Stepper activeStep={1} orientation="vertical">
  <Step>
    <div className="flex items-start">
      <StepIndicator>
        <User className="h-4 w-4" />
      </StepIndicator>
      <div className="ml-4 flex-1">
        <StepTitle>Create Account</StepTitle>
        <StepDescription>Enter your email and password</StepDescription>
        <div className="mt-4 space-y-3">
          <Input placeholder="Email" />
          <Input type="password" placeholder="Password" />
        </div>
      </div>
    </div>
  </Step>
  
  <StepSeparator orientation="vertical" />
  
  <Step>
    <div className="flex items-start">
      <StepIndicator>
        <Settings className="h-4 w-4" />
      </StepIndicator>
      <div className="ml-4 flex-1">
        <StepTitle>Configure Settings</StepTitle>
        <StepDescription>Choose your preferences</StepDescription>
        <div className="mt-4 space-y-3">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </Step>
  
  <StepSeparator orientation="vertical" />
  
  <Step>
    <div className="flex items-start">
      <StepIndicator>
        <CheckCircle className="h-4 w-4" />
      </StepIndicator>
      <div className="ml-4 flex-1">
        <StepTitle>Complete Setup</StepTitle>
        <StepDescription>You're all set!</StepDescription>
      </div>
    </div>
  </Step>
</Stepper>
```

### Non-linear Stepper

```tsx
function NonLinearStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());

  const steps = [
    'Basic Information',
    'Contact Details',
    'Preferences',
    'Review'
  ];

  const handleStep = (step) => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);
    
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <div>
      <Stepper activeStep={activeStep} nonLinear>
        {steps.map((label, index) => (
          <Step key={label} completed={completed.has(index)}>
            <StepIndicator 
              onClick={() => handleStep(index)}
              className="cursor-pointer"
            >
              {completed.has(index) ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </StepIndicator>
            <StepContent>
              <StepTitle>{label}</StepTitle>
            </StepContent>
            {index < steps.length - 1 && <StepSeparator />}
          </Step>
        ))}
      </Stepper>
      
      <div className="mt-8">
        <p className="mb-4">Step {activeStep + 1} content here</p>
        <Button onClick={handleComplete}>
          {completed.has(activeStep) ? 'Update' : 'Complete'} Step
        </Button>
      </div>
    </div>
  );
}
```

### Stepper with Status

```tsx
<Stepper activeStep={1}>
  <Step status="complete">
    <StepIndicator>
      <Check className="h-4 w-4" />
    </StepIndicator>
    <StepContent>
      <StepTitle>Completed</StepTitle>
      <StepDescription>This step is done</StepDescription>
    </StepContent>
  </Step>
  <StepSeparator />
  
  <Step status="active">
    <StepIndicator>2</StepIndicator>
    <StepContent>
      <StepTitle>In Progress</StepTitle>
      <StepDescription>Currently working on this</StepDescription>
    </StepContent>
  </Step>
  <StepSeparator />
  
  <Step status="error">
    <StepIndicator>
      <X className="h-4 w-4" />
    </StepIndicator>
    <StepContent>
      <StepTitle>Error</StepTitle>
      <StepDescription className="text-destructive">
        Fix issues before continuing
      </StepDescription>
    </StepContent>
  </Step>
  <StepSeparator />
  
  <Step status="waiting">
    <StepIndicator>4</StepIndicator>
    <StepContent>
      <StepTitle>Waiting</StepTitle>
      <StepDescription>Complete previous steps</StepDescription>
    </StepContent>
  </Step>
</Stepper>
```

### Onboarding Flow

```tsx
function OnboardingStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Welcome',
      icon: <Sparkles className="h-4 w-4" />,
      content: (
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold mb-4">Welcome to Our App!</h3>
          <p className="text-muted-foreground">
            Let's get you set up in just a few steps.
          </p>
        </div>
      )
    },
    {
      title: 'Connect',
      icon: <Link className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Button className="w-full" variant="outline">
            <Github className="mr-2 h-4 w-4" />
            Connect GitHub
          </Button>
          <Button className="w-full" variant="outline">
            <Chrome className="mr-2 h-4 w-4" />
            Connect Google
          </Button>
        </div>
      )
    },
    {
      title: 'Customize',
      icon: <Palette className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label>Choose Theme</Label>
            <RadioGroup defaultValue="light">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: 'Complete',
      icon: <CheckCircle className="h-4 w-4" />,
      content: (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">You're All Set!</h3>
          <p className="text-muted-foreground">
            Start exploring the application
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="w-full max-w-2xl">
      <Stepper activeStep={currentStep} className="mb-8">
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              {currentStep > index ? (
                <Check className="h-4 w-4" />
              ) : (
                step.icon
              )}
            </StepIndicator>
            <StepContent>
              <StepTitle>{step.title}</StepTitle>
            </StepContent>
            {index < steps.length - 1 && <StepSeparator />}
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent className="pt-6">
          {steps[currentStep].content}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full",
                  index === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <Button
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### Mobile Responsive Stepper

```tsx
<Stepper activeStep={1} className="flex-col sm:flex-row">
  <Step className="flex-col sm:flex-row text-center sm:text-left">
    <StepIndicator className="mx-auto sm:mx-0">1</StepIndicator>
    <StepContent className="mt-2 sm:mt-0 sm:ml-2">
      <StepTitle>Cart</StepTitle>
      <StepDescription className="hidden sm:block">
        Review items
      </StepDescription>
    </StepContent>
  </Step>
  
  <StepSeparator className="h-8 sm:h-auto sm:flex-1" />
  
  <Step className="flex-col sm:flex-row text-center sm:text-left">
    <StepIndicator className="mx-auto sm:mx-0">2</StepIndicator>
    <StepContent className="mt-2 sm:mt-0 sm:ml-2">
      <StepTitle>Shipping</StepTitle>
      <StepDescription className="hidden sm:block">
        Enter address
      </StepDescription>
    </StepContent>
  </Step>
  
  <StepSeparator className="h-8 sm:h-auto sm:flex-1" />
  
  <Step className="flex-col sm:flex-row text-center sm:text-left">
    <StepIndicator className="mx-auto sm:mx-0">3</StepIndicator>
    <StepContent className="mt-2 sm:mt-0 sm:ml-2">
      <StepTitle>Payment</StepTitle>
      <StepDescription className="hidden sm:block">
        Add payment method
      </StepDescription>
    </StepContent>
  </Step>
</Stepper>
```

## API Reference

### Stepper

The root container for the stepper.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeStep` | `number` | `0` | Currently active step index |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout orientation |
| `nonLinear` | `boolean` | `false` | Allow non-sequential navigation |
| `alternativeLabel` | `boolean` | `false` | Place labels below icons |
| `className` | `string` | - | Additional CSS classes |

### Step

Individual step component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `completed` | `boolean` | `false` | Whether step is completed |
| `disabled` | `boolean` | `false` | Whether step is disabled |
| `status` | `'complete' \| 'active' \| 'error' \| 'waiting'` | - | Step status |
| `optional` | `boolean` | `false` | Whether step is optional |

### StepIndicator

The step number or icon indicator.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `() => void` | - | Click handler for non-linear steppers |
| `children` | `ReactNode` | - | Custom content (number/icon) |

### StepContent

Container for step title and description.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Step content |

### StepTitle

The step title text.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Title text |

### StepDescription

Optional step description text.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Description text |

### StepSeparator

Line connector between steps.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Separator orientation |
| `className` | `string` | - | Additional CSS classes |

## Accessibility

The Stepper component follows accessibility best practices:

- **ARIA Support**: Proper roles and attributes
- **Keyboard Navigation**:
  - `Tab`: Focus on interactive elements
  - `Arrow Keys`: Navigate between steps (non-linear)
  - `Enter/Space`: Select step (non-linear)
- **Screen Readers**: Clear step announcements
- **Focus Indicators**: Visible focus states
- **Status Announcements**: Step completion status

## Best Practices

### Do's ✅

- Keep step titles short and descriptive
- Show clear progress indication
- Allow backward navigation
- Save progress between steps
- Validate before moving forward
- Provide clear error messages

### Don'ts ❌

- Don't use too many steps (7 max recommended)
- Don't auto-advance without user action
- Don't lose data when navigating back
- Don't skip validation
- Don't hide essential information in collapsed steps
- Don't make all steps required if some are optional

## Use Cases

- **Multi-step Forms**: Registration, checkout, applications
- **Onboarding**: User onboarding flows
- **Wizards**: Configuration wizards
- **Progress Tracking**: Task completion tracking
- **Tutorials**: Step-by-step guides
- **Order Process**: E-commerce checkout
- **Surveys**: Multi-page questionnaires
- **Setup Flows**: Application setup processes

## Related Components

- [Progress](./progress) - For progress bars
- [Tabs](./tabs) - For tabbed navigation
- [Form](./form) - For form layouts
- [Card](./card) - For step content containers
- [Button](./button) - For navigation controls