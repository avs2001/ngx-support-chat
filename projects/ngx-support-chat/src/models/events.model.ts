/**
 * Event interfaces for component outputs.
 */

import { Attachment } from './attachment.model';
import { QuickReplyType } from './quick-reply.model';

/**
 * Event emitted when user sends a message.
 */
export interface MessageSendEvent {
  /** The message text */
  text: string;
  /** Any attached files */
  attachments: Attachment[];
}

/**
 * Event emitted when user submits a quick reply.
 */
export interface QuickReplySubmitEvent {
  /** The type of quick reply that was submitted */
  type: QuickReplyType;
  /** The selected value(s) */
  value: unknown;
}
