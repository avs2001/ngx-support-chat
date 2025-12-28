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
→ READ it and `handoff_notes.md` FIRST to understand context before proceeding.

**If no active task (file missing or empty):**
→ Create these BEFORE starting any work:
- `docs/project_tasks/TASK-XXX-plan.md` (immutable task plan)
- `docs/development/implementation_status.md` (progress tracking)
- `docs/development/handoff_notes.md` (session handoff context)
- `docs/development/session_XX_start.md` (session documentation)

**⛔ DO NOT skip this. DO NOT proceed to user's request until done.**

---

# CLAUDE.md - ngx-support-chat

**SDP Version:** 2.2
**Last Updated:** 2025-12-28
**IEC 62304 Class:** None

---

## 🚫 CRITICAL: Document Creation Rules

**ALLOWED FILES - EXHAUSTIVE WHITELIST:**

**Multi-Session Protocol (ONLY these):**
- `docs/development/SESSION_NUMBER.txt`
- `docs/development/process_memory.md` (SDP lessons learned - review before task completion)
- `docs/development/project_memory.md` (project-wide code learnings, persists across tasks)
- `docs/development/implementation_status.md` (active task only)
- `docs/development/handoff_notes.md` (active task only)
- `docs/development/implementation_status_TASK-XXX.md` (suspended tasks)
- `docs/development/handoff_notes_TASK-XXX.md` (suspended tasks)
- `docs/development/implementation_ended_TASK-XXX.md` (completed tasks)
- `docs/development/session_X_start.md` (per session)
- `docs/development/session_X_end.md` (per session)
- `docs/development/archive/TASK-XXX/` (move session docs here on completion)

**Epic & Task Planning (ONLY these):**
- `docs/project_tasks/EPIC-XXX-[name].md` (epic-level multi-task plans)
- `docs/project_tasks/TASK-XXX-plan.md` (immutable task plans)

**Design Documentation (ONLY these):**
- `docs/design/SDD_TASK-XXX.md` (Software Detailed Design per task)

**Architecture Documentation (ONLY these):**
- `docs/architecture/system_architecture.md` (system-level, rarely changes)
- `docs/architecture/[component]_architecture.md` (component-specific)

**Temporary Artifacts (ONLY in temp folder):**
- `temp/task_XXX/session_YYY/*` (any temporary files - scripts, debug, analysis)

**Project Files:**
- `CLAUDE.md` (this file - edit only, never replace)
- `.gitignore` (if needed)
- Source code files in `projects/ngx-support-chat/src/`
- Tests alongside components as `*.spec.ts`
- Demo app in `projects/demo/`

**EXPLICITLY FORBIDDEN (NEVER CREATE):**
- ❌ README.md (unless user explicitly requests)
- ❌ CHANGELOG.md, CONTRIBUTING.md
- ❌ SUMMARY.md, WRAP-UP.md, VERIFICATION.md, TRANSITION.md
- ❌ Any .md file outside the whitelist above
- ❌ Any temporary files outside `temp/` folder
- ❌ Any scripts or artifacts in project root

**ENFORCEMENT RULE:**
**If you want to create a file that is NOT on the whitelist, you MUST:**
1. STOP
2. ASK the user: "Should I create [filename]? It's not in the SDP whitelist."
3. WAIT for explicit approval
4. If approved, create it but DO NOT add similar files in future without asking again

**This rule is NON-NEGOTIABLE and applies to ALL sessions.**

---

## 📁 SDP Document Hierarchy

The SDP uses six document layers with distinct purposes:

### Layer 0: Epic Planning (`docs/project_tasks/`) - OPTIONAL
**Purpose:** Multi-task roadmaps spanning phases of work.

- `EPIC-XXX-[name].md` - One per epic, spans multiple tasks
- **Updated as tasks complete** (progress tracking section)
- Defines phases, dependencies, milestones
- Reference for overall project direction

### Layer 1: Task Planning (`docs/project_tasks/`)
**Purpose:** Immutable task definitions preserving original intent.

- `TASK-XXX-plan.md` - One per task, created at task start
- **NEVER modified after creation**
- Preserves original goals, scope, success criteria
- Reference point when scope creep occurs

### Layer 2: Design Documentation (`docs/design/`)
**Purpose:** Software Detailed Design documentation.

- `SDD_TASK-XXX.md` - One per task, **evolves during implementation**
- Documents software units, interfaces, algorithms
- Status: Draft → In Review → Approved → Implemented

### Layer 3: Architecture Documentation (`docs/architecture/`)
**Purpose:** Living documentation of system design.

- `system_architecture.md` - High-level system design (rarely changes)
- `[component]_architecture.md` - Component-specific designs
- Updated when architecture changes
- Independent of task/session cycles
- Never archived (permanent)

### Layer 4: Session Execution (`docs/development/`)
**Purpose:** Track real-time progress and session handoffs.

- `SESSION_NUMBER.txt` - Global session counter
- `process_memory.md` - SDP execution lessons (review before task completion)
- `project_memory.md` - Project-specific patterns, gotchas, decisions (persistent)
- `implementation_status.md` - Current task progress (EVOLVES)
- `handoff_notes.md` - Immediate next session context (100-150 lines max)
- `session_X_start.md` / `session_X_end.md` - Session documentation
- `archive/TASK-XXX/` - Archived session docs

**Two-Memory Pattern:**
| File | Purpose | Content |
|------|---------|---------|
| `process_memory.md` | How to follow SDP | Protocol pitfalls, execution errors |
| `project_memory.md` | How this project works | Code patterns, gotchas, decisions |

### Layer 5: Temporary Artifacts (`temp/`)
**Purpose:** Preserve development artifacts for audit trail.

- `temp/task_XXX/session_YYY/` - Temporary files per session
- Includes: scratch scripts, debug outputs, analysis files
- **PRESERVED after task completion** (audit trail)
- Never auto-deleted, user-initiated cleanup only

---

### Task File Lifecycle

```
NEW TASK:
  - Create docs/project_tasks/TASK-XXX-plan.md (immutable)
  - Create docs/design/SDD_TASK-XXX.md (evolves)
  - Create docs/development/implementation_status.md
  - Create docs/development/handoff_notes.md
  - Create temp/task_XXX/session_001/

TASK SWITCH:
  - Rename implementation_status.md → implementation_status_TASK-OLD.md
  - Rename handoff_notes.md → handoff_notes_TASK-OLD.md
  - Create implementation_status.md (for new active task)
  - Create handoff_notes.md (for new active task)

TASK COMPLETE:
  - Update SDD status to "Implemented"
  - Rename implementation_status.md → implementation_ended_TASK-XXX.md
  - Delete handoff_notes.md
  - Archive session docs to docs/development/archive/TASK-XXX/
  - temp/task_XXX/ REMAINS (audit trail)

BACK TO SUSPENDED TASK:
  - Rename current files to _TASK-CURRENT.md
  - Rename _TASK-OLD.md files back to active names
```

**Key Principles:**
1. **Task plans are immutable** - Preserve original intent
2. **Design docs evolve** - Refined as implementation progresses
3. **Architecture docs are living** - Updated when architecture changes
4. **Temp artifacts preserved** - Never auto-delete

---

## 🔄 Multi-Session Protocol

### STEP 1: If Continuing a Task, Load Context

**YOU MUST read these files IN THIS ORDER before doing ANY work:**

1. **Read Implementation Status** (overall progress)
   ```bash
   cat docs/development/implementation_status.md
   ```
   - Note the task ID and current milestone
   - Check progress percentage
   - Review "Right Now" section for immediate context

2. **Read Handoff Notes** (immediate context)
   ```bash
   cat docs/development/handoff_notes.md
   ```
   - Look for "Resume Point" exact location
   - Execute "Next Three Actions" in order
   - Check "Blockers" for known issues

3. **Verify Git State**
   ```bash
   git status
   git log -1 --oneline
   ```
   - Confirm branch matches handoff notes
   - Verify no uncommitted changes (unless documented)

4. **Create Session Start Document (MANDATORY - DO THIS NOW)**
   ```bash
   # Use the session number from start
   touch docs/development/session_${SESSION_NUM}_start.md

   # Document:
   # - Session number and date/time
   # - Task ID and current milestone
   # - What you plan to accomplish this session
   # - Starting point from handoff notes
   ```

   **TIMING IS CRITICAL:** Create this file IMMEDIATELY after reading context,
   BEFORE writing any code. If you've already started implementation, you've waited too long.

   **Purpose distinction:**
   - `session_start.md` = PLAN (intent, goals, expected approach)
   - `session_end.md` = RESULTS (actual outcomes, deviations, learnings)

   **Self-check:** "Have I written any code yet?" - If YES, session_start.md is overdue.

5. **Load Extended Context (if files exist)**
   ```bash
   # Read SDP lessons (if file exists)
   cat docs/development/process_memory.md 2>/dev/null

   # Read project-specific patterns (if file exists)
   cat docs/development/project_memory.md 2>/dev/null
   ```
   - `process_memory.md` = How to follow SDP correctly
   - `project_memory.md` = How this codebase works (patterns, gotchas, decisions)

### STEP 2: During the Session

**YOU MUST maintain documentation:**

1. **Update Progress Real-Time (MANDATORY)**
   - When completing a task: Update implementation_status.md immediately
   - When finding issues: Document in handoff_notes.md
   - When making decisions: Record rationale in implementation_status.md

2. **Commit Frequently**
   ```bash
   # After each meaningful change
   git add -A
   git commit -m "feat(TASK-XXX): descriptive message"
   ```

3. **Monitor Context Usage (MANDATORY)**

   **Context Budget: 200,000 tokens**

   | Usage Level | Tokens Used | Remaining | REQUIRED ACTION |
   |-------------|-------------|-----------|-----------------|
   | **60%** | 120,000 | 80,000 | ⚠️ **WARNING** - Update documentation proactively |
   | **65%** | 130,000 | 70,000 | 🚨 **CRITICAL** - MUST update docs immediately |
   | **70%** | 140,000 | 60,000 | 🛑 **EMERGENCY** - Save and end session NOW |

   **YOU MUST check token usage after EVERY response and take action at thresholds**

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

4. **Test Result Verification Rule (MANDATORY)**

   **NEVER report test results without actual execution.**

   Claude has a tendency to reason about test outcomes rather than verify them. This leads to false reports like "tests are now passing" when tests were never run.

   **When reporting ANY test results, you MUST:**
   1. **Execute** the test command (npm run test, vitest, etc.)
   2. **Wait** for the command to complete
   3. **Quote** exact results from the output (e.g., "42 passed, 1 failed")
   4. **Show** evidence (include relevant output in your response)

   **Correct Statements:**
   - ✅ "I'll run the tests now to verify..." [runs command] "...vitest shows 42 passed"
   - ✅ "After running `npm test`, I see 3 failures in chat-message.spec.ts"
   - ✅ "The test command failed with: [error message]"

   **Incorrect Statements:**
   - ❌ "Tests should pass now" (assumption, not verification)
   - ❌ "The fix resolves the test failure" (reasoning, not execution)
   - ❌ "Tests are passing" (claim without evidence)

   **Why This Matters:**
   One false test report can ship broken code, cause user to skip verification, waste hours debugging "phantom" issues, and erode trust in Claude's outputs.

### STEP 3: Before Ending Session (MANDATORY) ⚠️ CRITICAL

**🚨 NEVER end a session without completing ALL these steps IN ORDER:**

0. **Check for Unauthorized Files (MANDATORY FIRST STEP)**
   ```bash
   # List all .md files created/modified this session
   git status --short | grep '\.md$'

   # Verify each file against whitelist in "Document Creation Rules" section
   # If any file is NOT on whitelist:
   #   - DELETE it immediately (rm filename.md)
   #   - Do NOT commit unauthorized files

   # Common unauthorized files to check for:
   # README.md, CHANGELOG.md, SUMMARY.md, WRAP-UP.md, VERIFICATION.md
   ```

1. **Create Session End Document (MANDATORY)**
   ```bash
   touch docs/development/session_${SESSION_NUM}_end.md

   # Document:
   # - Session number and date/time
   # - Task ID and milestone worked on
   # - What was accomplished (completed tasks)
   # - What was NOT completed
   # - Any blockers or issues discovered
   # - Code files modified (with line counts)
   ```

2. **Update Implementation Status (MANDATORY)**
   ```bash
   # Edit docs/development/implementation_status.md
   # REQUIRED UPDATES:
   # - Add session to history (newest first) with session number
   # - Update progress percentages for current milestone
   # - Update "Right Now" section with current state
   # - Mark completed milestones/tasks with ✅
   # - Add any new findings to "Current Issues" section

   # SESSION HISTORY COMPRESSION
   # If current session > 30, compress older history:
   # - Keep last 5 sessions with FULL detail
   # - Summarize sessions 6-20 back in groups of 5
   # - Reference sessions 21+ back to archive only
   # - Move old session_X_end.md files to archive/TASK-XXX/
   ```

3. **Update Handoff Notes (MANDATORY)**
   ```bash
   # Edit docs/development/handoff_notes.md
   #
   # Keep handoff notes to 100-150 lines MAX
   # Focus on IMMEDIATE context only:
   #
   # REQUIRED SECTIONS (in order):
   # 1. Resume Point: exact file:line:function + one-sentence context
   # 2. Next Three Actions: specific, with file locations
   # 3. Blockers: list or "None"
   # 4. Key Decisions This Session: brief rationale
   # 5. Working State: branch, last commit, uncommitted?
   # 6. Temporary Artifacts: what's in temp/ and why
   #
   # REMOVE verbose sections:
   # - Code snippets (git has the code)
   # - Full test reports (implementation_status has this)
   # - Command references (CLAUDE.md has this)
   # - Historical context (implementation_status has this)
   ```

4. **Update Design Documentation (IF APPLICABLE)**
   ```bash
   # If design decisions were made this session:
   # - Update docs/design/SDD_TASK-XXX.md with new units/interfaces
   # - Update revision history in SDD

   # If architecture changed (rare):
   # - Update docs/architecture/system_architecture.md
   # - Note in session_end.md that architecture was modified
   ```

5. **Review Temporary Artifacts (MANDATORY)**
   ```bash
   # For each stray artifact:
   # - Valuable? → Move to temp/task_XXX/session_YYY/
   # - Garbage? → Delete it
   # - Source/test? → Move to proper location

   # Document in handoff_notes.md what's in temp folder
   ```

6. **Update CLAUDE.md Active Task Section (IF task status changed)**
   ```bash
   # Only update if:
   # - Task completed → Update "Active Epic & Task" to show no active task
   # - Task suspended → Note which task is suspended
   # - New task started → Update active task info

   # The primary handoff is in implementation_status.md and handoff_notes.md
   # CLAUDE.md just needs high-level status for quick reference
   ```

7. **Ensure Clean Git State and Push to Remote**
   ```bash
   git add -A
   git commit -m "chore(session-${SESSION_NUM}): end of session $(date +%Y-%m-%d)"
   git push origin $(git branch --show-current)
   git status  # MUST show "working tree clean" and "up to date with origin"
   ```

   **Why push is mandatory:**
   - Protects work if context expires between sessions
   - Prevents remote divergence and merge conflicts
   - Enables collaboration and code review
   - Ensures audit trail is preserved in remote repository

8. **Verify All Documents Updated (MANDATORY CHECKLIST)**
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

### STEP 4: Task Completion

**⚠️ Review `docs/development/process_memory.md` before proceeding - common pitfalls documented there.**

#### Task Closure Gate (MANDATORY - CHECK FIRST)

**Success criteria are PASS/FAIL - unchecked items block task closure.**

Before proceeding with task completion:

```bash
# Check for unchecked items in implementation_status.md
grep -E "^\- \[ \]" docs/development/implementation_status.md

# If ANY output, task is NOT complete - do not proceed
```

**Rules:**
1. If ANY success criterion has an unchecked box `[ ]`, the task is NOT complete
2. "Deferred" is not "done" - unchecked items must be completed or moved to a follow-up task
3. If deferring is absolutely necessary:
   - Create TASK-XXX-followup BEFORE closing original task
   - Document what was deferred and why
   - Original task remains open until follow-up task is created

**Mental Checkpoint:** "Are there ANY unchecked boxes or 'deferred' items?" - If YES, task cannot close.

---

When all milestones in implementation_status.md are complete (all boxes checked):

1. **Finalize Design Documentation**
   ```bash
   # Update SDD status to "Implemented"
   # Mark all units as complete in docs/design/SDD_TASK-XXX.md
   # SDD remains in docs/design/ (permanent record, never archived)
   ```

2. **Update and Rename Implementation Status**
   ```bash
   # Update implementation_status.md with final completion status
   # Mark all milestones as ✅ COMPLETE
   # Update "Current Status" to "✅ COMPLETE"

   # Rename to ended status (preserves history)
   mv docs/development/implementation_status.md \
      docs/development/implementation_ended_TASK-XXX.md
   ```

3. **Archive Session Documentation**
   ```bash
   # IMPORTANT: Create session_end.md FIRST, then archive!
   mkdir -p docs/development/archive/TASK-XXX
   mv docs/development/session_*.md \
      docs/development/archive/TASK-XXX/

   # Verify archive complete (see process_memory.md)
   ls docs/development/session_*.md 2>/dev/null && echo "ERROR: Unarchived!" || echo "✅"

   # Delete handoff_notes.md (no longer needed for completed task)
   rm docs/development/handoff_notes.md
   ```

4. **Preserve Temporary Artifacts (DO NOT DELETE)**
   ```bash
   # temp/task_XXX/ REMAINS INTACT
   # This serves as audit trail
   # DO NOT delete temp folder - user-initiated cleanup only

   # Verify temp folder exists and is preserved
   ls -la temp/task_XXX/
   ```

5. **Update CLAUDE.md**
   ```bash
   # Update "Completed Tasks" section:
   # - Increment total count
   # - Update "Latest completed" line with new task

   # Update "Active Epic & Task" section:
   # - Clear active task (or set to next task)
   ```

6. **Capture Learnings (Propose to User)**

   Before closing the task, consider if any learnings should be captured:

   **For `process_memory.md`** (SDP execution lessons):
   - Did you make any SDP protocol errors this task?
   - Did you discover a better way to follow the protocol?

   **For `project_memory.md`** (project-specific knowledge):
   - Pattern used 3+ times across sessions?
   - Gotcha that caused significant delay (>30 min)?
   - Architectural decision with non-obvious rationale?
   - Checklist that applies to multiple tasks?

   **Process:** Propose additions to user; add only after explicit approval.

7. **Handle Next Session**
   ```bash
   # If no other tasks in flight, start fresh next session
   # New session will create new implementation_status.md for new task

   # If switching to suspended task, reactivate it:
   mv docs/development/implementation_status_TASK-OTHER.md \
      docs/development/implementation_status.md
   mv docs/development/handoff_notes_TASK-OTHER.md \
      docs/development/handoff_notes.md
   ```

---

## ⚠️ Multi-Session Rules for Claude Code

1. **ALWAYS check for active task first** - Never assume fresh session
2. **NEVER skip reading status/handoff** - Context is critical
3. **UPDATE documents in real-time** - Don't wait until session end
4. **COMMIT AND PUSH before ending session** - No exceptions
5. **If confused, read handoff_notes.md** - It has the immediate context
6. **NEVER create files outside whitelist** - Ask first if unsure
7. **ALL temp artifacts go to temp/task_XXX/session_YYY/** - No stray files
8. **KEEP CLAUDE.md size stable** - 4 lines max per completed task
9. **NEVER report test results without execution** - Run tests, quote output, show evidence
10. **NEVER close tasks with unchecked items** - All success criteria must pass

### Audit Completeness Rule

**When verifying compliance with any document, check ALL sections.**

1. Create checklist from EVERY section of the document (not just obvious ones)
2. Sections marked CRITICAL or MANDATORY require explicit verification with evidence
3. Never claim "100% compliant" without checking every section
4. Report gaps honestly - partial compliance is better than false claims

**For process_memory.md / project_memory.md audits:**
- Check ALL numbered items, not just code patterns
- Items marked with verification commands must show command output
- Operational checklists (not just code style) must be verified

**Mental Checkpoint:** "Have I verified EVERY section, or just the easy-to-grep items?"

## 🔴 What Happens If You Don't Follow This Protocol

- **Skip reading context** → Duplicate or conflicting work
- **Don't update handoff** → Next session starts blind
- **Leave uncommitted changes** → Work gets lost
- **Don't push to remote** → Remote diverges, merge conflicts accumulate
- **Ignore progress tracking** → Can't measure completion
- **Skip session documentation** → No audit trail
- **Create unauthorized files** → Project clutter, compliance risk
- **Delete temp folder** → Lost audit trail
- **Bloat CLAUDE.md** → Slow context loading, reduced efficiency
- **Report test results without running tests** → Ship broken code, erode trust
- **Close tasks with unchecked items** → Incomplete deliverables, false progress
- **Claim 100% compliance without checking all sections** → Hidden gaps, audit failures

**This protocol is MANDATORY for all multi-session tasks.**

---

## 🧠 Project Memory

**File:** `docs/development/project_memory.md`
**Purpose:** Persistent project-specific knowledge that survives task completion
**Size Limit:** 100 lines maximum
**Format:** Patterns, Gotchas, Decisions
**Updates:** Explicit only - Claude proposes, user confirms before adding
**Read:** At session start if file exists

**When to Propose Memory Additions:**
- Pattern used 3+ times across sessions
- Gotcha that caused significant delay (>30 min debugging)
- Architectural decision with non-obvious rationale
- Checklist that applies to multiple tasks

**Distinction from process_memory.md:**
- `process_memory.md` = How to follow SDP (universal)
- `project_memory.md` = How THIS project works (project-specific)

---

## 📝 New Task Checklist

When starting a new task:

```bash
# 1. Create task plan (immutable)
touch docs/project_tasks/TASK-XXX-plan.md
# Fill in: Goal, Scope, Success Criteria, Milestones

# 2. Create SDD (evolves during task) - Use SDD_TEMPLATE_SIMPLE.md
touch docs/design/SDD_TASK-XXX.md
# Start with: Introduction, Architecture Context, initial Units

# 3. Create implementation status (from task plan)
touch docs/development/implementation_status.md

# 4. Create handoff notes
touch docs/development/handoff_notes.md

# 5. Create temp folder for this task
mkdir -p temp/task_XXX/session_001

# 6. Review/update system architecture (if this task affects it)
cat docs/architecture/system_architecture.md
# Update if task introduces new major component

# 7. Create component architecture (if new component)
touch docs/architecture/[component]_architecture.md  # if needed

# 8. Update CLAUDE.md Active Task section
# Set: Task name, status, progress, quick resume info
```

---

## ⚠️ CRITICAL: Project-Specific Rules

### 🚨 CRITICAL: Always Use Signal-Based APIs

**NEVER use decorator-based inputs/outputs!**

**ALWAYS use signal functions:**
```typescript
// CORRECT
name = input.required<string>();
disabled = input<boolean>(false);
value = model<string>('');
submitted = output<void>();
displayName = computed(() => this.name().toUpperCase());
```

**Mistake to avoid:**
```typescript
// WRONG - Do NOT use decorators
@Input() name: string;
@Output() submitted = new EventEmitter<void>();
```
*Why: Project uses Angular 21 signals. Decorators are deprecated.*

### 🚨 CRITICAL: Component Selector Prefixes

**ALWAYS use correct prefixes:**
- Components: `ngx-` (kebab-case) → `selector: 'ngx-chat-message'`
- Directives: `ngx` (camelCase) → `selector: '[ngxAutoResize]'`

**Mistake to avoid:**
```typescript
// WRONG
selector: 'app-chat-message'  // Wrong prefix
selector: 'ngx_chat_message'  // Wrong format
```
*Why: ESLint enforces these prefixes. Build will fail.*

### 🚨 CRITICAL: OnPush Change Detection

**ALWAYS set OnPush change detection:**
```typescript
@Component({
  selector: 'ngx-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

*Why: Performance requirement. All components must use OnPush.*

### 🚨 CRITICAL: CSS Token Prefixes

**ALWAYS use correct CSS custom property prefixes:**
- Public tokens: `--ngx-` (e.g., `--ngx-chat-bg`)
- Internal tokens: `--_` with fallback (e.g., `--_chat-bg: var(--ngx-chat-bg, #fff)`)

*Why: Consistent theming API for consumers.*

### 🚨 CRITICAL: Test Before Commit

**NEVER commit without running tests!**

```bash
npm run test && npm run build:lib  # MUST pass before commit
```

*Why: 80% coverage threshold enforced. CI will fail.*

---

## 📋 Project-Specific Documentation

### System Overview

**ngx-support-chat** is a pure presentational Angular component library for customer support chat. The component:
- Receives all data via signal inputs
- Emits user actions via outputs
- Delegates all business logic to parent
- Uses CSS custom properties (`--ngx-*`) for theming
- Uses container queries for responsive layout

### Project Structure
```
ngx-support-chat/
├── projects/
│   ├── ngx-support-chat/          # Main library
│   │   ├── src/lib/
│   │   │   ├── components/        # All chat components
│   │   │   ├── directives/        # Auto-resize, auto-scroll
│   │   │   ├── pipes/             # File-size, time-ago, safe-markdown
│   │   │   ├── services/          # Chat config service
│   │   │   └── utils/             # Message grouping, date helpers
│   │   ├── models/                # TypeScript interfaces
│   │   ├── tokens/                # CHAT_CONFIG injection token
│   │   └── schematics/            # ng-add schematic
│   └── demo/                      # Demo application
├── docs/                          # SDP documentation
├── temp/                          # Temporary artifacts
└── CLAUDE.md                      # This file
```

### Component Hierarchy
```
<ngx-chat-container>
├── <ngx-chat-header>           (ng-content projection)
├── <ngx-chat-message-area>     (virtual-scrolled)
│     ├── <ngx-date-separator>  (sticky date groupings)
│     ├── <ngx-message-group>   (grouped consecutive messages)
│     │     └── <ngx-message>   (individual bubble)
│     ├── <ngx-quick-replies>   (interactive buttons)
│     └── <ngx-typing-indicator>
└── <ngx-chat-footer>
      ├── <ngx-attachment-preview>
      ├── <ngx-text-input>
      └── <ngx-action-buttons>
```

### Essential Commands

**Quick Start**
```bash
npm install                        # Install dependencies
npm run build:lib                  # Build library
npm run build:demo                 # Build demo app
```

**Development**
```bash
npm run test                       # Run tests with Vitest
npm run test:watch                 # Watch mode
npm run test:coverage              # With coverage report
npm run lint                       # Run ESLint
npm run format                     # Format with Prettier
```

### Quick Reference

```bash
# Library Development
npm run build:lib                  # Build library for production
npm run build:lib:watch            # Build library in watch mode
npm run build:schematics           # Build ng-add schematics
npm run build                      # Full build (lib + schematics)

# Testing
npm run test                       # Run Vitest tests
npm run test:coverage              # Coverage report (80% threshold)

# Quality
npm run lint                       # ESLint check
npm run lint:fix                   # ESLint fix
npm run format:check               # Prettier check
npm run format                     # Prettier fix

# Package
npm run pack                       # Create npm tarball
```

---

## 🎯 Active Epic & Task

**Epic:** EPIC-001 - ngx-support-chat Library Implementation
**Next Task:** TASK-007 - Accessibility Implementation
**Status:** TASK-006 complete, ready to begin TASK-007

---

## ✅ Completed Tasks

**Total:** 6 tasks completed.

**Where to find task details:**
- **Task Plans:** `docs/project_tasks/TASK-XXX-plan.md`
- **Completion Records:** `docs/development/implementation_ended_TASK-XXX.md`
- **Session Archives:** `docs/development/archive/TASK-XXX/`

**Latest completed:** TASK-006 - Pipes & Utilities (Session 12)

---

**SDP Version**: 2.2
**Project**: ngx-support-chat
**Last Updated**: 2025-12-28
