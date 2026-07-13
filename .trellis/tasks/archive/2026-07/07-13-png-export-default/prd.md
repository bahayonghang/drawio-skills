# drawio 默认导出改为仅 300dpi PNG

## Goal

把 `drawio` 与 `drawio-academic-skills` 两个 skill 的**默认交付格式**从标准 SVG 改为 **300dpi PNG**。
不明确要求时不再产出 SVG/PDF；用户**显式**要求时 SVG/PDF/JPG 仍照旧可用。draw.io Desktop 缺失时
回退到 SVG 并告警（保住离线可用性）。

## Background

- 当前默认交付是 `.drawio` + **标准 SVG**（`SKILL.md` L53/84–86）。SVG 之所以是默认，是因为它**纯离线**、
  不依赖 draw.io Desktop；而 PNG/PDF/JPG **必须**经 Desktop CLI（`desktop.js`）。
- CLI 无"默认格式"开关：格式由**输出文件扩展名**决定（`cli.js` L47–51、L319）。所以"改默认"= 改
  **SKILL.md 工作流指令**（让 agent 默认产出 `<name>.png`）+ 补齐 300dpi 与 Desktop 回退能力。
- **300dpi 目前未实现**：`buildDrawioExportArgs`（`desktop.js` L90）不设任何 scale/dpi；academic 清单只是
  *推荐* 300dpi PNG，代码没做。需要新增 scale。
- 用户决策（2026-07-13）：① Desktop 缺失→回退 SVG+告警；② 两个 skill 都改。
- academic 张力：期刊/IEEE 提交常要**矢量**（PDF/EPS，清单 L24）。默认改 PNG 后，必须在 academic 文档里
  **保留并突出**"投稿矢量时显式导出 PDF/SVG"的指引——显式导出仍可用，不删能力。

## Requirements

- **R1 默认 PNG@300dpi**：两个 skill 的 SKILL.md/导出工作流，默认交付由 `.svg` 改为 `.png`（300dpi，经 Desktop）。
- **R2 300dpi 实现**：为 PNG（栅格）导出新增 scale=dpi/96（300→≈3.125），经 `buildDrawioExportArgs` 传给 Desktop CLI；`cli.js` 增 `--dpi <n>`（默认 300）。矢量（svg/pdf）不受 scale 影响。
- **R3 Desktop 缺失回退**：目标为 `.png` 但 Desktop 不可用时，自动改产 `.svg` 并在 stderr 明确告警"未装 Desktop，已回退 SVG"，退出码不视为失败（仍交付产物）。
- **R4 显式格式保留**：用户显式指定 `.svg`/`.pdf`/`.jpg` 仍按原逻辑导出，不被默认覆盖。
- **R5 academic 矢量指引保留**：academic 文档默认 PNG@300dpi，但保留醒目"投稿要矢量→显式导出 PDF/SVG"段落；`academic-export-checklist` 的"bundle 必含 .svg"改为默认 .png，矢量按需。
- **R6 文档同步**：两个 skill 里"默认 SVG / 仅 Desktop 才 PNG"的表述全部改为"默认 PNG@300dpi、SVG 为离线回退/显式选项"。
- **R7 测试**：新增 `buildDrawioExportArgs` scale/dpi 单测；覆盖 Desktop 缺失→SVG 回退路径。

## Constraints

- **外科手术**：只改"默认交付格式 + 300dpi + 回退"这一串。不动箭头/颜色/字体/路由（那是姊妹任务 07-13-open-arrow-default）。
- **JS 改动走 Bash 编辑**（prettier hook 单/双引号冲突）。
- **不删除任何现有导出能力**（svg/pdf/jpg/drawio 全保留）。
- **draw.io Desktop CLI 的确切 scale 旗标需在实现期核对**（`-s`/`--scale`/`--width`，本机无 Desktop 无法预先验证）。

## Out of Scope

- 不改箭头默认（见姊妹任务）。
- 不实现"按目标印刷宽度反算 dpi"（300dpi 统一按 scale=dpi/96 处理）。
- 不移除 diagrams.net URL 回退、live-refinement 等既有路径。

## Acceptance Criteria

- [ ] 默认工作流生成 `<name>.png`（Desktop 可用时），且 PNG 导出带 scale=300/96≈3.125。
- [ ] `cli.js input.yaml out.png --use-desktop`（无 `--dpi`）默认按 300dpi 出图；`--dpi 150` 可覆盖。
- [ ] Desktop 不可用时目标 `.png` → 实产 `out.svg` + stderr 告警，命令不报致命失败。
- [ ] 显式 `out.pdf` / `out.svg` 仍正常导出（能力未丢）。
- [ ] 两个 skill 文档不再宣称"默认 SVG"；academic 保留"投稿显式导出 PDF/SVG"醒目段。
- [ ] `node --test` 通过：新增/调整的 desktop 导出单测 + 现有 cli 相关测试。
