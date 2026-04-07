# 示例

这些示例既可以直接当作 prompt 模板，也可以作为 YAML-first 编写方式的起点。

## 如何使用这些示例

每个示例都有两种使用方式：

- **Prompt-first**：把示例 prompt 粘贴到客户端里，让 skill 自动路由
- **Spec-first**：打开 `skills/drawio/references/examples/` 下对应的 YAML，再通过 CLI 渲染

## 推荐示例类别

- 流程图
- 架构图
- 网络图
- 交互 / 时序风格图
- 学术与数学公式图
- 复刻重绘类图表

## Prompt 示例

### 流程图

```text
/drawio create 生成一个横向 tech-blue 登录流程图，包含校验和错误处理
```

### 架构图

```text
/drawio create 生成一个 tech-blue 微服务架构图，包含 API Gateway、User Service、Order Service、Redis 和 PostgreSQL
```

### 学术图

```text
/drawio create 生成一张 IEEE 风格研究流程图，灰度输出，并包含一个单独的损失函数节点
```

### 复刻图

```text
/drawio replicate
颜色模式：preserve-original
[上传截图]
```

## YAML 示例文件

可以直接复用 `skills/drawio/references/examples/` 中的规格，例如：

- `login-flow.yaml`
- `microservices.yaml`
- `research-pipeline.yaml`
- `ieee-network-paper.yaml`
- `campus-lan-topology.yaml`
- `aws-vpc-topology.yaml`
- `onprem-dmz-topology.yaml`
- `replicated-brand-flow.yaml`

直接渲染其中一个：

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/login-flow.yaml output.drawio --validate --write-sidecars
```

## 下一步

- [流程图](./flowchart.md)
- [架构图](./architecture.md)
- [YAML 示例](./yaml-examples.md)
- [创建图表](/zh/guide/creating-diagrams.md)
