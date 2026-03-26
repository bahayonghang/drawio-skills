# SVG Converter API

The SVG converter turns draw.io `mxGraphModel` XML into standalone SVG markup without external runtime dependencies.

## Import

From the repository root:

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'
```

## `drawioToSvg(xmlString)`

Convert draw.io XML into standalone SVG.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `xmlString` | `string` | draw.io `mxGraphModel` XML |

### Returns

`string` containing the final SVG markup.

### Throws

`Error` when the input is empty, whitespace-only, or not a string.

## Features

- semantic shape rendering for the built-in node families
- marker support for common arrow types
- text styling from draw.io style strings
- embedded `data-drawio` payload for round-trip recovery

## Typical Use

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'

const svg = drawioToSvg(xmlString)
```

## Related

- [Export & Save](../guide/export.md)
- [CLI Tool](../guide/cli.md)
- [XML Format](./xml-format.md)
