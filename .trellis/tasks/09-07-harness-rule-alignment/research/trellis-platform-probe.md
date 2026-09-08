# TRELLIS_PLATFORM probe (AC4)

Independent Python processes, `PYTHONPATH=.trellis/scripts`, `detect_platform(Path.cwd())` from `.trellis/scripts/common/cli_adapter.py`. Adapter was not edited.

| `TRELLIS_PLATFORM` | stdout | exit |
| --- | --- | --- |
| `claude` | `claude` | 0 |
| `codex` | `codex` | 0 |
| `grok` | `grok` | 0 |
| `kimi` | `kimi` | 0 |
| `omp` | `omp` | 0 |
| unset (auto) | `claude` | 0 |

Auto-detect without env currently returns `claude` when `.claude` exists. Do not rewrite hosted Trellis.

Raw: `trellis-platform-probe.json`.
