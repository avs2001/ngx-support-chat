# Process Memory

Lessons learned from SDP execution errors. **Review at session start and before task completion.**

---

## 1. Archive Session Docs: Timing Matters

**When:** Completing a task

**Two failure modes:**
1. **Timing:** Archiving too early (before session_end.md) - current session left out
2. **Skipping:** Treating archiving as optional - never done at all

**Rule (3 steps in order):**
1. Create `session_X_end.md` FIRST
2. Archive: `mkdir -p docs/development/archive/TASK-XXX && mv docs/development/session_*.md docs/development/archive/TASK-XXX/`
3. **BEFORE final commit**, run verification:

```bash
ls docs/development/session_*.md 2>/dev/null && echo "STOP - Archive first!" || echo "Proceed"
```

**Mental checkpoint:** "Am I about to `git commit` for task completion?" - Verification must pass first.

---

## 2. Create session_start.md BEFORE Implementation

**When:** Starting any session after reading context

**Pitfall:** Creating both session_start.md and session_end.md at session end - both become retrospective summaries, losing their distinct purposes.

**Rule:** Create `session_X_start.md` IMMEDIATELY after incrementing session number - BEFORE any code changes.

**Self-check:** "Have I written any code yet?" - If YES, session_start.md is overdue.

---

## 3. Never Report Test Results Without Execution

**When:** After making code changes that affect tests

**Pitfall:** Reporting "tests are now passing" based on reasoning about the fix rather than actually running the tests. Claude has a tendency to assume test outcomes instead of verifying them.

**Rule:** When reporting ANY test results, you MUST:
1. **Execute** the test command (pytest, jest, go test, cargo test, etc.)
2. **Wait** for the command to complete
3. **Quote** exact results from the output (e.g., "42 passed, 1 failed")
4. **Show** evidence (include relevant output in your response)

**Incorrect statements to avoid:**
- ❌ "Tests should pass now"
- ❌ "The fix resolves the test failure"
- ❌ "Tests are passing" (without evidence)

**Self-check:** "Did I actually run the test command and see the output?" - If NO, don't report results.

---

## 4. Task Closure Requires All Boxes Checked

**When:** About to close/complete a task

**Pitfall:** Closing tasks with "deferred" items or unchecked boxes, claiming 100% complete when success criteria are not met.

**Rule:**
1. Run verification BEFORE task completion:
   ```bash
   grep -E "^\- \[ \]" docs/development/implementation_status.md
   # If ANY output, task is NOT complete
   ```
2. If ANY checkbox is unchecked `[ ]`, the task cannot close
3. "Deferred" is not "done" - create a follow-up task if deferring

**Self-check:** "Are there ANY unchecked boxes or 'deferred' items?" - If YES, task cannot close.

---

<!--
Add new entries above this line.

Format:
## N. Short Title

**When:** Scenario where this applies
**Pitfall:** What went wrong
**Rule:** What to do instead
**Verify:** Command to check (if applicable)
-->
