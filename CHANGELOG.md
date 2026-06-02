# Changelog

All notable changes to this project are documented here.
Format follows Keep a Changelog; this project uses date-based entries.

## [Unreleased]

### Added

- Root `LICENSE` (MIT) for the repository.
- A dedicated `network-topology` task route in the Base Skill, plus an `ieee-network-diagrams` reference highlight, so base-side network and infrastructure diagrams reach that guide.
- `.prettierrc` matching the committed JS style (single quotes, no semicolons, 120-column width, no trailing commas), with a markdown override so prose and YAML frontmatter quoting are left untouched.

### Changed

- Split the Draw.io skill into a shared **Base Skill** (`skills/drawio`) and a thin **Academic Overlay** (`skills/drawio-academic-skills`); the overlay now depends on the sibling base instead of vendoring base runtime, references, themes, and schemas.
- Tightened the overlay boundary: removed duplicated reference docs, relocated the generic `style-extraction` guide and the vendored upstream pure-XML reference back into the base, and hardened the boundary test into a structural invariant.
- Rewrote both skill descriptions to remove the academic-keyword overlap so publication requests route to the overlay and general diagrams route to the base.
- Unified the project license to **MIT** across `package.json`, `package-lock.json`, the Base Skill `SKILL.md`, and the root README badges and text (the overlay was already MIT).
- Completed the Base Skill frontmatter (`homepage`, `compatibility`, `platforms`) and added an `argument-hint` to the overlay so the two sibling skills stay symmetric.
- Normalized existing JavaScript formatting with Prettier (pure formatting; no behavior change, tests unchanged).
- Fixed `AGENTS.md` to reference `references/workflows/` and to describe the Academic Overlay.

### Note

- The Academic Overlay is re-versioned to `0.1.0` as a reborn thin overlay (not a regression). All shared diagram-production capability lives in the Base Skill (repo version `2.2.0`); the overlay carries only publication policy.
