# LABOTEC Órdenes de Servicio — Claude Code memory

This file is an auto-loader. Claude Code resolves `@`-import directives at session start, pulling the referenced files into memory. Cursor reads `.cursor/rules/*.mdc` natively via `alwaysApply: true`; this loader exists so Claude Code enforces the same baseline.

When you add a new always-on `.cursor/rules/*.mdc` file, append a matching `@./.cursor/rules/<name>.mdc` line below (or re-run `ai-workflow-scaffold validate` to detect drift). See [`.cursor/rules/context-maintenance.mdc`](.cursor/rules/context-maintenance.mdc) for the convention.

## Agent guide (canonical content)

@./AGENTS.md

## Always-applied rules

<!-- aiscaffold:claude-imports:start -->
@./.cursor/rules/ordenes-labotec-architecture.mdc
@./.cursor/rules/context-maintenance.mdc
@./.cursor/rules/core-workflow.mdc
@./.cursor/rules/git-workflow.mdc
@./.cursor/rules/verify-then-converge.mdc
<!-- aiscaffold:claude-imports:end -->

## System overview

@./ARCHITECTURE.md
