# LABOTEC Órdenes de Servicio

Sistema de Órdenes de Servicio — LABOTEC Engineering Services.

SPA (Vite + React) en el workspace `labotec`. Persistencia en Supabase. Deploy: [ordenes-servicio-labotec.netlify.app](https://ordenes-servicio-labotec.netlify.app).

```bash
npm install
npm run dev
```

Variables en `.env` en la **raíz** (no en `labotec/`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`.

El folio oficial lo asigna Supabase. Hay que ejecutar una vez [`supabase/reservar_y_insertar_orden.sql`](supabase/reservar_y_insertar_orden.sql) en el SQL Editor. Sin red, la app (PWA) guarda la orden como pendiente y la sube al recuperar conexión.

## Documentation

This repo is **AI-first**: the docs are written so Cursor, Claude Code, and Codex can
navigate the codebase and contribute with minimal back-and-forth.

- **[`ARCHITECTURE.md`](ARCHITECTURE.md)** — the canonical system map. Start here.
- **[`AGENTS.md`](AGENTS.md)** — hard constraints for any contributor (human or agent).
- **[`.context/`](.context/)** — engineering memory: vision, constraints, decisions (ADRs), patterns, history.
- **`.cursor/rules/*.mdc`** — always-on + scoped guidance (Cursor native; mirrored for Claude Code via [`CLAUDE.md`](CLAUDE.md)).
- **`openspec/`** — spec-driven change workflow (propose → apply → archive). See [`.context/agents/openspec-workflow.md`](.context/agents/openspec-workflow.md).

When you finish substantial work, emit a `## Context-Update Assessment` (see
[`.cursor/rules/context-maintenance.mdc`](.cursor/rules/context-maintenance.mdc)); the assessment — approved once —
determines which docs get updated. Never update the canonical hubs silently.
