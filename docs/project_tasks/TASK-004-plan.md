# TASK-004: Message Display Components

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 2 - Core Components
**Complexity:** High
**Dependencies:** TASK-003

---

## Goal

Implement the message display layer with virtual scrolling support, date separators, message grouping, and all message type renderings (text, image, file, system).

---

## Scope

### 1. ChatMessageAreaComponent (Spec Section 6.2)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-message-area',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollingModule, /* ... */],
})
export class ChatMessageAreaComponent {
  // Inputs
  messages = input.required<ChatMessage[]>();
  currentUserId = input.required<string>();
  typingIndicator = input<TypingIndicator | null>(null);
  quickReplies = input<QuickReplySet | null>(null);

  // Outputs
  messageRetry = output<ChatMessage>();
  imagePreview = output<ImageContent>();
  fileDownload = output<FileContent>();
  quickReplySubmit = output<QuickReplySubmitEvent>();
  scrollTop = output<void>();

  // Internal
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  groupedMessages = computed(() => this.groupMessagesByDate(this.messages()));
  isAtBottom = signal(true);
  showScrollIndicator = computed(() => !this.isAtBottom() && this.hasNewMessages());
}
```

**Features:**
- CDK virtual scrolling viewport
- Variable height item support via `CdkVirtualForOf`
- `scrollTop` output when reaching top (for loading older messages)
- "Scroll to bottom" indicator when not at bottom + new messages
- Auto-scroll to bottom on new messages (unless user scrolled up)

### 2. ChatDateSeparatorComponent (Spec Section 6.2)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-date-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatDateSeparatorComponent {
  date = input.required<Date>();

  // Injected
  private config = inject(ChatConfigService);

  displayText = computed(() => {
    const d = this.date();
    if (isToday(d)) return this.config.dateSeparatorLabels().today;
    if (isYesterday(d)) return this.config.dateSeparatorLabels().yesterday;
    return formatDate(d, this.config.dateFormat());
  });
}
```

**Features:**
- Sticky positioning during scroll
- Displays: "Today", "Yesterday", or formatted date
- Centered, subtle styling
- Uses ChatConfigService for labels and format

### 3. ChatMessageGroupComponent (Spec Section 6.3)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-message-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageGroupComponent {
  messages = input.required<ChatMessage[]>();
  currentUserId = input.required<string>();
  isCurrentUser = input.required<boolean>();

  messageRetry = output<ChatMessage>();
  imagePreview = output<ImageContent>();
  fileDownload = output<FileContent>();

  firstMessage = computed(() => this.messages()[0]);
  showAvatar = computed(() => !this.isCurrentUser());
  showSenderName = computed(() => !this.isCurrentUser());
}
```

**Features:**
- Groups consecutive messages from same sender
- Avatar and sender name shown only on first message
- Reduced spacing for grouped messages
- Timestamp shown on last message or on hover

### 4. ChatMessageComponent (Spec Section 6.3)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent {
  message = input.required<ChatMessage>();
  currentUserId = input.required<string>();
  isFirst = input<boolean>(false);
  isLast = input<boolean>(false);
  showAvatar = input<boolean>(true);
  showTimestamp = input<boolean>(false);

  messageRetry = output<ChatMessage>();
  imagePreview = output<ImageContent>();
  fileDownload = output<FileContent>();

  isCurrentUser = computed(() => this.message().senderId === this.currentUserId());
  alignment = computed(() => this.isCurrentUser() ? 'right' : 'left');
  isSystemMessage = computed(() => this.message().type === 'system');
}
```

**Message Types:**
- **Text**: Plain text or markdown (based on config)
- **Image**: Inline thumbnail with click-to-preview
- **File**: Card with icon, filename, size, download button
- **System**: Centered, no bubble, muted styling

**Message States:**
- `sending`: Subtle opacity or spinner
- `sent`: Single checkmark icon
- `delivered`: Double checkmark icon
- `read`: Double checkmark (filled/colored)
- `failed`: Error icon with "Retry" button

**Features:**
- Alignment based on `currentUserId` (right for current user, left for agent)
- System messages centered
- Retry button for failed messages → `messageRetry` output
- Image click → `imagePreview` output
- File download → `fileDownload` output

### 5. Message Grouping Utility

**File:** `projects/ngx-support-chat/src/lib/utils/message-grouping.util.ts`

```typescript
interface MessageGroup {
  date: Date;
  senderId: string;
  messages: ChatMessage[];
}

interface GroupedMessages {
  date: Date;
  groups: MessageGroup[];
}

function groupMessagesByDate(messages: ChatMessage[]): GroupedMessages[];
function groupMessagesBySender(messages: ChatMessage[], timeThreshold?: number): MessageGroup[];
function shouldGroupWithPrevious(current: ChatMessage, previous: ChatMessage, threshold: number): boolean;
```

**Logic:**
- Group by date first (for date separators)
- Within date, group by sender + time threshold (e.g., 5 minutes)
- Consecutive messages from same sender within threshold = same group

### 6. Date Helpers Utility

**File:** `projects/ngx-support-chat/src/lib/utils/date-helpers.util.ts`

```typescript
function isToday(date: Date): boolean;
function isYesterday(date: Date): boolean;
function isSameDay(date1: Date, date2: Date): boolean;
function formatDate(date: Date, format: string): string;
function formatTime(date: Date, format: string): string;
function getRelativeTime(date: Date): string;
```

---

## Success Criteria

- [ ] Virtual scrolling renders 1000+ messages smoothly (<16ms frame time)
- [ ] Date separators appear between days
- [ ] Date separators stick to top during scroll
- [ ] Message grouping logic correct (same sender within time threshold)
- [ ] All 4 message types render correctly (text, image, file, system)
- [ ] All 5 message states display correctly (sending, sent, delivered, read, failed)
- [ ] User messages align right, agent messages align left
- [ ] System messages centered with muted styling
- [ ] Failed message retry button works → emits `messageRetry`
- [ ] Image click emits `imagePreview`
- [ ] File download click emits `fileDownload`
- [ ] Scroll to bottom on new message (unless user scrolled up)
- [ ] Scroll indicator appears when not at bottom + new messages
- [ ] `scrollTop` emits when scrolling to top
- [ ] Unit tests for all components and utilities
- [ ] 80%+ test coverage maintained

---

## Deliverables

1. **Components:**
   - `chat-message-area/chat-message-area.component.ts|html|scss|spec.ts`
   - `chat-date-separator/chat-date-separator.component.ts|html|scss|spec.ts`
   - `chat-message-group/chat-message-group.component.ts|html|scss|spec.ts`
   - `chat-message/chat-message.component.ts|html|scss|spec.ts`

2. **Utilities:**
   - `utils/message-grouping.util.ts`
   - `utils/message-grouping.util.spec.ts`
   - `utils/date-helpers.util.ts`
   - `utils/date-helpers.util.spec.ts`

3. **Updated Exports:**
   - `public-api.ts` with new components

---

## Technical Notes

### Virtual Scrolling Configuration
```typescript
// For variable height items
<cdk-virtual-scroll-viewport
  [itemSize]="80"
  [minBufferPx]="400"
  [maxBufferPx]="800">
  <div *cdkVirtualFor="let group of groupedMessages(); trackBy: trackByDate">
    <!-- Date separator and message groups -->
  </div>
</cdk-virtual-scroll-viewport>
```

### Sticky Date Separator
```scss
.date-separator {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--_chat-message-area-bg);
}
```

### Performance Considerations
- Use `trackBy` functions for all `*cdkVirtualFor` loops
- Computed signals for derived state (avoid recalculation)
- OnPush change detection on all components
- Avoid triggering change detection on scroll events

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Message Area | 6.2 |
| Date Separators | 6.2 |
| Message Bubbles | 6.3 |
| Message Alignment | 6.3 |
| Message Grouping | 6.3 |
| Message States | 6.3 |
| Text Messages | 6.3 |
| Image Messages | 6.3 |
| File Messages | 6.3 |
| Virtual Scrolling | 6.2 |
| Auto-Scroll Behavior | 6.2 |

---

**This document is IMMUTABLE. Do not modify after task start.**
