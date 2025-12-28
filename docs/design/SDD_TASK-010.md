# Software Detailed Design: TASK-010 Schematics & Packaging

**Version:** 1.0
**Status:** Draft
**Task:** TASK-010
**Created:** 2025-12-28

---

## 1. Introduction

### 1.1 Purpose
This document describes the detailed design for the ng-add schematic and packaging configuration for the ngx-support-chat library.

### 1.2 Scope
- ng-add schematic implementation
- Schema configuration
- Package configuration for npm
- Build verification

---

## 2. Architecture Context

### 2.1 Component Overview

```
projects/ngx-support-chat/
├── schematics/
│   ├── collection.json          # Schematic registry
│   ├── tsconfig.json            # TypeScript config
│   └── ng-add/
│       ├── index.ts             # Main schematic logic
│       ├── schema.json          # CLI options schema
│       └── schema.d.ts          # TypeScript interface
├── package.json                 # Library package config
├── ng-package.json              # ng-packagr config
└── src/
    └── styles/
        └── tokens.css           # CSS custom properties
```

### 2.2 Data Flow

```
User runs `ng add ngx-support-chat`
    │
    ▼
Angular CLI reads collection.json
    │
    ▼
Loads ng-add/schema.json for options
    │
    ▼
Prompts user for choices
    │
    ▼
Executes ng-add/index.ts#ngAdd()
    │
    ├──► addPeerDependencies() → Adds @angular/cdk
    ├──► addOptionalDependencies() → Adds ngx-markdown (if selected)
    ├──► addDefaultStyles() → Adds CSS import to styles
    ├──► logNextSteps() → Prints configuration instructions
    └──► installPackages() → Triggers npm install
```

---

## 3. Software Units

### 3.1 ngAdd Function

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Export | `ngAdd(options: NgAddOptions): Rule` |
| Status | To Implement |

**Responsibilities:**
- Chain all schematic rules
- Return combined rule

### 3.2 addPeerDependencies Rule

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Visibility | Internal |
| Status | To Implement |

**Logic:**
1. Add @angular/cdk to package.json dependencies
2. Log info message

### 3.3 addOptionalDependencies Rule

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Visibility | Internal |
| Status | To Implement |

**Logic:**
1. Check if `options.includeMarkdown` is true
2. If true, add ngx-markdown and marked to dependencies
3. Log info message

### 3.4 addDefaultStyles Rule

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Visibility | Internal |
| Status | To Implement |

**Logic:**
1. Check if `options.addDefaultStyles` is true (default: true)
2. Get workspace configuration
3. Find project by name or default
4. Locate global styles file
5. Add import statement if not already present
6. Log result

### 3.5 findStylesFile Helper

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Visibility | Internal |
| Status | To Implement |

**Logic:**
1. Check build target options for styles array
2. Find .scss or .css file
3. Fallback to common paths
4. Return path or null

### 3.6 logNextSteps Rule

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Visibility | Internal |
| Status | To Implement |

**Logic:**
1. Log formatted success message
2. Log provider configuration instructions
3. Log component usage example
4. Log CSS customization example

### 3.7 installPackages Rule

| Property | Value |
|----------|-------|
| File | `schematics/ng-add/index.ts` |
| Visibility | Internal |
| Status | To Implement |

**Logic:**
1. Add NodePackageInstallTask to context

---

## 4. Interfaces

### 4.1 NgAddOptions

```typescript
export interface NgAddOptions {
  project?: string;
  includeMarkdown?: boolean;
  addDefaultStyles?: boolean;
}
```

---

## 5. Configuration Files

### 5.1 collection.json

Registers the ng-add schematic with Angular CLI.

### 5.2 schema.json

Defines CLI options with prompts:
- `project`: Target project name
- `includeMarkdown`: Enable markdown support (default: false)
- `addDefaultStyles`: Add CSS tokens (default: true)

### 5.3 package.json

Key fields:
- `schematics`: Points to collection.json
- `ng-add.save`: "dependencies"
- `peerDependencies`: Angular and CDK versions
- `exports`: ES module paths

---

## 6. Build Configuration

### 6.1 Schematic Build

TypeScript config for schematics:
- Module: CommonJS (required by schematics)
- Target: ES2020
- Output: dist/ngx-support-chat/schematics/

### 6.2 Library Build

ng-packagr config:
- Assets: schematics/**/* and styles/tokens.css
- CSS URL handling: inline

---

## 7. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-28 | Claude | Initial design |
