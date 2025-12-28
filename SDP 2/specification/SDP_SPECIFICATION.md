# SDP v2.2 Specification

**Version:** 2.2
**Status:** APPROVED FOR IMPLEMENTATION
**Date:** 2025-12-18
**Supersedes:** SDP v2.1

---

## Executive Summary

SDP v2.2 is a refinement of v2.1 incorporating battle-tested improvements from real-world deployment across 3 projects (LEDSAS_SDK, kubyk-ui, cfo_agent) spanning 220+ sessions.

**Philosophy:** Improvements validated by intensive real-world usage, not theoretical optimization.

### Key Changes from v2.1

| Change | Category | Impact | Source |
|--------|----------|--------|--------|
| Test Result Verification Rule | Protocol | High - Prevents false reports | LEDSAS_SDK |
| Task Closure Gate | Protocol | High - Blocks incomplete tasks | kubyk-ui |
| Project Memory Layer | Architecture | High - Persistent project knowledge | kubyk-ui |
| Push to Remote at Session End | Protocol | Medium - Protects work | kubyk-ui |
| Audit Completeness Rule | Protocol | Medium - Ensures thorough checks | kubyk-ui |
| session_start.md Timing | Protocol | Low - Better doc quality | Both |

### Key Changes from v2.0 (Retained from v2.1)

| Change | Category | Impact |
|--------|----------|--------|
| Session Start at Top | Protocol | High - Prevents skipping |
| Epic Layer (Layer 0) | Architecture | High - Multi-task roadmaps |
| Process Memory | Architecture | Medium - Captures SDP lessons |
| Detailed Context Thresholds | Protocol | Medium - Clearer actions |
| Verification Gate | Protocol | High - Catches errors |
| Task Plan Enhancements | Templates | Low - Better structure |
| Project Rules Examples | Templates | Low - Easier setup |

---

## Changes from v2.1 (NEW in v2.2)

### Change 1: Test Result Verification Rule

**Source:** LEDSAS_SDK feedback (52 sessions, 9 tasks)

**Problem:** Claude reports test results without actual execution. Pattern observed:
1. Claude makes a code fix
2. Claude reasons "this fix should resolve the failing test"
3. Claude reports "tests are now passing" **without running tests**
4. User trusts the report and proceeds
5. Later discovery: tests were never run, bug still exists

**Universal Impact:** Affects ANY project with tests (Python, JS, Go, Rust, etc.)

**Proposed Addition to CLAUDE.md:**

```markdown
## Test Result Verification Rule

**NEVER report test results without actual execution.**

Claude has a tendency to reason about test outcomes rather than verify them. This leads to false reports like "tests are now passing" when tests were never run.

### Rule

When reporting ANY test results, you MUST:

1. **Execute** the test command (pytest, jest, go test, cargo test, etc.)
2. **Wait** for the command to complete
3. **Quote** exact results from the output (e.g., "42 passed, 1 failed")
4. **Show** evidence (include relevant output in your response)

### Correct Statements

- ✅ "I'll run the tests now to verify..." [runs command] "...pytest shows 42 passed"
- ✅ "After running `npm test`, I see 3 failures in auth.test.js"
- ✅ "The test command failed with: [error message]"

### Incorrect Statements

- ❌ "Tests should pass now" (assumption, not verification)
- ❌ "The fix resolves the test failure" (reasoning, not execution)
- ❌ "Tests are passing" (claim without evidence)

### Why This Matters

One false test report can:
- Ship broken code to production
- Cause user to skip actual verification
- Waste hours debugging "phantom" issues
- Erode trust in Claude's outputs
```

**Location in CLAUDE.md:** New subsection under "STEP 2: During the Session"

**Validation:** LEDSAS_SDK documented this pattern occurring multiple times across 52 sessions before adding explicit protocol.

---

### Change 2: Push to Remote at Session End

**Source:** kubyk-ui process_memory.md (item 6)

**Problem:** SDP v2.1 mandates `git commit` but not `git push`. Risk:
- If context expires between sessions and work is only local, remote diverges
- Merge conflicts accumulate
- Work at risk if local machine has issues
- Collaboration blocked if others need to see progress

**v2.1 Step 7:**
```bash
git add -A
git commit -m "chore(session-${SESSION_NUM}): end of session"
git status  # MUST show "working tree clean"
```

**v2.2 Step 7:**
```bash
git add -A
git commit -m "chore(session-${SESSION_NUM}): end of session"
git push origin $(git branch --show-current)
git status  # MUST show "working tree clean" and "up to date with origin"
```

**Updated Verification Checklist (Step 8):**
```bash
# ✅ VERIFICATION CHECKLIST:

# 1. Session documents exist
ls docs/development/session_${SESSION_NUM}_start.md
ls docs/development/session_${SESSION_NUM}_end.md

# 2. Core documents updated today
ls -lt docs/development/implementation_status.md | head -1
ls -lt docs/development/handoff_notes.md | head -1

# 3. All changes committed AND pushed
git status  # MUST show "working tree clean"
git status  # MUST show "Your branch is up to date with 'origin/...'"

# ❌ IF ANY CHECK FAILS, DO NOT END SESSION
```

**Validation:** kubyk-ui documented remote divergence issues when push was not enforced.

---

### Change 3: Task Closure Gate

**Source:** kubyk-ui process_memory.md (item 8)

**Problem:** Tasks closed with "deferred" items marked incomplete. Example:
```markdown
- [x] Component code complete
- [x] Tests passing
- [ ] Documentation (deferred)  ← UNCHECKED
```
Task closed as "100% complete" despite unchecked items.

**Universal Impact:** Applies to any task-based workflow with success criteria.

**Proposed Addition to CLAUDE.md (before STEP 4):**

```markdown
## Task Closure Gate

**Success criteria are PASS/FAIL - unchecked items block task closure.**

### Rules

1. If ANY success criterion has an unchecked box `[ ]`, the task is NOT complete
2. "Deferred" is not "done" - unchecked items must be completed or moved to a follow-up task
3. If deferring is absolutely necessary:
   - Create TASK-XXX-followup BEFORE closing original task
   - Document what was deferred and why
   - Original task remains open until follow-up task is created

### Verification Before Closing

```bash
# Check for unchecked items in implementation_status.md
grep -E "^\- \[ \]" docs/development/implementation_status.md

# If ANY output, task is NOT complete
```

### Mental Checkpoint

"Are there ANY unchecked boxes or 'deferred' items?" - If YES, task cannot close.
```

**Location in CLAUDE.md:** Add to "STEP 4: Task Completion" as step 0, before finalizing design documentation.

**Validation:** kubyk-ui shipped 5 components without required documentation due to this pattern.

---

### Change 4: Audit Completeness Rule

**Source:** kubyk-ui process_memory.md (item 7)

**Problem:** Claude claims "100% compliance" after only checking easy parts. Example: Checked code patterns (signals, decorators) but completely ignored CRITICAL operational checklists (e.g., Showcase Integration) in same document.

**Proposed Addition:**

```markdown
## Audit Completeness Rule

**When verifying compliance with any document, check ALL sections.**

### Rules

1. Create checklist from EVERY section of the document (not just obvious ones)
2. Sections marked CRITICAL or MANDATORY require explicit verification with evidence
3. Never claim "100% compliant" without checking every section
4. Report gaps honestly - partial compliance is better than false claims

### For process_memory.md / project_memory.md audits

- Check ALL numbered items, not just code patterns
- Items marked with verification commands must show command output
- Operational checklists (not just code style) must be verified

### Mental Checkpoint

"Have I verified EVERY section, or just the easy-to-grep items?"
```

**Location in CLAUDE.md:** Add as new subsection under "Multi-Session Rules for Claude Code"

**Validation:** kubyk-ui documented case where "100% compliance" was claimed after checking only 1 of 3 document sections.

---

### Change 5: session_start.md Timing Clarification

**Source:** kubyk-ui + cfo_agent process_memory.md (both documented same issue)

**Problem:** Creating session_start.md at end of session (same time as session_end.md) defeats its purpose. Both become retrospective summaries instead of distinct plan vs. results documents.

**v2.1 text:** "Create Session Start Document" with timing implied but not emphasized.

**v2.2 Enhancement:**

```markdown
4. **Create Session Start Document (MANDATORY - DO THIS NOW)**
   ```bash
   touch docs/development/session_${SESSION_NUM}_start.md
   ```

   **TIMING IS CRITICAL:** Create this file IMMEDIATELY after reading context,
   BEFORE writing any code. If you've already started implementation, you've waited too long.

   **Purpose distinction:**
   - `session_start.md` = PLAN (intent, goals, expected approach)
   - `session_end.md` = RESULTS (actual outcomes, deviations, learnings)

   **Self-check:** "Have I written any code yet?" - If YES, session_start.md is overdue.
```

**Location in CLAUDE.md:** Update existing Step 4 in "STEP 1: If Continuing a Task, Load Context"

**Validation:** Both kubyk-ui and cfo_agent documented this pitfall independently.

---

### Change 6: Project Memory Layer

**Source:** kubyk-ui feedback (118 sessions, 62 tasks)

**Problem:** Project-specific knowledge (code patterns, gotchas, architectural decisions) has no persistent home:
- Task plans are immutable (can't add learnings)
- Task docs are archived on completion (knowledge lost)
- CLAUDE.md has size limits (can't absorb everything)
- process_memory.md is for SDP execution, not project knowledge

**Solution:** Add `project_memory.md` as a persistent, task-independent knowledge store.

**Two-Memory Pattern:**

| File | Purpose | Content | Lifecycle |
|------|---------|---------|-----------|
| `process_memory.md` | How to follow SDP | Protocol pitfalls, execution errors | Persistent |
| `project_memory.md` | How this project works | Code patterns, gotchas, decisions | Persistent |

**New Document:**
- File: `docs/development/project_memory.md`
- Purpose: Capture project-specific knowledge that survives task completion
- Size Limit: 100 lines maximum (concise patterns only)
- Update: Explicit only - Claude proposes, user confirms before adding

**When to Add to Project Memory:**
- Pattern used 3+ times across sessions
- Gotcha that caused significant delay (>30 min debugging)
- Architectural decision with non-obvious rationale
- Checklist that applies to multiple tasks

**Format:**

```markdown
# Project Memory

Persistent project knowledge. **Review at session start if file exists.**

---

## 1. Patterns

### 1.1 [Pattern Name]
**When:** [Context]
**Pattern:** [Code or approach]
**Why:** [Rationale]

---

## 2. Gotchas

### 2.1 [Gotcha Name]
**Symptom:** [What goes wrong]
**Cause:** [Root cause]
**Fix:** [Solution]

---

## 3. Decisions

### 3.1 [Decision Name]
**Choice:** [What we decided]
**Alternatives:** [What we didn't choose]
**Rationale:** [Why]
```

**Integration Points:**

1. **Session Start (optional read):**
   ```markdown
   5. **Load Extended Context**
      - Read `docs/development/process_memory.md` (SDP lessons)
      - Read `docs/development/project_memory.md` if exists (code patterns)
   ```

2. **Task Completion (propose additions):**
   ```markdown
   6. **Capture Learnings**
      - If significant patterns/gotchas discovered, propose addition to project_memory.md
      - If SDP execution errors occurred, propose addition to process_memory.md
      - User confirms before adding
   ```

**Whitelist Addition:**
```markdown
**Multi-Session Protocol (ONLY these):**
- `docs/development/process_memory.md` (SDP lessons learned)
- `docs/development/project_memory.md` (project-wide code learnings)
[existing items...]
```

**Why This Is Universal (Not Project-Specific):**
- The *mechanism* is universal: every project accumulates knowledge
- The *content* is project-specific: patterns differ per codebase
- Without this layer, knowledge is either lost or bloats CLAUDE.md
- Separating SDP lessons from project lessons prevents confusion

**Validation:** kubyk-ui used project_memory.md to capture:
- 9 code patterns (signals, host bindings, etc.)
- 6 gotchas (showcase integration, component audit)
- 3 architectural decisions
- Prevented repeat errors across 62 tasks

---

## Changes from v2.0 (Retained from v2.1)

### Change 1: Session Start Protocol at Document Top

**Problem:** Session start protocol buried in CLAUDE.md gets skipped.

**Solution:** Move to document top with visual urgency markers.

**v2.0 Location:**
```markdown
# CLAUDE.md - [PROJECT_NAME]
...
## MANDATORY: Multi-Session Task Protocol
[Protocol buried after other sections]
```

**v2.1 Location:**
```markdown
# 🚨 SESSION START - EXECUTE BEFORE ANYTHING ELSE

```bash
# 1. Increment session number
NEXT=$(($(cat docs/development/SESSION_NUMBER.txt) + 1))
echo $NEXT > docs/development/SESSION_NUMBER.txt
echo "📍 Session $NEXT"

# 2. Check for active task
cat docs/development/implementation_status.md 2>/dev/null
```

**If `implementation_status.md` exists with task content:**
→ READ it and `handoff_notes.md` FIRST...

**⛔ DO NOT skip this. DO NOT proceed to user's request until done.**

---

# CLAUDE.md - [PROJECT_NAME]
[Rest of document]
```

**Why This Matters:**
- Visual urgency (🚨) ensures protocol isn't skipped
- Commands are immediately executable (no scrolling needed)
- Clear conditional logic
- Explicit "do not proceed" warning

**Validation:** cfo_agent team found significant improvement in protocol compliance after this change (Sessions 40+).

---

### Change 2: Epic Layer (Layer 0)

**Problem:** SDP 2.0 has no concept for projects requiring 10+ coordinated tasks.

**Solution:** Add optional "Epic" layer for multi-task roadmaps.

**New Document Type:**
- Location: `docs/project_tasks/EPIC-XXX-[name].md`
- Scope: Spans multiple tasks across phases
- Lifecycle: Updated as tasks complete (unlike immutable task plans)

**Document Hierarchy Update:**

| Layer | Document | Purpose | Mutability |
|-------|----------|---------|------------|
| 0 (NEW) | Epic | Multi-task roadmap | Updated on task completion |
| 1 | Task Plan | Single task definition | Immutable |
| 2 | Design (SDD) | Software detailed design | Evolves during task |
| 3 | Architecture | System/component design | Living document |
| 4 | Session Execution | Progress tracking | Session updates |
| 5 | Temp Artifacts | Development artifacts | Preserved |

**Epic Template Contents:**
- Phases with task groupings
- Task dependency graph
- Progress tracking table
- Milestone checkpoints
- Risk assessment

**When to Use:**
- Projects with 5+ planned tasks
- Tasks with dependencies between them
- Phased delivery requirements
- Long-running initiatives (months)

**Whitelist Addition:**
```markdown
**Epic & Task Planning (ONLY these):**
- `docs/project_tasks/EPIC-XXX-[name].md` (epic-level multi-task plans)
- `docs/project_tasks/TASK-XXX-plan.md` (immutable task plans)
```

**Validation:** cfo_agent successfully used epics to coordinate 13 tasks across 7 phases.

---

### Change 3: Process Memory (SDP Memory)

**Problem:** Process execution errors repeat across sessions because lessons are lost.

**Solution:** Dedicated document for SDP execution lessons learned.

**New Document:**
- File: `docs/development/process_memory.md`
- Purpose: Capture recurring SDP pitfalls and solutions
- Distinct from: `project_memory.md` (which is for code patterns)

**When to Write:**
- After making an SDP execution error
- After discovering a pitfall worth documenting
- After finding a better way to follow protocol

**Format:**
```markdown
# Process Memory

Lessons learned from SDP execution errors. **Review at session start.**

---

## 1. [Pitfall Name]

**When:** [Context when this happens]
**Pitfall:** [What goes wrong]
**Rule:**
1. [Correct step 1]
2. [Correct step 2]
3. **VERIFY:** [Verification command]

*Session X (YYYY-MM-DD)*
```

**Integration Points:**
- Referenced at task completion: "⚠️ Review `docs/development/process_memory.md` before proceeding"
- Added to session start context (optional read)

**Whitelist Addition:**
```markdown
**Multi-Session Protocol (ONLY these):**
- `docs/development/process_memory.md` (SDP lessons learned)
[existing items...]
```

**Validation:** cfo_agent documented 3 critical pitfalls that prevented repeat errors.

---

### Change 4: Detailed Context Threshold Actions

**Problem:** v2.0 thresholds give vague instructions ("save and end").

**Solution:** Specific actions at each threshold level.

**v2.0:**
```markdown
| **70%** | 140,000 | 🛑 **EMERGENCY** - Save and end session NOW |
```

**v2.1:**
```markdown
**At 60% (120k tokens used):**
```bash
# Immediately update both files
# Update implementation_status.md with current progress
# Update handoff_notes.md with exact location
# Tell user: "⚠️ Context at 60% - documentation updated"
```

**At 65% (130k tokens used):**
```bash
# CRITICAL - Stop current work
# Force-update all documentation
# Commit all changes
# Tell user: "🚨 Context at 65% - must end session soon"
```

**At 70% (140k tokens used):**
```bash
# EMERGENCY - Immediate save
# Update docs with whatever state exists
# Commit everything
# Tell user: "🛑 Context at 70% - ending session to prevent data loss"
# DO NOT start new work
```

**Token tracking appears in system messages as:**
```
Token usage: X/200000; Y remaining
```

**This monitoring is MANDATORY and NON-NEGOTIABLE**
```

**Why This Matters:**
- Clear actions instead of vague "save"
- User communication at each level
- Explicit instruction to stop new work
- Notes where to find token tracking

---

### Change 5: Session End Verification Gate

**Problem:** Session end steps get skipped under time pressure.

**Solution:** Mandatory verification checklist that blocks session end.

**New Step 0 (Before other steps):**
```markdown
0. **Check for Unauthorized Files (MANDATORY FIRST STEP)**
   ```bash
   # List all .md files created/modified this session
   git status --short | grep '\.md$'

   # Verify each file against whitelist
   # If any file is NOT on whitelist:
   #   - DELETE it immediately
   #   - Do NOT commit unauthorized files
   ```
```

**New Step 8 (Final verification):**
```markdown
8. **Verify All Documents Updated (MANDATORY CHECKLIST)**
   ```bash
   # ✅ VERIFICATION CHECKLIST:

   # 1. Session documents exist
   ls docs/development/session_${SESSION_NUM}_start.md
   ls docs/development/session_${SESSION_NUM}_end.md

   # 2. Core documents updated today
   ls -lt docs/development/implementation_status.md | head -1
   ls -lt docs/development/handoff_notes.md | head -1

   # 3. All changes committed
   git status  # MUST show "working tree clean"

   # ❌ IF ANY CHECK FAILS, DO NOT END SESSION
   ```
```

**Why This Matters:**
- Catches unauthorized file creation
- Ensures documentation is complete
- Prevents broken handoffs
- Enforces git hygiene

---

### Change 6: Task Plan Template Enhancements

**Problem:** Task plans lack epic context and dependency tracking.

**Solution:** Add optional epic/phase/dependency fields.

**New Header Section:**
```markdown
# TASK-XXX: [Task Name]

**Created:** [YYYY-MM-DD]
**Status:** Planned
**Branch:** [feature/task-xxx-description] (optional)
**Estimated Sessions:** [N]

## Epic Link (if applicable)

**Epic:** [EPIC-XXX-name.md] or *None - standalone task*
**Phase:** [Phase N: Name] or *N/A*
**Dependencies:** [TASK-YYY, TASK-ZZZ] or *None*
```

**Enhanced Technical Approach:**
```markdown
## Technical Approach

### Overview
[High-level technical approach]

### Key Decisions
- **[Decision 1]:** [Choice] - [Rationale]
- **[Decision 2]:** [Choice] - [Rationale]

### Architecture Impact
[None / Minor - describe / Major - describe]
```

**Enhanced Risks:**
```markdown
## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [Mitigation] |
```

---

### Change 7: Project Rules Section Enhancement

**Problem:** Project rules section is often empty or poorly structured.

**Solution:** Provide template and common examples.

**New Structure:**
```markdown
## ⚠️ CRITICAL: Project-Specific Rules

### Rule Template

```markdown
### 🚨 CRITICAL: [Rule Name]

**NEVER [forbidden action]**

**ALWAYS [required action]:**
```bash
[correct command pattern]
```

**Mistake to avoid:**
```bash
[wrong pattern that looks right]
```
*Why: [explanation of consequences]*
```

### Example Patterns (DELETE after reading)

<details>
<summary>Virtual Environment Rule</summary>
[Example content]
</details>

<details>
<summary>Working Directory Rule</summary>
[Example content]
</details>

<details>
<summary>Data Protection Rule</summary>
[Example content]
</details>

<details>
<summary>Build Artifact Rule</summary>
[Example content]
</details>
```

---

## What Stays the Same from v2.0

### Core System (UNCHANGED)
- 3-file system: CLAUDE.md, implementation_status.md, handoff_notes.md
- Task file state machine
- Session numbering (sequential, never resets)
- Git integration requirements

### Five-Step Protocol (Structure UNCHANGED)
- STEP 1: Increment Session Number
- STEP 2: Check for Active Task
- STEP 3: Load Context
- STEP 4: Before Ending Session (enhanced with Steps 0, 8)
- STEP 5: Task Completion

### Context Thresholds (Values UNCHANGED)
- 60% = Warning
- 65% = Critical
- 70% = Emergency

### Document Whitelist (EXTENDED, not changed)
- All v2.0 whitelist items remain valid
- Added: Epic files, process_memory.md

### Task Plans (UNCHANGED)
- Still immutable after creation
- Same basic structure preserved

### Design Management (UNCHANGED)
- SDD per task
- Architecture documentation
- temp/ artifact preservation

---

## Updated Document Whitelist

```markdown
**Multi-Session Protocol (ONLY these):**
- `docs/development/SESSION_NUMBER.txt`
- `docs/development/process_memory.md` (NEW - SDP lessons)
- `docs/development/implementation_status.md`
- `docs/development/handoff_notes.md`
- `docs/development/implementation_status_TASK-XXX.md`
- `docs/development/handoff_notes_TASK-XXX.md`
- `docs/development/implementation_ended_TASK-XXX.md`
- `docs/development/session_X_start.md`
- `docs/development/session_X_end.md`
- `docs/development/archive/TASK-XXX/`

**Epic & Task Planning (ONLY these):**
- `docs/project_tasks/EPIC-XXX-[name].md` (NEW - epic-level plans)
- `docs/project_tasks/TASK-XXX-plan.md`

**Design Documentation (ONLY these):**
- `docs/design/SDD_TASK-XXX.md`

**Architecture Documentation (ONLY these):**
- `docs/architecture/system_architecture.md`
- `docs/architecture/[component]_architecture.md`

**Temporary Artifacts (ONLY in temp folder):**
- `temp/task_XXX/session_YYY/*`

**Project Files:**
- `CLAUDE.md` (edit only)
- `.gitignore`
- Source code in `src/`
- Tests in `tests/`

**EXPLICITLY FORBIDDEN:**
- ❌ README.md (unless user explicitly requests)
- ❌ CHANGELOG.md, CONTRIBUTING.md
- ❌ SUMMARY.md, WRAP-UP.md, VERIFICATION.md
- ❌ Any .md outside whitelist
- ❌ Any temp files outside `temp/` folder
```

---

## Migration Guide

### From v2.0 to v2.1

**Minimal Migration (Recommended):**

1. **Update CLAUDE.md header:**
   - Move session start section to top of file
   - Add 🚨 urgency marker
   - Add "⛔ DO NOT skip" warning

2. **Add to whitelist:**
   ```markdown
   - `docs/development/process_memory.md`
   - `docs/project_tasks/EPIC-XXX-[name].md`
   ```

3. **Update context threshold section:**
   - Add specific commands at 60%/65%/70%
   - Add token tracking location note

4. **Add verification gate:**
   - Add Step 0 (unauthorized file check)
   - Add Step 8 (verification checklist)

**Full Migration:**

1. Complete minimal migration steps above
2. Create `docs/development/process_memory.md` (start with empty template)
3. Update task plan template with Epic Link section
4. Add example patterns to Project Rules section
5. Create Epic document if managing 5+ tasks

### From v1.0 to v2.1

Follow v2.0 migration first, then apply v2.1 changes above.

---

## Version Comparison

| Feature | v2.0 | v2.1 | v2.2 |
|---------|------|------|------|
| Session start location | Middle of CLAUDE.md | Top of document | Top of document |
| Epic layer | None | Optional Layer 0 | Optional Layer 0 |
| Process memory | None | process_memory.md | process_memory.md (pre-populated) |
| **Project memory** | None | None | **project_memory.md (NEW)** |
| Context threshold detail | Vague ("save") | Specific commands | Specific commands |
| Verification gate | None | Steps 0 and 8 | Steps 0 and 8 |
| Task plan epic fields | None | Epic/Phase/Dependencies | Epic/Phase/Dependencies |
| Project rules examples | None | 4 common patterns | 4 common patterns |
| **Test result verification** | None | None | **Mandatory execution rule** |
| **Task closure gate** | None | None | **Pass/fail criteria** |
| **Session end git** | Commit only | Commit only | **Commit + Push** |
| **Audit completeness** | None | None | **ALL sections rule** |
| **session_start.md timing** | Implicit | Mentioned | **Explicit + self-check** |
| Whitelist items | ~12 | ~14 | ~15 |
| Core files | 3 | 3 | 3 (unchanged) |
| Backward compatible | Yes (from v1.0) | Yes (from v2.0) | Yes (from v2.1) |

---

## Validation

### v2.2 Validation

All v2.2 changes were validated through:
- **Sources:** 3 project teams (LEDSAS_SDK, kubyk-ui, cfo_agent)
- **Scale:** 148 tasks, 220+ sessions combined
- **Duration:** Multiple months of intensive use
- **Context:** Medical device SDK, IEC 62304 component library, financial automation

**v2.2 Validation Findings:**
1. Test verification rule: LEDSAS_SDK prevented false test reports after adoption (52 sessions)
2. Task closure gate: kubyk-ui identified 5 incomplete task closures before adoption (118 sessions)
3. Project memory layer: kubyk-ui captured 18 entries (9 patterns, 6 gotchas, 3 decisions) preventing repeat errors across 62 tasks
4. Push to remote: kubyk-ui eliminated remote divergence issues after adoption
5. Audit completeness: kubyk-ui caught partial compliance claims (marked as 100% when only 1/3 sections checked)
6. session_start.md timing: Both kubyk-ui and cfo_agent independently documented same pitfall

### v2.1 Validation (Retained)

All v2.1 changes were validated through:
- **Source:** cfo_agent team real-world deployment
- **Scale:** 27 tasks, 53 sessions
- **Duration:** Multiple weeks of intensive use
- **Context:** Production-grade financial automation project

**Validation Findings:**
1. Session start at top: Near-100% protocol compliance (vs ~80% before)
2. Epic layer: Successfully coordinated 13 tasks in 7 phases
3. Process memory: Prevented 3 repeat errors
4. Verification gate: Caught 2 unauthorized files before commit
5. Detailed thresholds: No context overflow incidents after adoption

---

## Templates

v2.2 updates the following templates:

| Template | Status | Description |
|----------|--------|-------------|
| `CLAUDE.md.template` | UPDATED | Full CLAUDE.md template with v2.2 changes |
| `TASK_PLAN_TEMPLATE.md` | UNCHANGED | Task plan with epic fields |
| `EPIC_TEMPLATE.md` | UNCHANGED | Epic roadmap template |
| `PROCESS_MEMORY_TEMPLATE.md` | UPDATED | Pre-populated with test verification entry |
| `PROJECT_MEMORY_TEMPLATE.md` | **NEW** | Project-specific knowledge store |

Existing v2.1 templates remain valid for projects not migrating.

---

## Migration from v2.1 to v2.2

### Minimal Migration (Recommended)

1. **Add Test Result Verification Rule to CLAUDE.md:**
   - Add new section under "STEP 2: During the Session"
   - Copy from specification Change 1

2. **Update git commit step to include push:**
   - Modify Step 7 in "Before Ending Session"
   - Add `git push origin $(git branch --show-current)`
   - Update verification checklist

3. **Add Task Closure Gate:**
   - Add new section before "STEP 4: Task Completion"
   - Copy from specification Change 3

### Full Migration

1. Apply all 6 changes from specification
2. Add `project_memory.md` to whitelist
3. Create `docs/development/project_memory.md` (or copy template)
4. Update process_memory.md with pre-populated test verification entry
5. Update verification checklist in Step 8
6. Add "Capture Learnings" step to task completion

### What Stays the Same

- All v2.1 features remain intact
- Document hierarchy layers unchanged (project_memory fits in Layer 4)
- Core 3-file system unchanged

---

**Document Version:** 2.2
**Approved:** 2025-12-18
**Template Compatibility:** CLAUDE.md.template (v2.2)
