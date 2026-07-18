# 方向②专业作图

## Goal

作为方向②的规划 bucket，把上游 raster2drawio、aiicons、shapesearch 与新增图表预设按本仓 canonical spec、YAML-first、offline-first 边界拆成独立、可验证、可回滚的 child。该 bucket 只拥有范围、依赖和能力映射，不直接修改生产代码，也不得直接运行 `task.py start`。

## Confirmed Facts

- 本仓已有 replicate、shape catalog search、network topology 和 swimlane；这些能力优先 `bridge`，不复制实现或 10,446 项 shape index。
- raster2drawio 的真实缺口是“视觉抽取到 canonical spec”，不是另一套 JSON-to-XML renderer。
- 用户已选择完整离线 AI 图标目录；固定 `@lobehub/icons-static-svg@1.91.0` 的 309 个真实 base brand，运行时零网络访问；上游 311 口径中的 2 个 suffix 误分项不进入 canonical catalog。
- SysML/BPMN 需要先做 schema、semantic type 和官方 shape catalog 的差距审计。
- C4 下钻需要 canonical multi-page foundation，不能只新增样式预设。

## Requirements

1. 每个新增能力必须作为独立 child 拥有 `prd.md`、`design.md`、`implement.md`、前置依赖和 focused validation。
2. 现有能力必须标记 `bridge` 并以路由、文档或回归证据验收，不制造重复 runtime。
3. 新增解析或视觉输入必须进入 canonical spec/page bundle，再复用现有 validate、ELK、renderer、sidecar 和 C0 visual-review 管线。
4. base 拥有 runtime、assets、schemas 和共享 references；academic overlay 只追加论文策略。
5. 方向②的 skill 路由、interfaces、跨能力 eval 和 release evidence 统一由最终 integration/promotion child 收口，feature child 不重复改 description。

## Child Map

- **C2.1 P1** `07-18-drawio-ai-icon-catalog`：`replace` 上游 CDN aiicons，生成并加载 309 品牌离线目录；依赖 C0 视觉预览完成代表性渲染验收。
- **待创建** raster/replicate child：`adapt` 视觉抽取为 canonical spec。
- **待创建** SysML/BPMN delta child：先审计，再只补真实表达缺口。
- **待创建** C4 multi-page foundation child：先定义 page bundle、页面链接和 round-trip。

## Acceptance Criteria

- [ ] 每项方向②能力都有唯一的 `bridge`、`adapt`、`replace` 或 `defer` 归属。
- [ ] 所有真正新增能力已拆成独立 child，依赖关系写入 child 工件而不是只靠树位置。
- [ ] 没有重复的 shape index、XML renderer、视觉返工表或 academic runtime。
- [ ] feature child 的证据可由 integration/promotion child 汇总为至少五个 file-backed output cases。
- [ ] 本 bucket 始终保持 planning，不作为生产代码实施目标。

## Out of Scope

- 兼容上游 Python CLI 的命令或中间格式。
- 在本 bucket 中直接实现或启动任何 feature。
- 把详细脚本说明或完整视觉检查表复制进两个 `SKILL.md`。
