# 多页 Canonical Bundle（`/drawio multi-page`）

Canonical bundle v1 以稳定的 page 与 object 身份和结构化 page link 来编写、导入、校验和变换多页 `.drawio` 文档。旧版单页 YAML 保留其现有的无版本 parser、renderer 与 arch v1 路径——绝不会被改写为 bundle。

## Bundle v1 结构

bundle 输入包含 `schemaVersion: 1`、文档 `meta`、有序 `pages` 数组与有序结构化 `links`。page 顺序与 object 数组顺序是权威的。

- page ID 与 object ID 是安全 ASCII 身份（`^[A-Za-z][A-Za-z0-9_-]*$`，最长 128）；page name 是非空 Unicode 展示 label（最长 256，无控制字符）。
- object 身份是 `(pageId, objectId)`。node、module、edge ID 在一个 page 内共享一个命名空间，且 ID 可以跨 page 重复。多页 edge 必须有 ID。
- link 恰好包含 `from` 与 `to` 两个端点，每个带 `pageId` 与 `objectId`，且只解析到 node 或 module。一个源最多一条 link；不接受原始 URI 回退。渲染后的 page link 为 `data:page/id,<targetPageId>`。

## CLI

```bash
# 把整个 bundle 渲染为多页 .drawio
node skills/drawio/scripts/cli.js bundle.yaml bundle.drawio --validate

# 把单页渲染为二进制导出（需 --page）
node skills/drawio/scripts/cli.js bundle.yaml page.png --page context --use-desktop

# 把 .drawio 的每一页导入为 canonical bundle v1
node skills/drawio/scripts/cli.js existing.drawio bundle.spec.yaml --input-format drawio --all-pages --export-spec
```

`--all-pages` 是显式的，且与 `--page` 互斥。默认 draw.io 导入仍是首页扁平；从 bundle 做二进制输出需要 `--page`。多页 sidecar 是一个确定性 bundle `.spec.yaml` 加一个 arch v2 `.arch.json`——没有时间戳、绝对路径或逐页 sidecar 扩散。

## 渲染与往返

多页渲染对每一页执行布局、渲染与 XML 校验，再把有序 XML 页面包进单个 `<mxfile>`。canonical `UserObject` 元数据在导入时恢复 page/object 身份，因此 `--all-pages` 导出后再导入，在归一化的 page、object、link 数据上比较相等。没有 canonical wrapper 的第三方页面会以确定性 `page-N` 与 cell 派生 ID 导入，再通过常规文档校验。

## 错误

| 条件                             | 结果                                         |
| -------------------------------- | -------------------------------------------- |
| 缺失/不安全/重复的 page ID       | `MULTI_PAGE_INVALID`，位于 `pages[index].id` |
| 缺失/不安全/重复的同页 object ID | `MULTI_PAGE_INVALID`，位于 page/object 路径  |
| 缺失 edge ID 或悬空 edge 端点    | `MULTI_PAGE_INVALID`，位于 edge 路径         |
| 缺失/类型错误/重复的 link 端点   | `MULTI_PAGE_INVALID`，位于 link 路径         |
| 重复的 page-name 选择器          | 歧义 `--page` 错误，列出候选 ID              |
| 未知选择器或越界索引             | 明确 `--page` 错误，给出可用 ID/索引范围     |
| 某页 XML 非法                    | 页级校验错误；其他页 root ID 不冲突          |

## 证据边界

文档、renderer/导入、artifact/CLI 测试属于命令证据。Desktop、browser、MCP、网络与视觉模型运行在未执行时单独报告为 `missing evidence`。

## 相关内容

- [Postprocess 套件](./postprocess.md)
- [上游能力映射](/zh/api/upstream-capability-map.md)
- [CLI 参考](./cli.md)
