# Implement — 默认箭头 block → open

> JS 文件一律用 **Bash 编辑**（sed / python patch），避免 prettier hook 改双引号破坏单引号风格。
> 每步后跑对应 verify。

## 顺序

1. **代码：连接器主题表**（`spec-to-drawio.js` L89–126）
   - 六个流向类 `endArrow:'block'→'open'`、`endFill:true→false`（primary/data/control/memory_read/memory_write/feedback）。
   - verify：`grep -nE "endArrow: 'block'|endArrow: 'open'" spec-to-drawio.js` 只剩语义/无流向类为 block。

2. **代码：兜底默认 + open 加 endSize**（`spec-to-drawio.js` L1189–1220）
   - L1189–1190：`|| 'block'` → `|| 'open'`；`?? true` → `?? false`。
   - L1211 / L1220：endSize 条件加入 `open`（`=== 'block' || === 'classic' || === 'open'`），end/start 两侧都改。
   - verify：读这几行确认；open 边输出应含 `endSize=12`。

3. **代码：提示串 L3456 + `ah-to-drawio.js` L165–166 + `drawio-to-svg.js` L766**
   - 提示串改中性 open 表述；ah 两条 edgeStyle 改 open/0；svg 兜底 `'classic'→'open'`。

4. **测试同步**（`spec-to-drawio.test.js`）
   - L294–301 主题表副本、L317、L1811–1812 改 open；L2762 fixture 显式传 block 保留断言；L331 视上下文。
   - verify（关键门禁）：
     ```
     cd skills/drawio && node --test scripts/dsl/spec-to-drawio.test.js scripts/dsl/ah-to-drawio.test.js scripts/svg/drawio-to-svg.test.js
     ```
   - 全绿才继续。若 drawio-to-svg.test 因 L766 兜底改动挂了，评估是回退 svg 改动（可选项）还是改测试。

5. **行为验证（端到端，AC 第 1–3 条）**
   - 造最小 spec：一条无类型边 + 一条 primary 边 + 一条显式 `endArrow=block` 边 + 一条 UML 继承边，跑 `spec-to-drawio` 生成 XML。
   - 断言：前两条含 `endArrow=open;endFill=0`；block 边含 `endArrow=block;...endSize=12`；UML 继承仍 `endArrow=block;endFill=0`。
   - 用 scratchpad 临时脚本，不落仓库。

6. **文档同步（drawio）**
   - SKILL.md L96、edge-quality-rules.md L37、connectors.md（3 表）、agent-diagrams.md L43–49、architecture-diagrams.md L104、replicate.md L208/212、CHANGELOG。
   - verify：`grep -rniE "default.*block|block.*default|block head|filled block" skills/drawio/{SKILL.md,references}` 无残留"默认 block"表述（Arrow Types 参考表里保留 block 作为"可选类型"是允许的）。

7. **文档同步（academic）**
   - publication-overlay.md L113、CHANGELOG。
   - verify：同上 grep academic 目录。

8. **记忆 #4 更新**
   - 重写 `drawio-diagram-user-preferences.md` 第 4 条 + description 行；MEMORY.md 索引行如需微调。

## 质量门禁（提交前 2.2）

- [ ] 三个测试文件 `node --test` 全绿。
- [ ] 步骤 5 端到端断言全过。
- [ ] 两 skill grep 无"默认 block"残留。
- [ ] `git diff` 每行可追溯到 R1–R7，无越界改动（颜色/路由/字体未动）。

## Rollback 点

- 每个大步一个逻辑提交；若行为验证失败，`git checkout -- <file>` 单文件回退，不影响其他步骤。
