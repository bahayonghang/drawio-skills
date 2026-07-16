# W4 孤儿资源裁决记录(2026-07-16)

## grep 门(模式:词边界匹配 basename;排除 docs/.vitepress/dist 构建产物与文件自身)

| 文件 | scripts/ tests/ skills/ docs/ 源内命中 | 结论 |
| --- | --- | --- |
| `references/docs/examples.md` | 0(初跑的命中全部是 `yaml-examples.md` 子串误报) | 可删 |
| `references/docs/drawio-aesthetic-guide.md` | 0 | 可删 |
| `references/docs/style-presets.md` | 1 —— `skills/drawio-academic-skills/SKILL.md:110`(style-preset 路由) | 保留 |

## 裁决与依据

1. **`examples.md`(12.5KB)→ 删除,不并入。** 定位是"示例提示词食谱",非操作性契约;开头引用的 `structured-diagram-prompts.md`、`structured-diagram-quality.md`、`ah-to-xml.md` 三个文件已不存在(死链,证明是未随重构维护的遗留);其职能由 `references/examples/*.yaml`(可执行的 YAML 示例)与 docs 站点 examples 页(docs/examples/yaml-examples.md 等)承担。
2. **`drawio-aesthetic-guide.md` → 删除,不并入。** 文件自带 DEPRECATED 横幅,明确声明"新 design system 已以结构化方式实现本指南的最佳实践"并列出替代文档(design-system/README、tokens、themes、shapes、connectors);其余独有内容(View>Grid、右键 Edit Data 等)是 draw.io Desktop 手工操作指南,不属于本 YAML-first skill 的执行面。
3. **`style-presets.md` → 保留。** academic 路由表在用;在 base SKILL.md Style Presets 段补一处提及,消除"仅被 sibling 单向引用"。

## 连带发现

- `references/examples/palettes/README.md` 引用 `scripts/generate-palette-swatches.js` —— 已核验该脚本存在性(见任务执行记录);orphan 修复由 examples README(21 条)+ palettes README 指针 + academic playbook 点名完成。
