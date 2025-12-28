# SDP v2 - Unified Migration Prompt

**Migrate from:** No SDP, v1.0, or v2.0 → **SDP v2**

## Prerequisites

Copy the SDP folder to your target project:

```bash
# From the claude_code_sdp repository
cp -r v2/SDP /path/to/your/project/

# Your project should now have:
# your_project/
# └── SDP/
#     ├── templates/
#     │   ├── CLAUDE.md.template
#     │   ├── TASK_PLAN_TEMPLATE.md
#     │   └── ...
#     ├── prompts/
#     │   └── MIGRATE_TO_SDP.md (this file)
#     └── specification/
#         └── SDP_SPECIFICATION.md
```

Then open Claude Code in your project and paste the prompt below.

---

## Prompt

```
I want to migrate this project to SDP v2 (Software Development Process).

The SDP templates and specification are available in the /SDP folder of this project.

**What I need you to do:**

## PHASE 1: Analysis (DO NOT make changes yet)

1. **Read SDP Specification**
   - Read SDP/specification/SDP_SPECIFICATION.md to understand the framework
   - Read SDP/templates/CLAUDE.md.template for the target structure

2. **Detect Current SDP Version**
   Check for these indicators and report what you find:

   ```bash
   # Check for CLAUDE.md
   cat CLAUDE.md 2>/dev/null | head -50

   # Check for SDP infrastructure
   ls -la docs/development/ 2>/dev/null
   cat docs/development/SESSION_NUMBER.txt 2>/dev/null

   # Check for existing session docs
   ls docs/development/session_*.md 2>/dev/null | wc -l

   # Check for design docs (v2.0+)
   ls docs/design/ 2>/dev/null

   # Check for epic docs
   ls docs/project_tasks/EPIC-*.md 2>/dev/null

   # Check for process memory
   ls docs/development/process_memory.md 2>/dev/null
   ```

   Determine version:
   - **No SDP:** No CLAUDE.md with SDP protocol, no docs/development/
   - **v1.0:** Has CLAUDE.md with protocol, no docs/design/, no whitelist
   - **v2.0:** Has docs/design/, has whitelist, no Epic support, session start not at top
   - **v2.1+:** Session start at top with 🚨, Epic support, process_memory support

3. **Extract ALL Project-Specific Content**

   ⚠️ CRITICAL: Before making ANY changes, extract and list:

   **From existing CLAUDE.md (if exists):**
   - Project name and path
   - IEC 62304 class (if specified)
   - Project-Specific Rules section (entire content)
   - Project-Specific Documentation section:
     - System overview
     - Project structure
     - Essential commands
     - Configuration details
     - Development workflows
     - Troubleshooting guides
     - Quick reference
   - Active Task section (current task details)
   - Completed Tasks section (all entries)
   - Any custom sections not in standard SDP

   **From existing session infrastructure:**
   - Current session number
   - Active task files (implementation_status.md, handoff_notes.md)
   - Completed task files (implementation_ended_*.md)
   - Archived sessions count

   **SHOW ME this extraction and WAIT for confirmation before proceeding.**

4. **ASK about IEC 62304 Classification (if not already set)**

   If not detected in existing CLAUDE.md, ask:
   "Is this a regulated project requiring IEC 62304 compliance?
   - **None** - Not regulated (most projects)
   - **Class A/B/C** - Medical device software"

## PHASE 2: Create/Update Infrastructure

5. **Create Missing Directories**

   Only create what doesn't exist:
   ```
   docs/
   ├── development/
   │   └── archive/
   ├── project_tasks/
   ├── design/          # v2.0+ feature
   └── architecture/
   temp/                 # v2.0+ feature
   ```

6. **Initialize/Preserve Session Counter**
   - If SESSION_NUMBER.txt exists: PRESERVE the current value
   - If missing: Create with value "0"
   - **NEVER reset session numbering**

## PHASE 3: CLAUDE.md Migration (MERGE, not replace)

7. **Create/Update CLAUDE.md**

   Use SDP/templates/CLAUDE.md.template as the TARGET structure.

   **Required elements (add if missing):**
   - 🚨 Session start section AT THE TOP of document
   - Document whitelist with Epic and process_memory entries
   - 6-layer document hierarchy (Layer 0 = Epic)
   - Detailed context thresholds (60%/65%/70% with specific actions)
   - Verification gate (Step 0 and Step 8 at session end)
   - process_memory.md reference at task completion

   **PRESERVE from existing CLAUDE.md:**
   - ALL project-specific rules → merge into Project-Specific Rules section
   - ALL project documentation → keep in Project-Specific Documentation section
   - ALL completed tasks → convert to 4-line format if needed
   - Active task details → update format but keep content
   - Custom sections → preserve as-is

   **Update these items:**
   - SDP Version to 2
   - Last Updated date
   - Document hierarchy (ensure 6 layers)

8. **Verify CLAUDE.md Merge**

   After merge, verify:
   - [ ] Session start is at TOP (🚨 visible first)
   - [ ] All project-specific rules preserved
   - [ ] All project documentation preserved
   - [ ] All completed tasks preserved (reformatted if needed)
   - [ ] Active task preserved (if exists)
   - [ ] Whitelist includes process_memory.md and EPIC-XXX entries
   - [ ] Version shows 2

## PHASE 4: Supporting Documents

9. **Create System Architecture (if missing)**
   - Check if docs/architecture/system_architecture.md exists
   - If missing: Create using SDP/templates/SYSTEM_ARCHITECTURE_TEMPLATE.md
   - Document existing architecture from code analysis

10. **Handle Active Task (if exists)**
    - If implementation_status.md exists with active task:
      - Create docs/design/SDD_TASK-XXX.md if missing
      - Create temp/task_XXX/session_YYY/ if missing
      - Update task plan format if needed

11. **Setup Process Memory (with cross-project learnings)**
    - Copy `SDP/PROCESS_MEMORY.md` to `docs/development/process_memory.md`
    - If project already has process_memory.md: MERGE (keep existing entries, add new cross-project learnings)
    - This provides pre-populated lessons from other SDP projects

## PHASE 5: Verification

12. **Verify Complete Migration**

    Run these checks and show results:
    ```bash
    # Structure verification
    ls -la docs/development/
    ls -la docs/project_tasks/
    ls -la docs/design/
    ls -la docs/architecture/
    ls -la temp/ 2>/dev/null

    # Session counter preserved
    cat docs/development/SESSION_NUMBER.txt

    # CLAUDE.md checks
    head -20 CLAUDE.md  # Should show 🚨 session start
    grep "SDP Version" CLAUDE.md
    grep "process_memory" CLAUDE.md
    grep "EPIC-XXX" CLAUDE.md

    # Process memory exists with cross-project learnings
    cat docs/development/process_memory.md | head -10
    ```

    **Show before/after comparison:**
    - List all preserved project-specific content
    - List all preserved completed tasks
    - Confirm session number unchanged

    **ASK me to verify nothing was lost.**

13. **Explain What Changed**
    - Session start now at TOP of CLAUDE.md
    - Epic layer available for multi-task projects
    - Process memory for SDP lessons learned
    - Verification gates at session end
    - Enhanced context threshold actions

**Important Notes:**
- **This is a MERGE operation** - add new features, preserve existing content
- **NEVER delete project-specific content** - only reformat or relocate
- **NEVER reset session numbering**
- **Preserve all existing session history and archives**
- **ASK before making any destructive changes**

Please start with Phase 1 analysis, show me the extraction, and wait for confirmation before making changes.
```

---

## Migration Matrix

| From | Missing | Add | Update |
|------|---------|-----|--------|
| **No SDP** | Everything | All dirs, CLAUDE.md, session counter | N/A |
| **v1.0** | docs/design/, temp/, whitelist | Design/temp dirs, whitelist, v2 features | CLAUDE.md structure |
| **v2.0** | 🚨 at top, Epic, process_memory, verification gates | v2 sections to CLAUDE.md | Whitelist, thresholds |

## What Each Version Has

| Feature | No SDP | v1.0 | v2.0 | v2 (current) |
|---------|--------|------|------|--------------|
| CLAUDE.md | ❌ | ✅ | ✅ | ✅ |
| Session protocol | ❌ | ✅ | ✅ | ✅ (at top) |
| docs/development/ | ❌ | ✅ | ✅ | ✅ |
| docs/design/ | ❌ | ❌ | ✅ | ✅ |
| temp/ folder | ❌ | ❌ | ✅ | ✅ |
| Document whitelist | ❌ | ❌ | ✅ | ✅ (extended) |
| Session start at top | ❌ | ❌ | ❌ | ✅ 🚨 |
| Epic layer | ❌ | ❌ | ❌ | ✅ |
| Process memory | ❌ | ❌ | ❌ | ✅ |
| Verification gates | ❌ | ❌ | ❌ | ✅ |
| Detailed thresholds | ❌ | ❌ | ❌ | ✅ |

## Post-Migration Checklist

**Structure:**
- [ ] `docs/development/` exists with SESSION_NUMBER.txt
- [ ] `docs/development/process_memory.md` exists with cross-project learnings
- [ ] `docs/project_tasks/` exists
- [ ] `docs/design/` exists
- [ ] `docs/architecture/` exists
- [ ] `temp/` exists

**CLAUDE.md Features:**
- [ ] 🚨 Session start section is FIRST in document
- [ ] Whitelist includes `process_memory.md`
- [ ] Whitelist includes `EPIC-XXX-[name].md`
- [ ] 6-layer document hierarchy documented
- [ ] Detailed threshold actions (60%/65%/70%)
- [ ] Step 0 (unauthorized file check) in session end
- [ ] Step 8 (verification checklist) in session end
- [ ] SDP Version shows 2

**Content Preservation (CRITICAL):**
- [ ] ALL project-specific rules preserved
- [ ] ALL project-specific documentation preserved
- [ ] ALL completed tasks preserved
- [ ] Active task preserved (if existed)
- [ ] Session number NOT reset
- [ ] Archives intact

---

## Troubleshooting

**Q: What if I have a task in progress during migration?**
A: The migration preserves your active task. It adds the SDD if missing and creates the temp folder structure.

**Q: My CLAUDE.md is very customized. Will I lose content?**
A: No. Phase 1 extracts ALL content first. Phase 3 merges it into the new structure. You verify before finalizing.

**Q: Do I need to create Epics immediately?**
A: No. Epics are optional. The migration just enables support. Use them when you have 5+ coordinated tasks.

**Q: What about my existing session documents?**
A: All preserved. Session numbering continues. Archives remain intact.

---

**SDP Version:** 2.2
**Prompt Version:** 1.2
