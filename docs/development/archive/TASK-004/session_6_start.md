# Session 6 Start

**Date:** 2025-12-28
**Task:** TASK-003 - Core Container & Layout Components
**Epic:** EPIC-001 - ngx-support-chat Library Implementation

---

## Starting Point

Beginning TASK-003 fresh after completing TASK-002 (Data Models & Configuration).
- TASK-002 archived to `docs/development/archive/TASK-002/`
- All 15 tests passing from previous tasks
- Library builds successfully

---

## Goals for This Session

1. **Create ChatContainerComponent**
   - Set up component with 7 signal inputs and 8 outputs
   - Implement flexbox column layout with container queries
   - Set up 4 content projection slots

2. **Create ChatHeaderComponent**
   - Simple projection component for header content
   - CSS token styling with border separator

3. **Create ChatFooterComponent**
   - Container for input area and actions
   - 2 projection slots (prefix and actions)
   - Signal inputs for attachments, input value, disabled state

4. **Establish CSS Token System**
   - Create `_tokens.scss` with internal tokens
   - Create `tokens.css` with public tokens
   - Set up container query breakpoints

5. **Write Unit Tests**
   - Test all component inputs/outputs
   - Test content projection
   - Test container query classes (if applicable)

---

## Expected Approach

1. Start with CSS tokens since all components depend on them
2. Build ChatContainerComponent as the orchestrating parent
3. Add ChatHeaderComponent and ChatFooterComponent
4. Write tests alongside each component
5. Export all components from public-api.ts
6. Verify build and tests pass

---

## Key Technical Decisions

- Using Angular 21 signal-based APIs (input(), output(), model())
- OnPush change detection for all components
- Container queries for responsive layout (not media queries)
- CSS custom properties with public/internal pattern
