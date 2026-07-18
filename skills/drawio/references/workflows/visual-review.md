# Workflow: Exported Visual Review and YAML-First Rework

Use this workflow after create, edit, import, or replicate when an exported artifact must be inspected by a person or a vision-capable model. The exported preview is evidence; canonical YAML remains the editable source.

## Produce a Vision Preview

Write previews and review records to the work directory, not the final delivery directory:

```bash
node <base-skill-dir>/scripts/cli.js input.yaml .drawio-tmp/figure/figure.preview.png --validate --visual-preview
```

`--visual-preview` requests a non-embedded PNG, waits for the Desktop output to stabilize, validates PNG structure, repairs only the recognized terminal IEND truncation, and re-exports by height when needed. The accepted PNG has `max(width, height) <= 2000`.

If draw.io Desktop is unavailable, the CLI reports that no PNG vision-preview was produced and writes a standalone SVG fallback. Inspect that SVG when the current viewer supports it; otherwise record visual execution as `missing evidence`. Do not describe the SVG fallback as a PNG or model-executed review.

## Review Record

Persist review evidence as `.drawio-tmp/<name>/visual-review.json` when the work needs an auditable loop:

```json
{
  "artifact": ".drawio-tmp/figure/figure.preview.png",
  "round": 1,
  "issues": [
    {
      "pageId": "Page-1",
      "objectId": "edge:api->db",
      "region": null,
      "problem": "edge-label-overlap",
      "severity": "blocker",
      "evidence": "The edge label overlaps the database outline near its upper border.",
      "suggestedAction": "Move labelOffset 16px into the adjacent whitespace.",
      "source": "visual"
    }
  ]
}
```

Required issue fields are `pageId`, `objectId`, `problem`, `severity`, `evidence`, `suggestedAction`, and `source`.

- `source` is `deterministic` for CLI/validator evidence or `visual` for observed exported-artifact evidence.
- `severity` is `blocker`, `warning`, or `info`.
- `objectId` may be `null` only when the reviewer cannot resolve a stable ID. In that case, `region` and `evidence` must identify a concrete page area; never invent an ID.
- Evidence states what is visible or measured. It does not infer hidden intent.

## Problem Taxonomy

| Problem | Observable condition |
| --- | --- |
| `overlap` | Two nodes, modules, labels, or annotations occupy the same visual area. |
| `clipped-label` | Text is cut off or escapes its intended bounds. |
| `missing-connection` | A required connector is absent or visibly detached from its endpoint. |
| `off-canvas` | Content falls outside the exported page. |
| `edge-through-object` | A connector crosses an unrelated node, label, or module interior. |
| `stacked-edge` | Multiple connectors are visually indistinguishable on the same route. |
| `edge-label-overlap` | An edge label collides with a line, object, or another label. |
| `missing-content` | A source-required node, label, legend, formula, or module is absent. |
| `source-mismatch` | The exported structure or meaning differs from the confirmed request or reference. |

Use the narrowest matching problem. Put additional context in `evidence` instead of inventing new near-duplicate problem names.

## Merge Deterministic and Visual Evidence

Deduplicate by `pageId + objectId + problem`. When `objectId` is `null`, use `pageId + region + problem`. Keep the higher severity and preserve both observations: retain the first issue's `source` and evidence, then append a `corroboration` entry containing the other `source` and evidence. Do not discard a deterministic warning merely because the visual reviewer did not mention it, and do not upgrade a visual guess into deterministic evidence.

## Map Accepted Issues to Canonical Changes

No review record mutates files directly. Convert an accepted issue into the smallest canonical YAML patch, validate, then rerender.

| Feedback | Canonical YAML action |
| --- | --- |
| color or style | Change semantic type, theme, palette, or a scoped style override. |
| add or remove node | Update the node and every affected edge by stable ID. |
| move or resize | Update `bounds` for an explicitly positioned diagram. |
| add or change connector | Update the edge by stable ID or stable `from`/`to` pair. |
| label change | Update the node or edge label without changing its ID. |
| layout direction | Change `meta.layout`, then rerun layout and validation. |
| clipped label | Shorten the label first; then apply the documented bounds/font ladder. |
| edge-label overlap | Change `labelOffset`; keep the label on its edge. |

If a `.spec.yaml` sidecar exists, edit it. If only a `.drawio` exists, import it to canonical YAML before iterative work. Direct XML editing is limited to the documented direct-XML exception or an imported diagram that cannot produce a usable sidecar; run XML validation after every such patch.

## Rework Loop

For each accepted round:

1. Patch the smallest canonical YAML object or the documented XML exception.
2. Run spec validation and render a fresh `.drawio`.
3. Overwrite the same work-dir preview path with `--visual-preview`.
4. Inspect PNG structure and dimensions, then perform visual review.
5. Persist the new review record and compare it with the previous blockers.

An autonomous round is complete only when validation ran, the preview is structurally valid and dimension-bounded, and every previous blocker is absent, downgraded with new evidence, or explicitly retained for user judgment. Run at most **2 autonomous repair rounds**. After that, return unresolved blockers to the user. After **5 user feedback rounds**, report remaining issues and recommend Desktop fine-tuning instead of claiming automatic completion.

Final 300dpi embedded PNG/PDF/JPG/SVG exports remain separate deliverables. Produce them only after the preview/rework decision is complete; never overwrite a final artifact with a vision preview.

## Evidence Labels

Label each case honestly:

- `recorded fixture`: stored input/output used for reproducibility;
- `command-executed`: deterministic CLI assertions were run;
- `Desktop-executed`: draw.io Desktop produced the inspected artifact;
- `model-executed`: provider and model metadata identify a real visual-model run;
- `missing evidence`: the required provider or viewer was unavailable.

A recorded fixture or deterministic command is not model-executed evidence.
