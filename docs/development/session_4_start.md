# Session 4 Start

**Session:** 4
**Date:** 2025-12-28
**Task:** TASK-001 - Project Foundation & Workspace Setup
**Epic:** EPIC-001 - ngx-support-chat Library Implementation

---

## Starting Point

From handoff notes: All 11 task plans complete. Ready to start TASK-001.

---

## Session Goals

1. Create Angular CLI workspace with library + demo projects
2. Configure all development tooling:
   - TypeScript strict mode (per spec section 13.3)
   - ESLint flat config (per spec section 19.1)
   - Prettier (per spec section 19.2)
   - Vitest with coverage (per spec section 18.1)
3. Configure ng-packagr for library build
4. Create empty directory structure per spec section 14.1
5. Verify all success criteria pass

---

## Planned Approach

1. Use `ng new` with `--create-application=false` for clean workspace
2. Generate library project with `ng generate library ngx-support-chat`
3. Generate demo application with `ng generate application demo`
4. Replace Karma/Jasmine with Vitest + @analogjs/vite-plugin-angular
5. Add ESLint flat config with TypeScript + Angular presets
6. Configure strict TypeScript compiler options
7. Test build, lint, and test commands

---

## Key Constraints

- Angular 21.x with standalone components
- Signal-based APIs only (no decorator inputs/outputs)
- OnPush change detection mandatory
- Component prefix: `ngx-` (kebab-case)
- Directive prefix: `ngx` (camelCase)
- 80% test coverage thresholds

---

## Files to Create

- `angular.json` - Workspace configuration
- `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`
- `vitest.config.ts`, `setup-tests.ts`
- `eslint.config.js`
- `.prettierrc`
- `.browserslistrc`
- `projects/ngx-support-chat/ng-package.json`
- `projects/ngx-support-chat/package.json`
- `projects/ngx-support-chat/src/public-api.ts`
- Library directory structure
