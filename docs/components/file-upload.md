# File Upload

File upload with drag and drop

## Import

```tsx
import { FileUpload } from '@dainabase/ui/file-upload';
```

## Basic Usage

```tsx
import { FileUpload } from '@dainabase/ui/file-upload';

export default function FileUploadExample() {
  return (
    <FileUpload 
      accept="image/*"
      maxSize={5 * 1024 * 1024}
      onUpload={(files) => console.log(files)}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| accept | `string` | - | No | Accepted file types |
| multiple | `boolean` | false | No | Allow multiple files |
| maxSize | `number` | - | No | Max file size (bytes) |
| onUpload | `(files: File[]) => void` | - | Yes | Upload callback |

## Related Components

- [Button](./button.md) - Upload trigger
- [Progress](./progress.md) - Upload progress

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>