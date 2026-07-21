# Vendored: js-yaml

- Package: `js-yaml@4.1.1` (https://www.npmjs.com/package/js-yaml)
- File: `dist/js-yaml.mjs` from the npm package.
- License: MIT - see `LICENSE.md` from the same package.
- Loaded through relative ESM imports by the mandatory YAML parsing and
  serialization paths. No package discovery or network access happens at
  runtime.

Regenerate:

```bash
npm pack js-yaml@4.1.1
tar -xzf js-yaml-4.1.1.tgz package/dist/js-yaml.mjs package/LICENSE
cp package/dist/js-yaml.mjs js-yaml.mjs
cp package/LICENSE LICENSE.md
```
