# TASK-006: Pipes & Utilities

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 4 - Support Features
**Complexity:** Low
**Dependencies:** TASK-004

---

## Goal

Implement utility pipes for data transformation (file sizes, relative time, markdown rendering) and finalize utility functions for message grouping and date operations.

---

## Scope

### 1. FileSizePipe

**File:** `projects/ngx-support-chat/src/lib/pipes/file-size.pipe.ts`

**Structure:**
```typescript
@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, decimals: number = 1): string {
    if (bytes === null || bytes === undefined || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
}
```

**Features:**
- Convert bytes to human-readable format (B, KB, MB, GB, TB)
- Optional decimal precision parameter
- Handle null/undefined/zero gracefully

**Test Cases:**
- `0` → `'0 B'`
- `1024` → `'1 KB'`
- `1536` → `'1.5 KB'`
- `1048576` → `'1 MB'`
- `null` → `'0 B'`

### 2. TimeAgoPipe

**File:** `projects/ngx-support-chat/src/lib/pipes/time-ago.pipe.ts`

**Structure:**
```typescript
@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false, // Needs to update over time
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private lastValue = '';
  private lastDate: Date | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  transform(date: Date | string | null | undefined, fallbackFormat?: string): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Calculate relative time
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;

    // Fall back to formatted date after 24 hours
    if (fallbackFormat) {
      return formatDate(d, fallbackFormat);
    }
    return d.toLocaleDateString();
  }

  ngOnDestroy(): void {
    // Clean up timer
  }
}
```

**Features:**
- Relative time display ("Just now", "2 minutes ago", "1 hour ago")
- Falls back to formatted date after 24 hours
- Impure pipe for time-based updates
- Memory cleanup on destroy

**Test Cases:**
- Just now (<60 seconds)
- Minutes ago (1-59 minutes)
- Hours ago (1-23 hours)
- Formatted date (>24 hours)

### 3. SafeMarkdownPipe

**File:** `projects/ngx-support-chat/src/lib/pipes/safe-markdown.pipe.ts`

**Structure:**
```typescript
@Pipe({
  name: 'safeMarkdown',
  standalone: true,
})
export class SafeMarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  private config = inject(ChatConfigService);

  // Optional markdown service (only if ngx-markdown is installed)
  private markdownService = inject(MarkdownService, { optional: true });

  transform(text: string | null | undefined): SafeHtml | string {
    if (!text) return '';

    if (!this.config.markdown().enabled || !this.markdownService) {
      // Return plain text if markdown disabled or service unavailable
      return text;
    }

    // Render markdown and sanitize
    const rendered = this.markdownService.compile(text);
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  }
}
```

**Features:**
- Sanitize and render markdown when enabled
- Integrate with ngx-markdown if available
- Graceful fallback to plain text if:
  - Markdown disabled in config
  - ngx-markdown not installed
- XSS protection via DomSanitizer

**Test Cases:**
- Plain text when markdown disabled
- Plain text when ngx-markdown not installed
- Rendered markdown when enabled
- XSS attack strings sanitized
- Bold, italic, links, code blocks render correctly

### 4. Message Grouping Utilities (Finalization)

**File:** `projects/ngx-support-chat/src/lib/utils/message-grouping.util.ts`

Ensure comprehensive implementation from TASK-004:

```typescript
export interface MessageGroup {
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isCurrentUser: boolean;
  messages: ChatMessage[];
}

export interface DateGroup {
  date: Date;
  groups: MessageGroup[];
}

export function groupMessagesByDate(messages: ChatMessage[]): DateGroup[];

export function groupMessagesBySender(
  messages: ChatMessage[],
  currentUserId: string,
  timeThreshold: number = 5 * 60 * 1000 // 5 minutes
): MessageGroup[];

export function shouldStartNewGroup(
  current: ChatMessage,
  previous: ChatMessage,
  threshold: number
): boolean;
```

### 5. Date Helper Utilities (Finalization)

**File:** `projects/ngx-support-chat/src/lib/utils/date-helpers.util.ts`

Ensure comprehensive implementation:

```typescript
export function isToday(date: Date): boolean;
export function isYesterday(date: Date): boolean;
export function isSameDay(date1: Date, date2: Date): boolean;
export function isSameMinute(date1: Date, date2: Date): boolean;
export function startOfDay(date: Date): Date;
export function formatDate(date: Date, format: string): string;
export function formatTime(date: Date, format: string): string;
export function getDateKey(date: Date): string; // For grouping: 'YYYY-MM-DD'
```

---

## Success Criteria

- [ ] FileSizePipe formats all size ranges correctly (B, KB, MB, GB)
- [ ] FileSizePipe handles edge cases (0, null, undefined)
- [ ] FileSizePipe respects decimal precision parameter
- [ ] TimeAgoPipe displays relative time correctly
- [ ] TimeAgoPipe updates over time (impure pipe)
- [ ] TimeAgoPipe falls back to formatted date after threshold
- [ ] SafeMarkdownPipe returns plain text when markdown disabled
- [ ] SafeMarkdownPipe returns plain text when ngx-markdown not installed
- [ ] SafeMarkdownPipe renders markdown when enabled and available
- [ ] SafeMarkdownPipe sanitizes dangerous content (XSS protection)
- [ ] Message grouping utilities fully tested
- [ ] Date helper utilities fully tested
- [ ] Unit tests for all pipes with >80% coverage
- [ ] All pipes exported from public-api.ts

---

## Deliverables

1. **Pipes:**
   - `pipes/file-size.pipe.ts`
   - `pipes/file-size.pipe.spec.ts`
   - `pipes/time-ago.pipe.ts`
   - `pipes/time-ago.pipe.spec.ts`
   - `pipes/safe-markdown.pipe.ts`
   - `pipes/safe-markdown.pipe.spec.ts`

2. **Utilities (finalized):**
   - `utils/message-grouping.util.ts`
   - `utils/message-grouping.util.spec.ts`
   - `utils/date-helpers.util.ts`
   - `utils/date-helpers.util.spec.ts`

3. **Updated Exports:**
   - `public-api.ts` with new pipes

---

## Technical Notes

### Impure Pipe Considerations
`TimeAgoPipe` is impure (`pure: false`) to enable time-based updates. This means:
- Runs on every change detection cycle
- Should be efficient (minimal computation)
- Consider interval-based refresh instead of CD-triggered

### Optional Dependency Pattern
```typescript
// Safe injection of optional dependency
private markdownService = inject(MarkdownService, { optional: true });

// Usage with null check
if (this.markdownService) {
  return this.markdownService.compile(text);
}
return text; // Fallback
```

### Date Format Patterns
Common patterns for `formatDate`:
- `'MMMM d, yyyy'` → "December 28, 2025"
- `'MMM d'` → "Dec 28"
- `'HH:mm'` → "14:30"
- `'h:mm a'` → "2:30 PM"

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| File Messages (file size) | 6.3 |
| Message Timestamps | 6.3 |
| Markdown Configuration | 7.1 |
| Text Messages | 6.3 |

---

**This document is IMMUTABLE. Do not modify after task start.**
