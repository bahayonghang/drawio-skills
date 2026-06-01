# 工作流概览

Draw.io Skill 暴露三条核心路线：

- `/drawio create`
- `/drawio edit`
- `/drawio replicate`

三条路线共享同一套 YAML-first 模型、设计系统和校验栈。

## 共同运行规则

1. 默认 **离线优先**
2. draw.io Desktop 可用时走 **桌面增强**
3. 只有明确需要时才启用 **可选 Live MCP**

只要图表可能继续演化，就尽量把这组三件套放在一起：

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

## 路线对比

| 路线 | 主要输入 | 默认输出 | 适用场景 |
|------|----------|----------|----------|
| `create` | 文本、YAML、Mermaid、CSV | 新 `.drawio` bundle | 新建图表 |
| `edit` | 现有 bundle 或 `.drawio` 文件 | 更新后的 bundle | 修改或重构图表 |
| `replicate` | 上传图片或截图 | 重绘后的 `.drawio` bundle | 复刻参考图 |

## `/drawio create`

用于新建图表。

### 输入模式

- 自然语言
- YAML 规格
- Mermaid
- CSV 层级 / 组织结构输入

### Fast path

当请求已经明确图表类型、主题、布局和复杂度时，skill 可以直接生成。

### Full path

当请求具备以下特征时，skill 会先做更谨慎的逻辑整理：

- 含糊
- 稠密
- 学术投稿敏感
- stencil-heavy
- 连线对路由质量敏感

### 自动分支

- **Academic**：启用论文级校验与默认值
- **Math / Formula**：强制只用官方公式分隔符
- **Stencil-heavy**：加载云图标与网络模板规则

详见 [创建图表](./creating-diagrams.md)。

## `/drawio edit`

用于增量修改、导入已有文件、结构重组或主题切换。

### 推荐编辑目标

1. 已有离线 bundle
2. 先把 `.drawio` 导入为 bundle 再编辑
3. 只有明确要求时才用 live browser session

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
6. 生成离线 bundle

### 文字保真

复刻时不仅要保留结构和颜色，还要保留文字位置：

- 标题、说明、图例和公式注释只要位置有意义，就应作为一等文本元素处理；
- 需要精确文本框时，优先使用 `bounds`；
- 连接器标签如果会压线，就使用 `labelOffset` 把它们移到线外；
- 对导出结果至少做一次原图与成图对照，重点检查标题、说明、公式和边标签的位置。

### 颜色模式

| 模式 | 默认 | 效果 |
|------|------|------|
| `preserve-original` | 是 | 通过显式样式覆盖保留源图主配色 |
| `theme-first` | 否 | 让重绘结果优先服从所选主题 |

详见 [复刻图表](./scientific-workflows.md)。

## 共享护栏

### 设计系统

- 6 个内置主题
- 语义节点类型
- 类型化连接器
- 8px 网格默认值

### 校验

- 结构校验
- 布局校验
- 质量校验
- 复刻输出的文字位置校验

### 严格模式

当输出用于论文、评审或正式发布时，使用 `--strict` 或 `--strict-warnings`。

## 下一步

- [创建图表](./creating-diagrams.md)
- [编辑图表](./editing-diagrams.md)
- [复刻图表](./scientific-workflows.md)
- [设计系统](./design-system.md)
- [规格格式](./specification.md)
