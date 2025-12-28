# TASK-011: CI/CD Pipeline

**Created:** 2025-12-28
**Status:** Not Started
**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Phase:** 6 - Demo & Packaging
**Complexity:** Low-Medium
**Dependencies:** TASK-010

---

## Goal

Implement GitHub Actions workflows for continuous integration (lint, test, build) and release automation (npm publish, GitHub releases).

---

## Scope

### 1. Main CI Workflow (Spec Section 21.1)

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          verbose: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results.xml

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build library
        run: npm run build:lib

      - name: Build schematics
        run: npm run build:schematics

      - name: Build demo
        run: npm run build:demo

      - name: Upload library artifact
        uses: actions/upload-artifact@v4
        with:
          name: ngx-support-chat
          path: dist/ngx-support-chat/

      - name: Upload demo artifact
        uses: actions/upload-artifact@v4
        with:
          name: demo
          path: dist/demo/

  deploy-demo:
    name: Deploy Demo
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Download demo artifact
        uses: actions/download-artifact@v4
        with:
          name: demo
          path: demo

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload to Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: demo

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Release Workflow (Spec Section 21.2)

**File:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  id-token: write

jobs:
  release:
    name: Release to npm
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Build library
        run: npm run build:lib

      - name: Build schematics
        run: npm run build:schematics

      - name: Verify package
        run: |
          cd dist/ngx-support-chat
          npm pack --dry-run

      - name: Publish to npm
        run: |
          cd dist/ngx-support-chat
          npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
          files: |
            dist/ngx-support-chat/*.tgz
```

### 3. PR Validation Workflow

**File:** `.github/workflows/pr.yml`

```yaml
name: PR Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate:
    name: Validate PR
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check commit messages
        run: |
          # Validate conventional commits (optional)
          echo "Checking commit message format..."

      - name: Check for breaking changes
        run: |
          # Check if breaking changes are documented (optional)
          echo "Checking for breaking changes..."

  size-check:
    name: Bundle Size Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build library
        run: npm run build:lib

      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(du -sb dist/ngx-support-chat/fesm2022 | cut -f1)
          echo "Bundle size: $BUNDLE_SIZE bytes"
          # Fail if bundle exceeds limit (e.g., 500KB)
          if [ $BUNDLE_SIZE -gt 512000 ]; then
            echo "Bundle size exceeds 500KB limit!"
            exit 1
          fi
```

### 4. Dependabot Configuration

**File:** `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      angular:
        patterns:
          - "@angular/*"
          - "@angular-devkit/*"
      development:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier"
          - "vitest"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-patch"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 5. Branch Protection Rules (Documentation)

**Recommended settings for `main` branch:**

```markdown
## Branch Protection: main

### Require pull request reviews
- Required approving reviews: 1
- Dismiss stale pull request approvals when new commits are pushed: ✓
- Require review from Code Owners: ✓ (if using CODEOWNERS)

### Require status checks to pass
- Require branches to be up to date before merging: ✓
- Required checks:
  - CI / Lint
  - CI / Test
  - CI / Build

### Require conversation resolution
- All conversations must be resolved: ✓

### Do not allow bypassing
- Do not allow bypassing the above settings: ✓
```

### 6. CODEOWNERS File

**File:** `.github/CODEOWNERS`

```
# Default owner for everything
* @your-username

# Library source
/projects/ngx-support-chat/ @your-username

# CI/CD configuration
/.github/ @your-username

# Documentation
/docs/ @your-username
```

### 7. npm Scripts for CI

**Root package.json updates:**

```json
{
  "scripts": {
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=./test-results.xml",
    "lint:ci": "npm run lint -- --format=json --output-file=eslint-report.json",
    "build:ci": "npm run build && npm run build:demo"
  }
}
```

---

## Success Criteria

- [ ] CI workflow runs on all PRs to main
- [ ] CI workflow runs on pushes to main and develop
- [ ] Lint job passes (ESLint + Prettier check)
- [ ] Test job executes with coverage reporting
- [ ] Coverage uploaded to Codecov
- [ ] Coverage thresholds enforced (80%+)
- [ ] Build job produces library and demo artifacts
- [ ] Artifacts uploaded for download
- [ ] Demo deploys to GitHub Pages on main merge
- [ ] Release workflow triggers on `v*` tags
- [ ] Release workflow publishes to npm with provenance
- [ ] GitHub release created with auto-generated notes
- [ ] PR validation checks commit format (optional)
- [ ] Bundle size check prevents bloat
- [ ] Dependabot configured for dependency updates
- [ ] All workflows pass with clean repo

---

## Deliverables

1. **Workflows:**
   - `.github/workflows/ci.yml`
   - `.github/workflows/release.yml`
   - `.github/workflows/pr.yml`

2. **Configuration:**
   - `.github/dependabot.yml`
   - `.github/CODEOWNERS`

3. **Documentation:**
   - Branch protection rules (in docs or README)

4. **Scripts:**
   - Updated root `package.json` with CI scripts

---

## Technical Notes

### npm Provenance
npm provenance (--provenance flag) provides:
- Cryptographically signed packages
- Verifiable build source
- Requires `id-token: write` permission

### Codecov Setup
1. Create account at codecov.io
2. Add repository
3. Add `CODECOV_TOKEN` to repository secrets

### npm Token Setup
1. Create npm access token (Publish)
2. Add `NPM_TOKEN` to repository secrets

### GitHub Pages Setup
1. Go to Settings > Pages
2. Source: GitHub Actions
3. Workflow will deploy automatically

### Release Process
```bash
# 1. Update version in projects/ngx-support-chat/package.json
npm version patch|minor|major --no-git-tag-version -w projects/ngx-support-chat

# 2. Commit version bump
git add .
git commit -m "chore: release v1.0.0"

# 3. Create and push tag
git tag v1.0.0
git push origin main --tags
```

### Concurrency Groups
Prevents multiple workflow runs for the same branch:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Spec References

| Topic | Spec Section |
|-------|--------------|
| CI Workflow | 21.1 |
| Release Workflow | 21.2 |

---

**This document is IMMUTABLE. Do not modify after task start.**
