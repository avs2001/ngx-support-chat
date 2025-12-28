/**
 * Chat configuration injection token and related types.
 */

import { InjectionToken, Provider } from '@angular/core';

/**
 * Markdown configuration options.
 */
export interface MarkdownConfig {
  /** Whether markdown support is enabled */
  enabled: boolean;
  /** Whether to render markdown in messages */
  displayMode: boolean;
  /** Whether to allow markdown in input */
  inputMode: boolean;
}

/**
 * Date separator label configuration.
 */
export interface DateSeparatorLabels {
  /** Label for today's messages */
  today: string;
  /** Label for yesterday's messages */
  yesterday: string;
}

/**
 * Chat configuration interface.
 */
export interface ChatConfig {
  /** Markdown rendering options */
  markdown: MarkdownConfig;
  /** Date format string (e.g., 'MMM d, yyyy') */
  dateFormat: string;
  /** Time format string (e.g., 'HH:mm') */
  timeFormat: string;
  /** Labels for date separators */
  dateSeparatorLabels: DateSeparatorLabels;
}

/**
 * Default chat configuration.
 */
export const DEFAULT_CHAT_CONFIG: ChatConfig = {
  markdown: {
    enabled: false,
    displayMode: false,
    inputMode: false
  },
  dateFormat: 'MMMM d, yyyy',
  timeFormat: 'HH:mm',
  dateSeparatorLabels: {
    today: 'Today',
    yesterday: 'Yesterday'
  }
};

/**
 * Injection token for chat configuration.
 */
export const CHAT_CONFIG = new InjectionToken<ChatConfig>('CHAT_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_CHAT_CONFIG
});

/**
 * Deep merge utility for configuration objects.
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as object, sourceValue as object) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Provider factory for chat configuration.
 * Merges provided config with defaults.
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideChatConfig({
 *       markdown: { enabled: true, displayMode: true },
 *       dateFormat: 'dd/MM/yyyy'
 *     })
 *   ]
 * };
 * ```
 */
export function provideChatConfig(config?: Partial<ChatConfig>): Provider {
  return {
    provide: CHAT_CONFIG,
    useValue: config ? deepMerge(DEFAULT_CHAT_CONFIG, config) : DEFAULT_CHAT_CONFIG
  };
}
