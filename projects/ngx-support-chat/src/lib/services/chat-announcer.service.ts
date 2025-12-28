/**
 * Service for screen reader announcements using Angular CDK LiveAnnouncer.
 */

import { inject, Injectable } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import {
  ChatMessage,
  FileContent,
  ImageContent,
  isFileMessage,
  isImageMessage,
  isSystemMessage,
  isTextMessage,
  MessageStatus,
  QuickReplyOption,
  TextContent,
  TypingIndicator
} from '../../models/public-api';
import { ChatConfig, DEFAULT_CHAT_CONFIG } from '../../tokens/chat-config.token';
import { formatTime } from '../utils/date-helpers.util';

/**
 * Centralized service for screen reader announcements.
 * Uses Angular CDK LiveAnnouncer to provide accessible notifications
 * for chat events without disrupting user focus.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatAnnouncerService {
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  /** Tracks the last typing announcement to prevent duplicates */
  private lastTypingUserId = '';

  /**
   * Announces a new message with sender, time, and content summary.
   * Uses 'polite' politeness level to avoid interrupting screen reader.
   *
   * @param message - The chat message to announce
   * @param config - Optional chat configuration for formatting
   */
  announceMessage(message: ChatMessage, config: ChatConfig = DEFAULT_CHAT_CONFIG): void {
    const time = formatTime(message.timestamp, config.timeFormat);
    const contentSummary = this.getContentSummary(message);
    const announcement = `${message.senderName} at ${time}: ${contentSummary}`;

    void this.liveAnnouncer.announce(announcement, 'polite');
  }

  /**
   * Announces when a user starts typing.
   * Only announces once per typing session to avoid repetition.
   *
   * @param indicator - The typing indicator to announce
   */
  announceTyping(indicator: TypingIndicator): void {
    // Prevent duplicate announcements for the same user
    if (this.lastTypingUserId === indicator.userId) {
      return;
    }

    this.lastTypingUserId = indicator.userId;
    const announcement = `${indicator.userName} is typing`;
    void this.liveAnnouncer.announce(announcement, 'polite');
  }

  /**
   * Clears the typing announcement state.
   * Call this when typing stops to allow re-announcement.
   */
  clearTypingState(): void {
    this.lastTypingUserId = '';
  }

  /**
   * Announces message status changes (sent, delivered, read).
   * Uses 'polite' politeness level for non-urgent updates.
   *
   * @param message - The message with updated status
   * @param oldStatus - The previous status for comparison
   */
  announceStatusChange(message: ChatMessage, oldStatus: MessageStatus): void {
    // Only announce significant status changes
    if (message.status === oldStatus) {
      return;
    }

    const statusLabel = this.getStatusLabel(message.status);
    const announcement = `Message ${statusLabel}`;
    void this.liveAnnouncer.announce(announcement, 'polite');
  }

  /**
   * Announces when a quick reply option is selected.
   * Provides confirmation feedback to screen reader users.
   *
   * @param option - The selected quick reply option
   */
  announceQuickReplySelection(option: QuickReplyOption): void {
    const announcement = `Selected: ${option.label}`;
    void this.liveAnnouncer.announce(announcement, 'polite');
  }

  /**
   * Announces submission of quick replies.
   *
   * @param options - Array of selected options
   */
  announceQuickReplySubmit(options: QuickReplyOption[]): void {
    if (options.length === 1 && options[0]) {
      void this.liveAnnouncer.announce(`Submitted: ${options[0].label}`, 'assertive');
    } else if (options.length > 1) {
      const labels = options.map(o => o.label).join(', ');
      void this.liveAnnouncer.announce(`Submitted: ${labels}`, 'assertive');
    }
  }

  /**
   * Generates a content summary for screen reader announcement.
   * Handles different message types appropriately.
   */
  private getContentSummary(message: ChatMessage): string {
    if (isTextMessage(message)) {
      const text = (message.content as TextContent).text;
      // Truncate long messages
      if (text.length > 100) {
        return text.substring(0, 100) + '...';
      }
      return text;
    }

    if (isImageMessage(message)) {
      const content = message.content as ImageContent;
      if (content.altText) {
        return `Image: ${content.altText}`;
      }
      return `Image from ${message.senderName}`;
    }

    if (isFileMessage(message)) {
      const content = message.content as FileContent;
      const size = content.fileSize ? this.formatFileSize(content.fileSize) : '';
      return size ? `${content.fileName}, ${size}` : content.fileName;
    }

    if (isSystemMessage(message)) {
      return (message.content as { text: string }).text;
    }

    return 'Message';
  }

  /**
   * Converts message status to human-readable label.
   */
  private getStatusLabel(status: MessageStatus): string {
    switch (status) {
      case 'sending':
        return 'sending';
      case 'sent':
        return 'sent';
      case 'delivered':
        return 'delivered';
      case 'read':
        return 'read';
      case 'failed':
        return 'failed to send';
      default:
        return 'updated';
    }
  }

  /**
   * Formats file size to human-readable string.
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${String(bytes)} bytes`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} kilobytes`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} megabytes`;
  }
}
