# SDP v2.0 Specification

**Version:** 2.0
**Status:** APPROVED FOR IMPLEMENTATION
**Date:** 2025-11-25
**Supersedes:** SDP v2.0-PROPOSAL (full version)

---

## Executive Summary

SDP v2.0 is a focused evolution of the v1.0 framework that improves efficiency without adding complexity. It maintains the proven 3-file system while introducing targeted improvements for scalability and clarity.

**Philosophy:** The best framework is the simplest one that solves your actual problems.

### Key Differences from Full v2.0

| Aspect | Full v2.0 | v2.0 |
|--------|-----------|-----------|
| New files | 3-4 (YAML, forecast, metadata) | 0 |
| Quick-resume | Separate YAML file | Enhanced CLAUDE.md section |
| Forecasting | Complex prediction system | None (reactive thresholds work) |
| Adaptive loading | MINIMAL/STANDARD/FULL strategies | Natural adaptation |
| Priority markers | XML tags | Document structure |
| History compression | Yes | Yes (kept) |
| Document whitelist | No | Yes (added) |
| Task planning layer | No | Yes (added) |

---

## Core Design Principles

### 1. Zero New Files
The 3-file system works. Don't add more files that can desync.
- CLAUDE.md (project-level + quick-resume)
- implementation_status.md (task progress)
- handoff_notes.md (session handoff)

### 2. Structure Over Tags
Put critical information FIRST in documents. Claude naturally pays more attention to what's at the top. No XML priority tags needed.

### 3. Proven Patterns
Every v2.0 feature is either:
- Already working in v1.0 (enhanced)
- Proven in real projects (borrowed from CFO Agent implementation)

### 4. Backward Compatible
v1.0 projects continue working unchanged. v2.0 features activate progressively.

### 5. Compression, Not Complexity
Reduce token usage through smarter document structure, not through complex loading strategies.

---

## Changes from v1.0

### Change 1: Session History Compression

**Problem:** Session history in implementation_status.md grows linearly forever.
- Session 50: ~15,000 tokens just for history
- Session 100: ~30,000 tokens (unsustainable)

**Solution:** Automatic compression with tiered detail levels.

**Structure:**
```markdown
## Session History

### Recent Sessions (Full Detail - Last 5)

#### Session 52 (2025-10-31) - 50 minutes ⭐ LATEST
**Focus:** JWT signature and expiry validation
**Completed:**
- Implemented jwt.verify() for RS256 signature validation
- Added expiry time check with proper error codes
- Wrote 6 unit test cases covering all edge cases
**Next:** Create auth middleware and integration tests
**Context Used:** 74% (148k/200k tokens)
**Files Modified:**
  - src/auth/jwt.js (+95 lines, -8 lines)
  - tests/auth/jwt.test.js (+127 lines)

#### Session 51 (2025-10-30) - 45 minutes
[Full details...]

#### Session 50, 49, 48...
[Full details for last 5 sessions]

### Earlier Sessions (Summarized)

**Sessions 42-47** (6 sessions, ~4.5 hours total)
- Focus: JWT validation planning and setup
- Completed Milestone 2, started Milestone 3
- Key decisions: RS256 algorithm, 15min expiry
- Progress: 55% → 64%

**Sessions 32-41** (10 sessions, ~7 hours total)
- Focus: JWT token generation
- Key decisions: Token structure, refresh rotation
- Progress: 30% → 55%

### Archived Sessions

Sessions 1-31: See `docs/development/archive/TASK-XXX/`
- Project foundation and setup
- Database and user model
- Total: ~23 hours across 31 sessions
```

**Compression Rules:**

| Session Range | Detail Level | Tokens |
|---------------|--------------|--------|
| Last 5 | Full detail | ~1,500 (300 each) |
| 6-20 back | Grouped summaries (5 per group) | ~450 |
| 21+ back | Archive reference | ~100 |
| **Total** | **Bounded** | **~2,050 max** |

**Trigger:** Compression activates when session count > 30.

**Implementation:**
```markdown
### STEP 4: Before Ending Session

2. **Update Implementation Status (MANDATORY)**
   [Existing instructions...]

   **NEW: Session History Compression**
   If current session > 30:
   - Keep last 5 sessions with full detail
   - Summarize sessions 6-20 in groups of 5
   - Reference sessions 21+ to archive
   - Move old session_X_end.md files to archive/
```

---

### Change 2: Streamlined Handoff Notes

**Problem:** Handoff notes can balloon to 400+ lines with redundant information.

**Solution:** Maximum 100-150 lines, focused on immediate context.

**v2.0 handoff_notes.md Template:**

```markdown
# Handoff: Session X → Session Y

**Task:** TASK-XXX - [Name]
**Date:** YYYY-MM-DD
**Duration:** XX minutes

---

## 🎯 Resume Point

**File:** `path/to/file.py`
**Line:** 123
**Function:** `function_name()`
**Context:** [One sentence: what you just did and where you stopped]

## 📋 Next Three Actions

1. **[Action 1]**
   - File: `path/to/file.py:123`
   - What: [Specific task]
   - Est: X minutes

2. **[Action 2]**
   - File: `path/to/file.py:150`
   - What: [Specific task]
   - Est: X minutes

3. **[Action 3]**
   - File: `tests/test_file.py`
   - What: [Specific task]
   - Est: X minutes

## 🚨 Blockers

[None]
<!-- Or list blockers:
| Blocker | Severity | Impact | Notes |
|---------|----------|--------|-------|
| [Issue] | High | [Impact] | [Notes] |
-->

## 💡 Key Decisions This Session

- **[Decision 1]:** [Brief rationale]
- **[Decision 2]:** [Brief rationale]

## 🔧 Working State

- **Branch:** `feature/xxx`
- **Last Commit:** `abc123 - commit message`
- **Uncommitted Changes:** No
- **Tests Passing:** Yes (X/Y)

---

**Session X complete. Ready for Session Y.**
```

**What's Removed (vs v1.0 verbose handoffs):**
- ❌ Verbose code snippets (git has the code)
- ❌ Full test coverage reports (implementation_status has this)
- ❌ Command reference sections (CLAUDE.md has this)
- ❌ Background/historical context (implementation_status has this)
- ❌ XML priority tags (structure handles priority)
- ❌ Detailed environment checks (one-time setup)

**What's Kept:**
- ✅ Exact resume point (file:line)
- ✅ Next three actions (specific and concrete)
- ✅ Blockers (if any)
- ✅ Key decisions (for context)
- ✅ Git state (branch, commit, clean?)

---

### Change 3: Enhanced CLAUDE.md "Active Task" Section

**Problem:** Need quick-resume capability without adding a YAML file.

**Solution:** Enhance the existing "Active Multi-Session Task" section in CLAUDE.md.

**v2.0 Structure:**

```markdown
## 🎯 Active Multi-Session Task

**Task:** TASK-XXX - [Task Name]
**Status:** IN PROGRESS - Milestone 3 of 4
**Progress:** 67% complete
**Sessions:** 8 complete (Sessions 45-52)

### Quick Resume
- **Location:** `src/auth/jwt.js:156`
- **Function:** `validateRefreshToken()`
- **Context:** Implemented parsing and structure validation, need signature verification

### Next Session: 53
**Goals:**
- [ ] Create auth middleware using validateRefreshToken()
- [ ] Apply middleware to protected routes
- [ ] Write integration tests

**Estimated Duration:** 45-60 minutes

### Success Criteria
- [ ] All protected routes require valid JWT
- [ ] Invalid tokens return 401/403 appropriately
- [ ] Integration tests cover full auth flow
- [ ] Test coverage >80%

### Key References
- Implementation Status: `docs/development/implementation_status.md`
- Handoff Notes: `docs/development/handoff_notes.md`
- Architecture: `docs/architecture/auth_design.md`
```

**Benefits:**
- Quick-resume without separate file
- All essential info in ~30 lines
- Already in CLAUDE.md (no new file)
- Serves as "mini-dashboard" for task status

---

### Change 4: Document Creation Whitelist

**Problem:** Claude can create unnecessary documentation files that clutter the project.

**Solution:** Explicit whitelist with enforcement rule.

**Add to CLAUDE.md template:**

```markdown
## 🚫 CRITICAL: Document Creation Rules

**ALLOWED FILES - EXHAUSTIVE WHITELIST:**

**Multi-Session Protocol (ONLY these):**
- `docs/development/SESSION_NUMBER.txt`
- `docs/development/implementation_status.md` (active task only)
- `docs/development/handoff_notes.md` (active task only)
- `docs/development/implementation_status_TASK-XXX.md` (suspended tasks)
- `docs/development/handoff_notes_TASK-XXX.md` (suspended tasks)
- `docs/development/implementation_ended_TASK-XXX.md` (completed tasks)
- `docs/development/session_X_start.md` (per session)
- `docs/development/session_X_end.md` (per session)
- `docs/development/archive/TASK-XXX/` (archived session docs)

**Task Planning (ONLY these):**
- `docs/project_tasks/TASK-XXX-plan.md` (immutable task plans)

**Architecture Documentation (ONLY these):**
- `docs/architecture/*.md` (solution architecture documents)

**Project Files:**
- `CLAUDE.md` (edit only, never recreate)
- `.gitignore` (if needed)
- Source code files as needed for the task

**EXPLICITLY FORBIDDEN (NEVER CREATE):**
- ❌ README.md (unless user explicitly requests)
- ❌ CHANGELOG.md
- ❌ CONTRIBUTING.md
- ❌ SUMMARY.md, WRAP-UP.md, VERIFICATION.md, TRANSITION.md
- ❌ Any "analysis", "report", or "planning" .md outside session protocol
- ❌ Any documentation file not in the whitelist above

**ENFORCEMENT RULE:**
If you want to create a file NOT on the whitelist:
1. STOP
2. ASK: "Should I create [filename]? It's not in the SDP whitelist."
3. WAIT for explicit approval
4. If approved, create it but ask again for similar files in future

**This rule is NON-NEGOTIABLE.**
```

---

### Change 5: Task Planning Layer (Optional)

**Problem:** Original task intent gets lost as implementation evolves.

**Solution:** Immutable task plans that preserve original goals.

**Three-Layer Document Hierarchy:**

```
Layer 1: Task Planning (IMMUTABLE)
├── docs/project_tasks/TASK-XXX-plan.md
│   - Created at task start
│   - NEVER modified after creation
│   - Preserves original intent and success criteria
│   - Reference point for scope discussions

Layer 2: Session Execution (MUTABLE)
├── docs/development/
│   ├── SESSION_NUMBER.txt
│   ├── implementation_status.md (evolves with reality)
│   ├── handoff_notes.md (updated each session)
│   ├── session_X_start.md
│   ├── session_X_end.md
│   └── archive/TASK-XXX/

Layer 3: Architecture (LIVING)
├── docs/architecture/
│   ├── system_overview.md
│   ├── component_design.md
│   └── [feature]_architecture.md
```

**Task Plan Template:**

```markdown
# TASK-XXX: [Task Name]

**Created:** YYYY-MM-DD | **Session:** X
**Status:** IMMUTABLE - DO NOT EDIT

## Goal
[Clear, concise statement of what this task aims to accomplish]

## Scope
**In Scope:**
- [Item 1]
- [Item 2]

**Out of Scope:**
- [Item 1]
- [Item 2]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Milestones
1. **Milestone 1:** [Description]
2. **Milestone 2:** [Description]
3. **Milestone 3:** [Description]

## Estimated Effort
X-Y sessions (~Z hours)

## High-Level Approach
[Brief description of intended approach]

---
**This document is IMMUTABLE. Do not edit after creation.**
**For current status, see: docs/development/implementation_status.md**
```

**Lifecycle:**
- **Create:** When starting new task (Session 1 of task)
- **Read:** Referenced throughout task lifetime
- **Update:** NEVER (immutable by design)
- **Archive:** Remains in `docs/project_tasks/` forever

---

## What Stays the Same from v1.0

### Five-Step Protocol (UNCHANGED)
- STEP 1: Increment Session Number
- STEP 2: Check for Active Task
- STEP 3: Load Context
- STEP 4: Before Ending Session
- STEP 5: Task Completion

### Session Numbering (UNCHANGED)
- Sequential starting from 1
- Never resets across tasks
- Stored in SESSION_NUMBER.txt

### Task State Machine (UNCHANGED)
- `implementation_status.md` = active
- `implementation_status_TASK-XXX.md` = suspended
- `implementation_ended_TASK-XXX.md` = completed

### Context Thresholds (UNCHANGED)
- 60% = Warning (update docs)
- 65% = Critical (must save soon)
- 70% = Emergency (end session now)

### Git Integration (UNCHANGED)
- Commit before session end
- Clean working tree required
- Branch noted in handoff

### Verification Checklist (UNCHANGED)
- All documents updated
- Session start/end docs exist
- CLAUDE.md active task updated
- Git status clean

---

## Migration Guide

### For Existing v1.0 Projects

**No forced migration required.** v2.0 activates progressively:

1. **History compression:** Triggers automatically at session 30+
2. **Slimmer handoffs:** Natural evolution (just write less)
3. **Document whitelist:** Add to CLAUDE.md when ready
4. **Task plans:** Optional, add for new tasks if desired
5. **Enhanced active task section:** Update format when convenient

### For New Projects

Use the updated CLAUDE.md.template which includes all v2.0 features.

### One-Time Cleanup (Optional)

```bash
# If you want to compress existing history now:
# 1. Open implementation_status.md
# 2. Keep last 5 sessions with full detail
# 3. Summarize sessions 6-20 in groups
# 4. Move sessions 21+ details to archive reference
# 5. Move old session_X_end.md files to archive/TASK-XXX/
```

---

## Version Comparison

| Feature | v1.0 | v2.0 Full | v2.0 |
|---------|------|-----------|-----------|
| Core files | 3 | 6-7 | 3 |
| Session history | Unbounded | Compressed | Compressed |
| Handoff length | Variable (often verbose) | 400+ lines (worse!) | 100-150 lines |
| Quick resume | CLAUDE.md section | YAML file | Enhanced CLAUDE.md section |
| Forecasting | None | Complex prediction | None (not needed) |
| Adaptive loading | None | MINIMAL/STANDARD/FULL | Natural |
| Document whitelist | None | None | Yes |
| Task planning | None | None | Yes (optional) |
| Backward compatible | N/A | Partial | Full |
| Complexity | Low | High | Low |

---

## Success Metrics

### Quantitative
- **History tokens:** Bounded at ~2,050 (vs unbounded in v1.0)
- **Handoff length:** 100-150 lines (vs 300-400+ in v1.0/v2.0-full)
- **Files to maintain:** 3 (same as v1.0)
- **New concepts to learn:** 3 (compression, whitelist, task plans)

### Qualitative
- **Session startup:** Faster (less to read)
- **Context efficiency:** Better (smaller documents)
- **Sync risk:** Same as v1.0 (no new files)
- **Adoption friction:** Minimal (backward compatible)

---

## Appendix: Rejected v2.0 Full Features

### Why No YAML Quick-Resume File
- CLAUDE.md already has "Active Task" section
- Additional file = sync risk
- YAML parsing offers no real advantage over markdown

### Why No Context Forecasting
- Predictions are imprecise
- Reactive thresholds (60/65/70%) work fine
- Adds complexity without proven benefit
- Never hit emergency in real usage (8 sessions)

### Why No Adaptive Loading Strategies
- Claude naturally adapts to context pressure
- Formal strategies add cognitive overhead
- Document structure (critical info first) achieves same goal

### Why No Priority XML Tags
- Document structure handles priority (critical info at top)
- Claude doesn't weight `<priority>` tags specially
- Adds verbosity to documents

### Why No Working Memory File
- Use Claude Code's built-in TodoWrite for within-session tracking
- Handoff notes handle cross-session state
- Another ephemeral file = more overhead

---

## Change 6: Design Management (IEC 62304 Class B)

**Problem:** No structured approach to requirements and design documentation.

**Solution:** Integrated design management with IEC 62304 Class B compliance.

### Document Hierarchy

```
project_root/
├── CLAUDE.md                              # SIZE-CONTROLLED
│
├── docs/
│   ├── architecture/                      # ARCHITECTURE (stable)
│   │   ├── system_architecture.md         # System-level (rarely changes)
│   │   └── [component]_architecture.md    # Component-specific
│   │
│   ├── design/                            # DESIGN (per task)
│   │   └── SDD_TASK-XXX.md               # IEC 62304 Class B SDD
│   │
│   ├── project_tasks/                     # TASK PLANS (immutable)
│   │   └── TASK-XXX-plan.md
│   │
│   └── development/                       # SESSION EXECUTION
│       ├── SESSION_NUMBER.txt
│       ├── implementation_status.md
│       ├── handoff_notes.md
│       └── archive/TASK-XXX/
│
├── src/                                   # Source code
├── tests/                                 # Tests
│
└── temp/                                  # TEMPORARY ARTIFACTS (preserved)
    └── task_XXX/
        └── session_YYY/
```

### Three Architecture Levels

**Level 1: System Architecture** (`docs/architecture/system_architecture.md`)
- High-level system design
- Major components and their relationships
- External interfaces and integrations
- **Changes rarely** - only for major architectural shifts
- One per project

**Level 2: Component Architecture** (`docs/architecture/[component]_architecture.md`)
- Detailed design of specific components
- Internal structure and patterns
- Component-specific decisions
- **Changes occasionally** - when component design evolves
- One per major component

**Level 3: Software Detailed Design** (`docs/design/SDD_TASK-XXX.md`)
- IEC 62304 Class B compliant
- Software units and interfaces
- Algorithms and data structures
- **Evolves during task** - refined as implementation progresses
- One per task

### IEC 62304 Class B Requirements

For Class B software, the SDD must include:

| Requirement | SDD Section | Description |
|-------------|-------------|-------------|
| 5.4.1 | Units | Subdivide into software units |
| 5.4.2 | Interfaces | Document interfaces between units |
| 5.4.3 | Detailed Design | Document detailed design of each unit |

### SDD Template (IEC 62304 Class B)

```markdown
# Software Detailed Design: TASK-XXX - [Component Name]

**Document ID:** SDD-TASK-XXX
**Version:** 1.0
**Created:** YYYY-MM-DD | Session X
**Status:** [Draft | In Review | Approved | Implemented]
**IEC 62304 Class:** B

---

## 1. Introduction

### 1.1 Purpose
[What this software unit/component does]

### 1.2 Scope
[Boundaries of this design]

### 1.3 References
- Task Plan: `docs/project_tasks/TASK-XXX-plan.md`
- System Architecture: `docs/architecture/system_architecture.md`
- Related Components: [list]

### 1.4 Traceability
| Requirement | Source | SDD Section |
|-------------|--------|-------------|
| REQ-001 | [source] | 3.1 |

---

## 2. Architecture Context

### 2.1 Component in System Context
[How this component fits in the overall system]

### 2.2 Dependencies
| Dependency | Type | Purpose |
|------------|------|---------|
| [component] | Internal | [purpose] |
| [library] | External | [purpose] |

---

## 3. Software Units

### 3.1 Unit: [UnitName]

**Purpose:** [What this unit does]
**File:** `src/path/to/file.py`

#### 3.1.1 Interface
```python
def function_name(param1: Type, param2: Type) -> ReturnType:
    """Brief description."""
```

#### 3.1.2 Algorithm
[Algorithm description or pseudocode]

#### 3.1.3 Data Structures
[Key data structures used]

#### 3.1.4 Error Handling
| Error Condition | Response |
|-----------------|----------|
| [condition] | [response] |

---

## 4. Interfaces

### 4.1 External Interfaces
| Interface | Type | Protocol | Data Format |
|-----------|------|----------|-------------|
| [endpoint] | REST | HTTPS | JSON |

### 4.2 Internal Interfaces
| From | To | Purpose |
|------|-----|---------|
| [unit] | [unit] | [purpose] |

---

## 5. Design Decisions

| Decision | Rationale | Session |
|----------|-----------|---------|
| [decision] | [why] | X |

---

## 6. Revision History

| Version | Date | Session | Changes |
|---------|------|---------|---------|
| 1.0 | YYYY-MM-DD | X | Initial |
```

### Design Document Lifecycle

```
Task Start (Session 1)
├── Create docs/project_tasks/TASK-XXX-plan.md (IMMUTABLE)
├── Create docs/design/SDD_TASK-XXX.md (initial structure)
└── Review/update docs/architecture/system_architecture.md if needed

During Task (Sessions 2-N)
├── Update SDD_TASK-XXX.md as design evolves
├── Add units, interfaces, algorithms as implemented
└── Update component architecture if needed

Task Complete
├── SDD_TASK-XXX.md status → "Implemented"
├── SDD remains in docs/design/ (permanent record)
└── Task plan remains in docs/project_tasks/ (permanent)
```

---

## Change 7: Artifact Management

**Problem:** Temporary files created during development scattered across project.

**Solution:** Structured temp folder that preserves artifacts for audit trail.

### Artifact Classification

| Artifact Type | Location | Lifecycle |
|---------------|----------|-----------|
| Source code | `src/` | Permanent |
| Tests | `tests/` | Permanent |
| Design docs (SDD) | `docs/design/` | Permanent |
| Architecture docs | `docs/architecture/` | Permanent |
| Task plans | `docs/project_tasks/` | Permanent |
| Session docs | `docs/development/` → `archive/` | Archived |
| Scratch scripts | `temp/task_XXX/session_YYY/` | **Preserved** |
| Debug outputs | `temp/task_XXX/session_YYY/` | **Preserved** |
| Analysis files | `temp/task_XXX/session_YYY/` | **Preserved** |
| Research notes | `temp/task_XXX/session_YYY/` | **Preserved** |

### Temp Folder Structure

```
temp/
├── task_001/                    # Completed task - KEPT for audit
│   ├── session_001/
│   │   └── initial_analysis.py
│   ├── session_002/
│   │   └── debug_output.log
│   └── session_003/
│       └── performance_test.csv
│
└── task_002/                    # Current task
    └── session_008/
        ├── scratch_script.py
        └── test_data.csv
```

### Artifact Rules

**Rule 1: No Stray Artifacts**
```markdown
Creating temporary files:
- ✅ CORRECT: `temp/task_XXX/session_YYY/debug.py`
- ❌ WRONG: `debug.py` (project root)
- ❌ WRONG: `src/temp_analysis.py` (mixed with source)
```

**Rule 2: End of Session Review**
```markdown
Before ending session:
1. Find any stray artifacts created this session
2. For each: Move to temp/ OR delete if garbage
3. Document in handoff_notes.md what's in temp/
```

**Rule 3: End of Task - PRESERVE**
```markdown
When task completes:
- temp/task_XXX/ REMAINS INTACT
- DO NOT delete temp folder
- Serves as audit trail for IEC 62304
```

### Handoff Notes: Temp Artifacts Section

```markdown
## 📦 Temporary Artifacts

**Location:** `temp/task_XXX/session_YYY/`

| File | Purpose | Status |
|------|---------|--------|
| `debug_queries.sql` | Data investigation queries | Keep |
| `test_output.log` | Debug log showing root cause | Keep |
| `scratch.py` | One-off script, obsolete | Can delete |
```

---

## Change 8: CLAUDE.md Size Control

**Problem:** CLAUDE.md grows indefinitely as tasks complete.

**Solution:** Strict size limits on completed task entries.

### Active Task Section
- Full detail for current active task only
- Quick Resume, Next Goals, Success Criteria
- Maximum: ~50 lines

### Completed Tasks: Maximum 4 Lines Each

```markdown
## ✅ Completed Multi-Session Tasks

### TASK-001: User Authentication
**Completed:** 2025-10-31 | **Sessions:** 8 | **Duration:** ~6 hours
**Reference:** `docs/development/implementation_ended_TASK-001.md`

### TASK-002: Data Pipeline
**Completed:** 2025-11-15 | **Sessions:** 12 | **Duration:** ~9 hours
**Reference:** `docs/development/implementation_ended_TASK-002.md`
```

**DO NOT include after task completion:**
- ❌ Session history details
- ❌ Key decisions list
- ❌ Deliverables enumeration
- ❌ Lessons learned
- ❌ Temp folder contents

### Completed Tasks Limit

When > 10 completed tasks:
```markdown
**Earlier Tasks:** See `docs/development/archive/completed_tasks_index.md`
```

---

## Updated Document Whitelist

```markdown
## 🚫 CRITICAL: Document Creation Rules

**ALLOWED FILES - EXHAUSTIVE WHITELIST:**

**Multi-Session Protocol:**
- `docs/development/SESSION_NUMBER.txt`
- `docs/development/implementation_status.md`
- `docs/development/handoff_notes.md`
- `docs/development/implementation_status_TASK-XXX.md`
- `docs/development/handoff_notes_TASK-XXX.md`
- `docs/development/implementation_ended_TASK-XXX.md`
- `docs/development/session_X_start.md`
- `docs/development/session_X_end.md`
- `docs/development/archive/TASK-XXX/`

**Task Planning:**
- `docs/project_tasks/TASK-XXX-plan.md` (immutable)

**Design Documentation (IEC 62304):**
- `docs/design/SDD_TASK-XXX.md` (per task)

**Architecture Documentation:**
- `docs/architecture/system_architecture.md` (system-level)
- `docs/architecture/[component]_architecture.md` (component-specific)

**Temporary Artifacts:**
- `temp/task_XXX/session_YYY/*` (any temporary files)

**Project Files:**
- `CLAUDE.md` (edit only)
- `.gitignore`
- Source code in `src/`
- Tests in `tests/`

**EXPLICITLY FORBIDDEN:**
- ❌ README.md, CHANGELOG.md, CONTRIBUTING.md
- ❌ SUMMARY.md, WRAP-UP.md, VERIFICATION.md
- ❌ Any .md outside whitelist
- ❌ Any temp files outside `temp/` folder

**ENFORCEMENT:**
Creating ANY file outside whitelist:
1. STOP
2. ASK: "Should I create [filename]? It's not in the SDP whitelist."
3. WAIT for approval
```

---

## Protocol Integration

### Enhanced STEP 2: Check for Design Documents

```markdown
### STEP 2: Check for Active Multi-Session Task

[Existing checks...]

**Check Design Documentation:**
- ls docs/design/SDD_TASK-XXX.md
- ls docs/architecture/system_architecture.md
- Note which design docs exist for STEP 3 loading
```

### Enhanced STEP 3: Load Design Context

```markdown
### STEP 3: Load Context

[Existing: implementation_status.md, handoff_notes.md, git state...]

**Load Design Documentation:**
1. Read SDD for current task (if exists)
2. Read system_architecture.md (if relevant)
3. Read component architecture (if relevant)
```

### Enhanced STEP 4: Update Design & Review Artifacts

```markdown
### STEP 4: Before Ending Session

[Existing updates...]

**Update Design Documentation:**
- If design decisions made → Update SDD_TASK-XXX.md
- If architecture changed → Update relevant architecture doc
- Update revision history in modified docs

**Artifact Review:**
1. Find stray artifacts created this session
2. Move to temp/task_XXX/session_YYY/ or delete
3. Document temp contents in handoff_notes.md
```

### Enhanced STEP 5: Task Completion

```markdown
### STEP 5: Task Completion

[Existing steps...]

**Design Documentation:**
- Update SDD status to "Implemented"
- SDD remains in docs/design/ (permanent)

**Artifact Preservation:**
- temp/task_XXX/ REMAINS (audit trail)
- DO NOT delete temp folder

**CLAUDE.md Size Control:**
- Add completed task entry (4 lines max)
- Remove detailed task info from Active section
```

---

## New Task Checklist

When starting a new task:

```bash
# 1. Create task plan (immutable)
touch docs/project_tasks/TASK-XXX-plan.md

# 2. Create SDD (evolves during task)
touch docs/design/SDD_TASK-XXX.md

# 3. Create implementation status
touch docs/development/implementation_status.md

# 4. Create temp folder for this task
mkdir -p temp/task_XXX/session_001

# 5. Review system architecture (update if needed)
cat docs/architecture/system_architecture.md

# 6. Create component architecture if new component
touch docs/architecture/[component]_architecture.md  # if needed
```

---

**Document Version:** 2.0
**Approved:** 2025-11-25
**Updated:** 2025-11-25
**Changes:**
- IEC 62304 made optional (Class None/A/B/C selection during setup)
- Added simple SDD template for non-regulated projects (SDD_TEMPLATE_SIMPLE.md)
- Lowered context thresholds to 60%/65%/70%
**Template Compatibility:** CLAUDE.md.template v2.0
