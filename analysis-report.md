# Draw.io Skill Optimization Analysis Report

> **Author**: drawio-skills analysis
> **Date**: 2026-03-11
> **Scope**: Cross-compare 5 reference skills against current `skills/drawio` to identify optimization opportunities

---

## 1. Executive Summary

The current `skills/drawio` is the most architecturally mature skill among all 6 analyzed. Its Design System 2.0, YAML DSL, CLI toolchain, and structured workflow set it apart. However, 5 reference skills each possess unique strengths that the current skill lacks. This report identifies **7 key optimization areas** with prioritized recommendations.

**Key finding**: The current skill excels at *design system abstraction* and *workflow rigor*, but falls short in *edge rendering quality rules*, *stencil/icon library coverage*, *multi-format input support*, and *domain-specific template variety*.

---

## 2. Skill Overview Matrix

| # | Skill | Core Approach | Output | Domain Focus |
|---|-------|--------------|--------|-------------|
| A | **ai-drawio** | mxCell XML -> HTML iframe | HTML (browser preview) | General diagrams |
| B | **claude-drawio-plugin** | Direct .drawio XML | .drawio + .png + .arch.json | FPGA/HLS engineering |
| C | **drawio-skill** | Python script -> draw.io URL | HTML (clickable URL) | General diagrams |
| D | **skills/drawio (Markdown Viewer)** | drawio XML in code fences | drawio XML | General + stencil-heavy |
| E | **drawio-diagrams-enhanced** | Direct .drawio XML | .drawio file | PMP/PMBOK project mgmt |
| **F** | **Current (skills/drawio)** | **YAML DSL -> CLI -> .drawio** | **.drawio / .svg** | **General + academic** |

---

## 3. Dimension-by-Dimension Comparison

### 3.1 Design System & Theming

| Feature | A | B | C | D | E | **F (Ours)** |
|---------|---|---|---|---|---|:---:|
| Theme system | - | - | - | - | 3 color schemes | **6 built-in themes** |
| Design tokens | - | Semantic color palette | - | Preset palette | Risk/PMP colors | **Full token system ($primary, $text, etc.)** |
| 8px grid system | - | 10px grid | - | 10px grid | 10px grid | **8px grid** |
| Semantic shape mapping | - | FPGA component types | - | - | PMP shape types | **10+ semantic types** |
| Typed connectors | 1 arrow style | 5 arrow styles | - | 6 arrow styles | 6 connector styles | **5 semantic types** |
| Accessibility (WCAG) | - | - | - | - | - | **High-contrast theme** |
| Dark mode | - | - | URL param | - | - | **Built-in dark theme** |

**Assessment**: Current skill **leads** in this dimension. The Design System 2.0 with tokens, themes, and semantic mapping is unmatched.

**Gap**: None critical. Could absorb B's semantic color palette concept for domain-specific themes (e.g., FPGA, PMP).

---

### 3.2 Edge Quality & Routing Rules

| Feature | A | B | C | D | E | **F (Ours)** |
|---------|---|---|---|---|---|:---:|
| Connection point rules | Basic (4 points) | **7 BLOCKING rules + 7-step audit** | - | E1-E8 (8 rules) | Basic | Minimal |
| Corner prohibition | - | **Explicit (face-only)** | - | E7 rule | - | - |
| Waypoint vs non-waypoint distinction | - | **Rule 0a/0b explicit** | - | E4/E6 | - | - |
| Edge overlap prevention | - | **>= 30px separation** | - | E1 rule | - | - |
| Minimum last-segment length | - | **>= 30px** | - | - | - | - |
| Label-edge clearance | - | **>= 15px + no labelBgColor** | - | - | - | - |
| Straight-arrow alignment | - | **Center-y/center-x formula** | - | - | - | - |
| Layout improvement pass | - | **7-step post-generation audit** | - | Pre-gen checklist | - | Plan-to-Spec verification |
| Detached edges | - | **sourcePoint/targetPoint** | - | Waypoints | - | - |
| Cross-shape routing | - | **Segment-by-segment trace** | - | E4/E8 perimeter | - | - |

**Assessment**: Current skill has a **critical gap** here. Skill B (claude-drawio-plugin) has the most rigorous edge quality system in any drawio skill examined -- 7 blocking rules with precise pixel thresholds, plus a 7-step layout improvement audit. Skill D (Markdown Viewer) has a solid 8-rule system as well.

**Priority**: **HIGH** -- Edge quality directly affects visual correctness and professional appearance.

---

### 3.3 Stencil & Icon Library

| Feature | A | B | C | D | E | **F (Ours)** |
|---------|---|---|---|---|---|:---:|
| Built-in stencils | AWS (9 shapes) | FPGA-specific | - | **8,900+ across 48 categories** | Custom library URLs | Cloud provider icons (icons.md) |
| Cloud providers | AWS only | - | - | **AWS, Azure, GCP, Alibaba, IBM** | AWS, Azure, GCP | AWS, Azure, GCP (in icons.md) |
| Network devices | - | - | - | **Cisco, Cisco19, Cisco Safe** | Cisco, Arista | - |
| Stencil name validation | - | - | - | **S1: NEVER guess** | - | - |
| fillColor requirement docs | - | - | - | **Per-stencil marking** | - | - |
| Scaling formulas | - | - | - | **Width = W x (T/H)** | - | - |

**Assessment**: Current skill has a **significant gap**. Skill D provides 8,900+ stencils with rigorous name validation and scaling guidance -- critical for infrastructure, network, and cloud architecture diagrams.

**Priority**: **MEDIUM-HIGH** -- Stencil support dramatically expands diagram type coverage.

---

### 3.4 Multi-Format Input Support

| Feature | A | B | C | D | E | **F (Ours)** |
|---------|---|---|---|---|---|:---:|
| Raw XML input | Yes | Yes | Yes | Yes | Yes | Via YAML only |
| Mermaid input | - | - | **Yes (recommended default)** | - | - | - |
| CSV input | - | - | **Yes (org charts)** | - | - | - |
| YAML DSL | - | - | - | - | - | **Yes (primary)** |
| Natural language | Implied | - | - | - | - | **Yes (via workflow)** |
| URL fetch | - | - | **Yes (--url flag)** | - | - | - |

**Assessment**: Current skill's YAML DSL is a strength for complex diagrams, but Skill C's Mermaid support offers a **fast path for simple diagrams** that the current skill lacks.

**Priority**: **MEDIUM** -- Mermaid integration could dramatically reduce token usage for simple flowcharts.

---

### 3.5 Domain-Specific Templates & Patterns

| Domain | A | B | C | D | E | **F (Ours)** |
|--------|---|---|---|---|---|:---:|
| Software architecture | Basic | - | Basic | Full | Basic | **Examples provided** |
| FPGA/HLS | - | **4 diagram types, complete** | - | - | - | - |
| PMP/PMBOK | - | - | - | - | **WBS, PERT, RACI, Risk, Stakeholder, Gantt** | - |
| Cloud architecture | AWS basic | - | - | **AWS/Azure/GCP/Alibaba** | Cloud libraries | **Cloud icons** |
| Neural networks | - | - | - | - | - | **Example provided** |
| Business process (BPMN) | - | - | - | BPMN stencils | **BPMN support** | - |
| Wireframes/Mockups | - | - | - | Mockup stencils | Wireframe libraries | - |
| UML diagrams | - | - | - | - | UML support | - |

**Assessment**: Current skill provides examples but lacks formal **template library** for specialized domains. Skills B and E each dominate their niche.

**Priority**: **MEDIUM** -- Templates reduce generation time and improve consistency for common use cases.

---

### 3.6 Toolchain & Automation

| Feature | A | B | C | D | E | **F (Ours)** |
|---------|---|---|---|---|---|:---:|
| CLI tool | - | AppImage + xvfb-run | Python script | - | - | **Node.js CLI (cli.js)** |
| Schema validation | - | - | - | - | Checklist only | **JSON Schema** |
| YAML -> XML conversion | - | - | - | - | - | **spec-to-drawio.js** |
| SVG export | - | draw.io CLI | - | - | - | **drawio-to-svg.js** |
| PNG rendering | - | **AppImage CLI + Playwright fallback** | - | - | - | - |
| MCP integration | - | Playwright MCP | - | - | - | **draw.io MCP server** |
| Companion metadata | - | **.arch.json** | - | - | - | - |
| URL generation | - | - | **Python URL encoder** | - | - | - |
| Math/LaTeX support | - | - | - | - | - | **MathJax integration** |
| Security hardening | - | - | - | - | - | **Injection/traversal prevention** |
| Install scripts | - | Manual curl | - | - | - | **install.sh + install.bat** |

**Assessment**: Current skill has the **strongest toolchain** overall. Key gaps: no PNG rendering pipeline and no .arch.json companion metadata.

**Priority**: **LOW-MEDIUM** -- PNG rendering is a nice-to-have; .arch.json enables programmatic diagram consumption.

---

### 3.7 Workflow & User Experience

| Feature | A | B | C | D | E | **F (Ours)** |
|---------|---|---|---|---|---|:---:|
| Design consultation | - | - | - | - | - | **4-dimension questionnaire** |
| Structured text preview | - | - | - | - | - | **ASCII art + Design Summary** |
| Plan-to-Spec verification | - | - | - | - | - | **6-point checklist** |
| Complexity guardrails | - | - | - | Chunking at ~30 elements | ~20-25 shapes | **nodes>20 warn, >30 error** |
| Multi-phase generation | - | - | - | **P1-P6 phases** | - | **Steps 1-11** |
| Clean-up step | - | - | - | - | - | **YAML deletion** |
| Pre-generation checklist | - | - | - | **4-point checklist** | **10-point validation** | Implied in Step 4.5 |
| URL output safety | - | - | **NEVER retype URL rule** | - | - | - |
| Content-in-Components principle | - | - | - | - | - | **Explicit design principle** |

**Assessment**: Current skill **leads** in workflow sophistication. The Design Consultation -> ASCII Preview -> Verification pipeline is unique and valuable.

**Priority**: **LOW** -- Already strong. Minor refinements possible.

---

## 4. Current Skill Strengths (Retain & Protect)

These are competitive advantages that should be preserved:

1. **Design System 2.0** -- The only skill with a formal design token system, 6 themes, and semantic shape/connector mapping. This is the architectural backbone.

2. **YAML DSL Abstraction** -- Separates diagram *intent* (YAML) from *rendering* (XML), enabling validation, theming, and tooling. No other skill has this.

3. **Design Consultation Workflow** -- The 4-dimension questionnaire (audience, style, layout, complexity) produces intentional design choices rather than defaults.

4. **ASCII Preview + Verification** -- Two-stage user confirmation (text art -> spec check) catches errors before XML generation.

5. **Complexity Guardrails** -- Explicit node/edge/module limits with actionable suggestions (split, use hierarchical layout).

6. **Security Model** -- Injection resilience, path traversal prevention, and RunCommand scope limiting are unique among all skills.

7. **Math/LaTeX Support** -- Unique capability for academic diagrams with formula rendering.

8. **Cross-platform Toolchain** -- install.sh + install.bat, Node.js CLI, JSON Schema validation.

---

## 5. Optimization Recommendations

### 5.1 [HIGH] Integrate Edge Quality Rules from Skill B

**Source**: claude-drawio-plugin (Skill B) -- `references/best-practices.md`

**What to add**:

1. **7 Blocking Edge Quality Rules** adapted for general-purpose use:
   - Rule 0a: Explicit connection points for non-waypoint edges (exitX/exitY/entryX/entryY + Dx/Dy=0)
   - Rule 0b: No explicit connection points for waypoint edges
   - Rule 1: Face points only, corners forbidden (no exitX=1;exitY=1)
   - Rule 2: No arrow overlap (>= 30px parallel separation)
   - Rule 3: Minimum 30px last-segment length
   - Rule 4: No labelBackgroundColor on edges (use offset instead)
   - Rule 5: Container/title labels center-aligned
   - Rule 6: Straight-arrow alignment (center-y/center-x formulas)

2. **7-Step Layout Improvement Pass** as post-generation audit:
   - Edge-shape crossthrough detection
   - Connection point distribution (when 2+ edges share a face)
   - Route determinism (add waypoints in crowded areas)
   - Cross-stage simplification
   - Container tightening
   - Center alignment for straight connections
   - Label-edge clearance (>= 15px)

3. **4-Layer Z-Order Model**:
   - Layer 1: Stage borders/containers
   - Layer 2: Component shapes
   - Layer 3: Edges/arrows
   - Layer 4: Annotation labels, legends

**Where to add**: Create `references/docs/edge-quality-rules.md` and reference it from the SKILL.md Construction Checklist equivalent.

**Impact**: Eliminates the most common visual defects (overlapping arrows, corner stubs, label obscuring).

---

### 5.2 [HIGH] Add Edge Routing Rules from Skill D

**Source**: skills/drawio Markdown Viewer (Skill D) -- SKILL.md Edge Routing Rules

**What to add** (complementary to 5.1):

1. **E1: No Shared Paths** -- Multiple edges between same nodes use different exit/entry positions (exitY=0.3 and exitY=0.7)
2. **E2: Bidirectional Opposite Sides** -- A->B: exitX=1, entryX=0. B->A: exitX=0, entryX=1
3. **E4: Route Around Obstacles** -- 20-30px clearance, NEVER cross over shapes
4. **E5: Plan Layout First** -- Mental trace of each edge before generation
5. **E8: Diagonal Routing Principle** -- Route along perimeter, not through middle

**Where to add**: Merge into the edge quality rules document from 5.1.

**Impact**: Pre-generation planning reduces the need for post-generation fixes.

---

### 5.3 [MEDIUM-HIGH] Add Stencil Library Reference

**Source**: skills/drawio Markdown Viewer (Skill D) -- `stencils/` directory

**What to add**:

1. **Stencil Reference Index** -- Port the `stencils/README.md` (8,900+ stencils, 48 categories) as `references/docs/stencils.md`
2. **Key Rule: S1 -- NEVER guess stencil names** -- Always verify against reference
3. **fillColor requirement markers** -- Per-stencil documentation of which need explicit fillColor
4. **Scaling formula** -- `width = W x (T / H)` for proportional scaling
5. **Priority categories**: Start with the most commonly needed:
   - Cloud: aws4, azure, gcp2 (for architecture diagrams)
   - Network: cisco, cisco19 (for network topology)
   - Software: bpmn, flowchart, kubernetes (for engineering)

**Where to add**: `references/docs/stencils/` directory mirroring Skill D's structure, plus add stencil usage guidance to SKILL.md.

**Impact**: Enables professional infrastructure, cloud, and network diagrams with vendor-specific icons.

---

### 5.4 [MEDIUM] Add Mermaid Quick-Path Input

**Source**: drawio-skill (Skill C) -- `scripts/generate_drawio_url.py`

**What to add**:

1. **Mermaid input format** in CLI: `node cli.js --format mermaid input.mmd output.drawio`
2. **Format selection guide** in SKILL.md:
   - Mermaid: Simple flowcharts, sequences, ERDs (< 10 nodes, quick generation)
   - YAML DSL: Complex diagrams, precise positioning, themed output (full Design System)
   - Raw XML: Expert mode, maximum control
3. **Auto-format detection**: If input contains `graph TD` / `sequenceDiagram` etc., treat as Mermaid

**Where to add**: Extend `scripts/cli.js` with `--format` flag; add `references/docs/format-guide.md`.

**Impact**: 3-5x faster generation for simple diagrams; reduces token usage significantly.

---

### 5.5 [MEDIUM] Add Domain Template Library

**Source**: drawio-diagrams-enhanced (Skill E) for PMP; claude-drawio-plugin (Skill B) for FPGA

**What to add**:

1. **Template YAML files** in `references/templates/`:
   - `flowchart.yaml` -- Standard process flow
   - `architecture.yaml` -- Microservices/system architecture
   - `sequence.yaml` -- API call sequence
   - `er-diagram.yaml` -- Entity-relationship
   - `state-machine.yaml` -- FSM/state transitions
   - `wbs.yaml` -- Work breakdown structure (from Skill E)
   - `raci.yaml` -- RACI matrix (from Skill E)
   - `network-topology.yaml` -- Network diagram (from Skill D's stencils)

2. **Template meta-pattern** in each YAML:
   ```yaml
   # Template: WBS
   # Source: PMP/PMBOK methodology
   # Theme suggestion: tech-blue
   # Layout: hierarchical
   ```

3. **Domain-specific color semantics** (from Skill E):
   - PMP Process Groups: Initiating=green, Planning=blue, Executing=orange, M&C=yellow, Closing=purple
   - Risk levels: Low=green, Medium=yellow, High=orange, Critical=red

**Where to add**: `references/templates/` directory; reference from SKILL.md Step 5 (examples).

**Impact**: Faster generation for common use cases; ensures best practices per domain.

---

### 5.6 [MEDIUM-LOW] Add Pre-Generation Checklist

**Source**: skills/drawio Markdown Viewer (Skill D) -- Pre-Generation Checklist; drawio-diagrams-enhanced (Skill E) -- Validation Checklist

**What to add** (merge best of both into current workflow):

1. **Pre-generation** (before Step 7 YAML generation):
   - [ ] Do any edges cross over non-source/target shapes? -> Add waypoints
   - [ ] Do any two edges share the same path? -> Adjust exit/entry points
   - [ ] Are any connections at corners? -> Use face midpoints instead
   - [ ] Could rearranging shapes reduce crossings? -> Revise layout

2. **Post-generation** (enhance Step 4.5):
   - [ ] All IDs are unique
   - [ ] Root cells (0, 1) exist
   - [ ] All connectors have valid source/target
   - [ ] Swimlane children have correct parent references
   - [ ] Style strings properly formatted (semicolon-terminated)
   - [ ] Edge quality rules 0-6 satisfied
   - [ ] Z-order follows 4-layer model

**Where to add**: Enhance `references/workflows/create.md` Steps 4 and 4.5.

**Impact**: Catches layout issues before XML generation, reducing iteration cycles.

---

### 5.7 [LOW] Add Companion Metadata & PNG Pipeline

**Source**: claude-drawio-plugin (Skill B) -- .arch.json; ai-drawio (Skill A) -- browser rendering

**What to add**:

1. **.arch.json companion file** (from Skill B):
   - Machine-readable graph structure alongside visual .drawio
   - Fields: title, type, nodes (id, label, type), edges (source, target, label)
   - Enables downstream tooling (documentation generators, dependency analysis)

2. **PNG rendering pipeline** options:
   - Option A: draw.io Desktop CLI (`--export --format png --scale 2`) -- most reliable
   - Option B: Playwright MCP screenshot -- when CLI unavailable
   - Document both in `references/docs/rendering.md`

**Where to add**: Extend CLI to generate .arch.json; add rendering documentation.

**Impact**: Enables diagram consumption by other tools; provides visual verification.

---

## 6. Priority Matrix

| # | Optimization | Priority | Effort | Impact on Quality |
|---|-------------|----------|--------|------------------|
| 5.1 | Edge Quality Rules (from B) | **HIGH** | Medium | Visual correctness |
| 5.2 | Edge Routing Rules (from D) | **HIGH** | Low | Pre-generation planning |
| 5.3 | Stencil Library (from D) | **MEDIUM-HIGH** | Medium | Diagram type coverage |
| 5.4 | Mermaid Quick-Path (from C) | **MEDIUM** | Medium | Efficiency for simple diagrams |
| 5.5 | Domain Templates (from E+B) | **MEDIUM** | Low-Medium | Domain expertise |
| 5.6 | Enhanced Checklists (from D+E) | **MEDIUM-LOW** | Low | Error prevention |
| 5.7 | Metadata & PNG (from B+A) | **LOW** | Medium | Toolchain completeness |

### Suggested Implementation Order

```
Phase 1 (Edge Quality):    5.1 + 5.2 -- Fix the biggest visual quality gap
Phase 2 (Coverage):        5.3 + 5.5 -- Expand diagram type support
Phase 3 (Efficiency):      5.4 + 5.6 -- Improve generation speed and reliability
Phase 4 (Polish):          5.7       -- Complete the toolchain
```

---

## 7. Feature Uniqueness Map

Features that exist **only** in one skill -- potential for unique competitive advantage if absorbed:

| Unique Feature | Source Skill | Value for Current Skill |
|---------------|-------------|------------------------|
| `.arch.json` companion files | B (claude-drawio-plugin) | Machine-readable diagram metadata |
| Waypoint face separation rule (>= 30px perpendicular) | B | Precise multi-edge routing |
| Pipeline Register Connection Rule | B | FPGA-specific, low priority |
| `S1: NEVER guess stencil names` | D (Markdown Viewer) | Critical stencil safety rule |
| Multi-phase XML chunking (P6) | D | Large diagram generation |
| Mermaid/CSV input formats | C (drawio-skill) | Simple diagram fast-path |
| Privacy-friendly URL (hash fragment) | C | Client-side only data |
| PMP/PMBOK color coding system | E (enhanced) | Project management diagrams |
| Custom library URL loading | E | Extend shape vocabulary |
| Animated connectors (`flowAnimation=1`) | A (ai-drawio) | Presentation emphasis |
| **Design Consultation questionnaire** | **F (Current)** | **Unique -- no other skill has this** |
| **ASCII preview + Design Summary** | **F (Current)** | **Unique -- visual confirmation before generation** |
| **YAML DSL with JSON Schema validation** | **F (Current)** | **Unique -- structured, validated input** |
| **Security hardening (injection/traversal)** | **F (Current)** | **Unique -- enterprise-ready safety** |
| **LaTeX/MathJax in diagrams** | **F (Current)** | **Unique -- academic diagram support** |
| **High-contrast accessible theme** | **F (Current)** | **Unique -- WCAG AA compliance** |

---

## 8. Conclusion

The current `skills/drawio` is positioned as the **most architecturally advanced** drawio skill analyzed, with unique strengths in design system abstraction, workflow rigor, and security. However, it has a **critical gap in edge quality rules** (the most impactful visual quality factor) and **notable gaps in stencil coverage** and **domain templates**.

The recommended optimization strategy is:

1. **Immediately** absorb edge quality rules from Skills B and D (Phase 1) -- this will have the single largest impact on diagram visual quality
2. **Next** expand stencil and template coverage (Phase 2) -- this broadens the range of diagrams the skill can produce professionally
3. **Then** add Mermaid fast-path and enhanced checklists (Phase 3) -- this improves efficiency and reliability
4. **Finally** complete the toolchain with metadata and rendering (Phase 4) -- this polishes the developer experience

The end result would be a skill that combines:
- **Current skill's** Design System + YAML DSL + Workflow rigor + Security
- **Skill B's** Edge quality precision
- **Skill D's** Stencil breadth
- **Skill C's** Mermaid efficiency
- **Skill E's** Domain template richness

This would create a comprehensive, engineering-grade drawio skill with no significant gaps across any dimension.

---

*End of Report*
