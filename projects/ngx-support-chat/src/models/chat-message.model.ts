/**
 * Core chat message interface and related types.
 */

import { FileContent, ImageContent, MessageContent, SystemContent, TextContent } from './content-types.model';

/**
 * Message type discriminator.
 */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * Message delivery status.
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Core chat message interface.
 * Uses discriminated union pattern for type-safe content handling.
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message type discriminator */
  type: MessageType;
  /** Sender's unique identifier */
  senderId: string;
  /** Sender's display name */
  senderName: string;
  /** Optional sender avatar URL */
  senderAvatar?: string;
  /** Message timestamp */
  timestamp: Date;
  /** Delivery status */
  status: MessageStatus;
  /** Message content, type depends on message type */
  content: MessageContent;
}

/**
 * Type guard for text messages.
 */
export function isTextMessage(message: ChatMessage): message is ChatMessage & { type: 'text'; content: TextContent } {
  return message.type === 'text';
}

/**
 * Type guard for image messages.
 */
export function isImageMessage(
  message: ChatMessage
): message is ChatMessage & { type: 'image'; content: ImageContent } {
  return message.type === 'image';
}

/**
 * Type guard for file messages.
 */
export function isFileMessage(message: ChatMessage): message is ChatMessage & { type: 'file'; content: FileContent } {
  return message.type === 'file';
}

/**
 * Type guard for system messages.
 */
export function isSystemMessage(
  message: ChatMessage
): message is ChatMessage & { type: 'system'; content: SystemContent } {
  return message.type === 'system';
}
