# 连接线与边质量

Typed connector 表达语义，使主题可以改变外观而不改变图表模型。

## 连接类型

| 类型 | 含义 |
|---|---|
| `primary` | 主要请求或流程 |
| `data` | 数据或次要异步流 |
| `optional` | 可选、鉴权或弱关系 |
| `dependency` | 基础设施或 UML 依赖 |
| `bidirectional` | 相互关系 |
| `control` | Agent 或系统控制信号 |
| `memory_read` | 从记忆或存储读取 |
| `memory_write` | 写入记忆或存储 |
| `async` | 非阻塞工作 |
| `feedback` | 迭代返回或推理回路 |

```yaml
edges:
  - from: agent
    to: tool
    type: control
    label: invoke
  - from: tool
    to: agent
    type: feedback
    label: result
```

## 必须遵守的几何规则

- 每条连接线都绑定 source 与 target 节点 id。
- Source face 与 target face 存在重叠区间时，优先使用共线直线。
- 同一 face 上的多条边应分散，不能把箭头压在角点。
- 平行 corridor 间距以及进入 target 的末段至少为 30 个布局单位。
- 只有确实需要弯折时才使用 waypoint；waypoint 不能与手工 exit/entry hint 混用。
- 标签偏移应覆盖一半可见尺寸再加间距，不能用背景色遮住线条。

默认流程箭头为 open head，并使用 `endSize=12`。填充 block/classic 箭头和 UML/ER marker 仍是显式语义选择。

## 校验

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --strict
```

出版图、密集连接和可复用参考图应使用严格校验。交付前应解决 node crossing、可避免弯折、floating edge、arrow-shape 替代物、label collision、重复 waypoint 和文本裁切。

## 相关内容

- [架构图](./architecture-diagrams.md)
- [Agent 与记忆图](./agent-diagrams.md)
- [导出与产物](./export.md)
