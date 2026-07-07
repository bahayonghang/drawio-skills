# -*- coding: utf-8 -*-
"""Phase 1: shared-coordinate straight routing for spec-to-drawio.js."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


# --- Patch A: orientation prefers the axis with a positive face-to-face gap ---
old_a = """  const dx = targetCenterX - sourceCenterX
  const dy = targetCenterY - sourceCenterY
  const horizontal = Math.abs(dx) >= Math.abs(dy)
"""
new_a = """  const dx = targetCenterX - sourceCenterX
  const dy = targetCenterY - sourceCenterY
  // Prefer the axis whose face-to-face gap is positive: a negative gap means
  // the shapes overlap on that axis, so routing along it would immediately
  // clash with the shapes themselves (wide bars above narrow boxes, etc.).
  const horizontalGap = Math.abs(dx) - (sourcePos.width + targetPos.width) / 2
  const verticalGap = Math.abs(dy) - (sourcePos.height + targetPos.height) / 2
  let horizontal
  if (verticalGap >= 0 && horizontalGap < 0) {
    horizontal = false
  } else if (horizontalGap >= 0 && verticalGap < 0) {
    horizontal = true
  } else {
    horizontal = Math.abs(dx) >= Math.abs(dy)
  }
"""
src = replace_once(src, old_a, new_a, "A:detectEdgeFaces")

# --- Patch B: shared-coordinate helpers after getSlot ---
old_b = """function getSlot(index) {
  return FACE_SLOTS[index % FACE_SLOTS.length]
}
"""
new_b = """function getSlot(index) {
  return FACE_SLOTS[index % FACE_SLOTS.length]
}

const CONNECTION_CORNER_MARGIN = 8
const CONNECTION_MIN_SEPARATION = 30

/**
 * Interval of absolute coordinates (X for vertical edges, Y for horizontal
 * edges) where both faces can host the same connection coordinate, keeping the
 * orthogonal edge a single straight segment. Null when the faces do not
 * overlap on the shared axis and a bend is genuinely required.
 */
function sharedAxisInterval(sourcePos, targetPos, orientation) {
  const vertical = orientation === 'vertical'
  const lo = vertical ? Math.max(sourcePos.x, targetPos.x) : Math.max(sourcePos.y, targetPos.y)
  const hi = vertical
    ? Math.min(sourcePos.x + sourcePos.width, targetPos.x + targetPos.width)
    : Math.min(sourcePos.y + sourcePos.height, targetPos.y + targetPos.height)
  const min = lo + CONNECTION_CORNER_MARGIN
  const max = hi - CONNECTION_CORNER_MARGIN
  return min <= max ? { lo: min, hi: max } : null
}

/**
 * Straight edges anchor on the center of the narrower face: a small box
 * connects from its own center straight into the larger box, which is how
 * hand-drawn architecture diagrams keep their vertical arrows straight.
 */
function preferredSharedCoordinate(sourcePos, targetPos, orientation, interval) {
  const vertical = orientation === 'vertical'
  const sourceSpan = vertical ? sourcePos.width : sourcePos.height
  const targetSpan = vertical ? targetPos.width : targetPos.height
  const sourceCenter = vertical ? sourcePos.x + sourcePos.width / 2 : sourcePos.y + sourcePos.height / 2
  const targetCenter = vertical ? targetPos.x + targetPos.width / 2 : targetPos.y + targetPos.height / 2
  const preferred = sourceSpan <= targetSpan ? sourceCenter : targetCenter
  return Math.min(interval.hi, Math.max(interval.lo, preferred))
}

function roundFraction(value) {
  return Math.round(value * 10000) / 10000
}

/**
 * Spread straight edges that landed within CONNECTION_MIN_SEPARATION of each
 * other on the same physical face. Moving an edge moves both endpoints
 * together, so collinearity is preserved; clamping keeps every edge inside its
 * own shared interval.
 */
function spreadSharedCoordinates(edges) {
  const faceGroups = new Map()
  for (const edge of edges) {
    if (!edge.__shared) continue
    const keys = [`${edge.from}:${edge.__routing.sourceFace}`, `${edge.to}:${edge.__routing.targetFace}`]
    for (const key of keys) {
      if (!faceGroups.has(key)) faceGroups.set(key, [])
      faceGroups.get(key).push(edge)
    }
  }
  const sortedKeys = [...faceGroups.keys()].sort()
  for (const key of sortedKeys) {
    const group = faceGroups
      .get(key)
      .slice()
      .sort((a, b) => a.__shared.coord - b.__shared.coord)
    let start = 0
    while (start < group.length) {
      let end = start
      while (
        end + 1 < group.length &&
        group[end + 1].__shared.coord - group[end].__shared.coord < CONNECTION_MIN_SEPARATION
      ) {
        end++
      }
      if (end > start) {
        const cluster = group.slice(start, end + 1)
        const mean = cluster.reduce((sum, item) => sum + item.__shared.coord, 0) / cluster.length
        cluster.forEach((item, index) => {
          const desired = mean + (index - (cluster.length - 1) / 2) * CONNECTION_MIN_SEPARATION
          item.__shared.coord = Math.min(item.__shared.interval.hi, Math.max(item.__shared.interval.lo, desired))
        })
      }
      start = end + 1
    }
  }
}
"""
src = replace_once(src, old_b, new_b, "B:helpers")

# --- Patch C: buildRoutedEdges uses shared coordinates, slots only as fallback ---
old_c = """    const sourceKey = `${edge.from}:${faces.sourceFace}`
    const targetKey = `${edge.to}:${faces.targetFace}`

    if (!sourceGroups.has(sourceKey)) sourceGroups.set(sourceKey, [])
    if (!targetGroups.has(targetKey)) targetGroups.set(targetKey, [])
    sourceGroups.get(sourceKey).push(edge)
    targetGroups.get(targetKey).push(edge)
  }

  for (const group of sourceGroups.values()) {
"""
new_c = """    const hasManualPoints =
      edge.style.exitX !== undefined ||
      edge.style.exitY !== undefined ||
      edge.style.entryX !== undefined ||
      edge.style.entryY !== undefined
    const interval = hasManualPoints ? null : sharedAxisInterval(sourcePos, targetPos, faces.orientation)
    if (interval) {
      edge.__shared = {
        interval,
        coord: preferredSharedCoordinate(sourcePos, targetPos, faces.orientation, interval)
      }
      continue
    }

    const sourceKey = `${edge.from}:${faces.sourceFace}`
    const targetKey = `${edge.to}:${faces.targetFace}`

    if (!sourceGroups.has(sourceKey)) sourceGroups.set(sourceKey, [])
    if (!targetGroups.has(targetKey)) targetGroups.set(targetKey, [])
    sourceGroups.get(sourceKey).push(edge)
    targetGroups.get(targetKey).push(edge)
  }

  spreadSharedCoordinates(edges)

  for (const edge of edges) {
    if (!edge.__shared) continue
    const sourcePos = positions.get(edge.from)
    const targetPos = positions.get(edge.to)
    const { coord } = edge.__shared
    const style = edge.style
    if (edge.__routing.orientation === 'vertical') {
      style.exitX = roundFraction((coord - sourcePos.x) / sourcePos.width)
      style.exitY = edge.__routing.sourceFace === 'bottom' ? 1 : 0
      style.entryX = roundFraction((coord - targetPos.x) / targetPos.width)
      style.entryY = edge.__routing.targetFace === 'top' ? 0 : 1
    } else {
      style.exitX = edge.__routing.sourceFace === 'right' ? 1 : 0
      style.exitY = roundFraction((coord - sourcePos.y) / sourcePos.height)
      style.entryX = edge.__routing.targetFace === 'left' ? 0 : 1
      style.entryY = roundFraction((coord - targetPos.y) / targetPos.height)
    }
    style.exitDx = 0
    style.exitDy = 0
    style.entryDx = 0
    style.entryDy = 0
    delete edge.__shared
  }

  for (const group of sourceGroups.values()) {
"""
src = replace_once(src, old_c, new_c, "C:buildRoutedEdges")

# --- Patch D: straightness audit in validateEdgeQuality ---
old_d = """    if (!hasWaypoints) {
      const sourceCenterX = sourcePos.x + sourcePos.width / 2
"""
new_d = """    if (!hasWaypoints && edge.__routing) {
      const orientation = edge.__routing.orientation
      const vertical = orientation === 'vertical'
      const exitFrac = vertical ? style.exitX : style.exitY
      const entryFrac = vertical ? style.entryX : style.entryY
      if (exitFrac !== undefined && entryFrac !== undefined) {
        const absExit = vertical
          ? sourcePos.x + exitFrac * sourcePos.width
          : sourcePos.y + exitFrac * sourcePos.height
        const absEntry = vertical
          ? targetPos.x + entryFrac * targetPos.width
          : targetPos.y + entryFrac * targetPos.height
        const delta = Math.abs(absExit - absEntry)
        if (delta > 0.5 && sharedAxisInterval(sourcePos, targetPos, orientation)) {
          warnings.push(
            `Edge "${edge.from}->${edge.to}" bends ${Math.round(delta)}px off a straight ${orientation} line. ` +
              'A collinear connection exists on this axis; use the same absolute exit/entry coordinate.'
          )
        }
      }
    }

    if (!hasWaypoints) {
      const sourceCenterX = sourcePos.x + sourcePos.width / 2
"""
src = replace_once(src, old_d, new_d, "D:straightness-audit")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch1 applied OK")
