# SDD: TASK-005 - Interactive Input Components

**Task:** TASK-005
**Status:** Implemented
**Created:** 2025-12-28
**Last Updated:** 2025-12-28
**Revision:** 2

---

## 1. Introduction

### 1.1 Purpose

This document defines the software design for implementing interactive user input components including quick replies, typing indicator, text input with auto-resize, attachment preview, and action buttons.

### 1.2 Scope

- ChatQuickRepliesComponent (3 interaction types)
- ChatTypingIndicatorComponent (animated dots)
- ChatInputComponent (auto-resizing textarea)
- ChatAttachmentPreviewComponent (file preview chips)
- ChatActionButtonsComponent (send/attach buttons)
- AutoResizeDirective (textarea height adjustment)
- AutoScrollDirective (scroll position management)

### 1.3 References

- TASK-005-plan.md (immutable task definition)
- ngx-support-chat-specification.md sections 6.4-6.6

---

## 2. Architecture Context

### 2.1 System Position

Components integrate into existing container structure:

```
<ngx-chat-container>
├── <ngx-chat-message-area>
│     ├── ... messages ...
│     ├── <ngx-chat-quick-replies>    [NEW]
│     └── <ngx-chat-typing-indicator> [NEW]
└── <ngx-chat-footer>
      ├── <ngx-chat-attachment-preview> [NEW]
      ├── <ngx-chat-input>              [NEW]
      └── <ngx-chat-action-buttons>     [NEW]
```

### 2.2 Key Decisions

| Decision | Rationale |
|----------|-----------|
| Signal-based state for quick replies | Consistent with project patterns |
| Pure CSS animation for typing | No JS overhead, smooth performance |
| Directive for auto-resize | Reusable, separation of concerns |
| Hidden file input pattern | Standard accessible file upload |

---

## 3. Software Units

### 3.1 ChatQuickRepliesComponent

**File:** `components/chat-quick-replies/`
**Status:** Implemented

**Inputs:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `quickReplies` | `QuickReplySet` | Yes | Quick reply configuration |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| `quickReplySubmit` | `QuickReplySubmitEvent` | Selection submitted |

**Internal State:**
- `selectedValues: WritableSignal<unknown[]>` - For multiple-choice selections

**Template Structure:**
```html
@if (!quickReplies().submitted) {
  <div class="quick-replies">
    @if (quickReplies().prompt) {
      <p class="prompt">{{ quickReplies().prompt }}</p>
    }

    @switch (quickReplies().type) {
      @case ('confirmation') {
        <button (click)="onConfirm()">{{ options()[0].label }}</button>
      }
      @case ('single-choice') {
        @for (option of options(); track option.value) {
          <button [disabled]="option.disabled" (click)="onSelect(option)">
            {{ option.label }}
          </button>
        }
      }
      @case ('multiple-choice') {
        @for (option of options(); track option.value) {
          <label>
            <input type="checkbox" [checked]="isSelected(option)"
                   (change)="onToggle(option)" />
            {{ option.label }}
          </label>
        }
        <button (click)="onSubmit()">Submit</button>
      }
    }
  </div>
} @else {
  <!-- Disabled state showing selections -->
  <div class="quick-replies quick-replies--submitted">
    @for (option of options(); track option.value) {
      <span [class.selected]="wasSelected(option)">{{ option.label }}</span>
    }
  </div>
}
```

### 3.2 ChatTypingIndicatorComponent

**File:** `components/chat-typing-indicator/`
**Status:** Implemented

**Inputs:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `typingIndicator` | `TypingIndicator` | Yes | - | Who is typing |
| `showText` | `boolean` | No | `false` | Show "X is typing" text |

**Template Structure:**
```html
<div class="typing-indicator">
  @if (typingIndicator().avatar) {
    <img [src]="typingIndicator().avatar" [alt]="typingIndicator().userName" />
  }
  <div class="typing-bubble">
    <div class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    @if (showText()) {
      <span class="typing-text">{{ typingIndicator().userName }} is typing...</span>
    }
  </div>
</div>
```

**Animation (SCSS):**
```scss
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.dot {
  animation: typing-bounce 1.4s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
```

### 3.3 ChatInputComponent

**File:** `components/chat-input/`
**Status:** Implemented

**Inputs:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `model<string>` | No | `''` | Two-way bound value |
| `placeholder` | `string` | No | `'Type a message...'` | Placeholder text |
| `disabled` | `boolean` | No | `false` | Disable input |
| `maxHeight` | `number` | No | `120` | Max height in px |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| `send` | `void` | Enter pressed (without Shift) |

**Template:**
```html
<textarea
  #textarea
  [value]="value()"
  (input)="onInput($event)"
  (keydown)="onKeydown($event)"
  [placeholder]="placeholder()"
  [disabled]="disabled()"
  [ngxAutoResize]="maxHeight()"
  rows="1"
></textarea>
```

### 3.4 ChatAttachmentPreviewComponent

**File:** `components/chat-attachment-preview/`
**Status:** Implemented

**Inputs:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `attachments` | `Attachment[]` | Yes | Pending attachments |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| `attachmentRemove` | `Attachment` | Remove button clicked |

**Template:**
```html
<div class="attachment-chips">
  @for (attachment of attachments(); track attachment.id) {
    <div class="chip">
      @if (isImage(attachment)) {
        <img [src]="attachment.previewUrl" [alt]="attachment.file.name" />
      } @else {
        <span class="file-icon">{{ getFileIcon(attachment) }}</span>
      }
      <span class="filename">{{ truncateFilename(attachment.file.name, 20) }}</span>
      @if (attachment.uploadProgress !== undefined) {
        <progress [value]="attachment.uploadProgress" max="100"></progress>
      }
      <button type="button" (click)="onRemove(attachment)" aria-label="Remove">×</button>
    </div>
  }
</div>
```

### 3.5 ChatActionButtonsComponent

**File:** `components/chat-action-buttons/`
**Status:** Implemented

**Inputs:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `hasContent` | `boolean` | Yes | - | Enable send button |
| `disabled` | `boolean` | No | `false` | Disable all buttons |

**Outputs:**
| Name | Payload | Description |
|------|---------|-------------|
| `send` | `void` | Send clicked |
| `attachmentSelect` | `File[]` | Files selected |

**Template:**
```html
<div class="action-buttons">
  <input
    type="file"
    #fileInput
    multiple
    (change)="onFileSelected($event)"
    style="display: none"
  />
  <button type="button" (click)="fileInput.click()" [disabled]="disabled()">
    Attach
  </button>
  <button type="button" (click)="onSendClick()"
          [disabled]="disabled() || !hasContent()">
    Send
  </button>
  <ng-content select="[chatFooterActions]"></ng-content>
</div>
```

### 3.6 AutoResizeDirective

**File:** `directives/auto-resize.directive.ts`
**Status:** Implemented

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `ngxAutoResize` | `number` | `120` | Max height in px |

**Behavior:**
1. On `input` event, calculate content height
2. Set element height to `min(scrollHeight, maxHeight)`
3. Apply `overflow-y: auto` when at max height

**Implementation:**
```typescript
@Directive({
  selector: '[ngxAutoResize]',
  standalone: true,
})
export class AutoResizeDirective {
  readonly ngxAutoResize = input<number>(120);

  private readonly el = inject(ElementRef);

  @HostListener('input')
  onInput(): void {
    this.resize();
  }

  private resize(): void {
    const textarea = this.el.nativeElement as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    const maxHeight = this.ngxAutoResize();
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
```

### 3.7 AutoScrollDirective

**File:** `directives/auto-scroll.directive.ts`
**Status:** Implemented

**Inputs:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `ngxAutoScroll` | `unknown[]` | - | Trigger on changes |
| `threshold` | `number` | `100` | Px from bottom |

**Behavior:**
1. Track if user is "at bottom" (within threshold)
2. On array change: scroll to bottom only if was at bottom
3. User scrolling up: preserve position

**Implementation:**
```typescript
@Directive({
  selector: '[ngxAutoScroll]',
  standalone: true,
})
export class AutoScrollDirective implements OnChanges {
  readonly ngxAutoScroll = input.required<unknown[]>();
  readonly threshold = input<number>(100);

  private readonly el = inject(ElementRef);
  private wasAtBottom = true;

  @HostListener('scroll')
  onScroll(): void {
    const elem = this.el.nativeElement as HTMLElement;
    const atBottom = elem.scrollHeight - elem.scrollTop - elem.clientHeight < this.threshold();
    this.wasAtBottom = atBottom;
  }

  ngOnChanges(): void {
    if (this.wasAtBottom) {
      setTimeout(() => this.scrollToBottom());
    }
  }

  scrollToBottom(): void {
    const elem = this.el.nativeElement as HTMLElement;
    elem.scrollTop = elem.scrollHeight;
  }
}
```

---

## 4. Interfaces

### 4.1 Component Events Flow

```
User Action → Component Output → Container Handler → Parent Emission

Quick Reply Click:
  ChatQuickRepliesComponent.quickReplySubmit
    → ChatMessageAreaComponent (forwarded)
    → ChatContainerComponent.quickReplySubmit
    → Parent application

Send Button Click:
  ChatActionButtonsComponent.send
    → ChatFooterComponent.messageSend
    → ChatContainerComponent.onFooterMessageSend()
    → ChatContainerComponent.messageSend
    → Parent application
```

### 4.2 CSS Token Usage

| Token | Component | Purpose |
|-------|-----------|---------|
| `--ngx-quick-reply-bg` | QuickReplies | Button background |
| `--ngx-quick-reply-selected-bg` | QuickReplies | Selected state |
| `--ngx-typing-indicator-dot` | TypingIndicator | Dot color |
| `--ngx-input-bg` | Input | Textarea background |
| `--ngx-button-primary-bg` | ActionButtons | Send button |

---

## 5. Implementation Notes

### 5.1 Quick Reply State Flow

```
Parent provides: quickReplies = { submitted: false, options: [...] }
User clicks option → Component emits quickReplySubmit
Parent handles event → Updates: quickReplies = { submitted: true, selectedValues: [...] }
Component re-renders with disabled state
```

### 5.2 Auto-Resize Performance

- Use `requestAnimationFrame` for smooth resizing if needed
- Avoid layout thrashing with batched DOM reads/writes
- Consider using `ResizeObserver` for more complex scenarios

### 5.3 File Selection Security

- Always use `input[type="file"]` for file selection
- Never expose file paths to application
- Use `File` objects directly, not paths

---

## 6. Revision History

| Rev | Date | Changes | Author |
|-----|------|---------|--------|
| 2 | 2025-12-28 | Marked all units as Implemented | Claude |
| 1 | 2025-12-28 | Initial draft | Claude |
