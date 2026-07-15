# Implement — palette-core

> 技术设计见父任务 design.md（v2）§3–§8；HEX 见父任务 research/。`.js` 编辑一律走 Bash。

## Step 1 — 契约与数据

- [ ] `skills/drawio/references/palette.schema.json`（entries[] 模型）。
- [ ] `assets/palettes/`：okabe-ito.json、ieee-bw.json、drawio-classic.json。
- 验证：schema 与数据互检的单测（结构校验函数在 Step 2，先写测试骨架亦可）。

## Step 2 — palette.js（loader + 物化 + applyPalette）

- [ ] 手写结构校验（required/类型/HEX/entries≤16/roles 索引界内）。
- [ ] loadPalette：内置→用户目录、防穿越、显式引用 hard error 契约。
- [ ] 物化派生（tint/深色/3:1 兜底/text 反白）+ roles/出场顺序映射 + usage 记录。
- [ ] 无 palette 恒等路径。
- 验证：`node --test` 新增 palette 单测文件；恒等回归。

## Step 3 — token + validateColorScheme + 结构化诊断

- [ ] `resolveThemeColor` 支持 `$paletteN(-fill|-stroke|-text)`，越界 warning 回退 primary。
- [ ] `validateColorScheme(spec, theme, palette)` 签名扩展 + token 合法化。
- [ ] 汇聚层 `allDiagnostics`：`{level, code, message}`；legacy 字符串包装 warning；strict 仅 `level !== 'info'` 失败；returnWarnings 透传真实 level；CLI 打印区分 info。
- 验证：strict + `$paletteN` 通过；strict + 仅 info exit 0；既有 warning 行为回归。

## Step 4 — palette-validate.js（gate）

- [ ] WCAG relative luminance 纯函数。
- [ ] 五项检查（GRAYSCALE_PAIR 两两 / BOUNDARY_CONTRAST / MAX_CATEGORIES / PRINT_GATE strict-error / CVD_NOTICE info），基于 usage 的最终物化 fill。
- [ ] 挂入 `--validate` 诊断通道。
- 验证：prd 验收里的 strict/print 组合单测 + fixture CLI 跑通。

## Step 5 — 收尾

- [ ] `spec.schema.json` 增 `meta.palette`。
- [ ] `cd skills/drawio/scripts && node --test` 全绿；root `npm test` 全绿。
- [ ] 冻结契约声明：entries 物化形态 + usage 接口写入本任务 wrap-up，供 catalog/integration 消费。

**回滚点**：整个子任务为纯新增 + spec-to-drawio.js 三处小改（loadPalette 串接、validateColorScheme 签名、诊断汇聚），可单独 revert。
