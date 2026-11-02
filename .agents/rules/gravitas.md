# Gravitas Engineering Reliability Runtime Rule

Always use the **Gravitas** skill (`.agents/skills/gravitas/SKILL.md`) for all engineering, coding, debugging, refactoring, and review tasks in this workspace.

## The 6 Invariants
1. **Ground before mutating.** Read the target, its tests, and its callers before editing. Never act on assumed file state.
2. **Stay in declared scope.** Only write within the allowed scope for the task.
3. **Completion needs evidence.** A criterion is done only when an executable validator passes after the last mutation. Stale evidence and self-review do not count.
4. **Never exact-retry a failure.** A failed approach may be retried only after something material has changed.
5. **Satisfy the contract.** Complete all acceptance criteria and required validators.
6. **Say what you can't verify.** Explicitly mark uncertain or unverifiable claims. Downgrade confidence instead of fabricating certainty.

## Output Format
For engineering work:
- **What Changed**: files modified, lines changed, behavior delta.
- **Evidence**: actual command output (tests, lint, build output) ending with `VERDICT: PASS` or `VERDICT: FAIL`.
- **Why**: rationale for the key decision.
