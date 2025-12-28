# Session 9 Start

**Date:** 2025-12-28
**Task:** TASK-005 - Interactive Input Components
**Starting Milestone:** M1 - Quick Replies & Typing

---

## Session Goals

1. **Primary:** Implement ChatQuickRepliesComponent with all 3 types
2. **Secondary:** Implement ChatTypingIndicatorComponent with animation
3. **If time:** Start on ChatInputComponent and AutoResizeDirective

---

## Starting Context

- TASK-004 completed in Session 8
- All message display components working
- No active implementation_status.md (fresh task start)
- Starting from clean main branch

---

## Plan

### Phase 1: Quick Replies
- Create component structure (ts, html, scss, spec)
- Implement confirmation type (simplest)
- Implement single-choice type
- Implement multiple-choice type with submit button
- Style disabled state and selected state

### Phase 2: Typing Indicator
- Create component structure
- Add CSS animation for dots
- Add optional avatar and text display
- Style as message bubble

### Phase 3: Auto-Resize Directive (if time)
- Create directive
- Implement height calculation
- Add max-height constraint
- Test with textarea

---

## Existing Patterns to Follow

From ChatMessageComponent (TASK-004):
- Signal inputs with `input()`, `input.required()`
- Signal outputs with `output()`
- Computed signals for derived state
- OnPush change detection
- `ngx-` selector prefix
- Component-scoped SCSS
