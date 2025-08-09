// packages/ui/src/index.ts
// Central export point for the Design System

// Export tokens
export { tokens } from '../tokens';
export type { Tokens } from '../tokens';

// Components exports
export * from './components/button';
export * from './components/card';
export * from './components/data-grid';

// Export Tailwind config for external usage
export { default as tailwindConfig } from '../tailwind.config';