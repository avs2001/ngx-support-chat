/*
 * Public API Surface of ngx-support-chat
 */

/**
 * Library version constant
 * @internal
 */
export const NGX_SUPPORT_CHAT_VERSION = '0.0.1';

// Models - also available via 'ngx-support-chat/models'
export * from './models/public-api';

// Tokens - also available via 'ngx-support-chat/tokens'
export * from './tokens/public-api';

// Services
export { ChatConfigService } from './lib/services/chat-config.service';

// Components
export { ChatContainerComponent } from './lib/components/chat-container/chat-container.component';
export { ChatHeaderComponent } from './lib/components/chat-header/chat-header.component';
export { ChatFooterComponent } from './lib/components/chat-footer/chat-footer.component';
export { ChatDateSeparatorComponent } from './lib/components/chat-date-separator/chat-date-separator.component';
export { ChatMessageComponent } from './lib/components/chat-message/chat-message.component';
export { ChatMessageGroupComponent } from './lib/components/chat-message-group/chat-message-group.component';
export { ChatMessageAreaComponent, type MessageAreaItem } from './lib/components/chat-message-area/chat-message-area.component';

// Utilities
export {
  groupMessagesByDate,
  shouldGroupWithPrevious,
  getTotalMessageCount,
  findMessageIndex,
  flattenGroupedMessages,
  type MessageGroup,
  type GroupedMessages,
  DEFAULT_GROUP_THRESHOLD_MS
} from './lib/utils/message-grouping.util';
export {
  formatDate,
  formatTime,
  isToday,
  isYesterday,
  isSameDay,
  startOfDay,
  getTimeDifferenceMs
} from './lib/utils/date-helpers.util';
