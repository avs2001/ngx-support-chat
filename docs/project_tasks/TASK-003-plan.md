# TASK-003: Core Container & Layout Components

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 2 - Core Components
**Complexity:** Medium
**Dependencies:** TASK-002

---

## Goal

Implement the main structural components that form the chat container layout: ChatContainerComponent, ChatHeaderComponent, and ChatFooterComponent. Establish the CSS token system and container query infrastructure.

---

## Scope

### 1. ChatContainerComponent (Spec Sections 2.2, 6.1)

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ChatContainerComponent {
  // Required inputs
  messages = input.required<ChatMessage[]>();
  currentUserId = input.required<string>();

  // Optional inputs
  typingIndicator = input<TypingIndicator | null>(null);
  quickReplies = input<QuickReplySet | null>(null);
  pendingAttachments = input<Attachment[]>([]);
  inputValue = model<string>('');  // Two-way binding
  disabled = input<boolean>(false);

  // Outputs
  messageSend = output<MessageSendEvent>();
  messageRetry = output<ChatMessage>();
  attachmentSelect = output<File[]>();
  attachmentRemove = output<Attachment>();
  quickReplySubmit = output<QuickReplySubmitEvent>();
  imagePreview = output<ImageContent>();
  fileDownload = output<FileContent>();
  scrollTop = output<void>();
}
```

**Layout:**
- Flexbox column layout: header (auto) → messages (flex: 1) → footer (auto)
- `container-type: inline-size` for container queries
- Full height of parent container
- Message area fills all available vertical space

**Content Projection Slots (Spec Section 11):**
```html
<ng-content select="[chatHeader]"></ng-content>
<ng-content select="[chatEmptyState]"></ng-content>
<ng-content select="[chatFooterActions]"></ng-content>
<ng-content select="[chatFooterPrefix]"></ng-content>
```

### 2. ChatHeaderComponent

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ChatHeaderComponent {
  // Pure projection component - no inputs/outputs
}
```

**Features:**
- `[chatHeader]` content projection slot
- Fixed height or auto based on projected content
- Styling with CSS tokens
- Border-bottom separator

### 3. ChatFooterComponent

**Structure:**
```typescript
@Component({
  selector: 'ngx-chat-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ChatFooterComponent {
  pendingAttachments = input<Attachment[]>([]);
  inputValue = model<string>('');
  disabled = input<boolean>(false);
  hasContent = input<boolean>(false);

  messageSend = output<void>();
  attachmentSelect = output<File[]>();
  attachmentRemove = output<Attachment>();
}
```

**Features:**
- Container for input area and actions
- `[chatFooterActions]` projection slot (after send button)
- `[chatFooterPrefix]` projection slot (before input)
- Styling with CSS tokens
- Border-top separator

### 4. Initial CSS Token Structure (Spec Section 8)

**Internal tokens file (`_tokens.scss`):**
```scss
:host {
  // Colors
  --_chat-bg: var(--ngx-chat-bg, #ffffff);
  --_chat-header-bg: var(--ngx-chat-header-bg, var(--_chat-bg));
  --_chat-footer-bg: var(--ngx-chat-footer-bg, var(--_chat-bg));
  --_chat-message-area-bg: var(--ngx-chat-message-area-bg, var(--_chat-bg));

  // Spacing
  --_spacing-xs: var(--ngx-spacing-xs, 4px);
  --_spacing-sm: var(--ngx-spacing-sm, 8px);
  --_spacing-md: var(--ngx-spacing-md, 16px);
  --_spacing-lg: var(--ngx-spacing-lg, 24px);
  --_spacing-xl: var(--ngx-spacing-xl, 32px);

  --_header-padding: var(--ngx-header-padding, var(--_spacing-md));
  --_footer-padding: var(--ngx-footer-padding, var(--_spacing-md));

  // Border Radius
  --_radius-sm: var(--ngx-radius-sm, 4px);
  --_radius-md: var(--ngx-radius-md, 12px);
  --_radius-lg: var(--ngx-radius-lg, 16px);

  // Typography
  --_font-family: var(--ngx-font-family, system-ui, -apple-system, sans-serif);
  --_font-size-md: var(--ngx-font-size-md, 1rem);
}
```

**Exported tokens file (`tokens.css`):**
```css
:root {
  /* Colors */
  --ngx-chat-bg: #ffffff;
  --ngx-chat-header-bg: #ffffff;
  --ngx-chat-footer-bg: #ffffff;
  --ngx-chat-message-area-bg: #ffffff;

  /* Spacing */
  --ngx-spacing-xs: 4px;
  --ngx-spacing-sm: 8px;
  --ngx-spacing-md: 16px;
  --ngx-spacing-lg: 24px;
  --ngx-spacing-xl: 32px;

  /* ... all tokens with defaults */
}
```

### 5. Container Query Setup (Spec Section 10)

```scss
:host {
  container-type: inline-size;
  container-name: chat;
  display: flex;
  flex-direction: column;
  height: 100%;
}

@container chat (max-width: 299px) {
  // Small container adaptations
}

@container chat (min-width: 300px) and (max-width: 599px) {
  // Medium container adaptations
}

@container chat (min-width: 600px) {
  // Large container adaptations
}
```

---

## Success Criteria

- [ ] ChatContainerComponent renders with projected content
- [ ] All 7 signal inputs functional (messages, currentUserId, typingIndicator, quickReplies, pendingAttachments, inputValue, disabled)
- [ ] All 8 outputs wired and emit events (messageSend, messageRetry, attachmentSelect, attachmentRemove, quickReplySubmit, imagePreview, fileDownload, scrollTop)
- [ ] Container queries applied at 3 breakpoints (<300px, 300-600px, >600px)
- [ ] Content projection working for all 4 slots (chatHeader, chatEmptyState, chatFooterActions, chatFooterPrefix)
- [ ] CSS tokens system established with public/internal pattern
- [ ] `tokens.css` exported in build
- [ ] Unit tests for all components
- [ ] Components use OnPush change detection
- [ ] All inputs use signal APIs (`input()`, `model()`)

---

## Deliverables

1. **Components:**
   - `projects/ngx-support-chat/src/lib/components/chat-container/chat-container.component.ts`
   - `projects/ngx-support-chat/src/lib/components/chat-container/chat-container.component.html`
   - `projects/ngx-support-chat/src/lib/components/chat-container/chat-container.component.scss`
   - `projects/ngx-support-chat/src/lib/components/chat-container/chat-container.component.spec.ts`
   - `projects/ngx-support-chat/src/lib/components/chat-header/chat-header.component.ts`
   - `projects/ngx-support-chat/src/lib/components/chat-header/chat-header.component.html`
   - `projects/ngx-support-chat/src/lib/components/chat-header/chat-header.component.scss`
   - `projects/ngx-support-chat/src/lib/components/chat-header/chat-header.component.spec.ts`
   - `projects/ngx-support-chat/src/lib/components/chat-footer/chat-footer.component.ts`
   - `projects/ngx-support-chat/src/lib/components/chat-footer/chat-footer.component.html`
   - `projects/ngx-support-chat/src/lib/components/chat-footer/chat-footer.component.scss`
   - `projects/ngx-support-chat/src/lib/components/chat-footer/chat-footer.component.spec.ts`

2. **Styles:**
   - `projects/ngx-support-chat/src/styles/_tokens.scss`
   - `projects/ngx-support-chat/src/styles/tokens.css`

3. **Updated Exports:**
   - `projects/ngx-support-chat/src/public-api.ts`

---

## Technical Notes

### Component Communication Pattern
ChatContainerComponent acts as the orchestrator:
- Receives all data from parent
- Passes relevant data to child components
- Bubbles up outputs from children to parent

```html
<!-- chat-container.component.html -->
<ngx-chat-header>
  <ng-content select="[chatHeader]"></ng-content>
</ngx-chat-header>

<ngx-chat-message-area
  [messages]="messages()"
  [currentUserId]="currentUserId()"
  <!-- ... outputs bubble up -->
>
  <ng-content select="[chatEmptyState]"></ng-content>
</ngx-chat-message-area>

<ngx-chat-footer
  [pendingAttachments]="pendingAttachments()"
  [(inputValue)]="inputValue"
  <!-- ... -->
>
  <ng-content select="[chatFooterPrefix]"></ng-content>
  <ng-content select="[chatFooterActions]"></ng-content>
</ngx-chat-footer>
```

### Container Query vs Media Query
This library uses container queries (`@container`) instead of viewport media queries (`@media`) so the chat adapts to its container size, not the browser viewport. This enables embedding the chat in sidebars, modals, or any constrained container.

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Component Structure | 2.2 |
| Component Inputs | 3 |
| Component Outputs | 4 |
| Layout Structure | 6.1 |
| CSS Tokens | 8 |
| Container Queries | 10 |
| Content Projection | 11 |
| Example Usage | 12 |

---

**This document is IMMUTABLE. Do not modify after task start.**
