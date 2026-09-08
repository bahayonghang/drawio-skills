# Local `.agents/skills/drawio*` refresh (AC2)

Date: 2026-09-07. Pause classification first: see `pause-classification.md` (no unique customizations).

## Backup (outside git)

- Root: `C:\Users\lyh\AppData\Local\Temp\drawio-skills-agents-backup-20260907-212514`
- Backup SKILL versions: drawio `2.5.0`, academic `2.5.0`
- Not committed. User-global `~/.claude/skills` was not modified.

## After refresh

Windows junctions (PowerShell `LinkType=Junction`):

| Path | Target | `Path.resolve()` |
| --- | --- | --- |
| `.agents/skills/drawio` | `D:\Documents\Code\Agents\drawio-skills\skills\drawio` | same |
| `.agents/skills/drawio-academic-skills` | `D:\Documents\Code\Agents\drawio-skills\skills\drawio-academic-skills` | same |
| `.claude/skills/drawio` | `.agents/skills/drawio` (unchanged Claude junction) | `skills/drawio` |
| `.claude/skills/drawio-academic-skills` | `.agents/skills/drawio-academic-skills` | `skills/drawio-academic-skills` |

SKILL versions after refresh: source and install both `2.8.0`.

CLI `--help`: source and install stdout equal; both list `compose` and `js-imports` (representative 2.8 capability missing from the 2.5.0 `--input-format` list).

Other `.agents/skills/trellis-*` names were present before and after. `.agents/` remains gitignored and must not be committed.

Raw JSON: `install-refresh.json`.
