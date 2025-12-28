# SDP v2 - New Project Setup Prompt

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
#     │   ├── EPIC_TEMPLATE.md
#     │   ├── PROCESS_MEMORY_TEMPLATE.md
#     │   ├── SDD_TEMPLATE.md
#     │   ├── SDD_TEMPLATE_SIMPLE.md
#     │   └── SYSTEM_ARCHITECTURE_TEMPLATE.md
#     ├── prompts/
#     │   ├── SETUP_NEW_PROJECT.md (this file)
#     │   └── MIGRATE_TO_SDP.md
#     └── specification/
#         └── SDP_SPECIFICATION.md
```

Then open Claude Code in your project and paste the prompt below.

---

## Prompt

```
I want to set up SDP v2 (Software Development Process) for this project. This is a NEW project with no existing SDP infrastructure.

The SDP templates and specification are available in the /SDP folder of this project.

**What I need you to do:**

1. **Read the SDP specification and templates**
   - Read SDP/specification/SDP_SPECIFICATION.md to understand the framework
   - Read SDP/templates/CLAUDE.md.template for the CLAUDE.md structure
   - Read SDP/templates/SYSTEM_ARCHITECTURE_TEMPLATE.md for architecture doc structure

2. **ASK me about IEC 62304 Classification**

   Before proceeding, ask me:
   "Is this a regulated project requiring IEC 62304 compliance?
   - **None** - Not regulated (most projects)
   - **Class A** - No injury possible
   - **Class B** - Non-serious injury possible
   - **Class C** - Death or serious injury possible

   This determines the SDD template format. Default is 'None' for non-regulated projects."

   Wait for my response before continuing.

3. **Analyze this project**
   - Determine the project name from the directory or existing files
   - Determine the absolute path to this project
   - Understand the project's purpose from existing code/files (if any)
   - Identify key technologies, languages, frameworks in use

4. **Create SDP Directory Structure**
   ```
   docs/
   ├── development/
   │   └── archive/
   ├── project_tasks/
   ├── design/
   └── architecture/
   temp/
   ```

5. **Initialize Session Counter and Process Memory**
   - Create `docs/development/SESSION_NUMBER.txt` with value "0"
   - Copy `SDP/PROCESS_MEMORY.md` to `docs/development/process_memory.md`
   - This provides pre-populated cross-project learnings

6. **Create CLAUDE.md**
   - Use SDP/templates/CLAUDE.md.template as the source
   - Replace [PROJECT_NAME] with the detected project name
   - Replace [PROJECT_ROOT_PATH] with the detected project path
   - Replace [DATE] with today's date
   - **Set IEC 62304 Class to the value I specified** (None, A, B, or C)
   - Fill in the Project-Specific Documentation section based on project analysis
   - Customize the Project-Specific Rules section (use examples as guide, then delete examples)
   - Remove template comments and placeholder text

7. **Create System Architecture Document**
   - Create `docs/architecture/system_architecture.md`
   - Use SDP/templates/SYSTEM_ARCHITECTURE_TEMPLATE.md as starting point
   - Fill in what you can determine from the existing project
   - Mark sections as [TO BE DEFINED] where information is not yet available

8. **Note which templates to use**
   Based on IEC 62304 class:
   - **None:** Use SDP/templates/SDD_TEMPLATE_SIMPLE.md for new tasks
   - **A/B/C:** Use SDP/templates/SDD_TEMPLATE.md for new tasks

   For all projects:
   - Use SDP/templates/TASK_PLAN_TEMPLATE.md for task plans
   - Use SDP/templates/EPIC_TEMPLATE.md for epics (optional, for 5+ task projects)
   - Use SDP/templates/PROCESS_MEMORY_TEMPLATE.md when needed

9. **Verify Setup**
   - Confirm all directories exist
   - Confirm SESSION_NUMBER.txt exists with "0"
   - Confirm CLAUDE.md is properly configured with correct IEC 62304 class
   - Show me the Active Task section
   - Verify session start section is at the TOP of CLAUDE.md

10. **Explain Next Steps**
    - How to start my first task (TASK-001)
    - What documents to create for the first task
    - Which SDD template will be used based on IEC 62304 class
    - How the session protocol works
    - When to use Epic documents (5+ task projects)

**Important Notes:**
- Session start protocol is at the TOP of CLAUDE.md (look for 🚨)
- All temporary artifacts go in temp/task_XXX/session_YYY/
- CLAUDE.md size must be controlled (4 lines max per completed task)
- No unauthorized file creation outside the whitelist
- Context thresholds are 60%/65%/70% (WARNING/CRITICAL/EMERGENCY)
- Process memory (docs/development/process_memory.md) ships with cross-project learnings
- ASK me for any information you cannot determine from the project

Please proceed with reading the SDP materials, then ASK about IEC 62304 classification, then continue with setup.
```

---

## What This Prompt Does

1. **Reads SDP specification and templates** from the local /SDP folder
2. **Asks about IEC 62304 classification** to determine SDD format
3. **Analyzes the current project** to auto-detect name, path, technologies
4. **Creates complete directory structure** for SDP
5. **Initializes session tracking** with SESSION_NUMBER.txt and pre-populated process memory
6. **Sets up CLAUDE.md** with all features:
   - Session start at document TOP
   - 6-layer document hierarchy (including Epic layer)
   - Process memory support
   - Verification gates
7. **Creates initial system architecture** document
8. **Verifies the setup** is complete and correct
9. **Explains how to start** working with SDP

## IEC 62304 Classification Guide

| Class | Description | SDD Template |
|-------|-------------|--------------|
| **None** | Not a medical device / not regulated | Simple (SDD_TEMPLATE_SIMPLE.md) |
| **A** | No injury or damage to health possible | Full IEC 62304 (SDD_TEMPLATE.md) |
| **B** | Non-serious injury possible | Full IEC 62304 (SDD_TEMPLATE.md) |
| **C** | Death or serious injury possible | Full IEC 62304 (SDD_TEMPLATE.md) |

**Most projects should use "None"** - only medical device software requires IEC 62304 compliance.

## After Setup

Once setup is complete, start your first task:

```
Let's start TASK-001: [Task Name]

Please follow the New Task Checklist in CLAUDE.md to set up all required documents.
```

---

**SDP Version:** 2.2
**Prompt Version:** 1.2
