import { tokens } from "../../tokens";

// Palette par défaut basée sur les tokens
export const defaultPalette = [
  tokens.colors.primary.DEFAULT,
  tokens.colors.secondary.DEFAULT,
  tokens.colors.accent.DEFAULT,
  "#34C759", // green apple
  "#FF375F", // pink
  "#AC8E68"  // gold-ish
];

export function colorAt(i: number) {
  return defaultPalette[i % defaultPalette.length];
}