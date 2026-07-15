# Frontend Development Guidelines

This Trellis layer covers the repository's user-facing authoring surfaces:
the Draw.io skill packages, the YAML/CLI rendering pipeline, exported SVG
previews, and the VitePress documentation site. The project is not a React
application; apply the "frontend" wording here to diagram/documentation
surfaces and ESM JavaScript tooling.

## Pre-Development Checklist

- Read [Directory Structure](./directory-structure.md) before moving files or
  adding a new module.
- Read [Component Guidelines](./component-guidelines.md) before changing CLI,
  DSL, renderer, adapter, runtime, or skill-doc composition.
- Read [Hook Guidelines](./hook-guidelines.md) before adding extension points,
  optional providers, environment handling, or long-lived state.
- Read [State Management](./state-management.md) before changing artifact
  paths, canonical YAML, sidecars, layout derivation, or version metadata.
- Read [Type Safety](./type-safety.md) before accepting new YAML, XML, style,
  icon, theme, CLI flag, or filesystem input.
- Read [Quality Guidelines](./quality-guidelines.md) before reporting a
  diagram, docs, skill, CLI, or renderer change as complete.

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Repository ownership, module layout, docs and test placement | Filled |
| [Component Guidelines](./component-guidelines.md) | Composable JS module patterns, CLI boundaries, skill overlay contracts | Filled |
| [Hook Guidelines](./hook-guidelines.md) | Extension-point rules for a non-React, offline-first toolchain | Filled |
| [State Management](./state-management.md) | Canonical YAML state, derived artifacts, sidecars, and caches | Filled |
| [Type Safety](./type-safety.md) | Runtime validation patterns for ESM JavaScript and VitePress config | Filled |
| [Quality Guidelines](./quality-guidelines.md) | Required tests, artifact policy, forbidden patterns, review checks | Filled |
| [Font Policy](./font-policy.md) | Diagram-level `meta.font` contract, force mode, and script-aware font resolution | Filled |
| [Palette Policy](./palette-policy.md) | Theme-independent palette loading, tokens, diagnostics, interaction, and release contracts | Filled |

## Quality Check

- Specs must describe current repository behavior, not generic frontend
  advice.
- Important rules should reference real files such as `AGENTS.md`,
  `skills/drawio/scripts/cli.js`, `skills/drawio/scripts/dsl/spec-to-drawio.js`,
  `skills/drawio/scripts/runtime/artifacts.js`, `docs/.vitepress/config.ts`,
  and tests under `tests/`.
- Do not add React, browser-app, server-state, or component-library rules
  unless the repository actually introduces those surfaces.
- Keep this directory in English.
