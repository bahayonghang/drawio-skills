# Academic Export Checklist

Use this checklist for `meta.profile: academic-paper`.

## Required

- `meta.title` is present and suitable for figure captioning.
- Theme is `academic` or `academic-color`.
- Output is exported as `.svg` unless the user explicitly asks for `.drawio`.
- All formulas use the math typesetting guidance.
- Colors are not the only carrier of meaning.

## Recommended

- `meta.description` explains the figure intent or context.
- `meta.legend` is present when icons or mixed connector styles are used.
- Label font sizes stay in the 8-10pt range when overridden manually.
- Extra whitespace is cropped before final export.
- Line styles, node sizes, and stroke widths are consistent across the figure.

## Review Questions

- Would this still be readable when printed in grayscale?
- Does the figure still make sense if the reader cannot distinguish red vs green?
- Are caption, legend, and abbreviations clear without the surrounding paragraph?
- Is the final export vector-based and suitable for journal submission?
