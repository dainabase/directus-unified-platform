# Carousel

Image and content carousel

## Import

```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@dainabase/ui/carousel';
```

## Basic Usage

```tsx
import { Carousel, CarouselContent, CarouselItem } from '@dainabase/ui/carousel';

export default function CarouselExample() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

## Related Components

- [Card](./card.md) - Content containers

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>