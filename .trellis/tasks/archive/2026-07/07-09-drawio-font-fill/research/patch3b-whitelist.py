# -*- coding: utf-8 -*-
# Patch 3b: register the CN example in the overlay whitelist (line-ending aware)
import io

p = "tests/drawio-academic-skill.test.js"
s = io.open(p, encoding="utf-8", newline="").read()
eol = "\r\n" if "\r\n" in s else "\n"
anchor = "'examples/ieee-network-paper.yaml',"
assert s.count(anchor) == 1, s.count(anchor)
s = s.replace(
    anchor, anchor + eol + "    'examples/industrial-architecture-cn-paper.yaml',"
)
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("whitelist patched OK (eol=%r)" % eol)
