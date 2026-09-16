import { format, isValid } from 'date-fns';

/**
 * Safely formats a date string. Returns '—' if the date is missing or invalid.
 */
export const safeFormat = (dateStr: string | null | undefined, pattern: string): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (!isValid(d)) return '—';
  return format(d, pattern);
};
