import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Attachment } from '../../../models/public-api';

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
}
