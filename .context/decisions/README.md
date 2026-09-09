# Decisions (ADRs)

Architecture Decision Records — the **why** behind choices that are costly to reverse and
that a future agent might otherwise re-litigate (client topology, state model, env model,
major upgrades, build/release strategy).

## Conventions

- One file per decision: `NNNN-<slug>.md`, zero-padded, **never renumbered**.
- Start from [`0000-template.md`](0000-template.md).
- To reverse a decision, write a **new** ADR that links back and flip the old one's
  `Status` to `Superseded by NNNN`. To evolve one without reversing it, add a dated
  `## Amendment` note in place.
- Index every ADR in the table below.

## When to write one

The session chose between viable alternatives, the choice is expensive to undo, and the
reasoning would otherwise be lost. If it's just "how to work in area X," that's a
[pattern](../patterns/), not an ADR.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-supabase-persistence.md) | Supabase as the source of truth for órdenes | Accepted |
| [0002](0002-folio-atomico-y-cola-offline.md) | Folio atómico en servidor y cola offline | Accepted |
