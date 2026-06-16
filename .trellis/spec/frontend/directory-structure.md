# Directory Structure

This repository is a Draw.io skill package with an offline-first CLI and a
VitePress documentation site. There is no `src/` app tree and no React
component directory.

## Directory Layout

```text
skills/drawio/
  SKILL.md
  scripts/
    cli.js
    adapters/
    dsl/
    math/
    runtime/
    shared/
    svg/
  references/
    docs/
    examples/
    official/
    workflows/
  assets/
    schemas/
    themes/
  styles/
    built-in/

skills/drawio-academic-skills/
  SKILL.md
  README.md
  evals/
  references/docs/publication-overlay.md

docs/
  .vitepress/config.ts
  guide/
  api/
  zh/
  adr/

tests/
scripts/
```

## Ownership Boundaries

- `skills/drawio/` is the base runtime. Put shared CLI behavior, YAML DSL
  parsing, XML/SVG conversion, Desktop export helpers, themes, schemas,
  examples, and workflow references here.
- `skills/drawio-academic-skills/` is a thin overlay. It may contain academic
  policy, overlay README/reference docs, and overlay evals, but it must call
  sibling `../drawio` for shared scripts, themes, schemas, references, styles,
  and examples.
- `docs/` is the VitePress site. English pages live under `docs/`; Chinese
  translations live under `docs/zh/`; navigation lives in
  `docs/.vitepress/config.ts`.
- `tests/` holds repo-level tests that span packages. Module-level tests live
  next to the source as `*.test.js`, for example
  `skills/drawio/scripts/dsl/spec-to-drawio.test.js`.
- `scripts/` holds repository maintenance tooling such as
  `scripts/run-tests.js` and `scripts/version-sync.js`.

## Module Organization

- Keep the command boundary in `skills/drawio/scripts/cli.js`. It should parse
  flags, select the input adapter, run validation, and write outputs.
- Put YAML specification parsing, validation, layout, style generation, and XML
  validation in `skills/drawio/scripts/dsl/`.
- Put input normalizers in `skills/drawio/scripts/adapters/`; they should emit
  the canonical spec object consumed by the DSL compiler.
- Put Draw.io Desktop, diagrams.net URL, and artifact path helpers in
  `skills/drawio/scripts/runtime/`.
- Put XML helper parsing and escaping shared by import/export flows in
  `skills/drawio/scripts/shared/`.
- Put local standalone SVG rendering in `skills/drawio/scripts/svg/`.
- Put reusable YAML examples under `skills/drawio/references/examples/`; tests
  should use these examples when the behavior is meant to stay documented.

## Naming Conventions

- Use ESM JavaScript with kebab-case filenames for implementation modules,
  such as `spec-to-drawio.js` and `drawio-to-spec.js`.
- Name tests `*.test.js`.
- Keep route/workflow docs under `references/workflows/` with route names:
  `create.md`, `edit.md`, and `replicate.md`.
- Keep theme and style preset data in JSON files, not in ad hoc JS constants,
  unless the constant is a runtime fallback already established by the module.

## Examples To Follow

- Base/overlay package boundary:
  `skills/drawio/SKILL.md` and `skills/drawio-academic-skills/SKILL.md`.
- CLI orchestration:
  `skills/drawio/scripts/cli.js`.
- Canonical artifact helpers:
  `skills/drawio/scripts/runtime/artifacts.js`.
- Shared XML parser utilities:
  `skills/drawio/scripts/shared/xml-utils.js`.
- End-to-end CLI tests:
  `tests/integration.test.js`.
- VitePress navigation:
  `docs/.vitepress/config.ts`.

## Avoid

- Do not copy base runtime files into the academic overlay.
- Do not add new root-level runtime directories when an existing package
  boundary already owns the behavior.
- Do not put generated final artifacts, temporary sidecars, or scratch scripts
  under skill source directories as part of normal diagram generation.
