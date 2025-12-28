# SDD: TASK-001 - Project Foundation & Workspace Setup

**Task:** TASK-001
**Status:** Implemented
**Created:** 2025-12-28
**Last Updated:** 2025-12-28
**Revision:** 2

---

## 1. Introduction

### 1.1 Purpose

This document defines the software design for establishing the Angular CLI workspace infrastructure with library and demo projects, including all development tooling configuration.

### 1.2 Scope

- Angular workspace creation with library and demo projects
- TypeScript strict configuration
- ESLint and Prettier setup
- Vitest testing framework
- ng-packagr library build configuration

### 1.3 References

- TASK-001-plan.md (immutable task definition)
- ngx-support-chat-specification.md sections 13-19

---

## 2. Architecture Context

### 2.1 System Position

This task establishes the foundation for all subsequent development. It creates:

```
Workspace (angular.json)
├── Library Project (ngx-support-chat)
│   ├── src/lib/ - Component source
│   ├── src/models/ - TypeScript interfaces
│   ├── src/tokens/ - Injection tokens
│   └── schematics/ - ng-add schematic
└── Demo Application (demo)
    └── src/ - Demo app source
```

### 2.2 Key Decisions

| Decision | Rationale |
|----------|-----------|
| Vitest over Karma | Faster execution, better DX, modern tooling |
| ESLint flat config | New standard, better performance |
| Angular CDK only | Minimal footprint, no Material theming |
| Standalone components | Angular 21 modern patterns |

---

## 3. Software Units

### 3.1 Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `angular.json` | Workspace configuration | ✅ Complete |
| `tsconfig.json` | Base TypeScript config | ✅ Complete |
| `tsconfig.lib.json` | Library-specific TS config | ✅ Complete |
| `tsconfig.spec.json` | Test-specific TS config | ✅ Complete |
| `vitest.config.ts` | Vitest configuration | ✅ Complete |
| `setup-tests.ts` | TestBed initialization | ✅ Complete |
| `eslint.config.js` | ESLint flat configuration | ✅ Complete |
| `.prettierrc` | Prettier configuration | ✅ Complete |
| `.browserslistrc` | Browser support targets | ✅ Complete |

### 3.2 Library Project Files

| File | Purpose | Status |
|------|---------|--------|
| `ng-package.json` | ng-packagr config | ✅ Complete |
| `package.json` | Library package metadata | ✅ Complete |
| `public-api.ts` | Public exports barrel | ✅ Complete |

### 3.3 Directory Structure

```
projects/ngx-support-chat/src/
├── lib/
│   ├── components/    # Chat UI components
│   ├── directives/    # Custom directives
│   ├── pipes/         # Transform pipes
│   ├── services/      # Chat configuration
│   └── utils/         # Utility functions
├── models/            # TypeScript interfaces
├── tokens/            # Injection tokens
├── styles/            # CSS token exports
└── public-api.ts      # Public API barrel
```

All directories created with `.gitkeep` files.

---

## 4. Interfaces

### 4.1 npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build:lib` | `ng build ngx-support-chat` | Build library |
| `build:lib:watch` | `ng build ngx-support-chat --watch` | Watch mode |
| `build:demo` | `ng build demo` | Build demo app |
| `build:schematics` | `tsc -p schematics/tsconfig.json` | Build schematics |
| `build` | `npm run build:lib && npm run build:schematics` | Full build |
| `test` | `vitest run` | Run tests |
| `test:watch` | `vitest` | Watch mode |
| `test:coverage` | `vitest run --coverage` | With coverage |
| `lint` | `eslint .` | Lint check |
| `lint:fix` | `eslint . --fix` | Auto-fix |
| `format` | `prettier --write .` | Format code |
| `format:check` | `prettier --check .` | Check formatting |
| `pack` | `cd dist/ngx-support-chat && npm pack` | Create tarball |

---

## 5. Implementation Notes

### 5.1 TypeScript Strictness

All strict flags enabled per spec section 13.3:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

### 5.2 Angular Compiler Options

```json
{
  "strictTemplates": true,
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true
}
```

### 5.3 ESLint Rules

- TypeScript strict + stylistic presets
- Angular ESLint with template accessibility
- Component selector: `@Component({ selector: 'ngx-xxx' })`
- Directive selector: `@Directive({ selector: '[ngxXxx]' })`

### 5.4 Coverage Thresholds

```javascript
coverage: {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80
}
```

---

## 6. Revision History

| Rev | Date | Changes | Author |
|-----|------|---------|--------|
| 1 | 2025-12-28 | Initial draft | Claude |
| 2 | 2025-12-28 | All units implemented, status updated | Claude |
