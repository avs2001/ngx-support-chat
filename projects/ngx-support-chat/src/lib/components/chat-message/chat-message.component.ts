import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { ChatConfigService } from '../../services/chat-config.service';
import { SafeMarkdownPipe } from '../../pipes/safe-markdown.pipe';
import { formatTime } from '../../utils/date-helpers.util';
import {
  ChatMessage,
  isFileMessage,
  isImageMessage,
  isSystemMessage,
  isTextMessage,
  MessageStatus
} from '../../../models/chat-message.model';
import { FileContent, ImageContent } from '../../../models/content-types.model';

/**
 * Component for displaying a single chat message.
 * Handles different message types (text, image, file, system) and statuses.
 * Alignment is determined by whether the message is from the current user.
 */
@Component({
  selector: 'ngx-chat-message',
  standalone: true,
  imports: [NgClass, SafeMarkdownPipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageComponent {
  /** The message to display */
  readonly message = input.required<ChatMessage>();

  /** Whether this message is from the current user (determines alignment) */
  readonly isCurrentUser = input<boolean>(false);

  /** Whether to show the sender avatar */
  readonly showAvatar = input<boolean>(true);

  /** Whether to show the sender name */
  readonly showSenderName = input<boolean>(true);

  /** Whether this is the first message in a group (shows full bubble radius) */
  readonly isFirstInGroup = input<boolean>(true);

  /** Whether this is the last message in a group (shows timestamp/status) */
  readonly isLastInGroup = input<boolean>(true);

  /** Emitted when retry is clicked on a failed message */
  readonly messageRetry = output<string>();

  /** Emitted when an image is clicked for preview */
  readonly imagePreview = output<ImageContent>();

  /** Emitted when a file download is requested */
  readonly fileDownload = output<FileContent>();

  private readonly config = inject(ChatConfigService);

  /** Message type checks */
  readonly isText = computed(() => isTextMessage(this.message()));
  readonly isImage = computed(() => isImageMessage(this.message()));
  readonly isFile = computed(() => isFileMessage(this.message()));
  readonly isSystem = computed(() => isSystemMessage(this.message()));

  /** Formatted timestamp */
  readonly formattedTime = computed(() => {
    return formatTime(this.message().timestamp, this.config.timeFormat());
  });

  /** CSS classes for the message bubble */
  readonly bubbleClasses = computed(() => {
    const msg = this.message();
    const isUser = this.isCurrentUser();

    return {
      'message-bubble': true,
      'message-bubble--user': isUser,
      'message-bubble--other': !isUser && !this.isSystem(),
      'message-bubble--system': this.isSystem(),
      'message-bubble--first': this.isFirstInGroup(),
      'message-bubble--last': this.isLastInGroup(),
      [`message-bubble--${msg.type}`]: true,
      [`message-bubble--${msg.status}`]: true
    };
  });

  /** CSS classes for the message container */
  readonly containerClasses = computed(() => {
    return {
      'message-container': true,
      'message-container--user': this.isCurrentUser(),
      'message-container--other': !this.isCurrentUser() && !this.isSystem(),
      'message-container--system': this.isSystem()
    };
  });

  /** Get text content (for text messages) */
  readonly textContent = computed(() => {
    const msg = this.message();
    if (isTextMessage(msg)) {
      return msg.content.text;
    }
    return '';
  });

  /** Get image content (for image messages) */
  readonly imageContent = computed(() => {
    const msg = this.message();
    if (isImageMessage(msg)) {
      return msg.content;
    }
    return null;
  });

  /** Get file content (for file messages) */
  readonly fileContent = computed(() => {
    const msg = this.message();
    if (isFileMessage(msg)) {
      return msg.content;
    }
    return null;
  });

  /** Get system content (for system messages) */
  readonly systemContent = computed(() => {
    const msg = this.message();
    if (isSystemMessage(msg)) {
      return msg.content.text;
    }
    return '';
  });

  /** Format file size to human-readable string */
  formatFileSize(bytes: number | undefined): string {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'] as const;
    const base = 1024;
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);
    const value = bytes / Math.pow(base, exponent);
    const unit = units[exponent] ?? 'B';

    return `${value.toFixed(exponent > 0 ? 1 : 0)} ${unit}`;
  }

  /** Handle retry click for failed messages */
  onRetryClick(): void {
    if (this.message().status === 'failed') {
      this.messageRetry.emit(this.message().id);
    }
  }

  /** Handle image click for preview */
  onImageClick(): void {
    const content = this.imageContent();
    if (content) {
      this.imagePreview.emit(content);
    }
  }

  /** Handle file download click */
  onFileDownloadClick(): void {
    const content = this.fileContent();
    if (content) {
      this.fileDownload.emit(content);
    }
  }

  /** Get status indicator icon name */
  readonly statusIcon = computed((): string => {
    const status: MessageStatus = this.message().status;
    switch (status) {
      case 'sending':
        return 'clock';
      case 'sent':
        return 'check';
      case 'delivered':
        return 'check-double';
      case 'read':
        return 'check-double-filled';
      case 'failed':
        return 'x';
    }
  });

  /** Whether to show retry button */
  readonly showRetry = computed(() => {
    return this.message().status === 'failed' && this.isCurrentUser();
  });

  /** Maximum image width for display */
  readonly imageMaxWidth = computed(() => {
    const content = this.imageContent();
    if (content?.width) {
      return Math.min(content.width, 280);
    }
    return 280;
  });

  /** Aria label for screen readers */
  readonly ariaLabel = computed(() => {
    const msg = this.message();
    const time = this.formattedTime();
    const contentSummary = this.getContentSummary();
    return `${msg.senderName} at ${time}: ${contentSummary}`;
  });

  /** Get a summary of the message content for accessibility */
  private getContentSummary(): string {
    const msg = this.message();

    if (isTextMessage(msg)) {
      const text = msg.content.text;
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }

    if (isImageMessage(msg)) {
      return msg.content.altText ? `Image: ${msg.content.altText}` : 'Image';
    }

    if (isFileMessage(msg)) {
      return `File: ${msg.content.fileName}`;
    }

    if (isSystemMessage(msg)) {
      return msg.content.text;
    }

    return 'Message';
  }
}
