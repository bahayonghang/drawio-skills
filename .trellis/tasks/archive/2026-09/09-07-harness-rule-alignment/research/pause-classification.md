# HARD PAUSE classification: `.agents/skills/drawio*` vs `skills/` 2.8.0

Date: 2026-09-07. Read-only comparison **before** any replace/relink.

## Verdict

**No unique unrecorded customizations.** Delta is the known outdated install (2.5.0-era source fork, including CRLF checkout noise and a few post-`97254d2` but still `version: "2.5.0"` git blobs). Refresh via junction is allowed.

Other `.agents/skills/trellis-*` trees were not compared for replacement and must be preserved. User-global `~/.claude/skills` was not touched.

## Method

- Inventory hashes of `.agents/skills/drawio` and `.agents/skills/drawio-academic-skills` vs tracked `skills/` (skip `node_modules` / junk names).
- Compare the install trees to git `97254d2` (`chore(release): … 发布 drawio 2.5.0`).
- Re-check non-CRLF diffs against `git log` blobs for the same relative paths.

Raw counts: `install-diff-summary.json`, `install-vs-2.5.0-real-diff.json`, `customization-classification.json`. Sample diffs: `pause-diffs/`.

## Draw.io base

| Signal | Result |
| --- | --- |
| Install files | 94 |
| Source 2.8.0 files | 306 |
| Git 2.5.0 files | 94 (same set as install) |
| Files only in install vs 2.8.0 | `references/docs/drawio-aesthetic-guide.md`, `references/docs/examples.md` (removed later; both match older git history) |
| Extra files vs git 2.5.0 | **none** |
| Exact byte match vs `97254d2` | 1 |
| CRLF/newline-only mismatch vs `97254d2` | 84 |
| Remaining content diffs vs `97254d2` | 9 files, **all match later git history still labeled 2.5.0** |

Content-diff history matches (newline-normalized):

- `SKILL.md` → `74987fa` (description slim; still `version: "2.5.0"`)
- schema, academic themes, design-system docs, `auto-layout.js`, `spec-to-drawio.js` + test → `55a9f07` (font/size system; still `version: "2.5.0"`)

Install `scripts/cli.js` help lists only `yaml, mermaid, csv, drawio`. Source 2.8.0 lists compose/code/config routes. That is the known capability fork (audit F1), not a private patch.

## Academic overlay

| Signal | Result |
| --- | --- |
| Extra files vs git 2.5.0 | **none** |
| CRLF-only vs `97254d2` | 18 |
| Remaining content diffs | 6 files, all match `74987fa` or `55a9f07` |

## Junctions before refresh

- `.agents/skills/drawio` and `drawio-academic-skills`: **real directories** (not reparse points)
- `.claude/skills/drawio` and `drawio-academic-skills`: **junctions** onto those `.agents` directories

## Why this is not a pause

Unique customization would be install-only files or bytes that are **not** in this repo’s 2.5.0-era git history. None found. The copy is an outdated 2.5.0 working tree (release plus immediately following 2.5.0 commits), with Windows line endings.
