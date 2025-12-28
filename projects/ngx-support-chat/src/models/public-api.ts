/**
 * Public API for ngx-support-chat/models secondary entry point.
 */

// Content types
export type { FileContent, ImageContent, MessageContent, SystemContent, TextContent } from './content-types.model';

// Chat message
export type { ChatMessage, MessageStatus, MessageType } from './chat-message.model';
export { isFileMessage, isImageMessage, isSystemMessage, isTextMessage } from './chat-message.model';

// Quick replies
export type { QuickReplyOption, QuickReplySet, QuickReplyType } from './quick-reply.model';

// Typing indicator
export type { TypingIndicator } from './typing-indicator.model';

// Attachment
export type { Attachment } from './attachment.model';

// Events
export type { MessageSendEvent, QuickReplySubmitEvent } from './events.model';
