# ngx-support-chat

A pure presentational Angular component library for customer support chat interfaces. Built with Angular 21 signals, OnPush change detection, and comprehensive theming support.

[![npm version](https://badge.fury.io/js/ngx-support-chat.svg)](https://www.npmjs.com/package/ngx-support-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Pure Presentational Components** - All business logic delegated to parent; components handle only UI
- **Signal-Based APIs** - Modern Angular 21 signals for inputs, outputs, and state
- **OnPush Change Detection** - Optimized performance across all components
- **Virtual Scrolling** - Efficient rendering for large message lists via CDK
- **CSS Custom Properties** - 70+ design tokens for complete theming control
- **Markdown Support** - Optional ngx-markdown integration for rich text
- **Accessibility** - WCAG compliant with screen reader support, keyboard navigation
- **Message Grouping** - Automatic grouping by date and sender
- **Quick Replies** - Interactive buttons for guided conversations
- **File Attachments** - Image previews and file upload support
- **Typing Indicators** - Real-time typing status display

## Live Demo

[View the Demo](https://avs2001.github.io/ngx-support-chat/)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
- [Configuration](#configuration)
- [Models & Interfaces](#models--interfaces)
- [Theming](#theming)
- [Pipes](#pipes)
- [Directives](#directives)
- [Utilities](#utilities)
- [Accessibility](#accessibility)
- [Advanced Usage](#advanced-usage)

---

## Installation

### Using ng add (Recommended)

```bash
ng add ngx-support-chat
```

The schematic will:
- Install required peer dependencies (`@angular/cdk`)
- Optionally add `ngx-markdown` for markdown support
- Add CSS tokens import to your global styles

### Manual Installation

```bash
npm install ngx-support-chat @angular/cdk
```

Add CSS tokens to your global styles:

```scss
// styles.scss
@import 'ngx-support-chat/styles/tokens.css';
```

---

## Quick Start

### 1. Configure Providers

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideChatConfig } from 'ngx-support-chat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideChatConfig({
      dateFormat: 'MMM d, yyyy',
      timeFormat: 'HH:mm',
      dateSeparatorLabels: {
        today: 'Today',
        yesterday: 'Yesterday'
      }
    })
  ]
};
```

### 2. Import and Use the Component

```typescript
// app.component.ts
import { Component, signal } from '@angular/core';
import {
  ChatContainerComponent,
  ChatMessage,
  MessageSendEvent
} from 'ngx-support-chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatContainerComponent],
  template: `
    <ngx-chat-container
      [messages]="messages()"
      [currentUserId]="currentUserId"
      [typingIndicator]="typingIndicator()"
      [quickReplies]="quickReplies()"
      [pendingAttachments]="attachments()"
      [(inputValue)]="inputValue"
      (messageSend)="onMessageSend($event)"
      (messageRetry)="onRetry($event)"
      (attachmentSelect)="onFilesSelected($event)"
      (attachmentRemove)="onAttachmentRemove($event)"
      (quickReplySubmit)="onQuickReply($event)"
      (imagePreview)="onImageClick($event)"
      (fileDownload)="onFileDownload($event)"
    >
      <div chatHeader>Support Chat</div>
      <div chatEmptyState>Start a conversation</div>
    </ngx-chat-container>
  `
})
export class AppComponent {
  messages = signal<ChatMessage[]>([]);
  typingIndicator = signal(null);
  quickReplies = signal(null);
  attachments = signal([]);
  inputValue = signal('');
  currentUserId = 'user-1';

  onMessageSend(event: MessageSendEvent) {
    // Handle message send
  }
}
```

---

## Components

### ChatContainerComponent

The main container that orchestrates the complete chat interface.

**Selector:** `ngx-chat-container`

#### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `messages` | `ChatMessage[]` | **Yes** | - | Array of chat messages to display |
| `currentUserId` | `string` | **Yes** | - | Current user's ID (determines message alignment) |
| `typingIndicator` | `TypingIndicator \| null` | No | `null` | Shows who is currently typing |
| `quickReplies` | `QuickReplySet \| null` | No | `null` | Interactive quick reply options |
| `pendingAttachments` | `Attachment[]` | No | `[]` | Files pending upload |
| `inputValue` | `string` | No | `''` | Two-way bound input value |
| `disabled` | `boolean` | No | `false` | Disables the input |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `messageSend` | `MessageSendEvent` | User sends a message |
| `messageRetry` | `ChatMessage` | User retries a failed message |
| `attachmentSelect` | `File[]` | User selects files |
| `attachmentRemove` | `Attachment` | User removes a pending attachment |
| `quickReplySubmit` | `QuickReplySubmitEvent` | User submits a quick reply |
| `imagePreview` | `ImageContent` | User clicks an image |
| `fileDownload` | `FileContent` | User requests file download |
| `scrollTop` | `void` | User scrolls to top (for pagination) |

#### Content Projection

```html
<ngx-chat-container>
  <div chatHeader>Custom Header Content</div>
  <div chatEmptyState>No messages yet</div>
</ngx-chat-container>
```

---

### ChatHeaderComponent

Header container with content projection.

**Selector:** `ngx-chat-header`

```html
<ngx-chat-header>
  <img [src]="agentAvatar" alt="Agent" />
  <span>Support Chat</span>
</ngx-chat-header>
```

---

### ChatMessageAreaComponent

Scrollable message list with virtual scrolling support.

**Selector:** `ngx-chat-message-area`

#### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `messages` | `ChatMessage[]` | **Yes** | - | Messages to display |
| `currentUserId` | `string` | **Yes** | - | Current user's ID |
| `showAvatars` | `boolean` | No | `true` | Show sender avatars |
| `showSenderNames` | `boolean` | No | `true` | Show sender names |
| `itemSize` | `number` | No | `80` | Virtual scroll item size (px) |
| `autoScrollToBottom` | `boolean` | No | `true` | Auto-scroll on new messages |

---

### ChatMessageComponent

Individual message bubble with support for text, image, file, and system messages.

**Selector:** `ngx-chat-message`

#### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `message` | `ChatMessage` | **Yes** | - | The message to display |
| `isCurrentUser` | `boolean` | No | `false` | Aligns message to right |
| `showAvatar` | `boolean` | No | `true` | Show avatar |
| `showSenderName` | `boolean` | No | `true` | Show sender name |
| `isFirstInGroup` | `boolean` | No | `true` | Full bubble radius |
| `isLastInGroup` | `boolean` | No | `true` | Shows timestamp/status |

---

### ChatInputComponent

Auto-resizing textarea for message composition.

**Selector:** `ngx-chat-input`

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `string` | `''` | Two-way bound value |
| `placeholder` | `string` | `'Type a message...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `maxHeight` | `number` | `120` | Max height before scrolling |

#### Outputs

| Output | Description |
|--------|-------------|
| `send` | Enter pressed (without Shift) |

---

### ChatQuickRepliesComponent

Interactive buttons for guided responses.

**Selector:** `ngx-chat-quick-replies`

Supports three types:
- **confirmation** - Single button, immediate submit
- **single-choice** - Radio-style, selection submits
- **multiple-choice** - Checkboxes with Submit button

```html
<ngx-chat-quick-replies
  [quickReplies]="quickReplySet"
  (quickReplySubmit)="onSubmit($event)"
/>
```

---

### ChatTypingIndicatorComponent

Animated typing indicator bubble.

**Selector:** `ngx-chat-typing-indicator`

```html
<ngx-chat-typing-indicator
  [typingIndicator]="{ userId: 'agent-1', userName: 'Support Agent' }"
  [showText]="true"
/>
```

---

### ChatFooterComponent

Container for input, attachments, and action buttons.

**Selector:** `ngx-chat-footer`

```html
<ngx-chat-footer
  [pendingAttachments]="attachments"
  [(inputValue)]="messageText"
  [hasContent]="hasContent()"
  (messageSend)="onSend()"
  (attachmentSelect)="onFiles($event)"
>
  <button chatFooterPrefix>Emoji</button>
  <button chatFooterActions>Voice</button>
</ngx-chat-footer>
```

---

### ChatAttachmentPreviewComponent

Displays pending file attachments as chips.

**Selector:** `ngx-chat-attachment-preview`

```html
<ngx-chat-attachment-preview
  [attachments]="pendingAttachments"
  (attachmentRemove)="onRemove($event)"
/>
```

---

### ChatDateSeparatorComponent

Date divider showing "Today", "Yesterday", or formatted date.

**Selector:** `ngx-chat-date-separator`

```html
<ngx-chat-date-separator [date]="messageDate" />
```

---

## Configuration

### ChatConfig Interface

```typescript
interface ChatConfig {
  markdown: {
    enabled: boolean;      // Enable markdown support
    displayMode: boolean;  // Render markdown in messages
    inputMode: boolean;    // Allow markdown in input
  };
  dateFormat: string;      // e.g., 'MMMM d, yyyy'
  timeFormat: string;      // e.g., 'HH:mm'
  dateSeparatorLabels: {
    today: string;         // Label for today
    yesterday: string;     // Label for yesterday
  };
}
```

### Provider Configuration

```typescript
import { provideChatConfig } from 'ngx-support-chat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideChatConfig({
      markdown: {
        enabled: true,
        displayMode: true,
        inputMode: false
      },
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'h:mm a',
      dateSeparatorLabels: {
        today: 'Aujourd\'hui',
        yesterday: 'Hier'
      }
    })
  ]
};
```

### Markdown Support

To enable markdown rendering, install and configure ngx-markdown:

```bash
npm install ngx-markdown marked
```

```typescript
// app.config.ts
import { provideMarkdown, MarkdownService } from 'ngx-markdown';
import { provideChatConfig, MARKDOWN_SERVICE } from 'ngx-support-chat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMarkdown(),
    { provide: MARKDOWN_SERVICE, useExisting: MarkdownService },
    provideChatConfig({
      markdown: { enabled: true, displayMode: true }
    })
  ]
};
```

---

## Models & Interfaces

### ChatMessage

```typescript
interface ChatMessage {
  id: string;                    // Unique identifier
  type: MessageType;             // 'text' | 'image' | 'file' | 'system'
  senderId: string;              // Sender's ID
  senderName: string;            // Display name
  senderAvatar?: string;         // Avatar URL
  timestamp: Date;               // Message time
  status: MessageStatus;         // 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  content: MessageContent;       // Type-specific content
}
```

### Message Content Types

```typescript
// Text message
interface TextContent {
  text: string;
}

// Image message
interface ImageContent {
  thumbnailUrl: string;
  fullUrl: string;
  altText?: string;
  width?: number;
  height?: number;
}

// File message
interface FileContent {
  fileName: string;
  fileSize?: number;
  fileType: string;
  downloadUrl: string;
  icon?: string;
}

// System message
interface SystemContent {
  text: string;
}
```

### Type Guards

```typescript
import {
  isTextMessage,
  isImageMessage,
  isFileMessage,
  isSystemMessage
} from 'ngx-support-chat';

if (isTextMessage(message)) {
  console.log(message.content.text);
}
```

### QuickReplySet

```typescript
interface QuickReplySet {
  id: string;
  type: QuickReplyType;           // 'confirmation' | 'single-choice' | 'multiple-choice'
  prompt?: string;                // Optional prompt text
  options: QuickReplyOption[];
  submitted: boolean;
  selectedValues?: unknown[];
}

interface QuickReplyOption {
  value: unknown;
  label: string;
  disabled?: boolean;
}
```

### TypingIndicator

```typescript
interface TypingIndicator {
  userId: string;
  userName: string;
  avatar?: string;
}
```

### Attachment

```typescript
interface Attachment {
  id: string;
  file: File;
  previewUrl?: string;      // For image previews
  uploadProgress?: number;  // 0-100
}
```

### Event Types

```typescript
interface MessageSendEvent {
  text: string;
  attachments: Attachment[];
}

interface QuickReplySubmitEvent {
  type: QuickReplyType;
  value: unknown;
}
```

---

## Theming

The library uses CSS custom properties (design tokens) for complete theming control. All tokens use the `--ngx-` prefix.

### Quick Theme Customization

```css
:root {
  /* Primary brand color */
  --ngx-bubble-user-bg: #7c3aed;
  --ngx-button-primary-bg: #7c3aed;
  --ngx-quick-reply-border: #7c3aed;

  /* Dark mode */
  --ngx-chat-bg: #1a1a1a;
  --ngx-chat-message-area-bg: #121212;
}
```

### Available Tokens

#### Color Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ngx-chat-bg` | `#ffffff` | Main container background |
| `--ngx-chat-header-bg` | `#ffffff` | Header background |
| `--ngx-chat-footer-bg` | `#ffffff` | Footer background |
| `--ngx-chat-message-area-bg` | `#f5f5f5` | Message area background |
| `--ngx-bubble-user-bg` | `#0066cc` | User message bubble |
| `--ngx-bubble-user-text` | `#ffffff` | User message text |
| `--ngx-bubble-agent-bg` | `#e8e8e8` | Agent message bubble |
| `--ngx-bubble-agent-text` | `#1a1a1a` | Agent message text |
| `--ngx-bubble-system-bg` | `transparent` | System message background |
| `--ngx-bubble-system-text` | `#666666` | System message text |
| `--ngx-input-bg` | `#ffffff` | Input background |
| `--ngx-input-border` | `#dddddd` | Input border |
| `--ngx-input-focus-border` | `#0066cc` | Input focus border |
| `--ngx-button-primary-bg` | `#0066cc` | Primary button background |
| `--ngx-button-primary-text` | `#ffffff` | Primary button text |
| `--ngx-status-sending` | `#999999` | Sending status color |
| `--ngx-status-sent` | `#666666` | Sent status color |
| `--ngx-status-delivered` | `#0066cc` | Delivered status color |
| `--ngx-status-read` | `#00cc66` | Read status color |
| `--ngx-status-failed` | `#cc0000` | Failed status color |
| `--ngx-quick-reply-bg` | `#ffffff` | Quick reply background |
| `--ngx-quick-reply-border` | `#0066cc` | Quick reply border |
| `--ngx-quick-reply-selected-bg` | `#0066cc` | Selected quick reply |
| `--ngx-typing-indicator-dot` | `#666666` | Typing dots color |
| `--ngx-link-color` | `#0066cc` | Link color |
| `--ngx-timestamp-text` | `#999999` | Timestamp color |

#### Spacing Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ngx-spacing-xs` | `4px` | Extra small spacing |
| `--ngx-spacing-sm` | `8px` | Small spacing |
| `--ngx-spacing-md` | `16px` | Medium spacing |
| `--ngx-spacing-lg` | `24px` | Large spacing |
| `--ngx-spacing-xl` | `32px` | Extra large spacing |
| `--ngx-message-gap` | `8px` | Gap between messages |
| `--ngx-bubble-padding` | `12px 16px` | Message bubble padding |
| `--ngx-header-padding` | `16px` | Header padding |
| `--ngx-footer-padding` | `12px 16px` | Footer padding |

#### Border Radius Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ngx-radius-sm` | `4px` | Small radius |
| `--ngx-radius-md` | `12px` | Medium radius |
| `--ngx-radius-lg` | `16px` | Large radius |
| `--ngx-radius-full` | `9999px` | Full/pill radius |
| `--ngx-bubble-radius` | `16px` | Message bubble radius |
| `--ngx-input-radius` | `20px` | Input field radius |
| `--ngx-button-radius` | `20px` | Button radius |
| `--ngx-avatar-radius` | `50%` | Avatar radius |

#### Typography Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ngx-font-family` | `system-ui, ...` | Font family |
| `--ngx-font-size-xs` | `0.75rem` | Timestamps, metadata |
| `--ngx-font-size-sm` | `0.875rem` | Secondary text |
| `--ngx-font-size-md` | `1rem` | Message text |
| `--ngx-font-size-lg` | `1.125rem` | Headers |
| `--ngx-font-weight-normal` | `400` | Normal weight |
| `--ngx-font-weight-medium` | `500` | Medium weight |
| `--ngx-font-weight-bold` | `600` | Bold weight |
| `--ngx-line-height` | `1.5` | Base line height |

#### Dimension Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ngx-avatar-size` | `36px` | Avatar size |
| `--ngx-max-bubble-width` | `70%` | Max message width |
| `--ngx-input-min-height` | `44px` | Input minimum height |
| `--ngx-input-max-height` | `120px` | Input maximum height |
| `--ngx-button-size` | `44px` | Button size |

#### Animation Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--ngx-transition-duration` | `200ms` | Transition speed |
| `--ngx-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` | Easing function |
| `--ngx-typing-animation-duration` | `1.4s` | Typing dots animation |

### Dark Mode

Apply dark mode using CSS media query or class:

```scss
// Automatic dark mode
@media (prefers-color-scheme: dark) {
  :root {
    --ngx-chat-bg: #1a1a1a;
    --ngx-chat-message-area-bg: #121212;
    --ngx-bubble-agent-bg: #2d2d2d;
    --ngx-bubble-agent-text: #e0e0e0;
    --ngx-input-bg: #2d2d2d;
    --ngx-input-text: #e0e0e0;
    --ngx-input-border: #404040;
    --ngx-separator-line: #404040;
  }
}

// Or with a class
.dark-theme {
  --ngx-chat-bg: #1a1a1a;
  // ... other dark tokens
}
```

### SCSS Mixins

For SCSS projects, import the theme mixins:

```scss
@use 'ngx-support-chat/styles/theme-default' as chat;

:root {
  @include chat.ngx-chat-default-tokens;
}

@media (prefers-color-scheme: dark) {
  :root {
    @include chat.ngx-chat-dark-tokens;
  }
}
```

---

## Pipes

### SafeMarkdownPipe

Transforms markdown text to sanitized HTML. Returns an Observable for async pipe usage.

```html
<span [innerHTML]="message.text | safeMarkdown | async"></span>
```

**Requirements:**
- `ngx-markdown` installed
- `MARKDOWN_SERVICE` provided
- `markdown.enabled` and `markdown.displayMode` set to `true`

---

### TimeAgoPipe

Displays relative time (e.g., "2 minutes ago").

```html
{{ message.timestamp | timeAgo }}
<!-- Output: "Just now", "5 minutes ago", "2 hours ago" -->
```

---

### FileSizePipe

Formats bytes to human-readable size.

```html
{{ 1536 | fileSize }}     <!-- "1.5 KB" -->
{{ 1048576 | fileSize:0 }} <!-- "1 MB" -->
{{ 2500000 | fileSize:2 }} <!-- "2.38 MB" -->
```

---

## Directives

### AutoResizeDirective

Auto-resizing textarea that grows with content.

**Selector:** `[ngxAutoResize]`

```html
<!-- Default max height (120px) -->
<textarea ngxAutoResize></textarea>

<!-- Custom max height -->
<textarea [ngxAutoResize]="200"></textarea>
```

---

### AutoScrollDirective

Auto-scrolls to bottom when new items are added (if user was at bottom).

**Selector:** `[ngxAutoScroll]`

```html
<div [ngxAutoScroll]="messages()" [ngxAutoScrollThreshold]="100">
  @for (message of messages(); track message.id) {
    <ngx-chat-message [message]="message" />
  }
</div>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `ngxAutoScroll` | `unknown[]` | required | Array to watch for changes |
| `ngxAutoScrollThreshold` | `number` | `100` | Distance from bottom to consider "at bottom" |

---

## Utilities

### Message Grouping

Group messages by date and sender for efficient display:

```typescript
import {
  groupMessagesByDate,
  shouldGroupWithPrevious,
  getTotalMessageCount,
  flattenGroupedMessages,
  DEFAULT_GROUP_THRESHOLD_MS  // 5 minutes
} from 'ngx-support-chat';

// Group messages
const grouped = groupMessagesByDate(messages, currentUserId);

// Check if messages should be grouped
const shouldGroup = shouldGroupWithPrevious(currentMsg, prevMsg, 5 * 60 * 1000);

// Get total count
const count = getTotalMessageCount(grouped);

// Flatten back to array
const flat = flattenGroupedMessages(grouped);
```

### Date Helpers

```typescript
import {
  formatDate,
  formatTime,
  isToday,
  isYesterday,
  isSameDay,
  startOfDay,
  getTimeDifferenceMs,
  getRelativeTime
} from 'ngx-support-chat';

formatDate(new Date(), 'MMMM d, yyyy');  // "December 29, 2025"
formatTime(new Date(), 'HH:mm');          // "14:30"
isToday(date);                            // true/false
isYesterday(date);                        // true/false
getRelativeTime(date);                    // "5 minutes ago"
```

**Supported format tokens:**
- Date: `yyyy`, `MMMM`, `MMM`, `MM`, `M`, `dd`, `d`, `EEEE`, `EEE`
- Time: `HH`, `H`, `hh`, `h`, `mm`, `m`, `ss`, `s`, `a`

---

## Accessibility

The library is built with accessibility in mind:

### Screen Reader Support

- **Live Announcements** - New messages announced via `LiveAnnouncer`
- **ARIA Labels** - All interactive elements have appropriate labels
- **Role Attributes** - Proper semantic roles (`list`, `listitem`, etc.)

```typescript
import { ChatAnnouncerService } from 'ngx-support-chat';

// Inject the service for custom announcements
constructor(private announcer: ChatAnnouncerService) {}

// Announce a message
this.announcer.announceMessage(message);

// Announce typing
this.announcer.announceTyping(indicator);

// Announce quick reply selection
this.announcer.announceQuickReplySelection(option);
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between interactive elements |
| `Enter` | Send message / Select option |
| `Shift+Enter` | New line in input |
| `Arrow Up/Down` | Navigate messages in message area |
| `Escape` | Exit navigation mode |

### Focus Management

- Focus returns to input after sending messages
- Focus returns to input after quick reply submission
- Skip links for efficient navigation

---

## Advanced Usage

### Building a Complete Chat Service

```typescript
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly messages = signal<ChatMessage[]>([]);
  private readonly typing = signal<TypingIndicator | null>(null);

  readonly messages$ = this.messages.asReadonly();
  readonly typing$ = this.typing.asReadonly();

  sendMessage(event: MessageSendEvent): void {
    const tempId = `temp-${Date.now()}`;

    // Add optimistic message
    const message: ChatMessage = {
      id: tempId,
      type: 'text',
      senderId: this.currentUserId,
      senderName: 'You',
      timestamp: new Date(),
      status: 'sending',
      content: { text: event.text }
    };

    this.messages.update(msgs => [...msgs, message]);

    // Send to API
    this.api.sendMessage(event).subscribe({
      next: (response) => {
        this.messages.update(msgs =>
          msgs.map(m => m.id === tempId
            ? { ...m, id: response.id, status: 'sent' }
            : m
          )
        );
      },
      error: () => {
        this.messages.update(msgs =>
          msgs.map(m => m.id === tempId
            ? { ...m, status: 'failed' }
            : m
          )
        );
      }
    });
  }

  setTyping(indicator: TypingIndicator | null): void {
    this.typing.set(indicator);
  }
}
```

### Custom Message Types

Extend the library for custom content:

```typescript
// Define custom content
interface CustomContent {
  type: 'custom';
  payload: Record<string, unknown>;
}

// Create message
const message: ChatMessage = {
  id: '1',
  type: 'text', // Use 'text' as base type
  senderId: 'system',
  senderName: 'System',
  timestamp: new Date(),
  status: 'sent',
  content: {
    text: JSON.stringify(customPayload) // Encode in text
  }
};

// Render custom content in your component
@if (isCustomMessage(message)) {
  <my-custom-renderer [data]="parseCustomContent(message)" />
}
```

### WebSocket Integration

```typescript
@Injectable({ providedIn: 'root' })
export class RealtimeChatService {
  private socket: WebSocket;

  connect(): void {
    this.socket = new WebSocket('wss://api.example.com/chat');

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          this.addMessage(data.message);
          break;
        case 'typing':
          this.setTyping(data.indicator);
          break;
        case 'status':
          this.updateStatus(data.messageId, data.status);
          break;
      }
    };
  }
}
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires Angular 21+.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- [GitHub Repository](https://github.com/avs2001/ngx-support-chat)
- [npm Package](https://www.npmjs.com/package/ngx-support-chat)
- [Live Demo](https://avs2001.github.io/ngx-support-chat/)
- [Report Issues](https://github.com/avs2001/ngx-support-chat/issues)
