import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild
} from '@angular/core';

/**
 * Action buttons for the chat footer: send and attach.
 *
 * The send button is enabled only when hasContent is true.
 * The attach button opens a hidden file input for file selection.
 * Supports content projection for additional custom actions.
 *
 * @example
 * ```html
 * <ngx-chat-action-buttons
 *   [hasContent]="hasMessage()"
 *   (send)="onSend()"
 *   (attachmentSelect)="onFilesSelected($event)"
 * >
 *   <button chatFooterActions>Custom Action</button>
 * </ngx-chat-action-buttons>
 * ```
 */
@Component({
  selector: 'ngx-chat-action-buttons',
  standalone: true,
  templateUrl: './chat-action-buttons.component.html',
  styleUrl: './chat-action-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatActionButtonsComponent {
  /** Whether there is content to send (enables send button) */
  readonly hasContent = input.required<boolean>();

  /** Disable all buttons */
  readonly disabled = input<boolean>(false);

  /** Allowed file types (e.g., 'image/*,.pdf') */
  readonly accept = input<string>('');

  /** Emitted when send button is clicked */
  readonly send = output<void>();

  /** Emitted when files are selected via the attach button */
  readonly attachmentSelect = output<File[]>();

  /** Reference to the hidden file input */
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  /**
   * Open the file picker dialog.
   */
  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  /**
   * Handle file selection from the input.
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.attachmentSelect.emit(files);

      // Reset the input so the same file can be selected again
      input.value = '';
    }
  }

  /**
   * Handle send button click.
   */
  onSendClick(): void {
    this.send.emit();
  }
}
