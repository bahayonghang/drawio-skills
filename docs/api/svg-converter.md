# SVG Converter API

The SVG converter transforms draw.io mxGraphModel XML into standalone SVG markup. It has zero external dependencies, using only Node.js built-ins.

## Import

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'
```

## `drawioToSvg(xmlString)`

Convert draw.io XML to standalone SVG.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `xmlString` | `string` | draw.io mxGraphModel XML content |

### Returns

`string` — Complete SVG markup including `<svg>` wrapper, marker definitions, shapes, edges, and text labels.

### Throws

`Error` — If input is empty, not a string, or whitespace-only.

### Example

```javascript
import { drawioToSvg } from './src/svg/drawio-to-svg.js'

const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Hello" style="rounded=1;fillColor=#DBEAFE;strokeColor=#2563EB;"
            vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const svg = drawioToSvg(xml)
// Returns SVG with a blue rounded rectangle containing "Hello"
```

## Supported Shapes

| Shape | Style Trigger | SVG Element |
|-------|---------------|-------------|
| Rectangle | Default | `<rect>` |
| Rounded Rectangle | `rounded=1` | `<rect rx="...">` |
| Stadium/Pill | `rounded=1;arcSize>=50` | `<rect rx="height/2">` |
| Cylinder | `shape=cylinder3` | `<rect>` + `<ellipse>` × 2 |
| Diamond | `rhombus` | `<polygon>` |
| Ellipse | `ellipse` | `<ellipse>` |
| Parallelogram | `shape=parallelogram` | `<polygon>` |
| Document | `shape=document` | `<path>` with wavy bottom |
| Cloud | `shape=cloud` | `<path>` with cloud arcs |

## Arrow Markers

| Type | ID | Description |
|------|----|-------------|
| Block | `arrow-block` | Filled triangle |
| Open | `arrow-open` | Chevron (unfilled) |
| Classic | `arrow-classic` | Filled arrow with notch |
| Diamond | `arrow-diamond` | Filled diamond |

Markers are referenced via `marker-start` and `marker-end` attributes on edge `<line>` elements.

## Style Properties

The converter reads these style properties from mxCell elements:

| Property | Default | Description |
|----------|---------|-------------|
| `fillColor` | `#FFFFFF` | Shape fill color |
| `strokeColor` | `#000000` | Shape/edge stroke color |
| `strokeWidth` | `1` | Stroke width in pixels |
| `fontColor` | `#000000` | Text color |
| `fontSize` | `12` (vertex) / `11` (edge) | Font size |
| `fontFamily` | `sans-serif` | Font family |
| `dashed` | `0` | Enable dashed stroke |
| `dashPattern` | `3 3` | Dash pattern |
| `endArrow` | `classic` | End arrow type |
| `startArrow` | (none) | Start arrow type |

## Data Embedding

The generated SVG includes a `data-drawio` attribute on the root `<svg>` element containing the original draw.io XML encoded as base64:

```html
<svg xmlns="http://www.w3.org/2000/svg"
     width="800" height="600"
     viewBox="0 0 800 600"
     data-drawio="PG14R3JhcGhNb2RlbC4uLg==">
  ...
</svg>
```

This enables round-trip editing: the SVG can be re-imported into draw.io, which reads the `data-drawio` attribute to restore the original diagram.

## Related

- [Export & Save](../guide/export.md) - Export options
- [CLI Tool](../guide/cli.md) - Command-line conversion
- [XML Format](./xml-format.md) - draw.io XML structure
