/**
 * Internationalization formatters for @dainabase/ui
 * Provides formatting utilities for dates, numbers, and currencies
 */

// Supported locales
export const SUPPORTED_LOCALES = [
  'en-US',
  'fr-FR',
  'de-DE',
  'es-ES',
  'it-IT',
  'pt-BR',
  'zh-CN',
  'ja-JP',
  'ar-SA',
  'he-IL',
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

// Currency codes
export const CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  CHF: 'CHF',
  CAD: 'CA$',
  AUD: 'A$',
  BRL: 'R$',
  INR: '₹',
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
  currency: CurrencyCode = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number with locale-specific formatting
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
  decimals: number = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a date
 */
export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Format a file size
 */
export function formatFileSize(
  bytes: number,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${formatNumber(size, locale, { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
}

/**
 * Get the text direction for a locale
 */
export function getTextDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return ['ar-SA', 'he-IL'].includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Format a list of items
 */
export function formatList(
  items: string[],
  locale: SupportedLocale = DEFAULT_LOCALE,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  return new Intl.ListFormat(locale, { type }).format(items);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const pr = new Intl.PluralRules(locale);
  const rule = pr.select(count);
  
  if (rule === 'one') {
    return singular;
  }
  
  return plural || `${singular}s`;
}

/**
 * Format a duration in seconds to a human-readable string
 */
export function formatDuration(
  seconds: number,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
