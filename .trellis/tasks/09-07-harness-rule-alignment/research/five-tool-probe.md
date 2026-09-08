# Five-tool static probe (AC4)

Date: 2026-09-07. Local Node `v26.7.0`. **No paid inference, no Desktop UI, no new agent sessions.**

`--help` was used as discovery-help where available. That is not a fresh-session load proof.

| Tool | `--version` | Static rule / skill paths observed | Model-control location (from matrix; not re-tested in a session) | Paid/external |
| --- | --- | --- | --- | --- |
| Claude Code | `2.1.263 (Claude Code)` | Project `CLAUDE.md` + `AGENTS.md`; `.claude/skills` exists; user `~/.claude/skills` exists (untouched) | Claude agent `model` / `permissionMode` | none |
| Codex | `codex-cli 0.153.4` | `AGENTS.md`; project `.agents/skills` and `.codex` exist; user `~/.agents/skills` exists | custom agent TOML `model` / `model_reasoning_effort` | none |
| Grok Build | `grok 1.0.22 (8f40483ca2a5)` | `AGENTS.md`; project `.grok` absent; user `~/.grok/skills` exists | native agent/model; SKILL `allowed-tools`/`model`/`effort` are not Grok permission/model controls | none |
| Kimi Code | `0.41.0` | `AGENTS.md`; project `.kimi-code` absent; `--help` has `--skills-dir` / `--agent`; user `~/.kimi-code/skills` absent | native agent pool; Claude agent model fields are not portable | none |
| OMP | `omp/18.1.12` | `AGENTS.md`; project `.omp`/`.pi` absent; user `~/.omp` exists | Task agent model/role selector and `modelRoles` | none |

Missing project `.grok` / `.kimi-code` / `.omp` is not a missing-capability proof.

Fresh-session / Desktop / GitHub hosted runs: **UNVERIFIED**.

Raw: `five-tool-probe.json`.
