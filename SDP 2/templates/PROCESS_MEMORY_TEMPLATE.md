# Process Memory

Lessons learned from SDP execution errors. **Review at session start and before task completion.**

---

## How to Use This File

1. **Read before task completion** - Avoid repeating documented pitfalls
2. **Add new learnings** - When you encounter a process error, document it here
3. **Keep it concise** - Each entry should be actionable, not verbose
4. **Include session reference** - Note when the lesson was learned

---

## Entry Format

```markdown
## N. Short Title

**When:** Scenario where this applies
**Pitfall:** What went wrong
**Rule:** What to do instead
**Verify:** Command to check (if applicable)

*Session X (YYYY-MM-DD)*
```

---

## Entries

<!-- Add new entries below this line -->

## 1. [Example] Archive Session Docs: Timing + Pre-Commit Gate

**When:** Completing a task

**Pitfall:** Archiving too early (before session_end.md) → current session left out

**Rule:**
1. Create `session_X_end.md` FIRST
2. Archive: `mkdir -p docs/development/archive/TASK-XXX && mv docs/development/session_*.md docs/development/archive/TASK-XXX/`
3. **BEFORE final commit**, run verification:

```bash
# This must pass before you can commit:
ls docs/development/session_*.md 2>/dev/null && echo "🛑 STOP - Archive first!" || echo "✅ Proceed"
```

*Session 1 (example)*

---

## 2. [Example] Create session_start.md BEFORE Implementation

**When:** Starting any session after reading context

**Pitfall:** Creating both session_start.md and session_end.md at session end → both become retrospective summaries

**Rule:** Create `session_X_start.md` IMMEDIATELY after incrementing session number - BEFORE any code changes.

**Self-check:** "Have I written any code yet?" → If YES, session_start.md is overdue.

*Session 1 (example)*

---

## 3. [Example] Never Report Test Results Without Execution

**When:** After making code changes that affect tests

**Pitfall:** Reporting "tests are now passing" based on reasoning about the fix rather than actually running the tests.

**Rule:** When reporting ANY test results, you MUST:
1. Execute the test command
2. Wait for completion
3. Quote exact results from output
4. Show evidence in response

**Incorrect statements:**
- ❌ "Tests should pass now"
- ❌ "The fix resolves the test failure"
- ❌ "Tests are passing" (without evidence)

**Self-check:** "Did I actually run the test command and see the output?" - If NO, don't report results.

*Session 1 (example)*

---

## 4. [Example] Task Closure Requires All Boxes Checked

**When:** About to close/complete a task

**Pitfall:** Closing tasks with "deferred" items or unchecked boxes.

**Rule:**
```bash
grep -E "^\- \[ \]" docs/development/implementation_status.md
# If ANY output, task is NOT complete
```

**Self-check:** "Are there ANY unchecked boxes?" - If YES, task cannot close.

*Session 1 (example)*

---

<!--
Add new learnings above this line.

Guidelines:
- Keep entries short and actionable
- Include verification commands where possible
- Reference the session where the lesson was learned
- Delete example entries once you have real ones
-->
