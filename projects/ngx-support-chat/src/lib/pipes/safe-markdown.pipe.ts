/**
 * Pipe for safely rendering markdown content.
 * Falls back to plain text when markdown is disabled or ngx-markdown is not installed.
 */

import { inject, InjectionToken, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ChatConfigService } from '../services/chat-config.service';

/**
 * Minimal interface for ngx-markdown's MarkdownService.
 * Used for optional dependency injection.
 */
export interface MarkdownServiceLike {
  parse(markdown: string): string;
}

/**
 * Injection token for optional markdown service.
 * ngx-markdown consumers should provide their MarkdownService with this token.
 *
 * @example
 * ```typescript
 * import { MarkdownService } from 'ngx-markdown';
 * import { MARKDOWN_SERVICE } from 'ngx-support-chat';
 *
 * providers: [
 *   { provide: MARKDOWN_SERVICE, useExisting: MarkdownService }
 * ]
 * ```
 */
export const MARKDOWN_SERVICE = new InjectionToken<MarkdownServiceLike>('MARKDOWN_SERVICE');

/**
 * Transforms markdown text into sanitized HTML.
 * Returns plain text when markdown is disabled or ngx-markdown is unavailable.
 *
 * @example
 * ```html
 * <!-- With markdown enabled and ngx-markdown installed -->
 * <span [innerHTML]="message.content.text | safeMarkdown"></span>
 *
 * <!-- With markdown disabled - returns plain text -->
 * {{ message.content.text | safeMarkdown }}
 * ```
 */
@Pipe({
  name: 'safeMarkdown',
  standalone: true
})
export class SafeMarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly config = inject(ChatConfigService);

  /**
   * Optional markdown service - only available if provided via MARKDOWN_SERVICE token.
   */
  private readonly markdownService = inject(MARKDOWN_SERVICE, { optional: true });

  /**
   * Transforms markdown text to safe HTML.
   *
   * @param text - The markdown text to transform
   * @returns SafeHtml when markdown is rendered, plain string otherwise
   */
  transform(text: string | null | undefined): SafeHtml | string {
    // Handle null/undefined
    if (!text) {
      return '';
    }

    // Check if markdown is enabled in config
    const markdownConfig = this.config.markdown();
    if (!markdownConfig.enabled || !markdownConfig.displayMode) {
      return text;
    }

    // Check if markdown service is available
    if (!this.markdownService) {
      return text;
    }

    try {
      // Render markdown using the provided service
      const rendered = this.markdownService.parse(text);

      // Sanitize and return as SafeHtml
      // Note: bypassSecurityTrustHtml should only be used with trusted/sanitized content.
      // The markdown service is expected to produce sanitized output.
      return this.sanitizer.bypassSecurityTrustHtml(rendered);
    } catch {
      // If markdown parsing fails, return plain text
      return text;
    }
  }
}
