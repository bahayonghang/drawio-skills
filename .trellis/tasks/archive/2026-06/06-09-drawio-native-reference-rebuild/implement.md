# Draw.io native reference rebuild implementation plan

Do not start this plan until the user approves implementation or asks to proceed.

## Ordered Checklist

1. Refresh implementation context
   - Read `skills/drawio/scripts/dsl/spec-to-drawio.js`.
   - Read `skills/drawio/references/workflows/replicate.md`.
   - Read `skills/drawio/references/docs/design-system/specification.md`.
   - Read existing tests around `specToDrawioXml`, `validateSpec`, `validateXml`, sidecars, visual verification, and academic overlay boundaries.

2. Add `meta.canvas` parser and validation
   - Add a small helper near existing numeric/grid helpers.
   - Accept `auto` and `WIDTHxHEIGHT`.
   - Validate in `validateSpec`.
   - Keep existing specs without `meta.canvas` compatible.

3. Apply `meta.canvas` in rendering
   - Keep the current auto canvas calculation from max content bounds plus padding.
   - Resolve explicit canvas as a minimum page size.
   - Emit resolved dimensions in `pageWidth` and `pageHeight`.

4. Add full-page image audit to XML validation
   - Extend `validateXml(xml)` with a narrow helper.
   - Reuse current regex-style validation unless tests expose a parsing gap.
   - Add clear error text for full-page embedded reference images.

5. Update tests
   - Add `specToDrawioXml` tests for explicit canvas and minimum-size expansion.
   - Add `validateSpec` tests for invalid canvas values.
   - Add `validateXml` tests for full-page image rejection and small image allowance.
   - Run the targeted DSL test file before docs changes are treated as complete.

6. Update base workflow and specification docs
   - Update `skills/drawio/references/workflows/replicate.md` with native rebuild, inventory, coordinate mapping, and no full-page image requirements.
   - Update `skills/drawio/references/docs/design-system/specification.md` so `meta.canvas` is documented as active behavior.
   - Keep `skills/drawio/SKILL.md` short and within metadata limits if touched.

7. Update evals and mirrored docs
   - Add or tighten a base eval for native reference rebuild.
   - Update academic evals only if needed to assert inherited base behavior.
   - Update `docs/guide/specification.md` or scientific workflow docs only if they already mirror the edited base docs.

8. Run verification
   - `node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js`
   - `node --test tests/integration.test.js tests/visual-verification-policy.test.js tests/drawio-academic-skill.test.js`
   - `npm test`
   - `just lint`
   - `just ci`

## Risk Points

- `validateXml` currently uses regex-based checks. Keep the full-page image audit narrow and covered by tests.
- Metadata descriptions have a 1024 UTF-8 byte limit. Avoid expanding frontmatter descriptions unless required; run metadata tests if `SKILL.md` frontmatter changes.
- Do not put `.spec.yaml`, `.arch.json`, or inventory sidecars beside final outputs by default.
- Do not weaken exported-artifact-first verification policy.
- Do not move base runtime logic into `drawio-academic-skills`.

## Files Likely To Change

- `skills/drawio/scripts/dsl/spec-to-drawio.js`
- `skills/drawio/scripts/dsl/spec-to-drawio.test.js`
- `skills/drawio/references/workflows/replicate.md`
- `skills/drawio/references/docs/design-system/specification.md`
- `skills/drawio/evals/evals.json`
- Possibly `docs/guide/specification.md`
- Possibly `docs/guide/scientific-workflows.md`
- Possibly `tests/drawio-academic-skill.test.js` only if overlay assertions need tightening

## Success Criteria Before Starting Implementation

- User confirms MVP scope.
- Task remains in planning until approval.
- No unrelated dirty-tree work is touched.
