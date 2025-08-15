// Advanced Bundle - Lazy loaded advanced components
// Complex components that should be loaded on-demand

export { Accordion } from './accordion';
export { Calendar } from './calendar';
export { Carousel } from './carousel';
export { Collapsible } from './collapsible';
export { Resizable } from './resizable';
export { Separator } from './separator';
export { TextAnimations } from './text-animations';
export { UIProvider } from './ui-provider';

// HEAVY COMPONENTS - Import these separately for optimal bundle size:
// import { PdfViewer } from '@dainabase/ui/lazy/pdf-viewer'; // 57KB
// import { ImageCropper } from '@dainabase/ui/lazy/image-cropper'; // 50KB
// import { CodeEditor } from '@dainabase/ui/lazy/code-editor'; // 49KB
// import { ThemeBuilder } from '@dainabase/ui/lazy/theme-builder'; // 34KB
// import { RichTextEditor } from '@dainabase/ui/lazy/rich-text-editor'; // 29KB
// import { VideoPlayer } from '@dainabase/ui/lazy/video-player'; // 25KB
// import { Kanban } from '@dainabase/ui/lazy/kanban'; // 22KB
// import { TimelineEnhanced } from '@dainabase/ui/lazy/timeline-enhanced'; // 21KB

// Export types
export type { AccordionProps } from './accordion';
export type { CalendarProps } from './calendar';
export type { CarouselProps } from './carousel';
export type { CollapsibleProps } from './collapsible';
export type { ResizableProps } from './resizable';
export type { SeparatorProps } from './separator';
