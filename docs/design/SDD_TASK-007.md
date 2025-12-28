# Software Detailed Design: TASK-007 - Accessibility Implementation

**Version:** 1.0
**Status:** Draft
**Task:** TASK-007 - Accessibility Implementation
**Created:** 2025-12-28

---

## 1. Introduction

### 1.1 Purpose

This document defines the detailed design for implementing comprehensive accessibility features in the ngx-support-chat library, achieving WCAG 2.1 AA compliance.

### 1.2 Scope

- ChatAnnouncerService for screen reader support
- ARIA attributes for all components
- Keyboard navigation for message area
- Focus management for interactive elements

### 1.3 References

- TASK-007-plan.md (immutable task plan)
- ngx-support-chat-specification.md Section 9 (Accessibility)
- WCAG 2.1 AA Guidelines

---

## 2. Architecture Context

### 2.1 Integration Points

```
┌─────────────────────────────────────────────────┐
│              ChatContainerComponent             │
│  role="log" aria-live="polite"                  │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐   │
│  │       ChatMessageAreaComponent          │   │
│  │  role="list" + KeyboardNavigation       │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │    ChatMessageComponent         │   │   │
│  │  │  role="listitem" tabindex="0"   │   │   │
│  │  └─────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │  ChatTypingIndicatorComponent   │   │   │
│  │  │  aria-live="polite"             │   │   │
│  │  └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │       ChatFooterComponent               │   │
│  │  ┌──────────────┐ ┌─────────────────┐  │   │
│  │  │ ChatInput    │ │ ActionButtons   │  │   │
│  │  │ aria-label   │ │ aria-labels     │  │   │
│  │  └──────────────┘ └─────────────────┘  │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│           ChatAnnouncerService                  │
│  - announceMessage()                            │
│  - announceTyping()                             │
│  - announceStatusChange()                       │
│  - announceQuickReplySelection()                │
└─────────────────────────────────────────────────┘
```

### 2.2 Dependencies

- `@angular/cdk/a11y` - A11yModule, FocusMonitor, LiveAnnouncer
- Existing component infrastructure from TASK-003 to TASK-005

---

## 3. Software Units

### 3.1 ChatAnnouncerService

**File:** `projects/ngx-support-chat/src/lib/services/chat-announcer.service.ts`

**Purpose:** Centralized service for screen reader announcements using Angular CDK LiveAnnouncer.

**Interface:**
```typescript
@Injectable()
export class ChatAnnouncerService {
  // Announce a new message with sender, time, and content summary
  announceMessage(message: ChatMessage, config: ChatConfig): void;

  // Announce typing indicator (only once per typing session)
  announceTyping(indicator: TypingIndicator): void;

  // Announce message status change (sent → delivered → read)
  announceStatusChange(message: ChatMessage, oldStatus: MessageStatus): void;

  // Announce quick reply selection for confirmation
  announceQuickReplySelection(option: QuickReplyOption): void;
}
```

**Internal State:**
- `lastTypingAnnouncement: string` - Prevents duplicate typing announcements

**Dependencies:**
- `LiveAnnouncer` from `@angular/cdk/a11y`
- `ChatMessage`, `TypingIndicator`, `QuickReplyOption` interfaces

### 3.2 Keyboard Navigation (ChatMessageAreaComponent)

**Enhancement to:** `projects/ngx-support-chat/src/lib/components/chat-message-area/`

**Keyboard Bindings:**
| Key | Action |
|-----|--------|
| Tab | Enter message area |
| Arrow Up | Focus previous message |
| Arrow Down | Focus next message |
| Enter | Announce current message content |
| Escape | Exit message navigation, return focus to container |

**Internal State:**
- `currentFocusedIndex: WritableSignal<number>` - Currently focused message index
- `isInNavigationMode: WritableSignal<boolean>` - Whether keyboard nav is active

### 3.3 Focus Management (ChatContainerComponent)

**Enhancement to:** `projects/ngx-support-chat/src/lib/components/chat-container/`

**Focus Rules:**
1. After `messageSend` event → focus input
2. After `quickReplySubmit` event → focus input
3. New messages → do NOT steal focus

**Methods:**
```typescript
private focusInput(): void;
private handleMessageSent(): void;
private handleQuickReplySubmit(): void;
```

---

## 4. ARIA Attribute Mapping

### 4.1 Component ARIA Roles

| Component | Role | Additional Attributes |
|-----------|------|----------------------|
| ChatContainerComponent | `log` | `aria-live="polite"`, `aria-label="Chat conversation"` |
| ChatMessageAreaComponent | `list` | `aria-label="Messages"` |
| ChatMessageComponent | `listitem` | `aria-label="{sender} at {time}: {content}"`, `tabindex="0"` |
| ChatTypingIndicatorComponent | (none) | `aria-live="polite"`, `aria-label="{user} is typing"` |
| ChatQuickRepliesComponent | `radiogroup` or `group` | `aria-label="{prompt}"` |
| Quick Reply Button | `radio` or `checkbox` | `aria-checked` |
| ChatInputComponent textarea | (implicit) | `aria-label="Type a message"`, `aria-multiline="true"` |
| Send Button | (implicit) | `aria-label="Send message"` |
| Attach Button | (implicit) | `aria-label="Attach file"` |

### 4.2 Dynamic ARIA Labels

**Message Label Format:**
```
"{senderName} at {formattedTime}: {contentSummary}"
```

**Content Summary Rules:**
- TextContent: First 100 characters + ellipsis if truncated
- ImageContent: "Image: {alt}" or "Image attachment"
- FileContent: "{fileName}, {fileSize}"
- SystemContent: Full text

---

## 5. Test Strategy

### 5.1 Unit Tests

**ChatAnnouncerService:**
- `should announce message with correct format`
- `should not repeat typing announcement`
- `should announce status changes`
- `should announce quick reply selection`

### 5.2 Integration Tests

**Keyboard Navigation:**
- `should focus first message on Tab into area`
- `should move focus with Arrow keys`
- `should announce message on Enter`
- `should exit navigation on Escape`

**Focus Management:**
- `should return focus to input after send`
- `should return focus to input after quick reply`
- `should not steal focus on new message`

---

## 6. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-28 | Claude | Initial design |
