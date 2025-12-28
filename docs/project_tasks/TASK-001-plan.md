# TASK-001: Project Foundation & Workspace Setup

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 1 - Foundation
**Complexity:** Medium
**Dependencies:** None

---

## Goal

Establish the Angular CLI workspace infrastructure with library and demo projects, configure all development tooling (TypeScript, ESLint, Prettier, Vitest), and prepare the project for component development.

---

## Scope

### 1. Angular Workspace Creation
- Create Angular CLI workspace with `projects/` structure
- Use Angular 21.x with standalone components
- Configure library project `ngx-support-chat` at `projects/ngx-support-chat/`
- Configure demo application project `demo` at `projects/demo/`

### 2. TypeScript Configuration (Spec Section 13.3)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "useDefineForClassFields": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
```

### 3. ESLint Configuration (Spec Section 19.1)
- ESLint flat config with `eslint.config.js`
- TypeScript ESLint strict + stylistic presets
- Angular ESLint with template accessibility
- Component selector prefix: `ngx-` (kebab-case)
- Directive selector prefix: `ngx` (camelCase)
- Explicit function return types required
- No explicit any allowed

### 4. Prettier Configuration (Spec Section 19.2)
- Single quotes
- No trailing commas
- 120 print width
- 2-space tabs
- Semicolons enabled
- Angular HTML parser for templates

### 5. Vitest Setup (Spec Section 18.1)
- Vitest with `@analogjs/vite-plugin-angular`
- jsdom environment
- 80% coverage thresholds (statements, branches, functions, lines)
- Coverage reporters: text, lcov, html
- Setup file for Angular TestBed initialization

### 6. ng-packagr Configuration (Spec Section 17.1)
- Output to `dist/ngx-support-chat`
- CSS URL inline mode
- Assets configuration for schematics and tokens.css

### 7. Package.json Setup (Spec Section 15.1)
- Library peer dependencies:
  - `@angular/common: ^21.0.0`
  - `@angular/core: ^21.0.0`
  - `@angular/cdk: ^21.0.0`
- Optional peer dependency: `ngx-markdown: ^18.0.0`
- Build scripts:
  - `build:lib` - Library production build
  - `build:lib:watch` - Library watch mode
  - `build:demo` - Demo application build
  - `build:schematics` - Schematic TypeScript compilation
  - `build` - Full build (lib + schematics)
  - `pack` - Create npm tarball
- Test scripts: `test`, `test:watch`, `test:coverage`, `test:ci`
- Lint scripts: `lint`, `lint:fix`
- Format scripts: `format`, `format:check`

### 8. Browser Configuration (Spec Section 17.3)
`.browserslistrc`:
```
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
last 2 iOS versions
last 2 Android versions
```

### 9. Directory Structure (Spec Section 14.1)
```
ngx-support-chat/
├── projects/
│   ├── ngx-support-chat/
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   ├── directives/
│   │   │   │   ├── pipes/
│   │   │   │   ├── services/
│   │   │   │   └── utils/
│   │   │   ├── models/
│   │   │   ├── tokens/
│   │   │   ├── styles/
│   │   │   └── public-api.ts
│   │   ├── schematics/
│   │   ├── ng-package.json
│   │   └── package.json
│   └── demo/
│       └── src/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
└── .browserslistrc
```

---

## Success Criteria

- [ ] `npm install` completes without errors
- [ ] `npm run build:lib` produces `dist/ngx-support-chat`
- [ ] `npm run test` executes (even with no tests yet)
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] Workspace structure matches spec section 14.1
- [ ] TypeScript strict mode enabled per spec
- [ ] Library configured as Angular 21 standalone components

---

## Deliverables

1. **Angular workspace** with library + demo projects
2. **Configuration files:**
   - `angular.json`
   - `package.json` (root)
   - `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`
   - `vitest.config.ts`, `setup-tests.ts`
   - `eslint.config.js`
   - `.prettierrc`
   - `.browserslistrc`
3. **Library structure:**
   - `projects/ngx-support-chat/ng-package.json`
   - `projects/ngx-support-chat/package.json`
   - `projects/ngx-support-chat/src/public-api.ts`
   - Empty directory structure ready for components
4. **Demo application structure:**
   - `projects/demo/src/` skeleton

---

## Technical Notes

### Why Angular CDK Only (No Material)
- Minimal footprint for a focused library
- Virtual scrolling from `@angular/cdk/scrolling`
- Accessibility utilities from `@angular/cdk/a11y`
- No opinionated styling from Material

### Signal-Based Components
All components will use Angular 21 signal APIs:
- `input()`, `input.required()` for inputs
- `output()` for outputs
- `model()` for two-way binding
- `computed()` for derived state
- `effect()` for side effects
- `ChangeDetectionStrategy.OnPush` mandatory

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Component Architecture | 2.1, 2.2 |
| Angular Configuration | 13.1, 13.2, 13.3 |
| Workspace Structure | 14.1, 14.2 |
| Dependencies | 15.1, 15.2, 15.3 |
| Build Configuration | 17.1, 17.2, 17.3 |
| Testing | 18.1, 18.2, 18.3 |
| Linting/Formatting | 19.1, 19.2, 19.3 |

---

**This document is IMMUTABLE. Do not modify after task start.**
