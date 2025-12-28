/**
 * Service for accessing chat configuration.
 */

import { computed, inject, Injectable, Signal } from '@angular/core';

import {
  CHAT_CONFIG,
  ChatConfig,
  DateSeparatorLabels,
  DEFAULT_CHAT_CONFIG,
  MarkdownConfig
} from '../../tokens/chat-config.token';

/**
 * Service providing access to chat configuration.
 * Exposes configuration as signals for reactive consumption.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatConfigService {
  private readonly config: ChatConfig = inject(CHAT_CONFIG, { optional: true }) ?? DEFAULT_CHAT_CONFIG;

  /** Markdown configuration */
  readonly markdown: Signal<MarkdownConfig> = computed(() => this.config.markdown);

  /** Date format string */
  readonly dateFormat: Signal<string> = computed(() => this.config.dateFormat);

  /** Time format string */
  readonly timeFormat: Signal<string> = computed(() => this.config.timeFormat);

  /** Date separator labels */
  readonly dateSeparatorLabels: Signal<DateSeparatorLabels> = computed(() => this.config.dateSeparatorLabels);

  /** Full configuration object */
  readonly fullConfig: Signal<ChatConfig> = computed(() => this.config);
}
