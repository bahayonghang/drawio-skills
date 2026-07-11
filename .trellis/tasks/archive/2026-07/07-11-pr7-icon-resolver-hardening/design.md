# 设计：PR #7 图标解析加固

## Boundary

`skills/drawio/scripts/dsl/icon-resolver.js` 继续作为非 draw.io stencil 图标的唯一解析入口。它只接收字符串名称并返回完整 image style 或 `null`，不执行文件系统查找、包解析或网络访问。

## Icon Contract

```text
resolveImageIconStyle(icon: unknown) -> string | null
```

- 已知名称：返回 `shape=image;...;image=data:image/svg+xml,...`。
- 未知或非法名称：返回 `null`。
- 调用方 `resolveIconShape()` / `validateShapeReferences()` 保持既有流程；未知前缀最终作为 unknown shape 产生告警。
- `LOBE_PATHS`、`LUCIDE_PATHS`、`BRAND_SVGS` 是实现与测试共享的唯一运行时支持集；文档只列出该集合中的名称与 alias。

## Dependency Decision

移除 `lucide-static`。该包解压后约 45 MB / 5513 文件，而且位于仓库根级，无法随只复制 `skills/drawio` 的安装形态可靠分发。为满足 offline-first 与可复制边界，本次使用小型内嵌 SVG path 白名单，并补齐已经公开承诺的 `server-cog`、`alarm-clock`。

未来若要扩展完整图标集，应另立任务评估构建期生成的紧凑资产，不得重新引入运行时根依赖或默认 CDN。

## Lobe Validation

`lobeIconStyle()` 在 slug 规范化后必须命中 `LOBE_PATHS`；未命中直接返回 `null`。不再构造 unpkg URL。这样成功结果全部可离线重开，失败结果能进入统一 shape-reference 告警。

## Desktop Paths

将 helper 收敛为可变参数：

```js
resolveForPlatform(platform, ...parts)
```

Windows 使用 `win32.resolve(...parts)`，其他平台使用 `resolve(...parts)`；显式 `DRAWIO_CMD` 与默认安装目录共用同一语义。

## CI Baseline

`industrial-architecture-cn-paper.yaml` 与 `55a9f07` 的字体系统和白名单改动同日完成，但顶层 `examples/` ignore 规则阻止它进入提交。文件内容已经存在且与测试意图一致，因此通过 `git add -f` 恢复为 tracked fixture，保留精确白名单测试。用户并行新增的 `.gitignore` 规则不属于本任务，不随修复提交。

## Attribution

在 skill-owned assets 下放置 Lobe Icons MIT 与 Lucide ISC/MIT 许可证/来源声明，使硬编码 path 数据与安装产物一起分发。

## Rollback

图标加固可通过恢复 PR #7 的 `icon-resolver.js`、依赖和文档回滚；Desktop helper 与 academic fixture 期望是独立文件，可分别回滚。任何回滚都必须重新运行 `just ci`。
