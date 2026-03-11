# Color Scheme Selection Guide

A guide to help you choose the most suitable theme for your diagram in 3 steps.
(配色方案选择指南 — 帮助你在 3 步内为图表选出最合适的主题。)

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

## Theme Quick Reference

| Theme | Primary | Secondary | Background | Best For |
|-------|---------|-----------|------------|----------|
| **tech-blue** | `#2563EB` | `#059669` | `#FFFFFF` | Architecture, DevOps, system design, API docs |
| **academic-color** | `#2563EB` | `#059669` | `#FFFFFF` | Paper figures, research reports (color print), deep learning diagrams |
| **academic** | `#1E1E1E` | `#1E1E1E` | `#FFFFFF` | IEEE papers, grayscale print, formal publications |
| **dark** | `#60A5FA` | `#34D399` | `#0F172A` | Presentation slides, screen display, dark mode |
| **nature** | `#059669` | `#84CC16` | `#FFFFFF` | Lifecycle flows, environmental systems, green themes |

---

## Semantic Color Meanings (Cross-theme Convention)

Different node types follow a unified semantic meaning across themes, even if the specific colors differ:
(不同节点类型在各主题中遵循统一的语义含义，即便具体颜色有差异。)

| Node Type | Semantic Meaning | tech-blue Fill | Description |
|-----------|-----------------|----------------|-------------|
| `service` | Main flow / API processing | `#DBEAFE` (light blue) | Primary processing unit, most common |
| `database` | Persistent storage | `#D1FAE5` (light green) | Data persistence layer, distinct from services |
| `decision` | Conditional / Branch | `#FEF3C7` (light amber) | Diamond shape, key flow control point |
| `queue` | Async / Message queue | `#EDE9FE` (light purple) | Decoupled communication, async processing |
| `terminal` | Flow start / end | `#F1F5F9` (light gray) | Marks flow boundaries |
| `user` | External actor / Role | `#E0F2FE` (light sky blue) | Person or external system, distinct from service |
| `document` | File / Report | `#FFFBEB` (light yellow) | Output artifact, not a processing unit |
| `cloud` | External network / SaaS | `#F0FDF4` (light green) | Third-party or network services |

---

## Color Override Rules

### Prefer Theme Tokens (Strongly Recommended)

Tokens are automatically compatible with theme switching; hardcoded hex values break when themes change:
(Token 与主题切换自动兼容，硬编码 hex 会在切换主题后失效。)

```yaml
# Recommended: Use tokens
nodes:
  - id: api
    style:
      fillColor: $primaryLight      # Adjusts automatically with theme
      strokeColor: $primary
      fontColor: $text

# Avoid: Hardcoded hex
nodes:
  - id: api
    style:
      fillColor: "#DBEAFE"          # Breaks when switching to dark theme
```

### Complete Token List

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

| Connector Type | Line Style | Recommended Use |
|---------------|------------|-----------------|
| `primary` | Solid 2px, filled arrow | Main flow, default choice |
| `data` | Dashed 2px (6 4), filled arrow | Data transfer, async communication |
| `optional` | Dotted 1px (2 2), open arrow | Optional path, fallback logic |
| `dependency` | Solid 1px, diamond arrow | Dependency, composition |
| `bidirectional` | Solid 1.5px, no arrow | Bidirectional association, communication channel |

> Connector colors automatically inherit `$text` (dark); no manual override needed unless special semantic annotation is required.
> (连接线颜色自动继承 `$text`（深色），无需手动设置除非有特殊语义标注需求。)

---

## Color Consistency Checklist

Before generating a YAML spec, verify each item:
(生成 YAML spec 前，请逐项确认。)

```
[] Theme explicitly selected (meta.theme is set)
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

| Mistake | Problem | Fix |
|---------|---------|-----|
| All nodes same color | Cannot distinguish node types | Use semantic type auto-coloring; don't manually unify |
| Decision node with blue fill | Confused with service nodes | Use `$accentLight` (amber/yellow) fill instead |
| Black text on dark theme | Insufficient contrast | Add `fontColor: $textInverse` |
| All hardcoded hex values | Styles break on theme switch | Use token references instead |
| Colored connectors | Visual noise, distracting | Only override connector color for special semantics |
