---
description: |
  This skill should be used when the user asks to "start task", "create a component", "generate component", "new component", "structure my component", "organize component", "component architecture", "container component", "presentational component", "smart/dumb pattern", "standalone component", "OnPush change detection", "signal inputs", "viewChild", or "contentChild". Provides Angular 21 component patterns with signals, control flow, decorator-free APIs, and OnPush change detection.
---

# Angular Best Practices

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Use `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` for safer code

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators - it's the default in Angular v20+
- Use signals for state management (`signal()`, `computed()`, `effect()`)
- Implement lazy loading for feature routes
- Do NOT use `@HostBinding` and `@HostListener` decorators - use the `host` object in `@Component`/`@Directive` instead
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images)

## Component Patterns

### Signal-Based Inputs and Outputs

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed, model } from '@angular/core';

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isValid()) {
      <p>{{ displayName() }}</p>
    }
    <button (click)="handleClick()">Submit</button>
  `
})
export class ExampleComponent {
  // Required input
  name = input.required<string>();

  // Optional input with default
  disabled = input<boolean>(false);

  // Two-way binding
  value = model<string>('');

  // Output
  submitted = output<void>();

  // Computed signal for derived state
  displayName = computed(() => this.name().toUpperCase());
  isValid = computed(() => this.name().length > 0 && !this.disabled());

  handleClick(): void {
    this.submitted.emit();
  }
}
```

### Component Rules

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- When using external templates/styles, use paths relative to the component TS file
- Prefer Reactive forms instead of Template-driven ones

### Host Bindings

```typescript
@Component({
  selector: 'app-button',
  host: {
    'class': 'app-button',
    '[class.is-disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '(click)': 'handleClick($event)'
  },
  template: `<ng-content />`
})
export class ButtonComponent {
  disabled = input<boolean>(false);

  handleClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
```

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

```typescript
// Good - immutable update
items = signal<Item[]>([]);
addItem(item: Item): void {
  this.items.update(current => [...current, item]);
}

// Bad - avoid mutation
// this.items.mutate(items => items.push(item));
```

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives
- Use the async pipe to handle observables
- Do not assume globals like `new Date()` are available in templates
- Do not write arrow functions in templates (they are not supported)

### Control Flow Examples

```html
<!-- Conditionals -->
@if (user(); as user) {
  <p>Welcome, {{ user.name }}</p>
} @else {
  <p>Please log in</p>
}

<!-- Loops with tracking -->
@for (item of items(); track item.id) {
  <app-item [data]="item" />
} @empty {
  <p>No items found</p>
}

<!-- Switch -->
@switch (status()) {
  @case ('loading') {
    <app-spinner />
  }
  @case ('error') {
    <app-error [message]="errorMessage()" />
  }
  @default {
    <app-content [data]="data()" />
  }
}
```

### Class and Style Bindings

```html
<!-- Do NOT use ngClass -->
<!-- Bad: <div [ngClass]="{'active': isActive(), 'disabled': isDisabled()}"> -->

<!-- Good: Use class bindings -->
<div [class.active]="isActive()" [class.disabled]="isDisabled()">

<!-- Do NOT use ngStyle -->
<!-- Bad: <div [ngStyle]="{'width.px': width()}"> -->

<!-- Good: Use style bindings -->
<div [style.width.px]="width()">
```

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

## Accessibility Requirements

- Code MUST pass all AXE checks
- Code MUST follow all WCAG AA minimums:
  - Focus management
  - Color contrast (4.5:1 for normal text, 3:1 for large text)
  - ARIA attributes
- Use semantic HTML elements
- Ensure keyboard navigation works correctly
- Provide meaningful alt text for images
- Use `aria-label` and `aria-describedby` when needed

```typescript
@Component({
  selector: 'app-dialog',
  host: {
    'role': 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'titleId',
    '(keydown.escape)': 'close()'
  },
  template: `
    <h2 [id]="titleId">{{ title() }}</h2>
    <ng-content />
    <button (click)="close()" aria-label="Close dialog">
      <span aria-hidden="true">&times;</span>
    </button>
  `
})
export class DialogComponent {
  title = input.required<string>();
  titleId = `dialog-title-${crypto.randomUUID()}`;
  closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
```

## Angular CLI MCP Server

This project has the Angular CLI MCP server configured (`.mcp.json`). Use this tool for Angular-specific operations:

- `ng generate component` - Generate components with proper configuration
- `ng generate service` - Generate services
- `ng generate directive` - Generate directives
- `ng generate pipe` - Generate pipes
- `ng build` - Build the project
- `ng test` - Run tests
- `ng lint` - Run linting

The MCP server provides direct access to Angular CLI commands through the Model Context Protocol.

## Project-Specific Patterns (ngx-support-chat)

### Component Selectors
- Use `ngx-` prefix for components (kebab-case)
- Use `ngx` prefix for directives (camelCase)

### Styling
- Use CSS custom properties with `--ngx-` prefix
- Use container queries for responsive layouts (not viewport media queries)
- Internal tokens use `--_` prefix with fallback to public tokens

### Dependencies
- Use Angular CDK only (no Material)
- `@angular/cdk/scrolling` for virtual scroll
- `@angular/cdk/a11y` for accessibility utilities
