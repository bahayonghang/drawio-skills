# Academic skill is an overlay on the Draw.io base skill

We decided that `drawio-academic-skills` should become an Academic Overlay that depends on the sibling Draw.io Base Skill instead of manually copying the base scripts, references, assets, and themes. This favors a single maintained base capability surface and prevents long-term drift; standalone academic packaging can be handled later by a generation or packaging step rather than by preserving a hand-maintained duplicate tree.

## Considered Options

- Keep `drawio-academic-skills` as a complete copied skill: rejected because the current tree already shows almost all shared files are duplicated, which makes drift likely.
- Make `drawio-academic-skills` a sibling overlay: accepted because it keeps the academic strategy separate from the shared diagram-production kernel.
