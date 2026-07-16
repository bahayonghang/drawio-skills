# W5 前置:policy-assertion → SKILL.md 章节映射(2026-07-16)

来源:逐行审阅 `tests/skill-metadata.test.js`、`tests/drawio-academic-skill.test.js`、`tests/palette-skill-policy.test.js`、`tests/visual-verification-policy.test.js`(读取 SKILL.md 的全部四个测试)。`academic-templates-strict` / `integration` / `security` / `no-visio` 不读 SKILL.md,W5 不涉及其目标文件。

图例:处置 K=原样保留短语;S=结构保留(标题/空行布局);N=反向断言(不得出现);P=邻近窗口(短语间距离受限)。

## base `skills/drawio/SKILL.md`

| 断言(正则要点) | 现所在章节 | 处置 |
| --- | --- | --- |
| frontmatter `version` == package.json | frontmatter | K(frontmatter 整体冻结) |
| description ≤1024 字符/字节 | frontmatter | K(冻结) |
| `AskUserQuestion` 与 palette/colorblind/grayscale/black-and-white/multi-category 在 **500 字符内** | Palette Selection ¶2 | K+P:压缩该段时两词距离 <500 |
| `(already\|explicitly\|specified)` 与 `(do not ask\|skip)` 在 **250 字符内** | Palette Selection ¶2 末句 | K+P |
| `replicat` … `(preserve\|source palette)`(500 内)… `(do not ask\|skip)`(再 300 内) | Palette Selection ¶3 | K+P |
| `Perform visual self-checks on exported artifacts first` | 规则 4 | K 逐字 |
| `Do not create browser or Playwright screenshots when a CLI/Desktop export exists` | 规则 4 | K 逐字 |
| `inspect the exported PNG (or the fallback SVG when Desktop is unavailable) first`(i) | Validation Policy | K 逐字 |
| `` deliver `<name>.drawio` and a 300dpi `<name>.png` `` | 规则 2 | K 逐字 |
| `` `.drawio-tmp/<name>/` `` | 规则 2 | K |
| `--sidecar-dir .drawio-tmp/output` | Create Flow 典型命令 | K ≥1 处 |
| ``Do not create or modify scratch JS scripts under a user's project-local `.agents/skills/drawio` `` | 规则 11 | K 逐字 |

## academic `skills/drawio-academic-skills/SKILL.md`

| 断言 | 现所在章节 | 处置 |
| --- | --- | --- |
| `^name: drawio-academic-skills$` / version / description 限长 | frontmatter | K(冻结) |
| `../drawio/scripts/cli.js`、`../drawio/assets/themes/`、`../drawio/styles/built-in/` | Required Sibling Base 表 | K(表可压,路径字面量保留) |
| `` Never create, require, or route through `.mcp.json` `` | Non-Negotiable Contract | K 逐字 |
| **不得出现 `mcp-tools.md`** | 全文 | N:W5 严禁引入 |
| `## Source Understanding`、`## Diagram Plan Gate`、`## Optional Image Preview` | 三个 H2 标题 | K:标题不可改名/降级 |
| `external image-generation previews as optional concept previews only` | Non-Negotiable Contract | K 逐字 |
| `venue` 与 `AskUserQuestion` 在 500 字符内 | Palette Preflight | K+P |
| `(Recommended)`、`meta.palette`、safety/colorblind/grayscale | Palette Preflight / Academic Defaults | K |
| `completion report` 与 `palette` 在 **200 字符内**(i) | Completion Report 列表 | K+P |
| `Do not substitute browser or Playwright screenshots when an exported artifact exists` | Non-Negotiable Contract | K 逐字 |
| `default academic final deliverables` | Academic Defaults 句 | K 逐字 |
| `` `.drawio-tmp/<name>/` `` | Non-Negotiable Contract | K |
| `--sidecar-dir .drawio-tmp/figure` | Create Flow / Export Policy 命令 | K ≥1 处 |
| scratch JS 逐字短语(同 base) | Non-Negotiable Contract | K 逐字 |
| `Default deliverables:` + 空行 + 列表 + 空行 + `Intermediate work directory:`;且列表内**不得出现** `<name>.spec.yaml` / `<name>.arch.json` | Academic Defaults | S+N:块结构逐字保持 |

## 结构性红线(非 SKILL.md 但受本任务其他工作流影响)

- academic `references/` 是**精确白名单**(deepEqual,恰好 13 个文件):W4/W5/W6 不得在 academic references/ 下新增或删除任何文件;只能编辑既有文件内容。
- overlay 文件不得与 base 任何文件字节相同(sha256 对比)。
- `academic-figure-playbook.md` 必须含 `ieee-bw`、`ieee-color`、`okabe-ito`、`tol-high-contrast`、`journal-npg`、`c4-blue`、`cloud-aws`;`publication-overlay.md` 必须含 `PALETTE_PRINT_GATE`、`strict…(ieee-bw|tol-high-contrast)`、`## Research Evidence Chain`、`## Optional Image Preview`、`Ask before sending unpublished papers`、`adjust the YAML spec and rerender once`(W4 playbook 编辑只增不删,已满足)。
- 两份 skill CHANGELOG 的 `## 2.7.0 (2026-07-14)` 段与 500 字符内的 `palette` 字样不可动(W6 只在 Unreleased 段追加)。
- `docs/guide/export.md`、`references/workflows/create.md`、`replicate.md` 各有逐字短语断言;W5 不触碰这三个文件。

## W5 执行结论

瘦身手法(细则下沉/高亮列表收敛/表格压缩)与上述 K/S/N/P 约束不冲突:被断言短语全部位于"契约句"层,W5 只删/移它们**周围的解释性正文**,不动短语本身与标题结构。每轮编辑后跑 `npm test` 即时验证。
