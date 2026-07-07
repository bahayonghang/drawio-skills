# -*- coding: utf-8 -*-
"""Phase 5 fix3: legacy slot test now expects 30px corridor separation."""

import io
import sys

path = "skills/drawio/scripts/dsl/spec-to-drawio.test.js"
src = io.open(path, encoding="utf-8").read()


def replace_once(haystack, old, new, tag):
    if haystack.count(old) != 1:
        sys.exit("ANCHOR FAILED (%s): count=%d" % (tag, haystack.count(old)))
    return haystack.replace(old, new, 1)


old = """    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('exitY=0.25'))
    assert.ok(xml.includes('exitY=0.5'))
  })
})
"""
new = """    const xml = specToDrawioXml(spec, { silent: true })
    // Slots keep the legacy 0.25-first order but dodge to the next slot that
    // honors the 30px corridor rule (0.5 on a 60px face is only 15px away).
    assert.ok(xml.includes('exitY=0.25'))
    assert.ok(xml.includes('exitY=0.75'))
  })
})
"""
src = replace_once(src, old, new, "slot-test-update")

io.open(path, "w", encoding="utf-8", newline="\n").write(src)
print("patch8 applied OK")
