# Project Context

> Read by OpenSpec when generating change artifacts. Keep it short and link to the
> canonical docs instead of duplicating them. Source of truth for architecture is
> [`ARCHITECTURE.md`](../ARCHITECTURE.md); for invariants, [`AGENTS.md`](../AGENTS.md)
> and [`.cursor/rules/ordenes-labotec-architecture.mdc`](../.cursor/rules/ordenes-labotec-architecture.mdc).

## Purpose

SPA para crear, firmar, listar y verificar órdenes de servicio LABOTEC. Flujos que pesan más que velocidad: persistir la orden (folio + `ultimo_folio` + firmas) y la página pública `/verificar/:folio`. Quién la opera en campo no está documentado.

> **Stub — team conversation needed.** Alcance de producto y compliance.

## Tech Stack

- **Platform / language**: Vite 5 + React 18 SPA · JavaScript/JSX.
- **Data**: Supabase JS (`ordenes`, `config`). Mutaciones en `storage.js`. → [ADR-0001](../.context/decisions/0001-supabase-persistence.md)
- **State / UI / nav**: `useOrdenes` + `pantalla`; `/verificar/:folio` en `main.jsx`.
- **Secrets / config**: `.env` en la raíz (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`). Nunca commitear. Nunca `service_role`.

## Project Conventions

- Lógica de órdenes en `useOrdenes` + `storage.js`; no inserts desde pages.
- `.env` en la raíz; no i18n; `paraDB` no manda `fecha_iso`.
- **Commits**: asuntos cortos en español (el historial actual). Never bump versions or cut a release proactively.

## Constraints & Domain Notes

- Full forbidden-pattern list: [`.context/constraints.md`](../.context/constraints.md). Durable decisions: [`.context/decisions/`](../.context/decisions/).
- Verificación pública expone folio, tipo, fecha, responsable, razón social, equipo, serie — sin login. Auth/RLS: **Stub — team conversation needed.**

## Key Commands

```bash
npm install
npm run dev
npm run build
# no lint / no test runner
```

## OpenSpec Workflow

Spec-driven development runs on the OpenSpec CLI (`core` profile, `spec-driven`
schema). Author changes with `/opsx:propose`, implement with `/opsx:apply`, and
finish with `/opsx:archive`. Full playbook (when to use it, conventions, how it
relates to `.context/`): [`.context/agents/openspec-workflow.md`](../.context/agents/openspec-workflow.md).
