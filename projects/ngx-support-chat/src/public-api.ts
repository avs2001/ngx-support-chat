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

// Components will be exported here as they are created
// export * from './lib/components/chat-container/chat-container.component';
