# Changelog

All notable changes to LABOTEC Órdenes de Servicio are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!--
  Add user/release-meaningful deltas here under the standard sub-sections.
  Order: Added, Changed, Deprecated, Removed, Fixed, Security.
  Use a repo-local "Documentation" sub-section for doc-only deltas.
  Do NOT cut a release here — that is a developer-triggered ritual.
-->

### Added

- AI-first documentation + workflow framework scaffolded with `ai-workflow-scaffold`.
- PWA (precarga del shell) y cola offline: órdenes pendientes se suben al recuperar red; el folio oficial se asigna entonces.
- Selector de hora, sugerencias de campos y firmas compatibles con Firefox / DuckDuckGo.
- PDF empaquetado (html2canvas + jspdf) sin CDN.

### Fixed

- Choque de folios cuando dos personas generan a la vez (RPC atómico + unique en `folio`).
