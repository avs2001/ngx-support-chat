import { AfterViewInit, Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';

/**
 * Directive that automatically resizes a textarea element to fit its content.
 *
 * The textarea will grow as the user types, up to the specified maximum height.
 * When the max height is reached, the textarea becomes scrollable.
 *
 * @example
 * ```html
 * <textarea [ngxAutoResize]="120" placeholder="Type here..."></textarea>
 * ```
 *
 * @example
 * ```html
 * <!-- Default max height of 120px -->
 * <textarea ngxAutoResize placeholder="Type here..."></textarea>
 * ```
 */
@Directive({
  selector: '[ngxAutoResize]',
  standalone: true
})
export class AutoResizeDirective implements OnInit, AfterViewInit {
  /**
   * Maximum height in pixels that the textarea can grow to.
   * Once this height is reached, the textarea becomes scrollable.
   * Default is 120px.
   */
  readonly ngxAutoResize = input<number | ''>(120);

  private readonly el = inject(ElementRef<HTMLTextAreaElement>);

  /** Get the effective max height (handle empty string from attribute-only usage) */
  private get maxHeight(): number {
    const value = this.ngxAutoResize();
    return typeof value === 'number' ? value : 120;
  }

  ngOnInit(): void {
    this.setupStyles();
  }

  ngAfterViewInit(): void {
    // Initial resize after view is ready
    this.resize();
  }

  /**
   * Handle input events to resize the textarea
   */
  @HostListener('input')
  onInput(): void {
    this.resize();
  }

  /**
   * Set up initial styles for the textarea
   */
  private setupStyles(): void {
    const textarea = this.el.nativeElement;
    textarea.style.resize = 'none';
    textarea.style.overflowY = 'hidden';
    textarea.style.boxSizing = 'border-box';
  }

  /**
   * Resize the textarea to fit its content
   */
  resize(): void {
    const textarea = this.el.nativeElement;
    const maxHeight = this.maxHeight;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate new height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Toggle overflow based on whether content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  /**
   * Reset the textarea to its minimum height
   */
  reset(): void {
    const textarea = this.el.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
  }
}
