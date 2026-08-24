# draw.io native image expression (R15 / implement.md §0)

Recorded 2026-08-24. Scope is draw.io's own file format, not a skill-directory search. Sources: the vendored official style reference in this repository, the mxGraph UserObject codec pattern, and the existing multi-page UserObject wrapper in this skill. Draw.io Desktop was not run in this session.

## 1. Native style keys and data URI form

**Supported by repository evidence.**

The official style reference (`skills/drawio/references/official/style-reference.md`) states:

- Core shape `shape=image` is an image container and requires `image=<url>`.
- The `image` style property accepts URL strings and **data URIs**.
- Related keys: `imageWidth`, `imageHeight`, `imageAlign`, `imageVerticalAlign`, `imageAspect`.
- The `image` style class places the label below the picture.

This skill already emits that form for bundled icons via `IMAGE_ICON_STYLE_PREFIX`:

```
shape=image;html=1;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;image=<data-uri>
```

Bundled icons use `data:image/svg+xml,` plus percent-encoding. Local raster assets use `data:image/png;base64,` or `data:image/jpeg;base64,` as required by AC1.

A naive `style.split(';')` parser splits `data:image/png;base64,...` at the mediatype semicolon. This skill extracts raster data URIs with a dedicated regex on the raw style string. Draw.io Desktop visual confirmation of the emitted style string is **missing evidence**.

## 2. UserObject custom attributes (R3 carrier)

**Supported by repository evidence. Desktop edit-save cycle is missing evidence.**

The official style reference Example 4 documents custom metadata with `UserObject`:

```xml
<UserObject id="srv1" label="Web Server" tooltip="Production web server"
            ip="10.0.1.10" environment="production" owner="ops-team">
  <mxCell style="rounded=1;..." vertex="1" parent="1">
    <mxGeometry ... />
  </mxCell>
</UserObject>
```

That example puts `id` and `label` on `UserObject` and leaves `mxCell@value` empty. An `<object>` wrapper is documented as an equivalent form. Unknown keys on the wrapper are the documented metadata channel.

This skill already writes `UserObject` for multi-page canonical metadata (`dataPageId`, `dataObjectId`, `dataObjectKind`) and restores those attributes on import. Asset wrapping uses the same codec layer with `dataAssetId`, `dataAssetPath`, `dataAssetSha256`, `dataAssetRasterReason`, `dataAssetAtomic`, `dataAssetReconstructable`, and `dataAssetDecomposition`. Label is on `UserObject@label`; `mxCell@value` is empty. Bundle mode rejects `assets`, so the two wrappers do not nest.

Desktop "edit the cell, save, reopen" preservation of those custom attributes was **not run**. That remains **missing evidence**. The design fallback (custom style keys) is not used.

## 3. SVG data URIs and external resources (R6)

**SVG as a local asset remains deferred. The delay is not overturned.**

Evidence:

- Prefix sniffing (`<?xml`, `<svg`) cannot prove a file is SVG. `<?xml version="1.0"?><root/>` is XML and not SVG. A legal SVG with BOM, comment, or DOCTYPE can miss a naive prefix check.
- SVG may carry script, event attributes, `foreignObject`, and external URL references. Base64 wrapping is not a content trust boundary.
- Bundled icons already inline SVG data URIs that this skill generates. Those URIs are percent-encoded skill output, not user files.
- The official style reference lists `image=<url>` without a user-file SVG trust policy.

v1 therefore accepts only PNG (`89 50 4E 47 0D 0A 1A 0A`) and JPEG (`FF D8 FF`) user files. A `.svg` asset path is a hard error with a v1-unsupported message.

Draw.io Desktop behavior for a hostile SVG data URI (script execution, external fetch) is **missing evidence**.

## 4. Carrier decision

| Question | Result |
| --- | --- |
| Use `UserObject` for the six R3 fields? | **Yes.** Official example plus existing multi-page wrapper. |
| Fall back to custom style keys? | **No.** Nothing in the checked sources falsifies UserObject attribute round-trip through this skill's own import path. Desktop edit-save remains missing evidence, not a falsification. |
| Allow local SVG assets in v1? | **No.** Type proof and content trust are out of scope. |

## 5. Missing evidence

- Draw.io Desktop open / edit / save of a file that contains `dataAsset*` UserObject attributes.
- Visual rendering of `UserObject@label` on an image cell in Desktop.
- Draw.io Desktop handling of a user-supplied SVG data URI (script, `foreignObject`, external URL).
- Live confirmation that Desktop's style parser reconstitutes `data:image/png;base64,...` from a semicolon-separated style string.
