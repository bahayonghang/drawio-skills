# Implement — 默认导出 SVG → 300dpi PNG

> JS 走 Bash 编辑（prettier hook）。SKILL.md 改的段落与姊妹任务 07-13-open-arrow-default 不同（那个改
> 规则14 连线、本任务改导出段），但**若两任务先后落地，第二个提交前先 `git pull`/rebase 当前分支避免踩踏**。

## 顺序

1. **能力：PNG scale（300dpi）**
   - `desktop.js buildDrawioExportArgs` 加 `scale` 参数，png/jpg 时 push `-s <scale>`；`exportWithDrawioDesktop` 透传。
   - `cli.js` 加 `--dpi <n>`（默认 300）→ scale=dpi/96，传入导出。
   - verify（**先核对旗标**）：本机若有 Desktop，跑 `drawio -x -f png -s 3.125 -o t.png t.drawio` 确认放大生效；
     无 Desktop 则打印 args 断言含 `-s`。
   - 新增 `desktop.test.js`：png+dpi300 → args 含 `-s 3.125`；svg/pdf 不含。
   - `node --test scripts/runtime/desktop.test.js` 绿。

2. **能力：Desktop 缺失回退 SVG**
   - `cli.js` L362–374：捕获"Desktop not found"→ 写 `drawioToSvg(xml)` 到 `<name>.svg`，stderr 告警，exitCode=0。
   - 仅对"未找到 Desktop"回退；其他导出错误仍 exit 1。
   - verify：临时把 `DRAWIO_CMD` 指向不存在路径，跑 `cli.js in.yaml out.png --use-desktop` → 应产出 `out.svg` + 告警、退出 0。

3. **默认切换：drawio SKILL.md + references**
   - 默认交付句 .svg → .png@300dpi；"Desktop 仅用于 PNG/PDF"改为"PNG 为默认，Desktop 必需，缺失回退 SVG"。
   - 自检段：用导出 PNG（缺 Desktop 用回退 SVG）。
   - verify：`grep -niE "deliver .*\.svg|default.*svg|standalone svg" skills/drawio/{SKILL.md,references}` 无"默认 SVG"残留（SVG 作为"回退/显式选项"的描述保留）。

4. **默认切换：academic SKILL.md + 导出清单 + overlay**
   - 默认 PNG@300dpi；**保留醒目**"投稿矢量→显式 PDF/SVG"段；清单"bundle 含 .svg"→默认 .png。
   - verify：grep academic 目录同上；人工确认矢量投稿指引仍在且醒目。

5. **CHANGELOG ×2 + 端到端**
   - 两个 CHANGELOG 各加一条。
   - 端到端（Desktop 可用时）：默认工作流产出 300dpi PNG；显式 `.pdf`/`.svg` 仍出。用 scratchpad 临时文件。

## 质量门禁（提交前）
- [ ] `node --test`（desktop.test.js 及相关）全绿。
- [ ] 回退路径实测：无 Desktop → 出 SVG+告警+exit0。
- [ ] 显式 pdf/svg 仍可导出。
- [ ] 两 skill 无"默认 SVG"残留；academic 矢量出口醒目保留。
- [ ] `git diff` 每行可追溯 R1–R7，未越界改箭头/样式。

## Rollback 点
- 三块（scale / 回退 / 文档默认句）相互独立，可分别 `git checkout -- <file>` 回退。
