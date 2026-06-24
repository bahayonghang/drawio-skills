# Design Tokens

Design tokens are the foundational building blocks of the Draw.io Design System. They define consistent values for colors, spacing, typography, and other visual properties.

## Overview

The design token system follows a hierarchical structure:

```
Global Tokens → Semantic Tokens → Component Tokens
```

- **Global Tokens**: Raw values (colors, sizes)
- **Semantic Tokens**: Purpose-based references (primary, text, border)
- **Component Tokens**: Applied to specific elements (node.fillColor, connector.strokeWidth)

---

## Color Tokens

### Core Palette

| Token          | Description      | Tech Blue | Academic  | Nature    | Dark      |
| -------------- | ---------------- | --------- | --------- | --------- | --------- |
| `primary`      | Main brand color | `#2563EB` | `#1E1E1E` | `#059669` | `#60A5FA` |
| `primaryLight` | Light variant    | `#DBEAFE` | `#F5F5F5` | `#D1FAE5` | `#1E3A5F` |
| `secondary`    | Supporting color | `#059669` | `#4B4B4B` | `#84CC16` | `#34D399` |
| `accent`       | Highlight color  | `#7C3AED` | `#6B6B6B` | `#0D9488` | `#A78BFA` |

### Semantic Colors

| Token          | Purpose            | Usage              |
| -------------- | ------------------ | ------------------ |
| `background`   | Canvas background  | Diagram canvas     |
| `surface`      | Container fill     | Modules, groups    |
| `text`         | Primary text       | Node labels        |
| `textMuted`    | Secondary text     | Edge labels, hints |
| `border`       | Default borders    | Node strokes       |
| `borderStrong` | Emphasized borders | Active elements    |

### Status Colors

| Token     | Meaning                    |
| --------- | -------------------------- |
| `success` | Positive state, completion |
| `warning` | Caution, attention needed  |
| `error`   | Error, failure state       |
| `info`    | Informational content      |

---

## Spacing Tokens

Based on an **8px grid system** for consistent alignment.

### Scale

| Token | Value | Usage                      |
| ----- | ----- | -------------------------- |
| `xs`  | 4px   | Minimal gaps, icon padding |
| `sm`  | 8px   | Tight spacing              |
| `md`  | 16px  | Standard spacing           |
| `lg`  | 24px  | Section gaps               |
| `xl`  | 32px  | **Node minimum margin**    |
| `2xl` | 40px  | Large gaps                 |
| `3xl` | 48px  | Spacious layouts           |
| `4xl` | 64px  | Module padding             |
| `5xl` | 80px  | Major sections             |

### Application Rules

1. **Node positions**: Must snap to 8px grid
2. **Node margins**: Minimum 32px between nodes
3. **Container padding**: 16px or 24px
4. **Canvas padding**: 32px from edge

---

## Typography Tokens

### Font Families

| Token       | Stack                                | Usage               |
| ----------- | ------------------------------------ | ------------------- |
| `primary`   | Inter, Roboto, system-ui, sans-serif | Node labels, titles |
| `monospace` | JetBrains Mono, Fira Code, Consolas  | Code, technical IDs |
| `formula`   | Latin Modern, STIX Two Math, serif   | LaTeX formulas      |

### Font Sizes

| Token | Size | Usage                  |
| ----- | ---- | ---------------------- |
| `xs`  | 10px | Tiny annotations       |
| `sm`  | 11px | Edge labels            |
| `md`  | 13px | **Default node label** |
| `lg`  | 14px | Emphasized labels      |
| `xl`  | 16px | Titles, headings       |
| `2xl` | 20px | Diagram title          |

### Font Weights

| Token      | Value | Usage            |
| ---------- | ----- | ---------------- |
| `normal`   | 400   | Body text        |
| `medium`   | 500   | Slight emphasis  |
| `semibold` | 600   | Labels, headings |
| `bold`     | 700   | Strong emphasis  |

---

## Border Radius Tokens

| Token  | Value  | Usage                          |
| ------ | ------ | ------------------------------ |
| `none` | 0px    | Sharp corners (Academic theme) |
| `sm`   | 4px    | Subtle rounding                |
| `md`   | 8px    | **Default node corners**       |
| `lg`   | 12px   | Modules, containers            |
| `full` | 9999px | Circles, pills                 |

---

## Node Size Presets

Standard node dimensions (width × height):

| Size     | Dimensions   | Usage                |
| -------- | ------------ | -------------------- |
| `small`  | 80 × 40 px   | Compact nodes, icons |
| `medium` | 120 × 60 px  | **Default size**     |
| `large`  | 160 × 80 px  | Emphasized nodes     |
| `xl`     | 200 × 100 px | Major components     |

---

## Text & Label Styling

These rules apply to standalone text boxes, callouts, captions, legends, and annotation labels — the elements usually hand-placed during `edit`, `replicate`, and academic-overlay work, where there is no automatic styling to fall back on.

### Transparent by default (no white box)

Text and labels use `fillColor=none` and `labelBackgroundColor=none`.

A white fill or white label background paints an opaque rectangle around the text. On a colored or busy figure that box occludes connectors and neighbors, fights the palette, and makes the diagram look pasted together — readers want the text, not its container. draw.io's default `labelBackgroundColor` is already `none`; the failure mode is _adding_ a white one for perceived legibility.

If text genuinely needs separation from a noisy background, treat it as a deliberate exception and note why:

- First try cheaper fixes: a darker/bolder `fontColor`, a thin text stroke, or moving the label into whitespace.
- Only if those are insufficient, use a restrained tint or a semi-transparent backing (for example `fillColor=#F8FAFC;opacity=70` or a themed light surface) — never a hard `#FFFFFF` block.

### Size to content, not to the container

A text/label box should be just wider than its longest line (plus small horizontal padding), never stretched to match a parent container or a source-image region.

An oversized text box overlaps neighbors and creates a large invisible hit area, so selecting, moving, and transforming the element — and the shapes near it — becomes awkward. A content-fitted box stays an independent, draggable object.

Width estimate when you must set `bounds`/`size` by hand:

- Per-line width ≈ Σ glyph widths, with Latin/ASCII ≈ `0.6 × fontSize` and CJK full-width ≈ `1.05 × fontSize`.
- `width ≈ ceil(longest line) + 2 × horizontalPadding` (padding ≈ 8–12px), with a sensible minimum (~48px).
- For multi-line text, size to the longest line; `height ≈ lines × fontSize × 1.4 + 2 × verticalPadding`.

Prefer letting the converter size text automatically (omit `size`/`bounds` for generated text nodes); reserve explicit `bounds` for high-fidelity replication where exact coordinates matter, and still keep the box just wider than the text.

---

## Shadow Tokens

For container emphasis (optional, not all themes use shadows):

| Token  | Value                 | Usage             |
| ------ | --------------------- | ----------------- |
| `none` | none                  | Flat design       |
| `sm`   | 0 1px 2px rgba(...)   | Subtle elevation  |
| `md`   | 0 4px 6px rgba(...)   | Cards, panels     |
| `lg`   | 0 10px 15px rgba(...) | Floating elements |

---

## Usage in Specifications

Reference tokens in YAML specifications using the `$` prefix:

```yaml
meta:
  theme: tech-blue

nodes:
  - id: api
    label: API Gateway
    style:
      fillColor: $primaryLight # Resolves to #DBEAFE
      strokeColor: $primary # Resolves to #2563EB
```

---

## Token Resolution

When generating draw.io XML, tokens are resolved in this order:

1. **Explicit style** in node/edge definition
2. **Semantic type** defaults (e.g., database → cylinder shape)
3. **Theme defaults** (e.g., node.default.fillColor)
4. **System defaults** (hardcoded fallbacks)

Example resolution:

```
Node "User DB" with type: database
→ Check explicit style: none
→ Check semantic type: database → cylinder shape, theme.node.database colors
→ Apply: fillColor=#D1FAE5, strokeColor=#059669, shape=cylinder
```
