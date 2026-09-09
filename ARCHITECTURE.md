# LABOTEC Órdenes de Servicio — Architecture

> **Canonical map of the system.** This is the entry point for humans and agents.
> [`AGENTS.md`](AGENTS.md) (hard constraints) and
> [`.cursor/rules/ordenes-labotec-architecture.mdc`](.cursor/rules/ordenes-labotec-architecture.mdc)
> (always-on reminders) must agree with this file.

## What LABOTEC Órdenes de Servicio is

SPA interna para que el equipo de LABOTEC Engineering cree, firme, consulte y elimine órdenes de servicio (preventivo, correctivo, capacitación, instalación). El flujo crítico es **generar** una orden (folios, firmas, QR de verificación) y **persistirla** en Supabase; el segundo flujo crítico es la página pública `/verificar/:folio`, que confirma una orden sin login.

> **Drafted from facts.** [labotec/package.json](labotec/package.json), [labotec/src/App.jsx](labotec/src/App.jsx), [labotec/src/hooks/useOrdenes.js](labotec/src/hooks/useOrdenes.js), [labotec/src/pages/Verificar.jsx](labotec/src/pages/Verificar.jsx), [labotec/src/main.jsx](labotec/src/main.jsx).

## Stack

- **Platform**: Web SPA (Vite 5 + React 18), npm workspaces. No Nx, no React Native.
- **Languages**: JavaScript (JSX). No TypeScript.
- **Version**: 1.1.0 ([labotec/package.json](labotec/package.json); el `package.json` raíz no declara versión)

| Area | Fact |
| --- | --- |
| App | Workspace `labotec` (`labotec-ordenes-servicio`). Raíz `labotec-completo` solo orquesta scripts. |
| Data | `@supabase/supabase-js` — tablas `ordenes` y `config`. Cliente en `labotec/src/services/supabase.js`. |
| State | `useOrdenes` en memoria; borrador de formulario en `localStorage` (`labotec-borrador-v1`). |
| Nav / UI | Sin React Router. `main.jsx` ramifica `/verificar/:folio`; el resto es `switch` de `pantalla` en `App.jsx`. CSS modules + `react-time-picker`. |
| i18n | No hay librería ni locales. Copy en español embebido en componentes. |
| Secrets | `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` en `.env` de la **raíz** (`vite.config.js` `envDir`). Gitignored. |
| Deploy | Netlify site `ordenes-servicio-labotec`; build `npm run build` → `labotec/dist` ([netlify.toml](netlify.toml)). |

## System overview

Un solo cliente browser. Las pantallas de trabajo viven en `useOrdenes`. Las mutaciones de órdenes pasan por `storage.js` → Supabase. La verificación pública lee `ordenes` con el mismo cliente anónimo.

```text
browser
  ├─ /verificar/:folio  → Verificar.jsx  → supabase.from('ordenes').select
  └─ App (pantalla)
        useOrdenes  → storage.js  → supabase.js  → Supabase
                          │              │
                     ordenes +      VITE_SUPABASE_*
                     config         (.env raíz)
        localStorage: solo borrador de formulario
        PDF / firmas canvas / QR: client-side
```

## Module / file map

```text
package.json, package-lock.json   npm workspaces; scripts dev/build/preview
netlify.toml                      command npm run build; publish labotec/dist
.env                              VITE_SUPABASE_* (no commitear)
labotec/
  vite.config.js                  alias @ → src; envDir = repo root; outDir dist
  public/_redirects               SPA fallback /* → /index.html
  src/
    main.jsx                      router mínimo: Verificar vs App
    App.jsx                       switch de pantalla
    config/marca.js               tipos de orden + colores
    hooks/useOrdenes.js           estado + generar/eliminar + borrador
    hooks/usePDF.js               exportar PDF
    services/supabase.js          createClient
    services/storage.js           cargar/insert/delete + mapeo camel/snake
    pages/                        Inicio, Formulario, OrdenVista, Historial, Detalle, Verificar
    components/                   form, historial, document, layout, common
    utils/                        folio, fecha, hash, qr
```

## Key patterns

- Persistencia de órdenes solo vía `storage.js`. Altas: RPC atómico. → [ADR-0001](.context/decisions/0001-supabase-persistence.md), [ADR-0002](.context/decisions/0002-folio-atomico-y-cola-offline.md)
- Folio `OS-YY-NNNN` lo asigna el servidor; offline queda `PENDIENTE` en IndexedDB. → [ADR-0002](.context/decisions/0002-folio-atomico-y-cola-offline.md)
- `useOrdenes` como único store de la app de trabajo. → candidato a pattern (no escrito)
- Verificación pública por URL, sin auth en el cliente. → [labotec/src/pages/Verificar.jsx](labotec/src/pages/Verificar.jsx)
- Deploy continuo: push a `main` → Netlify. → [netlify.toml](netlify.toml)

## Documentation navigation

This table is the **hub** of the triple-hub topology. It is kept in sync by
`ai-workflow-scaffold` — do not hand-edit between the markers; run
`ai-workflow-scaffold validate` after changing the installed rule set.

<!-- aiscaffold:rules-table:start -->
| Guidance | Rule | Always-on |
|---|---|---|
| Always-on architecture context | [`ordenes-labotec-architecture.mdc`](.cursor/rules/ordenes-labotec-architecture.mdc) | yes |
| Context maintenance / doc orchestration | [`context-maintenance.mdc`](.cursor/rules/context-maintenance.mdc) | yes |
| Core workflow | [`core-workflow.mdc`](.cursor/rules/core-workflow.mdc) | yes |
| Git workflow | [`git-workflow.mdc`](.cursor/rules/git-workflow.mdc) | yes |
| Verify-then-converge (AI-review loop) | [`verify-then-converge.mdc`](.cursor/rules/verify-then-converge.mdc) | yes |
| Code review (repo overlay) | [`code-review.mdc`](.cursor/rules/code-review.mdc) | on-request |
<!-- aiscaffold:rules-table:end -->

### Engineering memory (`.context/`)

| Topic | Path |
|---|---|
| Project vision | [`.context/vision/project-vision.md`](.context/vision/project-vision.md) |
| Constraints (forbidden patterns) | [`.context/constraints.md`](.context/constraints.md) |
| Decisions / ADRs | [`.context/decisions/`](.context/decisions/) |
| Patterns (deep dives) | [`.context/patterns/`](.context/patterns/) |
| History | [`.context/history.md`](.context/history.md) |
| Agent topic index | [`.context/agents/README.md`](.context/agents/README.md) |

## When working on...

- **CRUD / carga de órdenes** — [labotec/src/services/storage.js](labotec/src/services/storage.js), [ADR-0001](.context/decisions/0001-supabase-persistence.md)
- **Formulario, folio, firmas, QR** — [labotec/src/hooks/useOrdenes.js](labotec/src/hooks/useOrdenes.js), [labotec/src/utils/folio.js](labotec/src/utils/folio.js)
- **Página pública de verificación** — [labotec/src/main.jsx](labotec/src/main.jsx), [labotec/src/pages/Verificar.jsx](labotec/src/pages/Verificar.jsx)
- **Tipos de servicio / marca** — [labotec/src/config/marca.js](labotec/src/config/marca.js)
- **Build o env** — [labotec/vite.config.js](labotec/vite.config.js), [netlify.toml](netlify.toml), [core-workflow.mdc](.cursor/rules/core-workflow.mdc)
- **Cambio no trivial** — OpenSpec `/opsx:propose` → [openspec/project.md](openspec/project.md)
