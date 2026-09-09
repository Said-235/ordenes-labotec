# ADR-0002: Folio atómico en servidor y cola offline

- **Status:** Accepted
- **Date:** 2026-09-09
- **Deciders:** team (plan compat / sync / offline)

## Context

El folio `OS-YY-NNNN` se calculaba en el cliente (`ultimoFolio + 1`) y se escribía con un `insert` + `update config` en paralelo. Dos operadores leían el mismo contador y la app dejaba de generar. Además el campo se usa en sitios sin señal: no se puede reservar el número oficial sin red.

## Decision

- El folio oficial lo asigna Postgres en `reservar_y_insertar_orden` (SQL en [`supabase/reservar_y_insertar_orden.sql`](../../supabase/reservar_y_insertar_orden.sql)). El cliente no elige `NNNN`.
- Índice unique en `ordenes.folio`. El contador `config.ultimo_folio` existente se reutiliza; no se renumeran filas viejas.
- Sin red (o si el RPC falla): la orden se guarda en IndexedDB (`offlineQueue.js`) como `pending` con folio `PENDIENTE`. Al recuperar conexión se llama el mismo RPC y recién ahí recibe `OS-YY-NNNN`.
- PWA (`vite-plugin-pwa`) precachea el shell para abrir la app sin señal.

## Alternatives considered

- **Folio único local tipo `OS-26-A3F9`** — no choca, pero rompe la serie que ya se maneja.
- **Reservar N folios al inicio del día** — frágil si dos dispositivos reservan de más o se quedan sin cupo.

## Consequences

- **Positive:** dos personas pueden generar a la vez; el historial oficial sigue correlativo.
- **Negative / cost:** hay que ejecutar el SQL en Supabase una vez. Un PDF impreso offline no lleva folio definitivo.
- **Follow-ups:** aplicar el SQL en el proyecto `labotec-ordenes`; revisar RLS si el RPC lo bloquea el rol `anon`.
