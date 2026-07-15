# Theme and Palette Selection Guide

A guide to choose diagram structure styling and category colors independently.
(主题与配色组选择指南 — 分别决定排版风格与类别颜色。)

---

## Decision Tree (3 Steps to Choose a Theme)

```
Step 1: Final use case? (最终用途？)
  ├── Print / Publication (印刷 / 出版)
  │   ├── Color print / Digital PDF → academic-color ⭐
  │   └── Strict grayscale (IEEE submission) → academic
  └── Digital / Screen display → Continue to Step 2

Step 2: Target audience? (目标受众？)
  ├── Technical / Engineering → tech-blue (default)
  ├── Academic / Research → academic-color
  ├── Presentation / Slides → dark
  └── Environmental / Ecology → nature

Step 3: Special requirements? (特殊要求？)
  ├── High contrast (accessibility) → academic or tech-blue
  ├── Dark background projector → dark
  └── Other → Use Step 2 result
```

---

## Theme and Palette Are Independent

Theme and palette are independent, orthogonal dimensions:

- `meta.theme` owns typography, spacing, shape treatment, connector line styles, modules, and canvas.
- `meta.palette` optionally replaces semantic/category fill, stroke, text, and default connector colors.
- Content-neutral `text` and `formula` nodes always keep theme styling; a palette never recolors them.
- Omitting `meta.palette` keeps existing theme behavior unchanged.

```yaml
meta:
  theme: academic
  palette: okabe-ito
```

This combines academic typography and line treatment with Okabe-Ito category colors. Switching only the palette does not change fonts, spacing, shapes, or routing.

### Palette Decision Tree

```text
Was a palette explicitly named?
  yes -> apply it directly; do not ask
  no  -> does the request mention palette/color choice, colorblind safety,
         grayscale or black-and-white printing, or multi-category distinction?
           yes -> ask once with 3-4 relevant palette choices
           no  -> omit meta.palette and keep the theme defaults

Replicate route?
  yes -> preserve source colors and skip palette selection unless the user
         explicitly asks to normalize or replace the colors
```

Use the complete metadata-backed catalog and previews in [`references/examples/palettes/README.md`](../../examples/palettes/README.md). Common starting points:

| Need                                         | Recommended palette |
| -------------------------------------------- | ------------------- |
| Accessible academic color                    | `okabe-ito`         |
| IEEE or thesis black-and-white print         | `ieee-bw`           |
| Camera-ready color with grayscale separation | `tol-high-contrast` |
| C4/software architecture                     | `c4-blue`           |
| AWS/cloud architecture                       | `cloud-aws`         |
| Familiar draw.io appearance                  | `drawio-classic`    |

### Add a Custom Palette

Copy one bundled JSON definition from `assets/palettes/`, keep the single ordered `entries[]` contract, validate it, and save it as `~/.drawio-skill/palettes/<name>.json`. No code change is required. User definitions override bundled palettes with the same name and emit an info diagnostic. Explicit unknown, malformed, or invalid palettes fail and list available names; they never silently fall back.

---

## Theme Quick Reference

| Theme              | Primary   | Secondary | Background | Best For                                                              |
| ------------------ | --------- | --------- | ---------- | --------------------------------------------------------------------- |
| **tech-blue**      | `#2563EB` | `#059669` | `#FFFFFF`  | Architecture, DevOps, system design, API docs                         |
| **academic-color** | `#2563EB` | `#059669` | `#FFFFFF`  | Paper figures, research reports (color print), deep learning diagrams |
| **academic**       | `#1E1E1E` | `#1E1E1E` | `#FFFFFF`  | IEEE papers, grayscale print, formal publications                     |
| **dark**           | `#60A5FA` | `#34D399` | `#0F172A`  | Presentation slides, screen display, dark mode                        |
| **nature**         | `#059669` | `#84CC16` | `#FFFFFF`  | Lifecycle flows, environmental systems, green themes                  |

---

## Semantic Color Meanings (Cross-theme Convention)

Different node types follow a unified semantic meaning across themes, even if the specific colors differ:
(不同节点类型在各主题中遵循统一的语义含义，即便具体颜色有差异。)

| Node Type  | Semantic Meaning           | tech-blue Fill             | Description                                      |
| ---------- | -------------------------- | -------------------------- | ------------------------------------------------ |
| `service`  | Main flow / API processing | `#DBEAFE` (light blue)     | Primary processing unit, most common             |
| `database` | Persistent storage         | `#D1FAE5` (light green)    | Data persistence layer, distinct from services   |
| `decision` | Conditional / Branch       | `#FEF3C7` (light amber)    | Diamond shape, key flow control point            |
| `queue`    | Async / Message queue      | `#EDE9FE` (light purple)   | Decoupled communication, async processing        |
| `terminal` | Flow start / end           | `#F1F5F9` (light gray)     | Marks flow boundaries                            |
| `user`     | External actor / Role      | `#E0F2FE` (light sky blue) | Person or external system, distinct from service |
| `document` | File / Report              | `#FFFBEB` (light yellow)   | Output artifact, not a processing unit           |
| `cloud`    | External network / SaaS    | `#F0FDF4` (light green)    | Third-party or network services                  |

### Agentic / LLM node colors (tech-blue defaults)

| Node Type      | Semantic Meaning                  | tech-blue Fill     | Stroke    |
| -------------- | --------------------------------- | ------------------ | --------- |
| `llm`          | LLM / foundation model            | `#EDE9FE` (violet) | `#7C3AED` |
| `agent`        | Agent / orchestrator              | `#DBEAFE` (blue)   | `#2563EB` |
| `vector_store` | Vector / embedding store          | `#D1FAE5` (green)  | `#059669` |
| `memory`       | Short-term memory (dashed border) | `#FEF9C3` (amber)  | `#CA8A04` |
| `tool`         | Tool / function                   | `#F1F5F9` (slate)  | `#475569` |
| `gateway`      | API gateway                       | `#FFEDD5` (orange) | `#EA580C` |

These are default/light-theme values. In arch-dark and academic the theme node palette
overrides them (arch-dark maps to its cyan/emerald/violet roles; academic to grayscale).
The same concept never carries two competing colors in one theme.

---

## Color Override Rules

### Restraint for Infrastructure Diagrams

Keep background fills to a small, intentional set. Use semantic colors for roles and neutral containers for hierarchy; provider icon colors remain their own identity and should not become a second competing role palette. A legend is required whenever color or line style carries meaning that cannot be read from labels alone.

### Prefer Theme Tokens (Strongly Recommended)

Tokens are automatically compatible with theme switching; hardcoded hex values break when themes change:
(Token 与主题切换自动兼容，硬编码 hex 会在切换主题后失效。)

```yaml
# Recommended: Use tokens
nodes:
  - id: api
    style:
      fillColor: $primaryLight # Adjusts automatically with theme
      strokeColor: $primary
      fontColor: $text

# Avoid: Hardcoded hex
nodes:
  - id: api
    style:
      fillColor: "#DBEAFE" # Breaks when switching to dark theme
```

### Palette Token List

With `meta.palette` selected, category entries are also available as 1-based tokens:

```text
$paletteN         entry N base color
$paletteN-fill    entry N materialized fill
$paletteN-stroke  entry N materialized stroke
$paletteN-text    entry N materialized text color
```

An out-of-range palette token warns and falls back to the theme primary color. Palette tokens are invalid when `meta.palette` is absent.

### Theme Token List

```
Base Colors:
  $primary          Primary color (blue/green/dark, varies by theme)
  $primaryLight     Light variant of primary (recommended for fills)
  $secondary        Secondary color (database nodes default)
  $secondaryLight   Light variant of secondary
  $accent           Accent color (decision nodes default)
  $accentLight      Light variant of accent
  $background       Canvas background color
  $surface          Card/module background color
  $surfaceAlt       Alternate background color

Text & Borders:
  $text             Primary text color
  $textMuted        Secondary text color
  $textInverse      Inverse text (for dark backgrounds)
  $border           Standard border color
  $borderStrong     Bold border color

Semantic Colors:
  $success          Success state (green)
  $successLight     Light success
  $warning          Warning state (yellow/orange)
  $warningLight     Light warning
  $error            Error state (red)
  $errorLight       Light error
  $info             Info hint (blue)
  $infoLight        Light info
```

---

## Connector Color Rules

| Connector Type  | Line Style                                        | Recommended Use                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------ |
| `primary`       | Solid 2px, filled arrow                           | Main flow, default choice                        |
| `data`          | Dashed 2px (6 4), filled arrow                    | Data transfer, async communication               |
| `optional`      | Dotted 1px (2 2), open arrow                      | Optional path, fallback logic                    |
| `dependency`    | Solid 1px, diamond arrow                          | Dependency, composition                          |
| `bidirectional` | Solid 1.5px, no arrow                             | Bidirectional association, communication channel |
| `control`       | Solid 1.5px, filled arrow, orange `#EA580C`       | Trigger / control signal (agentic)               |
| `memory_read`   | Solid 1.5px, filled arrow, green `#059669`        | Read from store / memory                         |
| `memory_write`  | Dashed 1.5px (5 3), filled arrow, green `#059669` | Write to store / memory                          |
| `async`         | Dashed 1.5px (4 2), open arrow, gray `#6B7280`    | Async / non-blocking event                       |
| `feedback`      | Solid 1.5px, filled arrow, violet `#7C3AED`       | Iterative feedback loop                          |

> Connector colors automatically inherit `$text` (dark); no manual override needed unless special semantic annotation is required.
> (连接线颜色自动继承 `$text`（深色），无需手动设置除非有特殊语义标注需求。)
>
> **Theme priority**: The agentic edge colors above are default/light values. Precedence is
> **explicit edge `style` > theme token > type default** — within arch-dark and academic these
> types remap to the theme's own palette (arch-dark keeps its role colors; academic falls back
> to grayscale + dash). When ≥2 arrow semantics appear, add a `meta.legend` (compact single
> text-node form); see [connectors.md](connectors.md).

---

## Color Consistency Checklist

Before generating a YAML spec, verify each item:
(生成 YAML spec 前，请逐项确认。)

```
[] Theme explicitly selected (meta.theme is set)
[] Palette selected only when the request needs one (meta.palette is optional)
[] Selected palette safety flags match colorblind and print requirements
[] All custom fillColor uses tokens or valid hex (#RGB or #RRGGBB)
[] strokeColor and fillColor use matching deep/light token pairs
   e.g.: fillColor: $primaryLight + strokeColor: $primary
   e.g.: fillColor: $primaryLight + strokeColor: $error (semantic mismatch)
[] Decision nodes use $accentLight / $accent for visual distinction from main flow
[] Connector colors not overridden, keeping default $text color
[] In dark theme, confirm fontColor uses $textInverse for adequate contrast
[] Module backgrounds use $surface instead of $background (layer distinction)
```

---

## Common Color Mistakes & Fixes

| Mistake                      | Problem                                                     | Fix                                                   |
| ---------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| All nodes same color         | Cannot distinguish node types                               | Use semantic type auto-coloring; don't manually unify |
| Decision node with blue fill | Confused with service nodes                                 | Use `$accentLight` (amber/yellow) fill instead        |
| Black text on dark theme     | Insufficient contrast                                       | Add `fontColor: $textInverse`                         |
| All hardcoded hex values     | Styles break on theme switch                                | Use token references instead                          |
| Colored connectors           | Visual noise, distracting                                   | Only override connector color for special semantics   |
| Treating theme as a palette  | Changing colors also changes layout/typography expectations | Keep theme and `meta.palette` as separate choices     |
