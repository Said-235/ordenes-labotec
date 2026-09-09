# LABOTEC Órdenes de Servicio — Agent guide

LABOTEC Órdenes de Servicio is Sistema de Órdenes de Servicio — LABOTEC Engineering Services.

**Start here:** [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full system overview, file map, and documentation navigation.

## Stack (read once)

| Area | Fact |
| --- | --- |
| Platform | Vite 5 + React 18 SPA, npm workspaces (`labotec`). Not Nx / RN. |
| Languages | JavaScript + JSX. No TypeScript. |
| Runtime / package manager | Node `>=20`, **npm** (lockfile en la raíz). |
| Build / run | `npm install` / `npm run dev` / `npm run build` desde la raíz. Publish `labotec/dist`. |
| Data | Supabase JS: `ordenes` + `config`. Cliente en `labotec/src/services/supabase.js`. |
| UI / forms / nav | `useOrdenes` + `switch` de pantalla. `/verificar/:folio` en `main.jsx`. Sin React Router. |
| i18n | No existe. Copy en español en los componentes. |
| Secrets | `.env` en la raíz: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` (anon). Nunca `service_role`. |

## Hard constraints

Violations are bugs.

1. **`createClient` solo en** [`labotec/src/services/supabase.js`](labotec/src/services/supabase.js). Altas de órdenes vía [`storage.js`](labotec/src/services/storage.js) → RPC `reservar_y_insertar_orden`. No calcular folio en el cliente. → [ADR-0001](.context/decisions/0001-supabase-persistence.md), [ADR-0002](.context/decisions/0002-folio-atomico-y-cola-offline.md)
2. **`.env` va en la raíz del repo**, no en `labotec/`. Vite lee `envDir` del padre. No commitear `.env*`. No usar la key `service_role` en el cliente. → [core-workflow.mdc](.cursor/rules/core-workflow.mdc)
3. **No hay i18n.** No exigir keys de locale ni “hardcoded strings must be localized”. El copy actual es español embebido.
4. **Folio oficial solo al subir.** Offline = `PENDIENTE` en IndexedDB. No inventar `OS-YY-NNNN` local. → [ADR-0002](.context/decisions/0002-folio-atomico-y-cola-offline.md)
5. **Never commit secrets** (`.env*`, tokens). Only `*.example` files are tracked.
6. **Never bump versions or cut a release proactively.** The developer asks explicitly.
7. **Don't silently update docs.** After substantial work, emit a `## Context-Update Assessment` and prompt once. → [`.cursor/rules/context-maintenance.mdc`](.cursor/rules/context-maintenance.mdc)

## More guidance

→ [`.context/agents/README.md`](.context/agents/README.md) — topic index (build/run, data layer, testing, conventions).

Always-on rules (mirrored for Claude Code in [`CLAUDE.md`](CLAUDE.md)):

<!-- aiscaffold:rules-list:start -->
- [`ordenes-labotec-architecture.mdc`](.cursor/rules/ordenes-labotec-architecture.mdc) — Always-on architecture context
- [`context-maintenance.mdc`](.cursor/rules/context-maintenance.mdc) — Context maintenance / doc orchestration
- [`core-workflow.mdc`](.cursor/rules/core-workflow.mdc) — Core workflow
- [`git-workflow.mdc`](.cursor/rules/git-workflow.mdc) — Git workflow
- [`verify-then-converge.mdc`](.cursor/rules/verify-then-converge.mdc) — Verify-then-converge (AI-review loop)
<!-- aiscaffold:rules-list:end -->
