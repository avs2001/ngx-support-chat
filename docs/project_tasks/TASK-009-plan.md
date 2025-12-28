# TASK-009: Demo Application

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 6 - Demo & Packaging
**Complexity:** Medium
**Dependencies:** TASK-008

---

## Goal

Create a comprehensive demo application that showcases all library features, provides a configuration panel for live customization, and serves as documentation and example code for consumers.

---

## Scope

### 1. Demo Application Structure

```
projects/demo/src/
├── app/
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.config.ts
│   ├── services/
│   │   └── mock-chat.service.ts
│   └── data/
│       ├── mock-messages.ts
│       └── mock-agents.ts
├── styles.scss
├── index.html
└── main.ts
```

### 2. MockChatService (Spec Section 22.2)

**File:** `projects/demo/src/app/services/mock-chat.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class MockChatService {
  private messages = signal<ChatMessage[]>([]);
  private typing = signal<TypingIndicator | null>(null);
  private quickReplies = signal<QuickReplySet | null>(null);

  // Public readonly signals
  readonly messages$ = this.messages.asReadonly();
  readonly typing$ = this.typing.asReadonly();
  readonly quickReplies$ = this.quickReplies.asReadonly();

  initialize(): void;
  sendMessage(text: string, attachments: Attachment[]): Promise<void>;
  retryMessage(message: ChatMessage): Promise<void>;
  submitQuickReply(event: QuickReplySubmitEvent): void;
  loadMoreMessages(): void;

  // Simulation controls
  simulateTyping(): void;
  simulateAgentResponse(userMessage: string): void;
  simulateQuickReplies(type: QuickReplyType): void;
  simulateMessageFailure(): void;
}
```

**Features:**
- Message send simulation with realistic delays
- Typing indicator simulation
- Quick reply generation for different types
- Agent response generation
- Message failure simulation
- History loading simulation

### 3. Demo AppComponent (Spec Section 22.1)

**File:** `projects/demo/src/app/app.component.ts`

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ChatContainerComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // Inject mock service
  private mockChat = inject(MockChatService);

  // State from service
  messages = this.mockChat.messages$;
  typing = this.mockChat.typing$;
  quickReplies = this.mockChat.quickReplies$;

  // Local state
  attachments = signal<Attachment[]>([]);
  inputValue = signal('');

  // Configuration panel state
  containerWidth = signal(400);
  containerHeight = signal(600);
  markdownEnabled = signal(false);

  // Theme customization
  themeTokens = signal<Record<string, string>>({});

  // Agent info
  agent = signal({
    name: 'Support Agent',
    avatar: 'assets/agent-avatar.png',
    status: 'Online'
  });

  // Event handlers
  onSend(event: MessageSendEvent): void;
  onRetry(message: ChatMessage): void;
  onAttach(files: File[]): void;
  onRemoveAttachment(attachment: Attachment): void;
  onQuickReply(event: QuickReplySubmitEvent): void;
  onImagePreview(content: ImageContent): void;
  onFileDownload(content: FileContent): void;
  onScrollTop(): void;

  // Configuration actions
  applyTheme(tokens: Record<string, string>): void;
  resizeContainer(width: number, height: number): void;
  toggleMarkdown(enabled: boolean): void;
  loadScenario(scenario: string): void;
}
```

### 4. Demo Template

```html
<!-- app.component.html -->
<div class="demo-layout">
  <!-- Configuration Sidebar -->
  <aside class="config-panel">
    <h2>Configuration</h2>

    <!-- Container Size -->
    <section>
      <h3>Container Size</h3>
      <label>
        Width: {{ containerWidth() }}px
        <input type="range" min="200" max="800" [(ngModel)]="containerWidth">
      </label>
      <label>
        Height: {{ containerHeight() }}px
        <input type="range" min="300" max="900" [(ngModel)]="containerHeight">
      </label>
    </section>

    <!-- Theme Tokens -->
    <section>
      <h3>Theme</h3>
      <label>
        User Bubble:
        <input type="color" (change)="updateToken('--ngx-bubble-user-bg', $event)">
      </label>
      <!-- More token controls -->
    </section>

    <!-- Features -->
    <section>
      <h3>Features</h3>
      <label>
        <input type="checkbox" [(ngModel)]="markdownEnabled">
        Enable Markdown
      </label>
    </section>

    <!-- Scenarios -->
    <section>
      <h3>Demo Scenarios</h3>
      <button (click)="loadScenario('empty')">Empty Chat</button>
      <button (click)="loadScenario('conversation')">Sample Conversation</button>
      <button (click)="loadScenario('performance')">1000+ Messages</button>
      <button (click)="loadScenario('all-types')">All Message Types</button>
      <button (click)="loadScenario('quick-replies')">Quick Replies</button>
      <button (click)="loadScenario('failed')">Failed Messages</button>
    </section>
  </aside>

  <!-- Chat Container -->
  <main class="chat-demo">
    <div
      class="chat-wrapper"
      [style.width.px]="containerWidth()"
      [style.height.px]="containerHeight()"
      [style]="themeStyles()">

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
        (scrollTop)="onScrollTop()">

        <div chatHeader class="demo-header">
          <img [src]="agent().avatar" class="agent-avatar">
          <div class="agent-info">
            <span class="agent-name">{{ agent().name }}</span>
            <span class="agent-status">{{ agent().status }}</span>
          </div>
          <button class="close-btn">×</button>
        </div>

        <div chatEmptyState class="demo-empty">
          <p>Start a conversation with our support team!</p>
        </div>

        <button chatFooterActions class="emoji-btn" title="Add emoji">
          😊
        </button>
      </ngx-chat-container>
    </div>
  </main>
</div>
```

### 5. Mock Data (Spec Section 22.3)

**File:** `projects/demo/src/app/data/mock-messages.ts`

```typescript
export const INITIAL_MESSAGES: ChatMessage[] = [
  // System message
  {
    id: 'sys-1',
    type: 'system',
    senderId: 'system',
    senderName: 'System',
    timestamp: new Date('2025-12-28T10:00:00'),
    status: 'read',
    content: { text: 'Chat started' }
  },
  // Agent text message
  {
    id: 'msg-1',
    type: 'text',
    senderId: 'agent-1',
    senderName: 'Support Agent',
    senderAvatar: 'assets/agent-avatar.png',
    timestamp: new Date('2025-12-28T10:00:30'),
    status: 'read',
    content: { text: 'Hello! How can I help you today?' }
  },
  // User text message
  // Image message
  // File message
  // ... more messages
];

export const PERFORMANCE_TEST_MESSAGES: ChatMessage[] = generateMessages(1000);

export const ALL_MESSAGE_TYPES: ChatMessage[] = [
  // One of each type and state
];

export const QUICK_REPLY_SCENARIOS: Record<string, QuickReplySet> = {
  confirmation: { /* ... */ },
  singleChoice: { /* ... */ },
  multipleChoice: { /* ... */ }
};
```

### 6. Demo Features to Showcase

- **All message types**: text, images, files, system messages
- **All message states**: sending, sent, delivered, read, failed (with retry)
- **Quick replies**: confirmation, single-choice, multiple-choice
- **Typing indicator**: animated agent typing simulation
- **Virtual scrolling**: 1000+ message performance test
- **Markdown toggle**: switch between plain text and markdown
- **Theme customization**: live CSS token overrides
- **Container sizing**: adjustable container for container query demo
- **Attachment flow**: file selection, preview chips, simulated upload
- **Content projection**: custom header with agent info
- **Empty state**: custom empty state message
- **Scroll to bottom indicator**: appears when scrolled up + new messages

---

## Success Criteria

- [ ] Demo application builds and runs (`npm run build:demo`, `npm run serve:demo`)
- [ ] Demo showcases all library features
- [ ] MockChatService simulates realistic chat interactions
- [ ] Configuration panel allows container resize
- [ ] Theme customization works live (token overrides)
- [ ] All message types demonstrated (text, image, file, system)
- [ ] All message states shown (sending, sent, delivered, read, failed)
- [ ] All quick reply types functional (confirmation, single, multiple)
- [ ] Virtual scrolling with 1000+ messages performs smoothly
- [ ] Markdown toggle works
- [ ] Attachment flow complete (select, preview, remove)
- [ ] Content projection visible (header, empty state, footer actions)
- [ ] Demo is presentable for documentation/marketing
- [ ] Demo code serves as example for consumers

---

## Deliverables

1. **Demo Application:**
   - `projects/demo/src/app/app.component.ts|html|scss`
   - `projects/demo/src/app/app.config.ts`
   - `projects/demo/src/app/services/mock-chat.service.ts`
   - `projects/demo/src/app/data/mock-messages.ts`
   - `projects/demo/src/app/data/mock-agents.ts`
   - `projects/demo/src/styles.scss`
   - `projects/demo/src/index.html`

2. **Assets:**
   - `projects/demo/src/assets/agent-avatar.png`
   - `projects/demo/src/assets/sample-image.jpg`
   - `projects/demo/src/assets/sample-file.pdf`

3. **Build Scripts:**
   - `npm run serve:demo` - Development server
   - `npm run build:demo` - Production build

---

## Technical Notes

### Live Theme Customization
```typescript
themeStyles = computed(() => {
  const tokens = this.themeTokens();
  return Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
});
```

### Performance Test Scenario
```typescript
function generateMessages(count: number): ChatMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `perf-${i}`,
    type: 'text',
    senderId: i % 3 === 0 ? 'user-1' : 'agent-1',
    senderName: i % 3 === 0 ? 'You' : 'Agent',
    timestamp: new Date(Date.now() - (count - i) * 60000),
    status: 'read',
    content: { text: `Message ${i + 1}: Lorem ipsum dolor sit amet...` }
  }));
}
```

### Scenario Loading
```typescript
loadScenario(scenario: string): void {
  switch (scenario) {
    case 'empty':
      this.messages.set([]);
      break;
    case 'performance':
      this.messages.set(PERFORMANCE_TEST_MESSAGES);
      break;
    // ...
  }
}
```

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Demo Structure | 22.1 |
| Mock Chat Service | 22.2 |
| Demo Features | 22.3 |

---

**This document is IMMUTABLE. Do not modify after task start.**
