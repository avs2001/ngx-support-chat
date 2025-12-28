import { ChangeDetectionStrategy, Component, computed, input, model, output, viewChild } from '@angular/core';

import {
  Attachment,
  ChatMessage,
  FileContent,
  ImageContent,
  MessageSendEvent,
  QuickReplySet,
  QuickReplySubmitEvent,
  TypingIndicator,
} from '../../../models/public-api';
import { ChatFooterComponent } from '../chat-footer/chat-footer.component';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { ChatMessageAreaComponent } from '../chat-message-area/chat-message-area.component';
import { ChatQuickRepliesComponent } from '../chat-quick-replies/chat-quick-replies.component';
import { ChatTypingIndicatorComponent } from '../chat-typing-indicator/chat-typing-indicator.component';

/**
 * Main container component for the chat interface.
 *
 * This component orchestrates the chat layout and acts as the primary
 * interface between the host application and the chat library.
 * It uses a flexbox column layout with header, message area, and footer sections.
 *
 * @example
 * ```html
 * <ngx-chat-container
 *   [messages]="messages"
 *   [currentUserId]="userId"
 *   [(inputValue)]="messageInput"
 *   (messageSend)="onSendMessage($event)"
 * >
 *   <div chatHeader>Support Chat</div>
 *   <div chatEmptyState>Start a conversation</div>
 * </ngx-chat-container>
 * ```
 */
@Component({
  selector: 'ngx-chat-container',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    ChatFooterComponent,
    ChatMessageAreaComponent,
    ChatQuickRepliesComponent,
    ChatTypingIndicatorComponent
  ],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContainerComponent {
  // ============================================
  // Required Inputs
  // ============================================

  /** Array of chat messages to display */
  readonly messages = input.required<ChatMessage[]>();

  /** Current user's unique identifier for distinguishing own messages */
  readonly currentUserId = input.required<string>();

  // ============================================
  // Optional Inputs
  // ============================================

  /** Typing indicator showing who is currently typing */
  readonly typingIndicator = input<TypingIndicator | null>(null);

  /** Quick reply options to display after the last message */
  readonly quickReplies = input<QuickReplySet | null>(null);

  /** Attachments pending upload in the composer */
  readonly pendingAttachments = input<Attachment[]>([]);

  /** Two-way bound input value for the message composer */
  readonly inputValue = model<string>('');

  /** Whether the chat input is disabled */
  readonly disabled = input<boolean>(false);

  // ============================================
  // Outputs
  // ============================================

  /** Emitted when user sends a message */
  readonly messageSend = output<MessageSendEvent>();

  /** Emitted when user requests retry for a failed message */
  readonly messageRetry = output<ChatMessage>();

  /** Emitted when user selects files to attach */
  readonly attachmentSelect = output<File[]>();

  /** Emitted when user removes a pending attachment */
  readonly attachmentRemove = output<Attachment>();

  /** Emitted when user submits a quick reply */
  readonly quickReplySubmit = output<QuickReplySubmitEvent>();

  /** Emitted when user clicks an image to preview */
  readonly imagePreview = output<ImageContent>();

  /** Emitted when user clicks to download a file */
  readonly fileDownload = output<FileContent>();

  /** Emitted when user scrolls to top (for loading older messages) */
  readonly scrollTop = output();

  // ============================================
  // View Children
  // ============================================

  /** Reference to the footer component */
  private readonly footerComponent = viewChild(ChatFooterComponent);

  // ============================================
  // Computed Properties
  // ============================================

  /** Whether there is content to send (text or attachments) */
  protected readonly hasContent = computed(() =>
    this.inputValue().trim().length > 0 || this.pendingAttachments().length > 0
  );

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handles message send from the footer component.
   * Builds the MessageSendEvent and emits it through the messageSend output.
   * Returns focus to the input for accessibility.
   */
  protected onFooterMessageSend(): void {
    const text = this.inputValue().trim();
    const attachments = this.pendingAttachments();

    if (text || attachments.length > 0) {
      this.messageSend.emit({
        text,
        attachments,
      });

      // Return focus to input after send (accessibility)
      this.focusInput();
    }
  }

  /**
   * Handles quick reply submission.
   * Returns focus to input for accessibility.
   */
  protected onQuickReplySubmit(event: QuickReplySubmitEvent): void {
    this.quickReplySubmit.emit(event);

    // Return focus to input after quick reply (accessibility)
    this.focusInput();
  }

  /**
   * Focus the input textarea.
   * Used for accessibility after message send or quick reply submit.
   */
  private focusInput(): void {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      this.footerComponent()?.focusInput();
    });
  }
}
