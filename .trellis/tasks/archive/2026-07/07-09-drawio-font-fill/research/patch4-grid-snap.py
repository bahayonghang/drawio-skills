# -*- coding: utf-8 -*-
# Patch 4: snap content-grown node sizes up to the 8px grid so faces and
# routed segments stay grid-aligned.
import io

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8", newline="").read()

old = """    const extent = measureLabelExtent(label, options.fontSize ?? FONT_LADDER.node, 0)
    return {
      width: Math.max(preset.width, extent.width + 28),
      height: Math.max(preset.height, extent.height + 20)
    }"""
new = """    const extent = measureLabelExtent(label, options.fontSize ?? FONT_LADDER.node, 0)
    const snapUp = (value) => Math.ceil(value / 8) * 8
    return {
      width: Math.max(preset.width, snapUp(extent.width + 28)),
      height: Math.max(preset.height, snapUp(extent.height + 20))
    }"""
assert src.count(old) == 1
src = src.replace(old, new)
io.open(path, "w", encoding="utf-8", newline="").write(src)
print("grid-snap growth patched OK")
