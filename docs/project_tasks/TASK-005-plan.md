# TASK-005: Interactive Input Components

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 3 - Interactive Components
**Complexity:** High
**Dependencies:** TASK-004

---

## Goal

Implement all user interaction components: quick replies, typing indicator, text input with auto-resize, attachment preview, and action buttons. Also create supporting directives for auto-resize and auto-scroll behavior.

---

## Scope

### 1. ChatQuickRepliesComponent (Spec Section 6.4)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-quick-replies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatQuickRepliesComponent {
  quickReplies = input.required<QuickReplySet>();

  quickReplySubmit = output<QuickReplySubmitEvent>();

  // Internal state for multiple-choice
  selectedValues = signal<any[]>([]);

  onOptionClick(option: QuickReplyOption): void;
  onSubmit(): void;
}
```

**Quick Reply Types:**

**Confirmation:**
- Single button (e.g., "Confirm", "OK")
- Clicking immediately emits and disables

**Single Choice (Radio):**
- Vertical or horizontal list of radio-style options
- Selection immediately emits and disables all options
- Selected option visually highlighted

**Multiple Choice (Checkbox):**
- Vertical list of checkbox options
- Includes "Submit" button below options
- User can select multiple, then clicks Submit
- After submit: all checkboxes disabled, selections visible

**Disabled State:**
- After interaction, all options become disabled
- Selected option(s) visually indicated
- Non-selected options appear muted

### 2. ChatTypingIndicatorComponent (Spec Section 6.5)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-typing-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatTypingIndicatorComponent {
  typingIndicator = input.required<TypingIndicator>();

  showText = input<boolean>(false);
}
```

**Features:**
- Appears at bottom of message area, aligned left (agent position)
- Shows agent avatar (if available)
- Animated three-dot indicator with wave/pulse animation
- Optional "{Name} is typing..." text
- Message-bubble-like container

**Animation:**
```scss
.typing-dots {
  .dot {
    animation: typing-bounce 1.4s ease-in-out infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
```

### 3. ChatInputComponent (Spec Section 6.6)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [AutoResizeDirective],
})
export class ChatInputComponent {
  value = model<string>('');
  placeholder = input<string>('Type a message...');
  disabled = input<boolean>(false);
  maxHeight = input<number>(120);

  send = output<void>();

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send.emit();
    }
    // Shift+Enter = newline (default behavior)
  }
}
```

**Features:**
- Full-width textarea
- Placeholder text when empty
- Auto-resizes vertically as user types (up to max height, then scrolls)
- Enter key sends message
- Shift+Enter inserts new line
- Two-way `value` binding via `model()`

### 4. ChatAttachmentPreviewComponent (Spec Section 6.6)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-attachment-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatAttachmentPreviewComponent {
  attachments = input.required<Attachment[]>();

  attachmentRemove = output<Attachment>();

  isImage(attachment: Attachment): boolean;
  getFileIcon(attachment: Attachment): string;
  truncateFilename(name: string, maxLength: number): string;
}
```

**Features:**
- Horizontal row above text input
- Each chip shows: thumbnail (for images) or file icon, filename (truncated), remove button
- Chips are horizontally scrollable if many attachments
- Remove button per chip → `attachmentRemove` output
- Shows upload progress if available

### 5. ChatActionButtonsComponent (Spec Section 6.6)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-action-buttons',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatActionButtonsComponent {
  hasContent = input.required<boolean>();
  disabled = input<boolean>(false);

  send = output<void>();
  attachmentSelect = output<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onSendClick(): void;
  onAttachClick(): void;
  onFileSelected(event: Event): void;
}
```

**Features:**
- Send button: enabled only when `hasContent` is true
- Attachment button: opens file picker, supports multiple selection
- Additional buttons projectable via ng-content
- File input hidden, triggered by attachment button

### 6. AutoResizeDirective

**File:** `projects/ngx-support-chat/src/lib/directives/auto-resize.directive.ts`

**Structure:**
```typescript
@Directive({
  selector: '[ngxAutoResize]',
  standalone: true,
})
export class AutoResizeDirective implements OnInit, OnDestroy {
  maxHeight = input<number>(120);

  private elementRef = inject(ElementRef);

  constructor() {
    // Set up resize logic
  }

  private resize(): void {
    const element = this.elementRef.nativeElement;
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, this.maxHeight()) + 'px';
  }

  @HostListener('input')
  onInput(): void {
    this.resize();
  }
}
```

**Features:**
- Auto-resize textarea height based on content
- Respect max-height with overflow scroll
- Works with any textarea element

### 7. AutoScrollDirective

**File:** `projects/ngx-support-chat/src/lib/directives/auto-scroll.directive.ts`

**Structure:**
```typescript
@Directive({
  selector: '[ngxAutoScroll]',
  standalone: true,
})
export class AutoScrollDirective implements OnChanges {
  ngxAutoScroll = input.required<unknown[]>(); // Trigger on array changes
  enabled = input<boolean>(true);
  threshold = input<number>(100); // Pixels from bottom to consider "at bottom"

  private elementRef = inject(ElementRef);
  private isUserScrolled = signal(false);

  @HostListener('scroll')
  onScroll(): void {
    const element = this.elementRef.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < this.threshold();
    this.isUserScrolled.set(!atBottom);
  }

  ngOnChanges(): void {
    if (this.enabled() && !this.isUserScrolled()) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    const element = this.elementRef.nativeElement;
    element.scrollTop = element.scrollHeight;
  }
}
```

**Features:**
- Auto-scroll to bottom on new messages
- Maintain position if user manually scrolled up
- Configurable threshold for "at bottom" detection

---

## Success Criteria

- [ ] All 3 quick reply types work correctly (confirmation, single-choice, multiple-choice)
- [ ] Quick replies disable after submission
- [ ] Selected options visually highlighted
- [ ] Typing indicator animates smoothly (three dots bounce)
- [ ] Typing indicator shows avatar and optional text
- [ ] Input auto-resizes up to max height
- [ ] Input scrolls when exceeding max height
- [ ] Enter sends message (emits `send` output)
- [ ] Shift+Enter inserts newline
- [ ] Attachment chips display with thumbnail/icon
- [ ] Attachment chips show truncated filename
- [ ] Attachment remove button works
- [ ] Send button enabled only when content exists
- [ ] Attachment button opens file picker
- [ ] File picker supports multiple selection
- [ ] AutoResizeDirective works standalone
- [ ] AutoScrollDirective maintains scroll position correctly
- [ ] All outputs emit correct payloads
- [ ] Unit tests for all components and directives
- [ ] 80%+ test coverage maintained

---

## Deliverables

1. **Components:**
   - `chat-quick-replies/chat-quick-replies.component.ts|html|scss|spec.ts`
   - `chat-typing-indicator/chat-typing-indicator.component.ts|html|scss|spec.ts`
   - `chat-input/chat-input.component.ts|html|scss|spec.ts`
   - `chat-attachment-preview/chat-attachment-preview.component.ts|html|scss|spec.ts`
   - `chat-action-buttons/chat-action-buttons.component.ts|html|scss|spec.ts`

2. **Directives:**
   - `directives/auto-resize.directive.ts`
   - `directives/auto-resize.directive.spec.ts`
   - `directives/auto-scroll.directive.ts`
   - `directives/auto-scroll.directive.spec.ts`

3. **Updated Exports:**
   - `public-api.ts` with new components and directives

---

## Technical Notes

### Quick Reply State Management
Quick replies are externally controlled via inputs. The component should:
- Receive `QuickReplySet` with `submitted: false`
- Emit selection via `quickReplySubmit` output
- Parent updates the input with `submitted: true`
- Component renders disabled state

### File Input Pattern
```html
<input
  type="file"
  #fileInput
  multiple
  (change)="onFileSelected($event)"
  style="display: none"
/>
<button (click)="fileInput.click()">Attach</button>
```

### Textarea Auto-Resize CSS
```scss
textarea {
  resize: none;
  overflow-y: hidden;

  &.scrollable {
    overflow-y: auto;
  }
}
```

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Quick Replies | 6.4 |
| Quick Reply Types | 6.4 |
| Quick Reply Disabled State | 6.4 |
| Typing Indicator | 6.5 |
| Text Input | 6.6 |
| Attachment Preview | 6.6 |
| Action Buttons | 6.6 |

---

**This document is IMMUTABLE. Do not modify after task start.**
