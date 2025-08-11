# Timeline

Timeline display for chronological data

## Import

```tsx
import { Timeline, TimelineItem } from '@dainabase/ui/timeline';
```

## Basic Usage

```tsx
import { Timeline, TimelineItem } from '@dainabase/ui/timeline';

export default function TimelineExample() {
  return (
    <Timeline>
      <TimelineItem date="2024-01-01" title="Project Started">
        Initial project kickoff and planning.
      </TimelineItem>
      <TimelineItem date="2024-02-15" title="Phase 1 Complete">
        Core features implemented.
      </TimelineItem>
      <TimelineItem date="2024-03-30" title="Launch">
        Public release.
      </TimelineItem>
    </Timeline>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| orientation | `'vertical' \| 'horizontal'` | 'vertical' | No | Timeline orientation |
| alternating | `boolean` | false | No | Alternate item positions |

## Related Components

- [Calendar](./calendar.md) - Calendar view
- [Stepper](./stepper.md) - Step progress

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>