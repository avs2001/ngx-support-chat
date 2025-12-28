# TASK-010: Schematics & Packaging

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 6 - Demo & Packaging
**Complexity:** Medium
**Dependencies:** TASK-008

---

## Goal

Implement the `ng add` schematic for seamless library installation and finalize package configuration for npm publishing.

---

## Scope

### 1. Schematic Collection Configuration (Spec Section 20.1)

**File:** `projects/ngx-support-chat/schematics/collection.json`

```json
{
  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-add": {
      "description": "Adds ngx-support-chat to the application",
      "factory": "./ng-add/index#ngAdd",
      "schema": "./ng-add/schema.json"
    }
  }
}
```

### 2. Schema Definition (Spec Section 20.2)

**File:** `projects/ngx-support-chat/schematics/ng-add/schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "ngx-support-chat-ng-add",
  "title": "ngx-support-chat ng-add schematic",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "The project to add the library to",
      "$default": {
        "$source": "projectName"
      }
    },
    "includeMarkdown": {
      "type": "boolean",
      "default": false,
      "description": "Include ngx-markdown for markdown support",
      "x-prompt": "Do you want to enable markdown support in chat messages?"
    },
    "addDefaultStyles": {
      "type": "boolean",
      "default": true,
      "description": "Add default CSS token variables to global styles",
      "x-prompt": "Do you want to add default CSS tokens to your global styles?"
    }
  },
  "required": []
}
```

**File:** `projects/ngx-support-chat/schematics/ng-add/schema.d.ts`

```typescript
export interface NgAddOptions {
  project?: string;
  includeMarkdown?: boolean;
  addDefaultStyles?: boolean;
}
```

### 3. Schematic Implementation (Spec Section 20.3)

**File:** `projects/ngx-support-chat/schematics/ng-add/index.ts`

```typescript
import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { NgAddOptions } from './schema';

export function ngAdd(options: NgAddOptions): Rule {
  return chain([
    addPeerDependencies(options),
    addOptionalDependencies(options),
    addDefaultStyles(options),
    logNextSteps(options),
    installPackages()
  ]);
}

function addPeerDependencies(_options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Adding peer dependencies...');

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular/cdk',
      version: '^21.0.0'
    });

    return tree;
  };
}

function addOptionalDependencies(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.includeMarkdown) {
      context.logger.info('Adding ngx-markdown for markdown support...');

      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: 'ngx-markdown',
        version: '^18.0.0'
      });

      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: 'marked',
        version: '^12.0.0'
      });
    }

    return tree;
  };
}

function addDefaultStyles(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    if (!options.addDefaultStyles) {
      return tree;
    }

    const workspace = await getWorkspace(tree);
    const projectName = options.project || workspace.extensions['defaultProject'] as string;
    const project = workspace.projects.get(projectName);

    if (!project) {
      context.logger.warn(`Could not find project "${projectName}"`);
      return tree;
    }

    // Find styles file
    const stylesPath = findStylesFile(tree, project);

    if (stylesPath) {
      const content = tree.read(stylesPath)?.toString('utf-8') ?? '';
      const importStatement = `@import 'ngx-support-chat/styles/tokens.css';\n\n`;

      if (!content.includes('ngx-support-chat')) {
        tree.overwrite(stylesPath, importStatement + content);
        context.logger.info(`✅ Added CSS tokens import to ${stylesPath}`);
      }
    } else {
      context.logger.warn('Could not find global styles file');
    }

    return tree;
  };
}

function findStylesFile(tree: Tree, project: any): string | null {
  const buildTarget = project.targets?.get('build');
  const styles = buildTarget?.options?.['styles'] as string[] | undefined;

  if (styles && styles.length > 0) {
    const mainStyles = styles.find(s =>
      typeof s === 'string' && (s.endsWith('.scss') || s.endsWith('.css'))
    );
    if (mainStyles && tree.exists(mainStyles)) {
      return mainStyles;
    }
  }

  // Fallback: check common locations
  const commonPaths = [
    'src/styles.scss',
    'src/styles.css',
    `projects/${project.root}/src/styles.scss`,
    `projects/${project.root}/src/styles.css`
  ];

  for (const path of commonPaths) {
    if (tree.exists(path)) {
      return path;
    }
  }

  return null;
}

function logNextSteps(options: NgAddOptions): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info('');
    context.logger.info('╔════════════════════════════════════════════════════════════╗');
    context.logger.info('║           ngx-support-chat installed successfully!         ║');
    context.logger.info('╚════════════════════════════════════════════════════════════╝');
    context.logger.info('');
    context.logger.info('Next steps:');
    context.logger.info('');
    context.logger.info('1. Add provideChatConfig() to your app.config.ts:');
    context.logger.info('');
    context.logger.info('   import { provideChatConfig } from "ngx-support-chat";');
    context.logger.info('');
    context.logger.info('   export const appConfig: ApplicationConfig = {');
    context.logger.info('     providers: [');
    context.logger.info('       provideChatConfig({');
    context.logger.info('         markdown: { enabled: ' + (options.includeMarkdown || false) + ' }');
    context.logger.info('       })');
    context.logger.info('     ]');
    context.logger.info('   };');
    context.logger.info('');
    context.logger.info('2. Use the component in your template:');
    context.logger.info('');
    context.logger.info('   <ngx-chat-container');
    context.logger.info('     [messages]="messages"');
    context.logger.info('     [currentUserId]="userId"');
    context.logger.info('     (messageSend)="onSend($event)">');
    context.logger.info('   </ngx-chat-container>');
    context.logger.info('');
    context.logger.info('3. Customize CSS tokens in your global styles (optional):');
    context.logger.info('');
    context.logger.info('   :root {');
    context.logger.info('     --ngx-bubble-user-bg: #7c3aed;');
    context.logger.info('   }');
    context.logger.info('');

    return _tree;
  };
}

function installPackages(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    return _tree;
  };
}
```

### 4. Schematic TypeScript Configuration

**File:** `projects/ngx-support-chat/schematics/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "../../../dist/ngx-support-chat/schematics",
    "declaration": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5. Library Package Configuration

**File:** `projects/ngx-support-chat/package.json`

```json
{
  "name": "ngx-support-chat",
  "version": "0.0.1",
  "description": "Pure presentational Angular component for customer support chat",
  "keywords": [
    "angular",
    "chat",
    "support",
    "component",
    "library"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/ngx-support-chat.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/ngx-support-chat/issues"
  },
  "homepage": "https://github.com/your-org/ngx-support-chat#readme",
  "peerDependencies": {
    "@angular/common": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/cdk": "^21.0.0"
  },
  "peerDependenciesMeta": {
    "ngx-markdown": {
      "optional": true
    }
  },
  "schematics": "./schematics/collection.json",
  "ng-add": {
    "save": "dependencies"
  },
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "esm2022": "./esm2022/ngx-support-chat.mjs",
      "esm": "./esm2022/ngx-support-chat.mjs",
      "default": "./fesm2022/ngx-support-chat.mjs"
    },
    "./models": {
      "types": "./models/index.d.ts",
      "esm2022": "./esm2022/models/ngx-support-chat-models.mjs",
      "esm": "./esm2022/models/ngx-support-chat-models.mjs",
      "default": "./fesm2022/ngx-support-chat-models.mjs"
    },
    "./tokens": {
      "types": "./tokens/index.d.ts",
      "esm2022": "./esm2022/tokens/ngx-support-chat-tokens.mjs",
      "esm": "./esm2022/tokens/ngx-support-chat-tokens.mjs",
      "default": "./fesm2022/ngx-support-chat-tokens.mjs"
    },
    "./styles/tokens.css": {
      "style": "./styles/tokens.css"
    }
  }
}
```

### 6. ng-packagr Configuration Update

**File:** `projects/ngx-support-chat/ng-package.json`

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/ngx-support-chat",
  "lib": {
    "entryFile": "src/public-api.ts",
    "cssUrl": "inline"
  },
  "assets": [
    "schematics/**/*",
    "src/styles/tokens.css"
  ],
  "allowedNonPeerDependencies": []
}
```

### 7. Build Scripts

**Root package.json updates:**

```json
{
  "scripts": {
    "build:lib": "ng build ngx-support-chat --configuration=production",
    "build:schematics": "tsc -p projects/ngx-support-chat/schematics/tsconfig.json",
    "build": "npm run build:lib && npm run build:schematics",
    "pack": "cd dist/ngx-support-chat && npm pack",
    "publish:lib": "cd dist/ngx-support-chat && npm publish --access public"
  }
}
```

### 8. Build Verification

Create a verification script/checklist:

1. `npm run build` produces correct output
2. `dist/ngx-support-chat/` contains:
   - `package.json`
   - `README.md`
   - `fesm2022/` (ES modules)
   - `esm2022/` (ES modules)
   - `schematics/` (ng-add)
   - `styles/tokens.css`
   - Type declarations (`*.d.ts`)
3. `npm pack` creates valid tarball
4. Local install test in fresh project:
   - `npm install ../path/to/ngx-support-chat-0.0.1.tgz`
   - `ng add ngx-support-chat` runs successfully
   - Peer dependencies added
   - Styles import added

---

## Success Criteria

- [ ] `ng add ngx-support-chat` works in fresh Angular 21 project
- [ ] Interactive prompts for markdown and styles options work
- [ ] `@angular/cdk` peer dependency added automatically
- [ ] Optional `ngx-markdown` installation works when selected
- [ ] CSS tokens import added to global styles when selected
- [ ] Next steps instructions logged clearly
- [ ] Schematic handles missing project gracefully
- [ ] Schematic handles existing imports gracefully (idempotent)
- [ ] `npm run build` produces all expected outputs
- [ ] `npm pack` creates valid tarball
- [ ] Package tarball installs correctly in test project
- [ ] Library imports work: `import { ChatContainerComponent } from 'ngx-support-chat'`
- [ ] Secondary imports work: `import { ChatMessage } from 'ngx-support-chat/models'`
- [ ] Token imports work: `import { CHAT_CONFIG } from 'ngx-support-chat/tokens'`
- [ ] CSS import works: `@import 'ngx-support-chat/styles/tokens.css'`

---

## Deliverables

1. **Schematics:**
   - `schematics/collection.json`
   - `schematics/ng-add/index.ts`
   - `schematics/ng-add/schema.json`
   - `schematics/ng-add/schema.d.ts`
   - `schematics/tsconfig.json`

2. **Package Configuration:**
   - `projects/ngx-support-chat/package.json` (complete)
   - `projects/ngx-support-chat/ng-package.json` (updated)

3. **Build Scripts:**
   - Updated root `package.json` with build scripts

4. **Verification:**
   - Manual test results documented

---

## Technical Notes

### Schematic Testing
Test schematics with the Angular CLI's schematic runner:
```bash
npm run build:schematics
schematics .:ng-add --debug=false
```

### Package Exports
Modern Angular libraries use the `exports` field for proper ES module resolution:
```json
{
  "exports": {
    ".": { /* main entry */ },
    "./models": { /* secondary entry */ },
    "./tokens": { /* secondary entry */ }
  }
}
```

### Peer Dependencies Strategy
- Required peers: `@angular/core`, `@angular/common`, `@angular/cdk`
- Optional peer: `ngx-markdown` (detected at runtime)
- Schematic adds required peers to `dependencies`

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| Collection Configuration | 20.1 |
| Schema Definition | 20.2 |
| Schematic Implementation | 20.3 |
| Package Configuration | 15.1 |
| Build Configuration | 17.1, 17.2 |
| Secondary Entry Points | 14.2 |

---

**This document is IMMUTABLE. Do not modify after task start.**
