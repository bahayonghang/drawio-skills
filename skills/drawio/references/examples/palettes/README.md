# Palette Swatches

Regenerate every preview from the shared YAML template:

```bash
node skills/drawio/scripts/generate-palette-swatches.js
```

The committed SVG is the deterministic local preview. A Draw.io Desktop PNG export may be added beside it when raster review is required.

| Palette | Category | CVD safe | Grayscale safe | Max categories | Venues | Preview | Source |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| `c4-blue` | engineering | yes | yes | 7 | c4, software-architecture, engineering-review | [SVG](./c4-blue.svg) / [draw.io](./c4-blue.drawio) | [source](https://github.com/plantuml-stdlib/C4-PlantUML/blob/a11242b3/themes/puml-theme-C4_blue.puml) |
| `cloud-aws` | engineering | no | no | 8 | aws, cloud-architecture, engineering-review | [SVG](./cloud-aws.svg) / [draw.io](./cloud-aws.drawio) | [source](https://github.com/awslabs/aws-icons-for-plantuml/blob/main/source/AWSCommon.puml) |
| `drawio-classic` | general | no | no | 8 | general, whiteboard, flowchart | [SVG](./drawio-classic.svg) / [draw.io](./drawio-classic.drawio) | [source](https://www.drawio.com/docs/reference/diagram-generation/style-reference/) |
| `ieee-bw` | academic | yes | yes | 5 | ieee-print, ieee-camera-ready, cn-thesis | [SVG](./ieee-bw.svg) / [draw.io](./ieee-bw.drawio) | [source](https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/resolution-and-size/) |
| `ieee-color` | academic | yes | yes | 3 | ieee-online, ieee-conference, engineering-paper | [SVG](./ieee-color.svg) / [draw.io](./ieee-color.drawio) | [source](https://github.com/garrettj403/SciencePlots/wiki/Gallery) |
| `journal-jama` | academic | no | no | 7 | jama-style, china-academic, muted-journal | [SVG](./journal-jama.svg) / [draw.io](./journal-jama.drawio) | [source](https://rdrr.io/cran/ggsci/src/R/palettes.R) |
| `journal-npg` | academic | no | no | 10 | nature-style, china-academic, presentation | [SVG](./journal-npg.svg) / [draw.io](./journal-npg.drawio) | [source](https://rdrr.io/cran/ggsci/src/R/palettes.R) |
| `matlab-lines` | academic | no | no | 7 | ieee-online, engineering-paper, matlab | [SVG](./matlab-lines.svg) / [draw.io](./matlab-lines.drawio) | [source](https://www.mathworks.com/matlabcentral/answers/140453-cycling-through-both-linestyle-and-linecolor) |
| `morandi` | academic | no | no | 8 | china-academic, presentation, muted-journal | [SVG](./morandi.svg) / [draw.io](./morandi.drawio) | [source](https://skewcy.com/2024/08/17/morandi.html) |
| `okabe-ito` | academic | yes | no | 8 | elsevier, nature, science, generic-journal | [SVG](./okabe-ito.svg) / [draw.io](./okabe-ito.drawio) | [source](https://jfly.uni-koeln.de/color/) |
| `seaborn-colorblind` | academic | yes | no | 10 | elsevier, generic-journal, multi-category | [SVG](./seaborn-colorblind.svg) / [draw.io](./seaborn-colorblind.drawio) | [source](https://github.com/mwaskom/seaborn/blob/master/seaborn/palettes.py) |
| `tol-bright` | academic | yes | no | 7 | elsevier, generic-journal, presentation | [SVG](./tol-bright.svg) / [draw.io](./tol-bright.drawio) | [source](https://personal.sron.nl/~pault/) |
| `tol-high-contrast` | academic | yes | yes | 5 | ieee-camera-ready, cn-thesis, generic-journal | [SVG](./tol-high-contrast.svg) / [draw.io](./tol-high-contrast.drawio) | [source](https://personal.sron.nl/~pault/) |
| `tol-light-fill` | academic | yes | no | 9 | elsevier, generic-journal, labeled-cells | [SVG](./tol-light-fill.svg) / [draw.io](./tol-light-fill.drawio) | [source](https://personal.sron.nl/~pault/) |
| `tol-muted` | academic | yes | no | 9 | elsevier, generic-journal, multi-category | [SVG](./tol-muted.svg) / [draw.io](./tol-muted.drawio) | [source](https://personal.sron.nl/~pault/) |
