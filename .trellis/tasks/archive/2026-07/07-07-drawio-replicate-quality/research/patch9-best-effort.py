# -*- coding: utf-8 -*-
"""Phase 5 fix4: exhausted fallback slots maximize distance to used coords."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


old = """      let chosen
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
new = """      let chosen
      for (const slot of [fallbackSlot, 0.5, ...FACE_SLOTS]) {
        const coord = base + slot * span
        if (used.every((taken) => Math.abs(taken - coord) >= CONNECTION_MIN_SEPARATION)) {
          chosen = slot
          break
        }
      }
      if (chosen === undefined) {
        // The face is too small to honor the separation; take the slot that
        // keeps the largest distance to everything already connected instead
        // of stacking exactly onto an occupied coordinate.
        let bestDistance = -1
        for (const slot of [fallbackSlot, 0.5, ...FACE_SLOTS]) {
          const coord = base + slot * span
          const minDistance = used.length ? Math.min(...used.map((taken) => Math.abs(taken - coord))) : Infinity
          if (minDistance > bestDistance) {
            bestDistance = minDistance
            chosen = slot
          }
        }
      }
      used.push(base + chosen * span)
"""
src = replace_once(src, old, new, "best-effort-exhaustion")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch9 applied OK")
