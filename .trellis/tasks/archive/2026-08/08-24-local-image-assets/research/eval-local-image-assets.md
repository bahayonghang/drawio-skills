# Eval: local image assets

Recorded 2026-08-24. Outputs written under repo-root temp and `.drawio-tmp/` (not under `skills/`). Runner: offline CLI + `node --test`. Draw.io Desktop was not run.

## base-local-image-assets

| Assertion | Result | Evidence |
| --- | --- | --- |
| Uses top-level assets and node.image rather than node.icon or style.image | pass | `local-image-assets.test.js` AC1; `VALID_ICON` still rejects slashes |
| Paths are relative to the asset root, not the spec file | pass | sidecar-dir round-trip keeps `path: a.png` |
| Rendered XML contains shape=image and data:image/png;base64, | pass | CLI `--validate --strict-warnings` AC1 |
| Does not require a new runtime image library or NODE_PATH | pass | AC13 copied-skill install |
| Does not place assets on a multi-page bundle | pass | AC11 `MULTI_PAGE_INVALID` |
| Round-trip export-spec restores path and audit fields | pass | AC3 |
| Desktop visual review of the image cells | missing evidence | Desktop not run |

Verifiable: 6/6. Excluded from denominator: Desktop visual review.

Score: 100 × 6/6 = 100.

## academic-local-image-assets

| Assertion | Result | Evidence |
| --- | --- | --- |
| Overlay policy + sibling CLI | pass | overlay SKILL route; tests call `../drawio` CLI |
| meta.profile academic-paper | pass | AC3 academic re-strict |
| Audit fields required | pass | AC10 `validateAcademicProfile` |
| No overlay runtime copy | pass | `drawio-academic-skill.test.js` whitelist unchanged |
| Desktop/human print-edge visual | missing evidence | not run |

Verifiable: 4/4. Excluded: Desktop/human visual.

Score: 100 × 4/4 = 100.
