# 图标与 Stencil 搜索

默认使用语义形状。只有厂商身份或标准设备符号确实能提高理解时，才使用 provider 或 device stencil。

## 先搜索，再写 YAML

Bundled catalog 完全离线，不需要 MCP 或网络连接。

```bash
node skills/drawio/scripts/cli.js search pod --prefix kubernetes
node skills/drawio/scripts/cli.js search "s3, lambda, nat gateway"
node skills/drawio/scripts/cli.js search virtual-machine --prefix mscae --limit 5
node skills/drawio/scripts/cli.js search firewall --json
```

结果会显示真实 Draw.io 名称，并在可用时给出 `k8s.pod` 之类的正确 YAML alias。

| 选项 | 用途 |
|---|---|
| `--prefix <library>` | 只搜索一个图形库 |
| `--limit <n>` | 限制结果数量 |
| `--json` | 输出机器可读结果 |

## Bundled 覆盖范围

| 图形库 | 覆盖范围 |
|---|---|
| `aws4` | 599 个平铺 stencil 和 132 个 product-icon 参数 |
| `gcp2` | 110 个上游 stencil |
| `azure` | 87 个上游 stencil |
| `mscae` | 148 个 Azure 补充 stencil |
| `kubernetes` | 39 个 `icon2` 参数，包括 `k8s.pod` |
| `cisco` / `cisco19` | 291 个平铺 stencil 和 149 个参数化条目 |
| `networks` | 58 个网络 stencil |

其他 raw `mxgraph.*` 图形库保持 pass-through，不能宣称它们受 catalog 完整覆盖。

## 选择正确的形状来源

普通流程图、UML、ER、组织结构图、思维导图、时间线以及只使用基础几何形状的学术图，不需要搜索。

云架构、Kubernetes、Cisco 或机架拓扑、厂商密集型平台、电气/电路图，以及要求精确符号身份的图应先搜索。

目标图形库未覆盖时，按以下顺序回退：

1. `aws.*`、`azure.*`、`gcp.*`、`k8s.*` 等已知 provider mapping
2. bundled `lobe.*` 或 `ai.*` AI provider icon
3. 支持的 `brand.*` 产品 logo
4. 精选 `lucide.*` 语义图标
5. 语义形状

不能编造 raw stencil 名称。Covered library 中的未知名称会导致转换失败并给出建议；应修正名称或重新搜索。`--allow-unknown-shapes` 只适合作为已知 legacy stencil 的临时兼容开关。

## 相关内容

- [架构图](./architecture-diagrams.md)
- [CLI 参考](./cli.md)
- [设计系统](./design-system.md)
