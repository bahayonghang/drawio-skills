# -*- coding: utf-8 -*-
"""Phase 5 fixes: fallback slots avoid used face coords; bend-aware label offsets."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


# --- mark bent fallback edges when they join the legacy slot groups ---
old = """    const hasManualPoints =
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
"""
new = """    const hasManualPoints =
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
    edge.__bent = !hasManualPoints
"""
src = replace_once(src, old, new, "bent-flag")

# --- shared edges register their face coordinates; fallback slots avoid them ---
old = """  spreadSharedCoordinates(edges)

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
    group.forEach((edge, index) => {
      const slot = group.length === 1 ? 0.5 : getSlot(index)
      applyFaceSlot(edge.style, edge.__routing.sourceFace, slot)
    })
  }

  for (const group of targetGroups.values()) {
    group.forEach((edge, index) => {
      const slot = group.length === 1 ? 0.5 : getSlot(index)
      applyTargetFaceSlot(edge.style, edge.__routing.targetFace, slot)
    })
  }

  return edges
}
"""
new = """  spreadSharedCoordinates(edges)

  const usedFaceCoords = new Map()
  const faceCoordsFor = (nodeId, face) => {
    const key = `${nodeId}:${face}`
    if (!usedFaceCoords.has(key)) usedFaceCoords.set(key, [])
    return usedFaceCoords.get(key)
  }

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
    faceCoordsFor(edge.from, edge.__routing.sourceFace).push(coord)
    faceCoordsFor(edge.to, edge.__routing.targetFace).push(coord)
    delete edge.__shared
  }

  assignFallbackFaceSlots(sourceGroups, positions, faceCoordsFor, true)
  assignFallbackFaceSlots(targetGroups, positions, faceCoordsFor, false)

  return edges
}

function faceGeometry(pos, face) {
  const vertical = face === 'top' || face === 'bottom'
  return { vertical, base: vertical ? pos.x : pos.y, span: vertical ? pos.width : pos.height }
}

/**
 * Legacy slot distribution for edges without a collinear interval. Slots now
 * dodge coordinates already taken on the same physical face by straight edges
 * or manual connection points, so mixed faces stay CONNECTION_MIN_SEPARATION
 * apart instead of stacking at 0.5.
 */
function assignFallbackFaceSlots(groups, positions, faceCoordsFor, isSource) {
  for (const group of groups.values()) {
    const manualEdges = new Set()

    for (const edge of group) {
      const face = isSource ? edge.__routing.sourceFace : edge.__routing.targetFace
      const nodeId = isSource ? edge.from : edge.to
      const pos = positions.get(nodeId)
      if (!pos) continue
      const { vertical, base, span } = faceGeometry(pos, face)
      const style = edge.style
      const manual = isSource ? (vertical ? style.exitX : style.exitY) : (vertical ? style.entryX : style.entryY)
      if (manual !== undefined) {
        faceCoordsFor(nodeId, face).push(base + manual * span)
        manualEdges.add(edge)
      }
    }

    group.forEach((edge, index) => {
      const face = isSource ? edge.__routing.sourceFace : edge.__routing.targetFace
      const nodeId = isSource ? edge.from : edge.to
      const pos = positions.get(nodeId)
      const fallbackSlot = group.length === 1 ? 0.5 : getSlot(index)
      if (!pos || manualEdges.has(edge)) {
        if (isSource) applyFaceSlot(edge.style, face, fallbackSlot)
        else applyTargetFaceSlot(edge.style, face, fallbackSlot)
        return
      }
      const { base, span } = faceGeometry(pos, face)
      const used = faceCoordsFor(nodeId, face)
      let chosen
      for (const slot of [0.5, ...FACE_SLOTS]) {
        const coord = base + slot * span
        if (used.every((taken) => Math.abs(taken - coord) >= CONNECTION_MIN_SEPARATION)) {
          chosen = slot
          break
        }
      }
      if (chosen === undefined) chosen = fallbackSlot
      used.push(base + chosen * span)
      if (isSource) applyFaceSlot(edge.style, face, chosen)
      else applyTargetFaceSlot(edge.style, face, chosen)
    })
  }
}
"""
src = replace_once(src, old, new, "fallback-aware-slots")

# --- bend-aware default label offset ---
old = """function defaultEdgeLabelOffset(edge) {
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
new = """function defaultEdgeLabelOffset(edge) {
  // draw.io centers an edge label on the offset point, so the offset must
  // cover half the label extent plus clearance, or wide CJK labels will sit
  // right on top of the connector they annotate. A bent fallback edge anchors
  // its label on the middle segment, which runs perpendicular to the overall
  // orientation, so the clearing axis flips.
  const label = formatNetworkEdgeLabel(edge)
  const extent = label ? measureLabelExtent(label, edge.style?.fontSize ?? 11, 2) : { width: 0, height: 0 }
  const vertical = edge.__routing?.orientation === 'vertical'
  const clearHorizontally = edge.__bent ? !vertical : vertical
  if (clearHorizontally) {
    return { x: 8 + Math.ceil(extent.width / 2), y: 0 }
  }
  return { x: 0, y: -(8 + Math.ceil(extent.height / 2)) }
}
"""
src = replace_once(src, old, new, "bend-aware-offset")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch6 applied OK")
