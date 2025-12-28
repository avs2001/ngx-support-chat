/**
 * Pipe for formatting byte values as human-readable file sizes.
 */

import { Pipe, PipeTransform } from '@angular/core';

/** Size units for file size display */
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Base for size calculations (1024 bytes = 1 KB) */
const SIZE_BASE = 1024;

/**
 * Transforms a byte value into a human-readable file size string.
 *
 * @example
 * ```html
 * {{ 1024 | fileSize }} <!-- "1 KB" -->
 * {{ 1536 | fileSize:2 }} <!-- "1.50 KB" -->
 * {{ 1048576 | fileSize:0 }} <!-- "1 MB" -->
 * ```
 */
@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  /**
   * Transforms bytes to human-readable format.
   *
   * @param bytes - The number of bytes (null/undefined treated as 0)
   * @param decimals - Number of decimal places (default: 1)
   * @returns Formatted string with unit (e.g., "1.5 KB")
   */
  transform(bytes: number | null | undefined, decimals: number = 1): string {
    // Handle edge cases
    if (bytes === null || bytes === undefined || bytes === 0) {
      return '0 B';
    }

    // Handle negative values
    if (bytes < 0) {
      return '0 B';
    }

    // Ensure decimals is non-negative
    const decimalPlaces = Math.max(0, Math.floor(decimals));

    // Calculate the appropriate unit index
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(SIZE_BASE));
    const clampedIndex = Math.min(unitIndex, SIZE_UNITS.length - 1);

    // Calculate the value in the appropriate unit
    const value = bytes / Math.pow(SIZE_BASE, clampedIndex);

    // Format the value with specified precision
    const formattedValue = value.toFixed(decimalPlaces);

    // Clean up the display value:
    // - If decimal part is all zeros (e.g., "256.0" or "10.00"), remove it
    // - Otherwise keep the decimal part as-is (e.g., "1.50" stays "1.50")
    let displayValue = formattedValue;
    if (decimalPlaces > 0 && formattedValue.includes('.')) {
      const [intPart, decPart] = formattedValue.split('.');
      // Check if decimal part is all zeros
      if (decPart && /^0+$/.test(decPart)) {
        displayValue = intPart ?? formattedValue;
      }
    }

    return `${displayValue} ${SIZE_UNITS[clampedIndex]}`;
  }
}
