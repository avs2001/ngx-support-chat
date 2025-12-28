import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

/**
 * Directive that automatically scrolls to bottom when new items are added,
 * but only if the user was already at the bottom.
 *
 * If the user has scrolled up to view older content, new items won't
 * trigger automatic scrolling, preserving the user's scroll position.
 *
 * @example
 * ```html
 * <div class="messages-container" [ngxAutoScroll]="messages()">
 *   @for (message of messages(); track message.id) {
 *     <ngx-message [message]="message" />
 *   }
 * </div>
 * ```
 *
 * @example
 * ```html
 * <!-- Custom threshold for "at bottom" detection -->
 * <div [ngxAutoScroll]="messages()" [ngxAutoScrollThreshold]="200">
 *   ...
 * </div>
 * ```
 */
@Directive({
  selector: '[ngxAutoScroll]',
  standalone: true
})
export class AutoScrollDirective implements AfterViewInit, OnChanges {
  /**
   * Array to watch for changes. When the array changes,
   * scroll to bottom if user was at bottom.
   */
  readonly ngxAutoScroll = input.required<unknown[]>();

  /**
   * Distance from bottom (in pixels) to consider user "at bottom".
   * Default is 100px to account for small scrolls.
   */
  readonly ngxAutoScrollThreshold = input<number>(100);

  private readonly el = inject(ElementRef<HTMLElement>);

  /** Track whether user was at bottom before changes */
  private wasAtBottom = true;

  /** Flag to prevent initial scroll from being blocked */
  private isInitialized = false;

  ngAfterViewInit(): void {
    // Initial scroll to bottom
    this.scrollToBottom();
    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ngxAutoScroll'] && this.isInitialized) {
      // Check if this is actually a new item (array got longer)
      const prev = changes['ngxAutoScroll'].previousValue as unknown[] | undefined;
      const curr = changes['ngxAutoScroll'].currentValue as unknown[];

      // Only auto-scroll if array got longer AND user was at bottom
      if (prev && curr.length > prev.length && this.wasAtBottom) {
        // Use setTimeout to allow DOM to update first
        setTimeout(() => {
          this.scrollToBottom();
        });
      }
    }
  }

  /**
   * Track scroll position to determine if user is at bottom.
   */
  @HostListener('scroll')
  onScroll(): void {
    this.wasAtBottom = this.isAtBottom();
  }

  /**
   * Check if the scroll position is at or near the bottom.
   */
  isAtBottom(): boolean {
    const elem = this.el.nativeElement as HTMLElement;
    const threshold = this.ngxAutoScrollThreshold();

    // scrollTop + clientHeight should be close to scrollHeight
    const distanceFromBottom = elem.scrollHeight - elem.scrollTop - elem.clientHeight;
    return distanceFromBottom <= threshold;
  }

  /**
   * Scroll to the bottom of the container.
   */
  scrollToBottom(): void {
    const elem = this.el.nativeElement as HTMLElement;
    elem.scrollTop = elem.scrollHeight;
    this.wasAtBottom = true;
  }

  /**
   * Force scroll to bottom (can be called externally).
   * This method can be accessed via ViewChild.
   */
  forceScrollToBottom(): void {
    this.scrollToBottom();
  }
}
