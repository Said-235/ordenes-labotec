# Patterns

Deep dives into **how** to work in a specific area of the codebase — the workflow, the
files involved, the conventions, and the pitfalls. Patterns answer "I'm about to touch
feature X, what do I need to know?" (ADRs answer "why did we choose X over Y?").

## Conventions

- One file per area: `<area>.md` (e.g. `incidents.md`, `auth.md`, `payments.md`).
- Cover: the user-facing flow, the files/modules involved, the data path, and the
  non-obvious pitfalls (link each pitfall to a `constraints.md` entry if it bit us).
- Add a pattern when a **second** feature copies the same shape, or when a flow is
  intricate enough that re-deriving it wastes a session.
- Link new patterns from [`ARCHITECTURE.md`](../../ARCHITECTURE.md) and, if it's core
  vocabulary, add a one-line pointer in the always-on architecture rule.

## Index

- [verify-then-converge-core.md](verify-then-converge-core.md) — the org's AI-review-loop
  doctrine (kit-managed by `ai-workflow-scaffold`; do not hand-edit — upgrades overwrite it).
- [verify-then-converge-playbook.md](verify-then-converge-playbook.md) — THIS repo's
  review-loop specifics: native heuristics, stack taxonomy, reviewer policy, incidents
  (repo-owned; grow it from real loop runs).

No feature pattern docs yet (fill-pass: do not author them at install). Candidates: `useOrdenes` store, folio + `ultimo_folio`, snake/camel in `storage.js`.
