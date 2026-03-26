# 创建图表 (`/drawio create`)

当你要从文本、YAML、Mermaid 或 CSV 新建图表时，使用 `/drawio create`。

## 快速示例

```text
/drawio create 生成一个横向 tech-blue 登录流程图，共 6 个节点
```

```text
/drawio create 生成一张 academic-color 研究流程图，用于论文，共 8 个节点
```

```text
/drawio create 生成一个带 AWS 图标的云架构图，包含事件总线和两个数据存储
```

## 输入模式

### 自然语言

适合快速画流程图、架构草图和论文示意图。

### YAML 规格

适合需要精确控制、可版本化维护的场景。

### Mermaid

适合你已经拥有 Mermaid flowchart、sequence、class、state、ER 或 gantt 定义。

### CSV

适合层级关系强、接近组织结构图的输入。

无论输入是什么，最终都会先归一化成统一 YAML 规格再渲染。

## Fast Path 与 Full Path

### Fast Path

当请求已经明确以下信息时，skill 可以直接生成：

- 图表类型
- 主题或目标受众
- 布局
- 预期复杂度

Fast path 适合较小图表，通常在 12 个节点以内。

### Full Path

以下情况会触发更谨慎的生成路径：

- 需求含糊
- 图表稠密
- 对论文质量敏感
- stencil-heavy
- 对连线路由质量敏感
- 节点多、分支复杂

## 主题与 Profile 默认值

| 场景 | 默认 profile | 默认主题 |
|------|--------------|----------|
| 常规图表 | `default` | `tech-blue` |
| 学术论文 | `academic-paper` | `academic` |
| 明确要求彩色论文图 | `academic-paper` | `academic-color` |
| 稠密工程评审图 | `engineering-review` | `tech-blue` |

## 特殊分支

### Academic 分支

当提示中出现 `paper`、`IEEE`、`thesis`、`journal`、`research` 等词时触发。

常见附加要求：

- `meta.title`
- 建议填写 `meta.description`
- 使用图标或多种连接器时补 `meta.legend`
- 优先导出 SVG

### Math / Formula 分支

当提示中出现 `formula`、`equation`、`LaTeX`、`AsciiMath`、`MathJax`、`loss function` 等词时触发。

最终输出只允许使用：

- `$$...$$` 表示独立公式
- `\(...\)` 表示行内公式
- `` `...` `` 表示 AsciiMath

不要输出裸 LaTeX、`$...$` 或 `\[...\]`。

### Stencil-heavy 分支

当提示里涉及 AWS、GCP、Azure、Kubernetes、Cisco 或厂商图标时触发。

默认仍然先用语义形状，只有图表确实需要 provider-specific visuals 时再加图标。

## 推荐工作流

1. 尽量在 prompt 中先说清图表类型、主题、布局和复杂度。
2. 让 skill 先归一化成 YAML。
3. 在宣称交付前先做校验。
4. 只要图表后续还会改，就保留 sidecar。

## 校验命令

生成 `.drawio` bundle：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

生成独立 SVG：

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

论文或正式评审建议启用严格模式：

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --strict-warnings
```

## 好用的 Prompt 模式

### 工程图

```text
/drawio create 生成一个横向 tech-blue 微服务架构图，用于 engineering review，包含 10 个节点、事件总线和两个数据库
```

### 学术图

```text
/drawio create 生成一张 IEEE 风格校园网络图，用于论文，灰度输出，包含 core、distribution、access 三层和简短 legend
```

### 带公式图

```text
/drawio create 生成一个模型流水线图，标签包含 "Input: \(x \in \mathbb{R}^d\)"，并单独放一个损失函数节点 "$$\mathcal{L} = -\sum_i y_i \log(\hat{y}_i)$$"
```

## 下一步

- [工作流概览](./workflows.md)
- [复刻图表](./scientific-workflows.md)
- [编辑图表](./editing-diagrams.md)
- [数学公式排版](./math-typesetting.md)
- [规格格式](./specification.md)
