# -*- coding: utf-8 -*-
"""Phase 5 fix5: star/mesh auto-waypoint edges are bent for label offsets."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


old = """      edge.waypoints = dedupedWaypoints
      if (edge.waypoints.length > 0) {
        continue
      }
    }

    if (declaredLayout === 'mesh') {
"""
new = """      edge.waypoints = dedupedWaypoints
      if (edge.waypoints.length > 0) {
        edge.__bent = true
        continue
      }
    }

    if (declaredLayout === 'mesh') {
"""
src = replace_once(src, old, new, "star-bent")

old = """        edge.waypoints = dedupedWaypoints
        if (edge.waypoints.length > 0) {
          continue
        }
      }
    }
"""
new = """        edge.waypoints = dedupedWaypoints
        if (edge.waypoints.length > 0) {
          edge.__bent = true
          continue
        }
      }
    }
"""
src = replace_once(src, old, new, "mesh-bent")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch10 applied OK")
