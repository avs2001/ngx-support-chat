# TASK-002: Data Models & Configuration

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 1 - Foundation
**Complexity:** Low-Medium
**Dependencies:** TASK-001

---

## Goal

Implement all TypeScript interfaces for chat data structures, create the configuration injection token system, and establish secondary entry points for clean API exports.

---

## Scope

### 1. Message Models (Spec Section 5.1)

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

### 2. Content Type Models (Spec Section 5.2)

```typescript
interface TextContent {
  text: string;  // Plain text or markdown based on configuration
}

interface ImageContent {
  thumbnailUrl: string;
  fullUrl: string;
  altText?: string;
  width?: number;
  height?: number;
}

interface FileContent {
  fileName: string;
  fileSize?: number;  // In bytes
  fileType: string;   // MIME type or extension
  downloadUrl: string;
  icon?: string;      // Optional custom icon identifier
}

interface SystemContent {
  text: string;  // e.g., "Chat started", "Agent joined"
}
```

### 3. Quick Reply Models (Spec Section 5.3)

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

### 4. Typing Indicator Model (Spec Section 5.4)

```typescript
interface TypingIndicator {
  userId: string;
  userName: string;
  avatar?: string;
}
```

### 5. Attachment Model (Spec Section 5.5)

```typescript
interface Attachment {
  id: string;
  file: File;
  previewUrl?: string;  // For image previews
  uploadProgress?: number;
}
```

### 6. Event Models (Spec Section 4)

```typescript
interface MessageSendEvent {
  text: string;
  attachments: Attachment[];
}

interface QuickReplySubmitEvent {
  type: 'confirmation' | 'single-choice' | 'multiple-choice';
  value: any;
}
```

### 7. Configuration Injection Token (Spec Section 7.1)

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

### 8. Default Configuration (Spec Section 7.2)

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

### 9. Provider Factory Function

```typescript
function provideChatConfig(config?: Partial<ChatConfig>): Provider {
  return {
    provide: CHAT_CONFIG,
    useValue: { ...DEFAULT_CHAT_CONFIG, ...config }
  };
}
```

### 10. ChatConfigService

```typescript
@Injectable()
class ChatConfigService {
  private config = inject(CHAT_CONFIG, { optional: true }) ?? DEFAULT_CHAT_CONFIG;

  readonly markdown = computed(() => this.config.markdown);
  readonly dateFormat = computed(() => this.config.dateFormat);
  readonly timeFormat = computed(() => this.config.timeFormat);
  readonly dateSeparatorLabels = computed(() => this.config.dateSeparatorLabels);
}
```

### 11. Secondary Entry Points (Spec Section 14.2)

**`ngx-support-chat/models` entry point:**
```
projects/ngx-support-chat/src/models/
├── public-api.ts
├── chat-message.model.ts
├── content-types.model.ts
├── quick-reply.model.ts
├── typing-indicator.model.ts
├── attachment.model.ts
└── events.model.ts
```

**`ngx-support-chat/tokens` entry point:**
```
projects/ngx-support-chat/src/tokens/
├── public-api.ts
└── chat-config.token.ts
```

---

## Success Criteria

- [ ] All interfaces exported from `ngx-support-chat/models`
- [ ] `CHAT_CONFIG` token exported from `ngx-support-chat/tokens`
- [ ] `provideChatConfig()` works in demo app.config.ts
- [ ] Default configuration applied when no config provided
- [ ] ChatConfigService injectable and functional
- [ ] Unit tests for ChatConfigService
- [ ] Secondary entry points build correctly
- [ ] `npm run build:lib` succeeds with new exports

---

## Deliverables

1. **Model Files:**
   - `projects/ngx-support-chat/src/models/chat-message.model.ts`
   - `projects/ngx-support-chat/src/models/content-types.model.ts`
   - `projects/ngx-support-chat/src/models/quick-reply.model.ts`
   - `projects/ngx-support-chat/src/models/typing-indicator.model.ts`
   - `projects/ngx-support-chat/src/models/attachment.model.ts`
   - `projects/ngx-support-chat/src/models/events.model.ts`
   - `projects/ngx-support-chat/src/models/public-api.ts`
   - `projects/ngx-support-chat/src/models/ng-package.json` (secondary entry point)

2. **Token Files:**
   - `projects/ngx-support-chat/src/tokens/chat-config.token.ts`
   - `projects/ngx-support-chat/src/tokens/public-api.ts`
   - `projects/ngx-support-chat/src/tokens/ng-package.json` (secondary entry point)

3. **Service:**
   - `projects/ngx-support-chat/src/lib/services/chat-config.service.ts`
   - `projects/ngx-support-chat/src/lib/services/chat-config.service.spec.ts`

4. **Updated Exports:**
   - `projects/ngx-support-chat/src/public-api.ts` (main entry point)

---

## Technical Notes

### Type Guard Functions
Consider adding type guards for discriminated unions:

```typescript
function isTextMessage(message: ChatMessage): message is ChatMessage & { content: TextContent } {
  return message.type === 'text';
}
```

### Strict TypeScript Implications
With `exactOptionalPropertyTypes: true`:
- Optional properties must use `undefined` explicitly when set
- Use `field?: T` carefully vs `field: T | undefined`

### Secondary Entry Points
Each secondary entry point needs its own `ng-package.json`:

```json
{
  "$schema": "../../../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "public-api.ts"
  }
}
```

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| ChatMessage | 5.1 |
| Content Types | 5.2 |
| Quick Replies | 5.3 |
| Typing Indicator | 5.4 |
| Attachment | 5.5 |
| Component Outputs (Events) | 4 |
| Injection Token | 7.1 |
| Default Configuration | 7.2 |
| Secondary Entry Points | 14.2 |

---

**This document is IMMUTABLE. Do not modify after task start.**
