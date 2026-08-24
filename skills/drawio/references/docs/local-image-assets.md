# Local Image Assets

Canonical YAML can register local PNG/JPEG files and place them as atomic
`shape=image` nodes. The `.drawio` file is self-contained (inline data URIs).
Paths stay relative to the **asset root** (`process.cwd()` or `--asset-root`),
never to the spec file.

This document is the recipe pointed to by `ASSET_SIZE` diagnostics.

## YAML

```yaml
assets:
  chimney:
    path: ref/plans/chapter2/materials-render/chimney.png
    sha256: 2FC7D9F2E8A4FE0631EDB781D4CF2EFD4D42D884F62344EA9F2967BF834ABAA7
    raster_reason: Complex industrial outline that native shapes cannot rebuild
    atomic_raster_unit: true
    contains_reconstructable_content: false
    decomposition_note: Device names and probe labels are native text objects
nodes:
  - id: kiln_head_chimney
    label: Kiln-head chimney
    image: chimney
    bounds: { x: 980, y: 120, width: 90, height: 135 }
```

Rules:

- `path` is the only byte source. There is no `data` field.
- `node.image` and `node.icon` cannot appear on the same node.
- v1 accepts PNG and JPEG only. SVG is a hard error.
- Multi-page bundles (`schemaVersion: 1` + `pages`) reject `assets`.
- Stdin YAML that includes `assets` requires `--asset-root` or a file path.
- Foreign `.drawio` images without this skill's UserObject metadata need
  `--extract-assets <dir>`.

## CLI

```bash
node skills/drawio/scripts/cli.js in.yaml out.drawio --validate --strict-warnings --asset-root .
node skills/drawio/scripts/cli.js existing.drawio out.spec.yaml --input-format drawio --export-spec --extract-assets .drawio-tmp/extracted
```

## Size guardrails

Counts are citation-weighted source bytes before base64. Units are MiB
(1024 × 1024). Vocabulary is `info` / `warning` / `error`.

| Condition | Level | `--strict` |
| --- | --- | --- |
| One asset > 2 MiB | `warning` | fails |
| One asset > 8 MiB | `error` | fails |
| Weighted total > 24 MiB | `error` | fails |

The CLI does not resample, crop, or convert pixels. Compress files outside
the CLI with the recipe below, then point `assets.<id>.path` at the output
directory. Keep source files read-only.

## Long-edge target

```text
node render long edge (px) = node canvas long edge (px) × (export DPI / 96)
asset long-edge target (px) = node render long edge (px) × 2
```

Example: node about 120×160 px, canvas 1200×680, export 300 dpi → scale
3.125× → node render about 375×500 px → long-edge target **1000 px**.

The 2× oversample is an engineering default. "Softer edges below 1.5×" has
no measurement in this repository; do not treat it as a gate.

## Quality constraints

Automatic (script-assertable):

| Constraint | Assertion |
| --- | --- |
| Keep alpha | output `Image.mode == 'RGBA'` |
| Long edge | `max(size) == LONG_EDGE`, or do not upscale a smaller source |
| Byte drop | `dst_bytes < src_bytes` |
| Dual hash | `src_sha256` and `dst_sha256` are both non-empty |
| Resample | call uses `Image.LANCZOS` |
| Lossless PNG | save as PNG with `optimize=True`; do not emit JPEG/WebP |

Human-only (record viewer, zoom, and reviewer; do not mix into the automatic
denominator):

| Constraint | How to judge |
| --- | --- |
| No white fringe on transparent edges | 300 dpi export PNG at 100% |
| No visible aliasing or ringing | same |

## Pillow recipe (outside the CLI)

Do not use `convert` on Windows. That name is `C:\WINDOWS\System32\convert`,
the FAT-to-NTFS tool, not ImageMagick.

Preflight. If Pillow is missing, stop and report it. Do not install silently.

```bash
python -c "import PIL; print('Pillow', PIL.__version__)"
```

```python
from PIL import Image
import hashlib, pathlib

LONG_EDGE = 1000  # from the long-edge formula above

def sha256_of(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest().upper()

def compress(src: pathlib.Path, dst: pathlib.Path) -> dict:
    src_sha = sha256_of(src)
    src_bytes = src.stat().st_size
    with Image.open(src) as im:
        src_size = im.size
        im = im.convert('RGBA') if im.mode != 'RGBA' else im.copy()
    scale = LONG_EDGE / max(im.size)
    if scale < 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'PNG', optimize=True)
    return {
        'src_size': src_size, 'dst_size': im.size,
        'src_bytes': src_bytes, 'dst_bytes': dst.stat().st_size,
        'src_sha256': src_sha, 'dst_sha256': sha256_of(dst),
        'mode': im.mode,
    }
```

Write outputs to a separate directory (convention: `materials-render/`). Do
not overwrite, move, or rename source files. Record before/after size, bytes,
and both hashes. Put the output hash in `assets.<id>.sha256`.

## Academic overlay gate

The Draw.io Base Skill treats audit fields as optional type-checked strings
and booleans. For `meta.profile: academic-paper`, every referenced asset must
have a non-empty `raster_reason`, `atomic_raster_unit: true`, and
`contains_reconstructable_content: false`. `--strict` fails otherwise.

## Postprocess

`relabel`, `restyle`, and `heatmap` keep `assets` and `node.image`. Mermaid
projects an image node as a labeled shape and emits a warning. Explain lists
`image <id>`. HTML draws a rectangle; the offline SVG renderer has no raster
`<image>` path.

## Full-page rasters

`collectFullPageImageErrors` still rejects a cell that covers the page. Local
image assets are for atomic objects, not a full-page screenshot.
