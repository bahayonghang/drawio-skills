# 工作流概览

Draw.io Skill 暴露三条 Base 路线和一个 Academic Overlay 策略层：

- `/drawio create`
- `/drawio edit`
- `/drawio replicate`
- `/drawio-academic-skills` 用于上述路线的出版场景变体

所有路线共享同一套 YAML-first 模型、设计系统、Base CLI 和校验栈。

## 共同运行规则

1. 默认 **Offline Authoring Path**
2. draw.io Desktop 可用时走 **Desktop-Enhanced Export**
3. 只有明确需要 Base Skill 浏览器精修时才启用 **Live Refinement Backend**
4. **Direct XML Exception** 只用于很小的 XML handoff 或精确 mxGraph 控制

最终交付目录默认只放：

- `<name>.drawio`

`.spec.yaml` 和 `.arch.json` 这类 sidecars 默认放在 `.drawio-tmp/<name>/` 这样的项目工作目录；只有用户明确要求 sidecar bundle 时才放到输出旁边。Academic Overlay 默认还会把 `<name>.svg` 加入出版最终交付集。

## 路线对比

| 路线 | 主要输入 | 默认输出 | 适用场景 |
| --- | --- | --- | --- |
| `create` | 文本、YAML、Mermaid、CSV | 新 `.drawio` + 工作目录 sidecars | 新建通用图表 |
| `edit` | 现有 bundle 或 `.drawio` 文件 | 更新后的 `.drawio` + 工作目录 sidecars | 修改或重构图表 |
| `replicate` | 上传图片或截图 | 重绘后的 `.drawio` + 工作目录 sidecars | 复刻参考图 |
| `academic overlay` | paper/thesis/manuscript prompt | 最终 `.drawio + .svg`，sidecars 在工作目录 | 出版级图表 |

## `/drawio create`

用于新建通用图表。

### 输入模式

- 自然语言
- YAML 规格
- Mermaid
- CSV 层级 / 组织结构输入
- 配合 `--input-format drawio` 导入已有 `.drawio`

### Fast path

当请求已经明确图表类型、主题、布局和复杂度时，skill 可以直接生成。

### Full path

当请求具备以下特征时，skill 会先做更谨慎的逻辑整理：

- 含糊
- 稠密
- stencil-heavy
- 连线对路由质量敏感
- 复刻或重大编辑

### 自动分支

- **Math / Formula**：强制只用官方公式分隔符
- **Stencil-heavy**：加载云图标与网络模板规则
- **Edge audit**：加载路由与标签间距规则
- **Academic trigger**：需要出版策略时使用 sibling Academic Overlay

详见 [创建图表](./creating-diagrams.md)。

## Academic Overlay

当请求涉及 paper、thesis、IEEE、journal、manuscript、publication-ready、A4/Word/LaTeX 或学术公式图时，使用 `drawio-academic-skills`。

Overlay 会执行 academic preflight：

- venue 或 audience
- `figureType`：`architecture`、`roadmap` 或 `workflow`
- 黑白 / 灰度安全 / 彩色策略
- caption、title、legend 需求
- 公式与文字位置保真
- 请求的导出格式和 Desktop 可用性

之后它通过 sibling `../drawio/scripts/cli.js` 执行。它不使用 MCP/live backend。

## `/drawio edit`

用于增量修改、导入已有文件、结构重组或主题切换。

### 推荐编辑目标

1. 已有离线 bundle
2. 先把 `.drawio` 导入为 bundle 再编辑
3. 只有明确要求 Base Skill 精修时才用 live browser session

### 常见编辑类型

- 重命名标签
- 增删节点与边
- 切换主题
- 修改语义类型
- 重组模块
- 用网格安全位置移动元素

详见 [编辑图表](./editing-diagrams.md)。

## `/drawio replicate`

用于把上传图片重绘为结构化规格。

### 核心步骤

1. 分析图表结构
2. 提取源图调色板
3. 对标签、标题、公式和边标签执行文字位置抽取
4. 构造 YAML 规格
5. 必要时展示逻辑、配色和文字位置摘要
6. 生成最终产物和工作目录 sidecars

### 文字保真

复刻时不仅要保留结构和颜色，还要保留文字位置：

- 标题、说明、图例和公式注释只要位置有意义，就应作为一等文本元素处理；
- 需要精确文本框时，优先使用 `bounds`；
- 连接器标签如果会压线，就使用 `labelOffset` 把它们移到线外；
- 对导出结果至少做一次原图与成图对照，重点检查标题、说明、公式和边标签的位置。

### 颜色模式

| 模式 | 默认 | 效果 |
| --- | --- | --- |
| `preserve-original` | 是 | 通过显式样式覆盖保留源图主配色 |
| `theme-first` | 否 | 让重绘结果优先服从所选主题 |

详见 [复刻图表](./scientific-workflows.md)。

## 共享护栏

### 设计系统

- 6 个内置主题
- `skills/drawio/styles/built-in/` 下的共享 style presets
- 语义节点类型
- 类型化连接器
- 8px 网格默认值

### 校验

- 结构校验
- 布局校验
- 质量校验
- 公式分隔符校验
- 复刻输出的文字位置校验

### 严格模式

当输出用于论文、评审或正式发布时，使用 `--strict` 或 `--strict-warnings`。

## 下一步

- [创建图表](./creating-diagrams.md)
- [编辑图表](./editing-diagrams.md)
- [复刻图表](./scientific-workflows.md)
- [设计系统](./design-system.md)
- [规格格式](./specification.md)
