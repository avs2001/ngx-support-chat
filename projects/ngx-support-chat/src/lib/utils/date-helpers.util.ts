/**
 * Date utility functions for chat message display.
 * Provides helpers for date comparison and formatting.
 */

/**
 * Checks if the given date is today.
 * @param date - The date to check
 * @returns true if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

/**
 * Checks if the given date is yesterday.
 * @param date - The date to check
 * @returns true if the date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/**
 * Checks if two dates are the same calendar day.
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if both dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Simple date format tokens.
 * Supports: yyyy, MM, M, dd, d, MMMM, MMM, EEEE, EEE
 */
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Formats a date according to the given format string.
 * Supports common tokens: yyyy, MM, M, dd, d, MMMM, MMM, EEEE, EEE
 *
 * @param date - The date to format
 * @param format - The format string (e.g., 'MMMM d, yyyy')
 * @returns The formatted date string
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Build tokens map with unique placeholder keys
  const tokens = new Map<string, string>([
    ['yyyy', String(year)],
    ['MMMM', MONTH_NAMES[month] ?? ''],
    ['MMM', MONTH_NAMES_SHORT[month] ?? ''],
    ['MM', String(month + 1).padStart(2, '0')],
    ['EEEE', DAY_NAMES[dayOfWeek] ?? ''],
    ['EEE', DAY_NAMES_SHORT[dayOfWeek] ?? ''],
    ['dd', String(day).padStart(2, '0')],
    ['d', String(day)],
    ['M', String(month + 1)]
  ]);

  // Use unique placeholders that won't conflict
  const placeholders = new Map<string, string>();
  let placeholderIndex = 0;

  // Replace format tokens with unique placeholders (longest first)
  const tokenOrder = ['yyyy', 'MMMM', 'MMM', 'MM', 'EEEE', 'EEE', 'dd', 'd', 'M'];
  let result = format;

  for (const token of tokenOrder) {
    if (result.includes(token)) {
      const placeholder = `\x00${String(placeholderIndex++)}\x00`;
      placeholders.set(placeholder, tokens.get(token) ?? '');
      result = result.split(token).join(placeholder);
    }
  }

  // Replace placeholders with actual values
  for (const [placeholder, value] of placeholders) {
    result = result.split(placeholder).join(value);
  }

  return result;
}

/**
 * Formats a time according to the given format string.
 * Supports: HH, H, mm, m, ss, s, a
 *
 * @param date - The date/time to format
 * @param format - The format string (e.g., 'HH:mm', 'h:mm a')
 * @returns The formatted time string
 */
export function formatTime(date: Date, format: string): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 < 12 ? 'AM' : 'PM';

  return format
    .replace(/HH/g, String(hours24).padStart(2, '0'))
    .replace(/H/g, String(hours24))
    .replace(/hh/g, String(hours12).padStart(2, '0'))
    .replace(/h/g, String(hours12))
    .replace(/mm/g, String(minutes).padStart(2, '0'))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, String(seconds).padStart(2, '0'))
    .replace(/s/g, String(seconds))
    .replace(/a/g, ampm);
}

/**
 * Gets a relative time string (e.g., "2 minutes ago").
 * Falls back to formatted time after threshold.
 *
 * @param date - The date to compare
 * @param now - Optional current date for testing
 * @returns Relative time string
 */
export function getRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${String(diffMinutes)} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${String(diffHours)} hours ago`;
  }

  // Fallback to time format for older messages
  return formatTime(date, 'HH:mm');
}

/**
 * Gets the start of day for a given date (midnight).
 * @param date - The date
 * @returns New Date set to midnight
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the difference in milliseconds between two dates.
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in milliseconds (absolute value)
 */
export function getTimeDifferenceMs(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime());
}
