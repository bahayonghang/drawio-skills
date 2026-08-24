# Thesis-scale smoke (AC17 / AC18)

Recorded 2026-08-24. Thesis repository is read-only. Outputs would go to
`.drawio-tmp/asset-smoke/` in this repo.

## Pillow preflight

```text
python -c "import PIL; print('Pillow', PIL.__version__)"
Pillow 12.3.0
```

Pillow is available.

## Materials

The 11 thesis PNGs under
`thesis/ref/plans/chapter2/fig2-1-refactor/materials/` were not found on this
machine. Searched guessed locations under `D:\Documents\Code` and
`D:\Documents\LYH\100-Work\120-Projects`. **AC18 is missing evidence.**

No files were written in any thesis repository (`git status` not applicable;
path absent).

## Automatic assertions (recipe)

Not run against the 11 source PNGs because the source directory is absent.
The recipe script in `skills/drawio/references/docs/local-image-assets.md` is
the copy-paste target. Unit tests cover RGBA-unrelated PNG magic, SHA-256
compare, and size diagnostics.

Human-only checks (white fringe, ringing): **missing evidence**. Viewer, zoom,
and reviewer were not assigned.

The "softer edges below 1.5×" claim is **not** written into the recipe as a
gate.

## Named smokes

| Name | Result |
| --- | --- |
| AC1 minimal integration (`local-image-assets.test.js` CLI PNG render) | pass |
| AC18 full 11-file / 13-object thesis figure | missing evidence (materials absent) |
