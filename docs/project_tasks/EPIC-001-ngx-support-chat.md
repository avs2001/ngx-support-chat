# EPIC-001: ngx-support-chat Library Implementation

**Created:** 2025-12-28
**Status:** Planning
**Specification:** ngx-support-chat-specification.md (v1.0)

---

## Executive Summary

Implement a **pure presentational Angular 21 component library** for customer support chat. The library receives all data via signal inputs, emits user interactions via outputs, and delegates all business logic to parent components. Fully customizable through CSS custom properties and Angular injection tokens.

---

## Success Criteria (Epic-Level)

- [ ] All 11 components implemented per specification
- [ ] All 7 outputs emit correct payloads
- [ ] Virtual scrolling handles 1000+ messages performantly
- [ ] 80%+ test coverage maintained
- [ ] Full accessibility (WCAG 2.1 AA keyboard + ARIA)
- [ ] CSS token system complete with documented defaults
- [ ] Container queries working at all three breakpoints
- [ ] Demo application showcasing all features
- [ ] ng-add schematic functional
- [ ] CI/CD pipeline passing
- [ ] Published to npm (or ready for publish)

---

## Architecture Overview

```
<ngx-chat-container>                    [TASK-003]
├── <ngx-chat-header>                   [TASK-003] (ng-content projection)
├── <ngx-chat-message-area>             [TASK-004] (virtual-scrolled)
│     ├── <ngx-date-separator>          [TASK-004] (sticky date groupings)
│     ├── <ngx-message-group>           [TASK-004] (grouped consecutive messages)
│     │     └── <ngx-message>           [TASK-004] (individual bubble)
│     ├── <ngx-quick-replies>           [TASK-005] (interactive buttons)
│     └── <ngx-typing-indicator>        [TASK-005]
└── <ngx-chat-footer>                   [TASK-003]
      ├── <ngx-attachment-preview>      [TASK-005]
      ├── <ngx-text-input>              [TASK-005]
      └── <ngx-action-buttons>          [TASK-005]
```

---

## Phase 1: Foundation (TASK-001 to TASK-002)

**Goal:** Establish project infrastructure and core abstractions.

### TASK-001: Project Foundation & Workspace Setup

**Complexity:** Medium
**Estimated Sessions:** 1-2
**Dependencies:** None

**Scope:**
1. Create Angular CLI workspace with `projects/` structure
2. Configure library project `ngx-support-chat`
3. Configure demo application project `demo`
4. TypeScript strict configuration (per spec section 13.3)
5. ESLint flat config with Angular rules (per spec section 19.1)
6. Prettier configuration (per spec section 19.2)
7. Vitest setup with @analogjs/vite-plugin-angular (per spec section 18.1)
8. ng-packagr configuration (per spec section 17.1)
9. Initial package.json with peer dependencies (per spec section 15.1)
10. .browserslistrc configuration (per spec section 17.3)

**Success Criteria:**
- [ ] `npm install` completes without errors
- [ ] `npm run build:lib` produces dist/ngx-support-chat
- [ ] `npm run test` executes (even with no tests yet)
- [ ] `npm run lint` passes
- [ ] Workspace structure matches spec section 14.1

**Deliverables:**
- Angular workspace with library + demo projects
- All tooling configured and functional
- Empty component shells ready for implementation

---

### TASK-002: Data Models & Configuration

**Complexity:** Low-Medium
**Estimated Sessions:** 1
**Dependencies:** TASK-001

**Scope:**
1. Implement all TypeScript interfaces (spec section 5):
   - `ChatMessage`, `TextContent`, `ImageContent`, `FileContent`, `SystemContent`
   - `QuickReplySet`, `QuickReplyOption`
   - `TypingIndicator`
   - `Attachment`
   - `MessageSendEvent`, `QuickReplySubmitEvent`
2. Create `CHAT_CONFIG` injection token (spec section 7.1)
3. Implement `ChatConfig` interface with defaults (spec section 7.2)
4. Create `provideChatConfig()` factory function
5. Set up secondary entry points:
   - `ngx-support-chat/models`
   - `ngx-support-chat/tokens`
6. Create ChatConfigService for DI

**Success Criteria:**
- [ ] All interfaces exported from `ngx-support-chat/models`
- [ ] `CHAT_CONFIG` token exported from `ngx-support-chat/tokens`
- [ ] `provideChatConfig()` works in demo app.config.ts
- [ ] Default configuration applied when no config provided
- [ ] Unit tests for config service

**Deliverables:**
- Complete type system
- Configuration injection infrastructure
- Secondary entry points working

---

## Phase 2: Core Components (TASK-003 to TASK-004)

**Goal:** Implement the main structural components.

### TASK-003: Core Container & Layout Components

**Complexity:** Medium
**Estimated Sessions:** 2
**Dependencies:** TASK-002

**Scope:**
1. **ChatContainerComponent** (spec sections 2.2, 6.1):
   - Main wrapper with flexbox column layout
   - Container query setup (`container-type: inline-size`)
   - All signal inputs from spec section 3
   - All outputs from spec section 4
   - Content projection slots (spec section 11)

2. **ChatHeaderComponent**:
   - `[chatHeader]` content projection slot
   - Fixed/auto height based on content
   - Styling with CSS tokens

3. **ChatFooterComponent**:
   - Container for input area and actions
   - `[chatFooterActions]` projection slot
   - `[chatFooterPrefix]` projection slot
   - Styling with CSS tokens

4. **Initial CSS Token Structure** (spec section 8):
   - Internal tokens with fallbacks (`--_chat-*`)
   - Public token documentation
   - tokens.css export file

**Success Criteria:**
- [ ] ChatContainerComponent renders with projected content
- [ ] All 7 signal inputs functional
- [ ] All 8 outputs wired (emit placeholder events)
- [ ] Container queries applied at 3 breakpoints
- [ ] Content projection working for all slots
- [ ] CSS tokens system established

**Deliverables:**
- ChatContainerComponent
- ChatHeaderComponent
- ChatFooterComponent
- Initial CSS token infrastructure

---

### TASK-004: Message Display Components

**Complexity:** High
**Estimated Sessions:** 2-3
**Dependencies:** TASK-003

**Scope:**
1. **ChatMessageAreaComponent** (spec section 6.2):
   - CDK virtual scrolling viewport
   - Variable height item support
   - `scrollTop` output when reaching top
   - "Scroll to bottom" indicator logic

2. **ChatDateSeparatorComponent** (spec section 6.2):
   - Sticky positioning during scroll
   - "Today", "Yesterday", or formatted date
   - Centered, subtle styling

3. **ChatMessageGroupComponent** (spec section 6.3):
   - Groups consecutive messages from same sender
   - Avatar/name on first message only
   - Reduced spacing for grouped messages
   - Timestamp on last message or hover

4. **ChatMessageComponent** (spec section 6.3):
   - All message types: text, image, file, system
   - All states: sending, sent, delivered, read, failed
   - Alignment based on currentUserId
   - Retry button for failed messages
   - `messageRetry` output
   - `imagePreview` output for image clicks
   - `fileDownload` output for file downloads

5. **Message Grouping Utility** (spec implied):
   - Group messages by sender + time threshold
   - Group messages by date for separators

**Success Criteria:**
- [ ] Virtual scrolling renders 1000+ messages smoothly
- [ ] Date separators appear and stick correctly
- [ ] Message grouping logic correct
- [ ] All 4 message types render correctly
- [ ] All 5 message states display correctly
- [ ] User messages align right, agent messages align left
- [ ] System messages centered
- [ ] Failed message retry works
- [ ] Image/file click outputs emit

**Deliverables:**
- ChatMessageAreaComponent
- ChatDateSeparatorComponent
- ChatMessageGroupComponent
- ChatMessageComponent
- message-grouping.util.ts
- date-helpers.util.ts

---

## Phase 3: Interactive Components (TASK-005)

**Goal:** Implement user interaction components.

### TASK-005: Interactive Input Components

**Complexity:** High
**Estimated Sessions:** 2-3
**Dependencies:** TASK-004

**Scope:**
1. **ChatQuickRepliesComponent** (spec section 6.4):
   - Three types: confirmation, single-choice, multiple-choice
   - Vertical/horizontal layout options
   - Disabled state after submission
   - Selected state visualization
   - `quickReplySubmit` output

2. **ChatTypingIndicatorComponent** (spec section 6.5):
   - Animated three-dot indicator
   - Agent avatar display
   - Optional "{Name} is typing..." text
   - Message-bubble-like container

3. **ChatInputComponent** (spec section 6.6):
   - Auto-resizing textarea
   - Enter sends, Shift+Enter newlines
   - Placeholder text
   - Max height with scroll
   - Two-way `inputValue` binding (model signal)

4. **ChatAttachmentPreviewComponent** (spec section 6.6):
   - Horizontal scrollable chip row
   - Thumbnail for images, icon for files
   - Truncated filename
   - Remove button per chip
   - `attachmentRemove` output

5. **ChatActionButtonsComponent** (spec section 6.6):
   - Send button (enabled when content/attachments exist)
   - Attachment button (triggers file picker)
   - `messageSend` output
   - `attachmentSelect` output

6. **AutoResizeDirective**:
   - Auto-resize textarea height
   - Respect max-height

7. **AutoScrollDirective**:
   - Auto-scroll to bottom on new messages
   - Maintain position if user scrolled up

**Success Criteria:**
- [ ] All 3 quick reply types work correctly
- [ ] Quick replies disable after submission
- [ ] Typing indicator animates smoothly
- [ ] Input auto-resizes up to max height
- [ ] Enter/Shift+Enter behavior correct
- [ ] Attachment chips display with remove
- [ ] Send enabled only when content exists
- [ ] File picker opens on attach click
- [ ] All outputs emit correct payloads

**Deliverables:**
- ChatQuickRepliesComponent
- ChatTypingIndicatorComponent
- ChatInputComponent
- ChatAttachmentPreviewComponent
- ChatActionButtonsComponent
- AutoResizeDirective
- AutoScrollDirective

---

## Phase 4: Support Features (TASK-006 to TASK-007)

**Goal:** Implement supporting features and accessibility.

### TASK-006: Pipes & Utilities

**Complexity:** Low
**Estimated Sessions:** 1
**Dependencies:** TASK-004

**Scope:**
1. **FileSizePipe**:
   - Convert bytes to human-readable (KB, MB, GB)
   - Optional decimal precision

2. **TimeAgoPipe**:
   - Relative time display ("2 minutes ago")
   - Falls back to formatted time after threshold

3. **SafeMarkdownPipe** (optional, if markdown enabled):
   - Sanitize and render markdown
   - Integrate with ngx-markdown if available
   - Fallback to plain text if not

4. **Utility Functions**:
   - Message grouping algorithm
   - Date comparison helpers

**Success Criteria:**
- [ ] FileSizePipe formats all size ranges correctly
- [ ] TimeAgoPipe updates appropriately
- [ ] SafeMarkdownPipe sanitizes dangerous content
- [ ] Markdown renders when enabled
- [ ] Fallback works when ngx-markdown not installed
- [ ] Unit tests for all pipes

**Deliverables:**
- FileSizePipe
- TimeAgoPipe
- SafeMarkdownPipe
- Utility function tests

---

### TASK-007: Accessibility Implementation

**Complexity:** Medium
**Estimated Sessions:** 1-2
**Dependencies:** TASK-005

**Scope:**
1. **Keyboard Navigation** (spec section 9.1):
   - Tab order per specification
   - Arrow key navigation in message area
   - Enter to send, Escape to exit navigation

2. **ARIA Attributes** (spec section 9.2):
   - Container: `role="log"`, `aria-live="polite"`
   - Messages: `role="listitem"`, descriptive `aria-label`
   - System messages: `role="status"`
   - Typing indicator: `aria-live="polite"`
   - Quick replies: proper radio/checkbox roles
   - Input: `aria-label`, `aria-multiline`

3. **Focus Management** (spec section 9.3):
   - Focus returns to input after send
   - Focus returns to input after quick reply
   - New messages don't steal focus
   - Retry button receives focus after retry

4. **Screen Reader** (spec section 9.4):
   - Messages announced with sender, time, content
   - Status changes announced subtly
   - Typing indicator announced once
   - File attachments fully announced

**Success Criteria:**
- [ ] Tab navigation follows specified order
- [ ] Arrow keys navigate messages
- [ ] All ARIA attributes present
- [ ] Focus management works per spec
- [ ] Screen reader announces appropriately
- [ ] No accessibility linting errors

**Deliverables:**
- Accessibility attributes on all components
- Keyboard navigation handlers
- Focus management logic
- a11y test suite

---

## Phase 5: Styling & Theming (TASK-008)

**Goal:** Complete the CSS token system and theming.

### TASK-008: Complete Styling System

**Complexity:** Medium
**Estimated Sessions:** 1-2
**Dependencies:** TASK-005

**Scope:**
1. **Complete CSS Token System** (spec section 8):
   - All color tokens (8.1)
   - All spacing tokens (8.2)
   - All border radius tokens (8.3)
   - All typography tokens (8.4)
   - All dimension tokens (8.5)
   - All animation tokens (8.6)

2. **Default Theme** (spec section 16.3):
   - Complete default values
   - Works without any customization

3. **Container Queries** (spec section 10):
   - Small (<300px): compact mode
   - Medium (300-600px): standard mode
   - Large (>600px): desktop mode

4. **Exported Assets**:
   - tokens.css for consumers
   - Documentation of all tokens

**Success Criteria:**
- [ ] All tokens from spec section 8 implemented
- [ ] Default theme looks polished
- [ ] Container queries adapt at breakpoints
- [ ] tokens.css exported in build
- [ ] Consumers can override any token

**Deliverables:**
- Complete _tokens.scss
- _theme-default.scss
- tokens.css export
- Container query styles
- Token documentation

---

## Phase 6: Demo & Packaging (TASK-009 to TASK-011)

**Goal:** Complete demo application and prepare for publishing.

### TASK-009: Demo Application

**Complexity:** Medium
**Estimated Sessions:** 1-2
**Dependencies:** TASK-008

**Scope:**
1. **MockChatService** (spec section 22.2):
   - Message simulation
   - Typing indicator simulation
   - Quick reply generation
   - Agent response delays

2. **Demo AppComponent** (spec section 22.1):
   - Full chat integration
   - Configuration panel
   - Theme customization controls
   - Container size adjuster

3. **Demo Features** (spec section 22.3):
   - All message types demonstrated
   - All message states shown
   - All quick reply types
   - Virtual scrolling with 100+ messages
   - Markdown toggle
   - Attachment flow

**Success Criteria:**
- [ ] Demo showcases all library features
- [ ] Mock service simulates realistic chat
- [ ] Theme customization works live
- [ ] Container resize demonstrates breakpoints
- [ ] Demo is presentable for documentation

**Deliverables:**
- Complete demo application
- MockChatService
- Mock data files
- Demo styles

---

### TASK-010: Schematics & Packaging

**Complexity:** Medium
**Estimated Sessions:** 1
**Dependencies:** TASK-008

**Scope:**
1. **ng-add Schematic** (spec section 20):
   - collection.json configuration
   - schema.json with options
   - Add @angular/cdk peer dependency
   - Optional ngx-markdown installation
   - Add CSS tokens to global styles
   - Log configuration instructions

2. **Package Configuration**:
   - Library package.json complete
   - Peer dependencies correct
   - Schematics linked
   - Assets configured

3. **Build Verification**:
   - `npm run build` produces correct output
   - `npm pack` creates valid tarball
   - Local install works in test project

**Success Criteria:**
- [ ] `ng add ngx-support-chat` works
- [ ] CDK dependency added automatically
- [ ] Optional markdown installation works
- [ ] CSS tokens added to styles
- [ ] Package tarball installs correctly

**Deliverables:**
- Complete ng-add schematic
- Final package.json
- Build scripts verified

---

### TASK-011: CI/CD Pipeline

**Complexity:** Low-Medium
**Estimated Sessions:** 1
**Dependencies:** TASK-010

**Scope:**
1. **CI Workflow** (spec section 21.1):
   - Lint job
   - Test job with coverage
   - Build job
   - Demo deployment to GitHub Pages

2. **Release Workflow** (spec section 21.2):
   - Tag-triggered release
   - npm publish with provenance
   - GitHub release creation

3. **Branch Protection**:
   - PR required for main
   - CI must pass
   - Coverage thresholds enforced

**Success Criteria:**
- [ ] CI runs on all PRs
- [ ] Tests execute with coverage reporting
- [ ] Build artifacts uploaded
- [ ] Demo deploys on main merge
- [ ] Release workflow publishes to npm
- [ ] All workflows pass

**Deliverables:**
- .github/workflows/ci.yml
- .github/workflows/release.yml
- Branch protection documentation

---

## Task Dependency Graph

```
TASK-001 (Foundation)
    │
    └──► TASK-002 (Models)
              │
              └──► TASK-003 (Container)
                        │
                        ├──► TASK-004 (Messages)
                        │         │
                        │         └──► TASK-006 (Pipes)
                        │
                        └──► TASK-005 (Interactive)
                                  │
                                  ├──► TASK-007 (A11y)
                                  │
                                  └──► TASK-008 (Styling)
                                            │
                                            ├──► TASK-009 (Demo)
                                            │
                                            └──► TASK-010 (Schematics)
                                                      │
                                                      └──► TASK-011 (CI/CD)
```

---

## Milestones

### M1: Foundation Complete
**Tasks:** TASK-001, TASK-002
**Deliverable:** Buildable library with types and configuration

### M2: Core UI Complete
**Tasks:** TASK-003, TASK-004
**Deliverable:** Message display functional with virtual scrolling

### M3: Interactive Complete
**Tasks:** TASK-005, TASK-006
**Deliverable:** Full user interaction support

### M4: Production Ready
**Tasks:** TASK-007, TASK-008
**Deliverable:** Accessible, themeable component library

### M5: Published
**Tasks:** TASK-009, TASK-010, TASK-011
**Deliverable:** Demo deployed, package published to npm

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Virtual scroll performance | Medium | High | Early prototyping with 1000+ items |
| CDK version compatibility | Low | Medium | Pin to Angular 21 compatible versions |
| Markdown optional dep complexity | Medium | Low | Clean fallback, lazy loading |
| Container query browser support | Low | Low | Modern browsers only per .browserslistrc |
| Accessibility completeness | Medium | High | Use CDK a11y, test with screen readers |

---

## Progress Tracking

| Task | Status | Sessions | Notes |
|------|--------|----------|-------|
| TASK-001 | Not Started | - | - |
| TASK-002 | Not Started | - | - |
| TASK-003 | Not Started | - | - |
| TASK-004 | Not Started | - | - |
| TASK-005 | Not Started | - | - |
| TASK-006 | Not Started | - | - |
| TASK-007 | Not Started | - | - |
| TASK-008 | Not Started | - | - |
| TASK-009 | Not Started | - | - |
| TASK-010 | Not Started | - | - |
| TASK-011 | Not Started | - | - |

**Epic Progress:** 0/11 tasks complete (0%)

---

## Appendix: Component-to-Spec Mapping

| Component | Spec Sections |
|-----------|---------------|
| ChatContainerComponent | 2.2, 3, 4, 6.1, 11, 12 |
| ChatHeaderComponent | 6.1, 11 |
| ChatFooterComponent | 6.1, 6.6, 11 |
| ChatMessageAreaComponent | 6.2 |
| ChatDateSeparatorComponent | 6.2 |
| ChatMessageGroupComponent | 6.3 |
| ChatMessageComponent | 5.1, 5.2, 6.3 |
| ChatQuickRepliesComponent | 5.3, 6.4 |
| ChatTypingIndicatorComponent | 5.4, 6.5 |
| ChatInputComponent | 6.6 |
| ChatAttachmentPreviewComponent | 5.5, 6.6 |
| ChatActionButtonsComponent | 6.6 |
| AutoResizeDirective | 6.6 |
| AutoScrollDirective | 6.2 |
| FileSizePipe | 6.3 |
| TimeAgoPipe | 6.3 |
| SafeMarkdownPipe | 6.3 |
| CHAT_CONFIG | 7 |
| CSS Tokens | 8 |
| Accessibility | 9 |
| Container Queries | 10 |
| Schematics | 20 |
| CI/CD | 21 |
| Demo | 22 |
