# Design — 默认导出 SVG → 300dpi PNG

## 关键认知

CLI 没有"默认格式"变量——格式由**输出扩展名**决定，"默认"实际写在 **SKILL.md 工作流指令**里
（让 agent 产出 `<name>.svg`）。因此本任务 = 三件事：
1. **能力补齐**（代码）：PNG 加 300dpi scale；Desktop 缺失回退 SVG。
2. **默认切换**（文档）：两个 skill 的 SKILL.md/导出文档把默认交付从 SVG 改成 PNG@300dpi。
3. **保留出口**：显式 SVG/PDF/JPG 不变；academic 矢量投稿指引保留。

## 改动点（代码，skills/drawio/scripts）

### 1. `runtime/desktop.js` — `buildDrawioExportArgs`（L90–103）

新增可选 `scale`（或 `dpi`）参数；仅栅格（png/jpg）追加缩放旗标：
```
buildDrawioExportArgs({ inputFile, outputFile, format, embedDiagram, border, scale })
// 当 format∈{png,jpg,jpeg} 且 scale>1 时 push ['-s', String(scale)]
```
- ⚠️ **实现期核对**：draw.io Desktop CLI 缩放旗标确切名（大概率 `-s/--scale`；备选 `--width`）。
  本机无 Desktop，需在实现时用真实 Desktop 验证一次导出分辨率。
- `exportWithDrawioDesktop`（L105）透传 `scale` 到 `buildDrawioExportArgs`。

### 2. `cli.js`

- **解析 `--dpi <n>`**：加入 `flagsWithValues`；默认 300（PNG 场景）。scale = dpi/96。
- **传 scale**：调 `exportWithDrawioDesktop` 时（L364）带上 `scale`（仅 png/jpg 生效）。
- **Desktop 缺失回退**（L362–374 catch）：目标为 `.png/.jpg/.pdf` 但 Desktop 不可用（`exportWithDrawioDesktop`
  抛"CLI not found"）时，**改走 SVG 分支**：用 `drawioToSvg(xml)` 写 `<name>.svg`，stderr 告警
  "draw.io Desktop 未找到，已回退 SVG（如需 PNG 请安装 Desktop 或设 DRAWIO_CMD）"，`exitCode=0`。
  - 仅对"Desktop not found"类错误回退；真正的导出失败仍报错。
  - PDF 无 SVG 等价时同样回退 SVG（矢量对矢量，够用）。

### 3. `runtime/artifacts.js` — 视需要

`EXPORT_EXTENSIONS`/`deriveArtifactPaths` 逻辑基本不变；仅在回退时复用 svg 路径推导。确认无需改。

## 改动点（文档）

### drawio skill（`skills/drawio`）
- `SKILL.md`：L53/54（交付表）、L84–86（默认交付 .drawio+.svg → .drawio+.png@300dpi；Desktop 缺失回退 SVG）、
  L94、L105、L134、L136–146（Desktop/Export 段：PNG 成为默认而非"可选"）、L169、L179–181（自检用导出 PNG，缺 Desktop 用回退 SVG）。
- `references/docs/*`：凡"默认 SVG / 仅 Desktop 才 PNG"表述改为"默认 PNG@300dpi"。
- `CHANGELOG.md`：追加一条。

### academic skill（`skills/drawio-academic-skills`）
- `SKILL.md`：默认交付改 PNG@300dpi。
- `references/docs/academic-export-checklist.md`：L10「bundle 含 .svg」→ 默认 .png@300dpi；**新增/保留醒目段**：
  "期刊/IEEE 矢量投稿：显式 `output.pdf --use-desktop`（或 .svg）"；L22–24 矢量指引上移强调。
- `references/docs/publication-overlay.md`：导出相关表述同步。
- `CHANGELOG.md`：追加一条。

## 改动点（测试）
- 新增 `scripts/runtime/desktop.test.js`：`buildDrawioExportArgs` 在 png+scale 时含 `-s 3.125`；svg/pdf 不含 scale。
- 覆盖回退：可对 `exportWithDrawioDesktop` 注入"找不到 Desktop"→断言 cli 走 SVG（或抽出可测的回退函数）。
  - 若 cli.js 端到端难测，至少抽 `resolveExportPlan(ext, useDesktop, desktopAvailable)` 纯函数做单测。

## 与姊妹任务的边界
- 本任务**只碰导出管线**（desktop.js / cli.js / 导出文档 / 导出测试）。
- 箭头默认（spec-to-drawio.js / connectors 文档 / spec-to-drawio.test.js）属 `07-13-open-arrow-default`。
- 两者无共享改动文件（除各自在 SKILL.md 改不同段落——注意提交时别互相踩，见 implement.md）。

## Tradeoffs / Rollback
- **PNG 默认牺牲纯离线**：默认路径现依赖 Desktop；已用"回退 SVG+告警"兜底。
- **academic 矢量**：默认 PNG 与期刊矢量需求相悖，靠"显式 PDF/SVG"出口 + 文档醒目段化解。
- **Rollback**：文档默认句 + cli `--dpi`/回退 + desktop scale 三处独立，可分别 revert；无数据迁移。
