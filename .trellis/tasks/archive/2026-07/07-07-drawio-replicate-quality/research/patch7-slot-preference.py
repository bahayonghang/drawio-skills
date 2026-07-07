# -*- coding: utf-8 -*-
"""Phase 5 fix2: fallback slot chooser prefers the legacy slot sequence."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


old = """      const { base, span } = faceGeometry(pos, face)
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
"""
new = """      const { base, span } = faceGeometry(pos, face)
      const used = faceCoordsFor(nodeId, face)
      // Prefer the legacy slot for this position in the group; only dodge to
      // another slot when a straight edge or manual point already occupies the
      // coordinate. Small faces cannot honor the separation at all, so the
      // exhausted case falls back to the legacy slot unchanged.
      let chosen
      for (const slot of [fallbackSlot, 0.5, ...FACE_SLOTS]) {
        const coord = base + slot * span
        if (used.every((taken) => Math.abs(taken - coord) >= CONNECTION_MIN_SEPARATION)) {
          chosen = slot
          break
        }
      }
      if (chosen === undefined) chosen = fallbackSlot
      used.push(base + chosen * span)
"""
src = replace_once(src, old, new, "slot-preference")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch7 applied OK")
