# Agent topic index

The map of "where do I look for X" for agents working in LABOTEC Órdenes de Servicio. Keep entries
short and link out — this is an index, not a manual.

## Build / run / verify

See [core-workflow.mdc](../../.cursor/rules/core-workflow.mdc): `npm install`, `npm run dev`, `npm run build`. No lint/test scripts.

## Project layout

Map completo: [ARCHITECTURE.md](../../ARCHITECTURE.md). Código de la app en `labotec/src/` (`pages/`, `hooks/`, `services/`, `components/`).

## Data layer

Un cliente: `labotec/src/services/supabase.js`. Mutaciones: `storage.js`. No hay stack-pack `data-fetching.mdc`. ADR: [0001-supabase-persistence.md](../decisions/0001-supabase-persistence.md).

## Conventions & gotchas

[constraints.md](../constraints.md), [AGENTS.md](../../AGENTS.md), [ordenes-labotec-architecture.mdc](../../.cursor/rules/ordenes-labotec-architecture.mdc). No hay reglas de localization ni release-version-bump (stack pack `none`).

## Testing

**No hay test runner.** Verificar con `npm run build` y el flujo en el browser.

## Spec-driven development (OpenSpec)

Non-trivial changes are proposed as specs first. Author with `/opsx:propose`, implement with `/opsx:apply`, archive with `/opsx:archive`. Full playbook: [`openspec-workflow.md`](openspec-workflow.md).

