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
- Label font classes stay uniform (module title 22 / node 20 / edge label 18 / text 16 by default); manual `style.fontSize` overrides stay class-consistent and inside their boxes.
- Extra whitespace is cropped before final export.
- Line styles, node sizes, and stroke widths are consistent across the figure.
- A matching `.png` is included for thesis, A4, Word, raster-first, screenshot rebuild, or explicit PNG requests when Desktop export is available.
- For Word/thesis delivery prefer a Desktop-exported PNG; SVG text needs Times New Roman and SimSun installed on the viewing machine.
- IEEE vector submissions accept PS/EPS/PDF only (no SVG); attach a Desktop-exported PDF when targeting IEEE.

## Print Sizing

Labels print at `fontSize x print-width-pt / canvas-width-px` pt when the figure fills the target width (cn-thesis text block = 440pt, IEEE single column = 252pt, double column = 516pt). Keep the result at 9pt (CN) / 8pt (IEEE) or higher. Minimum label fontSize:

| Canvas width | cn-thesis (440pt/9pt) | Single column (252pt/8pt) | Double column (516pt/8pt) |
| ------------ | --------------------- | ------------------------- | ------------------------- |
| 630px        | 13                    | 20                        | 10                        |
| 1000px       | 21                    | 32                        | 16                        |
| 1200px       | 25                    | 39                        | 19                        |
| 1600px       | 33                    | 51                        | 25                        |

Set `meta.print: { target: cn-thesis | ieee-single | ieee-double }` (or custom `widthPt`/`minPt`) so the validator checks the figure; without it, only canvases wider than 1500px are checked against the IEEE single-column floor. Design the canvas for the target width instead of scaling down a wide drawing.

## Review Questions

- Is the figure still readable when inserted into an A4 thesis or paper page at normal zoom?
- Would this still be readable when printed in grayscale?
- Does the figure still make sense if the reader cannot distinguish red vs green?
- Are caption, legend, and abbreviations clear without the surrounding paragraph?
- Is the final export vector-based and suitable for journal submission?
