# The Verify-then-Converge Loop — LABOTEC Órdenes de Servicio playbook

> **What this is.** The repo-instance half of the review-loop doctrine. The org-wide core —
> the loop, the verdict contract, the adjudication catalog, the operational reviewer layer —
> lives in [`verify-then-converge-core.md`](verify-then-converge-core.md) (kit-managed;
> upgraded by `ai-workflow-scaffold` — don't edit that one). THIS file is repo-owned and
> never touched by upgrades: it holds what only this repo knows. The always-on trigger is
> [`verify-then-converge.mdc`](../../.cursor/rules/verify-then-converge.mdc); the
> pasted-comment triage overlay is
> [`code-review.mdc`](../../.cursor/rules/code-review.mdc).
>
> Grow this file from real loop runs: every refuted finding whose class could recur, every
> incident, every reviewer false positive with a name. A playbook that names specific
> expected false positives pre-adjudicates them for free.

## Reviewer setup and consent

No hay `.coderabbit.yaml`, GitHub Action de review, ni App de review commiteada. Consent por defecto: **loop in-house** (Cursor + `verify-then-converge.mdc`). Un revisor externo (CodeRabbit, Copilot) no está autorizado hasta decisión explícita del equipo.

> **Stub — team conversation needed.** Si el repo público debe o no mandar diffs a un bot externo.

## The gate, and what it does not check

- **Gate:** `npm run build` desde la raíz (Vite → `labotec/dist`).
- **Prueba:** el bundle compila (JSX, imports, alias `@`).
- **No cubre:** runtime Supabase, RLS, folios, firmas, `/verificar`, ni CSS layout.
- **No hay** lint script ni test runner. Baseline: cero tests.

## Front-load-mandatory subsystems

- Persistencia `storage.js` / schema `ordenes`+`config` (folios, pérdidas de datos).
- Página pública `/verificar/:folio` (contrato de URL + datos expuestos al anon).
- Generación de orden (firmas, QR, `ultimo_folio` atómico).

## This repo's adjudication heuristics

- “Add i18n / locale keys” → **Refute** (no hay i18n).
- “Put env next to Vite app” → **Refute** (`envDir` es la raíz).
- “Add React Router” → **Skip** unless the change is navigation; el router es `main.jsx` + `pantalla`.
- “Swallowing errors in `cargarDB`” → **Escalate** (comportamiento actual: historial vacío). No “arreglar” en un review pass sin pedirlo.

## Per-stack finding taxonomy

Reviewers estáticos suelen marcar: missing keys, `alert()`, data URLs de firmas en DB, falta de auth. Verificar contra el código: `alert` es la validación actual del form; firmas son data URLs a propósito; no hay login.

Clases que el review no ve: RLS en Supabase, `fecha_iso` ausente en insert, Netlify env vars en build.

## Incidents and convergence history

- 2026-09-09 — fill-pass: no hay loop runs previos. Playbook sembrado desde el código, no desde reviews.
