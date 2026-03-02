# Repository Guidelines

## Project Structure & Module Organization
`skills/drawio/` is the core skill package:
- `scripts/` contains conversion and CLI logic (`dsl/`, `math/`, `svg/`).
- `references/` stores format specs and YAML examples used as source-of-truth docs.
- `assets/` includes theme JSON files and sample `.drawio` diagrams.
- `workflows/` defines create/edit/replicate operating guides.

`docs/` hosts the VitePress site (with `docs/zh/` for Chinese content).  
`tests/` holds repo-level Node tests, while module-level tests also live next to source as `*.test.js`.  
`examples/` and `imgs/` provide demo artifacts for docs and validation.

## Build, Test, and Development Commands
- `npm install` or `just install`: install dependencies.
- `npm run docs:dev` or `just docs`: start local docs server with hot reload.
- `npm run docs:build` or `just docs-build`: generate production documentation.
- `npm run docs:preview` or `just docs-preview`: preview built docs locally.
- `npm test` or `just test`: run the test suite via `node --test`.
- `just lint`: lint Markdown (`markdownlint-cli`).
- `just format`: format Markdown (`prettier`).
- `just ci`: run lint + tests (closest local CI check).

GitHub Actions use Node 20; keep local Node aligned when possible.

## Coding Style & Naming Conventions
Use ESM JavaScript with 2-space indentation, single quotes, and existing project style (minimal semicolons).  
Prefer small, composable functions for parsing and transformation logic.  
Do not hide failures with silent fallbacks; throw explicit errors for invalid input.  
Use kebab-case filenames (for example, `spec-to-drawio.js`) and `*.test.js` for tests.

## Testing Guidelines
Use Node’s built-in testing stack: `node:test` and `node:assert/strict`.  
Add or update tests for every behavior change in DSL parsing, math typesetting, and XML/SVG conversion paths.  
Keep tests deterministic; store fixtures close to the related module or in `tests/`.

## Commit & Pull Request Guidelines
Follow Conventional Commits as seen in history: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, with optional scope and emoji.  
Examples: `feat(cli): ✨ add SVG export`, `fix(docs): restore base path`.

PRs should include:
- a concise summary of problem and solution,
- linked issue (if applicable),
- affected paths/modules,
- verification commands and outputs (`just ci`, `npm run docs:build`),
- screenshots for documentation UI changes.
