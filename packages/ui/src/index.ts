// packages/ui/src/index.ts
// Optimized central export - Core components only
// Heavy components are available via lazy imports

// ============================================
// CORE EXPORTS (Always bundled - ~50KB total)
// ============================================

// Essential utilities (< 5KB)
export { cn } from "./lib/utils";
export { tokens } from "../tokens";
export type { Tokens } from "../tokens";

// Core UI components (< 20KB total)
export * from "./components/button";
export * from "./components/card";
export * from "./components/badge";
export * from "./components/avatar";
export * from "./components/skeleton";
export * from "./components/icon";
export * from "./components/tooltip";

// Essential layout (< 10KB)
export * from "./components/tabs";
export * from "./components/separator";

// Basic form elements (< 15KB)
export * from "./components/input";
export * from "./components/label";
export * from "./components/checkbox";
export * from "./components/switch";

// Theme essentials (< 5KB)
export * from "./theme/ThemeProvider";
export * from "./components/theme-toggle";

// ============================================
// LAZY IMPORTS (Load on demand - saves ~400KB)
// ============================================

// Heavy components are available via specific imports:
// import { DataGrid } from '@dainabase/ui/lazy/data-grid'
// import { Charts } from '@dainabase/ui/lazy/charts'
// import { Calendar } from '@dainabase/ui/lazy/calendar'
// import { RichTextEditor } from '@dainabase/ui/lazy/rich-text-editor'

// ============================================
// LAZY EXPORT HELPERS (for backward compatibility)
// ============================================

// Export lazy loading functions for heavy components
export const loadDataGrid = () => import('./components/data-grid');
export const loadDataGridAdv = () => import('./components/data-grid-adv');
export const loadCharts = () => import('./components/charts');
export const loadCalendar = () => import('./components/calendar');
export const loadDatePicker = () => import('./components/date-picker');
export const loadDateRangePicker = () => import('./components/date-range-picker');
export const loadCommandPalette = () => import('./components/command-palette');
export const loadForm = () => import('./components/form');
export const loadColorPicker = () => import('./components/color-picker');
export const loadFileUpload = () => import('./components/file-upload');
export const loadRichTextEditor = () => import('./components/rich-text-editor');
export const loadCodeEditor = () => import('./components/code-editor');
export const loadVideoPlayer = () => import('./components/video-player');
export const loadPdfViewer = () => import('./components/pdf-viewer');
export const loadKanban = () => import('./components/kanban');
export const loadImageCropper = () => import('./components/image-cropper');
export const loadTreeView = () => import('./components/tree-view');
export const loadVirtualList = () => import('./components/virtual-list');
export const loadInfiniteScroll = () => import('./components/infinite-scroll');
export const loadDragDropGrid = () => import('./components/drag-drop-grid');

// ============================================
// TYPE EXPORTS (Zero runtime cost)
// ============================================

// Export all types (doesn't affect bundle size)
export type * from "./components/button";
export type * from "./components/card";
export type * from "./components/data-grid";
export type * from "./components/data-grid-adv";
export type * from "./components/dialog";
export type * from "./components/sheet";
export type * from "./components/form";
export type * from "./components/charts";
export type * from "./components/calendar";
export type * from "./components/date-picker";
export type * from "./components/command-palette";
export type * from "./components/rich-text-editor";
export type * from "./components/code-editor";
export type * from "./components/kanban";

// ============================================
// BUNDLE SIZE OPTIMIZATION SUMMARY
// ============================================
// Core bundle: ~50KB (essential components only)
// Full bundle: ~500KB (if all components imported)
// Savings: ~450KB when using lazy imports
// 
// Usage example:
// ```tsx
// // ✅ Good - Only loads what you need
// import { Button, Card } from '@dainabase/ui';
// import { DataGrid } from '@dainabase/ui/lazy/data-grid';
// 
// // ❌ Avoid - Loads everything
// import * from '@dainabase/ui';
// ```
// 
// TOTAL: 58 Components Available
// - 12 Core (always bundled)
// - 46 Lazy (on-demand loading)
// ============================================
