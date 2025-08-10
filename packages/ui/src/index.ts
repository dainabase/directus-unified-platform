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

// Overlays & Interactions
export * from "./components/dialog";
export * from "./components/sheet";
export * from "./components/command-palette";
export * from "./components/popover"; // Added for DateRangePicker

// Date & Time
export * from "./components/date-picker";
export * from "./components/calendar"; // ✅ Now implemented!
export * from "./components/date-range-picker"; // ✅ Now implemented!

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

// UI Elements (Reconciled from feat/design-system-apple)
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/progress";
export * from "./components/skeleton";
export * from "./components/tooltip";

// Export Tailwind config for external usage (si nécessaire)
// export { default as tailwindConfig } from "../tailwind.config";