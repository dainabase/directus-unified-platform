# Avatar

User avatar display component

## Import

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@dainabase/ui/avatar';
```

## Basic Usage

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@dainabase/ui/avatar';

export default function AvatarExample() {
  return (
    <Avatar>
      <AvatarImage src="/avatar.jpg" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
}
```

## Related Components

- [Badge](./badge.md) - Status badges

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>