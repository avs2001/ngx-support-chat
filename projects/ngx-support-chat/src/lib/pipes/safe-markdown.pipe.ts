/**
 * Pipe for safely rendering markdown content.
 * Falls back to plain text when markdown is disabled or ngx-markdown is not installed.
 */

import { inject, InjectionToken, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { from, isObservable, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ChatConfigService } from '../services/chat-config.service';

/**
 * Minimal interface for ngx-markdown's MarkdownService.
 * Used for optional dependency injection.
 * Supports both sync (string) and async (Promise<string>) implementations.
 */
export interface MarkdownServiceLike {
  parse(markdown: string): string | Promise<string>;
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
 * Returns an Observable to support async markdown parsing (marked v5+).
 * Use with the async pipe in templates.
 *
 * @example
 * ```html
 * <!-- With markdown enabled and ngx-markdown installed -->
 * <span [innerHTML]="message.content.text | safeMarkdown | async"></span>
 *
 * <!-- With markdown disabled - returns plain text -->
 * <span>{{ message.content.text | safeMarkdown | async }}</span>
 * ```
 */
@Pipe({
  name: 'safeMarkdown',
  standalone: true,
  pure: false // Required for async pipe integration
})
export class SafeMarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly config = inject(ChatConfigService);

  /**
   * Optional markdown service - only available if provided via MARKDOWN_SERVICE token.
   */
  private readonly markdownService = inject(MARKDOWN_SERVICE, { optional: true });

  /**
   * Cache to avoid re-processing the same input.
   * Maps input text to Observable result.
   */
  private cachedInput: string | null = null;
  private cachedResult$: Observable<SafeHtml | string> | null = null;

  /**
   * Transforms markdown text to safe HTML.
   *
   * @param text - The markdown text to transform
   * @returns Observable of SafeHtml when markdown is rendered, plain string otherwise
   */
  transform(text: string | null | undefined): Observable<SafeHtml | string> {
    // Handle null/undefined
    if (!text) {
      return of('');
    }

    // Return cached result if input hasn't changed
    if (text === this.cachedInput && this.cachedResult$) {
      return this.cachedResult$;
    }

    // Check if markdown is enabled in config
    const markdownConfig = this.config.markdown();
    if (!markdownConfig.enabled || !markdownConfig.displayMode) {
      return of(text);
    }

    // Check if markdown service is available
    if (!this.markdownService) {
      return of(text);
    }

    // Cache the input
    this.cachedInput = text;

    try {
      // Render markdown using the provided service
      const rendered = this.markdownService.parse(text);

      // Handle both sync (string) and async (Promise<string>) results
      const rendered$: Observable<string> = this.isPromise(rendered)
        ? from(rendered)
        : of(rendered);

      // Sanitize and return as SafeHtml
      this.cachedResult$ = rendered$.pipe(
        map(html => this.sanitizer.bypassSecurityTrustHtml(html)),
        catchError(() => of(text))
      );

      return this.cachedResult$;
    } catch {
      // If markdown parsing fails, return plain text
      return of(text);
    }
  }

  /**
   * Type guard to check if value is a Promise.
   */
  private isPromise<T>(value: T | Promise<T>): value is Promise<T> {
    return value !== null && typeof value === 'object' && typeof (value as Promise<T>).then === 'function';
  }
}
