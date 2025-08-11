# Form

Complete form with validation and error handling

## Import

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@dainabase/ui/form';
```

## Basic Usage

```tsx
import { Form } from '@dainabase/ui/form';
import { useForm } from 'react-hook-form';

export default function FormExample() {
  const form = useForm();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| form | `UseFormReturn` | - | Yes | React Hook Form instance |
| children | `ReactNode` | - | Yes | Form fields |

## Related Components

- [Input](./input.md) - Text inputs
- [Select](./select.md) - Dropdowns
- [Checkbox](./checkbox.md) - Checkboxes

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>