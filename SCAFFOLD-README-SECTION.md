<!--
  Paste this section into the target repo's README.md (or let the fill-pass merge it).
  It points contributors and agents at the AI-first documentation system.
-->

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
