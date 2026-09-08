# Five-tool harness compatibility

Snapshot date: **2026-09-07**. This is a portable skill-owned matrix, not a permanent capability guarantee. Academic overlay reads this file through sibling `../drawio/references/docs/harness-compatibility.md` and must not copy it.

A **harness** decides discovery, tools, context, and permissions. A **model tier** decides reasoning quality and cost. Format compatibility is not permission equivalence and is not SKILL `allowed-tools` / `model` equivalence across tools.

Do not add `GROK.md` / `KIMI.md` / `OMP.md` synonym rule files. Shared engineering facts live in repository `AGENTS.md`; Claude Code loads a thin `CLAUDE.md` `@AGENTS.md` bridge.

## Loading modes

| Mode | Meaning | Not a proof of |
| --- | --- | --- |
| Native | The tool’s own rule files and skill directories, plus its own model and permission controls | Fresh-session load, hooks trust, or Desktop/visual QA |
| Compatibility | Reading `AGENTS.md`, `CLAUDE.md`, or `.agents/skills` through another tool’s compatibility path | Native permission or model semantics |
| Explicit-file-read | Opening `skills/` or a SKILL/AGENTS path by hand when discovery is absent | Fresh-session discovery |

Missing project `.grok` / `.kimi-code` / `.omp` directories is not proof of missing capability. A directory or `--help` listing is not a fresh-session load proof.

## Discovery and model-control matrix

Project product source is tracked `skills/`. Gitignored `.agents/` (and tool-local junctions such as `.claude/skills`) are local installs, not source to edit.

| Tool | Native skill paths | Compatibility / fallback | Model-control location | Permission notes |
| --- | --- | --- | --- | --- |
| Claude Code | Project `.claude/skills/`; user `~/.claude/skills` | Thin `CLAUDE.md` → `AGENTS.md` | Agent `model` / `permissionMode` | Do not treat SKILL `allowed-tools` as a deny-list. Historical `allowed-tools` lines in SKILL frontmatter do not grant tools on other hosts. |
| Codex | Project `.agents/skills`; user `~/.agents/skills` | `AGENTS.md` hierarchy | Custom agent TOML `model` / `model_reasoning_effort` (unset usually inherits) | Host tool schema and permissions take precedence. Codex skill path is **not** `.codex/skills`. |
| Grok Build | Native `.grok/skills`; user `~/.grok/skills` and `~/.agents/skills` | AGENTS family and Claude-compatible paths | Native agent/model controls | SKILL `allowed-tools` / `model` / `effort` do not grant, restrict, or select Grok models. Official user skills docs emphasize `~/.agents/skills`; do not assume Grok scans project `.agents` unless a session proves it. |
| Kimi Code | `.agents/skills` and `.kimi-code/skills` | Root `AGENTS.md` | Native agent pool (`coder` / `explore`) | Claude agent `model` fields are not portable. |
| OMP (Oh My Pi) | `.agents/skills` may be discovered depending on enabled providers | Root `AGENTS.md`; native `.omp` / compatible providers | Task agent model/role selector and `modelRoles` | Role cost follows the account mapping, not a `smol` name. |

Claude **Code** project/user skill directories are `.claude/skills` and `~/.claude/skills`. Claude Desktop product folders such as `~/Library/Application Support/Claude/skills/` are a different product path.

## How to verify actual discovery

1. Confirm the files exist on the expected native or user path (static presence only).
2. Ask the **current** session which `AGENTS.md` / `SKILL.md` absolute paths and `version` it loaded.
3. Confirm a representative capability from that version (for this skill: YAML CLI, current importers such as `compose`, default `.drawio` + 300dpi PNG with SVG fallback).
4. If the client cannot name the loaded path, treat the session as explicit-file-read or unloaded.

Copying `skills/drawio` into a directory is not proof the active session discovered it.

## Strong-plan vs cheap-exec vs strong-review

| Lane | When to use | Typical hosts | Not a guarantee |
| --- | --- | --- | --- |
| Strong plan | Scope, publication delivery semantics, evidence boundaries, parser/CI attribution | Claude Code or Codex with a strong configured model | Model marketing names |
| Cheap exec | Bilingual sync, citation fixes, fixture edits, running recorded commands | Codex Luna-class / Claude Haiku / Kimi `coder` / OMP lower-cost role **when the account actually exposes that tier** | Accuracy, latency, or price on this repository |
| Strong review | Independent check of delivery contract, harness misread, or CI permission assumptions | A second strong model on Claude, Codex, Grok, Kimi, or OMP review role | That a second harness was actually run |

Do not infer cost from harness name, “subagent”, or unofficial aliases. This snapshot did not measure five-tool accuracy, latency, or price.

## Evidence labels (verified vs UNVERIFIED)

| Claim | 2026-09-07 snapshot | Notes |
| --- | --- | --- |
| Official docs for skills/agents/memory | Recorded (see Sources) | Docs can change; re-check before treating as current law |
| Local CLI `--version` / `--help` (no paid inference) | Recorded in sibling rule-alignment probe: Claude Code 2.1.263; Codex CLI 0.153.4; Grok Build 1.0.22; Kimi Code 0.41.0; OMP 18.1.12 | `--help` is not a fresh-session load proof |
| Isolated skill-only CLI + academic sibling `../drawio` | Covered by `tests/skill-installation.test.js` | Not a harness discovery proof |
| Fresh five-tool sessions (actual loaded AGENTS/SKILL paths) | **UNVERIFIED** | Must report loaded absolute paths and version |
| Desktop visual QA / PNG appearance | **UNVERIFIED** unless a named Desktop export was inspected | CLI `--validate` is structure only |
| GitHub Actions on current HEAD | **UNVERIFIED** until a hosted run exists | Workflow pin is not a passing run |
| Node 24 hosted / local ABI (Tree-sitter, real parsers) | **UNVERIFIED** | Proposed CI pin; local Node Current is not Node 24 evidence |

## Child-task writeback

Approved evergreen-harness-alignment children. No credentials, install dumps, or machine-local secrets.

| Child task | Scope | Applicable tools | Files | Check evidence | Remaining gaps |
| --- | --- | --- | --- | --- | --- |
| `test-baseline` | Public lockfile host alignment; default tests must not require optional JS parsers; real parser success is a separate gate | All five consume the same CLI; local npm 12 | `package-lock.json`, parser integration tests, `tests/skill-installation.test.js` | Clean `npm ci` on registry.npmjs.org with allow-remote none; `npm ci --omit=optional` then default `npm test` with 0 fail; `test:parsers` on local Node 26 with 0 skip; missing-parser runs non-zero | Node 24 real parsers **UNVERIFIED** |
| `quality-gates` | Read-only `npm run ci` / `just ci`; PR quality workflow; Windows just recipes | GitHub Actions + local just; all five consume the gate | `package.json`, `justfile`, `.github/workflows/ci.yml`, `.trellis/spec/frontend/quality-guidelines.md` | `just ci` is `npm run ci` only; version-sync is not in the gate; workflow-contract tests; local Node 26 `just ci` exit 0 | Node 24 hosted runs and GitHub HEAD **UNVERIFIED** |
| `rule-alignment` | Shared `AGENTS.md` facts; thin `CLAUDE.md`; source vs local install; five-tool loading vocabulary | Claude Code, Codex, Grok Build, Kimi Code, OMP | `AGENTS.md`, `CLAUDE.md`, `tests/skill-installation.test.js` | In-file five-tool facts; Claude thin bridge; isolated same-source + academic sibling tests; static `--version` probe; `TRELLIS_PLATFORM` five-value probe | Fresh sessions **UNVERIFIED**; `.agents/` remains gitignored |
| `skill-doc-evidence` (this file’s owner) | Public bilingual install/delivery docs; one portable matrix; host-neutral palette questions | All five | `README.md`, `README_CN.md`, `docs/guide/installation.md`, `docs/zh/guide/installation.md`, this file, both `SKILL.md` (pointers only), palette/create/playbook wording, policy tests | Policy tests, Markdown lint, docs build, isolated matrix-readable install copy, CLI `--validate` structure on an academic example | Fresh sessions, Desktop visual, GitHub HEAD, Node 24 **UNVERIFIED** |

## Historical SKILL frontmatter

Older SKILL copies listed Claude-oriented `allowed-tools` (including a Claude question tool name). That field does not grant, deny, or select tools on Codex, Grok, Kimi, or OMP. Palette questions now use the **host’s actual single-select question tool when present**, otherwise ordinary text. Do not restore a Claude-only tool name as a portable contract.

## Sources

- [Claude Code memory](https://code.claude.com/docs/en/memory)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Claude Code sub-agents](https://code.claude.com/docs/en/sub-agents)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex AGENTS](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Grok skills and compatibility](https://docs.x.ai/build/features/skills-plugins-marketplaces)
- [Kimi Code skills](https://moonshotai.github.io/kimi-code/en/customization/skills)
- [Kimi Code agents](https://moonshotai.github.io/kimi-code/en/customization/agents)
- [OMP context files](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md)
- [OMP task agent discovery](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md)
- [Node release status](https://nodejs.org/en/about/previous-releases)
