# TASK-008: Complete Styling System

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 5 - Styling & Theming
**Complexity:** Medium
**Dependencies:** TASK-005

---

## Goal

Complete the CSS custom property token system with all color, spacing, typography, and animation tokens. Implement the default theme and finalize container query breakpoints for responsive behavior.

---

## Scope

### 1. Complete CSS Token System (Spec Section 8)

#### 8.1 Color Tokens
```css
/* Container Colors */
--ngx-chat-bg: #ffffff;
--ngx-chat-header-bg: #ffffff;
--ngx-chat-footer-bg: #ffffff;
--ngx-chat-message-area-bg: #f5f5f5;

/* Bubble Colors */
--ngx-bubble-user-bg: #0066cc;
--ngx-bubble-user-text: #ffffff;
--ngx-bubble-agent-bg: #e8e8e8;
--ngx-bubble-agent-text: #1a1a1a;
--ngx-bubble-system-bg: transparent;
--ngx-bubble-system-text: #666666;

/* Input Colors */
--ngx-input-bg: #ffffff;
--ngx-input-text: #1a1a1a;
--ngx-input-placeholder: #999999;
--ngx-input-border: #dddddd;
--ngx-input-focus-border: #0066cc;

/* Button Colors */
--ngx-button-primary-bg: #0066cc;
--ngx-button-primary-text: #ffffff;
--ngx-button-secondary-bg: #e8e8e8;
--ngx-button-secondary-text: #1a1a1a;
--ngx-button-disabled-bg: #f0f0f0;
--ngx-button-disabled-text: #999999;

/* Separator Colors */
--ngx-separator-text: #666666;
--ngx-separator-line: #e0e0e0;

/* Status Colors */
--ngx-status-sending: #999999;
--ngx-status-sent: #666666;
--ngx-status-delivered: #0066cc;
--ngx-status-read: #00cc66;
--ngx-status-failed: #cc0000;

/* Quick Reply Colors */
--ngx-quick-reply-bg: #ffffff;
--ngx-quick-reply-text: #0066cc;
--ngx-quick-reply-border: #0066cc;
--ngx-quick-reply-hover-bg: #f0f7ff;
--ngx-quick-reply-selected-bg: #0066cc;
--ngx-quick-reply-selected-text: #ffffff;
--ngx-quick-reply-disabled-bg: #f5f5f5;
--ngx-quick-reply-disabled-text: #999999;

/* Misc Colors */
--ngx-typing-indicator-dot: #666666;
--ngx-link-color: #0066cc;
--ngx-timestamp-text: #999999;
--ngx-avatar-bg: #e0e0e0;
--ngx-attachment-chip-bg: #f0f0f0;
--ngx-attachment-chip-text: #1a1a1a;
--ngx-scroll-indicator-bg: #0066cc;
--ngx-scroll-indicator-text: #ffffff;
```

#### 8.2 Spacing Tokens
```css
/* Base Spacing Scale */
--ngx-spacing-xs: 4px;
--ngx-spacing-sm: 8px;
--ngx-spacing-md: 16px;
--ngx-spacing-lg: 24px;
--ngx-spacing-xl: 32px;

/* Component-Specific Spacing */
--ngx-message-gap: 8px;
--ngx-message-group-gap: 4px;
--ngx-bubble-padding: 12px 16px;
--ngx-header-padding: 16px;
--ngx-footer-padding: 12px 16px;
--ngx-input-padding: 12px;
--ngx-quick-reply-gap: 8px;
--ngx-attachment-gap: 8px;
```

#### 8.3 Border Radius Tokens
```css
/* Base Radius Scale */
--ngx-radius-sm: 4px;
--ngx-radius-md: 12px;
--ngx-radius-lg: 16px;
--ngx-radius-full: 9999px;

/* Component-Specific Radius */
--ngx-bubble-radius: 16px;
--ngx-bubble-radius-grouped: 4px;
--ngx-input-radius: 20px;
--ngx-button-radius: 20px;
--ngx-avatar-radius: 50%;
--ngx-attachment-chip-radius: 16px;
--ngx-image-radius: 12px;
--ngx-quick-reply-radius: 16px;
```

#### 8.4 Typography Tokens
```css
/* Font Family */
--ngx-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Font Sizes */
--ngx-font-size-xs: 0.75rem;   /* 12px - timestamps, metadata */
--ngx-font-size-sm: 0.875rem;  /* 14px - secondary text */
--ngx-font-size-md: 1rem;      /* 16px - message text */
--ngx-font-size-lg: 1.125rem;  /* 18px - headers, emphasis */

/* Font Weights */
--ngx-font-weight-normal: 400;
--ngx-font-weight-medium: 500;
--ngx-font-weight-bold: 600;

/* Line Heights */
--ngx-line-height: 1.5;
--ngx-message-line-height: 1.4;
```

#### 8.5 Dimension Tokens
```css
/* Avatar Sizes */
--ngx-avatar-size: 36px;
--ngx-avatar-size-sm: 24px;

/* Bubble Dimensions */
--ngx-max-bubble-width: 70%;

/* Image Dimensions */
--ngx-image-thumbnail-max-width: 240px;
--ngx-image-thumbnail-max-height: 180px;

/* Input Dimensions */
--ngx-input-min-height: 44px;
--ngx-input-max-height: 120px;

/* Button Dimensions */
--ngx-button-size: 44px;
--ngx-button-icon-size: 24px;

/* Attachment Dimensions */
--ngx-attachment-chip-height: 32px;
--ngx-attachment-thumbnail-size: 48px;

/* Typing Indicator */
--ngx-typing-dot-size: 8px;
```

#### 8.6 Animation Tokens
```css
/* Transitions */
--ngx-transition-duration: 200ms;
--ngx-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

/* Typing Animation */
--ngx-typing-animation-duration: 1.4s;

/* Scroll Animation */
--ngx-scroll-animation-duration: 300ms;
```

### 2. Internal Token Pattern (`_tokens.scss`)

```scss
// Internal tokens with public token fallbacks
:host {
  // Use internal tokens in component styles
  --_chat-bg: var(--ngx-chat-bg, #ffffff);
  --_bubble-user-bg: var(--ngx-bubble-user-bg, #0066cc);
  // ... all tokens
}

// Component usage
.chat-container {
  background: var(--_chat-bg);
}

.message-bubble.user {
  background: var(--_bubble-user-bg);
  color: var(--_bubble-user-text);
}
```

### 3. Default Theme (`_theme-default.scss`)

Complete default theme that works out of the box:

```scss
// Default values applied at :root level
// Consumers can override any token
:root {
  // All tokens with sensible defaults
  @include ngx-chat-default-tokens();
}

// Dark mode variant (optional)
@media (prefers-color-scheme: dark) {
  :root {
    @include ngx-chat-dark-tokens();
  }
}
```

### 4. Container Query Breakpoints (Spec Section 10)

```scss
// chat-container.component.scss
:host {
  container-type: inline-size;
  container-name: chat;
}

/* Small Container (< 300px) - Compact mode */
@container chat (max-width: 299px) {
  .message-bubble {
    max-width: 90%;
  }
  .avatar {
    width: var(--ngx-avatar-size-sm);
    height: var(--ngx-avatar-size-sm);
  }
  .sender-name {
    display: none;
  }
  .timestamp {
    display: none; // Show on hover/tap
  }
  .quick-replies {
    flex-direction: column;
  }
  .attachment-chip {
    // Icon only, no filename
    .filename { display: none; }
  }
}

/* Medium Container (300-599px) - Standard mobile */
@container chat (min-width: 300px) and (max-width: 599px) {
  .message-bubble {
    max-width: 80%;
  }
  .quick-replies {
    flex-wrap: wrap;
  }
  .attachment-chip {
    .filename {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* Large Container (600px+) - Desktop */
@container chat (min-width: 600px) {
  .message-bubble {
    max-width: 65%;
  }
  .message-area {
    padding: var(--ngx-spacing-lg);
  }
  .attachment-chip {
    .filename {
      max-width: 150px;
    }
  }
}
```

### 5. Exported Assets

**tokens.css** - Consumable CSS file for consumers:
```css
/*
 * ngx-support-chat CSS Custom Properties
 * Copy and customize these in your global styles
 */
:root {
  /* Colors */
  --ngx-chat-bg: #ffffff;
  /* ... all tokens with documentation */
}
```

**ng-package.json assets:**
```json
{
  "assets": [
    "src/styles/tokens.css"
  ]
}
```

---

## Success Criteria

- [ ] All color tokens from spec section 8.1 implemented
- [ ] All spacing tokens from spec section 8.2 implemented
- [ ] All border radius tokens from spec section 8.3 implemented
- [ ] All typography tokens from spec section 8.4 implemented
- [ ] All dimension tokens from spec section 8.5 implemented
- [ ] All animation tokens from spec section 8.6 implemented
- [ ] Internal token pattern (`--_*`) with public fallbacks working
- [ ] Default theme looks polished and professional
- [ ] Container queries adapt at 3 breakpoints (<300px, 300-600px, >600px)
- [ ] Small container: compact mode, icon-only attachments
- [ ] Medium container: standard mobile layout
- [ ] Large container: desktop layout with generous spacing
- [ ] `tokens.css` exported in build and accessible to consumers
- [ ] Consumers can override any token without importing additional files
- [ ] Dark mode variant available (optional, via `prefers-color-scheme`)
- [ ] Visual regression tests pass (if implemented)

---

## Deliverables

1. **Style Files:**
   - `projects/ngx-support-chat/src/styles/_tokens.scss` (complete)
   - `projects/ngx-support-chat/src/styles/_theme-default.scss`
   - `projects/ngx-support-chat/src/styles/_container-queries.scss`
   - `projects/ngx-support-chat/src/styles/tokens.css` (exported)

2. **Updated Component Styles:**
   - All component `.scss` files updated to use token system

3. **Configuration:**
   - `ng-package.json` assets configuration for tokens.css

4. **Documentation:**
   - Token documentation in tokens.css comments

---

## Technical Notes

### CSS Custom Property Inheritance
```scss
// Container sets internal tokens
:host {
  --_chat-bg: var(--ngx-chat-bg, #ffffff);
}

// Child components inherit and use
.child-element {
  background: var(--_chat-bg);
}
```

### Container Query Polyfill
Container queries are well-supported in modern browsers. For older browsers, consider:
- CSS `@supports` fallback
- Resize observer JavaScript fallback

### Theme Customization Example
Consumer's styles.scss:
```scss
// Override just what's needed
:root {
  --ngx-bubble-user-bg: #7c3aed;
  --ngx-bubble-user-text: #ffffff;
  --ngx-radius-md: 20px;
}
```

### Dark Mode Support
```scss
@media (prefers-color-scheme: dark) {
  :root {
    --ngx-chat-bg: #1a1a1a;
    --ngx-bubble-agent-bg: #2d2d2d;
    --ngx-input-bg: #2d2d2d;
    // ... dark variants
  }
}
```

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Color Tokens | 8.1 |
| Spacing Tokens | 8.2 |
| Border Radius Tokens | 8.3 |
| Typography Tokens | 8.4 |
| Dimension Tokens | 8.5 |
| Animation Tokens | 8.6 |
| Container Queries | 10 |
| CSS Token Structure | 16.2 |
| Default Theme | 16.3 |
| Container Queries CSS | 16.4 |

---

**This document is IMMUTABLE. Do not modify after task start.**
