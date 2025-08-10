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
export * from "./components/tooltip";

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

// Feedback & Display
export * from "./components/skeleton";
export * from "./components/progress";
export * from "./components/badge";
export * from "./components/avatar";

// Theming
export * from "./theme/ThemeProvider";
export * from "./components/theme-toggle";

// Charts
export * from "./components/charts";

// Export Tailwind config for external usage (si nécessaire)
// export { default as tailwindConfig } from "../tailwind.config";
