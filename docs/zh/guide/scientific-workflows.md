# 复刻图表 (`/drawio replicate`)

当你要把上传图片、截图或参考图重绘成结构化 draw.io bundle 时，使用 `/drawio replicate`。

## 复刻要解决什么问题

- 比直接截图描边更干净
- 输出可编辑的 YAML-first 产物
- 控制是否保留原图配色
- 在需要时满足论文级导出要求

## 复刻流程

1. 接收上传图片和补充说明
2. 选择领域、主题和颜色模式
3. 提取结构并写成 YAML
4. 在必要时展示逻辑和配色摘要
5. 渲染离线 bundle
6. 通过 `/drawio edit` 做后续微调

## 颜色模式

| 模式 | 默认 | 行为 |
|------|------|------|
| `preserve-original` | 是 | 通过显式样式覆盖保留源图背景和主配色 |
| `theme-first` | 否 | 让重绘结果优先服从所选主题，源图颜色只作为提示 |

复刻后的规格通常应记录：

- `meta.source: replicated`
- `meta.replication.colorMode`
- `meta.replication.background`
- `meta.replication.palette`

## 按领域选择主题

| 领域 | 推荐主题 |
|------|----------|
| 软件架构 | `tech-blue` |
| 商业流程 | `tech-blue` |
| 科研流程 | `academic` |
| 环境 / 生命周期 | `nature` |
| 无障碍评审 | `high-contrast` |
| 演示稿 | `dark` |

## 逻辑确认

当图意存在歧义时，复刻流程应暂停确认。

确认草图至少应包含：

- 纯 ASCII 逻辑图
- 提取到的配色摘要
- 哪些颜色会被显式保留
- 哪些部分会回退到主题 token

## 示例请求

### 尽量保留原图配色

```text
/drawio replicate
颜色模式：preserve-original
[上传图片]
尽量保留暖色节点和深色连线，不要全部归一到 tech-blue
```

### 归一到论文主题

```text
/drawio replicate with academic theme
[上传论文配图]
请按 IEEE 投稿要求重绘，并确保灰度打印可读
```

### 归一到演示主题

```text
/drawio replicate with dark theme
[上传架构截图]
请重绘成适合 keynote 的深色版本
```

## 输出产物

复刻路线也应生成和其他路线一致的三件套：

- `.drawio`
- `.spec.yaml`
- `.arch.json`

可按需额外生成：

- 独立 SVG
- 当 draw.io Desktop 可用时生成 PNG / PDF / JPG

## 故障排除

### 重绘太像截图，没有被整理

切换到 `theme-first`，让结果优先服从品牌或论文主题，而不是死守源图颜色。

### 重绘太泛化，丢掉了原图气质

保持 `preserve-original`，并在渲染前确认提取到的配色摘要。

### 源图太复杂

先拆成几个子图，或者缩小本次复刻范围，再重新生成。

## 下一步

- [工作流概览](./workflows.md)
- [编辑图表](./editing-diagrams.md)
- [设计系统](./design-system.md)
- [规格格式](./specification.md)
