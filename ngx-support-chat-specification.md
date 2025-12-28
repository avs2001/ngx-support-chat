# ngx-support-chat

## Angular Chat Component Library

### Complete Specification Document

**Functional Requirements & Technology Stack**

Version 1.0 | December 2024

---

# PART 1: FUNCTIONAL SPECIFICATION

---

## 1. Overview

A **pure presentational Angular component** for customer support chat. The component is fully decoupled from business logic — it receives data via `@Input()` bindings, emits user interactions via `@Output()` events, and delegates all business logic to the parent component. The component is highly customizable through **CSS custom properties (tokens)** and an **Angular injection token** for behavioral configuration.

---

## 2. Component Architecture

### 2.1 Design Principles

1. **Presentational only**: No HTTP calls, no state management, no side effects
2. **Content projection**: Header and footer areas support `ng-content` for flexible customization
3. **Configuration via injection token**: Global settings (e.g., markdown mode) provided through Angular DI
4. **Styling via CSS tokens**: All visual properties customizable without component modification
5. **Container queries**: Adapts to any container size, not viewport

### 2.2 Component Structure

```
<ngx-chat-container>
├── <ngx-chat-header>          → Fully projectable content area
├── <ngx-chat-message-area>    → Virtual-scrolled message list
│     ├── <ngx-date-separator> → Sticky date groupings
│     ├── <ngx-message-group>  → Grouped consecutive messages
│     │     ├── <ngx-message>  → Individual message bubble
│     │     └── ...
│     ├── <ngx-quick-replies>  → Interactive response buttons
│     └── <ngx-typing-indicator>
└── <ngx-chat-footer>
      ├── <ngx-attachment-preview> → Chips for pending attachments
      ├── <ngx-text-input>         → Auto-resizing input field
      └── <ngx-action-buttons>     → Send, attach, + projectable buttons
```

---

## 3. Component Inputs

| Input | Type | Description |
|-------|------|-------------|
| `messages` | `ChatMessage[]` | Array of all messages to display |
| `typingIndicator` | `TypingIndicator \| null` | Shows who is currently typing |
| `quickReplies` | `QuickReplySet \| null` | Active quick reply buttons |
| `currentUserId` | `string` | ID to determine message alignment (right for current user) |
| `pendingAttachments` | `Attachment[]` | Files selected but not yet sent |
| `inputValue` | `string` | Current text input value (two-way bindable) |
| `disabled` | `boolean` | Disables all input interactions |

---

## 4. Component Outputs

| Output | Payload | Trigger |
|--------|---------|---------|
| `messageSend` | `{ text: string, attachments: Attachment[] }` | User sends a message |
| `messageRetry` | `ChatMessage` | User clicks retry on a failed message |
| `attachmentSelect` | `File[]` | User selects files to attach |
| `attachmentRemove` | `Attachment` | User removes a pending attachment |
| `quickReplySubmit` | `{ type: string, value: any }` | User submits quick reply selection |
| `imagePreview` | `ImageMessage` | User clicks an image thumbnail |
| `fileDownload` | `FileAttachment` | User clicks download on a file |
| `scrollTop` | `void` | User scrolls to top (for loading older messages) |

---

## 5. Data Models

### 5.1 ChatMessage

```typescript
interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'file' | 'system';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  content: TextContent | ImageContent | FileContent | SystemContent;
}
```

### 5.2 Content Types

#### TextContent

```typescript
interface TextContent {
  text: string;  // Plain text or markdown based on configuration
}
```

#### ImageContent

```typescript
interface ImageContent {
  thumbnailUrl: string;
  fullUrl: string;
  altText?: string;
  width?: number;
  height?: number;
}
```

#### FileContent

```typescript
interface FileContent {
  fileName: string;
  fileSize?: number;  // In bytes
  fileType: string;   // MIME type or extension
  downloadUrl: string;
  icon?: string;      // Optional custom icon identifier
}
```

#### SystemContent

```typescript
interface SystemContent {
  text: string;  // e.g., "Chat started", "Agent joined"
}
```

### 5.3 Quick Replies

```typescript
interface QuickReplySet {
  id: string;
  type: 'confirmation' | 'single-choice' | 'multiple-choice';
  prompt?: string;
  options: QuickReplyOption[];
  submitted: boolean;
  selectedValues?: any[];  // Populated after submission
}

interface QuickReplyOption {
  value: any;
  label: string;
  disabled?: boolean;
}
```

### 5.4 Typing Indicator

```typescript
interface TypingIndicator {
  userId: string;
  userName: string;
  avatar?: string;
}
```

### 5.5 Attachment (Pending)

```typescript
interface Attachment {
  id: string;
  file: File;
  previewUrl?: string;  // For image previews
  uploadProgress?: number;
}
```

---

## 6. Visual Specifications

### 6.1 Layout Structure

#### Container

- Uses CSS container queries to adapt to parent container size
- Flexbox column layout: header (auto) → messages (flex: 1) → footer (auto)
- Message area fills all available vertical space between header and footer

#### Header

- Fixed height or auto based on projected content
- Fully projectable via `ng-content select="[chatHeader]"`
- Parent controls all content (agent info, status, close button, etc.)

#### Footer

- Contains attachment preview area, text input, and action buttons
- Attachment preview: horizontal scrollable row of chips above input
- Text input: full width, auto-resizing textarea
- Action buttons: send and attach buttons, plus projectable slot for additional buttons via `ng-content select="[chatFooterActions]"`

### 6.2 Message Area

#### Virtual Scrolling

- Implements Angular CDK virtual scrolling for performance
- Only renders messages currently visible in viewport (plus buffer)
- Supports variable height items (different message types/sizes)

#### Auto-Scroll Behavior

- Automatically scrolls to bottom when new message is added
- Exception: if user has manually scrolled up, maintains position
- Shows "scroll to bottom" indicator when not at bottom and new messages arrive

#### Date Separators

- Messages grouped by date
- Separator displays: "Today", "Yesterday", or formatted date
- Separator remains sticky at top of message area during scroll
- Centered, subtle styling to distinguish from messages

### 6.3 Message Bubbles

#### Alignment

- Current user messages: aligned right, primary color background
- Agent/other messages: aligned left, secondary color background
- System messages: centered, no bubble, muted styling

#### Grouping

- Consecutive messages from same sender within short time span are grouped
- Avatar and sender name shown only on first message of group
- Subsequent messages in group have reduced spacing, no avatar
- Timestamp shown on last message of group or on hover

#### Message States

- **Sending**: subtle opacity or spinner indicator
- **Sent**: single checkmark icon
- **Delivered**: double checkmark icon
- **Read**: double checkmark icon (filled or colored)
- **Failed**: error icon with "Retry" button

#### Text Messages

- Plain text by default
- When markdown enabled: renders formatted markdown (bold, italic, links, code, lists)
- Text is selectable and copyable

#### Image Messages

- Displays inline thumbnail with max dimensions
- Thumbnail has subtle border/rounded corners
- Click triggers `imagePreview` output for parent to handle lightbox
- Hover shows expand icon

#### File Messages

- Displays as card/row with: file type icon, filename, file size (if available), download button
- Click on download triggers `fileDownload` output
- Common file types have recognizable icons (PDF, DOC, XLS, etc.)

### 6.4 Quick Replies

#### Position

- Appears below the last agent message
- Only the most recent quick reply set is interactive
- Previous quick reply sets (if any) display as disabled, showing user's selection

#### Types

**Confirmation**
- Single button (e.g., "Confirm", "OK")
- Clicking immediately emits and disables

**Single Choice (Radio)**
- Vertical or horizontal list of radio-style options
- Selection immediately emits and disables all options
- Selected option visually highlighted

**Multiple Choice (Checkbox)**
- Vertical list of checkbox options
- Includes "Submit" button below options
- User can select multiple, then clicks Submit
- After submit: all checkboxes disabled, selections visible, submit button hidden

#### Disabled State

- After interaction, all options become disabled
- Selected option(s) visually indicated (checkmark, highlight, or filled style)
- Non-selected options appear muted

### 6.5 Typing Indicator

#### Appearance

- Appears at bottom of message area, aligned left (agent position)
- Shows agent avatar (if available) and animated indicator
- Animation: three dots with wave/pulse animation

#### Content

- Optional: display "{Name} is typing..." text
- Or simply animated dots within a message-bubble shape

### 6.6 Input Area

#### Text Input

- Full-width textarea
- Placeholder text when empty
- Auto-resizes vertically as user types (up to a max height, then scrolls)
- Enter key sends message
- Shift+Enter inserts new line
- When markdown mode enabled, accepts markdown syntax

#### Attachment Preview

- Horizontal row above text input
- Each pending attachment shown as chip: thumbnail (for images) or file icon, filename (truncated), remove button
- Chips are horizontally scrollable if many attachments

#### Action Buttons

- Send button: enabled only when input has content or attachments
- Attachment button: opens file picker, supports multiple selection
- Additional buttons projectable via ng-content

---

## 7. Configuration Injection Token

### 7.1 Token Definition

```typescript
const CHAT_CONFIG = new InjectionToken<ChatConfig>('CHAT_CONFIG');

interface ChatConfig {
  markdown: {
    enabled: boolean;
    displayMode: boolean;  // Render markdown in messages
    inputMode: boolean;    // Allow markdown in input
  };
  dateFormat: string;        // e.g., 'MMM d, yyyy'
  timeFormat: string;        // e.g., 'HH:mm'
  dateSeparatorLabels: {
    today: string;
    yesterday: string;
  };
}
```

### 7.2 Default Configuration

```typescript
const DEFAULT_CHAT_CONFIG: ChatConfig = {
  markdown: {
    enabled: false,
    displayMode: false,
    inputMode: false
  },
  dateFormat: 'MMMM d, yyyy',
  timeFormat: 'HH:mm',
  dateSeparatorLabels: {
    today: 'Today',
    yesterday: 'Yesterday'
  }
};
```

---

## 8. CSS Custom Properties (Tokens)

### 8.1 Color Tokens

```css
--ngx-chat-bg: /* Main container background */
--ngx-chat-header-bg:
--ngx-chat-footer-bg:
--ngx-chat-message-area-bg:

--ngx-bubble-user-bg:
--ngx-bubble-user-text:
--ngx-bubble-agent-bg:
--ngx-bubble-agent-text:
--ngx-bubble-system-bg:
--ngx-bubble-system-text:

--ngx-input-bg:
--ngx-input-text:
--ngx-input-placeholder:
--ngx-input-border:
--ngx-input-focus-border:

--ngx-button-primary-bg:
--ngx-button-primary-text:
--ngx-button-secondary-bg:
--ngx-button-secondary-text:
--ngx-button-disabled-bg:
--ngx-button-disabled-text:

--ngx-separator-text:
--ngx-separator-line:

--ngx-status-sending:
--ngx-status-sent:
--ngx-status-delivered:
--ngx-status-read:
--ngx-status-failed:

--ngx-quick-reply-bg:
--ngx-quick-reply-text:
--ngx-quick-reply-selected-bg:
--ngx-quick-reply-selected-text:
--ngx-quick-reply-disabled-bg:

--ngx-typing-indicator-dot:
--ngx-link-color:
--ngx-timestamp-text:
```

### 8.2 Spacing Tokens

```css
--ngx-spacing-xs:   /* 4px - minimal gaps */
--ngx-spacing-sm:   /* 8px - tight spacing */
--ngx-spacing-md:   /* 16px - standard spacing */
--ngx-spacing-lg:   /* 24px - section spacing */
--ngx-spacing-xl:   /* 32px - large gaps */

--ngx-message-gap:          /* Space between messages */
--ngx-message-group-gap:    /* Space between grouped messages */
--ngx-bubble-padding:       /* Internal padding of message bubbles */
--ngx-header-padding:
--ngx-footer-padding:
--ngx-input-padding:
```

### 8.3 Border Radius Tokens

```css
--ngx-radius-sm:    /* Small elements (chips, buttons) */
--ngx-radius-md:    /* Message bubbles */
--ngx-radius-lg:    /* Container corners */
--ngx-radius-full:  /* Circular (avatars) */

--ngx-bubble-radius:
--ngx-input-radius:
--ngx-button-radius:
--ngx-avatar-radius:
--ngx-attachment-chip-radius:
--ngx-image-radius:
```

### 8.4 Typography Tokens

```css
--ngx-font-family:
--ngx-font-size-xs:    /* Timestamps, metadata */
--ngx-font-size-sm:    /* Secondary text */
--ngx-font-size-md:    /* Message text */
--ngx-font-size-lg:    /* Headers, emphasis */

--ngx-font-weight-normal:
--ngx-font-weight-medium:
--ngx-font-weight-bold:

--ngx-line-height:
--ngx-message-line-height:
```

### 8.5 Dimension Tokens

```css
--ngx-avatar-size:
--ngx-avatar-size-sm:       /* For grouped messages */
--ngx-max-bubble-width:     /* e.g., 70% or 300px */
--ngx-image-thumbnail-max-width:
--ngx-image-thumbnail-max-height:
--ngx-input-min-height:
--ngx-input-max-height:
--ngx-attachment-chip-height:
```

### 8.6 Animation Tokens

```css
--ngx-transition-duration:
--ngx-transition-easing:
--ngx-typing-animation-duration:
```

---

## 9. Accessibility

### 9.1 Keyboard Navigation

#### Tab Order

1. Header content (parent-controlled)
2. Message area (focusable for screen readers)
3. Individual messages (tabbable)
4. Quick reply buttons (when present)
5. Attachment previews (remove buttons)
6. Text input
7. Action buttons (attach, send, custom)

#### Message Area Navigation

- Tab enters message area
- Arrow keys navigate between messages
- Enter on a message announces its content
- Escape exits message navigation

#### Input Area

- Tab focuses text input
- Enter sends message
- Shift+Enter adds new line
- Tab from input moves to send button

### 9.2 ARIA Attributes

- Container: `role="log"`, `aria-live="polite"`, `aria-label="Chat conversation"`
- Messages: `role="listitem"`, `aria-label` describing sender and time
- System messages: `role="status"`
- Typing indicator: `aria-live="polite"`, `aria-label="{Name} is typing"`
- Quick replies: `role="group"`, appropriate radio/checkbox roles
- Input: `aria-label="Type a message"`, `aria-multiline="true"`
- Send button: `aria-label="Send message"`

### 9.3 Focus Management

- New messages do not steal focus
- After sending message, focus returns to input
- After quick reply submission, focus moves to input
- Failed message retry button receives focus after retry click
- Lightbox (handled by parent) should trap focus

### 9.4 Screen Reader Considerations

- Messages announced with sender name, timestamp, and content
- Status changes announced subtly (delivered, read)
- Typing indicator announced once, not repeatedly
- File attachments announce file name, type, and size
- Image messages announce alt text or "Image from {sender}"

---

## 10. Container Query Breakpoints

The component uses container queries (not viewport media queries) to adapt its layout:

### 10.1 Size Adaptations

#### Small Container (< 300px width)

- Compact mode: smaller avatar, reduced spacing
- Quick reply buttons stack vertically
- Attachment chips show icon only (no filename)
- Timestamps shown on tap/hover only

#### Medium Container (300px - 600px width)

- Standard mobile-like layout
- Full message details visible
- Quick replies horizontal with wrapping
- Attachment chips show truncated filename

#### Large Container (> 600px width)

- Desktop-like experience
- Maximum bubble width respected
- More generous spacing
- Full attachment filenames

### 10.2 Implementation

```css
@container (max-width: 299px) { /* small */ }
@container (min-width: 300px) and (max-width: 599px) { /* medium */ }
@container (min-width: 600px) { /* large */ }
```

---

## 11. Content Projection Slots

| Slot Selector | Location | Purpose |
|---------------|----------|---------|
| `[chatHeader]` | Header area | Agent info, status, title, close button, etc. |
| `[chatEmptyState]` | Message area (when empty) | Custom empty state message/illustration |
| `[chatFooterActions]` | Footer, after send button | Additional action buttons (emoji, etc.) |
| `[chatFooterPrefix]` | Footer, before input | Icons or indicators before input |

---

## 12. Example Usage

```html
<ngx-chat-container
  [messages]="messages"
  [typingIndicator]="typing"
  [quickReplies]="activeQuickReplies"
  [currentUserId]="userId"
  [pendingAttachments]="attachments"
  [(inputValue)]="messageInput"
  (messageSend)="onSend($event)"
  (messageRetry)="onRetry($event)"
  (attachmentSelect)="onAttach($event)"
  (attachmentRemove)="onRemoveAttachment($event)"
  (quickReplySubmit)="onQuickReply($event)"
  (imagePreview)="openLightbox($event)"
  (fileDownload)="downloadFile($event)"
  (scrollTop)="loadMoreMessages()">
  
  <div chatHeader>
    <img [src]="agent.avatar" />
    <span>{{ agent.name }}</span>
    <span class="status">Online</span>
    <button (click)="closeChat()">×</button>
  </div>
  
  <div chatEmptyState>
    <img src="welcome.svg" />
    <p>Start a conversation with our support team!</p>
  </div>
  
  <button chatFooterActions (click)="openEmoji()">😊</button>
</ngx-chat-container>
```

---

# PART 2: TECHNOLOGY STACK

---

## 13. Angular Configuration

### 13.1 Angular Version & Features

| Aspect | Choice |
|--------|--------|
| Angular Version | 21.x |
| Component Style | Standalone components |
| Reactivity | Signals (`input()`, `output()`, `computed()`, `effect()`) |
| Change Detection | OnPush with signal-based reactivity |
| UI Library | Angular CDK only (no Material) |

### 13.2 Signal-Based API

The component uses Angular's modern signal APIs:

```typescript
// Inputs using input() signal
messages = input.required<ChatMessage[]>();
typingIndicator = input<TypingIndicator | null>(null);
quickReplies = input<QuickReplySet | null>(null);
currentUserId = input.required<string>();
pendingAttachments = input<Attachment[]>([]);
inputValue = model<string>('');  // Two-way binding
disabled = input<boolean>(false);

// Outputs using output() signal
messageSend = output<MessageSendEvent>();
messageRetry = output<ChatMessage>();
attachmentSelect = output<File[]>();
attachmentRemove = output<Attachment>();
quickReplySubmit = output<QuickReplySubmitEvent>();
imagePreview = output<ImageMessage>();
fileDownload = output<FileAttachment>();
scrollTop = output<void>();

// Computed signals for derived state
groupedMessages = computed(() => this.groupMessagesByDate(this.messages()));
hasContent = computed(() => this.inputValue().trim().length > 0 || this.pendingAttachments().length > 0);
```

### 13.3 TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "useDefineForClassFields": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
```

---

## 14. Workspace Structure

### 14.1 Angular CLI Workspace

```
ngx-support-chat/
├── projects/
│   ├── ngx-support-chat/          # Library
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   │   ├── chat-container/
│   │   │   │   │   ├── chat-header/
│   │   │   │   │   ├── chat-message-area/
│   │   │   │   │   ├── chat-message/
│   │   │   │   │   ├── chat-message-group/
│   │   │   │   │   ├── chat-date-separator/
│   │   │   │   │   ├── chat-quick-replies/
│   │   │   │   │   ├── chat-typing-indicator/
│   │   │   │   │   ├── chat-footer/
│   │   │   │   │   ├── chat-input/
│   │   │   │   │   └── chat-attachment-preview/
│   │   │   │   ├── directives/
│   │   │   │   │   ├── auto-resize.directive.ts
│   │   │   │   │   └── auto-scroll.directive.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   ├── file-size.pipe.ts
│   │   │   │   │   ├── time-ago.pipe.ts
│   │   │   │   │   └── safe-markdown.pipe.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── chat-config.service.ts
│   │   │   │   └── utils/
│   │   │   │       ├── message-grouping.util.ts
│   │   │   │       └── date-helpers.util.ts
│   │   │   ├── models/
│   │   │   │   └── public-api.ts
│   │   │   ├── tokens/
│   │   │   │   └── public-api.ts
│   │   │   ├── styles/
│   │   │   │   ├── _tokens.scss
│   │   │   │   ├── _theme-default.scss
│   │   │   │   └── tokens.css            # Exported for consumers
│   │   │   └── public-api.ts
│   │   ├── schematics/
│   │   │   ├── ng-add/
│   │   │   │   ├── index.ts
│   │   │   │   ├── schema.json
│   │   │   │   └── schema.d.ts
│   │   │   └── collection.json
│   │   ├── ng-package.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── demo/                              # Demo application
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   ├── services/
│       │   │   │   └── mock-chat.service.ts
│       │   │   └── data/
│       │   │       └── mock-messages.ts
│       │   ├── styles.scss
│       │   └── index.html
│       └── project.json
│
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
└── README.md
```

### 14.2 Secondary Entry Points

**Main Entry Point:** `ngx-support-chat`

```typescript
// Main component and related items
export { ChatContainerComponent } from './lib/components/chat-container/chat-container.component';
export { provideChatConfig } from './lib/services/chat-config.service';
// ... other components, directives, pipes
```

**Models Entry Point:** `ngx-support-chat/models`

```typescript
// All interfaces and types
export { ChatMessage, TextContent, ImageContent, FileContent, SystemContent } from './chat-message.model';
export { QuickReplySet, QuickReplyOption } from './quick-reply.model';
export { TypingIndicator } from './typing-indicator.model';
export { Attachment } from './attachment.model';
export { MessageSendEvent, QuickReplySubmitEvent } from './events.model';
```

**Tokens Entry Point:** `ngx-support-chat/tokens`

```typescript
// Injection tokens and configuration
export { CHAT_CONFIG, ChatConfig, DEFAULT_CHAT_CONFIG } from './chat-config.token';
```

**ng-package.json Configuration:**

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/ngx-support-chat",
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": [
    "schematics/**/*",
    "src/styles/tokens.css"
  ]
}
```

---

## 15. Dependencies

### 15.1 Package.json (Library)

```json
{
  "name": "ngx-support-chat",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/cdk": "^21.0.0"
  },
  "peerDependenciesMeta": {
    "ngx-markdown": {
      "optional": true
    }
  },
  "optionalDependencies": {
    "ngx-markdown": "^18.0.0"
  },
  "schematics": "./schematics/collection.json",
  "ng-add": {
    "save": "dependencies"
  }
}
```

### 15.2 Dependency Summary

| Dependency | Type | Purpose |
|------------|------|---------|
| `@angular/core` | Peer (required) | Core Angular framework |
| `@angular/common` | Peer (required) | Common Angular utilities |
| `@angular/cdk` | Peer (required) | Virtual scrolling, a11y utilities |
| `ngx-markdown` | Peer (optional) | Markdown rendering when enabled |

### 15.3 CDK Modules Used

```typescript
// Only import what's needed
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { A11yModule, FocusMonitor, LiveAnnouncer } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
```

---

## 16. Styling Architecture

### 16.1 Component-Scoped Styles

Each component has its own scoped SCSS file:

```typescript
@Component({
  selector: 'ngx-chat-container',
  standalone: true,
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss',
  encapsulation: ViewEncapsulation.Emulated,  // Default, scoped styles
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 16.2 CSS Token Structure

**Internal Token File (_tokens.scss):**

```scss
// Private tokens with defaults
:host {
  // Colors
  --_chat-bg: var(--ngx-chat-bg, #ffffff);
  --_chat-bubble-user-bg: var(--ngx-bubble-user-bg, #0066cc);
  --_chat-bubble-user-text: var(--ngx-bubble-user-text, #ffffff);
  --_chat-bubble-agent-bg: var(--ngx-bubble-agent-bg, #f0f0f0);
  --_chat-bubble-agent-text: var(--ngx-bubble-agent-text, #1a1a1a);
  
  // Spacing
  --_chat-spacing-xs: var(--ngx-spacing-xs, 4px);
  --_chat-spacing-sm: var(--ngx-spacing-sm, 8px);
  --_chat-spacing-md: var(--ngx-spacing-md, 16px);
  --_chat-spacing-lg: var(--ngx-spacing-lg, 24px);
  
  // Border Radius
  --_chat-radius-sm: var(--ngx-radius-sm, 4px);
  --_chat-radius-md: var(--ngx-radius-md, 12px);
  --_chat-radius-lg: var(--ngx-radius-lg, 16px);
  --_chat-radius-full: var(--ngx-radius-full, 9999px);
  
  // Typography
  --_chat-font-family: var(--ngx-font-family, system-ui, -apple-system, sans-serif);
  --_chat-font-size-xs: var(--ngx-font-size-xs, 0.75rem);
  --_chat-font-size-sm: var(--ngx-font-size-sm, 0.875rem);
  --_chat-font-size-md: var(--ngx-font-size-md, 1rem);
}
```

**Exported Token File (tokens.css):**

```css
/* 
 * ngx-support-chat CSS Custom Properties
 * Copy and customize these in your global styles
 */

:root {
  /* Colors */
  --ngx-chat-bg: #ffffff;
  --ngx-bubble-user-bg: #0066cc;
  --ngx-bubble-user-text: #ffffff;
  --ngx-bubble-agent-bg: #f0f0f0;
  --ngx-bubble-agent-text: #1a1a1a;
  /* ... all tokens with defaults */
}
```

### 16.3 Default Theme

The library includes a complete default theme that works out of the box. Consumers can override any token without importing additional files:

```scss
// Consumer's styles.scss - override only what's needed
:root {
  --ngx-bubble-user-bg: #7c3aed;
  --ngx-radius-md: 20px;
}
```

### 16.4 Container Queries

```scss
// chat-container.component.scss
:host {
  container-type: inline-size;
  container-name: chat;
  display: flex;
  flex-direction: column;
  height: 100%;
}

@container chat (max-width: 299px) {
  .message-bubble {
    max-width: 90%;
  }
  .avatar {
    width: 24px;
    height: 24px;
  }
}

@container chat (min-width: 300px) and (max-width: 599px) {
  .message-bubble {
    max-width: 80%;
  }
}

@container chat (min-width: 600px) {
  .message-bubble {
    max-width: 65%;
  }
}
```

---

## 17. Build Configuration

### 17.1 ng-packagr Configuration

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/ngx-support-chat",
  "lib": {
    "entryFile": "src/public-api.ts",
    "cssUrl": "inline"
  },
  "allowedNonPeerDependencies": []
}
```

### 17.2 Build Scripts

```json
{
  "scripts": {
    "build:lib": "ng build ngx-support-chat --configuration=production",
    "build:lib:watch": "ng build ngx-support-chat --watch",
    "build:demo": "ng build demo --configuration=production",
    "build:schematics": "tsc -p projects/ngx-support-chat/schematics/tsconfig.json",
    "build": "npm run build:lib && npm run build:schematics",
    "pack": "cd dist/ngx-support-chat && npm pack",
    "prepublishOnly": "npm run build"
  }
}
```

### 17.3 Browser Targets

**.browserslistrc:**

```
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
last 2 iOS versions
last 2 Android versions
```

---

## 18. Testing Configuration

### 18.1 Vitest Setup

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-tests.ts'],
    include: ['projects/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['projects/ngx-support-chat/src/lib/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/public-api.ts',
        '**/index.ts'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
```

**setup-tests.ts:**

```typescript
import '@analogjs/vite-plugin-angular/setup-vitest';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
```

### 18.2 Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=./test-results.xml"
  }
}
```

### 18.3 Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from './chat-message.component';
import { CHAT_CONFIG, DEFAULT_CHAT_CONFIG } from '../../tokens';

describe('ChatMessageComponent', () => {
  let fixture: ComponentFixture<ChatMessageComponent>;
  let component: ChatMessageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent],
      providers: [
        { provide: CHAT_CONFIG, useValue: DEFAULT_CHAT_CONFIG }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should align user messages to the right', () => {
    fixture.componentRef.setInput('message', { senderId: 'user-1', /* ... */ });
    fixture.componentRef.setInput('currentUserId', 'user-1');
    fixture.detectChanges();
    
    const bubble = fixture.nativeElement.querySelector('.message-bubble');
    expect(bubble.classList.contains('message--user')).toBe(true);
  });
});
```

---

## 19. Linting & Formatting

### 19.1 ESLint Configuration

**eslint.config.js:**

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'ngx', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'ngx', style: 'kebab-case' }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility
    ]
  }
);
```

### 19.2 Prettier Configuration

**.prettierrc:**

```json
{
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 120,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

### 19.3 Scripts

```json
{
  "scripts": {
    "lint": "eslint projects/",
    "lint:fix": "eslint projects/ --fix",
    "format": "prettier --write \"projects/**/*.{ts,html,scss,json}\"",
    "format:check": "prettier --check \"projects/**/*.{ts,html,scss,json}\""
  }
}
```

---

## 20. Schematics (ng add)

### 20.1 Collection Configuration

**schematics/collection.json:**

```json
{
  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-add": {
      "description": "Adds ngx-support-chat to the application",
      "factory": "./ng-add/index#ngAdd",
      "schema": "./ng-add/schema.json"
    }
  }
}
```

### 20.2 Schema Definition

**schematics/ng-add/schema.json:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "ngx-support-chat-ng-add",
  "title": "ngx-support-chat ng-add schematic",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "The project to add the library to"
    },
    "includeMarkdown": {
      "type": "boolean",
      "default": false,
      "description": "Include ngx-markdown for markdown support"
    },
    "addDefaultStyles": {
      "type": "boolean",
      "default": true,
      "description": "Add default CSS token variables to global styles"
    }
  },
  "required": []
}
```

### 20.3 Schematic Implementation

**schematics/ng-add/index.ts:**

```typescript
import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

export function ngAdd(options: NgAddOptions): Rule {
  return chain([
    addPeerDependencies(options),
    addOptionalDependencies(options),
    addDefaultStyles(options),
    addProviderConfig(options),
    installPackages()
  ]);
}

function addPeerDependencies(_options: NgAddOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular/cdk',
      version: '^21.0.0'
    });
    return tree;
  };
}

function addOptionalDependencies(options: NgAddOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (options.includeMarkdown) {
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: 'ngx-markdown',
        version: '^18.0.0'
      });
    }
    return tree;
  };
}

function addDefaultStyles(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.addDefaultStyles) return tree;
    
    // Add CSS tokens to global styles
    const stylesPath = findStylesFile(tree, options.project);
    if (stylesPath) {
      const content = tree.read(stylesPath)?.toString() ?? '';
      const tokenImport = `@import 'ngx-support-chat/styles/tokens.css';\n`;
      if (!content.includes(tokenImport)) {
        tree.overwrite(stylesPath, tokenImport + content);
        context.logger.info('✅ Added CSS tokens to global styles');
      }
    }
    return tree;
  };
}

function addProviderConfig(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // Add provideChatConfig() to app.config.ts
    context.logger.info('✅ Add provideChatConfig() to your app.config.ts providers array');
    return tree;
  };
}

function installPackages(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
  };
}
```

---

## 21. CI/CD Pipeline

### 21.1 Main CI Workflow

**.github/workflows/ci.yml:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run build:demo
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-demo:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./demo
```

### 21.2 Release Workflow

**.github/workflows/release.yml:**

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      
      - name: Publish to npm
        run: |
          cd dist/ngx-support-chat
          npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

---

## 22. Demo Application

### 22.1 Demo Structure

```typescript
// demo/src/app/app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatContainerComponent, FormsModule],
  template: `
    <div class="demo-container">
      <aside class="controls">
        <h2>Configuration</h2>
        <!-- Theme toggles, markdown toggle, etc. -->
      </aside>
      
      <main class="chat-wrapper" [style]="containerStyle()">
        <ngx-chat-container
          [messages]="messages()"
          [typingIndicator]="typing()"
          [quickReplies]="quickReplies()"
          [currentUserId]="'user-1'"
          [pendingAttachments]="attachments()"
          [(inputValue)]="inputValue"
          (messageSend)="onSend($event)"
          (messageRetry)="onRetry($event)"
          (attachmentSelect)="onAttach($event)"
          (attachmentRemove)="onRemoveAttachment($event)"
          (quickReplySubmit)="onQuickReply($event)"
          (imagePreview)="onImagePreview($event)"
          (fileDownload)="onFileDownload($event)"
          (scrollTop)="loadMore()">
          
          <div chatHeader>
            <img [src]="agent().avatar" class="agent-avatar" />
            <div class="agent-info">
              <span class="agent-name">{{ agent().name }}</span>
              <span class="agent-status">{{ agent().status }}</span>
            </div>
          </div>
          
          <div chatEmptyState>
            <p>👋 Start a conversation!</p>
          </div>
          
        </ngx-chat-container>
      </main>
    </div>
  `
})
export class AppComponent {
  // Signal-based state
  messages = signal<ChatMessage[]>([]);
  typing = signal<TypingIndicator | null>(null);
  quickReplies = signal<QuickReplySet | null>(null);
  attachments = signal<Attachment[]>([]);
  inputValue = signal('');
  agent = signal({ name: 'Support Agent', avatar: '...', status: 'Online' });
  
  constructor(private mockChat: MockChatService) {
    this.mockChat.initialize(this.messages, this.typing, this.quickReplies);
  }
}
```

### 22.2 Mock Chat Service

```typescript
// demo/src/app/services/mock-chat.service.ts
@Injectable({ providedIn: 'root' })
export class MockChatService {
  private messages!: WritableSignal<ChatMessage[]>;
  private typing!: WritableSignal<TypingIndicator | null>;
  private quickReplies!: WritableSignal<QuickReplySet | null>;
  
  initialize(
    messages: WritableSignal<ChatMessage[]>,
    typing: WritableSignal<TypingIndicator | null>,
    quickReplies: WritableSignal<QuickReplySet | null>
  ): void {
    this.messages = messages;
    this.typing = typing;
    this.quickReplies = quickReplies;
    
    // Load initial messages
    this.messages.set(INITIAL_MESSAGES);
  }
  
  async sendMessage(content: string): Promise<void> {
    // Add user message immediately
    const userMessage = this.createUserMessage(content);
    this.messages.update(msgs => [...msgs, userMessage]);
    
    // Simulate agent typing
    await this.delay(500);
    this.typing.set({ userId: 'agent-1', userName: 'Support Agent' });
    
    // Simulate response delay
    await this.delay(1500 + Math.random() * 1500);
    this.typing.set(null);
    
    // Add agent response
    const agentResponse = this.generateAgentResponse(content);
    this.messages.update(msgs => [...msgs, agentResponse]);
    
    // Possibly show quick replies
    if (this.shouldShowQuickReplies(content)) {
      this.quickReplies.set(this.generateQuickReplies());
    }
  }
  
  // ... helper methods
}
```

### 22.3 Demo Features

The demo application showcases:

- **All message types**: text, images, files, system messages
- **Message states**: sending, sent, delivered, read, failed (with retry)
- **Quick replies**: confirmation, single-choice, multiple-choice
- **Typing indicator**: animated agent typing simulation
- **Virtual scrolling**: pre-loaded with 100+ messages to demonstrate performance
- **Markdown toggle**: switch between plain text and markdown rendering
- **Theme customization**: live CSS token overrides
- **Container sizing**: adjustable container to demonstrate container queries
- **Attachment flow**: file selection, preview chips, simulated upload

---

## 23. Summary

This specification defines a **robust, flexible, and accessible** Angular chat component suitable for customer support scenarios.

### Key Architectural Decisions

- **Pure presentational design** for maximum reusability and testability
- **Signal-based reactivity** for modern Angular 21 development
- **Virtual scrolling** for handling large message histories efficiently
- **Content projection** for flexible header, footer, and empty state customization
- **Injection token configuration** for markdown and localization settings
- **CSS custom properties** for comprehensive theming without code changes
- **Container queries** for responsive behavior within any layout
- **Full accessibility support** with keyboard navigation and ARIA compliance

### Technology Summary

| Aspect | Technology/Choice |
|--------|-------------------|
| **Framework** | Angular 21 (Standalone, Signals) |
| **UI Library** | Angular CDK only |
| **Virtual Scrolling** | `@angular/cdk/scrolling` |
| **Markdown** | `ngx-markdown` (optional peer dependency) |
| **Styling** | Component-scoped SCSS + CSS custom properties |
| **Build Tool** | ng-packagr |
| **Package Manager** | npm |
| **Testing** | Vitest |
| **Linting** | ESLint + Angular ESLint |
| **Formatting** | Prettier |
| **CI/CD** | GitHub Actions |
| **Documentation** | README + Demo Application |
| **Workspace** | Angular CLI with projects/ folder |
| **Entry Points** | Main + `/models` + `/tokens` |
| **Browser Support** | Last 2 versions, ES2022+ |
| **Schematics** | ng add with full setup |

The parent component retains full control over business logic, data fetching, and complex interactions (like lightbox display), while this component handles all visual rendering and user interaction capture.
