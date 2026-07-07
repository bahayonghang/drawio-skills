# Vendored: elkjs

- Package: `elkjs@0.11.1` (https://www.npmjs.com/package/elkjs)
- File: `lib/elk.bundled.js` from the npm tarball, renamed to `elk.bundled.cjs`
  (this package is `"type": "module"`; the UMD bundle must load through the CJS channel).
- License: EPL-2.0 — see `LICENSE.md` (from the same tarball).
- Loaded lazily by `../../dsl/auto-layout.js` via `createRequire`; if this file is
  missing or corrupt the converter falls back to the legacy grid layout with a warning.
  No network access happens at runtime.

Regenerate:

```bash
npm pack elkjs@0.11.1
tar -xzf elkjs-0.11.1.tgz package/lib/elk.bundled.js package/LICENSE.md
cp package/lib/elk.bundled.js elk.bundled.cjs
cp package/LICENSE.md LICENSE.md
```
