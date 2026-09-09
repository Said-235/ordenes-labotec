# ADR-0001: Supabase as the source of truth for órdenes

- **Status:** Accepted
- **Date:** 2026-09-09
- **Deciders:** encoded in code (fill-pass; names not recorded)

## Context

La app es un SPA sin backend propio. Hace falta una persistencia compartida entre máquinas (el historial no puede vivir solo en el browser). `localStorage` ya se usa para el **borrador** del formulario (`labotec-borrador-v1` en `useOrdenes.js`). Mezclar órdenes confirmadas en el mismo sitio rompería la fuente de verdad entre operadores.

## Decision

- Cliente: `@supabase/supabase-js`, instanciado **solo** en [`labotec/src/services/supabase.js`](../../labotec/src/services/supabase.js) con `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.
- Capa de datos: [`labotec/src/services/storage.js`](../../labotec/src/services/storage.js) — `cargarDB`, `agregarOrden`, `eliminarOrden`; mapeo camelCase ↔ snake_case.
- Tablas: `ordenes` (filas de orden) y `config` (key `ultimo_folio`).
- `localStorage` queda reservado al borrador, no a la lista de órdenes.

## Alternatives considered

- **Solo `localStorage`** — no comparte datos entre dispositivos; el historial no sobreviviría un cambio de SO (motivo del backfill en otra máquina).
- **Backend propio / API REST** — no existe en el repo; añadiría un runtime que hoy no hay.

## Consequences

- **Positive:** un solo cliente; el resto de la UI no conoce snake_case ni Supabase.
- **Negative / cost:** RLS, schema y políticas viven en el proyecto Supabase, no en este repo. `paraDB` no envía `fecha_iso`. `cargarDB` traga errores y muestra historial vacío.
- **Follow-ups:** documentar schema SQL; decidir si `Verificar.jsx` debe pasar por `storage.js`; persistir `fecha_iso` en el insert.
