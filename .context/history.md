# History — architectural changelog

Most-recent-first log of architecturally significant changes: new patterns, major
migrations, schema-affecting changes, deprecation of a shared hook/component, or
replacement of a widely-used utility. Not a commit log — only changes a future agent
benefits from knowing about. Split per the progressive-disclosure rule when it grows.

Format:

```markdown
## YYYY-MM-DD — <one-line summary>

**Scope:** <feature / module / shared>
**What changed:**
**Why:**
**Related decisions:** <ADR slug or 'none'>
```

---

## 2026-09-09 — Folio atómico, PWA y cola offline

**Scope:** persistencia / formulario / deploy
**What changed:** RPC `reservar_y_insertar_orden`, unique folio, cola IndexedDB, PWA, time picker / firmas / PDF sin CDN.
**Why:** choque de folios entre operadores y uso en campo sin señal; inputs nativos rotos fuera de Chrome.
**Related decisions:** ADR-0002

## 2026-09-09 — AI-first documentation framework adopted

**Scope:** repo-wide (docs/tooling)
**What changed:** Scaffolded the AI-first documentation + workflow framework with
`ai-workflow-scaffold` — `ARCHITECTURE.md`/`AGENTS.md`/`CLAUDE.md` hub, always-on rules,
`.context/` engineering memory, and tool glue.
**Why:** make the repo navigable by Cursor/Claude/Codex and standardize how the team
captures engineering memory.
**Related decisions:** see `.context/decisions/`.
