# Project Vision — LABOTEC Órdenes de Servicio

> The durable "why" behind LABOTEC Órdenes de Servicio. Agents read this to weigh trade-offs the way
> the team would. Keep it stable; it changes far less often than architecture.

## Problem

> **Drafted from facts.** El código modela órdenes de servicio de campo (preventivo, correctivo, capacitación, instalación) con folio, firmas, actividades, refacciones y un link público de verificación ([labotec/src/config/marca.js](../../labotec/src/config/marca.js), [labotec/src/hooks/useOrdenes.js](../../labotec/src/hooks/useOrdenes.js), [labotec/src/pages/Verificar.jsx](../../labotec/src/pages/Verificar.jsx)). Quién opera la herramienta y el problema de negocio formal no están documentados.

> **Stub — team conversation needed.** Audiencia, proceso de negocio y por qué esto no es un PDF/Word manual.

## What it is

LABOTEC Órdenes de Servicio is Sistema de Órdenes de Servicio — LABOTEC Engineering Services.

SPA (Vite + React) que crea, firma, lista y verifica órdenes persistidas en Supabase. Versión de app `1.1.0`.

## Principles / non-negotiables

> **Drafted from facts.**
>
> - Una sola fuente de verdad remota para órdenes (Supabase), no `localStorage` como DB.
> - El folio y `ultimo_folio` se actualizan juntos al generar.
> - La verificación por URL es pública (sin login en el cliente).
> - No hay tests: un cambio de persistencia o de `/verificar` se comprueba a mano.

> **Stub — team conversation needed.** Prioridad formal entre velocidad, compliance y UX cuando choquen.

## Out of scope

> **Drafted from facts.** El cliente **no** implementa autenticación de usuarios, roles, facturación, inventario, ni i18n. `cargarDB` ante error de red/RLS devuelve `{ ordenes: [], ultimoFolio: 1000 }` sin UI de fallo.

> **Stub — team conversation needed.** Qué queda deliberadamente fuera a nivel de producto (app móvil, portal de cliente, etc.).

## Success looks like

> **Drafted from facts.** Una orden generada aparece en historial y en `/verificar/:folio`; el sitio en Netlify se actualiza con `git push` a `main`.

> **Stub — team conversation needed.** Métricas de éxito y SLAs.
