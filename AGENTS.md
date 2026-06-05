# Repository Guidelines

## Project Structure & Module Organization
`skills/drawio/` is the core skill package:
- `scripts/` contains conversion and CLI logic (`dsl/`, `math/`, `svg/`).
- `references/` stores format specs and YAML examples used as source-of-truth docs.
- `assets/` includes theme JSON files and sample `.drawio` diagrams.
- `references/workflows/` defines create/edit/replicate operating guides.

`skills/drawio-academic-skills/` is the publication overlay: it carries only academic policy (`SKILL.md`, `references/docs/publication-overlay.md`) and academic evals, and depends on the sibling base at `../drawio` for shared CLI, references, themes, schemas, examples, and workflows.

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
<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
