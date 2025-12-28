import { ChangeDetectionStrategy, Component, input, model, output, viewChild } from '@angular/core';

import { Attachment } from '../../../models/public-api';
import { ChatActionButtonsComponent } from '../chat-action-buttons/chat-action-buttons.component';
import { ChatAttachmentPreviewComponent } from '../chat-attachment-preview/chat-attachment-preview.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

/**
 * Footer component for the chat interface.
 *
 * This component provides the container for the message input area,
 * attachment previews, and action buttons. It supports content projection
 * for custom prefix and action elements.
 *
 * @example
 * ```html
 * <ngx-chat-footer
 *   [pendingAttachments]="attachments"
 *   [(inputValue)]="messageText"
 *   (messageSend)="onSend()"
 *   (attachmentSelect)="onFileSelect($event)"
 * >
 *   <button chatFooterPrefix>Emoji</button>
 *   <button chatFooterActions>Voice</button>
 * </ngx-chat-footer>
 * ```
 */
@Component({
  selector: 'ngx-chat-footer',
  standalone: true,
  imports: [ChatInputComponent, ChatAttachmentPreviewComponent, ChatActionButtonsComponent],
  templateUrl: './chat-footer.component.html',
  styleUrl: './chat-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatFooterComponent {
  // ============================================
  // Inputs
  // ============================================

  /** Attachments pending upload */
  readonly pendingAttachments = input<Attachment[]>([]);

  /** Two-way bound input value for the message composer */
  readonly inputValue = model<string>('');

  /** Whether the footer input is disabled */
  readonly disabled = input<boolean>(false);

  /** Whether there is content in the input (used for send button state) */
  readonly hasContent = input<boolean>(false);

  // ============================================
  // Outputs
  // ============================================

  /** Emitted when user triggers send action */
  readonly messageSend = output();

  /** Emitted when user selects files to attach */
  readonly attachmentSelect = output<File[]>();

  /** Emitted when user removes a pending attachment */
  readonly attachmentRemove = output<Attachment>();

  // ============================================
  // View Children
  // ============================================

  /** Reference to the input component */
  private readonly inputComponent = viewChild(ChatInputComponent);

  // ============================================
  // Public Methods
  // ============================================

  /**
   * Focus the input textarea.
   * Used for accessibility - returning focus after message send or quick reply.
   */
  focusInput(): void {
    this.inputComponent()?.focus();
  }
}
