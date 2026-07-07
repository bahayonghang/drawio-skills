# Academic Export Checklist

Use this checklist for `meta.profile: academic-paper`.

## Required

- `meta.figureType` is present and is `architecture`, `roadmap`, or `workflow`.
- `meta.title` is present and suitable for figure captioning.
- Theme is `academic` or `academic-color`.
- Output bundle includes `.drawio`, `.spec.yaml`, `.arch.json`, and `.svg`.
- All formulas use the math typesetting guidance.
- Colors are not the only carrier of meaning.
- Visual checks use the exported SVG or Desktop-exported final artifact before any browser/live screenshot.

## Recommended

- `meta.description` explains the figure intent or context.
- `meta.legend` is present when icons or mixed connector styles are used.
- Label font sizes stay in the 8-10pt range when overridden manually.
- Extra whitespace is cropped before final export.
- Line styles, node sizes, and stroke widths are consistent across the figure.
- A matching `.png` is included for thesis, A4, Word, raster-first, screenshot rebuild, or explicit PNG requests when Desktop export is available.
- IEEE vector submissions accept PS/EPS/PDF only (no SVG); attach a Desktop-exported PDF when targeting IEEE.

## Print Sizing

Labels print at `fontSize x column-width-pt / canvas-width-px` pt when the figure fills the column (IEEE single column = 252pt, double column = 516pt). Keep the result at 8pt or higher. Minimum label fontSize for 8pt:

| Canvas width | Single column (252pt) | Double column (516pt) |
| ------------ | --------------------- | --------------------- |
| 630px        | 20                    | 10                    |
| 1000px       | 32                    | 16                    |
| 1200px       | 39                    | 19                    |
| 1600px       | 51                    | 25                    |

Canvases wider than 1500px with smaller fonts trigger a validator warning. Design the canvas for the target column instead of scaling down a wide drawing.

## Review Questions

- Is the figure still readable when inserted into an A4 thesis or paper page at normal zoom?
- Would this still be readable when printed in grayscale?
- Does the figure still make sense if the reader cannot distinguish red vs green?
- Are caption, legend, and abbreviations clear without the surrounding paragraph?
- Is the final export vector-based and suitable for journal submission?
