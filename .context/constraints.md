# Constraints — forbidden patterns & hard-won incidents

Append-only memory of patterns that broke production, lint, or the build — so future
agents (and humans) don't repeat them. Add an entry under the relevant `### <area>`
heading whenever a session hits one. Don't delete entries unless an ADR explicitly
supersedes them. When this file passes ~250 lines or ~10 entries, split it per the
progressive-disclosure rule in `context-maintenance.mdc`.

Each entry should read:

```markdown
### <area>

**Forbidden: <short name>**
- **What:** the pattern that bit us.
- **Why:** the failure it caused (with the symptom/error if memorable).
- **Instead:** the correct approach.
- **Seen:** <date> — <one-line context / PR>.
```

---

### Env / Vite

**Forbidden: `.env` inside `labotec/`**
- **What:** poner `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` en `labotec/.env`.
- **Why:** [labotec/vite.config.js](../labotec/vite.config.js) usa `envDir` = raíz del repo. El cliente nace `undefined` y la consola loguea `[Supabase] Faltan variables…`.
- **Instead:** `.env` en la raíz. Nunca commitearlo. En Netlify, las mismas keys como environment variables de build.
- **Seen:** 2026-09-09 — setup local vs deploy (fill-pass).

### Data layer

**Forbidden: writes to `ordenes` / `config` outside `storage.js`**
- **What:** `supabase.from('ordenes'|'config').insert|update|delete` desde pages/hooks/components.
- **Why:** el mapeo camelCase ↔ snake_case y el update atómico de `ultimo_folio` viven solo en `storage.js`. Saltárselo desincroniza folio y columnas.
- **Instead:** mutaciones vía `agregarOrden` / `eliminarOrden`. `createClient` solo en `supabase.js`. `Verificar.jsx` puede hacer `select` de verificación pública.
- **Seen:** 2026-09-09 — encoded in `storage.js` / `useOrdenes.js` (fill-pass).

### Folios

**Forbidden: client-side `ultimoFolio + 1`**
- **What:** calcular `OS-YY-NNNN` en el browser y hacer insert + update de `config` en paralelo.
- **Why:** dos operadores chocan el mismo número y la app deja de generar.
- **Instead:** el servidor incrementa el contador en una transacción. Offline: cola `PENDIENTE`, folio oficial al subir. → [ADR-0002](decisions/0002-folio-atomico-y-cola-offline.md)
- **Seen:** 2026-09-09 — conflicto multi-usuario.

### Persistence

**Forbidden: treat `fechaISO` as round-tripped**
- **What:** asumir que `desdeDB` devolverá `fecha_iso` después de un insert de `paraDB`.
- **Why:** `paraDB` no incluye `fecha_iso`. El historial (`CardOrden`) lee `fechaISO` y puede quedar vacío.
- **Instead:** no depender de `fechaISO` post-insert salvo default en DB o añadirlo al insert (eso sería un cambio explícito).
- **Seen:** 2026-09-09 — `storage.js` `paraDB` vs `desdeDB` (fill-pass).

### Secrets & config

**Forbidden: hardcoded secrets / tokens / machine paths**
- **What:** committing an API key, token, or absolute local path in source.
- **Why:** leaks credentials; breaks on other machines/CI.
- **Instead:** read from env/config; commit only `*.example` templates.
- **Seen:** baseline rule.

### Documentation

**Forbidden: silently editing project docs**
- **What:** changing `ARCHITECTURE.md` / `AGENTS.md` / `.context/**` without being asked.
- **Why:** doc churn the maintainer didn't approve; drifts the triple-hub.
- **Instead:** emit the `## Context-Update Assessment`, prompt once, then apply. See `context-maintenance.mdc`.
- **Seen:** baseline rule.
