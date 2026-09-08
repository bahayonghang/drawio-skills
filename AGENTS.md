# Repository Guidelines

## Project Structure & Module Organization
`skills/` is the only tracked product source for the skill packages. Gitignored `.agents/` (and tool-local junctions such as `.claude/skills`) are local installs, not source to edit.

`skills/drawio/` is the core skill package:
- `scripts/` contains conversion and CLI logic (`dsl/`, `math/`, `svg/`).
- `references/` stores format specs and YAML examples used as source-of-truth docs.
- `assets/` includes theme JSON files and sample `.drawio` diagrams.
- `references/workflows/` defines create/edit/replicate operating guides.

`skills/drawio-academic-skills/` is the publication overlay. It owns academic policy (`SKILL.md`, `references/docs/publication-overlay.md`, playbook/checklist), overlay-exclusive paper examples and templates, overlay evals, and overlay README/agent files. It depends on the sibling base at `../drawio` for shared CLI, runtime, references, themes, schemas, shared examples, and workflows.

`docs/` hosts the VitePress site (with `docs/zh/` for Chinese content).  
`tests/` holds repo-level Node tests, while module-level tests also live next to source as `*.test.js`.  
`examples/` and `imgs/` provide demo artifacts for docs and validation.

## Build, Test, and Development Commands
- `npm install` or `just install`: install dependencies.
- `npm run docs:dev` or `just docs`: start local docs server with hot reload.
- `npm run docs:build` or `just docs-build`: generate production documentation.
- `npm run docs:preview` or `just docs-preview`: preview built docs locally.
- `npm test` or `just test`: run the default test suite via `node --test`.
- `just lint`: lint Markdown (`markdownlint-cli`).
- `just format`: format Markdown (`prettier`).
- `npm run ci` or `just ci`: closest local CI gate. It is read-only (`version-check`, Markdown lint, default tests, real parser tests, and docs build). It does not run mutating `version-sync`; keep `just version-sync` / `just version-sync-to` as explicit write commands.

GitHub Actions workflow `.github/workflows/ci.yml` runs that same `npm run ci` gate and pins **Node 24** as the proposed CI baseline. The Node 24 pin is **UNVERIFIED** locally. Do not claim Node 20 as the current CI guarantee, and do not treat a local Node Current/newer runtime as Node 24 evidence.

## Harness differences
Shared engineering facts live in this file. Claude Code loads `CLAUDE.md`, which is a thin `@AGENTS.md` bridge. Do not add `GROK.md` / `KIMI.md` / `OMP.md` synonym rule files.

Five tools in scope: Claude Code, Codex, Grok Build, Kimi Code, and OMP (Oh My Pi). Loading is native, compatibility, or explicit-file-read. Format compatibility is not permission equivalence and is not SKILL `allowed-tools` / `model` equivalence across tools. Fresh five-tool sessions (actual loaded AGENTS/SKILL paths) remain UNVERIFIED.

- Native: the tool’s own rule files and skill directories, plus its own model and permission controls.
- Compatibility: reading `AGENTS.md`, `CLAUDE.md`, or `.agents/skills` through another tool’s compatibility path. That is not native permission or model semantics.
- Explicit-file-read: opening `skills/` or this file by path when discovery is absent. That is not a fresh-session load proof.

Model and permission controls (do not assume SKILL frontmatter is equivalent):

- Claude Code: agent `model` / `permissionMode`; skills from project `.claude/skills/` and user `~/.claude/skills`. Do not treat SKILL `allowed-tools` as a deny-list.
- Codex: custom agent TOML `model` / `model_reasoning_effort` (unset usually inherits); host tool schema and permissions take precedence. Skills: project `.agents/skills` and user `~/.agents/skills`.
- Grok Build: native agent/model controls; SKILL `allowed-tools` / `model` / `effort` do not grant, restrict, or select Grok models. Native `.grok/skills`; user `~/.grok/skills` and `~/.agents/skills`.
- Kimi Code: native agent pool (coder/explore); Claude agent `model` fields are not portable. Skills: `.agents/skills` and `.kimi-code/skills`.
- OMP (Oh My Pi): Task agent model/role selector and `modelRoles`. `.agents/skills` may be discovered depending on enabled providers.

Missing project `.grok` / `.kimi-code` / `.omp` directories is not proof of missing capability.

Platform-related Trellis commands must set `TRELLIS_PLATFORM=claude|codex|grok|kimi|omp` (or the command `--platform`). Auto-detect without that env currently returns `claude` when `.claude` exists; do not rewrite the hosted Trellis adapter.

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
