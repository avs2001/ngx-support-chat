# SDP v2.1 Specification

**Version:** 2.1
**Status:** APPROVED FOR IMPLEMENTATION
**Date:** 2025-12-01
**Supersedes:** SDP v2.0

---

## Executive Summary

SDP v2.1 is a refinement of v2.0 incorporating battle-tested improvements from real-world deployment. These changes originate from the cfo_agent team's experience across 27 tasks and 53 sessions.

**Philosophy:** Improvements validated by intensive real-world usage, not theoretical optimization.

### Key Changes from v2.0

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

## Changes from v2.0

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

| Feature | v2.0 | v2.1 |
|---------|------|------|
| Session start location | Middle of CLAUDE.md | Top of document |
| Epic layer | None | Optional Layer 0 |
| Process memory | None | process_memory.md |
| Context threshold detail | Vague ("save") | Specific commands |
| Verification gate | None | Steps 0 and 8 |
| Task plan epic fields | None | Epic/Phase/Dependencies |
| Project rules examples | None | 4 common patterns |
| Whitelist items | ~12 | ~14 |
| Core files | 3 | 3 (unchanged) |
| Backward compatible | Yes (from v1.0) | Yes (from v2.0) |

---

## Validation

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

v2.1 introduces/updates the following templates:

| Template | Status | Description |
|----------|--------|-------------|
| `CLAUDE.md.template.v2.1` | NEW | Full CLAUDE.md template |
| `TASK_PLAN_TEMPLATE.v2.1.md` | NEW | Task plan with epic fields |
| `EPIC_TEMPLATE.md` | NEW | Epic roadmap template |
| `PROCESS_MEMORY_TEMPLATE.md` | NEW | Process memory template |

Existing v2.0 templates remain valid for projects not migrating.

---

**Document Version:** 2.1
**Approved:** 2025-12-01
**Template Compatibility:** CLAUDE.md.template.v2.1
