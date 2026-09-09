# OpenSpec Workflow (spec-driven development)

LABOTEC Órdenes de Servicio uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven
development: non-trivial changes are proposed and agreed **as specs** before code
is written. This is the company standard for opening repos to mixed dev /
non-dev / PM contributors. This doc is the project playbook; it complements — it
does not replace — [`context-maintenance.mdc`](../../.cursor/rules/context-maintenance.mdc).

## TL;DR

```bash
/opsx:propose <kebab-name or description>   # create the change + author artifacts
/opsx:apply  <change-name>                  # implement tasks against the artifacts
/opsx:archive <change-name>                 # fold delta specs into openspec/specs/, move to archive
```

CLI: OpenSpec `1.4.x`, profile `core`, schema `spec-driven`. Slash commands live
in [`.cursor/commands/opsx-*.md`](../../.cursor/commands/) (Cursor) and
[`.claude/commands/opsx/`](../../.claude/commands/) + [`.claude/skills/`](../../.claude/skills/) (Claude Code).

## When to use it

| Situation | Use OpenSpec? |
|---|---|
| New user-facing flow, new screen/navigation contract, new data surface | **Yes** — propose first |
| Reworking an existing flow / changing behavior of a capability | **Yes** |
| Cross-cutting or hard-to-reverse decision | **Yes** (and likely an ADR too) |
| One-line bugfix that restores documented behavior, copy tweak, lint fix | No — just do it |
| Reviewer-comment fixes (CodeRabbit) on an open PR | No — see [`code-review.mdc`](../../.cursor/rules/code-review.mdc) |

If unsure, prefer a proposal: the cost is a few markdown files, the benefit is an
agreed contract a non-author can implement.

## Artifact model (`spec-driven` schema)

A change lives in `openspec/changes/<change-name>/` and is built in dependency
order. Drive it with the CLI rather than assuming paths:

1. `openspec new change "<name>"` — scaffolds the change + `.openspec.yaml`.
2. `openspec status --change "<name>" --json` — gives `artifacts`, `applyRequires`, and resolved paths.
3. For each ready artifact: `openspec instructions <artifact> --change "<name>" --json` — returns the `template`, `rules`, `context`, and `resolvedOutputPath`. Write the file there.
4. `openspec validate "<name>" --strict` — must pass before `apply`.

Build order and meaning:

- **proposal.md** — *Why* + *What Changes* + *Capabilities* (new vs modified) + *Impact*.
- **specs/&lt;capability&gt;/spec.md** — the behavior contract. Requirements use `#### Scenario:` blocks. A **new** capability is a full spec; a **modified** capability is a delta (`## ADDED` / `## MODIFIED` / `## REMOVED Requirements`).
- **design.md** — *How*: technical decisions, data shape, trade-offs, alternatives considered.
- **tasks.md** — ordered, checkbox implementation steps (`- [ ]` → `- [x]` during apply).

`context` and `rules` from `openspec instructions` are constraints **for the
author** — never copy those blocks into the artifact files.

## Lifecycle

```text
propose ──► (review) ──► apply ──► (verify on device) ──► archive
   │                        │                                │
 specs as the contract   code + check off tasks      specs/ becomes source of truth
```

- **Capabilities** = stable spec names under `openspec/specs/` (e.g. `incident-reporting`). They accrete across changes; archiving a change syncs its delta into the capability spec.
- Keep changes **scoped**: one coherent capability change per proposal.

## Relationship to `.context/` and the rules

- `openspec/specs/` is the **behavioral contract** (what the app must do).
  `.context/` is **durable engineering memory** (why/how/history). They coexist:
  a durable decision discovered while applying a change still belongs in
  [`.context/decisions/`](../decisions/); a recurring pitfall still belongs in
  [`.context/constraints.md`](../constraints.md); a feature's working notes still
  belong in [`.context/patterns/`](../patterns/).
- The end-of-turn `## Context-Update Assessment` gate in
  [`context-maintenance.mdc`](../../.cursor/rules/context-maintenance.mdc) **still
  applies** to any session that touches `src/`/config — including `/opsx:apply`.
- Don't restate spec content inside `.cursor/rules/*`; link to the capability spec.

## Conventions

- Change names: kebab-case, action-first (`reimplement-incident-creation`, `add-group-invites`).
- Project context for proposals is [`openspec/project.md`](../../openspec/project.md) — keep it current when conventions change.
- Validate with `--strict` before apply and before archive; never archive with unchecked tasks unless the user confirms.
