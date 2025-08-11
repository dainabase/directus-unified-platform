// packages/ui/src/index.ts
// Central export point for the Design System

// Tokens
export { tokens } from "../tokens";
export type { Tokens } from "../tokens";

// Core & Layout
export * from "./components/button";
export * from "./components/card";
export * from "./components/app-shell";
export * from "./components/tabs";
export * from "./components/breadcrumbs";
export * from "./components/dropdown-menu";
export * from "./components/toast";
export * from "./components/icon";

// Data
export * from "./components/data-grid";
export * from "./components/data-grid-adv";
export { DataGridOptimized } from "./components/data-grid/data-grid-optimized";
export type { DataGridOptimizedProps } from "./components/data-grid/data-grid-optimized";

// Overlays & Interactions
export * from "./components/dialog";
export * from "./components/sheet";
export * from "./components/command-palette";
export * from "./components/popover";

// Date & Time
export * from "./components/date-picker";
export * from "./components/calendar";
export * from "./components/date-range-picker";

// Forms
export * from "./components/form";
export * from "./components/input";
export * from "./components/textarea";
export * from "./components/select";
export * from "./components/switch";
export * from "./components/checkbox";

// Theming
export * from "./theme/ThemeProvider";
export * from "./components/theme-toggle";

// Charts
export * from "./components/charts";

// UI Elements (v0.4.0)
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/progress";
export * from "./components/skeleton";
export * from "./components/tooltip";

// New Components (v1.0.0)
export * from "./components/accordion";
export * from "./components/slider";
export * from "./components/rating";
export * from "./components/timeline";
export * from "./components/stepper";
export * from "./components/pagination";
export * from "./components/carousel";
export * from "./components/color-picker";
export * from "./components/file-upload";

// New Components (v1.0.1 - Sprint 1 Improvements)
export * from "./components/alert";
export * from "./components/alert-dialog";
export * from "./components/tag-input";

// New Components (v1.0.2 - Sprint 2 Additions)
export * from "./components/drawer";
export * from "./components/tree-view";
export * from "./components/mentions";
export * from "./components/search-bar";
export * from "./components/timeline-enhanced";

// i18n Provider (Sprint 2)
export * from "./providers/i18n-provider";

// Utilities
export { cn } from "./lib/utils";

// Export Tailwind config for external usage
// export { default as tailwindConfig } from "../tailwind.config";
