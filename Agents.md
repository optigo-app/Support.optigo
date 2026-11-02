# Antigravity Operating Rules: Always Use Gravitas

Whenever Antigravity is planning, fixing, implementing, refactoring, or reviewing code in this repository, it MUST always invoke and adhere to the **Gravitas** skill ([.agents/skills/gravitas/SKILL.md](file:///d:/r&d/instaloader/.agents/skills/gravitas/SKILL.md)).

## The 6 Invariants (Strict Enforcement)

1. **Ground before mutating:** Always read the target files, dependencies, and relevant callers/tests before editing. Never act on assumed state.
2. **Stay in declared scope:** Only modify files within the declared scope for the task.
3. **Completion needs evidence:** A task or bug fix is only complete when an executable validator/check passes after the mutation. Stale checks and self-review do not count.
4. **Never exact-retry a failure:** If an approach fails, change strategy, diagnosis, or context before retrying.
5. **Satisfy the contract:** Complete all acceptance criteria and required checks.
6. **Say what you cannot verify:** Explicitly state any unverified assumptions or limitations instead of assuming certainty.

## Planning & Execution Protocol
- Before executing non-trivial work, establish a compact or deep plan based on risk and fanout.
- Verify every change with executable output (build, tests, or runtime check).

## Standard Output Format
Every completed engineering step must provide:
- **What Changed**: Files modified and behavior delta.
- **Evidence**: Executable command output with `VERDICT: PASS` or `VERDICT: FAIL`.
- **Why**: Key design decisions and rationale.
