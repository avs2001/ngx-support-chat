# System Architecture

**Document ID:** ARCH-SYS-001
**Version:** 1.0
**Created:** 2025-12-28
**Last Updated:** 2025-12-28
**Status:** Draft

---

## 1. Executive Summary

ngx-support-chat is a **pure presentational Angular component library** for customer support chat interfaces. It provides a complete set of UI components for rendering chat conversations while delegating all business logic (HTTP calls, state management, side effects) to the consuming application.

The library is designed for Angular 21+ applications, leveraging modern features like signals, standalone components, and OnPush change detection for optimal performance.

---

## 2. System Overview

### 2.1 Purpose

Provide a reusable, customizable, and accessible chat UI component library that:
- Renders messages, attachments, and interactive elements
- Captures user interactions and emits them to parent components
- Adapts to any container size via container queries
- Supports theming through CSS custom properties

### 2.2 Scope

**System Boundaries:**
- **Included:** All UI rendering, user interaction capture, accessibility features, theming
- **Excluded:** HTTP communication, state management, business logic, authentication

### 2.3 Key Stakeholders

| Stakeholder | Role | Concerns |
|-------------|------|----------|
| Library Consumers | Angular Developers | Easy integration, customization, performance |
| End Users | Chat participants | Usability, accessibility, responsiveness |
| Maintainers | Library developers | Code quality, testability, extensibility |

### 2.4 Quality Attributes

| Attribute | Priority | Target |
|-----------|----------|--------|
| Performance | High | Virtual scrolling for 1000+ messages |
| Accessibility | High | WCAG AA compliant, AXE passing |
| Customizability | High | Full theming via CSS tokens |
| Bundle Size | Medium | < 50KB gzipped |
| Maintainability | Medium | 80% test coverage |

---

## 3. Architectural Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| Presentational Only | No side effects, HTTP, or state management | Maximum reusability |
| Signal-Based Reactivity | Use Angular signals for all reactive state | Performance, modern patterns |
| Container Query Responsive | Adapt to container, not viewport | Embeddable in any layout |
| Composition over Inheritance | Small, focused components | Flexibility, testability |
| Token-Based Theming | CSS custom properties for all visuals | Zero-code customization |

---

## 4. System Context

### 4.1 Context Diagram

```
                    ┌─────────────────────────────────────┐
                    │         CONSUMING APPLICATION        │
                    │   (Angular App with Business Logic)  │
                    └─────────────────┬───────────────────┘
                                      │
                    Inputs:           │           Outputs:
                    - messages[]      │           - messageSend
                    - typingIndicator │           - messageRetry
                    - quickReplies    │           - attachmentSelect
                    - currentUserId   │           - quickReplySubmit
                    - pendingAttach.  │           - imagePreview
                    - inputValue      │           - fileDownload
                    - disabled        │           - scrollTop
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         ngx-support-chat             │
                    │   (Presentational Component Lib)     │
                    └─────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              ┌──────────┐     ┌──────────┐     ┌──────────┐
              │  Angular │     │  Angular │     │   ngx-   │
              │   CDK    │     │  Common  │     │ markdown │
              │(scrolling│     │  (pipes) │     │(optional)│
              │  a11y)   │     │          │     │          │
              └──────────┘     └──────────┘     └──────────┘
```

### 4.2 External Interfaces

| System | Direction | Protocol | Purpose |
|--------|-----------|----------|---------|
| Consuming App | Inbound | Angular Inputs | Receive data to display |
| Consuming App | Outbound | Angular Outputs | Emit user interactions |
| Angular CDK | Dependency | npm package | Virtual scrolling, accessibility |
| ngx-markdown | Optional Dep | npm package | Markdown rendering |

---

## 5. High-Level Architecture

### 5.1 Architecture Style

**Primary Style:** Component-Based Presentational Library

**Rationale:**
- Maximizes reusability across different applications
- Allows consuming apps to own business logic
- Simplifies testing (no mocking of HTTP/state)
- Enables tree-shaking for minimal bundle size

### 5.2 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ngx-chat-container                          │
│  (Main container - receives all inputs, emits all outputs)          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      ngx-chat-header                          │   │
│  │              (Content projection: [chatHeader])               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   ngx-chat-message-area                       │   │
│  │                  (Virtual-scrolled list)                      │   │
│  │                                                                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │   │
│  │  │ngx-date-separator│  │ngx-message-group│                    │   │
│  │  │  (Sticky dates)  │  │ (Grouped msgs)  │                    │   │
│  │  └─────────────────┘  │                  │                    │   │
│  │                        │  ┌───────────┐  │                    │   │
│  │                        │  │ngx-message│  │                    │   │
│  │                        │  │ (Bubble)  │  │                    │   │
│  │                        │  └───────────┘  │                    │   │
│  │                        └─────────────────┘                    │   │
│  │                                                                │   │
│  │  ┌─────────────────┐  ┌─────────────────────┐                │   │
│  │  │ngx-quick-replies│  │ngx-typing-indicator │                │   │
│  │  │   (Buttons)     │  │   (Animated dots)   │                │   │
│  │  └─────────────────┘  └─────────────────────┘                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      ngx-chat-footer                          │   │
│  │                                                                │   │
│  │  ┌──────────────────┐  ┌─────────────┐  ┌────────────────┐  │   │
│  │  │ngx-attachment-   │  │ngx-text-    │  │ngx-action-     │  │   │
│  │  │preview (Chips)   │  │input (Auto) │  │buttons (Send)  │  │   │
│  │  └──────────────────┘  └─────────────┘  └────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Component Descriptions

| Component | Responsibility | File Location |
|-----------|----------------|---------------|
| ngx-chat-container | Main container, input/output hub | components/chat-container/ |
| ngx-chat-header | Header area with content projection | components/chat-header/ |
| ngx-chat-message-area | Virtual-scrolled message list | components/chat-message-area/ |
| ngx-message-group | Groups consecutive same-sender messages | components/chat-message-group/ |
| ngx-message | Individual message bubble | components/chat-message/ |
| ngx-date-separator | Sticky date groupings | components/chat-date-separator/ |
| ngx-quick-replies | Interactive reply buttons | components/chat-quick-replies/ |
| ngx-typing-indicator | Animated typing dots | components/chat-typing-indicator/ |
| ngx-chat-footer | Input area container | components/chat-footer/ |
| ngx-text-input | Auto-resizing textarea | components/chat-input/ |
| ngx-attachment-preview | Pending attachment chips | components/chat-attachment-preview/ |
| ngx-action-buttons | Send, attach buttons | [TO BE DEFINED] |

---

## 6. Data Architecture

### 6.1 Data Flow Diagram

```
[Parent Component]
       │
       │ @Input() messages: ChatMessage[]
       │ @Input() typingIndicator: TypingIndicator | null
       │ @Input() quickReplies: QuickReplySet | null
       │ @Input() currentUserId: string
       │ @Input() pendingAttachments: Attachment[]
       │ @model() inputValue: string
       │ @Input() disabled: boolean
       ▼
┌──────────────────┐
│ ngx-chat-container│
│                   │
│  ┌─────────────┐ │      @Output() messageSend
│  │   Computed  │ │      @Output() messageRetry
│  │   Signals   │ │ ────▶@Output() attachmentSelect
│  │(grouping,   │ │      @Output() attachmentRemove
│  │ filtering)  │ │      @Output() quickReplySubmit
│  └─────────────┘ │      @Output() imagePreview
│                   │      @Output() fileDownload
│  Components      │      @Output() scrollTop
│  receive slices  │
│  of data         │
└──────────────────┘
       │
       ▼
[Child Components render UI]
```

### 6.2 Key Data Models

**Entry Point:** `ngx-support-chat/models`

| Model | Purpose |
|-------|---------|
| ChatMessage | Core message structure with type, content, status |
| TextContent / ImageContent / FileContent / SystemContent | Type-specific content payloads |
| QuickReplySet / QuickReplyOption | Interactive quick reply definitions |
| TypingIndicator | Who is currently typing |
| Attachment | Pending file attachment |
| ChatConfig | Injection token configuration |

---

## 7. Technology Stack

### 7.1 Languages & Frameworks

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Framework | Angular | 21.x | Latest LTS, signals support |
| Language | TypeScript | 5.x | Type safety, tooling |
| Styling | SCSS | N/A | Variables, nesting, mixins |
| Build | ng-packagr | N/A | Standard Angular library build |

### 7.2 Dependencies

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Virtual Scrolling | @angular/cdk/scrolling | Performance for large lists |
| Accessibility | @angular/cdk/a11y | Focus management, announcements |
| Markdown | ngx-markdown (optional) | Formatted message support |

---

## 8. Styling Architecture

### 8.1 Token-Based Theming

All visual customization through CSS custom properties:

```
Public Tokens (Consumer-Facing):
--ngx-chat-bg
--ngx-bubble-user-bg
--ngx-bubble-agent-bg
--ngx-spacing-md
--ngx-radius-md
... (60+ tokens)

Internal Tokens (Component-Scoped):
--_chat-bg: var(--ngx-chat-bg, #ffffff);
--_bubble-user-bg: var(--ngx-bubble-user-bg, #0066cc);
```

### 8.2 Responsive Strategy

Container queries, not viewport media queries:

```css
@container chat (max-width: 299px) { /* Small */ }
@container chat (min-width: 300px) and (max-width: 599px) { /* Medium */ }
@container chat (min-width: 600px) { /* Large */ }
```

---

## 9. Library Entry Points

| Entry Point | Contents |
|-------------|----------|
| `ngx-support-chat` | Components, directives, pipes, provideChatConfig |
| `ngx-support-chat/models` | All TypeScript interfaces |
| `ngx-support-chat/tokens` | CHAT_CONFIG injection token |

---

## 10. Constraints & Assumptions

### 10.1 Constraints

| Constraint | Source | Impact |
|------------|--------|--------|
| Angular 21+ only | Technical | Cannot support older Angular versions |
| No business logic | Architectural | Parent must handle all side effects |
| Peer dependency on CDK | Technical | Consumers must install @angular/cdk |

### 10.2 Assumptions

| Assumption | Risk if Wrong | Mitigation |
|------------|---------------|------------|
| Consumers use OnPush | Performance degradation | Document requirement |
| Modern browser support | CSS features fail | Browserslist config |
| Signal adoption | API confusion | Clear documentation |

---

## 11. Future Considerations

| Item | Priority | Trigger |
|------|----------|---------|
| Voice message support | Low | User demand |
| Reactions/emoji on messages | Medium | Feature request |
| Rich text editing | Low | Enterprise demand |
| RTL language support | Medium | Internationalization |

---

## 12. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2025-12-28 | Session 1 | Changed prefix from `nsc-` to `ngx-` for consistency with library name |
| 1.0 | 2025-12-28 | SDP Setup | Initial creation during SDP v2.2 setup |

---

**Template Version:** 1.0
**Compatible with:** SDP v2.2
