import { ChangeDetectionStrategy, Component, ElementRef, input, model, output, ViewChild } from '@angular/core';

import { AutoResizeDirective } from '../../directives/auto-resize.directive';

/**
 * Component for the chat message text input.
 *
 * Features:
 * - Auto-resizing textarea that grows with content
 * - Enter key sends message, Shift+Enter creates newline
 * - Two-way value binding via model signal
 * - Configurable placeholder and max height
 *
 * @example
 * ```html
 * <ngx-chat-input
 *   [(value)]="messageText"
 *   [placeholder]="'Type a message...'"
 *   [maxHeight]="120"
 *   (send)="onSend()"
 * />
 * ```
 */
@Component({
  selector: 'ngx-chat-input',
  standalone: true,
  imports: [AutoResizeDirective],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent {
  /** Two-way bound input value */
  readonly value = model<string>('');

  /** Placeholder text for the input */
  readonly placeholder = input<string>('Type a message...');

  /** Whether the input is disabled */
  readonly disabled = input<boolean>(false);

  /** Maximum height in pixels before scrolling */
  readonly maxHeight = input<number>(120);

  /** Emitted when Enter is pressed (without Shift) */
  readonly send = output();

  /** Reference to the textarea element */
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  /**
   * Handle input events to update the value
   */
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }

  /**
   * Handle keydown events for Enter/Shift+Enter behavior
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send.emit();
    }
    // Shift+Enter allows default behavior (newline)
  }

  /**
   * Focus the textarea programmatically
   */
  focus(): void {
    this.textarea.nativeElement.focus();
  }

  /**
   * Clear the input and reset height
   */
  clear(): void {
    this.value.set('');
    // The auto-resize directive will handle height reset on next input
  }
}
