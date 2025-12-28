# Software Detailed Design: TASK-006 Pipes & Utilities

**Task:** TASK-006 - Pipes & Utilities
**Status:** Implemented
**Created:** 2025-12-28
**Last Updated:** 2025-12-28

---

## 1. Introduction

### 1.1 Purpose
This SDD documents the design of utility pipes for the ngx-support-chat library: FileSizePipe, TimeAgoPipe, and SafeMarkdownPipe.

### 1.2 Scope
- FileSizePipe: Format bytes as human-readable file sizes
- TimeAgoPipe: Display relative time ("2 minutes ago")
- SafeMarkdownPipe: Render markdown with optional ngx-markdown integration

---

## 2. Software Units

### 2.1 FileSizePipe

**Location:** `projects/ngx-support-chat/src/lib/pipes/file-size.pipe.ts`

**Interface:**
```typescript
@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, decimals?: number): string;
}
```

**Behavior:**
| Input | Decimals | Output |
|-------|----------|--------|
| 0 | - | "0 B" |
| null/undefined | - | "0 B" |
| 1024 | 0 | "1 KB" |
| 1536 | 1 | "1.5 KB" |
| 1048576 | 1 | "1 MB" |

### 2.2 TimeAgoPipe

**Location:** `projects/ngx-support-chat/src/lib/pipes/time-ago.pipe.ts`

**Interface:**
```typescript
@Pipe({ name: 'timeAgo', standalone: true, pure: false })
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date | string | null | undefined): string;
}
```

**Behavior:**
- Uses `getRelativeTime()` from date-helpers.util.ts
- Impure pipe allows updates as time passes
- Handles Date objects and ISO date strings

### 2.3 SafeMarkdownPipe

**Location:** `projects/ngx-support-chat/src/lib/pipes/safe-markdown.pipe.ts`

**Interface:**
```typescript
@Pipe({ name: 'safeMarkdown', standalone: true })
export class SafeMarkdownPipe implements PipeTransform {
  transform(text: string | null | undefined): SafeHtml | string;
}
```

**Behavior:**
- When markdown enabled AND ngx-markdown installed: Render markdown
- When markdown disabled OR ngx-markdown not installed: Return plain text
- All output sanitized via DomSanitizer

---

## 3. Dependencies

### 3.1 Internal
- `ChatConfigService` - Check if markdown enabled
- `date-helpers.util.ts` - `getRelativeTime()` function

### 3.2 External (Optional)
- `ngx-markdown` - MarkdownService for rendering

---

## 4. File Structure

```
projects/ngx-support-chat/src/lib/pipes/
├── index.ts                    # Barrel export
├── file-size.pipe.ts
├── file-size.pipe.spec.ts
├── time-ago.pipe.ts
├── time-ago.pipe.spec.ts
├── safe-markdown.pipe.ts
└── safe-markdown.pipe.spec.ts
```

---

## 5. Revision History

| Date | Version | Description |
|------|---------|-------------|
| 2025-12-28 | 0.1 | Initial draft |
