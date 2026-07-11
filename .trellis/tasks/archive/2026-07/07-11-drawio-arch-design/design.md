# 技术设计：drawio 架构图设计语言增强

## 总体形态

三层落点，全部在 `skills/drawio` 基座内，零 JS 代码改动：

```
assets/themes/arch-dark.json                    # 新主题（唯一新增"可执行"资产）
references/docs/architecture-diagrams.md        # 架构图授权规范（角色映射 + 布局纪律 + YAML 片段）
references/examples/arch-{web-app,aws-serverless,microservices}.yaml   # 三个移植示例
```

被否决的备选：a) 新建独立技能（用户明确否决）；b) spec→HTML 渲染路由（工程量大、交付形态用户不要）；c) 给转换器新增 `frontend/security` 等节点类型（触碰 JS 词汇表，语义映射文档即可覆盖，违反最小改动）。

## 语义色映射（定稿表）

参考项目七类角色 → 现有节点类型 + `arch-dark` 主题槽位。原 rgba 半透明填充换算为深底上的等效实色（mxGraph 不依赖画布合成透明度，实色更稳）：

| 参考角色 | 映射节点类型 | fillColor | strokeColor | 备注 |
| --- | --- | --- | --- | --- |
| Frontend | `user`（client/actor 语义） | `#0E3A47`（cyan-950 近似） | `#22D3EE` | 文档同时给出 `service`+style 覆盖写法用于"前端服务"矩形 |
| Backend | `service` / `process` | `#064E3B` | `#34D399` | 主力类型 |
| Database | `database` | `#3B2A63`（violet 深底） | `#A78BFA` | 覆盖现 dark 主题的 emerald 惯例 |
| Cloud/AWS | `cloud` | `#4A3410`（amber 深底） | `#FBBF24` | |
| Message Bus | `queue` | `#4A2A12`（orange 深底） | `#FB923C` | |
| External | `terminal` / `document` | `#1E293B` | `#94A3B8` | |
| Security | 无独立类型；以 module 边界 + style 覆盖表达 | `none`/极低填充 | `#FB7185` + `dashed` | 参考项目中 security 主要就是虚线框 |

主题基色：`background #020617`、`surface #0F172A`、`border #1E293B`、`text #F1F5F9`、`textMuted #94A3B8`；connector 默认 `#64748B` 实线 block 箭头（`endFill=1;endSize=12`，符合基座规则 14），auth/安全流 `#FB7185` dashed 作为 `optional`/专用 connector 槽位。字体沿用主题 schema 现有字体族约定（不引入 JetBrains Mono 依赖，避免离线字体缺失）。

## 规范文档 `architecture-diagrams.md` 结构

1. **出处声明**：改编自 architecture-diagram-generator v1.1（MIT, Cocoon AI），链接 + 许可指针。
2. **角色映射表**（上表的文档版，含每行一个最小 YAML 节点片段）。
3. **双行标注**：`label: "API Server"` + 副标签（技术栈/端口）写法——用现有 label 换行或 style 支持，以渲染实测定稿。
4. **边界画法**：region = module + `rounded=1;dashed=1;dashPattern=8 4;strokeColor=#FBBF24;fillColor=none`；安全组 = module + `dashPattern=4 4;strokeColor=#FB7185`；给出嵌套 module 完整 YAML。
5. **布局纪律**：垂直堆叠最小间距（≥40 布局单位）、消息总线节点置于间隙、避免与 `--validate` 重叠告警冲突的经验值。
6. **legend 规则**：用 `text`/小节点组装 legend，必须放在所有 module 边界之外、最低边界下方；给出片段。
7. **生成后自检清单**：配色对应、深底可读、无重叠告警、legend 在界外——与基座 Validation Policy 衔接。

## SKILL.md 接线（最小改动）

- Task Routing 表 `create` 行的 Required references 不加长；改为在 `create.md` workflow 或路由表新增一行 `architecture`：触发条件"系统/软件/服务架构图、微服务、云架构（非拓扑、非论文）"，引用 `architecture-diagrams.md` + design-system README。倾向**新增路由行**（与 `network-topology` 并列，语义清晰）；正文改动 ≤ 若干行。
- **frontmatter description 一字不动**（免探针回归）。Reference Highlights 列表补一行。

## 示例移植策略

三个 HTML 示例逆向为 YAML：读 `ref/.../examples/*.html` 的 SVG 结构提取组件/连线/分组语义（不是像素级复刻），用 `arch-dark` 主题 + `layout` 自动布局优先、必要处 `position` 微调；`meta.source: replicated` 标注来源。验收看语义等价与设计语言一致，不追求逐像素还原。

## 兼容与回滚

- 纯增量：新主题文件 + 新文档 + 新示例 + SKILL.md/themes.md/README 若干行。现有 6 主题、schemas、CLI、测试零改动。
- 回滚 = 删除三处新增文件、还原文档行。无数据/契约迁移。
- 风险表：

| 风险 | 缓解 |
| --- | --- |
| 主题 schema 不支持某些槽位（如 module 虚线默认值） | 规则下沉到文档 YAML 片段（style 覆盖），主题只承载颜色 |
| 双行副标签渲染效果不确定 | 步骤 2 先做单节点渲染 spike，写法以实测定稿 |
| 深底 SVG 在白背景查看器中观感差 | 文档注明 arch-dark 适用场景；SVG 导出含背景色（实测确认） |
| prettier hook 重排 JSON/YAML | 主题 JSON 按仓库现有主题格式化风格书写；如被 hook 干扰按记忆用 Bash 写入 |
