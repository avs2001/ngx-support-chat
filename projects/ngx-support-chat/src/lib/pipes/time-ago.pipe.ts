/**
 * Pipe for displaying relative time (e.g., "2 minutes ago").
 */

import { Pipe, PipeTransform } from '@angular/core';

import { getRelativeTime } from '../utils/date-helpers.util';

/**
 * Transforms a date into a human-readable relative time string.
 *
 * This is an impure pipe (`pure: false`) to allow updates as time passes.
 * While impure pipes run on every change detection cycle, the computation
 * is lightweight and the result is cached internally.
 *
 * @example
 * ```html
 * {{ message.timestamp | timeAgo }} <!-- "2 minutes ago" -->
 * {{ '2025-01-01T12:00:00Z' | timeAgo }} <!-- "Just now" or formatted time -->
 * ```
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false
})
export class TimeAgoPipe implements PipeTransform {
  /** Cached last date for comparison */
  private lastDate: Date | null = null;

  /** Cached last result */
  private lastResult: string = '';

  /** Cached timestamp of last calculation */
  private lastCalculationTime: number = 0;

  /** Minimum time between recalculations (5 seconds) */
  private readonly UPDATE_THRESHOLD_MS = 5000;

  /**
   * Transforms a date to a relative time string.
   *
   * @param date - The date to transform (Date object or ISO string)
   * @returns Relative time string (e.g., "2 minutes ago")
   */
  transform(date: Date | string | null | undefined): string {
    // Handle null/undefined
    if (!date) {
      return '';
    }

    // Parse string dates
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    // Validate the date
    if (isNaN(parsedDate.getTime())) {
      return '';
    }

    // Check if we can use cached result
    const now = Date.now();
    if (
      this.lastDate?.getTime() === parsedDate.getTime() &&
      now - this.lastCalculationTime < this.UPDATE_THRESHOLD_MS
    ) {
      return this.lastResult;
    }

    // Calculate relative time using utility function
    const result = getRelativeTime(parsedDate);

    // Cache the result
    this.lastDate = parsedDate;
    this.lastResult = result;
    this.lastCalculationTime = now;

    return result;
  }
}
