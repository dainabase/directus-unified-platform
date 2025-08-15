// Utility function for className concatenation
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Re-export as default and named
export default cn;
export { cn as classNames };
