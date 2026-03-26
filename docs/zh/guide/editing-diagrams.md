# 编辑图表 (`/drawio edit`)

当你要做增量修改、切换主题、重构结构，或导入已有 `.drawio` 文件时，使用 `/drawio edit`。

## 推荐编辑模式

### 已有离线 bundle

这是首选路径，特别适合 skill 自己创建过的图。

- 读取 `.spec.yaml`
- 修改规格
- 重新生成 `.drawio`
- 刷新 `.arch.json`

### 只有 `.drawio`，没有 sidecar

先导入：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

然后编辑导出的规格，再重新渲染。

### Live browser session

只有在已经配置好可选 MCP，且用户明确要求浏览器内精调时才使用。

关键规则：

- `edit_diagram` 之前必须先 `get_diagram`

## 常见编辑操作

### 改标签

```text
/drawio edit 把 User Service 改成 Auth Service
```

### 加元素

```text
/drawio edit 在 API Gateway 和 User Service 之间加一个 Redis Cache 节点，并用 data-flow 箭头连接
```

### 改语义类型

```text
/drawio edit 把 Event Store 节点从 service 改成 database
```

### 切主题

```text
/drawio edit 把这张图切成 high-contrast，用于无障碍评审
```

### 重组模块

```text
/drawio edit 用 academic 主题把这张图重组为 input、processing、output 三个模块
```

只要结构变化可能影响语义，就应该在真正改动前先展示逻辑草图并等待确认。

## 主题与样式规则

- 新节点继承当前主题
- 新边继承当前连接器风格
- 修改语义类型会同步更新形状
- 切主题会重新应用基于 theme token 的样式
- 显式颜色覆盖仍保持显式

## 离线编辑命令

重新生成 `.drawio` bundle：

```bash
node skills/drawio/scripts/cli.js my-diagram.spec.yaml my-diagram.drawio --validate --write-sidecars
```

重新生成严格校验的 SVG 评审产物：

```bash
node skills/drawio/scripts/cli.js my-diagram.spec.yaml my-diagram.svg --validate --write-sidecars --strict-warnings
```

## Live MCP 编辑流程

只有在确实需要浏览器会话时才走这条链路：

1. `start_session`
2. `create_new_diagram` 或加载当前图
3. `get_diagram`
4. `edit_diagram`
5. `export_diagram`

这条链路是可选的；默认编辑模型仍然是离线 sidecar。

## 故障排除

### 编辑后样式变乱

- 检查是否加了显式样式覆盖
- 如果想恢复 token 驱动的一致性，重新应用主题

### 标签或 ID 对不上

- 先检查当前 `.spec.yaml`
- 若使用 live MCP，先用 `get_diagram` 拉最新 XML

### 编辑范围太大

- 把请求升级为 restructure
- 先确认新的逻辑图，再正式渲染

## 下一步

- [工作流概览](./workflows.md)
- [复刻图表](./scientific-workflows.md)
- [导出与保存](./export.md)
- [可选 MCP 工具](/zh/api/mcp-tools.md)
