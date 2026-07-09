# -*- coding: utf-8 -*-
# Patch 3: math-bearing labels are exempt from width-estimation surfaces;
# register the new CN example in the overlay whitelist test.
import io

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8", newline="").read()


def rep(text, old, new, count=1):
    found = text.count(old)
    assert found == count, "expected %d occurrence(s), found %d: %r" % (
        count,
        found,
        old[:90],
    )
    return text.replace(old, new)


# Helper: math labels render through MathJax, so the per-glyph width model
# does not apply to them.
src = rep(
    src,
    """/** Largest font size whose estimated label extent stays inside bounds. */
function maxFontSizeForBounds(label, bounds) {""",
    """// MathJax renders delimited math much narrower than its LaTeX source text,
// so every per-glyph width estimate must skip math-bearing labels.
function hasMathMarkers(label) {
  return /\\$\\$|\\\\\\(|\\\\\\)/.test(String(label || ''))
}

/** Largest font size whose estimated label extent stays inside bounds. */
function maxFontSizeForBounds(label, bounds) {""",
)

# getNodeSize: no content growth for math labels (LaTeX source length lies).
src = rep(
    src,
    "  if (options?.contentAware && label && nodeType !== 'text' && !CONTENT_SIZE_EXEMPT_TYPES.has(nodeType)) {",
    "  if (\n    options?.contentAware &&\n    label &&\n    nodeType !== 'text' &&\n    !CONTENT_SIZE_EXEMPT_TYPES.has(nodeType) &&\n    !hasMathMarkers(label)\n  ) {",
)

# shrink: math labels take the class size but never constrain the limit.
src = rep(
    src,
    """    const cls = semanticType === 'text' ? 'text' : 'node'
    members.push({ node, cls })
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    limits[cls] = Math.min(limits[cls], maxFontSizeForBounds(node.label, bounds))""",
    """    const cls = semanticType === 'text' ? 'text' : 'node'
    members.push({ node, cls })
    if (hasMathMarkers(node.label)) continue
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    limits[cls] = Math.min(limits[cls], maxFontSizeForBounds(node.label, bounds))""",
)

# validateLabelFit: skip math labels entirely.
src = rep(
    src,
    """    if (semanticType === 'text' || CONTENT_SIZE_EXEMPT_TYPES.has(semanticType)) continue
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    const fontSize = node.style?.fontSize ?? FONT_LADDER.node""",
    """    if (semanticType === 'text' || CONTENT_SIZE_EXEMPT_TYPES.has(semanticType)) continue
    if (hasMathMarkers(node.label)) continue
    const bounds = normalizeNodeBounds(node)
    if (!bounds) continue
    const fontSize = node.style?.fontSize ?? FONT_LADDER.node""",
)

io.open(path, "w", encoding="utf-8", newline="").write(src)
print("spec-to-drawio.js math exemption patched OK")

# ---------- overlay whitelist ----------
tpath = "tests/drawio-academic-skill.test.js"
tsrc = io.open(tpath, encoding="utf-8", newline="").read()
tsrc = rep(
    tsrc,
    """    'examples/ieee-network-paper.yaml',
    'examples/max-pooling-operation-paper.yaml',""",
    """    'examples/ieee-network-paper.yaml',
    'examples/industrial-architecture-cn-paper.yaml',
    'examples/max-pooling-operation-paper.yaml',""",
)
io.open(tpath, "w", encoding="utf-8", newline="").write(tsrc)
print("overlay whitelist patched OK")
