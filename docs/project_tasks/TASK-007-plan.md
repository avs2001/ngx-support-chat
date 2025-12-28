# TASK-007: Accessibility Implementation

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 4 - Support Features
**Complexity:** Medium
**Dependencies:** TASK-005

---

## Goal

Implement comprehensive accessibility features including keyboard navigation, ARIA attributes, focus management, and screen reader support to achieve WCAG 2.1 AA compliance.

---

## Scope

### 1. Keyboard Navigation (Spec Section 9.1)

**Tab Order:**
1. Header content (parent-controlled)
2. Message area (focusable for screen readers)
3. Individual messages (tabbable)
4. Quick reply buttons (when present)
5. Attachment previews (remove buttons)
6. Text input
7. Action buttons (attach, send, custom)

**Message Area Navigation:**
- Tab enters message area
- Arrow keys navigate between messages
- Enter on a message announces its content
- Escape exits message navigation

**Input Area:**
- Tab focuses text input
- Enter sends message
- Shift+Enter adds new line
- Tab from input moves to send button

**Implementation:**
```typescript
@HostListener('keydown', ['$event'])
onKeydown(event: KeyboardEvent): void {
  if (this.isInMessageArea()) {
    switch (event.key) {
      case 'ArrowUp':
        this.focusPreviousMessage();
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.focusNextMessage();
        event.preventDefault();
        break;
      case 'Enter':
        this.announceCurrentMessage();
        break;
      case 'Escape':
        this.exitMessageNavigation();
        break;
    }
  }
}
```

### 2. ARIA Attributes (Spec Section 9.2)

**ChatContainerComponent:**
```html
<div
  role="log"
  aria-live="polite"
  aria-label="Chat conversation"
  aria-relevant="additions">
```

**ChatMessageAreaComponent:**
```html
<div role="list" aria-label="Messages">
```

**ChatMessageComponent:**
```html
<div
  role="listitem"
  [attr.aria-label]="getMessageAriaLabel()"
  tabindex="0">
```
- Aria label: "{Sender} at {time}: {content summary}"

**System Messages:**
```html
<div role="status" [attr.aria-label]="message.content.text">
```

**ChatTypingIndicatorComponent:**
```html
<div
  aria-live="polite"
  [attr.aria-label]="typingIndicator().userName + ' is typing'">
```

**ChatQuickRepliesComponent:**
```html
<!-- Single choice -->
<div role="radiogroup" [attr.aria-label]="quickReplies().prompt">
  <button
    *ngFor="let option of quickReplies().options"
    role="radio"
    [attr.aria-checked]="isSelected(option)">
```

```html
<!-- Multiple choice -->
<div role="group" [attr.aria-label]="quickReplies().prompt">
  <button
    *ngFor="let option of quickReplies().options"
    role="checkbox"
    [attr.aria-checked]="isSelected(option)">
```

**ChatInputComponent:**
```html
<textarea
  aria-label="Type a message"
  aria-multiline="true"
  [attr.aria-disabled]="disabled()">
```

**ChatActionButtonsComponent:**
```html
<button aria-label="Send message" [attr.aria-disabled]="!hasContent()">
<button aria-label="Attach file">
```

### 3. Focus Management (Spec Section 9.3)

**Rules:**
- New messages do NOT steal focus
- After sending message, focus returns to input
- After quick reply submission, focus moves to input
- Failed message retry button receives focus after retry click

**Implementation:**
```typescript
// ChatContainerComponent
private focusInput(): void {
  this.inputComponent()?.focus();
}

// After message send
onMessageSent(): void {
  this.messageSend.emit(/* ... */);
  this.focusInput();
}

// After quick reply
onQuickReplySubmit(event: QuickReplySubmitEvent): void {
  this.quickReplySubmit.emit(event);
  this.focusInput();
}

// After retry
onMessageRetry(message: ChatMessage): void {
  this.messageRetry.emit(message);
  // Focus stays on retry button for immediate feedback
}
```

**FocusMonitor Integration:**
```typescript
private focusMonitor = inject(FocusMonitor);

ngAfterViewInit(): void {
  this.focusMonitor.monitor(this.elementRef, true);
}

ngOnDestroy(): void {
  this.focusMonitor.stopMonitoring(this.elementRef);
}
```

### 4. Screen Reader Considerations (Spec Section 9.4)

**Message Announcements:**
- Messages announced with sender name, timestamp, and content
- Use `LiveAnnouncer` for dynamic announcements

```typescript
private liveAnnouncer = inject(LiveAnnouncer);

announceNewMessage(message: ChatMessage): void {
  const announcement = `${message.senderName} at ${this.formatTime(message.timestamp)}: ${this.getContentSummary(message)}`;
  this.liveAnnouncer.announce(announcement, 'polite');
}
```

**Status Changes:**
- Delivery/read status changes announced subtly
- Use `aria-live="polite"` for non-urgent updates

**Typing Indicator:**
- Announced once when typing starts
- Not repeated while typing continues

**File Attachments:**
- Announce file name, type, and size
- "PDF document, report.pdf, 2.5 megabytes"

**Image Messages:**
- Announce alt text or "Image from {sender}"
- "Image from Support Agent: Product screenshot"

### 5. LiveAnnouncer Service Wrapper

**File:** `projects/ngx-support-chat/src/lib/services/chat-announcer.service.ts`

```typescript
@Injectable()
export class ChatAnnouncerService {
  private liveAnnouncer = inject(LiveAnnouncer);
  private lastTypingAnnouncement = '';

  announceMessage(message: ChatMessage, config: ChatConfig): void;
  announceTyping(indicator: TypingIndicator): void;
  announceStatusChange(message: ChatMessage, oldStatus: string): void;
  announceQuickReplySelection(option: QuickReplyOption): void;
}
```

---

## Success Criteria

- [ ] Tab navigation follows specified order (header → messages → quick replies → attachments → input → buttons)
- [ ] Arrow keys navigate between messages in message area
- [ ] Enter on message announces content
- [ ] Escape exits message navigation mode
- [ ] All ARIA attributes present and correct
- [ ] Container has `role="log"` and `aria-live="polite"`
- [ ] Messages have `role="listitem"` with descriptive aria-labels
- [ ] Quick replies have appropriate radio/checkbox roles
- [ ] Focus returns to input after message send
- [ ] Focus returns to input after quick reply submit
- [ ] New messages don't steal focus
- [ ] Screen reader announces messages with sender, time, content
- [ ] Status changes announced subtly
- [ ] Typing indicator announced once (not repeatedly)
- [ ] File attachments fully announced with name, type, size
- [ ] No accessibility linting errors (Angular ESLint a11y rules pass)
- [ ] Unit tests for keyboard navigation
- [ ] Unit tests for focus management

---

## Deliverables

1. **Updated Components (with a11y):**
   - `chat-container.component.ts` - ARIA container attributes
   - `chat-message-area.component.ts` - Keyboard navigation, list role
   - `chat-message.component.ts` - ARIA labels, tabindex
   - `chat-quick-replies.component.ts` - Radio/checkbox roles
   - `chat-typing-indicator.component.ts` - Live region
   - `chat-input.component.ts` - Input labels
   - `chat-action-buttons.component.ts` - Button labels

2. **Services:**
   - `services/chat-announcer.service.ts`
   - `services/chat-announcer.service.spec.ts`

3. **Test Suites:**
   - `chat-keyboard-navigation.spec.ts` (integration tests)
   - `chat-focus-management.spec.ts` (integration tests)

---

## Technical Notes

### CDK A11y Module Usage
```typescript
import { A11yModule, FocusMonitor, LiveAnnouncer } from '@angular/cdk/a11y';

// Component imports
imports: [A11yModule]
```

### Focus Trap for Modals
If the chat can be in a modal context, consider `cdkFocusTrap`:
```html
<div cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
  <!-- Chat container -->
</div>
```

### Skip Link Pattern
For long message lists, consider a skip link:
```html
<a class="skip-link" href="#chat-input">Skip to message input</a>
```

### High Contrast Mode
Ensure CSS tokens work in high contrast mode:
```scss
@media (prefers-contrast: high) {
  .message-bubble {
    border: 2px solid currentColor;
  }
}
```

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Keyboard Navigation | 9.1 |
| Tab Order | 9.1 |
| Message Area Navigation | 9.1 |
| ARIA Attributes | 9.2 |
| Focus Management | 9.3 |
| Screen Reader | 9.4 |

---

**This document is IMMUTABLE. Do not modify after task start.**
