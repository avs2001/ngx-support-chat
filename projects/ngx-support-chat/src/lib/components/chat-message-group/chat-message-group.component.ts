import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { FileContent, ImageContent } from '../../../models/content-types.model';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { MessageGroup } from '../../utils/message-grouping.util';

/**
 * Component for displaying a group of consecutive messages from the same sender.
 * Groups are created when messages are from the same sender within a time threshold.
 */
@Component({
  selector: 'ngx-chat-message-group',
  standalone: true,
  imports: [ChatMessageComponent],
  templateUrl: './chat-message-group.component.html',
  styleUrl: './chat-message-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageGroupComponent {
  /** The message group to display */
  readonly group = input.required<MessageGroup>();

  /** Whether to show avatars */
  readonly showAvatar = input<boolean>(true);

  /** Whether to show sender names */
  readonly showSenderName = input<boolean>(true);

  /** Emitted when retry is clicked on a failed message */
  readonly messageRetry = output<string>();

  /** Emitted when an image is clicked for preview */
  readonly imagePreview = output<ImageContent>();

  /** Emitted when a file download is requested */
  readonly fileDownload = output<FileContent>();

  /**
   * Track messages by their ID for efficient rendering.
   */
  trackByMessageId(_index: number, message: { id: string }): string {
    return message.id;
  }

  /**
   * Determines if a message is the first in the group.
   */
  isFirst(index: number): boolean {
    return index === 0;
  }

  /**
   * Determines if a message is the last in the group.
   */
  isLast(index: number): boolean {
    return index === this.group().messages.length - 1;
  }
}
