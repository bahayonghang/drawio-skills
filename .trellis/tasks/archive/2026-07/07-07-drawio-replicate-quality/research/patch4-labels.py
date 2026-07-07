# -*- coding: utf-8 -*-
"""Phase 3b: content-aware default label offsets + arc-length label anchors."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


# --- content-aware default offset: 8px clearance between line and label edge ---
old = """function defaultEdgeLabelOffset(edge) {
  return edge.__routing?.orientation === 'vertical' ? { x: 12, y: 0 } : { x: 0, y: -12 }
}
"""
new = """function defaultEdgeLabelOffset(edge) {
  // draw.io centers an edge label on the offset point, so the offset must
  // cover half the label extent plus clearance, or wide CJK labels will sit
  // right on top of the connector they annotate.
  const label = formatNetworkEdgeLabel(edge)
  const extent = label ? measureLabelExtent(label, edge.style?.fontSize ?? 11, 2) : { width: 0, height: 0 }
  if (edge.__routing?.orientation === 'vertical') {
    return { x: 8 + Math.ceil(extent.width / 2), y: 0 }
  }
  return { x: 0, y: -(8 + Math.ceil(extent.height / 2)) }
}
"""
src = replace_once(src, old, new, "offset:content-aware")

# --- lint anchors labels at the polyline arc-length position, not endpoint lerp ---
old = """/**
 * Heuristic lint for label clashes: edge labels on their own line, labels
 * crossing other connectors, standalone text boxes crossed by connectors, and
 * label/label overlap. Extents are estimated, so treat results as warnings.
 */
export function validateLabelCollisions(spec, layout) {
"""
new = """function pointAlongPolyline(points, fraction) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  let remaining = total * fraction
  for (let i = 1; i < points.length; i++) {
    const segment = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t
      }
    }
    remaining -= segment
  }
  return points[points.length - 1]
}

/**
 * Heuristic lint for label clashes: edge labels on their own line, labels
 * crossing other connectors, standalone text boxes crossed by connectors, and
 * label/label overlap. Extents are estimated, so treat results as warnings.
 */
export function validateLabelCollisions(spec, layout) {
"""
src = replace_once(src, old, new, "lint:polyline-point")

old = """    const fraction = edge.labelPosition === 'start' ? 0.2 : edge.labelPosition === 'end' ? 0.8 : 0.5
    const first = points[0]
    const last = points[points.length - 1]
    const anchor = { x: first.x + (last.x - first.x) * fraction, y: first.y + (last.y - first.y) * fraction }
"""
new = """    const fraction = edge.labelPosition === 'start' ? 0.2 : edge.labelPosition === 'end' ? 0.8 : 0.5
    const anchor = pointAlongPolyline(points, fraction)
"""
src = replace_once(src, old, new, "lint:anchor")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch4 applied OK")
