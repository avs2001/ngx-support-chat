# Session 7 Start

**Date:** 2025-12-28
**Task:** TASK-004 - Message Display Components
**Milestone:** Starting fresh - all milestones pending

---

## Session Goals

Implement the message display layer for ngx-support-chat:

1. **Utilities First** - Create date-helpers and message-grouping utilities
2. **Simple Components** - ChatDateSeparatorComponent, ChatMessageComponent
3. **Complex Components** - ChatMessageGroupComponent, ChatMessageAreaComponent
4. **Virtual Scrolling** - CDK virtual scroll viewport integration
5. **Exports & Tests** - Update public-api.ts, ensure tests pass

---

## Starting Point

- TASK-003 complete (Core Container & Layout Components)
- 73 tests passing, build and lint clean
- Data models exist in `src/models/`
- ChatConfigService available for date formatting config

---

## Planned Approach

### Phase 1: Utilities (Foundation)
- `date-helpers.util.ts` - isToday, isYesterday, isSameDay, formatDate
- `message-grouping.util.ts` - groupMessagesByDate, groupMessagesBySender

### Phase 2: Base Components
- ChatDateSeparatorComponent - sticky date headers
- ChatMessageComponent - individual message bubble with all types/states

### Phase 3: Composite Components
- ChatMessageGroupComponent - groups consecutive messages
- ChatMessageAreaComponent - virtual scroll container

### Phase 4: Integration
- Wire up outputs (messageRetry, imagePreview, fileDownload, scrollTop)
- Update public-api.ts
- Run full test suite

---

## Key Technical Decisions

1. Use Angular CDK virtual scrolling for performance
2. Implement sticky date separators with CSS sticky positioning
3. All components use OnPush change detection
4. Signal-based inputs/outputs per project standards

---

## Files to Create

- `src/lib/utils/date-helpers.util.ts`
- `src/lib/utils/date-helpers.util.spec.ts`
- `src/lib/utils/message-grouping.util.ts`
- `src/lib/utils/message-grouping.util.spec.ts`
- `src/lib/components/chat-date-separator/` (4 files)
- `src/lib/components/chat-message/` (4 files)
- `src/lib/components/chat-message-group/` (4 files)
- `src/lib/components/chat-message-area/` (4 files)
