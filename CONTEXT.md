# Draw.io Skills

This context defines the product language for the Draw.io skill family: a shared diagram-production base plus specializations that add audience-specific guidance.

## Language

**Draw.io Base Skill**:
The general-purpose Draw.io skill that owns the shared diagram authoring language, validation expectations, and artifact vocabulary.
_Avoid_: core fork, bottom skill, copied shared skill

**Academic Overlay**:
A paper-first specialization that adds publication vocabulary, defaults, and quality gates while depending on the Draw.io Base Skill for shared diagram production concepts.
_Avoid_: academic fork, copied academic skill, standalone academic bundle

**Canonical Artifact Bundle**:
The editable result set that keeps the Draw.io diagram, normalized specification, and architecture sidecar aligned for repeatable edits.
_Avoid_: random outputs, generated files, one-off export

**Publication Figure**:
A diagram intended for a paper, thesis, manuscript, journal article, or IEEE-style technical document.
_Avoid_: academic diagram, fancy diagram

**Desktop-Enhanced Export**:
An export that uses draw.io Desktop to produce formats or embedded artifacts beyond the local offline renderer.
_Avoid_: desktop-first authoring, source-of-truth export

**Live Refinement Backend**:
An optional browser or MCP-backed capability provider for interactive refinement, not the source of truth for authoring.
_Avoid_: required backend, live source of truth

**Offline Authoring Path**:
The default authoring route where a normalized specification is rendered locally into the Canonical Artifact Bundle.
_Avoid_: fallback mode, non-live mode

**Academic MCP Exclusion**:
The boundary that Publication Figure work does not require or route through MCP/live backends, even though the Draw.io Base Skill may keep optional Live Refinement Backend support.
_Avoid_: academic MCP, paper live backend

**Skill Identity**:
The stable directory name and frontmatter `name` by which a skill is installed, discovered, and triggered.
_Avoid_: implementation name, package nickname

**Trigger Surface**:
The frontmatter description and user-intent vocabulary that decide whether a skill should be consulted.
_Avoid_: prompt body, internal routing table

**Base Evaluation Set**:
Tests and prompts that prove shared Draw.io Base Skill capabilities such as create, edit, replicate, import, export, and conversion.
_Avoid_: generic evals, all evals

**Academic Evaluation Set**:
Tests and prompts that prove Publication Figure behavior such as IEEE styling, paper bundles, thesis/Word export expectations, formula fidelity, and academic replication.
_Avoid_: copied evals, paper-ish evals

**Overlay Resource Boundary**:
The rule that an overlay keeps only specialization-specific guidance and evaluation assets while referencing the Draw.io Base Skill for shared scripts, references, themes, and examples.
_Avoid_: copied resource tree, embedded base skill

**YAML-First Authoring**:
The rule that new, edited, replicated, and converted diagrams are normalized into a YAML specification before rendering or export.
_Avoid_: XML-first authoring, manual XML as default

**Direct XML Exception**:
A narrow route for tiny one-off diagrams, CLI-unavailable handoff, or raw mxGraph control where writing XML directly is more appropriate than normal YAML-First Authoring.
_Avoid_: XML workflow, upstream default path

**Forced Font Setting**:
A diagram-level typography instruction that takes precedence over local text-family choices elsewhere in the specification when present.
_Avoid_: soft font hint, preferred font

**Script-Aware Font Resolution**:
The rule that visible text is assigned to a font family by its content category, such as formula text, CJK-bearing text, or other text, rather than by a single whole-diagram family alone.
_Avoid_: manual per-label font routing, whole-diagram hard font lock

**Text Surface**:
A distinct user-visible label-bearing area in a rendered diagram, such as node text, formula nodes, module titles, or edge labels.
_Avoid_: random text, implementation slot

**Font Policy**:
The complete diagram-level contract for how font families are chosen across Text Surfaces, including forced settings and fallback behavior.
_Avoid_: theme-only font, preset-only font
