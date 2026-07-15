# Palette core contract: schema, loader, apply, tokens, structured diagnostics

> 父任务：`.trellis/tasks/07-14-palette-system`（需求全集 prd.md、共享技术设计 design.md、调研 research/）。本子任务实现 design.md §3–§8 的核心契约。**依赖：无（三子任务中第一个）。**

## Goal

用 3 组代表性 palette（okabe-ito、ieee-bw、drawio-classic，覆盖三种 entry 形态）打穿 palette 渲染与校验全链路，冻结数据契约供 catalog/integration 子任务消费。

## Requirements

1. **palette 契约**：`references/palette.schema.json`（父 design §3：单一有序 `entries[]`，每项 `base` + 可选 `fill/stroke/text`；元数据含 `colorblindSafe/grayscaleSafe/maxCategories/source/venues`）。
2. **3 组代表数据**：`assets/palettes/okabe-ito.json`（纯 base 派生）、`ieee-bw.json`（灰阶 + roles + 显式 fill/stroke + print gate 目标）、`drawio-classic.json`（全显式对）。HEX 取自父任务 `research/palette-standards-research.md`。
3. **loader**（`scripts/dsl/palette.js`）：内置→用户目录（`~/.drawio-skill/palettes/`，同名用户覆盖 + info 诊断）；手写结构校验（不引入 ajv）；显式 `meta.palette` 未知/损坏/校验不过 → **hard error 列出可用名称**，绝不静默回退（父 design §7）。
4. **物化与 applyPalette**：加载时物化每 entry 为完整 `{base, fill, stroke, text}`（tint 0.85 / 深色 fill=base / 3:1 stroke 兜底 / text 自动反白，父 design §4）；语义映射 roles 优先、否则固定出场顺序；中性 token 不动；**无 `meta.palette` 恒等**。
5. **token + 校验器**：`$paletteN` 及 `-fill/-stroke/-text` 变体；`validateColorScheme(spec, theme, palette)` 签名扩展，palette token 合法化；无 palette 时 `$paletteN` 仍非法（父 design §5）。
6. **结构化诊断**：`{level, code, message}` 端到端契约，`allDiagnostics` 汇聚，strict 仅对 `level !== 'info'` 失败，既有字符串 warning 行为不变（父 design §6）。
7. **校验 gate**（`scripts/dsl/palette-validate.js`）：基于**实际使用 entry 的最终物化 fill**——`PALETTE_GRAYSCALE_PAIR`（两两 <0.20 warning）、`PALETTE_BOUNDARY_CONTRAST`（<3:1 warning）、`PALETTE_MAX_CATEGORIES`、`PALETTE_PRINT_GATE`（strict 下 error）、`PALETTE_CVD_NOTICE`（info）（父 design §8）。
8. `assets/schemas/spec.schema.json` 增加 `meta.palette`。

## Acceptance Criteria

- [ ] 3 组 JSON 过手写结构校验；单测断言关键 HEX 与调研一致（okabe-ito 8 色、classic 8 对、ieee-bw 灰阶 ≥25% 间隔）。
- [ ] `okabe-ito × academic` 渲染单测：类别色来自 Okabe-Ito，字体/线型仍为 academic theme。
- [ ] 回归：无 `meta.palette` 的全量既有渲染测试输出不变。
- [ ] strict：含 `$paletteN` 的 spec 通过；仅 info 诊断 exit 0；`ieee-bw` 显式配置 + `print.target: ieee-single` 无 warning；`grayscaleSafe:false` 假 palette + 同 print 目标 → warning、strict 下 exit 非零。
- [ ] 未知名称 / 损坏 JSON / roles 越界 → hard error 且消息列出可用 palette（单测各一）。
- [ ] 手写校验必填项与 palette.schema.json required 清单一致（防漂移单测）。
- [ ] `cd skills/drawio/scripts && node --test` 全绿；root `npm test` 全绿。

## 约束

- 编辑 `.js` 走 Bash（prettier hook 冲突）；实现细节顺序见 implement.md。
